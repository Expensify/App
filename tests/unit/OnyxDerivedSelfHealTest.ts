import type reportTransactionsAndViolationsConfig from '@libs/actions/OnyxDerived/configs/reportTransactionsAndViolations';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Force reportTransactionsAndViolations' compute to throw once, on demand, so we can verify the engine
// self-heals: a compute that throws must not lose the deltas that triggered the failed flush. It has to be
// the compute (not the Onyx write) that throws — a thrown write would still leave the change in the
// in-memory derived value, masking the bug.
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

describe('OnyxDerived self-healing after a compute throws', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        mockShouldThrowCompute = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('recovers the deltas from a failed flush on the next dependency change', async () => {
        const transactionA: Transaction = {...createRandomTransaction(1), transactionID: 'A', reportID: 'rA', amount: 100};
        const transactionB: Transaction = {...createRandomTransaction(2), transactionID: 'B', reportID: 'rA', amount: 200};

        // Establish a baseline: transaction A tracked for report rA.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}A`, transactionA);
        await waitForBatchedUpdates();

        // Change A's amount, but make this flush's compute throw. The delta must not be lost.
        mockShouldThrowCompute = true;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}A`, {amount: 999});
        await waitForBatchedUpdates();

        // The failed flush did not persist anything.
        let derived = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS);
        expect(derived?.rA?.transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}A`]?.amount).toBe(100);

        // A later, unrelated change triggers a successful flush that must include the previously-failed delta.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}B`, transactionB);
        await waitForBatchedUpdates();

        derived = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS);
        // A's amount change (from the failed flush) is recovered, and B is added.
        expect(derived?.rA?.transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}A`]?.amount).toBe(999);
        expect(derived?.rA?.transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}B`]?.amount).toBe(200);
    });
});
