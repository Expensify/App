import {useMemo} from 'react';
import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import {getTransactionViolations} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';
import type {ReportTransactionsAndViolations} from '@src/types/onyx/DerivedValues';

const DEFAULT_RETURN_VALUE: ReportTransactionsAndViolations = {transactions: {}, violations: {}};

function useTransactionsAndViolationsForReport(reportID?: string) {
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    if (!reportID) {
        return DEFAULT_RETURN_VALUE;
    }

    const {transactions, violations} = allReportsTransactionsAndViolations?.[reportID ?? CONST.DEFAULT_NUMBER_ID] ?? DEFAULT_RETURN_VALUE;

    const transactionsAndViolations = useMemo<ReportTransactionsAndViolations>(() => {
        const filteredViolations = Object.keys(violations).reduce(
            (filteredTransactionViolations, transactionViolationKey) => {
                const transactionID = transactionViolationKey.split('_').at(1) ?? '';
                const transaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                filteredTransactionViolations[transactionViolationKey] = getTransactionViolations(transaction, violations) ?? [];
                return filteredTransactionViolations;
            },
            {} as Record<string, TransactionViolations>,
        );

        return {transactions, violations: filteredViolations};
    }, [transactions, violations]);

    return transactionsAndViolations;
}

export default useTransactionsAndViolationsForReport;
