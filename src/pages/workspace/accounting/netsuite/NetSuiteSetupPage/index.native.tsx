import usePermissions from '@hooks/usePermissions';

import {getNetSuiteSetupLink} from '@libs/actions/connections/NetSuiteCommands';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';
import {getAccountingConnectionsRoute} from '@pages/workspace/connections/utils';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type NetSuiteSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SETUP>;

function NetSuiteSetupPage({route}: NetSuiteSetupPageProps) {
    const policyID = route.params.policyID;
    const accountID = route.params.accountID;
    const {isBetaEnabled} = usePermissions();

    if (!accountID) {
        return null;
    }

    return (
        <AccountingSetupWebViewPage
            uri={getNetSuiteSetupLink(policyID, accountID)}
            testID="NetSuiteSetupPage"
            shouldAppendShortLivedAuthToken
            backTo={getAccountingConnectionsRoute(isBetaEnabled(CONST.BETAS.UNIFIED_CONNECTIONS), policyID)}
        />
    );
}

export default NetSuiteSetupPage;
