import type {ReactElement, ReactNode} from 'react';

import React from 'react';

function composeTableHeaderComponent(...components: ReactNode[]): ReactElement | undefined {
    const headerContent = components.filter(Boolean);

    if (headerContent.length === 0) {
        return undefined;
    }

    return React.createElement(React.Fragment, null, ...headerContent);
}

export default composeTableHeaderComponent;
