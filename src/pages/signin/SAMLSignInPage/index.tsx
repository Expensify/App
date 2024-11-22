import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import {fetchSAMLUrl} from '@libs/LoginUtils';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
function SAMLSignInPage() {
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    useEffect(() => {
        const body = new FormData();
        body.append('email', credentials?.login ?? '');
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER);

        fetchSAMLUrl(body).then((response) => {
            if (response && response.url) {
                window.location.replace(response.url);
            }
        });
    }, [credentials?.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default SAMLSignInPage;
