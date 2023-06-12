import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';

import ONYXKEYS from '../../../ONYXKEYS';
import Permissions from '../../Permissions';

import ReportScreen from '../../../pages/home/ReportScreen';
import * as ReportUtils from '../../ReportUtils';
import reportPropTypes from '../../../pages/reportPropTypes';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import {withNavigationPropTypes} from '../../../components/withNavigation';
import * as App from '../../actions/App';
import * as Report from '../../actions/Report';
import * as Session from '../../actions/Session';

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The policy name */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,
        }),
    ),

    /** The report ID of the last opened public room as anonymous user */
    lastOpenedPublicRoomID: PropTypes.string,

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
    betas: [],
    policies: {},
    isFirstTimeNewExpensifyUser: false,
    lastOpenedPublicRoomID: null,
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
    const lastReport = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies, isFirstTimeNewExpensifyUser, openOnAdminRoom);

    return lodashGet(lastReport, 'reportID');
};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
class ReportScreenWrapper extends Component {
    constructor(props) {
        super(props);

        // If there is no reportID in route, try to find last accessed and use it for setParams
        if (!lodashGet(this.props.route, 'params.reportID', null)) {
            const reportID = getLastAccessedReportID(
                this.props.reports,
                !Permissions.canUseDefaultRooms(this.props.betas),
                this.props.policies,
                this.props.isFirstTimeNewExpensifyUser,
                this.props.route.params.openOnAdminRoom,
            );

            // It's possible that props.reports aren't fully loaded yet
            // in that case the reportID is undefined
            if (reportID) {
                this.props.navigation.setParams({reportID: String(reportID)});
            } else {
                App.confirmReadyToOpenApp();
            }
        }
    }

    componentDidMount() {
        if (!this.props.lastOpenedPublicRoomID || Session.isAnonymousUser()) {
            return;
        }
        // Re-open the last opened public room if the user logged in
        Report.setLastOpenedPublicRoom('');
        Report.openReport(this.props.lastOpenedPublicRoomID);
    }

    shouldComponentUpdate(nextProps) {
        // Don't update if there is a reportID in the params already
        if (lodashGet(this.props.route, 'params.reportID', null)) {
            App.confirmReadyToOpenApp();
            return false;
        }

        // If the reports weren't fully loaded in the constructor,
        // try to get and set reportID again
        const reportID = getLastAccessedReportID(
            nextProps.reports,
            !Permissions.canUseDefaultRooms(nextProps.betas),
            nextProps.policies,
            lodashGet(nextProps, 'route.params.openOnAdminRoom', false),
        );

        if (reportID) {
            this.props.navigation.setParams({reportID: String(reportID)});
            return true;
        }
        return false;
    }

    render() {
        // Wait until there is reportID in the route params
        if (lodashGet(this.props.route, 'params.reportID', null)) {
            return <ReportScreen route={this.props.route} />;
        }

        return <FullScreenLoadingIndicator initialParams={this.props.route.params} />;
    }
}

ReportScreenWrapper.propTypes = propTypes;
ReportScreenWrapper.defaultProps = defaultProps;
ReportScreenWrapper.displayName = 'ReportScreenWrapper';

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
    isFirstTimeNewExpensifyUser: {
        key: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    },
    lastOpenedPublicRoomID: {
        key: ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID,
    },
})(ReportScreenWrapper);
