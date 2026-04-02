import {useEffect} from 'react';
import useHasPoliciesConnectedToQBD from '@hooks/useHasPoliciesConnectedToQBD';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
    const hasPoliciesConnectedToQBD = useHasPoliciesConnectedToQBD();

    useEffect(() => {
        if (hasPoliciesConnectedToQBD) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXISTING_CONNECTIONS.getRoute(policyID));
            return;
        }
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        // Runs once on mount — re-running when hasPoliciesConnectedToQBD changes mid-flow would interrupt an in-progress setup.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToQuickbooksDesktopFlow;
