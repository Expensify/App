import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import Onyx, {withOnyx} from 'react-native-onyx';

import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../../ONYXKEYS';
import SCREENS from '../../../SCREENS';

// Screens
import ReportScreen from '../../../pages/home/ReportScreen';
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import {findLastAccessedReport, findConciergeDMReport} from '../../reportUtils';
import _ from "underscore";
import * as API from "../../API";

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    triggerWelcomeLocation: PropTypes.string,
};

const defaultProps = {
    reports: {},
    triggerWelcomeLocation: '',
};


const getInitialReportScreenParams = (reports, triggerWelcomeLocation) => {
    let report;

    if (triggerWelcomeLocation && !_.isEmpty(reports)) {
        report = findConciergeDMReport(reports);
        // API.TriggerWelcome({location: triggerWelcomeLocation});
        // Onyx.clear(ONYXKEYS.TRIGGER_WELCOME_LOCATION);
    } else {
        report = findLastAccessedReport(reports);
    }

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(report, 'reportID', '');
    return {reportID: String(reportID)};
};

const MainDrawerNavigator = (props) => {
    debugger;
    const initialParams = getInitialReportScreenParams(props.reports, props.triggerWelcomeLocation);

    // Wait until reports are fetched and there is a reportID in initialParams
    if (!initialParams.reportID) {
        return <FullScreenLoadingIndicator visible />;
    }
    console.log(`over here: ${initialParams.reportID}`);

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
    triggerWelcomeLocation: {key: ONYXKEYS.TRIGGER_WELCOME_LOCATION},
})(MainDrawerNavigator);
export {getInitialReportScreenParams};
