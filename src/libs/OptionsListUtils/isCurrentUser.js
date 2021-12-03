import _ from 'underscore';
import * as PersonalDetailsUtils from '../PersonalDetailsUtils';
import * as store from './store';

/**
 * Returns the given userDetails is currentUser or not.
 * @param {Object} userDetails
 * @returns {Bool}
 */
function isCurrentUser(userDetails) {
    if (!userDetails) {
        // If userDetails is null or undefined
        return false;
    }

    // If user login is mobile number, append sms domain if not appended already.
    const userDetailsLogin = PersonalDetailsUtils.addSMSDomainIfPhoneNumber(userDetails.login);

    // Initial check with currentUserLogin
    let result = store.getCurrentUserLogin().toLowerCase() === userDetailsLogin.toLowerCase();
    const currentUser = store.getCurrentUser();
    const loginList = _.isEmpty(currentUser) || _.isEmpty(currentUser.loginList) ? [] : currentUser.loginList;
    let index = 0;

    // Checking userDetailsLogin against to current user login options.
    while (index < loginList.length && !result) {
        if (loginList[index].partnerUserID.toLowerCase() === userDetailsLogin.toLowerCase()) {
            result = true;
        }
        index++;
    }
    return result;
}

export default isCurrentUser;
