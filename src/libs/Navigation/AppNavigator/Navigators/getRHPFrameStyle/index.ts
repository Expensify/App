import {getSingleRHPWidthStyleValue} from '@libs/Navigation/helpers/singleRHPWidth';

import variables from '@styles/variables';

import type GetRHPFrameStyle from './types';

/** Narrow keeps the full-bleed frame, the stacked report flow uses an invisible one (each card draws its own modal), everything else is a single floating card. */
const getRHPFrameStyle: GetRHPFrameStyle = ({styles, animatedWidth, singleRHPWidth, shouldUseNarrowLayout, shouldUseCenteredFrame}) => {
    if (shouldUseNarrowLayout) {
        return [styles.pAbsolute, styles.r0, styles.h100, styles.overflowHidden, {width: '100%'}];
    }

    if (shouldUseCenteredFrame) {
        return [styles.pAbsolute, styles.RHPCenteredFrame, {width: animatedWidth}];
    }

    // Border-box card, so the border is added back on top of the width or the content gets clipped.
    const floatingCardWidth = getSingleRHPWidthStyleValue(singleRHPWidth, 2 * variables.rhpFloatingCardBorderWidth);

    // translateZ0 makes the frame a containing block that clips the fixed RHP screen to the radius.
    return [styles.pAbsolute, styles.overflowHidden, styles.translateZ0, styles.RHPFloatingCard, {width: floatingCardWidth}];
};

export default getRHPFrameStyle;
