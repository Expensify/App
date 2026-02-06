import React from 'react';
import type {Role} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import GenericPressable from './BaseGenericPressable';

function WebGenericPressable({focusable = true, ref, sentryLabel, ...props}: PressableProps) {
    const accessible = (props.accessible ?? props.accessible === undefined) ? true : props.accessible;

    return (
        <GenericPressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            // change native accessibility props to web accessibility props
            focusable={focusable}
            tabIndex={(props.tabIndex ?? (!accessible || !focusable)) ? -1 : 0}
            role={(props.accessibilityRole ?? props.role) as Role}
            id={props.id}
            aria-label={props.accessibilityLabel}
            aria-labelledby={props.accessibilityLabelledBy}
            aria-valuenow={props.accessibilityValue?.now}
            aria-valuemin={props.accessibilityValue?.min}
            aria-valuemax={props.accessibilityValue?.max}
            aria-valuetext={props.accessibilityValue?.text}
            dataSet={{tag: 'pressable', ...(props.noDragArea && {dragArea: false}), ...(sentryLabel && {sentryLabel}), ...props.dataSet}}
        />
    );
}

export default WebGenericPressable;
