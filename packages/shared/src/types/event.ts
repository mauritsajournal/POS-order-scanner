export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface TradeShowEvent {
  id: string;
  tenant_id: string;
  name: string;
  location: string | null;
  start_date: string;
  end_date: string;
  status: EventStatus;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
