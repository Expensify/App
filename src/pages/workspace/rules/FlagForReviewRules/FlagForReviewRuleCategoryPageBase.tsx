import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import RuleCategoriesDisabledEmptyState from '@components/Rule/RuleCategoriesDisabledEmptyState';
import RuleSelectionBase from '@components/Rule/RuleSelectionBase';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {updateDraftFlagForReviewRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {hasExplicitFlagAmount} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/FlagForReviewRuleForm';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';

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
    const {isOffline} = useNetwork();

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const areCategoriesEnabled = !!policy?.areCategoriesEnabled;
    const arePolicyCategoriesLoading = areCategoriesEnabled && policyCategories === undefined;

    const selectedCategoryName = form?.[INPUT_IDS.CATEGORY];
    const selectedCategoryItem = selectedCategoryName ? {name: getDecodedCategoryName(selectedCategoryName), value: selectedCategoryName} : undefined;

    const categoryItems = Object.values(policyCategories ?? {})
        .filter((category) => {
            if (!category.enabled) {
                return false;
            }

            // Match the rules table: keep pending-delete categories visible while offline.
            if (!isOffline && category.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return false;
            }

            // Keep the currently selected / route category available, but don't offer other
            // categories that already have a flag-for-review rule (avoids silent overwrite).
            if (category.name === categoryName || category.name === selectedCategoryName) {
                return true;
            }

            return !hasExplicitFlagAmount(category.maxExpenseAmount);
        })
        .map((category) => {
            const decodedCategoryName = getDecodedCategoryName(category.name);
            return {name: decodedCategoryName, value: category.name};
        });

    const fetchPolicyCategories = useCallback(() => {
        if (!areCategoriesEnabled || policyCategories !== undefined) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    }, [areCategoriesEnabled, policyCategories, policyID]);

    useNetwork({onReconnect: fetchPolicyCategories});

    useFocusEffect(
        useCallback(() => {
            fetchPolicyCategories();
        }, [fetchPolicyCategories]),
    );

    const backToRoute = isEditing ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, categoryName) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        // Preserve the current draft amount / limit type. Merging from the destination category
        // would discard in-progress edits and can overwrite an existing rule on save.
        updateDraftFlagForReviewRule({
            ...form,
            [INPUT_IDS.CATEGORY]: value,
        });
    };

    let emptyState: React.ReactNode;
    if (!areCategoriesEnabled) {
        emptyState = <RuleCategoriesDisabledEmptyState policyID={policyID} />;
    } else if (arePolicyCategoriesLoading) {
        emptyState = <FullScreenLoadingIndicator />;
    }

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
                allowNoneOption={false}
                shouldSkipFocusRestoreOnSave
                emptyState={emptyState}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleCategoryPageBase;
