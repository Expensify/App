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
        openOnAdminRoom?: boolean;
    };
};

type SettingsNavigatorParamList = {
    [SCREENS.SETTINGS.ROOT]: undefined;
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.SETTINGS.WORKSPACES]: undefined;
    [SCREENS.SETTINGS.PROFILE.ROOT]: undefined;
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: undefined;
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: undefined;
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.INITIAL]: undefined;
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.LEGAL_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.DATE_OF_BIRTH]: undefined;
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.ADDRESS]: undefined;
    [SCREENS.SETTINGS.PROFILE.PERSONAL_DETAILS.ADDRESS_COUNTRY]: undefined;
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: undefined;
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: undefined;
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.THEME]: undefined;
    [SCREENS.SETTINGS.CLOSE]: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    [SCREENS.SETTINGS.ABOUT]: undefined;
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: undefined;
    [SCREENS.SETTINGS.LOUNGE_ACCESS]: undefined;
    [SCREENS.SETTINGS.WALLET.ROOT]: undefined;
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: undefined;
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: undefined;
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: undefined;
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME]: undefined;
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE]: undefined;
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM]: undefined;
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: undefined;
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: undefined;
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: undefined;
    [SCREENS.WORKSPACE.INITIAL]: undefined;
    [SCREENS.WORKSPACE.SETTINGS]: undefined;
    [SCREENS.WORKSPACE.CURRENCY]: undefined;
    [SCREENS.WORKSPACE.CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REIMBURSE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RATE_AND_UNIT]: undefined;
    [SCREENS.WORKSPACE.BILLS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: {
        policyID: string;
    };
    [SCREENS.REIMBURSEMENT_ACCOUNT]: {
        stepToOpen: string;
        policyID: string;
    };
    [SCREENS.GET_ASSISTANCE]: {
        taskID: string;
    };
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: undefined;
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: undefined;
    [SCREENS.KEYBOARD_SHORTCUTS]: undefined;
};

type NewChatNavigatorParamList = {
    [SCREENS.NEW_CHAT.ROOT]: undefined;
};

type SearchNavigatorParamList = {
    [SCREENS.SEARCH_ROOT]: undefined;
};

type DetailsNavigatorParamList = {
    [SCREENS.DETAILS_ROOT]: {
        login: string;
        reportID: string;
    };
};

type ProfileNavigatorParamList = {
    [SCREENS.PROFILE_ROOT]: {
        accountID: string;
        reportID: string;
    };
};

type ReportDetailsNavigatorParamList = {
    [SCREENS.REPORT_DETAILS.ROOT]: undefined;
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: {
        reportID: string;
    };
};

type ReportSettingsNavigatorParamList = {
    [SCREENS.REPORT_SETTINGS.ROOT]: undefined;
    [SCREENS.REPORT_SETTINGS.ROOM_NAME]: undefined;
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: undefined;
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: undefined;
};

type ReportWelcomeMessageNavigatorParamList = {
    [SCREENS.REPORT_WELCOME_MESSAGE_ROOT]: {reportID: string};
};

type ParticipantsNavigatorParamList = {
    [SCREENS.REPORT_PARTICIPANTS_ROOT]: {reportID: string};
};

type RoomMembersNavigatorParamList = {
    [SCREENS.ROOM_MEMBERS_ROOT]: undefined;
};

type RoomInviteNavigatorParamList = {
    [SCREENS.ROOM_INVITE_ROOT]: undefined;
};

