import React, { useState } from 'react';
import { ShieldCheck, Lock, Check, X, Save, RefreshCw, Key, UserCheck, Shield } from 'lucide-react';

export default function PermissionsMatrix({ rolesPermissions, onSavePermissions }) {
  const [permissionsState, setPermissionsState] = useState(rolesPermissions);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const rolesList = [
    { id: 'admin', name: '👑 مدير (Manager / Admin)', desc: 'صلاحيات كاملة للتحكم بالنظام والمعلومات' },
    { id: 'accountant', name: '📊 محاسب (Accountant)', desc: 'متابعة الفواتير والماليات والتقارير المالية' },
    { id: 'sales', name: '👤 مندوب مبيعات (Sales Rep)', desc: 'إدارة العملاء وإنشاء عروض الأسعار الخاصة به' },
    { id: 'installer', name: '🛠️ فني تركيبات (Installation Technician)', desc: 'تسجيل المأموريات الجغرافية والتركيبات عند العملاء' },
    { id: 'collector', name: '💵 مسئول تحصيل (Collection Agent)', desc: 'مأموريات تحصيل الأموال والشيكات وتوثيق الخرائط' },
    { id: 'delivery', name: '🚚 مسئول توصيل (Delivery Agent)', desc: 'توصيل البضائع للعملاء وتسجيل Check-In/Out' }
  ];

  // Granular Permissions Matrix including Notification Receipt Control!
  const permissionsList = [
    { id: 'view_all_clients', label: 'رؤية كل عملاء الشركة (20,000+ عميل)', group: 'العملاء' },
    { id: 'view_own_clients', label: 'رؤية عملاءه فقط المسجلين باسمه', group: 'العملاء' },
    { id: 'add_client', label: 'إضافة عميل جديد', group: 'العملاء' },
    { id: 'edit_client', label: 'تعديل بيانات العميل', group: 'العملاء' },
    { id: 'delete_client', label: 'حذف العميل نهائياً', group: 'العملاء' },

    { id: 'view_all_quotes', label: 'رؤية كافة عروض الأسعار في النظام', group: 'عروض الأسعار' },
    { id: 'create_edit_quotes', label: 'إنشاء وتعديل عروض الأسعار والرابط الحي', group: 'عروض الأسعار' },
    { id: 'delete_quote', label: 'حذف عرض السعر', group: 'عروض الأسعار' },

    { id: 'manage_catalog', label: 'إضافة بنود جديدة للكتالوج', group: 'الكتالوج' },
    { id: 'edit_item', label: 'تعديل بنود المخزون والسعر والوحدة', group: 'الكتالوج' },
    { id: 'delete_item', label: 'حذف بنود المخزون', group: 'الكتالوج' },

    { id: 'field_checkin', label: 'تسجيل الحضور والمأموريات عبر Google Maps', group: 'المأموريات الميدانية' },
    { id: 'delete_checkin', label: 'حذف سجلات المأموريات المسجلة بالخطأ', group: 'المأموريات الميدانية' },
    { id: 'receive_checkin_notifications', label: '🔔 استلام إشعارات المأموريات اللحظية (Check-In/Out Alerts)', group: 'المأموريات والإشعارات' },

    { id: 'export_import_excel', label: 'استيراد وتصدير ملفات الإكسيل', group: 'الإكسيل والتقارير' },
    { id: 'view_financial_reports', label: 'رؤية التقارير والإحصائيات المالية', group: 'الإكسيل والتقارير' },
    { id: 'manage_users_permissions', label: 'إدارة المستخدمين وضبط كلمات السر والصلاحيات', group: 'إدارة النظام' }
  ];

  const handleTogglePermission = (roleId, permId) => {
    setPermissionsState(prev => {
      const rolePerms = prev[roleId] || [];
      const updated = rolePerms.includes(permId)
        ? rolePerms.filter(p => p !== permId)
        : [...rolePerms, permId];

      return {
        ...prev,
        [roleId]: updated
      };
    });
  };

  const handleSave = () => {
    onSavePermissions(permissionsState);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-400" />
            <span>مصفوفة التحكم بالصلاحيات وإشعارات المأموريات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            حدد بالضبط أي رتبة تمتلك صلاحيات الإضافة، التعديل، واستلام إشعارات الـ Check-In والـ Check-Out اللحظية.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30"
        >
          <Save className="w-4 h-4" />
          <span>حفظ وتطبيق الصلاحيات</span>
        </button>
      </div>

      {isSavedAlert && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>تم حفظ الصلاحيات وتحديث القواعد في النظام بنجاح!</span>
        </div>
      )}

      {/* Permissions Matrix Grid Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 min-w-[280px]">الصلاحية والعملية</th>
                {rolesList.map(role => (
                  <th key={role.id} className="py-4 px-3 text-center min-w-[130px] border-r border-slate-800/60">
                    <div className="font-extrabold text-white text-xs">{role.name.split(' ')[0]} {role.name.split(' ')[1]}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{role.name.split('(')[1]?.replace(')', '') || ''}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {permissionsList.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-bold ml-2">
                      {perm.group}
                    </span>
                    <span className="font-semibold text-slate-100">{perm.label}</span>
                  </td>

                  {rolesList.map(role => {
                    const isAllowed = (permissionsState[role.id] || []).includes(perm.id) || role.id === 'admin';
                    const isAdmin = role.id === 'admin';

                    return (
                      <td key={role.id} className="py-3 px-3 text-center border-r border-slate-800/60">
                        <button
                          disabled={isAdmin}
                          onClick={() => handleTogglePermission(role.id, perm.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                            isAllowed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-600 border border-slate-700 hover:text-slate-400'
                          } ${isAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                          title={isAllowed ? 'مسموح' : 'غير مسموح'}
                        >
                          {isAllowed ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-600" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
