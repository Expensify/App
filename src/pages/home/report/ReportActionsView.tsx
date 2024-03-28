import type {RouteProp} from '@react-navigation/native';
import {useIsFocused, useRoute} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useInitialValue from '@hooks/useInitialValue';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import getIsReportFullyVisible from '@libs/getIsReportFullyVisible';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import * as NumberUtils from '@libs/NumberUtils';
import {generateNewRandomInt} from '@libs/NumberUtils';
import Performance from '@libs/Performance';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import {isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import * as ReportUtils from '@libs/ReportUtils';
import {didUserLogInDuringSession} from '@libs/SessionUtils';
import shouldFetchReport from '@libs/shouldFetchReport';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import getInitialPaginationSize from './getInitialPaginationSize';
import PopoverReactionList from './ReactionList/PopoverReactionList';
import ReportActionsList from './ReportActionsList';

type ReportActionsViewOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};

type ReportActionsViewProps = ReportActionsViewOnyxProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The report metadata loading states */
    isLoadingInitialReportActions?: boolean;

    /** The report actions are loading more data */
    isLoadingOlderReportActions?: boolean;

    /** The report actions are loading newer data */
    isLoadingNewerReportActions?: boolean;

    /** Whether the report is ready for comment linking */
    isReadyForCommentLinking?: boolean;
};

const DIFF_BETWEEN_SCREEN_HEIGHT_AND_LIST = 120;
const SPACER = 16;

let listOldID = Math.round(Math.random() * 100);

