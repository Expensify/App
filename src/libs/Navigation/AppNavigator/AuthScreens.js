import React from 'react';
import {View} from 'react-native';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import createCustomModalStackNavigator from './createCustomModalStackNavigator';
import AppWrapper from '../../../pages/home/AppWrapper';
import styles, {
    getNavigationDrawerType,
    getNavigationDrawerStyle,
    getNavigationModalCardStyle,
} from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

// Screens
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import SettingsPage from '../../../pages/SettingsPage';
import ReportScreen from '../../../pages/home/ReportScreen';
import NewChatPage from '../../../pages/NewChatPage';
import NewGroupPage from '../../../pages/NewGroupPage';
import SearchPage from '../../../pages/SearchPage';
import ProfilePage from '../../../pages/ProfilePage';

const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator();

const defaultSubRouteOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
};
const propTypes = {
    ...windowDimensionsPropTypes,
};

const AuthScreens = (props) => {
    const modalScreenOptions = {
        headerShown: false,
        cardStyle: getNavigationModalCardStyle(props.isSmallScreenWidth),
        gestureDirection: 'horizontal',
    };

    if (props.isSmallScreenWidth) {
        modalScreenOptions.cardStyleInterpolator = CardStyleInterpolators.forScaleFromCenterAndroid;
    }

    const SettingsModalStack = props.responsive
        ? createCustomModalStackNavigator()
        : createStackNavigator();

    const NewChatModalStack = props.responsive
        ? createCustomModalStackNavigator()
        : createStackNavigator();

    const NewGroupModalStack = props.responsive
        ? createCustomModalStackNavigator()
        : createStackNavigator();

    const SearchModalStack = props.responsive
        ? createCustomModalStackNavigator()
        : createStackNavigator();

    const ProfileModalStack = props.responsive
        ? createCustomModalStackNavigator()
        : createStackNavigator();

    return (
        <RootStack.Navigator
            mode="modal"
        >
            <RootStack.Screen
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
                            drawerContent={() => (
                                <SidebarScreen />
                            )}
                        >
                            <Drawer.Screen
                                name="Loading"
                                options={{
                                    cardStyle: styles.navigationScreenCardStyle,
                                    headerShown: false,
                                }}
                            >
                                {() => (props.isSmallScreenWidth ? <View /> : <ReportScreen />)}
                            </Drawer.Screen>
                            <Drawer.Screen
                                name="Report"
                                component={ReportScreen}
                                options={{
                                    cardStyle: styles.navigationScreenCardStyle,
                                    headerShown: false,
                                }}
                            />
                        </Drawer.Navigator>
                    </AppWrapper>
                )}
            </RootStack.Screen>

            {/* These are the various modal routes */}
            <RootStack.Screen
                name="Settings"
                options={modalScreenOptions}
            >
                {() => (
                    <SettingsModalStack.Navigator
                        path="/settings"
                    >
                        <SettingsModalStack.Screen
                            name="Settings_Root"
                            component={SettingsPage}
                            options={{
                                ...defaultSubRouteOptions,
                                title: 'Settings',
                            }}
                        />
                    </SettingsModalStack.Navigator>
                )}
            </RootStack.Screen>

            <RootStack.Screen
                name="NewChat"
                options={modalScreenOptions}
            >
                {() => (
                    <NewChatModalStack.Navigator
                        path="/new/chat"
                    >
                        <NewChatModalStack.Screen
                            name="NewChat_Root"
                            component={NewChatPage}
                            options={{
                                ...defaultSubRouteOptions,
                                title: 'New Chat',
                            }}
                        />
                    </NewChatModalStack.Navigator>
                )}
            </RootStack.Screen>

            <RootStack.Screen
                name="NewGroup"
                options={modalScreenOptions}
            >
                {() => (
                    <NewGroupModalStack.Navigator
                        path="/new/group"
                    >
                        <NewGroupModalStack.Screen
                            name="NewGroup_Root"
                            component={NewGroupPage}
                            options={{
                                ...defaultSubRouteOptions,
                                title: 'New Group',
                            }}
                        />
                    </NewGroupModalStack.Navigator>
                )}
            </RootStack.Screen>

            <RootStack.Screen
                name="Search"
                options={modalScreenOptions}
            >
                {() => (
                    <SearchModalStack.Navigator
                        path="/search"
                    >
                        <SearchModalStack.Screen
                            name="Search_Root"
                            component={SearchPage}
                            options={{
                                ...defaultSubRouteOptions,
                                title: 'Search',
                            }}
                        />
                    </SearchModalStack.Navigator>
                )}
            </RootStack.Screen>

            <RootStack.Screen
                name="Profile"
                options={modalScreenOptions}
            >
                {() => (
                    <ProfileModalStack.Navigator
                        path="/profile"
                    >
                        <ProfileModalStack.Screen
                            name="Profile_Root"
                            component={ProfilePage}
                            options={{
                                ...defaultSubRouteOptions,
                                title: 'Profile',
                            }}
                        />
                    </ProfileModalStack.Navigator>
                )}
            </RootStack.Screen>
        </RootStack.Navigator>
    );
};

AuthScreens.propTypes = propTypes;
export default withWindowDimensions(AuthScreens);
