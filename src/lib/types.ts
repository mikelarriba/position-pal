export type PositionStatus = 'bookmarked' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';

export interface Company {
  id: string;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  description: string | null;
  size: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  company_id: string;
  company: string;
  role: string;
  url: string | null;
  status: PositionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PositionWithCompany extends Position {
  companies?: Company;
}

export interface CompanyWithPositions extends Company {
  positions: Position[];
}

export interface CompanyFormData {
  name: string;
  website?: string;
  linkedin_url?: string;
  description?: string;
  size?: string;
  industry?: string;
}

export interface PositionFormData {
  company_id: string;
  company: string;
  role: string;
  url?: string;
  status: PositionStatus;
  notes?: string;
}

export const STATUS_LABELS: Record<PositionStatus, string> = {
  bookmarked: 'Bookmarked',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offered: 'Offered',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const STATUS_ORDER: PositionStatus[] = [
  'interviewing',
  'applied',
  'offered',
  'bookmarked',
  'rejected',
  'withdrawn',
];
