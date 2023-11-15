import React, {ForwardedRef, forwardRef} from 'react';
import {Role, View} from 'react-native';
import GenericPressable from './BaseGenericPressable';
import PressableProps from './types';

function WebGenericPressable({focusable = true, ...props}: PressableProps, ref: ForwardedRef<View>) {
    const accessible = props.accessible ?? props.accessible === undefined ? true : props.accessible;

    return (
        <GenericPressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            // change native accessibility props to web accessibility props
            focusable={focusable}
            tabIndex={!accessible || !focusable ? -1 : 0}
            role={props.accessibilityRole as Role}
            id={props.nativeID}
            aria-label={props.accessibilityLabel}
            aria-labelledby={props.accessibilityLabelledBy}
            aria-valuenow={props.accessibilityValue?.now}
            aria-valuemin={props.accessibilityValue?.min}
            aria-valuemax={props.accessibilityValue?.max}
            aria-valuetext={props.accessibilityValue?.text}
            nativeID={props.nativeID}
            dataSet={{tag: 'pressable', ...(props.noDragArea && {dragArea: false}), ...props.dataSet}}
        />
    );
}

WebGenericPressable.displayName = 'WebGenericPressable';

export default forwardRef(WebGenericPressable);
