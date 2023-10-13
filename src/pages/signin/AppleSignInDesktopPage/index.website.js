import React from 'react';
import ThirdPartySignInPage from '../ThirdPartySignInPage';
import CONST from '../../../CONST';

function AppleSignInDesktopPage() {
    return <ThirdPartySignInPage signInProvider={CONST.SIGN_IN_METHOD.APPLE} />;
}

export default AppleSignInDesktopPage;
