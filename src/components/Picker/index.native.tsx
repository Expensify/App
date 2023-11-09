import React, {ForwardedRef, forwardRef} from 'react';
import BasePicker from './BasePicker';
import {BasePickerHandle, BasePickerProps} from './types';

function Picker(props: BasePickerProps, ref: ForwardedRef<BasePickerHandle>) {
    return (
        <BasePicker
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

export default forwardRef(Picker);
