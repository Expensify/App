import {useIsFocused, useRoute} from '@react-navigation/native';
import lodashIsEqual from 'lodash/isEqual';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {getNewerActions, getOlderActions, openReport, updateLoadingInitialReportAction} from '@libs/actions/Report';
import Timing from '@libs/actions/Timing';
import DateUtils from '@libs/DateUtils';
import getIsReportFullyVisible from '@libs/getIsReportFullyVisible';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {generateNewRandomInt, rand64} from '@libs/NumberUtils';
import Performance from '@libs/Performance';
import {
    getCombinedReportActions,
    getMostRecentIOURequestActionID,
    getOriginalMessage,
    getReportPreviewAction,
    getSortedReportActionsForDisplay,
    isCreatedAction,
    isDeletedParentAction,
    isMoneyRequestAction,
    shouldReportActionBeVisible,
} from '@libs/ReportActionsUtils';
import {buildOptimisticCreatedReportAction, buildOptimisticIOUReportAction, canUserPerformWriteAction, isMoneyRequestReport, isUserCreatedPolicyRoom} from '@libs/ReportUtils';
import {didUserLogInDuringSession} from '@libs/SessionUtils';
import shouldFetchReport from '@libs/shouldFetchReport';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PopoverReactionList from './ReactionList/PopoverReactionList';
import ReportActionsList from './ReportActionsList';
import UserTypingEventListener from './UserTypingEventListener';

type ReportActionsViewProps = {
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

    /** There an error when loading older report actions */
    hasLoadingOlderReportActionsError?: boolean;

    /** The report actions are loading newer data */
    isLoadingNewerReportActions?: boolean;

    /** There an error when loading newer report actions */
    hasLoadingNewerReportActionsError?: boolean;

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID?: string | null;

    /** If the report has newer actions to load */
    hasNewerActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;
};

let listOldID = Math.round(Math.random() * 100);

