import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {toggleEmojiReaction} from '@userActions/Report';
import type {ReportActionReactions} from '@src/types/onyx';

function EmojiReaction() {
    const {reportID, reportAction, currentUserAccountID, close, openContextMenu, setIsEmojiPickerActive, isMini, interceptAnonymousUser} = useContextMenuPayload();

    const closeContextMenu = (onHideCallback?: () => void) => {
        if (isMini) {
            close();
            if (onHideCallback) {
                onHideCallback();
            }
        } else {
            hideContextMenu(false, onHideCallback);
        }
    };

    const toggleEmojiAndCloseMenu = (emoji: Emoji, existingReactions: OnyxEntry<ReportActionReactions>, preferredSkinTone: number) => {
        toggleEmojiReaction(reportID, reportAction, emoji, existingReactions, preferredSkinTone, currentUserAccountID);
        closeContextMenu();
        setIsEmojiPickerActive?.(false);
    };

    if (isMini) {
        return (
            <MiniQuickEmojiReactions
                onEmojiSelected={(emoji, existingReactions, preferredSkinTone) => interceptAnonymousUser(() => toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))}
                onPressOpenPicker={() => {
                    openContextMenu();
                    setIsEmojiPickerActive?.(true);
                }}
                onEmojiPickerClosed={() => {
                    closeContextMenu();
                    setIsEmojiPickerActive?.(false);
                }}
                reportActionID={reportAction?.reportActionID}
                reportAction={reportAction}
            />
        );
    }

    return (
        <QuickEmojiReactions
            closeContextMenu={closeContextMenu}
            onEmojiSelected={(emoji, existingReactions, preferredSkinTone) => interceptAnonymousUser(() => toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))}
            reportActionID={reportAction?.reportActionID}
            reportAction={reportAction}
            setIsEmojiPickerActive={setIsEmojiPickerActive}
        />
    );
}

export default EmojiReaction;
