/** Default trickle duration. Targets ~25 chars/sec average (~40-50/sec peak at the front-loaded start) across a typical multi-paragraph response, close to the ChatGPT/Claude reveal feel. */
const DEFAULT_STREAM_DURATION_MS = 3_000;
/** Short replies still trickle, but they should not take a full multi-paragraph reveal duration. */
const MIN_STREAM_DURATION_MS = 600;
/** Token count that maps to the default multi-paragraph reveal duration. */
const DEFAULT_STREAM_TOKEN_COUNT = 100;
/** Trickle tick cadence. 40ms keeps the faster reveal smooth so it doesn't reveal several chars per tick and look chunky. */
const TICK_INTERVAL_MS = 40;
/** Hard cap on a running trickle and staleness gate on revisit. */
const TRICKLE_HARD_CAP_MS = 60_000;
/** Once the real reportComment lands in REPORT_ACTIONS, finish the remaining reveal within this window. */
const ACCELERATED_REMAINING_MS = 1_500;
/** Minimum char-level anchors before we opt into the trickle reveal. Replies under this fall back to an immediate reveal. */
const MIN_TRICKLE_TOKEN_COUNT = 100;

function easeOut(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return 1 - (1 - clamped) ** 2;
}

function getRevealDurationMS(tokenCount: number): number {
    const revealableTokenCount = Math.max(1, tokenCount - 1);
    return Math.max(MIN_STREAM_DURATION_MS, Math.min(DEFAULT_STREAM_DURATION_MS, Math.round((DEFAULT_STREAM_DURATION_MS * revealableTokenCount) / DEFAULT_STREAM_TOKEN_COUNT)));
}

export {ACCELERATED_REMAINING_MS, DEFAULT_STREAM_DURATION_MS, easeOut, getRevealDurationMS, MIN_TRICKLE_TOKEN_COUNT, TICK_INTERVAL_MS, TRICKLE_HARD_CAP_MS};
