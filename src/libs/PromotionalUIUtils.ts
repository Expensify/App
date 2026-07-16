import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import shouldSuppressPromotionalUISelector from '@selectors/PromotionalUI';
import Onyx from 'react-native-onyx';

let session: OnyxEntry<Session>;
let account: OnyxEntry<Account>;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        session = value;
    },
});

Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
    },
});

/**
 * Synchronous check for navigation guards and action modules that cannot use hooks.
 */
function shouldSuppressPromotionalUI(): boolean {
    return shouldSuppressPromotionalUISelector(session, account);
}

export default shouldSuppressPromotionalUI;
