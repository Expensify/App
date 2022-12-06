import _ from 'underscore';
import React from 'react';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';

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
                    getComponent={screen.getComponent}
                    initialParams={screen.initialParams}
                />
            ))}
        </ModalStackNavigator.Navigator>
    );
}

// We use getComponent/require syntax so that file used by screens are not loaded until we need them.
const IOUBillStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const IOUBillPage = require('../../../pages/iou/IOUBillPage').default;
        return IOUBillPage;
    },
    name: 'IOU_Bill_Root',
},
{
    getComponent: () => {
        const IOUCurrencySelection = require('../../../pages/iou/IOUCurrencySelection').default;
        return IOUCurrencySelection;
    },
    name: 'IOU_Bill_Currency',
}]);

const IOURequestModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const IOURequestPage = require('../../../pages/iou/IOURequestPage').default;
        return IOURequestPage;
    },
    name: 'IOU_Request_Root',
},
{
    getComponent: () => {
        const IOUCurrencySelection = require('../../../pages/iou/IOUCurrencySelection').default;
        return IOUCurrencySelection;
    },
    name: 'IOU_Request_Currency',
}]);

const IOUSendModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const IOUSendPage = require('../../../pages/iou/IOUSendPage').default;
        return IOUSendPage;
    },
    name: 'IOU_Send_Root',
},
{
    getComponent: () => {
        const IOUCurrencySelection = require('../../../pages/iou/IOUCurrencySelection').default;
        return IOUCurrencySelection;
    },
    name: 'IOU_Send_Currency',
},
{
    getComponent: () => {
        const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage').default;
        return AddPersonalBankAccountPage;
    },
    name: 'IOU_Send_Add_Bank_Account',
},
{
    getComponent: () => {
        const AddDebitCardPage = require('../../../pages/settings/Payments/AddDebitCardPage').default;
        return AddDebitCardPage;
    },
    name: 'IOU_Send_Add_Debit_Card',
},
{
    getComponent: () => {
        const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage').default;
        return EnablePaymentsPage;
    },
    name: 'IOU_Send_Enable_Payments',
}]);

const IOUDetailsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const IOUDetailsModal = require('../../../pages/iou/IOUDetailsModal').default;
        return IOUDetailsModal;
    },
    name: 'IOU_Details_Root',
},
{
    getComponent: () => {
        const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage').default;
        return AddPersonalBankAccountPage;
    },
    name: 'IOU_Details_Add_Bank_Account',
},
{
    getComponent: () => {
        const AddDebitCardPage = require('../../../pages/settings/Payments/AddDebitCardPage').default;
        return AddDebitCardPage;
    },
    name: 'IOU_Details_Add_Debit_Card',
},
{
    getComponent: () => {
        const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage').default;
        return EnablePaymentsPage;
    },
    name: 'IOU_Details_Enable_Payments',
}]);

const DetailsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const DetailsPage = require('../../../pages/DetailsPage').default;
        return DetailsPage;
    },
    name: 'Details_Root',
}]);

const ReportDetailsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const ReportDetailsPage = require('../../../pages/ReportDetailsPage').default;
        return ReportDetailsPage;
    },
    name: 'Report_Details_Root',
}]);

const ReportSettingsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const ReportSettingsPage = require('../../../pages/ReportSettingsPage').default;
        return ReportSettingsPage;
    },
    name: 'Report_Settings_Root',
}]);

const ReportParticipantsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const ReportParticipantsPage = require('../../../pages/ReportParticipantsPage').default;
            return ReportParticipantsPage;
        },
        name: 'ReportParticipants_Root',
    },
    {
        getComponent: () => {
            const DetailsPage = require('../../../pages/DetailsPage').default;
            return DetailsPage;
        },
        name: 'ReportParticipants_Details',
    },
]);

const SearchModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const SearchPage = require('../../../pages/SearchPage').default;
        return SearchPage;
    },
    name: 'Search_Root',
}]);

const NewGroupModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const NewGroupPage = require('../../../pages/NewGroupPage').default;
        return NewGroupPage;
    },
    name: 'NewGroup_Root',
}]);

const NewChatModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const NewChatPage = require('../../../pages/NewChatPage').default;
        return NewChatPage;
    },
    name: 'NewChat_Root',
}]);

const SettingsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const SettingsInitialPage = require('../../../pages/settings/InitialSettingsPage').default;
            return SettingsInitialPage;
        },
        name: 'Settings_Root',
    },
    {
        getComponent: () => {
            const SettingsWorkspacesPage = require('../../../pages/workspace/WorkspacesListPage').default;
            return SettingsWorkspacesPage;
        },
        name: 'Settings_Workspaces',
    },
    {
        getComponent: () => {
            const SettingsProfilePage = require('../../../pages/settings/Profile/ProfilePage').default;
            return SettingsProfilePage;
        },
        name: 'Settings_Profile',
    },
    {
        getComponent: () => {
            const SettingsPronounsPage = require('../../../pages/settings/Profile/PronounsPage').default;
            return SettingsPronounsPage;
        },
        name: 'Settings_Pronouns',
    },
    {
        getComponent: () => {
            const SettingsDisplayNamePage = require('../../../pages/settings/Profile/DisplayNamePage').default;
            return SettingsDisplayNamePage;
        },
        name: 'Settings_Display_Name',
    },
    {
        getComponent: () => {
            const SettingsTimezoneInitialPage = require('../../../pages/settings/Profile/TimezoneInitialPage').default;
            return SettingsTimezoneInitialPage;
        },
        name: 'Settings_Timezone',
    },
    {
        getComponent: () => {
            const SettingsTimezoneSelectPage = require('../../../pages/settings/Profile/TimezoneSelectPage').default;
            return SettingsTimezoneSelectPage;
        },
        name: 'Settings_Timezone_Select',
    },
    {
        getComponent: () => {
            const SettingsAddSecondaryLoginPage = require('../../../pages/settings/AddSecondaryLoginPage').default;
            return SettingsAddSecondaryLoginPage;
        },
        name: 'Settings_Add_Secondary_Login',
    },
    {
        getComponent: () => {
            const SettingsPreferencesPage = require('../../../pages/settings/PreferencesPage').default;
            return SettingsPreferencesPage;
        },
        name: 'Settings_Preferences',
    },
    {
        getComponent: () => {
            const SettingsPasswordPage = require('../../../pages/settings/PasswordPage').default;
            return SettingsPasswordPage;
        },
        name: 'Settings_Password',
    },
    {
        getComponent: () => {
            const SettingsCloseAccountPage = require('../../../pages/settings/Security/CloseAccountPage').default;
            return SettingsCloseAccountPage;
        },
        name: 'Settings_Close',
    },
    {
        getComponent: () => {
            const SettingsSecurityPage = require('../../../pages/settings/Security/SecuritySettingsPage').default;
            return SettingsSecurityPage;
        },
        name: 'Settings_Security',
    },
    {
        getComponent: () => {
            const SettingsAboutPage = require('../../../pages/settings/AboutPage/AboutPage').default;
            return SettingsAboutPage;
        },
        name: 'Settings_About',
    },
    {
        getComponent: () => {
            const SettingsAppDownloadLinks = require('../../../pages/settings/AppDownloadLinks').default;
            return SettingsAppDownloadLinks;
        },
        name: 'Settings_App_Download_Links',
    },
    {
        getComponent: () => {
            const SettingsPaymentsPage = require('../../../pages/settings/Payments/PaymentsPage').default;
            return SettingsPaymentsPage;
        },
        name: 'Settings_Payments',
    },
    {
        getComponent: () => {
            const TransferBalancePage = require('../../../pages/settings/Payments/TransferBalancePage').default;
            return TransferBalancePage;
        },
        name: 'Settings_Payments_Transfer_Balance',
    },
    {
        getComponent: () => {
            const ChooseTransferAccountPage = require('../../../pages/settings/Payments/ChooseTransferAccountPage').default;
            return ChooseTransferAccountPage;
        },
        name: 'Settings_Payments_Choose_Transfer_Account',
    },
    {
        getComponent: () => {
            const SettingsAddPayPalMePage = require('../../../pages/settings/Payments/AddPayPalMePage').default;
            return SettingsAddPayPalMePage;
        },
        name: 'Settings_Add_Paypal_Me',
    },
    {
        getComponent: () => {
            const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage').default;
            return EnablePaymentsPage;
        },
        name: 'Settings_Payments_EnablePayments',
    },
    {
        getComponent: () => {
            const AddDebitCardPage = require('../../../pages/settings/Payments/AddDebitCardPage').default;
            return AddDebitCardPage;
        },
        name: 'Settings_Add_Debit_Card',
    },
    {
        getComponent: () => {
            const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage').default;
            return AddPersonalBankAccountPage;
        },
        name: 'Settings_Add_Bank_Account',
    },
    {
        getComponent: () => {
            const WorkspaceInitialPage = require('../../../pages/workspace/WorkspaceInitialPage').default;
            return WorkspaceInitialPage;
        },
        name: 'Workspace_Initial',
    },
    {
        getComponent: () => {
            const WorkspaceSettingsPage = require('../../../pages/workspace/WorkspaceSettingsPage').default;
            return WorkspaceSettingsPage;
        },
        name: 'Workspace_Settings',
    },
    {
        getComponent: () => {
            const WorkspaceCardPage = require('../../../pages/workspace/card/WorkspaceCardPage').default;
            return WorkspaceCardPage;
        },
        name: 'Workspace_Card',
    },
    {
        getComponent: () => {
            const WorkspaceReimbursePage = require('../../../pages/workspace/reimburse/WorkspaceReimbursePage').default;
            return WorkspaceReimbursePage;
        },
        name: 'Workspace_Reimburse',
    },
    {
        getComponent: () => {
            const WorkspaceBillsPage = require('../../../pages/workspace/bills/WorkspaceBillsPage').default;
            return WorkspaceBillsPage;
        },
        name: 'Workspace_Bills',
    },
    {
        getComponent: () => {
            const WorkspaceInvoicesPage = require('../../../pages/workspace/invoices/WorkspaceInvoicesPage').default;
            return WorkspaceInvoicesPage;
        },
        name: 'Workspace_Invoices',
    },
    {
        getComponent: () => {
            const WorkspaceTravelPage = require('../../../pages/workspace/travel/WorkspaceTravelPage').default;
            return WorkspaceTravelPage;
        },
        name: 'Workspace_Travel',
    },
    {
        getComponent: () => {
            const WorkspaceMembersPage = require('../../../pages/workspace/WorkspaceMembersPage').default;
            return WorkspaceMembersPage;
        },
        name: 'Workspace_Members',
    },
    {
        getComponent: () => {
            const WorkspaceInvitePage = require('../../../pages/workspace/WorkspaceInvitePage').default;
            return WorkspaceInvitePage;
        },
        name: 'Workspace_Invite',
    },
    {
        getComponent: () => {
            const WorkspaceNewRoomPage = require('../../../pages/workspace/WorkspaceNewRoomPage').default;
            return WorkspaceNewRoomPage;
        },
        name: 'Workspace_NewRoom',
    },
    {
        getComponent: () => {
            const ReimbursementAccountPage = require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default;
            return ReimbursementAccountPage;
        },
        name: 'ReimbursementAccount',
        initialParams: {stepToOpen: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT},
    },
    {
        getComponent: () => {
            const GetAssistancePage = require('../../../pages/GetAssistancePage').default;
            return GetAssistancePage;
        },
        name: 'GetAssistance',
    },
]);

const EnablePaymentsStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage').default;
        return EnablePaymentsPage;
    },
    name: 'EnablePayments_Root',
}]);

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage').default;
        return AddPersonalBankAccountPage;
    },
    name: 'AddPersonalBankAccount_Root',
}]);

const ReimbursementAccountModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const ReimbursementAccountPage = require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default;
        return ReimbursementAccountPage;
    },
    name: 'ReimbursementAccount_Root',
}]);

const RequestCallModalStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const RequestCallPage = require('../../../pages/RequestCallPage').default;
        return RequestCallPage;
    },
    name: 'RequestCall_Root',
}]);

const WalletStatementStackNavigator = createModalStackNavigator([{
    getComponent: () => {
        const WalletStatementPage = require('../../../pages/wallet/WalletStatementPage').default;
        return WalletStatementPage;
    },
    name: 'WalletStatement_Root',
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
    WalletStatementStackNavigator,
};
