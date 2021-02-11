import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, getStateFromPath} from '@react-navigation/native';
import {navigationRef} from '../index';
import withWindowDimensions from '../../components/withWindowDimensions';
import createWideScreenNavigator from './WideScreenNavigator';
import linkingConfig from './linkingConfig';
import ROUTES from '../../ROUTES';

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();
const WideScreen = createWideScreenNavigator();

class ReactNavigationContainer extends Component {
    render() {
        // If we are on a native device, but past the responsive breakpoint then fallback to React Router to provide the
        // best possible UX for that screen width.
        // if (!this.props.isSmallScreenWidth) {
        return (
            <NavigationContainer
                initialState={getStateFromPath(this.props.initialRoute, linkingConfig.config)}
                onStateChange={(state) => {
                    this.props.onStateChange(state);
                }}
                ref={navigationRef}
                linking={linkingConfig}
            >
                {/* The sidebar is essentialy built into this navigator so we don't provide it here */}
                <WideScreen.Navigator>
                    <WideScreen.Screen
                        name={ROUTES.ROOT}
                        component={View}
                        options={{
                            headerShown: false,
                        }}
                        initialParams={{
                            isRoot: true,
                        }}
                    />
                    {_.map(this.props.mainRoutes, route => (
                        <WideScreen.Screen
                            name={route.path}
                            component={route.Component}
                            key={route.path}
                            options={{
                                headerShown: false,
                            }}
                        />
                    ))}
                </WideScreen.Navigator>
            </NavigationContainer>
        );
        // }

        return (
            <NavigationContainer
                initialState={this.props.initialState}
                onStateChange={this.props.onStateChange}
                ref={navigationRef}
                linking={linkingConfig}
            >
                <RootStack.Navigator
                    mode="modal"
                >
                    {this.props.authenticated
                        ? (

                            // These are the protected screens and only accessible when an authToken is present.
                            <>
                                <RootStack.Screen
                                    name="/"
                                    options={{headerShown: false}}
                                >
                                    {() => (
                                        <MainStack.Navigator>
                                            <MainStack.Screen
                                                name={this.props.sidebarRoute.path}
                                                component={this.props.sidebarRoute.Component}
                                                key={this.props.sidebarRoute.path}
                                                options={{
                                                    headerShown: false,
                                                }}
                                            />
                                            {_.map(this.props.mainRoutes, route => (
                                                <MainStack.Screen
                                                    name={route.path}
                                                    component={route.Component}
                                                    key={route.path}
                                                    options={{
                                                        headerShown: false,
                                                    }}
                                                />
                                            ))}
                                        </MainStack.Navigator>
                                    )}
                                </RootStack.Screen>
                                {_.map(this.props.modalRoutes, route => {
                                    const ModalStack = createStackNavigator();
                                    return (
                                        <RootStack.Screen
                                            key={route.path}
                                            name={route.path}
                                            options={{
                                                headerShown: false,
                                            }}
                                        >
                                            {() => (
                                                <ModalStack.Navigator>
                                                    {_.map(route.subRoutes, subRoute => (
                                                        <ModalStack.Screen
                                                            name={subRoute.path}
                                                            component={subRoute.Component}
                                                            options={{
                                                                // headerShown: false,
                                                            }}
                                                        />
                                                    ))}
                                                </ModalStack.Navigator>
                                            )}
                                        </RootStack.Screen>
                                    );
                                })}
                            </>
                        )
                        : (

                            // This is the public route a.k.a. what user's without an authToken will see.
                            <RootStack.Screen
                                name={this.props.publicRoute.path}
                                options={this.props.publicRoute.options}
                                component={this.props.publicRoute.Component}
                            />
                        )}
                </RootStack.Navigator>
            </NavigationContainer>
        );
    }
}


export default withWindowDimensions(ReactNavigationContainer);
