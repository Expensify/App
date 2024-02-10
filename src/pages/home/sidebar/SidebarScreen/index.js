import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';
import sidebarPropTypes from './sidebarPropTypes';

function SidebarScreen(props) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <FreezeWrapper keepVisible={!shouldUseNarrowLayout}>
            <BaseSidebarScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </FreezeWrapper>
    );
}

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
