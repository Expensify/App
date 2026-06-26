import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import FlagForReviewRuleAmountPageBase from './FlagForReviewRuleAmountPageBase';

type EditFlagForReviewRuleAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_AMOUNT_EDIT>;

function EditFlagForReviewRuleAmountPage({route}: EditFlagForReviewRuleAmountPageProps) {
    const {policyID, categoryName} = route.params;

    return (
        <FlagForReviewRuleAmountPageBase
            policyID={policyID}
            categoryName={categoryName}
        />
    );
}

export default EditFlagForReviewRuleAmountPage;
