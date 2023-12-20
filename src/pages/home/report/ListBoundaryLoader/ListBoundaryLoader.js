import PropTypes from 'prop-types';
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

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
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    // We use two different loading components for the header and footer
    // to reduce the jumping effect when the user is scrolling to the newer report actions
    if (type === CONST.LIST_COMPONENTS.FOOTER) {
        if (isLoadingOlderReportActions) {
            return <ReportActionsSkeletonView />;
        }

        // Make sure the report chat is not loaded till the beginning. This is so we do not show the
        // skeleton view above the "created" action in a newly generated optimistic chat or one with not
        // that many comments.
        // Also, if we are offline and the report is not yet loaded till the beginning, we assume there are more actions to load,
        // therefore show the skeleton view, even though the actions are not loading.
        if (lastReportActionName !== CONST.REPORT.ACTIONS.TYPE.CREATED && (isLoadingInitialReportActions || isOffline)) {
            return <ReportActionsSkeletonView possibleVisibleContentItems={3} />;
        }
    }
    if (type === CONST.LIST_COMPONENTS.HEADER && isLoadingNewerReportActions) {
        // applied for a header of the list, i.e. when you scroll to the bottom of the list
        // the styles for android and the rest components are different that's why we use two different components
        return (
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.chatBottomLoader]}>
                <ActivityIndicator
                    color={theme.spinner}
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
