import React from 'react';
import type {LayoutChangeEvent} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import BaseSidebarScreen from './BaseSidebarScreen';

type SidebarScreenProps = {
    onLayout: (event: LayoutChangeEvent) => void;
};
function SidebarScreen(props: SidebarScreenProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <FreezeWrapper keepVisible={!isSmallScreenWidth}>
            <BaseSidebarScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </FreezeWrapper>
    );
}

SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
