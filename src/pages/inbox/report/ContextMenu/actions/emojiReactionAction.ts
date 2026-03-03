import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import {toggleEmojiReaction} from '@userActions/Report';
import type {ReportActionReactions} from '@src/types/onyx';
import type {ContextMenuPayload} from './actionTypes';

type EmojiReactionData = {
    reportID: string | undefined;
    reportAction: ContextMenuPayload['reportAction'];
    reportActionID: string | undefined;
    toggleEmojiAndCloseMenu: (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => void;
    closeContextMenu: (onHideCallback?: () => void) => void;
    onPressOpenPicker: () => void;
    onEmojiPickerClosed: () => void;
    interceptAnonymousUser: ContextMenuPayload['interceptAnonymousUser'];
};

function createEmojiReactionData(payload: ContextMenuPayload): EmojiReactionData {
    const {reportID, reportAction, currentUserAccountID, openContextMenu, setIsEmojiPickerActive, hideAndRun, interceptAnonymousUser} = payload;

    const closeContextMenu = (onHideCallback?: () => void) => {
        hideAndRun(onHideCallback);
    };

    const toggleEmojiAndCloseMenu = (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => {
        toggleEmojiReaction(reportID, reportAction, emoji, existingReactions, preferredSkinTone, currentUserAccountID);
        closeContextMenu();
        setIsEmojiPickerActive?.(false);
    };

    const onPressOpenPicker = () => {
        openContextMenu();
        setIsEmojiPickerActive?.(true);
    };

    const onEmojiPickerClosed = () => {
        closeContextMenu();
        setIsEmojiPickerActive?.(false);
    };

    return {
        reportID,
        reportAction,
        reportActionID: reportAction?.reportActionID,
        toggleEmojiAndCloseMenu,
        closeContextMenu,
        onPressOpenPicker,
        onEmojiPickerClosed,
        interceptAnonymousUser,
    };
}

export default createEmojiReactionData;
export type {EmojiReactionData};
