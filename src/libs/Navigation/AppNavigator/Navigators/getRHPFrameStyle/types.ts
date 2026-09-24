import type {OverlayPositionValue, ThemeStyles} from '@styles/index';

import type {StyleProp, ViewStyle} from 'react-native';

type RHPFrameStyleParams = {
    styles: ThemeStyles;

    animatedWidth: OverlayPositionValue;

    shouldUseNarrowLayout: boolean;

    /** Whether a report or expense is stacked in the RHP, in which case every card draws its own modal. */
    shouldUseCenteredFrame: boolean;
};

type GetRHPFrameStyle = (params: RHPFrameStyleParams) => StyleProp<ViewStyle>;

export default GetRHPFrameStyle;
