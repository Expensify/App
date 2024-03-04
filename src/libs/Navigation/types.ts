/* eslint-disable @typescript-eslint/naming-convention  */
import type {
    CommonActions,
    NavigationContainerRefWithCurrent,
    NavigationHelpers,
    NavigationState,
    NavigatorScreenParams,
    ParamListBase,
    PartialRoute,
    PartialState,
    Route,
} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import type {HybridAppRoute, Route as Routes} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type EXIT_SURVEY_REASON_FORM_INPUT_IDS from '@src/types/form/ExitSurveyReasonForm';

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
type NavigationPartialRoute<TRouteName extends string = string> = PartialRoute<Route<TRouteName>>;
type StateOrRoute = NavigationState | NavigationStateRoute | NavigationPartialRoute;
type State<TParamList extends ParamListBase = ParamListBase> = NavigationState<TParamList> | PartialState<NavigationState<TParamList>>;

type CentralPaneNavigatorParamList = {
    [SCREENS.REPORT]: {
        reportActionID: string;
        reportID: string;
        openOnAdminRoom?: boolean;
    };

    [SCREENS.SETTINGS.WORKSPACES]: undefined;
    [SCREENS.WORKSPACE.PROFILE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REIMBURSE]: {
        policyID: string;
    };
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
    [SCREENS.WORKSPACE.CATEGORIES]: {
        policyID: string;
    };
};

type WorkspaceSwitcherNavigatorParamList = {
    [SCREENS.WORKSPACE_SWITCHER.ROOT]: undefined;
};

type SettingsNavigatorParamList = {
    [SCREENS.SETTINGS.ROOT]: undefined;
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.SETTINGS.PROFILE.ROOT]: undefined;
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: undefined;
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: undefined;
    [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH]: undefined;
    [SCREENS.SETTINGS.PROFILE.ADDRESS]: {
        country?: string;
    };
    [SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY]: {
        backTo?: Routes;
        country: string;
    };
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: {
        backTo: Routes;
    };
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: {
        contactMethod: string;
    };
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: {
        backTo: Routes;
    };
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.THEME]: undefined;
    [SCREENS.SETTINGS.CLOSE]: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    [SCREENS.SETTINGS.ABOUT]: undefined;
    [SCREENS.SETTINGS.APP_DOWNLOAD_LINKS]: undefined;
    [SCREENS.SETTINGS.TROUBLESHOOT]: undefined;
    [SCREENS.SETTINGS.CONSOLE]: undefined;
    [SCREENS.SETTINGS.SHARE_LOG]: {
        /** URL of the generated file to share logs in a report */
        source: string;
    };
    [SCREENS.SETTINGS.WALLET.ROOT]: undefined;
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: undefined;
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: undefined;
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: undefined;
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.NAME]: {
        /** domain passed via route /settings/wallet/card/:domain */
        domain: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.PHONE]: {
        /** domain passed via route /settings/wallet/card/:domain */
        domain: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS]: {
        /** Currently selected country */
        country: string;
        /** domain passed via route /settings/wallet/card/:domain */
        domain: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.CONFIRM]: {
        /** Currently selected country */
        country: string;
        /** domain passed via route /settings/wallet/card/:domain */
        domain: string;
    };
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: undefined;
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: undefined;
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: undefined;
    [SCREENS.WORKSPACE.CURRENCY]: undefined;
    [SCREENS.WORKSPACE.NAME]: undefined;
    [SCREENS.WORKSPACE.DESCRIPTION]: undefined;
    [SCREENS.WORKSPACE.SHARE]: undefined;
    [SCREENS.WORKSPACE.RATE_AND_UNIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RATE_AND_UNIT_RATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RATE_AND_UNIT_UNIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.GET_ASSISTANCE]: {
        backTo: Routes;
    };
    [SCREENS.SETTINGS.TWO_FACTOR_AUTH]: undefined;
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: undefined;
    [SCREENS.KEYBOARD_SHORTCUTS]: undefined;
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: undefined;
    [SCREENS.SETTINGS.EXIT_SURVEY.RESPONSE]: {
        [EXIT_SURVEY_REASON_FORM_INPUT_IDS.REASON]: ValueOf<typeof CONST.EXIT_SURVEY.REASONS>;
        backTo: Routes;
    };
    [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: {
        backTo: Routes;
    };
} & ReimbursementAccountNavigatorParamList;

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
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: {
        reportID: string;
    };
};

type ReportDescriptionNavigatorParamList = {
    [SCREENS.REPORT_DESCRIPTION_ROOT]: {reportID: string};
};

