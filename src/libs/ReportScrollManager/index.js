import {flatListRef, scrollToBottom, baseScrollToIndex} from './BaseReportScrollManager';

/**
 * Scroll to the provided index. On non-native implementations we do not want to scroll when we are editing a comment.
 *
 * @param {Object} params
 * @param {Boolean} isEditing
 */
function scrollToIndex(params, isEditing) {
    if (isEditing) {
        return;
    }

    baseScrollToIndex(params);
}

export {
    flatListRef,
    scrollToIndex,
    scrollToBottom,
};