function ReportActionsView({
    report,
    parentReportAction,
    reportActions: allReportActions = [],
    isLoadingInitialReportActions = false,
    isLoadingOlderReportActions = false,
    hasLoadingOlderReportActionsError = false,
    isLoadingNewerReportActions = false,
    hasLoadingNewerReportActionsError = false,
    transactionThreadReportID,
    hasNewerActions,
    hasOlderActions,
}: ReportActionsViewProps) {
    useCopySelectionHelper();
    const reactionListRef = useContext(ReactionListContext);
    const route = useRoute<PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.REPORT>>();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID ?? CONST.DEFAULT_NUMBER_ID}`, {
        selector: (reportActions: OnyxEntry<OnyxTypes.ReportActions>) => getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction(report), true),
    });
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`);
    const prevTransactionThreadReport = usePrevious(transactionThreadReport);
    const reportActionID = route?.params?.reportActionID;
    const prevReportActionID = usePrevious(reportActionID);
    const didLayout = useRef(false);
    const didLoadOlderChats = useRef(false);
    const didLoadNewerChats = useRef(false);
    const {isOffline} = useNetwork();

    const network = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const contentListHeight = useRef(0);
    const isFocused = useIsFocused();
    const prevAuthTokenType = usePrevious(session?.authTokenType);
    const [isNavigatingToLinkedMessage, setNavigatingToLinkedMessage] = useState(!!reportActionID);
    const prevShouldUseNarrowLayoutRef = useRef(shouldUseNarrowLayout);
    const reportID = report.reportID;
    const isReportFullyVisible = useMemo((): boolean => getIsReportFullyVisible(isFocused), [isFocused]);
    const openReportIfNecessary = () => {
        if (!shouldFetchReport(report, reportMetadata)) {
            return;
        }

        openReport(reportID, reportActionID);
    };

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionID || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report.reportID);
    }, [isOffline, report.reportID, reportActionID]);

    // Change the list ID only for comment linking to get the positioning right
    const listID = useMemo(() => {
        if (!reportActionID && !prevReportActionID) {
            // Keep the old list ID since we're not in the Comment Linking flow
            return listOldID;
        }
        const newID = generateNewRandomInt(listOldID, 1, Number.MAX_SAFE_INTEGER);
        // eslint-disable-next-line react-compiler/react-compiler
        listOldID = newID;

        return newID;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [route, reportActionID]);

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    const reportActionsToDisplay = useMemo(() => {
        if (!isMoneyRequestReport(report) || !allReportActions.length) {
            return allReportActions;
        }

        const actions = [...allReportActions];
        const lastAction = allReportActions.at(-1);

        if (lastAction && !isCreatedAction(lastAction)) {
            const optimisticCreatedAction = buildOptimisticCreatedReportAction(String(report?.ownerAccountID), DateUtils.subtractMillisecondsFromDateTime(lastAction.created, 1));
            optimisticCreatedAction.pendingAction = null;
            actions.push(optimisticCreatedAction);
        }

        const reportPreviewAction = getReportPreviewAction(report.chatReportID, report.reportID);
        const moneyRequestActions = allReportActions.filter((action) => {
            const originalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
            return (
                isMoneyRequestAction(action) &&
                originalMessage &&
                (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
                    !!(originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails) ||
                    originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK)
            );
        });

        if (report.total && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0) && isEmptyObject(transactionThreadReport)) {
            const optimisticIOUAction = buildOptimisticIOUReportAction(
                CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                0,
                CONST.CURRENCY.USD,
                '',
                [],
                rand64(),
                undefined,
                report.reportID,
                false,
                false,
                false,
                DateUtils.subtractMillisecondsFromDateTime(actions.at(-1)?.created ?? '', 1),
            ) as OnyxTypes.ReportAction;
            moneyRequestActions.push(optimisticIOUAction);
            actions.splice(actions.length - 1, 0, optimisticIOUAction);
        }

        // Update pending action of created action if we have some requests that are pending
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const createdAction = actions.pop()!;
        if (moneyRequestActions.filter((action) => !!action.pendingAction).length > 0) {
            createdAction.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
        }

        return [...actions, createdAction];
    }, [allReportActions, report, transactionThreadReport]);

    // Get a sorted array of reportActions for both the current report and the transaction thread report associated with this report (if there is one)
    // so that we display transaction-level and report-level report actions in order in the one-transaction view
    const reportActions = useMemo(
        () => getCombinedReportActions(reportActionsToDisplay, transactionThreadReportID ?? null, transactionThreadReportActions ?? []),
        [reportActionsToDisplay, transactionThreadReportActions, transactionThreadReportID],
    );

    const parentReportActionForTransactionThread = useMemo(
        () =>
            isEmptyObject(transactionThreadReportActions)
                ? undefined
                : (allReportActions.find((action) => action.reportActionID === transactionThreadReport?.parentReportActionID) as OnyxEntry<OnyxTypes.ReportAction>),
        [allReportActions, transactionThreadReportActions, transactionThreadReport?.parentReportActionID],
    );

    const canPerformWriteAction = canUserPerformWriteAction(report);
    const visibleReportActions = useMemo(
        () =>
            reportActions.filter(
                (reportAction) =>
                    (isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors) &&
                    shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canPerformWriteAction),
            ),
        [reportActions, isOffline, canPerformWriteAction],
    );

    const reportActionIDMap = useMemo(() => {
        const reportActionIDs = allReportActions.map((action) => action.reportActionID);
        return reportActions.map((action) => ({
            reportActionID: action.reportActionID,
            reportID: reportActionIDs.includes(action.reportActionID) ? reportID : transactionThreadReport?.reportID,
        }));
    }, [allReportActions, reportID, transactionThreadReport, reportActions]);

    const newestReportAction = useMemo(() => reportActions?.at(0), [reportActions]);
    const mostRecentIOUReportActionID = useMemo(() => getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const hasNewestReportAction =
        visibleReportActions.at(0)?.created === report.lastVisibleActionCreated || visibleReportActions.at(0)?.created === transactionThreadReport?.lastVisibleActionCreated;
    const oldestReportAction = useMemo(() => reportActions?.at(-1), [reportActions]);

    useEffect(() => {
        const wasLoginChangedDetected = prevAuthTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS && !session?.authTokenType;
        if (wasLoginChangedDetected && didUserLogInDuringSession() && isUserCreatedPolicyRoom(report)) {
            openReportIfNecessary();
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [session, report]);

    useEffect(() => {
        const prevShouldUseNarrowLayout = prevShouldUseNarrowLayoutRef.current;
        // If the view is expanded from mobile to desktop layout
        // we update the new marker position, mark the report as read, and fetch new report actions
        const didScreenSizeIncrease = prevShouldUseNarrowLayout && !shouldUseNarrowLayout;
        const didReportBecomeVisible = isReportFullyVisible && didScreenSizeIncrease;
        if (didReportBecomeVisible) {
            openReportIfNecessary();
        }
        // update ref with current state
        prevShouldUseNarrowLayoutRef.current = shouldUseNarrowLayout;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout, reportActions, isReportFullyVisible]);

    const onContentSizeChange = useCallback((w: number, h: number) => {
        contentListHeight.current = h;
    }, []);

    /**
     * Retrieves the next set of report actions for the chat once we are nearing the end of what we are currently
     * displaying.
     */
    const loadOlderChats = useCallback(
        (force = false) => {
            // Only fetch more if we are neither already fetching (so that we don't initiate duplicate requests) nor offline.
            if (
                !force &&
                (!!network.isOffline ||
                    isLoadingOlderReportActions ||
                    // If there was an error only try again once on initial mount.
                    (didLoadOlderChats.current && hasLoadingOlderReportActionsError) ||
                    isLoadingInitialReportActions)
            ) {
                return;
            }

            // Don't load more chats if we're already at the beginning of the chat history
            if (!oldestReportAction || !hasOlderActions) {
                return;
            }

            didLoadOlderChats.current = true;

            if (!isEmptyObject(transactionThreadReport)) {
                // Get older actions based on the oldest reportAction for the current report
                const oldestActionCurrentReport = reportActionIDMap.findLast((item) => item.reportID === reportID);
                getOlderActions(oldestActionCurrentReport?.reportID, oldestActionCurrentReport?.reportActionID);

                // Get older actions based on the oldest reportAction for the transaction thread report
                const oldestActionTransactionThreadReport = reportActionIDMap.findLast((item) => item.reportID === transactionThreadReport.reportID);
                getOlderActions(oldestActionTransactionThreadReport?.reportID, oldestActionTransactionThreadReport?.reportActionID);
            } else {
                // Retrieve the next REPORT.ACTIONS.LIMIT sized page of comments
                getOlderActions(reportID, oldestReportAction.reportActionID);
            }
        },
        [
            network.isOffline,
            isLoadingOlderReportActions,
            isLoadingInitialReportActions,
            oldestReportAction,
            reportID,
            reportActionIDMap,
            transactionThreadReport,
            hasLoadingOlderReportActionsError,
            hasOlderActions,
        ],
    );

    const loadNewerChats = useCallback(
        (force = false) => {
            if (
                !force &&
                (!reportActionID ||
                    !isFocused ||
                    !newestReportAction ||
                    isLoadingInitialReportActions ||
                    isLoadingNewerReportActions ||
                    !hasNewerActions ||
                    isOffline ||
                    // If there was an error only try again once on initial mount. We should also still load
                    // more in case we have cached messages.
                    (didLoadNewerChats.current && hasLoadingNewerReportActionsError) ||
                    newestReportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            ) {
                return;
            }

            didLoadNewerChats.current = true;

            // If this is a one transaction report, ensure we load newer actions for both this report and the report associated with the transaction
            if (!isEmptyObject(transactionThreadReport)) {
                // Get newer actions based on the newest reportAction for the current report
                const newestActionCurrentReport = reportActionIDMap.find((item) => item.reportID === reportID);
                getNewerActions(newestActionCurrentReport?.reportID, newestActionCurrentReport?.reportActionID);

                // Get newer actions based on the newest reportAction for the transaction thread report
                const newestActionTransactionThreadReport = reportActionIDMap.find((item) => item.reportID === transactionThreadReport.reportID);
                getNewerActions(newestActionTransactionThreadReport?.reportID, newestActionTransactionThreadReport?.reportActionID);
            } else if (newestReportAction) {
                getNewerActions(reportID, newestReportAction.reportActionID);
            }
        },
        [
            reportActionID,
            isFocused,
            newestReportAction,
            isLoadingInitialReportActions,
            isLoadingNewerReportActions,
            hasNewerActions,
            isOffline,
            hasLoadingNewerReportActionsError,
            transactionThreadReport,
            reportActionIDMap,
            reportID,
        ],
    );

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = useCallback(() => {
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;

        Performance.markEnd(CONST.TIMING.OPEN_REPORT);
        Timing.end(CONST.TIMING.OPEN_REPORT);

        Performance.markEnd(CONST.TIMING.OPEN_REPORT_THREAD);
        Timing.end(CONST.TIMING.OPEN_REPORT_THREAD);

        Performance.markEnd(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing.end(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
    }, []);

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

    // Comments have not loaded at all yet do nothing
    if (!reportActions.length) {
        return null;
    }

    // AutoScroll is disabled when we do linking to a specific reportAction
    const shouldEnableAutoScroll = (hasNewestReportAction && (!reportActionID || !isNavigatingToLinkedMessage)) || (transactionThreadReport && !prevTransactionThreadReport);
    return (
        <>
            <ReportActionsList
                report={report}
                transactionThreadReport={transactionThreadReport}
                parentReportAction={parentReportAction}
                parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={reportActions}
                sortedVisibleReportActions={visibleReportActions}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                isLoadingInitialReportActions={isLoadingInitialReportActions}
                isLoadingOlderReportActions={isLoadingOlderReportActions}
                hasLoadingOlderReportActionsError={hasLoadingOlderReportActionsError}
                isLoadingNewerReportActions={isLoadingNewerReportActions}
                hasLoadingNewerReportActionsError={hasLoadingNewerReportActionsError}
                listID={listID}
                onContentSizeChange={onContentSizeChange}
                shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScroll}
            />
            <UserTypingEventListener report={report} />
            <PopoverReactionList ref={reactionListRef} />
        </>
    );
}

ReportActionsView.displayName = 'ReportActionsView';

function arePropsEqual(oldProps: ReportActionsViewProps, newProps: ReportActionsViewProps): boolean {
    if (!lodashIsEqual(oldProps.reportActions, newProps.reportActions)) {
        return false;
    }

    if (!lodashIsEqual(oldProps.parentReportAction, newProps.parentReportAction)) {
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

    if (oldProps.hasLoadingOlderReportActionsError !== newProps.hasLoadingOlderReportActionsError) {
        return false;
    }

    if (oldProps.hasLoadingNewerReportActionsError !== newProps.hasLoadingNewerReportActionsError) {
        return false;
    }

    if (oldProps.hasNewerActions !== newProps.hasNewerActions) {
        return false;
    }

    if (oldProps.hasOlderActions !== newProps.hasOlderActions) {
        return false;
    }

    return lodashIsEqual(oldProps.report, newProps.report);
}

const MemoizedReportActionsView = React.memo(ReportActionsView, arePropsEqual);

export default Performance.withRenderTrace({id: '<ReportActionsView> rendering'})(MemoizedReportActionsView);
