import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import EmojiReactionBubble from '../EmojiReactionBubble';
import AddReactionBubble from '../AddReactionBubble';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';

const EMOJI_BUBBLE_SCALE = 1.5;

const baseQuickEmojiReactionsPropTypes = {
    onEmojiSelected: PropTypes.func.isRequired,
    onWillShowPicker: PropTypes.func,
    onPressOpenPicker: PropTypes.func,
};

const baseQuickEmojiReactionsDefaultProps = {
    onWillShowPicker: undefined,
    onPressOpenPicker: undefined,
};

const BaseQuickEmojiReactions = props => (
    <View style={styles.quickReactionsContainer}>
        {_.map(CONST.QUICK_REACTIONS, reaction => (
            <EmojiReactionBubble
                key={reaction.name}
                emojiName={reaction.name}
                emojiCodes={[reaction.code]}
                sizeScale={EMOJI_BUBBLE_SCALE}
                onPress={() => {
                    props.onEmojiSelected(reaction);
                }}
            />
        ))}
        <AddReactionBubble
            iconSizeScale={1.2}
            sizeScale={EMOJI_BUBBLE_SCALE}
            onPressOpenPicker={props.onPressOpenPicker}
            onWillShowPicker={props.onWillShowPicker}
            onSelectEmoji={props.onEmojiSelected}
        />
    </View>
);

BaseQuickEmojiReactions.displayName = 'BaseQuickEmojiReactions';
BaseQuickEmojiReactions.propTypes = baseQuickEmojiReactionsPropTypes;
BaseQuickEmojiReactions.defaultProps = baseQuickEmojiReactionsDefaultProps;
export default BaseQuickEmojiReactions;

export {
    baseQuickEmojiReactionsPropTypes,
    baseQuickEmojiReactionsDefaultProps,
};
