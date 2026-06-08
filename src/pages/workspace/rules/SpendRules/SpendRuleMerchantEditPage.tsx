import React from 'react';
import SpendRuleMerchantEditBase from '@components/SpendRules/configuration/SpendRuleMerchantEditBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftSpendRule} from '@libs/actions/User';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type SpendRuleMerchantEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MERCHANT_EDIT>;

function SpendRuleMerchantEditPage({route}: SpendRuleMerchantEditPageProps) {
    const {policyID, merchantIndex} = route.params;
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const merchantNames = spendRuleForm?.merchantNames ?? [];
    const merchantMatchTypes = spendRuleForm?.merchantMatchTypes ?? [];

    return (
        <SpendRuleMerchantEditBase
            policyID={policyID}
            merchantIndex={merchantIndex}
            merchantMatchTypes={merchantMatchTypes}
            merchantNames={merchantNames}
            onMerchantDataChange={(updatedMerchantNames, updatedMerchantMatchTypes) => {
                updateDraftSpendRule({merchantNames: updatedMerchantNames, merchantMatchTypes: updatedMerchantMatchTypes});
            }}
        />
    );
}

SpendRuleMerchantEditPage.displayName = 'SpendRuleMerchantEditPage';

export default SpendRuleMerchantEditPage;
