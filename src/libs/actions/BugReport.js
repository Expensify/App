import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function send(stuff) {
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
        ...stuff,
    }, {optimisticData, successData, failureData});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    send,
};
