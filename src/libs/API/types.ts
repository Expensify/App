import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {SageIntacctMappingValue} from '@src/types/onyx/Policy';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
// We have to disable eslint for this import because otherwise the import will be 300 lines long
// eslint-disable-next-line no-restricted-syntax
import type * as Parameters from './parameters';
import type SignInUserParams from './parameters/SignInUserParams';
import type UpdateBeneficialOwnersForBankAccountParams from './parameters/UpdateBeneficialOwnersForBankAccountParams';

type ApiRequestType = ValueOf<typeof CONST.API_REQUEST_TYPE>;

const WRITE_COMMANDS = {
    CLEAN_POLICY_TAGS: 'ClearPolicyTags',
    IMPORT_MULTI_LEVEL_TAGS: 'ImportMultiLevelTags',
    SET_WORKSPACE_AUTO_HARVESTING: 'SetWorkspaceAutoHarvesting',
    SET_WORKSPACE_AUTO_REPORTING_FREQUENCY: 'SetWorkspaceAutoReportingFrequency',
    SET_WORKSPACE_AUTO_REPORTING_MONTHLY_OFFSET: 'SetWorkspaceAutoReportingOffset',
    SET_WORKSPACE_APPROVAL_MODE: 'SetWorkspaceApprovalMode',
    SET_WORKSPACE_PAYER: 'SetWorkspacePayer',
    SET_WORKSPACE_REIMBURSEMENT: 'SetWorkspaceReimbursement',
    SET_POLICY_DEFAULT_REPORT_TITLE: 'SetPolicyDefaultReportTitle',
    SET_POLICY_PREVENT_MEMBER_CREATED_TITLE: 'SetPolicyPreventMemberCreatedTitle',
    SET_POLICY_PREVENT_SELF_APPROVAL: 'SetPolicyPreventSelfApproval',
    SET_POLICY_AUTOMATIC_APPROVAL_LIMIT: 'SetPolicyAutomaticApprovalLimit',
    SET_POLICY_AUTOMATIC_APPROVAL_RATE: 'SetPolicyAutomaticApprovalRate',
    SET_POLICY_AUTO_REIMBURSEMENT_LIMIT: 'SetPolicyAutoReimbursementLimit',
    ENABLE_POLICY_AUTO_REIMBURSEMENT_LIMIT: 'EnablePolicyAutoReimbursementLimit',
    ENABLE_POLICY_AUTO_APPROVAL_OPTIONS: 'EnablePolicyAutoApprovalOptions',
    SET_WORKSPACE_DEFAULT_SPEND_CATEGORY: 'SetPolicyDefaultSpendCategory',
    DISMISS_REFERRAL_BANNER: 'DismissReferralBanner',
    UPDATE_PREFERRED_LOCALE: 'UpdatePreferredLocale',
    OPEN_APP: 'OpenApp',
    RECONNECT_APP: 'ReconnectApp',
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
    RESOLVE_FRAUD_ALERT: 'ResolveFraudAlert',
    UPDATE_EXPENSIFY_CARD_LIMIT: 'UpdateExpensifyCardLimit',
    UPDATE_EXPENSIFY_CARD_TITLE: 'UpdateExpensifyCardTitle',
    UPDATE_EXPENSIFY_CARD_LIMIT_TYPE: 'UpdateExpensifyCardLimitType',
    CARD_DEACTIVATE: 'Card_Deactivate',
    CHRONOS_REMOVE_OOO_EVENT: 'Chronos_RemoveOOOEvent',
    MAKE_DEFAULT_PAYMENT_METHOD: 'MakeDefaultPaymentMethod',
    TOGGLE_WORKSPACE_UBER_AUTO_INVITE: 'ToggleWorkspaceUberAutoInvite',
    SET_WORKSPACE_UBER_CENTRAL_BILL: 'SetWorkspaceUberCentralBill',
    TOGGLE_WORKSPACE_UBER_AUTO_REMOVE: 'ToggleWorkspaceUberAutoRemove',
    ADD_PAYMENT_CARD: 'AddPaymentCard',
    ADD_PAYMENT_CARD_SCA: 'AddPaymentCardSCA',
    VERIFY_SETUP_INTENT: 'User_VerifySetupIntent',
    VERIFY_SETUP_INTENT_AND_REQUEST_POLICY_OWNER_CHANGE: 'VerifySetupIntentAndRequestPolicyOwnerChange',
    TRANSFER_WALLET_BALANCE: 'TransferWalletBalance',
    DELETE_PAYMENT_CARD: 'DeletePaymentCard',
    UPDATE_PRONOUNS: 'UpdatePronouns',
    UPDATE_DISPLAY_NAME: 'UpdateDisplayName',
    UPDATE_LEGAL_NAME: 'UpdateLegalName',
    UPDATE_DATE_OF_BIRTH: 'UpdateDateOfBirth',
    UPDATE_PHONE_NUMBER: 'UpdatePhoneNumber',
    UPDATE_HOME_ADDRESS: 'UpdateHomeAddress',
    UPDATE_POLICY_ADDRESS: 'SetPolicyAddress',
    UPDATE_AUTOMATIC_TIMEZONE: 'UpdateAutomaticTimezone',
    UPDATE_SELECTED_TIMEZONE: 'UpdateSelectedTimezone',
    UPDATE_USER_AVATAR: 'UpdateUserAvatar',
    UPDATE_GROUP_CHAT_AVATAR: 'UpdateGroupChatAvatar',
    UPDATE_ROOM_AVATAR: 'UpdateRoomAvatar',
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
    UPDATE_CHAT_PRIORITY_MODE: 'UpdateChatPriorityMode',
    TOGGLE_PLATFORM_MUTE: 'TogglePlatformMute',
    SET_CONTACT_METHOD_AS_DEFAULT: 'SetContactMethodAsDefault',
    UPDATE_THEME: 'UpdateTheme',
    UPDATE_STATUS: 'UpdateStatus',
    CLEAR_STATUS: 'ClearStatus',
    UPDATE_PERSONAL_DETAILS_FOR_WALLET: 'UpdatePersonalDetailsForWallet',
    VERIFY_IDENTITY: 'VerifyIdentity',
    ACCEPT_WALLET_TERMS: 'AcceptWalletTerms',
    VERIFY_ADD_SECONDARY_LOGIN_CODE: 'VerifyAddSecondaryLoginCode',
    ANSWER_QUESTIONS_FOR_WALLET: 'AnswerQuestionsForWallet',
    REQUEST_ACCOUNT_VALIDATION_LINK: 'RequestAccountValidationLink',
    REQUEST_NEW_VALIDATE_CODE: 'RequestNewValidateCode',
    SIGN_IN_WITH_APPLE: 'SignInWithApple',
    SIGN_IN_WITH_GOOGLE: 'SignInWithGoogle',
    SIGN_IN_USER: 'SigninUser',
    SIGN_IN_USER_WITH_LINK: 'SigninUserWithLink',
    REQUEST_UNLINK_VALIDATION_LINK: 'RequestUnlinkValidationLink',
    UNSHARE_BANK_ACCOUNT: 'UnshareBankAccount',
    UNLINK_LOGIN: 'UnlinkLogin',
    ENABLE_TWO_FACTOR_AUTH: 'EnableTwoFactorAuth',
    DISABLE_TWO_FACTOR_AUTH: 'DisableTwoFactorAuth',
    ADD_COMMENT: 'AddComment',
    ADD_ATTACHMENT: 'AddAttachment',
    ADD_TEXT_AND_ATTACHMENT: 'AddTextAndAttachment',
    CONNECT_BANK_ACCOUNT_WITH_PLAID: 'ConnectBankAccountWithPlaid',
    ADD_PERSONAL_BANK_ACCOUNT: 'AddPersonalBankAccount',
    RESTART_BANK_ACCOUNT_SETUP: 'RestartBankAccountSetup',
    RESEND_VALIDATE_CODE: 'ResendValidateCode',
    READ_NEWEST_ACTION: 'ReadNewestAction',
    MARK_ALL_MESSAGES_AS_READ: 'MarkAllMessagesAsRead',
    MARK_AS_UNREAD: 'MarkAsUnread',
    TOGGLE_PINNED_CHAT: 'TogglePinnedChat',
    DELETE_COMMENT: 'DeleteComment',
    UPDATE_COMMENT: 'UpdateComment',
    CREATE_APP_REPORT: 'CreateAppReport',
    UPDATE_REPORT_NOTIFICATION_PREFERENCE: 'UpdateReportNotificationPreference',
    UPDATE_ROOM_VISIBILITY: 'UpdateRoomVisibility',
    UPDATE_ROOM_DESCRIPTION: 'UpdateRoomDescription',
    UPDATE_REPORT_WRITE_CAPABILITY: 'UpdateReportWriteCapability',
    ADD_WORKSPACE_ROOM: 'AddWorkspaceRoom',
    UPDATE_POLICY_ROOM_NAME: 'UpdatePolicyRoomName',
    ADD_EMOJI_REACTION: 'AddEmojiReaction',
    REMOVE_EMOJI_REACTION: 'RemoveEmojiReaction',
    LEAVE_ROOM: 'LeaveRoom',
    PUSHER_PING: 'PusherPing',
    LEAVE_GROUP_CHAT: 'LeaveGroupChat',
    INVITE_TO_ROOM: 'InviteToRoom',
    INVITE_TO_GROUP_CHAT: 'InviteToGroupChat',
    UPDATE_TRIP_ROOM_NAME: 'UpdateTripRoomName',
    UPDATE_GROUP_CHAT_NAME: 'UpdateGroupChatName',
    UPDATE_GROUP_CHAT_MEMBER_ROLES: 'UpdateGroupChatMemberRoles',
    REMOVE_FROM_ROOM: 'RemoveFromRoom',
    REMOVE_FROM_GROUP_CHAT: 'RemoveFromGroupChat',
    FLAG_COMMENT: 'FlagComment',
    UPDATE_REPORT_PRIVATE_NOTE: 'UpdateReportPrivateNote',
    RESOLVE_ACTIONABLE_MENTION_WHISPER: 'ResolveActionableMentionWhisper',
    RESOLVE_ACTIONABLE_REPORT_MENTION_WHISPER: 'ResolveActionableReportMentionWhisper',
    DELETE_WORKSPACE: 'DeleteWorkspace',
    DELETE_MEMBERS_FROM_WORKSPACE: 'DeleteMembersFromWorkspace',
    ADD_MEMBERS_TO_WORKSPACE: 'AddMembersToWorkspace',
    UPDATE_WORKSPACE_AVATAR: 'UpdateWorkspaceAvatar',
    DELETE_WORKSPACE_AVATAR: 'DeleteWorkspaceAvatar',
    UPDATE_WORKSPACE_GENERAL_SETTINGS: 'UpdateWorkspaceGeneralSettings',
    UPDATE_WORKSPACE_DESCRIPTION: 'UpdateWorkspaceDescription',
    UPDATE_WORKSPACE_MEMBERS_ROLE: 'UpdateWorkspaceMembersRole',
    CREATE_WORKSPACE: 'CreateWorkspace',
    DUPLICATE_POLICY: 'DuplicatePolicy',
    CREATE_WORKSPACE_FROM_IOU_PAYMENT: 'CreateWorkspaceFromIOUPayment',
    UPDATE_POLICY_MEMBERS_CUSTOM_FIELDS: 'UpdatePolicyMembersCustomFields',
    SET_WORKSPACE_CATEGORIES_ENABLED: 'SetWorkspaceCategoriesEnabled',
    MOVE_IOU_REPORT_TO_POLICY_AND_INVITE_SUBMITTER: 'MoveIOUReportToPolicyAndInviteSubmitter',
    SET_POLICY_TAGS_ENABLED: 'SetPolicyTagsEnabled',
    CREATE_WORKSPACE_CATEGORIES: 'CreateWorkspaceCategories',
    IMPORT_CATEGORIES_SPREADSHEET: 'ImportCategoriesSpreadsheet',
    IMPORT_MEMBERS_SPREADSHEET: 'ImportMembersSpreadsheet',
    IMPORT_TAGS_SPREADSHEET: 'ImportTagsSpreadsheet',
    IMPORT_PER_DIEM_RATES: 'ImportPerDiemRates',
    EXPORT_CATEGORIES_CSV: 'ExportCategoriesCSV',
    EXPORT_MEMBERS_CSV: 'ExportMembersCSV',
    EXPORT_TAGS_CSV: 'ExportSingleLevelTagsCSV',
    EXPORT_MULTI_LEVEL_INDEPENDENT_TAGS_CSV: 'ExportMultiLevelTagsCSV',
    EXPORT_MULTI_LEVEL_DEPENDENT_TAGS_CSV: 'ExportDependentTags',
    EXPORT_PER_DIEM_CSV: 'ExportPerDiemCSV',
    EXPORT_REPORT_TO_CSV: 'ExportReportToCSV',
    MOVE_IOU_REPORT_TO_EXISTING_POLICY: 'MoveIOUReportToExistingPolicy',
    EXPORT_REPORT_TO_PDF: 'ExportReportToPDF',
    RENAME_WORKSPACE_CATEGORY: 'RenameWorkspaceCategory',
    CREATE_POLICY_TAG: 'CreatePolicyTag',
    RENAME_POLICY_TAG: 'RenamePolicyTag',
    SET_WORKSPACE_REQUIRES_CATEGORY: 'SetWorkspaceRequiresCategory',
    UPDATE_POLICY_CATEGORY_PAYROLL_CODE: 'UpdatePolicyCategoryPayrollCode',
    UPDATE_POLICY_CATEGORY_GL_CODE: 'UpdatePolicyCategoryGLCode',
    DELETE_WORKSPACE_CATEGORIES: 'DeleteWorkspaceCategories',
    DELETE_POLICY_REPORT_FIELD: 'DeletePolicyReportField',
    SET_POLICY_TAGS_REQUIRED: 'SetPolicyTagsRequired',
    SET_POLICY_TAG_LISTS_REQUIRED: 'SetPolicyTagListsRequired',
    SET_POLICY_REQUIRES_TAG: 'SetPolicyRequiresTag',
    // cspell:disable-next-line
    RENAME_POLICY_TAG_LIST: 'RenamePolicyTaglist',
    DELETE_POLICY_TAGS: 'DeletePolicyTags',
    UPDATE_POLICY_TAG_GL_CODE: 'UpdatePolicyTagGLCode',
    CREATE_TASK: 'CreateTask',
    CANCEL_TASK: 'CancelTask',
    EDIT_TASK_ASSIGNEE: 'EditTaskAssignee',
    EDIT_TASK: 'EditTask',
    REOPEN_TASK: 'ReopenTask',
    COMPLETE_TASK: 'CompleteTask',
    COMPLETE_GUIDED_SETUP: 'CompleteGuidedSetup',
    SET_NAME_VALUE_PAIR: 'SetNameValuePair',
    SET_REPORT_FIELD: 'Report_SetFields',
    DELETE_REPORT_FIELD: 'RemoveReportField',
    SET_REPORT_NAME: 'RenameReport',
    COMPLETE_SPLIT_BILL: 'CompleteSplitBill',
    UPDATE_MONEY_REQUEST_ATTENDEES: 'UpdateMoneyRequestAttendees',
    UPDATE_MONEY_REQUEST_DATE: 'UpdateMoneyRequestDate',
    UPDATE_MONEY_REQUEST_REIMBURSABLE: 'UpdateMoneyRequestReimbursable',
    UPDATE_MONEY_REQUEST_BILLABLE: 'UpdateMoneyRequestBillable',
    UPDATE_MONEY_REQUEST_MERCHANT: 'UpdateMoneyRequestMerchant',
    UPDATE_MONEY_REQUEST_TAG: 'UpdateMoneyRequestTag',
    UPDATE_MONEY_REQUEST_TAX_AMOUNT: 'UpdateMoneyRequestTaxAmount',
    UPDATE_MONEY_REQUEST_TAX_RATE: 'UpdateMoneyRequestTaxRate',
    UPDATE_MONEY_REQUEST_DISTANCE: 'UpdateMoneyRequestDistance',
    UPDATE_MONEY_REQUEST_DISTANCE_RATE: 'UpdateMoneyRequestDistanceRate',
    UPDATE_MONEY_REQUEST_CATEGORY: 'UpdateMoneyRequestCategory',
    UPDATE_MONEY_REQUEST_DESCRIPTION: 'UpdateMoneyRequestDescription',
    UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY: 'UpdateMoneyRequestAmountAndCurrency',
    HOLD_MONEY_REQUEST: 'HoldRequest',
    UPDATE_BILLING_CARD_CURRENCY: 'UpdateBillingCardCurrency',
    UNHOLD_MONEY_REQUEST: 'UnHoldRequest',
    REQUEST_MONEY: 'RequestMoney',
    CREATE_PER_DIEM_REQUEST: 'CreatePerDiemRequest',
    SPLIT_BILL: 'SplitBill',
    SPLIT_BILL_AND_OPEN_REPORT: 'SplitBillAndOpenReport',
    UPDATE_SPLIT_TRANSACTION: 'UpdateSplitTransaction',
    SPLIT_TRANSACTION: 'Transaction_Split',
    REVERT_SPLIT_TRANSACTION: 'RevertSplitTransaction',
    DELETE_MONEY_REQUEST: 'DeleteMoneyRequest',
    REJECT_MONEY_REQUEST: 'RejectMoneyRequest',
    MARK_TRANSACTION_VIOLATION_AS_RESOLVED: 'MarkTransactionViolationAsResolved',
    CREATE_DISTANCE_REQUEST: 'CreateDistanceRequest',
    START_SPLIT_BILL: 'StartSplitBill',
    SEND_MONEY_ELSEWHERE: 'SendMoneyElsewhere',
    SEND_MONEY_WITH_WALLET: 'SendMoneyWithWallet',
    APPROVE_MONEY_REQUEST: 'ApproveMoneyRequest',
    UNAPPROVE_EXPENSE_REPORT: 'UnapproveExpenseReport',
    REPLACE_RECEIPT: 'ReplaceReceipt',
    SUBMIT_REPORT: 'SubmitReport',
    DETACH_RECEIPT: 'DetachReceipt',
    PAY_MONEY_REQUEST_WITH_WALLET: 'PayMoneyRequestWithWallet',
    PAY_MONEY_REQUEST: 'PayMoneyRequest',
    CANCEL_PAYMENT: 'CancelPayment',
    ACCEPT_ACH_CONTRACT_FOR_BANK_ACCOUNT: 'AcceptACHContractForBankAccount',
    SWITCH_TO_OLD_DOT: 'SwitchToOldDot',
    TRACK_EXPENSE: 'TrackExpense',
    ENABLE_POLICY_CATEGORIES: 'EnablePolicyCategories',
    ENABLE_POLICY_CONNECTIONS: 'EnablePolicyConnections',
    TOGGLE_RECEIPT_PARTNERS: 'TogglePolicyReceiptPartners',
    INVITE_WORKSPACE_EMPLOYEES_TO_UBER: 'InviteWorkspaceEmployeesToUber',
    ENABLE_POLICY_DISTANCE_RATES: 'EnablePolicyDistanceRates',
    ENABLE_POLICY_TRAVEL: 'EnablePolicyTravel',
    ENABLE_POLICY_TAGS: 'EnablePolicyTags',
    ENABLE_POLICY_TAXES: 'EnablePolicyTaxes',
    ENABLE_POLICY_WORKFLOWS: 'EnablePolicyWorkflows',
    ENABLE_POLICY_REPORT_FIELDS: 'EnablePolicyReportFields',
    ENABLE_POLICY_EXPENSIFY_CARDS: 'EnablePolicyExpensifyCards',
    TOGGLE_POLICY_PER_DIEM: 'TogglePolicyPerDiem',
    ENABLE_POLICY_COMPANY_CARDS: 'EnablePolicyCompanyCards',
    ENABLE_POLICY_INVOICING: 'EnablePolicyInvoicing',
    ENABLE_POLICY_TIME_TRACKING: 'EnablePolicyTimeTracking',
    SET_POLICY_RULES_ENABLED: 'SetPolicyRulesEnabled',
    SET_POLICY_MERCHANT_RULE: 'SetPolicyMerchantRule',
    SET_POLICY_EXPENSE_MAX_AMOUNT_NO_RECEIPT: 'SetPolicyExpenseMaxAmountNoReceipt',
    SET_POLICY_EXPENSE_MAX_AMOUNT_NO_ITEMIZED_RECEIPT: 'SetPolicyExpenseMaxAmountNoItemizedReceipt',
    SET_POLICY_EXPENSE_MAX_AMOUNT: 'SetPolicyExpenseMaxAmount',
    SET_POLICY_PROHIBITED_EXPENSES: 'SetPolicyProhibitedExpenses',
    SET_POLICY_EXPENSE_MAX_AGE: ' SetPolicyExpenseMaxAge',
    UPDATE_CUSTOM_RULES: 'UpdateCustomRules',
    SET_POLICY_BILLABLE_MODE: ' SetPolicyBillableMode',
    SET_POLICY_REIMBURSABLE_MODE: 'SetPolicyReimbursableMode',
    DISABLE_POLICY_BILLABLE_MODE: 'DisablePolicyBillableExpenses',
    SET_WORKSPACE_ERECEIPTS_ENABLED: 'SetWorkspaceEReceiptsEnabled',
    SET_POLICY_ATTENDEE_TRACKING_ENABLED: 'SetPolicyAttendeeTrackingEnabled',
    SET_POLICY_REQUIRE_COMPANY_CARDS_ENABLED: 'SetPolicyRequireCompanyCardsEnabled',
    SET_POLICY_CATEGORY_DESCRIPTION_REQUIRED: 'SetPolicyCategoryDescriptionRequired',
    SET_POLICY_CATEGORY_ATTENDEES_REQUIRED: 'SetPolicyCategoryAttendeesRequired',
    SET_WORKSPACE_CATEGORY_DESCRIPTION_HINT: 'SetWorkspaceCategoryDescriptionHint',
    SET_POLICY_CATEGORY_RECEIPTS_REQUIRED: 'SetPolicyCategoryReceiptsRequired',
    REMOVE_POLICY_CATEGORY_RECEIPTS_REQUIRED: 'RemoveWorkspaceCategoryReceiptsRequired',
    SET_POLICY_CATEGORY_ITEMIZED_RECEIPTS_REQUIRED: 'SetPolicyCategoryItemizedReceiptsRequired',
    REMOVE_POLICY_CATEGORY_ITEMIZED_RECEIPTS_REQUIRED: 'RemoveWorkspaceCategoryItemizedReceiptsRequired',
    SET_POLICY_CATEGORY_MAX_AMOUNT: 'SetPolicyCategoryMaxAmount',
    SET_POLICY_CATEGORY_APPROVER: 'SetPolicyCategoryApprover',
    SET_POLICY_CATEGORY_TAX: 'SetPolicyCategoryTax',
    SET_POLICY_TAXES_CURRENCY_DEFAULT: 'SetPolicyCurrencyDefaultTax',
    SET_POLICY_TAXES_FOREIGN_CURRENCY_DEFAULT: 'SetPolicyForeignCurrencyDefaultTax',
    SET_POLICY_CUSTOM_TAX_NAME: 'SetPolicyCustomTaxName',
    JOIN_POLICY_VIA_INVITE_LINK: 'JoinWorkspaceViaInviteLink',
    JOIN_ACCESSIBLE_POLICY: 'JoinAccessiblePolicy',
    ASK_TO_JOIN_POLICY: 'AskToJoinPolicy',
    ACCEPT_JOIN_REQUEST: 'AcceptJoinRequest',
    DECLINE_JOIN_REQUEST: 'DeclineJoinRequest',
    CREATE_POLICY_TAX: 'CreatePolicyTax',
    UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES: 'UpdateQuickbooksOnlineEnableNewCategories',
    UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR: 'UpdateQuickbooksOnlineAutoCreateVendor',
    UPDATE_QUICKBOOKS_ONLINE_REIMBURSABLE_EXPENSES_ACCOUNT: 'UpdateQuickbooksOnlineReimbursableExpensesAccount',
    UPDATE_QUICKBOOKS_ONLINE_RECEIVABLE_ACCOUNT: 'UpdateQuickbooksOnlineReceivableAccount',
    UPDATE_QUICKBOOKS_ONLINE_EXPORT_DATE: 'UpdateQuickbooksOnlineExportDate',
    UPDATE_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD: 'UpdateQuickbooksOnlineAccountingMethod',
    UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_EXPENSES_ACCOUNT: 'UpdateQuickbooksOnlineNonReimbursableExpensesAccount',
    UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID: 'UpdateQuickbooksOnlineCollectionAccountID',
    UPDATE_QUICKBOOKS_ONLINE_SYNC_REIMBURSED_REPORTS: 'UpdateQuickbooksOnlineSyncReimbursedReports',
    UPDATE_QUICKBOOKS_ONLINE_SYNC_TAX: 'UpdateQuickbooksOnlineSyncTax',
    UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS: 'UpdateQuickbooksOnlineSyncLocations',
    UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS: 'UpdateQuickbooksOnlineSyncCustomers',
    UPDATE_QUICKBOOKS_ONLINE_SYNC_CLASSES: 'UpdateQuickbooksOnlineSyncClasses',
    UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR: 'UpdateQuickbooksOnlineNonReimbursableBillDefaultVendor',
    UPDATE_QUICKBOOKS_ONLINE_AUTO_SYNC: 'UpdateQuickbooksOnlineAutoSync',
    UPDATE_QUICKBOOKS_ONLINE_SYNC_PEOPLE: 'UpdateQuickbooksOnlineSyncPeople',
    UPDATE_QUICKBOOKS_ONLINE_REIMBURSEMENT_ACCOUNT_ID: 'UpdateQuickbooksOnlineReimbursementAccountID',
    UPDATE_QUICKBOOKS_ONLINE_EXPORT: 'UpdateQuickbooksOnlineExport',
    UPDATE_QUICKBOOKS_DESKTOP_EXPORT_DATE: 'UpdateQuickbooksDesktopExportDate',
    UPDATE_MANY_POLICY_CONNECTION_CONFIGS: 'UpdateManyPolicyConnectionConfigurations',
    UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'UpdateQuickbooksDesktopNonReimbursableExpensesExportDestination',
    UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_ACCOUNT: 'UpdateQuickbooksDesktopNonReimbursableExpensesAccount',
    UPDATE_QUICKBOOKS_DESKTOP_AUTO_CREATE_VENDOR: 'UpdateQuickbooksDesktopAutoCreateVendor',
    UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR: 'UpdateQuickbooksDesktopNonReimbursableBillDefaultVendor',
    UPDATE_QUICKBOOKS_DESKTOP_AUTO_SYNC: 'UpdateQuickbooksDesktopAutoSync',
    UPDATE_QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD: 'UpdateQuickbooksDesktopAccountingMethod',
    UPDATE_QUICKBOOKS_DESKTOP_EXPORT: 'UpdateQuickbooksDesktopExport',
    UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_ACCOUNT: 'UpdateQuickbooksDesktopReimbursableExpensesAccount',
    UPDATE_QUICKBOOKS_DESKTOP_MARK_CHECKS_TO_BE_PRINTED: 'UpdateQuickbooksDesktopMarkChecksToBePrinted',
    UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'UpdateQuickbooksDesktopReimbursableExpensesExportDestination',
    UPDATE_QUICKBOOKS_DESKTOP_ENABLE_NEW_CATEGORIES: 'UpdateQuickbooksDesktopEnableNewCategories',
    UPDATE_QUICKBOOKS_DESKTOP_SYNC_CLASSES: 'UpdateQuickbooksDesktopSyncClasses',
    UPDATE_QUICKBOOKS_DESKTOP_SYNC_CUSTOMERS: 'UpdateQuickbooksDesktopSyncCustomers',
    UPDATE_QUICKBOOKS_DESKTOP_SYNC_ITEMS: 'UpdateQuickbooksDesktopSyncItems',
    REMOVE_POLICY_CONNECTION: 'RemovePolicyConnection',
    DISCONNECT_WORKSPACE_RECEIPT_PARTNER: 'DisconnectWorkspaceReceiptPartner',
    SET_POLICY_TAXES_ENABLED: 'SetPolicyTaxesEnabled',
    DELETE_POLICY_TAXES: 'DeletePolicyTaxes',
    UPDATE_POLICY_TAX_VALUE: 'UpdatePolicyTaxValue',
    RENAME_POLICY_TAX: 'RenamePolicyTax',
    UPDATE_POLICY_TAX_CODE: 'UpdatePolicyTaxCode',
    CREATE_POLICY_DISTANCE_RATE: 'CreatePolicyDistanceRate',
    REQUEST_WORKSPACE_OWNER_CHANGE: 'RequestWorkspaceOwnerChange',
    ADD_BILLING_CARD_AND_REQUEST_WORKSPACE_OWNER_CHANGE: 'AddBillingCardAndRequestPolicyOwnerChange',
    SET_POLICY_DISTANCE_RATES_UNIT: 'SetPolicyDistanceRatesUnit',
    SET_CUSTOM_UNIT_DEFAULT_CATEGORY: 'SetCustomUnitDefaultCategory',
    ENABLE_DISTANCE_REQUEST_TAX: 'EnableDistanceRequestTax',
    UPDATE_POLICY_DISTANCE_RATE_VALUE: 'UpdatePolicyDistanceRateValue',
    UPDATE_POLICY_DISTANCE_RATE_NAME: 'UpdatePolicyDistanceRateName',
    UPDATE_POLICY_DISTANCE_TAX_RATE_VALUE: 'UpdateDistanceTaxRate',
    UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE: 'UpdateDistanceTaxClaimableValue',
    SET_POLICY_DISTANCE_RATES_ENABLED: 'SetPolicyDistanceRatesEnabled',
    DELETE_POLICY_DISTANCE_RATES: 'DeletePolicyDistanceRates',
    DISMISS_TRACK_EXPENSE_ACTIONABLE_WHISPER: 'DismissActionableWhisper',
    ADD_TRACKED_EXPENSE_TO_POLICY: 'AddTrackedExpenseToPolicy',
    CONVERT_TRACKED_EXPENSE_TO_REQUEST: 'ConvertTrackedExpenseToRequest',
    CATEGORIZE_TRACKED_EXPENSE: 'CategorizeTrackedExpense',
    SHARE_TRACKED_EXPENSE: 'ShareTrackedExpense',
    LEAVE_POLICY: 'LeavePolicy',
    DISMISS_VIOLATION: 'DismissViolation',
    SEND_INVOICE: 'SendInvoice',
    PAY_INVOICE: 'PayInvoice',
    MARK_AS_CASH: 'MarkAsCash',
    MERGE_DUPLICATES: 'MergeDuplicates',
    RESOLVE_DUPLICATES: 'ResolveDuplicates',
    MERGE_TRANSACTION: 'Transaction_Merge',
    UPDATE_SUBSCRIPTION_TYPE: 'UpdateSubscriptionType',
    SIGN_UP_USER: 'SignUpUser',
    UPDATE_SUBSCRIPTION_AUTO_RENEW: 'UpdateSubscriptionAutoRenew',
    UPDATE_SUBSCRIPTION_ADD_NEW_USERS_AUTOMATICALLY: 'UpdateSubscriptionAddNewUsersAutomatically',
    UPDATE_SUBSCRIPTION_SIZE: 'UpdateSubscriptionSize',
    REPORT_EXPORT: 'Report_Export',
    MARK_AS_EXPORTED: 'MarkAsExported',
    UPGRADE_TO_CORPORATE: 'UpgradeToCorporate',
    DOWNGRADE_TO_TEAM: 'Policy_DowngradeToTeam',
    DELETE_MONEY_REQUEST_ON_SEARCH: 'DeleteMoneyRequestOnSearch',
    REJECT_MONEY_REQUEST_IN_BULK: 'RejectMoneyRequestInBulk',
    HOLD_MONEY_REQUEST_ON_SEARCH: 'HoldMoneyRequestOnSearch',
    APPROVE_MONEY_REQUEST_ON_SEARCH: 'ApproveMoneyRequestOnSearch',
    UNHOLD_MONEY_REQUEST_ON_SEARCH: 'UnholdMoneyRequestOnSearch',
    REQUEST_REFUND: 'User_RefundPurchase',
    OPEN_SIDE_PANEL: 'OpenSidePanel',
    CLOSE_SIDE_PANEL: 'CloseSidePanel',
    UPDATE_NETSUITE_SUBSIDIARY: 'UpdateNetSuiteSubsidiary',
    CREATE_WORKSPACE_REPORT_FIELD: 'CreatePolicyReportField',
    UPDATE_WORKSPACE_REPORT_FIELD_INITIAL_VALUE: 'SetPolicyReportFieldDefault',
    ENABLE_WORKSPACE_REPORT_FIELD_LIST_VALUE: 'EnablePolicyReportFieldOption',
    CREATE_WORKSPACE_REPORT_FIELD_LIST_VALUE: 'CreatePolicyReportFieldOption',
    REMOVE_WORKSPACE_REPORT_FIELD_LIST_VALUE: 'RemovePolicyReportFieldOption',
    UPDATE_NETSUITE_SYNC_TAX_CONFIGURATION: 'UpdateNetSuiteSyncTaxConfiguration',
    UPDATE_NETSUITE_CROSS_SUBSIDIARY_CUSTOMER_CONFIGURATION: 'UpdateNetSuiteCrossSubsidiaryCustomerConfiguration',
    UPDATE_NETSUITE_DEPARTMENTS_MAPPING: 'UpdateNetSuiteDepartmentsMapping',
    UPDATE_NETSUITE_CLASSES_MAPPING: 'UpdateNetSuiteClassesMapping',
    UPDATE_NETSUITE_LOCATIONS_MAPPING: 'UpdateNetSuiteLocationsMapping',
    UPDATE_NETSUITE_CUSTOMERS_MAPPING: 'UpdateNetSuiteCustomersMapping',
    UPDATE_NETSUITE_JOBS_MAPPING: 'UpdateNetSuiteJobsMapping',
    UPDATE_NETSUITE_CUSTOMERS_JOBS_MAPPING: 'UpdateNetSuiteCustomersJobsMapping',
    UPDATE_NETSUITE_EXPORTER: 'UpdateNetSuiteExporter',
    UPDATE_NETSUITE_EXPORT_DATE: 'UpdateNetSuiteExportDate',
    UPDATE_NETSUITE_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'UpdateNetSuiteReimbursableExpensesExportDestination',
    UPDATE_NETSUITE_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'UpdateNetSuiteNonreimbursableExpensesExportDestination',
    UPDATE_NETSUITE_DEFAULT_VENDOR: 'UpdateNetSuiteDefaultVendor',
    UPDATE_NETSUITE_REIMBURSABLE_PAYABLE_ACCOUNT: 'UpdateNetSuiteReimbursablePayableAccount',
    UPDATE_NETSUITE_PAYABLE_ACCT: 'UpdateNetSuitePayableAcct',
    UPDATE_NETSUITE_JOURNAL_POSTING_PREFERENCE: 'UpdateNetSuiteJournalPostingPreference',
    UPDATE_NETSUITE_RECEIVABLE_ACCOUNT: 'UpdateNetSuiteReceivableAccount',
    UPDATE_NETSUITE_INVOICE_ITEM_PREFERENCE: 'UpdateNetSuiteInvoiceItemPreference',
    UPDATE_NETSUITE_INVOICE_ITEM: 'UpdateNetSuiteInvoiceItem',
    UPDATE_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT: 'UpdateNetSuiteProvincialTaxPostingAccount',
    UPDATE_NETSUITE_TAX_POSTING_ACCOUNT: 'UpdateNetSuiteTaxPostingAccount',
    UPDATE_NETSUITE_ALLOW_FOREIGN_CURRENCY: 'UpdateNetSuiteAllowForeignCurrency',
    UPDATE_NETSUITE_EXPORT_TO_NEXT_OPEN_PERIOD: 'UpdateNetSuiteExportToNextOpenPeriod',
    UPDATE_NETSUITE_CUSTOM_SEGMENTS: 'UpdateNetSuiteCustomSegments',
    UPDATE_NETSUITE_CUSTOM_LISTS: 'UpdateNetSuiteCustomLists',
    UPDATE_NETSUITE_AUTO_SYNC: 'UpdateNetSuiteAutoSync',
    UPDATE_NETSUITE_SYNC_REIMBURSED_REPORTS: 'UpdateNetSuiteSyncReimbursedReports',
    UPDATE_NETSUITE_SYNC_PEOPLE: 'UpdateNetSuiteSyncPeople',
    UPDATE_NETSUITE_AUTO_CREATE_ENTITIES: 'UpdateNetSuiteAutoCreateEntities',
    UPDATE_NETSUITE_ENABLE_NEW_CATEGORIES: 'UpdateNetSuiteEnableNewCategories',
    UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_ENABLED: 'UpdateNetSuiteCustomFormIDOptionsEnabled',
    UPDATE_NETSUITE_REIMBURSEMENT_ACCOUNT_ID: 'UpdateNetSuiteReimbursementAccountID',
    UPDATE_NETSUITE_COLLECTION_ACCOUNT: 'UpdateNetSuiteCollectionAccount',
    UPDATE_NETSUITE_EXPORT_REPORTS_TO: 'UpdateNetSuiteExportReportsTo',
    UPDATE_NETSUITE_VENDOR_BILLS_TO: 'UpdateNetSuiteExportVendorBillsTo',
    UPDATE_NETSUITE_ACCOUNTING_METHOD: 'UpdateNetSuiteAccountingMethod',
    UPDATE_NETSUITE_JOURNALS_TO: 'UpdateNetSuiteExportJournalsTo',
    UPDATE_NETSUITE_APPROVAL_ACCOUNT: 'UpdateNetSuiteApprovalAccount',
    UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_REIMBURSABLE: 'UpdateNetSuiteCustomFormIDOptionsReimbursable',
    UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_NON_REIMBURSABLE: 'UpdateNetSuiteCustomFormIDOptionsNonReimbursable',
    REQUEST_EXPENSIFY_CARD_LIMIT_INCREASE: 'RequestExpensifyCardLimitIncrease',
    CONNECT_POLICY_TO_SAGE_INTACCT: 'ConnectPolicyToSageIntacct',
    COPY_EXISTING_POLICY_CONNECTION: 'CopyExistingPolicyConnection',
    UPDATE_SAGE_INTACCT_AUTO_SYNC: 'UpdateSageIntacctAutoSync',
    UPDATE_SAGE_INTACCT_ACCOUNTING_METHOD: 'UpdateSageIntacctAccountingMethod',
    UPDATE_SAGE_INTACCT_IMPORT_EMPLOYEES: 'UpdateSageIntacctImportEmployees',
    UPDATE_SAGE_INTACCT_APPROVAL_MODE: 'UpdateSageIntacctApprovalMode',
    UPDATE_SAGE_INTACCT_SYNC_REIMBURSED_REPORTS: 'UpdateSageIntacctSyncReimbursedReports',
    UPDATE_SAGE_INTACCT_SYNC_REIMBURSEMENT_ACCOUNT_ID: 'UpdateSageIntacctSyncReimbursementAccountID',
    CONNECT_POLICY_TO_NETSUITE: 'ConnectPolicyToNetSuite',
    CLEAR_OUTSTANDING_BALANCE: 'ClearOutstandingBalance',
    CANCEL_BILLING_SUBSCRIPTION: 'CancelBillingSubscriptionNewDot',
    UPDATE_SAGE_INTACCT_ENTITY: 'UpdateSageIntacctEntity',
    UPDATE_SAGE_INTACCT_BILLABLE: 'UpdateSageIntacctBillable',
    UPDATE_SAGE_INTACCT_DEPARTMENT_MAPPING: 'UpdateSageIntacctDepartmentsMapping',
    UPDATE_SAGE_INTACCT_CLASSES_MAPPING: 'UpdateSageIntacctClassesMapping',
    UPDATE_SAGE_INTACCT_LOCATIONS_MAPPING: 'UpdateSageIntacctLocationsMapping',
    UPDATE_SAGE_INTACCT_CUSTOMERS_MAPPING: 'UpdateSageIntacctCustomersMapping',
    UPDATE_SAGE_INTACCT_PROJECTS_MAPPING: 'UpdateSageIntacctProjectsMapping',
    UPDATE_SAGE_INTACCT_SYNC_TAX_CONFIGURATION: 'UpdateSageIntacctSyncTaxConfiguration',
    UPDATE_SAGE_INTACCT_TAX_SOLUTION_ID: 'UpdateSageIntacctTaxSolutionID',
    UPDATE_SAGE_INTACCT_USER_DIMENSION: 'UpdateSageIntacctUserDimension',
    UPDATE_SAGE_INTACCT_EXPORTER: 'UpdateSageIntacctExporter',
    UPDATE_SAGE_INTACCT_EXPORT_DATE: 'UpdateSageIntacctExportDate',
    UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'UpdateSageIntacctReimbursableExpensesExportDestination',
    UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'UpdateSageIntacctNonreimbursableExpensesExportDestination',
    UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_REPORT_EXPORT_DEFAULT_VENDOR: 'UpdateSageIntacctReimbursableExpensesReportExportDefaultVendor',
    UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_CREDIT_CARD_CHARGE_EXPORT_DEFAULT_VENDOR: 'UpdateSageIntacctNonreimbursableExpensesCreditCardChargeExportDefaultVendor',
    UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_ACCOUNT: 'UpdateSageIntacctNonreimbursableExpensesExportAccount',
    UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_VENDOR: 'UpdateSageIntacctNonreimbursableExpensesExportVendor',
    REQUEST_TAX_EXEMPTION: 'RequestTaxExemption',
    EXPORT_SEARCH_ITEMS_TO_CSV: 'ExportSearchToCSV',
    QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV: 'QueueExportSearchToCSV',
    QUEUE_EXPORT_SEARCH_WITH_TEMPLATE: 'QueueExportSearchWithTemplate',
    CREATE_WORKSPACE_APPROVAL: 'CreateWorkspaceApproval',
    UPDATE_WORKSPACE_APPROVAL: 'UpdateWorkspaceApproval',
    REMOVE_WORKSPACE_APPROVAL: 'RemoveWorkspaceApproval',
    CONFIGURE_EXPENSIFY_CARDS_FOR_POLICY: 'ConfigureExpensifyCardsForPolicy',
    CREATE_EXPENSIFY_CARD: 'CreateExpensifyCard',
    CREATE_ADMIN_ISSUED_VIRTUAL_CARD: 'CreateAdminIssuedVirtualCard',
    QUEUE_EXPENSIFY_CARD_FOR_BILLING: 'Domain_QueueExpensifyCardForBilling',
    ADD_DELEGATE: 'AddDelegate',
    REMOVE_DELEGATE: 'RemoveDelegate',
    UPDATE_DELEGATE_ROLE: 'UpdateDelegateRole',
    TOGGLE_CARD_CONTINUOUS_RECONCILIATION: 'ToggleCardContinuousReconciliation',
    SET_POLICY_TAG_APPROVER: 'SetPolicyTagApprover',
    SAVE_SEARCH: 'SaveSearch',
    DELETE_SAVED_SEARCH: 'DeleteSavedSearch',
    UPDATE_CARD_SETTLEMENT_FREQUENCY: 'UpdateCardSettlementFrequency',
    UPDATE_CARD_SETTLEMENT_ACCOUNT: 'UpdateCardSettlementAccount',
    UPDATE_XERO_IMPORT_TRACKING_CATEGORIES: 'UpdateXeroImportTrackingCategories',
    UPDATE_XERO_IMPORT_TAX_RATES: 'UpdateXeroImportTaxRates',
    UPDATE_XERO_TENANT_ID: 'UpdateXeroTenantID',
    UPDATE_XERO_MAPPING: 'UpdateXeroMappings',
    UPDATE_XERO_IMPORT_CUSTOMERS: 'UpdateXeroImportCustomers',
    UPDATE_XERO_ENABLE_NEW_CATEGORIES: 'UpdateXeroEnableNewCategories',
    UPDATE_XERO_AUTO_SYNC: 'UpdateXeroAutoSync',
    UPDATE_XERO_ACCOUNTING_METHOD: 'UpdateXeroAccountingMethod',
    UPDATE_XERO_EXPORT_BILL_STATUS: 'UpdateXeroExportBillStatus',
    UPDATE_XERO_EXPORT_BILL_DATE: 'UpdateXeroExportBillDate',
    UPDATE_XERO_EXPORT_EXPORTER: 'UpdateXeroExportExporter',
    UPDATE_XERO_EXPORT_NON_REIMBURSABLE_ACCOUNT: 'UpdateXeroExportNonReimbursableAccount',
    UPDATE_XERO_SYNC_INVOICE_COLLECTIONS_ACCOUNT_ID: 'UpdateXeroSyncInvoiceCollectionsAccountID',
    UPDATE_XERO_SYNC_SYNC_REIMBURSED_REPORTS: 'UpdateXeroSyncSyncReimbursedReports',
    UPDATE_XERO_SYNC_REIMBURSEMENT_ACCOUNT_ID: 'UpdateXeroSyncReimbursementAccountID',
    REQUEST_FEED_SETUP: 'RequestFeedSetup',
    SET_COMPANY_CARD_FEED_NAME: 'SetFeedName',
    DELETE_COMPANY_CARD_FEED: 'RemoveFeed',
    SET_COMPANY_CARD_TRANSACTION_LIABILITY: 'SetFeedTransactionLiability',
    OPEN_POLICY_ADD_CARD_FEED_PAGE: 'OpenPolicyAddCardFeedPage',
    SET_FEED_STATEMENT_PERIOD_END_DAY: 'SetFeedStatementPeriodEndDay',
    ASSIGN_COMPANY_CARD: 'AssignCard',
    UNASSIGN_COMPANY_CARD: 'UnassignCard',
    UPDATE_COMPANY_CARD: 'SyncCard',
    UPDATE_COMPANY_CARD_NAME: 'SetCardName',
    UPDATE_CARD_TRANSACTION_START_DATE: 'UpdateCardTransactionStartDate',
    SET_CARD_EXPORT_ACCOUNT: 'SetCardExportAccount',
    SET_PERSONAL_DETAILS_AND_SHIP_EXPENSIFY_CARDS: 'SetPersonalDetailsAndShipExpensifyCards',
    SET_INVOICING_TRANSFER_BANK_ACCOUNT: 'SetInvoicingTransferBankAccount',
    SELF_TOUR_VIEWED: 'SelfTourViewed',
    UPDATE_INVOICE_COMPANY_NAME: 'UpdateInvoiceCompanyName',
    UPDATE_INVOICE_COMPANY_WEBSITE: 'UpdateInvoiceCompanyWebsite',
    GET_CORPAY_BANK_ACCOUNT_FIELDS: 'GetCorpayBankAccountFields',
    BANK_ACCOUNT_CREATE_CORPAY: 'BankAccount_CreateCorpay',
    SHARE_BANK_ACCOUNT: 'ShareBankAccount',
    UPDATE_WORKSPACE_CUSTOM_UNIT: 'UpdateWorkspaceCustomUnit',
    GET_ACCESSIBLE_POLICIES: 'GetAccessibleDomainPoliciesForOnyx',
    VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES: 'ValidateUserAndGetAccessiblePolicies',
    DISMISS_PRODUCT_TRAINING: 'DismissProductTraining',
    GET_VALIDATE_CODE_FOR_ACCOUNT_MERGE: 'GetValidateCodeForAccountMerge',
    MERGE_WITH_VALIDATE_CODE: 'MergeWithValidateCode',
    RESET_SMS_DELIVERY_FAILURE_STATUS: 'ResetSMSDeliveryFailureStatus',
    SAVE_CORPAY_ONBOARDING_COMPANY_DETAILS: 'SaveCorpayOnboardingCompanyDetails',
    SAVE_CORPAY_ONBOARDING_BENEFICIAL_OWNER: 'SaveCorpayOnboardingBeneficialOwner',
    DELETE_APP_REPORT: 'DeleteAppReport',
    ADD_WORK_EMAIL: 'AddWorkEmail',
    SAVE_CORPAY_ONBOARDING_DIRECTOR_INFORMATION: 'SaveCorpayOnboardingDirectorInformation',
    ASK_FOR_CORPAY_SIGNER_INFORMATION: 'AskForCorpaySignerInformation',
    SEND_REMINDER_FOR_CORPAY_SINGER_INFORMATION: 'SendReminderForCorpaySignerInformation',
    CHANGE_REPORT_POLICY: 'ChangeReportPolicy',
    CHANGE_REPORT_POLICY_AND_INVITE_SUBMITTER: 'ChangeReportPolicyAndInviteSubmitter',
    CHANGE_TRANSACTIONS_REPORT: 'ChangeTransactionsReport',
    RETRACT_REPORT: 'RetractReport',
    PAY_AND_DOWNGRADE: 'PayAndDowngrade',
    COMPLETE_CONCIERGE_CALL: 'CompleteConciergeCall',
    FINISH_CORPAY_BANK_ACCOUNT_ONBOARDING: 'FinishCorpayBankAccountOnboarding',
    ENABLE_GLOBAL_REIMBURSEMENTS_FOR_USD_BANK_ACCOUNT: 'EnableGlobalReimbursementsForUSDBankAccount',
    REOPEN_REPORT: 'ReopenReport',
    TRAVEL_SIGNUP_REQUEST: 'RequestTravelAccess',
    DELETE_VACATION_DELEGATE: 'DeleteVacationDelegate',
    IMPORT_PLAID_ACCOUNTS: 'ImportPlaidAccounts',
    ASSIGN_REPORT_TO_ME: 'AssignReportToMe',
    ADD_REPORT_APPROVER: 'AddReportApprover',
    REQUEST_UNLOCK_ACCOUNT: 'RequestUnlockAccount',
    RESPOND_TO_PROACTIVE_APP_REVIEW: 'RespondToProactiveAppReview',
    SEND_SCHEDULE_CALL_NUDGE: 'SendScheduleCallNudge',
    VALIDATE_DOMAIN: 'ValidateDomain',
    SET_SAML_IDENTITY: 'SetSAMLIdentity',
    UPDATE_SAML_ENABLED: 'UpdateSAMLEnabled',
    UPDATE_SAML_REQUIRED: 'UpdateSAMLRequired',
    CREATE_DOMAIN: 'CreateDomain',
    ADD_DOMAIN_MEMBER: 'AddDomainMember',
    SET_TECHNICAL_CONTACT_EMAIL: 'SetTechnicalContactEmail',
    TOGGLE_CONSOLIDATED_DOMAIN_BILLING: 'ToggleConsolidatedDomainBilling',
    ADD_DOMAIN_ADMIN: 'AddDomainAdmin',
    REMOVE_DOMAIN_ADMIN: 'RemoveDomainAdmin',
    DELETE_DOMAIN: 'DeleteDomain',
} as const;

