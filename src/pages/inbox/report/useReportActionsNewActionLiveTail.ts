import {useCallback, useEffect, useEffectEvent, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type useReportScrollManager from '@hooks/useReportScrollManager';
import type {OpenReportActionParams} from '@libs/actions/Report';
import {openReport, pruneReportActionPagesToNewestWindow, subscribeToNewActionEvent} from '@libs/actions/Report';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

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
    introSelected: OpenReportActionParams['introSelected'];
    betas: OpenReportActionParams['betas'];
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
    introSelected,
    betas,
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
    const liveTailJumpRef = useRef<{stage: LiveTailJumpStage}>({stage: 'idle'});
    const [isScrollToBottomEnabled, setIsScrollToBottomEnabled] = useState(false);

    const scrollToBottomForCurrentUserAction = useEffectEvent((isFromCurrentUser: boolean, action?: OnyxTypes.ReportAction) => {
        InteractionManager.runAfterInteractions(() => {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
            // they are now in the list.
            if (!isFromCurrentUser || (!isReportTopmostSplitNavigator() && !Navigation.getReportRHPActiveRoute())) {
                return;
            }
            if (!hasNewestReportAction && !isFromCurrentUser) {
                if (Navigation.getReportRHPActiveRoute()) {
                    return;
                }
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                });
                return;
            }

            const shouldJumpToLiveTail =
                !isOffline && action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && (hasNewerActions || !!linkedReportActionID || unreadMarkerReportActionID);

            if (shouldJumpToLiveTail) {
                if (liveTailJumpRef.current.stage === 'idle') {
                    liveTailJumpRef.current = {stage: 'open_report'};
                    openReport({
                        reportID,
                        introSelected,
                        betas,
                    });
                }
                return;
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
        });
    });

    const completeLiveTailPruneAfterScrollToBottom = useCallback(() => {
        if (liveTailJumpRef.current.stage !== 'await_prune') {
            return;
        }
        pruneReportActionPagesToNewestWindow(reportID, sortedAllReportActionsForPagination, reportActionPages);
        setTreatAsNoPaginationAnchor(false);
        liveTailJumpRef.current = {stage: 'idle'};
    }, [reportID, sortedAllReportActionsForPagination, reportActionPages, setTreatAsNoPaginationAnchor]);

    useEffect(() => {
        liveTailJumpRef.current = {stage: 'idle'};
    }, [reportID]);

    useEffect(() => {
        if (liveTailJumpRef.current.stage !== 'open_report') {
            return;
        }

        const finishedInitialLoad = prevIsLoadingInitialReportActions === true && reportLoadingState?.isLoadingInitialReportActions === false;

        if (!finishedInitialLoad) {
            return;
        }

        setTreatAsNoPaginationAnchor(true);
        Navigation.setParams({reportActionID: ''});
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
    };
}

export default useReportActionsNewActionLiveTail;
