import React from 'react';
import PropTypes from 'prop-types';
import SkeletonViewLines from './SkeletonViewLines';
import CONST from '../../CONST';

const propTypes = {
    /** Height of the container component */
    containerHeight: PropTypes.number.isRequired,

    /** Whether to animate the skeleton view */
    animate: PropTypes.bool,
};

const defaultProps = {
    animate: true,
};

const ReportActionsSkeletonView = (props) => {
    // Determines the number of content items based on container height
    const possibleVisibleContentItems = Math.ceil(props.containerHeight / CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
    const skeletonViewLines = [];
    for (let index = 0; index < possibleVisibleContentItems; index++) {
        const iconIndex = (index + 1) % 4;
        switch (iconIndex) {
            case 2:
                skeletonViewLines.push(<SkeletonViewLines animate={props.animate} numberOfRows={2} key={`skeletonViewLines${index}`} />);
                break;
            case 0:
                skeletonViewLines.push(<SkeletonViewLines animate={props.animate} numberOfRows={3} key={`skeletonViewLines${index}`} />);
                break;
            default:
                skeletonViewLines.push(<SkeletonViewLines animate={props.animate} numberOfRows={1} key={`skeletonViewLines${index}`} />);
        }
    }
    return <>{skeletonViewLines}</>;
};

ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
ReportActionsSkeletonView.propTypes = propTypes;
ReportActionsSkeletonView.defaultProps = defaultProps;
export default ReportActionsSkeletonView;
