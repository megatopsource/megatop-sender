import React, { useState } from 'react';
import {
  User,
  Building2,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  Plus,
  CheckCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Eye,
  Tag
} from 'lucide-react';

export default function ClientHistoryModal({
  client,
  salesReps,
  quotations,
  checkIns,
  onClose,
  onOpenLiveView,
  onAddNoteToClient
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'quotes', 'checkins', 'notes'
  const [newNote, setNewNote] = useState('');

  if (!client) return null;

  const rep = salesReps.find(r => r.id === client.salesRepId);
  const clientQuotes = quotations.filter(q => q.clientId === client.id);
  const clientCheckIns = checkIns.filter(c =>
    (c.clientName && c.clientName.toLowerCase().includes(client.name.toLowerCase())) ||
    (c.clientName && c.clientName.toLowerCase().includes(client.company.toLowerCase()))
  );

  const totalApprovedRevenue = clientQuotes
    .filter(q => q.status === 'approved')
    .reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  const totalQuotationsValue = clientQuotes
    .reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj = {
      id: `NOTE-${Date.now()}`,
      text: newNote.trim(),
      date: new Date().toLocaleDateString('ar-EG'),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      author: 'المدير / المسؤول'
    };

    if (onAddNoteToClient) {
      onAddNoteToClient(client.id, noteObj);
    }
    setNewNote('');
  };

  // Unified timeline items
  const timelineItems = [
    ...clientQuotes.map(q => ({
      type: 'quote',
      id: q.id,
      timestamp: q.updatedAt || q.date,
      date: q.date,
      title: `عرض سعر #${q.id}`,
      status: q.status,
      amount: q.grandTotal,
      raw: q
    })),
    ...clientCheckIns.map(c => ({
      type: 'checkin',
      id: c.id,
      timestamp: c.timestamp,
      date: c.date,
      time: c.time,
      title: `${c.type === 'check-in' ? '🟢 مأمورية دخول (Check-In)' : '🔴 مأمورية خروج (Check-Out)'} - ${c.userName}`,
      notes: c.notes,
      region: c.region,
      googleMapsUrl: c.googleMapsUrl,
      raw: c
    })),
    ...(client.timelineNotes || []).map(n => ({
      type: 'note',
      id: n.id,
      timestamp: n.date,
      date: n.date,
      time: n.time,
      title: `📝 ملاحظة وتواصل - ${n.author}`,
      notes: n.text
    }))
  ].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">

        {/* Modal Header: Client Main Info & Quick Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-950 text-indigo-300 font-mono font-bold px-2.5 py-0.5 rounded border border-indigo-500/30">
                {client.id}
              </span>
              <span className="text-xs bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                مسجل منذ: {client.createdAt || 'سابقاً'}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mt-2 flex items-center gap-2">
              <span>{client.name}</span>
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <strong className="text-slate-200">{client.company}</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono dir-ltr text-right">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>{client.phone}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{client.city}</span>
              </span>
              <span className="flex items-center gap-1 bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
                👤 المسؤول: {rep ? rep.name : 'غير محدد'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-xl bg-slate-800 hover:bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Financial & Activity KPI Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block">إجمالي عروض الأسعار:</span>
            <span className="text-lg font-bold text-white font-mono">{clientQuotes.length} كوتيشن</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block">قيمة العروض المقبولة:</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {totalApprovedRevenue.toLocaleString('en-US')} ج.م
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block">إجمالي قيمة التعاملات:</span>
            <span className="text-lg font-bold text-indigo-300 font-mono">
              {totalQuotationsValue.toLocaleString('en-US')} ج.م
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block">المأموريات والزيارات:</span>
            <span className="text-lg font-bold text-rose-400 font-mono">
              {clientCheckIns.length} مأمورية ميدانية
            </span>
          </div>
        </div>

        {/* Add Note / Interaction Log Form */}
        <form onSubmit={handleAddNote} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>إضافة ملاحظة أو توثيق تواصل جديد لسجل العميل:</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="مثال: تم الاتفاق هاتفياً على جدولة الدفعة الثانية، أو العميل يطلب تعديل البند الأول..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ملاحظة</span>
            </button>
          </div>
        </form>

        {/* Timeline Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 السجل الكامل التفاعلي ({timelineItems.length})
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'quotes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📄 عروض الأسعار ({clientQuotes.length})
          </button>

          <button
            onClick={() => setActiveTab('checkins')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'checkins' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📍 المأموريات والمواقع الجغرافية ({clientCheckIns.length})
          </button>
        </div>

        {/* Timeline Items Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {timelineItems.length > 0 ? (
            timelineItems
              .filter(item => {
                if (activeTab === 'quotes') return item.type === 'quote';
                if (activeTab === 'checkins') return item.type === 'checkin';
                if (activeTab === 'notes') return item.type === 'note';
                return true;
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        item.type === 'quote'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : item.type === 'checkin'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.type === 'quote' ? 'عرض سعر' : item.type === 'checkin' ? 'مأمورية ميدانية' : 'ملاحظة وتواصل'}
                      </span>

                      <span className="font-bold text-white text-sm">{item.title}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({item.date} {item.time || ''})</span>
                    </div>

                    {item.notes && <p className="text-slate-300 leading-relaxed">{item.notes}</p>}

                    {item.type === 'quote' && (
                      <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                        <span>الإجمالي: <strong className="text-emerald-400">{(item.amount || 0).toLocaleString('en-US')} ج.م</strong></span>
                        <span>•</span>
                        <span>الحالة: <strong className="text-indigo-300">{item.status}</strong></span>
                      </div>
                    )}

                    {item.type === 'checkin' && item.googleMapsUrl && (
                      <a
                        href={item.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 hover:underline flex items-center gap-1 font-mono text-[11px] pt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>مشاهدة الموقع على Google Maps ({item.region || 'القاهرة'})</span>
                      </a>
                    )}
                  </div>

                  {item.type === 'quote' && item.raw && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLiveView(item.raw);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-xs shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الكوتيشن</span>
                    </button>
                  )}
                </div>
              ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              لا توجد حركة في سجل هذا العميل بعد.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            إغلاق ملف الهيستوري
          </button>
        </div>

      </div>
    </div>
  );
}
