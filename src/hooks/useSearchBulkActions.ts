import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {PaymentData, SearchQueryJSON} from '@components/Search/types';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {deleteAppReport, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import {
    approveMoneyRequestOnSearch,
    bulkDeleteReports,
    exportSearchItemsToCSV,
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
    unholdMoneyRequestOnSearch,
} from '@libs/actions/Search';
import initSplitExpense from '@libs/actions/SplitExpenses';
import {setNameValuePair} from '@libs/actions/User';
import {getTransactionsAndReportsFromSearch} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {isMergeActionForSelectedTransactions} from '@libs/ReportSecondaryActionUtils';
import {
    getReportOrDraftReport,
    isBusinessInvoiceRoom,
    isCurrentUserSubmitter,
    isExpenseReport as isExpenseReportUtil,
    isInvoiceReport,
    isIOUReport as isIOUReportUtil,
} from '@libs/ReportUtils';
import {navigateToSearchRHP, shouldShowDeleteOption} from '@libs/SearchUIUtils';
import {hasTransactionBeenRejected} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {canIOUBePaid, dismissRejectUseExplanation} from '@userActions/IOU';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, SearchResults, Transaction, TransactionViolations} from '@src/types/onyx';
import useAllTransactions from './useAllTransactions';
import useBulkPayOptions from './useBulkPayOptions';
import useConfirmModal from './useConfirmModal';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import useSelfDMReport from './useSelfDMReport';
import useTheme from './useTheme';
import useThemeStyles from './useThemeStyles';

type UseSearchBulkActionsParams = {
    queryJSON: SearchQueryJSON | undefined;
};

