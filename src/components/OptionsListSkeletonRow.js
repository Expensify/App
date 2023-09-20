import React from 'react';
import PropTypes from 'prop-types';
import {Rect, Circle} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import styles from '../styles/styles';

const propTypes = {
    /** Whether to animate the skeleton view */
    shouldAnimate: PropTypes.bool.isRequired,

    /** Line width string */
    lineWidth: PropTypes.string.isRequired,
};

function OptionsListSkeletonRow({lineWidth, shouldAnimate}) {
    return (
        <SkeletonViewContentLoader
            animate={shouldAnimate}
            height={CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT}
            backgroundColor={themeColors.skeletonLHNIn}
            foregroundColor={themeColors.skeletonLHNOut}
            style={styles.mr5}
        >
            <Circle
                cx="40"
                cy="32"
                r="20"
            />
            <Rect
                x="72"
                y="18"
                width="20%"
                height="8"
            />
            <Rect
                x="72"
                y="38"
                width={lineWidth}
                height="8"
            />
        </SkeletonViewContentLoader>
    );
}

OptionsListSkeletonRow.propTypes = propTypes;
export default OptionsListSkeletonRow;