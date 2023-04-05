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

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    policies: PropTypes.objectOf(PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** The type of the policy */
        type: PropTypes.string,
    })),

    route: PropTypes.shape({
        params: PropTypes.shape({
            openOnAdminRoom: PropTypes.bool,
            reportID: PropTypes.string,
        }),
    }).isRequired,

    navigation: PropTypes.shape({
        setParams: PropTypes.func,
    }).isRequired,
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
 * @param {Boolean} openOnAdminRoom
 * @returns {Object}
 */
const getLastAccessedReportID = (reports, ignoreDefaultRooms, policies, openOnAdminRoom) => {
    const lastReport = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies, openOnAdminRoom);

    return lodashGet(lastReport, 'reportID');
};

// This wrapper is reponsible for opening the last accessed report if there is no reportID specified in the route params
class ReportScreenWrapper extends Component {
    constructor(props) {
        super(props);

        // If there is no ReportID in route, try to find last accessed and use it for setParams
        if (!lodashGet(this.props.route, 'params.reportID', null)) {
            const reportID = getLastAccessedReportID(
                this.props.reports,
                !Permissions.canUseDefaultRooms(this.props.betas),
                this.props.policies,
                lodashGet(this.props, 'route.params.openOnAdminRoom', false),
            );

            // It's possible that props.reports aren't fully loaded yet
            // in that case the reportID is undefined
            if (reportID) {
                this.props.navigation.setParams({reportID: String(reportID)});
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        // Don't update if there is a reportID in the params already
        if (lodashGet(this.props.route, 'params.reportID', null)) { return false; }

        // If the reports weren't fully loaded in the contructor
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
})(ReportScreenWrapper);
