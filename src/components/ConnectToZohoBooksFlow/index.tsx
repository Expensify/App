import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';

import Navigation from '@libs/Navigation/Navigation';

import useStartZohoBooksOAuth from '@pages/workspace/accounting/zohoBooks/useStartZohoBooksOAuth';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type ConnectToZohoBooksFlowProps = {
    policyID: string;
};

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    const hasReusablePoliciesConnectedToZohoBooks = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.ZOHO_BOOKS, policyID);
    const startZohoBooksOAuth = useStartZohoBooksOAuth();

    useEffect(() => {
        if (hasReusablePoliciesConnectedToZohoBooks) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_EXISTING_CONNECTIONS.getRoute(policyID));
            return;
        }
        startZohoBooksOAuth(policyID);
        // This needs to run once as it starts the connection flow
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToZohoBooksFlow;
