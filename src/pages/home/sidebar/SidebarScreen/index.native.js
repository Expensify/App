import React from 'react';
import sidebarPropTypes from './sidebarPropTypes';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import FreezeWrapper from '../../../../libs/Navigation/FreezeWrapper';
import withWindowDimensions from '../../../../components/withWindowDimensions';

const SidebarScreen = (props) => (
    <FreezeWrapper keepVisible={!props.isSmallScreenWidth}>
        <BaseSidebarScreen
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <FloatingActionButtonAndPopover />
        </BaseSidebarScreen>
    </FreezeWrapper>
);

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default withWindowDimensions(SidebarScreen);
