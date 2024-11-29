import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import {fetchSAMLUrl} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SAMLSignInPage() {
    const {translate} = useLocalize();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);

    useEffect(() => {
        // If we don't have a valid login to pass here, direct the user back to a clean sign in state to try again
        if (!credentials?.login) {
            Session.clearSignInData();
            Session.setAccountError(translate('common.error.email'));
            Navigation.goBack(ROUTES.HOME);
            return;
        }

        const body = new FormData();
        body.append('email', credentials.login);
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER);

        fetchSAMLUrl(body).then((response) => {
            if (!response || !response.url) {
                return;
            }
            window.location.replace(response.url);
        });
    }, [credentials?.login]);

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default SAMLSignInPage;
