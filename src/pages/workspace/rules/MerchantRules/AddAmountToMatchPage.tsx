import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';
import AmountFilterInput from '@components/Search/FilterComponents/AmountFilterInput';
import Text from '@components/Text';
import isTextInputRef from '@components/TextInput/BaseTextInput/isTextInputRef';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFlagForReviewRuleAmountError} from '@libs/FlagForReviewRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {formatAmountFilterValue, getAmountFilterInputValue} from '@libs/SearchAmountFilterUtils';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';

import {getMatchTypeLabel} from './matchTypeOptions';
import useMatchTypeDiscard from './useMatchTypeDiscard';
import useRuleConditionDraft from './useRuleConditionDraft';
import withFlagRuleConditionAccess from './withFlagRuleConditionAccess';

type AddAmountToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_AMOUNT_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_AMOUNT_TO_MATCH
>;

function AddAmountToMatchPage({route}: AddAmountToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const flagCondition = 'flagCondition' in route.params ? route.params.flagCondition : undefined;
    const {isEditing, backToRoute, getRuleRoute, form, formID, updateDraft, isFlagRule} = useRuleConditionDraft(
        DYNAMIC_ROUTES.RULES_AMOUNT_TO_MATCH_FROM_EXPENSE.path,
        policyID,
        ruleID,
        flagCondition,
    );
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const policy = usePolicy(policyID);

    const isDailyBudget = flagCondition === CONST.RULES.DAILY_BUDGET_FILTER;
    const dailyBudgetToMatch = form && 'dailyBudgetToMatch' in form ? form.dailyBudgetToMatch : undefined;
    const operand = isDailyBudget ? dailyBudgetToMatch : form?.amountToMatch;
    const savedValue = getAmountFilterInputValue(operand);
    const [amount, setAmount] = useState(savedValue.amount);
    // An operand saved without a comparison currency matches in whatever currency the expense carries, so a saved
    // rule keeps that as Any rather than being silently pinned to the workspace currency when it is reopened.
    const [currency, setCurrency] = useState(operand ? (savedValue.currency ?? '') : (policy?.outputCurrency ?? CONST.CURRENCY.USD));
    const [hasInvalidAmount, setHasInvalidAmount] = useState(false);

    const amountMatchType = form && 'amountMatchType' in form ? form.amountMatchType : undefined;
    const keepMatchType = useMatchTypeDiscard('amountMatchType', amountMatchType, updateDraft, !isFlagRule);

    const goBack = () => Navigation.goBack(backToRoute);

    const onSubmit = () => {
        // An empty field clears the condition, so a value that is not a number has to be rejected rather than
        // formatted away, or saving a lone minus sign would widen the rule to every amount.
        const trimmedAmount = amount.trim();
        const isInvalidFlagAmount = isFlagRule && (!currency || !!getFlagForReviewRuleAmountError(trimmedAmount, translate));
        if (trimmedAmount && (!Number.isFinite(Number(trimmedAmount)) || isInvalidFlagAmount)) {
            setHasInvalidAmount(true);
            return;
        }
        keepMatchType();
        const amountToMatch = formatAmountFilterValue(amount, currency || undefined);
        updateDraft(isDailyBudget ? {dailyBudgetToMatch: amountToMatch} : {amountToMatch});
        goBack();
    };

    const title = translate(isDailyBudget ? 'workspace.rules.flagForReviewRule.dailyBudget' : 'iou.amount');
    return (
        <ScreenWrapper
            testID="AddAmountToMatchPage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={title}
                onBackButtonPress={goBack}
            />
            <FormProvider
                style={[styles.flex1]}
                formID={formID}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                shouldUseScrollView={isDailyBudget}
                submitButtonStyles={[styles.ph5]}
            >
                {isDailyBudget && <Text style={[styles.ph5, styles.pb4, styles.textSupporting]}>{translate('workspace.rules.flagForReviewRule.dailyBudgetDescription')}</Text>}
                <AmountFilterInput
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                    containerStyles={[styles.mb5, styles.ph5]}
                    amount={amount}
                    currency={currency}
                    label={title}
                    errorText={hasInvalidAmount ? translate('common.error.invalidAmount') : undefined}
                    onAmountChange={(newAmount) => {
                        setHasInvalidAmount(false);
                        setAmount(newAmount);
                    }}
                    onCurrencyChange={setCurrency}
                    shouldRequireCurrency={isFlagRule}
                    ref={(ref) => inputCallbackRef(isTextInputRef(ref) ? ref : null)}
                />
                {!isFlagRule && (
                    <MenuItemField
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_AMOUNT_MATCH_TYPE}
                        name={translate('workspace.rules.merchantRules.matchType')}
                        onPress={() =>
                            Navigation.navigate(
                                getRuleRoute(DYNAMIC_ROUTES.RULES_AMOUNT_MATCH_TYPE_FROM_EXPENSE.path, ROUTES.RULES_AMOUNT_MATCH_TYPE.getRoute(policyID, isEditing ? ruleID : undefined)),
                            )
                        }
                        value={getMatchTypeLabel('amountMatchType', amountMatchType, translate)}
                    />
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

export default withFlagRuleConditionAccess(AddAmountToMatchPage);
