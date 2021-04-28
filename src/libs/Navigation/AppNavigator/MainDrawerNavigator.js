import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {withOnyx} from 'react-native-onyx';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import FullScreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
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

const LoadingScreen = React.memo(() => <FullScreenLoadingIndicator visible />, () => true);

const propTypes = {
    // Initial report to be used if nothing else is specified by routing
    initialReportID: PropTypes.string,

    // Route data passed by react navigation
    route: PropTypes.shape({
        state: PropTypes.shape({
            // A list of mounted screen names
            routeNames: PropTypes.arrayOf(PropTypes.string),
        }),
    }).isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    initialReportID: null,
};

const Drawer = createDrawerNavigator();

/**
 * Derives whether it's time to mount the ReportScreen from current component props
 *
 * @param {String} initialReportID
 * @param {Object} route
 * @returns {boolean}
 */
const shouldMountReportScreen = ({initialReportID, route}) => {
    if (_.isString(initialReportID)) {
        return true;
    }

    // After the ReportScreen is mounted it should stay mounted no matter initial report ID
    return Boolean(route.state) && route.state.routeNames.includes(SCREENS.REPORT);
};

const MainDrawerNavigator = props => (
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
        {
            shouldMountReportScreen(props)
                ? (
                    <Drawer.Screen
                        name={SCREENS.REPORT}
                        component={ReportScreen}
                        initialParams={{reportID: props.initialReportID}}
                    />
                )
                : <Drawer.Screen name={SCREENS.LOADING} component={LoadingScreen} />
        }
    </Drawer.Navigator>
);

MainDrawerNavigator.propTypes = propTypes;
MainDrawerNavigator.defaultProps = defaultProps;
MainDrawerNavigator.displayName = 'MainDrawerNavigator';
export default compose(
    withWindowDimensions,
    withOnyx({
        initialReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(MainDrawerNavigator);
