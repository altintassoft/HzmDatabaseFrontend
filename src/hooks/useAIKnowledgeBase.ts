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
  generating: boolean;
  error: string | null;
  generateReport: () => Promise<void>;
}

export const useAIKnowledgeBase = (reportType: string): UseAIKnowledgeBaseReturn => {
  const [report, setReport] = useState<Report | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      // Generate report and get content directly (no AI KB fetch needed)
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
    generating,
    error,
    generateReport
  };
};

