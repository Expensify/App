import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import FlagForReviewRuleCategoryPageBase from './FlagForReviewRuleCategoryPageBase';

type EditFlagForReviewRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_CATEGORY_EDIT>;

function EditFlagForReviewRuleCategoryPage({route}: EditFlagForReviewRuleCategoryPageProps) {
    const {policyID, categoryName} = route.params;

    return (
        <FlagForReviewRuleCategoryPageBase
            policyID={policyID}
            categoryName={categoryName}
        />
    );
}

export default EditFlagForReviewRuleCategoryPage;
