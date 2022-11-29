import React from 'react';
import PropTypes from 'prop-types';
import {Rect, Circle} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import CONST from '../../CONST';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';

const propTypes = {
    /** Number of rows to show in Skeleton UI block */
    numberOfRows: PropTypes.number.isRequired,
    animate: PropTypes.bool,
};

const defaultTypes = {
    animate: true,
};

const SkeletonViewLines = props => (
    <SkeletonViewContentLoader
        animate={props.animate}
        height={CONST.CHAT_SKELETON_VIEW.HEIGHT_FOR_ROW_COUNT[props.numberOfRows]}
        backgroundColor={themeColors.highlightBG}
        foregroundColor={themeColors.border}
        style={styles.mr5}
    >
        <Circle cx="40" cy="26" r="20" />
        <Rect x="67" y="11" width="20%" height="8" />
        <Rect x="67" y="31" width="100%" height="8" />
        {props.numberOfRows > 1 && <Rect x="67" y="51" width="50%" height="8" />}
        {props.numberOfRows > 2 && <Rect x="67" y="71" width="50%" height="8" />}
    </SkeletonViewContentLoader>
);

SkeletonViewLines.displayName = 'SkeletonViewLines';
SkeletonViewLines.propTypes = propTypes;
SkeletonViewLines.defaultProps = defaultTypes;
export default SkeletonViewLines;
