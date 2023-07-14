import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import useLocalize from '../../hooks/useLocalize';
import CountrySelectorModal from './CountrySelectorModal';
import FormHelpMessage from '../FormHelpMessage';

const propTypes = {
    /** The ISO code of the country */
    countryISO: PropTypes.string,

    /** Form Error description */
    errorText: PropTypes.string,

    /** Country to display */
    // eslint-disable-next-line react/require-default-props
    value: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,

    /** Callback to call when the Country is updated */
    onCountryUpdated: PropTypes.func,
};

const defaultProps = {
    countryISO: '',
    errorText: '',
    onInputChange: () => {},
    onCountryUpdated: () => {},
};

const CountryPicker = React.forwardRef(({value, countryISO, errorText, onCountryUpdated, onInputChange}, ref) => {
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const countryValue = value || countryISO || '';

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const onStateSelected = (state) => {
        onInputChange(state.value);
        hidePickerModal();
    };

    useEffect(() => {
        if (!onCountryUpdated || countryValue.length === 0) {
            return;
        }
        onCountryUpdated(countryValue);
    }, [countryValue]);

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
                onPress={showPickerModal}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <CountrySelectorModal
                key={countryValue}
                isVisible={isPickerVisible}
                currentCountry={countryValue}
                onClose={hidePickerModal}
                onCountrySelected={onStateSelected}
            />
        </View>
    );
});

CountryPicker.propTypes = propTypes;
CountryPicker.defaultProps = defaultProps;
CountryPicker.displayName = 'CountryPicker';

export default CountryPicker;
