import type {RefObject} from 'react';
import type {View} from 'react-native';

/** Reset stale button hover/tooltip after file dialog dismiss (browsers don't fire mouseleave). */
export default function resetButtonHoverState(addButtonRef: RefObject<View | null>): boolean {
    const buttonEl = addButtonRef.current as unknown as HTMLElement;
    buttonEl?.dispatchEvent(new PointerEvent('pointerleave'));
    buttonEl?.dispatchEvent(new MouseEvent('mouseout', {bubbles: true, relatedTarget: document.body}));
    return true;
}
