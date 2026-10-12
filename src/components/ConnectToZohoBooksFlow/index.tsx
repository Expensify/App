import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type ConnectToZohoBooksFlowProps = {
    policyID: string;
};

function ConnectToZohoBooksFlow({policyID}: ConnectToZohoBooksFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ZOHO_BOOKS_SETUP.getRoute(policyID));
        // This needs to run once as we will navigate away
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToZohoBooksFlow;
