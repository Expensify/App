import useGeographicalStateAndCountryFromRoute from '@hooks/useGeographicalStateAndCountryFromRoute';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {authTokenTypeSelector} from '@src/selectors/Session';

import type {ComponentRef, ForwardedRef} from 'react';
import type {View} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';

import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';

type CountrySelectorProps = {
    /** Form error text. e.g when no country is selected */
    errorText?: string;

    /** Callback called when the country changes. */
    onInputChange?: (value?: string) => void;

    value?: Country | '';

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;

    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

function CountrySelector({errorText = '', value: countryCode, onInputChange = () => {}, onBlur, ref}: CountrySelectorProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {country: countryFromUrl} = useGeographicalStateAndCountryFromRoute();

    const title = countryCode ? translate(`allCountries.${countryCode}`) : '';

    const didOpenCountrySelector = useRef(false);
    const isFocused = useIsFocused();
    useEffect(() => {
        // Check if the country selector was opened and no value was selected, triggering onBlur to display an error
        if (isFocused && didOpenCountrySelector.current) {
            didOpenCountrySelector.current = false;
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryFromUrl, isFocused, onBlur]);

    return (
        <MenuItem.Root
            sentryLabel={CONST.SENTRY_LABEL.COUNTRY_SELECTOR.OPEN}
            ref={ref}
            onPress={() => {
                callIfAuthenticated(() => {
                    didOpenCountrySelector.current = true;
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADDRESS_COUNTRY.getRoute(countryCode ?? '')));
                }, session)();
            }}
        >
            <MenuItemField.Row
                name={translate('common.country')}
                value={title}
            >
                {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                <MenuItem.Chevron />
            </MenuItemField.Row>
            {!!errorText && (
                <MenuItem.HelpText
                    isError
                    message={errorText}
                />
            )}
        </MenuItem.Root>
    );
}

export default CountrySelector;
