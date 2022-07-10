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
import * as ReportUtils from '../../ReportUtils';

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** The type of the policy */
        type: PropTypes.string,
    })),
};

const defaultProps = {
    reports: {},
    betas: [],
    policies: {},
};

/**
 * Get the most recently accessed report for the user
 *
 * @param {Object} reports
 * @param {Boolean} [ignoreDefaultRooms]
 * @param {Object} policies
 * @returns {Object}
 */
const getInitialReportScreenParams = (reports, ignoreDefaultRooms, policies) => {
    const last = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID: String(reportID)};
};

const MainDrawerNavigator = (props) => {
    const initialParams = getInitialReportScreenParams(props.reports, !Permissions.canUseDefaultRooms(props.betas), props.policies);

    // Wait until reports are fetched and there is a reportID in initialParams
    if (!initialParams.reportID) {
        return <FullScreenLoadingIndicator logDetail={{name: 'Main Drawer Loader', initialParams}} />;
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
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(MainDrawerNavigator);
export {getInitialReportScreenParams};
