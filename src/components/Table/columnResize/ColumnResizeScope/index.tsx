import type {ColumnResizeScopeProps} from '@components/Table/columnResize/types';

import React from 'react';

// Adds no box, so the scroller and rows lay out as if the scope weren't there.
const SCOPE_STYLE: React.CSSProperties = {display: 'contents'};

/** Element the column widths are written on, so the header and rows below it inherit them. */
function ColumnResizeScope({onScopeElement, children}: ColumnResizeScopeProps) {
    if (!onScopeElement) {
        return children;
    }

    return (
        <div
            ref={onScopeElement}
            style={SCOPE_STYLE}
        >
            {children}
        </div>
    );
}

export default ColumnResizeScope;
