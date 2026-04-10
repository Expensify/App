import {useRoute} from '@react-navigation/native';
import {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {isSafari} from '@libs/Browser';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isReportPreviewAction} from '@libs/ReportActionsUtils';
import {getReportLastVisibleActionCreated} from '@libs/ReportUtils';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {openReport, readNewestAction, subscribeToNewActionEvent} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import useOnyx from './useOnyx';
import useReportScrollManager from './useReportScrollManager';
import useScrollToEndOnNewMessageReceived from './useScrollToEndOnNewMessageReceived';

// In the component we are subscribing to the arrival of new actions.
// As there is the possibility that there are multiple instances of a ReportScreen
// for the same report, we only ever want one subscription to be active, as
// the subscriptions could otherwise be conflicting.
const newActionUnsubscribeMap: Record<string, () => void> = {};

type UseReportActionsScrollParams = {
    reportID: string;
    report: OnyxEntry<OnyxTypes.Report>;
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    readActionSkippedRef: React.RefObject<boolean>;
    unreadMarkerReportActionIndex: number;
    loadOlderChats: (force?: boolean) => void;
    loadNewerChats: (force?: boolean) => void;
    shouldAddCreatedAction: boolean;
    linkedReportActionID: string | undefined;
    shouldScrollToEndAfterLayout: boolean;
    setShouldScrollToEndAfterLayout: (v: boolean) => void;
    shouldFocusToTopOnMount: boolean;
    isOffline: boolean;
    hasOnceLoadedReportActions: boolean;
    onLayout?: (event: LayoutChangeEvent) => void;
};

