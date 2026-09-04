import type {IsElementHovered, ResetButtonHoverState} from './types';

/** Reset stale button hover/tooltip when file picker opens (browsers don't fire mouseleave). */
const resetButtonHoverState: ResetButtonHoverState = (addButtonRef) => {
    const buttonEl = addButtonRef.current as unknown as HTMLElement;
    buttonEl?.dispatchEvent(new PointerEvent('pointerleave'));
    buttonEl?.dispatchEvent(new MouseEvent('mouseout', {bubbles: true, relatedTarget: document.body}));
};

/** Check if cursor is over the element (web only). */
const isElementHovered: IsElementHovered = (ref) => {
    return !!(ref.current as unknown as HTMLElement)?.matches?.(':hover');
};

export {resetButtonHoverState, isElementHovered};
