import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@navigation/types';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import type SCREENS from '@src/SCREENS';

type SignOutPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.SIGN_OUT>;

// This page is responsible for signing out the user when they navigate to the /sign-out route.
// It will trigger the sign-out process and redirect to the sign-in page.
function SignOutPage({route}: SignOutPageProps) {
    useEffect(() => {
        // Check if we should redirect to classic home page via URL parameter
        const shouldRedirectToClassicHomepage = route.params?.redirectToClassic ?? false;

        // Trigger sign-out when the component mounts
        signOutAndRedirectToSignIn(false, false, true, false, shouldRedirectToClassicHomepage);
    }, [route.params?.redirectToClassic]);

    // Show loading indicator while sign-out is processing
    return <FullScreenLoadingIndicator />;
}

SignOutPage.displayName = 'SignOutPage';

export default SignOutPage;
