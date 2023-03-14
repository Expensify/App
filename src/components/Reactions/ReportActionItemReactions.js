import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import useSound from 'use-sound';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import emojis from '../../../assets/emojis';
import AddReactionBubble from './AddReactionBubble';
import getPreferredEmojiCode from './getPreferredEmojiCode';

import fartSound from '../../../assets/sounds/short_fart.wav';

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

const ReportActionItemReactions = (props) => {
    const [playOn] = useSound(
        fartSound,
        {volume: 1},
    );
    const reactionsWithCount = _.filter(props.reactions, reaction => reaction.users.length > 0);

    return (
        <View style={[styles.flexRow, styles.flexWrap]}>
            {_.map(reactionsWithCount, (reaction) => {
                const reactionCount = reaction.users.length;
                if (reactionCount === 0) {
                    return null;
                }

                const reactionUsers = _.map(reaction.users, sender => sender.accountID);
                const emoji = _.find(emojis, e => e.name === reaction.emoji);
                const emojiCodes = getUniqueEmojiCodes(emoji, reaction.users);

                const onPress = () => {
                    playOn();
                    props.toggleReaction(emoji);
                };

                return (
                    <EmojiReactionBubble
                        key={reaction.emoji}
                        count={reactionCount}
                        emojiName={reaction.emoji}
                        emojiCodes={emojiCodes}
                        onPress={onPress}
                        reactionUsers={reactionUsers}
                    />
                );
            })}
            {reactionsWithCount.length > 0 && (
            <AddReactionBubble onSelectEmoji={(emojiObject) => {
                playOn();
                props.toggleReaction(emojiObject);
            }}
            />
            )}
        </View>
    );
};

ReportActionItemReactions.displayName = 'ReportActionItemReactions';
ReportActionItemReactions.propTypes = propTypes;
export default ReportActionItemReactions;
