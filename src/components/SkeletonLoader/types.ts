/** Geometry and motion contracts for View-based skeletons, independent of SVG. */
import type {ReactNode} from 'react';
import type {DimensionValue, StyleProp, ViewStyle} from 'react-native';

type SkeletonAnimation = 'shimmer' | 'pulse';

type SkeletonLoaderProps = {
    /** Pure skeleton geometry; the pulse candidate renders it once for each color layer. */
    children: ReactNode;
    width?: DimensionValue;
    height: DimensionValue;
    style?: StyleProp<ViewStyle>;
    backgroundColor: string;
    foregroundColor: string;
    animate?: boolean;
    /** Seconds, matching the legacy content loader. */
    speed?: number;
    /** Both candidates remain available for the performance comparison. */
    animation?: SkeletonAnimation;
    testID?: string;
};

type SkeletonViewRectProps = {
    x?: number;
    y?: number;
    /** Percentages resolve against the whole loader, before applying x/y offsets. */
    width: number | `${number}` | `${number}%`;
    /** Percentages resolve against the whole loader height. */
    height: number | `${number}` | `${number}%`;
    /** Defaults to the legacy radius: 2 for heights up to 8, otherwise 4. */
    borderRadius?: number;
    testID?: string;
};

export type {SkeletonAnimation, SkeletonLoaderProps, SkeletonViewRectProps};
