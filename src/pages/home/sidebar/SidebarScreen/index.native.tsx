import React from 'react';
import PurposeForUsingExpensifyModal from '@components/PurposeForUsingExpensifyModal';
import useWindowDimensions from '@hooks/useWindowDimensions';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import type SidebarScreenProps from './types';

function SidebarScreen(props: SidebarScreenProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    return (
        <FreezeWrapper keepVisible={!isSmallScreenWidth}>
            <BaseSidebarScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                <FloatingActionButtonAndPopover />
                <PurposeForUsingExpensifyModal />
            </BaseSidebarScreen>
        </FreezeWrapper>
    );
}

SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
