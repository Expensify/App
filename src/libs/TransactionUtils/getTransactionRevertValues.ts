import type {Transaction} from '@src/types/onyx';

import type {NullishDeep, OnyxEntry} from 'react-native-onyx';

import {deepEqual} from 'fast-equals';
import lodashIsPlainObject from 'lodash/isPlainObject';

const REQUEST_STATE_KEYS = new Set<string>(['pendingFields', 'pendingAction', 'errorFields', 'errors']);

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
    return lodashIsPlainObject(value);
}

function getRevertValues(before: PlainObject, written: PlainObject, shouldSkipRequestStateKeys: boolean): PlainObject {
    const revertValues: PlainObject = {};
    for (const [key, writtenValue] of Object.entries(written)) {
        const beforeValue = before[key];

        if (writtenValue === undefined || (shouldSkipRequestStateKeys && REQUEST_STATE_KEYS.has(key)) || deepEqual(beforeValue, writtenValue)) {
            continue;
        }

        if (isPlainObject(writtenValue) && isPlainObject(beforeValue)) {
            revertValues[key] = getRevertValues(beforeValue, writtenValue, false);
            continue;
        }

        revertValues[key] = beforeValue ?? null;
    }
    return revertValues;
}

function getTransactionRevertValues(transaction: OnyxEntry<Transaction>, optimisticTransaction: OnyxEntry<NullishDeep<Transaction>>): NullishDeep<Transaction> {
    if (!transaction || !optimisticTransaction) {
        return {};
    }
    return getRevertValues(transaction, optimisticTransaction, true);
}

export default getTransactionRevertValues;
