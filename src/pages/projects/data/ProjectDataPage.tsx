import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabase } from '../../../context/DatabaseContext';
import { 
  ArrowLeft, 
  Table, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle,
  Database as DatabaseIcon
} from 'lucide-react';

interface TableData {
  id: string;
  [key: string]: any;
}

const ProjectDataPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { state } = useDatabase();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [addingRow, setAddingRow] = useState(false);
  const [deletingRow, setDeletingRow] = useState<TableData | null>(null);
  const [editData, setEditData] = useState<{[key: string]: any}>({});
  const [newRowData, setNewRowData] = useState<{[key: string]: any}>({});

  const project = state.projects.find(p => p.id === projectId);
  const currentTable = project?.tables.find(t => t.id === selectedTable);

  // Load table data from localStorage
  const loadTableData = (tableId: string) => {
    const data = JSON.parse(localStorage.getItem(`table_data_${tableId}`) || '[]');
    setTableData(data);
  };

  // Save table data to localStorage
  const saveTableData = (tableId: string, data: TableData[]) => {
    localStorage.setItem(`table_data_${tableId}`, JSON.stringify(data));
    setTableData(data);
  };

  // Handle table selection
  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
    loadTableData(tableId);
    setEditingRow(null);
    setAddingRow(false);
  };

  // Handle add new row
  const handleAddRow = () => {
    if (!currentTable) return;
    
    const newRow: TableData = {
      id: Date.now().toString(),
    };
    
    // Initialize with default values based on field types
    currentTable.fields.forEach(field => {
      switch (field.type) {
        case 'string':
          newRow[field.name] = newRowData[field.name] || '';
          break;
        case 'number':
          newRow[field.name] = Number(newRowData[field.name]) || 0;
          break;
        case 'boolean':
          newRow[field.name] = Boolean(newRowData[field.name]);
          break;
        case 'date':
          newRow[field.name] = newRowData[field.name] || new Date().toISOString().split('T')[0];
          break;
        case 'object':
          newRow[field.name] = newRowData[field.name] || '{}';
          break;
        case 'array':
          newRow[field.name] = newRowData[field.name] || '[]';
          break;
        default:
          newRow[field.name] = newRowData[field.name] || '';
      }
    });

    const updatedData = [...tableData, newRow];
    saveTableData(selectedTable!, updatedData);
    setAddingRow(false);
    setNewRowData({});
  };

  // Handle edit row
  const handleEditRow = (row: TableData) => {
    setEditingRow(row.id);
    setEditData({ ...row });
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingRow) return;
    
    const updatedData = tableData.map(row => 
      row.id === editingRow ? { ...editData } : row
    );
    saveTableData(selectedTable!, updatedData);
    setEditingRow(null);
    setEditData({});
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  // Handle delete row
  const handleDeleteRow = (row: TableData) => {
    setDeletingRow(row);
  };

  // Confirm delete row
  const confirmDeleteRow = () => {
    if (!deletingRow) return;
    
    const updatedData = tableData.filter(row => row.id !== deletingRow.id);
    saveTableData(selectedTable!, updatedData);
    setDeletingRow(null);
  };

  // Cancel delete row
  const cancelDeleteRow = () => {
    setDeletingRow(null);
  };

  // Handle input change for editing
  const handleEditInputChange = (fieldName: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Handle input change for new row
  const handleNewRowInputChange = (fieldName: string, value: any) => {
    setNewRowData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Render input based on field type
  const renderInput = (field: any, value: any, onChange: (value: any) => void, isRequired: boolean = false) => {
    const baseClasses = "px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";
    
    switch (field.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className={baseClasses}
            required={isRequired}
          />
        );
      case 'boolean':
        return (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => onChange(e.target.value === 'true')}
            className={baseClasses}
          >
            <option value="true">Evet</option>
            <option value="false">Hayır</option>
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseClasses}
            required={isRequired}
          />
        );
      case 'object':
      case 'array':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClasses} min-h-[60px] resize-none`}
            placeholder={field.type === 'object' ? '{}' : '[]'}
            required={isRequired}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseClasses}
            required={isRequired}
          />
        );
    }
  };

  // Format display value
  const formatDisplayValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'boolean':
        return value ? 'Evet' : 'Hayır';
      case 'date':
        return new Date(value).toLocaleDateString('tr-TR');
      case 'object':
      case 'array':
        return typeof value === 'string' ? value : JSON.stringify(value);
      default:
        return String(value);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <DatabaseIcon className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Proje Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Belirtilen proje mevcut değil.</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Projelere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <button
            onClick={() => navigate('/projects')}
            className="mr-4 hover:bg-blue-700 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{project.name} - Veriler</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex gap-6">
          {/* Tablolar Listesi */}
          <div className="w-64 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center">
              <Table size={20} className="mr-2" />
              Tablolar
            </h2>
            {project.tables.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Table className="mx-auto mb-2" size={32} />
                <p className="text-sm">Henüz tablo yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {project.tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => handleTableSelect(table.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedTable === table.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{table.name}</div>
                    <div className="text-xs text-gray-500">{table.fields.length} alan</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tablo İçeriği */}
          <div className="flex-1 bg-white rounded-lg shadow-md">
            {!selectedTable ? (
              <div className="text-center text-gray-500 py-12">
                <Table className="mx-auto mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tablo Seçin</h3>
                <p>Verilerini görüntülemek istediğiniz tabloyu seçin</p>
              </div>
            ) : !currentTable ? (
              <div className="text-center text-gray-500 py-12">
                <AlertTriangle className="mx-auto mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tablo Bulunamadı</h3>
                <p>Seçilen tablo artık mevcut değil</p>
              </div>
            ) : currentTable.fields.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Table className="mx-auto mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Alan Bulunamadı</h3>
                <p>Bu tabloda henüz alan tanımlanmamış</p>
                <button
                  onClick={() => navigate(`/projects/${projectId}`)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Alan Ekle
                </button>
              </div>
            ) : (
              <div className="p-6">
                {/* Table Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {currentTable.name} - Veriler
                  </h3>
                  <button
                    onClick={() => setAddingRow(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Yeni Kayıt
                  </button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {currentTable.fields.map(field => (
                          <th
                            key={field.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {field.name}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Add New Row */}
                      {addingRow && (
                        <tr className="bg-green-50">
                          {currentTable.fields.map(field => (
                            <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                              {renderInput(
                                field,
                                newRowData[field.name],
                                (value) => handleNewRowInputChange(field.name, value),
                                field.required
                              )}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleAddRow}
                                className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                <Save size={14} className="mr-1" />
                                Kaydet
                              </button>
                              <button
                                onClick={() => {
                                  setAddingRow(false);
                                  setNewRowData({});
                                }}
                                className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                <X size={14} className="mr-1" />
                                İptal
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Existing Data Rows */}
                      {tableData.length === 0 && !addingRow ? (
                        <tr>
                          <td
                            colSpan={currentTable.fields.length + 1}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            <Table className="mx-auto mb-2" size={32} />
                            <p>Henüz veri girilmemiş</p>
                            <button
                              onClick={() => setAddingRow(true)}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              İlk kaydı ekleyin
                            </button>
                          </td>
                        </tr>
                      ) : (
                        tableData.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            {currentTable.fields.map(field => (
                              <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                                {editingRow === row.id ? (
                                  renderInput(
                                    field,
                                    editData[field.name],
                                    (value) => handleEditInputChange(field.name, value),
                                    field.required
                                  )
                                ) : (
                                  <span className="text-sm text-gray-900">
                                    {formatDisplayValue(row[field.name], field.type)}
                                  </span>
                                )}
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingRow === row.id ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleSaveEdit}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-green-100 text-green-700 hover:bg-green-200"
                                  >
                                    <Save size={14} className="mr-1" />
                                    Kaydet
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  >
                                    <X size={14} className="mr-1" />
                                    İptal
                                  </button>
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditRow(row)}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  >
                                    <Edit size={14} className="mr-1" />
                                    Düzenle
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRow(row)}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-red-100 text-red-700 hover:bg-red-200"
                                  >
                                    <Trash2 size={14} className="mr-1" />
                                    Sil
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Stats */}
                {tableData.length > 0 && (
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    Toplam {tableData.length} kayıt
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deletingRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Kaydı Sil</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Bu kaydı kalıcı olarak silmek istediğinizden emin misiniz?
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Silinecek kayıt:</p>
                {currentTable?.fields.slice(0, 3).map(field => (
                  <div key={field.id} className="text-sm text-gray-600">
                    <strong>{field.name}:</strong> {formatDisplayValue(deletingRow[field.name], field.type)}
                  </div>
                ))}
                {currentTable && currentTable.fields.length > 3 && (
                  <div className="text-sm text-gray-500 mt-1">
                    +{currentTable.fields.length - 3} alan daha...
                  </div>
                )}
              </div>
              
              <p className="text-sm text-red-600 mt-3">
                ⚠️ Bu işlem geri alınamaz!
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteRow}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteRow}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Kaydı Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDataPage;