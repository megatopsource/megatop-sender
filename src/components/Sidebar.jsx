import React, { useState } from 'react';
import {
  Users,
  FileText,
  Package,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Menu,
  X,
  UserCheck,
  Key,
  LogOut,
  Database
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  totalClientsCount,
  assignedClientsCount,
  quotationsCount,
  itemsCount,
  checkInsCount,
  onLogout
}) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      id: 'clients',
      label: 'إدارة العملاء',
      icon: Users,
      badge: currentUser.role === 'admin' ? totalClientsCount.toLocaleString('ar-EG') : assignedClientsCount.toLocaleString('ar-EG'),
      badgeColor: 'bg-indigo-500/20 text-indigo-300'
    },
    {
      id: 'quotations',
      label: 'عروض الأسعار',
      icon: FileText,
      badge: quotationsCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'catalog',
      label: 'دليل البنود والماركات',
      icon: Package,
      badge: itemsCount,
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'checkins',
      label: 'تتبع المأموريات الجغرافية (Check-In/Out)',
      icon: MapPin,
      badge: checkInsCount,
      badgeColor: 'bg-rose-500/20 text-rose-300',
      highlight: true
    },
    {
      id: 'backup',
      label: 'النسخ الاحتياطي (Backups)',
      icon: Database,
      adminOnly: true,
      highlightAdmin: true
    },
    {
      id: 'permissions',
      label: 'مصفوفة الصلاحيات والأدوار',
      icon: Key,
      adminOnly: true
    },
    {
      id: 'users',
      label: 'إدارة الحسابات وكلمات السر',
      icon: ShieldCheck,
      adminOnly: true
    },
    {
      id: 'dashboard',
      label: 'إحصائيات الأدمن',
      icon: LayoutDashboard,
      adminOnly: true
    }
  ];

  const handleSelect = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      <div className="lg:hidden fixed top-3 right-3 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl shadow-xl focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6 text-rose-400" /> : <Menu className="w-6 h-6 text-indigo-400" />}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 right-0 bottom-0 z-40 w-72 bg-slate-900/95 border-l border-slate-800 backdrop-blur-xl transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30">
              M
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wide text-white">megatop.com.eg</h1>
              <p className="text-[11px] text-indigo-400 font-semibold">منصة المبيعات وعروض الأسعار v2.0</p>
            </div>
          </div>

          <div className="mt-4 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">المستخدم الحالي:</span>
              <span className="font-bold text-amber-400 truncate max-w-[120px]">{currentUser.name}</span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.role === 'admin' ? 'إجمالي العملاء:' : 'العملاء الخاصين بك:'}</span>
              </span>
              <span className="font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {currentUser.role === 'admin' ? totalClientsCount.toLocaleString('ar-EG') : assignedClientsCount.toLocaleString('ar-EG')}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="w-full mt-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            القائمة الرئيسية
          </div>

          {navItems.map((item) => {
            if (item.adminOnly && currentUser.role !== 'admin') return null;

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                    : item.highlightAdmin
                    ? 'bg-amber-950/30 border border-amber-500/30 text-amber-300 hover:bg-amber-900/30'
                    : item.highlight
                    ? 'bg-rose-950/30 border border-rose-500/20 text-rose-300 hover:bg-rose-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlightAdmin ? 'text-amber-400' : item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-center text-[11px] text-slate-500">
          <div>megatop.com.eg © 2026</div>
        </div>
      </aside>
    </>
  );
}
