/* eslint-disable @typescript-eslint/naming-convention  */
import {CommonActions, NavigationContainerRefWithCurrent, NavigationHelpers, NavigationState, NavigatorScreenParams, PartialRoute, Route} from '@react-navigation/native';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

type NavigationRef = NavigationContainerRefWithCurrent<RootStackParamList>;

type NavigationRoot = NavigationHelpers<RootStackParamList>;

type GoBackAction = Extract<CommonActions.Action, {type: 'GO_BACK'}>;
type ResetAction = Extract<CommonActions.Action, {type: 'RESET'}>;
type SetParamsAction = Extract<CommonActions.Action, {type: 'SET_PARAMS'}>;

type ActionNavigate = {
    type: ValueOf<typeof CONST.NAVIGATION.ACTION_TYPE>;
    payload: {
        name?: string;
        key?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params?: any;
        path?: string;
        merge?: boolean;
    };
    source?: string;
    target?: string;
};

type StackNavigationAction = GoBackAction | ResetAction | SetParamsAction | ActionNavigate | undefined;

type NavigationStateRoute = NavigationState['routes'][number];
type NavigationPartialRoute = PartialRoute<Route<string>>;
type StateOrRoute = NavigationState | NavigationStateRoute | NavigationPartialRoute;

type CentralPaneNavigatorParamList = {
    [SCREENS.REPORT]: {
        reportActionID: string;
        reportID: string;
    };
};

type SettingsNavigatorParamList = {
    [SCREENS.SETTINGS.ROOT]: undefined;
    Settings_Share_Code: undefined;
    [SCREENS.SETTINGS.WORKSPACES]: undefined;
    Settings_Profile: undefined;
    Settings_Pronouns: undefined;
    Settings_Display_Name: undefined;
    Settings_Timezone: undefined;
    Settings_Timezone_Select: undefined;
    Settings_PersonalDetails_Initial: undefined;
    Settings_PersonalDetails_LegalName: undefined;
    Settings_PersonalDetails_DateOfBirth: undefined;
    Settings_PersonalDetails_Address: undefined;
    Settings_PersonalDetails_Address_Country: undefined;
    Settings_ContactMethods: undefined;
    Settings_ContactMethodDetails: undefined;
    Settings_NewContactMethod: undefined;
    [SCREENS.SETTINGS.PREFERENCES]: undefined;
    Settings_Preferences_PriorityMode: undefined;
    Settings_Preferences_Language: undefined;
    Settings_Preferences_Theme: undefined;
    Settings_Close: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    Settings_About: undefined;
    Settings_App_Download_Links: undefined;
    Settings_Lounge_Access: undefined;
    Settings_Wallet: undefined;
    Settings_Wallet_Cards_Digital_Details_Update_Address: undefined;
    Settings_Wallet_DomainCard: undefined;
    Settings_Wallet_ReportVirtualCardFraud: undefined;
    Settings_Wallet_Card_Activate: undefined;
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.NAME]: undefined;
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.PHONE]: undefined;
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET_CARD_GET_PHYSICAL.CONFIRM]: undefined;
    Settings_Wallet_Transfer_Balance: undefined;
    Settings_Wallet_Choose_Transfer_Account: undefined;
    Settings_Wallet_EnablePayments: undefined;
    Settings_Add_Debit_Card: undefined;
    Settings_Add_Bank_Account: undefined;
    [SCREENS.SETTINGS.STATUS]: undefined;
    Settings_Status_Set: undefined;
    Workspace_Initial: undefined;
    Workspace_Settings: undefined;
    Workspace_Settings_Currency: undefined;
    Workspace_Card: {
        policyID: string;
    };
    Workspace_Reimburse: {
        policyID: string;
    };
    Workspace_RateAndUnit: undefined;
    Workspace_Bills: {
        policyID: string;
    };
    Workspace_Invoices: {
        policyID: string;
    };
    Workspace_Travel: {
        policyID: string;
    };
    Workspace_Members: {
        policyID: string;
    };
    Workspace_Invite: {
        policyID: string;
    };
    Workspace_Invite_Message: {
        policyID: string;
    };
    ReimbursementAccount: {
        stepToOpen: string;
        policyID: string;
    };
    GetAssistance: {
        taskID: string;
    };
    Settings_TwoFactorAuth: undefined;
    Settings_ReportCardLostOrDamaged: undefined;
    KeyboardShortcuts: undefined;
};

