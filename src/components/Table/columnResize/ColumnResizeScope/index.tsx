import type {ColumnResizeScopeProps} from '@components/Table/columnResize/types';

import React from 'react';

/**
 * Owns the element the column widths are written on. A `display: contents` `div` (a `View` can't do that or expose its node),
 * so it adds no box while the custom properties still inherit into the header, rows and scroller.
 */
function ColumnResizeScope({onScopeElement, children}: ColumnResizeScopeProps) {
    if (!onScopeElement) {
        return children;
    }

    return (
        <div
            ref={onScopeElement}
            style={{display: 'contents'}}
        >
            {children}
        </div>
    );
}

export default ColumnResizeScope;
