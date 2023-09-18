import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import useLocalize from '../../hooks/useLocalize';
import CountrySelectorModal from './CountrySelectorModal';
import FormHelpMessage from '../FormHelpMessage';
import refPropTypes from '../refPropTypes';

const propTypes = {
    /** Form Error description */
    errorText: PropTypes.string,

    /** Country to display */
    value: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,

    /** A ref to forward to MenuItemWithTopDescription */
    forwardedRef: refPropTypes,
};

const defaultProps = {
    value: undefined,
    forwardedRef: undefined,
    errorText: '',
    onInputChange: () => {},
};

function CountryPicker({value, errorText, onInputChange, forwardedRef}) {
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateCountryInput = (country) => {
        onInputChange(country.value);
        hidePickerModal();
    };

    const title = value ? translate(`allCountries.${value}`) : '';
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
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
                isVisible={isPickerVisible}
                currentCountry={value}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                onClose={hidePickerModal}
                onCountrySelected={updateCountryInput}
            />
        </View>
    );
}

CountryPicker.propTypes = propTypes;
CountryPicker.defaultProps = defaultProps;
CountryPicker.displayName = 'CountryPicker';

export default React.forwardRef((props, ref) => (
    <CountryPicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
