/**
 * Thin non-UI store for the personal details list.
 * Use this only in non-React contexts (e.g. request middleware) where `useOnyx` is not available;
 * React code should read the list via `useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST)` and pass it down.
 */
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;

Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value;
    },
});

function getAllPersonalDetails(): OnyxEntry<PersonalDetailsList> {
    return allPersonalDetails;
}

// eslint-disable-next-line import/prefer-default-export
export {getAllPersonalDetails};
