import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';

import ONYXKEYS from '../../../ONYXKEYS';

import ReportScreen from '../../../pages/home/ReportScreen';
import * as ReportUtils from '../../ReportUtils';
import reportPropTypes from '../../../pages/reportPropTypes';
import {withNavigationPropTypes} from '../../../components/withNavigation';
import * as App from '../../actions/App';
import usePermissions from '../../../hooks/usePermissions';
import CONST from '../../../CONST';
import Navigation from '../Navigation';

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(reportPropTypes),

    /** The policies which the user has access to */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The policy name */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,
        }),
    ),

    isFirstTimeNewExpensifyUser: PropTypes.bool,

    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /** Route specific parameters used on this screen */
        params: PropTypes.shape({
            /** If the admin room should be opened */
            openOnAdminRoom: PropTypes.bool,

            /** The ID of the report this screen should display */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    ...withNavigationPropTypes,
};

const defaultProps = {
    reports: {},
    policies: {},
    isFirstTimeNewExpensifyUser: false,
};

/**
 * Get the most recently accessed report for the user
 *
 * @param {Object} reports
 * @param {Boolean} [ignoreDefaultRooms]
 * @param {Object} policies
 * @param {Boolean} isFirstTimeNewExpensifyUser
 * @param {Boolean} openOnAdminRoom
 * @returns {Number}
 */
const getLastAccessedReportID = (reports, ignoreDefaultRooms, policies, isFirstTimeNewExpensifyUser, openOnAdminRoom) => {
    // If deeplink url is of an attachment, we should show the report that the attachment comes from.
    const currentRoute = Navigation.getActiveRoute();
    const matches = CONST.REGEX.ATTACHMENT_ROUTE.exec(currentRoute);
    const reportID = lodashGet(matches, 1, null);
    if (reportID) {
        return reportID;
    }

    const lastReport = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies, isFirstTimeNewExpensifyUser, openOnAdminRoom);

    return lodashGet(lastReport, 'reportID');
};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
function ReportScreenWrapper(props) {
    const {canUseDefaultRooms} = usePermissions();

    useEffect(() => {
        // Don't update if there is a reportID in the params already
        if (lodashGet(props.route, 'params.reportID', null)) {
            App.confirmReadyToOpenApp();
            return;
        }

        // If there is no reportID in route, try to find last accessed and use it for setParams
        const reportID = getLastAccessedReportID(
            props.reports,
            !canUseDefaultRooms,
            props.policies,
            props.isFirstTimeNewExpensifyUser,
            lodashGet(props.route, 'params.openOnAdminRoom', false),
        );

        // It's possible that props.reports aren't fully loaded yet
        // in that case the reportID is undefined
        if (reportID) {
            props.navigation.setParams({reportID: String(reportID)});
        } else {
            App.confirmReadyToOpenApp();
        }
    }, [props.route, props.navigation, props.reports, canUseDefaultRooms, props.policies, props.isFirstTimeNewExpensifyUser]);

    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return <ReportScreen route={props.route} />;
}

ReportScreenWrapper.propTypes = propTypes;
ReportScreenWrapper.defaultProps = defaultProps;
ReportScreenWrapper.displayName = 'ReportScreenWrapper';

export default withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    isFirstTimeNewExpensifyUser: {
        key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    },
})(ReportScreenWrapper);
