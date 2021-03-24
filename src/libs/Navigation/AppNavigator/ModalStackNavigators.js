import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import styles from '../../../styles/styles';
import ROUTES from '../../../ROUTES';
import NewChatPage from '../../../pages/NewChatPage';
import NewGroupPage from '../../../pages/NewGroupPage';
import SearchPage from '../../../pages/SearchPage';
import DetailsPage from '../../../pages/DetailsPage';
import IOURequestPage from '../../../pages/iou/IOURequestPage';
import IOUBillPage from '../../../pages/iou/IOUBillPage';
import SettingsInitialPage from '../../../pages/settings/InitialPage';
import SettingsProfilePage from '../../../pages/settings/ProfilePage';
import SettingsPreferencesPage from '../../../pages/settings/PreferencesPage';
import SettingsPasswordPage from '../../../pages/settings/PasswordPage';
import SettingsPaymentsPage from '../../../pages/settings/PaymentsPage';

// Setup the modal stack navigators so we only have to create them once
const SettingsModalStack = createStackNavigator();
const NewChatModalStack = createStackNavigator();
const NewGroupModalStack = createStackNavigator();
const SearchModalStack = createStackNavigator();
const DetailsModalStack = createStackNavigator();
const IOURequestModalStack = createStackNavigator();
const IOUBillModalStack = createStackNavigator();

const defaultSubRouteOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
};

const IOUBillStackNavigator = () => (
    <IOUBillModalStack.Navigator
        path={ROUTES.IOU_BILL}
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
);

const IOURequestModalStackNavigator = () => (
    <IOURequestModalStack.Navigator
        path={ROUTES.IOU_REQUEST}
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
);

const DetailsModalStackNavigator = () => (
    <DetailsModalStack.Navigator
        path={ROUTES.DETAILS}
    >
        <DetailsModalStack.Screen
            name="Details_Root"
            component={DetailsPage}
            options={{
                ...defaultSubRouteOptions,
                title: 'Details',
            }}
        />
    </DetailsModalStack.Navigator>
);

const SearchModalStackNavigator = () => (
    <SearchModalStack.Navigator
        path={ROUTES.SEARCH}
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
);

const NewGroupModalStackNavigator = () => (
    <NewGroupModalStack.Navigator
        path={ROUTES.NEW_GROUP}
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
);

const NewChatModalStackNavigator = () => (
    <NewChatModalStack.Navigator
        path={ROUTES.NEW_CHAT}
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
);

const SettingsModalStackNavigator = () => (
    <SettingsModalStack.Navigator
        path={ROUTES.SETTINGS}
    >
        <SettingsModalStack.Screen
            name="Settings_Root"
            component={SettingsInitialPage}
            options={{
                ...defaultSubRouteOptions,
                title: 'Settings',
            }}
        />
        <SettingsModalStack.Screen
            name="Settings_Profile"
            component={SettingsProfilePage}
            options={{
                ...defaultSubRouteOptions,
                title: 'Settings',
            }}
        />
        <SettingsModalStack.Screen
            name="Settings_Preferences"
            component={SettingsPreferencesPage}
            options={{
                ...defaultSubRouteOptions,
                title: 'Settings',
            }}
        />
        <SettingsModalStack.Screen
            name="Settings_Password"
            component={SettingsPasswordPage}
            options={{
                ...defaultSubRouteOptions,
                title: 'Settings',
            }}
        />
        <SettingsModalStack.Screen
            name="Settings_Payments"
            component={SettingsPaymentsPage}
            options={{
                ...defaultSubRouteOptions,
                title: 'Settings',
            }}
        />
    </SettingsModalStack.Navigator>
);

export {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    DetailsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
};
