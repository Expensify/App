import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import SkeletonViewLines from './SkeletonViewLines';
import CONST from '../../CONST';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const ReportActionsSkeletonView = (props) => {
    const possibleVisibleContentItems = Math.floor(props.windowHeight / CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
    const skeletonViewLines = [];
    for (let index = 0; index < possibleVisibleContentItems; index++) {
        const iconIndex = (index + 1) % 4;
        switch (iconIndex) {
            case 2:
                skeletonViewLines.push(<SkeletonViewLines numberOfRows={2} key={`skeletonViewLines${index}`} />);
                break;
            case 0:
                skeletonViewLines.push(<SkeletonViewLines numberOfRows={3} key={`skeletonViewLines${index}`} />);
                break;
            default:
                skeletonViewLines.push(<SkeletonViewLines numberOfRows={1} key={`skeletonViewLines${index}`} />);
        }
    }
    return skeletonViewLines;
};

ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
ReportActionsSkeletonView.propTypes = propTypes;
export default withWindowDimensions(ReportActionsSkeletonView);
