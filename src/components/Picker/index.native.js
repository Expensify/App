import React, {forwardRef} from 'react';
import BasePicker from './Picker';

const Picker = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BasePicker {...props} innerRef={ref} />
));

export default Picker;
