import React from 'react';
import _ from 'underscore';
import lodashGet from 'lodash/get';

// This ref is created using React.createRef here because this function is used by a component that doesn't have access
// to the original ref.
const flatListRef = React.createRef();

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
    const sizeMap = lodashGet(flatListRef, 'current.props.sizeMap');
    const scrollableNode = flatListRef.current.getScrollableNode();
    const clientHeight = lodashGet(scrollableNode, 'clientHeight', 0);
    const paddingTop = parseFloat(lodashGet(scrollableNode, 'childNodes[0].style.paddingTop', '0px'));
    const sizeArray = _.map(_.values(sizeMap), s => s.length);
    const currentOffset = _.reduce(sizeArray.slice(0, (index.index)), (acc, val) => acc + val);
    const offset = (currentOffset + paddingTop + (index.viewOffset || 0)) - (clientHeight * (index.viewPosition || 0));
    flatListRef.current.scrollToOffset({
        animated: index.animated,
        offset,
    });
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

export {
    flatListRef,
    scrollToIndex,
    scrollToBottom,
};
