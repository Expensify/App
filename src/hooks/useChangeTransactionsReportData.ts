import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

type ChangeTransactionsReportData = {
    transactions: Transaction[];
    currentTransactionViolations: Record<string, TransactionViolation[]>;
    transactionDuplicatesByTransactionID: Record<string, string[] | undefined>;
    siblingNonDuplicatedViolationsByTransactionID: Record<string, TransactionViolation[]>;
};

function getTransactionViolationsForChangeReport(transactionIDs: string[], transactionViolations: OnyxCollection<TransactionViolation[]>): Record<string, TransactionViolation[]> {
    const violationsByTransactionID: Record<string, TransactionViolation[]> = {};
    for (const id of transactionIDs) {
        violationsByTransactionID[id] = transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
    }

    const siblingIDs = new Set<string>();
    for (const id of transactionIDs) {
        const duplicateViolation = violationsByTransactionID[id].find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
        if (duplicateViolation?.data?.duplicates) {
            for (const siblingID of duplicateViolation.data.duplicates) {
                siblingIDs.add(siblingID);
            }
        }
    }

    for (const siblingID of siblingIDs) {
        if (siblingID in violationsByTransactionID) {
            continue;
        }
        violationsByTransactionID[siblingID] = transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${siblingID}`] ?? [];
    }

    return violationsByTransactionID;
}

function getChangeTransactionsReportData(transactions: Transaction[], violationsByTransactionID: Record<string, TransactionViolation[]>): ChangeTransactionsReportData {
    const currentTransactionViolations = transactions.reduce<Record<string, TransactionViolation[]>>((acc, transaction) => {
        acc[transaction.transactionID] = violationsByTransactionID[transaction.transactionID] ?? [];
        return acc;
    }, {});

    const transactionDuplicatesByTransactionID = transactions.reduce<Record<string, string[] | undefined>>((acc, transaction) => {
        const duplicateViolation = currentTransactionViolations[transaction.transactionID]?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
        acc[transaction.transactionID] = duplicateViolation?.data?.duplicates;
        return acc;
    }, {});

    const siblingIDs = [
        ...new Set(
            Object.values(transactionDuplicatesByTransactionID)
                .filter((ids): ids is string[] => !!ids)
                .flat(),
        ),
    ];

    const siblingNonDuplicatedViolationsByTransactionID = siblingIDs.reduce<Record<string, TransactionViolation[]>>((acc, id) => {
        const siblingViolations = violationsByTransactionID[id] ?? [];
        const nonDuplicatedViolations = siblingViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
        if (nonDuplicatedViolations.length > 0) {
            acc[id] = nonDuplicatedViolations;
        }
        return acc;
    }, {});

    return {
        transactions,
        currentTransactionViolations,
        transactionDuplicatesByTransactionID,
        siblingNonDuplicatedViolationsByTransactionID,
    };
}

function useChangeTransactionsReportData(transactionIDs: string[]): ChangeTransactionsReportData {
    const [transactions = getEmptyArray<Transaction>()] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: (allTransactions) =>
                transactionIDs.map((id) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((transaction): transaction is Transaction => !!transaction),
        },
        [transactionIDs],
    );

    const [violationsByTransactionID = CONST.EMPTY_OBJECT] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        {
            selector: (allViolations) => getTransactionViolationsForChangeReport(transactionIDs, allViolations),
        },
        [transactionIDs],
    );

    return getChangeTransactionsReportData(transactions, violationsByTransactionID);
}

export default useChangeTransactionsReportData;
export {getChangeTransactionsReportData, getTransactionViolationsForChangeReport};
export type {ChangeTransactionsReportData};
