import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
};

function EmojiPickerButtonDropdown(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const emojiPopoverAnchor = useRef(null);
    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);
    const onPress = () => {
        if (EmojiPickerAction.isEmojiPickerVisible()) {
            EmojiPickerAction.hideEmojiPicker();
            return;
        }

        EmojiPickerAction.showEmojiPicker(
            props.onModalHide,
            (emoji) => props.onInputChange(emoji),
            emojiPopoverAnchor,
            {
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                shiftVertical: 4,
            },
            () => {},
            undefined,
            props.value,
        );
    };

    return (
        <Tooltip text={props.translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={[styles.emojiPickerButtonDropdown, props.style]}
                disabled={props.isDisabled}
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
                            {props.value || (
                                <Icon
                                    src={Expensicons.Emoji}
                                    fill={StyleUtils.getIconFillColor(CONST.BUTTON_STATES.DISABLED)}
                                />
                            )}
                        </Text>
                        <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled, styles.rotate90]}>
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

EmojiPickerButtonDropdown.propTypes = propTypes;
EmojiPickerButtonDropdown.defaultProps = defaultProps;
EmojiPickerButtonDropdown.displayName = 'EmojiPickerButtonDropdown';

const EmojiPickerButtonDropdownWithRef = React.forwardRef((props, ref) => (
    <EmojiPickerButtonDropdown
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

EmojiPickerButtonDropdownWithRef.displayName = 'EmojiPickerButtonDropdownWithRef';

export default withLocalize(EmojiPickerButtonDropdownWithRef);
