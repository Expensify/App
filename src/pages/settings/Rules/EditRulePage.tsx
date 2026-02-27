import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import RulePageBase from './RulePageBase';

type EditRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.RULES.EDIT>;

function EditRulePage({route}: EditRulePageProps) {
    return (
        <RulePageBase
            testID="EditRulePage"
            titleKey="expenseRulesPage.editRule.title"
            hash={route.params.hash}
        />
    );
}

export default EditRulePage;
