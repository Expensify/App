import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

import RequireFieldsRulePageBase from './RequireFieldsRulePageBase';

type AddRequireFieldsRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_NEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_NEW>;

function AddRequireFieldsRulePage({route}: AddRequireFieldsRulePageProps) {
    const {policyID, categoryName} = route.params;
    const isCategoryScopedFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_NEW;

    return (
        <RequireFieldsRulePageBase
            policyID={policyID}
            initialCategoryName={categoryName}
            isCategoryLocked={isCategoryScopedFlow ? true : undefined}
            testID="AddRequireFieldsRulePage"
        />
    );
}

export default AddRequireFieldsRulePage;
