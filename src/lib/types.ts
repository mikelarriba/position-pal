export type PositionStatus = 'bookmarked' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';

export interface Position {
  id: string;
  company: string;
  role: string;
  url: string | null;
  status: PositionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PositionFormData {
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
