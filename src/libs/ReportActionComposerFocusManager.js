import React from 'react';

const composerRef = React.createRef();

/**
 * tells about the current focus state of the report action composer.
 *
 */
function isFocused() {
    if (composerRef.current) {
        composerRef.current.isFocused();
    }
}

export default {
    composerRef,
    isFocused,
};
