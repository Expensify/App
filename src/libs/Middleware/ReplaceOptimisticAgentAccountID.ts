import {registerAgentAccountIDMapping} from '@libs/AgentAccountIDMapping';
import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import type {Middleware} from '@libs/Request';

import {getAll, update} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate, AnyRequest} from '@src/types/onyx/Request';

import {deepEqual} from 'fast-equals';
import clone from 'lodash/clone';

/**
 * Only the server can assign an agent's real accountID, so CreateAgent's success response maps the optimistic
 * accountID to the real one on OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING. Queued requests that still use the optimistic
 * accountID would 404, so this middleware rewrites them when the mapping arrives.
 *
 * The CreateAgent request itself is never rewritten: it already succeeded, and a retry sent with the real
 * accountID would create a second agent.
 */

// deepReplaceKeysAndValues only rewrites strings; this extra pass covers the accountID sent as a number
// (e.g. the agentAccountID parameter).
function replaceNumberValues(target: unknown, oldVal: number, newVal: number): unknown {
    if (target === oldVal) {
        return newVal;
    }

    if (!target || typeof target !== 'object' || target instanceof File || target instanceof Blob) {
        return target;
    }

    if (Array.isArray(target)) {
        return target.map((item) => replaceNumberValues(item, oldVal, newVal));
    }

    return replaceNumbersInRecord(target, oldVal, newVal);
}

// The recursion reaches every non-null object variant, hence the broad `object` type.
// eslint-disable-next-line @typescript-eslint/no-restricted-types
function replaceNumbersInRecord(target: object, oldVal: number, newVal: number): Record<string, unknown> {
    const newObj: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(target)) {
        // Object.entries() returns any here.
        const val: unknown = entryValue;
        newObj[key] = replaceNumberValues(val, oldVal, newVal);
    }
    return newObj;
}

// Mirrors the OnyxDataBase fields of the Request type.
const REQUEST_ONYX_DATA_FIELDS = ['successData', 'failureData', 'finallyData', 'optimisticData', 'queueFlushedData'] as const;

// Stored Onyx updates are rewritten too, or a request succeeding later would resurrect data under the optimistic
// keys that replaceOptimisticAgentWithActualAgent clears.
function rewriteOnyxUpdates(
    updates: AnyOnyxUpdate[] | undefined,
    optimisticAccountIDKey: string,
    realAccountIDString: string,
    optimisticAccountID: number,
    realAccountID: number,
): AnyOnyxUpdate[] | undefined {
    return updates?.map((updateEntry) => {
        // AnyOnyxUpdate types key and value as any.
        const rawKey: unknown = updateEntry.key;
        const rawValue: unknown = updateEntry.value;
        // deepReplaceKeysAndValues only accepts records, hence the wrapper.
        const valueWithReplacedStrings = deepReplaceKeysAndValues({value: rawValue}, optimisticAccountIDKey, realAccountIDString)?.value;
        const rewrittenEntry = {
            ...updateEntry,
            value: replaceNumberValues(valueWithReplacedStrings, optimisticAccountID, realAccountID),
        };
        if (typeof rawKey === 'string') {
            rewrittenEntry.key = rawKey.replace(optimisticAccountIDKey, realAccountIDString);
        }
        return rewrittenEntry;
    });
}

function rewriteRequest(request: AnyRequest, optimisticAccountIDKey: string, realAccountIDString: string, optimisticAccountID: number, realAccountID: number): AnyRequest {
    const requestClone = clone(request);
    const dataWithReplacedStrings = deepReplaceKeysAndValues(request.data, optimisticAccountIDKey, realAccountIDString);
    requestClone.data = dataWithReplacedStrings ? replaceNumbersInRecord(dataWithReplacedStrings, optimisticAccountID, realAccountID) : dataWithReplacedStrings;
    for (const fieldName of REQUEST_ONYX_DATA_FIELDS) {
        if (!request[fieldName]) {
            continue;
        }
        requestClone[fieldName] = rewriteOnyxUpdates(request[fieldName], optimisticAccountIDKey, realAccountIDString, optimisticAccountID, realAccountID);
    }
    return requestClone;
}

// A short key could match unrelated numbers as substrings; 10 digits exceeds real accountIDs and the small
// integers request data usually holds. A genuine optimistic ID this short (~1 in 9 million) is left to the server.
const MIN_OPTIMISTIC_ACCOUNT_ID_DIGITS = 10;

function isValidAgentAccountID(accountID: number): boolean {
    return Number.isSafeInteger(accountID) && accountID > 0;
}

// The key is used as a substring pattern across the whole queue, so a malformed key like "1" or "" would corrupt
// it in one pass. The canonical decimal form also keeps the string and number passes on the same ID.
function isValidAgentAccountIDMappingEntry(optimisticAccountIDKey: string, realAccountID: number): boolean {
    if (!/^\d+$/.test(optimisticAccountIDKey) || optimisticAccountIDKey.length < MIN_OPTIMISTIC_ACCOUNT_ID_DIGITS) {
        return false;
    }
    const optimisticAccountID = Number(optimisticAccountIDKey);
    if (String(optimisticAccountID) !== optimisticAccountIDKey || !isValidAgentAccountID(optimisticAccountID)) {
        return false;
    }
    return isValidAgentAccountID(realAccountID) && optimisticAccountID !== realAccountID;
}

const replaceOptimisticAgentAccountID: Middleware = (requestResponse) =>
    requestResponse.then((response) => {
        const responseOnyxData = response?.onyxData ?? [];
        for (const onyxData of responseOnyxData) {
            if (onyxData.key !== ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING) {
                continue;
            }

            const mapping: unknown = onyxData.value;
            if (!mapping || typeof mapping !== 'object') {
                continue;
            }

            for (const [optimisticAccountIDKey, mappedAccountID] of Object.entries(mapping)) {
                // Object.entries() returns any here.
                const realAccountID: unknown = mappedAccountID;
                // A null entry is a mapping that replaceOptimisticAgentWithActualAgent already consumed and cleared.
                if (typeof realAccountID !== 'number') {
                    continue;
                }
                if (!isValidAgentAccountIDMappingEntry(optimisticAccountIDKey, realAccountID)) {
                    continue;
                }
                const optimisticAccountID = Number(optimisticAccountIDKey);
                const realAccountIDString = String(realAccountID);

                // The mapping only reaches replaceOptimisticAgentWithActualAgent once the queue drains and the
                // response is flushed to Onyx. Registering it here lets agent actions fired before then already
                // resolve the real accountID instead of enqueueing the optimistic one after the sweep below.
                registerAgentAccountIDMapping(optimisticAccountID, realAccountID);

                // The request that produced the mapping is no longer in the persisted list here, so only the
                // requests queued behind it are rewritten. update() re-persists the queue, so unchanged requests
                // are skipped.
                for (const [index, persistedRequest] of getAll().entries()) {
                    const rewrittenRequest = rewriteRequest(persistedRequest, optimisticAccountIDKey, realAccountIDString, optimisticAccountID, realAccountID);
                    if (deepEqual(rewrittenRequest, persistedRequest)) {
                        continue;
                    }
                    update(index, rewrittenRequest);
                }
            }
        }
        return response;
    });

export default replaceOptimisticAgentAccountID;
