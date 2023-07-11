import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {useFocusEffect} from '@react-navigation/native';
import styles from '../styles/styles';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import useNavigationStorage from '../hooks/useNavigationStorage';
import Navigation from '../libs/Navigation/Navigation';
import useLocalize from '../hooks/useLocalize';
import ROUTES from '../ROUTES';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** The ISO code of the country */
    countryISO: PropTypes.string,

    /** Form Error description */
    errorText: PropTypes.string,

    /** Country to display */
    // eslint-disable-next-line react/require-default-props
    value: PropTypes.string,

    /** ID of the input */
    inputID: PropTypes.string.isRequired,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,
};

const defaultProps = {
    countryISO: '',
    errorText: '',
    onInputChange: () => {},
};

const CountryPicker = React.forwardRef(({value, countryISO, inputID, errorText, onInputChange}, ref) => {
    const {translate} = useLocalize();
    const countryValue = value || countryISO || '';
    const [collect, save] = useNavigationStorage(inputID, countryValue);

    useEffect(() => {
        const savedCountry = collect();
        if (!countryValue || savedCountry === countryValue) {
            return;
        }
        save(countryValue);
    }, [countryValue, collect, save]);

    useFocusEffect(
        useCallback(() => {
            const savedCountry = collect();
            if (savedCountry && savedCountry !== countryValue) {
                save(savedCountry);
                // Needed to call onInputChange, so Form can update the validation and values
                onInputChange(savedCountry);
            }
            // onInputChange isn't a stable function, so we can't add it to the dependency array
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [collect, countryValue]),
    );

    const navigateToCountrySelector = () => {
        Navigation.navigate(ROUTES.getCountrySelectionRoute(inputID, Navigation.getActiveRoute()));
    };

    const title = PersonalDetails.getCountryName(countryValue);
    const descStyle = title.length === 0 ? styles.addressPickerDescription : null;
    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={title}
                descriptionTextStyle={descStyle}
                description={translate('common.country')}
                onPress={navigateToCountrySelector}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
        </View>
    );
});

CountryPicker.propTypes = propTypes;
CountryPicker.defaultProps = defaultProps;
CountryPicker.displayName = 'CountryPicker';

export default CountryPicker;
