import React from 'react';

// This ref is created using React.createRef here because this function is used by a component that doesn't have access
// to the original ref.
const flatListRef = React.createRef();

// Whether the user is scrolling the Report messages list.
let hasScrolling = false;

/**
 * Scroll to the provided index.
 *
 * @param {Object} index
 */
function scrollToIndex(index) {
    flatListRef.current.scrollToIndex(index);
}

/**
 * Scroll to the bottom of the flatlist.
 *
 */
function scrollToBottom() {
    if (!flatListRef.current) {
        return;
    }

    flatListRef.current.scrollToOffset({animated: false, offset: 0});
}

/**
 * Toggle scrolling status.
 */
function toggleScrolling() {
    hasScrolling = !hasScrolling;
}

/**
 * Toggle scrolling status.
 * @returns {Boolean}
 */
function isScrolling() {
    return hasScrolling;
}

export {
    flatListRef,
    isScrolling,
    scrollToIndex,
    scrollToBottom,
    toggleScrolling,
};
