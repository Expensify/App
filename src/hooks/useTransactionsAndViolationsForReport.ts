import {useMemo} from 'react';
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

    const transactionsAndViolations = useMemo<ReportTransactionsAndViolations>(() => {
        const filteredViolations = Object.keys(violations).reduce(
            (filteredTransactionViolations, transactionViolationKey) => {
                const transactionID = transactionViolationKey.split('_').at(1) ?? '';
                const transaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

                // This is our accumulator, it's okay to reassign
                // eslint-disable-next-line no-param-reassign
                filteredTransactionViolations[transactionViolationKey] = getTransactionViolations(transaction, violations, currentUserDetails.email ?? '', report, policy) ?? [];
                return filteredTransactionViolations;
            },
            {} as Record<string, TransactionViolations>,
        );

        return {transactions, violations: filteredViolations};
    }, [transactions, violations, currentUserDetails?.email, report, policy]);

    return transactionsAndViolations;
}

export default useTransactionsAndViolationsForReport;
