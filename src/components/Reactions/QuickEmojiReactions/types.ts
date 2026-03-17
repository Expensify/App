import type {RefObject} from 'react';
import type {TextInput, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import type {AnchorOrigin} from '@userActions/EmojiPickerAction';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';

type PickerRefElement = RefObject<TextInput | View | null>;

type OpenPickerCallback = (element?: PickerRefElement, anchorOrigin?: AnchorOrigin) => void;

type CloseContextMenuCallback = () => void;

type BaseReactionsProps = {
    /** Callback to fire when an emoji is selected. */
    onEmojiSelected: (emoji: Emoji, emojiReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => void;

    /**
     * Will be called when the emoji picker is about to show.
     */
    onWillShowPicker?: (callback?: CloseContextMenuCallback) => void;

    /**
     * Callback to fire when the "open emoji picker" button is pressed.
     * The function receives an argument which can be called
     * to actually open the emoji picker.
     */
    onPressOpenPicker?: (openPicker?: OpenPickerCallback) => void;

    /** ReportAction for EmojiPicker. */
    reportAction: ReportAction;

    /** Id of the ReportAction for EmojiPicker. */
    reportActionID: string;

    /** Function to update emoji picker state */
    setIsEmojiPickerActive?: (state: boolean) => void;
};

type BaseQuickEmojiReactionsProps = BaseReactionsProps;

type QuickEmojiReactionsProps = BaseReactionsProps & {
    /**
     * Function that can be called to close the context menu
     * in which this component is rendered.
     */
    closeContextMenu: (callback?: CloseContextMenuCallback) => void;

    setIsEmojiPickerActive?: (state: boolean) => void;
};

export type {BaseQuickEmojiReactionsProps, QuickEmojiReactionsProps, OpenPickerCallback, CloseContextMenuCallback, PickerRefElement};
