import {useEffect, useRef} from 'react';
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

/** Default trickle duration. Targets ~19 chars/sec start (~7/sec end after ease-out) across a typical multi-paragraph response — visibly streaming without dragging the user past the moment they want to read. */
const DEFAULT_STREAM_DURATION_MS = 15_000;
/** Trickle tick cadence. 80ms targets ~1 char per tick at char-level granularity — fast enough that the reveal feels continuous, slow enough that the synthetic-bubble re-render budget stays comfortable on RNW (~12 dispatches/sec). */
const TICK_INTERVAL_MS = 80;
/** Hard cap on a running trickle and staleness gate on revisit. Past this many ms after `displayAfter`, the canonical reportComment is expected to be in REPORT_ACTIONS already, so we discard the optimistic rather than resume a doomed reveal. */
const TRICKLE_HARD_CAP_MS = 60_000;
/** Once the real reportComment lands in REPORT_ACTIONS, finish the remaining reveal within this window. */
const ACCELERATED_REMAINING_MS = 1_500;
/** Minimum char-level anchors before we opt into the trickle reveal. Replies under this fall back to the binary reveal at `displayAfter`. */
const MIN_TRICKLE_TOKEN_COUNT = 100;

function easeOut(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return 1 - (1 - clamped) ** 2;
}

/**
 * Long Concierge replies trickle into `ConciergeDraftContext`; short ones keep
 * the binary reveal at `displayAfter`. `REPORT_ACTIONS` is written at completion.
 */
