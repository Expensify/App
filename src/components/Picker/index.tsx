import React from 'react';

import type {AdditionalPickerEvents, BasePickerProps, OnChange, OnMouseDown} from './types';

import BasePicker from './BasePicker';

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
function PickerImpl({ref, ...props}: BasePickerProps<unknown>) {
    const additionalPickerEvents = (onMouseDown: OnMouseDown, onChange: OnChange<unknown>): AdditionalPickerEvents => ({
        onMouseDown,
        onChange: (e) => {
            if (e.target.selectedIndex === undefined) {
                return;
            }
            const index = e.target.selectedIndex;
            const value = e.target.options[index].value;
            onChange(value, index);
        },
    });

    return (
        <BasePicker
            {...props}
            // Forward the ref to Picker, as we implement imperative methods there
            ref={ref}
            // On the Web, focusing the inner picker improves the accessibility,
            // but doesn't open the picker (which we don't want), like it does on
            // Native.
            shouldFocusPicker
            key={props.inputID}
            additionalPickerEvents={additionalPickerEvents}
        />
    );
}

function Picker<TPickerValue>({ref, ...props}: BasePickerProps<TPickerValue>) {
    return <PickerImpl {...({ref, ...props} as BasePickerProps<unknown>)} />;
}

export default Picker;
