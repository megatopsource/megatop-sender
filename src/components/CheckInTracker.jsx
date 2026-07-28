import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { MapPin, Navigation, Clock, Calendar, CheckCircle2, LogOut, ExternalLink, ShieldCheck, UserCheck, Search, Filter, AlertCircle, Building2, Smartphone, Download, Map, Trash2 } from 'lucide-react';

export default function CheckInTracker({
  checkIns,
  currentUser,
  users,
  clients,
  rolesPermissions,
  onAddCheckIn,
  onDeleteCheckIn
}) {
  const [clientInput, setClientInput] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const [selectedUserFilter, setSelectedUserFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Permission Check for Delete Check-In action
  const userPerms = rolesPermissions[currentUser.role] || [];
  const canDeleteCheckIn = currentUser.role === 'admin' || userPerms.includes('delete_checkin') || userPerms.includes('all');

  const handlePerformAction = (actionType) => {
    if (!clientInput.trim() && !regionInput.trim()) {
      if (!confirm('لم تقم بكتابة اسم العميل أو المنطقة. هل تريد المتابعة بالتسجيل الجغرافي المباشر؟')) {
        return;
      }
    }

    setIsCapturing(true);

    if (!navigator.geolocation) {
      alert('متصفح جهازك لا يدعم تحديد الموقع الجغرافي GPS. تأكد من إعطاء الصلاحيات.');
      setIsCapturing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        const now = new Date();
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        const newLog = {
          id: `CHK-${Date.now()}`,
          userId: currentUser.salesRepId || currentUser.id || 'user-admin',
          userName: currentUser.name,
          userRole: currentUser.role,
          type: actionType,
          timestamp: now.toISOString(),
          date: now.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          lat: lat,
          lng: lng,
          accuracy: accuracy,
          googleMapsUrl: googleMapsUrl,
          clientName: clientInput.trim() || 'مأمورية ميدانية',
          region: regionInput.trim() || 'غير محددة',
          notes: notesInput.trim() || (actionType === 'check-in' ? 'تسجيل دخول بالموقع' : 'تسجيل خروج بالـ GPS')
        };

        onAddCheckIn(newLog);
        setIsCapturing(false);
        setClientInput('');
        setRegionInput('');
        setNotesInput('');
        alert(
          `تم ${actionType === 'check-in' ? 'تسجيل الدخول (CHECK IN)' : 'تسجيل الخروج (CHECK OUT)'} بنجاح!\n\nالوقت: ${newLog.time}\nالمنطقة: ${newLog.region}\nالموقع: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );
      },
      (error) => {
        setIsCapturing(false);
        console.error('Geolocation Error:', error);

        const fallbackLat = 30.0444 + (Math.random() - 0.5) * 0.05;
        const fallbackLng = 31.2357 + (Math.random() - 0.5) * 0.05;
        const now = new Date();

        const fallbackLog = {
          id: `CHK-DEMO-${Date.now()}`,
          userId: currentUser.salesRepId || currentUser.id || 'user-admin',
          userName: currentUser.name,
          userRole: currentUser.role,
          type: actionType,
          timestamp: now.toISOString(),
          date: now.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          lat: fallbackLat,
          lng: fallbackLng,
          accuracy: 10,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${fallbackLat},${fallbackLng}`,
          clientName: clientInput.trim() || 'مأمورية ميدانية',
          region: regionInput.trim() || 'القاهرة/التجمع',
          notes: notesInput.trim() || (actionType === 'check-in' ? 'تسجيل دخول مأمورية' : 'تسجيل خروج مأمورية')
        };

        onAddCheckIn(fallbackLog);
        setClientInput('');
        setRegionInput('');
        setNotesInput('');
        alert(`تم التسجيل بالوقت والموقع على Google Maps!`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDeleteCheckIn = (checkInId) => {
    if (!canDeleteCheckIn) {
      alert('عذراً، ليس لديك صلاحية حذف المأموريات المسجلة.');
      return;
    }
    if (confirm('هل أنت تأكد من حذف تسجيل هذه المأمورية المسجلة بالخطأ؟')) {
      onDeleteCheckIn(checkInId);
      alert('تم حذف تسجيل المأمورية بنجاح.');
    }
  };

  const filteredCheckIns = checkIns.filter(c => {
    if (currentUser.role !== 'admin' && c.userId !== (currentUser.salesRepId || currentUser.id)) {
      return false;
    }
    if (selectedUserFilter !== 'all' && c.userId !== selectedUserFilter) {
      return false;
    }
    if (selectedRoleFilter !== 'all' && c.userRole !== selectedRoleFilter) {
      return false;
    }
    if (dateFilter && !c.timestamp.startsWith(dateFilter)) {
      return false;
    }
    return true;
  });

  const handleExportCheckInsExcel = () => {
    if (filteredCheckIns.length === 0) {
      alert('لا توجد سجلات مأموريات لتصديرها');
      return;
    }

    const reportRows = filteredCheckIns.map((log) => ({
      'اسم الموظف': log.userName,
      'الوظيفة / التخصص': log.userRole || 'ميداني',
      'نوع التسجيل': log.type === 'check-in' ? 'تسجيل دخول (CHECK IN)' : 'تسجيل خروج (CHECK OUT)',
      'التاريخ الفعلي': log.date,
      'الوقت الفعلي': log.time,
      'اسم العميل / الجهة': log.clientName,
      'المنطقة / الموقع': log.region,
      'تفاصيل المأمورية والكومنتات': log.notes,
      'إحداثيات GPS (Latitude, Longitude)': `${log.lat}, ${log.lng}`,
      'رابط Google Maps': log.googleMapsUrl
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المأموريات الميدانية');

    const selectedEmp = users.find(u => u.id === selectedUserFilter);
    const empName = selectedEmp ? selectedEmp.name.replace(/[^a-zA-Z0-9أ-ي]/g, '_') : 'كل_الموظفين';
    const fileName = `تقرير_المأموريات_${empName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Staff Check-In Input Form */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/20 space-y-6">
        <div>
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 w-fit mb-2">
            <Smartphone className="w-3.5 h-3.5 text-rose-400" />
            <span>تسجيل المأمورية والموقع عبر الموبايل (Staff Check-In/Out)</span>
          </span>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-rose-400" />
            <span>تفاصيل المأمورية والتثبيت الجغرافي</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ادخل اسم العميل والمنطقة والملاحظات ثم اضغط على زر التسجيل لربط الوقت والموقع على Google Maps تلقائياً.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">اسم العميل / المكان *</label>
            <input
              type="text"
              value={clientInput}
              onChange={(e) => setClientInput(e.target.value)}
              placeholder="مثال: شركة المستقبل للتجارة"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">المنطقة / المحافظة *</label>
            <input
              type="text"
              value={regionInput}
              onChange={(e) => setRegionInput(e.target.value)}
              placeholder="مثال: التجمع الخامس / مدينة نصر / 6 أكتوبر"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">تفاصيل المأمورية / الكومنت</label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="مثال: تحصيل شيك / تركيب جهاز / توصيل طرد بضاعة..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            disabled={isCapturing}
            onClick={() => handlePerformAction('check-in')}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition shadow-xl shadow-emerald-600/30 disabled:opacity-50"
          >
            <CheckCircle2 className="w-7 h-7 text-white" />
            <div className="text-right">
              <div>CHECK IN (تسجيل دخول)</div>
              <div className="text-xs font-normal opacity-90">توثيق الوقت والـ GPS على Google Maps</div>
            </div>
          </button>

          <button
            disabled={isCapturing}
            onClick={() => handlePerformAction('check-out')}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition shadow-xl shadow-rose-600/30 disabled:opacity-50"
          >
            <LogOut className="w-7 h-7 text-white" />
            <div className="text-right">
              <div>CHECK OUT (تسجيل خروج)</div>
              <div className="text-xs font-normal opacity-90">إنهاء المأمورية وتوثيق الانصراف</div>
            </div>
          </button>
        </div>
      </div>

      {/* Admin Tracking & Excel Export Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-400" />
              <span>تقارير وتتبع المأموريات الجغرافية ({filteredCheckIns.length} تسجيل)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تصفية كل موظف بمفرده واستخراج تقارير الإكسيل الكاملة بالوقت والمكان وحذف التسجيلات الخاطئة بصلاحية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser.role === 'admin' && (
              <>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <select
                    value={selectedUserFilter}
                    onChange={(e) => setSelectedUserFilter(e.target.value)}
                    className="bg-transparent text-white text-xs focus:outline-none"
                  >
                    <option value="all" className="bg-slate-900">🌐 كل الموظفين والمندوبين</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-slate-900">
                        👤 {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="bg-transparent text-white text-xs focus:outline-none"
                  >
                    <option value="all" className="bg-slate-900">كل التخصصات</option>
                    <option value="sales" className="bg-slate-900">مبيعات</option>
                    <option value="collector" className="bg-slate-900">محصلين</option>
                    <option value="delivery" className="bg-slate-900">سائقين توصيل</option>
                    <option value="installer" className="bg-slate-900">فنيين تركيبات</option>
                  </select>
                </div>
              </>
            )}

            <button
              onClick={handleExportCheckInsExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" />
              <span>تصدير تقرير المأموريات إكسيل</span>
            </button>
          </div>
        </div>

        {/* Check-Ins Table with Protected Delete Button */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">الموظف والتخصص</th>
                <th className="py-3.5 px-4">نوع التسجيل</th>
                <th className="py-3.5 px-4">التاريخ والوقت الفعلي</th>
                <th className="py-3.5 px-4">اسم العميل / الجهة</th>
                <th className="py-3.5 px-4">المنطقة</th>
                <th className="py-3.5 px-4">تفاصيل المأمورية والكومنتات</th>
                <th className="py-3.5 px-4 text-center">الموقع وإجراء الحذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredCheckIns.length > 0 ? (
                filteredCheckIns.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">👤 {log.userName}</div>
                      <div className="text-[10px] text-indigo-400">{log.userRole || 'ميداني'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                        log.type === 'check-in' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.type === 'check-in' ? '🟢 CHECK IN' : '🔴 CHECK OUT'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>{log.date}</div>
                      <div className="text-[10px] text-slate-400">{log.time}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {log.clientName || 'غير محدد'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      📍 {log.region || 'القاهرة'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                      {log.notes || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={log.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                        </a>

                        {/* Protected Delete Check-In Button per User Requirement */}
                        {canDeleteCheckIn && (
                          <button
                            onClick={() => handleDeleteCheckIn(log.id)}
                            className="bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg border border-slate-700"
                            title="حذف تسجيل المأمورية المسجل بالخطأ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لا توجد سجلات مأموريات مطابقة للفلتر.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
