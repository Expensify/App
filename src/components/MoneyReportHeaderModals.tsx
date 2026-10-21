import useAlertModals from '@hooks/useAlertModals';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHoldMenuModal from '@hooks/useHoldMenuModal';
import useMoneyReportHeaderEducationalModals from '@hooks/useMoneyReportHeaderEducationalModals';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {canIOUBePaid as canIOUBePaidAction, getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React, {useRef, useState} from 'react';

import type {HoldMenuParams} from './MoneyReportHeaderModalsContext';

import MoneyReportHeaderModalsContext from './MoneyReportHeaderModalsContext';
import {MoneyReportTransactionThreadProvider} from './MoneyReportTransactionThreadContext';
import ReportPDFDownloadModal from './ReportPDFDownloadModal';

type MoneyReportHeaderModalsProps = {
    reportID: string | undefined;
    children: ReactNode;
};

function MoneyReportHeaderModals({reportID, children}: MoneyReportHeaderModalsProps) {
    const [moneyRequestReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: (report) => report?.reportID});

    return (
        <MoneyReportTransactionThreadProvider reportID={moneyRequestReportID}>
            <MoneyReportHeaderModalsContent reportID={reportID}>{children}</MoneyReportHeaderModalsContent>
        </MoneyReportTransactionThreadProvider>
    );
}

/** Rendered inside the transaction thread provider because the educational modals' follow-up actions need the transaction thread */
function MoneyReportHeaderModalsContent({reportID, children}: MoneyReportHeaderModalsProps) {
    // PDF modal state
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    // Callback invoked when the PDF modal is dismissed while still generating (e.g. Submit via PDF retracts the submit).
    const onPDFCancelRef = useRef<(() => void) | undefined>(undefined);

    // Fetch data from IDs
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);
    const isChatReportArchived = useReportIsArchived(moneyRequestReport?.chatReportID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const {convertToDisplayString} = useCurrencyListActions();
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);
    const {accountID, login: currentUserLogin} = useCurrentUserPersonalDetails();

    // Derive data for hold menu
    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', accountID, undefined, false, isChatReportArchived);
    const onlyShowPayElsewhere =
        !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', accountID, undefined, true, isChatReportArchived);
    const shouldShowPayButton = canIOUBePaid || onlyShowPayElsewhere;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton, transactions, convertToDisplayString);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(transactions);
    const transactionIDs = transactions.map((t) => t.transactionID);

    // Imperative modals
    const {showHoldMenu} = useHoldMenuModal();
    const {showOfflineModal, showDownloadErrorModal} = useAlertModals();
    const {openHoldEducational, openRejectModal} = useMoneyReportHeaderEducationalModals(moneyRequestReport?.reportID);

    const openHoldMenu = ({requestType, paymentType, methodID, onConfirm}: HoldMenuParams): Promise<void> => {
        const open = () =>
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

        // On iOS, defer by one frame so the current touch animation finishes before the modal opens
        if (getPlatform() === CONST.PLATFORM.IOS) {
            return new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                    open().then(() => resolve());
                });
            });
        }

        return open().then(() => {});
    };

    const contextValue = {
        openHoldMenu,
        openPDFDownload: (options?: {onCancel?: () => void}) => {
            onPDFCancelRef.current = options?.onCancel;
            setIsPDFModalVisible(true);
        },
        openHoldEducational,
        openRejectModal,
        showOfflineModal,
        showDownloadErrorModal,
    };

    return (
        <MoneyReportHeaderModalsContext.Provider value={contextValue}>
            {children}

            <ReportPDFDownloadModal
                reportID={moneyRequestReport?.reportID}
                isVisible={isPDFModalVisible}
                onClose={() => setIsPDFModalVisible(false)}
                onCancel={() => onPDFCancelRef.current?.()}
            />
        </MoneyReportHeaderModalsContext.Provider>
    );
}

export default MoneyReportHeaderModals;
