import React, {forwardRef, useEffect} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {Country} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import FormHelpMessage from './FormHelpMessage';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type CountrySelectorProps = {
    /** Form error text. e.g when no country is selected */
    errorText?: string;

    /** Callback called when the country changes. */
    onInputChange: (value?: string) => void;

    /** Current selected country  */
    value?: Country;

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;
};

function CountrySelector({errorText = '', value: countryCode, onInputChange}: CountrySelectorProps, ref: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const title = countryCode ? translate(`allCountries.${countryCode}`) : '';
    const countryTitleDescStyle = title.length === 0 ? styles.textNormal : null;

    useEffect(() => {
        // This will cause the form to revalidate and remove any error related to country name
        onInputChange(countryCode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryCode]);

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={title}
                ref={ref}
                descriptionTextStyle={countryTitleDescStyle}
                description={translate('common.country')}
                onPress={() => {
                    const activeRoute = Navigation.getActiveRouteWithoutParams();
                    Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS_COUNTRY.getRoute(countryCode ?? '', activeRoute));
                }}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
        </View>
    );
}

CountrySelector.displayName = 'CountrySelector';

export default forwardRef(CountrySelector);
