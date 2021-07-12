import React from 'react';
import RNPickerSelect from 'react-native-picker-select';

import styles from '../../styles/styles';
import pickerDisabledStyles from './pickerDisabledStyles';
import * as pickerPropTypes from './PickerPropTypes';

const Picker = ({
    onChange,
    items,
    useDisabledStyles,
    placeholder,
    value,
    icon,
    disabled,
}) => (
    <RNPickerSelect
        onValueChange={onChange}
        items={items}
        style={useDisabledStyles ? pickerDisabledStyles : styles.picker}
        useNativeAndroidPickerStyle={false}
        placeholder={placeholder}
        value={value}
        Icon={icon}
        disabled={disabled}
        fixAndroidTouchableBug
    />
);

Picker.propTypes = pickerPropTypes.propTypes;
Picker.defaultProps = pickerPropTypes.defaultProps;
Picker.displayName = 'Picker';

export default Picker;
