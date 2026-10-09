import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import {
  ApprovalStatus,
  INITIAL_MANAGER_PASSWORD,
  INITIAL_STAFF_RECORDS,
  MANAGER_EMAIL,
  StaffMemberRecord
} from '../data/hotelLoyaltyData';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    firebaseAppletConfig.firestoreDatabaseId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const WORKSPACE_ID = 'aurelia-office';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on boot as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface FirestoreStaffDoc {
  id: string;
  staffLoginId: string;
  staffName: string;
  role: string;
  avatarColor: string;
  monthlyGoal: number;
  dailyGoal: number;
  workspaceId: string;
}

export interface FirestoreRewardEntryDoc {
  entryId: string;
  staffId: string;
  reservationNumber: string;
  rewardsNumber: string;
  dateIso: string;
  timestamp: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  workspaceId: string;
}

export interface FirestoreOfficeConfigDoc {
  workspaceId: string;
  managerPassword: string;
  initialized: boolean;
}

// Seed the initial 11 staff members (with 0 entries) and default manager password if not initialized yet
export async function ensureOfficeSeeded(): Promise<void> {
  const configPath = 'office_config/main';
  try {
    const configRef = doc(db, 'office_config', 'main');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      const batch = writeBatch(db);
      const initialConfig: FirestoreOfficeConfigDoc = {
        workspaceId: WORKSPACE_ID,
        managerPassword: INITIAL_MANAGER_PASSWORD,
        initialized: true
      };
      batch.set(configRef, initialConfig);

      for (const staff of INITIAL_STAFF_RECORDS) {
        const staffRef = doc(db, 'staff_members', staff.id);
        const staffDoc: FirestoreStaffDoc = {
          id: staff.id.slice(0, 64),
          staffLoginId: staff.staffLoginId.slice(0, 32),
          staffName: staff.staffName.slice(0, 80),
          role: staff.role.slice(0, 80),
          avatarColor: staff.avatarColor.slice(0, 16),
          monthlyGoal: Math.min(10000, Math.max(1, Math.round(staff.monthlyGoal))),
          dailyGoal: Math.min(1000, Math.max(1, Math.round(staff.dailyGoal))),
          workspaceId: WORKSPACE_ID
        };
        batch.set(staffRef, staffDoc);
      }

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, configPath);
  }
}

// Create a new reward entry in Firestore (status = 'pending')
export async function createRewardEntryInDb(
  staffId: string,
  reservationNumber: string,
  rewardsNumber: string,
  dateIso: string
): Promise<void> {
  const entryId = `RWD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const nowTime = new Date().toTimeString().slice(0, 8);
  const path = `reward_entries/${entryId}`;

  const payload: FirestoreRewardEntryDoc = {
    entryId: entryId.slice(0, 64),
    staffId: staffId.slice(0, 64),
    reservationNumber: reservationNumber.trim().slice(0, 40),
    rewardsNumber: rewardsNumber.replace(/\s+/g, '').slice(0, 20),
    dateIso: dateIso.slice(0, 10),
    timestamp: nowTime.slice(0, 12),
    status: 'pending',
    workspaceId: WORKSPACE_ID
  };

  try {
    await setDoc(doc(db, 'reward_entries', entryId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Manager approves or rejects a single reward entry
export async function updateRewardEntryStatusInDb(
  entryId: string,
  decision: 'approved' | 'rejected'
): Promise<void> {
  const path = `reward_entries/${entryId}`;
  try {
    await updateDoc(doc(db, 'reward_entries', entryId), {
      status: decision,
      reviewedBy: MANAGER_EMAIL
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Manager approves all pending entries across all staff
export async function approveAllPendingEntriesInDb(
  staffRecords: StaffMemberRecord[]
): Promise<void> {
  const path = 'reward_entries';
  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const s of staffRecords) {
      for (const e of s.entries) {
        if (e.status === 'pending') {
          batch.update(doc(db, 'reward_entries', e.entryId), {
            status: 'approved',
            reviewedBy: MANAGER_EMAIL
          });
          count++;
        }
      }
    }
    if (count > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Manager creates a new staff member
export async function createStaffMemberInDb(
  staffName: string,
  staffLoginId: string,
  role: string,
  monthlyGoal: number,
  currentCount: number
): Promise<void> {
  const avatarPalette = [
    '#0284c7',
    '#7c3aed',
    '#059669',
    '#d97706',
    '#e11d48',
    '#4f46e5',
    '#0d9488'
  ];
  const color = avatarPalette[currentCount % avatarPalette.length];
  const id = `STF-${Date.now()}`;
  const safeGoal = Math.min(10000, Math.max(1, Math.round(monthlyGoal)));
  const safeDaily = Math.min(1000, Math.max(1, Math.round(safeGoal / 10)));
  const cleanLoginId = staffLoginId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

  const payload: FirestoreStaffDoc = {
    id,
    staffLoginId: cleanLoginId.slice(0, 32),
    staffName: staffName.trim().slice(0, 80),
    role: (role.trim() || 'Front Desk Associate').slice(0, 80),
    avatarColor: color,
    monthlyGoal: safeGoal,
    dailyGoal: safeDaily,
    workspaceId: WORKSPACE_ID
  };

  try {
    await setDoc(doc(db, 'staff_members', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `staff_members/${id}`);
  }
}

// Manager resets or updates a staff member's Login ID
export async function updateStaffLoginIdInDb(
  staffId: string,
  newLoginId: string
): Promise<void> {
  const cleanId = newLoginId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
  try {
    await updateDoc(doc(db, 'staff_members', staffId), {
      staffLoginId: cleanId
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `staff_members/${staffId}`);
  }
}

// Manager updates monthly goal for a single staff member
export async function updateStaffMonthlyGoalInDb(
  staffId: string,
  newMonthlyGoal: number
): Promise<void> {
  const safeGoal = Math.min(10000, Math.max(1, Math.round(newMonthlyGoal)));
  const safeDaily = Math.min(1000, Math.max(1, Math.round(safeGoal / 10)));
  try {
    await updateDoc(doc(db, 'staff_members', staffId), {
      monthlyGoal: safeGoal,
      dailyGoal: safeDaily
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `staff_members/${staffId}`);
  }
}

// Manager updates monthly goal for ALL staff members
export async function updateAllStaffMonthlyGoalsInDb(
  staffRecords: StaffMemberRecord[],
  newMonthlyGoal: number
): Promise<void> {
  const safeGoal = Math.min(10000, Math.max(1, Math.round(newMonthlyGoal)));
  const safeDaily = Math.min(1000, Math.max(1, Math.round(safeGoal / 10)));
  try {
    const batch = writeBatch(db);
    for (const s of staffRecords) {
      batch.update(doc(db, 'staff_members', s.id), {
        monthlyGoal: safeGoal,
        dailyGoal: safeDaily
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'staff_members');
  }
}

// Manager updates their unique password
export async function updateManagerPasswordInDb(newPassword: string): Promise<void> {
  const safePassword = newPassword.trim().slice(0, 64);
  try {
    await updateDoc(doc(db, 'office_config', 'main'), {
      managerPassword: safePassword
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'office_config/main');
  }
}

// Manager clears all reward entries across all workstations
export async function clearAllRewardEntriesInDb(): Promise<void> {
  try {
    const q = query(
      collection(db, 'reward_entries'),
      where('workspaceId', '==', WORKSPACE_ID)
    );
    const snap = await getDocs(q);
    const docs = snap.docs;
    for (const d of docs) {
      await deleteDoc(doc(db, 'reward_entries', d.id));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'reward_entries');
  }
}
