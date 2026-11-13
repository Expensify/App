import type {PersonalDetailsList} from '@src/types/onyx';

import {useAllPersonalDetails} from './usePersonalDetails';

/** Mapping from accountID to user name (login or displayName). */
type AccountIDToNameMap = Record<string, string>;

const MENTION_ACCOUNT_ID_REGEX = /<mention-user[^>]*\saccountID="?(\d+)"?/gi;

/** Unique accountIDs referenced by <mention-user accountID=...> tags in the given HTML string */
function getMentionedAccountIDs(htmlString: string | undefined): number[] {
    if (!htmlString?.includes('<mention-user')) {
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

/** Same as useAccountIDToNameMap, but only maps the users mentioned in the given HTML string, for components rendered many times in a list. */
function useMentionedAccountIDToNameMap(htmlString: string | undefined): AccountIDToNameMap {
    const [personalDetailsList] = useAllPersonalDetails();
    return buildAccountIDToNameMap(personalDetailsList, getMentionedAccountIDs(htmlString));
}

/**
 * Scopes an accountID-to-name map to the users mentioned as @login in the given markdown, keeping Onyx storage small.
 * A draft only has @login mentions, while the synced copy of the message stores them by accountID, so we match on the
 * name to know which accountIDs the synced copy can contain.
 */
function getAccountIDToNameMapForMentionsInMarkdown(accountIDToName: AccountIDToNameMap | undefined, markdown: string): AccountIDToNameMap | undefined {
    if (!accountIDToName || !markdown.includes('@')) {
        return undefined;
    }
    const map: AccountIDToNameMap = {};
    for (const [accountID, name] of Object.entries(accountIDToName)) {
        if (name && markdown.includes(`@${name}`)) {
            map[accountID] = name;
        }
    }
    return Object.keys(map).length > 0 ? map : undefined;
}

export default useAccountIDToNameMap;
export {buildAccountIDToNameMap, useMentionedAccountIDToNameMap, getAccountIDToNameMapForMentionsInMarkdown};
