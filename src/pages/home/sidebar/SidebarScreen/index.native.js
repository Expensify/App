import React from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import sidebarPropTypes from './sidebarPropTypes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

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

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
