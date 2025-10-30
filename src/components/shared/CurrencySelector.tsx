import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import api from '../../services/api';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_digits: number;
  is_default: boolean;
}

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

export default function CurrencySelector({ value, onChange, disabled = false }: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/admin/currencies');
      if (response.success) {
        setCurrencies(response.currencies);
      }
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <DollarSign size={16} className="inline mr-2" />
        Para Birimi
      </label>
      
      {loading ? (
        <div className="text-sm text-gray-500">Yükleniyor...</div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      )}

      {selectedCurrency && (
        <p className="text-xs text-gray-500">
          Seçili: {selectedCurrency.symbol} {selectedCurrency.name}
          {selectedCurrency.is_default && ' (Varsayılan)'}
        </p>
      )}
    </div>
  );
}

