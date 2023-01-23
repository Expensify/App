import React, {Component} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';

import ONYXKEYS from '../../../ONYXKEYS';
import SCREENS from '../../../SCREENS';
import Permissions from '../../Permissions';

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
 * @returns {Object}
 */
const getInitialReportScreenParams = (reports, ignoreDefaultRooms, policies) => {
    const last = ReportUtils.findLastAccessedReport(reports, ignoreDefaultRooms, policies);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID: String(reportID)};
};

class MainDrawerNavigator extends Component {
    constructor(props) {
        super(props);
        this.initialParams = getInitialReportScreenParams(props.reports, !Permissions.canUseDefaultRooms(props.betas), props.policies);
    }

    shouldComponentUpdate(nextProps) {
        const initialNextParams = getInitialReportScreenParams(nextProps.reports, !Permissions.canUseDefaultRooms(nextProps.betas), nextProps.policies);
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

    render() {
        return (
            <BaseDrawerNavigator
                drawerContent={({navigation, state}) => {
                    // This state belongs to the drawer so it should always have the ReportScreen as it's initial (and only) route
                    const reportIDFromRoute = lodashGet(state, ['routes', 0, 'params', 'reportID']);
                    return (
                        <SidebarScreen
                            navigation={navigation}
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
