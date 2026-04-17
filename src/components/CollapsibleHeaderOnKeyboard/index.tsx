import React from 'react';
import type {ReactNode} from 'react';

type CollapsibleHeaderOnKeyboardProps = {
    children: ReactNode;
    collapsibleHeaderOffset?: number;
};

/**
 * Web no-op — renders children as-is. The collapsing behaviour is only needed on native
 * where the software keyboard reduces the visible viewport height.
 */
function CollapsibleHeaderOnKeyboard({children}: CollapsibleHeaderOnKeyboardProps) {
    return <>{children}</>;
}

export default CollapsibleHeaderOnKeyboard;
