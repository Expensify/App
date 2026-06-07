import Onyx from 'react-native-onyx';
import {updateMoneyRequestVendor} from '@libs/actions/IOU/UpdateMoneyRequest';
import * as API from '@libs/API';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation} from '@src/types/onyx';
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

        updateMoneyRequestVendor(TRANSACTION_ID, 'v-active', baseTransaction);

        const onyxData = getOnyxDataArg();
        const violationsUpdate = onyxData?.optimisticData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`);
        expect(violationsUpdate).toBeDefined();
        expect(violationsUpdate?.value).toEqual([otherViolation]);
    });

    it('clears an existing inactive-vendor violation optimistically when the vendor is cleared', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [inactiveVendorViolation]);
        await waitForBatchedUpdates();

        updateMoneyRequestVendor(TRANSACTION_ID, '', baseTransaction);

        const onyxData = getOnyxDataArg();
        const violationsUpdate = onyxData?.optimisticData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`);
        expect(violationsUpdate).toBeDefined();
        expect(violationsUpdate?.value).toEqual([]);
    });

    it('restores the original violation list in failureData so a server rejection rolls back cleanly', async () => {
        const original = [otherViolation, inactiveVendorViolation];
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, original);
        await waitForBatchedUpdates();

        updateMoneyRequestVendor(TRANSACTION_ID, 'v-active', baseTransaction);

        const onyxData = getOnyxDataArg();
        const failureViolations = onyxData?.failureData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`);
        expect(failureViolations?.value).toEqual(original);
    });

    it('does not write a violations update when there was no inactive-vendor violation to clear', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [otherViolation]);
        await waitForBatchedUpdates();

        updateMoneyRequestVendor(TRANSACTION_ID, 'v-active', baseTransaction);

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

        updateMoneyRequestVendor(TRANSACTION_ID, 'v-new');

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
        updateMoneyRequestVendor(TRANSACTION_ID, 'v-new');

        const onyxData = getOnyxDataArg();
        const transactionFailure = onyxData?.failureData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionFailure?.value).toEqual({pendingFields: {vendor: null}});
    });

    it('writes pendingFields.vendor = UPDATE in optimisticData so the offline indicator surfaces', () => {
        updateMoneyRequestVendor(TRANSACTION_ID, 'v-new', baseTransaction);

        const onyxData = getOnyxDataArg();
        const transactionOptimistic = onyxData?.optimisticData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionOptimistic?.value).toEqual({
            comment: {vendor: {externalID: 'v-new', isManuallySet: true}},
            pendingFields: {vendor: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        });
    });

    it('clears pendingFields.vendor in successData when the server confirms the write', () => {
        updateMoneyRequestVendor(TRANSACTION_ID, 'v-new', baseTransaction);

        const onyxData = getOnyxDataArg();
        const transactionSuccess = onyxData?.successData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect(transactionSuccess?.value).toEqual({pendingFields: {vendor: null}});
    });

    it('clears pendingFields.vendor in failureData when the server rejects the write', () => {
        // Even without a prior snapshot to roll the vendor itself back, the pending indicator must
        // clear on failure — otherwise the row stays stuck in "pending" forever after a server reject.
        updateMoneyRequestVendor(TRANSACTION_ID, 'v-new');

        const onyxData = getOnyxDataArg();
        const transactionFailure = onyxData?.failureData.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        expect((transactionFailure?.value as {pendingFields?: {vendor: null | string}})?.pendingFields).toEqual({vendor: null});
    });
});
