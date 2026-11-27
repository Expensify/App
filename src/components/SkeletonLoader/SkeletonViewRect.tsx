/** View geometry is explicit so legacy SVG children never need runtime conversion. */
import useThemeStyles from '@hooks/useThemeStyles';

import React, {useContext} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import type {SkeletonViewRectProps} from './types';

import {getSkeletonAnimation} from './animations';
import {getSkeletonRadius, resolveSkeletonDimension} from './geometry';
import getGradientStyle from './getGradientStyle';
import SkeletonContext from './SkeletonContext';

function SkeletonViewRect({x = 0, y = 0, width, height, borderRadius, testID}: SkeletonViewRectProps) {
    const styles = useThemeStyles();
    const loader = useContext(SkeletonContext);
    if (!loader) {
        throw new Error('SkeletonViewRect must be rendered inside SkeletonLoader');
    }

    const shapeWidth = resolveSkeletonDimension(width, loader.width);
    const shapeHeight = resolveSkeletonDimension(height, loader.height);
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
        >
            {loader.isAnimating && loader.animation === 'shimmer' && (
                <Animated.View
                    testID={testID ? `${testID}-shimmer` : undefined}
                    style={[
                        styles.pAbsolute,
                        {left: -x, top: 0, width: loader.width, height: shapeHeight},
                        getGradientStyle(loader.backgroundColor, loader.foregroundColor),
                        getSkeletonAnimation('shimmer', loader.speed),
                    ]}
                />
            )}
        </View>
    );
}

export default SkeletonViewRect;
