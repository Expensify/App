import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import {getTransactionViolations} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';
import type {ReportTransactionsAndViolations} from '@src/types/onyx/DerivedValues';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const DEFAULT_RETURN_VALUE: ReportTransactionsAndViolations = {transactions: {}, violations: {}};

function useTransactionsAndViolationsForReport(reportID?: string) {
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});

    const {transactions, violations} = reportID ? (allReportsTransactionsAndViolations?.[reportID] ?? DEFAULT_RETURN_VALUE) : DEFAULT_RETURN_VALUE;

    const filteredViolations: Record<string, TransactionViolations> = {};
    for (const transactionViolationKey of Object.keys(violations)) {
        const transactionID = transactionViolationKey.split('_').at(1) ?? '';
        const transaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        filteredViolations[transactionViolationKey] = getTransactionViolations(transaction, violations, currentUserDetails.email ?? '', currentUserDetails.accountID, report, policy) ?? [];
    }

    return {transactions, violations: filteredViolations};
}

export default useTransactionsAndViolationsForReport;
