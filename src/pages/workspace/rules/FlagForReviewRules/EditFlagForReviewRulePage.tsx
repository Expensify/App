import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import FlagForReviewRulePageBase from './FlagForReviewRulePageBase';

type EditFlagForReviewRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EDIT>;

function EditFlagForReviewRulePage({route}: EditFlagForReviewRulePageProps) {
    const {policyID, categoryName} = route.params;

    return (
        <FlagForReviewRulePageBase
            policyID={policyID}
            categoryName={categoryName}
            testID="EditFlagForReviewRulePage"
        />
    );
}

export default EditFlagForReviewRulePage;
