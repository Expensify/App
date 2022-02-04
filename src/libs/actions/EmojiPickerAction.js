import React from 'react';

const emojiPickerRef = React.createRef();

/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param {Function} [onModalHide=() => {}] - Run a callback when Modal hides.
 * @param {Function} [onEmojiSelected=() => {}] - Run a callback when Emoji selected.
 * @param {Function} [onBeforeShowEmojiPicker=() => {}] - Run a callback before showing EmojiPicker
 * @param {Element} emojiPopoverAnchor - Element on which EmojiPicker is anchored
 */
function showEmojiPicker(
    onModalHide = () => {},
    onEmojiSelected = () => {},
    onBeforeShowEmojiPicker = () => {},
    emojiPopoverAnchor,
) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.showEmojiPicker(
        onModalHide,
        onEmojiSelected,
        onBeforeShowEmojiPicker,
        emojiPopoverAnchor,
    );
}

export {
    emojiPickerRef,
    showEmojiPicker,
};
