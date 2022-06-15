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
import * as PolicyUtils from '../../PolicyUtils';
import CONST from '../../../CONST';

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    policies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** The type of the policy */
        type: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    reports: {},
    betas: [],
};

/**
 * Get the most recently accessed report for the user
 *
 * @param {Object} reports
 * @param {String[]} [reportTypesToIgnore]
 * @returns {Object}
 */
const getInitialReportScreenParams = (reports, reportTypesToIgnore) => {
    const last = ReportUtils.findLastAccessedReport(reports, reportTypesToIgnore);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID: String(reportID)};
};

const MainDrawerNavigator = (props) => {
    // If one is a member of a free policy, then they are allowed to see the Policy default rooms.
    // For everyone else, one must be on the beta to see a default room.
    let reportTypesToIgnore = [];
    const isMemberOfFreePolicy = PolicyUtils.isMemberOfFreePolicy(props.policies);
    if (isMemberOfFreePolicy && !Permissions.canUseDefaultRooms(props.betas)) {
        reportTypesToIgnore = [CONST.REPORT.CHAT_TYPE.DOMAIN_ALL];
    } else if (!Permissions.canUseDefaultRooms(props.betas)) {
        reportTypesToIgnore = [
            CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        ];
    }
    const initialParams = getInitialReportScreenParams(props.reports, reportTypesToIgnore);

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
