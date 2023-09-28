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
 * @param {Object} screens key/value pairs where the key is the name of the screen and the value is a functon that returns the lazy-loaded component
 * @returns {Function}
 */
function createModalStackNavigator(screens) {
    const ModalStackNavigator = createStackNavigator();
    return () => (
        <ModalStackNavigator.Navigator screenOptions={defaultSubRouteOptions}>
            {_.map(screens, (getComponent, name) => (
                <ModalStackNavigator.Screen
                    key={name}
                    name={name}
                    getComponent={getComponent}
                />
            ))}
        </ModalStackNavigator.Navigator>
    );
}

const MoneyRequestModalStackNavigator = createModalStackNavigator({
    Money_Request: () => require('../../../pages/iou/MoneyRequestSelectorPage').default,
    Money_Request_Amount: () => require('../../../pages/iou/steps/NewRequestAmountPage').default,
    Money_Request_Participants: () => require('../../../pages/iou/steps/MoneyRequstParticipantsPage/MoneyRequestParticipantsPage').default,
    Money_Request_Confirmation: () => require('../../../pages/iou/steps/MoneyRequestConfirmPage').default,
    Money_Request_Currency: () => require('../../../pages/iou/IOUCurrencySelection').default,
    Money_Request_Date: () => require('../../../pages/iou/MoneyRequestDatePage').default,
    Money_Request_Description: () => require('../../../pages/iou/MoneyRequestDescriptionPage').default,
    Money_Request_Category: () => require('../../../pages/iou/MoneyRequestCategoryPage').default,
    Money_Request_Tag: () => require('../../../pages/iou/MoneyRequestTagPage').default,
    Money_Request_Merchant: () => require('../../../pages/iou/MoneyRequestMerchantPage').default,
    IOU_Send_Add_Bank_Account: () => require('../../../pages/AddPersonalBankAccountPage').default,
    IOU_Send_Add_Debit_Card: () => require('../../../pages/settings/Wallet/AddDebitCardPage').default,
    IOU_Send_Enable_Payments: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default,
    Money_Request_Waypoint: () => require('../../../pages/iou/NewDistanceRequestWaypointEditorPage').default,
    Money_Request_Edit_Waypoint: () => require('../../../pages/iou/MoneyRequestEditWaypointPage').default,
    Money_Request_Distance: () => require('../../../pages/iou/NewDistanceRequestPage').default,
    Money_Request_Receipt: () => require('../../../pages/EditRequestReceiptPage').default,
});

const SplitDetailsModalStackNavigator = createModalStackNavigator({
    SplitDetails_Root: () => require('../../../pages/iou/SplitBillDetailsPage').default,
});

const DetailsModalStackNavigator = createModalStackNavigator({
    Details_Root: () => require('../../../pages/DetailsPage').default,
});

const ProfileModalStackNavigator = createModalStackNavigator({
    Profile_Root: () => require('../../../pages/ProfilePage').default,
});

const ReportDetailsModalStackNavigator = createModalStackNavigator({
    Report_Details_Root: () => require('../../../pages/ReportDetailsPage').default,
    Report_Details_Share_Code: () => require('../../../pages/home/report/ReportDetailsShareCodePage').default,
});

const ReportSettingsModalStackNavigator = createModalStackNavigator({
    Report_Settings_Root: () => require('../../../pages/settings/Report/ReportSettingsPage').default,
    Report_Settings_Room_Name: () => require('../../../pages/settings/Report/RoomNamePage').default,
    Report_Settings_Notification_Preferences: () => require('../../../pages/settings/Report/NotificationPreferencePage').default,
    Report_Settings_Write_Capability: () => require('../../../pages/settings/Report/WriteCapabilityPage').default,
});

const TaskModalStackNavigator = createModalStackNavigator({
    Task_Title: () => require('../../../pages/tasks/TaskTitlePage').default,
    Task_Description: () => require('../../../pages/tasks/TaskDescriptionPage').default,
    Task_Assignee: () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default,
});

const ReportWelcomeMessageModalStackNavigator = createModalStackNavigator({
    Report_WelcomeMessage_Root: () => require('../../../pages/ReportWelcomeMessagePage').default,
});

const ReportParticipantsModalStackNavigator = createModalStackNavigator({
    ReportParticipants_Root: () => require('../../../pages/ReportParticipantsPage').default,
});

