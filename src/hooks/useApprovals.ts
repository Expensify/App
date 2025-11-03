import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook: useApprovals
 *
 * Manages fetching, caching, and actions (approve/reject/assign/remove) for approval requests.
 *
 * This hook is intentionally generic and resilient so it can be used in a number of environments.
 * It:
 *  - fetches approval items from an API
 *  - caches results per key (policyID or global)
 *  - supports optimistic updates for approve/reject/assign/remove actions
 *  - exposes control methods and loading/error states
 *
 * Usage:
 * const { approvals, loading, error, refresh, approve, reject, assignApprover, removeApprover } = useApprovals({ policyID: '123' });
 */

/* =========================
   Types
   ========================= */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Approval {
  id: string;
  title: string;
  details?: string;
  requesterEmail?: string;
  approverEmails?: string[]; // list of approver emails or ids
  status: ApprovalStatus;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  // allow extensibility for other server-provided fields
  [key: string]: any;
}

export interface UseApprovalsOptions {
  policyID?: string | null;
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
  apiBase?: string; // override API base URL
  cacheKey?: string; // optional custom cache key
}

/* =========================
   Module-level cache & helpers
   ========================= */

const DEFAULT_API_BASE = (typeof process !== 'undefined' && process.env && process.env.API_BASE) || '/api';

const approvalsCache = new Map<string, Approval[]>(); // simple in-memory cache

const createCacheKey = (opts?: UseApprovalsOptions) =>
  opts?.cacheKey ?? `approvals:${opts?.policyID ?? 'global'}`;

async function fetchJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init && (init as RequestInit).headers ? (init as RequestInit).headers : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const message = text || res.statusText || `HTTP error ${res.status}`;
    const err: any = new Error(message);
    err.status = res.status;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  // If server responds with no body or not-json, return an empty object typed as T
  return ({} as unknown) as T;
}

/* =========================
   Hook Implementation
   ========================= */

