// FilterPanel Component - Advanced filter UI
// Works with useSearch hook

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterOption } from '../../hooks/useSearch';

export interface FilterField {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: { value: any; label: string }[];
}

export interface FilterPanelProps {
  fields: FilterField[];
  filters: FilterOption[];
  onAdd: (filter: FilterOption) => void;
  onRemove: (field: string) => void;
  onClear: () => void;
  className?: string;
}

const OPERATORS = {
  text: [
    { value: 'like', label: 'Contains' },
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not equals' },
  ],
  number: [
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less or equal' },
  ],
  date: [
    { value: 'eq', label: 'On' },
    { value: 'gt', label: 'After' },
    { value: 'lt', label: 'Before' },
  ],
  select: [
    { value: 'eq', label: 'Is' },
    { value: 'neq', label: 'Is not' },
    { value: 'in', label: 'In' },
  ],
  boolean: [
    { value: 'eq', label: 'Is' },
  ],
};

/**
 * FilterPanel Component
 * 
 * @example
 * ```tsx
 * const search = useSearch();
 * 
 * const fields: FilterField[] = [
 *   { field: 'status', label: 'Status', type: 'select', options: [
 *     { value: 'active', label: 'Active' },
 *     { value: 'inactive', label: 'Inactive' },
 *   ]},
 *   { field: 'email', label: 'Email', type: 'text' },
 *   { field: 'created_at', label: 'Created', type: 'date' },
 * ];
 * 
 * <FilterPanel
 *   fields={fields}
 *   filters={search.filters}
 *   onAdd={search.addFilter}
 *   onRemove={search.removeFilter}
 *   onClear={search.clearFilters}
 * />
 * ```
 */
export function FilterPanel({
  fields,
  filters,
  onAdd,
  onRemove,
  onClear,
  className = '',
}: FilterPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedOperator, setSelectedOperator] = useState<string>('eq');
  const [filterValue, setFilterValue] = useState<string>('');

  const selectedFieldConfig = fields.find(f => f.field === selectedField);
  const operators = selectedFieldConfig ? OPERATORS[selectedFieldConfig.type] : [];

  const handleAddFilter = () => {
    if (!selectedField || !filterValue) return;

    onAdd({
      field: selectedField,
      operator: selectedOperator as any,
      value: filterValue,
    });

    // Reset form
    setSelectedField('');
    setSelectedOperator('eq');
    setFilterValue('');
  };

  const getFilterLabel = (filter: FilterOption): string => {
    const field = fields.find(f => f.field === filter.field);
    if (!field) return filter.field;

    const operator = OPERATORS[field.type as keyof typeof OPERATORS]?.find(
      op => op.value === filter.operator
    );

    let valueLabel = filter.value;
    if (field.type === 'select' && field.options) {
      const option = field.options.find(opt => opt.value === filter.value);
      if (option) valueLabel = option.label;
    }

    return `${field.label} ${operator?.label || filter.operator} ${valueLabel}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {t('filter.filters', 'Filters')}
        {filters.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
            {filters.length}
          </span>
        )}
      </button>

      {/* Filter dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600">
          <div className="p-4 space-y-4">
            {/* Add filter form */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('filter.addFilter', 'Add Filter')}
              </h3>

              {/* Field selector */}
              <select
                value={selectedField}
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  const field = fields.find(f => f.field === e.target.value);
                  if (field) {
                    const defaultOp = OPERATORS[field.type][0].value;
                    setSelectedOperator(defaultOp);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">{t('filter.selectField', 'Select field...')}</option>
                {fields.map(field => (
                  <option key={field.field} value={field.field}>
                    {field.label}
                  </option>
                ))}
              </select>

              {/* Operator selector */}
              {selectedField && (
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Value input */}
              {selectedField && selectedFieldConfig && (
                <>
                  {selectedFieldConfig.type === 'select' && selectedFieldConfig.options ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('filter.selectValue', 'Select value...')}</option>
                      {selectedFieldConfig.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : selectedFieldConfig.type === 'boolean' ? (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">{t('filter.selectValue', 'Select value...')}</option>
                      <option value="true">{t('filter.true', 'True')}</option>
                      <option value="false">{t('filter.false', 'False')}</option>
                    </select>
                  ) : (
                    <input
                      type={selectedFieldConfig.type}
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      placeholder={t('filter.enterValue', 'Enter value...')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                </>
              )}

              {/* Add button */}
              <button
                onClick={handleAddFilter}
                disabled={!selectedField || !filterValue}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
              >
                {t('filter.addFilter', 'Add Filter')}
              </button>
            </div>

            {/* Active filters */}
            {filters.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t('filter.activeFilters', 'Active Filters')}
                  </h3>
                  <button
                    onClick={onClear}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {t('filter.clearAll', 'Clear all')}
                  </button>
                </div>

                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div
                      key={`${filter.field}-${index}`}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md dark:bg-gray-700"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getFilterLabel(filter)}
                      </span>
                      <button
                        onClick={() => onRemove(filter.field)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

