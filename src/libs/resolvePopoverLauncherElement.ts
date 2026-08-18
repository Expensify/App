import type {RefObject} from 'react';
import type {Text, View} from 'react-native';

/**
 * Resolve a popover anchor ref to the DOM node that can take focus, or `null` when there is none.
 *
 * On web an RN `View`/`Text` ref IS the host node, so `instanceof` narrows it without a cast. A detached node can never
 * take focus, so it is no better than nothing. The `document` check keeps this a no-op on native, where the DOM globals
 * this relies on do not exist.
 */
function resolvePopoverLauncherElement(ref: RefObject<View | Text | HTMLElement | null> | null | undefined): HTMLElement | null {
    if (typeof document === 'undefined') {
        return null;
    }
    const node = ref?.current;
    if (!(node instanceof HTMLElement) || !document.contains(node)) {
        return null;
    }
    return node;
}

export default resolvePopoverLauncherElement;
