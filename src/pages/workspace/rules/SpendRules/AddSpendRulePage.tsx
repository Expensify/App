import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import SpendRulePageBase from './SpendRulePageBase';

type AddSpendRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_NEW>;

function AddSpendRulePage({route}: AddSpendRulePageProps) {
    return (
        <SpendRulePageBase
            policyID={route.params.policyID}
            titleKey="workspace.rules.merchantRules.addRuleTitle"
            testID="AddSpendRulePage"
        />
    );
}

AddSpendRulePage.displayName = 'AddSpendRulePage';

export default AddSpendRulePage;
