import * as Session from './actions/Session';

/**
 * Checks if user is anonymous. If true, shows the sign in modal, else,
 * executes the callback.
 */
const interceptAnonymousUser = (callback: () => void) => {
    const isAnonymousUser = Session.isAnonymousUser();
    if (isAnonymousUser) {
        Session.signOutAndRedirectToSignIn();
    } else {
        callback();
    }
};

export default interceptAnonymousUser;
