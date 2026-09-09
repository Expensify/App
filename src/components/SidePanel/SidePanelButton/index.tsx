import React from 'react';

import type SidePanelButtonProps from './types';

import SidePanelButtonBase from './SidePanelButtonBase';

function SidePanelButton({style}: SidePanelButtonProps) {
    return <SidePanelButtonBase style={style} />;
}

export default SidePanelButton;
