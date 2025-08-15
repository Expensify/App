import React from 'react';
import HelpButtonBase from './HelpButtonBase';
import type HelpButtonProps from './types';

function HelpButton({style}: HelpButtonProps) {
    return <HelpButtonBase style={style} />;
}

HelpButton.displayName = 'HelpButton';

export default HelpButton;
