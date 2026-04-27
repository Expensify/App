import {useCallback, useEffect, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {applyPendingConciergeAction, discardPendingConciergeAction} from '@libs/actions/Report/SuggestedFollowup';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import tokenizeForReveal from '@libs/ReportActionFollowupUtils/tokenizeForReveal';
import {getReportActionHtml} from '@libs/ReportActionsUtils';
import {useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';

/** If displayAfter is more than this far in the past, the response is stale (e.g. app was killed and restarted). */
const STALE_THRESHOLD_MS = 10_000;
/** Default trickle duration. Roughly matches the p50 follow-up generation window so the reveal lands close to when followups arrive. */
const DEFAULT_STREAM_DURATION_MS = 30_000;
/** Trickle tick cadence. ~75 updates over the 30s default — enough granularity for a smooth ease-out, sparse enough to keep render churn low. */
const TICK_INTERVAL_MS = 400;
/** Hard cap on running trickle. If the loop is still alive past this, force completion to avoid pinning a synthetic bubble forever. */
const TRICKLE_HARD_CAP_MS = 60_000;
/** Once the real reportComment lands in REPORT_ACTIONS, finish the remaining reveal within this window. */
const ACCELERATED_REMAINING_MS = 1_500;

function easeOut(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return 1 - (1 - clamped) ** 2;
}

/**
 * Manages the lifecycle of a pending pregenerated Concierge response.
 *
 * For payloads with multiple top-level chunks the hook trickles the body in
 * progressively over `DEFAULT_STREAM_DURATION_MS` (decelerating ease-out),
 * dispatching `conciergeDraftStarted/updated/completed` events into Issa's
 * existing `ConciergeDraftContext` reducer (PR #87110) so the synthetic
 * report action splice and reconciliation behave identically to server-driven
 * streaming. Canonical Onyx state (`REPORT_ACTIONS`) is only written at the
 * end via `applyPendingConciergeAction`, preserving LHN previews / push
 * notifications / search snapshots until the trickle finishes.
 *
 * Single-chunk payloads fall back to the original binary reveal at
 * `displayAfter` so short replies (1–2 sentence answers) don't get stretched
 * artificially.
 *
 * Reconciliation: if the real `reportComment` arrives mid-trickle, the loop
 * accelerates the remaining reveal so the synthetic bubble lands within
 * `ACCELERATED_REMAINING_MS` instead of snapping closed.
 */
function usePendingConciergeResponse(reportID: string | undefined) {
    const [pendingResponse] = useOnyx(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`);
    const reportActionID = pendingResponse?.reportAction?.reportActionID;
    const fullHtml = pendingResponse?.reportAction ? getReportActionHtml(pendingResponse.reportAction) : '';
    const persistedActionSelector = useCallback(
        (actions: OnyxEntry<ReportActions>): ReportAction | undefined => (reportActionID && actions ? actions[reportActionID] : undefined),
        [reportActionID],
    );
    const [persistedAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: persistedActionSelector});
    const {dispatchLocalDraftEvent} = useConciergeDraftActions();

    const tokens = useMemo(() => tokenizeForReveal(fullHtml), [fullHtml]);
    const accelerateRef = useRef<((nowMs: number) => void) | null>(null);

    // Reconciliation: when the canonical reportComment lands in REPORT_ACTIONS
    // mid-trickle, fire the running loop's accelerator so the remaining reveal
    // finishes in ~1.5s instead of snapping the synthetic bubble closed.
    useEffect(() => {
        if (!persistedAction || !accelerateRef.current) {
            return;
        }
        accelerateRef.current(Date.now());
    }, [persistedAction]);

    useEffect(() => {
        if (!pendingResponse || !reportID || !reportActionID) {
            return;
        }
        const {reportAction, displayAfter} = pendingResponse;
        const remainingDelay = displayAfter - Date.now();

        if (remainingDelay < -STALE_THRESHOLD_MS) {
            discardPendingConciergeAction(reportID);
            return;
        }

        // Single-chunk payloads keep the original binary reveal — trickling a
        // 1–2 sentence answer over 30s would feel broken.
        const shouldTrickle = tokens.length >= 3 && !!fullHtml;
        if (!shouldTrickle) {
            const timer = setTimeout(() => applyPendingConciergeAction(reportID, reportAction), Math.max(0, remainingDelay));
            return () => clearTimeout(timer);
        }

        const session = rand64();
        let sequence = 0;
        let intervalID: ReturnType<typeof setInterval> | null = null;
        let trickleStart = 0;
        let effectiveDuration = DEFAULT_STREAM_DURATION_MS;
        let lastStage = 0;
        let cancelled = false;
        // Telemetry: track whether/when acceleration fired so the [complete] log
        // can attribute the completion reason and the arrival point of the canonical
        // reportComment. Drives Phase 2 duration tuning + regression detection.
        let arrivedAtProgress: number | undefined;
        let arrivedAtElapsedMs: number | undefined;

        const dispatch = (status: ConciergeDraftEvent['status'], finalRenderedHTML: string) => {
            if (cancelled) {
                return;
            }
            sequence += 1;
            dispatchLocalDraftEvent({
                reportID,
                reportActionID,
                streamSessionID: session,
                sequence,
                status,
                created: reportAction.created,
                finalRenderedHTML,
            });
        };

        const completeAndApply = () => {
            if (intervalID) {
                clearInterval(intervalID);
                intervalID = null;
            }
            const totalElapsedMs = trickleStart === 0 ? 0 : Date.now() - trickleStart;
            let reason: 'natural' | 'accelerated' | 'stale_cap' = 'natural';
            if (arrivedAtProgress !== undefined) {
                reason = 'accelerated';
            } else if (totalElapsedMs >= TRICKLE_HARD_CAP_MS) {
                reason = 'stale_cap';
            }
            Log.info('[ConciergeTrickle] complete', false, {
                reportActionID,
                reason,
                tokenCount: tokens.length,
                durationMs: effectiveDuration,
                totalElapsedMs,
                arrivedAtProgress,
                arrivedAtElapsedMs,
            });
            dispatch('completed', tokens.at(-1) ?? fullHtml);
            applyPendingConciergeAction(reportID, reportAction);
        };

        accelerateRef.current = (nowMs: number) => {
            if (!intervalID || trickleStart === 0) {
                return;
            }
            const elapsed = nowMs - trickleStart;
            // Compressing effectiveDuration is what makes progress hit 1 within
            // ACCELERATED_REMAINING_MS — the next tick observes progress >= 1
            // and runs completeAndApply via the normal path.
            arrivedAtProgress = easeOut(elapsed / effectiveDuration);
            arrivedAtElapsedMs = elapsed;
            effectiveDuration = elapsed + ACCELERATED_REMAINING_MS;
        };

        const startTrickle = () => {
            if (cancelled) {
                return;
            }
            trickleStart = Date.now();
            Log.info('[ConciergeTrickle] start', false, {
                reportActionID,
                tokenCount: tokens.length,
                durationMs: effectiveDuration,
            });
            dispatch('started', tokens.at(1) ?? '');
            lastStage = 1;
            intervalID = setInterval(() => {
                const elapsed = Date.now() - trickleStart;
                const progress = easeOut(elapsed / effectiveDuration);
                const stage = Math.min(tokens.length - 1, Math.max(0, Math.ceil(progress * (tokens.length - 1))));
                if (stage > lastStage) {
                    lastStage = stage;
                    dispatch('updated', tokens.at(stage) ?? '');
                }
                if (progress >= 1 || elapsed >= TRICKLE_HARD_CAP_MS) {
                    completeAndApply();
                }
            }, TICK_INTERVAL_MS);
        };

        const startTimer = setTimeout(startTrickle, Math.max(0, remainingDelay));
        return () => {
            cancelled = true;
            clearTimeout(startTimer);
            if (intervalID) {
                clearInterval(intervalID);
            }
            accelerateRef.current = null;
        };
    }, [pendingResponse, reportID, reportActionID, fullHtml, tokens, dispatchLocalDraftEvent]);
}

export default usePendingConciergeResponse;
