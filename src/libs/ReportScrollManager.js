import React from 'react';

export const flatListRef = React.createRef();

function scrollToIndex(index) {
    console.log(flatListRef);
    return flatListRef.scrollToIndex(index);
}

export {
    scrollToIndex,
};
