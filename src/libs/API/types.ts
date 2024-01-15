import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import type {
    AuthenticatePusherParams,
    BeginSignInParams,
    ExpandURLPreviewParams,
    GetMissingOnyxMessagesParams,
    GetNewerActionsParams,
    GetOlderActionsParams,
    GetReportPrivateNoteParams,
    GetRouteForDraftParams,
    GetRouteParams,
    GetStatementPDFParams,
    HandleRestrictedEventParams,
    OpenAppParams,
    OpenOldDotLinkParams,
    OpenPlaidBankAccountSelectorParams,
    OpenPlaidBankLoginParams,
    OpenProfileParams,
    OpenPublicProfilePageParams,
    OpenReimbursementAccountPageParams,
    OpenReportParams,
    OpenRoomMembersPageParams,
    ReconnectAppParams,
    RevealExpensifyCardDetailsParams,
    SearchForReportsParams,
    SendPerformanceTimingParams,
    SignInWithShortLivedAuthTokenParams,
    UpdatePreferredLocaleParams,
} from './parameters';

type ApiRequestWithSideEffects = ValueOf<typeof CONST.API_REQUEST_TYPE, 'MAKE_REQUEST_WITH_SIDE_EFFECTS' | 'READ'>;

const WRITE_COMMANDS = {
    UPDATE_PREFERRED_LOCALE: 'UpdatePreferredLocale',
    RECONNECT_APP: 'ReconnectApp',
    OPEN_PROFILE: 'OpenProfile',
    HANDLE_RESTRICTED_EVENT: 'HandleRestrictedEvent',
    OPEN_REPORT: 'OpenReport',
} as const;

type WriteCommand = ValueOf<typeof WRITE_COMMANDS>;

type WriteCommandParameters = {
    [WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE]: UpdatePreferredLocaleParams;
    [WRITE_COMMANDS.RECONNECT_APP]: ReconnectAppParams;
    [WRITE_COMMANDS.OPEN_PROFILE]: OpenProfileParams;
    [WRITE_COMMANDS.HANDLE_RESTRICTED_EVENT]: HandleRestrictedEventParams;
    [WRITE_COMMANDS.OPEN_REPORT]: HandleRestrictedEventParams;
};

const READ_COMMANDS = {
    OPEN_APP: 'OpenApp',
    OPEN_REIMBURSEMENT_ACCOUNT_PAGE: 'OpenReimbursementAccountPage',
    OPEN_WORKSPACE_VIEW: 'OpenWorkspaceView',
    GET_MAPBOX_ACCESS_TOKEN: 'GetMapboxAccessToken',
    OPEN_PAYMENTS_PAGE: 'OpenPaymentsPage',
    OPEN_PERSONAL_DETAILS_PAGE: 'OpenPersonalDetailsPage',
    OPEN_PUBLIC_PROFILE_PAGE: 'OpenPublicProfilePage',
    OPEN_PLAID_BANK_LOGIN: 'OpenPlaidBankLogin',
    OPEN_PLAID_BANK_ACCOUNT_SELECTOR: 'OpenPlaidBankAccountSelector',
    GET_OLDER_ACTIONS: 'GetOlderActions',
    GET_NEWER_ACTIONS: 'GetNewerActions',
    EXPAND_URL_PREVIEW: 'ExpandURLPreview',
    GET_REPORT_PRIVATE_NOTE: 'GetReportPrivateNote',
    OPEN_ROOM_MEMBERS_PAGE: 'OpenRoomMembersPage',
    SEARCH_FOR_REPORTS: 'SearchForReports',
    SEND_PERFORMANCE_TIMING: 'SendPerformanceTiming',
    GET_ROUTE: 'GetRoute',
    GET_ROUTE_FOR_DRAFT: 'GetRouteForDraft',
    GET_STATEMENT_PDF: 'GetStatementPDF',
    OPEN_ONFIDO_FLOW: 'OpenOnfidoFlow',
    OPEN_INITIAL_SETTINGS_PAGE: 'OpenInitialSettingsPage',
    OPEN_ENABLE_PAYMENTS_PAGE: 'OpenEnablePaymentsPage',
    BEGIN_SIGNIN: 'BeginSignIn',
    SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN: 'SignInWithShortLivedAuthToken',
} as const;

