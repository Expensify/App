import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

import FlagForReviewRulePageBase from './FlagForReviewRulePageBase';

type EditFlagForReviewRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_EDIT>;

function EditFlagForReviewRulePage({route}: EditFlagForReviewRulePageProps) {
    const {policyID, categoryName} = route.params;
    const isCategoryScopedFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_EDIT;
    const isCategoryLocked = isCategoryScopedFlow || ('isCategoryLocked' in route.params && route.params.isCategoryLocked === 'true');

    return (
        <FlagForReviewRulePageBase
            policyID={policyID}
            categoryName={categoryName}
            isCategoryLocked={isCategoryLocked}
            isCategoryScopedFlow={isCategoryScopedFlow}
            testID="EditFlagForReviewRulePage"
        />
    );
}

export default EditFlagForReviewRulePage;
