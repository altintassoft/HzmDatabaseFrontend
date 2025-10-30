import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../../../services/api';
import { ENDPOINTS, REPORT_TYPES, TARGETS } from '../../../../constants/endpoints';

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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseBackendFiles(markdown: string): FileInfo[] {
  const files: FileInfo[] = [];
  const lines = markdown.split('\n');
  
  let inBackendSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Backend section başlangıcı
    if (line.includes('## ⚙️ BACKEND DOSYA ANALİZİ') || line.includes('## 📊 Backend Projesi')) {
      inBackendSection = true;
      continue;
    }
    
    // Frontend section başlarsa Backend section biter
    if (line.includes('## 🎨 FRONTEND DOSYA ANALİZİ') || line.includes('## 📊 Frontend Projesi')) {
      inBackendSection = false;
      continue;
    }
    
    if (!inBackendSection) continue;
    
    // Tablo satırlarını parse et
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

function buildDirectoryTree(files: FileInfo[], expandAll: boolean = true): DirectoryNode {
  const root: DirectoryNode = {
    name: 'Backend',
    type: 'folder',
    children: [],
    expanded: true
  };
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let currentNode = root;
    
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i];
      let childNode = currentNode.children?.find(c => c.name === part);
      
      if (!childNode) {
        childNode = {
          name: part,
          type: 'folder',
          children: [],
          expanded: expandAll
        };
        if (!currentNode.children) currentNode.children = [];
        currentNode.children.push(childNode);
      }
      
      currentNode = childNode;
    }
    
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

