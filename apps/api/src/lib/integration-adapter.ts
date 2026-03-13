/**
 * Integration adapter interface (INT-001).
 *
 * Defines the contract for all external system integrations (WooCommerce,
 * Exact Online, etc.). Each adapter implements this interface to provide
 * bi-directional data flow between ScanOrder and the external system.
 *
 * Base class provides common retry logic, error handling, and logging.
 */

import type { Product, ProductVariant, Customer, Order, OrderLine } from '@scanorder/shared';

// ---------- Types ----------

/** Result of an integration operation */
export interface IntegrationResult<T = void> {
  success: boolean;
  data?: T;
  error?: IntegrationError;
}

/** Structured error from an integration */
export interface IntegrationError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

/** Mapping between ScanOrder ID and external system ID */
export interface IntegrationMapping {
  scanorder_id: string;
  external_id: string;
  resource_type: 'product' | 'customer' | 'order' | 'invoice';
  last_synced_at: string;
  metadata?: Record<string, unknown>;
}

/** Credentials stored per-integration (encrypted in DB) */
export interface IntegrationCredentials {
  type: string;
  [key: string]: unknown;
}

/** Configuration for connection test */
export interface ConnectionTestResult {
  connected: boolean;
  latency_ms: number;
  version?: string;
  error?: string;
}

/** Pull options for incremental sync */
export interface PullOptions {
  since?: string; // ISO date for incremental sync
  limit?: number;
  cursor?: string; // pagination cursor
}

/** Pull result with pagination support */
export interface PullResult<T> {
  items: T[];
  total: number;
  cursor?: string; // next page cursor
  hasMore: boolean;
}

/** Webhook event payload */
export interface WebhookEvent {
  source: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  payload: Record<string, unknown>;
  timestamp: string;
  signature?: string;
}

// ---------- Interface ----------

/**
 * Integration adapter interface.
 *
 * All integration adapters (WooCommerce, Exact Online, etc.) must implement
 * this interface. Methods are optional — an adapter only needs to implement
 * the operations it supports.
 */
export interface IntegrationAdapter {
  /** Unique adapter identifier */
  readonly id: string;

  /** Human-readable adapter name */
  readonly name: string;

  /** Test the connection to the external system */
  testConnection(credentials: IntegrationCredentials): Promise<ConnectionTestResult>;

  /** Pull products from the external system */
  pullProducts?(options: PullOptions): Promise<IntegrationResult<PullResult<Partial<Product & { variants?: Partial<ProductVariant>[] }>>>>;

  /** Push an order to the external system */
  pushOrder?(order: Order, lines: OrderLine[]): Promise<IntegrationResult<IntegrationMapping>>;

  /** Pull customers from the external system */
  pullCustomers?(options: PullOptions): Promise<IntegrationResult<PullResult<Partial<Customer>>>>;

  /** Push a customer to the external system */
  pushCustomer?(customer: Customer): Promise<IntegrationResult<IntegrationMapping>>;

  /** Push an invoice to the external system (e.g., Exact Online) */
  pushInvoice?(order: Order, lines: OrderLine[]): Promise<IntegrationResult<IntegrationMapping>>;

  /** Handle incoming webhook from the external system */
  handleWebhook?(event: WebhookEvent): Promise<IntegrationResult>;
}

// ---------- Base class ----------

/** Retry configuration */
interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

/**
 * Base class for integration adapters.
 *
 * Provides common functionality:
 * - Retry logic with exponential backoff
 * - Error classification (retryable vs permanent)
 * - Request logging
 * - Credential management
 */
export abstract class BaseIntegrationAdapter implements IntegrationAdapter {
  abstract readonly id: string;
  abstract readonly name: string;

  protected credentials: IntegrationCredentials | null = null;
  protected tenantId: string;
  protected retryConfig: RetryConfig;

  constructor(tenantId: string, retryConfig?: Partial<RetryConfig>) {
    this.tenantId = tenantId;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /** Set credentials for this adapter instance */
  setCredentials(credentials: IntegrationCredentials): void {
    this.credentials = credentials;
  }

  abstract testConnection(credentials: IntegrationCredentials): Promise<ConnectionTestResult>;

  /**
   * Execute an operation with retry logic and error handling.
   * Retries only on retryable errors (5xx, network failures).
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<IntegrationResult<T>> {
    let lastError: IntegrationError | undefined;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        lastError = this.classifyError(error, context);

        // Don't retry permanent errors (4xx client errors)
        if (!lastError.retryable) {
          return { success: false, error: lastError };
        }

        // Calculate delay with exponential backoff and jitter
        if (attempt < this.retryConfig.maxAttempts) {
          const delay = Math.min(
            this.retryConfig.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500,
            this.retryConfig.maxDelayMs,
          );
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError ?? {
        code: 'MAX_RETRIES_EXCEEDED',
        message: `Operation "${context}" failed after ${this.retryConfig.maxAttempts} attempts`,
        retryable: false,
      },
    };
  }

  /**
   * Classify an error as retryable or permanent.
   * Override in subclasses for platform-specific error handling.
   */
  protected classifyError(error: unknown, context: string): IntegrationError {
    if (error instanceof Response || (error && typeof error === 'object' && 'status' in error)) {
      const status = (error as { status: number }).status;

      if (status >= 500) {
        return {
          code: `HTTP_${status}`,
          message: `Server error during "${context}": HTTP ${status}`,
          retryable: true,
        };
      }

      if (status === 429) {
        return {
          code: 'RATE_LIMITED',
          message: `Rate limited during "${context}"`,
          retryable: true,
        };
      }

      if (status === 401 || status === 403) {
        return {
          code: 'AUTH_ERROR',
          message: `Authentication failed during "${context}": HTTP ${status}`,
          retryable: false,
        };
      }

      return {
        code: `HTTP_${status}`,
        message: `Client error during "${context}": HTTP ${status}`,
        retryable: false,
      };
    }

    // Network errors are retryable
    if (error instanceof TypeError && (error as Error).message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: `Network error during "${context}": ${(error as Error).message}`,
        retryable: true,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: `Unknown error during "${context}": ${error instanceof Error ? error.message : String(error)}`,
      retryable: false,
    };
  }

  /** Sleep utility for retry delays */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
