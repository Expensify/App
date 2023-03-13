import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import useSound from 'use-sound';
import EmojiReactionBubble from '../EmojiReactionBubble';
import AddReactionBubble from '../AddReactionBubble';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import getPreferredEmojiCode from '../getPreferredEmojiCode';
import Tooltip from '../../Tooltip';

import fartSound from '../../../../assets/sounds/short_fart.wav';

const EMOJI_BUBBLE_SCALE = 1.5;

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

const propTypes = {
    ...baseQuickEmojiReactionsPropTypes,
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

const BaseQuickEmojiReactions = (props) => {
    const [playOn] = useSound(
        fartSound,
        {volume: 1},
    );
    return (
        <View style={styles.quickReactionsContainer}>
            {_.map(CONST.QUICK_REACTIONS, emoji => (

                // Note: focus is handled by the Pressable component in EmojiReactionBubble
                <Tooltip text={`:${emoji.name}:`} key={emoji.name} focusable={false}>
                    <EmojiReactionBubble
                        emojiName={emoji.name}
                        emojiCodes={[getPreferredEmojiCode(emoji, props.preferredSkinTone)]}
                        sizeScale={EMOJI_BUBBLE_SCALE}
                        onPress={() => {
                            playOn();
                            props.onEmojiSelected(emoji);
                        }}
                    />
                </Tooltip>
            ))}
            <AddReactionBubble
                iconSizeScale={1.2}
                sizeScale={EMOJI_BUBBLE_SCALE}
                onPressOpenPicker={props.onPressOpenPicker}
                onWillShowPicker={props.onWillShowPicker}
                onSelectEmoji={(emojiObject) => {
                    playOn();
                    props.onEmojiSelected(emojiObject);
                }}
            />
        </View>
    );
};

BaseQuickEmojiReactions.displayName = 'BaseQuickEmojiReactions';
BaseQuickEmojiReactions.propTypes = propTypes;
export default withOnyx({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    },
})(BaseQuickEmojiReactions);

export {
    baseQuickEmojiReactionsPropTypes,
};