type WriteCommand = ValueOf<typeof WRITE_COMMANDS>;

type WriteCommandParameters = {
    [WRITE_COMMANDS.CLEAN_POLICY_TAGS]: Parameters.CleanPolicyTagsParams;
    [WRITE_COMMANDS.IMPORT_MULTI_LEVEL_TAGS]: Parameters.ImportMultiLevelTagsParams;
    [WRITE_COMMANDS.DISMISS_REFERRAL_BANNER]: Parameters.DismissReferralBannerParams;
    [WRITE_COMMANDS.UPDATE_PREFERRED_LOCALE]: Parameters.UpdatePreferredLocaleParams;
    [WRITE_COMMANDS.RECONNECT_APP]: Parameters.ReconnectAppParams;
    [WRITE_COMMANDS.OPEN_APP]: Parameters.OpenAppParams;
    [WRITE_COMMANDS.HANDLE_RESTRICTED_EVENT]: Parameters.HandleRestrictedEventParams;
    [WRITE_COMMANDS.OPEN_REPORT]: Parameters.OpenReportParams;
    [WRITE_COMMANDS.DELETE_PAYMENT_BANK_ACCOUNT]: Parameters.DeletePaymentBankAccountParams;
    [WRITE_COMMANDS.UPDATE_PERSONAL_INFORMATION_FOR_BANK_ACCOUNT]: Parameters.UpdatePersonalInformationForBankAccountParams;
    [WRITE_COMMANDS.VALIDATE_BANK_ACCOUNT_WITH_TRANSACTIONS]: Parameters.ValidateBankAccountWithTransactionsParams;
    [WRITE_COMMANDS.UPDATE_COMPANY_INFORMATION_FOR_BANK_ACCOUNT]: Parameters.UpdateCompanyInformationForBankAccountParams;
    [WRITE_COMMANDS.UPDATE_BENEFICIAL_OWNERS_FOR_BANK_ACCOUNT]: UpdateBeneficialOwnersForBankAccountParams;
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY]: Parameters.ConnectBankAccountParams;
    [WRITE_COMMANDS.VERIFY_IDENTITY_FOR_BANK_ACCOUNT]: Parameters.VerifyIdentityForBankAccountParams;
    [WRITE_COMMANDS.BANK_ACCOUNT_HANDLE_PLAID_ERROR]: Parameters.BankAccountHandlePlaidErrorParams;
    [WRITE_COMMANDS.REPORT_VIRTUAL_EXPENSIFY_CARD_FRAUD]: Parameters.ReportVirtualExpensifyCardFraudParams;
    [WRITE_COMMANDS.REQUEST_REPLACEMENT_EXPENSIFY_CARD]: Parameters.RequestReplacementExpensifyCardParams;
    [WRITE_COMMANDS.RESOLVE_FRAUD_ALERT]: Parameters.ResolveFraudAlertParams;
    [WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT]: Parameters.UpdateExpensifyCardLimitParams;
    [WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_TITLE]: Parameters.UpdateExpensifyCardTitleParams;
    [WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT_TYPE]: Parameters.UpdateExpensifyCardLimitTypeParams;
    [WRITE_COMMANDS.CARD_DEACTIVATE]: Parameters.CardDeactivateParams;
    [WRITE_COMMANDS.MAKE_DEFAULT_PAYMENT_METHOD]: Parameters.MakeDefaultPaymentMethodParams;
    [WRITE_COMMANDS.TOGGLE_WORKSPACE_UBER_AUTO_INVITE]: Parameters.TogglePolicyUberAutoInvitePageParams;
    [WRITE_COMMANDS.SET_WORKSPACE_UBER_CENTRAL_BILL]: Parameters.ChangePolicyUberBillingAccountPageParams;
    [WRITE_COMMANDS.TOGGLE_WORKSPACE_UBER_AUTO_REMOVE]: Parameters.TogglePolicyUberAutoRemovePageParams;
    [WRITE_COMMANDS.ADD_PAYMENT_CARD]: Parameters.AddPaymentCardParams;
    [WRITE_COMMANDS.ADD_PAYMENT_CARD_SCA]: Parameters.AddPaymentCardParams;
    [WRITE_COMMANDS.VERIFY_SETUP_INTENT]: Parameters.VerifySetupIntentParams;
    [WRITE_COMMANDS.VERIFY_SETUP_INTENT_AND_REQUEST_POLICY_OWNER_CHANGE]: Parameters.VerifySetupIntentAndRequestPolicyOwnerChangeParams;
    [WRITE_COMMANDS.DELETE_PAYMENT_CARD]: Parameters.DeletePaymentCardParams;
    [WRITE_COMMANDS.UPDATE_PRONOUNS]: Parameters.UpdatePronounsParams;
    [WRITE_COMMANDS.UPDATE_DISPLAY_NAME]: Parameters.UpdateDisplayNameParams;
    [WRITE_COMMANDS.UPDATE_LEGAL_NAME]: Parameters.UpdateLegalNameParams;
    [WRITE_COMMANDS.UPDATE_DATE_OF_BIRTH]: Parameters.UpdateDateOfBirthParams;
    [WRITE_COMMANDS.VERIFY_ADD_SECONDARY_LOGIN_CODE]: Parameters.VerifyAddSecondaryLoginCodeParams;
    [WRITE_COMMANDS.UPDATE_PHONE_NUMBER]: Parameters.UpdatePhoneNumberParams;
    [WRITE_COMMANDS.UPDATE_POLICY_ADDRESS]: Parameters.UpdatePolicyAddressParams;
    [WRITE_COMMANDS.UPDATE_HOME_ADDRESS]: Parameters.UpdateHomeAddressParams;
    [WRITE_COMMANDS.UPDATE_AUTOMATIC_TIMEZONE]: Parameters.UpdateAutomaticTimezoneParams;
    [WRITE_COMMANDS.UPDATE_SELECTED_TIMEZONE]: Parameters.UpdateSelectedTimezoneParams;
    [WRITE_COMMANDS.UPDATE_USER_AVATAR]: Parameters.UpdateUserAvatarParams;
    [WRITE_COMMANDS.DELETE_USER_AVATAR]: null;
    [WRITE_COMMANDS.REFER_TEACHERS_UNITE_VOLUNTEER]: Parameters.ReferTeachersUniteVolunteerParams;
    [WRITE_COMMANDS.ADD_SCHOOL_PRINCIPAL]: Parameters.AddSchoolPrincipalParams;
    [WRITE_COMMANDS.CLOSE_ACCOUNT]: Parameters.CloseAccountParams;
    [WRITE_COMMANDS.REQUEST_CONTACT_METHOD_VALIDATE_CODE]: Parameters.RequestContactMethodValidateCodeParams;
    [WRITE_COMMANDS.UPDATE_NEWSLETTER_SUBSCRIPTION]: Parameters.UpdateNewsletterSubscriptionParams;
    [WRITE_COMMANDS.DELETE_CONTACT_METHOD]: Parameters.DeleteContactMethodParams;
    [WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD]: Parameters.AddNewContactMethodParams;
    [WRITE_COMMANDS.VALIDATE_LOGIN]: Parameters.ValidateLoginParams;
    [WRITE_COMMANDS.VALIDATE_SECONDARY_LOGIN]: Parameters.ValidateSecondaryLoginParams;
    [WRITE_COMMANDS.UPDATE_PREFERRED_EMOJI_SKIN_TONE]: Parameters.UpdatePreferredEmojiSkinToneParams;
    [WRITE_COMMANDS.UPDATE_CHAT_PRIORITY_MODE]: Parameters.UpdateChatPriorityModeParams;
    [WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT]: Parameters.SetContactMethodAsDefaultParams;
    [WRITE_COMMANDS.TOGGLE_PLATFORM_MUTE]: Parameters.TogglePlatformMuteParams;
    [WRITE_COMMANDS.UPDATE_THEME]: Parameters.UpdateThemeParams;
    [WRITE_COMMANDS.UPDATE_STATUS]: Parameters.UpdateStatusParams;
    [WRITE_COMMANDS.CLEAR_STATUS]: null;
    [WRITE_COMMANDS.UPDATE_PERSONAL_DETAILS_FOR_WALLET]: Parameters.UpdatePersonalDetailsForWalletParams;
    [WRITE_COMMANDS.REQUEST_FEED_SETUP]: Parameters.RequestFeedSetupParams;
    [WRITE_COMMANDS.SET_COMPANY_CARD_FEED_NAME]: Parameters.SetCompanyCardFeedName;
    [WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED]: Parameters.DeleteCompanyCardFeed;
    [WRITE_COMMANDS.ASSIGN_COMPANY_CARD]: Parameters.AssignCompanyCardParams;
    [WRITE_COMMANDS.UNASSIGN_COMPANY_CARD]: Parameters.UnassignCompanyCard;
    [WRITE_COMMANDS.UPDATE_COMPANY_CARD]: Parameters.UpdateCompanyCard;
    [WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME]: Parameters.UpdateCompanyCardNameParams;
    [WRITE_COMMANDS.UPDATE_CARD_TRANSACTION_START_DATE]: Parameters.UpdateCardTransactionStartDateParams;
    [WRITE_COMMANDS.SET_CARD_EXPORT_ACCOUNT]: Parameters.SetCompanyCardExportAccountParams;
    [WRITE_COMMANDS.SET_COMPANY_CARD_TRANSACTION_LIABILITY]: Parameters.SetCompanyCardTransactionLiability;
    [WRITE_COMMANDS.OPEN_POLICY_ADD_CARD_FEED_PAGE]: Parameters.OpenPolicyAddCardFeedPageParams;
    [WRITE_COMMANDS.SET_FEED_STATEMENT_PERIOD_END_DAY]: Parameters.SetFeedStatementPeriodEndDayParams;
    [WRITE_COMMANDS.VERIFY_IDENTITY]: Parameters.VerifyIdentityParams;
    [WRITE_COMMANDS.ACCEPT_WALLET_TERMS]: Parameters.AcceptWalletTermsParams;
    [WRITE_COMMANDS.ANSWER_QUESTIONS_FOR_WALLET]: Parameters.AnswerQuestionsForWalletParams;
    [WRITE_COMMANDS.REQUEST_ACCOUNT_VALIDATION_LINK]: Parameters.RequestAccountValidationLinkParams;
    [WRITE_COMMANDS.REQUEST_NEW_VALIDATE_CODE]: Parameters.RequestNewValidateCodeParams;
    [WRITE_COMMANDS.SIGN_IN_WITH_APPLE]: Parameters.BeginAppleSignInParams;
    [WRITE_COMMANDS.SIGN_IN_WITH_GOOGLE]: Parameters.BeginGoogleSignInParams;
    [WRITE_COMMANDS.SIGN_IN_USER]: SignInUserParams;
    [WRITE_COMMANDS.SIGN_IN_USER_WITH_LINK]: Parameters.SignInUserWithLinkParams;
    [WRITE_COMMANDS.REQUEST_UNLINK_VALIDATION_LINK]: Parameters.RequestUnlinkValidationLinkParams;
    [WRITE_COMMANDS.UNLINK_LOGIN]: Parameters.UnlinkLoginParams;
    [WRITE_COMMANDS.ENABLE_TWO_FACTOR_AUTH]: null;
    [WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH]: Parameters.DisableTwoFactorAuthParams;
    [WRITE_COMMANDS.ADD_COMMENT]: Parameters.AddCommentOrAttachmentParams;
    [WRITE_COMMANDS.ADD_ATTACHMENT]: Parameters.AddCommentOrAttachmentParams;
    [WRITE_COMMANDS.CREATE_APP_REPORT]: Parameters.CreateAppReportParams;
    [WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT]: Parameters.AddCommentOrAttachmentParams;
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID]: Parameters.ConnectBankAccountParams;
    [WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT]: Parameters.AddPersonalBankAccountParams;
    [WRITE_COMMANDS.RESTART_BANK_ACCOUNT_SETUP]: Parameters.RestartBankAccountSetupParams;
    [WRITE_COMMANDS.RESEND_VALIDATE_CODE]: null;
    [WRITE_COMMANDS.READ_NEWEST_ACTION]: Parameters.ReadNewestActionParams;
    [WRITE_COMMANDS.MARK_ALL_MESSAGES_AS_READ]: Parameters.MarkAllMessagesAsReadParams;
    [WRITE_COMMANDS.MARK_AS_UNREAD]: Parameters.MarkAsUnreadParams;
    [WRITE_COMMANDS.TOGGLE_PINNED_CHAT]: Parameters.TogglePinnedChatParams;
    [WRITE_COMMANDS.DELETE_COMMENT]: Parameters.DeleteCommentParams;
    [WRITE_COMMANDS.UPDATE_COMMENT]: Parameters.UpdateCommentParams;
    [WRITE_COMMANDS.UPDATE_REPORT_NOTIFICATION_PREFERENCE]: Parameters.UpdateReportNotificationPreferenceParams;
    [WRITE_COMMANDS.UPDATE_ROOM_VISIBILITY]: Parameters.UpdateRoomVisibilityParams;
    [WRITE_COMMANDS.UPDATE_ROOM_DESCRIPTION]: Parameters.UpdateRoomDescriptionParams;
    [WRITE_COMMANDS.DISCONNECT_WORKSPACE_RECEIPT_PARTNER]: Parameters.RemovePolicyReceiptPartnersConnectionParams;
    [WRITE_COMMANDS.UPDATE_REPORT_WRITE_CAPABILITY]: Parameters.UpdateReportWriteCapabilityParams;
    [WRITE_COMMANDS.ADD_WORKSPACE_ROOM]: Parameters.AddWorkspaceRoomParams;
    [WRITE_COMMANDS.UPDATE_POLICY_ROOM_NAME]: Parameters.UpdatePolicyRoomNameParams;
    [WRITE_COMMANDS.ADD_EMOJI_REACTION]: Parameters.AddEmojiReactionParams;
    [WRITE_COMMANDS.REMOVE_EMOJI_REACTION]: Parameters.RemoveEmojiReactionParams;
    [WRITE_COMMANDS.LEAVE_ROOM]: Parameters.LeaveRoomParams;
    [WRITE_COMMANDS.INVITE_TO_ROOM]: Parameters.InviteToRoomParams;
    [WRITE_COMMANDS.INVITE_TO_GROUP_CHAT]: Parameters.InviteToGroupChatParams;
    [WRITE_COMMANDS.UPDATE_GROUP_CHAT_AVATAR]: Parameters.UpdateGroupChatAvatarParams;
    [WRITE_COMMANDS.UPDATE_ROOM_AVATAR]: Parameters.UpdateRoomAvatarParams;
    [WRITE_COMMANDS.PUSHER_PING]: Parameters.PusherPingParams;
    [WRITE_COMMANDS.LEAVE_GROUP_CHAT]: Parameters.LeaveGroupChatParams;
    [WRITE_COMMANDS.REMOVE_FROM_GROUP_CHAT]: Parameters.RemoveFromGroupChatParams;
    [WRITE_COMMANDS.UPDATE_GROUP_CHAT_MEMBER_ROLES]: Parameters.UpdateGroupChatMemberRolesParams;
    [WRITE_COMMANDS.UPDATE_TRIP_ROOM_NAME]: Parameters.UpdateChatNameParams;
    [WRITE_COMMANDS.UPDATE_GROUP_CHAT_NAME]: Parameters.UpdateChatNameParams;
    [WRITE_COMMANDS.REMOVE_FROM_ROOM]: Parameters.RemoveFromRoomParams;
    [WRITE_COMMANDS.FLAG_COMMENT]: Parameters.FlagCommentParams;
    [WRITE_COMMANDS.UPDATE_REPORT_PRIVATE_NOTE]: Parameters.UpdateReportPrivateNoteParams;
    [WRITE_COMMANDS.RESOLVE_ACTIONABLE_MENTION_WHISPER]: Parameters.ResolveActionableMentionWhisperParams;
    [WRITE_COMMANDS.RESOLVE_ACTIONABLE_REPORT_MENTION_WHISPER]: Parameters.ResolveActionableReportMentionWhisperParams;
    [WRITE_COMMANDS.CHRONOS_REMOVE_OOO_EVENT]: Parameters.ChronosRemoveOOOEventParams;
    [WRITE_COMMANDS.TRANSFER_WALLET_BALANCE]: Parameters.TransferWalletBalanceParams;
    [WRITE_COMMANDS.DELETE_WORKSPACE]: Parameters.DeleteWorkspaceParams;
    [WRITE_COMMANDS.DELETE_MEMBERS_FROM_WORKSPACE]: Parameters.DeleteMembersFromWorkspaceParams;
    [WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE]: Parameters.AddMembersToWorkspaceParams;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_AVATAR]: Parameters.UpdateWorkspaceAvatarParams;
    [WRITE_COMMANDS.DELETE_WORKSPACE_AVATAR]: Parameters.DeleteWorkspaceAvatarParams;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_GENERAL_SETTINGS]: Parameters.UpdateWorkspaceGeneralSettingsParams;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_DESCRIPTION]: Parameters.UpdateWorkspaceDescriptionParams;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_MEMBERS_ROLE]: Parameters.UpdateWorkspaceMembersRoleParams;
    [WRITE_COMMANDS.CREATE_WORKSPACE]: Parameters.CreateWorkspaceParams;
    [WRITE_COMMANDS.CREATE_WORKSPACE_FROM_IOU_PAYMENT]: Parameters.CreateWorkspaceFromIOUPaymentParams;
    [WRITE_COMMANDS.UPDATE_POLICY_MEMBERS_CUSTOM_FIELDS]: Parameters.UpdatePolicyMembersCustomFieldsParams;
    [WRITE_COMMANDS.MOVE_IOU_REPORT_TO_EXISTING_POLICY]: Parameters.MoveIOUReportToExistingPolicyParams;
    [WRITE_COMMANDS.SET_WORKSPACE_CATEGORIES_ENABLED]: Parameters.SetWorkspaceCategoriesEnabledParams;
    [WRITE_COMMANDS.MOVE_IOU_REPORT_TO_POLICY_AND_INVITE_SUBMITTER]: Parameters.MoveIOUReportToPolicyAndInviteSubmitterParams;
    [WRITE_COMMANDS.CREATE_WORKSPACE_CATEGORIES]: Parameters.CreateWorkspaceCategoriesParams;
    [WRITE_COMMANDS.IMPORT_CATEGORIES_SPREADSHEET]: Parameters.ImportCategoriesSpreadsheetParams;
    [WRITE_COMMANDS.IMPORT_PER_DIEM_RATES]: Parameters.ImportPerDiemRatesParams;
    [WRITE_COMMANDS.IMPORT_MEMBERS_SPREADSHEET]: Parameters.ImportMembersSpreadsheetParams;
    [WRITE_COMMANDS.IMPORT_TAGS_SPREADSHEET]: Parameters.ImportTagsSpreadsheetParams;
    [WRITE_COMMANDS.EXPORT_CATEGORIES_CSV]: Parameters.ExportCategoriesSpreadsheetParams;
    [WRITE_COMMANDS.EXPORT_MEMBERS_CSV]: Parameters.ExportMembersSpreadsheetParams;
    [WRITE_COMMANDS.EXPORT_TAGS_CSV]: Parameters.ExportTagsSpreadsheetParams;
    [WRITE_COMMANDS.EXPORT_MULTI_LEVEL_INDEPENDENT_TAGS_CSV]: Parameters.ExportMultiLevelTagsSpreadSheetParams;
    [WRITE_COMMANDS.EXPORT_MULTI_LEVEL_DEPENDENT_TAGS_CSV]: Parameters.ExportMultiLevelTagsSpreadSheetParams;
    [WRITE_COMMANDS.EXPORT_PER_DIEM_CSV]: Parameters.ExportPerDiemCSVParams;
    [WRITE_COMMANDS.EXPORT_REPORT_TO_PDF]: Parameters.ExportReportPDFParams;
    [WRITE_COMMANDS.RENAME_WORKSPACE_CATEGORY]: Parameters.RenameWorkspaceCategoriesParams;
    [WRITE_COMMANDS.SET_WORKSPACE_REQUIRES_CATEGORY]: Parameters.SetWorkspaceRequiresCategoryParams;
    [WRITE_COMMANDS.DELETE_WORKSPACE_CATEGORIES]: Parameters.DeleteWorkspaceCategoriesParams;
    [WRITE_COMMANDS.UPDATE_POLICY_CATEGORY_PAYROLL_CODE]: Parameters.UpdatePolicyCategoryPayrollCodeParams;
    [WRITE_COMMANDS.UPDATE_POLICY_CATEGORY_GL_CODE]: Parameters.UpdatePolicyCategoryGLCodeParams;
    [WRITE_COMMANDS.DELETE_POLICY_REPORT_FIELD]: Parameters.DeletePolicyReportField;
    [WRITE_COMMANDS.SET_POLICY_REQUIRES_TAG]: Parameters.SetPolicyRequiresTag;
    [WRITE_COMMANDS.SET_POLICY_TAGS_REQUIRED]: Parameters.SetPolicyTagsRequired;
    [WRITE_COMMANDS.SET_POLICY_TAG_LISTS_REQUIRED]: Parameters.SetPolicyTagListsRequired;
    [WRITE_COMMANDS.RENAME_POLICY_TAG_LIST]: Parameters.RenamePolicyTagListParams;
    [WRITE_COMMANDS.CREATE_POLICY_TAG]: Parameters.CreatePolicyTagsParams;
    [WRITE_COMMANDS.RENAME_POLICY_TAG]: Parameters.RenamePolicyTagsParams;
    [WRITE_COMMANDS.UPDATE_POLICY_TAG_GL_CODE]: Parameters.UpdatePolicyTagGLCodeParams;
    [WRITE_COMMANDS.SHARE_BANK_ACCOUNT]: Parameters.ShareBankAccountParams;
    [WRITE_COMMANDS.SET_POLICY_TAGS_ENABLED]: Parameters.SetPolicyTagsEnabled;
    [WRITE_COMMANDS.DELETE_POLICY_TAGS]: Parameters.DeletePolicyTagsParams;
    [WRITE_COMMANDS.CREATE_TASK]: Parameters.CreateTaskParams;
    [WRITE_COMMANDS.CANCEL_TASK]: Parameters.CancelTaskParams;
    [WRITE_COMMANDS.EDIT_TASK_ASSIGNEE]: Parameters.EditTaskAssigneeParams;
    [WRITE_COMMANDS.EDIT_TASK]: Parameters.EditTaskParams;
    [WRITE_COMMANDS.REOPEN_TASK]: Parameters.ReopenTaskParams;
    [WRITE_COMMANDS.COMPLETE_TASK]: Parameters.CompleteTaskParams;
    [WRITE_COMMANDS.COMPLETE_GUIDED_SETUP]: Parameters.CompleteGuidedSetupParams;
    [WRITE_COMMANDS.SET_NAME_VALUE_PAIR]: Parameters.SetNameValuePairParams;
    [WRITE_COMMANDS.SET_REPORT_FIELD]: Parameters.SetReportFieldParams;
    [WRITE_COMMANDS.SET_REPORT_NAME]: Parameters.SetReportNameParams;
    [WRITE_COMMANDS.DELETE_REPORT_FIELD]: Parameters.DeleteReportFieldParams;
    [WRITE_COMMANDS.COMPLETE_SPLIT_BILL]: Parameters.CompleteSplitBillParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_REIMBURSABLE]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_AMOUNT]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_RATE]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.HOLD_MONEY_REQUEST]: Parameters.HoldMoneyRequestParams;
    [WRITE_COMMANDS.UNHOLD_MONEY_REQUEST]: Parameters.UnHoldMoneyRequestParams;
    [WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY]: Parameters.UpdateMoneyRequestParams;
    [WRITE_COMMANDS.REQUEST_MONEY]: Parameters.RequestMoneyParams;
    [WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST]: Parameters.CreatePerDiemRequestParams;
    [WRITE_COMMANDS.SPLIT_BILL]: Parameters.SplitBillParams;
    [WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT]: Parameters.SplitBillParams;
    [WRITE_COMMANDS.SPLIT_TRANSACTION]: Parameters.SplitTransactionParams;
    [WRITE_COMMANDS.REVERT_SPLIT_TRANSACTION]: Parameters.RevertSplitTransactionParams;
    [WRITE_COMMANDS.UPDATE_SPLIT_TRANSACTION]: Parameters.SplitTransactionParams;
    [WRITE_COMMANDS.DELETE_MONEY_REQUEST]: Parameters.DeleteMoneyRequestParams;
    [WRITE_COMMANDS.REJECT_MONEY_REQUEST]: Parameters.RejectMoneyRequestParams;
    [WRITE_COMMANDS.MARK_TRANSACTION_VIOLATION_AS_RESOLVED]: Parameters.MarkTransactionViolationAsResolvedParams;
    [WRITE_COMMANDS.CREATE_DISTANCE_REQUEST]: Parameters.CreateDistanceRequestParams;
    [WRITE_COMMANDS.START_SPLIT_BILL]: Parameters.StartSplitBillParams;
    [WRITE_COMMANDS.SEND_MONEY_ELSEWHERE]: Parameters.SendMoneyParams;
    [WRITE_COMMANDS.SEND_MONEY_WITH_WALLET]: Parameters.SendMoneyParams;
    [WRITE_COMMANDS.APPROVE_MONEY_REQUEST]: Parameters.ApproveMoneyRequestParams;
    [WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT]: Parameters.UnapproveExpenseReportParams;
    [WRITE_COMMANDS.REPLACE_RECEIPT]: Parameters.ReplaceReceiptParams;
    [WRITE_COMMANDS.SUBMIT_REPORT]: Parameters.SubmitReportParams;
    [WRITE_COMMANDS.DETACH_RECEIPT]: Parameters.DetachReceiptParams;
    [WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET]: Parameters.PayMoneyRequestParams;
    [WRITE_COMMANDS.PAY_MONEY_REQUEST]: Parameters.PayMoneyRequestParams;
    [WRITE_COMMANDS.CANCEL_PAYMENT]: Parameters.CancelPaymentParams;
    [WRITE_COMMANDS.ACCEPT_ACH_CONTRACT_FOR_BANK_ACCOUNT]: Parameters.AcceptACHContractForBankAccount;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_DESCRIPTION]: Parameters.UpdateWorkspaceDescriptionParams;
    [WRITE_COMMANDS.SET_WORKSPACE_AUTO_HARVESTING]: Parameters.SetWorkspaceAutoHarvestingParams;
    [WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_FREQUENCY]: Parameters.SetWorkspaceAutoReportingFrequencyParams;
    [WRITE_COMMANDS.SET_WORKSPACE_AUTO_REPORTING_MONTHLY_OFFSET]: Parameters.SetWorkspaceAutoReportingMonthlyOffsetParams;
    [WRITE_COMMANDS.SET_WORKSPACE_APPROVAL_MODE]: Parameters.SetWorkspaceApprovalModeParams;
    [WRITE_COMMANDS.SET_WORKSPACE_PAYER]: Parameters.SetWorkspacePayerParams;
    [WRITE_COMMANDS.SET_WORKSPACE_REIMBURSEMENT]: Parameters.SetWorkspaceReimbursementParams;
    [WRITE_COMMANDS.SET_POLICY_DEFAULT_REPORT_TITLE]: Parameters.SetPolicyDefaultReportTitleParams;
    [WRITE_COMMANDS.SET_POLICY_PREVENT_MEMBER_CREATED_TITLE]: Parameters.SetPolicyPreventMemberCreatedTitleParams;
    [WRITE_COMMANDS.SET_POLICY_PREVENT_SELF_APPROVAL]: Parameters.SetPolicyPreventSelfApprovalParams;
    [WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_LIMIT]: Parameters.SetPolicyAutomaticApprovalLimitParams;
    [WRITE_COMMANDS.SET_POLICY_AUTOMATIC_APPROVAL_RATE]: Parameters.SetPolicyAutomaticApprovalRateParams;
    [WRITE_COMMANDS.SET_POLICY_AUTO_REIMBURSEMENT_LIMIT]: Parameters.SetPolicyAutoReimbursementLimitParams;
    [WRITE_COMMANDS.ENABLE_POLICY_AUTO_REIMBURSEMENT_LIMIT]: Parameters.EnablePolicyAutoReimbursementLimitParams;
    [WRITE_COMMANDS.ENABLE_POLICY_AUTO_APPROVAL_OPTIONS]: Parameters.EnablePolicyAutoApprovalOptionsParams;
    [WRITE_COMMANDS.SET_WORKSPACE_DEFAULT_SPEND_CATEGORY]: Parameters.SetWorkspaceDefaultSpendCategoryParams;
    [WRITE_COMMANDS.SWITCH_TO_OLD_DOT]: Parameters.SwitchToOldDotParams;
    [WRITE_COMMANDS.TRACK_EXPENSE]: Parameters.TrackExpenseParams;
    [WRITE_COMMANDS.ENABLE_POLICY_CATEGORIES]: Parameters.EnablePolicyCategoriesParams;
    [WRITE_COMMANDS.ENABLE_POLICY_CONNECTIONS]: Parameters.EnablePolicyConnectionsParams;
    [WRITE_COMMANDS.TOGGLE_RECEIPT_PARTNERS]: Parameters.TogglePolicyReceiptPartnersParams;
    [WRITE_COMMANDS.INVITE_WORKSPACE_EMPLOYEES_TO_UBER]: Parameters.InviteWorkspaceEmployeesToUberParams;
    [WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES]: Parameters.EnablePolicyDistanceRatesParams;
    [WRITE_COMMANDS.ENABLE_POLICY_TRAVEL]: Parameters.EnablePolicyTravelParams;
    [WRITE_COMMANDS.ENABLE_POLICY_TAGS]: Parameters.EnablePolicyTagsParams;
    [WRITE_COMMANDS.ENABLE_POLICY_TAXES]: Parameters.EnablePolicyTaxesParams;
    [WRITE_COMMANDS.ENABLE_POLICY_WORKFLOWS]: Parameters.EnablePolicyWorkflowsParams;
    [WRITE_COMMANDS.ENABLE_POLICY_REPORT_FIELDS]: Parameters.EnablePolicyReportFieldsParams;
    [WRITE_COMMANDS.ENABLE_POLICY_EXPENSIFY_CARDS]: Parameters.EnablePolicyExpensifyCardsParams;
    [WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM]: Parameters.TogglePolicyPerDiemParams;
    [WRITE_COMMANDS.ENABLE_POLICY_COMPANY_CARDS]: Parameters.EnablePolicyCompanyCardsParams;
    [WRITE_COMMANDS.ENABLE_POLICY_INVOICING]: Parameters.EnablePolicyInvoicingParams;
    [WRITE_COMMANDS.ENABLE_POLICY_TIME_TRACKING]: Parameters.EnablePolicyTimeTrackingParams;
    [WRITE_COMMANDS.SET_POLICY_RULES_ENABLED]: Parameters.SetPolicyRulesEnabledParams;
    [WRITE_COMMANDS.SET_POLICY_MERCHANT_RULE]: Parameters.SetPolicyMerchantRuleParams;
    [WRITE_COMMANDS.SET_POLICY_REQUIRE_COMPANY_CARDS_ENABLED]: Parameters.SetPolicyRequireCompanyCardsEnabledParams;
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_DESCRIPTION_REQUIRED]: Parameters.SetPolicyCategoryDescriptionRequiredParams;
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_ATTENDEES_REQUIRED]: Parameters.SetPolicyCategoryAttendeesRequiredParams;
    [WRITE_COMMANDS.SET_WORKSPACE_CATEGORY_DESCRIPTION_HINT]: Parameters.SetWorkspaceCategoryDescriptionHintParams;
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_RECEIPTS_REQUIRED]: Parameters.SetPolicyCategoryReceiptsRequiredParams;
    [WRITE_COMMANDS.REMOVE_POLICY_CATEGORY_RECEIPTS_REQUIRED]: Parameters.RemovePolicyCategoryReceiptsRequiredParams;
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_ITEMIZED_RECEIPTS_REQUIRED]: Parameters.SetPolicyCategoryItemizedReceiptsRequiredParams;
    [WRITE_COMMANDS.REMOVE_POLICY_CATEGORY_ITEMIZED_RECEIPTS_REQUIRED]: Parameters.RemovePolicyCategoryItemizedReceiptsRequiredParams;
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_MAX_AMOUNT]: Parameters.SetPolicyCategoryMaxAmountParams;
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_APPROVER]: Parameters.SetPolicyCategoryApproverParams;
    [WRITE_COMMANDS.SET_POLICY_CATEGORY_TAX]: Parameters.SetPolicyCategoryTaxParams;
    [WRITE_COMMANDS.JOIN_POLICY_VIA_INVITE_LINK]: Parameters.JoinPolicyInviteLinkParams;
    [WRITE_COMMANDS.GET_ACCESSIBLE_POLICIES]: null;
    [WRITE_COMMANDS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES]: Parameters.ValidateUserAndGetAccessiblePoliciesParams;
    [WRITE_COMMANDS.ACCEPT_JOIN_REQUEST]: Parameters.AcceptJoinRequestParams;
    [WRITE_COMMANDS.DECLINE_JOIN_REQUEST]: Parameters.DeclineJoinRequestParams;
    [WRITE_COMMANDS.SET_POLICY_TAXES_CURRENCY_DEFAULT]: Parameters.SetPolicyCurrencyDefaultParams;
    [WRITE_COMMANDS.SET_POLICY_CUSTOM_TAX_NAME]: Parameters.SetPolicyCustomTaxNameParams;
    [WRITE_COMMANDS.SET_POLICY_TAG_APPROVER]: Parameters.SetPolicyTagApproverParams;
    [WRITE_COMMANDS.SET_POLICY_TAXES_FOREIGN_CURRENCY_DEFAULT]: Parameters.SetPolicyForeignCurrencyDefaultParams;
    [WRITE_COMMANDS.CREATE_POLICY_TAX]: Parameters.CreatePolicyTaxParams;
    [WRITE_COMMANDS.SET_POLICY_TAXES_ENABLED]: Parameters.SetPolicyTaxesEnabledParams;
    [WRITE_COMMANDS.DELETE_POLICY_TAXES]: Parameters.DeletePolicyTaxesParams;
    [WRITE_COMMANDS.UPDATE_POLICY_TAX_VALUE]: Parameters.UpdatePolicyTaxValueParams;
    [WRITE_COMMANDS.CREATE_POLICY_DISTANCE_RATE]: Parameters.CreatePolicyDistanceRateParams;
    [WRITE_COMMANDS.REQUEST_WORKSPACE_OWNER_CHANGE]: Parameters.RequestWorkspaceOwnerChangeParams;
    [WRITE_COMMANDS.ADD_BILLING_CARD_AND_REQUEST_WORKSPACE_OWNER_CHANGE]: Parameters.AddBillingCardAndRequestWorkspaceOwnerChangeParams;
    [WRITE_COMMANDS.RENAME_POLICY_TAX]: Parameters.RenamePolicyTaxParams;
    [WRITE_COMMANDS.UPDATE_POLICY_TAX_CODE]: Parameters.UpdatePolicyTaxCodeParams;
    [WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_UNIT]: Parameters.SetPolicyDistanceRatesUnitParams;
    [WRITE_COMMANDS.SET_CUSTOM_UNIT_DEFAULT_CATEGORY]: Parameters.SetCustomUnitDefaultCategoryParams;
    [WRITE_COMMANDS.ENABLE_DISTANCE_REQUEST_TAX]: Parameters.EnableDistanceRequestTaxParams;
    [WRITE_COMMANDS.REPORT_EXPORT]: Parameters.ReportExportParams;
    [WRITE_COMMANDS.MARK_AS_EXPORTED]: Parameters.MarkAsExportedParams;
    [WRITE_COMMANDS.REQUEST_EXPENSIFY_CARD_LIMIT_INCREASE]: Parameters.RequestExpensifyCardLimitIncreaseParams;
    [WRITE_COMMANDS.CLEAR_OUTSTANDING_BALANCE]: null;
    [WRITE_COMMANDS.CANCEL_BILLING_SUBSCRIPTION]: Parameters.CancelBillingSubscriptionParams;
    [WRITE_COMMANDS.SET_POLICY_RULES_ENABLED]: Parameters.SetPolicyRulesEnabledParams;
    [WRITE_COMMANDS.SET_POLICY_MERCHANT_RULE]: Parameters.SetPolicyMerchantRuleParams;
    [WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT_NO_RECEIPT]: Parameters.SetPolicyExpenseMaxAmountNoReceipt;
    [WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT_NO_ITEMIZED_RECEIPT]: Parameters.SetPolicyExpenseMaxAmountNoItemizedReceipt;
    [WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AMOUNT]: Parameters.SetPolicyExpenseMaxAmount;
    [WRITE_COMMANDS.SET_POLICY_EXPENSE_MAX_AGE]: Parameters.SetPolicyExpenseMaxAge;
    [WRITE_COMMANDS.UPDATE_CUSTOM_RULES]: Parameters.UpdateCustomRules;
    [WRITE_COMMANDS.SET_POLICY_BILLABLE_MODE]: Parameters.SetPolicyBillableModeParams;
    [WRITE_COMMANDS.SET_POLICY_REIMBURSABLE_MODE]: Parameters.SetPolicyCashExpenseModeParams;
    [WRITE_COMMANDS.DISABLE_POLICY_BILLABLE_MODE]: Parameters.DisablePolicyBillableModeParams;
    [WRITE_COMMANDS.SET_WORKSPACE_ERECEIPTS_ENABLED]: Parameters.SetWorkspaceEReceiptsEnabled;
    [WRITE_COMMANDS.SET_POLICY_ATTENDEE_TRACKING_ENABLED]: Parameters.SetPolicyAttendeeTrackingEnabledParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR]: Parameters.UpdateQuickbooksOnlineAutoCreateVendorParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_TAX]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CLASSES]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSABLE_EXPENSES_ACCOUNT]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_SYNC]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_PEOPLE]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSEMENT_ACCOUNT_ID]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_RECEIVABLE_ACCOUNT]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT_DATE]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_EXPENSES_ACCOUNT]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_REIMBURSED_REPORTS]: Parameters.UpdateQuickbooksOnlineGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD]: Parameters.UpdateQuickbooksOnlineAccountingMethodParams;
    [WRITE_COMMANDS.UPDATE_XERO_ACCOUNTING_METHOD]: Parameters.UpdateXeroAccountingMethodParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD]: Parameters.UpdateQuickbooksDesktopAccountingMethodParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_EXPORT_DATE]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_MARK_CHECKS_TO_BE_PRINTED]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_AUTO_CREATE_VENDOR]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_ACCOUNT]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: Parameters.UpdateQuickbooksDesktopCompanyCardExpenseAccountTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_AUTO_SYNC]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_ACCOUNT]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: Parameters.UpdateQuickbooksDesktopExpensesExportDestinationTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_ENABLE_NEW_CATEGORIES]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_CLASSES]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_CUSTOMERS]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_ITEMS]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_EXPORT]: Parameters.UpdateQuickbooksDesktopGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS]: Parameters.UpdateManyPolicyConnectionConfigurationsParams;
    [WRITE_COMMANDS.REMOVE_POLICY_CONNECTION]: Parameters.RemovePolicyConnectionParams;
    [WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_VALUE]: Parameters.UpdatePolicyDistanceRateValueParams;
    [WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_NAME]: Parameters.UpdatePolicyDistanceRateValueParams;
    [WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_TAX_RATE_VALUE]: Parameters.UpdatePolicyDistanceRateValueParams;
    [WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE]: Parameters.UpdatePolicyDistanceRateValueParams;
    [WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_ENABLED]: Parameters.SetPolicyDistanceRatesEnabledParams;
    [WRITE_COMMANDS.DELETE_POLICY_DISTANCE_RATES]: Parameters.DeletePolicyDistanceRatesParams;
    [WRITE_COMMANDS.DISMISS_TRACK_EXPENSE_ACTIONABLE_WHISPER]: Parameters.DismissTrackExpenseActionableWhisperParams;
    [WRITE_COMMANDS.UPDATE_BILLING_CARD_CURRENCY]: Parameters.UpdateBillingCurrencyParams;
    [WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST]: Parameters.ConvertTrackedExpenseToRequestParams;
    [WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY]: Parameters.AddTrackedExpenseToPolicyParams;
    [WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE]: Parameters.CategorizeTrackedExpenseParams;
    [WRITE_COMMANDS.SHARE_TRACKED_EXPENSE]: Parameters.ShareTrackedExpenseParams;
    [WRITE_COMMANDS.LEAVE_POLICY]: Parameters.LeavePolicyParams;
    [WRITE_COMMANDS.DISMISS_VIOLATION]: Parameters.DismissViolationParams;
    [WRITE_COMMANDS.SEND_INVOICE]: Parameters.SendInvoiceParams;
    [WRITE_COMMANDS.PAY_INVOICE]: Parameters.PayInvoiceParams;
    [WRITE_COMMANDS.MARK_AS_CASH]: Parameters.MarkAsCashParams;
    [WRITE_COMMANDS.DUPLICATE_POLICY]: Parameters.DuplicateWorkspaceParams;
    [WRITE_COMMANDS.MERGE_DUPLICATES]: Parameters.MergeDuplicatesParams;
    [WRITE_COMMANDS.RESOLVE_DUPLICATES]: Parameters.ResolveDuplicatesParams;
    [WRITE_COMMANDS.MERGE_TRANSACTION]: Parameters.MergeTransactionParams;
    [WRITE_COMMANDS.UPDATE_SUBSCRIPTION_TYPE]: Parameters.UpdateSubscriptionTypeParams;
    [WRITE_COMMANDS.UNSHARE_BANK_ACCOUNT]: Parameters.UnshareBankAccountParams;
    [WRITE_COMMANDS.SIGN_UP_USER]: Parameters.SignUpUserParams;
    [WRITE_COMMANDS.UPDATE_SUBSCRIPTION_AUTO_RENEW]: Parameters.UpdateSubscriptionAutoRenewParams;
    [WRITE_COMMANDS.UPDATE_SUBSCRIPTION_ADD_NEW_USERS_AUTOMATICALLY]: Parameters.UpdateSubscriptionAddNewUsersAutomaticallyParams;
    [WRITE_COMMANDS.UPDATE_SUBSCRIPTION_SIZE]: Parameters.UpdateSubscriptionSizeParams;
    [WRITE_COMMANDS.REQUEST_TAX_EXEMPTION]: null;
    [WRITE_COMMANDS.GET_CORPAY_BANK_ACCOUNT_FIELDS]: Parameters.GetCorpayBankAccountFieldsParams;
    [WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_BENEFICIAL_OWNER]: Parameters.SaveCorpayOnboardingBeneficialOwnerParams;
    [WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_DIRECTOR_INFORMATION]: Parameters.SaveCorpayOnboardingDirectorInformationParams;
    [WRITE_COMMANDS.ASK_FOR_CORPAY_SIGNER_INFORMATION]: Parameters.AskForCorpaySignerInformationParams;
    [WRITE_COMMANDS.SEND_REMINDER_FOR_CORPAY_SINGER_INFORMATION]: Parameters.SendReminderForCorpaySignerInformationParams;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT]: Parameters.UpdateWorkspaceCustomUnitParams;
    [WRITE_COMMANDS.RESET_SMS_DELIVERY_FAILURE_STATUS]: Parameters.ResetSMSDeliveryFailureStatusParams;
    [WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_COMPANY_DETAILS]: Parameters.SaveCorpayOnboardingCompanyDetailsParams;
    [WRITE_COMMANDS.SAVE_CORPAY_ONBOARDING_BENEFICIAL_OWNER]: Parameters.SaveCorpayOnboardingBeneficialOwnerParams;
    [WRITE_COMMANDS.SET_POLICY_PROHIBITED_EXPENSES]: Parameters.SetPolicyProhibitedExpensesParams;
    [WRITE_COMMANDS.RETRACT_REPORT]: Parameters.RetractReportParams;
    [WRITE_COMMANDS.COMPLETE_CONCIERGE_CALL]: Parameters.CompleteConciergeCallParams;
    [WRITE_COMMANDS.FINISH_CORPAY_BANK_ACCOUNT_ONBOARDING]: Parameters.FinishCorpayBankAccountOnboardingParams;
    [WRITE_COMMANDS.DELETE_VACATION_DELEGATE]: null;
    [WRITE_COMMANDS.ENABLE_GLOBAL_REIMBURSEMENTS_FOR_USD_BANK_ACCOUNT]: Parameters.EnableGlobalReimbursementsForUSDBankAccountParams;
    [WRITE_COMMANDS.REOPEN_REPORT]: Parameters.ReopenReportParams;
    [WRITE_COMMANDS.SEND_SCHEDULE_CALL_NUDGE]: Parameters.SendScheduleCallNudgeParams;

    [WRITE_COMMANDS.DELETE_MONEY_REQUEST_ON_SEARCH]: Parameters.DeleteMoneyRequestOnSearchParams;
    [WRITE_COMMANDS.REJECT_MONEY_REQUEST_IN_BULK]: Parameters.RejectMoneyRequestInBulkParams;
    [WRITE_COMMANDS.HOLD_MONEY_REQUEST_ON_SEARCH]: Parameters.HoldMoneyRequestOnSearchParams;
    [WRITE_COMMANDS.APPROVE_MONEY_REQUEST_ON_SEARCH]: Parameters.ApproveMoneyRequestOnSearchParams;
    [WRITE_COMMANDS.UNHOLD_MONEY_REQUEST_ON_SEARCH]: Parameters.UnholdMoneyRequestOnSearchParams;
    [WRITE_COMMANDS.BANK_ACCOUNT_CREATE_CORPAY]: Parameters.BankAccountCreateCorpayParams;

    [WRITE_COMMANDS.REQUEST_REFUND]: null;
    [WRITE_COMMANDS.OPEN_SIDE_PANEL]: Parameters.OpenSidePanelParams;
    [WRITE_COMMANDS.CLOSE_SIDE_PANEL]: Parameters.CloseSidePanelParams;
    [WRITE_COMMANDS.CONNECT_POLICY_TO_SAGE_INTACCT]: Parameters.ConnectPolicyToSageIntacctParams;
    [WRITE_COMMANDS.COPY_EXISTING_POLICY_CONNECTION]: Parameters.CopyExistingPolicyConnectionParams;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORTER]: Parameters.UpdateSageIntacctGenericTypeParams<'email', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORT_DATE]: Parameters.UpdateSageIntacctGenericTypeParams<'value', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: Parameters.UpdateSageIntacctGenericTypeParams<'value', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: Parameters.UpdateSageIntacctGenericTypeParams<'value', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_REPORT_EXPORT_DEFAULT_VENDOR]: Parameters.UpdateSageIntacctGenericTypeParams<'vendorID', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_CREDIT_CARD_CHARGE_EXPORT_DEFAULT_VENDOR]: Parameters.UpdateSageIntacctGenericTypeParams<'vendorID', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_ACCOUNT]: Parameters.UpdateSageIntacctGenericTypeParams<'creditCardAccountID', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_VENDOR]: Parameters.UpdateSageIntacctGenericTypeParams<'vendorID', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_AUTO_SYNC]: Parameters.UpdateSageIntacctGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_ACCOUNTING_METHOD]: Parameters.UpdateSageIntacctAccountingMethodParams;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_IMPORT_EMPLOYEES]: Parameters.UpdateSageIntacctGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_APPROVAL_MODE]: Parameters.UpdateSageIntacctGenericTypeParams<'value', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSED_REPORTS]: Parameters.UpdateSageIntacctGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSEMENT_ACCOUNT_ID]: Parameters.UpdateSageIntacctGenericTypeParams<'vendorID', string>;

    [WRITE_COMMANDS.UPGRADE_TO_CORPORATE]: Parameters.UpgradeToCorporateParams;
    [WRITE_COMMANDS.DOWNGRADE_TO_TEAM]: Parameters.DowngradeToTeamParams;

    // Netsuite parameters
    [WRITE_COMMANDS.UPDATE_NETSUITE_SUBSIDIARY]: Parameters.UpdateNetSuiteSubsidiaryParams;
    [WRITE_COMMANDS.CONNECT_POLICY_TO_NETSUITE]: Parameters.ConnectPolicyToNetSuiteParams;

    // Workspace report field parameters
    [WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD]: Parameters.CreateWorkspaceReportFieldParams;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_REPORT_FIELD_INITIAL_VALUE]: Parameters.UpdateWorkspaceReportFieldInitialValueParams;
    [WRITE_COMMANDS.ENABLE_WORKSPACE_REPORT_FIELD_LIST_VALUE]: Parameters.EnableWorkspaceReportFieldListValueParams;
    [WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD_LIST_VALUE]: Parameters.CreateWorkspaceReportFieldListValueParams;
    [WRITE_COMMANDS.REMOVE_WORKSPACE_REPORT_FIELD_LIST_VALUE]: Parameters.RemoveWorkspaceReportFieldListValueParams;

    [WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_TAX_CONFIGURATION]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_TAX_SOLUTION_ID]: Parameters.UpdateNetSuiteGenericTypeParams<'taxSolutionID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CROSS_SUBSIDIARY_CUSTOMER_CONFIGURATION]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_DEPARTMENTS_MAPPING]: Parameters.UpdateNetSuiteGenericTypeParams<'mapping', ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CLASSES_MAPPING]: Parameters.UpdateNetSuiteGenericTypeParams<'mapping', ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_LOCATIONS_MAPPING]: Parameters.UpdateNetSuiteGenericTypeParams<'mapping', ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOMERS_MAPPING]: Parameters.UpdateNetSuiteGenericTypeParams<'mapping', ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_JOBS_MAPPING]: Parameters.UpdateNetSuiteGenericTypeParams<'mapping', ValueOf<typeof CONST.INTEGRATION_ENTITY_MAP_TYPES>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOMERS_JOBS_MAPPING]: Parameters.UpdateNetSuiteCustomersJobsParams;
    [WRITE_COMMANDS.UPDATE_NETSUITE_EXPORTER]: Parameters.UpdateNetSuiteGenericTypeParams<'email', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_DATE]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_EXPORT_DATE>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_EXPORT_DESTINATION>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_DEFAULT_VENDOR]: Parameters.UpdateNetSuiteGenericTypeParams<'vendorID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_PAYABLE_ACCOUNT]: Parameters.UpdateNetSuiteGenericTypeParams<'bankAccountID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_PAYABLE_ACCT]: Parameters.UpdateNetSuiteGenericTypeParams<'bankAccountID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_JOURNAL_POSTING_PREFERENCE]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_RECEIVABLE_ACCOUNT]: Parameters.UpdateNetSuiteGenericTypeParams<'bankAccountID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM_PREFERENCE]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_INVOICE_ITEM_PREFERENCE>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM]: Parameters.UpdateNetSuiteGenericTypeParams<'itemID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT]: Parameters.UpdateNetSuiteGenericTypeParams<'bankAccountID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_TAX_POSTING_ACCOUNT]: Parameters.UpdateNetSuiteGenericTypeParams<'bankAccountID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_ALLOW_FOREIGN_CURRENCY]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_TO_NEXT_OPEN_PERIOD]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_SEGMENTS]: Parameters.UpdateNetSuiteGenericTypeParams<'customSegments', string>; // JSON string NetSuiteCustomSegment[]
    [WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_LISTS]: Parameters.UpdateNetSuiteGenericTypeParams<'customLists', string>; // JSON string NetSuiteCustomList[]
    [WRITE_COMMANDS.UPDATE_NETSUITE_AUTO_SYNC]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_REIMBURSED_REPORTS]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_PEOPLE]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_AUTO_CREATE_ENTITIES]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_ENABLE_NEW_CATEGORIES]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_ENABLED]: Parameters.UpdateNetSuiteGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSEMENT_ACCOUNT_ID]: Parameters.UpdateNetSuiteGenericTypeParams<'bankAccountID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_COLLECTION_ACCOUNT]: Parameters.UpdateNetSuiteGenericTypeParams<'bankAccountID', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_REPORTS_TO]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_REPORTS_APPROVAL_LEVEL>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_VENDOR_BILLS_TO]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_ACCOUNTING_METHOD]: Parameters.UpdateNetSuiteAccountingMethodParams;

    [WRITE_COMMANDS.UPDATE_NETSUITE_JOURNALS_TO]: Parameters.UpdateNetSuiteGenericTypeParams<'value', ValueOf<typeof CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL>>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_APPROVAL_ACCOUNT]: Parameters.UpdateNetSuiteGenericTypeParams<'value', string>;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_REIMBURSABLE]: Parameters.UpdateNetSuiteCustomFormIDParams;
    [WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_NON_REIMBURSABLE]: Parameters.UpdateNetSuiteCustomFormIDParams;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_ENTITY]: Parameters.UpdateSageIntacctGenericTypeParams<'entity', string>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_BILLABLE]: Parameters.UpdateSageIntacctGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_DEPARTMENT_MAPPING]: Parameters.UpdateSageIntacctGenericTypeParams<'mapping', SageIntacctMappingValue>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_CLASSES_MAPPING]: Parameters.UpdateSageIntacctGenericTypeParams<'mapping', SageIntacctMappingValue>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_LOCATIONS_MAPPING]: Parameters.UpdateSageIntacctGenericTypeParams<'mapping', SageIntacctMappingValue>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_CUSTOMERS_MAPPING]: Parameters.UpdateSageIntacctGenericTypeParams<'mapping', SageIntacctMappingValue>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_PROJECTS_MAPPING]: Parameters.UpdateSageIntacctGenericTypeParams<'mapping', SageIntacctMappingValue>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_TAX_CONFIGURATION]: Parameters.UpdateSageIntacctGenericTypeParams<'enabled', boolean>;
    [WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION]: Parameters.UpdateSageIntacctGenericTypeParams<'dimensions', string>;
    [WRITE_COMMANDS.EXPORT_SEARCH_ITEMS_TO_CSV]: Parameters.ExportSearchItemsToCSVParams;
    [WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV]: Parameters.ExportSearchItemsToCSVParams;
    [WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_WITH_TEMPLATE]: Parameters.ExportSearchWithTemplateParams;
    [WRITE_COMMANDS.EXPORT_REPORT_TO_CSV]: Parameters.ExportReportCSVParams;
    [WRITE_COMMANDS.CREATE_WORKSPACE_APPROVAL]: Parameters.CreateWorkspaceApprovalParams;
    [WRITE_COMMANDS.UPDATE_WORKSPACE_APPROVAL]: Parameters.UpdateWorkspaceApprovalParams;
    [WRITE_COMMANDS.REMOVE_WORKSPACE_APPROVAL]: Parameters.RemoveWorkspaceApprovalParams;
    [WRITE_COMMANDS.CONFIGURE_EXPENSIFY_CARDS_FOR_POLICY]: Parameters.ConfigureExpensifyCardsForPolicyParams;
    [WRITE_COMMANDS.CREATE_EXPENSIFY_CARD]: Parameters.CreateExpensifyCardParams;
    [WRITE_COMMANDS.CREATE_ADMIN_ISSUED_VIRTUAL_CARD]: Omit<Parameters.CreateExpensifyCardParams, 'feedCountry'>;
    [WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_FOR_BILLING]: Parameters.QueueExpensifyCardForBillingParams;
    [WRITE_COMMANDS.ADD_DELEGATE]: Parameters.AddDelegateParams;
    [WRITE_COMMANDS.UPDATE_DELEGATE_ROLE]: Parameters.UpdateDelegateRoleParams;
    [WRITE_COMMANDS.REMOVE_DELEGATE]: Parameters.RemoveDelegateParams;
    [WRITE_COMMANDS.TOGGLE_CARD_CONTINUOUS_RECONCILIATION]: Parameters.ToggleCardContinuousReconciliationParams;
    [WRITE_COMMANDS.SAVE_SEARCH]: Parameters.SaveSearchParams;
    [WRITE_COMMANDS.DELETE_SAVED_SEARCH]: Parameters.DeleteSavedSearchParams;
    [WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_FREQUENCY]: Parameters.UpdateCardSettlementFrequencyParams;
    [WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT]: Parameters.UpdateCardSettlementAccountParams;
    [WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_SHIP_EXPENSIFY_CARDS]: Parameters.SetPersonalDetailsAndShipExpensifyCardsParams;
    [WRITE_COMMANDS.SELF_TOUR_VIEWED]: null;

    // Xero API
    [WRITE_COMMANDS.UPDATE_XERO_TENANT_ID]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_IMPORT_TAX_RATES]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_MAPPING]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_IMPORT_TRACKING_CATEGORIES]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_IMPORT_CUSTOMERS]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_ENABLE_NEW_CATEGORIES]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_AUTO_SYNC]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_AUTO_SYNC]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_EXPORT_BILL_STATUS]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_EXPORT_BILL_DATE]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_EXPORT_EXPORTER]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_EXPORT_NON_REIMBURSABLE_ACCOUNT]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_SYNC_INVOICE_COLLECTIONS_ACCOUNT_ID]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_SYNC_SYNC_REIMBURSED_REPORTS]: Parameters.UpdateXeroGenericTypeParams;
    [WRITE_COMMANDS.UPDATE_XERO_SYNC_REIMBURSEMENT_ACCOUNT_ID]: Parameters.UpdateXeroGenericTypeParams;

    // Invoice API
    [WRITE_COMMANDS.SET_INVOICING_TRANSFER_BANK_ACCOUNT]: Parameters.SetInvoicingTransferBankAccountParams;
    [WRITE_COMMANDS.UPDATE_INVOICE_COMPANY_NAME]: Parameters.UpdateInvoiceCompanyNameParams;
    [WRITE_COMMANDS.UPDATE_INVOICE_COMPANY_WEBSITE]: Parameters.UpdateInvoiceCompanyWebsiteParams;

    [WRITE_COMMANDS.JOIN_ACCESSIBLE_POLICY]: Parameters.JoinAccessiblePolicyParams;
    [WRITE_COMMANDS.ASK_TO_JOIN_POLICY]: Parameters.AskToJoinPolicyParams;

    // Dismiss Product Training
    [WRITE_COMMANDS.DISMISS_PRODUCT_TRAINING]: Parameters.DismissProductTrainingParams;
    [WRITE_COMMANDS.DELETE_APP_REPORT]: Parameters.DeleteAppReportParams;
    [WRITE_COMMANDS.ADD_WORK_EMAIL]: Parameters.AddWorkEmailParams;

    // Merge accounts API
    [WRITE_COMMANDS.GET_VALIDATE_CODE_FOR_ACCOUNT_MERGE]: Parameters.GetValidateCodeForAccountMergeParams;
    [WRITE_COMMANDS.MERGE_WITH_VALIDATE_CODE]: Parameters.MergeWithValidateCodeParams;
    // Change report policy
    [WRITE_COMMANDS.CHANGE_REPORT_POLICY]: Parameters.ChangeReportPolicyParams;
    [WRITE_COMMANDS.CHANGE_REPORT_POLICY_AND_INVITE_SUBMITTER]: Parameters.ChangeReportPolicyAndInviteSubmitterParams;

    [WRITE_COMMANDS.PAY_AND_DOWNGRADE]: null;
    [WRITE_COMMANDS.IMPORT_PLAID_ACCOUNTS]: Parameters.ImportPlaidAccountsParams;

    // Change transaction report
    [WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT]: Parameters.ChangeTransactionsReportParams;
    [WRITE_COMMANDS.TRAVEL_SIGNUP_REQUEST]: null;
    [WRITE_COMMANDS.ASSIGN_REPORT_TO_ME]: Parameters.AssignReportToMeParams;
    [WRITE_COMMANDS.ADD_REPORT_APPROVER]: Parameters.AddReportApproverParams;
    [WRITE_COMMANDS.REQUEST_UNLOCK_ACCOUNT]: Parameters.LockAccountParams;
    [WRITE_COMMANDS.RESPOND_TO_PROACTIVE_APP_REVIEW]: Parameters.RespondToProactiveAppReviewParams;

    // Domain API
    [WRITE_COMMANDS.VALIDATE_DOMAIN]: Parameters.DomainParams;
    [WRITE_COMMANDS.SET_SAML_IDENTITY]: Parameters.SetSamlIdentityParams;
    [WRITE_COMMANDS.UPDATE_SAML_ENABLED]: Parameters.UpdateSamlEnabledParams;
    [WRITE_COMMANDS.UPDATE_SAML_REQUIRED]: Parameters.UpdateSamlRequiredParams;
    [WRITE_COMMANDS.CREATE_DOMAIN]: Parameters.DomainParams;
    [WRITE_COMMANDS.SET_TECHNICAL_CONTACT_EMAIL]: Parameters.SetTechnicalContactEmailParams;
    [WRITE_COMMANDS.TOGGLE_CONSOLIDATED_DOMAIN_BILLING]: Parameters.ToggleConsolidatedDomainBillingParams;
    [WRITE_COMMANDS.REMOVE_DOMAIN_ADMIN]: Parameters.RemoveDomainAdminParams;
    [WRITE_COMMANDS.DELETE_DOMAIN]: Parameters.DeleteDomainParams;
    [WRITE_COMMANDS.ADD_DOMAIN_ADMIN]: Parameters.AddAdminToDomainParams;
    [WRITE_COMMANDS.ADD_DOMAIN_MEMBER]: Parameters.AddMemberToDomainParams;
};

