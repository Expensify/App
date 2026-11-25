/**
 * Reconciles expense creation failureData against server-provided transaction and report action errors so the server rejection message shows without duplicating generic errors or losing receipt retry metadata.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import {WRITE_COMMANDS} from './API/types';
import {getLatestStringErrorMessage, isReceiptError} from './ErrorUtils';
import {isRecord} from './ObjectUtils';

const EXPENSE_CREATION_COMMANDS = new Set<string>([WRITE_COMMANDS.REQUEST_MONEY, WRITE_COMMANDS.TRACK_EXPENSE]);

function reconcileErrorsField(record: Record<string, unknown>, serverError: string): Record<string, unknown> {
    if (!isRecord(record.errors)) {
        return record;
    }

    const updatedErrors: Record<string, unknown> = {};
    for (const [errorKey, errorValue] of Object.entries(record.errors)) {
        if (isReceiptError(errorValue)) {
            updatedErrors[errorKey] = {...errorValue, message: serverError};
        } else if (typeof errorValue !== 'string') {
            updatedErrors[errorKey] = errorValue;
        }
    }

    if (Object.keys(updatedErrors).length > 0) {
        return {...record, errors: updatedErrors};
    }

    const rest = {...record};
    delete rest.errors;
    return rest;
}

function reconcileFailureDataWithServerErrors<TKey extends OnyxKey>(
    command: string | undefined,
    failureData: Array<OnyxUpdate<TKey>>,
    responseOnyxData: Array<OnyxUpdate<TKey>> | undefined,
): Array<OnyxUpdate<TKey>> {
    if (!command || !EXPENSE_CREATION_COMMANDS.has(command) || !responseOnyxData?.length) {
        return failureData;
    }

    const transactionErrors = new Map<string, string>();
    const reportActionErrors = new Map<string, Map<string, string>>();

    for (const update of responseOnyxData) {
        const value: unknown = update.value;
        if (!isRecord(value)) {
            continue;
        }

        if (update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const serverError = getLatestStringErrorMessage(value.errors);
            if (serverError) {
                transactionErrors.set(update.key, serverError);
            }
            continue;
        }

        if (update.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
            for (const [actionID, actionValue] of Object.entries(value)) {
                if (!isRecord(actionValue)) {
                    continue;
                }
                const serverError = getLatestStringErrorMessage(actionValue.errors);
                if (!serverError) {
                    continue;
                }
                let actionMap = reportActionErrors.get(update.key);
                if (!actionMap) {
                    actionMap = new Map<string, string>();
                    reportActionErrors.set(update.key, actionMap);
                }
                actionMap.set(actionID, serverError);
            }
        }
    }

    if (transactionErrors.size === 0 && reportActionErrors.size === 0) {
        return failureData;
    }

    const reconciledUpdates: Array<OnyxUpdate<TKey>> = [];

    for (const update of failureData) {
        const value: unknown = update.value;
        if (!isRecord(value)) {
            reconciledUpdates.push(update);
            continue;
        }

        const transactionServerError = transactionErrors.get(update.key);
        if (transactionServerError) {
            const nextValue = reconcileErrorsField(value, transactionServerError);
            if (Object.keys(nextValue).length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Reconciling only updates or removes the errors field while keeping the transaction update shape intact.
                reconciledUpdates.push({...update, value: nextValue} as OnyxUpdate<TKey>);
            }
            continue;
        }

        const actionServerErrors = reportActionErrors.get(update.key);
        if (actionServerErrors) {
            const nextActions: Record<string, unknown> = {};
            for (const [actionID, actionValue] of Object.entries(value)) {
                const actionServerError = actionServerErrors.get(actionID);
                if (!actionServerError || !isRecord(actionValue)) {
                    nextActions[actionID] = actionValue;
                    continue;
                }
                const nextActionValue = reconcileErrorsField(actionValue, actionServerError);
                if (Object.keys(nextActionValue).length > 0) {
                    nextActions[actionID] = nextActionValue;
                }
            }
            if (Object.keys(nextActions).length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Reconciling only updates or removes errors fields on matching actions while keeping the reportActions update shape intact.
                reconciledUpdates.push({...update, value: nextActions} as OnyxUpdate<TKey>);
            }
            continue;
        }

        reconciledUpdates.push(update);
    }

    return reconciledUpdates;
}

export default reconcileFailureDataWithServerErrors;
