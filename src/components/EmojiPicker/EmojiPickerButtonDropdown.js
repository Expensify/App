import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import * as Expensicons from '../Icon/Expensicons';
import Tooltip from '../Tooltip';
import Text from '../Text';
import Icon from '../Icon';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    /** Id to use for the emoji picker button */
    nativeID: PropTypes.string,

    /**
     * ReportAction for EmojiPicker.
     */
    reportAction: PropTypes.shape({
        reportActionID: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
    nativeID: '',
    reportAction: {},
};

function EmojiPickerButtonDropdown(props) {
    let emojiPopoverAnchor = null;
    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);

    const onEmojiSelected = (emoji) => {
      props.onInputChange(emoji);
    }
    return (
        <Tooltip text={props.translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={(el) => (emojiPopoverAnchor = el)}
                style={[styles.chatItemEmojiButton, styles.emojiPickerButtonDropdown, props.style]}
                disabled={props.isDisabled}
                onPress={() => EmojiPickerAction.showEmojiPicker(props.onModalHide, onEmojiSelected, emojiPopoverAnchor, undefined, () => {}, props.reportAction)}
                nativeID={props.nativeID}
                accessibilityLabel="statusEmoji"
                accessibilityRole="text"
            >
                {({hovered, pressed}) => (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                            style={styles.emojiPickerButtonDropdownIcon}
                            numberOfLines={1}
                        >
                            {props.value}
                        </Text>
                        <View
                            style={[styles.popoverMenuIcon, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled, {transform: [{rotate: '90deg'}]}]}
                        >
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
export default withLocalize(EmojiPickerButtonDropdown);
