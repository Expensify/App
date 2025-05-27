import asyncOpenURL from '@libs/asyncOpenURL';
import redirectToSignIn from '@userActions/SignInRedirect';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {openApp} from '@userActions/App';

function afterSignOutRedirect(onyxSetParams: OnyxMultiSetInput, hasSwitchedAccountInHybridMode: boolean) {
    // Sign out from classic as well so the user does not get logged back in when visiting expensify.com and subsequently auto redirected back to New Expensify
    const oldDotSignOutUrl = new URL(CONST.OLDDOT_URLS.SIGN_OUT, CONFIG.EXPENSIFY.EXPENSIFY_URL);
    oldDotSignOutUrl.searchParams.set('clean', 'true');

    // Redirect back to New Expensify after classic sign out so the user is not confused by being redirected to a different site
    oldDotSignOutUrl.searchParams.set('signedOutFromNewExpensify', 'true');

    asyncOpenURL(
        redirectToSignIn().then(() => {
            Onyx.multiSet(onyxSetParams);
        }),
        oldDotSignOutUrl.toString(),
        true,
        true,
    );

    if (hasSwitchedAccountInHybridMode) {
        openApp();
    }
}

export default afterSignOutRedirect;