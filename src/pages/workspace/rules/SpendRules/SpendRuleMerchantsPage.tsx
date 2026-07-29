import SpendRuleMerchantsBase from '@components/SpendRules/configuration/SpendRuleMerchantsBase';

import useOnyx from '@hooks/useOnyx';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type SpendRuleMerchantsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MERCHANTS>;

function SpendRuleMerchantsPage({route}: SpendRuleMerchantsPageProps) {
    const {policyID, ruleID} = route.params;
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const merchantNames = spendRuleForm?.merchantNames ?? [];
    const merchantMatchTypes = spendRuleForm?.merchantMatchTypes ?? [];
    const restrictionAction = spendRuleForm?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const merchants = merchantNames.map((name, index) => ({name, matchType: merchantMatchTypes.at(index)}));

    return (
        <SpendRuleMerchantsBase
            policyID={policyID}
            action={restrictionAction}
            merchants={merchants}
            getEditMerchantRoute={(merchantIndex) => ROUTES.RULES_SPEND_MERCHANT_EDIT.getRoute(policyID, ruleID, merchantIndex)}
        />
    );
}

SpendRuleMerchantsPage.displayName = 'SpendRuleMerchantsPage';

export default SpendRuleMerchantsPage;
