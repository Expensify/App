import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import BasePicker from './BasePicker';
import type {BasePickerHandle, BasePickerProps} from './types';

function Picker<TPickerValue>(props: BasePickerProps<TPickerValue>, ref: ForwardedRef<BasePickerHandle>) {
    return (
        <BasePicker<TPickerValue>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            key={props.inputID}
            ref={ref}
        />
    );
}

export default forwardRef(Picker);
