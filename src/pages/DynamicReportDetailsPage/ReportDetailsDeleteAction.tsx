import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import {useSearchSelectionActions} from '@components/Search/SearchContext';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';

import {isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getOriginalTransactionWithSplitInfo} from '@libs/TransactionUtils';

import {deleteTrackExpense} from '@userActions/IOU/TrackExpense';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type {CaseID, ReportDetailsRequestData} from './types';

import useReportDetailsDeleteModal from './hooks/useReportDetailsDeleteModal';

type ReportDetailsDeleteActionProps = {
    reportID: string;
    caseID: CaseID;
    requestData: ReportDetailsRequestData;
};

/** The Delete row of the money cases, deleting a track expense or a regular expense, or opening the split edit flow */
function ReportDetailsDeleteAction({reportID, caseID, requestData}: ReportDetailsDeleteActionProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowSplit', 'Trashcan']);
    const {removeTransaction} = useSearchSelectionActions();
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const currentUserEmail = currentUserPersonalDetails?.email;
    const {getCurrencyDecimals} = useCurrencyListActions();
    const showDeleteModal = useReportDetailsDeleteModal(reportID, caseID);
    const {shouldShowEditSplitOnDeleteAction, deleteMenuItemTitle} = requestData;

    const deleteTransaction = () => {
        const {
            requestParentReportAction,
            iouTransaction,
            iouOriginalTransaction,
            moneyRequestReport,
            moneyRequestReportActions,
            transactionThreadReportActions,
            iouTransactionID,
            iouReport,
            iouReportTransactions,
            chatIOUReport,
            duplicateTransactions,
            duplicateTransactionViolations,
            isSingleTransactionView,
            isMoneyRequestReportArchived,
            isChatIOUReportArchived,
            iouPolicy,
            deleteTransactions,
        } = requestData;
        if (!requestParentReportAction) {
            return;
        }

        const isTrackExpense = isTrackExpenseAction(requestParentReportAction);
        const {isExpenseSplit: isSelfDMExpenseSplit} = getOriginalTransactionWithSplitInfo(iouTransaction, iouOriginalTransaction);

        if (isTrackExpense && !isSelfDMExpenseSplit) {
            deleteTrackExpense({
                chatReportID: moneyRequestReport?.reportID,
                chatReport: moneyRequestReport,
                chatReportActions: moneyRequestReportActions,
                transactionThreadReportActions,
                transactionID: iouTransactionID,
                reportAction: requestParentReportAction,
                iouReport,
                iouReportTransactions,
                chatIOUReport,
                transactions: duplicateTransactions,
                violations: duplicateTransactionViolations,
                isSingleTransactionView,
                isChatReportArchived: isMoneyRequestReportArchived,
                isChatIOUReportArchived,
                allTransactionViolationsParam: allTransactionViolations,
                currentUserAccountID,
                currentUserEmail: currentUserEmail ?? '',
                policy: iouPolicy,
                getCurrencyDecimals,
            });
        } else if (iouTransactionID) {
            const deleteResult = deleteTransactions([iouTransactionID], duplicateTransactions, duplicateTransactionViolations, undefined, isSingleTransactionView);
            if (deleteResult.action === 'redirected') {
                return;
            }
            removeTransaction(iouTransactionID);
        }
    };

    return (
        <MenuItemAction
            key={CONST.REPORT_DETAILS_MENU_ITEM.DELETE}
            icon={shouldShowEditSplitOnDeleteAction ? expensifyIcons.ArrowSplit : expensifyIcons.Trashcan}
            title={deleteMenuItemTitle}
            onPress={shouldShowEditSplitOnDeleteAction ? () => deleteTransaction() : () => showDeleteModal(requestData, () => deleteTransaction())}
        />
    );
}

export default ReportDetailsDeleteAction;
