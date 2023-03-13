import React, {forwardRef} from 'react';
import BasePicker from './Picker';
import {defaultProps, propTypes} from './pickerPropTypes';

const Picker = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BasePicker {...props} innerRef={ref} />
));

Picker.propTypes = propTypes;
Picker.defaultProps = defaultProps;

export default Picker;
