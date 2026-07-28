import React, { useState, useMemo } from 'react';
import { Search, Plus, Phone, Building2, User, MapPin, Filter, FileSpreadsheet, Eye, FileText, ChevronLeft, ChevronRight, UserPlus, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import ExcelManager from './ExcelManager';

export default function ClientsManager({
  clients,
  salesReps,
  currentUser,
  quotations,
  rolesPermissions,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onImportClients,
  onCreateQuoteForClient,
  onViewClientProfile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepFilter, setSelectedRepFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // New & Edit Client Form State
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    company: '',
    city: 'القاهرة',
    salesRepId: currentUser.role === 'sales' ? currentUser.salesRepId : (salesReps[0]?.id || ''),
    notes: ''
  });

  // Check permissions for logged in user role
  const userPerms = rolesPermissions[currentUser.role] || [];
  const canEdit = currentUser.role === 'admin' || userPerms.includes('edit_client') || userPerms.includes('all');
  const canDelete = currentUser.role === 'admin' || userPerms.includes('delete_client') || userPerms.includes('all');

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (currentUser.role === 'sales' && client.salesRepId !== currentUser.salesRepId) {
        return false;
      }
      if (currentUser.role === 'admin' && selectedRepFilter !== 'all' && client.salesRepId !== selectedRepFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          client.name.toLowerCase().includes(q) ||
          client.phone.includes(q) ||
          client.company.toLowerCase().includes(q) ||
          client.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [clients, currentUser, selectedRepFilter, searchQuery]);

  const itemsPerPage = 50;
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  const handleOpenAdd = () => {
    setEditingClient(null);
    setClientForm({
      name: '',
      phone: '',
      company: '',
      city: 'القاهرة',
      salesRepId: currentUser.role === 'sales' ? currentUser.salesRepId : (salesReps[0]?.id || ''),
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (client) => {
    if (!canEdit) {
      alert('عذراً، ليس لديك صلاحية تعديل بيانات العملاء.');
      return;
    }
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone,
      company: client.company,
      city: client.city || 'القاهرة',
      salesRepId: client.salesRepId,
      notes: client.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (client) => {
    if (!canDelete) {
      alert('عذراً، ليس لديك صلاحية حذف العملاء.');
      return;
    }
    if (confirm(`هل أنت تأكد من حذف العميل "${client.name}" نهائياً من القاموس؟`)) {
      onDeleteClient(client.id);
      alert('تم حذف العميل بنجاح');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) {
      alert('يرجى ملء الاسم ورقم الهاتف على الأقل');
      return;
    }

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        ...clientForm
      });
      alert('تم تعديل بيانات العميل بنجاح!');
    } else {
      // Check for duplicate client (same name + same phone)
      const isDuplicate = clients.some(
        c => c.name.toLowerCase().trim() === clientForm.name.toLowerCase().trim()
          && c.phone.trim() === clientForm.phone.trim()
      );
      if (isDuplicate) {
        alert('⚠️ هذا العميل موجود بالفعل بنفس الاسم ورقم التليفون!\nلا يمكن إضافته مرة تانية.');
        return;
      }

      const created = {
        id: `CLI-${Date.now().toString().slice(-6)}`,
        ...clientForm,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddClient(created);
      alert('تم إضافة العميل بنجاح!');
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            <span>إدارة قواميس العملاء ({filteredClients.length.toLocaleString('ar-EG')} عميل)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.role === 'admin'
              ? 'تظهر لك قائمة كافة عملاء الشركة بالكامل (20,000+ عميل) مع صلاحيات التحكم والحذف والتعديل.'
              : `أنت في حساب (${currentUser.name}) - تظهر لك فقط بقائمة عملاءك المسجلين باسمك.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExcelManager
            clients={filteredClients}
            salesReps={salesReps}
            currentUser={currentUser}
            onImportClients={onImportClients}
          />

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="بحث سريع برقم الهاتف، اسم العميل، اسم الشركة، أو كود العميل..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-11 pl-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {currentUser.role === 'admin' ? (
          <div className="relative">
            <Filter className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <select
              value={selectedRepFilter}
              onChange={(e) => {
                setSelectedRepFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">🌐 كل مسؤول مبيعات (All Sales Reps)</option>
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  👤 {rep.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 px-4 py-2.5 rounded-xl text-xs text-indigo-300 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>عرض عملاء {currentUser.name} فقط</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-xs font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">كود العميل</th>
                <th className="py-3.5 px-4">اسم العميل والشركة</th>
                <th className="py-3.5 px-4">رقم الهاتف</th>
                <th className="py-3.5 px-4">المدينة</th>
                {currentUser.role === 'admin' && <th className="py-3.5 px-4">المسؤول (السيلز)</th>}
                <th className="py-3.5 px-4">عروض الأسعار</th>
                <th className="py-3.5 px-4 text-center">إجراءات التحكم والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => {
                  const rep = salesReps.find((r) => r.id === client.salesRepId);
                  const clientQuotes = quotations.filter((q) => q.clientId === client.id);

                  return (
                    <tr key={client.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-xs text-indigo-400 font-medium">
                        {client.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{client.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{client.company}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-emerald-400 font-semibold dir-ltr text-right">
                        <div className="flex items-center gap-1.5 justify-start">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{client.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{client.city}</span>
                        </div>
                      </td>

                      {currentUser.role === 'admin' && (
                        <td className="py-3 px-4 text-xs">
                          <span className="inline-flex items-center gap-1 bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700">
                            👤 {rep ? rep.name : 'غير محدد'}
                          </span>
                        </td>
                      )}

                      <td className="py-3 px-4 text-xs">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          clientQuotes.length > 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500'
                        }`}>
                          {clientQuotes.length} عرض سعر
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onCreateQuoteForClient(client)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                            title="عمل عرض سعر سريع لهذا العميل"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>عرض سعر</span>
                          </button>

                          <button
                            onClick={() => onViewClientProfile(client)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg border border-slate-700"
                            title="عرض ملف السجل الكامل (History)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Protected Edit Action */}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(client)}
                              className="bg-slate-800 hover:bg-indigo-900/40 text-indigo-300 p-1.5 rounded-lg border border-slate-700"
                              title="تعديل بيانات العميل"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Protected Delete Action */}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(client)}
                              className="bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg border border-slate-700"
                              title="حذف العميل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={currentUser.role === 'admin' ? 7 : 6} className="py-12 text-center text-slate-400">
                    لا يوجد عملاء مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950/80 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            عرض الصفحة <span className="font-bold text-white">{currentPage}</span> من <span className="font-bold text-white">{totalPages}</span> (إجمالي {filteredClients.length.toLocaleString('ar-EG')} عميل)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="font-mono px-2 text-indigo-300">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>{editingClient ? `تعديل العميل (${editingClient.name})` : 'إضافة عميل جديد'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">اسم العميل *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="مثال: المهندس أحمد محمود"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">رقم الهاتف (الواتساب) *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="010xxxxxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">اسم الشركة / النشاط</label>
                  <input
                    type="text"
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                    placeholder="شركة المستقبل للتجارة"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">تحديد مسؤول المبيعات</label>
                  <select
                    disabled={currentUser.role === 'sales'}
                    value={clientForm.salesRepId}
                    onChange={(e) => setClientForm({ ...clientForm, salesRepId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  >
                    {salesReps.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ملاحظات عن العميل</label>
                <textarea
                  rows={2}
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="أي تفاصيل خاصة بالعميل..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/30">
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
