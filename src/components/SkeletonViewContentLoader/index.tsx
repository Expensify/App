import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {CSSProperties} from 'react';
import SkeletonViewContentLoader from 'react-content-loader';
import {StyleSheet} from 'react-native';
import type SkeletonViewContentLoaderProps from './types';

function ContentLoader({style, ...props}: SkeletonViewContentLoaderProps) {
    return (
        <SkeletonViewContentLoader
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // Using StyleSheet.flatten() because SkeletonViewContentLoader is not able to handle array style notation(eg. style={[style1, style2]}) of style prop
            style={StyleSheet.flatten(style) as CSSProperties}
        />
    );
}

export default ContentLoader;
