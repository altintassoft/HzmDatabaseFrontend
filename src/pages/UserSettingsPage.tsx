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
  Clock,
  Settings as SettingsIcon
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

interface ApiKeyData {
  email: string;
  apiKey: string | null;
  hasApiKey: boolean;
  createdAt: string | null;
  lastUsedAt: string | null;
}

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New API credentials (shown once after generation)
  const [newApiPassword, setNewApiPassword] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  
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
  const [revoking, setRevoking] = useState(false);
  
  // Modal states
  const [showRegenerateKeyModal, setShowRegenerateKeyModal] = useState(false);
  const [showRegeneratePasswordModal, setShowRegeneratePasswordModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  // Get current user email from sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userEmail = currentUser.email || 'ozgurhzm@gmail.com';

  useEffect(() => {
    fetchApiKeyData();
  }, []);

  // Auto-generate API key if user doesn't have one
  useEffect(() => {
    if (apiKeyData && !apiKeyData.hasApiKey && !generating && !newApiPassword) {
      // Automatically generate API credentials on first load
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeyData?.hasApiKey]);

  const fetchApiKeyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/me?email=${userEmail}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch API key data');
      }
      
      const result = await response.json();
      if (result.success) {
        setApiKeyData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching API key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm('Yeni API kimlik bilgileri oluşturulacak. Devam etmek istiyor musunuz?')) {
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/generate?email=${userEmail}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewApiPassword(result.data.apiPassword);
        setShowWarning(true);
        await fetchApiKeyData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error generating API key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateKey = async () => {
    setRegeneratingKey(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/regenerate?email=${userEmail}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchApiKeyData();
        setShowRegenerateKeyModal(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error regenerating API key:', err);
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
      const response = await fetch(`${API_URL}/api-keys/regenerate-password?email=${userEmail}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewApiPassword(result.data.apiPassword);
        setShowWarning(true);
        setShowRegeneratePasswordModal(false);
        await fetchApiKeyData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error regenerating password:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRegeneratingPassword(false);
    }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/api-keys/revoke?email=${userEmail}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNewApiPassword(null);
        setShowWarning(false);
        setShowRevokeModal(false);
        await fetchApiKeyData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error revoking API key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRevoking(false);
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
            <p className="text-gray-600 font-semibold">Ayarlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Ayarları</h1>
              <p className="text-sm text-gray-600">Programatik erişim için API kimlik bilgileri</p>
            </div>
          </div>
          <Shield className="text-blue-600" size={32} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠️ Hata: {error}</p>
          </div>
        )}

        {/* Modal for new password (shown when password regenerated) */}
        {showWarning && newApiPassword && (
          <ConfirmModal
            isOpen={true}
            onClose={() => {
              setShowWarning(false);
              setNewApiPassword(null);
            }}
            onConfirm={() => {
              setShowWarning(false);
              setNewApiPassword(null);
            }}
            title="Yeni API Şifreniz"
            message=""
            confirmText="Kaydettim, Kapat"
            type="warning"
          >
            <div className="my-4">
              <p className="text-yellow-800 mb-3 text-sm">
                ⚠️ Bu şifre sadece bir kez gösterilir! Lütfen güvenli bir yere kaydedin.
              </p>
              <div className="bg-white border-2 border-yellow-300 rounded p-3 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className={showApiPassword ? '' : 'blur-sm select-none'}>
                    {newApiPassword}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowApiPassword(!showApiPassword)}
                      className="p-1.5 hover:bg-yellow-100 rounded"
                    >
                      {showApiPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(newApiPassword, 'password')}
                      className="p-1.5 hover:bg-yellow-100 rounded"
                    >
                      {copiedPassword ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ConfirmModal>
        )}

        {/* Compact API Settings Card */}
        <div className="bg-white rounded-lg shadow-md p-5">
          {/* Email Section */}
          <div className="mb-5 pb-5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="text-blue-600" size={18} />
                <span className="text-sm font-semibold text-gray-700">E-posta</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Değiştir
              </button>
            </div>
            <p className="font-mono text-sm text-gray-900 mt-2">{apiKeyData?.email}</p>
          </div>

          {/* API Credentials */}
          {apiKeyData?.hasApiKey ? (
            <div className="space-y-4">
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
                      onClick={() => copyToClipboard(apiKeyData.apiKey!, 'key')}
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
                <div className="bg-gray-50 border border-gray-300 rounded p-2 font-mono text-xs">
                  <span className={showApiKey ? '' : 'blur-sm select-none'}>
                    {apiKeyData.apiKey}
                  </span>
                </div>
              </div>

              {/* API Password Row */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">API Password</label>
                  <button
                    onClick={() => setShowRegeneratePasswordModal(true)}
                    disabled={regeneratingPassword}
                    className="p-1.5 hover:bg-orange-100 rounded text-orange-600 disabled:opacity-50"
                    title="Yenile"
                  >
                    <RefreshCw size={16} className={regeneratingPassword ? 'animate-spin' : ''} />
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded p-2 text-xs text-gray-600">
                  🔒 Güvenli saklanıyor
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Oluşturulma</p>
                  <p className="font-mono text-xs text-gray-700">{formatDate(apiKeyData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Son Kullanım</p>
                  <p className="font-mono text-xs text-gray-700">{formatDate(apiKeyData.lastUsedAt)}</p>
                </div>
              </div>

              {/* Revoke Button */}
              <button
                onClick={() => setShowRevokeModal(true)}
                disabled={revoking}
                className="w-full mt-3 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                ❌ API Erişimini İptal Et
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Key className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 mb-3 text-sm">API kimlik bilgileri oluşturuluyor...</p>
              {generating && <RefreshCw className="mx-auto text-blue-600 animate-spin" size={24} />}
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showRegenerateKeyModal}
        onClose={() => setShowRegenerateKeyModal(false)}
        onConfirm={handleRegenerateKey}
        title="API Key Yenile"
        message="API Key yenilenecek, ancak API Password aynı kalacak. Eski API Key artık çalışmayacak. Devam etmek istiyor musunuz?"
        confirmText="Evet, Yenile"
        cancelText="İptal"
        type="warning"
        isLoading={regeneratingKey}
      />

      <ConfirmModal
        isOpen={showRegeneratePasswordModal}
        onClose={() => setShowRegeneratePasswordModal(false)}
        onConfirm={handleRegeneratePassword}
        title="API Password Yenile"
        message="API Password yenilenecek, ancak API Key aynı kalacak. Eski şifre artık çalışmayacak. Yeni şifre sadece bir kez gösterilecek! Devam etmek istiyor musunuz?"
        confirmText="Evet, Yenile"
        cancelText="İptal"
        type="warning"
        isLoading={regeneratingPassword}
      />

      <ConfirmModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onConfirm={handleRevoke}
        title="API Erişimini İptal Et"
        message="Tüm API kimlik bilgileriniz silinecek ve programatik erişim tamamen kapatılacak. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?"
        confirmText="Evet, İptal Et"
        cancelText="Vazgeç"
        type="danger"
        isLoading={revoking}
      />
    </div>
  );
};

export default UserSettingsPage;

