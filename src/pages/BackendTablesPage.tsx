import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Database, Filter, X, Eye, RefreshCw, Copy, Check } from 'lucide-react';

// 🚀 NO MORE MOCK DATA! Dynamic data from backend API

interface TableColumn {
  name: string;
  type: string;
  constraint?: string;
  default?: string;
}

interface TableInfo {
  schema: string;
  name: string;
  fullName: string;
  columnCount: number;
  columns: TableColumn[];
  status: 'active' | 'pending';
  indexes: number;
  foreignKeys: number;
  rls: boolean;
  description?: string;
}

interface TableData {
  schema: string;
  table: string;
  columns: any[];
  total: number;
  limit: number;
  offset: number;
  data: any[];
}

const BackendTablesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [schemaFilter, setSchemaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  
  // Tables state (from API)
  const [allTables, setAllTables] = useState<TableInfo[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);
  
  // Modal state
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<{ schema: string; table: string } | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Copy state
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  // Fetch tables from backend
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setIsLoadingTables(true);
    setTablesError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/debug/tables-detailed`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAllTables(data.tables || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTablesError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingTables(false);
    }
  };

  // Filter tables
  const filteredTables = allTables.filter(table => {
    const matchesSearch = table.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchema = schemaFilter === 'all' || table.schema === schemaFilter;
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    return matchesSearch && matchesSchema && matchesStatus;
  });

  const toggleExpand = (tableName: string) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };

  // Fetch table data
  const fetchTableData = async (schema: string, table: string) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${API_URL}/debug/table/${schema}/${table}/data?limit=100`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setDataError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Open modal and fetch data
  const openDataModal = (schema: string, table: string) => {
    setSelectedTable({ schema, table });
    setShowDataModal(true);
    fetchTableData(schema, table);
  };

  // Close modal
  const closeDataModal = () => {
    setShowDataModal(false);
    setSelectedTable(null);
    setTableData(null);
    setDataError(null);
  };

  // Copy table info to clipboard
  const copyTableInfo = async (table: TableInfo) => {
    let text = `=== ${table.fullName} ===\n`;
    text += `${table.description || ''}\n\n`;
    
    if (table.status === 'active') {
      text += `KOLONLAR (${table.columnCount}):\n`;
      table.columns.forEach((col, idx) => {
        text += `${idx + 1}. ${col.name} (${col.type})`;
        if (col.constraint) text += ` - ${col.constraint}`;
        if (col.default) text += ` [default: ${col.default}]`;
        text += '\n';
      });
      
      text += `\nİSTATİSTİKLER:\n`;
      text += `- İndexler: ${table.indexes}\n`;
      text += `- Foreign Keys: ${table.foreignKeys}\n`;
      text += `- RLS: ${table.rls ? '✅ Aktif' : '❌ Pasif'}\n`;
      text += `- Durum: ✅ Oluştu\n`;
    } else {
      text += `DURUM: ⏳ Bekliyor (${table.description})\n`;
    }
    
    text += `\n${'='.repeat(50)}\n\n`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedTable(table.fullName);
      setTimeout(() => setCopiedTable(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Kopyalama başarısız oldu!');
    }
  };

  // Copy all tables info with full details
  const copyAllTables = async () => {
    let text = `📋 HZM VERİ TABANI - TABLO ENVANTERİ\n`;
    text += `Tarih: ${new Date().toLocaleString('tr-TR')}\n`;
    text += `${'='.repeat(60)}\n\n`;

    filteredTables.forEach((table) => {
      text += `=== ${table.fullName} ===\n`;
      text += `${table.description || ''}\n\n`;
      
      if (table.status === 'active') {
        // Kolonlar - Detaylı Liste
        text += `KOLONLAR (${table.columnCount}):\n`;
        table.columns.forEach((col, idx) => {
          text += `${idx + 1}. ${col.name} (${col.type})`;
          if (col.constraint) text += ` - ${col.constraint}`;
          if (col.default) text += ` [default: ${col.default}]`;
          text += '\n';
        });
        
        text += `\nİSTATİSTİKLER:\n`;
        text += `- İndexler: ${table.indexes}\n`;
        text += `- Foreign Keys: ${table.foreignKeys}\n`;
        text += `- RLS: ${table.rls ? '✅ Aktif' : '❌ Pasif'}\n`;
        text += `- Durum: ✅ Oluştu\n`;

        // Detaylı Kolon Bilgileri
        if (table.columns.length > 0) {
          text += `\nDETAYLI KOLON BİLGİLERİ:\n`;
          text += `${'─'.repeat(80)}\n`;
          text += `| # | KOLON ADI          | TİP                | KISITLAR           | VARSAYILAN      |\n`;
          text += `${'─'.repeat(80)}\n`;
          
          table.columns.forEach((col, idx) => {
            const num = String(idx + 1).padEnd(3);
            const name = col.name.padEnd(18);
            const type = col.type.padEnd(18);
            const constraint = (col.constraint || '-').padEnd(18);
            const defaultVal = (col.default || '-').padEnd(15);
            text += `| ${num}| ${name}| ${type}| ${constraint}| ${defaultVal}|\n`;
          });
          
          text += `${'─'.repeat(80)}\n`;
        }

        // İndeksler (eğer varsa)
        if (table.indexes > 0) {
          text += `\nİNDEKSLER (${table.indexes}):\n`;
          // Note: Bu bilgi BACKEND_TABLES içinde detaylı yok, sadece sayı var
          // Gerçek index bilgileri için backend'den çekilmeli
          text += `- Toplam ${table.indexes} index tanımlanmış\n`;
        }

        // Foreign Keys (eğer varsa)
        if (table.foreignKeys > 0) {
          text += `\nFOREIGN KEYS (${table.foreignKeys}):\n`;
          // Kolon constraint'lerinden FK'ları bul
          table.columns.filter(col => col.constraint && col.constraint.includes('FK')).forEach((col) => {
            text += `- ${col.name}: ${col.constraint}\n`;
          });
        }

        // RLS Policies
        if (table.rls) {
          text += `\nRLS (Row Level Security):\n`;
          text += `- ✅ RLS Aktif (Tenant isolation enabled)\n`;
          text += `- Policy: tenant_id bazlı izolasyon\n`;
        }

      } else {
        text += `DURUM: ⏳ Bekliyor (${table.description})\n`;
        text += `\nNOT: Bu tablo henüz oluşturulmadı.\n`;
        text += `Phase: ${table.description?.includes('Phase 2') ? 'Phase 2' : 'TBD'}\n`;
      }
      
      text += `\n${'='.repeat(60)}\n\n`;
    });

    // Özet İstatistikler
    text += `\n📊 ÖZET İSTATİSTİKLER:\n`;
    text += `${'─'.repeat(40)}\n`;
    text += `TOPLAM TABLO SAYISI: ${filteredTables.length}\n`;
    text += `AKTİF TABLO: ${filteredTables.filter(t => t.status === 'active').length}\n`;
    text += `BEKLİYOR: ${filteredTables.filter(t => t.status === 'pending').length}\n`;
    
    const totalColumns = filteredTables.filter(t => t.status === 'active').reduce((sum, t) => sum + t.columnCount, 0);
    const totalIndexes = filteredTables.filter(t => t.status === 'active').reduce((sum, t) => sum + t.indexes, 0);
    const totalFKs = filteredTables.filter(t => t.status === 'active').reduce((sum, t) => sum + t.foreignKeys, 0);
    const rlsEnabled = filteredTables.filter(t => t.status === 'active' && t.rls).length;
    
    text += `\nAKTİF TABLOLARDA:\n`;
    text += `- Toplam Kolon: ${totalColumns}\n`;
    text += `- Toplam İndeks: ${totalIndexes}\n`;
    text += `- Toplam Foreign Key: ${totalFKs}\n`;
    text += `- RLS Aktif Tablo: ${rlsEnabled}\n`;
    text += `${'─'.repeat(40)}\n`;
    
    text += `\n💡 NOT: Bu rapor backend'deki GERÇEK verilerden oluşturulmuştur.\n`;
    text += `🚀 Mock data YOK! API: GET /api/v1/debug/tables-detailed\n`;
    text += `📅 Rapor Tarihi: ${new Date().toISOString()}\n`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedTable('all');
      setTimeout(() => setCopiedTable(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Kopyalama başarısız oldu!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Geri
                </button>
                <div className="flex items-center space-x-3">
                  <Database className="text-blue-600" size={32} />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Backend Tabloları</h1>
                    <p className="text-sm text-gray-600">Railway PostgreSQL Tablo Envanteri</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={fetchTables}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  disabled={isLoadingTables}
                  title="Backend'den tabloları yenile"
                >
                  <RefreshCw size={20} className={`mr-2 ${isLoadingTables ? 'animate-spin' : ''}`} />
                  Yenile
                </button>
                <button
                  onClick={copyAllTables}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
                >
                  {copiedTable === 'all' ? (
                    <>
                      <Check size={20} className="mr-2" />
                      Kopyalandı!
                    </>
                  ) : (
                    <>
                      <Copy size={20} className="mr-2" />
                      Tümünü Kopyala
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tablo ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Schema Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={schemaFilter}
                onChange={(e) => setSchemaFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tüm Schema'lar</option>
                <option value="core">core</option>
                <option value="app">app</option>
                <option value="cfg">cfg</option>
                <option value="ops">ops</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">✅ Oluştu</option>
                <option value="pending">⏳ Bekliyor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-gray-700 text-sm">
              <div className="col-span-3">TABLO ADI</div>
              <div className="col-span-1 text-center">KOLON</div>
              <div className="col-span-5">KOLON DETAYLARI</div>
              <div className="col-span-2 text-center">DURUM</div>
              <div className="col-span-1 text-center">DETAY</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {isLoadingTables ? (
              <div className="text-center py-12">
                <RefreshCw className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
                <p className="text-gray-600 font-semibold">Backend'den tablolar yükleniyor...</p>
                <p className="text-sm text-gray-500 mt-2">🚀 Mock data yok, gerçek veriler!</p>
              </div>
            ) : tablesError ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <X className="mx-auto mb-2" size={48} />
                  <p className="font-semibold">Tablolar yüklenemedi</p>
                  <p className="text-sm mt-2">{tablesError}</p>
                </div>
                <button
                  onClick={fetchTables}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="text-center py-12">
                <Database className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Aradığınız kriterlerde tablo bulunamadı</p>
              </div>
            ) : (
              filteredTables.map((table) => (
                <div key={table.fullName} className="hover:bg-gray-50 transition-colors">
                  {/* Table Row */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 items-start">
                    {/* Table Name */}
                    <div className="col-span-3">
                      <div className="font-mono font-semibold text-gray-800">{table.fullName}</div>
                      {table.description && (
                        <div className="text-xs text-gray-500 mt-1">{table.description}</div>
                      )}
                    </div>

                    {/* Column Count */}
                    <div className="col-span-1 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                        {table.columnCount || '-'}
                      </span>
                    </div>

                    {/* Column Details */}
                    <div className="col-span-5">
                      {table.status === 'active' ? (
                        <div className="text-sm text-gray-700">
                          {table.columns.slice(0, 3).map((col, idx) => (
                            <span key={idx}>
                              {col.name}
                              {idx < Math.min(2, table.columns.length - 1) && ', '}
                            </span>
                          ))}
                          {table.columns.length > 3 && (
                            <span className="text-gray-500"> + {table.columns.length - 3} daha...</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic">Henüz oluşturulmadı</div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <div className="space-y-1">
                        {table.status === 'active' ? (
                          <>
                            <div className="text-green-600 font-semibold">✅ Oluştu</div>
                            <div className="text-xs text-gray-600">
                              {table.indexes} idx • {table.foreignKeys} FK
                            </div>
                            {table.rls && (
                              <div className="text-xs text-purple-600 font-medium">🛡️ RLS Aktif</div>
                            )}
                          </>
                        ) : (
                          <div className="text-orange-600 font-semibold">⏳ Bekliyor</div>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {table.status === 'active' && (
                          <>
                            <button
                              onClick={() => openDataModal(table.schema, table.name)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Verileri Görüntüle"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              onClick={() => copyTableInfo(table)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                              title="Tablo Bilgilerini Kopyala"
                            >
                              {copiedTable === table.fullName ? (
                                <Check size={20} className="text-green-600" />
                              ) : (
                                <Copy size={20} />
                              )}
                            </button>
                            <button
                              onClick={() => toggleExpand(table.fullName)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Detayları Göster/Gizle"
                            >
                              {expandedTable === table.fullName ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </>
                        )}
                        {table.status === 'pending' && (
                          <button
                            onClick={() => copyTableInfo(table)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Tablo Bilgilerini Kopyala"
                          >
                            {copiedTable === table.fullName ? (
                              <Check size={20} className="text-green-600" />
                            ) : (
                              <Copy size={20} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTable === table.fullName && table.status === 'active' && (
                    <div className="bg-gray-50 px-6 py-6 border-t border-gray-200">
                      <div className="max-w-6xl">
                        {/* Columns Table */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            📋 KOLONLAR ({table.columnCount})
                          </h4>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">KOLON ADI</th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">TİP</th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">CONSTRAINT</th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">VARSAYILAN</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {table.columns.map((col, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-xs text-gray-600">{idx + 1}</td>
                                    <td className="px-4 py-2 text-sm font-mono text-gray-800">{col.name}</td>
                                    <td className="px-4 py-2 text-sm font-mono text-blue-600">{col.type}</td>
                                    <td className="px-4 py-2 text-xs text-gray-600">
                                      {col.constraint || '-'}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-gray-600">
                                      {col.default || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Indexes */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-xs font-semibold text-gray-600 mb-2">🔐 INDEXES</div>
                            <div className="text-2xl font-bold text-blue-600">{table.indexes}</div>
                            <div className="text-xs text-gray-500 mt-1">Performance indexes</div>
                          </div>

                          {/* Foreign Keys */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-xs font-semibold text-gray-600 mb-2">🔗 FOREIGN KEYS</div>
                            <div className="text-2xl font-bold text-green-600">{table.foreignKeys}</div>
                            <div className="text-xs text-gray-500 mt-1">Relations</div>
                          </div>

                          {/* RLS Status */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-xs font-semibold text-gray-600 mb-2">🛡️ ROW LEVEL SECURITY</div>
                            <div className={`text-2xl font-bold ${table.rls ? 'text-purple-600' : 'text-gray-400'}`}>
                              {table.rls ? '✅ Aktif' : '❌ Pasif'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Multi-tenant isolation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 mt-1">ℹ️</div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">Railway UI'da Neden Görünmüyor?</p>
              <p className="text-sm text-blue-700">
                Railway Dashboard sadece <code className="bg-blue-100 px-2 py-0.5 rounded">public</code> schema'sını 
                otomatik gösterir. Tablolarımız <code className="bg-blue-100 px-2 py-0.5 rounded">core</code> ve{' '}
                <code className="bg-blue-100 px-2 py-0.5 rounded">app</code> schema'larında olduğu için UI'da 
                görünmüyor. Sistem normal çalışıyor! ✅
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Data Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Database className="text-blue-600" size={28} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedTable ? `${selectedTable.schema}.${selectedTable.table}` : 'Tablo Verileri'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {tableData ? `Toplam ${tableData.total} kayıt (İlk ${tableData.limit} gösteriliyor)` : 'Veriler yükleniyor...'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDataModal}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              {isLoadingData ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="animate-spin text-blue-600 mb-4" size={48} />
                  <p className="text-gray-600">Veriler yükleniyor...</p>
                </div>
              ) : dataError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-600 text-center">
                    <p className="font-semibold mb-2">❌ Hata Oluştu</p>
                    <p className="text-sm">{dataError}</p>
                  </div>
                </div>
              ) : tableData && tableData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        {tableData.columns.map((col) => (
                          <th
                            key={col.column_name}
                            className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap"
                          >
                            {col.column_name}
                            <div className="text-xs font-normal text-gray-500 mt-1">
                              {col.data_type}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {tableData.columns.map((col) => (
                            <td
                              key={col.column_name}
                              className="border border-gray-300 px-4 py-2 text-sm text-gray-800 max-w-xs truncate"
                              title={String(row[col.column_name] || '')}
                            >
                              {row[col.column_name] !== null && row[col.column_name] !== undefined
                                ? String(row[col.column_name])
                                : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : tableData && tableData.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Database className="text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Bu tabloda henüz veri yok</p>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {tableData && (
                  <span>
                    Gösterilen: <strong>{tableData.data.length}</strong> / Toplam: <strong>{tableData.total}</strong>
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => selectedTable && fetchTableData(selectedTable.schema, selectedTable.table)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isLoadingData}
                >
                  <RefreshCw size={16} className={`mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                  Yenile
                </button>
                <button
                  onClick={closeDataModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendTablesPage;

