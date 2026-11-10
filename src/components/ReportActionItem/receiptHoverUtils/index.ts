import isHTMLElement from '@libs/isHTMLElement';

import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';

/** Reset stale button hover/tooltip when file picker opens (browsers don't fire mouseleave). */
function resetButtonHoverState(addButtonRef: RefObject<ComponentRef<typeof View> | null>) {
    const buttonEl = addButtonRef.current;
    if (!isHTMLElement(buttonEl)) {
        return;
    }
    buttonEl.dispatchEvent(new PointerEvent('pointerleave'));
    buttonEl.dispatchEvent(new MouseEvent('mouseout', {bubbles: true, relatedTarget: document.body}));
}

/** Check if cursor is over the element (web only). */
function isElementHovered(ref: RefObject<ComponentRef<typeof View> | null>): boolean {
    const element = ref.current;
    return isHTMLElement(element) && element.matches(':hover');
}

export {resetButtonHoverState, isElementHovered};
