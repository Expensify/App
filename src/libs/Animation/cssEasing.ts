import {cubicBezier} from 'react-native-reanimated';

/**
 * Reanimated CSS animation easings that exactly match the worklet easings used with `withTiming`.
 * Use these when migrating a worklet animation to a CSS animation or transition, so the curve stays the same.
 */

/** Exact equivalent of `Easing.out(Easing.quad)` */
const QUAD_OUT = cubicBezier(1 / 3, 2 / 3, 2 / 3, 1);

/** Exact equivalent of `Easing.in(Easing.quad)` */
const QUAD_IN = cubicBezier(1 / 3, 0, 2 / 3, 1 / 3);

export {QUAD_OUT, QUAD_IN};
