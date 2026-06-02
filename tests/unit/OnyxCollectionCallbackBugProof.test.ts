import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation, TransactionViolations} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// EMPIRICAL PROOF that the pre-refactor `changeTransactionsReport` had a real bug:
// an unrelated transaction's violations could end up on a duplicate sibling's
// TRANSACTION_VIOLATIONS key after moving the originator transaction to unreported.
//
// The pre-refactor code used a module-level mirror:
//   let allTransactionViolations: TransactionViolations = [];
//   Onyx.connect({
//       key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
//       callback: (val) => (allTransactionViolations = val ?? []),
//   });
// And inside the unreported branch wrote, for each duplicate sibling `id`:
//   value: allTransactionViolations.filter(v => v.name !== DUPLICATED_TRANSACTION)
//
// Because `Onyx.connect` to a collection WITHOUT `waitForCollectionCallback`
// fires the callback per-key with that one entry's value, `allTransactionViolations`
// only ever holds the LAST received transaction's violations — not a real flat
// list of "all" violations. Whichever transaction Onyx pushed last wins, and
// that random transaction's violations get written onto every duplicate sibling.
describe('Bug proof: pre-refactor changeTransactionsReport leaks unrelated violations onto duplicate siblings', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it("writes unrelated transaction C's violations to sibling B when moving A to unreported", async () => {
        // ── Setup ─────────────────────────────────────────────────────────────
        // Two transactions A and B that are duplicates of each other.
        // Plus C — a completely unrelated transaction with its own non-duplicate
        // violation that has nothing to do with A or B.
        const txA = 'txA';
        const txB = 'txB';
        const txC = 'txC';

        const txAViolations: TransactionViolations = [
            {
                name: 'duplicatedTransaction' as TransactionViolation['name'],
                type: 'warning' as TransactionViolation['type'],
                data: {duplicates: [txB]} as TransactionViolation['data'],
            },
        ];
        const txBViolations: TransactionViolations = [
            {
                name: 'duplicatedTransaction' as TransactionViolation['name'],
                type: 'warning' as TransactionViolation['type'],
                data: {duplicates: [txA]} as TransactionViolation['data'],
            },
        ];
        // C's violation: completely unrelated to A or B. Note: NOT `duplicatedTransaction`.
        const txCViolations: TransactionViolations = [
            {
                name: 'cashExpenseWithNoReceipt' as TransactionViolation['name'],
                type: 'violation' as TransactionViolation['type'],
            },
        ];

        // ── Replicate the pre-refactor mirror pattern ─────────────────────────
        let allTransactionViolations: TransactionViolations = [];
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
            callback: (val) => {
                allTransactionViolations = val ?? [];
            },
        });

        // ── Populate Onyx in this order: A, B, then C (C is "last received") ──
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txA}`, txAViolations);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txB}`, txBViolations);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txC}`, txCViolations);
        await waitForBatchedUpdates();

        // Sanity check: the mirror holds C's violations now, not all of them combined.
        expect(allTransactionViolations).toEqual(txCViolations);

        // ── Simulate the EXACT pre-refactor changeTransactionsReport logic ───
        // Taken verbatim from commit 7bea8cba7ab (src/libs/actions/Transaction.ts:741-755):
        //
        //   if (reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        //       const duplicateViolation = currentTransactionViolations?.[transaction.transactionID]
        //           ?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
        //       const duplicateTransactionIDs = duplicateViolation?.data?.duplicates;
        //       if (duplicateTransactionIDs) {
        //           duplicateTransactionIDs.forEach((id) => {
        //               optimisticData.push({
        //                   onyxMethod: Onyx.METHOD.SET,
        //                   key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
        //                   value: allTransactionViolations.filter(
        //                       (violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION
        //                   ),
        //               });
        //           });
        //       }
        //   }
        //
        // The "moved" transaction is A. We look up A's duplicate violation,
        // get the sibling list [B], and for each sibling write
        // `allTransactionViolations.filter(...)` to that sibling's key.
        const currentAViolations = txAViolations; // (the pre-refactor code took this from `currentTransactionViolations[txA]`)
        const duplicateViolation = currentAViolations.find((v) => v.name === 'duplicatedTransaction');
        const duplicateTransactionIDs = duplicateViolation?.data?.duplicates;

        expect(duplicateTransactionIDs).toEqual([txB]);

        const writesToSiblings: Array<{key: string; value: TransactionViolations}> = [];
        if (duplicateTransactionIDs) {
            for (const id of duplicateTransactionIDs) {
                writesToSiblings.push({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
                    value: allTransactionViolations.filter((violation) => violation.name !== 'duplicatedTransaction'),
                });
            }
        }

        // ── THE BUG ───────────────────────────────────────────────────────────
        // The value the pre-refactor code would optimistically write to B's
        // TRANSACTION_VIOLATIONS key:
        const writeToB = writesToSiblings.find((w) => w.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txB}`);
        expect(writeToB).toBeDefined();

        // 1. It is NOT B's own violations minus the duplicate marker.
        //    The semantically correct value would be [] (B's only violation
        //    is the duplicate, which we're stripping).
        const correctValueForB = txBViolations.filter((v) => v.name !== 'duplicatedTransaction');
        expect(correctValueForB).toEqual([]);
        expect(writeToB?.value).not.toEqual(correctValueForB);

        // 2. It is C's violations (the unrelated transaction's), because
        //    `allTransactionViolations` held C's value when the optimistic
        //    write was constructed.
        expect(writeToB?.value).toEqual(txCViolations);

        // 3. Concretely: B would gain a `cashExpenseWithNoReceipt` violation
        //    that has nothing to do with B — leaked from the unrelated tx C.
        expect(writeToB?.value).toContainEqual({
            name: 'cashExpenseWithNoReceipt',
            type: 'violation',
        });

        Onyx.disconnect(connection);
    });

    it("control: post-refactor per-id lookup writes the correct value (B's own violations minus duplicate marker)", async () => {
        // Same setup as the bug case, but exercising the new pattern that
        // `changeTransactionsReport` uses post-refactor:
        //   transactionViolations?.[`${COLLECTION}${id}`]?.filter(v => v.name !== DUPLICATED)
        //
        // This MUST write B's OWN filtered violations — never C's.
        const txA = 'txA';
        const txB = 'txB';
        const txC = 'txC';

        const txAViolations: TransactionViolations = [
            {name: 'duplicatedTransaction' as TransactionViolation['name'], type: 'warning' as TransactionViolation['type'], data: {duplicates: [txB]} as TransactionViolation['data']},
        ];
        const txBViolations: TransactionViolations = [
            {name: 'duplicatedTransaction' as TransactionViolation['name'], type: 'warning' as TransactionViolation['type'], data: {duplicates: [txA]} as TransactionViolation['data']},
        ];
        const txCViolations: TransactionViolations = [{name: 'cashExpenseWithNoReceipt' as TransactionViolation['name'], type: 'violation' as TransactionViolation['type']}];

        // Build the collection the way useOnyx would yield it: keyed by full
        // Onyx collection key, containing every transaction's violations.
        const transactionViolationsCollection: Record<string, TransactionViolations | undefined> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txA}`]: txAViolations,
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txB}`]: txBViolations,
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txC}`]: txCViolations,
        };

        // Mirror the post-refactor logic for the sibling loop:
        //   for (const id of duplicateTransactionIDs) {
        //       const siblingNonDuplicatedViolations =
        //           (transactionViolations?.[`${COLLECTION}${id}`] ?? [])
        //               .filter(v => v.name !== DUPLICATED_TRANSACTION);
        //       optimisticData.push({key: `${COLLECTION}${id}`, value: siblingNonDuplicatedViolations});
        //   }
        const duplicateTransactionIDs = [txB];
        const writes = duplicateTransactionIDs.map((id) => ({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: (transactionViolationsCollection[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? []).filter((v) => v.name !== 'duplicatedTransaction'),
        }));

        const writeToB = writes.find((w) => w.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txB}`);
        // Correct outcome: B's own violations minus duplicate marker = [].
        expect(writeToB?.value).toEqual([]);
        // C's violations never appear.
        expect(writeToB?.value).not.toContainEqual({name: 'cashExpenseWithNoReceipt', type: 'violation'});
    });
});