const SearchModalStackNavigator = createModalStackNavigator({
    Search_Root: () => require('../../../pages/SearchPage').default,
});

const NewChatModalStackNavigator = createModalStackNavigator({
    NewChat_Root: () => require('../../../pages/NewChatSelectorPage').default,
});

const NewTaskModalStackNavigator = createModalStackNavigator({
    NewTask_Root: () => require('../../../pages/tasks/NewTaskPage').default,
    NewTask_TaskAssigneeSelector: () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default,
    NewTask_TaskShareDestinationSelector: () => require('../../../pages/tasks/TaskShareDestinationSelectorModal').default,
    NewTask_Details: () => require('../../../pages/tasks/NewTaskDetailsPage').default,
    NewTask_Title: () => require('../../../pages/tasks/NewTaskTitlePage').default,
    NewTask_Description: () => require('../../../pages/tasks/NewTaskDescriptionPage').default,
});

const NewTeachersUniteNavigator = createModalStackNavigator({
    [SCREENS.SAVE_THE_WORLD.ROOT]: () => require('../../../pages/TeachersUnite/SaveTheWorldPage').default,
    I_Know_A_Teacher: () => require('../../../pages/TeachersUnite/KnowATeacherPage').default,
    Intro_School_Principal: () => require('../../../pages/TeachersUnite/ImTeacherPage').default,
    I_Am_A_Teacher: () => require('../../../pages/TeachersUnite/ImTeacherPage').default,
});

