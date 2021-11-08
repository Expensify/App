import React from 'react';
import RNPickerSelect from 'react-native-picker-select';

import styles from '../../styles/styles';
import * as pickerPropTypes from './pickerPropTypes';
import pickerStyles from './pickerStyles';

const Picker = props => (
    <RNPickerSelect
        onValueChange={props.onChange}
        items={props.items}
        style={props.size === 'normal' ? pickerStyles(props.disabled) : styles.pickerSmall}
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


Picker.propTypes = pickerPropTypes.propTypes;
Picker.defaultProps = pickerPropTypes.defaultProps;
Picker.displayName = 'Picker';

export default Picker;
