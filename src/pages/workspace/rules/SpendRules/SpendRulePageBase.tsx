import type {NavigationProp} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SpendRuleRestrictionTypeToggle from '@components/SpendRules/SpendRuleRestrictionTypeToggle';
import SpendRuleRestrictionTypeToggleRevamp from '@components/SpendRules/SpendRuleRestrictionTypeToggleRevamp';
import Text from '@components/Text';
import useCanWriteCardSpendRules from '@hooks/useCanWriteCardSpendRules';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';
import {deleteExpensifyCardRule, setExpensifyCardRule} from '@libs/actions/Card';
import Tab from '@libs/actions/Tab';
import {clearDraftSpendRule, setDraftSpendRule, updateDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards, getCardDescriptionForSearchTable, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getSpendRuleFormValuesFromCardRule, getTruncatedSpendRuleSummary} from '@libs/SpendRulesUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {SpendRuleCategory} from '@src/types/form/SpendRuleForm';
import type IconAsset from '@src/types/utils/IconAsset';

type SpendRulePageBaseProps = {
    policyID: string;
    ruleID?: string;
    titleKey: TranslationPaths;
    testID: string;
};

function getErrorMessage(hasSelectedCards: boolean, hasAnyRuleApplied: boolean, translate: (path: TranslationPaths) => string) {
    if (!hasSelectedCards && !hasAnyRuleApplied) {
        return translate('workspace.rules.spendRules.confirmErrorCardRequired');
    }
    if (!hasSelectedCards) {
        return translate('workspace.rules.spendRules.confirmErrorApplyAtLeastOneSpendRuleToOneCard');
    }
    if (!hasAnyRuleApplied) {
        return translate('workspace.rules.spendRules.confirmErrorApplyAtLeastOneSpendRule');
    }
    return '';
}

