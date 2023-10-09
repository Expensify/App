import React from 'react';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import FreezeWrapper from '../../../../libs/Navigation/FreezeWrapper';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

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

SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
