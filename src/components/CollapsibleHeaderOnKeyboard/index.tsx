import type {CollapsibleHeaderOnKeyboardProps} from './types';

/**
 * Web no-op — renders children as-is. The collapsing behaviour is only needed on native
 * where the software keyboard reduces the visible viewport height.
 */
function CollapsibleHeaderOnKeyboard({children}: CollapsibleHeaderOnKeyboardProps) {
    return children;
}

export default CollapsibleHeaderOnKeyboard;
