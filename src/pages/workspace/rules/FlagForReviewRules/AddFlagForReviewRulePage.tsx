import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import FlagForReviewRulePageBase from './FlagForReviewRulePageBase';

type AddFlagForReviewRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_NEW>;

function AddFlagForReviewRulePage({route}: AddFlagForReviewRulePageProps) {
    const {policyID} = route.params;

    return (
        <FlagForReviewRulePageBase
            policyID={policyID}
            testID="AddFlagForReviewRulePage"
        />
    );
}

export default AddFlagForReviewRulePage;
