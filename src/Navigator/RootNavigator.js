// We should still use Onyx as the single source of truth to set a route and we can still use react router for this as
// well. This way the web code does not have to change to drastically and will just be cleaned up a bit. but we will
// move things to a more programattic navigation style.

// If we are on web then we should not need to use react-navigation at all and in fact probably don't want to, but
// instead will use a split pane navigation that essentially have a main view and a side bar view. This will probably
// also be used by iPad

// Mobile web could maybe use react-navigation... so we can still base this on Dimensions

import _ from 'underscore';
import React, {Component} from 'react';
import {
    View,
    Animated,
    Keyboard,
} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import compose from '../libs/compose';
import withWindowDimensions from '../components/withWindowDimensions';
import {navigationRef, routerRef} from './index';
import ONYXKEYS from '../ONYXKEYS';
import {Route, Router} from '../libs/Router';
import getPlatform from '../libs/getPlatform';
import ROUTES from '../ROUTES';
import SignInPage from '../pages/signin/SignInPage';
import variables from '../styles/variables';

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();
const linkingConfig = {
    prefixes: ['expensifycash://', 'https://expensify.cash/#'],
    config: {
        screens: {
            [ROUTES.SETTINGS]: '/settings',
        },
    },
};

class RootNavigator extends Component {
    constructor(props) {
        super(props);

        const isCurrentRouteRoot = this.props.currentRoute === ROUTES.ROOT;

        this.state = {
            sidebarAnimation: new Animated.Value(
                isCurrentRouteRoot ? 0 : 1,
            ),
            mainAnimation: new Animated.Value(
                isCurrentRouteRoot ? 1 : 0,
            ),
        };

        window.animateSidebar = this.animateSidebar.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentRoute === this.props.currentRoute) {
            return;
        }

        if (prevProps.currentRoute === ROUTES.ROOT && this.props.currentRoute !== ROUTES.ROOT) {
            this.animateSidebar(false);
        }

