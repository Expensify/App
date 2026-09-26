import AmountForm from '@components/AmountForm';
import CurrencyPicker from '@components/CurrencyPicker';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type AmountWithCurrencyAdapterProps = {
    /** Amount supplied by the FormProvider */
    value?: string;

    /** Callback to update the amount, or the currency when `key` is the currency key */
    onInputChange?: (value: string, key?: string) => void;

    errorText?: string;

    label?: string;

    /** Currently chosen currency code */
    currency: string;

    /** Form key the chosen currency is written to */
    currencyKey: string;
};

/** An amount whose currency the user can change; the currency lands on a sibling form key so the schema can name it */
function AmountWithCurrencyAdapter({value, onInputChange = () => {}, errorText, label, currency, currencyKey}: AmountWithCurrencyAdapterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <View style={[styles.mhn5, styles.mb2]}>
                <CurrencyPicker
                    label={translate('common.currency')}
                    value={currency}
                    onInputChange={(chosenCurrency) => onInputChange(chosenCurrency, currencyKey)}
                />
            </View>
            <AmountForm
                value={value}
                currency={currency}
                label={label}
                errorText={errorText}
                onInputChange={(amount) => onInputChange(amount)}
                displayAsTextInput
                isCurrencyPressable={false}
            />
        </>
    );
}

export default AmountWithCurrencyAdapter;
