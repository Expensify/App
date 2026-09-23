import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues, setDraftValues} from '@libs/actions/FormActions';
import {openPolicyCategoriesPage} from '@libs/actions/Policy/Category';
import {setDraftFlagForReviewRule, setDraftMerchantRule, setDraftRequireFieldsRule, setDraftSpendRule} from '@libs/actions/User';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {clearNewRulePromptError, clearGeneratedRule, generateRule, setNewRulePromptError} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import AGENT_RULE_INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import {isSpendRuleCategory} from '@src/types/form/SpendRuleForm';
import type {GeneratedRule, PolicyCategories} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import RulesNewPromptForm from './RulesNewPromptForm';

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

/**
 * Seeds the draft form for the rule type Concierge picked and opens that rule's page.
 * Falls back to the unintelligible error when the rule type is missing or unrecognized.
 */
function seedDraftAndNavigate(rule: GeneratedRule, policyID: string, policyCategories: OnyxEntry<PolicyCategories>, translate: LocaleContextProps['translate']) {
    const {category, ...ruleValues} = rule.rule ?? {};

    const matchedCategory = category
        ? Object.values(policyCategories ?? {}).find((policyCategory) => policyCategory.enabled && getDecodedCategoryName(policyCategory.name) === getDecodedCategoryName(category))
        : undefined;
    const draft: NonNullable<GeneratedRule['rule']> = matchedCategory ? {...ruleValues, category: matchedCategory.name} : ruleValues;

    if (rule.ruleType === CONST.GENERATED_RULE.RULE_TYPE.REQUIRE_FIELDS) {
        setDraftRequireFieldsRule(draft);
        Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID, undefined, true));
        return;
    }

    if (rule.ruleType === CONST.GENERATED_RULE.RULE_TYPE.FLAG_FOR_REVIEW) {
        setDraftFlagForReviewRule(draft);
        Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID, undefined, true));
        return;
    }

    if (rule.ruleType === CONST.GENERATED_RULE.RULE_TYPE.RESTRICT_CARD_SPEND) {
        // `categories` is a closed enum, but it arrives as unvalidated model output already typed as valid.
        // A value outside the enum has no row in the category picker, so the admin can neither see nor remove it,
        // and it still reaches translate('...categoryOptions.<value>'), which has no key for it. Drop unknown values.
        setDraftSpendRule(draft.categories ? {...draft, categories: draft.categories.filter(isSpendRuleCategory)} : draft);
        Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID));
        return;
    }

    if (rule.ruleType === CONST.GENERATED_RULE.RULE_TYPE.EXPENSE_DEFAULTS) {
        setDraftMerchantRule({...draft, ruleType: CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.MERCHANT});
        Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
        return;
    }

    setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unintelligible'));
}

/** Routes a generated rule to either the matching rule form or the inline error explaining why it could not be used. */
function applyGeneratedRule(rule: GeneratedRule, policyID: string, policyCategories: OnyxEntry<PolicyCategories>, translate: LocaleContextProps['translate']) {
    if (rule.state === CONST.GENERATED_RULE.STATE.RULE) {
        clearDraftValues(ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM);
        seedDraftAndNavigate(rule, policyID, policyCategories, translate);
        return;
    }

    if (rule.state === CONST.GENERATED_RULE.STATE.UNSUPPORTED) {
        setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unsupported', {area: rule.unsupportedArea ?? ''}));
        return;
    }

    if (rule.state === CONST.GENERATED_RULE.STATE.MULTIPLE_RULES) {
        setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.multipleRules'));
        return;
    }

    if (rule.state === CONST.GENERATED_RULE.STATE.UNINTELLIGIBLE) {
        setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unintelligible'));
        return;
    }

    setNewRulePromptError(translate('common.genericErrorMessage'));
}

function RulesNewPage({route}: RulesNewPageProps) {
    const {policyID, categoryName} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CardReaderAlt', 'Flag', 'CheckboxText', 'ReportReceipt', 'AiBot']);
    const isCategoryScopedCreate = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW || !!categoryName;

    const canDescribeRule = !isCategoryScopedCreate;
    const [shouldShowRuleTypes, setShouldShowRuleTypes] = useState(!canDescribeRule);
    const [generationID, setGenerationID] = useState<string>();

    const [submittedPrompt, setSubmittedPrompt] = useState<string>();
    const [generatedRule] = useOnyx(ONYXKEYS.GENERATED_RULE);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const policy = usePolicy(policyID);

    const fetchPolicyCategories = () => {
        if (!policy?.areCategoriesEnabled || policyCategories) {
            return;
        }
        openPolicyCategoriesPage(policyID);
    };

    useNetwork({onReconnect: fetchPolicyCategories});

    useFocusEffect(() => {
        fetchPolicyCategories();
    });

    const appliedGenerationIDRef = useRef<string>(undefined);
    const generatedRuleForCurrentPrompt = generationID && generatedRule?.generationID === generationID ? generatedRule : undefined;
    const canOfferAgentRule = generatedRuleForCurrentPrompt?.state === CONST.GENERATED_RULE.STATE.UNSUPPORTED;

    useEffect(() => {
        if (!generatedRuleForCurrentPrompt || appliedGenerationIDRef.current === generatedRuleForCurrentPrompt.generationID) {
            return;
        }
        appliedGenerationIDRef.current = generatedRuleForCurrentPrompt.generationID;
        applyGeneratedRule(generatedRuleForCurrentPrompt, policyID, policyCategories, translate);
    }, [generatedRuleForCurrentPrompt, policyID, policyCategories, translate]);

    const describeRule = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM>) => {
        const prompt = values.prompt.trim();
        clearNewRulePromptError();
        clearGeneratedRule();
        setSubmittedPrompt(prompt);
        setGenerationID(generateRule(policyID, prompt));
    };

    const createAgentRuleFromPrompt = (prompt: string) => {
        setDraftValues(ONYXKEYS.FORMS.ADD_AGENT_RULE_FORM, {[AGENT_RULE_INPUT_IDS.PROMPT]: prompt});
        Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID));
    };

    const handleBackButtonPress = () => {
        if (canDescribeRule && shouldShowRuleTypes) {
            setShouldShowRuleTypes(false);
            return;
        }
        Navigation.goBack();
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
            onPress: () => Navigation.navigate(ROUTES.RULES_EXPENSE_DEFAULT_TYPE.getRoute(policyID)),
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_APPLY_EXPENSE_DEFAULTS,
            isWorkspaceOnly: true,
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
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.newRule.title')}
                    onBackButtonPress={handleBackButtonPress}
                />
                {canDescribeRule && !shouldShowRuleTypes ? (
                    <RulesNewPromptForm
                        onSubmit={describeRule}
                        onBuildManually={() => setShouldShowRuleTypes(true)}
                        onCreateAgentRule={canOfferAgentRule && submittedPrompt ? () => createAgentRuleFromPrompt(submittedPrompt) : undefined}
                        isLoading={!!generationID && !generatedRuleForCurrentPrompt}
                    />
                ) : (
                    <ScrollView
                        style={[styles.flexGrow1]}
                        addBottomSafeAreaPadding
                    >
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.rules.newRule.subtitle')}</Text>
                        <View style={styles.mh5}>
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
                    </ScrollView>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesNewPage;
