import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LocationPermissionModal from '@components/LocationPermissionModal';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import {usePersonalDetails, usePolicyCategories} from '@components/OnyxListItemProvider';
import PrevNextButtons from '@components/PrevNextButtons';
import ScreenWrapper from '@components/ScreenWrapper';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useFetchRoute from '@hooks/useFetchRoute';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import useParentReportAction from '@hooks/useParentReportAction';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportTransactions from '@hooks/useReportTransactions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {completeTestDriveTask} from '@libs/actions/Task';
import {isMobileSafari} from '@libs/Browser';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import {
    getExistingTransactionID,
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    navigateToStartMoneyRequestStep,
    resolveOptimisticChatReportID,
    shouldShowReceiptEmptyState,
    shouldUseTransactionDraft,
} from '@libs/IOUUtils';
import Log from '@libs/Log';
import dismissModalAndOpenReportInInboxTabHelper from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation from '@libs/Navigation/Navigation';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {
    findSelfDMReportID,
    generateReportID,
    getReportOrDraftReport,
    hasViolations as hasViolationsReportUtils,
    isMoneyRequestReport,
    isProcessingReport,
    isReportOutstanding,
    isSelectedManagerMcTest,
} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import getSubmitExpenseScenario from '@libs/telemetry/getSubmitExpenseScenario';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {
    getDefaultTaxCode,
    getRateID,
    getRequestType,
    getTaxValue,
    getValidWaypoints,
    hasReceipt,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanRequest,
} from '@libs/TransactionUtils';
import type {GpsPoint} from '@userActions/IOU';
import {
    createDistanceRequest as createDistanceRequestIOUActions,
    getIOURequestPolicyID,
    setMoneyRequestBillable,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestReimbursable,
    updateLastLocationPermissionPrompt,
} from '@userActions/IOU';
import {submitPerDiemExpenseForSelfDM, submitPerDiemExpense as submitPerDiemExpenseIOUActions} from '@userActions/IOU/PerDiem';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {getReceiverType, sendInvoice} from '@userActions/IOU/SendInvoice';
import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';
import {splitBill, splitBillAndOpenReport, startSplitBill} from '@userActions/IOU/Split';
import {requestMoney as requestMoneyIOUActions, trackExpense as trackExpenseIOUActions} from '@userActions/IOU/TrackExpense';
import {removeDraftTransaction, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {RecentlyUsedCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import CategoryDefaultsSetter from './confirmation/CategoryDefaultsSetter';
import DraftWorkspaceOpener from './confirmation/DraftWorkspaceOpener';
import ExpenseDefaultsSetter from './confirmation/ExpenseDefaultsSetter';
import MoneyRequestInitializer from './confirmation/MoneyRequestInitializer';
import OdometerReceiptStitcher from './confirmation/OdometerReceiptStitcher';
import ReceiptFileValidator from './confirmation/ReceiptFileValidator';
import TelemetrySpanManager from './confirmation/TelemetrySpanManager';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION>;

// Ends the submit expense span, starts a geolocation child span, then calls getCurrentPosition.
// The expense callback receives GPS coordinates on success or undefined on error.
// Extracted to avoid duplicating this identical telemetry block across trackExpense and requestMoney paths.
function getCurrentPositionWithGeolocationSpan(onPosition: (gpsCoords?: {lat: number; long: number}) => void) {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    markSubmitExpenseEnd();

    startSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT, {
        name: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        op: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        parentSpan,
    });

    getCurrentPosition(
        (successData) => {
            onPosition({lat: successData.coords.latitude, long: successData.coords.longitude});
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
        (errorData) => {
            Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
            onPosition();
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
    );
}

function IOURequestStepConfirmation({
    report: reportReal,
    reportDraft,
    route: {
        params: {iouType, reportID, transactionID: initialTransactionID, action, participantsAutoAssigned: participantsAutoAssignedFromRoute, backToReport, backTo},
    },
    transaction: initialTransaction,
    isLoadingTransaction,
}: IOURequestStepConfirmationProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const allPolicyCategories = usePolicyCategories();

    const [transactions] = useOptimisticDraftTransactions(initialTransaction);
    const hasMultipleTransactions = transactions.length > 1;

    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);
    // We will use setCurrentTransactionID later to switch between transactions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentTransactionID, setCurrentTransactionID] = useState<string>(initialTransactionID);
    const currentTransactionIndex = useMemo(() => transactions.findIndex((transaction) => transaction.transactionID === currentTransactionID), [transactions, currentTransactionID]);
    const [existingTransaction, existingTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const [optimisticTransaction, optimisticTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(currentTransactionID)}`);
    const isLoadingCurrentTransaction = isLoadingOnyxValue(existingTransactionResult, optimisticTransactionResult);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
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
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ReplaceReceipt', 'SmartScan']);

    /*
     * We want to use a report from the transaction if it exists
     * Also if the report was submitted and delayed submission is on, then we should use an initial report
     * Additionally, if neither reportReal nor reportDraft exist, we fallback to the transactionReport
     * to ensure proper navigation after expense creation.
     */
    const transactionReport = getReportOrDraftReport(transaction?.reportID);
    const reportWithDraftFallback = useMemo(() => reportReal ?? reportDraft, [reportDraft, reportReal]);
    const canUseReport = !(isProcessingReport(transactionReport) && !policyReal?.harvesting?.enabled) && isReportOutstanding(transactionReport, policyReal?.id, undefined, false);

    const shouldUseTransactionReport = !!transactionReport && (canUseReport || !reportWithDraftFallback);
    const shouldHideToSection = useMemo(() => isMoneyRequestReport(reportWithDraftFallback), [reportWithDraftFallback]);
    const isTransactionReportDifferentFromRoute = useMemo(
        () => !!transaction?.reportID && !!reportWithDraftFallback?.reportID && transaction.reportID !== reportWithDraftFallback.reportID,
        [reportWithDraftFallback?.reportID, transaction?.reportID],
    );
    const report = useMemo(() => {
        if (isUnreported) {
            return undefined;
        }
        if (shouldUseTransactionReport) {
            return transactionReport;
        }
        if (isTransactionReportDifferentFromRoute) {
            return undefined;
        }
        return reportWithDraftFallback;
    }, [isUnreported, shouldUseTransactionReport, transactionReport, reportWithDraftFallback, isTransactionReportDifferentFromRoute]);

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
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);

    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);

    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    const reportAttributesDerived = useReportAttributes();
    const reportTransactions = useReportTransactions(report?.reportID);
    const [recentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const transactionViolationsRef = useRef(transactionViolations);
    transactionViolationsRef.current = transactionViolations;
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');

    const policyCategories = useMemo(() => {
        if (isDraftPolicy && draftPolicyID) {
            return policyCategoriesDraft;
        }

        if (policyID) {
            return allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
        }

        return undefined;
    }, [isDraftPolicy, draftPolicyID, policyID, policyCategoriesDraft, allPolicyCategories]);

    const receiverParticipant: Participant | InvoiceReceiver | undefined = transaction?.participants?.find((participant) => participant?.accountID) ?? report?.invoiceReceiver;
    const receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : CONST.DEFAULT_NUMBER_ID;
    const receiverType = getReceiverType(receiverParticipant);
    const senderWorkspaceID = transaction?.participants?.find((participant) => participant?.isSender)?.policyID;
    const [senderWorkspacePolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${senderWorkspaceID}`);

    const existingInvoiceReport = useParticipantsInvoiceReport(receiverAccountID, receiverType, senderWorkspaceID);

    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleDigit} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [selectedParticipantList, setSelectedParticipantList] = useState<Participant[]>([]);

    const [receiptFiles, setReceiptFiles] = useState<Record<string, Receipt>>({});
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestTransactionUtils(transaction);
    const transactionDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (transaction?.comment?.customUnit?.quantity ?? undefined) : undefined;
    const isTimeRequest = requestType === CONST.IOU.REQUEST_TYPE.TIME;
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT);
    const {
        taskReport: viewTourTaskReport,
        taskParentReport: viewTourTaskParentReport,
        isOnboardingTaskParentReportArchived: isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);
    const privateIsArchivedMap = usePrivateIsArchivedMap();
    const parentReportAction = useParentReportAction(viewTourTaskReport);

    const receiptFilename = transaction?.receipt?.filename;
    const receiptPath = transaction?.receipt?.source;
    const isEditingReceipt = hasReceipt(transaction);
    const customUnitRateID = getRateID(transaction) ?? '';
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = (transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const transactionTaxValue = transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '';
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const isTestTransaction = transaction?.participants?.some((participant) => isSelectedManagerMcTest(participant.login));

    const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).length && !isTestTransaction && isScanRequest(transaction);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
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
    const participantsPolicyTags = useParticipantsPolicyTags(participants ?? []);
    const isPolicyExpenseChat = useMemo(() => participants?.some((participant) => participant.isPolicyExpenseChat), [participants]);
    const shouldGenerateTransactionThreadReport = !isBetaEnabled(CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS);
    const formHasBeenSubmitted = useRef(false);
    const isFromGlobalCreate = !!(transaction?.isFromGlobalCreate ?? transaction?.isFromFloatingActionButton);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action, iouType) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT);

    const policyExpenseChatPolicyID = participants?.find((participant) => participant.isPolicyExpenseChat)?.policyID;

    const senderPolicyID = participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;

    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;

    // Pre-insert is only useful for flows whose submit ends in handleNavigateAfterExpenseCreate
    // (which navigates to Search). Flows that use dismissModalAndOpenReportInInboxTab (PAY,
    // SPLIT-from-global-create, per-diem self-DM track) navigate to a specific report instead,
    // so pre-inserting Search would leave a stale route in the stack.
    const canPreInsertSearch = iouType !== CONST.IOU.TYPE.PAY && iouType !== CONST.IOU.TYPE.SPLIT && !(isPerDiemRequest && iouType === CONST.IOU.TYPE.TRACK);

    const hasPreInsertFired = useRef(false);
    const isTransactionReady = !!transaction;

    useEffect(() => {
        if (
            hasPreInsertFired.current ||
            !isTransactionReady ||
            !getIsNarrowLayout() ||
            !isFromGlobalCreate ||
            !canPreInsertSearch ||
            isReportTopmostSplitNavigator() ||
            isSearchTopmostFullScreenRoute()
        ) {
            return;
        }

        hasPreInsertFired.current = true;

        const type = iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
        const queryString = buildCannedSearchQuery({type});
        const searchRoute = ROUTES.SEARCH_ROOT.getRoute({query: queryString});

        const timer = setTimeout(() => {
            Navigation.preInsertFullscreenUnderRHP(searchRoute);
        }, CONST.PRE_INSERT_FULLSCREEN_DELAY);

        return () => {
            clearTimeout(timer);

            if (!Navigation.getIsFullscreenPreInsertedUnderRHP() || formHasBeenSubmitted.current) {
                return;
            }

            Navigation.removePreInsertedFullscreenIfNeeded();
        };
        // isFromGlobalCreate, iouType, and canPreInsertSearch are stable for the lifetime of
        // this screen instance. isTransactionReady may flip from false to true once, which
        // re-triggers the effect so the pre-insert fires even when the transaction loads late.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTransactionReady]);

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

    const requestMoney = useCallback(
        (selectedParticipants: Participant[], gpsPoint?: GpsPoint) => {
            if (!transactions.length) {
                return;
            }

            const participant = selectedParticipants.at(0);
            if (!participant) {
                return;
            }

            const optimisticChatReportID = generateReportID();
            const optimisticCreatedReportActionID = rand64();
            const optimisticReportPreviewActionID = rand64();
            let existingIOUReport: Report | undefined;

            for (const [index, item] of transactions.entries()) {
                const receipt = receiptFiles[item.transactionID];
                const isTestReceipt = receipt?.isTestReceipt ?? false;
                const isTestDriveReceipt = receipt?.isTestDriveReceipt ?? false;
                const isLinkedTrackedExpenseReportArchived =
                    !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];

                const itemAmount = isTestReceipt ? CONST.TEST_RECEIPT.AMOUNT : item.amount;
                const itemCurrency = isTestReceipt ? CONST.TEST_RECEIPT.CURRENCY : item.currency;

                if (isTestDriveReceipt) {
                    completeTestDriveTask(
                        viewTourTaskReport,
                        viewTourTaskParentReport,
                        isViewTourTaskParentReportArchived,
                        currentUserPersonalDetails.accountID,
                        hasOutstandingChildTask,
                        parentReportAction,
                        delegateEmail,
                        false,
                    );
                }

                const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
                const existingTransactionDraft = transactions.find((tx) => tx.transactionID === existingTransactionID);
                let merchantToUse = isTestReceipt ? CONST.TEST_RECEIPT.MERCHANT : item.merchant;
                if (!isTestReceipt && isManualDistanceRequestTransactionUtils(item)) {
                    const distance = item.comment?.customUnit?.quantity;
                    const unit = item.comment?.customUnit?.distanceUnit;
                    const rate = item.comment?.customUnit?.defaultP2PRate;
                    if (distance && unit && rate) {
                        // Convert distance to meters
                        const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distance, unit);
                        merchantToUse = DistanceRequestUtils.getDistanceMerchant(
                            true,
                            distanceInMeters,
                            unit,
                            rate,
                            item.currency ?? CONST.CURRENCY.USD,
                            translate,
                            toLocaleDigit,
                            getCurrencySymbol,
                        );
                    }
                }

                const {iouReport} = requestMoneyIOUActions({
                    report,
                    existingIOUReport,
                    optimisticChatReportID,
                    optimisticCreatedReportActionID,
                    optimisticReportPreviewActionID,
                    participantParams: {
                        payeeEmail: currentUserPersonalDetails.login,
                        payeeAccountID: currentUserPersonalDetails.accountID,
                        participant,
                    },
                    policyParams: {
                        policy,
                        policyTagList: policyTags,
                        policyCategories,
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                    },
                    gpsPoint,
                    action,
                    transactionParams: {
                        amount: itemAmount,
                        distance: isManualDistanceRequest && typeof item.comment?.customUnit?.quantity === 'number' ? roundToTwoDecimalPlaces(item.comment.customUnit.quantity) : undefined,
                        attendees: item.comment?.attendees,
                        currency: itemCurrency,
                        created: item.created,
                        merchant: merchantToUse,
                        comment: item?.comment?.comment?.trim() ?? '',
                        receipt,
                        category: item.category,
                        tag: item.tag,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        billable: item.billable,
                        reimbursable: item.reimbursable,
                        actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                        waypoints: Object.keys(item.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true, isGPSDistanceRequest) : undefined,
                        customUnitRateID,
                        isTestDrive: item.receipt?.isTestDriveReceipt,
                        originalTransactionID: item.comment?.originalTransactionID,
                        source: item.comment?.source,
                        isLinkedTrackedExpenseReportArchived,
                        isFromGlobalCreate: item?.isFromFloatingActionButton ?? item?.isFromGlobalCreate,
                        ...(isTimeRequest
                            ? {type: CONST.TRANSACTION.TYPE.TIME, count: item.comment?.units?.count, rate: item.comment?.units?.rate, unit: CONST.TIME_TRACKING.UNIT.HOUR}
                            : {}),
                    },
                    shouldHandleNavigation: index === transactions.length - 1,
                    shouldGenerateTransactionThreadReport,
                    backToReport,
                    isASAPSubmitBetaEnabled,
                    currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                    currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                    transactionViolations: transactionViolationsRef.current,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    quickAction,
                    existingTransactionDraft,
                    draftTransactionIDs,
                    isSelfTourViewed,
                    betas,
                    personalDetails,
                });
                existingIOUReport = iouReport;
            }
        },
        [
            transactions,
            receiptFiles,
            privateIsArchivedMap,
            report,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            currentUserPersonalDetails.email,
            policy,
            policyTags,
            policyCategories,
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            action,
            isManualDistanceRequest,
            transactionTaxCode,
            transactionTaxAmount,
            transactionTaxValue,
            customUnitRateID,
            isTimeRequest,
            shouldGenerateTransactionThreadReport,
            backToReport,
            isASAPSubmitBetaEnabled,
            policyRecentlyUsedCurrencies,
            quickAction,
            isSelfTourViewed,
            viewTourTaskReport,
            viewTourTaskParentReport,
            isViewTourTaskParentReportArchived,
            hasOutstandingChildTask,
            parentReportAction,
            delegateEmail,
            translate,
            toLocaleDigit,
            betas,
            personalDetails,
            isGPSDistanceRequest,
            draftTransactionIDs,
        ],
    );

    const submitPerDiemExpense = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string, policyRecentlyUsedCategoriesParam?: RecentlyUsedCategories) => {
            if (!transaction) {
                return;
            }

            const participant = selectedParticipants.at(0);
            if (!participant || isEmptyObject(transaction.comment) || isEmptyObject(transaction.comment.customUnit)) {
                return;
            }
            if (iouType === CONST.IOU.TYPE.TRACK) {
                submitPerDiemExpenseForSelfDM({
                    selfDMReport,
                    policy,
                    transactionParams: {
                        currency: transaction.currency,
                        created: transaction.created,
                        comment: trimmedComment,
                        category: transaction.category,
                        tag: transaction.tag,
                        customUnit: transaction.comment?.customUnit,
                        billable: transaction.billable,
                        reimbursable: transaction.reimbursable,
                        attendees: transaction.comment?.attendees,
                        isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                    },
                    currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                    currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                    quickAction,
                });
            } else {
                const isExpenseReport = isMoneyRequestReport(report);
                let existingChatReport = report;
                if (isExpenseReport) {
                    existingChatReport = getReportOrDraftReport(report?.chatReportID);
                } else if (!report?.reportID && participant.isPolicyExpenseChat && participant.reportID) {
                    existingChatReport = getReportOrDraftReport(participant.reportID);
                }
                const {optimisticChatReportID, chatReportID} = resolveOptimisticChatReportID(
                    [participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID],
                    existingChatReport,
                );
                const activeReportID = isExpenseReport && Navigation.getTopmostReportId() === report?.reportID ? report?.reportID : chatReportID;

                const result = submitPerDiemExpenseIOUActions({
                    report,
                    participantParams: {
                        payeeEmail: currentUserPersonalDetails.login,
                        payeeAccountID: currentUserPersonalDetails.accountID,
                        participant,
                    },
                    policyParams: {
                        policy,
                        policyTagList: policyTags,
                        policyRecentlyUsedTags,
                        policyCategories,
                        policyRecentlyUsedCategories: policyRecentlyUsedCategoriesParam,
                    },
                    recentlyUsedParams: {
                        destinations: recentlyUsedDestinations,
                    },
                    transactionParams: {
                        currency: transaction.currency,
                        created: transaction.created,
                        comment: trimmedComment,
                        category: transaction.category,
                        tag: transaction.tag,
                        customUnit: transaction.comment?.customUnit,
                        billable: transaction.billable,
                        reimbursable: transaction.reimbursable,
                        attendees: transaction.comment?.attendees,
                        isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                    },
                    isASAPSubmitBetaEnabled,
                    currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                    currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                    hasViolations,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    quickAction,
                    betas,
                    personalDetails,
                    optimisticChatReportID,
                });
                if (result && activeReportID) {
                    navigateAfterExpenseCreate({
                        activeReportID,
                        transactionID: transaction.transactionID,
                        isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                        hasMultipleTransactions: reportTransactions.length > 0,
                    });
                }
            }
        },
        [
            transaction,
            iouType,
            selfDMReport,
            policy,
            currentUserPersonalDetails.accountID,
            currentUserPersonalDetails.login,
            report,
            policyTags,
            policyRecentlyUsedTags,
            policyCategories,
            recentlyUsedDestinations,
            isASAPSubmitBetaEnabled,
            hasViolations,
            policyRecentlyUsedCurrencies,
            quickAction,
            betas,
            personalDetails,
            reportTransactions.length,
        ],
    );

    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);

    const trackExpense = useCallback(
        (selectedParticipants: Participant[], gpsPoint?: GpsPoint) => {
            if (!transactions.length) {
                return;
            }
            const participant = selectedParticipants.at(0);
            if (!participant) {
                return;
            }
            for (const [index, item] of transactions.entries()) {
                const isLinkedTrackedExpenseReportArchived =
                    !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];
                const itemDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (item.comment?.customUnit?.quantity ?? undefined) : undefined;

                trackExpenseIOUActions({
                    report,
                    isDraftPolicy,
                    action,
                    participantParams: {
                        payeeEmail: currentUserPersonalDetails.login,
                        payeeAccountID: currentUserPersonalDetails.accountID,
                        participant,
                    },
                    policyParams: {
                        policy,
                        policyCategories,
                        policyTagList: policyTags,
                    },
                    transactionParams: {
                        amount: item.amount,
                        distance: itemDistance,
                        currency: item.currency,
                        created: item.created,
                        merchant: item.merchant,
                        comment: item?.comment?.comment?.trim() ?? '',
                        receipt: receiptFiles[item.transactionID],
                        category: item.category,
                        tag: item.tag,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        billable: item.billable,
                        reimbursable: item.reimbursable,
                        gpsPoint,
                        validWaypoints: Object.keys(item?.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true, isGPSDistanceRequest) : undefined,
                        actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                        customUnitRateID,
                        attendees: item.comment?.attendees,
                        isLinkedTrackedExpenseReportArchived,
                        odometerStart: isOdometerDistanceRequest ? item.comment?.odometerStart : undefined,
                        odometerEnd: isOdometerDistanceRequest ? item.comment?.odometerEnd : undefined,
                        isFromGlobalCreate: item?.isFromFloatingActionButton ?? item?.isFromGlobalCreate,
                        gpsCoordinates: isGPSDistanceRequest ? getGPSCoordinates(gpsDraftDetails) : undefined,
                    },
                    accountantParams: {
                        accountant: item.accountant,
                    },
                    shouldHandleNavigation: index === transactions.length - 1,
                    isASAPSubmitBetaEnabled,
                    currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                    currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                    introSelected,
                    activePolicyID,
                    quickAction,
                    recentWaypoints,
                    betas,
                    draftTransactionIDs,
                    isSelfTourViewed,
                });
            }
        },
        [
            transactions,
            privateIsArchivedMap,
            isManualDistanceRequest,
            isOdometerDistanceRequest,
            isGPSDistanceRequest,
            report,
            isDraftPolicy,
            action,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            policy,
            policyCategories,
            policyTags,
            receiptFiles,
            transactionTaxCode,
            transactionTaxAmount,
            transactionTaxValue,
            customUnitRateID,
            gpsDraftDetails,
            isASAPSubmitBetaEnabled,
            introSelected,
            activePolicyID,
            quickAction,
            recentWaypoints,
            betas,
            draftTransactionIDs,
            isSelfTourViewed,
        ],
    );

    const createDistanceRequest = useCallback(
        (selectedParticipants: Participant[], trimmedComment: string) => {
            if (!transaction) {
                return;
            }

            createDistanceRequestIOUActions({
                report,
                participants: selectedParticipants,
                currentUserLogin: currentUserPersonalDetails.login,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                iouType,
                existingTransaction: transaction,
                policyParams: {
                    policy,
                    policyCategories,
                    policyTagList: policyTags,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                },
                transactionParams: {
                    amount: transaction.amount,
                    comment: trimmedComment,
                    distance: transactionDistance,
                    created: transaction.created,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    category: transaction.category,
                    tag: transaction.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    customUnitRateID,
                    splitShares: transaction.splitShares,
                    validWaypoints: getValidWaypoints(transaction.comment?.waypoints, true, isGPSDistanceRequest),
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    attendees: transaction.comment?.attendees,
                    receipt: isManualDistanceRequest || isOdometerDistanceRequest ? receiptFiles[transaction.transactionID] : undefined,
                    odometerStart: isOdometerDistanceRequest ? transaction.comment?.odometerStart : undefined,
                    odometerEnd: isOdometerDistanceRequest ? transaction.comment?.odometerEnd : undefined,
                    isFromGlobalCreate: transaction.isFromFloatingActionButton ?? transaction.isFromGlobalCreate,
                    gpsCoordinates: isGPSDistanceRequest ? getGPSCoordinates(gpsDraftDetails) : undefined,
                },
                backToReport,
                isASAPSubmitBetaEnabled,
                transactionViolations: transactionViolationsRef.current,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                personalDetails,
                recentWaypoints,
                betas,
            });
        },
        [
            transaction,
            report,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            iouType,
            policy,
            policyCategories,
            policyTags,
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            transactionDistance,
            transactionTaxCode,
            transactionTaxAmount,
            transactionTaxValue,
            customUnitRateID,
            isManualDistanceRequest,
            isOdometerDistanceRequest,
            receiptFiles,
            isGPSDistanceRequest,
            gpsDraftDetails,
            backToReport,
            isASAPSubmitBetaEnabled,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
            recentWaypoints,
            betas,
        ],
    );

    const createTransaction = useCallback(
        (selectedParticipants: Participant[], locationPermissionGranted = false) => {
            setIsConfirmed(true);
            let splitParticipants = selectedParticipants;

            // Filter out participants with an amount equal to O
            if (iouType === CONST.IOU.TYPE.SPLIT && transaction?.splitShares) {
                const participantsWithAmount = new Set(
                    Object.keys(transaction.splitShares ?? {})
                        .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
                        .map((accountID) => Number(accountID)),
                );
                splitParticipants = selectedParticipants.filter((participant) =>
                    participantsWithAmount.has(
                        participant.isPolicyExpenseChat ? (participant?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) : (participant.accountID ?? CONST.DEFAULT_NUMBER_ID),
                    ),
                );
            }
            const trimmedComment = transaction?.comment?.comment?.trim() ?? '';

            // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
            if (formHasBeenSubmitted.current) {
                return;
            }

            formHasBeenSubmitted.current = true;

            if (iouType !== CONST.IOU.TYPE.TRACK && isDistanceRequest && !isMovingTransactionFromTrackExpense && !isUnreported) {
                createDistanceRequest(iouType === CONST.IOU.TYPE.SPLIT ? splitParticipants : selectedParticipants, trimmedComment);
                markSubmitExpenseEnd();
                return;
            }

            const currentTransactionReceiptFile = transaction?.transactionID ? receiptFiles[transaction.transactionID] : undefined;

            if (iouType === CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).filter((receipt) => !!receipt).length) {
                const currentUserLogin = currentUserPersonalDetails.login;
                if (currentUserLogin) {
                    for (const [index, item] of transactions.entries()) {
                        const transactionReceiptFile = receiptFiles[item.transactionID];
                        if (!transactionReceiptFile) {
                            continue;
                        }
                        const itemTrimmedComment = item?.comment?.comment?.trim() ?? '';

                        // If we have a receipt let's start the split expense by creating only the action, the transaction, and the group DM if needed
                        startSplitBill({
                            participants: selectedParticipants,
                            currentUserLogin,
                            currentUserAccountID: currentUserPersonalDetails.accountID,
                            comment: itemTrimmedComment,
                            receipt: transactionReceiptFile,
                            existingSplitChatReportID: report?.reportID,
                            billable: item.billable,
                            reimbursable: item.reimbursable,
                            category: item.category,
                            tag: item.tag,
                            currency: item.currency,
                            taxCode: transactionTaxCode,
                            taxAmount: transactionTaxAmount,
                            taxValue: transactionTaxValue,
                            shouldPlaySound: index === transactions.length - 1,
                            policyRecentlyUsedCategories,
                            policyRecentlyUsedTags,
                            quickAction,
                            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                            participantsPolicyTags,
                        });
                    }
                }
                markSubmitExpenseEnd();
                return;
            }

            // IOUs created from a group report will have a reportID param in the route.
            // Since the user is already viewing the report, we don't need to navigate them to the report
            if (iouType === CONST.IOU.TYPE.SPLIT && !transaction?.isFromGlobalCreate) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    splitBill({
                        participants: splitParticipants,
                        currentUserLogin: currentUserPersonalDetails.login,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        amount: transaction.amount,
                        comment: trimmedComment,
                        currency: transaction.currency,
                        merchant: transaction.merchant,
                        created: transaction.created,
                        category: transaction.category,
                        tag: transaction.tag,
                        existingSplitChatReportID: report?.reportID,
                        billable: transaction.billable,
                        reimbursable: transaction.reimbursable,
                        iouRequestType: transaction.iouRequestType,
                        splitShares: transaction.splitShares,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                        isASAPSubmitBetaEnabled,
                        transactionViolations: transactionViolationsRef.current,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        betas,
                        personalDetails,
                    });
                }
                markSubmitExpenseEnd();
                return;
            }

            // If the split expense is created from the global create menu, we also navigate the user to the group report
            if (iouType === CONST.IOU.TYPE.SPLIT) {
                if (currentUserPersonalDetails.login && !!transaction) {
                    splitBillAndOpenReport({
                        participants: splitParticipants,
                        currentUserLogin: currentUserPersonalDetails.login,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        amount: transaction.amount,
                        comment: trimmedComment,
                        currency: transaction.currency,
                        merchant: transaction.merchant,
                        created: transaction.created,
                        category: transaction.category,
                        tag: transaction.tag,
                        billable: !!transaction.billable,
                        reimbursable: !!transaction.reimbursable,
                        iouRequestType: transaction.iouRequestType,
                        splitShares: transaction.splitShares,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                        isASAPSubmitBetaEnabled,
                        transactionViolations: transactionViolationsRef.current,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        betas,
                        personalDetails,
                    });
                }
                markSubmitExpenseEnd();
                return;
            }

            if (iouType === CONST.IOU.TYPE.INVOICE) {
                const invoiceChatReport = !isEmptyObject(report) && report?.reportID ? report : existingInvoiceReport;
                const invoiceChatReportID = invoiceChatReport ? undefined : reportID;

                sendInvoice({
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    transaction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    invoiceChatReport,
                    invoiceChatReportID,
                    receiptFile: currentTransactionReceiptFile,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    policyRecentlyUsedCategories,
                    isFromGlobalCreate: transaction?.isFromFloatingActionButton ?? transaction?.isFromGlobalCreate,
                    policyRecentlyUsedTags,
                    senderPolicyTags: senderWorkspacePolicyTags ?? {},
                });
                markSubmitExpenseEnd();
                return;
            }

            if (!isPerDiemRequest && (iouType === CONST.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense)) {
                if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && transaction) {
                    // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                    if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                        if (userLocation) {
                            trackExpense(selectedParticipants, {
                                lat: userLocation.latitude,
                                long: userLocation.longitude,
                            });
                            markSubmitExpenseEnd();
                            return;
                        }

                        getCurrentPositionWithGeolocationSpan((gpsCoords) => trackExpense(selectedParticipants, gpsCoords));
                        return;
                    }

                    // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                    trackExpense(selectedParticipants);
                    markSubmitExpenseEnd();
                    return;
                }
                trackExpense(selectedParticipants);
                markSubmitExpenseEnd();
                return;
            }

            if (isPerDiemRequest) {
                submitPerDiemExpense(selectedParticipants, trimmedComment, policyRecentlyUsedCategories);
                markSubmitExpenseEnd();
                return;
            }

            if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && !!transaction) {
                // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                if (
                    transaction.amount === 0 &&
                    !isSharingTrackExpense &&
                    !isCategorizingTrackExpense &&
                    locationPermissionGranted &&
                    !selectedParticipants.some((participant) => isSelectedManagerMcTest(participant.login))
                ) {
                    if (userLocation) {
                        requestMoney(selectedParticipants, {
                            lat: userLocation.latitude,
                            long: userLocation.longitude,
                        });
                        markSubmitExpenseEnd();
                        return;
                    }

                    getCurrentPositionWithGeolocationSpan((gpsCoords) => requestMoney(selectedParticipants, gpsCoords));
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                requestMoney(selectedParticipants);
                markSubmitExpenseEnd();
                return;
            }

            requestMoney(selectedParticipants);
            markSubmitExpenseEnd();
        },
        [
            iouType,
            transaction,
            isDistanceRequest,
            isMovingTransactionFromTrackExpense,
            isUnreported,
            receiptFiles,
            isCategorizingTrackExpense,
            isSharingTrackExpense,
            isPerDiemRequest,
            requestMoney,
            createDistanceRequest,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            transactions,
            report,
            transactionTaxCode,
            transactionTaxAmount,
            transactionTaxValue,
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            quickAction,
            isASAPSubmitBetaEnabled,
            existingInvoiceReport,
            policy,
            policyTags,
            senderWorkspacePolicyTags,
            policyCategories,
            trackExpense,
            userLocation,
            submitPerDiemExpense,
            policyRecentlyUsedCurrencies,
            reportID,
            betas,
            participantsPolicyTags,
            personalDetails,
        ],
    );

    /**
     * Checks if user has a GOLD wallet then creates a paid IOU report on the fly
     */
    const sendMoney = useCallback(
        (paymentMethod: PaymentMethodType | undefined) => {
            const currency = transaction?.currency;
            const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
            const participant = participants?.at(0);

            if (!participant || !transaction?.amount || !currency) {
                return;
            }

            const {optimisticChatReportID, chatReportID} = resolveOptimisticChatReportID([participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID], report);
            const sendMoneyParams = {
                report,
                quickAction,
                amount: transaction.amount,
                currency,
                comment: trimmedComment,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                recipient: participant,
                created: transaction.created,
                merchant: transaction.merchant,
                receipt: receiptFiles[transaction.transactionID],
                optimisticChatReportID,
            };

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                setIsConfirmed(true);
                sendMoneyElsewhere(sendMoneyParams);
            } else if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                setIsConfirmed(true);
                sendMoneyWithWallet(sendMoneyParams);
            } else {
                return;
            }
            dismissModalAndOpenReportInInboxTabHelper(chatReportID, undefined, reportTransactions.length > 0);
        },
        [
            transaction?.currency,
            transaction?.comment?.comment,
            transaction?.amount,
            transaction?.created,
            transaction?.merchant,
            transaction?.transactionID,
            participants,
            report,
            currentUserPersonalDetails.accountID,
            receiptFiles,
            quickAction,
            reportTransactions.length,
        ],
    );

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

    const startSubmitSpans = () => {
        const hasReceiptFiles = Object.values(receiptFiles).some((receipt) => !!receipt);
        // Re-derive from transaction inside the callback so telemetry captures the value
        // at submission time, not at render time (transaction is mutable Onyx state).
        const isFromGlobalCreateForTelemetry = !!(transaction?.isFromGlobalCreate ?? transaction?.isFromFloatingActionButton);
        const scenario = getSubmitExpenseScenario({
            iouType,
            isDistanceRequest,
            isMovingTransactionFromTrackExpense,
            isUnreported,
            isCategorizingTrackExpense,
            isSharingTrackExpense,
            isPerDiemRequest,
            isFromGlobalCreate: isFromGlobalCreateForTelemetry,
            hasReceiptFiles,
        });
        const submitSpanAttributes = {
            [CONST.TELEMETRY.ATTRIBUTE_SCENARIO]: scenario,
            [CONST.TELEMETRY.ATTRIBUTE_HAS_RECEIPT]: hasReceiptFiles,
            [CONST.TELEMETRY.ATTRIBUTE_IS_FROM_GLOBAL_CREATE]: isFromGlobalCreateForTelemetry,
            [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType,
            [CONST.TELEMETRY.ATTRIBUTE_IOU_REQUEST_TYPE]: requestType ?? 'unknown',
        };

        startSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE, {
            name: 'submit-expense',
            op: CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE,
        })?.setAttributes(submitSpanAttributes);
        startSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE, {
            name: 'submit-to-destination-visible',
            op: CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE,
        })?.setAttributes(submitSpanAttributes);
    };

    const onConfirm = (listOfParticipants: Participant[]) => {
        setIsConfirming(true);
        setSelectedParticipantList(listOfParticipants);

        if (gpsRequired) {
            const shouldStartLocationPermissionFlow =
                !lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt ?? '') &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt ?? '')) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);

            if (shouldStartLocationPermissionFlow) {
                setStartLocationPermissionFlow(true);
                return;
            }
        }

        startSubmitSpans();

        // Fast path: the Search page was pre-inserted under the RHP (see useEffect above).
        // Dismiss the RHP immediately so the user sees the Search page, then run the
        // heavy createTransaction work in the next frame - "dismiss first, compute later".
        // Reserve the deferred write channel synchronously so that the Search component
        // always sees hasDeferredWrite=true on mount (on iOS, rAF fires after
        // startTransition resolves, so without the reservation Search would mount first).
        if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
            Navigation.clearFullscreenPreInsertedFlag();
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
            Navigation.dismissModal();
            requestAnimationFrame(() => {
                createTransaction(listOfParticipants);
                setIsConfirming(false);
            });
        } else {
            requestAnimationFrame(() => {
                createTransaction(listOfParticipants);
                requestAnimationFrame(() => {
                    setIsConfirming(false);
                });
            });
        }
    };

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
            <MoneyRequestInitializer
                isLoadingTransaction={!!isLoadingTransaction}
                transaction={transaction}
                iouType={iouType}
                reportID={reportID}
                draftTransactionIDs={draftTransactionIDs}
            />
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
                currentTransactionID={currentTransactionID}
                odometerStartImage={odometerStartImage}
                odometerEndImage={odometerEndImage}
                action={action}
                iouType={iouType}
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
                report={report}
                participants={participants}
                draftTransactionIDs={draftTransactionIDs}
                onReceiptFilesChange={setReceiptFiles}
            />
            <DragAndDropProvider isDisabled={!showReceiptEmptyState || isOdometerDistanceRequest}>
                <View style={styles.flex1}>
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
                    {!!gpsRequired && (
                        <LocationPermissionModal
                            startPermissionFlow={startLocationPermissionFlow}
                            resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
                            onGrant={() => {
                                startSubmitSpans();
                                navigateAfterInteraction(() => {
                                    createTransaction(selectedParticipantList, true);
                                });
                            }}
                            onDeny={() => {
                                startSubmitSpans();
                                updateLastLocationPermissionPrompt();
                                navigateAfterInteraction(() => {
                                    createTransaction(selectedParticipantList, false);
                                });
                            }}
                            onInitialGetLocationCompleted={() => {
                                setIsConfirming(false);
                            }}
                        />
                    )}
                    {!!stitchError && <FormHelpMessage message={stitchError} />}
                    <MoneyRequestConfirmationList
                        transaction={transaction}
                        selectedParticipants={participants}
                        onToggleBillable={setBillable}
                        onConfirm={onConfirm}
                        onSendMoney={sendMoney}
                        showRemoveExpenseConfirmModal={() => {
                            confirmRemoveCurrentTransaction();
                        }}
                        receiptPath={receiptPath}
                        receiptFilename={receiptFilename}
                        iouType={iouType}
                        reportID={reportID}
                        shouldDisplayReceipt={!isMovingTransactionFromTrackExpense && (!isDistanceRequest || isManualDistanceRequest || isOdometerDistanceRequest) && !isPerDiemRequest}
                        isPolicyExpenseChat={isPolicyExpenseChat}
                        policyID={policyID}
                        isOdometerDistanceRequest={isOdometerDistanceRequest}
                        isLoadingReceipt={isStitchingReceipt}
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
                </View>
            </DragAndDropProvider>
        </ScreenWrapper>
    );
}

/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepConfirmation);
/* eslint-disable rulesdir/no-negated-variables */
const IOURequestStepConfirmationWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepConfirmationWithFullTransactionOrNotFound);
export default IOURequestStepConfirmationWithWritableReportOrNotFound;
