import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * Register visit at the lounge
 *
 * @param {String} checkInsRemaining
 */
function recordLoungeVisit(checkInsRemaining) {
    API.write(
        'RecordLoungeVisit',
        {},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.USER,
                    value: {loungeCheckInDetails: { isCheckedIn: true, checkInsRemaining: checkInsRemaining - 1 }}
                },
            ],
        },
    );
};

export {
    // eslint-disable-next-line import/prefer-default-export
    recordLoungeVisit,
};
