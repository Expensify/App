import type reportTransactionsAndViolationsConfig from '@libs/actions/OnyxDerived/configs/reportTransactionsAndViolations';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Record every diff the engine runs, so the test can count how many scanned the transactions collection.
const mockDiffedSnapshots: unknown[] = [];
jest.mock('@libs/getCollectionDelta', () => {
    const actual = jest.requireActual<{default: (current: unknown, previous: unknown) => unknown}>('@libs/getCollectionDelta');
    return {
        __esModule: true,
        default: (current: unknown, previous: unknown) => {
            mockDiffedSnapshots.push(current);
            return actual.default(current, previous);
        },
    };
});

// Lets one test push reportTransactionsAndViolations off the shared baseline by failing a single compute.
let mockShouldThrowCompute = false;
jest.mock('@libs/actions/OnyxDerived/configs/reportTransactionsAndViolations', () => {
    const actual = jest.requireActual<{default: typeof reportTransactionsAndViolationsConfig}>('@libs/actions/OnyxDerived/configs/reportTransactionsAndViolations');
    const actualCompute = actual.default.compute;
    return {
        __esModule: true,
        default: {
            ...actual.default,
            compute: (dependencyValues: Parameters<typeof actualCompute>[0], context: Parameters<typeof actualCompute>[1]) => {
                if (mockShouldThrowCompute) {
                    mockShouldThrowCompute = false;
                    throw new Error('compute boom');
                }
                return actualCompute(dependencyValues, context);
            },
        },
    };
});

const REPORT_ID = 'r1';

function transactionKey(transactionID: string) {
    return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
}

function transactionDiffCount(): number {
    return mockDiffedSnapshots.filter((snapshot) => !!snapshot && typeof snapshot === 'object' && Object.keys(snapshot).some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)))
        .length;
}

async function getReportTransactionAmount(transactionID: string) {
    const derived = await getOnyxValue(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS);
    return derived?.[REPORT_ID]?.transactions?.[transactionKey(transactionID)]?.amount;
}

describe('OnyxDerived shared collection delta', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        // reportAttributes also depends on the locale, which only reports once translations have loaded.
        await IntlStore.load(CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING, false);
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        mockShouldThrowCompute = false;
        await Onyx.clear();
        await waitForBatchedUpdates();

        // Seed some expenses and write once more, so every derived value has flushed and holds the same baseline
        const seed: OnyxMultiSetInput = {};
        for (let i = 1; i <= 5; i++) {
            seed[transactionKey(String(i))] = {...createRandomTransaction(i), transactionID: String(i), reportID: REPORT_ID, amount: i};
        }
        await Onyx.multiSet(seed);
        await waitForBatchedUpdates();
        await Onyx.merge(transactionKey('1'), {amount: 10});
        await waitForBatchedUpdates();
        mockDiffedSnapshots.length = 0;
    });

    it('scans the transactions collection once per write, however many derived values depend on it', async () => {
        // Given reportAttributes, reportTransactionsAndViolations and spendDataSignature all depend on transactions
        const signatureBefore = await getOnyxValue(ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE);

        // When one expense is edited
        await Onyx.merge(transactionKey('2'), {amount: 222});
        await waitForBatchedUpdates();

        // Then the collection is diffed once, since a scan costs a loop over every expense on large accounts
        expect(transactionDiffCount()).toBe(1);

        // And every derived value still sees the change through the shared delta
        expect(await getReportTransactionAmount('2')).toBe(222);
        const signatureAfter = await getOnyxValue(ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE);
        expect(signatureAfter?.expenses).toBe((signatureBefore?.expenses ?? 0) + 1);
    });

    it('diffs separately for a derived value whose baseline fell behind, so it still gets every missed change', async () => {
        // Given reportTransactionsAndViolations failed one compute, so it kept its older baseline while the others moved on
        mockShouldThrowCompute = true;
        await Onyx.merge(transactionKey('3'), {amount: 333});
        await waitForBatchedUpdates();
        expect(await getReportTransactionAmount('3')).toBe(3);
        mockDiffedSnapshots.length = 0;

        // When another expense is edited
        await Onyx.merge(transactionKey('4'), {amount: 444});
        await waitForBatchedUpdates();

        // Then it diffs from its own older baseline instead of reusing the others' delta, which would skip the missed edit
        expect(await getReportTransactionAmount('3')).toBe(333);
        expect(await getReportTransactionAmount('4')).toBe(444);
    });
});