function DirectoryNodeComponent({ 
  node, 
  level = 0, 
  isLast = false,
  parentLines = []
}: { 
  node: DirectoryNode; 
  level?: number;
  isLast?: boolean;
  parentLines?: boolean[];
}) {
  const [expanded, setExpanded] = useState(node.expanded || false);
  
  useEffect(() => {
    setExpanded(node.expanded || false);
  }, [node.expanded]);
  
  const hasChildren = (node.children && node.children.length > 0) || (node.files && node.files.length > 0);
  
  return (
    <div className="relative">
      {/* Folder Header */}
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer relative"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Tree Lines */}
        <div className="absolute left-0 top-0 bottom-0 flex" style={{ width: `${level * 24}px` }}>
          {parentLines.map((shouldDrawLine, idx) => (
            <div key={idx} className="relative" style={{ width: '24px' }}>
              {shouldDrawLine && (
                <div 
                  className="absolute left-3 top-0 bottom-0 w-px bg-gray-300"
                  style={{ height: '100%' }}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Current Level Line */}
        {level > 0 && (
          <div 
            className="absolute bg-gray-300"
            style={{
              left: `${(level - 1) * 24 + 12}px`,
              top: '50%',
              width: '12px',
              height: '1px'
            }}
          />
        )}
        
        <div style={{ paddingLeft: `${level * 24 + 12}px` }} className="flex items-center gap-2 flex-1">
          {hasChildren && (
            <div className="text-gray-400 flex-shrink-0">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
          <Folder size={18} className="text-blue-500 flex-shrink-0" />
          <span className="font-medium text-gray-700">{node.name}</span>
        </div>
      </div>
      
      {/* Children */}
      {expanded && (
        <div>
          {node.children?.map((child, idx) => {
            const isLastChild = idx === (node.children?.length || 0) - 1 && (!node.files || node.files.length === 0);
            const newParentLines = [...parentLines, !isLast];
            return (
              <DirectoryNodeComponent 
                key={idx} 
                node={child} 
                level={level + 1}
                isLast={isLastChild}
                parentLines={newParentLines}
              />
            );
          })}
          
          {node.files?.map((file, idx) => {
            const isLastFile = idx === (node.files?.length || 0) - 1;
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 hover:bg-blue-50 rounded-lg group relative"
              >
                {/* Tree Lines for Files */}
                <div className="absolute left-0 top-0 bottom-0 flex" style={{ width: `${(level + 1) * 24}px` }}>
                  {[...parentLines, !isLast].map((shouldDrawLine, pIdx) => (
                    <div key={pIdx} className="relative" style={{ width: '24px' }}>
                      {shouldDrawLine && (
                        <div 
                          className="absolute left-3 top-0 bottom-0 w-px bg-gray-300"
                          style={{ height: '100%' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* File Line */}
                <div 
                  className="absolute bg-gray-300"
                  style={{
                    left: `${level * 24 + 12}px`,
                    top: '50%',
                    width: '12px',
                    height: '1px'
                  }}
                />
                
                <div style={{ paddingLeft: `${(level + 1) * 24 + 12}px` }} className="flex items-center gap-2 flex-1 min-w-0">
                  <File size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{file.name}</span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {getStatusBadge(file.status, file.lines)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BackendStructureTab() {
  const [filter, setFilter] = useState<FileInfo['status'] | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(ENDPOINTS.ADMIN.DATABASE, {
        params: { 
          type: REPORT_TYPES.PROJECT_STRUCTURE, 
          target: TARGETS.BACKEND,
          ...(forceRefresh && { force: 'true' })
        }
      });
      
      console.log('📊 Backend Structure Response:', response);
      console.log('📄 Content length:', response?.content?.length);
      console.log('💾 Cached:', response?.cached);
      
      if (response && response.content) {
        setMarkdownContent(response.content);
      } else {
        console.warn('❌ No content in response:', response);
        setError('Rapor içeriği bulunamadı');
      }
    } catch (err: any) {
      console.error('Backend structure fetch error:', err);
      setError(err.message || 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={32} className="animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600 font-medium">Backend yapısı yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Hata</h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <button
              onClick={fetchReport}
              className="text-sm text-red-600 hover:text-red-700 underline font-medium"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allFiles = parseBackendFiles(markdownContent);
  const filteredFiles = filter === 'all' ? allFiles : allFiles.filter(f => f.status === filter);
  const tree = buildDirectoryTree(filteredFiles, true);
  
  const stats = {
    total: allFiles.length,
    critical: allFiles.filter(f => f.status === 'critical').length,
    urgent: allFiles.filter(f => f.status === 'urgent').length,
    danger: allFiles.filter(f => f.status === 'danger').length,
    warning: allFiles.filter(f => f.status === 'warning').length,
    good: allFiles.filter(f => f.status === 'good').length,
    totalLines: allFiles.reduce((sum, f) => sum + f.lines, 0),
    avgLines: allFiles.length > 0 ? Math.round(allFiles.reduce((sum, f) => sum + f.lines, 0) / allFiles.length) : 0
  };
  
  if (allFiles.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Backend Dosyası Bulunamadı</h3>
            <p className="text-sm text-yellow-700">Markdown içeriğinde Backend dosya bilgisi yok.</p>
            <button
              onClick={fetchReport}
              className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 underline font-medium"
            >
              Yeniden Yükle
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="flex items-center gap-2">
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Tümünü Göster
              </button>
            )}
            <button
              onClick={() => {
                // Generate tree structure text with lines
                const generateTreeText = (node: DirectoryNode, prefix: string = '', isLast: boolean = true): string => {
                  let result = '';
                  const connector = isLast ? '└── ' : '├── ';
                  const extension = isLast ? '    ' : '│   ';
                  
                  if (node.type === 'folder') {
                    result += prefix + connector + node.name + '/\n';
                    const childPrefix = prefix + extension;
                    
                    const children = node.children || [];
                    const files = node.files || [];
                    const totalItems = children.length + files.length;
                    
                    children.forEach((child, index) => {
                      const isLastChild = index === totalItems - 1;
                      result += generateTreeText(child, childPrefix, isLastChild);
                    });
                    
                    files.forEach((file, idx) => {
                      const status = file.status === 'critical' ? '🔴🔴🔴' : 
                                     file.status === 'urgent' ? '🔴🔴' :
                                     file.status === 'danger' ? '🔴' :
                                     file.status === 'warning' ? '⚠️' : '✅';
                      const actualIndex = children.length + idx;
                      const isLastItem = actualIndex === totalItems - 1;
                      const fileConnector = isLastItem ? '└── ' : '├── ';
                      result += childPrefix + fileConnector + `${file.name} (${file.lines} satır) ${status}\n`;
                    });
                  }
                  return result;
                };
                
                let treeText = 'Backend Dosya Yapısı\n';
                treeText += '='.repeat(50) + '\n\n';
                treeText += generateTreeText(tree);
                
                navigator.clipboard.writeText(treeText).then(() => {
                  alert('✅ Tüm ağaç yapısı kopyalandı!');
                }).catch(err => {
                  console.error('Kopyalama hatası:', err);
                  alert('❌ Kopyalama başarısız!');
                });
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <span>📋</span>
              <span>Tüm Ağacı Kopyala</span>
            </button>
            <button
              onClick={() => fetchReport(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              title="Cache'den yükle (hızlı)"
            >
              <RefreshCw size={16} />
              <span>Yenile</span>
            </button>
            <button
              onClick={() => fetchReport(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              title="GitHub'dan yeniden çek (yavaş)"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>GitHub'dan Çek</span>
            </button>
          </div>
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
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <span>Dosya Yapısı</span>
          {filteredFiles.length < allFiles.length && (
            <span className="text-sm text-gray-500">
              ({filteredFiles.length} / {allFiles.length} dosya gösteriliyor)
            </span>
          )}
        </h3>
        <div className="space-y-1">
          <DirectoryNodeComponent key={filter} node={tree} level={0} />
        </div>
      </div>
    </div>
  );
}
