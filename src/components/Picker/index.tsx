import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import BasePicker from './BasePicker';
import type {AdditionalPickerEvents, BasePickerHandle, BasePickerProps, OnChange, OnMouseDown} from './types';

function Picker<TPickerValue>(props: BasePickerProps<TPickerValue>, ref: ForwardedRef<BasePickerHandle>) {
    const additionalPickerEvents = (onMouseDown: OnMouseDown, onChange: OnChange<TPickerValue>): AdditionalPickerEvents => ({
        onMouseDown,
        onChange: (e) => {
            if (e.target.selectedIndex === undefined) {
                return;
            }
            const index = e.target.selectedIndex;
            const value = e.target.options[index].value;
            onChange(value as TPickerValue, index);
        },
    });

    return (
        <BasePicker<TPickerValue>
            // eslint-disable-next-line react/jsx-props-no-spreading
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

export default forwardRef(Picker);
