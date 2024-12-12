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
            handleError(translate('common.error.email'), true);
            return;
        }

        const body = new FormData();
        body.append('email', credentials.login);
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER);

        fetchSAMLUrl(body)
            .then((response) => {
                if (!response || !response.url) {
                    handleError(translate('common.error.login'));
                    return;
                }
                window.location.replace(response.url);
            })
            .catch((error: Error) => {
                handleError(error.message ?? translate('common.error.login'));
            });
    }, [credentials?.login, translate]);

    function handleError(errorMessage: string, cleanSignInData = false) {
        if (cleanSignInData) {
            Session.clearSignInData();
        }

        Session.setAccountError(errorMessage);
        Navigation.goBack(ROUTES.HOME);
    }

    return <SAMLLoadingIndicator />;
}

SAMLSignInPage.displayName = 'SAMLSignInPage';

export default SAMLSignInPage;
