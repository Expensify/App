import React from 'react';
import PropTypes from 'prop-types';
import SkeletonViewLines from './SkeletonViewLines';
import CONST from '../../CONST';
import ReportFooter from '../../pages/home/report/ReportFooter';

const propTypes = {
    /** Height of the container component */
    containerHeight: PropTypes.number.isRequired,

    /** Should we show composer at the bottom */
    shouldShowComposer: PropTypes.bool,
};

const defaultProps = {
    shouldShowComposer: false,
};

const ReportActionsSkeletonView = (props) => {
    // Determines the number of content items based on container height
    const possibleVisibleContentItems = Math.ceil(props.containerHeight / CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
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
    return (
        <>
            {skeletonViewLines}
            {props.shouldShowComposer && skeletonViewLines.length > 0 && (
                <ReportFooter
                    isComposerFullSize={false}
                    isOffline={false}
                    onSubmitComment={() => {}}
                    report={{reportID: '0'}}
                    reportActions={{}}
                />
            )}
        </>
    );
};

ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
ReportActionsSkeletonView.propTypes = propTypes;
ReportActionsSkeletonView.defaultProps = defaultProps;

export default ReportActionsSkeletonView;
