import React from 'react';
import PropTypes from 'prop-types';
import {Rect, Circle} from 'react-native-svg';
import SkeletonViewContentLoader from 'react-content-loader/native';

const propTypes = {
    numberOfRows: PropTypes.number.isRequired,
};

const SkeletonViewLines = (props) => {
    const renderOneLine = () => props.numberOfRows;

    return (
        <SkeletonViewContentLoader
            height={60}
        >
            <Circle cx="50" cy="26" r="20" />
            <Rect x="90" y="11" width="20%" height="8" />
            <Rect x="90" y="31" width="90%" height="8" />
        </SkeletonViewContentLoader>
    );
};

SkeletonViewLines.displayName = 'SkeletonViewLines';
SkeletonViewLines.propTypes = propTypes;
export default SkeletonViewLines;

// <ContentLoadingWrapper
//         height={100}
//     >
//         <Circle cx="50" cy="26" r="20" />
//         <Rect x="90" y="11" width="20%" height="8" />
//         <Rect x="90" y="31" width="90%" height="8" />
//         <Rect x="90" y="51" width="90%" height="8" />
//         <Rect x="90" y="71" width="50%" height="8" />
//     </ContentLoadingWrapper>

//     <ContentLoadingWrapper
//         height={80}
//     >
//         <Circle cx="50" cy="26" r="20" />
//         <Rect x="90" y="11" width="20%" height="8" />
//         <Rect x="90" y="31" width="75%" height="8" />
//         <Rect x="90" y="51" width="50%" height="8" />
//     </ContentLoadingWrapper>
