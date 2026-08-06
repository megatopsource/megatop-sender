import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Search, Edit3, Trash2, Check, X, Lock, Phone, Mail, User, Shield, Key } from 'lucide-react';

export default function UsersManager({ users, onAddUser, onUpdateUser, onDeleteUser }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form State with Username & Password
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '123',
    phone: '',
    email: '',
    role: 'sales',
    active: true
  });

  const availableRoles = [
    { id: 'admin', label: '👑 مدير (Manager / Admin)' },
    { id: 'accountant', label: '📊 محاسب (Accountant)' },
    { id: 'sales', label: '👤 مندوب مبيعات (Sales Rep)' },
    { id: 'collector', label: '💵 مسئول تحصيل (Collection Agent)' },
    { id: 'delivery', label: '🚚 مسئول توصيل / سائق (Delivery Agent)' },
    { id: 'installer', label: '🛠️ فني تركيبات وصيانة (Installer)' }
  ];

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.phone.includes(q) || (u.username && u.username.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: `user${users.length + 1}`,
      password: '123',
      phone: '',
      email: '',
      role: 'sales',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username || user.name.split(' ')[0],
      password: user.password || '123',
      phone: user.phone,
      email: user.email || '',
      role: user.role,
      active: user.active !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.username) {
      alert('يرجى ملء الاسم، اسم المستخدم، ورقم الهاتف');
      return;
    }

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...formData
      });
      alert('تم تحديث بيانات المستخدم وكلمة السر بنجاح!');
    } else {
      const newUser = {
        id: `user-${Date.now()}`,
        ...formData
      };
      onAddUser(newUser);
      alert('تم إضافة المستخدم بكلمة سر مخصصة بنجاح!');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>إدارة الحسابات وكلمات السر للموظفين ({users.length} مستخدم)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء وتعديل أسماء المستخدمين (Usernames) وكلمات السر (Passwords) والأدوار الوظيفية في الشركة.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة حساب موظف جديد</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الموظف، اسم المستخدم، أو رقم الهاتف..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-11 pl-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">جميع الوظائف والتخصصات</option>
            <option value="admin">المديرين (Admin)</option>
            <option value="accountant">المحاسبين</option>
            <option value="sales">مسؤولي المبيعات</option>
            <option value="collector">محصلين ميدانيين</option>
            <option value="delivery">سائقين توصيل</option>
            <option value="installer">فنيين تركيبات</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">اسم الموظف</th>
                <th className="py-3.5 px-4">اسم المستخدم (Username)</th>
                <th className="py-3.5 px-4">كلمة السر (Password)</th>
                <th className="py-3.5 px-4">الوظيفة والتخصص</th>
                <th className="py-3.5 px-4">الهاتف</th>
                <th className="py-3.5 px-4 text-center">إجراءات التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredUsers.map((user) => {
                const roleObj = availableRoles.find(r => r.id === user.role);

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      👤 {user.name}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-indigo-300 font-bold">
                      {user.username || 'user'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">
                      {user.password || '123'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-md font-semibold">
                        {roleObj ? roleObj.label : user.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      📞 {user.phone}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="bg-slate-800 hover:bg-slate-700 text-indigo-300 p-1.5 rounded-lg border border-slate-700"
                          title="تعديل اسم المستخدم وكلمة السر"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {user.id !== 'user-admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت تأكد من حذف الحساب ${user.name}؟`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg border border-slate-700"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>{editingUser ? `تعديل حساب (${editingUser.name})` : 'إضافة حساب موظف جديد'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">اسم الموظف *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: أحمد محمود"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">اسم المستخدم للدخول (Username) *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="user1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-indigo-300 font-mono focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">كلمة السر (Password) *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="123"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010xxxxxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">الدور الوظيفي *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500">
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
