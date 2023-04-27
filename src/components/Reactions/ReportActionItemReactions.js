import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import emojis from '../../../assets/emojis';
import AddReactionBubble from './AddReactionBubble';
import getPreferredEmojiCode from './getPreferredEmojiCode';
import Tooltip from '../Tooltip';
import ReactionTooltipContent from './ReactionTooltipContent';

/**
 * Given an emoji object and a list of senders it will return an
 * array of emoji codes, that represents all used variations of the
 * emoji.
 * @param {{ name: string, code: string, types: string[] }} emoji
 * @param {Array} users
 * @return {string[]}
 * */
const getUniqueEmojiCodes = (emoji, users) => {
    const emojiCodes = [];
    _.forEach(users, (user) => {
        const emojiCode = getPreferredEmojiCode(emoji, user.skinTone);

        if (emojiCode && !emojiCodes.includes(emojiCode)) {
            emojiCodes.push(emojiCode);
        }
    });
    return emojiCodes;
};

const propTypes = {
    /**
     * An array of objects containing the reaction data.
     * The shape of a reaction looks like this:
     *
     * "reactionName": {
     *     emoji: string,
     *     users: {
     *         accountID: string,
     *         skinTone: number,
     *     }[]
     * }
     */
    // eslint-disable-next-line react/forbid-prop-types
    reactions: PropTypes.arrayOf(PropTypes.object).isRequired,

    /**
     * Function to call when the user presses on an emoji.
     * This can also be an emoji the user already reacted with,
     * hence this function asks to toggle the reaction by emoji.
     */
    toggleReaction: PropTypes.func.isRequired,
};

const ReportActionItemReactions = props => (
    <View style={[styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2]}>
        {_.map(props.reactions, (reaction, reactionEmoji) => {
            const reactionCount = _.size(reaction.users);
            const emoji = _.find(emojis, e => e.name === reactionEmoji);
            const emojiCodes = getUniqueEmojiCodes(emoji, reaction.users);

            const onPress = () => {
                props.toggleReaction(emoji);
            };

            return (
                <Tooltip
                    renderTooltipContent={() => (
                        <ReactionTooltipContent
                            emojiName={reactionEmoji}
                            emojiCodes={emojiCodes}
                            accountIDs={_.keys(reaction.users)}
                        />
                    )}
                    key={reaction.emoji}
                >
                    <EmojiReactionBubble
                        count={reactionCount}
                        emojiCodes={emojiCodes}
                        onPress={onPress}
                        reactionUsers={_.keys(reaction.users)}
                    />
                </Tooltip>
            );
        })}
        {_.size(props.reactions) > 0 && <AddReactionBubble onSelectEmoji={props.toggleReaction} />}
    </View>
);

ReportActionItemReactions.displayName = 'ReportActionItemReactions';
ReportActionItemReactions.propTypes = propTypes;
export default ReportActionItemReactions;
