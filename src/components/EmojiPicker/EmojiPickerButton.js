import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import * as Expensicons from '../Icon/Expensicons';
import Tooltip from '../Tooltip';
import Icon from '../Icon';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    /** Id to use for the emoji picker button */
    nativeID: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
    nativeID: '',
};

const EmojiPickerButton = (props) => {
    let emojiPopoverAnchor = null;
    return (
        <Tooltip text={props.translate('reportActionCompose.emoji')}>
            <PressableWithFeedback
                ref={(el) => (emojiPopoverAnchor = el)}
                style={({hovered, pressed}) => [styles.chatItemEmojiButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                disabled={props.isDisabled}
                onPress={() => EmojiPickerAction.showEmojiPicker(props.onModalHide, props.onEmojiSelected, emojiPopoverAnchor)}
                nativeID={props.nativeID}
                accessibilityRole="button"
                accessibilityLabel={props.translate('reportActionCompose.emoji')}
                hoverDimmingValue={1}
                pressDimmingValue={1}
            >
                {({hovered, pressed}) => (
                    <Icon
                        src={Expensicons.Emoji}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                    />
                )}
            </PressableWithFeedback>
        </Tooltip>
    );
};

EmojiPickerButton.propTypes = propTypes;
EmojiPickerButton.defaultProps = defaultProps;
EmojiPickerButton.displayName = 'EmojiPickerButton';
export default withLocalize(EmojiPickerButton);
