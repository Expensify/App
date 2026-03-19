import React from 'react';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import GenericPressable from './BaseGenericPressable';

function NativeGenericPressable({ref, ...props}: PressableProps) {
    return (
        <GenericPressable
            focusable
            accessible
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            accessibilityHint={props.accessibilityHint ?? props.accessibilityLabel}
            ref={ref}
        />
    );
}

export default NativeGenericPressable;
