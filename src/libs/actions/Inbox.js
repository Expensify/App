import * as API from '../API';

function requestInboxCall(taskID, policyID, firstName, lastName, phoneNumber) {
    return API.Inbox_CallUser({
        policyID,
        firstName,
        lastName,
        phoneNumber,
        taskID,
    });
}

export {
    requestInboxCall,
};
