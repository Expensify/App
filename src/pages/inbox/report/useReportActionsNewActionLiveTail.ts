import useIsInSidePanel from '@hooks/useIsInSidePanel';
import type useReportScrollManager from '@hooks/useReportScrollManager';

import {clearLiveTailRequestResult, openReport, pruneReportActionPagesToNewestWindow} from '@libs/actions/Report';
import {subscribeToNewActionEvent} from '@libs/actions/Report/reportActionSubscribers';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {rand64} from '@libs/NumberUtils';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import {useNavigation} from '@react-navigation/native';
import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {fullPolicySnapshotLastModifiedSelector} from '@selectors/Policy';
import {useEffect, useEffectEvent, useRef, useState} from 'react';
import Onyx from 'react-native-onyx';

// In the component we are subscribing to the arrival of new actions.
// As there is the possibility that there are multiple instances of a ReportScreen
// for the same report, we only ever want one subscription to be active, as
// the subscriptions could otherwise be conflicting.
const newActionUnsubscribeMap: Record<string, () => void> = {};

type ReportScrollManager = ReturnType<typeof useReportScrollManager>;

type UseReportActionsNewActionLiveTailParams = {
    reportID: string;
    policyID: string | undefined;
    isOffline: boolean;
    reportScrollManager: ReportScrollManager;
    setIsFloatingMessageCounterVisible: (visible: boolean) => void;
    unreadMarkerReportActionID: string | null;
    hasNewerActions: boolean;
    linkedReportActionID: string | undefined;
    hasNewestReportAction: boolean;
    /** Actions rendered by the list in chronological order. */
    renderedVisibleReportActions: OnyxTypes.ReportAction[];
    sortedAllReportActionsForPagination: OnyxTypes.ReportAction[];
    reportActionPages: OnyxTypes.Pages | undefined;
    setTreatAsNoPaginationAnchor: (value: boolean) => void;
    treatAsNoPaginationAnchor: boolean;
    liveTailRequestResults: OnyxTypes.ReportPaginationState['liveTailRequestResults'];
};

type LiveTailJump = {stage: 'idle' | 'await_prune'} | {stage: 'open_report'; requestID: string} | {stage: 'await_scroll'; newestActionID?: string};
const PENDING_SENT_ACTION_TIMEOUT_MS = 5000;

/**
 * Owns subscribe-to-new-action scrolling, live-tail jump (openReport → scroll → prune), and the
 * deferred scroll + pagination prune after the data render. Uses useEffectEvent for the Pusher subscription handler so it
 * always sees the latest props without mirror refs. The prune callback completes the explicit scroll request in the caller.
 */
