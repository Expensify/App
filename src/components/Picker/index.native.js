import React, {forwardRef} from 'react';
import BasePicker from './BasePicker';

const BasePickerWithRef = forwardRef((props, ref) => (
    <BasePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));

BasePickerWithRef.displayName = 'BasePickerWithRef';

export default BasePickerWithRef;
