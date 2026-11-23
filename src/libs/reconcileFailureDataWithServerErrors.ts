/**
 * Strips redundant client generic string errors from failureData when the server response already wrote errors for the same transaction or report action, while preserving ReceiptError retry metadata.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import {isRecord} from './ObjectUtils';

function hasNonEmptyStringError(errors: unknown): boolean {
    if (!isRecord(errors)) {
        return false;
    }

    return Object.values(errors).some((value) => typeof value === 'string' && value.trim().length > 0);
}

function stripStringErrors(record: Record<string, unknown>): Record<string, unknown> {
    if (!isRecord(record.errors)) {
        return record;
    }

    const remainingErrors: Record<string, unknown> = {};
    for (const [errorKey, errorValue] of Object.entries(record.errors)) {
        if (typeof errorValue !== 'string') {
            remainingErrors[errorKey] = errorValue;
        }
    }

    if (Object.keys(remainingErrors).length > 0) {
        return {...record, errors: remainingErrors};
    }

    const rest = {...record};
    delete rest.errors;
    return rest;
}

function reconcileFailureDataWithServerErrors<TKey extends OnyxKey>(failureData: Array<OnyxUpdate<TKey>>, responseOnyxData: Array<OnyxUpdate<TKey>> | undefined): Array<OnyxUpdate<TKey>> {
    if (!responseOnyxData?.length) {
        return failureData;
    }

    const transactionKeys = new Set<string>();
    const reportActionTargets = new Map<string, Set<string>>();

    for (const update of responseOnyxData) {
        const value: unknown = update.value;
        if (!isRecord(value)) {
            continue;
        }

        if (update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) && hasNonEmptyStringError(value.errors)) {
            transactionKeys.add(update.key);
            continue;
        }

        if (update.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
            for (const [actionID, actionValue] of Object.entries(value)) {
                if (!isRecord(actionValue) || !hasNonEmptyStringError(actionValue.errors)) {
                    continue;
                }
                let actionIDs = reportActionTargets.get(update.key);
                if (!actionIDs) {
                    actionIDs = new Set<string>();
                    reportActionTargets.set(update.key, actionIDs);
                }
                actionIDs.add(actionID);
            }
        }
    }

    if (transactionKeys.size === 0 && reportActionTargets.size === 0) {
        return failureData;
    }

    const reconciledUpdates: Array<OnyxUpdate<TKey>> = [];

    for (const update of failureData) {
        const value: unknown = update.value;
        if (!isRecord(value)) {
            reconciledUpdates.push(update);
            continue;
        }

        if (transactionKeys.has(update.key)) {
            const nextValue = stripStringErrors(value);
            if (Object.keys(nextValue).length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Stripping string errors preserves the transaction update key and value shape.
                reconciledUpdates.push({...update, value: nextValue} as OnyxUpdate<TKey>);
            }
            continue;
        }

        const actionIDs = reportActionTargets.get(update.key);
        if (actionIDs) {
            const nextActions: Record<string, unknown> = {};
            for (const [actionID, actionValue] of Object.entries(value)) {
                if (!actionIDs.has(actionID) || !isRecord(actionValue)) {
                    nextActions[actionID] = actionValue;
                    continue;
                }
                const nextActionValue = stripStringErrors(actionValue);
                if (Object.keys(nextActionValue).length > 0) {
                    nextActions[actionID] = nextActionValue;
                }
            }
            if (Object.keys(nextActions).length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Stripping string errors on matching actions preserves the reportActions update shape.
                reconciledUpdates.push({...update, value: nextActions} as OnyxUpdate<TKey>);
            }
            continue;
        }

        reconciledUpdates.push(update);
    }

    return reconciledUpdates;
}

export default reconcileFailureDataWithServerErrors;
