import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';

function SidebarScreen(props) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return (
        <FreezeWrapper keepVisible={!shouldUseNarrowLayout}>
            <BaseSidebarScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                <FloatingActionButtonAndPopover />
            </BaseSidebarScreen>
        </FreezeWrapper>
    );
}

SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
