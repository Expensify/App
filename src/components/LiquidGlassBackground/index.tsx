import type LiquidGlassBackgroundProps from './types';

/** Liquid glass exists only on iOS 26, so other platforms keep their solid or bare buttons. */
const isLiquidGlassSupported = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LiquidGlassBackground(props: LiquidGlassBackgroundProps) {
    return null;
}

export default LiquidGlassBackground;
export {isLiquidGlassSupported};
