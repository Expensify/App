import React from 'react';
import Reanimated from 'react-native-reanimated';

import type {CollapsibleHeader} from './useCollapsibleHeader';

type CollapsibleHeaderViewProps = {
    children: React.ReactNode;

    /** The state returned by `useCollapsibleHeader`. */
    collapsibleHeader: CollapsibleHeader;
};

function CollapsibleHeaderView({children, collapsibleHeader}: CollapsibleHeaderViewProps) {
    return (
        <Reanimated.View style={collapsibleHeader.outerStyle}>
            <Reanimated.View
                onLayout={collapsibleHeader.onLayout}
                style={collapsibleHeader.innerStyle}
            >
                {children}
            </Reanimated.View>
        </Reanimated.View>
    );
}

export default CollapsibleHeaderView;