type UseReportActionsScrollResult = {
    reportScrollManager: ReturnType<typeof useReportScrollManager>;
    trackVerticalScrolling: (event: NativeSyntheticEvent<NativeScrollEvent> | undefined) => void;
    onViewableItemsChanged: (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => void;
    isFloatingMessageCounterVisible: boolean;
    scrollToBottomAndMarkReportAsRead: () => void;
    onStartReached: () => void;
    onEndReached: () => void;
    onLayoutInner: (event: LayoutChangeEvent) => void;
    retryLoadNewerChatsError: () => void;
    actionIdToHighlight: string;
};

function useReportActionsScroll({
    reportID,
    report,
    sortedVisibleReportActions,
    readActionSkippedRef,
    unreadMarkerReportActionIndex,
    loadOlderChats,
    loadNewerChats,
    shouldAddCreatedAction,
    linkedReportActionID,
    shouldScrollToEndAfterLayout,
    setShouldScrollToEndAfterLayout,
    shouldFocusToTopOnMount,
    isOffline,
    hasOnceLoadedReportActions,
    onLayout,
}: UseReportActionsScrollParams): UseReportActionsScrollResult {
    const route = useRoute();
    const backTo = (route?.params as {backTo?: string} | undefined)?.backTo;

    const {scrollOffsetRef} = useContext(ActionListContext);
    const reportScrollManager = useReportScrollManager();

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const [isScrollToBottomEnabled, setIsScrollToBottomEnabled] = useState(false);
    const [actionIdToHighlight, setActionIdToHighlight] = useState('');

    const prevShouldAddCreatedAction = useRef(shouldAddCreatedAction);
    const hasNewestReportActionRef = useRef(false);
    const sortedVisibleReportActionsRef = useRef(sortedVisibleReportActions);

    const lastAction = sortedVisibleReportActions.at(0);
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, undefined);
    const hasNewestReportAction = lastAction?.created === lastVisibleActionCreated || isReportPreviewAction(lastAction);
    hasNewestReportActionRef.current = hasNewestReportAction;
    sortedVisibleReportActionsRef.current = sortedVisibleReportActions;

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged} = useReportUnreadMessageScrollTracking({
        reportID,
        currentVerticalScrollingOffsetRef: scrollOffsetRef,
        readActionSkippedRef,
        unreadMarkerReportActionIndex,
        isInverted: true,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            if (shouldScrollToEndAfterLayout && (!shouldAddCreatedAction || isOffline)) {
                setShouldScrollToEndAfterLayout(false);
            }
        },
        hasOnceLoadedReportActions,
    });

    useScrollToEndOnNewMessageReceived({
        sizeChangeType: 'changed',
        scrollOffsetRef,
        lastActionID: lastAction?.reportActionID,
        visibleActionsLength: sortedVisibleReportActions.length,
        hasNewestReportAction,
        setIsFloatingMessageCounterVisible,
        scrollToEnd: reportScrollManager.scrollToBottom,
        resetKey: linkedReportActionID,
    });

    // Scroll to end when shouldAddCreatedAction flips off (IOU/transaction thread top focus)
    useEffect(() => {
        const shouldTriggerScroll = shouldFocusToTopOnMount && prevShouldAddCreatedAction.current && !shouldAddCreatedAction;
        if (!shouldTriggerScroll) {
            return;
        }
        requestAnimationFrame(() => reportScrollManager.scrollToEnd());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldAddCreatedAction]);

    useEffect(() => {
        prevShouldAddCreatedAction.current = shouldAddCreatedAction;
    }, [shouldAddCreatedAction]);

    // scrollToBottomForCurrentUserAction — called from Pusher new action subscription
    const scrollToBottomForCurrentUserAction = (isFromCurrentUser: boolean, action?: OnyxTypes.ReportAction) => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            // If a new comment is added and it's from the current user scroll to the bottom otherwise leave the user positioned where
            // they are now in the list.
            if (!isFromCurrentUser || (!isReportTopmostSplitNavigator() && !Navigation.getReportRHPActiveRoute())) {
                return;
            }
            if (!hasNewestReportActionRef.current && !isFromCurrentUser) {
                if (Navigation.getReportRHPActiveRoute()) {
                    return;
                }
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                });
                return;
            }
            const index = sortedVisibleReportActionsRef.current.findIndex((item) => item.reportActionID === action?.reportActionID);
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
    };

    // Pusher new action subscription — one per reportID
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

        // This callback is triggered when a new action arrives via Pusher and the event is emitted from Report.js. This allows us to maintain
        // a single source of truth for the "new action" event instead of trying to derive that a new action has appeared from looking at props.
        const unsubscribe = subscribeToNewActionEvent(reportID, scrollToBottomForCurrentUserAction);

        const cleanup = () => {
            if (!unsubscribe) {
                return;
            }
            unsubscribe();
        };

        newActionUnsubscribeMap[reportID] = cleanup;

        return cleanup;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    // Clear highlight timer after scrolling and highlighting
    useEffect(() => {
        if (actionIdToHighlight === '') {
            return;
        }
        // Time highlight is the same as SearchPage
        const timer = setTimeout(() => {
            setActionIdToHighlight('');
        }, durationHighlightItem);
        return () => clearTimeout(timer);
    }, [actionIdToHighlight]);

    // IOU error scroll — scroll to bottom when a new IOU error appears
    const lastIOUActionWithError = sortedVisibleReportActions.find((action) => action.errors);
    const prevLastIOUActionWithErrorID = useRef(lastIOUActionWithError?.reportActionID);

    useEffect(() => {
        if (lastIOUActionWithError?.reportActionID === prevLastIOUActionWithErrorID.current) {
            return;
        }
        prevLastIOUActionWithErrorID.current = lastIOUActionWithError?.reportActionID;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastAction]);

    // Initial scroll to bottom on mount
    useEffect(() => {
        if (linkedReportActionID) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (shouldScrollToEndAfterLayout) {
                return;
            }
            setIsFloatingMessageCounterVisible(false);
            reportScrollManager.scrollToBottom();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Safari whisper scroll fix
    // https://github.com/Expensify/App/issues/54520
    const prevSortedVisibleReportActionsObjects = useRef<Record<string, OnyxTypes.ReportAction>>({});

    useLayoutEffect(() => {
        if (!isSafari()) {
            return;
        }
        const prevSorted = lastAction?.reportActionID ? prevSortedVisibleReportActionsObjects.current[lastAction.reportActionID] : null;
        if (lastAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER && !prevSorted) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                reportScrollManager.scrollToBottom();
            });
        }
    }, [lastAction?.reportActionID, lastAction?.actionName, reportScrollManager]);

    useEffect(() => {
        prevSortedVisibleReportActionsObjects.current = sortedVisibleReportActions.reduce<Record<string, OnyxTypes.ReportAction>>((actions, action) => {
            // eslint-disable-next-line no-param-reassign
            actions[action.reportActionID] = action;
            return actions;
        }, {});
    }, [sortedVisibleReportActions]);

    const scrollToBottomAndMarkReportAsRead = () => {
        setIsFloatingMessageCounterVisible(false);

        if (!hasNewestReportAction) {
            if (!Navigation.getReportRHPActiveRoute()) {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, backTo));
            }
            openReport({reportID, introSelected, betas});
            reportScrollManager.scrollToBottom();
            return;
        }
        reportScrollManager.scrollToBottom();
        // eslint-disable-next-line no-param-reassign
        readActionSkippedRef.current = false;
        readNewestAction(reportID, hasOnceLoadedReportActions);
    };

    const onStartReached = () => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadNewerChats(false)));
    };

    const onEndReached = () => {
        loadOlderChats(false);
    };

    const onLayoutInner = (event: LayoutChangeEvent) => {
        onLayout?.(event);
        if (isScrollToBottomEnabled) {
            reportScrollManager.scrollToBottom();
            setIsScrollToBottomEnabled(false);
        }
        if (shouldScrollToEndAfterLayout && (!shouldAddCreatedAction || isOffline)) {
            requestAnimationFrame(() => {
                reportScrollManager.scrollToEnd();
            });
        }
    };

    const retryLoadNewerChatsError = () => {
        loadNewerChats(true);
    };

    return {
        reportScrollManager,
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        scrollToBottomAndMarkReportAsRead,
        onStartReached,
        onEndReached,
        onLayoutInner,
        retryLoadNewerChatsError,
        actionIdToHighlight,
    };
}

export default useReportActionsScroll;
export type {UseReportActionsScrollParams, UseReportActionsScrollResult};
