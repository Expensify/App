import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
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
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import MERCHANT_RULE_INPUT_IDS from '@src/types/form/MerchantRuleForm';

import React from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_AMOUNT | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_AMOUNT>;

function AddAmountPage({route}: AddAmountPageProps) {
    const {policyID, ruleID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const policy = usePolicy(policyID);
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_AMOUNT_FROM_EXPENSE.path, policyID, ruleID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    // The rule stores whole cents and the input works in whole currency, so the two are converted at this boundary.
    const defaultValue = form?.amount ? convertToFrontendAmountAsString(Number(form.amount), getCurrencyDecimals(currency)) : '';

    const goBack = () => Navigation.goBack(backToRoute);

    const onSubmit = ({amount}: FormOnyxValues<typeof ONYXKEYS.FORMS.MERCHANT_RULE_FORM>) => {
        const amountInCents = amount ? convertToBackendAmount(Number(amount)) : 0;
        updateDraftMerchantRule({amount: amountInCents ? String(amountInCents) : ''});
        goBack();
    };

    return (
        <ScreenWrapper
            testID="AddAmountPage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('iou.amount')}
                onBackButtonPress={goBack}
            />
            <FormProvider
                style={[styles.flex1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MERCHANT_RULE_FORM}
                onSubmit={onSubmit}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb5}>
                    <InputWrapper
                        InputComponent={AmountForm}
                        inputID={MERCHANT_RULE_INPUT_IDS.AMOUNT}
                        label={translate('iou.amount')}
                        currency={currency}
                        defaultValue={defaultValue}
                        isCurrencyPressable={false}
                        ref={inputCallbackRef}
                        displayAsTextInput
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default AddAmountPage;
