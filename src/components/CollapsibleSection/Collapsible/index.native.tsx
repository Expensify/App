import React from 'react';
import CollapsibleRN from 'react-native-collapsible';
import ChildrenProps from '@src/types/utils/ChildrenProps';

type CollapsibleProps = ChildrenProps & {
    /** Whether the section should start expanded. False by default */
    isOpened?: boolean;
};

function Collapsible({isOpened = false, children}: CollapsibleProps) {
    return <CollapsibleRN collapsed={!isOpened}>{children}</CollapsibleRN>;
}

Collapsible.displayName = 'Collapsible';
export default Collapsible;
