import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Settings,
  Calendar,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Code
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { ApiKeyGenerator } from '../../utils/apiKeyGenerator';
import { Project, ApiKey } from '../../types';

interface ApiKeyDisplayProps {
  project: Project;
  className?: string;
}

const ApiKeyDisplay: React.FC<ApiKeyDisplayProps> = ({ project, className = '' }) => {
  const { dispatch } = useDatabase();
  const [showMainKey, setShowMainKey] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [showApiExamples, setShowApiExamples] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: ['read'] as ('read' | 'write' | 'delete' | 'admin')[],
    expiresAt: '',
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // You could add a toast notification here
    alert('API Key kopyalandı!');
  };

  const handleRegenerateMainKey = () => {
    if (confirm('Ana API key\'i yeniden oluşturmak istediğinizden emin misiniz? Eski key artık çalışmayacak!')) {
      dispatch({
        type: 'REGENERATE_MAIN_API_KEY',
        payload: { projectId: project.id }
      });
    }
  };

  const handleAddApiKey = () => {
    if (!newKeyData.name.trim()) {
      alert('Lütfen API key için bir isim girin.');
      return;
    }

    dispatch({
      type: 'ADD_API_KEY',
      payload: {
        projectId: project.id,
        name: newKeyData.name.trim(),
        permissions: newKeyData.permissions,
        expiresAt: newKeyData.expiresAt || undefined,
      }
    });

    setNewKeyData({
      name: '',
      permissions: ['read'],
      expiresAt: '',
    });
    setShowAddKeyModal(false);
  };

  const handleDeleteApiKey = (keyId: string) => {
    if (confirm('Bu API key\'i silmek istediğinizden emin misiniz?')) {
      dispatch({
        type: 'DELETE_API_KEY',
        payload: { projectId: project.id, keyId }
      });
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'read': return 'bg-green-100 text-green-800';
      case 'write': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'read': return <Eye size={12} />;
      case 'write': return <Settings size={12} />;
      case 'delete': return <Trash2 size={12} />;
      case 'admin': return <Shield size={12} />;
      default: return <Key size={12} />;
    }
  };

  const isKeyExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const apiExamples = ApiKeyGenerator.generateApiExamples(
    project.id, 
    project.apiKey,
    project.tables[0]?.name
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Key className="text-blue-600 mr-3" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">API Erişim Anahtarları</h3>
              <p className="text-sm text-gray-600">Proje: {project.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApiExamples(!showApiExamples)}
              className="flex items-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <Code size={16} className="mr-2" />
              API Örnekleri
            </button>
            <button
              onClick={() => setShowAddKeyModal(true)}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Yeni Key
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main API Key */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Key className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Ana API Key</h4>
                <p className="text-sm text-gray-600">Tam erişim yetkisi</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle size={12} className="mr-1" />
                Aktif
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 font-mono text-sm">
              {showMainKey ? project.apiKey : ApiKeyGenerator.maskApiKey(project.apiKey)}
            </div>
            <button
              onClick={() => setShowMainKey(!showMainKey)}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={showMainKey ? 'Gizle' : 'Göster'}
            >
              {showMainKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              onClick={() => handleCopyKey(project.apiKey)}
              className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Kopyala"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={handleRegenerateMainKey}
              className="p-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              title="Yeniden Oluştur"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['read', 'write', 'delete', 'admin'].map(permission => (
              <span key={permission} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}>
                {getPermissionIcon(permission)}
                <span className="ml-1 capitalize">{permission}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Additional API Keys */}
        {project.apiKeys && project.apiKeys.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Settings size={18} className="mr-2" />
              Ek API Anahtarları ({project.apiKeys.length})
            </h4>
            <div className="space-y-3">
              {project.apiKeys.map((apiKey) => (
                <div key={apiKey.id} className={`border rounded-lg p-4 ${isKeyExpired(apiKey.expiresAt) ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${isKeyExpired(apiKey.expiresAt) ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <Key className={isKeyExpired(apiKey.expiresAt) ? 'text-red-600' : 'text-blue-600'} size={16} />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">{apiKey.name}</h5>
                        <div className="flex items-center text-sm text-gray-600">
                          <Activity size={12} className="mr-1" />
                          {apiKey.usageCount} kullanım
                          {apiKey.lastUsed && (
                            <span className="ml-2">
                              • Son: {new Date(apiKey.lastUsed).toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isKeyExpired(apiKey.expiresAt) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Süresi Dolmuş
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {apiKey.isActive ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} className="mr-1" />
                              Pasif
                            </>
                          )}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2 font-mono text-xs">
                      {ApiKeyGenerator.maskApiKey(apiKey.key)}
                    </div>
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Kopyala"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {apiKey.permissions.map(permission => (
                      <span key={permission} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}>
                        {getPermissionIcon(permission)}
                        <span className="ml-1 capitalize">{permission}</span>
                      </span>
                    ))}
                  </div>

                  {apiKey.expiresAt && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      Bitiş: {new Date(apiKey.expiresAt).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Examples */}
        {showApiExamples && (
          <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
              <Code size={18} className="mr-2" />
              API Kullanım Örnekleri
            </h4>
            <div className="space-y-4">
              {Object.entries(apiExamples).map(([key, example]) => (
                <div key={key} className="bg-white border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-800">{example.description}</h5>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      example.method === 'GET' ? 'bg-green-100 text-green-800' :
                      example.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      example.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {example.method}
                    </span>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                    <div className="text-green-400">curl -X {example.method} \</div>
                    <div className="text-blue-400">  "{example.url}" \</div>
                    <div className="text-yellow-400">  -H "Authorization: Bearer {ApiKeyGenerator.maskApiKey(project.apiKey)}" \</div>
                    <div className="text-yellow-400">  -H "Content-Type: application/json"</div>
                    {example.body && (
                      <>
                        <div className="text-yellow-400">  -d '{JSON.stringify(example.body, null, 2).replace(/\n/g, '\n     ')}'</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <ExternalLink className="text-blue-600 mr-2" size={16} />
                <span className="text-sm text-blue-800">
                  Detaylı API dokümantasyonu için: 
                  <a href={ApiKeyGenerator.generateApiDocUrl(project.id, project.apiKey)} className="ml-1 underline hover:no-underline">
                    API Docs
                  </a>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add API Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Yeni API Key Oluştur</h3>
              <button
                onClick={() => setShowAddKeyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Adı
                </label>
                <input
                  type="text"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({...newKeyData, name: e.target.value})}
                  placeholder="Örn: Frontend App, Mobile API"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İzinler
                </label>
                <div className="space-y-2">
                  {['read', 'write', 'delete', 'admin'].map(permission => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyData.permissions.includes(permission as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyData({
                              ...newKeyData,
                              permissions: [...newKeyData.permissions, permission as any]
                            });
                          } else {
                            setNewKeyData({
                              ...newKeyData,
                              permissions: newKeyData.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize flex items-center">
                        {getPermissionIcon(permission)}
                        <span className="ml-1">{permission}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi (İsteğe Bağlı)
                </label>
                <input
                  type="date"
                  value={newKeyData.expiresAt}
                  onChange={(e) => setNewKeyData({...newKeyData, expiresAt: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddKeyModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleAddApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                API Key Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyDisplay;