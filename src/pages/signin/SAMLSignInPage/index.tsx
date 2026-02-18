import React, {useEffect} from 'react';
import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {handleSAMLLoginError, postSAMLLogin} from '@libs/LoginUtils';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';

function SAMLSignInPage() {
    const {translate} = useLocalize();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);

    useEffect(() => {
        // If we don't have a valid login to pass here, direct the user back to a clean sign in state to try again
        if (!credentials?.login) {
            handleSAMLLoginError(translate('common.error.email'), true);
            return;
        }

        const body = new FormData();
        body.append('email', credentials.login);
        body.append('referer', CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER);

        postSAMLLogin(body)
            .then((response) => {
                if (!response || !response.url) {
                    handleSAMLLoginError(translate('common.error.login'), false);
                    return;
                }
                window.location.replace(response.url);
            })
            .catch((error: Error) => {
                handleSAMLLoginError(error.message ?? translate('common.error.login'), false);
            });
    }, [credentials?.login, translate]);

    return <SAMLLoadingIndicator />;
}

export default SAMLSignInPage;
