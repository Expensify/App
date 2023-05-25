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
import Tooltip from '../../Tooltip';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import EmojiReactionsPropTypes from '../EmojiReactionsPropTypes';

const baseQuickEmojiReactionsPropTypes = {
    ...EmojiReactionsPropTypes,

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
    emojiReactions: {},
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
            <Tooltip
                text={`:${emoji.name}:`}
                key={emoji.name}
            >
                <View>
                    <EmojiReactionBubble
                        emojiCodes={[EmojiUtils.getPreferredEmojiCode(emoji, props.preferredSkinTone)]}
                        isContextMenu
                        onPress={() => {
                            props.onEmojiSelected(emoji);
                        }}
                    />
                </View>
            </Tooltip>
        ))}
        <AddReactionBubble
            isContextMenu
            onPressOpenPicker={props.onPressOpenPicker}
            onWillShowPicker={props.onWillShowPicker}
            onSelectEmoji={(emoji) => props.onEmojiSelected(emoji, props.emojiReactions)}
        />
    </View>
);

BaseQuickEmojiReactions.displayName = 'BaseQuickEmojiReactions';
BaseQuickEmojiReactions.propTypes = propTypes;
BaseQuickEmojiReactions.defaultProps = defaultProps;
// ESLint throws an error because it can't see that emojiReactions is defined in props. It is defined in props, but
// because of a couple spread operators, I think that's why ESLint struggles to see it
// eslint-disable-next-line rulesdir/onyx-props-must-have-default
export default withOnyx({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    },
    emojiReactions: {
        key: ({reportID, reportActionID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportID}${reportActionID}`,
    },
})(BaseQuickEmojiReactions);

export {baseQuickEmojiReactionsPropTypes, baseQuickEmojiReactionsDefaultProps};
