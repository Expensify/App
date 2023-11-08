import React from 'react';
import CollapsibleRN from 'react-native-collapsible';
import CollapsibleProps from './types';

function Collapsible({isOpened = false, children}: CollapsibleProps) {
    return <CollapsibleRN collapsed={!isOpened}>{children}</CollapsibleRN>;
}

Collapsible.displayName = 'Collapsible';
export default Collapsible;
