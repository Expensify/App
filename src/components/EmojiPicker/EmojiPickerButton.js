import React, {useEffect, useRef, useContext} from 'react';
import PropTypes from 'prop-types';

import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import getButtonState from '@libs/getButtonState';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';

import * as ActionSheetAwareScrollView from '../ActionSheetAwareScrollView';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    /** Id to use for the emoji picker button */
    nativeID: PropTypes.string,

    /** Unique id for emoji picker */
    emojiPickerID: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
    nativeID: '',
    emojiPickerID: '',
};

function EmojiPickerButton(props) {
    const actionSheetContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);

    const emojiPopoverAnchor = useRef(null);

    const onPress = () => {
        actionSheetContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.OPEN_EMOJI_PICKER_POPOVER_STANDALONE,
        });

        const onHide = () => {
            actionSheetContext.transitionActionSheetState({
                type: ActionSheetAwareScrollView.Actions.CLOSE_EMOJI_PICKER_POPOVER_STANDALONE,
            });

            if (props.onModalHide) {
                props.onModalHide();
            }
        };

        if (!EmojiPickerAction.emojiPickerRef.current.isEmojiPickerVisible) {
            EmojiPickerAction.showEmojiPicker(onHide, props.onEmojiSelected, emojiPopoverAnchor.current, undefined, () => {}, props.emojiPickerID);
        } else {
            EmojiPickerAction.emojiPickerRef.current.hideEmojiPicker();
        }
    };

    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);

    return (
        <Tooltip text={props.translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback
                ref={emojiPopoverAnchor}
                style={({hovered, pressed}) => [styles.chatItemEmojiButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed))]}
                disabled={props.isDisabled}
                onPress={onPress}
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
