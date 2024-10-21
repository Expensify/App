import React, {forwardRef} from 'react';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import GenericPressable from './BaseGenericPressable';

function NativeGenericPressable(props: PressableProps, ref: PressableRef) {
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

NativeGenericPressable.displayName = 'NativeGenericPressable';

export default forwardRef(NativeGenericPressable);
