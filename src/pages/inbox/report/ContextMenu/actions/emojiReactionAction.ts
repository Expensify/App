import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import {isActionOfType, isMessageDeleted} from '@libs/ReportActionsUtils';
import {toggleEmojiReaction} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';

type EmojiReactionData = {
    reportID: string | undefined;
    reportAction: ReportAction | undefined;
    reportActionID: string | undefined;
    toggleEmojiAndCloseMenu: (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => void;
    closeContextMenu: (onHideCallback?: () => void) => void;
    onPressOpenPicker: () => void;
    onEmojiPickerClosed: () => void;
};

type EmojiReactionParams = {
    reportID: string | undefined;
    reportAction: ReportAction | undefined;
    currentUserAccountID: number;
    openContextMenu: () => void;
    setIsEmojiPickerActive: ((state: boolean) => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
};

function shouldShowEmojiReaction({reportAction}: {reportAction: OnyxEntry<ReportAction>}): boolean {
    const isDEWRouted = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
    return !!reportAction && 'message' in reportAction && !isMessageDeleted(reportAction) && !isDEWRouted;
}

function createEmojiReactionData({reportID, reportAction, currentUserAccountID, openContextMenu, setIsEmojiPickerActive, hideAndRun}: EmojiReactionParams): EmojiReactionData {
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
    };
}

export default createEmojiReactionData;
export {shouldShowEmojiReaction};
