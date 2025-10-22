import {useCallback, useMemo, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchContext} from '@components/Search/SearchContext';
import {deleteMoneyRequest, unholdRequest} from '@libs/actions/IOU';
import {setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import {exportReportToCSV} from '@libs/actions/Report';
import {getExportTemplates} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isMergeAction} from '@libs/ReportSecondaryActionUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canEditFieldOfMoneyRequest,
    canHoldUnholdReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    isArchivedReport,
    isInvoiceReport,
    isMoneyRequestReport as isMoneyRequestReportUtils,
    isTrackExpenseReport,
} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction, Session, Transaction} from '@src/types/onyx';
import useDuplicateTransactionsAndViolations from './useDuplicateTransactionsAndViolations';
import useLocalize from './useLocalize';
import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

// We do not use PRIMARY_REPORT_ACTIONS or SECONDARY_REPORT_ACTIONS because they weren't meant to be used in this situation. `value` property of returned options is later ignored.
const HOLD = 'HOLD';
const UNHOLD = 'UNHOLD';
const MOVE = 'MOVE';
const MERGE = 'MERGE';

function useSelectedTransactionsActions({
    report,
    reportActions,
    allTransactionsLength,
    session,
    onExportFailed,
    onExportOffline,
    policy,
    beginExportWithTemplate,
}: {
    report?: Report;
    reportActions: ReportAction[];
    allTransactionsLength: number;
    session?: Session;
    onExportFailed?: () => void;
    onExportOffline?: () => void;
    policy?: Policy;
    beginExportWithTemplate: (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => void;
}) {
    const {isOffline} = useNetworkWithOfflineStatus();
    const {selectedTransactionIDs, clearSelectedTransactions} = useSearchContext();
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});

    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(selectedTransactionIDs);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const selectedTransactions = useMemo(
        () =>
            selectedTransactionIDs.reduce((acc, transactionID) => {
                const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                if (transaction) {
                    acc.push(transaction);
                }
                return acc;
            }, [] as Transaction[]),
        [allTransactions, selectedTransactionIDs],
    );

    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const isTrackExpenseThread = isTrackExpenseReport(report);
    const isInvoice = isInvoiceReport(report);

    const [archivedReportsIdSet = new Set<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: (all): ArchivedReportsIDSet => {
            const ids = new Set<string>();
            if (!all) {
                return ids;
            }

            for (const [key, value] of Object.entries(all)) {
                if (isArchivedReport(value)) {
                    ids.add(key);
                }
            }
            return ids;
        },
    });

    let iouType: IOUType = CONST.IOU.TYPE.SUBMIT;

    if (isTrackExpenseThread) {
        iouType = CONST.IOU.TYPE.TRACK;
    }
    if (isInvoice) {
        iouType = CONST.IOU.TYPE.INVOICE;
    }

    const handleDeleteTransactions = useCallback(() => {
        const iouActions = reportActions.filter((action) => isMoneyRequestAction(action));

        const transactionsWithActions = selectedTransactionIDs.map((transactionID) => ({
            transactionID,
            action: iouActions.find((action) => {
                const IOUTransactionID = getOriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.IOU>(action)?.IOUTransactionID;
                return transactionID === IOUTransactionID;
            }),
        }));
        const deletedTransactionIDs: string[] = [];
        const deletedTransactionThreadReportIDs = new Set<string>();
        transactionsWithActions.forEach(({transactionID, action}) => {
            if (!action) {
                return;
            }

            const iouReportID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUReportID : undefined;
            const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
            const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`];
            const chatIOUReportID = chatReport?.reportID;
            const isChatIOUReportArchived = archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatIOUReportID}`);
            deleteMoneyRequest(
                transactionID,
                action,
                duplicateTransactions,
                duplicateTransactionViolations,
                iouReport,
                chatReport,
                false,
                deletedTransactionIDs,
                selectedTransactionIDs,
                isChatIOUReportArchived,
            );
            deletedTransactionIDs.push(transactionID);
            if (action.childReportID) {
                deletedTransactionThreadReportIDs.add(action.childReportID);
            }
        });
        clearSelectedTransactions(true);
        setIsDeleteModalVisible(false);
        Navigation.removeReportScreen(deletedTransactionThreadReportIDs);
    }, [duplicateTransactions, duplicateTransactionViolations, reportActions, selectedTransactionIDs, clearSelectedTransactions, allReports, archivedReportsIdSet]);

    const showDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(true);
    }, []);

    const hideDeleteModal = useCallback(() => {
        setIsDeleteModalVisible(false);
    }, []);

    const computedOptions = useMemo(() => {
        if (!selectedTransactionIDs.length) {
            return [];
        }
        const options = [];
        const isMoneyRequestReport = isMoneyRequestReportUtils(report);
        const isReportReimbursed = report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
        let canHoldTransactions = selectedTransactions.length > 0 && isMoneyRequestReport && !isReportReimbursed;
        let canUnholdTransactions = selectedTransactions.length > 0 && isMoneyRequestReport;

        selectedTransactions.forEach((selectedTransaction) => {
            if (!canHoldTransactions && !canUnholdTransactions) {
                return;
            }

            if (!selectedTransaction?.transactionID) {
                canHoldTransactions = false;
                canUnholdTransactions = false;
                return;
            }
            const iouReportAction = getIOUActionForTransactionID(reportActions, selectedTransaction.transactionID);
            const {canHoldRequest, canUnholdRequest} = canHoldUnholdReportAction(iouReportAction);

            canHoldTransactions = canHoldTransactions && canHoldRequest;
            canUnholdTransactions = canUnholdTransactions && canUnholdRequest;
        });

        if (canHoldTransactions) {
            options.push({
                text: translate('iou.hold'),
                icon: Expensicons.Stopwatch,
                value: HOLD,
                onSelected: () => {
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
                icon: Expensicons.Stopwatch,
                value: UNHOLD,
                onSelected: () => {
                    selectedTransactionIDs.forEach((transactionID) => {
                        const action = getIOUActionForTransactionID(reportActions, transactionID);
                        if (!action?.childReportID) {
                            return;
                        }
                        unholdRequest(transactionID, action?.childReportID);
                    });
                    clearSelectedTransactions(true);
                },
            });
        }

        // Gets the list of options for the export sub-menu
        const getExportOptions = (): PopoverMenuItem[] => {
            // We provide the basic and expense level export options by default
            const exportOptions: PopoverMenuItem[] = [
                {
                    text: translate('export.basicExport'),
                    icon: Expensicons.Table,
                    onSelected: () => {
                        if (!report) {
                            return;
                        }
                        if (isOffline) {
                            onExportOffline?.();
                            return;
                        }
                        exportReportToCSV({reportID: report.reportID, transactionIDList: selectedTransactionIDs}, () => {
                            onExportFailed?.();
                        });
                        clearSelectedTransactions(true);
                    },
                },
            ];

            // If we've selected all the transactions on the report, we can also provide the report level export option
            const includeReportLevelExport = allTransactionsLength === selectedTransactionIDs.length;

            // If the user has any custom integration export templates, add them as export options
            const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, policy, includeReportLevelExport);
            for (const template of exportTemplates) {
                exportOptions.push({
                    text: template.name,
                    icon: Expensicons.Table,
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
            icon: Expensicons.Export,
            rightIcon: Expensicons.ArrowRight,
            subMenuItems: getExportOptions(),
        });

        const canSelectedExpensesBeMoved = selectedTransactions.every((transaction) => {
            if (!transaction) {
                return false;
            }
            const iouReportAction = getIOUActionForTransactionID(reportActions, transaction.transactionID);

            const canMoveExpense = canEditFieldOfMoneyRequest(iouReportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);
            return canMoveExpense;
        });

        const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report, isReportArchived);
        if (canSelectedExpensesBeMoved && canUserPerformWriteAction) {
            options.push({
                text: translate('iou.moveExpenses', {count: selectedTransactionIDs.length}),
                icon: Expensicons.DocumentMerge,
                value: MOVE,
                onSelected: () => {
                    const shouldTurnOffSelectionMode = allTransactionsLength - selectedTransactionIDs.length <= 1;
                    const route = ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, report?.reportID, shouldTurnOffSelectionMode, lastVisitedPath);
                    Navigation.navigate(route);
                },
            });
        }

        // In phase 1, we only show merge action if report is eligible for merge and only one transaction is selected
        const canMergeTransaction = selectedTransactions.length === 1 && report && isMergeAction(report, selectedTransactions, policy);
        if (canMergeTransaction) {
            options.push({
                text: translate('common.merge'),
                icon: Expensicons.ArrowCollapse,
                value: MERGE,
                onSelected: () => {
                    const targetTransaction = selectedTransactions.at(0);

                    if (!report || !targetTransaction) {
                        return;
                    }

                    setupMergeTransactionData(targetTransaction.transactionID, {targetTransactionID: targetTransaction.transactionID});
                    Navigation.navigate(ROUTES.MERGE_TRANSACTION_LIST_PAGE.getRoute(targetTransaction.transactionID, Navigation.getActiveRoute()));
                },
            });
        }

        const canAllSelectedTransactionsBeRemoved = Object.values(selectedTransactions).every((transaction) => {
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
                icon: Expensicons.Trashcan,
                value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
                onSelected: showDeleteModal,
            });
        }
        return options;
    }, [
        selectedTransactionIDs,
        report,
        selectedTransactions,
        translate,
        isReportArchived,
        policy,
        reportActions,
        clearSelectedTransactions,
        allTransactionsLength,
        integrationsExportTemplates,
        csvExportLayouts,
        isOffline,
        onExportOffline,
        onExportFailed,
        beginExportWithTemplate,
        outstandingReportsByPolicyID,
        iouType,
        lastVisitedPath,
        session?.accountID,
        showDeleteModal,
    ]);

    return {
        options: computedOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        showDeleteModal,
        hideDeleteModal,
    };
}

export default useSelectedTransactionsActions;
