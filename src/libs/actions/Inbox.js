import {Inbox_CallUser} from '../API';

function requestConciergeDMCall(policyID, firstName, lastName, phoneNumber) {
    return Inbox_CallUser({
        policyID,
        firstName,
        lastName,
        phoneNumber,
        taskID: 'NewExpensifyConciergeDM',
    });
}

// eslint-disable-next-line import/prefer-default-export
export {requestConciergeDMCall};
