import _ from 'underscore';
import React from 'react';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import styles from '../../../styles/styles';
import NewChatPage from '../../../pages/NewChatPage';
import NewGroupPage from '../../../pages/NewGroupPage';
import SearchPage from '../../../pages/SearchPage';
import DetailsPage from '../../../pages/DetailsPage';
import GetAssistancePage from '../../../pages/GetAssistancePage';
import IOURequestPage from '../../../pages/iou/IOURequestPage';
import IOUBillPage from '../../../pages/iou/IOUBillPage';
import IOUSendPage from '../../../pages/iou/IOUSendPage';
import IOUDetailsModal from '../../../pages/iou/IOUDetailsModal';
import SettingsInitialPage from '../../../pages/settings/InitialSettingsPage';
import SettingsProfilePage from '../../../pages/settings/Profile/ProfilePage';
import SettingsPreferencesPage from '../../../pages/settings/PreferencesPage';
import SettingsAboutPage from '../../../pages/settings/AboutPage';
import SettingsAppDownloadLinks from '../../../pages/settings/AppDownloadLinks';
import SettingsPasswordPage from '../../../pages/settings/PasswordPage';
import SettingsSecurityPage from '../../../pages/settings/Security/SecuritySettingsPage';
import SettingsCloseAccountPage from '../../../pages/settings/Security/CloseAccountPage';
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
import WorkspaceSettingsPage from '../../../pages/workspace/WorkspaceSettingsPage';
import WorkspaceInitialPage from '../../../pages/workspace/WorkspaceInitialPage';
import WorkspaceCardPage from '../../../pages/workspace/card/WorkspaceCardPage';
import WorkspaceReimbursePage from '../../../pages/workspace/reimburse/WorkspaceReimbursePage';
import WorkspaceInvoicesPage from '../../../pages/workspace/invoices/WorkspaceInvoicesPage';
import WorkspaceBillsPage from '../../../pages/workspace/bills/WorkspaceBillsPage';
import WorkspaceTravelPage from '../../../pages/workspace/travel/WorkspaceTravelPage';
import WorkspaceMembersPage from '../../../pages/workspace/WorkspaceMembersPage';
import WorkspaceBankAccountPage from '../../../pages/workspace/WorkspaceBankAccountPage';
import WorkspaceNewRoomPage from '../../../pages/workspace/WorkspaceNewRoomPage';
import CONST from '../../../CONST';
import AddDebitCardPage from '../../../pages/settings/Payments/AddDebitCardPage';
import TransferBalancePage from '../../../pages/settings/Payments/TransferBalancePage';
import ChooseTransferAccountPage from '../../../pages/settings/Payments/ChooseTransferAccountPage';
import ReportSettingsPage from '../../../pages/ReportSettingsPage';

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
            screenOptions={defaultSubRouteOptions}
        >
            {_.map(screens, screen => (
                <ModalStackNavigator.Screen
                    key={screen.name}
                    name={screen.name}
                    component={screen.Component}
                    initialParams={screen.initialParams}
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
},
{
    Component: AddPersonalBankAccountPage,
    name: 'IOU_Send_Add_Bank_Account',
},
{
    Component: AddDebitCardPage,
    name: 'IOU_Send_Add_Debit_Card',
},
{
    Component: EnablePaymentsPage,
    name: 'IOU_Send_Enable_Payments',
}]);

const IOUDetailsModalStackNavigator = createModalStackNavigator([{
    Component: IOUDetailsModal,
    name: 'IOU_Details_Root',
},
{
    Component: AddPersonalBankAccountPage,
    name: 'IOU_Details_Add_Bank_Account',
},
{
    Component: AddDebitCardPage,
    name: 'IOU_Details_Add_Debit_Card',
},
{
    Component: EnablePaymentsPage,
    name: 'IOU_Details_Enable_Payments',
}]);

const DetailsModalStackNavigator = createModalStackNavigator([{
    Component: DetailsPage,
    name: 'Details_Root',
}]);

const ReportDetailsModalStackNavigator = createModalStackNavigator([{
    Component: ReportDetailsPage,
    name: 'Report_Details_Root',
}]);

const ReportSettingsModalStackNavigator = createModalStackNavigator([{
    Component: ReportSettingsPage,
    name: 'Report_Settings_Root',
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
        Component: SettingsCloseAccountPage,
        name: 'Settings_Close',
    },
    {
        Component: SettingsSecurityPage,
        name: 'Settings_Security',
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
        Component: TransferBalancePage,
        name: 'Settings_Payments_Transfer_Balance',
    },
    {
        Component: ChooseTransferAccountPage,
        name: 'Settings_Payments_Choose_Transfer_Account',
    },
    {
        Component: SettingsAddPayPalMePage,
        name: 'Settings_Add_Paypal_Me',
    },
    {
        Component: AddDebitCardPage,
        name: 'Settings_Add_Debit_Card',
    },
    {
        Component: AddPersonalBankAccountPage,
        name: 'Settings_Add_Bank_Account',
    },
    {
        Component: WorkspaceInitialPage,
        name: 'Workspace_Initial',
    },
    {
        Component: WorkspaceSettingsPage,
        name: 'Workspace_Settings',
    },
    {
        Component: WorkspaceCardPage,
        name: 'Workspace_Card',
    },
    {
        Component: WorkspaceReimbursePage,
        name: 'Workspace_Reimburse',
    },
    {
        Component: WorkspaceBillsPage,
        name: 'Workspace_Bills',
    },
    {
        Component: WorkspaceInvoicesPage,
        name: 'Workspace_Invoices',
    },
    {
        Component: WorkspaceTravelPage,
        name: 'Workspace_Travel',
    },
    {
        Component: WorkspaceMembersPage,
        name: 'Workspace_Members',
    },
    {
        Component: WorkspaceBankAccountPage,
        name: 'Workspace_BankAccount',
    },
    {
        Component: WorkspaceInvitePage,
        name: 'Workspace_Invite',
    },
    {
        Component: WorkspaceNewRoomPage,
        name: 'Workspace_NewRoom',
    },
    {
        Component: ReimbursementAccountPage,
        name: 'ReimbursementAccount',
        initialParams: {stepToOpen: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT},
    },
    {
        Component: GetAssistancePage,
        name: 'GetAssistance',
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

const RequestCallModalStackNavigator = createModalStackNavigator([{
    Component: RequestCallPage,
    name: 'RequestCall_Root',
}]);

export {
    IOUBillStackNavigator,
    IOURequestModalStackNavigator,
    IOUSendModalStackNavigator,
    IOUDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ReportDetailsModalStackNavigator,
    ReportSettingsModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    ReimbursementAccountModalStackNavigator,
    RequestCallModalStackNavigator,
};
