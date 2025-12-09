import {useNavigation} from '@react-navigation/native';
import React from 'react';
import SidePanel from '@components/SidePanel/index';
import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';
import HelpButtonBase from './HelpButtonBase';
import type HelpButtonProps from './types';

function HelpButton({style}: HelpButtonProps) {
    const navigation = useNavigation<ExtraContentProps['navigation']>();

    return (
        <>
            {/* Render SidePanel here on native platforms, since it's not included in RootNavigatorExtraContent like on web */}
            <SidePanel navigation={navigation} />
            <HelpButtonBase style={style} />
        </>
    );
}

HelpButton.displayName = 'HelpButton';

export default HelpButton;
