import React from 'react';
import {Rect} from 'react-native-svg';
import type {RectProps} from 'react-native-svg';

const BORDER_RADIUS_SMALL = 2; // text bars (height <= 8)
const BORDER_RADIUS_MEDIUM = 4; // content blocks (height > 8)
const HEIGHT_THRESHOLD = 8;

type SkeletonRectProps = Omit<RectProps, 'rx' | 'ry' | 'x' | 'y'> & {
    /** Sets both rx and ry. Auto-derived from height when omitted. */
    borderRadius?: number;
};

function getDefaultRadius(height: RectProps['height']): number {
    const num = typeof height === 'number' ? height : parseFloat(String(height));
    if (Number.isNaN(num)) {
        return BORDER_RADIUS_MEDIUM;
    }
    return num <= HEIGHT_THRESHOLD ? BORDER_RADIUS_SMALL : BORDER_RADIUS_MEDIUM;
}

function SkeletonRect({borderRadius, height, ...rest}: SkeletonRectProps) {
    const radius = borderRadius ?? getDefaultRadius(height);
    return (
        <Rect
            // eslint-disable-next-line react/jsx-props-no-spreading -- SkeletonRect is a thin wrapper that forwards all remaining RectProps to the underlying SVG Rect
            {...rest}
            height={height}
            rx={radius}
            ry={radius}
        />
    );
}

export default SkeletonRect;
