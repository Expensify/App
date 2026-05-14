import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import type {ComponentProps} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import {usePersonalDetails, usePolicyCategories} from '@components/OnyxListItemProvider';
import ParticipantPicker from '@components/ParticipantPicker';
import PrevNextButtons from '@components/PrevNextButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useFetchRoute from '@hooks/useFetchRoute';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useRestartOnOdometerImagesFailure from '@hooks/useRestartOnOdometerImagesFailure';
import useSelfDMReport from '@hooks/useSelfDMReport';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    navigateToStartMoneyRequestStep,
    resolveReportForMoneyRequest,
    shouldShowReceiptEmptyState,
    shouldUseTransactionDraft,
} from '@libs/IOUUtils';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {getPolicyExpenseChat, getReportOrDraftReport, isMoneyRequestReport, isPolicyExpenseChat as isPolicyExpenseChatUtils, isSelectedManagerMcTest} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {
    getRequestType,
    hasReceipt,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanRequest,
} from '@libs/TransactionUtils';
import {
    getIOURequestPolicyID,
    getMoneyRequestParticipantsFromReport,
    setMoneyRequestBillable,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestReimbursable,
} from '@userActions/IOU';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {removeDraftTransaction, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import CategoryDefaultsSetter from './confirmation/CategoryDefaultsSetter';
import DraftWorkspaceOpener from './confirmation/DraftWorkspaceOpener';
import ExpenseDefaultsSetter from './confirmation/ExpenseDefaultsSetter';
import MoneyRequestInitializer from './confirmation/MoneyRequestInitializer';
import OdometerReceiptStitcher from './confirmation/OdometerReceiptStitcher';
import ReceiptFileValidator from './confirmation/ReceiptFileValidator';
import SubmitExpenseOrchestrator from './confirmation/SubmitExpenseOrchestrator';
import TelemetrySpanManager from './confirmation/TelemetrySpanManager';
import useExpenseSubmission from './confirmation/useExpenseSubmission';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepConfirmationIncomingRouteName = typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION | typeof SCREENS.MONEY_REQUEST.CREATE;

type StepConfirmationParams = MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION];

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> &
    WithFullTransactionOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> & {
        shouldHideHeader?: boolean;
    };

