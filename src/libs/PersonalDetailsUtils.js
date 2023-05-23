import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from './Localize';

let personalDetails = [];
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: (val) => (personalDetails = _.values(val)),
});

/**
 * Given a list of account IDs (as string) it will return an array of personal details objects.
 * @param {Array<string>} accountIDs  - Array of accountIDs
 * @param {number} currentUserAccountID
 * @param {boolean} shouldChangeUserDisplayName - It will replace the current user's personal detail object's displayName with 'You'.
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
    // eslint-disable-next-line import/prefer-default-export
    getPersonalDetailsByIDs,
};
