import {useCallback, useMemo, useState} from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchContext} from '@components/Search/SearchContext';
import {deleteMoneyRequest, unholdRequest} from '@libs/actions/IOU';
import {setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {exportReportToCSV} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID, getOriginalMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isMergeAction} from '@libs/ReportSecondaryActionUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canEditFieldOfMoneyRequest,
    canHoldUnholdReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    isInvoiceReport,
    isMoneyRequestReport as isMoneyRequestReportUtils,
    isTrackExpenseReport,
} from '@libs/ReportUtils';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OriginalMessageIOU, Policy, Report, ReportAction, Session, Transaction} from '@src/types/onyx';
import useDuplicateTransactionsAndViolations from './useDuplicateTransactionsAndViolations';
import useLocalize from './useLocalize';
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
    policy,
    beginExportWithTemplate,
}: {
    report?: Report;
    reportActions: ReportAction[];
    allTransactionsLength: number;
    session?: Session;
    onExportFailed?: () => void;
    policy?: Policy;
    beginExportWithTemplate: (templateName: string, templateType: string, transactionIDList: string[], policyID?: string) => void;
}) {
    const {selectedTransactionIDs, clearSelectedTransactions} = useSearchContext();
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});

    // Collate the list of user-created in-app export templates
    const customInAppTemplates = useMemo(() => {
        const policyTemplates = Object.entries(policy?.exportLayouts ?? {}).map(([templateName, layout]) => ({
            ...layout,
            templateName,
            description: policy?.name,
            policyID: policy?.id,
        }));

        const csvTemplates = Object.entries(csvExportLayouts ?? {}).map(([templateName, layout]) => ({
            ...layout,
            templateName,
            description: '',
            policyID: '',
        }));

        return [...policyTemplates, ...csvTemplates];
    }, [csvExportLayouts, policy]);

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
                const IOUTransactionID = (getOriginalMessage(action) as OriginalMessageIOU)?.IOUTransactionID;
                return transactionID === IOUTransactionID;
            }),
        }));
        const deletedTransactionIDs: string[] = [];
        transactionsWithActions.forEach(({transactionID, action}) => {
            if (!action) {
                return;
            }

            deleteMoneyRequest(transactionID, action, duplicateTransactions, duplicateTransactionViolations, false, deletedTransactionIDs);
            deletedTransactionIDs.push(transactionID);
        });
        clearSelectedTransactions(true);
        if (allTransactionsLength - transactionsWithActions.length <= 1) {
            turnOffMobileSelectionMode();
        }
        setIsDeleteModalVisible(false);
    }, [duplicateTransactions, duplicateTransactionViolations, allTransactionsLength, reportActions, selectedTransactionIDs, clearSelectedTransactions]);

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
                        exportReportToCSV({reportID: report.reportID, transactionIDList: selectedTransactionIDs}, () => {
                            onExportFailed?.();
                        });
                        clearSelectedTransactions(true);
                    },
                },
                {
                    text: translate('export.expenseLevelExport'),
                    icon: Expensicons.Table,
                    onSelected: () => {
                        if (!report) {
                            return;
                        }
                        beginExportWithTemplate(CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT, CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS, selectedTransactionIDs);
                    },
                },
            ];

            // If we've selected all the transactions on the report, we can also provide the report level export option
            if (allTransactionsLength === selectedTransactionIDs.length) {
                exportOptions.push({
                    text: translate('export.reportLevelExport'),
                    icon: Expensicons.Table,
                    onSelected: () =>
                        // The report level export template is not policy specific, so we don't need to pass a policyID
                        beginExportWithTemplate(CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT, CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS, selectedTransactionIDs),
                });
            }

            // If the user has any custom integration export templates, add them as export options
            if (integrationsExportTemplates && integrationsExportTemplates.length > 0) {
                for (const template of integrationsExportTemplates) {
                    exportOptions.push({
                        text: template.name,
                        icon: Expensicons.Table,
                        onSelected: () => beginExportWithTemplate(template.name, CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS, selectedTransactionIDs),
                    });
                }
            }

            // If the user has any custom in-app export templates, add them as export options
            if (customInAppTemplates && customInAppTemplates.length > 0) {
                for (const template of customInAppTemplates) {
                    exportOptions.push({
                        text: template.name,
                        icon: Expensicons.Table,
                        description: template.description,
                        onSelected: () => beginExportWithTemplate(template.name, CONST.EXPORT_TEMPLATE_TYPES.IN_APP, selectedTransactionIDs, template.policyID),
                    });
                }
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

            const canMoveExpense = canEditFieldOfMoneyRequest(iouReportAction, CONST.EDIT_REQUEST_FIELD.REPORT);
            return canMoveExpense;
        });

        const canUserPerformWriteAction = canUserPerformWriteActionReportUtils(report);
        if (canSelectedExpensesBeMoved && canUserPerformWriteAction) {
            options.push({
                text: translate('iou.moveExpenses', {count: selectedTransactionIDs.length}),
                icon: Expensicons.DocumentMerge,
                value: MOVE,
                onSelected: () => {
                    const shouldTurnOffSelectionMode = allTransactionsLength - selectedTransactionIDs.length <= 1;
                    const route = ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, report?.reportID, shouldTurnOffSelectionMode);
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
        reportActions,
        clearSelectedTransactions,
        onExportFailed,
        allTransactionsLength,
        iouType,
        session?.accountID,
        showDeleteModal,
        policy,
        beginExportWithTemplate,
        integrationsExportTemplates,
        customInAppTemplates,
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
