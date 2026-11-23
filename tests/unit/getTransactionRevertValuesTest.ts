import getTransactionRevertValues from '@libs/TransactionUtils/getTransactionRevertValues';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import createRandomTransaction from '../utils/collections/transaction';

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    const {modifiedMerchant, modifiedAmount, ...randomTransaction} = createRandomTransaction(1);
    return {
        ...randomTransaction,
        merchant: 'Old merchant',
        comment: {comment: 'Old description', attendees: [{email: 'a@expensify.com', displayName: 'A', avatarUrl: ''}]},
        receipt: {source: 'old-receipt.jpg', state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE},
        ...overrides,
    };
}

describe('getTransactionRevertValues', () => {
    it('returns the queue-time values of only the fields the write changed, and null for fields it added', () => {
        // Given an edit that changes one field and adds another
        const transaction = buildTransaction({modifiedAmount: 1500});
        const optimisticTransaction = {...transaction, modifiedAmount: 2000, modifiedMerchant: 'New merchant'};

        // When the revert values are built
        const revertValues = getTransactionRevertValues(transaction, optimisticTransaction);

        // Then only those fields are reverted, and the added one is removed
        expect(revertValues).toEqual({modifiedAmount: 1500, modifiedMerchant: null});
    });

    it('reverts only the changed key of a nested object', () => {
        // Given an edit that changes `comment.attendees`
        const transaction = buildTransaction();
        const newAttendees = [{email: 'b@expensify.com', displayName: 'B', avatarUrl: ''}];
        const optimisticTransaction = {...transaction, comment: {...transaction.comment, attendees: newAttendees}};

        // When the revert values are built
        const revertValues = getTransactionRevertValues(transaction, optimisticTransaction);

        // Then `comment.comment` is left alone
        expect(revertValues).toEqual({comment: {attendees: transaction.comment?.attendees}});
    });

    it('removes an object the write created instead of leaving it empty', () => {
        // Given an edit that creates `modifiedWaypoints` on a transaction that had none
        const transaction = buildTransaction();
        const modifiedWaypoints = {waypoint0: {address: 'Start'}, waypoint1: {address: 'End'}};

        // When the revert values are built
        const revertValues = getTransactionRevertValues(transaction, {...transaction, modifiedWaypoints});

        // Then the whole object is removed, so `modifiedWaypoints ?? comment.waypoints` falls back to the original waypoints
        expect(revertValues).toEqual({modifiedWaypoints: null});
    });

    it('reverts nothing when the queue-time transaction is unknown', () => {
        // Given an edit built without the transaction, e.g. when it was missing from the cache
        const optimisticTransaction = {...buildTransaction(), modifiedAmount: 2000};

        // When the revert values are built
        const revertValues = getTransactionRevertValues(undefined, optimisticTransaction);

        // Then no field is removed
        expect(revertValues).toEqual({});
    });

    it('leaves out the request state keys and keys the write did not set', () => {
        // Given a write with request state keys and an undefined key
        const transaction = buildTransaction();
        const optimisticTransaction = {
            ...transaction,
            merchant: undefined,
            pendingFields: {merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            errorFields: {merchant: null},
            errors: null,
        };

        // When the revert values are built
        const revertValues = getTransactionRevertValues(transaction, optimisticTransaction);

        // Then nothing is reverted
        expect(revertValues).toEqual({});
    });
});
