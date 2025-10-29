import { useState } from 'react';
import api from '../services/api';

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

  // Fetch latest report from AI KB (if exists)
  const fetchLatestReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/admin/knowledge-base', {
        params: {
          report_type: reportType,
          limit: 1,
          sort: 'updated_at:desc'
        }
      });

      if (response.data && response.data.length > 0) {
        setReport(response.data[0]);
      } else {
        setReport(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch report:', err);
      // Not an error if report doesn't exist yet
      if (!err.message?.includes('403')) {
        setError(err.message || 'Rapor yüklenemedi');
      }
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate new report (admin can do this)
  const generateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await api.post(`/admin/generate-report?type=${reportType}`);

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

