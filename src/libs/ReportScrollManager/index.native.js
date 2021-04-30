import React from 'react';

export const flatListRef = React.createRef();

function scrollToIndex(index) {
    return flatListRef.current.scrollToIndex(index);
}

export {
    scrollToIndex,
};
