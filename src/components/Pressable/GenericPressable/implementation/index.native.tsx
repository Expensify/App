import React from 'react';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import GenericPressable from './BaseGenericPressable';

function NativeGenericPressable({ref, ...props}: PressableProps) {
    return (
        <GenericPressable
            focusable
            accessible
            accessibilityHint={props.accessibilityHint ?? props.accessibilityLabel}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

export default NativeGenericPressable;
