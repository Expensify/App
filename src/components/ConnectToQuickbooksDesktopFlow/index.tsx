import {useEffect} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
<<<<<<< HEAD
import * as PolicyAction from '@userActions/Policy/Policy';
=======
>>>>>>> main
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
<<<<<<< HEAD
=======
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
>>>>>>> main
    const {isSmallScreenWidth} = useResponsiveLayout();

    useEffect(() => {
        if (isSmallScreenWidth) {
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        } else {
<<<<<<< HEAD
            // Since QBD doesn't support Taxes, we should disable them from the LHN when connecting to QBD
            PolicyAction.enablePolicyTaxes(policyID, false);
=======
>>>>>>> main
            Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID));
        }
    }, [isSmallScreenWidth, policyID]);

    return null;
}

ConnectToQuickbooksDesktopFlow.displayName = 'ConnectToQuickbooksDesktopFlow';

export default ConnectToQuickbooksDesktopFlow;
