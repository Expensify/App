import React, {forwardRef} from 'react';
import BasePicker from './Picker';

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BasePicker {...props} ref={ref} />
));
