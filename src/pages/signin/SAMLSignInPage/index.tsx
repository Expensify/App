import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {SAMLSignInPageOnyxProps, SAMLSignInPageProps} from './types';

function SAMLSignInPage({credentials}: SAMLSignInPageProps) {
    useEffect(() => {
        window.location.replace(`${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials?.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`);
    }, [credentials?.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default function SAMLSignInPageOnyx(props: Omit<SAMLSignInPageProps, keyof SAMLSignInPageOnyxProps>) {
    const [account, accountMetadata] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials, credentialsMetadata] = useOnyx(ONYXKEYS.CREDENTIALS);

    if (isLoadingOnyxValue(accountMetadata, credentialsMetadata)) {
        return null;
    }

    return (
        <SAMLSignInPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            account={account}
            credentials={credentials}
        />
    );
}
