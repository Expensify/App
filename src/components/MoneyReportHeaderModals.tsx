import React, {useState} from 'react';
import type {ReactNode} from 'react';
import useHoldMenuModal from '@hooks/useHoldMenuModal';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyReportHeaderEducationalModals from './MoneyReportHeaderEducationalModals';
import type {RejectModalAction} from './MoneyReportHeaderEducationalModals';
import MoneyReportHeaderModalsContext from './MoneyReportHeaderModalsContext';
import type {HoldMenuParams} from './MoneyReportHeaderModalsContext';
import ReportPDFDownloadModal from './ReportPDFDownloadModal';

type MoneyReportHeaderModalsProps = {
    reportID: string | undefined;
    children: ReactNode;
};

function MoneyReportHeaderModals({reportID, children}: MoneyReportHeaderModalsProps) {
    // Educational modals state
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<RejectModalAction | null>(null);

    // PDF modal state
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);

    // Fetch data from IDs
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const {isOffline} = useNetwork();

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);

    // Derive data for hold menu
    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, canIOUBePaid);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const transactionIDs = transactions.map((t) => t.transactionID);

    // Derive data for educational modals
    const nonDeletedTransactions = getAllNonDeletedTransactions(transactions, reportActions, isOffline, true);
    const visibleTransactionsForThreadID = nonDeletedTransactions?.filter((t) => isOffline || t.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactionsForThreadID?.map((t) => t.transactionID);
    const transactionThreadReportID = getOneTransactionThreadReportID(moneyRequestReport, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const requestParentReportAction = (() => {
        if (!reportActions || !transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return reportActions.find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => action.reportActionID === transactionThreadReport.parentReportActionID);
    })();

    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`);

    // Imperative hold menu
    const {showHoldMenu} = useHoldMenuModal();

    const openHoldMenu = ({requestType, paymentType, methodID, onConfirm}: HoldMenuParams) => {
        showHoldMenu({
            reportID: moneyRequestReport?.reportID,
            chatReportID: chatReport?.reportID,
            requestType,
            paymentType,
            methodID,
            nonHeldAmount: !hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined,
            fullAmount,
            hasNonHeldExpenses: !hasOnlyHeldExpenses,
            transactionCount: transactionIDs.length,
            onConfirm,
        });
    };

    const contextValue = {
        openHoldMenu,
        openPDFDownload: () => setIsPDFModalVisible(true),
        openHoldEducational: () => setIsHoldEducationalModalVisible(true),
        openRejectModal: (action: RejectModalAction) => setRejectModalAction(action),
    };

    return (
        <MoneyReportHeaderModalsContext.Provider value={contextValue}>
            {children}

            <MoneyReportHeaderEducationalModals
                requestParentReportAction={requestParentReportAction}
                transaction={transaction}
                reportID={moneyRequestReport?.reportID}
                isHoldEducationalVisible={isHoldEducationalModalVisible}
                rejectModalAction={rejectModalAction}
                onHoldEducationalDismissed={() => setIsHoldEducationalModalVisible(false)}
                onRejectModalDismissed={() => setRejectModalAction(null)}
            />

            <ReportPDFDownloadModal
                reportID={moneyRequestReport?.reportID}
                isVisible={isPDFModalVisible}
                onClose={() => setIsPDFModalVisible(false)}
            />
        </MoneyReportHeaderModalsContext.Provider>
    );
}

export default MoneyReportHeaderModals;
