import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

import type {ConnectToZohoBooksFlowProps} from './types';

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    useEffect(() => {
        // On native the OAuth setup loads inside an in-app WebView screen.
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_OAUTH.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToZohoBooksFlow;
