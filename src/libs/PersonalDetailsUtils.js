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
 * Note: it will replace the current user's personal detail object's displayName with 'You'.
 * @param {Array<string>} accountIDs  - Array of accountIDs
 * @returns {Array} - Array of personal detail objects
 */
function getPersonalDetailsByIDs(accountIDs, shouldChangeUserDisplayName = false) {
    const result = [];
    const currentAccountID = Report.getCurrentUserAccountID();
    _.each(personalDetails, (detail) => {
        for (let i = 0; i < accountIDs.length; i++) {
            if (detail.accountID === accountIDs[i]) {
                if (shouldChangeUserDisplayName && currentAccountID.toString() === detail.accountID.toString()) {
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