type ReadCommand = ValueOf<typeof READ_COMMANDS>;

type ReadCommandParameters = {
    [READ_COMMANDS.OPEN_APP]: OpenAppParams;
    [READ_COMMANDS.OPEN_REIMBURSEMENT_ACCOUNT_PAGE]: OpenReimbursementAccountPageParams;
    [READ_COMMANDS.OPEN_WORKSPACE_VIEW]: EmptyObject;
    [READ_COMMANDS.GET_MAPBOX_ACCESS_TOKEN]: EmptyObject;
    [READ_COMMANDS.OPEN_PAYMENTS_PAGE]: EmptyObject;
    [READ_COMMANDS.OPEN_PERSONAL_DETAILS_PAGE]: EmptyObject;
    [READ_COMMANDS.OPEN_PUBLIC_PROFILE_PAGE]: OpenPublicProfilePageParams;
    [READ_COMMANDS.OPEN_PLAID_BANK_LOGIN]: OpenPlaidBankLoginParams;
    [READ_COMMANDS.OPEN_PLAID_BANK_ACCOUNT_SELECTOR]: OpenPlaidBankAccountSelectorParams;
    [READ_COMMANDS.GET_OLDER_ACTIONS]: GetOlderActionsParams;
    [READ_COMMANDS.GET_NEWER_ACTIONS]: GetNewerActionsParams;
    [READ_COMMANDS.EXPAND_URL_PREVIEW]: ExpandURLPreviewParams;
    [READ_COMMANDS.GET_REPORT_PRIVATE_NOTE]: GetReportPrivateNoteParams;
    [READ_COMMANDS.OPEN_ROOM_MEMBERS_PAGE]: OpenRoomMembersPageParams;
    [READ_COMMANDS.SEARCH_FOR_REPORTS]: SearchForReportsParams;
    [READ_COMMANDS.SEND_PERFORMANCE_TIMING]: SendPerformanceTimingParams;
    [READ_COMMANDS.GET_ROUTE]: GetRouteParams;
    [READ_COMMANDS.GET_ROUTE_FOR_DRAFT]: GetRouteForDraftParams;
    [READ_COMMANDS.GET_STATEMENT_PDF]: GetStatementPDFParams;
    [READ_COMMANDS.OPEN_ONFIDO_FLOW]: EmptyObject;
    [READ_COMMANDS.OPEN_INITIAL_SETTINGS_PAGE]: EmptyObject;
    [READ_COMMANDS.OPEN_ENABLE_PAYMENTS_PAGE]: EmptyObject;
    [READ_COMMANDS.BEGIN_SIGNIN]: BeginSignInParams;
    [READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN]: SignInWithShortLivedAuthTokenParams;
};

const SIDE_EFFECT_REQUEST_COMMANDS = {
    AUTHENTICATE_PUSHER: 'AuthenticatePusher',
    OPEN_REPORT: 'OpenReport',
    OPEN_OLD_DOT_LINK: 'OpenOldDotLink',
    REVEAL_EXPENSIFY_CARD_DETAILS: 'RevealExpensifyCardDetails',
    GET_MISSING_ONYX_MESSAGES: 'GetMissingOnyxMessages',
    RECONNECT_APP: 'ReconnectApp',
} as const;

type SideEffectRequestCommand = ReadCommand | ValueOf<typeof SIDE_EFFECT_REQUEST_COMMANDS>;

type SideEffectRequestCommandParameters = ReadCommandParameters & {
    [SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER]: AuthenticatePusherParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.OPEN_REPORT]: OpenReportParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK]: OpenOldDotLinkParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_EXPENSIFY_CARD_DETAILS]: RevealExpensifyCardDetailsParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES]: GetMissingOnyxMessagesParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP]: ReconnectAppParams;
};

export {WRITE_COMMANDS, READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS};

export type {ApiRequestWithSideEffects, WriteCommand, WriteCommandParameters, ReadCommand, ReadCommandParameters, SideEffectRequestCommand, SideEffectRequestCommandParameters};
