import React from 'react';
import _ from 'underscore';

// This ref is created using React.createRef here because this function is used by a component that doesn't have access
// to the original ref.
const flatListRef = React.createRef();

// Whether the user is scrolling the report messages list.
// eslint-disable-next-line import/no-mutable-exports
let isScrolling = false;
let activeHoveredItem = null;

/**
 * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
 * we are editing a comment.
 *
 * @param {Object} index
 * @param {Boolean} isEditing
 */
function scrollToIndex(index, isEditing) {
    if (isEditing) {
        return;
    }

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
 * Unset the scrolling status and activate the hovered item's hover state
 */
const unsetScrollingAndActivateHoveredItem = _.debounce(() => {
    isScrolling = false;
    if (!activeHoveredItem) {
        return;
    }
    activeHoveredItem.setHovered();
}, 100);

/**
 * Toggle scrolling status.
 */
function setScrollingAndStartUnsetListener() {
    isScrolling = true;
    unsetScrollingAndActivateHoveredItem();
}

/**
 * @param {Object} item
 */
function setCurrentlyHoveredReportActionItem(item) {
    activeHoveredItem = item;
}

export {
    flatListRef,
    isScrolling,
    scrollToIndex,
    scrollToBottom,
    setScrollingAndStartUnsetListener,
    setCurrentlyHoveredReportActionItem,
};
