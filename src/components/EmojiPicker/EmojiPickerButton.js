import React, {useEffect, useRef, useContext} from 'react';
import PropTypes from 'prop-types';

import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withNavigationFocus from '@components/withNavigationFocus';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import getButtonState from '@libs/getButtonState';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';

import * as ActionSheetAwareScrollView from '../ActionSheetAwareScrollView';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    /** Id to use for the emoji picker button */
    id: PropTypes.string,

    /** Unique id for emoji picker */
    emojiPickerID: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
    id: '',
    emojiPickerID: '',
};

function EmojiPickerButton(props) {
    const actionSheetContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const emojiPopoverAnchor = useRef(null);

    const onPress = () => {
        if (!props.isFocused) {
            return;
        }

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
            EmojiPickerAction.showEmojiPicker(onHide, props.onEmojiSelected, emojiPopoverAnchor, undefined, () => {}, props.emojiPickerID);
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
                id={props.id}
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

export default compose(withLocalize, withNavigationFocus)(EmojiPickerButton);
