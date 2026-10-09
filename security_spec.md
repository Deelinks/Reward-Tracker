# Security Specification — Kimono Front Desk Enrollment Tracker

## 1. Data Invariants & Threat Model
1. **Zero Plaintext Credential Storage**: The Manager password MUST NEVER be stored in plaintext in Firestore or local storage. Only its salted SHA-256 cryptographic hex digest (`managerPasswordHash`, 64 lowercase hex characters) is stored in `/office_config/main`.
2. **PII & Identifier Confidentiality**:
   - The Manager's email address is NEVER stored in `/reward_entries` (`reviewedBy` is strictly `'MANAGER'`), `/active_sessions`, or displayed on the dashboard.
   - Staff unique login IDs (`AUR-xxx`) are NEVER displayed on the Staff welcome dashboard, Leaderboard, Charts, or PDF exports for non-managers.
3. **Strict Schema & Volumetric Bounds**:
   - Every document in `/staff_members/{staffId}`, `/reward_entries/{entryId}`, `/office_config/{configId}`, and `/active_sessions/{sessionId}` MUST belong to `workspaceId == 'aurelia-office'`.
   - Every document ID (`staffId`, `entryId`, `configId`, `sessionId`) MUST match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
   - `RewardEntry.rewardsNumber` MUST be an exact 16-digit numeric string (`^[0-9]{16}$`).
   - `RewardEntry.reservationNumber` MUST be sanitized alphanumeric/hyphen (`^[a-zA-Z0-9_\-]+$`, max 40 chars) preventing XSS or injection payloads.
   - `StaffMember.staffLoginId` MUST start with `AUR-` and match `^AUR-[a-zA-Z0-9_\-]+$` (5 to 32 chars).
4. **Anti-Update-Gap & Action-Based Mutations**:
   - Every write enforces exact key allowlists via `hasAll` and `hasOnly`, and every update enforces `affectedKeys().hasOnly(...)` combined with full `isValid[Entity](incoming())` validation.

## 2. The "Dirty Dozen" Payloads Audited & Blocked
1. **Shadow Field Injection on Staff Create**: `{ id: 'STF-01', ..., isAdmin: true }` -> Rejected by `hasOnly`.
2. **Oversized String DoW on Staff Name**: `staffName` with 5,000 characters -> Rejected by `staffName.size() <= 80`.
3. **Invalid ID Poisoning**: Document path `/staff_members/bad$id!@#` -> Rejected by `isValidId(staffId)`.
4. **Orphaned RewardEntry Creation**: Creating `/reward_entries/RWD-1` with `staffId: 'NON_EXISTENT'` -> Rejected by `exists(/databases/$(database)/documents/staff_members/$(incoming().staffId))`.
5. **Non-16-Digit Rewards Number**: `rewardsNumber: '12345'` or `'ABC-123456789012'` -> Rejected by `rewardsNumber.size() == 16 && rewardsNumber.matches('^[0-9]{16}$')`.
6. **Direct Approved Creation Bypass**: Creating a `RewardEntry` with `status: 'approved'` directly without manager review -> Rejected because `create` requires `incoming().status == 'pending'`.
7. **Immutable Field Mutation on RewardEntry**: Updating `rewardsNumber` or `staffId` on an existing `/reward_entries/{entryId}` -> Rejected by `affectedKeys().hasOnly(['status', 'reviewedBy'])` and immutable field equality checks.
8. **Invalid Workspace Query (Blanket List)**: Listing collections without `workspaceId == 'aurelia-office'` -> Rejected by `existing().workspaceId == 'aurelia-office'`.
9. **Negative or Huge Goal Poisoning**: Updating `monthlyGoal` to `-50` or `999999` -> Rejected by `monthlyGoal >= 1 && monthlyGoal <= 10000`.
10. **Invalid Date Format in RewardEntry**: `dateIso: '10/08/2026'` -> Rejected by `matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')`.
11. **Plaintext Password Injection in OfficeConfig**: Attempting to store `managerPassword` instead of a 64-char SHA-256 hex `managerPasswordHash` -> Rejected by `hasOnly(['workspaceId', 'managerPasswordHash', 'initialized'])` and `matches('^[a-f0-9]{64}$')`.
12. **Unknown Collection Write**: Writing to `/random_collection/doc1` -> Rejected by global default-deny `match /{document=**} { allow read, write: if false; }`.
