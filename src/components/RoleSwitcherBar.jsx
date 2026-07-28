import React from 'react';
import { ShieldCheck, UserCheck, Users, Eye, Sparkles, Sun, Moon } from 'lucide-react';
import NotificationsCenter from './NotificationsCenter';

export default function RoleSwitcherBar({
  currentUser,
  salesReps,
  rolesPermissions,
  onSwitchRole,
  totalClientsCount,
  onGenerate20k,
  notifications,
  onClearNotifications,
  onMarkNotificationsAsRead,
  isAppDarkMode,
  onToggleAppDarkMode
}) {
  const userPerms = rolesPermissions ? (rolesPermissions[currentUser.role] || []) : [];
  const canReceiveNotifications = currentUser.role === 'admin' || userPerms.includes('receive_checkin_notifications') || userPerms.includes('all');

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/20 px-4 py-2 text-sm relative z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Switcher Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-lg text-indigo-300">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-xs text-indigo-200">تبديل الحسابات والمعاينة:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchRole({ role: 'admin', salesRepId: null, name: 'الأدمن الرئيسي (المدير)', username: 'admin' })}
              className={`flex items-center gap-1.5 px-3 py-1.2 rounded-lg font-medium transition-all text-xs ${
                currentUser.role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>👑 الأدمن (مشاهدة الكل)</span>
            </button>

            {/* Staff Selector */}
            <div className="flex items-center gap-2">
              <select
                value={currentUser.role !== 'admin' ? currentUser.salesRepId : ''}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const selectedRep = salesReps.find(r => r.id === e.target.value);
                  if (selectedRep) {
                    onSwitchRole({
                      role: selectedRep.role || 'sales',
                      salesRepId: selectedRep.id,
                      name: selectedRep.name,
                      id: selectedRep.id,
                      username: selectedRep.username
                    });
                  }
                }}
                className={`bg-slate-800 border text-slate-200 px-3 py-1.5 rounded-lg font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  currentUser.role !== 'admin' ? 'border-indigo-500 text-indigo-200 bg-indigo-950/60' : 'border-slate-700'
                }`}
              >
                <option value="">-- تبديل لحساب موظف (مبيعات / سائق / محصل) --</option>
                {salesReps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    👤 {rep.name} ({rep.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Notifications Center (Controlled by Permissions Matrix) */}
        <div className="flex items-center gap-3">
          {canReceiveNotifications && (
            <NotificationsCenter
              notifications={notifications}
              onClearNotifications={onClearNotifications}
              onMarkAsRead={onMarkNotificationsAsRead}
            />
          )}

          {/* App theme switcher (Sun/Moon button) */}
          <button
            type="button"
            onClick={onToggleAppDarkMode}
            className={`p-1.5 rounded-lg border transition flex items-center justify-center ${
              isAppDarkMode
                ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
            title={isAppDarkMode ? 'تبديل للوضع المضيء (Light Mode)' : 'تبديل للوضع الداكن (Dark Mode)'}
          >
            {isAppDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400">الحالي:</span>
            <span className="font-bold text-amber-400">
              {currentUser.role === 'admin' ? '👑 الأدمن' : `👤 ${currentUser.name}`}
            </span>
          </div>

          <button
            onClick={onGenerate20k}
            title="توليد 20,000 عميل لاختبار السعة"
            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>20,000 عميل</span>
            <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {totalClientsCount.toLocaleString('ar-EG')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
