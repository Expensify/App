import React, {useRef, useContext} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import emojis from '../../../assets/emojis';
import AddReactionBubble from './AddReactionBubble';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import * as Report from '../../libs/actions/Report';
import EmojiReactionsPropTypes from './EmojiReactionsPropTypes';
import Tooltip from '../Tooltip';
import ReactionTooltipContent from './ReactionTooltipContent';
import * as EmojiUtils from '../../libs/EmojiUtils';
import ReportScreenContext from '../../pages/home/ReportScreenContext';

const propTypes = {
    emojiReactions: EmojiReactionsPropTypes,

    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID: PropTypes.string.isRequired,

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

function ReportActionItemEmojiReactions(props) {
    const {reactionListRef} = useContext(ReportScreenContext);
    const popoverReactionListAnchor = useRef(null);
    let totalReactionCount = 0;

    // Each emoji is sorted by the oldest timestamp of user reactions so that they will always appear in the same order for everyone
    const sortedReactions = _.sortBy(props.emojiReactions, (emojiReaction, emojiName) => {
        // Since the emojiName is only stored as the object key, when _.sortBy() runs, the object is converted to an array and the
        // keys are lost. To keep from losing the emojiName, it's copied to the emojiReaction object.
        // eslint-disable-next-line no-param-reassign
        emojiReaction.emojiName = emojiName;
        const oldestUserReactionTimestamp = _.chain(emojiReaction.users)
            .reduce((allTimestampsArray, userData) => {
                if (!userData) {
                    return allTimestampsArray;
                }
                _.each(userData.skinTones, (createdAt) => {
                    allTimestampsArray.push(createdAt);
                });
                return allTimestampsArray;
            }, [])
            .sort()
            .first()
            .value();

        // Just in case two emojis have the same timestamp, also combine the timestamp with the
        // emojiName so that the order will always be the same. Without this, the order can be pretty random
        // and shift around a little bit.
        return (oldestUserReactionTimestamp || emojiReaction.createdAt) + emojiName;
    });

    return (
        <View
            ref={popoverReactionListAnchor}
            style={[styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2]}
        >
            {_.map(sortedReactions, (reaction) => {
                const reactionEmojiName = reaction.emojiName;
                const usersWithReactions = _.filter(reaction.users, (userData) => userData);
                const reactionCount = _.size(usersWithReactions);
                if (!reactionCount) {
                    return null;
                }
                totalReactionCount += reactionCount;
                const emojiAsset = _.find(emojis, (emoji) => emoji.name === reactionEmojiName);
                const emojiCodes = EmojiUtils.getUniqueEmojiCodes(emojiAsset, reaction.users);
                const hasUserReacted = Report.hasAccountIDEmojiReacted(props.currentUserPersonalDetails.accountID, reaction.users);
                const reactionUsers = _.keys(reaction.users);

                const onPress = () => {
                    props.toggleReaction(emojiAsset);
                };

                const onReactionListOpen = (event) => {
                    reactionListRef.current.showReactionList(event, popoverReactionListAnchor.current, reaction.emoji, props.reportActionID);
                };

                return (
                    <Tooltip
                        renderTooltipContent={() => (
                            <ReactionTooltipContent
                                emojiName={reactionEmojiName}
                                emojiCodes={emojiCodes}
                                accountIDs={reactionUsers}
                                currentUserPersonalDetails={props.currentUserPersonalDetails}
                            />
                        )}
                        renderTooltipContentKey={[..._.map(reactionUsers, (user) => user.toString()), ...emojiCodes]}
                        key={reactionEmojiName}
                    >
                        <View>
                            <EmojiReactionBubble
                                ref={props.forwardedRef}
                                count={reactionCount}
                                emojiCodes={emojiCodes}
                                onPress={onPress}
                                reactionUsers={reactionUsers}
                                hasUserReacted={hasUserReacted}
                                onReactionListOpen={onReactionListOpen}
                            />
                        </View>
                    </Tooltip>
                );
            })}
            {totalReactionCount > 0 && (
                <AddReactionBubble
                    onSelectEmoji={props.toggleReaction}
                    reportAction={{reportActionID: props.reportActionID}}
                />
            )}
        </View>
    );
}

ReportActionItemEmojiReactions.displayName = 'ReportActionItemReactions';
ReportActionItemEmojiReactions.propTypes = propTypes;
ReportActionItemEmojiReactions.defaultProps = defaultProps;
export default withCurrentUserPersonalDetails(ReportActionItemEmojiReactions);
