/**
 * Reconciles client failureData against server-provided transaction and report action errors so the server rejection message shows without duplicating generic errors or losing receipt retry metadata.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import {isReceiptError} from './ErrorUtils';
import {isRecord} from './ObjectUtils';

function getLatestStringError(errors: unknown): string | undefined {
    if (!isRecord(errors)) {
        return undefined;
    }

    const keys = Object.keys(errors).sort().reverse();
    for (const key of keys) {
        const value = errors[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
    }

    return undefined;
}

type ServerErrorsByKey = {
    transactionErrors: Map<string, string>;
    reportActionErrors: Map<string, Map<string, string>>;
};

function extractServerErrors<TKey extends OnyxKey>(onyxData: Array<OnyxUpdate<TKey>> | undefined): ServerErrorsByKey {
    const transactionErrors = new Map<string, string>();
    const reportActionErrors = new Map<string, Map<string, string>>();

    if (!onyxData?.length) {
        return {transactionErrors, reportActionErrors};
    }

    for (const update of onyxData) {
        if (!isRecord(update.value)) {
            continue;
        }

        if (update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const serverError = getLatestStringError(update.value.errors);
            if (serverError) {
                transactionErrors.set(update.key, serverError);
            }
            continue;
        }

        if (update.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
            for (const [actionID, actionValue] of Object.entries(update.value)) {
                if (!isRecord(actionValue)) {
                    continue;
                }
                const serverError = getLatestStringError(actionValue.errors);
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

    return {transactionErrors, reportActionErrors};
}

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

function reconcileFailureDataWithServerErrors<TKey extends OnyxKey>(failureData: Array<OnyxUpdate<TKey>>, responseOnyxData: Array<OnyxUpdate<TKey>> | undefined): Array<OnyxUpdate<TKey>> {
    const {transactionErrors, reportActionErrors} = extractServerErrors(responseOnyxData);
    if (transactionErrors.size === 0 && reportActionErrors.size === 0) {
        return failureData;
    }

    const reconciledUpdates: Array<OnyxUpdate<TKey>> = [];

    for (const update of failureData) {
        if (!isRecord(update.value)) {
            reconciledUpdates.push(update);
            continue;
        }

        const transactionServerError = transactionErrors.get(update.key);
        if (transactionServerError) {
            const nextValue = reconcileErrorsField(update.value, transactionServerError);
            if (Object.keys(nextValue).length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Reconciling only updates or removes the errors field while keeping the update key and value shape intact.
                reconciledUpdates.push({...update, value: nextValue} as OnyxUpdate<TKey>);
            }
            continue;
        }

        const actionServerErrors = reportActionErrors.get(update.key);
        if (actionServerErrors) {
            const nextActions: Record<string, unknown> = {};
            for (const [actionID, actionValue] of Object.entries(update.value)) {
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Reconciling only updates or removes errors fields on actions while keeping the reportActions update shape intact.
                reconciledUpdates.push({...update, value: nextActions} as OnyxUpdate<TKey>);
            }
            continue;
        }

        reconciledUpdates.push(update);
    }

    return reconciledUpdates;
}

export default reconcileFailureDataWithServerErrors;
