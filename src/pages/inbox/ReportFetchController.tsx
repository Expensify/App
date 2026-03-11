import {useIsFocused, useRoute} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsAnonymousUser from '@hooks/useIsAnonymousUser';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePrevious from '@hooks/usePrevious';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getIOUActionForReportID, getOneTransactionThreadReportID, isCreatedAction} from '@libs/ReportActionsUtils';
import {getReportTransactions, isChatThread, isHiddenForCurrentUser, isPolicyExpenseChat, isReportTransactionThread, isTaskReport, isValidReportIDFromPath} from '@libs/ReportUtils';
import {setShouldShowComposeInput} from '@userActions/Composer';
import {createTransactionThreadReport, openReport, readNewestAction, subscribeToReportLeavingEvents, unsubscribeFromLeavingRoomReportChannel, updateLastVisitTime} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const defaultReportMetadata = {
    hasOnceLoadedReportActions: false,
    isLoadingInitialReportActions: true,
    isOptimisticReport: false,
};

/**
 * Renderless component owning all report fetching/opening logic:
 * - fetchReport / openReport calls
 * - introSelected, onboarding subscriptions
 * - Anonymous-to-signed-in re-fetch
 * - Transaction thread creation and re-fetch
 * - Leaving events subscription
 * - updateLastVisitTime
 * - Compose input init
 * - Thread rejoin on re-focus
 */
