import Onyx from 'react-native-onyx';
import asyncOpenURL from '@libs/asyncOpenURL';
import {openApp} from '@userActions/App';
import redirectToSignIn from '@userActions/SignInRedirect';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type AfterSignOutRedirect from './types';

const afterSignOutRedirect: AfterSignOutRedirect = (onyxSetParams, hasSwitchedAccountInHybridMode, accountID, isTransitioning) => {
    // Sign out from classic as well so the user does not get logged back in when visiting expensify.com and subsequently auto redirected back to New Expensify
    const oldDotSignOutUrl = new URL(CONST.OLDDOT_URLS.SIGN_OUT, CONFIG.EXPENSIFY.EXPENSIFY_URL);
    oldDotSignOutUrl.searchParams.set('clean', 'true');

    // Redirect back to New Expensify after classic sign out so the user is not confused by being redirected to a different site
    oldDotSignOutUrl.searchParams.set('signedOutFromNewExpensify', 'true');

    // Pass the account ID of the user that is signing out
    if (accountID) {
        oldDotSignOutUrl.searchParams.set('accountID', String(accountID));
    }

    const getRedirectToSignInPromise = () => {
        return redirectToSignIn().then(() => {
            Onyx.multiSet(onyxSetParams);
        });
    };

    if (isTransitioning) {
        getRedirectToSignInPromise();
    } else {
        // Only redirect to sign out from OldDot if we're not transitioning from it.
        asyncOpenURL(getRedirectToSignInPromise(), oldDotSignOutUrl.toString(), true, true);
    }

    if (hasSwitchedAccountInHybridMode) {
        openApp();
    }
};

export default afterSignOutRedirect;
