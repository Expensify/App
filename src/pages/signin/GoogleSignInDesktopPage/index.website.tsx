import React from 'react';
import ThirdPartySignInPage from '@pages/signin/ThirdPartySignInPage';
import CONST from '@src/CONST';

function GoogleSignInDesktopPage() {
    return <ThirdPartySignInPage signInProvider={CONST.SIGN_IN_METHOD.GOOGLE} />;
}

export default GoogleSignInDesktopPage;
