import React from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';

import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../../ONYXKEYS';
import SCREENS from '../../../SCREENS';

// Screens
import ReportScreen from '../../../pages/home/ReportScreen';
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import {findLastAccessedReport} from '../../reportUtils';

const propTypes = {
    /** Available reports that would be displayed in this navigator */
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),
};

const defaultProps = {
    reports: {},
};


const getInitialReportScreenParams = (reports) => {
    const last = findLastAccessedReport(reports);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID: String(reportID)};
};

const MainDrawerNavigator = (props) => {
    const initialParams = getInitialReportScreenParams(props.reports);

    // Wait until reports are fetched and there is a reportID in initialParams
    if (!initialParams.reportID) {
        return <FullScreenLoadingIndicator visible />;
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
})(MainDrawerNavigator);
export {getInitialReportScreenParams};
