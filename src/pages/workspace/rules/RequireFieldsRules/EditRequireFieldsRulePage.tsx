import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

import RequireFieldsRulePageBase from './RequireFieldsRulePageBase';

type EditRequireFieldsRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_EDIT>;

function EditRequireFieldsRulePage({route}: EditRequireFieldsRulePageProps) {
    const {policyID, categoryName} = route.params;
    const isCategoryScopedFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_EDIT;
    const isCategoryLocked = isCategoryScopedFlow || ('isCategoryLocked' in route.params && route.params.isCategoryLocked === 'true');

    return (
        <RequireFieldsRulePageBase
            policyID={policyID}
            categoryName={categoryName}
            isCategoryLocked={isCategoryLocked}
            testID="EditRequireFieldsRulePage"
        />
    );
}

export default EditRequireFieldsRulePage;
