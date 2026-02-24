import React from 'react';
import SkeletonViewContentLoader from 'react-content-loader/native';
import {StyleSheet} from 'react-native';
import type SkeletonViewContentLoaderProps from './types';

function ContentLoader({style, ...props}: SkeletonViewContentLoaderProps) {
    return (
        <SkeletonViewContentLoader
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            // Using StyleSheet.flatten() because SkeletonViewContentLoader is not able to handle array style notation(eg. style={[style1, style2]}) of style prop
            style={StyleSheet.flatten(style)}
        />
    );
}

export default ContentLoader;
