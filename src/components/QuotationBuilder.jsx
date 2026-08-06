import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Search, CheckCircle, Share2, Copy, Eye, Building2, Phone, Calendar, Sparkles, MessageSquare, Globe } from 'lucide-react';

export default function QuotationBuilder({
  initialQuote,
  initialClient,
  clients,
  itemsCatalog,
  currentUser,
  salesReps,
  onSaveQuote,
  onOpenLiveView,
  onCancel
}) {
  // Client selection state
  const [selectedClient, setSelectedClient] = useState(initialClient || null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Form State
  const [date, setDate] = useState(initialQuote?.date || new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    initialQuote?.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState(initialQuote?.status || 'sent');

  // Company Name Mode: 'my_company' (Megatop), 'custom' (manual input), 'hidden' (completely hidden)
  const [companyMode, setCompanyMode] = useState(initialQuote?.companyMode || 'custom');
  const [customCompanyName, setCustomCompanyName] = useState(initialQuote?.customCompanyName || 'ميجاتوب سكيورتي سيستم للكاميرات');
  const [companyWebsite, setCompanyWebsite] = useState(initialQuote?.companyWebsite || 'https://megatop.com.eg/');
  const [companyLogoUrl, setCompanyLogoUrl] = useState(initialQuote?.companyLogoUrl || '');
  const [showRepContact, setShowRepContact] = useState(initialQuote?.showRepContact !== false);
  const [notes, setNotes] = useState(initialQuote?.notes || 'السعر شامل الضمان والدعم الفني.');

  // Line items state (supports BRAND, ITEM, UNIT)
  const [lineItems, setLineItems] = useState(
    initialQuote?.items || [
      { id: '1', brand: 'Megatop', title: '', unit: 'قطعة', code: '', quantity: 1, unitPrice: 0, total: 0 }
    ]
  );

  const [discount, setDiscount] = useState(initialQuote?.discount || 0);
  const [taxRate, setTaxRate] = useState(initialQuote?.taxRate || 0);

  // Auto-complete item search state per row
  const [activeItemSearchRow, setActiveItemSearchRow] = useState(null);
  const [itemSearchText, setItemSearchText] = useState('');

  useEffect(() => {
    if (initialClient) {
      setSelectedClient(initialClient);
    } else if (initialQuote) {
      const found = clients.find(c => c.id === initialQuote.clientId);
      if (found) setSelectedClient(found);
    }
  }, [initialClient, initialQuote, clients]);

  const availableClients = clients.filter(c => {
    if (currentUser.role === 'sales' && c.salesRepId !== currentUser.salesRepId) return false;
    if (clientSearchQuery) {
      const q = clientSearchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.company.toLowerCase().includes(q);
    }
    return true;
  });

  const subtotal = lineItems.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);
  const totalAfterDiscount = Math.max(0, subtotal - (parseFloat(discount) || 0));
  const taxAmount = (totalAfterDiscount * (parseFloat(taxRate) || 0)) / 100;
  const grandTotal = totalAfterDiscount + taxAmount;

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), brand: 'Megatop', title: '', unit: 'قطعة', code: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
      const p = parseFloat(field === 'unitPrice' ? value : item.unitPrice) || 0;
      item.total = q * p;
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const handleSelectCatalogItem = (index, catalogItem) => {
    const updated = [...lineItems];
    const q = updated[index].quantity || 1;
    updated[index] = {
      ...updated[index],
      brand: catalogItem.brand || 'Megatop',
      title: catalogItem.item || catalogItem.title,
      unit: catalogItem.unit || 'قطعة',
      code: catalogItem.code,
      unitPrice: catalogItem.price,
      total: q * catalogItem.price
    };
    setLineItems(updated);
    setActiveItemSearchRow(null);
    setItemSearchText('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCompanyLogoUrl(event.target.result); // Base64
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!selectedClient) {
      alert('⚠️ يرجى اختيار العميل أولاً قبل حفظ عرض السعر.');
      return;
    }

    // Filter out completely empty items automatically
    const validItems = lineItems.filter(i => i.title && i.title.trim() !== '');
    if (validItems.length === 0) {
      alert('⚠️ يرجى إضافة بند واحد على الأقل وتحديد اسم البند والسعر.');
      return;
    }

    const shareToken = initialQuote?.shareToken || `quote-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    const quoteId = initialQuote?.id || `QT-${Math.floor(1000 + Math.random() * 9000)}`;

    const quoteData = {
      id: quoteId,
      shareToken: shareToken,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      clientCompany: selectedClient.company,
      salesRepId: currentUser.role === 'sales' ? currentUser.salesRepId : (selectedClient.salesRepId || currentUser.salesRepId || 'sales-1'),
      date,
      validUntil,
      status,
      companyMode,
      customCompanyName,
      companyWebsite,
      companyLogoUrl,
      showRepContact,
      items: validItems,
      subtotal,
      discount: parseFloat(discount) || 0,
      taxRate: parseFloat(taxRate) || 0,
      taxAmount,
      grandTotal,
      notes,
      updatedAt: new Date().toISOString()
    };

    onSaveQuote(quoteData);
  };

  const shareToken = initialQuote?.shareToken || 'preview-token';
  const liveLinkUrl = `${window.location.origin}/quote/${shareToken}`;

  const handleWhatsAppShare = () => {
    if (!selectedClient) return;
    const cleanPhone = selectedClient.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `أهلاً ${selectedClient.name} 👋\nإليك عرض السعر الخاص بشركتكم (${selectedClient.company}):\n\n🔗 ${liveLinkUrl}\n\nيمكنك فتح الرابط في أي وقت لمشاهدة عرض السعر وتفاصيله.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>{initialQuote ? `تعديل عرض السعر (${initialQuote.id})` : 'إنشاء عرض سعر جديد'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إعداد عرض سعر احترافي موجه رسمياً للعميل دون إظهار بيانات المندوب.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
          >
            إلغاء
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            <CheckCircle className="w-4 h-4" />
            <span>حفظ وتحديث الرابط الحي</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Client & Company Name Option */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 className="w-4 h-4" />
            <span>1. اختيار العميل وإعدادات اسم الشركة المعروضة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Autocomplete */}
            <div className="relative md:col-span-1">
              <label className="block text-slate-300 text-xs font-medium mb-1">العميل المستهدف *</label>
              {selectedClient ? (
                <div className="flex items-center justify-between bg-slate-800/90 border border-indigo-500/40 p-2.5 rounded-xl">
                  <div>
                    <div className="font-bold text-sm text-white">{selectedClient.name}</div>
                    <div className="text-xs text-emerald-400 font-mono dir-ltr text-right">{selectedClient.phone} - {selectedClient.company}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClient(null)}
                    className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                  >
                    تغيير
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  {showClientDropdown && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-700">
                      {availableClients.length > 0 ? (
                        availableClients.slice(0, 10).map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedClient(c);
                              setShowClientDropdown(false);
                            }}
                            className="p-2.5 hover:bg-indigo-600/30 cursor-pointer text-xs transition"
                          >
                            <div className="font-bold text-white">{c.name}</div>
                            <div className="text-slate-400 font-mono">{c.phone} | {c.company}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400">لا يوجد عميل بهذه البيانات</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1">تاريخ عرض السعر</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1">صالح حتى تاريخ</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Company Name Selection */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300">خيار اسم الشركة في الهيدر:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setCompanyMode('custom')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  companyMode === 'custom' || companyMode === 'my_company'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <input type="radio" checked={companyMode === 'custom' || companyMode === 'my_company'} onChange={() => {}} className="hidden" />
                <span>🏢 عرض باسم الشركة (إظهار اللوجو واسم الشركة باستمرار)</span>
              </label>

              <label
                onClick={() => setCompanyMode('hidden')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2 ${
                  companyMode === 'hidden'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <input type="radio" checked={companyMode === 'hidden'} onChange={() => {}} className="hidden" />
                <span>🚫 عرض بدون اسم شركة (بدون لوجو - إخفاء اللوجو والاسم)</span>
              </label>
            </div>

            {(companyMode === 'custom' || companyMode === 'my_company') && (
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">اسم الشركة *</label>
                  <input
                    type="text"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                    placeholder="اكتب اسم الشركة هنا..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">الموقع الإلكتروني للشركة</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-10 pl-3 py-2 text-xs text-indigo-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">شعار الشركة (اللوجو)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                      />
                      {companyLogoUrl && (
                        <img
                          src={companyLogoUrl}
                          alt="Logo Preview"
                          className="w-10 h-10 object-contain rounded border border-slate-700 bg-white p-0.5"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show/Hide Rep Contact Option */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="checkbox"
                id="showRepContact"
                checked={showRepContact}
                onChange={(e) => setShowRepContact(e.target.checked)}
                className="w-4 h-4 rounded border-slate-750 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="showRepContact" className="text-xs font-bold text-slate-350 cursor-pointer select-none">
                📞 عرض بيانات الاتصال بالمندوب (الاسم ورقم الهاتف) في صندوق الاستفسارات بالفاتورة للعميل
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>2. بنود عرض السعر (BRAND, ITEM, UNIT قطعة)</span>
            </h3>

            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة بند جديد</span>
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id || index} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                  {/* Brand */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1">BRAND الماركة</label>
                    <input
                      type="text"
                      value={item.brand || 'MEGATOP'}
                      onChange={(e) => updateLineItem(index, 'brand', e.target.value)}
                      placeholder="MEGATOP"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-bold text-indigo-300"
                    />
                  </div>

                  {/* ITEM title */}
                  <div className="md:col-span-4 relative">
                    <label className="block text-slate-400 mb-1">ITEM البند (ابحث أو اكتب بند جديد)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          updateLineItem(index, 'title', e.target.value);
                          setActiveItemSearchRow(index);
                          setItemSearchText(e.target.value);
                        }}
                        onFocus={() => {
                          setActiveItemSearchRow(index);
                          setItemSearchText(item.title);
                        }}
                        placeholder="ابحث بالحروف من الكتالوج أو اكتب بند مخصص..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                      />

                      {activeItemSearchRow === index && itemSearchText.trim() && (
                        <div className="absolute z-30 right-0 left-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-40 overflow-y-auto divide-y divide-slate-700">
                          {itemsCatalog.filter(cat =>
                            (cat.item || cat.title || '').toLowerCase().includes(itemSearchText.toLowerCase()) ||
                            (cat.brand || '').toLowerCase().includes(itemSearchText.toLowerCase()) ||
                            (cat.code || '').toLowerCase().includes(itemSearchText.toLowerCase())
                          ).map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => handleSelectCatalogItem(index, cat)}
                              className="p-2 hover:bg-emerald-600/20 cursor-pointer flex justify-between items-center text-xs"
                            >
                              <div>
                                <span className="font-bold text-white">{cat.item || cat.title}</span>
                                <span className="bg-slate-900 text-[10px] text-indigo-300 px-1.5 py-0.5 rounded ml-2">{cat.brand}</span>
                              </div>
                              <span className="font-mono text-emerald-400 font-bold">{cat.price} ج.م</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* UNIT */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1">UNIT الوحدة</label>
                    <input
                      type="text"
                      value={item.unit || 'قطعة'}
                      onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                      placeholder="قطعة"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-bold text-emerald-400 text-center"
                    />
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-1">
                    <div>
                      <label className="block text-slate-400 mb-1">الكمية</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-2 text-white font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">السعر</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-2 text-white font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Total & Delete */}
                  <div className="md:col-span-2 flex items-center justify-between gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">الإجمالي</label>
                      <div className="font-bold font-mono text-emerald-400 py-1 text-xs">
                        {(item.total || 0).toLocaleString('en-US')} ج.م
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="text-slate-500 hover:text-red-400 p-1 disabled:opacity-30 mt-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-xs max-w-sm mr-auto">
            <div className="flex justify-between text-slate-300">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-bold text-white">{subtotal.toLocaleString('en-US')} ج.م</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">خصم (ج.م):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-left font-mono text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">ضريبة القيمة المضافة (%):</span>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-left font-mono text-white"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
              <span className="text-emerald-400">الإجمالي النهائي:</span>
              <span className="font-mono text-lg text-emerald-400">{grandTotal.toLocaleString('en-US')} ج.م</span>
            </div>
          </div>
        </div>

        {/* Section 3: Notes & Share */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-indigo-300 border-b border-slate-800 pb-2">
            3. الملاحظات ومشاركة الرابط الحي
          </h3>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">الملاحظات والشروط</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-200">الرابط الحي الدائم لهذا عرض السعر:</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 truncate dir-ltr text-right max-w-md">
                {liveLinkUrl}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(liveLinkUrl);
                  alert('تم نسخ الرابط الحي للفاتورة إلى الحافظة!');
                }}
                className="bg-slate-800 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الرابط</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-600/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>مشاركة واتساب</span>
              </button>
            </div>
          </div>

          {/* Big Prominent Save Button at Bottom of Page */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-bold transition shadow-xl shadow-indigo-600/30"
            >
              <CheckCircle className="w-5 h-5" />
              <span>حفظ وتأكيد عرض السعر الان</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
