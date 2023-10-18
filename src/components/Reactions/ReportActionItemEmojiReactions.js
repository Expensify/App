import React, {useRef, useContext} from 'react';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import EmojiReactionBubble from './EmojiReactionBubble';
import AddReactionBubble from './AddReactionBubble';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import withLocalize from '../withLocalize';
import compose from '../../libs/compose';
import * as Report from '../../libs/actions/Report';
import EmojiReactionsPropTypes from './EmojiReactionsPropTypes';
import Tooltip from '../Tooltip';
import ReactionTooltipContent from './ReactionTooltipContent';
import * as EmojiUtils from '../../libs/EmojiUtils';
import {ReactionListContext} from '../../pages/home/ReportScreenContext';
import OfflineWithFeedback from '../OfflineWithFeedback';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';

const propTypes = {
    emojiReactions: EmojiReactionsPropTypes,

    /** The report action that these reactions are for */
    reportAction: PropTypes.shape(reportActionPropTypes).isRequired,

    /**
     * Function to call when the user presses on an emoji.
     * This can also be an emoji the user already reacted with,
     * hence this function asks to toggle the reaction by emoji.
     */
    toggleReaction: PropTypes.func.isRequired,

    /** We disable reacting with emojis on report actions that have errors */
    shouldBlockReactions: PropTypes.bool,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
    emojiReactions: {},
    shouldBlockReactions: false,
};

function ReportActionItemEmojiReactions(props) {
    const reactionListRef = useContext(ReactionListContext);
    const popoverReactionListAnchors = useRef({});

    let totalReactionCount = 0;

    const reportAction = props.reportAction;
    const reportActionID = reportAction.reportActionID;

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

    const formattedReactions = _.map(sortedReactions, (reaction) => {
        const reactionEmojiName = reaction.emojiName;
        const usersWithReactions = _.pick(reaction.users, _.identity);
        let reactionCount = 0;

        // Loop through the users who have reacted and see how many skintones they reacted with so that we get the total count
        _.forEach(usersWithReactions, (user) => {
            reactionCount += _.size(user.skinTones);
        });
        if (!reactionCount) {
            return null;
        }
        totalReactionCount += reactionCount;
        const emojiAsset = EmojiUtils.findEmojiByName(reactionEmojiName);
        const emojiCodes = EmojiUtils.getUniqueEmojiCodes(emojiAsset, reaction.users);
        const hasUserReacted = Report.hasAccountIDEmojiReacted(props.currentUserPersonalDetails.accountID, reaction.users);
        const reactionUsers = _.keys(usersWithReactions);
        const reactionUserAccountIDs = _.map(reactionUsers, Number);

        const onPress = () => {
            props.toggleReaction(emojiAsset);
        };

        const onReactionListOpen = (event) => {
            reactionListRef.current.showReactionList(event, popoverReactionListAnchors.current[reactionEmojiName], reactionEmojiName, reportActionID);
        };

        return {
            reactionEmojiName,
            emojiCodes,
            reactionUserAccountIDs,
            onPress,
            reactionUsers,
            reactionCount,
            hasUserReacted,
            onReactionListOpen,
            pendingAction: reaction.pendingAction,
        };
    });

    return (
        totalReactionCount > 0 && (
            <View style={[styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2]}>
                {_.map(formattedReactions, (reaction) => {
                    if (reaction === null) {
                        return;
                    }
                    return (
                        <Tooltip
                            renderTooltipContent={() => (
                                <ReactionTooltipContent
                                    emojiName={EmojiUtils.getLocalizedEmojiName(reaction.reactionEmojiName, props.preferredLocale)}
                                    emojiCodes={reaction.emojiCodes}
                                    accountIDs={reaction.reactionUserAccountIDs}
                                    currentUserPersonalDetails={props.currentUserPersonalDetails}
                                />
                            )}
                            renderTooltipContentKey={[..._.map(reaction.reactionUsers, (user) => user.toString()), ...reaction.emojiCodes]}
                            key={reaction.reactionEmojiName}
                        >
                            <View>
                                <OfflineWithFeedback
                                    pendingAction={reaction.pendingAction}
                                    shouldDisableOpacity={Boolean(lodashGet(reportAction, 'pendingAction'))}
                                >
                                    <EmojiReactionBubble
                                        ref={(ref) => (popoverReactionListAnchors.current[reaction.reactionEmojiName] = ref)}
                                        count={reaction.reactionCount}
                                        emojiCodes={reaction.emojiCodes}
                                        onPress={reaction.onPress}
                                        reactionUsers={reaction.reactionUsers}
                                        hasUserReacted={reaction.hasUserReacted}
                                        onReactionListOpen={reaction.onReactionListOpen}
                                        shouldBlockReactions={props.shouldBlockReactions}
                                    />
                                </OfflineWithFeedback>
                            </View>
                        </Tooltip>
                    );
                })}
                {!props.shouldBlockReactions && (
                    <AddReactionBubble
                        onSelectEmoji={props.toggleReaction}
                        reportAction={{reportActionID}}
                    />
                )}
            </View>
        )
    );
}

ReportActionItemEmojiReactions.displayName = 'ReportActionItemReactions';
ReportActionItemEmojiReactions.propTypes = propTypes;
ReportActionItemEmojiReactions.defaultProps = defaultProps;
export default compose(withLocalize, withCurrentUserPersonalDetails)(ReportActionItemEmojiReactions);
