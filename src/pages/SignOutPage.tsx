import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@navigation/types';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type SignOutPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.SIGN_OUT>;

// This page is responsible for signing out the user when they navigate to the /sign-out route.
// It will trigger the sign-out process and redirect to the sign-in page.
function SignOutPage({route}: SignOutPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    useEffect(() => {
        // Extract parameters from route
        const shouldRedirectToClassicHomepage = route.params?.redirectToClassic ?? false;
        const accountIDFromClassicSignOut = route.params?.accountID;

        // Get the current session's accountID
        const currentSessionAccountID = session?.accountID;

        // If we have an accountID from Classic and it doesn't match the current session,
        // redirect back to Classic immediately without signing out
        if (accountIDFromClassicSignOut && currentSessionAccountID && accountIDFromClassicSignOut !== String(currentSessionAccountID)) {
            // Redirect back to Classic Expensify since the account doesn't match
            Linking.openURL(CONFIG.EXPENSIFY.EXPENSIFY_URL);
            return;
        }

        // Proceed with normal sign-out if accountIDs match or no accountID was provided
        signOutAndRedirectToSignIn(false, false, true, false, shouldRedirectToClassicHomepage);
    }, [route.params, session?.accountID]);

    // Show loading indicator while sign-out is processing
    return <FullScreenLoadingIndicator />;
}

SignOutPage.displayName = 'SignOutPage';

export default SignOutPage;
