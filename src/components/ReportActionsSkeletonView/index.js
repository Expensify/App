import React from 'react';
import Animated, {
    FadeIn, FadeOut, Layout,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import SkeletonViewLines from './SkeletonViewLines';
import CONST from '../../CONST';

const propTypes = {
    /** Height of the container component */
    containerHeight: PropTypes.number.isRequired,
};

const ReportActionsSkeletonView = (props) => {
    // Determines the number of content items based on container height
    const possibleVisibleContentItems = Math.floor(props.containerHeight / CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
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
    return <Animated.View layout={Layout.springify()} entering={FadeIn.duration(1000)} exiting={FadeOut.duration(1000)}>{skeletonViewLines}</Animated.View>;
};

ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
ReportActionsSkeletonView.propTypes = propTypes;
export default ReportActionsSkeletonView;
