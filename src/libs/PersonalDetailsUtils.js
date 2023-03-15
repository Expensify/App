import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import * as Report from './actions/Report';
import * as Localize from './Localize';

let personalDetails = [];
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = _.values(val),
});

/**
 * Given a list of account IDs (as string) it will return an array of personal details objects.
 * @param {Array<string>} accountIDs  - Array of accountIDs
 * @param {boolean} shouldChangeUserDisplayName - It will replace the current user's personal detail object's displayName with 'You'.
 * @returns {Array} - Array of personal detail objects
 */
function getPersonalDetailsByIDs(accountIDs, shouldChangeUserDisplayName = false) {
    const result = [];
    const currentAccountID = Report.getCurrentUserAccountID();
    _.each(personalDetails, (detail) => {
        for (let i = 0; i < accountIDs.length; i++) {
            if (detail.accountID === accountIDs[i]) {
                if (shouldChangeUserDisplayName && currentAccountID.toString() === detail.accountID) {
                    result[i] = {
                        ...detail,
                        displayName: Localize.translateLocal('common.you'),
                    };
                } else {
                    result[i] = detail;
                }
                break;
            }
        }
    });
    return result;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPersonalDetailsByIDs,
};
