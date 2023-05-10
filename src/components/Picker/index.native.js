import React, {forwardRef} from 'react';
import BasePicker from './BasePicker';

export default forwardRef((props, ref) => (
    <BasePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));
