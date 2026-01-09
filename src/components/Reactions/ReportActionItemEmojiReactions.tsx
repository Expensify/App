import sortBy from 'lodash/sortBy';
import React, {useContext, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEmojiReactionDetails, getLocalizedEmojiName} from '@libs/EmojiUtils';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import type {ReactionListAnchor, ReactionListEvent} from '@pages/home/ReportScreenContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Locale, ReportAction, ReportActionReactions} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import AddReactionBubble from './AddReactionBubble';
import EmojiReactionBubble from './EmojiReactionBubble';
import ReactionTooltipContent from './ReactionTooltipContent';

type ReportActionItemEmojiReactionsProps = WithCurrentUserPersonalDetailsProps & {
    /** All the emoji reactions for the report action. */
    emojiReactions: OnyxEntry<ReportActionReactions>;

    /** The user's preferred locale. */
    preferredLocale?: OnyxEntry<Locale>;

    /** The report action that these reactions are for */
    reportAction: ReportAction;

    /**
     * Function to call when the user presses on an emoji.
     * This can also be an emoji the user already reacted with,
     * hence this function asks to toggle the reaction by emoji.
     */
    toggleReaction: (emoji: Emoji, preferredSkinTone: number, ignoreSkinToneOnCompare?: boolean) => void;

    /** We disable reacting with emojis on report actions that have errors */
    shouldBlockReactions?: boolean;

    /** Function to update emoji picker state */
    setIsEmojiPickerActive?: (state: boolean) => void;
};

type PopoverReactionListAnchors = Record<string, ReactionListAnchor>;

type FormattedReaction = {
    /** The emoji codes to display in the bubble */
    emojiCodes: string[];

    /** IDs of users used the reaction */
    userAccountIDs: number[];

    /** Total reaction count */
    reactionCount: number;

    /** Whether the current account has reacted to the report action */
    hasUserReacted: boolean;

    /** Oldest timestamp of when the emoji was added */
    oldestTimestamp: string;

    /** Callback to fire on press */
    onPress: () => void;

    /** Callback to fire on reaction list open */
    onReactionListOpen: (event: ReactionListEvent) => void;

    /** The name of the emoji */
    reactionEmojiName: string;

    /** The type of action that's pending  */
    pendingAction?: PendingAction;

    setIsEmojiPickerActive?: (state: boolean) => void;
};

function ReportActionItemEmojiReactions({
    reportAction,
    currentUserPersonalDetails,
    toggleReaction,
    emojiReactions = {},
    shouldBlockReactions = false,
    preferredLocale = CONST.LOCALES.DEFAULT,
    setIsEmojiPickerActive,
}: ReportActionItemEmojiReactionsProps) {
    const styles = useThemeStyles();
    const reactionListRef = useContext(ReactionListContext);
    const popoverReactionListAnchors = useRef<PopoverReactionListAnchors>({});
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, {canBeMissing: true});

    const reportActionID = reportAction.reportActionID;

    // Each emoji is sorted by the oldest timestamp of user reactions so that they will always appear in the same order for everyone
    const formattedReactions: Array<FormattedReaction | null> = sortBy(
        Object.entries(emojiReactions ?? {}).map(([emojiName, emojiReaction]) => {
            const {emoji, emojiCodes, reactionCount, hasUserReacted, userAccountIDs, oldestTimestamp} = getEmojiReactionDetails(
                emojiName,
                emojiReaction,
                currentUserPersonalDetails.accountID,
            );

            if (reactionCount === 0) {
                return null;
            }

            const onPress = () => {
                toggleReaction(emoji, preferredSkinTone, true);
            };

            const onReactionListOpen = (event: ReactionListEvent) => {
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

    const totalReactionCount = formattedReactions.reduce((prev, curr) => (curr === null ? prev : prev + curr.reactionCount), 0);

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
                                    emojiName={getLocalizedEmojiName(reaction.reactionEmojiName, preferredLocale)}
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
                                        ref={(ref) => {
                                            popoverReactionListAnchors.current[reaction.reactionEmojiName] = ref ?? null;
                                        }}
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
                        setIsEmojiPickerActive={setIsEmojiPickerActive}
                    />
                )}
            </View>
        )
    );
}

export default withCurrentUserPersonalDetails(ReportActionItemEmojiReactions);
