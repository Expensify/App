import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import {updateDraftFlagForReviewRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getEffectiveFlagForReviewRuleForm} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';

import React from 'react';

type FlagForReviewRuleCategoryPageBaseProps = {
    policyID: string;
    categoryName?: string;
};

function FlagForReviewRuleCategoryPageBase({policyID, categoryName}: FlagForReviewRuleCategoryPageBaseProps) {
    const isEditing = !!categoryName;
    const policy = usePolicy(policyID);
    const {getCurrencyDecimals} = useCurrencyListActions();
    const policyCurrency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategoryItem = selectedCategoryName ? {name: getDecodedCategoryName(selectedCategoryName), value: selectedCategoryName} : undefined;

    const categoryItems = Object.values(policyCategories ?? {})
        .filter((category) => category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .map((category) => {
            const decodedCategoryName = getDecodedCategoryName(category.name);
            return {name: decodedCategoryName, value: category.name};
        });

    const backToRoute = isEditing ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, categoryName) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        const selectedCategory = value ? policyCategories?.[value] : undefined;
        const draftForm = {
            ...form,
            [INPUT_IDS.CATEGORY]: value,
        };

        updateDraftFlagForReviewRule(selectedCategory ? getEffectiveFlagForReviewRuleForm(selectedCategory, draftForm, getCurrencyDecimals, policyCurrency) : draftForm);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled || !canWriteRules}
        >
            <RuleSelectionBase
                titleKey="common.category"
                testID="FlagForReviewRuleCategoryPage"
                selectedItem={selectedCategoryItem}
                items={categoryItems}
                onSave={onSave}
                onBack={() => Navigation.goBack(backToRoute)}
                backToRoute={backToRoute}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleCategoryPageBase;
