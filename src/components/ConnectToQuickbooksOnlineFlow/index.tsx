import useEffectOnce from '@hooks/useEffectOnce';
import useEnvironment from '@hooks/useEnvironment';
import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import * as Link from '@userActions/Link';
import * as PolicyAction from '@userActions/Policy/Policy';
import type {ConnectToQuickbooksOnlineFlowProps} from './types';

function ConnectToQuickbooksOnlineFlow({policyID}: ConnectToQuickbooksOnlineFlowProps) {
    const {environmentURL} = useEnvironment();

    useEffectOnce(() => {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        PolicyAction.enablePolicyTaxes(policyID, false);
        Link.openLink(getQuickbooksOnlineSetupLink(policyID), environmentURL);
    });

    return null;
}

ConnectToQuickbooksOnlineFlow.displayName = 'ConnectToQuickbooksOnlineFlow';

export default ConnectToQuickbooksOnlineFlow;
