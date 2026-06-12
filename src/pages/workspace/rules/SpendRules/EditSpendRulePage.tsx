import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import SpendRulePageBase from './SpendRulePageBase';

type EditSpendRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_EDIT>;

function EditSpendRulePage({route}: EditSpendRulePageProps) {
    return (
        <SpendRulePageBase
            policyID={route.params.policyID}
            ruleID={route.params.ruleID}
            titleKey="workspace.rules.spendRules.editRuleTitle"
            testID="EditSpendRulePage"
        />
    );
}

EditSpendRulePage.displayName = 'EditSpendRulePage';

export default EditSpendRulePage;
