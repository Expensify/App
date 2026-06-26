import SpendRuleCategoryBase from '@components/SpendRules/configuration/SpendRuleCategoryBase';

import useCanWriteCardSpendRules from '@hooks/useCanWriteCardSpendRules';
import useOnyx from '@hooks/useOnyx';

import {updateDraftSpendRule} from '@libs/actions/User';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SpendRuleCategory} from '@src/types/form/SpendRuleForm';

import React from 'react';

type SpendRuleCategoryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_CATEGORY>;

function SpendRuleCategoryPage({route}: SpendRuleCategoryPageProps) {
    const {policyID} = route.params;
    const canWriteCardSpendRules = useCanWriteCardSpendRules(policyID);
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const onCategoriesChange = (categories: SpendRuleCategory[]) => {
        updateDraftSpendRule({categories});
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={!canWriteCardSpendRules}
        >
            <SpendRuleCategoryBase
                categories={spendRuleForm?.categories ?? []}
                onCategoriesChange={onCategoriesChange}
            />
        </AccessOrNotFoundWrapper>
    );
}

SpendRuleCategoryPage.displayName = 'SpendRuleCategoryPage';

export default SpendRuleCategoryPage;
