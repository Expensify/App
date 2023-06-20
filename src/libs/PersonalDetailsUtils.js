import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from './Localize';
import * as UserUtils from './UserUtils';

let personalDetails = [];
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (personalDetails = _.values(val)),
});

/**
 * @param {Object} passedPersonalDetails
 * @param {Array} pathToDisplayName
 * @param {String} [defaultValue] optional default display name value
 * @returns {String}
 */
function getDisplayNameOrDefault(passedPersonalDetails, pathToDisplayName, defaultValue) {
    const displayName = lodashGet(passedPersonalDetails, pathToDisplayName);

    return displayName || defaultValue || 'Hidden';
}

/**
 * Given a list of account IDs (as number) it will return an array of personal details objects.
 * @param {Array<number>} accountIDs  - Array of accountIDs
 * @param {Number} currentUserAccountID
 * @param {Boolean} shouldChangeUserDisplayName - It will replace the current user's personal detail object's displayName with 'You'.
 * @returns {Array} - Array of personal detail objects
 */
function getPersonalDetailsByIDs(accountIDs, currentUserAccountID, shouldChangeUserDisplayName = false) {
    const result = [];
    _.each(
        _.filter(personalDetails, (detail) => accountIDs.includes(detail.accountID)),
        (detail) => {
            if (shouldChangeUserDisplayName && currentUserAccountID === detail.accountID) {
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

/**
 * Given a list of logins, find the associated personal detail and return related accountIDs.
 *
 * @param {Array<string>} logins Array of user logins
 * @returns {Array} - Array of accountIDs according to passed logins
 */
function getAccountIDsByLogins(logins) {
    return _.reduce(
        logins,
        (foundAccountIDs, login) => {
            const currentDetail = _.find(personalDetails, (detail) => detail.login === login);
            if (!currentDetail) {
                // generate an account ID because in this case the detail is probably new, so we don't have a real accountID yet
                foundAccountIDs.push(UserUtils.generateAccountID());
            } else {
                foundAccountIDs.push(Number(currentDetail.accountID));
            }
            return foundAccountIDs;
        },
        [],
    );
}

/**
 * Given a list of accountIDs, find the associated personal detail and return related logins.
 *
 * @param {Array<number>} accountIDs Array of user accountIDs
 * @returns {Array} - Array of logins according to passed accountIDs
 */
function getLoginsByAccountIDs(accountIDs) {
    return _.reduce(
        accountIDs,
        (foundLogins, accountID) => {
            const currentDetail = _.find(personalDetails, (detail) => Number(detail.accountID) === Number(accountID)) || {};
            if (currentDetail.login) {
                foundLogins.push(currentDetail.login);
            }
            return foundLogins;
        },
        [],
    );
}

export {getDisplayNameOrDefault, getPersonalDetailsByIDs, getAccountIDsByLogins, getLoginsByAccountIDs};
