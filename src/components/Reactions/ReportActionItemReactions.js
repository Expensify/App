import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import withCurrentUserPersonalDetails, {
    withCurrentUserPersonalDetailsDefaultProps,
    withCurrentUserPersonalDetailsPropTypes,
} from '../withCurrentUserPersonalDetails';
import emojis from '../../../assets/emojis';

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
        const emojiCode = (emoji.types && emoji.types[user.skinTone]) ? emoji.types[user.skinTone] : emoji.code;

        if (emojiCode && !emojiCodes.includes(emojiCode)) {
            emojiCodes.push(emojiCode);
        }
    });
    return emojiCodes;
};

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    reactions: PropTypes.arrayOf(PropTypes.object).isRequired,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const ReportActionItemReactions = props => (
    <View style={[styles.flexRow, styles.flexWrap]}>
        {_.map(props.reactions, (reaction) => {
            const reactionCount = reaction.users.length;
            const hasUserReacted = _.find(reaction.users, reactor => reactor.accountID === props.currentUserPersonalDetails.accountID) != null;
            const senderIDs = _.map(reaction.users, sender => sender.login);
            const emoji = _.find(emojis, e => e.name === reaction.emoji);
            const emojiCodes = getUniqueEmojiCodes(emoji, reaction.users);

            return (
                <EmojiReactionBubble
                    key={reaction.emoji}
                    count={reactionCount}
                    emojiName={reaction.emoji}
                    emojiCodes={emojiCodes}
                    hasUserReacted={hasUserReacted}
                    onPress={console.log}

                            // onPress={() => this.removeReaction(reaction.emojiCodes[0])}
                    // onLongPress={() => ReactionsContextMenu.showContextMenu(reactions)}
                    senderIDs={senderIDs}
                />
            );
        })}
        {/* {props.reactions && props.reactions.length > 0 && <AddReactionBubble onSelectEmoji={this.addReaction} />} */}
    </View>
);

ReportActionItemReactions.displayName = 'ReportActionItemReactions';
ReportActionItemReactions.propTypes = propTypes;
ReportActionItemReactions.defaultProps = defaultProps;
export default withCurrentUserPersonalDetails(ReportActionItemReactions);
