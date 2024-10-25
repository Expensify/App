import {useEffect} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
    useEffect(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

ConnectToQuickbooksDesktopFlow.displayName = 'ConnectToQuickbooksDesktopFlow';

export default ConnectToQuickbooksDesktopFlow;
