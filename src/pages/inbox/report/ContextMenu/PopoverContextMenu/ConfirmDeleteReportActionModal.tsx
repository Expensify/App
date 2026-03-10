import {useState} from 'react';
import {DeviceEventEmitter, InteractionManager} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import type {ModalProps} from '@components/Modal/Global/ModalContext';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchStateContext} from '@components/Search/SearchContext';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {deleteTrackExpense} from '@libs/actions/IOU';
import {deleteAppReport, deleteReportComment} from '@libs/actions/Report';
import {getOriginalMessage, isMoneyRequestAction, isReportPreviewAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getOriginalReportID} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type ConfirmDeleteReportActionModalProps = ModalProps & {
    reportID: string;
    reportActionID: string;
    actionSourceReportID?: string;
};

function ConfirmDeleteReportActionModal({closeModal, reportID, reportActionID, actionSourceReportID}: ConfirmDeleteReportActionModalProps) {
    const {translate} = useLocalize();
    const {email, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {currentSearchHash} = useSearchStateContext();

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [sourceReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${actionSourceReportID}`);
    const actionReportActions = reportActions?.[reportActionID] ? reportActions : sourceReportActions;
    const reportAction = actionReportActions?.[reportActionID];

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const isReportArchived = useReportIsArchived(reportID);
    const originalReportID = getOriginalReportID(reportID, reportAction, actionReportActions);
    const [originalReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);
    const {iouReport, chatReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(reportAction);

    const transactionIDs: string[] = [];
    if (isMoneyRequestAction(reportAction)) {
        const originalMessage = getOriginalMessage(reportAction);
        if (originalMessage && 'IOUTransactionID' in originalMessage && !!originalMessage.IOUTransactionID) {
            transactionIDs.push(originalMessage.IOUTransactionID);
        }
    }

    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transactionIDs);
    const {deleteTransactions} = useDeleteTransactions({
        report,
        reportActions: reportAction ? [reportAction] : [],
        policy,
    });

    const ancestors = useAncestors(originalReport);
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(originalReport?.iouReportID);

    const [isVisible, setIsVisible] = useState(true);
    const [closeAction, setCloseAction] = useState<typeof ModalActions.CONFIRM | typeof ModalActions.CLOSE>(ModalActions.CLOSE);

    const handleConfirm = () => {
        if (isMoneyRequestAction(reportAction)) {
            const originalMessage = getOriginalMessage(reportAction);
            if (isTrackExpenseAction(reportAction)) {
                deleteTrackExpense({
                    chatReportID: reportID,
                    chatReport: report,
                    transactionID: originalMessage?.IOUTransactionID,
                    reportAction,
                    iouReport,
                    chatIOUReport: chatReport,
                    transactions: duplicateTransactions,
                    violations: duplicateTransactionViolations,
                    isSingleTransactionView: undefined,
                    isChatReportArchived: isReportArchived,
                    isChatIOUReportArchived,
                    allTransactionViolationsParam: allTransactionViolations,
                    currentUserAccountID,
                });
            } else if (originalMessage?.IOUTransactionID) {
                deleteTransactions([originalMessage.IOUTransactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash);
            }
        } else if (isReportPreviewAction(reportAction)) {
            deleteAppReport(childReport, selfDMReport, email ?? '', currentUserAccountID, reportTransactions, allTransactionViolations, bankAccountList, currentSearchHash);
        } else if (reportAction) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                deleteReportComment(report, reportAction, ancestors, isReportArchived, isOriginalReportArchived, email ?? '', visibleReportActionsData ?? undefined);
            });
        }

        DeviceEventEmitter.emit(`deletedReportAction_${reportID}`, reportAction?.reportActionID);
        setCloseAction(ModalActions.CONFIRM);
        setIsVisible(false);
    };

    const handleCancel = () => {
        setCloseAction(ModalActions.CLOSE);
        setIsVisible(false);
    };

    const handleModalHide = () => {
        if (isVisible) {
            return;
        }
        closeModal({action: closeAction});
    };

    return (
        <ConfirmModal
            title={translate('reportActionContextMenu.deleteAction', {action: reportAction})}
            isVisible={isVisible}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onModalHide={handleModalHide}
            prompt={translate('reportActionContextMenu.deleteConfirmation', {action: reportAction})}
            confirmText={translate('common.delete')}
            cancelText={translate('common.cancel')}
            danger
        />
    );
}

export default ConfirmDeleteReportActionModal;
