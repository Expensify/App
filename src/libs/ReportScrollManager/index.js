import React from 'react';

export const flatListRef = React.createRef();

function scrollToIndex(index, isEditing) {
    if (isEditing) {
        return;
    }

    flatListRef.current.scrollToIndex(index);
}

export {
    scrollToIndex,
};
