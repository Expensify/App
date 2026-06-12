import type {NavigationProp} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCanWriteCardSpendRules from '@hooks/useCanWriteCardSpendRules';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';
import {deleteExpensifyCardRule, setExpensifyCardRule} from '@libs/actions/Card';
import {clearDraftSpendRule, setDraftSpendRule, updateDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards, getCardDescriptionForSearchTable, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {rand64} from '@libs/NumberUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getSpendRuleFormValuesFromCardRule, getTruncatedSpendRuleSummary} from '@libs/SpendRulesUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import SpendRuleRestrictionTypeToggle from '@src/components/SpendRules/SpendRuleRestrictionTypeToggle';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {SpendRuleCategory} from '@src/types/form/SpendRuleForm';

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
    const domainAccountID = useDefaultFundID(policyID);
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${domainAccountID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const currentRuleID = ruleID ?? ROUTES.NEW;
    const isNewRule = currentRuleID === ROUTES.NEW;
    const isEditingRule = currentRuleID !== ROUTES.NEW;
    const existingRule = isEditingRule ? expensifyCardSettings?.cardRules?.[currentRuleID] : undefined;
    const existingFormValues = getSpendRuleFormValuesFromCardRule(existingRule);

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

    const openMaxAmountCurrencyMismatchModal = async () => {
        const result = await showConfirmModal({
            title: translate('workspace.rules.spendRules.maxAmountCurrencyMismatchTitle'),
            prompt: translate('workspace.rules.spendRules.maxAmountCurrencyMismatchPrompt'),
            confirmText: translate('workspace.rules.spendRules.reviewSelectedCards'),
            cancelText: translate('common.cancel'),
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CARD, {policyID, ruleID: currentRuleID});
    };

    const openCurrenciesCurrencyMismatchModal = async () => {
        const result = await showConfirmModal({
            title: translate('workspace.rules.spendRules.currenciesCurrencyMismatchTitle'),
            prompt: translate('workspace.rules.spendRules.currenciesCurrencyMismatchPrompt'),
            confirmText: translate('workspace.rules.spendRules.reviewSelectedCards'),
            cancelText: translate('common.cancel'),
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CARD, {policyID, ruleID: currentRuleID});
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
                const displayName = getDisplayNameOrDefault(personalDetails?.[accountID], '', false);
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

        // If the merchant restriction toggle is off, we need to ensure the merchant restrictions are removed
        // from the rule
        const updatedSpendRuleForm = {
            ...spendRuleForm,
            categories: !isRestrictMerchantsOff ? categories : [],
            merchantNames: !isRestrictMerchantsOff ? spendRuleForm.merchantNames : [],
            merchantMatchTypes: !isRestrictMerchantsOff ? spendRuleForm.merchantMatchTypes : [],
        };

        clearError();
        setExpensifyCardRule(domainAccountID, isEditingRule ? currentRuleID : rand64(), updatedSpendRuleForm, existingRule);
        clearDraftSpendRule();
        navigation.goBack();
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

    const handleSpendRuleRestrictionTypeChange = (action: ValueOf<typeof CONST.SPEND_RULES.ACTION> | null) => {
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

    const merchantsDescription =
        restrictionAction === CONST.SPEND_RULES.ACTION.ALLOW ? translate('workspace.rules.spendRules.allowedMerchants') : translate('workspace.rules.spendRules.blockedMerchants');
    const merchantTypeDescription =
        restrictionAction === CONST.SPEND_RULES.ACTION.ALLOW ? translate('workspace.rules.spendRules.allowedMerchantTypes') : translate('workspace.rules.spendRules.blockedMerchantTypes');

    if (isEditingRule && !existingRule) {
        return <NotFoundPage />;
    }

    if (!isEditingRule && !!policy && !canWriteSpendRules) {
        return <NotFoundPage />;
    }

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
                <HeaderWithBackButton title={translate(titleKey)} />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <Text style={[styles.textStrong, styles.ph5, styles.pv2]}>{translate('workspace.rules.spendRules.cardsSectionTitle')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.spendRules.chooseCards')}
                        onPress={
                            canWriteSpendRules
                                ? () => {
                                      clearError();
                                      navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CARD, {policyID, ruleID: currentRuleID});
                                  }
                                : undefined
                        }
                        shouldShowRightIcon={canWriteSpendRules}
                        interactive={canWriteSpendRules}
                        title={cardsMenuTitle}
                        numberOfLinesTitle={2}
                        titleStyle={styles.flex1}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                    />
                    <Text style={[styles.textStrong, styles.ph5, styles.mt5, styles.pv2]}>{translate('workspace.rules.spendRules.spendRuleSectionTitle')}</Text>
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.spendRules.permittedCurrencies')}
                        onPress={() => {
                            clearError();

                            if (!selectedCurrency) {
                                openCurrenciesCurrencyMismatchModal();
                                return;
                            }

                            navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CURRENCIES, {policyID, ruleID: currentRuleID});
                        }}
                        shouldShowRightIcon
                        title={currenciesMenuTitle}
                        titleStyle={styles.flex1}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.CURRENCY_SELECTOR}
                    />
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.spendRules.maxAmount')}
                        shouldShowRightIcon
                        title={maxAmountMenuTitle}
                        titleStyle={styles.flex1}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                        onPress={() => {
                            clearError();

                            if (!selectedCurrency) {
                                openMaxAmountCurrencyMismatchModal();
                                return;
                            }

                            navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_MAX_AMOUNT, {policyID, ruleID: currentRuleID});
                        }}
                    />

                    <View style={[styles.ph5, styles.pv3]}>
                        <SpendRuleRestrictionTypeToggle
                            restrictionAction={!isRestrictMerchantsOff ? restrictionAction : null}
                            onSelect={handleSpendRuleRestrictionTypeChange}
                        />
                    </View>
                    {!isRestrictMerchantsOff && (
                        <>
                            <MenuItemWithTopDescription
                                description={merchantsDescription}
                                onPress={
                                    canWriteSpendRules
                                        ? () => {
                                              clearError();
                                              navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_MERCHANTS, {policyID, ruleID: currentRuleID});
                                          }
                                        : undefined
                                }
                                shouldShowRightIcon={canWriteSpendRules}
                                interactive={canWriteSpendRules}
                                title={merchantsMenuTitle}
                                numberOfLinesTitle={2}
                                titleStyle={styles.flex1}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                            />
                            <MenuItemWithTopDescription
                                description={merchantTypeDescription}
                                onPress={
                                    canWriteSpendRules
                                        ? () => {
                                              clearError();
                                              navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_CATEGORY, {policyID, ruleID: currentRuleID});
                                          }
                                        : undefined
                                }
                                shouldShowRightIcon={canWriteSpendRules}
                                interactive={canWriteSpendRules}
                                title={categoriesMenuTitle}
                                numberOfLinesTitle={2}
                                titleStyle={styles.flex1}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                            />
                        </>
                    )}
                </ScrollView>
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
                            isEditingRule ? (
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
