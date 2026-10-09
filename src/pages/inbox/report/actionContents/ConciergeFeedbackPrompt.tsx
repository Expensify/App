import type {Emoji} from '@assets/emojis/types';

import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedValue from '@hooks/useDebouncedValue';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {findEmojiByName} from '@libs/EmojiUtils';

import toggleEmojiReaction from '@userActions/EmojiReactions';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

const THANKS_VISIBLE_DURATION_MS = 4000;

type ConciergeFeedbackPromptProps = {
    /** The Concierge comment being rated */
    action: ReportAction;

    /** The ID of the report being viewed */
    reportID: string | undefined;

    /** Whether to show the generic feedback prompt alongside the thumbs */
    shouldShowPrompt?: boolean;

    /** Whether the thumbs should remain available after the user rates the action */
    shouldPersistAfterRating?: boolean;

    /** Whether hovering a thumb should show its tooltip */
    shouldShowTooltips?: boolean;

    /** Whether to place only the thumbs inline with surrounding content */
    shouldRenderInline?: boolean;
};

/** A reaction can be stored under the emoji name or under its hexcode, so both keys are read */
function getUserReactions(emoji: Emoji, reactions: OnyxEntry<ReportActionReactions>, accountID: number) {
    return [reactions?.[emoji.name], emoji.hexcode ? reactions?.[emoji.hexcode] : undefined].map((entry) => entry?.users?.[accountID]).filter((userReaction) => !!userReaction);
}

/** A rated comment does not show the prompt again */
function hasReactedWithEmoji(emoji: Emoji, reactions: OnyxEntry<ReportActionReactions>, accountID: number): boolean {
    return getUserReactions(emoji, reactions, accountID).length > 0;
}

/**
 * Returns when the user added the reaction, which times the acknowledgement from the reaction itself rather than from the press.
 * Anywhere the same chat is open, such as the side panel next to the central pane, reads the same reaction and shows the acknowledgement too.
 */
function getReactedAtTimestamp(emoji: Emoji, reactions: OnyxEntry<ReportActionReactions>, accountID: number): number | undefined {
    const timestamps = getUserReactions(emoji, reactions, accountID)
        .flatMap((userReaction) => Object.values(userReaction.skinTones ?? {}))
        .map((skinToneTimestamp) => new Date(`${skinToneTimestamp.replace(' ', 'T')}Z`).getTime())
        .filter((timestamp) => !Number.isNaN(timestamp));

    return timestamps.length > 0 ? Math.max(...timestamps) : undefined;
}

type ConciergeFeedbackThumbProps = {
    /** The emoji this thumb reacts with */
    emoji: Emoji;

    /** Tooltip text */
    label: string;

    /** Accessible name. A screen reader can reach the thumb without the prompt beside it, therefore this names the rating in full. */
    accessibilityLabel: string;

    /** Called when the thumb is pressed */
    onPress: () => void;

    /** Whether hovering the thumb should show its tooltip */
    shouldShowTooltip: boolean;

    /** Whether the current user selected this rating */
    isSelected: boolean;
};

function ConciergeFeedbackThumb({emoji, label, accessibilityLabel, onPress, shouldShowTooltip, isSelected}: ConciergeFeedbackThumbProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const thumb = (
        <PressableWithFeedback
            style={[styles.conciergeFeedbackThumb, isSelected && StyleUtils.getBackgroundColorStyle(theme.reactionActiveBackground), styles.userSelectNone]}
            hoverStyle={styles.conciergeFeedbackThumbHovered}
            pressStyle={styles.conciergeFeedbackThumbHovered}
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            role={CONST.ROLE.BUTTON}
            pressDimmingValue={1}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_FEEDBACK.THUMB}
        >
            <Text style={styles.conciergeFeedbackThumbEmoji}>{emoji.code}</Text>
        </PressableWithFeedback>
    );

    return shouldShowTooltip ? <Tooltip text={label}>{thumb}</Tooltip> : thumb;
}

function ConciergeFeedbackPrompt({
    action,
    reportID,
    shouldShowPrompt = true,
    shouldPersistAfterRating = false,
    shouldShowTooltips = true,
    shouldRenderInline = false,
}: ConciergeFeedbackPromptProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [reactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);

    const thumbsUp = findEmojiByName('+1');
    const thumbsDown = findEmojiByName('-1');

    const thumbsUpReactedAt = getReactedAtTimestamp(thumbsUp, reactions, currentUserAccountID);

    // The reaction that was already there when this row mounted is an old rating, so only a reaction that lands while the row is open is acknowledged
    const [mountedWithThumbsUpReactedAt] = useState(thumbsUpReactedAt);
    const hasJustReacted = thumbsUpReactedAt !== undefined && thumbsUpReactedAt !== mountedWithThumbsUpReactedAt;

    // The debounced copy catches up once the window has passed, which is what takes the acknowledgement back down
    const hasSettledAfterReacting = useDebouncedValue(hasJustReacted, THANKS_VISIBLE_DURATION_MS);
    const isDisplayedThankMessage = hasJustReacted && !hasSettledAfterReacting;

    const rate = (emoji: Emoji) => {
        // Skin tone is ignored on compare so a user whose preferred tone changed toggles their existing reaction instead of adding a second one
        toggleEmojiReaction(reportID, action, emoji, reactions, preferredSkinTone, currentUserAccountID, reportActions, true, true, emoji.name === thumbsUp.name ? thumbsDown : thumbsUp);
    };

    const hasRated = hasReactedWithEmoji(thumbsUp, reactions, currentUserAccountID) || hasReactedWithEmoji(thumbsDown, reactions, currentUserAccountID);

    // The acknowledgement comes from the reaction, so removing it from the reaction row brings the prompt back right away
    if (!shouldPersistAfterRating && isDisplayedThankMessage) {
        return <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('concierge.feedback.thanks')}</Text>;
    }

    if (!shouldPersistAfterRating && hasRated) {
        return null;
    }

    const feedbackThumbs = (
        <View style={styles.flexRow}>
            <ConciergeFeedbackThumb
                emoji={thumbsUp}
                label={translate('common.yes')}
                accessibilityLabel={translate('concierge.feedback.useful')}
                onPress={callFunctionIfActionIsAllowed(() => rate(thumbsUp))}
                shouldShowTooltip={shouldShowTooltips}
                isSelected={hasReactedWithEmoji(thumbsUp, reactions, currentUserAccountID)}
            />
            <ConciergeFeedbackThumb
                emoji={thumbsDown}
                label={translate('common.no')}
                accessibilityLabel={translate('concierge.feedback.notUseful')}
                onPress={callFunctionIfActionIsAllowed(() => rate(thumbsDown))}
                shouldShowTooltip={shouldShowTooltips}
                isSelected={hasReactedWithEmoji(thumbsDown, reactions, currentUserAccountID)}
            />
        </View>
    );

    if (shouldRenderInline) {
        return feedbackThumbs;
    }

    return (
        <ActionableItemButtons
            layout="horizontal"
            style={styles.alignItemsCenter}
        >
            {shouldShowPrompt && <Text style={[styles.textLabelSupporting, styles.flexShrink1]}>{translate('concierge.feedback.prompt')}</Text>}
            {feedbackThumbs}
        </ActionableItemButtons>
    );
}

ConciergeFeedbackPrompt.displayName = 'ConciergeFeedbackPrompt';

export default ConciergeFeedbackPrompt;
