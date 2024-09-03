import React from 'react';
// import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';

// TODO-SPLITS: Figure out how to handle the FreezeWrapper component.
function SidebarScreen() {
    return (
        // <FreezeWrapper>
        <BaseSidebarScreen />
        // </FreezeWrapper>
    );
}

SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
