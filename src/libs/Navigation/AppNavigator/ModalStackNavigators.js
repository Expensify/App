import React from 'react';

import styles from '../../../styles/styles';
import {
    SettingsModalStack,
    NewChatModalStack,
    NewGroupModalStack,
    SearchModalStack,
    ProfileModalStack,
    IOURequestModalStack,
    IOUBillModalStack,
} from './ModalStacks';
import NewChatPage from '../../../pages/NewChatPage';
import NewGroupPage from '../../../pages/NewGroupPage';
import SearchPage from '../../../pages/SearchPage';
import ProfilePage from '../../../pages/ProfilePage';
import IOURequestPage from '../../../pages/iou/IOURequestPage';
import IOUBillPage from '../../../pages/iou/IOUBillPage';
import SettingsInitialPage from '../../../pages/settings/InitialPage';
import SettingsProfilePage from '../../../pages/settings/ProfilePage';
import SettingsPreferencesPage from '../../../pages/settings/PreferencesPage';
import SettingsPasswordPage from '../../../pages/settings/PasswordPage';
import SettingsPaymentsPage from '../../../pages/settings/PaymentsPage';

const defaultSubRouteOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
};

const IOUBillStackNavigator = () => (
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
);

const IOURequestModalStackNavigator = () => (
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
);

const ProfileModalStackNavigator = () => (
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
);

const SearchModalStackNavigator = () => (
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
);

const NewGroupModalStackNavigator = () => (
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
);

const NewChatModalStackNavigator = () => (
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
);

const SettingsModalStackNavigator = () => (
    <SettingsModalStack.Navigator
        path="/settings"
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
    ProfileModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
};
