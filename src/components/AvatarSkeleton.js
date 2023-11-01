import PropTypes from 'prop-types';
import React from 'react';
import {Circle} from 'react-native-svg';
import themeColors from '@styles/themes/default';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

const propTypes = {
    /**  */
    shouldAnimate: PropTypes.bool,
};

const defaultTypes = {
    shouldAnimate: true,
};

function AvatarSkeleton(props) {
    return (
        <SkeletonViewContentLoader
            animate={props.shouldAnimate}
            height={40}
            backgroundColor={themeColors.skeletonLHNIn}
            foregroundColor={themeColors.skeletonLHNOut}
        >
            <Circle
                cx={20}
                cy={20}
                r={20}
            />
        </SkeletonViewContentLoader>
    );
}

AvatarSkeleton.propTypes = propTypes;
AvatarSkeleton.defaultProps = defaultTypes;
AvatarSkeleton.displayName = 'AvatarSkeleton';
export default AvatarSkeleton;
