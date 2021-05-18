import _ from 'underscore';
import React from 'react';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import styles from '../../../styles/styles';
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
import AddBankAccountPage from '../../../pages/AddBankAccountPage';

const defaultSubRouteOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

/**
 * Create a modal stack navigator with an array of sub-screens.
 *
 * @param {Object[]} screens array of screen config objects
 * @returns {Function}
 */
function createModalStackNavigator(screens) {
    const ModalStackNavigator = createStackNavigator();
    return () => (
        <ModalStackNavigator.Navigator
            screenOptions={{
                ...defaultSubRouteOptions,
            }}
        >
            {_.map(screens, screen => (
                <ModalStackNavigator.Screen
                    key={screen.name}
                    name={screen.name}
                    component={screen.Component}
                />
            ))}
        </ModalStackNavigator.Navigator>
    );
}

const IOUBillStackNavigator = createModalStackNavigator([{
    Component: IOUBillPage,
    name: 'IOU_Bill_Root',
}]);

const IOURequestModalStackNavigator = createModalStackNavigator([{
    Component: IOURequestPage,
    name: 'IOU_Request_Root',
}]);

const DetailsModalStackNavigator = createModalStackNavigator([{
    Component: DetailsPage,
    name: 'Details_Root',
}]);

const ReportParticipantsModalStackNavigator = createModalStackNavigator([
    {
        Component: ReportParticipantsPage,
        name: 'ReportParticipants_Root',
    },
    {
        Component: DetailsPage,
        name: 'ReportParticipants_Details',
    },
]);

const SearchModalStackNavigator = createModalStackNavigator([{
    Component: SearchPage,
    name: 'Search_Root',
}]);

const NewGroupModalStackNavigator = createModalStackNavigator([{
    Component: NewGroupPage,
    name: 'NewGroup_Root',
}]);

const NewChatModalStackNavigator = createModalStackNavigator([{
    Component: NewChatPage,
    name: 'NewChat_Root',
}]);

const SettingsModalStackNavigator = createModalStackNavigator([
    {
        Component: SettingsInitialPage,
        name: 'Settings_Root',
    },
    {
        Component: SettingsProfilePage,
        name: 'Settings_Profile',
    },
    {
        Component: SettingsAddSecondaryLoginPage,
        name: 'Settings_Add_Secondary_Login',
    },
    {
        Component: SettingsPreferencesPage,
        name: 'Settings_Preferences',
    },
    {
        Component: SettingsPasswordPage,
        name: 'Settings_Password',
    },
    {
        Component: SettingsPaymentsPage,
        name: 'Settings_Payments',
    },
]);

const AddBankAccountModalStackNavigator = createModalStackNavigator([{
    Component: AddBankAccountPage,
    name: 'AddBankAccount_Root',
}]);

export {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    DetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
    AddBankAccountModalStackNavigator,
};
