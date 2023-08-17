import React from 'react';
import ThirdPartySignInPage from '../ThirdPartySignInPage';
import CONST from '../../../CONST';

function GoogleSignInDesktopPage() {
    return <ThirdPartySignInPage signInProvider={CONST.SIGN_IN_METHOD.GOOGLE} />;
}

export default GoogleSignInDesktopPage;
