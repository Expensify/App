import type {ComponentProps} from 'react';

import React from 'react';
import {Rect} from 'react-native-svg';

import {getSkeletonRadius} from './SkeletonLoader/geometry';

// react-native-svg only exports `RectProps` from its native entry, so on web the props come from the component itself.
type RectProps = ComponentProps<typeof Rect>;

type SkeletonRectProps = Omit<RectProps, 'rx' | 'ry' | 'x' | 'y'> & {
    /** Sets both rx and ry. Auto-derived from height when omitted. */
    borderRadius?: number;
};

function SkeletonRect({borderRadius, height, ...rest}: SkeletonRectProps) {
    const radius = borderRadius ?? getSkeletonRadius(height);
    return (
        <Rect
            {...rest}
            height={height}
            rx={radius}
            ry={radius}
        />
    );
}

export default SkeletonRect;

// Keep the default SVG export until all legacy content-loader consumers migrate.
export {default as SkeletonViewRect} from './SkeletonLoader/SkeletonViewRect';
