// Reuses money-request amount entry and currency selection without requiring a filter currency.
import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {SearchAmountFilterKeys} from '@components/Search/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';

import {getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import getAmountInputKeyboard from '@libs/getAmountInputKeyboard';
import {supportsAmountFilterCurrency} from '@libs/SearchAmountFilterUtils';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

type AmountFilterInputProps = {
    ref?: ForwardedRef<BaseTextInputRef>;
    baseFilterKey: SearchAmountFilterKeys;
    amount: string;
    currency?: string;
    label: string;
    name?: string;
    autoFocus?: boolean;
    containerStyles?: StyleProp<ViewStyle>;
    onAmountChange: (amount: string) => void;
    onCurrencyChange: (currency: string) => void;
};

function AmountFilterInput({ref, baseFilterKey, amount, currency, label, name, autoFocus, containerStyles, onAmountChange, onCurrencyChange}: AmountFilterInputProps) {
    const {translate, preferredLocale} = useLocalize();
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
    const [initialAmount] = useState(amount);

    if (!supportsAmountFilterCurrency(baseFilterKey)) {
        return (
            <AmountWithoutCurrencyInput
                ref={ref}
                containerStyles={containerStyles}
                defaultValue={initialAmount}
                onInputChange={onAmountChange}
                label={label}
                accessibilityLabel={label}
                name={name}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.DECIMAL}
                shouldAllowNegative
                autoFocus={autoFocus}
            />
        );
    }

    const hideCurrencyPicker = () => setIsCurrencyPickerVisible(false);
    const {keyboardType} = getAmountInputKeyboard(true);

    return (
        <View style={containerStyles}>
            <NumberWithSymbolForm
                ref={ref}
                displayAsTextInput
                value={amount}
                currency={currency}
                symbol={currency ? (getLocalizedCurrencySymbol(preferredLocale, currency) ?? '') : ''}
                hideSymbol={!currency}
                decimals={CONST.DEFAULT_CURRENCY_DECIMALS}
                label={label}
                testID={name}
                onInputChange={onAmountChange}
                allowNegativeInput
                keyboardType={keyboardType}
                shouldShowCurrencyButton
                currencyButtonLabel={currency || translate('common.any')}
                currencyButtonAccessibilityLabel={[label, translate('common.selectCurrency'), currency || translate('common.anyCurrency')].join(', ')}
                onCurrencyButtonPress={() => setIsCurrencyPickerVisible(true)}
                shouldShowBigNumberPad={false}
                shouldUseBorderlessButtons
                autoFocus={autoFocus}
            />
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={hideCurrencyPicker}
                headerText={translate('common.selectCurrency')}
                value={currency}
                onInputChange={onCurrencyChange}
                shouldAllowEmptySelection
            />
        </View>
    );
}

export default AmountFilterInput;
