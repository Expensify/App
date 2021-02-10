import _ from 'underscore';
import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import RouterContainer from './RouterContainer';
import {navigationRef} from '../index';
import withWindowDimensions from '../../components/withWindowDimensions';
import ROUTES from '../../ROUTES';

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

class ReactNavigationContainer extends Component {
    render() {
        // If we are on a native device, but past the responsive breakpoint then fallback to React Router to provide the
        // best possible UX for that screen width.
        if (!this.props.isSmallScreenWidth) {
            // eslint-disable-next-line react/jsx-props-no-spreading
            return <RouterContainer {...this.props} />;
        }

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
                                    name="Main"
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
