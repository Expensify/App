import React from 'react';
import CollapsibleRN from 'react-native-collapsible';
import type CollapsibleProps from './types';

function Collapsible({isOpened = false, children}: CollapsibleProps) {
    return <CollapsibleRN collapsed={!isOpened}>{children}</CollapsibleRN>;
}

export default Collapsible;