function usePendingConciergeResponse(reportID: string | undefined) {
    const [pendingResponse] = useOnyx(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`);
    const reportActionID = pendingResponse?.reportAction?.reportActionID;
    const fullHtml = pendingResponse?.reportAction ? getReportActionHtml(pendingResponse.reportAction) : '';
    // React Compiler auto-memoizes the selector closure and the tokenize result;
    // explicit useCallback/useMemo would just shadow the compiler's analysis.
    const persistedActionSelector = (actions: OnyxEntry<ReportActions>): ReportAction | undefined => (reportActionID && actions ? actions[reportActionID] : undefined);
    const [persistedAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: persistedActionSelector});
    const {dispatchLocalDraftEvent} = useConciergeDraftActions();

    const tokens = tokenizeForReveal(fullHtml);
    const accelerateRef = useRef<((nowMs: number) => void) | null>(null);

    // Captured into a ref so the trickle effect can re-run only on the IDs that
    // identify a distinct Concierge reply. Composer typing, unrelated Onyx emits,
    // and ConciergeDraftActions context refreshes all produce reference churn for
    // pendingResponse/tokens/fullHtml — without this snapshot, those non-content
    // updates would cancel the running interval and restart the reveal. The
    // useEffect keeps ref writes in the commit phase (React-Compiler-safe).
    const trickleInputsRef = useRef({pendingResponse, fullHtml, tokens, dispatchLocalDraftEvent, persistedAction});
    useEffect(() => {
        trickleInputsRef.current = {pendingResponse, fullHtml, tokens, dispatchLocalDraftEvent, persistedAction};
    });

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
        if (!reportID || !reportActionID) {
            return;
        }
        // Snapshot inputs at effect start. The trickle commits to the content it had
        // when it began; subsequent updates that share this same reportActionID don't
        // disturb the in-progress reveal. A genuinely new Concierge reply produces a
        // new reportActionID and re-enters this effect via the deps below.
        const {pendingResponse: snapshot, fullHtml: snapshotHtml, tokens: snapshotTokens} = trickleInputsRef.current;
        if (!snapshot) {
            return;
        }
        const {reportAction, displayAfter} = snapshot;
        const remainingDelay = displayAfter - Date.now();

        // Past the hard cap from displayAfter, the server-side canonical reply
        // is expected to be in REPORT_ACTIONS already. Skip the trickle.
        if (remainingDelay < -TRICKLE_HARD_CAP_MS) {
            discardPendingConciergeAction(reportID);
            return;
        }

        // Anchors are character-level. Short replies (~50–100 chars) keep the
        // binary reveal; longer ones (paragraphs / lists) cross the threshold
        // and get the smooth trickle.
        const shouldTrickle = snapshotTokens.length >= MIN_TRICKLE_TOKEN_COUNT && !!snapshotHtml;
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
        // Snapshot of trickle progress at the moment the canonical reportComment
        // arrives. Presence (`arrival !== undefined`) doubles as the
        // "acceleration fired" check that selects the completion reason below.
        let arrival: {progress: number; elapsedMs: number} | undefined;

        const dispatch = (status: ConciergeDraftEvent['status'], finalRenderedHTML: string) => {
            if (cancelled) {
                return;
            }
            sequence += 1;
            // Read dispatch fn from the ref so a context-provider refresh doesn't pin
            // the trickle to a stale handler. The ref always points at the latest.
            trickleInputsRef.current.dispatchLocalDraftEvent({
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
            if (arrival) {
                reason = 'accelerated';
            } else if (totalElapsedMs >= TRICKLE_HARD_CAP_MS) {
                reason = 'stale_cap';
            }
            Log.info('[ConciergeTrickle] complete', false, {
                reportActionID,
                reason,
                tokenCount: snapshotTokens.length,
                durationMs: effectiveDuration,
                totalElapsedMs,
                arrivedAtProgress: arrival?.progress,
                arrivedAtElapsedMs: arrival?.elapsedMs,
            });
            dispatch('completed', snapshotTokens.at(-1) ?? snapshotHtml);
            // Don't reapply our older optimistic when the canonical is already there —
            // it would clobber server-added markup (follow-up buttons, deep-link
            // Pressables). `arrival` covers the accelerator path; the live ref read
            // catches arrivals during the pre-trickle setTimeout where the accelerator
            // no-ops on null intervalID.
            if (arrival || trickleInputsRef.current.persistedAction) {
                discardPendingConciergeAction(reportID);
            } else {
                applyPendingConciergeAction(reportID, reportAction);
            }
        };

        accelerateRef.current = (nowMs: number) => {
            if (!intervalID || trickleStart === 0) {
                return;
            }
            const elapsed = nowMs - trickleStart;
            // Compressing effectiveDuration is what makes progress hit 1 within
            // ACCELERATED_REMAINING_MS — the next tick observes progress >= 1
            // and runs completeAndApply via the normal path.
            arrival = {progress: easeOut(elapsed / effectiveDuration), elapsedMs: elapsed};
            effectiveDuration = elapsed + ACCELERATED_REMAINING_MS;
        };

        const startTrickle = () => {
            if (cancelled) {
                return;
            }
            // Anchor to displayAfter so revisit resumes at the wall-clock-correct
            // stage instead of restarting the reveal from char 0.
            trickleStart = displayAfter;
            const lastIndex = snapshotTokens.length - 1;
            const elapsedAtStart = Date.now() - trickleStart;
            const initialProgress = easeOut(elapsedAtStart / effectiveDuration);
            // Floor at 1 so a fresh trickle (elapsed ≈ 0) still reveals the leading chunk on the first dispatch.
            const initialStage = Math.max(1, Math.min(lastIndex, Math.ceil(initialProgress * lastIndex)));
            Log.info('[ConciergeTrickle] start', false, {
                reportActionID,
                tokenCount: snapshotTokens.length,
                durationMs: effectiveDuration,
                initialStage,
                elapsedAtStart,
            });
            dispatch('started', snapshotTokens.at(initialStage) ?? '');
            lastStage = initialStage;
            // If revisited past the duration / cap, finish without scheduling ticks.
            if (initialProgress >= 1 || elapsedAtStart >= TRICKLE_HARD_CAP_MS) {
                completeAndApply();
                return;
            }
            intervalID = setInterval(() => {
                const elapsed = Date.now() - trickleStart;
                const progress = easeOut(elapsed / effectiveDuration);
                // progress ∈ [0,1] (easeOut clamps) and lastIndex ≥ 99 (shouldTrickle gate),
                // so `progress * lastIndex` is always non-negative — only the upper bound needs clamping.
                const stage = Math.min(lastIndex, Math.ceil(progress * lastIndex));
                if (stage > lastStage) {
                    lastStage = stage;
                    dispatch('updated', snapshotTokens.at(stage) ?? '');
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
    }, [reportID, reportActionID]);
}

export default usePendingConciergeResponse;
