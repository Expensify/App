import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {BulkPaySelectionData, PaymentData, SearchQueryJSON} from '@components/Search/types';
import {unholdRequest} from '@libs/actions/IOU/Hold';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {deleteAppReport, markAsManuallyExported, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import {
    approveMoneyRequestOnSearch,
    bulkDeleteReports,
    exportSearchItemsToCSV,
    exportToIntegrationOnSearch,
    getExportTemplates,
    getLastPolicyBankAccountID,
    getLastPolicyPaymentMethod,
    getPayMoneyOnSearchInvoiceParams,
    getPayOption,
    getReportType,
    getTotalFormattedAmount,
    isCurrencySupportWalletBulkPay,
    payMoneyRequestOnSearch,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    submitMoneyRequestOnSearch,
} from '@libs/actions/Search';
import initSplitExpense from '@libs/actions/SplitExpenses';
import {setNameValuePair} from '@libs/actions/User';
import {getTransactionsAndReportsFromSearch} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {getSecondaryExportReportActions, isMergeActionForSelectedTransactions} from '@libs/ReportSecondaryActionUtils';
import {
    canEditMultipleTransactions,
    getIntegrationIcon,
    getPolicyExpenseChat,
    getReportOrDraftReport,
    isArchivedReport,
    isBusinessInvoiceRoom,
    isCurrentUserSubmitter,
    isDM,
    isExpenseReport as isExpenseReportUtil,
    isInvoiceReport,
    isIOUReport as isIOUReportUtil,
    isSelfDM,
} from '@libs/ReportUtils';
import {serializeQueryJSONForBackend} from '@libs/SearchQueryUtils';
import {navigateToSearchRHP, shouldShowDeleteOption} from '@libs/SearchUIUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    hasCustomUnitOutOfPolicyViolation,
    hasTransactionBeenRejected,
    isDeletedTransaction,
    isDistanceRequest,
    isManagedCardTransaction,
    isPerDiemRequest,
    isScanning,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {initBulkEditDraftTransaction} from '@userActions/IOU/BulkEdit';
import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';
import {canIOUBePaid} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BillingGraceEndPeriod, Policy, Report, ReportNameValuePairs, SearchResults, Transaction, TransactionViolations} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import useAllPolicyExpenseChatReportActions from './useAllPolicyExpenseChatReportActions';
import useAllTransactions from './useAllTransactions';
import useBulkPayOptions from './useBulkPayOptions';
import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useSelfDMReport from './useSelfDMReport';
import useTheme from './useTheme';
import useThemeStyles from './useThemeStyles';
import useUndeleteTransactions from './useUndeleteTransactions';

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

type UseSearchBulkActionsParams = {
    queryJSON: SearchQueryJSON | undefined;
};

function getRestrictedPolicyID(
    items: Array<{policyID?: string}>,
    billingGracePeriods: OnyxCollection<BillingGraceEndPeriod>,
    ownerBillingGracePeriodEnd: OnyxEntry<number>,
    amountOwed: OnyxEntry<number>,
    allPolicies: OnyxCollection<Policy>,
): string | undefined {
    return items
        .map((item) => item.policyID)
        .find(
            (policyID): policyID is string =>
                !!policyID && shouldRestrictUserBillableActions(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`], ownerBillingGracePeriodEnd, billingGracePeriods, amountOwed),
        );
}

type ShouldShowBulkDuplicateParams = {
    selectedTransactionsKeys: string[];
    selectedTransactions: Record<string, {reportID?: string}>;
    allTransactions: OnyxCollection<Transaction> | undefined;
    allReports: OnyxCollection<Report> | undefined;
    allTransactionViolations: OnyxCollection<TransactionViolations> | undefined;
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs> | undefined;
    defaultExpensePolicyID: string | undefined;
    activePolicyExpenseChat: Report | undefined;
    typeExpenseReport: boolean;
    searchData: Record<string, unknown> | undefined;
};

/**
 * Determines whether the bulk duplicate option should be shown for the selected transactions.
 * Mirrors the single-duplicate guards from MoneyReportHeader/MoneyRequestHeader.
 */
function shouldShowBulkDuplicateOption({
    selectedTransactionsKeys,
    selectedTransactions,
    allTransactions,
    allReports,
    allTransactionViolations,
    allReportNameValuePairs,
    defaultExpensePolicyID,
    activePolicyExpenseChat,
    typeExpenseReport,
    searchData,
}: ShouldShowBulkDuplicateParams): boolean {
    if (typeExpenseReport || selectedTransactionsKeys.length === 0) {
        return false;
    }

    const searchReports = searchData
        ? Object.keys(searchData)
              .filter((key) => key.startsWith(ONYXKEYS.COLLECTION.REPORT))
              .map((key) => searchData[key] as Report)
              .filter((report): report is Report => report != null && 'reportID' in report)
        : [];

    return selectedTransactionsKeys.every((id) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
        if (!transaction || isManagedCardTransaction(transaction) || isScanning(transaction)) {
            return false;
        }

        const dates = transaction?.comment?.customUnit?.attributes?.dates;
        if (isPerDiemRequest(transaction) && (!dates?.start || !dates?.end)) {
            return false;
        }

        const reportID = selectedTransactions[id]?.reportID;
        const submitterReport = reportID ? getReportOrDraftReport(reportID, searchReports) : undefined;
        if (submitterReport && !isCurrentUserSubmitter(submitterReport)) {
            return false;
        }

        const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`];
        if (hasCustomUnitOutOfPolicyViolation(transactionViolations)) {
            return false;
        }

        const report = reportID ? ((searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] as Report | undefined) ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]) : undefined;

        if (isPerDiemRequest(transaction)) {
            const policyID = report?.policyID;
            if (!policyID || defaultExpensePolicyID !== policyID) {
                return false;
            }
        }

        if (isDistanceRequest(transaction) && reportID) {
            if (reportID === CONST.REPORT.UNREPORTED_REPORT_ID && activePolicyExpenseChat) {
                return false;
            }
            const chatReportID = report?.chatReportID ?? report?.parentReportID;
            const chatReport = chatReportID
                ? ((searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] as Report | undefined) ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`])
                : undefined;
            const reportNVP = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
            const chatReportNVP = chatReportID ? allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatReportID}`] : undefined;
            if (isArchivedReport(reportNVP) || isArchivedReport(chatReportNVP) || (activePolicyExpenseChat && chatReport && (isDM(chatReport) || isSelfDM(chatReport)))) {
                return false;
            }
        }

        return true;
    });
}

