import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import EmojiReactionBubble from '../EmojiReactionBubble';
import AddReactionBubble from '../AddReactionBubble';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import getPreferredEmojiCode from '../getPreferredEmojiCode';
import Tooltip from '../../Tooltip';

const baseQuickEmojiReactionsPropTypes = {
    /**
     * Callback to fire when an emoji is selected.
     */
    onEmojiSelected: PropTypes.func.isRequired,

    /**
     * Will be called when the emoji picker is about to show.
     */
    onWillShowPicker: PropTypes.func,

    /**
     * Callback to fire when the "open emoji picker" button is pressed.
     * The function receives an argument which can be called
     * to actually open the emoji picker.
     */
    onPressOpenPicker: PropTypes.func,
};

const baseQuickEmojiReactionsDefaultProps = {
    onWillShowPicker: () => {},
    onPressOpenPicker: () => {},
};

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const defaultProps = {
    ...baseQuickEmojiReactionsDefaultProps,
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
};

const BaseQuickEmojiReactions = (props) => (
    <View style={styles.quickReactionsContainer}>
        {_.map(CONST.QUICK_REACTIONS, (emoji) => (
            // Note: focus is handled by the Pressable component in EmojiReactionBubble
            <Tooltip
                text={`:${emoji.name}:`}
                key={emoji.name}
                focusable={false}
            >
                <EmojiReactionBubble
                    emojiCodes={[getPreferredEmojiCode(emoji, props.preferredSkinTone)]}
                    isContextMenu
                    onPress={() => {
                        props.onEmojiSelected(emoji);
                    }}
                />
            </Tooltip>
        ))}
        <AddReactionBubble
            isContextMenu
            onPressOpenPicker={props.onPressOpenPicker}
            onWillShowPicker={props.onWillShowPicker}
            onSelectEmoji={props.onEmojiSelected}
        />
    </View>
);

BaseQuickEmojiReactions.displayName = 'BaseQuickEmojiReactions';
BaseQuickEmojiReactions.propTypes = propTypes;
BaseQuickEmojiReactions.defaultProps = defaultProps;
export default withOnyx({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    },
})(BaseQuickEmojiReactions);

export {baseQuickEmojiReactionsPropTypes};
