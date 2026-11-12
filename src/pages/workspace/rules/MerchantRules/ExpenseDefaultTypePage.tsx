import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import {useMenuItemInteraction} from '@components/MenuItem/MenuItemContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {setDraftMerchantRule} from '@libs/actions/User';
import {hasSelectableCategoryTaxRate, hasUsableTaxRates} from '@libs/CategoryTaxRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {callIfAuthenticated} from '@userActions/Session';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {authTokenTypeSelector} from '@src/selectors/Session';
import type {ExpenseDefaultRuleType} from '@src/types/form/MerchantRuleForm';

import React from 'react';
import {View} from 'react-native';

type ExpenseDefaultTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_EXPENSE_DEFAULT_TYPE>;

function ExpenseDefaultLockIcon() {
    const theme = useTheme();
    const {isHovered, isPressed} = useMenuItemInteraction();
    const icons = useMemoizedLazyExpensifyIcons(['Lock']);

    return (
        <Icon
            src={icons.Lock}
            fill={isHovered || isPressed ? theme.iconHovered : theme.icon}
            width={variables.iconSizeNormal}
            height={variables.iconSizeNormal}
        />
    );
}

/**
 * Picks what an expense default matches on before the editor opens, so the editor can drop the condition and the
 * defaults the chosen type can't carry instead of showing them locked.
 */
function ExpenseDefaultTypePage({route}: ExpenseDefaultTypePageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const illustrations = useMemoizedLazyIllustrations(['FoodTruck', 'FolderOpen']);

    const {showConfirmModal} = useConfirmModal();

    // A category rule only sets a default tax rate, so it needs a rate to choose from. The card stays listed either
    // way: hiding it would drop the admin on a one-option page with no hint of what is missing.
    //
    // Taxes being on is not enough. Every rate can be disabled, and the workspace default can be the only one left,
    // which a category rule can't apply. Opening the editor then led to a picker with nothing in it, so the lock reads
    // the same rule the picker does and the two reasons get their own explainer.
    const areTaxesEnabled = hasUsableTaxRates(policy);
    const canPickCategoryTaxRate = hasSelectableCategoryTaxRate(policy);

    // Scoping rides in the draft rather than the URL, so the editor keeps it when a picker routes back to the plain
    // create URL. Setting it here also starts the rule from a clean draft.
    const openEditorScopedTo = (ruleType: ExpenseDefaultRuleType) => {
        setDraftMerchantRule({ruleType});
        Navigation.navigate(ROUTES.RULES_MERCHANT_NEW.getRoute(policyID));
    };

    const showMissingTaxRateExplainer = () => {
        showConfirmModal({
            title: translate(areTaxesEnabled ? 'workspace.rules.merchantRules.addTaxRateFirstTitle' : 'workspace.rules.merchantRules.turnOnTaxesFirstTitle'),
            prompt: translate(areTaxesEnabled ? 'workspace.rules.merchantRules.addTaxRateFirstPrompt' : 'workspace.rules.merchantRules.turnOnTaxesFirstPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const options = [
        {
            key: 'merchant',
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.EXPENSE_DEFAULT_TYPE.MERCHANT,
            icon: illustrations.FoodTruck,
            title: translate('workspace.rules.expenseDefaultType.merchant'),
            description: translate('workspace.rules.expenseDefaultType.merchantDescription'),
            onPress: () => openEditorScopedTo(CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.MERCHANT),
            isLocked: false,
        },
        {
            key: 'category',
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.EXPENSE_DEFAULT_TYPE.CATEGORY,
            icon: illustrations.FolderOpen,
            title: translate('workspace.rules.expenseDefaultType.category'),
            description: translate('workspace.rules.expenseDefaultType.categoryDescription'),
            onPress: canPickCategoryTaxRate ? () => openEditorScopedTo(CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.CATEGORY) : showMissingTaxRateExplainer,
            isLocked: !canPickCategoryTaxRate,
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="ExpenseDefaultTypePage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButtonAndTitle title={translate('workspace.rules.expenseDefaultType.title')} />
                <ScrollView
                    style={[styles.flexGrow1]}
                    addBottomSafeAreaPadding
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.rules.expenseDefaultType.subtitle')}</Text>
                    <View style={styles.mh5}>
                        {options.map((option) => (
                            <MenuItem.Root
                                sentryLabel={option.sentryLabel}
                                key={option.key}
                                onPress={callIfAuthenticated(option.onPress, session)}
                                style={styles.rulesNewMenuItem}
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
                                        {option.isLocked ? (
                                            <ExpenseDefaultLockIcon />
                                        ) : (
                                            <MenuItem.Chevron />
                                        )}
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItem.Root>
                        ))}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ExpenseDefaultTypePage;
