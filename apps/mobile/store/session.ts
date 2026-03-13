import { create } from 'zustand';
import * as Crypto from 'expo-crypto';

/**
 * POS session (shift) management.
 *
 * Tracks the current open shift: who opened it, when, the opening
 * cash float, and which event it's for. Orders created during the
 * session are linked via session_id.
 */

export interface POSSession {
  id: string;
  tenant_id: string;
  user_id: string;
  event_id: string | null;
  device_id: string | null;
  opening_cash: number; // cents
  closing_cash: number | null; // cents, set on close
  opened_at: string; // ISO 8601
  closed_at: string | null;
  notes: string | null;
}

export interface ShiftSummary {
  totalOrders: number;
  totalRevenue: number; // cents
  cashRevenue: number;
  cardRevenue: number;
  invoiceRevenue: number;
  otherRevenue: number;
  expectedCash: number; // opening_cash + cash revenue
  actualCash: number; // counted on close
  difference: number; // actual - expected
}

interface SessionState {
  activeSession: POSSession | null;
  requireShiftForOrders: boolean; // configurable

  // Actions
  openShift: (params: {
    tenantId: string;
    userId: string;
    eventId: string | null;
    deviceId: string | null;
    openingCash: number;
  }) => POSSession;

  closeShift: (closingCash: number, notes?: string) => POSSession | null;

  setRequireShift: (required: boolean) => void;

  // Queries
  isShiftOpen: () => boolean;
  getSessionId: () => string | null;
}

export const useSession = create<SessionState>((set, get) => ({
  activeSession: null,
  requireShiftForOrders: false,

  openShift: ({ tenantId, userId, eventId, deviceId, openingCash }) => {
    const session: POSSession = {
      id: Crypto.randomUUID(),
      tenant_id: tenantId,
      user_id: userId,
      event_id: eventId,
      device_id: deviceId,
      opening_cash: openingCash,
      closing_cash: null,
      opened_at: new Date().toISOString(),
      closed_at: null,
      notes: null,
    };

    // TODO: Insert into PowerSync local DB
    // db.insertInto('sessions').values(session).execute();

    set({ activeSession: session });
    return session;
  },

  closeShift: (closingCash, notes) => {
    const session = get().activeSession;
    if (!session) return null;

    const closedSession: POSSession = {
      ...session,
      closing_cash: closingCash,
      closed_at: new Date().toISOString(),
      notes: notes ?? session.notes,
    };

    // TODO: Update in PowerSync local DB
    // db.update('sessions').set(closedSession).where('id', '=', session.id).execute();

    set({ activeSession: null });
    return closedSession;
  },

  setRequireShift: (required) => set({ requireShiftForOrders: required }),

  isShiftOpen: () => get().activeSession !== null,
  getSessionId: () => get().activeSession?.id ?? null,
}));
