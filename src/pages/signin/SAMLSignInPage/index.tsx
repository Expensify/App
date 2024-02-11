import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SAMLSignInPageOnyxProps, SAMLSignInPageProps} from './types';

function SAMLSignInPage({credentials}: SAMLSignInPageProps) {
    useEffect(() => {
        window.open(`${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials?.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`, '_self');
    }, [credentials?.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default withOnyx<SAMLSignInPageProps, SAMLSignInPageOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
