import React, {useRef} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import emojis from '../../../assets/emojis';
import AddReactionBubble from './AddReactionBubble';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import Tooltip from '../Tooltip';
import ReactionTooltipContent from './ReactionTooltipContent';
import * as Report from '../../libs/actions/Report';
import * as ReactionList from '../../pages/home/report/ReactionList/ReactionList';
import * as EmojiUtils from '../../libs/EmojiUtils';
import EmojiReactionsPropTypes from './EmojiReactionsPropTypes';

const propTypes = {
    ...EmojiReactionsPropTypes,

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

const ReportActionItemEmojiReactions = (props) => {
    const popoverReactionListAnchor = useRef(null);
    let totalReactionCount = 0;

    // Each emoji is sorted by the oldest timestamp of user reactions so that they will always appear in the same order for everyone
    const sortedReactions = _.sortBy(props.emojiReactions, (emojiReaction, emojiName) => {
        // Since the emojiName is only stored as the object key, when _.sortBy() runs, the object is converted to an array and the
        // keys are lost. To keep from losing the emojiName, it's copied to the emojiReaction object.
        // eslint-disable-next-line no-param-reassign
        emojiReaction.emojiName = emojiName;
        return _.chain(emojiReaction.users)
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
                    ReactionList.showReactionList(event, popoverReactionListAnchor.current, reaction.emoji, props.reportActionID);
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
            {totalReactionCount > 0 && <AddReactionBubble onSelectEmoji={props.toggleReaction} />}
        </View>
    );
};

ReportActionItemEmojiReactions.displayName = 'ReportActionItemEmojiReactions';
ReportActionItemEmojiReactions.propTypes = propTypes;
ReportActionItemEmojiReactions.defaultProps = defaultProps;
export default withCurrentUserPersonalDetails(ReportActionItemEmojiReactions);
