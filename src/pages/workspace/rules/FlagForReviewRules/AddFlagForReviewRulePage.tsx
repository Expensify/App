import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

import FlagForReviewRulePageBase from './FlagForReviewRulePageBase';

type AddFlagForReviewRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_NEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_NEW>;

function AddFlagForReviewRulePage({route}: AddFlagForReviewRulePageProps) {
    const {policyID, categoryName} = route.params;
    const isCategoryScopedFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_NEW;

    return (
        <FlagForReviewRulePageBase
            policyID={policyID}
            initialCategoryName={categoryName}
            isCategoryLocked={isCategoryScopedFlow ? true : undefined}
            isCategoryScopedFlow={isCategoryScopedFlow}
            testID="AddFlagForReviewRulePage"
        />
    );
}

export default AddFlagForReviewRulePage;
