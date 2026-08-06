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
  { id: 'user-admin', name: 'الأدمن الرئيسي (المدير)', role: 'admin', username: 'admin', password: '123', phone: '01000000000', email: 'admin@megatop.com', active: true }
];

export const INITIAL_ITEMS = [];

const generateInitialClients = () => [];
const generateInitialQuotations = () => [];
const generateInitialCheckIns = () => [];

export const getStoredData = () => {
  // Wipe legacy dummy data once if present
  if (!localStorage.getItem('megatop_clean_v2')) {
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.CHECKINS);
    localStorage.setItem('megatop_clean_v2', 'true');
  }

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
