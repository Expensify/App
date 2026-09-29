import type {CollapsibleHeaderOnKeyboardGroupProps} from '@components/CollapsibleHeaderOnKeyboard/types';

/**
 * Web no-op that renders children as-is, matching `CollapsibleHeaderOnKeyboard`. The collapsing behaviour is only needed
 * on native where the software keyboard reduces the visible viewport height.
 */
function CollapsibleHeaderOnKeyboardGroup({children}: CollapsibleHeaderOnKeyboardGroupProps) {
    return children;
}

export default CollapsibleHeaderOnKeyboardGroup;
