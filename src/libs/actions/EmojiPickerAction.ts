import {ValueOf} from 'type-fest';
import React from 'react';
import {View} from 'react-native';
import CONST from '../../CONST';

type AnchorOrigin = {
    horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
    vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
};

// TODO: Move this type to src/components/EmojiPicker/EmojiPicker.js once it is converted to TS
type EmojiPickerRef = {
    showEmojiPicker: (onModalHideValue?: () => void, onEmojiSelectedValue?: () => void, emojiPopoverAnchor?: View, anchorOrigin?: AnchorOrigin, onWillShow?: () => void, id?: string) => void;
    isActive: (id: string) => boolean;
    clearActive: () => void;
    hideEmojiPicker: (isNavigating: boolean) => void;
    isEmojiPickerVisible: boolean;
    resetEmojiPopoverAnchor: () => void;
};

const emojiPickerRef = React.createRef<EmojiPickerRef>();

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
function showEmojiPicker(onModalHide = () => {}, onEmojiSelected = () => {}, emojiPopoverAnchor = undefined, anchorOrigin = undefined, onWillShow = () => {}, id = undefined) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.showEmojiPicker(onModalHide, onEmojiSelected, emojiPopoverAnchor, anchorOrigin, onWillShow, id);
}

/**
 * Hide the Emoji Picker modal.
 */
function hideEmojiPicker(isNavigating: boolean) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.hideEmojiPicker(isNavigating);
}

/**
 * Whether Emoji Picker is active for the given id.
 */
function isActive(id: string): boolean {
    if (!emojiPickerRef.current) {
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

function isEmojiPickerVisible(): boolean {
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

export {emojiPickerRef, showEmojiPicker, hideEmojiPicker, isActive, clearActive, isEmojiPickerVisible, resetEmojiPopoverAnchor};
