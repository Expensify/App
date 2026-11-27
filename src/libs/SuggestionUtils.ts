import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {PersonalDetails} from '@src/types/onyx';

import {getDisplayNameForParticipant} from './ReportUtils';

/**
 * Trims first character of the string if it is a space
 */
function trimLeadingSpace(str: string): string {
    return str.startsWith(' ') ? str.slice(1) : str;
}

function getDisplayName(details: PersonalDetails, formatPhoneNumber: LocaleContextProps['formatPhoneNumber'], hiddenTranslation: string) {
    const displayNameFromAccountID = getDisplayNameForParticipant({accountID: details.accountID, formatPhoneNumber, hiddenTranslation});
    if (!displayNameFromAccountID) {
        return details.login?.length ? details.login : '';
    }
    return displayNameFromAccountID;
}

type PersonalDetailsWithWeight = PersonalDetails & {weight: number};

/** A user with the display name it is sorted by, resolved once */
type SortEntry = {detail: PersonalDetailsWithWeight; displayName: string};

/**
 * Returns the first `limit` users in sorted order. It compares weights, display names, and accountIDs in that order.
 * Only the users that can still be among the first `limit` are kept in order, so taking the first few of thousands does not sort them all.
 */
function getSortedPersonalDetails(
    personalDetails: PersonalDetailsWithWeight[],
    localeCompare: LocaleContextProps['localeCompare'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    translate: LocaleContextProps['translate'],
    limit: number,
): PersonalDetailsWithWeight[] {
    // Resolve the translation once, not per comparison.
    const hiddenText = translate('common.hidden');

    const compare = (first: SortEntry, second: SortEntry) => {
        if (first.detail.weight !== second.detail.weight) {
            return first.detail.weight - second.detail.weight;
        }

        const displayNameLoginOrder = localeCompare(first.displayName, second.displayName);
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }

        return first.detail.accountID - second.detail.accountID;
    };

    // The first users found so far, in order, at most `limit` of them
    const sortedEntries: SortEntry[] = [];
    for (const detail of personalDetails) {
        // Each user's display name is resolved once, not on every comparison
        const entry: SortEntry = {detail, displayName: getDisplayName(detail, formatPhoneNumber, hiddenText)};
        if (sortedEntries.length >= limit) {
            const lastEntry = sortedEntries.at(-1);
            // A user that does not come before the last one kept cannot be among the first `limit`
            if (!lastEntry || compare(entry, lastEntry) >= 0) {
                continue;
            }
        }

        // Insert after any equal users, so users that compare equal keep their input order, as in a stable sort
        let low = 0;
        let high = sortedEntries.length;
        while (low < high) {
            const middle = Math.floor((low + high) / 2);
            if (compare(entry, sortedEntries[middle]) < 0) {
                high = middle;
            } else {
                low = middle + 1;
            }
        }
        sortedEntries.splice(low, 0, entry);
        if (sortedEntries.length > limit) {
            sortedEntries.pop();
        }
    }

    return sortedEntries.map((entry) => entry.detail);
}

export {trimLeadingSpace, getSortedPersonalDetails};
