import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, XCircle, AlertTriangle, Search, Filter, Database } from 'lucide-react';
import api from '../services/api';

interface TableComparison {
  table: string;
  schema: string;
  tableName: string;
  inCode: boolean;
  inBackend: boolean;
  status: 'match' | 'missing' | 'extra';
  size: string;
}

interface ComparisonData {
  tables: TableComparison[];
  stats: {
    total: number;
    expected: number;
    actual: number;
    match: number;
    missing: number;
    extra: number;
  };
  expectedTables: string[];
  actualTables: string[];
}

const TableComparisonTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get('/admin/database?type=table-comparison');
      setData(result);
    } catch (err: any) {
      console.error('Table comparison fetch error:', err);
      setError(err.message || 'Rapor yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'match':
        return `${baseClass} bg-green-100 text-green-700`;
      case 'missing':
        return `${baseClass} bg-yellow-100 text-yellow-700`;
      case 'extra':
        return `${baseClass} bg-red-100 text-red-700`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'missing':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'extra':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <AlertCircle className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'match':
        return '✅ UYUMLU';
      case 'missing':
        return '⚠️ MIGRATION GEREKLI';
      case 'extra':
        return '🔴 FAZLADAN';
      default:
        return 'UNKNOWN';
    }
  };

  // Filter data
  const filteredTables = data?.tables.filter(table => {
    if (statusFilter !== 'all' && table.status !== statusFilter) return false;
    if (searchTerm && !table.table.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" size={40} />
        <span className="ml-3 text-lg text-gray-600">Tablo karşılaştırması yapılıyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="text-red-600" size={24} />
          <span className="ml-3 text-red-800 font-medium">Hata: {error}</span>
        </div>
        <button
          onClick={fetchComparison}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <span className="text-gray-600">Rapor verisi bulunamadı</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Database size={20} className="mr-2 text-blue-600" />
              📋 Tablo Karşılaştırma Raporu
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Migration dosyalarındaki beklenen tablolar vs Backend'deki gerçek tablolar
            </p>
          </div>
          <button
            onClick={fetchComparison}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Yenile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-6 gap-4 mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{data.stats.total}</div>
            <div className="text-xs text-gray-600 mt-1">Toplam</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{data.stats.expected}</div>
            <div className="text-xs text-gray-600 mt-1">Beklenen (Kod)</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{data.stats.actual}</div>
            <div className="text-xs text-gray-600 mt-1">Gerçek (Backend)</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{data.stats.match}</div>
            <div className="text-xs text-gray-600 mt-1">Uyumlu ✅</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{data.stats.missing}</div>
            <div className="text-xs text-gray-600 mt-1">Eksik ⚠️</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{data.stats.extra}</div>
            <div className="text-xs text-gray-600 mt-1">Fazladan 🔴</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tablo adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tümü ({data.tables.length})</option>
              <option value="match">✅ Uyumlu ({data.stats.match})</option>
              <option value="missing">⚠️ Migration Gerekli ({data.stats.missing})</option>
              <option value="extra">🔴 Fazladan ({data.stats.extra})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Comparison */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">TABLO ADI</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">KODDA?</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">BACKEND'DE?</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">BOYUT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'Filtre ile eşleşen sonuç yok' : 'Tablo bulunamadı'}
                  </td>
                </tr>
              ) : (
                filteredTables.map((table, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Database size={16} className="text-gray-400 mr-2" />
                        <span className="font-mono text-sm font-medium text-gray-900">{table.table}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 ml-6">
                        Schema: {table.schema} • Table: {table.tableName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {table.inCode ? (
                        <CheckCircle className="inline text-green-600" size={20} />
                      ) : (
                        <XCircle className="inline text-red-400" size={20} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {table.inBackend ? (
                        <CheckCircle className="inline text-green-600" size={20} />
                      ) : (
                        <XCircle className="inline text-red-400" size={20} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-700">{table.size}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(table.status)}
                        <span className={getStatusBadge(table.status)}>
                          {getStatusText(table.status)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      {data.stats.missing > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-yellow-800">Migration Gerekli</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {data.stats.missing} tablo migration dosyalarında tanımlı ama backend'de yok. 
                Migration'ları çalıştırmanız gerekiyor.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.stats.extra > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="text-red-600 mt-0.5" size={20} />
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-red-800">Fazladan Tablolar</h4>
              <p className="text-sm text-red-700 mt-1">
                {data.stats.extra} tablo backend'de var ama migration dosyalarında yok. 
                Bu tablolar manuel oluşturulmuş olabilir veya eski migration'lardan kalma olabilir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableComparisonTab;

