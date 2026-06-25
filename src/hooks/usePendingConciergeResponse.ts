import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {clearAgentZeroProcessingIndicator} from '@libs/actions/Report';
import {applyPendingConciergeAction, clearPendingFollowupList, discardPendingConciergeAction, hidePendingFollowupList} from '@libs/actions/Report/SuggestedFollowup';
import AgentZeroOptimisticStore, {MAX_AGE_MS} from '@libs/AgentZeroOptimisticStore';
import {ACCELERATED_REMAINING_MS, DEFAULT_STREAM_DURATION_MS, easeOut, MIN_TRICKLE_TOKEN_COUNT, TICK_INTERVAL_MS, TRICKLE_HARD_CAP_MS} from '@libs/ConciergeRevealUtils';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';
import type {ConciergeDraftEvent} from '@libs/Pusher/types';
import {parseFollowupsFromHtml} from '@libs/ReportActionFollowupUtils';
import tokenizeForReveal from '@libs/ReportActionFollowupUtils/tokenizeForReveal';
import {getReportActionHtml} from '@libs/ReportActionsUtils';
import {useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/** Hard cap on a pending followup-list skeleton. If the server never appends a real followup-list within this window, drop the marker so the UI stops showing a perpetual skeleton. */
const PENDING_FOLLOWUP_LIST_HARD_CAP_MS = MAX_AGE_MS;

/**
 * Long Concierge replies trickle into `ConciergeDraftContext`; short ones keep
 * the binary reveal at `displayAfter`. `REPORT_ACTIONS` is written at completion.
 */
function usePendingConciergeResponse(reportID: string | undefined) {
    const {isOffline} = useNetwork();
    const [pendingResponse] = useOnyx(`${ONYXKEYS.COLLECTION.PENDING_CONCIERGE_RESPONSE}${reportID}`);
    const [pendingFollowupList] = useOnyx(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${reportID}`);
    const reportActionID = pendingResponse?.reportAction?.reportActionID;
    const fullHtml = pendingResponse?.reportAction ? getReportActionHtml(pendingResponse.reportAction) : '';
    // React Compiler auto-memoizes the selector closure and the tokenize result;
    // explicit useCallback/useMemo would just shadow the compiler's analysis.
    const persistedActionSelector = (actions: OnyxEntry<ReportActions>): ReportAction | undefined => (reportActionID && actions ? actions[reportActionID] : undefined);
    const [persistedAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: persistedActionSelector});
    const pendingFollowupActionID = pendingFollowupList?.reportActionID;
    const pendingFollowupActionSelector = (actions: OnyxEntry<ReportActions>): ReportAction | undefined =>
        pendingFollowupActionID && actions ? actions[pendingFollowupActionID] : undefined;
    const [pendingFollowupAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: pendingFollowupActionSelector});
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

    const lastOnlineTransitionAtRef = useRef<number>(0);
    const wasOfflineRef = useRef<boolean>(isOffline);
    useEffect(() => {
        if (wasOfflineRef.current && !isOffline) {
            lastOnlineTransitionAtRef.current = Date.now();
        }
        wasOfflineRef.current = isOffline;
    }, [isOffline]);

    // Hide the followup-list skeleton when the user is offline.
    useEffect(() => {
        if (!reportID || !pendingFollowupList || !!pendingFollowupList.hidden === isOffline) {
            return;
        }
        hidePendingFollowupList(reportID, isOffline || null);
    }, [reportID, isOffline, pendingFollowupList]);

    // Clear the pending followup-list skeleton flag as soon as the server reply
    // (with <followup-list>) overwrites the optimistic action.
    // A TTL fallback guards against the case where no followup-list ever arrives
    // so the skeleton won't get stuck.
    useEffect(() => {
        if (!reportID || !pendingFollowupList) {
            return;
        }
        const html = pendingFollowupAction ? getReportActionHtml(pendingFollowupAction) : '';
        const hardClearIndicator = () => {
            // Follow-up lists are a Concierge feature, so this clears Concierge's indicator slot.
            // Skip clearing when a newer Concierge request has kicked off.
            const optimisticEntry = AgentZeroOptimisticStore.getEntry(reportID, CONST.ACCOUNT_ID.CONCIERGE);
            const hasNewerRequest = !!optimisticEntry && optimisticEntry.startedAt > pendingFollowupList.createdAt;
            if (!hasNewerRequest) {
                clearAgentZeroProcessingIndicator(reportID, CONST.ACCOUNT_ID.CONCIERGE);
            }
            clearPendingFollowupList(reportID);
        };
        if (parseFollowupsFromHtml(html)?.length) {
            hardClearIndicator();
            return;
        }
        if (isOffline) {
            return;
        }
        const effectiveStart = Math.max(pendingFollowupList.createdAt, lastOnlineTransitionAtRef.current);
        const remainingTTL = effectiveStart + PENDING_FOLLOWUP_LIST_HARD_CAP_MS - Date.now();
        if (remainingTTL <= 0) {
            hardClearIndicator();
            return;
        }
        const ttlTimer = setTimeout(hardClearIndicator, remainingTTL);
        return () => clearTimeout(ttlTimer);
    }, [reportID, pendingFollowupList, pendingFollowupAction, isOffline]);

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