function IOURequestStepConfirmation({
    report: reportReal,
    reportDraft,
    route,
    transaction: initialTransaction,
    isLoadingTransaction,
    shouldHideHeader = false,
}: IOURequestStepConfirmationProps) {
    const params = route.params;
    const {iouType, reportID, transactionID: initialTransactionID, action, backToReport, backTo} = params;
    const participantsAutoAssignedFromRoute = route.name === SCREENS.MONEY_REQUEST.STEP_CONFIRMATION ? (params as StepConfirmationParams).participantsAutoAssigned : undefined;

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const personalDetails = usePersonalDetails();
    const allPolicyCategories = usePolicyCategories();

    const [transactions] = useOptimisticDraftTransactions(initialTransaction);
    const hasMultipleTransactions = transactions.length > 1;

    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);
    // We will use setCurrentTransactionID later to switch between transactions

    const [currentTransactionID, setCurrentTransactionID] = useState<string>(initialTransactionID);
    const currentTransactionIndex = useMemo(() => transactions.findIndex((transaction) => transaction.transactionID === currentTransactionID), [transactions, currentTransactionID]);
    const [existingTransaction, existingTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const [optimisticTransaction, optimisticTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const isLoadingCurrentTransaction = isLoadingOnyxValue(existingTransactionResult, optimisticTransactionResult);
    const transaction = useMemo(
        () => (!isLoadingCurrentTransaction ? (optimisticTransaction ?? existingTransaction) : undefined),
        [existingTransaction, optimisticTransaction, isLoadingCurrentTransaction],
    );
    const requestType = getRequestType(transaction);
    const isPerDiemRequest = requestType === CONST.IOU.REQUEST_TYPE.PER_DIEM;
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;

    const realPolicyID = getIOURequestPolicyID(initialTransaction, reportReal);
    const draftPolicyID = getIOURequestPolicyID(initialTransaction, reportDraft);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${draftPolicyID}`);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${realPolicyID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ReplaceReceipt', 'SmartScan']);

    /*
     * We want to use a report from the transaction if it exists
     * Also if the report was submitted and delayed submission is on, then we should use an initial report
     * Additionally, if neither reportReal nor reportDraft exist, we fallback to the transactionReport
     * to ensure proper navigation after expense creation.
     */
    const transactionReport = useReportOrReportDraft(transaction?.reportID);
    const reportWithDraftFallback = useMemo(() => reportReal ?? reportDraft, [reportDraft, reportReal]);
    const shouldHideToSection = useMemo(() => isMoneyRequestReport(reportWithDraftFallback), [reportWithDraftFallback]);
    const report = useMemo(
        () => resolveReportForMoneyRequest({transaction, transactionReport, routeReport: reportWithDraftFallback, policy: policyReal}),
        [transaction, transactionReport, reportWithDraftFallback, policyReal],
    );

    const {policy} = usePolicyForTransaction({
        transaction: initialTransaction,
        reportPolicyID: realPolicyID ?? draftPolicyID,
        action,
        iouType,
        isPerDiemRequest,
    });
    const policyID = policy?.id;
    const isDraftPolicy = policy === policyDraft;

    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${draftPolicyID}`);

    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const reportAttributesDerived = useReportAttributes();

    const policyCategories = useMemo(() => {
        if (isDraftPolicy && draftPolicyID) {
            return policyCategoriesDraft;
        }

        if (policyID) {
            return allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
        }

        return undefined;
    }, [isDraftPolicy, draftPolicyID, policyID, policyCategoriesDraft, allPolicyCategories]);

    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const isNewManualExpenseFlowEnabled = isBetaEnabled(CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW);
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    // isConfirming, selectedParticipantList, and startLocationPermissionFlow state
    // moved to SubmitExpenseOrchestrator.

    const [receiptFiles, setReceiptFiles] = useState<Record<string, Receipt>>({});
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isManualRequest = transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const isTimeRequest = requestType === CONST.IOU.REQUEST_TYPE.TIME;
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const receiptFilename = transaction?.receipt?.filename;
    const receiptPath = transaction?.receipt?.source;
    const isEditingReceipt = hasReceipt(transaction);
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const isTestTransaction = transaction?.participants?.some((participant) => isSelectedManagerMcTest(participant.login));

    const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).length && !isTestTransaction && isScanRequest(transaction);
    const [isStitchingReceipt, setIsStitchingReceipt] = useState(false);
    const [stitchError, setStitchError] = useState('');
    const headerTitle = useMemo(() => {
        if (isCategorizingTrackExpense) {
            return translate('iou.categorize');
        }
        if (isSharingTrackExpense) {
            return translate('iou.share');
        }
        if (iouType === CONST.IOU.TYPE.INVOICE) {
            return translate('workspace.invoices.sendInvoice');
        }
        return translate('iou.confirmDetails');
    }, [iouType, translate, isSharingTrackExpense, isCategorizingTrackExpense]);

    useEffect(() => {
        if (!transaction?.transactionID || !transactionReport || iouType !== CONST.IOU.TYPE.PAY) {
            return;
        }
        setMoneyRequestParticipantsFromReport(transaction.transactionID, transactionReport, currentUserPersonalDetails.accountID);
    }, [transactionReport, currentUserPersonalDetails.accountID, transaction?.transactionID, iouType]);

    const participants = useMemo(
        () =>
            transaction?.participants?.map((participant) => {
                if (participant.isSender && iouType === CONST.IOU.TYPE.INVOICE) {
                    return participant;
                }
                const privateIsArchived = privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`];
                return participant.accountID
                    ? getParticipantsOption(participant, personalDetails)
                    : getReportOption(participant, privateIsArchived, policy, personalDetails, conciergeReportID, reportAttributesDerived);
            }) ?? [],
        // getReportOrDraftReport (called inside getReportOption) falls back to its module-level allReportsDraft
        // connection, so we don't need to subscribe to COLLECTION.REPORT_DRAFT here.
        [transaction?.participants, iouType, personalDetails, reportAttributesDerived, privateIsArchivedMap, policy, conciergeReportID],
    );

    const defaultParticipants = useMemo(() => {
        const hasSelectedParticipants = (transaction?.participants ?? []).some((participant) => participant?.selected);
        if (hasSelectedParticipants) {
            return [];
        }

        const sourceReportID = transaction?.reportID ?? reportID;
        if (!sourceReportID) {
            return [];
        }

        const sourceReport = getReportOrDraftReport(sourceReportID);
        let defaultParticipantsOptions = getMoneyRequestParticipantsFromReport(sourceReport, currentUserPersonalDetails.accountID).filter((participant) => participant.selected);

        const isGlobalCreateFlow = transaction?.isFromGlobalCreate ?? transaction?.isFromFloatingActionButton ?? iouType === CONST.IOU.TYPE.CREATE;
        if (!defaultParticipantsOptions.length && isGlobalCreateFlow) {
            const canUseDefaultPolicy = shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd);

            if (canUseDefaultPolicy) {
                const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
                const defaultTargetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id) : selfDMReport;
                defaultParticipantsOptions = getMoneyRequestParticipantsFromReport(defaultTargetReport, currentUserPersonalDetails.accountID).filter((participant) => participant.selected);
            }
        }

        return defaultParticipantsOptions;
    }, [
        transaction?.participants,
        transaction?.reportID,
        transaction?.isFromGlobalCreate,
        transaction?.isFromFloatingActionButton,
        reportID,
        currentUserPersonalDetails.accountID,
        iouType,
        defaultExpensePolicy,
        personalPolicy?.autoReporting,
        selfDMReport,
        amountOwed,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
    ]);

    const shouldAutoOpenParticipantPicker = useMemo(() => {
        if (!transaction?.transactionID) {
            return false;
        }
        const transactionParticipants = transaction?.participants ?? [];
        const hasTransactionParticipants = transactionParticipants.length > 0;
        const hasDefaultParticipants = defaultParticipants.length > 0;
        return !hasTransactionParticipants && !hasDefaultParticipants && isNewManualExpenseFlowEnabled && isManualRequest;
    }, [transaction?.transactionID, transaction?.participants, defaultParticipants.length, isNewManualExpenseFlowEnabled, isManualRequest]);
    const activeTransactionID = transaction?.transactionID;
    const [manuallyOpenedParticipantPickerForTransactionID, setManuallyOpenedParticipantPickerForTransactionID] = useState<string | undefined>();
    const [dismissedAutoOpenParticipantPickerForTransactionID, setDismissedAutoOpenParticipantPickerForTransactionID] = useState<string | undefined>();
    const participantPickerIOUType = iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.CREATE : iouType;
    const isParticipantPickerVisible =
        !!activeTransactionID &&
        (manuallyOpenedParticipantPickerForTransactionID === activeTransactionID ||
            (shouldAutoOpenParticipantPicker && dismissedAutoOpenParticipantPickerForTransactionID !== activeTransactionID));

    const closeParticipantPicker = useCallback(() => {
        setManuallyOpenedParticipantPickerForTransactionID(undefined);
        if (!activeTransactionID) {
            return;
        }
        setDismissedAutoOpenParticipantPickerForTransactionID(activeTransactionID);
    }, [activeTransactionID]);

    const handleParticipantsAdded = useCallback(
        (participantsList: Participant[]) => {
            if (!activeTransactionID) {
                return;
            }
            setMoneyRequestParticipants(activeTransactionID, participantsList);
            if (participantsList.length > 0) {
                closeParticipantPicker();
            }
        },
        [activeTransactionID, closeParticipantPicker],
    );

    useEffect(() => {
        if (!transaction?.transactionID) {
            return;
        }

        const transactionParticipants = transaction?.participants ?? [];
        const hasTransactionParticipants = transactionParticipants.length > 0;
        const hasDefaultParticipants = defaultParticipants.length > 0;

        if (hasTransactionParticipants || !hasDefaultParticipants) {
            return;
        }

        setMoneyRequestParticipants(transaction.transactionID, defaultParticipants);
    }, [transaction?.transactionID, transaction?.participants, defaultParticipants, isNewManualExpenseFlowEnabled, isManualRequest]);

    const isPolicyExpenseChat = useMemo(() => {
        const hasPolicyExpenseChat = (participantList: typeof defaultParticipants) =>
            participantList.some((participant) => {
                if (isPolicyExpenseChatUtils(participant)) {
                    return true;
                }

                return !!participant?.reportID && isPolicyExpenseChatUtils(getReportOrDraftReport(participant.reportID));
            });

        if (isPolicyExpenseChatUtils(report)) {
            return true;
        }

        const transactionParticipants = transaction?.participants ?? [];
        if (hasPolicyExpenseChat(transactionParticipants)) {
            return true;
        }

        return hasPolicyExpenseChat(defaultParticipants);
    }, [report, transaction?.participants, defaultParticipants]);

    const isFromGlobalCreate = transaction?.isFromGlobalCreate === true || transaction?.isFromFloatingActionButton === true;

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action, iouType) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT);

    const policyExpenseChatPolicyID =
        transaction?.participants?.find((participant) => participant?.isPolicyExpenseChat)?.policyID ??
        defaultParticipants.find((participant) => participant?.isPolicyExpenseChat)?.policyID ??
        (isPolicyExpenseChatUtils(report) ? report?.policyID : undefined);

    const senderPolicyID = transaction?.participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;

    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;
    const {hasVerifiedBlobs} = useRestartOnOdometerImagesFailure(isOdometerDistanceRequest ? transaction : undefined, reportID, iouType, backToReport);

    // Pre-insert Search is only useful for flows whose submit ends in handleNavigateAfterExpenseCreate
    // (which navigates to Search). Flows that use dismissModalAndOpenReportInInboxTab (PAY,
    // SPLIT-from-global-create, per-diem self-DM track) navigate to a specific report instead,
    // so pre-inserting Search would leave a stale route in the stack.
    const canPreInsertSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT && !(isPerDiemRequest && iouType === CONST.IOU.TYPE.TRACK);

    const {createTransaction, sendMoney, isConfirmed, formHasBeenSubmitted} = useExpenseSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        reportID,
        policy,
        policyCategories,
        isDraftPolicy,
        currentUserPersonalDetails,
        personalDetails,
        participants,
        iouType,
        action,
        requestType,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isMovingTransactionFromTrackExpense,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isUnreported,
        isPolicyExpenseChat,
        draftTransactionIDs,
        privateIsArchivedMap,
        backToReport,
    });

    // handleSearchDismiss doesn't pre-insert - it just dismisses the modal when search is
    // already on top. This is safe for per-diem TRACK (which navigates to self-DM, but when
    // search is on top dismissModalAndOpenReportInInboxTab only dismisses). SPLIT/PAY still
    // can't use it because their navigation is coupled to the action function.
    const canDismissFromSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT;

    const hasPreInsertFired = useRef(false);
    const isTransactionReady = !!transaction;
    const destinationReportID = backToReport ?? report?.reportID;

    useEffect(() => {
        if (hasPreInsertFired.current || !isTransactionReady || !getIsNarrowLayout()) {
            return;
        }

        // Search pre-insert: global create flows that navigate to Search after submit.
        // Also pre-insert when Search is already on top but showing a different type
        // (e.g. Invoice tab when submitting an Expense) so the correct tab is revealed on dismiss.
        const searchType = iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isSearchOnTopWithDifferentType = isSearchTopmostFullScreenRoute() && getCurrentSearchQueryJSON()?.type !== searchType;
        const shouldPreInsertSearch = isFromGlobalCreate && canPreInsertSearch && !isReportTopmostSplitNavigator() && (!isSearchTopmostFullScreenRoute() || isSearchOnTopWithDifferentType);

        // Report pre-insert: dismiss modal flows that open an existing report after submit.
        // Skip when the destination is already the topmost fullscreen report to avoid
        // pushing a duplicate route (which would require an extra back press).

        // Only eligible when search pre-insert didn't win, and the flow ends at a report (not Search).
        // Split flows handle their own dismiss/navigation, so pre-inserting would cause double navigation.
        // When Search is the topmost fullscreen and there's no report context (e.g. QAB from Spend tab),
        // pre-inserting a report is wrong - the user should stay on Search after submission.
        const isSplitRequest = iouType === CONST.IOU.TYPE.SPLIT;
        const canUseReportPreInsert = !isSplitRequest && !shouldPreInsertSearch && (isReportTopmostSplitNavigator() || (!isFromGlobalCreate && !isSearchTopmostFullScreenRoute()));

        // RHP has its own dismiss handler; pre-inserting under it would break the stack.
        const isOutsideRHP = !isReportOpenInRHP(navigationRef.getRootState());

        // Don't pre-insert if the report is already showing - it would push a duplicate route.
        const hasValidDestination = !!destinationReportID && Navigation.getTopmostReportId() !== destinationReportID;

        // The report must be in Onyx so the pre-inserted screen can render immediately.
        const isDestinationReportLoaded = !!destinationReportID && !!getReportOrDraftReport(destinationReportID)?.reportID;

        const shouldPreInsertReport = canUseReportPreInsert && isOutsideRHP && hasValidDestination && isDestinationReportLoaded;

        if (!shouldPreInsertSearch && !shouldPreInsertReport) {
            return;
        }

        hasPreInsertFired.current = true;

        const preInsertFullscreenRoute: Route = shouldPreInsertSearch
            ? ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: searchType})})
            : ROUTES.REPORT_WITH_ID.getRoute(destinationReportID);

        const timer = setTimeout(() => {
            Navigation.preInsertFullscreenUnderRHP(preInsertFullscreenRoute);
        }, CONST.PRE_INSERT_FULLSCREEN_DELAY);

        return () => {
            clearTimeout(timer);

            // eslint-disable-next-line react-hooks/exhaustive-deps -- formHasBeenSubmitted is a stable ref from useExpenseSubmission; reading .current in cleanup is intentional
            if (!Navigation.getIsFullscreenPreInsertedUnderRHP() || formHasBeenSubmitted.current) {
                return;
            }

            Navigation.removePreInsertedFullscreenIfNeeded();
        };
        // isFromGlobalCreate, iouType, and canPreInsertSearch are stable for the lifetime of
        // this screen instance. isTransactionReady and destinationReportID may each flip once
        // (false -> true / undefined -> ID) as data loads asynchronously, re-triggering the effect.
        // hasPreInsertFired prevents double-firing. Note: if destinationReportID were to change
        // from one valid ID to another (extremely unlikely with Onyx), the pre-insert would not
        // re-fire. This is acceptable because the pre-inserted route is already correct for
        // the original destination, and the submit handler will navigate correctly regardless.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTransactionReady, destinationReportID]);

    const navigateBack = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }
        // If the action is categorize and there's no policies other than personal one, we simply call goBack(), i.e: dismiss the whole flow together
        // We don't need to subscribe to policy_ collection as we only need to check on the latest collection value
        if (action === CONST.IOU.ACTION.CATEGORIZE) {
            Navigation.goBack();
            return;
        }
        if (isPerDiemRequest) {
            if (isMovingTransactionFromTrackExpense || isCreatingTrackExpense) {
                Navigation.goBack();
                return;
            }
            Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_SUBRATE.getRoute(action, iouType, initialTransactionID, reportID));
            return;
        }

        if (transaction?.isFromGlobalCreate && !transaction.receipt?.isTestReceipt) {
            // If the participants weren't automatically added to the transaction, then we should go back to the IOURequestStepParticipants.
            if (!transaction?.participantsAutoAssigned && participantsAutoAssignedFromRoute !== 'true') {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, initialTransactionID, transaction?.reportID || reportID, undefined, action), {
                    compareParams: false,
                });
                return;
            }

            // If the participant was auto-assigned, we need to keep the reportID that is already on the stack.
            // This will allow the user to edit the participant field after going back and forward.
            Navigation.goBack();
            return;
        }

        // If the user came from Test Drive modal, we need to take him back there
        if (transaction?.receipt?.isTestDriveReceipt && (transaction.participants?.length ?? 0) > 0) {
            Navigation.goBack(ROUTES.TEST_DRIVE_MODAL_ROOT.getRoute(transaction.participants?.at(0)?.login));
            return;
        }

        // This has selected the participants from the beginning and the participant field shouldn't be editable.
        navigateToStartMoneyRequestStep(requestType, iouType, initialTransactionID, reportID, action, backToReport);
    }, [
        action,
        isPerDiemRequest,
        isCreatingTrackExpense,
        transaction?.isFromGlobalCreate,
        transaction?.receipt?.isTestReceipt,
        transaction?.receipt?.isTestDriveReceipt,
        transaction?.participants,
        transaction?.participantsAutoAssigned,
        transaction?.reportID,
        requestType,
        iouType,
        initialTransactionID,
        reportID,
        isMovingTransactionFromTrackExpense,
        participantsAutoAssignedFromRoute,
        backTo,
        backToReport,
    ]);

    const setBillable = useCallback(
        (billable: boolean) => {
            setMoneyRequestBillable(currentTransactionID, billable);
        },
        [currentTransactionID],
    );

    const setReimbursable = useCallback(
        (reimbursable: boolean) => {
            setMoneyRequestReimbursable(currentTransactionID, reimbursable);
        },
        [currentTransactionID],
    );

    // This loading indicator is shown because the transaction originalCurrency is being updated later than the component mounts.
    // To prevent the component from rendering with the wrong currency, we show a loading indicator until the correct currency is set.
    const isLoading = !!transaction?.originalCurrency;

    // Submit orchestration (fast-path selection, telemetry, navigation) is handled
    // by SubmitExpenseOrchestrator which wraps MoneyRequestConfirmationList below.

    /**
     * Sets the Receipt object when dragging and dropping a file
     */
    const setReceiptOnDrop = (files: FileObject[]) => {
        const file = files.at(0);
        if (!file) {
            return;
        }
        const source = URL.createObjectURL(file as Blob);
        setMoneyRequestReceipt(currentTransactionID, source, file.name ?? '', true, file.type);
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(setReceiptOnDrop);

    const handleDroppingReceipt = (e: DragEvent) => {
        const file = e?.dataTransfer?.files[0];
        if (file) {
            file.uri = URL.createObjectURL(file);
            validateFiles([file], Array.from(e.dataTransfer?.items));
        }
    };

    if (isLoadingTransaction) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'IOURequestStepConfirmation',
            isLoadingTransaction,
        };
        return <FullScreenLoadingIndicator reasonAttributes={reasonAttributes} />;
    }

    const showNextTransaction = () => {
        const nextTransaction = transactions.at(currentTransactionIndex + 1);
        if (nextTransaction) {
            setCurrentTransactionID(nextTransaction.transactionID);
        }
    };

    const showPreviousTransaction = () => {
        const previousTransaction = transactions.at(currentTransactionIndex - 1);
        if (previousTransaction) {
            setCurrentTransactionID(previousTransaction.transactionID);
        }
    };

    const removeCurrentTransaction = () => {
        if (currentTransactionID === CONST.IOU.OPTIMISTIC_TRANSACTION_ID) {
            const nextTransaction = transactions.at(currentTransactionIndex + 1);
            replaceDefaultDraftTransaction(nextTransaction);
            return;
        }

        removeDraftTransaction(currentTransactionID);
        showPreviousTransaction();
    };

    const confirmRemoveCurrentTransaction = async () => {
        const result = await showConfirmModal({
            title: translate('iou.removeExpense'),
            prompt: translate('iou.removeExpenseConfirmation'),
            confirmText: translate('common.remove'),
            cancelText: translate('common.cancel'),
            danger: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        removeCurrentTransaction();
    };

    const showReceiptEmptyState = shouldShowReceiptEmptyState(iouType, action, policy, isPerDiemRequest);

    const shouldShowSmartScanFields = !!transaction?.receipt?.isTestDriveReceipt || isMovingTransactionFromTrackExpense || requestType !== CONST.IOU.REQUEST_TYPE.SCAN;
    return (
        <ScreenWrapper
            shouldEnableMaxHeight={canUseTouchScreen() && !isMobileSafari()}
            shouldAvoidScrollOnVirtualViewport={!isMobileSafari()}
            testID="IOURequestStepConfirmation"
        >
            <TelemetrySpanManager iouType={iouType} />
            <DraftWorkspaceOpener
                isCreatingTrackExpense={isCreatingTrackExpense}
                policyID={policyID}
                policyPendingAction={policy?.pendingAction}
                policyExpenseChatPolicyID={policyExpenseChatPolicyID}
                senderPolicyID={senderPolicyID}
                isOffline={isOffline}
            />
            <ExpenseDefaultsSetter
                transactionIDs={transactionIDs}
                policy={policy}
                isPolicyExpenseChat={isPolicyExpenseChat}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                isCreatingTrackExpense={isCreatingTrackExpense}
            />
            {/*
             * In this rollout, NEW_MANUAL_EXPENSE_FLOW means this screen is embedded on IOURequestStartPage.
             * Skip MoneyRequestInitializer here to avoid duplicate initialization and navigation side effects.
             */}
            {!isNewManualExpenseFlowEnabled && (
                <MoneyRequestInitializer
                    isLoadingTransaction={!!isLoadingTransaction}
                    transaction={transaction}
                    iouType={iouType}
                    reportID={reportID}
                    draftTransactionIDs={draftTransactionIDs}
                />
            )}
            <CategoryDefaultsSetter
                transactions={transactions}
                transactionIDs={transactionIDs}
                existingTransaction={existingTransaction}
                policyCategories={policyCategories}
                policy={policy}
                isDistanceRequest={isDistanceRequest}
                requestType={requestType}
                isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
            />
            <OdometerReceiptStitcher
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                odometerStartImage={odometerStartImage}
                odometerEndImage={odometerEndImage}
                transaction={transaction}
                hasVerifiedBlobs={hasVerifiedBlobs}
                onStitchingChange={setIsStitchingReceipt}
                onStitchError={setStitchError}
            />
            <ReceiptFileValidator
                transactions={transactions}
                requestType={requestType}
                iouType={iouType}
                initialTransactionID={initialTransactionID}
                reportID={reportID}
                action={action}
                backToReport={backToReport}
                report={report}
                participants={participants}
                draftTransactionIDs={draftTransactionIDs}
                onReceiptFilesChange={setReceiptFiles}
            />
            <DragAndDropProvider isDisabled={!showReceiptEmptyState || isOdometerDistanceRequest}>
                <View style={styles.flex1}>
                    {/*
                     * Keep a single header in embedded mode: IOURequestStartPage renders the parent header,
                     * so this inner header must be hidden to prevent duplicate back buttons and title layout issues.
                     */}
                    {!shouldHideHeader && (
                        <HeaderWithBackButton
                            title={headerTitle}
                            subtitle={hasMultipleTransactions ? `${currentTransactionIndex + 1} ${translate('common.of')} ${transactions.length}` : undefined}
                            onBackButtonPress={navigateBack}
                        >
                            {hasMultipleTransactions ? (
                                <PrevNextButtons
                                    isPrevButtonDisabled={currentTransactionIndex === 0}
                                    isNextButtonDisabled={currentTransactionIndex === transactions.length - 1}
                                    onNext={showNextTransaction}
                                    onPrevious={showPreviousTransaction}
                                />
                            ) : null}
                        </HeaderWithBackButton>
                    )}
                    {(isLoading || (isScanRequest(transaction) && !Object.values(receiptFiles).length)) && (
                        <FullScreenLoadingIndicator
                            reasonAttributes={{
                                context: 'IOURequestStepConfirmation',
                                isLoading,
                                isScanRequestWithNoReceipts: isScanRequest(transaction) && !Object.values(receiptFiles).length,
                            }}
                        />
                    )}
                    {PDFValidationComponent}
                    <DragAndDropConsumer onDrop={handleDroppingReceipt}>
                        <DropZoneUI
                            icon={isEditingReceipt ? expensifyIcons.ReplaceReceipt : expensifyIcons.SmartScan}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTitle={translate(isEditingReceipt ? 'dropzone.replaceReceipt' : 'quickAction.scanReceipt')}
                            dropTextStyles={styles.receiptDropText}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                    {!!stitchError && <FormHelpMessage message={stitchError} />}
                    <SubmitExpenseOrchestrator
                        createTransaction={createTransaction}
                        destinationReportID={destinationReportID}
                        isFromGlobalCreate={isFromGlobalCreate}
                        iouType={iouType}
                        requestType={requestType}
                        canDismissFromSearch={canDismissFromSearch}
                        gpsRequired={!!gpsRequired}
                        lastLocationPermissionPrompt={lastLocationPermissionPrompt}
                        isDistanceRequest={isDistanceRequest}
                        isMovingTransactionFromTrackExpense={isMovingTransactionFromTrackExpense}
                        isUnreported={isUnreported}
                        isCategorizingTrackExpense={isCategorizingTrackExpense}
                        isSharingTrackExpense={isSharingTrackExpense}
                        isPerDiemRequest={isPerDiemRequest}
                        receiptFiles={receiptFiles}
                        isFromGlobalCreateOnTransaction={!!transaction?.isFromGlobalCreate}
                        isFromFloatingActionButtonOnTransaction={!!transaction?.isFromFloatingActionButton}
                    >
                        {({onConfirm, isConfirming}) => (
                            <MoneyRequestConfirmationList
                                transaction={transaction}
                                selectedParticipants={participants}
                                onOpenParticipantPicker={() => {
                                    if (!activeTransactionID) {
                                        return;
                                    }
                                    setManuallyOpenedParticipantPickerForTransactionID(activeTransactionID);
                                }}
                                onToggleBillable={setBillable}
                                onConfirm={onConfirm}
                                onSendMoney={sendMoney}
                                showRemoveExpenseConfirmModal={() => {
                                    confirmRemoveCurrentTransaction();
                                }}
                                receiptPath={receiptPath}
                                receiptFilename={receiptFilename}
                                iouType={iouType as Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>}
                                reportID={reportID}
                                shouldDisplayReceipt={
                                    !isMovingTransactionFromTrackExpense && (!isDistanceRequest || isManualDistanceRequest || isOdometerDistanceRequest) && !isPerDiemRequest
                                }
                                isPolicyExpenseChat={isPolicyExpenseChat}
                                policyID={policyID}
                                isOdometerDistanceRequest={isOdometerDistanceRequest}
                                isLoadingReceipt={isStitchingReceipt || (isOdometerDistanceRequest && !hasVerifiedBlobs)}
                                isPerDiemRequest={isPerDiemRequest}
                                shouldShowSmartScanFields={shouldShowSmartScanFields}
                                action={action}
                                isConfirmed={isConfirmed}
                                isConfirming={isConfirming}
                                onToggleReimbursable={setReimbursable}
                                expensesNumber={transactions.length}
                                isReceiptEditable
                                isTimeRequest={isTimeRequest}
                                shouldHideToSection={shouldHideToSection}
                            />
                        )}
                    </SubmitExpenseOrchestrator>
                    {isNewManualExpenseFlowEnabled && (
                        <ParticipantPicker
                            participants={participants}
                            iouType={participantPickerIOUType}
                            action={action}
                            isPerDiemRequest={isPerDiemRequest}
                            isTimeRequest={isTimeRequest}
                            onParticipantsAdded={handleParticipantsAdded}
                            onFinish={closeParticipantPicker}
                            isVisible={isParticipantPickerVisible}
                            onClose={closeParticipantPicker}
                        />
                    )}
                </View>
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmation);

const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);

type IOURequestStepConfirmationPublicProps = ComponentProps<typeof IOURequestStepConfirmationWithWritableReportOrNotFound>;

export default IOURequestStepConfirmationWithWritableReportOrNotFound;
export type {IOURequestStepConfirmationPublicProps};
