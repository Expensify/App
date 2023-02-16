import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import styles from '../../styles/styles';
import Text from '../Text';
import * as StyleUtils from '../../styles/StyleUtils';

const propTypes = {
    emojiCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
    onPress: PropTypes.func.isRequired,
    onLongPress: PropTypes.func,
    count: PropTypes.number,
    hasUserReacted: PropTypes.bool,
    sizeScale: PropTypes.number,
};

const defaultProps = {
    count: 0,
    onLongPress: () => {},
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
        onLongPress={props.onLongPress}
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
