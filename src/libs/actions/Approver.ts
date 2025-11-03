import type { HeadersInit } from 'node-fetch';

/**
 * Approver types and API client for managing Approvers within the application.
 *
 * This file implements a small, production-ready TypeScript client that communicates
 * with a RESTful Approver service. It is intentionally dependency-light and uses
 * the global fetch API so it can run in browser and Node (if fetch is polyfilled).
 *
 * Usage:
 *   import ApproverAPI from 'src/libs/actions/Approver';
 *
 *   const approvers = await ApproverAPI.listApprovers(policyID);
 *   const created = await ApproverAPI.createApprover({ name: 'Alice', email: 'a@example.com' });
 *
 * The client throws ApproverError on failure for consistent error handling.
 */

/* ============================
 * Types
 * ============================ */

export interface Approver {
    id: string;
    name: string;
    email: string;
    policyID?: string | null;
    order?: number;
    active?: boolean;
    createdAt: string;
    updatedAt?: string | null;
    [key: string]: unknown;
}

export interface ListApproversOptions {
    policyID?: string;
    activeOnly?: boolean;
    signal?: AbortSignal | null;
}

export interface CreateApproverParams {
    name: string;
    email: string;
    policyID?: string | null;
    order?: number;
    active?: boolean;
}

export interface UpdateApproverParams {
    name?: string;
    email?: string;
    order?: number;
    active?: boolean;
    policyID?: string | null;
}

export interface ReorderApproversParams {
    policyID: string;
    orderedApproverIds: string[];
}

export class ApproverError extends Error {
    public status?: number;
    public details?: unknown;

    constructor(message: string, status?: number, details?: unknown) {
        super(message);
        this.name = 'ApproverError';
        this.status = status;
        this.details = details;
        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, ApproverError.prototype);
    }
}

/* ============================
 * Helpers
 * ============================ */

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Helper to merge headers and ensure JSON content type where applicable.
 */
function buildHeaders(extra?: HeadersInit): HeadersInit {
    const defaultHeaders: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (!extra) {
        return defaultHeaders;
    }

    return { ...defaultHeaders, ...extra };
}

/**
 * Helper to perform fetch with a timeout and consistent error parsing.
 */
async function fetchWithTimeout(
    input: RequestInfo,
    init: RequestInit = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    // Merge provided signal with our timeout signal if provided
    if (init.signal) {
        // When both signals are provided we abandon merging logic and just let the caller's signal take precedence.
        // This is intentionally conservative: if caller wants to control cancellation, they should pass the signal and
        // not rely on our timeout. However, to still have a timeout by default, we only add ours when the caller didn't pass any.
    } else {
        init.signal = controller.signal;
    }

    try {
        const response = await fetch(input, init);
        clearTimeout(timeout);
        return response;
    } catch (err: unknown) {
        clearTimeout(timeout);
        if ((err as Error).name === 'AbortError') {
            throw new ApproverError('Request aborted (timeout or cancellation)', 0, err);
        }
        throw new ApproverError(`Network error: ${(err as Error).message}`, 0, err);
    }
}

/**
 * Parse JSON response and convert non-2xx into ApproverError with details.
 */
async function parseJSONResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');

    let body: unknown = null;
    try {
        if (isJSON) {
            body = await response.json();
        } else {
            body = await response.text();
        }
    } catch (err) {
        // If we can't parse, capture raw text
        try {
            body = await response.text();
        } catch {
            body = null;
        }
    }

    if (!response.ok) {
        const msg = (body && typeof body === 'object' && (body as any).message)
            ? (body as any).message
            : `HTTP ${response.status} - ${response.statusText}`;
        throw new ApproverError(msg, response.status, body);
    }

    return body;
}

/**
 * Basic validation helpers
 */
function assertString(value: unknown, name: string): asserts value is string {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new ApproverError(`${name} must be a non-empty string`);
    }
}

function assertArrayOfStrings(value: unknown, name: string): asserts value is string[] {
    if (!Array.isArray(value) || value.some((v) => typeof v !== 'string' || v.trim() === '')) {
        throw new ApproverError(`${name} must be an array of non-empty strings`);
    }
}

/* ============================
 * Approver API Client
 * ============================ */

export class ApproverAPI {
    private readonly baseURL: string;
    private readonly defaultHeaders: HeadersInit;

    /**
     * Create an ApproverAPI instance.
     * @param baseURL base URL of the Approver service (no trailing slash)
     * @param defaultHeaders headers to include on every request
     */
    constructor(baseURL: string, defaultHeaders?: HeadersInit) {
        this.baseURL = baseURL.replace(/\/+$/, ''); // remove trailing slash
        this.defaultHeaders = buildHeaders(defaultHeaders);
    }

