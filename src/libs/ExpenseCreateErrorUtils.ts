/**
 * When a write that creates an expense, or moves one into a workspace, is rejected (RequestMoney, TrackExpense,
 * CreateDistanceRequest, ...), the server stores its reason in Onyx under the IOU report action's errorFields, and
 * the client's own failureData puts placeholder text on the same expense under errors: a receipt upload error for
 * scan requests, or the generic "Unexpected error submitting this expense" otherwise. The surfaces that show a
 * failed expense read errors, not errorFields, so users see the placeholder and never learn why the write was
 * rejected.
 *
 * This module copies the server's reason into those placeholders at response time, so the reason arrives on the
 * path the existing surfaces already render, and the existing dismissal paths clear it with the rest of the
 * errors. Nothing renders errorFields on a report action today, so the server's own write stays unused rather
 * than competing with this one. A receipt error keeps its object shape, so the receipt keeps its Save button and
 * its row keeps no plain dismiss control. Only the retry, which could never succeed, is dropped.
 */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import mapValues from 'lodash/mapValues';

import {WRITE_COMMANDS} from './API/types';
import {isReceiptError} from './ErrorUtils';
import {isRecord} from './ObjectUtils';

/**
 * The commands whose failureData carries these placeholders. Moving a tracked expense into a workspace,
 * categorizing it or sharing it can hit the same report and permissions rejections as creating one, and their
 * failureData names the expense with the generic edit copy rather than the create copy. Split and invoice writes
 * build the same shapes through getReceiptError but report different copy, so they are left alone until that
 * copy is decided.
 */
const EXPENSE_CREATE_COMMANDS = new Set<string>([
    WRITE_COMMANDS.REQUEST_MONEY,
    WRITE_COMMANDS.TRACK_EXPENSE,
    WRITE_COMMANDS.CREATE_DISTANCE_REQUEST,
    WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST,
    WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST,
    WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE,
    WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
    WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY,
]);

type ExpenseCreateFailureDataParams<TKey extends OnyxKey> = {
    command: string | undefined;

    /** The rewrite only applies to jsonCode 666, the code the server rejects an expense write with. */
    jsonCode: number | string | undefined;

    /** The server's own reason, already translated, which goes into Onyx verbatim like the placeholders it replaces. */
    message: string | undefined;

    failureData: Array<OnyxUpdate<TKey>>;
};

/**
 * The placeholders getReceiptError writes: the generic create failure as a plain message, or a receipt error
 * object. Errors that reach Onyx as objects for another reason, such as a distance expense's route or waypoint
 * errors, live under errorFields rather than errors, so they are never candidates here.
 */
function isExpenseCreatePlaceholderError(error: unknown): boolean {
    return typeof error === 'string' || isReceiptError(error);
}

/**
 * Puts the server's reason onto a placeholder error.
 *
 * A plain placeholder becomes the reason itself. A receipt error keeps its object shape and only gains the
 * message, because the shape is what the receipt UI reads: it keeps the Save button, and MessagesRow withholds
 * its dismiss button while a receipt error is present, so a single tap cannot delete the expense along with the
 * only copy of the upload. Flattening the error to a string would drop both protections. Its action and
 * retryParams are dropped, which removes the Try again button: the retry rebuilds the same rejected write, so it
 * could only fail the same way again.
 */
function buildErrorWithServerMessage(error: unknown, message: string): unknown {
    if (isReceiptError(error)) {
        // Named field by field, so nothing that describes a retry survives by accident.
        return {source: error.source, filename: error.filename, error: error.error, message};
    }
    return message;
}

/**
 * Replaces the placeholder entries in a record's errors map with the server's reason, leaving any other entry
 * alone. The error keys are kept so the map still merges over existing errors rather than replacing them, and
 * every other field rides along so the rest of the rollback still applies.
 */
function replaceErrorsInRecord(record: unknown, message: string): unknown {
    if (!isRecord(record)) {
        return record;
    }

    const errors = record.errors;
    if (!isRecord(errors)) {
        return record;
    }

    return {...record, errors: mapValues(errors, (error) => (isExpenseCreatePlaceholderError(error) ? buildErrorWithServerMessage(error, message) : error))};
}

/**
 * Returns the failureData to apply for a failed expense create write. When the server rejected the write with a
 * message of its own, that message replaces the placeholder errors, so the report preview, the expense row, the
 * transaction thread and the LHN all state the real reason. A failure with no server message, such as a pure
 * offline failure, keeps today's placeholder text.
 */
function getExpenseCreateFailureData<TKey extends OnyxKey>({command, jsonCode, message, failureData}: ExpenseCreateFailureDataParams<TKey>): Array<OnyxUpdate<TKey>> {
    const serverMessage = message?.trim();
    if (!command || !EXPENSE_CREATE_COMMANDS.has(command) || jsonCode !== CONST.JSON_CODE.EXP_ERROR || !serverMessage) {
        return failureData;
    }

    return failureData.map((update) => {
        const {key, value} = update;
        if (!isRecord(value)) {
            return update;
        }

        // Only the two collections this error is written to are walked. A report actions value is a map of
        // reportActionID to the action, so each action inside it is rewritten on its own.
        if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
            const actions = mapValues(value, (action) => replaceErrorsInRecord(action, serverMessage));

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the map copies every action and only swaps errors values, so the result stays within this key's update type
            return {...update, value: actions} as typeof update;
        }

        if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const transaction = replaceErrorsInRecord(value, serverMessage);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the copy only swaps the errors value, so the result stays within this key's update type
            return {...update, value: transaction} as typeof update;
        }

        return update;
    });
}

export {getExpenseCreateFailureData};
export type {ExpenseCreateFailureDataParams};
