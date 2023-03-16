import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import * as API from '../../API';
import getSystemDetails from './getSystemDetails';

function send() {
    const systemDetails = getSystemDetails();

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: true,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: false,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.BUG_REPORT,
            value: {
                loading: false,
            },
        },
    ];

    API.write('SubmitBugReport', {
        ...systemDetails,
    }, {optimisticData, successData, failureData});
}

export {
    send,
    getSystemDetails,
};
