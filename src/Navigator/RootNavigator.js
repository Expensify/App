// We should still use Onyx as the single source of truth to set a route and we can still use react router for this as
// well. This way the web code does not have to change to drastically and will just be cleaned up a bit. but we will
// move things to a more programattic navigation style.

// If we are on web then we should not need to use react-navigation at all and in fact probably don't want to, but
// instead will use a split pane navigation that essentially have a main view and a side bar view. This will probably
// also be used by iPad

// Mobile web could maybe use react-navigation... so we can still base this on Dimensions

import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import compose from '../libs/compose';
import withWindowDimensions from '../components/withWindowDimensions';
import {navigationRef, routerRef} from './index';
import ONYXKEYS from '../ONYXKEYS';
import {Route, Router} from '../libs/Router';
import getPlatform from '../libs/getPlatform';
import variables from '../styles/variables';

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

class RootNavigator extends Component {
    render() {
        // If we have a small screen width and we're on native we will use react-navigation to render our views
        if (this.props.isSmallScreenWidth && (getPlatform() === 'ios' || getPlatform() === 'android')) {
            return (
                <NavigationContainer
                    ref={navigationRef}
                >
                    <RootStack.Navigator
                        mode="modal"
                    >
                        <RootStack.Screen
                            name="Main"
                            component={() => (
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
                            options={{headerShown: false}}
                        />
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
                {/* App container here is the entire view */}
                <View
                    style={{
                        height: '100%',
                        flexDirection: 'row',
                    }}
                >
                    {/* These views are all non modal views */}
                    {_.map(_.reject(this.props.routes, route => route.isModal), route => (
                        <View
                            style={{
                                width: (route.isRootView && !this.props.isSmallScreenWidth)
                                    ? variables.sideBarWidth
                                    : undefined,
                                flex: (route.isRootView && !this.props.isSmallScreenWidth)
                                    ? undefined
                                    : 1,
                            }}
                        >
                            <Route
                                path={[route.path, ...(route.additionalPaths || [])]}
                                component={route.Component}
                                key={route.path}
                            />
                        </View>
                    ))}

                    {/* These are all modal views */}
                    {_.map(modalViews, ({ModalComponent, path}) => (
                        <ModalComponent key={path} isVisible={this.props.currentRoute === path} />
                    ))}
                </View>
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
    }),
)(RootNavigator);
