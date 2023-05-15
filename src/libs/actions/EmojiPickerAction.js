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
 */
function showEmojiPicker(onModalHide = () => {}, onEmojiSelected = () => {}, emojiPopoverAnchor, anchorOrigin = undefined, onWillShow = () => {}) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.showEmojiPicker(onModalHide, onEmojiSelected, emojiPopoverAnchor, anchorOrigin, onWillShow);
}

export {emojiPickerRef, showEmojiPicker};
