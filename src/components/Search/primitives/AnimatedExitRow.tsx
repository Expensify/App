import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import Animated, {Easing, FadeOutUp, LinearTransition} from 'react-native-reanimated';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0);

type AnimatedExitRowProps = {
    /** Whether the FadeOutUp exit animation applies to this row (the caller excludes the last row). */
    shouldApplyAnimation: boolean;

    /** Whether the list shrank this render, so the remaining rows slide up via LinearTransition. */
    hasItemsBeingRemoved: boolean;

    /** The row content to wrap. */
    children: React.ReactNode;
};

/**
 * Wraps a Search row in the FadeOutUp exit + LinearTransition layout animation that plays when an
 * expense is deleted from the list. Extracted from SearchList so ExpenseFlatSearchView can reuse it.
 * Kept byte-identical to the original wrapper because FlashList v2 + reanimated exit animations are
 * timing-sensitive.
 */
function AnimatedExitRow({shouldApplyAnimation, hasItemsBeingRemoved, children}: AnimatedExitRowProps) {
    const styles = useThemeStyles();

    return (
        <Animated.View
            exiting={shouldApplyAnimation ? FadeOutUp.duration(CONST.SEARCH.EXITING_ANIMATION_DURATION).easing(easing) : undefined}
            entering={undefined}
            style={styles.overflowHidden}
            layout={shouldApplyAnimation && hasItemsBeingRemoved ? LinearTransition.easing(easing).duration(CONST.SEARCH.EXITING_ANIMATION_DURATION) : undefined}
        >
            {children}
        </Animated.View>
    );
}

export default AnimatedExitRow;
