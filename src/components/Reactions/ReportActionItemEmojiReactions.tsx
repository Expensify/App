import sortBy from 'lodash/sortBy';
import React, {useContext, useRef} from 'react';
import {GestureResponderEvent, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {Emoji} from '@assets/emojis/types';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Tooltip from '@components/Tooltip';
import withCurrentUserPersonalDetails, {type WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import * as EmojiUtils from '@libs/EmojiUtils';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import CONST from '@src/CONST';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';
import {Locale} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import AddReactionBubble from './AddReactionBubble';
import EmojiReactionBubble from './EmojiReactionBubble';
import ReactionTooltipContent from './ReactionTooltipContent';

type ReportActionItemEmojiReactionsProps = WithCurrentUserPersonalDetailsProps & {
    /** All the emoji reactions for the report action. */
    emojiReactions: OnyxEntry<ReportActionReactions>;

    /** The user's preferred locale. */
    preferredLocale: OnyxEntry<Locale>;

    /** The report action that these reactions are for */
    reportAction: ReportAction;

    /**
     * Function to call when the user presses on an emoji.
     * This can also be an emoji the user already reacted with,
     * hence this function asks to toggle the reaction by emoji.
     */
    toggleReaction: (emoji: Emoji) => void;

    /** We disable reacting with emojis on report actions that have errors */
    shouldBlockReactions?: boolean;
};

type FormattedReaction = {
    emojiCodes: string[];
    userAccountIDs: number[];
    reactionCount: number;
    hasUserReacted: boolean;
    oldestTimestamp: string;
    onPress: () => void;
    onReactionListOpen: (event: GestureResponderEvent | MouseEvent) => void;
    reactionEmojiName: string;
    pendingAction: PendingAction;
};

function ReportActionItemEmojiReactions({
    reportAction,
    currentUserPersonalDetails,
    toggleReaction,
    emojiReactions = {},
    shouldBlockReactions = false,
    preferredLocale = CONST.LOCALES.DEFAULT,
}: ReportActionItemEmojiReactionsProps) {
    const styles = useThemeStyles();
    const reactionListRef = useContext(ReactionListContext);
    const popoverReactionListAnchors = useRef<Record<string, View | HTMLDivElement | null>>({});

    let totalReactionCount = 0;

    const reportActionID = reportAction.reportActionID;

    // Each emoji is sorted by the oldest timestamp of user reactions so that they will always appear in the same order for everyone
    const formattedReactions: Array<FormattedReaction | null> = sortBy(
        Object.entries(emojiReactions ?? {}).map(([emojiName, emojiReaction]) => {
            const {emoji, emojiCodes, reactionCount, hasUserReacted, userAccountIDs, oldestTimestamp} = EmojiUtils.getEmojiReactionDetails(
                emojiName,
                emojiReaction,
                currentUserPersonalDetails.accountID,
            );

            if (reactionCount === 0) {
                return null;
            }
            totalReactionCount += reactionCount;

            const onPress = () => {
                toggleReaction(emoji);
            };

            const onReactionListOpen = (event: GestureResponderEvent | MouseEvent) => {
                reactionListRef?.current?.showReactionList(event, popoverReactionListAnchors.current[emojiName], emojiName, reportActionID);
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
        }),
        ['oldestTimestamp'],
    );

    return (
        totalReactionCount > 0 && (
            <View style={[styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2]}>
                {formattedReactions.map((reaction) => {
                    if (reaction === null) {
                        return;
                    }
                    return (
                        <Tooltip
                            renderTooltipContent={() => (
                                <ReactionTooltipContent
                                    emojiName={EmojiUtils.getLocalizedEmojiName(reaction.reactionEmojiName, preferredLocale)}
                                    emojiCodes={reaction.emojiCodes}
                                    accountIDs={reaction.userAccountIDs}
                                    currentUserPersonalDetails={currentUserPersonalDetails}
                                />
                            )}
                            renderTooltipContentKey={[...reaction.userAccountIDs.map(String), ...reaction.emojiCodes]}
                            key={reaction.reactionEmojiName}
                        >
                            <View>
                                <OfflineWithFeedback
                                    pendingAction={reaction.pendingAction}
                                    shouldDisableOpacity={!!reportAction.pendingAction}
                                >
                                    <EmojiReactionBubble
                                        ref={(ref) => (popoverReactionListAnchors.current[reaction.reactionEmojiName] = ref)}
                                        count={reaction.reactionCount}
                                        emojiCodes={reaction.emojiCodes}
                                        onPress={reaction.onPress}
                                        hasUserReacted={reaction.hasUserReacted}
                                        onReactionListOpen={reaction.onReactionListOpen}
                                        shouldBlockReactions={shouldBlockReactions}
                                    />
                                </OfflineWithFeedback>
                            </View>
                        </Tooltip>
                    );
                })}
                {!shouldBlockReactions && (
                    <AddReactionBubble
                        onSelectEmoji={toggleReaction}
                        reportAction={reportAction}
                    />
                )}
            </View>
        )
    );
}

ReportActionItemEmojiReactions.displayName = 'ReportActionItemReactions';

export default withCurrentUserPersonalDetails(ReportActionItemEmojiReactions);
