import type {RefObject} from 'react';
import React from 'react';
import type {TextInput, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {Emoji} from '@assets/emojis/types';
import type {CloseContextMenuCallback} from '@components/Reactions/QuickEmojiReactions/types';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import type CONST from '@src/CONST';

type AnchorOrigin = {
    horizontal: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL>;
    vertical: ValueOf<typeof CONST.MODAL.ANCHOR_ORIGIN_VERTICAL>;
    shiftVertical?: number;
};

type EmojiPopoverAnchor = RefObject<View | HTMLDivElement | TextInput | null>;

type EmojiPickerOnWillShow = (callback?: CloseContextMenuCallback) => void;

type EmojiPickerOnModalHide = (isNavigating?: boolean) => void;

type ShowEmojiPickerOptions = {
    onModalHide: EmojiPickerOnModalHide;
    onEmojiSelected: OnEmojiSelected;
    emojiPopoverAnchor: EmojiPopoverAnchor;
    anchorOrigin?: AnchorOrigin;
    onWillShow?: EmojiPickerOnWillShow;
    id?: string;
    activeEmoji?: string;
    withoutOverlay?: boolean;
    composerToRefocusOnClose?: ComposerType;
};

type EmojiPickerRef = {
    showEmojiPicker: (options: ShowEmojiPickerOptions) => void;
    isActive: (id: string) => boolean;
    clearActive: () => void;
    hideEmojiPicker: (isNavigating?: boolean) => void;
    isEmojiPickerVisible: boolean;
    resetEmojiPopoverAnchor: () => void;
};

type OnEmojiSelected = (emojiCode: string, emojiObject: Emoji, preferredSkinTone: number) => void;

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
function showEmojiPicker(options: ShowEmojiPickerOptions) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.showEmojiPicker(options);
}

/**
 * Hide the Emoji Picker modal.
 */
function hideEmojiPicker(isNavigating?: boolean) {
    if (!emojiPickerRef.current) {
        return;
    }

    emojiPickerRef.current.hideEmojiPicker(isNavigating);
}

/**
 * Whether Emoji Picker is active for the given id.
 */
function isActive(id?: string): boolean {
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
export type {AnchorOrigin, EmojiPickerOnModalHide, OnEmojiSelected, EmojiPopoverAnchor, EmojiPickerOnWillShow, ShowEmojiPickerOptions, EmojiPickerRef};
