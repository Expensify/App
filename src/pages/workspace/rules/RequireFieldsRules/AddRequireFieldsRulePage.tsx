import useOnyx from '@hooks/useOnyx';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {categoryHasAnyRequireFieldsRule} from '@libs/RequireFieldsRulesUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';

import RequireFieldsRulePageBase from './RequireFieldsRulePageBase';

type AddRequireFieldsRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS_RULE_NEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_NEW>;

function AddRequireFieldsRulePage({route}: AddRequireFieldsRulePageProps) {
    const {policyID, categoryName} = route.params;
    const isCategoryScopedFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_REQUIRE_FIELDS_RULE_NEW;

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const scopedCategory = categoryName ? policyCategories?.[categoryName] : undefined;

    // Field requirements are one per category, so reaching Create new rule for a category that already has them
    // is really an edit. Passing categoryName seeds the form from the category instead of opening it empty, and
    // stops an unchanged save from failing validation. initialCategoryName stays set so saving still returns to
    // the category details page rather than the New rule hub we came from.
    const hasExistingRule = !!scopedCategory && categoryHasAnyRequireFieldsRule(scopedCategory);

    return (
        <RequireFieldsRulePageBase
            policyID={policyID}
            categoryName={hasExistingRule ? categoryName : undefined}
            initialCategoryName={categoryName}
            isCategoryLocked={isCategoryScopedFlow ? true : undefined}
            testID="AddRequireFieldsRulePage"
        />
    );
}

export default AddRequireFieldsRulePage;
