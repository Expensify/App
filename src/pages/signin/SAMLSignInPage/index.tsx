import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import {fetchSAMLUrl} from '@libs/LoginUtils';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import * as Session from '@userActions/Session';
import useLocalize from '@hooks/useLocalize';

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
