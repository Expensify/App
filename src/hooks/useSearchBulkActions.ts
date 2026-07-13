import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useOpenSearchReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {BulkPaySelectionData, PaymentData, SearchColumnType, SearchFilterKey, SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import {exportReportsToPDF} from '@libs/actions/Export';
import {unholdRequest} from '@libs/actions/IOU/Hold';
import {payInvoice, payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import {approveMoneyRequest} from '@libs/actions/IOU/ReportWorkflow';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {deleteAppReport, exportReportToPDF, markAsManuallyExported, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import {
    exportSearchItemsToCSV,
    exportToIntegrationOnSearch,
    getExportTemplates,
    getLastPolicyBankAccountID,
    getLastPolicyPaymentMethod,
    getPayMoneyOnSearchInvoiceParams,
    getPayOption,
    getPolicyFromSearchSnapshot,
    getReportFromSearchSnapshot,
    getReportType,
    getSearchApproveOnyxData,
    getSearchPayOnyxData,
    getTotalFormattedAmount,
    isCurrencySupportWalletBulkPay,
    queueExportSearchItemsToCSV,
    queueExportSearchWithTemplate,
    resolveSearchPayPaymentMethod,
    submitMoneyRequestOnSearch,
} from '@libs/actions/Search';
import initSplitExpense from '@libs/actions/SplitExpenses';
import {setNameValuePair} from '@libs/actions/User';
import {getTransactionsAndReportsFromSearch} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getConnectedIntegration, isSubmitPolicy} from '@libs/PolicyUtils';
import {getSecondaryExportReportActions, isMergeActionForSelectedTransactions} from '@libs/ReportSecondaryActionUtils';
import {
    canEditMultipleTransactions,
    getAllPolicyExpenseChatReportActions,
    getIntegrationIcon,
    getPolicyExpenseChat,
    getReportOrDraftReport,
    hasViolations as hasViolationsReportUtils,
    isArchivedReport,
    isBusinessInvoiceRoom,
    isCurrentUserSubmitter,
    isDM,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom,
    isInvoiceReport,
    isIOUReport as isIOUReportUtil,
    isSelfDM,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildSearchQueryString, isDefaultExpensesQuery, serializeQueryJSONForBackend} from '@libs/SearchQueryUtils';
import {getColumnsToShow, getSearchColumnTranslationKey, getSelectedGroupFilterEntry, getValidGroupBy, navigateToSearchRHP, shouldShowDeleteOption} from '@libs/SearchUIUtils';
import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';
import playSound, {SOUNDS} from '@libs/Sound';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {
    getDeleteConfirmationPrompt,
    getDeleteExpenseTitle,
    getOriginalTransactionWithSplitInfo,
    hasCustomUnitOutOfPolicyViolation,
    hasOnlyPendingCardTransactions,
    hasTransactionBeenRejected,
    isDeletedTransaction,
    isDistanceRequest,
    isManagedCardTransaction,
    isPending,
    isPerDiemRequest,
    isScanning,
    showPendingCardTransactionsBlockModal,
} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import {initBulkEditDraftTransaction} from '@userActions/IOU/BulkEdit';
import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';
import {canIOUBePaid} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import {doesPersonalDetailExistSelector} from '@src/selectors/PersonalDetails';
import type {BillingGraceEndPeriod, Policy, Report, ReportAction, ReportNameValuePairs, SearchResults, Transaction, TransactionViolations} from '@src/types/onyx';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

/* eslint-disable react-hooks/refs -- Refs in this hook are used inside callbacks that capture stable references; the lint rule flags false positives for these patterns */
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import useAllTransactions from './useAllTransactions';
import useBulkPayOptions from './useBulkPayOptions';
import useConfirmModal from './useConfirmModal';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useDeleteTransactions from './useDeleteTransactions';
import useDuplicateTransactionsAndViolations from './useDuplicateTransactionsAndViolations';
import useEnvironment from './useEnvironment';
import useExportDownloadStatusModal from './useExportDownloadStatusModal';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import {getParticipantsInvoiceReport} from './useParticipantsInvoiceReport';
import usePaymentContext from './usePaymentContext';
import usePermissions from './usePermissions';
import usePersonalPolicy from './usePersonalPolicy';
import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';
import useRestrictedActionPolicyID from './useRestrictedActionPolicyID';
import useSelfDMReport from './useSelfDMReport';
import useSplitEffectivePolicy from './useSplitEffectivePolicy';
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
    currentUserAccountID: number,
): string | undefined {
    return items
        .map((item) => item.policyID)
        .find(
            (policyID): policyID is string =>
                !!policyID &&
                shouldRestrictUserBillableActions(
                    allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],
                    ownerBillingGracePeriodEnd,
                    billingGracePeriods,
                    amountOwed,
                    currentUserAccountID,
                ),
        );
}

function addSelectedGroupsFilter(queryJSON: SearchQueryJSON, selectedTransactions: SelectedTransactions, searchData: SearchResultDataType | undefined): SearchQueryJSON {
    const {groupBy} = queryJSON;
    if (!groupBy || !searchData) {
        return queryJSON;
    }

    const groupKeys = new Set<string>();
    for (const [key, value] of Object.entries(selectedTransactions)) {
        if (key.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
            groupKeys.add(key);
        } else if (value.groupKey) {
            groupKeys.add(value.groupKey);
        }
    }

    if (groupKeys.size === 0) {
        return queryJSON;
    }

    const filterEntries: Array<{key: SearchFilterKey; value: string | number}> = [];
    for (const key of groupKeys) {
        const group = searchData[key as keyof SearchResultDataType];
        if (!group) {
            continue;
        }
        const entry = getSelectedGroupFilterEntry(groupBy, group);
        if (entry) {
            filterEntries.push(entry);
        }
    }

    if (filterEntries.length === 0) {
        return queryJSON;
    }

    const filterKey = filterEntries.at(0)?.key;
    if (!filterKey) {
        return queryJSON;
    }
    const newFlatFilters = queryJSON.flatFilters.filter((filter) => filter.key !== filterKey);
    newFlatFilters.push({
        key: filterKey,
        filters: filterEntries.map((e) => ({operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: e.value})),
    });

    return buildSearchQueryJSON(buildSearchQueryString({...queryJSON, flatFilters: newFlatFilters})) ?? queryJSON;
}

type ShouldShowBulkDuplicateParams = {
    selectedTransactionsKeys: string[];
    selectedTransactions: Record<string, {reportID?: string; transaction?: Transaction}>;
    allTransactions: OnyxCollection<Transaction> | undefined;
    allReports: OnyxCollection<Report> | undefined;
    allTransactionViolations: OnyxCollection<TransactionViolations> | undefined;
    allReportNameValuePairs: OnyxCollection<ReportNameValuePairs> | undefined;
    defaultExpensePolicyID: string | undefined;
    activePolicyExpenseChat: Report | undefined;
    typeExpenseReport: boolean;
    searchData: Record<string, unknown> | undefined;
};

