import React, {useContext, useRef} from 'react';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import {ReactionListContext} from '@pages/inbox/ReportScreenContext';
import type {ReactionListAnchor, ReactionListEvent} from '@pages/inbox/ReportScreenContext';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import EmojiReactionBubble from './EmojiReactionBubble';
import ReactionTooltipContent from './ReactionTooltipContent';

type ReportActionReactionBubbleProps = {
    /** The emoji codes to display in the bubble */
    emojiCodes: string[];

    /** Number of reactions for this emoji */
    reactionCount: number;

    /** Whether the current user has reacted with this emoji */
    hasUserReacted: boolean;

    /** IDs of users who reacted with this emoji */
    userAccountIDs: number[];

    /** Name of the reaction emoji */
    reactionEmojiName: string;

    /** Called when the bubble is pressed (toggles reaction) */
    onPress: () => void;

    /** ID of the report action this reaction belongs to */
    reportActionID: string;

    /** Pending action of the report action (drives offline opacity) */
    reportActionPendingAction: PendingAction | undefined;

    /** Pending action for this individual reaction */
    pendingAction: PendingAction | undefined;

    /** Current user's account ID, used for the tooltip header */
    currentUserAccountID: number;

    /** Disables reactions when the report action has errors */
    shouldBlockReactions: boolean;
};

function ReportActionReactionBubble({
    emojiCodes,
    reactionCount,
    hasUserReacted,
    userAccountIDs,
    reactionEmojiName,
    onPress,
    reportActionID,
    reportActionPendingAction,
    pendingAction,
    currentUserAccountID,
    shouldBlockReactions,
}: ReportActionReactionBubbleProps) {
    const anchorRef = useRef<ReactionListAnchor>(null);
    const {showReactionList} = useContext(ReactionListContext);

    return (
        <Tooltip
            renderTooltipContent={() => (
                <ReactionTooltipContent
                    emojiName={reactionEmojiName}
                    emojiCodes={emojiCodes}
                    accountIDs={userAccountIDs}
                    currentUserAccountID={currentUserAccountID}
                />
            )}
            renderTooltipContentKey={[...userAccountIDs.map(String), ...emojiCodes]}
        >
            <View>
                <OfflineWithFeedback
                    pendingAction={pendingAction}
                    shouldDisableOpacity={!!reportActionPendingAction}
                >
                    <EmojiReactionBubble
                        ref={(node) => {
                            anchorRef.current = node ?? null;
                        }}
                        count={reactionCount}
                        emojiCodes={emojiCodes}
                        onPress={onPress}
                        hasUserReacted={hasUserReacted}
                        onReactionListOpen={(event: ReactionListEvent) => showReactionList(event, anchorRef.current, reactionEmojiName, reportActionID)}
                        shouldBlockReactions={shouldBlockReactions}
                    />
                </OfflineWithFeedback>
            </View>
        </Tooltip>
    );
}

ReportActionReactionBubble.displayName = 'ReportActionReactionBubble';

export default ReportActionReactionBubble;
