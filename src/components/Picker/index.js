import React, {forwardRef} from 'react';
import BasePicker from './BasePicker';

const additionalPickerEvents = (onMouseDown, onChange) => ({
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

export default forwardRef((props, ref) => (
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
));
