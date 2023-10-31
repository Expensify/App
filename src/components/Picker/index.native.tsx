import React, {forwardRef} from 'react';
import BasePicker from './BasePicker';
import {BasePickerHandle, BasePickerProps} from './types';

export default forwardRef<BasePickerHandle, BasePickerProps>((props, ref) => (
    <BasePicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));
