import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import type {Middleware} from '@libs/Request';

import {getAll, getOngoingRequest, update, updateOngoingRequest} from '@userActions/PersistedRequests';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate, AnyRequest} from '@src/types/onyx/Request';

import clone from 'lodash/clone';

/**
 * When a user creates an agent, the client generates an optimistic accountID, but the real accountID can only be
 * assigned by the server (the agent's login is derived from it). CreateAgent's success response therefore includes
 * an Onyx update on OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING whose value maps each optimistic accountID to its real one.
 *
 * Requests queued while offline after creating the agent (e.g. UpdateAgentName, UpdateAgentPrompt,
 * UpdateAgentAvatar, DeleteAgent) still reference the optimistic accountID, which the server does not recognize,
 * so they would return a 404. This middleware checks responses for that mapping and rewrites any serialized
 * requests that reference an optimistic agent accountID to use the real accountID instead.
 */

// The optimistic accountID appears in request data both as a string (e.g. CreateAgent's optimisticAccountID
// parameter and the Onyx keys inside success/failure data) and as a number (e.g. the agentAccountID parameter of
// the agent update commands). deepReplaceKeysAndValues only replaces string keys and values, so the number
// occurrences need this extra pass. Its substring replacement is still needed for the string pass because the
// success/failure data embeds the accountID inside Onyx key strings (e.g. sharedNVP_agentPrompt_<accountID>).
// Optimistic accountIDs are long random numbers, so an accidental substring match is not a practical concern.
// Number replacement, by contrast, only ever needs strict equality.
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

// `object` intentionally accepts every non-null object variant reached by recursive traversal.
// eslint-disable-next-line @typescript-eslint/no-restricted-types
function replaceNumbersInRecord(target: object, oldVal: number, newVal: number): Record<string, unknown> {
    const newObj: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(target)) {
        // Object.entries() returns any for an object input, so bind the value to unknown before transforming it.
        const val: unknown = entryValue;
        newObj[key] = replaceNumberValues(val, oldVal, newVal);
    }
    return newObj;
}

// Every Onyx-update array a persisted request can carry, per the OnyxDataBase fields of the Request type.
const REQUEST_ONYX_DATA_FIELDS = ['successData', 'failureData', 'finallyData', 'optimisticData', 'queueFlushedData'] as const;

// A request's stored Onyx updates (success/failure/finally/optimistic/queueFlushed data) embed the optimistic
// accountID in their key strings (e.g. sharedNVP_agentPrompt_<accountID>) and inside their values. They must be
// rewritten along with the request data: replaceOptimisticAgentWithActualAgent clears the optimistic Onyx keys
// once the mapping arrives, so a queued request that later succeeds with stale updates would resurrect data
// under those dead keys.
function rewriteOnyxUpdates(
    updates: AnyOnyxUpdate[] | undefined,
    optimisticAccountIDKey: string,
    realAccountIDString: string,
    optimisticAccountID: number,
    realAccountID: number,
): AnyOnyxUpdate[] | undefined {
    return updates?.map((updateEntry) => {
        // AnyOnyxUpdate types key and value as any, so bind them to unknown before transforming them.
        const rawKey: unknown = updateEntry.key;
        const rawValue: unknown = updateEntry.value;
        // deepReplaceKeysAndValues only accepts records, so wrap the value to let it transform any shape.
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

// Returns a clone of the request with every occurrence of the optimistic accountID (in the request data and in
// each stored Onyx-update array) rewritten to the real accountID.
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

const handleUnusedOptimisticAgentAccountID: Middleware = (requestResponse, request, isFromSequentialQueue) =>
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
                // Object.entries() returns any for an object input, so bind the value to unknown before checking it.
                const realAccountID: unknown = mappedAccountID;
                // A null entry is a mapping that replaceOptimisticAgentWithActualAgent already consumed and cleared.
                if (typeof realAccountID !== 'number') {
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

export default handleUnusedOptimisticAgentAccountID;
