import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Growl from '../Growl';
import * as Localize from '../Localize';
import Navigation from '../Navigation/Navigation';

/**
 * @param {Object} params
 * @param {String} taskID
 * @param {String} policyID
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} phoneNumber
 */
function requestInboxCall({
    taskID, policyID, firstName, lastName, phoneNumber,
}) {
    Onyx.merge(ONYXKEYS.REQUEST_CALL_FORM, {loading: true});
    API.Inbox_CallUser({
        policyID,
        firstName,
        lastName,
        phoneNumber,
        taskID,
    })
        .then((result) => {
            if (result.jsonCode === 200) {
                Growl.success(Localize.translateLocal('requestCallPage.growlMessageOnSave'));
                Navigation.goBack();
                return;
            }

            // Phone number validation is handled by the API
            Growl.error(result.message, 3000);
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.REQUEST_CALL_FORM, {loading: false});
        });
}

// eslint-disable-next-line import/prefer-default-export
export {requestInboxCall};
