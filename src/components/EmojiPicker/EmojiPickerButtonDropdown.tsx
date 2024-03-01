import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import useLocalize from '@hooks/useLocalize';

type EmojiPickerButtonDropdownProps = {
    /** Flag to disable the emoji picker button */
    isDisabled?: boolean,

    onModalHide: EmojiPickerAction.OnModalHideValue,

    onInputChange: (emoji: string) => void,

    value?: string

    disabled?: boolean

    style: StyleProp<ViewStyle>

}

function EmojiPickerButtonDropdown({isDisabled, onModalHide, onInputChange, value, disabled, style}: EmojiPickerButtonDropdownProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const emojiPopoverAnchor = useRef(null);
    const {translate} = useLocalize();

    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);
    const onPress = () => {
        if (EmojiPickerAction.isEmojiPickerVisible()) {
            EmojiPickerAction.hideEmojiPicker();
            return;
        }

        EmojiPickerAction.showEmojiPicker(
            onModalHide,
            (emoji) => onInputChange(emoji),
            emojiPopoverAnchor,
            {
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                shiftVertical: 4,
            },
            () => {},
            undefined,
            value,
        );
    };

    return (
        <Tooltip text={translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={[styles.emojiPickerButtonDropdown, style]}
                disabled={isDisabled}
                onPress={onPress}
                id="emojiDropdownButton"
                accessibilityLabel="statusEmoji"
                role={CONST.ROLE.BUTTON}
            >
                {({hovered, pressed}) => (
                    <View style={styles.emojiPickerButtonDropdownContainer}>
                        <Text
                            style={styles.emojiPickerButtonDropdownIcon}
                            numberOfLines={1}
                        >
                            {value ?? (
                                <Icon
                                    src={Expensicons.Emoji}
                                    fill={StyleUtils.getIconFillColor(CONST.BUTTON_STATES.DISABLED)}
                                />
                            )}
                        </Text>
                        <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, disabled && styles.cursorDisabled, styles.rotate90]}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                            />
                        </View>
                    </View>
                )}
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

EmojiPickerButtonDropdown.displayName = 'EmojiPickerButtonDropdown';

export default React.forwardRef(EmojiPickerButtonDropdown);
