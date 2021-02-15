import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';

const RootStack = createStackNavigator();
const Drawer = createDrawerNavigator();

const ResponsiveNavigator = (props) => {
    const AppNavigator = RootStack;
    return (
        <AppNavigator.Navigator
            screenOptions={{
                cardStyle: {height: '100%', backgroundColor: 'transparent'},
                cardOverlayEnabled: true,
            }}
            mode="modal"
        >
            {props.authenticated
                ? (

                    // These are the protected screens and only accessible when an authToken is present.
                    <>
                        <AppNavigator.Screen
                            name="Home"
                            options={{
                                headerShown: false,
                                title: 'Expensify.cash',
                            }}
                        >
                            {() => (
                                <>
                                    <Drawer.Navigator
                                        openByDefault
                                        drawerType={!props.isSmallScreenWidth ? 'permanent' : 'slide'}
                                        drawerStyle={!props.isSmallScreenWidth ? {height: '100%'} : {width: '100%', height: '100%'}}
                                        drawerContent={(drawerProps) => {
                                            const SidebarComponent = props.sidebarRoute.Component;
                                            return (
                                                // eslint-disable-next-line react/jsx-props-no-spreading
                                                <SidebarComponent {...drawerProps} />
                                            );
                                        }}
                                    >
                                        <Drawer.Screen
                                            name="Loading"
                                            component={View}
                                        />
                                        {_.map(props.mainRoutes, route => (
                                            <Drawer.Screen
                                                name={route.name}
                                                component={route.Component}
                                                key={route.name}
                                                options={{
                                                    headerShown: false,
                                                }}
                                            />
                                        ))}
                                    </Drawer.Navigator>
                                </>
                            )}
                        </AppNavigator.Screen>
                        {_.map(props.modalRoutes, (route) => {
                            const ModalStack = props.responsive ? createCustomModalStackNavigator() : createStackNavigator();
                            return (
                                <AppNavigator.Screen
                                    key={route.name}
                                    name={route.name}
                                    options={{
                                        headerShown: false,
                                        cardStyle: {
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: !props.isSmallScreenWidth ? 375 : '100%',
                                            backgroundColor: 'transparent',
                                            height: '100%',
                                        },
                                    }}
                                >
                                    {() => (
                                        <ModalStack.Navigator
                                            modalRoutes={props.modalRoutes}
                                            mainRoutes={props.mainRoutes}
                                            sidebarRoute={props.sidebarRoute}
                                            authenticated={props.authenticated}
                                        >
                                            {_.map(route.subRoutes, subRoute => (
                                                <ModalStack.Screen
                                                    key={subRoute.name}
                                                    name={subRoute.name}
                                                    component={subRoute.Component}
                                                    options={{
                                                        headerShown: false,
                                                    }}
                                                />
                                            ))}
                                        </ModalStack.Navigator>
                                    )}
                                </AppNavigator.Screen>
                            );
                        })}
                    </>
                )
                : (

                    // This is the public route a.k.a. what user's without an authToken will see.
                    <AppNavigator.Screen
                        name={props.publicRoute.name}
                        options={props.publicRoute.options}
                        component={props.publicRoute.Component}
                    />
                )}
        </AppNavigator.Navigator>
    );
};

export default ResponsiveNavigator;
