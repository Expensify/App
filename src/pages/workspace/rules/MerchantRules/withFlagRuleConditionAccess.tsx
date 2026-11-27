/** Gives shared condition pages the same access and draft checks as the flag editor. */
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import CategoryFlagLimitsLoadError from '@components/Rule/CategoryFlagLimitsLoadError';
import ScreenWrapper from '@components/ScreenWrapper';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useRulesPrefetch from '@hooks/useRulesPrefetch';

import {getFlagCategoryLimit, getFlagForReviewConditions, getFlagForReviewDraft, getFlagForReviewDraftKey, usesLegacyFlagLimitEditor} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FlagRuleConditionMode} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {FlagForReviewRuleForm} from '@src/types/form/FlagForReviewRuleForm';

import type {ComponentType, ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import {FlagRuleConditionValuesContext, isFlagRuleConditionMode} from './useRuleConditionDraft';

type FlagRuleConditionAccessProps = {
    policyID: string;
    ruleID?: string;
    children: ReactNode;
};

const selectFlagRuleDraftKey = (form: OnyxEntry<FlagForReviewRuleForm>) => form?.draftKey;

function FlagRuleConditionAccess({policyID, ruleID, children}: FlagRuleConditionAccessProps) {
    const policy = usePolicy(policyID);
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {canWrite} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {areRulesLoading, haveRulesLoaded} = useRulesPrefetch(canWrite && !!ruleID);
    const [rule] = useOnyx(`${ONYXKEYS.COLLECTION.RULE}${ruleID}`);
    const [categories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [draftKey] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM, {selector: selectFlagRuleDraftKey});
    const hasDraft = draftKey === getFlagForReviewDraftKey(policyID, ruleID);
    const conditions = rule?.scope === CONST.RULES.SCOPE.POLICY && rule.scopeID === policyID ? getFlagForReviewConditions(rule) : undefined;
    const needsCategories = canWrite && !!policy?.areCategoriesEnabled && !!getFlagCategoryLimit(conditions) && !categories;
    const {isLoadingPolicyCategories} = useLoadPolicyCategories(needsCategories ? policyID : undefined);
    const isBlocked = !canWrite || (!!ruleID && (!conditions || (!!rule?.pendingAction && !rule.errors))) || usesLegacyFlagLimitEditor(ruleID, categories, conditions);

    if ((canWrite && ruleID && (!conditions || !hasDraft) && areRulesLoading) || isLoadingPolicyCategories) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    const backToRoute = ruleID ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleID) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);
    if (canWrite && (needsCategories || (!!ruleID && !conditions && !haveRulesLoaded))) {
        return (
            <ScreenWrapper testID="FlagRuleConditionAccess">
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.rules.flagForReviewRule.title')}
                    onBackButtonPress={() => Navigation.goBack(backToRoute)}
                />
                <CategoryFlagLimitsLoadError missingCategoriesPolicyID={needsCategories ? policyID : undefined} />
            </ScreenWrapper>
        );
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={isBlocked}
        >
            <FlagRuleConditionValuesContext.Provider value={conditions && getFlagForReviewDraft(conditions, getCurrencyDecimals)}>{children}</FlagRuleConditionValuesContext.Provider>
        </AccessOrNotFoundWrapper>
    );
}

function withFlagRuleConditionAccess<TProps extends {route: {params: {policyID: string; ruleID?: string; flagCondition?: FlagRuleConditionMode}}}>(Page: ComponentType<TProps>) {
    function FlagRuleConditionPage(props: TProps) {
        const {policyID, ruleID, flagCondition} = props.route.params;
        if (!isFlagRuleConditionMode(flagCondition)) {
            return <Page {...props} />;
        }

        return (
            <FlagRuleConditionAccess
                policyID={policyID}
                ruleID={ruleID === ROUTES.NEW ? undefined : ruleID}
            >
                <Page {...props} />
            </FlagRuleConditionAccess>
        );
    }

    return FlagRuleConditionPage;
}

export default withFlagRuleConditionAccess;
