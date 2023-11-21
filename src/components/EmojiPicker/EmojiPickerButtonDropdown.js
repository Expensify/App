import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import getButtonState from '@libs/getButtonState';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
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
    const emojiPopoverAnchor = useRef(null);
    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);

    const onPress = () => {
        if (EmojiPickerAction.isEmojiPickerVisible()) {
            EmojiPickerAction.hideEmojiPicker();
            return;
        }

        EmojiPickerAction.showEmojiPicker(props.onModalHide, (emoji) => props.onInputChange(emoji), emojiPopoverAnchor.current, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            shiftVertical: 4,
        });
    };

    return (
        <Tooltip text={props.translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={styles.emojiPickerButtonDropdown}
                disabled={props.isDisabled}
                onPress={onPress}
                id="emojiDropdownButton"
                accessibilityLabel="statusEmoji"
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                {({hovered, pressed}) => (
                    <View style={styles.emojiPickerButtonDropdownContainer}>
                        <Text
                            style={styles.emojiPickerButtonDropdownIcon}
                            numberOfLines={1}
                        >
                            {props.value}
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
