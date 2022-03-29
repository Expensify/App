import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';

import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../../ONYXKEYS';
import SCREENS from '../../../SCREENS';
import Permissions from '../../Permissions';

// Screens
import ReportScreen from '../../../pages/home/ReportScreen';
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import * as ReportUtils from '../../reportUtils';

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    reports: {},
    betas: [],
};

/**
 * Get the most recently accessed report for the user
 *
 * @param {Object} reports
 * @param {Boolean} [ignoreDefaultRooms]
 * @returns {Object}
 */
const getInitialReportScreenParams = (reports, ignoreDefaultRooms) => {
    const last = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID: String(reportID)};
};

const MainDrawerNavigator = (props) => {
    const initialParams = getInitialReportScreenParams(props.reports, !Permissions.canUseDefaultRooms(props.betas));

    // Wait until reports are fetched and there is a reportID in initialParams
    if (!initialParams.reportID) {
        return <FullScreenLoadingIndicator name="Main Drawer Loader" timeout={15 * 1000} />;
    }

    // After the app initializes and reports are available the home navigation is mounted
    // This way routing information is updated (if needed) based on the initial report ID resolved.
    // This is usually needed after login/create account and re-launches
    return (
        <BaseDrawerNavigator
            drawerContent={() => <SidebarScreen />}
            screens={[
                {
                    name: SCREENS.REPORT,
                    component: ReportScreen,
                    initialParams,
                },
            ]}
            isMainScreen
        />
    );
};

MainDrawerNavigator.propTypes = propTypes;
MainDrawerNavigator.defaultProps = defaultProps;
MainDrawerNavigator.displayName = 'MainDrawerNavigator';

export default withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(MainDrawerNavigator);
export {getInitialReportScreenParams};
