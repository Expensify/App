import React from 'react';
import PropTypes from 'prop-types';
import {View, Dimensions} from 'react-native';
import SkeletonViewLines from './SkeletonViewLines';
import CONST from '../../CONST';

const propTypes = {
    /** Whether to animate the skeleton view */
    shouldAnimate: PropTypes.bool,

    /** Number of possible visible content items */
    possibleVisibleContentItems: PropTypes.number,
};

const defaultProps = {
    shouldAnimate: true,
    possibleVisibleContentItems: 0,
};

function ReportActionsSkeletonView({shouldAnimate, possibleVisibleContentItems}) {
    const contentItems = possibleVisibleContentItems || Math.ceil(Dimensions.get('window').height / CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
    const skeletonViewLines = [];
    for (let index = 0; index < contentItems; index++) {
        const iconIndex = (index + 1) % 4;
        switch (iconIndex) {
            case 2:
                skeletonViewLines.push(
                    <SkeletonViewLines
                        shouldAnimate={shouldAnimate}
                        numberOfRows={2}
                        key={`skeletonViewLines${index}`}
                    />,
                );
                break;
            case 0:
                skeletonViewLines.push(
                    <SkeletonViewLines
                        shouldAnimate={shouldAnimate}
                        numberOfRows={3}
                        key={`skeletonViewLines${index}`}
                    />,
                );
                break;
            default:
                skeletonViewLines.push(
                    <SkeletonViewLines
                        shouldAnimate={shouldAnimate}
                        numberOfRows={1}
                        key={`skeletonViewLines${index}`}
                    />,
                );
        }
    }
    return <View>{skeletonViewLines}</View>;
}

ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
ReportActionsSkeletonView.propTypes = propTypes;
ReportActionsSkeletonView.defaultProps = defaultProps;
export default ReportActionsSkeletonView;
