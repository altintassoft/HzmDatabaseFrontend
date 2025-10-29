import { X, Database, Download } from 'lucide-react';

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface TableDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: string;
  table: string;
  data: {
    columns: Column[];
    rows: any[];
    total: number;
    limit: number;
    offset: number;
    message: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export default function TableDataModal({
  isOpen,
  onClose,
  schema,
  table,
  data,
  loading,
  error
}: TableDataModalProps) {
  if (!isOpen) return null;

  const exportToJSON = () => {
    if (!data) return;
    const jsonString = JSON.stringify(data.rows, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema}_${table}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!data || !data.rows.length) return;
    
    const headers = Object.keys(data.rows[0]).join(',');
    const rows = data.rows.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csvString = [headers, ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema}_${table}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Database size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {schema}.{table}
              </h2>
              {data && (
                <p className="text-blue-100 mt-1">
                  {data.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <>
                <button
                  onClick={exportToJSON}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 text-white"
                  title="JSON olarak indir"
                >
                  <Download size={18} />
                  <span>JSON</span>
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-2 text-white"
                  title="CSV olarak indir"
                >
                  <Download size={18} />
                  <span>CSV</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors text-white"
              title="Kapat"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Veriler yükleniyor...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <p className="text-red-400 text-lg mb-2">❌ Hata</p>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <div className="h-full overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-800 border-b-2 border-blue-500">
                  <tr>
                    {data.columns.map((col, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wide"
                        title={`${col.data_type}${col.is_nullable === 'NO' ? ' (NOT NULL)' : ''}`}
                      >
                        {col.column_name}
                        <div className="text-xs text-gray-400 font-normal normal-case mt-1">
                          {col.data_type}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-800/50 transition-colors">
                      {data.columns.map((col, colIndex) => {
                        const value = row[col.column_name];
                        const displayValue = value === null 
                          ? <span className="text-gray-500 italic">NULL</span>
                          : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value);

                        return (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm text-gray-200 max-w-xs truncate"
                            title={value === null ? 'NULL' : String(value)}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.rows.length === 0 && (
                <div className="text-center py-12">
                  <Database size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Bu tabloda henüz veri yok</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {data && data.rows.length > 0 && (
          <div className="bg-gray-800 border-t border-gray-700 p-4 rounded-b-xl flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <span className="font-semibold text-white">{data.rows.length}</span> kayıt gösteriliyor
              <span className="text-gray-500 mx-2">•</span>
              Toplam: <span className="font-semibold text-white">{data.total}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>Limit: {data.limit}</span>
              <span className="text-gray-600">|</span>
              <span>Offset: {data.offset}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

