import reportsSelector from '@selectors/Attributes';
import {transactionDraftValuesSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
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
import useDeepCompareRef from '@hooks/useDeepCompareRef';
import useFetchRoute from '@hooks/useFetchRoute';
import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {completeTestDriveTask} from '@libs/actions/Task';
import DateUtils from '@libs/DateUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import validateReceiptFile from '@libs/fileDownload/validateReceiptFile';
import getCurrentPosition from '@libs/getCurrentPosition';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    navigateToStartMoneyRequestStep,
    shouldShowReceiptEmptyState,
    shouldUseTransactionDraft,
} from '@libs/IOUUtils';
import Log from '@libs/Log';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation from '@libs/Navigation/Navigation';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {
    doesReportReceiverMatchParticipant,
    generateReportID,
    getReportOrDraftReport,
    hasViolations as hasViolationsReportUtils,
    isProcessingReport,
    isReportOutstanding,
    isSelectedManagerMcTest,
} from '@libs/ReportUtils';
import {endSpan} from '@libs/telemetry/activeSpans';
import {
    getAttendees,
    getDefaultTaxCode,
    getRateID,
    getRequestType,
    getValidWaypoints,
    hasReceipt,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanRequest,
} from '@libs/TransactionUtils';
import type {GpsPoint} from '@userActions/IOU';
import {
    createDistanceRequest as createDistanceRequestIOUActions,
    getIOURequestPolicyID,
    requestMoney as requestMoneyIOUActions,
    setMoneyRequestBillable,
    setMoneyRequestCategory,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestReceipt,
    setMoneyRequestReimbursable,
    splitBill,
    splitBillAndOpenReport,
    startMoneyRequest,
    startSplitBill,
    submitPerDiemExpense as submitPerDiemExpenseIOUActions,
    trackExpense as trackExpenseIOUActions,
    updateLastLocationPermissionPrompt,
} from '@userActions/IOU';
import {getReceiverType, sendInvoice} from '@userActions/IOU/SendInvoice';
import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';
import {openDraftWorkspaceRequest} from '@userActions/Policy/Policy';
import {removeDraftTransaction, removeDraftTransactions, replaceDefaultDraftTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {RecentlyUsedCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {InvoiceReceiver} from '@src/types/onyx/Report';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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

    const [optimisticTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: transactionDraftValuesSelector,
        canBeMissing: true,
    });
    const transactions = useMemo(() => {
        const allTransactions = optimisticTransactions && optimisticTransactions.length > 1 ? optimisticTransactions : [initialTransaction];
        return allTransactions.filter((transaction): transaction is Transaction => !!transaction);
    }, [initialTransaction, optimisticTransactions]);
    const hasMultipleTransactions = transactions.length > 1;
    // Depend on transactions.length to avoid updating transactionIDs when only the transaction details change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const transactionIDs = useMemo(() => transactions?.map((transaction) => transaction.transactionID), [transactions.length]);
    // We will use setCurrentTransactionID later to switch between transactions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentTransactionID, setCurrentTransactionID] = useState<string>(initialTransactionID);
    const currentTransactionIndex = useMemo(() => transactions.findIndex((transaction) => transaction.transactionID === currentTransactionID), [transactions, currentTransactionID]);
    const [existingTransaction, existingTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(currentTransactionID)}`, {canBeMissing: true});
    const [optimisticTransaction, optimisticTransactionResult] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${getNonEmptyStringOnyxID(currentTransactionID)}`, {canBeMissing: true});
    const isLoadingCurrentTransaction = isLoadingOnyxValue(existingTransactionResult, optimisticTransactionResult);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const transaction = useMemo(
        () => (!isLoadingCurrentTransaction ? (optimisticTransaction ?? existingTransaction) : undefined),
        [existingTransaction, optimisticTransaction, isLoadingCurrentTransaction],
    );
    const transactionsCategories = useDeepCompareRef(
        transactions.map(({transactionID, category}) => ({
            transactionID,
            category,
        })),
    );
    const isUnreported = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const isCreatingTrackExpense = action === CONST.IOU.ACTION.CREATE && iouType === CONST.IOU.TYPE.TRACK;
    const {policyForMovingExpenses, policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const realPolicyID = isCreatingTrackExpense || isUnreported ? policyForMovingExpensesID : getIOURequestPolicyID(initialTransaction, reportReal);
    const draftPolicyID = getIOURequestPolicyID(initialTransaction, reportDraft);
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${draftPolicyID}`, {canBeMissing: true});
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${realPolicyID}`, {canBeMissing: true});
    const [reportDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT, {canBeMissing: true});
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

    const policy = isCreatingTrackExpense || isUnreported ? policyForMovingExpenses : (policyReal ?? policyDraft);
    const policyID = isCreatingTrackExpense || isUnreported ? policyForMovingExpensesID : getIOURequestPolicyID(transaction, report);
    const isDraftPolicy = policy === policyDraft;

    const [policyCategoriesDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${draftPolicyID}`, {canBeMissing: true});
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${realPolicyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${realPolicyID}`, {canBeMissing: true});
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${realPolicyID}`, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});

    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});

    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [recentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${realPolicyID}`, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');

    const policyCategories = useMemo(() => {
        if (isDraftPolicy && draftPolicyID) {
            return policyCategoriesDraft;
        }

        if (realPolicyID) {
            return allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${realPolicyID}`];
        }

        return undefined;
    }, [allPolicyCategories, realPolicyID, policyCategoriesDraft, draftPolicyID, isDraftPolicy]);

    const receiverParticipant: Participant | InvoiceReceiver | undefined = transaction?.participants?.find((participant) => participant?.accountID) ?? report?.invoiceReceiver;
    const receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : CONST.DEFAULT_NUMBER_ID;
    const receiverParticipantAccountID = receiverParticipant && 'accountID' in receiverParticipant ? receiverParticipant.accountID : undefined;
    const receiverType = getReceiverType(receiverParticipant);
    const senderWorkspaceID = transaction?.participants?.find((participant) => participant?.isSender)?.policyID;

    const existingInvoiceReport = useParticipantsInvoiceReport(receiverAccountID, receiverType, senderWorkspaceID);

    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const [selectedParticipantList, setSelectedParticipantList] = useState<Participant[]>([]);

    const [receiptFiles, setReceiptFiles] = useState<Record<string, Receipt>>({});
    const requestType = getRequestType(transaction);
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isOdometerDistanceRequest = isOdometerDistanceRequestTransactionUtils(transaction);
    const transactionDistance = isManualDistanceRequest || isOdometerDistanceRequest ? (transaction?.comment?.customUnit?.quantity ?? undefined) : undefined;
    const isPerDiemRequest = requestType === CONST.IOU.REQUEST_TYPE.PER_DIEM;
    const isTimeRequest = requestType === CONST.IOU.REQUEST_TYPE.TIME;
    const [lastLocationPermissionPrompt] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {canBeMissing: true});
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
    const isSharingTrackExpense = action === CONST.IOU.ACTION.SHARE;
    const isCategorizingTrackExpense = action === CONST.IOU.ACTION.CATEGORIZE;
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const isTestTransaction = transaction?.participants?.some((participant) => isSelectedManagerMcTest(participant.login));
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});

    const gpsRequired = transaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).length && !isTestTransaction;
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

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
                    : getReportOption(participant, privateIsArchived, policy, reportAttributesDerived, reportDrafts);
            }) ?? [],
        [transaction?.participants, iouType, personalDetails, reportAttributesDerived, reportDrafts, privateIsArchivedMap, policy],
    );
    const isPolicyExpenseChat = useMemo(() => participants?.some((participant) => participant.isPolicyExpenseChat), [participants]);
    const shouldGenerateTransactionThreadReport = !isBetaEnabled(CONST.BETAS.NO_OPTIMISTIC_TRANSACTION_THREADS);
    const formHasBeenSubmitted = useRef(false);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    useFetchRoute(transaction, transaction?.comment?.waypoints, action, shouldUseTransactionDraft(action) ? CONST.TRANSACTION.STATE.DRAFT : CONST.TRANSACTION.STATE.CURRENT);

    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
        Performance.markEnd(CONST.TIMING.OPEN_CREATE_EXPENSE_APPROVE);
    }, []);

    useEffect(() => {
        if (!isCreatingTrackExpense || policyForMovingExpensesID === undefined) {
            return;
        }

        openDraftWorkspaceRequest(policyForMovingExpensesID);
    }, [isCreatingTrackExpense, policy?.pendingAction, policyForMovingExpensesID]);

    const policyExpenseChatPolicyID = useMemo(() => {
        return participants?.find((participant) => participant.isPolicyExpenseChat)?.policyID;
    }, [participants]);

    const senderPolicyID = useMemo(() => {
        return participants?.find((participant) => !!participant && 'isSender' in participant && participant.isSender)?.policyID;
    }, [participants]);

    useEffect(() => {
        if (policyExpenseChatPolicyID && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(policyExpenseChatPolicyID);
            return;
        }
        if (senderPolicyID && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            openDraftWorkspaceRequest(senderPolicyID);
        }
    }, [isOffline, policy?.pendingAction, policyExpenseChatPolicyID, senderPolicyID]);

    const defaultBillable = !!policy?.defaultBillable;
    useEffect(() => {
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        for (const transactionID of transactionIDs) {
            setMoneyRequestBillable(transactionID, defaultBillable);
        }
    }, [transactionIDs, defaultBillable, isMovingTransactionFromTrackExpense]);

    useEffect(() => {
        if (isMovingTransactionFromTrackExpense) {
            return;
        }
        const defaultReimbursable = (isPolicyExpenseChat && isPaidGroupPolicy(policy)) || isCreatingTrackExpense ? (policy?.defaultReimbursable ?? true) : true;
        for (const transactionID of transactionIDs) {
            setMoneyRequestReimbursable(transactionID, defaultReimbursable);
        }
    }, [transactionIDs, policy, isPolicyExpenseChat, isMovingTransactionFromTrackExpense, isCreatingTrackExpense]);

    useEffect(() => {
        // Exit early if the transaction is still loading
        if (!!isLoadingTransaction || (transaction?.transactionID && (!transaction?.isFromGlobalCreate || !isEmptyObject(transaction?.participants)))) {
            return;
        }

        startMoneyRequest(
            iouType ?? CONST.IOU.TYPE.CREATE,
            // When starting to create an expense from the global FAB, If there is not an existing report yet, a random optimistic reportID is generated and used
            // for all of the routes in the creation flow.
            reportID ?? generateReportID(),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, [isLoadingTransaction]);

    useEffect(() => {
        for (const item of transactions) {
            if (!item.category) {
                // If the expense had his category cleared due to unsaved changes (i.e. changing to recipient to one that does not have category)
                // then we should reset the category to it's last saved value
                const existingCategory = existingTransaction?.category;
                if (existingCategory) {
                    const isExistingCategoryEnabled = policyCategories?.[existingCategory]?.enabled;
                    if (isExistingCategoryEnabled) {
                        setMoneyRequestCategory(item.transactionID, existingCategory, policy);
                    }
                }
                continue;
            }
        }
        // We don't want to clear out category every time the transactions change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policy?.id, policyCategories, transactionsCategories]);

    const policyDistance = Object.values(policy?.customUnits ?? {}).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const defaultCategory = policyDistance?.defaultCategory ?? '';

    useEffect(() => {
        for (const item of transactions) {
            if (!isDistanceRequest || !!item?.category) {
                continue;
            }
            setMoneyRequestCategory(item.transactionID, defaultCategory, policy);
        }
        // Prevent resetting to default when unselect category
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionIDs, requestType, defaultCategory, policy?.id]);

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
            if (isMovingTransactionFromTrackExpense) {
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
        navigateToStartMoneyRequestStep(requestType, iouType, initialTransactionID, reportID, action);
    }, [
        action,
        isPerDiemRequest,
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
    ]);

    // When the component mounts, if there is a receipt, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the receipt file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the request process.
    // skip this in case user is moving the transaction as the receipt path will be valid in that case
    useEffect(() => {
        let newReceiptFiles: Record<string, Receipt> = {};
        let isScanFilesCanBeRead = true;

        Promise.all(
            transactions.map((item) => {
                const itemReceiptFilename = item.receipt?.filename;
                const itemReceiptPath = item.receipt?.source;
                const itemReceiptType = item.receipt?.type;
                const isLocalFile = isLocalFileFileUtils(itemReceiptPath);

                if (!isLocalFile) {
                    if (item.receipt) {
                        newReceiptFiles = {...newReceiptFiles, [item.transactionID]: item.receipt};
                    }
                    return Promise.resolve();
                }

                const onSuccess = (file: File) => {
                    const receipt: Receipt = file;
                    if (item?.receipt?.isTestReceipt) {
                        receipt.isTestReceipt = true;
                        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                    } else if (item?.receipt?.isTestDriveReceipt) {
                        receipt.isTestDriveReceipt = true;
                        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE;
                    } else {
                        receipt.state = file && requestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.IOU.RECEIPT_STATE.OPEN : CONST.IOU.RECEIPT_STATE.SCAN_READY;
                    }

                    newReceiptFiles = {...newReceiptFiles, [item.transactionID]: receipt};
                };

                const onFailure = () => {
                    isScanFilesCanBeRead = false;
                    if (initialTransactionID === item.transactionID) {
                        setMoneyRequestReceipt(item.transactionID, '', '', true, '');
                    }
                };

                return validateReceiptFile(itemReceiptFilename, itemReceiptPath, itemReceiptType, onSuccess, onFailure) ?? Promise.resolve();
            }),
        ).then(() => {
            if (isScanFilesCanBeRead) {
                setReceiptFiles(newReceiptFiles);
                return;
            }
            if (requestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, initialTransactionID, reportID, Navigation.getActiveRouteWithoutParams()));
                return;
            }
            removeDraftTransactions(true);
            navigateToStartMoneyRequestStep(requestType, iouType, initialTransactionID, reportID);
        });
    }, [requestType, iouType, initialTransactionID, reportID, action, report, transactions, participants]);

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
                    !!item.linkedTrackedExpenseReportID && !!privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];

                if (isTestDriveReceipt) {
                    completeTestDriveTask(
                        viewTourTaskReport,
                        viewTourTaskParentReport,
                        isViewTourTaskParentReportArchived,
                        currentUserPersonalDetails.accountID,
                        hasOutstandingChildTask,
                        parentReportAction,
                        false,
                    );
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
                        amount: isTestReceipt ? CONST.TEST_RECEIPT.AMOUNT : item.amount,
                        distance: isManualDistanceRequest && typeof item.comment?.customUnit?.quantity === 'number' ? roundToTwoDecimalPlaces(item.comment.customUnit.quantity) : undefined,
                        attendees: item.comment?.attendees,
                        currency: isTestReceipt ? CONST.TEST_RECEIPT.CURRENCY : item.currency,
                        created: item.created,
                        merchant: isTestReceipt ? CONST.TEST_RECEIPT.MERCHANT : item.merchant,
                        comment: item?.comment?.comment?.trim() ?? '',
                        receipt,
                        category: item.category,
                        tag: item.tag,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        billable: item.billable,
                        reimbursable: item.reimbursable,
                        actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                        waypoints: Object.keys(item.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true) : undefined,
                        customUnitRateID,
                        isTestDrive: item.receipt?.isTestDriveReceipt,
                        originalTransactionID: item.comment?.originalTransactionID,
                        source: item.comment?.source,
                        isLinkedTrackedExpenseReportArchived,
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
                    transactionViolations,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    allBetas,
                    quickAction,
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
            customUnitRateID,
            shouldGenerateTransactionThreadReport,
            backToReport,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            policyRecentlyUsedCurrencies,
            quickAction,
            viewTourTaskReport,
            viewTourTaskParentReport,
            isViewTourTaskParentReportArchived,
            hasOutstandingChildTask,
            parentReportAction,
            allBetas,
            isTimeRequest,
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
            submitPerDiemExpenseIOUActions({
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
                },
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                hasViolations,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                allBetas,
                quickAction,
            });
        },
        [
            transaction,
            report,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            policy,
            policyTags,
            policyRecentlyUsedTags,
            policyCategories,
            recentlyUsedDestinations,
            isASAPSubmitBetaEnabled,
            hasViolations,
            policyRecentlyUsedCurrencies,
            allBetas,
            quickAction,
        ],
    );

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
                    !!item.linkedTrackedExpenseReportID && !!privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];
                const itemDistance = isManualDistanceRequest || isOdometerDistanceRequest ? (item.comment?.customUnit?.quantity ?? undefined) : undefined;

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
                        billable: item.billable,
                        reimbursable: item.reimbursable,
                        gpsPoint,
                        validWaypoints: Object.keys(item?.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true) : undefined,
                        actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                        customUnitRateID,
                        attendees: item.comment?.attendees,
                        isLinkedTrackedExpenseReportArchived,
                        odometerStart: isOdometerDistanceRequest ? item.comment?.odometerStart : undefined,
                        odometerEnd: isOdometerDistanceRequest ? item.comment?.odometerEnd : undefined,
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
                    allBetas,
                });
            }
        },
        [
            report,
            transactions,
            receiptFiles,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            transactionTaxCode,
            transactionTaxAmount,
            policy,
            policyTags,
            policyCategories,
            action,
            customUnitRateID,
            isDraftPolicy,
            isManualDistanceRequest,
            isOdometerDistanceRequest,
            privateIsArchivedMap,
            isASAPSubmitBetaEnabled,
            introSelected,
            activePolicyID,
            quickAction,
            allBetas,
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
                    customUnitRateID,
                    splitShares: transaction.splitShares,
                    validWaypoints: getValidWaypoints(transaction.comment?.waypoints, true),
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    attendees: transaction.comment?.attendees,
                    receipt: isManualDistanceRequest || isOdometerDistanceRequest ? receiptFiles[transaction.transactionID] : undefined,
                    odometerStart: isOdometerDistanceRequest ? transaction.comment?.odometerStart : undefined,
                    odometerEnd: isOdometerDistanceRequest ? transaction.comment?.odometerEnd : undefined,
                },
                backToReport,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                allBetas,
            });
        },
        [
            transaction,
            report,
            currentUserPersonalDetails.login,
            currentUserPersonalDetails.accountID,
            iouType,
            policy,
            isOdometerDistanceRequest,
            policyCategories,
            policyTags,
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            isManualDistanceRequest,
            transactionDistance,
            transactionTaxCode,
            transactionTaxAmount,
            customUnitRateID,
            receiptFiles,
            backToReport,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            allBetas,
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
                            shouldPlaySound: index === transactions.length - 1,
                            policyRecentlyUsedCategories,
                            policyRecentlyUsedTags,
                            quickAction,
                            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        });
                    }
                }
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
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                        isASAPSubmitBetaEnabled,
                        transactionViolations,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        allBetas,
                    });
                }
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
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                        isASAPSubmitBetaEnabled,
                        transactionViolations,
                        quickAction,
                        policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                        allBetas,
                    });
                }
                return;
            }

            if (iouType === CONST.IOU.TYPE.INVOICE) {
                const invoiceChatReport =
                    !isEmptyObject(report) && report?.reportID && doesReportReceiverMatchParticipant(report, receiverParticipantAccountID) ? report : existingInvoiceReport;
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
                    policyRecentlyUsedTags,
                });
                return;
            }

            if (iouType === CONST.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense) {
                if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && transaction) {
                    // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                    if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                        if (userLocation) {
                            trackExpense(selectedParticipants, {
                                lat: userLocation.latitude,
                                long: userLocation.longitude,
                            });
                            return;
                        }

                        getCurrentPosition(
                            (successData) => {
                                trackExpense(selectedParticipants, {
                                    lat: successData.coords.latitude,
                                    long: successData.coords.longitude,
                                });
                            },
                            (errorData) => {
                                Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                                // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                                trackExpense(selectedParticipants);
                            },
                        );
                        return;
                    }

                    // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                    trackExpense(selectedParticipants);
                    return;
                }
                trackExpense(selectedParticipants);
                return;
            }

            if (isPerDiemRequest) {
                submitPerDiemExpense(selectedParticipants, trimmedComment, policyRecentlyUsedCategories);
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
                        return;
                    }

                    getCurrentPosition(
                        (successData) => {
                            requestMoney(selectedParticipants, {
                                lat: successData.coords.latitude,
                                long: successData.coords.longitude,
                            });
                        },
                        (errorData) => {
                            Log.info('[IOURequestStepConfirmation] getCurrentPosition failed', false, errorData);
                            // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                            requestMoney(selectedParticipants);
                        },
                    );
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                requestMoney(selectedParticipants);
                return;
            }

            requestMoney(selectedParticipants);
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
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            quickAction,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            receiverParticipantAccountID,
            existingInvoiceReport,
            policy,
            policyTags,
            policyCategories,
            trackExpense,
            userLocation,
            submitPerDiemExpense,
            policyRecentlyUsedCurrencies,
            allBetas,
            reportID,
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

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                setIsConfirmed(true);
                sendMoneyElsewhere(
                    report,
                    quickAction,
                    transaction.amount,
                    currency,
                    trimmedComment,
                    currentUserPersonalDetails.accountID,
                    participant,
                    transaction.created,
                    transaction.merchant,
                    receiptFiles[transaction.transactionID],
                );
                return;
            }

            if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                setIsConfirmed(true);
                sendMoneyWithWallet(
                    report,
                    quickAction,
                    transaction.amount,
                    currency,
                    trimmedComment,
                    currentUserPersonalDetails.accountID,
                    participant,
                    transaction.created,
                    transaction.merchant,
                    receiptFiles[transaction.transactionID],
                );
            }
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

        createTransaction(listOfParticipants);
        setIsConfirming(false);
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
        return <FullScreenLoadingIndicator />;
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
            shouldEnableMaxHeight={canUseTouchScreen()}
            testID="IOURequestStepConfirmation"
        >
            <DragAndDropProvider isDisabled={!showReceiptEmptyState}>
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        subtitle={hasMultipleTransactions ? `${currentTransactionIndex + 1} ${translate('common.of')} ${transactions.length}` : undefined}
                        onBackButtonPress={navigateBack}
                        shouldDisplayHelpButton={!hasMultipleTransactions}
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
                    {(isLoading || (isScanRequest(transaction) && !Object.values(receiptFiles).length)) && <FullScreenLoadingIndicator />}
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
                    <MoneyRequestConfirmationList
                        transaction={transaction}
                        selectedParticipants={participants}
                        iouAmount={transaction?.amount ?? 0}
                        iouAttendees={getAttendees(transaction, currentUserPersonalDetails)}
                        iouComment={transaction?.comment?.comment ?? ''}
                        iouCurrencyCode={transaction?.currency}
                        iouIsBillable={transaction?.billable}
                        onToggleBillable={setBillable}
                        iouCategory={transaction?.category}
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
                        iouMerchant={transaction?.merchant}
                        iouCreated={transaction?.created}
                        isDistanceRequest={isDistanceRequest}
                        isManualDistanceRequest={isManualDistanceRequest}
                        isOdometerDistanceRequest={isOdometerDistanceRequest}
                        isPerDiemRequest={isPerDiemRequest}
                        shouldShowSmartScanFields={shouldShowSmartScanFields}
                        action={action}
                        isConfirmed={isConfirmed}
                        isConfirming={isConfirming}
                        iouIsReimbursable={transaction?.reimbursable}
                        onToggleReimbursable={setReimbursable}
                        expensesNumber={transactions.length}
                        isReceiptEditable
                        isTimeRequest={isTimeRequest}
                        iouTimeCount={transaction?.comment?.units?.count}
                        iouTimeRate={transaction?.comment?.units?.rate}
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