const READ_COMMANDS = {
    GET_CORPAY_BANK_ACCOUNT_FIELDS: 'GetCorpayBankAccountFields',
    CONNECT_POLICY_TO_QUICKBOOKS_ONLINE: 'ConnectPolicyToQuickbooksOnline',
    CONNECT_POLICY_TO_XERO: 'ConnectPolicyToXero',
    SYNC_POLICY_TO_QUICKBOOKS_ONLINE: 'SyncPolicyToQuickbooksOnline',
    SYNC_POLICY_TO_XERO: 'SyncPolicyToXero',
    SYNC_POLICY_TO_NETSUITE: 'SyncPolicyToNetSuite',
    SYNC_POLICY_TO_SAGE_INTACCT: 'SyncPolicyToSageIntacct',
    SYNC_POLICY_TO_QUICKBOOKS_DESKTOP: 'SyncPolicyToQuickbooksDesktop',
    OPEN_REIMBURSEMENT_ACCOUNT_PAGE: 'OpenReimbursementAccountPage',
    OPEN_WORKSPACE_VIEW: 'OpenWorkspaceView',
    GET_MAPBOX_ACCESS_TOKEN: 'GetMapboxAccessToken',
    OPEN_PAYMENTS_PAGE: 'OpenPaymentsPage',
    OPEN_BANK_ACCOUNT_SHARE_PAGE: 'OpenBankAccountSharePage',
    OPEN_PERSONAL_DETAILS: 'OpenPersonalDetailsPage',
    OPEN_PUBLIC_PROFILE_PAGE: 'OpenPublicProfilePage',
    OPEN_PLAID_BANK_LOGIN: 'OpenPlaidBankLogin',
    OPEN_PLAID_CARDS_BANK_LOGIN: 'OpenPlaidCardsBankLogin',
    OPEN_PLAID_BANK_ACCOUNT_SELECTOR: 'OpenPlaidBankAccountSelector',
    OPEN_SEARCH_PAGE: 'OpenSearchPage',
    SEARCH: 'Search',
    GET_OLDER_ACTIONS: 'GetOlderActions',
    GET_NEWER_ACTIONS: 'GetNewerActions',
    EXPAND_URL_PREVIEW: 'ExpandURLPreview',
    GET_REPORT_PRIVATE_NOTE: 'GetReportPrivateNote',
    OPEN_ROOM_MEMBERS_PAGE: 'OpenRoomMembersPage',
    SEARCH_FOR_REPORTS: 'SearchForReports',
    SEARCH_FOR_ROOMS_TO_MENTION: 'SearchForRoomsToMention',
    SEND_PERFORMANCE_TIMING: 'SendPerformanceTiming',
    GRAPHITE: 'Graphite',
    GET_ROUTE: 'GetRoute',
    GET_ROUTE_FOR_DRAFT: 'GetRouteForDraft',
    GET_ROUTE_FOR_BACKUP: 'GetRouteForBackup',
    GET_STATEMENT_PDF: 'GetStatementPDF',
    OPEN_ONFIDO_FLOW: 'OpenOnfidoFlow',
    OPEN_INITIAL_SETTINGS_PAGE: 'OpenInitialSettingsPage',
    OPEN_ENABLE_PAYMENTS_PAGE: 'OpenEnablePaymentsPage',
    BEGIN_SIGNIN: 'BeginSignIn',
    SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN: 'SignInWithShortLivedAuthToken',
    SIGN_IN_WITH_SUPPORT_AUTH_TOKEN: 'SignInWithSupportAuthToken',
    GET_POLICY_CATEGORIES: 'GetPolicyCategories',
    OPEN_WORKSPACE: 'OpenWorkspace',
    OPEN_WORKSPACE_MEMBERS_PAGE: 'OpenWorkspaceMembersPage',
    OPEN_POLICY_MEMBER_PROFILE_PAGE: 'OpenPolicyMemberProfilePage',
    OPEN_POLICY_CATEGORIES_PAGE: 'OpenPolicyCategoriesPage',
    OPEN_POLICY_TAGS_PAGE: 'OpenPolicyTagsPage',
    OPEN_POLICY_TAXES_PAGE: 'OpenPolicyTaxesPage',
    OPEN_POLICY_REPORT_FIELDS_PAGE: 'OpenPolicyReportFieldsPage',
    OPEN_POLICY_RULES_PAGE: 'OpenPolicyRulesPage',
    OPEN_POLICY_EXPENSIFY_CARDS_PAGE: 'OpenPolicyExpensifyCardsPage',
    OPEN_POLICY_TRAVEL_PAGE: 'OpenPolicyTravelPage',
    OPEN_POLICY_COMPANY_CARDS_FEED: 'OpenPolicyCompanyCardsFeed',
    OPEN_ASSIGN_FEED_CARD_PAGE: 'OpenAssignFeedCardPage',
    OPEN_POLICY_COMPANY_CARDS_PAGE: 'OpenPolicyCompanyCardsPage',
    OPEN_POLICY_EDIT_CARD_LIMIT_TYPE_PAGE: 'OpenPolicyEditCardLimitTypePage',
    OPEN_WORKSPACE_INVITE_PAGE: 'OpenWorkspaceInvitePage',
    OPEN_DRAFT_WORKSPACE_REQUEST: 'OpenDraftWorkspaceRequest',
    OPEN_DRAFT_PER_DIEM_EXPENSE: 'OpenDraftPerDiemExpense',
    OPEN_POLICY_WORKFLOWS_PAGE: 'OpenPolicyWorkflowsPage',
    OPEN_POLICY_RECEIPT_PARTNERS_PAGE: 'OpenPolicyReceiptPartnersPage',
    OPEN_POLICY_DISTANCE_RATES_PAGE: 'OpenPolicyDistanceRatesPage',
    OPEN_POLICY_PER_DIEM_RATES_PAGE: 'OpenPolicyPerDiemRatesPage',
    OPEN_POLICY_MORE_FEATURES_PAGE: 'OpenPolicyMoreFeaturesPage',
    OPEN_POLICY_ACCOUNTING_PAGE: 'OpenPolicyAccountingPage',
    OPEN_POLICY_PROFILE_PAGE: 'OpenPolicyProfilePage',
    OPEN_DUPLICATE_POLICY_PAGE: 'OpenDuplicatePolicyPage',
    OPEN_POLICY_INITIAL_PAGE: 'OpenPolicyInitialPage',
    OPEN_SUBSCRIPTION_PAGE: 'OpenSubscriptionPage',
    OPEN_DRAFT_DISTANCE_EXPENSE: 'OpenDraftDistanceExpense',
    START_ISSUE_NEW_CARD_FLOW: 'StartIssueNewCardFlow',
    OPEN_CARD_DETAILS_PAGE: 'OpenCardDetailsPage',
    GET_CORPAY_ONBOARDING_FIELDS: 'GetCorpayOnboardingFields',
    OPEN_WORKSPACE_PLAN_PAGE: 'OpenWorkspacePlanPage',
    OPEN_SECURITY_SETTINGS_PAGE: 'OpenSecuritySettingsPage',
    OPEN_UNREPORTED_EXPENSES_PAGE: 'OpenUnreportedExpensesPage',
    GET_GUIDE_CALL_AVAILABILITY_SCHEDULE: 'GetGuideCallAvailabilitySchedule',
    GET_TRANSACTIONS_FOR_MERGING: 'GetTransactionsForMerging',
    GET_DOMAIN_VALIDATE_CODE: 'GetDomainValidateCode',
    OPEN_DOMAIN_INITIAL_PAGE: 'OpenDomainInitialPage',
    GET_SAML_SETTINGS: 'GetSAMLSettings',
    GET_DUPLICATE_TRANSACTION_DETAILS: 'GetDuplicateTransactionDetails',
} as const;

