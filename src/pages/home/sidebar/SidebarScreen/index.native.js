import React from 'react';
import sidebarPropTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import FABActionsPopover from './FABActionsPopover';

const SidebarScreen = props => (
    <BaseSidebarScreen
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        <FABActionsPopover />
    </BaseSidebarScreen>
);

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
