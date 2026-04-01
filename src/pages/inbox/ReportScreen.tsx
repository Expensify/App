import {PortalHost} from '@gorhom/portal';
import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ViewStyle} from 'react-native';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyRequestHeader from '@components/MoneyRequestHeader';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import MoneyRequestReceiptView from '@components/ReportActionItem/MoneyRequestReceiptView';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useShowWideRHPVersion from '@components/WideRHPContextProvider/useShowWideRHPVersion';
import WideRHPOverlayWrapper from '@components/WideRHPOverlayWrapper';
import useActionListContextValue from '@hooks/useActionListContextValue';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useNewTransactions from '@hooks/useNewTransactions';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSubmitToDestinationVisible from '@hooks/useSubmitToDestinationVisible';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Log from '@libs/Log';
import {getAllNonDeletedTransactions, shouldDisplayReportTableView, shouldWaitForTransactions as shouldWaitForTransactionsUtil} from '@libs/MoneyRequestReportUtils';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getFilteredReportActionsForReportView,
    getOneTransactionThreadReportID,
    isDeletedParentAction,
    isReportActionVisible,
    isTransactionThread,
    isWhisperAction,
} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {
    canUserPerformWriteAction,
    getReportOfflinePendingActionAndErrors,
    isAdminRoom,
    isAnnounceRoom,
    isGroupChat,
    isInvoiceReport,
    isMoneyRequest,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isPolicyExpenseChat,
    isReportTransactionThread,
    isValidReportIDFromPath,
} from '@libs/ReportUtils';
import {getParentReportActionDeletionStatus} from '@libs/TransactionNavigationUtils';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {reportByIDsSelector} from '@src/selectors/Attributes';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AccountManagerBanner from './AccountManagerBanner';
import {AgentZeroStatusProvider} from './AgentZeroStatusContext';
import DeleteTransactionNavigateBackHandler from './DeleteTransactionNavigateBackHandler';
import HeaderView from './HeaderView';
import useReportWasDeleted from './hooks/useReportWasDeleted';
import ReactionListWrapper from './ReactionListWrapper';
import ReportActionsView from './report/ReportActionsView';
import ReportFooter from './report/ReportFooter';
import ReportFetchHandler from './ReportFetchHandler';
import ReportLifecycleHandler from './ReportLifecycleHandler';
import ReportRouteParamHandler from './ReportRouteParamHandler';
import {ActionListContext} from './ReportScreenContext';

type ReportScreenNavigationProps =
    | PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

type ReportScreenProps = ReportScreenNavigationProps;

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

const reportDetailScreens = [
    ...Object.values(SCREENS.REPORT_DETAILS),
    ...Object.values(SCREENS.REPORT_SETTINGS),
    ...Object.values(SCREENS.PRIVATE_NOTES),
    ...Object.values(SCREENS.REPORT_PARTICIPANTS),
];

/**
 * Check is the report is deleted.
 * We currently use useMemo to memorize every properties of the report
 * so we can't check using isEmpty.
 *
 * @param report
 */
function isEmpty(report: OnyxEntry<OnyxTypes.Report>): boolean {
    if (isEmptyObject(report)) {
        return true;
    }
    return !Object.values(report).some((value) => value !== undefined && value !== '');
}

