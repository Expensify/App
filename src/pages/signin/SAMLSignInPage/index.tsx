import SAMLLoadingIndicator from '@components/SAMLLoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {isDomainSessionRevocationActive} from '@libs/DomainSessionRevocation';
import {postSAMLLogin} from '@libs/LoginUtils';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect} from 'react';

import handleSAMLLoginError from './handleSAMLLoginError';

function SAMLSignInPage() {
    const {translate} = useLocalize();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [sessionRevocation, sessionRevocationMetadata] = useOnyx(ONYXKEYS.DOMAIN_SESSION_REVOCATION);

    useEffect(() => {
        if (sessionRevocationMetadata.status !== 'loaded' || sessionRevocation) {
            return;
        }
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
                if (isDomainSessionRevocationActive()) {
                    return;
                }
                if (!response || !response.url) {
                    handleSAMLLoginError(translate('common.error.login'), false);
                    return;
                }
                window.location.replace(response.url);
            })
            .catch((error: Error) => {
                handleSAMLLoginError(error.message ?? translate('common.error.login'), false);
            });
    }, [credentials?.login, translate, sessionRevocation, sessionRevocationMetadata.status]);

    return <SAMLLoadingIndicator />;
}

export default SAMLSignInPage;
