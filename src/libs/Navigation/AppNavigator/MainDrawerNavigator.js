import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {withOnyx} from 'react-native-onyx';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import {getLastAccessedReport} from '../../reportUtils';
import styles, {
    getNavigationDrawerType,
    getNavigationDrawerStyle,
} from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../compose';
import SCREENS from '../../../SCREENS';

// Screens
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import ReportScreen from '../../../pages/home/ReportScreen';

const propTypes = {
    // Initial report to be used if nothing else is specified by routing
    initialReportID: PropTypes.string,

    // Available reports that would be displayed in this navigator
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    initialReportID: null,
    reports: {},
};

const Drawer = createDrawerNavigator();

const MainDrawerNavigator = (props) => {
    // When there are no reports there's no point to render the empty navigator
    if (_.size(props.reports) === 0) {
        return <FullScreenLoadingIndicator visible />;
    }

    // Use the provided initialReport or fallback to the last accessed
    const initialReportID = props.initialReportID || getLastAccessedReport(props.reports).reportID;

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
                initialParams={{reportID: initialReportID.toString()}}
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
        initialReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(MainDrawerNavigator);
