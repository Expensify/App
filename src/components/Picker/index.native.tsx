import React from 'react';
import BasePicker from './BasePicker';
import type {BasePickerProps} from './types';

function Picker<TPickerValue>({ref, ...props}: BasePickerProps<TPickerValue>) {
    return (
        <BasePicker<TPickerValue>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            key={props.inputID}
            ref={ref}
        />
    );
}

export default Picker;
