import variables from '@styles/variables';

// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import type GetRHPFrameStyle from './types';

/**
 * On wide layout the RHP is a card inset from the viewport edges, with rounded corners, a border and a shadow,
 * instead of the full-bleed `r0` and `h100` anchoring. Narrow layout keeps the full-bleed frame.
 */
const getRHPFrameStyle: GetRHPFrameStyle = ({styles, animatedWidth, shouldUseNarrowLayout}) => {
    if (shouldUseNarrowLayout) {
        return [styles.pAbsolute, styles.r0, styles.h100, styles.overflowHidden, {width: '100%'}];
    }

    // The card is border-box, so its border has to be added back on top of the animated width. Without it the content
    // box ends up narrower than the RHP width and the fixed-width panes inside the wide RHP get clipped.
    return [styles.pAbsolute, styles.overflowHidden, styles.RHPFloatingCard, {width: Animated.add(animatedWidth, 2 * variables.rhpFloatingCardBorderWidth)}];
};

export default getRHPFrameStyle;
