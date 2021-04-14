import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';

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

const ReportStack = createStackNavigator();

const ReportStackNavigator = () => (
    <ReportStack.Navigator>
        <ReportStack.Screen
            name="Report"
            component={ReportScreen}
            options={{
                cardStyle: styles.navigationScreenCardStyle,
                headerShown: false,
                animationEnabled: true,
            }}
        />
    </ReportStack.Navigator>
);

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
    >
        <Drawer.Screen
            name="ReportStack"
            component={ReportStackNavigator}
        />
    </Drawer.Navigator>
);

MainDrawerNavigator.propTypes = propTypes;
MainDrawerNavigator.displayName = 'MainDrawerNavigator';
export default withWindowDimensions(MainDrawerNavigator);
