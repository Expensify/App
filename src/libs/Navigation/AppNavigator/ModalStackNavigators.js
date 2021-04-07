import React from 'react';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import styles from '../../../styles/styles';
import ROUTES from '../../../ROUTES';
import NewChatPage from '../../../pages/NewChatPage';
import NewGroupPage from '../../../pages/NewGroupPage';
import SearchPage from '../../../pages/SearchPage';
import DetailsPage from '../../../pages/DetailsPage';
import IOURequestPage from '../../../pages/iou/IOURequestPage';
import IOUBillPage from '../../../pages/iou/IOUBillPage';
import SettingsInitialPage from '../../../pages/settings/InitialPage';
import SettingsProfilePage from '../../../pages/settings/Profile/ProfilePage';
import SettingsPreferencesPage from '../../../pages/settings/PreferencesPage';
import SettingsPasswordPage from '../../../pages/settings/PasswordPage';
import SettingsPaymentsPage from '../../../pages/settings/PaymentsPage';
import SettingsAddSecondaryLoginPage from '../../../pages/settings/AddSecondaryLoginPage';
import ReportParticipantsPage from '../../../pages/ReportParticipantsPage';
import IOUDetailsPage from '../../../pages/iou/IOUDetailsPage';

// Setup the modal stack navigators so we only have to create them once
const SettingsModalStack = createStackNavigator();
const NewChatModalStack = createStackNavigator();
const NewGroupModalStack = createStackNavigator();
const SearchModalStack = createStackNavigator();
const DetailsModalStack = createStackNavigator();
const ReportParticipantsModalStack = createStackNavigator();
const IOURequestModalStack = createStackNavigator();
const IOUBillModalStack = createStackNavigator();
const IOUDetailsModalStack = createStackNavigator();

const defaultSubRouteOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

const IOUBillStackNavigator = () => (
    <IOUBillModalStack.Navigator
        path={ROUTES.IOU_BILL}
        screenOptions={{
            ...defaultSubRouteOptions,
        }}
    >
        <IOUBillModalStack.Screen
            name="IOU_Bill_Root"
            component={IOUBillPage}
            options={{
                title: 'Split',
            }}
        />
    </IOUBillModalStack.Navigator>
);

const IOURequestModalStackNavigator = () => (
    <IOURequestModalStack.Navigator
        path={ROUTES.IOU_REQUEST}
        screenOptions={{
            ...defaultSubRouteOptions,
        }}
    >
        <IOURequestModalStack.Screen
            name="IOU_Request_Root"
            component={IOURequestPage}
            options={{
                title: 'Request',
            }}
        />
    </IOURequestModalStack.Navigator>
);

const IOUDetailsModalStackNavigator = () => (
    <IOUDetailsModalStack.Navigator
        path={ROUTES.IOU_DETAILS}
        screenOptions={{
            ...defaultSubRouteOptions,
        }}
    >
        <IOUDetailsModalStack.Screen
            name="IOU_Details_Route"
            component={IOUDetailsPage}
            options={{
                title: 'Details',
            }}
        />
    </IOUDetailsModalStack.Navigator>
);

const DetailsModalStackNavigator = () => (
    <DetailsModalStack.Navigator
        path={ROUTES.DETAILS}
        screenOptions={{
            ...defaultSubRouteOptions,
        }}
    >
        <DetailsModalStack.Screen
            name="Details_Root"
            component={DetailsPage}
            options={{
                title: 'Details',
            }}
        />
    </DetailsModalStack.Navigator>
);

const ReportParticipantsModalStackNavigator = () => (
    <ReportParticipantsModalStack.Navigator screenOptions={{...defaultSubRouteOptions}}>
        <ReportParticipantsModalStack.Screen
            name="ReportParticipants_Root"
            component={ReportParticipantsPage}
        />
        <ReportParticipantsModalStack.Screen
            name="ReportParticipants_Details"
            component={DetailsPage}
        />
    </ReportParticipantsModalStack.Navigator>
);

const SearchModalStackNavigator = () => (
    <SearchModalStack.Navigator
        path={ROUTES.SEARCH}
        screenOptions={{
            ...defaultSubRouteOptions,
        }}
    >
        <SearchModalStack.Screen
            name="Search_Root"
            component={SearchPage}
            options={{
                title: 'Search',
            }}
        />
    </SearchModalStack.Navigator>
);

const NewGroupModalStackNavigator = () => (
    <NewGroupModalStack.Navigator
        path={ROUTES.NEW_GROUP}
        screenOptions={{
            ...defaultSubRouteOptions,
        }}
    >
        <NewGroupModalStack.Screen
            name="NewGroup_Root"
            component={NewGroupPage}
            options={{
                title: 'New Group',
            }}
        />
    </NewGroupModalStack.Navigator>
);

const NewChatModalStackNavigator = () => (
    <NewChatModalStack.Navigator
        path={ROUTES.NEW_CHAT}
        screenOptions={{
            ...defaultSubRouteOptions,
        }}
    >
        <NewChatModalStack.Screen
            name="NewChat_Root"
            component={NewChatPage}
            options={{
                title: 'New Chat',
            }}
        />
    </NewChatModalStack.Navigator>
);

const SettingsModalStackNavigator = () => (
    <SettingsModalStack.Navigator
        path={ROUTES.SETTINGS}
        screenOptions={{
            ...defaultSubRouteOptions,
            title: 'Settings',
        }}
    >
        <SettingsModalStack.Screen
            name="Settings_Root"
            component={SettingsInitialPage}
        />
        <SettingsModalStack.Screen
            name="Settings_Profile"
            component={SettingsProfilePage}
        />
        <SettingsModalStack.Screen
            name="Settings_Add_Secondary_Login"
            component={SettingsAddSecondaryLoginPage}
        />
        <SettingsModalStack.Screen
            name="Settings_Preferences"
            component={SettingsPreferencesPage}
        />
        <SettingsModalStack.Screen
            name="Settings_Password"
            component={SettingsPasswordPage}
        />
        <SettingsModalStack.Screen
            name="Settings_Payments"
            component={SettingsPaymentsPage}
        />
    </SettingsModalStack.Navigator>
);

export {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    IOUDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
};
