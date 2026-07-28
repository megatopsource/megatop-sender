import React, { useState } from 'react';
import { FileText, Search, Plus, Edit3, Copy, MessageSquare, Eye, ExternalLink, Calendar, CheckCircle, Clock, XCircle, AlertCircle, Building2, User } from 'lucide-react';

export default function QuotationsList({
  quotations,
  clients,
  salesReps,
  currentUser,
  onNewQuote,
  onEditQuote,
  onOpenLiveView
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter quotations based on Role & Search & Status
  const filteredQuotations = quotations.filter((q) => {
    // Role isolation: Sales rep only sees their quotes
    if (currentUser.role === 'sales' && q.salesRepId !== currentUser.salesRepId) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && q.status !== statusFilter) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const query = search.toLowerCase();
      return (
        q.id.toLowerCase().includes(query) ||
        (q.clientName && q.clientName.toLowerCase().includes(query)) ||
        (q.clientPhone && q.clientPhone.includes(query)) ||
        (q.clientCompany && q.clientCompany.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> مقبول</span>;
      case 'rejected':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> مرفوض</span>;
      case 'sent':
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> تم الإرسال</span>;
      default:
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> مسودة</span>;
    }
  };

  const handleCopyLink = (shareToken) => {
    const url = `${window.location.origin}/quote/${shareToken}`;
    navigator.clipboard.writeText(url);
    alert('تم نسخ الرابط الحي للفاتورة إلى الحافظة!');
  };

  const handleWhatsApp = (quote) => {
    const cleanPhone = (quote.clientPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    const url = `${window.location.origin}/quote/${quote.shareToken}`;
    const message = encodeURIComponent(
      `أهلاً ${quote.clientName} 👋\nإليك عرض السعر الخاص بشركتكم (${quote.clientCompany}):\n\n🔗 ${url}\n\nيمكنك فتح الرابط لمشاهدة التفاصيل في أي وقت.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>سجل عروض الأسعار والفواتير الحية ({filteredQuotations.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جميع عروض الأسعار المنشأة بالروابط التفاعلية الحية. أي تعديل يتم هنا يظهر مباشرة لدى العميل.
          </p>
        </div>

        <button
          onClick={onNewQuote}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء عرض سعر جديد</span>
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
            placeholder="بحث بكود عرض السعر، اسم العميل، رقم الهاتف..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-11 pl-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كل الحالات</option>
            <option value="sent">مرسل</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="draft">مسودة</option>
          </select>
        </div>
      </div>

      {/* Quotations List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuotations.length > 0 ? (
          filteredQuotations.map((quote) => {
            const rep = salesReps.find((r) => r.id === quote.salesRepId);
            return (
              <div
                key={quote.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Left */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-indigo-400 font-extrabold text-base bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-500/30">
                      {quote.id}
                    </span>
                    {getStatusBadge(quote.status)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{quote.date}</span>
                    </span>
                    {currentUser.role === 'admin' && (
                      <span className="text-xs bg-slate-800 text-indigo-300 px-2.5 py-0.5 rounded border border-slate-700">
                        👤 {rep ? rep.name : 'غير محدد'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                      <span>{quote.clientName}</span>
                      <span className="text-xs text-slate-400 font-normal">({quote.clientCompany})</span>
                    </h3>
                    <div className="text-xs text-emerald-400 font-mono mt-0.5 dir-ltr text-right">
                      📞 {quote.clientPhone}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>عدد البنود: <strong className="text-slate-200">{quote.items?.length || 0}</strong></span>
                    <span>•</span>
                    <span>الإجمالي: <strong className="text-emerald-400 font-mono text-sm">{quote.grandTotal?.toLocaleString('ar-EG')} ج.م</strong></span>
                  </div>
                </div>

                {/* Actions Right */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => onEditQuote(quote)}
                    className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    title="تعديل هذا الفاتورة في أي وقت مع انعكاس فورية في الرابط"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الفاتورة</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(quote.shareToken)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    title="نسخ الرابط الحي التفاعلي"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </button>

                  <button
                    onClick={() => handleWhatsApp(quote)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    title="مشاركة مباشرة عبر واتساب"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </button>

                  <button
                    onClick={() => onOpenLiveView(quote)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    title="معاينة ما يراه العميل عند فتح الرابط"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة الرابط</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
            لا توجد عروض أسعار مطابقة للبحث أو الصلاحية الحالية.
          </div>
        )}
      </div>
    </div>
  );
}
