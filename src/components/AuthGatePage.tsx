import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  INITIAL_MANAGER_PASSWORD,
  INITIAL_MANAGER_PASSWORD_HASH,
  MANAGER_EMAIL,
  StaffMemberRecord
} from '../data/hotelLoyaltyData';
import { hashManagerPassword } from '../services/firebaseClient';
import { KeyRound, Lock, ShieldCheck, UserCheck, Users } from 'lucide-react';

interface AuthGatePageProps {
  staffRecords: StaffMemberRecord[];
  managerPasswordHash: string;
  onAuthenticatedStaff: (staff: StaffMemberRecord) => void;
  onAuthenticatedManager: (email: string) => void;
}

export const AuthGatePage: React.FC<AuthGatePageProps> = ({
  staffRecords,
  managerPasswordHash,
  onAuthenticatedStaff,
  onAuthenticatedManager
}) => {
  const [roleTab, setRoleTab] = useState<'staff' | 'manager'>('staff');
  const [staffNameInput, setStaffNameInput] = useState<string>('');
  const [staffIdInput, setStaffIdInput] = useState<string>('');
  const [managerEmailInput, setManagerEmailInput] = useState<string>('');
  const [managerPasswordInput, setManagerPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (lockoutUntil > now) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      setErrorMsg(
        `Too many failed sign-in attempts. Brute-force protection active — please wait ${remainingSec} seconds.`
      );
      return false;
    }
    return true;
  };

  const recordFailedAttempt = (msg: string) => {
    const nextCount = failedAttempts + 1;
    setFailedAttempts(nextCount);
    if (nextCount >= 5) {
      const lockMs = 30 * 1000; // 30-second cooldown after 5 consecutive failures
      setLockoutUntil(Date.now() + lockMs);
      setFailedAttempts(0);
      setErrorMsg(
        `${msg} (5 failed attempts detected — locked for 30 seconds to prevent brute-force attacks.)`
      );
    } else {
      setErrorMsg(msg);
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRateLimit()) return;

    const cleanName = staffNameInput.trim();
    const cleanId = staffIdInput.trim().toUpperCase();

    if (!cleanName || !cleanId) {
      setErrorMsg('Please enter both your Staff Name and your Manager-assigned Staff ID.');
      return;
    }

    const matchedStaff = staffRecords.find(
      (s) =>
        s.staffName.toLowerCase() === cleanName.toLowerCase() &&
        s.staffLoginId.toUpperCase() === cleanId
    );

    if (!matchedStaff) {
      recordFailedAttempt(
        'Invalid Staff Name or Staff ID. Please verify your credentials with the Manager.'
      );
      return;
    }

    setFailedAttempts(0);
    setErrorMsg(null);
    onAuthenticatedStaff(matchedStaff);
  };

  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRateLimit()) return;

    const cleanEmail = managerEmailInput.trim().toLowerCase();

    if (cleanEmail !== MANAGER_EMAIL.toLowerCase()) {
      recordFailedAttempt('Unauthorized email. Only the registered Manager email is permitted.');
      return;
    }

    const inputHash = await hashManagerPassword(managerPasswordInput);
    if (inputHash !== managerPasswordHash) {
      recordFailedAttempt('Incorrect Manager password. Please try again.');
      return;
    }

    setFailedAttempts(0);
    setErrorMsg(null);
    onAuthenticatedManager(MANAGER_EMAIL);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Top Brand Header */}
        <div className="bg-slate-900 px-7 py-6 text-white border-b border-slate-800">
          <div className="text-xs font-semibold text-amber-400 tracking-wide uppercase mb-1">
            Front desk enrollment tracker
          </div>
          <h1 className="text-2xl font-semibold text-white font-display">
            Kimono
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with your Manager-issued Staff ID or Manager credentials to access the
            application.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setRoleTab('staff');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              roleTab === 'staff'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Staff Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleTab('manager');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              roleTab === 'manager'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Manager Sign In</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-7">
          {roleTab === 'staff' ? (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Staff Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="off"
                  value={staffNameInput}
                  onChange={(e) => {
                    setStaffNameInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter your name (e.g. Busola)"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Unique Staff ID
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={32}
                    autoComplete="off"
                    value={staffIdInput}
                    onChange={(e) => {
                      setStaffIdInput(e.target.value.toUpperCase());
                      setErrorMsg(null);
                    }}
                    placeholder="Enter your Staff ID"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono-tabular font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In to Staff Workspace</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleManagerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Manager Email
                </label>
                <input
                  type="email"
                  required
                  maxLength={100}
                  autoComplete="off"
                  value={managerEmailInput}
                  onChange={(e) => {
                    setManagerEmailInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Enter manager email..."
                  className="w-full px-3.5 py-2.5 text-sm font-mono-tabular border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Unique Manager Password
                  </label>
                  {managerPasswordHash === INITIAL_MANAGER_PASSWORD_HASH && (
                    <button
                      type="button"
                      onClick={() => {
                        setManagerPasswordInput(INITIAL_MANAGER_PASSWORD);
                        setErrorMsg(null);
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                    >
                      Fill Current Password ({INITIAL_MANAGER_PASSWORD})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    maxLength={64}
                    autoComplete="off"
                    value={managerPasswordInput}
                    onChange={(e) => {
                      setManagerPasswordInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Enter manager password..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In as Manager</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
