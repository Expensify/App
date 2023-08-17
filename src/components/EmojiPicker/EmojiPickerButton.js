import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import * as Expensicons from '../Icon/Expensicons';
import Tooltip from '../Tooltip';
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

function EmojiPickerButton(props) {
    const emojiPopoverAnchor = useRef(null);

    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);

    return (
        <Tooltip text={props.translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={({hovered, pressed}) => [styles.chatItemEmojiButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                disabled={props.isDisabled}
                onPress={() => {
                    if (!EmojiPickerAction.emojiPickerRef.current.isEmojiPickerVisible) {
                        EmojiPickerAction.showEmojiPicker(props.onModalHide, props.onEmojiSelected, emojiPopoverAnchor.current, undefined, () => {}, props.reportAction);
                    } else {
                        EmojiPickerAction.emojiPickerRef.current.hideEmojiPicker();
                    }
                }}
                nativeID={props.nativeID}
                accessibilityLabel={props.translate('reportActionCompose.emoji')}
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

EmojiPickerButton.propTypes = propTypes;
EmojiPickerButton.defaultProps = defaultProps;
EmojiPickerButton.displayName = 'EmojiPickerButton';
export default withLocalize(EmojiPickerButton);
