import React from 'react';
import PropTypes from 'prop-types';
import {Rect, Circle} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';
import CONST from '../../CONST';

const propTypes = {
    numberOfRows: PropTypes.number.isRequired,
};

const SkeletonViewLines = props => (
    <SkeletonViewContentLoader
        height={CONST.CHAT_SKELETON_VIEW.HEIGHT_FOR_ROW_COUNT[props.numberOfRows]}
    >
        <Circle cx="50" cy="26" r="20" />
        <Rect x="90" y="11" width="20%" height="8" />
        <Rect x="90" y="31" width="90%" height="8" />
        { props.numberOfRows > 1 && <Rect x="90" y="51" width="50%" height="8" /> }
        { props.numberOfRows > 2 && <Rect x="90" y="71" width="50%" height="8" /> }
    </SkeletonViewContentLoader>
);

SkeletonViewLines.displayName = 'SkeletonViewLines';
SkeletonViewLines.propTypes = propTypes;
export default SkeletonViewLines;
