import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';

import {enablePolicyTaxes} from '@userActions/Policy/Policy';

import type SCREENS from '@src/SCREENS';

import {useEffect} from 'react';

type QuickbooksOnlineSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_SETUP>;

function QuickbooksOnlineSetupPage({route}: QuickbooksOnlineSetupPageProps) {
    const policyID = route.params.policyID;

    useEffect(() => {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        enablePolicyTaxes(policyID, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AccountingSetupWebViewPage
            uri={getQuickbooksOnlineSetupLink(policyID)}
            testID="QuickbooksOnlineSetupPage"
            context="QuickbooksOnlineSetupPage"
            shouldAppendShortLivedAuthToken
        />
    );
}

export default QuickbooksOnlineSetupPage;
