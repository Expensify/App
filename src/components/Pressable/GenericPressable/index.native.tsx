import React, {ForwardedRef, forwardRef} from 'react';
import {View} from 'react-native';
import GenericPressable from './BaseGenericPressable';
import PressableProps from './types';

function NativeGenericPressable(props: PressableProps, ref: ForwardedRef<View>) {
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
