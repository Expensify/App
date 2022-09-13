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

const IOUBillStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const IOUBillPage = require('../../../pages/iou/IOUBillPage');
        return IOUBillPage;
    },
    name: 'IOU_Bill_Root',
},
{
    getComponent: () => { 
        const IOUCurrencySelection = require('../../../pages/iou/IOUCurrencySelection');
        return IOUCurrencySelection;
    },
    name: 'IOU_Bill_Currency',
}]);

const IOURequestModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const IOURequestPage = require('../../../pages/iou/IOURequestPage');
        return IOURequestPage;
    },
    name: 'IOU_Request_Root',
},
{
    getComponent: () => { 
        const IOUCurrencySelection = require('../../../pages/iou/IOUCurrencySelection');
        return IOUCurrencySelection;
    },
    name: 'IOU_Request_Currency',
}]);

const IOUSendModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const IOUSendPage = require('../../../pages/iou/IOUSendPage');
        return IOUSendPage;
    },
    name: 'IOU_Send_Root',
},
{
    getComponent: () => { 
        const IOUCurrencySelection = require('../../../pages/iou/IOUCurrencySelection');
        return IOUCurrencySelection;
    },
    name: 'IOU_Send_Currency',
},
{
    getComponent: () => { 
        const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage');
        return AddPersonalBankAccountPage;
    },
    name: 'IOU_Send_Add_Bank_Account',
},
{
    getComponent: () => { 
        const AddDebitCardPage = require('../../../pages/settings/Payments/AddDebitCardPage');
        return AddDebitCardPage;
    },
    name: 'IOU_Send_Add_Debit_Card',
},
{
    getComponent: () => { 
        const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage');
        return EnablePaymentsPage;
    },
    name: 'IOU_Send_Enable_Payments',
}]);

const IOUDetailsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const IOUDetailsModal = require('../../../pages/iou/IOUDetailsModal');
        return IOUDetailsModal;
    },
    name: 'IOU_Details_Root',
},
{
    getComponent: () => { 
        const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage');
        return AddPersonalBankAccountPage;
    },
    name: 'IOU_Details_Add_Bank_Account',
},
{
    getComponent: () => { 
        const AddDebitCardPage = require('../../../pages/settings/Payments/AddDebitCardPage');
        return AddDebitCardPage;
    },
    name: 'IOU_Details_Add_Debit_Card',
},
{
    getComponent: () => { 
        const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage');
        return EnablePaymentsPage;
    },
    name: 'IOU_Details_Enable_Payments',
}]);

const DetailsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const DetailsPage = require('../../../pages/DetailsPage');
        return DetailsPage;
    },
    name: 'Details_Root',
}]);

const ReportDetailsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const ReportDetailsPage = require('../../../pages/ReportDetailsPage');
        return ReportDetailsPage;
    },
    name: 'Report_Details_Root',
}]);

const ReportSettingsModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const ReportSettingsPage = require('../../../pages/ReportSettingsPage');
        return ReportSettingsPage;
    },
    name: 'Report_Settings_Root',
}]);

const ReportParticipantsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => { 
            const ReportParticipantsPage = require('../../../pages/ReportParticipantsPage');
            return ReportParticipantsPage;
        },
        name: 'ReportParticipants_Root',
    },
    {
        getComponent: () => { 
            const DetailsPage = require('../../../pages/DetailsPage');
            return DetailsPage;
        },
        name: 'ReportParticipants_Details',
    },
]);

const SearchModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const SearchPage = require('../../../pages/SearchPage');
        return SearchPage;
    },
    name: 'Search_Root',
}]);

const NewGroupModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const NewGroupPage = require('../../../pages/NewGroupPage');
        return NewGroupPage;
    },
    name: 'NewGroup_Root',
}]);

const NewChatModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const NewChatPage = require('../../../pages/NewChatPage');
        return NewChatPage;
    },
    name: 'NewChat_Root',
}]);

const SettingsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => { 
            const SettingsInitialPage = require('../../../pages/settings/InitialSettingsPage');
            return SettingsInitialPage;
        },
        name: 'Settings_Root',
    },
    {
        getComponent: () => { 
            const SettingsProfilePage = require('../../../pages/settings/Profile/ProfilePage');
            return SettingsProfilePage;
        },
        name: 'Settings_Profile',
    },
    {
        getComponent: () => { 
            const SettingsAddSecondaryLoginPage = require('../../../pages/settings/AddSecondaryLoginPage');
            return SettingsAddSecondaryLoginPage;
        },
        name: 'Settings_Add_Secondary_Login',
    },
    {
        getComponent: () => { 
            const SettingsPreferencesPage = require('../../../pages/settings/PreferencesPage');
            return SettingsPreferencesPage;
        },
        name: 'Settings_Preferences',
    },
    {
        getComponent: () => { 
            const SettingsPasswordPage = require('../../../pages/settings/PasswordPage');
            return SettingsPasswordPage;
        },
        name: 'Settings_Password',
    },
    {
        getComponent: () => { 
            const SettingsCloseAccountPage = require('../../../pages/settings/Security/CloseAccountPage');
            return SettingsCloseAccountPage;
        },
        name: 'Settings_Close',
    },
    {
        getComponent: () => { 
            const SettingsSecurityPage = require('../../../pages/settings/Security/SecuritySettingsPage');
            return SettingsSecurityPage;
        },
        name: 'Settings_Security',
    },
    {
        getComponent: () => { 
            const SettingsAboutPage = require('../../../pages/settings/AboutPage/AboutPage');
            return SettingsAboutPage;
        },
        name: 'Settings_About',
    },
    {
        getComponent: () => { 
            const SettingsAppDownloadLinks = require('../../../pages/settings/AppDownloadLinks');
            return SettingsAppDownloadLinks;
        },
        name: 'Settings_App_Download_Links',
    },
    {
        getComponent: () => { 
            const SettingsPaymentsPage = require('../../../pages/settings/Payments/PaymentsPage');
            return SettingsPaymentsPage;
        },
        name: 'Settings_Payments',
    },
    {
        getComponent: () => { 
            const TransferBalancePage = require('../../../pages/settings/Payments/TransferBalancePage');
            return TransferBalancePage;
        },
        name: 'Settings_Payments_Transfer_Balance',
    },
    {
        getComponent: () => { 
            const ChooseTransferAccountPage = require('../../../pages/settings/Payments/ChooseTransferAccountPage');
            return ChooseTransferAccountPage;
        },
        name: 'Settings_Payments_Choose_Transfer_Account',
    },
    {
        getComponent: () => { 
            const SettingsAddPayPalMePage = require('../../../pages/settings/Payments/AddPayPalMePage');
            return SettingsAddPayPalMePage;
        },
        name: 'Settings_Add_Paypal_Me',
    },
    {
        getComponent: () => { 
            const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage');
            return EnablePaymentsPage;
        },
        name: 'Settings_Payments_EnablePayments',
    },
    {
        getComponent: () => { 
            const AddDebitCardPage = require('../../../pages/settings/Payments/AddDebitCardPage');
            return AddDebitCardPage;
        },
        name: 'Settings_Add_Debit_Card',
    },
    {
        getComponent: () => { 
            const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage');
            return AddPersonalBankAccountPage;
        },
        name: 'Settings_Add_Bank_Account',
    },
    {
        getComponent: () => { 
            const WorkspaceInitialPage = require('../../../pages/workspace/WorkspaceInitialPage');
            return WorkspaceInitialPage;
        },
        name: 'Workspace_Initial',
    },
    {
        getComponent: () => { 
            const WorkspaceSettingsPage = require('../../../pages/workspace/WorkspaceSettingsPage');
            return WorkspaceSettingsPage;
        },
        name: 'Workspace_Settings',
    },
    {
        getComponent: () => { 
            const WorkspaceCardPage = require('../../../pages/workspace/card/WorkspaceCardPage');
            return WorkspaceCardPage;
        },
        name: 'Workspace_Card',
    },
    {
        getComponent: () => { 
            const WorkspaceReimbursePage = require('../../../pages/workspace/reimburse/WorkspaceReimbursePage');
            return WorkspaceReimbursePage;
        },
        name: 'Workspace_Reimburse',
    },
    {
        getComponent: () => { 
            const WorkspaceBillsPage = require('../../../pages/workspace/bills/WorkspaceBillsPage');
            return WorkspaceBillsPage;
        },
        name: 'Workspace_Bills',
    },
    {
        getComponent: () => { 
            const WorkspaceInvoicesPage = require('../../../pages/workspace/invoices/WorkspaceInvoicesPage');
            return WorkspaceInvoicesPage;
        },
        name: 'Workspace_Invoices',
    },
    {
        getComponent: () => { 
            const WorkspaceTravelPage = require('../../../pages/workspace/travel/WorkspaceTravelPage');
            return WorkspaceTravelPage;
        },
        name: 'Workspace_Travel',
    },
    {
        getComponent: () => { 
            const WorkspaceMembersPage = require('../../../pages/workspace/WorkspaceMembersPage');
            return WorkspaceMembersPage;
        },
        name: 'Workspace_Members',
    },
    {
        getComponent: () => { 
            const WorkspaceBankAccountPage = require('../../../pages/workspace/WorkspaceBankAccountPage');
            return WorkspaceBankAccountPage;
        },
        name: 'Workspace_BankAccount',
    },
    {
        getComponent: () => { 
            const WorkspaceInvitePage = require('../../../pages/workspace/WorkspaceInvitePage');
            return WorkspaceInvitePage;
        },
        name: 'Workspace_Invite',
    },
    {
        getComponent: () => { 
            const WorkspaceNewRoomPage = require('../../../pages/workspace/WorkspaceNewRoomPage');
            return WorkspaceNewRoomPage;
        },
        name: 'Workspace_NewRoom',
    },
    {
        getComponent: () => { 
            const ReimbursementAccountPage = require('../../../pages/ReimbursementAccount/ReimbursementAccountPage');
            return ReimbursementAccountPage;
        },
        name: 'ReimbursementAccount',
        initialParams: {stepToOpen: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT},
    },
    {
        getComponent: () => { 
            const GetAssistancePage = require('../../../pages/GetAssistancePage');
            return GetAssistancePage;
        },
        name: 'GetAssistance',
    },
]);

const EnablePaymentsStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage');
        return EnablePaymentsPage;
    },
    name: 'EnablePayments_Root',
}]);

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage');
        return AddPersonalBankAccountPage;
    },
    name: 'AddPersonalBankAccount_Root',
}]);

const ReimbursementAccountModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const ReimbursementAccountPage = require('../../../pages/ReimbursementAccount/ReimbursementAccountPage');
        return ReimbursementAccountPage;
    },
    name: 'ReimbursementAccount_Root',
}]);

const RequestCallModalStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const RequestCallPage = require('../../../pages/RequestCallPage');
        return RequestCallPage;
    },
    name: 'RequestCall_Root',
}]);

const WalletStatementStackNavigator = createModalStackNavigator([{
    getComponent: () => { 
        const WalletStatementPage = require('../../../pages/wallet/WalletStatementPage');
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
