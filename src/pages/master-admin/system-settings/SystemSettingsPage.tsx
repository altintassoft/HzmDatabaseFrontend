import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Key, 
  Mail, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Shield,
  Settings as SettingsIcon,
  Crown,
  DollarSign
} from 'lucide-react';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import CurrencySelector from '../../../components/shared/CurrencySelector';
import api from '../../../services/api';

interface MasterAdminData {
  email: string;
  role: string;
  apiKey: string | null;
  apiPassword: string | null;
  hasApiKey: boolean;
  createdAt: string | null;
  lastUsedAt: string | null;
}

const SystemSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [masterAdminData, setMasterAdminData] = useState<MasterAdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Copy states
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  
  // Show/hide states
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiPassword, setShowApiPassword] = useState(false);

  // Action loading states
  const [generating, setGenerating] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [regeneratingPassword, setRegeneratingPassword] = useState(false);
  
  // Modal states
  const [showRegenerateKeyModal, setShowRegenerateKeyModal] = useState(false);
  const [showRegeneratePasswordModal, setShowRegeneratePasswordModal] = useState(false);

  // Currency states
  const [tenantCurrency, setTenantCurrency] = useState('TRY');
  const [savingCurrency, setSavingCurrency] = useState(false);

  // Fetch Master Admin API Key data
  const fetchMasterAdminData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/master-admin`);
      
      const result = await response.json();
      
      if (result.success) {
        setMasterAdminData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching master admin data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterAdminData();
  }, []);

  // Auto-generate if no API key exists
  useEffect(() => {
    if (!loading && masterAdminData && !masterAdminData.hasApiKey && !generating) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, masterAdminData]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/master-admin/generate`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchMasterAdminData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error generating master admin key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    try {
      setSavingCurrency(true);
      setError(null);

      const response = await api.put(ENDPOINTS.ADMIN.TENANT_SETTINGS, {
        default_currency: newCurrency
      });

      if (response.success) {
        setTenantCurrency(newCurrency);
        alert('✅ Para birimi güncellendi!');
      } else {
        setError(response.error || 'Para birimi güncellenemedi');
      }
    } catch (err: any) {
      console.error('Failed to update currency:', err);
      setError(err.message || 'Para birimi güncellenemedi');
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleRegenerateKey = async () => {
    setRegeneratingKey(true);
    setError(null);
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
        setError(result.error);
      }
    } catch (err) {
      console.error('Error regenerating master admin key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRegeneratingKey(false);
    }
  };

  const handleRegeneratePassword = async () => {
    setRegeneratingPassword(true);
    setError(null);
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
        setError(result.error);
      }
    } catch (err) {
      console.error('Error regenerating master admin password:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Geri
              </button>
              <div className="flex items-center space-x-3">
                <SettingsIcon className="text-purple-600" size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Sistem Ayarları</h1>
                  <p className="text-sm text-gray-600">Master Admin API Yönetimi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠️ Hata: {error}</p>
          </div>
        )}

        {/* Master Admin API Settings Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Crown className="text-purple-600" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Master Admin API</h2>
              <p className="text-sm text-gray-600">Sistem genelinde yetkili API kimlik bilgileri</p>
            </div>
          </div>

          {/* Email Section */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="text-blue-600" size={18} />
              <span className="text-sm font-semibold text-gray-700">Master Admin Email</span>
            </div>
            <p className="font-mono text-sm text-gray-900 ml-6">
              {masterAdminData?.email || 'ozgurhzm@hzmsoft.com'}
            </p>
            <p className="text-xs text-gray-500 ml-6 mt-1">
              Role: <span className="font-semibold text-purple-600">{masterAdminData?.role || 'master_admin'}</span>
            </p>
          </div>

          {/* API Credentials */}
          {masterAdminData?.hasApiKey ? (
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
          ) : (
            <div className="text-center py-8">
              <Crown className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 mb-3 text-sm">Master Admin API kimlik bilgileri oluşturuluyor...</p>
              {generating && <RefreshCw className="mx-auto text-purple-600 animate-spin" size={24} />}
            </div>
          )}

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

        {/* Tenant Currency Settings Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Tenant Para Birimi</h2>
              <p className="text-sm text-gray-600">Varsayılan para birimi ayarları (fiyatlandırma için)</p>
            </div>
          </div>

          <div className="space-y-4">
            <CurrencySelector
              value={tenantCurrency}
              onChange={handleCurrencyChange}
              disabled={savingCurrency}
            />

            {savingCurrency && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw size={16} className="animate-spin" />
                <span>Kaydediliyor...</span>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                <DollarSign size={16} />
                Para Birimi Kullanımı
              </h3>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Tenant'ın varsayılan para birimi (fiyatlandırma sayfası)</li>
                <li>Proje fiyatları bu para birimine çevrilir</li>
                <li>Invoice'lar bu para biriminde oluşturulur</li>
                <li>Dashboard'da bu sembol gösterilir (₺, $, €, £)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showRegenerateKeyModal}
        onClose={() => setShowRegenerateKeyModal(false)}
        onConfirm={handleRegenerateKey}
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
        onConfirm={handleRegeneratePassword}
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

export default SystemSettingsPage;

