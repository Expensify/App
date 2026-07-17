import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import FlagForReviewRuleAmountPageBase from './FlagForReviewRuleAmountPageBase';

type FlagForReviewRuleAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_AMOUNT>;

function FlagForReviewRuleAmountPage({route}: FlagForReviewRuleAmountPageProps) {
    return <FlagForReviewRuleAmountPageBase policyID={route.params.policyID} />;
}

export default FlagForReviewRuleAmountPage;
