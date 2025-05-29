import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {signOutAndRedirectToSignIn} from '@userActions/Session';

// This page is responsible for signing out the user when they navigate to the /sign-out route.
// It will trigger the sign-out process and redirect to the sign-in page.
function SignOutPage() {
    useEffect(() => {
        // Trigger sign-out when the component mounts
        signOutAndRedirectToSignIn();
    }, []);

    // Show loading indicator while sign-out is processing
    return <FullScreenLoadingIndicator />;
}

SignOutPage.displayName = 'SignOutPage';

export default SignOutPage;
