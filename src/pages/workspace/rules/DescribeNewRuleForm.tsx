/**
 * The section of New rule where an admin describes a rule in plain English. Concierge builds a standard rule when it
 * can, and the section drafts an agent rule when it can't.
 */
import Icon from '@components/Icon';
import Text from '@components/Text';

import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {setDraftFlagForReviewRule, setDraftMerchantRule, setDraftRequireFieldsRule, setDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards} from '@libs/CardUtils';
import {categoryHasTaxRule, getCategoryTaxRuleDraftFromGeneratedValues} from '@libs/CategoryTaxRulesUtils';
import {getMerchantRuleDraftFromGeneratedValues} from '@libs/ExpenseDefaultRuleUtils';
import {hasExplicitFlagAmount} from '@libs/FlagForReviewRulesUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {categoryHasAnyRequireFieldsRule, getRequireFieldsDraftFromGeneratedValues} from '@libs/RequireFieldsRulesUtils';
import {getEligibleSpendRuleCards, getSpendRuleDraftFromGeneratedValues} from '@libs/SpendRulesUtils';

import variables from '@styles/variables';

import {clearNewRulePrompt} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import AGENT_RULE_INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import type {Policy, PolicyCategory} from '@src/types/onyx';
import type {GeneratedRuleState, GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import DescribeRuleForm from './DescribeRuleForm';

type DescribeNewRuleFormProps = {
    policyID: string;

    /** Content above the describe section */
    children: ReactNode;
};

type SeedDraftContext = {
    policyID: string;
    policy: OnyxEntry<Policy>;

    /** The cards that a new spend rule can cover, or undefined while the card settings load */
    eligibleCardIDs: string[] | undefined;
};

/** Seeds the draft of the editor for the generated rule type and opens that editor */
function seedDraftAndNavigate(values: GeneratedRuleValues, ruleType: GeneratedRuleType, {policyID, policy, eligibleCardIDs}: SeedDraftContext) {
    switch (ruleType) {
        case CONST.GENERATED_RULE.RULE_TYPE.REQUIRE_FIELDS:
            setDraftRequireFieldsRule(getRequireFieldsDraftFromGeneratedValues(values).draft);
            Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID));
            break;
        case CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW:
            setDraftFlagForReviewRule(values);
            Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID));
            break;
        case CONST.GENERATED_RULE.RULE_TYPE.RESTRICT_CARD_SPEND:
            setDraftSpendRule(getSpendRuleDraftFromGeneratedValues(values, eligibleCardIDs));
            Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID));
            break;
        case CONST.GENERATED_RULE.RULE_TYPE.EXPENSE_DEFAULTS:
            setDraftMerchantRule(getMerchantRuleDraftFromGeneratedValues(values));
            Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
            break;
        // The expense defaults editor takes its rule type from the draft. Therefore a category draft opens the category tax rate editor.
        case CONST.GENERATED_RULE.RULE_TYPE.CATEGORY_TAX_RATE:
            setDraftMerchantRule(getCategoryTaxRuleDraftFromGeneratedValues(values, policy));
            Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
            break;
        default:
            break;
    }
}

function DescribeNewRuleForm({policyID, children}: DescribeNewRuleFormProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isFocused = useIsFocused();
    const policy = usePolicy(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const domainAccountID = useDefaultFundID(policyID);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const eligibleCardIDs = expensifyCardSettings ? getEligibleSpendRuleCards(cardsList, expensifyCardSettings).map((card) => String(card.cardID)) : undefined;

    // A generated category stays in the draft only when the policy categories contain it. Therefore this form loads
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
        // The Describe modal of the rule editors uses the same form. Clear it when New rule loses focus, so the modal
        // does not open with the description or the error of New rule.
        return () => clearNewRulePrompt();
    });

    /** Returns whether a new rule of the generated rule type can use the category */
    const isCategoryEligible = (category: PolicyCategory, generatedRuleType: GeneratedRuleType) => {
        switch (generatedRuleType) {
            case CONST.GENERATED_RULE.RULE_TYPE.REQUIRE_FIELDS:
                return !categoryHasAnyRequireFieldsRule(category);
            case CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW:
                return !hasExplicitFlagAmount(category.maxExpenseAmount);
            case CONST.GENERATED_RULE.RULE_TYPE.CATEGORY_TAX_RATE:
                return !categoryHasTaxRule(policy?.rules?.expenseRules, category.name);
            default:
                return true;
        }
    };

    const offerAgentRule = (prompt: string, generationID: string, state: GeneratedRuleState) => {
        Log.info('[GenerateRule] Offered agent rule fallback', false, {policyID, generationID, state});
        setDraftValues(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM, {[AGENT_RULE_INPUT_IDS.PROMPT]: prompt});
        Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID, generationID));
    };

    return (
        <DescribeRuleForm
            policyID={policyID}
            isActive={isFocused}
            submitButtonText={translate('common.next')}
            inputContainerStyle={styles.describeNewRulePromptInput}
            placeholder={translate('workspace.rules.newRule.describeRulePlaceholder')}
            canSkipDescription
            style={[styles.flexGrow1, styles.mh5]}
            addBottomSafeAreaPadding
            shouldUseScrollView
            submitFlexEnabled
            onRuleGenerated={(values, generatedRuleType) => seedDraftAndNavigate(values, generatedRuleType, {policyID, policy, eligibleCardIDs})}
            isCategoryEligible={isCategoryEligible}
            onAgentRuleFallback={offerAgentRule}
        >
            {children}
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt5, styles.mb3]}>
                <Text style={styles.textHeadlineLineHeightXXL}>{translate('workspace.rules.newRule.describeItBelow')}</Text>
                <Icon
                    src={icons.Sparkles}
                    fill={theme.icon}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
            </View>
        </DescribeRuleForm>
    );
}

DescribeNewRuleForm.displayName = 'DescribeNewRuleForm';

export default DescribeNewRuleForm;
