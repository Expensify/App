/** Absolutely positioned skeleton shape that must be rendered inside SkeletonLoader. */
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useContext} from 'react';
import {View} from 'react-native';

import type {SkeletonViewRectProps} from './types';

import {getSkeletonRadius, resolveSkeletonDimension} from './geometry';
import SkeletonContext from './SkeletonContext';

function SkeletonViewRect({x = 0, y = 0, width, height, borderRadius, testID}: SkeletonViewRectProps) {
    const styles = useThemeStyles();
    const loader = useContext(SkeletonContext);
    if (!loader) {
        throw new Error('SkeletonViewRect must be rendered inside SkeletonLoader');
    }

    const shapeWidth = resolveSkeletonDimension(width);
    const shapeHeight = resolveSkeletonDimension(height);
    const shapeStyle = {
        left: x,
        top: y,
        width: shapeWidth,
        height: shapeHeight,
        borderRadius: borderRadius ?? getSkeletonRadius(height),
        backgroundColor: loader.isForegroundLayer ? loader.foregroundColor : loader.backgroundColor,
    };

    return (
        <View
            testID={loader.isForegroundLayer ? undefined : testID}
            style={[styles.pAbsolute, styles.overflowHidden, shapeStyle]}
        />
    );
}

export default SkeletonViewRect;
