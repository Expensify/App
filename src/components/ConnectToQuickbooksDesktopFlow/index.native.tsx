import useEffectOnce from '@hooks/useEffectOnce';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ConnectToQuickbooksDesktopFlowProps} from './types';

function ConnectToQuickbooksDesktopFlow({policyID}: ConnectToQuickbooksDesktopFlowProps) {
    useEffectOnce(() => {
        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
    });

    return null;
}

ConnectToQuickbooksDesktopFlow.displayName = 'ConnectToQuickbooksDesktopFlow';

export default ConnectToQuickbooksDesktopFlow;
