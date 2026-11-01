import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';
import {View} from 'react-native';

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
    const {inputCallbackRef} = useAutoFocusInput();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    // The rule stores whole cents and the input works in whole currency, so the two are converted at this boundary.
    const defaultValue = form?.amountToMatch ? convertToFrontendAmountAsString(Number(form.amountToMatch), getCurrencyDecimals(currency)) : '';
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

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        const amount = values[MERCHANT_RULE_INPUT_IDS.AMOUNT_TO_MATCH];
        const amountInCents = amount ? convertToBackendAmount(Number(amount)) : 0;
        updateDraftMerchantRule({amountToMatch: amountInCents ? String(amountInCents) : ''});
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
                <View style={[styles.mb5, styles.ph5]}>
                    <InputWrapper
                        InputComponent={AmountForm}
                        inputID={MERCHANT_RULE_INPUT_IDS.AMOUNT_TO_MATCH}
                        label={translate('iou.amount')}
                        currency={currency}
                        defaultValue={defaultValue}
                        isCurrencyPressable={false}
                        ref={inputCallbackRef}
                        displayAsTextInput
                    />
                </View>
                <MenuItemField
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
