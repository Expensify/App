import React, {useEffect} from 'react';
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
    /** function from form to call when the country changes, important for revalidation */
    onInputChange: PropTypes.func.isRequired,
    /** Prop which states when country value changed */
    didCountryChange: PropTypes.bool.isRequired,
    /** Function for setting didCountryChange to false  */
    setDidCountryChange: PropTypes.func.isRequired,
    /** Current selected country  */
    value: PropTypes.string,
};

const defaultProps = {
    errorText: '',
    value: '',
};

function CountryPickerMenuItem({errorText, value: countryCode, onInputChange, didCountryChange, setDidCountryChange}, ref) {
    const {translate} = useLocalize();

    const countries = translate('allCountries');
    const country = countries[countryCode] || '';
    const countryTitleDescStyle = country.length === 0 ? styles.textNormal : null;

    useEffect(() => {
        // This will cause the form to revalidate and remove any error related to country name
        if (!didCountryChange) return;
        onInputChange(countryCode);
        setDidCountryChange(false);
    }, [didCountryChange, onInputChange, setDidCountryChange, countryCode]);

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
