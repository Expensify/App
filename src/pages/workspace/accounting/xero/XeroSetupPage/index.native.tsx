import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type XeroSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.XERO_SETUP>;

function XeroSetupPage({route}: XeroSetupPageProps) {
    const policyID = route.params.policyID;

    return (
        <AccountingSetupWebViewPage
            uri={getXeroSetupLink(policyID)}
            testID="XeroSetupPage"
            context="XeroSetupPage"
        />
    );
}

export default XeroSetupPage;
