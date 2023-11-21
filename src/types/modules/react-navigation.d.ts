import {NavigatorScreenParams} from '@react-navigation/native';
import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/* eslint-disable @typescript-eslint/naming-convention  */
/* eslint-disable rulesdir/no-inline-named-export  */
/* eslint-disable @typescript-eslint/no-empty-interface  */

export type CentralPaneNavigatorParamList = {
    [SCREENS.REPORT]: {
        reportActionID: string;
        reportID: string;
    };
};

export type RootStackParamList = {
    ValidateLogin: {
        accountID: string;
        validateCode: string;
    };
    UnlinkLogin: {
        accountID: string;
        validateCode: string;
    };
    [SCREENS.TRANSITION_BETWEEN_APPS]: undefined;
    [SCREENS.CONCIERGE]: undefined;
    AppleSignInDesktop: undefined;
    GoogleSignInDesktop: undefined;
    SAMLSignIn: undefined;
    [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: undefined;
    [SCREENS.REPORT_ATTACHMENTS]: {
        reportID: string;
        source: string;
    };
    [CONST.DEMO_PAGES.MONEY2020]: undefined;

    // Sidebar
    [SCREENS.HOME]: undefined;

    [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]: NavigatorScreenParams<CentralPaneNavigatorParamList>;
    [SCREENS.NOT_FOUND]: undefined;

    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: undefined;

    Settings: undefined;
    [SCREENS.SETTINGS.ROOT]: undefined;
    [SCREENS.SETTINGS.WORKSPACES]: undefined;
    [SCREENS.SETTINGS.PREFERENCES]: undefined;
    Settings_Preferences_PriorityMode: undefined;
    Settings_Preferences_Language: undefined;
    Settings_Preferences_Theme: undefined;
    Settings_Close: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    Settings_Wallet: undefined;
    Settings_Wallet_DomainCards: undefined;
    Settings_Wallet_EnablePayments: undefined;
    Settings_Wallet_Transfer_Balance: undefined;
    Settings_Wallet_Choose_Transfer_Account: undefined;
    Settings_Add_Debit_Card: undefined;
    Settings_Add_Bank_Account: undefined;
    Settings_Profile: undefined;
    Settings_Pronouns: undefined;
    Settings_Display_Name: undefined;
    Settings_Timezone: undefined;
    Settings_Timezone_Select: undefined;
    Settings_About: undefined;
    Settings_App_Download_Links: undefined;
    Settings_ContactMethods: undefined;
    Settings_ContactMethodDetails: undefined;
    Settings_Lounge_Access: undefined;
    Settings_NewContactMethod: undefined;
    Settings_PersonalDetails_Initial: undefined;
    Settings_PersonalDetails_LegalName: undefined;
    Settings_PersonalDetails_DateOfBirth: undefined;
    Settings_PersonalDetails_Address: undefined;
    Settings_PersonalDetails_Address_Country: undefined;
    Settings_TwoFactorAuth: undefined;
    Settings_Share_Code: undefined;
    [SCREENS.SETTINGS.STATUS]: undefined;
    Settings_Status_Set: undefined;
    Workspace_Initial: undefined;
    Workspace_Settings: undefined;
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

    Private_Notes: undefined;
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

    Report_Details: {
        reportID: string;
    };
    Report_Details_Root: undefined;
    Report_Details_Share_Code: {
        reportID: string;
    };

    Report_Settings: undefined;
    Report_Settings_Root: undefined;
    Report_Settings_Room_Name: undefined;
    Report_Settings_Notification_Preferences: undefined;
    Report_Settings_Write_Capability: undefined;

    Report_WelcomeMessage: {reportID: string};
    Report_WelcomeMessage_Root: {reportID: string};

    NewChat: undefined;
    NewChat_Root: undefined;
    chat: undefined;
    room: undefined;

    NewTask: undefined;
    NewTask_Root: undefined;
    NewTask_TaskAssigneeSelector: undefined;
    NewTask_TaskShareDestinationSelector: undefined;
    NewTask_Details: undefined;
    NewTask_Title: undefined;
    NewTask_Description: undefined;

    TeachersUnite: undefined;
    [SCREENS.SAVE_THE_WORLD.ROOT]: undefined;
    I_Know_A_Teacher: undefined;
    Intro_School_Principal: undefined;
    I_Am_A_Teacher: undefined;

    Search: undefined;
    Search_Root: undefined;

    Details: {
        login: string;
        reportID: string;
    };
    Details_Root: {
        login: string;
        reportID: string;
    };

    Profile: {
        accountID: string;
        reportID: string;
    };
    Profile_Root: {
        accountID: string;
        reportID: string;
    };

    Participants: {reportID: string};
    ReportParticipants_Root: {reportID: string};

    MoneyRequest: undefined;
    Money_Request: undefined;
    manual: undefined;
    scan: undefined;
    distance: undefined;
    Money_Request_Amount: undefined;
    Money_Request_Participants: {
        iouType: string;
        reportID: string;
    };
    Money_Request_Confirmation: {
        iouType: string;
        reportID: string;
    };
    Money_Request_Date: {
        iouType: string;
        reportID: string;
        field: string;
        threadReportID: string;
    };
    Money_Request_Currency: {
        iouType: string;
        reportID: string;
        currency: string;
        backTo: string;
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
    Money_Request_Receipt: {
        iouType: string;
        reportID: string;
    };
    Money_Request_Distance: {
        iouType: ValueOf<typeof CONST.IOU.MONEY_REQUEST_TYPE>;
        reportID: string;
    };
    IOU_Send_Enable_Payments: undefined;
    IOU_Send_Add_Bank_Account: undefined;
    IOU_Send_Add_Debit_Card: undefined;

    SplitDetails: {
        reportID: string;
        reportActionID: string;
    };
    SplitDetails_Root: undefined;

    Task_Details: undefined;
    Task_Title: undefined;
    Task_Description: undefined;
    Task_Assignee: {
        reportID: string;
    };

    AddPersonalBankAccount: undefined;
    AddPersonalBankAccount_Root: undefined;

    EnablePayments: undefined;
    EnablePayments_Root: undefined;

    Wallet_Statement: undefined;
    WalletStatement_Root: undefined;

    Flag_Comment: {
        reportID: string;
        reportActionID: string;
    };
    FlagComment_Root: {
        reportID: string;
        reportActionID: string;
    };

    EditRequest: {
        field: string;
        threadReportID: string;
    };
    EditRequest_Root: {
        field: string;
        threadReportID: string;
    };
    EditRequest_Currency: undefined;

    SignIn: undefined;
    SignIn_Root: undefined;
};

declare global {
    namespace ReactNavigation {
        // eslint-disable-next-line
        interface RootParamList extends RootStackParamList {}
    }
}
