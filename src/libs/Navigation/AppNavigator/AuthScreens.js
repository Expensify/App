import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

import styles, {
    getNavigationDrawerType,
    getNavigationDrawerStyle,
    getNavigationModalCardStyle,
} from '../../../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import CONST from '../../../CONST';
import compose from '../../compose';
import {
    subscribeToReportCommentEvents,
    fetchAll as fetchAllReports,
} from '../../actions/Report';
import * as PersonalDetails from '../../actions/PersonalDetails';
import * as Pusher from '../../Pusher/pusher';
import PusherConnectionManager from '../../PusherConnectionManager';
import UnreadIndicatorUpdater from '../../UnreadIndicatorUpdater';
import ROUTES from '../../../ROUTES';
import ONYXKEYS from '../../../ONYXKEYS';
import Timing from '../../actions/Timing';
import NetworkConnection from '../../NetworkConnection';
import CONFIG from '../../../CONFIG';
import {fetchCountryCodeByRequestIP} from '../../actions/GeoLocation';
import KeyboardShortcut from '../../KeyboardShortcut';
import {redirect} from '../../actions/App';
import {getBetas} from '../../actions/User';
import NameValuePair from '../../actions/NameValuePair';

// Screens
import SidebarScreen from '../../../pages/home/sidebar/SidebarScreen';
import SettingsPage from '../../../pages/SettingsPage';
import ReportScreen from '../../../pages/home/ReportScreen';
import NewChatPage from '../../../pages/NewChatPage';
import NewGroupPage from '../../../pages/NewGroupPage';
import SearchPage from '../../../pages/SearchPage';
import ProfilePage from '../../../pages/ProfilePage';
import IOURequestPage from '../../../pages/iou/IOURequestPage';
import IOUBillPage from '../../../pages/iou/IOUBillPage';

import {
    SettingsModalStack,
    NewChatModalStack,
    NewGroupModalStack,
    SearchModalStack,
    ProfileModalStack,
    IOURequestModalStack,
    IOUBillModalStack,
} from './ModalStacks';

const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator();

const defaultSubRouteOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
};

const propTypes = {
    network: PropTypes.shape({isOffline: PropTypes.bool}),
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    network: {isOffline: true},
};

class AuthScreens extends React.Component {
    constructor(props) {
        super(props);

        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
        Timing.start(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);
    }

    componentDidMount() {
        NetworkConnection.listenForReconnect();
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.URL_API_ROOT}api?command=Push_Authenticate`,
        }).then(subscribeToReportCommentEvents);

        // Fetch some data we need on initialization
        NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.PRIORITY_MODE, 'default');
        PersonalDetails.fetch();
        PersonalDetails.fetchTimezone();
        getBetas();
        fetchAllReports(true, true);
        fetchCountryCodeByRequestIP();
        UnreadIndicatorUpdater.listenForReportChanges();

        // Refresh the personal details, timezone and betas every 30 minutes
        // There is no pusher event that sends updated personal details data yet
        // See https://github.com/Expensify/ReactNativeChat/issues/468
        this.interval = setInterval(() => {
            if (this.props.network.isOffline) {
                return;
            }
            PersonalDetails.fetch();
            PersonalDetails.fetchTimezone();
            getBetas();
        }, 1000 * 60 * 30);

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            redirect(ROUTES.SEARCH);
        }, ['meta'], true);
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
        NetworkConnection.stopListeningForReconnect();
        clearInterval(this.interval);
        this.interval = null;
    }

    render() {
        const modalScreenOptions = {
            headerShown: false,
            cardStyle: getNavigationModalCardStyle(this.props.isSmallScreenWidth),
        };

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
                        <Drawer.Navigator
                            openByDefault={this.props.isDrawerOpenByDefault}
                            drawerType={getNavigationDrawerType(this.props.isSmallScreenWidth)}
                            drawerStyle={getNavigationDrawerStyle(
                                this.props.windowWidth,
                                this.props.isSmallScreenWidth,
                            )}
                            sceneContainerStyle={styles.navigationSceneContainer}
                            drawerContent={() => (
                                <SidebarScreen />
                            )}
                        >
                            <Drawer.Screen
                                name="Loading"
                                component={ReportScreen}
                                options={{
                                    cardStyle: styles.navigationScreenCardStyle,
                                    headerShown: false,
                                }}
                            />
                            <Drawer.Screen
                                name="Report"
                                component={ReportScreen}
                                options={{
                                    cardStyle: styles.navigationScreenCardStyle,
                                    headerShown: false,
                                }}
                            />
                        </Drawer.Navigator>
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
                <RootStack.Screen
                    name="IOU_Request"
                    options={modalScreenOptions}
                >
                    {() => (
                        <IOURequestModalStack.Navigator
                            path="/iou/request"
                        >
                            <IOURequestModalStack.Screen
                                name="IOU_Request_Root"
                                component={IOURequestPage}
                                options={{
                                    ...defaultSubRouteOptions,
                                    title: 'Request',
                                }}
                            />
                        </IOURequestModalStack.Navigator>
                    )}
                </RootStack.Screen>
                <RootStack.Screen
                    name="IOU_Bill"
                    options={modalScreenOptions}
                >
                    {() => (
                        <IOUBillModalStack.Navigator
                            path="/iou/split"
                        >
                            <IOUBillModalStack.Screen
                                name="IOU_Bill_Root"
                                component={IOUBillPage}
                                options={{
                                    ...defaultSubRouteOptions,
                                    title: 'Split',
                                }}
                            />
                        </IOUBillModalStack.Navigator>
                    )}
                </RootStack.Screen>
            </RootStack.Navigator>
        );
    }
}

AuthScreens.propTypes = propTypes;
AuthScreens.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withOnyx({
        network: {
            key: ONYXKEYS.NETWORK,
        },
    }),
)(AuthScreens);
