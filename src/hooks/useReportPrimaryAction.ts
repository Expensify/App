import type {ValueOf} from 'type-fest';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {isExpenseReport as isExpenseReportUtils} from '@libs/ReportUtils';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';
import useTransactionThreadReport from './useTransactionThreadReport';

function useReportPrimaryAction(reportID: string | undefined): ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '' {
    const {isPaidAnimationRunning, isApprovedAnimationRunning, isSubmittingAnimationRunning} = usePaymentAnimationsContext();
    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
    );

    const {reportActions} = useTransactionThreadReport(reportID);
    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    if (isExpenseReportUtils(moneyRequestReport) && !isPaidGroupPolicy(policy)) {
        return '';
    }

    if (isPaidAnimationRunning || isApprovedAnimationRunning) {
        return CONST.REPORT.PRIMARY_ACTIONS.PAY;
    }
    if (isSubmittingAnimationRunning) {
        return CONST.REPORT.PRIMARY_ACTIONS.SUBMIT;
    }

    const nonPendingDeleteTransactions = Object.values(reportTransactions).filter((t) => !isTransactionPendingDelete(t));

    return getReportPrimaryAction({
        currentUserLogin: currentUserLogin ?? '',
        currentUserAccountID: accountID,
        report: moneyRequestReport,
        chatReport,
        reportTransactions: nonPendingDeleteTransactions,
        violations,
        bankAccountList,
        policy,
        reportNameValuePairs,
        reportActions,
        reportMetadata,
        isChatReportArchived,
        invoiceReceiverPolicy,
    });
}

export default useReportPrimaryAction;
