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
    /** Current selected country  */
    value: PropTypes.string,
    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: PropTypes.string.isRequired,
};

const defaultProps = {
    errorText: '',
    value: '',
};

function CountryPickerMenuItem({errorText, value: countryCode, onInputChange}, ref) {
    const {translate} = useLocalize();

    const title = countryCode ? translate(`allCountries.${countryCode}`) : '';
    const countryTitleDescStyle = title.length === 0 ? styles.textNormal : null;

    useEffect(() => {
        // This will cause the form to revalidate and remove any error related to country name
        onInputChange(countryCode);
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
