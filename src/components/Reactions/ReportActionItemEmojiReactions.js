import React, {useRef} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import emojis from '../../../assets/emojis';
import AddReactionBubble from './AddReactionBubble';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import getPreferredEmojiCode from './getPreferredEmojiCode';
import Tooltip from '../Tooltip';
import ReactionTooltipContent from './ReactionTooltipContent';
import * as Report from '../../libs/actions/Report';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import * as ReactionList from '../../pages/home/report/ReactionList/ReactionList';

/**
 * Given an emoji object and a list of senders it will return an
 * array of emoji codes, that represents all used variations of the
 * emoji.
 * @param {{ name: string, code: string, types: string[] }} emojiAsset
 * @param {Object} users
 * @return {string[]}
 * */
const getUniqueEmojiCodes = (emojiAsset, users) => {
    const uniqueEmojiCodes = [];
    _.each(users, (userSkinTones) => {
        _.each(lodashGet(userSkinTones, 'skinTones'), (createdAt, skinTone) => {
            const emojiCode = getPreferredEmojiCode(emojiAsset, skinTone);
            if (emojiCode && !uniqueEmojiCodes.includes(emojiCode)) {
                uniqueEmojiCodes.push(emojiCode);
            }
        });
    });
    return uniqueEmojiCodes;
};

const propTypes = {
    /** All the emoji reactions for the report action. An object that looks like this:
        "emojiReactions": {
            "+1": { // The emoji added to the action
                "createdAt": "2021-01-01 00:00:00",
                "users": {
                    2352342: { // The accountID of the user who added this emoji
                        "skinTones": {
                            "1": "2021-01-01 00:00:00",
                            "2": "2021-01-01 00:00:00",
                        },
                    },
                },
            },
        },
    */
    emojiReactions: PropTypes.objectOf(
        PropTypes.shape({
            /** The time the emoji was added */
            createdAt: PropTypes.string,

            /** All the users who have added this emoji */
            users: PropTypes.objectOf(
                PropTypes.shape({
                    /** The skin tone which was used and also the timestamp of when it was added */
                    skinTones: PropTypes.objectOf(PropTypes.string),
                }),
            ),
        }),
    ),

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

    emojiReactions: {},
};

const ReportActionItemEmojiReactions = (props) => {
    const popoverReactionListAnchor = useRef(null);
    let totalReactionCount = 0;
    // @TODO: need to sort everything so that emojis and users are in the order they were added
    return (
        <View
            ref={popoverReactionListAnchor}
            style={[styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2]}
        >
            {_.map(props.emojiReactions, (reaction, reactionEmoji) => {
                const usersWithReactions = _.filter(reaction.users, (userData) => userData);
                const reactionCount = _.size(usersWithReactions);
                if (!reactionCount) {
                    return null;
                }
                totalReactionCount += reactionCount;
                const emojiAsset = _.find(emojis, (emoji) => emoji.name === reactionEmoji);
                const emojiCodes = getUniqueEmojiCodes(emojiAsset, reaction.users);
                const hasUserReacted = Report.hasAccountIDEmojiReacted(props.currentUserPersonalDetails.accountID, reaction.users);
                const reactionUsers = _.keys(reaction.users);

                const onPress = () => {
                    props.toggleReaction(emojiAsset);
                };
                const onReactionListOpen = (event) => {
                    const users = PersonalDetailsUtils.getPersonalDetailsByIDs(reactionUsers, props.currentUserPersonalDetails.accountID);
                    ReactionList.showReactionList(event, popoverReactionListAnchor.current, users, reaction.emoji, emojiCodes, reactionCount, hasUserReacted);
                };

                return (
                    <Tooltip
                        renderTooltipContent={() => (
                            <ReactionTooltipContent
                                emojiName={reactionEmoji}
                                emojiCodes={emojiCodes}
                                accountIDs={reactionUsers}
                                currentUserPersonalDetails={props.currentUserPersonalDetails}
                            />
                        )}
                        key={reactionEmoji}
                    >
                        <EmojiReactionBubble
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
            {totalReactionCount > 0 && <AddReactionBubble onSelectEmoji={props.toggleReaction} />}
        </View>
    );
};

ReportActionItemEmojiReactions.displayName = 'ReportActionItemEmojiReactions';
ReportActionItemEmojiReactions.propTypes = propTypes;
ReportActionItemEmojiReactions.defaultProps = defaultProps;
export default withCurrentUserPersonalDetails(ReportActionItemEmojiReactions);
