import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import usePermissions from '@hooks/usePermissions';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as App from '@userActions/App';
import ONYXKEYS from '@src/ONYXKEYS';

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

    /* Navigation functions provided by React Navigation */
    navigation: PropTypes.shape({
        setParams: PropTypes.func.isRequired,
    }).isRequired,
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
 * @param {Boolean} ignoreDefaultRooms
 * @param {Object} policies
 * @param {Boolean} isFirstTimeNewExpensifyUser
 * @param {Boolean} openOnAdminRoom
 * @returns {Number}
 */
const getLastAccessedReportID = (reports, ignoreDefaultRooms, policies, isFirstTimeNewExpensifyUser, openOnAdminRoom) => {
    const lastReport = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies, isFirstTimeNewExpensifyUser, openOnAdminRoom);
    return lodashGet(lastReport, 'reportID');
};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
function ReportScreenIDSetter({route, reports, policies, isFirstTimeNewExpensifyUser, navigation}) {
    const {canUseDefaultRooms} = usePermissions();
    const reportIDIsBeingReplacedInParams = useRef(false);

    useEffect(() => {
        // If the reportID was replaced in the params, then all of the below logic has already ran and this early return will prevent and infinite loop.
        if (reportIDIsBeingReplacedInParams.current) {
            App.confirmReadyToOpenApp();
            return;
        }

        const reportIDFromRoute = lodashGet(route, 'params.reportID', null);
        const reportIsOptimistic = lodashGet(reports, [`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`, 'reportID']) === undefined;

        // If there is no reportID in the route params, find the reportID of the last accessed report and put that reportID in the params
        if (!reportIDFromRoute) {
            reportIDIsBeingReplacedInParams.current = false;
            const reportID = getLastAccessedReportID(reports, !canUseDefaultRooms, policies, isFirstTimeNewExpensifyUser, lodashGet(route, 'params.openOnAdminRoom', false));

            // It's possible that reports aren't fully loaded yet
            // in that case the reportID is undefined
            if (reportID) {
                navigation.setParams({reportID: String(reportID)});
            } else {
                App.confirmReadyToOpenApp();
            }
            return;
        }

        // If there is a reportID in the route params, and it's an actual report (not an optimistic report), then don't do anything and let the app open.
        if (!reportIsOptimistic) {
            reportIDIsBeingReplacedInParams.current = false;
            App.confirmReadyToOpenApp();
            return;
        }

        // When new money requests are being created, the reportID in the route params will point to an optimistic report.
        // In this case, the reportID that is in the params is swapped out with the last accessed reportID. This allows the ReportScreen, which is in the background of the money request creation flow,
        // to display an actual report instead of a "Report not found" page. This is only necessary when the browser is refreshed in the middle of the money request creation flow.
        // The flag reportIDIsBeingReplacedInParams is necessary to prevent this useEffect from being triggered in an infinite loop when navigation.setParams() is called.
        const reportID = getLastAccessedReportID(reports, !canUseDefaultRooms, policies, isFirstTimeNewExpensifyUser, lodashGet(route, 'params.openOnAdminRoom', false));
        reportIDIsBeingReplacedInParams.current = true;
        navigation.setParams({reportID: String(reportID)});
    }, [route, navigation, reports, canUseDefaultRooms, policies, isFirstTimeNewExpensifyUser, reportIDIsBeingReplacedInParams]);

    // The ReportScreen without the reportID set will display a skeleton
    // until the reportID is loaded and set in the route param
    return null;
}

ReportScreenIDSetter.propTypes = propTypes;
ReportScreenIDSetter.defaultProps = defaultProps;
ReportScreenIDSetter.displayName = 'ReportScreenIDSetter';

export default withOnyx({
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
        allowStaleData: true,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
        allowStaleData: true,
    },
    isFirstTimeNewExpensifyUser: {
        key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
        initialValue: false,
    },
})(ReportScreenIDSetter);
