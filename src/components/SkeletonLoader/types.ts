import type {ReactNode} from 'react';
import type {DimensionValue, StyleProp, ViewStyle} from 'react-native';

type SkeletonLoaderProps = {
    /** Pure skeleton geometry, rendered once for each color layer. */
    children: ReactNode;
    width?: DimensionValue;
    height: DimensionValue;
    style?: StyleProp<ViewStyle>;
    backgroundColor: string;
    foregroundColor: string;
    animate?: boolean;
    /** Seconds, matching the legacy content loader. */
    speed?: number;
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

export type {SkeletonLoaderProps, SkeletonViewRectProps};
