import _ from 'underscore';
import React from 'react';
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack';
import styles from '../../../styles/styles';
import SCREENS from '../../../SCREENS';

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
        <ModalStackNavigator.Navigator screenOptions={defaultSubRouteOptions}>
            {_.map(screens, (screen) => (
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
const MoneyRequestModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const MoneyRequestSelectorPage = require('../../../pages/iou/MoneyRequestSelectorPage').default;
            return MoneyRequestSelectorPage;
        },
        name: 'Money_Request',
    },
    {
        getComponent: () => {
            const MoneyRequestEditAmountPage = require('../../../pages/iou/steps/NewRequestAmountPage').default;
            return MoneyRequestEditAmountPage;
        },
        name: 'Money_Request_Amount',
    },
    {
        getComponent: () => {
            const MoneyRequestParticipantsPage = require('../../../pages/iou/steps/MoneyRequstParticipantsPage/MoneyRequestParticipantsPage').default;
            return MoneyRequestParticipantsPage;
        },
        name: 'Money_Request_Participants',
    },
    {
        getComponent: () => {
            const MoneyRequestConfirmPage = require('../../../pages/iou/steps/MoneyRequestConfirmPage').default;
            return MoneyRequestConfirmPage;
        },
        name: 'Money_Request_Confirmation',
    },
    {
        getComponent: () => {
            const IOUCurrencySelection = require('../../../pages/iou/IOUCurrencySelection').default;
            return IOUCurrencySelection;
        },
        name: 'Money_Request_Currency',
    },
    {
        getComponent: () => {
            const MoneyRequestDescriptionPage = require('../../../pages/iou/MoneyRequestDescriptionPage').default;
            return MoneyRequestDescriptionPage;
        },
        name: 'Money_Request_Description',
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
    },
]);

const SplitDetailsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const SplitBillDetailsPage = require('../../../pages/iou/SplitBillDetailsPage').default;
            return SplitBillDetailsPage;
        },
        name: 'SplitDetails_Root',
    },
]);

const DetailsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const DetailsPage = require('../../../pages/DetailsPage').default;
            return DetailsPage;
        },
        name: 'Details_Root',
    },
]);

const ProfileModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const ProfilePage = require('../../../pages/ProfilePage').default;
            return ProfilePage;
        },
        name: 'Profile_Root',
    },
]);

const ReportDetailsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const ReportDetailsPage = require('../../../pages/ReportDetailsPage').default;
            return ReportDetailsPage;
        },
        name: 'Report_Details_Root',
    },
    {
        getComponent: () => {
            const ShareCodePage = require('../../../pages/home/report/ReportDetailsShareCodePage').default;
            return ShareCodePage;
        },
        name: 'Report_Details_Share_Code',
    },
]);

const ReportSettingsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const ReportSettingsPage = require('../../../pages/settings/Report/ReportSettingsPage').default;
            return ReportSettingsPage;
        },
        name: 'Report_Settings_Root',
    },
    {
        getComponent: () => {
            const RoomNamePage = require('../../../pages/settings/Report/RoomNamePage').default;
            return RoomNamePage;
        },
        name: 'Report_Settings_Room_Name',
    },
    {
        getComponent: () => {
            const NotificationPreferencesPage = require('../../../pages/settings/Report/NotificationPreferencePage').default;
            return NotificationPreferencesPage;
        },
        name: 'Report_Settings_Notification_Preferences',
    },
    {
        getComponent: () => {
            const WriteCapabilityPage = require('../../../pages/settings/Report/WriteCapabilityPage').default;
            return WriteCapabilityPage;
        },
        name: 'Report_Settings_Write_Capability',
    },
]);

const TaskModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const TaskTitlePage = require('../../../pages/tasks/TaskTitlePage').default;
            return TaskTitlePage;
        },
        name: 'Task_Title',
    },
    {
        getComponent: () => {
            const TaskDescriptionPage = require('../../../pages/tasks/TaskDescriptionPage').default;
            return TaskDescriptionPage;
        },
        name: 'Task_Description',
    },
    {
        getComponent: () => {
            const TaskAssigneeSelectorPage = require('../../../pages/tasks/TaskAssigneeSelectorModal').default;
            return TaskAssigneeSelectorPage;
        },
        name: 'Task_Assignee',
    },
]);

const ReportWelcomeMessageModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const ReportWelcomeMessagePage = require('../../../pages/ReportWelcomeMessagePage').default;
            return ReportWelcomeMessagePage;
        },
        name: 'Report_WelcomeMessage_Root',
    },
]);

const ReportParticipantsModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const ReportParticipantsPage = require('../../../pages/ReportParticipantsPage').default;
            return ReportParticipantsPage;
        },
        name: 'ReportParticipants_Root',
    },
]);

const SearchModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const SearchPage = require('../../../pages/SearchPage').default;
            return SearchPage;
        },
        name: 'Search_Root',
    },
]);

const NewGroupModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const NewGroupPage = require('../../../pages/NewGroupPage').default;
            return NewGroupPage;
        },
        name: 'NewGroup_Root',
    },
]);

const NewChatModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const NewChatPage = require('../../../pages/NewChatPage').default;
            return NewChatPage;
        },
        name: 'NewChat_Root',
    },
]);

const NewTaskModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const NewTaskPage = require('../../../pages/tasks/NewTaskPage').default;
            return NewTaskPage;
        },
        name: 'NewTask_Root',
    },
    {
        getComponent: () => {
            const NewTaskAssigneeSelectorPage = require('../../../pages/tasks/TaskAssigneeSelectorModal').default;
            return NewTaskAssigneeSelectorPage;
        },
        name: 'NewTask_TaskAssigneeSelector',
    },
    {
        getComponent: () => {
            const NewTaskTaskShareDestinationPage = require('../../../pages/tasks/TaskShareDestinationSelectorModal').default;
            return NewTaskTaskShareDestinationPage;
        },
        name: 'NewTask_TaskShareDestinationSelector',
    },
    {
        getComponent: () => {
            const NewTaskDetailsPage = require('../../../pages/tasks/NewTaskDetailsPage').default;
            return NewTaskDetailsPage;
        },
        name: 'NewTask_Details',
    },
    {
        getComponent: () => {
            const NewTaskTitlePage = require('../../../pages/tasks/NewTaskTitlePage').default;
            return NewTaskTitlePage;
        },
        name: 'NewTask_Title',
    },
    {
        getComponent: () => {
            const NewTaskDescriptionPage = require('../../../pages/tasks/NewTaskDescriptionPage').default;
            return NewTaskDescriptionPage;
        },
        name: 'NewTask_Description',
    },
]);

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
            const ShareCodePage = require('../../../pages/ShareCodePage').default;
            return ShareCodePage;
        },
        name: 'Settings_Share_Code',
    },
    {
        getComponent: () => {
            const SettingsWorkspacesPage = require('../../../pages/workspace/WorkspacesListPage').default;
            return SettingsWorkspacesPage;
        },
        name: SCREENS.SETTINGS.WORKSPACES,
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
            const SettingsPersonalDetailsInitialPage = require('../../../pages/settings/Profile/PersonalDetails/PersonalDetailsInitialPage').default;
            return SettingsPersonalDetailsInitialPage;
        },
        name: 'Settings_PersonalDetails_Initial',
    },
    {
        getComponent: () => {
            const SettingsLegalNamePage = require('../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default;
            return SettingsLegalNamePage;
        },
        name: 'Settings_PersonalDetails_LegalName',
    },
    {
        getComponent: () => {
            const SettingsDateOfBirthPage = require('../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default;
            return SettingsDateOfBirthPage;
        },
        name: 'Settings_PersonalDetails_DateOfBirth',
    },
    {
        getComponent: () => {
            const SettingsAddressPage = require('../../../pages/settings/Profile/PersonalDetails/AddressPage').default;
            return SettingsAddressPage;
        },
        name: 'Settings_PersonalDetails_Address',
    },
    {
        getComponent: () => {
            const SettingsContactMethodsPage = require('../../../pages/settings/Profile/Contacts/ContactMethodsPage').default;
            return SettingsContactMethodsPage;
        },
        name: 'Settings_ContactMethods',
    },
    {
        getComponent: () => {
            const SettingsContactMethodDetailsPage = require('../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default;
            return SettingsContactMethodDetailsPage;
        },
        name: 'Settings_ContactMethodDetails',
    },
    {
        getComponent: () => {
            const SettingsNewContactMethodPage = require('../../../pages/settings/Profile/Contacts/NewContactMethodPage').default;
            return SettingsNewContactMethodPage;
        },
        name: 'Settings_NewContactMethod',
    },
    {
        getComponent: () => {
            const SettingsPreferencesPage = require('../../../pages/settings/Preferences/PreferencesPage').default;
            return SettingsPreferencesPage;
        },
        name: SCREENS.SETTINGS.PREFERENCES,
    },
    {
        getComponent: () => {
            const SettingsPreferencesPriorityModePage = require('../../../pages/settings/Preferences/PriorityModePage').default;
            return SettingsPreferencesPriorityModePage;
        },
        name: 'Settings_Preferences_PriorityMode',
    },
    {
        getComponent: () => {
            const SettingsPreferencesLanguagePage = require('../../../pages/settings/Preferences/LanguagePage').default;
            return SettingsPreferencesLanguagePage;
        },
        name: 'Settings_Preferences_Language',
    },
    // Will be uncommented as part of https://github.com/Expensify/App/issues/21670
    // {
    //     getComponent: () => {
    //         const SettingsPreferencesThemePage = require('../../../pages/settings/Preferences/ThemePage').default;
    //         return SettingsPreferencesThemePage;
    //     },
    //     name: 'Settings_Preferences_Theme',
    // },
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
            const SettingsLoungeAccessPage = require('../../../pages/settings/Profile/LoungeAccessPage').default;
            return SettingsLoungeAccessPage;
        },
        name: 'Settings_Lounge_Access',
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
            const WorkspaceRateAndUnitPage = require('../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage').default;
            return WorkspaceRateAndUnitPage;
        },
        name: 'Workspace_RateAndUnit',
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
            const WorkspaceInviteMessagePage = require('../../../pages/workspace/WorkspaceInviteMessagePage').default;
            return WorkspaceInviteMessagePage;
        },
        name: 'Workspace_Invite_Message',
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
        initialParams: {stepToOpen: ''},
    },
    {
        getComponent: () => {
            const GetAssistancePage = require('../../../pages/GetAssistancePage').default;
            return GetAssistancePage;
        },
        name: 'GetAssistance',
    },
    {
        getComponent: () => {
            const SettingsTwoFactorAuthIsEnabled = require('../../../pages/settings/Security/TwoFactorAuth/IsEnabledPage').default;
            return SettingsTwoFactorAuthIsEnabled;
        },
        name: 'Settings_TwoFactorAuthIsEnabled',
    },
    {
        getComponent: () => {
            const SettingsTwoFactorAuthDisable = require('../../../pages/settings/Security/TwoFactorAuth/DisablePage').default;
            return SettingsTwoFactorAuthDisable;
        },
        name: 'Settings_TwoFactorAuthDisable',
    },
    {
        getComponent: () => {
            const SettingsTwoFactorAuthCodes = require('../../../pages/settings/Security/TwoFactorAuth/CodesPage').default;
            return SettingsTwoFactorAuthCodes;
        },
        name: 'Settings_TwoFactorAuthCodes',
    },
    {
        getComponent: () => {
            const SettingsTwoFactorAuthVerify = require('../../../pages/settings/Security/TwoFactorAuth/VerifyPage').default;
            return SettingsTwoFactorAuthVerify;
        },
        name: 'Settings_TwoFactorAuthVerify',
    },
    {
        getComponent: () => {
            const SettingsTwoFactorAuthSuccess = require('../../../pages/settings/Security/TwoFactorAuth/SuccessPage').default;
            return SettingsTwoFactorAuthSuccess;
        },
        name: 'Settings_TwoFactorAuthSuccess',
    },
]);

const EnablePaymentsStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const EnablePaymentsPage = require('../../../pages/EnablePayments/EnablePaymentsPage').default;
            return EnablePaymentsPage;
        },
        name: 'EnablePayments_Root',
    },
]);

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const AddPersonalBankAccountPage = require('../../../pages/AddPersonalBankAccountPage').default;
            return AddPersonalBankAccountPage;
        },
        name: 'AddPersonalBankAccount_Root',
    },
]);

const ReimbursementAccountModalStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const ReimbursementAccountPage = require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default;
            return ReimbursementAccountPage;
        },
        name: 'ReimbursementAccount_Root',
    },
]);

const WalletStatementStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const WalletStatementPage = require('../../../pages/wallet/WalletStatementPage').default;
            return WalletStatementPage;
        },
        name: 'WalletStatement_Root',
    },
]);

const FlagCommentStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const FlagCommentPage = require('../../../pages/FlagCommentPage').default;
            return FlagCommentPage;
        },
        name: 'FlagComment_Root',
    },
]);

const EditRequestStackNavigator = createModalStackNavigator([
    {
        getComponent: () => {
            const EditRequestPage = require('../../../pages/EditRequestPage').default;
            return EditRequestPage;
        },
        name: 'EditRequest_Root',
    },
]);

export {
    MoneyRequestModalStackNavigator,
    SplitDetailsModalStackNavigator,
    DetailsModalStackNavigator,
    ProfileModalStackNavigator,
    ReportDetailsModalStackNavigator,
    TaskModalStackNavigator,
    ReportSettingsModalStackNavigator,
    ReportWelcomeMessageModalStackNavigator,
    ReportParticipantsModalStackNavigator,
    SearchModalStackNavigator,
    NewGroupModalStackNavigator,
    NewChatModalStackNavigator,
    NewTaskModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    ReimbursementAccountModalStackNavigator,
    WalletStatementStackNavigator,
    FlagCommentStackNavigator,
    EditRequestStackNavigator,
};
