import useOnyx from '@hooks/useOnyx';

import {hasExplicitFlagAmount} from '@libs/FlagForReviewRulesUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';

import FlagForReviewRulePageBase from './FlagForReviewRulePageBase';

type AddFlagForReviewRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_NEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_NEW>;

function AddFlagForReviewRulePage({route}: AddFlagForReviewRulePageProps) {
    const {policyID, categoryName} = route.params;
    const isCategoryScopedFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_NEW;

    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const scopedCategory = categoryName ? policyCategories?.[categoryName] : undefined;

    // Flag for review is one per category, so reaching Create new rule for a category that already has one is
    // really an edit. Passing categoryName seeds the amount from the category instead of opening it empty, which
    // would otherwise overwrite the existing rule on save. initialCategoryName stays set so saving still returns
    // to the category details page rather than the New rule hub we came from.
    const hasExistingRule = !!scopedCategory && hasExplicitFlagAmount(scopedCategory.maxExpenseAmount);

    return (
        <FlagForReviewRulePageBase
            policyID={policyID}
            categoryName={hasExistingRule ? categoryName : undefined}
            initialCategoryName={categoryName}
            isCategoryLocked={isCategoryScopedFlow ? true : undefined}
            isCategoryScopedFlow={isCategoryScopedFlow}
            testID="AddFlagForReviewRulePage"
        />
    );
}

export default AddFlagForReviewRulePage;
