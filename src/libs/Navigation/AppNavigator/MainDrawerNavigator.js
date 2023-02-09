import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';

import ONYXKEYS from '../../../ONYXKEYS';
import SCREENS from '../../../SCREENS';
import Permissions from '../../Permissions';
import Timing from '../../actions/Timing';
import CONST from '../../../CONST';

// Screens
import ReportScreen from '../../../pages/home/ReportScreen';
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import * as ReportUtils from '../../ReportUtils';
import reportPropTypes from '../../../pages/reportPropTypes';
import Navigation from '../Navigation';
import {withNavigationPropTypes} from '../../../components/withNavigation';

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
        }),
    }).isRequired,

    ...withNavigationPropTypes,
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
const getInitialReportScreenParams = (reports, ignoreDefaultRooms, policies, openOnAdminRoom) => {
    const last = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies, openOnAdminRoom);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID: String(reportID)};
};

class MainDrawerNavigator extends Component {
    constructor(props) {
        super(props);
        this.trackAppStartTiming = this.trackAppStartTiming.bind(this);
        this.initialParams = getInitialReportScreenParams(
            props.reports,
            !Permissions.canUseDefaultRooms(props.betas),
            props.policies,
            lodashGet(props, 'route.params.openOnAdminRoom', false),
        );

        // When we have chat reports the moment this component got created
        // we know that the data was served from storage/cache
        this.isFromCache = _.size(props.reports) > 0;
    }

    shouldComponentUpdate(nextProps) {
        const initialNextParams = getInitialReportScreenParams(
            nextProps.reports,
            !Permissions.canUseDefaultRooms(nextProps.betas),
            nextProps.policies,
            lodashGet(nextProps, 'route.params.openOnAdminRoom', false),
        );
        if (this.initialParams.reportID === initialNextParams.reportID) {
            return false;
        }

        if (!this.initialParams.reportID) {
            const state = this.props.navigation.getState();
            const reportScreenKey = lodashGet(state, 'routes[0].state.routes[0].key', '');
            Navigation.setParams(initialNextParams, reportScreenKey);
        }
        this.initialParams = initialNextParams;
        return true;
    }

    trackAppStartTiming() {
        // We only want to report timing events when rendering from cached data
        if (!this.isFromCache) {
            return;
        }

        Timing.end(CONST.TIMING.SIDEBAR_LOADED);
    }

    render() {
        return (
            <BaseDrawerNavigator
                drawerContent={({navigation, state}) => {
                    // This state belongs to the drawer so it should always have the ReportScreen as it's initial (and only) route
                    const reportIDFromRoute = lodashGet(state, ['routes', 0, 'params', 'reportID']);
                    return (
                        <SidebarScreen
                            navigation={navigation}
                            onLayout={this.trackAppStartTiming}
                            reportIDFromRoute={reportIDFromRoute}
                        />
                    );
                }}
                screens={[
                    {
                        name: SCREENS.REPORT,
                        component: ReportScreen,
                        initialParams: this.initialParams,
                    },
                ]}
                isMainScreen
            />
        );
    }
}

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
