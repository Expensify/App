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

/**
 * Function to sort users. It compares weights, display names, and accountIDs in that order
 */
function getSortedPersonalDetails(
    personalDetails: Array<PersonalDetails & {weight: number}>,
    localeCompare: LocaleContextProps['localeCompare'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    translate: LocaleContextProps['translate'],
) {
    // Resolve the translation once, not per comparison.
    const hiddenText = translate('common.hidden');
    return personalDetails.sort((first, second) => {
        if (first.weight !== second.weight) {
            return first.weight - second.weight;
        }

        const displayNameLoginOrder = localeCompare(getDisplayName(first, formatPhoneNumber, hiddenText), getDisplayName(second, formatPhoneNumber, hiddenText));
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }

        return first.accountID - second.accountID;
    });
}

export {trimLeadingSpace, getSortedPersonalDetails};
