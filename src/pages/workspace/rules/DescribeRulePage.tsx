/**
 * Page where an admin describes a new rule in plain English. Concierge builds a standard rule when it can, and the page
 * drafts an agent rule when it can't.
 */
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {setDraftFlagForReviewRule, setDraftMerchantRule, setDraftRequireFieldsRule, setDraftSpendRule} from '@libs/actions/User';
import {getMerchantRuleDraftFromGeneratedValues} from '@libs/ExpenseDefaultRuleUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSpendRuleDraftFromGeneratedValues} from '@libs/SpendRulesUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {clearNewRulePrompt} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import AGENT_RULE_INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import type {GeneratedRuleState, GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React from 'react';

import DescribeRuleForm from './DescribeRuleForm';

type DescribeRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_DESCRIBE>;

/** Seeds the draft of the editor for the generated rule type and opens that editor */
function seedDraftAndNavigate(values: GeneratedRuleValues, ruleType: GeneratedRuleType, policyID: string) {
    switch (ruleType) {
        case CONST.GENERATED_RULE.RULE_TYPE.REQUIRE_FIELDS:
            setDraftRequireFieldsRule(values);
            Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID));
            break;
        case CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW:
            setDraftFlagForReviewRule(values);
            Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID));
            break;
        case CONST.GENERATED_RULE.RULE_TYPE.RESTRICT_CARD_SPEND:
            setDraftSpendRule(getSpendRuleDraftFromGeneratedValues(values));
            Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID));
            break;
        case CONST.GENERATED_RULE.RULE_TYPE.EXPENSE_DEFAULTS:
            setDraftMerchantRule(getMerchantRuleDraftFromGeneratedValues(values));
            Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
            break;
        default:
            break;
    }
}

function DescribeRulePage({route}: DescribeRulePageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const {isBetaEnabled} = usePermissions();
    const policy = usePolicy(policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);

    // A generated category stays in the draft only when the policy categories contain it. Therefore this page loads
    // the categories before the answer arrives.
    const fetchPolicyCategories = () => {
        if (!policy?.areCategoriesEnabled || policyCategories) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    };

    useNetwork({onReconnect: fetchPolicyCategories});

    useFocusEffect(() => {
        fetchPolicyCategories();
        // The Describe modal of the rule editors uses the same form. Clear it when this page loses focus, so the modal
        // does not open with the description or the error of this page.
        return () => clearNewRulePrompt();
    });

    const offerAgentRule = (prompt: string, generationID: string, state: GeneratedRuleState) => {
        Log.info('[GenerateRule] Offered agent rule fallback', false, {policyID, generationID, state});
        setDraftValues(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM, {[AGENT_RULE_INPUT_IDS.PROMPT]: prompt});
        Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID, generationID));
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.DESCRIBE_RULE)}
        >
            <ScreenWrapper
                testID="DescribeRulePage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.rules.newRule.describeYourRule')} />
                <DescribeRuleForm
                    policyID={policyID}
                    isActive={isFocused}
                    shouldFocusInput
                    submitButtonText={translate('workspace.rules.newRule.buildRule')}
                    inputContainerStyle={styles.describeRulePromptInput}
                    style={[styles.flexGrow1, styles.mh5]}
                    addBottomSafeAreaPadding
                    isFullPage
                    onRuleGenerated={(values, generatedRuleType) => seedDraftAndNavigate(values, generatedRuleType, policyID)}
                    onAgentRuleFallback={offerAgentRule}
                >
                    <Text style={[styles.textNormal, styles.textSupporting, styles.mb5]}>{translate('workspace.rules.newRule.describeRule')}</Text>
                </DescribeRuleForm>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

DescribeRulePage.displayName = 'DescribeRulePage';

export default DescribeRulePage;
