import React from 'react';
import {isSafari} from '@libs/Browser';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SafariFormWrapperProps = ChildrenProps;

/**
 * If we used any <input> without <form> wrapper, Safari 11+ would show the auto-fill suggestion popup.
 */
function SafariFormWrapper({children}: SafariFormWrapperProps) {
    if (isSafari()) {
        return <form>{children}</form>;
    }

    return children;
}

export default SafariFormWrapper;
