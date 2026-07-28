// MEGATOP-SENDER Storage & Service Engine with Dynamic Roles & Permissions Matrix
const STORAGE_KEYS = {
  SALES_REPS: 'megatop_sales_reps',
  USERS: 'megatop_users',
  CLIENTS: 'megatop_clients',
  ITEMS: 'megatop_items',
  QUOTATIONS: 'megatop_quotations',
  CHECKINS: 'megatop_checkins',
  ROLES_PERMISSIONS: 'megatop_roles_permissions',
  CURRENT_USER: 'megatop_current_user',
  APP_SETTINGS: 'megatop_settings'
};

export const DEFAULT_ROLES_PERMISSIONS = {
  admin: [
    'view_all_clients', 'view_own_clients', 'add_client', 'edit_client', 'delete_client',
    'export_import_excel', 'view_all_quotes', 'create_edit_quotes', 'delete_quote',
    'manage_catalog', 'edit_item', 'delete_item',
    'field_checkin', 'delete_checkin', 'receive_checkin_notifications',
    'view_financial_reports', 'manage_users_permissions'
  ],
  accountant: [
    'view_all_clients', 'view_all_quotes', 'view_financial_reports', 'export_import_excel', 'receive_checkin_notifications'
  ],
  sales: [
    'view_own_clients', 'add_client', 'edit_client', 'create_edit_quotes', 'field_checkin', 'export_import_excel'
  ],
  installer: [
    'view_own_clients', 'field_checkin'
  ],
  collector: [
    'view_own_clients', 'field_checkin'
  ],
  delivery: [
    'view_own_clients', 'field_checkin'
  ]
};

export const INITIAL_USERS = [
  { id: 'user-admin', name: 'الأدمن الرئيسي (المدير)', role: 'admin', username: 'admin', password: '123', phone: '01000000000', email: 'admin@megatop.com', active: true },
  { id: 'user-accountant', name: 'سامح فؤاد (المحاسب)', role: 'accountant', username: 'accountant', password: '123', phone: '01111111111', email: 'accounting@megatop.com', active: true },
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `sales-${i + 1}`,
    name: i === 0 ? 'أحمد محمود (كبير المبيعات)' : i === 1 ? 'سارة علي (مبيعات كبار العملاء)' : i === 2 ? 'محمد حسن' : `مسؤول مبيعات ${i + 1}`,
    role: i % 6 === 3 ? 'collector' : i % 6 === 4 ? 'delivery' : i % 6 === 5 ? 'installer' : 'sales',
    username: `user${i + 1}`,
    password: '123',
    phone: `0100${100000 + i}`,
    email: `staff${i + 1}@megatop-sender.com`,
    active: true
  }))
];

export const INITIAL_ITEMS = [
  { id: 'item-101', code: 'MGT-101', brand: 'MEGATOP', item: 'باقة إرسال الواتساب الذهبية (50,000 رسالة)', unit: 'باقة', price: 3500 },
  { id: 'item-102', code: 'MGT-102', brand: 'MEGATOP', item: 'باقة إرسال الواتساب الفضية (25,000 رسالة)', unit: 'باقة', price: 2000 },
  { id: 'item-103', code: 'MGT-103', brand: 'API Connect', item: 'ربط سيرفرات الواتساب API (WhatsApp API Integration)', unit: 'ترخيص', price: 4500 },
  { id: 'item-104', code: 'MGT-104', brand: 'GreenTick', item: 'حساب واتساب للأعمال الموثق (Green Tick Verification)', unit: 'حساب', price: 6000 },
  { id: 'item-105', code: 'MGT-105', brand: 'AI Bot', item: 'نظام الشات بوت التفاعلي الذكي (AI Chatbot)', unit: 'قطعة', price: 8000 },
  { id: 'item-106', code: 'MGT-106', brand: 'FilterPro', item: 'خدمة فلترة وتحديث أرقام الواتساب (Number Filter)', unit: 'قطعة', price: 1200 },
  { id: 'item-107', code: 'MGT-107', brand: 'Samsung', item: 'راوتر بث المحافظات وتسجيل الأرقام', unit: 'قطعة', price: 2500 },
  { id: 'item-108', code: 'MGT-108', brand: 'Cisco', item: 'سيرفر إرسال محلي متكامل', unit: 'قطعة', price: 12000 }
];

const generateInitialClients = () => {
  const companies = ['المستقبل للتجارة', 'شركة الأمل للتطوير', 'مجموعة الخليج', 'الرواد للتكنولوجيا', 'النور للاستيراد', 'شركة الإيمان', 'الأهرام للحلول', 'المصرية للخدمات', 'الفارس للاتصالات', 'النسر الذهبي'];
  const cities = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا', 'أسيوط', 'الشرقية', 'دبي', 'الرياض'];

  const clients = [];
  let idCounter = 1001;

  for (let i = 1; i <= 300; i++) {
    const salesRepId = `sales-${((i - 1) % 30) + 1}`;
    const comp = companies[i % companies.length];
    clients.push({
      id: `CLI-${idCounter++}`,
      name: `عميل ${i} - ${comp}`,
      company: comp,
      phone: `01${(i % 3 === 0 ? '0' : i % 3 === 1 ? '1' : '2')}${Math.floor(10000000 + Math.random() * 89999999)}`,
      email: `client${i}@example.com`,
      city: cities[i % cities.length],
      salesRepId: salesRepId,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000).toISOString().split('T')[0],
      notes: 'عميل مهتم بالحملات الدورية'
    });
  }
  return clients;
};

