import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';

import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';
import {getAccountingConnectionsRoute} from '@pages/workspace/connections/utils';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type ZohoBooksOAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_OAUTH>;

function ZohoBooksOAuthPage({route}: ZohoBooksOAuthPageProps) {
    const policyID = route.params.policyID;
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();

    return (
        <AccountingSetupWebViewPage
            uri={getZohoBooksSetupLink(policyID)}
            testID="ZohoBooksOAuthPage"
            shouldAppendShortLivedAuthToken
            backTo={getAccountingConnectionsRoute(isUnifiedConnectionsBetaEnabled, policyID)}
        />
    );
}

export default ZohoBooksOAuthPage;
