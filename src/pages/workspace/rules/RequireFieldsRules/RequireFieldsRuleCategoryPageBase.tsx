import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import {setDraftRequireFieldsRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {categoryHasAnyRequireFieldsRule, getRequireFieldsRuleBackToRoute} from '@libs/RequireFieldsRulesUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RequireFieldsRuleForm, RequireFieldsRuleSettingFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';

import React from 'react';

type RequireFieldsRuleCategoryPageBaseProps = {
    policyID: string;
    categoryName?: string;
};

const SETTING_FIELD_KEYS = [
    INPUT_IDS.DESCRIPTION_SETTING,
    INPUT_IDS.ATTENDEES_SETTING,
    INPUT_IDS.RECEIPT_SETTING,
    INPUT_IDS.ITEMIZED_RECEIPT_SETTING,
] as const satisfies readonly RequireFieldsRuleSettingFieldKey[];

function RequireFieldsRuleCategoryPageBase({policyID, categoryName}: RequireFieldsRuleCategoryPageBaseProps) {
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

    const categoryItems = Object.values(policyCategories ?? {})
        .filter((category) => {
            if (!category.enabled || category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return false;
            }

            // Create flow: only offer categories that do not already have field requirements.
            if (!isEditing && categoryHasAnyRequireFieldsRule(category)) {
                return false;
            }

            return true;
        })
        .map((category) => {
            const decodedCategoryName = getDecodedCategoryName(category.name);
            return {name: decodedCategoryName, value: category.name};
        });

    const backToRoute = () =>
        getRequireFieldsRuleBackToRoute({
            policyID,
            isEditing,
            categoryName,
        });

    const onSave = (value?: string) => {
        const preservedSettings: Partial<RequireFieldsRuleForm> = {
            [INPUT_IDS.CATEGORY]: value,
        };

        for (const fieldKey of SETTING_FIELD_KEYS) {
            const formValue = form?.[fieldKey];

            // Keep only what's still in the draft. Cleared fields are removed from the form on
            // edit, so restoring previous-category overrides here would resurrect them.
            if (formValue !== undefined) {
                preservedSettings[fieldKey] = formValue;
            }
        }

        setDraftRequireFieldsRule(preservedSettings);
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