function useSearchBulkActions({queryJSON}: UseSearchBulkActionsParams) {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {selectedTransactions, selectedReports, areAllMatchingItemsSelected, currentSearchResults, currentSearchKey} = useSearchStateContext();
    const {clearSelectedTransactions, selectAllMatchingItems} = useSearchActionsContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {accountID} = currentUserPersonalDetails;
    const allTransactions = useAllTransactions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const policyExpenseChatReportActions = useAllPolicyExpenseChatReportActions();
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const selfDMReport = useSelfDMReport();
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const {isBetaEnabled} = usePermissions();
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const defaultExpensePolicy = useDefaultExpensePolicy();
    const undeleteTransactions = useUndeleteTransactions();

    // Cache the last search results that had data, so the merge option remains available
    // while results are temporarily unset (e.g. during sorting/loading).
    const lastNonEmptySearchResultsRef = useRef<SearchResults | undefined>(undefined);
    useEffect(() => {
        if (!currentSearchResults?.data) {
            return;
        }
        lastNonEmptySearchResultsRef.current = currentSearchResults;
    }, [currentSearchResults]);
    const searchResults = currentSearchResults?.data ? currentSearchResults : lastNonEmptySearchResultsRef.current;

    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const {showConfirmModal} = useConfirmModal();
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);

    const [emptyReportsCount, setEmptyReportsCount] = useState<number>(0);

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);

    const isExpenseReportType = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Export',
        'Table',
        'DocumentMerge',
        'Send',
        'Trashcan',
        'ThumbsUp',
        'ThumbsDown',
        'ArrowRight',
        'ArrowCollapse',
        'Stopwatch',
        'Exclamation',
        'MoneyBag',
        'ArrowSplit',
        'ExpenseCopy',
        'RotateLeft',
        'QBOSquare',
        'XeroSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'GustoSquare',
        'Pencil',
        'Workflows',
    ]);

    const {getCurrencyDecimals} = useCurrencyListActions();

    const selectedTransactionReportIDs = useMemo(
        () => [
            ...new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction.reportID)
                    .filter((reportID) => reportID !== undefined),
            ),
        ],
        [selectedTransactions],
    );
    const selectedReportIDs = Object.values(selectedReports)
        .map((report) => report.reportID)
        .filter((reportID) => reportID !== undefined);
    const isCurrencySupportedBulkWallet = isCurrencySupportWalletBulkPay(selectedReports, selectedTransactions);

    const selectedPolicyIDs = useMemo(
        () => [
            ...new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction.policyID)
                    .filter(Boolean),
            ),
        ],
        [selectedTransactions],
    );
    const selectedBulkCurrency = selectedReports.at(0)?.currency ?? Object.values(selectedTransactions).at(0)?.currency;
    const totalFormattedAmount = getTotalFormattedAmount(selectedReports, selectedTransactions, selectedBulkCurrency);

    const onlyShowPayElsewhere = useMemo(() => {
        const firstPolicyID = selectedPolicyIDs.at(0);
        const selectedPolicy = firstPolicyID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${firstPolicyID}`] : undefined;
        return (selectedTransactionReportIDs ?? selectedReportIDs).some((reportID) => {
            const report = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const chatReportID = report?.chatReportID;
            const chatReport = chatReportID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] : undefined;
            const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
            const invoiceReceiverPolicy = invoiceReceiverPolicyID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`] : undefined;
            return (
                report &&
                !canIOUBePaid(report, chatReport, selectedPolicy, bankAccountList, undefined, false, undefined, invoiceReceiverPolicy) &&
                canIOUBePaid(report, chatReport, selectedPolicy, bankAccountList, undefined, true, undefined, invoiceReceiverPolicy)
            );
        });
    }, [currentSearchResults?.data, selectedPolicyIDs, selectedReportIDs, selectedTransactionReportIDs, bankAccountList]);

    const {bulkPayButtonOptions, businessBankAccountOptions, shouldShowBusinessBankAccountOptions} = useBulkPayOptions({
        selectedPolicyID: selectedPolicyIDs.at(0),
        selectedReportID: selectedTransactionReportIDs.at(0) ?? selectedReportIDs.at(0),
        isCurrencySupportedWallet: isCurrencySupportedBulkWallet,
        currency: selectedBulkCurrency,
        formattedAmount: totalFormattedAmount,
        onlyShowPayElsewhere,
    });

    const {status, hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const firstTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedTransactionsKeys.at(0)}`];
    const [firstTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${firstTransaction?.reportID}`);
    const [firstTransactionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${firstTransactionReport?.policyID}`);

    const beginExportWithTemplate = useCallback(
        async (templateName: string, templateType: string, policyID: string | undefined) => {
            const emptyReports =
                selectedReports?.filter((selectedReport) => {
                    if (!selectedReport) {
                        return false;
                    }
                    const fullReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];
                    return (fullReport?.transactionCount ?? 0) === 0;
                }) ?? [];
            const hasOnlyEmptyReports = selectedReports.length > 0 && emptyReports.length === selectedReports.length;

            if (hasOnlyEmptyReports) {
                setEmptyReportsCount(emptyReports.length);
                setIsDownloadErrorModalVisible(true);
                return;
            }
            if (isOffline) {
                setIsOfflineModalVisible(true);
                return;
            }

            if (areAllMatchingItemsSelected) {
                queueExportSearchWithTemplate({
                    templateName,
                    templateType,
                    jsonQuery: queryJSON ? serializeQueryJSONForBackend(queryJSON) : JSON.stringify(queryJSON),
                    reportIDList: [],
                    transactionIDList: [],
                    policyID,
                });
            } else {
                queueExportSearchWithTemplate({
                    templateName,
                    templateType,
                    jsonQuery: '{}',
                    reportIDList: selectedTransactionReportIDs,
                    transactionIDList: selectedTransactionsKeys,
                    policyID,
                });
            }

            const result = await showConfirmModal({
                title: translate('export.exportInProgress'),
                prompt: translate('export.conciergeWillSend'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            clearSelectedTransactions(undefined, true);
        },
        [
            selectedReports,
            isOffline,
            areAllMatchingItemsSelected,
            showConfirmModal,
            translate,
            clearSelectedTransactions,
            currentSearchResults?.data,
            queryJSON,
            selectedTransactionReportIDs,
            selectedTransactionsKeys,
        ],
    );

    const policyIDsWithVBBA = useMemo(() => {
        const result = [];
        for (const policy of Object.values(policies ?? {})) {
            if (!policy?.achAccount?.bankAccountID) {
                continue;
            }

            result.push(policy.id);
        }

        return result;
    }, [policies]);

    const handleBasicExport = useCallback(async () => {
        if (isOffline) {
            setIsOfflineModalVisible(true);
            return;
        }

        if (status === null || status === undefined) {
            return;
        }

        if (areAllMatchingItemsSelected) {
            const result = await showConfirmModal({
                title: translate('search.exportSearchResults.title'),
                prompt: translate('search.exportSearchResults.description'),
                confirmText: translate('search.exportSearchResults.title'),
                cancelText: translate('common.cancel'),
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
                return;
            }
            const reportIDList = selectedReports?.map((report) => report?.reportID).filter((reportID) => reportID !== undefined) ?? [];
            queueExportSearchItemsToCSV({
                query: status,
                jsonQuery: queryJSON ? serializeQueryJSONForBackend(queryJSON) : JSON.stringify(queryJSON),
                reportIDList,
                transactionIDList: selectedTransactionsKeys,
            });
            selectAllMatchingItems(false);
            clearSelectedTransactions();
            return;
        }

        let didFail = false;
        await exportSearchItemsToCSV(
            {
                query: status,
                jsonQuery: queryJSON ? serializeQueryJSONForBackend(queryJSON) : JSON.stringify(queryJSON),
                reportIDList: selectedReports.length > 0 ? selectedReportIDs : selectedTransactionReportIDs,
                transactionIDList: selectedTransactionsKeys,
            },
            () => {
                didFail = true;
                setEmptyReportsCount(0);
                setIsDownloadErrorModalVisible(true);
            },
            translate,
        );
        if (!didFail) {
            clearSelectedTransactions(undefined, true);
        }
    }, [
        isOffline,
        status,
        areAllMatchingItemsSelected,
        queryJSON,
        selectedReports,
        selectedReportIDs,
        selectedTransactionReportIDs,
        selectedTransactionsKeys,
        translate,
        clearSelectedTransactions,
        showConfirmModal,
        hash,
        selectAllMatchingItems,
    ]);

    const handleApproveWithDEWCheck = useCallback(async () => {
        if (isOffline) {
            setIsOfflineModalVisible(true);
            return;
        }

        if (!hash) {
            return;
        }

        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        const selectedItems = selectedReports.length ? selectedReports : Object.values(selectedTransactions);

        const restrictedPolicyID = getRestrictedPolicyID(selectedItems, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed, policies);
        if (restrictedPolicyID) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedPolicyID));
            return;
        }

        const reportIDList = !selectedReports.length
            ? Object.values(selectedTransactions).map((transaction) => transaction.reportID)
            : (selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? []);
        approveMoneyRequestOnSearch(
            hash,
            reportIDList.filter((reportID) => reportID !== undefined),
        );
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });
    }, [
        isOffline,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
        selectedReports,
        selectedTransactions,
        hash,
        clearSelectedTransactions,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        amountOwed,
        policies,
    ]);

    const {expenseCount, uniqueReportCount} = useMemo(() => {
        let expenses = 0;
        const reportIDs = new Set<string>();

        for (const key of Object.keys(selectedTransactions)) {
            const selectedItem = selectedTransactions[key];
            if (!selectedItem?.reportID) {
                continue;
            }
            if (selectedItem.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === selectedItem.reportID) {
                reportIDs.add(selectedItem.reportID);
            } else {
                expenses += 1;
                reportIDs.add(selectedItem.reportID);
            }
        }

        return {expenseCount: expenses, uniqueReportCount: reportIDs.size};
    }, [selectedTransactions]);

    const isDeletingOnlyExpenses = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE && expenseCount > 0;
    const deleteCount = isDeletingOnlyExpenses ? expenseCount : uniqueReportCount;
    const deleteModalTitle = isDeletingOnlyExpenses ? translate('iou.deleteExpense', {count: expenseCount}) : translate('iou.deleteReport', {count: deleteCount});
    const deleteModalPrompt = isDeletingOnlyExpenses ? translate('iou.deleteConfirmation', {count: expenseCount}) : translate('iou.deleteReportConfirmation', {count: deleteCount});

    const handleDeleteSelectedTransactions = useCallback(async () => {
        if (!hash) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(async () => {
            const result = await showConfirmModal({
                title: deleteModalTitle,
                prompt: deleteModalPrompt,
                confirmText: translate('common.delete'),
                cancelText: translate('common.cancel'),
                danger: true,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            const validTransactions = Object.fromEntries(Object.entries(allTransactions ?? {}).filter((entry): entry is [string, Transaction] => entry[1] !== undefined));
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                if (isExpenseReportType) {
                    for (const reportID of selectedReportIDs) {
                        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                        deleteAppReport({
                            report,
                            selfDMReport,
                            currentUserEmailParam: currentUserPersonalDetails?.email ?? '',
                            currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
                            reportTransactions: validTransactions,
                            allTransactionViolations,
                            bankAccountList,
                            hash,
                        });
                    }
                } else {
                    const transactionsViolations = allTransactionViolations
                        ? Object.fromEntries(Object.entries(allTransactionViolations).filter((entry): entry is [string, TransactionViolations] => !!entry[1]))
                        : {};
                    bulkDeleteReports({
                        reports: allReports,
                        selfDMReport,
                        selectedTransactions,
                        currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                        currentUserAccountIDParam: accountID,
                        reportTransactions: validTransactions,
                        transactionsViolations,
                        bankAccountList,
                        transactions,
                        allReportNameValuePairs,
                    });
                }
                clearSelectedTransactions();
            });
        });
    }, [
        hash,
        showConfirmModal,
        deleteModalTitle,
        deleteModalPrompt,
        translate,
        allTransactions,
        allTransactionViolations,
        accountID,
        selectedTransactions,
        bankAccountList,
        clearSelectedTransactions,
        transactions,
        allReports,
        selfDMReport,
        currentUserPersonalDetails?.email,
        currentUserPersonalDetails?.accountID,
        isExpenseReportType,
        selectedReportIDs,
        allReportNameValuePairs,
    ]);

    const onBulkPaySelected = useCallback(
        (paymentMethod?: PaymentMethodType, additionalData?: BulkPaySelectionData) => {
            if (!hash) {
                return;
            }
            if (isOffline) {
                setIsOfflineModalVisible(true);
                return;
            }

            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return;
            }

            const selectedOptions = selectedReports.length ? selectedReports : Object.values(selectedTransactions);
            const expenseReportBankAccountID = additionalData?.bankAccountID;

            const restrictedPolicyID = getRestrictedPolicyID(selectedOptions, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed, policies);
            if (restrictedPolicyID) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedPolicyID));
                return;
            }

            const activeRoute = Navigation.getActiveRoute();

            for (const item of selectedOptions) {
                const itemPolicyID = item.policyID;
                const itemReportID = item.reportID;
                if (!itemReportID) {
                    return;
                }
                const itemReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${itemReportID}`];
                const isExpenseReport = isExpenseReportUtil(itemReportID);
                const isIOUReport = isIOUReportUtil(itemReportID);
                const reportType = getReportType(itemReportID);
                const lastPolicyPaymentMethod = paymentMethod ?? getLastPolicyPaymentMethod(itemPolicyID, personalPolicyID, lastPaymentMethods, reportType, isIOUReport);

                if (!lastPolicyPaymentMethod) {
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({
                            reportID: itemReportID,
                            backTo: activeRoute,
                        }),
                    );
                    return;
                }

                const reportTransactions = Object.values(allTransactions ?? {}).filter(
                    (transaction): transaction is NonNullable<typeof transaction> => !!transaction && transaction.reportID === itemReportID,
                );

                const hasPolicyVBBA = itemPolicyID ? policyIDsWithVBBA.includes(itemPolicyID) : false;
                // Allow bulk pay when user selected a business bank account, even if that account is not linked to the report's policy
                const hasSelectedBusinessBankAccount = expenseReportBankAccountID != null;

                if (isExpenseReport && lastPolicyPaymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && !hasPolicyVBBA && !hasSelectedBusinessBankAccount) {
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({
                            reportID: item.reportID,
                            backTo: activeRoute,
                        }),
                    );
                    return;
                }
                const isPolicyPaymentMethod = !Object.values(CONST.IOU.PAYMENT_TYPE).includes(lastPolicyPaymentMethod as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>);
                if (isPolicyPaymentMethod && isIOUReport) {
                    const adminPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${lastPolicyPaymentMethod}`];
                    if (!adminPolicy) {
                        Navigation.navigate(
                            ROUTES.SEARCH_REPORT.getRoute({
                                reportID: item.reportID,
                                backTo: activeRoute,
                            }),
                        );
                        return;
                    }
                    const invite = moveIOUReportToPolicyAndInviteSubmitter(itemReport, adminPolicy, formatPhoneNumber, policyExpenseChatReportActions, reportTransactions);
                    if (!invite?.policyExpenseChatReportID) {
                        moveIOUReportToPolicy(itemReport, adminPolicy, false, reportTransactions);
                    }
                }
            }
            const itemsToPay =
                selectedReports.length > 0
                    ? selectedReports.map((report) => ({
                          reportID: report.reportID,
                          amount: report.total,
                          policyID: report.policyID,
                          chatReportID: report.chatReportID,
                      }))
                    : Object.values(selectedTransactions).map((transaction) => ({
                          reportID: transaction.reportID,
                          amount: transaction.amount,
                          policyID: transaction.policyID,
                          chatReportID: transaction.reportID,
                      }));

            const paymentData = itemsToPay.map((item) => {
                const effectivePaymentType = paymentMethod ?? getLastPolicyPaymentMethod(item.policyID, personalPolicyID, lastPaymentMethods, undefined, isIOUReportUtil(item.reportID));
                return {
                    reportID: item.reportID,
                    amount: item.amount,
                    paymentType: effectivePaymentType,
                    ...(isInvoiceReport(item.reportID)
                        ? getPayMoneyOnSearchInvoiceParams(
                              item.policyID,
                              additionalData?.payAsBusiness ?? isBusinessInvoiceRoom(item.chatReportID),
                              additionalData?.bankAccountID ?? getLastPolicyBankAccountID(item.policyID, lastPaymentMethods),
                              CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                          )
                        : {}),
                    ...(isExpenseReportUtil(item.reportID) && effectivePaymentType === CONST.IOU.PAYMENT_TYPE.VBBA && expenseReportBankAccountID != null
                        ? {bankAccountID: expenseReportBankAccountID}
                        : {}),
                };
            }) as PaymentData[];

            payMoneyRequestOnSearch(hash, paymentData);

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                clearSelectedTransactions();
            });
        },
        [
            hash,
            isOffline,
            isDelegateAccessRestricted,
            selectedReports,
            selectedTransactions,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
            amountOwed,
            policies,
            showDelegateNoAccessModal,
            allReports,
            personalPolicyID,
            lastPaymentMethods,
            allTransactions,
            policyIDsWithVBBA,
            policyExpenseChatReportActions,
            formatPhoneNumber,
            clearSelectedTransactions,
        ],
    );

    const onBulkPaySelectedRef = useRef(onBulkPaySelected);
    useEffect(() => {
        onBulkPaySelectedRef.current = onBulkPaySelected;
    });
    const stableOnBulkPaySelected = useCallback((paymentMethod?: PaymentMethodType, additionalData?: BulkPaySelectionData) => {
        onBulkPaySelectedRef.current?.(paymentMethod, additionalData);
    }, []);

    const areAllTransactionsFromSubmitter = useMemo(() => {
        if (!currentUserPersonalDetails?.accountID) {
            return false;
        }

        const searchData = currentSearchResults?.data;
        const reports: Report[] = searchData
            ? Object.keys(searchData)
                  .filter((key) => key.startsWith(ONYXKEYS.COLLECTION.REPORT))
                  .map((key) => searchData[key as keyof typeof searchData] as Report)
                  .filter((report): report is Report => report != null && 'reportID' in report)
            : [];

        return (
            selectedTransactionReportIDs.length > 0 &&
            selectedTransactionReportIDs.every((id) => {
                return isCurrentUserSubmitter(getReportOrDraftReport(id, reports));
            })
        );
    }, [selectedTransactionReportIDs, currentUserPersonalDetails?.accountID, currentSearchResults?.data]);

    const duplicateHandlerRef = useRef<() => void>(() => {});
    const setDuplicateHandler = useCallback((handler: () => void) => {
        duplicateHandlerRef.current = handler;
    }, []);
    const invokeDuplicateHandler = useCallback(() => {
        duplicateHandlerRef.current();
    }, []);

    const activePolicyExpenseChat = useMemo(
        () => getPolicyExpenseChat(currentUserPersonalDetails.accountID, defaultExpensePolicy?.id),
        [currentUserPersonalDetails.accountID, defaultExpensePolicy?.id],
    );

    const isDuplicateOptionVisible = useMemo(
        () =>
            shouldShowBulkDuplicateOption({
                selectedTransactionsKeys,
                selectedTransactions,
                allTransactions,
                allReports,
                allTransactionViolations,
                allReportNameValuePairs,
                defaultExpensePolicyID: defaultExpensePolicy?.id,
                activePolicyExpenseChat,
                typeExpenseReport: isExpenseReportType,
                searchData: currentSearchResults?.data,
            }),
        [
            selectedTransactionsKeys,
            selectedTransactions,
            allTransactions,
            allReports,
            allTransactionViolations,
            allReportNameValuePairs,
            defaultExpensePolicy?.id,
            activePolicyExpenseChat,
            isExpenseReportType,
            currentSearchResults?.data,
        ],
    );

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return CONST.EMPTY_ARRAY as unknown as Array<DropdownOption<SearchHeaderOptionValue>>;
        }

        const allSelectedAreDeleted = selectedTransactionsKeys.length > 0 && selectedTransactionsKeys.every((id) => isDeletedTransaction(selectedTransactions[id] ?? {}));

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const isAnyTransactionOnHold = Object.values(selectedTransactions).some((transaction) => transaction.isHeld);

        const getExportOptions = () => {
            const areFullReportsSelected = selectedTransactionReportIDs.length === selectedReportIDs.length && selectedTransactionReportIDs.every((id) => selectedReportIDs.includes(id));
            const typeInvoice = queryJSON?.type === CONST.REPORT.TYPE.INVOICE;
            const typeExpense = queryJSON?.type === CONST.REPORT.TYPE.EXPENSE;
            const isAllOneTransactionReport = Object.values(selectedTransactions).every((transaction) => transaction.isFromOneTransactionReport);

            const includeReportLevelExport = ((isExpenseReportType || typeInvoice) && areFullReportsSelected) || (typeExpense && !isExpenseReportType && isAllOneTransactionReport);

            const policy = selectedPolicyIDs.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedPolicyIDs.at(0)}`] : undefined;
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, includeReportLevelExport);

            const exportOptions: PopoverMenuItem[] = [];

            const connectedIntegration = getConnectedIntegration(policy);
            const isReportsTab = isExpenseReportType;

            const canReportBeExported = (report: (typeof selectedReports)[0], exportOption: ValueOf<typeof CONST.REPORT.EXPORT_OPTIONS>) => {
                if (!report.reportID) {
                    return false;
                }

                const reportPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                const completeReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`];

                if (!completeReport) {
                    return false;
                }

                const reportExportOptions = getSecondaryExportReportActions(
                    currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    currentUserPersonalDetails?.login ?? '',
                    completeReport,
                    bankAccountList,
                    reportPolicy,
                );

                return reportExportOptions.includes(exportOption);
            };

            const canExportAllReportsToIntegration =
                isReportsTab &&
                selectedReportIDs.length > 0 &&
                includeReportLevelExport &&
                selectedReports.every((report) => canReportBeExported(report, CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION));
            const canMarkAllReportsAsExported =
                isReportsTab &&
                selectedReportIDs.length > 0 &&
                includeReportLevelExport &&
                selectedReports.every((report) => canReportBeExported(report, CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED));

            if (connectedIntegration) {
                const connectionNameFriendly = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectedIntegration];
                const integrationIcon = getIntegrationIcon(connectedIntegration, expensifyIcons);

                const handleExportAction = (exportAction: () => void) => {
                    const exportedReportNames: string[] = [];
                    let areAnyReportsExported = false;

                    for (const reportID of selectedReportIDs) {
                        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

                        if (!report?.pendingFields?.export && !report?.isExportedToIntegration) {
                            continue;
                        }

                        areAnyReportsExported = true;

                        if (report.reportName) {
                            exportedReportNames.push(report.reportName);
                        }
                    }

                    if (areAnyReportsExported) {
                        showConfirmModal({
                            title: translate('workspace.exportAgainModal.title'),
                            prompt: translate('workspace.exportAgainModal.description', {
                                connectionName: connectedIntegration,
                                reportName: exportedReportNames.join('\n'),
                            }),
                            confirmText: translate('workspace.exportAgainModal.confirmText'),
                            cancelText: translate('workspace.exportAgainModal.cancelText'),
                        }).then((result) => {
                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }

                            if (hash) {
                                clearSelectedTransactions();
                                exportAction();
                            }
                        });
                    } else if (hash) {
                        exportAction();
                        clearSelectedTransactions();
                    }
                };

                if (canExportAllReportsToIntegration) {
                    exportOptions.push({
                        text: connectionNameFriendly,
                        icon: integrationIcon,
                        onSelected: () => handleExportAction(() => exportToIntegrationOnSearch(hash, selectedReportIDs, connectedIntegration, currentSearchKey)),
                        shouldCloseModalOnSelect: true,
                        shouldCallAfterModalHide: true,
                        displayInDefaultIconColor: true,
                        additionalIconStyles: styles.integrationIcon,
                    });
                }

                if (canMarkAllReportsAsExported) {
                    exportOptions.push({
                        text: translate('workspace.common.markAsExported'),
                        icon: integrationIcon,
                        onSelected: () => handleExportAction(() => markAsManuallyExported(selectedReportIDs, connectedIntegration)),
                        shouldCloseModalOnSelect: true,
                        shouldCallAfterModalHide: true,
                        displayInDefaultIconColor: true,
                        additionalIconStyles: styles.integrationIcon,
                    });
                }
            }

            exportOptions.push({
                text: translate('export.basicExport'),
                icon: expensifyIcons.Table,
                onSelected: () => {
                    handleBasicExport();
                },
                shouldCloseModalOnSelect: true,
                shouldCallAfterModalHide: true,
            });

            for (const template of exportTemplates) {
                exportOptions.push({
                    text: template.name,
                    icon: expensifyIcons.Table,
                    description: template.description,
                    onSelected: () => {
                        beginExportWithTemplate(template.templateName, template.type, template.policyID);
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                });
            }

            return exportOptions;
        };

        const exportButtonOption: DropdownOption<SearchHeaderOptionValue> & Pick<PopoverMenuItem, 'rightIcon'> = {
            icon: expensifyIcons.Export,
            rightIcon: expensifyIcons.ArrowRight,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
            shouldCloseModalOnSelect: true,
            subMenuItems: getExportOptions(),
        };

        if (areAllMatchingItemsSelected) {
            return [exportButtonOption];
        }

        if (allSelectedAreDeleted) {
            const deletedTransactionOptions: Array<DropdownOption<SearchHeaderOptionValue>> = [
                {
                    icon: expensifyIcons.RotateLeft,
                    text: translate('search.bulkActions.undelete'),
                    value: CONST.SEARCH.BULK_ACTION_TYPES.UNDELETE,
                    shouldCloseModalOnSelect: true,
                    onSelected: () => {
                        const totalTransactionsInResults = Object.keys(currentSearchResults?.data ?? {}).filter((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)).length;
                        undeleteTransactions(selectedTransactionsKeys.map((id) => selectedTransactions[id]?.transaction).filter((t) => t !== undefined));
                        clearSelectedTransactions(undefined, selectedTransactionsKeys.length >= totalTransactionsInResults);
                    },
                },
                exportButtonOption,
            ];

            if (isDuplicateOptionVisible) {
                deletedTransactionOptions.push({
                    text: translate('search.bulkActions.duplicateExpense', {count: selectedTransactionsKeys.length}),
                    icon: expensifyIcons.ExpenseCopy,
                    value: CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE,
                    shouldCloseModalOnSelect: true,
                    onSelected: invokeDuplicateHandler,
                });
            }

            return deletedTransactionOptions;
        }

        const isExpenseReportSearch = isExpenseReportType || searchResults?.search.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
        const selectedTransactionsList = Object.values(selectedTransactions)
            .map((transaction) => transaction.transaction)
            .filter((transaction): transaction is Transaction => !!transaction);
        const canEditMultiple =
            canEditMultipleTransactions(selectedTransactionsList, allReportActions, allReports, policies, isExpenseReportSearch, searchResults?.data) && isBetaEnabled(CONST.BETAS.BULK_EDIT);

        if (canEditMultiple) {
            options.push({
                icon: expensifyIcons.Pencil,
                text: translate('search.bulkActions.editMultiple'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.EDIT,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    const selectedTransactionIDs = Object.keys(selectedTransactions).filter((transactionID) => {
                        const selectedTransaction = selectedTransactions[transactionID];
                        return !!selectedTransaction?.transaction?.transactionID || !!allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                    });
                    initBulkEditDraftTransaction(selectedTransactionIDs);
                    Navigation.navigate(ROUTES.SEARCH_EDIT_MULTIPLE_TRANSACTIONS_RHP);
                },
            });
        }

        const areSelectedTransactionsIncludedInReports = selectedTransactionsKeys.every((id) =>
            selectedTransactions[id].reportID ? selectedReportIDs.includes(selectedTransactions[id].reportID) : true,
        );
        const shouldShowApproveOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            areSelectedTransactionsIncludedInReports &&
            (selectedReports.length
                ? selectedReports.every((report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.APPROVE))
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.APPROVE));

        if (shouldShowApproveOption) {
            options.push({
                icon: expensifyIcons.ThumbsUp,
                text: translate('search.bulkActions.approve'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.APPROVE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    handleApproveWithDEWCheck();
                },
            });
        }

        const hasNoRejectedTransaction = selectedTransactionsKeys.every(
            (id) => !hasTransactionBeenRejected(allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + id] ?? []),
        );

        const shouldShowRejectOption =
            queryJSON?.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT &&
            !isOffline &&
            selectedTransactionsKeys.length > 0 &&
            selectedTransactionsKeys.every((id) => selectedTransactions[id].canReject) &&
            hasNoRejectedTransaction;

        if (shouldShowRejectOption) {
            options.push({
                icon: expensifyIcons.ThumbsDown,
                text: translate('search.bulkActions.reject'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.REJECT,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    if (dismissedRejectUseExplanation) {
                        Navigation.navigate(ROUTES.SEARCH_REJECT_REASON_RHP);
                    } else {
                        setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
                    }
                },
            });
        }

        const shouldShowChangeApproverOption =
            queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT &&
            !isAnyTransactionOnHold &&
            areSelectedTransactionsIncludedInReports &&
            selectedReports.length &&
            selectedReports.every((report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.CHANGE_APPROVER));

        if (shouldShowChangeApproverOption) {
            options.push({
                icon: expensifyIcons.Workflows,
                text: translate('iou.changeApprover.title'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_APPROVER,
                shouldCloseModalOnSelect: true,
                onSelected: () => Navigation.navigate(ROUTES.CHANGE_APPROVER_SEARCH_RHP),
            });
        }

        const shouldShowSubmitOption =
            !isOffline &&
            areSelectedTransactionsIncludedInReports &&
            (selectedReports.length
                ? selectedReports.every((report) => report.allActions.includes(CONST.SEARCH.ACTION_TYPES.SUBMIT))
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.SUBMIT));

        if (shouldShowSubmitOption) {
            options.push({
                icon: expensifyIcons.Send,
                text: translate('common.submit'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const itemList = !selectedReports.length ? Object.values(selectedTransactions).map((transaction) => transaction) : (selectedReports?.filter((report) => !!report) ?? []);

                    const restrictedPolicyID = getRestrictedPolicyID(itemList, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed, policies);
                    if (restrictedPolicyID) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedPolicyID));
                        return;
                    }

                    for (const item of itemList) {
                        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`];
                        if (policy) {
                            submitMoneyRequestOnSearch(hash, [item as Report], [policy]);
                        }
                    }
                    clearSelectedTransactions();
                },
            });
        }
        const {shouldEnableBulkPayOption, isFirstTimePayment} = getPayOption(selectedReports, selectedTransactions, lastPaymentMethods, selectedReportIDs, personalPolicyID);

        const shouldShowPayOption = !isOffline && !isAnyTransactionOnHold && shouldEnableBulkPayOption;

        if (shouldShowPayOption) {
            const hasMultipleBusinessBankAccounts = (businessBankAccountOptions?.length ?? 0) > 1;
            const shouldShowPaySubmenu = isFirstTimePayment || (shouldShowBusinessBankAccountOptions && hasMultipleBusinessBankAccounts);

            const payButtonOption = {
                icon: expensifyIcons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                backButtonText: shouldShowPaySubmenu ? translate('search.bulkActions.pay') : undefined,
                rightIcon: shouldShowPaySubmenu ? expensifyIcons.ArrowRight : undefined,
                value: CONST.SEARCH.BULK_ACTION_TYPES.PAY,
                shouldCloseModalOnSelect: true,
                subMenuItems: shouldShowPaySubmenu ? bulkPayButtonOptions : undefined,
                onSelected: () => onBulkPaySelected(undefined),
            };
            options.push(payButtonOption);
        }

        options.push(exportButtonOption);

        const shouldShowHoldOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canHold);

        if (shouldShowHoldOption) {
            options.push({
                icon: expensifyIcons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    const isDismissed = areAllTransactionsFromSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;

                    if (isDismissed) {
                        navigateToSearchRHP(ROUTES.TRANSACTION_HOLD_REASON_SEARCH, ROUTES.TRANSACTION_HOLD_REASON_RHP);
                    } else if (areAllTransactionsFromSubmitter) {
                        setIsHoldEducationalModalVisible(true);
                    } else {
                        setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                    }
                },
            });
        }

        const shouldShowUnholdOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canUnhold);

        if (shouldShowUnholdOption) {
            options.push({
                icon: expensifyIcons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    for (const transactionID of selectedTransactionsKeys) {
                        if (!selectedTransactions[transactionID].reportAction?.childReportID) {
                            continue;
                        }
                        unholdRequest(
                            transactionID,
                            selectedTransactions[transactionID].reportAction?.childReportID,
                            policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedTransactions[transactionID].policyID}`],
                            isOffline,
                        );
                    }
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        clearSelectedTransactions();
                    });
                },
            });
        }

        if (selectedTransactionsKeys.length < 3 && searchResults?.search.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT && searchResults?.data) {
            const {transactions: searchedTransactions, reports, policies: transactionPolicies} = getTransactionsAndReportsFromSearch(searchResults, selectedTransactionsKeys);

            if (isMergeActionForSelectedTransactions(searchedTransactions, reports, transactionPolicies, currentUserPersonalDetails.accountID)) {
                const transactionID = searchedTransactions.at(0)?.transactionID;
                if (transactionID) {
                    options.push({
                        text: translate('common.merge'),
                        icon: expensifyIcons.ArrowCollapse,
                        value: CONST.SEARCH.BULK_ACTION_TYPES.MERGE,
                        onSelected: () => setupMergeTransactionDataAndNavigate(transactionID, searchedTransactions, localeCompare, getCurrencyDecimals, reports, false, true),
                    });
                }
            }
        }

        const ownerAccountIDs = new Set<number>();
        let hasUnknownOwner = false;
        for (const id of selectedTransactionsKeys) {
            const transactionEntry = selectedTransactions[id];
            if (!transactionEntry) {
                continue;
            }
            const ownerAccountID = transactionEntry.ownerAccountID ?? getReportOrDraftReport(transactionEntry.reportID)?.ownerAccountID;
            if (typeof ownerAccountID === 'number') {
                ownerAccountIDs.add(ownerAccountID);
                if (ownerAccountIDs.size > 1) {
                    break;
                }
            } else {
                hasUnknownOwner = true;
            }
        }
        const hasMultipleOwners = ownerAccountIDs.size > 1 || (hasUnknownOwner && (ownerAccountIDs.size > 0 || selectedTransactionsKeys.length > 1));

        const canAllTransactionsBeMoved = selectedTransactionsKeys.every((id) => selectedTransactions[id].canChangeReport);

        if (canAllTransactionsBeMoved && !hasMultipleOwners && !isExpenseReportType) {
            options.push({
                text: translate('iou.moveExpenses'),
                icon: expensifyIcons.DocumentMerge,
                value: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT,
                shouldCloseModalOnSelect: true,
                onSelected: () => Navigation.navigate(ROUTES.MOVE_TRANSACTIONS_SEARCH_RHP.getRoute()),
            });
        }

        const firstTransactionKey = selectedTransactionsKeys.at(0);
        const firstTransactionMeta = firstTransactionKey ? selectedTransactions[firstTransactionKey] : undefined;

        const isSplittable = !!firstTransactionMeta?.canSplit;
        const isAlreadySplit = !!firstTransactionMeta?.hasBeenSplit;

        const canSplitTransaction = selectedTransactionsKeys.length === 1 && !isAlreadySplit && isSplittable;

        if (canSplitTransaction) {
            options.push({
                text: translate('iou.split'),
                icon: expensifyIcons.ArrowSplit,
                value: CONST.SEARCH.BULK_ACTION_TYPES.SPLIT,
                onSelected: () => {
                    initSplitExpense(firstTransaction, firstTransactionPolicy);
                },
            });
        }

        if (isDuplicateOptionVisible) {
            const exceedsBulkDuplicateLimit = selectedTransactionsKeys.length > CONST.SEARCH.BULK_DUPLICATE_LIMIT;
            options.push({
                text: translate('search.bulkActions.duplicateExpense', {count: selectedTransactionsKeys.length}),
                icon: expensifyIcons.ExpenseCopy,
                value: CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (exceedsBulkDuplicateLimit) {
                        showConfirmModal({
                            title: translate('common.duplicateExpense'),
                            prompt: translate('iou.bulkDuplicateLimit'),
                            confirmText: translate('common.buttonConfirm'),
                            shouldShowCancelButton: false,
                        });
                        return;
                    }
                    invokeDuplicateHandler();
                },
            });
        }

        if (shouldShowDeleteOption(selectedTransactions, currentSearchResults?.data, selectedReports, queryJSON?.type)) {
            options.push({
                icon: expensifyIcons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    handleDeleteSelectedTransactions();
                },
            });
        }

        if (options.length === 0) {
            const emptyOptionStyle = {
                interactive: false,
                iconFill: theme.icon,
                iconHeight: variables.iconSizeLarge,
                iconWidth: variables.iconSizeLarge,
                numberOfLinesTitle: 2,
                titleStyle: {...styles.colorMuted, ...styles.fontWeightNormal, ...styles.textWrap},
            };

            options.push({
                icon: expensifyIcons.Exclamation,
                text: translate('search.bulkActions.noOptionsAvailable'),
                value: undefined,
                ...emptyOptionStyle,
            });
        }

        return options;
    }, [
        selectedTransactionsKeys,
        status,
        hash,
        selectedTransactions,
        queryJSON?.type,
        expensifyIcons,
        translate,
        areAllMatchingItemsSelected,
        isOffline,
        selectedReports,
        lastPaymentMethods,
        selectedReportIDs,
        personalPolicyID,
        searchResults,
        currentSearchResults?.data,
        selectedTransactionReportIDs,
        selectedPolicyIDs,
        policies,
        allReportActions,
        integrationsExportTemplates,
        csvExportLayouts,
        allReports,
        currentUserPersonalDetails.accountID,
        currentUserPersonalDetails?.login,
        bankAccountList,
        styles.integrationIcon,
        styles.textWrap,
        showConfirmModal,
        clearSelectedTransactions,
        handleBasicExport,
        beginExportWithTemplate,
        handleApproveWithDEWCheck,
        allTransactionViolations,
        isDelegateAccessRestricted,
        dismissedRejectUseExplanation,
        showDelegateNoAccessModal,
        bulkPayButtonOptions,
        businessBankAccountOptions?.length,
        shouldShowBusinessBankAccountOptions,
        onBulkPaySelected,
        areAllTransactionsFromSubmitter,
        dismissedHoldUseExplanation,
        localeCompare,
        firstTransaction,
        firstTransactionPolicy,
        isDuplicateOptionVisible,
        invokeDuplicateHandler,
        isExpenseReportType,
        handleDeleteSelectedTransactions,
        undeleteTransactions,
        currentUserPersonalDetails?.email,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        currentSearchKey,
        getCurrencyDecimals,
        amountOwed,
        allTransactions,
        isBetaEnabled,
        shouldShowBusinessBankAccountOptions,
    ]);

    const handleOfflineModalClose = useCallback(() => {
        setIsOfflineModalVisible(false);
    }, [setIsOfflineModalVisible]);

    const handleDownloadErrorModalClose = useCallback(() => {
        setIsDownloadErrorModalVisible(false);
    }, [setIsDownloadErrorModalVisible]);

    const dismissModalAndUpdateUseHold = useCallback(() => {
        setIsHoldEducationalModalVisible(false);
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !isOffline);
        if (hash && selectedTransactionsKeys.length > 0) {
            navigateToSearchRHP(ROUTES.TRANSACTION_HOLD_REASON_SEARCH, ROUTES.TRANSACTION_HOLD_REASON_RHP);
        }
    }, [hash, selectedTransactionsKeys.length, isOffline]);

    const dismissRejectModalBasedOnAction = useCallback(() => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (hash && selectedTransactionsKeys.length > 0) {
                navigateToSearchRHP(ROUTES.TRANSACTION_HOLD_REASON_SEARCH, ROUTES.TRANSACTION_HOLD_REASON_RHP);
            }
        } else {
            dismissRejectUseExplanation();
            Navigation.navigate(ROUTES.SEARCH_REJECT_REASON_RHP);
        }
        setRejectModalAction(null);
    }, [rejectModalAction, hash, selectedTransactionsKeys.length]);

    return {
        headerButtonsOptions,
        selectedPolicyIDs,
        selectedTransactionReportIDs,
        selectedReportIDs,
        businessBankAccountOptions,
        confirmPayment: stableOnBulkPaySelected,
        isOfflineModalVisible,
        isDownloadErrorModalVisible,
        isHoldEducationalModalVisible,
        rejectModalAction,
        emptyReportsCount,
        handleOfflineModalClose,
        handleDownloadErrorModalClose,
        dismissModalAndUpdateUseHold,
        dismissRejectModalBasedOnAction,
        isDuplicateOptionVisible,
        setDuplicateHandler,
        allTransactions,
        allReports,
        searchData: currentSearchResults?.data,
    };
}

export default useSearchBulkActions;
export {shouldShowBulkDuplicateOption};
export type {ShouldShowBulkDuplicateParams};
