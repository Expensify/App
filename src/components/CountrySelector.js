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
    /** Form error text. e.g when no country is selected */
    errorText: PropTypes.string,

    /** Callback called when the country changes. */
    onInputChange: PropTypes.func.isRequired,

    /** Current selected country  */
    value: PropTypes.string,

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: PropTypes.string.isRequired,

    /** React ref being forwarded to the MenuItemWithTopDescription */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    errorText: '',
    value: undefined,
    forwardedRef: () => {},
};

function CountrySelector({errorText, value: countryCode, onInputChange, forwardedRef}) {
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
                ref={forwardedRef}
                descriptionTextStyle={countryTitleDescStyle}
                description={translate('common.country')}
                onPress={() => {
                    const activeRoute = Navigation.getActiveRoute().replace(/\?.*/, '');
                    Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS_ADDRESS_COUNTRY.getRoute(countryCode, activeRoute));
                }}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
        </View>
    );
}

CountrySelector.propTypes = propTypes;
CountrySelector.defaultProps = defaultProps;
CountrySelector.displayName = 'CountrySelector';

export default React.forwardRef((props, ref) => (
    <CountrySelector
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
