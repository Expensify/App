import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useContext, useRef} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Tooltip from '@components/Tooltip';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize from '@components/withLocalize';
import compose from '@libs/compose';
import * as EmojiUtils from '@libs/EmojiUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import useThemeStyles from '@styles/useThemeStyles';
import AddReactionBubble from './AddReactionBubble';
import EmojiReactionBubble from './EmojiReactionBubble';
import EmojiReactionsPropTypes from './EmojiReactionsPropTypes';
import ReactionTooltipContent from './ReactionTooltipContent';

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
    const styles = useThemeStyles();
    const reactionListRef = useContext(ReactionListContext);
    const popoverReactionListAnchors = useRef({});

    let totalReactionCount = 0;

    const reportAction = props.reportAction;
    const reportActionID = reportAction.reportActionID;

    const formattedReactions = _.chain(props.emojiReactions)
        .map((emojiReaction, emojiName) => {
            const {emoji, emojiCodes, reactionCount, hasUserReacted, userAccountIDs, oldestTimestamp} = EmojiUtils.getEmojiReactionDetails(
                emojiName,
                emojiReaction,
                props.currentUserPersonalDetails.accountID,
            );

            if (reactionCount === 0) {
                return null;
            }
            totalReactionCount += reactionCount;

            const onPress = () => {
                props.toggleReaction(emoji);
            };

            const onReactionListOpen = (event) => {
                reactionListRef.current.showReactionList(event, popoverReactionListAnchors.current[emojiName], emojiName, reportActionID);
            };

            return {
                emojiCodes,
                userAccountIDs,
                reactionCount,
                hasUserReacted,
                oldestTimestamp,
                onPress,
                onReactionListOpen,
                reactionEmojiName: emojiName,
                pendingAction: emojiReaction.pendingAction,
            };
        })
        // Each emoji is sorted by the oldest timestamp of user reactions so that they will always appear in the same order for everyone
        .sortBy('oldestTimestamp')
        .value();

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
                                    accountIDs={reaction.userAccountIDs}
                                    currentUserPersonalDetails={props.currentUserPersonalDetails}
                                />
                            )}
                            renderTooltipContentKey={[..._.map(reaction.userAccountIDs, String), ...reaction.emojiCodes]}
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
