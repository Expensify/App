import React from 'react';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';

function SidebarScreen() {
    return (
        <FreezeWrapper>
            <BaseSidebarScreen />
        </FreezeWrapper>
    );
}

SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
