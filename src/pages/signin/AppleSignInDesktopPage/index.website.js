import React from 'react';
import ThirdPartySignInPage from '@pages/signin/ThirdPartySignInPage';
import CONST from '@src/CONST';

function AppleSignInDesktopPage() {
    return <ThirdPartySignInPage signInProvider={CONST.SIGN_IN_METHOD.APPLE} />;
}

export default AppleSignInDesktopPage;
