import React from 'react';

// This ref is created using React.createRef here because this function is used by a component that doesn't have access
// to the original ref.
const flatListRef = React.createRef();

function scrollToIndex(index) {
    return flatListRef.current.scrollToIndex(index);
}

export {
    flatListRef,
    scrollToIndex,
};