type MoneyRequestNavigatorParamList = {
    [SCREENS.MONEY_REQUEST.ROOT]: undefined;
    [SCREENS.MONEY_REQUEST.AMOUNT]: undefined;
    [SCREENS.MONEY_REQUEST.PARTICIPANTS]: {
        iouType: string;
        reportID: string;
    };
    [SCREENS.MONEY_REQUEST.CONFIRMATION]: {
        iouType: string;
        reportID: string;
    };
    [SCREENS.MONEY_REQUEST.CURRENCY]: {
        iouType: string;
        reportID: string;
        currency: string;
        backTo: string;
    };
    [SCREENS.MONEY_REQUEST.DATE]: {
        iouType: string;
        reportID: string;
        field: string;
        threadReportID: string;
    };
    [SCREENS.MONEY_REQUEST.DESCRIPTION]: {
        iouType: string;
        reportID: string;
        field: string;
        threadReportID: string;
    };
    [SCREENS.MONEY_REQUEST.CATEGORY]: {
        iouType: string;
        reportID: string;
    };
    [SCREENS.MONEY_REQUEST.TAG]: {
        iouType: string;
        reportID: string;
    };
    [SCREENS.MONEY_REQUEST.MERCHANT]: {
        iouType: string;
        reportID: string;
        field: string;
        threadReportID: string;
    };
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: undefined;
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: undefined;
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: undefined;
    [SCREENS.MONEY_REQUEST.WAYPOINT]: {
        iouType: string;
        transactionID: string;
        waypointIndex: string;
        threadReportID: number;
    };
    [SCREENS.MONEY_REQUEST.EDIT_WAYPOINT]: {
        iouType: string;
        transactionID: string;
        waypointIndex: string;
        threadReportID: number;
    };
    [SCREENS.MONEY_REQUEST.DISTANCE]: {
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        reportID: string;
    };
    [SCREENS.MONEY_REQUEST.RECEIPT]: {
        iouType: string;
        reportID: string;
    };
};

type NewTaskNavigatorParamList = {
    [SCREENS.NEW_TASK.ROOT]: undefined;
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: undefined;
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: undefined;
    [SCREENS.NEW_TASK.DETAILS]: undefined;
    [SCREENS.NEW_TASK.TITLE]: undefined;
    [SCREENS.NEW_TASK.DESCRIPTION]: undefined;
};

type TeachersUniteNavigatorParamList = {
    [SCREENS.SAVE_THE_WORLD.ROOT]: undefined;
    [SCREENS.I_KNOW_A_TEACHER]: undefined;
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: undefined;
    [SCREENS.I_AM_A_TEACHER]: undefined;
};

type TaskDetailsNavigatorParamList = {
    [SCREENS.TASK.TITLE]: undefined;
    [SCREENS.TASK.DESCRIPTION]: undefined;
    [SCREENS.TASK.ASSIGNEE]: {
        reportID: string;
    };
};

type EnablePaymentsNavigatorParamList = {
    [SCREENS.ENABLE_PAYMENTS_ROOT]: undefined;
};

type SplitDetailsNavigatorParamList = {
    [SCREENS.SPLIT_DETAILS.ROOT]: {
        reportActionID: string;
    };
    [SCREENS.SPLIT_DETAILS.EDIT_REQUEST]: undefined;
    [SCREENS.SPLIT_DETAILS.EDIT_CURRENCY]: undefined;
};

type AddPersonalBankAccountNavigatorParamList = {
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: undefined;
};

type ReimbursementAccountNavigatorParamList = {
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: {
        stepToOpen: string;
        policyID: string;
    };
};

type WalletStatementNavigatorParamList = {
    [SCREENS.WALLET_STATEMENT_ROOT]: undefined;
};

type FlagCommentNavigatorParamList = {
    [SCREENS.FLAG_COMMENT_ROOT]: {
        reportID: string;
        reportActionID: string;
    };
};

type EditRequestNavigatorParamList = {
    [SCREENS.EDIT_REQUEST.ROOT]: {
        field: string;
        threadReportID: string;
    };
    [SCREENS.EDIT_REQUEST.CURRENCY]: undefined;
};

type SignInNavigatorParamList = {
    [SCREENS.SIGN_IN_ROOT]: undefined;
};

type ReferralDetailsNavigatorParamList = {
    [SCREENS.REFERRAL_DETAILS]: undefined;
};

