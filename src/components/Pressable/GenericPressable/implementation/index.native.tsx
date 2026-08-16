import type PressableProps from '@components/Pressable/GenericPressable/types';

import React from 'react';

import GenericPressable from './BaseGenericPressable';

function NativeGenericPressable({ref, ...props}: PressableProps) {
    return (
        <GenericPressable
            focusable
            accessible
            {...props}
            ref={ref}
            accessibilityHint={props.accessibilityHint ?? props.accessibilityLabel}
        />
    );
}

export default NativeGenericPressable;
