import React from 'react';

import type {BasePickerProps} from './types';

import BasePicker from './BasePicker';

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
