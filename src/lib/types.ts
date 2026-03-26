export type PositionStatus = 'bookmarked' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';

export type MessageType = 'note' | 'email' | 'comment' | 'meeting';

export interface Company {
  id: string;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  description: string | null;
  size: string | null;
  industry: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  short_id: string | null;
  company_id: string;
  company: string;
  role: string;
  url: string | null;
  status: PositionStatus;
  notes: string | null;
  description: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  position_id: string;
  message_type: MessageType;
  author: string;
  content: string;
  occurred_at: string;
  created_at: string;
}

export interface CommunicationWithPosition extends Communication {
  position?: Position;
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
  archived?: boolean;
}

export interface PositionFormData {
  company_id: string;
  company: string;
  role: string;
  url?: string;
  status: PositionStatus;
  notes?: string;
  description?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
}

export interface CommunicationFormData {
  position_id: string;
  message_type: MessageType;
  author: string;
  content: string;
  occurred_at?: string;
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

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  note: 'Note',
  email: 'Email',
  comment: 'Comment',
  meeting: 'Meeting',
};

export const MESSAGE_TYPE_ICONS: Record<MessageType, string> = {
  note: '📝',
  email: '✉️',
  comment: '💬',
  meeting: '📅',
};
