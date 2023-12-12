import {GestureResponderEvent, Text as RNText, TextInput} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import type {AnchorOrigin} from '@userActions/EmojiPickerAction';
import type {Locale, ReportAction, ReportActionReactions} from '@src/types/onyx';

type ShowContextMenu = (
    type: 'LINK' | 'REPORT_ACTION' | 'EMAIL' | 'REPORT',
    event: GestureResponderEvent | MouseEvent,
    selection: string,
    contextMenuAnchor: RNText | null,
    reportID?: string,
    reportActionID?: string,
    originalReportID?: string,
    draftMessage?: string,
    onShow?: () => void,
    onHide?: () => void,
    isArchivedRoom?: boolean,
    isChronosReport?: boolean,
    isPinnedChat?: boolean,
    isUnreadChat?: boolean,
) => void;

// TODO: remove when https://github.com/Expensify/App/pull/32670 is merged
type ReportActionContextMenu = {
    showContextMenu: ShowContextMenu;
    hideContextMenu: (callback: () => void) => void;
    showDeleteModal: (reportID: string, reportAction: OnyxEntry<ReportAction>, shouldSetModalVisibility?: boolean, onConfirm?: () => void, onCancel?: () => void) => void;
    hideDeleteModal: () => void;
    isActiveReportAction: (accountID: string | number) => boolean;
    instanceID: string;
    runAndResetOnPopoverHide: () => void;
    clearActiveReportAction: () => void;
};

type OpenPickerCallback = (element: TextInput | ReportActionContextMenu | null, anchorOrigin?: AnchorOrigin) => void;

type CloseContextMenuCallback = () => void;

type BaseQuickEmojiReactionsOnyxProps = {
    /** All the emoji reactions for the report action. */
    emojiReactions: OnyxEntry<ReportActionReactions>;

    /** The user's preferred locale. */
    preferredLocale: OnyxEntry<Locale>;

    /** The user's preferred skin tone. */
    preferredSkinTone: OnyxEntry<string | number>;
};

type BaseQuickEmojiReactionsProps = BaseQuickEmojiReactionsOnyxProps & {
    /** Callback to fire when an emoji is selected. */
    onEmojiSelected: (emoji: Emoji, emojiReactions: OnyxEntry<ReportActionReactions>) => void;

    /**
     * Will be called when the emoji picker is about to show.
     */
    onWillShowPicker?: (callback: CloseContextMenuCallback) => void;

    /**
     * Callback to fire when the "open emoji picker" button is pressed.
     * The function receives an argument which can be called
     * to actually open the emoji picker.
     */
    onPressOpenPicker?: (openPicker?: OpenPickerCallback) => void;

    /** ReportAction for EmojiPicker. */
    reportAction: ReportAction;

    /** Id of the ReportAction for EmojiPicker. */
    // eslint-disable-next-line react/no-unused-prop-types -- It's used inside withOnyx HOC
    reportActionID: string;
};

type QuickEmojiReactionsProps = BaseQuickEmojiReactionsProps & {
    /**
     * Function that can be called to close the context menu
     * in which this component is rendered.
     */
    closeContextMenu: (callback: CloseContextMenuCallback) => void;
};

export type {BaseQuickEmojiReactionsProps, BaseQuickEmojiReactionsOnyxProps, QuickEmojiReactionsProps, OpenPickerCallback, CloseContextMenuCallback, ReportActionContextMenu};
