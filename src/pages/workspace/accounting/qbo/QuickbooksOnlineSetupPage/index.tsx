import {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {openLink} from '@userActions/Link';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';
import type SCREENS from '@src/SCREENS';

type QuickbooksOnlineSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_SETUP>;

function QuickbooksOnlineSetupPage({route}: QuickbooksOnlineSetupPageProps) {
    const {environmentURL} = useEnvironment();
    const policyID = route.params.policyID;

    // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
    useEffect(() => {
        enablePolicyTaxes(policyID, false);
        openLink(getQuickbooksOnlineSetupLink(policyID), environmentURL);
    }, [policyID, environmentURL]);

    return null;
}

export default QuickbooksOnlineSetupPage;
