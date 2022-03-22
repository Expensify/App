import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Growl from '../Growl';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';
import * as User from './User';
import PessimisticAction from '../PessimisticAction';

const REQUEST_INBOX_CALL = new PessimisticAction({
    name: 'requestInboxCall',

    /**
     * @param {Object} params
     * @param {String} taskID
     * @param {String} policyID
     * @param {String} firstName
     * @param {String} lastName
     * @param {String} phoneNumber
     * @returns {Promise}
     */
    action: ({
        taskID, policyID, firstName, lastName, phoneNumber, phoneNumberExtension,
    }) => API.Inbox_CallUser({
        policyID,
        firstName,
        lastName,
        phoneNumber,
        phoneNumberExtension,
        taskID,
    }),
    handle: {
        200: () => {
            Growl.success(Localize.translateLocal('requestCallPage.growlMessageOnSave'));
            Navigation.goBack();
        },
        666: () => {
            // The fact that the API is returning this error means the BLOCKED_FROM_CONCIERGE nvp in the user details has changed since the last time we checked, so let's update
            User.getUserDetails();
        },
    },
});

function getInboxCallWaitTime() {
    API.Inbox_CallUser_WaitTime()
        .then((data) => {
            Onyx.set(ONYXKEYS.INBOX_CALL_USER_WAIT_TIME, data.waitTime);
        });
}

export {
    REQUEST_INBOX_CALL,
    getInboxCallWaitTime,
};
