import React from 'react';
import {Collapse} from 'react-collapse';
import type CollapsibleProps from './types';

function Collapsible({isOpened = false, children}: CollapsibleProps) {
    return <Collapse isOpened={isOpened}>{children}</Collapse>;
}
export default Collapsible;
