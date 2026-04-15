import React, {useEffect} from 'react';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DomUtils from '@libs/DomUtils';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction} from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import {useComposerActions, useComposerMeta, useComposerSendState} from './ComposerContext';

type ComposerEmojiPickerProps = {
    reportID: string;
};

function ComposerEmojiPicker({reportID}: ComposerEmojiPickerProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isMediumScreenWidth} = useResponsiveLayout();
    const {focus} = useComposerActions();
    const {composerRef} = useComposerMeta();
    const {isBlockedFromConcierge} = useComposerSendState();

    const chatItemComposeSecondaryRowHeight = styles.chatItemComposeSecondaryRow.height + styles.chatItemComposeSecondaryRow.marginTop + styles.chatItemComposeSecondaryRow.marginBottom;
    const reportActionComposeHeight = styles.chatItemComposeBox.minHeight + chatItemComposeSecondaryRowHeight;
    const emojiOffsetWithComposeBox = (styles.chatItemComposeBox.minHeight - styles.chatItemEmojiButton.height) / 2;
    const emojiShiftVertical = reportActionComposeHeight - emojiOffsetWithComposeBox - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;

    // Hide emoji picker on unmount or when switching reports
    useEffect(
        () => () => {
            if (!isActiveEmojiPickerAction(reportID)) {
                return;
            }
            hideEmojiPicker();
        },
        [reportID],
    );

    if (canUseTouchScreen() && isMediumScreenWidth) {
        return null;
    }

    return (
        <EmojiPickerButton
            isDisabled={isBlockedFromConcierge}
            onModalHide={(isNavigating) => {
                if (isNavigating) {
                    return;
                }
                const activeElementId = DomUtils.getActiveElement()?.id;
                if (activeElementId === CONST.COMPOSER.NATIVE_ID || activeElementId === CONST.EMOJI_PICKER_BUTTON_NATIVE_ID) {
                    return;
                }
                focus();
            }}
            onEmojiSelected={(...args) => composerRef.current?.replaceSelectionWithText(...args)}
            emojiPickerID={reportID}
            shiftVertical={emojiShiftVertical}
        />
    );
}

export default ComposerEmojiPicker;
