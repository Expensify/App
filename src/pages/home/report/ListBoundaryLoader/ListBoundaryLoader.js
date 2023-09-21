import React from 'react';
import PropTypes from 'prop-types';
import ReportActionsSkeletonView from '../../../../components/ReportActionsSkeletonView';
import CONST from '../../../../CONST';
import useNetwork from '../../../../hooks/useNetwork';
import ListHeaderComponentLoader from './ListHeaderComponentLoader/ListHeaderComponentLoader';

const propTypes = {
    type: PropTypes.string.isRequired,
    isLoadingOlderReportActions: PropTypes.bool,
    isLoadingInitialReportActions: PropTypes.bool,
    isLoadingNewerReportActions: PropTypes.bool,
    skeletonViewHeight: PropTypes.number,
    lastReportActionName: PropTypes.string,
};

const defaultProps = {
    isLoadingOlderReportActions: false,
    isLoadingInitialReportActions: false,
    isLoadingNewerReportActions: false,
    skeletonViewHeight: 0,
    lastReportActionName: '',
};

function ListBoundaryLoader({type, isLoadingOlderReportActions, isLoadingInitialReportActions, skeletonViewHeight, lastReportActionName, isLoadingNewerReportActions}) {
    const {isOffline} = useNetwork();
    // we use two different loading components for header and footer to reduce the jumping effect when you scrolling to the newer reports
    if (type === CONST.LIST_COMPONENTS.FOOTER) {
        if (isLoadingOlderReportActions) {
            return <ReportActionsSkeletonView containerHeight={CONST.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT * 3} />;
        }

        // Make sure the oldest report action loaded is not the first. This is so we do not show the
        // skeleton view above the created action in a newly generated optimistic chat or one with not
        // that many comments.
        // const lastReportAction = _.last(sortedReportActions) || {};
        if (isLoadingInitialReportActions && lastReportActionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return (
                <ReportActionsSkeletonView
                    containerHeight={skeletonViewHeight}
                    animate={!isOffline}
                />
            );
        }

        return null;
    }
    if (type === CONST.LIST_COMPONENTS.HEADER && isLoadingNewerReportActions) {
        // the styles for android and the rest components are different that's why we use two different components
        return <ListHeaderComponentLoader />;
    }
    return null;
}

ListBoundaryLoader.propTypes = propTypes;
ListBoundaryLoader.defaultProps = defaultProps;

export default ListBoundaryLoader;
