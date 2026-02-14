export type DietStatus = 'draft' | 'finalized';
export type GenerationStatus = 'pending' | 'success' | 'failed';

export type Diet = {
  id: string;
  user_id?: string | number;
  title?: string;
  status?: DietStatus;
  generation_method?: 'ai' | 'manual';
  generation_status?: GenerationStatus;
  llm_provider?: string | null;
  llm_model?: string | null;
  prompt_version?: string | null;
  profile_snapshot?: Record<string, any> | null;
  diet_data?: Record<string, any> | null;
  generation_error?: string | null;
  generated_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DietListResponse = {
  data?: Diet[];
  items?: Diet[];
  diets?: Diet[];
} | Diet[];

export type DashboardSummary = {
  total?: number;
  total_diets?: number;
  time_series?: any;
  breakdowns?: Record<string, any>;
} & Record<string, any>;

export type LoginResponse = {
  id: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  role?: number;
  status?: number;
  message?: string;
  error?: string;
};
