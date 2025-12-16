import React from 'react';
import SidePanel from '@components/SidePanel/index';
import HelpButtonBase from './HelpButtonBase';
import type HelpButtonProps from './types';

function HelpButton({style}: HelpButtonProps) {
    return (
        <>
            {/* Render SidePanel here on native platforms, since it's not included in RootNavigatorExtraContent like on web */}
            <SidePanel />
            <HelpButtonBase style={style} />
        </>
    );
}

export default HelpButton;
