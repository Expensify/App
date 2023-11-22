import {ReactElement, RefAttributes} from 'react';

type HoverableProps = {
    /** Children to wrap with Hoverable. */
    children: ((isHovered: boolean) => ReactElement & RefAttributes<HTMLElement>) | (ReactElement & RefAttributes<HTMLElement>);

    /** Whether to disable the hover action */
    disabled?: boolean;

    /** Function that executes when the mouse moves over the children. */
    onHoverIn?: () => void;

    /** Function that executes when the mouse leaves the children. */
    onHoverOut?: () => void;

    /** Decides whether to handle the scroll behaviour to show hover once the scroll ends */
    shouldHandleScroll?: boolean;
};

export default HoverableProps;
