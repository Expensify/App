import {useEffect} from 'react';
import useHasPoliciesConnectedToQBD from '@hooks/useHasPoliciesConnectedToQBD';
import {isMobile} from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

const isMobileWeb = isMobile();

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
    const hasPoliciesConnectedToQBD = useHasPoliciesConnectedToQBD();

    useEffect(() => {
        if (hasPoliciesConnectedToQBD) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXISTING_CONNECTIONS.getRoute(policyID));
            return;
        }
        if (isMobileWeb) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        } else {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID));
        }
    }, [policyID, hasPoliciesConnectedToQBD]);

    return null;
}

export default ConnectToQuickbooksDesktopFlow;
