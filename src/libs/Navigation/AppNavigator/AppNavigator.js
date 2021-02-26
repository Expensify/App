import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';
import AppWrapper from '../../../pages/home/AppWrapper';
import styles, {
    getNavigationDrawerType,
    getNavigationDrawerStyle,
    getNavigationModalCardStyle,
} from '../../../styles/styles';
import {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import modalRoutesPropTypes from './modalRoutesPropTypes';
import mainRoutesPropTypes from './mainRoutesPropTypes';
import sidebarRoutePropTypes from './sidebarRoutePropTypes';
import publicRoutePropTypes from './publicRoutePropTypes';

const RootStack = createStackNavigator();
const Drawer = createDrawerNavigator();

const propTypes = {
    // If we have an authToken this is true
    authenticated: PropTypes.bool.isRequired,

    // Whem responsive is true we will use a custom navigator for our modals so they present in a custom way when at
    // larger screen widths or on web and desktop platforms. Only native platforms with small screen widths use the
    // react-navigation style modal presentation.
    responsive: PropTypes.bool,

    // Route object that provides the sidebar component we will render in the drawer navigator
    sidebarRoute: sidebarRoutePropTypes.isRequired,

    // The public route is the entry point for the unauthenticated app.
    publicRoute: publicRoutePropTypes.isRequired,

    // The main routes display in the center on wide screens and non modally on small screens. There is only the report
    // screen at the moment.
    mainRoutes: mainRoutesPropTypes.isRequired,

    // Modal routes are presented above the content or in a specified way on larger screen widths
    modalRoutes: modalRoutesPropTypes.isRequired,

    // Whether the drawer should be open on init
    isDrawerOpenByDefault: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    responsive: false,
};

const AppNavigator = (props) => {
    const RootNavigator = RootStack;
    return (
        <RootNavigator.Navigator
            mode="modal"
        >
            {props.authenticated
                ? (

                    // These are the protected screens and only accessible when an authToken is present.
                    <>
                        <RootNavigator.Screen
                            name="Home"
                            options={{
                                headerShown: false,
                                title: 'Expensify.cash',
                            }}
                        >
                            {() => (
                                <AppWrapper>
                                    <Drawer.Navigator
                                        openByDefault={props.isDrawerOpenByDefault}
                                        drawerType={getNavigationDrawerType(props.isSmallScreenWidth)}
                                        drawerStyle={getNavigationDrawerStyle(
                                            props.windowWidth,
                                            props.isSmallScreenWidth,
                                        )}
                                        sceneContainerStyle={styles.navigationSceneContainer}
                                        drawerContent={() => {
                                            const SidebarComponent = props.sidebarRoute.Component;
                                            return (
                                                <SidebarComponent />
                                            );
                                        }}
                                    >
                                        <Drawer.Screen
                                            name="Loading"
                                            options={{
                                                cardStyle: styles.navigationScreenCardStyle,
                                                headerShown: false,
                                            }}
                                        >
                                            {() => {
                                                const ReportScreen = props.mainRoutes[0].Component;
                                                return <ReportScreen />;
                                            }}
                                        </Drawer.Screen>
                                        {_.map(props.mainRoutes, route => (
                                            <Drawer.Screen
                                                name={route.name}
                                                component={route.Component}
                                                key={route.name}
                                                options={{
                                                    cardStyle: styles.navigationScreenCardStyle,
                                                    headerShown: false,
                                                }}
                                            />
                                        ))}
                                    </Drawer.Navigator>
                                </AppWrapper>
                            )}
                        </RootNavigator.Screen>
                        {props.isSmallScreenWidth && _.map(props.mainRoutes, route => (
                            <RootNavigator.Screen
                                name={route.name}
                                component={route.Component}
                                key={route.name}
                                options={{
                                    cardStyle: styles.navigationScreenCardStyle,
                                    headerShown: false,
                                }}
                            />
                        ))}

                        {_.map(props.modalRoutes, (route) => {
                            const ModalStack = props.responsive
                                ? createCustomModalStackNavigator()
                                : createStackNavigator();
                            return (
                                <RootNavigator.Screen
                                    key={route.name}
                                    name={route.name}
                                    options={{
                                        headerShown: false,
                                        cardStyle: getNavigationModalCardStyle(props.isSmallScreenWidth),
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
                                                        cardStyle: styles.navigationScreenCardStyle,
                                                        headerShown: false,
                                                        ...subRoute.options,
                                                    }}
                                                />
                                            ))}
                                        </ModalStack.Navigator>
                                    )}
                                </RootNavigator.Screen>
                            );
                        })}
                    </>
                )
                : (

                    // This is the public route a.k.a. what user's without an authToken will see.
                    <RootNavigator.Screen
                        name={props.publicRoute.name}
                        options={{
                            cardStyle: {
                                overflow: 'visible',
                            },
                            ...props.publicRoute.options,
                        }}
                        component={props.publicRoute.Component}
                    />
                )}
        </RootNavigator.Navigator>
    );
};

AppNavigator.defaultProps = defaultProps;
AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
