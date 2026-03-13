import type {OnyxEntry} from 'react-native-onyx';
import * as Session from './actions/Session';

/**
 * Checks if user is anonymous. If true, shows the sign in modal, else,
 * executes the callback.
 */
const interceptAnonymousUser = (callback: () => void, activePolicyID?: OnyxEntry<string>) => {
    const isAnonymousUser = Session.isAnonymousUser();
    if (isAnonymousUser) {
        Session.signOutAndRedirectToSignIn(undefined, undefined, undefined, undefined, activePolicyID);
    } else {
        callback();
    }
};

export default interceptAnonymousUser;
