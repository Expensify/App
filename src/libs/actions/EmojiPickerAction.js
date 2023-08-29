import React from 'react';

const emojiPickerRef = React.createRef();

/**
 * Show the EmojiPicker modal popover.
 *
 * @param {Function} [onModalHide=() => {}] - Run a callback when Modal hides.
 * @param {Function} [onEmojiSelected=() => {}] - Run a callback when Emoji selected.
 * @param {Element} emojiPopoverAnchor - Element on which EmojiPicker is anchored
 * @param {Object} [anchorOrigin] - Anchor origin for Popover
 * @param {Function} [onWillShow=() => {}] - Run a callback when Popover will show
 * @param {String} id - Unique id for EmojiPicker
 */
function showEmojiPicker(onModalHide = () => {}, onEmojiSelected = () => {}, emojiPopoverAnchor, anchorOrigin = undefined, onWillShow = () => {}, id) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.showEmojiPicker(onModalHide, onEmojiSelected, emojiPopoverAnchor, anchorOrigin, onWillShow, id);
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
 * Whether Emoji Picker is active for the given id.
 *
 * @param {String} id
 * @return {Boolean}
 */
function isActive(id) {
    if (!emojiPickerRef.current) {
        return;
    }
    return emojiPickerRef.current.isActive(id);
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

export {emojiPickerRef, showEmojiPicker, hideEmojiPicker, isActive, isEmojiPickerVisible, resetEmojiPopoverAnchor};
