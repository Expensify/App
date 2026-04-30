import sortBy from 'lodash/sortBy';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager, View} from 'react-native';
import {importEmojiLocale} from '@assets/emojis';
import type {Emoji} from '@assets/emojis/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEmojiReactionDetails} from '@libs/EmojiUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {toggleEmojiReaction} from '@userActions/Report';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import {isFullySupportedLocale} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import AddReactionBubble from './AddReactionBubble';
import ReportActionReactionBubble from './ReportActionReactionBubble';

type ReportActionItemEmojiReactionsProps = {
    /** The report action that these reactions are for */
    reportAction: ReportAction;

    /** The ID of the chat report this action belongs to */
    reportID: string | undefined;

    /** We disable reacting with emojis on report actions that have errors */
    shouldBlockReactions?: boolean;

    /** Function to update emoji picker state */
    setIsEmojiPickerActive?: (state: boolean) => void;
};

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

    /** The name of the emoji */
    reactionEmojiName: string;

    /** The type of action that's pending */
    pendingAction?: PendingAction;
};

function ReportActionItemEmojiReactions({reportAction, reportID, shouldBlockReactions = false, setIsEmojiPickerActive}: ReportActionItemEmojiReactionsProps) {
    const styles = useThemeStyles();
    const {preferredLocale} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);

    const reportActionID = reportAction.reportActionID;
    const [emojiReactions = getEmptyObject<ReportActionReactions>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);

    // Prime the locale emoji table when this action has reactions.
    // Skip the default locale since getLocalizedEmojiName never reads localeEmojis for it.
    if (preferredLocale && preferredLocale !== CONST.LOCALES.DEFAULT && emojiReactions !== CONST.EMPTY_OBJECT && isFullySupportedLocale(preferredLocale)) {
        importEmojiLocale(preferredLocale);
    }

    const toggleReaction = (emoji: Emoji, skinTone: number, ignoreSkinToneOnCompare?: boolean) => {
        if (isAnonymousUser()) {
            hideContextMenu(false);

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                signOutAndRedirectToSignIn();
            });
            return;
        }
        toggleEmojiReaction(reportID, reportAction, emoji, emojiReactions, skinTone, currentUserAccountID, ignoreSkinToneOnCompare);
    };

    // Each emoji is sorted by the oldest timestamp of user reactions so that they will always appear in the same order for everyone
    const formattedReactions: Array<FormattedReaction | null> = sortBy(
        Object.entries(emojiReactions ?? {}).map(([emojiName, emojiReaction]) => {
            const {emoji, emojiCodes, reactionCount, hasUserReacted, userAccountIDs, oldestTimestamp} = getEmojiReactionDetails(emojiName, emojiReaction, currentUserAccountID);

            if (reactionCount === 0) {
                return null;
            }

            const onPress = () => {
                toggleReaction(emoji, preferredSkinTone, true);
            };

            return {
                emojiCodes,
                userAccountIDs,
                reactionCount,
                hasUserReacted,
                oldestTimestamp,
                onPress,
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
                        <ReportActionReactionBubble
                            key={reaction.reactionEmojiName}
                            emojiCodes={reaction.emojiCodes}
                            reactionCount={reaction.reactionCount}
                            hasUserReacted={reaction.hasUserReacted}
                            userAccountIDs={reaction.userAccountIDs}
                            reactionEmojiName={reaction.reactionEmojiName}
                            onPress={reaction.onPress}
                            reportActionID={reportActionID}
                            reportActionPendingAction={reportAction.pendingAction}
                            pendingAction={reaction.pendingAction}
                            currentUserAccountID={currentUserAccountID}
                            shouldBlockReactions={shouldBlockReactions}
                        />
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

export default ReportActionItemEmojiReactions;