type ParticipantsNavigatorParamList = {
    [SCREENS.REPORT_PARTICIPANTS_ROOT]: {reportID: string};
};

type RoomMembersNavigatorParamList = {
    [SCREENS.ROOM_MEMBERS_ROOT]: undefined;
};

type RoomInviteNavigatorParamList = {
    [SCREENS.ROOM_INVITE_ROOT]: {
        reportID: string;
    };
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
    [SCREENS.MONEY_REQUEST.STEP_DATE]: {
        action: ValueOf<typeof CONST.IOU.ACTION>;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        reportID: string;
        backTo: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: {
        action: ValueOf<typeof CONST.IOU.ACTION>;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        reportID: string;
        backTo: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: {
        action: ValueOf<typeof CONST.IOU.ACTION>;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        reportID: string;
        backTo: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: {
        iouType: string;
        transactionID: string;
        reportID: string;
        backTo: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAG]: {
        action: ValueOf<typeof CONST.IOU.ACTION>;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        reportID: string;
        backTo: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: {
        iouType: string;
        transactionID: string;
        reportID: string;
        backTo: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: {
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        reportID: string;
        backTo: Routes | undefined;
        action: ValueOf<typeof CONST.IOU.ACTION>;
        pageIndex: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: {
        action: ValueOf<typeof CONST.IOU.ACTION>;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        reportID: string;
        backTo: string;
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

type OnboardEngagementNavigatorParamList = {
    [SCREENS.ONBOARD_ENGAGEMENT.ROOT]: undefined;
    [SCREENS.ONBOARD_ENGAGEMENT.MANAGE_TEAMS_EXPENSES]: undefined;
    [SCREENS.ONBOARD_ENGAGEMENT.EXPENSIFY_CLASSIC]: undefined;
};

type TeachersUniteNavigatorParamList = {
    [SCREENS.SAVE_THE_WORLD.ROOT]: undefined;
    [SCREENS.I_KNOW_A_TEACHER]: undefined;
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: undefined;
    [SCREENS.I_AM_A_TEACHER]: undefined;
};

type TaskDetailsNavigatorParamList = {
    [SCREENS.TASK.TITLE]: undefined;
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
    [SCREENS.SPLIT_DETAILS.EDIT_REQUEST]: {
        field: string;
        reportID: string;
        reportActionID: string;
        currency: string;
        tagIndex: string;
    };
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
    [SCREENS.WALLET_STATEMENT_ROOT]: {
        /** The statement year and month as one string, i.e. 202110 */
        yearMonth: string;
    };
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
    [SCREENS.REFERRAL_DETAILS]: {
        contentType: ValueOf<typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES>;
        backTo: string;
    };
};

type ProcessMoneyRequestHoldNavigatorParamList = {
    [SCREENS.PROCESS_MONEY_REQUEST_HOLD_ROOT]: undefined;
};

type PrivateNotesNavigatorParamList = {
    [SCREENS.PRIVATE_NOTES.LIST]: undefined;
    [SCREENS.PRIVATE_NOTES.EDIT]: {
        reportID: string;
        accountID: string;
    };
};

type LeftModalNavigatorParamList = {
    [SCREENS.LEFT_MODAL.SEARCH]: NavigatorScreenParams<SearchNavigatorParamList>;
    [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: NavigatorScreenParams<WorkspaceSwitcherNavigatorParamList>;
};

type RightModalNavigatorParamList = {
    [SCREENS.RIGHT_MODAL.SETTINGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_CHAT]: NavigatorScreenParams<NewChatNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.DETAILS]: NavigatorScreenParams<DetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PROFILE]: NavigatorScreenParams<ProfileNavigatorParamList>;
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.RIGHT_MODAL.REPORT_DETAILS]: NavigatorScreenParams<ReportDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_SETTINGS]: NavigatorScreenParams<ReportSettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_DESCRIPTION]: NavigatorScreenParams<ReportDescriptionNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PARTICIPANTS]: NavigatorScreenParams<ParticipantsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ROOM_MEMBERS]: NavigatorScreenParams<RoomMembersNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ROOM_INVITE]: NavigatorScreenParams<RoomInviteNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.MONEY_REQUEST]: NavigatorScreenParams<MoneyRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_TASK]: NavigatorScreenParams<NewTaskNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ONBOARD_ENGAGEMENT]: NavigatorScreenParams<OnboardEngagementNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TEACHERS_UNITE]: NavigatorScreenParams<TeachersUniteNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TASK_DETAILS]: NavigatorScreenParams<TaskDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ENABLE_PAYMENTS]: NavigatorScreenParams<EnablePaymentsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SPLIT_DETAILS]: NavigatorScreenParams<SplitDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT]: NavigatorScreenParams<AddPersonalBankAccountNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.WALLET_STATEMENT]: NavigatorScreenParams<WalletStatementNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.FLAG_COMMENT]: NavigatorScreenParams<FlagCommentNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.EDIT_REQUEST]: NavigatorScreenParams<EditRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SIGN_IN]: NavigatorScreenParams<SignInNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PROCESS_MONEY_REQUEST_HOLD]: NavigatorScreenParams<ProcessMoneyRequestHoldNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REFERRAL]: NavigatorScreenParams<ReferralDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PRIVATE_NOTES]: NavigatorScreenParams<PrivateNotesNavigatorParamList>;
};

