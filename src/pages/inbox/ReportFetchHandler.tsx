import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import {InteractionManager} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsOwnWorkspaceChatRef from '@hooks/useIsOwnWorkspaceChatRef';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePrevious from '@hooks/usePrevious';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFilteredReportActionsForReportView, getIOUActionForReportID, getOneTransactionThreadReportID, isCreatedAction} from '@libs/ReportActionsUtils';
import {isChatThread, isHiddenForCurrentUser, isOneTransactionThread, isPolicyExpenseChat, isReportTransactionThread, isTaskReport, isValidReportIDFromPath} from '@libs/ReportUtils';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {createTransactionThreadReport, openReport, readNewestAction, subscribeToReportLeavingEvents, unsubscribeFromLeavingRoomReportChannel, updateLastVisitTime} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    isOptimisticReport: false,
};

/**
 * Component that does not render anything. Owns all fetch/open-report logic, transaction thread creation,
 * leaving events subscriptions, and related effects that were previously in ReportScreen.
 *
 * Self-subscribes to route params via useRoute().
 */
function ReportFetchHandler() {
    const route = useRoute<ReportScreenRoute>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const reportActionIDFromRoute = route?.params?.reportActionID;

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isInSidePanel = useIsInSidePanel();
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const prevIsAnonymousUser = useRef(false);
    const hasCreatedLegacyThreadRef = useRef(false);
    const didSubscribeToReportLeavingEvents = useRef(false);

    const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportOnyx?.chatReportID}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const prevIsLoadingReportData = usePrevious(isLoadingReportData);

    const reportID = reportOnyx?.reportID;
    const report = reportOnyx;

    const {reportActions: unfilteredReportActions, linkedAction} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const prevReportActions = usePrevious(reportActions);

    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${linkedAction?.childReportID}`);

    const reportTransactionsCollection = useReportTransactionsCollection(reportID);
    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((transaction) => transaction.transactionID);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const prevTransactionThreadReportID = usePrevious(transactionThreadReportID);

    const isTransactionThreadView = isReportTransactionThread(report);

    // Track whether the current route is an own workspace chat. See issue #84248.
    const isCurrentRouteOwnWorkspaceChatRef = useIsOwnWorkspaceChatRef(report, reportIDFromRoute);

    const indexOfLinkedMessage = reportActionIDFromRoute ? reportActions.findIndex((obj) => String(obj.reportActionID) === String(reportActionIDFromRoute)) : -1;
    const doesCreatedActionExists = !!reportActions?.findLast((action) => isCreatedAction(action));
    const isLinkedMessageAvailable = indexOfLinkedMessage > -1;
    const isLinkedMessagePageReady = isLinkedMessageAvailable && (reportActions.length - indexOfLinkedMessage >= CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT || doesCreatedActionExists);

    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;
    const isOnboardingCompleted = onboarding?.hasCompletedGuidedSetupFlow ?? false;

    const fetchReport = useEffectEvent(() => {
        if (reportMetadata.isOptimisticReport && report?.type === CONST.REPORT.TYPE.CHAT && !isPolicyExpenseChat(report)) {
            return;
        }

        if (report?.errorFields?.notFound && isOffline) {
            return;
        }

        // When a user goes through onboarding for the first time, various tasks are created for chatting with Concierge.
        // If this function is called too early (while the application is still loading), we will not have information about policies,
        // which means we will not be able to obtain the correct link for one of the tasks.
        // More information here: https://github.com/Expensify/App/issues/71742
        if (isLoadingApp && introSelected && !isOnboardingCompleted && !isInviteOnboardingComplete) {
            const {choice, inviteType} = introSelected;
            const isInviteIOUorInvoice = inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU || inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE;
            const isInviteChoiceCorrect = choice === CONST.ONBOARDING_CHOICES.ADMIN || choice === CONST.ONBOARDING_CHOICES.SUBMIT || choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT;

            if (isInviteChoiceCorrect && !isInviteIOUorInvoice) {
                return;
            }
        }

        openReport({reportID: reportIDFromRoute, introSelected, reportActionID: reportActionIDFromRoute, betas});
    });

    const createOneTransactionThread = useEffectEvent(() => {
        const currentReportTransactions = Object.values(reportTransactionsCollection ?? {}).filter(
            (transaction): transaction is Transaction => !!transaction && transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        const oneTransactionID = currentReportTransactions.at(0)?.transactionID;
        const iouAction = getIOUActionForReportID(reportID, oneTransactionID);
        createTransactionThreadReport(introSelected, currentUserEmail ?? '', currentUserAccountID, betas, report, iouAction, currentReportTransactions.at(0));
    });

    const onUnmount = useEffectEvent(() => {
        if (!didSubscribeToReportLeavingEvents.current) {
            return;
        }
        unsubscribeFromLeavingRoomReportChannel(reportID);
    });

    // If a user has chosen to leave a thread, and then returns to it (e.g. with the back button), we need to call `openReport` again in order to allow the user to rejoin and to receive real-time updates
    const rejoinThread = useEffectEvent(() => {
        if (!shouldUseNarrowLayout || !isChatThread(report) || !isHiddenForCurrentUser(report) || isTransactionThreadView) {
            return;
        }
        openReport({reportID, introSelected, betas});
    });

    // Effect order below matches the original declaration order in ReportScreen.tsx.

    // When a delegate splits an expense the server sends a temporary Onyx SET that wipes the
    // workspace chat. The navigation guards in ReportScreen block any redirect, but the report
    // stays blank until something re-fetches it. This effect detects the wipe and re-fetches.
    // See issue #84248.
    const prevReportID = usePrevious(report?.reportID);
    useEffect(() => {
        const wasJustWiped = !!prevReportID && prevReportID === reportIDFromRoute && !report?.reportID;
        if (!wasJustWiped || !isCurrentRouteOwnWorkspaceChatRef.current) {
            return;
        }
        fetchReport();
        // fetchReport is a stable useEffectEvent callback and does not need to be listed as a dependency.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [report?.reportID, prevReportID, reportIDFromRoute]);

    useEffect(() => {
        if (!transactionThreadReportID || !route?.params?.reportActionID || !isOneTransactionThread(childReport, report, linkedAction)) {
            return;
        }
        navigation.setParams({reportActionID: ''});
    }, [transactionThreadReportID, route?.params?.reportActionID, linkedAction, reportID, navigation, report, childReport]);

    useEffect(() => {
        if (!isAnonymousUser) {
            return;
        }
        prevIsAnonymousUser.current = true;
    }, [isAnonymousUser]);

    useEffect(() => {
        if (transactionThreadReportID !== CONST.FAKE_REPORT_ID || transactionThreadReport?.reportID || (!reportMetadata.hasOnceLoadedReportActions && !reportMetadata?.isOptimisticReport)) {
            return;
        }

        createOneTransactionThread();
    }, [reportMetadata.hasOnceLoadedReportActions, reportMetadata?.isOptimisticReport, transactionThreadReport?.reportID, transactionThreadReportID]);

    useEffect(() => {
        if (isLoadingReportData || !prevIsLoadingReportData || !prevIsAnonymousUser.current || isAnonymousUser) {
            return;
        }
        // Re-fetch public report data after user signs in and OpenApp API is called to
        // avoid reportActions data being empty for public rooms.
        fetchReport();
    }, [isLoadingReportData, prevIsLoadingReportData, prevIsAnonymousUser, isAnonymousUser]);

    useEffect(() => {
        // If transactionThreadReportID is undefined or CONST.FAKE_REPORT_ID, we do not call fetchReport.
        // Only when transactionThreadReportID changes to a valid value, the fetchReport will be called to fetch the data again for the current report.
        // Since fetchReport is always called once when opening a report,
        // if that initial call is used to create a transactionThreadReport,
        // then fetchReport needs to be called again after the transactionThreadReport has been fully created.
        const prevTransactionThreadReportIDWasValid = !!prevTransactionThreadReportID && prevTransactionThreadReportID !== CONST.FAKE_REPORT_ID;
        const transactionThreadReportIDUpdatedFromValidToFake = transactionThreadReportID === CONST.FAKE_REPORT_ID && !!prevTransactionThreadReportID;

        if (prevTransactionThreadReportIDWasValid || !transactionThreadReportID || transactionThreadReportIDUpdatedFromValidToFake) {
            return;
        }

        fetchReport();
    }, [prevTransactionThreadReportID, transactionThreadReportID]);

    useEffect(() => {
        if (!reportID || !isFocused || isInSidePanel) {
            return;
        }
        updateLastVisitTime(reportID);
    }, [reportID, isFocused, isInSidePanel]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setShouldShowComposeInput(true);
        });
        return () => {
            interactionTask.cancel();
            onUnmount();
        };
    }, []);

    useEffect(() => {
        // This function is triggered when a user clicks on a link to navigate to a report.
        // For each link click, we retrieve the report data again, even though it may already be cached.
        // There should be only one openReport execution per page start or navigating
        fetchReport();
    }, [route, isLinkedMessagePageReady, reportActionIDFromRoute]);

    useEffect(() => {
        // This function is only triggered when a user is invited to a room after opening the link.
        // When a user opens a room they are not a member of, and the admin then invites them, only the INVITE_TO_ROOM action is available, so the background will be empty and room description is not available.
        // See https://github.com/Expensify/App/issues/57769 for more details
        if (prevReportActions.length !== 0 || reportActions.length !== 1 || reportActions.at(0)?.actionName !== CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) {
            return;
        }
        fetchReport();
    }, [prevReportActions.length, reportActions]);

    useEffect(() => {
        if (!isFocused || prevIsFocused) {
            return;
        }
        rejoinThread();
    }, [isFocused, prevIsFocused]);

    useEffect(() => {
        if (!isValidReportIDFromPath(reportIDFromRoute)) {
            return;
        }
        // Ensures the optimistic report is created successfully
        if (reportIDFromRoute !== report?.reportID || report?.pendingFields?.createChat) {
            return;
        }
        // Ensures subscription event succeeds when the report/workspace room is created optimistically.
        // Check if the optimistic `OpenReport` or `AddWorkspaceRoom` has succeeded by confirming
        // any `pendingFields.createChat` or `pendingFields.addWorkspaceRoom` fields are set to null.
        // Existing reports created will have empty fields for `pendingFields`.
        const didCreateReportSuccessfully = !report?.pendingFields || (!report?.pendingFields.addWorkspaceRoom && !report?.pendingFields.createChat);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        let interactionTask: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;
        if (!didSubscribeToReportLeavingEvents.current && didCreateReportSuccessfully) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            interactionTask = InteractionManager.runAfterInteractions(() => {
                subscribeToReportLeavingEvents(reportIDFromRoute, currentUserAccountID);
                didSubscribeToReportLeavingEvents.current = true;
            });
        }
        return () => {
            if (!interactionTask) {
                return;
            }
            interactionTask.cancel();
        };
    }, [report?.reportID, didSubscribeToReportLeavingEvents, reportIDFromRoute, report?.pendingFields, currentUserAccountID]);

    useEffect(() => {
        if (!!report?.lastReadTime || !isTaskReport(report)) {
            return;
        }
        // After creating the task report then navigating to task detail we don't have any report actions and the last read time is empty so We need to update the initial last read time when opening the task report detail.
        readNewestAction(report?.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
    }, [report, reportMetadata?.hasOnceLoadedReportActions]);

    useEffect(() => {
        hasCreatedLegacyThreadRef.current = false;
    }, [reportID]);

    // When opening IOU report for single transaction, we will create IOU action and transaction thread
    // for legacy transaction that doesn't have IOU action
    useEffect(() => {
        // Skip if already created, coming from Search page, or thread already exists
        if (
            hasCreatedLegacyThreadRef.current ||
            route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT ||
            transactionThreadReport ||
            (transactionThreadReportID && transactionThreadReportID !== '0') ||
            !reportMetadata?.hasOnceLoadedReportActions ||
            reportActions.length === 0
        ) {
            return;
        }

        // Only handle single transaction expense reports that are fully loaded
        const transaction = visibleTransactions?.at(0);
        if (!reportID || visibleTransactions?.length !== 1 || report?.type !== CONST.REPORT.TYPE.EXPENSE || !transaction?.transactionID) {
            return;
        }

        // Skip legacy transaction handling if:
        // - IOU action already exists (not a legacy transaction)
        // - Transaction is pending addition (new transaction, not legacy)
        const iouAction = getIOUActionForReportID(reportID, transaction.transactionID);
        if (iouAction || transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || !!transaction.linkedTrackedExpenseReportAction?.childReportID) {
            return;
        }

        // Mark as created BEFORE calling to prevent race conditions
        hasCreatedLegacyThreadRef.current = true;

        // For legacy transactions, pass undefined as IOU action and the transaction object
        // It will be created optimistically and in the backend when call openReport
        createTransactionThreadReport(introSelected, currentUserEmail ?? '', currentUserAccountID, betas, report, undefined, transaction);
    }, [
        introSelected,
        currentUserEmail,
        currentUserAccountID,
        betas,
        report,
        visibleTransactions,
        transactionThreadReport,
        transactionThreadReportID,
        reportID,
        route.name,
        reportMetadata?.hasOnceLoadedReportActions,
        reportActions.length,
    ]);

    return null;
}

ReportFetchHandler.displayName = 'ReportFetchHandler';

export default ReportFetchHandler;
