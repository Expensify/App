/**
 * This is a file containing constants for all of the screen names. In most cases, we should use the routes for
 * navigation. But there are situations where we may need to access screen names directly.
 */
import type DeepValueOf from './types/utils/DeepValueOf';

const PROTECTED_SCREENS = {
    HOME: 'Home',
    CONCIERGE: 'Concierge',
    REPORT_ATTACHMENTS: 'ReportAttachments',
} as const;

const SCREENS = {
    ...PROTECTED_SCREENS,
    ALL_SETTINGS: 'AllSettings',
    REPORT: 'Report',
    PROFILE_AVATAR: 'ProfileAvatar',
    WORKSPACE_AVATAR: 'WorkspaceAvatar',
    REPORT_AVATAR: 'ReportAvatar',
    NOT_FOUND: 'not-found',
    TRANSITION_BETWEEN_APPS: 'TransitionBetweenApps',
    VALIDATE_LOGIN: 'ValidateLogin',
    UNLINK_LOGIN: 'UnlinkLogin',
    SETTINGS_CENTRAL_PANE: 'SettingsCentralPane',
    SETTINGS: {
        ROOT: 'Settings_Root',
        SHARE_CODE: 'Settings_Share_Code',
        WORKSPACES: 'Settings_Workspaces',
        SECURITY: 'Settings_Security',
        ABOUT: 'Settings_About',
        APP_DOWNLOAD_LINKS: 'Settings_App_Download_Links',
        ADD_DEBIT_CARD: 'Settings_Add_Debit_Card',
        ADD_BANK_ACCOUNT: 'Settings_Add_Bank_Account',
        CLOSE: 'Settings_Close',
        TWO_FACTOR_AUTH: 'Settings_TwoFactorAuth',
        REPORT_CARD_LOST_OR_DAMAGED: 'Settings_ReportCardLostOrDamaged',
        TROUBLESHOOT: 'Settings_Troubleshoot',
        CONSOLE: 'Settings_Console',
        SHARE_LOG: 'Share_Log',

        PROFILE: {
            ROOT: 'Settings_Profile',
            DISPLAY_NAME: 'Settings_Display_Name',
            CONTACT_METHODS: 'Settings_ContactMethods',
            CONTACT_METHOD_DETAILS: 'Settings_ContactMethodDetails',
            NEW_CONTACT_METHOD: 'Settings_NewContactMethod',
            STATUS_CLEAR_AFTER: 'Settings_Status_Clear_After',
            STATUS_CLEAR_AFTER_DATE: 'Settings_Status_Clear_After_Date',
            STATUS_CLEAR_AFTER_TIME: 'Settings_Status_Clear_After_Time',
            STATUS: 'Settings_Status',
            PRONOUNS: 'Settings_Pronouns',
            TIMEZONE: 'Settings_Timezone',
            TIMEZONE_SELECT: 'Settings_Timezone_Select',
            LEGAL_NAME: 'Settings_LegalName',
            DATE_OF_BIRTH: 'Settings_DateOfBirth',
            ADDRESS: 'Settings_Address',
            ADDRESS_COUNTRY: 'Settings_Address_Country',
        },

        PREFERENCES: {
            ROOT: 'Settings_Preferences',
            PRIORITY_MODE: 'Settings_Preferences_PriorityMode',
            LANGUAGE: 'Settings_Preferences_Language',
            THEME: 'Settings_Preferences_Theme',
        },

        WALLET: {
            ROOT: 'Settings_Wallet',
            DOMAIN_CARD: 'Settings_Wallet_DomainCard',
            CARD_GET_PHYSICAL: {
                NAME: 'Settings_Card_Get_Physical_Name',
                PHONE: 'Settings_Card_Get_Physical_Phone',
                ADDRESS: 'Settings_Card_Get_Physical_Address',
                CONFIRM: 'Settings_Card_Get_Physical_Confirm',
            },
            TRANSFER_BALANCE: 'Settings_Wallet_Transfer_Balance',
            CHOOSE_TRANSFER_ACCOUNT: 'Settings_Wallet_Choose_Transfer_Account',
            ENABLE_PAYMENTS: 'Settings_Wallet_EnablePayments',
            CARD_ACTIVATE: 'Settings_Wallet_Card_Activate',
            REPORT_VIRTUAL_CARD_FRAUD: 'Settings_Wallet_ReportVirtualCardFraud',
            CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS: 'Settings_Wallet_Cards_Digital_Details_Update_Address',
        },

        EXIT_SURVEY: {
            REASON: 'Settings_ExitSurvey_Reason',
            RESPONSE: 'Settings_ExitSurvey_Response',
            CONFIRM: 'Settings_ExitSurvey_Confirm',
        },
    },
    SAVE_THE_WORLD: {
        ROOT: 'SaveTheWorld_Root',
    },
    LEFT_MODAL: {
        SEARCH: 'Search',
        WORKSPACE_SWITCHER: 'WorkspaceSwitcher',
    },
    WORKSPACE_SWITCHER: {
        ROOT: 'WorkspaceSwitcher_Root',
    },
    RIGHT_MODAL: {
        SETTINGS: 'Settings',
        NEW_CHAT: 'NewChat',
        DETAILS: 'Details',
        PROFILE: 'Profile',
        REPORT_DETAILS: 'Report_Details',
        REPORT_SETTINGS: 'Report_Settings',
        REPORT_DESCRIPTION: 'Report_Description',
        PARTICIPANTS: 'Participants',
        MONEY_REQUEST: 'MoneyRequest',
        NEW_TASK: 'NewTask',
        ONBOARD_ENGAGEMENT: 'Onboard_Engagement',
        TEACHERS_UNITE: 'TeachersUnite',
        TASK_DETAILS: 'Task_Details',
        ENABLE_PAYMENTS: 'EnablePayments',
        SPLIT_DETAILS: 'SplitDetails',
        ADD_PERSONAL_BANK_ACCOUNT: 'AddPersonalBankAccount',
        WALLET_STATEMENT: 'Wallet_Statement',
        FLAG_COMMENT: 'Flag_Comment',
        EDIT_REQUEST: 'EditRequest',
        SIGN_IN: 'SignIn',
        PRIVATE_NOTES: 'Private_Notes',
        ROOM_MEMBERS: 'RoomMembers',
        ROOM_INVITE: 'RoomInvite',
        REFERRAL: 'Referral',
        PROCESS_MONEY_REQUEST_HOLD: 'ProcessMoneyRequestHold',
    },
    SIGN_IN_WITH_APPLE_DESKTOP: 'AppleSignInDesktop',
    SIGN_IN_WITH_GOOGLE_DESKTOP: 'GoogleSignInDesktop',
    DESKTOP_SIGN_IN_REDIRECT: 'DesktopSignInRedirect',
    SAML_SIGN_IN: 'SAMLSignIn',

    MONEY_REQUEST: {
        MANUAL_TAB: 'manual',
        SCAN_TAB: 'scan',
        DISTANCE_TAB: 'distance',
        CREATE: 'Money_Request_Create',
        HOLD: 'Money_Request_Hold_Reason',
        STEP_CONFIRMATION: 'Money_Request_Step_Confirmation',
        START: 'Money_Request_Start',
        STEP_AMOUNT: 'Money_Request_Step_Amount',
        STEP_CATEGORY: 'Money_Request_Step_Category',
        STEP_CURRENCY: 'Money_Request_Step_Currency',
        STEP_DATE: 'Money_Request_Step_Date',
        STEP_DESCRIPTION: 'Money_Request_Step_Description',
        STEP_DISTANCE: 'Money_Request_Step_Distance',
        STEP_MERCHANT: 'Money_Request_Step_Merchant',
        STEP_PARTICIPANTS: 'Money_Request_Step_Participants',
        STEP_SCAN: 'Money_Request_Step_Scan',
        STEP_TAG: 'Money_Request_Step_Tag',
        STEP_WAYPOINT: 'Money_Request_Step_Waypoint',
        STEP_TAX_AMOUNT: 'Money_Request_Step_Tax_Amount',
        STEP_TAX_RATE: 'Money_Request_Step_Tax_Rate',
        ROOT: 'Money_Request',
        AMOUNT: 'Money_Request_Amount',
        PARTICIPANTS: 'Money_Request_Participants',
        CONFIRMATION: 'Money_Request_Confirmation',
        CURRENCY: 'Money_Request_Currency',
        WAYPOINT: 'Money_Request_Waypoint',
        EDIT_WAYPOINT: 'Money_Request_Edit_Waypoint',
        DISTANCE: 'Money_Request_Distance',
        RECEIPT: 'Money_Request_Receipt',
    },

    IOU_SEND: {
        ADD_BANK_ACCOUNT: 'IOU_Send_Add_Bank_Account',
        ADD_DEBIT_CARD: 'IOU_Send_Add_Debit_Card',
        ENABLE_PAYMENTS: 'IOU_Send_Enable_Payments',
    },

    REPORT_SETTINGS: {
        ROOT: 'Report_Settings_Root',
        ROOM_NAME: 'Report_Settings_Room_Name',
        NOTIFICATION_PREFERENCES: 'Report_Settings_Notification_Preferences',
        WRITE_CAPABILITY: 'Report_Settings_Write_Capability',
        VISIBILITY: 'Report_Settings_Visibility',
    },

    NEW_TASK: {
        ROOT: 'NewTask_Root',
        TASK_ASSIGNEE_SELECTOR: 'NewTask_TaskAssigneeSelector',
        TASK_SHARE_DESTINATION_SELECTOR: 'NewTask_TaskShareDestinationSelector',
        DETAILS: 'NewTask_Details',
        TITLE: 'NewTask_Title',
        DESCRIPTION: 'NewTask_Description',
    },

    TASK: {
        TITLE: 'Task_Title',
        ASSIGNEE: 'Task_Assignee',
    },

    PRIVATE_NOTES: {
        LIST: 'PrivateNotes_List',
        EDIT: 'PrivateNotes_Edit',
    },

    REPORT_DETAILS: {
        ROOT: 'Report_Details_Root',
        SHARE_CODE: 'Report_Details_Share_Code',
    },

    WORKSPACE: {
        INITIAL: 'Workspace_Initial',
        PROFILE: 'Workspace_Profile',
        CARD: 'Workspace_Card',
        REIMBURSE: 'Workspace_Reimburse',
        RATE_AND_UNIT: 'Workspace_RateAndUnit',
        RATE_AND_UNIT_RATE: 'Workspace_RateAndUnit_Rate',
        RATE_AND_UNIT_UNIT: 'Workspace_RateAndUnit_Unit',
        BILLS: 'Workspace_Bills',
        INVOICES: 'Workspace_Invoices',
        TRAVEL: 'Workspace_Travel',
        MEMBERS: 'Workspace_Members',
        INVITE: 'Workspace_Invite',
        INVITE_MESSAGE: 'Workspace_Invite_Message',
        CATEGORIES: 'Workspace_Categories',
        TAGS: 'Workspace_Tags',
        CURRENCY: 'Workspace_Profile_Currency',
        WORKFLOWS: 'Workspace_Workflows',
        WORKFLOWS_APPROVER: 'Workspace_Workflows_Approver',
        WORKFLOWS_AUTO_REPORTING_FREQUENCY: 'Workspace_Workflows_Auto_Reporting_Frequency',
        WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET: 'Workspace_Workflows_Auto_Reporting_Monthly_Offset',
        DESCRIPTION: 'Workspace_Profile_Description',
        SHARE: 'Workspace_Profile_Share',
        NAME: 'Workspace_Profile_Name',
        CATEGORY_CREATE: 'Category_Create',
        CATEGORY_SETTINGS: 'Category_Settings',
        CATEGORIES_SETTINGS: 'Categories_Settings',
    },

    EDIT_REQUEST: {
        ROOT: 'EditRequest_Root',
        CURRENCY: 'EditRequest_Currency',
        REPORT_FIELD: 'EditRequest_ReportField',
    },

    NEW_CHAT: {
        ROOT: 'NewChat_Root',
        NEW_CHAT: 'chat',
        NEW_ROOM: 'room',
    },

    SPLIT_DETAILS: {
        ROOT: 'SplitDetails_Root',
        EDIT_REQUEST: 'SplitDetails_Edit_Request',
        EDIT_CURRENCY: 'SplitDetails_Edit_Currency',
    },

    ONBOARD_ENGAGEMENT: {
        ROOT: 'Onboard_Engagement_Root',
        MANAGE_TEAMS_EXPENSES: 'Manage_Teams_Expenses',
        EXPENSIFY_CLASSIC: 'Expenisfy_Classic',
    },

    I_KNOW_A_TEACHER: 'I_Know_A_Teacher',
    INTRO_SCHOOL_PRINCIPAL: 'Intro_School_Principal',
    I_AM_A_TEACHER: 'I_Am_A_Teacher',
    ENABLE_PAYMENTS_ROOT: 'EnablePayments_Root',
    ADD_PERSONAL_BANK_ACCOUNT_ROOT: 'AddPersonalBankAccount_Root',
    REIMBURSEMENT_ACCOUNT_ROOT: 'Reimbursement_Account_Root',
    WALLET_STATEMENT_ROOT: 'WalletStatement_Root',
    SIGN_IN_ROOT: 'SignIn_Root',
    DETAILS_ROOT: 'Details_Root',
    PROFILE_ROOT: 'Profile_Root',
    PROCESS_MONEY_REQUEST_HOLD_ROOT: 'ProcessMoneyRequestHold_Root',
    REPORT_DESCRIPTION_ROOT: 'Report_Description_Root',
    REPORT_PARTICIPANTS_ROOT: 'ReportParticipants_Root',
    ROOM_MEMBERS_ROOT: 'RoomMembers_Root',
    ROOM_INVITE_ROOT: 'RoomInvite_Root',
    SEARCH_ROOT: 'Search_Root',
    FLAG_COMMENT_ROOT: 'FlagComment_Root',
    REIMBURSEMENT_ACCOUNT: 'ReimbursementAccount',
    GET_ASSISTANCE: 'GetAssistance',
    REFERRAL_DETAILS: 'Referral_Details',
    KEYBOARD_SHORTCUTS: 'KeyboardShortcuts',
} as const;

type Screen = DeepValueOf<typeof SCREENS>;

export default SCREENS;
export {PROTECTED_SCREENS};
export type {Screen};
