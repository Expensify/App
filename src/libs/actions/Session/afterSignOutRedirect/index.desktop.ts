import Onyx from 'react-native-onyx';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import redirectToSignIn from '@libs/actions/SignInRedirect';

/**
 * Desktop does not need to sign out of OldDot because it's a separate device from the web browser where the user might have an OldDot session.
 * Logging out of one device, such as the desktop app, should not affect the other device.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const afterSignOutRedirect = (onyxSetParams: OnyxMultiSetInput, hasSwitchedAccountInHybridMode: boolean) => {
    redirectToSignIn().then(() => {
        Onyx.multiSet(onyxSetParams);
    });
};

export default afterSignOutRedirect;
