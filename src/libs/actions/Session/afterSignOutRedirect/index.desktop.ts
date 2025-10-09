import Onyx from 'react-native-onyx';
import redirectToSignIn from '@libs/actions/SignInRedirect';
import type AfterSignOutRedirect from './types';

/**
 * Desktop does not need to sign out of OldDot because it's a separate device from the web browser where the user might have an OldDot session.
 * Signing out of one device, such as the desktop app, should not affect the other device.
 */
const afterSignOutRedirect: AfterSignOutRedirect = (onyxSetParams) => {
    redirectToSignIn().then(() => {
        Onyx.multiSet(onyxSetParams);
    });
};

export default afterSignOutRedirect;