type ReadCommand = ValueOf<typeof READ_COMMANDS>;

type ReadCommandParameters = {
    [READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE]: Parameters.ConnectPolicyToAccountingIntegrationParams;
    [READ_COMMANDS.CONNECT_POLICY_TO_XERO]: Parameters.ConnectPolicyToAccountingIntegrationParams;
    [READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_ONLINE]: Parameters.SyncPolicyToQuickbooksOnlineParams;
    [READ_COMMANDS.SYNC_POLICY_TO_XERO]: Parameters.SyncPolicyToXeroParams;
    [READ_COMMANDS.SYNC_POLICY_TO_NETSUITE]: Parameters.SyncPolicyToNetSuiteParams;
    [READ_COMMANDS.SYNC_POLICY_TO_SAGE_INTACCT]: Parameters.SyncPolicyToNetSuiteParams;
    [READ_COMMANDS.SYNC_POLICY_TO_QUICKBOOKS_DESKTOP]: Parameters.SyncPolicyToQuickbooksDesktopParams;
    [READ_COMMANDS.OPEN_REIMBURSEMENT_ACCOUNT_PAGE]: Parameters.OpenReimbursementAccountPageParams;
    [READ_COMMANDS.OPEN_WORKSPACE_VIEW]: Parameters.OpenWorkspaceViewParams;
    [READ_COMMANDS.GET_MAPBOX_ACCESS_TOKEN]: null;
    [READ_COMMANDS.OPEN_PAYMENTS_PAGE]: Parameters.OpenPaymentsPageParams | null;
    [READ_COMMANDS.OPEN_BANK_ACCOUNT_SHARE_PAGE]: null;
    [READ_COMMANDS.OPEN_PERSONAL_DETAILS]: null;
    [READ_COMMANDS.OPEN_PUBLIC_PROFILE_PAGE]: Parameters.OpenPublicProfilePageParams;
    [READ_COMMANDS.OPEN_PLAID_BANK_LOGIN]: Parameters.OpenPlaidBankLoginParams;
    [READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN]: Parameters.OpenPlaidCompanyCardLoginParams;
    [READ_COMMANDS.OPEN_PLAID_BANK_ACCOUNT_SELECTOR]: Parameters.OpenPlaidBankAccountSelectorParams;
    [READ_COMMANDS.GET_OLDER_ACTIONS]: Parameters.GetOlderActionsParams;
    [READ_COMMANDS.GET_NEWER_ACTIONS]: Parameters.GetNewerActionsParams;
    [READ_COMMANDS.GET_CORPAY_BANK_ACCOUNT_FIELDS]: Parameters.GetCorpayBankAccountFieldsParams;
    [READ_COMMANDS.EXPAND_URL_PREVIEW]: Parameters.ExpandURLPreviewParams;
    [READ_COMMANDS.GET_REPORT_PRIVATE_NOTE]: Parameters.GetReportPrivateNoteParams;
    [READ_COMMANDS.OPEN_ROOM_MEMBERS_PAGE]: Parameters.OpenRoomMembersPageParams;
    [READ_COMMANDS.SEARCH_FOR_REPORTS]: Parameters.SearchForReportsParams;
    [READ_COMMANDS.SEARCH_FOR_ROOMS_TO_MENTION]: Parameters.SearchForRoomsToMentionParams;
    [READ_COMMANDS.SEND_PERFORMANCE_TIMING]: Parameters.SendPerformanceTimingParams;
    [READ_COMMANDS.GRAPHITE]: Parameters.GraphiteParams;
    [READ_COMMANDS.GET_ROUTE]: Parameters.GetRouteParams;
    [READ_COMMANDS.GET_ROUTE_FOR_DRAFT]: Parameters.GetRouteParams;
    [READ_COMMANDS.GET_ROUTE_FOR_BACKUP]: Parameters.GetRouteParams;
    [READ_COMMANDS.GET_STATEMENT_PDF]: Parameters.GetStatementPDFParams;
    [READ_COMMANDS.OPEN_ONFIDO_FLOW]: null;
    [READ_COMMANDS.OPEN_INITIAL_SETTINGS_PAGE]: null;
    [READ_COMMANDS.OPEN_ENABLE_PAYMENTS_PAGE]: null;
    [READ_COMMANDS.OPEN_SEARCH_PAGE]: Parameters.OpenSearchPageParams;
    [READ_COMMANDS.SEARCH]: Parameters.SearchParams;
    [READ_COMMANDS.BEGIN_SIGNIN]: Parameters.BeginSignInParams;
    [READ_COMMANDS.SIGN_IN_WITH_SHORT_LIVED_AUTH_TOKEN]: Parameters.SignInWithShortLivedAuthTokenParams;
    [READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN]: Parameters.SignInWithSupportAuthTokenParams;
    [READ_COMMANDS.GET_POLICY_CATEGORIES]: Parameters.GetPolicyCategoriesParams;
    [READ_COMMANDS.OPEN_WORKSPACE]: Parameters.OpenWorkspaceParams;
    [READ_COMMANDS.OPEN_WORKSPACE_MEMBERS_PAGE]: Parameters.OpenWorkspaceMembersPageParams;
    [READ_COMMANDS.OPEN_POLICY_MEMBER_PROFILE_PAGE]: Parameters.OpenPolicyMemberProfilePageParams;
    [READ_COMMANDS.OPEN_POLICY_CATEGORIES_PAGE]: Parameters.OpenPolicyCategoriesPageParams;
    [READ_COMMANDS.OPEN_POLICY_TAGS_PAGE]: Parameters.OpenPolicyTagsPageParams;
    [READ_COMMANDS.OPEN_POLICY_TAXES_PAGE]: Parameters.OpenPolicyTaxesPageParams;
    [READ_COMMANDS.OPEN_POLICY_REPORT_FIELDS_PAGE]: Parameters.OpenPolicyReportFieldsPageParams;
    [READ_COMMANDS.OPEN_POLICY_RULES_PAGE]: Parameters.OpenPolicyRulesPageParams;
    [READ_COMMANDS.OPEN_WORKSPACE_INVITE_PAGE]: Parameters.OpenWorkspaceInvitePageParams;
    [READ_COMMANDS.OPEN_DRAFT_WORKSPACE_REQUEST]: Parameters.OpenDraftWorkspaceRequestParams;
    [READ_COMMANDS.OPEN_DRAFT_PER_DIEM_EXPENSE]: Parameters.OpenDraftPerDiemExpenseParams;
    [READ_COMMANDS.OPEN_POLICY_WORKFLOWS_PAGE]: Parameters.OpenPolicyWorkflowsPageParams;
    [READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE]: Parameters.OpenPolicyDistanceRatesPageParams;
    [READ_COMMANDS.OPEN_POLICY_PER_DIEM_RATES_PAGE]: Parameters.OpenPolicyPerDiemRatesPageParams;
    [READ_COMMANDS.OPEN_POLICY_MORE_FEATURES_PAGE]: Parameters.OpenPolicyMoreFeaturesPageParams;
    [READ_COMMANDS.OPEN_POLICY_ACCOUNTING_PAGE]: Parameters.OpenPolicyAccountingPageParams;
    [READ_COMMANDS.OPEN_POLICY_EXPENSIFY_CARDS_PAGE]: Parameters.OpenPolicyExpensifyCardsPageParams;
    [READ_COMMANDS.OPEN_POLICY_TRAVEL_PAGE]: Parameters.OpenPolicyTravelPageParams;
    [READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE]: Parameters.OpenPolicyExpensifyCardsPageParams;
    [READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED]: Parameters.OpenPolicyCompanyCardsFeedParams;
    [READ_COMMANDS.OPEN_ASSIGN_FEED_CARD_PAGE]: Parameters.OpenPolicyCompanyCardsFeedParams;
    [READ_COMMANDS.OPEN_POLICY_EDIT_CARD_LIMIT_TYPE_PAGE]: Parameters.OpenPolicyEditCardLimitTypePageParams;
    [READ_COMMANDS.OPEN_POLICY_PROFILE_PAGE]: Parameters.OpenPolicyProfilePageParams;
    [READ_COMMANDS.OPEN_DUPLICATE_POLICY_PAGE]: Parameters.OpenDuplicatePolicyPageParams;
    [READ_COMMANDS.OPEN_POLICY_INITIAL_PAGE]: Parameters.OpenPolicyInitialPageParams;
    [READ_COMMANDS.OPEN_POLICY_RECEIPT_PARTNERS_PAGE]: Parameters.OpenPolicyReceiptPartnersPageParams;
    [READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE]: null;
    [READ_COMMANDS.OPEN_DRAFT_DISTANCE_EXPENSE]: null;
    [READ_COMMANDS.START_ISSUE_NEW_CARD_FLOW]: Parameters.StartIssueNewCardFlowParams;
    [READ_COMMANDS.OPEN_CARD_DETAILS_PAGE]: Parameters.OpenCardDetailsPageParams;
    [READ_COMMANDS.GET_CORPAY_ONBOARDING_FIELDS]: Parameters.GetCorpayOnboardingFieldsParams;
    [READ_COMMANDS.OPEN_WORKSPACE_PLAN_PAGE]: Parameters.OpenWorkspacePlanPageParams;
    [READ_COMMANDS.OPEN_SECURITY_SETTINGS_PAGE]: null;
    [READ_COMMANDS.OPEN_UNREPORTED_EXPENSES_PAGE]: Parameters.OpenUnreportedExpensesPageParams;
    [READ_COMMANDS.GET_GUIDE_CALL_AVAILABILITY_SCHEDULE]: Parameters.GetGuideCallAvailabilityScheduleParams;
    [READ_COMMANDS.GET_TRANSACTIONS_FOR_MERGING]: Parameters.GetTransactionsForMergingParams;
    [READ_COMMANDS.GET_SAML_SETTINGS]: Parameters.DomainParams;
    [READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE]: Parameters.DomainParams;
    [READ_COMMANDS.OPEN_DOMAIN_INITIAL_PAGE]: Parameters.DomainParams;
    [READ_COMMANDS.GET_SAML_SETTINGS]: Parameters.DomainParams;
    [READ_COMMANDS.GET_DUPLICATE_TRANSACTION_DETAILS]: Parameters.GetDuplicateTransactionDetailsParams;
};

