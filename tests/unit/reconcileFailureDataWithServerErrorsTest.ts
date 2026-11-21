import reconcileFailureDataWithServerErrors from '@libs/reconcileFailureDataWithServerErrors';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

describe('reconcileFailureDataWithServerErrors', () => {
    const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}101`;
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}202`;
    const actionID = '303';
    const clientErrorKey = '1';
    const serverErrorKey = '2';
    const serverReason = 'New expenses cannot be added to this report.';

    it('returns failureData unchanged when response onyxData has no transaction or report action errors', () => {
        // Given failureData for an expense and response onyxData without transaction or action errors.
        const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {
                    errors: {[clientErrorKey]: 'Unexpected error creating this expense.'},
                    pendingFields: {amount: null},
                },
            },
        ];

        // When reconciling failureData against an empty response onyxData list.
        const result = reconcileFailureDataWithServerErrors(failureData, []);

        // Then the original failureData reference is preserved.
        expect(result).toBe(failureData);
    });

    it('drops redundant generic string errors while keeping non-error fields when server errors are present', () => {
        // Given server onyxData with rejection errors on both the transaction and report action.
        const responseOnyxData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {
                    errors: {[serverErrorKey]: serverReason},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportActionsKey,
                value: {
                    [actionID]: {
                        errors: {[serverErrorKey]: serverReason},
                    },
                },
            },
        ];
        const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {
                    errors: {[clientErrorKey]: 'Unexpected error creating this expense.'},
                    pendingFields: {amount: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportActionsKey,
                value: {
                    [actionID]: {
                        errors: {[clientErrorKey]: 'Unexpected error creating this expense.'},
                    },
                },
            },
        ];

        // When reconciling client failureData against the server errors.
        const result = reconcileFailureDataWithServerErrors(failureData, responseOnyxData);

        // Then generic error strings are omitted while pendingFields rollback stays intact.
        expect(result).toEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {
                    pendingFields: {amount: null},
                },
            },
        ]);
    });

    it('preserves ReceiptError retry metadata and attaches the server rejection message', () => {
        // Given a scan expense failure where the server wrote a rejection reason to onyxData.
        const receiptError = {
            error: CONST.IOU.RECEIPT_ERROR,
            source: 'file:///receipt.jpg',
            filename: 'receipt.jpg',
            action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST,
            retryParams: '{"transactionID":"101"}',
        };
        const responseOnyxData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {
                    errors: {[serverErrorKey]: serverReason},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportActionsKey,
                value: {
                    [actionID]: {
                        errors: {[serverErrorKey]: serverReason},
                    },
                },
            },
        ];
        const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {
                    errors: {[clientErrorKey]: receiptError},
                    pendingFields: {receipt: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportActionsKey,
                value: {
                    [actionID]: {
                        errors: {[clientErrorKey]: receiptError},
                    },
                },
            },
        ];

        // When reconciling failureData against the server errors.
        const result = reconcileFailureDataWithServerErrors(failureData, responseOnyxData);

        // Then every ReceiptError keeps its retry fields and receives the server rejection reason.
        expect(result).toEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {
                    errors: {[clientErrorKey]: {...receiptError, message: serverReason}},
                    pendingFields: {receipt: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportActionsKey,
                value: {
                    [actionID]: {
                        errors: {[clientErrorKey]: {...receiptError, message: serverReason}},
                    },
                },
            },
        ]);
    });
});
