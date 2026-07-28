import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Share2,
  CheckCircle2,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Download,
  Check,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Sun,
  Moon
} from 'lucide-react';

export default function ClientLiveView({ quotation, salesReps, onBackToDashboard }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  // Logo fetched from local public assets
  const megatopLogoUrl = '/logo.png';

  // Fallback demo quote if accessed directly
  const quote = quotation || {
    id: 'S54909',
    shareToken: '9afeQkzkf',
    clientName: 'Mega top CO',
    clientCompany: 'Mega top CO',
    clientPhone: '01000500169',
    clientEmail: 'Ahmedyosry@megatop.com.eg',
    clientAddress: 'New Cairo / القاهرة الجديدة',
    date: '07/20/2026',
    validUntil: '08/03/2026',
    status: 'quotation',
    companyMode: 'my_company',
    customCompanyName: '',
    companyWebsite: 'https://megatop.com.eg/',
    items: [
      { brand: 'Hikvision', title: 'DS-2CE16D0T-EXIPF (3.6mm) 2 MP Fixed Mini Bullet Camera', code: 'DS-2CE16D0T', unit: 'Units', quantity: 400, unitPrice: 7.94, total: 3176.00 },
      { brand: 'Hikvision', title: 'DS-2CE76D0T-EXIPF (2.8mm) 2 MP Indoor Fixed Turret Camera', code: 'DS-2CE76D0T', unit: 'Units', quantity: 400, unitPrice: 7.94, total: 3176.00 },
      { brand: 'Hikvision', title: 'DS-2CE16K0T-LPFS (3.6mm) 3K Smart Hybrid Light Audio Fixed Camera', code: 'DS-2CE16K0T', unit: 'Units', quantity: 200, unitPrice: 20.00, total: 4000.00 },
      { brand: 'Hikvision', title: 'iDS-7104HQHI-M1/S 4-ch 1080P Mini 1U AcuSense DVR', code: 'iDS-7104HQHI', unit: 'Units', quantity: 50, unitPrice: 48.53, total: 2426.50 }
    ],
    subtotal: 12778.50,
    taxRate: 14,
    taxAmount: 1788.99,
    discount: 500,
    grandTotal: 14067.49,
    notes: 'Terms & Conditions: https://megatop.com.eg/terms'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ رابط عرض السعر المباشر للحافظة بنجاح!');
  };

  const handleSignSubmit = (e) => {
    e.preventDefault();
    if (!signerName.trim()) {
      alert('يرجى كتابة الاسم للتأكيد والتوقيع');
      return;
    }
    setIsSigned(true);
    setIsSignModalOpen(false);
    alert(`تم تأكيد واعتماد عرض السعر بنجاح باسم (${signerName})!`);
  };

  const displayWebsite = quote.companyWebsite || 'https://megatop.com.eg/';
  const isHeaderHidden = quote.companyMode === 'hidden';

  const salesRep = salesReps?.find(
    (rep) => rep.id === quote.salesRepId || rep.salesRepId === quote.salesRepId
  ) || { name: 'م/ أحمد يسري', phone: '01070907955' };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans dir-rtl pb-0 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} dir="rtl">
      
      {/* Global CSS style block for absolute print safety - Forces clean light mode on print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .print\\:hidden, footer, aside, .d-print-none {
            display: none !important;
          }
          body {
            background: white !important;
            background-color: white !important;
            color: black !important;
          }
          main {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            background-color: white !important;
            color: black !important;
          }
          .totals-box {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
          }
          .table-header {
            background-color: #1b5ea8 !important;
            color: white !important;
          }
          .text-amber-600 {
            color: #d22630 !important;
          }
        }
      `}} />

      {/* Top Floating Control Bar for Sales / Admin view */}
      {onBackToDashboard && (
        <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-4 print:hidden d-print-none sticky top-0 z-40 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              <span>العودة للوحة النظام</span>
            </button>

            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>عرض السعر المعتمد لـ Megatop (تصميم أبيض متناسق)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>نسخ الرابط</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Quotation Canvas Container */}
      <div className="max-w-6xl mx-auto px-4 pt-6 mb-12">

        {/* Top Theme Toggler Header - Extremely Clear and Visible */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            معاينة عرض السعر التفاعلي (Interactive Quote Preview)
          </h2>
          
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm border ${
              isDarkMode
                ? 'bg-slate-900 text-amber-400 border-slate-800'
                : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>{isDarkMode ? 'الوضع المضيء (Light Mode)' : 'الوضع الداكن (Dark Mode)'}</span>
          </button>
        </div>

        {/* Optional Header with clickable Logo image */}
        {!isHeaderHidden && (
          <header className={`border-b transition-colors duration-300 py-5 px-6 rounded-t-3xl shadow-sm flex items-center justify-between gap-4 mb-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              {/* Show logo image if companyMode is my_company OR if a custom logo was explicitly uploaded */}
              {(quote.companyMode === 'my_company' || quote.companyLogoUrl) && (
                <a
                  href={displayWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`الذهاب إلى الموقع الرسمي: ${displayWebsite}`}
                  className="block"
                >
                  <img
                    src={quote.companyLogoUrl || megatopLogoUrl}
                    alt="Logo"
                    className="w-14 h-14 object-contain rounded-full border border-slate-200 bg-white p-1 hover:scale-105 transition-all duration-300 shadow-sm"
                  />
                </a>
              )}

              <div>
                <h2 className={`font-bold text-sm tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {quote.customCompanyName || 'ميجاتوب سكيورتي سيستم للكاميرات'}
                </h2>
                {quote.companyWebsite && (
                  <a
                    href={quote.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#1b5ea8] hover:underline font-mono font-bold"
                  >
                    {quote.companyWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                )}
              </div>
            </div>

            <div className="text-left font-mono text-xs text-slate-500">
              <div>رقم العرض: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{quote.id || 'S54909'}</strong></div>
              <div>التاريخ: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{quote.date}</strong></div>
            </div>
          </header>
        )}

        {/* FastEgy Style Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Action & Total Summary Card */}
          <aside className="lg:col-span-4 space-y-4 print:hidden d-print-none order-2 lg:order-1">

            {/* Total Highlight Box */}
            <div className={`p-6 rounded-3xl shadow-md border transition-colors duration-300 space-y-4 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                إجمالي قيمة عرض السعار (Total Amount)
              </div>

              <div className="text-3xl font-black text-[#d22630] font-mono">
                {(quote.grandTotal || quote.subtotal || 0).toLocaleString('ar-EG')} <span className="text-sm text-slate-500 font-normal">ج.م</span>
              </div>

              {isSigned ? (
                <div className="bg-emerald-550/10 border border-emerald-500/30 text-emerald-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم توقيع واعتماد هذا العرض بنجاح!</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsSignModalOpen(true)}
                  className="w-full bg-[#d22630] hover:bg-[#b01c24] text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg shadow-[#d22630]/25 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Sign & Accept (التوقيع والاعتماد)</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="w-full bg-[#1b5ea8] hover:bg-[#144983] text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>تحميل / طباعة عرض السعر (View Details / PDF)</span>
              </button>
            </div>

            {/* Support / Contact Card */}
            {quote.showRepContact !== false && (
              <div className={`p-5 rounded-3xl border transition-colors duration-300 shadow-sm space-y-3 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  للاستفسارات والدعم المباشر (المندوب المختص)
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-550/10 border border-blue-500/20 flex items-center justify-center text-[#1b5ea8] font-bold text-sm">
                    {salesRep.name ? salesRep.name.charAt(0) : 'M'}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{salesRep.name}</h4>
                    <p className="text-xs text-slate-550">{salesRep.phone ? `هاتف: ${salesRep.phone}` : 'مبيعات Megatop'}</p>
                  </div>
                </div>

                {salesRep.phone && (
                  <a
                    href={`https://wa.me/${(salesRep.phone.replace(/[^0-9]/g, '').startsWith('0') ? `2${salesRep.phone.replace(/[^0-9]/g, '')}` : salesRep.phone.replace(/[^0-9]/g, ''))}?text=${encodeURIComponent(`أهلاً ${salesRep.name} 👋\nأود الاستفسار عن عرض السعر رقم: ${quote.id}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>تواصل مباشر عبر الواتساب</span>
                  </a>
                )}
              </div>
            )}

          </aside>

          {/* Main Quotation Document */}
          <main className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 shadow-sm space-y-6 lg:col-span-8 order-1 lg:order-2 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>

            {/* Document Header & Title */}
            <div className="border-b border-slate-200/20 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="bg-red-50 text-[#d22630] border border-red-100 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Quotation / عرض سعر رسمي
                </span>
                <h1 className={`text-2xl font-black mt-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <span>عرض سعر رقم:</span>
                  <span className="text-[#1b5ea8] font-mono">{quote.id || 'S54909'}</span>
                </h1>
              </div>

              <div className={`text-left font-mono text-xs p-3 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-550 border-slate-200 text-slate-500'
              }`}>
                <div>تاريخ الإصدار: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{quote.date}</strong></div>
                <div className="mt-1">صالح حتى: <strong className="text-rose-500">{quote.validUntil}</strong></div>
              </div>
            </div>

            {/* Customer & Sale Info 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

              {/* Sale Info Box */}
              <div className={`p-5 rounded-2xl border transition-colors duration-300 space-y-3 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-550 border-slate-200'
              }`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 border-b pb-2 ${
                  isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
                }`}>
                  <FileText className="w-4 h-4 text-[#1b5ea8]" />
                  <span>بيانات الطلب والعرض (Sale Info)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200/20 pb-1.5">
                    <span className="text-slate-550">رقم الكود المرجعي:</span>
                    <span className={`font-bold font-mono ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{quote.id || 'S54909'}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200/20 pb-1.5">
                    <span className="text-slate-550">تاريخ العرض:</span>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{quote.date}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-550">تاريخ الانتهاء:</span>
                    <span className="font-bold text-rose-500">{quote.validUntil}</span>
                  </div>
                </div>
              </div>

              {/* Customer Address & Contact Info Box */}
              <div className={`p-5 rounded-2xl border transition-colors duration-300 space-y-3 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-550 border-slate-200'
              }`}>
                <h3 className={`font-bold text-sm flex items-center gap-2 border-b pb-2 ${
                  isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
                }`}>
                  <Building2 className="w-4 h-4 text-[#1b5ea8]" />
                  <span>الجهة والعميل (Customer Address)</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {quote.clientCompany || quote.clientName}
                  </div>

                  {quote.clientName && quote.clientName !== quote.clientCompany && (
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <span>الاسم:</span> <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{quote.clientName}</strong>
                    </div>
                  )}

                  {quote.clientAddress && (
                    <div className="text-slate-550 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{quote.clientAddress}</span>
                    </div>
                  )}

                  {quote.clientPhone && (
                    <div className="text-slate-550 flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{quote.clientPhone}</span>
                    </div>
                  )}

                  {quote.clientEmail && (
                    <div className="text-slate-550 flex items-center gap-1.5 font-mono">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{quote.clientEmail}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Products & Items Table */}
            <div className="space-y-3">
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>تفاصيل البنود والمنتجات (Products)</h3>

              <div className={`overflow-x-auto rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#1b5ea8] text-white font-bold table-header">
                    <tr>
                      <th className="py-3.5 px-4">اسم المنتجات والبنود (Products)</th>
                      <th className="py-3.5 px-3 text-center">الكمية (Qty)</th>
                      <th className="py-3.5 px-3 text-center">سعر الوحدة (Unit Price)</th>
                      <th className="py-3.5 px-4 text-left">الإجمالي (Amount)</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
                    {quote.items.map((item, idx) => (
                      <tr key={idx} className={isDarkMode ? 'hover:bg-slate-850' : 'hover:bg-slate-50'}>
                        <td className="py-3.5 px-4">
                          <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</div>
                          {item.brand && (
                            <div className="text-[10px] text-amber-500 font-semibold mt-0.5">
                              BRAND: {item.brand} {item.code ? `(${item.code})` : ''}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold font-mono">
                          {item.quantity} <span className="text-[10px] text-slate-500 font-normal">{item.unit || 'قطعة'}</span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono text-slate-555">
                          {(item.unitPrice || 0).toLocaleString('ar-EG')} ج.م
                        </td>

                        <td className="py-3.5 px-4 text-left font-bold font-mono text-indigo-500">
                          {(item.total || (item.quantity * item.unitPrice) || 0).toLocaleString('ar-EG')} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals Summary Box */}
            <div className="flex justify-end pt-2">
              <div className={`w-full sm:w-80 border p-5 rounded-2xl space-y-3 font-mono text-xs shadow-md totals-box ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between">
                  <span>المبلغ قبل الضريبة:</span>
                  <span className="font-bold">{(quote.subtotal || 0).toLocaleString('ar-EG')} ج.م</span>
                </div>

                {quote.discount > 0 && (
                  <div className="flex justify-between text-rose-550 font-bold">
                    <span>الخصم الممنوح:</span>
                    <span>-{(quote.discount || 0).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}

                {quote.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>ضريبة القيمة المضافة ({quote.taxRate || 14}%):</span>
                    <span className="font-bold">+{(quote.taxAmount || 0).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                  <span>الإجمالي النهائي (Total):</span>
                  <span className="text-lg text-[#d22630] font-black">{(quote.grandTotal || quote.subtotal || 0).toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Section */}
            <div className="border-t border-slate-200/20 pt-4 space-y-2 text-xs text-slate-550">
              <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>الشروط والأحكام (Terms & Conditions)</h4>
              <p className={`leading-relaxed p-3 rounded-xl border ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-555 border-slate-200'
              }`}>
                {quote.notes || 'عرض السعر شامل الضمان والدعم الفني. الأسعار سارية لمدة 15 يوماً من تاريخ إصدار العرض.'}
              </p>
            </div>

            {/* Official Signature Stamp Section */}
            {quote.companyMode !== 'hidden' && (
              <div className="pt-6 border-t border-slate-200/20 flex justify-between items-end text-xs">
                <div className="text-center space-y-2">
                  <div className="text-slate-400">توقيع واعتماد العميل</div>
                  {isSigned ? (
                    <div className="border-2 border-emerald-500 text-emerald-700 px-4 py-2 rounded-xl font-bold font-mono bg-emerald-50">
                      ✓ معتمد باسم: {signerName}
                    </div>
                  ) : (
                    <div className="h-10 border-b border-dashed border-slate-350 w-40"></div>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <div className="text-slate-450">خاتم الشركة واعتماد الإدارة</div>
                  { (quote.companyMode === 'my_company' || quote.companyLogoUrl) ? (
                    <a href={displayWebsite} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={quote.companyLogoUrl || megatopLogoUrl}
                        alt="Stamp"
                        className="w-16 h-16 object-contain rounded-full bg-white p-1 border border-slate-200 mx-auto"
                      />
                    </a>
                  ) : (
                    <div className={`border p-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider inline-block ${
                      isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-800'
                    }`}>
                      {quote.customCompanyName || 'اعتماد الإدارة'}
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Webpage Footer: Shown ONLY if company name option is 'my_company' */}
      {quote.companyMode === 'my_company' && (
        <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 mt-16 font-sans print:hidden">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Logo & Social Links */}
            <div className="space-y-4">
              <a href={displayWebsite} target="_blank" rel="noopener noreferrer" className="inline-block">
                <img src={quote.companyLogoUrl || megatopLogoUrl} alt="megatop.com.eg" className="w-16 h-16 object-contain rounded-full bg-white p-1" />
              </a>
              
              <div>
                <h4 className="text-white font-bold text-sm mb-2">تابعنا على موقعنا الرسمي</h4>
                <div className="flex items-center gap-3">
                  <a href={displayWebsite} target="_blank" rel="noreferrer" title="Facebook" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href={displayWebsite} target="_blank" rel="noreferrer" title="Instagram" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href={displayWebsite} target="_blank" rel="noreferrer" title="LinkedIn" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={displayWebsite} target="_blank" rel="noreferrer" title="YouTube" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-rose-700 text-slate-300 hover:text-white flex items-center justify-center transition">
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3 text-xs">
              <h4 className="text-amber-500 font-extrabold text-sm uppercase tracking-wider">روابط سريعة (Quick Links)</h4>
              <ul className="grid grid-cols-2 gap-2 text-slate-350">
                <li><a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-white transition">من نحن</a></li>
                <li><a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-white transition">المدونة</a></li>
                <li><a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-white transition">الأسئلة الشائعة</a></li>
                <li><a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-white transition">فروعنا</a></li>
                <li><a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-white transition">اتصل بنا</a></li>
                <li><a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-white transition">الوظائف</a></li>
              </ul>
            </div>

            {/* Column 3: About Us Summary */}
            <div className="space-y-3 text-xs leading-relaxed">
              <h4 className="text-white font-bold text-sm">عن megatop.com.eg</h4>
              <p className="text-slate-400">
                شريكك التقني الموثوق للحلول المتكاملة وأنظمة الكاميرات والسلامة والأمان للشركات والأفراد بأعلى درجات السرعة والكفاءة.
              </p>
            </div>

          </div>

          {/* Copyright Bar */}
          <div className="max-w-6xl mx-auto px-4 border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div>Copyright © 2008–2026 megatop.com.eg. All rights reserved.</div>
            <div className="flex gap-4">
              <a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-slate-300">الشروط والأحكام</a>
              <a href={displayWebsite} target="_blank" rel="noreferrer" className="hover:text-slate-300">سياسة الخصوصية</a>
            </div>
          </div>
        </footer>
      )}

      {/* Sign & Accept Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>تأكيد واعتماد عرض السعر (Sign & Accept)</span>
              </h3>
              <button onClick={() => setIsSignModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">اسم الشخص أو الجهة المعتمِدة *</label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="مثال: المهندس أحمد يسري / شركة ماجا توب"
                  className="w-full bg-slate-550 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 text-[11px] leading-relaxed">
                بالضغط على تأكيد، أنت تؤكد الموافقة الرسمية على بنود عرض السعر رقم <strong>{quote.id}</strong> بالإجمالي قدره <strong>{(quote.grandTotal || quote.subtotal).toLocaleString('ar-EG')} ج.م</strong>.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsSignModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-600/30">
                  تأكيد وتوقيع العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
