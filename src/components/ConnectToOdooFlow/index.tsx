/** Starts the Odoo connect flow. Odoo has no prerequisites or reusable connections, so it opens the setup page directly. */
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

type ConnectToOdooFlowProps = {
    policyID: string;
};

function ConnectToOdooFlow({policyID}: ConnectToOdooFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ODOO_SETUP.getRoute(policyID));
        // This needs to run once as we will navigate away
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToOdooFlow;
