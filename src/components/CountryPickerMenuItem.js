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
    errorText: PropTypes.string,
    value: PropTypes.string,
};

const defaultProps = {
    errorText: '',
    value: '',
};

function CountryPickerMenuItem({errorText, value}, ref) {
    const {translate} = useLocalize();
    const getCountryFromCountryCode = (code) => translate('allCountries')[code];

    const countryTitleDescStyle = value && value.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={getCountryFromCountryCode(value)}
                ref={ref}
                descriptionTextStyle={countryTitleDescStyle}
                description={translate('common.country')}
                onPress={() => {
                    const activeRoute = Navigation.getActiveRoute().replace(/\?.*/, '');
                    Navigation.navigate(ROUTES.getCountryRoute(value, activeRoute));
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

export default React.memo(React.forwardRef(CountryPickerMenuItem));
