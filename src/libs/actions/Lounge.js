// import Onyx from 'react-native-onyx';
// import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * Checks in the user in to the lounge
 *
 */
function recordLoungeVisit() {
    API.write(
        'RecordLoungeVisit',
        // {},
        // {
        //     optimisticData: [
        //         {
        //             onyxMethod: Onyx.METHOD.MERGE,
        //             key: ONYXKEYS.USER,
        //             value: {isSubscribedToNewsletter: isSubscribed},
        //         },
        //     ],
        //     failureData: [
        //         {
        //             onyxMethod: Onyx.METHOD.MERGE,
        //             key: ONYXKEYS.USER,
        //             value: {isSubscribedToNewsletter: !isSubscribed},
        //         },
        //     ],
        // },
    );
};

export {
    // eslint-disable-next-line import/prefer-default-export
    recordLoungeVisit,
};
