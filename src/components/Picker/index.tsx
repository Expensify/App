import React, {ForwardedRef, forwardRef} from 'react';
import BasePicker from './BasePicker';
import type {AdditionalPickerEvents, BasePickerHandle, BasePickerProps, OnChange, OnMouseDown} from './types';

const additionalPickerEvents = (onMouseDown: OnMouseDown, onChange: OnChange): AdditionalPickerEvents => ({
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

function Picker(props: BasePickerProps, ref: ForwardedRef<BasePickerHandle>) {
    return (
        <BasePicker
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // Forward the ref to Picker, as we implement imperative methods there
            ref={ref}
            // On the Web, focusing the inner picker improves the accessibility,
            // but doesn't open the picker (which we don't want), like it does on
            // Native.
            shouldFocusPicker
            additionalPickerEvents={additionalPickerEvents}
        />
    );
}

export default forwardRef(Picker);
