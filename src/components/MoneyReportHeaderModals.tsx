import React, {useRef, useState} from 'react';
import type {ReactNode} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Decision, HoldMenu} from './Dialog';
import MoneyReportHeaderEducationalModals from './MoneyReportHeaderEducationalModals';
import type {MoneyReportHeaderEducationalModalsHandle, RejectModalAction} from './MoneyReportHeaderEducationalModals';
import MoneyReportHeaderModalsContext from './MoneyReportHeaderModalsContext';
import type {HoldMenuParams} from './MoneyReportHeaderModalsContext';
import {MoneyReportTransactionThreadProvider} from './MoneyReportTransactionThreadContext';
import ReportPDFDownloadModal from './ReportPDFDownloadModal';

type MoneyReportHeaderModalsProps = {
    reportID: string | undefined;
    children: ReactNode;
};

function MoneyReportHeaderModals({reportID, children}: MoneyReportHeaderModalsProps) {
    // PDF modal state
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);

    // Educational modals ref
    const educationalModalsRef = useRef<MoneyReportHeaderEducationalModalsHandle>(null);

    // Fetch data from IDs
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const transactions = Object.values(reportTransactions);
    const {accountID, login: currentUserLogin} = useCurrentUserPersonalDetails();

    // Derive data for hold menu
    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', accountID);
    const onlyShowPayElsewhere = !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', accountID, undefined, true);
    const shouldShowPayButton = canIOUBePaid || onlyShowPayElsewhere;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton, transactions);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(transactions);
    const transactionIDs = transactions.map((t) => t.transactionID);

    const {translate} = useLocalize();

    const showOfflineModal = () => {
        // `upsert` so rapid taps don't stack duplicate offline dialogs.
        Decision.upsert({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            secondOptionText: translate('common.buttonConfirm'),
            secondOptionVariant: 'neutral',
        });
    };

    const showDownloadErrorModal = () => {
        Decision.upsert({
            title: translate('common.downloadFailedTitle'),
            prompt: translate('common.downloadFailedDescription'),
            secondOptionText: translate('common.buttonConfirm'),
            secondOptionVariant: 'neutral',
        });
    };

    const openHoldMenu = ({requestType, paymentType, methodID, onConfirm}: HoldMenuParams): Promise<void> => {
        const open = () => {
            // Discriminated union: presence of `nonHeldAmount` selects partial dialog; absence selects full-only with `transactionCount`.
            if (!hasOnlyHeldExpenses && hasValidNonHeldAmount) {
                return HoldMenu.upsert({
                    reportID: moneyRequestReport?.reportID,
                    chatReportID: chatReport?.reportID,
                    requestType,
                    paymentType,
                    methodID,
                    fullAmount,
                    onConfirm,
                    nonHeldAmount,
                });
            }
            return HoldMenu.upsert({
                reportID: moneyRequestReport?.reportID,
                chatReportID: chatReport?.reportID,
                requestType,
                paymentType,
                methodID,
                fullAmount,
                onConfirm,
                transactionCount: transactionIDs.length,
            });
        };

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
        openPDFDownload: () => setIsPDFModalVisible(true),
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

                <ReportPDFDownloadModal
                    reportID={moneyRequestReport?.reportID}
                    isVisible={isPDFModalVisible}
                    onClose={() => setIsPDFModalVisible(false)}
                />
            </MoneyReportTransactionThreadProvider>
        </MoneyReportHeaderModalsContext.Provider>
    );
}

export default MoneyReportHeaderModals;
