import {ReactElement} from 'react';

type HoverableProps = {
    /** Children to wrap with Hoverable. */
    children: ((isHovered: boolean) => ReactElement) | ReactElement;

    /** Whether to disable the hover action */
    disabled?: boolean;

    /** Function that executes when the mouse moves over the children. */
    onHoverIn?: () => void;

    /** Function that executes when the mouse leaves the children. */
    onHoverOut?: () => void;

    /** Direct pass-through of React's onMouseEnter event. */
    onMouseEnter?: (event: MouseEvent) => void;

    /** Direct pass-through of React's onMouseLeave event. */
    onMouseLeave?: (event: MouseEvent) => void;

    /** Decides whether to handle the scroll behaviour to show hover once the scroll ends */
    shouldHandleScroll?: boolean;
};

export default HoverableProps;
