import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import {getApiRoot} from '@libs/ApiUtils';
import CONST from '@src/CONST';

function SAMLSignInPage({credentials}: SAMLSignInPageProps) {
    useEffect(() => {
        const body = new FormData();
        body.append('email', credentials?.login ?? '');
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER)

        const url = `${getApiRoot()}authentication/saml/login`;
        fetch(url, {
            method: CONST.NETWORK.METHOD.POST,
            body,
            credentials: 'omit',
        }).then((response) => response.json() as Promise<Response>
        ).then((response) => {
            if (response.url) {
                window.location.replace(response.url);
            }
        });
    }, [credentials?.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default withOnyx<SAMLSignInPageProps, SAMLSignInPageOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
