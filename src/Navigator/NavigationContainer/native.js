import _ from 'underscore';
import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, getStateFromPath} from '@react-navigation/native';
import {navigationRef} from '../index';
import withWindowDimensions from '../../components/withWindowDimensions';
import createWideScreenNavigator from './WideScreenNavigator';
import linkingConfig from './linkingConfig';

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();
const WideScreen = createWideScreenNavigator();
const ModalStack = createStackNavigator();

class ReactNavigationContainer extends Component {
    render() {
        // If we are on a native device, but past the responsive breakpoint then fallback to React Router to provide the
        // best possible UX for that screen width.
        // if (!this.props.isSmallScreenWidth) {
        return (
            <NavigationContainer
                initialState={
                    this.props.initialRoute
                        ? getStateFromPath(this.props.initialRoute, linkingConfig.config)
                        : null
                }
                onStateChange={(state) => {
                    this.props.onStateChange(state);
                }}
                ref={navigationRef}
                linking={linkingConfig}
            >
                <WideScreen.Navigator
                    modalRoutes={this.props.modalRoutes}
                    mainRoutes={this.props.mainRoutes}
                    authenticated={this.props.authenticated}
                    mode="modal"
                >
                    {this.props.authenticated
                        ? (
                            <>
                                <WideScreen.Screen
                                    name={this.props.sidebarRoute.path}
                                    component={this.props.sidebarRoute.Component}
                                    options={{
                                        headerShown: false,
                                        title: 'Expensify.cash',
                                    }}
                                />

                                {/* Main routes */}
                                {_.map(this.props.mainRoutes, route => (
                                    <WideScreen.Screen
                                        name={route.path}
                                        component={route.Component}
                                        key={route.path}
                                        options={{
                                            headerShown: false,
                                            title: route.title || 'Expensify.cash',
                                        }}
                                    />
                                ))}

                                {/* All modal subroutes need to be added here, however they are not ever rendered
                                directly by react-navigation and instead are intercepted by the custom navigator */}
                                {_.map(this.props.modalRoutes, route => (
                                    <WideScreen.Screen
                                        key={route.path}
                                        name={route.path}
                                        options={{
                                            headerShown: false,
                                            title: route.title || 'Expensify.cash',
                                        }}
                                    >
                                        {() => (
                                            <ModalStack.Navigator>
                                                {_.map(route.subRoutes, subRoute => (
                                                    <ModalStack.Screen
                                                        key={subRoute.path}
                                                        name={subRoute.path}
                                                        component={subRoute.Component}
                                                        options={{
                                                            headerShown: false,
                                                            title: route.title || 'Expensify.cash',
                                                        }}
                                                    />
                                                ))}
                                            </ModalStack.Navigator>
                                        )}
                                    </WideScreen.Screen>
                                ))}
                            </>
                        )
                        : (
                            <WideScreen.Screen
                                name={this.props.publicRoute.path}
                                options={this.props.publicRoute.options}
                                component={this.props.publicRoute.Component}
                            />
                        )}
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
