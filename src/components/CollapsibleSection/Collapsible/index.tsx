import React from 'react';
import {Collapse} from 'react-collapse';

import type CollapsibleProps from './types';

function Collapsible({isOpened = false, children}: CollapsibleProps) {
    return (
        <Collapse isOpened={isOpened}>
            {/* aria-hidden does not remove the mounted controls from the tab order. */}
            <div
                inert={!isOpened}
                style={{display: 'contents'}}
            >
                {children}
            </div>
        </Collapse>
    );
}
export default Collapsible;
