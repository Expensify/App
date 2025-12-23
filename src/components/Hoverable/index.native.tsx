import type HoverableProps from './types';

/**
 * On mobile, there is no concept of hovering, so we return a plain wrapper around the component's children,
 * where the hover state is always false.
 */
function Hoverable({children}: HoverableProps) {
    const childrenWithHoverState = typeof children === 'function' ? children(false) : children;

    return childrenWithHoverState;
}

export default Hoverable;
