import React from 'react';
import PropTypes from 'prop-types';
import {Rect, Circle} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import CONST from '../CONST';
import themeColors from '../styles/themes/default';
import styles from '../styles/styles';

const propTypes = {
    /** Height of the container component */
    containerHeight: PropTypes.number.isRequired,

    /** Whether to animate the skeleton view */
    animate: PropTypes.bool,
};

const defaultTypes = {
    animate: true,
};

const LHNSkeletonView = props => {
    const skeletonHeight = CONST.LHN_SKELETON_VIEW_HEIGHT;
    const possibleVisibleContentItems = Math.round(props.containerHeight / skeletonHeight);
    const skeletonViewLines = [];

    for (let index = 0; index < possibleVisibleContentItems; index++) {
        const lengthIndex = index % 3;
        let lineWidth;
        switch (lengthIndex) {
            case 0:
                lineWidth = "100%";
                break;
            case 1:
                lineWidth = "50%";
                break;
            default:
                lineWidth = "65%";
        }
        skeletonViewLines.push(
            <SkeletonViewContentLoader
                key={`skeletonViewLines${index}`}
                animate={props.animate}
                height={skeletonHeight}
                backgroundColor={themeColors.borderLighter}
                foregroundColor={themeColors.border}
                style={styles.mr5}
            >
                <Circle cx="40" cy="32" r="20" />
                <Rect x="76" y="18" width="20%" height="8" />
                <Rect x="76" y="38" width={lineWidth} height="8" />
            </SkeletonViewContentLoader>
        )
    }
    return <>{skeletonViewLines}</>;
};

LHNSkeletonView.displayName = 'LHNSkeletonView';
LHNSkeletonView.propTypes = propTypes;
LHNSkeletonView.defaultProps = defaultTypes;
export default LHNSkeletonView;
