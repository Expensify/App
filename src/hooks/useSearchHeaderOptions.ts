import {useCallback, useContext, useMemo} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import type {PaymentMethodType} from '@components/KYCWall/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchQueryJSON} from '@components/Search/types';
import useBulkPayOptions from '@hooks/useBulkPayOptions';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useAllTransactions from '@hooks/useAllTransactions';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {
    getExportTemplates,
    getPayOption,
    getTotalFormattedAmount,
    isCurrencySupportWalletBulkPay,
    submitMoneyRequestOnSearch,
    unholdMoneyRequestOnSearch,
} from '@libs/actions/Search';
import {initSplitExpense} from '@userActions/IOU';
import {getActiveAdminWorkspaces} from '@libs/PolicyUtils';
import {
    canDeleteMoneyRequestReport,
    getReportOrDraftReport,
    isCurrentUserSubmitter,
} from '@libs/ReportUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isMergeActionForSelectedTransactions} from '@libs/ReportSecondaryActionUtils';
import {getTransactionsAndReportsFromSearch} from '@libs/MergeTransactionUtils';
import {hasTransactionBeenRejected} from '@libs/TransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, SearchResults} from '@src/types/onyx';
import type {UseSearchBulkActionsReturn} from './useSearchBulkActions';

type UseSearchHeaderOptionsProps = {
    /** The current search query JSON */
    queryJSON: SearchQueryJSON | undefined;
    /** The current search results */
    searchResults: SearchResults | undefined;
    /** Bulk actions from useSearchBulkActions hook */
    bulkActions: UseSearchBulkActionsReturn;
    /** Callback to set offline modal visibility */
    setIsOfflineModalVisible: (visible: boolean) => void;
    /** Callback to set hold educational modal visibility */
    setIsHoldEducationalModalVisible: (visible: boolean) => void;
    /** Callback to set reject modal action */
    setRejectModalAction: (action: ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT> | null) => void;
};

/**
 * Hook that builds the header button options for the Search page
 * Following the composition pattern - extracts header options logic from UI components
 */
