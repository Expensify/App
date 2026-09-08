import ActivityIndicator from '@components/ActivityIndicator';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftFlagForReviewRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {hasExplicitFlagAmount} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';

import React from 'react';
import {View} from 'react-native';

type FlagForReviewRuleCategoryPageBaseProps = {
    policyID: string;
    categoryName?: string;
};

function FlagForReviewRuleCategoryPageBase({policyID, categoryName}: FlagForReviewRuleCategoryPageBaseProps) {
    const isEditing = !!categoryName;
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const styles = useThemeStyles();

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);

    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategoryItem = selectedCategoryName ? {name: getDecodedCategoryName(selectedCategoryName), value: selectedCategoryName} : undefined;

    const {
        categories,
        areCategoriesEnabled,
        isLoading: arePolicyCategoriesLoading,
    } = usePolicyCategoryPickerCategories({
        policyID,
        // Keep the currently selected / route category available, but don't offer other
        // categories that already have a flag-for-review rule (avoids silent overwrite).
        isEligible: (category) => category.name === categoryName || category.name === selectedCategoryName || !hasExplicitFlagAmount(category.maxExpenseAmount),
    });

    const categoryItems = categories.map((category) => ({name: getDecodedCategoryName(category.name), value: category.name}));

    const backToRoute = isEditing ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, categoryName) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        // Preserve the current draft amount / limit type. Merging from the destination category
        // would discard in-progress edits and can overwrite an existing rule on save.
        updateDraftFlagForReviewRule({
            ...form,
            [INPUT_IDS.CATEGORY]: value,
        });
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
                shouldSkipFocusRestoreOnSave
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
                testID="FlagForReviewRuleCategoryPage"
                onBack={() => Navigation.goBack(backToRoute)}
            >
                {content}
            </RuleSelectionBase>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleCategoryPageBase;
