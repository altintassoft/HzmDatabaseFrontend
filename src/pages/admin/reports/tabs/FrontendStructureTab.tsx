import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, AlertCircle } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface FileInfo {
  name: string;
  lines: number;
  status: 'good' | 'warning' | 'danger' | 'critical' | 'urgent';
  path: string;
}

interface DirectoryNode {
  name: string;
  type: 'folder' | 'file';
  files?: FileInfo[];
  children?: DirectoryNode[];
  expanded?: boolean;
}

interface FrontendStructureTabProps {
  markdownContent: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseFrontendFiles(markdown: string): FileInfo[] {
  const files: FileInfo[] = [];
  const lines = markdown.split('\n');
  
  let inFrontendSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Frontend section başlangıcı
    if (line.includes('## 🎨 FRONTEND DOSYA ANALİZİ')) {
      inFrontendSection = true;
      continue;
    }
    
    // Backend section başlarsa Frontend section biter
    if (line.includes('## ⚙️ BACKEND DOSYA ANALİZİ')) {
      inFrontendSection = false;
      continue;
    }
    
    if (!inFrontendSection) continue;
    
    // Tablo satırlarını parse et
    // Format: | 1 | `DatabaseContext.tsx` | 1342 | `Frontend/src/context/DatabaseContext.tsx` | 🚨 **ACİL MÜDAHALE GEREKLİ** |
    const match = line.match(/\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/);
    if (match) {
      const [, name, linesStr, path] = match;
      const lineCount = parseInt(linesStr, 10);
      
      let status: FileInfo['status'] = 'good';
      if (lineCount >= 900) status = 'critical';
      else if (lineCount >= 701) status = 'urgent';
      else if (lineCount >= 451) status = 'danger';
      else if (lineCount >= 301) status = 'warning';
      
      files.push({
        name,
        lines: lineCount,
        status,
        path
      });
    }
  }
  
  return files;
}

function buildDirectoryTree(files: FileInfo[], expandAll: boolean = false): DirectoryNode {
  const root: DirectoryNode = {
    name: 'Frontend',
    type: 'folder',
    children: [],
    expanded: true
  };
  
  // Expanded olması gereken path'leri topla
  const pathsToExpand = new Set<string>();
  if (expandAll) {
    files.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += (currentPath ? '/' : '') + parts[i];
        pathsToExpand.add(currentPath);
      }
    });
  }
  
  files.forEach(file => {
    // Path'i parçala: Frontend/src/context/DatabaseContext.tsx -> ['Frontend', 'src', 'context', 'DatabaseContext.tsx']
    const parts = file.path.split('/');
    let currentNode = root;
    let currentPath = parts[0];
    
    // İlk 'Frontend' kısmını atla
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i];
      currentPath += '/' + part;
      let childNode = currentNode.children?.find(c => c.name === part);
      
      if (!childNode) {
        childNode = {
          name: part,
          type: 'folder',
          children: [],
          expanded: expandAll || pathsToExpand.has(currentPath)
        };
        if (!currentNode.children) currentNode.children = [];
        currentNode.children.push(childNode);
      } else if (expandAll || pathsToExpand.has(currentPath)) {
        childNode.expanded = true;
      }
      
      currentNode = childNode;
    }
    
    // Son dosyayı ekle
    if (!currentNode.files) currentNode.files = [];
    currentNode.files.push(file);
  });
  
  return root;
}

