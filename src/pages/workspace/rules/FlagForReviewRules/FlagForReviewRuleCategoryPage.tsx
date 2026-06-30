import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import FlagForReviewRuleCategoryPageBase from './FlagForReviewRuleCategoryPageBase';

type FlagForReviewRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_CATEGORY>;

function FlagForReviewRuleCategoryPage({route}: FlagForReviewRuleCategoryPageProps) {
    return <FlagForReviewRuleCategoryPageBase policyID={route.params.policyID} />;
}

export default FlagForReviewRuleCategoryPage;
