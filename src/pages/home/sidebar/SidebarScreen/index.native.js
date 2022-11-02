import React from 'react';
import sidebarPropTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import PopoverModal from './PopoverModal';

const SidebarScreen = props => (
    <BaseSidebarScreen
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        <PopoverModal />
    </BaseSidebarScreen>
);

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
