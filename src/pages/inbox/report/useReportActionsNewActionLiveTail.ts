import useIsInSidePanel from '@hooks/useIsInSidePanel';
import type useReportScrollManager from '@hooks/useReportScrollManager';

import {openReport, pruneReportActionPagesToNewestWindow} from '@libs/actions/Report';
import {subscribeToNewActionEvent} from '@libs/actions/Report/reportActionSubscribers';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

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

type RAMOnlyReportLoadingState = OnyxEntry<{
    isLoadingInitialReportActions?: boolean;
}>;

type UseReportActionsNewActionLiveTailParams = {
    reportID: string;
    policyID: string | undefined;
    isOffline: boolean;
    reportScrollManager: ReportScrollManager;
    setIsFloatingMessageCounterVisible: (visible: boolean) => void;
    setActionIdToHighlight: (actionID: string) => void;
    unreadMarkerReportActionID: string | null;
    hasNewerActions: boolean;
    linkedReportActionID: string | undefined;
    hasNewestReportAction: boolean;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    sortedAllReportActionsForPagination: OnyxTypes.ReportAction[];
    reportActionPages: OnyxTypes.Pages | undefined;
    setTreatAsNoPaginationAnchor: (value: boolean) => void;
    treatAsNoPaginationAnchor: boolean;
    prevIsLoadingInitialReportActions: boolean | undefined;
    reportLoadingState: RAMOnlyReportLoadingState;
};

type LiveTailJumpStage = 'idle' | 'open_report' | 'await_scroll' | 'await_prune';

/**
 * Owns subscribe-to-new-action scrolling, live-tail jump (openReport → scroll → prune), and the
 * deferred scroll + pagination prune after layout. Uses useEffectEvent for the Pusher subscription handler so it
 * always sees the latest props without mirror refs. The layout-time prune step uses useCallback so callers can invoke
 * it from list `onLayout` outside this hook.
 */
function useReportActionsNewActionLiveTail({
    reportID,
    policyID,
    isOffline,
    reportScrollManager,
    setIsFloatingMessageCounterVisible,
    setActionIdToHighlight,
    unreadMarkerReportActionID,
    hasNewerActions,
    linkedReportActionID,
    hasNewestReportAction,
    sortedVisibleReportActions,
    sortedAllReportActionsForPagination,
    reportActionPages,
    setTreatAsNoPaginationAnchor,
    treatAsNoPaginationAnchor,
    prevIsLoadingInitialReportActions,
    reportLoadingState,
}: UseReportActionsNewActionLiveTailParams) {
    const navigation = useNavigation<PlatformStackNavigationProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const isInSidePanel = useIsInSidePanel();
    const liveTailJumpRef = useRef<{stage: LiveTailJumpStage}>({stage: 'idle'});
    const [isScrollToBottomEnabled, setIsScrollToBottomEnabled] = useState(false);

    // Read openReport's inputs only when a jump happens, so the list does not subscribe to them
    const openReportAtLiveTail = async () => {
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
            introSelected,
            conciergeChat,
            hasReportActions: true,
            currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            fullPolicySnapshot: policyID && fullPolicySnapshotLastModified ? {policyID, lastModified: fullPolicySnapshotLastModified} : undefined,
        });
    };

    const scrollToBottomForCurrentUserAction = useEffectEvent((isFromCurrentUser: boolean, action?: OnyxTypes.ReportAction) => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
                // they are now in the list.
                if (!isFromCurrentUser || (!isReportTopmostSplitNavigator() && !Navigation.getReportRHPActiveRoute())) {
                    return;
                }

                // An unread marker only needs openReport when the newest actions are not loaded yet. When they are, they are
                // just off-screen, so scroll to them directly instead of waiting on a network round trip.
                const shouldJumpToLiveTail =
                    !isOffline &&
                    action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
                    (hasNewerActions || !!linkedReportActionID || (!!unreadMarkerReportActionID && !hasNewestReportAction));

                if (shouldJumpToLiveTail) {
                    if (liveTailJumpRef.current.stage === 'idle') {
                        liveTailJumpRef.current = {stage: 'open_report'};
                        openReportAtLiveTail();
                    }
                    return;
                }

                // Release the old pagination anchor so offline sends appear without waiting for openReport.
                if (isOffline && linkedReportActionID && action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                    liveTailJumpRef.current = {stage: 'await_prune'};
                    setTreatAsNoPaginationAnchor(true);
                    navigation.setParams({reportActionID: ''});
                }
                const index = sortedVisibleReportActions.findIndex((item) => item.reportActionID === action?.reportActionID);
                if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                    if (index > 0) {
                        setTimeout(() => {
                            reportScrollManager.scrollToIndex(index);
                        }, 100);
                    } else {
                        setIsFloatingMessageCounterVisible(false);
                        reportScrollManager.scrollToBottom();
                    }
                    if (action?.reportActionID) {
                        setActionIdToHighlight(action.reportActionID);
                    }
                } else {
                    setIsFloatingMessageCounterVisible(false);
                    reportScrollManager.scrollToBottom();
                }

                setIsScrollToBottomEnabled(true);
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
        if (liveTailJumpRef.current.stage !== 'open_report') {
            return;
        }

        const finishedInitialLoad = prevIsLoadingInitialReportActions === true && reportLoadingState?.isLoadingInitialReportActions === false;

        if (!finishedInitialLoad) {
            return;
        }

        setTreatAsNoPaginationAnchor(true);
        clearLinkedActionParam();
        liveTailJumpRef.current = {stage: 'await_scroll'};
    }, [prevIsLoadingInitialReportActions, reportLoadingState?.isLoadingInitialReportActions, setTreatAsNoPaginationAnchor]);

    useEffect(() => {
        if (liveTailJumpRef.current.stage !== 'await_scroll') {
            return;
        }
        if (!hasNewestReportAction) {
            return;
        }

        liveTailJumpRef.current = {stage: 'await_prune'};
        setIsFloatingMessageCounterVisible(false);
        // Defer so this effect does not synchronously chain a second render from setState (eslint react-hooks/set-state-in-effect).
        queueMicrotask(() => {
            setIsScrollToBottomEnabled(true);
        });
    }, [hasNewestReportAction, treatAsNoPaginationAnchor, setIsFloatingMessageCounterVisible]);

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
        isScrollToBottomEnabled,
        setIsScrollToBottomEnabled,
        completeLiveTailPruneAfterScrollToBottom,
        openReportAtLiveTail,
    };
}

export default useReportActionsNewActionLiveTail;
