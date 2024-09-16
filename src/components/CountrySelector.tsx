import {useIsFocused} from '@react-navigation/native';
import React, {forwardRef, useEffect, useRef} from 'react';
import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
import useGeographicalStateAndCountryFromRoute from '@hooks/useGeographicalStateAndCountryFromRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type CountrySelectorProps = {
    /** Form error text. e.g when no country is selected */
    errorText?: string;

    /** Callback called when the country changes. */
    onInputChange?: (value?: string) => void;

    /** Current selected country  */
    value?: Country | '';

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;
};

function CountrySelector({errorText = '', value: countryCode, onInputChange = () => {}, onBlur}: CountrySelectorProps, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {country: countryFromUrl} = useGeographicalStateAndCountryFromRoute();

    const title = countryCode ? translate(`allCountries.${countryCode}`) : '';
    const countryTitleDescStyle = title.length === 0 ? styles.textNormal : null;

    const didOpenContrySelector = useRef(false);
    const isFocused = useIsFocused();
    useEffect(() => {
        // Check if the country selector was opened and no value was selected, triggering onBlur to display an error
        if (isFocused && didOpenContrySelector.current) {
            didOpenContrySelector.current = false;
            if (!countryFromUrl) {
                onBlur?.();
            }
        }

        // If no country is selected from the URL, exit the effect early to avoid further processing.
        if (!countryFromUrl) {
            return;
        }

        // If a country is selected, invoke `onInputChange` to update the form and clear any validation errors related to the country selection.
        if (onInputChange) {
            onInputChange(countryFromUrl);
        }

        // Clears the `country` parameter from the URL to ensure the component country is driven by the parent component rather than URL parameters.
        // This helps prevent issues where the component might not update correctly if the country is controlled by both the parent and the URL.
        Navigation.setParams({country: undefined});

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [countryFromUrl, isFocused, onBlur]);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={title}
            ref={ref}
            descriptionTextStyle={countryTitleDescStyle}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            description={translate('common.country')}
            errorText={errorText}
            onPress={() => {
                const activeRoute = Navigation.getActiveRoute();
                didOpenContrySelector.current = true;
                Navigation.navigate(ROUTES.SETTINGS_ADDRESS_COUNTRY.getRoute(countryCode ?? '', activeRoute));
            }}
        />
    );
}

CountrySelector.displayName = 'CountrySelector';

export default forwardRef(CountrySelector);
