import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import EmojiReactionBubble from './EmojiReactionBubble';
import AddReactionBubble from './AddReactionBubble';
import CONST from '../../CONST';

const EMOJI_BUBBLE_SCALE = 1.5;

const propTypes = {
    onEmojiSelected: PropTypes.func.isRequired,
    onPressOpenPicker: PropTypes.func,
};

const defaultProps = {
    onPressOpenPicker: () => {},
};

const QuickEmojiReactions = props => (
    <View style={{
        gap: 12,
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 12,
        justifyContent: 'space-between',
    }}
    >
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
            onSelectEmoji={props.onEmojiSelected}
            onPressOpenPicker={props.onPressOpenPicker}
        />
    </View>
);

QuickEmojiReactions.displayName = 'QuickEmojiReactions';
QuickEmojiReactions.propTypes = propTypes;
QuickEmojiReactions.defaultProps = defaultProps;
export default QuickEmojiReactions;
