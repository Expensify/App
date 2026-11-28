import type {DimensionValue} from 'react-native';

import type {SkeletonViewRectProps} from './types';

const SMALL_RADIUS = 2;
const LARGE_RADIUS = 4;
const SMALL_BAR_HEIGHT = 8;

function resolveSkeletonDimension(value: SkeletonViewRectProps['width']): DimensionValue {
    if (typeof value === 'string') {
        return value;
    }

    return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function getSkeletonRadius(height: number | string | undefined): number {
    // Legacy SVG SkeletonRect callers still pass numeric strings and percentages.
    return Number.parseFloat(String(height)) <= SMALL_BAR_HEIGHT ? SMALL_RADIUS : LARGE_RADIUS;
}

export {getSkeletonRadius, resolveSkeletonDimension};
