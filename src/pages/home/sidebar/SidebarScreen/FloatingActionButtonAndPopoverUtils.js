import React from 'react';

const floatingActionButtonAndPopoverRef = React.createRef(null);

function isFloatingActionButtonCreateMenuOpen() {
    if (!floatingActionButtonAndPopoverRef.current) {
        return;
    }
    return floatingActionButtonAndPopoverRef.current.state.isCreateMenuActive;
}

export {floatingActionButtonAndPopoverRef, isFloatingActionButtonCreateMenuOpen}