type NewChatNavigatorParamList = {
    NewChat_Root: undefined;
};

type SearchNavigatorParamList = {
    Search_Root: undefined;
};

type DetailsNavigatorParamList = {
    Details_Root: {
        login: string;
        reportID: string;
    };
};

type ProfileNavigatorParamList = {
    Profile_Root: {
        accountID: string;
        reportID: string;
    };
};

type ReportDetailsNavigatorParamList = {
    Report_Details_Root: undefined;
    Report_Details_Share_Code: {
        reportID: string;
    };
};

type ReportSettingsNavigatorParamList = {
    Report_Settings_Root: undefined;
    Report_Settings_Room_Name: undefined;
    Report_Settings_Notification_Preferences: undefined;
    Report_Settings_Write_Capability: undefined;
};

type ReportWelcomeMessageNavigatorParamList = {
    Report_WelcomeMessage_Root: {reportID: string};
};

type ParticipantsNavigatorParamList = {
    ReportParticipants_Root: {reportID: string};
};

type RoomMembersNavigatorParamList = {
    RoomMembers_Root: undefined;
};

type RoomInviteNavigatorParamList = {
    RoomInvite_Root: undefined;
};

type MoneyRequestNavigatorParamList = {
    Money_Request: undefined;
    Money_Request_Amount: undefined;
    Money_Request_Participants: {
        iouType: string;
        reportID: string;
    };
    Money_Request_Confirmation: {
        iouType: string;
        reportID: string;
    };
    Money_Request_Currency: {
        iouType: string;
        reportID: string;
        currency: string;
        backTo: string;
    };
    Money_Request_Date: {
        iouType: string;
        reportID: string;
        field: string;
        threadReportID: string;
    };
    Money_Request_Description: {
        iouType: string;
        reportID: string;
        field: string;
        threadReportID: string;
    };
    Money_Request_Category: {
        iouType: string;
        reportID: string;
    };
    Money_Request_Tag: {
        iouType: string;
        reportID: string;
    };
    Money_Request_Merchant: {
        iouType: string;
        reportID: string;
        field: string;
        threadReportID: string;
    };
    IOU_Send_Enable_Payments: undefined;
    IOU_Send_Add_Bank_Account: undefined;
    IOU_Send_Add_Debit_Card: undefined;
    Money_Request_Waypoint: {
        iouType: string;
        transactionID: string;
        waypointIndex: string;
        threadReportID: number;
    };
    Money_Request_Edit_Waypoint: {
        iouType: string;
        transactionID: string;
        waypointIndex: string;
        threadReportID: number;
    };
    Money_Request_Distance: {
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        reportID: string;
    };
    Money_Request_Receipt: {
        iouType: string;
        reportID: string;
    };
};

type NewTaskNavigatorParamList = {
    NewTask_Root: undefined;
    NewTask_TaskAssigneeSelector: undefined;
    NewTask_TaskShareDestinationSelector: undefined;
    NewTask_Details: undefined;
    NewTask_Title: undefined;
    NewTask_Description: undefined;
};

type TeachersUniteNavigatorParamList = {
    [SCREENS.SAVE_THE_WORLD.ROOT]: undefined;
    I_Know_A_Teacher: undefined;
    Intro_School_Principal: undefined;
    I_Am_A_Teacher: undefined;
};

type TaskDetailsNavigatorParamList = {
    Task_Title: undefined;
    Task_Description: undefined;
    Task_Assignee: {
        reportID: string;
    };
};

type EnablePaymentsNavigatorParamList = {
    EnablePayments_Root: undefined;
};

type SplitDetailsNavigatorParamList = {
    SplitDetails_Root: {
        reportActionID: string;
    };
    SplitDetails_Edit_Request: undefined;
    SplitDetails_Edit_Currency: undefined;
};

type AddPersonalBankAccountNavigatorParamList = {
    AddPersonalBankAccount_Root: undefined;
};

type WalletStatementNavigatorParamList = {
    WalletStatement_Root: undefined;
};

type FlagCommentNavigatorParamList = {
    FlagComment_Root: {
        reportID: string;
        reportActionID: string;
    };
};

type EditRequestNavigatorParamList = {
    EditRequest_Root: {
        field: string;
        threadReportID: string;
    };
    EditRequest_Currency: undefined;
};

