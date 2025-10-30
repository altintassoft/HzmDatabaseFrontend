import { useState } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';

interface Report {
  id: string;
  report_type: string;
  title: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface UseAIKnowledgeBaseReturn {
  report: Report | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  fetchLatestReport: () => Promise<void>;
  generateReport: () => Promise<void>;
}

export const useAIKnowledgeBase = (reportType: string): UseAIKnowledgeBaseReturn => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest report if exists
  const fetchLatestReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(ENDPOINTS.ADMIN.GET_LATEST_REPORT, {
        params: { type: reportType }
      });

      if (response.success && response.report) {
        setReport(response.report);
      } else {
        setReport(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch latest report:', err);
      // Silent fail - not an error if report doesn't exist
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate new report (UPSERT - replaces old)
  const generateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await api.post(ENDPOINTS.ADMIN.GENERATE_REPORT, {
        params: { type: reportType }
      });

      if (response.success && response.report) {
        setReport(response.report);
      } else {
        setError('Rapor oluşturulamadı');
      }
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'Rapor oluşturulamadı');
    } finally {
      setGenerating(false);
    }
  };

  return {
    report,
    loading,
    generating,
    error,
    fetchLatestReport,
    generateReport
  };
};

