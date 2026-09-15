import variables from '@styles/variables';

// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import type GetRHPFrameStyle from './types';

/**
 * The frame has three shapes on web. Narrow layout keeps the full-bleed `r0` and `h100` anchoring. The stacked report
 * flow uses an invisible frame, because there each card draws its own bordered modal and the frame must not clip them.
 * Everything else is a single floating card, where the frame itself carries the border, the radius and the shadow.
 */
const getRHPFrameStyle: GetRHPFrameStyle = ({styles, animatedWidth, shouldUseNarrowLayout, shouldUseCenteredFrame}) => {
    if (shouldUseNarrowLayout) {
        return [styles.pAbsolute, styles.r0, styles.h100, styles.overflowHidden, {width: '100%'}];
    }

    if (shouldUseCenteredFrame) {
        return [styles.pAbsolute, styles.RHPCenteredFrame, {width: animatedWidth}];
    }

    // The card is border-box, so its border has to be added back on top of the animated width. Without it the content
    // box ends up narrower than the RHP width and the fixed-width panes inside the wide RHP get clipped.
    return [styles.pAbsolute, styles.overflowHidden, styles.RHPFloatingCard, {width: Animated.add(animatedWidth, 2 * variables.rhpFloatingCardBorderWidth)}];
};

export default getRHPFrameStyle;
