import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setExpensifyCardRule} from '@libs/actions/Card';
import {clearDraftSpendRule, updateDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards, getCardDescriptionForSearchTable, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SpendRuleRestrictionTypeToggle from './SpendRuleRestrictionTypeToggle';
import getTruncatedSpendRuleSummary from './SpendRuleSummaryUtils';

type SpendRulePageBaseProps = {
    policyID: string;
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

function SpendRulePageBase({policyID, titleKey, testID}: SpendRulePageBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const domainAccountID = useDefaultFundID(policyID);
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    useEffect(() => () => clearDraftSpendRule(), []);

    const cardIDs = spendRuleForm?.cardIDs;
    const restrictionAction = spendRuleForm?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;
    const merchantNames = spendRuleForm?.merchantNames ?? [];
    const categories = spendRuleForm?.categories ?? [];
    const maxAmount = spendRuleForm?.maxAmount ?? '';

    const clearError = () => {
        setIsErrorVisible(false);
    };

    const cardsMenuTitle = !cardIDs?.length
        ? ''
        : cardIDs
              .map((id) => {
                  const card = cardsList?.[id];
                  if (card === undefined) {
                      return id;
                  }
                  const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
                  const displayName = getDisplayNameOrDefault(personalDetails?.[accountID], '', false);
                  return getCardDescriptionForSearchTable(card, displayName || undefined) || id;
              })
              .join(', ');

    const categoriesMenuTitle = categories.map((category) => translate(`workspace.rules.spendRules.categoryOptions.${category}`)).join(', ');

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
        Navigation.navigate(ROUTES.RULES_SPEND_CARD.getRoute(policyID));
    };

    function getMerchantMenuTitle(merchantNamesToSummarize: string[] | undefined): string {
        return getTruncatedSpendRuleSummary(merchantNamesToSummarize, (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}));
    }

    const hasSelectedCards = !!cardIDs?.length;
    const hasAnyMerchant = merchantNames.some((name) => name.trim() !== '');
    const hasAnyCategory = categories.length > 0;
    const hasMaxAmount = maxAmount.trim() !== '';
    const hasAnyRuleApplied = hasAnyMerchant || hasAnyCategory || hasMaxAmount;
    const errorMessage = getErrorMessage(hasSelectedCards, hasAnyRuleApplied, translate);

    const handleSaveRule = () => {
        if (errorMessage) {
            setIsErrorVisible(true);
            return;
        }

        if (!cardIDs) {
            return;
        }

        clearError();
        setExpensifyCardRule(domainAccountID, rand64(), spendRuleForm);
        clearDraftSpendRule();
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
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
                        onPress={() => {
                            clearError();
                            Navigation.navigate(ROUTES.RULES_SPEND_CARD.getRoute(policyID));
                        }}
                        shouldShowRightIcon
                        title={cardsMenuTitle}
                        titleStyle={styles.flex1}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                    />
                    <Text style={[styles.textStrong, styles.ph5, styles.mt5]}>{translate('workspace.rules.spendRules.spendRuleSectionTitle')}</Text>
                    <View style={[styles.ph5, styles.pv3]}>
                        <SpendRuleRestrictionTypeToggle
                            restrictionAction={restrictionAction}
                            onSelect={(action) => {
                                clearError();
                                updateDraftSpendRule({restrictionAction: action});
                            }}
                        />
                    </View>
                    <MenuItemWithTopDescription
                        description={translate('common.merchant')}
                        onPress={() => {
                            clearError();
                            Navigation.navigate(ROUTES.RULES_SPEND_MERCHANTS.getRoute(policyID));
                        }}
                        shouldShowRightIcon
                        title={getMerchantMenuTitle(spendRuleForm?.merchantNames)}
                        numberOfLinesTitle={2}
                        titleStyle={styles.flex1}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                    />
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.spendRules.spendCategory')}
                        onPress={() => {
                            clearError();
                            Navigation.navigate(ROUTES.RULES_SPEND_CATEGORY.getRoute(policyID));
                        }}
                        shouldShowRightIcon
                        title={categoriesMenuTitle}
                        numberOfLinesTitle={2}
                        titleStyle={styles.flex1}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                    />
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.spendRules.maxAmount')}
                        onPress={() => {
                            clearError();
                            if (!selectedCurrency) {
                                openCurrencyMismatchModal();
                                return;
                            }
                            Navigation.navigate(ROUTES.RULES_SPEND_MAX_AMOUNT.getRoute(policyID));
                        }}
                        shouldShowRightIcon
                        title={maxAmountMenuTitle}
                        titleStyle={styles.flex1}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_SECTION_ITEM}
                    />
                </ScrollView>
                <FormAlertWithSubmitButton
                    buttonText={translate('workspace.rules.spendRules.saveRule')}
                    containerStyles={[styles.m4, styles.mb5]}
                    message={errorMessage}
                    isAlertVisible={isErrorVisible}
                    onSubmit={handleSaveRule}
                    enabledWhenOffline
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.SPEND_RULE_SAVE}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SpendRulePageBase.displayName = 'SpendRulePageBase';

export default SpendRulePageBase;
