import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {withOnyx} from 'react-native-onyx';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import styles, {getNavigationDrawerStyle, getNavigationDrawerType} from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../compose';
import SCREENS from '../../../SCREENS';

// Screens
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import ReportScreen from '../../../pages/home/ReportScreen';
import {findLastAccessedReport} from '../../reportUtils';

const propTypes = {
    // Available reports that would be displayed in this navigator
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    reports: {},
};

const Drawer = createDrawerNavigator();

/**
 * We are decorating findLastAccessedReport so that it caches the first result once the reports load.
 * This will ensure the initialParams are only set once for the ReportScreen.
 */
const getInitialReportScreenParams = _.once((reports) => {
    const last = findLastAccessedReport(reports);

    // Fallback to empty if for some reason reportID cannot be derived - prevents the app from crashing
    const reportID = lodashGet(last, 'reportID', '');
    return {reportID};
});

const MainDrawerNavigator = (props) => {
    // When there are no reports there's no point to render the empty navigator
    if (_.size(props.reports) === 0) {
        return <FullScreenLoadingIndicator visible />;
    }

    /* After the app initializes and reports are available the home navigation is mounted
    * This way routing information is updated (if needed) based on the initial report ID resolved.
    * This is usually needed after login/create account and re-launches */
    return (
        <Drawer.Navigator
            openByDefault
            drawerType={getNavigationDrawerType(props.isSmallScreenWidth)}
            drawerStyle={getNavigationDrawerStyle(
                props.windowWidth,
                props.isSmallScreenWidth,
            )}
            sceneContainerStyle={styles.navigationSceneContainer}
            edgeWidth={500}
            drawerContent={() => <SidebarScreen />}
            screenOptions={{
                cardStyle: styles.navigationScreenCardStyle,
                headerShown: false,
            }}
        >
            <Drawer.Screen
                name={SCREENS.REPORT}
                component={ReportScreen}
                initialParams={getInitialReportScreenParams(props.reports)}
            />
        </Drawer.Navigator>
    );
};

MainDrawerNavigator.propTypes = propTypes;
MainDrawerNavigator.defaultProps = defaultProps;
MainDrawerNavigator.displayName = 'MainDrawerNavigator';

export default compose(
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(MainDrawerNavigator);
export {getInitialReportScreenParams};
