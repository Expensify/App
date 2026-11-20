/** Starts the Odoo connect flow. Odoo has no prerequisites or reusable connections, so it opens the setup page directly. */
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect, useRef} from 'react';

type ConnectToOdooFlowProps = {
    policyID: string;
};

function ConnectToOdooFlow({policyID}: ConnectToOdooFlowProps) {
    // A replayed effect (e.g. in Strict Mode) must not open the setup page twice for one Connect press
    const hasOpenedSetup = useRef(false);

    useEffect(() => {
        if (hasOpenedSetup.current) {
            return;
        }
        hasOpenedSetup.current = true;
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_ODOO_SETUP.getRoute(policyID));
    }, [policyID]);

    return null;
}

export default ConnectToOdooFlow;
