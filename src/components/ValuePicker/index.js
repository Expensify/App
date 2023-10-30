import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styles from '../../styles/styles';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import ValueSelectorModal from './ValueSelectorModal';
import FormHelpMessage from '../FormHelpMessage';
import refPropTypes from '../refPropTypes';

const propTypes = {
    /** Form Error description */
    errorText: PropTypes.string,

    /** Item to display */
    value: PropTypes.string,

    /** A placeholder value to display */
    placeholder: PropTypes.string,

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
    placeholder: '',
    items: {},
    forwardedRef: undefined,
    errorText: '',
    onInputChange: () => {},
};

function ValuePicker({value, label, items, placeholder, errorText, onInputChange, forwardedRef}) {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item) => {
        if (item.value !== value) {
            onInputChange(item.value);
        }
        hidePickerModal();
    };

    const descStyle = value.length === 0 ? styles.textNormal : null;
    const selectedItem = _.find(items, {value});
    const selectedLabel = selectedItem ? selectedItem.label : '';

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={selectedLabel || placeholder || ''}
                descriptionTextStyle={descStyle}
                description={label}
                onPress={showPickerModal}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <ValueSelectorModal
                isVisible={isPickerVisible}
                currentValue={selectedLabel || placeholder || ''}
                label={label}
                selectedItem={selectedItem}
                items={items}
                onClose={hidePickerModal}
                onItemSelected={updateInput}
            />
        </View>
    );
}

ValuePicker.propTypes = propTypes;
ValuePicker.defaultProps = defaultProps;
ValuePicker.displayName = 'ValuePicker';

const ValuePickerWithRef = React.forwardRef((props, ref) => (
    <ValuePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

ValuePickerWithRef.displayName = 'ValuePickerWithRef';

export default ValuePickerWithRef;
