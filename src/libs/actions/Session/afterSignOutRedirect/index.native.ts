import Onyx from 'react-native-onyx';
import redirectToSignIn from '@userActions/SignInRedirect';
import { openApp } from '@userActions/App';
import type AfterSignOutRedirect from './types';

const afterSignOutRedirect: AfterSignOutRedirect = (onyxSetParams, hasSwitchedAccountInHybridMode) => {
    redirectToSignIn().then(() => {
        Onyx.multiSet(onyxSetParams);

        if (hasSwitchedAccountInHybridMode) {
            openApp();
        }
    });
};

export default afterSignOutRedirect;