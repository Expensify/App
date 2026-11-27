/**
 * A member invited while offline gets an accountID generated from their login (see generateAccountID) until the
 * server assigns the real one. Category visibility requests queued behind the invite send member accountIDs, and the
 * server rejects the whole request when one of them is still the generated ID. Once the invite succeeds, this
 * middleware replaces those IDs in the queued requests with the real ones from the invite's response.
 *
 * The same goes for their failureData, which puts back each member's earlier visibleTo entry under their accountID. The
 * invite's successData drops the generated ID from visibleTo, so a failed change has to put the invitee back under the
 * real one. Their successData only clears pending fields, so it has no accountIDs to replace.
 *
 * A login's generated ID can match another account's real accountID, so only the IDs this invite actually generated
 * are replaced. The invite records them in its successData, which removes the placeholder personal details it created.
 *
 * The AddMembersToWorkspace request itself is never rewritten: it already succeeded.
 */
import type {SetPolicyCategoryMemberVisibilityParams, SetPolicyMemberCategoryVisibilityParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import {isRecord} from '@libs/ObjectUtils';
import {getLoginsByAccountIDFromOnyxUpdates, getRemovedPersonalDetailsAccountIDsFromOnyxUpdates} from '@libs/PersonalDetailsUtils';
import type {Middleware} from '@libs/Request';
import {generateAccountID} from '@libs/UserUtils';

import {getAll, update} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {Str} from 'expensify-common';

// The commands that send member accountIDs, with the params that hold them as JSON-encoded lists.
const ACCOUNT_ID_LIST_PARAMS_BY_COMMAND: Partial<Record<string, string[]>> = {
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_MEMBER_VISIBILITY]: ['selectedAccountIDList', 'deselectedAccountIDList'] satisfies Array<keyof SetPolicyCategoryMemberVisibilityParams>,
    [WRITE_COMMANDS.SET_POLICY_MEMBER_CATEGORY_VISIBILITY]: ['accountIDList'] satisfies Array<keyof SetPolicyMemberCategoryVisibilityParams>,
};

/**
 * Maps each invitee's generated accountID to the real one, using the personal details the invite's response sends.
 * The response also sends existing members, so a generated ID only counts when the invite created it.
 */
function getRealAccountIDsByOptimisticID(onyxData: ReadonlyArray<{key: unknown; value?: unknown}> | undefined, optimisticAccountIDs: Set<number>): Map<number, number> {
    const realAccountIDs = new Map<number, number>();
    for (const [realAccountID, login] of getLoginsByAccountIDFromOnyxUpdates(onyxData)) {
        // A phone number's generated ID comes from the number with or without the SMS domain, depending on where it was invited from.
        for (const loginToHash of [login, Str.removeSMSDomain(login)]) {
            const optimisticAccountID = generateAccountID(loginToHash);
            if (optimisticAccountIDs.has(optimisticAccountID) && optimisticAccountID !== realAccountID) {
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

/** Returns the Onyx updates with the generated IDs replaced in each category's visibleTo, or undefined when there is nothing to replace. */
function replaceOptimisticAccountIDsInVisibleTo(onyxUpdates: AnyRequest['failureData'], realAccountIDs: Map<number, number>): AnyRequest['failureData'] {
    let hasReplacedAccountID = false;
    const rewrittenOnyxUpdates = onyxUpdates?.map((onyxUpdate) => {
        if (!String(onyxUpdate.key).startsWith(ONYXKEYS.COLLECTION.POLICY_CATEGORIES) || !isRecord(onyxUpdate.value)) {
            return onyxUpdate;
        }

        const categories: Record<string, unknown> = {};
        for (const [categoryName, category] of Object.entries(onyxUpdate.value)) {
            if (!isRecord(category) || !isRecord(category.visibleTo)) {
                categories[categoryName] = category;
                continue;
            }

            const visibleTo: Record<string, unknown> = {};
            for (const [accountID, isVisible] of Object.entries(category.visibleTo)) {
                const realAccountID = realAccountIDs.get(Number(accountID));
                hasReplacedAccountID ||= realAccountID !== undefined;
                visibleTo[realAccountID ?? accountID] = isVisible;
            }
            categories[categoryName] = {...category, visibleTo};
        }
        return {...onyxUpdate, value: categories};
    });
    return hasReplacedAccountID ? rewrittenOnyxUpdates : undefined;
}

const replaceOptimisticMemberAccountID: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (request?.command !== WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE || response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        // An invite of people who already have an account generates no IDs, so there's nothing to replace.
        const optimisticAccountIDs = getRemovedPersonalDetailsAccountIDsFromOnyxUpdates(request.successData);
        if (optimisticAccountIDs.size === 0) {
            return response;
        }

        // Most invites have nothing queued behind them that sends member accountIDs, so the real IDs are only worked out when something does.
        const queuedRequests = getAll();
        if (!queuedRequests.some((queuedRequest) => ACCOUNT_ID_LIST_PARAMS_BY_COMMAND[queuedRequest.command])) {
            return response;
        }

        const realAccountIDs = getRealAccountIDsByOptimisticID(response.onyxData, optimisticAccountIDs);
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

            const rewrittenFailureData = replaceOptimisticAccountIDsInVisibleTo(queuedRequest.failureData, realAccountIDs);
            if (isEmptyObject(rewrittenParams) && !rewrittenFailureData) {
                continue;
            }
            update(index, {...queuedRequest, data: {...queuedRequest.data, ...rewrittenParams}, failureData: rewrittenFailureData ?? queuedRequest.failureData});
        }
        return response;
    });

export default replaceOptimisticMemberAccountID;