function SpendRulePageBase({policyID, ruleID, titleKey, testID}: SpendRulePageBaseProps) {
    const navigation = useNavigation<NavigationProp<SettingsNavigatorParamList>>();
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const {showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const canWriteSpendRules = useCanWriteCardSpendRules(policyID);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const icons = useMemoizedLazyExpensifyIcons(['CreditCardHourglass', 'MoneyCircle', 'CoinsButton', 'Basket', 'CircleSlash']);
    const domainAccountID = useDefaultFundID(policyID);
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const currentRuleID = ruleID ?? ROUTES.NEW;
    const isEditing = currentRuleID !== ROUTES.NEW;
    const existingRule = isEditing ? expensifyCardSettings?.cardRules?.[currentRuleID] : undefined;

    useEffect(() => () => clearDraftSpendRule(), []);

    useEffect(() => {
        if (!isEditing || !existingRule) {
            return;
        }

        const existingFormValues = getSpendRuleFormValuesFromCardRule(existingRule);
        if (!existingFormValues) {
            return;
        }

        setDraftSpendRule(existingFormValues);
    }, [existingRule, isEditing]);

    const cardIDs = spendRuleForm?.cardIDs;
    const restrictionAction = spendRuleForm?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const merchantNames = spendRuleForm?.merchantNames ?? [];
    const categories = spendRuleForm?.categories ?? [];
    const maxAmount = spendRuleForm?.maxAmount ?? '';

    const clearError = () => {
        setIsErrorVisible(false);
    };

    const selectedCurrency = getSelectedCardsSharedCurrency(cardIDs, cardsList);
    const parsedMaxAmount = Number.parseFloat(maxAmount);
    const maxAmountMenuTitle = Number.isFinite(parsedMaxAmount) ? convertToDisplayString(convertToBackendAmount(parsedMaxAmount), selectedCurrency ?? CONST.CURRENCY.USD) : '';

    const openCurrencyMismatchModal = async () => {
        const result = await showConfirmModal({
            title: translate('workspace.rules.spendRules.currencyMismatchTitle'),
            prompt: translate('workspace.rules.spendRules.currencyMismatchPrompt'),
            confirmText: translate('workspace.rules.spendRules.reviewSelectedCards'),
            cancelText: translate('common.cancel'),
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CARD, {policyID, ruleID: currentRuleID});
    };

    function getCardsMenuTitle(cardIDsToSummarize: string[] | undefined): string {
        const activeCardIDs = cardIDsToSummarize?.filter((id) => cardsList?.[id] !== undefined);
        return getTruncatedSpendRuleSummary(
            activeCardIDs?.map((id) => {
                const card = cardsList?.[id];
                if (card === undefined) {
                    return id;
                }
                const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
                const displayName = getDisplayNameOrDefault(personalDetails?.[accountID], '', false);
                return getCardDescriptionForSearchTable(card, translate, displayName || undefined) || id;
            }),
            (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
        );
    }

    function getMerchantMenuTitle(merchantNamesToSummarize: string[] | undefined): string {
        return getTruncatedSpendRuleSummary(merchantNamesToSummarize, (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}));
    }

    function getCategoryMenuTitle(categoriesToSummarize: SpendRuleCategory[] | undefined): string {
        return getTruncatedSpendRuleSummary(
            categoriesToSummarize?.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`)),
            (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
        );
    }

    const cardsMenuTitle = getCardsMenuTitle(cardIDs);
    const categoriesMenuTitle = getCategoryMenuTitle(categories);

    const hasSelectedCards = !!cardIDs?.length;
    const hasAnyMerchant = merchantNames.some((name) => name.trim() !== '');
    const hasAnyCategory = categories.length > 0;
    const hasMaxAmount = maxAmount.trim() !== '';
    const hasAnyRuleApplied = hasAnyMerchant || hasAnyCategory || hasMaxAmount;
    const errorMessage = getErrorMessage(hasSelectedCards, hasAnyRuleApplied, translate);

    const handleSaveRule = () => {
        if (!canWriteSpendRules) {
            return;
        }
        if (errorMessage) {
            setIsErrorVisible(true);
            return;
        }

        if (!cardIDs) {
            return;
        }

        clearError();
        setExpensifyCardRule(domainAccountID, isEditing ? currentRuleID : rand64(), spendRuleForm, existingRule);
        clearDraftSpendRule();
        if (!isEditing && isRulesRevampEnabled) {
            Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, CONST.TAB.RULES.CARD_RESTRICTIONS);
            Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
        } else {
            navigation.goBack();
        }
    };

    const handleDeleteRule = () => {
        if (!canWriteSpendRules) {
            return;
        }
        if (!existingRule) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.rules.spendRules.deleteRule'),
            prompt: translate('workspace.rules.spendRules.deleteRuleConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            deleteExpensifyCardRule(domainAccountID, currentRuleID, existingRule);
            clearDraftSpendRule();
            navigation.goBack();
        });
    };

    if (isEditing && !existingRule) {
        return <NotFoundPage />;
    }

    if (!isEditing && !!policy && !canWriteSpendRules) {
        return <NotFoundPage />;
    }

    const getMenuItemIconProps = (icon: IconAsset) => ({
        icon,
        iconWidth: variables.iconSizeNormal,
        iconHeight: variables.iconSizeNormal,
        shouldIconUseAutoWidthStyle: true,
    });

    const handleRestrictionActionSelect = (action: typeof restrictionAction) => {
        if (!canWriteSpendRules) {
            showReadOnlyModal();
            return;
        }
        clearError();
        updateDraftSpendRule({restrictionAction: action});
    };

    const openCardsPage = () => {
        clearError();
        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CARD, {policyID, ruleID: currentRuleID});
    };

    const openMerchantsPage = () => {
        clearError();
        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_MERCHANTS, {policyID, ruleID: currentRuleID});
    };

    const openCategoryPage = () => {
        clearError();
        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CATEGORY, {policyID, ruleID: currentRuleID});
    };

    const openMaxAmountPage = () => {
        clearError();
        if (!selectedCurrency) {
            openCurrencyMismatchModal();
            return;
        }
        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_MAX_AMOUNT, {policyID, ruleID: currentRuleID});
    };

    const spendRuleSectionSentryLabel = CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_SECTION_ITEM;
    const merchantRuleSectionSentryLabel = CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM;

    const renderEditableMenuItem = ({description, title, onPress, sentryLabel, icon}: {description: string; title: string; onPress: () => void; sentryLabel: string; icon?: IconAsset}) => (
        <MenuItemWithTopDescription
            description={description}
            onPress={canWriteSpendRules ? onPress : undefined}
            shouldShowRightIcon={canWriteSpendRules}
            interactive={canWriteSpendRules}
            title={title}
            numberOfLinesTitle={2}
            titleStyle={styles.flex1}
            {...(icon ? getMenuItemIconProps(icon) : {})}
            sentryLabel={sentryLabel}
        />
    );

    const cardsMenuItem = renderEditableMenuItem({
        description: translate(isRulesRevampEnabled ? 'workspace.rules.spendRules.cardPageTitle' : 'workspace.rules.spendRules.chooseCards'),
        title: cardsMenuTitle,
        onPress: openCardsPage,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.CreditCardHourglass : undefined,
    });

    const merchantMenuItem = renderEditableMenuItem({
        description: translate(isRulesRevampEnabled ? 'workspace.rules.spendRules.blockedMerchant' : 'common.merchant'),
        title: getMerchantMenuTitle(spendRuleForm?.merchantNames),
        onPress: openMerchantsPage,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.Basket : undefined,
    });

    const categoryMenuItem = renderEditableMenuItem({
        description: translate(isRulesRevampEnabled ? 'workspace.rules.spendRules.blockedMerchantTypes' : 'workspace.rules.spendRules.spendCategory'),
        title: categoriesMenuTitle,
        onPress: openCategoryPage,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.Basket : undefined,
    });

    const maxAmountMenuItem = renderEditableMenuItem({
        description: translate('workspace.rules.spendRules.maxAmount'),
        title: isRulesRevampEnabled && maxAmountMenuTitle ? translate('workspace.rules.spendRules.maxAmountAbove', {amount: maxAmountMenuTitle}) : maxAmountMenuTitle,
        onPress: openMaxAmountPage,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.CoinsButton : undefined,
    });

    const revampFormContent = (
        <>
            <View style={[styles.ph5, styles.pv3, styles.gap6]}>
                <Text style={[styles.textNormal, styles.textSupporting]}>{translate('workspace.rules.spendRules.restrictCardSpendSubtitle')}</Text>
                <Text style={[styles.textLabel, styles.textSupporting, styles.lh16]}>{translate('workspace.rules.spendRules.ifAnyCardMatches')}</Text>
            </View>
            {cardsMenuItem}
            <View style={[styles.sectionDividerLine, styles.mh5, styles.mv3]} />
            <Text style={[styles.textLabel, styles.textSupporting, styles.lh16, styles.ph5, styles.pv3]}>{translate('workspace.rules.spendRules.thenDoThisAtPointOfSale')}</Text>
            <MenuItemWithTopDescription
                description={translate('workspace.rules.spendRules.permittedCurrencies')}
                interactive={false}
                title={selectedCurrency ?? ''}
                titleStyle={styles.flex1}
                {...getMenuItemIconProps(icons.MoneyCircle)}
                sentryLabel={spendRuleSectionSentryLabel}
            />
            {maxAmountMenuItem}
            <View style={[styles.ph5, styles.pv3]}>
                <SpendRuleRestrictionTypeToggleRevamp
                    restrictionAction={restrictionAction}
                    label={
                        restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK
                            ? translate('workspace.rules.spendRules.merchantRestrictions')
                            : translate('workspace.rules.spendRules.setRestrictions')
                    }
                    icon={restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK ? icons.CircleSlash : undefined}
                    onSelect={handleRestrictionActionSelect}
                />
            </View>
            {restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK && (
                <>
                    {merchantMenuItem}
                    {categoryMenuItem}
                </>
            )}
        </>
    );

    const legacyFormContent = (
        <>
            <Text style={[styles.textStrong, styles.ph5, styles.pv2]}>{translate('workspace.rules.spendRules.cardsSectionTitle')}</Text>
            {cardsMenuItem}
            <Text style={[styles.textStrong, styles.ph5, styles.mt5]}>{translate('workspace.rules.spendRules.spendRuleSectionTitle')}</Text>
            <View style={[styles.ph5, styles.pv3]}>
                <SpendRuleRestrictionTypeToggle
                    restrictionAction={restrictionAction}
                    onSelect={handleRestrictionActionSelect}
                />
            </View>
            {merchantMenuItem}
            {categoryMenuItem}
            {maxAmountMenuItem}
        </>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            shouldBeBlocked={!!policy?.id && !canWriteSpendRules}
        >
            <ScreenWrapper
                testID={testID}
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton title={translate(isRulesRevampEnabled ? 'workspace.rules.spendRules.restrictCardSpendTitle' : titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>{isRulesRevampEnabled ? revampFormContent : legacyFormContent}</ScrollView>
                {canWriteSpendRules && (
                    <FormAlertWithSubmitButton
                        buttonText={translate('workspace.rules.spendRules.saveRule')}
                        containerStyles={[styles.m4, styles.mb5]}
                        message={errorMessage}
                        isAlertVisible={isErrorVisible}
                        onSubmit={handleSaveRule}
                        enabledWhenOffline
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_SAVE}
                        shouldRenderFooterAboveSubmit
                        footerContent={
                            isEditing ? (
                                <Button
                                    text={translate('workspace.rules.spendRules.deleteRule')}
                                    onPress={handleDeleteRule}
                                    style={[styles.mb4]}
                                    large
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_DELETE}
                                />
                            ) : undefined
                        }
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRulePageBase.displayName = 'SpendRulePageBase';

export default SpendRulePageBase;