const generateInitialQuotations = (clients) => {
  if (!clients || clients.length === 0) return [];
  const q1Client = clients[0];
  const q2Client = clients[1];

  return [
    {
      id: 'QT-901',
      shareToken: 'quote-top-secret-901',
      clientId: q1Client.id,
      clientName: q1Client.name,
      clientPhone: q1Client.phone,
      clientCompany: q1Client.company,
      salesRepId: q1Client.salesRepId,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      status: 'sent',
      companyMode: 'my_company',
      customCompanyName: '',
      items: [
        { brand: 'MEGATOP', title: 'باقة إرسال الواتساب الذهبية (50,000 رسالة)', unit: 'باقة', code: 'MGT-101', quantity: 2, unitPrice: 3500, total: 7000 },
        { brand: 'API Connect', title: 'ربط سيرفرات الواتساب API', unit: 'ترخيص', code: 'MGT-103', quantity: 1, unitPrice: 4500, total: 4500 }
      ],
      subtotal: 11500,
      discount: 500,
      taxRate: 14,
      taxAmount: 1540,
      grandTotal: 12540,
      notes: 'السعر شامل التركيب والدعم الفني مجاناً لمدة 3 أشهر.'
    }
  ];
};

const generateInitialCheckIns = () => {
  const now = new Date();
  return [
    {
      id: 'CHK-1001',
      userId: 'sales-1',
      userName: 'أحمد محمود (كبير المبيعات)',
      userRole: 'sales',
      type: 'check-in',
      timestamp: new Date(now - 3600000 * 2).toISOString(),
      date: new Date(now - 3600000 * 2).toLocaleDateString('ar-EG'),
      time: new Date(now - 3600000 * 2).toLocaleTimeString('ar-EG'),
      lat: 30.0444,
      lng: 31.2357,
      address: 'مقر العميل - المستورد بالتجمع الخامس، القاهرة',
      googleMapsUrl: 'https://maps.google.com/?q=30.0444,31.2357',
      notes: 'وصول مأمورية تحصيل شيك ومناقشة التوسعات',
      clientName: 'شركة المستقبل للتجارة'
    }
  ];
};

export const getStoredData = () => {
  let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || 'null');
  if (!users) {
    users = INITIAL_USERS;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  let salesReps = users.filter(u => u.role === 'sales' || u.role === 'admin' || u.role === 'collector' || u.role === 'delivery' || u.role === 'installer' || u.role === 'accountant');

  let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || 'null');
  if (!items) {
    items = INITIAL_ITEMS;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  let clients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || 'null');
  if (!clients) {
    clients = generateInitialClients();
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }

  let quotations = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || 'null');
  if (!quotations) {
    quotations = generateInitialQuotations(clients);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  }

  let checkIns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || 'null');
  if (!checkIns) {
    checkIns = generateInitialCheckIns();
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));
  }

  let rolesPermissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES_PERMISSIONS) || 'null');
  if (!rolesPermissions) {
    rolesPermissions = DEFAULT_ROLES_PERMISSIONS;
    localStorage.setItem(STORAGE_KEYS.ROLES_PERMISSIONS, JSON.stringify(rolesPermissions));
  }

  let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  if (!currentUser) {
    currentUser = { role: 'admin', salesRepId: null, name: 'الأدمن الرئيسي (المدير)', id: 'user-admin', username: 'admin' };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }

  return { salesReps, users, clients, items, quotations, checkIns, rolesPermissions, currentUser };
};

export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const generate20kMockClients = (existingClients, currentSalesReps, targetCount = 20000) => {
  const currentCount = existingClients.length;
  if (currentCount >= targetCount) return existingClients;

  const names = ['أحمد', 'محمد', 'مصطفى', 'محمود', 'علي', 'إبراهيم', 'حسن', 'خالد', 'عمر', 'طارق', 'يوسف', 'سعيد', 'كريم', 'وليد'];
  const family = ['السيد', 'عبدالله', 'الشريف', 'منصور', 'كامل', 'سليمان', 'فاروق', 'رمضان', 'شفيق', 'حمدي'];
  const companies = ['المتحدة للحلول', 'مجموعة النجمة', 'شركة الأطلس', 'دار التكنولوجيا', 'مستقبل الأعمال', 'طريق النجاح', 'رواد الشرق'];
  const cities = ['القاهرة', 'الجيزة', 'الإسكندرية', 'طنطا', 'المنصورة', 'الزقازيق', 'أسيوط', 'سوهاج', 'دبي', 'الرياض', 'جدة'];

  const newClients = [...existingClients];
  let idCounter = existingClients.length + 1001;

  const reps = currentSalesReps && currentSalesReps.length > 0 ? currentSalesReps : INITIAL_USERS;

  for (let i = currentCount + 1; i <= targetCount; i++) {
    const sId = reps[(i - 1) % reps.length].id;
    const fn = names[i % names.length];
    const ln = family[i % family.length];
    const comp = companies[i % companies.length];
    newClients.push({
      id: `CLI-${idCounter++}`,
      name: `${fn} ${ln}`,
      company: `${comp} ${i}`,
      phone: `01${(i % 3 === 0 ? '0' : i % 3 === 1 ? '1' : '2')}${String(10000000 + (i * 77) % 89999999).padStart(8, '0')}`,
      email: `client${i}@domain.com`,
      city: cities[i % cities.length],
      salesRepId: sId,
      createdAt: new Date().toISOString().split('T')[0],
      notes: 'عميل مستورد عبر النظام'
    });
  }

  saveData(STORAGE_KEYS.CLIENTS, newClients);
  return newClients;
};
