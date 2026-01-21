import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useEffect, useRef} from 'react';
import type {View} from 'react-native';
import useCurrencyList from '@hooks/useCurrencyList';
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
    onInputChange?: (value?: string, key?: string) => void;

    /** Current selected currency  */
    value?: string;

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;

    /** object to get route details from */
    currencySelectorRoute?: typeof ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY | typeof ROUTES.SETTINGS_CHANGE_CURRENCY | typeof ROUTES.CURRENCY_SELECTION;

    /** Label for the input */
    label?: string;

    /** Whether to show currency symbol in the title */
    shouldShowCurrencySymbol?: boolean;

    /** Reference to the outer element */
    ref: ForwardedRef<View>;
};

function CurrencySelector({
    errorText = '',
    value: currency,
    onInputChange = () => {},
    onBlur,
    currencySelectorRoute = ROUTES.SETTINGS_CHANGE_CURRENCY,
    label,
    shouldShowCurrencySymbol = false,
    ref,
}: CurrencySelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyList();

    const currencyTitleDescStyle = currency && !shouldShowCurrencySymbol ? styles.textNormal : null;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency]);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={shouldShowCurrencySymbol && currency ? `${currency} - ${getCurrencySymbol(currency)}` : currency}
            ref={ref}
            descriptionTextStyle={currencyTitleDescStyle}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            description={label ?? translate('common.currency')}
            errorText={errorText}
            onPress={() => {
                didOpenCurrencySelector.current = true;
                if (currencySelectorRoute === ROUTES.CURRENCY_SELECTION) {
                    Navigation.navigate(currencySelectorRoute.getRoute(Navigation.getActiveRoute()));
                } else {
                    Navigation.navigate(currencySelectorRoute as typeof ROUTES.SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY | typeof ROUTES.SETTINGS_CHANGE_CURRENCY);
                }
            }}
        />
    );
}

export default CurrencySelector;
