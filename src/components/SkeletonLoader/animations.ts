/** Opacity pulse keyframes for the skeleton foreground layer. */
import {css} from 'react-native-reanimated';

const DEFAULT_SPEED_SECONDS = 1.2;
const MILLISECONDS_PER_SECOND = 1000;

const pulse = css.keyframes({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- CSS percentage selectors are not JavaScript identifiers.
    '0%, 100%': {opacity: 0},
    // eslint-disable-next-line @typescript-eslint/naming-convention -- CSS percentage selectors are not JavaScript identifiers.
    '50%': {opacity: 1},
});

function getSkeletonAnimation(speed: number) {
    return {
        animationName: pulse,
        animationDuration: speed * MILLISECONDS_PER_SECOND,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
    } as const;
}

export {DEFAULT_SPEED_SECONDS, getSkeletonAnimation};
