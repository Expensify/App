import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {categoryHasTaxRule, hasSelectableCategoryTaxRate, hasUsableTaxRates} from '@libs/CategoryTaxRulesUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {callIfAuthenticated} from '@userActions/Session';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {authTokenTypeSelector} from '@src/selectors/Session';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';
import {View} from 'react-native';

import DescribeNewRuleForm from './DescribeNewRuleForm';

type RulesNewPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_NEW>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW>;

type NewRuleOption = {
    key: string;
    icon: IconAsset;
    title: string;
    description: string;
    onPress: () => void;
    sentryLabel: SentryLabel;
    /** When true, option is only shown from the workspace Rules Create flow (not category RHP). */
    isWorkspaceOnly?: boolean;
};

function RulesNewPage({route}: RulesNewPageProps) {
    const {policyID, categoryName} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['CardReaderAlt', 'Flag', 'CheckboxText', 'ReportReceipt']);
    const isCategorySettingsFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_RULES_NEW;
    const isCategoryScopedCreate = isCategorySettingsFlow || !!categoryName;
    const policy = usePolicy(policyID);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {showConfirmModal} = useConfirmModal();

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
    ];

    const visibleNewRuleOptions = isCategoryScopedCreate ? newRuleOptions.filter((option) => !option.isWorkspaceOnly) : newRuleOptions;
    // The describe section cannot scope a rule to a category. Therefore it shows only when New rule opens from the workspace Rules page.
    const shouldShowDescribeSection = !isCategoryScopedCreate;

    const newRuleMenuItems = visibleNewRuleOptions.map((option) => (
        <MenuItem.Root
            key={option.key}
            onPress={callIfAuthenticated(option.onPress, session)}
            style={styles.rulesNewMenuItem}
            sentryLabel={option.sentryLabel}
        >
            <MenuItem.Row>
                <MenuItem.Leading>
                    <View style={styles.popoverMenuIcon}>
                        <Icon
                            src={option.icon}
                            width={variables.iconSizeExtraLarge}
                            height={variables.iconSizeExtraLarge}
                        />
                    </View>
                </MenuItem.Leading>
                <MenuItem.Content>
                    <MenuItem.Title>{option.title}</MenuItem.Title>
                    <MenuItem.Description>{option.description}</MenuItem.Description>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    ));

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
                shouldEnableMaxHeight={shouldShowDescribeSection}
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.rules.newRule.title')} />
                {shouldShowDescribeSection ? (
                    <DescribeNewRuleForm policyID={policyID}>
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>{translate('workspace.rules.newRule.startWithTemplate')}</Text>
                        {newRuleMenuItems}
                    </DescribeNewRuleForm>
                ) : (
                    <ScrollView
                        style={[styles.flexGrow1]}
                        addBottomSafeAreaPadding
                    >
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.rules.newRule.subtitle')}</Text>
                        <View style={styles.mh5}>{newRuleMenuItems}</View>
                    </ScrollView>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesNewPage;
