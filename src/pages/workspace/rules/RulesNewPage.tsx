import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftValues} from '@libs/actions/FormActions';
import {setDraftFlagForReviewRule, setDraftMerchantRule, setDraftRequireFieldsRule, setDraftSpendRule} from '@libs/actions/User';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {clearNewRulePromptError, clearParsedPolicyRule, parsePolicyRule, setNewRulePromptError} from '@userActions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import AGENT_RULE_INPUT_IDS from '@src/types/form/AddAgentRuleForm';
import type {ParsedPolicyRule} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import React, {useEffect, useState} from 'react';
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

function RulesNewPage({route}: RulesNewPageProps) {
    const {policyID, categoryName} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const isCustomAgentBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const illustrations = useMemoizedLazyIllustrations(['CardReaderAlt', 'Flag', 'CheckboxText', 'ReportReceipt', 'AiBot']);
    const isCategoryScopedCreate = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW || !!categoryName;

    // The category-scoped flow already knows the category and offers fewer types, so it opens on the list.
    const canDescribeRule = isRulesRevampEnabled && !isCategoryScopedCreate;
    const [shouldShowRuleTypes, setShouldShowRuleTypes] = useState(!canDescribeRule);
    const [parseID, setParseID] = useState<string>();

    const [submittedPrompt, setSubmittedPrompt] = useState<string>();

    // Set when the deterministic rule types cannot express the prompt, which an agent rule still can.
    const [canOfferAgentRule, setCanOfferAgentRule] = useState(false);
    const [parsedRule] = useOnyx(ONYXKEYS.NVP_PARSED_POLICY_RULE);
    const [isBuildingRule] = useOnyx(ONYXKEYS.IS_LOADING_PARSED_POLICY_RULE);

    const seedDraftAndNavigate = (rule: ParsedPolicyRule) => {
        const draft = rule.rule ?? {};

        if (rule.ruleType === CONST.PARSED_POLICY_RULE.RULE_TYPE.REQUIRE_FIELDS) {
            setDraftRequireFieldsRule(draft);
            Navigation.navigate(ROUTES.RULES_REQUIRE_FIELDS_RULE_NEW.getRoute(policyID, undefined, true));
            return;
        }

        if (rule.ruleType === CONST.PARSED_POLICY_RULE.RULE_TYPE.FLAG_FOR_REVIEW) {
            setDraftFlagForReviewRule(draft);
            Navigation.navigate(ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID, undefined, true));
            return;
        }

        if (rule.ruleType === CONST.PARSED_POLICY_RULE.RULE_TYPE.RESTRICT_CARD_SPEND) {
            setDraftSpendRule(draft);
            Navigation.navigate(ROUTES.RULES_SPEND_NEW.getRoute(policyID));
            return;
        }

        if (rule.ruleType === CONST.PARSED_POLICY_RULE.RULE_TYPE.EXPENSE_DEFAULTS) {
            setDraftMerchantRule(draft);
            Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
            return;
        }

        setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unintelligible'));
    };

    const applyParsedRule = (rule: ParsedPolicyRule) => {
        if (rule.state === CONST.PARSED_POLICY_RULE.STATE.PARSING) {
            return;
        }

        setParseID(undefined);
        clearParsedPolicyRule();

        if (rule.state === CONST.PARSED_POLICY_RULE.STATE.RULE) {
            seedDraftAndNavigate(rule);
            return;
        }

        if (rule.state === CONST.PARSED_POLICY_RULE.STATE.UNSUPPORTED) {
            setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unsupported', {area: rule.unsupportedArea ?? ''}));
            setCanOfferAgentRule(true);
            return;
        }

        if (rule.state === CONST.PARSED_POLICY_RULE.STATE.MULTIPLE_RULES) {
            setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.multipleRules'));
            return;
        }

        if (rule.state === CONST.PARSED_POLICY_RULE.STATE.UNINTELLIGIBLE) {
            setNewRulePromptError(translate('workspace.rules.newRule.promptErrors.unintelligible'));
            return;
        }

        setNewRulePromptError(translate('common.genericErrorMessage'));
    };

    useEffect(() => {
        if (!parseID || parsedRule?.parseID !== parseID) {
            return;
        }
        applyParsedRule(parsedRule);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- applyParsedRule reads only what it is given
    }, [parseID, parsedRule]);

    const describeRule = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_RULE_PROMPT_FORM>) => {
        const prompt = values.prompt.trim();
        clearNewRulePromptError();
        setCanOfferAgentRule(false);
        setSubmittedPrompt(prompt);
        setParseID(parsePolicyRule(policyID, prompt));
    };

    // The prompt carries over so the admin does not retype it.
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
            onPress: () => Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID, categoryName)),
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_APPLY_EXPENSE_DEFAULTS,
            isWorkspaceOnly: true,
        },
        ...(isCustomAgentBetaEnabled
            ? [
                  {
                      key: 'createAgentRule',
                      icon: illustrations.AiBot,
                      title: translate('workspace.rules.newRule.createAgentRule'),
                      description: translate('workspace.rules.newRule.createAgentRuleDescription'),
                      onPress: () => Navigation.navigate(ROUTES.RULES_AGENT_NEW.getRoute(policyID)),
                      sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.NEW_RULE_MENU_ITEM_CREATE_AGENT_RULE,
                      isWorkspaceOnly: true,
                  } satisfies NewRuleOption,
              ]
            : []),
    ];

    const visibleNewRuleOptions = isCategoryScopedCreate ? newRuleOptions.filter((option) => !option.isWorkspaceOnly) : newRuleOptions;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isRulesRevampEnabled}
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
                        onCreateAgentRule={isCustomAgentBetaEnabled && canOfferAgentRule && submittedPrompt ? () => createAgentRuleFromPrompt(submittedPrompt) : undefined}
                        isLoading={!!isBuildingRule}
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
