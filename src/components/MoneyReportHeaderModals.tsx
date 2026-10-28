import useAlertModals from '@hooks/useAlertModals';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHoldMenuModal from '@hooks/useHoldMenuModal';
import useMoneyReportHeaderEducationalModals from '@hooks/useMoneyReportHeaderEducationalModals';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportPDFDownloadModal from '@hooks/useReportPDFDownloadModal';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getHoldMenuAmounts} from '@libs/HoldMenuUtils';
import {canIOUBePaid as canIOUBePaidAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import React from 'react';

import type {HoldMenuParams} from './MoneyReportHeaderModalsContext';

import MoneyReportHeaderModalsContext from './MoneyReportHeaderModalsContext';
import {MoneyReportTransactionThreadProvider} from './MoneyReportTransactionThreadContext';

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

    // Imperative modals
    const {showHoldMenu} = useHoldMenuModal();
    const {showOfflineModal, showDownloadErrorModal} = useAlertModals();
    const {showReportPDFDownloadModal} = useReportPDFDownloadModal();
    const {openHoldEducational, openRejectModal} = useMoneyReportHeaderEducationalModals(moneyRequestReport?.reportID);

    // Wait one frame so the current touch animation finishes before the modal opens
    const openHoldMenu = ({requestType, paymentType, methodID, onConfirm}: HoldMenuParams) => {
        requestAnimationFrame(() => {
            showHoldMenu({
                reportID: moneyRequestReport?.reportID,
                chatReportID: chatReport?.reportID,
                requestType,
                paymentType,
                methodID,
                ...getHoldMenuAmounts(moneyRequestReport, shouldShowPayButton, transactions, convertToDisplayString),
                onConfirm,
            });
        });
    };

    const contextValue = {
        openHoldMenu,
        openPDFDownload: () => {
            if (!moneyRequestReport?.reportID) {
                return Promise.resolve(undefined);
            }
            return showReportPDFDownloadModal({reportID: moneyRequestReport.reportID});
        },
        openHoldEducational,
        openRejectModal,
        showOfflineModal,
        showDownloadErrorModal,
    };

    return <MoneyReportHeaderModalsContext.Provider value={contextValue}>{children}</MoneyReportHeaderModalsContext.Provider>;
}

export default MoneyReportHeaderModals;