function ReportActionsView({
    report,
    session,
    parentReportAction,
    reportActions: allReportActions = [],
    isLoadingInitialReportActions = false,
    isLoadingOlderReportActions = false,
    isLoadingNewerReportActions = false,
    isReadyForCommentLinking = false,
}: ReportActionsViewProps) {
    useCopySelectionHelper();
    const reactionListRef = useContext(ReactionListContext);
    const route = useRoute<RouteProp<CentralPaneNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionID = route?.params?.reportActionID;
    const didLayout = useRef(false);
    const didSubscribeToReportTypingEvents = useRef(false);

    // triggerListID is used when navigating to a chat with messages loaded from LHN. Typically, these include thread actions, task actions, etc. Since these messages aren't the latest,we don't maintain their position and instead trigger a recalculation of their positioning in the list.
    // we don't set currentReportActionID on initial render as linkedID as it should trigger visibleReportActions after linked message was positioned
    const [currentReportActionID, setCurrentReportActionID] = useState('');
    const isFirstLinkedActionRender = useRef(true);

    const network = useNetwork();
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const contentListHeight = useRef(0);
    const isFocused = useIsFocused();
    const prevNetworkRef = useRef(network);
    const prevAuthTokenType = usePrevious(session?.authTokenType);
    const [isNavigatingToLinkedMessage, setNavigatingToLinkedMessage] = useState(!!reportActionID);
    const prevIsSmallScreenWidthRef = useRef(isSmallScreenWidth);
    const reportID = report.reportID;
    const isLoading = (!!reportActionID && isLoadingInitialReportActions) || !isReadyForCommentLinking;

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const fetchNewerAction = useCallback(
        (newestReportAction: OnyxTypes.ReportAction) => {
            if (isLoadingNewerReportActions || isLoadingInitialReportActions) {
                return;
            }

            Report.getNewerActions(reportID, newestReportAction.reportActionID);
        },
        [isLoadingNewerReportActions, isLoadingInitialReportActions, reportID],
    );

    const isReportFullyVisible = useMemo((): boolean => getIsReportFullyVisible(isFocused), [isFocused]);

    const openReportIfNecessary = () => {
        if (!shouldFetchReport(report)) {
            return;
        }

        Report.openReport(reportID, reportActionID);
    };

    const reconnectReportIfNecessary = () => {
        if (!shouldFetchReport(report)) {
            return;
        }

        Report.reconnect(reportID);
    };

    useLayoutEffect(() => {
        setCurrentReportActionID('');
    }, [route]);

    // Change the list ID only for comment linking to get the positioning right
    const listID = useMemo(() => {
        if (!reportActionID) {
            // Keep the old list ID since we're not in the Comment Linking flow
            return listOldID;
        }
        isFirstLinkedActionRender.current = true;
        const newID = generateNewRandomInt(listOldID, 1, Number.MAX_SAFE_INTEGER);
        listOldID = newID;
        return newID;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, isLoadingInitialReportActions]);

    const indexOfLinkedAction = useMemo(() => {
        if (!reportActionID || isLoading) {
            return -1;
        }

        return allReportActions.findIndex((obj) => String(obj.reportActionID) === String(isFirstLinkedActionRender.current ? reportActionID : currentReportActionID));
    }, [allReportActions, currentReportActionID, reportActionID, isLoading]);

    const reportActions = useMemo(() => {
        if (!reportActionID) {
            return allReportActions;
        }
        if (isLoading || indexOfLinkedAction === -1) {
            return [];
        }

        if (isFirstLinkedActionRender.current) {
            return allReportActions.slice(indexOfLinkedAction);
        }
        const paginationSize = getInitialPaginationSize;
        return allReportActions.slice(Math.max(indexOfLinkedAction - paginationSize, 0));
        // currentReportActionID is needed to trigger batching once the report action has been positioned
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportActionID, allReportActions, indexOfLinkedAction, isLoading, currentReportActionID]);

    const hasMoreCached = reportActions.length < allReportActions.length;
    const newestReportAction = useMemo(() => reportActions?.[0], [reportActions]);
    const handleReportActionPagination = useCallback(
        ({firstReportActionID}: {firstReportActionID: string}) => {
            // This function is a placeholder as the actual pagination is handled by visibleReportActions
            if (!hasMoreCached) {
                isFirstLinkedActionRender.current = false;
                fetchNewerAction(newestReportAction);
            }
            if (isFirstLinkedActionRender.current) {
                isFirstLinkedActionRender.current = false;
            }
            setCurrentReportActionID(firstReportActionID);
        },
        [fetchNewerAction, hasMoreCached, newestReportAction],
    );

    const mostRecentIOUReportActionID = useMemo(() => ReportActionsUtils.getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const hasCachedActionOnFirstRender = useInitialValue(() => reportActions.length > 0);
    const hasNewestReportAction = reportActions[0]?.created === report.lastVisibleActionCreated;

    const oldestReportAction = useMemo(() => reportActions?.at(-1), [reportActions]);
    const hasCreatedAction = oldestReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;

    useEffect(() => {
        if (reportActionID) {
            return;
        }

        const interactionTask = InteractionManager.runAfterInteractions(() => {
            openReportIfNecessary();
        });
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (interactionTask) {
            return () => {
                interactionTask.cancel();
            };
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!reportActionID) {
            return;
        }

        // This function is triggered when a user clicks on a link to navigate to a report.
        // For each link click, we retrieve the report data again, even though it may already be cached.
        // There should be only one openReport execution per page start or navigating
        Report.openReport(reportID, reportActionID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route]);

    useEffect(() => {
        const prevNetwork = prevNetworkRef.current;
        // When returning from offline to online state we want to trigger a request to OpenReport which
        // will fetch the reportActions data and mark the report as read. If the report is not fully visible
        // then we call ReconnectToReport which only loads the reportActions data without marking the report as read.
        const wasNetworkChangeDetected = prevNetwork.isOffline && !network.isOffline;
        if (wasNetworkChangeDetected) {
            if (isReportFullyVisible) {
                openReportIfNecessary();
            } else {
                reconnectReportIfNecessary();
            }
        }
        // update ref with current network state
        prevNetworkRef.current = network;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [network, isReportFullyVisible]);

    useEffect(() => {
        const wasLoginChangedDetected = prevAuthTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS && !session?.authTokenType;
        if (wasLoginChangedDetected && didUserLogInDuringSession() && isUserCreatedPolicyRoom(report)) {
            if (isReportFullyVisible) {
                openReportIfNecessary();
            } else {
                reconnectReportIfNecessary();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, report, isReportFullyVisible]);

    useEffect(() => {
        const prevIsSmallScreenWidth = prevIsSmallScreenWidthRef.current;
        // If the view is expanded from mobile to desktop layout
        // we update the new marker position, mark the report as read, and fetch new report actions
        const didScreenSizeIncrease = prevIsSmallScreenWidth && !isSmallScreenWidth;
        const didReportBecomeVisible = isReportFullyVisible && didScreenSizeIncrease;
        if (didReportBecomeVisible) {
            openReportIfNecessary();
        }
        // update ref with current state
        prevIsSmallScreenWidthRef.current = isSmallScreenWidth;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSmallScreenWidth, reportActions, isReportFullyVisible]);

    useEffect(() => {
        // Ensures the optimistic report is created successfully
        if (route?.params?.reportID !== reportID) {
            return;
        }
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !report.pendingFields || (!report.pendingFields.addWorkspaceRoom && !report.pendingFields.createChat);
        if (!didSubscribeToReportTypingEvents.current && didCreateReportSuccessfully) {
            const interactionTask = InteractionManager.runAfterInteractions(() => {
                Report.subscribeToReportTypingEvents(reportID);
                didSubscribeToReportTypingEvents.current = true;
            });
            return () => {
                interactionTask.cancel();
            };
        }
    }, [report.pendingFields, didSubscribeToReportTypingEvents, route, reportID]);

    const onContentSizeChange = useCallback((w: number, h: number) => {
        contentListHeight.current = h;
    }, []);

    const checkIfContentSmallerThanList = useCallback(() => windowHeight - DIFF_BETWEEN_SCREEN_HEIGHT_AND_LIST - SPACER > contentListHeight.current, [windowHeight]);

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = useCallback(() => {
        // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
        if (!!network.isOffline || isLoadingOlderReportActions || isLoadingInitialReportActions) {
            return;
        }

        // Don't load more chats if we're already at the beginning of the chat history
        if (!oldestReportAction || hasCreatedAction) {
            return;
        }
        // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
        Report.getOlderActions(reportID, oldestReportAction.reportActionID);
    }, [network.isOffline, isLoadingOlderReportActions, isLoadingInitialReportActions, oldestReportAction, hasCreatedAction, reportID]);

    const loadNewerChats = useCallback(() => {
        if (isLoadingInitialReportActions || isLoadingOlderReportActions || network.isOffline || newestReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        // Determines if loading older reports is necessary when the content is smaller than the list
        // and there are fewer than 23 items, indicating we've reached the oldest message.
        const isLoadingOlderReportsFirstNeeded = checkIfContentSmallerThanList() && reportActions.length > 23;

        if (
            (reportActionID && indexOfLinkedAction > -1 && !hasNewestReportAction && !isLoadingOlderReportsFirstNeeded) ||
            (!reportActionID && !hasNewestReportAction && !isLoadingOlderReportsFirstNeeded)
        ) {
            handleReportActionPagination({firstReportActionID: newestReportAction?.reportActionID});
        }
    }, [
        isLoadingInitialReportActions,
        isLoadingOlderReportActions,
        checkIfContentSmallerThanList,
        reportActionID,
        indexOfLinkedAction,
        hasNewestReportAction,
        handleReportActionPagination,
        network.isOffline,
        reportActions.length,
        newestReportAction,
    ]);

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = useCallback(() => {
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;
        // Capture the init measurement only once not per each chat switch as the value gets overwritten
        if (!ReportActionsView.initMeasured) {
            Performance.markEnd(CONST.TIMING.REPORT_INITIAL_RENDER);
            Timing.end(CONST.TIMING.REPORT_INITIAL_RENDER);
            ReportActionsView.initMeasured = true;
        } else {
            Performance.markEnd(CONST.TIMING.SWITCH_REPORT);
        }
        Timing.end(CONST.TIMING.SWITCH_REPORT, hasCachedActionOnFirstRender ? CONST.TIMING.WARM : CONST.TIMING.COLD);
    }, [hasCachedActionOnFirstRender]);

    useEffect(() => {
        // Temporary solution for handling REPORTPREVIEW. More details: https://expensify.slack.com/archives/C035J5C9FAP/p1705417778466539?thread_ts=1705035404.136629&cid=C035J5C9FAP
        // This code should be removed once REPORTPREVIEW is no longer repositioned.
        // We need to call openReport for gaps created by moving REPORTPREVIEW, which causes mismatches in previousReportActionID and reportActionID of adjacent reportActions. The server returns the correct sequence, allowing us to overwrite incorrect data with the correct one.
        const shouldOpenReport =
            newestReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW &&
            !hasCreatedAction &&
            isReadyForCommentLinking &&
            reportActions.length < 24 &&
            reportActions.length >= 1 &&
            !isLoadingInitialReportActions &&
            !isLoadingOlderReportActions &&
            !isLoadingNewerReportActions;

        if (shouldOpenReport) {
            Report.openReport(reportID, reportActionID);
        }
    }, [
        hasCreatedAction,
        reportID,
        reportActions,
        reportActionID,
        newestReportAction?.actionName,
        isReadyForCommentLinking,
        isLoadingOlderReportActions,
        isLoadingNewerReportActions,
        isLoadingInitialReportActions,
    ]);

    // Check if the first report action in the list is the one we're currently linked to
    const isTheFirstReportActionIsLinked = newestReportAction?.reportActionID === reportActionID;

    useEffect(() => {
        let timerID: NodeJS.Timeout;

        if (isTheFirstReportActionIsLinked) {
            setNavigatingToLinkedMessage(true);
        } else {
            // After navigating to the linked reportAction, apply this to correctly set
            // `autoscrollToTopThreshold` prop when linking to a specific reportAction.
            InteractionManager.runAfterInteractions(() => {
                // Using a short delay to ensure the view is updated after interactions
                timerID = setTimeout(() => setNavigatingToLinkedMessage(false), 10);
            });
        }

        return () => {
            if (!timerID) {
                return;
            }
            clearTimeout(timerID);
        };
    }, [isTheFirstReportActionIsLinked]);

    // When we are offline before opening a money request report,
    // the total of the report and sometimes the money request aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate a money request action if the number of money requests in reportActions is less than the total number of money requests
    // to display at least one money request action to match the total data.
    const reportActionsToDisplay = useMemo(() => {
        if (!ReportUtils.isMoneyRequestReport(report) || !reportActions.length) {
            return reportActions;
        }

        const actions = [...reportActions];
        const lastAction = reportActions[reportActions.length - 1];

        if (!ReportActionsUtils.isCreatedAction(lastAction)) {
            const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(String(report?.ownerAccountID), DateUtils.subtractMillisecondsFromDateTime(lastAction.created, 1));
            optimisticCreatedAction.pendingAction = null;
            actions.push(optimisticCreatedAction);
        }

        const reportPreviewAction = ReportActionsUtils.getReportPreviewAction(report.chatReportID ?? '', report.reportID);
        const moneyRequestActions = reportActions.filter(
            (action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && action.originalMessage && action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        );

        if (report.total && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0)) {
            const optimisticIOUAction = ReportUtils.buildOptimisticIOUReportAction(
                CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                0,
                CONST.CURRENCY.USD,
                '',
                [],
                NumberUtils.rand64(),
                undefined,
                report.reportID,
                false,
                false,
                {},
                false,
                DateUtils.subtractMillisecondsFromDateTime(actions[actions.length - 1].created, 1),
            ) as OnyxTypes.ReportAction;
            moneyRequestActions.push(optimisticIOUAction);
            actions.splice(actions.length - 1, 0, optimisticIOUAction);
        }

        // Update pending action of created action if we have some requests that are pending
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const createdAction = actions.pop()!;
        if (moneyRequestActions.filter((action) => Boolean(action.pendingAction)).length > 0) {
            createdAction.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
        }

        return [...actions, createdAction];
    }, [reportActions, report]);

    // Comments have not loaded at all yet do nothing
    if (!reportActions.length) {
        return null;
    }
    // AutoScroll is disabled when we do linking to a specific reportAction
    const shouldEnableAutoScroll = hasNewestReportAction && (!reportActionID || !isNavigatingToLinkedMessage);

    return (
        <>
            <ReportActionsList
                report={report}
                parentReportAction={parentReportAction}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={reportActionsToDisplay}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                isLoadingInitialReportActions={isLoadingInitialReportActions}
                isLoadingOlderReportActions={isLoadingOlderReportActions}
                isLoadingNewerReportActions={isLoadingNewerReportActions}
                listID={listID}
                onContentSizeChange={onContentSizeChange}
                shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScroll}
            />
            <PopoverReactionList ref={reactionListRef} />
        </>
    );
}

ReportActionsView.displayName = 'ReportActionsView';
ReportActionsView.initMeasured = false;

function arePropsEqual(oldProps: ReportActionsViewProps, newProps: ReportActionsViewProps): boolean {
    if (!lodashIsEqual(oldProps.isReadyForCommentLinking, newProps.isReadyForCommentLinking)) {
        return false;
    }
    if (!lodashIsEqual(oldProps.reportActions, newProps.reportActions)) {
        return false;
    }

    if (!lodashIsEqual(oldProps.parentReportAction, newProps.parentReportAction)) {
        return false;
    }

    if (oldProps.session?.authTokenType !== newProps.session?.authTokenType) {
        return false;
    }

    if (oldProps.isLoadingInitialReportActions !== newProps.isLoadingInitialReportActions) {
        return false;
    }

    if (oldProps.isLoadingOlderReportActions !== newProps.isLoadingOlderReportActions) {
        return false;
    }

    if (oldProps.isLoadingNewerReportActions !== newProps.isLoadingNewerReportActions) {
        return false;
    }

    return lodashIsEqual(oldProps.report, newProps.report);
}

const MemoizedReportActionsView = React.memo(ReportActionsView, arePropsEqual);

export default Performance.withRenderTrace({id: '<ReportActionsView> rendering'})(
    withOnyx<ReportActionsViewProps, ReportActionsViewOnyxProps>({
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(MemoizedReportActionsView),
);
