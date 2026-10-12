import {getZohoBooksSetupLink} from '@libs/actions/connections/ZohoBooks';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type ZohoBooksOAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.ZOHO_BOOKS_OAUTH>;

function ZohoBooksOAuthPage({route}: ZohoBooksOAuthPageProps) {
    const policyID = route.params.policyID;

    return (
        <AccountingSetupWebViewPage
            uri={getZohoBooksSetupLink(policyID)}
            testID="ZohoBooksOAuthPage"
            shouldAppendShortLivedAuthToken
            backTo={ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}
        />
    );
}

export default ZohoBooksOAuthPage;
