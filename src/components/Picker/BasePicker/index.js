import React from 'react';
import RNPickerSelect from 'react-native-picker-select';

import styles from '../../../styles/styles';
import * as basePickerPropTypes from './basePickerPropTypes';
import basePickerStyles from './basePickerStyles';

const BasePicker = props => (
    <RNPickerSelect
        onValueChange={props.onChange}
        items={props.items}
        style={props.size === 'normal' ? basePickerStyles(props.disabled, props.hasError, props.focused) : styles.pickerSmall}
        useNativeAndroidPickerStyle={false}
        placeholder={props.placeholder}
        value={props.value}
        Icon={() => props.icon(props.size)}
        disabled={props.disabled}
        fixAndroidTouchableBug
        onOpen={props.onOpen}
        onClose={props.onClose}
        pickerProps={{
            onFocus: props.onOpen,
            onBlur: props.onClose,
        }}
    />
);


BasePicker.propTypes = basePickerPropTypes.propTypes;
BasePicker.defaultProps = basePickerPropTypes.defaultProps;
BasePicker.displayName = 'BasePicker';

export default BasePicker;
