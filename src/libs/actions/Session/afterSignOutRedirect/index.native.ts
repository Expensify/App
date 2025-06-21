import Onyx from 'react-native-onyx';
import {openApp} from '@userActions/App';
import redirectToSignIn from '@userActions/SignInRedirect';
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
