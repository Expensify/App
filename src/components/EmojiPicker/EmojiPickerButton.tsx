import {useIsFocused} from '@react-navigation/native';
import React, {memo, useContext, useEffect, useRef} from 'react';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import Icon from '@components/Icon';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import {emojiPickerRef, resetEmojiPopoverAnchor, showEmojiPicker} from '@userActions/EmojiPickerAction';
import type {EmojiPickerOnModalHide, OnEmojiSelected} from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

type EmojiPickerButtonProps = {
    /** Flag to disable the emoji picker button */
    isDisabled?: boolean;

    /** Unique id for emoji picker */
    emojiPickerID?: string;

    /** A callback function when the button is pressed */
    onPress?: PressableProps['onPress'];

    /** Emoji popup anchor offset shift vertical */
    shiftVertical?: number;

    onModalHide: EmojiPickerOnModalHide;

    onEmojiSelected: OnEmojiSelected;
};

function EmojiPickerButton({isDisabled = false, emojiPickerID = '', shiftVertical = 0, onPress, onModalHide, onEmojiSelected}: EmojiPickerButtonProps) {
    const actionSheetContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const emojiPopoverAnchor = useRef(null);
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const icons = useMemoizedLazyExpensifyIcons(['Emoji']);

    const openEmojiPicker: PressableProps['onPress'] = (e) => {
        if (!isFocused) {
            return;
        }

        actionSheetContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.CLOSE_KEYBOARD,
        });

        if (!emojiPickerRef?.current?.isEmojiPickerVisible) {
            KeyboardUtils.dismissKeyboardAndExecute(() => {
                showEmojiPicker({
                    onModalHide,
                    onEmojiSelected,
                    emojiPopoverAnchor,
                    anchorOrigin: {
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                        shiftVertical,
                    },
                    id: emojiPickerID,
                });
            });
        } else {
            emojiPickerRef.current.hideEmojiPicker();
        }
        onPress?.(e);
    };

    useEffect(() => resetEmojiPopoverAnchor, []);

    return (
        <Tooltip text={translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={({hovered, pressed}) => [styles.chatItemEmojiButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                disabled={isDisabled}
                onPress={openEmojiPicker}
                id={CONST.EMOJI_PICKER_BUTTON_NATIVE_ID}
                accessibilityLabel={translate('reportActionCompose.emoji')}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.EMOJI_PICKER.BUTTON}
            >
                {({hovered, pressed}) => (
                    <Icon
                        src={icons.Emoji}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                    />
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

export default memo(EmojiPickerButton);
