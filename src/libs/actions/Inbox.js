import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * Requests a call from Guides
 *
 * @param {Object} params
 * @param {String} params.taskID
 * @param {String} params.policyID
 * @param {String} params.firstName
 * @param {String} params.lastName
 * @param {String} params.phoneNumber
 * @param {String} params.phoneNumberExtension
 */
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
            key: ONYXKEYS.REQUEST_CALL_FORM,
            value: {
                loading: false,
                error: '',
                didRequestCallSucceed: true,
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

function clearDidRequestCallSucceed() {
    Onyx.merge(ONYXKEYS.REQUEST_CALL_FORM, {didRequestCallSucceed: false});
}

export {
    openRequestCallPage,
    requestCall,
    clearDidRequestCallSucceed,
};
