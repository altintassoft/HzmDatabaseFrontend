import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronUp, Database, Filter } from 'lucide-react';

// Table metadata from TABLOLAR.md
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

const BACKEND_TABLES: TableInfo[] = [
  {
    schema: 'core',
    name: 'tenants',
    fullName: 'core.tenants',
    columnCount: 13,
    columns: [
      { name: 'id', type: 'SERIAL', constraint: 'PK', default: 'AUTO' },
      { name: 'name', type: 'VARCHAR(200)', constraint: 'NOT NULL' },
      { name: 'slug', type: 'VARCHAR(100)', constraint: 'UNIQUE' },
      { name: 'domain', type: 'VARCHAR(255)', constraint: 'UNIQUE' },
      { name: 'default_language', type: 'VARCHAR(10)', default: "'en'" },
      { name: 'default_currency', type: 'VARCHAR(3)', default: "'USD'" },
      { name: 'plan', type: 'VARCHAR(50)', default: "'free'" },
      { name: 'is_active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'is_deleted', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ' },
      { name: 'version', type: 'INTEGER', default: '1' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    status: 'active',
    indexes: 2,
    foreignKeys: 0,
    rls: false,
    description: 'Multi-tenant organizasyonlar',
  },
  {
    schema: 'core',
    name: 'users',
    fullName: 'core.users',
    columnCount: 11,
    columns: [
      { name: 'id', type: 'SERIAL', constraint: 'PK', default: 'AUTO' },
      { name: 'tenant_id', type: 'INTEGER', constraint: 'FK → core.tenants(id)' },
      { name: 'email', type: 'VARCHAR(255)', constraint: 'NOT NULL' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraint: 'NOT NULL' },
      { name: 'role', type: 'VARCHAR(50)', default: "'user'" },
      { name: 'is_active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'is_deleted', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'deleted_at', type: 'TIMESTAMPTZ' },
      { name: 'version', type: 'INTEGER', default: '1' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    status: 'active',
    indexes: 3,
    foreignKeys: 1,
    rls: true,
    description: 'Kullanıcılar (multi-tenant)',
  },
  {
    schema: 'core',
    name: 'projects',
    fullName: 'core.projects',
    columnCount: 0,
    columns: [],
    status: 'pending',
    indexes: 0,
    foreignKeys: 0,
    rls: false,
    description: 'Henüz oluşturulmadı - Phase 2',
  },
  {
    schema: 'app',
    name: 'generic_data',
    fullName: 'app.generic_data',
    columnCount: 0,
    columns: [],
    status: 'pending',
    indexes: 0,
    foreignKeys: 0,
    rls: false,
    description: 'Henüz oluşturulmadı - Phase 2 (⭐ EN ÖNEMLİ!)',
  },
];

const BackendTablesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [schemaFilter, setSchemaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  // Filter tables
  const filteredTables = BACKEND_TABLES.filter(table => {
    const matchesSearch = table.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchema = schemaFilter === 'all' || table.schema === schemaFilter;
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    return matchesSearch && matchesSchema && matchesStatus;
  });

  const toggleExpand = (tableName: string) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            {filteredTables.length === 0 ? (
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
                      {table.status === 'active' && (
                        <button
                          onClick={() => toggleExpand(table.fullName)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {expandedTable === table.fullName ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      )}
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
    </div>
  );
};

export default BackendTablesPage;

