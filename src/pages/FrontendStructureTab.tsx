import { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Search, Filter } from 'lucide-react';
import api from '../services/api';

// ============================================================================
// TYPES
// ============================================================================

interface FileNode {
  type: 'file';
  name: string;
  path: string;
  lines: number;
  size: number;
  lastModified: string;
  status: 'ok' | 'warning' | 'critical' | 'urgent';
  message?: string;
}

interface FolderNode {
  type: 'folder';
  name: string;
  path: string;
  children: TreeNode[];
}

type TreeNode = FileNode | FolderNode;

interface StructureData {
  summary: {
    totalFiles: number;
    totalLines: number;
    totalSize: number;
    criticalFiles: number;
    warningFiles: number;
    okFiles: number;
  };
  tree: TreeNode[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'urgent': return '🔥';
    case 'critical': return '🔴';
    case 'warning': return '⚠️';
    default: return '✅';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'urgent': return 'text-orange-600 bg-orange-50';
    case 'critical': return 'text-red-600 bg-red-50';
    case 'warning': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-green-600 bg-green-50';
  }
};

// ============================================================================
// SUB COMPONENTS
// ============================================================================

interface TreeItemProps {
  node: TreeNode;
  level: number;
  searchTerm: string;
  filterStatus: string;
}

function TreeItem({ node, level, searchTerm, filterStatus }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  if (node.type === 'folder') {
    // Filter children
    const filteredChildren = node.children.filter(child => {
      const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (child.type === 'file') {
        const matchesFilter = filterStatus === 'all' || child.status === filterStatus;
        return matchesSearch && matchesFilter;
      }
      return matchesSearch;
    });

    if (filteredChildren.length === 0 && searchTerm) return null;

    return (
      <div className="mb-1">
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder size={18} className="text-purple-600" />
          <span className="font-medium text-gray-700">{node.name}/</span>
          <span className="text-xs text-gray-500">
            ({filteredChildren.filter(c => c.type === 'file').length} dosya)
          </span>
        </div>
        {isExpanded && (
          <div>
            {filteredChildren.map((child, idx) => (
              <TreeItem
                key={child.path || idx}
                node={child}
                level={level + 1}
                searchTerm={searchTerm}
                filterStatus={filterStatus}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File node
  const file = node as FileNode;
  return (
    <div
      className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors group"
      style={{ paddingLeft: `${level * 20 + 12}px` }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <File size={18} className="text-gray-400 flex-shrink-0" />
        <span className="text-gray-800 font-mono text-sm truncate">{file.name}</span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(file.status)}`}>
          {getStatusIcon(file.status)} {file.lines} satır
        </span>
        <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
        {file.message && (
          <div className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FrontendStructureTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StructureData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/database', {
        params: { type: 'project-structure', target: 'frontend' }
      });
      setData(response.data.data);
    } catch (err: any) {
      console.error('Frontend structure fetch error:', err);
      setError(err.response?.data?.message || 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Frontend yapısı taranıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">❌ {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">⚠️ Veri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-900">{data.summary.totalFiles}</div>
          <div className="text-sm text-blue-700">Toplam Dosya</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-900">{data.summary.totalLines.toLocaleString()}</div>
          <div className="text-sm text-purple-700">Toplam Satır</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{formatBytes(data.summary.totalSize)}</div>
          <div className="text-sm text-gray-700">Toplam Boyut</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-900">{data.summary.okFiles}</div>
          <div className="text-sm text-green-700">✅ İyi</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-900">{data.summary.warningFiles}</div>
          <div className="text-sm text-yellow-700">⚠️ Dikkat</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-2xl font-bold text-red-900">{data.summary.criticalFiles}</div>
          <div className="text-sm text-red-700">🔴 Kritik</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Dosya ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
          >
            <option value="all">Tüm Dosyalar</option>
            <option value="urgent">🔥 800+ satır</option>
            <option value="critical">🔴 450+ satır</option>
            <option value="warning">⚠️ 300+ satır</option>
            <option value="ok">✅ 300 altı</option>
          </select>
        </div>
      </div>

      {/* File Tree */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
        {data.tree.map((node, idx) => (
          <TreeItem
            key={node.path || idx}
            node={node}
            level={0}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
          />
        ))}
      </div>
    </div>
  );
}

