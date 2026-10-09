import {updateMoneyRequestVendor} from '@libs/actions/IOU/UpdateMoneyRequest';
import * as APIActions from '@libs/API';
import {getOriginalMessage} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {getRequiredOnyxUpdate, getRequiredOnyxUpdates, getRequiredWriteCall} from '../../utils/TestHelper';
import {isObject} from '../../utils/typeGuards';
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
    let writeSpy: jest.SpiedFunction<typeof APIActions.write>;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        writeSpy = jest.spyOn(APIActions, 'write').mockImplementation(jest.fn());
    });

    afterEach(async () => {
        writeSpy.mockRestore();
        await Onyx.clear();
    });

    const getOnyxDataArg = () => getRequiredWriteCall(writeSpy.mock.calls, 0)[2];

    it('clears an existing inactive-vendor violation optimistically when a vendor is picked', () => {
        // The violations are passed in as a parameter (sourced from useOnyx in the component) rather than
        // read from the global Onyx collection, so nothing is set on Onyx here.
        updateMoneyRequestVendor({
            transactionID: TRANSACTION_ID,
            vendorID: 'v-active',
            vendorName: 'Active Vendor',
            transaction: baseTransaction,
            delegateAccountID: undefined,
            transactionViolations: [otherViolation, inactiveVendorViolation],
        });

        const violationsUpdate = getRequiredOnyxUpdate(getOnyxDataArg(), 'optimisticData', `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, Onyx.METHOD.SET, true);
        expect(violationsUpdate.value).toEqual([otherViolation]);
    });

    it('clears an existing inactive-vendor violation optimistically when the vendor is cleared', () => {
        updateMoneyRequestVendor({
            transactionID: TRANSACTION_ID,
            vendorID: '',
            vendorName: '',
            transaction: baseTransaction,
            delegateAccountID: undefined,
            transactionViolations: [inactiveVendorViolation],
        });

        const violationsUpdate = getRequiredOnyxUpdate(getOnyxDataArg(), 'optimisticData', `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, Onyx.METHOD.SET, true);
        expect(violationsUpdate.value).toEqual([]);
    });

    it('restores the original violation list in failureData so a server rejection rolls back cleanly', () => {
        const original = [otherViolation, inactiveVendorViolation];

        updateMoneyRequestVendor({
            transactionID: TRANSACTION_ID,
            vendorID: 'v-active',
            vendorName: 'Active Vendor',
            transaction: baseTransaction,
            delegateAccountID: undefined,
            transactionViolations: original,
        });

        const failureViolations = getRequiredOnyxUpdate(getOnyxDataArg(), 'failureData', `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, Onyx.METHOD.SET, true);
        expect(failureViolations.value).toEqual(original);
    });

    it('does not write a violations update when there was no inactive-vendor violation to clear', () => {
        updateMoneyRequestVendor({
            transactionID: TRANSACTION_ID,
            vendorID: 'v-active',
            vendorName: 'Active Vendor',
            transaction: baseTransaction,
            delegateAccountID: undefined,
            transactionViolations: [otherViolation],
        });

        const violationsUpdate = getRequiredOnyxUpdates(getOnyxDataArg(), 'optimisticData').some(
            (entry) => isObject(entry) && entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`,
        );
        expect(violationsUpdate).toBe(false);
    });

    it('ignores the global Onyx violations collection and uses the passed transactionViolations parameter', async () => {
        // Given: Onyx holds an inactive-vendor violation, but the parameter passes none.
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [inactiveVendorViolation]);
        await waitForBatchedUpdates();

        // When: a vendor is picked while passing an empty violations parameter
        updateMoneyRequestVendor({
            transactionID: TRANSACTION_ID,
            vendorID: 'v-active',
            vendorName: 'Active Vendor',
            transaction: baseTransaction,
            delegateAccountID: undefined,
            transactionViolations: [],
        });

        // Then: no violations update is written, proving the parameter (not the global collection) drives the logic.
        const violationsUpdate = getRequiredOnyxUpdates(getOnyxDataArg(), 'optimisticData').some(
            (entry) => isObject(entry) && entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`,
        );
        expect(violationsUpdate).toBe(false);
    });

    it('falls back to the Onyx-cached transaction for vendor rollback when caller omits transaction', async () => {
        const previousVendor = {externalID: 'v-old', wasManuallySet: true};
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {
            ...baseTransaction,
            comment: {vendor: previousVendor},
        });
        await waitForBatchedUpdates();

        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', vendorName: 'New Vendor', delegateAccountID: undefined, transactionViolations: undefined});

        const transactionFailure = getRequiredOnyxUpdate(getOnyxDataArg(), 'failureData', `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, Onyx.METHOD.MERGE, true);
        expect(transactionFailure.value).toEqual({
            pendingFields: {vendor: null},
            comment: {vendor: previousVendor},
        });
    });

    it('omits vendor rollback from failureData when no prior transaction snapshot exists', async () => {
        // No transaction arg + nothing in Onyx — the prior vendor is unknown, so we must not
        // write `vendor: null` and silently clear whatever the server actually has. The
        // pendingFields-clear entry still runs (so the offline indicator clears on rejection).
        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', vendorName: 'New Vendor', delegateAccountID: undefined, transactionViolations: undefined});

        const transactionFailure = getRequiredOnyxUpdate(getOnyxDataArg(), 'failureData', `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, Onyx.METHOD.MERGE, true);
        expect(transactionFailure.value).toEqual({pendingFields: {vendor: null}});
    });

    it('writes pendingFields.vendor = UPDATE in optimisticData so the offline indicator surfaces', () => {
        updateMoneyRequestVendor({
            transactionID: TRANSACTION_ID,
            vendorID: 'v-new',
            vendorName: 'New Vendor',
            transaction: baseTransaction,
            delegateAccountID: undefined,
            transactionViolations: undefined,
        });

        const transactionOptimistic = getRequiredOnyxUpdate(getOnyxDataArg(), 'optimisticData', `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, Onyx.METHOD.MERGE, true);
        // The selected vendor's display name is persisted alongside the externalID so the title still
        // renders a human-readable label after the vendor later leaves the workspace's synced list.
        expect(transactionOptimistic.value).toEqual({
            comment: {vendor: {externalID: 'v-new', name: 'New Vendor', wasManuallySet: true}},
            pendingFields: {vendor: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        });
    });

    it('clears pendingFields.vendor in successData when the server confirms the write', () => {
        updateMoneyRequestVendor({
            transactionID: TRANSACTION_ID,
            vendorID: 'v-new',
            vendorName: 'New Vendor',
            transaction: baseTransaction,
            delegateAccountID: undefined,
            transactionViolations: undefined,
        });

        const transactionSuccess = getRequiredOnyxUpdate(getOnyxDataArg(), 'successData', `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, Onyx.METHOD.MERGE, true);
        expect(transactionSuccess.value).toEqual({pendingFields: {vendor: null}});
    });

    it('clears pendingFields.vendor in failureData when the server rejects the write', () => {
        // Even without a prior snapshot to roll the vendor itself back, the pending indicator must
        // clear on failure — otherwise the row stays stuck in "pending" forever after a server reject.
        updateMoneyRequestVendor({transactionID: TRANSACTION_ID, vendorID: 'v-new', vendorName: 'New Vendor', delegateAccountID: undefined, transactionViolations: undefined});

        const transactionFailure = getRequiredOnyxUpdate(getOnyxDataArg(), 'failureData', `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, Onyx.METHOD.MERGE, true);
        expect(transactionFailure.value).toMatchObject({pendingFields: {vendor: null}});
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

        type ModifiedExpenseReportAction = ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE>;
        function isModifiedExpenseReportAction(value: unknown): value is ModifiedExpenseReportAction {
            return isObject(value) && value.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE && typeof value.reportActionID === 'string' && typeof value.created === 'string';
        }

        const findOptimisticModifiedExpense = () => {
            const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TRANSACTION_THREAD_REPORT_ID}`;
            const update = getRequiredOnyxUpdate(getOnyxDataArg(), 'optimisticData', reportActionsKey, Onyx.METHOD.MERGE, true);
            return Object.values(update.value).find((action): action is ModifiedExpenseReportAction => isModifiedExpenseReportAction(action));
        };

        it('builds an optimistic MODIFIED_EXPENSE with `vendor` set and `oldVendor` null when adding a vendor (no prior)', () => {
            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: 'v-new',
                vendorName: 'New Vendor',
                transaction: baseTransaction,
                transactionThreadReport,
                delegateAccountID: undefined,
                transactionViolations: undefined,
            });

            const optimisticAction = findOptimisticModifiedExpense();
            expect(optimisticAction).toBeDefined();
            // `oldVendor: null` signals "no prior vendor". Onyx strips nested nulls on merge, which
            // is fine — `ModifiedExpenseMessage` treats either key's presence as a vendor change.
            expect(getOriginalMessage(optimisticAction)).toMatchObject({
                vendor: {externalID: 'v-new', name: 'New Vendor', wasManuallySet: true},
                oldVendor: null,
            });
        });

        it('builds an optimistic MODIFIED_EXPENSE with both `vendor` and `oldVendor` set when changing the vendor', () => {
            const previousVendor = {externalID: 'v-old', wasManuallySet: false};
            const transactionWithVendor: Transaction = {
                ...baseTransaction,
                comment: {vendor: previousVendor},
            };

            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: 'v-new',
                vendorName: 'New Vendor',
                transaction: transactionWithVendor,
                transactionThreadReport,
                delegateAccountID: undefined,
                transactionViolations: undefined,
            });

            const optimisticAction = findOptimisticModifiedExpense();
            expect(getOriginalMessage(optimisticAction)).toMatchObject({
                oldVendor: previousVendor,
                vendor: {externalID: 'v-new', wasManuallySet: true},
            });
        });

        it('builds an optimistic MODIFIED_EXPENSE with `vendor` null and `oldVendor` set when clearing the vendor', () => {
            const previousVendor = {externalID: 'v-old', wasManuallySet: true};
            const transactionWithVendor: Transaction = {
                ...baseTransaction,
                comment: {vendor: previousVendor},
            };

            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: '',
                vendorName: '',
                transaction: transactionWithVendor,
                transactionThreadReport,
                delegateAccountID: undefined,
                transactionViolations: undefined,
            });

            const optimisticAction = findOptimisticModifiedExpense();
            expect(getOriginalMessage(optimisticAction)).toMatchObject({
                oldVendor: previousVendor,
                vendor: null,
            });
        });

        it('does NOT build an optimistic MODIFIED_EXPENSE when no transactionThreadReport is passed (defensive — no thread to write to)', () => {
            updateMoneyRequestVendor({
                transactionID: TRANSACTION_ID,
                vendorID: 'v-new',
                vendorName: 'New Vendor',
                transaction: baseTransaction,
                delegateAccountID: undefined,
                transactionViolations: undefined,
            });

            const reportActionsUpdate = getRequiredOnyxUpdates(getOnyxDataArg(), 'optimisticData').some(
                (entry) => isObject(entry) && typeof entry.key === 'string' && entry.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS),
            );
            expect(reportActionsUpdate).toBe(false);
        });
    });
});
