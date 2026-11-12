import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import mapValues from 'lodash/mapValues';

import {WRITE_COMMANDS} from './API/types';
import {isReceiptError} from './ErrorUtils';
import {isRecord} from './ObjectUtils';

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
    jsonCode: number | string | undefined;
    message: string | undefined;
    failureData: Array<OnyxUpdate<TKey>>;
};

function isExpenseCreatePlaceholderError(error: unknown): boolean {
    return typeof error === 'string' || isReceiptError(error);
}

function buildErrorWithServerMessage(error: unknown, message: string): unknown {
    if (isReceiptError(error)) {
        return {source: error.source, filename: error.filename, error: error.error, message};
    }
    return message;
}

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
