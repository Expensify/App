import {useIsFocused} from '@react-navigation/native';
import React, {memo, useContext, useEffect, useRef} from 'react';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';

type EmojiPickerButtonProps = {
    /** Flag to disable the emoji picker button */
    isDisabled?: boolean;

    /** Unique id for emoji picker */
    emojiPickerID?: string;

    /** A callback function when the button is pressed */
    onPress?: PressableProps['onPress'];

    /** Emoji popup anchor offset shift vertical */
    shiftVertical?: number;

    onModalHide: EmojiPickerAction.OnModalHideValue;

    onEmojiSelected: EmojiPickerAction.OnEmojiSelected;
};

function EmojiPickerButton({isDisabled = false, emojiPickerID = '', shiftVertical = 0, onPress, onModalHide, onEmojiSelected}: EmojiPickerButtonProps) {
    const actionSheetContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const emojiPopoverAnchor = useRef(null);
    const {translate} = useLocalize();
    const isFocused = useIsFocused();

    const openEmojiPicker: PressableProps['onPress'] = (e) => {
        if (!isFocused) {
            return;
        }

        actionSheetContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.CLOSE_KEYBOARD,
        });

        if (!EmojiPickerAction.emojiPickerRef?.current?.isEmojiPickerVisible) {
            EmojiPickerAction.showEmojiPicker(
                onModalHide,
                onEmojiSelected,
                emojiPopoverAnchor,
                {
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                    shiftVertical,
                },
                () => {},
                emojiPickerID,
            );
        } else {
            EmojiPickerAction.emojiPickerRef.current.hideEmojiPicker();
        }
        onPress?.(e);
    };

    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);

    return (
        <Tooltip text={translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={({hovered, pressed}) => [styles.chatItemEmojiButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                disabled={isDisabled}
                onPress={openEmojiPicker}
                id={CONST.EMOJI_PICKER_BUTTON_NATIVE_ID}
                accessibilityLabel={translate('reportActionCompose.emoji')}
            >
                {({hovered, pressed}) => (
                    <Icon
                        src={Expensicons.Emoji}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                    />
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

EmojiPickerButton.displayName = 'EmojiPickerButton';
export default memo(EmojiPickerButton);
