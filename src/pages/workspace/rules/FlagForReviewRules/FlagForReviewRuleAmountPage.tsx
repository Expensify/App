import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

import FlagForReviewRuleAmountPageBase from './FlagForReviewRuleAmountPageBase';

type FlagForReviewRuleAmountPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_AMOUNT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_AMOUNT>;

function FlagForReviewRuleAmountPage({route}: FlagForReviewRuleAmountPageProps) {
    const isCategoryScopedFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_FLAG_FOR_REVIEW_RULE_AMOUNT;

    return (
        <FlagForReviewRuleAmountPageBase
            policyID={route.params.policyID}
            isCategoryLocked={isCategoryScopedFlow || ('isCategoryLocked' in route.params && route.params.isCategoryLocked === 'true')}
            isCategoryScopedFlow={isCategoryScopedFlow}
        />
    );
}

export default FlagForReviewRuleAmountPage;
