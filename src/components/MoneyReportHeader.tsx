import {useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import getArchiveReason from '@selectors/Report';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import usePaymentOptions from '@hooks/usePaymentOptions';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {
    createTransactionThreadReport,
    deleteAppReport,
    downloadReportPDF,
    exportReportToCSV,
    exportReportToPDF,
    exportToIntegration,
    markAsManuallyExported,
    openUnreportedExpense,
} from '@libs/actions/Report';
import {getExportTemplates, queueExportSearchWithTemplate, search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {getThreadReportIDsForTransactions, getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, SearchFullscreenNavigatorParamList, SearchReportParamList} from '@libs/Navigation/types';
import {buildOptimisticNextStepForPreventSelfApprovalsEnabled} from '@libs/NextStepUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {isSecondaryActionAPaymentOption, selectPaymentType} from '@libs/PaymentUtils';
import {getConnectedIntegration, getValidConnectedIntegration} from '@libs/PolicyUtils';
import {getIOUActionForReportID, getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getAllExpensesToHoldIfApplicable, getReportPrimaryAction, isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryExportReportActions, getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    changeMoneyRequestHoldStatus,
    getIntegrationExportIcon,
    getIntegrationNameFromExportMessage as getIntegrationNameFromExportMessageUtils,
    getNextApproverAccountID,
    getNonHeldAndFullAmount,
    getTransactionsWithReceipts,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    isAllowedToApproveExpenseReport,
    isExported as isExportedUtils,
    isInvoiceReport as isInvoiceReportUtil,
    isProcessingReport,
    isReportOwner,
    navigateOnDeleteExpense,
    navigateToDetailsPage,
    rejectMoneyRequestReason,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    allHavePendingRTERViolation,
    getOriginalTransactionWithSplitInfo,
    hasDuplicateTransactions,
    isDuplicate,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
    isScanning,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
} from '@libs/TransactionUtils';
import type {ExportType} from '@pages/home/report/ReportDetailsExportPage';
import variables from '@styles/variables';
import {
    approveMoneyRequest,
    canApproveIOU,
    cancelPayment,
    canIOUBePaid as canIOUBePaidAction,
    deleteMoneyRequest,
    dismissRejectUseExplanation,
    getNavigationUrlOnMoneyRequestDelete,
    initSplitExpense,
    markRejectViolationAsResolved,
    payInvoice,
    payMoneyRequest,
    reopenReport,
    retractReport,
    startDistanceRequest,
    startMoneyRequest,
    submitReport,
    unapproveExpenseReport,
} from '@userActions/IOU';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ActivityIndicator from './ActivityIndicator';
import AnimatedSubmitButton from './AnimatedSubmitButton';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import DecisionModal from './DecisionModal';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';
import Header from './Header';
import HeaderWithBackButton from './HeaderWithBackButton';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import KYCWall from './KYCWall';
import type {PaymentMethod} from './KYCWall/types';
import LoadingBar from './LoadingBar';
import Modal from './Modal';
import useConfirmModal from './Modal/Global/useModalHook';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import MoneyRequestReportNavigation from './MoneyRequestReportView/MoneyRequestReportNavigation';
import type {PopoverMenuItem} from './PopoverMenu';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import {useSearchContext} from './Search/SearchContext';
import AnimatedSettlementButton from './SettlementButton/AnimatedSettlementButton';
import Text from './Text';
import {WideRHPContext} from './WideRHPContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

type MoneyReportHeaderProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for the report */
    reportActions: OnyxTypes.ReportAction[];

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID: string | undefined;

    /** whether we are loading report data in openReport command */
    isLoadingInitialReportActions?: boolean;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({
    policy,
    report: moneyRequestReport,
    transactionThreadReportID,
    reportActions,
    isLoadingInitialReportActions,
    shouldDisplayBackButton = false,
    onBackButtonPress,
}: MoneyReportHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT>
        | PlatformStackRouteProp<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>
    >();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`, {canBeMissing: true});
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${moneyRequestReport?.reportID}`, {canBeMissing: true}) ?? null;
    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${reportPDFFilename}`, {canBeMissing: true});
    const isDownloadingPDF = download?.isDownloading ?? false;
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const exportTemplates = useMemo(() => getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, policy), [integrationsExportTemplates, csvExportLayouts, policy]);
    const {isBetaEnabled} = usePermissions();

    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const transactions = useMemo(() => {
        return Object.values(reportTransactions);
    }, [reportTransactions]);

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`, {
        canBeMissing: true,
    });

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, {canBeMissing: true});
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {canBeMissing: true});

    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
        {canBeMissing: true},
    );

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactions.map((t) => t.transactionID));
    const isExported = useMemo(() => isExportedUtils(reportActions), [reportActions]);
    // wrapped in useMemo to improve performance because this is an operation on array
    const integrationNameFromExportMessage = useMemo(() => {
        if (!isExported) {
            return null;
        }
        return getIntegrationNameFromExportMessageUtils(reportActions);
    }, [isExported, reportActions]);

    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});

    const [exportModalStatus, setExportModalStatus] = useState<ExportType | null>(null);
    const {showConfirmModal} = useConfirmModal();
    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning, startAnimation, stopAnimation, startApprovedAnimation, startSubmittingAnimation} =
        usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction);

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const connectedIntegration = getValidConnectedIntegration(policy);
    const connectedIntegrationFallback = getConnectedIntegration(policy);
    const hasScanningReceipt = getTransactionsWithReceipts(moneyRequestReport?.reportID).some((t) => isScanning(t));
    const hasOnlyPendingTransactions = useMemo(() => {
        return !!transactions && transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    }, [transactions]);
    const transactionIDs = useMemo(() => transactions?.map((t) => t.transactionID) ?? [], [transactions]);

    const messagePDF = useMemo(() => {
        if (!reportPDFFilename) {
            return translate('reportDetailsPage.waitForPDF');
        }
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        return translate('reportDetailsPage.generatedPDF');
    }, [reportPDFFilename, translate]);

    // Check if there is pending rter violation in all transactionViolations with given transactionIDs.
    // wrapped in useMemo to avoid unnecessary re-renders and for better performance (array operation inside of function)
    const hasAllPendingRTERViolations = useMemo(() => allHavePendingRTERViolation(transactions, violations), [transactions, violations]);
    // Check if user should see broken connection violation warning.
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, moneyRequestReport, policy, violations);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const isPayAtEndExpense = isPayAtEndExpenseTransactionUtils(transaction);
    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason, canBeMissing: true});

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false, shouldCheckApprovedState = true) =>
            canIOUBePaidAction(moneyRequestReport, chatReport, policy, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, undefined, shouldCheckApprovedState),
        [moneyRequestReport, chatReport, policy, transaction],
    );

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isRejectEducationalModalVisible, setIsRejectEducationalModalVisible] = useState(false);

    const {selectedTransactionIDs, removeTransaction, clearSelectedTransactions, currentSearchQueryJSON, currentSearchKey} = useSearchContext();

    const {wideRHPRouteKeys} = useContext(WideRHPContext);
    const shouldDisplayNarrowMoreButton = !shouldDisplayNarrowVersion || (wideRHPRouteKeys.length > 0 && !isSmallScreenWidth);

    const showExportProgressModal = useCallback(() => {
        return showConfirmModal({
            title: translate('export.exportInProgress'),
            prompt: translate('export.conciergeWillSend'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => {
            if (!moneyRequestReport) {
                return;
            }

            showExportProgressModal().then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                clearSelectedTransactions(undefined, true);
            });
            queueExportSearchWithTemplate({
                templateName,
                templateType,
                jsonQuery: '{}',
                reportIDList: [moneyRequestReport.reportID],
                transactionIDList,
                policyID,
            });
        },
        [moneyRequestReport, showExportProgressModal, clearSelectedTransactions],
    );

    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const {options: originalSelectedTransactionsOptions, handleDeleteTransactions} = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
        onExportOffline: () => setOfflineModalVisible(true),
        policy,
        beginExportWithTemplate: (templateName, templateType, transactionIDList, policyID) => beginExportWithTemplate(templateName, templateType, transactionIDList, policyID),
    });

    const canIOUBePaid = useMemo(() => getCanIOUBePaid(), [getCanIOUBePaid]);
    const onlyShowPayElsewhere = useMemo(() => !canIOUBePaid && getCanIOUBePaid(true), [canIOUBePaid, getCanIOUBePaid]);

    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;

    const shouldShowApproveButton = useMemo(
        () => (canApproveIOU(moneyRequestReport, policy, transactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning,
        [moneyRequestReport, policy, transactions, hasOnlyPendingTransactions, isApprovedAnimationRunning],
    );

    const shouldDisableApproveButton = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);

    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;

    const hasDuplicates = hasDuplicateTransactions(moneyRequestReport?.reportID);
    const shouldShowMarkAsResolved = isMarkAsResolvedAction(moneyRequestReport, transactionViolations);
    const shouldShowStatusBar =
        hasAllPendingRTERViolations ||
        shouldShowBrokenConnectionViolation ||
        hasOnlyHeldExpenses ||
        hasScanningReceipt ||
        isPayAtEndExpense ||
        hasOnlyPendingTransactions ||
        hasDuplicates ||
        shouldShowMarkAsResolved;

    // When prevent self-approval is enabled & the current user is submitter AND they're submitting to themselves, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover = isReportOwner(moneyRequestReport) && nextApproverAccountID === moneyRequestReport?.ownerAccountID;
    const optimisticNextStep = isSubmitterSameAsNextApprover && policy?.preventSelfApproval ? buildOptimisticNextStepForPreventSelfApprovalsEnabled() : nextStep;

    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const shouldShowLoadingBar = useLoadingBarVisibility();

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isReportInSearch = route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;

    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const confirmPayment = useCallback(
        (type?: PaymentMethodType | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod) => {
            if (!type || !chatReport) {
                return;
            }
            setPaymentType(type);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else if (isAnyTransactionOnHold) {
                if (getPlatform() === CONST.PLATFORM.IOS) {
                    // eslint-disable-next-line deprecation/deprecation
                    InteractionManager.runAfterInteractions(() => setIsHoldMenuVisible(true));
                } else {
                    setIsHoldMenuVisible(true);
                }
            } else if (isInvoiceReport) {
                startAnimation();
                payInvoice(type, chatReport, moneyRequestReport, introSelected, payAsBusiness, existingB2BInvoiceReport, methodID, paymentMethod);
            } else {
                startAnimation();
                payMoneyRequest(type, chatReport, moneyRequestReport, introSelected, undefined, true);
                if (currentSearchQueryJSON) {
                    search({
                        searchKey: currentSearchKey,
                        shouldCalculateTotals: true,
                        offset: 0,
                        queryJSON: currentSearchQueryJSON,
                        isOffline,
                    });
                }
            }
        },
        [
            chatReport,
            isDelegateAccessRestricted,
            isAnyTransactionOnHold,
            isInvoiceReport,
            showDelegateNoAccessModal,
            startAnimation,
            moneyRequestReport,
            introSelected,
            existingB2BInvoiceReport,
            currentSearchQueryJSON,
            currentSearchKey,
            isOffline,
        ],
    );

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            setIsHoldMenuVisible(true);
        } else {
            startApprovedAnimation();
            approveMoneyRequest(moneyRequestReport, true);
            if (currentSearchQueryJSON) {
                search({
                    searchKey: currentSearchKey,
                    shouldCalculateTotals: true,
                    offset: 0,
                    queryJSON: currentSearchQueryJSON,
                    isOffline,
                });
            }
        }
    };

    const markAsCash = useCallback(() => {
        if (!requestParentReportAction) {
            return;
        }
        const reportID = transactionThreadReport?.reportID;

        if (!iouTransactionID || !reportID) {
            return;
        }
        markAsCashAction(iouTransactionID, reportID);
    }, [iouTransactionID, requestParentReportAction, transactionThreadReport?.reportID]);

    const getStatusIcon: (src: IconAsset) => React.ReactNode = (src) => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    const getStatusBarProps: () => MoneyRequestHeaderStatusBarProps | undefined = () => {
        if (shouldShowMarkAsResolved) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.reject.rejectedStatus')};
        }

        if (isPayAtEndExpense) {
            if (!isArchivedReport) {
                return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.bookingPendingDescription')};
            }
            if (isArchivedReport && archiveReason === CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return {icon: getStatusIcon(Expensicons.Box), description: translate('iou.bookingArchivedDescription')};
            }
        }

        if (hasOnlyHeldExpenses) {
            return {icon: getStatusIcon(Expensicons.Stopwatch), description: translate(transactions.length > 1 ? 'iou.expensesOnHold' : 'iou.expenseOnHold')};
        }

        if (hasDuplicates) {
            return {icon: getStatusIcon(Expensicons.Flag), description: translate('iou.duplicateTransaction', {isSubmitted: isProcessingReport(moneyRequestReport)})};
        }

        if (!!transaction?.transactionID && shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(Expensicons.Hourglass),
                description: (
                    <BrokenConnectionDescription
                        transactionID={transaction?.transactionID}
                        report={moneyRequestReport}
                        policy={policy}
                    />
                ),
            };
        }
        if (hasAllPendingRTERViolations) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (hasOnlyPendingTransactions) {
            return {icon: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (hasScanningReceipt) {
            return {icon: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const getFirstDuplicateThreadID = (transactionsList: OnyxTypes.Transaction[], allReportActions: OnyxTypes.ReportAction[]) => {
        const duplicateTransaction = transactionsList.find((reportTransaction) => isDuplicate(reportTransaction));
        if (!duplicateTransaction) {
            return null;
        }

        return getThreadReportIDsForTransactions(allReportActions, [duplicateTransaction]).at(0);
    };

    const statusBarProps = getStatusBarProps();
    const dismissModalAndUpdateUseReject = () => {
        setIsRejectEducationalModalVisible(false);
        dismissRejectUseExplanation();
        if (requestParentReportAction) {
            rejectMoneyRequestReason(requestParentReportAction);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !isOnHold) {
            return;
        }
        Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);

    const primaryAction = useMemo(() => {
        return getReportPrimaryAction({
            currentUserEmail: currentUserLogin ?? '',
            report: moneyRequestReport,
            chatReport,
            reportTransactions: transactions,
            violations,
            policy,
            reportNameValuePairs,
            reportActions,
            isChatReportArchived,
            invoiceReceiverPolicy,
            isPaidAnimationRunning,
            isSubmittingAnimationRunning,
        });
    }, [
        isPaidAnimationRunning,
        isSubmittingAnimationRunning,
        moneyRequestReport,
        chatReport,
        transactions,
        violations,
        policy,
        reportNameValuePairs,
        reportActions,
        isChatReportArchived,
        invoiceReceiverPolicy,
        currentUserLogin,
    ]);

    const confirmExport = useCallback(() => {
        setExportModalStatus(null);
        if (!moneyRequestReport?.reportID || !connectedIntegration) {
            return;
        }
        if (exportModalStatus === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION) {
            exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
        } else if (exportModalStatus === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
            markAsManuallyExported(moneyRequestReport?.reportID, connectedIntegration);
        }
    }, [connectedIntegration, exportModalStatus, moneyRequestReport?.reportID]);

    const getAmount = (actionType: ValueOf<typeof CONST.REPORT.REPORT_PREVIEW_ACTIONS>) => ({
        formattedAmount: getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, actionType),
    });

    const {formattedAmount: totalAmount} = hasOnlyHeldExpenses ? getAmount(CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW) : getAmount(CONST.REPORT.PRIMARY_ACTIONS.PAY);

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: confirmPayment,
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton,
        shouldDisableApproveButton,
        onlyShowPayElsewhere,
    });

    const addExpenseDropdownOptions: Array<DropdownOption<ValueOf<typeof CONST.REPORT.ADD_EXPENSE_OPTIONS>>> = useMemo(
        () => [
            {
                value: CONST.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
                text: translate('iou.createExpense'),
                icon: Expensicons.Plus,
                onSelected: () => {
                    if (!moneyRequestReport?.reportID) {
                        return;
                    }
                    if (policy && shouldRestrictUserBillableActions(policy.id)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                        return;
                    }
                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID);
                },
            },
            {
                value: CONST.REPORT.ADD_EXPENSE_OPTIONS.TRACK_DISTANCE_EXPENSE,
                text: translate('iou.trackDistance'),
                icon: Expensicons.Location,
                onSelected: () => {
                    if (!moneyRequestReport?.reportID) {
                        return;
                    }
                    if (policy && shouldRestrictUserBillableActions(policy.id)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                        return;
                    }
                    startDistanceRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport.reportID, lastDistanceExpenseType);
                },
            },
            {
                value: CONST.REPORT.ADD_EXPENSE_OPTIONS.ADD_UNREPORTED_EXPENSE,
                text: translate('iou.addUnreportedExpense'),
                icon: Expensicons.ReceiptPlus,
                onSelected: () => {
                    if (policy && shouldRestrictUserBillableActions(policy.id)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                        return;
                    }
                    openUnreportedExpense(moneyRequestReport?.reportID);
                },
            },
        ],
        [moneyRequestReport?.reportID, policy, lastDistanceExpenseType, translate],
    );

    const exportSubmenuOptions: Record<string, DropdownOption<string>> = useMemo(() => {
        const options: Record<string, DropdownOption<string>> = {
            [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV]: {
                text: translate('export.basicExport'),
                icon: Expensicons.Table,
                value: CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV,
                onSelected: () => {
                    if (!moneyRequestReport) {
                        return;
                    }
                    if (isOffline) {
                        setOfflineModalVisible(true);
                        return;
                    }
                    exportReportToCSV({reportID: moneyRequestReport.reportID, transactionIDList: transactionIDs}, () => {
                        setDownloadErrorModalVisible(true);
                    });
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION]: {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text: translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegrationFallback!}),
                icon: getIntegrationExportIcon(connectedIntegration ?? connectedIntegrationFallback),
                value: CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        setExportModalStatus(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                        return;
                    }
                    exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
                },
            },
            [CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED]: {
                text: translate('workspace.common.markAsExported'),
                icon: getIntegrationExportIcon(connectedIntegration ?? connectedIntegrationFallback),
                value: CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED,
                onSelected: () => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        setExportModalStatus(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED);
                        return;
                    }
                    markAsManuallyExported(moneyRequestReport?.reportID, connectedIntegration);
                },
            },
        };

        for (const template of exportTemplates) {
            options[template.name] = {
                text: template.name,
                icon: Expensicons.Table,
                value: template.templateName,
                description: template.description,
                onSelected: () => beginExportWithTemplate(template.templateName, template.type, transactionIDs, template.policyID),
            };
        }

        return options;
    }, [translate, connectedIntegrationFallback, connectedIntegration, moneyRequestReport, isOffline, transactionIDs, isExported, beginExportWithTemplate, exportTemplates]);

    const primaryActionsImplementation = {
        [CONST.REPORT.PRIMARY_ACTIONS.SUBMIT]: (
            <AnimatedSubmitButton
                success
                text={translate('common.submit')}
                onPress={() => {
                    if (!moneyRequestReport) {
                        return;
                    }
                    startSubmittingAnimation();
                    submitReport(moneyRequestReport);
                    if (currentSearchQueryJSON) {
                        search({
                            searchKey: currentSearchKey,
                            shouldCalculateTotals: true,
                            offset: 0,
                            queryJSON: currentSearchQueryJSON,
                            isOffline,
                        });
                    }
                }}
                isSubmittingAnimationRunning={isSubmittingAnimationRunning}
                onAnimationFinish={stopAnimation}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.APPROVE]: (
            <Button
                success
                onPress={confirmApproval}
                text={translate('iou.approve')}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.PAY]: (
            <AnimatedSettlementButton
                isPaidAnimationRunning={isPaidAnimationRunning}
                isApprovedAnimationRunning={isApprovedAnimationRunning}
                onAnimationFinish={stopAnimation}
                formattedAmount={totalAmount}
                canIOUBePaid
                onlyShowPayElsewhere={onlyShowPayElsewhere}
                currency={moneyRequestReport?.currency}
                confirmApproval={confirmApproval}
                policyID={moneyRequestReport?.policyID}
                chatReportID={chatReport?.reportID}
                iouReport={moneyRequestReport}
                onPress={confirmPayment}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                shouldHidePaymentOptions={!shouldShowPayButton}
                shouldShowApproveButton={shouldShowApproveButton}
                shouldDisableApproveButton={shouldDisableApproveButton}
                isDisabled={isOffline && !canAllowSettlement}
                isLoading={!isOffline && !canAllowSettlement}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING]: (
            <Button
                success
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text={translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegration!})}
                onPress={() => {
                    if (!connectedIntegration || !moneyRequestReport) {
                        return;
                    }
                    if (isExported) {
                        setExportModalStatus(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION);
                        return;
                    }
                    exportToIntegration(moneyRequestReport?.reportID, connectedIntegration);
                }}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text={translate('iou.unhold')}
                onPress={() => {
                    const parentReportAction = getReportAction(moneyRequestReport?.parentReportID, moneyRequestReport?.parentReportActionID);

                    const IOUActions = getAllExpensesToHoldIfApplicable(moneyRequestReport, reportActions);

                    if (IOUActions.length) {
                        IOUActions.forEach(changeMoneyRequestHoldStatus);
                        return;
                    }

                    const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;
                    if (!moneyRequestAction) {
                        return;
                    }

                    changeMoneyRequestHoldStatus(moneyRequestAction);
                }}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH]: (
            <Button
                success
                text={translate('iou.markAsCash')}
                onPress={markAsCash}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_RESOLVED]: (
            <Button
                success
                onPress={() => {
                    if (!transaction?.transactionID) {
                        return;
                    }
                    markRejectViolationAsResolved(transaction?.transactionID, transactionThreadReport?.reportID);
                }}
                text={translate('iou.reject.markAsResolved')}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES]: (
            <Button
                success
                text={translate('iou.reviewDuplicates')}
                onPress={() => {
                    let threadID = transactionThreadReportID ?? getFirstDuplicateThreadID(transactions, reportActions);
                    if (!threadID) {
                        const duplicateTransaction = transactions.find((reportTransaction) => isDuplicate(reportTransaction));
                        const transactionID = duplicateTransaction?.transactionID;
                        const iouAction = getIOUActionForReportID(moneyRequestReport?.reportID, transactionID);
                        const createdTransactionThreadReport = createTransactionThreadReport(moneyRequestReport, iouAction);
                        threadID = createdTransactionThreadReport?.reportID;
                    }
                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadID));
                }}
            />
        ),
    };

    const beginPDFExport = (reportID: string) => {
        setIsPDFModalVisible(true);
        exportReportToPDF({reportID});
    };

    const secondaryActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryReportActions({
            currentUserEmail: currentUserLogin ?? '',
            report: moneyRequestReport,
            chatReport,
            reportTransactions: transactions,
            violations,
            policy,
            reportNameValuePairs,
            reportActions,
            policies,
            isChatReportArchived,
            isNewDotUpdateSplitsBeta: isBetaEnabled(CONST.BETAS.NEWDOT_UPDATE_SPLITS),
        });
    }, [moneyRequestReport, currentUserLogin, chatReport, transactions, violations, policy, reportNameValuePairs, reportActions, policies, isChatReportArchived, isBetaEnabled]);

    const secondaryExportActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryExportReportActions(moneyRequestReport, policy, exportTemplates);
    }, [moneyRequestReport, policy, exportTemplates]);

    const connectedIntegrationName = connectedIntegration ? translate('workspace.accounting.connectionName', {connectionName: connectedIntegration}) : '';
    const unapproveWarningText = useMemo(
        () => (
            <Text>
                <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text>{' '}
                <Text>{translate('iou.unapproveWithIntegrationWarning', {accountingIntegration: connectedIntegrationName})}</Text>
            </Text>
        ),
        [connectedIntegrationName, styles.noWrap, styles.textStrong, translate],
    );

    const reopenExportedReportWarningText = (
        <Text>
            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')} </Text>
            <Text>{translate('iou.reopenExportedReportConfirmation', {connectionName: integrationNameFromExportMessage ?? ''})}</Text>
        </Text>
    );

    const secondaryActionsImplementation: Record<
        ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>,
        DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>
    > = {
        [CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: Expensicons.Info,
            onSelected: () => {
                navigateToDetailsPage(moneyRequestReport, Navigation.getReportRHPActiveRoute());
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.EXPORT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            icon: Expensicons.Export,
            rightIcon: Expensicons.ArrowRight,
            subMenuItems: secondaryExportActions.map((action) => exportSubmenuOptions[action as string]),
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            text: translate('common.downloadAsPDF'),
            icon: Expensicons.Document,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                beginPDFExport(moneyRequestReport.reportID);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SUBMIT]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.SUBMIT,
            text: translate('common.submit'),
            icon: Expensicons.Send,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                submitReport(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.APPROVE]: {
            text: translate('iou.approve', getAmount(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)),
            icon: Expensicons.ThumbsUp,
            value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
            onSelected: confirmApproval,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE]: {
            text: translate('iou.unapprove'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
            onSelected: () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (isExported) {
                    showConfirmModal({
                        title: translate('iou.unapproveReport'),
                        prompt: unapproveWarningText,
                        confirmText: translate('iou.unapproveReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    }).then((result) => {
                        if (result.action !== ModalActions.CONFIRM) {
                            return;
                        }
                        unapproveExpenseReport(moneyRequestReport);
                    });
                    return;
                }

                unapproveExpenseReport(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT]: {
            text: translate('iou.cancelPayment'),
            icon: Expensicons.Clear,
            value: CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT,
            onSelected: () => {
                showConfirmModal({
                    title: translate('iou.cancelPayment'),
                    prompt: translate('iou.cancelPaymentConfirmation'),
                    confirmText: translate('iou.cancelPayment'),
                    cancelText: translate('common.dismiss'),
                    danger: true,
                }).then((result) => {
                    if (result.action !== ModalActions.CONFIRM || !chatReport) {
                        return;
                    }
                    cancelPayment(moneyRequestReport, chatReport);
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                changeMoneyRequestHoldStatus(requestParentReportAction);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD]: {
            text: translate('iou.unhold'),
            icon: Expensicons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                changeMoneyRequestHoldStatus(requestParentReportAction);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.SPLIT]: {
            text: isExpenseSplit ? translate('iou.editSplits') : translate('iou.split'),
            icon: Expensicons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            onSelected: () => {
                if (Number(transactions?.length) !== 1) {
                    return;
                }

                const currentTransaction = transactions.at(0);
                initSplitExpense(currentTransaction);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MERGE]: {
            text: translate('common.merge'),
            icon: Expensicons.ArrowCollapse,
            value: CONST.REPORT.SECONDARY_ACTIONS.MERGE,
            onSelected: () => {
                const currentTransaction = transactions.at(0);
                if (!currentTransaction) {
                    return;
                }

                setupMergeTransactionData(currentTransaction.transactionID, {targetTransactionID: currentTransaction.transactionID});
                Navigation.navigate(ROUTES.MERGE_TRANSACTION_LIST_PAGE.getRoute(currentTransaction.transactionID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]: {
            text: translate('iou.changeWorkspace'),
            icon: Expensicons.Buildings,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_WITH_ID_CHANGE_WORKSPACE.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER]: {
            text: translate('iou.changeApprover.title'),
            icon: Expensicons.Workflows,
            value: CONST.REPORT.SECONDARY_ACTIONS.CHANGE_APPROVER,
            onSelected: () => {
                if (!moneyRequestReport) {
                    Log.warn('Change approver secondary action triggered without moneyRequestReport data.');
                    return;
                }
                Navigation.navigate(ROUTES.REPORT_CHANGE_APPROVER.getRoute(moneyRequestReport.reportID, Navigation.getActiveRoute()));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: Expensicons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: () => {
                const transactionCount = Object.keys(transactions).length;

                if (transactionCount === 1) {
                    showConfirmModal({
                        title: translate('iou.deleteExpense', {count: 1}),
                        prompt: translate('iou.deleteConfirmation', {count: 1}),
                        confirmText: translate('common.delete'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    }).then((result) => {
                        if (result.action !== ModalActions.CONFIRM) {
                            return;
                        }
                        let goBackRoute: Route | undefined;
                        if (transactionThreadReportID) {
                            if (!requestParentReportAction || !transaction?.transactionID) {
                                throw new Error('Missing data!');
                            }
                            InteractionManager.runAfterInteractions(() => {
                                deleteMoneyRequest(transaction?.transactionID, requestParentReportAction, duplicateTransactions, duplicateTransactionViolations);
                                removeTransaction(transaction.transactionID);
                            });
                            goBackRoute = getNavigationUrlOnMoneyRequestDelete(transaction.transactionID, requestParentReportAction, false);
                        }

                        if (goBackRoute) {
                            Navigation.setNavigationActionToMicrotaskQueue(() => navigateOnDeleteExpense(goBackRoute));
                        }
                    });
                    return;
                }

                showConfirmModal({
                    title: translate('iou.deleteReport'),
                    prompt: translate('iou.deleteReportConfirmation'),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                }).then((result) => {
                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    const reportID = moneyRequestReport?.reportID;
                    if (reportID) {
                        deleteAppReport(reportID);
                    }
                });
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.RETRACT]: {
            text: translate('iou.retract'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
            onSelected: () => {
                retractReport(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REOPEN]: {
            text: translate('iou.retract'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.REOPEN,
            onSelected: () => {
                if (!isExported) {
                    showConfirmModal({
                        title: translate('iou.reopenReport'),
                        prompt: reopenExportedReportWarningText,
                        confirmText: translate('iou.reopenReport'),
                        cancelText: translate('common.cancel'),
                        danger: true,
                    }).then((result) => {
                        if (result.action !== ModalActions.CONFIRM) {
                            return;
                        }
                        reopenReport(moneyRequestReport);
                    });
                    return;
                }
                reopenReport(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: Expensicons.ThumbsDown,
            value: CONST.REPORT.SECONDARY_ACTIONS.REJECT,
            onSelected: () => {
                if (dismissedRejectUseExplanation) {
                    if (requestParentReportAction) {
                        rejectMoneyRequestReason(requestParentReportAction);
                    }
                } else {
                    setIsRejectEducationalModalVisible(true);
                }
            },
            shouldShow: transactions.length === 1,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE]: {
            text: translate('iou.addExpense'),
            backButtonText: translate('iou.addExpense'),
            icon: Expensicons.Plus,
            rightIcon: Expensicons.ArrowRight,
            value: CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE,
            subMenuItems: addExpenseDropdownOptions,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                if (policy && shouldRestrictUserBillableActions(policy.id)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.PAY]: {
            text: translate('iou.settlePayment', {formattedAmount: totalAmount}),
            icon: Expensicons.Cash,
            value: CONST.REPORT.SECONDARY_ACTIONS.PAY,
            backButtonText: translate('iou.settlePayment', {formattedAmount: totalAmount}),
            subMenuItems: Object.values(paymentButtonOptions),
        },
    };
    const applicableSecondaryActions = secondaryActions
        .map((action) => secondaryActionsImplementation[action])
        .filter((action) => action?.shouldShow !== false && action?.value !== primaryAction);
    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }
        clearSelectedTransactions(true);
        // We don't need to run the effect on change of clearSelectedTransactions since it can cause the infinite loop.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    useEffect(() => {
        return () => {
            turnOffMobileSelectionMode();
        };
    }, []);

    const showDeleteModal = useCallback(() => {
        showConfirmModal({
            title: translate('iou.deleteExpense', {count: selectedTransactionIDs.length}),
            prompt: translate('iou.deleteConfirmation', {count: selectedTransactionIDs.length}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (transactions.filter((trans) => trans.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length === selectedTransactionIDs.length) {
                Navigation.goBack(route.params?.backTo);
            }
            handleDeleteTransactions();
        });
    }, [showConfirmModal, translate, selectedTransactionIDs.length, transactions, handleDeleteTransactions, route.params?.backTo]);

    const showExportAgainModal = useCallback(() => {
        if (!connectedIntegration) {
            return;
        }
        showConfirmModal({
            title: translate('workspace.exportAgainModal.title'),
            prompt: translate('workspace.exportAgainModal.description', {
                connectionName: connectedIntegration ?? connectedIntegrationFallback,
                reportName: moneyRequestReport?.reportName ?? '',
            }),
            confirmText: translate('workspace.exportAgainModal.confirmText'),
            cancelText: translate('workspace.exportAgainModal.cancelText'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                setExportModalStatus(null);
                return;
            }
            confirmExport();
        });
    }, [showConfirmModal, translate, connectedIntegration, connectedIntegrationFallback, moneyRequestReport?.reportName, confirmExport]);

    useEffect(() => {
        if (!exportModalStatus) {
            return;
        }
        showExportAgainModal();
    }, [exportModalStatus, showExportAgainModal]);

    const selectedTransactionsOptions = useMemo(() => {
        return originalSelectedTransactionsOptions.map((option) => {
            if (option.text === translate('common.delete')) {
                return {
                    ...option,
                    onSelected: showDeleteModal,
                };
            }
            return option;
        });
    }, [originalSelectedTransactionsOptions, translate, showDeleteModal]);

    const shouldShowSelectedTransactionsButton = !!selectedTransactionsOptions.length && !transactionThreadReportID;

    if (isMobileSelectionModeEnabled) {
        // If mobile selection mode is enabled but only one or no transactions remain, turn it off
        const visibleTransactions = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        if (visibleTransactions.length <= 1) {
            turnOffMobileSelectionMode();
        }

        return (
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    clearSelectedTransactions(true);
                    turnOffMobileSelectionMode();
                }}
            />
        );
    }
    const onPaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) =>
        selectPaymentType(event, iouPaymentType, triggerKYCFlow, policy, confirmPayment, isUserValidated, confirmApproval, moneyRequestReport);

    const KYCMoreDropdown = (
        <KYCWall
            onSuccessfulKYC={(payment) => confirmPayment(payment)}
            enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
            isDisabled={isOffline}
            source={CONST.KYC_WALL_SOURCE.REPORT}
            chatReportID={chatReport?.reportID}
            iouReport={moneyRequestReport}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
            }}
        >
            {(triggerKYCFlow, buttonRef) => (
                <ButtonWithDropdownMenu
                    success={false}
                    onPress={() => {}}
                    onSubItemSelected={(item, index, event) => {
                        if (!isSecondaryActionAPaymentOption(item)) {
                            return;
                        }
                        onPaymentSelect(event, item.value, triggerKYCFlow);
                    }}
                    buttonRef={buttonRef}
                    shouldAlwaysShowDropdownMenu
                    shouldPopoverUseScrollView={shouldDisplayNarrowVersion && applicableSecondaryActions.length >= 5}
                    customText={translate('common.more')}
                    options={applicableSecondaryActions}
                    isSplitButton={false}
                    wrapperStyle={shouldDisplayNarrowVersion && [!primaryAction && styles.flex1]}
                    shouldUseModalPaddingStyle
                />
            )}
        </KYCWall>
    );

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldDisplayStatus
                shouldShowPinButton={false}
                report={moneyRequestReport}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
            >
                {shouldDisplayNarrowMoreButton && (
                    <View style={[styles.flexRow, styles.gap2]}>
                        {!!primaryAction && !shouldShowSelectedTransactionsButton && primaryActionsImplementation[primaryAction]}
                        {!!applicableSecondaryActions.length && !shouldShowSelectedTransactionsButton && KYCMoreDropdown}
                        {shouldShowSelectedTransactionsButton && (
                            <View>
                                <ButtonWithDropdownMenu
                                    onPress={() => null}
                                    options={selectedTransactionsOptions}
                                    customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                                    isSplitButton={false}
                                    shouldAlwaysShowDropdownMenu
                                />
                            </View>
                        )}
                    </View>
                )}
            </HeaderWithBackButton>
            {!shouldDisplayNarrowMoreButton &&
                (shouldShowSelectedTransactionsButton ? (
                    <View style={[styles.dFlex, styles.w100, styles.ph5]}>
                        <ButtonWithDropdownMenu
                            onPress={() => null}
                            options={selectedTransactionsOptions}
                            customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                            isSplitButton={false}
                            shouldAlwaysShowDropdownMenu
                            wrapperStyle={styles.w100}
                        />
                    </View>
                ) : (
                    <View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        {!!primaryAction && <View style={[styles.flex1]}>{primaryActionsImplementation[primaryAction]}</View>}
                        {!!applicableSecondaryActions.length && KYCMoreDropdown}
                    </View>
                ))}

            <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3]}>
                <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                    {shouldShowNextStep && !!optimisticNextStep?.message?.length && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                    {shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline && <MoneyReportHeaderStatusBarSkeleton />}
                    {!!statusBarProps && (
                        <MoneyRequestHeaderStatusBar
                            icon={statusBarProps.icon}
                            description={statusBarProps.description}
                        />
                    )}
                </View>
                {isReportInSearch && (
                    <MoneyRequestReportNavigation
                        reportID={moneyRequestReport?.reportID}
                        shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
                    />
                )}
            </View>

            <LoadingBar shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout} />
            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={() => setIsHoldMenuVisible(false)}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
                    startAnimation={() => {
                        if (requestType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
                            startApprovedAnimation();
                        } else {
                            startAnimation();
                        }
                    }}
                    transactionCount={transactionIDs?.length ?? 0}
                />
            )}
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
            {!!isRejectEducationalModalVisible && (
                <HoldOrRejectEducationalModal
                    onClose={dismissModalAndUpdateUseReject}
                    onConfirm={dismissModalAndUpdateUseReject}
                />
            )}
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            <Modal
                onClose={() => setIsPDFModalVisible(false)}
                isVisible={isPDFModalVisible}
                type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
                innerContainerStyle={styles.pv0}
            >
                <View style={[styles.m5]}>
                    <View>
                        <View style={[styles.flexRow, styles.mb4]}>
                            <Header
                                title={translate('reportDetailsPage.generatingPDF')}
                                containerStyles={[styles.alignItemsCenter]}
                            />
                        </View>
                        <View>
                            <Text>{messagePDF}</Text>
                            {!reportPDFFilename && (
                                <ActivityIndicator
                                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                    color={theme.textSupporting}
                                    style={styles.mt3}
                                />
                            )}
                        </View>
                    </View>
                    {!!reportPDFFilename && reportPDFFilename !== 'error' && (
                        <Button
                            isLoading={isDownloadingPDF}
                            style={[styles.mt3, styles.noSelect]}
                            onPress={() => downloadReportPDF(reportPDFFilename ?? '', moneyRequestReport?.reportName ?? '')}
                            text={translate('common.download')}
                        />
                    )}
                    {(!reportPDFFilename || reportPDFFilename === 'error') && (
                        <Button
                            style={[styles.mt3, styles.noSelect]}
                            onPress={() => setIsPDFModalVisible(false)}
                            text={translate('common.close')}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';

export default MoneyReportHeader;
