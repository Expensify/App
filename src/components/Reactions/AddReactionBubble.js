import React, {useRef, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Tooltip from '../Tooltip';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import getButtonState from '../../libs/getButtonState';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';
import variables from '../../styles/variables';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as Session from '../../libs/actions/Session';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import CONST from '../../CONST';

const propTypes = {
    /** Whether it is for context menu so we can modify its style */
    isContextMenu: PropTypes.bool,

    /**
     * Called when the user presses on the icon button.
     * Will have a function as parameter which you can call
     * to open the picker.
     */
    onPressOpenPicker: PropTypes.func,

    /**
     * Will get called the moment before the picker opens.
     */
    onWillShowPicker: PropTypes.func,

    /**
     * Called when the user selects an emoji.
     */
    onSelectEmoji: PropTypes.func.isRequired,

    /**
     * ReportAction for EmojiPicker.
     */
    reportAction: PropTypes.shape({
        reportActionID: PropTypes.string.isRequired,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isContextMenu: false,
    onWillShowPicker: () => {},
    onPressOpenPicker: undefined,
    reportAction: {},
};

function AddReactionBubble(props) {
    const ref = useRef();
    useEffect(() => EmojiPickerAction.resetEmojiPopoverAnchor, []);

    const onPress = () => {
        const openPicker = (refParam, anchorOrigin) => {
            EmojiPickerAction.showEmojiPicker(
                () => {},
                (emojiCode, emojiObject) => {
                    props.onSelectEmoji(emojiObject);
                },
                refParam || ref.current,
                anchorOrigin,
                props.onWillShowPicker,
                props.reportAction.reportActionID,
            );
        };

        if (!EmojiPickerAction.emojiPickerRef.current.isEmojiPickerVisible) {
            if (props.onPressOpenPicker) {
                props.onPressOpenPicker(openPicker);
            } else {
                openPicker();
            }
        } else {
            EmojiPickerAction.emojiPickerRef.current.hideEmojiPicker();
        }
    };

    return (
        <Tooltip text={props.translate('emojiReactions.addReactionTooltip')}>
            <PressableWithFeedback
                ref={ref}
                style={({hovered, pressed}) => [styles.emojiReactionBubble, styles.userSelectNone, StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, false, props.isContextMenu)]}
                onPress={Session.checkIfActionIsAllowed(onPress)}
                // Prevent text input blur when Add reaction is clicked
                onMouseDown={(e) => e.preventDefault()}
                accessibilityLabel={props.translate('emojiReactions.addReactionTooltip')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                // disable dimming
                pressDimmingValue={1}
            >
                {({hovered, pressed}) => (
                    <>
                        {/* This (invisible) text will make the view have the same size as a regular
                            emoji reaction. We make the text invisible and put the
                            icon on top of it. */}
                        <Text style={[styles.opacity0, StyleUtils.getEmojiReactionBubbleTextStyle(props.isContextMenu)]}>{'\u2800\u2800'}</Text>
                        <View style={styles.pAbsolute}>
                            <Icon
                                src={Expensicons.AddReaction}
                                width={props.isContextMenu ? variables.iconSizeNormal : variables.iconSizeSmall}
                                height={props.isContextMenu ? variables.iconSizeNormal : variables.iconSizeSmall}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                            />
                        </View>
                    </>
                )}
            </PressableWithFeedback>
        </Tooltip>
    );
}

AddReactionBubble.propTypes = propTypes;
AddReactionBubble.defaultProps = defaultProps;
AddReactionBubble.displayName = 'AddReactionBubble';

export default withLocalize(AddReactionBubble);
