import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {View} from 'react-native';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';

import Navigation from '../Navigation';

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

const defaultProps = {
    isMainScreen: false,
};

const Drawer = createDrawerNavigator();
class BaseDrawerNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Only get the default status on the mount. Changing this dynamically breaks the navigation.
            defaultStatus: Navigation.getDefaultDrawerState(props.isSmallScreenWidth),
        };
    }

    render() {
        const content = (
            <Drawer.Navigator
                backBehavior="none"
                key={`BaseDrawerNavigator${this.props.isSmallScreenWidth}`}
                defaultStatus={this.state.defaultStatus}
                sceneContainerStyle={styles.navigationSceneContainer}
                drawerContent={this.props.drawerContent}
                screenOptions={{
                    cardStyle: styles.navigationScreenCardStyle,
                    headerShown: false,
                    drawerType: StyleUtils.getNavigationDrawerType(this.props.isSmallScreenWidth),
                    drawerStyle: StyleUtils.getNavigationDrawerStyle(
                        this.props.isSmallScreenWidth,
                    ),
                    swipeEdgeWidth: 500,
                }}
            >
                {_.map(this.props.screens, screen => (
                    <Drawer.Screen
                        key={screen.name}
                        name={screen.name}
                        component={screen.component}
                        initialParams={screen.initialParams}
                    />
                ))}
            </Drawer.Navigator>
        );

        if (!this.props.isMainScreen && !this.props.isSmallScreenWidth) {
            return (
                <View style={styles.navigationSceneFullScreenWrapper}>
                    {content}
                </View>
            );
        }
        return content;
    }
}

BaseDrawerNavigator.propTypes = propTypes;
BaseDrawerNavigator.defaultProps = defaultProps;

export default withWindowDimensions(BaseDrawerNavigator);