function ReportFetchController() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const reportActionIDFromRoute = routeParams?.reportActionID;

    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    const isInSidePanel = useIsInSidePanel();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();
    const isAnonymousUser = useIsAnonymousUser();
    const prevIsAnonymousUser = useRef(false);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [reportMetadata = defaultReportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportIDFromRoute}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = true] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const prevIsLoadingReportData = usePrevious(isLoadingReportData);

    const reportID = report?.reportID;

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((transaction) => transaction.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const isTransactionThreadView = isReportTransactionThread(report);
    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;
    const isOnboardingCompleted = onboarding?.hasCompletedGuidedSetupFlow ?? false;

    const doesCreatedActionExists = !!reportActions?.findLast((action) => isCreatedAction(action));
    const indexOfLinkedMessage = reportActions.findIndex((obj) => reportActionIDFromRoute && String(obj.reportActionID) === String(reportActionIDFromRoute));
    const isLinkedMessageAvailable = indexOfLinkedMessage > -1;
    const isLinkedMessagePageReady = isLinkedMessageAvailable && (reportActions.length - indexOfLinkedMessage >= CONST.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT || doesCreatedActionExists);

    const didSubscribeToReportLeavingEvents = useRef(false);
    const hasCreatedLegacyThreadRef = useRef(false);

    // --- fetchReport ---
    const fetchReport = useCallback(() => {
        if (reportMetadata.isOptimisticReport && report?.type === CONST.REPORT.TYPE.CHAT && !isPolicyExpenseChat(report)) {
            return;
        }
        if (report?.errorFields?.notFound && isOffline) {
            return;
        }
        if (isLoadingApp && introSelected && !isOnboardingCompleted && !isInviteOnboardingComplete) {
            const {choice, inviteType} = introSelected;
            const isInviteIOUorInvoice = inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU || inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE;
            const isInviteChoiceCorrect = choice === CONST.ONBOARDING_CHOICES.ADMIN || choice === CONST.ONBOARDING_CHOICES.SUBMIT || choice === CONST.ONBOARDING_CHOICES.CHAT_SPLIT;
            if (isInviteChoiceCorrect && !isInviteIOUorInvoice) {
                return;
            }
        }
        openReport({reportID: reportIDFromRoute, introSelected, reportActionID: reportActionIDFromRoute});
    }, [reportMetadata.isOptimisticReport, report, isOffline, isLoadingApp, introSelected, isOnboardingCompleted, isInviteOnboardingComplete, reportIDFromRoute, reportActionIDFromRoute]);

    // --- Track anonymous user ---
    useEffect(() => {
        if (!isAnonymousUser) {
            return;
        }
        prevIsAnonymousUser.current = true;
    }, [isAnonymousUser]);

    // --- Create one-transaction thread ---
    useEffect(() => {
        if (transactionThreadReportID !== CONST.FAKE_REPORT_ID || transactionThreadReport?.reportID || (!reportMetadata.hasOnceLoadedReportActions && !reportMetadata?.isOptimisticReport)) {
            return;
        }
        const currentReportTransaction = getReportTransactions(reportID).filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const oneTransactionID = currentReportTransaction.at(0)?.transactionID;
        const iouAction = getIOUActionForReportID(reportID, oneTransactionID);
        createTransactionThreadReport(introSelected, currentUserEmail ?? '', currentUserAccountID, report, iouAction, currentReportTransaction.at(0));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to run this useEffect when the callback deps change
    }, [reportMetadata.hasOnceLoadedReportActions, reportMetadata?.isOptimisticReport, transactionThreadReport?.reportID, transactionThreadReportID]);

    // --- Re-fetch after anonymous-to-signed-in ---
    useEffect(() => {
        if (isLoadingReportData || !prevIsLoadingReportData || !prevIsAnonymousUser.current || isAnonymousUser) {
            return;
        }
        fetchReport();
    }, [isLoadingReportData, prevIsLoadingReportData, isAnonymousUser, fetchReport]);

    // --- Re-fetch after transaction thread created ---
    const prevTransactionThreadReportID = usePrevious(transactionThreadReportID);
    useEffect(() => {
        const prevTransactionThreadReportIDWasValid = !!prevTransactionThreadReportID && prevTransactionThreadReportID !== CONST.FAKE_REPORT_ID;
        const transactionThreadReportIDUpdatedFromValidToFake = transactionThreadReportID === CONST.FAKE_REPORT_ID && !!prevTransactionThreadReportID;
        if (prevTransactionThreadReportIDWasValid || !transactionThreadReportID || transactionThreadReportIDUpdatedFromValidToFake) {
            return;
        }
        fetchReport();
    }, [fetchReport, prevTransactionThreadReportID, transactionThreadReportID]);

    // --- updateLastVisitTime ---
    useEffect(() => {
        if (!reportID || !isFocused || isInSidePanel) {
            return;
        }
        updateLastVisitTime(reportID);
    }, [reportID, isFocused, isInSidePanel]);

    // --- Compose input init + leaving events cleanup ---
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setShouldShowComposeInput(true);
        });
        return () => {
            interactionTask.cancel();
            if (!didSubscribeToReportLeavingEvents.current) {
                return;
            }
            unsubscribeFromLeavingRoomReportChannel(reportID);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- fetchReport on navigation/linking ---
    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, isLinkedMessagePageReady, reportActionIDFromRoute]);

    // --- Re-fetch when invited to room ---
    const prevReportActions = usePrevious(reportActions);
    useEffect(() => {
        if (prevReportActions.length !== 0 || reportActions.length !== 1 || reportActions.at(0)?.actionName !== CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) {
            return;
        }
        fetchReport();
    }, [prevReportActions.length, reportActions, fetchReport]);

    // --- Thread rejoin on re-focus ---
    useEffect(() => {
        if (!shouldUseNarrowLayout || !isFocused || prevIsFocused || !isChatThread(report) || !isHiddenForCurrentUser(report) || isTransactionThreadView) {
            return;
        }
        openReport({reportID, introSelected});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prevIsFocused, report?.participants, isFocused, isTransactionThreadView, reportID]);

    // --- Subscribe to leaving events ---
    useEffect(() => {
        if (!isValidReportIDFromPath(reportIDFromRoute)) {
            return;
        }
        if (reportIDFromRoute !== report?.reportID || report?.pendingFields?.createChat) {
            return;
        }
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
    }, [report?.reportID, reportIDFromRoute, report?.pendingFields, currentUserAccountID]);

    // --- Reset legacy thread ref on report change ---
    useEffect(() => {
        hasCreatedLegacyThreadRef.current = false;
    }, [reportID]);

    // --- Create legacy transaction thread ---
    useEffect(() => {
        if (
            hasCreatedLegacyThreadRef.current ||
            route.name === 'RightModal_SearchReport' ||
            transactionThreadReport ||
            (transactionThreadReportID && transactionThreadReportID !== '0') ||
            !reportMetadata?.hasOnceLoadedReportActions ||
            reportActions.length === 0
        ) {
            return;
        }
        const transaction = visibleTransactions?.at(0);
        if (!reportID || visibleTransactions?.length !== 1 || report?.type !== CONST.REPORT.TYPE.EXPENSE || !transaction?.transactionID) {
            return;
        }
        const iouAction = getIOUActionForReportID(reportID, transaction.transactionID);
        if (iouAction || transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || !!transaction.linkedTrackedExpenseReportAction?.childReportID) {
            return;
        }
        hasCreatedLegacyThreadRef.current = true;
        createTransactionThreadReport(introSelected, currentUserEmail ?? '', currentUserAccountID, report, undefined, transaction);
    }, [
        introSelected,
        currentUserEmail,
        currentUserAccountID,
        report,
        visibleTransactions,
        transactionThreadReport,
        transactionThreadReportID,
        reportID,
        route.name,
        reportMetadata?.hasOnceLoadedReportActions,
        reportActions.length,
    ]);

    // --- Task report init ---
    useEffect(() => {
        if (!!report?.lastReadTime || !isTaskReport(report)) {
            return;
        }
        readNewestAction(report?.reportID, !!reportMetadata?.hasOnceLoadedReportActions);
    }, [report, reportMetadata?.hasOnceLoadedReportActions]);

    return null;
}

export default ReportFetchController;
