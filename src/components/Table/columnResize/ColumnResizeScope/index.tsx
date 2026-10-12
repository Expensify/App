import type {ColumnResizeScopeProps} from '@components/Table/columnResize/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

/** Element the column widths are written on, so the header and rows below it inherit them. */
function ColumnResizeScope({onScopeElement, children}: ColumnResizeScopeProps) {
    const styles = useThemeStyles();

    if (!onScopeElement) {
        return children;
    }

    return (
        <div
            ref={onScopeElement}
            // Adds no box, so the scroller and rows lay out as if the scope weren't there.
            style={styles.dContents}
        >
            {children}
        </div>
    );
}

export default ColumnResizeScope;