type PrivateNotesNavigatorParamList = {
    [SCREENS.PRIVATE_NOTES.VIEW]: {
        reportID: string;
        accountID: string;
    };
    [SCREENS.PRIVATE_NOTES.LIST]: {
        reportID: string;
        accountID: string;
    };
    [SCREENS.PRIVATE_NOTES.EDIT]: {
        reportID: string;
        accountID: string;
    };
};

type RightModalNavigatorParamList = {
    [SCREENS.RIGHT_MODAL.SETTINGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_CHAT]: NavigatorScreenParams<NewChatNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH]: NavigatorScreenParams<SearchNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.DETAILS]: NavigatorScreenParams<DetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PROFILE]: NavigatorScreenParams<ProfileNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_DETAILS]: NavigatorScreenParams<ReportDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_SETTINGS]: NavigatorScreenParams<ReportSettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_WELCOME_MESSAGE]: NavigatorScreenParams<ReportWelcomeMessageNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PARTICIPANTS]: NavigatorScreenParams<ParticipantsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ROOM_MEMBERS]: NavigatorScreenParams<RoomMembersNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ROOM_INVITE]: NavigatorScreenParams<RoomInviteNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.MONEY_REQUEST]: NavigatorScreenParams<MoneyRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_TASK]: NavigatorScreenParams<NewTaskNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TEACHERS_UNITE]: NavigatorScreenParams<TeachersUniteNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TASK_DETAILS]: NavigatorScreenParams<TaskDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ENABLE_PAYMENTS]: NavigatorScreenParams<EnablePaymentsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SPLIT_DETAILS]: NavigatorScreenParams<SplitDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT]: NavigatorScreenParams<AddPersonalBankAccountNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.WALLET_STATEMENT]: NavigatorScreenParams<WalletStatementNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.FLAG_COMMENT]: NavigatorScreenParams<FlagCommentNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.EDIT_REQUEST]: NavigatorScreenParams<EditRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SIGN_IN]: NavigatorScreenParams<SignInNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REFERRAL]: NavigatorScreenParams<ReferralDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PRIVATE_NOTES]: NavigatorScreenParams<PrivateNotesNavigatorParamList>;
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
    [CONST.DEMO_PAGES.SAASTR]: {
        name: string;
    };
    [CONST.DEMO_PAGES.SBE]: {
        name: string;
    };
    [SCREENS.NOT_FOUND]: undefined;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
    [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: undefined;
    [CONST.DEMO_PAGES.MONEY2020]: undefined;
};

type RootStackParamList = PublicScreensParamList & AuthScreensParamList;

export type {
    NavigationRef,
    StackNavigationAction,
    CentralPaneNavigatorParamList,
    RootStackParamList,
    StateOrRoute,
    NavigationStateRoute,
    NavigationRoot,
    AuthScreensParamList,
    RightModalNavigatorParamList,
    PublicScreensParamList,
    MoneyRequestNavigatorParamList,
    SplitDetailsNavigatorParamList,
    DetailsNavigatorParamList,
    ProfileNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    TaskDetailsNavigatorParamList,
    ReportWelcomeMessageNavigatorParamList,
    ParticipantsNavigatorParamList,
    RoomMembersNavigatorParamList,
    RoomInviteNavigatorParamList,
    SearchNavigatorParamList,
    NewChatNavigatorParamList,
    NewTaskNavigatorParamList,
    TeachersUniteNavigatorParamList,
    SettingsNavigatorParamList,
    EnablePaymentsNavigatorParamList,
    AddPersonalBankAccountNavigatorParamList,
    WalletStatementNavigatorParamList,
    FlagCommentNavigatorParamList,
    EditRequestNavigatorParamList,
    PrivateNotesNavigatorParamList,
    SignInNavigatorParamList,
    ReferralDetailsNavigatorParamList,
    ReimbursementAccountNavigatorParamList,
};