        if (prevProps.currentRoute !== ROUTES.ROOT && this.props.currentRoute === ROUTES.ROOT) {
            Keyboard.dismiss();
            this.animateSidebar(true);
        }
    }

    /**
     * Animates the navigationMenu in and out
     *
     * @param {Boolean} didNavigateToRoot
     */
    animateSidebar(didNavigateToRoot) {
        Animated.parallel([
            Animated.timing(this.state.sidebarAnimation, {
                toValue: didNavigateToRoot ? 0 : 1,
                duration: 400,
                useNativeDriver: false,
            }),
            Animated.timing(this.state.mainAnimation, {
                toValue: didNavigateToRoot ? 1 : 0,
                duration: 400,
                useNativeDriver: false,
            }),
        ]).start();
    }

    render() {
        // If we have a small screen width and we're on native we will use react-navigation to render our views
        if (this.props.isSmallScreenWidth && (getPlatform() === 'ios' || getPlatform() === 'android')) {
            return (
                <NavigationContainer
                    ref={navigationRef}
                    linking={linkingConfig}
                >
                    <RootStack.Navigator
                        mode="modal"
                    >
                        {this.props.authenticated
                            ? (
                                <>
                                    <RootStack.Screen
                                        name="Main"
                                        options={{headerShown: false}}
                                    >
                                        {() => (
                                            <MainStack.Navigator>
                                                {_.filter(_.map(this.props.routes, (route) => {
                                                    if (!route.isModal) {
                                                        return (
                                                            <MainStack.Screen
                                                                name={route.path}
                                                                component={route.Component}
                                                                key={route.path}
                                                                options={{
                                                                    headerShown: false,
                                                                }}
                                                            />
                                                        );
                                                    }

                                                    return null;
                                                }))}
                                            </MainStack.Navigator>
                                        )}
                                    </RootStack.Screen>
                                    {_.filter(_.map(this.props.routes, (route) => {
                                        if (route.isModal) {
                                            return (
                                                <RootStack.Screen
                                                    name={route.path}
                                                    component={route.Component}
                                                    key={route.path}
                                                    options={{
                                                        headerShown: false,
                                                    }}
                                                />
                                            );
                                        }

                                        return null;
                                    }))}
                                </>
                            )
                            : (
                                <RootStack.Screen
                                    name="SignIn"
                                    component={SignInPage}
                                    options={{
                                        headerShown: false,
                                        animationTypeForReplace: 'pop',
                                    }}
                                />
                            )}
                    </RootStack.Navigator>
                </NavigationContainer>
            );
        }

        const modalViews = _.filter(this.props.routes, route => (route.isModal));

        // One web and wider screens we will base which route to render on the current route
        return (
            <Router
                ref={routerRef}
            >
                <Route
                    path="*"
                    render={({match}) => {
                        if (match.url === this.props.currentRoute) {
                            return;
                        }

                        Onyx.merge(ONYXKEYS.CURRENT_ROUTE, match.url);
                    }}
                />
                {!this.props.authenticated
                    ? (
                        <SignInPage />
                    )
                    : (
                        <>
                            <Route
                                path="/r/:reportID"
                                render={({match}) => {
                                    if (match.params.reportID === this.props.currentlyViewedReportID) {
                                        return;
                                    }

                                    Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, match.params.reportID);
                                }}
                            />

                            {/* App container here is the entire view */}
                            <View
                                style={{
                                    height: '100%',
                                    width: this.props.windowDimensions.width,
                                    flexDirection: 'row',
                                }}
                            >
                                {/* These views are all non modal views */}
                                {_.map(_.reject(this.props.routes, route => route.isModal), route => (
                                    route.position === 'sidebar'
                                        ? (
                                            <Animated.View
                                                key={route.path}
                                                style={[
                                                    this.props.isSmallScreenWidth
                                                        ? {
                                                            position: 'absolute',
                                                            height: '100%',
                                                            width: this.props.windowDimensions.width,
                                                            transform: [
                                                                {
                                                                    translateX: this.state.sidebarAnimation.interpolate({
                                                                        inputRange: [0, 1],
                                                                        outputRange: [
                                                                            0,
                                                                            -this.props.windowDimensions.width,
                                                                        ],
                                                                    }),
                                                                },
                                                                {
                                                                    scale: this.state.sidebarAnimation.interpolate({
                                                                        inputRange: [0, 1],
                                                                        outputRange: [
                                                                            1, 0.9,
                                                                        ],
                                                                    }),
                                                                },
                                                            ],
                                                            opacity: this.state.sidebarAnimation.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [1, 0],
                                                            }),
                                                        }
                                                        : {
                                                            width: variables.sideBarWidth,
                                                            height: '100%',
                                                        },
                                                ]}
                                            >
                                                <Route
                                                    path={[route.path, ...(route.additionalPaths || [])]}
                                                    component={route.Component}
                                                    key={route.path}
                                                />
                                            </Animated.View>
                                        )
                                        : (
                                            <Route
                                                path={[route.path, ...(route.additionalPaths || [])]}
                                                key={route.path}
                                                render={() => (
                                                    <Animated.View
                                                        key={route.path}
                                                        style={this.props.isSmallScreenWidth
                                                            ? {
                                                                position: 'absolute',
                                                                height: '100%',
                                                                width: this.props.windowDimensions.width,
                                                                transform: [
                                                                    {
                                                                        translateX: this.state.mainAnimation.interpolate({
                                                                            inputRange: [0, 1],
                                                                            outputRange: [
                                                                                0,
                                                                                this.props.windowDimensions.width,
                                                                            ],
                                                                        }),
                                                                    },
                                                                    {
                                                                        scale: this.state.sidebarAnimation.interpolate({
                                                                            inputRange: [0, 1],
                                                                            outputRange: [0.9, 1],
                                                                        }),
                                                                    },
                                                                ],
                                                                opacity: this.state.sidebarAnimation,
                                                            }
                                                            : {
                                                                flex: 1,
                                                            }}
                                                    >
                                                        <route.Component />
                                                    </Animated.View>
                                                )}
                                            />
                                        )
                                ))}

                                {/* These are all modal views */}
                                {_.map(modalViews, ({ModalComponent, path}) => (
                                    <ModalComponent key={path} isVisible={this.props.currentRoute === path} />
                                ))}
                            </View>
                        </>
                    )}
            </Router>
        );
    }
}

export default compose(
    withWindowDimensions,
    withOnyx({
        currentRoute: {
            key: ONYXKEYS.CURRENT_ROUTE,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(RootNavigator);
