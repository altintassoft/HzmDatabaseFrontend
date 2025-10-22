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
  AlertTriangle,
  Shield,
  Clock
} from 'lucide-react';

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

  // Get current user email from sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userEmail = currentUser.email || 'ozgurhzm@gmail.com';

  useEffect(() => {
    fetchApiKeyData();
  }, []);

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
    if (!confirm('API Key yenilenecek (Şifre aynı kalacak). Devam etmek istiyor musunuz?')) {
      return;
    }

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
        alert('API Key başarıyla yenilendi!');
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
    if (!confirm('API Şifresi yenilenecek (Key aynı kalacak). Devam etmek istiyor musunuz?')) {
      return;
    }

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
    if (!confirm('API kimlik bilgileri iptal edilecek ve silinecek. Devam etmek istiyor musunuz?')) {
      return;
    }

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
        await fetchApiKeyData();
        alert('API kimlik bilgileri iptal edildi.');
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Ayarları</h1>
              <p className="text-gray-600 mt-1">API kimlik bilgilerinizi yönetin</p>
            </div>
          </div>
          <Shield className="text-blue-600" size={40} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠️ Hata: {error}</p>
          </div>
        )}

        {/* Warning for new password */}
        {showWarning && newApiPassword && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-2">⚠️ ÖNEMLİ UYARI!</h3>
                <p className="text-yellow-800 mb-3">
                  Yeni API Şifreniz aşağıda gösterilmektedir. Bu şifre sadece bir kez gösterilir!
                  Lütfen güvenli bir yere kaydedin.
                </p>
                <div className="bg-white border border-yellow-300 rounded p-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className={showApiPassword ? '' : 'blur-sm select-none'}>
                      {newApiPassword}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowApiPassword(!showApiPassword)}
                        className="p-1 hover:bg-yellow-100 rounded"
                      >
                        {showApiPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(newApiPassword, 'password')}
                        className="p-1 hover:bg-yellow-100 rounded"
                      >
                        {copiedPassword ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowWarning(false);
                    setNewApiPassword(null);
                  }}
                  className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Anladım, Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Email */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">E-posta Adresi</h2>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="font-mono text-lg">{apiKeyData?.email}</p>
          </div>
        </div>

        {/* API Key Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">API Kimlik Bilgileri</h2>
          </div>

          {!apiKeyData?.hasApiKey ? (
            <div className="text-center py-8">
              <Key className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">Henüz API kimlik bilginiz yok</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
              >
                {generating ? 'Oluşturuluyor...' : '🔑 API Kimlik Bilgileri Oluştur'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Key (Kullanıcı Adı)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-3 font-mono text-sm">
                    <span className={showApiKey ? '' : 'blur-sm select-none'}>
                      {apiKeyData.apiKey}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    title={showApiKey ? 'Gizle' : 'Göster'}
                  >
                    {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKeyData.apiKey!, 'key')}
                    className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Kopyala"
                  >
                    {copiedKey ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* API Password - Not shown (already saved) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Password (Şifre)
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    🔒 Şifre güvenli bir şekilde saklanıyor. Yalnızca oluşturulduğunda gösterilir.
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Oluşturulma Tarihi</p>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <p className="font-mono text-sm">{formatDate(apiKeyData.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Son Kullanım</p>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <p className="font-mono text-sm">{formatDate(apiKeyData.lastUsedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button
                  onClick={handleRegenerateKey}
                  disabled={regeneratingKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {regeneratingKey ? 'Yenileniyor...' : '🔄 API Key Yenile'}
                </button>
                <button
                  onClick={handleRegeneratePassword}
                  disabled={regeneratingPassword}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                >
                  {regeneratingPassword ? 'Yenileniyor...' : '🔄 Şifre Yenile'}
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors ml-auto"
                >
                  {revoking ? 'İptal Ediliyor...' : '❌ Kimlik Bilgilerini İptal Et'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">ℹ️ API Kimlik Bilgileri Hakkında</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>API Key ve API Password, programatik erişim için kullanılır</li>
            <li>API Password sadece oluşturulduğunda gösterilir, lütfen güvenli bir yere kaydedin</li>
            <li>Kimlik bilgilerinizi kimseyle paylaşmayın</li>
            <li>Şüpheli aktivite durumunda hemen yenileyebilir veya iptal edebilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;

