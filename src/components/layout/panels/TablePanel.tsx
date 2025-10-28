import React, { useState } from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { PlusCircle, Table, Trash2, AlertTriangle } from 'lucide-react';

const TablePanel: React.FC = () => {
  const { state, dispatch } = useDatabase();
  const [newTableName, setNewTableName] = useState('');
  const [deletingTable, setDeletingTable] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableName.trim() && state.selectedProject) {
      // Check if table name already exists
      const tableExists = state.selectedProject.tables.some(
        table => table.name.toLowerCase() === newTableName.trim().toLowerCase()
      );
      
      if (tableExists) {
        alert('Bu isimde bir tablo zaten mevcut. Lütfen farklı bir isim seçin.');
        return;
      }
      
      dispatch({ type: 'ADD_TABLE', payload: { name: newTableName.trim() } });
      setNewTableName('');
    }
  };
  
  const handleSelectTable = (tableId: string) => {
    dispatch({ type: 'SELECT_TABLE', payload: { tableId } });
  };

  const handleDeleteTable = (tableId: string, tableName: string) => {
    setDeletingTable(tableId);
    setDeleteConfirmName('');
  };

  const confirmDeleteTable = () => {
    if (deletingTable && state.selectedProject) {
      const tableToDelete = state.selectedProject.tables.find(t => t.id === deletingTable);
      if (tableToDelete && deleteConfirmName === tableToDelete.name) {
        dispatch({ type: 'DELETE_TABLE', payload: { tableId: deletingTable } });
        setDeletingTable(null);
        setDeleteConfirmName('');
      }
    }
  };

  const cancelDeleteTable = () => {
    setDeletingTable(null);
    setDeleteConfirmName('');
  };
  
  // Determine if the panel should be disabled
  const isPanelDisabled = !state.selectedProject;
  
  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-4 ${isPanelDisabled ? 'opacity-70' : ''}`}>
        <h2 className="text-lg font-semibold mb-4 text-teal-700 flex items-center">
          <Table size={20} className="mr-2" />
          Tablolar
          {state.selectedProject && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({state.selectedProject.name})
            </span>
          )}
        </h2>
        
        <form onSubmit={handleAddTable} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Yeni tablo adı"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isPanelDisabled}
            />
            <button
              type="submit"
              className={`px-3 py-2 rounded-md transition-colors flex items-center ${
                isPanelDisabled
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
              disabled={isPanelDisabled}
            >
              <PlusCircle size={16} className="mr-1" />
              Ekle
            </button>
          </div>
        </form>
        
        <div className="panel-content">
          {!state.selectedProject ? (
            <p className="text-gray-500 text-sm italic text-center py-4">
              Lütfen önce bir proje seçin.
            </p>
          ) : state.selectedProject.tables.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-4">
              Bu projede henüz hiç tablo yok. İlk tablonuzu ekleyin.
            </p>
          ) : (
            <div className="space-y-2">
              {state.selectedProject.tables.map((table) => (
                <div
                  key={table.id}
                  className={`panel-item p-3 rounded-md border border-gray-100 hover:border-teal-200 hover:bg-teal-50 group ${
                    state.selectedTable?.id === table.id
                      ? 'selected bg-teal-100 border-teal-300 font-medium'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSelectTable(table.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{table.name}</span>
                        <span className="text-xs text-gray-500">{table.fields.length} alan</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(table.id, table.name);
                      }}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Tabloyu Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Table Confirmation Modal */}
      {deletingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Tabloyu Sil</h3>
            </div>
            
            <div className="mb-6">
              {(() => {
                const tableToDelete = state.selectedProject?.tables.find(t => t.id === deletingTable);
                return (
                  <>
                    <p className="text-gray-600 mb-4">
                      <strong>{tableToDelete?.name}</strong> tablosunu ve tüm verilerini kalıcı olarak silmek istediğinizden emin misiniz?
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Silinecek tablo bilgileri:</p>
                      <div className="text-sm text-gray-600">
                        <div><strong>Tablo Adı:</strong> {tableToDelete?.name}</div>
                        <div><strong>Alan Sayısı:</strong> {tableToDelete?.fields.length}</div>
                        <div><strong>Alanlar:</strong> {tableToDelete?.fields.map(f => f.name).join(', ') || 'Henüz alan yok'}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-red-600 mb-4">
                      ⚠️ Bu işlem geri alınamaz! Tablonun tüm alanları ve verileri silinecektir.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Onaylamak için tablo adını tam olarak yazın: <strong>{tableToDelete?.name}</strong>
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        placeholder={tableToDelete?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteTable}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteTable}
                disabled={(() => {
                  const tableToDelete = state.selectedProject?.tables.find(t => t.id === deletingTable);
                  return deleteConfirmName !== tableToDelete?.name;
                })()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Tabloyu Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TablePanel;