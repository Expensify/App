import variables from '@styles/variables';

// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import type GetRHPFrameStyle from './types';

/** Narrow keeps the full-bleed frame, the stacked report flow uses an invisible one (each card draws its own modal), everything else is a single floating card. */
const getRHPFrameStyle: GetRHPFrameStyle = ({styles, animatedWidth, shouldUseNarrowLayout, shouldUseCenteredFrame}) => {
    if (shouldUseNarrowLayout) {
        return [styles.pAbsolute, styles.r0, styles.h100, styles.overflowHidden, {width: '100%'}];
    }

    if (shouldUseCenteredFrame) {
        return [styles.pAbsolute, styles.RHPCenteredFrame, {width: animatedWidth}];
    }

    // Border-box card, so the border is added back on top of the animated width or the wide RHP's fixed-width panes get clipped.
    // translateZ0 makes the frame a containing block that clips the fixed RHP screen to the radius.
    return [styles.pAbsolute, styles.overflowHidden, styles.translateZ0, styles.RHPFloatingCard, {width: Animated.add(animatedWidth, 2 * variables.rhpFloatingCardBorderWidth)}];
};

export default getRHPFrameStyle;