type SignInNavigatorParamList = {
    SignIn_Root: undefined;
};

type ReferralDetailsNavigatorParamList = {
    Referral_Details: undefined;
};

type PrivateNotesNavigatorParamList = {
    PrivateNotes_View: {
        reportID: string;
        accountID: string;
    };
    PrivateNotes_List: {
        reportID: string;
        accountID: string;
    };
    PrivateNotes_Edit: {
        reportID: string;
        accountID: string;
    };
};

type RightModalNavigatorParamList = {
    Settings: NavigatorScreenParams<SettingsNavigatorParamList>;
    NewChat: NavigatorScreenParams<NewChatNavigatorParamList>;
    Search: NavigatorScreenParams<SearchNavigatorParamList>;
    Details: NavigatorScreenParams<DetailsNavigatorParamList>;
    Profile: NavigatorScreenParams<ProfileNavigatorParamList>;
    Report_Details: NavigatorScreenParams<ReportDetailsNavigatorParamList>;
    Report_Settings: NavigatorScreenParams<ReportSettingsNavigatorParamList>;
    Report_WelcomeMessage: NavigatorScreenParams<ReportWelcomeMessageNavigatorParamList>;
    Participants: NavigatorScreenParams<ParticipantsNavigatorParamList>;
    RoomMembers: NavigatorScreenParams<RoomMembersNavigatorParamList>;
    RoomInvite: NavigatorScreenParams<RoomInviteNavigatorParamList>;
    MoneyRequest: NavigatorScreenParams<MoneyRequestNavigatorParamList>;
    NewTask: NavigatorScreenParams<NewTaskNavigatorParamList>;
    TeachersUnite: NavigatorScreenParams<TeachersUniteNavigatorParamList>;
    Task_Details: NavigatorScreenParams<TaskDetailsNavigatorParamList>;
    EnablePayments: NavigatorScreenParams<EnablePaymentsNavigatorParamList>;
    SplitDetails: NavigatorScreenParams<SplitDetailsNavigatorParamList>;
    AddPersonalBankAccount: NavigatorScreenParams<AddPersonalBankAccountNavigatorParamList>;
    Wallet_Statement: NavigatorScreenParams<WalletStatementNavigatorParamList>;
    Flag_Comment: NavigatorScreenParams<FlagCommentNavigatorParamList>;
    EditRequest: NavigatorScreenParams<EditRequestNavigatorParamList>;
    SignIn: NavigatorScreenParams<SignInNavigatorParamList>;
    Referral: NavigatorScreenParams<ReferralDetailsNavigatorParamList>;
    Private_Notes: NavigatorScreenParams<PrivateNotesNavigatorParamList>;
};

type PublicScreensParamList = {
    [SCREENS.HOME]: undefined;
    [SCREENS.TRANSITION_BETWEEN_APPS]: {
        shouldForceLogin: string;
        email: string;
        shortLivedAuthToken: string;
        exitTo: string;
    };
    [SCREENS.VALIDATE_LOGIN]: {
        accountID: string;
        validateCode: string;
    };
    [SCREENS.UNLINK_LOGIN]: {
        accountID: string;
        validateCode: string;
    };
    [SCREENS.SIGN_IN_WITH_APPLE_DESKTOP]: undefined;
    [SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP]: undefined;
    [SCREENS.SAML_SIGN_IN]: undefined;
};

type AuthScreensParamList = {
    [SCREENS.HOME]: undefined;
    [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: NavigatorScreenParams<CentralPaneNavigatorParamList>;
    [SCREENS.VALIDATE_LOGIN]: {
        accountID: string;
        validateCode: string;
    };
    [SCREENS.TRANSITION_BETWEEN_APPS]: {
        shouldForceLogin: string;
        email: string;
        shortLivedAuthToken: string;
        exitTo: string;
    };
    [SCREENS.CONCIERGE]: undefined;
    [SCREENS.REPORT_ATTACHMENTS]: {
        reportID: string;
        source: string;
    };
    [SCREENS.NOT_FOUND]: undefined;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
    [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: undefined;
    [CONST.DEMO_PAGES.MONEY2020]: undefined;
};

type RootStackParamList = PublicScreensParamList & AuthScreensParamList;

export type {NavigationRef, StackNavigationAction, CentralPaneNavigatorParamList, RootStackParamList, StateOrRoute, NavigationStateRoute, NavigationRoot};
