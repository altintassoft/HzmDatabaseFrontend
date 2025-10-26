import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';
import { ArrowLeft, Key, Settings, Database } from 'lucide-react';
import TablePanel from '../../components/panels/TablePanel';
import FieldPanel from '../../components/panels/FieldPanel';
import ApiKeyDisplay from '../../components/ApiKeyDisplay';

const ProjectManagement = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useDatabase();
  const [activeTab, setActiveTab] = useState<'tables' | 'api' | 'settings'>('tables');

  // Find the project and select it
  React.useEffect(() => {
    if (projectId) {
      dispatch({ type: 'SELECT_PROJECT', payload: { projectId } });
    }
  }, [projectId, dispatch]);

  const project = state.projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Proje Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Belirtilen proje mevcut değil.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Projelere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate('/projects')}
            className="mr-4 hover:bg-blue-700 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-blue-100 text-sm mt-1">{project.description}</p>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tables'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database size={16} className="inline mr-2" />
              Tablolar & Alanlar
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Key size={16} className="inline mr-2" />
              API Yönetimi
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={16} className="inline mr-2" />
              Proje Ayarları
            </button>
          </nav>
        </div>
      </div>

      <main className="container mx-auto p-4">
        {activeTab === 'tables' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TablePanel />
            <FieldPanel />
          </div>
        )}

        {activeTab === 'api' && (
          <div className="max-w-4xl mx-auto">
            <ApiKeyDisplay project={project} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Proje Ayarları</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proje Adı
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => {
                      dispatch({
                        type: 'UPDATE_PROJECT',
                        payload: { projectId: project.id, name: e.target.value }
                      });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proje Açıklaması
                  </label>
                  <textarea
                    value={project.description || ''}
                    onChange={(e) => {
                      dispatch({
                        type: 'UPDATE_PROJECT',
                        payload: { projectId: project.id, description: e.target.value }
                      });
                    }}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Proje hakkında açıklama..."
                  />
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">API Ayarları</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">API Erişimi</label>
                        <p className="text-sm text-gray-500">Projeye API üzerinden erişim izni</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={project.settings.allowApiAccess}
                        onChange={(e) => {
                          dispatch({
                            type: 'UPDATE_PROJECT',
                            payload: { 
                              projectId: project.id, 
                              settings: { allowApiAccess: e.target.checked }
                            }
                          });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Kimlik Doğrulama Gerekli</label>
                        <p className="text-sm text-gray-500">API erişimi için kimlik doğrulama zorunlu</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={project.settings.requireAuth}
                        onChange={(e) => {
                          dispatch({
                            type: 'UPDATE_PROJECT',
                            payload: { 
                              projectId: project.id, 
                              settings: { requireAuth: e.target.checked }
                            }
                          });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dakika Başına İstek Limiti
                      </label>
                      <input
                        type="number"
                        value={project.settings.maxRequestsPerMinute}
                        onChange={(e) => {
                          dispatch({
                            type: 'UPDATE_PROJECT',
                            payload: { 
                              projectId: project.id, 
                              settings: { maxRequestsPerMinute: Number(e.target.value) }
                            }
                          });
                        }}
                        min="1"
                        max="10000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Webhook Desteği</label>
                        <p className="text-sm text-gray-500">Veri değişikliklerinde webhook gönder</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={project.settings.enableWebhooks}
                        onChange={(e) => {
                          dispatch({
                            type: 'UPDATE_PROJECT',
                            payload: { 
                              projectId: project.id, 
                              settings: { enableWebhooks: e.target.checked }
                            }
                          });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {project.settings.enableWebhooks && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={project.settings.webhookUrl || ''}
                          onChange={(e) => {
                            dispatch({
                              type: 'UPDATE_PROJECT',
                              payload: { 
                                projectId: project.id, 
                                settings: { webhookUrl: e.target.value }
                              }
                            });
                          }}
                          placeholder="https://your-app.com/webhook"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Proje Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proje ID:</span>
                      <span className="font-mono text-gray-800">{project.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Oluşturulma:</span>
                      <span className="text-gray-800">{new Date(project.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tablo Sayısı:</span>
                      <span className="text-gray-800">{project.tables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam Alan:</span>
                      <span className="text-gray-800">
                        {project.tables.reduce((total, table) => total + table.fields.length, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectManagement;