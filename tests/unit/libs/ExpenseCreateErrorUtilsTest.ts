import {WRITE_COMMANDS} from '@libs/API/types';
import {getExpenseCreateFailureData} from '@libs/ExpenseCreateErrorUtils';
import {isRecord} from '@libs/ObjectUtils';
import {getLatestErrorMessageField, isReceiptError} from '@libs/ErrorUtils';
import type {OnyxDataWithErrors} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const SERVER_REASON = 'New expenses cannot be added to this report.';
const GENERIC_MESSAGE = 'Unexpected error submitting this expense. Please try again later.';
const EDIT_MESSAGE = 'Unexpected error editing this expense. Please try again later.';
const RECEIPT_ERROR = {error: CONST.IOU.RECEIPT_ERROR, source: 'blob:receipt', filename: 'receipt.png', action: 'trackExpense', retryParams: '{}'};

/** The receipt error after the server's reason replaces the upload placeholder: the file survives, the dead retry does not. */
const REWRITTEN_RECEIPT_ERROR = {error: CONST.IOU.RECEIPT_ERROR, source: 'blob:receipt', filename: 'receipt.png', message: SERVER_REASON};

const ERROR_KEY = '1700000000000000';
const TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}12345` as const;
const IOU_REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}67890` as const;
const CHAT_REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}67890` as const;
const reportActionID = '11111';

// Typed on the collection keys, since OnyxKey carries the collection prefix and not a concrete member key.
type FailureData = Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>>;

/** Reads one property off an Onyx update value, which is a union shaped per Onyx key. */
function readProperty(value: unknown, property: string): unknown {
    if (!isRecord(value)) {
        return undefined;
    }
    return Object.entries(value)
        .find(([key]) => key === property)
        ?.at(1);
}

/** The errors a transaction update carries, keyed by microsecond. */
function transactionErrors(failureData: FailureData): unknown {
    return readProperty(failureData.find((update) => update.key === TRANSACTION_KEY)?.value, 'errors');
}

/** The errors the failed expense carries on its IOU report action, keyed by microsecond. */
function reportActionErrors(failureData: FailureData): unknown {
    const actions = failureData.find((update) => update.key === IOU_REPORT_KEY)?.value;
    return readProperty(readProperty(actions, reportActionID), 'errors');
}

function buildFailureData(): FailureData {
    return [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: TRANSACTION_KEY,
            value: {errors: {[ERROR_KEY]: RECEIPT_ERROR}, pendingFields: {created: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: IOU_REPORT_KEY,
            value: {[reportActionID]: {errors: {[ERROR_KEY]: RECEIPT_ERROR}}},
        },
    ];
}

function buildReportActionFailureData(message: string): FailureData {
    return [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: IOU_REPORT_KEY,
            value: {[reportActionID]: {errors: {[ERROR_KEY]: message}}},
        },
    ];
}

describe('getExpenseCreateFailureData', () => {
    it('rewrites a receipt placeholder into the server reason, keeping the receipt fields', () => {
        // Given a scan expense whose failureData carries the receipt error placeholder written for scan requests
        const failureData = buildFailureData();

        // When the server rejects the write with jsonCode 666 and a reason of its own
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});

        // Then both the transaction and the IOU report action carry the reason on a receipt error, so the surfaces
        // that render those errors state why the expense was rejected instead of blaming the receipt upload
        expect(transactionErrors(result)).toEqual({[ERROR_KEY]: REWRITTEN_RECEIPT_ERROR});
        expect(reportActionErrors(result)).toEqual({[ERROR_KEY]: REWRITTEN_RECEIPT_ERROR});
    });

    it('keeps the receipt file and drops the dead retry', () => {
        // Given a scan expense rejected by a business rule, whose local receipt was uploaded and never reached the server
        const failureData = buildFailureData();

        // When the failureData is rewritten with the server reason
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});
        const rewritten = (transactionErrors(result) as Record<string, {source?: string; filename?: string; action?: string; retryParams?: unknown}>)[ERROR_KEY];

        // Then the receipt error keeps its type marker and file, so the Save button and the warning that dismissing
        // deletes the upload both still work. The action and retryParams are gone, which removes the retry: it would
        // resend the write the server just rejected.
        expect(isReceiptError(rewritten)).toBe(true);
        expect(rewritten.source).toBe('blob:receipt');
        expect(rewritten.filename).toBe('receipt.png');
        expect(rewritten.action).toBeUndefined();
        expect(rewritten.retryParams).toBeUndefined();
    });

    it('leaves the failureData untouched when the failure carries no server message', () => {
        // Given the same placeholder failureData
        const failureData = buildFailureData();

        // When the write fails with no message, which is what a pure offline or network failure looks like
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: undefined, failureData});

        // Then today's receipt error and its retry params survive, so a real upload failure keeps its retry
        expect(result).toBe(failureData);
        expect(transactionErrors(result)).toEqual({[ERROR_KEY]: RECEIPT_ERROR});
    });

    it('keeps the generic create failure when no server message is available', () => {
        // Given a manual expense whose failureData carries the generic create failure text
        const failureData = buildReportActionFailureData(GENERIC_MESSAGE);

        // When the write fails with a blank message
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.TRACK_EXPENSE, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: '   ', failureData});

        // Then the generic text stays, because there is nothing better to show
        expect(reportActionErrors(result)).toEqual({[ERROR_KEY]: GENERIC_MESSAGE});
    });

    it('replaces the generic create failure with the server reason', () => {
        // Given a manual expense carrying the generic create failure text
        const failureData = buildReportActionFailureData(GENERIC_MESSAGE);

        // When the server answers with its own reason
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.TRACK_EXPENSE, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});

        // Then the reason takes the place of the generic text
        expect(reportActionErrors(result)).toEqual({[ERROR_KEY]: SERVER_REASON});
    });

    it('replaces the generic edit failure that moving a tracked expense writes', () => {
        // Given a tracked expense being moved into a workspace, whose failureData names it with the edit copy
        const failureData = buildReportActionFailureData(EDIT_MESSAGE);

        // When the server rejects the move because the target report is closed
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});

        // Then the reason replaces that text too, since the rejection is the same kind
        expect(reportActionErrors(result)).toEqual({[ERROR_KEY]: SERVER_REASON});
    });

    it.each([
        WRITE_COMMANDS.REQUEST_MONEY,
        WRITE_COMMANDS.TRACK_EXPENSE,
        WRITE_COMMANDS.CREATE_DISTANCE_REQUEST,
        WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST,
        WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST,
        WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE,
        WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
        WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY,
    ])('rewrites the placeholders for %s', (command) => {
        // Given a rejected expense write whose failureData carries the placeholders
        const failureData = buildFailureData();

        // When the response carries a server reason
        const result = getExpenseCreateFailureData({command, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});

        // Then the reason is applied
        expect(reportActionErrors(result)).toEqual({[ERROR_KEY]: REWRITTEN_RECEIPT_ERROR});
    });

    it('leaves the failureData of a non expense command untouched', () => {
        // Given a failureData shaped like an expense create's, but attached to an unrelated command
        const failureData = buildFailureData();

        // When that command is rejected with a message
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.SET_REPORT_NAME, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'Some other failure', failureData});

        // Then nothing is rewritten, since only expense create errors carry these placeholders
        expect(result).toBe(failureData);
    });

    it('leaves a non-expense jsonCode untouched even when the server sends a message', () => {
        // Given an expense create write that failed with a code the client handles elsewhere
        const failureData = buildFailureData();

        // When the response is not an expense error
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED, message: SERVER_REASON, failureData});

        // Then the placeholders stay, so other failure handling keeps its own text
        expect(result).toBe(failureData);
    });

    it('leaves the chat row with no dismiss control, which is what protects the uploaded receipt', () => {
        // Given a rewritten receipt error on the expense's report action. The chat row shows only what
        // getLatestErrorMessageField returns, and that helper drops receipt errors because they carry their own
        // save and delete UI rather than a plain message.
        const failureData = buildFailureData();

        // When the failureData is rewritten with the server reason
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});
        const errors = reportActionErrors(result) as Record<string, unknown>;

        // Then the action still yields no plain message for the chat row, so no X appears there to dismiss the
        // expense and its receipt with a single tap. Flattening the error to a string would hand that row a
        // message, add the X back, and skip the confirmation that warns the upload is about to be deleted.
        expect(getLatestErrorMessageField({errors} as OnyxDataWithErrors)).toEqual({});
    });

    it('leaves an error entry that is cleared rather than raised', () => {
        // Given a rollback that clears an earlier error by writing null under its key
        const failureData: FailureData = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: TRANSACTION_KEY,
                value: {errors: {[ERROR_KEY]: null}},
            },
        ];

        // When the write is rejected with a reason
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});

        // Then the clear stays a clear, so the rollback still removes the error it was clearing instead of
        // replacing it with a message that would linger on screen
        expect(transactionErrors(result)).toEqual({[ERROR_KEY]: null});
    });

    it("writes only errors, so the server's own errorFields write is left alone", () => {
        // Given a failed expense create write, whose failureData puts the placeholder under errors on the report
        // action and the transaction
        const failureData = buildFailureData();

        // When the write is rejected with a server reason
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});

        // Then no update carries errorFields, so the rewrite cannot clobber the reason the server stores there.
        // The two sit side by side, and only errors is rendered.
        for (const update of result) {
            const value = update.value;
            const keys = isRecord(value) ? Object.keys(value) : [];
            expect(keys).not.toContain('errorFields');
        }
        expect(transactionErrors(result)).toEqual({[ERROR_KEY]: REWRITTEN_RECEIPT_ERROR});
        expect(reportActionErrors(result)).toEqual({[ERROR_KEY]: REWRITTEN_RECEIPT_ERROR});
    });

    it('keeps the rest of the Onyx updates as they are', () => {
        // Given a failureData that also rolls back a report and clears pending fields
        const failureData: FailureData = [
            {onyxMethod: Onyx.METHOD.MERGE, key: CHAT_REPORT_KEY, value: {pendingFields: null}},
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: TRANSACTION_KEY,
                value: {errors: {[ERROR_KEY]: GENERIC_MESSAGE}, pendingFields: {created: null}},
            },
        ];

        // When the write is rejected with a reason
        const result = getExpenseCreateFailureData({command: WRITE_COMMANDS.REQUEST_MONEY, jsonCode: CONST.JSON_CODE.EXP_ERROR, message: SERVER_REASON, failureData});

        // Then only the errors change, so the rollback every other field describes is preserved
        expect(result.at(0)).toBe(failureData.at(0));
        expect(result.at(1)?.value).toEqual({errors: {[ERROR_KEY]: SERVER_REASON}, pendingFields: {created: null}});
    });
});
