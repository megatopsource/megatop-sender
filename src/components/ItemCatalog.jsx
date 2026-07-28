import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Package, Plus, Search, Tag, DollarSign, Trash2, Edit3, Upload, Download, CheckCircle, Sparkles } from 'lucide-react';

export default function ItemCatalog({ items, rolesPermissions, currentUser, onAddItem, onUpdateItem, onDeleteItem, onImportItems }) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const fileInputRef = useRef(null);

  // User Permissions check
  const userPerms = rolesPermissions[currentUser.role] || [];
  const canEditItem = currentUser.role === 'admin' || userPerms.includes('edit_item') || userPerms.includes('all');
  const canDeleteItem = currentUser.role === 'admin' || userPerms.includes('delete_item') || userPerms.includes('all');

  const [itemForm, setItemForm] = useState({
    code: '',
    brand: 'MEGATOP',
    item: '',
    unit: 'قطعة',
    price: ''
  });

  const filteredItems = items.filter(i =>
    (i.item || i.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.brand || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.code || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemForm({ code: '', brand: 'MEGATOP', item: '', unit: 'قطعة', price: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item) => {
    if (!canEditItem) {
      alert('عذراً، ليس لديك صلاحية تعديل بنود المخزون.');
      return;
    }
    setEditingItem(item);
    setItemForm({
      code: item.code || '',
      brand: item.brand || 'MEGATOP',
      item: item.item || item.title || '',
      unit: item.unit || 'قطعة',
      price: item.price || ''
    });
    setIsAddOpen(true);
  };

  const handleDelete = (item) => {
    if (!canDeleteItem) {
      alert('عذراً، ليس لديك صلاحية حذف بنود المخزون.');
      return;
    }
    if (confirm(`هل أنت تأكد من حذف البند "${item.item || item.title}"؟`)) {
      onDeleteItem(item.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemForm.item || !itemForm.price) {
      alert('يرجى إدخال اسم البند (ITEM) والسعر الافتراضي');
      return;
    }

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        code: itemForm.code.trim() || editingItem.code,
        brand: itemForm.brand.trim() || 'عام',
        item: itemForm.item.trim(),
        title: itemForm.item.trim(),
        unit: itemForm.unit.trim() || 'قطعة',
        price: parseFloat(itemForm.price) || 0
      });
      alert('تم تعديل البند بنجاح!');
    } else {
      const created = {
        id: `item-${Date.now()}`,
        code: itemForm.code.trim() || `MGT-${Math.floor(100 + Math.random() * 900)}`,
        brand: itemForm.brand.trim() || 'عام',
        item: itemForm.item.trim(),
        title: itemForm.item.trim(),
        unit: itemForm.unit.trim() || 'قطعة',
        price: parseFloat(itemForm.price) || 0
      };
      onAddItem(created);
      alert('تم إضافة البند جديد بنجاح!');
    }

    setIsAddOpen(false);
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        if (rows.length === 0) {
          alert('الملف فارغ أو لا يحتوي على بنود صالحة.');
          return;
        }

        const importedItems = rows.map((row, idx) => {
          // Log first row keys to help debug column name mismatches
          if (idx === 0) {
            console.log('📋 Excel Column Headers Found:', Object.keys(row));
          }

          // Smart column matching — tries many possible Arabic & English header variations
          const findCol = (...candidates) => {
            // First try exact match
            for (const c of candidates) {
              if (row[c] !== undefined && row[c] !== null && String(row[c]).trim() !== '') return String(row[c]).trim();
            }
            // Then try case-insensitive partial match on all keys
            const rowKeys = Object.keys(row);
            for (const c of candidates) {
              const lower = c.toLowerCase();
              for (const key of rowKeys) {
                if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
                  if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
                    return String(row[key]).trim();
                  }
                }
              }
            }
            return null;
          };

          const brand = findCol(
            'الماركة', 'العلامة التجارية', 'علامة تجارية', 'براند', 'ماركة',
            'Brand', 'BRAND', 'brand', 'Manufacturer', 'العلامة'
          ) || 'عام';

          const itemName = findCol(
            'اسم البند', 'البند', 'اسم المنتج', 'المنتج', 'الصنف', 'اسم الصنف',
            'الوصف', 'وصف المنتج', 'وصف البند', 'العنوان', 'اسم', 'المادة', 'بند',
            'التفاصيل', 'تفاصيل', 'اسم السلعة', 'السلعة', 'المنتجات', 'منتج',
            'Item', 'ITEM', 'item', 'Product', 'PRODUCT', 'product',
            'Description', 'DESCRIPTION', 'description', 'Desc', 'DESC',
            'Name', 'NAME', 'name', 'Title', 'TITLE', 'title',
            'Item Name', 'Product Name', 'Item Description'
          ) || `بند مستورد ${idx + 1}`;

          const unit = findCol(
            'الوحدة', 'وحدة', 'وحدة القياس',
            'Unit', 'UNIT', 'unit', 'UOM', 'uom'
          ) || 'قطعة';

          const rawPrice = findCol(
            'السعر', 'سعر', 'السعر الافتراضي', 'سعر الوحدة', 'سعر البيع',
            'Price', 'PRICE', 'price', 'Unit Price', 'Cost', 'COST'
          );
          const price = parseFloat(rawPrice) || 0;

          const code = findCol(
            'الكود', 'كود', 'رقم الصنف', 'رمز', 'الرمز', 'رقم المنتج', 'باركود',
            'Code', 'CODE', 'code', 'SKU', 'sku', 'Barcode', 'Part Number', 'Part No'
          ) || `MGT-IMP-${idx + 1}`;

          return {
            id: `item-excel-${Date.now()}-${idx}`,
            code: String(code),
            brand: String(brand),
            item: String(itemName),
            title: String(itemName),
            unit: String(unit),
            price: price
          };
        });

        // Filter out duplicates: skip items whose name already exists in the current catalog
        const existingNames = new Set(items.map(i => (i.item || i.title || '').toLowerCase().trim()));
        const uniqueItems = [];
        let duplicatesCount = 0;

        for (const newItem of importedItems) {
          const itemKey = (newItem.item || newItem.title || '').toLowerCase().trim();
          if (existingNames.has(itemKey)) {
            duplicatesCount++;
          } else {
            existingNames.add(itemKey); // also prevent duplicates within the same import file
            uniqueItems.push(newItem);
          }
        }

        if (uniqueItems.length > 0) {
          onImportItems(uniqueItems);
        }

        let msg = `تم استيراد ${uniqueItems.length} بند جديد إلى الكتالوج بنجاح!`;
        if (duplicatesCount > 0) {
          msg += `\n⚠️ تم تجاهل ${duplicatesCount} بند مكرر (موجود بالفعل في الكتالوج).`;
        }
        if (uniqueItems.length === 0 && duplicatesCount > 0) {
          msg = `⚠️ جميع البنود (${duplicatesCount}) موجودة بالفعل في الكتالوج. لم يتم استيراد أي بند جديد.`;
        }
        alert(msg);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error('Error importing items excel:', err);
        alert('حدث خطأ أثناء قراءة ملف إكسيل البنود.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelExport = () => {
    if (items.length === 0) {
      alert('لا توجد بنود لتصديرها');
      return;
    }

    const exportRows = items.map(i => ({
      'الكود (CODE)': i.code,
      'العلامة التجارية (BRAND)': i.brand || 'MEGATOP',
      'اسم البند (ITEM)': i.item || i.title,
      'وحدة القياس (UNIT)': i.unit || 'قطعة',
      'السعر الافتراضي (PRICE)': i.price
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'البنود والمنتجات');
    XLSX.writeFile(workbook, `MEGATOP_Items_Catalog_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Excel Tools */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>دليل بنود المخزون والخدمات ({items.length} بند)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل وتعديل البنود بحقول BRAND و ITEM و UNIT (الافتراضي: قطعة) مع التعديل والاستيراد بالإكسيل.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelImport}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد بنود من إكسيل</span>
          </button>

          <button
            onClick={handleExcelExport}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير البنود إكسيل</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بند جديد</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بـ BRAND الماركة، أو ITEM اسم البند، أو كود البند..."
          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-11 pl-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="bg-indigo-950 text-indigo-300 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded border border-indigo-500/30">
                  {item.code}
                </span>
                <span className="bg-emerald-950 text-emerald-300 font-semibold text-[11px] px-2 py-0.5 rounded border border-emerald-500/30">
                  BRAND: {item.brand || 'MEGATOP'}
                </span>
              </div>

              <h3 className="font-bold text-slate-100 text-sm">{item.item || item.title}</h3>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">UNIT:</span>
                <span className="bg-slate-900 text-slate-200 px-2 py-0.5 rounded text-xs font-bold border border-slate-700">
                  {item.unit || 'قطعة'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-emerald-400 font-bold font-mono text-base mr-2">
                  {(item.price || 0).toLocaleString('ar-EG')} <span className="text-xs text-slate-400">ج.م</span>
                </div>

                {/* Protected Edit Item Button */}
                {canEditItem && (
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="text-slate-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title="تعديل بيانات البند والسعر والوحدة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {/* Protected Delete Item Button */}
                {canDeleteItem && (
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    title="حذف البند"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>{editingItem ? `تعديل البند (${editingItem.item || editingItem.title})` : 'إضافة بند جديد إلى الكتالوج'}</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">الماركة (BRAND)</label>
                  <input
                    type="text"
                    value={itemForm.brand}
                    onChange={(e) => setItemForm({ ...itemForm, brand: e.target.value })}
                    placeholder="MEGATOP / Samsung"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">كود البند (CODE)</label>
                  <input
                    type="text"
                    value={itemForm.code}
                    onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                    placeholder="MGT-201"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">اسم البند / الخدمة (ITEM) *</label>
                <input
                  type="text"
                  required
                  value={itemForm.item}
                  onChange={(e) => setItemForm({ ...itemForm, item: e.target.value })}
                  placeholder="مثال: راوتر بث رسائل الواتساب"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">الوحدة (UNIT) * (الافتراضي قطعة)</label>
                  <input
                    type="text"
                    required
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    placeholder="قطعة / باقة / ترخيص"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">السعر الافتراضي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    placeholder="1500"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-600/30">
                  حفظ البند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