function getStatusBadge(status: FileInfo['status'], lines: number) {
  const configs = {
    good: { color: 'text-green-700 bg-green-50 border-green-200', icon: '✅', label: 'İyi' },
    warning: { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: '⚠️', label: 'Dikkat' },
    danger: { color: 'text-orange-700 bg-orange-50 border-orange-200', icon: '🔴', label: 'Bölünmeli' },
    urgent: { color: 'text-red-700 bg-red-50 border-red-200', icon: '🔴🔴', label: 'Acil' },
    critical: { color: 'text-red-900 bg-red-100 border-red-300', icon: '🔴🔴🔴', label: 'Kritik' }
  };
  
  const config = configs[status];
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${config.color} text-sm font-medium`}>
      <span>{config.icon}</span>
      <span>{lines} satır</span>
      <span className="text-xs opacity-70">{config.label}</span>
    </div>
  );
}

// ============================================================================
// DIRECTORY NODE COMPONENT
// ============================================================================

function DirectoryNodeComponent({ node, level = 0 }: { node: DirectoryNode; level?: number }) {
  const [expanded, setExpanded] = useState(node.expanded || false);
  
  // ✅ FIX: node.expanded değişince local state'i güncelle
  useEffect(() => {
    setExpanded(node.expanded || false);
  }, [node.expanded]);
  
  const hasChildren = (node.children && node.children.length > 0) || (node.files && node.files.length > 0);
  
  return (
    <div>
      {/* Folder Header */}
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <div className="text-gray-400">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        )}
        <Folder size={18} className="text-blue-500 flex-shrink-0" />
        <span className="font-medium text-gray-700">{node.name}</span>
      </div>
      
      {/* Children */}
      {expanded && (
        <div>
          {/* Sub-folders */}
          {node.children?.map((child, idx) => (
            <DirectoryNodeComponent key={idx} node={child} level={level + 1} />
          ))}
          
          {/* Files */}
          {node.files?.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 hover:bg-blue-50 rounded-lg group"
              style={{ paddingLeft: `${(level + 1) * 24 + 12}px` }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 truncate">{file.name}</span>
              </div>
              <div className="ml-4 flex-shrink-0">
                {getStatusBadge(file.status, file.lines)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FrontendStructureTab({ markdownContent }: FrontendStructureTabProps) {
  const [filter, setFilter] = useState<FileInfo['status'] | 'all'>('all');
  
  const allFiles = parseFrontendFiles(markdownContent);
  
  // Filter files based on selected filter
  const filteredFiles = filter === 'all' 
    ? allFiles 
    : allFiles.filter(f => f.status === filter);
  
  const tree = buildDirectoryTree(filteredFiles, filter !== 'all');
  
  // Statistics (from all files, not filtered)
  const stats = {
    total: allFiles.length,
    critical: allFiles.filter(f => f.status === 'critical').length,
    urgent: allFiles.filter(f => f.status === 'urgent').length,
    danger: allFiles.filter(f => f.status === 'danger').length,
    warning: allFiles.filter(f => f.status === 'warning').length,
    good: allFiles.filter(f => f.status === 'good').length,
    totalLines: allFiles.reduce((sum, f) => sum + f.lines, 0),
    avgLines: Math.round(allFiles.reduce((sum, f) => sum + f.lines, 0) / allFiles.length)
  };
  
  if (allFiles.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Frontend Dosyası Bulunamadı</h3>
            <p className="text-sm text-yellow-700">Markdown içeriğinde Frontend dosya bilgisi yok.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Toplam Dosya</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Toplam Satır</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalLines.toLocaleString()}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Ortalama</div>
          <div className="text-2xl font-bold text-gray-900">{stats.avgLines} satır</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Kritik Dosya</div>
          <div className="text-2xl font-bold text-red-600">{stats.critical + stats.urgent + stats.danger}</div>
        </div>
      </div>
      
      {/* Status Distribution - Clickable Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Durum Dağılımı</h3>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Tümünü Göster
            </button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          {stats.critical > 0 && (
            <button
              onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filter === 'critical'
                  ? 'border-red-300 bg-red-100 text-red-900 ring-2 ring-red-300'
                  : 'border-gray-200 bg-white hover:bg-red-50 text-gray-700'
              }`}
            >
              <span className="text-red-900">🔴🔴🔴</span>
              <span className="text-sm font-medium">Kritik: <strong>{stats.critical}</strong></span>
            </button>
          )}
          {stats.urgent > 0 && (
            <button
              onClick={() => setFilter(filter === 'urgent' ? 'all' : 'urgent')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filter === 'urgent'
                  ? 'border-red-200 bg-red-50 text-red-700 ring-2 ring-red-200'
                  : 'border-gray-200 bg-white hover:bg-red-50 text-gray-700'
              }`}
            >
              <span className="text-red-700">🔴🔴</span>
              <span className="text-sm font-medium">Acil: <strong>{stats.urgent}</strong></span>
            </button>
          )}
          {stats.danger > 0 && (
            <button
              onClick={() => setFilter(filter === 'danger' ? 'all' : 'danger')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filter === 'danger'
                  ? 'border-orange-200 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                  : 'border-gray-200 bg-white hover:bg-orange-50 text-gray-700'
              }`}
            >
              <span className="text-orange-600">🔴</span>
              <span className="text-sm font-medium">Bölünmeli: <strong>{stats.danger}</strong></span>
            </button>
          )}
          {stats.warning > 0 && (
            <button
              onClick={() => setFilter(filter === 'warning' ? 'all' : 'warning')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filter === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-700 ring-2 ring-yellow-200'
                  : 'border-gray-200 bg-white hover:bg-yellow-50 text-gray-700'
              }`}
            >
              <span className="text-yellow-600">⚠️</span>
              <span className="text-sm font-medium">Dikkat: <strong>{stats.warning}</strong></span>
            </button>
          )}
          {stats.good > 0 && (
            <button
              onClick={() => setFilter(filter === 'good' ? 'all' : 'good')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filter === 'good'
                  ? 'border-green-200 bg-green-50 text-green-700 ring-2 ring-green-200'
                  : 'border-gray-200 bg-white hover:bg-green-50 text-gray-700'
              }`}
            >
              <span className="text-green-600">✅</span>
              <span className="text-sm font-medium">İyi: <strong>{stats.good}</strong></span>
            </button>
          )}
        </div>
      </div>
      
      {/* Directory Tree */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Dosya Yapısı</h3>
        <div className="space-y-1">
          <DirectoryNodeComponent node={tree} level={0} />
        </div>
      </div>
    </div>
  );
}

