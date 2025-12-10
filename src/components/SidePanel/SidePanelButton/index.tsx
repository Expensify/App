import React from 'react';
import SidePanelButtonBase from './SidePanelButtonBase';
import type SidePanelButtonProps from './types';

function SidePanelButton({style}: SidePanelButtonProps) {
    return <HelpButtonBase style={style} />;
}

SidePanelButton.displayName = 'SidePanelButton';

export default SidePanelButton;