function useSearchBulkActions({queryJSON}: UseSearchBulkActionsParams) {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {selectedTransactions, selectedReports, areAllMatchingItemsSelected, currentSearchResults} = useSearchStateContext();
    const {clearSelectedTransactions, selectAllMatchingItems} = useSearchActionsContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {accountID} = currentUserPersonalDetails;
    const allTransactions = useAllTransactions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const selfDMReport = useSelfDMReport();
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);

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
    const {isBetaEnabled} = usePermissions();
    const isDEWBetaEnabled = isBetaEnabled(CONST.BETAS.NEW_DOT_DEW);
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
    ] as const);

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

    const {bulkPayButtonOptions, latestBankItems} = useBulkPayOptions({
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
                    jsonQuery: JSON.stringify(queryJSON),
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
            if (!policy || !policy.achAccount?.bankAccountID) {
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
                jsonQuery: JSON.stringify(queryJSON),
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
                jsonQuery: JSON.stringify(queryJSON),
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

        const selectedPolicyIDList = selectedReports.length
            ? selectedReports.map((report) => report.policyID)
            : Object.values(selectedTransactions).map((transaction) => transaction.policyID);
        const hasDEWPolicy = selectedPolicyIDList.some((policyID) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            return hasDynamicExternalWorkflow(policy);
        });

        if (hasDEWPolicy && !isDEWBetaEnabled) {
            const result = await showConfirmModal({
                title: translate('customApprovalWorkflow.title'),
                prompt: translate('customApprovalWorkflow.description'),
                confirmText: translate('customApprovalWorkflow.goToExpensifyClassic'),
                shouldShowCancelButton: false,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            openOldDotLink(CONST.OLDDOT_URLS.INBOX);
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
        policies,
        isDEWBetaEnabled,
        showConfirmModal,
        translate,
        hash,
        clearSelectedTransactions,
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
                        deleteAppReport(
                            report,
                            selfDMReport,
                            currentUserPersonalDetails?.email ?? '',
                            currentUserPersonalDetails?.accountID,
                            validTransactions,
                            allTransactionViolations,
                            bankAccountList,
                            hash,
                        );
                    }
                } else {
                    const transactionsViolations = allTransactionViolations
                        ? Object.fromEntries(Object.entries(allTransactionViolations).filter((entry): entry is [string, TransactionViolations] => !!entry[1]))
                        : {};
                    bulkDeleteReports(
                        allReports,
                        selfDMReport,
                        hash,
                        selectedTransactions,
                        currentUserPersonalDetails.email ?? '',
                        accountID,
                        validTransactions,
                        transactionsViolations,
                        bankAccountList,
                        transactions,
                    );
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
    ]);

    const onBulkPaySelected = useCallback(
        (paymentMethod?: PaymentMethodType, additionalData?: Record<string, unknown>) => {
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

            const activeRoute = Navigation.getActiveRoute();
            const selectedOptions = selectedReports.length ? selectedReports : Object.values(selectedTransactions);

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
                const lastPolicyPaymentMethod = getLastPolicyPaymentMethod(itemPolicyID, personalPolicyID, lastPaymentMethods, reportType, isIOUReport) ?? paymentMethod;

                if (!lastPolicyPaymentMethod) {
                    Navigation.navigate(
                        ROUTES.SEARCH_REPORT.getRoute({
                            reportID: itemReportID,
                            backTo: activeRoute,
                        }),
                    );
                    return;
                }

                const hasPolicyVBBA = itemPolicyID ? policyIDsWithVBBA.includes(itemPolicyID) : false;

                if (isExpenseReport && lastPolicyPaymentMethod !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE && !hasPolicyVBBA) {
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
                    const reportTransactions = Object.values(allTransactions ?? {}).filter(
                        (transaction): transaction is NonNullable<typeof transaction> => !!transaction && transaction.reportID === itemReportID,
                    );
                    const invite = moveIOUReportToPolicyAndInviteSubmitter(itemReport, adminPolicy, formatPhoneNumber, reportTransactions);
                    if (!invite?.policyExpenseChatReportID) {
                        moveIOUReportToPolicy(itemReport, adminPolicy, false, reportTransactions);
                    }
                }
            }
            const paymentAdditionalData = (additionalData as Partial<PaymentData>) ?? {};
            const paymentData = (
                selectedReports.length
                    ? selectedReports.map((report) => {
                          return {
                              reportID: report.reportID,
                              amount: report.total,
                              paymentType: getLastPolicyPaymentMethod(report.policyID, personalPolicyID, lastPaymentMethods, undefined, isIOUReportUtil(report.reportID)) ?? paymentMethod,
                              ...(isInvoiceReport(report.reportID)
                                  ? getPayMoneyOnSearchInvoiceParams(
                                        report.policyID,
                                        paymentAdditionalData?.payAsBusiness ?? isBusinessInvoiceRoom(report.chatReportID),
                                        paymentAdditionalData?.bankAccountID ?? getLastPolicyBankAccountID(report.policyID, lastPaymentMethods),
                                        CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                                    )
                                  : {}),
                          };
                      })
                    : Object.values(selectedTransactions).map((transaction) => ({
                          reportID: transaction.reportID,
                          amount: transaction.amount,
                          paymentType:
                              getLastPolicyPaymentMethod(transaction.policyID, personalPolicyID, lastPaymentMethods, undefined, isIOUReportUtil(transaction.reportID)) ?? paymentMethod,
                          ...(isInvoiceReport(transaction.reportID)
                              ? getPayMoneyOnSearchInvoiceParams(
                                    transaction.policyID,
                                    paymentAdditionalData?.payAsBusiness ?? isBusinessInvoiceRoom(transaction.reportID),
                                    paymentAdditionalData?.bankAccountID ?? getLastPolicyBankAccountID(transaction.policyID, lastPaymentMethods),
                                    CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                                )
                              : {}),
                      }))
            ) as PaymentData[];

            payMoneyRequestOnSearch(hash, paymentData);

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                clearSelectedTransactions();
            });
        },
        [
            clearSelectedTransactions,
            hash,
            isOffline,
            lastPaymentMethods,
            selectedReports,
            selectedTransactions,
            policies,
            formatPhoneNumber,
            policyIDsWithVBBA,
            isDelegateAccessRestricted,
            showDelegateNoAccessModal,
            personalPolicyID,
            allTransactions,
            allReports,
        ],
    );

    const onBulkPaySelectedRef = useRef(onBulkPaySelected);
    onBulkPaySelectedRef.current = onBulkPaySelected;
    const stableOnBulkPaySelected = useCallback((paymentMethod?: PaymentMethodType, additionalData?: Record<string, unknown>) => {
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

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0 || status == null || !hash) {
            return CONST.EMPTY_ARRAY as unknown as Array<DropdownOption<SearchHeaderOptionValue>>;
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];
        const isAnyTransactionOnHold = Object.values(selectedTransactions).some((transaction) => transaction.isHeld);

        const typeExpenseReport = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

        const getExportOptions = () => {
            const exportOptions: PopoverMenuItem[] = [
                {
                    text: translate('export.basicExport'),
                    icon: expensifyIcons.Table,
                    onSelected: () => {
                        handleBasicExport();
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                },
            ];

            const areFullReportsSelected = selectedTransactionReportIDs.length === selectedReportIDs.length && selectedTransactionReportIDs.every((id) => selectedReportIDs.includes(id));
            const typeInvoice = queryJSON?.type === CONST.REPORT.TYPE.INVOICE;
            const typeExpense = queryJSON?.type === CONST.REPORT.TYPE.EXPENSE;
            const isAllOneTransactionReport = Object.values(selectedTransactions).every((transaction) => transaction.isFromOneTransactionReport);

            const includeReportLevelExport = ((typeExpenseReport || typeInvoice) && areFullReportsSelected) || (typeExpense && !typeExpenseReport && isAllOneTransactionReport);

            const policy = selectedPolicyIDs.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedPolicyIDs.at(0)}`] : undefined;
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, includeReportLevelExport);
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
            const payButtonOption = {
                icon: expensifyIcons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                rightIcon: isFirstTimePayment ? expensifyIcons.ArrowRight : undefined,
                value: CONST.SEARCH.BULK_ACTION_TYPES.PAY,
                shouldCloseModalOnSelect: true,
                subMenuItems: isFirstTimePayment ? bulkPayButtonOptions : undefined,
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

                    unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);
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
                        onSelected: () => setupMergeTransactionDataAndNavigate(transactionID, searchedTransactions, localeCompare, reports, false, true),
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

        if (canAllTransactionsBeMoved && !hasMultipleOwners && !typeExpenseReport) {
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
        expensifyIcons.Export,
        expensifyIcons.ArrowRight,
        expensifyIcons.Table,
        expensifyIcons.ThumbsUp,
        expensifyIcons.ThumbsDown,
        expensifyIcons.Send,
        expensifyIcons.MoneyBag,
        expensifyIcons.Stopwatch,
        expensifyIcons.ArrowCollapse,
        expensifyIcons.DocumentMerge,
        expensifyIcons.ArrowSplit,
        expensifyIcons.Trashcan,
        expensifyIcons.Exclamation,
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
        integrationsExportTemplates,
        csvExportLayouts,
        handleBasicExport,
        beginExportWithTemplate,
        handleApproveWithDEWCheck,
        allTransactionViolations,
        isDelegateAccessRestricted,
        dismissedRejectUseExplanation,
        showDelegateNoAccessModal,
        clearSelectedTransactions,
        bulkPayButtonOptions,
        onBulkPaySelected,
        areAllTransactionsFromSubmitter,
        dismissedHoldUseExplanation,
        currentUserPersonalDetails.accountID,
        localeCompare,
        firstTransaction,
        firstTransactionPolicy,
        handleDeleteSelectedTransactions,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
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
        latestBankItems,
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
    };
}

export default useSearchBulkActions;
