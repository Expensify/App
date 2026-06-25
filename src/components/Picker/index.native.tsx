import React from 'react';
import BasePicker from './BasePicker';
import type {BasePickerProps} from './types';

function Picker<TPickerValue>({ref, ...props}: BasePickerProps<TPickerValue>) {
    return (
        <BasePicker<TPickerValue>
            {...props}
            key={props.inputID}
            ref={ref}
        />
    );
}

export default Picker;
