import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';

let personalDetails = [];
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = _.values(val),
});

/**
 * Given a list of account IDs (as string) it will return an array of personal details objects.
 * @param {Array<string>} accountIDs  - Array of accountIDs
 * @returns {Array} - Array of personal detail objects
 */
export default function getPersonalDetailsByIDs(accountIDs) {
    return _.filter(personalDetails, value => accountIDs.includes(`${value.accountID}`));
}