    /**
     * List approvers, optionally filtered by policyID and/or activeOnly.
     */
    public async listApprovers(options: ListApproversOptions = {}): Promise<Approver[]> {
        const params = new URLSearchParams();
        if (options.policyID) params.append('policyID', options.policyID);
        if (options.activeOnly) params.append('activeOnly', '1');

        const url = `${this.baseURL}/approvers${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: this.defaultHeaders,
            signal: options.signal ?? null,
        });

        const body = await parseJSONResponse(response);
        // Expect body to be array
        if (!Array.isArray(body)) {
            throw new ApproverError('Invalid response: expected array of approvers', response.status, body);
        }
        return body as Approver[];
    }

    /**
     * Get a single approver by id.
     */
    public async getApprover(id: string, signal?: AbortSignal | null): Promise<Approver> {
        assertString(id, 'id');

        const url = `${this.baseURL}/approvers/${encodeURIComponent(id)}`;
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: this.defaultHeaders,
            signal: signal ?? null,
        });

        const body = await parseJSONResponse(response);
        return body as Approver;
    }

    /**
     * Create a new approver.
     */
    public async createApprover(params: CreateApproverParams, signal?: AbortSignal | null): Promise<Approver> {
        assertString(params.name, 'name');
        assertString(params.email, 'email');

        const url = `${this.baseURL}/approvers`;
        const payload = {
            name: params.name.trim(),
            email: params.email.trim(),
            policyID: params.policyID ?? null,
            order: typeof params.order === 'number' ? params.order : undefined,
            active: typeof params.active === 'boolean' ? params.active : true,
        };

        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: JSON.stringify(payload),
            signal: signal ?? null,
        });

        const body = await parseJSONResponse(response);
        return body as Approver;
    }

    /**
     * Update an existing approver.
     */
    public async updateApprover(id: string, params: UpdateApproverParams, signal?: AbortSignal | null): Promise<Approver> {
        assertString(id, 'id');

        if (Object.keys(params).length === 0) {
            throw new ApproverError('No fields provided to update');
        }

        const url = `${this.baseURL}/approvers/${encodeURIComponent(id)}`;
        const payload: Record<string, unknown> = {};
        if (params.name !== undefined) {
            assertString(params.name, 'name');
            payload.name = params.name.trim();
        }
        if (params.email !== undefined) {
            assertString(params.email, 'email');
            payload.email = params.email.trim();
        }
        if (params.order !== undefined) {
            if (typeof params.order !== 'number') {
                throw new ApproverError('order must be a number');
            }
            payload.order = params.order;
        }
        if (params.active !== undefined) {
            if (typeof params.active !== 'boolean') {
                throw new ApproverError('active must be a boolean');
            }
            payload.active = params.active;
        }
        if (params.policyID !== undefined) {
            payload.policyID = params.policyID;
        }

        const response = await fetchWithTimeout(url, {
            method: 'PATCH',
            headers: this.defaultHeaders,
            body: JSON.stringify(payload),
            signal: signal ?? null,
        });

        const body = await parseJSONResponse(response);
        return body as Approver;
    }

    /**
     * Delete an approver by id.
     */
    public async deleteApprover(id: string, signal?: AbortSignal | null): Promise<void> {
        assertString(id, 'id');

        const url = `${this.baseURL}/approvers/${encodeURIComponent(id)}`;
        const response = await fetchWithTimeout(url, {
            method: 'DELETE',
            headers: this.defaultHeaders,
            signal: signal ?? null,
        });

        await parseJSONResponse(response);
    }

    /**
     * Reorder approvers within a policy. Returns the new ordered approver list.
     */
    public async reorderApprovers(params: ReorderApproversParams, signal?: AbortSignal | null): Promise<Approver[]> {
        assertString(params.policyID, 'policyID');
        assertArrayOfStrings(params.orderedApproverIds, 'orderedApproverIds');

        const url = `${this.baseURL}/policies/${encodeURIComponent(params.policyID)}/approvers/reorder`;
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: this.defaultHeaders,
            body: JSON.stringify({ orderedApproverIds: params.orderedApproverIds }),
            signal: signal ?? null,
        });

        const body = await parseJSONResponse(response);
        if (!Array.isArray(body)) {
            throw new ApproverError('Invalid response: expected array of approvers', response.status, body);
        }
        return body as Approver[];
    }
}

/* ============================
 * Default Export
 * ============================ */

/**
 * Default ApproverAPI instance. The base URL is read from the environment variable
 * APPROVER_API_URL. If not present, '/api' is used as the base.
 */
const DEFAULT_BASE_URL = (typeof process !== 'undefined' && (process.env?.APPROVER_API_URL))
    ? String(process.env.APPROVER_API_URL)
    : '/api';

const ApproverClient = new ApproverAPI(DEFAULT_BASE_URL);

export default ApproverClient;