import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';

import ONYXKEYS from '../../../ONYXKEYS';
import Permissions from '../../Permissions';

// Screens
import ReportScreen from '../../../pages/home/ReportScreen';
import * as ReportUtils from '../../ReportUtils';
import reportPropTypes from '../../../pages/reportPropTypes';
import getReportIDFromRoute from './getReportIDFromRoute';
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
        if (!getReportIDFromRoute(props.route)) {
            const reportID = getLastAccessedReportID(
                props.reports,
                !Permissions.canUseDefaultRooms(props.betas),
                props.policies,
                lodashGet(props, 'route.params.openOnAdminRoom', false),
            );

            if (reportID) {
                props.navigation.setParams({reportID: String(reportID)});
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        // Rerender if the route param raportID is different than the previos one.
        // It should only happen when we got raportID undefined and we want to fill it with the last accessed raportID
        if (getReportIDFromRoute(nextProps.route) !== getReportIDFromRoute(this.props.route)) { return true; }
        return false;
    }

    render() {
        // Wait until there is reportID in the route params
        if (getReportIDFromRoute(this.props.route)) {
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
