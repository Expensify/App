import React from 'react';

const emojiPickerRef = React.createRef();

/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param {Function} [onModalHide=() => {}] - Run a callback when Modal hides.
 * @param {Function} [onEmojiSelected=() => {}] - Run a callback when Emoji selected.
 * @param {Element} emojiPopoverAnchor - Element on which EmojiPicker is anchored
 * @param {Object} [anchorOrigin] - Anchor origin for Popover
 * @param {Function} [onWillShow=() => {}] - Run a callback when Popover will show
 * @param {Object} reportAction - ReportAction for EmojiPicker
 */
function showEmojiPicker(onModalHide = () => {}, onEmojiSelected = () => {}, emojiPopoverAnchor, anchorOrigin = undefined, onWillShow = () => {}, reportAction = {}) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.showEmojiPicker(onModalHide, onEmojiSelected, emojiPopoverAnchor, anchorOrigin, onWillShow, reportAction);
}

/**
 * Hide the Emoji Picker modal.
 *
 * @param {Boolean} isNavigating
 */
function hideEmojiPicker(isNavigating) {
    if (!emojiPickerRef.current) {
        return;
    }
    emojiPickerRef.current.hideEmojiPicker(isNavigating);
}

/**
 * Whether Emoji Picker is active for the Report Action.
 *
 * @param {Number|String} actionID
 * @return {Boolean}
 */
function isActiveReportAction(actionID) {
    if (!emojiPickerRef.current) {
        return;
    }
    return emojiPickerRef.current.isActiveReportAction(actionID);
}

function isEmojiPickerVisible() {
    if (!emojiPickerRef.current) {
        return;
    }
    return emojiPickerRef.current.isEmojiPickerVisible;
}

function resetEmojiPopoverAnchor() {
    if (!emojiPickerRef.current) {
        return;
    }
    return emojiPickerRef.current.resetEmojiPopoverAnchor();
}

export {emojiPickerRef, showEmojiPicker, hideEmojiPicker, isActiveReportAction, isEmojiPickerVisible, resetEmojiPopoverAnchor};
