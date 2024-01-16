import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import type {
    ActivatePhysicalExpensifyCardParams,
    AddNewContactMethodParams,
    AddPaymentCardParams,
    AddPersonalBankAccountParams,
    AddSchoolPrincipalParams,
    AuthenticatePusherParams,
    BankAccountHandlePlaidErrorParams,
    BeginSignInParams,
    CloseAccountParams,
    ConnectBankAccountManuallyParams,
    ConnectBankAccountWithPlaidParams,
    DeleteContactMethodParams,
    DeletePaymentBankAccountParams,
    DeletePaymentCardParams,
    ExpandURLPreviewParams,
    GetMissingOnyxMessagesParams,
    GetNewerActionsParams,
    GetOlderActionsParams,
    GetReportPrivateNoteParams,
    GetRouteForDraftParams,
    GetRouteParams,
    GetStatementPDFParams,
    HandleRestrictedEventParams,
    LogOutParams,
    MakeDefaultPaymentMethodParams,
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
    ReferTeachersUniteVolunteerParams,
    ReportVirtualExpensifyCardFraudParams,
    RequestContactMethodValidateCodeParams,
    RequestNewValidateCodeParams,
    RequestPhysicalExpensifyCardParams,
    RequestReplacementExpensifyCardParams,
    RequestUnlinkValidationLinkParams,
    ResolveActionableMentionWhisperParams,
    RevealExpensifyCardDetailsParams,
    SearchForReportsParams,
    SendPerformanceTimingParams,
    SetContactMethodAsDefaultParams,
    SignInUserWithLinkParams,
    SignInWithShortLivedAuthTokenParams,
    UnlinkLoginParams,
    UpdateAutomaticTimezoneParams,
    UpdateChatPriorityModeParams,
    UpdateDateOfBirthParams,
    UpdateDisplayNameParams,
    UpdateFrequentlyUsedEmojisParams,
    UpdateHomeAddressParams,
    UpdateLegalNameParams,
    UpdateNewsletterSubscriptionParams,
    UpdatePersonalInformationForBankAccountParams,
    UpdatePreferredEmojiSkinToneParams,
    UpdatePreferredLocaleParams,
    UpdatePronounsParams,
    UpdateSelectedTimezoneParams,
    UpdateStatusParams,
    UpdateThemeParams,
    UpdateUserAvatarParams,
    ValidateBankAccountWithTransactionsParams,
    ValidateLoginParams,
    ValidateSecondaryLoginParams,
    VerifyIdentityForBankAccountParams,
} from './parameters';
import type SignInUserParams from './parameters/SignInUserParams';

type ApiRequestWithSideEffects = ValueOf<typeof CONST.API_REQUEST_TYPE, 'MAKE_REQUEST_WITH_SIDE_EFFECTS' | 'READ'>;

