import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import useLocalize from '../../hooks/useLocalize';
import CountrySelectorModal from './CountrySelectorModal';
import FormHelpMessage from '../FormHelpMessage';
import refPropTypes from '../refPropTypes';
import Navigation from '../../libs/Navigation/Navigation';
import getPlatform from '../../libs/getPlatform';
import CONST from '../../CONST';
import * as Browser from '../../libs/Browser';

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
    const allCountries = translate('allCountries');
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchValue, setSearchValue] = useState(lodashGet(allCountries, value, ''));

    useEffect(() => {
        setSearchValue(lodashGet(allCountries, value, ''));
    }, [value, allCountries]);

    const showPickerModal = () => {
        setSearchValue(lodashGet(allCountries, value, ''));
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };
    const closeModal = () => {
        hidePickerModal();

        // if its macOS app or desktop browser, dismiss the modal when you click on the backdrop
        if (Browser.isMobile()) return;
        if (getPlatform() === CONST.PLATFORM.DESKTOP || getPlatform() === CONST.PLATFORM.WEB) {
            Navigation.dismissModal();
        }
    };

    const updateCountryInput = (country) => {
        onInputChange(country.value);
        hidePickerModal();
    };

    const title = allCountries[value] || '';
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
                onClose={closeModal}
                onModalHide={hidePickerModal}
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
