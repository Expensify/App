import React from 'react';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Text from '@components/Text';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ReactionListEvent} from '@pages/home/ReportScreenContext';
import CONST from '@src/CONST';

type EmojiReactionBubbleProps = {
    /**
     * The emoji codes to display in the bubble.
     */
    emojiCodes: string[];

    /**
     * Called when the user presses on the reaction bubble.
     */
    onPress: () => void;

    /**
     * Called when the user long presses or right clicks
     * on the reaction bubble.
     */
    onReactionListOpen?: (event: ReactionListEvent) => void;

    /**
     * The number of reactions to display in the bubble.
     */
    count?: number;

    /** Whether it is for context menu so we can modify its style */
    isContextMenu?: boolean;

    /**
     * Returns true if the current account has reacted to the report action (with the given skin tone).
     */
    hasUserReacted?: boolean;

    /** We disable reacting with emojis on report actions that have errors */
    shouldBlockReactions?: boolean;

    /** Reference to the outer element */
    ref?: PressableRef;
};

function EmojiReactionBubble({
    onPress,
    onReactionListOpen = () => {},
    emojiCodes,
    hasUserReacted = false,
    count = 0,
    isContextMenu = false,
    shouldBlockReactions = false,
    ref,
}: EmojiReactionBubbleProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <PressableWithSecondaryInteraction
            style={({hovered, pressed}) => [
                styles.emojiReactionBubble,
                StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, hasUserReacted, isContextMenu),
                shouldBlockReactions && styles.cursorDisabled,
                styles.userSelectNone,
            ]}
            onPress={() => {
                if (shouldBlockReactions) {
                    return;
                }

                onPress();
            }}
            onSecondaryInteraction={onReactionListOpen}
            ref={ref}
            enableLongPressWithHover={shouldUseNarrowLayout}
            onMouseDown={(event) => {
                // Allow text input blur when emoji reaction is right clicked
                if (event?.button === 2) {
                    return;
                }

                // Prevent text input blur when emoji reaction is left clicked
                event.preventDefault();
            }}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={emojiCodes.join('')}
            accessible
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            sentryLabel={CONST.SENTRY_LABEL.EMOJI_REACTIONS.REACTION_BUBBLE}
        >
            <Text style={[styles.emojiReactionBubbleText, StyleUtils.getEmojiReactionBubbleTextStyle(isContextMenu)]}>{emojiCodes.join('')}</Text>
            {count > 0 && <Text style={[styles.reactionCounterText, StyleUtils.getEmojiReactionCounterTextStyle(hasUserReacted)]}>{count}</Text>}
        </PressableWithSecondaryInteraction>
    );
}

export default EmojiReactionBubble;
