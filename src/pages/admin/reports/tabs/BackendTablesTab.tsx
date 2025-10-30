import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Database, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { useAIKnowledgeBase } from '../../../../hooks/useAIKnowledgeBase';
import TableDataModal from '../../../../components/shared/TableDataModal';
import api from '../../../../services/api';

export default function BackendTablesTab() {
  const { report, loading, generating, error, fetchLatestReport, generateReport } = useAIKnowledgeBase('backend_tables');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Otomatik yükleme: Sayfa açılınca varsa getir
  useEffect(() => {
    fetchLatestReport();
  }, []);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSchema, setModalSchema] = useState('');
  const [modalTable, setModalTable] = useState('');
  const [modalData, setModalData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const toggleRow = (tableFullName: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(tableFullName)) {
      newExpanded.delete(tableFullName);
    } else {
      newExpanded.add(tableFullName);
    }
    setExpandedRows(newExpanded);
  };

  const openTableData = async (schema: string, table: string) => {
    setModalSchema(schema);
    setModalTable(table);
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalData(null);

    try {
      const response = await api.get(`/admin/table-data/${schema}/${table}?limit=50&offset=0`);
      
      if (response.success) {
        setModalData(response);
      } else {
        setModalError(response.message || 'Veri yüklenemedi');
      }
    } catch (err: any) {
      console.error('Failed to fetch table data:', err);
      setModalError(err.message || 'Tablo verisi yüklenirken bir hata oluştu');
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const parseReport = () => {
    if (!report) return null;
    try {
      return JSON.parse(report.content);
    } catch (err) {
      console.error('Failed to parse report:', err);
      return null;
    }
  };

  const reportData = parseReport();

  return (
    <>
      {/* Modal */}
      <TableDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        schema={modalSchema}
        table={modalTable}
        data={modalData}
        loading={modalLoading}
        error={modalError}
      />

      <div className="space-y-6">
      {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Database size={24} />
              </div>
                  <div>
                <h2 className="text-2xl font-bold">🔱 Master Admin Paneli</h2>
                <p className="text-purple-100 mt-1">Tüm Tenant'lar - Sistem Geneli Kontrol</p>
                </div>
              </div>
              
          <div className="flex gap-2">
            <button
              onClick={fetchLatestReport}
              disabled={loading || generating}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Yenile</span>
            </button>
            <button
              onClick={generateReport}
              disabled={generating || loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
              <span>{generating ? 'Oluşturuluyor...' : '🔄 Rapor Oluştur'}</span>
            </button>
          </div>
              </div>
            </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-blue-400" />
          <span className="ml-3 text-white font-medium">Rapor yükleniyor...</span>
        </div>
      )}

      {/* Last Update Info */}
      {report && !loading && !generating && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock size={16} />
            <span>Son Oluşturma: {formatDate(report.updated_at)}</span>
            {report.description && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{report.description}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">❌ {error}</p>
                <button
            onClick={generateReport}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
                >
                  Tekrar Dene
                </button>
              </div>
      )}

      {/* Generating */}
      {generating && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-blue-400" />
          <span className="ml-3 text-gray-300">Rapor oluşturuluyor...</span>
                        </div>
      )}

      {/* No Report */}
      {!loading && !generating && !error && !report && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center">
          <Database size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">Henüz rapor oluşturulmamış</p>
                            <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-blue-500/90 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {generating ? 'Oluşturuluyor...' : 'İlk Raporu Oluştur'}
                          </button>
                    </div>
                  )}

      {/* Report Content */}
      {!loading && !generating && !error && report && reportData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          {reportData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 text-sm font-medium">Toplam Tablo</span>
                  <Database size={20} className="text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-blue-900">
                  {reportData.summary.total_tables || 0}
                </div>
                <div className="mt-2 text-xs text-blue-600">PostgreSQL tabloları</div>
              </div>
              <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-700 text-sm font-medium">Schema</span>
                  <Database size={20} className="text-green-500" />
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {reportData.summary.total_schemas || 0}
                </div>
                <div className="mt-2 text-xs text-green-600">Farklı schema</div>
                            </div>
              <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-700 text-sm font-medium">Toplam Sütun</span>
                  <Database size={20} className="text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {reportData.summary.total_columns || 0}
                </div>
                <div className="mt-2 text-xs text-purple-600">Tüm sütunlar</div>
                  </div>
              <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-700 text-sm font-medium">Toplam Index</span>
                  <Database size={20} className="text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-orange-900">
                  {reportData.summary.total_indexes || 0}
            </div>
                <div className="mt-2 text-xs text-orange-600">Performans indexleri</div>
              </div>
            </div>
          )}

          {/* Tables List */}
          {reportData.tables && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Schema</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tablo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Açıklama</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sütun Sayısı</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Index Sayısı</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Satır Sayısı</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.tables.map((table: any, index: number) => {
                      const fullName = `${table.schema_name}.${table.table_name}`;
                      const isExpanded = expandedRows.has(fullName);
                      
                      return (
                        <>
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-blue-600 font-medium">{table.schema_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{table.table_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 italic">{table.description || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{table.column_count}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{table.index_count}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{table.row_count?.toLocaleString() || 'N/A'}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                <button
                                  onClick={() => openTableData(table.schema_name, table.table_name)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Tablo verilerini görüntüle"
                                >
                                  <Eye size={18} className="text-blue-600" />
                </button>
                <button
                                  onClick={() => toggleRow(fullName)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  title={isExpanded ? 'Sütunları gizle' : 'Sütunları göster'}
                                >
                                  {isExpanded ? (
                                    <ChevronDown size={18} className="text-gray-600" />
                                  ) : (
                                    <ChevronRight size={18} className="text-gray-600" />
                                  )}
                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Row - Columns */}
                          {isExpanded && table.columns && (
                            <tr key={`${index}-expanded`}>
                              <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                <div className="pl-8">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-4">📋 Sütunlar ({table.columns.length})</h4>
                                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sütun Adı</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Veri Tipi & Özellikler</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {table.columns.map((col: any, colIndex: number) => {
                                          const constraints = [];
                                          if (col.constraint) {
                                            if (col.constraint === 'PK') constraints.push('🔑 PRIMARY KEY');
                                            else if (col.constraint.startsWith('FK')) constraints.push(`🔗 ${col.constraint}`);
                                            else if (col.constraint === 'UNIQUE') constraints.push('⭐ UNIQUE');
                                            else if (col.constraint === 'NOT NULL') constraints.push('🚫 NOT NULL');
                                          }
                                          
                                          if (col.default) {
                                            constraints.push(`📌 DEFAULT: ${col.default}`);
                                          }

                                          return (
                                            <tr key={colIndex} className="hover:bg-gray-50 transition-colors">
                                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {col.name}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                  <span className="text-blue-600 font-medium">{col.type}</span>
                                                  {constraints.length > 0 && (
                                                    <span className="text-xs text-gray-500">{constraints.join(' • ')}</span>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