type SettingsCentralPaneNavigatorParamList = {
    [SCREENS.SETTINGS.PROFILE.ROOT]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    [SCREENS.SETTINGS.WALLET.ROOT]: undefined;
    [SCREENS.SETTINGS.ABOUT]: undefined;
};

type FullScreenNavigatorParamList = {
    [SCREENS.SETTINGS.ROOT]: undefined;
    [SCREENS.SETTINGS_CENTRAL_PANE]: NavigatorScreenParams<SettingsCentralPaneNavigatorParamList>;
};

type BottomTabNavigatorParamList = {
    [SCREENS.HOME]: undefined;
    [SCREENS.ALL_SETTINGS]: undefined;
    [SCREENS.WORKSPACE.INITIAL]: undefined;
};

type PublicScreensParamList = {
    [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]: NavigatorScreenParams<BottomTabNavigatorParamList>;
    [SCREENS.TRANSITION_BETWEEN_APPS]: {
        email?: string;
        error?: string;
        shortLivedAuthToken?: string;
        shortLivedToken?: string;
        exitTo?: Routes | HybridAppRoute;
        domain?: Routes;
    };
    [SCREENS.VALIDATE_LOGIN]: {
        accountID: string;
        validateCode: string;
        exitTo?: Routes | HybridAppRoute;
    };
    [SCREENS.UNLINK_LOGIN]: {
        accountID?: string;
        validateCode?: string;
    };
    [SCREENS.SIGN_IN_WITH_APPLE_DESKTOP]: undefined;
    [SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP]: undefined;
    [SCREENS.SAML_SIGN_IN]: undefined;
};

type AuthScreensParamList = {
    [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]: NavigatorScreenParams<BottomTabNavigatorParamList>;
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
    [SCREENS.PROFILE_AVATAR]: {
        accountID: string;
    };
    [SCREENS.WORKSPACE_AVATAR]: {
        policyID: string;
    };
    [SCREENS.REPORT_AVATAR]: {
        reportID: string;
    };
    [SCREENS.NOT_FOUND]: undefined;
    [NAVIGATORS.LEFT_MODAL_NAVIGATOR]: NavigatorScreenParams<LeftModalNavigatorParamList>;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
    [NAVIGATORS.FULL_SCREEN_NAVIGATOR]: NavigatorScreenParams<FullScreenNavigatorParamList>;
    [SCREENS.DESKTOP_SIGN_IN_REDIRECT]: undefined;
};

type RootStackParamList = PublicScreensParamList & AuthScreensParamList;

type BottomTabName = keyof BottomTabNavigatorParamList;

type CentralPaneName = keyof CentralPaneNavigatorParamList;

type FullScreenName = keyof SettingsCentralPaneNavigatorParamList;

type SwitchPolicyIDParams = {
    policyID?: string;
    route?: Routes;
    isPolicyAdmin?: boolean;
};

export type {
    NavigationRef,
    StackNavigationAction,
    CentralPaneNavigatorParamList,
    BottomTabName,
    CentralPaneName,
    FullScreenName,
    RootStackParamList,
    StateOrRoute,
    NavigationStateRoute,
    NavigationPartialRoute,
    NavigationRoot,
    AuthScreensParamList,
    BottomTabNavigatorParamList,
    LeftModalNavigatorParamList,
    RightModalNavigatorParamList,
    PublicScreensParamList,
    MoneyRequestNavigatorParamList,
    SplitDetailsNavigatorParamList,
    DetailsNavigatorParamList,
    ProfileNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    TaskDetailsNavigatorParamList,
    ReportDescriptionNavigatorParamList,
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
    State,
    WorkspaceSwitcherNavigatorParamList,
    OnboardEngagementNavigatorParamList,
    SwitchPolicyIDParams,
};
