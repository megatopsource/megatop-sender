import React, { useState, useRef } from 'react';
import { Database, Download, Upload, ShieldCheck, CheckCircle2, Clock, FileJson, AlertTriangle, RefreshCw, HardDrive } from 'lucide-react';

export default function BackupManager({ onExportFullBackup, onRestoreBackup }) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  // Download Backup JSON
  const handleDownloadBackup = () => {
    const backupData = onExportFullBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `MEGATOP_SYSTEM_BACKUP_${dateStr}.json`;

    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg('تم تنزيل النسخة الاحتياطية الكاملة للنظام بنجاح!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Restore Backup File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('تنبيه هام: استرجاع النسخة الاحتياطية سيقوم بتحديث الجداول الحالية بالنسخة المرفوعة. هل ترغب بالمتابعة؟')) {
      return;
    }

    setIsRestoring(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || !parsed.clients || !parsed.users) {
          alert('ملف الباك أب غير صالح أو تنقصه البيانات الأساسية.');
          setIsRestoring(false);
          return;
        }

        onRestoreBackup(parsed);
        setIsRestoring(false);
        setSuccessMsg('تم استرجاع قاعدة البيانات وتحديث النظام بالكامل بنجاح!');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err) {
        console.error('Backup Restore Error:', err);
        alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية. تأكد من صيغة الملف .json');
        setIsRestoring(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <span>مركز إدارة النسخ الاحتياطي والباك أب (System Backup Engine)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            حفظ واسترجاع كافة بيانات النظام (20,000+ عميل، عروض الأسعار، المأموريات، والمستخدمين) بضغطة زر.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>النظام مؤمن بالكامل لإنشاء وتنزيل النسخ الاحتياطية</span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Backup & Restore Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Download Backup Card */}
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">تنزيل نسخة احتياطية كاملة (System Download)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              قم بتنزيل ملف مجمع يحتوي على كل عملاءك، عروض الأسعار، سجلات المأموريات الجغرافية، البنود، وإعدادات الصلاحيات كملف `.json` آمن على جهازك.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>تحميل ملف النسخة الاحتياطية (Download Backup JSON)</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">استرجاع نسخة احتياطية (Restore Database)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              قم برفع ملف نسخة احتياطية سابقة لـ MEGATOP-SENDER لاستعادة كافة البيانات والجداول في حالة التغيير أو نقل السيرفر.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            disabled={isRestoring}
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>رفع ملف الباك أب واسترجاع البيانات (Restore JSON)</span>
          </button>
        </div>

      </div>

      {/* Production VPS Deployment Guide Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          <span>تعليمات رفع الـ Backend والـ Frontend على الـ VPS للمواعي الإنتاجية</span>
        </h3>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
          <div>1. تشغيل السيرفر الخلفي الباك إند: <span className="text-indigo-400 font-bold">node server/server.js</span></div>
          <div>2. بناء الواجهة الأمامية: <span className="text-indigo-400 font-bold">npm run build</span></div>
          <div>3. رفع المجلد السحابي وتأمين شهادة الـ SSL لتفعيل الـ GPS التلقائي للموبايلات.</div>
        </div>
      </div>
    </div>
  );
}
