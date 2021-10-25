import React from 'react';
import _ from 'underscore';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {View} from 'react-native';
import styles, {getNavigationDrawerStyle, getNavigationDrawerType} from '../../../../styles/styles';
import Navigation from '../../Navigation';
import {propTypes, defaultProps} from './drawerNavigatorPropTypes';

const Drawer = createDrawerNavigator();

const BaseDrawerNavigator = (props) => {
    const content = (
        <Drawer.Navigator
            backBehavior="none"
            defaultStatus={Navigation.getDefaultDrawerState(props.isSmallScreenWidth)}
            sceneContainerStyle={styles.navigationSceneContainer}
            drawerContent={props.drawerContent}
            useLegacyImplementation={props.useLegacyImplementation}
            screenOptions={{
                cardStyle: styles.navigationScreenCardStyle,
                headerShown: false,
                drawerType: getNavigationDrawerType(props.isSmallScreenWidth),
                drawerStyle: getNavigationDrawerStyle(
                    props.isSmallScreenWidth,
                ),
                swipeEdgeWidth: 500,
            }}
        >
            {_.map(props.screens, screen => (
                <Drawer.Screen
                    key={screen.name}
                    name={screen.name}
                    component={screen.component}
                    initialParams={screen.initialParams}
                />
            ))}
        </Drawer.Navigator>
    );

    if (!props.isMainScreen && !props.isSmallScreenWidth) {
        return (
            <View style={styles.navigationSceneFullScreenWrapper}>
                {content}
            </View>
        );
    }

    return content;
};

BaseDrawerNavigator.propTypes = propTypes;
BaseDrawerNavigator.defaultProps = defaultProps;
BaseDrawerNavigator.displayName = 'BaseDrawerNavigator';
export default BaseDrawerNavigator;
