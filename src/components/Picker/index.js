import React, {forwardRef} from 'react';
import BasePicker from './Picker';

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
        additionalPickerEvents={additionalPickerEvents}
        ref={ref}
    />
));
