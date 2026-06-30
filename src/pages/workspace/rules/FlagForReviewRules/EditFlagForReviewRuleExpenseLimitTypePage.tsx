import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import FlagForReviewRuleExpenseLimitTypePageBase from './FlagForReviewRuleExpenseLimitTypePageBase';

type EditFlagForReviewRuleExpenseLimitTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EXPENSE_LIMIT_TYPE_EDIT>;

function EditFlagForReviewRuleExpenseLimitTypePage({route}: EditFlagForReviewRuleExpenseLimitTypePageProps) {
    const {policyID, categoryName} = route.params;

    return (
        <FlagForReviewRuleExpenseLimitTypePageBase
            policyID={policyID}
            categoryName={categoryName}
        />
    );
}

export default EditFlagForReviewRuleExpenseLimitTypePage;
