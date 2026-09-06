import type {Emoji} from '@assets/emojis/types';

import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {findEmojiByName, hasAccountIDEmojiReacted} from '@libs/EmojiUtils';

import {toggleEmojiReaction} from '@userActions/EmojiReactions';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';

/** How long the thanks acknowledgement stays up after a thumbs up before the row goes quiet. */
const THANKS_VISIBLE_DURATION_MS = 4000;

type ConciergeFeedbackPromptProps = {
    /** The Concierge comment being rated */
    action: ReportAction;

    /** The report the comment belongs to */
    reportID: string | undefined;
};

/**
 * A reaction added through the normal picker is stored under the emoji's legacy name key, while a server-confirmed
 * one comes back under its hexcode. Both formats can be in Onyx at once, so reading only one of them would show the
 * prompt again after a reload for a message the user has already rated.
 */
function hasReactedWithEmoji(emoji: Emoji, reactions: OnyxEntry<ReportActionReactions>, accountID: number): boolean {
    return [reactions?.[emoji.name], emoji.hexcode ? reactions?.[emoji.hexcode] : undefined].some((entry) => !!entry && hasAccountIDEmojiReacted(accountID, entry.users));
}

/**
 * Invites a thumbs up or down on the newest Concierge answer. Both thumbs write a real emoji reaction and nothing
 * else: the backend reads the reaction and, for a thumbs down, opens the feedback thread itself. Because the prompt
 * is gated on that same reaction, it resolves itself optimistically, stays resolved across reloads, and becomes
 * eligible again if the user later retracts the reaction from the pill row.
 */
function ConciergeFeedbackPrompt({action, reportID}: ConciergeFeedbackPromptProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [reactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);

    const [hasThanked, setHasThanked] = useState(false);

    useEffect(() => {
        if (!hasThanked) {
            return;
        }

        const thanksTimeoutID = setTimeout(() => setHasThanked(false), THANKS_VISIBLE_DURATION_MS);
        return () => clearTimeout(thanksTimeoutID);
    }, [hasThanked]);

    const thumbsUp = findEmojiByName('+1');
    const thumbsDown = findEmojiByName('-1');

    const rate = (emoji: Emoji, shouldThank: boolean) => {
        // Both thumbs have skin tone variants, so without ignoring the tone on compare a user whose preferred tone
        // differs from the stored one adds a second reaction instead of toggling the one they already left.
        toggleEmojiReaction(reportID, action, emoji, reactions, preferredSkinTone, currentUserAccountID, reportActions, true);

        if (!shouldThank) {
            return;
        }

        setHasThanked(true);
    };

    // Checked before the reaction gate below: a thumbs up flips that gate in the same commit the reaction lands,
    // so reading it first would unmount the acknowledgement before it ever painted.
    if (hasThanked) {
        return <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('concierge.feedback.thanks')}</Text>;
    }

    if (hasReactedWithEmoji(thumbsUp, reactions, currentUserAccountID) || hasReactedWithEmoji(thumbsDown, reactions, currentUserAccountID)) {
        return null;
    }

    const renderThumb = (emoji: Emoji, label: string, shouldThank: boolean) => (
        <Tooltip text={label}>
            <PressableWithFeedback
                style={[styles.conciergeFeedbackThumb, styles.userSelectNone]}
                hoverStyle={styles.conciergeFeedbackThumbHovered}
                pressStyle={styles.conciergeFeedbackThumbHovered}
                onPress={callFunctionIfActionIsAllowed(() => rate(emoji, shouldThank))}
                accessibilityLabel={label}
                role={CONST.ROLE.BUTTON}
                // The thumb already fills on press, so the default dimming would double up on that feedback.
                pressDimmingValue={1}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_FEEDBACK.THUMB}
            >
                <Text style={[styles.emojiReactionBubbleText, StyleUtils.getEmojiReactionBubbleTextStyle()]}>{emoji.code}</Text>
            </PressableWithFeedback>
        </Tooltip>
    );

    return (
        <ActionableItemButtons
            layout="horizontal"
            style={styles.alignItemsCenter}
        >
            <Text style={styles.textLabelSupporting}>{translate('concierge.feedback.prompt')}</Text>
            {renderThumb(thumbsUp, translate('concierge.feedback.useful'), true)}
            {renderThumb(thumbsDown, translate('concierge.feedback.notUseful'), false)}
        </ActionableItemButtons>
    );
}

ConciergeFeedbackPrompt.displayName = 'ConciergeFeedbackPrompt';

export default ConciergeFeedbackPrompt;
