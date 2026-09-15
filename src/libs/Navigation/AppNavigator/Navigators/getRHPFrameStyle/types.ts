import type {ThemeStyles} from '@styles/index';

// eslint-disable-next-line no-restricted-imports
import type {Animated, StyleProp, ViewStyle} from 'react-native';

type RHPFrameStyleParams = {
    /** Theme styles, from `useThemeStyles`. */
    styles: ThemeStyles;

    /** Animated RHP width, driven by `expandedRHPProgress`. */
    animatedWidth: Animated.AnimatedSubtraction<string | number>;

    /** Whether the RHP covers the whole screen instead of sitting next to it. */
    shouldUseNarrowLayout: boolean;

    /** Whether a report or expense is stacked in the RHP, in which case every card draws its own modal. */
    shouldUseCenteredFrame: boolean;
};

type GetRHPFrameStyle = (params: RHPFrameStyleParams) => Animated.WithAnimatedValue<StyleProp<ViewStyle>>;

export default GetRHPFrameStyle;
