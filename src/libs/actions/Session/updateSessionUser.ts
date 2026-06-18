import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

export default function updateSessionUser(accountID?: number, email?: string) {
    Onyx.merge(ONYXKEYS.SESSION, {accountID, email});
}
