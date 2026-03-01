import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {toggleEmojiReaction} from '@userActions/Report';
import type {ReportActionReactions} from '@src/types/onyx';

type EmojiReactionData = {
    reportID: string | undefined;
    reportAction: ReturnType<typeof useContextMenuPayload>['reportAction'];
    reportActionID: string | undefined;
    toggleEmojiAndCloseMenu: (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => void;
    closeContextMenu: (onHideCallback?: () => void) => void;
    onPressOpenPicker: () => void;
    onEmojiPickerClosed: () => void;
    interceptAnonymousUser: ReturnType<typeof useContextMenuPayload>['interceptAnonymousUser'];
};

function useEmojiReactionData(): EmojiReactionData {
    const {reportID, reportAction, currentUserAccountID, openContextMenu, setIsEmojiPickerActive, hideAndRun, interceptAnonymousUser} = useContextMenuPayload();

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

export default useEmojiReactionData;
export type {EmojiReactionData};
