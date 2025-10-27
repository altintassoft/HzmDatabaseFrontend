import { useState } from 'react';
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

function buildDirectoryTree(files: FileInfo[]): DirectoryNode {
  const root: DirectoryNode = {
    name: 'Frontend',
    type: 'folder',
    children: [],
    expanded: true
  };
  
  files.forEach(file => {
    // Path'i parçala: Frontend/src/context/DatabaseContext.tsx -> ['Frontend', 'src', 'context', 'DatabaseContext.tsx']
    const parts = file.path.split('/');
    let currentNode = root;
    
    // İlk 'Frontend' kısmını atla
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i];
      let childNode = currentNode.children?.find(c => c.name === part);
      
      if (!childNode) {
        childNode = {
          name: part,
          type: 'folder',
          children: [],
          expanded: false
        };
        if (!currentNode.children) currentNode.children = [];
        currentNode.children.push(childNode);
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
  const files = parseFrontendFiles(markdownContent);
  const tree = buildDirectoryTree(files);
  
  // Statistics
  const stats = {
    total: files.length,
    critical: files.filter(f => f.status === 'critical').length,
    urgent: files.filter(f => f.status === 'urgent').length,
    danger: files.filter(f => f.status === 'danger').length,
    warning: files.filter(f => f.status === 'warning').length,
    good: files.filter(f => f.status === 'good').length,
    totalLines: files.reduce((sum, f) => sum + f.lines, 0),
    avgLines: Math.round(files.reduce((sum, f) => sum + f.lines, 0) / files.length)
  };
  
  if (files.length === 0) {
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
      
      {/* Status Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Durum Dağılımı</h3>
        <div className="flex gap-4 flex-wrap">
          {stats.critical > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-red-900">🔴🔴🔴</span>
              <span className="text-sm text-gray-700">Kritik: <strong>{stats.critical}</strong></span>
            </div>
          )}
          {stats.urgent > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-red-700">🔴🔴</span>
              <span className="text-sm text-gray-700">Acil: <strong>{stats.urgent}</strong></span>
            </div>
          )}
          {stats.danger > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-orange-600">🔴</span>
              <span className="text-sm text-gray-700">Bölünmeli: <strong>{stats.danger}</strong></span>
            </div>
          )}
          {stats.warning > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-sm text-gray-700">Dikkat: <strong>{stats.warning}</strong></span>
            </div>
          )}
          {stats.good > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-gray-700">İyi: <strong>{stats.good}</strong></span>
            </div>
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

