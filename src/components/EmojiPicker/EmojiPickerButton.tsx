import {useIsFocused} from '@react-navigation/native';
import React, {memo, useEffect, useRef} from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
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

    /** Id to use for the emoji picker button */
    id?: string;

    /** Unique id for emoji picker */
    emojiPickerID?: string;

    /** Emoji popup anchor offset shift vertical */
    shiftVertical?: number;

    onModalHide: EmojiPickerAction.OnModalHideValue;

    onEmojiSelected: EmojiPickerAction.OnEmojiSelected;
};

function EmojiPickerButton({isDisabled = false, id = '', emojiPickerID = '', shiftVertical = 0, onModalHide, onEmojiSelected}: EmojiPickerButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const emojiPopoverAnchor = useRef(null);
    const {translate} = useLocalize();
    const isFocused = useIsFocused();

    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);

    return (
        <Tooltip text={translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={({hovered, pressed}) => [styles.chatItemEmojiButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                disabled={isDisabled}
                onPress={() => {
                    if (!isFocused) {
                        return;
                    }
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
                }}
                id={id}
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
