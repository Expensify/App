import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import {getApiRoot} from '@libs/ApiUtils';
import CONST from '@src/CONST';

function SAMLSignInPage() {
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    useEffect(() => {
        const body = new FormData();
        body.append('email', credentials?.login ?? '');
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER);

        fetch(`${getApiRoot()}authentication/saml/login`, {
            method: CONST.NETWORK.METHOD.POST,
            body,
            credentials: 'omit',
        })
        .then((response) => response.json() as Promise<Response>)
        .then((json) => {
            if (json.url) {
                window.location.replace(json.url);
            }
        });
    }, [credentials?.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default SAMLSignInPage;
