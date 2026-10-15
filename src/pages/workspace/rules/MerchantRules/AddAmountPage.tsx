import AmountForm from '@components/AmountForm';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

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

import React, {useState} from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_AMOUNT | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_AMOUNT>;

function AddAmountPage({route}: AddAmountPageProps) {
    const {policyID, ruleID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const policy = usePolicy(policyID);
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_MERCHANT_AMOUNT_FROM_EXPENSE.path, policyID, ruleID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;
    // The draft holds whole cents. The input works in whole currency, so it is converted on the way in and back out.
    const [amount, setAmount] = useState(() => (form?.amount ? convertToFrontendAmountAsString(Number(form.amount), getCurrencyDecimals(currency)) : ''));

    const goBack = () => Navigation.goBack(backToRoute);

    const onSave = () => {
        updateDraftMerchantRule({amount: amount ? String(convertToBackendAmount(Number(amount))) : ''});
        Navigation.goBack(backToRoute, {shouldSkipFocusRestore: true});
    };

    return (
        <ScreenWrapper
            testID="AddAmountPage"
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButtonAndTitle
                title={translate('iou.amount')}
                onBackButtonPress={goBack}
            />
            <View style={[styles.flexGrow1, styles.mh5]}>
                <AmountForm
                    value={amount}
                    onInputChange={setAmount}
                    currency={currency}
                    isCurrencyPressable={false}
                    displayAsTextInput
                />
            </View>
            <FormAlertWithSubmitButton
                buttonText={translate('common.save')}
                isAlertVisible={false}
                onSubmit={onSave}
                enabledWhenOffline
                containerStyles={[styles.mh5, styles.mb5]}
            />
        </ScreenWrapper>
    );
}

export default AddAmountPage;
