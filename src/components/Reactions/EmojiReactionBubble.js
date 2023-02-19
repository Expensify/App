import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';

const propTypes = {
    /**
     * The emoji codes to display in the bubble.
     */
    emojiCodes: PropTypes.arrayOf(PropTypes.string).isRequired,

    /**
     * Called when the user presses on the reaction bubble.
     */
    onPress: PropTypes.func.isRequired,

    /**
     * Called when the user long presses or right clicks
     * on the reaction bubble.
     */
    onReactionListOpen: PropTypes.func,

    /**
     * The number of reactions to display in the bubble.
     */
    count: PropTypes.number,

    /**
     * Whether the user has reacted to this reaction.
     */
    hasUserReacted: PropTypes.bool,

    /**
     * The default size of the reaction bubble is defined
     * by the styles in styles.js. This scale factor can be used
     * to make the bubble bigger or smaller.
     */
    sizeScale: PropTypes.number,
};

const defaultProps = {
    count: 0,
    onReactionListOpen: () => {},
    hasUserReacted: false,
    sizeScale: 1,
};

const EmojiReactionBubble = props => (
    <Pressable
        style={({hovered}) => [
            styles.emojiReactionBubble,
            StyleUtils.getEmojiReactionBubbleStyle(hovered, props.hasUserReacted, props.sizeScale),
        ]}
        onPress={props.onPress}
        onLongPress={props.onReactionListOpen}
    >
        <Text style={[
            styles.emojiReactionText,
            StyleUtils.getEmojiReactionTextStyle(props.sizeScale),
        ]}
        >
            {props.emojiCodes.join('')}
        </Text>
        {props.count > 0 && (
        <Text style={[
            styles.reactionCounterText,
            StyleUtils.getEmojiReactionCounterTextStyle(props.hasUserReacted, props.sizeScale),
        ]}
        >
            {props.count}
        </Text>
        )}
    </Pressable>
);

EmojiReactionBubble.propTypes = propTypes;
EmojiReactionBubble.defaultProps = defaultProps;
EmojiReactionBubble.displayName = 'EmojiReactionBubble';

export default EmojiReactionBubble;
