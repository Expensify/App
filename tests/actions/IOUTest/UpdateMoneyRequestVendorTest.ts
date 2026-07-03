import {updateMoneyRequestVendor} from '@libs/actions/IOU/UpdateMoneyRequest';
import * as API from '@libs/API';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'txn-vendor-test';

const baseTransaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: '1234',
    amount: 100,
    comment: {},
    created: '2026-05-25 13:46:20',
    merchant: 'Coffee Shop',
    currency: CONST.CURRENCY.USD,
};

const inactiveVendorViolation: TransactionViolation = {
    name: CONST.VIOLATIONS.INACTIVE_VENDOR,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

const otherViolation: TransactionViolation = {
    name: CONST.VIOLATIONS.MISSING_CATEGORY,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

describe('updateMoneyRequestVendor', () => {
    let writeSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
    });

    afterEach(async () => {
        writeSpy.mockRestore();
        await Onyx.clear();
    });

    type OnyxDataArg = {
        optimisticData: Array<{key: string; value: unknown}>;
        successData: Array<{key: string; value: unknown}>;
        failureData: Array<{key: string; value: unknown}>;
    };
    const getOnyxDataArg = (): OnyxDataArg | undefined => {
        const firstCall = writeSpy.mock.calls.at(0) as unknown[] | undefined;
        return firstCall?.at(2) as OnyxDataArg | undefined;
    };

    it('clears an existing inactive-vendor violation optimistically when a vendor is picked', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [otherViolation, inactiveVendorViolation]);
        await waitForBatchedUpdates();

        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-active', transaction: baseTransaction, delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const violationsUpdate = onyxData?.optimisticData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`);
        expect(violationsUpdate).toBeDefined();
        expect(violationsUpdate?.value).toEqual([otherViolation]);
    });

    it('clears an existing inactive-vendor violation optimistically when the vendor is cleared', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [inactiveVendorViolation]);
        await waitForBatchedUpdates();

        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: '', transaction: baseTransaction, delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const violationsUpdate = onyxData?.optimisticData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`);
        expect(violationsUpdate).toBeDefined();
        expect(violationsUpdate?.value).toEqual([]);
    });

    it('restores the original violation list in failureData so a server rejection rolls back cleanly', async () => {
        const original = [otherViolation, inactiveVendorViolation];
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, original);
        await waitForBatchedUpdates();

        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-active', transaction: baseTransaction, delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const failureViolations = onyxData?.failureData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`);
        expect(failureViolations?.value).toEqual(original);
    });

    it('does not write a violations update when there was no inactive-vendor violation to clear', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [otherViolation]);
        await waitForBatchedUpdates();

        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-active', transaction: baseTransaction, delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const violationsUpdate = onyxData?.optimisticData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`);
        expect(violationsUpdate).toBeUndefined();
    });

    it('falls back to the Onyx-cached transaction for vendor rollback when caller omits transaction', async () => {
        const previousVendor = {externalID: 'v-old', isManuallySet: true};
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
            ...baseTransaction,
            comment: {vendor: previousVendor},
        });
        await waitForBatchedUpdates();

        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const transactionFailure = onyxData?.failureData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionFailure?.value).toEqual({
            pendingFields: {vendor: null},
            comment: {vendor: previousVendor},
        });
    });

    it('omits vendor rollback from failureData when no prior transaction snapshot exists', async () => {
        // No transaction arg + nothing in Onyx — the prior vendor is unknown, so we must not
        // write `vendor: null` and silently clear whatever the server actually has. The
        // pendingFields-clear entry still runs (so the offline indicator clears on rejection).
        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const transactionFailure = onyxData?.failureData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionFailure?.value).toEqual({pendingFields: {vendor: null}});
    });

    it('writes pendingFields.vendor = UPDATE in optimisticData so the offline indicator surfaces', () => {
        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', transaction: baseTransaction, delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const transactionOptimistic = onyxData?.optimisticData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionOptimistic?.value).toEqual({
            comment: {vendor: {externalID: 'v-new', isManuallySet: true}},
            pendingFields: {vendor: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        });
    });

    it('clears pendingFields.vendor in successData when the server confirms the write', () => {
        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', transaction: baseTransaction, delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const transactionSuccess = onyxData?.successData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionSuccess?.value).toEqual({pendingFields: {vendor: null}});
    });

    it('clears pendingFields.vendor in failureData when the server rejects the write', () => {
        // Even without a prior snapshot to roll the vendor itself back, the pending indicator must
        // clear on failure — otherwise the row stays stuck in "pending" forever after a server reject.
        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', delegateAccountID: undefined});

        const onyxData = getOnyxDataArg();
        const transactionFailure = onyxData?.failureData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionFailure?.value).toMatchObject({pendingFields: {vendor: null}});
    });

    describe('optimistic MODIFIED_EXPENSE report action', () => {
        // The optimistic action only goes onto the transaction thread when the caller passes the
        // thread report — `IOURequestStepVendor` does this when the user picks a vendor row. The
        // action drives the "set the vendor to X" / "changed the vendor from X to Y" / "removed the
        // vendor" system messages that show up in the thread before the server roundtrips. Without
        // it the user sees the generic "changed the expense" fallback.
        const TRANSACTION_THREAD_REPORT_ID = 'txn-thread-vendor-test';
        const transactionThreadReport: Report = {
            reportID: TRANSACTION_THREAD_REPORT_ID,
            reportName: 'Transaction thread',
        } as Report;

        type ReportActionMap = Record<string, {actionName?: string; originalMessage?: {vendor?: unknown; oldVendor?: unknown}}>;

        const findOptimisticModifiedExpense = (): {actionName?: string; originalMessage?: {vendor?: unknown; oldVendor?: unknown}} | undefined => {
            const onyxData = getOnyxDataArg();
            const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TRANSACTION_THREAD_REPORT_ID}`;
            const update = onyxData?.optimisticData.find((entry) => entry.key === reportActionsKey);
            const value = update?.value as ReportActionMap | undefined;
            return value ? Object.values(value).find((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) : undefined;
        };

        it('builds an optimistic MODIFIED_EXPENSE with `vendor` set and `oldVendor` null when adding a vendor (no prior)', () => {
            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: 'v-new',
                transaction: baseTransaction,
                transactionThreadReport,
                delegateAccountID: undefined,
            });

            const optimisticAction = findOptimisticModifiedExpense();
            expect(optimisticAction).toBeDefined();
            // `oldVendor: null` signals "no prior vendor". Onyx strips nested nulls on merge, which
            // is fine — `ModifiedExpenseMessage` treats either key's presence as a vendor change.
            expect(optimisticAction?.originalMessage).toMatchObject({
                vendor: {externalID: 'v-new', isManuallySet: true},
                oldVendor: null,
            });
        });

        it('builds an optimistic MODIFIED_EXPENSE with both `vendor` and `oldVendor` set when changing the vendor', () => {
            const previousVendor = {externalID: 'v-old', isManuallySet: false};
            const transactionWithVendor: Transaction = {
                ...baseTransaction,
                comment: {vendor: previousVendor},
            };

            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: 'v-new',
                transaction: transactionWithVendor,
                transactionThreadReport,
                delegateAccountID: undefined,
            });

            const optimisticAction = findOptimisticModifiedExpense();
            expect(optimisticAction?.originalMessage).toMatchObject({
                oldVendor: previousVendor,
                vendor: {externalID: 'v-new', isManuallySet: true},
            });
        });

        it('builds an optimistic MODIFIED_EXPENSE with `vendor` null and `oldVendor` set when clearing the vendor', () => {
            const previousVendor = {externalID: 'v-old', isManuallySet: true};
            const transactionWithVendor: Transaction = {
                ...baseTransaction,
                comment: {vendor: previousVendor},
            };

            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: '',
                transaction: transactionWithVendor,
                transactionThreadReport,
                delegateAccountID: undefined,
            });

            const optimisticAction = findOptimisticModifiedExpense();
            expect(optimisticAction?.originalMessage).toMatchObject({
                oldVendor: previousVendor,
                vendor: null,
            });
        });

        it('does NOT build an optimistic MODIFIED_EXPENSE when no transactionThreadReport is passed (defensive — no thread to write to)', () => {
            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: 'v-new',
                transaction: baseTransaction,
                delegateAccountID: undefined,
            });

            const onyxData = getOnyxDataArg();
            const reportActionsUpdate = onyxData?.optimisticData.find((entry) => entry.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS));
            expect(reportActionsUpdate).toBeUndefined();
        });
    });
});
