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

/**
 * Returns an object used by the stack navigator to link a route to a rendering component
 *
 * @param {String} name of the screen in linkingConfig
 * @param {Function} getComponent returns a component that is require()'d
 * @returns {Object}
 */
const createRouteRenderingComponent = (name, getComponent) => ({
    // require() syntax is used here so that the file used by a screen are loaded only when the route is accessed
    getComponent,
    name,
});

// We use getComponent/require syntax so that file used by screens are not loaded until we need them.
const MoneyRequestModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('Money_Request', () => require('../../../pages/iou/MoneyRequestSelectorPage').default),
    createRouteRenderingComponent('Money_Request_Amount', () => require('../../../pages/iou/steps/NewRequestAmountPage').default),
    createRouteRenderingComponent('Money_Request_Participants', () => require('../../../pages/iou/steps/MoneyRequstParticipantsPage/MoneyRequestParticipantsPage').default),
    createRouteRenderingComponent('Money_Request_Confirmation', () => require('../../../pages/iou/steps/MoneyRequestConfirmPage').default),
    createRouteRenderingComponent('Money_Request_Currency', () => require('../../../pages/iou/IOUCurrencySelection').default),
    createRouteRenderingComponent('Money_Request_Date', () => require('../../../pages/iou/MoneyRequestDatePage').default),
    createRouteRenderingComponent('Money_Request_Description', () => require('../../../pages/iou/MoneyRequestDescriptionPage').default),
    createRouteRenderingComponent('Money_Request_Category', () => require('../../../pages/iou/MoneyRequestCategoryPage').default),
    createRouteRenderingComponent('Money_Request_Tag', () => require('../../../pages/iou/MoneyRequestTagPage').default),
    createRouteRenderingComponent('Money_Request_Merchant', () => require('../../../pages/iou/MoneyRequestMerchantPage').default),
    createRouteRenderingComponent('IOU_Send_Add_Bank_Account', () => require('../../../pages/AddPersonalBankAccountPage').default),
    createRouteRenderingComponent('IOU_Send_Add_Debit_Card', () => require('../../../pages/settings/Wallet/AddDebitCardPage').default),
    createRouteRenderingComponent('IOU_Send_Enable_Payments', () => require('../../../pages/EnablePayments/EnablePaymentsPage').default),
    createRouteRenderingComponent('Money_Request_Waypoint', () => require('../../../pages/iou/WaypointEditorPage').default),
    createRouteRenderingComponent('Money_Request_Address', () => require('../../../pages/iou/DistanceRequestPage').default),
]);

const SplitDetailsModalStackNavigator = createModalStackNavigator([createRouteRenderingComponent('SplitDetails_Root', () => require('../../../pages/iou/SplitBillDetailsPage').default)]);

const DetailsModalStackNavigator = createModalStackNavigator([createRouteRenderingComponent('Details_Root', () => require('../../../pages/DetailsPage').default)]);

const ProfileModalStackNavigator = createModalStackNavigator([createRouteRenderingComponent('Profile_Root', () => require('../../../pages/ProfilePage').default)]);

const ReportDetailsModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('Report_Details_Root', () => require('../../../pages/ReportDetailsPage').default),
    createRouteRenderingComponent('Report_Details_Share_Code', () => require('../../../pages/home/report/ReportDetailsShareCodePage').default),
]);

const ReportSettingsModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('Report_Settings_Root', () => require('../../../pages/settings/Report/ReportSettingsPage').default),
    createRouteRenderingComponent('Report_Settings_Room_Name', () => require('../../../pages/settings/Report/RoomNamePage').default),
    createRouteRenderingComponent('Report_Settings_Notification_Preferences', () => require('../../../pages/settings/Report/NotificationPreferencePage').default),
    createRouteRenderingComponent('Report_Settings_Write_Capability', () => require('../../../pages/settings/Report/WriteCapabilityPage').default),
]);

const TaskModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('Task_Title', () => require('../../../pages/tasks/TaskTitlePage').default),
    createRouteRenderingComponent('Task_Description', () => require('../../../pages/tasks/TaskDescriptionPage').default),
    createRouteRenderingComponent('Task_Assignee', () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default),
]);

const ReportWelcomeMessageModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('Report_WelcomeMessage_Root', () => require('../../../pages/ReportWelcomeMessagePage').default),
]);

const ReportParticipantsModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('ReportParticipants_Root', () => require('../../../pages/ReportParticipantsPage').default),
]);

const SearchModalStackNavigator = createModalStackNavigator([createRouteRenderingComponent('Search_Root', () => require('../../../pages/SearchPage').default)]);

const NewChatModalStackNavigator = createModalStackNavigator([createRouteRenderingComponent('NewChat_Root', () => require('../../../pages/NewChatSelectorPage').default)]);

const NewTaskModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('NewTask_Root', () => require('../../../pages/tasks/NewTaskPage').default),
    createRouteRenderingComponent('NewTask_TaskAssigneeSelector', () => require('../../../pages/tasks/TaskAssigneeSelectorModal').default),
    createRouteRenderingComponent('NewTask_TaskShareDestinationSelector', () => require('../../../pages/tasks/TaskShareDestinationSelectorModal').default),
    createRouteRenderingComponent('NewTask_Details', () => require('../../../pages/tasks/NewTaskDetailsPage').default),
    createRouteRenderingComponent('NewTask_Title', () => require('../../../pages/tasks/NewTaskTitlePage').default),
    createRouteRenderingComponent('NewTask_Description', () => require('../../../pages/tasks/NewTaskDescriptionPage').default),
]);

const NewTeachersUniteNavigator = createModalStackNavigator([
    createRouteRenderingComponent(SCREENS.SAVE_THE_WORLD.ROOT, () => require('../../../pages/TeachersUnite/SaveTheWorldPage').default),
    createRouteRenderingComponent('I_Know_A_Teacher', () => require('../../../pages/TeachersUnite/KnowATeacherPage').default),
    createRouteRenderingComponent('Intro_School_Principal', () => require('../../../pages/TeachersUnite/ImTeacherPage').default),
    createRouteRenderingComponent('I_Am_A_Teacher', () => require('../../../pages/TeachersUnite/ImTeacherPage').default),
]);

const SettingsModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent(SCREENS.SETTINGS.ROOT, () => require('../../../pages/settings/InitialSettingsPage').default),
    createRouteRenderingComponent('Settings_Share_Code', () => require('../../../pages/ShareCodePage').default),
    createRouteRenderingComponent(SCREENS.SETTINGS.WORKSPACES, () => require('../../../pages/workspace/WorkspacesListPage').default),
    createRouteRenderingComponent('Settings_Profile', () => require('../../../pages/settings/Profile/ProfilePage').default),
    createRouteRenderingComponent('Settings_Pronouns', () => require('../../../pages/settings/Profile/PronounsPage').default),
    createRouteRenderingComponent('Settings_Display_Name', () => require('../../../pages/settings/Profile/DisplayNamePage').default),
    createRouteRenderingComponent('Settings_Timezone', () => require('../../../pages/settings/Profile/TimezoneInitialPage').default),
    createRouteRenderingComponent('Settings_Timezone_Select', () => require('../../../pages/settings/Profile/TimezoneSelectPage').default),
    createRouteRenderingComponent('Settings_PersonalDetails_Initial', () => require('../../../pages/settings/Profile/PersonalDetails/PersonalDetailsInitialPage').default),
    createRouteRenderingComponent('Settings_PersonalDetails_LegalName', () => require('../../../pages/settings/Profile/PersonalDetails/LegalNamePage').default),
    createRouteRenderingComponent('Settings_PersonalDetails_DateOfBirth', () => require('../../../pages/settings/Profile/PersonalDetails/DateOfBirthPage').default),
    createRouteRenderingComponent('Settings_PersonalDetails_Address', () => require('../../../pages/settings/Profile/PersonalDetails/AddressPage').default),
    createRouteRenderingComponent('Settings_ContactMethods', () => require('../../../pages/settings/Profile/Contacts/ContactMethodsPage').default),
    createRouteRenderingComponent('Settings_ContactMethodDetails', () => require('../../../pages/settings/Profile/Contacts/ContactMethodDetailsPage').default),
    createRouteRenderingComponent('Settings_NewContactMethod', () => require('../../../pages/settings/Profile/Contacts/NewContactMethodPage').default),
    createRouteRenderingComponent(SCREENS.SETTINGS.PREFERENCES, () => require('../../../pages/settings/Preferences/PreferencesPage').default),
    createRouteRenderingComponent('Settings_Preferences_PriorityMode', () => require('../../../pages/settings/Preferences/PriorityModePage').default),
    createRouteRenderingComponent('Settings_Preferences_Language', () => require('../../../pages/settings/Preferences/LanguagePage').default),
    // Will be uncommented as part of https://github.com/Expensify/App/issues/21670
    createRouteRenderingComponent('Settings_Preferences_Theme', () => require('../../../pages/settings/Preferences/ThemePage').default),
    createRouteRenderingComponent('Settings_Close', () => require('../../../pages/settings/Security/CloseAccountPage').default),
    createRouteRenderingComponent(SCREENS.SETTINGS.SECURITY, () => require('../../../pages/settings/Security/SecuritySettingsPage').default),
    createRouteRenderingComponent('Settings_About', () => require('../../../pages/settings/AboutPage/AboutPage').default),
    createRouteRenderingComponent('Settings_App_Download_Links', () => require('../../../pages/settings/AppDownloadLinks').default),
    createRouteRenderingComponent('Settings_Lounge_Access', () => require('../../../pages/settings/Profile/LoungeAccessPage').default),
    createRouteRenderingComponent('Settings_Wallet', () => require('../../../pages/settings/Wallet/WalletPage').default),
    createRouteRenderingComponent('Settings_Wallet_Transfer_Balance', () => require('../../../pages/settings/Wallet/TransferBalancePage').default),
    createRouteRenderingComponent('Settings_Wallet_Choose_Transfer_Account', () => require('../../../pages/settings/Wallet/ChooseTransferAccountPage').default),
    createRouteRenderingComponent('Settings_Wallet_EnablePayments', () => require('../../../pages/EnablePayments/EnablePaymentsPage').default),
    createRouteRenderingComponent('Settings_Add_Debit_Card', () => require('../../../pages/settings/Wallet/AddDebitCardPage').default),
    createRouteRenderingComponent('Settings_Add_Bank_Account', () => require('../../../pages/AddPersonalBankAccountPage').default),
    createRouteRenderingComponent(SCREENS.SETTINGS.STATUS, () => require('../../../pages/settings/Profile/CustomStatus/StatusPage').default),
    createRouteRenderingComponent('Settings_Status_Set', () => require('../../../pages/settings/Profile/CustomStatus/StatusSetPage').default),
    createRouteRenderingComponent('Workspace_Initial', () => require('../../../pages/workspace/WorkspaceInitialPage').default),
    createRouteRenderingComponent('Workspace_Settings', () => require('../../../pages/workspace/WorkspaceSettingsPage').default),
    createRouteRenderingComponent('Workspace_Card', () => require('../../../pages/workspace/card/WorkspaceCardPage').default),
    createRouteRenderingComponent('Workspace_Reimburse', () => require('../../../pages/workspace/reimburse/WorkspaceReimbursePage').default),
    createRouteRenderingComponent('Workspace_RateAndUnit', () => require('../../../pages/workspace/reimburse/WorkspaceRateAndUnitPage').default),
    createRouteRenderingComponent('Workspace_Bills', () => require('../../../pages/workspace/bills/WorkspaceBillsPage').default),
    createRouteRenderingComponent('Workspace_Invoices', () => require('../../../pages/workspace/invoices/WorkspaceInvoicesPage').default),
    createRouteRenderingComponent('Workspace_Travel', () => require('../../../pages/workspace/travel/WorkspaceTravelPage').default),
    createRouteRenderingComponent('Workspace_Members', () => require('../../../pages/workspace/WorkspaceMembersPage').default),
    createRouteRenderingComponent('Workspace_Invite', () => require('../../../pages/workspace/WorkspaceInvitePage').default),
    createRouteRenderingComponent('Workspace_Invite_Message', () => require('../../../pages/workspace/WorkspaceInviteMessagePage').default),
    createRouteRenderingComponent('ReimbursementAccount', () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default),
    createRouteRenderingComponent('GetAssistance', () => require('../../../pages/GetAssistancePage').default),
    createRouteRenderingComponent('Settings_TwoFactorAuth', () => require('../../../pages/settings/Security/TwoFactorAuth/TwoFactorAuthPage').default),
]);

const EnablePaymentsStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('EnablePayments_Root', () => require('../../../pages/EnablePayments/EnablePaymentsPage').default),
]);

const AddPersonalBankAccountModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('AddPersonalBankAccount_Root', () => require('../../../pages/AddPersonalBankAccountPage').default),
]);

const ReimbursementAccountModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('ReimbursementAccount_Root', () => require('../../../pages/ReimbursementAccount/ReimbursementAccountPage').default),
]);

const WalletStatementStackNavigator = createModalStackNavigator([createRouteRenderingComponent('WalletStatement_Root', () => require('../../../pages/wallet/WalletStatementPage').default)]);

const FlagCommentStackNavigator = createModalStackNavigator([createRouteRenderingComponent('FlagComment_Root', () => require('../../../pages/FlagCommentPage').default)]);

const EditRequestStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('EditRequest_Root', () => require('../../../pages/EditRequestPage').default),
    createRouteRenderingComponent('EditRequest_Currency', () => require('../../../pages/iou/IOUCurrencySelection').default),
]);

const PrivateNotesModalStackNavigator = createModalStackNavigator([
    createRouteRenderingComponent('PrivateNotes_View', () => require('../../../pages/PrivateNotes/PrivateNotesViewPage').default),
    createRouteRenderingComponent('PrivateNotes_List', () => require('../../../pages/PrivateNotes/PrivateNotesListPage').default),
    createRouteRenderingComponent('PrivateNotes_Edit', () => require('../../../pages/PrivateNotes/PrivateNotesEditPage').default),
]);

const SignInModalStackNavigator = createModalStackNavigator([createRouteRenderingComponent('SignIn_Root', () => require('../../../pages/signin/SignInModal').default)]);

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
