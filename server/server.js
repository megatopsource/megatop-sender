import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2000mb' }));
app.use(express.urlencoded({ limit: '2000mb', extended: true }));

// Database Storage File Path
const DB_FILE = path.join(__dirname, 'database.json');
const BACKUPS_DIR = path.join(__dirname, 'backups');

if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Initial Database Seeding Structure
const initialDatabase = {
  users: [
    { id: 'user-admin', name: 'الأدمن الرئيسي (المدير)', role: 'admin', username: 'admin', password: '123', phone: '01000000000', email: 'admin@megatop.com', active: true }
  ],
  clients: [],
  items: [
    { id: 'item-101', code: 'MGT-101', brand: 'MEGATOP', item: 'باقة إرسال الواتساب الذهبية (50,000 رسالة)', unit: 'باقة', price: 3500 },
    { id: 'item-102', code: 'MGT-102', brand: 'MEGATOP', item: 'باقة إرسال الواتساب الفضية (25,000 رسالة)', unit: 'باقة', price: 2000 }
  ],
  quotations: [],
  checkIns: [],
  rolesPermissions: {
    admin: ['view_all_clients', 'view_own_clients', 'add_client', 'edit_client', 'delete_client', 'export_import_excel', 'view_all_quotes', 'create_edit_quotes', 'delete_quote', 'manage_catalog', 'edit_item', 'delete_item', 'field_checkin', 'delete_checkin', 'view_financial_reports', 'manage_users_permissions'],
    sales: ['view_own_clients', 'add_client', 'edit_client', 'create_edit_quotes', 'field_checkin', 'export_import_excel']
  },
  lastBackupAt: new Date().toISOString()
};

// Helper: Read DB
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDatabase, null, 2), 'utf-8');
      return initialDatabase;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return initialDatabase;
  }
};

// Helper: Write DB
const writeDB = (dbData) => {
  try {
    dbData.lastUpdatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
};

// ----------------- API ENDPOINTS -----------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'MEGATOP-SENDER API' });
});

// Authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const found = db.users.find(u =>
    (u.username && u.username.toLowerCase() === (username || '').toLowerCase()) ||
    (u.email && u.email.toLowerCase() === (username || '').toLowerCase()) ||
    (u.phone && u.phone === username)
  );

  if (!found) {
    return res.status(401).json({ error: 'اسم المستخدم أو البريد الإلكتروني غير موجود' });
  }

  if (found.password && found.password !== password) {
    return res.status(401).json({ error: 'كلمة السر غير صحيحة' });
  }

  if (found.active === false) {
    return res.status(403).json({ error: 'هذا الحساب معطل من قِبل الادمن' });
  }

  res.json({ success: true, user: found });
});

// Get Entire DB
app.get('/api/db', (req, res) => {
  res.json(readDB());
});

// Save Entire DB State
app.post('/api/db', (req, res) => {
  const newDb = req.body;
  writeDB(newDb);
  res.json({ success: true, updated: new Date().toISOString() });
});

// ------------ BACKUP & RESTORE ENDPOINTS ------------

// Download Backup JSON
app.get('/api/backup/download', (req, res) => {
  const db = readDB();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `MEGATOP_DB_BACKUP_${dateStr}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(JSON.stringify(db, null, 2));
});

// Auto Create Snapshot Backup on Server
app.post('/api/backup/create', (req, res) => {
  const db = readDB();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotPath = path.join(BACKUPS_DIR, `snapshot_${dateStr}.json`);

  fs.writeFileSync(snapshotPath, JSON.stringify(db, null, 2), 'utf-8');
  db.lastBackupAt = new Date().toISOString();
  writeDB(db);

  res.json({
    success: true,
    snapshot: `snapshot_${dateStr}.json`,
    path: snapshotPath,
    time: db.lastBackupAt
  });
});

// List Available Server Snapshots
app.get('/api/backup/snapshots', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUPS_DIR);
    const snapshots = files.map(file => {
      const stats = fs.statSync(path.join(BACKUPS_DIR, file));
      return {
        filename: file,
        sizeBytes: stats.size,
        createdAt: stats.birthtime
      };
    }).sort((a, b) => b.createdAt - a.createdAt);

    res.json({ snapshots });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في قراءة ملفات الباك أب' });
  }
});

// Restore DB from Uploaded JSON
app.post('/api/backup/restore', (req, res) => {
  const restoredDb = req.body;
  if (!restoredDb || !restoredDb.users || !restoredDb.clients) {
    return res.status(400).json({ error: 'ملف الباك أب غير صالح أو تنقصه الجداول الرئيسية' });
  }

  // Backup current DB before restoring!
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const db = readDB();
  fs.writeFileSync(path.join(BACKUPS_DIR, `pre_restore_${dateStr}.json`), JSON.stringify(db, null, 2), 'utf-8');

  writeDB(restoredDb);
  res.json({ success: true, message: 'تم استرجاع النسخة الاحتياطية بنجاح' });
});

// Serve Frontend Static Build if in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Catch-all handler without path-to-regexp dependency
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`✅ MEGATOP-SENDER Server running on http://localhost:${PORT}`);
});

// Set server timeout to 30 minutes (1,800,000 ms) to support massive backup uploads and restore operations without timeouts
server.timeout = 1800000;
server.keepAliveTimeout = 60000;
