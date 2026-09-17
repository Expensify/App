import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {PersonalDetails} from '@src/types/onyx';

import {getDisplayNameForParticipant} from './ReportUtils';

/**
 * Trims first character of the string if it is a space
 */
function trimLeadingSpace(str: string): string {
    return str.startsWith(' ') ? str.slice(1) : str;
}

function getDisplayName(details: PersonalDetails, formatPhoneNumber: LocaleContextProps['formatPhoneNumber'], translate: LocaleContextProps['translate']) {
    const displayNameFromAccountID = getDisplayNameForParticipant({accountID: details.accountID, formatPhoneNumber, translate});
    if (!displayNameFromAccountID) {
        return details.login?.length ? details.login : '';
    }
    return displayNameFromAccountID;
}

/**
 * Function to sort users. It compares weights, display names, and accountIDs in that order
 */
function getSortedPersonalDetails(
    personalDetails: Array<PersonalDetails & {weight: number}>,
    localeCompare: LocaleContextProps['localeCompare'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    translate: LocaleContextProps['translate'],
) {
    return personalDetails.sort((first, second) => {
        if (first.weight !== second.weight) {
            return first.weight - second.weight;
        }

        const displayNameLoginOrder = localeCompare(getDisplayName(first, formatPhoneNumber, translate), getDisplayName(second, formatPhoneNumber, translate));
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }

        return first.accountID - second.accountID;
    });
}

export {trimLeadingSpace, getSortedPersonalDetails};
