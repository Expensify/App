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
import IOUSendPage from '../../../pages/iou/IOUSendPage';
import IOUDetailsModal from '../../../pages/iou/IOUDetailsModal';
import SettingsInitialPage from '../../../pages/settings/InitialPage';
import SettingsProfilePage from '../../../pages/settings/Profile/ProfilePage';
import SettingsPreferencesPage from '../../../pages/settings/PreferencesPage';
import SettingsAboutPage from '../../../pages/settings/AboutPage';
import SettingsAppDownloadLinks from '../../../pages/settings/AppDownloadLinks';
import SettingsPasswordPage from '../../../pages/settings/PasswordPage';
import SettingsPaymentsPage from '../../../pages/settings/Payments/PaymentsPage';
import SettingsAddPayPalMePage from '../../../pages/settings/Payments/AddPayPalMePage';
import SettingsAddSecondaryLoginPage from '../../../pages/settings/AddSecondaryLoginPage';
import IOUCurrencySelection from '../../../pages/iou/IOUCurrencySelection';
import ReportParticipantsPage from '../../../pages/ReportParticipantsPage';
import EnablePaymentsPage from '../../../pages/EnablePayments';
import AddPersonalBankAccountPage from '../../../pages/AddPersonalBankAccountPage';
import WorkspaceInvitePage from '../../../pages/workspace/WorkspaceInvitePage';
import ReimbursementAccountPage from '../../../pages/ReimbursementAccount/ReimbursementAccountPage';
import RequestCallPage from '../../../pages/RequestCallPage';
import ReportDetailsPage from '../../../pages/ReportDetailsPage';
import WorkspaceEditorPage from '../../../pages/workspace/WorkspaceEditorPage';

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
},
{
    Component: IOUCurrencySelection,
    name: 'IOU_Bill_Currency',
}]);

const IOURequestModalStackNavigator = createModalStackNavigator([{
    Component: IOURequestPage,
    name: 'IOU_Request_Root',
},
{
    Component: IOUCurrencySelection,
    name: 'IOU_Request_Currency',
}]);

const IOUSendModalStackNavigator = createModalStackNavigator([{
    Component: IOUSendPage,
    name: 'IOU_Send_Root',
},
{
    Component: IOUCurrencySelection,
    name: 'IOU_Send_Currency',
}]);

const IOUDetailsModalStackNavigator = createModalStackNavigator([{
    Component: IOUDetailsModal,
    name: 'IOU_Details_Root',
}]);

const DetailsModalStackNavigator = createModalStackNavigator([{
    Component: DetailsPage,
    name: 'Details_Root',
}]);

const ReportDetailsModalStackNavigator = createModalStackNavigator([{
    Component: ReportDetailsPage,
    name: 'Report_Details_Root',
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
        Component: SettingsAboutPage,
        name: 'Settings_About',
    },
    {
        Component: SettingsAppDownloadLinks,
        name: 'Settings_App_Download_Links',
    },
    {
        Component: SettingsPaymentsPage,
        name: 'Settings_Payments',
    },
    {
        Component: SettingsAddPayPalMePage,
        name: 'Settings_Add_Paypal_Me',
    },
]);

const EnablePaymentsStackNavigator = createModalStackNavigator([{
    Component: EnablePaymentsPage,
    name: 'EnablePayments_Root',
}]);

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator([{
    Component: AddPersonalBankAccountPage,
    name: 'AddPersonalBankAccount_Root',
}]);

const ReimbursementAccountModalStackNavigator = createModalStackNavigator([{
    Component: ReimbursementAccountPage,
    name: 'ReimbursementAccount_Root',
}]);

const WorkspaceInviteModalStackNavigator = createModalStackNavigator([{
    Component: WorkspaceInvitePage,
    name: 'WorkspaceInvite_Root',
}]);

const RequestCallModalStackNavigator = createModalStackNavigator([{
    Component: RequestCallPage,
    name: 'RequestCall_Root',
}]);

const WorkspaceEditorNavigator = createModalStackNavigator([{
    Component: WorkspaceEditorPage,
    name: 'WorkspaceEditor_Root',
}]);

export {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    IOUSendModalStackNavigator,
    IOUDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ReportDetailsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    ReimbursementAccountModalStackNavigator,
    WorkspaceInviteModalStackNavigator,
    RequestCallModalStackNavigator,
    WorkspaceEditorNavigator,
};
