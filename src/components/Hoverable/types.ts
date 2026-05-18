import type {HTMLAttributes, ReactElement, Ref} from 'react';

type HoverableChildProps = HTMLAttributes<HTMLElement> & {
    ref?: Ref<HTMLElement>;
};

type HoverableChild = ReactElement<HoverableChildProps>;
type HoverableChildren = ((isHovered: boolean) => HoverableChild) | HoverableChild;

type HoverableProps = {
    /** Children to wrap with Hoverable. */
    children: HoverableChildren;

    /** Whether to disable the hover action */
    isDisabled?: boolean;

    /** Whether the screen containing the element is focused */
    isFocused?: boolean;

    /** Function that executes when the mouse moves over the children. */
    onHoverIn?: () => void;

    /** Function that executes when the mouse leaves the children. */
    onHoverOut?: () => void;

    /** Decides whether to handle the scroll behaviour to show hover once the scroll ends */
    shouldHandleScroll?: boolean;

    /** Decides whether to freeze the capture of the hover event */
    shouldFreezeCapture?: boolean;

    /** Reference to the outer element */
    ref?: Ref<HTMLElement>;
};

export default HoverableProps;
