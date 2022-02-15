import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Growl from '../Growl';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import * as User from './User';

/**
 * @param {Object} params
 * @param {String} taskID
 * @param {String} policyID
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} phoneNumber
 */
function requestInboxCall({
    taskID, policyID, firstName, lastName, phoneNumber, phoneNumberExtension,
}) {
    Onyx.merge(ONYXKEYS.REQUEST_CALL_FORM, {loading: true});
    API.Inbox_CallUser({
        policyID,
        firstName,
        lastName,
        phoneNumber,
        phoneNumberExtension,
        taskID,
    })
        .then((result) => {
            if (result.jsonCode === 200) {
                Growl.success(Localize.translateLocal('requestCallPage.growlMessageOnSave'));
                Navigation.goBack();
                return;
            }

            if (result.jsonCode === 666) {
                // The fact that the API is returning this error means the BLOCKED_FROM_CONCIERGE nvp in the user details has changed since the last time we checked, so let's update
                User.getUserDetails();
            }

            // Phone number validation is handled by the API
            Growl.error(result.message, 3000);
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.REQUEST_CALL_FORM, {loading: false});
        });
}

function getInboxCallWaitTime() {
    API.Inbox_CallUser_WaitTime()
        .then((data) => {
            Onyx.set(ONYXKEYS.INBOX_CALL_USER_WAIT_TIME, data.waitTime);
        });
}

export {
    requestInboxCall,
    getInboxCallWaitTime,
};
