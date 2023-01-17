import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
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
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.FORMS.REQUEST_CALL_FORM,
        value: {
            isLoading: true,
        },
    }];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REQUEST_CALL_FORM,
            value: {
                isLoading: false,
                error: '',
                didRequestCallSucceed: true,
            },
        },
    ];

    const failureData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.FORMS.REQUEST_CALL_FORM,
        value: {
            isLoading: false,
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
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.FORMS.REQUEST_CALL_FORM,
        value: {
            error: '',
        },
    }];
    API.read('OpenRequestCallPage', {}, {optimisticData});
}

function clearDidRequestCallSucceed() {
    Onyx.merge(ONYXKEYS.FORMS.REQUEST_CALL_FORM, {didRequestCallSucceed: false});
}

export {
    openRequestCallPage,
    requestCall,
    clearDidRequestCallSucceed,
};
