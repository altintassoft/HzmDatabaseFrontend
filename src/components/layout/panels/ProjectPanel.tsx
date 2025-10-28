import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../../context/DatabaseContext';
import { Database, ExternalLink } from 'lucide-react';

const ProjectPanel: React.FC = () => {
  const { state, dispatch } = useDatabase();
  const navigate = useNavigate();
  
  const handleSelectProject = (projectId: string) => {
    dispatch({ type: 'SELECT_PROJECT', payload: { projectId } });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-blue-700 flex items-center">
          <Database size={20} className="mr-2" />
          Projeler
        </h2>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink size={16} className="mr-1" />
          Projeleri Göster
        </button>
      </div>
      
      <div className="panel-content">
        {state.projects.length === 0 ? (
          <p className="text-gray-500 text-sm italic text-center py-4">
            Henüz hiç proje eklenmemiş. Projeleri göster sayfasından yeni proje ekleyebilirsiniz.
          </p>
        ) : (
          <ul className="space-y-2">
            {state.projects.map((project) => (
              <li
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                className={`panel-item p-3 rounded-md cursor-pointer border border-gray-100 hover:border-blue-200 hover:bg-blue-50 ${
                  state.selectedProject?.id === project.id
                    ? 'selected bg-blue-100 border-blue-300 font-medium'
                    : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{project.name}</span>
                  <span className="text-xs text-gray-500">{project.tables.length} tablo</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectPanel;