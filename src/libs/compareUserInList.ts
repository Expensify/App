import localeCompare from './LocaleCompare';

/**
 * the comparison function used to determine which user will come first in the sorted list
 * generally, smaller weight means will come first, and if the weight is the same, we'll sort based on displayName/login and accountID
 */

type UserDetailsWithWeight = {
    displayName: string;
    weight: number;
    accountID: number;
};

function compareUserInList(first: UserDetailsWithWeight, second: UserDetailsWithWeight) {
    // first, we should sort by weight
    if (first.weight !== second.weight) {
        return first.weight - second.weight;
    }

    const displayNameLoginOrder = localeCompare(first.displayName, second.displayName);
    if (displayNameLoginOrder !== 0) {
        return displayNameLoginOrder;
    }

    // Then fallback on accountID as the final sorting criteria.
    return first.accountID - second.accountID;
}

export default compareUserInList;
