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
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    navigateToStartMoneyRequestStep,
    shouldShowReceiptEmptyState,
    shouldUseTransactionDraft,
} from '@libs/IOUUtils';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import {
    findSelfDMReportID,
    getReportOrDraftReport,
    hasViolations as hasViolationsReportUtils,
    isMoneyRequestReport,
    isProcessingReport,
    isReportOutstanding,
    isSelectedManagerMcTest,
} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {
    getDefaultTaxCode,
    getRateID,
    getRequestType,
    getTaxValue,
    hasReceipt,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanRequest,
} from '@libs/TransactionUtils';
import {getIOURequestPolicyID, setMoneyRequestBillable, setMoneyRequestParticipantsFromReport, setMoneyRequestReimbursable, updateLastLocationPermissionPrompt} from '@userActions/IOU';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {getReceiverType} from '@userActions/IOU/SendInvoice';
import {removeDraftTransaction, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import CategoryDefaultsSetter from './confirmation/CategoryDefaultsSetter';
import DraftWorkspaceOpener from './confirmation/DraftWorkspaceOpener';
import ExpenseDefaultsSetter from './confirmation/ExpenseDefaultsSetter';
import MoneyRequestInitializer from './confirmation/MoneyRequestInitializer';
import OdometerReceiptStitcher from './confirmation/OdometerReceiptStitcher';
import ReceiptFileValidator from './confirmation/ReceiptFileValidator';
import TelemetrySpanManager from './confirmation/TelemetrySpanManager';
import useExpenseSubmission from './confirmation/useExpenseSubmission';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION>;

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
    const [recentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`);
    const [transactionViolationsEntry] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${currentTransactionID}`);
    // Wrap in a single-entry collection for action functions that expect OnyxCollection<TransactionViolation[]>
    const transactionViolations =
        currentTransactionID && transactionViolationsEntry ? {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${currentTransactionID}`]: transactionViolationsEntry} : {};
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

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action, iouType) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT);

    const policyExpenseChatPolicyID = participants?.find((participant) => participant.isPolicyExpenseChat)?.policyID;

    const senderPolicyID = participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;

    const odometerStartImage = transaction?.comment?.odometerStartImage;
    const odometerEndImage = transaction?.comment?.odometerEndImage;

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

    const {createTransaction, sendMoney} = useExpenseSubmission({
        transaction,
        transactions,
        receiptFiles,
        transactionViolationsRef,
        report,
        reportID,
        existingInvoiceReport,
        selfDMReport,
        policy,
        policyCategories,
        policyTags,
        policyRecentlyUsedCategories,
        policyRecentlyUsedTags,
        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
        recentlyUsedDestinations,
        participantsPolicyTags,
        senderWorkspacePolicyTags,
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
        isGPSDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isMovingTransactionFromTrackExpense,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isUnreported,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        customUnitRateID,
        transactionDistance,
        hasViolations,
        shouldGenerateTransactionThreadReport,
        gpsDraftDetails,
        introSelected,
        activePolicyID,
        quickAction,
        betas,
        isSelfTourViewed,
        userLocation,
        draftTransactionIDs,
        privateIsArchivedMap,
        backToReport,
        isASAPSubmitBetaEnabled,
        viewTourTaskReport,
        viewTourTaskParentReport,
        isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
        translate,
        toLocaleDigit,
        setIsConfirmed,
        formHasBeenSubmitted,
    });

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

        requestAnimationFrame(() => {
            createTransaction(listOfParticipants);
            // Keep the pre-submit loading state visible for one more paint so the spinner appears before navigation work starts.
            requestAnimationFrame(() => {
                setIsConfirming(false);
            });
        });
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
                                navigateAfterInteraction(() => {
                                    createTransaction(selectedParticipantList, true);
                                });
                            }}
                            onDeny={() => {
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
