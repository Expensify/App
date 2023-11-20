import React, {cloneElement, forwardRef, Ref} from 'react';
import ActiveHoverable from './ActiveHoverable';
import HoverableProps from './types';

/**
 * It is necessary to create a Hoverable component instead of relying solely on Pressable support for hover state,
 * because nesting Pressables causes issues where the hovered state of the child cannot be easily propagated to the
 * parent. https://github.com/necolas/react-native-web/issues/1875
 */
function Hoverable<R>({disabled, ...props}: HoverableProps, ref: Ref<R>) {
    // If Hoverable is disabled, just render the child without additional logic or event listeners.
    if (disabled) {
        return cloneElement(typeof props.children === 'function' ? props.children(false) : props.children, {ref});
    }

    return (
        <ActiveHoverable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

export default forwardRef(Hoverable);
