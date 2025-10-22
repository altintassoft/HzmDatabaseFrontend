import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Settings, 
  ArrowLeft, 
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Database,
  Users,
  HardDrive,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

const DatabaseState = () => {
  const { state, dispatch } = useDatabase();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');

  // Get storage info
  const getStorageInfo = () => {
    const users = JSON.parse(localStorage.getItem('database_users') || '[]');
    const projects = JSON.parse(localStorage.getItem('all_projects') || '[]');
    const appState = JSON.parse(localStorage.getItem('database_state') || '{}');
    const pricingPlans = JSON.parse(localStorage.getItem('pricing_plans') || '[]');

    const totalSize = JSON.stringify({
      users,
      projects,
      appState,
      pricingPlans
    }).length;

    return {
      users: users.length,
      projects: projects.length,
      totalTables: projects.reduce((total: number, project: any) => total + project.tables.length, 0),
      totalFields: projects.reduce((total: number, project: any) => 
        total + project.tables.reduce((tableTotal: number, table: any) => tableTotal + table.fields.length, 0), 0
      ),
      pricingPlans: pricingPlans.length,
      storageSize: (totalSize / 1024).toFixed(2) + ' KB'
    };
  };

  const storageInfo = getStorageInfo();

  const handleExportData = async () => {
    setExportStatus('exporting');
    
    try {
      const data = {
        users: JSON.parse(localStorage.getItem('database_users') || '[]'),
        projects: JSON.parse(localStorage.getItem('all_projects') || '[]'),
        appState: JSON.parse(localStorage.getItem('database_state') || '{}'),
        pricingPlans: JSON.parse(localStorage.getItem('pricing_plans') || '[]'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('importing');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.users || !data.projects || !data.pricingPlans) {
          throw new Error('Invalid backup file format');
        }

        // Import data
        localStorage.setItem('database_users', JSON.stringify(data.users));
        localStorage.setItem('all_projects', JSON.stringify(data.projects));
        localStorage.setItem('database_state', JSON.stringify(data.appState || {}));
        localStorage.setItem('pricing_plans', JSON.stringify(data.pricingPlans));

        setImportStatus('success');
        setTimeout(() => {
          setImportStatus('idle');
          window.location.reload(); // Refresh to load new data
        }, 2000);
      } catch (error) {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (clearConfirmText === 'TÜM VERİLERİ SİL') {
      localStorage.removeItem('database_users');
      localStorage.removeItem('all_projects');
      localStorage.removeItem('database_state');
      localStorage.removeItem('pricing_plans');
      
      setShowClearModal(false);
      setClearConfirmText('');
      
      // Logout and redirect
      dispatch({ type: 'LOGOUT' });
      navigate('/');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'exporting':
      case 'importing':
        return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate('/admin')}
            className="mr-4 hover:bg-indigo-700 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center">
            <Settings size={28} className="mr-3" />
            <h1 className="text-2xl font-bold">Database - Uygulama Durumu</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Storage Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kullanıcılar</p>
                <p className="text-3xl font-bold text-blue-600">{storageInfo.users}</p>
              </div>
              <Users className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projeler</p>
                <p className="text-3xl font-bold text-green-600">{storageInfo.projects}</p>
              </div>
              <Database className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tablo</p>
                <p className="text-3xl font-bold text-purple-600">{storageInfo.totalTables}</p>
              </div>
              <FileText className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Depolama</p>
                <p className="text-3xl font-bold text-orange-600">{storageInfo.storageSize}</p>
              </div>
              <HardDrive className="text-orange-600" size={40} />
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detaylı İstatistikler</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Kullanıcı:</span>
                <span className="font-semibold">{storageInfo.users}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Proje:</span>
                <span className="font-semibold">{storageInfo.projects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Tablo:</span>
                <span className="font-semibold">{storageInfo.totalTables}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Toplam Alan:</span>
                <span className="font-semibold">{storageInfo.totalFields}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fiyat Planları:</span>
                <span className="font-semibold">{storageInfo.pricingPlans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Depolama Boyutu:</span>
                <span className="font-semibold">{storageInfo.storageSize}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mevcut Kullanıcı:</span>
                <span className="font-semibold">{state.user?.name || 'Giriş yapılmamış'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Oturum Durumu:</span>
                <span className={`font-semibold ${state.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {state.isAuthenticated ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Veri Yönetimi</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Export Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Download className="text-blue-600 mr-2" size={20} />
                <h4 className="font-semibold text-gray-800">Veri Dışa Aktarma</h4>
                {getStatusIcon(exportStatus)}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Tüm veritabanı verilerinizi JSON formatında yedekleyin.
              </p>
              <button
                onClick={handleExportData}
                disabled={exportStatus === 'exporting'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Download size={16} className="mr-2" />
                {exportStatus === 'exporting' ? 'Dışa Aktarılıyor...' : 'Verileri Dışa Aktar'}
              </button>
              {exportStatus === 'success' && (
                <p className="text-sm text-green-600 mt-2">✅ Veriler başarıyla dışa aktarıldı!</p>
              )}
              {exportStatus === 'error' && (
                <p className="text-sm text-red-600 mt-2">❌ Dışa aktarma sırasında hata oluştu!</p>
              )}
            </div>

            {/* Import Data */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Upload className="text-green-600 mr-2" size={20} />
                <h4 className="font-semibold text-gray-800">Veri İçe Aktarma</h4>
                {getStatusIcon(importStatus)}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Yedek dosyasından verileri geri yükleyin.
              </p>
              <label className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer flex items-center justify-center">
                <Upload size={16} className="mr-2" />
                {importStatus === 'importing' ? 'İçe Aktarılıyor...' : 'Dosya Seç ve İçe Aktar'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  disabled={importStatus === 'importing'}
                />
              </label>
              {importStatus === 'success' && (
                <p className="text-sm text-green-600 mt-2">✅ Veriler başarıyla içe aktarıldı!</p>
              )}
              {importStatus === 'error' && (
                <p className="text-sm text-red-600 mt-2">❌ İçe aktarma sırasında hata oluştu!</p>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-md border-l-4 border-red-500 p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold text-red-800">Tehlikeli Bölge</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Bu işlemler geri alınamaz! Lütfen dikkatli olun.
          </p>
          <button
            onClick={() => setShowClearModal(true)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Tüm Verileri Temizle
          </button>
        </div>
      </main>

      {/* Clear All Data Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Tüm Verileri Temizle</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Bu işlem <strong>TÜM VERİLERİ</strong> kalıcı olarak silecektir:
              </p>
              
              <ul className="text-sm text-red-600 mb-4 space-y-1">
                <li>• Tüm kullanıcı hesapları</li>
                <li>• Tüm projeler ve tablolar</li>
                <li>• Tüm fiyatlandırma planları</li>
                <li>• Uygulama ayarları</li>
              </ul>
              
              <p className="text-sm text-red-600 mb-4 font-semibold">
                ⚠️ Bu işlem GERİ ALINAMAZ!
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Onaylamak için <strong>"TÜM VERİLERİ SİL"</strong> yazın:
                </label>
                <input
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="TÜM VERİLERİ SİL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setClearConfirmText('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleClearAllData}
                disabled={clearConfirmText !== 'TÜM VERİLERİ SİL'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Tüm Verileri Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseState;