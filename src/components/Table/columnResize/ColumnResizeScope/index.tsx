import type {ColumnResizeScopeProps} from '@components/Table/columnResize/types';

import React from 'react';

/** Element the column widths are written on. A `display: contents` `div`, so it adds no box. */
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
