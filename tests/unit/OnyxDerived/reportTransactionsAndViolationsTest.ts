import reportTransactionsAndViolationsConfig from '@libs/actions/OnyxDerived/configs/reportTransactionsAndViolations';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';

type Compute = typeof reportTransactionsAndViolationsConfig.compute;

const txKey = (id: string) => `${ONYXKEYS.COLLECTION.TRANSACTION}${id}` as const;
const violationsKey = (id: string) => `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}` as const;
const makeTx = (id: string, reportID: string | undefined): Transaction => ({...createRandomTransaction(Number(id)), transactionID: id, reportID});
const dupViolation: TransactionViolation = {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION};

describe('reportTransactionsAndViolations compute', () => {
    it('places a transaction under its reportID', () => {
        const transactions: OnyxCollection<Transaction> = {[txKey('1')]: makeTx('1', 'reportA')};
        const sourceValues: Parameters<Compute>[1]['sourceValues'] = {[ONYXKEYS.COLLECTION.TRANSACTION]: transactions};

        const result = reportTransactionsAndViolationsConfig.compute([transactions, undefined], {sourceValues});

        expect(result.reportA?.transactions?.[txKey('1')]).toBeTruthy();
    });

    it('relocates a transaction to the new report and removes it from the old one when its reportID changes', () => {
        // Seed: tx2 on reportOld (also primes the module-level transactionReportIDMapping).
        const seed: OnyxCollection<Transaction> = {[txKey('2')]: makeTx('2', 'reportOld')};
        reportTransactionsAndViolationsConfig.compute([seed, undefined], {sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: seed}});

        // Move: tx2 now on reportNew, with the previous derived value carried in.
        const moved: OnyxCollection<Transaction> = {[txKey('2')]: makeTx('2', 'reportNew')};
        const currentValue: ReportTransactionsAndViolationsDerivedValue = {reportOld: {transactions: {[txKey('2')]: makeTx('2', 'reportOld')}, violations: {}}};
        const result = reportTransactionsAndViolationsConfig.compute([moved, undefined], {sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: moved}, currentValue});

        expect(result.reportNew?.transactions?.[txKey('2')]).toBeTruthy();
        expect(result.reportOld?.transactions?.[txKey('2')]).toBeUndefined();
    });

    it('attaches non-empty violations to the transaction report and drops them when they clear', () => {
        const transactions: OnyxCollection<Transaction> = {[txKey('3')]: makeTx('3', 'reportC')};
        const violations: OnyxCollection<TransactionViolation[]> = {[violationsKey('3')]: [dupViolation]};
        const withViolations = reportTransactionsAndViolationsConfig.compute([transactions, violations], {
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: transactions, [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: violations},
        });
        expect(withViolations.reportC?.violations?.[violationsKey('3')]).toHaveLength(1);

        // Clear violations (now an empty array) — they should be removed from the derived value.
        const clearedViolations: OnyxCollection<TransactionViolation[]> = {[violationsKey('3')]: []};
        const cleared = reportTransactionsAndViolationsConfig.compute([transactions, clearedViolations], {
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: transactions, [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: clearedViolations},
            currentValue: withViolations,
        });
        expect(cleared.reportC?.violations?.[violationsKey('3')]).toBeUndefined();
    });

    it('removes a transaction from its report when the transaction is deleted', () => {
        // Seed: tx4 on reportD.
        const seed: OnyxCollection<Transaction> = {[txKey('4')]: makeTx('4', 'reportD')};
        reportTransactionsAndViolationsConfig.compute([seed, undefined], {sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: seed}});

        // Delete: the transaction is gone from the collection but still flagged in the delta.
        const deleted: OnyxCollection<Transaction> = {[txKey('4')]: undefined};
        const currentValue: ReportTransactionsAndViolationsDerivedValue = {reportD: {transactions: {[txKey('4')]: makeTx('4', 'reportD')}, violations: {}}};
        const result = reportTransactionsAndViolationsConfig.compute([deleted, undefined], {sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: deleted}, currentValue});

        expect(result.reportD?.transactions?.[txKey('4')]).toBeUndefined();
    });

    it('only processes the transactions present in the delta (incremental), carrying others over', () => {
        const transactions: OnyxCollection<Transaction> = {[txKey('5')]: makeTx('5', 'reportE'), [txKey('6')]: makeTx('6', 'reportE')};
        const currentValue: ReportTransactionsAndViolationsDerivedValue = {
            reportE: {transactions: {[txKey('5')]: makeTx('5', 'reportE'), [txKey('6')]: makeTx('6', 'reportE')}, violations: {}},
        };

        // Delta touches only tx5; tx6 must be carried over untouched.
        const result = reportTransactionsAndViolationsConfig.compute([transactions, undefined], {
            sourceValues: {[ONYXKEYS.COLLECTION.TRANSACTION]: {[txKey('5')]: makeTx('5', 'reportE')}},
            currentValue,
        });

        expect(result.reportE?.transactions?.[txKey('5')]).toBeTruthy();
        expect(result.reportE?.transactions?.[txKey('6')]).toBeTruthy();
    });

    it('drops an entry whose transaction moved to another report while the cross-compute state was empty', () => {
        // Given a derived value restored from disk that still files the transaction under its old report,
        // and no primed cross-compute state (a fresh app load leaves the module-level mapping empty)
        const currentValue: ReportTransactionsAndViolationsDerivedValue = {reportOld: {transactions: {[txKey('7')]: makeTx('7', 'reportOld')}, violations: {}}};

        // When a full compute runs (no delta) and the collection already places it on the new report
        const transactions: OnyxCollection<Transaction> = {[txKey('7')]: makeTx('7', 'reportNew')};
        const result = reportTransactionsAndViolationsConfig.compute([transactions, undefined], {sourceValues: undefined, currentValue});

        // Then it is listed only under the new report
        expect(result.reportNew?.transactions?.[txKey('7')]).toBeTruthy();
        expect(result.reportOld?.transactions?.[txKey('7')]).toBeUndefined();
    });

    it('drops an entry whose transaction is absent from the collection on a full compute', () => {
        // Given a derived value restored from disk listing a transaction that no longer exists
        const currentValue: ReportTransactionsAndViolationsDerivedValue = {reportF: {transactions: {[txKey('8')]: makeTx('8', 'reportF')}, violations: {}}};

        // When a full compute runs (no delta) over a collection that no longer contains it
        const transactions: OnyxCollection<Transaction> = {[txKey('9')]: makeTx('9', 'reportF')};
        const result = reportTransactionsAndViolationsConfig.compute([transactions, undefined], {sourceValues: undefined, currentValue});

        // Then the missing transaction is dropped and the surviving one is kept
        expect(result.reportF?.transactions?.[txKey('8')]).toBeUndefined();
        expect(result.reportF?.transactions?.[txKey('9')]).toBeTruthy();
    });
});
