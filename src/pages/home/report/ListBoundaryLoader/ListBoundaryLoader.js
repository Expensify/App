import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionsSkeletonView from '../../../../components/ReportActionsSkeletonView';
import CONST from '../../../../CONST';
import useNetwork from '../../../../hooks/useNetwork';
import styles, {stylesGenerator} from '../../../../styles/styles';
import themeColors from '../../../../styles/themes/default';

const propTypes = {
    /** type of rendered loader. Can be 'header' or 'footer' */
    type: PropTypes.oneOf([CONST.LIST_COMPONENTS.HEADER, CONST.LIST_COMPONENTS.FOOTER]).isRequired,

    /** Shows if we call fetching older report action */
    isLoadingOlderReportActions: PropTypes.bool,

    /* Shows if we call initial loading of report action */
    isLoadingInitialReportActions: PropTypes.bool,

    /** Shows if we call fetching newer report action */
    isLoadingNewerReportActions: PropTypes.bool,

    /** Name of the last report action */
    lastReportActionName: PropTypes.string,
};

const defaultProps = {
    isLoadingOlderReportActions: false,
    isLoadingInitialReportActions: false,
    isLoadingNewerReportActions: false,
    lastReportActionName: '',
};

function ListBoundaryLoader({type, isLoadingOlderReportActions, isLoadingInitialReportActions, lastReportActionName, isLoadingNewerReportActions}) {
    const {isOffline} = useNetwork();

    // we use two different loading components for header and footer to reduce the jumping effect when you scrolling to the newer reports
    if (type === CONST.LIST_COMPONENTS.FOOTER) {
        if (isLoadingOlderReportActions) {
            return <ReportActionsSkeletonView />;
        }

        // Make sure the oldest report action loaded is not the first. This is so we do not show the
        // skeleton view above the created action in a newly generated optimistic chat or one with not
        // that many comments.
        if (isLoadingInitialReportActions && lastReportActionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return (
                <ReportActionsSkeletonView
                    shouldAnimate={!isOffline}
                    possibleVisibleContentItems={3}
                />
            );
        }
    }
    if (type === CONST.LIST_COMPONENTS.HEADER && isLoadingNewerReportActions) {
        // applied for a header of the list, i.e. when you scroll to the bottom of the list
        // the styles for android and the rest components are different that's why we use two different components
        return (
            <View style={[stylesGenerator.alignItemsCenter, styles.justifyContentCenter, styles.chatBottomLoader]}>
                <ActivityIndicator
                    color={themeColors.spinner}
                    size="small"
                />
            </View>
        );
    }
}

ListBoundaryLoader.propTypes = propTypes;
ListBoundaryLoader.defaultProps = defaultProps;
ListBoundaryLoader.displayName = 'ListBoundaryLoader';

export default ListBoundaryLoader;
