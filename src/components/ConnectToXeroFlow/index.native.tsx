import {useEffect} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(policyID));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToXeroFlow;
