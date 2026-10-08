# Security Specification — Aurelia Staff Rewards Multi-Workstation Backend

## 1. Data Invariants
1. Every document in `/staff_members/{staffId}`, `/reward_entries/{entryId}`, and `/office_config/{configId}` MUST belong to `workspaceId == 'aurelia-office'`.
2. Every document ID (`staffId`, `entryId`, `configId`) MUST match `^[a-zA-Z0-9_\-]+$` and be `<= 128` characters.
3. A `RewardEntry` cannot be created unless its `staffId` exists in `/staff_members/{staffId}` and its `rewardsNumber` consists strictly of 10-20 numeric digits (`^[0-9]+$`).
4. Every string field is strictly bounded by `.size()` checks and every write enforces exact key allowlists via `hasAll` and `hasOnly` (and `affectedKeys().hasOnly(...)` on update).

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on Staff Create**: `{ id: 'STF-01', staffLoginId: 'AUR-101', staffName: 'Busola', role: 'Associate', avatarColor: '#d97706', monthlyGoal: 45, dailyGoal: 5, workspaceId: 'aurelia-office', isAdmin: true }` -> Rejected by `hasOnly`.
2. **Oversized String DoW on Staff Name**: `staffName` with 5,000 characters -> Rejected by `staffName.size() <= 80`.
3. **Invalid ID Poisoning**: Document path `/staff_members/bad$id!@#` -> Rejected by `isValidId(staffId)`.
4. **Orphaned RewardEntry Creation**: Creating `/reward_entries/RWD-1` with `staffId: 'NON_EXISTENT'` -> Rejected by `exists(/databases/$(database)/documents/staff_members/$(incoming().staffId))`.
5. **Non-Numeric Rewards Number**: `rewardsNumber: 'ABC-1234567890'` -> Rejected by `matches('^[0-9]+$')`.
6. **Direct Approved Creation Bypass**: Creating a `RewardEntry` with `status: 'approved'` directly without manager review -> Rejected because `create` requires `incoming().status == 'pending'`.
7. **Immutable Field Mutation on RewardEntry**: Updating `rewardsNumber` or `staffId` on an existing `/reward_entries/{entryId}` -> Rejected by `affectedKeys().hasOnly(['status', 'reviewedBy'])` and immutable field checks.
8. **Invalid Workspace Query (Blanket List)**: Listing `/staff_members` or `/reward_entries` without `workspaceId == 'aurelia-office'` -> Rejected by `resource.data.workspaceId == 'aurelia-office'`.
9. **Negative or Huge Goal Poisoning**: Updating `monthlyGoal` to `-50` or `999999` -> Rejected by `monthlyGoal >= 1 && monthlyGoal <= 10000`.
10. **Invalid Date Format in RewardEntry**: `dateIso: '10/08/2026'` -> Rejected by `matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')`.
11. **Unbounded Password Poisoning in OfficeConfig**: Setting `managerPassword` to a 10KB string -> Rejected by `managerPassword.size() >= 4 && managerPassword.size() <= 64`.
12. **Unknown Collection Write**: Writing to `/random_collection/doc1` -> Rejected by global default-deny `match /{document=**} { allow read, write: if false; }`.
