import React, { useState } from 'react';
import { motion } from 'motion/react';
import { INITIAL_MANAGER_PASSWORD, MANAGER_EMAIL, StaffMemberRecord } from '../data/hotelLoyaltyData';
import { KeyRound, Lock, ShieldCheck, UserCheck, Users } from 'lucide-react';

interface AuthGatePageProps {
  staffRecords: StaffMemberRecord[];
  managerPassword: string;
  onAuthenticatedStaff: (staff: StaffMemberRecord) => void;
  onAuthenticatedManager: (email: string) => void;
}

export const AuthGatePage: React.FC<AuthGatePageProps> = ({
  staffRecords,
  managerPassword,
  onAuthenticatedStaff,
  onAuthenticatedManager
}) => {
  const [roleTab, setRoleTab] = useState<'staff' | 'manager'>('staff');
  const [staffNameInput, setStaffNameInput] = useState<string>('');
  const [staffIdInput, setStaffIdInput] = useState<string>('');
  const [managerEmailInput, setManagerEmailInput] = useState<string>('');
  const [managerPasswordInput, setManagerPasswordInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      setErrorMsg(
        'Invalid Staff Name or Staff ID. Please verify your credentials with the Manager.'
      );
      return;
    }

    setErrorMsg(null);
    onAuthenticatedStaff(matchedStaff);
  };

  const handleManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = managerEmailInput.trim().toLowerCase();

    if (cleanEmail !== MANAGER_EMAIL.toLowerCase()) {
      setErrorMsg('Unauthorized email. Only the registered Manager email is permitted.');
      return;
    }

    if (managerPasswordInput !== managerPassword) {
      setErrorMsg('Incorrect Manager password. Please try again.');
      return;
    }

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
            Protected Front Office Portal
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
                  {managerPassword === INITIAL_MANAGER_PASSWORD && (
                    <button
                      type="button"
                      onClick={() => {
                        setManagerPasswordInput(managerPassword);
                        setErrorMsg(null);
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                    >
                      Fill Current Password ({managerPassword})
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
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
