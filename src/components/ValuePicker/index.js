import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import ValueSelectorModal from './ValueSelectorModal';
import FormHelpMessage from '../FormHelpMessage';
import refPropTypes from '../refPropTypes';

const propTypes = {
    /** Form Error description */
    errorText: PropTypes.string,

    /** Country to display */
    value: PropTypes.string,

    /** Items to pick from */
    items: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string, label: PropTypes.string})),

    /** Label of picker */
    label: PropTypes.string,

    /** Callback to call when the input changes */
    onInputChange: PropTypes.func,

    /** A ref to forward to MenuItemWithTopDescription */
    forwardedRef: refPropTypes,
};

const defaultProps = {
    value: undefined,
    label: undefined,
    items: {},
    forwardedRef: undefined,
    errorText: '',
    onInputChange: () => {},
};

function ValuePicker({value, label, items, errorText, onInputChange, forwardedRef}) {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

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

    const title = value || '';
    const descStyle = title.length === 0 ? styles.textNormal : null;
    const selectedItem = _.find(items, { 'value': value});

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={selectedItem.label}
                descriptionTextStyle={descStyle}
                description={label}
                onPress={showPickerModal}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <ValueSelectorModal
                isVisible={isPickerVisible}
                currentCountry={selectedItem.label}
                label={label}
                selectedItem={selectedItem}
                items={items}
                onClose={hidePickerModal}
                onCountrySelected={updateCountryInput}
            />
        </View>
    );
}

ValuePicker.propTypes = propTypes;
ValuePicker.defaultProps = defaultProps;
ValuePicker.displayName = 'ValuePicker';

export default React.forwardRef((props, ref) => (
    <ValuePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
