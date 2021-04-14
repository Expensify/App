import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles, {
    getNavigationDrawerType,
    getNavigationDrawerStyle,
} from '../../../styles/styles';

// Screens
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import ReportScreen from '../../../pages/home/ReportScreen';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const Drawer = createDrawerNavigator();

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
        drawerContent={() => (
            <SidebarScreen />
        )}
    >
        <Drawer.Screen
            name={props.route.params.screen}
            component={ReportScreen}

            // Providing an empty string here will ensure that the ReportScreen does not show as '/r/undefined'
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            initialParams={{reportID: ''}}
            options={{
                cardStyle: styles.navigationScreenCardStyle,
                headerShown: false,
            }}
        />
    </Drawer.Navigator>
);

MainDrawerNavigator.propTypes = propTypes;
MainDrawerNavigator.displayName = 'MainDrawerNavigator';
export default withWindowDimensions(MainDrawerNavigator);
