import {useEffect} from 'react';
import useReusablePoliciesConnectedToQBD from '@hooks/useReusablePoliciesConnectedToQBD';
import Navigation from '@libs/Navigation/Navigation';
import getQuickbooksDesktopSetupEntryRoute from '@pages/workspace/accounting/qbd/utils';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
    const {hasReusablePoliciesConnectedToQBD} = useReusablePoliciesConnectedToQBD(policyID);

    useEffect(() => {
        if (hasReusablePoliciesConnectedToQBD) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXISTING_CONNECTIONS.getRoute(policyID));
            return;
        }
        Navigation.navigate(getQuickbooksDesktopSetupEntryRoute(policyID));
        // Runs once on mount — re-running when hasReusablePoliciesConnectedToQBD changes mid-flow would interrupt an in-progress setup.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ConnectToQuickbooksDesktopFlow;
