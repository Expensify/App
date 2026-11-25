import type {OverlayPositionValue, ThemeStyles} from '@styles/index';

import type {StyleProp, ViewStyle} from 'react-native';

type RHPFrameStyleParams<TWidth extends OverlayPositionValue> = {
    styles: ThemeStyles;

    animatedWidth: TWidth;

    /** Committed width of the single floating card, which a drag overrides live in CSS. */
    singleRHPWidth: number;

    shouldUseNarrowLayout: boolean;

    /** Whether a report or expense is stacked in the RHP, in which case every card draws its own modal. */
    shouldUseCenteredFrame: boolean;
};

/**
 * Generic so the returned style keeps the width type the caller passed in. A plain number gives a style a regular
 * `View` accepts, while an animated width gives one only an animated view accepts.
 */
type GetRHPFrameStyle = <TWidth extends OverlayPositionValue>(params: RHPFrameStyleParams<TWidth>) => StyleProp<ViewStyle | {width: TWidth}>;

export default GetRHPFrameStyle;
