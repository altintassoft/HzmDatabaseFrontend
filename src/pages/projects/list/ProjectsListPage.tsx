import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../../context/DatabaseContext';
import { 
  Database, 
  ArrowLeft, 
  Table, 
  FileText, 
  PlusCircle, 
  Eye, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Settings,
  Key,
  Copy,
  EyeOff,
  Code
} from 'lucide-react';
import { ApiKeyGenerator } from '../../../utils/apiKeyGenerator';

const ProjectsListPage = () => {
  const { state, dispatch } = useDatabase();
  const navigate = useNavigate();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({});

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      // Check if project name already exists
      const projectExists = state.projects.some(
        project => project.name.toLowerCase() === newProjectName.trim().toLowerCase()
      );
      
      if (projectExists) {
        alert('Bu isimde bir proje zaten mevcut. Lütfen farklı bir isim seçin.');
        return;
      }
      
      dispatch({ 
        type: 'ADD_PROJECT', 
        payload: { 
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined
        } 
      });
      setNewProjectName('');
      setNewProjectDescription('');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setDeletingProject(projectId);
    setDeleteConfirmName('');
  };

  const confirmDeleteProject = () => {
    if (deletingProject) {
      const projectToDelete = state.projects.find(p => p.id === deletingProject);
      if (projectToDelete && deleteConfirmName === projectToDelete.name) {
        // Remove from current user's projects
        const updatedProjects = state.projects.filter(p => p.id !== deletingProject);
        
        // Remove from all projects in localStorage
        const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
        const updatedAllProjects = allProjects.filter((p: any) => p.id !== deletingProject);
        localStorage.setItem('all_projects', JSON.stringify(updatedAllProjects));
        
        // Remove all table data for this project
        projectToDelete.tables.forEach(table => {
          localStorage.removeItem(`table_data_${table.id}`);
        });
        
        // Update state
        const newState = {
          ...state,
          projects: updatedProjects,
          selectedProject: state.selectedProject?.id === deletingProject ? null : state.selectedProject,
          selectedTable: state.selectedProject?.id === deletingProject ? null : state.selectedTable,
        };
        
        // Save updated state
        localStorage.setItem('database_state', JSON.stringify(newState));
        
        // Force page reload to reflect changes
        window.location.reload();
        
        setDeletingProject(null);
        setDeleteConfirmName('');
      }
    }
  };

  const cancelDeleteProject = () => {
    setDeletingProject(null);
    setDeleteConfirmName('');
  };

  const getTotalFields = (project: any) => {
    return project.tables.reduce((total: number, table: any) => total + table.fields.length, 0);
  };

  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    alert('API Key kopyalandı!');
  };

  const toggleApiKeyVisibility = (projectId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center">
              <Database size={28} className="mr-3" />
              <h1 className="text-2xl font-bold">Kayıtlı Projeler</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4">
          {/* Add Project Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PlusCircle size={20} className="mr-2 text-blue-600" />
              Yeni Proje Oluştur
            </h2>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proje Adı *
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Proje adını girin..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <input
                    type="text"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Proje açıklaması (isteğe bağlı)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
                >
                  <PlusCircle size={20} className="mr-2" />
                  Proje Ekle
                </button>
              </div>
            </form>
          </div>

          {/* Projects Grid */}
          {state.projects.length === 0 ? (
            <div className="text-center py-12">
              <Database className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz proje bulunmuyor</h3>
              <p className="text-gray-500 mb-4">İlk projenizi oluşturun ve veritabanı tasarımına başlayın.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.projects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                  {/* Project Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3 flex-shrink-0">
                          <Database className="text-blue-600" size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-bold text-gray-900 truncate" title={project.name}>
                            {project.name}
                          </h2>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={project.description}>
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Calendar size={14} className="mr-1" />
                            {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Projeyi Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Table className="mr-2 text-teal-500" size={16} />
                        <span className="font-medium">{project.tables.length}</span>
                        <span className="ml-1">Tablo</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FileText className="mr-2 text-purple-500" size={16} />
                        <span className="font-medium">{getTotalFields(project)}</span>
                        <span className="ml-1">Alan</span>
                      </div>
                    </div>
                  </div>

                  {/* API Key Section - FIXED OVERFLOW */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Key className="text-green-600 mr-2" size={16} />
                        <span className="text-sm font-medium text-gray-700">API Key</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleApiKeyVisibility(project.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                          title={showApiKey[project.id] ? 'Gizle' : 'Göster'}
                        >
                          {showApiKey[project.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleCopyApiKey(project.apiKey)}
                          className="p-1 text-blue-600 hover:text-blue-700 rounded transition-colors"
                          title="Kopyala"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* FIXED: API Key Container with proper overflow handling */}
                    <div className="bg-white border border-gray-200 rounded p-3 min-h-[2.5rem] flex items-center">
                      <div className="font-mono text-xs text-gray-700 break-all leading-relaxed w-full">
                        {showApiKey[project.id] ? project.apiKey : ApiKeyGenerator.maskApiKey(project.apiKey)}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  
                  {/* Tables List */}
                  <div className="p-4">
                    {project.tables.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <Table className="mx-auto mb-2 text-gray-300" size={32} />
                        <p className="text-sm">Henüz tablo eklenmemiş</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Tablolar:</h4>
                        {project.tables.slice(0, 3).map(table => (
                          <div
                            key={table.id}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <Table className="text-gray-400 mr-2 flex-shrink-0" size={14} />
                              <span className="text-sm font-medium text-gray-700 truncate" title={table.name}>
                                {table.name}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 flex-shrink-0 ml-2">
                              <FileText className="mr-1" size={12} />
                              {table.fields.length}
                            </div>
                          </div>
                        ))}
                        {project.tables.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{project.tables.length - 3} tablo daha...
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => navigate(`/projects/${project.id}/data`)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
                      >
                        <Eye size={14} className="mr-1" />
                        Veriler
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center text-sm font-medium"
                      >
                        <Settings size={14} className="mr-1" />
                        Düzenle
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to API documentation or examples
                          alert(`API Endpoint: /api/v1/projects/${project.id}\nAPI Key: ${project.apiKey}`);
                        }}
                        className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center text-sm font-medium"
                      >
                        <Code size={14} className="mr-1" />
                        API
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete Project Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Projeyi Sil</h3>
            </div>
            
            <div className="mb-6">
              {(() => {
                const projectToDelete = state.projects.find(p => p.id === deletingProject);
                return (
                  <>
                    <p className="text-gray-600 mb-4">
                      <strong>{projectToDelete?.name}</strong> projesini ve tüm tablolarını kalıcı olarak silmek istediğinizden emin misiniz?
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Silinecek proje bilgileri:</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>Proje Adı:</strong> {projectToDelete?.name}</div>
                        <div><strong>Tablo Sayısı:</strong> {projectToDelete?.tables.length}</div>
                        <div><strong>Toplam Alan:</strong> {getTotalFields(projectToDelete)}</div>
                        <div><strong>API Key:</strong> {projectToDelete ? ApiKeyGenerator.maskApiKey(projectToDelete.apiKey) : ''}</div>
                        <div><strong>Oluşturulma:</strong> {projectToDelete ? new Date(projectToDelete.createdAt).toLocaleDateString('tr-TR') : ''}</div>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 p-3 rounded-md mb-4">
                      <p className="text-sm text-red-800 font-medium mb-1">⚠️ Dikkat!</p>
                      <p className="text-sm text-red-700">
                        Bu işlem geri alınamaz! Projenin tüm tabloları, alanları, verileri ve API erişimi kalıcı olarak silinecektir.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Onaylamak için proje adını tam olarak yazın: <strong>{projectToDelete?.name}</strong>
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        placeholder={projectToDelete?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteProject}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteProject}
                disabled={(() => {
                  const projectToDelete = state.projects.find(p => p.id === deletingProject);
                  return deleteConfirmName !== projectToDelete?.name;
                })()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                <Trash2 size={16} className="mr-2" />
                Projeyi Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectsListPage;