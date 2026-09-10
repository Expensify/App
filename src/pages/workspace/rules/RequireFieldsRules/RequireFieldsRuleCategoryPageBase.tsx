import ActivityIndicator from '@components/ActivityIndicator';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftRequireFieldsRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {categoryHasAnyRequireFieldsRule, getEffectiveRequireFieldsRuleForm, getRequireFieldsDisplayedSetting, getRequireFieldsRuleBackToRoute} from '@libs/RequireFieldsRulesUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {RequireFieldsRuleForm, RequireFieldsRuleSettingFieldKey} from '@src/types/form/RequireFieldsRuleForm';
import INPUT_IDS from '@src/types/form/RequireFieldsRuleForm';

import React from 'react';
import {View} from 'react-native';

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
    const styles = useThemeStyles();

    const [form] = useOnyx(ONYXKEYS.FORMS.REQUIRE_FIELDS_RULE_FORM);

    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];

    const {
        categories,
        policyCategories,
        areCategoriesEnabled,
        isLoading: arePolicyCategoriesLoading,
    } = usePolicyCategoryPickerCategories({
        policyID,
        // Keep the currently selected / route category available, but don't offer other
        // categories that already have field requirements (avoids silent overwrite).
        isEligible: (category) => category.name === categoryName || category.name === selectedCategoryName || !categoryHasAnyRequireFieldsRule(category),
    });

    const selectedCategory = selectedCategoryName ? policyCategories?.[selectedCategoryName] : undefined;
    const selectedCategoryItem = selectedCategoryName
        ? {
              name: getDecodedCategoryName(selectedCategoryName),
              value: selectedCategoryName,
          }
        : undefined;

    const categoryItems = categories.map((category) => ({name: getDecodedCategoryName(category.name), value: category.name}));

    const backToRoute = () =>
        getRequireFieldsRuleBackToRoute({
            policyID,
            isEditing,
            categoryName: isEditing ? categoryName : undefined,
        });

    const onSave = (value?: string) => {
        const preservedSettings: Partial<RequireFieldsRuleForm> = {
            [INPUT_IDS.CATEGORY]: value,
        };
        const effectiveForm = form && selectedCategory ? getEffectiveRequireFieldsRuleForm(selectedCategory, form) : form;

        for (const fieldKey of SETTING_FIELD_KEYS) {
            if (isEditing) {
                // Carry over whatever the row currently shows. Description and Attendees are boolean-backed,
                // so they always resolve to a direction (Don't require when there is no override) and are
                // always carried; the receipt fields keep their blank "no override" state and are skipped.
                const displayedSetting = getRequireFieldsDisplayedSetting({
                    fieldKey,
                    category: selectedCategory,
                    effectiveForm,
                    rawForm: form,
                    originalCategoryName: categoryName,
                    isEditing: true,
                });

                if (displayedSetting !== undefined) {
                    preservedSettings[fieldKey] = displayedSetting;
                }
                continue;
            }

            // Create drafts only contain fields the user has set.
            const formValue = form?.[fieldKey];
            if (formValue !== undefined) {
                preservedSettings[fieldKey] = formValue;
            }
        }

        setDraftRequireFieldsRule(preservedSettings);
    };

    let content: React.ReactNode;
    if (!areCategoriesEnabled) {
        content = <RuleCategoriesDisabledEmptyState policyID={policyID} />;
    } else if (arePolicyCategoriesLoading) {
        content = (
            <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        );
    } else {
        content = (
            <RuleSelectionBase.Picker
                selectedItem={selectedCategoryItem}
                items={categoryItems}
                onSave={onSave}
                backToRoute={backToRoute}
                allowNoneOption={false}
            />
        );
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled || !canWriteRules}
        >
            <RuleSelectionBase
                titleKey="common.category"
                testID="RequireFieldsRuleCategoryPage"
                onBack={() => Navigation.goBack(backToRoute())}
            >
                {content}
            </RuleSelectionBase>
        </AccessOrNotFoundWrapper>
    );
}

export default RequireFieldsRuleCategoryPageBase;
