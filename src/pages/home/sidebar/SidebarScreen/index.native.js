import React from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import sidebarPropTypes from './sidebarPropTypes';

function SidebarScreen(props) {
    const {isSmallScreenWidth} = useWindowDimensions();
    return (
        <FreezeWrapper keepVisible={!isSmallScreenWidth}>
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
