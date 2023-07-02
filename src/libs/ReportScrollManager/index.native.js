/**
 * Scroll to the provided index.
 *
 * @param {Object} ref
 * @param {Object} index
 */
function scrollToIndex(ref, index) {
    if (!ref.current) {
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
