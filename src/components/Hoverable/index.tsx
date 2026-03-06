import React, {cloneElement} from 'react';
import {hasHoverSupport} from '@libs/DeviceCapabilities';
import mergeRefs from '@libs/mergeRefs';
import {getReturnValue} from '@libs/ValueUtils';
import ActiveHoverable from './ActiveHoverable';
import type HoverableProps from './types';

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */
function Hoverable({isDisabled, ref, ...props}: HoverableProps) {
    // If Hoverable is disabled, just render the child without additional logic or event listeners.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isDisabled || !hasHoverSupport()) {
        const child = getReturnValue(props.children, false);
        return cloneElement(child, {ref: mergeRefs(ref, child.props.ref)} as React.HTMLAttributes<HTMLElement>);
    }

    return (
        <ActiveHoverable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

export default Hoverable;
