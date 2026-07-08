import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import {updateDraftRequireFieldsRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {categoryHasRequireFieldsRuleForDirection, getEffectiveRequireFieldsRuleForm, getRequireFieldsRuleBackToRoute} from '@libs/RequireFieldsRulesUtils';
import type {FieldRequirementsDirection} from '@libs/RequireFieldsRulesUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';

import React from 'react';

type RequireFieldsRuleCategoryPageBaseProps = {
    policyID: string;
    categoryName?: string;
    direction?: FieldRequirementsDirection;
};

function RequireFieldsRuleCategoryPageBase({policyID, categoryName, direction}: RequireFieldsRuleCategoryPageBaseProps) {
    const isEditing = !!categoryName;
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);

    const [form] = useOnyx(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategoryItem = selectedCategoryName
        ? {
              name: getDecodedCategoryName(selectedCategoryName),
              value: selectedCategoryName,
          }
        : undefined;
    const formDirection = form?.[INPUT_IDS.DIRECTION] ?? CONST.FIELD_REQUIREMENTS_DIRECTION.REQUIRE;
    const activeDirection = direction ?? formDirection;

    const categoryItems = Object.values(policyCategories ?? {})
        .filter((category) => category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
        .map((category) => {
            const decodedCategoryName = getDecodedCategoryName(category.name);
            return {name: decodedCategoryName, value: category.name};
        });

    const backToRoute = (selectedValue?: string) =>
        getRequireFieldsRuleBackToRoute({
            policyID,
            isEditing,
            categoryName,
            direction: activeDirection,
            selectedCategoryName: selectedValue ?? selectedCategoryName,
        });

    const onSave = (value?: string) => {
        const selectedCategory = value ? policyCategories?.[value] : undefined;
        const draftForm = {
            ...form,
            [INPUT_IDS.CATEGORY]: value,
        };
        const effectiveDraftForm = selectedCategory ? getEffectiveRequireFieldsRuleForm(selectedCategory, draftForm) : draftForm;

        if (!isEditing && value && selectedCategory && categoryHasRequireFieldsRuleForDirection(selectedCategory, formDirection)) {
            updateDraftRequireFieldsRule({
                ...effectiveDraftForm,
                [INPUT_IDS.CATEGORY]: value,
                [INPUT_IDS.DIRECTION]: formDirection,
            });
            Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_EDIT.getRoute(policyID, value, formDirection));
            return;
        }

        updateDraftRequireFieldsRule(effectiveDraftForm);
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
                testID="RequireFieldsRuleCategoryPage"
                selectedItem={selectedCategoryItem}
                items={categoryItems}
                onSave={onSave}
                onBack={() => Navigation.goBack(backToRoute())}
                backToRoute={backToRoute}
                allowNoneOption={false}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default RequireFieldsRuleCategoryPageBase;
