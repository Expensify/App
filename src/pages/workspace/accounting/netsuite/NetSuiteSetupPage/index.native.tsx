import {getNetSuiteSetupLink} from '@libs/actions/connections/NetSuiteCommands';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type NetSuiteSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SETUP>;

function NetSuiteSetupPage({route}: NetSuiteSetupPageProps) {
    const policyID = route.params.policyID;
    const accountID = route.params.accountID;

    if (!accountID) {
        return null;
    }

    return (
        <AccountingSetupWebViewPage
            uri={getNetSuiteSetupLink(policyID, accountID)}
            testID="NetSuiteSetupPage"
            context="NetSuiteSetupPage"
            shouldAppendShortLivedAuthToken
        />
    );
}

export default NetSuiteSetupPage;