function areIncludedSubmitPolicyTransactions(selectedTransactions: SelectedTransactions, selectedReports: SelectedReports[], allPolicies: OnyxCollection<Policy>): boolean {
    return selectedReports.length > 0
        ? selectedReports.some((report) => isSubmitPolicy(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`]))
        : Object.values(selectedTransactions).some((transaction) => isSubmitPolicy(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${transaction.policyID}`]));
}

function getAllTransactionsForDuplicate({
    selectedTransactionsKeys,
    selectedTransactions,
    allTransactions,
}: Pick<ShouldShowBulkDuplicateParams, 'selectedTransactionsKeys' | 'selectedTransactions' | 'allTransactions'>): NonNullable<OnyxCollection<Transaction>> {
    let missingSelectedTransactions: NonNullable<OnyxCollection<Transaction>> | undefined;

    for (const id of selectedTransactionsKeys) {
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`;
        if (allTransactions?.[transactionKey]) {
            continue;
        }

        const transaction = selectedTransactions[id]?.transaction;
        if (!transaction) {
            continue;
        }

        missingSelectedTransactions = missingSelectedTransactions ?? {};
        missingSelectedTransactions[transactionKey] = transaction;
    }

    if (!missingSelectedTransactions) {
        return allTransactions ?? {};
    }

    return {
        ...(allTransactions ?? {}),
        ...missingSelectedTransactions,
    };
}

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

    const allTransactionsForDuplicate = getAllTransactionsForDuplicate({selectedTransactionsKeys, selectedTransactions, allTransactions});

    return selectedTransactionsKeys.every((id) => {
        const transaction = allTransactionsForDuplicate[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
        if (!transaction || isManagedCardTransaction(transaction) || isScanning(transaction)) {
            return false;
        }

        const dates = transaction?.comment?.customUnit?.attributes?.dates;
        if (isPerDiemRequest(transaction) && (!dates?.start || !dates?.end)) {
            return false;
        }

        const reportID = selectedTransactions[id]?.reportID;
        const submitterReport = reportID ? getReportOrDraftReport(reportID, searchReports, undefined, undefined, allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]) : undefined;
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

function getChatReportForBulkPay(
    iouReport: Report,
    chatReportID: string | undefined,
    searchData: SearchResultDataType | undefined,
    allReports: OnyxCollection<Report> | undefined,
): OnyxEntry<Report> {
    const resolvedChatReportID = chatReportID ?? iouReport.chatReportID ?? iouReport.parentReportID;
    if (!resolvedChatReportID) {
        return undefined;
    }

    return getReportFromSearchSnapshot(resolvedChatReportID, searchData, allReports) ?? getReportOrDraftReport(resolvedChatReportID);
}

function useSearchBulkActions({queryJSON}: UseSearchBulkActionsParams) {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {selectedTransactions, selectedReports, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchKey} = useSearchQueryContext();
    const {clearSelectedTransactions, selectAllMatchingItems} = useSearchSelectionActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {accountID, email, login: currentUserLogin, localCurrencyCode} = currentUserPersonalDetails;
    const {introSelected, betas, isSelfTourViewed, activePolicyID, activePolicy, defaultWorkspaceName, userBillingGracePeriodEnds, amountOwed, ownerBillingGracePeriodEnd, delegateEmail} =
        usePaymentContext();
    const allTransactions = useAllTransactions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const selfDMReport = useSelfDMReport();
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const {isBetaEnabled} = usePermissions();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);

    const defaultExpensePolicy = useDefaultExpensePolicy();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
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
    const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
    const [pdfReportID, setPdfReportID] = useState<string | undefined>(undefined);
    const {showConfirmModal} = useConfirmModal();
    const openSearchReportSubmitToPopover = useOpenSearchReportSubmitToPopover();
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);

    const [emptyReportsCount, setEmptyReportsCount] = useState<number>(0);
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal(() => {
        selectAllMatchingItems(false);
        clearSelectedTransactions(undefined, true);
    });

    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const isExpenseReportType = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Download',
        'Export',
        'Table',
        'TablePencil',
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
        'ReportCopy',
        'RotateLeft',
        'QBOSquare',
        'XeroSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'RilletSquare',
        'GustoSquare',
        'Pencil',
        'Workflows',
    ]);

    const {getCurrencyDecimals, convertToDisplayString} = useCurrencyListActions();

    const selectedTransactionReportIDs = useMemo(
        () => [
            ...new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction.reportID)
                    .filter((reportID): reportID is string => reportID !== undefined && reportID !== CONST.REPORT.UNREPORTED_REPORT_ID && reportID !== CONST.REPORT.TRASH_REPORT_ID),
            ),
        ],
        [selectedTransactions],
    );
    const selectedReportIDs = Object.values(selectedReports)
        .map((report) => report.reportID)
        .filter((reportID) => reportID !== undefined);
    const isCurrencySupportedBulkWallet = isCurrencySupportWalletBulkPay(selectedReports, selectedTransactions);

    const doSelectedItemsBelongToSubmitPolicy = useMemo(() => {
        const selectedItems = selectedReports.length > 0 ? selectedReports : Object.values(selectedTransactions);
        if (selectedItems.length === 0) {
            return false;
        }

        return selectedItems.some((item) => {
            const policy = item.policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`] : undefined;
            return isSubmitPolicy(policy);
        });
    }, [selectedReports, selectedTransactions, policies]);

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
    const totalFormattedAmount = getTotalFormattedAmount(convertToDisplayString, selectedReports, selectedTransactions, selectedBulkCurrency);

    const onlyShowPayElsewhere = useMemo(() => {
        const selectedCurrencies = [...selectedReports.map((report) => report.currency), ...Object.values(selectedTransactions).map((transaction) => transaction.currency)].filter(Boolean);
        if (new Set(selectedCurrencies).size > 1) {
            return true;
        }

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
                !canIOUBePaid(
                    report,
                    chatReport,
                    selectedPolicy,
                    bankAccountList,
                    currentUserPersonalDetails?.login ?? '',
                    currentUserPersonalDetails.accountID,
                    undefined,
                    false,
                    undefined,
                    invoiceReceiverPolicy,
                ) &&
                canIOUBePaid(
                    report,
                    chatReport,
                    selectedPolicy,
                    bankAccountList,
                    currentUserPersonalDetails?.login ?? '',
                    currentUserPersonalDetails.accountID,
                    undefined,
                    true,
                    undefined,
                    invoiceReceiverPolicy,
                )
            );
        });
    }, [
        selectedPolicyIDs,
        currentSearchResults?.data,
        selectedTransactionReportIDs,
        selectedReportIDs,
        bankAccountList,
        selectedReports,
        selectedTransactions,
        currentUserPersonalDetails?.login,
        currentUserPersonalDetails.accountID,
    ]);

    const {bulkPayButtonOptions, businessBankAccountOptions} = useBulkPayOptions({
        selectedPolicyID: selectedPolicyIDs.at(0),
        selectedReportID: selectedTransactionReportIDs.at(0) ?? selectedReportIDs.at(0),
        isCurrencySupportedWallet: isCurrencySupportedBulkWallet,
        currency: selectedBulkCurrency,
        formattedAmount: totalFormattedAmount,
        onlyShowPayElsewhere,
    });

    const {hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const firstTransactionID = selectedTransactionsKeys.at(0);
    const firstTransaction =
        (firstTransactionID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransactionID}`] : undefined) ??
        (firstTransactionID ? allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransactionID}`] : undefined);
    const [firstTransactionFetchedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${firstTransaction?.reportID}`);
    const isFirstTransactionUnreported = firstTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const firstTransactionReport = firstTransactionFetchedReport ?? (isFirstTransactionUnreported ? selfDMReport : undefined);
    const [firstTransactionPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${firstTransactionReport?.policyID}`);
    const splitEffectivePolicy = useSplitEffectivePolicy(firstTransactionReport, undefined, firstTransaction);
    const personalPolicy = usePersonalPolicy();
    const restrictedActionPolicyID = useRestrictedActionPolicyID(firstTransactionPolicy);

    // Use the split-aware delete hook for bulk transaction deletion so split children trigger
    // updateSplitTransactions (with reverse-split when only one sibling is left), instead of plain
    // deleteMoneyRequest which would just remove the child and break the split state.
    const flattenedReportActions = useMemo(() => {
        const fromOnyx = Object.values(allReportActions ?? {}).flatMap((reportActions) => Object.values(reportActions ?? {}));
        // Also include actions from the search snapshot. SearchBulkActionsButton is rendered
        // outside SearchScopeProvider so useOnyx does not redirect to the snapshot automatically.
        // Without this, IOU actions for unreported expenses (stored in the selfDM report) are
        // absent from the Onyx collection, causing deleteTransactions to silently skip all deletions.
        const searchData = currentSearchResults?.data;
        if (!searchData) {
            return fromOnyx;
        }
        const fromSnapshot = Object.keys(searchData)
            .filter((key): key is `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}` => key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS))
            .flatMap((key) => Object.values(searchData[key] ?? {}));
        // Merge — real Onyx wins on conflict (real-time updates take precedence over snapshot)
        const merged = new Map<string, ReportAction>();
        for (const action of [...fromSnapshot, ...fromOnyx]) {
            if (action?.reportActionID) {
                merged.set(action.reportActionID, action);
            }
        }
        return Array.from(merged.values());
    }, [allReportActions, currentSearchResults?.data]);
    const {deleteTransactions: deleteTransactionsFromHook, shouldOpenSplitExpenseEditFlowOnDelete} = useDeleteTransactions({
        report: selfDMReport,
        reportActions: flattenedReportActions,
        policy: firstTransactionPolicy,
    });
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(selectedTransactionsKeys);

    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, policyID: string | undefined, exportName: string) => {
            const emptyReports =
                selectedReports?.filter((selectedReport) => {
                    if (!selectedReport) {
                        return false;
                    }
                    const fullReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];
                    return !!fullReport && (fullReport.transactionCount ?? 0) === 0;
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
            const serializedQuery = queryJSON ? serializeQueryJSONForBackend(queryJSON) : JSON.stringify(queryJSON);
            let exportID: string;

            if (areAllMatchingItemsSelected) {
                exportID = queueExportSearchWithTemplate(
                    {
                        templateName,
                        templateType,
                        jsonQuery: serializedQuery,
                        reportIDList: [],
                        transactionIDList: [],
                        policyID,
                        exportName,
                    },
                    true,
                );
            } else {
                const isGroupExport = !!queryJSON?.groupBy && selectedTransactionsKeys.some((key) => key.startsWith(CONST.SEARCH.GROUP_PREFIX));
                exportID = queueExportSearchWithTemplate(
                    {
                        templateName,
                        templateType,
                        jsonQuery: isGroupExport ? serializeQueryJSONForBackend(addSelectedGroupsFilter(queryJSON, selectedTransactions, currentSearchResults?.data)) : '{}',
                        reportIDList: isGroupExport ? [] : selectedTransactionReportIDs,
                        transactionIDList: isGroupExport ? [] : selectedTransactionsKeys,
                        policyID,
                        exportName,
                    },
                    true,
                );
            }
            trackExport(exportID);
        },
        [
            selectedReports,
            selectedTransactions,
            isOffline,
            areAllMatchingItemsSelected,
            currentSearchResults?.data,
            queryJSON,
            selectedTransactionReportIDs,
            selectedTransactionsKeys,
            trackExport,
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

    const exportSearchData = searchResults?.data;
    const exportSearchType = searchResults?.search.type ?? queryJSON?.type;

    const getCSVExportParameters = useCallback(
        (isBasicExport: boolean, queryJSONToExport: SearchQueryJSON | undefined) => {
            const columnsToExport = getColumnsToShow({
                currentAccountID: accountID,
                data: exportSearchData ?? {},
                visibleColumns,
                type: exportSearchType,
                groupBy: getValidGroupBy(queryJSON?.groupBy),
                shouldUseStrictDefaultExpenseColumns: currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && !!queryJSON && isDefaultExpensesQuery(queryJSON),
                fallbackPolicyID: policyForMovingExpensesID,
            });

            const exportColumnLabels: Partial<Record<SearchColumnType, string>> = {};
            for (const column of columnsToExport) {
                exportColumnLabels[column] = translate(getSearchColumnTranslationKey(column));
            }

            const jsonQuery = queryJSONToExport ? serializeQueryJSONForBackend({...queryJSONToExport, columns: columnsToExport}) : (JSON.stringify(queryJSONToExport) ?? '');

            return {
                jsonQuery,
                isBasicExport,
                exportColumnLabels: JSON.stringify(exportColumnLabels),
            };
        },
        [accountID, currentSearchKey, exportSearchData, exportSearchType, policyForMovingExpensesID, queryJSON, translate, visibleColumns],
    );

    const handleCSVExport = useCallback(
        async (isBasicExport: boolean) => {
            if (isOffline) {
                setIsOfflineModalVisible(true);
                return;
            }

            const exportName = translate(isBasicExport ? 'export.basicExport' : 'export.currentView');

            if (areAllMatchingItemsSelected) {
                if (selectedTransactionsKeys.length === 0 || !hash) {
                    return;
                }
                const reportIDList = selectedReports?.map((report) => report?.reportID).filter((reportID) => reportID !== undefined) ?? [];
                const exportParameters = getCSVExportParameters(isBasicExport, queryJSON);
                const exportID = queueExportSearchItemsToCSV({
                    jsonQuery: exportParameters.jsonQuery,
                    reportIDList,
                    transactionIDList: selectedTransactionsKeys,
                    isBasicExport: exportParameters.isBasicExport,
                    exportColumnLabels: exportParameters.exportColumnLabels,
                    exportName,
                });
                trackExport(exportID);
                return;
            }

            const isGroupExport = !!queryJSON?.groupBy && selectedTransactionsKeys.some((key) => key.startsWith(CONST.SEARCH.GROUP_PREFIX));
            let didFail = false;
            const reportIDList = selectedReports.length > 0 ? selectedReportIDs : selectedTransactionReportIDs;
            const queryJSONToExport = isGroupExport && queryJSON ? addSelectedGroupsFilter(queryJSON, selectedTransactions, currentSearchResults?.data) : queryJSON;
            const exportParameters = getCSVExportParameters(isBasicExport, queryJSONToExport);
            await exportSearchItemsToCSV(
                {
                    jsonQuery: exportParameters.jsonQuery,
                    reportIDList: isGroupExport ? [] : reportIDList,
                    transactionIDList: isGroupExport ? [] : selectedTransactionsKeys,
                    isBasicExport: exportParameters.isBasicExport,
                    exportColumnLabels: exportParameters.exportColumnLabels,
                    exportName,
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
        },
        [
            isOffline,
            areAllMatchingItemsSelected,
            queryJSON,
            selectedReports,
            selectedReportIDs,
            selectedTransactionReportIDs,
            selectedTransactions,
            selectedTransactionsKeys,
            translate,
            clearSelectedTransactions,
            hash,
            currentSearchResults?.data,
            getCSVExportParameters,
            trackExport,
        ],
    );

    const handleBasicExport = useCallback(() => handleCSVExport(true), [handleCSVExport]);
    const handleExportCurrentView = useCallback(() => handleCSVExport(false), [handleCSVExport]);

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

        const restrictedPolicyID = getRestrictedPolicyID(selectedItems, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed, policies, accountID);
        if (restrictedPolicyID) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedPolicyID));
            return;
        }

        const reportIDList = !selectedReports.length
            ? Object.values(selectedTransactions).map((transaction) => transaction.reportID)
            : (selectedReports?.filter((report) => !!report).map((report) => report.reportID) ?? []);
        const uniqueReportIDs = [...new Set(reportIDList.filter((reportID): reportID is string => reportID !== undefined))];
        const searchData = searchResults?.data;
        const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

        let approvedReportCount = 0;
        for (const reportID of uniqueReportIDs) {
            const expenseReport = getReportFromSearchSnapshot(reportID, searchData, allReports);
            if (!expenseReport) {
                continue;
            }

            const reportPolicy = getPolicyFromSearchSnapshot(expenseReport.policyID, searchData, policies);
            const nextStep = allNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`];
            const hasViolations = hasViolationsReportUtils(reportID, allTransactionViolations, accountID, email ?? '');
            const policyToUpgrade = reportPolicy;
            const wouldNavigateToUpgrade = isSubmitPolicy(policyToUpgrade) && !!policyToUpgrade?.id;
            const wouldNavigateToRestricted =
                !!expenseReport.policyID && shouldRestrictUserBillableActions(reportPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID);

            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: reportPolicy,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                hasViolations,
                isASAPSubmitBetaEnabled,
                expenseReportCurrentNextStepDeprecated: nextStep,
                betas,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                ownerLogin: getLoginByAccountID(expenseReport.ownerAccountID, personalDetails),
                delegateEmail,
                full: true,
                additionalOnyxData: getSearchApproveOnyxData(hash, reportID, currentSearchKey),
                shouldPlaySuccessSound: false,
            });

            if (!wouldNavigateToUpgrade && !wouldNavigateToRestricted) {
                approvedReportCount += 1;
            }
        }

        if (approvedReportCount > 0) {
            playSound(SOUNDS.SUCCESS);
            TransitionTracker.runAfterTransitions({
                callback: () => {
                    clearSelectedTransactions();
                },
            });
        }
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
        accountID,
        email,
        searchResults?.data,
        allReports,
        allNextSteps,
        allTransactionViolations,
        isBetaEnabled,
        betas,
        delegateEmail,
        currentSearchKey,
        personalDetails,
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
    const hasSomePendingExpenses =
        expenseCount > 1 &&
        selectedTransactionsKeys.some((id) => {
            const tx = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`] ?? allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
            return isPending(tx);
        });
    const deleteModalTitle = isDeletingOnlyExpenses
        ? getDeleteExpenseTitle(translate, expenseCount === 1 ? firstTransaction : undefined, expenseCount)
        : translate('iou.deleteReport', {count: deleteCount});
    const deleteModalPrompt = isDeletingOnlyExpenses
        ? getDeleteConfirmationPrompt(translate, expenseCount === 1 ? firstTransaction : undefined, expenseCount, hasSomePendingExpenses)
        : translate('iou.deleteReportConfirmation', {count: deleteCount});

    const handleDeleteSelectedTransactions = useCallback(async () => {
        if (!hash) {
            return;
        }

        const result = await showConfirmModalAfterMoreMenuDismiss(showConfirmModal, {
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
        if (isExpenseReportType) {
            for (const reportID of selectedReportIDs) {
                const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                deleteAppReport({
                    report,
                    reportActions: allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`],
                    parentReportAction: report?.parentReportActionID
                        ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`]?.[report?.parentReportActionID]
                        : undefined,
                    selfDMReport,
                    currentUserEmailParam: email ?? '',
                    currentUserAccountIDParam: accountID,
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
            // Partition selection into whole-report deletions and individual transactions.
            // The selection key equals the reportID for whole-report rows.
            const wholeReportIDs: string[] = [];
            const transactionIDsToDelete: string[] = [];
            for (const key of Object.keys(selectedTransactions)) {
                const selectedItem = selectedTransactions[key];
                if (selectedItem.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === selectedItem.reportID) {
                    wholeReportIDs.push(selectedItem.reportID);
                }
            }
            for (const key of Object.keys(selectedTransactions)) {
                const selectedItem = selectedTransactions[key];
                if (selectedItem.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === selectedItem.reportID) {
                    continue;
                }
                if (!selectedItem.reportID || !wholeReportIDs.includes(selectedItem.reportID)) {
                    transactionIDsToDelete.push(key);
                }
            }

            // Route individual transactions through the split-aware hook so that deleting a
            // split child triggers updateSplitTransactions (e.g. reverse-split) instead of a
            // bare deleteMoneyRequest.
            if (transactionIDsToDelete.length > 0) {
                deleteTransactionsFromHook(transactionIDsToDelete, duplicateTransactions, duplicateTransactionViolations, hash);
            }

            // Whole-report deletions keep their existing path.
            for (const reportID of wholeReportIDs) {
                const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                deleteAppReport({
                    report,
                    reportActions: allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`],
                    parentReportAction: report?.parentReportActionID
                        ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`]?.[report?.parentReportActionID]
                        : undefined,
                    selfDMReport,
                    currentUserEmailParam: email ?? '',
                    currentUserAccountIDParam: accountID,
                    reportTransactions: validTransactions,
                    allTransactionViolations: transactionsViolations,
                    bankAccountList,
                });
            }
        }
        clearSelectedTransactions();
    }, [
        hash,
        showConfirmModal,
        deleteModalTitle,
        deleteModalPrompt,
        translate,
        allTransactions,
        allTransactionViolations,
        allReportActions,
        accountID,
        selectedTransactions,
        bankAccountList,
        clearSelectedTransactions,
        allReports,
        selfDMReport,
        email,
        isExpenseReportType,
        selectedReportIDs,
        deleteTransactionsFromHook,
        duplicateTransactions,
        duplicateTransactionViolations,
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

            const restrictedPolicyID = getRestrictedPolicyID(selectedOptions, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed, policies, accountID);
            if (restrictedPolicyID) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedPolicyID));
                return;
            }

            const activeRoute = Navigation.getActiveRoute();
            const searchData = searchResults?.data;
            const policyExpenseChatReportActions = getAllPolicyExpenseChatReportActions(allReports, allReportActions);

            for (const item of selectedOptions) {
                const itemPolicyID = item.policyID;
                const itemReportID = item.reportID;
                if (!itemReportID) {
                    return;
                }
                const itemReport = getReportFromSearchSnapshot(itemReportID, searchData, allReports);
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
                    const reportPreviewAction = itemReport?.parentReportActionID
                        ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemReport?.chatReportID}`]?.[itemReport?.parentReportActionID]
                        : undefined;
                    const invite = moveIOUReportToPolicyAndInviteSubmitter(
                        itemReport,
                        adminPolicy,
                        formatPhoneNumber,
                        policyExpenseChatReportActions,
                        reportPreviewAction,
                        accountID,
                        getLoginByAccountID(itemReport?.ownerAccountID, personalDetails),
                        doesPersonalDetailExistSelector(itemReport?.ownerAccountID)(personalDetails),
                        reportTransactions,
                    );
                    if (!invite?.policyExpenseChatReportID) {
                        moveIOUReportToPolicy(itemReport, adminPolicy, reportPreviewAction, false, reportTransactions);
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
                    : Object.values(selectedTransactions).map((transaction) => {
                          const transactionReport = getReportFromSearchSnapshot(transaction.reportID, searchData, allReports) ?? transaction.report;
                          return {
                              reportID: transaction.reportID,
                              amount: transaction.amount,
                              policyID: transaction.policyID,
                              chatReportID: transactionReport?.chatReportID ?? transactionReport?.parentReportID,
                          };
                      });

            let paidReportCount = 0;
            for (const item of itemsToPay) {
                if (!item.reportID) {
                    continue;
                }

                const iouReport = getReportFromSearchSnapshot(item.reportID, searchData, allReports);
                if (!iouReport) {
                    continue;
                }

                const chatReport = getChatReportForBulkPay(iouReport, item.chatReportID, searchData, allReports);
                if (!chatReport) {
                    continue;
                }

                const rawPaymentMethod = paymentMethod ?? getLastPolicyPaymentMethod(item.policyID, personalPolicyID, lastPaymentMethods, undefined, isIOUReportUtil(item.reportID));
                const resolvedPayment = resolveSearchPayPaymentMethod(rawPaymentMethod, searchData, policies);
                if (!resolvedPayment) {
                    continue;
                }

                const {paymentType: resolvedPaymentType, paymentPolicyID, payPolicy: workspacePayPolicy, methodID: workspaceMethodID} = resolvedPayment;
                const paymentItem = {
                    reportID: item.reportID,
                    amount: item.amount,
                    paymentType: resolvedPaymentType,
                    ...(isInvoiceReport(item.reportID)
                        ? getPayMoneyOnSearchInvoiceParams(
                              item.policyID,
                              additionalData?.payAsBusiness ?? isBusinessInvoiceRoom(item.chatReportID),
                              additionalData?.bankAccountID ?? getLastPolicyBankAccountID(item.policyID, lastPaymentMethods),
                              CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                          )
                        : {}),
                    ...(isExpenseReportUtil(item.reportID) && resolvedPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA && expenseReportBankAccountID != null
                        ? {bankAccountID: expenseReportBankAccountID}
                        : {}),
                } as PaymentData;

                const chatReportPolicy = getPolicyFromSearchSnapshot(chatReport.policyID, searchData, policies);
                const reportPolicy = workspacePayPolicy ?? getPolicyFromSearchSnapshot(item.policyID, searchData, policies);
                const nextStep = allNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${item.reportID}`];
                const additionalOnyxData = getSearchPayOnyxData(hash, item.reportID, currentSearchKey);
                const isItemInvoice = isInvoiceReport(item.reportID);

                if (isItemInvoice) {
                    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
                    const existingB2BInvoiceReport = getParticipantsInvoiceReport(
                        allReports,
                        allReportNameValuePairs,
                        activePolicyID,
                        CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                        invoiceReceiverPolicyID ?? chatReport.policyID,
                    );

                    const shouldUseB2BInvoiceReport = !!paymentItem.payAsBusiness && !!existingB2BInvoiceReport && isIndividualInvoiceRoom(chatReport);
                    const payChatReportID = shouldUseB2BInvoiceReport ? existingB2BInvoiceReport.reportID : chatReport.reportID;

                    payInvoice({
                        paymentMethodType: paymentItem.paymentType as PaymentMethodType,
                        chatReport,
                        invoiceReport: iouReport,
                        invoiceReportCurrentNextStepDeprecated: nextStep,
                        introSelected,
                        currentUserAccountIDParam: accountID,
                        currentUserEmailParam: email ?? '',
                        currentUserLocalCurrency: localCurrencyCode ?? CONST.CURRENCY.USD,
                        payAsBusiness: paymentItem.payAsBusiness,
                        existingB2BInvoiceReport,
                        methodID: paymentItem.bankAccountID ?? paymentItem.fundID,
                        paymentMethod: paymentItem.fundID ? CONST.PAYMENT_METHODS.DEBIT_CARD : CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                        activePolicy,
                        betas,
                        isSelfTourViewed,
                        defaultWorkspaceName,
                        additionalOnyxData,
                        shouldPlaySuccessSound: false,
                        chatReportActions: allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${payChatReportID}`],
                    });
                    paidReportCount += 1;
                    continue;
                }

                payMoneyRequest({
                    paymentType: paymentItem.paymentType as PaymentMethodType,
                    chatReport,
                    iouReport,
                    introSelected,
                    iouReportCurrentNextStepDeprecated: nextStep,
                    currentUserAccountID: accountID,
                    currentUserLogin: currentUserLogin ?? '',
                    activePolicy,
                    policy: reportPolicy,
                    chatReportPolicy,
                    betas,
                    isSelfTourViewed,
                    userBillingGracePeriodEnds,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                    paymentPolicyID,
                    methodID:
                        paymentItem.paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? (paymentItem.bankAccountID ?? workspaceMethodID ?? reportPolicy?.achAccount?.bankAccountID) : undefined,
                    additionalOnyxData,
                    shouldPlaySuccessSound: false,
                    chatReportActions: allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`],
                });
                paidReportCount += 1;
            }

            if (paidReportCount > 0) {
                playSound(SOUNDS.SUCCESS);
                clearSelectedTransactions();
            }
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
            allReportActions,
            allNextSteps,
            personalPolicyID,
            lastPaymentMethods,
            allTransactions,
            policyIDsWithVBBA,
            formatPhoneNumber,
            clearSelectedTransactions,
            accountID,
            email,
            currentUserLogin,
            localCurrencyCode,
            defaultWorkspaceName,
            personalDetails,
            introSelected,
            betas,
            isSelfTourViewed,
            activePolicy,
            activePolicyID,
            allReportNameValuePairs,
            currentSearchKey,
            searchResults?.data,
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
                return isCurrentUserSubmitter(getReportOrDraftReport(id, reports, undefined, undefined, allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${id}`]));
            })
        );
    }, [selectedTransactionReportIDs, currentUserPersonalDetails?.accountID, currentSearchResults?.data, allReports]);

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

    const allTransactionsForDuplicate = useMemo(
        () =>
            getAllTransactionsForDuplicate({
                selectedTransactionsKeys,
                selectedTransactions,
                allTransactions,
            }),
        [selectedTransactionsKeys, selectedTransactions, allTransactions],
    );

    const isDuplicateOptionVisible = useMemo(
        () =>
            shouldShowBulkDuplicateOption({
                selectedTransactionsKeys,
                selectedTransactions,
                allTransactions: allTransactionsForDuplicate,
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
            allTransactionsForDuplicate,
            allReports,
            allTransactionViolations,
            allReportNameValuePairs,
            defaultExpensePolicy?.id,
            activePolicyExpenseChat,
            isExpenseReportType,
            currentSearchResults?.data,
        ],
    );

    const duplicateReportHandlerRef = useRef<() => void>(() => {});
    const setDuplicateReportHandler = useCallback((handler: () => void) => {
        duplicateReportHandlerRef.current = handler;
    }, []);
    const invokeDuplicateReportHandler = useCallback(() => {
        duplicateReportHandlerRef.current();
    }, []);

    const isDuplicateReportOptionVisible = useMemo(() => {
        if (!isExpenseReportType || !defaultExpensePolicy || selectedReports.length === 0) {
            return false;
        }

        return selectedReports.every((report) => {
            if (!report.reportID) {
                return false;
            }
            return report.ownerAccountID === accountID && report.type === CONST.REPORT.TYPE.EXPENSE;
        });
    }, [isExpenseReportType, defaultExpensePolicy, selectedReports, accountID]);

    const allReportsShouldMarkAsDone = useMemo(() => {
        if (selectedReports.length > 0) {
            return selectedReports.every((report) => {
                const fullReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`];

                return shouldShowMarkAsDone({
                    isTrackIntentUser,
                    report: fullReport,
                    policy: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`],
                });
            });
        }

        return Object.values(selectedTransactions).every((transaction) => {
            const reportID = transaction.reportID;
            const fullReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

            return shouldShowMarkAsDone({
                isTrackIntentUser,
                report: fullReport,
                policy: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${transaction.policyID}`],
            });
        });
    }, [selectedReports, currentSearchResults?.data, isTrackIntentUser, policies, selectedTransactions]);

    const noReportsShouldMarkAsDone = useMemo(() => {
        if (selectedReports.length > 0) {
            return selectedReports.every((report) => {
                const fullReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`];

                return !shouldShowMarkAsDone({
                    isTrackIntentUser,
                    report: fullReport,
                    policy: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`],
                });
            });
        }

        return Object.values(selectedTransactions).every((transaction) => {
            const reportID = transaction.reportID;
            const fullReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

            return !shouldShowMarkAsDone({
                isTrackIntentUser,
                report: fullReport,
                policy: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${transaction.policyID}`],
            });
        });
    }, [selectedReports, currentSearchResults?.data, isTrackIntentUser, policies, selectedTransactions]);

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0 || !hash) {
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

            // Read the policy through the Search-snapshot fallback: this hook renders outside SearchScopeProvider, so on a
            // fresh load / cache clear the policy may only exist in the search snapshot and not yet in live Onyx.
            const policy = selectedPolicyIDs.length === 1 ? getPolicyFromSearchSnapshot(selectedPolicyIDs.at(0), currentSearchResults?.data, policies) : undefined;
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, includeReportLevelExport);

            const exportOptions: PopoverMenuItem[] = [];

            const connectedIntegration = getConnectedIntegration(policy);
            const isReportsTab = isExpenseReportType;
            const includesGroupExport = Object.entries(selectedTransactions).some(
                ([key, selectedTransaction]) => key.startsWith(CONST.SEARCH.GROUP_PREFIX) && !selectedTransaction?.transaction,
            );

            const canReportBeExported = (report: (typeof selectedReports)[0], exportOption: ValueOf<typeof CONST.REPORT.EXPORT_OPTIONS>) => {
                if (!report.reportID) {
                    return false;
                }

                const reportPolicy = getPolicyFromSearchSnapshot(report.policyID, currentSearchResults?.data, policies);
                const snapshotReport = getReportFromSearchSnapshot(report.reportID, currentSearchResults?.data, allReports);

                if (!snapshotReport) {
                    return false;
                }

                const reportExportOptions = getSecondaryExportReportActions(accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserLogin ?? '', snapshotReport, bankAccountList, reportPolicy);

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
                        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

                        if (!report?.pendingFields?.export && !report?.isExportedToIntegration) {
                            continue;
                        }

                        areAnyReportsExported = true;

                        // The live Onyx report can be an incomplete optimistic record (e.g. exported offline before it
                        // was ever loaded) that lacks `reportName`, so fall back to the Search snapshot for the name.
                        const reportName = report.reportName ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportName;
                        if (reportName) {
                            exportedReportNames.push(reportName);
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
                            shouldEnablePromptScroll: true,
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

            const isGroupedSearch = !!getValidGroupBy(queryJSON?.groupBy);

            exportOptions.push({
                // Group by exports dont have a basicExport, at the same time the backend expects isBasicExport to be true for grouped exports, so we just rename the option here
                // Fixing here https://github.com/Expensify/Expensify/issues/652978
                text: translate(isGroupedSearch ? 'export.currentView' : 'export.basicExport'),
                icon: expensifyIcons.Table,
                onSelected: () => {
                    handleBasicExport();
                },
                shouldCloseModalOnSelect: true,
                shouldCallAfterModalHide: true,
            });

            if (!isGroupedSearch) {
                exportOptions.push({
                    text: translate('export.currentView'),
                    icon: expensifyIcons.Table,
                    onSelected: () => {
                        handleExportCurrentView();
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                });
            }

            if (!allSelectedAreDeleted && !includesGroupExport) {
                for (const template of exportTemplates) {
                    const isStandardTemplate =
                        template.templateName === CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT || template.templateName === CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT;
                    exportOptions.push({
                        text: template.name,
                        icon: isStandardTemplate ? expensifyIcons.Table : expensifyIcons.TablePencil,
                        description: template.description,
                        onSelected: () => {
                            beginExportWithTemplate(template.templateName, template.type, template.policyID, template.name);
                        },
                        shouldCloseModalOnSelect: true,
                        shouldCallAfterModalHide: true,
                    });
                }
            }

            return exportOptions;
        };

        const subMenuItems = getExportOptions();
        const singleExportSubMenuItem = subMenuItems.length === 1 ? subMenuItems.at(0) : undefined;

        const exportButtonOption: DropdownOption<SearchHeaderOptionValue> & Pick<PopoverMenuItem, 'rightIcon' | 'shouldCallAfterModalHide'> = singleExportSubMenuItem
            ? {
                  icon: expensifyIcons.Export,
                  text: singleExportSubMenuItem.text,
                  value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
                  shouldCloseModalOnSelect: singleExportSubMenuItem.shouldCloseModalOnSelect ?? true,
                  shouldCallAfterModalHide: singleExportSubMenuItem.shouldCallAfterModalHide,
                  onSelected: () => singleExportSubMenuItem.onSelected?.(),
                  description: singleExportSubMenuItem.description,
                  displayInDefaultIconColor: singleExportSubMenuItem.displayInDefaultIconColor,
                  additionalIconStyles: singleExportSubMenuItem.additionalIconStyles,
              }
            : {
                  icon: expensifyIcons.Export,
                  rightIcon: expensifyIcons.ArrowRight,
                  text: translate('common.export'),
                  backButtonText: translate('common.export'),
                  value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
                  shouldCloseModalOnSelect: true,
                  subMenuItems,
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
                    onSelected: () => {
                        if (defaultExpensePolicy && shouldRestrictUserBillableActions(defaultExpensePolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)) {
                            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(defaultExpensePolicy.id));
                            return;
                        }
                        invokeDuplicateHandler();
                    },
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
        const hasSubmitPolicyTransactions = areIncludedSubmitPolicyTransactions(selectedTransactions, selectedReports, policies);
        const shouldShowApproveOption =
            !isOffline &&
            !isAnyTransactionOnHold &&
            areSelectedTransactionsIncludedInReports &&
            !hasSubmitPolicyTransactions &&
            (selectedReports.length
                ? selectedReports.every((report) => report.canApprove)
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
            selectedReports.every((report) => report.canChangeApprover);

        if (shouldShowChangeApproverOption) {
            options.push({
                icon: expensifyIcons.Workflows,
                text: translate('iou.changeApprover.title'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_APPROVER,
                shouldCloseModalOnSelect: true,
                onSelected: () => navigateToSearchRHP(ROUTES.CHANGE_APPROVER_SEARCH_RHP),
            });
        }

        const uniqueSelectedReportIDsFromTransactions = new Set(
            selectedTransactionsKeys.map((id) => selectedTransactions[id]?.reportID).filter((reportID): reportID is string => !!reportID),
        );
        const hasSingleSubmitPolicySelection = selectedReports.length === 1 || uniqueSelectedReportIDsFromTransactions.size === 1;

        const shouldShowSubmitOption =
            !isOffline &&
            (!doSelectedItemsBelongToSubmitPolicy || (doSelectedItemsBelongToSubmitPolicy && hasSingleSubmitPolicySelection)) &&
            areSelectedTransactionsIncludedInReports &&
            (selectedReports.length
                ? selectedReports.every((report) => report.canSubmit) &&
                  // Disable for mixed selections: all must be the same submit type
                  (isTrackIntentUser ? allReportsShouldMarkAsDone || noReportsShouldMarkAsDone : true)
                : selectedTransactionsKeys.every((id) => selectedTransactions[id].action === CONST.SEARCH.ACTION_TYPES.SUBMIT) &&
                  // Disable for mixed selections: all must be the same submit type
                  (isTrackIntentUser ? allReportsShouldMarkAsDone || noReportsShouldMarkAsDone : true));

        if (shouldShowSubmitOption) {
            options.push({
                icon: expensifyIcons.Send,
                text: allReportsShouldMarkAsDone ? translate('common.markAsDone') : translate('common.submit'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }

                    const itemList = !selectedReports.length ? Object.values(selectedTransactions).map((transaction) => transaction) : (selectedReports?.filter((report) => !!report) ?? []);

                    const restrictedPolicyID = getRestrictedPolicyID(itemList, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed, policies, accountID);
                    if (restrictedPolicyID) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(restrictedPolicyID));
                        return;
                    }

                    const allSelectedTransactionsList = selectedReports.length
                        ? Object.values(allTransactions ?? {}).filter((t): t is NonNullable<typeof t> => !!t && selectedReports.some((report) => report.reportID === t.reportID))
                        : selectedTransactionsKeys
                              .map((id) => selectedTransactions[id]?.transaction ?? allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`])
                              .filter((t): t is NonNullable<typeof t> => !!t);

                    if (hasOnlyPendingCardTransactions(allSelectedTransactionsList)) {
                        showPendingCardTransactionsBlockModal(showConfirmModal, translate);
                        return;
                    }

                    const selectedReportForSubmit = selectedReports.at(0);
                    const reportIDForSubmit = selectedReportForSubmit?.reportID ?? selectedTransactionsKeys.map((id) => selectedTransactions[id]?.reportID).find((id): id is string => !!id);
                    const policyIDForSubmit = selectedReportForSubmit?.policyID ?? selectedTransactionsKeys.map((id) => selectedTransactions[id]?.policyID).find((id): id is string => !!id);
                    const policyForSubmit = policyIDForSubmit ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDForSubmit}`] : undefined;

                    if (policyForSubmit && isSubmitPolicy(policyForSubmit) && reportIDForSubmit && hash) {
                        const snapshotReport = getReportOrDraftReport(
                            reportIDForSubmit,
                            undefined,
                            searchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDForSubmit}`] ?? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportIDForSubmit}`],
                        );

                        if (snapshotReport) {
                            openSearchReportSubmitToPopover(reportIDForSubmit, {
                                onSubmitWithManagerEmail: (managerEmail, managerAccountID) => {
                                    submitMoneyRequestOnSearch(
                                        hash,
                                        [snapshotReport],
                                        [policyForSubmit],
                                        getLoginByAccountID(snapshotReport.ownerAccountID, personalDetails),
                                        currentSearchKey,
                                        managerEmail,
                                        managerAccountID,
                                    );
                                    clearSelectedTransactions();
                                },
                            });
                        }
                        return;
                    }

                    for (const item of itemList) {
                        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`];
                        if (policy) {
                            submitMoneyRequestOnSearch(hash, [item as Report], [policy], getLoginByAccountID(item.ownerAccountID, personalDetails));
                        }
                    }
                    clearSelectedTransactions();
                },
            });
        }
        const {shouldEnableBulkPayOption} = getPayOption(selectedReports, selectedTransactions, lastPaymentMethods, selectedReportIDs, personalPolicyID);

        const shouldShowPayOption = !isOffline && !isAnyTransactionOnHold && shouldEnableBulkPayOption && !!bulkPayButtonOptions?.length;

        if (shouldShowPayOption) {
            const shouldShowPaySubmenu = !!bulkPayButtonOptions?.length;

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

        if (isExpenseReportSearch && selectedReportIDs.length > 0) {
            options.push({
                icon: expensifyIcons.Download,
                text: translate('common.downloadAsPDF'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DOWNLOAD_PDF,
                shouldCloseModalOnSelect: true,
                onSelected: async () => {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    if (selectedReportIDs.length === 1) {
                        const reportIDForPDF = selectedReportIDs.at(0);
                        if (!reportIDForPDF) {
                            return;
                        }
                        await exportReportToPDF({reportID: reportIDForPDF});
                        setPdfReportID(reportIDForPDF);
                        setIsPdfModalVisible(true);
                        return;
                    }
                    const exportID = exportReportsToPDF(selectedReportIDs);
                    trackExport(exportID);
                },
            });
        }

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
                        const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
                        unholdRequest(
                            transactionID,
                            selectedTransactions[transactionID].reportAction?.childReportID,
                            policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedTransactions[transactionID].policyID}`],
                            isOffline,
                            currentUserLogin ?? '',
                            accountID,
                            transactionViolations,
                        );
                    }
                    clearSelectedTransactions();
                },
            });
        }

        if (selectedTransactionsKeys.length < 3 && searchResults?.search.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT && searchResults?.data) {
            const {transactions: searchedTransactions, reports, policies: transactionPolicies} = getTransactionsAndReportsFromSearch(searchResults, selectedTransactionsKeys);

            if (isMergeActionForSelectedTransactions(searchedTransactions, reports, transactionPolicies, accountID)) {
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
            const ownerAccountID =
                transactionEntry.ownerAccountID ??
                getReportOrDraftReport(transactionEntry.reportID, undefined, undefined, undefined, allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionEntry.reportID}`])?.ownerAccountID;
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
        const canShowDeleteAction = shouldShowDeleteOption(selectedTransactions, currentSearchResults?.data, selectedReports, queryJSON?.type);

        const isSplittable = !!firstTransactionMeta?.canSplit;
        const isAlreadySplit = !!firstTransactionMeta?.hasBeenSplit;

        const canSplitTransaction = selectedTransactionsKeys.length === 1 && !isAlreadySplit && isSplittable;
        const firstOriginalTransactionID = firstTransaction?.comment?.originalTransactionID;
        const firstOriginalTransaction =
            (firstOriginalTransactionID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstOriginalTransactionID}`] : undefined) ??
            (firstOriginalTransactionID ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstOriginalTransactionID}`] : undefined) ??
            (firstOriginalTransactionID ? allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstOriginalTransactionID}`] : undefined);
        const {isExpenseSplit: isFirstTransactionExpenseSplit, originalTransaction: firstSourceTransaction} = getOriginalTransactionWithSplitInfo(firstTransaction, firstOriginalTransaction);
        const isFirstTransactionPerDiemSplit = selectedTransactionsKeys.length === 1 && isFirstTransactionExpenseSplit && isPerDiemRequest(firstSourceTransaction);

        if (canSplitTransaction) {
            options.push({
                text: translate('iou.split'),
                icon: expensifyIcons.ArrowSplit,
                value: CONST.SEARCH.BULK_ACTION_TYPES.SPLIT,
                onSelected: () => {
                    initSplitExpense(firstTransaction, firstTransactionReport, splitEffectivePolicy, selfDMReportID, restrictedActionPolicyID, personalPolicy?.outputCurrency, {
                        isProduction,
                    });
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
                    if (defaultExpensePolicy && shouldRestrictUserBillableActions(defaultExpensePolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)) {
                        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(defaultExpensePolicy.id));
                        return;
                    }
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

        if (isDuplicateReportOptionVisible) {
            options.push({
                text: translate('search.bulkActions.duplicateReport', {count: selectedReports.length}),
                icon: expensifyIcons.ReportCopy,
                value: CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE_REPORT,
                shouldCloseModalOnSelect: true,
                onSelected: invokeDuplicateReportHandler,
            });
        }
        if (canShowDeleteAction && (isProduction || !isFirstTransactionPerDiemSplit)) {
            const shouldShowEditSplitOnDelete =
                selectedTransactionsKeys.length === 1 && !!firstTransaction?.transactionID && shouldOpenSplitExpenseEditFlowOnDelete([firstTransaction.transactionID]);
            options.push({
                icon: shouldShowEditSplitOnDelete ? expensifyIcons.ArrowSplit : expensifyIcons.Trashcan,
                text: shouldShowEditSplitOnDelete ? translate('iou.editSplits') : translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected:
                    shouldShowEditSplitOnDelete && firstTransaction?.transactionID
                        ? () => {
                              deleteTransactionsFromHook([firstTransaction.transactionID], duplicateTransactions, duplicateTransactionViolations, hash);
                          }
                        : handleDeleteSelectedTransactions,
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
        accountID,
        currentUserLogin,
        bankAccountList,
        styles.integrationIcon,
        showConfirmModal,
        clearSelectedTransactions,
        handleBasicExport,
        handleExportCurrentView,
        beginExportWithTemplate,
        handleApproveWithDEWCheck,
        allTransactionViolations,
        isDelegateAccessRestricted,
        dismissedRejectUseExplanation,
        showDelegateNoAccessModal,
        bulkPayButtonOptions,
        onBulkPaySelected,
        areAllTransactionsFromSubmitter,
        dismissedHoldUseExplanation,
        localeCompare,
        firstTransaction,
        isDuplicateOptionVisible,
        invokeDuplicateHandler,
        isDuplicateReportOptionVisible,
        invokeDuplicateReportHandler,
        isExpenseReportType,
        handleDeleteSelectedTransactions,
        undeleteTransactions,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        currentSearchKey,
        isTrackIntentUser,
        getCurrencyDecimals,
        amountOwed,
        allTransactions,
        transactions,
        isBetaEnabled,
        defaultExpensePolicy,
        personalDetails,
        selfDMReportID,
        splitEffectivePolicy,
        personalPolicy?.outputCurrency,
        restrictedActionPolicyID,
        doSelectedItemsBelongToSubmitPolicy,
        openSearchReportSubmitToPopover,
        deleteTransactionsFromHook,
        duplicateTransactionViolations,
        duplicateTransactions,
        firstTransactionReport,
        isProduction,
        shouldOpenSplitExpenseEditFlowOnDelete,
        styles.textWrap,
        trackExport,
        allReportsShouldMarkAsDone,
        noReportsShouldMarkAsDone,
        queryJSON?.groupBy,
    ]);

    const handleOfflineModalClose = useCallback(() => {
        setIsOfflineModalVisible(false);
    }, [setIsOfflineModalVisible]);

    const handleDownloadErrorModalClose = useCallback(() => {
        setIsDownloadErrorModalVisible(false);
    }, [setIsDownloadErrorModalVisible]);

    const handlePdfModalHide = useCallback(() => {
        setPdfReportID(undefined);
        clearSelectedTransactions();
    }, [clearSelectedTransactions]);

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
        isPdfModalVisible,
        setIsPdfModalVisible,
        pdfReportID,
        handlePdfModalHide,
        exportDownloadStatusModal,
        dismissModalAndUpdateUseHold,
        dismissRejectModalBasedOnAction,
        isDuplicateOptionVisible,
        setDuplicateHandler,
        isDuplicateReportOptionVisible,
        setDuplicateReportHandler,
        allTransactions: allTransactionsForDuplicate,
        allReports,
        searchData: currentSearchResults?.data,
    };
}

export default useSearchBulkActions;
export {shouldShowBulkDuplicateOption};
export type {SearchHeaderOptionValue};
