import type {PersonalDetailsList} from '@src/types/onyx';

import {useAllPersonalDetails} from './usePersonalDetails';

/** Mapping from accountID to user name (login or displayName). */
type AccountIDToNameMap = Record<string, string>;

const MENTION_ACCOUNT_ID_REGEX = /<mention-user[^>]*\saccountID="?(\d+)"?/gi;
// Cheap pre-check before the global regex runs; case-insensitive to match how ExpensiMark matches the tag
const HAS_USER_MENTION_REGEX = /<mention-user/i;
// Stable fallback for the first render, before Onyx has delivered the list, so callers don't see a new object each render
const EMPTY_ACCOUNT_ID_TO_NAME_MAP: AccountIDToNameMap = {};

/** Unique accountIDs referenced by <mention-user accountID=...> tags in the given HTML string */
function getMentionedAccountIDs(htmlString: string | undefined): number[] {
    if (!htmlString || !HAS_USER_MENTION_REGEX.test(htmlString)) {
        return [];
    }
    return [...new Set(Array.from(htmlString.matchAll(MENTION_ACCOUNT_ID_REGEX), (match) => Number(match[1])))];
}

/**
 * Build the accountID -> name map from PERSONAL_DETAILS_LIST.
 * When accountIDs is passed, only those accounts are looked up, so callers rendering many items don't walk the whole list.
 */
function buildAccountIDToNameMap(personalDetailsList: PersonalDetailsList | undefined, accountIDs?: number[]): AccountIDToNameMap {
    const map: AccountIDToNameMap = {};
    const personalDetailsToMap = accountIDs ? accountIDs.map((accountID) => personalDetailsList?.[accountID]) : Object.values(personalDetailsList ?? {});
    for (const personalDetails of personalDetailsToMap) {
        if (!personalDetails) {
            continue;
        }
        map[personalDetails.accountID] = personalDetails.login ?? personalDetails.displayName ?? '';
    }
    return map;
}

/** Returns an accountID -> name (login or displayName) map built from PERSONAL_DETAILS_LIST. */
function useAccountIDToNameMap(): AccountIDToNameMap {
    const [personalDetailsList] = useAllPersonalDetails();
    return buildAccountIDToNameMap(personalDetailsList);
}

/**
 * Same as useAccountIDToNameMap, but only maps the users mentioned in the given HTML string.
 * The selector keeps the subscription scoped to those accounts, so a write to any other personal detail does not re-render the caller.
 */
function useMentionedAccountIDToNameMap(htmlString: string | undefined): AccountIDToNameMap {
    const mentionedAccountIDs = getMentionedAccountIDs(htmlString);
    const [accountIDToName = EMPTY_ACCOUNT_ID_TO_NAME_MAP] = useAllPersonalDetails((personalDetailsList) => buildAccountIDToNameMap(personalDetailsList, mentionedAccountIDs));
    return accountIDToName;
}

export default useAccountIDToNameMap;
export {buildAccountIDToNameMap, getMentionedAccountIDs, useMentionedAccountIDToNameMap};
