import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import CONST from '../../CONST';
import * as Localize from '../Localize';
import isSearchStringMatch from './isSearchStringMatch';
import * as store from './store';

/**
 * Build the IOUConfirmation options for showing MyPersonalDetail
 *
 * @param {Object} myPersonalDetail
 * @param {String} amountText
 * @returns {Object}
 */
function getIOUConfirmationOptionsFromMyPersonalDetail(myPersonalDetail, amountText) {
    return {
        text: myPersonalDetail.displayName,
        alternateText: myPersonalDetail.login,
        icons: [myPersonalDetail.avatar],
        descriptiveText: amountText,
        login: myPersonalDetail.login,
    };
}

/**
 * Build the IOUConfirmationOptions for showing participants
 *
 * @param {Array} participants
 * @param {String} amountText
 * @returns {Array}
 */
function getIOUConfirmationOptionsFromParticipants(
    participants, amountText,
) {
    return _.map(participants, participant => ({
        ...participant, descriptiveText: amountText,
    }));
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 *
 * @param {Boolean} hasSelectableOptions
 * @param {Boolean} hasUserToInvite
 * @param {String} searchValue
 * @param {Boolean} [maxParticipantsReached]
 * @return {String}
 */
function getHeaderMessage(hasSelectableOptions, hasUserToInvite, searchValue, maxParticipantsReached = false) {
    const preferredLocale = store.getPreferredLocale();
    if (maxParticipantsReached) {
        return Localize.translate(preferredLocale, 'messages.maxParticipantsReached');
    }

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !Str.isValidPhone(searchValue)) {
        return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
    }

    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue)) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
        }

        return Localize.translate(preferredLocale, 'common.noResultsFound');
    }

    return '';
}

/**
 * Returns the currency list for sections display
 *
 * @param {Object} currencyOptions
 * @param {String} searchValue
 * @returns {Array}
 */
function getCurrencyListForSections(currencyOptions, searchValue) {
    const filteredOptions = _.filter(currencyOptions, currencyOption => (
        isSearchStringMatch(searchValue, currencyOption.searchText)));

    return {
        // returns filtered options i.e. options with string match if search text is entered
        currencyOptions: filteredOptions,
    };
}

export {
    getIOUConfirmationOptionsFromMyPersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
    getHeaderMessage,
    getCurrencyListForSections,
};