function ReportScreen({route, navigation}: ReportScreenProps) {
    const styles = useThemeStyles();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const isFocused = useIsFocused();
    const [firstRender, setFirstRender] = useState(true);
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isInNarrowPaneModal} = useResponsiveLayout();
    const isInSidePanel = useIsInSidePanel();

    const {currentReportID: currentReportIDValue} = useCurrentReportIDState();

    const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [parentReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportOnyx?.parentReportID}`);
    const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportIDFromRoute}`);
    const [reportNameValuePairsOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportIDFromRoute}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(reportOnyx?.policyID)}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isSelfTourViewed = onboarding?.selfTourViewed;
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const parentReportAction = useParentReportAction(reportOnyx);

    const deletedParentAction = isDeletedParentAction(parentReportAction);
    const prevDeletedParentAction = usePrevious(deletedParentAction);

    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);

    /**
     * Create a lightweight Report so as to keep the re-rendering as light as possible by
     * passing in only the required props.
     *
     * Also, this plays nicely in contrast with Onyx,
     * which creates a new object every time collection changes. Because of this we can't
     * put this into onyx selector as it will be the same.
     */
    const report = useMemo(
        () =>
            reportOnyx && {
                created: reportOnyx.created,
                hasParentAccess: reportOnyx.hasParentAccess,
                lastReadTime: reportOnyx.lastReadTime,
                reportID: reportOnyx.reportID,
                policyID: reportOnyx.policyID,
                lastVisibleActionCreated: reportOnyx.lastVisibleActionCreated,
                statusNum: reportOnyx.statusNum,
                stateNum: reportOnyx.stateNum,
                writeCapability: reportOnyx.writeCapability,
                type: reportOnyx.type,
                errorFields: reportOnyx.errorFields,
                parentReportID: reportOnyx.parentReportID,
                parentReportActionID: reportOnyx.parentReportActionID,
                chatType: reportOnyx.chatType,
                pendingFields: reportOnyx.pendingFields,
                isDeletedParentAction: reportOnyx.isDeletedParentAction,
                reportName: reportOnyx.reportName,
                description: reportOnyx.description,
                managerID: reportOnyx.managerID,
                total: reportOnyx.total,
                nonReimbursableTotal: reportOnyx.nonReimbursableTotal,
                fieldList: reportOnyx.fieldList,
                ownerAccountID: reportOnyx.ownerAccountID,
                currency: reportOnyx.currency,
                unheldTotal: reportOnyx.unheldTotal,
                unheldNonReimbursableTotal: reportOnyx.unheldNonReimbursableTotal,
                participants: reportOnyx.participants,
                isWaitingOnBankAccount: reportOnyx.isWaitingOnBankAccount,
                iouReportID: reportOnyx.iouReportID,
                isOwnPolicyExpenseChat: reportOnyx.isOwnPolicyExpenseChat,
                isPinned: reportOnyx.isPinned,
                chatReportID: reportOnyx.chatReportID,
                visibility: reportOnyx.visibility,
                oldPolicyName: reportOnyx.oldPolicyName,
                policyName: reportOnyx.policyName,
                private_isArchived: reportNameValuePairsOnyx?.private_isArchived,
                lastMentionedTime: reportOnyx.lastMentionedTime,
                avatarUrl: reportOnyx.avatarUrl,
                permissions: reportOnyx?.permissions,
                invoiceReceiver: reportOnyx.invoiceReceiver,
                policyAvatar: reportOnyx.policyAvatar,
                nextStep: reportOnyx.nextStep,
            },
        [reportOnyx, reportNameValuePairsOnyx?.private_isArchived],
    );
    const reportID = report?.reportID;

    const reportAttributesSelector = useCallback((attributes: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => reportByIDsSelector(reportID ? [reportID] : [])(attributes), [reportID]);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: reportAttributesSelector});
    useDocumentTitle(getReportName(report, reportAttributes));

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const prevReport = usePrevious(report);
    const prevUserLeavingStatus = usePrevious(userLeavingStatus);
    const lastReportIDFromRoute = usePrevious(reportIDFromRoute);
    const [isLinkingToMessage, setIsLinkingToMessage] = useState(!!reportActionIDFromRoute);

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const {reportActions: unfilteredReportActions, linkedAction, sortedAllReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    // wrapping in useMemo because this is array operation and can cause performance issues
    const reportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);
    const viewportOffsetTop = useViewportOffsetTop();

    const {reportPendingAction, reportErrors} = getReportOfflinePendingActionAndErrors(report);
    const screenWrapperStyle: ViewStyle[] = [styles.appContent, styles.flex1, {marginTop: viewportOffsetTop}];
    const isOptimisticDelete = report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;

    const {wasDeleted: reportWasDeleted, parentReportID: deletedReportParentID} = useReportWasDeleted(reportIDFromRoute, report, isOptimisticDelete, userLeavingStatus);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const hasPendingDeletionTransaction = Object.values(allReportTransactions ?? {}).some((transaction) => transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

    const reportTransactions = useMemo(() => getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true), [allReportTransactions, reportActions, isOffline]);
    // wrapping in useMemo because this is array operation and can cause performance issues
    const visibleTransactions = useMemo(
        () => reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        [reportTransactions, isOffline],
    );
    const reportTransactionIDs = useMemo(() => visibleTransactions?.map((transaction) => transaction.transactionID), [visibleTransactions]);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const isTopMostReportId = currentReportIDValue === reportIDFromRoute;
    const isTransactionThreadView = isReportTransactionThread(report);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    // Prevent the empty state flash by ensuring transaction data is fully loaded before deciding which view to render
    // We need to wait for both the selector to finish AND ensure we're not in a loading state where transactions could still populate
    const shouldWaitForTransactions = shouldWaitForTransactionsUtil(report, reportTransactions, reportMetadata, isOffline);

    const newTransactions = useNewTransactions(reportMetadata?.hasOnceLoadedReportActions, reportTransactions);

    const {closeSidePanel} = useSidePanelActions();

    const backTo = route?.params?.backTo as string;
    const onBackButtonPress = useCallback(
        (prioritizeBackTo = false) => {
            if (isInSidePanel) {
                closeSidePanel();
                return;
            }
            if (backTo === SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
                Navigation.goBack();
                return;
            }
            if (prioritizeBackTo && backTo) {
                Navigation.goBack(backTo as Route);
                return;
            }
            if (isInNarrowPaneModal) {
                Navigation.goBack();
                return;
            }
            if (backTo) {
                Navigation.goBack(backTo as Route);
                return;
            }
            Navigation.goBack();
        },
        [isInSidePanel, backTo, isInNarrowPaneModal, closeSidePanel],
    );

    const headerView = useMemo(() => {
        if (isTransactionThreadView) {
            return (
                <MoneyRequestHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        }

        if (isMoneyRequestOrInvoiceReport) {
            return (
                <MoneyReportHeader
                    reportID={reportIDFromRoute}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        }

        return (
            <HeaderView
                reportID={reportIDFromRoute}
                onNavigationMenuButtonClicked={onBackButtonPress}
            />
        );
    }, [isTransactionThreadView, isMoneyRequestOrInvoiceReport, onBackButtonPress, reportIDFromRoute]);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isEditingDisabled} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);

    const isLinkedActionDeleted = useMemo(() => {
        if (!linkedAction) {
            return false;
        }
        const actionReportID = linkedAction.reportID ?? reportID;
        if (!actionReportID) {
            return true;
        }
        return !isReportActionVisible(linkedAction, actionReportID, canUserPerformWriteAction(report, isReportArchived), visibleReportActionsData);
    }, [linkedAction, report, isReportArchived, reportID, visibleReportActionsData]);

    const prevIsLinkedActionDeleted = usePrevious(linkedAction ? isLinkedActionDeleted : undefined);

    const lastReportActionIDFromRoute = usePrevious(!firstRender ? reportActionIDFromRoute : undefined);

    const [isNavigatingToDeletedAction, setIsNavigatingToDeletedAction] = useState(false);

    const isLinkedActionInaccessibleWhisper = useMemo(
        () => !!linkedAction && isWhisperAction(linkedAction) && !(linkedAction?.whisperedToAccountIDs ?? []).includes(currentUserAccountID),
        [currentUserAccountID, linkedAction],
    );
    const {isParentActionMissingAfterLoad, isParentActionDeleted} = getParentReportActionDeletionStatus({
        parentReportID: report?.parentReportID,
        parentReportActionID: report?.parentReportActionID,
        parentReportAction,
        parentReportMetadata,
        isOffline,
    });
    const isDeletedTransactionThread = isReportTransactionThread(report) && (isParentActionDeleted || isParentActionMissingAfterLoad);
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);

    // Track whether the current route is an own workspace chat (isOwnPolicyExpenseChat).
    // Must be a ref set synchronously during render — by the time the navigation effects fire
    // after a delegate split, the server SET has wiped report/prevReport in Onyx so we can't
    // rely on live state or usePrevious. See issue #84248.
    const isCurrentRouteOwnWorkspaceChatRef = useRef(false);
    if (report?.reportID && report.reportID === reportIDFromRoute) {
        isCurrentRouteOwnWorkspaceChatRef.current = !!report.isOwnPolicyExpenseChat;
    } else if (!report?.reportID) {
        // Report wiped by Onyx SET — intentionally keep the last known value.
    } else {
        isCurrentRouteOwnWorkspaceChatRef.current = false;
    }

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundLinkedAction =
        (!isLinkedActionInaccessibleWhisper && isLinkedActionDeleted && isNavigatingToDeletedAction) ||
        (!reportMetadata?.isLoadingInitialReportActions &&
            !!reportActionIDFromRoute &&
            !!sortedAllReportActions &&
            sortedAllReportActions?.length > 0 &&
            reportActions.length === 0 &&
            !isLinkingToMessage);

    const currentReportIDFormRoute = route.params?.reportID;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo((): boolean => {
        const isInvalidReportPath = !!currentReportIDFormRoute && !isValidReportIDFromPath(currentReportIDFormRoute);
        const isLoading = isLoadingApp !== false || isLoadingReportData || (!isOffline && !!reportMetadata?.isLoadingInitialReportActions);
        const reportExists = !!reportID || (!isDeletedTransactionThread && isOptimisticDelete) || userLeavingStatus;

        if (shouldShowNotFoundLinkedAction) {
            return true;
        }

        if (deleteTransactionNavigateBackUrl) {
            return false;
        }

        if (isDeletedTransactionThread) {
            return true;
        }

        if (isInvalidReportPath) {
            return true;
        }

        if (isLoading) {
            return false;
        }

        if (firstRender) {
            return false;
        }

        return !reportExists;
    }, [
        shouldShowNotFoundLinkedAction,
        isLoadingApp,
        isLoadingReportData,
        isOffline,
        reportMetadata?.isLoadingInitialReportActions,
        reportID,
        isOptimisticDelete,
        userLeavingStatus,
        currentReportIDFormRoute,
        firstRender,
        deleteTransactionNavigateBackUrl,
        isDeletedTransactionThread,
    ]);

    useEffect(() => {
        if (!shouldShowNotFoundPage) {
            return;
        }

        Log.info('[ReportScreen] Displaying NotFound Page', false, {
            shouldShowNotFoundLinkedAction,
            isLoadingApp,
            isLoadingReportData,
            isOffline,
            isLoadingInitialReportActions: reportMetadata?.isLoadingInitialReportActions,
            reportID,
            isOptimisticDelete,
            userLeavingStatus,
            currentReportIDFormRoute,
            firstRender,
            deleteTransactionNavigateBackUrl,
            isDeletedTransactionThread,
            isParentActionDeleted,
            isParentActionMissingAfterLoad,
            isNavigatingToDeletedAction,
            isLinkedActionInaccessibleWhisper,
            isLinkedActionDeleted,
            isLinkingToMessage,
        });
    }, [
        shouldShowNotFoundPage,
        shouldShowNotFoundLinkedAction,
        isLoadingApp,
        isLoadingReportData,
        isOffline,
        reportMetadata?.isLoadingInitialReportActions,
        reportID,
        isOptimisticDelete,
        userLeavingStatus,
        currentReportIDFormRoute,
        firstRender,
        deleteTransactionNavigateBackUrl,
        isDeletedTransactionThread,
        isParentActionDeleted,
        isParentActionMissingAfterLoad,
        isNavigatingToDeletedAction,
        isLinkedActionInaccessibleWhisper,
        isLinkedActionDeleted,
        isLinkingToMessage,
    ]);

    useEffect(() => {
        // We don't want this effect to run on the first render.
        if (firstRender) {
            setFirstRender(false);
            return;
        }

        const onyxReportID = report?.reportID;
        const prevOnyxReportID = prevReport?.reportID;
        const wasReportRemoved = !!prevOnyxReportID && prevOnyxReportID === reportIDFromRoute && !onyxReportID;
        const isRemovalExpectedForReportType =
            isEmpty(report) &&
            (isMoneyRequest(prevReport) ||
                isMoneyRequestReport(prevReport) ||
                // Own policy expense chats (workspace chats) are excluded: a vacation delegate
                // splitting an expense sends a temporary server SET that wipes the report, but
                // the chat was never intentionally removed. See issue #84248.
                (isPolicyExpenseChat(prevReport) && !prevReport?.isOwnPolicyExpenseChat) ||
                isGroupChat(prevReport) ||
                isAdminRoom(prevReport) ||
                isAnnounceRoom(prevReport));
        const didReportClose = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
        const isTopLevelPolicyRoomWithNoStatus = !report?.statusNum && !prevReport?.parentReportID && prevReport?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
        const isClosedTopLevelPolicyRoom = wasReportRemoved && prevReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN && isTopLevelPolicyRoomWithNoStatus;
        // Navigate to the Concierge chat if the room was removed from another device (e.g. user leaving a room or removed from a room)
        if (
            // non-optimistic case
            (!prevUserLeavingStatus && !!userLeavingStatus) ||
            didReportClose ||
            isRemovalExpectedForReportType ||
            isClosedTopLevelPolicyRoom ||
            (prevDeletedParentAction && !deletedParentAction)
        ) {
            const currentRoute = navigationRef.getCurrentRoute();
            const topmostReportIDInSearchRHP = Navigation.getTopmostSearchReportID();
            const isTopmostSearchReportID = reportIDFromRoute === topmostReportIDInSearchRHP;
            const isHoldScreenOpenInRHP =
                currentRoute?.name === SCREENS.MONEY_REQUEST.HOLD && (route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ? isTopmostSearchReportID : isTopMostReportId);
            const isReportDetailOpenInRHP =
                isTopMostReportId &&
                reportDetailScreens.find((r) => r === currentRoute?.name) &&
                !!currentRoute?.params &&
                typeof currentRoute.params === 'object' &&
                'reportID' in currentRoute.params &&
                reportIDFromRoute === currentRoute.params.reportID;
            // Early return if the report we're passing isn't in a focused state. We only want to navigate to Concierge if the user leaves the room from another device or gets removed from the room while the report is in a focused state.
            // Prevent auto navigation for report in RHP
            if ((!isFocused && !isHoldScreenOpenInRHP && !isReportDetailOpenInRHP) || (!isHoldScreenOpenInRHP && isInNarrowPaneModal)) {
                return;
            }
            Navigation.dismissModal();
            if (Navigation.getTopmostReportId() === prevOnyxReportID) {
                Navigation.isNavigationReady().then(() => {
                    Navigation.popToSidebar();
                });
            }
            if (prevReport?.parentReportID) {
                // Prevent navigation to the IOU/Expense Report if it is pending deletion.
                if (isMoneyRequestReportPendingDeletion(prevReport.parentReportID)) {
                    return;
                }
                Navigation.isNavigationReady().then(() => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(prevReport.parentReportID));
                });
                return;
            }

            Navigation.isNavigationReady().then(() => {
                navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
            });
            return;
        }

        // If you already have a report open and are deeplinking to a new report on native,
        // the ReportScreen never actually unmounts and the reportID in the route also doesn't change.
        // Therefore, we need to compare if the existing reportID is the same as the one in the route
        // before deciding that we shouldn't call OpenReport.
        if (reportIDFromRoute === lastReportIDFromRoute && (!onyxReportID || onyxReportID === reportIDFromRoute)) {
            return;
        }

        setShouldShowComposeInput(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        route.name,
        report,
        prevReport?.reportID,
        prevUserLeavingStatus,
        userLeavingStatus,
        prevReport?.statusNum,
        prevReport?.parentReportID,
        prevReport?.chatType,
        prevReport,
        reportIDFromRoute,
        lastReportIDFromRoute,
        isFocused,
        deletedParentAction,
        prevDeletedParentAction,
    ]);

    useEffect(() => {
        if (!reportWasDeleted) {
            return;
        }

        // Only redirect if focused
        if (!isFocused) {
            return;
        }

        // Do not navigate away for own workspace chats — a delegate split causes a temporary
        // Onyx wipe that looks like a deletion but the chat was never actually removed.
        // See issue #84248.
        if (isCurrentRouteOwnWorkspaceChatRef.current) {
            return;
        }

        // Clean up the navigation stack before redirecting to prevent an infinite loop where
        // pressing back returns to the wiped report URL and re-triggers this effect.
        Navigation.dismissModal();
        if (Navigation.getTopmostReportId() === reportIDFromRoute) {
            Navigation.isNavigationReady().then(() => {
                Navigation.popToSidebar();
            });
        }

        // Try to navigate to parent report if available
        if (deletedReportParentID && !isMoneyRequestReportPendingDeletion(deletedReportParentID)) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(deletedReportParentID));
            });
            return;
        }

        // Fallback to Concierge
        Navigation.isNavigationReady().then(() => {
            navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas);
        });
    }, [reportWasDeleted, isFocused, deletedReportParentID, conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, reportIDFromRoute]);

    const actionListValue = useActionListContextValue();

    // This helps in tracking from the moment 'route' triggers useMemo until isLoadingInitialReportActions becomes true. It prevents blinking when loading reportActions from cache.
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            setIsLinkingToMessage(false);
        });
    }, [reportMetadata?.isLoadingInitialReportActions]);

    const navigateToEndOfReport = useCallback(() => {
        Navigation.setParams({reportActionID: ''});
    }, []);

    useEffect(() => {
        // Only handle deletion cases when there's a deleted action
        if (!isLinkedActionDeleted) {
            setIsNavigatingToDeletedAction(false);
            return;
        }

        // we want to do this distinguish between normal navigation and delete behavior
        if (lastReportActionIDFromRoute !== reportActionIDFromRoute) {
            setIsNavigatingToDeletedAction(true);
            return;
        }

        // Clear params when action gets deleted while highlighting
        if (!isNavigatingToDeletedAction && prevIsLinkedActionDeleted === false) {
            Navigation.setParams({reportActionID: ''});
        }
    }, [isLinkedActionDeleted, prevIsLinkedActionDeleted, lastReportActionIDFromRoute, reportActionIDFromRoute, isNavigatingToDeletedAction]);

    // If user redirects to an inaccessible whisper via a deeplink, on a report they have access to,
    // then we set reportActionID as empty string, so we display them the report and not the "Not found page".
    useEffect(() => {
        if (!isLinkedActionInaccessibleWhisper) {
            return;
        }
        Navigation.isNavigationReady().then(() => {
            Navigation.setParams({reportActionID: ''});
        });
    }, [isLinkedActionInaccessibleWhisper]);

    const lastRoute = usePrevious(route);

    // wrapping into useMemo to stabilize children re-renders as reportMetadata is changed frequently
    const showReportActionsLoadingState = useMemo(
        () => reportMetadata?.isLoadingInitialReportActions && !reportMetadata?.hasOnceLoadedReportActions,
        [reportMetadata?.isLoadingInitialReportActions, reportMetadata?.hasOnceLoadedReportActions],
    );

    // In this case we want to use this value. The  shouldUseNarrowLayout will always be true as this case is handled when we display ReportScreen in RHP.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // If true reports that are considered MoneyRequest | InvoiceReport will get the new report table view
    const shouldDisplayMoneyRequestActionsList = isMoneyRequestOrInvoiceReport && shouldDisplayReportTableView(report, visibleTransactions ?? []);

    // WideRHP should be visible only on wide layout when report is opened in RHP and contains only one expense.
    // This view is only available for reports of type CONST.REPORT.TYPE.EXPENSE or CONST.REPORT.TYPE.IOU.
    const shouldShowWideRHP =
        route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT &&
        !isSmallScreenWidth &&
        !shouldDisplayMoneyRequestActionsList &&
        (isTransactionThread(parentReportAction) ||
            parentReportAction?.childType === CONST.REPORT.TYPE.EXPENSE ||
            parentReportAction?.childType === CONST.REPORT.TYPE.IOU ||
            report?.type === CONST.REPORT.TYPE.EXPENSE ||
            report?.type === CONST.REPORT.TYPE.IOU);

    useShowWideRHPVersion(shouldShowWideRHP);

    useSubmitToDestinationVisible(
        [CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY],
        reportIDFromRoute,
        CONST.TELEMETRY.SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER.FOCUS,
    );

    // Define here because reportActions are recalculated before mount, allowing data to display faster than useEffect can trigger.
    // If we have cached reportActions, they will be shown immediately.
    // We aim to display a loader first, then fetch relevant reportActions, and finally show them.
    if ((lastRoute !== route || lastReportActionIDFromRoute !== reportActionIDFromRoute) && isLinkingToMessage !== !!reportActionIDFromRoute) {
        setIsLinkingToMessage(!!reportActionIDFromRoute);
        return null;
    }

    return (
        // Wide RHP overlays should be rendered only for the report screen displayed in RHP
        <WideRHPOverlayWrapper shouldWrap={route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT}>
            <ActionListContext.Provider value={actionListValue}>
                <ReactionListWrapper>
                    <ScreenWrapper
                        navigation={navigation}
                        style={screenWrapperStyle}
                        shouldEnableKeyboardAvoidingView={isTopMostReportId || isInNarrowPaneModal}
                        testID={`report-screen-${reportID}`}
                    >
                        <DeleteTransactionNavigateBackHandler />
                        <ReportRouteParamHandler />
                        <ReportFetchHandler />
                        <FullPageNotFoundView
                            shouldShow={shouldShowNotFoundPage}
                            subtitleKey={shouldShowNotFoundLinkedAction ? 'notFound.commentYouLookingForCannotBeFound' : 'notFound.noAccess'}
                            subtitleStyle={[styles.textSupporting]}
                            shouldShowBackButton={shouldUseNarrowLayout}
                            onBackButtonPress={shouldShowNotFoundLinkedAction ? navigateToEndOfReport : Navigation.goBack}
                            shouldShowLink={shouldShowNotFoundLinkedAction}
                            linkTranslationKey="notFound.goToChatInstead"
                            subtitleKeyBelowLink={shouldShowNotFoundLinkedAction ? 'notFound.contactConcierge' : ''}
                            onLinkPress={navigateToEndOfReport}
                            shouldDisplaySearchRouter
                        >
                            <DragAndDropProvider isDisabled={isEditingDisabled}>
                                <ReportLifecycleHandler reportID={reportIDFromRoute} />
                                <OfflineWithFeedback
                                    pendingAction={reportPendingAction ?? report?.pendingFields?.reimbursed}
                                    errors={reportErrors}
                                    shouldShowErrorMessages={false}
                                    needsOffscreenAlphaCompositing
                                >
                                    {headerView}
                                </OfflineWithFeedback>
                                <AccountManagerBanner reportID={reportIDFromRoute} />
                                <View style={[styles.flex1, styles.flexRow]}>
                                    {shouldShowWideRHP && (
                                        <Animated.View style={styles.wideRHPMoneyRequestReceiptViewContainer}>
                                            <ScrollView contentContainerStyle={styles.wideRHPMoneyRequestReceiptViewScrollViewContainer}>
                                                <MoneyRequestReceiptView
                                                    report={transactionThreadReport ?? report}
                                                    fillSpace
                                                    isDisplayedInWideRHP
                                                />
                                            </ScrollView>
                                        </Animated.View>
                                    )}
                                    <AgentZeroStatusProvider
                                        reportID={reportIDFromRoute}
                                        chatType={report?.chatType}
                                    >
                                        <View
                                            style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}
                                            testID="report-actions-view-wrapper"
                                        >
                                            {(!report || shouldWaitForTransactions) && <ReportActionsSkeletonView />}
                                            {!!report && !shouldDisplayMoneyRequestActionsList && !shouldWaitForTransactions ? <ReportActionsView reportID={report.reportID} /> : null}
                                            {!!report && shouldDisplayMoneyRequestActionsList && !shouldWaitForTransactions ? (
                                                <MoneyRequestReportActionsList
                                                    report={report}
                                                    hasPendingDeletionTransaction={hasPendingDeletionTransaction}
                                                    policy={policy}
                                                    reportActions={reportActions}
                                                    transactions={visibleTransactions}
                                                    newTransactions={newTransactions}
                                                    hasOlderActions={hasOlderActions}
                                                    hasNewerActions={hasNewerActions}
                                                    showReportActionsLoadingState={showReportActionsLoadingState}
                                                    reportPendingAction={reportPendingAction}
                                                />
                                            ) : null}
                                            <ReportFooter />
                                        </View>
                                    </AgentZeroStatusProvider>
                                </View>
                                <PortalHost name="suggestions" />
                            </DragAndDropProvider>
                        </FullPageNotFoundView>
                    </ScreenWrapper>
                </ReactionListWrapper>
            </ActionListContext.Provider>
        </WideRHPOverlayWrapper>
    );
}

export default ReportScreen;
