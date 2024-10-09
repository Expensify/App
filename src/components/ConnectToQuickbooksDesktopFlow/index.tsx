import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyAction from '@userActions/Policy/Policy';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
    const {isSmallScreenWidth} = useResponsiveLayout();

    useEffect(() => {
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        } else {
            // Since QBD doesn't support Taxes, we should disable them from the LHN when connecting to QBD
            PolicyAction.enablePolicyTaxes(policyID, false);
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID));
        }
    }, [isSmallScreenWidth, policyID]);

    return null;
}

ConnectToQuickbooksDesktopFlow.displayName = 'ConnectToQuickbooksDesktopFlow';

export default ConnectToQuickbooksDesktopFlow;
