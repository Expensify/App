import usePermissions from '@hooks/usePermissions';

import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';

import {enablePolicyTaxes} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import {useEffect} from 'react';

type QuickbooksOnlineSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_SETUP>;

function QuickbooksOnlineSetupPage({route}: QuickbooksOnlineSetupPageProps) {
    const policyID = route.params.policyID;
    const isIntuitEnterpriseSuite = route.params.isIntuitEnterpriseSuite === 'true';
    const isSandbox = route.params.isSandbox === 'true';
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);

    useEffect(() => {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        enablePolicyTaxes(policyID, false, isVendorMatchingBetaEnabled);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AccountingSetupWebViewPage
            uri={getQuickbooksOnlineSetupLink(policyID, isIntuitEnterpriseSuite, isSandbox)}
            testID="QuickbooksOnlineSetupPage"
            shouldAppendShortLivedAuthToken
        />
    );
}

export default QuickbooksOnlineSetupPage;
