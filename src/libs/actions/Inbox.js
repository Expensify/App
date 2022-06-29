import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function requestCall({
    taskID, policyID, firstName, lastName, phoneNumber, phoneNumberExtension,
}) {
    // Set loading spinner as we wait for the request to complete
    const optimisticData = [{
        onyxMethod: 'merge',
        key: ONYXKEYS.REQUEST_CALL_FORM,
        value: {
            loading: true,
        },
    }];

    // Upon success, stop the loading spinner and show the screen confirming we have successfully requested a call
    const successData = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.ACCOUNT,
            value: {
                success: true,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.REQUEST_CALL_FORM,
            value: {
                loading: false,
            },
        },
    ];

    // Stop the loading spinner upon failure as well
    const failureData = [{
        onyxMethod: 'merge',
        key: ONYXKEYS.REQUEST_CALL_FORM,
        value: {
            loading: false,
        },
    }];

    API.write(
        'RequestCall',
        {
            policyID,
            firstName,
            lastName,
            phoneNumber,
            phoneNumberExtension,
            taskID,
        },
        {optimisticData, successData, failureData},
    );
}

function openRequestCallPage() {
    // Reset the error message in case we had one set from a previous failed attempt at requesting a call.
    const optimisticData = [{
        onyxMethod: 'merge',
        key: ONYXKEYS.REQUEST_CALL_FORM,
        value: {
            error: '',
        },
    }];
    API.read('OpenRequestCallPage', {}, {optimisticData});
}

export {
    openRequestCallPage,
    requestCall,
};