const WRITE_COMMANDS = {
    UPDATE_PREFERRED_LOCALE: 'UpdatePreferredLocale',
    RECONNECT_APP: 'ReconnectApp',
    OPEN_PROFILE: 'OpenProfile',
    HANDLE_RESTRICTED_EVENT: 'HandleRestrictedEvent',
    OPEN_REPORT: 'OpenReport',
    DELETE_PAYMENT_BANK_ACCOUNT: 'DeletePaymentBankAccount',
    UPDATE_PERSONAL_INFORMATION_FOR_BANK_ACCOUNT: 'UpdatePersonalInformationForBankAccount',
    VALIDATE_BANK_ACCOUNT_WITH_TRANSACTIONS: 'ValidateBankAccountWithTransactions',
    UPDATE_COMPANY_INFORMATION_FOR_BANK_ACCOUNT: 'UpdateCompanyInformationForBankAccount',
    UPDATE_BENEFICIAL_OWNERS_FOR_BANK_ACCOUNT: 'UpdateBeneficialOwnersForBankAccount',
    CONNECT_BANK_ACCOUNT_MANUALLY: 'ConnectBankAccountManually',
    VERIFY_IDENTITY_FOR_BANK_ACCOUNT: 'VerifyIdentityForBankAccount',
    BANK_ACCOUNT_HANDLE_PLAID_ERROR: 'BankAccount_HandlePlaidError',
    REPORT_VIRTUAL_EXPENSIFY_CARD_FRAUD: 'ReportVirtualExpensifyCardFraud',
    REQUEST_REPLACEMENT_EXPENSIFY_CARD: 'RequestReplacementExpensifyCard',
    ACTIVATE_PHYSICAL_EXPENSIFY_CARD: 'ActivatePhysicalExpensifyCard',
    CHRONOS_REMOVE_OOO_EVENT: 'Chronos_RemoveOOOEvent',
    MAKE_DEFAULT_PAYMENT_METHOD: 'MakeDefaultPaymentMethod',
    ADD_PAYMENT_CARD: 'AddPaymentCard',
    TRANSFER_WALLET_BALANCE: 'TransferWalletBalance',
    DELETE_PAYMENT_CARD: 'DeletePaymentCard',
    UPDATE_PRONOUNS: 'UpdatePronouns',
    UPDATE_DISPLAY_NAME: 'UpdateDisplayName',
    UPDATE_LEGAL_NAME: 'UpdateLegalName',
    UPDATE_DATE_OF_BIRTH: 'UpdateDateOfBirth',
    UPDATE_HOME_ADDRESS: 'UpdateHomeAddress',
    UPDATE_AUTOMATIC_TIMEZONE: 'UpdateAutomaticTimezone',
    UPDATE_SELECTED_TIMEZONE: 'UpdateSelectedTimezone',
    UPDATE_USER_AVATAR: 'UpdateUserAvatar',
    DELETE_USER_AVATAR: 'DeleteUserAvatar',
    REFER_TEACHERS_UNITE_VOLUNTEER: 'ReferTeachersUniteVolunteer',
    ADD_SCHOOL_PRINCIPAL: 'AddSchoolPrincipal',
    CLOSE_ACCOUNT: 'CloseAccount',
    REQUEST_CONTACT_METHOD_VALIDATE_CODE: 'RequestContactMethodValidateCode',
    UPDATE_NEWSLETTER_SUBSCRIPTION: 'UpdateNewsletterSubscription',
    DELETE_CONTACT_METHOD: 'DeleteContactMethod',
    ADD_NEW_CONTACT_METHOD: 'AddNewContactMethod',
    VALIDATE_LOGIN: 'ValidateLogin',
    VALIDATE_SECONDARY_LOGIN: 'ValidateSecondaryLogin',
    UPDATE_PREFERRED_EMOJI_SKIN_TONE: 'UpdatePreferredEmojiSkinTone',
    UPDATE_FREQUENTLY_USED_EMOJIS: 'UpdateFrequentlyUsedEmojis',
    UPDATE_CHAT_PRIORITY_MODE: 'UpdateChatPriorityMode',
    SET_CONTACT_METHOD_AS_DEFAULT: 'SetContactMethodAsDefault',
    UPDATE_THEME: 'UpdateTheme',
    UPDATE_STATUS: 'UpdateStatus',
    CLEAR_STATUS: 'ClearStatus',
    UPDATE_PERSONAL_DETAILS_FOR_WALLET: 'UpdatePersonalDetailsForWallet',
    VERIFY_IDENTITY: 'VerifyIdentity',
    ACCEPT_WALLET_TERMS: 'AcceptWalletTerms',
    ANSWER_QUESTIONS_FOR_WALLET: 'AnswerQuestionsForWallet',
    REQUEST_PHYSICAL_EXPENSIFY_CARD: 'RequestPhysicalExpensifyCard',
    LOG_OUT: 'LogOut',
    REQUEST_ACCOUNT_VALIDATION_LINK: 'RequestAccountValidationLink',
    REQUEST_NEW_VALIDATE_CODE: 'RequestNewValidateCode',
    SIGN_IN_WITH_APPLE: 'SignInWithApple',
    SIGN_IN_WITH_GOOGLE: 'SignInWithGoogle',
    SIGN_IN_USER: 'SigninUser',
    SIGN_IN_USER_WITH_LINK: 'SigninUserWithLink',
    REQUEST_UNLINK_VALIDATION_LINK: 'RequestUnlinkValidationLink',
    UNLINK_LOGIN: 'UnlinkLogin',
    ENABLE_TWO_FACTOR_AUTH: 'EnableTwoFactorAuth',
    DISABLE_TWO_FACTOR_AUTH: 'DisableTwoFactorAuth',
    TWO_FACTOR_AUTH_VALIDATE: 'TwoFactorAuth_Validate',
    ADD_COMMENT: 'AddComment',
    ADD_ATTACHMENT: 'AddAttachment',
    CONNECT_BANK_ACCOUNT_WITH_PLAID: 'ConnectBankAccountWithPlaid',
    ADD_PERSONAL_BANK_ACCOUNT: 'AddPersonalBankAccount',
    OPT_IN_TO_PUSH_NOTIFICATIONS: 'OptInToPushNotifications',
    OPT_OUT_OF_PUSH_NOTIFICATIONS: 'OptOutOfPushNotifications',
    RECONNECT_TO_REPORT: 'ReconnectToReport',
    READ_NEWEST_ACTION: 'ReadNewestAction',
    MARK_AS_UNREAD: 'MarkAsUnread',
    TOGGLE_PINNED_CHAT: 'TogglePinnedChat',
    DELETE_COMMENT: 'DeleteComment',
    UPDATE_COMMENT: 'UpdateComment',
    UPDATE_REPORT_NOTIFICATION_PREFERENCE: 'UpdateReportNotificationPreference',
    UPDATE_WELCOME_MESSAGE: 'UpdateWelcomeMessage',
    UPDATE_REPORT_WRITE_CAPABILITY: 'UpdateReportWriteCapability',
    ADD_WORKSPACE_ROOM: 'AddWorkspaceRoom',
    UPDATE_POLICY_ROOM_NAME: 'UpdatePolicyRoomName',
    ADD_EMOJI_REACTION: 'AddEmojiReaction',
    REMOVE_EMOJI_REACTION: 'RemoveEmojiReaction',
    LEAVE_ROOM: 'LeaveRoom',
    INVITE_TO_ROOM: 'InviteToRoom',
    REMOVE_FROM_ROOM: 'RemoveFromRoom',
    FLAG_COMMENT: 'FlagComment',
    UPDATE_REPORT_PRIVATE_NOTE: 'UpdateReportPrivateNote',
    RESOLVE_ACTIONABLE_MENTION_WHISPER: 'ResolveActionableMentionWhisper',
} as const;

