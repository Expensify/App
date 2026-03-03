import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import {toggleEmojiReaction} from '@userActions/Report';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';

type EmojiReactionData = {
    reportID: string | undefined;
    reportAction: ReportAction | undefined;
    reportActionID: string | undefined;
    toggleEmojiAndCloseMenu: (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => void;
    closeContextMenu: (onHideCallback?: () => void) => void;
    onPressOpenPicker: () => void;
    onEmojiPickerClosed: () => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
};

type EmojiReactionParams = {
    reportID: string | undefined;
    reportAction: ReportAction | undefined;
    currentUserAccountID: number;
    openContextMenu: () => void;
    setIsEmojiPickerActive: ((state: boolean) => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
};

function createEmojiReactionData({reportID, reportAction, currentUserAccountID, openContextMenu, setIsEmojiPickerActive, hideAndRun, interceptAnonymousUser}: EmojiReactionParams): EmojiReactionData {
    const closeContextMenu = (onHideCallback?: () => void) => {
        hideAndRun(onHideCallback);
    };

    const toggleEmojiAndCloseMenu = (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => {
        if (reportAction) {
            toggleEmojiReaction(reportID, reportAction, emoji, existingReactions, preferredSkinTone, currentUserAccountID);
        }
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
