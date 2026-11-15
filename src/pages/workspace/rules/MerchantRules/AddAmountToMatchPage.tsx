import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';
import AmountFilterInput from '@components/Search/FilterComponents/AmountFilterInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {formatAmountFilterValue, getAmountFilterInputValue} from '@libs/SearchAmountFilterUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useState} from 'react';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddAmountToMatchPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_AMOUNT_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_AMOUNT_TO_MATCH
>;

function AddAmountToMatchPage({route}: AddAmountToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {isEditing, backToRoute, getRuleRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_AMOUNT_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const savedValue = getAmountFilterInputValue(form?.amountToMatch);
    const [amount, setAmount] = useState(savedValue.amount);
    // An operand saved without a comparison currency matches in whatever currency the expense carries, so a saved
    // rule keeps that as Any rather than being silently pinned to the workspace currency when it is reopened.
    const [currency, setCurrency] = useState(form?.amountToMatch ? (savedValue.currency ?? '') : (policy?.outputCurrency ?? CONST.CURRENCY.USD));
    const amountMatchType = form?.amountMatchType ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;

    const getAmountMatchTypeLabel = () => {
        if (amountMatchType === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN) {
            return translate('workspace.rules.merchantRules.amountMatchTypeGreaterThan');
        }
        if (amountMatchType === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN) {
            return translate('workspace.rules.merchantRules.amountMatchTypeLessThan');
        }
        return translate('workspace.rules.merchantRules.amountMatchTypeEqualTo');
    };

    const goBack = () => Navigation.goBack(backToRoute);

    const onSubmit = () => {
        updateDraftMerchantRule({amountToMatch: formatAmountFilterValue(amount, currency || undefined)});
        goBack();
    };

    return (
        <ScreenWrapper
            testID="AddAmountToMatchPage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('iou.amount')}
                onBackButtonPress={goBack}
            />
            <FormProvider
                style={[styles.flex1]}
                formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
                submitButtonStyles={[styles.ph5]}
            >
                <AmountFilterInput
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT}
                    containerStyles={[styles.mb5, styles.ph5]}
                    amount={amount}
                    currency={currency}
                    label={translate('iou.amount')}
                    onAmountChange={setAmount}
                    onCurrencyChange={setCurrency}
                    autoFocus
                />
                <MenuItemField
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_AMOUNT_MATCH_TYPE}
                    name={translate('workspace.rules.merchantRules.matchType')}
                    onPress={() =>
                        Navigation.navigate(
                            getRuleRoute(DYNAMIC_ROUTES.RULES_AMOUNT_MATCH_TYPE_FROM_EXPENSE.path, ROUTES.RULES_AMOUNT_MATCH_TYPE.getRoute(policyID, isEditing ? ruleID : undefined)),
                        )
                    }
                    value={getAmountMatchTypeLabel()}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

export default AddAmountToMatchPage;
