import {useEffect} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksOnlineFlowProps} from './types';

function ConnectToQuickbooksOnlineFlow({policyID}: ConnectToQuickbooksOnlineFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_SETUP.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToQuickbooksOnlineFlow;
