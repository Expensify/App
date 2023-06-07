import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from './Localize';

let personalDetails = [];
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (personalDetails = _.values(val)),
});

/**
 * @param {Object} passedPersonalDetails 
 * @param {Array} pathToDisplayName 
 * @param {String} [defaultValue] optional default display name value
 */
function getDisplayNameOrDefault(passedPersonalDetails, pathToDisplayName, defaultValue) {
    let displayName = lodashGet(passedPersonalDetails, pathToDisplayName);

    return displayName || defaultValue || 'Hidden';
}

/**
 * Given a list of account IDs (as string) it will return an array of personal details objects.
 * @param {Array<string>} accountIDs  - Array of accountIDs
 * @param {Number} currentUserAccountID
 * @param {Boolean} shouldChangeUserDisplayName - It will replace the current user's personal detail object's displayName with 'You'.
 * @returns {Array} - Array of personal detail objects
 */
function getPersonalDetailsByIDs(accountIDs, currentUserAccountID, shouldChangeUserDisplayName = false) {
    const result = [];
    _.each(
        _.filter(personalDetails, (detail) => accountIDs.includes(detail.accountID)),
        (detail) => {
            if (shouldChangeUserDisplayName && currentUserAccountID.toString() === detail.accountID) {
                result.push({
                    ...detail,
                    displayName: Localize.translateLocal('common.you'),
                });
            } else {
                result.push(detail);
            }
        },
    );
    return result;
}

export {
    getDisplayNameOrDefault,
    getPersonalDetailsByIDs,
};
