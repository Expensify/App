import type {RefObject} from 'react';
import type {View} from 'react-native';

/** Reset stale button hover/tooltip when file picker opens (browsers don't fire mouseleave). */
function resetButtonHoverState(addButtonRef: RefObject<View | null>) {
    const buttonEl = addButtonRef.current as unknown as HTMLElement;
    buttonEl?.dispatchEvent(new PointerEvent('pointerleave'));
    buttonEl?.dispatchEvent(new MouseEvent('mouseout', {bubbles: true, relatedTarget: document.body}));
}

/** Check if cursor is over the element (web only). */
function isElementHovered(ref: RefObject<View | null>): boolean {
    return !!(ref.current as unknown as HTMLElement)?.matches?.(':hover');
}

export {resetButtonHoverState, isElementHovered};
