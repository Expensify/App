import React from 'react';
import useActiveRoute from '@hooks/useActiveRoute';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';

function SidebarScreen() {
    /**
     * In web useActiveRoute reports tab change immediately.
     */
    const route = useActiveRoute();
    /**
     * Immediately unmount component on tab change to avoid blocking js thread
     */
    if (route?.name !== 'Report' && !!route?.name) {
        return null;
    }
    return (
        <FreezeWrapper>
            <BaseSidebarScreen />
        </FreezeWrapper>
    );
}

SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
