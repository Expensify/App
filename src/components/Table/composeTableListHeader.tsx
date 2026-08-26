import type {ReactElement, ReactNode} from 'react';

import React from 'react';

function composeTableListHeader(...components: ReactNode[]): ReactElement | undefined {
    if (!components.some(Boolean)) {
        return undefined;
    }

    // Keep empty argument slots in place so toggling an optional earlier slot cannot shift and
    // remount later stateful controls such as the table search input.
    return React.createElement(React.Fragment, null, ...components);
}

export default composeTableListHeader;
