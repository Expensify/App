/**
 * A member invited while offline gets an accountID generated from their login (see generateAccountID) until the
 * server assigns the real one. Category visibility requests queued behind the invite send member accountIDs, and the
 * server rejects the whole request when one of them is still the generated ID. Once the invite succeeds, this
 * middleware replaces those IDs in the queued requests with the real ones from the invite's response.
 *
 * The AddMembersToWorkspace request itself is never rewritten: it already succeeded.
 */
import type {SetPolicyCategoryMemberVisibilityParams, SetPolicyMemberCategoryVisibilityParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import {getLoginsByAccountIDFromOnyxUpdates} from '@libs/PersonalDetailsUtils';
import type {Middleware} from '@libs/Request';
import {generateAccountID} from '@libs/UserUtils';

import {getAll, update} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {Str} from 'expensify-common';

// The commands that send member accountIDs, with the params that hold them as JSON-encoded lists.
const ACCOUNT_ID_LIST_PARAMS_BY_COMMAND: Partial<Record<string, string[]>> = {
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_MEMBER_VISIBILITY]: ['selectedAccountIDList', 'deselectedAccountIDList'] satisfies Array<keyof SetPolicyCategoryMemberVisibilityParams>,
    [WRITE_COMMANDS.SET_POLICY_MEMBER_CATEGORY_VISIBILITY]: ['accountIDList'] satisfies Array<keyof SetPolicyMemberCategoryVisibilityParams>,
};

/** Maps each invitee's generated accountID to the real one, using the personal details the invite's response sends. */
function getRealAccountIDsByOptimisticID(onyxData: ReadonlyArray<{key: unknown; value?: unknown}> | undefined): Map<number, number> {
    const realAccountIDs = new Map<number, number>();
    for (const [realAccountID, login] of getLoginsByAccountIDFromOnyxUpdates(onyxData)) {
        // A phone number's generated ID comes from the number with or without the SMS domain, depending on where it was invited from.
        for (const loginToHash of [login, Str.removeSMSDomain(login)]) {
            const optimisticAccountID = generateAccountID(loginToHash);
            if (optimisticAccountID !== realAccountID) {
                realAccountIDs.set(optimisticAccountID, realAccountID);
            }
        }
    }
    return realAccountIDs;
}

/** Returns the JSON-encoded accountID list with the generated IDs replaced, or undefined when there is nothing to replace. */
function replaceOptimisticAccountIDs(accountIDList: unknown, realAccountIDs: Map<number, number>): string | undefined {
    if (typeof accountIDList !== 'string') {
        return undefined;
    }

    let accountIDs: unknown;
    try {
        accountIDs = JSON.parse(accountIDList);
    } catch (error) {
        Log.warn('[ReplaceOptimisticMemberAccountID] Could not parse a queued accountID list', {error});
        return undefined;
    }

    if (!Array.isArray(accountIDs) || !accountIDs.some((accountID) => typeof accountID === 'number' && realAccountIDs.has(accountID))) {
        return undefined;
    }

    return JSON.stringify(accountIDs.map((accountID: unknown) => (typeof accountID === 'number' ? (realAccountIDs.get(accountID) ?? accountID) : accountID)));
}

const replaceOptimisticMemberAccountID: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (request?.command !== WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE || response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        // Most invites have nothing queued behind them that sends member accountIDs, so the real IDs are only worked out when something does.
        const queuedRequests = getAll();
        if (!queuedRequests.some((queuedRequest) => ACCOUNT_ID_LIST_PARAMS_BY_COMMAND[queuedRequest.command])) {
            return response;
        }

        const realAccountIDs = getRealAccountIDsByOptimisticID(response.onyxData);
        if (realAccountIDs.size === 0) {
            return response;
        }

        // The invite is no longer in the persisted list here, so only the requests queued behind it are rewritten.
        for (const [index, queuedRequest] of queuedRequests.entries()) {
            const paramNames = ACCOUNT_ID_LIST_PARAMS_BY_COMMAND[queuedRequest.command];
            if (!paramNames || !queuedRequest.data) {
                continue;
            }

            const rewrittenParams: Record<string, string> = {};
            for (const paramName of paramNames) {
                const rewrittenAccountIDList = replaceOptimisticAccountIDs(queuedRequest.data[paramName], realAccountIDs);
                if (rewrittenAccountIDList !== undefined) {
                    rewrittenParams[paramName] = rewrittenAccountIDList;
                }
            }

            if (isEmptyObject(rewrittenParams)) {
                continue;
            }
            update(index, {...queuedRequest, data: {...queuedRequest.data, ...rewrittenParams}});
        }
        return response;
    });

export default replaceOptimisticMemberAccountID;
