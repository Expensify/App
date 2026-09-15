import type GetRHPFrameStyle from './types';

/** Native keeps the RHP full-bleed. The floating card is web only. */
const getRHPFrameStyle: GetRHPFrameStyle = ({styles, animatedWidth, shouldUseNarrowLayout}) => [
    styles.pAbsolute,
    styles.r0,
    styles.h100,
    styles.overflowHidden,
    {width: shouldUseNarrowLayout ? '100%' : animatedWidth},
];

export default getRHPFrameStyle;
