/**
 * Scroll to the provided index. On non-native implementations we do not want to scroll when we are scrolling because
 * we are editing a comment.
 *
 * @param {Object} ref
 * @param {Object} index
 * @param {Boolean} isEditing
 */
function scrollToIndex(ref, index, isEditing) {
    if (!ref.current || isEditing) {
        return;
    }

    ref.current.scrollToIndex(index);
}

/**
 * Scroll to the bottom of the flatlist.
 *
 * @param {Object} ref
 */
function scrollToBottom(ref) {
    if (!ref.current) {
        return;
    }

    ref.current.scrollToOffset({animated: false, offset: 0});
}

export {scrollToIndex, scrollToBottom};
