import React from 'react';
import { Users, FileText, DollarSign, TrendingUp, ShieldCheck, UserCheck, ArrowUpRight, Award } from 'lucide-react';

export default function AdminDashboard({ salesReps, clients, quotations, onSelectRepFilter }) {
  // Aggregate Stats
  const totalClients = clients.length;
  const totalQuotations = quotations.length;
  const totalRevenue = quotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);
  const approvedQuotations = quotations.filter(q => q.status === 'approved').length;

  // Breakdown per Sales Rep
  const repStats = salesReps.map(rep => {
    const repClients = clients.filter(c => c.salesRepId === rep.id);
    const repQuotes = quotations.filter(q => q.salesRepId === rep.id);
    const repRevenue = repQuotes.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

    return {
      rep,
      clientCount: repClients.length,
      quoteCount: repQuotes.length,
      revenue: repRevenue
    };
  }).sort((a, b) => b.quoteCount - a.quoteCount);

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>إجمالي فريق المبيعات</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{salesReps.length} مسؤول</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 30 حساب نشط بالكامل
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>إجمالي قواميس العملاء</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalClients.toLocaleString('en-US')}</div>
          <div className="text-[11px] text-slate-400">موزعين على الـ 30 مسؤول مبيعات</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>عروض الأسعار المنشأة</span>
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalQuotations} عرض</div>
          <div className="text-[11px] text-emerald-400">
            {approvedQuotations} عرض مقبول ومؤكد
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>إجمالي قيمة عروض الأسعار</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{totalRevenue.toLocaleString('en-US')} ج.م</div>
          <div className="text-[11px] text-indigo-300">مجموع قيم الفواتير بالروابط الحية</div>
        </div>
      </div>

      {/* Sales Reps Performance Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>جدول متابعة أداء الـ 30 مسؤول مبيعات (Sales Rep Performance)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">مسؤول المبيعات</th>
                <th className="py-3 px-4">الهاتف / الإيميل</th>
                <th className="py-3 px-4 text-center">عدد العملاء المسجلين</th>
                <th className="py-3 px-4 text-center">عدد عروض الأسعار</th>
                <th className="py-3 px-4 text-left">إجمالي القيمة المالية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {repStats.map((stat, idx) => (
                <tr key={stat.rep.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                    <span>👤 {stat.rep.name}</span>
                    {idx === 0 && <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30">الأعلى نشاطاً</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{stat.rep.phone}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-300 font-mono">
                    {stat.clientCount.toLocaleString('en-US')} عميل
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-400 font-mono">
                    {stat.quoteCount} كوتيشن
                  </td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-400">
                    {stat.revenue.toLocaleString('en-US')} ج.م
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
