import React, {useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {InteractionManager} from 'react-native';
import useDecisionModal from '@hooks/useDecisionModal';
import useHoldMenuModal from '@hooks/useHoldMenuModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';
import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import MoneyReportHeaderEducationalModals from './MoneyReportHeaderEducationalModals';
import type {MoneyReportHeaderEducationalModalsHandle, RejectModalAction} from './MoneyReportHeaderEducationalModals';
import MoneyReportHeaderModalsContext from './MoneyReportHeaderModalsContext';
import type {HoldMenuParams} from './MoneyReportHeaderModalsContext';
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

    // Derive data for hold menu
    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList);
    const onlyShowPayElsewhere = !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, undefined, true);
    const shouldShowPayButton = canIOUBePaid || onlyShowPayElsewhere;
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(moneyRequestReport, shouldShowPayButton);
    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const transactionIDs = transactions.map((t) => t.transactionID);

    // Imperative modals
    const {showHoldMenu} = useHoldMenuModal();
    const {showDecisionModal} = useDecisionModal();
    const {translate} = useLocalize();

    const showOfflineModal = () => {
        showDecisionModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

    const showDownloadErrorModal = () => {
        showDecisionModal({
            title: translate('common.downloadFailedTitle'),
            prompt: translate('common.downloadFailedDescription'),
            secondOptionText: translate('common.buttonConfirm'),
        });
    };

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

        // On iOS, delay opening the hold menu until active touch interactions finish to prevent visual glitches
        if (getPlatform() === CONST.PLATFORM.IOS) {
            return new Promise<void>((resolve) => {
                // eslint-disable-next-line @typescript-eslint/no-deprecated -- InteractionManager is widely used across the codebase (120+ files) and kept alive via a dedicated RN patch
                InteractionManager.runAfterInteractions(() => {
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
        </MoneyReportHeaderModalsContext.Provider>
    );
}

export default MoneyReportHeaderModals;
