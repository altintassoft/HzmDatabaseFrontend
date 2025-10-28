import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../../context/DatabaseContext';
import { 
  PlusCircle, 
  FileText, 
  AlertCircle, 
  GripVertical, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Link,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FieldValidation, FieldRelationship, Field } from '../../types';

const dataTypes = [
  { value: 'string', label: 'Metin (String)', icon: '📝' },
  { value: 'number', label: 'Sayı (Number)', icon: '🔢' },
  { value: 'boolean', label: 'Boolean', icon: '☑️' },
  { value: 'date', label: 'Tarih (Date)', icon: '📅' },
  { value: 'object', label: 'Nesne (Object)', icon: '🗂️' },
  { value: 'array', label: 'Dizi (Array)', icon: '📋' },
  { value: 'relation', label: 'İlişki (Relation)', icon: '🔗' },
  { value: 'currency', label: 'Para Birimi (Currency)', icon: '💰' },
  { value: 'weight', label: 'Ağırlık (Weight)', icon: '⚖️' },
];

const currencies = [
  { value: 'TRY', label: 'Türk Lirası (₺)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
];

const weightUnits = [
  { value: 'g', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 't', label: 'Ton (t)' },
];

const relationshipTypes = [
  { value: 'one-to-one', label: 'Bire Bir (1:1)', icon: '🔗' },
  { value: 'one-to-many', label: 'Bire Çok (1:N)', icon: '🔗📋' },
  { value: 'many-to-many', label: 'Çoka Çok (N:N)', icon: '🔗🔗' },
];

interface SortableFieldRowProps {
  id: string;
  name: string;
  type: string;
  required: boolean;
  validation?: FieldValidation;
  description?: string;
  relationships?: FieldRelationship[];
  onEdit: (field: Field) => void;
}

const SortableFieldRow: React.FC<SortableFieldRowProps> = ({ 
  id, 
  name, 
  type, 
  required, 
  validation,
  description,
  relationships = [],
  onEdit
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { dispatch } = useDatabase();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeIcon = (type: string) => {
    const typeData = dataTypes.find(t => t.value === type);
    return typeData?.icon || '📄';
  };

  const getValidationSummary = (type: string, validation?: FieldValidation) => {
    if (!validation) return null;
    
    const summaries = [];
    
    switch (type) {
      case 'string':
        if (validation.pattern) summaries.push(`Pattern`);
        if (validation.minLength) summaries.push(`Min: ${validation.minLength}`);
        if (validation.maxLength) summaries.push(`Max: ${validation.maxLength}`);
        break;
      case 'number':
        if (validation.minValue !== undefined) summaries.push(`Min: ${validation.minValue}`);
        if (validation.maxValue !== undefined) summaries.push(`Max: ${validation.maxValue}`);
        break;
      case 'date':
        if (validation.dateType) summaries.push(`${validation.dateType}`);
        break;
      case 'array':
        if (validation.arrayItemType) summaries.push(`${validation.arrayItemType}[]`);
        break;
      case 'relation':
        if (validation.relatedTable) summaries.push(`→ ${validation.relatedTable}`);
        break;
      case 'currency':
        if (validation.currency) summaries.push(`${validation.currency}`);
        break;
      case 'weight':
        if (validation.weightUnit) summaries.push(`${validation.weightUnit}`);
        break;
    }
    
    return summaries.length > 0 ? summaries.join(', ') : null;
  };

  const handleDeleteField = () => {
    if (confirm(`"${name}" alanını silmek istediğinizden emin misiniz?`)) {
      dispatch({
        type: 'DELETE_FIELD',
        payload: { fieldId: id }
      });
    }
  };

  const handleEditClick = () => {
    onEdit({
      id,
      name,
      type,
      required,
      validation,
      description,
      relationships
    });
  };

  return (
    <>
      <tr ref={setNodeRef} style={style} className="hover:bg-amber-50 group">
        <td className="px-3 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <button
              className="mr-3 cursor-grab hover:text-amber-600 touch-none opacity-0 group-hover:opacity-100 transition-opacity"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </button>
            <span className="mr-3 text-lg">{getTypeIcon(type)}</span>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-medium text-gray-900">{name}</span>
                {relationships.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Link size={10} className="mr-1" />
                    {relationships.length}
                  </span>
                )}
                {required && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle size={10} className="mr-1" />
                    Zorunlu
                  </span>
                )}
              </div>
              {description && (
                <div className="text-xs text-gray-500 mt-1">{description}</div>
              )}
              {getValidationSummary(type, validation) && (
                <div className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded inline-block">
                  {getValidationSummary(type, validation)}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {dataTypes.find(t => t.value === type)?.label || type}
          </span>
        </td>
        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
              title="Düzenle"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
              title="Detayları Göster"
            >
              {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={handleDeleteField}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Alanı Sil"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
      
      {/* Details Row */}
      {showDetails && (
        <tr className="bg-gray-50">
          <td colSpan={3} className="px-6 py-4">
            <div className="text-sm space-y-3">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Alan Detayları</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Alan ID:</span>
                    <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Oluşturulma:</span>
                    <span className="ml-2 text-gray-800">Bilinmiyor</span>
                  </div>
                </div>
              </div>
              
              {validation && Object.keys(validation).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Validation Kuralları</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(validation).map(([key, value]) => (
                      <div key={key} className="flex justify-between bg-white p-2 rounded">
                        <span className="text-gray-600 capitalize text-xs">
                          {key.replace(/([A-Z])/g, ' $1')}:
                        </span>
                        <span className="font-medium text-xs">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {relationships.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Link size={16} className="mr-2" />
                    İlişkiler ({relationships.length})
                  </h4>
                  <div className="space-y-2">
                    {relationships.map((relationship) => (
                      <div key={relationship.id} className="bg-white p-3 rounded border text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{relationship.relationshipType}</span>
                            <span className="text-gray-500 mx-2">→</span>
                            <span className="text-gray-700">{relationship.targetTableId}</span>
                          </div>
                          {relationship.cascadeDelete && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Cascade
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

interface FieldEditModalProps {
  field: Field | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fieldData: Partial<Field>) => void;
}

const FieldEditModal: React.FC<FieldEditModalProps> = ({ field, isOpen, onClose, onSave }) => {
  const { state } = useDatabase();
  const [editData, setEditData] = useState({
    name: field?.name || '',
    type: field?.type || 'string',
    required: field?.required || false,
    description: field?.description || '',
  });
  const [validation, setValidation] = useState<FieldValidation>(field?.validation || {});
  const [activeTab, setActiveTab] = useState<'basic' | 'validation' | 'relationships'>('basic');

  React.useEffect(() => {
    if (field) {
      setEditData({
        name: field.name,
        type: field.type,
        required: field.required,
        description: field.description || '',
      });
      setValidation(field.validation || {});
      setActiveTab('basic');
    }
  }, [field]);

  if (!isOpen || !field) return null;

  const handleSave = () => {
    onSave({
      ...editData,
      validation: Object.keys(validation).length > 0 ? validation : undefined,
    });
    onClose();
  };

  const renderValidationFields = () => {
    switch (editData.type) {
      case 'string':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pattern (Regex)
              </label>
              <input
                type="text"
                value={validation.pattern || ''}
                onChange={(e) => setValidation({...validation, pattern: e.target.value})}
                placeholder="^[a-zA-Z0-9]+$"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Uzunluk
                </label>
                <input
                  type="number"
                  value={validation.minLength || ''}
                  onChange={(e) => setValidation({...validation, minLength: Number(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Uzunluk
                </label>
                <input
                  type="number"
                  value={validation.maxLength || ''}
                  onChange={(e) => setValidation({...validation, maxLength: Number(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Değer
              </label>
              <input
                type="number"
                value={validation.minValue || ''}
                onChange={(e) => setValidation({...validation, minValue: Number(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Değer
              </label>
              <input
                type="number"
                value={validation.maxValue || ''}
                onChange={(e) => setValidation({...validation, maxValue: Number(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        );

      case 'currency':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para Birimi
              </label>
              <select
                value={validation.currency || 'TRY'}
                onChange={(e) => setValidation({...validation, currency: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {currencies.map(currency => (
                  <option key={currency.value} value={currency.value}>{currency.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ondalık Basamak
                </label>
                <select
                  value={validation.decimalPlaces || 2}
                  onChange={(e) => setValidation({...validation, decimalPlaces: Number(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onlyPositive"
                  checked={validation.onlyPositive || false}
                  onChange={(e) => setValidation({...validation, onlyPositive: e.target.checked})}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="onlyPositive" className="ml-2 block text-sm text-gray-700">
                  Sadece Pozitif
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Settings size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Bu alan türü için henüz validation kuralları mevcut değil.</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{dataTypes.find(t => t.value === editData.type)?.icon}</span>
              <div>
                <h2 className="text-xl font-bold">Alan Düzenle</h2>
                <p className="text-amber-100 text-sm">{editData.name || 'Yeni Alan'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-200 p-2 rounded-full hover:bg-amber-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-amber-500 text-amber-600 bg-amber-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Temel Bilgiler
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'validation'
                  ? 'border-amber-500 text-amber-600 bg-amber-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={16} className="inline mr-2" />
              Validation
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'relationships'
                  ? 'border-amber-500 text-amber-600 bg-amber-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Link size={16} className="inline mr-2" />
              İlişkiler ({field.relationships?.length || 0})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alan Adı
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-medium"
                  placeholder="Alan adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alan Türü
                </label>
                <select
                  value={editData.type}
                  onChange={(e) => {
                    setEditData({...editData, type: e.target.value});
                    setValidation({});
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {dataTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Alan hakkında açıklama (isteğe bağlı)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required-edit"
                  checked={editData.required}
                  onChange={(e) => setEditData({...editData, required: e.target.checked})}
                  className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="required-edit" className="ml-3 block text-sm font-medium text-gray-700">
                  Bu alan zorunlu
                </label>
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  {dataTypes.find(t => t.value === editData.type)?.label} Validation Kuralları
                </h3>
                <p className="text-sm text-blue-600">
                  Bu alan türü için geçerli validation kurallarını ayarlayın.
                </p>
              </div>
              {renderValidationFields()}
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-800 mb-2">
                  Alan İlişkileri
                </h3>
                <p className="text-sm text-purple-600">
                  Bu alan için tanımlanmış ilişkiler burada görüntülenir.
                </p>
              </div>
              
              {field.relationships && field.relationships.length > 0 ? (
                <div className="space-y-3">
                  {field.relationships.map((relationship) => (
                    <div key={relationship.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {relationshipTypes.find(rt => rt.value === relationship.relationshipType)?.label}
                            </span>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {relationship.targetTableId}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Hedef: {relationship.targetFieldId}
                          </p>
                        </div>
                        {relationship.cascadeDelete && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Cascade Delete
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Link size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Bu alan için henüz ilişki tanımlanmamış.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Son güncelleme: {new Date().toLocaleString('tr-TR')}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
            >
              <Save size={16} className="mr-2" />
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldPanel: React.FC = () => {
  const { state, dispatch } = useDatabase();
  const navigate = useNavigate();
  const [newField, setNewField] = useState({
    name: '',
    type: 'string',
    required: false,
    description: '',
  });
  const [validation, setValidation] = useState<FieldValidation>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [selectedFieldForRelation, setSelectedFieldForRelation] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [newRelationship, setNewRelationship] = useState({
    targetTableId: '',
    targetFieldId: '',
    relationshipType: 'one-to-many' as 'one-to-one' | 'one-to-many' | 'many-to-many',
    cascadeDelete: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && state.selectedTable) {
      const oldIndex = state.selectedTable.fields.findIndex(field => field.id === active.id);
      const newIndex = state.selectedTable.fields.findIndex(field => field.id === over.id);

      dispatch({
        type: 'REORDER_FIELDS',
        payload: {
          oldIndex,
          newIndex,
        },
      });
    }
  };
  
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (newField.name.trim() && state.selectedProject && state.selectedTable) {
      dispatch({
        type: 'ADD_FIELD',
        payload: {
          name: newField.name,
          type: newField.type,
          required: newField.required,
          validation: Object.keys(validation).length > 0 ? validation : undefined,
          description: newField.description.trim() || undefined,
        },
      });
      setNewField({
        name: '',
        type: 'string',
        required: false,
        description: '',
      });
      setValidation({});
      setShowAdvanced(false);
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
  };

  const handleSaveField = (fieldData: Partial<Field>) => {
    if (editingField) {
      dispatch({
        type: 'UPDATE_FIELD',
        payload: {
          fieldId: editingField.id,
          ...fieldData,
        },
      });
    }
  };

  const handleAddRelationship = () => {
    if (selectedFieldForRelation && newRelationship.targetTableId && newRelationship.targetFieldId) {
      const relationship: FieldRelationship = {
        id: Date.now().toString(),
        sourceFieldId: selectedFieldForRelation,
        targetTableId: newRelationship.targetTableId,
        targetFieldId: newRelationship.targetFieldId,
        relationshipType: newRelationship.relationshipType,
        cascadeDelete: newRelationship.cascadeDelete,
        createdAt: new Date().toISOString(),
      };

      dispatch({
        type: 'ADD_FIELD_RELATIONSHIP',
        payload: { fieldId: selectedFieldForRelation, relationship }
      });

      setShowRelationshipModal(false);
      setSelectedFieldForRelation(null);
      setNewRelationship({
        targetTableId: '',
        targetFieldId: '',
        relationshipType: 'one-to-many',
        cascadeDelete: false,
      });
    }
  };

  const handleViewData = () => {
    if (state.selectedProject && state.selectedTable) {
      navigate(`/projects/${state.selectedProject.id}/data`);
    }
  };

  const getAvailableFields = (tableId: string) => {
    const table = state.selectedProject?.tables.find(t => t.id === tableId);
    return table?.fields || [];
  };

  const renderValidationFields = () => {
    switch (newField.type) {
      case 'string':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pattern (Regex)
              </label>
              <input
                type="text"
                value={validation.pattern || ''}
                onChange={(e) => setValidation({...validation, pattern: e.target.value})}
                placeholder="^[a-zA-Z0-9]+$"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Uzunluk
                </label>
                <input
                  type="number"
                  value={validation.minLength || ''}
                  onChange={(e) => setValidation({...validation, minLength: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uzunluk
                </label>
                <input
                  type="number"
                  value={validation.maxLength || ''}
                  onChange={(e) => setValidation({...validation, maxLength: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Değer
              </label>
              <input
                type="number"
                value={validation.minValue || ''}
                onChange={(e) => setValidation({...validation, minValue: Number(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Değer
              </label>
              <input
                type="number"
                value={validation.maxValue || ''}
                onChange={(e) => setValidation({...validation, maxValue: Number(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500 text-sm">
            Bu alan türü için validation kuralları mevcut değil.
          </div>
        );
    }
  };
  
  const isPanelDisabled = !state.selectedProject || !state.selectedTable;
  const hasFields = state.selectedTable?.fields.length > 0;
  
  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-4 ${isPanelDisabled ? 'opacity-70' : ''}`}>
        <h2 className="text-lg font-semibold mb-4 text-amber-700 flex items-center">
          <FileText size={20} className="mr-2" />
          Alanlar
          {state.selectedTable && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({state.selectedTable.name})
            </span>
          )}
        </h2>
        
        <form onSubmit={handleAddField} className="mb-4 space-y-3">
          <div>
            <input
              type="text"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              placeholder="Alan adı"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isPanelDisabled}
            />
          </div>
          
          <div>
            <select
              value={newField.type}
              onChange={(e) => {
                setNewField({ ...newField, type: e.target.value });
                setValidation({});
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isPanelDisabled}
            >
              {dataTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              value={newField.description}
              onChange={(e) => setNewField({ ...newField, description: e.target.value })}
              placeholder="Alan açıklaması (isteğe bağlı)"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              disabled={isPanelDisabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required-field"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                disabled={isPanelDisabled}
              />
              <label htmlFor="required-field" className="ml-2 block text-sm text-gray-700">
                Zorunlu alan
              </label>
            </div>
            
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-amber-600 hover:text-amber-700"
              disabled={isPanelDisabled}
            >
              <Settings size={16} className="mr-1" />
              Gelişmiş
              {showAdvanced ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
          </div>

          {showAdvanced && (
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Validation Kuralları</h4>
              {renderValidationFields()}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                isPanelDisabled
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
              disabled={isPanelDisabled}
            >
              <PlusCircle size={16} className="mr-1" />
              Alan Ekle
            </button>
          </div>
        </form>
        
        <div className="panel-content">
          {!state.selectedProject || !state.selectedTable ? (
            <p className="text-gray-500 text-sm italic text-center py-4">
              Lütfen önce bir tablo seçin.
            </p>
          ) : state.selectedTable.fields.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-4">
              Bu tabloda henüz hiç alan yok. İlk alanınızı ekleyin.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alan Bilgileri</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Türü</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={state.selectedTable.fields.map(field => field.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {state.selectedTable.fields.map((field) => (
                        <SortableFieldRow
                          key={field.id}
                          id={field.id}
                          name={field.name}
                          type={field.type}
                          required={field.required}
                          validation={field.validation}
                          description={field.description}
                          relationships={field.relationships}
                          onEdit={handleEditField}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Add Relationship Button */}
        {hasFields && (
          <div className="mt-4 border-t pt-4">
            <button
              onClick={() => setShowRelationshipModal(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
            >
              <Link size={16} className="mr-2" />
              İlişki Ekle
            </button>
          </div>
        )}
        
        <div className="mt-4 border-t pt-4">
          <button
            onClick={handleViewData}
            className={`w-full px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              hasFields && state.selectedProject && state.selectedTable
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 opacity-60 cursor-not-allowed'
            }`}
            disabled={!hasFields || !state.selectedProject || !state.selectedTable}
          >
            Verileri Görüntüle
          </button>
        </div>
      </div>

      {/* Field Edit Modal */}
      <FieldEditModal
        field={editingField}
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        onSave={handleSaveField}
      />

      {/* Relationship Modal */}
      {showRelationshipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Link size={20} className="mr-2" />
                İlişki Ekle
              </h3>
              <button
                onClick={() => setShowRelationshipModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kaynak Alan
                </label>
                <select
                  value={selectedFieldForRelation || ''}
                  onChange={(e) => setSelectedFieldForRelation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alan Seçin</option>
                  {state.selectedTable?.fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hedef Tablo
                </label>
                <select
                  value={newRelationship.targetTableId}
                  onChange={(e) => setNewRelationship({...newRelationship, targetTableId: e.target.value, targetFieldId: ''})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tablo Seçin</option>
                  {state.selectedProject?.tables.filter(t => t.id !== state.selectedTable?.id).map(table => (
                    <option key={table.id} value={table.id}>{table.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hedef Alan
                </label>
                <select
                  value={newRelationship.targetFieldId}
                  onChange={(e) => setNewRelationship({...newRelationship, targetFieldId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!newRelationship.targetTableId}
                >
                  <option value="">Alan Seçin</option>
                  {getAvailableFields(newRelationship.targetTableId).map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İlişki Türü
                </label>
                <select
                  value={newRelationship.relationshipType}
                  onChange={(e) => setNewRelationship({...newRelationship, relationshipType: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {relationshipTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cascadeDeleteModal"
                  checked={newRelationship.cascadeDelete}
                  onChange={(e) => setNewRelationship({...newRelationship, cascadeDelete: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="cascadeDeleteModal" className="ml-2 block text-sm text-gray-700">
                  Cascade Delete
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRelationshipModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleAddRelationship}
                disabled={!selectedFieldForRelation || !newRelationship.targetTableId || !newRelationship.targetFieldId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Plus size={16} className="mr-2" />
                İlişki Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FieldPanel;