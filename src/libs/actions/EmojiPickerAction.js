"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emojiPickerRef = void 0;
exports.showEmojiPicker = showEmojiPicker;
exports.hideEmojiPicker = hideEmojiPicker;
exports.isActive = isActive;
exports.clearActive = clearActive;
exports.isEmojiPickerVisible = isEmojiPickerVisible;
exports.resetEmojiPopoverAnchor = resetEmojiPopoverAnchor;
var react_1 = require("react");
var emojiPickerRef = react_1.default.createRef();
exports.emojiPickerRef = emojiPickerRef;
/**
 * Show the EmojiPicker modal popover.
 *
 * @param onModalHide - Run a callback when Modal hides.
 * @param onEmojiSelected - Run a callback when Emoji selected.
 * @param emojiPopoverAnchor - Element on which EmojiPicker is anchored
 * @param anchorOrigin - Anchor origin for Popover
 * @param onWillShow - Run a callback when Popover will show
 * @param id - Unique id for EmojiPicker
 */
function showEmojiPicker(onModalHide, onEmojiSelected, emojiPopoverAnchor, anchorOrigin, onWillShow, id, activeEmoji, withoutOverlay) {
    if (onWillShow === void 0) { onWillShow = function () { }; }
    if (!emojiPickerRef.current) {
        return;
    }
    emojiPickerRef.current.showEmojiPicker(onModalHide, onEmojiSelected, emojiPopoverAnchor, anchorOrigin, onWillShow, id, activeEmoji, withoutOverlay);
}
/**
 * Hide the Emoji Picker modal.
 */
function hideEmojiPicker(isNavigating) {
    if (!emojiPickerRef.current) {
        return;
    }
    emojiPickerRef.current.hideEmojiPicker(isNavigating);
}
/**
 * Whether Emoji Picker is active for the given id.
 */
function isActive(id) {
    if (!emojiPickerRef.current || !id) {
        return false;
    }
    return emojiPickerRef.current.isActive(id);
}
function clearActive() {
    if (!emojiPickerRef.current) {
        return;
    }
    return emojiPickerRef.current.clearActive();
}
function isEmojiPickerVisible() {
    if (!emojiPickerRef.current) {
        return false;
    }
    return emojiPickerRef.current.isEmojiPickerVisible;
}
function resetEmojiPopoverAnchor() {
    if (!emojiPickerRef.current) {
        return;
    }
    emojiPickerRef.current.resetEmojiPopoverAnchor();
}
