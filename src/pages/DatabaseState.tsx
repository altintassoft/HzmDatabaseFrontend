import React, { useState, useEffect } from 'react';
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
  XCircle,
  Crown,
  Key,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

interface MasterAdminData {
  email: string;
  role: string;
  apiKey: string | null;
  apiPassword: string | null;
  hasApiKey: boolean;
  createdAt: string | null;
  lastUsedAt: string | null;
}

const DatabaseState = () => {
  const { state, dispatch } = useDatabase();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  
  // Master Admin API States
  const [masterAdminData, setMasterAdminData] = useState<MasterAdminData | null>(null);
  const [loadingMasterAdmin, setLoadingMasterAdmin] = useState(true);
  const [masterAdminError, setMasterAdminError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiPassword, setShowApiPassword] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [regeneratingPassword, setRegeneratingPassword] = useState(false);
  const [showRegenerateKeyModal, setShowRegenerateKeyModal] = useState(false);
  const [showRegeneratePasswordModal, setShowRegeneratePasswordModal] = useState(false);

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

  // Master Admin API Functions
  const fetchMasterAdminData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/master-admin`);
      const result = await response.json();
      
      if (result.success) {
        setMasterAdminData(result.data);
      } else {
        setMasterAdminError(result.error);
      }
    } catch (err) {
      console.error('Error fetching master admin data:', err);
      setMasterAdminError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingMasterAdmin(false);
    }
  };

  useEffect(() => {
    fetchMasterAdminData();
  }, []);

  useEffect(() => {
    if (!loadingMasterAdmin && masterAdminData && !masterAdminData.hasApiKey && !generating) {
      handleGenerateMasterAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMasterAdmin, masterAdminData]);

  const handleGenerateMasterAdmin = async () => {
    setGenerating(true);
    setMasterAdminError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/master-admin/generate`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        await fetchMasterAdminData();
      } else {
        setMasterAdminError(result.error);
      }
    } catch (err) {
      console.error('Error generating master admin key:', err);
      setMasterAdminError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateMasterKey = async () => {
    setRegeneratingKey(true);
    setMasterAdminError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/master-admin/regenerate`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        await fetchMasterAdminData();
        setShowRegenerateKeyModal(false);
      } else {
        setMasterAdminError(result.error);
      }
    } catch (err) {
      console.error('Error regenerating master admin key:', err);
      setMasterAdminError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRegeneratingKey(false);
    }
  };

  const handleRegenerateMasterPassword = async () => {
    setRegeneratingPassword(true);
    setMasterAdminError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/master-admin/regenerate-password`, {
        method: 'POST'
      });
      const result = await response.json();
      if (result.success) {
        setShowRegeneratePasswordModal(false);
        await fetchMasterAdminData();
      } else {
        setMasterAdminError(result.error);
      }
    } catch (err) {
      console.error('Error regenerating master admin password:', err);
      setMasterAdminError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRegeneratingPassword(false);
    }
  };

  const copyToClipboard = (text: string, type: 'key' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Hiç kullanılmadı';
    return new Date(dateString).toLocaleString('tr-TR');
  };

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

        {/* Master Admin API Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Crown className="text-purple-600" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Master Admin API</h3>
              <p className="text-sm text-gray-600">Sistem genelinde yetkili API kimlik bilgileri</p>
            </div>
          </div>

          {masterAdminError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">⚠️ Hata: {masterAdminError}</p>
            </div>
          )}

          {loadingMasterAdmin ? (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto text-purple-600 mb-3 animate-spin" size={40} />
              <p className="text-gray-600 text-sm">Master Admin bilgileri yükleniyor...</p>
            </div>
          ) : masterAdminData?.hasApiKey ? (
            <div>
              {/* Email Section */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="text-blue-600" size={18} />
                  <span className="text-sm font-semibold text-gray-700">Master Admin Email</span>
                </div>
                <p className="font-mono text-sm text-gray-900 ml-6">{masterAdminData.email}</p>
                <p className="text-xs text-gray-500 ml-6 mt-1">
                  Role: <span className="font-semibold text-purple-600">{masterAdminData.role}</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* API Key Row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">API Key</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                        title={showApiKey ? 'Gizle' : 'Göster'}
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(masterAdminData.apiKey!, 'key')}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                        title="Kopyala"
                      >
                        {copiedKey ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => setShowRegenerateKeyModal(true)}
                        disabled={regeneratingKey}
                        className="p-1.5 hover:bg-blue-100 rounded text-blue-600 disabled:opacity-50"
                        title="Yenile"
                      >
                        <RefreshCw size={16} className={regeneratingKey ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded p-3 font-mono text-sm">
                    <span className={showApiKey ? '' : 'blur-sm select-none'}>
                      {masterAdminData.apiKey}
                    </span>
                  </div>
                </div>

                {/* API Password Row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">API Password</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowApiPassword(!showApiPassword)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                        title={showApiPassword ? 'Gizle' : 'Göster'}
                      >
                        {showApiPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(masterAdminData.apiPassword!, 'password')}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                        title="Kopyala"
                      >
                        {copiedPassword ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => setShowRegeneratePasswordModal(true)}
                        disabled={regeneratingPassword}
                        className="p-1.5 hover:bg-orange-100 rounded text-orange-600 disabled:opacity-50"
                        title="Yenile"
                      >
                        <RefreshCw size={16} className={regeneratingPassword ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded p-3 font-mono text-sm">
                    <span className={showApiPassword ? '' : 'blur-sm select-none'}>
                      {masterAdminData.apiPassword}
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Shield size={12} />
                      Oluşturulma
                    </p>
                    <p className="font-mono text-xs text-gray-700">{formatDate(masterAdminData.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Key size={12} />
                      Son Kullanım
                    </p>
                    <p className="font-mono text-xs text-gray-700">{formatDate(masterAdminData.lastUsedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-purple-900 mb-2 text-sm flex items-center gap-2">
                  <Shield size={16} />
                  Master Admin Yetkisi
                </h3>
                <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
                  <li>Bu API Key sistem genelinde tam yetkiye sahiptir</li>
                  <li>Sadece Admin rolündeki kullanıcılar görebilir</li>
                  <li>Tüm tenant ve proje verilerine erişim sağlar</li>
                  <li>Çok dikkatli kullanılmalı ve paylaşılmamalıdır</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 mb-3 text-sm">Master Admin API kimlik bilgileri oluşturuluyor...</p>
              {generating && <RefreshCw className="mx-auto text-purple-600 animate-spin" size={24} />}
            </div>
          )}
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

      {/* Master Admin Confirmation Modals */}
      <ConfirmModal
        isOpen={showRegenerateKeyModal}
        onClose={() => setShowRegenerateKeyModal(false)}
        onConfirm={handleRegenerateMasterKey}
        title="Master Admin API Key Yenile"
        message="Master Admin API Key yenilenecek, ancak API Password aynı kalacak. Eski API Key artık çalışmayacak. Devam etmek istiyor musunuz?"
        confirmText="Evet, Yenile"
        cancelText="İptal"
        type="warning"
        isLoading={regeneratingKey}
      />

      <ConfirmModal
        isOpen={showRegeneratePasswordModal}
        onClose={() => setShowRegeneratePasswordModal(false)}
        onConfirm={handleRegenerateMasterPassword}
        title="Master Admin API Password Yenile"
        message="Master Admin API Password yenilenecek, ancak API Key aynı kalacak. Eski şifre artık çalışmayacak. Devam etmek istiyor musunuz?"
        confirmText="Evet, Yenile"
        cancelText="İptal"
        type="warning"
        isLoading={regeneratingPassword}
      />
    </div>
  );
};

export default DatabaseState;