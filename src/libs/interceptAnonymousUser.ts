import type {OnyxEntry} from 'react-native-onyx';
import {isAnonymousUser, signOutAndRedirectToSignIn} from './actions/Session';

/**
 * Checks if user is anonymous. If true, shows the sign in modal, else,
 * executes the callback.
 */
const interceptAnonymousUser = (callback: () => void, activePolicyID?: OnyxEntry<string>) => {
    if (isAnonymousUser()) {
        signOutAndRedirectToSignIn(undefined, undefined, undefined, undefined, activePolicyID);
    } else {
        callback();
    }
};

export default interceptAnonymousUser;
