import React, {useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {InteractionManager} from 'react-native';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import MoneyReportHeaderEducationalModals from './MoneyReportHeaderEducationalModals';
import type {RejectModalAction} from './MoneyReportHeaderEducationalModals';
import MoneyReportHeaderModalsContext from './MoneyReportHeaderModalsContext';
import type {HoldMenuParams} from './MoneyReportHeaderModalsContext';
import type {ActionHandledType} from './ProcessMoneyReportHoldMenu';
import ProcessMoneyReportHoldMenu from './ProcessMoneyReportHoldMenu';
import ReportPDFDownloadModal from './ReportPDFDownloadModal';

type MoneyReportHeaderModalsProps = {
    reportID: string | undefined;
    children: ReactNode;
};

function MoneyReportHeaderModals({reportID, children}: MoneyReportHeaderModalsProps) {
    // Hold menu state
    const [isHoldMenuVisible, setIsHoldMenuVisible] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentMethodType>();
    const [requestType, setRequestType] = useState<ActionHandledType>();
    const [selectedVBBA, setSelectedVBBA] = useState<number>();
    const holdMenuOnConfirmRef = useRef<((full: boolean) => void) | undefined>();

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
    const shouldShowPayButton = canIOUBePaid;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
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

    // Context API
    const openHoldMenu = ({requestType: type, paymentType: pType, methodID, onConfirm}: HoldMenuParams) => {
        setRequestType(type);
        setPaymentType(pType);
        setSelectedVBBA(pType === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined);
        holdMenuOnConfirmRef.current = onConfirm;
        if (getPlatform() === CONST.PLATFORM.IOS) {
            // InteractionManager delays modal until current interaction completes, preventing visual glitches on iOS
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => setIsHoldMenuVisible(true));
        } else {
            setIsHoldMenuVisible(true);
        }
    };

    const closeHoldMenu = () => {
        setSelectedVBBA(undefined);
        setIsHoldMenuVisible(false);
        holdMenuOnConfirmRef.current = undefined;
    };

    const contextValue = {
        openHoldMenu,
        closeHoldMenu,
        openPDFDownload: () => setIsPDFModalVisible(true),
        openHoldEducational: () => setIsHoldEducationalModalVisible(true),
        openRejectModal: (action: RejectModalAction) => setRejectModalAction(action),
    };

    return (
        <MoneyReportHeaderModalsContext.Provider value={contextValue}>
            {children}

            {isHoldMenuVisible && requestType !== undefined && (
                <ProcessMoneyReportHoldMenu
                    nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
                    requestType={requestType}
                    fullAmount={fullAmount}
                    onClose={closeHoldMenu}
                    isVisible={isHoldMenuVisible}
                    paymentType={paymentType}
                    methodID={paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? selectedVBBA : undefined}
                    chatReport={chatReport}
                    moneyRequestReport={moneyRequestReport}
                    hasNonHeldExpenses={!hasOnlyHeldExpenses}
                    onConfirm={(full) => holdMenuOnConfirmRef.current?.(full)}
                    transactionCount={transactionIDs.length}
                    transactions={transactions}
                />
            )}

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
