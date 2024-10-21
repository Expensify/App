import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
    const {isSmallScreenWidth} = useResponsiveLayout();

    useEffect(() => {
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        } else {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID));
        }
    }, [isSmallScreenWidth, policyID]);

    return null;
}

ConnectToQuickbooksDesktopFlow.displayName = 'ConnectToQuickbooksDesktopFlow';

export default ConnectToQuickbooksDesktopFlow;
