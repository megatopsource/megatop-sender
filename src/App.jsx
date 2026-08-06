import React, { useState, useEffect } from 'react';
import {
  getStoredData,
  saveData,
  generate20kMockClients
} from './services/storage';

import Sidebar from './components/Sidebar';
import RoleSwitcherBar from './components/RoleSwitcherBar';
import LoginScreen from './components/LoginScreen';
import ClientsManager from './components/ClientsManager';
import ItemCatalog from './components/ItemCatalog';
import QuotationBuilder from './components/QuotationBuilder';
import QuotationsList from './components/QuotationsList';
import ClientLiveView from './components/ClientLiveView';
import AdminDashboard from './components/AdminDashboard';
import UsersManager from './components/UsersManager';
import CheckInTracker from './components/CheckInTracker';
import PermissionsMatrix from './components/PermissionsMatrix';
import ClientHistoryModal from './components/ClientHistoryModal';
import BackupManager from './components/BackupManager';

export default function App() {
  // Application Storage State
  const [data, setData] = useState(() => getStoredData());
  const { salesReps, users, clients, items, quotations, checkIns, rolesPermissions, currentUser } = data;

  // App-wide dark mode / light mode state
  const [isAppDarkMode, setIsAppDarkMode] = useState(() => {
    return localStorage.getItem('megatop_app_dark_mode') !== 'false';
  });

  const toggleAppDarkMode = () => {
    setIsAppDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('megatop_app_dark_mode', String(next));
      return next;
    });
  };

  // Real-time Notifications State
  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem('megatop_notifications') || '[]');
  });

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Active Screen
  const [activeTab, setActiveTab] = useState('clients');
  const [editingQuote, setEditingQuote] = useState(null);
  const [selectedQuoteClient, setSelectedQuoteClient] = useState(null);
  const [activeLiveQuote, setActiveLiveQuote] = useState(null);
  const [profileClient, setProfileClient] = useState(null);

  const assignedClients = clients.filter(c => c.salesRepId === (currentUser.salesRepId || currentUser.id));

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/quote/')) {
      const token = path.replace('/quote/', '');
      const found = quotations.find(q => q.shareToken === token);
      if (found) {
        setActiveLiveQuote(found);
        setActiveTab('live-view');
      }
    }
  }, [quotations]);

  // Handle Adding New Real-time Check-In Notification
  const handleAddCheckIn = (newLog) => {
    updateCheckIns([newLog, ...checkIns]);

    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      type: newLog.type,
      userName: newLog.userName,
      userRole: newLog.userRole || 'ميداني',
      clientName: newLog.clientName,
      region: newLog.region,
      notes: newLog.notes,
      time: newLog.time,
      date: newLog.date,
      googleMapsUrl: newLog.googleMapsUrl,
      read: false
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveData('megatop_notifications', updatedNotifs);

    if ('Notification' in window && Notification.permission === 'granted') {
      const actionText = newLog.type === 'check-in' ? 'تسجيل دخول (Check-In)' : 'تسجيل خروج (Check-Out)';
      new Notification(`🚨 مأمورية ميدانية جديدة - ${newLog.userName}`, {
        body: `${actionText} في ${newLog.clientName} (${newLog.region}) - الساعة ${newLog.time}`,
        icon: '/favicon.svg'
      });
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    saveData('megatop_notifications', []);
  };

  const handleMarkNotificationsAsRead = () => {
    const readList = notifications.map(n => ({ ...n, read: true }));
    setNotifications(readList);
    saveData('megatop_notifications', readList);
  };

  const handleLoginSuccess = (user) => {
    handleSwitchRole({
      role: user.role,
      salesRepId: user.id,
      name: user.name,
      id: user.id,
      username: user.username
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleExportFullBackup = () => {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      users,
      clients,
      items,
      quotations,
      checkIns,
      rolesPermissions
    };
  };

  const handleRestoreBackup = (restoredDb) => {
    if (restoredDb.users) updateUsers(restoredDb.users);
    if (restoredDb.clients) updateClients(restoredDb.clients);
    if (restoredDb.items) updateItems(restoredDb.items);
    if (restoredDb.quotations) updateQuotations(restoredDb.quotations);
    if (restoredDb.checkIns) updateCheckIns(restoredDb.checkIns);
    if (restoredDb.rolesPermissions) updateRolesPermissions(restoredDb.rolesPermissions);
  };

  const updateUsers = (newUsers) => {
    saveData('megatop_users', newUsers);
    setData(prev => ({
      ...prev,
      users: newUsers,
      salesReps: newUsers.filter(u => u.role === 'sales' || u.role === 'admin' || u.role === 'collector' || u.role === 'delivery' || u.role === 'installer' || u.role === 'accountant')
    }));
  };

  const updateClients = (newClients) => {
    saveData('megatop_clients', newClients);
    setData(prev => ({ ...prev, clients: newClients }));
  };

  const updateItems = (newItems) => {
    saveData('megatop_items', newItems);
    setData(prev => ({ ...prev, items: newItems }));
  };

  const updateQuotations = (newQuotations) => {
    saveData('megatop_quotations', newQuotations);
    setData(prev => ({ ...prev, quotations: newQuotations }));
  };

  const updateCheckIns = (newCheckIns) => {
    saveData('megatop_checkins', newCheckIns);
    setData(prev => ({ ...prev, checkIns: newCheckIns }));
  };

  const updateRolesPermissions = (newPermissions) => {
    saveData('megatop_roles_permissions', newPermissions);
    setData(prev => ({ ...prev, rolesPermissions: newPermissions }));
  };

  const handleSwitchRole = (newRoleUser) => {
    saveData('megatop_current_user', newRoleUser);
    setData(prev => ({ ...prev, currentUser: newRoleUser }));
  };

  const handleGenerate20k = () => {
    const expanded = generate20kMockClients(clients, salesReps);
    setData(prev => ({ ...prev, clients: expanded }));
    alert(`تم توليد واختبار 20,000 عميل بنجاح!`);
  };

  const handleAddNoteToClient = (clientId, noteObj) => {
    const updatedClients = clients.map(c => {
      if (c.id === clientId) {
        const existingNotes = c.timelineNotes || [];
        return {
          ...c,
          timelineNotes: [noteObj, ...existingNotes]
        };
      }
      return c;
    });

    updateClients(updatedClients);
    const updatedCurrent = updatedClients.find(c => c.id === clientId);
    if (updatedCurrent) setProfileClient(updatedCurrent);
  };

  const handleAddUser = (user) => {
    updateUsers([...users, user]);
  };

  const handleUpdateUser = (user) => {
    const updated = users.map(u => u.id === user.id ? user : u);
    updateUsers(updated);
  };

  const handleDeleteUser = (userId) => {
    updateUsers(users.filter(u => u.id !== userId));
  };

  const handleAddClient = (client) => {
    updateClients([client, ...clients]);
  };

  const handleUpdateClient = (client) => {
    const updated = clients.map(c => c.id === client.id ? client : c);
    updateClients(updated);
  };

  const handleDeleteClient = (clientId) => {
    updateClients(clients.filter(c => c.id !== clientId));
  };

  const handleImportClients = (importedList) => {
    updateClients([...importedList, ...clients]);
  };

  const handleCreateQuoteForClient = (client) => {
    setSelectedQuoteClient(client);
    setEditingQuote(null);
    setActiveTab('create-quote');
  };

  const handleAddItem = (item) => {
    updateItems([...items, item]);
  };

  const handleUpdateItem = (item) => {
    const updated = items.map(i => i.id === item.id ? item : i);
    updateItems(updated);
  };

  const handleDeleteItem = (itemId) => {
    updateItems(items.filter(i => i.id !== itemId));
  };

  const handleImportItems = (importedItems) => {
    updateItems([...importedItems, ...items]);
  };

  const handleSaveQuote = (quoteData) => {
    const existingIndex = quotations.findIndex(q => q.id === quoteData.id);
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...quotations];
      updatedList[existingIndex] = quoteData;
    } else {
      updatedList = [quoteData, ...quotations];
    }

    updateQuotations(updatedList);
    setEditingQuote(null);
    setSelectedQuoteClient(null);
    setActiveLiveQuote(quoteData);
    setActiveTab('live-view');
    alert('✅ تم حفظ عرض السعر وتحديث الرابط الحي بنجاح!\nجاري فتح المعاينة الحية فوراً...');
  };

  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
    setSelectedQuoteClient(null);
    setActiveTab('edit-quote');
  };

  const handleOpenLiveView = (quote) => {
    setActiveLiveQuote(quote);
    setActiveTab('live-view');
  };

  const handleDeleteCheckIn = (checkInId) => {
    updateCheckIns(checkIns.filter(c => c.id !== checkInId));
  };

  if (!isLoggedIn) {
    return <LoginScreen users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  if (activeTab === 'live-view') {
    return (
      <ClientLiveView
        quotation={activeLiveQuote}
        salesReps={salesReps}
        onBackToDashboard={() => setActiveTab('quotations')}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white dir-rtl transition-colors duration-300 ${
      isAppDarkMode ? 'bg-slate-950 text-slate-100' : 'light-theme'
    }`} dir="rtl">
      <RoleSwitcherBar
        currentUser={currentUser}
        salesReps={salesReps}
        rolesPermissions={rolesPermissions}
        onSwitchRole={handleSwitchRole}
        totalClientsCount={clients.length}
        onGenerate20k={handleGenerate20k}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        isAppDarkMode={isAppDarkMode}
        onToggleAppDarkMode={toggleAppDarkMode}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          totalClientsCount={clients.length}
          assignedClientsCount={assignedClients.length}
          quotationsCount={quotations.length}
          itemsCount={items.length}
          checkInsCount={checkIns.length}
          onLogout={handleLogout}
        />

        <main className="flex-1 lg:mr-72 p-4 sm:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'clients' && (
            <ClientsManager
              clients={clients}
              salesReps={salesReps}
              currentUser={currentUser}
              quotations={quotations}
              rolesPermissions={rolesPermissions}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onImportClients={handleImportClients}
              onCreateQuoteForClient={handleCreateQuoteForClient}
              onViewClientProfile={(client) => setProfileClient(client)}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationsList
              quotations={quotations}
              clients={clients}
              salesReps={salesReps}
              currentUser={currentUser}
              onNewQuote={() => {
                setSelectedQuoteClient(null);
                setEditingQuote(null);
                setActiveTab('create-quote');
              }}
              onEditQuote={handleEditQuote}
              onOpenLiveView={handleOpenLiveView}
            />
          )}

          {(activeTab === 'create-quote' || activeTab === 'edit-quote') && (
            <QuotationBuilder
              initialQuote={editingQuote}
              initialClient={selectedQuoteClient}
              clients={clients}
              itemsCatalog={items}
              currentUser={currentUser}
              salesReps={salesReps}
              onSaveQuote={handleSaveQuote}
              onOpenLiveView={handleOpenLiveView}
              onCancel={() => setActiveTab('quotations')}
            />
          )}

          {activeTab === 'catalog' && (
            <ItemCatalog
              items={items}
              rolesPermissions={rolesPermissions}
              currentUser={currentUser}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onImportItems={handleImportItems}
            />
          )}

          {activeTab === 'checkins' && (
            <CheckInTracker
              checkIns={checkIns}
              currentUser={currentUser}
              users={users}
              clients={clients}
              rolesPermissions={rolesPermissions}
              onAddCheckIn={handleAddCheckIn}
              onDeleteCheckIn={handleDeleteCheckIn}
            />
          )}

          {activeTab === 'backup' && currentUser.role === 'admin' && (
            <BackupManager
              onExportFullBackup={handleExportFullBackup}
              onRestoreBackup={handleRestoreBackup}
            />
          )}

          {activeTab === 'permissions' && currentUser.role === 'admin' && (
            <PermissionsMatrix
              rolesPermissions={rolesPermissions}
              onSavePermissions={updateRolesPermissions}
            />
          )}

          {activeTab === 'users' && currentUser.role === 'admin' && (
            <UsersManager
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'dashboard' && currentUser.role === 'admin' && (
            <AdminDashboard
              salesReps={salesReps}
              clients={clients}
              quotations={quotations}
              onSelectRepFilter={() => setActiveTab('clients')}
            />
          )}
        </main>
      </div>

      {profileClient && (
        <ClientHistoryModal
          client={profileClient}
          salesReps={salesReps}
          quotations={quotations}
          checkIns={checkIns}
          onClose={() => setProfileClient(null)}
          onOpenLiveView={handleOpenLiveView}
          onAddNoteToClient={handleAddNoteToClient}
        />
      )}
    </div>
  );
}
