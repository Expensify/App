import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Credentials} from '@src/types/onyx';

type SAMLSignInPageOnyxProps = {
    /** The credentials of the logged in person */
    credentials: OnyxEntry<Credentials>;
};

type SAMLSignInPageProps = SAMLSignInPageOnyxProps;

function SAMLSignInPage({credentials}: SAMLSignInPageProps) {
    useEffect(() => {
        window.open(`${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials?.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`, '_self');
    }, [credentials?.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default withOnyx<SAMLSignInPageProps, SAMLSignInPageOnyxProps>({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
