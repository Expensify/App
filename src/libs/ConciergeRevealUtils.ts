/** Default trickle duration for the server-streamed final-HTML reveal (getRevealDurationMS/usePusherDraftPacing). Targets ~19 chars/sec start (~7/sec end after ease-out) across a typical multi-paragraph response. */
const DEFAULT_STREAM_DURATION_MS = 15_000;
/** Short replies still trickle, but they should not take a full multi-paragraph reveal duration. */
const MIN_STREAM_DURATION_MS = 600;
/** Token count that maps to the default multi-paragraph reveal duration. */
const DEFAULT_STREAM_TOKEN_COUNT = 100;
/** Trickle tick cadence. 80ms targets ~1 char per tick at char-level granularity. */
const TICK_INTERVAL_MS = 80;
/** Hard cap on a running trickle and staleness gate on revisit. */
const TRICKLE_HARD_CAP_MS = 60_000;
/** Once the real reportComment lands in REPORT_ACTIONS, finish the remaining reveal within this window. */
const ACCELERATED_REMAINING_MS = 1_500;
/** Minimum char-level anchors before we opt into the trickle reveal. Replies under this fall back to an immediate reveal. */
const MIN_TRICKLE_TOKEN_COUNT = 100;
/** Per-token cadence for the optimistic reveal in usePendingConciergeResponse, a constant ~30 chars/sec. Server-streamed reveals are paced separately by getRevealDurationMS and easeOut. */
const OPTIMISTIC_FLAT_MS_PER_TOKEN = 33;

function easeOut(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return 1 - (1 - clamped) ** 2;
}

function getRevealDurationMS(tokenCount: number): number {
    const revealableTokenCount = Math.max(1, tokenCount - 1);
    return Math.max(MIN_STREAM_DURATION_MS, Math.min(DEFAULT_STREAM_DURATION_MS, Math.round((DEFAULT_STREAM_DURATION_MS * revealableTokenCount) / DEFAULT_STREAM_TOKEN_COUNT)));
}

export {ACCELERATED_REMAINING_MS, easeOut, getRevealDurationMS, MIN_TRICKLE_TOKEN_COUNT, OPTIMISTIC_FLAT_MS_PER_TOKEN, TICK_INTERVAL_MS, TRICKLE_HARD_CAP_MS};
