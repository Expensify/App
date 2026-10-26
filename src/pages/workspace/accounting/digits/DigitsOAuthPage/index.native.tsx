import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';

import {getDigitsSetupLink} from '@libs/actions/connections/Digits';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccountingSetupWebViewPage from '@pages/workspace/accounting/AccountingSetupWebViewPage';
import {getAccountingConnectionsRoute} from '@pages/workspace/connections/utils';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type DigitsOAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DIGITS_OAUTH>;

function DigitsOAuthPage({route}: DigitsOAuthPageProps) {
    const policyID = route.params.policyID;
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();

    return (
        <AccountingSetupWebViewPage
            uri={getDigitsSetupLink(policyID)}
            testID="DigitsOAuthPage"
            shouldAppendShortLivedAuthToken
            backTo={getAccountingConnectionsRoute(isUnifiedConnectionsBetaEnabled, policyID)}
        />
    );
}

export default DigitsOAuthPage;
