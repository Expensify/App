import ActivityIndicator from '@components/ActivityIndicator';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useCategoryFlagLimits from '@hooks/useCategoryFlagLimits';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyCategoryPickerCategories from '@hooks/usePolicyCategoryPickerCategories';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftFlagForReviewRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {canMatchFlagRuleCategory, getCategoryFlagLimit, getFlagForReviewConditions, getFlagForReviewDraftKey} from '@libs/FlagForReviewRulesUtils';
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
    ruleID?: string;
};

function FlagForReviewRuleCategoryPageBase({policyID, ruleID}: FlagForReviewRuleCategoryPageBaseProps) {
    const policy = usePolicy(policyID);
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const styles = useThemeStyles();

    const [storedDraft] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const {categoryFlagLimits, areCategoryFlagLimitsLoading} = useCategoryFlagLimits(policyID);
    const [rule] = useOnyx(`${ONYXKEYS.COLLECTION.RULE}${ruleID}`);
    const conditions = rule?.scope === CONST.RULES.SCOPE.POLICY && rule.scopeID === policyID ? getFlagForReviewConditions(rule) : undefined;
    const draftKey = getFlagForReviewDraftKey(policyID, ruleID);
    const form = storedDraft?.draftKey === draftKey ? storedDraft : undefined;

    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY] ?? conditions?.categoryName;
    const hasMerchant = !!(form?.merchantToMatch ?? conditions?.merchant?.name)?.trim();
    const selectedCategoryItem = selectedCategoryName ? {name: getDecodedCategoryName(selectedCategoryName), value: selectedCategoryName} : undefined;

    const {
        categories,
        areCategoriesEnabled,
        isLoading: arePolicyCategoriesLoading,
    } = usePolicyCategoryPickerCategories({
        policyID,
        isEligible: (category) => {
            if (!canMatchFlagRuleCategory(category)) {
                return false;
            }
            const limit = getCategoryFlagLimit(category, categoryFlagLimits);
            return hasMerchant || !limit || limit.ruleID === ruleID || category.name === selectedCategoryName;
        },
    });

    const categoryItems = categories.map((category) => ({name: getDecodedCategoryName(category.name), value: category.name}));

    const backToRoute = ruleID ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        setDraftFlagForReviewRule({
            ...form,
            [INPUT_IDS.CATEGORY]: value ?? '',
            [INPUT_IDS.DRAFT_KEY]: draftKey,
        });
    };

    let content: React.ReactNode;
    if (!areCategoriesEnabled) {
        content = <RuleCategoriesDisabledEmptyState policyID={policyID} />;
    } else if (arePolicyCategoriesLoading || areCategoryFlagLimitsLoading) {
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
                allowNoneOption={hasMerchant}
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
            shouldBeBlocked={!canWriteRules || (!!ruleID && !areCategoryFlagLimitsLoading && !conditions)}
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
