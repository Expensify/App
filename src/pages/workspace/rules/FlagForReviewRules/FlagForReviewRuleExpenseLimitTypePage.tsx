import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import FlagForReviewRuleExpenseLimitTypePageBase from './FlagForReviewRuleExpenseLimitTypePageBase';

type FlagForReviewRuleExpenseLimitTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EXPENSE_LIMIT_TYPE>;

function FlagForReviewRuleExpenseLimitTypePage({route}: FlagForReviewRuleExpenseLimitTypePageProps) {
    return <FlagForReviewRuleExpenseLimitTypePageBase policyID={route.params.policyID} />;
}

export default FlagForReviewRuleExpenseLimitTypePage;
