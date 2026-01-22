import {useContext, useState} from 'react';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchContext} from '@components/Search/SearchContext';
import {initSplitExpense} from '@libs/actions/IOU';
import {unholdRequest} from '@libs/actions/IOU/Hold';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {exportReportToCSV} from '@libs/actions/Report';
import {getExportTemplates} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID, getReportAction, isDeletedAction} from '@libs/ReportActionsUtils';
import {isMergeActionForSelectedTransactions, isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canEditFieldOfMoneyRequest,
    canHoldUnholdReportAction,
    canRejectReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getReportOrDraftReport,
    isInvoiceReport,
    isMoneyRequestReport as isMoneyRequestReportUtils,
    isTrackExpenseReport,
} from '@libs/ReportUtils';
import {getOriginalTransactionWithSplitInfo, hasTransactionBeenRejected} from '@libs/TransactionUtils';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction, Session, Transaction} from '@src/types/onyx';
import useAllTransactions from './useAllTransactions';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDeleteTransactions from './useDeleteTransactions';
import useDuplicateTransactionsAndViolations from './useDuplicateTransactionsAndViolations';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

// We do not use PRIMARY_REPORT_ACTIONS or SECONDARY_REPORT_ACTIONS because they weren't meant to be used in this situation. `value` property of returned options is later ignored.
const HOLD = 'HOLD';
const UNHOLD = 'UNHOLD';
const MOVE = 'MOVE';
const MERGE = 'MERGE';
const SPLIT = 'SPLIT';

