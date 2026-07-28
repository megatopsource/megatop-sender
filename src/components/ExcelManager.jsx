import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExcelManager({ clients, salesReps, currentUser, onImportClients }) {
  const fileInputRef = useRef(null);

  // Handle Excel/CSV File Upload & Import
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert sheet to JSON array
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);

        if (jsonRows.length === 0) {
          alert('الملف فارغ أو لا يحتوي على بيانات صالحة.');
          return;
        }

        // Map Excel rows to Client objects
        const importedClients = jsonRows.map((row, index) => {
          // Normalize column names
          const name = row['الاسم'] || row['اسم العميل'] || row['Name'] || row['client_name'] || `عميل مستورد ${index + 1}`;
          const phone = String(row['الهاتف'] || row['رقم الهاتف'] || row['Phone'] || row['phone'] || `0100000${index}`).trim();
          const company = row['الشركة'] || row['اسم الشركة'] || row['Company'] || 'غير محدد';
          const city = row['المدينة'] || row['العنوان'] || row['City'] || 'القاهرة';

          // Assign sales rep: if specified in excel, use it; otherwise use current sales rep or admin default
          let assignedRepId = currentUser.role === 'sales' ? currentUser.salesRepId : salesReps[0].id;
          if (row['السيلز'] || row['المبيعات']) {
            const repMatch = salesReps.find(r => r.name.includes(row['السيلز']) || r.name.includes(row['المبيعات']));
            if (repMatch) assignedRepId = repMatch.id;
          }

          return {
            id: `CLI-EXP-${Date.now()}-${index}`,
            name: String(name),
            company: String(company),
            phone: phone,
            email: row['الإيميل'] || row['Email'] || '',
            city: String(city),
            salesRepId: assignedRepId,
            createdAt: new Date().toISOString().split('T')[0],
            notes: row['ملاحظات'] || 'مستورد من ملف إكسيل'
          };
        });

        // Build a set of existing clients by name+phone for duplicate detection
        const existingKeys = new Set(
          clients.map(c => `${(c.name || '').toLowerCase().trim()}|${(c.phone || '').trim()}`)
        );

        const uniqueClients = [];
        let duplicatesCount = 0;

        for (const newClient of importedClients) {
          const key = `${(newClient.name || '').toLowerCase().trim()}|${(newClient.phone || '').trim()}`;
          if (existingKeys.has(key)) {
            duplicatesCount++;
          } else {
            existingKeys.add(key); // prevent duplicates within same file
            uniqueClients.push(newClient);
          }
        }

        if (uniqueClients.length > 0) {
          onImportClients(uniqueClients);
        }

        let msg = `تم استيراد ${uniqueClients.length} عميل بنجاح إلى النظام!`;
        if (duplicatesCount > 0) {
          msg += `\n⚠️ تم تجاهل ${duplicatesCount} عميل مكرر (موجود بالفعل بنفس الاسم ورقم التليفون).`;
        }
        if (uniqueClients.length === 0 && duplicatesCount > 0) {
          msg = `⚠️ جميع العملاء (${duplicatesCount}) موجودين بالفعل في النظام. لم يتم استيراد أي عميل جديد.`;
        }
        alert(msg);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error('Error parsing Excel:', err);
        alert('حدث خطأ أثناء قراءة ملف الإكسيل. تأكد من صيغة الملف (.xlsx أو .csv)');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Export Clients to Excel XLSX
  const handleExportToExcel = () => {
    if (clients.length === 0) {
      alert('لا يوجد عملاء لتصديرهم!');
      return;
    }

    // Map clients to readable excel columns in Arabic
    const excelData = clients.map(client => {
      const rep = salesReps.find(r => r.id === client.salesRepId);
      return {
        'كود العميل': client.id,
        'اسم العميل': client.name,
        'رقم الهاتف': client.phone,
        'الشركة': client.company,
        'المدينة / العنوان': client.city,
        'المسؤول (السيلز)': rep ? rep.name : 'غير محدد',
        'تاريخ التسجيل': client.createdAt,
        'ملاحظات': client.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء');

    const fileName = `MEGATOP_Clients_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Upload Excel Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
      >
        <Upload className="w-4 h-4" />
        <span>استيراد عملاء من إكسيل (XLSX/CSV)</span>
      </button>

      {/* Export Excel Button */}
      <button
        onClick={handleExportToExcel}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
      >
        <Download className="w-4 h-4" />
        <span>تصدير القائمة إلى إكسيل</span>
      </button>
    </div>
  );
}
