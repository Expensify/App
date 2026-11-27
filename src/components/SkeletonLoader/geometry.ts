import type {DimensionValue} from 'react-native';

import type {SkeletonViewRectProps} from './types';

const SMALL_RADIUS = 2;
const LARGE_RADIUS = 4;
const SMALL_BAR_HEIGHT = 8;

function resolveSkeletonDimension(value: SkeletonViewRectProps['width']): DimensionValue {
    if (typeof value === 'string' && value.endsWith('%')) {
        return `${Number.parseFloat(value)}%`;
    }

    const resolved = Number(value);
    return Number.isFinite(resolved) ? Math.max(0, resolved) : 0;
}

function getSkeletonRadius(height: number | string | undefined): number {
    // Match SkeletonRect's existing radius choice, including numeric strings and percentages.
    return Number.parseFloat(String(height)) <= SMALL_BAR_HEIGHT ? SMALL_RADIUS : LARGE_RADIUS;
}

export {getSkeletonRadius, resolveSkeletonDimension};