const SIDE_EFFECT_REQUEST_COMMANDS = {
    AUTHENTICATE_PUSHER: 'AuthenticatePusher',
    GENERATE_SPOTNANA_TOKEN: 'GenerateSpotnanaToken',
    GET_MISSING_ONYX_MESSAGES: 'GetMissingOnyxMessages',
    OPEN_OLD_DOT_LINK: 'OpenOldDotLink',
    RECONNECT_APP: 'ReconnectApp',
    REVEAL_EXPENSIFY_CARD_DETAILS: 'RevealExpensifyCardDetails',
    SET_PERSONAL_DETAILS_AND_REVEAL_EXPENSIFY_CARD: 'SetPersonalDetailsAndRevealExpensifyCard',
    TWO_FACTOR_AUTH_VALIDATE: 'TwoFactorAuth_Validate',
    CONNECT_AS_DELEGATE: 'ConnectAsDelegate',
    ACTIVATE_PHYSICAL_EXPENSIFY_CARD: 'ActivatePhysicalExpensifyCard',
    DISCONNECT_AS_DELEGATE: 'DisconnectAsDelegate',
    COMPLETE_HYBRID_APP_ONBOARDING: 'CompleteHybridAppOnboarding',
    CONNECT_POLICY_TO_QUICKBOOKS_DESKTOP: 'ConnectPolicyToQuickbooksDesktop',
    MERGE_INTO_ACCOUNT_AND_LOGIN: 'MergeIntoAccountAndLogIn',
    SEARCH: 'Search',
    GET_SCIM_TOKEN: 'GetSCIMToken',

    // PayMoneyRequestOnSearch only works online (pattern C) and we need to play the success sound only when the request is successful
    PAY_MONEY_REQUEST_ON_SEARCH: 'PayMoneyRequestOnSearch',
    LOG_OUT: 'LogOut',
    CREATE_DIGITAL_WALLET: 'CreateDigitalWallet',
    VERIFY_TEST_DRIVE_RECIPIENT: 'VerifyTestDriveRecipient',
    LOCK_ACCOUNT: 'LockAccount',
    SET_VACATION_DELEGATE: 'SetVacationDelegate',
    CALCULATE_BILL_NEW_DOT: 'CalculateBillNewDot',

    ACCEPT_SPOTNANA_TERMS: 'AcceptSpotnanaTerms',
    COMPLETE_GUIDED_SETUP: 'CompleteGuidedSetup',

    REGISTER_AUTHENTICATION_KEY: 'RegisterAuthenticationKey',
    TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION: 'TroubleshootMultifactorAuthentication',
    REQUEST_AUTHENTICATION_CHALLENGE: 'RequestAuthenticationChallenge',
} as const;

