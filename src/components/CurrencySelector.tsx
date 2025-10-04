import {useIsFocused} from '@react-navigation/native';
import React, {forwardRef, useEffect, useRef} from 'react';
import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type CurrencySelectorProps = {
    /** Form error text. e.g when no currency is selected */
    errorText?: string;

    /** Callback called when the currency changes. */
    onInputChange?: (value?: string) => void;

    /** Current selected currency  */
    value?: ValueOf<typeof CONST.CURRENCY>;

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;

    /** object to get route details from */
    currencySelectorRoute?: typeof ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY | typeof ROUTES.SETTINGS_CHANGE_CURRENCY;
};

function CurrencySelector(
    {errorText = '', value: currency, onInputChange = () => {}, onBlur, currencySelectorRoute = ROUTES.SETTINGS_CHANGE_CURRENCY}: CurrencySelectorProps,
    ref: ForwardedRef<View>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const currencyTitleDescStyle = currency ? styles.textNormal : null;

    const didOpenCurrencySelector = useRef(false);
    const isFocused = useIsFocused();
    useEffect(() => {
        if (!isFocused || !didOpenCurrencySelector.current) {
            return;
        }
        didOpenCurrencySelector.current = false;
        onBlur?.();
    }, [isFocused, onBlur]);

    useEffect(() => {
        // This will cause the form to revalidate and remove any error related to currency
        onInputChange(currency);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [currency]);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={currency}
            ref={ref}
            descriptionTextStyle={currencyTitleDescStyle}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            description={translate('common.currency')}
            errorText={errorText}
            onPress={() => {
                didOpenCurrencySelector.current = true;
                Navigation.navigate(currencySelectorRoute);
            }}
        />
    );
}

CurrencySelector.displayName = 'CurrencySelector';

export default forwardRef(CurrencySelector);
