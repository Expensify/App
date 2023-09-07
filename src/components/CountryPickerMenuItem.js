import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import useLocalize from '../hooks/useLocalize';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** Error text from form, e.g when no country is selected */
    errorText: PropTypes.string,
    /** Current selected country  */
    value: PropTypes.string,
};

const defaultProps = {
    errorText: '',
    value: '',
};

function CountryPickerMenuItem({errorText, value: countryCode}, ref) {
    const {translate} = useLocalize();

    const countries = translate('allCountries');
    const country = countries[countryCode] || '';
    const countryTitleDescStyle = country.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={country}
                ref={ref}
                descriptionTextStyle={countryTitleDescStyle}
                description={translate('common.country')}
                onPress={() => {
                    const activeRoute = Navigation.getActiveRoute().replace(/\?.*/, '');
                    Navigation.navigate(ROUTES.getCountryRoute(countryCode, activeRoute));
                }}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
        </View>
    );
}

CountryPickerMenuItem.propTypes = propTypes;
CountryPickerMenuItem.defaultProps = defaultProps;
CountryPickerMenuItem.displayName = 'CountryPickerMenuItem';

export default React.forwardRef(CountryPickerMenuItem);
