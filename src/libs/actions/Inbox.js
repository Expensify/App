import {Inbox_CallUser} from '../API';

function requestInboxCall(taskID, policyID, firstName, lastName, phoneNumber) {
    return Inbox_CallUser({
        policyID,
        firstName,
        lastName,
        phoneNumber,
        taskID,
    });
}

// eslint-disable-next-line import/prefer-default-export
export {requestInboxCall};
