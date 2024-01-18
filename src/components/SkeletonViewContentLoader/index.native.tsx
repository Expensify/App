import React from 'react';
import SkeletonViewContentLoader from 'react-content-loader/native';
import type SkeletonViewContentLoaderProps from './types';

function ContentLoader(props: SkeletonViewContentLoaderProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <SkeletonViewContentLoader {...props} />;
}

export default ContentLoader;
