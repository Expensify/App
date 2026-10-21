import useAlertModals from '@hooks/useAlertModals';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHoldMenuModal from '@hooks/useHoldMenuModal';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportPDFDownloadModal from '@hooks/useReportPDFDownloadModal';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {canIOUBePaid as canIOUBePaidAction, getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React, {useRef} from 'react';

import type {MoneyReportHeaderEducationalModalsHandle, RejectModalAction} from './MoneyReportHeaderEducationalModals';
import type {HoldMenuParams} from './MoneyReportHeaderModalsContext';

import MoneyReportHeaderEducationalModals from './MoneyReportHeaderEducationalModals';
import MoneyReportHeaderModalsContext from './MoneyReportHeaderModalsContext';
import {MoneyReportTransactionThreadProvider} from './MoneyReportTransactionThreadContext';

type MoneyReportHeaderModalsProps = {
    reportID: string | undefined;
    children: ReactNode;
};

function MoneyReportHeaderModals({reportID, children}: MoneyReportHeaderModalsProps) {
    // Educational modals ref
    const educationalModalsRef = useRef<MoneyReportHeaderEducationalModalsHandle>(null);

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
    const {showReportPDFDownloadModal} = useReportPDFDownloadModal();

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
            if (!moneyRequestReport?.reportID) {
                return;
            }
            showReportPDFDownloadModal({reportID: moneyRequestReport.reportID, onCancel: options?.onCancel});
        },
        openHoldEducational: () => educationalModalsRef.current?.openHoldEducational(),
        openRejectModal: (action: RejectModalAction) => educationalModalsRef.current?.openRejectModal(action),
        showOfflineModal,
        showDownloadErrorModal,
    };

    return (
        <MoneyReportHeaderModalsContext.Provider value={contextValue}>
            <MoneyReportTransactionThreadProvider reportID={moneyRequestReport?.reportID}>
                {children}

                <MoneyReportHeaderEducationalModals
                    ref={educationalModalsRef}
                    reportID={moneyRequestReport?.reportID}
                />
            </MoneyReportTransactionThreadProvider>
        </MoneyReportHeaderModalsContext.Provider>
    );
}

export default MoneyReportHeaderModals;