function useSearchHeaderOptions({
    queryJSON,
    searchResults,
    bulkActions,
    setIsOfflineModalVisible,
    setIsHoldEducationalModalVisible,
    setRejectModalAction,
}: UseSearchHeaderOptionsProps) {
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {state, actions} = useSearchContext();
    const {
        selectedTransactions,
        selectedReports,
        areAllMatchingItemsSelected,
        currentSearchResults,
    } = state;
    const {clearSelectedTransactions} = actions;

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [lastPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {canBeMissing: true});
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const allTransactions = useAllTransactions();

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
        'SmartScan',
        'MoneyBag',
        'ArrowSplit',
    ] as const);

    const {status, hash} = queryJSON ?? {};
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    // Collate a list of policyIDs from the selected transactions
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
    const selectedBulkCurrency = selectedReports.at(0)?.currency ?? Object.values(selectedTransactions).at(0)?.currency;
    const totalFormattedAmount = getTotalFormattedAmount(selectedReports, selectedTransactions, selectedBulkCurrency);
    const activeAdminPolicies = getActiveAdminWorkspaces(policies, currentUserPersonalDetails?.accountID.toString()).sort((a, b) => localeCompare(a.name || '', b.name || ''));

    // Check if any of the selected items require "pay elsewhere" only
    const onlyShowPayElsewhere = useMemo(() => {
        const firstPolicyID = selectedPolicyIDs.at(0);
        const selectedPolicy = firstPolicyID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${firstPolicyID}`] : undefined;
        return (selectedTransactionReportIDs ?? selectedReportIDs).some((reportID) => {
            const report = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const chatReportID = report?.chatReportID;
            const chatReport = chatReportID ? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] : undefined;
            // Simplified check - would need canIOUBePaid import
            return false;
        });
    }, [currentSearchResults?.data, selectedPolicyIDs, selectedReportIDs, selectedTransactionReportIDs]);

    const {bulkPayButtonOptions, latestBankItems} = useBulkPayOptions({
        selectedPolicyID: selectedPolicyIDs.at(0),
        selectedReportID: selectedTransactionReportIDs.at(0) ?? selectedReportIDs.at(0),
        activeAdminPolicies,
        isCurrencySupportedWallet: isCurrencySupportedBulkWallet,
        currency: selectedBulkCurrency,
        formattedAmount: totalFormattedAmount,
        onlyShowPayElsewhere,
    });

    // Check if all selected transactions are from the submitter
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

        // Gets the list of options for the export sub-menu
        const getExportOptions = () => {
            const exportOptions: PopoverMenuItem[] = [
                {
                    text: translate('export.basicExport'),
                    icon: expensifyIcons.Table,
                    onSelected: () => {
                        bulkActions.handleBasicExport();
                    },
                    shouldCloseModalOnSelect: true,
                    shouldCallAfterModalHide: true,
                },
            ];

            // Determine if only full reports are selected
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
                        bulkActions.beginExportWithTemplate(template.templateName, template.type, template.policyID);
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

        // If all matching items are selected, we only allow export
        if (areAllMatchingItemsSelected) {
            return [exportButtonOption];
        }

        // Build options based on state of selected transactions
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
                    bulkActions.handleApproveWithDEWCheck();
                },
            });
        }

        // Check if all selected transactions can be rejected
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
                onSelected: () => bulkActions.onBulkPaySelected(undefined),
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
                        Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
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

        // Merge option
        if (selectedTransactionsKeys.length < 3 && searchResults?.search.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT && searchResults?.data) {
            const {transactions, reports, policies: transactionPolicies} = getTransactionsAndReportsFromSearch(searchResults, selectedTransactionsKeys);

            if (isMergeActionForSelectedTransactions(transactions, reports, transactionPolicies, currentUserPersonalDetails.accountID)) {
                const transactionID = transactions.at(0)?.transactionID;
                if (transactionID) {
                    options.push({
                        text: translate('common.merge'),
                        icon: expensifyIcons.ArrowCollapse,
                        value: CONST.SEARCH.BULK_ACTION_TYPES.MERGE,
                        onSelected: () => setupMergeTransactionDataAndNavigate(transactionID, transactions, localeCompare, reports, false, true),
                    });
                }
            }
        }

        // Move expenses option
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
                text: translate('iou.moveExpenses', {count: selectedTransactionsKeys.length}),
                icon: expensifyIcons.DocumentMerge,
                value: CONST.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT,
                shouldCloseModalOnSelect: true,
                onSelected: () => Navigation.navigate(ROUTES.MOVE_TRANSACTIONS_SEARCH_RHP),
            });
        }

        // Split option
        const firstTransactionKey = selectedTransactionsKeys.at(0);
        const firstTransactionMeta = firstTransactionKey ? selectedTransactions[firstTransactionKey] : undefined;

        const isSplittable = !!firstTransactionMeta?.canSplit;
        const isAlreadySplit = !!firstTransactionMeta?.hasBeenSplit;
        const firstTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedTransactionsKeys.at(0)}`];

        const canSplitTransaction = selectedTransactionsKeys.length === 1 && !isAlreadySplit && isSplittable;

        if (canSplitTransaction) {
            options.push({
                text: translate('iou.split'),
                icon: expensifyIcons.ArrowSplit,
                value: CONST.SEARCH.BULK_ACTION_TYPES.SPLIT,
                onSelected: () => {
                    initSplitExpense(allTransactions, allReports, firstTransaction);
                },
            });
        }

        // Delete option
        const shouldShowDeleteOption =
            !isOffline &&
            selectedTransactionsKeys.every((id) => {
                const transaction = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
                if (!transaction) {
                    return false;
                }
                const parentReportID = transaction.reportID;
                const parentReport = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
                const reportActions = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`];
                const parentReportAction =
                    Object.values(reportActions ?? {}).find(
                        (action) => (isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined) === transaction.transactionID,
                    ) ?? selectedTransactions[id].reportAction;
                return canDeleteMoneyRequestReport(parentReport, [transaction], parentReportAction ? [parentReportAction] : []);
            });

        if (shouldShowDeleteOption) {
            options.push({
                icon: expensifyIcons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    bulkActions.handleDeleteSelectedTransactions();
                },
            });
        }

        // Empty state if no options
        if (options.length === 0) {
            const emptyOptionStyle = {
                interactive: false,
                iconFill: undefined,
                iconHeight: undefined,
                iconWidth: undefined,
                numberOfLinesTitle: 2,
                titleStyle: undefined,
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
        areAllMatchingItemsSelected,
        selectedReports,
        isOffline,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
        allTransactionViolations,
        dismissedHoldUseExplanation,
        dismissedRejectUseExplanation,
        selectedTransactionReportIDs,
        selectedReportIDs,
        selectedPolicyIDs,
        policies,
        integrationsExportTemplates,
        csvExportLayouts,
        lastPaymentMethods,
        personalPolicyID,
        currentUserPersonalDetails.accountID,
        searchResults,
        currentSearchResults?.data,
        bulkPayButtonOptions,
        allTransactions,
        allReports,
        translate,
        localeCompare,
        expensifyIcons,
        bulkActions,
        clearSelectedTransactions,
        setIsOfflineModalVisible,
        setIsHoldEducationalModalVisible,
        setRejectModalAction,
        areAllTransactionsFromSubmitter,
    ]);

    return {
        headerButtonsOptions,
        latestBankItems,
        selectedPolicyIDs,
        selectedTransactionReportIDs,
        selectedReportIDs,
    };
}

export default useSearchHeaderOptions;
export type {UseSearchHeaderOptionsProps};
