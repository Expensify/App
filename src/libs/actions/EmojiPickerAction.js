import React from 'react';

const emojiPickerRef = React.createRef();

/**
 * Show the ReportActionContextMenu modal popover.
 *
 * @param {Function} [onModalHide=() => {}] - Run a callback when Modal hides.
 * @param {Function} [onEmojiSelected=() => {}] - Run a callback when Emoji selected.
 * @param {Function} [onBeforeShowEmojiPicker=() => {}] - Run a callback before showing EmojiPicker
 *
 */
function showEmojiPicker(
    onModalHide = () => {},
    onEmojiSelected = () => {},
    onBeforeShowEmojiPicker = () => {},
) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.showEmojiPicker(
        onModalHide,
        onEmojiSelected,
        onBeforeShowEmojiPicker,
    );
}

export {
    emojiPickerRef,
    showEmojiPicker,
};
