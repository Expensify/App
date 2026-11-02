import type {Session as SessionType} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import * as Session from './actions/Session';

/**
 * Checks if user is anonymous. If true, shows the sign in modal, else,
 * executes the callback.
 */
// Session is optional while some utility callers (e.g. SearchUIUtils, tabScreenListeners) still omit it. Refactor issue: https://github.com/Expensify/App/issues/67782
const interceptAnonymousUser = (callback: () => void, session?: OnyxEntry<SessionType>) => {
    const isAnonymousUser = Session.isAnonymousUser(session);
    if (isAnonymousUser) {
        Session.signOutAndRedirectToSignIn();
    } else {
        callback();
    }
};

export default interceptAnonymousUser;
