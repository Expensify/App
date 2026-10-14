import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {setDraftFlagForReviewRule, setDraftMerchantRule, setDraftRequireFieldsRule, setDraftSpendRule} from '@libs/actions/User';
import {categoryHasTaxRule, hasSelectableCategoryTaxRate, hasUsableTaxRates} from '@libs/CategoryTaxRulesUtils';
import {getMerchantRuleDraftFromGeneratedValues} from '@libs/ExpenseDefaultRuleUtils';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSpendRuleDraftFromGeneratedValues} from '@libs/SpendRulesUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {clearNewRulePrompt} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import AGENT_RULE_INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import type {GeneratedRuleState, GeneratedRuleType, GeneratedRuleValues} from '@src/types/onyx/GeneratedRule';
import type IconAsset from '@src/types/utils/IconAsset';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import DescribeRuleForm from './DescribeRuleForm';

type RulesNewPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_NEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW>;

type NewRuleOption = {
    key: string;
    icon: IconAsset;
    title: string;
    description: string;
    onPress: () => void;
    sentryLabel: string;
    /** When true, option is only shown from the workspace Rules Create flow (not category RHP). */
    isWorkspaceOnly?: boolean;
};

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

function RulesNewPage({route}: RulesNewPageProps) {
    const {policyID, categoryName} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CardReaderAlt', 'Flag', 'CheckboxText', 'ReportReceipt', 'AiBot']);
    const isCategorySettingsFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW;
    const isCategoryScopedCreate = isCategorySettingsFlow || !!categoryName;
    const policy = usePolicy(policyID);
    const {showConfirmModal} = useConfirmModal();
    const isFocused = useIsFocused();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [isBuildingRule = false] = useOnyx(ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM, {selector: (form) => form?.isLoading});

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

    // From category settings the only expense default is the category's tax rate, so the type chooser is skipped. It
    // can't be set without a rate to pick, so that case gets the chooser's explainer instead of an empty picker.
    const openCategoryTaxRule = () => {
        const hasCategoryTaxRule = !!categoryName && categoryHasTaxRule(policy?.rules?.expenseRules, categoryName);
        if (!hasCategoryTaxRule && !hasSelectableCategoryTaxRate(policy)) {
            const areTaxesEnabled = hasUsableTaxRates(policy);
            showConfirmModal({
                title: translate(areTaxesEnabled ? 'workspace.rules.merchantRules.addTaxRateFirstTitle' : 'workspace.rules.merchantRules.turnOnTaxesFirstTitle'),
                prompt: translate(areTaxesEnabled ? 'workspace.rules.merchantRules.addTaxRateFirstPrompt' : 'workspace.rules.merchantRules.turnOnTaxesFirstPrompt'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_NEW.path));
    };

    const newRuleOptions: NewRuleOption[] = [
        {
            key: 'restrictCardSpend',
            icon: illustrations.CardReaderAlt,
            title: translate('workspace.rules.newRule.restrictCardSpend'),
            description: translate('workspace.rules.newRule.restrictCardSpendDescription'),
            onPress: () => Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID)),
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_RESTRICT_CARD_SPEND,
            isWorkspaceOnly: true,
        },
        {
            key: 'flagForReview',
            icon: illustrations.Flag,
            title: translate('workspace.rules.newRule.flagForReview'),
            description: translate('workspace.rules.newRule.flagForReviewDescription'),
            onPress: () =>
                Navigation.navigate(
                    route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW
                        ? createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_NEW.path)
                        : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID, categoryName),
                ),
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_FLAG_FOR_REVIEW,
        },
        {
            key: 'requireFields',
            icon: illustrations.CheckboxText,
            title: translate('workspace.rules.newRule.requireFields'),
            description: translate('workspace.rules.newRule.requireFieldsDescription'),
            onPress: () =>
                Navigation.navigate(
                    route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW
                        ? createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_REQUIRE_FIELDS_NEW.path)
                        : ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID, categoryName),
                ),
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_REQUIRE_FIELDS,
        },
        {
            key: 'applyExpenseDefaults',
            icon: illustrations.ReportReceipt,
            title: translate('workspace.rules.newRule.applyExpenseDefaults'),
            description: translate('workspace.rules.newRule.applyExpenseDefaultsDescription'),
            onPress: () => (isCategorySettingsFlow ? openCategoryTaxRule() : Navigation.navigate(ROUTES.RULES_EXPENSE_DEFAULT_TYPE.getRoute(policyID))),
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_APPLY_EXPENSE_DEFAULTS,
            // Only category settings can scope the editor to its category, so a category passed any other way drops it.
            isWorkspaceOnly: !isCategorySettingsFlow,
        },
        {
            key: 'createAgentRule',
            icon: illustrations.AiBot,
            title: translate('workspace.rules.newRule.createAgentRule'),
            description: translate('workspace.rules.newRule.createAgentRuleDescription'),
            onPress: () => Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID)),
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_CREATE_AGENT_RULE,
            isWorkspaceOnly: true,
        },
    ];

    const visibleNewRuleOptions = isCategoryScopedCreate ? newRuleOptions.filter((option) => !option.isWorkspaceOnly) : newRuleOptions;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="RulesNewPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.rules.newRule.title')} />
                <ScrollView
                    style={[styles.flexGrow1]}
                    addBottomSafeAreaPadding
                >
                    {isCategoryScopedCreate ? (
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.rules.newRule.subtitle')}</Text>
                    ) : (
                        <>
                            <Text style={[styles.textLabel, styles.textStrong, styles.ph5, styles.mt3, styles.mb3]}>{translate('workspace.rules.newRule.buildUsingAI')}</Text>
                            <DescribeRuleForm
                                policyID={policyID}
                                isActive={isFocused}
                                submitButtonText={translate('workspace.rules.newRule.buildRule')}
                                inputContainerStyle={styles.describeRuleInlinePromptInput}
                                style={styles.mh5}
                                onRuleGenerated={(values, generatedRuleType) => seedDraftAndNavigate(values, generatedRuleType, policyID)}
                                onAgentRuleFallback={offerAgentRule}
                            />
                        </>
                    )}
                    {isBuildingRule && !isCategoryScopedCreate ? (
                        <View style={[styles.alignItemsCenter, styles.mt8]}>
                            <ActivityIndicator />
                            <Text style={[styles.textSupporting, styles.mt3]}>{translate('workspace.rules.newRule.buildingRule')}</Text>
                        </View>
                    ) : (
                        <View style={styles.mh5}>
                            {!isCategoryScopedCreate && (
                                <Text style={[styles.textLabel, styles.textStrong, styles.mt6, styles.mb3]}>{translate('workspace.rules.newRule.startFromScratch')}</Text>
                            )}
                            {visibleNewRuleOptions.map((option) => (
                                <MenuItem
                                    key={option.key}
                                    icon={option.icon}
                                    title={option.title}
                                    description={option.description}
                                    shouldShowRightIcon
                                    onPress={option.onPress}
                                    displayInDefaultIconColor
                                    iconWidth={variables.iconSizeExtraLarge}
                                    iconHeight={variables.iconSizeExtraLarge}
                                    wrapperStyle={styles.rulesNewMenuItem}
                                    sentryLabel={option.sentryLabel}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesNewPage;
