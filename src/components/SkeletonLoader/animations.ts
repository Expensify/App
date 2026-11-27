/** CSS loops never use JavaScript completion callbacks to start another cycle. */
import {css} from 'react-native-reanimated';

const DEFAULT_SPEED_SECONDS = 1.2;
const MILLISECONDS_PER_SECOND = 1000;

const shimmer = css.keyframes({
    from: {transform: [{translateX: '-100%'}]},
    to: {transform: [{translateX: '100%'}]},
});

const pulse = css.keyframes({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- CSS percentage selectors are not JavaScript identifiers.
    '0%, 100%': {opacity: 0},
    // eslint-disable-next-line @typescript-eslint/naming-convention -- CSS percentage selectors are not JavaScript identifiers.
    '50%': {opacity: 1},
});

function getSkeletonAnimation(animation: 'shimmer' | 'pulse', speed: number) {
    return {
        animationName: animation === 'shimmer' ? shimmer : pulse,
        animationDuration: speed * MILLISECONDS_PER_SECOND,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
    } as const;
}

export {DEFAULT_SPEED_SECONDS, getSkeletonAnimation};
