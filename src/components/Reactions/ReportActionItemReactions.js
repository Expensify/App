import React, {useRef} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import emojis from '../../../assets/emojis';
import AddReactionBubble from './AddReactionBubble';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import getPreferredEmojiCode from './getPreferredEmojiCode';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import * as Report from '../../libs/actions/Report';
import * as ReactionList from '../../pages/home/report/ReactionList/ReactionList';
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

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const ReportActionItemReactions = (props) => {
    const popoverReactionListAnchor = useRef(null);
    const reactionsWithCount = _.filter(props.reactions, (reaction) => reaction.users.length > 0);

    return (
        <View
            ref={popoverReactionListAnchor}
            style={[styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2]}
        >
            {_.map(reactionsWithCount, (reaction) => {
                const reactionCount = reaction.users.length;
                const reactionUsers = _.map(reaction.users, (sender) => sender.accountID.toString());
                const emoji = _.find(emojis, (e) => e.name === reaction.emoji);
                const emojiCodes = getUniqueEmojiCodes(emoji, reaction.users);
                const hasUserReacted = Report.hasAccountIDReacted(props.currentUserPersonalDetails.accountID, reactionUsers);

                const onPress = () => {
                    props.toggleReaction(emoji);
                };
                const onReactionListOpen = (event) => {
                    const users = PersonalDetailsUtils.getPersonalDetailsByIDs(reactionUsers);
                    ReactionList.showReactionList(event, popoverReactionListAnchor.current, users, reaction.emoji, emojiCodes, reactionCount, hasUserReacted);
                };

                return (
                    <Tooltip
                        renderTooltipContent={() => (
                            <ReactionTooltipContent
                                emojiName={reaction.emoji}
                                emojiCodes={emojiCodes}
                                accountIDs={reactionUsers}
                            />
                        )}
                        renderTooltipContentKey={[...reactionUsers, ...emojiCodes]}
                        key={reaction.emoji}
                    >
                        <EmojiReactionBubble
                            ref={props.forwardedRef}
                            count={reactionCount}
                            emojiCodes={emojiCodes}
                            onPress={onPress}
                            reactionUsers={reactionUsers}
                            hasUserReacted={hasUserReacted}
                            onReactionListOpen={onReactionListOpen}
                        />
                    </Tooltip>
                );
            })}
            {reactionsWithCount.length > 0 && <AddReactionBubble onSelectEmoji={props.toggleReaction} />}
        </View>
    );
};

ReportActionItemReactions.displayName = 'ReportActionItemReactions';
ReportActionItemReactions.propTypes = propTypes;
ReportActionItemReactions.defaultProps = defaultProps;
export default withCurrentUserPersonalDetails(ReportActionItemReactions);