function useSelectedTransactionsActions({
    report,
    reportActions,
    allTransactionsLength,
    session,
    onExportFailed,
    onExportOffline,
    policy,
    beginExportWithTemplate,
    isOnSearch,
}: {
    report?: Report;
    reportActions: ReportAction[];
    allTransactionsLength: number;
    session?: Session;
    onExportFailed?: () => void;
    onExportOffline?: () => void;
    policy?: Policy;
    beginExportWithTemplate: (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => void;
    isOnSearch?: boolean;
}) {
    const {isOffline} = useNetworkWithOfflineStatus();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const {selectedTransactionIDs, clearAllSelectedTransactions, currentSearchHash, selectedTransactions: selectedTransactionsMeta} = useSearchContext();
    const allTransactions = useAllTransactions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Stopwatch', 'Trashcan', 'ArrowRight', 'Table', 'DocumentMerge', 'Export', 'ArrowCollapse', 'ArrowSplit', 'ThumbsDown']);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(selectedTransactionIDs);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const {deleteTransactions} = useDeleteTransactions({report, reportActions, policy});
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const selectedTransactionsList = selectedTransactionIDs.reduce((acc, transactionID) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (transaction) {
            acc.push(transaction);
        }
        return acc;
    }, [] as Transaction[]);

    const knownOwnerIDs = new Set<number>();
    let hasUnknownOwner = false;

    for (const selectedTransactionInfo of Object.values(selectedTransactionsMeta ?? {})) {
        const ownerAccountID = selectedTransactionInfo?.ownerAccountID;
        if (typeof ownerAccountID === 'number') {
            knownOwnerIDs.add(ownerAccountID);
        } else {
            hasUnknownOwner = true;
        }
    }

    for (const selectedTransaction of selectedTransactionsList) {
        const reportID = selectedTransaction?.reportID;
        if (!reportID || reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            hasUnknownOwner = true;
            continue;
        }

        const parentReport = getReportOrDraftReport(reportID);
        const ownerAccountID = parentReport?.ownerAccountID;

        if (typeof ownerAccountID === 'number') {
            knownOwnerIDs.add(ownerAccountID);
        } else {
            hasUnknownOwner = true;
        }
    }

    const hasTransactionsFromMultipleOwners = hasUnknownOwner ? knownOwnerIDs.size > 0 || selectedTransactionIDs.length > 1 : knownOwnerIDs.size > 1;

    const {translate, localeCompare} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isTrackExpenseThread = isTrackExpenseReport(report);
    const isInvoice = isInvoiceReport(report);

    let iouType: IOUType = CONST.IOU.TYPE.SUBMIT;

    if (isTrackExpenseThread) {
        iouType = CONST.IOU.TYPE.TRACK;
    }
    if (isInvoice) {
        iouType = CONST.IOU.TYPE.INVOICE;
    }

    const handleDeleteTransactions = () => {
        const deletedThreadReportIDs = deleteTransactions(selectedTransactionIDs, duplicateTransactions, duplicateTransactionViolations, currentSearchHash, false);
        clearAllSelectedTransactions();
        setIsDeleteModalVisible(false);
        Navigation.removeReportScreen(new Set(deletedThreadReportIDs));
    };

    const showDeleteModal = () => {
        setIsDeleteModalVisible(true);
    };

    const hideDeleteModal = () => {
        setIsDeleteModalVisible(false);
    };

    let computedOptions: Array<DropdownOption<string>> = [];
    if (selectedTransactionIDs.length) {
        const options = [];
        const isMoneyRequestReport = isMoneyRequestReportUtils(report);
        const isReportReimbursed = report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;

        let canHoldTransactions = selectedTransactionsList.length > 0 && isMoneyRequestReport && !isReportReimbursed;
        let canUnholdTransactions = selectedTransactionsList.length > 0 && isMoneyRequestReport;

        for (const selectedTransaction of selectedTransactionsList) {
            if (!canHoldTransactions && !canUnholdTransactions) {
                continue;
            }

            if (!selectedTransaction?.transactionID) {
                canHoldTransactions = false;
                canUnholdTransactions = false;
                continue;
            }
            const iouReportAction = getIOUActionForTransactionID(reportActions, selectedTransaction.transactionID);
            const holdReportAction = getReportAction(iouReportAction?.childReportID, `${selectedTransaction?.comment?.hold ?? ''}`);
            const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(report, iouReportAction, holdReportAction, selectedTransaction, policy);

            canHoldTransactions = canHoldTransactions && canHoldRequest;
            canUnholdTransactions = canUnholdTransactions && canUnholdRequest;
        }

        if (canHoldTransactions) {
            options.push({
                text: translate('iou.hold'),
                icon: expensifyIcons.Stopwatch,
                value: HOLD,
                onSelected: () => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    if (!report?.reportID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS.getRoute({reportID: report.reportID}));
                },
            });
        }

        if (canUnholdTransactions) {
            options.push({
                text: translate('iou.unhold'),
                icon: expensifyIcons.Stopwatch,
                value: UNHOLD,
                onSelected: () => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    for (const transactionID of selectedTransactionIDs) {
                        const action = getIOUActionForTransactionID(reportActions, transactionID);
                        if (!action?.childReportID) {
                            continue;
                        }
                        unholdRequest(transactionID, action?.childReportID, policy);
                    }
                    clearAllSelectedTransactions();
                },
            });
        }

        const hasNoRejectedTransaction = selectedTransactionIDs.every((id) => !hasTransactionBeenRejected(allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + id] ?? []));
        const canRejectTransactions =
            selectedTransactionsList.length > 0 && isMoneyRequestReport && !!session?.email && !!report && canRejectReportAction(session.email, report, policy) && hasNoRejectedTransaction;
        if (canRejectTransactions) {
            options.push({
                text: translate('search.bulkActions.reject'),
                icon: expensifyIcons.ThumbsDown,
                value: CONST.REPORT.SECONDARY_ACTIONS.REJECT,
                onSelected: () => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS.getRoute({reportID: report.reportID}));
                },
            });
        }

        // Gets the list of options for the export sub-menu
        const getExportOptions = (): PopoverMenuItem[] => {
            // We provide the basic and expense level export options by default
            const exportOptions: PopoverMenuItem[] = [
                {
                    text: translate('export.basicExport'),
                    icon: expensifyIcons.Table,
                    onSelected: () => {
                        if (!report) {
                            return;
                        }
                        if (isOffline) {
                            onExportOffline?.();
                            return;
                        }
                        exportReportToCSV(
                            {reportID: report.reportID, transactionIDList: selectedTransactionIDs},
                            () => {
                                onExportFailed?.();
                            },
                            translate,
                        );
                        clearAllSelectedTransactions();
                    },
                },
            ];

            // If we've selected all the transactions on the report, we can also provide the report level export option
            const includeReportLevelExport = allTransactionsLength === selectedTransactionIDs.length;

            // If the user has any custom integration export templates, add them as export options
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, includeReportLevelExport);
            for (const template of exportTemplates) {
                exportOptions.push({
                    text: template.name,
                    icon: expensifyIcons.Table,
                    description: template.description,
                    onSelected: () => beginExportWithTemplate(template.templateName, template.type, selectedTransactionIDs, template.policyID),
                });
            }
            return exportOptions;
        };

        options.push({
            value: CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
            text: translate('common.export'),
            backButtonText: translate('common.export'),
            icon: expensifyIcons.Export,
            rightIcon: expensifyIcons.ArrowRight,
            subMenuItems: getExportOptions(),
        });

        const canSelectedExpensesBeMoved = selectedTransactionsList.every((transaction) => {
            if (!transaction) {
                return false;
            }
            const iouReportAction = getIOUActionForTransactionID(reportActions, transaction.transactionID);

            const canMoveExpense = canEditFieldOfMoneyRequest(iouReportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);
            return canMoveExpense;
        });

        const canMergeTransaction = selectedTransactionsList.length < 3 && report && policy && isMergeActionForSelectedTransactions(selectedTransactionsList, [report], [policy]);
        if (canMergeTransaction) {
            const transactionID = selectedTransactionsList.at(0)?.transactionID;
            if (transactionID) {
                options.push({
                    text: translate('common.merge'),
                    icon: expensifyIcons.ArrowCollapse,
                    value: MERGE,
                    onSelected: () => setupMergeTransactionDataAndNavigate(transactionID, selectedTransactionsList, localeCompare, [], false, isOnSearch),
                });
            }
        }

        const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
        if (canSelectedExpensesBeMoved && canUserPerformWriteAction && !hasTransactionsFromMultipleOwners) {
            options.push({
                text: translate('iou.moveExpenses', {count: selectedTransactionIDs.length}),
                icon: expensifyIcons.DocumentMerge,
                value: MOVE,
                onSelected: () => {
                    const shouldTurnOffSelectionMode = allTransactionsLength - selectedTransactionIDs.length <= 1;
                    const route = ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, report?.reportID, shouldTurnOffSelectionMode, lastVisitedPath);
                    Navigation.navigate(route);
                },
            });
        }

        const firstTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${selectedTransactionIDs.at(0)}`];
        const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransaction?.comment?.originalTransactionID}`];

        const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(firstTransaction, originalTransaction);
        const canSplitTransaction =
            selectedTransactionsList.length === 1 && report && !isExpenseSplit && isSplitAction(report, [firstTransaction], originalTransaction, login ?? '', currentUserAccountID, policy);

        if (canSplitTransaction) {
            options.push({
                text: translate('iou.split'),
                icon: expensifyIcons.ArrowSplit,
                value: SPLIT,
                onSelected: () => {
                    initSplitExpense(allTransactions, allReports, firstTransaction);
                },
            });
        }

        const canAllSelectedTransactionsBeRemoved = selectedTransactionsList.every((transaction) => {
            const canRemoveTransaction = canDeleteCardTransactionByLiabilityType(transaction);
            const action = getIOUActionForTransactionID(reportActions, transaction.transactionID);
            const isActionDeleted = isDeletedAction(action);
            const isIOUActionOwner = typeof action?.actorAccountID === 'number' && typeof session?.accountID === 'number' && action.actorAccountID === session?.accountID;

            return canRemoveTransaction && isIOUActionOwner && !isActionDeleted;
        });

        const canRemoveReportTransaction = canDeleteTransaction(report, isReportArchived);

        if (canRemoveReportTransaction && canAllSelectedTransactionsBeRemoved) {
            options.push({
                text: translate('common.delete'),
                icon: expensifyIcons.Trashcan,
                value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
                onSelected: showDeleteModal,
            });
        }
        computedOptions = options;
    }

    return {
        options: computedOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        showDeleteModal,
        hideDeleteModal,
    };
}

export default useSelectedTransactionsActions;
