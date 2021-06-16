import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {createDrawerNavigator} from '@react-navigation/drawer';
import styles, {getNavigationDrawerStyle, getNavigationDrawerType} from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    screens: PropTypes.arrayOf(PropTypes.object).isRequired,
    drawerContent: PropTypes.elementType.isRequired,

    ...windowDimensionsPropTypes,
};
const Drawer = createDrawerNavigator();

const BaseDrawerNavigator = props => (
    <Drawer.Navigator
        defaultStatus={props.isSmallScreenWidth ? 'open' : 'closed'}
        sceneContainerStyle={styles.navigationSceneContainer}
        drawerContent={props.drawerContent}
        screenOptions={{
            cardStyle: styles.navigationScreenCardStyle,
            headerShown: false,
            drawerType: getNavigationDrawerType(props.isSmallScreenWidth),
            drawerStyle: getNavigationDrawerStyle(
                props.windowWidth,
                props.windowHeight,
                props.isSmallScreenWidth,
            ),
            swipeEdgeWidth: 500,
        }}
    >
        {_.map(props.screens, screen => (
            <Drawer.Screen
                name={screen.name}
                component={screen.component}
                initialParams={screen.initialParams}
            />
        ))}
    </Drawer.Navigator>
);

BaseDrawerNavigator.propTypes = propTypes;
BaseDrawerNavigator.displayName = 'BaseDrawerNavigator';
export default withWindowDimensions(BaseDrawerNavigator);
