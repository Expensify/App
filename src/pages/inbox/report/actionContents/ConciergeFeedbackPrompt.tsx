import type {Emoji} from '@assets/emojis/types';

import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {findEmojiByName, hasAccountIDEmojiReacted} from '@libs/EmojiUtils';

import {toggleEmojiReaction} from '@userActions/EmojiReactions';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActionReactions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

const THANKS_VISIBLE_DURATION_MS = 4000;

type ConciergeFeedbackPromptProps = {
    /** The Concierge comment being rated */
    action: ReportAction;

    /** The ID of the report being viewed */
    reportID: string | undefined;
};

/** A reaction can be stored under the emoji name or under its hexcode, so both keys are checked to keep a rated comment from showing the prompt again */
function hasReactedWithEmoji(emoji: Emoji, reactions: OnyxEntry<ReportActionReactions>, accountID: number): boolean {
    return [reactions?.[emoji.name], emoji.hexcode ? reactions?.[emoji.hexcode] : undefined].some((entry) => !!entry && hasAccountIDEmojiReacted(accountID, entry.users));
}

type ConciergeFeedbackThumbProps = {
    /** The emoji this thumb reacts with */
    emoji: Emoji;

    /** Tooltip and accessibility label */
    label: string;

    /** Called when the thumb is pressed */
    onPress: () => void;
};

function ConciergeFeedbackThumb({emoji, label, onPress}: ConciergeFeedbackThumbProps) {
    const styles = useThemeStyles();

    return (
        <Tooltip text={label}>
            <PressableWithFeedback
                style={[styles.conciergeFeedbackThumb, styles.userSelectNone]}
                hoverStyle={styles.conciergeFeedbackThumbHovered}
                pressStyle={styles.conciergeFeedbackThumbHovered}
                onPress={onPress}
                accessibilityLabel={label}
                role={CONST.ROLE.BUTTON}
                pressDimmingValue={1}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                sentryLabel={CONST.SENTRY_LABEL.CONCIERGE_FEEDBACK.THUMB}
            >
                <Text style={styles.conciergeFeedbackThumbEmoji}>{emoji.code}</Text>
            </PressableWithFeedback>
        </Tooltip>
    );
}

function ConciergeFeedbackPrompt({action, reportID}: ConciergeFeedbackPromptProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [reactions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE] = useOnyx(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE);

    const [isDisplayedThankMessage, setIsDisplayedThankMessage] = useState(false);

    useEffect(() => {
        if (!isDisplayedThankMessage) {
            return;
        }

        const thanksTimeoutID = setTimeout(() => setIsDisplayedThankMessage(false), THANKS_VISIBLE_DURATION_MS);
        return () => clearTimeout(thanksTimeoutID);
    }, [isDisplayedThankMessage]);

    const thumbsUp = findEmojiByName('+1');
    const thumbsDown = findEmojiByName('-1');

    const rate = (emoji: Emoji, shouldDisplayThankMessage: boolean) => {
        // Skin tone is ignored on compare so a user whose preferred tone changed toggles their existing reaction instead of adding a second one
        toggleEmojiReaction(reportID, action, emoji, reactions, preferredSkinTone, currentUserAccountID, reportActions, true);

        if (!shouldDisplayThankMessage) {
            return;
        }

        setIsDisplayedThankMessage(true);
    };

    const hasRated = hasReactedWithEmoji(thumbsUp, reactions, currentUserAccountID) || hasReactedWithEmoji(thumbsDown, reactions, currentUserAccountID);

    // The thanks message also requires the reaction, so removing the reaction from the reaction row brings the prompt back right away
    if (isDisplayedThankMessage && hasRated) {
        return <Text style={[styles.textLabelSupporting, styles.mt2]}>{translate('concierge.feedback.thanks')}</Text>;
    }

    if (hasRated) {
        return null;
    }

    return (
        <ActionableItemButtons
            layout="horizontal"
            style={[styles.alignItemsCenter, styles.flexWrap]}
        >
            {/* The label takes the room it needs at large font sizes, which wraps the thumbs onto the next line instead of pushing them off screen */}
            <Text style={[styles.textLabelSupporting, styles.flexShrink1]}>{translate('concierge.feedback.prompt')}</Text>
            {/* The thumbs share one child so the container gap does not separate them */}
            <View style={styles.flexRow}>
                <ConciergeFeedbackThumb
                    emoji={thumbsUp}
                    label={translate('concierge.feedback.useful')}
                    onPress={callFunctionIfActionIsAllowed(() => rate(thumbsUp, true))}
                />
                <ConciergeFeedbackThumb
                    emoji={thumbsDown}
                    label={translate('concierge.feedback.notUseful')}
                    onPress={callFunctionIfActionIsAllowed(() => rate(thumbsDown, false))}
                />
            </View>
        </ActionableItemButtons>
    );
}

ConciergeFeedbackPrompt.displayName = 'ConciergeFeedbackPrompt';

export default ConciergeFeedbackPrompt;