const SettingsModalStackNavigator = createModalStackNavigator({
    [SCREENS.SETTINGS.ROOT]: () => require('../../../pages/settings/InitialSettingsPage').default,
    Settings_Share_Code: () => require('../../../pages/ShareCodePage').default,
    [SCREENS.SETTINGS.WORKSPACES]: () => require('../../../pages/workspace/WorkspacesListPage').default,
    Settings_Profile: () => require('../../../pages/settings/Profile/ProfilePage').default,
    Settings_Pronouns: () => require('../../../pages/settings/Profile/PronounsPage').default,
    Settings_Display_Name: () => require('../../../pages/settings/Profile/DisplayNamePage').default,
    Settings_Timezone: () => require('../../../pages/settings/Profile/TimezoneInitialPage').default,
    Settings_Timezone_Select: () => require('../../../pages/settings/Profile/TimezoneSelectPage').default,
    Settings_PersonalDetails_Initial: () => require('../../../pages/settings/Profile/PersonalDetails/PersonalDetailsInitialPage').default,
    Settings_PersonalDetails_LegalName: () => require('../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default,
    Settings_PersonalDetails_DateOfBirth: () => require('../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default,
    Settings_PersonalDetails_Address: () => require('../../../pages/settings/Profile/PersonalDetails/AddressPage').default,
    Settings_PersonalDetails_Address_Country: () => require('../../../pages/settings/Profile/PersonalDetails/CountrySelectionPage').default,
    Settings_ContactMethods: () => require('../../../pages/settings/Profile/Contacts/ContactMethodsPage').default,
    Settings_ContactMethodDetails: () => require('../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default,
    Settings_NewContactMethod: () => require('../../../pages/settings/Profile/Contacts/NewContactMethodPage').default,
    [SCREENS.SETTINGS.PREFERENCES]: () => require('../../../pages/settings/Preferences/PreferencesPage').default,
    Settings_Preferences_PriorityMode: () => require('../../../pages/settings/Preferences/PriorityModePage').default,
    Settings_Preferences_Language: () => require('../../../pages/settings/Preferences/LanguagePage').default,
    // Will be uncommented as part of https://github.com/Expensify/App/issues/21670
    // Settings_Preferences_Theme: () => require('../../../pages/settings/Preferences/ThemePage').default,
    Settings_Close: () => require('../../../pages/settings/Security/CloseAccountPage').default,
    [SCREENS.SETTINGS.SECURITY]: () => require('../../../pages/settings/Security/SecuritySettingsPage').default,
    Settings_About: () => require('../../../pages/settings/AboutPage/AboutPage').default,
    Settings_App_Download_Links: () => require('../../../pages/settings/AppDownloadLinks').default,
    Settings_Lounge_Access: () => require('../../../pages/settings/Profile/LoungeAccessPage').default,
    Settings_Wallet: () => require('../../../pages/settings/Wallet/WalletPage').default,
    Settings_Wallet_DomainCards: () => require('../../../pages/settings/Wallet/ExpensifyCardPage').default,
    Settings_Wallet_Transfer_Balance: () => require('../../../pages/settings/Wallet/TransferBalancePage').default,
    Settings_Wallet_Choose_Transfer_Account: () => require('../../../pages/settings/Wallet/ChooseTransferAccountPage').default,
    Settings_Wallet_EnablePayments: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default,
    Settings_Add_Debit_Card: () => require('../../../pages/settings/Wallet/AddDebitCardPage').default,
    Settings_Add_Bank_Account: () => require('../../../pages/AddPersonalBankAccountPage').default,
    [SCREENS.SETTINGS.STATUS]: () => require('../../../pages/settings/Profile/CustomStatus/StatusPage').default,
    Settings_Status_Set: () => require('../../../pages/settings/Profile/CustomStatus/StatusSetPage').default,
    Workspace_Initial: () => require('../../../pages/workspace/WorkspaceInitialPage').default,
    Workspace_Settings: () => require('../../../pages/workspace/WorkspaceSettingsPage').default,
    Workspace_Card: () => require('../../../pages/workspace/card/WorkspaceCardPage').default,
    Workspace_Reimburse: () => require('../../../pages/workspace/reimburse/WorkspaceReimbursePage').default,
    Workspace_RateAndUnit: () => require('../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage').default,
    Workspace_Bills: () => require('../../../pages/workspace/bills/WorkspaceBillsPage').default,
    Workspace_Invoices: () => require('../../../pages/workspace/invoices/WorkspaceInvoicesPage').default,
    Workspace_Travel: () => require('../../../pages/workspace/travel/WorkspaceTravelPage').default,
    Workspace_Members: () => require('../../../pages/workspace/WorkspaceMembersPage').default,
    Workspace_Invite: () => require('../../../pages/workspace/WorkspaceInvitePage').default,
    Workspace_Invite_Message: () => require('../../../pages/workspace/WorkspaceInviteMessagePage').default,
    ReimbursementAccount: () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
    GetAssistance: () => require('../../../pages/GetAssistancePage').default,
    Settings_TwoFactorAuth: () => require('../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default,
});

const EnablePaymentsStackNavigator = createModalStackNavigator({
    EnablePayments_Root: () => require('../../../pages/EnablePayments/EnablePaymentsPage').default,
});

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator({
    AddPersonalBankAccount_Root: () => require('../../../pages/AddPersonalBankAccountPage').default,
});

const ReimbursementAccountModalStackNavigator = createModalStackNavigator({
    ReimbursementAccount_Root: () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default,
});

const WalletStatementStackNavigator = createModalStackNavigator({
    WalletStatement_Root: () => require('../../../pages/wallet/WalletStatementPage').default,
});

const FlagCommentStackNavigator = createModalStackNavigator({
    FlagComment_Root: () => require('../../../pages/FlagCommentPage').default,
});

const EditRequestStackNavigator = createModalStackNavigator({
    EditRequest_Root: () => require('../../../pages/EditRequestPage').default,
    EditRequest_Currency: () => require('../../../pages/iou/IOUCurrencySelection').default,
});

const PrivateNotesModalStackNavigator = createModalStackNavigator({
    PrivateNotes_View: () => require('../../../pages/PrivateNotes/PrivateNotesViewPage').default,
    PrivateNotes_List: () => require('../../../pages/PrivateNotes/PrivateNotesListPage').default,
    PrivateNotes_Edit: () => require('../../../pages/PrivateNotes/PrivateNotesEditPage').default,
});

const SignInModalStackNavigator = createModalStackNavigator({
    SignIn_Root: () => require('../../../pages/signin/SignInModal').default,
});

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
    NewChatModalStackNavigator,
    NewTaskModalStackNavigator,
    SettingsModalStackNavigator,
    EnablePaymentsStackNavigator,
    AddPersonalBankAccountModalStackNavigator,
    ReimbursementAccountModalStackNavigator,
    WalletStatementStackNavigator,
    FlagCommentStackNavigator,
    EditRequestStackNavigator,
    PrivateNotesModalStackNavigator,
    NewTeachersUniteNavigator,
    SignInModalStackNavigator,
};
