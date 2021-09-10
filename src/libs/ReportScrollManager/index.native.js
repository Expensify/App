import {flatListRef, scrollToBottom} from './BaseReportScrollManager';

/**
 * Scroll to the provided index.
 *
 * @param {Object} index
 */
function scrollToIndex(index) {
    flatListRef.current.scrollToIndex(index);
}

export {
    flatListRef,
    scrollToIndex,
    scrollToBottom,
};