export default function useApprovals(options: UseApprovalsOptions = {}) {
  const { policyID = null, autoRefresh = false, refreshInterval = 30_000, apiBase = DEFAULT_API_BASE } = options;
  const cacheKey = createCacheKey(options);

  const isMountedRef = useRef(true);
  const pollingTimerRef = useRef<number | null>(null);
  const inFlightFetchRef = useRef<AbortController | null>(null);

  const [approvals, setApprovals] = useState<Approval[]>(
    () => approvalsCache.get(cacheKey) ?? []
  );
  const [loading, setLoading] = useState<boolean>(approvals.length === 0);
  const [error, setError] = useState<Error | null>(null);

  // track per-item processing state
  const [processingMap, setProcessingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    isMountedRef.current = true;
    // initialize from cache if available
    const cached = approvalsCache.get(cacheKey);
    if (cached) {
      setApprovals(cached);
      setLoading(false);
    } else {
      // fetch immediately
      refresh().catch(() => {
        /* handled by refresh */
      });
    }

    if (autoRefresh) {
      startPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
      if (inFlightFetchRef.current) {
        inFlightFetchRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, autoRefresh, refreshInterval, apiBase]);

  const setCachedApprovals = useCallback((items: Approval[]) => {
    approvalsCache.set(cacheKey, items);
    if (isMountedRef.current) {
      setApprovals(items);
    }
  }, [cacheKey]);

  async function fetchApprovals(signal?: AbortSignal): Promise<Approval[]> {
    const qs = policyID ? `?policyID=${encodeURIComponent(policyID)}` : '';
    const url = `${apiBase}/approvals${qs}`;
    return fetchJSON<Approval[]>(url, { method: 'GET', signal });
  }

  async function refresh(): Promise<void> {
    // abort previous fetch if any
    if (inFlightFetchRef.current) {
      inFlightFetchRef.current.abort();
    }
    const controller = new AbortController();
    inFlightFetchRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const items = await fetchApprovals(controller.signal);
      approvalsCache.set(cacheKey, items);
      if (isMountedRef.current) {
        setApprovals(items);
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // aborted - ignore
        return;
      }
      approvalsCache.delete(cacheKey);
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
      }
      throw err;
    } finally {
      inFlightFetchRef.current = null;
    }
  }

  function startPolling() {
    stopPolling();
    pollingTimerRef.current = window.setInterval(() => {
      refresh().catch(() => {
        // ignore polling errors, but leave last error state as-is
      });
    }, refreshInterval);
  }

  function stopPolling() {
    if (pollingTimerRef.current !== null) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }

  const setProcessing = useCallback((id: string, value: boolean) => {
    setProcessingMap((prev) => {
      if (prev[id] === value) return prev;
      return { ...prev, [id]: value };
    });
  }, []);

  // Generic helper to perform action with optimistic update
  async function performActionOptimistic<T extends Approval>(
    id: string,
    optimisticUpdate: (current: Approval | undefined) => Approval | null, // return null to remove item
    apiCall: () => Promise<any>,
    onError?: (err: any, prevItem?: Approval | undefined) => void
  ): Promise<void> {
    setProcessing(id, true);

    // snapshot previous state
    const prevApprovals = approvalsCache.get(cacheKey) ?? approvals;
    const prevItem = prevApprovals.find((a) => a.id === id);

    // compute optimistic new list
    const newApprovals = prevApprovals.map((a) => ({ ...a }));
    const index = newApprovals.findIndex((a) => a.id === id);
    const optimisticItem = optimisticUpdate(prevItem);
    if (index >= 0) {
      if (optimisticItem === null) {
        newApprovals.splice(index, 1);
      } else {
        newApprovals[index] = optimisticItem;
      }
    } else if (optimisticItem !== null) {
      newApprovals.unshift(optimisticItem);
    }

    // apply optimistic update
    setCachedApprovals(newApprovals);

    try {
      await apiCall();
      // on success, refresh item from server to keep canonical
      // We'll attempt to fetch the item and merge; if that fails, we at least keep optimistic update
      try {
        const qs = policyID ? `?policyID=${encodeURIComponent(policyID)}` : '';
        const url = `${apiBase}/approvals/${encodeURIComponent(id)}${qs}`;
        const serverItem = await fetchJSON<Approval>(url);
        const merged = (approvalsCache.get(cacheKey) ?? []).map((a) => (a.id === id ? serverItem : a));
        setCachedApprovals(merged);
      } catch {
        // ignore server fetch failure after action
      }
    } catch (err) {
      // rollback to previous state
      approvalsCache.set(cacheKey, prevApprovals);
      if (isMountedRef.current) {
        setApprovals(prevApprovals);
      }
      if (onError) onError(err, prevItem);
      else {
        // surface error
        if (isMountedRef.current) setError(err as Error);
      }
      throw err;
    } finally {
      setProcessing(id, false);
    }
  }

  /* =========================
     Action Helpers
     ========================= */

  const approve = useCallback(
    async (id: string, payload?: { note?: string }) => {
      return performActionOptimistic(
        id,
        (current) => {
          if (!current) return current;
          return { ...current, status: 'approved', updatedAt: new Date().toISOString() };
        },
        async () => {
          const url = `${apiBase}/approvals/${encodeURIComponent(id)}/approve`;
          await fetchJSON(url, { method: 'POST', body: JSON.stringify(payload ?? {}) });
        },
        (err) => {
          console.error('Failed to approve', id, err);
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBase, cacheKey, policyID, approvals]
  );

  const reject = useCallback(
    async (id: string, payload?: { reason?: string }) => {
      return performActionOptimistic(
        id,
        (current) => {
          if (!current) return current;
          return { ...current, status: 'rejected', updatedAt: new Date().toISOString() };
        },
        async () => {
          const url = `${apiBase}/approvals/${encodeURIComponent(id)}/reject`;
          await fetchJSON(url, { method: 'POST', body: JSON.stringify(payload ?? {}) });
        },
        (err) => {
          console.error('Failed to reject', id, err);
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBase, cacheKey, policyID, approvals]
  );

  const assignApprover = useCallback(
    async (id: string, approverEmail: string) => {
      return performActionOptimistic(
        id,
        (current) => {
          if (!current) return current;
          const existing = new Set(current.approverEmails ?? []);
          existing.add(approverEmail);
          return { ...current, approverEmails: Array.from(existing), updatedAt: new Date().toISOString() };
        },
        async () => {
          const url = `${apiBase}/approvals/${encodeURIComponent(id)}/assign`;
          await fetchJSON(url, { method: 'POST', body: JSON.stringify({ approver: approverEmail }) });
        },
        (err) => {
          console.error('Failed to assign approver', id, err);
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBase, cacheKey, approvals]
  );

  const removeApprover = useCallback(
    async (id: string, approverEmail: string) => {
      return performActionOptimistic(
        id,
        (current) => {
          if (!current) return current;
          const next = (current.approverEmails ?? []).filter((e) => e !== approverEmail);
          return { ...current, approverEmails: next, updatedAt: new Date().toISOString() };
        },
        async () => {
          const url = `${apiBase}/approvals/${encodeURIComponent(id)}/removeApprover`;
          await fetchJSON(url, { method: 'POST', body: JSON.stringify({ approver: approverEmail }) });
        },
        (err) => {
          console.error('Failed to remove approver', id, err);
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBase, cacheKey, approvals]
  );

  const cancelApproval = useCallback(
    async (id: string, payload?: { reason?: string }) => {
      return performActionOptimistic(
        id,
        (current) => {
          if (!current) return current;
          return { ...current, status: 'cancelled', updatedAt: new Date().toISOString() };
        },
        async () => {
          const url = `${apiBase}/approvals/${encodeURIComponent(id)}/cancel`;
          await fetchJSON(url, { method: 'POST', body: JSON.stringify(payload ?? {}) });
        },
        (err) => {
          console.error('Failed to cancel approval', id, err);
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiBase, cacheKey, approvals]
  );

  const refreshItem = useCallback(
    async (id: string): Promise<Approval | null> => {
      try {
        const qs = policyID ? `?policyID=${encodeURIComponent(policyID)}` : '';
        const url = `${apiBase}/approvals/${encodeURIComponent(id)}${qs}`;
        const serverItem = await fetchJSON<Approval>(url);
        const current = approvalsCache.get(cacheKey) ?? [];
        const idx = current.findIndex((a) => a.id === id);
        let next: Approval[];
        if (idx >= 0) {
          next = current.slice();
          next[idx] = serverItem;
        } else {
          next = [serverItem, ...current];
        }
        setCachedApprovals(next);
        return serverItem;
      } catch (err) {
        // swallow
        return null;
      }
    },
    [apiBase, cacheKey, policyID, setCachedApprovals]
  );

  /* =========================
     Derived state & exports
     ========================= */

  const isProcessing = useCallback(
    (id?: string) => {
      if (!id) {
        return Object.values(processingMap).some(Boolean);
      }
      return !!processingMap[id];
    },
    [processingMap]
  );

  return {
    approvals,
    loading,
    error,
    refresh,
    approve,
    reject,
    assignApprover,
    removeApprover,
    cancelApproval,
    refreshItem,
    isProcessing,
    // internal helpers for tests or advanced consumers
    _cacheKey: cacheKey,
    _clearCache: () => approvalsCache.delete(cacheKey),
  };
}