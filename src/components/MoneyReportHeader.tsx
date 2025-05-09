import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {exportReportToCSV, exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildOptimisticNextStepForPreventSelfApprovalsEnabled} from '@libs/NextStepUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    changeMoneyRequestHoldStatus,
    getArchiveReason,
    getBankAccountRoute,
    getIntegrationIcon,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getTransactionsWithReceipts,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    isAllowedToApproveExpenseReport,
    isExported as isExportedUtils,
    isInvoiceReport,
    isProcessingReport,
    isReportOwner,
    navigateToDetailsPage,
    reportTransactionsSelector,
} from '@libs/ReportUtils';
import {
    allHavePendingRTERViolation,
    hasDuplicateTransactions,
    isDuplicate,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
    isReceiptBeingScanned,
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
    getNavigationUrlOnMoneyRequestDelete,
    getNextApproverAccountID,
    payInvoice,
    payMoneyRequest,
    startMoneyRequest,
    submitReport,
    unapproveExpenseReport,
} from '@userActions/IOU';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import useDelegateUserDetails from '@src/hooks/useDelegateUserDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmModal from './ConfirmModal';
import DecisionModal from './DecisionModal';
import DelegateNoAccessModal from './DelegateNoAccessModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {PaymentMethod} from './KYCWall/types';
import LoadingBar from './LoadingBar';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import {useMoneyRequestReportContext} from './MoneyRequestReportView/MoneyRequestReportContext';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import AnimatedSettlementButton from './SettlementButton/AnimatedSettlementButton';
import Text from './Text';

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

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyReportHeader({policy, report: moneyRequestReport, transactionThreadReportID, reportActions, shouldDisplayBackButton = false, onBackButtonPress}: MoneyReportHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const route = useRoute();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`, {canBeMissing: true});
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const requestParentReportAction = useMemo(() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    }, [reportActions, transactionThreadReport?.parentReportActionID]);
    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => reportTransactionsSelector(_transactions, moneyRequestReport?.reportID),
        initialValue: [],
        canBeMissing: true,
    });
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${isMoneyRequestAction(requestParentReportAction) && getOriginalMessage(requestParentReportAction)?.IOUTransactionID}`, {
        canBeMissing: true,
    });
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true, canBeMissing: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);

    const isExported = isExportedUtils(reportActions);

    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const [isCancelPaymentModalVisible, setIsCancelPaymentModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isUnapproveModalVisible, setIsUnapproveModalVisible] = useState(false);

    const [exportModalStatus, setExportModalStatus] = useState<ExportType | null>(null);

    const {isPaidAnimationRunning, isApprovedAnimationRunning, startAnimation, stopAnimation, startApprovedAnimation} = usePaymentAnimations();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(moneyRequestReport);
    const isOnHold = isOnHoldTransactionUtils(transaction);

    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const policyType = policy?.type;
    const connectedIntegration = getConnectedIntegration(policy);
    const hasScanningReceipt = getTransactionsWithReceipts(moneyRequestReport?.reportID).some((t) => isReceiptBeingScanned(t));
    const hasOnlyPendingTransactions = useMemo(() => {
        return !!transactions && transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    }, [transactions]);
    const transactionIDs = useMemo(() => transactions?.map((t) => t.transactionID) ?? [], [transactions]);
    const [allViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const violations = useMemo(
        () => Object.fromEntries(Object.entries(allViolations ?? {}).filter(([key]) => transactionIDs.includes(key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '')))),
        [allViolations, transactionIDs],
    );
    // Check if there is pending rter violation in all transactionViolations with given transactionIDs.
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDs, violations);
    // Check if user should see broken connection violation warning.
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, moneyRequestReport, policy, violations);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const isPayAtEndExpense = isPayAtEndExpenseTransactionUtils(transaction);
    const isArchivedReport = useReportIsArchived(moneyRequestReport?.reportID);
    const [archiveReason] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`, {selector: getArchiveReason, canBeMissing: true});

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.reportID}`, {canBeMissing: true});
    const getCanIOUBePaid = useCallback(
        (onlyShowPayElsewhere = false, shouldCheckApprovedState = true) =>
            canIOUBePaidAction(moneyRequestReport, chatReport, policy, transaction ? [transaction] : undefined, onlyShowPayElsewhere, undefined, undefined, shouldCheckApprovedState),
        [moneyRequestReport, chatReport, policy, transaction],
    );

    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);

    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext();

    const {
        options: selectedTransactionsOptions,
        handleDeleteTransactions,
        isDeleteModalVisible: hookDeleteModalVisible,
        hideDeleteModal,
    } = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
    });

    const shouldShowSelectedTransactionsButton = !!selectedTransactionsOptions.length && !transactionThreadReportID;

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
    const shouldShowStatusBar =
        hasAllPendingRTERViolations || shouldShowBrokenConnectionViolation || hasOnlyHeldExpenses || hasScanningReceipt || isPayAtEndExpense || hasOnlyPendingTransactions || hasDuplicates;

    // When prevent self-approval is enabled & the current user is submitter AND they're submitting to themselves, we need to show the optimistic next step
    // We should always show this optimistic message for policies with preventSelfApproval
    // to avoid any flicker during transitions between online/offline states
    const nextApproverAccountID = getNextApproverAccountID(moneyRequestReport);
    const isSubmitterSameAsNextApprover = isReportOwner(moneyRequestReport) && nextApproverAccountID === moneyRequestReport?.ownerAccountID;
    const optimisticNextStep = isSubmitterSameAsNextApprover && policy?.preventSelfApproval ? buildOptimisticNextStepForPreventSelfApprovalsEnabled() : nextStep;

    const shouldShowNextStep = isFromPaidPolicy && !!optimisticNextStep?.message?.length && !shouldShowStatusBar;
    const bankAccountRoute = getBankAccountRoute(chatReport);
    const formattedAmount = convertToDisplayString(reimbursableSpend, moneyRequestReport?.currency);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const displayedAmount = isAnyTransactionOnHold && canAllowSettlement && hasValidNonHeldAmount ? nonHeldAmount : formattedAmount;
    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;

    const confirmPayment = useCallback(
        (type?: PaymentMethodType | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod) => {
            if (!type || !chatReport) {
                return;
            }
            setPaymentType(type);
            setRequestType(CONST.IOU.REPORT_ACTION_TYPE.PAY);
            if (isDelegateAccessRestricted) {
                setIsNoDelegateAccessMenuVisible(true);
            } else if (isAnyTransactionOnHold) {
                setIsHoldMenuVisible(true);
            } else if (isInvoiceReport(moneyRequestReport)) {
                startAnimation();
                payInvoice(type, chatReport, moneyRequestReport, payAsBusiness, methodID, paymentMethod);
            } else {
                startAnimation();
                payMoneyRequest(type, chatReport, moneyRequestReport, undefined, true);
            }
        },
        [chatReport, isAnyTransactionOnHold, isDelegateAccessRestricted, moneyRequestReport, startAnimation],
    );

    const confirmApproval = () => {
        setRequestType(CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
        if (isDelegateAccessRestricted) {
            setIsNoDelegateAccessMenuVisible(true);
        } else if (isAnyTransactionOnHold) {
            setIsHoldMenuVisible(true);
        } else {
            startApprovedAnimation();
            approveMoneyRequest(moneyRequestReport, true);
        }
    };

    const markAsCash = useCallback(() => {
        if (!requestParentReportAction) {
            return;
        }
        const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
        const reportID = transactionThreadReport?.reportID;

        if (!iouTransactionID || !reportID) {
            return;
        }
        markAsCashAction(iouTransactionID, reportID);
    }, [requestParentReportAction, transactionThreadReport?.reportID]);

    const getStatusIcon: (src: IconAsset) => React.ReactNode = (src) => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    const getStatusBarProps: () => MoneyRequestHeaderStatusBarProps | undefined = () => {
        if (isPayAtEndExpense) {
            if (!isArchivedReport) {
                return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.bookingPendingDescription')};
            }
            if (isArchivedReport && archiveReason === CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED) {
                return {icon: getStatusIcon(Expensicons.Box), description: translate('iou.bookingArchivedDescription')};
            }
        }
        if (hasOnlyHeldExpenses) {
            return {icon: getStatusIcon(Expensicons.Stopwatch), description: translate('iou.expensesOnHold')};
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

    const getFirstDuplicateThreadID = (reportTransactions: OnyxTypes.Transaction[], allReportActions: OnyxTypes.ReportAction[]) => {
        const duplicateTransaction = reportTransactions.find((reportTransaction) => isDuplicate(reportTransaction.transactionID));
        if (!duplicateTransaction) {
            return null;
        }

        return getThreadReportIDsForTransactions(allReportActions, [duplicateTransaction]).at(0);
    };

    const statusBarProps = getStatusBarProps();
    const shouldAddGapToContents = shouldUseNarrowLayout && shouldShowSelectedTransactionsButton && (!!statusBarProps || shouldShowNextStep);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !isOnHold) {
            return;
        }
        Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);

    const primaryAction = useMemo(() => {
        // It's necessary to allow payment animation to finish before button is changed
        if (isPaidAnimationRunning) {
            return CONST.REPORT.PRIMARY_ACTIONS.PAY;
        }
        if (!moneyRequestReport) {
            return '';
        }
        return getReportPrimaryAction(moneyRequestReport, transactions, violations, policy, reportNameValuePairs, reportActions);
    }, [isPaidAnimationRunning, moneyRequestReport, reportNameValuePairs, policy, transactions, violations, reportActions]);

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

    const primaryActionsImplementation = {
        [CONST.REPORT.PRIMARY_ACTIONS.SUBMIT]: (
            <Button
                success
                text={translate('common.submit')}
                onPress={() => {
                    if (!moneyRequestReport) {
                        return;
                    }
                    submitReport(moneyRequestReport);
                }}
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
                canIOUBePaid
                onlyShowPayElsewhere={onlyShowPayElsewhere}
                currency={moneyRequestReport?.currency}
                confirmApproval={confirmApproval}
                policyID={moneyRequestReport?.policyID}
                chatReportID={chatReport?.reportID}
                iouReport={moneyRequestReport}
                onPress={confirmPayment}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                addBankAccountRoute={bankAccountRoute}
                shouldHidePaymentOptions={!shouldShowPayButton}
                shouldShowApproveButton={shouldShowApproveButton}
                shouldDisableApproveButton={shouldDisableApproveButton}
                formattedAmount={!hasOnlyHeldExpenses ? displayedAmount : ''}
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
        [CONST.REPORT.PRIMARY_ACTIONS.REVIEW_DUPLICATES]: (
            <Button
                success
                text={translate('iou.reviewDuplicates')}
                onPress={() => {
                    const threadID = transactionThreadReportID ?? getFirstDuplicateThreadID(transactions, reportActions);
                    if (!threadID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadID));
                }}
            />
        ),
        [CONST.REPORT.PRIMARY_ACTIONS.ADD_EXPENSE]: (
            <Button
                success
                text={translate('iou.addExpense')}
                onPress={() => {
                    if (!moneyRequestReport?.reportID) {
                        return;
                    }
                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID);
                }}
            />
        ),
    };

    const secondaryActions = useMemo(() => {
        if (!moneyRequestReport) {
            return [];
        }
        return getSecondaryReportActions(moneyRequestReport, transactions, violations, policy, reportNameValuePairs, reportActions);
    }, [moneyRequestReport, policy, transactions, violations, reportNameValuePairs, reportActions]);

    const secondaryActionsImplemenation: Record<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>, DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>>> = {
        [CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: Expensicons.Info,
            onSelected: () => {
                navigateToDetailsPage(moneyRequestReport, Navigation.getReportRHPActiveRoute());
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD,
            text: translate('common.download'),
            icon: Expensicons.Download,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                exportReportToCSV({reportID: moneyRequestReport.reportID, transactionIDList: transactionIDs}, () => {
                    setDownloadErrorModalVisible(true);
                });
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
            text: translate('iou.approve'),
            icon: Expensicons.ThumbsUp,
            value: CONST.REPORT.SECONDARY_ACTIONS.APPROVE,
            onSelected: () => {
                if (!moneyRequestReport) {
                    return;
                }
                approveMoneyRequest(moneyRequestReport);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE]: {
            text: translate('iou.unapprove'),
            icon: Expensicons.CircularArrowBackwards,
            value: CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE,
            onSelected: () => {
                if (isDelegateAccessRestricted) {
                    setIsNoDelegateAccessMenuVisible(true);
                    return;
                }

                if (isExported) {
                    setIsUnapproveModalVisible(true);
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
                setIsCancelPaymentModalVisible(true);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING]: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            text: translate('workspace.common.exportIntegrationSelected', {connectionName: connectedIntegration!}),
            icon: getIntegrationIcon(connectedIntegration),
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING,
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
            additionalIconStyles: styles.integrationIcon,
            displayInDefaultIconColor: true,
        },
        [CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED]: {
            text: translate('workspace.common.markAsExported'),
            icon: Expensicons.CheckCircle,
            value: CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED,
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
        [CONST.REPORT.SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
            value: CONST.REPORT.SECONDARY_ACTIONS.HOLD,
            onSelected: () => {
                if (!requestParentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                changeMoneyRequestHoldStatus(requestParentReportAction);
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
                Navigation.navigate(ROUTES.REPORT_WITH_ID_CHANGE_WORKSPACE.getRoute(moneyRequestReport.reportID));
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: Expensicons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: () => {
                setIsDeleteModalVisible(true);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE]: {
            text: translate('iou.addExpense'),
            icon: Expensicons.Plus,
            value: CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE,
            onSelected: () => {
                if (!moneyRequestReport?.reportID) {
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, moneyRequestReport?.reportID);
            },
        },
    };

    const applicableSecondaryActions = secondaryActions.map((action) => secondaryActionsImplemenation[action]);

    useEffect(() => {
        if (!transactionThreadReportID) {
            return;
        }
        setSelectedTransactionsID([]);
        // We don't need to run the effect on change of setSelectedTransactionsID since it can cause the infinite loop.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionThreadReportID]);

    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;

    const isMoreContentShown = shouldShowNextStep || !!statusBarProps;

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

    const {selectionMode} = useMobileSelectionMode();

    if (selectionMode?.isEnabled) {
        return (
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    setSelectedTransactionsID([]);
                    turnOffMobileSelectionMode();
                }}
            />
        );
    }

    return (
        <View style={[styles.pt0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowReportAvatarWithDisplay
                shouldShowPinButton={false}
                report={moneyRequestReport}
                policy={policy}
                shouldShowBackButton={shouldShowBackButton}
                shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                onBackButtonPress={onBackButtonPress}
                shouldShowBorderBottom={false}
                shouldEnableDetailPageNavigation
            >
                {!shouldDisplayNarrowVersion && (
                    <View style={[styles.flexRow, styles.gap2]}>
                        {!!primaryAction && !shouldShowSelectedTransactionsButton && primaryActionsImplementation[primaryAction]}
                        {!!applicableSecondaryActions.length && !shouldShowSelectedTransactionsButton && (
                            <ButtonWithDropdownMenu
                                success={false}
                                onPress={() => {}}
                                shouldAlwaysShowDropdownMenu
                                customText={translate('common.more')}
                                options={applicableSecondaryActions}
                                isSplitButton={false}
                            />
                        )}
                        {shouldShowSelectedTransactionsButton && (
                            <View>
                                <ButtonWithDropdownMenu
                                    onPress={() => null}
                                    options={selectedTransactionsOptions}
                                    customText={translate('workspace.common.selected', {count: selectedTransactionsID.length})}
                                    isSplitButton={false}
                                    shouldAlwaysShowDropdownMenu
                                />
                            </View>
                        )}
                    </View>
                )}
            </HeaderWithBackButton>
            {shouldDisplayNarrowVersion && !shouldShowSelectedTransactionsButton && (
                <View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    {!!primaryAction && <View style={[styles.flex1]}>{primaryActionsImplementation[primaryAction]}</View>}
                    {!!applicableSecondaryActions.length && (
                        <ButtonWithDropdownMenu
                            success={false}
                            onPress={() => {}}
                            shouldAlwaysShowDropdownMenu
                            customText={translate('common.more')}
                            options={applicableSecondaryActions}
                            isSplitButton={false}
                            wrapperStyle={[!primaryAction && styles.flex1]}
                        />
                    )}
                </View>
            )}
            {isMoreContentShown && (
                <View style={[styles.dFlex, styles.flexColumn, shouldAddGapToContents && styles.gap3, styles.pb3, styles.ph5]}>
                    {shouldShowSelectedTransactionsButton && shouldDisplayNarrowVersion && (
                        <View style={[styles.dFlex, styles.w100, styles.pb3]}>
                            <ButtonWithDropdownMenu
                                onPress={() => null}
                                options={selectedTransactionsOptions}
                                customText={translate('workspace.common.selected', {count: selectedTransactionsID.length})}
                                isSplitButton={false}
                                shouldAlwaysShowDropdownMenu
                                wrapperStyle={styles.w100}
                            />
                        </View>
                    )}
                    {shouldShowNextStep && <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />}
                    {!!statusBarProps && (
                        <MoneyRequestHeaderStatusBar
                            icon={statusBarProps.icon}
                            description={statusBarProps.description}
                        />
                    )}
                </View>
            )}
            <LoadingBar shouldShow={(isLoadingReportData && shouldUseNarrowLayout) ?? false} />
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
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
            <ConfirmModal
                title={translate('iou.cancelPayment')}
                isVisible={isCancelPaymentModalVisible}
                onConfirm={() => {
                    if (!chatReport) {
                        return;
                    }
                    cancelPayment(moneyRequestReport, chatReport);
                    setIsCancelPaymentModalVisible(false);
                }}
                onCancel={() => setIsCancelPaymentModalVisible(false)}
                prompt={translate('iou.cancelPaymentConfirmation')}
                confirmText={translate('iou.cancelPayment')}
                cancelText={translate('common.dismiss')}
                danger
                shouldEnableNewFocusManagement
            />
            <ConfirmModal
                title={translate('iou.deleteExpense', {count: 1})}
                isVisible={isDeleteModalVisible}
                onConfirm={() => {
                    setIsDeleteModalVisible(false);
                    let goBackRoute: Route | undefined;
                    if (transactionThreadReportID) {
                        if (!requestParentReportAction || !transaction?.transactionID) {
                            throw new Error('Missing data!');
                        }
                        // it's deleting transacation but not the report which leads to bug (that is actually also on staging)
                        deleteMoneyRequest(transaction?.transactionID, requestParentReportAction);
                        goBackRoute = getNavigationUrlOnMoneyRequestDelete(transaction.transactionID, requestParentReportAction, false);
                    }

                    if (goBackRoute) {
                        Navigation.navigate(goBackRoute);
                    }
                }}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('iou.deleteConfirmation', {count: 1})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />
            <ConfirmModal
                title={translate('iou.deleteExpense', {count: selectedTransactionsID.length})}
                isVisible={hookDeleteModalVisible}
                onConfirm={handleDeleteTransactions}
                onCancel={hideDeleteModal}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionsID.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />
            {!!connectedIntegration && (
                <ConfirmModal
                    title={translate('workspace.exportAgainModal.title')}
                    onConfirm={confirmExport}
                    onCancel={() => setExportModalStatus(null)}
                    prompt={translate('workspace.exportAgainModal.description', {connectionName: connectedIntegration, reportName: moneyRequestReport?.reportName ?? ''})}
                    confirmText={translate('workspace.exportAgainModal.confirmText')}
                    cancelText={translate('workspace.exportAgainModal.cancelText')}
                    isVisible={!!exportModalStatus}
                />
            )}
            <ConfirmModal
                title={translate('iou.unapproveReport')}
                isVisible={isUnapproveModalVisible}
                danger
                confirmText={translate('iou.unapproveReport')}
                onConfirm={() => {
                    setIsUnapproveModalVisible(false);
                    unapproveExpenseReport(moneyRequestReport);
                }}
                cancelText={translate('common.cancel')}
                onCancel={() => setIsUnapproveModalVisible(false)}
                prompt={unapproveWarningText}
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
        </View>
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';

export default MoneyReportHeader;
