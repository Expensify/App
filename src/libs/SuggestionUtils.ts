import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from './LocalePhoneNumber';
import {getDisplayNameForParticipant} from './ReportUtils';

/**
 * Trims first character of the string if it is a space
 */
function trimLeadingSpace(str: string): string {
    return str.startsWith(' ') ? str.slice(1) : str;
}
/**
 * Checks if space is available to render large suggestion menu
 */
function hasEnoughSpaceForLargeSuggestionMenu(listHeight: number, composerHeight: number, totalSuggestions: number): boolean {
    const maxSuggestions = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER;
    const chatFooterHeight = CONST.CHAT_FOOTER_SECONDARY_ROW_HEIGHT + 2 * CONST.CHAT_FOOTER_SECONDARY_ROW_PADDING;
    const availableHeight = listHeight - composerHeight - chatFooterHeight;
    const menuHeight =
        (!totalSuggestions || totalSuggestions > maxSuggestions ? maxSuggestions : totalSuggestions) * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT +
        CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING * 2;

    return availableHeight > menuHeight;
}

function getDisplayName(details: PersonalDetails) {
    const displayNameFromAccountID = getDisplayNameForParticipant({accountID: details.accountID, formatPhoneNumber: formatPhoneNumberPhoneUtils});
    if (!displayNameFromAccountID) {
        return details.login?.length ? details.login : '';
    }
    return displayNameFromAccountID;
}

/**
 * Function to sort users. It compares weights, display names, and accountIDs in that order
 */
function getSortedPersonalDetails(personalDetails: Array<PersonalDetails & {weight: number}>, localeCompare: LocaleContextProps['localeCompare']) {
    return personalDetails.sort((first, second) => {
        if (first.weight !== second.weight) {
            return first.weight - second.weight;
        }

        const displayNameLoginOrder = localeCompare(getDisplayName(first), getDisplayName(second));
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }

        return first.accountID - second.accountID;
    });
}

export {trimLeadingSpace, hasEnoughSpaceForLargeSuggestionMenu, getSortedPersonalDetails};