type SideEffectRequestCommand = ValueOf<typeof SIDE_EFFECT_REQUEST_COMMANDS>;

type SideEffectRequestCommandParameters = {
    [SIDE_EFFECT_REQUEST_COMMANDS.AUTHENTICATE_PUSHER]: Parameters.AuthenticatePusherParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK]: Parameters.OpenOldDotLinkParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_EXPENSIFY_CARD_DETAILS]: Parameters.RevealExpensifyCardDetailsParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.SET_PERSONAL_DETAILS_AND_REVEAL_EXPENSIFY_CARD]: Parameters.SetPersonalDetailsAndRevealExpensifyCardParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES]: Parameters.GetMissingOnyxMessagesParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP]: Parameters.ReconnectAppParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.GENERATE_SPOTNANA_TOKEN]: Parameters.GenerateSpotnanaTokenParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.TWO_FACTOR_AUTH_VALIDATE]: Parameters.ValidateTwoFactorAuthParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_AS_DELEGATE]: Parameters.ConnectAsDelegateParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.DISCONNECT_AS_DELEGATE]: EmptyObject;
    [SIDE_EFFECT_REQUEST_COMMANDS.COMPLETE_HYBRID_APP_ONBOARDING]: EmptyObject;
    [SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_DESKTOP]: Parameters.ConnectPolicyToQuickBooksDesktopParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.PAY_MONEY_REQUEST_ON_SEARCH]: Parameters.PayMoneyRequestOnSearchParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.MERGE_INTO_ACCOUNT_AND_LOGIN]: Parameters.MergeIntoAccountAndLogInParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT]: Parameters.LogOutParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD]: Parameters.ActivatePhysicalExpensifyCardParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET]: Parameters.CreateDigitalWalletParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.VERIFY_TEST_DRIVE_RECIPIENT]: Parameters.VerifyTestDriveRecipientParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.LOCK_ACCOUNT]: Parameters.LockAccountParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE]: Parameters.SetVacationDelegateParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.CALCULATE_BILL_NEW_DOT]: null;
    [SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS]: Parameters.AcceptSpotnanaTermsParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.GET_SCIM_TOKEN]: Parameters.GetScimTokenParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.COMPLETE_GUIDED_SETUP]: Parameters.CompleteGuidedSetupParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.REGISTER_AUTHENTICATION_KEY]: Parameters.RegisterAuthenticationKeyParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION]: Parameters.TroubleshootMultifactorAuthenticationParams;
    [SIDE_EFFECT_REQUEST_COMMANDS.REQUEST_AUTHENTICATION_CHALLENGE]: Parameters.RequestAuthenticationChallengeParams;
};

type ApiRequestCommandParameters = WriteCommandParameters & ReadCommandParameters & SideEffectRequestCommandParameters;

export {WRITE_COMMANDS, READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS};

type ApiCommand = WriteCommand | ReadCommand | SideEffectRequestCommand;
type CommandOfType<TRequestType extends ApiRequestType> = TRequestType extends typeof CONST.API_REQUEST_TYPE.WRITE
    ? WriteCommand
    : TRequestType extends typeof CONST.API_REQUEST_TYPE.READ
      ? ReadCommand
      : SideEffectRequestCommand;

export type {ApiCommand, ApiRequestType, ApiRequestCommandParameters, CommandOfType, WriteCommand, ReadCommand, SideEffectRequestCommand};
