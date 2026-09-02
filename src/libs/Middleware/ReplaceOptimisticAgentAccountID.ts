import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import type {Middleware} from '@libs/Request';

import {getAll, getOngoingRequest, update, updateOngoingRequest} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate, AnyRequest} from '@src/types/onyx/Request';

import clone from 'lodash/clone';

/**
 * Only the server can assign an agent's real accountID (its login is derived from it), so CreateAgent's success
 * response maps the client's optimistic accountID to the real one on OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING. Requests
 * queued offline after creating the agent (UpdateAgentName, DeleteAgent, ...) still reference the optimistic
 * accountID and would 404, so this middleware rewrites them to the real accountID when that mapping arrives.
 */

// deepReplaceKeysAndValues only rewrites strings, but the optimistic accountID is also sent as a number
// (e.g. the agentAccountID parameter of the agent update commands), so those occurrences need this extra pass.
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

// The stored Onyx updates must be rewritten too: replaceOptimisticAgentWithActualAgent clears the optimistic keys
// once the mapping arrives, so a queued request succeeding later with stale updates would resurrect data under them.
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

// generateReportID() draws from [0, 2^53) with no minimum length, so a genuine optimistic accountID this short is
// possible (about 1 in 9 million) and is left for the server to reject. That is accepted so a short key can never act
// as a broad substring pattern; 10 digits also exceeds real accountIDs and the small integers request data commonly holds.
const MIN_OPTIMISTIC_ACCOUNT_ID_DIGITS = 10;

function isValidAgentAccountID(accountID: number): boolean {
    return Number.isSafeInteger(accountID) && accountID > 0;
}

// The key is used as a substring pattern across every queued request, so a malformed one such as "1" or ""
// (Number("") is 0) would corrupt the whole offline queue in one pass. Requiring the canonical decimal form also
// guarantees the string and number passes target the same ID.
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

const replaceOptimisticAgentAccountID: Middleware = (requestResponse, request, isFromSequentialQueue) =>
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

                if (isFromSequentialQueue) {
                    const ongoingRequest = getOngoingRequest();
                    const ongoingRequestAgentAccountIDParam = ongoingRequest?.data?.agentAccountID ?? ongoingRequest?.data?.optimisticAccountID;
                    if (ongoingRequest && (ongoingRequestAgentAccountIDParam === optimisticAccountID || ongoingRequestAgentAccountIDParam === optimisticAccountIDKey)) {
                        updateOngoingRequest(rewriteRequest(ongoingRequest, optimisticAccountIDKey, realAccountIDString, optimisticAccountID, realAccountID));
                    }
                }

                for (const [index, persistedRequest] of getAll().entries()) {
                    update(index, rewriteRequest(persistedRequest, optimisticAccountIDKey, realAccountIDString, optimisticAccountID, realAccountID));
                }
            }
        }
        return response;
    });

export default replaceOptimisticAgentAccountID;
