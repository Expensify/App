import React from 'react';
import SpendRuleCategoryBase from '@components/SpendRules/configuration/SpendRuleCategoryBase';
import useOnyx from '@hooks/useOnyx';
import {setIssueNewCardData} from '@libs/actions/Card';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {SpendRuleCategory} from '@src/types/form/SpendRuleForm';

type SpendRuleCategoryEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SPEND_RULE_CATEGORY>;

export default function SpendRuleCategoryEditPage({route}: SpendRuleCategoryEditPageProps) {
    const policyID = route.params.policyID;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const categories = issueNewCardForm?.data.spendRuleValue?.categories ?? [];

    const handleCategoriesChange = (newCategories: SpendRuleCategory[]) => {
        setIssueNewCardData(policyID, {spendRuleValue: {categories: newCategories}});
    };

    return (
        <SpendRuleCategoryBase
            categories={categories}
            onCategoriesChange={handleCategoriesChange}
        />
    );
}
