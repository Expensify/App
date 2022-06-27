import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function requestCall({
    taskID, policyID, firstName, lastName, phoneNumber, phoneNumberExtension,
}) {
    const optimisticData = [{
        onyxMethod: 'merge',
        key: ONYXKEYS.REQUEST_CALL_FORM,
        value: {
            loading: true,
        },
    }];

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
    API.read('OpenRequestCallPage');
}

export {
    openRequestCallPage,
    requestCall,
};
