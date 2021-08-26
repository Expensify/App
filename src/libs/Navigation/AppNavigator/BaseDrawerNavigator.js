import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {View} from 'react-native';
import styles, {getNavigationDrawerStyle, getNavigationDrawerType} from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import {shouldStartWithDrawerClosed} from '../Navigation';

const propTypes = {
    /** Screens to be passed in the Drawer */
    screens: PropTypes.arrayOf(PropTypes.shape({
        /** Name of the Screen */
        name: PropTypes.string.isRequired,

        /** Component for the Screen */
        component: PropTypes.elementType.isRequired,

        /** Optional params to be passed to the Screen */
        // eslint-disable-next-line react/forbid-prop-types
        initialParams: PropTypes.object,
    })).isRequired,

    /** Drawer content Component */
    drawerContent: PropTypes.elementType.isRequired,

    /** If it's the main screen, don't wrap the content even if it's a full screen modal. */
    isMainScreen: PropTypes.bool,

    /** Window Dimensions props */
    ...windowDimensionsPropTypes,
};
const Drawer = createDrawerNavigator();

const BaseDrawerNavigator = (props) => {
    const content = (
        <Drawer.Navigator
            defaultStatus={(props.isSmallScreenWidth && !shouldStartWithDrawerClosed()) ? 'open' : 'closed'}
            sceneContainerStyle={styles.navigationSceneContainer}
            drawerContent={props.drawerContent}
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
BaseDrawerNavigator.displayName = 'BaseDrawerNavigator';
export default withWindowDimensions(BaseDrawerNavigator);
