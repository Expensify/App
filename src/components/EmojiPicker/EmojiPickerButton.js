import React from 'react';
import {Keyboard, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import * as Expensicons from '../Icon/Expensicons';
import Tooltip from '../Tooltip';
import Icon from '../Icon';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withKeyboardState, {withKeyboardStatePropTypes} from '../withKeyboardState';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    ...withLocalizePropTypes,
    ...withKeyboardStatePropTypes,
};

const defaultProps = {
    isDisabled: false,
};

const EmojiPickerButton = (props) => {
    let emojiPopoverAnchor = null;
    return (
        <Pressable
            ref={el => emojiPopoverAnchor = el}
            style={({hovered, pressed}) => ([
                styles.chatItemEmojiButton,
                StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
            ])}
            disabled={props.isDisabled}
            onPress={() => {
                /* Dismiss the keyboard before opening the modal, this will prevent double press when selecting emoji */
                if (props.isShown) {
                    Keyboard.dismiss();
                }

                EmojiPickerAction.showEmojiPicker(props.onModalHide, props.onEmojiSelected, emojiPopoverAnchor);
            }}
        >
            {({hovered, pressed}) => (
                <Tooltip text={props.translate('reportActionCompose.emoji')}>
                    <Icon
                        src={Expensicons.Emoji}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                    />
                </Tooltip>
            )}
        </Pressable>
    );
};

EmojiPickerButton.propTypes = propTypes;
EmojiPickerButton.defaultProps = defaultProps;
EmojiPickerButton.displayName = 'EmojiPickerButton';
export default compose(
    withLocalize,
    withKeyboardState,
)(EmojiPickerButton);