function useReportActionsNewActionLiveTail({
    reportID,
    policyID,
    isOffline,
    reportScrollManager,
    setIsFloatingMessageCounterVisible,
    unreadMarkerReportActionID,
    hasNewerActions,
    linkedReportActionID,
    hasNewestReportAction,
    renderedVisibleReportActions,
    sortedAllReportActionsForPagination,
    reportActionPages,
    setTreatAsNoPaginationAnchor,
    treatAsNoPaginationAnchor,
    liveTailRequestResults,
}: UseReportActionsNewActionLiveTailParams) {
    const navigation = useNavigation<PlatformStackNavigationProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const isInSidePanel = useIsInSidePanel();
    const liveTailJumpRef = useRef<LiveTailJump>({stage: 'idle'});
    const [isScrollToBottomEnabled, setIsScrollToBottomEnabled] = useState(false);
    const [pendingScrollActionID, setPendingScrollActionID] = useState<string>();
    const [scrollRequestReportID, setScrollRequestReportID] = useState(reportID);
    if (scrollRequestReportID !== reportID) {
        setScrollRequestReportID(reportID);
        setIsScrollToBottomEnabled(false);
        setPendingScrollActionID(undefined);
    }

    const setShouldScrollToBottom = (enabled: boolean) => {
        setIsScrollToBottomEnabled(enabled);
        if (!enabled) {
            setPendingScrollActionID(undefined);
        }
    };

    const isPendingScrollActionRendered = !!pendingScrollActionID && renderedVisibleReportActions.some((item) => item.reportActionID === pendingScrollActionID);

    const openReportAtLiveTail = async (liveTailRequestID: string) => {
        const [conciergeReportID, introSelected, onboarding, session, fullPolicySnapshotData] = await Onyx.multiGet([
            ONYXKEYS.CONCIERGE_REPORT_ID,
            ONYXKEYS.NVP_INTRO_SELECTED,
            ONYXKEYS.NVP_ONBOARDING,
            ONYXKEYS.SESSION,
            `${ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT}${getNonEmptyStringOnyxID(policyID)}`,
        ]);
        const conciergeChat = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
        const {isSelfTourViewed, hasCompletedGuidedSetupFlow} = guidedSetupAndTourStatusSelector(onboarding);
        const fullPolicySnapshotLastModified = fullPolicySnapshotLastModifiedSelector(fullPolicySnapshotData);
        openReport({
            reportID,
            liveTailRequestID,
            introSelected,
            conciergeChat,
            hasReportActions: true,
            currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            fullPolicySnapshot: policyID && fullPolicySnapshotLastModified ? {policyID, lastModified: fullPolicySnapshotLastModified} : undefined,
        });
    };

    const requestLiveTailJump = () => {
        if (liveTailJumpRef.current.stage === 'open_report' || liveTailJumpRef.current.stage === 'await_prune') {
            return;
        }
        if (isOffline) {
            // Cached newest messages can be outside the linked page. Release that anchor without waiting for a network request.
            liveTailJumpRef.current = {stage: 'await_scroll'};
            setTreatAsNoPaginationAnchor(true);
            return;
        }
        const requestID = rand64();
        liveTailJumpRef.current = {stage: 'open_report', requestID};
        openReportAtLiveTail(requestID);
    };

    useEffect(() => {
        if (!pendingScrollActionID) {
            return;
        }

        // The optimistic row normally arrives immediately. A filtered or failed row must not
        // scroll the reader much later when pagination or reconnecting makes it visible.
        const timeout = setTimeout(() => setPendingScrollActionID(undefined), PENDING_SENT_ACTION_TIMEOUT_MS);
        return () => clearTimeout(timeout);
    }, [pendingScrollActionID]);

    const scrollToBottomForCurrentUserAction = useEffectEvent<Parameters<typeof subscribeToNewActionEvent>[1]>((isFromCurrentUser, action, source = 'local') => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
                // they are now in the list.
                const shouldIgnoreActionOutsideActiveReport = !isFromCurrentUser || (!isReportTopmostSplitNavigator() && !Navigation.getReportRHPActiveRoute());
                if (shouldIgnoreActionOutsideActiveReport) {
                    return;
                }
                // A realtime echo can represent an edit or deletion, whereas local payload-less
                // notifications from money requests still need the usual live-tail behavior.
                const isRealtimeEventWithoutAction = !action && source === 'realtime';
                if (isRealtimeEventWithoutAction) {
                    return;
                }

                // An unread marker only needs openReport when the newest actions are not loaded yet. When they are, they are
                // just off-screen, so scroll to them directly instead of waiting on a network round trip.
                const shouldJumpToLiveTail =
                    !isOffline &&
                    action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
                    (hasNewerActions || !!linkedReportActionID || (!!unreadMarkerReportActionID && !hasNewestReportAction));

                if (shouldJumpToLiveTail) {
                    requestLiveTailJump();
                    return;
                }

                // Release the old pagination anchor so offline sends appear without waiting for openReport.
                const shouldReleaseOfflineLink = isOffline && linkedReportActionID && action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
                if (shouldReleaseOfflineLink) {
                    liveTailJumpRef.current = {stage: 'await_prune'};
                    setTreatAsNoPaginationAnchor(true);
                    navigation.setParams({reportActionID: ''});
                }
                if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                    const index = renderedVisibleReportActions.findIndex((item) => item.reportActionID === action.reportActionID);
                    setIsFloatingMessageCounterVisible(false);
                    const isPreviewBeforeNewestAction = index >= 0 && index < renderedVisibleReportActions.length - 1;
                    if (isPreviewBeforeNewestAction) {
                        setTimeout(() => {
                            reportScrollManager.scrollToIndex(index);
                        }, 100);
                    } else {
                        reportScrollManager.scrollToBottom();
                    }
                } else {
                    setIsFloatingMessageCounterVisible(false);
                    if (action?.reportActionID) {
                        setPendingScrollActionID(action.reportActionID);
                    } else {
                        setShouldScrollToBottom(true);
                    }
                }
            },
        });
    });

    const completeLiveTailPruneAfterScrollToBottom = () => {
        if (liveTailJumpRef.current.stage !== 'await_prune') {
            return;
        }
        pruneReportActionPagesToNewestWindow(reportID, sortedAllReportActionsForPagination, reportActionPages);
        setTreatAsNoPaginationAnchor(false);
        liveTailJumpRef.current = {stage: 'idle'};
    };

    useEffect(() => {
        liveTailJumpRef.current = {stage: 'idle'};
    }, [reportID]);

    // Screen-scoped, so it clears this report route's param rather than the focused route's (e.g. an open RHP).
    // In the side panel there is no navigator screen: the route is synthetic and carries no reportActionID, and
    // `navigation` is the withNavigationFallback stub, so the call would only be a logged no-op.
    // An effect event so `navigation` / `isInSidePanel` stay out of the caller's dependency list - neither triggers the jump.
    const clearLinkedActionParam = useEffectEvent(() => {
        if (isInSidePanel) {
            return;
        }
        navigation.setParams({reportActionID: ''});
    });

    useEffect(() => {
        if (liveTailJumpRef.current.stage === 'open_report') {
            const {requestID} = liveTailJumpRef.current;
            const result = liveTailRequestResults?.[requestID];
            if (!result?.settled) {
                return;
            }

            clearLiveTailRequestResult(reportID, requestID);
            if (!result.newestActionID) {
                // Keep the historical route when this request failed or the update manager discarded its page.
                liveTailJumpRef.current = {stage: 'idle'};
                if (treatAsNoPaginationAnchor) {
                    setTreatAsNoPaginationAnchor(false);
                }
                return;
            }

            liveTailJumpRef.current = {stage: 'await_scroll', newestActionID: result.newestActionID};
        }

        if (liveTailJumpRef.current.stage !== 'await_scroll') {
            return;
        }
        const {newestActionID} = liveTailJumpRef.current;
        if (newestActionID) {
            // A follower can receive the receipt, page keys, and actions separately. Hidden actions still belong to the page.
            const hasRequestedPage = reportActionPages?.some((page) => page.at(0) === CONST.PAGINATION_START_ID && page.includes(newestActionID));
            if (!hasRequestedPage || !sortedAllReportActionsForPagination.some((action) => action.reportActionID === newestActionID)) {
                return;
            }
        }
        if (!treatAsNoPaginationAnchor) {
            setTreatAsNoPaginationAnchor(true);
            return;
        }
        if (!isOffline && !hasNewestReportAction) {
            return;
        }

        clearLinkedActionParam();
        liveTailJumpRef.current = {stage: 'await_prune'};
        setIsFloatingMessageCounterVisible(false);
        // Defer so this effect does not synchronously chain a second render from setState (eslint react-hooks/set-state-in-effect).
        queueMicrotask(() => {
            setShouldScrollToBottom(true);
        });
    }, [
        hasNewestReportAction,
        isOffline,
        liveTailRequestResults,
        reportActionPages,
        reportID,
        setIsFloatingMessageCounterVisible,
        setShouldScrollToBottom,
        setTreatAsNoPaginationAnchor,
        sortedAllReportActionsForPagination,
        treatAsNoPaginationAnchor,
    ]);

    useEffect(() => {
        // Why are we doing this, when in the cleanup of the useEffect we are already calling the unsubscribe function?
        // Answer: On web, when navigating to another report screen, the previous report screen doesn't get unmounted,
        //         meaning that the cleanup might not get called. When we then open a report we had open already previously, a new
        //         ReportScreen will get created. Thus, we have to cancel the earlier subscription of the previous screen,
        //         because the two subscriptions could conflict!
        //         In case we return to the previous screen (e.g. by web back navigation) the useEffect for that screen would
        //         fire again, as the focus has changed and will set up the subscription correctly again.
        const previousSubUnsubscribe = newActionUnsubscribeMap[reportID];
        if (previousSubUnsubscribe) {
            previousSubUnsubscribe();
        }

        const unsubscribe = subscribeToNewActionEvent(reportID, scrollToBottomForCurrentUserAction);

        const cleanup = () => {
            if (!unsubscribe) {
                return;
            }
            unsubscribe();
        };

        newActionUnsubscribeMap[reportID] = cleanup;

        return cleanup;
    }, [reportID]);

    return {
        isScrollToBottomEnabled: isScrollToBottomEnabled || isPendingScrollActionRendered,
        setIsScrollToBottomEnabled: setShouldScrollToBottom,
        completeLiveTailPruneAfterScrollToBottom,
        requestLiveTailJump,
    };
}

export default useReportActionsNewActionLiveTail;