type WriteCommand = ValueOf<typeof WRITE_COMMANDS>;

type WriteCommandParameters = {
    [WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE]: UpdatePreferredLocaleParams;
    [WRITE_COMMANDS.RECONNECT_APP]: ReconnectAppParams;
    [WRITE_COMMANDS.OPEN_PROFILE]: OpenProfileParams;
    [WRITE_COMMANDS.HANDLE_RESTRICTED_EVENT]: HandleRestrictedEventParams;
    [WRITE_COMMANDS.OPEN_REPORT]: OpenReportParams;
    [WRITE_COMMANDS.DELETE_PAYMENT_BANK_ACCOUNT]: DeletePaymentBankAccountParams;
    [WRITE_COMMANDS.UPDATE_PERSONAL_INFORMATION_FOR_BANK_ACCOUNT]: UpdatePersonalInformationForBankAccountParams;
    [WRITE_COMMANDS.VALIDATE_BANK_ACCOUNT_WITH_TRANSACTIONS]: ValidateBankAccountWithTransactionsParams;
    [WRITE_COMMANDS.UPDATE_COMPANY_INFORMATION_FOR_BANK_ACCOUNT]: UpdateCompanyInformationForBankAccountParams;
    [WRITE_COMMANDS.UPDATE_BENEFICIAL_OWNERS_FOR_BANK_ACCOUNT]: UpdateBeneficialOwnersForBankAccountParams;
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY]: ConnectBankAccountManuallyParams;
    [WRITE_COMMANDS.VERIFY_IDENTITY_FOR_BANK_ACCOUNT]: VerifyIdentityForBankAccountParams;
    [WRITE_COMMANDS.BANK_ACCOUNT_HANDLE_PLAID_ERROR]: BankAccountHandlePlaidErrorParams;
    [WRITE_COMMANDS.REPORT_VIRTUAL_EXPENSIFY_CARD_FRAUD]: ReportVirtualExpensifyCardFraudParams;
    [WRITE_COMMANDS.REQUEST_REPLACEMENT_EXPENSIFY_CARD]: RequestReplacementExpensifyCardParams;
    [WRITE_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD]: ActivatePhysicalExpensifyCardParams;
    [WRITE_COMMANDS.MAKE_DEFAULT_PAYMENT_METHOD]: MakeDefaultPaymentMethodParams;
    [WRITE_COMMANDS.ADD_PAYMENT_CARD]: AddPaymentCardParams;
    [WRITE_COMMANDS.DELETE_PAYMENT_CARD]: DeletePaymentCardParams;
    [WRITE_COMMANDS.UPDATE_PRONOUNS]: UpdatePronounsParams;
    [WRITE_COMMANDS.UPDATE_DISPLAY_NAME]: UpdateDisplayNameParams;
    [WRITE_COMMANDS.UPDATE_LEGAL_NAME]: UpdateLegalNameParams;
    [WRITE_COMMANDS.UPDATE_DATE_OF_BIRTH]: UpdateDateOfBirthParams;
    [WRITE_COMMANDS.UPDATE_HOME_ADDRESS]: UpdateHomeAddressParams;
    [WRITE_COMMANDS.UPDATE_AUTOMATIC_TIMEZONE]: UpdateAutomaticTimezoneParams;
    [WRITE_COMMANDS.UPDATE_SELECTED_TIMEZONE]: UpdateSelectedTimezoneParams;
    [WRITE_COMMANDS.UPDATE_USER_AVATAR]: UpdateUserAvatarParams;
    [WRITE_COMMANDS.DELETE_USER_AVATAR]: EmptyObject;
    [WRITE_COMMANDS.REFER_TEACHERS_UNITE_VOLUNTEER]: ReferTeachersUniteVolunteerParams;
    [WRITE_COMMANDS.ADD_SCHOOL_PRINCIPAL]: AddSchoolPrincipalParams;
    [WRITE_COMMANDS.CLOSE_ACCOUNT]: CloseAccountParams;
    [WRITE_COMMANDS.REQUEST_CONTACT_METHOD_VALIDATE_CODE]: RequestContactMethodValidateCodeParams;
    [WRITE_COMMANDS.UPDATE_NEWSLETTER_SUBSCRIPTION]: UpdateNewsletterSubscriptionParams;
    [WRITE_COMMANDS.DELETE_CONTACT_METHOD]: DeleteContactMethodParams;
    [WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD]: AddNewContactMethodParams;
    [WRITE_COMMANDS.VALIDATE_LOGIN]: ValidateLoginParams;
    [WRITE_COMMANDS.VALIDATE_SECONDARY_LOGIN]: ValidateSecondaryLoginParams;
    [WRITE_COMMANDS.UPDATE_PREFERRED_EMOJI_SKIN_TONE]: UpdatePreferredEmojiSkinToneParams;
    [WRITE_COMMANDS.UPDATE_FREQUENTLY_USED_EMOJIS]: UpdateFrequentlyUsedEmojisParams;
    [WRITE_COMMANDS.UPDATE_CHAT_PRIORITY_MODE]: UpdateChatPriorityModeParams;
    [WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT]: SetContactMethodAsDefaultParams;
    [WRITE_COMMANDS.UPDATE_THEME]: UpdateThemeParams;
    [WRITE_COMMANDS.UPDATE_STATUS]: UpdateStatusParams;
    [WRITE_COMMANDS.CLEAR_STATUS]: ClearStatusParams;
    [WRITE_COMMANDS.UPDATE_PERSONAL_DETAILS_FOR_WALLET]: UpdatePersonalDetailsForWalletParams;
    [WRITE_COMMANDS.VERIFY_IDENTITY]: VerifyIdentityParams;
    [WRITE_COMMANDS.ACCEPT_WALLET_TERMS]: AcceptWalletTermsParams;
    [WRITE_COMMANDS.ANSWER_QUESTIONS_FOR_WALLET]: AnswerQuestionsForWalletParams;
    [WRITE_COMMANDS.REQUEST_PHYSICAL_EXPENSIFY_CARD]: RequestPhysicalExpensifyCardParams;
    [WRITE_COMMANDS.LOG_OUT]: LogOutParams;
    [WRITE_COMMANDS.REQUEST_ACCOUNT_VALIDATION_LINK]: RequestAccountValidationLinkParams;
    [WRITE_COMMANDS.REQUEST_NEW_VALIDATE_CODE]: RequestNewValidateCodeParams;
    [WRITE_COMMANDS.SIGN_IN_WITH_APPLE]: SignInWithAppleParams;
    [WRITE_COMMANDS.SIGN_IN_WITH_GOOGLE]: SignInWithGoogleParams;
    [WRITE_COMMANDS.SIGN_IN_USER]: SignInUserParams;
    [WRITE_COMMANDS.SIGN_IN_USER_WITH_LINK]: SignInUserWithLinkParams;
    [WRITE_COMMANDS.REQUEST_UNLINK_VALIDATION_LINK]: RequestUnlinkValidationLinkParams;
    [WRITE_COMMANDS.UNLINK_LOGIN]: UnlinkLoginParams;
    [WRITE_COMMANDS.ENABLE_TWO_FACTOR_AUTH]: EnableTwoFactorAuthParams;
    [WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH]: DisableTwoFactorAuthParams;
    [WRITE_COMMANDS.TWO_FACTOR_AUTH_VALIDATE]: TwoFactorAuthValidateParams;
    [WRITE_COMMANDS.ADD_COMMENT]: AddCommentParams;
    [WRITE_COMMANDS.ADD_ATTACHMENT]: AddAttachmentParams;
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID]: ConnectBankAccountWithPlaidParams;
    [WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT]: AddPersonalBankAccountParams;
    [WRITE_COMMANDS.OPT_IN_TO_PUSH_NOTIFICATIONS]: OptInToPushNotificationsParams;
    [WRITE_COMMANDS.OPT_OUT_OF_PUSH_NOTIFICATIONS]: OptOutOfPushNotificationsParams;
    [WRITE_COMMANDS.RECONNECT_TO_REPORT]: ReconnectToReportParams;
    [WRITE_COMMANDS.READ_NEWEST_ACTION]: ReadNewestActionParams;
    [WRITE_COMMANDS.MARK_AS_UNREAD]: MarkAsUnreadParams;
    [WRITE_COMMANDS.TOGGLE_PINNED_CHAT]: TogglePinnedChatParams;
    [WRITE_COMMANDS.DELETE_COMMENT]: DeleteCommentParams;
    [WRITE_COMMANDS.UPDATE_COMMENT]: UpdateCommentParams;
    [WRITE_COMMANDS.UPDATE_REPORT_NOTIFICATION_PREFERENCE]: UpdateReportNotificationPreferenceParams;
    [WRITE_COMMANDS.UPDATE_WELCOME_MESSAGE]: UpdateWelcomeMessageParams;
    [WRITE_COMMANDS.UPDATE_REPORT_WRITE_CAPABILITY]: UpdateReportWriteCapabilityParams;
    [WRITE_COMMANDS.ADD_WORKSPACE_ROOM]: AddWorkspaceRoomParams;
    [WRITE_COMMANDS.UPDATE_POLICY_ROOM_NAME]: UpdatePolicyRoomNameParams;
    [WRITE_COMMANDS.ADD_EMOJI_REACTION]: AddEmojiReactionParams;
    [WRITE_COMMANDS.REMOVE_EMOJI_REACTION]: RemoveEmojiReactionParams;
    [WRITE_COMMANDS.LEAVE_ROOM]: LeaveRoomParams;
    [WRITE_COMMANDS.INVITE_TO_ROOM]: InviteToRoomParams;
    [WRITE_COMMANDS.REMOVE_FROM_ROOM]: RemoveFromRoomParams;
    [WRITE_COMMANDS.FLAG_COMMENT]: FlagCommentParams;
    [WRITE_COMMANDS.UPDATE_REPORT_PRIVATE_NOTE]: UpdateReportPrivateNoteParams;
    [WRITE_COMMANDS.RESOLVE_ACTIONABLE_MENTION_WHISPER]: ResolveActionableMentionWhisperParams;
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
