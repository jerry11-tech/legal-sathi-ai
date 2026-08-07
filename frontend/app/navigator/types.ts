export type CaseAnalysis = {
  case_id: string;
  case_summary: string;
  legal_category: string;
  urgency_level: string;
  confidence_score: number;
  progress_percentage: number;
  clarifying_questions: Array<{
    id: string;
    question: string;
    answered: boolean;
    answer_value?: string;
  }>;
  action_plan: {
    immediate_actions: Array<{ step: number; title: string; purpose: string; why_it_matters: string; expected_outcome: string }>;
    actions_24h: Array<{ step: number; title: string; purpose: string; why_it_matters: string; expected_outcome: string }>;
    actions_7d: Array<{ step: number; title: string; purpose: string; why_it_matters: string; expected_outcome: string }>;
    long_term_actions: Array<{ step: number; title: string; purpose: string; why_it_matters: string; expected_outcome: string }>;
  };
  evidence_checklist: Array<{
    id: string;
    item: string;
    description: string;
    status: 'pending' | 'uploaded' | 'verified';
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
  }>;
  required_documents: Array<{ doc_name: string; why_needed: string; where_to_obtain: string; accepted_formats: string }>;
  authorities: Array<{ name: string; role: string; when_to_contact: string; contact_guide: string; official_website: string }>;
  timeline_steps: Array<{ id: string; step_name: string; description: string; completed: boolean }>;
  risk_analysis: Array<{ risk_type: string; description: string; recommendation: string }>;
  draft_type: string;
  disclaimer: string;
};

export type SavedCase = {
  id: number;
  case_code: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  data: CaseAnalysis;
};
