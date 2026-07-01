import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
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
import {rand64} from '@libs/NumberUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getSpendRuleFormValuesFromCardRule, getTruncatedSpendRuleSummary} from '@libs/SpendRulesUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);

    const {showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const canWriteSpendRules = useCanWriteCardSpendRules(policyID);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);
    const icons = useMemoizedLazyExpensifyIcons(['CreditCardHourglass', 'MoneyCircle', 'CoinsButton', 'Basket']);
    const domainAccountID = useDefaultFundID(policyID);
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const currentRuleID = ruleID ?? ROUTES.NEW;
    const isNewRule = currentRuleID === ROUTES.NEW;
    const isEditingRule = currentRuleID !== ROUTES.NEW;
    const existingRule = isEditingRule ? expensifyCardSettings?.cardRules?.[currentRuleID] : undefined;
    const existingFormValues = useMemo(() => getSpendRuleFormValuesFromCardRule(existingRule), [existingRule]);

    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [isRestrictMerchantsOff, setIsRestrictMerchantsOff] = useState(() => {
        const hasNoMerchantRestrictions = !existingFormValues?.merchantNames.length && !existingFormValues?.categories?.length;
        return isNewRule || hasNoMerchantRestrictions;
    });

    useEffect(() => () => clearDraftSpendRule(), []);

    useEffect(() => {
        if (!isEditingRule || !existingFormValues) {
            return;
        }

        setDraftSpendRule(existingFormValues);
    }, [existingFormValues, isEditingRule]);

    const cardIDs = spendRuleForm?.cardIDs;
    const restrictionAction = spendRuleForm?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const merchantNames = spendRuleForm?.merchantNames ?? [];
    const categories = spendRuleForm?.categories ?? [];
    const currencies = spendRuleForm?.currencies ?? [];
    const maxAmount = spendRuleForm?.maxAmount ?? '';

    const selectedCurrency = getSelectedCardsSharedCurrency(cardIDs, cardsList);
    const parsedMaxAmount = Number.parseFloat(maxAmount);
    const maxAmountMenuTitle = Number.isFinite(parsedMaxAmount) ? convertToDisplayString(convertToBackendAmount(parsedMaxAmount), selectedCurrency ?? CONST.CURRENCY.USD) : '';

    const clearError = () => {
        setIsErrorVisible(false);
    };

    const openMaxAmountCurrencyMismatchModal = () => {
        showConfirmModal({
            id: 'spend-rule-max-amount-currency-mismatch-modal',
            title: translate('workspace.rules.spendRules.maxAmountCurrencyMismatchTitle'),
            prompt: translate('workspace.rules.spendRules.maxAmountCurrencyMismatchPrompt'),
            confirmText: translate('workspace.rules.spendRules.reviewSelectedCards'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }

            Navigation.navigate(ROUTES.RULES_SPEND_CARD.getRoute(policyID, currentRuleID));
        });
    };

    const openCurrenciesCurrencyMismatchModal = () => {
        showConfirmModal({
            id: 'spend-rule-currencies-currency-mismatch-modal',
            title: translate('workspace.rules.spendRules.currenciesCurrencyMismatchTitle'),
            prompt: translate('workspace.rules.spendRules.currenciesCurrencyMismatchPrompt'),
            confirmText: translate('workspace.rules.spendRules.reviewSelectedCards'),
            cancelText: translate('common.cancel'),
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }

            Navigation.navigate(ROUTES.RULES_SPEND_CARD.getRoute(policyID, currentRuleID));
        });
    };

    const getCardsMenuTitle = (cardIDsToSummarize: string[] | undefined) => {
        const activeCardIDs = cardIDsToSummarize?.filter((id) => cardsList?.[id] !== undefined);
        return getTruncatedSpendRuleSummary(
            activeCardIDs?.map((id) => {
                const card = cardsList?.[id];
                if (card === undefined) {
                    return id;
                }
                const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
                const displayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails?.[accountID], defaultValue: '', shouldFallbackToHidden: false, translate});
                return getCardDescriptionForSearchTable(card, translate, displayName || undefined) || id;
            }),
            (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
        );
    };

    const getMerchantMenuTitle = (merchantNamesToSummarize: string[] | undefined) => {
        return getTruncatedSpendRuleSummary(merchantNamesToSummarize, (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}));
    };

    const getCategoryMenuTitle = (categoriesToSummarize: SpendRuleCategory[] | undefined) => {
        return getTruncatedSpendRuleSummary(
            categoriesToSummarize?.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`)),
            (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}),
        );
    };

    const cardsMenuTitle = getCardsMenuTitle(cardIDs);
    const categoriesMenuTitle = getCategoryMenuTitle(categories);
    const merchantsMenuTitle = getMerchantMenuTitle(merchantNames);
    const currenciesMenuTitle = currencies.length > 0 ? currencies.join(', ') : translate('workspace.rules.spendRules.allCurrencies');

    const hasSelectedCards = !!cardIDs?.length;
    const hasMaxAmount = maxAmount.trim() !== '';
    const hasAnyCurrency = currencies.length > 0;
    const hasAnyCategory = categories.length > 0 && !isRestrictMerchantsOff;
    const hasAnyMerchant = merchantNames.some((name) => name.trim() !== '') && !isRestrictMerchantsOff;
    const hasAnyRuleApplied = hasAnyMerchant || hasAnyCategory || hasMaxAmount || hasAnyCurrency;
    const errorMessage = getErrorMessage(hasSelectedCards, hasAnyRuleApplied, translate);

    const saveRule = () => {
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

        const updatedSpendRuleForm = {
            ...spendRuleForm,
            categories: !isRestrictMerchantsOff ? categories : [],
            merchantNames: !isRestrictMerchantsOff ? spendRuleForm.merchantNames : [],
            merchantMatchTypes: !isRestrictMerchantsOff ? spendRuleForm.merchantMatchTypes : [],
        };

        clearError();
        setExpensifyCardRule(domainAccountID, isEditingRule ? currentRuleID : rand64(), updatedSpendRuleForm, existingRule);
        clearDraftSpendRule();

        if (!isEditingRule && isRulesRevampEnabled) {
            Tab.setSelectedTab(CONST.TAB.RULES_TAB_TYPE, CONST.TAB.RULES.CARD_RESTRICTIONS);
            Navigation.goBack(ROUTES.WORKSPACE_RULES.getRoute(policyID));
            return;
        }

        Navigation.goBack();
    };

    const deleteRule = () => {
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
            Navigation.goBack();
        });
    };

    const setSpendRuleRestrictionType = (action: ValueOf<typeof CONST.SPEND_RULES.ACTION> | null) => {
        if (!canWriteSpendRules) {
            showReadOnlyModal();
            return;
        }

        clearError();

        if (action === null) {
            setIsRestrictMerchantsOff(true);
            return;
        }

        setIsRestrictMerchantsOff(false);
        updateDraftSpendRule({restrictionAction: action});
    };

    const chooseCards = () => {
        if (!canWriteSpendRules) {
            return;
        }

        clearError();
        Navigation.navigate(ROUTES.RULES_SPEND_CARD.getRoute(policyID, currentRuleID));
    };

    const chooseCurrencies = () => {
        if (!canWriteSpendRules) {
            return;
        }

        clearError();

        if (!selectedCurrency) {
            openCurrenciesCurrencyMismatchModal();
            return;
        }

        Navigation.navigate(ROUTES.RULES_SPEND_CURRENCIES.getRoute(policyID, currentRuleID));
    };

    const chooseMaxAmount = () => {
        if (!canWriteSpendRules) {
            return;
        }

        clearError();

        if (!selectedCurrency) {
            openMaxAmountCurrencyMismatchModal();
            return;
        }

        Navigation.navigate(ROUTES.RULES_SPEND_MAX_AMOUNT.getRoute(policyID, currentRuleID));
    };

    const chooseMerchants = () => {
        if (!canWriteSpendRules) {
            return;
        }

        clearError();
        Navigation.navigate(ROUTES.RULES_SPEND_MERCHANTS.getRoute(policyID, currentRuleID));
    };

    const chooseCategories = () => {
        if (!canWriteSpendRules) {
            return;
        }

        clearError();
        Navigation.navigate(ROUTES.RULES_SPEND_CATEGORY.getRoute(policyID, currentRuleID));
    };

    const isAllowRestriction = restrictionAction === CONST.SPEND_RULES.ACTION.ALLOW;
    const merchantsDescription = isAllowRestriction ? translate('workspace.rules.spendRules.allowedMerchants') : translate('workspace.rules.spendRules.blockedMerchants');
    const merchantTypeDescription = isAllowRestriction ? translate('workspace.rules.spendRules.allowedMerchantTypes') : translate('workspace.rules.spendRules.blockedMerchantTypes');

    if (isEditingRule && !existingRule) {
        return <NotFoundPage />;
    }

    if (!isEditingRule && !!policy && !canWriteSpendRules) {
        return <NotFoundPage />;
    }

    const getMenuItemIconProps = (icon: IconAsset) => ({
        icon,
        iconWidth: variables.iconSizeNormal,
        iconHeight: variables.iconSizeNormal,
        shouldIconUseAutoWidthStyle: true,
    });

    const handleRestrictionActionSelect = setSpendRuleRestrictionType;

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
        onPress: chooseCards,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.CreditCardHourglass : undefined,
    });

    const merchantMenuItem = renderEditableMenuItem({
        description: merchantsDescription,
        title: merchantsMenuTitle,
        onPress: chooseMerchants,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.Basket : undefined,
    });

    const categoryMenuItem = renderEditableMenuItem({
        description: merchantTypeDescription,
        title: categoriesMenuTitle,
        onPress: chooseCategories,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.Basket : undefined,
    });

    const maxAmountMenuItem = renderEditableMenuItem({
        description: translate('workspace.rules.spendRules.maxAmount'),
        title: isRulesRevampEnabled && maxAmountMenuTitle ? translate('workspace.rules.spendRules.maxAmountAbove', {amount: maxAmountMenuTitle}) : maxAmountMenuTitle,
        onPress: chooseMaxAmount,
        sentryLabel: isRulesRevampEnabled ? spendRuleSectionSentryLabel : merchantRuleSectionSentryLabel,
        icon: isRulesRevampEnabled ? icons.CoinsButton : undefined,
    });

    const currenciesMenuItem = renderEditableMenuItem({
        description: translate('workspace.rules.spendRules.permittedCurrencies'),
        title: currenciesMenuTitle,
        onPress: chooseCurrencies,
        sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.RULES.CURRENCY_SELECTOR,
        icon: isRulesRevampEnabled ? icons.MoneyCircle : undefined,
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
            {currenciesMenuItem}
            {maxAmountMenuItem}
            <View style={[styles.ph5, styles.pv3]}>
                <SpendRuleRestrictionTypeToggleRevamp
                    restrictionAction={!isRestrictMerchantsOff ? restrictionAction : null}
                    onSelect={handleRestrictionActionSelect}
                />
            </View>
            {!isRestrictMerchantsOff && (
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
            <MenuItemWithTopDescription
                numberOfLinesTitle={2}
                title={cardsMenuTitle}
                titleStyle={styles.flex1}
                interactive={canWriteSpendRules}
                shouldShowRightIcon={canWriteSpendRules}
                description={translate('workspace.rules.spendRules.chooseCards')}
                sentryLabel={merchantRuleSectionSentryLabel}
                onPress={chooseCards}
            />
            <Text style={[styles.textStrong, styles.ph5, styles.mt5, styles.pv2]}>{translate('workspace.rules.spendRules.spendRuleSectionTitle')}</Text>
            {currenciesMenuItem}
            {maxAmountMenuItem}

            <View style={[styles.ph5, styles.pv3]}>
                <SpendRuleRestrictionTypeToggle
                    restrictionAction={!isRestrictMerchantsOff ? restrictionAction : null}
                    onSelect={setSpendRuleRestrictionType}
                />
            </View>
            {!isRestrictMerchantsOff && (
                <>
                    <MenuItemWithTopDescription
                        numberOfLinesTitle={2}
                        titleStyle={styles.flex1}
                        title={merchantsMenuTitle}
                        description={merchantsDescription}
                        interactive={canWriteSpendRules}
                        shouldShowRightIcon={canWriteSpendRules}
                        sentryLabel={merchantRuleSectionSentryLabel}
                        onPress={chooseMerchants}
                    />
                    <MenuItemWithTopDescription
                        numberOfLinesTitle={2}
                        titleStyle={styles.flex1}
                        title={categoriesMenuTitle}
                        description={merchantTypeDescription}
                        interactive={canWriteSpendRules}
                        shouldShowRightIcon={canWriteSpendRules}
                        sentryLabel={merchantRuleSectionSentryLabel}
                        onPress={chooseCategories}
                    />
                </>
            )}
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
                shouldEnableKeyboardAvoidingView={false}
            >
                <HeaderWithBackButton title={translate(isRulesRevampEnabled ? 'workspace.rules.spendRules.restrictCardSpendTitle' : titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>{isRulesRevampEnabled ? revampFormContent : legacyFormContent}</ScrollView>
                {canWriteSpendRules && (
                    <FormAlertWithSubmitButton
                        buttonText={translate('workspace.rules.spendRules.saveRule')}
                        containerStyles={[styles.m4, styles.mb5]}
                        message={errorMessage}
                        isAlertVisible={isErrorVisible}
                        onSubmit={saveRule}
                        enabledWhenOffline
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_SAVE}
                        shouldRenderFooterAboveSubmit
                        footerContent={
                            isEditingRule ? (
                                <Button
                                    text={translate('workspace.rules.spendRules.deleteRule')}
                                    onPress={deleteRule}
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
