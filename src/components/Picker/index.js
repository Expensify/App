import React from 'react';
import RNPickerSelect from 'react-native-picker-select';

import styles from '../../styles/styles';
import * as pickerPropTypes from './pickerPropTypes';
import pickerStyles from './pickerStyles';

const Picker = ({
    onChange,
    items,
    placeholder,
    value,
    icon,
    disabled,
    onOpen,
    onClose,
    size,
}) => (
    <RNPickerSelect
        onValueChange={onChange}
        items={items}
        style={size === 'normal' ? pickerStyles(disabled) : styles.pickerSmall}
        useNativeAndroidPickerStyle={false}
        placeholder={placeholder}
        value={value}
        Icon={() => icon(size)}
        disabled={disabled}
        fixAndroidTouchableBug
        onOpen={onOpen}
        onClose={onClose}
        pickerProps={{
            onFocus: onOpen,
            onBlur: onClose,
        }}
    />
);


Picker.propTypes = pickerPropTypes.propTypes;
Picker.defaultProps = pickerPropTypes.defaultProps;
Picker.displayName = 'Picker';

export default Picker;
