import {CONST as COMMON_CONST} from 'expensify-common';
import startCase from 'lodash/startCase';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {
    AccountOwnerParams,
    ActionsAreCurrentlyRestricted,
    AddEmployeeParams,
    AddressLineParams,
    AdminCanceledRequestParams,
    AlreadySignedInParams,
    ApprovalWorkflowErrorParams,
    ApprovedAmountParams,
    AssignCardParams,
    AssignedCardParams,
    AssigneeParams,
    AuthenticationErrorParams,
    AutoPayApprovedReportsLimitErrorParams,
    BadgeFreeTrialParams,
    BeginningOfChatHistoryAdminRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartOneParams,
    BeginningOfChatHistoryDomainRoomPartOneParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    BillingBannerDisputePendingParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerSubtitleWithDateParams,
    CanceledRequestParams,
    CardEndingParams,
    CardInfoParams,
    CardNextPaymentParams,
    CategoryNameParams,
    ChangeFieldParams,
    ChangeOwnerDuplicateSubscriptionParams,
    ChangeOwnerHasFailedSettlementsParams,
    ChangeOwnerSubscriptionParams,
    ChangePolicyParams,
    ChangeTypeParams,
    CharacterLengthLimitParams,
    CharacterLimitParams,
    ChatWithAccountManagerParams,
    CompanyCardBankName,
    CompanyCardFeedNameParams,
    CompanyNameParams,
    ConfirmThatParams,
    ConnectionNameParams,
    ConnectionParams,
    CurrencyCodeParams,
    CustomersOrJobsLabelParams,
    CustomUnitRateParams,
    DateParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DefaultAmountParams,
    DefaultVendorDescriptionParams,
    DelegateRoleParams,
    DelegateSubmitParams,
    DelegatorParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DeleteTransactionParams,
    DidSplitAmountMessageParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EnterMagicCodeParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FormattedMaxLengthParams,
    ForwardedAmountParams,
    GoBackMessageParams,
    GoToRoomParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfullDescriptionParams,
    ImportPerDiemRatesSuccessfullDescriptionParams,
    ImportTagsSuccessfullDescriptionParams,
    IncorrectZipFormatParams,
    InstantSummaryParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
    LastFourDigitsParams,
    LastSyncAccountingParams,
    LastSyncDateParams,
    LeftWorkspaceParams,
    LocalTimeParams,
    LoggedInAsParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    MissingPropertyParams,
    MovedFromSelfDMParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OptionalParam,
    OurEmailProviderParams,
    OwnerOwesAmountParams,
    PaidElsewhereWithAmountParams,
    PaidWithExpensifyWithAmountParams,
    ParentNavigationSummaryParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PaySomeoneParams,
    ReconciliationWorksParams,
    RemovedFromApprovalWorkflowParams,
    RemovedTheRequestParams,
    RemoveMemberPromptParams,
    RemoveMembersWarningPrompt,
    RenamedRoomActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ReportPolicyNameParams,
    RequestAmountParams,
    RequestCountParams,
    RequestedAmountMessageParams,
    RequiredFieldParams,
    ResolutionConstraintsParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    SecondaryLoginParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettledAfterAddedBankAccountParams,
    SettleExpensifyCardParams,
    SettlementDateParams,
    ShareParams,
    SignUpNewFaceCodeParams,
    SizeExceededParams,
    SplitAmountParams,
    SpreadCategoriesParams,
    SpreadFieldNameParams,
    SpreadSheetColumnParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToValidateLoginParams,
    TransferParams,
    TrialStartedTitleParams,
    UnapprovedParams,
    UnapproveWithIntegrationWarningParams,
    UnshareParams,
    UntilTimeParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdateRoleParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    ViolationsAutoReportedRejectedExpenseParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceYouMayJoin,
    YourPlanPriceParams,
    ZipCodeExampleFormatParams,
} from './params';
import type {TranslationDeepObject} from './types';

type StateValue = {
    stateISO: string;
    stateName: string;
};
type States = Record<keyof typeof COMMON_CONST.STATES, StateValue>;
type AllCountries = Record<Country, string>;
/* eslint-disable max-len */
const translations = {
    common: {
        cancel: '\u53D6\u6D88',
        dismiss: '\u5FFD\u7565',
        yes: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        no: "Sorry, but you haven't provided any text to translate.",
        ok: 'As a language model AI, I need the specific language you want me to translate the text into. "ch" is not a recognized language code. Please provide the correct language code.',
        notNow: '\u73B0\u5728\u4E0D',
        learnMore: '\u4E86\u89E3\u66F4\u591A\u3002',
        buttonConfirm: "Sorry, but I can't assist with that.",
        name: '\u540D\u79F0',
        attachment: '\u9644\u4EF6',
        attachments: '\u9644\u4EF6',
        center: '\u4E2D\u5FC3',
        from: '\u60A8\u7684\u95EE\u9898\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216\u4EE3\u7801\u3002',
        to: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u5C06\u5F88\u9AD8\u5174\u4E3A\u60A8\u63D0\u4F9B\u5E2E\u52A9\u3002',
        in: "Apologies for the confusion, but it seems like there's no text provided for translation. Could you please provide the text you want translated?",
        optional:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        new: 'Sorry, but your request is incomplete. Could you please provide the text or TypeScript function that you want to translate?',
        search: '\u641C\u7D22',
        reports: '\u62A5\u544A',
        find: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that needs to be translated?',
        searchWithThreeDots: '\u641C\u7D22...',
        next: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        previous: '\u524D\u4E00\u4E2A',
        goBack: '\u8FD4\u56DE',
        create: '\u521B\u5EFA',
        add: '\u6DFB\u52A0',
        resend: '\u91CD\u65B0\u53D1\u9001',
        save: '\u4FDD\u5B58',
        select: '\u9009\u62E9',
        selectMultiple: '\u9009\u62E9\u591A\u4E2A',
        saveChanges: '\u4FDD\u5B58\u66F4\u6539',
        submit: '\u63D0\u4EA4',
        rotate: '\u65CB\u8F6C',
        zoom: '\u653E\u5927',
        password: '\u5BC6\u7801',
        magicCode: '\u9B54\u6CD5\u4EE3\u7801',
        twoFactorCode: '\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801',
        workspaces: '\u5DE5\u4F5C\u7A7A\u9593',
        inbox: '\u6536\u4EF6\u7BB1',
        group: '\u5C0F\u7EC4',
        profile: '\u500B\u4EBA\u8CC7\u6599',
        referral: '\u63A8\u8350',
        payments: '\u4ED8\u6B3E',
        approvals: '\u6279\u51C6',
        wallet: '\u94B1\u5305',
        preferences: '\u504F\u597D\u8BBE\u7F6E',
        view: '\u67E5\u770B',
        review: "Sorry, but you didn't provide any text to translate.",
        not: 'Sorry, but your instructions are not clear. Could you please provide the text that needs to be translated?',
        signIn: '\u767B\u5165',
        signInWithGoogle: '\u4F7F\u7528Google\u767B\u5F55',
        signInWithApple: '\u4F7F\u7528Apple\u767B\u5F55',
        signInWith: '\u4F7F\u7528${username}\u767B\u5F55',
        continue:
            "\u8FD9\u662F\u4E00\u4E2A\u7EAF\u5B57\u7B26\u4E32\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        firstName: '\u540D\u5B57',
        lastName: '\u59D3\u6C0F',
        addCardTermsOfService: 'Expensify \u670D\u52A1\u6761\u6B3E',
        perPerson: '\u6BCF\u4EBA',
        phone: '\u7535\u8BDD',
        phoneNumber: '\u7535\u8BDD\u53F7\u7801',
        phoneNumberPlaceholder: "I'm sorry, but you didn't provide any text to translate. Could you please provide the text you want to translate?",
        email: '\u7535\u5B50\u90AE\u4EF6',
        and: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        or: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u7684\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        details:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u4F1A\u5E2E\u52A9\u60A8\u8FDB\u884C\u7FFB\u8BD1\u3002',
        privacy: '\u9690\u79C1',
        privacyPolicy: '\u9690\u79C1\u653F\u7B56',
        hidden: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u62EC\u53F7\u5185\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        visible: '\u53EF\u89C1\u7684',
        delete: '\u5220\u9664',
        archived: '\u5DF2\u5B58\u6863',
        contacts: '\u8054\u7CFB\u4EBA',
        recents: '\u6700\u8FD1\u7684',
        close: '\u5173\u95ED',
        download: '\u4E0B\u8F7D',
        downloading: '\u6B63\u5728\u4E0B\u8F7D',
        uploading: '\u4E0A\u50B3\u4E2D',
        pin: '\u5FBD\u7AE0',
        unPin: '\u53D6\u6D88\u56FA\u5B9A',
        back: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u5185\u5BB9\u53EF\u4EE5\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        saveAndContinue: '\u4FDD\u5B58\u5E76\u7EE7\u7EED',
        settings: '\u8BBE\u7F6E',
        termsOfService: '\u670D\u52A1\u6761\u6B3E',
        members: '\u6210\u5458',
        invite: '\u9080\u8BF7',
        here: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u610F\u601D\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        date: '\u65E5\u671F',
        dob: '\u51FA\u751F\u65E5\u671F',
        currentYear: '\u5F53\u524D\u5E74\u4EFD',
        currentMonth: '\u5F53\u524D\u6708\u4EFD',
        ssnLast4: 'SSN\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57',
        ssnFull9: '\u5B8C\u6574\u76849\u4F4D\u793E\u4F1A\u4FDD\u969C\u53F7\u7801',
        addressLine: ({lineNumber}: AddressLineParams) => `\u5730\u5740\u884C ${lineNumber}`,
        personalAddress: '\u4E2A\u4EBA\u5730\u5740',
        companyAddress: '\u516C\u53F8\u5730\u5740',
        noPO: '\u8ACB\u4E0D\u8981\u4F7F\u7528\u90F5\u653F\u4FE1\u7BB1\u6216\u90F5\u4EF6\u6295\u905E\u5730\u5740\u3002',
        city: '\u57CE\u5E02',
        state: '\u72B6\u6001',
        streetAddress: '\u8857\u9053\u5730\u5740',
        stateOrProvince: '\u5DDE/\u7701',
        country: '\u56FD\u5BB6',
        zip: '\u90AE\u653F\u7F16\u7801',
        zipPostCode: '\u90AE\u7F16',
        whatThis: "Sorry, but I can't assist with that.",
        iAcceptThe: "Sorry, but there's no text provided for me to translate.",
        remove: '\u5F88\u62B1\u6B49\uFF0C\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u695A\u3002\u80FD\u5426\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216\u8005\u66F4\u8BE6\u7EC6\u7684\u4FE1\u606F\uFF1F',
        admin: '\u7BA1\u7406\u5458',
        owner: '\u6240\u6709\u8005',
        dateFormat: 'YYYY-MM-DD',
        send: '\u53D1\u9001',
        na: 'The task doesn\'t provide the specific language ("ch") to translate the text into. Please provide the correct language for the translation.',
        noResultsFound: '\u672A\u627E\u5230\u7ED3\u679C',
        recentDestinations: '\u6700\u8FD1\u7684\u76EE\u7684\u5730',
        timePrefix:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8F93\u5165\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u6587\u672C\u4EE5\u4FBF\u6211\u8FDB\u884C\u7FFB\u8BD1\u3002',
        conjunctionFor: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        todayAt: '\u4ECA\u5929\u5728',
        tomorrowAt: '\u660E\u5929\u5728',
        yesterdayAt: '\u6628\u5929\u5728',
        conjunctionAt: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        conjunctionTo:
            'As an AI, I need more specific information about the language you want the text to be translated into. "ch" is not a recognized language code. Please provide the correct language code or the full name of the language.',
        genericErrorMessage: '\u54CE\u5440...\u51FA\u4E86\u4E9B\u95EE\u9898\uFF0C\u65E0\u6CD5\u5B8C\u6210\u60A8\u7684\u8BF7\u6C42\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        percentage: '\u767E\u5206\u6BD4',
        error: {
            invalidAmount: '\u65E0\u6548\u7684\u91D1\u989D\u3002',
            acceptTerms: '\u60A8\u5FC5\u987B\u63A5\u53D7\u670D\u52A1\u6761\u6B3E\u624D\u80FD\u7EE7\u7EED\u3002',
            phoneNumber: `\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u8BDD\u53F7\u7801\uFF0C\u5305\u62EC\u56FD\u5BB6\u4EE3\u7801\uFF08\u4F8B\u5982 ${CONST.EXAMPLE_PHONE_NUMBER}\uFF09`,
            fieldRequired: '\u6B64\u5B57\u6BB5\u662F\u5FC5\u9700\u7684\u3002',
            requestModified: '\u6B64\u8BF7\u6C42\u6B63\u5728\u88AB\u53E6\u4E00\u540D\u6210\u5458\u4FEE\u6539\u3002',
            characterLimit: ({limit}: CharacterLimitParams) => `\u8D85\u8FC7\u4E86${limit}\u5B57\u7B26\u7684\u6700\u5927\u957F\u5EA6`,
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `\u5B57\u7B26\u9650\u5236\u5DF2\u8D85\u8FC7\uFF08${length}/${limit}\uFF09`,
            dateInvalid: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u65E5\u671F\u3002',
            invalidDateShouldBeFuture: '\u8ACB\u9078\u64C7\u4ECA\u5929\u6216\u672A\u4F86\u7684\u65E5\u671F\u3002',
            invalidTimeShouldBeFuture: '\u8ACB\u9078\u64C7\u81F3\u5C11\u63D0\u524D\u4E00\u5206\u9418\u7684\u6642\u9593\u3002',
            invalidCharacter: 'Your request seems to be incomplete or unclear. Could you please provide the text or TypeScript function that you want to be translated?',
            enterMerchant: '\u8F93\u5165\u5546\u5BB6\u540D\u79F0\u3002',
            enterAmount: '\u8F93\u5165\u4E00\u4E2A\u91D1\u989D\u3002',
            enterDate: '\u8F93\u5165\u65E5\u671F\u3002',
            invalidTimeRange: '\u8ACB\u4F7F\u752812\u5C0F\u6642\u5236\u6642\u9593\u683C\u5F0F\u8F38\u5165\u6642\u9593\uFF08\u4F8B\u5982\uFF0C\u4E0B\u53482:30\uFF09\u3002',
            pleaseCompleteForm: '\u8BF7\u5B8C\u6210\u4E0A\u65B9\u7684\u8868\u683C\u4EE5\u7EE7\u7EED\u3002',
            pleaseSelectOne: '\u8BF7\u5728\u4E0A\u65B9\u9009\u62E9\u4E00\u4E2A\u9009\u9879\u3002',
            invalidRateError: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8D39\u7387\u3002',
            lowRateError: '\u901F\u7387\u5FC5\u987B\u5927\u4E8E0\u3002',
            email: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u96FB\u5B50\u90F5\u4EF6\u5730\u5740\u3002',
        },
        comma: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\uFF0C\u6211\u65E0\u6CD5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u82F1\u6587\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        semicolon: 'As an AI, I need more context to provide a proper translation. The text provided seems incomplete. Please provide a full sentence or paragraph for translation.',
        please: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u4EE5\u4FBF\u4E8E\u7FFB\u8BD1\u3002',
        contactUs: '\u8054\u7CFB\u6211\u4EEC',
        pleaseEnterEmailOrPhoneNumber: '\u8BF7\u8F93\u5165\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801',
        fixTheErrors: '\u4FEE\u590D\u9519\u8BEF',
        inTheFormBeforeContinuing: '\u5728\u7E7C\u7E8C\u4E4B\u524D\uFF0C\u8ACB\u586B\u5BEB\u8868\u683C\u3002',
        confirm: '\u78BA\u8A8D',
        reset: '\u91CD\u7F6E',
        done: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u660E\u786E\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        more: "Sorry, but you didn't provide any text to translate.",
        debitCard: '\u501F\u8BB0\u5361',
        bankAccount: '\u94F6\u884C\u8D26\u6237',
        personalBankAccount: '\u4E2A\u4EBA\u94F6\u884C\u8D26\u6237',
        businessBankAccount: '\u5546\u4E1A\u94F6\u884C\u8D26\u6237',
        join: '\u52A0\u5165',
        leave: '\u79BB\u5F00',
        decline: '\u62D2\u7EDD',
        transferBalance: '\u8F6C\u79FB\u4F59\u989D',
        cantFindAddress: '\u627E\u4E0D\u5230\u4F60\u7684\u5730\u5740\uFF1F',
        enterManually: '\u8BF7\u624B\u52A8\u8F93\u5165',
        message: '\u4FE1\u606F',
        leaveThread: '\u79BB\u5F00\u7EBF\u7A0B',
        you: '\u60A8',
        youAfterPreposition: '\u4F60',
        your: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u63D0\u4F9B\u8DB3\u591F\u7684\u4FE1\u606F\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u3002',
        conciergeHelp: '\u8BF7\u8054\u7CFB\u793C\u5BBE\u90E8\u5BFB\u6C42\u5E2E\u52A9\u3002',
        youAppearToBeOffline: '\u4F60\u4F3C\u4E4E\u5DF2\u7ECF\u79BB\u7EBF\u3002',
        thisFeatureRequiresInternet: '\u6B64\u529F\u80FD\u9700\u8981\u6D3B\u8E8D\u7684\u7DB2\u8DEF\u9023\u7DDA\u3002',
        attachementWillBeAvailableOnceBackOnline: '\u9644\u4EF6\u5C07\u5728\u6062\u5FA9\u7DDA\u4E0A\u5F8C\u8B8A\u5F97\u53EF\u7528\u3002',
        areYouSure: "I'm sorry, but you didn't provide any text to translate. Could you please provide the text you want to be translated?",
        verify: '\u9A8C\u8BC1',
        yesContinue: '\u662F\u7684\uFF0C\u7EE7\u7EED',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `\u4F8B\u5982\uFF0C${zipSampleFormat}` : ''),
        description: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        with: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        shareCode: '\u5206\u4EAB\u4EE3\u7801',
        share: '\u5206\u4EAB',
        per: 'Sorry, there seems to be a misunderstanding. Could you please provide the text or TypeScript function that you want to translate?',
        mi: '\u91CC\u7A0B',
        km: '\u516C\u91CC',
        copied: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u5C06\u5E2E\u52A9\u60A8\u5B8C\u6210\u7FFB\u8BD1\u3002',
        someone: '\u6709\u4EBA',
        total: '\u603B\u8BA1',
        edit: '\u7F16\u8F91',
        letsDoThis: `Let's do this!`,
        letsStart: `Let's start`,
        showMore:
            'As a language model AI developed by OpenAI, I need to clarify the language you want the text to be translated into. You mentioned "ch" which is not a recognized language code. Could you please specify the language you want the translation in?',
        merchant: '\u5546\u4EBA',
        category: '\u7C7B\u522B',
        billable: '\u53EF\u8BA1\u8D39\u7684',
        nonBillable: '\u975E\u8BA1\u8D39',
        tag: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        receipt: '\u6536\u64DA',
        verified:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        replace: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        distance: '\u8DDD\u79BB',
        mile: '\u91CC\u7A0B',
        miles: '\u516C\u91CC',
        kilometer: '\u516C\u91CC',
        kilometers: '\u516C\u91CC',
        recent: '\u6700\u8FD1',
        all: "Sorry, but there's no text provided for translation.",
        am: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u3002',
        pm: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        tbd: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        selectCurrency: '\u9009\u62E9\u4E00\u79CD\u8D27\u5E01',
        card: '\u5361\u7247',
        whyDoWeAskForThis: '\u6211\u4EEC\u4E3A\u4EC0\u4E48\u8981\u95EE\u8FD9\u4E2A\uFF1F',
        required: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        showing: '\u663E\u793A',
        of: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u9700\u8981\u7FFB\u8BD1\u7684\u5185\u5BB9\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u4EE5\u4FBF\u6211\u4E3A\u60A8\u63D0\u4F9B\u51C6\u786E\u7684\u7FFB\u8BD1\u3002',
        default:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\u3001${count}\u3001${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        update: '\u66F4\u65B0',
        member: '\u6210\u5458',
        auditor: '\u5BA1\u8BA1\u5458',
        role: '\u89D2\u8272',
        currency: '\u8D27\u5E01',
        rate: '\u8BC4\u4EF7',
        emptyLHN: {
            title: '\u54C7\u54E6\uFF01\u5168\u90E8\u8FFD\u4E0A\u4E86\u3002',
            subtitleText1:
                "\u4F7F\u7528${username}\u67E5\u627E\u804A\u5929\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u4FEE\u6539\u5176\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            subtitleText2: '\u4E0A\u9762\u7684\u6309\u94AE\uFF0C\u6216\u4F7F\u7528${username}\u521B\u5EFA\u4E00\u4E9B\u4E1C\u897F',
            subtitleText3: '\u4E0B\u9762\u7684\u6309\u94AE\u3002',
        },
        businessName: '\u5546\u4E1A\u540D\u79F0',
        clear: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        type: "Sorry, but you haven't provided any text to translate. Please provide the text you want translated.",
        action: '\u884C\u52A8',
        expenses: '\u8D39\u7528',
        tax: '\u7A0E',
        shared: '\u5171\u4EAB\u7684',
        drafts: '\u8349\u7A3F',
        finished: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u6CA1\u6709\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        upgrade: '\u5347\u7EA7',
        downgradeWorkspace: '\u964D\u7EA7\u5DE5\u4F5C\u533A',
        companyID: '\u516C\u53F8ID',
        userID: '\u7528\u6237ID',
        disable: '\u7981\u7528',
        export: '\u5BFC\u51FA',
        initialValue: '\u521D\u59CB\u503C',
        currentDate: '\u5F53\u524D\u65E5\u671F',
        value: "Sorry, but you didn't provide any text to translate.",
        downloadFailedTitle: '\u4E0B\u8F7D\u5931\u8D25',
        downloadFailedDescription: '\u60A8\u7684\u4E0B\u8F7D\u65E0\u6CD5\u5B8C\u6210\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        filterLogs: '\u8FC7\u6EE4\u65E5\u5FD7',
        network: '\u7F51\u7EDC',
        reportID: '\u62A5\u544AID',
        bankAccounts: '\u9280\u884C\u8CEC\u6236',
        chooseFile: '\u9009\u62E9\u6587\u4EF6',
        dropTitle: '\u8BA9\u5B83\u8D70',
        dropMessage: '\u5728\u6B64\u5904\u653E\u7F6E\u60A8\u7684\u6587\u4EF6',
        ignore: 'As an AI, I need the specific text or TypeScript function that you want to translate into Chinese. Please provide the text or function for me to assist you better.',
        enabled: '\u5DF2\u542F\u7528',
        disabled: '\u7981\u7528',
        import: '\u5BFC\u5165',
        offlinePrompt: '\u4F60\u73B0\u5728\u4E0D\u80FD\u8FDB\u884C\u6B64\u64CD\u4F5C\u3002',
        outstanding: "I'm sorry, but there is no text provided for translation. Please provide the text that you want to be translated.",
        chats: '\u804A\u5929\u5BA4',
        unread: '\u672A\u8BFB',
        sent: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u660E\u786E\u3002"ch"\u662F\u4EC0\u4E48\u8BED\u8A00\u7684\u7F29\u5199\uFF1F\u8BF7\u63D0\u4F9B\u66F4\u591A\u4FE1\u606F\uFF0C\u4EE5\u4FBF\u6211\u80FD\u66F4\u597D\u5730\u5E2E\u52A9\u60A8\u3002',
        links: '\u94FE\u63A5',
        days: '\u5929',
        rename: '\u91CD\u547D\u540D',
        address: '\u5730\u5740',
        hourAbbreviation: "Sorry, but you didn't provide any text to translate.",
        minuteAbbreviation: "Sorry, but you didn't provide any text to translate.",
        skip: '\u8DF3\u8FC7',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `\u9700\u8981\u7279\u5B9A\u7684\u4E1C\u897F\u5417\uFF1F\u4E0E\u60A8\u7684\u8D26\u6237\u7ECF\u7406${accountManagerDisplayName}\u804A\u5929\u3002`,
        chatNow: '\u7ACB\u5373\u804A\u5929',
        destination: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        subrate:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u8DB3\u591F\u7684\u4FE1\u606F\u6765\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u3002',
        perDiem: '\u6BCF\u65E5',
        validate: '\u9A8C\u8BC1',
    },
    supportalNoAccess: {
        title: '\u4E0D\u8981\u8FD9\u4E48\u5FEB',
        description: '\u5F53\u652F\u6301\u4EBA\u5458\u767B\u5F55\u65F6\uFF0C\u60A8\u65E0\u6743\u8FDB\u884C\u6B64\u64CD\u4F5C\u3002',
    },
    location: {
        useCurrent: '\u4F7F\u7528\u5F53\u524D\u4F4D\u7F6E',
        notFound: '\u6211\u4EEC\u65E0\u6CD5\u627E\u5230\u60A8\u7684\u4F4D\u7F6E\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u624B\u52A8\u8F93\u5165\u5730\u5740\u3002',
        permissionDenied: '\u770B\u8D77\u6765\u4F60\u5DF2\u7ECF\u62D2\u7EDD\u4E86\u5BF9\u4F60\u4F4D\u7F6E\u7684\u8BBF\u95EE\u6743\u9650\u3002',
        please: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u4EE5\u4FBF\u4E8E\u7FFB\u8BD1\u3002',
        allowPermission: '\u5728\u8BBE\u7F6E\u4E2D\u5141\u8BB8\u4F4D\u7F6E\u8BBF\u95EE',
        tryAgain: '\u5E76\u518D\u8BD5\u4E00\u6B21\u3002',
    },
    anonymousReportFooter: {
        logoTagline: '\u52A0\u5165\u8A0E\u8AD6\u3002',
    },
    attachmentPicker: {
        cameraPermissionRequired: '\u76F8\u673A\u8BBF\u95EE',
        expensifyDoesntHaveAccessToCamera:
            'Expensify\u65E0\u6CD5\u5728\u6CA1\u6709\u8BBF\u95EE\u60A8\u7684\u76F8\u673A\u7684\u60C5\u51B5\u4E0B\u62CD\u7167\u3002\u70B9\u51FB\u8BBE\u7F6E\u4EE5\u66F4\u65B0\u6743\u9650\u3002',
        attachmentError: '\u9644\u4EF6\u9519\u8BEF',
        errorWhileSelectingAttachment: '\u9078\u64C7\u9644\u4EF6\u6642\u767C\u751F\u932F\u8AA4\u3002\u8ACB\u518D\u8A66\u4E00\u6B21\u3002',
        errorWhileSelectingCorruptedAttachment: '\u9078\u64C7\u640D\u58DE\u7684\u9644\u4EF6\u6642\u767C\u751F\u932F\u8AA4\u3002\u8ACB\u5617\u8A66\u53E6\u4E00\u500B\u6587\u4EF6\u3002',
        takePhoto: '\u62CD\u7167',
        chooseFromGallery: '\u4ECE\u753B\u5ECA\u4E2D\u9009\u62E9',
        chooseDocument: '\u9009\u62E9\u6587\u4EF6',
        attachmentTooLarge: '\u9644\u4EF6\u592A\u5927',
        sizeExceeded: '\u9644\u4EF6\u5927\u5C0F\u8D85\u8FC724 MB\u9650\u5236',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `\u9644\u4EF6\u5927\u5C0F\u8D85\u8FC7\u4E86${maxUploadSizeInMB} MB\u7684\u9650\u5236`,
        attachmentTooSmall: '\u9644\u4EF6\u592A\u5C0F',
        sizeNotMet: '\u9644\u4EF6\u5927\u5C0F\u5FC5\u987B\u5927\u4E8E240\u5B57\u8282',
        wrongFileType: '\u65E0\u6548\u7684\u6587\u4EF6\u7C7B\u578B',
        notAllowedExtension: '\u6B64\u6587\u4EF6\u7C7B\u578B\u4E0D\u5141\u8BB8\u3002\u8BF7\u5C1D\u8BD5\u4F7F\u7528\u4E0D\u540C\u7684\u6587\u4EF6\u7C7B\u578B\u3002',
        folderNotAllowedMessage: '\u4E0A\u4F20\u6587\u4EF6\u5939\u662F\u4E0D\u5141\u8BB8\u7684\u3002\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u6587\u4EF6\u3002',
        protectedPDFNotSupported: '\u4E0D\u652F\u6301\u5BC6\u7801\u4FDD\u62A4\u7684PDF',
        attachmentImageResized: '\u6B64\u56FE\u50CF\u5DF2\u4E3A\u9884\u89C8\u800C\u8C03\u6574\u5927\u5C0F\u3002\u4E0B\u8F7D\u4EE5\u83B7\u53D6\u5B8C\u6574\u5206\u8FA8\u7387\u3002',
        attachmentImageTooLarge: '\u6B64\u5716\u7247\u592A\u5927\uFF0C\u7121\u6CD5\u5728\u4E0A\u50B3\u524D\u9810\u89BD\u3002',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `\u60A8\u4E00\u6B21\u53EA\u80FD\u4E0A\u50B3\u6700\u591A ${fileLimit} \u500B\u6587\u4EF6\u3002`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `\u6587\u4EF6\u8D85\u8FC7\u4E86${maxUploadSizeInMB} MB\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002`,
    },
    filePicker: {
        fileError: '\u6587\u4EF6\u9519\u8BEF',
        errorWhileSelectingFile: '\u9078\u64C7\u6587\u4EF6\u6642\u767C\u751F\u932F\u8AA4\u3002\u8ACB\u518D\u8A66\u4E00\u6B21\u3002',
    },
    connectionComplete: {
        title: '\u8FDE\u63A5\u5B8C\u6210',
        supportingText: '\u60A8\u53EF\u4EE5\u5173\u95ED\u6B64\u7A97\u53E3\u5E76\u8FD4\u56DE\u5230Expensify\u5E94\u7528\u7A0B\u5E8F\u3002',
    },
    avatarCropModal: {
        title: '\u7F16\u8F91\u7167\u7247',
        description: '\u62D6\u52A8\uFF0C\u7F29\u653E\uFF0C\u5E76\u65CB\u8F6C\u60A8\u7684\u56FE\u7247\uFF0C\u968F\u60A8\u559C\u6B22\u3002',
    },
    composer: {
        noExtensionFoundForMimeType: '\u672A\u627E\u5230 mime \u7C7B\u578B\u7684\u6269\u5C55',
        problemGettingImageYouPasted: '\u60A8\u7C98\u8D34\u7684\u56FE\u7247\u83B7\u53D6\u51FA\u73B0\u95EE\u9898',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `\u6700\u5927\u8BC4\u8BBA\u957F\u5EA6\u4E3A ${formattedMaxLength} \u4E2A\u5B57\u7B26\u3002`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) =>
            `\u4EFB\u52A1\u6807\u9898\u7684\u6700\u5927\u957F\u5EA6\u662F${formattedMaxLength}\u4E2A\u5B57\u7B26\u3002`,
    },
    baseUpdateAppModal: {
        updateApp: '\u66F4\u65B0\u5E94\u7528',
        updatePrompt:
            '\u8FD9\u4E2A\u5E94\u7528\u7684\u65B0\u7248\u672C\u73B0\u5728\u53EF\u4EE5\u4F7F\u7528\u3002\n\u73B0\u5728\u66F4\u65B0\u6216\u7A0D\u540E\u91CD\u542F\u5E94\u7528\u4EE5\u4E0B\u8F7D\u6700\u65B0\u7684\u66F4\u6539\u3002',
    },
    deeplinkWrapper: {
        launching: '\u542F\u52A8Expensify',
        expired: '\u60A8\u7684\u4F1A\u8BDD\u5DF2\u8FC7\u671F\u3002',
        signIn: '\u8BF7\u518D\u6B21\u767B\u5F55\u3002',
        redirectedToDesktopApp: '\u6211\u4EEC\u5DF2\u5C06\u60A8\u91CD\u5B9A\u5411\u5230\u684C\u9762\u5E94\u7528\u7A0B\u5E8F\u3002',
        youCanAlso: '\u4F60\u4E5F\u53EF\u4EE5',
        openLinkInBrowser: '\u5728\u60A8\u7684\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u6B64\u94FE\u63A5',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `\u60A8\u5DF2\u4EE5${email}\u7684\u8EAB\u4EFD\u767B\u5F55\u3002\u8BF7\u5728\u63D0\u793A\u4E2D\u70B9\u51FB\u201C\u6253\u5F00\u94FE\u63A5\u201D\u4EE5\u4F7F\u7528\u6B64\u5E10\u6237\u767B\u5F55\u684C\u9762\u5E94\u7528\u7A0B\u5E8F\u3002`,
        doNotSeePrompt: '\u5BF9\u4E0D\u8D77\uFF0C\u6211\u770B\u4E0D\u5230\u60A8\u9700\u8981\u6211\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        tryAgain: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        or: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4F3C\u4E4E\u4E3A\u7A7A\u6216\u4E0D\u5B8C\u6574\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u6587\u672C\u4EE5\u4FBF\u6211\u4E3A\u60A8\u7FFB\u8BD1\u3002',
        continueInWeb: '\u7EE7\u7EED\u5230\u7F51\u7EDC\u5E94\u7528\u7A0B\u5E8F',
    },
    validateCodeModal: {
        successfulSignInTitle: '\u963F\u5E03\u62C9\u5361\u74E6\u5E03\u62C9\uFF0C\n\u4F60\u5DF2\u7ECF\u767B\u5F55\u4E86\uFF01',
        successfulSignInDescription: '\u8FD4\u56DE\u5230\u60A8\u7684\u539F\u59CB\u6807\u7B7E\u9875\u4EE5\u7EE7\u7EED\u3002',
        title: '\u8FD9\u662F\u4F60\u7684\u9B54\u6CD5\u4EE3\u7801',
        description: '\u8ACB\u8F38\u5165\u5728\u539F\u59CB\u8981\u6C42\u7684\u8A2D\u5099\u4E0A\u7372\u5F97\u7684\u4EE3\u78BC',
        doNotShare: '\u4E0D\u8981\u4E0E\u4EFB\u4F55\u4EBA\u5206\u4EAB\u60A8\u7684\u4EE3\u7801\u3002\nExpensify\u6C38\u8FDC\u4E0D\u4F1A\u5411\u60A8\u7D22\u8981\u5B83\uFF01',
        or: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4F3C\u4E4E\u4E3A\u7A7A\u6216\u4E0D\u5B8C\u6574\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u6587\u672C\u4EE5\u4FBF\u6211\u4E3A\u60A8\u7FFB\u8BD1\u3002',
        signInHere: '\u53EA\u9700\u5728\u6B64\u767B\u5165',
        expiredCodeTitle: '\u9B54\u6CD5\u4EE3\u7801\u5DF2\u8FC7\u671F',
        expiredCodeDescription: '\u8FD4\u56DE\u539F\u59CB\u8BBE\u5907\u5E76\u8BF7\u6C42\u65B0\u7684\u4EE3\u7801',
        successfulNewCodeRequest: '\u8981\u6C42\u4EE3\u7801\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u8BBE\u5907\u3002',
        tfaRequiredTitle: '\u9700\u8981\u4E24\u6B65\u9A8C\u8BC1',
        tfaRequiredDescription: '\u8ACB\u8F38\u5165\u60A8\u6B63\u5728\u5617\u8A66\u767B\u5165\u7684\u5730\u65B9\u7684\u5169\u6B65\u9A5F\u9A57\u8B49\u78BC\u3002',
        requestOneHere: '\u5728\u8FD9\u91CC\u7533\u8BF7\u4E00\u4E2A\u3002',
    },
    moneyRequestConfirmationList: {
        paidBy: '\u7531\u4ED8\u6B3E',
        whatsItFor: '\u8FD9\u662F\u7528\u6765\u505A\u4EC0\u4E48\u7684\uFF1F',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '\u59D3\u540D\uFF0C\u7535\u5B50\u90AE\u4EF6\uFF0C\u6216\u7535\u8BDD\u53F7\u7801',
        findMember: '\u627E\u5230\u4E00\u4F4D\u6210\u5458',
    },
    emptyList: {
        [CONST.IOU.TYPE.SUBMIT]: {
            title: '\u63D0\u4EA4\u4E00\u9879\u8D39\u7528',
            subtitleText1: '\u5411\u67D0\u4EBA\u63D0\u4EA4',
            subtitleText2: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: '\u7576\u4ED6\u5011\u6210\u70BA\u5BA2\u6236\u6642\u3002',
        },
        [CONST.IOU.TYPE.SPLIT]: {
            title: '\u5206\u62C5\u8D39\u7528',
            subtitleText1: '\u4E0E\u670B\u53CB\u5206\u4EAB\u548C',
            subtitleText2: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: '\u7576\u4ED6\u5011\u6210\u70BA\u5BA2\u6236\u6642\u3002',
        },
        [CONST.IOU.TYPE.PAY]: {
            title: '\u652F\u4ED8\u67D0\u4EBA',
            subtitleText1: '\u5411\u4EFB\u4F55\u4EBA\u652F\u4ED8',
            subtitleText2: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: '\u7576\u4ED6\u5011\u6210\u70BA\u5BA2\u6236\u6642\u3002',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '\u9884\u8BA2\u7535\u8BDD\u4F1A\u8BAE',
    },
    hello: '\u4F60\u597D',
    phoneCountryCode: "Sorry, but there's no text provided for translation.",
    welcomeText: {
        getStarted: '\u5F00\u59CB\u4EE5\u4E0B\u64CD\u4F5C\u3002',
        anotherLoginPageIsOpen: '\u53E6\u4E00\u4E2A\u767B\u5F55\u9875\u9762\u5DF2\u6253\u5F00\u3002',
        anotherLoginPageIsOpenExplanation:
            '\u60A8\u5DF2\u5728\u53E6\u4E00\u4E2A\u6807\u7B7E\u9875\u4E2D\u6253\u5F00\u4E86\u767B\u5F55\u9875\u9762\u3002\u8BF7\u4ECE\u90A3\u4E2A\u6807\u7B7E\u9875\u8FDB\u884C\u767B\u5F55\u3002',
        welcome: '\u6B22\u8FCE\uFF01',
        welcomeWithoutExclamation: '\u6B22\u8FCE',
        phrase2: '\u91D1\u94B1\u6709\u8BDD\u8BED\u6743\u3002\u73B0\u5728\u804A\u5929\u548C\u652F\u4ED8\u5728\u4E00\u4E2A\u5730\u65B9\uFF0C\u4E5F\u53D8\u5F97\u5BB9\u6613\u4E86\u3002',
        phrase3: '\u60A8\u7684\u4ED8\u6B3E\u5C07\u6703\u50CF\u60A8\u80FD\u5920\u5FEB\u901F\u8868\u9054\u89C0\u9EDE\u4E00\u6A23\u5FEB\u901F\u5230\u9054\u60A8\u7684\u624B\u4E2D\u3002',
        enterPassword: '\u8BF7\u8F93\u5165\u60A8\u7684\u5BC6\u7801',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u81F3 ${login} \u7684\u9B54\u6CD5\u4EE3\u7801\u3002\u5B83\u5E94\u8BE5\u5728\u4E00\u4E24\u5206\u949F\u5185\u5230\u8FBE\u3002`,
    },
    login: {
        hero: {
            header: '\u65C5\u884C\u548C\u8D39\u7528\uFF0C\u4EE5\u804A\u5929\u7684\u901F\u5EA6',
            body: '\u6B22\u8FCE\u6765\u5230\u4E0B\u4E00\u4EE3\u7684Expensify\uFF0C\u5728\u8FD9\u91CC\uFF0C\u60A8\u7684\u65C5\u884C\u548C\u8D39\u7528\u5728\u5B9E\u65F6\u804A\u5929\u7684\u5E2E\u52A9\u4E0B\u4F1A\u66F4\u5FEB\u5730\u8FDB\u884C\u3002',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `\u60A8\u5DF2\u7ECF\u4EE5${email}\u7684\u8EAB\u4EFD\u767B\u5F55\u4E86\u3002`,
        goBackMessage: ({provider}: GoBackMessageParams) => `\u4E0D\u60F3\u7528${provider}\u767B\u5F55\u5417\uFF1F`,
        continueWithMyCurrentSession: '\u7EE7\u7EED\u6211\u7684\u5F53\u524D\u4F1A\u8BDD',
        redirectToDesktopMessage: '\u4E00\u65E6\u60A8\u5B8C\u6210\u767B\u5F55\uFF0C\u6211\u4EEC\u5C06\u628A\u60A8\u91CD\u5B9A\u5411\u5230\u684C\u9762\u5E94\u7528\u7A0B\u5E8F\u3002',
        signInAgreementMessage: '\u901A\u8FC7\u767B\u5F55\uFF0C\u60A8\u540C\u610F',
        termsOfService: '\u670D\u52A1\u6761\u6B3E',
        privacy: '\u9690\u79C1',
    },
    samlSignIn: {
        welcomeSAMLEnabled: '\u7EE7\u7EED\u4F7F\u7528\u5355\u70B9\u767B\u5F55\u8FDB\u884C\u767B\u5F55\uFF1A',
        orContinueWithMagicCode: '\u60A8\u4E5F\u53EF\u4EE5\u7528\u9B54\u6CD5\u4EE3\u7801\u767B\u5F55',
        useSingleSignOn: '\u4F7F\u7528\u5355\u70B9\u767B\u5F55',
        useMagicCode: '\u4F7F\u7528\u9B54\u6CD5\u4EE3\u7801',
        launching: '\u542F\u52A8\u4E2D...',
        oneMoment: '\u8BF7\u7A0D\u7B49\uFF0C\u6211\u4EEC\u5C06\u60A8\u91CD\u5B9A\u5411\u5230\u60A8\u516C\u53F8\u7684\u5355\u70B9\u767B\u5F55\u95E8\u6237\u3002',
    },
    reportActionCompose: {
        dropToUpload: '\u4E0A\u4F20\u6587\u4EF6\u8BF7\u62D6\u62FD\u81F3\u6B64',
        sendAttachment: '\u53D1\u9001\u9644\u4EF6',
        addAttachment: '\u6DFB\u52A0\u9644\u4EF6',
        writeSomething:
            'As a language model AI developed by OpenAI, I need the specific text or TypeScript function you want to translate to Chinese. Please provide the text or TypeScript function.',
        blockedFromConcierge: '\u901A\u4FE1\u88AB\u7981\u6B62',
        fileUploadFailed: '\u4E0A\u4F20\u5931\u8D25\u3002\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u7C7B\u578B\u3002',
        localTime: ({user, time}: LocalTimeParams) => `\u8FD9\u662F${user}\u7684${time}`,
        edited: '\u62B1\u6B49\uFF0C\u60A8\u7684\u6307\u793A\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        emoji: '\u8868\u60C5\u7B26\u53F7',
        collapse:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        expand: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
    },
    reportActionContextMenu: {
        copyToClipboard:
            'As an AI model, I need the specific language you want the text to be translated into. "ch" is not recognized as a language code. Please provide the correct language code such as "zh" for Chinese, "fr" for French, "es" for Spanish, etc.',
        copied: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u5C06\u5E2E\u52A9\u60A8\u5B8C\u6210\u7FFB\u8BD1\u3002',
        copyLink: '\u590D\u5236\u94FE\u63A5',
        copyURLToClipboard: '\u590D\u5236URL\u5230\u526A\u8D34\u677F',
        copyEmailToClipboard: '\u590D\u5236\u7535\u5B50\u90AE\u4EF6\u5230\u526A\u8D34\u677F',
        markAsUnread: '\u6807\u8BB0\u4E3A\u672A\u8BFB',
        markAsRead: '\u6807\u8BB0\u4E3A\u5DF2\u8BFB',
        editAction: ({action}: EditActionParams) => `\u7F16\u8F91 ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '费用' : '评论'}`,
        deleteAction: ({action}: DeleteActionParams) => `\u5220\u9664${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '费用' : '评论'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '费用' : '评论'}\u5417\uFF1F`,
        onlyVisible: '\u53EA\u5BF9\u4EE5\u4E0B\u53EF\u89C1',
        replyInThread: '\u5728\u7EBF\u7A0B\u4E2D\u56DE\u590D',
        joinThread: '\u52A0\u5165\u7EBF\u7A0B',
        leaveThread: '\u79BB\u5F00\u7EBF\u7A0B',
        copyOnyxData: '\u590D\u5236 Onyx \u6570\u636E',
        flagAsOffensive: '\u6807\u8BB0\u4E3A\u5192\u72AF\u6027\u7684',
        menu: '\u83DC\u5355',
    },
    emojiReactions: {
        addReactionTooltip: '\u6DFB\u52A0\u53CD\u5E94',
        reactedWith: '\u8207${username}\u7522\u751F\u4E92\u52D5',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: '\u4F60\u9519\u8FC7\u4E86${username}\u7684\u6D3E\u5BF9\u3002',
        beginningOfArchivedRoomPartTwo: '\u8FD9\u91CC\u4EC0\u4E48\u90FD\u6CA1\u6709\u3002',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `\u9019\u500B\u804A\u5929\u662F\u8207${domainRoom}\u57DF\u7684\u6240\u6709Expensify\u6210\u54E1\u9032\u884C\u7684\u3002`,
        beginningOfChatHistoryDomainRoomPartTwo: '\u4F7F\u7528\u5B83\u4E0E\u540C\u4E8B\u804A\u5929\uFF0C\u5206\u4EAB\u63D0\u793A\uFF0C\u5E76\u63D0\u95EE\u3002',
        beginningOfChatHistoryAdminRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) =>
            `\u8FD9\u4E2A\u804A\u5929\u662F\u4E0E${workspaceName}\u7BA1\u7406\u5458\u7684\u3002`,
        beginningOfChatHistoryAdminRoomPartTwo: '\u4F7F\u7528\u5B83\u6765\u804A\u5929\u8BA8\u8BBA\u5DE5\u4F5C\u533A\u8BBE\u7F6E\u7B49\u66F4\u591A\u5185\u5BB9\u3002',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) =>
            `\u9019\u500B\u804A\u5929\u662F\u8207${workspaceName}\u4E2D\u7684\u6240\u6709\u4EBA\u3002`,
        beginningOfChatHistoryAnnounceRoomPartTwo: ` Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoomPartOne: '\u8FD9\u4E2A\u804A\u5929\u5BA4\u9002\u7528\u4E8E\u4EFB\u4F55\u4E8B\u60C5',
        beginningOfChatHistoryUserRoomPartTwo: "Sorry, but there's no text provided for translation. Could you please provide the text you want to be translated?",
        beginningOfChatHistoryInvoiceRoomPartOne: `This chat is for invoices between `,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Use the + button to send an invoice.`,
        beginningOfChatHistory: '\u8FD9\u4E2A\u804A\u5929\u662F\u4E0E${username}',
        beginningOfChatHistoryPolicyExpenseChatPartOne: '\u8FD9\u5C31\u662F\u5730\u65B9',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: '\u5C07\u63D0\u4EA4\u8CBB\u7528\u7D66',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. \u53EA\u9700\u4F7F\u7528 + \u6309\u94AE\u3002',
        beginningOfChatHistorySelfDM:
            '\u8FD9\u662F\u4F60\u7684\u4E2A\u4EBA\u7A7A\u95F4\u3002\u7528\u5B83\u6765\u8BB0\u7B14\u8BB0\uFF0C\u4EFB\u52A1\uFF0C\u8349\u7A3F\u548C\u63D0\u9192\u3002',
        beginningOfChatHistorySystemDM: '\u6B22\u8FCE\uFF01\u8BA9\u6211\u4EEC\u5E2E\u4F60\u8BBE\u7F6E\u3002',
        chatWithAccountManager: '\u5728\u8FD9\u91CC\u4E0E\u60A8\u7684\u8D26\u6237\u7ECF\u7406\u804A\u5929',
        sayHello: '\u8BF4\u4F60\u597D\uFF01',
        yourSpace: '\u4F60\u7684\u7A7A\u95F4',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `\u6B22\u8FCE\u6765\u5230${roomName}\uFF01`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `\u4F7F\u7528 + \u6309\u94AE\u6765 ${additionalText} \u4E00\u7B14\u8D39\u7528\u3002`,
        askConcierge: '\u63D0\u95EE\u5E76\u83B7\u5F9724/7\u5B9E\u65F6\u652F\u6301\u3002',
        conciergeSupport: '24/7 \u652F\u6301',
        create: '\u521B\u5EFA',
        iouTypes: {
            pay: '\u652F\u4ED8',
            split: '\u5206\u5272',
            submit: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            track: '\u8FFD\u8E2A',
            invoice: '\u53D1\u7968',
        },
    },
    adminOnlyCanPost: '\u53EA\u6709\u7BA1\u7406\u5458\u53EF\u4EE5\u5728\u8FD9\u4E2A\u623F\u95F4\u53D1\u9001\u6D88\u606F\u3002',
    reportAction: {
        asCopilot: '\u4F5C\u4E3A\u526F\u9A7E\u9A76\u7684${username}',
    },
    mentionSuggestions: {
        hereAlternateText: '\u901A\u77E5\u6B64\u5BF9\u8BDD\u4E2D\u7684\u6240\u6709\u4EBA',
    },
    newMessages: '\u65B0\u6D88\u606F',
    youHaveBeenBanned: '\u6CE8\u610F\uFF1A\u60A8\u5DF2\u88AB\u7981\u6B62\u5728\u6B64\u9891\u9053\u4E2D\u804A\u5929\u3002',
    reportTypingIndicator: {
        isTyping: '\u6B63\u5728\u8F93\u5165...',
        areTyping:
            'As a language model AI developed by OpenAI, I need to clarify the target language you want me to translate the text into. "ch" is not a recognized language code. Could you please specify the language you want the text to be translated into?',
        multipleMembers: '\u591A\u4E2A\u6210\u5458',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '\u6B64\u804A\u5929\u5BA4\u5DF2\u88AB\u5B58\u6863\u3002',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `\u9019\u500B\u804A\u5929\u5BA4\u5DF2\u7D93\u4E0D\u518D\u6D3B\u8E8D\uFF0C\u56E0\u70BA${displayName}\u5DF2\u7D93\u95DC\u9589\u4E86\u4ED6\u5011\u7684\u5E33\u6236\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `\u6B64\u804A\u5929\u5DF2\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A${oldDisplayName}\u5DF2\u5C06\u4ED6\u4EEC\u7684\u8D26\u6237\u4E0E${displayName}\u5408\u5E76\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `\u6B64\u804A\u5929\u5DF2\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A<strong>\u60A8</strong>\u5DF2\u4E0D\u518D\u662F${policyName}\u5DE5\u4F5C\u533A\u7684\u6210\u5458\u3002`
                : `\u9019\u500B\u804A\u5929\u5BA4\u5DF2\u7D93\u4E0D\u518D\u6D3B\u8E8D\uFF0C\u56E0\u70BA${displayName}\u5DF2\u7D93\u4E0D\u518D\u662F${policyName}\u5DE5\u4F5C\u5340\u7684\u6210\u54E1\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `\u6B64\u804A\u5929\u5DF2\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A${policyName}\u4E0D\u518D\u662F\u4E00\u4E2A\u6D3B\u8DC3\u7684\u5DE5\u4F5C\u533A\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `\u6B64\u804A\u5929\u5DF2\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A${policyName}\u4E0D\u518D\u662F\u4E00\u4E2A\u6D3B\u8DC3\u7684\u5DE5\u4F5C\u533A\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '\u6B64\u9810\u8A02\u5DF2\u5B58\u6A94\u3002',
    },
    writeCapabilityPage: {
        label: '\u8C01\u53EF\u4EE5\u53D1\u5E03',
        writeCapability: {
            all: '\u6240\u6709\u6210\u5458',
            admins: '\u50C5\u9650\u7BA1\u7406\u54E1',
        },
    },
    sidebarScreen: {
        buttonFind: '\u627E\u4E00\u4E9B\u4E1C\u897F...',
        buttonMySettings: '\u6211\u7684\u8BBE\u7F6E',
        fabNewChat: '\u5F00\u59CB\u804A\u5929',
        fabNewChatExplained: '\u5F00\u59CB\u804A\u5929\uFF08\u6D6E\u52A8\u64CD\u4F5C\uFF09',
        chatPinned: '\u804A\u5929\u56FA\u5B9A\u4E86',
        draftedMessage: '\u8349\u7A3F\u4FE1\u606F',
        listOfChatMessages: '\u804A\u5929\u4FE1\u606F\u5217\u8868',
        listOfChats: '\u804A\u5929\u5217\u8868',
        saveTheWorld: '\u6551\u4E16\u754C',
        tooltip: '\u5728\u8FD9\u91CC\u5F00\u59CB\uFF01',
        redirectToExpensifyClassicModal: {
            title: '\u5373\u5C06\u63A8\u51FA',
            description:
                '\u6211\u4EEC\u6B63\u5728\u5BF9New Expensify\u7684\u4E00\u4E9B\u7EC6\u8282\u8FDB\u884C\u5FAE\u8C03\uFF0C\u4EE5\u9002\u5E94\u60A8\u7684\u7279\u5B9A\u8BBE\u7F6E\u3002\u540C\u65F6\uFF0C\u8BF7\u524D\u5F80Expensify Classic\u3002',
        },
    },
    allSettingsScreen: {
        subscription: '\u8A02\u95B1',
        domains: '\u57DF\u540D',
    },
    tabSelector: {
        chat: 'Sorry, but your instruction is unclear. Could you please provide the text that you want to be translated?',
        room: '\u623F\u95F4',
        distance: '\u8DDD\u79BB',
        manual: "\u60A8\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u7FFB\u8BD1\u3002\u5C06\u4EE5\u4E0B\u6587\u672C\u7FFB\u8BD1\u6210\u4E2D\u6587\u3002\u5B83\u53EF\u80FD\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\uFF0C\u4E5F\u53EF\u80FD\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        scan: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
    },
    spreadsheet: {
        upload: '\u4E0A\u4F20\u4E00\u4E2A\u7535\u5B50\u8868\u683C',
        dragAndDrop:
            '\u5C06\u60A8\u7684\u7535\u5B50\u8868\u683C\u62D6\u653E\u5230\u6B64\u5904\uFF0C\u6216\u5728\u4E0B\u65B9\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u3002\u652F\u6301\u7684\u683C\u5F0F\uFF1A.csv\uFF0C.txt\uFF0C .xls\u548C.xlsx\u3002',
        chooseSpreadsheet:
            '\u9009\u62E9\u8981\u5BFC\u5165\u7684\u7535\u5B50\u8868\u683C\u6587\u4EF6\u3002\u652F\u6301\u7684\u683C\u5F0F\u6709\uFF1A.csv\u3001.txt\u3001.xls \u548C .xlsx\u3002',
        fileContainsHeader: '\u6587\u4EF6\u5305\u542B\u5217\u6807\u9898',
        column: ({name}: SpreadSheetColumnParams) => `\u5217 ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `\u7CDF\u7CD5\uFF01\u5FC5\u586B\u5B57\u6BB5\uFF08"${fieldName}"\uFF09\u5C1A\u672A\u6620\u5C04\u3002\u8BF7\u68C0\u67E5\u540E\u518D\u8BD5\u3002`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `\u54CE\u5440\uFF01\u60A8\u5DF2\u5C06\u5355\u4E2A\u5B57\u6BB5\uFF08"${fieldName}"\uFF09\u6620\u5C04\u5230\u591A\u4E2A\u5217\u3002\u8BF7\u68C0\u67E5\u5E76\u518D\u8BD5\u4E00\u6B21\u3002`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `\u54CE\u5440\uFF01\u5B57\u6BB5\uFF08"${fieldName}"\uFF09\u5305\u542B\u4E00\u4E2A\u6216\u591A\u4E2A\u7A7A\u503C\u3002\u8BF7\u68C0\u67E5\u5E76\u518D\u8BD5\u4E00\u6B21\u3002`,
        importSuccessfullTitle: '\u6210\u529F\u5BFC\u5165',
        importCategoriesSuccessfullDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `\u5DF2\u6DFB\u52A0 ${categories} \u4E2A\u7C7B\u522B\u3002` : '\u5DF2\u6DFB\u52A01\u4E2A\u7C7B\u522B\u3002',
        importMembersSuccessfullDescription: ({members}: ImportMembersSuccessfullDescriptionParams) =>
            members > 1 ? `\u5DF2\u6DFB\u52A0\u4E86${members}\u540D\u6210\u5458\u3002` : '\u5DF2\u6DFB\u52A01\u4F4D\u6210\u5458\u3002',
        importTagsSuccessfullDescription: ({tags}: ImportTagsSuccessfullDescriptionParams) =>
            tags > 1 ? `\u5DF2\u6DFB\u52A0 ${tags} \u6807\u7B7E\u3002` : '\u5DF2\u6DFB\u52A01\u4E2A\u6807\u7B7E\u3002',
        importPerDiemRatesSuccessfullDescription: ({rates}: ImportPerDiemRatesSuccessfullDescriptionParams) =>
            rates > 1 ? `\u5DF2\u6DFB\u52A0${rates}\u6BCF\u65E5\u8D39\u7387\u3002` : '\u5DF2\u6DFB\u52A01\u4E2A\u6BCF\u65E5\u8D39\u7387\u3002',
        importFailedTitle: '\u5BFC\u5165\u5931\u8D25',
        importFailedDescription:
            '\u8BF7\u786E\u4FDD\u6240\u6709\u5B57\u6BB5\u90FD\u5DF2\u6B63\u786E\u586B\u5199\uFF0C\u7136\u540E\u518D\u8BD5\u4E00\u6B21\u3002\u5982\u679C\u95EE\u9898\u4ECD\u7136\u5B58\u5728\uFF0C\u8BF7\u8054\u7CFB\u793C\u5BBE\u90E8\u3002',
        importDescription:
            '\u901A\u8FC7\u70B9\u51FB\u4E0B\u65B9\u5BFC\u5165\u5217\u65C1\u8FB9\u7684\u4E0B\u62C9\u83DC\u5355\uFF0C\u9009\u62E9\u8981\u4ECE\u60A8\u7684\u7535\u5B50\u8868\u683C\u4E2D\u6620\u5C04\u7684\u5B57\u6BB5\u3002',
        sizeNotMet: '\u6587\u4EF6\u5927\u5C0F\u5FC5\u987B\u5927\u4E8E0\u5B57\u8282',
        invalidFileMessage:
            '\u60A8\u4E0A\u4F20\u7684\u6587\u4EF6\u8981\u4E48\u4E3A\u7A7A\uFF0C\u8981\u4E48\u5305\u542B\u65E0\u6548\u6570\u636E\u3002\u8BF7\u786E\u4FDD\u6587\u4EF6\u683C\u5F0F\u6B63\u786E\u5E76\u5305\u542B\u5FC5\u8981\u7684\u4FE1\u606F\uFF0C\u7136\u540E\u518D\u6B21\u4E0A\u4F20\u3002',
        importSpreadsheet: '\u5BFC\u5165\u7535\u5B50\u8868\u683C',
        downloadCSV: '\u4E0B\u8F7D CSV',
    },
    receipt: {
        upload: '\u4E0A\u4F20\u6536\u636E',
        dragReceiptBeforeEmail: '\u5C06\u6536\u636E\u62D6\u5230\u6B64\u9875\u9762\u4E0A\uFF0C\u5C06\u6536\u636E\u8F6C\u53D1\u5230',
        dragReceiptAfterEmail: '\u6216\u5728\u4E0B\u65B9\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6\u8FDB\u884C\u4E0A\u4F20\u3002',
        chooseReceipt: '\u9009\u62E9\u4E00\u4E2A\u6536\u636E\u8FDB\u884C\u4E0A\u4F20\uFF0C\u6216\u8005\u5C06\u6536\u636E\u8F6C\u53D1\u81F3',
        takePhoto: '\u62CD\u7167',
        cameraAccess: '\u9700\u8981\u8BBF\u95EE\u76F8\u673A\u4EE5\u62CD\u6444\u6536\u636E\u7684\u7167\u7247\u3002',
        deniedCameraAccess: '\u76F8\u673A\u8BBF\u95EE\u6743\u9650\u4ECD\u672A\u83B7\u5F97\uFF0C\u8BF7\u6309\u7167',
        deniedCameraAccessInstructions: '\u8FD9\u4E9B\u6307\u4EE4',
        cameraErrorTitle: '\u76F8\u673A\u9519\u8BEF',
        cameraErrorMessage: '\u62CD\u7167\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        locationAccessTitle: '\u5141\u8BB8\u4F4D\u7F6E\u8BBF\u95EE',
        locationAccessMessage:
            '\u4F4D\u7F6E\u8BBF\u95EE\u5E2E\u52A9\u6211\u4EEC\u4FDD\u6301\u60A8\u7684\u65F6\u533A\u548C\u8D27\u5E01\u51C6\u786E\u65E0\u8BEF\uFF0C\u65E0\u8BBA\u60A8\u8D70\u5230\u54EA\u91CC\u3002',
        locationErrorTitle: '\u5141\u8BB8\u4F4D\u7F6E\u8BBF\u95EE',
        locationErrorMessage:
            '\u4F4D\u7F6E\u8BBF\u95EE\u5E2E\u52A9\u6211\u4EEC\u4FDD\u6301\u60A8\u7684\u65F6\u533A\u548C\u8D27\u5E01\u51C6\u786E\u65E0\u8BEF\uFF0C\u65E0\u8BBA\u60A8\u8D70\u5230\u54EA\u91CC\u3002',
        allowLocationFromSetting: `Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '\u8BA9\u5B83\u8D70',
        dropMessage: '\u5728\u6B64\u5904\u653E\u7F6E\u60A8\u7684\u6587\u4EF6',
        flash: '\u95EA\u5B58',
        shutter: '\u5FEB\u9580',
        gallery: '\u753B\u5ECA',
        deleteReceipt: '\u5220\u9664\u6536\u636E',
        deleteConfirmation: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u6536\u636E\u5417\uFF1F',
        addReceipt: '\u6DFB\u52A0\u6536\u636E',
    },
    quickAction: {
        scanReceipt: '\u626B\u63CF\u6536\u636E',
        recordDistance: '\u8BB0\u5F55\u8DDD\u79BB',
        requestMoney: '\u521B\u5EFA\u8D39\u7528',
        splitBill: '\u5206\u62C5\u8D39\u7528',
        splitScan: '\u5206\u5272\u6536\u636E',
        splitDistance: '\u5206\u5272\u8DDD\u79BB',
        paySomeone: ({name}: PaySomeoneParams = {}) => `\u652F\u4ED8 ${name ?? '某人'}`,
        assignTask: '\u5206\u914D\u4EFB\u52D9',
        header: '\u5FEB\u901F\u884C\u52A8',
        trackManual: '\u521B\u5EFA\u8D39\u7528',
        trackScan: '\u626B\u63CF\u6536\u636E',
        trackDistance: '\u8DDF\u8E2A\u8DDD\u79BB',
        noLongerHaveReportAccess:
            '\u60A8\u5DF2\u65E0\u6CD5\u8BBF\u95EE\u60A8\u4E4B\u524D\u7684\u5FEB\u901F\u64CD\u4F5C\u76EE\u7684\u5730\u3002\u8BF7\u5728\u4E0B\u9762\u9009\u62E9\u4E00\u4E2A\u65B0\u7684\u3002',
        updateDestination: '\u66F4\u65B0\u76EE\u7684\u5730',
    },
    iou: {
        amount: '\u6570\u91CF',
        taxAmount: '\u7A0E\u6B3E\u91D1\u989D',
        taxRate: '\u7A0E\u7387',
        approve: '\u6279\u51C6',
        approved: '\u6279\u51C6',
        cash: '\u73B0\u91D1',
        card: '\u5361\u7247',
        original: '\u539F\u6587',
        split: '\u5206\u5272',
        splitExpense: '\u5206\u62C5\u8D39\u7528',
        paySomeone: ({name}: PaySomeoneParams = {}) => `\u652F\u4ED8 ${name ?? '某人'}`,
        expense: '\u8D39\u7528',
        categorize: '\u5206\u7C7B',
        share: '\u5206\u4EAB',
        participants: '\u53C2\u4E0E\u8005',
        createExpense: '\u521B\u5EFA\u8D39\u7528',
        chooseRecipient: '\u9009\u62E9\u63A5\u6536\u8005',
        createExpenseWithAmount: ({amount}: {amount: string}) => `\u521B\u5EFA ${amount} \u8D39\u7528`,
        confirmDetails: '\u786E\u8BA4\u8BE6\u7EC6\u4FE1\u606F',
        pay: '\u652F\u4ED8',
        cancelPayment: '\u53D6\u6D88\u4ED8\u6B3E',
        cancelPaymentConfirmation: '\u4F60\u786E\u5B9A\u8981\u53D6\u6D88\u8FD9\u7B14\u4ED8\u6B3E\u5417\uFF1F',
        viewDetails: '\u67E5\u770B\u8BE6\u60C5',
        pending:
            '\u7531\u4E8E\u60A8\u672A\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u65E0\u6CD5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        canceled: '\u5DF2\u53D6\u6D88',
        posted: '\u53D1\u5E03',
        deleteReceipt: '\u5220\u9664\u6536\u636E',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `\u5728\u6B64\u62A5\u544A\u4E2D\u5220\u9664\u4E86\u4E00\u9879\u8D39\u7528\uFF0C${merchant} - ${amount}`,
        pendingMatchWithCreditCard: '\u7B49\u5F85\u4E0E\u5361\u4EA4\u6613\u5339\u914D\u7684\u6536\u636E',
        pendingMatchWithCreditCardDescription: '\u7B49\u5F85\u4E0E\u5361\u4EA4\u6613\u5339\u914D\u7684\u6536\u636E\u3002\u6807\u8BB0\u4E3A\u73B0\u91D1\u4EE5\u53D6\u6D88\u3002',
        markAsCash: '\u6807\u8BB0\u4E3A\u73B0\u91D1',
        routePending: '\u8DEF\u7531\u5F85\u5B9A...',
        receiptScanning: () => ({
            one: '\u63A5\u6536\u6383\u63CF\u4E2D...',
            other: '\u6B63\u5728\u626B\u63CF\u6536\u636E...',
        }),
        receiptScanInProgress: '\u6B63\u5728\u8FDB\u884C\u6536\u636E\u626B\u63CF',
        receiptScanInProgressDescription: '\u6B63\u5728\u8FDB\u884C\u6536\u636E\u626B\u63CF\u3002\u7A0D\u540E\u518D\u68C0\u67E5\u6216\u73B0\u5728\u8F93\u5165\u8BE6\u7EC6\u4FE1\u606F\u3002',
        receiptIssuesFound: () => ({
            one: '\u53D1\u73B0\u95EE\u9898',
            other: '\u53D1\u73B0\u7684\u95EE\u9898',
        }),
        fieldPending: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        defaultRate: '\u9ED8\u8BA4\u7387',
        receiptMissingDetails: '\u6536\u64DA\u7F3A\u5C11\u8A73\u7D30\u4FE1\u606F',
        missingAmount: '\u7F3A\u5C11\u6578\u91CF',
        missingMerchant: '\u7F3A\u5C11\u5546\u5BB6',
        receiptStatusTitle: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that needs to be translated?',
        receiptStatusText:
            '\u53EA\u6709\u60A8\u53EF\u4EE5\u5728\u6383\u63CF\u6642\u770B\u5230\u6B64\u6536\u64DA\u3002\u7A0D\u5F8C\u518D\u6AA2\u67E5\u6216\u73FE\u5728\u8F38\u5165\u8A73\u7D30\u8CC7\u8A0A\u3002',
        receiptScanningFailed: '\u6536\u64DA\u6383\u63CF\u5931\u6557\u3002\u8ACB\u624B\u52D5\u8F38\u5165\u8A73\u7D30\u4FE1\u606F\u3002',
        transactionPendingDescription: '\u4EA4\u6613\u5F85\u5B9A\u3002\u53EF\u80FD\u9700\u8981\u51E0\u5929\u624D\u80FD\u53D1\u5E03\u3002',
        companyInfo: '\u516C\u53F8\u4FE1\u606F',
        companyInfoDescription: '\u5728\u60A8\u53D1\u9001\u7B2C\u4E00\u4EFD\u53D1\u7968\u4E4B\u524D\uFF0C\u6211\u4EEC\u9700\u8981\u66F4\u591A\u7684\u8BE6\u7EC6\u4FE1\u606F\u3002',
        yourCompanyName: '\u60A8\u7684\u516C\u53F8\u540D\u79F0',
        yourCompanyWebsite: '\u60A8\u7684\u516C\u53F8\u7F51\u7AD9',
        yourCompanyWebsiteNote:
            '\u5982\u679C\u60A8\u6CA1\u6709\u7F51\u7AD9\uFF0C\u60A8\u53EF\u4EE5\u63D0\u4F9B\u60A8\u516C\u53F8\u7684LinkedIn\u6216\u793E\u4EA4\u5A92\u4F53\u8D44\u6599\u4EE3\u66FF\u3002',
        invalidDomainError: '\u60A8\u5DF2\u8F93\u5165\u4E86\u65E0\u6548\u7684\u57DF\u540D\u3002\u8981\u7EE7\u7EED\uFF0C\u8BF7\u8F93\u5165\u6709\u6548\u7684\u57DF\u540D\u3002',
        publicDomainError: '\u60A8\u5DF2\u8FDB\u5165\u516C\u5171\u9886\u57DF\u3002\u8981\u7EE7\u7EED\uFF0C\u8BF7\u8F93\u5165\u79C1\u4EBA\u9886\u57DF\u3002',
        expenseCount: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`\u6B63\u5728\u626B\u63CF ${scanningReceipts}`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} pending`);
            }
            return {
                one: statusText.length > 0 ? `1\u9879\u8D39\u7528\uFF08${statusText.join(', ')}\uFF09` : `1 expense`,
                other: (count: number) => (statusText.length > 0 ? `${count} expenses (${statusText.join(', ')})` : `${count} expenses`),
            };
        },
        deleteExpense: () => ({
            one: '\u5220\u9664\u8D39\u7528',
            other: '\u5220\u9664\u8D39\u7528',
        }),
        deleteConfirmation: () => ({
            one: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D39\u7528\u5417\uFF1F',
            other: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u8D39\u7528\u5417\uFF1F',
        }),
        settledExpensify: '\u5DF2\u4ED8\u6B3E',
        settledElsewhere: '\u5728\u5176\u4ED6\u5730\u65B9\u652F\u4ED8',
        individual: '\u4E2A\u4F53',
        business: '\u5546\u4E1A',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `\u7528Expensify\u652F\u4ED8${formattedAmount}` : `Pay with Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `\u652F\u4ED8 ${formattedAmount} \u4F5C\u4E3A\u4E2A\u4EBA` : `Pay as an individual`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `\u652F\u4ED8 ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `\u4F5C\u4E3A\u5546\u4E1A\u652F\u4ED8${formattedAmount}` : `Pay as a business`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `\u5728\u5176\u4ED6\u5730\u65B9\u652F\u4ED8 ${formattedAmount}` : `Pay elsewhere`),
        nextStep: '\u4E0B\u4E00\u6B65',
        finished: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u6CA1\u6709\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        sendInvoice: ({amount}: RequestAmountParams) => `\u53D1\u9001 ${amount} \u53D1\u7968`,
        submitAmount: ({amount}: RequestAmountParams) => `\u63D0\u4EA4 ${amount}`,
        submittedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `submitted ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        automaticallySubmittedAmount: ({formattedAmount}: RequestedAmountMessageParams) =>
            `\u81EA\u52A8\u63D0\u4EA4\u4E86 ${formattedAmount} \u901A\u8FC7<a href="${CONST.DELAYED_SUBMISSION_HELP_URL}">\u5EF6\u8FDF\u63D0\u4EA4</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracking ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `\u5206\u5272 ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `\u60A8\u7684\u5206\u5272 ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} owes ${amount}${comment ? ` for ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} owes: `,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} paid: `,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} spent ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} spent: `,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} approved:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} approved ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `\u652F\u4ED8\u4E86 ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) =>
            `\u652F\u4ED8\u4E86${amount}\u3002\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4EE5\u63A5\u6536\u60A8\u7684\u4ED8\u6B3E\u3002`,
        automaticallyApprovedAmount: ({amount}: ApprovedAmountParams) =>
            `\u6839\u636E<a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">\u5DE5\u4F5C\u533A\u89C4\u5219</a>\u81EA\u52A8\u6279\u51C6\u4E86 ${amount}`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `\u5DF2\u6279\u51C6 ${amount}`,
        unapprovedAmount: ({amount}: UnapprovedParams) => `\u672A\u6279\u51C6\u7684 ${amount}`,
        automaticallyForwardedAmount: ({amount}: ForwardedAmountParams) =>
            `\u6839\u636E<a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">\u5DE5\u4F5C\u533A\u89C4\u5219</a>\u81EA\u52A8\u6279\u51C6\u4E86 ${amount}`,
        forwardedAmount: ({amount}: ForwardedAmountParams) => `\u5DF2\u6279\u51C6 ${amount}`,
        rejectedThisReport: '\u62D2\u7EDD\u4E86\u8FD9\u4EFD\u62A5\u544A',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\u5DF2\u5F00\u59CB\u7ED3\u7B97\u3002\u5728${submitterDisplayName}\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4E4B\u524D\uFF0C\u4ED8\u6B3E\u5C06\u88AB\u6682\u505C\u3002`,
        adminCanceledRequest: ({manager, amount}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''}canceled the ${amount} payment`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `\u53D6\u6D88\u4E86${amount}\u7684\u4ED8\u6B3E\uFF0C\u56E0\u4E3A${submitterDisplayName}\u572830\u5929\u5185\u6CA1\u6709\u542F\u7528\u4ED6\u4EEC\u7684Expensify\u94B1\u5305`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhereWithAmount: ({payer, amount}: PaidElsewhereWithAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount} elsewhere`,
        paidWithExpensifyWithAmount: ({payer, amount}: PaidWithExpensifyWithAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount} with Expensify`,
        automaticallyPaidWithExpensify: ({payer, amount}: PaidWithExpensifyWithAmountParams) =>
            `${payer ? `${payer} ` : ''}automatically paid ${amount} with Expensify via <a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">workspace rules</a>`,
        noReimbursableExpenses: '\u6B64\u62A5\u544A\u7684\u91D1\u989D\u65E0\u6548',
        pendingConversionMessage: '\u5F53\u4F60\u91CD\u65B0\u5728\u7EBF\u65F6\uFF0C\u603B\u6570\u5C06\u4F1A\u66F4\u65B0',
        changedTheExpense: '\u66F4\u6539\u4E86\u8D39\u7528',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `\u5C07 ${valueName} \u8F49\u8B8A\u70BA ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `\u5C07 ${translatedChangedField} \u8A2D\u7F6E\u70BA ${newMerchant}\uFF0C\u4E26\u5C07\u91D1\u984D\u8A2D\u7F6E\u70BA ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) =>
            `\u5C07 ${valueName} \u66F4\u6539\u70BA ${newValueToDisplay}\uFF08\u539F\u5148\u70BA ${oldValueToDisplay}\uFF09`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `\u5DF2\u5C06${translatedChangedField}\u66F4\u6539\u4E3A${newMerchant}\uFF08\u4E4B\u524D\u4E3A${oldMerchant}\uFF09\uFF0C\u66F4\u65B0\u7684\u91D1\u989D\u4E3A${newAmountToDisplay}\uFF08\u4E4B\u524D\u4E3A${oldAmountToDisplay}\uFF09`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `for ${comment}` : 'expense'}`,
        threadTrackReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `\u8FFD\u8E64 ${formattedAmount} ${comment ? `為了 ${comment}` : ''}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} sent${comment ? ` for ${comment}` : ''}`,
        movedFromSelfDM: ({workspaceName, reportName}: MovedFromSelfDMParams) => `\u5DF2\u5C07\u8CBB\u7528\u5F9E\u81EA\u6211DM\u79FB\u81F3 ${workspaceName ?? `與${reportName}的聊天`}`,
        movedToSelfDM: '\u5C06\u8D39\u7528\u79FB\u81F3\u81EA\u6211DM',
        tagSelection: '\u9009\u62E9\u4E00\u4E2A\u6807\u7B7E\u4EE5\u66F4\u597D\u5730\u7EC4\u7EC7\u60A8\u7684\u652F\u51FA\u3002',
        categorySelection: '\u9009\u62E9\u4E00\u4E2A\u7C7B\u522B\u4EE5\u66F4\u597D\u5730\u7EC4\u7EC7\u60A8\u7684\u652F\u51FA\u3002',
        error: {
            invalidCategoryLength:
                '\u5206\u7C7B\u540D\u79F0\u8D85\u8FC7255\u4E2A\u5B57\u7B26\u3002\u8BF7\u7F29\u77ED\u5B83\u6216\u9009\u62E9\u4E00\u4E2A\u4E0D\u540C\u7684\u5206\u7C7B\u3002',
            invalidAmount: '\u8ACB\u5728\u7E7C\u7E8C\u4E4B\u524D\u8F38\u5165\u6709\u6548\u7684\u91D1\u984D\u3002',
            invalidIntegerAmount: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u8F93\u5165\u6574\u7F8E\u5143\u91D1\u989D\u3002',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `\u6700\u9AD8\u7A0E\u989D\u662F ${amount}`,
            invalidSplit: '\u62C6\u5206\u7684\u603B\u548C\u5FC5\u987B\u7B49\u4E8E\u603B\u91D1\u989D\u3002',
            invalidSplitParticipants: '\u8BF7\u4E3A\u81F3\u5C11\u4E24\u4F4D\u53C2\u4E0E\u8005\u8F93\u5165\u5927\u4E8E\u96F6\u7684\u91D1\u989D\u3002',
            invalidSplitYourself: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u975E\u96F6\u7684\u62C6\u5206\u91D1\u989D\u3002',
            noParticipantSelected: '\u8BF7\u9009\u62E9\u4E00\u4F4D\u53C2\u4E0E\u8005\u3002',
            other: '\u610F\u5916\u7684\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericCreateFailureMessage: '\u63D0\u4EA4\u6B64\u8D39\u7528\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericCreateInvoiceFailureMessage: '\u53D1\u9001\u6B64\u53D1\u7968\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericHoldExpenseFailureMessage: '\u9047\u5230\u610F\u5916\u9519\u8BEF\u5904\u7406\u6B64\u8D39\u7528\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericUnholdExpenseFailureMessage: '\u89E3\u9664\u6B64\u8D39\u7528\u6682\u505C\u72B6\u6001\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            receiptDeleteFailureError: '\u5220\u9664\u6B64\u6536\u636E\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            receiptFailureMessage: '\u6536\u64DA\u672A\u4E0A\u50B3\u3002',
            // eslint-disable-next-line rulesdir/use-periods-for-error-messages
            saveFileMessage: '\u4E0B\u8F7D\u6587\u4EF6',
            loseFileMessage: '\u6216\u8005\u5FFD\u7565\u6B64\u9519\u8BEF\u5E76\u4E22\u5931\u5B83\u3002',
            genericDeleteFailureMessage: '\u5220\u9664\u6B64\u8D39\u7528\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericEditFailureMessage: '\u7F16\u8F91\u6B64\u8D39\u7528\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericSmartscanFailureMessage: '\u4EA4\u6613\u7F3A\u5C11\u5B57\u6BB5\u3002',
            duplicateWaypointsErrorMessage: '\u8BF7\u5220\u9664\u91CD\u590D\u7684\u822A\u70B9\u3002',
            atLeastTwoDifferentWaypoints: '\u8BF7\u81F3\u5C11\u8F93\u5165\u4E24\u4E2A\u4E0D\u540C\u7684\u5730\u5740\u3002',
            splitExpenseMultipleParticipantsErrorMessage:
                '\u4E00\u4E2A\u8D39\u7528\u4E0D\u80FD\u5728\u5DE5\u4F5C\u533A\u548C\u5176\u4ED6\u6210\u5458\u4E4B\u95F4\u5206\u644A\u3002\u8BF7\u66F4\u65B0\u60A8\u7684\u9009\u62E9\u3002',
            invalidMerchant: '\u8ACB\u8F38\u5165\u6B63\u78BA\u7684\u5546\u5BB6\u3002',
            atLeastOneAttendee: '\u81F3\u5C11\u5FC5\u987B\u9009\u62E9\u4E00\u4F4D\u53C2\u4E0E\u8005',
            invalidQuantity: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u6570\u91CF\u3002',
            quantityGreaterThanZero: '\u6570\u91CF\u5FC5\u987B\u5927\u4E8E\u96F6\u3002',
            invalidSubrateLength: '\u81F3\u5C11\u5FC5\u987B\u6709\u4E00\u4E2A\u5B50\u7387\u3002',
            invalidRate:
                '\u6B64\u5DE5\u4F5C\u7A7A\u95F4\u7684\u8D39\u7387\u65E0\u6548\u3002\u8BF7\u4ECE\u5DE5\u4F5C\u7A7A\u95F4\u4E2D\u9009\u62E9\u4E00\u4E2A\u53EF\u7528\u7684\u8D39\u7387\u3002',
        },
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\u5DF2\u5F00\u59CB\u7ED3\u7B97\u3002\u76F4\u5230${submitterDisplayName}\u542F\u7528\u4ED6\u4EEC\u7684\u94B1\u5305\uFF0C\u4ED8\u6B3E\u5C06\u88AB\u6682\u505C\u3002`,
        enableWallet: '\u542F\u7528\u94B1\u5305',
        hold: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that you want to translate into Chinese?',
        unhold: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        holdExpense: '\u4FDD\u6301\u8D39\u7528',
        unholdExpense: '\u672A\u6301\u6709\u8D39\u7528',
        heldExpense: '\u627F\u62C5\u8FD9\u4E2A\u8D39\u7528',
        unheldExpense: '\u672A\u6301\u6709\u6B64\u8D39\u7528',
        explainHold: '\u89E3\u91CB\u4F60\u70BA\u4EC0\u9EBC\u8981\u627F\u64D4\u9019\u500B\u8CBB\u7528\u3002',
        reason: '\u539F\u56E0',
        holdReasonRequired: '\u5F53\u6301\u6709\u65F6\u9700\u8981\u4E00\u4E2A\u7406\u7531\u3002',
        expenseOnHold: '\u6B64\u8D39\u7528\u5DF2\u88AB\u6682\u505C\u3002\u8BF7\u67E5\u9605\u8BC4\u8BBA\u4EE5\u4E86\u89E3\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
        expensesOnHold: '\u6240\u6709\u8D39\u7528\u90FD\u5DF2\u6682\u505C\u3002\u8BF7\u67E5\u770B\u8BC4\u8BBA\u4EE5\u4E86\u89E3\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
        expenseDuplicate:
            '\u6B64\u8D39\u7528\u4E0E\u53E6\u4E00\u9879\u8D39\u7528\u7684\u8BE6\u7EC6\u4FE1\u606F\u76F8\u540C\u3002\u8BF7\u67E5\u770B\u91CD\u590D\u9879\u4EE5\u89E3\u9664\u4FDD\u7559\u3002',
        someDuplicatesArePaid: '\u8FD9\u4E9B\u91CD\u590D\u9879\u4E2D\u7684\u4E00\u4E9B\u5DF2\u7ECF\u88AB\u6279\u51C6\u6216\u5DF2\u7ECF\u652F\u4ED8\u3002',
        reviewDuplicates: '\u590D\u67E5\u91CD\u590D\u9879',
        keepAll:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u9700\u8981\u7FFB\u8BD1\u7684\u5185\u5BB9\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        confirmApprove: '\u786E\u8BA4\u6279\u51C6\u91D1\u989D',
        confirmApprovalAmount: '\u6279\u51C6\u53EA\u7B26\u5408\u89C4\u5B9A\u7684\u8D39\u7528\uFF0C\u6216\u6279\u51C6\u6574\u4E2A\u62A5\u544A\u3002',
        confirmApprovalAllHoldAmount: () => ({
            one: '\u6B64\u8D39\u7528\u5DF2\u88AB\u6682\u505C\u3002\u4F60\u8FD8\u60F3\u7EE7\u7EED\u6279\u51C6\u5417\uFF1F',
            other: '\u8FD9\u4E9B\u8D39\u7528\u6B63\u5728\u7B49\u5F85\u5904\u7406\u3002\u4F60\u8FD8\u662F\u60F3\u8981\u6279\u51C6\u5417\uFF1F',
        }),
        confirmPay: '\u786E\u8BA4\u652F\u4ED8\u91D1\u989D',
        confirmPayAmount: '\u652F\u4ED8\u672A\u88AB\u4FDD\u7559\u7684\u90E8\u5206\uFF0C\u6216\u652F\u4ED8\u6574\u4E2A\u62A5\u544A\u3002',
        confirmPayAllHoldAmount: () => ({
            one: '\u6B64\u8D39\u7528\u5DF2\u88AB\u6682\u505C\u3002\u4F60\u8FD8\u60F3\u8981\u7EE7\u7EED\u652F\u4ED8\u5417\uFF1F',
            other: '\u8FD9\u4E9B\u8D39\u7528\u5DF2\u88AB\u6682\u505C\u3002\u4F60\u8FD8\u60F3\u8981\u7EE7\u7EED\u652F\u4ED8\u5417\uFF1F',
        }),
        payOnly: '\u4EC5\u652F\u4ED8',
        approveOnly: '\u4EC5\u6279\u51C6',
        holdEducationalTitle: '\u8FD9\u4E2A\u8BF7\u6C42\u5728',
        holdEducationalText:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        whatIsHoldExplain: '\u4FDD\u7559\u5C31\u50CF\u5728\u6279\u51C6\u6216\u4ED8\u6B3E\u524D\u6309\u201C\u6682\u505C\u201D\u8981\u6C42\u66F4\u591A\u8BE6\u60C5\u3002',
        holdIsLeftBehind: '\u5373\u4F7F\u60A8\u6279\u51C6\u6574\u4E2A\u62A5\u544A\uFF0C\u4FDD\u7559\u7684\u8D39\u7528\u4E5F\u4F1A\u88AB\u7559\u4E0B\u3002',
        unholdWhenReady: '\u5F53\u60A8\u51C6\u5907\u6279\u51C6\u6216\u652F\u4ED8\u65F6\uFF0C\u53D6\u6D88\u6263\u9664\u8D39\u7528\u3002',
        set: '\u8BBE\u7F6E',
        changed:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        removed: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        transactionPending: '\u4EA4\u6613\u5F85\u5B9A\u3002',
        chooseARate: '\u9009\u62E9\u6BCF\u82F1\u91CC\u6216\u6BCF\u516C\u91CC\u7684\u5DE5\u4F5C\u533A\u62A5\u9500\u7387',
        unapprove: '\u4E0D\u6279\u51C6',
        unapproveReport: '\u4E0D\u6279\u51C6\u62A5\u544A',
        headsUp: '\u5C0F\u5FC3\uFF01',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `\u6B64\u62A5\u544A\u5DF2\u7ECF\u5BFC\u51FA\u5230${accountingIntegration}\u3002\u5728Expensify\u4E2D\u5BF9\u6B64\u62A5\u544A\u8FDB\u884C\u66F4\u6539\u53EF\u80FD\u4F1A\u5BFC\u81F4\u6570\u636E\u4E0D\u4E00\u81F4\u548CExpensify\u5361\u5BF9\u8D26\u95EE\u9898\u3002\u60A8\u786E\u5B9A\u8981\u53D6\u6D88\u6279\u51C6\u6B64\u62A5\u544A\u5417\uFF1F`,
        reimbursable: '\u53EF\u62A5\u9500\u7684',
        nonReimbursable: '\u4E0D\u53EF\u9000\u6B3E',
        bookingPending: '\u9019\u500B\u9810\u8A02\u6B63\u5728\u7B49\u5F85\u5BE9\u6838',
        bookingPendingDescription: '\u6B64\u9810\u8A02\u5C1A\u672A\u4ED8\u6B3E\uFF0C\u56E0\u6B64\u4ECD\u5728\u7B49\u5F85\u4E2D\u3002',
        bookingArchived: '\u6B64\u9810\u8A02\u5DF2\u5B58\u6A94',
        bookingArchivedDescription:
            '\u6B64\u9810\u8A02\u5DF2\u5B58\u6A94\uFF0C\u56E0\u70BA\u65C5\u884C\u65E5\u671F\u5DF2\u904E\u3002\u5982\u6709\u9700\u8981\uFF0C\u8ACB\u70BA\u6700\u7D42\u91D1\u984D\u6DFB\u52A0\u8CBB\u7528\u3002',
        attendees: '\u53C2\u4E0E\u8005',
        paymentComplete: '\u4ED8\u6B3E\u5B8C\u6210',
        time: '\u65F6\u95F4',
        startDate: '\u5F00\u59CB\u65E5\u671F',
        endDate: '\u7ED3\u675F\u65E5\u671F',
        startTime: '\u5F00\u59CB\u65F6\u95F4',
        endTime: '\u7ED3\u675F\u65F6\u95F4',
        deleteSubrate: '\u5220\u9664\u5B50\u7387',
        deleteSubrateConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u5B50\u8D39\u7387\u5417\uFF1F',
        quantity: '\u6570\u91CF',
        subrateSelection: '\u9009\u62E9\u4E00\u4E2A\u5B50\u8D39\u7387\u5E76\u8F93\u5165\u6570\u91CF\u3002',
        qty: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u6216\u4E0D\u6E05\u6670\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u4EE5\u4FBF\u8FDB\u884C\u7FFB\u8BD1\u3002',
        firstDayText: () => ({
            one: `First day: 1 hour`,
            other: (count: number) => `\u9996\u65E5\uFF1A${count.toFixed(2)} \u5C0F\u65F6`,
        }),
        lastDayText: () => ({
            one: `Last day: 1 hour`,
            other: (count: number) => `\u6700\u540E\u4E00\u5929\uFF1A${count.toFixed(2)}\u5C0F\u65F6`,
        }),
        tripLengthText: () => ({
            one: `Trip: 1 full day`,
            other: (count: number) => `\u65C5\u7A0B\uFF1A${count}\u6574\u5929`,
        }),
        dates: '\u65E5\u671F',
        rates: '\u8D39\u7387',
        submitsTo: ({name}: SubmitsToParams) => `\u63D0\u4EA4\u7ED9 ${name}`,
    },
    notificationPreferencesPage: {
        header: '\u901A\u77E5\u504F\u597D\u8BBE\u7F6E',
        label: '\u901A\u77E5\u6211\u6709\u5173\u65B0\u6D88\u606F',
        notificationPreferences: {
            always: '\u7ACB\u5373',
            daily: '\u6BCF\u65E5',
            mute: '\u9759\u97F3',
            hidden: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u62EC\u53F7\u5185\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        },
    },
    loginField: {
        numberHasNotBeenValidated:
            '\u8A72\u865F\u78BC\u5C1A\u672A\u9A57\u8B49\u3002\u9EDE\u64CA\u6309\u9215\u4EE5\u901A\u904E\u77ED\u4FE1\u91CD\u65B0\u767C\u9001\u9A57\u8B49\u93C8\u63A5\u3002',
        emailHasNotBeenValidated:
            '\u96FB\u5B50\u90F5\u4EF6\u5C1A\u672A\u9A57\u8B49\u3002\u9EDE\u64CA\u6309\u9215\u4EE5\u901A\u904E\u77ED\u4FE1\u91CD\u65B0\u767C\u9001\u9A57\u8B49\u93C8\u63A5\u3002',
    },
    avatarWithImagePicker: {
        uploadPhoto: '\u4E0A\u4F20\u7167\u7247',
        removePhoto: '\u5220\u9664\u7167\u7247',
        editImage: '\u7F16\u8F91\u7167\u7247',
        viewPhoto: '\u67E5\u770B\u7167\u7247',
        imageUploadFailed: '\u5716\u7247\u4E0A\u50B3\u5931\u6557',
        deleteWorkspaceError: '\u5BF9\u4E0D\u8D77\uFF0C\u5220\u9664\u60A8\u7684\u5DE5\u4F5C\u533A\u5934\u50CF\u65F6\u51FA\u73B0\u4E86\u610F\u5916\u95EE\u9898',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `\u6240\u9078\u7684\u5716\u7247\u8D85\u904E\u4E86\u6700\u5927\u4E0A\u50B3\u5927\u5C0F ${maxUploadSizeInMB} MB\u3002`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `\u8BF7\u4E0A\u4F20\u4E00\u5F20\u5927\u4E8E ${minHeightInPx}x${minWidthInPx} \u50CF\u7D20\u4E14\u5C0F\u4E8E ${maxHeightInPx}x${maxWidthInPx} \u50CF\u7D20\u7684\u56FE\u7247\u3002`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) =>
            `\u4E2A\u4EBA\u8D44\u6599\u56FE\u7247\u5FC5\u987B\u662F\u4EE5\u4E0B\u7C7B\u578B\u4E4B\u4E00\uFF1A${allowedExtensions.join(', ')}\u3002`,
    },
    profilePage: {
        profile: '\u500B\u4EBA\u8CC7\u6599',
        preferredPronouns: '\u9996\u9009\u4EE3\u8BCD',
        selectYourPronouns: '\u9009\u62E9\u4F60\u7684\u4EE3\u8BCD',
        selfSelectYourPronoun: '\u81EA\u9078\u4F60\u7684\u4EE3\u8A5E',
        emailAddress: '\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
        setMyTimezoneAutomatically: '\u81EA\u52A8\u8BBE\u7F6E\u6211\u7684\u65F6\u533A',
        timezone: '\u65F6\u533A',
        invalidFileMessage: '\u65E0\u6548\u7684\u6587\u4EF6\u3002\u8BF7\u5C1D\u8BD5\u4E0D\u540C\u7684\u56FE\u7247\u3002',
        avatarUploadFailureMessage: '\u4E0A\u4F20\u5934\u50CF\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        online: '\u5728\u7DDA',
        offline: '\u79BB\u7EBF',
        syncing: '\u540C\u6B65\u4E2D',
        profileAvatar: '\u4E2A\u4EBA\u8D44\u6599\u5934\u50CF',
        publicSection: {
            title: '\u516C\u5F00',
            subtitle:
                '\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u4F1A\u663E\u793A\u5728\u60A8\u7684\u516C\u5F00\u4E2A\u4EBA\u8D44\u6599\u4E0A\u3002\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u770B\u5230\u5B83\u4EEC\u3002',
        },
        privateSection: {
            title: '\u79C1\u4EBA',
            subtitle:
                '\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u7528\u4E8E\u65C5\u884C\u548C\u4ED8\u6B3E\u3002\u5B83\u4EEC\u6C38\u8FDC\u4E0D\u4F1A\u5728\u60A8\u7684\u516C\u5F00\u4E2A\u4EBA\u8D44\u6599\u4E0A\u663E\u793A\u3002',
        },
    },
    securityPage: {
        title: '\u5B89\u5168\u9009\u9879',
        subtitle: '\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1\u4EE5\u4FDD\u62A4\u60A8\u7684\u8D26\u6237\u5B89\u5168\u3002',
    },
    shareCodePage: {
        title: '\u60A8\u7684\u4EE3\u7801',
        subtitle: '\u901A\u8FC7\u5206\u4EAB\u60A8\u7684\u4E2A\u4EBA\u4E8C\u7EF4\u7801\u6216\u63A8\u8350\u94FE\u63A5\u6765\u9080\u8BF7\u6210\u5458\u52A0\u5165Expensify\u3002',
    },
    pronounsPage: {
        pronouns: '\u4EE3\u8BCD',
        isShownOnProfile: '\u60A8\u7684\u4EE3\u8BCD\u5C06\u663E\u793A\u5728\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u4E0A\u3002',
        placeholderText: '\u641C\u7D22\u4EE5\u67E5\u770B\u9009\u9879',
    },
    contacts: {
        contactMethod: '\u8054\u7CFB\u65B9\u5F0F',
        contactMethods: '\u8054\u7CFB\u65B9\u5F0F',
        featureRequiresValidate: '\u6B64\u529F\u80FD\u8981\u6C42\u60A8\u9A8C\u8BC1\u60A8\u7684\u5E10\u6237\u3002',
        validateAccount: '\u9A8C\u8BC1\u60A8\u7684\u5E10\u6237',
        helpTextBeforeEmail: '\u6DFB\u52A0\u66F4\u591A\u8BA9\u4EBA\u4EEC\u627E\u5230\u4F60\u7684\u65B9\u5F0F\uFF0C\u5E76\u8F6C\u53D1\u6536\u636E\u7ED9 ${username}',
        helpTextAfterEmail: '\u5F9E\u591A\u500B\u96FB\u5B50\u90F5\u4EF6\u5730\u5740\u3002',
        pleaseVerify: '\u8BF7\u9A8C\u8BC1\u6B64\u8054\u7CFB\u65B9\u5F0F',
        getInTouch:
            '\u65E0\u8BBA\u4F55\u65F6\u6211\u4EEC\u9700\u8981\u4E0E\u60A8\u53D6\u5F97\u8054\u7CFB\uFF0C\u6211\u4EEC\u90FD\u4F1A\u4F7F\u7528\u8FD9\u79CD\u8054\u7CFB\u65B9\u5F0F\u3002',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8ACB\u8F38\u5165\u767C\u9001\u81F3 ${contactMethod} \u7684\u9B54\u6CD5\u4EE3\u78BC\u3002\u5B83\u61C9\u8A72\u5728\u4E00\u5169\u5206\u9418\u5167\u5230\u9054\u3002`,
        setAsDefault: '\u8BBE\u7F6E\u4E3A\u9ED8\u8BA4',
        yourDefaultContactMethod:
            '\u8FD9\u662F\u60A8\u5F53\u524D\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u3002\u5728\u60A8\u5220\u9664\u5B83\u4E4B\u524D\uFF0C\u60A8\u9700\u8981\u9009\u62E9\u53E6\u4E00\u79CD\u8054\u7CFB\u65B9\u5F0F\u5E76\u70B9\u51FB\u201C\u8BBE\u4E3A\u9ED8\u8BA4\u201D\u3002',
        removeContactMethod: '\u5220\u9664\u8054\u7CFB\u65B9\u5F0F',
        removeAreYouSure: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u8054\u7CFB\u65B9\u5F0F\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002',
        failedNewContact: '\u65E0\u6CD5\u6DFB\u52A0\u6B64\u8054\u7CFB\u65B9\u5F0F\u3002',
        genericFailureMessages: {
            requestContactMethodValidateCode: '\u53D1\u9001\u65B0\u7684\u9B54\u6CD5\u4EE3\u7801\u5931\u8D25\u3002\u8BF7\u7A0D\u7B49\u4E00\u4F1A\u518D\u8BD5\u3002',
            validateSecondaryLogin:
                '\u4E0D\u6B63\u786E\u6216\u65E0\u6548\u7684\u9B54\u6CD5\u4EE3\u7801\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u8BF7\u6C42\u4E00\u4E2A\u65B0\u7684\u4EE3\u7801\u3002',
            deleteContactMethod: '\u5220\u9664\u8054\u7CFB\u65B9\u5F0F\u5931\u8D25\u3002\u8BF7\u8054\u7CFB\u793C\u5BBE\u90E8\u5BFB\u6C42\u5E2E\u52A9\u3002',
            setDefaultContactMethod: '\u8BBE\u5B9A\u65B0\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u5931\u8D25\u3002\u8BF7\u8054\u7CFB\u793C\u5BBE\u90E8\u5BFB\u6C42\u5E2E\u52A9\u3002',
            addContactMethod: '\u672A\u80FD\u6DFB\u52A0\u6B64\u8054\u7CFB\u65B9\u5F0F\u3002\u8BF7\u8054\u7CFB\u793C\u5BBE\u90E8\u5BFB\u6C42\u5E2E\u52A9\u3002',
            enteredMethodIsAlreadySubmited: '\u6B64\u8054\u7CFB\u65B9\u5F0F\u5DF2\u5B58\u5728\u3002',
            passwordRequired: '\u9700\u8981\u5BC6\u7801\u3002',
            contactMethodRequired: '\u9700\u8981\u8054\u7CFB\u65B9\u5F0F\u3002',
            invalidContactMethod: '\u65E0\u6548\u7684\u8054\u7CFB\u65B9\u5F0F',
        },
        newContactMethod: '\u65B0\u7684\u806F\u7E6B\u65B9\u5F0F',
        goBackContactMethods: '\u8FD4\u56DE\u81F3\u8054\u7CFB\u65B9\u5F0F',
    },
    pronouns: {
        coCos: "I'm sorry, but there seems to be a misunderstanding. I need the text or TypeScript function that you want me to translate into Chinese.",
        eEyEmEir: "Sorry, but I can't assist with that.",
        faeFaer:
            "\u8FD9\u662F\u4E00\u4E2A\u7EAF\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u5360\u4F4D\u7B26\u5982${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\uFF0C\u4E0D\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        heHimHis: '\u4ED6 / \u4ED6 / \u4ED6\u7684',
        heHimHisTheyThemTheirs: '\u4ED6 / \u4ED6 / \u4ED6\u7684 / \u4ED6\u4EEC / \u4ED6\u4EEC / \u4ED6\u4EEC\u7684',
        sheHerHers: '\u5979 / \u5979\u7684 / \u5979\u7684',
        sheHerHersTheyThemTheirs: '\u5979 / \u5979\u7684 / \u5979\u7684 / \u4ED6\u4EEC / \u4ED6\u4EEC / \u4ED6\u4EEC\u7684',
        merMers: 'Sorry, but your instruction is not clear. Could you please provide the text or TypeScript function that you want to translate into Chinese?',
        neNirNirs:
            "\u9019\u662F\u4E00\u500B\u7D14\u6587\u5B57\u4E32\u6216\u662F\u4E00\u500B\u56DE\u50B3\u6A21\u677F\u6587\u5B57\u4E32\u7684 TypeScript \u51FD\u6578\u3002\u8ACB\u4FDD\u7559\u50CF\u662F ${username}\u3001${count}\u3001${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u7B49\u7684\u4F54\u4F4D\u7B26\u865F\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u5011\u7684\u5167\u5BB9\u6216\u79FB\u9664\u62EC\u865F\u3002\u4F54\u4F4D\u7B26\u865F\u7684\u5167\u5BB9\u63CF\u8FF0\u4E86\u5B83\u5011\u5728\u53E5\u5B50\u4E2D\u7684\u4EE3\u8868\u610F\u7FA9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u9054\u5F0F\u6216\u5176\u4ED6 TypeScript \u7A0B\u5F0F\u78BC\u3002",
        neeNerNers: "Sorry, but you didn't provide any text to translate.",
        perPers: "I'm sorry, but your instruction is not clear. Could you please provide the text you want to be translated?",
        theyThemTheirs: '\u4ED6\u4EEC / \u4ED6\u4EEC / \u4ED6\u4EEC\u7684',
        thonThons: 'Sorry, but your request is not clear. Could you please provide the text or TypeScript function that you want to translate?',
        veVerVis: '\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        viVir: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        xeXemXyr:
            '\u5F88\u62B1\u6B49\uFF0C\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u6670\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u5177\u4F53\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        zeZieZirHir:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        zeHirHirs:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u7684\u5B57\u7B26\u4E32\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u610F\u601D\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u8005\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        callMeByMyName: '\u8BF7\u7528\u6211\u7684\u540D\u5B57\u53EB\u6211',
    },
    displayNamePage: {
        headerTitle: '\u663E\u793A\u540D\u79F0',
        isShownOnProfile: '\u60A8\u7684\u663E\u793A\u540D\u79F0\u4F1A\u5728\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u4E0A\u663E\u793A\u3002',
    },
    timezonePage: {
        timezone: '\u65F6\u533A',
        isShownOnProfile: '\u60A8\u7684\u65F6\u533A\u663E\u793A\u5728\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u4E0A\u3002',
        getLocationAutomatically: '\u81EA\u52A8\u786E\u5B9A\u60A8\u7684\u4F4D\u7F6E',
    },
    updateRequiredView: {
        updateRequired: '\u9700\u8981\u66F4\u65B0',
        pleaseInstall: '\u8BF7\u66F4\u65B0\u5230\u6700\u65B0\u7248\u672C\u7684New Expensify',
        pleaseInstallExpensifyClassic: '\u8BF7\u5B89\u88C5\u6700\u65B0\u7248\u672C\u7684Expensify',
        toGetLatestChanges:
            '\u5C0D\u65BC\u624B\u6A5F\u6216\u684C\u9762\uFF0C\u8ACB\u4E0B\u8F09\u4E26\u5B89\u88DD\u6700\u65B0\u7248\u672C\u3002\u5C0D\u65BC\u7DB2\u9801\uFF0C\u8ACB\u5237\u65B0\u60A8\u7684\u700F\u89BD\u5668\u3002',
        newAppNotAvailable: '\u65B0\u7684Expensify\u5E94\u7528\u7A0B\u5E8F\u5DF2\u4E0D\u518D\u53EF\u7528\u3002',
    },
    initialSettingsPage: {
        about: '\u5173\u4E8E',
        aboutPage: {
            description:
                '\u65B0\u7684Expensify\u5E94\u7528\u662F\u7531\u6765\u81EA\u4E16\u754C\u5404\u5730\u7684\u5F00\u6E90\u5F00\u53D1\u8005\u793E\u533A\u6784\u5EFA\u7684\u3002\u5E2E\u52A9\u6211\u4EEC\u6784\u5EFAExpensify\u7684\u672A\u6765\u3002',
            appDownloadLinks: '\u4E0B\u8F7D\u5E94\u7528\u94FE\u63A5',
            viewKeyboardShortcuts: '\u67E5\u770B\u952E\u76D8\u5FEB\u6377\u952E',
            viewTheCode: '\u67E5\u770B\u4EE3\u7801',
            viewOpenJobs: '\u67E5\u770B\u5F00\u653E\u7684\u5DE5\u4F5C\u804C\u4F4D',
            reportABug: '\u62A5\u544A\u4E00\u4E2A\u9519\u8BEF',
            troubleshoot: '\u6392\u67E5\u95EE\u9898',
        },
        appDownloadLinks: {
            android: {
                label: '\u5B89\u5353',
            },
            ios: {
                label: 'iOS',
            },
            desktop: {
                label: 'macOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '\u6E05\u9664\u7F13\u5B58\u5E76\u91CD\u65B0\u542F\u52A8',
            viewConsole: '\u67E5\u770B\u8ABF\u8A66\u63A7\u5236\u53F0',
            debugConsole: '\u8C03\u8BD5\u63A7\u5236\u53F0',
            description:
                '\u8BF7\u4F7F\u7528\u4E0B\u9762\u7684\u5DE5\u5177\u6765\u5E2E\u52A9\u89E3\u51B3Expensify\u7684\u95EE\u9898\u3002\u5982\u679C\u60A8\u9047\u5230\u4EFB\u4F55\u95EE\u9898\uFF0C\u8BF7${username}',
            submitBug: '\u63D0\u4EA4\u4E00\u4E2A\u9519\u8BEF',
            confirmResetDescription:
                '\u6240\u6709\u672A\u53D1\u9001\u7684\u8349\u7A3F\u6D88\u606F\u5C06\u4F1A\u4E22\u5931\uFF0C\u4F46\u60A8\u7684\u5176\u4F59\u6570\u636E\u662F\u5B89\u5168\u7684\u3002',
            resetAndRefresh: '\u91CD\u7F6E\u548C\u5237\u65B0',
            clientSideLogging: '\u5BA2\u6237\u7AEF\u65E5\u5FD7\u8BB0\u5F55',
            noLogsToShare: '\u6CA1\u6709\u65E5\u5FD7\u53EF\u5206\u4EAB',
            useProfiling: '\u4F7F\u7528\u5206\u6790',
            profileTrace: '\u914D\u7F6E\u6587\u4EF6\u8DDF\u8E2A',
            releaseOptions: '\u53D1\u5E03\u9009\u9879',
            testingPreferences: '\u6D4B\u8BD5\u504F\u597D',
            useStagingServer: '\u4F7F\u7528\u6682\u5B58\u670D\u52A1\u5668',
            forceOffline: '\u5F3A\u5236\u79BB\u7EBF',
            simulatePoorConnection: '\u6A21\u62DF\u5DEE\u7684\u7F51\u7EDC\u8FDE\u63A5',
            simulatFailingNetworkRequests: '\u6A21\u64EC\u7DB2\u7D61\u8ACB\u6C42\u5931\u6557',
            authenticationStatus: '\u8EAB\u4EFD\u9A8C\u8BC1\u72B6\u6001',
            deviceCredentials: '\u8BBE\u5907\u51ED\u8BC1',
            invalidate: '\u4F7F\u65E0\u6548',
            destroy: '\u9500\u6BC1',
            maskExportOnyxStateData: '\u5728\u5BFC\u51FAOnyx\u72B6\u6001\u65F6\uFF0C\u63A9\u76D6\u8106\u5F31\u7684\u6210\u5458\u6570\u636E',
            exportOnyxState: '\u5BFC\u51FA Onyx \u72B6\u6001',
            importOnyxState: '\u5BFC\u5165 Onyx \u72B6\u6001',
            testCrash: '\u6D4B\u8BD5\u5D29\u6E83',
            resetToOriginalState: '\u91CD\u7F6E\u4E3A\u539F\u59CB\u72B6\u6001',
            usingImportedState: '\u60A8\u6B63\u5728\u4F7F\u7528\u5BFC\u5165\u7684\u72B6\u6001\u3002\u70B9\u51FB\u8FD9\u91CC\u8FDB\u884C\u6E05\u9664\u3002',
            debugMode: '\u8C03\u8BD5\u6A21\u5F0F',
            invalidFile: '\u65E0\u6548\u7684\u6587\u4EF6',
            invalidFileDescription: '\u60A8\u6B63\u5728\u5C1D\u8BD5\u5BFC\u5165\u7684\u6587\u4EF6\u65E0\u6548\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            invalidateWithDelay: '\u5EF6\u8FDF\u65E0\u6548\u5316',
        },
        debugConsole: {
            saveLog: '\u4FDD\u5B58\u65E5\u5FD7',
            shareLog: '\u5206\u4EAB\u65E5\u5FD7',
            enterCommand: '\u8F93\u5165\u547D\u4EE4',
            execute: '\u6267\u884C',
            noLogsAvailable: '\u6CA1\u6709\u53EF\u7528\u7684\u65E5\u5FD7',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `\u65E5\u5FD7\u5927\u5C0F\u8D85\u8FC7\u4E86${size} MB\u7684\u9650\u5236\u3002\u8BF7\u4F7F\u7528\u201C\u4FDD\u5B58\u65E5\u5FD7\u201D\u6765\u4E0B\u8F7D\u65E5\u5FD7\u6587\u4EF6\u3002`,
            logs: '\u65E5\u5FD7',
            viewConsole: '\u67E5\u770B\u63A7\u5236\u53F0',
        },
        security: '\u5B89\u5168\u6027',
        signOut: '\u767B\u51FA',
        restoreStashed: '\u6062\u590D\u50A8\u5B58\u7684\u767B\u5F55',
        signOutConfirmationText: '\u5982\u679C\u60A8\u767B\u51FA\uFF0C\u60A8\u7684\u4EFB\u4F55\u79BB\u7EBF\u66F4\u6539\u90FD\u5C06\u4E22\u5931\u3002',
        versionLetter: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        readTheTermsAndPrivacy: {
            phrase1: '\u9605\u8BFB\u4EE5\u4E0B',
            phrase2: '\u670D\u52A1\u6761\u6B3E',
            phrase3:
                "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            phrase4: '\u9690\u79C1',
        },
        help: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u95EE\u9898\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        accountSettings: '\u5E10\u6237\u8BBE\u7F6E',
        account: '\u5E10\u6237',
        general:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
    },
    closeAccountPage: {
        closeAccount: '\u5173\u95ED\u8D26\u6237',
        reasonForLeavingPrompt:
            '\u6211\u4EEC\u771F\u4E0D\u5E0C\u671B\u770B\u5230\u4F60\u79BB\u5F00\uFF01\u4F60\u80FD\u544A\u8BC9\u6211\u4EEC\u539F\u56E0\u5417\uFF0C\u8FD9\u6837\u6211\u4EEC\u53EF\u4EE5\u6539\u8FDB\uFF1F',
        enterMessageHere: "Sorry, but you didn't provide any text to translate.",
        closeAccountWarning: '\u5173\u95ED\u60A8\u7684\u8D26\u6237\u4E0D\u80FD\u88AB\u64A4\u9500\u3002',
        closeAccountPermanentlyDeleteData:
            '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u60A8\u7684\u8D26\u6237\u5417\uFF1F\u8FD9\u5C06\u6C38\u4E45\u5220\u9664\u4EFB\u4F55\u672A\u7ED3\u6E05\u7684\u8D39\u7528\u3002',
        enterDefaultContactToConfirm:
            '\u8BF7\u8F93\u5165\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u4EE5\u786E\u8BA4\u60A8\u5E0C\u671B\u5173\u95ED\u60A8\u7684\u8D26\u6237\u3002\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u662F\uFF1A',
        enterDefaultContact: '\u8BF7\u8F93\u5165\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F',
        defaultContact: '\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\uFF1A',
        enterYourDefaultContactMethod: '\u8BF7\u8F93\u5165\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u4EE5\u5173\u95ED\u60A8\u7684\u8D26\u6237\u3002',
    },
    passwordPage: {
        changePassword: '\u66F4\u6539\u5BC6\u7801',
        changingYourPasswordPrompt: '\u66F4\u6539\u60A8\u7684\u5BC6\u7801\u5C06\u540C\u65F6\u66F4\u65B0\u60A8\u5728Expensify.com\u548CNew Expensify\u8D26\u6237\u7684\u5BC6\u7801\u3002',
        currentPassword: '\u5F53\u524D\u5BC6\u7801',
        newPassword: '\u65B0\u5BC6\u7801',
        newPasswordPrompt:
            '\u60A8\u7684\u65B0\u5BC6\u7801\u5FC5\u987B\u4E0E\u65E7\u5BC6\u7801\u4E0D\u540C\uFF0C\u5E76\u4E14\u81F3\u5C11\u5305\u542B8\u4E2A\u5B57\u7B26\uFF0C1\u4E2A\u5927\u5199\u5B57\u6BCD\uFF0C1\u4E2A\u5C0F\u5199\u5B57\u6BCD\u548C1\u4E2A\u6570\u5B57\u3002',
    },
    twoFactorAuth: {
        headerTitle: '\u4E24\u6B65\u9A8C\u8BC1',
        twoFactorAuthEnabled: '\u5DF2\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1',
        whatIsTwoFactorAuth:
            '\u4E24\u6B65\u9A8C\u8BC1\uFF082FA\uFF09\u6709\u52A9\u4E8E\u4FDD\u62A4\u60A8\u7684\u8D26\u6237\u5B89\u5168\u3002\u5728\u767B\u5F55\u65F6\uFF0C\u60A8\u9700\u8981\u8F93\u5165\u7531\u60A8\u9996\u9009\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528\u751F\u6210\u7684\u4EE3\u7801\u3002',
        disableTwoFactorAuth: '\u7981\u7528\u4E24\u6B65\u9A8C\u8BC1',
        explainProcessToRemove:
            '\u8981\u7981\u7528\u4E24\u6B65\u9A8C\u8BC1\uFF082FA\uFF09\uFF0C\u8BF7\u4ECE\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5E94\u7528\u4E2D\u8F93\u5165\u6709\u6548\u7684\u4EE3\u7801\u3002',
        disabled: '\u4E24\u6B65\u9A8C\u8BC1\u73B0\u5DF2\u7981\u7528',
        noAuthenticatorApp: '\u60A8\u5C06\u4E0D\u518D\u9700\u8981\u9A8C\u8BC1\u5668\u5E94\u7528\u7A0B\u5E8F\u6765\u767B\u5F55Expensify\u3002',
        stepCodes: '\u6062\u590D\u4EE3\u7801',
        keepCodesSafe: '\u8BF7\u59A5\u5584\u4FDD\u7BA1\u8FD9\u4E9B\u6062\u590D\u4EE3\u7801\uFF01',
        codesLoseAccess:
            '\u5982\u679C\u60A8\u5931\u53BB\u4E86\u5BF9\u9A8C\u8BC1\u5668\u5E94\u7528\u7684\u8BBF\u95EE\u6743\u9650\uFF0C\u5E76\u4E14\u6CA1\u6709\u8FD9\u4E9B\u4EE3\u7801\uFF0C\u60A8\u5C06\u5931\u53BB\u5BF9\u60A8\u8D26\u6237\u7684\u8BBF\u95EE\u6743\u9650\u3002\n\n\u6CE8\u610F\uFF1A\u8BBE\u7F6E\u4E24\u6B65\u9A8C\u8BC1\u5C06\u4F1A\u4F7F\u60A8\u4ECE\u6240\u6709\u5176\u4ED6\u6D3B\u52A8\u4F1A\u8BDD\u4E2D\u767B\u51FA\u3002',
        errorStepCodes: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u590D\u5236\u6216\u4E0B\u8F7D\u4EE3\u7801\u3002',
        stepVerify: '\u9A8C\u8BC1',
        scanCode: '\u4F7F\u7528\u60A8\u7684\u626B\u63CF\u4E8C\u7EF4\u7801',
        authenticatorApp: '\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528',
        addKey: '\u6216\u8005\u5C06\u6B64\u79D8\u5BC6\u5BC6\u94A5\u6DFB\u52A0\u5230\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528\u7A0B\u5E8F\u4E2D\uFF1A',
        enterCode: '\u7136\u540E\u8F93\u5165\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528\u751F\u6210\u7684\u516D\u4F4D\u6570\u4EE3\u7801\u3002',
        stepSuccess: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u6CA1\u6709\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        enabled: '\u5DF2\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1',
        congrats: '\u606D\u559C\uFF01\u73B0\u5728\u4F60\u62E5\u6709\u4E86\u989D\u5916\u7684\u5B89\u5168\u4FDD\u969C\u3002',
        copy: '\u590D\u5236',
        disable: '\u7981\u7528',
        enableTwoFactorAuth: '\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1',
        pleaseEnableTwoFactorAuth: '\u8ACB\u555F\u7528\u96D9\u56E0\u7D20\u8A8D\u8B49\u3002',
        twoFactorAuthIsRequiredDescription: '\u51FA\u4E8E\u5B89\u5168\u8003\u8651\uFF0CXero\u9700\u8981\u4E24\u6B65\u9A8C\u8BC1\u624D\u80FD\u8FDE\u63A5\u96C6\u6210\u3002',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Xero \u5DE5\u4F5C\u7A7A\u95F4\u7BA1\u7406\u5458\u9700\u8981\u4E24\u6B65\u9A8C\u8BC1\u3002\u8BF7\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1\u4EE5\u7EE7\u7EED\u3002',
        twoFactorAuthCannotDisable: '\u65E0\u6CD5\u7981\u75282FA',
        twoFactorAuthRequired: '\u9700\u8981\u4E3A\u60A8\u7684Xero\u8FDE\u63A5\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1\uFF082FA\uFF09\uFF0C\u5E76\u4E14\u65E0\u6CD5\u7981\u7528\u3002',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '\u8BF7\u8F93\u5165\u60A8\u7684\u6062\u590D\u4EE3\u7801\u3002',
            incorrectRecoveryCode: '\u4E0D\u6B63\u786E\u7684\u6062\u590D\u4EE3\u7801\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        },
        useRecoveryCode: '\u4F7F\u7528\u6062\u590D\u4EE3\u7801',
        recoveryCode: '\u6062\u590D\u4EE3\u7801',
        use2fa: '\u4F7F\u7528\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '\u8BF7\u8F93\u5165\u60A8\u7684\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801\u3002',
            incorrect2fa: '\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '\u5BC6\u7801\u5DF2\u66F4\u65B0\uFF01',
        allSet: '\u4F60\u5DF2\u7ECF\u51C6\u5907\u597D\u4E86\u3002\u8BF7\u59A5\u5584\u4FDD\u7BA1\u4F60\u7684\u65B0\u5BC6\u7801\u3002',
    },
    privateNotes: {
        title: '\u79C1\u4EBA\u7B14\u8BB0',
        personalNoteMessage:
            '\u5728\u6B64\u5904\u8BB0\u5F55\u5173\u4E8E\u6B64\u804A\u5929\u7684\u7B14\u8BB0\u3002\u53EA\u6709\u60A8\u53EF\u4EE5\u6DFB\u52A0\u3001\u7F16\u8F91\u6216\u67E5\u770B\u8FD9\u4E9B\u7B14\u8BB0\u3002',
        sharedNoteMessage:
            '\u5728\u6B64\u5904\u8BB0\u5F55\u5173\u4E8E\u6B64\u804A\u5929\u7684\u7B14\u8BB0\u3002Expensify\u7684\u5458\u5DE5\u548Cteam.expensify.com\u57DF\u4E0A\u7684\u5176\u4ED6\u6210\u5458\u53EF\u4EE5\u67E5\u770B\u8FD9\u4E9B\u7B14\u8BB0\u3002',
        composerLabel: 'The task is incomplete. Please provide the text or TypeScript function that needs to be translated.',
        myNote: '\u6211\u7684\u7B14\u8BB0',
        error: {
            genericFailureMessage: '\u65E0\u6CD5\u4FDD\u5B58\u79C1\u4EBA\u7B14\u8BB0\u3002',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5B89\u5168\u7801\u3002',
        },
        securityCode: '\u5B89\u5168\u7801',
        changeBillingCurrency: '\u66F4\u6539\u8D26\u5355\u8D27\u5E01',
        changePaymentCurrency: '\u66F4\u6539\u4ED8\u6B3E\u8D27\u5E01',
        paymentCurrency: '\u4ED8\u6B3E\u8D27\u5E01',
        note: '\u6CE8\u610F\uFF1A\u66F4\u6539\u60A8\u7684\u4ED8\u6B3E\u8D27\u5E01\u53EF\u80FD\u4F1A\u5F71\u54CD\u60A8\u4E3AExpensify\u652F\u4ED8\u7684\u91D1\u989D\u3002\u8BF7\u53C2\u8003\u6211\u4EEC\u7684',
        noteLink: '\u5B9A\u4EF7\u9875\u9762',
        noteDetails: '\u6709\u5173\u5B8C\u6574\u8BE6\u60C5\u3002',
    },
    addDebitCardPage: {
        addADebitCard: '\u6DFB\u52A0\u4E00\u5F20\u501F\u8BB0\u5361',
        nameOnCard: '\u5361\u4E0A\u7684\u540D\u5B57',
        debitCardNumber: '\u501F\u8BB0\u5361\u53F7',
        expiration: '\u5230\u671F\u65E5\u671F',
        expirationDate:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\uFF0C\u6211\u65E0\u6CD5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        cvv: 'CVV',
        billingAddress: '\u5E33\u55AE\u5730\u5740',
        growlMessageOnSave: '\u60A8\u7684\u501F\u8BB0\u5361\u5DF2\u6210\u529F\u6DFB\u52A0',
        expensifyPassword: 'Expensify \u5BC6\u7801',
        error: {
            invalidName: '\u540D\u5B57\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3002',
            addressZipCode: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u90F5\u653F\u7DE8\u78BC\u3002',
            debitCardNumber: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u501F\u8A18\u5361\u865F\u78BC\u3002',
            expirationDate: '\u8BF7\u9009\u62E9\u6709\u6548\u7684\u8FC7\u671F\u65E5\u671F\u3002',
            securityCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5B89\u5168\u7801\u3002',
            addressStreet: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u5E33\u55AE\u5730\u5740\uFF0C\u4E26\u4E14\u4E0D\u80FD\u662F\u90F5\u653F\u4FE1\u7BB1\u3002',
            addressState: '\u8ACB\u9078\u64C7\u4E00\u500B\u5DDE\u3002',
            addressCity: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u57CE\u5E02\u3002',
            genericFailureMessage: '\u6DFB\u52A0\u60A8\u7684\u5361\u7247\u65F6\u51FA\u73B0\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            password: '\u8BF7\u8F93\u5165\u60A8\u7684Expensify\u5BC6\u7801\u3002',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '\u6DFB\u52A0\u4ED8\u6B3E\u5361',
        nameOnCard: '\u5361\u4E0A\u7684\u540D\u5B57',
        paymentCardNumber: '\u5361\u865F',
        expiration: '\u5230\u671F\u65E5\u671F',
        expirationDate:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\uFF0C\u6211\u65E0\u6CD5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        cvv: 'CVV',
        billingAddress: '\u5E33\u55AE\u5730\u5740',
        growlMessageOnSave: '\u60A8\u7684\u4ED8\u6B3E\u5361\u5DF2\u6210\u529F\u6DFB\u52A0',
        expensifyPassword: 'Expensify \u5BC6\u7801',
        error: {
            invalidName: '\u540D\u5B57\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3002',
            addressZipCode: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u90F5\u653F\u7DE8\u78BC\u3002',
            paymentCardNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5361\u53F7\u3002',
            expirationDate: '\u8BF7\u9009\u62E9\u6709\u6548\u7684\u8FC7\u671F\u65E5\u671F\u3002',
            securityCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5B89\u5168\u7801\u3002',
            addressStreet: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u5E33\u55AE\u5730\u5740\uFF0C\u4E26\u4E14\u4E0D\u80FD\u662F\u90F5\u653F\u4FE1\u7BB1\u3002',
            addressState: '\u8ACB\u9078\u64C7\u4E00\u500B\u5DDE\u3002',
            addressCity: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u57CE\u5E02\u3002',
            genericFailureMessage: '\u6DFB\u52A0\u60A8\u7684\u5361\u7247\u65F6\u51FA\u73B0\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            password: '\u8BF7\u8F93\u5165\u60A8\u7684Expensify\u5BC6\u7801\u3002',
        },
    },
    walletPage: {
        balance: '\u5E73\u8861',
        paymentMethodsTitle: '\u4ED8\u6B3E\u65B9\u5F0F',
        setDefaultConfirmation: '\u8BBE\u4E3A\u9ED8\u8BA4\u652F\u4ED8\u65B9\u5F0F',
        setDefaultSuccess: '\u5DF2\u8BBE\u7F6E\u9ED8\u8BA4\u4ED8\u6B3E\u65B9\u5F0F\uFF01',
        deleteAccount: '\u5220\u9664\u8D26\u6237',
        deleteConfirmation: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D26\u6237\u5417\uFF1F',
        error: {
            notOwnerOfBankAccount: '\u8BBE\u7F6E\u6B64\u94F6\u884C\u8D26\u6237\u4E3A\u60A8\u7684\u9ED8\u8BA4\u652F\u4ED8\u65B9\u5F0F\u65F6\u51FA\u73B0\u9519\u8BEF\u3002',
            invalidBankAccount: '\u6B64\u9280\u884C\u5E33\u6236\u66AB\u6642\u88AB\u505C\u7528\u3002',
            notOwnerOfFund: '\u8BBE\u7F6E\u6B64\u5361\u4E3A\u60A8\u7684\u9ED8\u8BA4\u4ED8\u6B3E\u65B9\u5F0F\u65F6\u53D1\u751F\u9519\u8BEF\u3002',
            setDefaultFailure: '\u53D1\u751F\u4E86\u9519\u8BEF\u3002\u8BF7\u4E0E\u793C\u5BBE\u90E8\u804A\u5929\u4EE5\u83B7\u53D6\u8FDB\u4E00\u6B65\u7684\u5E2E\u52A9\u3002',
        },
        addBankAccountFailure: '\u5728\u5617\u8A66\u6DFB\u52A0\u60A8\u7684\u9280\u884C\u5E33\u6236\u6642\u767C\u751F\u4E86\u610F\u5916\u932F\u8AA4\u3002\u8ACB\u518D\u8A66\u4E00\u6B21\u3002',
        getPaidFaster: '\u66F4\u5FEB\u5730\u7372\u5F97\u4ED8\u6B3E',
        addPaymentMethod: '\u5728\u5E94\u7528\u4E2D\u76F4\u63A5\u6DFB\u52A0\u4ED8\u6B3E\u65B9\u5F0F\u4EE5\u53D1\u9001\u548C\u63A5\u6536\u4ED8\u6B3E\u3002',
        getPaidBackFaster: '\u66F4\u5FEB\u5730\u6536\u56DE\u6B3E\u9879',
        secureAccessToYourMoney: '\u4FDD\u969C\u60A8\u7684\u8D44\u91D1\u5B89\u5168\u8BBF\u95EE',
        receiveMoney: '\u5728\u60A8\u7684\u672C\u5730\u8D27\u5E01\u4E2D\u63A5\u6536\u6B3E\u9879',
        expensifyWallet: 'Expensify\u94B1\u5305\uFF08\u6D4B\u8BD5\u7248\uFF09',
        sendAndReceiveMoney: '\u4E0E\u670B\u53CB\u4EEC\u53D1\u9001\u548C\u63A5\u6536\u91D1\u94B1\u3002\u4EC5\u9650\u7F8E\u56FD\u94F6\u884C\u8D26\u6237\u3002',
        enableWallet: '\u542F\u7528\u94B1\u5305',
        addBankAccountToSendAndReceive: '\u63D0\u4EA4\u7ED9\u5DE5\u4F5C\u7A7A\u95F4\u7684\u8D39\u7528\u5C06\u5F97\u5230\u507F\u8FD8\u3002',
        addBankAccount: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
        assignedCards: '\u5206\u914D\u7684\u5361\u7247',
        assignedCardsDescription:
            '\u8FD9\u4E9B\u662F\u7531\u5DE5\u4F5C\u7A7A\u95F4\u7BA1\u7406\u5458\u5206\u914D\u7684\u5361\u7247\uFF0C\u7528\u4E8E\u7BA1\u7406\u516C\u53F8\u652F\u51FA\u3002',
        expensifyCard: 'Expensify\u5361',
        walletActivationPending: '\u6211\u4EEC\u6B63\u5728\u5BA1\u6838\u60A8\u7684\u4FE1\u606F\u3002\u8BF7\u5728\u51E0\u5206\u949F\u540E\u518D\u67E5\u770B\uFF01',
        walletActivationFailed:
            '\u5F88\u9057\u61BE\uFF0C\u60A8\u7684\u94B1\u5305\u73B0\u5728\u65E0\u6CD5\u542F\u7528\u3002\u8BF7\u4E0E\u793C\u5BBE\u90E8\u8FDB\u4E00\u6B65\u6C9F\u901A\u4EE5\u83B7\u53D6\u5E2E\u52A9\u3002',
        addYourBankAccount: '\u6DFB\u52A0\u60A8\u7684\u94F6\u884C\u8D26\u6237',
        addBankAccountBody:
            '\u8BA9\u6211\u4EEC\u5C06\u60A8\u7684\u94F6\u884C\u8D26\u6237\u8FDE\u63A5\u5230Expensify\uFF0C\u8FD9\u6837\u60A8\u53EF\u4EE5\u5728\u5E94\u7528\u7A0B\u5E8F\u4E2D\u76F4\u63A5\u53D1\u9001\u548C\u63A5\u6536\u4ED8\u6B3E\uFF0C\u6BD4\u4EE5\u5F80\u66F4\u52A0\u65B9\u4FBF\u3002',
        chooseYourBankAccount: '\u9009\u62E9\u4F60\u7684\u94F6\u884C\u8D26\u6237',
        chooseAccountBody: '\u786E\u4FDD\u4F60\u9009\u62E9\u4E86\u6B63\u786E\u7684\u4E00\u4E2A\u3002',
        confirmYourBankAccount: '\u786E\u8BA4\u60A8\u7684\u94F6\u884C\u8D26\u6237',
    },
    cardPage: {
        expensifyCard: 'Expensify\u5361',
        availableSpend: '\u5269\u4F59\u9650\u5236',
        smartLimit: {
            name: '\u667A\u80FD\u9650\u5236',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\u60A8\u53EF\u4EE5\u5728\u6B64\u5361\u4E0A\u82B1\u8D39\u9AD8\u8FBE${formattedLimit}\uFF0C\u5E76\u4E14\u5728\u60A8\u63D0\u4EA4\u7684\u8D39\u7528\u83B7\u5F97\u6279\u51C6\u540E\uFF0C\u9650\u989D\u5C06\u4F1A\u91CD\u7F6E\u3002`,
        },
        fixedLimit: {
            name: '\u56FA\u5B9A\u9650\u5236',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\u60A8\u53EF\u4EE5\u5728\u6B64\u5361\u4E0A\u6D88\u8D39\u6700\u591A${formattedLimit}\uFF0C\u7136\u540E\u5B83\u5C06\u88AB\u505C\u7528\u3002`,
        },
        monthlyLimit: {
            name: '\u6BCF\u6708\u9650\u989D',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\u60A8\u6BCF\u6708\u53EF\u4EE5\u5728\u6B64\u5361\u4E0A\u6D88\u8D39\u6700\u591A${formattedLimit}\u3002\u9650\u989D\u5C06\u5728\u6BCF\u4E2A\u65E5\u5386\u6708\u7684\u7B2C\u4E00\u5929\u91CD\u7F6E\u3002`,
        },
        virtualCardNumber: '\u865A\u62DF\u5361\u53F7',
        physicalCardNumber: '\u5BE6\u9AD4\u5361\u865F',
        getPhysicalCard: '\u83B7\u53D6\u5B9E\u4F53\u5361',
        reportFraud: '\u62A5\u544A\u865A\u62DF\u5361\u6B3A\u8BC8',
        reviewTransaction: '\u5BA1\u67E5\u4EA4\u6613',
        suspiciousBannerTitle: '\u53EF\u7591\u4EA4\u6613',
        suspiciousBannerDescription: '\u6211\u4EEC\u6CE8\u610F\u5230\u60A8\u7684\u5361\u4E0A\u6709\u53EF\u7591\u7684\u4EA4\u6613\u3002\u70B9\u51FB\u4E0B\u65B9\u8FDB\u884C\u67E5\u770B\u3002',
        cardLocked: '\u60A8\u7684\u5361\u7247\u5DF2\u88AB\u6682\u65F6\u9501\u5B9A\uFF0C\u6211\u4EEC\u7684\u56E2\u961F\u6B63\u5728\u5BA1\u67E5\u60A8\u516C\u53F8\u7684\u8D26\u6237\u3002',
        cardDetails: {
            cardNumber: '\u865A\u62DF\u5361\u53F7',
            expiration: '\u5230\u671F',
            cvv: 'CVV',
            address: '\u5730\u5740',
            revealDetails: '\u8BF7\u63D0\u4F9B\u66F4\u591A\u7684\u4FE1\u606F\u4EE5\u4FBF\u8FDB\u884C\u7FFB\u8BD1\u3002',
            copyCardNumber: '\u590D\u5236\u5361\u53F7',
            updateAddress: '\u66F4\u65B0\u5730\u5740',
        },
        cardDetailsLoadingFailure:
            '\u52A0\u8F7D\u5361\u7247\u8BE6\u7EC6\u4FE1\u606F\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u4E92\u8054\u7F51\u8FDE\u63A5\uFF0C\u7136\u540E\u518D\u8BD5\u4E00\u6B21\u3002',
        validateCardTitle: '\u8BA9\u6211\u4EEC\u786E\u8BA4\u4E00\u4E0B\u662F\u4F60',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u81F3${contactMethod}\u7684\u9B54\u6CD5\u4EE3\u7801\u4EE5\u67E5\u770B\u60A8\u7684\u5361\u7247\u8BE6\u7EC6\u4FE1\u606F\u3002\u5B83\u5E94\u8BE5\u5728\u4E00\u4E24\u5206\u949F\u5185\u5230\u8FBE\u3002`,
    },
    workflowsPage: {
        workflowTitle: '\u82B1\u8D39',
        workflowDescription:
            '\u914D\u7F6E\u4E00\u4E2A\u5DE5\u4F5C\u6D41\u7A0B\uFF0C\u4ECE\u82B1\u8D39\u53D1\u751F\u7684\u90A3\u4E00\u523B\u5F00\u59CB\uFF0C\u5305\u62EC\u5BA1\u6279\u548C\u652F\u4ED8\u3002',
        delaySubmissionTitle: '\u5EF6\u8FDF\u63D0\u4EA4',
        delaySubmissionDescription:
            '\u9009\u62E9\u81EA\u5B9A\u4E49\u7684\u62A5\u9500\u63D0\u4EA4\u65F6\u95F4\u8868\uFF0C\u6216\u8005\u5173\u95ED\u6B64\u529F\u80FD\u4EE5\u5B9E\u65F6\u66F4\u65B0\u652F\u51FA\u60C5\u51B5\u3002',
        submissionFrequency: '\u63D0\u4EA4\u9891\u7387',
        submissionFrequencyDateOfMonth: '\u6708\u4EFD\u7684\u65E5\u671F',
        addApprovalsTitle: '\u6DFB\u52A0\u6279\u51C6',
        addApprovalButton: '\u6DFB\u52A0\u5BA1\u6279\u6D41\u7A0B',
        addApprovalTip: '\u6B64\u9ED8\u8BA4\u5DE5\u4F5C\u6D41\u9002\u7528\u4E8E\u6240\u6709\u6210\u5458\uFF0C\u9664\u975E\u5B58\u5728\u66F4\u5177\u4F53\u7684\u5DE5\u4F5C\u6D41\u3002',
        approver: '\u5BA1\u6279\u4EBA',
        connectBankAccount: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
        addApprovalsDescription: '\u5728\u6388\u6743\u4ED8\u6B3E\u4E4B\u524D\u9700\u8981\u989D\u5916\u7684\u6279\u51C6\u3002',
        makeOrTrackPaymentsTitle: '\u5236\u4F5C\u6216\u8FFD\u8E2A\u4ED8\u6B3E',
        makeOrTrackPaymentsDescription:
            '\u5728Expensify\u4E2D\u6DFB\u52A0\u4E00\u4E2A\u6388\u6743\u4ED8\u6B3E\u4EBA\uFF0C\u6216\u8005\u7B80\u5355\u5730\u8DDF\u8E2A\u5728\u5176\u4ED6\u5730\u65B9\u8FDB\u884C\u7684\u4ED8\u6B3E\u3002',
        editor: {
            submissionFrequency: '\u9009\u62E9 Expensify \u5E94\u7B49\u5F85\u591A\u4E45\u624D\u5206\u4EAB\u65E0\u9519\u8BEF\u7684\u82B1\u8D39\u3002',
        },
        frequencyDescription: '\u9009\u62E9\u60A8\u5E0C\u671B\u8D39\u7528\u81EA\u52A8\u63D0\u4EA4\u7684\u9891\u7387\uFF0C\u6216\u8005\u9009\u62E9\u624B\u52A8\u63D0\u4EA4',
        frequencies: {
            weekly: '\u6BCF\u5468',
            monthly: '\u6BCF\u6708',
            twiceAMonth: '\u6BCF\u6708\u4E24\u6B21',
            byTrip: '\u6309\u65C5\u7A0B',
            manually: "Sorry, but you didn't provide any text to translate.",
            daily: '\u6BCF\u65E5',
            lastDayOfMonth: '\u6708\u4EFD\u7684\u6700\u540E\u4E00\u5929',
            lastBusinessDayOfMonth: '\u6708\u4EFD\u7684\u6700\u540E\u4E00\u4E2A\u5DE5\u4F5C\u65E5',
            ordinals: {
                one: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                two: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                few: 'Your request is incomplete. Please provide the text or TypeScript function that you want to translate.',
                other: 'Sorry, your request is not clear. Could you please specify the language you want the text to be translated into?',
                /* eslint-disable @typescript-eslint/naming-convention */
                "Sorry, but there's no text provided for translation.": 'Sorry, there seems to be a misunderstanding. Could you please provide the text that you want me to translate?',
                '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u4F1A\u5E2E\u60A8\u7FFB\u8BD1\u3002':
                    'Sorry, there is no text provided for translation. Could you please provide the text you want to translate?',
                "I'm sorry, but there's no text provided for translation. Could you please provide the text or TypeScript function that you want to translate?":
                    'Sorry, there seems to be a misunderstanding. Could you please provide the text or TypeScript function that you want to be translated?',
                '\u60A8\u7684\u8F93\u5165\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u6216\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002':
                    '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u3002',
                'Your request is missing the text that needs to be translated. Please provide the text for translation.': '\u7B2C\u4E94',
                '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\uFF0C\u6211\u65E0\u6CD5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002':
                    '\u7B2C\u516D',
                '\u60A8\u7684\u95EE\u9898\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u6216\u5B58\u5728\u8BEF\u89E3\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u5C06\u5F88\u4E50\u610F\u5E2E\u52A9\u60A8\u8FDB\u884C\u7FFB\u8BD1\u3002':
                    '\u7B2C\u4E03',
                '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u53EF\u4EE5\u7FFB\u8BD1\u7684\u5185\u5BB9\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u82F1\u6587\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002':
                    '\u7B2C\u516B',
                'As a language model AI developed by OpenAI, I need to know the target language you want me to translate the text into. "ch" is not clear enough for me to understand. Please provide the full name of the language.':
                    '\u7B2C\u4E5D',
                '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u9700\u8981\u7FFB\u8BD1\u7684\u5185\u5BB9\u3002\u5982\u679C\u60A8\u6709\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u3002':
                    '\u7B2C\u5341',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows:
            '\u6B64\u6210\u5458\u5DF2\u5C5E\u4E8E\u53E6\u4E00\u4E2A\u5BA1\u6279\u6D41\u7A0B\u3002\u5728\u8FD9\u91CC\u8FDB\u884C\u7684\u4EFB\u4F55\u66F4\u65B0\u4E5F\u5C06\u5728\u90A3\u91CC\u53CD\u6620\u51FA\u6765\u3002',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> \u5DF2\u7ECF\u6279\u51C6\u5411 <strong>${name2}</strong> \u7684\u62A5\u544A\u3002\u4E3A\u907F\u514D\u5FAA\u73AF\u5DE5\u4F5C\u6D41\uFF0C\u8BF7\u9009\u62E9\u4E00\u4E2A\u4E0D\u540C\u7684\u5BA1\u6279\u8005\u3002`,
        emptyContent: {
            title: '\u6CA1\u6709\u6210\u5458\u53EF\u4EE5\u663E\u793A',
            expensesFromSubtitle: '\u6240\u6709\u5DE5\u4F5C\u7A7A\u95F4\u6210\u5458\u5DF2\u5C5E\u4E8E\u73B0\u6709\u7684\u5BA1\u6279\u6D41\u7A0B\u3002',
            approverSubtitle: '\u6240\u6709\u7684\u5BA1\u6279\u8005\u90FD\u5C5E\u4E8E\u73B0\u6709\u7684\u5DE5\u4F5C\u6D41\u7A0B\u3002',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: '\u5EF6\u8FDF\u63D0\u4EA4\u65E0\u6CD5\u66F4\u6539\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u8054\u7CFB\u652F\u6301\u3002',
        autoReportingFrequencyErrorMessage: '\u63D0\u4EA4\u9891\u7387\u65E0\u6CD5\u66F4\u6539\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u8054\u7CFB\u652F\u6301\u3002',
        monthlyOffsetErrorMessage: '\u65E0\u6CD5\u66F4\u6539\u6BCF\u6708\u9891\u7387\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u8054\u7CFB\u652F\u6301\u3002',
    },
    workflowsCreateApprovalsPage: {
        title: '\u78BA\u8A8D',
        header: '\u6DFB\u52A0\u66F4\u591A\u7684\u5BA1\u6279\u4EBA\u5E76\u786E\u8BA4\u3002',
        additionalApprover: '\u989D\u5916\u7684\u5BA1\u6279\u4EBA',
        submitButton: '\u6DFB\u52A0\u5DE5\u4F5C\u6D41',
    },
    workflowsEditApprovalsPage: {
        title: '\u7F16\u8F91\u5BA1\u6279\u6D41\u7A0B',
        deleteTitle: '\u5220\u9664\u5BA1\u6279\u6D41\u7A0B',
        deletePrompt:
            '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5BA1\u6279\u6D41\u7A0B\u5417\uFF1F\u6240\u6709\u6210\u5458\u5C06\u968F\u540E\u9075\u5FAA\u9ED8\u8BA4\u7684\u5DE5\u4F5C\u6D41\u7A0B\u3002',
    },
    workflowsExpensesFromPage: {
        title: '\u6765\u81EA\u7684\u8D39\u7528',
        header: '\u5F53\u4EE5\u4E0B\u6210\u5458\u63D0\u4EA4\u8D39\u7528\u65F6\uFF1A',
    },
    workflowsApproverPage: {
        genericErrorMessage: '\u6279\u51C6\u8005\u65E0\u6CD5\u66F4\u6539\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u8054\u7CFB\u652F\u6301\u3002',
        header: '\u53D1\u9001\u7ED9\u6B64\u6210\u5458\u4EE5\u4F9B\u6279\u51C6\uFF1A',
    },
    workflowsPayerPage: {
        title: '\u6388\u6743\u4ED8\u6B3E\u4EBA',
        genericErrorMessage: '\u6388\u6743\u4ED8\u6B3E\u4EBA\u65E0\u6CD5\u66F4\u6539\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        admins: '\u7BA1\u7406\u5458',
        payer: '\u652F\u4ED8',
        paymentAccount: '\u4ED8\u6B3E\u8D26\u6237',
    },
    reportFraudPage: {
        title: '\u62A5\u544A\u865A\u62DF\u5361\u6B3A\u8BC8',
        description:
            '\u5982\u679C\u60A8\u7684\u865A\u62DF\u5361\u8BE6\u7EC6\u4FE1\u606F\u88AB\u76D7\u6216\u88AB\u6CC4\u9732\uFF0C\u6211\u4EEC\u5C06\u6C38\u4E45\u505C\u7528\u60A8\u73B0\u6709\u7684\u5361\u5E76\u4E3A\u60A8\u63D0\u4F9B\u4E00\u4E2A\u65B0\u7684\u865A\u62DF\u5361\u548C\u53F7\u7801\u3002',
        deactivateCard: '\u505C\u7528\u5361\u7247',
        reportVirtualCardFraud: '\u62A5\u544A\u865A\u62DF\u5361\u6B3A\u8BC8',
    },
    reportFraudConfirmationPage: {
        title: '\u62A5\u544A\u4E86\u4FE1\u7528\u5361\u6B3A\u8BC8',
        description:
            '\u6211\u4EEC\u5DF2\u6C38\u4E45\u505C\u7528\u60A8\u7684\u73B0\u6709\u5361\u7247\u3002\u5F53\u60A8\u8FD4\u56DE\u67E5\u770B\u60A8\u7684\u5361\u7247\u8BE6\u7EC6\u4FE1\u606F\u65F6\uFF0C\u60A8\u5C06\u6709\u4E00\u5F20\u65B0\u7684\u865A\u62DF\u5361\u53EF\u7528\u3002',
        buttonText:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u6211\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u4E00\u4E9B\u6587\u672C\uFF0C\u6211\u4F1A\u5F88\u9AD8\u5174\u4E3A\u60A8\u7FFB\u8BD1\u3002',
    },
    activateCardPage: {
        activateCard: '\u6FC0\u6D3B\u5361\u7247',
        pleaseEnterLastFour: '\u8BF7\u8F93\u5165\u60A8\u5361\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u3002',
        activatePhysicalCard: '\u6FC0\u6D3B\u5BE6\u9AD4\u5361',
        error: {
            thatDidntMatch: '\u9019\u8207\u60A8\u5361\u7247\u4E0A\u7684\u6700\u5F8C\u56DB\u4F4D\u6578\u5B57\u4E0D\u7B26\u3002\u8ACB\u518D\u8A66\u4E00\u6B21\u3002',
            throttled:
                '\u60A8\u5DF2\u7ECF\u591A\u6B21\u9519\u8BEF\u5730\u8F93\u5165\u4E86Expensify\u5361\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u3002\u5982\u679C\u60A8\u786E\u5B9A\u6570\u5B57\u662F\u6B63\u786E\u7684\uFF0C\u8BF7\u8054\u7CFB\u793C\u5BBE\u90E8\u89E3\u51B3\u3002\u5426\u5219\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        },
    },
    getPhysicalCard: {
        header: '\u83B7\u53D6\u5B9E\u4F53\u5361',
        nameMessage: '\u8BF7\u8F93\u5165\u60A8\u7684\u540D\u5B57\u548C\u59D3\u6C0F\uFF0C\u56E0\u4E3A\u8FD9\u5C06\u663E\u793A\u5728\u60A8\u7684\u5361\u7247\u4E0A\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        phoneMessage: '\u8F93\u5165\u60A8\u7684\u7535\u8BDD\u53F7\u7801\u3002',
        phoneNumber: '\u7535\u8BDD\u53F7\u7801',
        address: '\u5730\u5740',
        addressMessage: '\u8F93\u5165\u60A8\u7684\u90AE\u5BC4\u5730\u5740\u3002',
        streetAddress: '\u8857\u9053\u5730\u5740',
        city: '\u57CE\u5E02',
        state: '\u72B6\u6001',
        zipPostcode: '\u90F5\u653F\u7DE8\u78BC',
        country: '\u56FD\u5BB6',
        confirmMessage: '\u8BF7\u786E\u8BA4\u60A8\u4E0B\u9762\u7684\u8BE6\u7EC6\u4FE1\u606F\u3002',
        estimatedDeliveryMessage: '\u60A8\u7684\u5BE6\u9AD4\u5361\u5C07\u57282-3\u500B\u5DE5\u4F5C\u65E5\u5167\u5230\u9054\u3002',
        next: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        getPhysicalCard: '\u83B7\u53D6\u5B9E\u4F53\u5361',
        shipCard: '\u8239\u5361',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `\u8F49\u8CEC${amount ? ` ${amount}` : ''}`,
        instant: '\u5373\u65F6\uFF08\u501F\u8BB0\u5361\uFF09',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% fee (${minAmount} minimum)`,
        ach: '1-3\u4E2A\u5DE5\u4F5C\u65E5\uFF08\u94F6\u884C\u8D26\u6237\uFF09',
        achSummary: '\u65E0\u8D39\u7528',
        whichAccount: '\u54EA\u4E2A\u8D26\u6237\uFF1F',
        fee: '\u8D39\u7528',
        transferSuccess: '\u8F6C\u79FB\u6210\u529F\uFF01',
        transferDetailBankAccount: '\u60A8\u7684\u6B3E\u9879\u5E94\u5728\u63A5\u4E0B\u6765\u76841-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8D26\u3002',
        transferDetailDebitCard: '\u4F60\u7684\u94B1\u5E94\u8BE5\u7ACB\u5373\u5230\u8D26\u3002',
        failedTransfer: '\u60A8\u7684\u4F59\u989D\u5C1A\u672A\u5B8C\u5168\u7ED3\u6E05\u3002\u8BF7\u8F6C\u8D26\u81F3\u94F6\u884C\u8D26\u6237\u3002',
        notHereSubTitle: '\u8BF7\u4ECE\u94B1\u5305\u9875\u9762\u8F6C\u79FB\u60A8\u7684\u4F59\u989D',
        goToWallet: '\u53BB\u94B1\u5305',
    },
    chooseTransferAccountPage: {
        chooseAccount: '\u9009\u62E9\u8D26\u6237',
    },
    paymentMethodList: {
        addPaymentMethod: '\u6DFB\u52A0\u4ED8\u6B3E\u65B9\u5F0F',
        addNewDebitCard: '\u6DFB\u52A0\u65B0\u7684\u501F\u8BB0\u5361',
        addNewBankAccount: '\u6DFB\u52A0\u65B0\u7684\u94F6\u884C\u8D26\u6237',
        accountLastFour:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u95EE\u9898\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u6216\u8005\u6709\u8BEF\u3002\u6211\u9700\u8981\u66F4\u591A\u7684\u4E0A\u4E0B\u6587\u4FE1\u606F\u6765\u63D0\u4F9B\u51C6\u786E\u7684\u7FFB\u8BD1\u3002',
        cardLastFour: '\u7D50\u675F\u65BC\u7684\u5361',
        addFirstPaymentMethod: '\u5728\u5E94\u7528\u4E2D\u76F4\u63A5\u6DFB\u52A0\u4ED8\u6B3E\u65B9\u5F0F\u4EE5\u53D1\u9001\u548C\u63A5\u6536\u4ED8\u6B3E\u3002',
        defaultPaymentMethod:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\u3001${count}\u3001${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
    },
    preferencesPage: {
        appSection: {
            title: '\u5E94\u7528\u7A0B\u5E8F\u504F\u597D\u8BBE\u7F6E',
        },
        testSection: {
            title: '\u6D4B\u8BD5\u504F\u597D',
            subtitle: '\u5728\u66AB\u5B58\u74B0\u5883\u4E0A\u8ABF\u8A66\u548C\u6E2C\u8A66\u61C9\u7528\u7684\u8A2D\u7F6E\u3002',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '\u63A5\u6536\u76F8\u5173\u7684\u529F\u80FD\u66F4\u65B0\u548CExpensify\u65B0\u95FB',
        muteAllSounds: '\u5C06Expensify\u7684\u6240\u6709\u58F0\u97F3\u9759\u97F3',
    },
    priorityModePage: {
        priorityMode: '\u4F18\u5148\u6A21\u5F0F',
        explainerText:
            '\u9009\u62E9\u662F\u5426\u4EC5\u5173\u6CE8\u672A\u8BFB\u548C\u7F6E\u9876\u7684\u804A\u5929\uFF0C\u6216\u8005\u663E\u793A\u6240\u6709\u6700\u8FD1\u7684\u548C\u7F6E\u9876\u7684\u804A\u5929\u5728\u9876\u90E8\u3002',
        priorityModes: {
            default: {
                label: '\u6700\u8FD1\u7684',
                description: '\u663E\u793A\u6240\u6709\u6309\u6700\u8FD1\u6392\u5E8F\u7684\u804A\u5929\u8BB0\u5F55',
            },
            gsd: {
                label: "Sorry, but you haven't provided any text to translate.",
                description: '\u53EA\u663E\u793A\u6309\u5B57\u6BCD\u6392\u5E8F\u7684\u672A\u8BFB\u5185\u5BB9',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `\u5728${policyName}\u4E2D`,
    },
    reportDescriptionPage: {
        roomDescription: '\u623F\u95F4\u63CF\u8FF0',
        roomDescriptionOptional: '\u623F\u95F4\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09',
        explainerText: '\u4E3A\u623F\u95F4\u8BBE\u7F6E\u81EA\u5B9A\u4E49\u63CF\u8FF0\u3002',
    },
    groupChat: {
        lastMemberTitle: '\u5C0F\u5FC3\uFF01',
        lastMemberWarning:
            '\u7531\u4E8E\u60A8\u662F\u6700\u540E\u4E00\u4E2A\u5728\u8FD9\u91CC\u7684\u4EBA\uFF0C\u79BB\u5F00\u5C06\u4F7F\u6240\u6709\u6210\u5458\u65E0\u6CD5\u8BBF\u95EE\u6B64\u804A\u5929\u3002\u60A8\u786E\u5B9A\u8981\u79BB\u5F00\u5417\uFF1F',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}'s group chat`,
    },
    languagePage: {
        language: "Sorry, but you didn't provide any text to translate.",
        languages: {
            en: {
                label: 'As an AI, I need the specific text or TypeScript function that you want me to translate into Chinese. Please provide the text or TypeScript function.',
            },
            es: {
                label: 'Lo siento, pero no proporcionaste ning\u00FAn texto para traducir. Por favor, proporciona el texto que necesitas traducir al chino.',
            },
        },
    },
    themePage: {
        theme: '\u4E3B\u9898',
        themes: {
            dark: {
                label: '\u6697\u8272',
            },
            light: {
                label: '\u5149',
            },
            system: {
                label: '\u4F7F\u7528\u8BBE\u5907\u8BBE\u7F6E',
            },
        },
        chooseThemeBelowOrSync: '\u5728\u4E0B\u9762\u9009\u62E9\u4E00\u4E2A\u4E3B\u9898\uFF0C\u6216\u4E0E\u4F60\u7684\u8BBE\u5907\u8BBE\u7F6E\u540C\u6B65\u3002',
    },
    termsOfUse: {
        phrase1: '\u901A\u8FC7\u767B\u5F55\uFF0C\u60A8\u540C\u610F',
        phrase2: '\u670D\u52A1\u6761\u6B3E',
        phrase3:
            "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        phrase4: '\u9690\u79C1',
        phrase5: `\u7531${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}\uFF08NMLS ID:2017010\uFF09\u63D0\u4F9B\u7684\u8D27\u5E01\u8F6C\u8D26\u670D\u52A1\uFF0C\u6839\u636E\u5176`,
        phrase6: '\u8BB8\u53EF\u8BC1',
    },
    validateCodeForm: {
        magicCodeNotReceived: '\u6CA1\u6709\u6536\u5230\u9B54\u6CD5\u4EE3\u7801\u5417\uFF1F',
        enterAuthenticatorCode: '\u8BF7\u8F93\u5165\u60A8\u7684\u9A8C\u8BC1\u5668\u4EE3\u7801',
        enterRecoveryCode: '\u8BF7\u8F93\u5165\u60A8\u7684\u6062\u590D\u4EE3\u7801',
        requiredWhen2FAEnabled: '\u5F53\u542F\u75282FA\u65F6\u9700\u8981',
        requestNewCode: '\u8BF7\u6C42\u4E00\u4E2A\u65B0\u7684\u4EE3\u7801',
        requestNewCodeAfterErrorOccurred: '\u8BF7\u6C42\u65B0\u7684\u4EE3\u7801',
        error: {
            pleaseFillMagicCode: '\u8ACB\u8F38\u5165\u60A8\u7684\u9B54\u6CD5\u4EE3\u78BC\u3002',
            incorrectMagicCode: '\u9519\u8BEF\u7684\u9B54\u6CD5\u4EE3\u7801\u3002',
            pleaseFillTwoFactorAuth: '\u8BF7\u8F93\u5165\u60A8\u7684\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801\u3002',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '\u8BF7\u586B\u5199\u6240\u6709\u5B57\u6BB5',
        pleaseFillPassword: '\u8BF7\u8F93\u5165\u60A8\u7684\u5BC6\u7801',
        pleaseFillTwoFactorAuth: '\u8BF7\u8F93\u5165\u60A8\u7684\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801',
        enterYourTwoFactorAuthenticationCodeToContinue: '\u7EE7\u7EED\u64CD\u4F5C\uFF0C\u8BF7\u8F93\u5165\u60A8\u7684\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801',
        forgot: '\u5FD8\u8BB0\u4E86\uFF1F',
        requiredWhen2FAEnabled: '\u5F53\u542F\u75282FA\u65F6\u9700\u8981',
        error: {
            incorrectPassword: '\u5BC6\u7801\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            incorrectLoginOrPassword: '\u767B\u5F55\u6216\u5BC6\u7801\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            incorrect2fa: '\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            twoFactorAuthenticationEnabled:
                '\u60A8\u5DF2\u5728\u6B64\u8D26\u6237\u4E0A\u542F\u7528\u4E862FA\u3002\u8BF7\u4F7F\u7528\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801\u767B\u5F55\u3002',
            invalidLoginOrPassword: '\u65E0\u6548\u7684\u767B\u5F55\u540D\u6216\u5BC6\u7801\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u91CD\u7F6E\u60A8\u7684\u5BC6\u7801\u3002',
            unableToResetPassword:
                '\u6211\u4EEC\u65E0\u6CD5\u66F4\u6539\u60A8\u7684\u5BC6\u7801\u3002\u8FD9\u53EF\u80FD\u662F\u7531\u4E8E\u65E7\u5BC6\u7801\u91CD\u7F6E\u7535\u5B50\u90AE\u4EF6\u4E2D\u7684\u5BC6\u7801\u91CD\u7F6E\u94FE\u63A5\u5DF2\u8FC7\u671F\u3002\u6211\u4EEC\u5DF2\u5411\u60A8\u53D1\u9001\u4E86\u65B0\u7684\u94FE\u63A5\uFF0C\u4EE5\u4FBF\u60A8\u518D\u6B21\u5C1D\u8BD5\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u6536\u4EF6\u7BB1\u548C\u5783\u573E\u90AE\u4EF6\u6587\u4EF6\u5939\uFF1B\u5B83\u5E94\u8BE5\u5728\u51E0\u5206\u949F\u5185\u5230\u8FBE\u3002',
            noAccess:
                '\u60A8\u65E0\u6CD5\u8BBF\u95EE\u6B64\u5E94\u7528\u7A0B\u5E8F\u3002\u8BF7\u6DFB\u52A0\u60A8\u7684GitHub\u7528\u6237\u540D\u4EE5\u83B7\u53D6\u8BBF\u95EE\u6743\u9650\u3002',
            accountLocked:
                '\u60A8\u7684\u5E33\u6236\u5728\u591A\u6B21\u5617\u8A66\u5931\u6557\u5F8C\u5DF2\u88AB\u9396\u5B9A\u3002\u8ACB\u57281\u5C0F\u6642\u5F8C\u518D\u8A66\u4E00\u6B21\u3002',
            fallback: '\u53D1\u751F\u4E86\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        },
    },
    loginForm: {
        phoneOrEmail: '\u7535\u8BDD\u6216\u7535\u5B50\u90AE\u4EF6',
        error: {
            invalidFormatEmailLogin: '\u8F93\u5165\u7684\u7535\u5B50\u90AE\u4EF6\u65E0\u6548\u3002\u8BF7\u4FEE\u6B63\u683C\u5F0F\u540E\u518D\u8BD5\u4E00\u6B21\u3002',
        },
        cannotGetAccountDetails: '\u65E0\u6CD5\u68C0\u7D22\u5E10\u6237\u8BE6\u7EC6\u4FE1\u606F\u3002\u8BF7\u5C1D\u8BD5\u518D\u6B21\u767B\u5F55\u3002',
        loginForm: '\u767B\u5F55\u8868\u683C',
        notYou: ({user}: NotYouParams) => `\u4E0D\u662F ${user} \u5417\uFF1F`,
    },
    onboarding: {
        welcome: '\u6B22\u8FCE\uFF01',
        welcomeSignOffTitle: '\u5F88\u9AD8\u5174\u89C1\u5230\u4F60\uFF01',
        explanationModal: {
            title: '\u6B22\u8FCE\u6765\u5230Expensify',
            description:
                '\u4E00\u6B3E\u5E94\u7528\u7A0B\u5E8F\uFF0C\u4EE5\u804A\u5929\u7684\u901F\u5EA6\u5904\u7406\u60A8\u7684\u5546\u4E1A\u548C\u4E2A\u4EBA\u6D88\u8D39\u3002\u8BD5\u8BD5\u770B\uFF0C\u8BA9\u6211\u4EEC\u77E5\u9053\u4F60\u7684\u60F3\u6CD5\u3002\u8FD8\u6709\u66F4\u591A\u7B49\u7740\u4F60\uFF01',
            secondaryDescription:
                '\u8981\u5207\u6362\u56DEExpensify Classic\uFF0C\u53EA\u9700\u70B9\u51FB\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u7167\u7247 > \u8F6C\u5230Expensify Classic\u3002',
        },
        welcomeVideo: {
            title: '\u6B22\u8FCE\u6765\u5230Expensify',
            description:
                '\u4E00\u6B3E\u5E94\u7528\uFF0C\u901A\u8FC7\u804A\u5929\u6765\u5904\u7406\u60A8\u7684\u6240\u6709\u5546\u4E1A\u548C\u4E2A\u4EBA\u6D88\u8D39\u3002\u4E3A\u60A8\u7684\u4E1A\u52A1\uFF0C\u60A8\u7684\u56E2\u961F\u548C\u60A8\u7684\u670B\u53CB\u91CF\u8EAB\u6253\u9020\u3002',
        },
        getStarted: '\u5F00\u59CB',
        whatsYourName: '\u4F60\u53EB\u4EC0\u4E48\u540D\u5B57\uFF1F',
        peopleYouMayKnow:
            '\u60A8\u53EF\u80FD\u8BA4\u8BC6\u7684\u4EBA\u5DF2\u7ECF\u5728\u8FD9\u91CC\u4E86\uFF01\u9A8C\u8BC1\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u4EE5\u52A0\u5165\u4ED6\u4EEC\u3002',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `\u4F86\u81EA${domain}\u7684\u67D0\u4EBA\u5DF2\u7D93\u5275\u5EFA\u4E86\u4E00\u500B\u5DE5\u4F5C\u5340\u3002\u8ACB\u8F38\u5165\u767C\u9001\u5230${email}\u7684\u9B54\u6CD5\u78BC\u3002`,
        joinAWorkspace: '\u52A0\u5165\u4E00\u4E2A\u5DE5\u4F5C\u7A7A\u95F4',
        listOfWorkspaces:
            '\u8FD9\u662F\u60A8\u53EF\u4EE5\u52A0\u5165\u7684\u5DE5\u4F5C\u7A7A\u95F4\u5217\u8868\u3002\u522B\u62C5\u5FC3\uFF0C\u5982\u679C\u4F60\u613F\u610F\uFF0C\u4F60\u53EF\u4EE5\u968F\u65F6\u4EE5\u540E\u518D\u52A0\u5165\u3002',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} member${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: '\u4F60\u5728\u54EA\u91CC\u5DE5\u4F5C\uFF1F',
        errorSelection: '\u8ACB\u9032\u884C\u9078\u64C7\u4EE5\u7E7C\u7E8C\u3002',
        purpose: {
            title: '\u4F60\u4ECA\u5929\u60F3\u505A\u4EC0\u4E48\uFF1F',
            errorContinue: '\u8ACB\u6309\u7E7C\u7E8C\u9032\u884C\u8A2D\u5B9A\u3002',
            errorBackButton: '\u8ACB\u5B8C\u6210\u8A2D\u7F6E\u554F\u984C\u4EE5\u958B\u59CB\u4F7F\u7528\u8A72\u61C9\u7528\u7A0B\u5E8F\u3002',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '\u7531\u6211\u7684\u96C7\u4E3B\u652F\u4ED8\u56DE\u6B3E',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '\u7BA1\u7406\u6211\u7684\u56E2\u961F\u7684\u8D39\u7528',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '\u8DDF\u8E2A\u548C\u9884\u7B97\u652F\u51FA',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '\u4E0E\u670B\u53CB\u804A\u5929\u5E76\u5206\u644A\u8D39\u7528',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]:
                '\u8FD9\u662F\u4E00\u4E2A\u9519\u8BEF\u7684\u8F93\u5165\uFF0C\u56E0\u4E3A\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        },
        employees: {
            title: '\u4F60\u6709\u591A\u5C11\u5458\u5DE5\uFF1F',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10\u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50\u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100\u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000\u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '\u8D85\u8FC71,000\u540D\u5458\u5DE5',
        },
        accounting: {
            title: '\u4F60\u6709\u4F7F\u7528\u4EFB\u4F55\u4F1A\u8BA1\u8F6F\u4EF6\u5417\uFF1F',
            noneOfAbove: 'The instruction seems to be incomplete as there is no specific text provided for translation. Please provide the text that needs to be translated.',
        },
        error: {
            requiredFirstName: '\u8BF7\u7EE7\u7EED\u8F93\u5165\u60A8\u7684\u540D\u5B57\u3002',
        },
    },
    featureTraining: {
        doNotShowAgain: '\u4E0D\u8981\u518D\u5411\u6211\u5C55\u793A\u8FD9\u4E2A',
    },
    personalDetails: {
        error: {
            containsReservedWord: '\u540D\u79F0\u4E0D\u80FD\u5305\u542BExpensify\u6216Concierge\u8FD9\u4E24\u4E2A\u8BCD\u3002',
            hasInvalidCharacter: '\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u9017\u53F7\u6216\u5206\u53F7\u3002',
            requiredFirstName: '\u540D\u5B57\u4E0D\u80FD\u70BA\u7A7A\u3002',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '\u4F60\u7684\u6CD5\u5B9A\u540D\u5B57\u662F\u4EC0\u4E48\uFF1F',
        enterDateOfBirth: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        enterAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        enterPhoneNumber: '\u4F60\u7684\u7535\u8BDD\u53F7\u7801\u662F\u4EC0\u4E48\uFF1F',
        personalDetails: '\u4E2A\u4EBA\u8BE6\u7EC6\u4FE1\u606F',
        privateDataMessage:
            '\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u7528\u4E8E\u65C5\u884C\u548C\u4ED8\u6B3E\u3002\u5B83\u4EEC\u4ECE\u4E0D\u5728\u60A8\u7684\u516C\u5F00\u4E2A\u4EBA\u8D44\u6599\u4E0A\u663E\u793A\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        address: '\u5730\u5740',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `\u65E5\u671F\u5E94\u5728${dateString}\u4E4B\u524D\u3002`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `\u65E5\u671F\u5E94\u5728${dateString}\u4E4B\u540E\u3002`,
            hasInvalidCharacter: '\u540D\u79F0\u53EA\u80FD\u5305\u542B\u62C9\u4E01\u5B57\u7B26\u3002',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) =>
                `\u90F5\u653F\u7DE8\u78BC\u683C\u5F0F\u4E0D\u6B63\u78BA\u3002${zipFormat ? ` 可接受的格式：${zipFormat}` : ''}`,
            invalidPhoneNumber: `\u8BF7\u786E\u4FDD\u7535\u8BDD\u53F7\u7801\u6709\u6548\uFF08\u4F8B\u5982\uFF0C${CONST.EXAMPLE_PHONE_NUMBER}\uFF09\u3002`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '\u94FE\u63A5\u5DF2\u91CD\u65B0\u53D1\u9001',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `\u6211\u5DF2\u7ECF\u5411${login}\u53D1\u9001\u4E86\u4E00\u4E2A\u795E\u5947\u7684\u767B\u5F55\u94FE\u63A5\u3002\u8BF7\u68C0\u67E5\u60A8\u7684${loginType}\u4EE5\u8FDB\u884C\u767B\u5F55\u3002`,
        resendLink: '\u91CD\u65B0\u53D1\u9001\u94FE\u63A5',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `\u8981\u9A8C\u8BC1 ${secondaryLogin}\uFF0C\u8BF7\u4ECE ${primaryLogin} \u7684\u8D26\u6237\u8BBE\u7F6E\u4E2D\u91CD\u65B0\u53D1\u9001\u9B54\u672F\u4EE3\u7801\u3002`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) =>
            `\u5982\u679C\u60A8\u5DF2\u65E0\u6CD5\u4F7F\u7528${primaryLogin}\uFF0C\u8BF7\u89E3\u9664\u60A8\u7684\u8D26\u6237\u5173\u8054\u3002`,
        unlink: '\u53D6\u6D88\u94FE\u63A5',
        linkSent: '\u94FE\u63A5\u5DF2\u53D1\u9001\uFF01',
        succesfullyUnlinkedLogin: '\u6210\u529F\u53D6\u6D88\u5173\u8054\u7684\u6B21\u8981\u767B\u5F55\uFF01',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `\u6211\u4EEC\u7684\u7535\u5B50\u90AE\u4EF6\u63D0\u4F9B\u5546\u7531\u4E8E\u6295\u9012\u95EE\u9898\u6682\u65F6\u505C\u6B62\u5411${login}\u53D1\u9001\u7535\u5B50\u90AE\u4EF6\u3002\u8981\u89E3\u9501\u60A8\u7684\u767B\u5F55\uFF0C\u8BF7\u6309\u7167\u4EE5\u4E0B\u6B65\u9AA4\u64CD\u4F5C\uFF1A`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `\u78BA\u8A8D${login}\u7684\u62FC\u5BEB\u662F\u5426\u6B63\u78BA\uFF0C\u4E26\u4E14\u662F\u4E00\u500B\u771F\u5BE6\u7684\uFF0C\u53EF\u4EE5\u63A5\u6536\u7684\u96FB\u5B50\u90F5\u4EF6\u5730\u5740\u3002`,
        emailAliases:
            '\u7535\u5B50\u90AE\u4EF6\u522B\u540D\uFF0C\u5982"expenses@domain.com"\uFF0C\u5FC5\u987B\u6709\u81EA\u5DF1\u7684\u7535\u5B50\u90AE\u4EF6\u6536\u4EF6\u7BB1\u624D\u80FD\u6210\u4E3A\u6709\u6548\u7684Expensify\u767B\u5F55\u3002',
        ensureYourEmailClient: '\u786E\u4FDD\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u5BA2\u6237\u7AEF\u5141\u8BB8expensify.com\u7684\u90AE\u4EF6\u3002',
        youCanFindDirections: '\u60A8\u53EF\u4EE5\u627E\u5230\u5982\u4F55\u5B8C\u6210\u6B64\u6B65\u9AA4\u7684\u6307\u793A',
        helpConfigure: '\u4F46\u60A8\u53EF\u80FD\u9700\u8981\u60A8\u7684IT\u90E8\u95E8\u6765\u5E2E\u52A9\u914D\u7F6E\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u8BBE\u7F6E\u3002',
        onceTheAbove: '\u4E00\u65E6\u5B8C\u6210\u4E0A\u8FF0\u6B65\u9AA4\uFF0C\u8BF7\u8054\u7CFB ${username}',
        toUnblock: '\u8981\u89E3\u9501\u60A8\u7684\u767B\u5F55\u3002',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `\u6211\u4EEC\u65E0\u6CD5\u5411${login}\u53D1\u9001\u77ED\u4FE1\uFF0C\u6240\u4EE5\u6211\u4EEC\u5DF2\u5C06\u5176\u6682\u505C24\u5C0F\u65F6\u3002\u8BF7\u5C1D\u8BD5\u9A8C\u8BC1\u60A8\u7684\u53F7\u7801\uFF1A`,
        validationFailed: '\u9A8C\u8BC1\u5931\u8D25\uFF0C\u56E0\u4E3A\u8DDD\u79BB\u60A8\u4E0A\u6B21\u5C1D\u8BD5\u8FD8\u6CA1\u6709\u8FC724\u5C0F\u65F6\u3002',
        validationSuccess: '\u60A8\u7684\u53F7\u7801\u5DF2\u901A\u8FC7\u9A8C\u8BC1\uFF01\u70B9\u51FB\u4E0B\u65B9\u53D1\u9001\u65B0\u7684\u9B54\u6CD5\u767B\u5F55\u7801\u3002',
    },
    welcomeSignUpForm: {
        join: '\u52A0\u5165',
    },
    detailsPage: {
        localTime: '\u672C\u5730\u65F6\u95F4',
    },
    newChatPage: {
        startGroup: '\u5F00\u59CB\u7EC4',
        addToGroup: '\u6DFB\u52A0\u5230\u7FA4\u7EC4',
    },
    yearPickerPage: {
        year: '\u5E74',
        selectYear: '\u8BF7\u9009\u62E9\u4E00\u5E74',
    },
    focusModeUpdateModal: {
        title: '\u6B22\u8FCE\u6765\u5230 #focus \u6A21\u5F0F\uFF01',
        prompt: '\u901A\u8FC7\u4EC5\u67E5\u770B\u672A\u8BFB\u804A\u5929\u6216\u9700\u8981\u60A8\u6CE8\u610F\u7684\u804A\u5929\u6765\u4FDD\u6301\u5BF9\u4E8B\u60C5\u7684\u638C\u63A7\u3002\u522B\u62C5\u5FC3\uFF0C\u60A8\u53EF\u4EE5\u5728\u4EFB\u4F55\u65F6\u5019\u66F4\u6539\u8FD9\u4E00\u70B9\u3002',
        settings: '\u8BBE\u7F6E',
    },
    notFound: {
        chatYouLookingForCannotBeFound: '\u60A8\u6B63\u5728\u627E\u7684\u804A\u5929\u65E0\u6CD5\u627E\u5230\u3002',
        getMeOutOfHere: '\u8BA9\u6211\u51FA\u53BB',
        iouReportNotFound: '\u60A8\u6B63\u5728\u67E5\u627E\u7684\u4ED8\u6B3E\u8BE6\u60C5\u65E0\u6CD5\u627E\u5230\u3002',
        notHere: 'Hmm...\u8FD9\u91CC\u6CA1\u6709',
        pageNotFound: '\u54CE\u5440\uFF0C\u627E\u4E0D\u5230\u6B64\u9875\u9762',
        noAccess: '\u8A72\u804A\u5929\u4E0D\u5B58\u5728\uFF0C\u6216\u8005\u60A8\u7121\u6CD5\u8A2A\u554F\u5B83\u3002\u5617\u8A66\u4F7F\u7528\u641C\u7D22\u4F86\u627E\u5230\u804A\u5929\u3002',
        goBackHome: '\u8FD4\u56DE\u4E3B\u9875',
    },
    setPasswordPage: {
        enterPassword: '\u8F93\u5165\u5BC6\u7801',
        setPassword: '\u8BBE\u7F6E\u5BC6\u7801',
        newPasswordPrompt:
            '\u60A8\u7684\u5BC6\u7801\u5FC5\u987B\u81F3\u5C11\u5305\u542B8\u4E2A\u5B57\u7B26\uFF0C1\u4E2A\u5927\u5199\u5B57\u6BCD\uFF0C1\u4E2A\u5C0F\u5199\u5B57\u6BCD\u548C1\u4E2A\u6570\u5B57\u3002',
        passwordFormTitle: '\u6B22\u8FCE\u56DE\u5230\u65B0\u7684Expensify\uFF01\u8BF7\u8BBE\u7F6E\u60A8\u7684\u5BC6\u7801\u3002',
        passwordNotSet:
            '\u6211\u4EEC\u65E0\u6CD5\u8BBE\u7F6E\u60A8\u7684\u65B0\u5BC6\u7801\u3002\u6211\u4EEC\u5DF2\u5411\u60A8\u53D1\u9001\u4E86\u65B0\u7684\u5BC6\u7801\u94FE\u63A5\uFF0C\u4EE5\u4FBF\u60A8\u518D\u6B21\u5C1D\u8BD5\u3002',
        setPasswordLinkInvalid:
            '\u6B64\u8A2D\u7F6E\u5BC6\u78BC\u93C8\u63A5\u7121\u6548\u6216\u5DF2\u904E\u671F\u3002\u65B0\u7684\u93C8\u63A5\u5DF2\u5728\u60A8\u7684\u96FB\u5B50\u90F5\u4EF6\u6536\u4EF6\u7BB1\u4E2D\u7B49\u5F85\u60A8\uFF01',
        validateAccount: '\u9A8C\u8BC1\u8D26\u6237',
    },
    statusPage: {
        status: '\u72B6\u6001',
        statusExplanation:
            '\u5411\u60A8\u7684\u540C\u4E8B\u548C\u670B\u53CB\u6DFB\u52A0\u4E00\u4E2A\u8868\u60C5\u7B26\u53F7\uFF0C\u8BA9\u4ED6\u4EEC\u8F7B\u677E\u4E86\u89E3\u6B63\u5728\u53D1\u751F\u7684\u4E8B\u60C5\u3002\u60A8\u4E5F\u53EF\u4EE5\u9009\u62E9\u6DFB\u52A0\u4E00\u6761\u6D88\u606F\uFF01',
        today: '\u4ECA\u5929',
        clearStatus: '\u6E05\u9664\u72B6\u6001',
        save: '\u4FDD\u5B58',
        message: '\u4FE1\u606F',
        timePeriods: {
            never: '\u5F9E\u4E0D',
            thirtyMinutes: '30\u5206\u949F',
            oneHour: '1\u5C0F\u65F6',
            afterToday: '\u4ECA\u5929',
            afterWeek: '\u4E00\u5468',
            custom: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        },
        untilTomorrow: '\u76F4\u5230\u660E\u5929',
        untilTime: ({time}: UntilTimeParams) => `\u76F4\u5230${time}`,
        date: '\u65E5\u671F',
        time: '\u65F6\u95F4',
        clearAfter:
            '\u60A8\u7684\u95EE\u9898\u4F3C\u4E4E\u4E0D\u5B8C\u6574\uFF0C\u6211\u65E0\u6CD5\u63D0\u4F9B\u51C6\u786E\u7684\u7FFB\u8BD1\u3002\u5982\u679C\u60A8\u9700\u8981\u5C06\u67D0\u6BB5\u6587\u672C\u4ECE\u82F1\u8BED\u7FFB\u8BD1\u6210\u4E2D\u6587\uFF0C\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u6587\u672C\u3002',
        whenClearStatus: '\u6211\u4EEC\u5E94\u8BE5\u4F55\u65F6\u6E05\u9664\u60A8\u7684\u72B6\u6001\uFF1F',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `\u6B65\u9AA4 ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '\u94F6\u884C\u4FE1\u606F',
        confirmBankInfo: '\u786E\u8BA4\u94F6\u884C\u4FE1\u606F',
        manuallyAdd: '\u624B\u52A8\u6DFB\u52A0\u60A8\u7684\u94F6\u884C\u8D26\u6237',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u5207\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
        accountEnding: '\u4EE5\u7D50\u675F\u7684\u8CEC\u6236',
        thisBankAccount: '\u6B64\u94F6\u884C\u8D26\u6237\u5C06\u7528\u4E8E\u60A8\u7684\u5DE5\u4F5C\u533A\u7684\u5546\u4E1A\u652F\u4ED8',
        accountNumber: '\u5E33\u6236\u865F\u78BC',
        routingNumber: '\u8DEF\u7531\u53F7\u7801',
        chooseAnAccountBelow: '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u7684\u8D26\u6237',
        addBankAccount: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
        chooseAnAccount: '\u9009\u62E9\u4E00\u4E2A\u8D26\u6237',
        connectOnlineWithPlaid: '\u767B\u5F55\u60A8\u7684\u94F6\u884C',
        connectManually: '\u624B\u52A8\u8FDE\u63A5',
        desktopConnection:
            '\u6CE8\u610F\uFF1A\u82E5\u8981\u9023\u63A5\u5230 Chase\uFF0CWells Fargo\uFF0CCapital One \u6216 Bank of America\uFF0C\u8ACB\u9EDE\u64CA\u6B64\u8655\u5728\u700F\u89BD\u5668\u4E2D\u5B8C\u6210\u6B64\u904E\u7A0B\u3002',
        yourDataIsSecure: '\u60A8\u7684\u6570\u636E\u662F\u5B89\u5168\u7684',
        toGetStarted:
            '\u5728\u4E00\u4E2A\u5730\u65B9\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4EE5\u62A5\u9500\u8D39\u7528\uFF0C\u53D1\u884CExpensify\u5361\uFF0C\u6536\u96C6\u53D1\u7968\u4ED8\u6B3E\uFF0C\u5E76\u652F\u4ED8\u6240\u6709\u8D26\u5355\u3002',
        plaidBodyCopy:
            '\u7ED9\u60A8\u7684\u5458\u5DE5\u4E00\u4E2A\u66F4\u7B80\u5355\u7684\u65B9\u5F0F\u6765\u652F\u4ED8 - \u5E76\u5F97\u5230\u62A5\u9500 - \u516C\u53F8\u7684\u8D39\u7528\u3002',
        checkHelpLine: '\u60A8\u7684\u8DEF\u7531\u53F7\u7801\u548C\u8D26\u6237\u53F7\u7801\u53EF\u4EE5\u5728\u8BE5\u8D26\u6237\u7684\u652F\u7968\u4E0A\u627E\u5230\u3002',
        validateAccountError: {
            phrase1: '\u7B49\u4E00\u4E0B\uFF01\u6211\u4EEC\u9700\u8981\u4F60\u5148\u9A8C\u8BC1\u4F60\u7684\u8D26\u6237\u3002\u4E3A\u4E86\u505A\u5230\u8FD9\u4E00\u70B9\uFF0C',
            phrase2: '\u4F7F\u7528\u9B54\u6CD5\u4EE3\u7801\u91CD\u65B0\u767B\u5F55',
            phrase3:
                "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u4ED6\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            phrase4: '\u5728\u6B64\u5904\u9A8C\u8BC1\u60A8\u7684\u5E10\u6237',
        },
        hasPhoneLoginError:
            '\u8981\u6DFB\u52A0\u5DF2\u9A8C\u8BC1\u7684\u94F6\u884C\u8D26\u6237\uFF0C\u8BF7\u786E\u4FDD\u60A8\u7684\u4E3B\u8981\u767B\u5F55\u65B9\u5F0F\u662F\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6\uFF0C\u7136\u540E\u518D\u8BD5\u4E00\u6B21\u3002\u60A8\u53EF\u4EE5\u5C06\u60A8\u7684\u7535\u8BDD\u53F7\u7801\u4F5C\u4E3A\u6B21\u8981\u767B\u5F55\u65B9\u5F0F\u6DFB\u52A0\u3002',
        hasBeenThrottledError: '\u6DFB\u52A0\u60A8\u7684\u94F6\u884C\u8D26\u6237\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u7B49\u5F85\u51E0\u5206\u949F\u540E\u518D\u8BD5\u4E00\u6B21\u3002',
        hasCurrencyError:
            '\u54CE\u5440\uFF01\u770B\u8D77\u6765\u60A8\u7684\u5DE5\u4F5C\u533A\u8D27\u5E01\u8BBE\u7F6E\u7684\u4E0D\u662F\u7F8E\u5143\u3002\u8981\u7EE7\u7EED\uFF0C\u8BF7\u5C06\u5176\u8BBE\u7F6E\u4E3A\u7F8E\u5143\u7136\u540E\u518D\u8BD5\u4E00\u6B21\u3002',
        error: {
            youNeedToSelectAnOption: '\u8ACB\u9078\u64C7\u4E00\u500B\u9078\u9805\u4EE5\u7E7C\u7E8C\u3002',
            noBankAccountAvailable: '\u5BF9\u4E0D\u8D77\uFF0C\u6CA1\u6709\u53EF\u7528\u7684\u94F6\u884C\u8D26\u6237\u3002',
            noBankAccountSelected: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u8D26\u6237\u3002',
            taxID: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7A0E\u52A1\u8BC6\u522B\u53F7\u3002',
            website: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7F51\u7AD9\u3002',
            zipCode: `\u8BF7\u6309\u7167\u4EE5\u4E0B\u683C\u5F0F\u8F93\u5165\u6709\u6548\u7684\u90AE\u653F\u7F16\u7801\uFF1A${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}\u3002`,
            phoneNumber: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u96FB\u8A71\u865F\u78BC\u3002',
            email: '\u8ACB\u8F38\u5165\u6709\u6548\u7684\u96FB\u5B50\u90F5\u4EF6\u5730\u5740\u3002',
            companyName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5546\u4E1A\u540D\u79F0\u3002',
            addressCity: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u57CE\u5E02\u3002',
            addressStreet: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8857\u9053\u5730\u5740\u3002',
            addressState: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u72B6\u6001\u3002',
            incorporationDateFuture: '\u8A2D\u7ACB\u65E5\u671F\u4E0D\u80FD\u5728\u672A\u4F86\u3002',
            incorporationState: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u72B6\u6001\u3002',
            industryCode: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u6709\u6548\u7684\u516D\u4F4D\u6570\u884C\u4E1A\u5206\u7C7B\u4EE3\u7801\u3002',
            restrictedBusiness: '\u8BF7\u786E\u8BA4\u8BE5\u4F01\u4E1A\u4E0D\u5728\u53D7\u9650\u5236\u4F01\u4E1A\u7684\u540D\u5355\u4E0A\u3002',
            routingNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8DEF\u7531\u53F7\u7801\u3002',
            accountNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8D26\u53F7\u3002',
            routingAndAccountNumberCannotBeSame: '\u8DEF\u7531\u548C\u5E10\u6237\u53F7\u7801\u4E0D\u80FD\u5339\u914D\u3002',
            companyType: '\u8BF7\u9009\u62E9\u6709\u6548\u7684\u516C\u53F8\u7C7B\u578B\u3002',
            tooManyAttempts:
                '\u7531\u4E8E\u767B\u5F55\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u6B64\u9009\u9879\u5DF2\u88AB\u7981\u752824\u5C0F\u65F6\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216\u624B\u52A8\u8F93\u5165\u8BE6\u7EC6\u4FE1\u606F\u3002',
            address: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5730\u5740\u3002',
            dob: '\u8ACB\u9078\u64C7\u6709\u6548\u7684\u51FA\u751F\u65E5\u671F\u3002',
            age: '\u5FC5\u987B\u8D85\u8FC718\u5C81\u3002',
            ssnLast4: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u793E\u4F1A\u5B89\u5168\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u3002',
            firstName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u540D\u5B57\u3002',
            lastName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u59D3\u6C0F\u3002',
            noDefaultDepositAccountOrDebitCardAvailable: '\u8ACB\u6DFB\u52A0\u9810\u8A2D\u7684\u5B58\u6B3E\u8CEC\u6236\u6216\u501F\u8A18\u5361\u3002',
            validationAmounts:
                '\u60A8\u8F93\u5165\u7684\u9A8C\u8BC1\u91D1\u989D\u4E0D\u6B63\u786E\u3002\u8BF7\u4ED4\u7EC6\u68C0\u67E5\u60A8\u7684\u94F6\u884C\u5BF9\u8D26\u5355\u5E76\u518D\u8BD5\u4E00\u6B21\u3002',
            fullName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5168\u540D\u3002',
            ownershipPercentage: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u767E\u5206\u6BD4\u6570\u5B57\u3002',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '\u4F60\u7684\u94F6\u884C\u8D26\u6237\u5728\u54EA\u91CC\uFF1F',
        accountDetailsStepHeader: '\u4F60\u7684\u8D26\u6237\u8BE6\u60C5\u662F\u4EC0\u4E48\uFF1F',
        accountTypeStepHeader: '\u8FD9\u662F\u4EC0\u4E48\u7C7B\u578B\u7684\u8D26\u6237\uFF1F',
        bankInformationStepHeader: '\u4F60\u7684\u94F6\u884C\u8BE6\u7EC6\u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F',
        accountHolderInformationStepHeader: '\u8D26\u6237\u6301\u6709\u4EBA\u7684\u8BE6\u7EC6\u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F',
        howDoWeProtectYourData: '\u6211\u4EEC\u5982\u4F55\u4FDD\u62A4\u60A8\u7684\u6570\u636E\uFF1F',
        currencyHeader: '\u4F60\u7684\u94F6\u884C\u8D26\u6237\u7684\u8D27\u5E01\u662F\u4EC0\u4E48\uFF1F',
        confirmationStepHeader: '\u68C0\u67E5\u4F60\u7684\u4FE1\u606F\u3002',
        confirmationStepSubHeader: '\u8BF7\u4ED4\u7EC6\u6838\u5BF9\u4EE5\u4E0B\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u5E76\u52FE\u9009\u6761\u6B3E\u6846\u4EE5\u786E\u8BA4\u3002',
    },
    addPersonalBankAccountPage: {
        enterPassword: '\u8F93\u5165Expensify\u5BC6\u7801',
        alreadyAdded: '\u6B64\u5E33\u6236\u5DF2\u88AB\u6DFB\u52A0\u3002',
        chooseAccountLabel: '\u5E10\u6237',
        successTitle: '\u5DF2\u6DFB\u52A0\u4E2A\u4EBA\u94F6\u884C\u8D26\u6237\uFF01',
        successMessage: '\u606D\u559C\uFF0C\u60A8\u7684\u94F6\u884C\u8D26\u6237\u5DF2\u8BBE\u7F6E\u5B8C\u6BD5\uFF0C\u51C6\u5907\u597D\u63A5\u6536\u62A5\u9500\u6B3E\u9879\u3002',
    },
    attachmentView: {
        unknownFilename:
            'As an AI, I need more specific details to provide a correct translation. Please provide the text or TypeScript function you want to translate and specify the target language (ch can refer to Chinese, Chamorro, etc.).',
        passwordRequired: '\u8BF7\u8F93\u5165\u5BC6\u7801',
        passwordIncorrect: '\u5BC6\u7801\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        failedToLoadPDF: '\u65E0\u6CD5\u52A0\u8F7D PDF \u6587\u4EF6\u3002',
        pdfPasswordForm: {
            title: '\u53D7\u5BC6\u7801\u4FDD\u62A4\u7684PDF',
            infoText: '\u6B64 PDF \u53D7\u5230\u5BC6\u7801\u4FDD\u62A4\u3002',
            beforeLinkText:
                '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u4EE5\u4FBF\u4E8E\u7FFB\u8BD1\u3002',
            linkText: '\u8F93\u5165\u5BC6\u7801',
            afterLinkText: '\u8981\u67E5\u770B\u5B83\u3002',
            formLabel: '\u67E5\u770B PDF',
        },
        attachmentNotFound: '\u9644\u4EF6\u672A\u627E\u5230',
    },
    messages: {
        errorMessageInvalidPhone: `\u8ACB\u8F38\u5165\u6709\u6548\u7684\u96FB\u8A71\u865F\u78BC\uFF0C\u4E0D\u8981\u5305\u542B\u62EC\u865F\u6216\u7834\u6298\u865F\u3002\u5982\u679C\u60A8\u5728\u7F8E\u570B\u4EE5\u5916\u7684\u5730\u65B9\uFF0C\u8ACB\u5305\u542B\u60A8\u7684\u570B\u5BB6\u4EE3\u78BC\uFF08\u4F8B\u5982 ${CONST.EXAMPLE_PHONE_NUMBER}\uFF09\u3002`,
        errorMessageInvalidEmail: '\u65E0\u6548\u7684\u7535\u5B50\u90AE\u4EF6',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is already a member of ${name}`,
    },
    onfidoStep: {
        acceptTerms: '\u7EE7\u7EED\u8BF7\u6C42\u6FC0\u6D3B\u60A8\u7684Expensify\u94B1\u5305\uFF0C\u60A8\u786E\u8BA4\u60A8\u5DF2\u9605\u8BFB\uFF0C\u7406\u89E3\u5E76\u63A5\u53D7',
        facialScan: 'Onfido\u7684\u9762\u90E8\u626B\u63CF\u653F\u7B56\u548C\u91CA\u653E',
        tryAgain: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        verifyIdentity: '\u9A8C\u8BC1\u8EAB\u4EFD',
        letsVerifyIdentity: '\u8BA9\u6211\u4EEC\u9A8C\u8BC1\u60A8\u7684\u8EAB\u4EFD',
        butFirst: `But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: '\u8655\u7406\u6B64\u6B65\u9A5F\u6642\u767C\u751F\u932F\u8AA4\u3002\u8ACB\u518D\u8A66\u4E00\u6B21\u3002',
        cameraPermissionsNotGranted: '\u542F\u7528\u6444\u50CF\u5934\u8BBF\u95EE',
        cameraRequestMessage:
            '\u6211\u4EEC\u9700\u8981\u8BBF\u95EE\u60A8\u7684\u6444\u50CF\u5934\u4EE5\u5B8C\u6210\u94F6\u884C\u8D26\u6237\u9A8C\u8BC1\u3002\u8BF7\u901A\u8FC7\u8BBE\u7F6E>\u65B0\u7684Expensify\u542F\u7528\u3002',
        microphonePermissionsNotGranted: '\u542F\u7528\u9EA6\u514B\u98CE\u8BBF\u95EE\u6743\u9650',
        microphoneRequestMessage:
            '\u6211\u4EEC\u9700\u8981\u8BBF\u95EE\u60A8\u7684\u9EA6\u514B\u98CE\u4EE5\u5B8C\u6210\u94F6\u884C\u8D26\u6237\u9A8C\u8BC1\u3002\u8BF7\u901A\u8FC7\u8BBE\u7F6E>\u65B0\u7684Expensify\u542F\u7528\u3002',
        originalDocumentNeeded: '\u8BF7\u4E0A\u4F20\u60A8\u8EAB\u4EFD\u8BC1\u7684\u539F\u59CB\u56FE\u7247\uFF0C\u800C\u4E0D\u662F\u622A\u56FE\u6216\u626B\u63CF\u56FE\u50CF\u3002',
        documentNeedsBetterQuality:
            '\u60A8\u7684\u8EAB\u4EFD\u8BC1\u4F3C\u4E4E\u5DF2\u7ECF\u635F\u574F\u6216\u7F3A\u5C11\u5B89\u5168\u7279\u5F81\u3002\u8BF7\u4E0A\u4F20\u4E00\u5F20\u5B8C\u6574\u53EF\u89C1\u4E14\u672A\u53D7\u635F\u7684\u8EAB\u4EFD\u8BC1\u539F\u56FE\u3002',
        imageNeedsBetterQuality:
            '\u60A8\u7684\u8EAB\u4EFD\u8BC1\u7167\u7247\u8D28\u91CF\u5B58\u5728\u95EE\u9898\u3002\u8BF7\u4E0A\u4F20\u4E00\u5F20\u65B0\u7684\u7167\u7247\uFF0C\u5176\u4E2D\u60A8\u7684\u6574\u4E2A\u8EAB\u4EFD\u8BC1\u90FD\u80FD\u6E05\u6670\u770B\u5230\u3002',
        selfieIssue: '\u60A8\u7684\u81EA\u62CD/\u89C6\u9891\u5B58\u5728\u95EE\u9898\u3002\u8BF7\u4E0A\u4F20\u5B9E\u65F6\u81EA\u62CD/\u89C6\u9891\u3002',
        selfieNotMatching:
            '\u60A8\u7684\u81EA\u62CD\u7167/\u89C6\u9891\u4E0E\u60A8\u7684\u8EAB\u4EFD\u8BC1\u4E0D\u7B26\u3002\u8BF7\u4E0A\u4F20\u4E00\u5F20\u65B0\u7684\u81EA\u62CD\u7167/\u89C6\u9891\uFF0C\u5176\u4E2D\u53EF\u4EE5\u6E05\u695A\u5730\u770B\u5230\u60A8\u7684\u8138\u3002',
        selfieNotLive:
            '\u4F60\u7684\u81EA\u62CD\u7167/\u89C6\u9891\u4F3C\u4E4E\u4E0D\u662F\u5B9E\u65F6\u7684\u7167\u7247/\u89C6\u9891\u3002\u8BF7\u4E0A\u4F20\u5B9E\u65F6\u7684\u81EA\u62CD\u7167/\u89C6\u9891\u3002',
    },
    additionalDetailsStep: {
        headerTitle:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        helpText:
            '\u5728\u60A8\u53EF\u4EE5\u4ECE\u94B1\u5305\u4E2D\u53D1\u9001\u548C\u63A5\u6536\u8D44\u91D1\u4E4B\u524D\uFF0C\u6211\u4EEC\u9700\u8981\u786E\u8BA4\u4EE5\u4E0B\u4FE1\u606F\u3002',
        helpTextIdologyQuestions: '\u6211\u4EEC\u9700\u8981\u518D\u5411\u60A8\u8BE2\u95EE\u51E0\u4E2A\u95EE\u9898\u4EE5\u5B8C\u6210\u9A8C\u8BC1\u60A8\u7684\u8EAB\u4EFD\u3002',
        helpLink: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u6211\u4EEC\u4E3A\u4EC0\u4E48\u9700\u8981\u8FD9\u4E2A\u7684\u4FE1\u606F\u3002',
        legalFirstNameLabel: '\u6CD5\u5B9A\u540D\u5B57',
        legalMiddleNameLabel: '\u6CD5\u5B9A\u4E2D\u95F4\u540D',
        legalLastNameLabel: '\u6CD5\u5B9A\u59D3\u6C0F',
        selectAnswer: '\u8ACB\u9078\u64C7\u4E00\u500B\u56DE\u61C9\u4EE5\u7E7C\u7E8C\u3002',
        ssnFull9Error: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u4E5D\u4F4D\u6570\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u3002',
        needSSNFull9:
            '\u6211\u4EEC\u5728\u9A8C\u8BC1\u60A8\u7684\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u65F6\u9047\u5230\u4E86\u95EE\u9898\u3002\u8BF7\u8F93\u5165\u60A8\u7684\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u7684\u5168\u90E8\u4E5D\u4F4D\u6570\u5B57\u3002',
        weCouldNotVerify: '\u6211\u4EEC\u65E0\u6CD5\u9A8C\u8BC1',
        pleaseFixIt: '\u5728\u7EE7\u7EED\u4E4B\u524D\uFF0C\u8BF7\u4FEE\u6B63\u8FD9\u4E9B\u4FE1\u606F',
        failedKYCTextBefore: '\u6211\u4EEC\u65E0\u6CD5\u9A8C\u8BC1\u60A8\u7684\u8EAB\u4EFD\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\uFF0C\u6216\u8054\u7CFB',
        failedKYCTextAfter: '\u5982\u679C\u4F60\u6709\u4EFB\u4F55\u95EE\u9898\u3002',
    },
    termsStep: {
        headerTitle: '\u689D\u6B3E\u548C\u8CBB\u7528',
        headerTitleRefactor: '\u8D39\u7528\u548C\u6761\u6B3E',
        haveReadAndAgree: '\u6211\u5DF2\u9605\u8BFB\u5E76\u540C\u610F\u63A5\u6536',
        electronicDisclosures: '\u7535\u5B50\u62AB\u9732',
        agreeToThe: '\u6211\u540C\u610F',
        walletAgreement: '\u94B1\u5305\u534F\u8BAE',
        enablePayments: '\u542F\u7528\u652F\u4ED8',
        monthlyFee: '\u6BCF\u6708\u8D39\u7528',
        inactivity: '\u4E0D\u6D3B\u52A8',
        noOverdraftOrCredit: '\u6CA1\u6709\u900F\u652F/\u4FE1\u7528\u529F\u80FD\u3002',
        electronicFundsWithdrawal: '\u7535\u5B50\u8D44\u91D1\u63D0\u53D6',
        standard:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        reviewTheFees: '\u8ACB\u67E5\u770B\u4EE5\u4E0B\u7684\u8CBB\u7528\u3002',
        checkTheBoxes: '\u8BF7\u5728\u4E0B\u9762\u7684\u6846\u4E2D\u6253\u52FE\u3002',
        agreeToTerms: '\u540C\u610F\u8FD9\u4E9B\u6761\u6B3E\uFF0C\u4F60\u5C31\u53EF\u4EE5\u5F00\u59CB\u4E86\uFF01',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify \u94B1\u5305\u7531 ${walletProgram} \u53D1\u884C\u3002`,
            perPurchase: '\u6BCF\u6B21\u8D2D\u4E70',
            atmWithdrawal: 'ATM\u63D0\u6B3E',
            cashReload: '\u73B0\u91D1\u91CD\u65B0\u52A0\u8F7D',
            inNetwork: '\u5728\u7F51\u7EDC\u5185',
            outOfNetwork: '\u975E\u7F51\u7EDC\u5185',
            atmBalanceInquiry: 'ATM\u4F59\u989D\u67E5\u8BE2',
            inOrOutOfNetwork: '(\u5728\u7DB2\u7D61\u5167\u6216\u7DB2\u7D61\u5916)',
            customerService: '\u5BA2\u6237\u670D\u52A1',
            automatedOrLive: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that needs to be translated?',
            afterTwelveMonths: '(\u5728\u6CA1\u6709\u4EA4\u6613\u768412\u4E2A\u6708\u540E)',
            weChargeOneFee: '\u6211\u4EEC\u6536\u53D6\u4E00\u79CD\u7C7B\u578B\u7684\u8D39\u7528\u3002',
            fdicInsurance: '\u60A8\u7684\u8D44\u91D1\u6709\u8D44\u683C\u83B7\u5F97FDIC\u4FDD\u9669\u3002',
            generalInfo: '\u6709\u5173\u9884\u4ED8\u8D26\u6237\u7684\u4E00\u822C\u4FE1\u606F\uFF0C\u8BF7\u8BBF\u95EE',
            conditionsDetails: '\u6709\u5173\u6240\u6709\u8D39\u7528\u548C\u670D\u52A1\u7684\u8BE6\u7EC6\u4FE1\u606F\u548C\u6761\u4EF6\uFF0C\u8BF7\u8BBF\u95EE',
            conditionsPhone: '\u6216\u8005\u62E8\u6253 +1 833-400-0904\u3002',
            instant: 'Sorry, but your request is unclear. Could you please provide more information or context?',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(\u6700\u5C11 ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: '\u6240\u6709Expensify Wallet\u8D39\u7528\u7684\u5217\u8868',
            typeOfFeeHeader: '\u8D39\u7528\u7C7B\u578B',
            feeAmountHeader: '\u8D39\u7528\u91D1\u989D',
            moreDetailsHeader:
                'Apologies for the confusion, but your request seems to be missing the actual text or TypeScript function that needs to be translated. Could you please provide the text or function that you want translated?',
            openingAccountTitle: '\u5F00\u8BBE\u8D26\u6237',
            openingAccountDetails: '\u5F00\u8BBE\u8D26\u6237\u662F\u514D\u8D39\u7684\u3002',
            monthlyFeeDetails: '\u6CA1\u6709\u6708\u8D39\u3002',
            customerServiceTitle: '\u5BA2\u6237\u670D\u52A1',
            customerServiceDetails: '\u6CA1\u6709\u5BA2\u6237\u670D\u52A1\u8D39\u3002',
            inactivityDetails: '\u6CA1\u6709\u4E0D\u6D3B\u8DC3\u8D39\u7528\u3002',
            sendingFundsTitle: '\u5411\u53E6\u4E00\u4E2A\u8D26\u6237\u6301\u6709\u4EBA\u53D1\u9001\u8D44\u91D1',
            sendingFundsDetails:
                '\u4F7F\u7528\u60A8\u7684\u4F59\u989D\u3001\u94F6\u884C\u8D26\u6237\u6216\u501F\u8BB0\u5361\u5411\u53E6\u4E00\u4E2A\u8D26\u6237\u6301\u6709\u4EBA\u53D1\u9001\u8D44\u91D1\u662F\u514D\u8D39\u7684\u3002',
            electronicFundsStandardDetails:
                '\u4ECE\u60A8\u7684Expensify Wallet\u8F6C\u8D26\u6CA1\u6709\u4EFB\u4F55\u8D39\u7528' +
                '\u4F7F\u7528\u6807\u51C6\u9009\u9879\u5C06\u94B1\u8F6C\u5230\u60A8\u7684\u94F6\u884C\u8D26\u6237\u3002\u8FD9\u79CD\u8F6C\u8D26\u901A\u5E38\u57281-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5B8C\u6210\u3002' +
                '\u5929\u3002',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                '\u60A8\u4ECEExpensify Wallet\u8F6C\u8D26\u9700\u8981\u652F\u4ED8\u4E00\u5B9A\u7684\u8D39\u7528' +
                '\u4F7F\u7528\u5373\u65F6\u8F6C\u8D26\u9009\u9879\u4F7F\u7528\u60A8\u7684\u8054\u540D\u501F\u8BB0\u5361\u3002\u8FD9\u79CD\u8F6C\u8D26\u901A\u5E38\u5728${count}\u5185\u5B8C\u6210\u3002' +
                `\u51E0\u5206\u949F\u3002\u8D39\u7528\u4E3A\u8F6C\u8D26\u91D1\u989D\u7684${percentage}%\uFF08\u6700\u4F4E\u8D39\u7528\u4E3A${amount}\uFF09\u3002`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                '\u60A8\u7684\u8D44\u91D1\u6709\u8D44\u683C\u83B7\u5F97FDIC\u4FDD\u9669\u3002\u60A8\u7684\u8D44\u91D1\u5C06\u88AB\u5B58\u653E\u5728\u6216\u8005' +
                `\u8F6C\u79FB\u5230${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}\uFF0C\u8FD9\u662F\u4E00\u4E2AFDIC\u4FDD\u9669\u7684\u673A\u6784\u3002\u4E00\u65E6\u5230\u8FBE\u90A3\u91CC\uFF0C\u60A8\u7684\u8D44\u91D1\u5C06\u5F97\u5230\u4FDD\u9669\u3002` +
                `\u5728${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}\u5931\u8D25\u7684\u60C5\u51B5\u4E0B\uFF0C\u7531FDIC\u4FDD\u8BC1\u81F3${amount}\u3002\u8BF7\u53C2\u9605`,
            fdicInsuranceBancorp2: '\u6709\u5173\u8BE6\u7EC6\u4FE1\u606F\u3002',
            contactExpensifyPayments: `\u901A\u8FC7\u62E8\u6253+1 833-400-0904\u6216\u901A\u8FC7\u7535\u5B50\u90AE\u4EF6\u8054\u7CFB${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}`,
            contactExpensifyPayments2: '\u6216\u5728\u6B64\u767B\u5165',
            generalInformation: '\u6709\u5173\u9884\u4ED8\u8D26\u6237\u7684\u4E00\u822C\u4FE1\u606F\uFF0C\u8BF7\u8BBF\u95EE',
            generalInformation2:
                '\u5982\u679C\u60A8\u5BF9\u9884\u4ED8\u8D26\u6237\u6709\u4EFB\u4F55\u6295\u8BC9\uFF0C\u8BF7\u62E8\u6253\u6D88\u8D39\u8005\u91D1\u878D\u4FDD\u62A4\u5C40\u7684\u7535\u8BDD1-855-411-2372\u6216\u8005\u8BBF\u95EE',
            printerFriendlyView: '\u67E5\u770B\u6253\u5370\u53CB\u597D\u7248\u672C',
            automated: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            liveAgent: '\u5B9E\u65F6\u4EE3\u7406',
            instant: '\u5373\u65F6',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `\u6700\u5C0F ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '\u542F\u7528\u652F\u4ED8',
        activatedTitle: '\u94B1\u5305\u5DF2\u6FC0\u6D3B\uFF01',
        activatedMessage: '\u606D\u559C\uFF0C\u60A8\u7684\u94B1\u5305\u5DF2\u8BBE\u7F6E\u5B8C\u6BD5\u5E76\u51C6\u5907\u597D\u8FDB\u884C\u652F\u4ED8\u3002',
        checkBackLaterTitle:
            "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        checkBackLaterMessage: '\u6211\u4EEC\u4ECD\u5728\u5BA1\u67E5\u60A8\u7684\u4FE1\u606F\u3002\u8BF7\u7A0D\u540E\u518D\u67E5\u770B\u3002',
        continueToPayment: '\u7EE7\u7EED\u4ED8\u6B3E',
        continueToTransfer: '\u7EE7\u7EED\u8F6C\u79FB',
    },
    companyStep: {
        headerTitle: '\u516C\u53F8\u4FE1\u606F',
        subtitle: '\u5DEE\u4E0D\u591A\u5B8C\u6210\u4E86\uFF01\u51FA\u4E8E\u5B89\u5168\u8003\u8651\uFF0C\u6211\u4EEC\u9700\u8981\u786E\u8BA4\u4E00\u4E9B\u4FE1\u606F\uFF1A',
        legalBusinessName: '\u6CD5\u5B9A\u5546\u4E1A\u540D\u79F0',
        companyWebsite: '\u516C\u53F8\u7F51\u7AD9',
        taxIDNumber: '\u7A0E\u52A1\u8BC6\u522B\u53F7',
        taxIDNumberPlaceholder: '9\u4F4D\u6570\u5B57',
        companyType: '\u516C\u53F8\u7C7B\u578B',
        incorporationDate: '\u6210\u7ACB\u65E5\u671F',
        incorporationState: '\u6CE8\u518C\u72B6\u6001',
        industryClassificationCode: '\u884C\u4E1A\u5206\u7C7B\u4EE3\u7801',
        confirmCompanyIsNot: '\u6211\u786E\u8BA4\u8FD9\u5BB6\u516C\u53F8\u4E0D\u5728${username}\u4E0A',
        listOfRestrictedBusinesses: '\u9650\u5236\u4E1A\u52A1\u5217\u8868',
        incorporationDatePlaceholder: '\u5F00\u59CB\u65E5\u671F (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: '\u6709\u9650\u8D23\u4EFB\u516C\u53F8',
            CORPORATION:
                "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            PARTNERSHIP: '\u5408\u4F5C\u4F19\u4F34\u5173\u7CFB',
            COOPERATIVE: '\u5408\u4F5C\u793E',
            SOLE_PROPRIETORSHIP: '\u72EC\u8D44\u4F01\u4E1A',
            OTHER: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u60A8\u9700\u8981\u5C06\u6587\u672C\u4ECE\u54EA\u79CD\u8BED\u8A00\u7FFB\u8BD1\u6210\u4E2D\u6587\uFF1F\u53E6\u5916\uFF0C\u60A8\u9700\u8981\u7FFB\u8BD1\u7684\u5177\u4F53\u6587\u672C\u662F\u4EC0\u4E48\uFF1F\u8BF7\u63D0\u4F9B\u66F4\u591A\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u4EE5\u4FBF\u6211\u80FD\u66F4\u597D\u5730\u5E2E\u52A9\u60A8\u3002',
        },
    },
    requestorStep: {
        headerTitle: '\u4E2A\u4EBA\u4FE1\u606F',
        learnMore: '\u4E86\u89E3\u66F4\u591A',
        isMyDataSafe: '\u6211\u7684\u6570\u636E\u5B89\u5168\u5417\uFF1F',
    },
    personalInfoStep: {
        personalInfo: '\u4E2A\u4EBA\u4FE1\u606F',
        enterYourLegalFirstAndLast: '\u4F60\u7684\u6CD5\u5B9A\u540D\u5B57\u662F\u4EC0\u4E48\uFF1F',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        enterYourDateOfBirth: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        enterTheLast4: '\u60A8\u7684\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        dontWorry: '\u522B\u62C5\u5FC3\uFF0C\u6211\u4EEC\u4E0D\u4F1A\u8FDB\u884C\u4EFB\u4F55\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        last4SSN: 'SSN\u7684\u6700\u540E\u56DB\u4F4D',
        enterYourAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        address: '\u5730\u5740',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u5207\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
        byAddingThisBankAccount: '\u901A\u8FC7\u6DFB\u52A0\u6B64\u94F6\u884C\u8D26\u6237\uFF0C\u60A8\u786E\u8BA4\u60A8\u5DF2\u9605\u8BFB\uFF0C\u7406\u89E3\u5E76\u63A5\u53D7',
        whatsYourLegalName: '\u4F60\u7684\u6CD5\u5B9A\u540D\u5B57\u662F\u4EC0\u4E48\uFF1F',
        whatsYourDOB: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        whatsYourAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        whatsYourSSN: '\u60A8\u7684\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        noPersonalChecks: '\u522B\u62C5\u5FC3\uFF0C\u8FD9\u91CC\u4E0D\u8FDB\u884C\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        whatsYourPhoneNumber: '\u4F60\u7684\u7535\u8BDD\u53F7\u7801\u662F\u4EC0\u4E48\uFF1F',
        weNeedThisToVerify: '\u6211\u4EEC\u9700\u8981\u8FD9\u4E2A\u6765\u9A8C\u8BC1\u60A8\u7684\u94B1\u5305\u3002',
    },
    businessInfoStep: {
        businessInfo: '\u516C\u53F8\u4FE1\u606F',
        enterTheNameOfYourBusiness: '\u4F60\u7684\u516C\u53F8\u53EB\u4EC0\u4E48\u540D\u5B57\uFF1F',
        businessName: '\u6CD5\u5B9A\u516C\u53F8\u540D\u79F0',
        enterYourCompanysTaxIdNumber: '\u4F60\u7684\u516C\u53F8\u7684\u7A0E\u52A1\u8BC6\u522B\u53F7\u662F\u4EC0\u4E48\uFF1F',
        taxIDNumber: '\u7A0E\u52A1\u8BC6\u522B\u53F7',
        taxIDNumberPlaceholder: '9\u4F4D\u6570\u5B57',
        enterYourCompanysWebsite: '\u4F60\u7684\u516C\u53F8\u7F51\u7AD9\u662F\u4EC0\u4E48\uFF1F',
        companyWebsite: '\u516C\u53F8\u7F51\u7AD9',
        enterYourCompanysPhoneNumber: '\u4F60\u7684\u516C\u53F8\u7684\u7535\u8BDD\u53F7\u7801\u662F\u591A\u5C11\uFF1F',
        enterYourCompanysAddress: '\u4F60\u7684\u516C\u53F8\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        selectYourCompanysType: '\u9019\u662F\u4EC0\u9EBC\u985E\u578B\u7684\u516C\u53F8\uFF1F',
        companyType: '\u516C\u53F8\u7C7B\u578B',
        incorporationType: {
            LLC: '\u6709\u9650\u8D23\u4EFB\u516C\u53F8',
            CORPORATION:
                "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            PARTNERSHIP: '\u5408\u4F5C\u4F19\u4F34\u5173\u7CFB',
            COOPERATIVE: '\u5408\u4F5C\u793E',
            SOLE_PROPRIETORSHIP: '\u72EC\u8D44\u4F01\u4E1A',
            OTHER: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u60A8\u9700\u8981\u5C06\u6587\u672C\u4ECE\u54EA\u79CD\u8BED\u8A00\u7FFB\u8BD1\u6210\u4E2D\u6587\uFF1F\u53E6\u5916\uFF0C\u60A8\u9700\u8981\u7FFB\u8BD1\u7684\u5177\u4F53\u6587\u672C\u662F\u4EC0\u4E48\uFF1F\u8BF7\u63D0\u4F9B\u66F4\u591A\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u4EE5\u4FBF\u6211\u80FD\u66F4\u597D\u5730\u5E2E\u52A9\u60A8\u3002',
        },
        selectYourCompanysIncorporationDate: '\u4F60\u7684\u516C\u53F8\u4F55\u65F6\u6210\u7ACB\uFF1F',
        incorporationDate: '\u6210\u7ACB\u65E5\u671F',
        incorporationDatePlaceholder: '\u5F00\u59CB\u65E5\u671F (yyyy-mm-dd)',
        incorporationState: '\u6CE8\u518C\u72B6\u6001',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '\u60A8\u7684\u516C\u53F8\u662F\u5728\u54EA\u4E2A\u5DDE\u6CE8\u518C\u7684\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u5207\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
        companyAddress: '\u516C\u53F8\u5730\u5740',
        listOfRestrictedBusinesses: '\u9650\u5236\u4E1A\u52A1\u5217\u8868',
        confirmCompanyIsNot: '\u6211\u786E\u8BA4\u8FD9\u5BB6\u516C\u53F8\u4E0D\u5728${username}\u4E0A',
        businessInfoTitle: '\u5546\u4E1A\u4FE1\u606F',
        legalBusinessName: '\u6CD5\u5B9A\u5546\u4E1A\u540D\u79F0',
        whatsTheBusinessName: '\u4EC0\u4E48\u662F\u5546\u4E1A\u540D\u79F0\uFF1F',
        whatsTheBusinessAddress: '\u8FD9\u662F\u4EC0\u4E48\u5546\u4E1A\u5730\u5740\uFF1F',
        whatsTheBusinessContactInformation: '\u8FD9\u662F\u4EC0\u4E48\u5546\u4E1A\u8054\u7CFB\u4FE1\u606F\uFF1F',
        whatsTheBusinessRegistrationNumber: '\u4EC0\u4E48\u662F\u5546\u4E1A\u6CE8\u518C\u53F7\u7801\uFF1F',
        whatsTheBusinessTaxIDEIN: '\u4EC0\u4E48\u662F\u5546\u4E1A\u7A0E\u52A1ID/EIN/VAT/GST\u6CE8\u518C\u53F7\u7801\uFF1F',
        whatsThisNumber: '\u8FD9\u662F\u4EC0\u4E48\u6570\u5B57\uFF1F',
        whereWasTheBusinessIncorporated: '\u9019\u500B\u696D\u52D9\u5728\u54EA\u88E1\u8A3B\u518A\u6210\u7ACB\u7684\uFF1F',
        whatTypeOfBusinessIsIt: '\u8FD9\u662F\u4EC0\u4E48\u7C7B\u578B\u7684\u4E1A\u52A1\uFF1F',
        whatsTheBusinessAnnualPayment: '\u9019\u5BB6\u516C\u53F8\u7684\u5E74\u5EA6\u652F\u4ED8\u91CF\u662F\u591A\u5C11\uFF1F',
        whatsYourExpectedAverageReimbursements: '\u60A8\u9884\u671F\u7684\u5E73\u5747\u62A5\u9500\u91D1\u989D\u662F\u591A\u5C11\uFF1F',
        registrationNumber: '\u6CE8\u518C\u53F7\u7801',
        taxIDEIN: '\u7A0E\u52A1\u8BC6\u522B\u53F7/\u96C7\u4E3B\u8BC6\u522B\u53F7',
        businessAddress: '\u5546\u4E1A\u5730\u5740',
        businessType: '\u5546\u696D\u985E\u578B',
        incorporation: '\u7D44\u6210',
        incorporationCountry: '\u6CE8\u518C\u56FD\u5BB6',
        incorporationTypeName: '\u516C\u53F8\u7C7B\u578B',
        businessCategory: '\u5546\u4E1A\u7C7B\u522B',
        annualPaymentVolume: '\u5E74\u5EA6\u652F\u4ED8\u91CF',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '\u5E73\u5747\u62A5\u9500\u91D1\u989D',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `\u5E73\u5747\u62A5\u9500\u91D1\u989D\u4E3A ${currencyCode}`,
        selectIncorporationType: '\u9009\u62E9\u516C\u53F8\u7C7B\u578B',
        selectBusinessCategory: '\u9009\u62E9\u4E1A\u52A1\u7C7B\u522B',
        selectAnnualPaymentVolume: '\u9009\u62E9\u5E74\u5EA6\u652F\u4ED8\u91CF',
        selectIncorporationCountry: '\u9009\u62E9\u6CE8\u518C\u56FD\u5BB6',
        selectIncorporationState: '\u9009\u62E9\u6CE8\u518C\u5DDE',
        selectAverageReimbursement: '\u9009\u62E9\u5E73\u5747\u62A5\u9500\u91D1\u989D',
        findIncorporationType: '\u627E\u5230\u516C\u53F8\u7C7B\u578B',
        findBusinessCategory: '\u67E5\u627E\u5546\u4E1A\u7C7B\u522B',
        findAnnualPaymentVolume: '\u67E5\u627E\u5E74\u5EA6\u652F\u4ED8\u91CF',
        findIncorporationState: '\u627E\u5230\u6CE8\u518C\u72B6\u6001',
        findAverageReimbursement: '\u627E\u5230\u5E73\u5747\u62A5\u9500\u91D1\u989D',
        error: {
            registrationNumber: '\u8BF7\u63D0\u4F9B\u6709\u6548\u7684\u6CE8\u518C\u53F7\u7801\u3002',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: '\u60A8\u662F\u5426\u62E5\u670925%\u6216\u66F4\u591A\u7684',
        doAnyIndividualOwn25percent: '\u6709\u4EFB\u4F55\u4E2A\u4EBA\u62E5\u670925%\u6216\u66F4\u591A\u7684\u5417\uFF1F',
        areThereMoreIndividualsWhoOwn25percent: '\u8FD9\u662F\u5426\u6709\u66F4\u591A\u7684\u4E2A\u4EBA\u62E5\u670925%\u6216\u66F4\u591A\u7684',
        regulationRequiresUsToVerifyTheIdentity:
            '\u6CD5\u89C4\u8981\u6C42\u6211\u4EEC\u9A8C\u8BC1\u4EFB\u4F55\u62E5\u6709\u8D85\u8FC725%\u4E1A\u52A1\u6240\u6709\u6743\u7684\u4E2A\u4EBA\u7684\u8EAB\u4EFD\u3002',
        companyOwner: '\u4E1A\u4E3B',
        enterLegalFirstAndLastName: '\u8FD9\u662F\u6240\u6709\u8005\u7684\u6CD5\u5B9A\u540D\u79F0\u5417\uFF1F',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        enterTheDateOfBirthOfTheOwner: '\u8FD9\u662F\u6240\u6709\u8005\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        enterTheLast4: '\u6240\u6709\u8005\u7684\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u662F\u4EC0\u4E48\uFF1F',
        last4SSN: 'SSN\u7684\u6700\u540E\u56DB\u4F4D',
        dontWorry: '\u522B\u62C5\u5FC3\uFF0C\u6211\u4EEC\u4E0D\u4F1A\u8FDB\u884C\u4EFB\u4F55\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        enterTheOwnersAddress: '\u4E1A\u4E3B\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u4E0B\u6240\u6709\u7684\u4E1C\u897F\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        address: '\u5730\u5740',
        byAddingThisBankAccount: '\u901A\u8FC7\u6DFB\u52A0\u6B64\u94F6\u884C\u8D26\u6237\uFF0C\u60A8\u786E\u8BA4\u60A8\u5DF2\u9605\u8BFB\uFF0C\u7406\u89E3\u5E76\u63A5\u53D7',
        owners: '\u6240\u6709\u8005',
    },
    ownershipInfoStep: {
        ownerInfo: '\u6240\u6709\u8005\u4FE1\u606F',
        businessOwner: '\u4E1A\u4E3B',
        signerInfo: '\u7B7E\u540D\u8005\u4FE1\u606F',
        doYouOwn: ({companyName}: CompanyNameParams) => `\u60A8\u662F\u5426\u62E5\u6709${companyName}\u768425%\u6216\u66F4\u591A\u80A1\u4EFD\uFF1F`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `\u6709\u4EFB\u4F55\u4E2A\u4EBA\u62E5\u6709${companyName}\u768425%\u6216\u66F4\u591A\u80A1\u4EFD\u5417\uFF1F`,
        regulationsRequire: '\u89C4\u5B9A\u8981\u6C42\u6211\u4EEC\u9A8C\u8BC1\u4EFB\u4F55\u62E5\u6709\u8D85\u8FC725%\u4E1A\u52A1\u7684\u4E2A\u4EBA\u7684\u8EAB\u4EFD\u3002',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        whatsTheOwnersName: '\u8FD9\u662F\u6240\u6709\u8005\u7684\u6CD5\u5B9A\u540D\u79F0\u5417\uFF1F',
        whatsYourName: '\u4F60\u7684\u6CD5\u5B9A\u540D\u5B57\u662F\u4EC0\u4E48\uFF1F',
        whatPercentage: '\u4E1A\u4E3B\u62E5\u6709\u591A\u5C11\u767E\u5206\u6BD4\u7684\u4E1A\u52A1\uFF1F',
        whatsYoursPercentage: '\u60A8\u62E5\u6709\u4E1A\u52A1\u7684\u767E\u5206\u4E4B\u51E0\uFF1F',
        ownership: '\u6240\u6709\u6743',
        whatsTheOwnersDOB: '\u8FD9\u662F\u6240\u6709\u8005\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        whatsYourDOB: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        whatsTheOwnersAddress: '\u4E1A\u4E3B\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        whatsYourAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        whatAreTheLast: '\u6240\u6709\u8005\u7684\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u662F\u4EC0\u4E48\uFF1F',
        whatsYourLast: '\u60A8\u7684\u793E\u4F1A\u4FDD\u969C\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        dontWorry: '\u522B\u62C5\u5FC3\uFF0C\u6211\u4EEC\u4E0D\u4F1A\u8FDB\u884C\u4EFB\u4F55\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        last4: 'SSN\u7684\u6700\u540E\u56DB\u4F4D',
        whyDoWeAsk: '\u6211\u4EEC\u4E3A\u4EC0\u4E48\u8981\u95EE\u8FD9\u4E2A\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u4E0B\u6240\u6709\u7684\u4E1C\u897F\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        ownershipPercentage: '\u6240\u6709\u6743\u767E\u5206\u6BD4',
        areThereOther: ({companyName}: CompanyNameParams) => `\u662F\u5426\u6709\u5176\u4ED6\u4E2A\u4EBA\u62E5\u6709${companyName}\u768425%\u6216\u66F4\u591A\u7684\u80A1\u4EFD\uFF1F`,
        owners: '\u6240\u6709\u8005',
        addCertified: '\u6DFB\u52A0\u4E00\u4E2A\u8BC1\u660E\u53D7\u76CA\u6240\u6709\u8005\u7684\u5B98\u65B9\u7EC4\u7EC7\u56FE\u8868',
        regulationRequiresChart:
            '\u6839\u636E\u89C4\u5B9A\uFF0C\u6211\u4EEC\u9700\u8981\u6536\u96C6\u663E\u793A\u6BCF\u4E2A\u62E5\u6709\u4E1A\u52A125%\u6216\u66F4\u591A\u7684\u4E2A\u4EBA\u6216\u5B9E\u4F53\u7684\u6240\u6709\u6743\u56FE\u8868\u7684\u8BA4\u8BC1\u526F\u672C\u3002',
        uploadEntity: '\u4E0A\u4F20\u5B9E\u4F53\u6240\u6709\u6743\u56FE\u8868',
        noteEntity:
            '\u6CE8\u610F\uFF1A\u5BE6\u9AD4\u6240\u6709\u6B0A\u5716\u8868\u5FC5\u9808\u7531\u60A8\u7684\u6703\u8A08\u5E2B\u3001\u6CD5\u5F8B\u9867\u554F\u7C3D\u7F72\uFF0C\u6216\u8005\u9032\u884C\u516C\u8B49\u3002',
        certified: '\u8BA4\u8BC1\u5B9E\u4F53\u6240\u6709\u6743\u56FE\u8868',
        selectCountry: '\u9009\u62E9\u56FD\u5BB6',
        findCountry: '\u627E\u5230\u570B\u5BB6',
        address: '\u5730\u5740',
    },
    validationStep: {
        headerTitle: '\u9A8C\u8BC1\u94F6\u884C\u8D26\u6237',
        buttonText: '\u5B8C\u6210\u8BBE\u7F6E',
        maxAttemptsReached: '\u7531\u4E8E\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\u5BFC\u81F4\u6B64\u94F6\u884C\u8D26\u6237\u7684\u9A8C\u8BC1\u5DF2\u88AB\u7981\u7528\u3002',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '\u8BF7\u5728\u4E0B\u9762\u7684\u5B57\u6BB5\u4E2D\u8F93\u5165\u6BCF\u7B14\u4EA4\u6613\u7684\u91D1\u989D\u3002\u4F8B\u5982\uFF1A1.51\u3002',
        reviewingInfo:
            '\u8C22\u8C22\uFF01\u6211\u4EEC\u6B63\u5728\u5BA1\u67E5\u60A8\u7684\u4FE1\u606F\uFF0C\u5C06\u4F1A\u5C3D\u5FEB\u4E0E\u60A8\u8054\u7CFB\u3002\u8BF7\u67E5\u770B\u60A8\u4E0E\u793C\u5BBE\u90E8\u7684\u804A\u5929\u8BB0\u5F55\u3002',
        forNextStep: '\u4E3A\u4E86\u5B8C\u6210\u8BBE\u7F6E\u60A8\u7684\u94F6\u884C\u8D26\u6237\uFF0C\u8BF7\u8FDB\u884C\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
        letsChatCTA: '\u662F\u7684\uFF0C\u8BA9\u6211\u4EEC\u804A\u5929',
        letsChatText:
            '\u5FEB\u5B8C\u6210\u4E86\uFF01\u6211\u4EEC\u9700\u8981\u60A8\u901A\u8FC7\u804A\u5929\u6765\u9A8C\u8BC1\u6700\u540E\u4E00\u4E9B\u4FE1\u606F\u3002\u51C6\u5907\u597D\u4E86\u5417\uFF1F',
        letsChatTitle: '\u8BA9\u6211\u4EEC\u804A\u5929\u5427\uFF01',
        enable2FATitle: '\u9632\u6B62\u6B3A\u8BC8\uFF0C\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1\uFF082FA\uFF09',
        enable2FAText:
            '\u6211\u4EEC\u975E\u5E38\u91CD\u89C6\u60A8\u7684\u5B89\u5168\u3002\u8BF7\u7ACB\u5373\u8BBE\u7F6E2FA\uFF0C\u4E3A\u60A8\u7684\u8D26\u6237\u589E\u52A0\u989D\u5916\u7684\u4FDD\u62A4\u5C42\u3002',
        secureYourAccount: '\u4FDD\u62A4\u60A8\u7684\u8D26\u6237',
    },
    beneficialOwnersStep: {
        additionalInformation:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        checkAllThatApply: '\u52FE\u9009\u6240\u6709\u9002\u7528\u7684\u9009\u9879\uFF0C\u5426\u5219\u7559\u7A7A\u3002',
        iOwnMoreThan25Percent: '\u6211\u62E5\u6709\u8D85\u8FC725%\u7684',
        someoneOwnsMoreThan25Percent: '\u6709\u5176\u4ED6\u4EBA\u62E5\u6709\u8D85\u8FC725%\u7684',
        additionalOwner: '\u989D\u5916\u7684\u53D7\u76CA\u6240\u6709\u8005',
        removeOwner: '\u5220\u9664\u6B64\u53D7\u76CA\u6240\u6709\u4EBA',
        addAnotherIndividual: '\u6DFB\u52A0\u53E6\u4E00\u4F4D\u62E5\u6709\u8D85\u8FC725%\u7684\u4E2A\u4EBA',
        agreement: '\u534F\u8BAE\uFF1A',
        termsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
        certifyTrueAndAccurate: '\u6211\u8BC1\u660E\u6240\u63D0\u4F9B\u7684\u4FE1\u606F\u662F\u771F\u5B9E\u548C\u51C6\u786E\u7684',
        error: {
            certify: '\u5FC5\u987B\u8BC1\u660E\u4FE1\u606F\u662F\u771F\u5B9E\u548C\u51C6\u786E\u7684\u3002',
        },
    },
    completeVerificationStep: {
        completeVerification: '\u5B8C\u6210\u9A8C\u8BC1',
        confirmAgreements: '\u8BF7\u786E\u8BA4\u4EE5\u4E0B\u534F\u8BAE\u3002',
        certifyTrueAndAccurate: '\u6211\u8BC1\u660E\u6240\u63D0\u4F9B\u7684\u4FE1\u606F\u662F\u771F\u5B9E\u548C\u51C6\u786E\u7684',
        certifyTrueAndAccurateError: '\u8BF7\u786E\u8BA4\u8BE5\u4FE1\u606F\u662F\u771F\u5B9E\u548C\u51C6\u786E\u7684',
        isAuthorizedToUseBankAccount: '\u6211\u6709\u6743\u4F7F\u7528\u8FD9\u4E2A\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u8FDB\u884C\u5546\u4E1A\u652F\u51FA',
        isAuthorizedToUseBankAccountError: '\u60A8\u5FC5\u987B\u662F\u5177\u6709\u64CD\u4F5C\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u6388\u6743\u7684\u63A7\u5236\u5B98\u5458\u3002',
        termsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
    },
    connectBankAccountStep: {
        connectBankAccount: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
        finishButtonText: '\u5B8C\u6210\u8BBE\u7F6E',
        validateYourBankAccount: '\u9A8C\u8BC1\u60A8\u7684\u94F6\u884C\u8D26\u6237',
        validateButtonText: '\u9A8C\u8BC1',
        validationInputLabel: '\u4EA4\u6613',
        maxAttemptsReached: '\u7531\u4E8E\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\u5BFC\u81F4\u6B64\u94F6\u884C\u8D26\u6237\u7684\u9A8C\u8BC1\u5DF2\u88AB\u7981\u7528\u3002',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '\u8BF7\u5728\u4E0B\u9762\u7684\u5B57\u6BB5\u4E2D\u8F93\u5165\u6BCF\u7B14\u4EA4\u6613\u7684\u91D1\u989D\u3002\u4F8B\u5982\uFF1A1.51\u3002',
        reviewingInfo:
            '\u8C22\u8C22\uFF01\u6211\u4EEC\u6B63\u5728\u5BA1\u67E5\u60A8\u7684\u4FE1\u606F\uFF0C\u5C06\u4F1A\u5C3D\u5FEB\u4E0E\u60A8\u8054\u7CFB\u3002\u8BF7\u67E5\u770B\u60A8\u4E0E\u793C\u5BBE\u7684\u804A\u5929\u8BB0\u5F55\u3002',
        forNextSteps: '\u4E3A\u4E86\u5B8C\u6210\u8BBE\u7F6E\u60A8\u7684\u94F6\u884C\u8D26\u6237\uFF0C\u8BF7\u8FDB\u884C\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
        letsChatCTA: '\u662F\u7684\uFF0C\u8BA9\u6211\u4EEC\u804A\u5929',
        letsChatText:
            '\u5FEB\u5B8C\u6210\u4E86\uFF01\u6211\u4EEC\u9700\u8981\u60A8\u901A\u8FC7\u804A\u5929\u6765\u9A8C\u8BC1\u6700\u540E\u4E00\u4E9B\u4FE1\u606F\u3002\u51C6\u5907\u597D\u4E86\u5417\uFF1F',
        letsChatTitle: '\u8BA9\u6211\u4EEC\u804A\u5929\u5427\uFF01',
        enable2FATitle: '\u9632\u6B62\u6B3A\u8BC8\uFF0C\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1\uFF082FA\uFF09',
        enable2FAText:
            '\u6211\u4EEC\u975E\u5E38\u91CD\u89C6\u60A8\u7684\u5B89\u5168\u3002\u8BF7\u7ACB\u5373\u8BBE\u7F6E2FA\uFF0C\u4E3A\u60A8\u7684\u8D26\u6237\u589E\u52A0\u989D\u5916\u7684\u4FDD\u62A4\u5C42\u3002',
        secureYourAccount: '\u4FDD\u62A4\u60A8\u7684\u8D26\u6237',
    },
    countryStep: {
        confirmBusinessBank: '\u786E\u8BA4\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u7684\u8D27\u5E01\u548C\u56FD\u5BB6',
        confirmCurrency: '\u786E\u8BA4\u8D27\u5E01\u548C\u56FD\u5BB6',
        yourBusiness: '\u60A8\u7684\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u8D27\u5E01\u5FC5\u987B\u4E0E\u60A8\u7684\u5DE5\u4F5C\u7A7A\u95F4\u8D27\u5E01\u76F8\u5339\u914D\u3002',
        youCanChange: '\u60A8\u53EF\u4EE5\u5728\u60A8\u7684${username}\u4E2D\u66F4\u6539\u5DE5\u4F5C\u7A7A\u95F4\u8D27\u5E01',
        findCountry: '\u627E\u5230\u570B\u5BB6',
        selectCountry: '\u9009\u62E9\u56FD\u5BB6',
    },
    bankInfoStep: {
        whatAreYour: '\u60A8\u7684\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u8BE6\u60C5\u662F\u4EC0\u4E48\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u5207\u770B\u8D77\u6765\u662F\u5426\u6B63\u5E38\u3002',
        thisBankAccount: '\u6B64\u94F6\u884C\u8D26\u6237\u5C06\u7528\u4E8E\u60A8\u7684\u5DE5\u4F5C\u533A\u7684\u5546\u4E1A\u652F\u4ED8',
        accountNumber: '\u5E33\u6236\u865F\u78BC',
        bankStatement: '\u94F6\u884C\u5BF9\u8D26\u5355',
        chooseFile: '\u9009\u62E9\u6587\u4EF6',
        uploadYourLatest: '\u4E0A\u4F20\u60A8\u7684\u6700\u65B0\u58F0\u660E',
        pleaseUpload: ({lastFourDigits}: LastFourDigitsParams) =>
            `\u8BF7\u4E0A\u4F20\u60A8\u7684\u5546\u4E1A\u94F6\u884C\u8D26\u6237\uFF08\u5C3E\u53F7\u4E3A${lastFourDigits}\uFF09\u6700\u8FD1\u7684\u6708\u5EA6\u5BF9\u8D26\u5355\u3002`,
    },
    signerInfoStep: {
        signerInfo: '\u7B7E\u540D\u8005\u4FE1\u606F',
        areYouDirector: ({companyName}: CompanyNameParams) => `\u60A8\u662F${companyName}\u7684\u8463\u4E8B\u6216\u9AD8\u7EA7\u5B98\u5458\u5417\uFF1F`,
        regulationRequiresUs: '\u89C4\u5B9A\u8981\u6C42\u6211\u4EEC\u9A8C\u8BC1\u7B7E\u7F72\u4EBA\u662F\u5426\u6709\u6743\u4EE3\u8868\u4E1A\u52A1\u8FDB\u884C\u6B64\u64CD\u4F5C\u3002',
        whatsYourName: '\u4F60\u7684\u6CD5\u5B9A\u540D\u5B57\u662F\u4EC0\u4E48',
        fullName: '\u6CD5\u5B9A\u5168\u540D',
        whatsYourJobTitle: '\u4F60\u7684\u804C\u4F4D\u662F\u4EC0\u4E48\uFF1F',
        jobTitle: '\u804C\u4F4D\u540D\u79F0',
        whatsYourDOB: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        uploadID: '\u4E0A\u4F20\u8EAB\u4EFD\u8BC1\u548C\u5730\u5740\u8BC1\u660E',
        id: '\u8EAB\u4EFD\u8BC1\u4EF6\uFF08\u9A7E\u9A76\u8BC1\u6216\u62A4\u7167\uFF09',
        personalAddress: '\u4E2A\u4EBA\u5730\u5740\u8BC1\u660E\uFF08\u4F8B\u5982\uFF0C\u516C\u7528\u4E8B\u4E1A\u8D26\u5355\uFF09',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u4E0B\u6240\u6709\u7684\u4E1C\u897F\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        proofOf: '\u4E2A\u4EBA\u5730\u5740\u8BC1\u660E',
        enterOneEmail: '\u8BF7\u8F93\u5165\u8463\u4E8B\u6216\u9AD8\u7EA7\u5B98\u5458\u7684\u7535\u5B50\u90AE\u4EF6',
        regulationRequiresOneMoreDirector:
            '\u898F\u5B9A\u8981\u6C42\u9700\u8981\u4E00\u4F4D\u66F4\u9AD8\u7D1A\u7684\u8463\u4E8B\u6216\u9AD8\u7D1A\u5B98\u54E1\u4F5C\u70BA\u7C3D\u7F72\u4EBA\u3002',
        hangTight: '\u8BF7\u7A0D\u7B49...',
        enterTwoEmails: '\u8BF7\u8F93\u5165\u4E24\u4F4D\u8463\u4E8B\u6216\u9AD8\u7EA7\u5B98\u5458\u7684\u7535\u5B50\u90AE\u4EF6',
        sendReminder: '\u53D1\u9001\u63D0\u9192',
        chooseFile: '\u9009\u62E9\u6587\u4EF6',
        weAreWaiting:
            '\u6211\u4EEC\u6B63\u5728\u7B49\u5F85\u5176\u4ED6\u4EBA\u9A8C\u8BC1\u4ED6\u4EEC\u4F5C\u4E3A\u4E1A\u52A1\u7684\u8463\u4E8B\u6216\u9AD8\u7EA7\u5B98\u5458\u7684\u8EAB\u4EFD\u3002',
    },
    agreementsStep: {
        agreements: '\u534F\u8BAE',
        pleaseConfirm: '\u8BF7\u786E\u8BA4\u4EE5\u4E0B\u534F\u8BAE',
        regulationRequiresUs:
            '\u6CD5\u89C4\u8981\u6C42\u6211\u4EEC\u9A8C\u8BC1\u4EFB\u4F55\u62E5\u6709\u8D85\u8FC725%\u4E1A\u52A1\u6240\u6709\u6743\u7684\u4E2A\u4EBA\u7684\u8EAB\u4EFD\u3002',
        iAmAuthorized: '\u6211\u6709\u6743\u4F7F\u7528\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u8FDB\u884C\u5546\u4E1A\u652F\u51FA\u3002',
        iCertify: '\u6211\u8BC1\u660E\u6240\u63D0\u4F9B\u7684\u4FE1\u606F\u662F\u771F\u5B9E\u548C\u51C6\u786E\u7684\u3002',
        termsAndConditions: '\u689D\u6B3E\u548C\u689D\u4EF6\u3002',
        accept: '\u63A5\u53D7\u5E76\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
        error: {
            authorized: '\u60A8\u5FC5\u987B\u662F\u6709\u6743\u64CD\u4F5C\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u7684\u63A7\u5236\u5B98\u5458',
            certify: '\u8BF7\u786E\u8BA4\u8BE5\u4FE1\u606F\u662F\u771F\u5B9E\u548C\u51C6\u786E\u7684',
        },
    },
    finishStep: {
        connect: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
        letsFinish: '\u8BA9\u6211\u4EEC\u5728\u804A\u5929\u4E2D\u7ED3\u675F\u5427\uFF01',
        thanksFor:
            '\u611F\u8C22\u60A8\u63D0\u4F9B\u7684\u8BE6\u7EC6\u4FE1\u606F\u3002\u73B0\u5728\u4F1A\u6709\u4E00\u4F4D\u4E13\u95E8\u7684\u652F\u6301\u4EE3\u7406\u4EBA\u6765\u5BA1\u67E5\u60A8\u7684\u4FE1\u606F\u3002\u5982\u679C\u6211\u4EEC\u9700\u8981\u60A8\u63D0\u4F9B\u5176\u4ED6\u4EFB\u4F55\u4FE1\u606F\uFF0C\u6211\u4EEC\u4F1A\u56DE\u5934\u4E0E\u60A8\u8054\u7CFB\uFF0C\u4F46\u5728\u6B64\u671F\u95F4\uFF0C\u5982\u679C\u60A8\u6709\u4EFB\u4F55\u95EE\u9898\uFF0C\u8BF7\u968F\u65F6\u4E0E\u6211\u4EEC\u8054\u7CFB\u3002',
        iHaveA: '\u6211\u6709\u4E00\u4E2A\u95EE\u9898',
        enable2FA: '\u542F\u7528\u4E24\u6B65\u9A8C\u8BC1\uFF082FA\uFF09\u4EE5\u9632\u6B62\u6B3A\u8BC8',
        weTake: '\u6211\u4EEC\u975E\u5E38\u91CD\u89C6\u60A8\u7684\u5B89\u5168\u3002\u8BF7\u7ACB\u5373\u8BBE\u7F6E2FA\uFF0C\u4E3A\u60A8\u7684\u8D26\u6237\u589E\u52A0\u989D\u5916\u7684\u4FDD\u62A4\u5C42\u3002',
        secure: '\u4FDD\u62A4\u60A8\u7684\u8D26\u6237',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        explanationLine: '\u6211\u4EEC\u6B63\u5728\u67E5\u770B\u60A8\u7684\u4FE1\u606F\u3002\u60A8\u5C06\u80FD\u591F\u5F88\u5FEB\u7EE7\u7EED\u8FDB\u884C\u4E0B\u4E00\u6B65\u3002',
    },
    session: {
        offlineMessageRetry: '\u770B\u8D77\u6765\u60A8\u5DF2\u79BB\u7EBF\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u8FDE\u63A5\u5E76\u518D\u8BD5\u4E00\u6B21\u3002',
    },
    travel: {
        header: '\u9884\u8BA2\u65C5\u884C',
        title: '\u667A\u80FD\u65C5\u884C',
        subtitle:
            '\u4F7F\u7528Expensify Travel\u83B7\u53D6\u6700\u4F73\u65C5\u884C\u4F18\u60E0\uFF0C\u5E76\u5728\u4E00\u4E2A\u5730\u65B9\u7BA1\u7406\u6240\u6709\u7684\u5546\u4E1A\u5F00\u652F\u3002',
        features: {
            saveMoney: '\u5728\u60A8\u7684\u9884\u8BA2\u4E0A\u7701\u94B1',
            alerts: '\u83B7\u53D6\u5B9E\u65F6\u66F4\u65B0\u548C\u8B66\u62A5',
        },
        bookTravel: '\u9884\u8BA2\u65C5\u884C',
        bookDemo: '\u9884\u8BA2\u6F14\u793A',
        bookADemo: '\u9884\u8BA2\u6F14\u793A',
        toLearnMore: '\u8981\u4E86\u89E3\u66F4\u591A\u3002',
        termsAndConditions: {
            header: '\u5728\u6211\u4EEC\u7EE7\u7EED\u4E4B\u524D...',
            title: '\u8BF7\u9605\u8BFB\u65C5\u884C\u7684\u6761\u6B3E\u548C\u6761\u4EF6',
            subtitle: '\u8981\u5728\u60A8\u7684\u5DE5\u4F5C\u7A7A\u9593\u4E0A\u555F\u7528\u65C5\u884C\uFF0C\u60A8\u5FC5\u9808\u540C\u610F\u6211\u5011\u7684',
            termsconditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
            travelTermsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
            helpDocIntro: '\u8BF7\u67E5\u770B\u8FD9\u4E2A',
            helpDocOutro: '\u5982\u9700\u66F4\u591A\u4FE1\u606F\uFF0C\u6216\u8054\u7CFB\u793C\u5BBE\u670D\u52A1\u6216\u60A8\u7684\u8D26\u6237\u7ECF\u7406\u3002',
            helpDoc: '\u5E2E\u52A9\u6587\u6863',
            agree: '\u6211\u540C\u610F\u65C5\u884C',
            error: '\u60A8\u5FC5\u987B\u63A5\u53D7\u65C5\u884C\u7684\u6761\u6B3E\u548C\u6761\u4EF6\u624D\u80FD\u7EE7\u7EED',
        },
        flight: '\u98DE\u884C',
        flightDetails: {
            passenger: '\u4E58\u5BA2',
            layover: ({layover}: FlightLayoverParams) =>
                `<muted-text-label>\u60A8\u5728\u6B64\u822A\u73ED\u524D\u6709\u4E00\u4E2A<strong>${layover} \u4E2D\u8F6C</strong></muted-text-label>`,
            takeOff: '\u8D77\u98DE',
            landing: '\u7740\u9646',
            seat: '\u5EA7\u4F4D',
            class: '\u8259\u7B49',
            recordLocator: '\u8BB0\u5F55\u5B9A\u4F4D\u5668',
        },
        hotel: '\u9152\u5E97',
        hotelDetails: {
            guest: '\u5BA2\u4EBA',
            checkIn: '\u767B\u8BB0',
            checkOut: '\u7ED3\u8D26',
            roomType: '\u623F\u95F4\u7C7B\u578B',
            cancellation: '\u53D6\u6D88\u653F\u7B56',
            cancellationUntil: '\u76F4\u5230\u514D\u8D39\u53D6\u6D88',
            confirmation: '\u786E\u8BA4\u53F7\u7801',
            cancellationPolicies: {
                unknown: "Sorry, but I can't assist with that.",
                nonRefundable: '\u4E0D\u53EF\u9000\u6B3E',
                freeCancellationUntil: '\u76F4\u5230\u514D\u8D39\u53D6\u6D88',
                partiallyRefundable: '\u90E8\u5206\u53EF\u9000\u6B3E',
            },
        },
        car: '\u6C7D\u8F66',
        carDetails: {
            rentalCar: '\u79DF\u8F66',
            pickUp: '\u53D6\u4EF6',
            dropOff: '\u653E\u4E0B',
            driver: '\u9A71\u52A8\u5668',
            carType: '\u6C7D\u8F66\u7C7B\u578B',
            cancellation: '\u53D6\u6D88\u653F\u7B56',
            cancellationUntil: '\u76F4\u5230\u514D\u8D39\u53D6\u6D88',
            freeCancellation: '\u514D\u8D39\u53D6\u6D88',
            confirmation: '\u786E\u8BA4\u53F7\u7801',
        },
        train: '\u8F68\u9053',
        trainDetails: {
            passenger: '\u4E58\u5BA2',
            departs: '\u79BB\u5F00',
            arrives: '\u5230\u8FBE',
            coachNumber: '\u6559\u7EC3\u7F16\u53F7',
            seat: '\u5EA7\u4F4D',
            fareDetails: '\u7968\u4EF7\u8BE6\u60C5',
            confirmation: '\u786E\u8BA4\u53F7\u7801',
        },
        viewTrip: '\u67E5\u770B\u884C\u7A0B',
        modifyTrip: '\u4FEE\u6539\u884C\u7A0B',
        tripSupport: '\u65C5\u884C\u652F\u6301',
        tripDetails: '\u65C5\u884C\u8BE6\u60C5',
        viewTripDetails: '\u67E5\u770B\u65C5\u884C\u8BE6\u60C5',
        trip: '\u65C5\u884C',
        trips: '\u65C5\u884C',
        tripSummary: '\u65C5\u884C\u6458\u8981',
        departs: '\u79BB\u5F00',
        errorMessage: '\u53D1\u751F\u4E86\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        phoneError: '\u8981\u9884\u8BA2\u65C5\u884C\uFF0C\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u5FC5\u987B\u662F\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6',
        domainSelector: {
            title: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            subtitle: '\u9009\u62E9\u4E00\u4E2A\u7528\u4E8EExpensify Travel\u8BBE\u7F6E\u7684\u57DF\u3002',
            recommended: '\u63A8\u8350',
        },
        domainPermissionInfo: {
            title: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            restrictionPrefix: `You don't have permission to enable Expensify Travel for the domain`,
            restrictionSuffix: `You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitationPrefix: `If you're an accountant, consider joining the`,
            accountantInvitationLink: `ExpensifyApproved! accountants program`,
            accountantInvitationSuffix: `to enable travel for this domain.`,
        },
        publicDomainError: {
            title: '\u5F00\u59CB\u4F7F\u7528Expensify Travel',
            message: `You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
    },
    workspace: {
        common: {
            card: '\u5361\u7247',
            expensifyCard: 'Expensify\u5361',
            companyCards: '\u516C\u53F8\u5361\u7247',
            workflows: '\u5DE5\u4F5C\u6D41\u7A0B',
            workspace: '\u5DE5\u4F5C\u5340',
            edit: '\u7F16\u8F91\u5DE5\u4F5C\u533A',
            enabled: '\u5DF2\u542F\u7528',
            disabled: '\u7981\u7528',
            everyone: '\u6BCF\u4E2A\u4EBA',
            delete: '\u5220\u9664\u5DE5\u4F5C\u533A',
            settings: '\u8BBE\u7F6E',
            reimburse: '\u62A5\u9500',
            categories: '\u5206\u7C7B',
            tags: '\u6807\u7B7E',
            reportFields: '\u62A5\u544A\u5B57\u6BB5',
            reportField: '\u62A5\u544A\u5B57\u6BB5',
            taxes: '\u7A0E',
            bills: '\u8D26\u5355',
            invoices: '\u53D1\u7968',
            travel: '\u65C5\u884C',
            members: '\u6210\u5458',
            accounting: '\u6703\u8A08',
            rules: '\u898F\u5247',
            displayedAs: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            plan: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            profile: '\u6982\u8FF0',
            bankAccount: '\u94F6\u884C\u8D26\u6237',
            connectBankAccount: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
            testTransactions: '\u6D4B\u8BD5\u4EA4\u6613',
            issueAndManageCards: '\u53D1\u884C\u548C\u7BA1\u7406\u5361\u7247',
            reconcileCards: '\u5BF9\u8D26\u5361',
            selected: () => ({
                one: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u6301\u5360\u4F4D\u7B26\u5982${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u7684\u5185\u5BB9\u4E0D\u53D8\u6216\u4E0D\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
                other: (count: number) => `\u5DF2\u9078\u64C7 ${count}`,
            }),
            settlementFrequency: '\u7ED3\u7B97\u9891\u7387',
            setAsDefault: '\u8BBE\u7F6E\u4E3A\u9ED8\u8BA4\u5DE5\u4F5C\u533A',
            defaultNote: `\u53D1\u9001\u81F3${CONST.EMAIL.RECEIPTS}\u7684\u6536\u636E\u5C06\u4F1A\u51FA\u73B0\u5728\u8FD9\u4E2A\u5DE5\u4F5C\u533A\u3002`,
            deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u5DE5\u4F5C\u533A\u5417\uFF1F',
            deleteWithCardsConfirmation:
                '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5DE5\u4F5C\u533A\u5417\uFF1F\u8FD9\u5C06\u5220\u9664\u6240\u6709\u5361\u7247\u6E90\u548C\u5DF2\u5206\u914D\u7684\u5361\u7247\u3002',
            unavailable: '\u65E0\u6CD5\u4F7F\u7528\u7684\u5DE5\u4F5C\u7A7A\u95F4',
            memberNotFound:
                '\u627E\u4E0D\u5230\u6210\u5458\u3002\u8981\u9080\u8BF7\u65B0\u6210\u5458\u52A0\u5165\u5DE5\u4F5C\u533A\uFF0C\u8BF7\u4F7F\u7528\u4E0A\u65B9\u7684\u9080\u8BF7\u6309\u94AE\u3002',
            notAuthorized: `\u60A8\u65E0\u6CD5\u8BBF\u95EE\u6B64\u9875\u9762\u3002\u5982\u679C\u60A8\u6B63\u5728\u5C1D\u8BD5\u52A0\u5165\u6B64\u5DE5\u4F5C\u533A\uFF0C\u53EA\u9700\u5411\u5DE5\u4F5C\u533A\u6240\u6709\u8005\u8BF7\u6C42\u5C06\u60A8\u6DFB\u52A0\u4E3A\u6210\u5458\u3002\u6709\u5176\u4ED6\u95EE\u9898\u5417\uFF1F\u8BF7\u8054\u7CFB${CONST.EMAIL.CONCIERGE}\u3002`,
            goToRoom: ({roomName}: GoToRoomParams) => `\u53BB${roomName}\u623F\u95F4`,
            goToWorkspace: '\u524D\u5F80\u5DE5\u4F5C\u5340',
            goToWorkspaces: '\u53BB\u5DE5\u4F5C\u7A7A\u95F4',
            clearFilter: '\u6E05\u9664\u8FC7\u6EE4\u5668',
            workspaceName: '\u5DE5\u4F5C\u5340\u540D\u7A31',
            workspaceOwner: '\u6240\u6709\u8005',
            workspaceType: '\u5DE5\u4F5C\u7A7A\u9593\u985E\u578B',
            workspaceAvatar: '\u5DE5\u4F5C\u7A7A\u9593\u982D\u50CF',
            mustBeOnlineToViewMembers: '\u60A8\u9700\u8981\u5728\u7EBF\u624D\u80FD\u67E5\u770B\u6B64\u5DE5\u4F5C\u533A\u7684\u6210\u5458\u3002',
            moreFeatures: '\u66F4\u591A\u529F\u80FD',
            requested: 'text was not provided. Please provide the text you want to translate.',
            distanceRates: '\u8DDD\u79BB\u8D39\u7387',
            defaultDescription: '\u5B58\u653E\u60A8\u6240\u6709\u6536\u64DA\u548C\u652F\u51FA\u7684\u5730\u65B9\u3002',
            welcomeNote: '\u8BF7\u4F7F\u7528Expensify\u63D0\u4EA4\u60A8\u7684\u6536\u636E\u4EE5\u4FBF\u62A5\u9500\uFF0C\u8C22\u8C22\uFF01',
            subscription: '\u8A02\u95B1',
            markAsExported: '\u5C06\u5176\u6807\u8BB0\u4E3A\u624B\u52A8\u8F93\u5165',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `\u5BFC\u51FA\u5230${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u5207\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
            lineItemLevel: '\u884C\u9805\u7D1A\u5225',
            reportLevel: '\u62A5\u544A\u7EA7\u522B',
            topLevel: '\u9876\u7EA7',
            appliedOnExport: '\u672A\u5BFC\u5165\u81F3Expensify\uFF0C\u5E94\u7528\u4E8E\u5BFC\u51FA',
            shareNote: {
                header: '\u4E0E\u5176\u4ED6\u6210\u5458\u5171\u4EAB\u60A8\u7684\u5DE5\u4F5C\u7A7A\u95F4',
                content: {
                    firstPart:
                        '\u5206\u4EAB\u6B64\u4E8C\u7EF4\u7801\u6216\u590D\u5236\u4E0B\u9762\u7684\u94FE\u63A5\uFF0C\u4EE5\u4FBF\u6210\u5458\u8F7B\u677E\u8BF7\u6C42\u8BBF\u95EE\u60A8\u7684\u5DE5\u4F5C\u7A7A\u95F4\u3002\u6240\u6709\u52A0\u5165\u5DE5\u4F5C\u7A7A\u95F4\u7684\u8BF7\u6C42\u90FD\u4F1A\u663E\u793A\u5728',
                    secondPart: '\u4E3A\u60A8\u5BA1\u67E5\u7684\u7A7A\u95F4\u3002',
                },
            },
            createNewConnection: '\u521B\u5EFA\u65B0\u7684\u8FDE\u63A5',
            reuseExistingConnection: '\u91CD\u7528\u73B0\u6709\u8FDE\u63A5',
            existingConnections: '\u73B0\u6709\u8FDE\u63A5',
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Last synced ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) =>
                `\u7531\u4E8E\u8EAB\u4EFD\u9A8C\u8BC1\u9519\u8BEF\uFF0C\u65E0\u6CD5\u8FDE\u63A5\u5230${connectionName}\u3002`,
            learnMore: '\u4E86\u89E3\u66F4\u591A\u3002',
            memberAlternateText: '\u4F1A\u5458\u53EF\u4EE5\u63D0\u4EA4\u5E76\u6279\u51C6\u62A5\u544A\u3002',
            adminAlternateText: '\u7BA1\u7406\u5458\u53EF\u4EE5\u5B8C\u5168\u7F16\u8F91\u6240\u6709\u62A5\u544A\u548C\u5DE5\u4F5C\u533A\u8BBE\u7F6E\u3002',
            auditorAlternateText: '\u5BA1\u8BA1\u5458\u53EF\u4EE5\u67E5\u770B\u5E76\u8BC4\u8BBA\u62A5\u544A\u3002',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '\u7BA1\u7406\u5458';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '\u5BA1\u8BA1\u5458';
                    case CONST.POLICY.ROLE.USER:
                        return '\u6210\u5458';
                    default:
                        return '\u6210\u5458';
                }
            },
            planType: '\u8BA1\u5212\u7C7B\u578B',
            submitExpense: '\u5728\u4E0B\u65B9\u63D0\u4EA4\u60A8\u7684\u8D39\u7528\uFF1A',
            defaultCategory: '\u9ED8\u8BA4\u7C7B\u522B',
            viewTransactions: '\u67E5\u770B\u4EA4\u6613',
        },
        perDiem: {
            subtitle: '\u8BBE\u7F6E\u6BCF\u65E5\u8D39\u7528\u7387\u4EE5\u63A7\u5236\u5458\u5DE5\u7684\u65E5\u5E38\u652F\u51FA\u3002',
            amount: '\u6570\u91CF',
            deleteRates: () => ({
                one: '\u5220\u9664\u7387',
                other: '\u5220\u9664\u7387',
            }),
            deletePerDiemRate: '\u5220\u9664\u6BCF\u65E5\u8D39\u7387',
            areYouSureDelete: () => ({
                one: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D39\u7387\u5417\uFF1F',
                other: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u8D39\u7387\u5417\uFF1F',
            }),
            emptyList: {
                title: '\u6BCF\u65E5',
                subtitle:
                    '\u8BBE\u7F6E\u6BCF\u65E5\u8D39\u7387\u4EE5\u63A7\u5236\u5458\u5DE5\u7684\u65E5\u5E38\u652F\u51FA\u3002\u4ECE\u7535\u5B50\u8868\u683C\u5BFC\u5165\u8D39\u7387\u4EE5\u5F00\u59CB\u3002',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `\u5177\u6709\u503C${rate}\u7684\u7387\u5DF2\u7ECF\u5B58\u5728\u3002`,
            },
            importPerDiemRates: '\u5BFC\u5165\u6BCF\u65E5\u8D39\u7387',
            editPerDiemRate: '\u7F16\u8F91\u6BCF\u65E5\u8D39\u7387',
            editPerDiemRates: '\u7F16\u8F91\u6BCF\u65E5\u8D39\u7387',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `\u66F4\u65B0\u6B64\u76EE\u7684\u5730\u5C07\u6703\u6539\u8B8A\u6240\u6709${destination}\u7684\u6BCF\u65E5\u6D25\u8CBC\u5B50\u7387\u3002`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `\u66F4\u65B0\u6B64\u8D27\u5E01\u5C06\u4F1A\u6539\u53D8\u6240\u6709${destination}\u7684\u6BCF\u65E5\u8865\u8D34\u5B50\u7387\u3002`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '\u8BBE\u7F6E\u5982\u4F55\u5C06\u81EA\u4ED8\u8D39\u7528\u5BFC\u51FA\u5230QuickBooks Desktop\u3002',
            exportOutOfPocketExpensesCheckToogle: '\u5C06\u68C0\u67E5\u6807\u8BB0\u4E3A\u201C\u7A0D\u540E\u6253\u5370\u201D',
            exportDescription: '\u914D\u7F6E\u5982\u4F55\u5C06Expensify\u6570\u636E\u5BFC\u51FA\u5230QuickBooks Desktop\u3002',
            date: '\u5BFC\u51FA\u65E5\u671F',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u81F3',
            exportExpensifyCard: '\u5C06 Expensify Card \u4EA4\u6613\u5BFC\u51FA\u4E3A',
            account: '\u5E10\u6237',
            accountDescription: '\u9009\u62E9\u53D1\u5E03\u65E5\u5FD7\u6761\u76EE\u7684\u4F4D\u7F6E\u3002',
            accountsPayable: '\u61C9\u4ED8\u8CEC\u6B3E',
            accountsPayableDescription: '\u9009\u62E9\u521B\u5EFA\u4F9B\u5E94\u5546\u8D26\u5355\u7684\u4F4D\u7F6E\u3002',
            bankAccount: '\u94F6\u884C\u8D26\u6237',
            notConfigured: '\u672A\u914D\u7F6E',
            bankAccountDescription: '\u9009\u62E9\u4ECE\u54EA\u91CC\u53D1\u9001\u652F\u7968\u3002',
            creditCardAccount: '\u4FE1\u7528\u5361\u8D26\u6237',
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u4F7F\u7528\u6B64\u65E5\u671F\u5BFC\u51FA\u62A5\u544A\u5230QuickBooks Desktop\u3002',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u4E0A\u6B21\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u4E00\u6B21\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230QuickBooks Desktop\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u63D0\u4EA4\u62A5\u544A\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            exportCheckDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u9010\u9879\u5217\u51FA\u7684\u652F\u7968\uFF0C\u5E76\u4ECE\u4E0B\u9762\u7684\u94F6\u884C\u8D26\u6237\u53D1\u9001\u3002',
            exportJournalEntryDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u5206\u9879\u8BB0\u8D26\u6761\u76EE\uFF0C\u5E76\u5C06\u5176\u53D1\u5E03\u5230\u4E0B\u9762\u7684\u8D26\u6237\u3002',
            exportVendorBillDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u8BE6\u7EC6\u7684\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u5728\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u7684\u7B2C\u4E00\u5929\u53D1\u5E03\u3002',
            deepDiveExpensifyCard:
                'Expensify\u5361\u4EA4\u6613\u5C06\u81EA\u52A8\u5BFC\u51FA\u5230\u4E00\u4E2A\u540D\u4E3A"Expensify\u5361\u8D1F\u503A\u8D26\u6237"\u7684\u8D26\u6237\uFF0C\u8BE5\u8D26\u6237\u662F\u81EA\u52A8\u521B\u5EFA\u7684\u3002',
            deepDiveExpensifyCardIntegration: '\u6211\u4EEC\u7684\u96C6\u6210\u3002',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop \u4E0D\u652F\u6301\u65E5\u8BB0\u8D26\u5BFC\u51FA\u7684\u7A0E\u52A1\u3002\u7531\u4E8E\u60A8\u5728\u5DE5\u4F5C\u533A\u542F\u7528\u4E86\u7A0E\u52A1\uFF0C\u56E0\u6B64\u6B64\u5BFC\u51FA\u9009\u9879\u4E0D\u53EF\u7528\u3002',
            outOfPocketTaxEnabledError:
                '\u5F53\u7A0E\u52A1\u542F\u7528\u65F6\uFF0C\u65E0\u6CD5\u4F7F\u7528\u65E5\u8BB0\u8D26\u6761\u76EE\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u7684\u5BFC\u51FA\u9009\u9879\u3002',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '\u4FE1\u7528\u5361',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\u65E5\u8BB0\u6761\u76EE',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]:
                    '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u9010\u9879\u5217\u51FA\u7684\u652F\u7968\uFF0C\u5E76\u4ECE\u4E0B\u9762\u7684\u94F6\u884C\u8D26\u6237\u53D1\u9001\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "\u6211\u4EEC\u5C06\u81EA\u52A8\u5C06\u4FE1\u7528\u5361\u4EA4\u6613\u4E0A\u7684\u5546\u6237\u540D\u79F0\u4E0EQuickBooks\u4E2D\u7684\u4EFB\u4F55\u76F8\u5E94\u4F9B\u5E94\u5546\u8FDB\u884C\u5339\u914D\u3002\u5982\u679C\u4E0D\u5B58\u5728\u4F9B\u5E94\u5546\uFF0C\u6211\u4EEC\u5C06\u521B\u5EFA\u4E00\u4E2A'\u4FE1\u7528\u5361\u6742\u9879'\u4F9B\u5E94\u5546\u8FDB\u884C\u5173\u8054\u3002",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u9010\u9879\u7684\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u65E5\u671F\u4E3A\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u5728\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u7684\u7B2C1\u5929\u53D1\u5E03\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    '\u9009\u62E9\u5BFC\u51FA\u4FE1\u7528\u5361\u4EA4\u6613\u7684\u4F4D\u7F6E\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    '\u9009\u62E9\u4E00\u4E2A\u4F9B\u5E94\u5546\u6765\u5904\u7406\u6240\u6709\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '\u9009\u62E9\u4ECE\u54EA\u91CC\u53D1\u9001\u652F\u7968\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '\u7576\u4F4D\u7F6E\u555F\u7528\u6642\uFF0C\u4F9B\u61C9\u5546\u8CEC\u55AE\u4E0D\u53EF\u7528\u3002\u8ACB\u9078\u64C7\u5176\u4ED6\u7684\u5C0E\u51FA\u9078\u9805\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    '\u7576\u4F4D\u7F6E\u555F\u7528\u6642\uFF0C\u7121\u6CD5\u9032\u884C\u6AA2\u67E5\u3002\u8ACB\u9078\u64C7\u5176\u4ED6\u7684\u532F\u51FA\u9078\u9805\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '\u5F53\u7A0E\u52A1\u542F\u7528\u65F6\uFF0C\u65E0\u6CD5\u4F7F\u7528\u65E5\u8BB0\u8D26\u6761\u76EE\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u7684\u5BFC\u51FA\u9009\u9879\u3002',
            },
            noAccountsFound: '\u627E\u4E0D\u5230\u5E33\u6236',
            noAccountsFoundDescription: '\u5728QuickBooks\u684C\u9762\u7248\u4E2D\u6DFB\u52A0\u8D26\u6237\uFF0C\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            qbdSetup: 'QuickBooks Desktop\u8BBE\u7F6E',
            requiredSetupDevice: {
                title: '\u65E0\u6CD5\u4ECE\u6B64\u8BBE\u5907\u8FDE\u63A5',
                body1: '\u60A8\u9700\u8981\u4ECE\u6258\u7BA1\u60A8\u7684QuickBooks Desktop\u516C\u53F8\u6587\u4EF6\u7684\u8BA1\u7B97\u673A\u4E0A\u8BBE\u7F6E\u6B64\u8FDE\u63A5\u3002',
                body2: '\u4E00\u65E6\u60A8\u8FDE\u63A5\u4E0A\uFF0C\u60A8\u5C06\u80FD\u591F\u4ECE\u4EFB\u4F55\u5730\u65B9\u540C\u6B65\u548C\u5BFC\u51FA\u3002',
            },
            setupPage: {
                title: '\u70B9\u51FB\u6B64\u94FE\u63A5\u8FDB\u884C\u8FDE\u63A5',
                body: '\u8981\u5B8C\u6210\u8BBE\u7F6E\uFF0C\u8BF7\u5728\u8FD0\u884CQuickBooks Desktop\u7684\u8BA1\u7B97\u673A\u4E0A\u6253\u5F00\u4EE5\u4E0B\u94FE\u63A5\u3002',
                setupErrorTitle: '\u53D1\u751F\u4E86\u9519\u8BEF',
                setupErrorBody1: 'QuickBooks\u684C\u9762\u8FDE\u63A5\u76EE\u524D\u65E0\u6CD5\u4F7F\u7528\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216\u8005',
                setupErrorBody2: '\u5982\u679C\u95EE\u9898\u4ECD\u7136\u5B58\u5728\u3002',
                setupErrorBodyContactConcierge: '\u8054\u7CFB\u793C\u5BBE\u670D\u52A1',
            },
            importDescription: '\u4ECEQuickBooks Desktop\u5BFC\u5165\u5230Expensify\u7684\u7F16\u7801\u914D\u7F6E\u3002',
            classes: '\u7C7B',
            items: '\u9879\u76EE',
            customers: '\u5BA2\u6237/\u9879\u76EE',
            exportCompanyCardsDescription: '\u8BBE\u7F6E\u5982\u4F55\u5C06\u516C\u53F8\u5361\u8D2D\u4E70\u5BFC\u51FA\u5230QuickBooks Desktop\u3002',
            defaultVendorDescription:
                '\u8BBE\u7F6E\u4E00\u4E2A\u9ED8\u8BA4\u4F9B\u5E94\u5546\uFF0C\u5C06\u5E94\u7528\u4E8E\u5BFC\u51FA\u7684\u6240\u6709\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
            accountsDescription: '\u60A8\u7684QuickBooks\u684C\u9762\u7248\u8D26\u6237\u56FE\u8868\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230Expensify\u4E2D\u3002',
            accountsSwitchTitle: '\u9009\u62E9\u5C06\u65B0\u8D26\u6237\u4F5C\u4E3A\u542F\u7528\u6216\u7981\u7528\u7684\u7C7B\u522B\u8FDB\u884C\u5BFC\u5165\u3002',
            accountsSwitchDescription: '\u542F\u7528\u7684\u7C7B\u522B\u5C06\u5728\u6210\u5458\u521B\u5EFA\u8D39\u7528\u65F6\u53EF\u4F9B\u9009\u62E9\u3002',
            classesDescription: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406QuickBooks Desktop\u7C7B\u3002',
            tagsDisplayedAsDescription: '\u884C\u9879\u76EE\u7EA7\u522B',
            reportFieldsDisplayedAsDescription: '\u62A5\u544A\u7EA7\u522B',
            customersDescription: '\u5728Expensify\u4E2D\u9078\u64C7\u5982\u4F55\u8655\u7406QuickBooks Desktop\u7684\u5BA2\u6236/\u9805\u76EE\u3002',
            advancedConfig: {
                autoSyncDescription: 'Expensify \u5C06\u6BCF\u5929\u81EA\u52A8\u4E0E QuickBooks Desktop \u540C\u6B65\u3002',
                createEntities: '\u81EA\u52A8\u521B\u5EFA\u5B9E\u4F53',
                createEntitiesDescription: '\u5982\u679C\u4F9B\u5E94\u5546\u5728QuickBooks Desktop\u4E2D\u4E0D\u5B58\u5728\uFF0CExpensify\u5C06\u81EA\u52A8\u521B\u5EFA\u3002',
            },
            itemsDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Desktop\u9879\u76EE\u3002',
        },
        qbo: {
            importDescription: '\u4ECEQuickBooks Online\u5BFC\u5165\u5230Expensify\u7684\u7F16\u7801\u914D\u7F6E\u3002',
            classes: '\u7C7B',
            locations: '\u4F4D\u7F6E',
            customers: '\u5BA2\u6237/\u9879\u76EE',
            accountsDescription: '\u60A8\u7684QuickBooks\u5728\u7EBF\u8D26\u6237\u56FE\u8868\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230Expensify\u3002',
            accountsSwitchTitle: '\u9009\u62E9\u5C06\u65B0\u8D26\u6237\u4F5C\u4E3A\u542F\u7528\u6216\u7981\u7528\u7684\u7C7B\u522B\u8FDB\u884C\u5BFC\u5165\u3002',
            accountsSwitchDescription: '\u542F\u7528\u7684\u7C7B\u522B\u5C06\u5728\u6210\u5458\u521B\u5EFA\u8D39\u7528\u65F6\u53EF\u4F9B\u9009\u62E9\u3002',
            classesDescription: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406QuickBooks Online\u8BFE\u7A0B\u3002',
            customersDescription: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406QuickBooks Online\u7684\u5BA2\u6237/\u9879\u76EE\u3002',
            locationsDescription: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406QuickBooks Online\u4F4D\u7F6E\u3002',
            taxesDescription: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406QuickBooks Online\u7684\u7A0E\u52A1\u3002',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online \u4E0D\u652F\u6301\u5728\u652F\u7968\u6216\u4F9B\u5E94\u5546\u8D26\u5355\u7684\u884C\u7EA7\u522B\u4E0A\u4F7F\u7528\u4F4D\u7F6E\u3002\u5982\u679C\u60A8\u5E0C\u671B\u5728\u884C\u7EA7\u522B\u6709\u4F4D\u7F6E\uFF0C\u8BF7\u786E\u4FDD\u60A8\u6B63\u5728\u4F7F\u7528\u65E5\u8BB0\u8D26\u6761\u76EE\u548C\u4FE1\u7528/\u501F\u8BB0\u5361\u8D39\u7528\u3002',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online\u4E0D\u652F\u6301\u65E5\u8BB0\u8D26\u4E0A\u7684\u7A0E\u9879\u3002\u8BF7\u5C06\u60A8\u7684\u5BFC\u51FA\u9009\u9879\u66F4\u6539\u4E3A\u4F9B\u5E94\u5546\u8D26\u5355\u6216\u652F\u7968\u3002',
            exportDescription: '\u914D\u7F6EExpensify\u6570\u636E\u5982\u4F55\u5BFC\u51FA\u5230QuickBooks Online\u3002',
            date: '\u5BFC\u51FA\u65E5\u671F',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u81F3',
            exportExpensifyCard: '\u5C06 Expensify Card \u4EA4\u6613\u5BFC\u51FA\u4E3A',
            deepDiveExpensifyCard:
                'Expensify\u5361\u4EA4\u6613\u5C06\u81EA\u52A8\u5BFC\u51FA\u5230\u4E00\u4E2A\u540D\u4E3A"Expensify\u5361\u8D1F\u503A\u8D26\u6237"\u7684\u8D26\u6237\uFF0C\u8BE5\u8D26\u6237\u662F\u81EA\u52A8\u521B\u5EFA\u7684\u3002',
            deepDiveExpensifyCardIntegration: '\u6211\u4EEC\u7684\u96C6\u6210\u3002',
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u5C06\u6B64\u65E5\u671F\u7528\u4E8E\u5BFC\u51FA\u5230QuickBooks Online\u7684\u62A5\u544A\u3002',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u4E0A\u6B21\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u4E00\u6B21\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230QuickBooks Online\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u63D0\u4EA4\u62A5\u544A\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            receivable: '\u5E94\u6536\u8D26\u6B3E', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '\u5E94\u6536\u8D26\u6B3E\u5B58\u6863', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: '\u4F7F\u7528\u6B64\u5E10\u6237\u5BFC\u51FA\u53D1\u7968\u81F3QuickBooks Online\u3002',
            exportCompanyCardsDescription: '\u8BBE\u7F6E\u516C\u53F8\u5361\u8D2D\u4E70\u5982\u4F55\u5BFC\u51FA\u5230QuickBooks Online\u3002',
            vendor: '\u4F9B\u5E94\u5546',
            defaultVendorDescription:
                '\u8BBE\u7F6E\u4E00\u4E2A\u9ED8\u8BA4\u4F9B\u5E94\u5546\uFF0C\u5C06\u5E94\u7528\u4E8E\u5BFC\u51FA\u7684\u6240\u6709\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
            exportOutOfPocketExpensesDescription: '\u8BBE\u7F6E\u5982\u4F55\u5C06\u81EA\u4ED8\u8D39\u7528\u5BFC\u51FA\u5230QuickBooks Online\u3002',
            exportCheckDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u9010\u9879\u5217\u51FA\u7684\u652F\u7968\uFF0C\u5E76\u4ECE\u4E0B\u9762\u7684\u94F6\u884C\u8D26\u6237\u53D1\u9001\u3002',
            exportJournalEntryDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u5206\u9879\u8BB0\u8D26\u6761\u76EE\uFF0C\u5E76\u5C06\u5176\u53D1\u5E03\u5230\u4E0B\u9762\u7684\u8D26\u6237\u3002',
            exportVendorBillDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u8BE6\u7EC6\u7684\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u5728\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u7684\u7B2C\u4E00\u5929\u53D1\u5E03\u3002',
            account: '\u5E10\u6237',
            accountDescription: '\u9009\u62E9\u53D1\u5E03\u65E5\u5FD7\u6761\u76EE\u7684\u4F4D\u7F6E\u3002',
            accountsPayable: '\u61C9\u4ED8\u8CEC\u6B3E',
            accountsPayableDescription: '\u9009\u62E9\u521B\u5EFA\u4F9B\u5E94\u5546\u8D26\u5355\u7684\u4F4D\u7F6E\u3002',
            bankAccount: '\u94F6\u884C\u8D26\u6237',
            notConfigured: '\u672A\u914D\u7F6E',
            bankAccountDescription: '\u9009\u62E9\u4ECE\u54EA\u91CC\u53D1\u9001\u652F\u7968\u3002',
            creditCardAccount: '\u4FE1\u7528\u5361\u8D26\u6237',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online \u4E0D\u652F\u6301\u5728\u4F9B\u5E94\u5546\u8D26\u5355\u5BFC\u51FA\u4E0A\u4F7F\u7528\u4F4D\u7F6E\u3002\u7531\u4E8E\u60A8\u5728\u5DE5\u4F5C\u533A\u542F\u7528\u4E86\u4F4D\u7F6E\uFF0C\u6B64\u5BFC\u51FA\u9009\u9879\u4E0D\u53EF\u7528\u3002',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online\u4E0D\u652F\u6301\u65E5\u8BB0\u8D26\u5BFC\u51FA\u7684\u7A0E\u52A1\u3002\u7531\u4E8E\u60A8\u5728\u5DE5\u4F5C\u533A\u542F\u7528\u4E86\u7A0E\u52A1\uFF0C\u56E0\u6B64\u6B64\u5BFC\u51FA\u9009\u9879\u4E0D\u53EF\u7528\u3002',
            outOfPocketTaxEnabledError:
                '\u5F53\u7A0E\u52A1\u542F\u7528\u65F6\uFF0C\u65E0\u6CD5\u4F7F\u7528\u65E5\u8BB0\u8D26\u6761\u76EE\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u7684\u5BFC\u51FA\u9009\u9879\u3002',
            advancedConfig: {
                autoSyncDescription: 'Expensify\u4F1A\u6BCF\u5929\u81EA\u52A8\u4E0EQuickBooks Online\u540C\u6B65\u3002',
                inviteEmployees: '\u9080\u8BF7\u5458\u5DE5',
                inviteEmployeesDescription: '\u5BFC\u5165QuickBooks\u5728\u7EBF\u5458\u5DE5\u8BB0\u5F55\uFF0C\u5E76\u9080\u8BF7\u5458\u5DE5\u52A0\u5165\u6B64\u5DE5\u4F5C\u7A7A\u95F4\u3002',
                createEntities: '\u81EA\u52A8\u521B\u5EFA\u5B9E\u4F53',
                createEntitiesDescription:
                    '\u5982\u679C\u4F9B\u5E94\u5546\u5728QuickBooks Online\u4E2D\u4E0D\u5B58\u5728\uFF0CExpensify\u5C06\u81EA\u52A8\u521B\u5EFA\uFF0C\u540C\u65F6\u5728\u5BFC\u51FA\u53D1\u7968\u65F6\u81EA\u52A8\u521B\u5EFA\u5BA2\u6237\u3002',
                reimbursedReportsDescription:
                    '\u6BCF\u5F53\u4F7F\u7528Expensify ACH\u652F\u4ED8\u62A5\u544A\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u652F\u4ED8\u5C06\u5728\u4E0B\u9762\u7684QuickBooks Online\u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
                qboBillPaymentAccount: 'QuickBooks\u8D26\u5355\u652F\u4ED8\u8D26\u6237',
                qboInvoiceCollectionAccount: 'QuickBooks \u53D1\u7968\u6536\u6B3E\u8D26\u6237',
                accountSelectDescription: '\u9009\u62E9\u4ED8\u6B3E\u8D26\u6237\uFF0C\u6211\u4EEC\u5C06\u5728QuickBooks Online\u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
                invoiceAccountSelectorDescription:
                    '\u9009\u62E9\u63A5\u6536\u53D1\u7968\u4ED8\u6B3E\u7684\u5730\u65B9\uFF0C\u6211\u4EEC\u5C06\u5728QuickBooks Online\u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '\u501F\u8BB0\u5361',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '\u4FE1\u7528\u5361',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\u65E5\u8BB0\u6761\u76EE',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]:
                    '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "\u6211\u4EEC\u5C06\u81EA\u52A8\u5C06\u501F\u8BB0\u5361\u4EA4\u6613\u4E2D\u7684\u5546\u6237\u540D\u79F0\u4E0EQuickBooks\u4E2D\u7684\u4EFB\u4F55\u76F8\u5E94\u4F9B\u5E94\u5546\u8FDB\u884C\u5339\u914D\u3002\u5982\u679C\u4E0D\u5B58\u5728\u4F9B\u5E94\u5546\uFF0C\u6211\u4EEC\u5C06\u521B\u5EFA\u4E00\u4E2A'\u501F\u8BB0\u5361\u6742\u9879'\u4F9B\u5E94\u5546\u8FDB\u884C\u5173\u8054\u3002",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "\u6211\u4EEC\u5C06\u81EA\u52A8\u5C06\u4FE1\u7528\u5361\u4EA4\u6613\u4E0A\u7684\u5546\u6237\u540D\u79F0\u4E0EQuickBooks\u4E2D\u7684\u4EFB\u4F55\u76F8\u5E94\u4F9B\u5E94\u5546\u8FDB\u884C\u5339\u914D\u3002\u5982\u679C\u4E0D\u5B58\u5728\u4F9B\u5E94\u5546\uFF0C\u6211\u4EEC\u5C06\u521B\u5EFA\u4E00\u4E2A'\u4FE1\u7528\u5361\u6742\u9879'\u4F9B\u5E94\u5546\u8FDB\u884C\u5173\u8054\u3002",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u9010\u9879\u7684\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u65E5\u671F\u4E3A\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u5728\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u7684\u7B2C1\u5929\u53D1\u5E03\u3002',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: '\u9009\u62E9\u5BFC\u51FA\u501F\u8BB0\u5361\u4EA4\u6613\u7684\u4F4D\u7F6E\u3002',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: '\u9009\u62E9\u5BFC\u51FA\u4FE1\u7528\u5361\u4EA4\u6613\u7684\u4F4D\u7F6E\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    '\u9009\u62E9\u4E00\u4E2A\u4F9B\u5E94\u5546\u6765\u5904\u7406\u6240\u6709\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '\u7576\u4F4D\u7F6E\u555F\u7528\u6642\uFF0C\u4F9B\u61C9\u5546\u8CEC\u55AE\u4E0D\u53EF\u7528\u3002\u8ACB\u9078\u64C7\u5176\u4ED6\u7684\u5C0E\u51FA\u9078\u9805\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    '\u7576\u4F4D\u7F6E\u555F\u7528\u6642\uFF0C\u7121\u6CD5\u9032\u884C\u6AA2\u67E5\u3002\u8ACB\u9078\u64C7\u5176\u4ED6\u7684\u532F\u51FA\u9078\u9805\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '\u5F53\u7A0E\u52A1\u542F\u7528\u65F6\uFF0C\u65E0\u6CD5\u4F7F\u7528\u65E5\u8BB0\u8D26\u6761\u76EE\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u7684\u5BFC\u51FA\u9009\u9879\u3002',
            },
            noAccountsFound: '\u627E\u4E0D\u5230\u5E33\u6236',
            noAccountsFoundDescription: '\u5728QuickBooks Online\u4E2D\u6DFB\u52A0\u5E10\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
        },
        workspaceList: {
            joinNow: '\u7ACB\u5373\u52A0\u5165',
            askToJoin: '\u8BF7\u6C42\u52A0\u5165',
        },
        xero: {
            organization: 'Xero\u7EC4\u7EC7',
            organizationDescription: '\u9009\u62E9\u60A8\u5E0C\u671B\u4ECE\u4E2D\u5BFC\u5165\u6570\u636E\u7684Xero\u7EC4\u7EC7\u3002',
            importDescription: '\u4ECEXero\u5230Expensify\uFF0C\u9009\u62E9\u8981\u5BFC\u5165\u7684\u7F16\u7801\u914D\u7F6E\u3002',
            accountsDescription: '\u60A8\u7684Xero\u4F1A\u8BA1\u56FE\u8868\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230Expensify\u4E2D\u3002',
            accountsSwitchTitle: '\u9009\u62E9\u5C06\u65B0\u8D26\u6237\u4F5C\u4E3A\u542F\u7528\u6216\u7981\u7528\u7684\u7C7B\u522B\u8FDB\u884C\u5BFC\u5165\u3002',
            accountsSwitchDescription: '\u542F\u7528\u7684\u7C7B\u522B\u5C06\u5728\u6210\u5458\u521B\u5EFA\u8D39\u7528\u65F6\u53EF\u4F9B\u9009\u62E9\u3002',
            trackingCategories: '\u8FFD\u8E2A\u7C7B\u522B',
            trackingCategoriesDescription: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406Xero\u8DDF\u8E2A\u7C7B\u522B\u3002',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `\u5C06 Xero ${categoryName} \u6620\u5C04\u5230`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `\u9078\u64C7\u5C07 ${categoryName} \u5C0E\u51FA\u5230 Xero \u6642\u7684\u6620\u5C04\u4F4D\u7F6E\u3002`,
            customers: '\u91CD\u65B0\u5411\u5BA2\u6237\u6536\u8D39',
            customersDescription:
                '\u9009\u62E9\u662F\u5426\u5728Expensify\u4E2D\u91CD\u65B0\u5411\u5BA2\u6237\u6536\u8D39\u3002\u60A8\u7684Xero\u5BA2\u6237\u8054\u7CFB\u4EBA\u53EF\u4EE5\u88AB\u6807\u8BB0\u5230\u8D39\u7528\u4E2D\uFF0C\u5E76\u5C06\u4F5C\u4E3A\u9500\u552E\u53D1\u7968\u5BFC\u51FA\u5230Xero\u3002',
            taxesDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406Xero\u7A0E\u52A1\u3002',
            notImported: '\u672A\u5BFC\u5165',
            notConfigured: '\u672A\u914D\u7F6E',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero\u806F\u7E6B\u9ED8\u8A8D',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '\u6807\u7B7E',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '\u62A5\u544A\u5B57\u6BB5',
            },
            exportDescription: '\u914D\u7F6EExpensify\u5982\u4F55\u5BFC\u51FA\u6570\u636E\u5230Xero\u3002',
            purchaseBill: '\u8D2D\u4E70\u8D26\u5355',
            exportDeepDiveCompanyCard:
                '\u5BFC\u51FA\u7684\u8D39\u7528\u5C06\u4F5C\u4E3A\u94F6\u884C\u4EA4\u6613\u53D1\u5E03\u5230\u4E0B\u9762\u7684Xero\u94F6\u884C\u8D26\u6237\uFF0C\u4EA4\u6613\u65E5\u671F\u5C06\u4E0E\u60A8\u7684\u94F6\u884C\u5BF9\u8D26\u5355\u4E0A\u7684\u65E5\u671F\u76F8\u5339\u914D\u3002',
            bankTransactions: '\u94F6\u884C\u4EA4\u6613',
            xeroBankAccount: 'Xero \u94F6\u884C\u8D26\u6237',
            xeroBankAccountDescription: '\u9009\u62E9\u8D39\u7528\u5C06\u4F5C\u4E3A\u94F6\u884C\u4EA4\u6613\u53D1\u5E03\u7684\u5730\u65B9\u3002',
            exportExpensesDescription:
                '\u62A5\u544A\u5C06\u4EE5\u8D2D\u4E70\u8D26\u5355\u7684\u5F62\u5F0F\u5BFC\u51FA\uFF0C\u65E5\u671F\u548C\u72B6\u6001\u5C06\u6839\u636E\u4E0B\u9762\u6240\u9009\u7684\u8FDB\u884C\u9009\u62E9\u3002',
            purchaseBillDate: '\u8D2D\u4E70\u8D26\u5355\u65E5\u671F',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u4E3A',
            salesInvoice: '\u9500\u552E\u53D1\u7968',
            exportInvoicesDescription: '\u9500\u552E\u53D1\u7968\u603B\u662F\u663E\u793A\u53D1\u9001\u53D1\u7968\u7684\u65E5\u671F\u3002',
            advancedConfig: {
                autoSyncDescription: 'Expensify \u5C06\u6BCF\u5929\u81EA\u52A8\u4E0E Xero \u540C\u6B65\u3002',
                purchaseBillStatusTitle: '\u8D2D\u4E70\u8D26\u5355\u72B6\u6001',
                reimbursedReportsDescription:
                    '\u6BCF\u5F53\u4F7F\u7528Expensify ACH\u652F\u4ED8\u62A5\u544A\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u652F\u4ED8\u5C06\u5728\u4E0B\u9762\u7684Xero\u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
                xeroBillPaymentAccount: 'Xero\u8D26\u5355\u652F\u4ED8\u8D26\u6237',
                xeroInvoiceCollectionAccount: 'Xero \u53D1\u7968\u6536\u6B3E\u8D26\u6237',
                xeroBillPaymentAccountDescription: '\u9009\u62E9\u4ED8\u6B3E\u8D26\u6237\uFF0C\u6211\u4EEC\u5C06\u5728Xero\u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
                invoiceAccountSelectorDescription: '\u9009\u62E9\u63A5\u6536\u53D1\u7968\u4ED8\u6B3E\u7684\u5730\u65B9\uFF0C\u6211\u4EEC\u5C06\u5728Xero\u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
            },
            exportDate: {
                label: '\u8D2D\u4E70\u8D26\u5355\u65E5\u671F',
                description: '\u4F7F\u7528\u6B64\u65E5\u671F\u5C06\u62A5\u544A\u5BFC\u51FA\u5230Xero\u3002',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u4E0A\u6B21\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u4E00\u6B21\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230Xero\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u63D0\u4EA4\u62A5\u544A\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            invoiceStatus: {
                label: '\u8D2D\u4E70\u8D26\u5355\u72B6\u6001',
                description: '\u5C06\u6B64\u72B6\u6001\u7528\u4E8E\u5BFC\u51FA\u8D2D\u4E70\u8D26\u5355\u81F3Xero\u3002',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: "Sorry, but you didn't provide any text to translate.",
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '\u7B49\u5F85\u6279\u51C6',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '\u7B49\u5F85\u4ED8\u6B3E',
                },
            },
            noAccountsFound: '\u627E\u4E0D\u5230\u5E33\u6236',
            noAccountsFoundDescription: '\u8BF7\u5728Xero\u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
        },
        sageIntacct: {
            preferredExporter: '\u9996\u9009\u51FA\u53E3\u5546',
            notConfigured: '\u672A\u914D\u7F6E',
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u4F7F\u7528\u6B64\u65E5\u671F\u5BFC\u51FA\u62A5\u544A\u5230 Sage Intacct\u3002',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u4E0A\u6B21\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u4E00\u6B21\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230Sage Intacct\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u63D0\u4EA4\u62A5\u544A\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            reimbursableExpenses: {
                description: '\u8BBE\u7F6E\u5982\u4F55\u5C06\u81EA\u4ED8\u8D39\u7528\u5BFC\u51FA\u5230Sage Intacct\u3002',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '\u8D39\u7528\u62A5\u544A',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                },
            },
            nonReimbursableExpenses: {
                description: '\u8BBE\u7F6E\u516C\u53F8\u5361\u8D2D\u4E70\u5982\u4F55\u5BFC\u51FA\u5230Sage Intacct\u3002',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '\u4FE1\u7528\u5361',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                },
            },
            creditCardAccount: '\u4FE1\u7528\u5361\u8D26\u6237',
            defaultVendor: '\u9ED8\u8BA4\u4F9B\u5E94\u5546',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `\u8BBE\u7F6E\u4E00\u4E2A\u9ED8\u8BA4\u4F9B\u5E94\u5546\uFF0C\u8BE5\u4F9B\u5E94\u5546\u5C06\u9002\u7528\u4E8E\u5728Sage Intacct\u4E2D\u6CA1\u6709\u5339\u914D\u4F9B\u5E94\u5546\u7684${
                    isReimbursable ? '' : '非'
                }\u53EF\u62A5\u9500\u8D39\u7528\u3002`,
            exportDescription: '\u914D\u7F6E\u5982\u4F55\u5C06Expensify\u6570\u636E\u5BFC\u51FA\u5230Sage Intacct\u3002',
            exportPreferredExporterNote:
                '\u9996\u9009\u7684\u5BFC\u51FA\u8005\u53EF\u4EE5\u662F\u4EFB\u4F55\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\uFF0C\u4F46\u5982\u679C\u60A8\u5728\u57DF\u8BBE\u7F6E\u4E2D\u4E3A\u5404\u4E2A\u516C\u53F8\u5361\u8BBE\u7F6E\u4E86\u4E0D\u540C\u7684\u5BFC\u51FA\u8D26\u6237\uFF0C\u90A3\u4E48\u4ED6\u4E5F\u5FC5\u987B\u662F\u57DF\u7BA1\u7406\u5458\u3002',
            exportPreferredExporterSubNote:
                '\u4E00\u65E6\u8BBE\u7F6E\uFF0C\u9996\u9009\u7684\u5BFC\u51FA\u8005\u5C06\u5728\u4ED6\u4EEC\u7684\u8D26\u6237\u4E2D\u770B\u5230\u5BFC\u51FA\u7684\u62A5\u544A\u3002',
            noAccountsFound: '\u627E\u4E0D\u5230\u5E33\u6236',
            noAccountsFoundDescription: `Please add the account in Sage Intacct and sync the connection again.`,
            autoSync: '\u81EA\u52A8\u540C\u6B65',
            autoSyncDescription: 'Expensify \u5C06\u6BCF\u5929\u81EA\u52A8\u4E0E Sage Intacct \u540C\u6B65\u3002',
            inviteEmployees: '\u9080\u8BF7\u5458\u5DE5',
            inviteEmployeesDescription:
                '\u5C0E\u5165Sage Intacct\u54E1\u5DE5\u8A18\u9304\u4E26\u9080\u8ACB\u54E1\u5DE5\u52A0\u5165\u6B64\u5DE5\u4F5C\u5340\u3002\u60A8\u7684\u5BE9\u6279\u6D41\u7A0B\u5C07\u9ED8\u8A8D\u70BA\u7D93\u7406\u5BE9\u6279\uFF0C\u4E26\u53EF\u4EE5\u5728\u6210\u54E1\u9801\u9762\u4E0A\u9032\u4E00\u6B65\u914D\u7F6E\u3002',
            syncReimbursedReports: '\u540C\u6B65\u62A5\u9500\u62A5\u544A',
            syncReimbursedReportsDescription:
                '\u6BCF\u5F53\u4F7F\u7528Expensify ACH\u652F\u4ED8\u62A5\u544A\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u652F\u4ED8\u5C06\u5728\u4E0B\u9762\u7684Sage Intacct\u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
            paymentAccount: 'Sage Intacct\u4ED8\u6B3E\u8D26\u6237',
        },
        netsuite: {
            subsidiary: '\u5B50\u516C\u53F8',
            subsidiarySelectDescription: '\u5728NetSuite\u4E2D\u9009\u62E9\u60A8\u60F3\u8981\u5BFC\u5165\u6570\u636E\u7684\u5B50\u516C\u53F8\u3002',
            exportDescription: '\u914D\u7F6EExpensify\u6570\u636E\u5982\u4F55\u5BFC\u51FA\u5230NetSuite\u3002',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u81F3',
            journalEntriesTaxPostingAccount: '\u8BB0\u8D26\u6761\u76EE\u7A0E\u52A1\u8FC7\u8D26\u8D26\u6237',
            journalEntriesProvTaxPostingAccount: '\u7701\u7A0E\u8BB0\u8D26\u8D26\u6237\u7684\u65E5\u8BB0\u6761\u76EE',
            foreignCurrencyAmount: '\u5BFC\u51FA\u5916\u5E01\u91D1\u989D',
            exportToNextOpenPeriod: '\u5BFC\u51FA\u5230\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F',
            nonReimbursableJournalPostingAccount: '\u4E0D\u53EF\u9000\u6B3E\u7684\u65E5\u8BB0\u8D26\u6237\u53D1\u5E03\u8D26\u6237',
            reimbursableJournalPostingAccount: '\u53EF\u62A5\u9500\u7684\u65E5\u8BB0\u8D26\u53D1\u5E03\u8D26\u6237',
            journalPostingPreference: {
                label: '\u8BB0\u8D26\u6761\u76EE\u53D1\u5E03\u504F\u597D',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '\u6BCF\u4EFD\u62A5\u544A\u7684\u5355\u72EC\u9010\u9879\u6761\u76EE',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '\u6BCF\u4E2A\u8D39\u7528\u53EA\u8BB0\u5F55\u4E00\u6B21',
                },
            },
            invoiceItem: {
                label: '\u53D1\u7968\u9879\u76EE',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '\u4E3A\u6211\u521B\u5EFA\u4E00\u4E2A',
                        description:
                            '\u6211\u4EEC\u5C06\u5728\u5BFC\u51FA\u65F6\u4E3A\u60A8\u521B\u5EFA\u4E00\u4E2A"Expensify\u53D1\u7968\u884C\u9879\u76EE"\uFF08\u5982\u679C\u5C1A\u672A\u5B58\u5728\u7684\u8BDD\uFF09\u3002',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '\u9009\u62E9\u73B0\u6709\u7684',
                        description: '\u6211\u4EEC\u5C06\u628A\u6765\u81EAExpensify\u7684\u53D1\u7968\u4E0E\u4E0B\u9762\u9009\u5B9A\u7684\u9879\u76EE\u5173\u8054\u8D77\u6765\u3002',
                    },
                },
            },
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u4F7F\u7528\u6B64\u65E5\u671F\u5BFC\u51FA\u62A5\u544A\u81F3NetSuite\u3002',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u4E0A\u6B21\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u4E00\u6B21\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230NetSuite\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u63D0\u4EA4\u62A5\u544A\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '\u8D39\u7528\u62A5\u544A',
                        reimbursableDescription: '\u81EA\u4ED8\u8D39\u7528\u5C06\u4F5C\u4E3A\u8D39\u7528\u62A5\u544A\u5BFC\u51FA\u5230NetSuite\u3002',
                        nonReimbursableDescription: '\u516C\u53F8\u5361\u8D39\u7528\u5C06\u4F5C\u4E3A\u8D39\u7528\u62A5\u544A\u5BFC\u51FA\u5230NetSuite\u3002',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '\u4F9B\u5E94\u5546\u8D26\u5355',
                        reimbursableDescription:
                            '\u81EA\u4ED8\u8D39\u7528\u5C06\u4F5C\u4E3A\u5E94\u4ED8\u8D26\u6B3E\u5BFC\u51FA\u5230\u4E0B\u9762\u6307\u5B9A\u7684NetSuite\u4F9B\u5E94\u5546\u3002' +
                            '\n' +
                            '\u5982\u679C\u60A8\u60F3\u4E3A\u6BCF\u5F20\u5361\u8BBE\u7F6E\u7279\u5B9A\u7684\u4F9B\u5E94\u5546\uFF0C\u8BF7\u8F6C\u5230*\u8BBE\u7F6E > \u57DF > \u516C\u53F8\u5361*\u3002',
                        nonReimbursableDescription:
                            '\u516C\u53F8\u5361\u8D39\u7528\u5C06\u4F5C\u4E3A\u5E94\u4ED8\u8D26\u6B3E\u5BFC\u51FA\uFF0C\u652F\u4ED8\u7ED9\u4E0B\u9762\u6307\u5B9A\u7684NetSuite\u4F9B\u5E94\u5546\u3002' +
                            '\n' +
                            '\u5982\u679C\u60A8\u60F3\u4E3A\u6BCF\u5F20\u5361\u8BBE\u7F6E\u7279\u5B9A\u7684\u4F9B\u5E94\u5546\uFF0C\u8BF7\u8F6C\u5230*\u8BBE\u7F6E > \u57DF > \u516C\u53F8\u5361*\u3002',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '\u8BB0\u4E8B\u6761\u76EE',
                        reimbursableDescription:
                            '\u81EA\u4ED8\u8D39\u7528\u5C06\u4F5C\u4E3A\u65E5\u8BB0\u8D26\u6761\u76EE\u5BFC\u51FA\u5230\u4E0B\u9762\u6307\u5B9A\u7684NetSuite\u8D26\u6237\u3002' +
                            '\n' +
                            '\u5982\u679C\u60A8\u60F3\u4E3A\u6BCF\u5F20\u5361\u8BBE\u7F6E\u7279\u5B9A\u7684\u4F9B\u5E94\u5546\uFF0C\u8BF7\u8F6C\u5230*\u8BBE\u7F6E > \u57DF > \u516C\u53F8\u5361*\u3002',
                        nonReimbursableDescription:
                            '\u516C\u53F8\u5361\u8D39\u7528\u5C06\u4F5C\u4E3A\u65E5\u8BB0\u8D26\u6761\u76EE\u5BFC\u51FA\u5230\u4E0B\u9762\u6307\u5B9A\u7684NetSuite\u8D26\u6237\u3002' +
                            '\n' +
                            '\u5982\u679C\u60A8\u60F3\u4E3A\u6BCF\u5F20\u5361\u8BBE\u7F6E\u7279\u5B9A\u7684\u4F9B\u5E94\u5546\uFF0C\u8BF7\u8F6C\u5230*\u8BBE\u7F6E > \u57DF > \u516C\u53F8\u5361*\u3002',
                    },
                },
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify \u5C06\u6BCF\u5929\u81EA\u52A8\u4E0E NetSuite \u540C\u6B65\u3002',
                reimbursedReportsDescription:
                    '\u6BCF\u5F53\u4F7F\u7528Expensify ACH\u652F\u4ED8\u62A5\u544A\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u652F\u4ED8\u5C06\u5728\u4E0B\u9762\u7684NetSuite\u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
                reimbursementsAccount: '\u62A5\u9500\u8D26\u6237',
                reimbursementsAccountDescription:
                    '\u9009\u62E9\u60A8\u5C06\u7528\u4E8E\u62A5\u9500\u7684\u94F6\u884C\u8D26\u6237\uFF0C\u6211\u4EEC\u5C06\u5728NetSuite\u4E2D\u521B\u5EFA\u5173\u8054\u7684\u4ED8\u6B3E\u3002',
                collectionsAccount: '\u6536\u6B3E\u8D26\u6237',
                collectionsAccountDescription:
                    '\u4E00\u65E6\u53D1\u7968\u5728Expensify\u4E2D\u6807\u8BB0\u4E3A\u5DF2\u4ED8\u5E76\u5BFC\u51FA\u5230NetSuite\uFF0C\u5B83\u5C06\u51FA\u73B0\u5728\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002',
                approvalAccount: 'A/P\u6279\u51C6\u8D26\u6237',
                approvalAccountDescription:
                    '\u5728NetSuite\u4E2D\u9009\u62E9\u5C06\u5BF9\u4EA4\u6613\u8FDB\u884C\u6279\u51C6\u7684\u8D26\u6237\u3002\u5982\u679C\u60A8\u6B63\u5728\u540C\u6B65\u5DF2\u62A5\u9500\u7684\u62A5\u544A\uFF0C\u8FD9\u4E5F\u662F\u5C06\u521B\u5EFA\u8D26\u5355\u652F\u4ED8\u7684\u8D26\u6237\u3002',
                defaultApprovalAccount: 'NetSuite \u9ED8\u8BA4',
                inviteEmployees: '\u9080\u8BF7\u5458\u5DE5\u5E76\u8BBE\u7F6E\u5BA1\u6279',
                inviteEmployeesDescription:
                    '\u5C0E\u5165NetSuite\u54E1\u5DE5\u8A18\u9304\u4E26\u9080\u8ACB\u54E1\u5DE5\u52A0\u5165\u6B64\u5DE5\u4F5C\u5340\u3002\u60A8\u7684\u5BE9\u6279\u6D41\u7A0B\u5C07\u9ED8\u8A8D\u70BA\u7D93\u7406\u5BE9\u6279\uFF0C\u4E26\u53EF\u4EE5\u5728*\u6210\u54E1*\u9801\u9762\u4E0A\u9032\u4E00\u6B65\u914D\u7F6E\u3002',
                autoCreateEntities: '\u81EA\u52A8\u521B\u5EFA\u5458\u5DE5/\u4F9B\u5E94\u5546',
                enableCategories: '\u542F\u7528\u65B0\u5BFC\u5165\u7684\u7C7B\u522B',
                customFormID: '\u81EA\u5B9A\u4E49\u8868\u5355ID',
                customFormIDDescription:
                    '\u9ED8\u8BA4\u60C5\u51B5\u4E0B\uFF0CExpensify\u5C06\u4F7F\u7528\u5728NetSuite\u4E2D\u8BBE\u7F6E\u7684\u9996\u9009\u4EA4\u6613\u5F62\u5F0F\u521B\u5EFA\u6761\u76EE\u3002\u6216\u8005\uFF0C\u60A8\u53EF\u4EE5\u6307\u5B9A\u4E00\u4E2A\u7279\u5B9A\u7684\u4EA4\u6613\u5F62\u5F0F\u6765\u4F7F\u7528\u3002',
                customFormIDReimbursable: '\u81EA\u4ED8\u8D39\u7528',
                customFormIDNonReimbursable: '\u516C\u53F8\u5361\u8D39\u7528',
                exportReportsTo: {
                    label: '\u8D39\u7528\u62A5\u544A\u5BA1\u6279\u7EA7\u522B',
                    description:
                        '\u4E00\u65E6\u5728Expensify\u4E2D\u7684\u8D39\u7528\u62A5\u544A\u83B7\u5F97\u6279\u51C6\u5E76\u5BFC\u51FA\u5230NetSuite\uFF0C\u60A8\u53EF\u4EE5\u5728NetSuite\u4E2D\u8BBE\u7F6E\u4E00\u4E2A\u989D\u5916\u7684\u5BA1\u6279\u7EA7\u522B\uFF0C\u7136\u540E\u518D\u8FDB\u884C\u53D1\u5E03\u3002',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite\u9ED8\u8BA4\u504F\u597D\u8BBE\u7F6E',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '\u53EA\u6709\u4E3B\u7BA1\u6279\u51C6',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '\u53EA\u6709\u6703\u8A08\u90E8\u9580\u6279\u51C6',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '\u4E3B\u7BA1\u548C\u4F1A\u8BA1\u5DF2\u6279\u51C6',
                    },
                },
                accountingMethods: {
                    label: '\u4F55\u65F6\u5BFC\u51FA',
                    description: '\u9009\u62E9\u4F55\u65F6\u5BFC\u51FA\u8D39\u7528\uFF1A',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\u7D2F\u8BA1',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\u73B0\u91D1',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\u7576\u6700\u7D42\u7372\u6279\u6642\uFF0C\u5C07\u6703\u5C0E\u51FA\u81EA\u4ED8\u8CBB\u7528',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\u81EA\u4ED8\u8D39\u7528\u5C06\u5728\u4ED8\u6B3E\u540E\u5BFC\u51FA',
                    },
                },
                exportVendorBillsTo: {
                    label: '\u4F9B\u5E94\u5546\u8D26\u5355\u5BA1\u6279\u7EA7\u522B',
                    description:
                        '\u4E00\u65E6\u4F9B\u5E94\u5546\u7684\u8D26\u5355\u5728Expensify\u4E2D\u83B7\u5F97\u6279\u51C6\u5E76\u5BFC\u51FA\u5230NetSuite\uFF0C\u60A8\u53EF\u4EE5\u5728NetSuite\u4E2D\u8BBE\u7F6E\u4E00\u4E2A\u989D\u5916\u7684\u5BA1\u6279\u7EA7\u522B\uFF0C\u7136\u540E\u518D\u53D1\u5E03\u3002',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite\u9ED8\u8BA4\u504F\u597D\u8BBE\u7F6E',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '\u5F85\u6279\u51C6',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '\u6279\u51C6\u53D1\u5E03',
                    },
                },
                exportJournalsTo: {
                    label: '\u65E5\u8BB0\u8D26\u76EE\u6279\u51C6\u7EA7\u522B',
                    description:
                        '\u4E00\u65E6\u65E5\u8BB0\u8D26\u6761\u76EE\u5728Expensify\u4E2D\u83B7\u5F97\u6279\u51C6\u5E76\u5BFC\u51FA\u5230NetSuite\uFF0C\u60A8\u53EF\u4EE5\u5728NetSuite\u4E2D\u8BBE\u7F6E\u4E00\u4E2A\u989D\u5916\u7684\u6279\u51C6\u7EA7\u522B\uFF0C\u7136\u540E\u518D\u8FDB\u884C\u53D1\u5E03\u3002',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite\u9ED8\u8BA4\u504F\u597D\u8BBE\u7F6E',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '\u5F85\u6279\u51C6',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '\u6279\u51C6\u53D1\u5E03',
                    },
                },
                error: {
                    customFormID: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u6570\u5B57\u81EA\u5B9A\u4E49\u8868\u5355ID\u3002',
                },
            },
            noAccountsFound: '\u627E\u4E0D\u5230\u5E33\u6236',
            noAccountsFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            noVendorsFound: '\u627E\u4E0D\u5230\u4F9B\u61C9\u5546',
            noVendorsFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u4F9B\u5E94\u5546\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            noItemsFound: '\u672A\u627E\u5230\u53D1\u7968\u9879\u76EE',
            noItemsFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u53D1\u7968\u9879\u76EE\uFF0C\u7136\u540E\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            noSubsidiariesFound: '\u672A\u627E\u5230\u5B50\u516C\u53F8',
            noSubsidiariesFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u4E00\u4E2A\u5B50\u516C\u53F8\uFF0C\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            tokenInput: {
                title: 'NetSuite \u8BBE\u7F6E',
                formSteps: {
                    installBundle: {
                        title: '\u5B89\u88C5Expensify\u5305',
                        description:
                            '\u5728NetSuite\u4E2D\uFF0C\u8F6C\u5230 *\u5B9A\u5236 > SuiteBundler > \u641C\u7D22\u5E76\u5B89\u88C5\u6346\u7ED1\u5305* > \u641C\u7D22 "Expensify" > \u5B89\u88C5\u6346\u7ED1\u5305\u3002',
                    },
                    enableTokenAuthentication: {
                        title: '\u542F\u7528\u57FA\u4E8E\u4EE4\u724C\u7684\u8BA4\u8BC1',
                        description:
                            '\u5728NetSuite\u4E2D\uFF0C\u524D\u5F80 *\u8BBE\u7F6E > \u516C\u53F8 > \u542F\u7528\u529F\u80FD > SuiteCloud* > \u542F\u7528 *\u57FA\u4E8E\u4EE4\u724C\u7684\u8BA4\u8BC1*\u3002',
                    },
                    enableSoapServices: {
                        title: '\u542F\u7528SOAP\u7F51\u7EDC\u670D\u52A1',
                        description: '\u5728NetSuite\u4E2D\uFF0C\u8F6C\u5230*\u8BBE\u7F6E > \u516C\u53F8 > \u542F\u7528\u529F\u80FD > SuiteCloud* > \u542F\u7528 *SOAP Web Services*\u3002',
                    },
                    createAccessToken: {
                        title: '\u521B\u5EFA\u4E00\u4E2A\u8BBF\u95EE\u4EE4\u724C',
                        description:
                            '\u5728NetSuite\u4E2D\uFF0C\u8F6C\u5230*\u8BBE\u7F6E > \u7528\u6237/\u89D2\u8272 > \u8BBF\u95EE\u4EE4\u724C* > \u4E3A"Expensify"\u5E94\u7528\u548C"Expensify Integration"\u6216"\u7BA1\u7406\u5458"\u89D2\u8272\u521B\u5EFA\u4E00\u4E2A\u8BBF\u95EE\u4EE4\u724C\u3002\n\n*\u91CD\u8981\u63D0\u793A\uFF1A*\u786E\u4FDD\u60A8\u4FDD\u5B58\u4E86\u6B64\u6B65\u9AA4\u7684*\u4EE4\u724CID*\u548C*\u4EE4\u724C\u5BC6\u94A5*\u3002\u60A8\u5C06\u5728\u4E0B\u4E00\u6B65\u4E2D\u9700\u8981\u5B83\u3002',
                    },
                    enterCredentials: {
                        title: '\u8F93\u5165\u60A8\u7684NetSuite\u51ED\u8BC1',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite\u5E10\u6237ID',
                            netSuiteTokenID: '\u4EE4\u724C ID',
                            netSuiteTokenSecret: '\u4EE4\u724C\u79D8\u5BC6',
                        },
                        netSuiteAccountIDDescription: '\u5728NetSuite\u4E2D\uFF0C\u524D\u5F80 *\u8BBE\u7F6E > \u96C6\u6210 > SOAP Web\u670D\u52A1\u504F\u597D\u8BBE\u7F6E*\u3002',
                    },
                },
            },
            import: {
                expenseCategories: '\u8D39\u7528\u7C7B\u522B',
                expenseCategoriesDescription: '\u60A8\u7684NetSuite\u8D39\u7528\u7C7B\u522B\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165Expensify\u3002',
                crossSubsidiaryCustomers: '\u8DE8\u5B50\u516C\u53F8\u7684\u5BA2\u6237/\u9879\u76EE',
                importFields: {
                    departments: {
                        title: '\u90E8\u95E8',
                        subtitle: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406NetSuite *\u90E8\u95E8*\u3002',
                    },
                    classes: {
                        title: '\u7C7B',
                        subtitle: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406*\u7C7B\u522B*\u3002',
                    },
                    locations: {
                        title: '\u4F4D\u7F6E',
                        subtitle: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406*\u4F4D\u7F6E*\u3002',
                    },
                },
                customersOrJobs: {
                    title: '\u5BA2\u6237/\u9879\u76EE',
                    subtitle: '\u5728Expensify\u4E2D\u9078\u64C7\u5982\u4F55\u8655\u7406NetSuite\u7684*\u5BA2\u6236*\u548C*\u9805\u76EE*\u3002',
                    importCustomers: '\u5BFC\u5165\u5BA2\u6237',
                    importJobs: '\u5BFC\u5165\u9879\u76EE',
                    customers: '\u5BA2\u6237',
                    jobs: '\u9879\u76EE',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join(' and ')}, ${importType}`,
                },
                importTaxDescription: '\u4ECENetSuite\u5BFC\u5165\u7A0E\u6536\u7EC4\u3002',
                importCustomFields: {
                    chooseOptionBelow: '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u9009\u9879\uFF1A',
                    label: ({importedTypes}: ImportedTypesParams) => `\u4F5C\u70BA${importedTypes.join('和')}\u5C0E\u5165`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `\u8BF7\u8F93\u5165 ${fieldName}`,
                    customSegments: {
                        title: '\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        addText: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        recordTitle: '\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '\u67E5\u770B\u8BE6\u7EC6\u8BF4\u660E',
                        helpText: '\u5173\u4E8E\u914D\u7F6E\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55\u3002',
                        emptyTitle: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5\u843D\u6216\u81EA\u5B9A\u4E49\u8BB0\u5F55',
                        fields: {
                            segmentName: '\u540D\u79F0',
                            internalID: '\u5185\u90E8ID',
                            scriptID: '\u811A\u672C ID',
                            customRecordScriptID: '\u4EA4\u6613\u5217ID',
                            mapping: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                        },
                        removeTitle: '\u79FB\u9664\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        removePrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55\u5417\uFF1F',
                        addForm: {
                            customSegmentName: '\u81EA\u5B9A\u4E49\u6BB5\u540D\u79F0',
                            customRecordName: '\u81EA\u5B9A\u4E49\u8BB0\u5F55\u540D\u79F0',
                            segmentTitle:
                                "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
                            customSegmentAddTitle: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5\u843D',
                            customRecordAddTitle: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u8BB0\u5F55',
                            recordTitle: '\u81EA\u5B9A\u4E49\u8BB0\u5F55',
                            segmentRecordType: '\u60A8\u60F3\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5\u8FD8\u662F\u81EA\u5B9A\u4E49\u8BB0\u5F55\uFF1F',
                            customSegmentNameTitle: '\u8FD9\u662F\u4EC0\u4E48\u81EA\u5B9A\u4E49\u6BB5\u540D\u79F0\uFF1F',
                            customRecordNameTitle: '\u8FD9\u662F\u4EC0\u4E48\u81EA\u5B9A\u4E49\u8BB0\u5F55\u540D\u79F0\uFF1F',
                            customSegmentNameFooter: `\u60A8\u53EF\u4EE5\u5728NetSuite\u7684*\u81EA\u5B9A\u4E49 > \u94FE\u63A5\u3001\u8BB0\u5F55\u548C\u5B57\u6BB5 > \u81EA\u5B9A\u4E49\u6BB5*\u9875\u9762\u4E0B\u627E\u5230\u81EA\u5B9A\u4E49\u6BB5\u540D\u79F0\u3002\n\n_\u5982\u9700\u66F4\u8BE6\u7EC6\u7684\u6307\u5BFC\uFF0C[\u8BF7\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_\u3002`,
                            customRecordNameFooter: `\u60A8\u53EF\u4EE5\u901A\u8FC7\u5728\u5168\u7403\u641C\u7D22\u4E2D\u8F93\u5165\u201C\u4EA4\u6613\u5217\u5B57\u6BB5\u201D\u6765\u5728NetSuite\u4E2D\u67E5\u627E\u81EA\u5B9A\u4E49\u8BB0\u5F55\u540D\u79F0\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7AD9\u70B9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_\u3002`,
                            customSegmentInternalIDTitle: '\u4EC0\u4E48\u662F\u5185\u90E8ID\uFF1F',
                            customSegmentInternalIDFooter: `\u9996\u5148\uFF0C\u786E\u4FDD\u60A8\u5DF2\u5728NetSuite\u7684*\u9996\u9875 > \u8BBE\u7F6E\u504F\u597D > \u663E\u793A\u5185\u90E8ID*\u4E0B\u542F\u7528\u4E86\u5185\u90E8ID\u3002\n\n\u60A8\u53EF\u4EE5\u5728NetSuite\u4E0B\u627E\u5230\u81EA\u5B9A\u4E49\u6BB5\u7684\u5185\u90E8ID\uFF1A\n\n1. *\u5B9A\u5236 > \u5217\u8868\uFF0C\u8BB0\u5F55\uFF0C\u548C\u5B57\u6BB5 > \u81EA\u5B9A\u4E49\u6BB5*\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u6BB5\u3002\n3. \u70B9\u51FB*\u81EA\u5B9A\u4E49\u8BB0\u5F55\u7C7B\u578B*\u65C1\u8FB9\u7684\u8D85\u94FE\u63A5\u3002\n4. \u5728\u5E95\u90E8\u7684\u8868\u683C\u4E2D\u627E\u5230\u5185\u90E8ID\u3002\n\n_\u5982\u9700\u66F4\u8BE6\u7EC6\u7684\u6307\u5BFC\uFF0C[\u8BF7\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_\u3002`,
                            customRecordInternalIDFooter: `\u60A8\u53EF\u4EE5\u901A\u8FC7\u4EE5\u4E0B\u6B65\u9AA4\u5728NetSuite\u4E2D\u627E\u5230\u81EA\u5B9A\u4E49\u8BB0\u5F55\u7684\u5185\u90E8ID\uFF1A\n\n1. \u5728\u5168\u7403\u641C\u7D22\u4E2D\u8F93\u5165\u201C\u4EA4\u6613\u884C\u5B57\u6BB5\u201D\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u8BB0\u5F55\u3002\n3. \u5728\u5DE6\u4FA7\u627E\u5230\u5185\u90E8ID\u3002\n\n_\u5982\u9700\u66F4\u8BE6\u7EC6\u7684\u6307\u5BFC\uFF0C[\u8BF7\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7AD9\u70B9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_\u3002`,
                            customSegmentScriptIDTitle: '\u8FD9\u662F\u4EC0\u4E48\u811A\u672CID\uFF1F',
                            customSegmentScriptIDFooter: `\u60A8\u53EF\u4EE5\u5728NetSuite\u4E0B\u627E\u5230\u81EA\u5B9A\u4E49\u6BB5\u843D\u811A\u672CID\uFF1A\n\n1. *\u5B9A\u5236 > \u5217\u8868\u3001\u8BB0\u5F55\u3001& \u5B57\u6BB5 > \u81EA\u5B9A\u4E49\u6BB5\u843D*\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u6BB5\u843D\u3002\n3. \u70B9\u51FB\u5E95\u90E8\u9644\u8FD1\u7684*\u5E94\u7528\u548C\u6765\u6E90*\u6807\u7B7E\uFF0C\u7136\u540E\uFF1A\n    a. \u5982\u679C\u60A8\u60F3\u5728Expensify\u4E2D\u5C06\u81EA\u5B9A\u4E49\u6BB5\u843D\u663E\u793A\u4E3A*\u6807\u7B7E*\uFF08\u5728\u884C\u9879\u7EA7\u522B\uFF09\uFF0C\u8BF7\u70B9\u51FB*\u4EA4\u6613\u5217*\u5B50\u6807\u7B7E\u5E76\u4F7F\u7528*\u5B57\u6BB5ID*\u3002\n    b. \u5982\u679C\u60A8\u60F3\u5728Expensify\u4E2D\u5C06\u81EA\u5B9A\u4E49\u6BB5\u843D\u663E\u793A\u4E3A*\u62A5\u544A\u5B57\u6BB5*\uFF08\u5728\u62A5\u544A\u7EA7\u522B\uFF09\uFF0C\u8BF7\u70B9\u51FB*\u4EA4\u6613*\u5B50\u6807\u7B7E\u5E76\u4F7F\u7528*\u5B57\u6BB5ID*\u3002\n\n_\u8981\u83B7\u53D6\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7AD9\u70B9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_\u3002`,
                            customRecordScriptIDTitle: '\u8FD9\u662F\u4EC0\u4E48\u4EA4\u6613\u5217ID\uFF1F',
                            customRecordScriptIDFooter: `\u60A8\u53EF\u4EE5\u5728NetSuite\u4E0B\u627E\u5230\u81EA\u5B9A\u4E49\u8BB0\u5F55\u811A\u672CID\uFF1A\n\n1. \u5728\u5168\u7403\u641C\u7D22\u4E2D\u8F93\u5165"Transaction Line Fields"\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u8BB0\u5F55\u3002\n3. \u5728\u5DE6\u4FA7\u627E\u5230\u811A\u672CID\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7AD9\u70B9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_\u3002`,
                            customSegmentMappingTitle: '\u8FD9\u4E2A\u81EA\u5B9A\u4E49\u6BB5\u5E94\u8BE5\u5728Expensify\u4E2D\u5982\u4F55\u663E\u793A\uFF1F',
                            customRecordMappingTitle: '\u8FD9\u4E2A\u81EA\u5B9A\u4E49\u8BB0\u5F55\u5E94\u8BE5\u5728Expensify\u4E2D\u5982\u4F55\u663E\u793A\uFF1F',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) =>
                                `\u5177\u6709\u6B64${fieldName?.toLowerCase()}\u7684\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55\u5DF2\u7ECF\u5B58\u5728\u3002`,
                        },
                    },
                    customLists: {
                        title: '\u81EA\u5B9A\u4E49\u5217\u8868',
                        addText: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u5217\u8868',
                        recordTitle: '\u81EA\u5B9A\u4E49\u5217\u8868',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '\u67E5\u770B\u8BE6\u7EC6\u8BF4\u660E',
                        helpText: '\u5173\u4E8E\u914D\u7F6E\u81EA\u5B9A\u4E49\u5217\u8868\u3002',
                        emptyTitle: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u5217\u8868',
                        fields: {
                            listName: '\u540D\u79F0',
                            internalID: '\u5185\u90E8ID',
                            transactionFieldID: '\u4EA4\u6613\u5B57\u6BB5ID',
                            mapping: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                        },
                        removeTitle: '\u79FB\u9664\u81EA\u5B9A\u4E49\u5217\u8868',
                        removePrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u81EA\u5B9A\u4E49\u5217\u8868\u5417\uFF1F',
                        addForm: {
                            listNameTitle: '\u9009\u62E9\u4E00\u4E2A\u81EA\u5B9A\u4E49\u5217\u8868',
                            transactionFieldIDTitle: '\u4EC0\u4E48\u662F\u4EA4\u6613\u5B57\u6BB5ID\uFF1F',
                            transactionFieldIDFooter: `\u60A8\u53EF\u4EE5\u901A\u8FC7\u4EE5\u4E0B\u6B65\u9AA4\u5728NetSuite\u4E2D\u627E\u5230\u4EA4\u6613\u5B57\u6BB5ID\uFF1A\n\n1. \u5728\u5168\u7403\u641C\u7D22\u4E2D\u8F93\u5165"Transaction Line Fields"\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u5217\u8868\u3002\n3. \u5728\u5DE6\u4FA7\u627E\u5230\u4EA4\u6613\u5B57\u6BB5ID\u3002\n\n_\u8981\u83B7\u53D6\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7AD9\u70B9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_\u3002`,
                            mappingTitle: '\u8FD9\u4E2A\u81EA\u5B9A\u4E49\u5217\u8868\u5E94\u8BE5\u5982\u4F55\u5728Expensify\u4E2D\u663E\u793A\uFF1F',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `A custom list with this transaction field ID already exists.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite\u5458\u5DE5\u9ED8\u8BA4',
                        description: '\u672A\u5BFC\u5165\u81F3Expensify\uFF0C\u5E94\u7528\u4E8E\u5BFC\u51FA',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `\u5982\u679C\u60A8\u5728NetSuite\u4E2D\u4F7F\u7528${importField}\uFF0C\u6211\u4EEC\u5C06\u5728\u5BFC\u51FA\u5230\u8D39\u7528\u62A5\u544A\u6216\u65E5\u8BB0\u8D26\u6761\u76EE\u65F6\u5E94\u7528\u5458\u5DE5\u8BB0\u5F55\u4E0A\u7684\u9ED8\u8BA4\u8BBE\u7F6E\u3002`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '\u6807\u7B7E',
                        description: '\u884C\u9805\u7D1A\u5225',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '\u62A5\u544A\u5B57\u6BB5',
                        description: '\u62A5\u544A\u7EA7\u522B',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        nsqs: {
            setup: {
                title: 'NSQS\u8BBE\u7F6E',
                description: '\u8F93\u5165\u60A8\u7684 NSQS \u8D26\u6237 ID',
                formInputs: {
                    netSuiteAccountID: 'NSQS\u5E10\u6237ID',
                },
            },
            import: {
                expenseCategories: '\u8D39\u7528\u7C7B\u522B',
                expenseCategoriesDescription: 'NSQS\u8D39\u7528\u7C7B\u522B\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165Expensify\u3002',
                importTypes: {
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '\u6807\u7B7E',
                        description: '\u884C\u9805\u7D1A\u5225',
                    },
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '\u62A5\u544A\u5B57\u6BB5',
                        description: '\u62A5\u544A\u7EA7\u522B',
                    },
                },
                importFields: {
                    customers: {
                        title: '\u5BA2\u6237',
                        subtitle: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406NSQS *\u5BA2\u6237*\u3002',
                    },
                    projects: {
                        title: '\u9879\u76EE',
                        subtitle: '\u5728Expensify\u4E2D\u9009\u62E9\u5982\u4F55\u5904\u7406NSQS *\u9879\u76EE*\u3002',
                    },
                },
            },
            export: {
                description: '\u914D\u7F6E\u5982\u4F55\u5C06Expensify\u6570\u636E\u5BFC\u51FA\u5230NSQS\u3002',
                exportDate: {
                    label: '\u5BFC\u51FA\u65E5\u671F',
                    description: '\u5C06\u6B64\u65E5\u671F\u7528\u4E8E\u5BFC\u51FA\u62A5\u544A\u81F3 NSQS\u3002',
                    values: {
                        [CONST.NSQS_EXPORT_DATE.LAST_EXPENSE]: {
                            label: '\u4E0A\u6B21\u8D39\u7528\u7684\u65E5\u671F',
                            description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u4E00\u6B21\u8D39\u7528\u7684\u65E5\u671F\u3002',
                        },
                        [CONST.NSQS_EXPORT_DATE.EXPORTED]: {
                            label: '\u5BFC\u51FA\u65E5\u671F',
                            description: '\u62A5\u544A\u5BFC\u51FA\u5230NSQS\u7684\u65E5\u671F\u3002',
                        },
                        [CONST.NSQS_EXPORT_DATE.SUBMITTED]: {
                            label: '\u63D0\u4EA4\u65E5\u671F',
                            description: '\u63D0\u4EA4\u62A5\u544A\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                        },
                    },
                },
                expense: '\u8D39\u7528',
                reimbursableExpenses: '\u5C06\u53EF\u62A5\u9500\u7684\u8D39\u7528\u5BFC\u51FA\u4E3A',
                nonReimbursableExpenses: '\u5BFC\u51FA\u4E0D\u53EF\u62A5\u9500\u7684\u8D39\u7528\u4E3A',
            },
            advanced: {
                autoSyncDescription: '\u6BCF\u5929\u81EA\u52A8\u540C\u6B65 NSQS \u548C Expensify\u3002\u5B9E\u65F6\u5BFC\u51FA\u6700\u7EC8\u62A5\u544A',
                defaultApprovalAccount: 'NSQS\u9ED8\u8BA4',
                approvalAccount: 'A/P\u6279\u51C6\u8D26\u6237',
                approvalAccountDescription:
                    '\u5728NSQS\u4E2D\u9009\u62E9\u5C06\u5BF9\u4EA4\u6613\u8FDB\u884C\u6279\u51C6\u7684\u8D26\u6237\u3002\u5982\u679C\u60A8\u6B63\u5728\u540C\u6B65\u5DF2\u62A5\u9500\u7684\u62A5\u544A\uFF0C\u8FD9\u4E5F\u662F\u5C06\u521B\u5EFA\u8D26\u5355\u652F\u4ED8\u7684\u8D26\u6237\u3002',
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct \u8BBE\u7F6E',
            prerequisitesTitle: '\u5728\u4F60\u8FDE\u63A5\u4E4B\u524D...',
            downloadExpensifyPackage: '\u4E0B\u8F7D\u7528\u4E8E Sage Intacct \u7684 Expensify \u5305',
            followSteps: '\u6309\u7167\u6211\u4EEC\u7684\u64CD\u4F5C\u6307\u5357\uFF1A\u5982\u4F55\u8FDE\u63A5\u5230Sage Intacct\u7684\u6B65\u9AA4\u8FDB\u884C\u64CD\u4F5C',
            enterCredentials: '\u8F93\u5165\u60A8\u7684 Sage Intacct \u51ED\u8BC1',
            entity: '\u5B9E\u4F53',
            employeeDefault: 'Sage Intacct\u5458\u5DE5\u9ED8\u8BA4',
            employeeDefaultDescription:
                '\u5982\u679C\u5B58\u5728\uFF0C\u5458\u5DE5\u7684\u9ED8\u8BA4\u90E8\u95E8\u5C06\u5E94\u7528\u4E8E\u4ED6\u4EEC\u5728Sage Intacct\u7684\u8D39\u7528\u3002',
            displayedAsTagDescription: '\u6BCF\u4E2A\u5458\u5DE5\u7684\u62A5\u544A\u4E2D\uFF0C\u6BCF\u4E00\u9879\u8D39\u7528\u90FD\u53EF\u4EE5\u9009\u62E9\u90E8\u95E8\u3002',
            displayedAsReportFieldDescription: '\u90E8\u95E8\u9009\u62E9\u5C06\u9002\u7528\u4E8E\u5458\u5DE5\u62A5\u544A\u4E2D\u7684\u6240\u6709\u8D39\u7528\u3002',
            toggleImportTitleFirstPart: '\u9009\u62E9\u5982\u4F55\u5904\u7406 Sage Intacct',
            toggleImportTitleSecondPart: '\u5728Expensify\u4E2D\u3002',
            expenseTypes: '\u652F\u51FA\u7C7B\u578B',
            expenseTypesDescription: '\u60A8\u7684Sage Intacct\u8D39\u7528\u7C7B\u578B\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165Expensify\u3002',
            importTaxDescription: '\u4ECESage Intacct\u5BFC\u5165\u8D2D\u4E70\u7A0E\u7387\u3002',
            userDefinedDimensions: '\u7528\u6237\u5B9A\u4E49\u7684\u5C3A\u5BF8',
            addUserDefinedDimension: '\u6DFB\u52A0\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            integrationName: '\u96C6\u6210\u540D\u79F0',
            dimensionExists: '\u5177\u6709\u6B64\u540D\u79F0\u7684\u7EF4\u5EA6\u5DF2\u7ECF\u5B58\u5728\u3002',
            removeDimension: '\u79FB\u9664\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            removeDimensionPrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6\u5417\uFF1F',
            userDefinedDimension: '\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            addAUserDefinedDimension: '\u6DFB\u52A0\u4E00\u4E2A\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            detailedInstructionsLink: '\u67E5\u770B\u8BE6\u7EC6\u8BF4\u660E',
            detailedInstructionsRestOfSentence: '\u5728\u6DFB\u52A0\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6\u3002',
            userDimensionsAdded: () => ({
                one: '\u589E\u52A0\u4E861\u4E2AUDD',
                other: (count: number) => `\u5DF2\u6DFB\u52A0 ${count} \u4E2AUDD`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '\u90E8\u95E8';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '\u73ED\u7EA7';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '\u4F4D\u7F6E';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '\u5BA2\u6237';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '\u9879\u76EE\uFF08\u5DE5\u4F5C\uFF09';
                    default:
                        return '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002';
                }
            },
        },
        multiConnectionSelector: {
            title: ({connectionName}: ConnectionNameParams) => `\u8BBE\u7F6E${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            description: ({connectionName}: ConnectionNameParams) =>
                `\u9078\u64C7\u60A8\u7684${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}\u7248\u672C\u4EE5\u7E7C\u7E8C\u3002`,
        },
        type: {
            free: '\u514D\u8D39',
            control: '\u63A7\u5236',
            collect: '\u6536\u96C6',
        },
        companyCards: {
            addCards: '\u6DFB\u52A0\u5361\u7247',
            selectCards: '\u9009\u62E9\u5361\u7247',
            addNewCard: {
                other: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u60A8\u9700\u8981\u5C06\u6587\u672C\u4ECE\u54EA\u79CD\u8BED\u8A00\u7FFB\u8BD1\u6210\u4E2D\u6587\uFF1F\u53E6\u5916\uFF0C\u60A8\u9700\u8981\u7FFB\u8BD1\u7684\u5177\u4F53\u6587\u672C\u662F\u4EC0\u4E48\uFF1F\u8BF7\u63D0\u4F9B\u66F4\u591A\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u4EE5\u4FBF\u6211\u80FD\u66F4\u597D\u5730\u5E2E\u52A9\u60A8\u3002',
                cardProviders: {
                    gl1025: '\u7F8E\u570B\u904B\u901A\u516C\u53F8\u5361',
                    cdf: 'Mastercard \u5546\u4E1A\u5361',
                    vcf: 'Visa \u5546\u4E1A\u5361',
                    stripe: 'Stripe\u5361\u7247',
                },
                yourCardProvider: `Who's your card provider?`,
                whoIsYourBankAccount: '\u4F60\u7684\u94F6\u884C\u662F\u54EA\u5BB6\uFF1F',
                howDoYouWantToConnect: '\u60A8\u60F3\u5982\u4F55\u8FDE\u63A5\u5230\u60A8\u7684\u94F6\u884C\uFF1F',
                learnMoreAboutOptions: {
                    text: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u8FD9\u4E9B',
                    linkText:
                        '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u9700\u8981\u7FFB\u8BD1\u7684\u5185\u5BB9\u3002\u5982\u679C\u60A8\u9700\u8981\u7FFB\u8BD1\u67D0\u4E9B\u6587\u672C\uFF0C\u8BF7\u63D0\u4F9B\u5177\u4F53\u7684\u6587\u672C\u3002',
                },
                commercialFeedDetails:
                    '\u9700\u8981\u4E0E\u60A8\u7684\u94F6\u884C\u8FDB\u884C\u8BBE\u7F6E\u3002\u8FD9\u901A\u5E38\u7531\u8F83\u5927\u7684\u516C\u53F8\u4F7F\u7528\uFF0C\u5E76\u4E14\u5982\u679C\u60A8\u7B26\u5408\u6761\u4EF6\uFF0C\u8FD9\u901A\u5E38\u662F\u6700\u597D\u7684\u9009\u62E9\u3002',
                directFeedDetails:
                    '\u6700\u7B80\u5355\u7684\u65B9\u6CD5\u3002\u7ACB\u5373\u4F7F\u7528\u60A8\u7684\u4E3B\u8981\u51ED\u8BC1\u8FDB\u884C\u8FDE\u63A5\u3002\u8FD9\u79CD\u65B9\u6CD5\u6700\u4E3A\u5E38\u89C1\u3002',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `\u542F\u7528\u60A8\u7684${provider}\u6E90`,
                    heading:
                        '\u6211\u4EEC\u4E0E\u60A8\u7684\u53D1\u5361\u673A\u6784\u76F4\u63A5\u96C6\u6210\uFF0C\u53EF\u4EE5\u5FEB\u901F\u51C6\u786E\u5730\u5C06\u60A8\u7684\u4EA4\u6613\u6570\u636E\u5BFC\u5165Expensify\u3002\n\n\u8981\u5F00\u59CB\u4F7F\u7528\uFF0C\u53EA\u9700\uFF1A',
                    visa: '\u6211\u4EEC\u4E0EVisa\u6709\u5168\u7403\u6574\u5408\uFF0C\u5C3D\u7BA1\u8D44\u683C\u4F1A\u56E0\u94F6\u884C\u548C\u5361\u7247\u8BA1\u5212\u800C\u5F02\u3002\n\n\u8981\u5F00\u59CB\uFF0C\u53EA\u9700\uFF1A',
                    mastercard:
                        '\u6211\u4EEC\u5DF2\u7ECF\u4E0EMastercard\u8FDB\u884C\u4E86\u5168\u7403\u6574\u5408\uFF0C\u5C3D\u7BA1\u8D44\u683C\u4F1A\u56E0\u94F6\u884C\u548C\u5361\u7247\u8BA1\u5212\u800C\u5F02\u3002\n\n\u8981\u5F00\u59CB\uFF0C\u53EA\u9700\uFF1A',
                    vcf: `1. \u8BF7\u8BBF\u95EE[\u6B64\u5E2E\u52A9\u6587\u7AE0](${CONST.COMPANY_CARDS_HELP})\uFF0C\u4EE5\u83B7\u53D6\u5173\u4E8E\u5982\u4F55\u8BBE\u7F6E\u60A8\u7684Visa\u5546\u4E1A\u5361\u7684\u8BE6\u7EC6\u8BF4\u660E\u3002\n\n2. [\u8054\u7CFB\u60A8\u7684\u94F6\u884C](${CONST.COMPANY_CARDS_HELP})\u4EE5\u9A8C\u8BC1\u4ED6\u4EEC\u662F\u5426\u652F\u6301\u60A8\u7684\u7A0B\u5E8F\u7684\u5546\u4E1A\u4FE1\u606F\u6D41\uFF0C\u5E76\u8981\u6C42\u4ED6\u4EEC\u542F\u7528\u5B83\u3002\n\n3. *\u4E00\u65E6\u542F\u7528\u4E86\u4FE1\u606F\u6D41\u5E76\u4E14\u60A8\u5DF2\u7ECF\u4E86\u89E3\u4E86\u5176\u8BE6\u60C5\uFF0C\u7EE7\u7EED\u5230\u4E0B\u4E00\u4E2A\u5C4F\u5E55\u3002*`,
                    gl1025: `1. \u8BBF\u95EE[\u6B64\u5E2E\u52A9\u6587\u7AE0](${CONST.COMPANY_CARDS_HELP})\uFF0C\u4EE5\u67E5\u660E\u7F8E\u56FD\u8FD0\u901A\u662F\u5426\u53EF\u4EE5\u4E3A\u60A8\u7684\u7A0B\u5E8F\u542F\u7528\u5546\u4E1A\u4FE1\u606F\u6D41\u3002\n\n2. \u4E00\u65E6\u4FE1\u606F\u6D41\u88AB\u542F\u7528\uFF0C\u7F8E\u56FD\u8FD0\u901A\u5C06\u5411\u60A8\u53D1\u9001\u4E00\u5C01\u751F\u4EA7\u4FE1\u3002\n\n3. *\u4E00\u65E6\u60A8\u6709\u4E86\u4FE1\u606F\u6D41\u7684\u4FE1\u606F\uFF0C\u7EE7\u7EED\u5230\u4E0B\u4E00\u4E2A\u5C4F\u5E55\u3002*`,
                    cdf: `1. \u8BBF\u95EE[\u6B64\u5E2E\u52A9\u6587\u7AE0](${CONST.COMPANY_CARDS_HELP})\uFF0C\u4E86\u89E3\u5982\u4F55\u8BBE\u7F6E\u60A8\u7684\u4E07\u4E8B\u8FBE\u5546\u4E1A\u5361\u7684\u8BE6\u7EC6\u8BF4\u660E\u3002\n\n 2. [\u8054\u7CFB\u60A8\u7684\u94F6\u884C](${CONST.COMPANY_CARDS_HELP})\uFF0C\u9A8C\u8BC1\u4ED6\u4EEC\u662F\u5426\u652F\u6301\u60A8\u7684\u7A0B\u5E8F\u7684\u5546\u4E1A\u4FE1\u606F\u6D41\uFF0C\u5E76\u8981\u6C42\u4ED6\u4EEC\u542F\u7528\u5B83\u3002\n\n3. *\u4E00\u65E6\u542F\u7528\u4E86\u4FE1\u606F\u6D41\u5E76\u4E14\u60A8\u5DF2\u7ECF\u6709\u4E86\u5176\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u7EE7\u7EED\u5230\u4E0B\u4E00\u4E2A\u5C4F\u5E55\u3002*`,
                    stripe: `1. \u8BBF\u95EEStripe\u7684\u4EEA\u8868\u677F\uFF0C\u7136\u540E\u8F6C\u5230[\u8BBE\u7F6E](${CONST.COMPANY_CARDS_STRIPE_HELP})\u3002\n\n2. \u5728\u4EA7\u54C1\u96C6\u6210\u4E0B\uFF0C\u70B9\u51FBExpensify\u65C1\u8FB9\u7684\u542F\u7528\u3002\n\n3. \u4E00\u65E6\u542F\u7528\u4E86feed\uFF0C\u70B9\u51FB\u4E0B\u9762\u7684\u63D0\u4EA4\uFF0C\u6211\u4EEC\u5C06\u5F00\u59CB\u6DFB\u52A0\u5B83\u3002`,
                },
                whatBankIssuesCard: '\u8FD9\u4E9B\u5361\u662F\u7531\u54EA\u5BB6\u94F6\u884C\u53D1\u884C\u7684\uFF1F',
                enterNameOfBank: '\u8F93\u5165\u94F6\u884C\u540D\u79F0',
                feedDetails: {
                    vcf: {
                        title: 'Visa feed\u7684\u8A73\u60C5\u662F\u4EC0\u9EBC\uFF1F',
                        processorLabel: '\u5904\u7406\u5668ID',
                        bankLabel: '\u91D1\u878D\u673A\u6784\uFF08\u94F6\u884C\uFF09ID',
                        companyLabel: '\u516C\u53F8ID',
                        helpLabel: '\u6211\u5728\u54EA\u91CC\u53EF\u4EE5\u627E\u5230\u8FD9\u4E9BID\uFF1F',
                    },
                    gl1025: {
                        title: `What's the Amex delivery file name?`,
                        fileNameLabel: '\u4EA4\u4ED8\u6587\u4EF6\u540D',
                        helpLabel: '\u6211\u5728\u54EA\u91CC\u53EF\u4EE5\u627E\u5230\u9001\u8D27\u6587\u4EF6\u7684\u540D\u79F0\uFF1F',
                    },
                    cdf: {
                        title: `What's the Mastercard distribution ID?`,
                        distributionLabel: '\u5206\u53D1 ID',
                        helpLabel: '\u6211\u5728\u54EA\u91CC\u53EF\u4EE5\u627E\u5230\u5206\u53D1ID\uFF1F',
                    },
                },
                amexCorporate: '\u5982\u679C\u60A8\u7684\u5361\u7247\u6B63\u9762\u5199\u7740\u201CCorporate\u201D\uFF0C\u8BF7\u9009\u62E9\u6B64\u9879',
                amexBusiness: '\u5982\u679C\u60A8\u7684\u5361\u7247\u6B63\u9762\u5199\u7740\u201C\u5546\u4E1A\u201D\uFF0C\u8BF7\u9009\u62E9\u6B64\u9879',
                amexPersonal: '\u5982\u679C\u60A8\u7684\u5361\u7247\u662F\u79C1\u4EBA\u7684\uFF0C\u8ACB\u9078\u64C7\u6B64\u9078\u9805',
                error: {
                    pleaseSelectProvider: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u5BB6\u5361\u63D0\u4F9B\u5546\u3002',
                    pleaseSelectBankAccount: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u4E2A\u94F6\u884C\u8D26\u6237\u3002',
                    pleaseSelectBank: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u5BB6\u94F6\u884C\u3002',
                    pleaseSelectFeedType: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u4E2A\u8BA2\u9605\u7C7B\u578B\u3002',
                },
            },
            assignCard: '\u5206\u914D\u5361\u7247',
            cardNumber: '\u5361\u865F',
            commercialFeed: '\u5546\u4E1A\u9972\u6599',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} cards`,
            directFeed: '\u76F4\u63A5\u4F9B\u7ED9',
            whoNeedsCardAssigned: '\u8C01\u9700\u8981\u5206\u914D\u4E00\u5F20\u5361\uFF1F',
            chooseCard: '\u9009\u62E9\u4E00\u5F20\u5361\u7247',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `\u4ECE${feed}\u5361\u7247\u6E90\u4E2D\u4E3A${assignee}\u9009\u62E9\u4E00\u5F20\u5361\u7247\u3002`,
            noActiveCards: '\u6B64\u52A8\u6001\u4E2D\u6CA1\u6709\u6D3B\u52A8\u5361\u7247',
            somethingMightBeBroken:
                '\u6216\u8005\u53EF\u80FD\u6709\u4E9B\u4E1C\u897F\u574F\u4E86\u3002\u65E0\u8BBA\u5982\u4F55\uFF0C\u5982\u679C\u4F60\u6709\u4EFB\u4F55\u95EE\u9898\uFF0C\u53EA\u9700',
            contactConcierge: '\u8054\u7CFB\u793C\u5BBE\u670D\u52A1',
            chooseTransactionStartDate: '\u9009\u62E9\u4EA4\u6613\u5F00\u59CB\u65E5\u671F',
            startDateDescription:
                '\u6211\u4EEC\u5C06\u4ECE\u6B64\u65E5\u671F\u5F00\u59CB\u5BFC\u5165\u6240\u6709\u4EA4\u6613\u3002\u5982\u679C\u6CA1\u6709\u6307\u5B9A\u65E5\u671F\uFF0C\u6211\u4EEC\u5C06\u5C3D\u53EF\u80FD\u8FFD\u6EAF\u5230\u60A8\u7684\u94F6\u884C\u5141\u8BB8\u7684\u6700\u65E9\u65E5\u671F\u3002',
            fromTheBeginning: '\u4ECE\u4E00\u5F00\u59CB',
            customStartDate: '\u81EA\u5B9A\u4E49\u5F00\u59CB\u65E5\u671F',
            letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u4E0B\u6240\u6709\u7684\u4E1C\u897F\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
            confirmationDescription: '\u6211\u4EEC\u5C06\u7ACB\u5373\u5F00\u59CB\u5BFC\u5165\u4EA4\u6613\u3002',
            cardholder: '\u6301\u5361\u4EBA',
            card: '\u5361\u7247',
            cardName: '\u5361\u7247\u540D\u79F0',
            brokenConnectionErrorFirstPart: `Card feed connection is broken. Please `,
            brokenConnectionErrorLink: '\u767B\u5F55\u60A8\u7684\u94F6\u884C',
            brokenConnectionErrorSecondPart: '\u6240\u4EE5\u6211\u4EEC\u53EF\u4EE5\u518D\u6B21\u5EFA\u7ACB\u8FDE\u63A5\u3002',
            assignedCard: ({assignee, link}: AssignedCardParams) =>
                `\u5DF2\u5C06${link}\u5206\u914D\u7ED9${assignee}\uFF01\u5BFC\u5165\u7684\u4EA4\u6613\u5C06\u4F1A\u5728\u8FD9\u4E2A\u804A\u5929\u4E2D\u663E\u793A\u3002`,
            companyCard: '\u516C\u53F8\u5361',
            chooseCardFeed: '\u9009\u62E9\u5361\u7247\u6E90',
        },
        expensifyCard: {
            issueAndManageCards: '\u53D1\u884C\u5E76\u7BA1\u7406\u60A8\u7684Expensify\u5361',
            getStartedIssuing: '\u901A\u8FC7\u53D1\u884C\u60A8\u7684\u7B2C\u4E00\u5F20\u865A\u62DF\u6216\u5B9E\u4F53\u5361\u5F00\u59CB\u3002',
            verificationInProgress: '\u6B63\u5728\u8FDB\u884C\u9A8C\u8BC1...',
            verifyingTheDetails:
                '\u6211\u4EEC\u6B63\u5728\u6838\u5B9E\u4E00\u4E9B\u7EC6\u8282\u3002\u5F53Expensify\u5361\u51C6\u5907\u597D\u53D1\u884C\u65F6\uFF0C\u793C\u5BBE\u5C06\u4F1A\u901A\u77E5\u60A8\u3002',
            disclaimer:
                'Expensify Visa\u00AE \u5546\u4E1A\u5361\u7531 The Bancorp Bank, N.A.\u53D1\u884C\uFF0C\u662F FDIC \u7684\u6210\u5458\uFF0C\u6839\u636E Visa U.S.A. Inc.\u7684\u8BB8\u53EF\u8BC1\u53D1\u884C\uFF0C\u5E76\u4E14\u53EF\u80FD\u65E0\u6CD5\u5728\u6240\u6709\u63A5\u53D7 Visa \u5361\u7684\u5546\u5BB6\u4F7F\u7528\u3002Apple\u00AE \u548C Apple logo\u00AE \u662F Apple Inc.\u5728\u7F8E\u56FD\u548C\u5176\u4ED6\u56FD\u5BB6\u6CE8\u518C\u7684\u5546\u6807\u3002App Store \u662F Apple Inc.\u7684\u670D\u52A1\u6807\u8BB0\u3002Google Play \u548C Google Play logo \u662F Google LLC \u7684\u5546\u6807\u3002',
            issueCard: '\u53D1\u5361',
            newCard: '\u65B0\u5361\u7247',
            name: '\u540D\u79F0',
            lastFour: '\u6700\u540E4\u4E2A',
            limit: '\u9650\u5236',
            currentBalance: '\u5F53\u524D\u4F59\u989D',
            currentBalanceDescription:
                '\u5F53\u524D\u4F59\u989D\u662F\u81EA\u4E0A\u6B21\u7ED3\u7B97\u65E5\u671F\u4EE5\u6765\u53D1\u751F\u7684\u6240\u6709\u5DF2\u53D1\u5E03\u7684Expensify Card\u4EA4\u6613\u7684\u603B\u548C\u3002',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `\u4F59\u989D\u5C06\u5728 ${settlementDate} \u7ED3\u7B97`,
            settleBalance: '\u7ED3\u6E05\u4F59\u989D',
            cardLimit: '\u5361\u9650\u5236',
            remainingLimit: '\u5269\u4F59\u9650\u5236',
            requestLimitIncrease: '\u8BF7\u6C42\u589E\u52A0\u9650\u5236',
            remainingLimitDescription:
                '\u5728\u8BA1\u7B97\u60A8\u7684\u5269\u4F59\u989D\u5EA6\u65F6\uFF0C\u6211\u4EEC\u4F1A\u8003\u8651\u591A\u4E2A\u56E0\u7D20\uFF1A\u60A8\u4F5C\u4E3A\u5BA2\u6237\u7684\u8D44\u5386\uFF0C\u60A8\u5728\u6CE8\u518C\u65F6\u63D0\u4F9B\u7684\u4E0E\u4E1A\u52A1\u76F8\u5173\u7684\u4FE1\u606F\uFF0C\u4EE5\u53CA\u60A8\u7684\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u4E2D\u7684\u53EF\u7528\u73B0\u91D1\u3002\u60A8\u7684\u5269\u4F59\u989D\u5EA6\u53EF\u80FD\u4F1A\u6BCF\u5929\u6CE2\u52A8\u3002',
            earnedCashback: '\u73B0\u91D1\u8FD4\u8FD8',
            earnedCashbackDescription: '\u8FD4\u73B0\u4F59\u989D\u662F\u57FA\u4E8E\u60A8\u5DE5\u4F5C\u533A\u4E2D\u6BCF\u6708\u7ED3\u7B97\u7684Expensify\u5361\u6D88\u8D39\u3002',
            issueNewCard: '\u53D1\u884C\u65B0\u5361',
            finishSetup: '\u5B8C\u6210\u8BBE\u7F6E',
            chooseBankAccount: '\u9009\u62E9\u94F6\u884C\u8D26\u6237',
            chooseExistingBank:
                '\u9009\u62E9\u4E00\u4E2A\u73B0\u6709\u7684\u5546\u4E1A\u94F6\u884C\u8D26\u6237\u6765\u652F\u4ED8\u60A8\u7684Expensify\u5361\u4F59\u989D\uFF0C\u6216\u8005\u6DFB\u52A0\u4E00\u4E2A\u65B0\u7684\u94F6\u884C\u8D26\u6237',
            accountEndingIn: '\u4EE5\u7D50\u675F\u7684\u8CEC\u6236',
            addNewBankAccount: '\u6DFB\u52A0\u65B0\u7684\u94F6\u884C\u8D26\u6237',
            settlementAccount: '\u7ED3\u7B97\u8D26\u6237',
            settlementAccountDescription: '\u9009\u62E9\u4E00\u4E2A\u8D26\u6237\u6765\u652F\u4ED8\u60A8\u7684Expensify\u5361\u4F59\u989D\u3002',
            settlementAccountInfoPt1: '\u786E\u4FDD\u6B64\u8D26\u6237\u4E0E\u60A8\u7684\u5339\u914D',
            settlementAccountInfoPt2: '\u6240\u4EE5\u8FDE\u7EED\u5BF9\u8D26\u53EF\u4EE5\u6B63\u5E38\u5DE5\u4F5C\u3002',
            reconciliationAccount: '\u5BF9\u5E10\u8D26\u6237',
            settlementFrequency: '\u7ED3\u7B97\u9891\u7387',
            settlementFrequencyDescription: '\u9009\u62E9\u60A8\u5C06\u591A\u4E45\u652F\u4ED8\u4E00\u6B21\u60A8\u7684Expensify Card\u4F59\u989D\u3002',
            settlementFrequencyInfo:
                '\u5982\u679C\u60A8\u60F3\u5207\u6362\u5230\u6BCF\u6708\u7ED3\u7B97\uFF0C\u60A8\u9700\u8981\u901A\u8FC7Plaid\u8FDE\u63A5\u60A8\u7684\u94F6\u884C\u8D26\u6237\uFF0C\u5E76\u4FDD\u630190\u5929\u7684\u6B63\u5411\u4F59\u989D\u8BB0\u5F55\u3002',
            frequency: {
                daily: '\u6BCF\u65E5',
                monthly: '\u6BCF\u6708',
            },
            cardDetails: '\u5361\u7247\u8BE6\u60C5',
            virtual: '\u865A\u62DF',
            physical: '\u7269\u7406',
            deactivate: '\u505C\u7528\u5361\u7247',
            changeCardLimit: '\u66F4\u6539\u5361\u9650\u989D',
            changeLimit: '\u66F4\u6539\u9650\u5236',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u66F4\u6539\u4E3A${limit}\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\uFF0C\u76F4\u5230\u60A8\u6279\u51C6\u5361\u4E0A\u7684\u66F4\u591A\u8D39\u7528\u3002`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u66F4\u6539\u4E3A${limit}\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\uFF0C\u76F4\u5230\u4E0B\u4E2A\u6708\u3002`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u66F4\u6539\u4E3A${limit}\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\u3002`,
            changeCardLimitType: '\u66F4\u6539\u5361\u9650\u5236\u7C7B\u578B',
            changeLimitType: '\u66F4\u6539\u9650\u5236\u7C7B\u578B',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u7C7B\u578B\u66F4\u6539\u4E3A\u667A\u80FD\u9650\u989D\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u4F1A\u88AB\u62D2\u7EDD\uFF0C\u56E0\u4E3A${limit}\u7684\u672A\u6279\u51C6\u9650\u989D\u5DF2\u7ECF\u8FBE\u5230\u4E86\u3002`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u7C7B\u578B\u66F4\u6539\u4E3A\u6BCF\u6708\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u4F1A\u88AB\u62D2\u7EDD\uFF0C\u56E0\u4E3A${limit}\u7684\u6BCF\u6708\u9650\u989D\u5DF2\u7ECF\u8FBE\u5230\u3002`,
            addShippingDetails: '\u6DFB\u52A0\u8FD0\u8F93\u8BE6\u60C5',
            issuedCard: ({assignee}: AssigneeParams) =>
                `\u5DF2\u5411 ${assignee} \u53D1\u51FA\u4E00\u5F20Expensify\u5361\uFF01\u5361\u5C06\u57282-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8FBE\u3002`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `\u5DF2\u5411${assignee}\u53D1\u51FA\u4E00\u5F20Expensify\u5361\uFF01\u4E00\u65E6\u6DFB\u52A0\u4E86\u90AE\u5BC4\u8BE6\u60C5\uFF0C\u5361\u7247\u5C31\u4F1A\u88AB\u5BC4\u51FA\u3002`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) =>
                `\u5DF2\u5411${assignee}\u767C\u51FA\u4E00\u500B\u865B\u64EC\u7684${link}\uFF01\u8A72\u5361\u53EF\u4EE5\u7ACB\u5373\u4F7F\u7528\u3002`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            verifyingHeader:
                '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            bankAccountVerifiedHeader: '\u5DF2\u9A57\u8B49\u7684\u9280\u884C\u5E33\u6236',
            verifyingBankAccount: '\u6B63\u5728\u9A8C\u8BC1\u94F6\u884C\u8D26\u6237...',
            verifyingBankAccountDescription:
                '\u8BF7\u7B49\u5F85\uFF0C\u6211\u4EEC\u6B63\u5728\u786E\u8BA4\u6B64\u8D26\u6237\u662F\u5426\u53EF\u4EE5\u7528\u4E8E\u53D1\u884CExpensify\u5361\u3002',
            bankAccountVerified: '\u94F6\u884C\u8D26\u6237\u5DF2\u9A8C\u8BC1\uFF01',
            bankAccountVerifiedDescription: '\u60A8\u73B0\u5728\u53EF\u4EE5\u5411\u60A8\u7684\u5DE5\u4F5C\u7A7A\u95F4\u6210\u5458\u53D1\u653EExpensify\u5361\u3002',
            oneMoreStep: '\u518D\u8D70\u4E00\u6B65...',
            oneMoreStepDescription:
                '\u770B\u8D77\u6765\u6211\u4EEC\u9700\u8981\u624B\u52A8\u9A8C\u8BC1\u60A8\u7684\u94F6\u884C\u8D26\u6237\u3002\u8BF7\u524D\u5F80\u793C\u5BBE\u5904\uFF0C\u60A8\u7684\u6307\u793A\u6B63\u5728\u90A3\u91CC\u7B49\u5F85\u60A8\u3002',
            gotIt: "Sorry, but I can't assist with that.",
            goToConcierge: '\u53BB\u770B\u95E8\u4EBA',
        },
        categories: {
            deleteCategories: '\u5220\u9664\u7C7B\u522B',
            deleteCategoriesPrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u7C7B\u522B\u5417\uFF1F',
            deleteCategory: '\u5220\u9664\u7C7B\u522B',
            deleteCategoryPrompt: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u7C7B\u522B\u5417\uFF1F',
            disableCategories: '\u7981\u7528\u7C7B\u522B',
            disableCategory: '\u7981\u7528\u7C7B\u522B',
            enableCategories: '\u542F\u7528\u7C7B\u522B',
            enableCategory: '\u542F\u7528\u7C7B\u522B',
            defaultSpendCategories: '\u9ED8\u8BA4\u6D88\u8D39\u7C7B\u522B',
            spendCategoriesDescription:
                '\u81EA\u5B9A\u4E49\u5982\u4F55\u4E3A\u4FE1\u7528\u5361\u4EA4\u6613\u548C\u626B\u63CF\u6536\u636E\u7684\u5546\u5BB6\u652F\u51FA\u8FDB\u884C\u5206\u7C7B\u3002',
            deleteFailureMessage: '\u5220\u9664\u7C7B\u522B\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            categoryName: '\u5206\u7C7B\u540D\u79F0',
            requiresCategory: '\u6210\u5458\u5FC5\u987B\u5BF9\u6240\u6709\u8D39\u7528\u8FDB\u884C\u5206\u7C7B',
            needCategoryForExportToIntegration: '\u4E3A\u4E86\u5BFC\u51FA\uFF0C\u6BCF\u4E2A\u8D39\u7528\u90FD\u9700\u8981\u4E00\u4E2A\u7C7B\u522B',
            subtitle:
                '\u66F4\u597D\u5730\u4E86\u89E3\u94B1\u6B3E\u7684\u82B1\u8D39\u60C5\u51B5\u3002\u4F7F\u7528\u6211\u4EEC\u7684\u9ED8\u8BA4\u5206\u7C7B\u6216\u6DFB\u52A0\u60A8\u81EA\u5DF1\u7684\u5206\u7C7B\u3002',
            emptyCategories: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u7C7B\u522B',
                subtitle: '\u6DFB\u52A0\u4E00\u4E2A\u7C7B\u522B\u6765\u7EC4\u7EC7\u4F60\u7684\u82B1\u8D39\u3002',
            },
            updateFailureMessage: '\u66F4\u65B0\u7C7B\u522B\u65F6\u51FA\u73B0\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            createFailureMessage: '\u521B\u5EFA\u7C7B\u522B\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            addCategory: '\u6DFB\u52A0\u7C7B\u522B',
            editCategory: '\u7F16\u8F91\u7C7B\u522B',
            editCategories: '\u7F16\u8F91\u7C7B\u522B',
            categoryRequiredError: '\u5206\u7C7B\u540D\u79F0\u662F\u5FC5\u9700\u7684\u3002',
            existingCategoryError: '\u8FD9\u4E2A\u540D\u5B57\u7684\u7C7B\u522B\u5DF2\u7ECF\u5B58\u5728\u3002',
            invalidCategoryName: '\u65E0\u6548\u7684\u7C7B\u522B\u540D\u79F0\u3002',
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u7684\u7C7B\u522B\u662F\u4ECE\u60A8\u7684${username}\u5BFC\u5165\u7684',
            payrollCode: '\u5DE5\u8D44\u4EE3\u7801',
            updatePayrollCodeFailureMessage: '\u66F4\u65B0\u85AA\u8D44\u4EE3\u7801\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            glCode: 'GL\u4EE3\u7801',
            updateGLCodeFailureMessage: '\u66F4\u65B0GL\u4EE3\u7801\u65F6\u51FA\u73B0\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            importCategories: '\u5BFC\u5165\u7C7B\u522B',
        },
        moreFeatures: {
            subtitle:
                '\u5728\u4E0B\u9762\u7684\u5207\u63DB\u9375\u4E2D\u555F\u7528\u66F4\u591A\u529F\u80FD\u4EE5\u96A8\u8457\u60A8\u7684\u6210\u9577\u3002\u6BCF\u500B\u529F\u80FD\u90FD\u5C07\u51FA\u73FE\u5728\u5C0E\u822A\u83DC\u55AE\u4E2D\u4EE5\u9032\u4E00\u6B65\u81EA\u5B9A\u7FA9\u3002',
            spendSection: {
                title: '\u82B1\u8D39',
                subtitle: '\u542F\u7528\u5E2E\u52A9\u60A8\u6269\u5927\u56E2\u961F\u89C4\u6A21\u7684\u529F\u80FD\u3002',
            },
            manageSection: {
                title: '\u7BA1\u7406',
                subtitle: '\u6DFB\u52A0\u63A7\u5236\u4EE5\u5E2E\u52A9\u4FDD\u6301\u9884\u7B97\u5185\u7684\u652F\u51FA\u3002',
            },
            earnSection: {
                title: '\u8D5A\u53D6',
                subtitle: '\u7B80\u5316\u60A8\u7684\u6536\u5165\u5E76\u66F4\u5FEB\u5730\u83B7\u5F97\u652F\u4ED8\u3002',
            },
            organizeSection: {
                title: '\u7EC4\u7EC7',
                subtitle: '\u5206\u7EC4\u5E76\u5206\u6790\u652F\u51FA\uFF0C\u8BB0\u5F55\u6BCF\u4E00\u7B14\u5DF2\u652F\u4ED8\u7684\u7A0E\u6B3E\u3002',
            },
            integrateSection: {
                title: '\u6574\u5408',
                subtitle: '\u5C06Expensify\u8FDE\u63A5\u5230\u70ED\u95E8\u7684\u91D1\u878D\u4EA7\u54C1\u3002',
            },
            distanceRates: {
                title: '\u8DDD\u79BB\u8D39\u7387',
                subtitle: '\u6DFB\u52A0\uFF0C\u66F4\u65B0\u548C\u6267\u884C\u8D39\u7387\u3002',
            },
            perDiem: {
                title: '\u6BCF\u65E5',
                subtitle: '\u8BBE\u7F6E\u6BCF\u65E5\u8D39\u7528\u7387\u4EE5\u63A7\u5236\u5458\u5DE5\u7684\u65E5\u5E38\u652F\u51FA\u3002',
            },
            expensifyCard: {
                title: 'Expensify\u5361',
                subtitle: '\u83B7\u53D6\u652F\u51FA\u7684\u6D1E\u5BDF\u548C\u63A7\u5236\u3002',
                disableCardTitle: '\u7981\u7528 Expensify \u5361',
                disableCardPrompt:
                    '\u60A8\u65E0\u6CD5\u7981\u7528Expensify\u5361\uFF0C\u56E0\u4E3A\u5B83\u5DF2\u7ECF\u5728\u4F7F\u7528\u4E2D\u3002\u8BF7\u8054\u7CFBConcierge\u4EE5\u83B7\u53D6\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
                disableCardButton: '\u4E0E\u793C\u5BBE\u804A\u5929',
                feed: {
                    title: '\u83B7\u53D6Expensify\u5361',
                    subTitle: '\u7B80\u5316\u60A8\u7684\u5546\u4E1A\u652F\u51FA\uFF0C\u5E76\u5728\u60A8\u7684Expensify\u8D26\u5355\u4E0A\u8282\u7701\u9AD8\u8FBE50%\uFF0C\u53E6\u5916\uFF1A',
                    features: {
                        cashBack: '\u6BCF\u6B21\u7F8E\u56FD\u8D2D\u7269\u90FD\u53EF\u8FD4\u73B0',
                        unlimited: '\u65E0\u9650\u865A\u62DF\u5361',
                        spend: '\u6D88\u8D39\u63A7\u5236\u548C\u81EA\u5B9A\u4E49\u9650\u5236',
                    },
                    ctaTitle: '\u53D1\u884C\u65B0\u5361',
                },
            },
            companyCards: {
                title: '\u516C\u53F8\u5361\u7247',
                subtitle: '\u4ECE\u73B0\u6709\u516C\u53F8\u5361\u4E2D\u5BFC\u5165\u6D88\u8D39\u3002',
                feed: {
                    title: '\u5BFC\u5165\u516C\u53F8\u5361\u7247',
                    features: {
                        support: '\u652F\u6301\u6240\u6709\u4E3B\u8981\u7684\u5361\u63D0\u4F9B\u5546',
                        assignCards: '\u5C06\u5361\u7247\u5206\u914D\u7ED9\u6574\u4E2A\u56E2\u961F',
                        automaticImport: '\u81EA\u52A8\u4EA4\u6613\u5BFC\u5165',
                    },
                },
                disableCardTitle: '\u7981\u7528\u516C\u53F8\u5361\u7247',
                disableCardPrompt:
                    '\u60A8\u65E0\u6CD5\u7981\u7528\u516C\u53F8\u5361\u7247\uFF0C\u56E0\u4E3A\u6B64\u529F\u80FD\u6B63\u5728\u4F7F\u7528\u4E2D\u3002\u8BF7\u8054\u7CFB\u793C\u5BBE\u90E8\u4EE5\u83B7\u53D6\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
                disableCardButton: '\u4E0E\u793C\u5BBE\u804A\u5929',
                cardDetails: '\u5361\u7247\u8BE6\u60C5',
                cardNumber: '\u5361\u865F',
                cardholder: '\u6301\u5361\u4EBA',
                cardName: '\u5361\u7247\u540D\u79F0',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} export` : `${integration} export`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) =>
                    `\u9078\u64C7\u61C9\u5C07\u4EA4\u6613\u5C0E\u51FA\u5230\u54EA\u500B ${integration} \u5E33\u6236\u3002`,
                integrationExportTitlePart: '\u9009\u62E9\u4E00\u4E2A\u4E0D\u540C\u7684',
                integrationExportTitleLinkPart: '\u5BFC\u51FA\u9009\u9879',
                integrationExportTitleSecondPart: '\u66F4\u6539\u53EF\u7528\u7684\u5E33\u6236\u3002',
                lastUpdated: '\u6700\u540E\u66F4\u65B0',
                transactionStartDate: '\u4EA4\u6613\u5F00\u59CB\u65E5\u671F',
                updateCard: '\u66F4\u65B0\u5361\u7247',
                unassignCard: '\u53D6\u6D88\u5206\u914D\u5361\u7247',
                unassign: '\u53D6\u6D88\u5206\u914D',
                unassignCardDescription:
                    '\u53D6\u6D88\u5206\u914D\u6B64\u5361\u5C07\u5F9E\u5361\u6301\u6709\u4EBA\u7684\u5E33\u6236\u4E2D\u522A\u9664\u6240\u6709\u8349\u7A3F\u5831\u544A\u4E0A\u7684\u4EA4\u6613\u3002',
                assignCard: '\u5206\u914D\u5361\u7247',
                cardFeedName: '\u5361\u7247\u6E90\u540D\u79F0',
                cardFeedNameDescription:
                    '\u7ED9\u5361\u7247\u6E90\u4E00\u4E2A\u72EC\u7279\u7684\u540D\u5B57\uFF0C\u8FD9\u6837\u4F60\u5C31\u53EF\u4EE5\u628A\u5B83\u548C\u5176\u4ED6\u7684\u533A\u5206\u5F00\u6765\u3002',
                cardFeedTransaction: '\u5220\u9664\u4EA4\u6613',
                cardFeedTransactionDescription:
                    '\u9009\u62E9\u662F\u5426\u5141\u8BB8\u6301\u5361\u4EBA\u5220\u9664\u5361\u4EA4\u6613\u3002\u65B0\u7684\u4EA4\u6613\u5C06\u9075\u5FAA\u8FD9\u4E9B\u89C4\u5219\u3002',
                cardFeedRestrictDeletingTransaction: '\u9650\u5236\u5220\u9664\u4EA4\u6613',
                cardFeedAllowDeletingTransaction: '\u5141\u8BB8\u5220\u9664\u4EA4\u6613',
                removeCardFeed: '\u79FB\u9664\u5361\u7247\u4F9B\u7A3F',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `\u79FB\u9664 ${feedName} \u8CC7\u8A0A\u6E90`,
                removeCardFeedDescription:
                    '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5361\u7247\u52A8\u6001\u5417\uFF1F\u8FD9\u5C06\u53D6\u6D88\u6240\u6709\u5361\u7247\u7684\u5206\u914D\u3002',
                error: {
                    feedNameRequired: '\u5361\u7247\u6E90\u540D\u79F0\u662F\u5FC5\u9700\u7684\u3002',
                },
                corporate: '\u9650\u5236\u5220\u9664\u4EA4\u6613',
                personal: '\u5141\u8BB8\u5220\u9664\u4EA4\u6613',
                setFeedNameDescription:
                    '\u7ED9\u5361\u7247\u6E90\u4E00\u4E2A\u72EC\u7279\u7684\u540D\u5B57\uFF0C\u8FD9\u6837\u4F60\u5C31\u53EF\u4EE5\u628A\u5B83\u548C\u5176\u4ED6\u7684\u533A\u5206\u5F00\u6765\u3002',
                setTransactionLiabilityDescription:
                    '\u542F\u7528\u540E\uFF0C\u6301\u5361\u4EBA\u53EF\u4EE5\u5220\u9664\u5361\u4EA4\u6613\u3002\u65B0\u7684\u4EA4\u6613\u5C06\u9075\u5FAA\u6B64\u89C4\u5219\u3002',
                emptyAddedFeedTitle: '\u5206\u914D\u516C\u53F8\u5361\u7247',
                emptyAddedFeedDescription: '\u901A\u8FC7\u5C06\u60A8\u7684\u7B2C\u4E00\u5F20\u5361\u7247\u5206\u914D\u7ED9\u6210\u5458\u6765\u5F00\u59CB\u3002',
                pendingFeedTitle: `We're reviewing your request...`,
                pendingFeedDescription: `We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '\u68C0\u67E5\u4F60\u7684\u6D4F\u89C8\u5668\u7A97\u53E3',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `\u8BF7\u901A\u8FC7\u521A\u521A\u6253\u5F00\u7684\u6D4F\u89C8\u5668\u7A97\u53E3\u8FDE\u63A5\u5230${bankName}\u3002\u5982\u679C\u6CA1\u6709\u6253\u5F00\uFF0C`,
                pendingBankLink: '\u8BF7\u70B9\u51FB\u8FD9\u91CC\u3002',
                giveItNameInstruction: '\u7ED9\u8FD9\u5F20\u5361\u7247\u53D6\u4E00\u4E2A\u80FD\u8BA9\u5B83\u4E0E\u4F17\u4E0D\u540C\u7684\u540D\u5B57\u3002',
                updating: '\u66F4\u65B0\u4E2D...',
                noAccountsFound: '\u627E\u4E0D\u5230\u5E33\u6236',
                defaultCard: '\u9ED8\u8BA4\u5361\u7247',
                noAccountsFoundDescription: ({connection}: ConnectionParams) =>
                    `\u8BF7\u5728${connection}\u4E2D\u6DFB\u52A0\u8D26\u6237\uFF0C\u7136\u540E\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002`,
            },
            workflows: {
                title: '\u5DE5\u4F5C\u6D41\u7A0B',
                subtitle: '\u914D\u7F6E\u5982\u4F55\u6279\u51C6\u548C\u652F\u4ED8\u652F\u51FA\u3002',
            },
            invoices: {
                title: '\u53D1\u7968',
                subtitle: '\u53D1\u9001\u548C\u63A5\u6536\u53D1\u7968\u3002',
            },
            categories: {
                title: '\u5206\u7C7B',
                subtitle: '\u8FFD\u8E2A\u548C\u7EC4\u7EC7\u652F\u51FA\u3002',
            },
            tags: {
                title: '\u6807\u7B7E',
                subtitle: '\u5206\u7C7B\u6210\u672C\u5E76\u8DDF\u8E2A\u53EF\u8BA1\u8D39\u7684\u8D39\u7528\u3002',
            },
            taxes: {
                title: '\u7A0E',
                subtitle: '\u8BB0\u5F55\u5E76\u7533\u8BF7\u9000\u8FD8\u7B26\u5408\u6761\u4EF6\u7684\u7A0E\u6B3E\u3002',
            },
            reportFields: {
                title: '\u62A5\u544A\u5B57\u6BB5',
                subtitle: '\u8BBE\u7F6E\u81EA\u5B9A\u4E49\u82B1\u8D39\u5B57\u6BB5\u3002',
            },
            connections: {
                title: '\u6703\u8A08',
                subtitle: '\u540C\u6B65\u60A8\u7684\u4F1A\u8BA1\u79D1\u76EE\u8868\u7B49\u66F4\u591A\u5185\u5BB9\u3002',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '\u4E0D\u8981\u8FD9\u4E48\u5FEB...',
                featureEnabledText: '\u8981\u542F\u7528\u6216\u7981\u7528\u6B64\u529F\u80FD\uFF0C\u60A8\u9700\u8981\u66F4\u6539\u60A8\u7684\u4F1A\u8BA1\u5BFC\u5165\u8BBE\u7F6E\u3002',
                disconnectText: '\u8981\u7981\u7528\u4F1A\u8BA1\uFF0C\u60A8\u9700\u8981\u4ECE\u5DE5\u4F5C\u533A\u65AD\u5F00\u60A8\u7684\u4F1A\u8BA1\u8FDE\u63A5\u3002',
                manageSettings: '\u7BA1\u7406\u8BBE\u7F6E',
            },
            rules: {
                title: '\u898F\u5247',
                subtitle: '\u8981\u6C42\u6536\u636E\uFF0C\u6807\u8BB0\u9AD8\u6D88\u8D39\uFF0C\u7B49\u7B49\u3002',
            },
        },
        reportFields: {
            addField: '\u6DFB\u52A0\u5B57\u6BB5',
            delete: '\u5220\u9664\u5B57\u6BB5',
            deleteFields: '\u5220\u9664\u5B57\u6BB5',
            deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u62A5\u544A\u5B57\u6BB5\u5417\uFF1F',
            deleteFieldsConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u62A5\u544A\u5B57\u6BB5\u5417\uFF1F',
            emptyReportFields: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u62A5\u544A\u5B57\u6BB5',
                subtitle:
                    '\u6DFB\u52A0\u4E00\u4E2A\u81EA\u5B9A\u4E49\u5B57\u6BB5\uFF08\u6587\u672C\uFF0C\u65E5\u671F\uFF0C\u6216\u4E0B\u62C9\u83DC\u5355\uFF09\uFF0C\u8BE5\u5B57\u6BB5\u5C06\u663E\u793A\u5728\u62A5\u544A\u4E0A\u3002',
            },
            subtitle:
                '\u62A5\u544A\u5B57\u6BB5\u9002\u7528\u4E8E\u6240\u6709\u652F\u51FA\uFF0C\u5E76\u4E14\u5728\u60A8\u5E0C\u671B\u63D0\u793A\u989D\u5916\u4FE1\u606F\u65F6\u53EF\u80FD\u4F1A\u6709\u6240\u5E2E\u52A9\u3002',
            disableReportFields: '\u7981\u7528\u62A5\u544A\u5B57\u6BB5',
            disableReportFieldsConfirmation:
                '\u4F60\u786E\u5B9A\u5417\uFF1F\u6587\u672C\u548C\u65E5\u671F\u5B57\u6BB5\u5C06\u88AB\u5220\u9664\uFF0C\u5217\u8868\u5C06\u88AB\u7981\u7528\u3002',
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u7684\u62A5\u544A\u5B57\u6BB5\u662F\u4ECE\u60A8\u7684\u5BFC\u5165\u7684',
            textType: '\u6587\u672C',
            dateType: '\u65E5\u671F',
            dropdownType: '\u5217\u8868',
            textAlternateText: '\u6DFB\u52A0\u4E00\u4E2A\u514D\u8D39\u6587\u672C\u8F93\u5165\u5B57\u6BB5\u3002',
            dateAlternateText: '\u6DFB\u52A0\u4E00\u4E2A\u7528\u4E8E\u65E5\u671F\u9009\u62E9\u7684\u65E5\u5386\u3002',
            dropdownAlternateText: '\u6DFB\u52A0\u4E00\u4E2A\u53EF\u4F9B\u9009\u62E9\u7684\u9009\u9879\u5217\u8868\u3002',
            nameInputSubtitle: '\u4E3A\u62A5\u544A\u5B57\u6BB5\u9009\u62E9\u4E00\u4E2A\u540D\u79F0\u3002',
            typeInputSubtitle: '\u9009\u62E9\u8981\u4F7F\u7528\u7684\u62A5\u544A\u5B57\u6BB5\u7C7B\u578B\u3002',
            initialValueInputSubtitle: '\u5728\u62A5\u544A\u5B57\u6BB5\u4E2D\u8F93\u5165\u4E00\u4E2A\u8D77\u59CB\u503C\u3002',
            listValuesInputSubtitle:
                '\u8FD9\u4E9B\u503C\u5C06\u51FA\u73B0\u5728\u60A8\u7684\u62A5\u544A\u5B57\u6BB5\u4E0B\u62C9\u83DC\u5355\u4E2D\u3002\u542F\u7528\u7684\u503C\u53EF\u4EE5\u88AB\u6210\u5458\u9009\u62E9\u3002',
            listInputSubtitle:
                '\u8FD9\u4E9B\u503C\u5C06\u51FA\u73B0\u5728\u60A8\u7684\u62A5\u544A\u5B57\u6BB5\u5217\u8868\u4E2D\u3002\u5DF2\u542F\u7528\u7684\u503C\u53EF\u4EE5\u7531\u6210\u5458\u9009\u62E9\u3002',
            deleteValue: '\u5220\u9664\u503C',
            deleteValues: '\u5220\u9664\u503C',
            disableValue: '\u7981\u7528\u503C',
            disableValues: '\u7981\u7528\u503C',
            enableValue: '\u542F\u7528\u503C',
            enableValues: '\u542F\u7528\u503C',
            emptyReportFieldsValues: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u5217\u8868\u503C',
                subtitle: '\u5728\u62A5\u544A\u4E0A\u6DFB\u52A0\u81EA\u5B9A\u4E49\u503C\u3002',
            },
            deleteValuePrompt: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u5217\u8868\u503C\u5417\uFF1F',
            deleteValuesPrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u5217\u8868\u503C\u5417\uFF1F',
            listValueRequiredError: '\u8BF7\u8F93\u5165\u5217\u8868\u503C\u540D\u79F0',
            existingListValueError: '\u6B64\u540D\u79F0\u7684\u5217\u8868\u503C\u5DF2\u7ECF\u5B58\u5728',
            editValue: '\u7F16\u8F91\u503C',
            listValues: '\u5217\u51FA\u503C',
            addValue: '\u6DFB\u52A0\u503C',
            existingReportFieldNameError: '\u5177\u6709\u6B64\u540D\u79F0\u7684\u62A5\u544A\u5B57\u6BB5\u5DF2\u7ECF\u5B58\u5728',
            reportFieldNameRequiredError: '\u8BF7\u8F93\u5165\u62A5\u544A\u5B57\u6BB5\u540D\u79F0',
            reportFieldTypeRequiredError: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u62A5\u544A\u5B57\u6BB5\u7C7B\u578B',
            reportFieldInitialValueRequiredError: '\u8BF7\u9009\u62E9\u62A5\u544A\u5B57\u6BB5\u7684\u521D\u59CB\u503C',
            genericFailureMessage: '\u66F4\u65B0\u62A5\u544A\u5B57\u6BB5\u65F6\u51FA\u73B0\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        },
        tags: {
            tagName: '\u6807\u7B7E\u540D\u79F0',
            requiresTag: '\u6210\u5458\u5FC5\u987B\u6807\u8BB0\u6240\u6709\u8D39\u7528',
            trackBillable: '\u8FFD\u8E2A\u53EF\u8BA1\u8D39\u7684\u8D39\u7528',
            customTagName: '\u81EA\u5B9A\u4E49\u6807\u7B7E\u540D\u79F0',
            enableTag: '\u542F\u7528\u6807\u7B7E',
            enableTags: '\u542F\u7528\u6807\u7B7E',
            disableTag: '\u7981\u7528\u6807\u7B7E',
            disableTags: '\u7981\u7528\u6807\u7B7E',
            addTag: '\u6DFB\u52A0\u6807\u7B7E',
            editTag: '\u7F16\u8F91\u6807\u7B7E',
            editTags: '\u7F16\u8F91\u6807\u7B7E',
            subtitle: '\u6807\u7B7E\u63D0\u4F9B\u4E86\u66F4\u8BE6\u7EC6\u7684\u65B9\u5F0F\u6765\u5206\u7C7B\u6210\u672C\u3002',
            emptyTags: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u6807\u7B7E',
                subtitle: '\u6DFB\u52A0\u6807\u7B7E\u4EE5\u8DDF\u8E2A\u9879\u76EE\uFF0C\u4F4D\u7F6E\uFF0C\u90E8\u95E8\u7B49\u7B49\u3002',
            },
            deleteTag: '\u5220\u9664\u6807\u7B7E',
            deleteTags: '\u5220\u9664\u6807\u7B7E',
            deleteTagConfirmation: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u6807\u7B7E\u5417\uFF1F',
            deleteTagsConfirmation: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u6807\u7B7E\u5417\uFF1F',
            deleteFailureMessage: '\u5220\u9664\u6807\u7B7E\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            tagRequiredError: '\u9700\u8981\u6807\u7B7E\u540D\u79F0\u3002',
            existingTagError: '\u6B64\u540D\u79F0\u7684\u6807\u7B7E\u5DF2\u7ECF\u5B58\u5728\u3002',
            invalidTagNameError: '\u6807\u7B7E\u540D\u79F0\u4E0D\u80FD\u4E3A0\u3002\u8BF7\u9009\u62E9\u4E00\u4E2A\u4E0D\u540C\u7684\u503C\u3002',
            genericFailureMessage: '\u66F4\u65B0\u6807\u7B7E\u65F6\u51FA\u73B0\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u7684\u6807\u7B7E\u662F\u4ECE\u60A8\u7684${username}\u5BFC\u5165\u7684',
            glCode: 'GL\u4EE3\u7801',
            updateGLCodeFailureMessage: '\u66F4\u65B0GL\u4EE3\u7801\u65F6\u51FA\u73B0\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            tagRules: '\u6A19\u7C64\u898F\u5247',
            approverDescription: '\u5BA1\u6279\u4EBA',
            importTags: '\u5BFC\u5165\u6807\u7B7E',
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `\u6211\u4EEC\u5728\u60A8\u7684\u7535\u5B50\u8868\u683C\u4E2D\u627E\u5230\u4E86*${columnCounts}\u5217*\u3002\u9009\u62E9\u5305\u542B\u6807\u7B7E\u540D\u79F0\u7684\u5217\u65C1\u7684*\u540D\u79F0*\u3002\u60A8\u4E5F\u53EF\u4EE5\u9009\u62E9\u8BBE\u7F6E\u6807\u7B7E\u72B6\u6001\u7684\u5217\u65C1\u7684*\u542F\u7528*\u3002`,
        },
        taxes: {
            subtitle: '\u6DFB\u52A0\u7A0E\u6536\u540D\u79F0\uFF0C\u7A0E\u7387\uFF0C\u5E76\u8BBE\u7F6E\u9ED8\u8BA4\u503C\u3002',
            addRate: '\u6DFB\u52A0\u7387',
            workspaceDefault: '\u5DE5\u4F5C\u5340\u8CA8\u5E63\u9810\u8A2D',
            foreignDefault: '\u9ED8\u8BA4\u5916\u5E01',
            customTaxName: '\u81EA\u5B9A\u4E49\u7A0E\u540D',
            value: "Sorry, but you didn't provide any text to translate.",
            taxReclaimableOn: '\u53EF\u9000\u8FD8\u7684\u7A0E\u6B3E\u5728',
            taxRate: '\u7A0E\u7387',
            error: {
                taxRateAlreadyExists: '\u6B64\u7A05\u540D\u5DF2\u88AB\u4F7F\u7528\u3002',
                taxCodeAlreadyExists: '\u6B64\u7A05\u52D9\u4EE3\u78BC\u5DF2\u5728\u4F7F\u7528\u4E2D\u3002',
                valuePercentageRange: '\u8ACB\u8F38\u5165\u4E00\u500B\u6709\u6548\u7684\u767E\u5206\u6BD4\uFF0C\u7BC4\u570D\u57280\u5230100\u4E4B\u9593\u3002',
                customNameRequired: '\u9700\u8981\u81EA\u5B9A\u4E49\u7A0E\u6536\u540D\u79F0\u3002',
                deleteFailureMessage: '\u5220\u9664\u7A0E\u7387\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u5411\u793C\u5BBE\u90E8\u6C42\u52A9\u3002',
                updateFailureMessage: '\u66F4\u65B0\u7A05\u7387\u6642\u767C\u751F\u932F\u8AA4\u3002\u8ACB\u518D\u8A66\u4E00\u6B21\u6216\u5411\u79AE\u8CD3\u6C42\u52A9\u3002',
                createFailureMessage:
                    '\u521B\u5EFA\u7A0E\u7387\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u6216\u5411\u793C\u5BBE\u8BE2\u95EE\u4EE5\u83B7\u53D6\u5E2E\u52A9\u3002',
                updateTaxClaimableFailureMessage: '\u53EF\u56DE\u6536\u90E8\u5206\u5FC5\u987B\u5C0F\u4E8E\u8DDD\u79BB\u8D39\u7387\u91D1\u989D\u3002',
            },
            deleteTaxConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u9879\u7A0E\u52A1\u5417\uFF1F',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `\u60A8\u786E\u5B9A\u8981\u5220\u9664${taxAmount}\u7684\u7A0E\u6B3E\u5417\uFF1F`,
            actions: {
                delete: '\u5220\u9664\u7387',
                deleteMultiple: '\u5220\u9664\u7387',
                enable: '\u542F\u7528\u7387',
                disable: '\u7981\u7528\u7387',
                enableTaxRates: () => ({
                    one: '\u542F\u7528\u7387',
                    other: '\u542F\u7528\u8D39\u7387',
                }),
                disableTaxRates: () => ({
                    one: '\u7981\u7528\u7387',
                    other: '\u7981\u7528\u7387',
                }),
            },
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u7684\u7A0E\u9879\u662F\u4ECE\u60A8\u7684\u5BFC\u5165\u7684',
            taxCode: '\u7A0E\u52A1\u4EE3\u7801',
            updateTaxCodeFailureMessage: '\u66F4\u65B0\u7A0E\u7801\u65F6\u51FA\u73B0\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        },
        emptyWorkspace: {
            title: '\u521B\u5EFA\u4E00\u4E2A\u5DE5\u4F5C\u533A',
            subtitle:
                '\u521B\u5EFA\u4E00\u4E2A\u5DE5\u4F5C\u7A7A\u95F4\u6765\u8DDF\u8E2A\u6536\u636E\uFF0C\u62A5\u9500\u8D39\u7528\uFF0C\u7BA1\u7406\u65C5\u884C\uFF0C\u53D1\u9001\u53D1\u7968\u7B49\u7B49 - \u6240\u6709\u8FD9\u4E9B\u90FD\u4EE5\u804A\u5929\u7684\u901F\u5EA6\u8FDB\u884C\u3002',
            createAWorkspaceCTA: '\u5F00\u59CB',
            features: {
                trackAndCollect: '\u8FFD\u8E2A\u548C\u6536\u96C6\u6536\u636E',
                reimbursements: '\u62A5\u9500\u5458\u5DE5',
                companyCards: '\u7BA1\u7406\u516C\u53F8\u5361\u7247',
            },
            notFound: '\u627E\u4E0D\u5230\u5DE5\u4F5C\u5340',
            description:
                '\u623F\u95F4\u662F\u4E0E\u591A\u4EBA\u8BA8\u8BBA\u548C\u5DE5\u4F5C\u7684\u597D\u5730\u65B9\u3002\u8981\u5F00\u59CB\u534F\u4F5C\uFF0C\u8BF7\u521B\u5EFA\u6216\u52A0\u5165\u5DE5\u4F5C\u533A',
        },
        switcher: {
            headerTitle: '\u6309\u5DE5\u4F5C\u5340\u7BE9\u9078',
            everythingSection: '\u4E00\u5207',
            placeholder: '\u627E\u5230\u4E00\u4E2A\u5DE5\u4F5C\u7A7A\u95F4',
        },
        new: {
            newWorkspace: '\u65B0\u5DE5\u4F5C\u5340',
            getTheExpensifyCardAndMore: '\u83B7\u53D6Expensify\u5361\u548C\u66F4\u591A',
            confirmWorkspace: '\u78BA\u8A8D\u5DE5\u4F5C\u5340',
        },
        people: {
            genericFailureMessage: '\u4ECE\u5DE5\u4F5C\u533A\u5220\u9664\u6210\u5458\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `\u4F60\u786E\u5B9A\u8981\u5220\u9664${memberName}\u5417\uFF1F`,
                other: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u6210\u5458\u5417\uFF1F',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '\u79FB\u9664\u6210\u5458',
                other: '\u79FB\u9664\u6210\u5458',
            }),
            removeWorkspaceMemberButtonTitle: '\u4ECE\u5DE5\u4F5C\u533A\u79FB\u9664',
            removeGroupMemberButtonTitle: '\u4ECE\u7FA4\u7EC4\u4E2D\u79FB\u9664',
            removeRoomMemberButtonTitle: '\u4ECE\u804A\u5929\u4E2D\u79FB\u9664',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `\u4F60\u786E\u5B9A\u8981\u5220\u9664${memberName}\u5417\uFF1F`,
            removeMemberTitle: '\u79FB\u9664\u6210\u5458',
            transferOwner: '\u8F6C\u8BA9\u6240\u6709\u8005',
            makeMember: '\u5236\u4F5C\u6210\u5458',
            makeAdmin: '\u8BBE\u4E3A\u7BA1\u7406\u5458',
            makeAuditor: '\u5236\u4F5C\u5BA1\u8BA1\u5458',
            selectAll:
                "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u5360\u4F4D\u7B26\u5982 ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u6240\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
            error: {
                genericAdd: '\u6DFB\u52A0\u6B64\u5DE5\u4F5C\u7A7A\u95F4\u6210\u5458\u65F6\u51FA\u73B0\u95EE\u9898\u3002',
                cannotRemove: '\u60A8\u4E0D\u80FD\u79FB\u9664\u81EA\u5DF1\u6216\u5DE5\u4F5C\u7A7A\u95F4\u7684\u6240\u6709\u8005\u3002',
                genericRemove: '\u5220\u9664\u8BE5\u5DE5\u4F5C\u7A7A\u95F4\u6210\u5458\u65F6\u51FA\u73B0\u4E86\u95EE\u9898\u3002',
            },
            addedWithPrimary: '\u4E00\u4E9B\u6210\u5458\u5DF2\u7ECF\u901A\u8FC7\u4ED6\u4EEC\u7684\u4E3B\u8981\u767B\u5F55\u6DFB\u52A0\u3002',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `\u7531\u6B21\u8981\u767B\u5F55${secondaryLogin}\u6DFB\u52A0\u3002`,
            membersListTitle: '\u6240\u6709\u5DE5\u4F5C\u7A7A\u95F4\u6210\u5458\u7684\u76EE\u5F55\u3002',
            importMembers: '\u5BFC\u5165\u6210\u5458',
        },
        card: {
            getStartedIssuing: '\u901A\u8FC7\u53D1\u884C\u60A8\u7684\u7B2C\u4E00\u5F20\u865A\u62DF\u6216\u5B9E\u4F53\u5361\u5F00\u59CB\u3002',
            issueCard: '\u53D1\u5361',
            issueNewCard: {
                whoNeedsCard: '\u8C01\u9700\u8981\u4E00\u5F20\u5361\uFF1F',
                findMember: '\u67E5\u627E\u6210\u5458',
                chooseCardType: '\u9009\u62E9\u4E00\u79CD\u5361\u7247\u7C7B\u578B',
                physicalCard: '\u5B9E\u4F53\u5361',
                physicalCardDescription: '\u9002\u5408\u7ECF\u5E38\u6D88\u8D39\u7684\u4EBA',
                virtualCard: '\u865A\u62DF\u5361',
                virtualCardDescription: '\u5373\u65F6\u548C\u7075\u6D3B',
                chooseLimitType: '\u9009\u62E9\u4E00\u4E2A\u9650\u5236\u7C7B\u578B',
                smartLimit: '\u667A\u80FD\u9650\u5236',
                smartLimitDescription: '\u5728\u9700\u8981\u6279\u51C6\u4E4B\u524D\u82B1\u8D39\u6700\u591A\u5230\u4E00\u5B9A\u91D1\u989D',
                monthly: '\u6BCF\u6708',
                monthlyDescription: '\u6BCF\u6708\u82B1\u8D39\u5230\u4E00\u5B9A\u91D1\u989D',
                fixedAmount: '\u56FA\u5B9A\u91D1\u989D',
                fixedAmountDescription: '\u4E00\u6B21\u6027\u82B1\u8D39\u5230\u4E00\u5B9A\u91D1\u989D',
                setLimit: '\u8BBE\u5B9A\u9650\u5236',
                cardLimitError: '\u8ACB\u8F38\u5165\u4E00\u500B\u5C0F\u65BC $21,474,836 \u7684\u91D1\u984D',
                giveItName: '\u7ED9\u5B83\u4E00\u4E2A\u540D\u5B57',
                giveItNameInstruction:
                    '\u4F7F\u5176\u8DB3\u5920\u7368\u7279\uFF0C\u4EE5\u4FBF\u8207\u5176\u4ED6\u5361\u7247\u5340\u5206\u958B\u4F86\u3002\u5177\u9AD4\u7684\u4F7F\u7528\u6848\u4F8B\u751A\u81F3\u66F4\u597D\uFF01',
                cardName: '\u5361\u7247\u540D\u79F0',
                letsDoubleCheck: '\u8BA9\u6211\u4EEC\u518D\u6B21\u68C0\u67E5\u4E00\u4E0B\u6240\u6709\u7684\u4E1C\u897F\u770B\u8D77\u6765\u662F\u5426\u6B63\u786E\u3002',
                willBeReady: '\u6B64\u5361\u5C07\u7ACB\u5373\u53EF\u7528\u3002',
                cardholder: '\u6301\u5361\u4EBA',
                cardType: '\u5361\u7C7B\u578B',
                limit: '\u9650\u5236',
                limitType: '\u9650\u5236\u7C7B\u578B',
                name: '\u540D\u79F0',
            },
            deactivateCardModal: {
                deactivate: '\u505C\u7528',
                deactivateCard: '\u505C\u7528\u5361\u7247',
                deactivateConfirmation: '\u505C\u7528\u6B64\u5361\u5C07\u62D2\u7D55\u6240\u6709\u672A\u4F86\u7684\u4EA4\u6613\uFF0C\u4E26\u4E14\u7121\u6CD5\u64A4\u6D88\u3002',
            },
        },
        accounting: {
            settings: '\u8BBE\u7F6E',
            title: '\u8FDE\u63A5',
            subtitle:
                '\u8FDE\u63A5\u5230\u60A8\u7684\u4F1A\u8BA1\u7CFB\u7EDF\uFF0C\u4F7F\u7528\u60A8\u7684\u4F1A\u8BA1\u79D1\u76EE\u8868\u7F16\u7801\u4EA4\u6613\uFF0C\u81EA\u52A8\u5339\u914D\u4ED8\u6B3E\uFF0C\u5E76\u4FDD\u6301\u60A8\u7684\u8D22\u52A1\u540C\u6B65\u3002',
            qbo: '\u5728\u7EBFQuickBooks',
            qbd: 'QuickBooks\u684C\u9762\u7248',
            xero: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            netsuite: 'NetSuite',
            nsqs: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            intacct: 'Sage Intacct',
            talkYourOnboardingSpecialist: '\u4E0E\u60A8\u7684\u8BBE\u7F6E\u4E13\u5BB6\u804A\u5929\u3002',
            talkYourAccountManager: '\u4E0E\u60A8\u7684\u8D26\u6237\u7ECF\u7406\u804A\u5929\u3002',
            talkToConcierge: '\u4E0E\u793C\u5BBE\u90E8\u804A\u5929\u3002',
            needAnotherAccounting: '\u9700\u8981\u5176\u4ED6\u7684\u4F1A\u8BA1\u8F6F\u4EF6\u5417\uFF1F',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '\u5728\u7EBFQuickBooks';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u6216\u5220\u9664\u5B83\u4EEC\u7684\u5185\u5BB9\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: '\u5728Expensify Classic\u4E2D\u8BBE\u7F6E\u7684\u8FDE\u63A5\u51FA\u73B0\u4E86\u9519\u8BEF\u3002',
            goToODToFix: '\u53BBExpensify Classic\u4FEE\u590D\u8FD9\u4E2A\u95EE\u9898\u3002',
            goToODToSettings: '\u53BB Expensify Classic \u7BA1\u7406\u60A8\u7684\u8A2D\u7F6E\u3002',
            setup: '\u8FDE\u63A5',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `\u6700\u540E\u540C\u6B65 ${relativeDate}`,
            import: '\u5BFC\u5165',
            export: '\u5BFC\u51FA',
            advanced: "Sorry, but there's no text provided for translation. Please provide the text you want to translate.",
            other: '\u5176\u4ED6\u6574\u5408',
            syncNow: '\u7ACB\u5373\u540C\u6B65',
            disconnect: '\u65AD\u5F00\u8FDE\u63A5',
            reinstall: '\u91CD\u65B0\u5B89\u88C5\u8FDE\u63A5\u5668',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '\u6574\u5408';
                return `\u65AD\u5F00 ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `\u8FDE\u63A5 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '会计集成'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230QuickBooks Online\u3002';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230Xero\u3002';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230NetSuite\u3002';
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230NSQS\u3002';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230QuickBooks\u684C\u9762\u7248\u3002';
                    default: {
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230\u96C6\u6210\u3002';
                    }
                }
            },
            accounts: '\u4F1A\u8BA1\u79D1\u76EE\u8868',
            taxes: '\u7A0E',
            imported: '\u5BFC\u5165\u7684',
            notImported: '\u672A\u5BFC\u5165',
            importAsCategory: '\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '\u5BFC\u5165\u7684',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '\u4F5C\u4E3A\u6807\u7B7E\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '\u5BFC\u5165\u7684',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '\u672A\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '\u672A\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '\u4F5C\u4E3A\u62A5\u544A\u5B57\u6BB5\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite\u5458\u5DE5\u9ED8\u8BA4',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '\u8FD9\u4E2A\u96C6\u6210';
                return `\u60A8\u786E\u5B9A\u8981\u65AD\u5F00${integrationName}\u7684\u8FDE\u63A5\u5417\uFF1F`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `\u60A8\u786E\u5B9A\u8981\u8FDE\u63A5${
                    CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '此会计集成'
                }\u5417\uFF1F\u8FD9\u5C06\u5220\u9664\u6240\u6709\u73B0\u6709\u7684\u4F1A\u8BA1\u8FDE\u63A5\u3002`,
            enterCredentials: '\u8F93\u5165\u60A8\u7684\u51ED\u8BC1',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '\u5BFC\u5165\u5BA2\u6237';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '\u5BFC\u5165\u5458\u5DE5';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '\u5BFC\u5165\u8D26\u6237';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '\u5BFC\u5165\u7C7B';
                        case 'quickbooksOnlineImportLocations':
                            return '\u5BFC\u5165\u4F4D\u7F6E';
                        case 'quickbooksOnlineImportProcessing':
                            return '\u6B63\u5728\u5904\u7406\u5BFC\u5165\u7684\u6570\u636E';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '\u540C\u6B65\u5DF2\u62A5\u9500\u7684\u62A5\u544A\u548C\u8D26\u5355\u652F\u4ED8';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '\u5BFC\u5165\u7A0E\u7801';
                        case 'quickbooksOnlineCheckConnection':
                            return '\u68C0\u67E5 QuickBooks Online \u8FDE\u63A5';
                        case 'quickbooksOnlineImportMain':
                            return '\u5BFC\u5165QuickBooks\u5728\u7EBF\u6570\u636E';
                        case 'startingImportXero':
                            return '\u5BFC\u5165Xero\u6570\u636E';
                        case 'startingImportQBO':
                            return '\u5BFC\u5165QuickBooks\u5728\u7EBF\u6570\u636E';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '\u5BFC\u5165QuickBooks\u684C\u9762\u6570\u636E';
                        case 'quickbooksDesktopImportTitle':
                            return '\u5BFC\u5165\u6807\u9898';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '\u5BFC\u5165\u6279\u51C6\u8BC1\u4E66';
                        case 'quickbooksDesktopImportDimensions':
                            return '\u5BFC\u5165\u5C3A\u5BF8';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '\u5BFC\u5165\u4FDD\u5B58\u7B56\u7565';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '\u4ECD\u5728\u4E0EQuickBooks\u540C\u6B65\u6570\u636E... \u8BF7\u786E\u4FDDWeb Connector\u6B63\u5728\u8FD0\u884C';
                        case 'quickbooksOnlineSyncTitle':
                            return '\u540C\u6B65QuickBooks\u5728\u7EBF\u6570\u636E';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '\u6B63\u5728\u52A0\u8F7D\u6570\u636E';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '\u66F4\u65B0\u5206\u7C7B';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '\u66F4\u65B0\u5BA2\u6237/\u9879\u76EE';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '\u66F4\u65B0\u4EBA\u5458\u5217\u8868';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '\u66F4\u65B0\u62A5\u544A\u5B57\u6BB5';
                        case 'jobDone':
                            return '\u7B49\u5F85\u5BFC\u5165\u7684\u6570\u636E\u52A0\u8F7D';
                        case 'xeroSyncImportChartOfAccounts':
                            return '\u540C\u6B65\u8D26\u6237\u56FE\u8868';
                        case 'xeroSyncImportCategories':
                            return '\u540C\u6B65\u7C7B\u522B';
                        case 'xeroSyncImportCustomers':
                            return '\u540C\u6B65\u5BA2\u6237';
                        case 'xeroSyncXeroReimbursedReports':
                            return '\u5C06Expensify\u62A5\u544A\u6807\u8BB0\u4E3A\u5DF2\u62A5\u9500';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '\u6807\u8BB0Xero\u8D26\u5355\u548C\u53D1\u7968\u4E3A\u5DF2\u4ED8\u6B3E';
                        case 'xeroSyncImportTrackingCategories':
                            return '\u540C\u6B65\u8DDF\u8E2A\u7C7B\u522B';
                        case 'xeroSyncImportBankAccounts':
                            return '\u540C\u6B65\u94F6\u884C\u8D26\u6237';
                        case 'xeroSyncImportTaxRates':
                            return '\u540C\u6B65\u7A05\u7387';
                        case 'xeroCheckConnection':
                            return '\u68C0\u67E5Xero\u8FDE\u63A5';
                        case 'xeroSyncTitle':
                            return '\u540C\u6B65Xero\u6570\u636E';
                        case 'netSuiteSyncConnection':
                            return '\u521D\u59CB\u5316\u8FDE\u63A5\u5230NetSuite';
                        case 'netSuiteSyncCustomers':
                            return '\u5BFC\u5165\u5BA2\u6237';
                        case 'netSuiteSyncInitData':
                            return '\u4ECENetSuite\u83B7\u53D6\u6570\u636E';
                        case 'netSuiteSyncImportTaxes':
                            return '\u8FDB\u53E3\u7A0E';
                        case 'netSuiteSyncImportItems':
                            return '\u5BFC\u5165\u9879\u76EE';
                        case 'netSuiteSyncData':
                            return '\u5C06\u6570\u636E\u5BFC\u5165Expensify';
                        case 'netSuiteSyncAccounts':
                        case 'nsqsSyncAccounts':
                            return '\u540C\u6B65\u8D26\u6237';
                        case 'netSuiteSyncCurrencies':
                            return '\u540C\u6B65\u8D27\u5E01';
                        case 'netSuiteSyncCategories':
                            return '\u540C\u6B65\u7C7B\u522B';
                        case 'netSuiteSyncReportFields':
                            return '\u4F5C\u70BAExpensify\u5831\u544A\u5B57\u6BB5\u5C0E\u5165\u6578\u64DA';
                        case 'netSuiteSyncTags':
                            return '\u4F5C\u70BAExpensify\u6A19\u7C64\u5C0E\u5165\u6578\u64DA';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '\u66F4\u65B0\u8FDE\u63A5\u4FE1\u606F';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '\u5C06Expensify\u62A5\u544A\u6807\u8BB0\u4E3A\u5DF2\u62A5\u9500';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '\u6807\u8BB0NetSuite\u7684\u8D26\u5355\u548C\u53D1\u7968\u4E3A\u5DF2\u4ED8\u6B3E';
                        case 'netSuiteImportVendorsTitle':
                            return '\u5BFC\u5165\u4F9B\u5E94\u5546';
                        case 'netSuiteImportCustomListsTitle':
                            return '\u5BFC\u5165\u81EA\u5B9A\u4E49\u5217\u8868';
                        case 'netSuiteSyncImportCustomLists':
                            return '\u5BFC\u5165\u81EA\u5B9A\u4E49\u5217\u8868';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '\u5BFC\u5165\u5B50\u516C\u53F8';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '\u5BFC\u5165\u4F9B\u5E94\u5546';
                        case 'nsqsSyncConnection':
                            return '\u521D\u59CB\u5316\u8FDE\u63A5\u5230NSQS';
                        case 'nsqsSyncEmployees':
                            return '\u540C\u6B65\u54E1\u5DE5';
                        case 'nsqsSyncCustomers':
                            return '\u540C\u6B65\u5BA2\u6237';
                        case 'nsqsSyncProjects':
                            return '\u540C\u6B65\u9879\u76EE';
                        case 'nsqsSyncCurrency':
                            return '\u540C\u6B65\u8D27\u5E01';
                        case 'intacctCheckConnection':
                            return '\u68C0\u67E5 Sage Intacct \u8FDE\u63A5';
                        case 'intacctImportDimensions':
                            return '\u5BFC\u5165 Sage Intacct \u7EF4\u5EA6';
                        case 'intacctImportTitle':
                            return '\u5BFC\u5165 Sage Intacct \u6570\u636E';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `\u7F3A\u5C11\u968E\u6BB5\u7684\u7FFB\u8B6F\uFF1A${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '\u9996\u9009\u51FA\u53E3\u5546',
            exportPreferredExporterNote:
                '\u9996\u9009\u7684\u5BFC\u51FA\u8005\u53EF\u4EE5\u662F\u4EFB\u4F55\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\uFF0C\u4F46\u5982\u679C\u60A8\u5728\u57DF\u8BBE\u7F6E\u4E2D\u4E3A\u5404\u4E2A\u516C\u53F8\u5361\u8BBE\u7F6E\u4E86\u4E0D\u540C\u7684\u5BFC\u51FA\u8D26\u6237\uFF0C\u90A3\u4E48\u4ED6\u4E5F\u5FC5\u987B\u662F\u57DF\u7BA1\u7406\u5458\u3002',
            exportPreferredExporterSubNote:
                '\u4E00\u65E6\u8BBE\u7F6E\uFF0C\u9996\u9009\u7684\u5BFC\u51FA\u8005\u5C06\u5728\u4ED6\u4EEC\u7684\u8D26\u6237\u4E2D\u770B\u5230\u5BFC\u51FA\u7684\u62A5\u544A\u3002',
            exportAs: '\u5BFC\u51FA\u4E3A',
            exportOutOfPocket: '\u5C06\u81EA\u4ED8\u8D39\u7528\u5BFC\u51FA\u4E3A',
            exportCompanyCard: '\u5C06\u516C\u53F8\u5361\u8D39\u7528\u5BFC\u51FA\u4E3A',
            exportDate: '\u5BFC\u51FA\u65E5\u671F',
            defaultVendor: '\u9ED8\u8BA4\u4F9B\u5E94\u5546',
            autoSync: '\u81EA\u52A8\u540C\u6B65',
            autoSyncDescription: '\u6BCF\u5929\u81EA\u52A8\u540C\u6B65NetSuite\u548CExpensify\u3002\u5B9E\u65F6\u5BFC\u51FA\u6700\u7EC8\u62A5\u544A',
            reimbursedReports: '\u540C\u6B65\u62A5\u9500\u62A5\u544A',
            cardReconciliation: '\u5361\u7247\u5BF9\u8D26',
            reconciliationAccount: '\u5BF9\u5E10\u8D26\u6237',
            continuousReconciliation: '\u6301\u7EED\u5BF9\u8D26',
            saveHoursOnReconciliation:
                '\u901A\u8FC7\u8BA9Expensify\u6301\u7EED\u4E3A\u60A8\u5BF9\u8D26Expensify\u5361\u7684\u5BF9\u8D26\u5355\u548C\u7ED3\u7B97\uFF0C\u6BCF\u4E2A\u4F1A\u8BA1\u671F\u90FD\u53EF\u4EE5\u8282\u7701\u6570\u5C0F\u65F6\u7684\u5BF9\u8D26\u65F6\u95F4\u3002',
            enableContinuousReconciliation: "\u4E3A\u4E86\u542F\u7528\u8FDE\u7EED\u5BF9\u8D26\uFF0C\u8BF7\u542F\u7528 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}",
            chooseReconciliationAccount: {
                chooseBankAccount: '\u9009\u62E9\u60A8\u7684Expensify Card\u4ED8\u6B3E\u5C06\u4E0E\u4E4B\u5BF9\u8D26\u7684\u94F6\u884C\u8D26\u6237\u3002',
                accountMatches: '\u786E\u4FDD\u6B64\u8D26\u6237\u4E0E\u60A8\u7684${username}\u5339\u914D',
                settlementAccount: 'Expensify\u5361\u7ED3\u7B97\u8D26\u6237',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) =>
                    `(\u7D50\u5C3E\u70BA ${lastFourPAN}) \u4EE5\u78BA\u4FDD\u9023\u7E8C\u5C0D\u5E33\u80FD\u6B63\u5E38\u904B\u4F5C\u3002`,
            },
        },
        export: {
            notReadyHeading:
                "\u8FD9\u662F\u4E00\u6BB5\u666E\u901A\u7684\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            notReadyDescription:
                '\u8349\u7A3F\u6216\u5F85\u5904\u7406\u7684\u8D39\u7528\u62A5\u544A\u65E0\u6CD5\u5BFC\u51FA\u5230\u4F1A\u8BA1\u7CFB\u7EDF\u3002\u8BF7\u5728\u5BFC\u51FA\u5B83\u4EEC\u4E4B\u524D\u6279\u51C6\u6216\u652F\u4ED8\u8FD9\u4E9B\u8D39\u7528\u3002',
        },
        invoices: {
            sendInvoice: '\u53D1\u9001\u53D1\u7968',
            sendFrom: '\u4ECE\u53D1\u9001',
            invoicingDetails: '\u53D1\u7968\u8BE6\u60C5',
            invoicingDetailsDescription: '\u6B64\u4FE1\u606F\u5C06\u51FA\u73B0\u5728\u60A8\u7684\u53D1\u7968\u4E0A\u3002',
            companyName: '\u516C\u53F8\u540D\u79F0',
            companyWebsite: '\u516C\u53F8\u7F51\u7AD9',
            paymentMethods: {
                personal:
                    '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u6216\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002',
                business: '\u5546\u4E1A',
                chooseInvoiceMethod: '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u7684\u4ED8\u6B3E\u65B9\u5F0F\uFF1A',
                addBankAccount: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
                payingAsIndividual: '\u4F5C\u70BA\u500B\u4EBA\u652F\u4ED8',
                payingAsBusiness: '\u4F5C\u4E3A\u4F01\u4E1A\u4ED8\u6B3E',
            },
            invoiceBalance: '\u53D1\u7968\u4F59\u989D',
            invoiceBalanceSubtitle:
                '\u8FD9\u662F\u60A8\u6536\u53D6\u53D1\u7968\u4ED8\u6B3E\u7684\u5F53\u524D\u4F59\u989D\u3002\u5982\u679C\u60A8\u5DF2\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\uFF0C\u5B83\u5C06\u81EA\u52A8\u8F6C\u8D26\u5230\u60A8\u7684\u94F6\u884C\u8D26\u6237\u3002',
            bankAccountsSubtitle: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4EE5\u8FDB\u884C\u53D1\u7968\u652F\u4ED8\u548C\u63A5\u6536\u6B3E\u9879\u3002',
        },
        invite: {
            member: '\u9080\u8BF7\u6210\u5458',
            members: '\u9080\u8BF7\u6210\u5458',
            invitePeople: '\u9080\u8BF7\u65B0\u6210\u5458',
            genericFailureMessage: '\u9080\u8BF7\u6210\u5458\u52A0\u5165\u5DE5\u4F5C\u533A\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            pleaseEnterValidLogin: `\u8BF7\u786E\u4FDD\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801\u6709\u6548\uFF08\u4F8B\u5982\uFF0C${CONST.EXAMPLE_PHONE_NUMBER}\uFF09\u3002`,
            user: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that needs to be translated?',
            users: '\u7528\u6237',
            invited: '\u9080\u8BF7\u4E86',
            removed: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            to: 'As an AI, I need more specific information about the language you want the text to be translated into. "ch" is not a recognized language code. Please provide the correct language code or the full name of the language.',
            from: "I'm sorry, but you didn't provide any text to translate. Please provide the text or TypeScript function that you want translated.",
        },
        inviteMessage: {
            confirmDetails: '\u786E\u8BA4\u8BE6\u7EC6\u4FE1\u606F',
            inviteMessagePrompt: '\u901A\u8FC7\u5728\u4E0B\u65B9\u6DFB\u52A0\u4FE1\u606F\uFF0C\u4F7F\u60A8\u7684\u9080\u8BF7\u66F4\u52A0\u7279\u522B\uFF01',
            personalMessagePrompt: '\u4FE1\u606F',
            genericFailureMessage: '\u9080\u8BF7\u6210\u5458\u52A0\u5165\u5DE5\u4F5C\u533A\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            inviteNoMembersError: '\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u4F4D\u6210\u5458\u6765\u9080\u8BF7\u3002',
        },
        distanceRates: {
            oopsNotSoFast: '\u54CE\u5440\uFF01\u522B\u8FD9\u4E48\u5FEB...',
            workspaceNeeds: '\u4E00\u500B\u5DE5\u4F5C\u5340\u81F3\u5C11\u9700\u8981\u4E00\u500B\u555F\u7528\u7684\u8DDD\u96E2\u7387\u3002',
            distance: '\u8DDD\u79BB',
            centrallyManage: '\u96C6\u4E2D\u7BA1\u7406\u8D39\u7387\uFF0C\u4EE5\u82F1\u91CC\u6216\u516C\u91CC\u8DDF\u8E2A\uFF0C\u5E76\u8BBE\u7F6E\u9ED8\u8BA4\u7C7B\u522B\u3002',
            rate: '\u8BC4\u4EF7',
            addRate: '\u6DFB\u52A0\u7387',
            trackTax: '\u8FFD\u8E2A\u7A0E\u52A1',
            deleteRates: () => ({
                one: '\u5220\u9664\u7387',
                other: '\u5220\u9664\u7387',
            }),
            enableRates: () => ({
                one: '\u542F\u7528\u7387',
                other: '\u542F\u7528\u8D39\u7387',
            }),
            disableRates: () => ({
                one: '\u7981\u7528\u7387',
                other: '\u7981\u7528\u7387',
            }),
            enableRate: '\u542F\u7528\u7387',
            status: '\u72B6\u6001',
            unit: '\u55AE\u4F4D',
            taxFeatureNotEnabledMessage: '\u5FC5\u987B\u5728\u5DE5\u4F5C\u533A\u542F\u7528\u7A0E\u52A1\u529F\u80FD\u624D\u80FD\u4F7F\u7528\u6B64\u529F\u80FD\u3002\u8BF7\u524D\u5F80',
            changePromptMessage: '\u8FDB\u884C\u8BE5\u66F4\u6539\u3002',
            deleteDistanceRate: '\u5220\u9664\u8DDD\u79BB\u7387',
            areYouSureDelete: () => ({
                one: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u8D39\u7387\u5417\uFF1F',
                other: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u8D39\u7387\u5417\uFF1F',
            }),
        },
        editor: {
            descriptionInputLabel: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            nameInputLabel: '\u540D\u79F0',
            typeInputLabel: "Sorry, but you haven't provided any text to translate. Please provide the text you want translated.",
            initialValueInputLabel: '\u521D\u59CB\u503C',
            nameInputHelpText: '\u8FD9\u662F\u60A8\u5728\u5DE5\u4F5C\u533A\u5C06\u770B\u5230\u7684\u540D\u79F0\u3002',
            nameIsRequiredError: '\u60A8\u9700\u8981\u4E3A\u60A8\u7684\u5DE5\u4F5C\u7A7A\u95F4\u547D\u540D\u3002',
            currencyInputLabel: '\u9ED8\u8BA4\u8D27\u5E01',
            currencyInputHelpText: '\u6B64\u5DE5\u4F5C\u5340\u7684\u6240\u6709\u8CBB\u7528\u5C07\u88AB\u8F49\u63DB\u70BA\u6B64\u8CA8\u5E63\u3002',
            currencyInputDisabledText:
                '\u9ED8\u8BA4\u8D27\u5E01\u65E0\u6CD5\u66F4\u6539\uFF0C\u56E0\u4E3A\u6B64\u5DE5\u4F5C\u533A\u5DF2\u94FE\u63A5\u5230\u4E00\u4E2A\u7F8E\u5143\u94F6\u884C\u8D26\u6237\u3002',
            save: '\u4FDD\u5B58',
            genericFailureMessage: '\u66F4\u65B0\u5DE5\u4F5C\u7A7A\u95F4\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            avatarUploadFailureMessage: '\u4E0A\u4F20\u5934\u50CF\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            addressContext:
                '\u9700\u8981\u4E00\u4E2A\u5DE5\u4F5C\u533A\u5730\u5740\u624D\u80FD\u542F\u7528Expensify Travel\u3002\u8BF7\u8F93\u5165\u4E0E\u60A8\u7684\u4E1A\u52A1\u76F8\u5173\u8054\u7684\u5730\u5740\u3002',
        },
        bankAccount: {
            continueWithSetup: '\u7EE7\u7EED\u8BBE\u7F6E',
            youreAlmostDone:
                '\u60A8\u5DF2\u7ECF\u5FEB\u8981\u5B8C\u6210\u94F6\u884C\u8D26\u6237\u7684\u8BBE\u7F6E\u4E86\uFF0C\u8FD9\u5C06\u8BA9\u60A8\u80FD\u591F\u53D1\u653E\u516C\u53F8\u5361\uFF0C\u62A5\u9500\u8D39\u7528\uFF0C\u6536\u96C6\u53D1\u7968\uFF0C\u5E76\u652F\u4ED8\u8D26\u5355\u3002',
            streamlinePayments: '\u7B80\u5316\u4ED8\u6B3E',
            connectBankAccountNote: '\u6CE8\u610F\uFF1A\u4E2A\u4EBA\u94F6\u884C\u8D26\u6237\u4E0D\u80FD\u7528\u4E8E\u5DE5\u4F5C\u533A\u7684\u4ED8\u6B3E\u3002',
            oneMoreThing: '\u518D\u591A\u4E00\u4EF6\u4E8B\uFF01',
            allSet: '\u4F60\u5DF2\u7ECF\u51C6\u5907\u597D\u4E86\uFF01',
            accountDescriptionWithCards:
                '\u6B64\u9280\u884C\u5E33\u6236\u5C07\u7528\u65BC\u767C\u884C\u516C\u53F8\u5361\uFF0C\u5831\u92B7\u8CBB\u7528\uFF0C\u6536\u96C6\u767C\u7968\u548C\u652F\u4ED8\u8CEC\u55AE\u3002',
            letsFinishInChat: '\u8BA9\u6211\u4EEC\u5728\u804A\u5929\u4E2D\u7ED3\u675F\u5427\uFF01',
            almostDone: '\u5DEE\u4E0D\u591A\u5B8C\u6210\u4E86\uFF01',
            disconnectBankAccount: '\u65AD\u5F00\u94F6\u884C\u8D26\u6237',
            noLetsStartOver: '\u4E0D\uFF0C\u8BA9\u6211\u4EEC\u91CD\u65B0\u5F00\u59CB',
            startOver: '\u91CD\u65B0\u5F00\u59CB',
            yesDisconnectMyBankAccount: '\u662F\u7684\uFF0C\u65AD\u5F00\u6211\u7684\u94F6\u884C\u8D26\u6237\u8FDE\u63A5',
            yesStartOver: '\u662F\u7684\uFF0C\u91CD\u65B0\u5F00\u59CB',
            disconnectYour: '\u65AD\u5F00\u4F60\u7684\u8FDE\u63A5',
            bankAccountAnyTransactions:
                '\u9019\u662F\u4E00\u500B\u9280\u884C\u5E33\u6236\u3002\u6B64\u5E33\u6236\u7684\u4EFB\u4F55\u672A\u5B8C\u6210\u4EA4\u6613\u4ECD\u5C07\u5B8C\u6210\u3002',
            clearProgress: '\u91CD\u65B0\u5F00\u59CB\u5C06\u6E05\u9664\u60A8\u5230\u76EE\u524D\u4E3A\u6B62\u6240\u53D6\u5F97\u7684\u8FDB\u5C55\u3002',
            areYouSure: "I'm sorry, but you didn't provide any text to translate. Could you please provide the text you want to be translated?",
            workspaceCurrency: '\u5DE5\u4F5C\u5340\u8CA8\u5E63',
            updateCurrencyPrompt:
                '\u770B\u8D77\u6765\u60A8\u7684\u5DE5\u4F5C\u533A\u5F53\u524D\u8BBE\u7F6E\u7684\u8D27\u5E01\u4E0D\u662F\u7F8E\u5143\u3002\u8BF7\u70B9\u51FB\u4E0B\u9762\u7684\u6309\u94AE\u7ACB\u5373\u5C06\u60A8\u7684\u8D27\u5E01\u66F4\u65B0\u4E3A\u7F8E\u5143\u3002',
            updateToUSD: '\u66F4\u65B0\u81F3\u7F8E\u5143',
        },
        changeOwner: {
            changeOwnerPageTitle: '\u8F6C\u8BA9\u6240\u6709\u8005',
            addPaymentCardTitle: '\u8F93\u5165\u60A8\u7684\u4ED8\u6B3E\u5361\u4EE5\u8F6C\u79FB\u6240\u6709\u6743',
            addPaymentCardButtonText: '\u63A5\u53D7\u689D\u6B3E\u4E26\u6DFB\u52A0\u4ED8\u6B3E\u5361',
            addPaymentCardReadAndAcceptTextPart1: '\u9605\u8BFB\u5E76\u63A5\u53D7',
            addPaymentCardReadAndAcceptTextPart2: '\u6DFB\u52A0\u60A8\u7684\u5361\u7247\u7684\u653F\u7B56',
            addPaymentCardTerms: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            addPaymentCardPrivacy: '\u9690\u79C1',
            addPaymentCardAnd: 'Your instruction is not clear. Could you please provide the text or TypeScript function that needs to be translated?',
            addPaymentCardPciCompliant: '\u7B26\u5408PCI-DSS\u7684',
            addPaymentCardBankLevelEncrypt: '\u94F6\u884C\u7EA7\u522B\u7684\u52A0\u5BC6',
            addPaymentCardRedundant: '\u5197\u4F59\u57FA\u7840\u8BBE\u65BD',
            addPaymentCardLearnMore: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u6211\u4EEC\u7684',
            addPaymentCardSecurity: '\u5B89\u5168\u6027',
            amountOwedTitle: '\u672A\u4ED8\u4F59\u989D',
            amountOwedButtonText:
                'As a language model AI, I need the specific language you want me to translate the text into. "ch" is not a recognized language code. Please provide the correct language code.',
            amountOwedText:
                '\u6B64\u5E33\u6236\u6709\u4E0A\u500B\u6708\u7684\u672A\u6E05\u9918\u984D\u3002\n\n\u60A8\u662F\u5426\u60F3\u8981\u6E05\u9664\u9019\u500B\u9918\u984D\u4E26\u63A5\u7BA1\u6B64\u5DE5\u4F5C\u5340\u7684\u5E33\u55AE\uFF1F',
            ownerOwesAmountTitle: '\u672A\u4ED8\u4F59\u989D',
            ownerOwesAmountButtonText: '\u8F6C\u79FB\u4F59\u989D',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `\u64C1\u6709\u6B64\u5DE5\u4F5C\u5340\u7684\u5E33\u6236\uFF08${email}\uFF09\u6709\u4E0A\u500B\u6708\u7684\u672A\u4ED8\u9918\u984D\u3002\n\n\u60A8\u662F\u5426\u60F3\u8981\u8F49\u79FB\u9019\u500B\u91D1\u984D\uFF08${amount}\uFF09\u4EE5\u63A5\u7BA1\u9019\u500B\u5DE5\u4F5C\u5340\u7684\u5E33\u55AE\uFF1F\u60A8\u7684\u4ED8\u6B3E\u5361\u5C07\u6703\u7ACB\u5373\u88AB\u6536\u8CBB\u3002`,
            subscriptionTitle: '\u63A5\u7BA1\u5E74\u5EA6\u8A02\u95B1',
            subscriptionButtonText: '\u8F6C\u79FB\u8BA2\u9605',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `\u63A5\u7BA1\u6B64\u5DE5\u4F5C\u7A7A\u9593\u5C07\u6703\u5C07\u5176\u5E74\u8A02\u95B1\u8207\u60A8\u76EE\u524D\u7684\u8A02\u95B1\u5408\u4F75\u3002\u9019\u5C07\u6703\u589E\u52A0\u60A8\u7684\u8A02\u95B1\u4EBA\u6578${usersCount}\u540D\u6210\u54E1\uFF0C\u4F7F\u60A8\u7684\u65B0\u8A02\u95B1\u4EBA\u6578\u70BA${finalCount}\u3002\u60A8\u5E0C\u671B\u7E7C\u7E8C\u55CE\uFF1F`,
            duplicateSubscriptionTitle: '\u91CD\u590D\u8BA2\u9605\u8B66\u544A',
            duplicateSubscriptionButtonText:
                "\u8FD9\u662F\u4E00\u4E2A\u7EAF\u5B57\u7B26\u4E32\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `\u770B\u8D77\u6765\u60A8\u53EF\u80FD\u60F3\u8981\u63A5\u7BA1${email}\u7684\u5DE5\u4F5C\u533A\u7684\u8BA1\u8D39\uFF0C\u4F46\u8981\u505A\u5230\u8FD9\u4E00\u70B9\uFF0C\u60A8\u9996\u5148\u9700\u8981\u6210\u4E3A\u4ED6\u4EEC\u6240\u6709\u5DE5\u4F5C\u533A\u7684\u7BA1\u7406\u5458\u3002\n\n\u5982\u679C\u60A8\u53EA\u60F3\u63A5\u7BA1\u5DE5\u4F5C\u533A${workspaceName}\u7684\u8BA1\u8D39\uFF0C\u8BF7\u70B9\u51FB"\u7EE7\u7EED"\u3002\n\n\u5982\u679C\u60A8\u60F3\u63A5\u7BA1\u4ED6\u4EEC\u6574\u4E2A\u8BA2\u9605\u7684\u8BA1\u8D39\uFF0C\u8BF7\u5148\u8BA9\u4ED6\u4EEC\u5C06\u60A8\u6DFB\u52A0\u4E3A\u6240\u6709\u5DE5\u4F5C\u533A\u7684\u7BA1\u7406\u5458\uFF0C\u7136\u540E\u518D\u63A5\u7BA1\u8BA1\u8D39\u3002`,
            hasFailedSettlementsTitle: '\u65E0\u6CD5\u8F6C\u79FB\u6240\u6709\u6743',
            hasFailedSettlementsButtonText: "Sorry, but I can't assist with that.",
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `\u60A8\u65E0\u6CD5\u63A5\u7BA1\u8D26\u5355\uFF0C\u56E0\u4E3A${email}\u7684Expensify\u5361\u7ED3\u7B97\u903E\u671F\u672A\u4ED8\u3002\u8BF7\u8BA9\u4ED6\u4EEC\u8054\u7CFBconcierge@expensify.com\u89E3\u51B3\u95EE\u9898\u3002\u7136\u540E\uFF0C\u60A8\u53EF\u4EE5\u63A5\u7BA1\u6B64\u5DE5\u4F5C\u533A\u7684\u8D26\u5355\u3002`,
            failedToClearBalanceTitle: '\u6E05\u9664\u4F59\u989D\u5931\u8D25',
            failedToClearBalanceButtonText:
                'As a language model AI, I need the specific language you want me to translate the text into. "ch" is not a recognized language code. Please provide the correct language code.',
            failedToClearBalanceText: '\u6211\u4EEC\u65E0\u6CD5\u6E05\u9664\u4F59\u989D\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            successTitle: '\u54C7\u54E6\uFF01\u5168\u90E8\u8BBE\u7F6E\u597D\u4E86\u3002',
            successDescription: '\u60A8\u73B0\u5728\u662F\u8FD9\u4E2A\u5DE5\u4F5C\u533A\u7684\u6240\u6709\u8005\u3002',
            errorTitle: '\u54CE\u5440\uFF01\u522B\u8FD9\u4E48\u5FEB...',
            errorDescriptionPartOne: '\u5C07\u6B64\u5DE5\u4F5C\u5340\u7684\u6240\u6709\u6B0A\u8F49\u79FB\u51FA\u73FE\u554F\u984C\u3002\u8ACB\u518D\u8A66\u4E00\u6B21\uFF0C\u6216\u8005',
            errorDescriptionPartTwo: '\u8054\u7CFB\u793C\u5BBE\u670D\u52A1',
            errorDescriptionPartThree: '\u5BF9\u4E8E\u5E2E\u52A9.',
        },
        exportAgainModal: {
            title: '\u5C0F\u5FC3\uFF01',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `\u4EE5\u4E0B\u62A5\u544A\u5DF2\u7ECF\u5BFC\u51FA\u5230 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\n\u4F60\u786E\u5B9A\u8981\u518D\u6B21\u5BFC\u51FA\u5B83\u4EEC\u5417\uFF1F`,
            confirmText: '\u662F\u7684\uFF0C\u518D\u6B21\u5BFC\u51FA',
            cancelText: '\u53D6\u6D88',
        },
        upgrade: {
            reportFields: {
                title: '\u62A5\u544A\u5B57\u6BB5',
                description: `Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: '\u62A5\u544A\u5B57\u6BB5\u4EC5\u5728\u63A7\u5236\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u4ECE${count}\u5F00\u59CB',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: '\u6211\u4EEC\u7684NetSuite\u96C6\u6210\u53EA\u5728Control\u8BA1\u5212\u4E0A\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: '\u6211\u4EEC\u7684 Sage Intacct \u96C6\u6210\u4EC5\u5728 Control \u8BA1\u5212\u4E0A\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks\u684C\u9762\u7248',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: '\u6211\u4EEC\u7684QuickBooks\u684C\u9762\u96C6\u6210\u53EA\u5728Control\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '\u9AD8\u7EA7\u5BA1\u6279',
                description: `If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: '\u9AD8\u7EA7\u5BA1\u6279\u4EC5\u5728Control\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8BE5\u8BA1\u5212\u7684\u8D77\u59CB\u4EF7\u683C\u4E3A',
            },
            categories: {
                title: '\u5206\u7C7B',
                description: `Categories help you better organize expenses to keep track of where you're spending your money. Use our suggested categories list or create your own.`,
                onlyAvailableOnPlan: '\u7C7B\u522B\u5728Collect\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            glCodes: {
                title: 'GL\u4EE3\u7801',
                description: `Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'GL\u4EE3\u7801\u53EA\u5728Control\u8BA1\u5212\u4E0A\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            glAndPayrollCodes: {
                title: 'GL\u548C\u5DE5\u8D44\u5355\u4EE3\u7801',
                description: `Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'GL\u548C\u5DE5\u8D44\u5355\u4EE3\u7801\u53EA\u5728\u63A7\u5236\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u59CB\u4E8E',
            },
            taxCodes: {
                title: '\u7A0E\u52A1\u4EE3\u7801',
                description: `Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: '\u7A0E\u7801\u4EC5\u5728Control\u8BA1\u5212\u4E0A\u53EF\u7528\uFF0C\u8D77\u59CB\u4E8E',
            },
            companyCards: {
                title: '\u516C\u53F8\u5361\u7247',
                description: `Connect your existing corporate cards to Expensify, assign them to employees, and automatically import transactions.`,
                onlyAvailableOnPlan: '\u516C\u53F8\u5361\u53EA\u5728\u63A7\u5236\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            rules: {
                title: '\u898F\u5247',
                description: `Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.\n\nRequire expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: '\u89C4\u5219\u53EA\u5728Control\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u4ECE\u5F00\u59CB',
            },
            perDiem: {
                title: '\u6BCF\u65E5',
                description:
                    '\u6BCF\u65E5\u6D25\u8D34\u662F\u5728\u5458\u5DE5\u51FA\u5DEE\u65F6\u63A7\u5236\u6BCF\u65E5\u8D39\u7528\u5E76\u4FDD\u6301\u53EF\u9884\u6D4B\u6027\u7684\u597D\u65B9\u6CD5\u3002\u4EAB\u53D7\u5982\u81EA\u5B9A\u4E49\u8D39\u7387\uFF0C\u9ED8\u8BA4\u7C7B\u522B\uFF0C\u4EE5\u53CA\u66F4\u7EC6\u81F4\u7684\u7EC6\u8282\uFF0C\u5982\u76EE\u7684\u5730\u548C\u5B50\u8D39\u7387\u7B49\u529F\u80FD\u3002',
                onlyAvailableOnPlan: '\u6BCF\u65E5\u8D39\u7528\u4EC5\u5728Control\u8BA1\u5212\u4E0A\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            travel: {
                title: '\u65C5\u884C',
                description:
                    'Expensify Travel\u662F\u4E00\u500B\u65B0\u7684\u4F01\u696D\u65C5\u884C\u9810\u8A02\u548C\u7BA1\u7406\u5E73\u53F0\uFF0C\u5141\u8A31\u6703\u54E1\u9810\u8A02\u4F4F\u5BBF\uFF0C\u822A\u73ED\uFF0C\u4EA4\u901A\u7B49\u7B49\u3002',
                onlyAvailableOnPlan: '\u5728Collect\u8BA1\u5212\u4E2D\uFF0C\u65C5\u884C\u670D\u52A1\u53EF\u4ECE${startPrice}\u5F00\u59CB\u3002',
            },
            pricing: {
                perActiveMember: '\u6BCF\u4E2A\u6D3B\u8DC3\u4F1A\u5458\u6BCF\u6708\u3002',
            },
            note: {
                upgradeWorkspace: '\u5347\u7EA7\u60A8\u7684\u5DE5\u4F5C\u533A\u4EE5\u8BBF\u95EE\u6B64\u529F\u80FD\uFF0C\u6216\u8005',
                learnMore: '\u4E86\u89E3\u66F4\u591A',
                aboutOurPlans: '\u5173\u4E8E\u6211\u4EEC\u7684\u8BA1\u5212\u548C\u5B9A\u4EF7\u3002',
            },
            upgradeToUnlock: '\u89E3\u9501\u6B64\u529F\u80FD',
            completed: {
                headline: `You've upgraded your workspace!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `\u60A8\u5DF2\u6210\u529F\u5C06${policyName}\u5347\u7EA7\u5230\u63A7\u5236\u8BA1\u5212\uFF01`,
                categorizeMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can start booking and managing travel!`,
                viewSubscription: '\u67E5\u770B\u60A8\u7684\u8BA2\u9605',
                moreDetails: '\u6709\u5173\u66F4\u591A\u8BE6\u60C5\u3002',
                gotIt: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u4F1A\u5C3D\u5FEB\u5E2E\u60A8\u7FFB\u8BD1\u3002',
            },
            commonFeatures: {
                title: '\u5347\u7EA7\u5230\u63A7\u5236\u8BA1\u5212',
                note: '\u89E3\u9501\u6211\u4EEC\u6700\u5F3A\u5927\u7684\u529F\u80FD\uFF0C\u5305\u62EC\uFF1A',
                benefits: {
                    startsAt: '\u63A7\u5236\u8BA1\u5212\u4ECE\u5F00\u59CB',
                    perMember: '\u6BCF\u4E2A\u6D3B\u8DC3\u4F1A\u5458\u6BCF\u6708\u3002',
                    learnMore: '\u4E86\u89E3\u66F4\u591A',
                    pricing: '\u5173\u4E8E\u6211\u4EEC\u7684\u8BA1\u5212\u548C\u5B9A\u4EF7\u3002',
                    benefit1: '\u9AD8\u7EA7\u4F1A\u8BA1\u8FDE\u63A5\uFF08NetSuite\uFF0CSage Intacct\u7B49\uFF09',
                    benefit2: '\u667A\u80FD\u8D39\u7528\u89C4\u5219',
                    benefit3: '\u591A\u7EA7\u5BA1\u6279\u5DE5\u4F5C\u6D41',
                    benefit4: '\u589E\u5F3A\u7684\u5B89\u5168\u63A7\u5236',
                    toUpgrade: '\u8981\u5347\u7EA7\uFF0C\u8BF7\u70B9\u51FB',
                    selectWorkspace: '\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A\uFF0C\u5E76\u66F4\u6539\u8BA1\u5212\u7C7B\u578B\u4E3A',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: '\u964D\u7EA7\u5230Collect\u8BA1\u5212',
                note: '\u5982\u679C\u60A8\u964D\u7EA7\uFF0C\u60A8\u5C06\u5931\u53BB\u5BF9\u8FD9\u4E9B\u529F\u80FD\u4EE5\u53CA\u66F4\u591A\u7684\u8BBF\u95EE\u6743\u9650\uFF1A',
                benefits: {
                    note: '\u8981\u67E5\u770B\u6211\u4EEC\u8BA1\u5212\u7684\u5B8C\u6574\u6BD4\u8F83\uFF0C\u8BF7\u67E5\u770B\u6211\u4EEC\u7684',
                    pricingPage: '\u5B9A\u4EF7\u9875\u9762',
                    confirm: '\u4F60\u786E\u5B9A\u8981\u964D\u7EA7\u5E76\u5220\u9664\u4F60\u7684\u914D\u7F6E\u5417\uFF1F',
                    warning: '\u8FD9\u4E0D\u80FD\u88AB\u64A4\u9500\u3002',
                    benefit1: '\u4F1A\u8BA1\u8FDE\u63A5\uFF08\u9664\u4E86QuickBooks Online\u548CXero\uFF09',
                    benefit2: '\u667A\u80FD\u8D39\u7528\u89C4\u5219',
                    benefit3: '\u591A\u7EA7\u5BA1\u6279\u5DE5\u4F5C\u6D41',
                    benefit4: '\u589E\u5F3A\u7684\u5B89\u5168\u63A7\u5236',
                    headsUp: '\u5C0F\u5FC3\uFF01',
                    multiWorkspaceNote:
                        '\u60A8\u9700\u8981\u5728\u9996\u6B21\u6708\u4ED8\u6B3E\u5F00\u59CB\u8BA2\u9605Collect\u7387\u4E4B\u524D\u964D\u7EA7\u6240\u6709\u7684\u5DE5\u4F5C\u7A7A\u95F4\u3002\u70B9\u51FB',
                    selectStep: '> \u9009\u62E9\u6BCF\u4E2A\u5DE5\u4F5C\u533A > \u66F4\u6539\u8BA1\u5212\u7C7B\u578B\u4E3A',
                },
            },
            completed: {
                headline: '\u60A8\u7684\u5DE5\u4F5C\u7A7A\u9593\u5DF2\u88AB\u964D\u7D1A',
                description:
                    '\u60A8\u5728\u63A7\u5236\u8BA1\u5212\u4E0A\u6709\u5176\u4ED6\u5DE5\u4F5C\u533A\u3002\u8981\u6309\u6536\u96C6\u7387\u8BA1\u8D39\uFF0C\u60A8\u5FC5\u987B\u964D\u7EA7\u6240\u6709\u5DE5\u4F5C\u533A\u3002',
                gotIt: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u4F1A\u5C3D\u5FEB\u5E2E\u60A8\u7FFB\u8BD1\u3002',
            },
        },
        restrictedAction: {
            restricted: '\u53D7\u9650',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `\u76EE\u524D\u5DF2\u9650\u5236\u5728${workspaceName}\u5DE5\u4F5C\u5340\u7684\u64CD\u4F5C`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `\u5DE5\u4F5C\u7A7A\u95F4\u6240\u6709\u8005\uFF0C${workspaceOwnerName} \u9700\u8981\u6DFB\u52A0\u6216\u66F4\u65B0\u6863\u6848\u4E2D\u7684\u4ED8\u6B3E\u5361\u4EE5\u89E3\u9501\u65B0\u7684\u5DE5\u4F5C\u7A7A\u95F4\u6D3B\u52A8\u3002`,
            youWillNeedToAddOrUpdatePaymentCard:
                '\u60A8\u9700\u8981\u6DFB\u52A0\u6216\u66F4\u65B0\u6587\u4EF6\u4E2D\u7684\u4ED8\u6B3E\u5361\u4EE5\u89E3\u9501\u65B0\u7684\u5DE5\u4F5C\u533A\u6D3B\u52A8\u3002',
            addPaymentCardToUnlock: '\u89E3\u9501\u4EE5\u6DFB\u52A0\u4ED8\u6B3E\u5361\uFF01',
            addPaymentCardToContinueUsingWorkspace: '\u7EE7\u7EED\u4F7F\u7528\u6B64\u5DE5\u4F5C\u533A\uFF0C\u9700\u8981\u6DFB\u52A0\u4ED8\u6B3E\u5361',
            pleaseReachOutToYourWorkspaceAdmin: '\u5982\u6709\u4EFB\u4F55\u7591\u95EE\uFF0C\u8BF7\u8054\u7CFB\u60A8\u7684\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\u3002',
            chatWithYourAdmin: '\u4E0E\u60A8\u7684\u7BA1\u7406\u5458\u804A\u5929',
            chatInAdmins: '\u5728#admins\u4E2D\u804A\u5929',
            addPaymentCard: '\u6DFB\u52A0\u4ED8\u6B3E\u5361',
        },
        rules: {
            individualExpenseRules: {
                title: '\u8D39\u7528',
                subtitle:
                    '\u8BBE\u7F6E\u4E2A\u522B\u8D39\u7528\u7684\u6D88\u8D39\u63A7\u5236\u548C\u9ED8\u8BA4\u503C\u3002\u60A8\u4E5F\u53EF\u4EE5\u4E3A${username}\u521B\u5EFA\u89C4\u5219\u3002',
                receiptRequiredAmount: '\u9700\u8981\u6536\u636E\u91D1\u989D',
                receiptRequiredAmountDescription:
                    '\u5F53\u652F\u51FA\u8D85\u8FC7\u6B64\u91D1\u989D\u65F6\u9700\u8981\u6536\u636E\uFF0C\u9664\u975E\u7C7B\u522B\u89C4\u5219\u6709\u6240\u8986\u76D6\u3002',
                maxExpenseAmount: '\u6700\u5927\u652F\u51FA\u91D1\u989D',
                maxExpenseAmountDescription:
                    '\u5982\u679C\u672A\u88AB\u7C7B\u522B\u89C4\u5219\u8986\u76D6\uFF0C\u8D85\u8FC7\u6B64\u91D1\u989D\u7684\u6807\u8BB0\u652F\u51FA\u5C06\u88AB\u6807\u8BB0\u3002',
                maxAge: '\u6700\u5927\u5E74\u9F84',
                maxExpenseAge: '\u6700\u5927\u8D39\u7528\u5E74\u9F84',
                maxExpenseAgeDescription: '\u6807\u8BB0\u8D85\u8FC7\u7279\u5B9A\u5929\u6570\u7684\u82B1\u8D39\u3002',
                maxExpenseAgeDays: () => ({
                    one: '1\u5929',
                    other: (count: number) => `${count} days`,
                }),
                billableDefault: '\u9ED8\u8BA4\u8BA1\u8D39',
                billableDefaultDescription:
                    "\u9009\u62E9\u662F\u5426\u5E94\u9ED8\u8BA4\u5C06\u73B0\u91D1\u548C\u4FE1\u7528\u5361\u652F\u51FA\u8BA1\u4E3A\u5E94\u8BA1\u8D39\u7528\u3002\u542F\u7528\u6216\u7981\u7528\u5E94\u8BA1\u8D39\u7528\u5728${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}",
                billable: '\u53EF\u8BA1\u8D39\u7684',
                billableDescription: '\u8D39\u7528\u6700\u5E38\u88AB\u91CD\u65B0\u8BA1\u8D39\u7ED9\u5BA2\u6237',
                nonBillable: '\u975E\u8BA1\u8D39',
                nonBillableDescription: '\u8D39\u7528\u6709\u65F6\u4F1A\u91CD\u65B0\u5411\u5BA2\u6237\u6536\u53D6',
                eReceipts: '\u7535\u5B50\u6536\u636E',
                eReceiptsHint: '\u7535\u5B50\u6536\u636E\u4F1A\u81EA\u52A8\u521B\u5EFA',
                eReceiptsHintLink: '\u5BF9\u4E8E\u5927\u591A\u6570\u7F8E\u5143\u4FE1\u7528\u4EA4\u6613',
            },
            expenseReportRules: {
                examples:
                    '1. English: "Hello, ${username}! You have ${count} new messages."\n   Chinese: "\u4F60\u597D\uFF0C${username}\uFF01\u4F60\u6709${count}\u6761\u65B0\u6D88\u606F\u3002"\n\n2. English: "The operation was ${someBoolean ? \'successful\' : \'unsuccessful\'}."\n   Chinese: "\u64CD\u4F5C${someBoolean ? \'\u6210\u529F\' : \'\u5931\u8D25\'}\u3002"\n\n3. English: "Welcome back, ${username}! Your last visit was ${daysSinceLastVisit} days ago."\n   Chinese: "\u6B22\u8FCE\u56DE\u6765\uFF0C${username}\uFF01\u60A8\u4E0A\u6B21\u8BBF\u95EE\u662F${daysSinceLastVisit}\u5929\u524D\u3002"\n\n4. English: "${count} items have been added to your shopping cart."\n   Chinese: "\u60A8\u7684\u8D2D\u7269\u8F66\u5DF2\u6DFB\u52A0${count}\u4EF6\u5546\u54C1\u3002"\n\n5. English: "The weather today is ${weatherCondition ? \'sunny\' : \'cloudy\'}."\n   Chinese: "\u4ECA\u5929\u7684\u5929\u6C14\u662F${weatherCondition ? \'\u6674\u6717\' : \'\u591A\u4E91\'}\u3002"\n\nNote: The placeholders (${username}, ${count}, ${someBoolean ? \'valueIfTrue\' : \'valueIfFalse\'}) are kept as they are without any modification.',
                title: '\u8D39\u7528\u62A5\u544A',
                subtitle: '\u81EA\u52A8\u5316\u8D39\u7528\u62A5\u544A\u5408\u89C4\u6027\uFF0C\u5BA1\u6279\u548C\u652F\u4ED8\u3002',
                customReportNamesTitle: '\u81EA\u5B9A\u4E49\u62A5\u544A\u540D\u79F0',
                customReportNamesSubtitle: '\u4F7F\u7528\u6211\u4EEC\u7684\u5E7F\u6CDB\u516C\u5F0F\u521B\u5EFA\u81EA\u5B9A\u4E49\u540D\u79F0\u3002',
                customNameTitle: '\u81EA\u5B9A\u4E49\u540D\u79F0',
                customNameDescription: '\u4F7F\u7528\u6211\u4EEC\u7684\u81EA\u5B9A\u4E49\u540D\u79F0\u4E3A\u8D39\u7528\u62A5\u544A',
                customNameDescriptionLink: '\u5E7F\u6CDB\u7684\u516C\u5F0F',
                customNameInputLabel: '\u540D\u79F0',
                customNameEmailPhoneExample: '\u4F1A\u5458\u7684\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\uFF1A{report:submit:from}',
                customNameStartDateExample: '\u5831\u544A\u958B\u59CB\u65E5\u671F\uFF1A{report:startdate}',
                customNameWorkspaceNameExample: '\u5DE5\u4F5C\u7A7A\u9593\u540D\u7A31\uFF1A{report:policyname}',
                customNameReportIDExample: '\u62A5\u544AID\uFF1A{report:id}',
                customNameTotalExample: '\u603B\u8BA1\uFF1A{report:total}\u3002',
                preventMembersFromChangingCustomNamesTitle: '\u9632\u6B62\u6210\u5458\u66F4\u6539\u81EA\u5B9A\u4E49\u62A5\u544A\u540D\u79F0',
                preventSelfApprovalsTitle: '\u9632\u6B62\u81EA\u6211\u6279\u51C6',
                preventSelfApprovalsSubtitle: '\u9632\u6B62\u5DE5\u4F5C\u7A7A\u95F4\u6210\u5458\u6279\u51C6\u4ED6\u4EEC\u81EA\u5DF1\u7684\u8D39\u7528\u62A5\u544A\u3002',
                autoApproveCompliantReportsTitle: '\u81EA\u52A8\u6279\u51C6\u7B26\u5408\u89C4\u5B9A\u7684\u62A5\u544A',
                autoApproveCompliantReportsSubtitle: '\u914D\u7F6E\u54EA\u4E9B\u8D39\u7528\u62A5\u544A\u7B26\u5408\u81EA\u52A8\u6279\u51C6\u7684\u8D44\u683C\u3002',
                autoApproveReportsUnderTitle: '\u81EA\u52A8\u6279\u51C6\u62A5\u544A\u5728',
                autoApproveReportsUnderDescription:
                    '\u5728\u6B64\u91D1\u989D\u4EE5\u4E0B\u7684\u5B8C\u5168\u7B26\u5408\u89C4\u5B9A\u7684\u8D39\u7528\u62A5\u544A\u5C06\u81EA\u52A8\u83B7\u5F97\u6279\u51C6\u3002',
                randomReportAuditTitle: '\u968F\u673A\u62A5\u544A\u5BA1\u6838',
                randomReportAuditDescription:
                    '\u8981\u6C42\u4E00\u4E9B\u62A5\u544A\u5373\u4F7F\u7B26\u5408\u81EA\u52A8\u6279\u51C6\u7684\u6761\u4EF6\uFF0C\u4E5F\u5FC5\u987B\u624B\u52A8\u6279\u51C6\u3002',
                autoPayApprovedReportsTitle: '\u81EA\u52A8\u652F\u4ED8\u5DF2\u6279\u51C6\u7684\u62A5\u544A',
                autoPayApprovedReportsSubtitle: '\u914D\u7F6E\u54EA\u4E9B\u8D39\u7528\u62A5\u544A\u9002\u7528\u4E8E\u81EA\u52A8\u652F\u4ED8\u3002',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) =>
                    `\u8BF7\u8F93\u5165\u4E00\u4E2A\u91D1\u989D\u5C0F\u4E8E${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle:
                    '\u524D\u5F80\u66F4\u591A\u529F\u80FD\u4E26\u555F\u7528\u5DE5\u4F5C\u6D41\u7A0B\uFF0C\u7136\u5F8C\u6DFB\u52A0\u4ED8\u6B3E\u4EE5\u89E3\u9396\u6B64\u529F\u80FD\u3002',
                autoPayReportsUnderTitle: '\u81EA\u52A8\u652F\u4ED8\u62A5\u544A\u5728',
                autoPayReportsUnderDescription: '\u5728\u6B64\u91D1\u989D\u4E0B\u7684\u5B8C\u5168\u5408\u89C4\u8D39\u7528\u62A5\u544A\u5C06\u81EA\u52A8\u652F\u4ED8\u3002',
                unlockFeatureGoToSubtitle: '\u53BB',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `\u5E76\u542F\u7528\u5DE5\u4F5C\u6D41\uFF0C\u7136\u540E\u6DFB\u52A0 ${featureName} \u4EE5\u89E3\u9501\u6B64\u529F\u80FD\u3002`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `\u5E76\u542F\u7528${featureName}\u4EE5\u89E3\u9501\u6B64\u529F\u80FD\u3002`,
                preventSelfApprovalsModalText: ({managerEmail}: {managerEmail: string}) =>
                    `\u76EE\u524D\u6B63\u5728\u6279\u51C6\u81EA\u5DF1\u8D39\u7528\u7684\u4EFB\u4F55\u6210\u5458\u90FD\u5C06\u88AB\u79FB\u9664\uFF0C\u5E76\u88AB\u8FD9\u4E2A\u5DE5\u4F5C\u7A7A\u95F4\u7684\u9ED8\u8BA4\u6279\u51C6\u4EBA(${managerEmail})\u66FF\u6362\u3002`,
                preventSelfApprovalsConfirmButton: '\u9632\u6B62\u81EA\u6211\u6279\u51C6',
                preventSelfApprovalsModalTitle: '\u9632\u6B62\u81EA\u6211\u6279\u51C6\uFF1F',
                preventSelfApprovalsDisabledSubtitle:
                    '\u5728\u6B64\u5DE5\u4F5C\u7A7A\u9593\u81F3\u5C11\u6709\u5169\u540D\u6210\u54E1\u4E4B\u524D\uFF0C\u4E0D\u80FD\u555F\u7528\u81EA\u6211\u6279\u51C6\u3002',
            },
            categoryRules: {
                title: '\u5206\u7C7B\u89C4\u5219',
                approver: '\u5BA1\u6279\u4EBA',
                requireDescription: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                descriptionHint: '\u63CF\u8FF0\u63D0\u793A',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `\u63D0\u9192\u5458\u5DE5\u4E3A\u201C${categoryName}\u201D\u82B1\u8D39\u63D0\u4F9B\u989D\u5916\u4FE1\u606F\u3002\u6B64\u63D0\u793A\u5C06\u51FA\u73B0\u5728\u8D39\u7528\u7684\u63CF\u8FF0\u5B57\u6BB5\u4E2D\u3002`,
                descriptionHintLabel: 'Sorry, but your request is unclear. Could you please provide more information or context?',
                descriptionHintSubtitle: '\u4E13\u4E1A\u63D0\u793A\uFF1A\u8D8A\u77ED\u8D8A\u597D\uFF01',
                maxAmount: '\u6700\u5927\u91D1\u989D',
                flagAmountsOver: '\u6807\u8BB0\u8D85\u8FC7\u7684\u91D1\u989D',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `\u9002\u7528\u4E8E\u201C${categoryName}\u201D\u7C7B\u522B\u3002`,
                flagAmountsOverSubtitle: '\u8FD9\u5C06\u8986\u76D6\u6240\u6709\u8D39\u7528\u7684\u6700\u5927\u91D1\u989D\u3002',
                expenseLimitTypes: {
                    expense: '\u4E2A\u4EBA\u8D39\u7528',
                    expenseSubtitle:
                        '\u6309\u7C7B\u522B\u6807\u8BB0\u8D39\u7528\u91D1\u989D\u3002\u6B64\u89C4\u5219\u8986\u76D6\u4E86\u5DE5\u4F5C\u533A\u6700\u5927\u8D39\u7528\u91D1\u989D\u7684\u4E00\u822C\u89C4\u5219\u3002',
                    daily: '\u5206\u7C7B\u603B\u8BA1',
                    dailySubtitle: '\u6807\u8BB0\u6BCF\u4E2A\u8D39\u7528\u62A5\u544A\u7684\u603B\u7C7B\u522B\u652F\u51FA\u3002',
                },
                requireReceiptsOver: '\u9700\u8981\u8D85\u8FC7\u7684\u6536\u636E',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '\u6C38\u4E0D\u8981\u6C42\u6536\u64DA',
                    always: '\u59CB\u7EC8\u8981\u6C42\u6536\u636E',
                },
                defaultTaxRate: '\u9ED8\u8BA4\u7A0E\u7387',
                goTo: '\u53BB',
                andEnableWorkflows: '\u5E76\u542F\u7528\u5DE5\u4F5C\u6D41\uFF0C\u7136\u540E\u6DFB\u52A0\u6279\u51C6\u4EE5\u89E3\u9501\u6B64\u529F\u80FD\u3002',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '\u6536\u96C6',
                    description: '\u5BF9\u4E8E\u5E0C\u671B\u81EA\u52A8\u5316\u5176\u6D41\u7A0B\u7684\u56E2\u961F\u3002',
                },
                corporate: {
                    label: '\u63A7\u5236',
                    description: '\u5BF9\u4E8E\u6709\u9AD8\u7EA7\u9700\u6C42\u7684\u7EC4\u7EC7\u3002',
                },
            },
            description:
                '\u9009\u62E9\u9002\u5408\u60A8\u7684\u8BA1\u5212\u3002\u5982\u9700\u67E5\u770B\u8BE6\u7EC6\u7684\u529F\u80FD\u548C\u4EF7\u683C\u5217\u8868\uFF0C\u8BF7\u67E5\u770B\u6211\u4EEC\u7684',
            subscriptionLink: '\u8BA1\u5212\u7C7B\u578B\u548C\u5B9A\u4EF7\u5E2E\u52A9\u9875\u9762',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `\u60A8\u5DF2\u627F\u8BFA\u5728Control\u8BA1\u5212\u4E2D\u67091\u4E2A\u6D3B\u8DC3\u6210\u5458\uFF0C\u76F4\u5230\u60A8\u7684\u5E74\u5EA6\u8BA2\u9605\u5728${annualSubscriptionEndDate}\u7ED3\u675F\u3002\u60A8\u53EF\u4EE5\u5207\u6362\u5230\u6309\u4F7F\u7528\u4ED8\u8D39\u7684\u8BA2\u9605\uFF0C\u5E76\u5728${annualSubscriptionEndDate}\u5F00\u59CB\u964D\u7EA7\u5230Collect\u8BA1\u5212\uFF0C\u901A\u8FC7\u7981\u7528\u81EA\u52A8\u7EED\u8BA2\u3002`,
                other: `\u60A8\u5DF2\u627F\u8AFE\u5728Control\u8A08\u5283\u4E2D\u5C0D${count}\u500B\u6D3B\u8E8D\u6210\u54E1\u9032\u884C\u5E74\u5EA6\u8A02\u95B1\uFF0C\u76F4\u5230\u60A8\u7684\u5E74\u5EA6\u8A02\u95B1\u5728${annualSubscriptionEndDate}\u7D50\u675F\u3002\u60A8\u53EF\u4EE5\u5728${annualSubscriptionEndDate}\u958B\u59CB\uFF0C\u901A\u904E\u7981\u7528\u81EA\u52D5\u7E8C\u8A02\uFF0C\u5207\u63DB\u5230\u6309\u4F7F\u7528\u4ED8\u8CBB\u8A02\u95B1\u4E26\u964D\u7D1A\u5230Collect\u8A08\u5283\u3002`,
            }),
            subscriptions: '\u8BA2\u9605',
        },
    },
    getAssistancePage: {
        title: '\u83B7\u53D6\u5E2E\u52A9',
        subtitle: '\u6211\u4EEC\u5728\u8FD9\u91CC\u4E3A\u4F60\u6E05\u7406\u901A\u5F80\u4F1F\u5927\u7684\u9053\u8DEF\uFF01',
        description: '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u652F\u6301\u9009\u9879\uFF1A',
        chatWithConcierge: '\u4E0E\u793C\u5BBE\u804A\u5929',
        scheduleSetupCall: '\u5B89\u6392\u8A2D\u7F6E\u901A\u8A71',
        scheduleADemo: '\u5B89\u6392\u6F14\u793A',
        questionMarkButtonTooltip: '\u4ECE\u6211\u4EEC\u7684\u56E2\u961F\u83B7\u53D6\u5E2E\u52A9',
        exploreHelpDocs: '\u63A2\u7D22\u5E2E\u52A9\u6587\u6863',
    },
    emojiPicker: {
        skinTonePickerLabel: '\u66F4\u6539\u9ED8\u8BA4\u80A4\u8272',
        headers: {
            frequentlyUsed: '\u5E38\u7528\u7684',
            smileysAndEmotion: '\u5FAE\u7B11\u548C\u60C5\u7EEA',
            peopleAndBody: '\u4EBA\u4E0E\u8EAB\u4F53',
            animalsAndNature: '\u52A8\u7269\u4E0E\u81EA\u7136',
            foodAndDrink: '\u98DF\u7269\u548C\u996E\u6599',
            travelAndPlaces: '\u65C5\u884C\u548C\u5730\u70B9',
            activities: '\u6D3B\u52A8',
            objects: '\u5BF9\u8C61',
            symbols: '\u7B26\u53F7',
            flags: '\u65D7\u5E1C',
        },
    },
    newRoomPage: {
        newRoom: '\u65B0\u623F\u95F4',
        groupName: '\u7FA4\u7D44\u540D\u7A31',
        roomName: '\u623F\u95F4\u540D\u79F0',
        visibility: '\u53EF\u89C1\u6027',
        restrictedDescription: '\u60A8\u7684\u5DE5\u4F5C\u7A7A\u95F4\u4E2D\u7684\u4EBA\u53EF\u4EE5\u627E\u5230\u8FD9\u4E2A\u623F\u95F4',
        privateDescription: '\u88AB\u9080\u8BF7\u5230\u8FD9\u4E2A\u623F\u95F4\u7684\u4EBA\u53EF\u4EE5\u627E\u5230\u5B83',
        publicDescription: '\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u627E\u5230\u8FD9\u4E2A\u623F\u95F4',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u627E\u5230\u8FD9\u4E2A\u623F\u95F4',
        createRoom: '\u521B\u5EFA\u623F\u95F4',
        roomAlreadyExistsError: '\u8FD9\u4E2A\u540D\u5B57\u7684\u623F\u95F4\u5DF2\u7ECF\u5B58\u5728\u3002',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '\u623F\u95F4\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u8FDE\u5B57\u7B26\u3002',
        pleaseEnterRoomName: '\u8BF7\u8F93\u5165\u623F\u95F4\u540D\u79F0\u3002',
        pleaseSelectWorkspace: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A\u3002',
        renamedRoomAction: ({oldName, newName}: RenamedRoomActionParams) => `\u5C06\u6B64\u623F\u95F4\u7684\u540D\u79F0\u66F4\u6539\u4E3A "${newName}" (\u4E4B\u524D\u4E3A "${oldName}")`,
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `\u623F\u95F4\u540D\u79F0\u5DF2\u66F4\u6539\u4E3A${newName}`,
        social: '\u793E\u4EA4',
        selectAWorkspace: '\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A',
        growlMessageOnRenameError: '\u65E0\u6CD5\u91CD\u547D\u540D\u5DE5\u4F5C\u7A7A\u95F4\u623F\u95F4\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u8FDE\u63A5\u5E76\u518D\u8BD5\u4E00\u6B21\u3002',
        visibilityOptions: {
            restricted: '\u5DE5\u4F5C\u5340', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: '\u79C1\u4EBA',
            public: '\u516C\u5F00',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: '\u516C\u958B\u5BA3\u5E03',
        },
    },
    workspaceActions: {
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedRoomActionParams) =>
            `\u5C06\u6B64\u5DE5\u4F5C\u533A\u7684\u540D\u79F0\u66F4\u65B0\u4E3A\u201C${newName}\u201D\uFF08\u5148\u524D\u4E3A\u201C${oldName}\u201D\uFF09`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `\u5DF2\u5C07\u60A8\u5F9E${joinedNames}\u7684\u5BE9\u6279\u6D41\u7A0B\u548C\u5DE5\u4F5C\u5340\u804A\u5929\u4E2D\u79FB\u9664\u3002\u5148\u524D\u63D0\u4EA4\u7684\u5831\u544A\u5C07\u7E7C\u7E8C\u5728\u60A8\u7684\u6536\u4EF6\u7BB1\u4E2D\u7B49\u5F85\u5BE9\u6279\u3002`,
                other: `\u5DF2\u5C06\u60A8\u4ECE${joinedNames}\u7684\u5BA1\u6279\u6D41\u7A0B\u548C\u5DE5\u4F5C\u533A\u804A\u5929\u4E2D\u79FB\u9664\u3002\u5148\u524D\u63D0\u4EA4\u7684\u62A5\u544A\u5C06\u7EE7\u7EED\u5728\u60A8\u7684\u6536\u4EF6\u7BB1\u4E2D\u7B49\u5F85\u5BA1\u6279\u3002`,
            };
        },
        upgradedWorkspace: '\u5DF2\u5C06\u6B64\u5DE5\u4F5C\u533A\u5347\u7EA7\u5230Control\u8BA1\u5212',
        downgradedWorkspace: '\u6B64\u5DE5\u4F5C\u5340\u5DF2\u964D\u7D1A\u70BACollect\u8A08\u5283',
    },
    roomMembersPage: {
        memberNotFound: '\u627E\u4E0D\u5230\u6210\u5458\u3002',
        useInviteButton: '\u8981\u9080\u8BF7\u65B0\u6210\u5458\u52A0\u5165\u804A\u5929\uFF0C\u8BF7\u4F7F\u7528\u4E0A\u65B9\u7684\u9080\u8BF7\u6309\u94AE\u3002',
        notAuthorized: `\u60A8\u65E0\u6CD5\u8BBF\u95EE\u6B64\u9875\u9762\u3002\u5982\u679C\u60A8\u6B63\u5728\u5C1D\u8BD5\u52A0\u5165\u6B64\u623F\u95F4\uFF0C\u8BF7\u5411\u623F\u95F4\u6210\u5458\u8BF7\u6C42\u6DFB\u52A0\u60A8\u3002\u6709\u5176\u4ED6\u95EE\u9898\u5417\uFF1F\u8BF7\u8054\u7CFB${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `\u60A8\u786E\u5B9A\u8981\u5C06${memberName}\u4ECE\u623F\u95F4\u4E2D\u79FB\u9664\u5417\uFF1F`,
            other: '\u60A8\u786E\u5B9A\u8981\u4ECE\u623F\u95F4\u4E2D\u79FB\u9664\u9009\u5B9A\u7684\u6210\u5458\u5417\uFF1F',
        }),
        error: {
            genericAdd: '\u6DFB\u52A0\u6B64\u623F\u95F4\u6210\u5458\u65F6\u51FA\u73B0\u4E86\u95EE\u9898\u3002',
        },
    },
    newTaskPage: {
        assignTask: '\u5206\u914D\u4EFB\u52D9',
        assignMe: '\u5206\u914D\u7ED9\u6211',
        confirmTask:
            "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        confirmError: '\u8BF7\u8F93\u5165\u6807\u9898\u5E76\u9009\u62E9\u5206\u4EAB\u76EE\u7684\u5730\u3002',
        descriptionOptional: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        pleaseEnterTaskName: '\u8BF7\u8F93\u5165\u6807\u9898',
        pleaseEnterTaskDestination: '\u8BF7\u9009\u62E9\u60A8\u60F3\u8981\u5206\u4EAB\u6B64\u4EFB\u52A1\u7684\u5730\u65B9\u3002',
    },
    task: {
        task: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\u3001${count}\u3001${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        title: '\u6807\u9898',
        description: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        assignee: '\u88AB\u6307\u6D3E\u4EBA',
        completed: "Sorry, there's a mistake in your instruction. Please specify the language you want the text to be translated into.",
        messages: {
            created: ({title}: TaskCreatedActionParams) => `task for ${title}`,
            completed: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
            canceled: '\u5DF2\u5220\u9664\u7684\u4EFB\u52A1',
            reopened:
                'As a language model AI developed by OpenAI, I need to know the target language (ch) you want the text to be translated into. Please specify the language for the translation.',
            error: '\u60A8\u6CA1\u6709\u6743\u9650\u6267\u884C\u8BF7\u6C42\u7684\u64CD\u4F5C\u3002',
        },
        markAsComplete: '\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210',
        markAsIncomplete: '\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210',
        assigneeError: '\u5206\u914D\u6B64\u4EFB\u52A1\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u5C1D\u8BD5\u53E6\u4E00\u4E2A\u53D7\u8BA9\u4EBA\u3002',
        genericCreateTaskFailureMessage: '\u521B\u5EFA\u6B64\u4EFB\u52A1\u65F6\u51FA\u73B0\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        deleteTask: '\u5220\u9664\u4EFB\u52A1',
        deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u4EFB\u52A1\u5417\uFF1F',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '\u952E\u76D8\u5FEB\u6377\u952E',
        subtitle: '\u4F7F\u7528\u8FD9\u4E9B\u65B9\u4FBF\u7684\u952E\u76D8\u5FEB\u6377\u952E\u6765\u8282\u7701\u65F6\u95F4\uFF1A',
        shortcuts: {
            openShortcutDialog: '\u6253\u5F00\u952E\u76D8\u5FEB\u6377\u952E\u5BF9\u8BDD\u6846',
            escape: '\u9003\u8131\u5BF9\u8BDD\u6846',
            search: '\u6253\u5F00\u641C\u7D22\u5BF9\u8BDD\u6846',
            newChat: '\u65B0\u7684\u804A\u5929\u5C4F\u5E55',
            copy: 'As a language model AI developed by OpenAI, I need to clarify that "ch" is not a recognized language code. Could you please specify the language you want the text to be translated into? For example, "zh" for Chinese, "fr" for French, "es" for Spanish, etc.',
            openDebug: '\u6253\u5F00\u6D4B\u8BD5\u504F\u597D\u8BBE\u7F6E\u5BF9\u8BDD\u6846',
        },
    },
    guides: {
        screenShare: '\u5C4F\u5E55\u5206\u4EAB',
        screenShareRequest: 'Expensify \u6B63\u9080\u8BF7\u60A8\u8FDB\u884C\u5C4F\u5E55\u5171\u4EAB',
    },
    search: {
        resultsAreLimited: '\u641C\u7D22\u7ED3\u679C\u6709\u9650\u3002',
        viewResults: '\u67E5\u770B\u7ED3\u679C',
        resetFilters: '\u91CD\u7F6E\u8FC7\u6EE4\u5668',
        searchResults: {
            emptyResults: {
                title: '\u6CA1\u6709\u5185\u5BB9\u53EF\u4EE5\u663E\u793A',
                subtitle: '\u5617\u8A66\u8ABF\u6574\u60A8\u7684\u641C\u7D22\u689D\u4EF6\uFF0C\u6216\u4F7F\u7528\u7DA0\u8272\u7684+\u6309\u9215\u5275\u5EFA\u67D0\u7269\u3002',
            },
            emptyExpenseResults: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u8D39\u7528',
                subtitle:
                    '\u4F7F\u7528\u4E0B\u65B9\u7684\u7EFF\u8272\u6309\u94AE\u521B\u5EFA\u4E00\u9879\u8D39\u7528\uFF0C\u6216\u53C2\u89C2Expensify\u4EE5\u4E86\u89E3\u66F4\u591A\u4FE1\u606F\u3002',
            },
            emptyInvoiceResults: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u53D1\u7968',
                subtitle: '\u4F7F\u7528\u4E0B\u9762\u7684\u7EFF\u8272\u6309\u94AE\u53D1\u9001\u53D1\u7968\uFF0C\u6216\u53C2\u89C2Expensify\u4EE5\u4E86\u89E3\u66F4\u591A\u4FE1\u606F\u3002',
            },
            emptyTripResults: {
                title: '\u6CA1\u6709\u884C\u7A0B\u53EF\u4EE5\u663E\u793A',
                subtitle: '\u901A\u8FC7\u4E0B\u9762\u9884\u8BA2\u60A8\u7684\u7B2C\u4E00\u6B21\u65C5\u884C\u5F00\u59CB\u3002',
                buttonText: '\u9884\u8BA2\u4E00\u6B21\u65C5\u884C',
            },
        },
        saveSearch: '\u4FDD\u5B58\u641C\u7D22',
        deleteSavedSearch: '\u5220\u9664\u4FDD\u5B58\u7684\u641C\u7D22',
        deleteSavedSearchConfirm: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u641C\u7D22\u5417\uFF1F',
        searchName: '\u641C\u7D22\u540D\u79F0',
        savedSearchesMenuItemTitle: '\u4FDD\u5B58',
        groupedExpenses: '\u5206\u7EC4\u8D39\u7528',
        bulkActions: {
            approve: '\u6279\u51C6',
            pay: '\u652F\u4ED8',
            delete: '\u5220\u9664',
            hold: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that you want to translate into Chinese?',
            unhold: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            noOptionsAvailable: '\u5BF9\u9009\u5B9A\u7684\u8D39\u7528\u7EC4\u6CA1\u6709\u53EF\u7528\u7684\u9009\u9879\u3002',
        },
        filtersHeader: '\u7B5B\u9009\u5668',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `\u5728${date ?? ''}\u4E4B\u524D`,
                after: ({date}: OptionalParam<DateParams> = {}) => `\u5728${date ?? ''}\u4E4B\u540E`,
            },
            status: '\u72B6\u6001',
            keyword: '\u5173\u952E\u8BCD',
            hasKeywords:
                "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u4ED6\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u4ED6\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            currency: '\u8D27\u5E01',
            link: '\u94FE\u63A5',
            pinned: '\u56FA\u5B9A\u7684',
            unread: '\u672A\u8BFB',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `\u5C11\u4E8E ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `\u5927\u4E8E ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `\u5728${greaterThan}\u548C${lessThan}\u4E4B\u95F4`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '\u4E2A\u522B\u5361\u7247',
                cardFeeds: '\u5361\u7247\u4F9B\u7A3F',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Sorry, there seems to be a misunderstanding. Could you please provide the text or TypeScript function that you want to be translated?',
            past: '\u904E\u53BB',
            submitted:
                '\u62B1\u6B49\uFF0C\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u695A\u3002\u60A8\u9700\u8981\u5C06\u6587\u672C\u7FFB\u8BD1\u6210\u4EC0\u4E48\u8BED\u8A00\uFF1F"ch"\u662F\u4EC0\u4E48\u8BED\u8A00\u7684\u7F29\u5199\uFF1F\u8BF7\u63D0\u4F9B\u66F4\u591A\u4FE1\u606F\uFF0C\u4EE5\u4FBF\u6211\u80FD\u66F4\u597D\u5730\u5E2E\u52A9\u60A8\u3002',
            approved: '\u6279\u51C6',
            paid: '\u5DF2\u4ED8\u6B3E',
            exported: '\u5DF2\u5BFC\u51FA',
            posted: '\u53D1\u5E03',
        },
        noCategory: "I'm sorry, but you didn't provide any text to translate. Please provide the text you want translated.",
        noTag: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u6CA1\u6709\u63D0\u4F9B\u8DB3\u591F\u7684\u4FE1\u606F\u4EE5\u4F9B\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        expenseType: '\u8D39\u7528\u7C7B\u578B',
        recentSearches: '\u6700\u8FD1\u7684\u641C\u7D22',
        recentChats: '\u6700\u8FD1\u7684\u804A\u5929',
        searchIn: '\u5728\u4E2D\u641C\u7D22',
        searchPlaceholder: '\u641C\u7D22\u67D0\u7269',
        suggestions: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u95EE\u9898\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
    },
    genericErrorPage: {
        title: '\u54CE\u5440\uFF0C\u51FA\u4E86\u4E9B\u95EE\u9898\uFF01',
        body: {
            helpTextMobile: '\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u5E94\u7528\u7A0B\u5E8F\uFF0C\u6216\u5207\u6362\u81F3',
            helpTextWeb:
                '\u7531\u65BC\u60A8\u6C92\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8B6F\u7684\u6587\u672C\uFF0C\u6211\u7121\u6CD5\u9032\u884C\u7FFB\u8B6F\u3002\u8ACB\u63D0\u4F9B\u9700\u8981\u7FFB\u8B6F\u7684\u6587\u672C\u3002',
            helpTextConcierge: '\u5982\u679C\u95EE\u9898\u4ECD\u7136\u5B58\u5728\uFF0C\u8BF7\u8054\u7CFB',
        },
        refresh: '\u5237\u65B0',
    },
    fileDownload: {
        success: {
            title: '\u5DF2\u4E0B\u8F7D\uFF01',
            message: '\u9644\u4EF6\u6210\u529F\u4E0B\u8F7D\uFF01',
            qrMessage:
                '\u68C0\u67E5\u60A8\u7684\u7167\u7247\u6216\u4E0B\u8F7D\u6587\u4EF6\u5939\u4E2D\u662F\u5426\u6709\u60A8\u7684QR\u7801\u7684\u526F\u672C\u3002\u4E13\u4E1A\u63D0\u793A\uFF1A\u5C06\u5176\u6DFB\u52A0\u5230\u6F14\u793A\u6587\u7A3F\u4E2D\uFF0C\u8BA9\u60A8\u7684\u89C2\u4F17\u626B\u63CF\u5E76\u76F4\u63A5\u4E0E\u60A8\u8054\u7CFB\u3002',
        },
        generalError: {
            title: '\u9644\u4EF6\u9519\u8BEF',
            message: '\u9644\u4EF6\u65E0\u6CD5\u4E0B\u8F7D\u3002',
        },
        permissionError: {
            title: '\u5B58\u50A8\u8BBF\u95EE',
            message:
                'Expensify\u65E0\u6CD5\u5728\u6CA1\u6709\u5B58\u50A8\u8BBF\u95EE\u6743\u9650\u7684\u60C5\u51B5\u4E0B\u4FDD\u5B58\u9644\u4EF6\u3002\u70B9\u51FB\u8BBE\u7F6E\u4EE5\u66F4\u65B0\u6743\u9650\u3002',
        },
    },
    desktopApplicationMenu: {
        mainMenu: '\u65B0\u7684Expensify',
        about: '\u5173\u4E8E\u65B0\u7684Expensify',
        update: '\u66F4\u65B0\u65B0\u7684Expensify',
        checkForUpdates: '\u68C0\u67E5\u66F4\u65B0',
        toggleDevTools: '\u5207\u6362\u5F00\u53D1\u8005\u5DE5\u5177',
        viewShortcuts: '\u67E5\u770B\u952E\u76D8\u5FEB\u6377\u952E',
        services: '\u670D\u52A1',
        hide: '\u9690\u85CF\u65B0\u7684Expensify',
        hideOthers: '\u9690\u85CF\u5176\u4ED6\u4EBA',
        showAll: '\u663E\u793A\u5168\u90E8',
        quit: '\u9000\u51FA\u65B0\u7684Expensify',
        fileMenu: '\u6587\u4EF6',
        closeWindow: '\u5173\u95ED\u7A97\u53E3',
        editMenu: '\u7F16\u8F91',
        undo: '\u64A4\u9500',
        redo: '\u91CD\u505A',
        cut: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\u3001${count}\u3001${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        copy: '\u590D\u5236',
        paste: 'Sorry, there seems to be a misunderstanding. Could you please provide the text or TypeScript function that you want to be translated into Chinese?',
        pasteAndMatchStyle: '\u7C98\u8D34\u5E76\u5339\u914D\u6837\u5F0F',
        pasteAsPlainText:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        delete: '\u5220\u9664',
        selectAll:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        speechSubmenu: '\u6F14\u8BB2',
        startSpeaking: '\u5F00\u59CB\u8BB2\u8BDD',
        stopSpeaking: '\u505C\u6B62\u8BF4\u8BDD',
        viewMenu: '\u67E5\u770B',
        reload: '\u91CD\u65B0\u52A0\u8F7D',
        forceReload: '\u5F3A\u5236\u91CD\u65B0\u52A0\u8F7D',
        resetZoom: '\u5B9E\u9645\u5927\u5C0F',
        zoomIn: '\u653E\u5927',
        zoomOut: '\u7F29\u5C0F',
        togglefullscreen: '\u5207\u6362\u5168\u5C4F',
        historyMenu: '\u6B77\u53F2',
        back: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u5185\u5BB9\u53EF\u4EE5\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        forward: '\u524D\u8FDB',
        windowMenu: '\u7A97\u53E3',
        minimize: '\u6700\u5C0F\u5316',
        zoom: '\u653E\u5927',
        front: '\u5C06\u6240\u6709\u7F6E\u4E8E\u524D\u7AEF',
        helpMenu: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u95EE\u9898\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        learnMore: '\u4E86\u89E3\u66F4\u591A',
        documentation: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        communityDiscussions: '\u793E\u533A\u8BA8\u8BBA',
        searchIssues: '\u641C\u7D22\u95EE\u9898',
    },
    historyMenu: {
        forward: '\u524D\u8FDB',
        back: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u4EFB\u4F55\u5185\u5BB9\u53EF\u4EE5\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
    },
    checkForUpdatesModal: {
        available: {
            title: '\u53EF\u7528\u7684\u66F4\u65B0',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) => `\u65B0\u7248\u672C\u5373\u5C07\u63A8\u51FA\u3002${!isSilentUpdating ? ' 我們將在準備好更新時通知您。' : ''}`,
            soundsGood:
                "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        },
        notAvailable: {
            title: '\u66F4\u65B0\u4E0D\u53EF\u7528',
            message: '\u73B0\u5728\u6CA1\u6709\u53EF\u7528\u7684\u66F4\u65B0\u3002\u8BF7\u7A0D\u540E\u518D\u68C0\u67E5\uFF01',
            okay: '\u5BF9\u4E0D\u8D77\uFF0C\u6211\u9700\u8981\u5177\u4F53\u7684\u6587\u672C\u624D\u80FD\u8FDB\u884C\u7FFB\u8BD1\u3002',
        },
        error: {
            title: '\u66F4\u65B0\u68C0\u67E5\u5931\u8D25\u3002',
            message: '\u6211\u4EEC\u65E0\u6CD5\u68C0\u67E5\u66F4\u65B0\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        },
    },
    report: {
        genericCreateReportFailureMessage: '\u521B\u5EFA\u6B64\u804A\u5929\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        genericAddCommentFailureMessage: '\u767C\u5E03\u8A55\u8AD6\u6642\u51FA\u73FE\u610F\u5916\u932F\u8AA4\u3002\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002',
        genericUpdateReportFieldFailureMessage: '\u66F4\u65B0\u5B57\u6BB5\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        genericUpdateReporNameEditFailureMessage: '\u91CD\u547D\u540D\u62A5\u544A\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        noActivityYet: '\u5C1A\u672A\u6709\u6D3B\u52A8',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `\u5C07 ${fieldName} \u5F9E ${oldValue} \u66F4\u6539\u70BA ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `\u5DF2\u5C06 ${fieldName} \u66F4\u6539\u4E3A ${newValue}`,
                changePolicy: ({fromPolicy, toPolicy}: ChangePolicyParams) => `\u5DF2\u5C07\u5DE5\u4F5C\u5340\u5F9E ${fromPolicy} \u66F4\u6539\u70BA ${toPolicy}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `\u5F9E ${oldType} \u66F4\u6539\u70BA ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) =>
                    `\u7531\u4E8E${originalManager}\u6B63\u5728\u5EA6\u5047\uFF0C\u6240\u4EE5\u8FD9\u4EFD\u62A5\u544A\u5DF2\u53D1\u9001\u7ED9${delegateUser}`,
                exportedToCSV: `exported this report to CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `\u5DF2\u5C07\u6B64\u5831\u544A\u5C0E\u51FA\u5230 ${label}\u3002`,
                    manual: ({label}: ExportedToIntegrationParams) => `\u5C06\u6B64\u62A5\u544A\u6807\u8BB0\u4E3A\u5DF2\u624B\u52A8\u5BFC\u51FA\u81F3${label}\u3002`,
                    reimburseableLink: '\u67E5\u770B\u81EA\u4ED8\u8D39\u7528\u3002',
                    nonReimbursableLink: '\u67E5\u770B\u516C\u53F8\u5361\u8D39\u7528\u3002',
                    pending: ({label}: ExportedToIntegrationParams) => `\u5DF2\u5F00\u59CB\u5C06\u6B64\u62A5\u544A\u5BFC\u51FA\u81F3${label}...`,
                },
                integrationsMessage: ({errorMessage, label}: IntegrationSyncFailedParams) => `\u65E0\u6CD5\u5C06\u6B64\u62A5\u544A\u5BFC\u51FA\u5230 ${label} ("${errorMessage}")`,
                managerAttachReceipt: `added a receipt`,
                managerDetachReceipt: `removed a receipt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `paid ${currency}${amount} via integration`,
                outdatedBankAccount: `couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounce: `couldn’t process the payment, as the payer doesn’t have sufficient funds`,
                reimbursementACHCancelled: `canceled the payment`,
                reimbursementAccountChanged: `couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `randomly selected for review`,
                selectedForRandomAuditMarkdown: `[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `\u9080\u8BF7\u4E86\u6210\u5458 ${to}`,
                unshare: ({to}: UnshareParams) => `\u5DF2\u79FB\u9664\u6210\u54E1 ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `paid ${currency}${amount}`,
                takeControl: `took control`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `failed to sync with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `\u5DF2\u6DFB\u52A0 ${email} \u4F5C\u4E3A ${role === 'member' || role === 'user' ? '成员' : '管理员'}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) =>
                    `\u5DF2\u5C07${email}\u7684\u89D2\u8272\u66F4\u65B0\u70BA${newRole === 'member' || newRole === 'user' ? 'member' : newRole}\uFF08\u5148\u524D\u70BA${
                        currentRole === 'member' || currentRole === 'user' ? 'member' : currentRole
                    }\uFF09`,
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} left the workspace`,
                removeMember: ({email, role}: AddEmployeeParams) => `\u5DF2\u79FB\u9664 ${role === 'member' || role === 'user' ? 'member' : 'admin'} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `\u5DF2\u79FB\u9664\u4E0E${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}\u7684\u8FDE\u63A5`,
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} for ${dayCount} ${dayCount === 1 ? 'day' : 'days'} until ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} from ${timePeriod} on ${date}`,
    },
    footer: {
        features: '\u7279\u6027',
        expenseManagement: '\u8D39\u7528\u7BA1\u7406',
        spendManagement: '\u652F\u51FA\u7BA1\u7406',
        expenseReports: '\u8D39\u7528\u62A5\u544A',
        companyCreditCard: '\u516C\u53F8\u4FE1\u7528\u5361',
        receiptScanningApp: '\u6536\u64DA\u6383\u63CF\u61C9\u7528\u7A0B\u5F0F',
        billPay: '\u652F\u4ED8\u8D26\u5355',
        invoicing: '\u5F00\u5177\u53D1\u7968',
        CPACard: 'CPA\u5361',
        payroll: '\u5DE5\u8D44\u8868',
        travel: '\u65C5\u884C',
        resources: '\u8D44\u6E90',
        expensifyApproved: 'Expensify\u5DF2\u6279\u51C6\uFF01',
        pressKit: '\u65B0\u95FB\u5305',
        support: '\u652F\u6301',
        expensifyHelp: 'ExpensifyHelp',
        terms: '\u670D\u52A1\u6761\u6B3E',
        privacy: '\u9690\u79C1',
        learnMore: '\u4E86\u89E3\u66F4\u591A',
        aboutExpensify: '\u5173\u4E8EExpensify',
        blog: '\u535A\u5BA2',
        jobs: '\u5DE5\u4F5C',
        expensifyOrg: 'Expensify.org',
        investorRelations: '\u6295\u8D44\u8005\u5173\u7CFB',
        getStarted: '\u5F00\u59CB',
        createAccount: '\u521B\u5EFA\u4E00\u4E2A\u65B0\u8D26\u6237',
        logIn: '\u767B\u5F55',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '\u8FD4\u56DE\u804A\u5929\u5217\u8868',
        chatWelcomeMessage: '\u804A\u5929\u6B22\u8FCE\u4FE1\u606F',
        navigatesToChat: '\u5BFC\u822A\u81F3\u804A\u5929\u5BA4',
        newMessageLineIndicator: '\u65B0\u6D88\u606F\u884C\u6307\u793A\u5668',
        chatMessage: '\u804A\u5929\u4FE1\u606F',
        lastChatMessagePreview: '\u6700\u540E\u7684\u804A\u5929\u6D88\u606F\u9884\u89C8',
        workspaceName: '\u5DE5\u4F5C\u5340\u540D\u7A31',
        chatUserDisplayNames: '\u804A\u5929\u6210\u5458\u663E\u793A\u540D\u79F0',
        scrollToNewestMessages: '\u6EDA\u52A8\u5230\u6700\u65B0\u7684\u6D88\u606F',
        prestyledText: '\u9884\u8BBE\u6587\u672C',
        viewAttachment: '\u67E5\u770B\u9644\u4EF6',
    },
    parentReportAction: {
        deletedReport: '\u5DF2\u5220\u9664\u62A5\u544A',
        deletedMessage: '\u5DF2\u5220\u9664\u7684\u4FE1\u606F',
        deletedExpense: '\u5DF2\u5220\u9664\u7684\u8D39\u7528',
        reversedTransaction: '\u53CD\u5411\u4EA4\u6613',
        deletedTask: '\u5DF2\u5220\u9664\u7684\u4EFB\u52A1',
        hiddenMessage: '\u96B1\u85CF\u8A0A\u606F',
    },
    threads: {
        thread: '\u7EBF\u7A0B',
        replies: '\u56DE\u590D',
        reply: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u60A8\u5E0C\u671B\u5C06\u6587\u672C\u7FFB\u8BD1\u6210\u54EA\u79CD\u8BED\u8A00\uFF1F"ch"\u4E0D\u662F\u4E00\u4E2A\u660E\u786E\u7684\u8BED\u8A00\u4EE3\u7801\u3002\u5982\u679C\u60A8\u80FD\u63D0\u4F9B\u66F4\u591A\u7684\u4FE1\u606F\uFF0C\u6211\u5C06\u5F88\u9AD8\u5174\u4E3A\u60A8\u63D0\u4F9B\u5E2E\u52A9\u3002',
        from: '\u60A8\u7684\u95EE\u9898\u4F3C\u4E4E\u4E0D\u5B8C\u6574\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216\u4EE3\u7801\u3002',
        in: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `From ${reportName}${workspaceName ? ` in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: '\u590D\u5236URL',
        copied: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u5C06\u5E2E\u52A9\u60A8\u5B8C\u6210\u7FFB\u8BD1\u3002',
    },
    moderation: {
        flagDescription: '\u6240\u6709\u88AB\u6807\u8BB0\u7684\u6D88\u606F\u5C06\u4F1A\u88AB\u53D1\u9001\u7ED9\u7248\u4E3B\u8FDB\u884C\u5BA1\u6838\u3002',
        chooseAReason: '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u6807\u8BB0\u7684\u539F\u56E0\uFF1A',
        spam: '\u5783\u573E\u90AE\u4EF6',
        spamDescription: '\u672A\u7ECF\u8BF7\u6C42\u7684\u79BB\u9898\u63A8\u5E7F',
        inconsiderate: '\u4E0D\u987E\u4ED6\u4EBA\u611F\u53D7\u7684',
        inconsiderateDescription: '\u4FAE\u8FB1\u6027\u6216\u4E0D\u5C0A\u91CD\u7684\u63AA\u8FAD\uFF0C\u5E36\u6709\u53EF\u7591\u7684\u610F\u5716',
        intimidation: '\u6050\u5413',
        intimidationDescription: '\u5F3A\u884C\u63A8\u8FDB\u8BAE\u7A0B\uFF0C\u65E0\u89C6\u5408\u7406\u53CD\u5BF9',
        bullying: '\u6B3A\u51CC',
        bullyingDescription: '\u9488\u5BF9\u4E2A\u4EBA\u4EE5\u83B7\u5F97\u670D\u4ECE',
        harassment: '\u9A9A\u6270',
        harassmentDescription: '\u79CD\u65CF\u4E3B\u4E49\uFF0C\u538C\u5973\u75C7\uFF0C\u6216\u5176\u4ED6\u5E7F\u6CDB\u7684\u6B67\u89C6\u884C\u4E3A',
        assault: '\u653B\u51FB',
        assaultDescription: '\u5177\u6709\u4F24\u5BB3\u610F\u56FE\u7684\u9488\u5BF9\u6027\u60C5\u7EEA\u653B\u51FB',
        flaggedContent: '\u6B64\u6D88\u606F\u5DF2\u88AB\u6807\u8BB0\u4E3A\u8FDD\u53CD\u6211\u4EEC\u7684\u793E\u533A\u89C4\u5219\uFF0C\u5185\u5BB9\u5DF2\u88AB\u9690\u85CF\u3002',
        hideMessage: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u60A8\u80FD\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u5417\uFF1F',
        revealMessage: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        levelOneResult: '\u53D1\u9001\u533F\u540D\u8B66\u544A\u5E76\u4E14\u6D88\u606F\u5DF2\u88AB\u62A5\u544A\u8FDB\u884C\u5BA1\u67E5\u3002',
        levelTwoResult:
            '\u6D88\u606F\u5DF2\u4ECE\u9891\u9053\u4E2D\u9690\u85CF\uFF0C\u540C\u65F6\u533F\u540D\u8B66\u544A\u5E76\u4E14\u6D88\u606F\u5DF2\u88AB\u62A5\u544A\u8FDB\u884C\u5BA1\u67E5\u3002',
        levelThreeResult:
            '\u4ECE\u9891\u9053\u4E2D\u5220\u9664\u7684\u6D88\u606F\u52A0\u4E0A\u533F\u540D\u8B66\u544A\uFF0C\u5E76\u4E14\u6D88\u606F\u5DF2\u88AB\u62A5\u544A\u8FDB\u884C\u5BA1\u67E5\u3002',
    },
    actionableMentionWhisperOptions: {
        invite: '\u9080\u8BF7\u4ED6\u4EEC',
        nothing: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '\u63A5\u53D7',
        decline: '\u62D2\u7EDD',
    },
    actionableMentionTrackExpense: {
        submit: '\u5C06\u5176\u63D0\u4EA4\u7ED9\u67D0\u4EBA',
        categorize: '\u5C06\u5176\u5206\u7C7B',
        share: '\u4E0E\u6211\u7684\u4F1A\u8BA1\u5E08\u5206\u4EAB',
        nothing: '\u6682\u65F6\u6CA1\u6709',
    },
    teachersUnitePage: {
        teachersUnite: '\u6559\u5E08\u4EEC\u56E2\u7ED3\u8D77\u6765',
        joinExpensifyOrg:
            '\u52A0\u5165Expensify.org\uFF0C\u6D88\u9664\u4E16\u754C\u5404\u5730\u7684\u4E0D\u516C\u6B63\u3002\u76EE\u524D\u7684"\u6559\u5E08\u8054\u5408"\u6D3B\u52A8\u901A\u8FC7\u5206\u62C5\u5FC5\u9700\u7684\u5B66\u6821\u7528\u54C1\u8D39\u7528\u6765\u652F\u6301\u5168\u7403\u7684\u6559\u80B2\u8005\u3002',
        iKnowATeacher: '\u6211\u8BA4\u8BC6\u4E00\u4F4D\u8001\u5E08',
        iAmATeacher: '\u6211\u662F\u4E00\u540D\u8001\u5E08',
        getInTouch:
            '\u592A\u597D\u4E86\uFF01\u8BF7\u5206\u4EAB\u4ED6\u4EEC\u7684\u4FE1\u606F\uFF0C\u8FD9\u6837\u6211\u4EEC\u5C31\u53EF\u4EE5\u4E0E\u4ED6\u4EEC\u53D6\u5F97\u8054\u7CFB\u3002',
        introSchoolPrincipal: '\u5411\u60A8\u7684\u6821\u957F\u4ECB\u7ECD',
        schoolPrincipalVerfiyExpense:
            'Expensify.org\u5C06\u57FA\u672C\u5B66\u4E60\u7528\u54C1\u7684\u8D39\u7528\u5206\u62C5\uFF0C\u4EE5\u4FBF\u6765\u81EA\u4F4E\u6536\u5165\u5BB6\u5EAD\u7684\u5B66\u751F\u80FD\u591F\u6709\u66F4\u597D\u7684\u5B66\u4E60\u4F53\u9A8C\u3002\u60A8\u7684\u6821\u957F\u5C06\u88AB\u8981\u6C42\u9A8C\u8BC1\u60A8\u7684\u8D39\u7528\u3002',
        principalFirstName: '\u6821\u957F\u7684\u540D\u5B57',
        principalLastName: '\u6821\u957F\u7684\u59D3\u6C0F',
        principalWorkEmail: '\u4E3B\u8981\u5DE5\u4F5C\u7535\u5B50\u90AE\u4EF6',
        updateYourEmail: '\u66F4\u65B0\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
        updateEmail: '\u66F4\u65B0\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
        contactMethods: '\u8054\u7CFB\u65B9\u5F0F\u3002',
        schoolMailAsDefault:
            '\u5728\u60A8\u7EE7\u7EED\u524D\u8FDB\u4E4B\u524D\uFF0C\u8BF7\u786E\u4FDD\u5C06\u60A8\u7684\u5B66\u6821\u7535\u5B50\u90AE\u4EF6\u8BBE\u7F6E\u4E3A\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u3002\u60A8\u53EF\u4EE5\u5728\u8BBE\u7F6E>\u4E2A\u4EBA\u8D44\u6599>\u4E2D\u8FDB\u884C\u6B64\u64CD\u4F5C\u3002',
        error: {
            enterPhoneEmail: '\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801\u3002',
            enterEmail: '\u8F93\u5165\u7535\u5B50\u90AE\u4EF6\u3002',
            enterValidEmail: '\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6\u3002',
            tryDifferentEmail: '\u8ACB\u5617\u8A66\u4F7F\u7528\u4E0D\u540C\u7684\u96FB\u5B50\u90F5\u4EF6\u3002',
        },
    },
    cardTransactions: {
        notActivated: '\u672A\u6FC0\u6D3B',
        outOfPocket: '\u81EA\u4ED8\u6B3E\u9879',
        companySpend: '\u516C\u53F8\u652F\u51FA',
    },
    distance: {
        addStop: '\u6DFB\u52A0\u505C\u6B62',
        deleteWaypoint: '\u5220\u9664\u822A\u70B9',
        deleteWaypointConfirmation: '\u4F60\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u822A\u70B9\u5417\uFF1F',
        address: '\u5730\u5740',
        waypointDescription: {
            start: "\u8FD9\u662F\u4E00\u4E2A\u7EAF\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u5360\u4F4D\u7B26\uFF0C\u5982 ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
            stop: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        },
        mapPending: {
            title: '\u5F85\u5904\u7406\u5730\u56FE',
            subtitle: '\u5F53\u4F60\u91CD\u65B0\u4E0A\u7EBF\u65F6\uFF0C\u5730\u56FE\u5C06\u4F1A\u751F\u6210',
            onlineSubtitle: '\u8BF7\u7A0D\u7B49\uFF0C\u6211\u4EEC\u6B63\u5728\u8BBE\u7F6E\u5730\u56FE',
            errorTitle: '\u5730\u56FE\u9519\u8BEF',
            errorSubtitle: '\u52A0\u8F7D\u5730\u56FE\u65F6\u51FA\u73B0\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        },
        error: {
            selectSuggestedAddress: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u5EFA\u8BAE\u7684\u5730\u5740\u6216\u4F7F\u7528\u5F53\u524D\u4F4D\u7F6E\u3002',
        },
    },
    reportCardLostOrDamaged: {
        report: '\u62A5\u544A\u5B9E\u4F53\u5361\u4E22\u5931/\u635F\u574F',
        screenTitle: '\u62A5\u544A\u5361\u4E22\u5931\u6216\u635F\u574F',
        nextButtonLabel:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        reasonTitle: '\u4E3A\u4EC0\u4E48\u4F60\u9700\u8981\u4E00\u5F20\u65B0\u5361\uFF1F',
        cardDamaged: '\u6211\u7684\u5361\u88AB\u640D\u58DE\u4E86',
        cardLostOrStolen: '\u6211\u7684\u5361\u4E1F\u5931\u6216\u88AB\u5077\u4E86',
        confirmAddressTitle: '\u8BF7\u786E\u8BA4\u60A8\u65B0\u5361\u7684\u90AE\u5BC4\u5730\u5740\u3002',
        cardDamagedInfo:
            '\u60A8\u7684\u65B0\u5361\u5C06\u57282-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8FBE\u3002\u5728\u60A8\u6FC0\u6D3B\u65B0\u5361\u4E4B\u524D\uFF0C\u60A8\u5F53\u524D\u7684\u5361\u5C06\u7EE7\u7EED\u5DE5\u4F5C\u3002',
        cardLostOrStolenInfo:
            '\u60A8\u7684\u5F53\u524D\u5361\u7247\u5C06\u5728\u60A8\u4E0B\u8BA2\u5355\u540E\u7ACB\u5373\u88AB\u6C38\u4E45\u505C\u7528\u3002\u5927\u591A\u6570\u5361\u7247\u4F1A\u5728\u51E0\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8FBE\u3002',
        address: '\u5730\u5740',
        deactivateCardButton: '\u505C\u7528\u5361\u7247',
        shipNewCardButton: '\u53D1\u9001\u65B0\u5361',
        addressError: '\u9700\u8981\u5730\u5740',
        reasonError: '\u9700\u8981\u7406\u7531',
    },
    eReceipt: {
        guaranteed: '\u4FDD\u8B49\u96FB\u5B50\u6536\u64DA',
        transactionDate: '\u4EA4\u6613\u65E5\u671F',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: '\u5F00\u59CB\u804A\u5929\uFF0C',
            buttonText2: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `\u958B\u59CB\u804A\u5929\uFF0C\u7372\u5F97 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `\u5411\u4F60\u7684\u670B\u53CB\u4EEC\u8BF4\u8BDD\u5E76\u83B7\u5F97\u62A5\u916C\uFF01\u5F00\u59CB\u4E0E\u65B0\u7684Expensify\u8D26\u6237\u804A\u5929\uFF0C\u5F53\u4ED6\u4EEC\u6210\u4E3A\u5BA2\u6237\u65F6\uFF0C\u4F60\u5C06\u83B7\u5F97$${CONST.REFERRAL_PROGRAM.REVENUE}\u3002`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: '\u63D0\u4EA4\u4E00\u9879\u8D39\u7528\uFF0C',
            buttonText2: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `\u63D0\u4EA4\u4E00\u9879\u8D39\u7528\uFF0C\u83B7\u5F97 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `\u8FD9\u662F\u503C\u5F97\u7684\uFF01\u5411\u65B0\u7684Expensify\u8D26\u6237\u63D0\u4EA4\u4E00\u7B14\u8D39\u7528\uFF0C\u5F53\u4ED6\u4EEC\u6210\u4E3A\u5BA2\u6237\u65F6\uFF0C\u60A8\u5C06\u83B7\u5F97$${CONST.REFERRAL_PROGRAM.REVENUE}\u3002`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.PAY_SOMEONE]: {
            buttonText1: '\u652F\u4ED8\u67D0\u4EBA\uFF0C',
            buttonText2: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `\u652F\u4ED8\u67D0\u4EBA\uFF0C\u83B7\u5F97$${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `\u4F60\u5F97\u82B1\u94B1\u624D\u80FD\u8D5A\u94B1\uFF01\u901A\u8FC7Expensify\u652F\u4ED8\u7ED9\u67D0\u4EBA\uFF0C\u5E76\u5728\u4ED6\u4EEC\u6210\u4E3A\u5BA2\u6237\u65F6\u83B7\u5F97$${CONST.REFERRAL_PROGRAM.REVENUE}\u3002`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            buttonText1: '\u9080\u8BF7\u4E00\u4F4D\u670B\u53CB\uFF0C',
            buttonText2: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `\u4E0E\u670B\u53CB\u804A\u5929\uFF0C\u4ED8\u6B3E\uFF0C\u63D0\u4EA4\u6216\u5206\u644A\u8D39\u7528\uFF0C\u5F53\u4ED6\u4EEC\u6210\u4E3A\u5BA2\u6237\u65F6\uFF0C\u60A8\u5C06\u83B7\u5F97$${CONST.REFERRAL_PROGRAM.REVENUE}\u3002\u5426\u5219\uFF0C\u53EA\u9700\u5206\u4EAB\u60A8\u7684\u9080\u8BF7\u94FE\u63A5\uFF01`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText1: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            header: `\u83B7\u53D6 $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            body: `\u4E0E\u670B\u53CB\u804A\u5929\uFF0C\u4ED8\u6B3E\uFF0C\u63D0\u4EA4\u6216\u5206\u644A\u8D39\u7528\uFF0C\u5F53\u4ED6\u4EEC\u6210\u4E3A\u5BA2\u6237\u65F6\uFF0C\u60A8\u5C06\u83B7\u5F97$${CONST.REFERRAL_PROGRAM.REVENUE}\u3002\u5426\u5219\uFF0C\u53EA\u9700\u5206\u4EAB\u60A8\u7684\u9080\u8BF7\u94FE\u63A5\uFF01`,
        },
        copyReferralLink: '\u590D\u5236\u9080\u8BF7\u94FE\u63A5',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: '\u5728\u4E2D\u6587\u4E2D\uFF0C\u8FD9\u5C06\u88AB\u7FFB\u8BD1\u4E3A"\u4E0E\u60A8\u7684\u8BBE\u7F6E\u4E13\u5BB6\u804A\u5929"\u3002',
            phrase2: '\u6C42\u52A9',
        },
        default: {
            phrase1: '\u4FE1\u606F',
            phrase2: '\u6709\u5173\u8BBE\u7F6E\u7684\u5E2E\u52A9',
        },
    },
    violations: {
        allTagLevelsRequired: '\u9700\u8981\u6240\u6709\u7684\u6807\u7B7E',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) => `${rejectedBy} rejected this expense with the comment "${rejectReason}"`,
        billableExpense: '\u8BA1\u8D39\u4E0D\u518D\u6709\u6548',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `\u9700\u8981\u6536\u636E${formattedLimit ? ` 超过 ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '\u5206\u7C7B\u4E0D\u518D\u6709\u6548',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `\u5DF2\u61C9\u7528 ${surcharge}% \u63DB\u7B97\u9644\u52A0\u8CBB`,
        customUnitOutOfPolicy: '\u6B64\u5DE5\u4F5C\u5340\u7684\u8CBB\u7387\u7121\u6548',
        duplicatedTransaction:
            "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u7684\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u4ED6\u4EEC\u7684\u5185\u5BB9\u6216\u8005\u79FB\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u4ED6\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
        fieldRequired: '\u62A5\u544A\u5B57\u6BB5\u662F\u5FC5\u9700\u7684',
        futureDate: '\u4E0D\u5141\u8BB8\u4F7F\u7528\u672A\u6765\u65E5\u671F',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `\u7531${invoiceMarkup}%\u6A19\u8A18`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `\u65E5\u671F\u8D85\u8FC7${maxAge}\u5929`,
        missingCategory: '\u7F3A\u5C11\u7C7B\u522B',
        missingComment: '\u4E3A\u6240\u9009\u7C7B\u522B\u63D0\u4F9B\u63CF\u8FF0',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `\u7F3A\u5C11 ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '\u91D1\u989D\u4E0E\u8BA1\u7B97\u8DDD\u79BB\u4E0D\u7B26';
                case 'card':
                    return '\u91D1\u989D\u5927\u4E8E\u5361\u4EA4\u6613';
                default:
                    if (displayPercentVariance) {
                        return `\u91D1\u989D\u6BD4\u626B\u63CF\u7684\u6536\u636E\u9AD8\u51FA${displayPercentVariance}%`;
                    }
                    return '\u626B\u63CF\u6536\u636E\u7684\u91D1\u989D\u5927\u4E8E';
            }
        },
        modifiedDate: '\u626B\u63CF\u6536\u636E\u7684\u65E5\u671F\u6709\u6240\u4E0D\u540C',
        nonExpensiworksExpense: '\u975EExpensiworks\u8D39\u7528',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `\u8D39\u7528\u8D85\u8FC7\u4E86\u81EA\u52A8\u6279\u51C6\u7684\u9650\u989D${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `\u8D85\u8FC7\u6BCF\u4EBA\u7C7B\u522B\u9650\u5236\u7684${formattedLimit}\u91D1\u989D`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `\u8D85\u8FC7\u6BCF\u4EBA${formattedLimit}\u7684\u9650\u989D`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `\u8D85\u8FC7\u6BCF\u4EBA${formattedLimit}\u7684\u9650\u989D`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `\u8D85\u8FC7\u6BCF\u65E5${formattedLimit}/\u4EBA\u7C7B\u522B\u9650\u989D\u7684\u91D1\u989D`,
        receiptNotSmartScanned: '\u6536\u64DA\u6383\u63CF\u4E0D\u5B8C\u6574\u3002\u8ACB\u624B\u52D5\u9A57\u8B49\u8A73\u7D30\u4FE1\u606F\u3002',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = '\u9700\u8981\u6536\u64DA';
            if (formattedLimit ?? category) {
                message += '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += ' \u7C7B\u522B\u9650\u5236';
                }
            }
            return message;
        },
        reviewRequired: '\u9700\u8981\u5BA1\u67E5',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u51FA\u73B0\u95EE\u9898\uFF0C\u65E0\u6CD5\u81EA\u52A8\u5339\u914D\u6536\u636E\uFF0C\u9700\u8981${email}\u8FDB\u884C\u4FEE\u590D`
                    : '\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u51FA\u73B0\u6545\u969C\uFF0C\u65E0\u6CD5\u81EA\u52A8\u5339\u914D\u6536\u636E\uFF0C\u60A8\u9700\u8981\u8FDB\u884C\u4FEE\u590D';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `\u8BF7${member}\u6807\u8BB0\u4E3A\u73B0\u91D1\uFF0C\u6216\u7B49\u5F857\u5929\u540E\u518D\u8BD5` : '\u7B49\u5F85\u4E0E\u5361\u4EA4\u6613\u5408\u5E76\u3002';
            }
            return '';
        },
        brokenConnection530Error: '\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u65AD\u5F00\uFF0C\u6536\u636E\u5F85\u5904\u7406\u3002',
        adminBrokenConnectionError:
            "\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u65AD\u5F00\uFF0C\u6536\u636E\u6682\u65F6\u6302\u8D77\u3002\u8BF7\u5728 ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u89E3\u51B3\u6B64\u95EE\u9898\u3002",
        memberBrokenConnectionError:
            '\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u6536\u636E\u5F85\u5904\u7406\u3002\u8BF7\u8BE2\u95EE\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\u6765\u89E3\u51B3\u3002',
        markAsCashToIgnore: '\u5C06\u5176\u6807\u8BB0\u4E3A\u73B0\u91D1\u4EE5\u5FFD\u7565\u5E76\u8BF7\u6C42\u4ED8\u6B3E\u3002',
        smartscanFailed: '\u6536\u64DA\u6383\u63CF\u5931\u6557\u3002\u8ACB\u624B\u52D5\u8F38\u5165\u8A73\u7D30\u4FE1\u606F\u3002',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `\u7F3A\u5C11 ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} no longer valid`,
        taxAmountChanged: '\u7A05\u91D1\u6578\u984D\u5DF2\u88AB\u4FEE\u6539',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tax'} no longer valid`,
        taxRateChanged: '\u7A05\u7387\u5DF2\u88AB\u4FEE\u6539',
        taxRequired: '\u7F3A\u5C11\u7A0E\u7387',
        none: 'The instruction is not clear. Please provide the text or TypeScript function that needs to be translated.',
        taxCodeToKeep: '\u9009\u62E9\u8981\u4FDD\u7559\u7684\u7A0E\u52A1\u4EE3\u7801',
        tagToKeep: '\u9009\u62E9\u8981\u4FDD\u7559\u7684\u6807\u7B7E',
        isTransactionReimbursable: '\u9009\u62E9\u4EA4\u6613\u662F\u5426\u53EF\u62A5\u9500',
        merchantToKeep: '\u9009\u62E9\u8981\u4FDD\u7559\u54EA\u4E2A\u5546\u5BB6',
        descriptionToKeep: '\u9009\u62E9\u4FDD\u7559\u54EA\u4E2A\u63CF\u8FF0',
        categoryToKeep: '\u9009\u62E9\u8981\u4FDD\u7559\u7684\u7C7B\u522B',
        isTransactionBillable: '\u9009\u62E9\u4EA4\u6613\u662F\u5426\u8BA1\u8D39',
        keepThisOne: '\u4FDD\u7559\u8FD9\u4E2A',
        confirmDetails: `Confirm the details you're keeping`,
        confirmDuplicatesInfo: `The duplicate requests you don't keep will be held for the member to delete`,
        hold: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that you want to translate into Chinese?',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is required`,
    },
    violationDismissal: {
        rter: {
            manual: '\u5C06\u6B64\u6536\u636E\u6807\u8BB0\u4E3A\u73B0\u91D1',
        },
        duplicatedTransaction: {
            manual: '\u89E3\u51B3\u4E86\u91CD\u590D\u95EE\u9898',
        },
    },
    videoPlayer: {
        play: '\u64AD\u653E',
        pause: '\u6682\u505C',
        fullscreen: '\u5168\u5C4F',
        playbackSpeed: '\u64AD\u653E\u901F\u5EA6',
        expand: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\uFF0C\u6216\u8005\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684 TypeScript \u51FD\u6570\u3002\u4FDD\u7559\u50CF ${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6 TypeScript \u4EE3\u7801\u3002",
        mute: '\u9759\u97F3',
        unmute: '\u53D6\u6D88\u9759\u97F3',
        normal: '\u6B63\u5E38',
    },
    exitSurvey: {
        header: '\u5728\u4F60\u8D70\u4E4B\u524D',
        reasonPage: {
            title: '\u8BF7\u544A\u8BC9\u6211\u4EEC\u4F60\u4E3A\u4EC0\u4E48\u8981\u79BB\u5F00',
            subtitle: '\u5728\u60A8\u79BB\u5F00\u4E4B\u524D\uFF0C\u8BF7\u544A\u8BC9\u6211\u4EEC\u60A8\u4E3A\u4EC0\u4E48\u60F3\u5207\u6362\u5230Expensify Classic\u3002',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '\u6211\u9700\u8981\u4E00\u4E2A\u53EA\u5728Expensify Classic\u4E2D\u53EF\u7528\u7684\u529F\u80FD\u3002',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '\u6211\u4E0D\u660E\u767D\u5982\u4F55\u4F7F\u7528New Expensify\u3002',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]:
                '\u6211\u660E\u767D\u5982\u4F55\u4F7F\u7528\u65B0\u7684Expensify\uFF0C\u4F46\u6211\u66F4\u559C\u6B22\u4F7F\u7528Expensify Classic\u3002',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '\u60A8\u9700\u8981\u4EC0\u4E48\u529F\u80FD\u662FNew Expensify\u4E2D\u4E0D\u53EF\u7528\u7684\uFF1F',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]:
                'Sorry for the confusion, but your request seems to be incomplete. You mentioned "Translate the following text to ch." but didn\'t provide the text to be translated. Could you please provide the text and specify what language "ch" refers to?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '\u4E3A\u4EC0\u4E48\u4F60\u66F4\u559C\u6B22\u4F7F\u7528Expensify Classic\uFF1F',
        },
        responsePlaceholder: 'As an AI, I need the specific text to translate. Please provide the text for translation.',
        thankYou: '\u611F\u8C22\u60A8\u7684\u53CD\u9988\uFF01',
        thankYouSubtitle:
            '\u60A8\u7684\u53CD\u9988\u5C06\u5E2E\u52A9\u6211\u4EEC\u6253\u9020\u66F4\u597D\u7684\u4EA7\u54C1\u6765\u5B8C\u6210\u4EFB\u52A1\u3002\u975E\u5E38\u611F\u8C22\u60A8\uFF01',
        goToExpensifyClassic: '\u5207\u6362\u5230Expensify Classic',
        offlineTitle: '\u770B\u8D77\u6765\u4F60\u5728\u8FD9\u91CC\u9047\u5230\u4E86\u56F0\u96BE...',
        offline:
            '\u60A8\u4F3C\u4E4E\u5904\u4E8E\u79BB\u7EBF\u72B6\u6001\u3002\u4E0D\u5E78\u7684\u662F\uFF0CExpensify Classic\u65E0\u6CD5\u5728\u79BB\u7EBF\u72B6\u6001\u4E0B\u5DE5\u4F5C\uFF0C\u4F46\u662FNew Expensify\u53EF\u4EE5\u3002\u5982\u679C\u60A8\u66F4\u559C\u6B22\u4F7F\u7528Expensify Classic\uFF0C\u8BF7\u5728\u60A8\u6709\u4E92\u8054\u7F51\u8FDE\u63A5\u65F6\u518D\u8BD5\u3002',
        quickTip: '\u5FEB\u901F\u63D0\u793A...',
        quickTipSubTitle:
            '\u60A8\u53EF\u4EE5\u76F4\u63A5\u8BBF\u95EE expensify.com \u8FDB\u5165 Expensify Classic\u3002\u5C06\u5176\u52A0\u5165\u4E66\u7B7E\uFF0C\u4FBF\u4E8E\u5FEB\u901F\u8BBF\u95EE\uFF01',
        bookACall: '\u9884\u8BA2\u7535\u8BDD\u4F1A\u8BAE',
        noThanks: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        bookACallTitle: '\u4F60\u60F3\u8DDF\u4EA7\u54C1\u7ECF\u7406\u4EA4\u8C08\u5417\uFF1F',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '\u76F4\u63A5\u5728\u8D39\u7528\u548C\u62A5\u544A\u4E0A\u804A\u5929',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '\u80FD\u5920\u5728\u624B\u6A5F\u4E0A\u505A\u6240\u6709\u4E8B\u60C5',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '\u4EE5\u804A\u5929\u7684\u901F\u5EA6\u8FDB\u884C\u65C5\u884C\u548C\u6D88\u8D39',
        },
        bookACallTextTop: '\u5207\u6362\u5230Expensify Classic\u540E\uFF0C\u60A8\u5C06\u9519\u8FC7\uFF1A',
        bookACallTextBottom:
            '\u6211\u4EEC\u975E\u5E38\u671F\u5F85\u4E0E\u60A8\u901A\u8BDD\uFF0C\u4EE5\u4E86\u89E3\u539F\u56E0\u3002\u60A8\u53EF\u4EE5\u9884\u7EA6\u6211\u4EEC\u7684\u4E00\u4F4D\u9AD8\u7EA7\u4EA7\u54C1\u7ECF\u7406\u6765\u8BA8\u8BBA\u60A8\u7684\u9700\u6C42\u3002',
        takeMeToExpensifyClassic: '\u5E26\u6211\u53BBExpensify Classic',
    },
    listBoundary: {
        errorMessage: '\u52A0\u8F7D\u66F4\u591A\u6D88\u606F\u65F6\u53D1\u751F\u9519\u8BEF\u3002',
        tryAgain: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
    },
    systemMessage: {
        mergedWithCashTransaction: '\u5C06\u6536\u636E\u5339\u914D\u5230\u6B64\u4EA4\u6613',
    },
    subscription: {
        authenticatePaymentCard: '\u9A8C\u8BC1\u4ED8\u6B3E\u5361',
        mobileReducedFunctionalityMessage: '\u60A8\u4E0D\u80FD\u5728\u79FB\u52A8\u5E94\u7528\u7A0B\u5E8F\u4E2D\u66F4\u6539\u60A8\u7684\u8BA2\u9605\u3002',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `\u514D\u8D39\u8BD5\u7528\uFF1A${numOfDays} ${numOfDays === 1 ? '天' : '天'} \u5269\u4F59`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u4FE1\u606F\u5DF2\u8FC7\u671F',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `\u8BF7\u5728${date}\u4E4B\u524D\u66F4\u65B0\u60A8\u7684\u4ED8\u6B3E\u5361\uFF0C\u4EE5\u7EE7\u7EED\u4F7F\u7528\u60A8\u6700\u559C\u6B22\u7684\u6240\u6709\u529F\u80FD\u3002`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u4FE1\u606F\u5DF2\u8FC7\u671F',
                subtitle: '\u8ACB\u66F4\u65B0\u60A8\u7684\u4ED8\u6B3E\u8CC7\u8A0A\u3002',
            },
            policyOwnerUnderInvoicing: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u4FE1\u606F\u5DF2\u8FC7\u671F',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `\u60A8\u7684\u4ED8\u6B3E\u5DF2\u903E\u671F\u3002\u8ACB\u5728${date}\u4E4B\u524D\u652F\u4ED8\u60A8\u7684\u767C\u7968\uFF0C\u4EE5\u907F\u514D\u670D\u52D9\u4E2D\u65B7\u3002`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u4FE1\u606F\u5DF2\u8FC7\u671F',
                subtitle: '\u60A8\u7684\u4ED8\u6B3E\u5DF2\u903E\u671F\u3002\u8BF7\u652F\u4ED8\u60A8\u7684\u53D1\u7968\u3002',
            },
            billingDisputePending: {
                title: '\u60A8\u7684\u5361\u65E0\u6CD5\u88AB\u6263\u6B3E',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `\u60A8\u5DF2\u5BF9\u4EE5${cardEnding}\u7ED3\u5C3E\u7684\u5361\u4E0A\u7684${amountOwed}\u8D39\u7528\u63D0\u51FA\u4E89\u8BAE\u3002\u5728\u4E0E\u60A8\u7684\u94F6\u884C\u89E3\u51B3\u4E89\u8BAE\u4E4B\u524D\uFF0C\u60A8\u7684\u8D26\u6237\u5C06\u88AB\u9501\u5B9A\u3002`,
            },
            cardAuthenticationRequired: {
                title: '\u60A8\u7684\u5361\u65E0\u6CD5\u88AB\u6263\u6B3E',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `\u60A8\u7684\u4ED8\u6B3E\u5361\u5C1A\u672A\u5B8C\u5168\u8BA4\u8BC1\u3002\u8BF7\u5B8C\u6210\u8BA4\u8BC1\u8FC7\u7A0B\u4EE5\u6FC0\u6D3B\u60A8\u7684\u5C3E\u53F7\u4E3A${cardEnding}\u7684\u4ED8\u6B3E\u5361\u3002`,
            },
            insufficientFunds: {
                title: '\u60A8\u7684\u5361\u65E0\u6CD5\u88AB\u6263\u6B3E',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `\u7531\u4E8E\u8D44\u91D1\u4E0D\u8DB3\uFF0C\u60A8\u7684\u4ED8\u6B3E\u5361\u88AB\u62D2\u7EDD\u3002\u8BF7\u91CD\u8BD5\u6216\u6DFB\u52A0\u65B0\u7684\u4ED8\u6B3E\u5361\u4EE5\u6E05\u9664\u60A8\u7684${amountOwed}\u672A\u4ED8\u4F59\u989D\u3002`,
            },
            cardExpired: {
                title: '\u60A8\u7684\u5361\u65E0\u6CD5\u88AB\u6263\u6B3E',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `\u60A8\u7684\u4ED8\u6B3E\u5361\u5DF2\u8FC7\u671F\u3002\u8BF7\u6DFB\u52A0\u65B0\u7684\u4ED8\u6B3E\u5361\u4EE5\u6E05\u9664\u60A8\u7684${amountOwed}\u672A\u4ED8\u4F59\u989D\u3002`,
            },
            cardExpireSoon: {
                title: '\u60A8\u7684\u5361\u7247\u5373\u5C07\u5230\u671F',
                subtitle:
                    '\u60A8\u7684\u4ED8\u6B3E\u5361\u5C07\u5728\u672C\u6708\u5E95\u5230\u671F\u3002\u9EDE\u64CA\u4E0B\u65B9\u7684\u4E09\u9EDE\u83DC\u55AE\u4EE5\u66F4\u65B0\u5B83\uFF0C\u4E26\u7E7C\u7E8C\u4F7F\u7528\u60A8\u6240\u6709\u559C\u611B\u7684\u529F\u80FD\u3002',
            },
            retryBillingSuccess: {
                title: '\u6210\u529F\uFF01',
                subtitle: '\u60A8\u7684\u5361\u5DF2\u6210\u529F\u6263\u6B3E\u3002',
            },
            retryBillingError: {
                title: '\u60A8\u7684\u5361\u65E0\u6CD5\u88AB\u6263\u6B3E',
                subtitle:
                    '\u5728\u91CD\u8A66\u4E4B\u524D\uFF0C\u8ACB\u76F4\u63A5\u81F4\u96FB\u60A8\u7684\u9280\u884C\u4EE5\u6388\u6B0AExpensify\u7684\u6536\u8CBB\u4E26\u79FB\u9664\u4EFB\u4F55\u4FDD\u7559\u3002\u5426\u5247\uFF0C\u5617\u8A66\u6DFB\u52A0\u53E6\u4E00\u5F35\u4ED8\u6B3E\u5361\u3002',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `\u60A8\u5DF2\u5BF9\u4EE5${cardEnding}\u7ED3\u5C3E\u7684\u5361\u4E0A\u7684${amountOwed}\u8D39\u7528\u63D0\u51FA\u4E89\u8BAE\u3002\u5728\u4E0E\u60A8\u7684\u94F6\u884C\u89E3\u51B3\u4E89\u8BAE\u4E4B\u524D\uFF0C\u60A8\u7684\u8D26\u6237\u5C06\u88AB\u9501\u5B9A\u3002`,
            preTrial: {
                title: '\u5F00\u59CB\u514D\u8D39\u8BD5\u7528',
                subtitleStart: '\u4F5C\u4E3A\u4E0B\u4E00\u6B65\uFF0C',
                subtitleLink: '\u5B8C\u6210\u60A8\u7684\u8BBE\u7F6E\u6E05\u5355',
                subtitleEnd: '\u6240\u4EE5\u4F60\u7684\u56E2\u961F\u53EF\u4EE5\u5F00\u59CB\u62A5\u9500\u3002',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `\u8BD5\u7528\uFF1A\u8FD8\u5269${numOfDays} ${numOfDays === 1 ? '天' : '天'}\uFF01`,
                subtitle: '\u7E7C\u7E8C\u4F7F\u7528\u6240\u6709\u60A8\u6700\u559C\u611B\u7684\u529F\u80FD\uFF0C\u8ACB\u6DFB\u52A0\u4E00\u5F35\u4ED8\u6B3E\u5361\u3002',
            },
            trialEnded: {
                title: '\u60A8\u7684\u514D\u8D39\u8BD5\u7528\u671F\u5DF2\u7ED3\u675F',
                subtitle: '\u7E7C\u7E8C\u4F7F\u7528\u6240\u6709\u60A8\u6700\u559C\u611B\u7684\u529F\u80FD\uFF0C\u8ACB\u6DFB\u52A0\u4E00\u5F35\u4ED8\u6B3E\u5361\u3002',
            },
            earlyDiscount: {
                claimOffer: '\u7D22\u53D6\u4F18\u60E0',
                noThanks: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u4EFB\u4F55\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `\u60A8\u7684\u7B2C\u4E00\u5E74\u4EAB\u6709${discountType}%\u7684\u6298\u6263\uFF01`,
                    phrase2: `Just add a payment card and start an annual subscription.`,
                },
                onboardingChatTitle: {
                    phrase1: '\u9650\u6642\u512A\u60E0\uFF1A',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `\u60A8\u7684\u7B2C\u4E00\u5E74\u4EAB\u6709${discountType}%\u7684\u6298\u6263\uFF01`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Claim within ${days > 0 ? `${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: '\u4ED8\u6B3E',
            subtitle: '\u4E3A\u60A8\u7684Expensify\u8BA2\u9605\u6DFB\u52A0\u4E00\u5F20\u652F\u4ED8\u5361\u3002',
            addCardButton: '\u6DFB\u52A0\u4ED8\u6B3E\u5361',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `\u60A8\u7684\u4E0B\u4E00\u6B21\u4ED8\u6B3E\u65E5\u671F\u662F${nextPaymentDate}\u3002`,
            cardEnding: ({cardNumber}: CardEndingParams) => `\u7D50\u675F\u65BC ${cardNumber} \u7684\u5361`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `\u540D\u79F0\uFF1A${name}\uFF0C\u6709\u6548\u671F\uFF1A${expiration}\uFF0C\u8D27\u5E01\uFF1A${currency}`,
            changeCard: '\u66F4\u6539\u4ED8\u6B3E\u5361',
            changeCurrency: '\u66F4\u6539\u4ED8\u6B3E\u8D27\u5E01',
            cardNotFound: '\u672A\u6DFB\u52A0\u4ED8\u6B3E\u5361',
            retryPaymentButton: '\u91CD\u8BD5\u4ED8\u6B3E',
            authenticatePayment: '\u9A8C\u8BC1\u4ED8\u6B3E',
            requestRefund: '\u8BF7\u6C42\u9000\u6B3E',
            requestRefundModal: {
                phrase1:
                    '\u7372\u5F97\u9000\u6B3E\u5F88\u5BB9\u6613\uFF0C\u53EA\u9700\u5728\u4E0B\u4E00\u500B\u5E33\u55AE\u65E5\u671F\u4E4B\u524D\u964D\u7D1A\u60A8\u7684\u5E33\u6236\uFF0C\u60A8\u5C31\u6703\u6536\u5230\u9000\u6B3E\u3002',
                phrase2:
                    '\u6CE8\u610F\uFF1A\u964D\u7EA7\u60A8\u7684\u5E10\u6237\u610F\u5473\u7740\u60A8\u7684\u5DE5\u4F5C\u533A\u5C06\u88AB\u5220\u9664\u3002\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\uFF0C\u4F46\u5982\u679C\u60A8\u6539\u53D8\u4E3B\u610F\uFF0C\u60A8\u59CB\u7EC8\u53EF\u4EE5\u521B\u5EFA\u65B0\u7684\u5DE5\u4F5C\u533A\u3002',
                confirm: '\u5220\u9664\u5DE5\u4F5C\u533A\u5E76\u964D\u7EA7',
            },
            viewPaymentHistory: '\u67E5\u770B\u4ED8\u6B3E\u5386\u53F2',
        },
        yourPlan: {
            title: '\u4F60\u7684\u8BA1\u5212',
            collect: {
                title: '\u6536\u96C6',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `\u64C1\u6709Expensify\u5361\u7684${lower}/\u6D3B\u8E8D\u6703\u54E1\uFF0C\u6C92\u6709Expensify\u5361\u7684${upper}/\u6D3B\u8E8D\u6703\u54E1\u3002`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `\u64C1\u6709Expensify\u5361\u7684${lower}/\u6D3B\u8E8D\u6703\u54E1\uFF0C\u6C92\u6709Expensify\u5361\u7684${upper}/\u6D3B\u8E8D\u6703\u54E1\u3002`,
                benefit1: '\u65E0\u9650\u5236\u7684SmartScans\u548C\u8DDD\u79BB\u8DDF\u8E2A',
                benefit2: '\u5E26\u6709\u667A\u80FD\u9650\u5236\u7684Expensify\u5361',
                benefit3: '\u652F\u4ED8\u8D26\u5355\u548C\u53D1\u7968',
                benefit4: '\u8D39\u7528\u5BA1\u6279',
                benefit5: 'ACH\u9000\u6B3E',
                benefit6: 'QuickBooks\u548CXero\u96C6\u6210',
                benefit7: '\u81EA\u5B9A\u4E49\u6D1E\u5BDF\u548C\u62A5\u544A',
            },
            control: {
                title: '\u63A7\u5236',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `\u64C1\u6709Expensify\u5361\u7684${lower}/\u6D3B\u8E8D\u6703\u54E1\uFF0C\u6C92\u6709Expensify\u5361\u7684${upper}/\u6D3B\u8E8D\u6703\u54E1\u3002`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `\u64C1\u6709Expensify\u5361\u7684${lower}/\u6D3B\u8E8D\u6703\u54E1\uFF0C\u6C92\u6709Expensify\u5361\u7684${upper}/\u6D3B\u8E8D\u6703\u54E1\u3002`,
                benefit1: 'Collect\u4E2D\u7684\u6240\u6709\u5185\u5BB9\uFF0C\u518D\u52A0\u4E0A\uFF1A',
                benefit2: 'NetSuite \u548C Sage Intacct \u96C6\u6210',
                benefit3: 'Certinia\u548CWorkday\u540C\u6B65',
                benefit4: '\u591A\u4E2A\u8D39\u7528\u5BA1\u6279\u4EBA',
                benefit5: 'SAML/SSO',
                benefit6: '\u9884\u7B97\u7F16\u5236',
            },
            saveWithExpensifyTitle: '\u4F7F\u7528Expensify\u5361\u8FDB\u884C\u50A8\u84C4',
            saveWithExpensifyDescription:
                '\u4F7F\u7528\u6211\u4EEC\u7684\u50A8\u84C4\u8BA1\u7B97\u5668\uFF0C\u770B\u770BExpensify\u5361\u7684\u73B0\u91D1\u56DE\u9988\u5982\u4F55\u51CF\u5C11\u60A8\u7684Expensify\u8D26\u5355\u3002',
            saveWithExpensifyButton: '\u4E86\u89E3\u66F4\u591A',
        },
        details: {
            title: '\u8A02\u95B1\u8A73\u60C5',
            annual: '\u5E74\u5EA6\u8A02\u95B1',
            taxExempt: '\u7533\u8BF7\u514D\u7A0E\u72B6\u6001',
            taxExemptEnabled: '\u514D\u7A0E',
            payPerUse: '\u6309\u6B21\u4ED8\u8D39',
            subscriptionSize: '\u8A02\u95B1\u5927\u5C0F',
            headsUp:
                '\u6CE8\u610F\uFF1A\u5982\u679C\u60A8\u73B0\u5728\u4E0D\u8BBE\u7F6E\u60A8\u7684\u8BA2\u9605\u89C4\u6A21\uFF0C\u6211\u4EEC\u5C06\u4F1A\u6839\u636E\u60A8\u7B2C\u4E00\u4E2A\u6708\u7684\u6D3B\u8DC3\u4F1A\u5458\u6570\u91CF\u81EA\u52A8\u8BBE\u7F6E\u3002\u7136\u540E\uFF0C\u60A8\u5C06\u627F\u8BFA\u81F3\u5C11\u4E3A\u63A5\u4E0B\u6765\u768412\u4E2A\u6708\u7684\u8FD9\u4E9B\u4F1A\u5458\u4ED8\u8D39\u3002\u60A8\u53EF\u4EE5\u968F\u65F6\u589E\u52A0\u60A8\u7684\u8BA2\u9605\u89C4\u6A21\uFF0C\u4F46\u662F\u5728\u60A8\u7684\u8BA2\u9605\u7ED3\u675F\u4E4B\u524D\uFF0C\u60A8\u4E0D\u80FD\u51CF\u5C11\u5B83\u3002',
            zeroCommitment: '\u96F6\u627F\u8BFA\u7684\u6298\u6263\u5E74\u8BA2\u9605\u8D39\u7387',
        },
        subscriptionSize: {
            title: '\u8A02\u95B1\u5927\u5C0F',
            yourSize:
                '\u60A8\u7684\u8A02\u95B1\u898F\u6A21\u662F\u6307\u5728\u7D66\u5B9A\u7684\u6708\u4EFD\u4E2D\uFF0C\u4EFB\u4F55\u6D3B\u8E8D\u6210\u54E1\u90FD\u53EF\u4EE5\u586B\u88DC\u7684\u958B\u653E\u5EA7\u4F4D\u6578\u91CF\u3002',
            eachMonth:
                '\u6BCF\u4E2A\u6708\uFF0C\u60A8\u7684\u8BA2\u9605\u90FD\u4F1A\u8986\u76D6\u4E0A\u8FF0\u8BBE\u7F6E\u7684\u6D3B\u8DC3\u6210\u5458\u6570\u91CF\u3002\u6BCF\u6B21\u60A8\u589E\u52A0\u8BA2\u9605\u89C4\u6A21\u65F6\uFF0C\u60A8\u5C06\u4EE5\u65B0\u7684\u89C4\u6A21\u5F00\u59CB\u65B0\u768412\u4E2A\u6708\u8BA2\u9605\u3002',
            note: '\u6CE8\u610F\uFF1A\u6D3B\u8DC3\u6210\u5458\u662F\u6307\u5728\u60A8\u7684\u516C\u53F8\u5DE5\u4F5C\u533A\u4E2D\u521B\u5EFA\u3001\u7F16\u8F91\u3001\u63D0\u4EA4\u3001\u6279\u51C6\u3001\u62A5\u9500\u6216\u5BFC\u51FA\u8D39\u7528\u6570\u636E\u7684\u4EFB\u4F55\u4EBA\u3002',
            confirmDetails: '\u786E\u8BA4\u60A8\u7684\u65B0\u5E74\u5EA6\u8BA2\u9605\u8BE6\u60C5\uFF1A',
            subscriptionSize: '\u8A02\u95B1\u5927\u5C0F',
            activeMembers: ({size}: SubscriptionSizeParams) => `\u6BCF\u6708\u6709 ${size} \u4F4D\u6D3B\u8DC3\u4F1A\u5458`,
            subscriptionRenews: '\u8A02\u95B1\u7E8C\u671F',
            youCantDowngrade: '\u60A8\u4E0D\u80FD\u5728\u60A8\u7684\u5E74\u5EA6\u8BA2\u9605\u671F\u95F4\u964D\u7EA7\u3002',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `\u60A8\u5DF2\u7ECF\u627F\u8BFA\u8BA2\u9605\u6BCF\u6708${size}\u6D3B\u8DC3\u4F1A\u5458\u7684\u5E74\u5EA6\u8BA2\u9605\uFF0C\u76F4\u5230${date}\u3002\u60A8\u53EF\u4EE5\u5728${date}\u901A\u8FC7\u7981\u7528\u81EA\u52A8\u7EED\u8BA2\u5207\u6362\u5230\u6309\u4F7F\u7528\u4ED8\u8D39\u8BA2\u9605\u3002`,
            error: {
                size: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8BA2\u9605\u5927\u5C0F\u3002',
                sameSize: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u4E0E\u60A8\u5F53\u524D\u8BA2\u9605\u5927\u5C0F\u4E0D\u540C\u7684\u6570\u5B57\u3002',
            },
        },
        paymentCard: {
            addPaymentCard: '\u6DFB\u52A0\u4ED8\u6B3E\u5361',
            enterPaymentCardDetails: '\u8F93\u5165\u60A8\u7684\u4ED8\u6B3E\u5361\u8BE6\u7EC6\u4FE1\u606F',
            security:
                'Expensify\u7B26\u5408PCI-DSS\u89C4\u5B9A\uFF0C\u4F7F\u7528\u94F6\u884C\u7EA7\u522B\u7684\u52A0\u5BC6\uFF0C\u5E76\u5229\u7528\u5197\u4F59\u57FA\u7840\u8BBE\u65BD\u6765\u4FDD\u62A4\u60A8\u7684\u6570\u636E\u3002',
            learnMoreAboutSecurity: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u6211\u4EEC\u7684\u5B89\u5168\u6027\u3002',
        },
        subscriptionSettings: {
            title: '\u8BA2\u9605\u8BBE\u7F6E',
            autoRenew: '\u81EA\u52A8\u7EED\u8BA2',
            autoIncrease: '\u81EA\u52A8\u589E\u52A0\u5E74\u5EA6\u5EA7\u4F4D',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `\u6BCF\u4E2A\u6D3B\u8DC3\u6210\u5458\u6BCF\u6708\u53EF\u8282\u7701\u9AD8\u8FBE${amountWithCurrency}`,
            automaticallyIncrease:
                '\u81EA\u52A8\u589E\u52A0\u60A8\u7684\u5E74\u5EA6\u5E2D\u4F4D\u4EE5\u9002\u5E94\u8D85\u8FC7\u60A8\u8BA2\u9605\u89C4\u6A21\u7684\u6D3B\u8DC3\u6210\u5458\u3002\u6CE8\u610F\uFF1A\u8FD9\u5C06\u5EF6\u957F\u60A8\u7684\u5E74\u5EA6\u8BA2\u9605\u7ED3\u675F\u65E5\u671F\u3002',
            disableAutoRenew: '\u7981\u7528\u81EA\u52A8\u7EED\u8BA2',
            helpUsImprove: '\u5E2E\u52A9\u6211\u4EEC\u6539\u5584Expensify',
            whatsMainReason: '\u60A8\u7981\u7528\u81EA\u52A8\u7EED\u8BA2\u7684\u4E3B\u8981\u539F\u56E0\u662F\u4EC0\u4E48\uFF1F',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `\u5728${date}\u66F4\u65B0\u3002`,
        },
        requestEarlyCancellation: {
            title: '\u8BF7\u6C42\u63D0\u524D\u53D6\u6D88',
            subtitle: '\u60A8\u8BF7\u6C42\u63D0\u524D\u53D6\u6D88\u7684\u4E3B\u8981\u539F\u56E0\u662F\u4EC0\u4E48\uFF1F',
            subscriptionCanceled: {
                title: '\u8A02\u95B1\u5DF2\u53D6\u6D88',
                subtitle: '\u60A8\u7684\u5E74\u5EA6\u8A02\u95B1\u5DF2\u88AB\u53D6\u6D88\u3002',
                info: '\u5982\u679C\u60A8\u60F3\u7EE7\u7EED\u6309\u4F7F\u7528\u4ED8\u8D39\u7684\u65B9\u5F0F\u4F7F\u7528\u60A8\u7684\u5DE5\u4F5C\u7A7A\u95F4\uFF0C\u90A3\u4E48\u60A8\u5DF2\u7ECF\u51C6\u5907\u5C31\u7EEA\u3002',
                preventFutureActivity: {
                    part1: '\u5982\u679C\u60A8\u5E0C\u671B\u9632\u6B62\u672A\u6765\u7684\u6D3B\u52A8\u548C\u8D39\u7528\uFF0C\u60A8\u5FC5\u987B',
                    link: '\u5220\u9664\u4F60\u7684\u5DE5\u4F5C\u533A\u57DF(s)',
                    part2: '\u6CE8\u610F\uFF0C\u5F53\u60A8\u5220\u9664\u5DE5\u4F5C\u533A\u65F6\uFF0C\u60A8\u5C06\u88AB\u6536\u53D6\u5F53\u524D\u65E5\u5386\u6708\u5185\u4EA7\u751F\u7684\u4EFB\u4F55\u672A\u4ED8\u8D39\u7528\u3002',
                },
            },
            requestSubmitted: {
                title: '\u8BF7\u6C42\u5DF2\u63D0\u4EA4',
                subtitle: {
                    part1: '\u611F\u8C22\u60A8\u8BA9\u6211\u4EEC\u77E5\u9053\u60A8\u6709\u5174\u8DA3\u53D6\u6D88\u60A8\u7684\u8BA2\u9605\u3002\u6211\u4EEC\u6B63\u5728\u5BA1\u67E5\u60A8\u7684\u8BF7\u6C42\uFF0C\u5E76\u5C06\u901A\u8FC7\u60A8\u7684\u804A\u5929\u65B9\u5F0F\u5C3D\u5FEB\u4E0E\u60A8\u8054\u7CFB\u3002',
                    link: '\u670D\u52A1\u5458',
                    part2: 'As an AI, I need more specific information to provide a correct translation. Please provide the text or TypeScript function that needs to be translated and specify the target language.',
                },
            },
            acknowledgement: {
                part1: '\u8981\u6C42\u63D0\u524D\u53D6\u6D88\uFF0C\u6211\u627F\u8BA4\u5E76\u540C\u610FExpensify\u65E0\u4E49\u52A1\u6839\u636EExpensify\u7684\u89C4\u5B9A\u6279\u51C6\u6B64\u7C7B\u8BF7\u6C42',
                link: '\u670D\u52A1\u6761\u6B3E',
                part2: "\u8FD9\u662F\u4E00\u4E2A\u666E\u901A\u5B57\u7B26\u4E32\u6216\u8005\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u62EC\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            },
        },
    },
    feedbackSurvey: {
        tooLimited: '\u529F\u80FD\u9700\u8981\u6539\u8FDB',
        tooExpensive: '\u592A\u8D35\u4E86',
        inadequateSupport: '\u4E0D\u8DB3\u7684\u5BA2\u6237\u652F\u6301',
        businessClosing: '\u516C\u53F8\u5173\u95ED\uFF0C\u7F29\u51CF\u89C4\u6A21\uFF0C\u6216\u88AB\u6536\u8D2D',
        additionalInfoTitle: '\u60A8\u8981\u8F6C\u5411\u54EA\u6B3E\u8F6F\u4EF6\uFF0C\u4E3A\u4EC0\u4E48\uFF1F',
        additionalInfoInputLabel: 'As an AI, I need the specific text to translate. Please provide the text for translation.',
    },
    roomChangeLog: {
        updateRoomDescription: '\u8BBE\u7F6E\u623F\u95F4\u63CF\u8FF0\u4E3A\uFF1A',
        clearRoomDescription: '\u6E05\u9664\u4E86\u623F\u95F4\u63CF\u8FF0',
    },
    delegate: {
        switchAccount: '\u5207\u6362\u8D26\u6237\uFF1A',
        copilotDelegatedAccess: 'Copilot: \u5DF2\u59D4\u6D3E\u7684\u8BBF\u95EE\u6743\u9650',
        copilotDelegatedAccessDescription: '\u5141\u8BB8\u5176\u4ED6\u6210\u5458\u8BBF\u95EE\u60A8\u7684\u8D26\u6237\u3002',
        addCopilot: '\u6DFB\u52A0\u526F\u9A7E\u9A76\u5458',
        membersCanAccessYourAccount: '\u8FD9\u4E9B\u6210\u5458\u53EF\u4EE5\u8BBF\u95EE\u60A8\u7684\u5E10\u6237\uFF1A',
        youCanAccessTheseAccounts: '\u60A8\u53EF\u4EE5\u901A\u8FC7\u8D26\u6237\u5207\u6362\u5668\u8BBF\u95EE\u8FD9\u4E9B\u8D26\u6237\uFF1A',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Sorry, there seems to be a misunderstanding. Could you please provide the text or TypeScript function that you want to translate?';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '\u6709\u9650';
                default:
                    return '';
            }
        },
        genericError: '\u54CE\u5440\uFF0C\u51FA\u4E86\u4E9B\u95EE\u9898\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `\u4EE3\u8868${delegator}`,
        accessLevel: '\u8BBF\u95EE\u7EA7\u522B',
        confirmCopilot: '\u786E\u8BA4\u4F60\u7684\u526F\u9A7E\u9A76\u5458\u5982\u4E0B\u3002',
        accessLevelDescription:
            '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u7684\u8BBF\u95EE\u7EA7\u522B\u3002\u65E0\u8BBA\u662F\u5168\u6743\u9650\u8FD8\u662F\u6709\u9650\u6743\u9650\uFF0C\u90FD\u5141\u8BB8\u526F\u9A7E\u9A76\u67E5\u770B\u6240\u6709\u7684\u5BF9\u8BDD\u548C\u8D39\u7528\u3002',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '\u5141\u8BB8\u5176\u4ED6\u6210\u5458\u4EE3\u8868\u60A8\u5728\u60A8\u7684\u8D26\u6237\u4E2D\u8FDB\u884C\u6240\u6709\u64CD\u4F5C\u3002\u5305\u62EC\u804A\u5929\uFF0C\u63D0\u4EA4\uFF0C\u6279\u51C6\uFF0C\u652F\u4ED8\uFF0C\u8BBE\u7F6E\u66F4\u65B0\u7B49\u7B49\u3002';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '\u5141\u8BB8\u53E6\u4E00\u540D\u6210\u5458\u4EE3\u8868\u60A8\u5728\u60A8\u7684\u8D26\u6237\u4E2D\u8FDB\u884C\u5927\u90E8\u5206\u64CD\u4F5C\u3002\u4F46\u4E0D\u5305\u62EC\u6279\u51C6\u3001\u652F\u4ED8\u3001\u62D2\u7EDD\u548C\u6682\u505C\u3002';
                default:
                    return '';
            }
        },
        removeCopilot: '\u5F88\u62B1\u6B49\uFF0C\u60A8\u7684\u8ACB\u6C42\u4E0D\u6E05\u695A\u3002\u8ACB\u63D0\u4F9B\u8981\u7FFB\u8B6F\u7684\u6587\u672C\u3002',
        removeCopilotConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u526F\u9A7E\u9A76\u5458\u5417\uFF1F',
        changeAccessLevel: '\u66F4\u6539\u8BBF\u95EE\u7EA7\u522B',
        makeSureItIsYou: '\u8BA9\u6211\u4EEC\u786E\u8BA4\u4E00\u4E0B\u662F\u4F60',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u81F3${contactMethod}\u7684\u9B54\u6CD5\u4EE3\u7801\u4EE5\u6DFB\u52A0\u526F\u9A7E\u9A76\u5458\u3002\u5B83\u5E94\u5728\u4E00\u4E24\u5206\u949F\u5185\u5230\u8FBE\u3002`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u81F3${contactMethod}\u7684\u9B54\u6CD5\u4EE3\u7801\u4EE5\u66F4\u65B0\u60A8\u7684\u526F\u9A7E\u9A76\u3002`,
        notAllowed: '\u4E0D\u8981\u8FD9\u4E48\u5FEB...',
        noAccessMessage: '\u4F5C\u4E3A\u526F\u9A7E\u9A76\uFF0C\u60A8\u65E0\u6CD5\u8BBF\u95EE\u6B64\u9875\u9762\u3002\u62B1\u6B49\uFF01',
        notAllowedMessageStart: `As a`,
        notAllowedMessageHyperLinked:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u63D0\u4F9B\u8DB3\u591F\u7684\u4FE1\u606F\u4EE5\u4F9B\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u5B8C\u6574\u82F1\u6587\u6587\u672C\u3002',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) =>
            `\u5BF9\u4E8E${accountOwnerEmail}\uFF0C\u60A8\u6CA1\u6709\u6743\u9650\u8FDB\u884C\u6B64\u64CD\u4F5C\u3002\u5BF9\u4E0D\u8D77\uFF01`,
    },
    debug: {
        debug: '\u8C03\u8BD5',
        details:
            '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u6CA1\u6709\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\uFF0C\u6211\u4F1A\u5E2E\u52A9\u60A8\u8FDB\u884C\u7FFB\u8BD1\u3002',
        JSON: '\u60A8\u7684\u8981\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        reportActions: '\u64CD\u4F5C',
        reportActionPreview: '\u9884\u89C8',
        nothingToPreview: '\u6CA1\u6709\u4EC0\u4E48\u53EF\u4EE5\u9884\u89C8\u7684',
        editJson: '\u7F16\u8F91 JSON:',
        preview: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        missingProperty: ({propertyName}: MissingPropertyParams) => `\u7F3A\u5C11 ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `\u65E0\u6548\u7684\u5C5E\u6027\uFF1A${propertyName} - \u9884\u671F\uFF1A${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `\u65E0\u6548\u503C - \u9884\u671F\uFF1A${expectedValues}`,
        missingValue: '\u7F3A\u5C11\u503C',
        createReportAction: '\u521B\u5EFA\u62A5\u544A\u64CD\u4F5C',
        reportAction: '\u62A5\u544A\u64CD\u4F5C',
        report: '\u62A5\u544A',
        transaction: '\u4EA4\u6613',
        violations: '\u9055\u898F',
        transactionViolation: '\u4EA4\u6613\u9055\u898F',
        hint: '\u6570\u636E\u66F4\u6539\u4E0D\u4F1A\u53D1\u9001\u5230\u540E\u7AEF',
        textFields: '\u6587\u672C\u5B57\u6BB5',
        numberFields: '\u6570\u5B57\u5B57\u6BB5',
        booleanFields: '\u5E03\u5C14\u5B57\u6BB5',
        constantFields: '\u5E38\u91CF\u5B57\u6BB5',
        dateTimeFields: '\u65E5\u671F\u65F6\u95F4\u5B57\u6BB5',
        date: '\u65E5\u671F',
        time: '\u65F6\u95F4',
        none: 'The instruction is not clear. Please provide the text or TypeScript function that needs to be translated.',
        visibleInLHN: '\u5728LHN\u4E2D\u53EF\u89C1',
        GBR: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u6587\u672C\u6CA1\u6709\u63D0\u4F9B\u8DB3\u591F\u7684\u4FE1\u606F\u4EE5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u5B8C\u6574\u7684\u53E5\u5B50\u6216\u6BB5\u843D\u3002',
        RBR: 'As a language model AI developed by OpenAI, I need to clarify that "ch" is not a recognized language code. If you meant Chinese, please specify whether it\'s Simplified Chinese or Traditional Chinese. If you meant something else, please provide more details.',
        true: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u63D0\u4F9B\u7684\u4FE1\u606F\u4E0D\u8DB3\uFF0C\u6211\u65E0\u6CD5\u8FDB\u884C\u7FFB\u8BD1\u3002\u8BF7\u63D0\u4F9B\u9700\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u6216TypeScript\u51FD\u6570\u3002',
        false: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        viewReport: '\u67E5\u770B\u62A5\u544A',
        viewTransaction: '\u67E5\u770B\u4EA4\u6613',
        createTransactionViolation: '\u521B\u5EFA\u4EA4\u6613\u8FDD\u89C4',
        reasonVisibleInLHN: {
            hasDraftComment: '\u6709\u8349\u7A3F\u8BC4\u8BBA',
            hasGBR: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            hasRBR: "\u9019\u662F\u4E00\u500B\u7C21\u55AE\u7684\u5B57\u7B26\u4E32\u6216\u662F\u4E00\u500BTypeScript\u51FD\u6578\uFF0C\u8FD4\u56DE\u4E00\u500B\u6A21\u677F\u5B57\u7B26\u4E32\u3002\u8ACB\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u5011\u7684\u5167\u5BB9\u6216\u522A\u9664\u62EC\u865F\u3002\u5360\u4F4D\u7B26\u7684\u5167\u5BB9\u63CF\u8FF0\u4E86\u5B83\u5011\u5728\u77ED\u8A9E\u4E2D\u4EE3\u8868\u7684\u5167\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u9054\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u78BC\u3002",
            pinnedByUser: '\u7531\u6210\u5458\u56FA\u5B9A',
            hasIOUViolations: '\u6709 IOU \u8FDD\u89C4\u884C\u4E3A',
            hasAddWorkspaceRoomErrors: '\u6DFB\u52A0\u5DE5\u4F5C\u7A7A\u95F4\u623F\u95F4\u65F6\u51FA\u73B0\u9519\u8BEF',
            isUnread: '\u662F\u672A\u8BFB\uFF08\u7126\u70B9\u6A21\u5F0F\uFF09',
            isArchived: '\u5DF2\u5B58\u6863\uFF08\u6700\u65B0\u6A21\u5F0F\uFF09',
            isSelfDM: '\u662F\u5426\u81EA\u6211DM',
            isFocused: '\u6682\u65F6\u4E13\u6CE8',
        },
        reasonGBR: {
            hasJoinRequest: '\u6709\u52A0\u5165\u8BF7\u6C42\uFF08\u7BA1\u7406\u5458\u623F\u95F4\uFF09',
            isUnreadWithMention: '\u662F\u672A\u8BFB\u7684\u63D0\u53CA',
            isWaitingForAssigneeToCompleteAction: '\u6B63\u5728\u7B49\u5F85\u53D7\u8BA9\u4EBA\u5B8C\u6210\u64CD\u4F5C',
            hasChildReportAwaitingAction: '\u6709\u5B50\u62A5\u544A\u7B49\u5F85\u5904\u7406',
            hasMissingInvoiceBankAccount: '\u7F3A\u5C11\u53D1\u7968\u94F6\u884C\u8D26\u6237',
        },
        reasonRBR: {
            hasErrors: '\u5728\u62A5\u544A\u6216\u62A5\u544A\u64CD\u4F5C\u6570\u636E\u4E2D\u6709\u9519\u8BEF',
            hasViolations: '\u6709\u9055\u898F\u884C\u70BA',
            hasTransactionThreadViolations: '\u5B58\u5728\u4EA4\u6613\u7EBF\u7A0B\u8FDD\u89C4',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '\u6709\u4E00\u4E2A\u62A5\u544A\u7B49\u5F85\u5904\u7406',
            theresAReportWithErrors: '\u6709\u4E00\u4EFD\u62A5\u544A\u6709\u9519\u8BEF',
            theresAWorkspaceWithCustomUnitsErrors: '\u8FD9\u662F\u4E00\u4E2A\u5E26\u6709\u81EA\u5B9A\u4E49\u5355\u4F4D\u9519\u8BEF\u7684\u5DE5\u4F5C\u533A',
            theresAProblemWithAWorkspaceMember: '\u5DE5\u4F5C\u7A7A\u95F4\u6210\u5458\u5B58\u5728\u95EE\u9898',
            theresAProblemWithAContactMethod: '\u8054\u7CFB\u65B9\u5F0F\u51FA\u73B0\u4E86\u95EE\u9898',
            aContactMethodRequiresVerification: '\u9700\u8981\u9A8C\u8BC1\u8054\u7CFB\u65B9\u5F0F',
            theresAProblemWithAPaymentMethod: '\u4ED8\u6B3E\u65B9\u5F0F\u5B58\u5728\u95EE\u9898',
            theresAProblemWithAWorkspace: '\u6709\u4E00\u4E2A\u5DE5\u4F5C\u533A\u7684\u95EE\u9898',
            theresAProblemWithYourReimbursementAccount: '\u60A8\u7684\u62A5\u9500\u8D26\u6237\u5B58\u5728\u95EE\u9898',
            theresABillingProblemWithYourSubscription: '\u60A8\u7684\u8A02\u95B1\u51FA\u73FE\u4E86\u7D50\u7B97\u554F\u984C',
            yourSubscriptionHasBeenSuccessfullyRenewed: '\u60A8\u7684\u8A02\u95B1\u5DF2\u6210\u529F\u7E8C\u8A02',
            theresWasAProblemDuringAWorkspaceConnectionSync: '\u5728\u5DE5\u4F5C\u7A7A\u95F4\u8FDE\u63A5\u540C\u6B65\u8FC7\u7A0B\u4E2D\u51FA\u73B0\u4E86\u95EE\u9898',
            theresAProblemWithYourWallet: '\u60A8\u7684\u94B1\u5305\u51FA\u73B0\u4E86\u95EE\u9898',
            theresAProblemWithYourWalletTerms: '\u60A8\u7684\u94B1\u5305\u6761\u6B3E\u5B58\u5728\u95EE\u9898',
        },
    },
    emptySearchView: {
        takeATour: '\u8FDB\u884C\u53C2\u89C2',
    },
    tour: {
        takeATwoMinuteTour: '\u8FDB\u884C2\u5206\u949F\u7684\u5BFC\u89C8',
        exploreExpensify: '\u63A2\u7D22Expensify\u6240\u63D0\u4F9B\u7684\u4E00\u5207',
    },
    migratedUserWelcomeModal: {
        title: '\u65C5\u884C\u548C\u8D39\u7528\uFF0C\u4EE5\u804A\u5929\u7684\u901F\u5EA6',
        subtitle: '\u65B0\u7684Expensify\u5177\u6709\u76F8\u540C\u7684\u51FA\u8272\u81EA\u52A8\u5316\uFF0C\u4F46\u73B0\u5728\u5177\u6709\u60CA\u4EBA\u7684\u534F\u4F5C\u529F\u80FD\uFF1A',
        confirmText: '\u6211\u4EEC\u8D70\u5427\uFF01',
        features: {
            chat: '<strong>\u5728\u4EFB\u4F55\u8D39\u7528</strong>\uFF0C\u62A5\u544A\uFF0C\u6216\u5DE5\u4F5C\u533A\u76F4\u63A5\u804A\u5929',
            scanReceipt: '<strong>\u6383\u63CF\u6536\u64DA</strong>\u4E26\u7372\u5F97\u9000\u6B3E',
            crossPlatform: '\u4ECE\u60A8\u7684\u624B\u673A\u6216\u6D4F\u89C8\u5668\u505A<strong>\u6240\u6709\u4E8B\u60C5</strong>',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: {
            part1: '\u5F00\u59CB',
            part2: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        },
        saveSearchTooltip: {
            part1: '\u91CD\u547D\u540D\u60A8\u7684\u4FDD\u5B58\u641C\u7D22',
            part2: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        },
        quickActionButton: {
            part1: '\u5FEB\u901F\u884C\u52A8\uFF01',
            part2: '\u53EA\u9700\u8F7B\u70B9\u4E00\u4E0B',
        },
        workspaceChatCreate: {
            part1: '\u63D0\u4EA4\u4F60\u7684',
            part2: '\u5F00\u652F',
            part3: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        },
        searchFilterButtonTooltip: {
            part1: '\u81EA\u5B9A\u4E49\u60A8\u7684\u641C\u7D22',
            part2: '\u5BF9\u4E0D\u8D77\uFF0C\u60A8\u7684\u8BF7\u6C42\u4E0D\u6E05\u695A\u3002\u8BF7\u63D0\u4F9B\u8981\u7FFB\u8BD1\u7684\u6587\u672C\u3002',
        },
        bottomNavInboxTooltip: {
            part1: '\u4F60\u7684\u5F85\u529E\u4E8B\u9879\u5217\u8868',
            part2: "\u8FD9\u662F\u4E00\u4E2A\u7B80\u5355\u7684\u5B57\u7B26\u4E32\u6216\u662F\u4E00\u4E2A\u8FD4\u56DE\u6A21\u677F\u5B57\u7B26\u4E32\u7684TypeScript\u51FD\u6570\u3002\u8BF7\u4FDD\u7559\u50CF${username}\uFF0C${count}\uFF0C${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}\u7B49\u5360\u4F4D\u7B26\uFF0C\u4E0D\u8981\u4FEE\u6539\u5B83\u4EEC\u7684\u5185\u5BB9\u6216\u5220\u9664\u62EC\u53F7\u3002\u5360\u4F4D\u7B26\u7684\u5185\u5BB9\u63CF\u8FF0\u4E86\u5B83\u4EEC\u5728\u77ED\u8BED\u4E2D\u4EE3\u8868\u7684\u5185\u5BB9\uFF0C\u4F46\u53EF\u80FD\u5305\u542B\u4E09\u5143\u8868\u8FBE\u5F0F\u6216\u5176\u4ED6TypeScript\u4EE3\u7801\u3002",
            part3: 'As a language model AI developed by OpenAI, I need to clarify that "ch" is not a recognized language code. Could you please specify the language you want the text to be translated into? For example, "fr" for French, "es" for Spanish, "de" for German, etc.',
        },
        workspaceChatTooltip: {
            part1: '\u63D0\u4EA4\u8D39\u7528',
            part2: '\u548C${username}\u804A\u5929',
            part3: '\u8FD9\u91CC\u7684\u5BA1\u6279\u8005\uFF01',
        },
        globalCreateTooltip: {
            part1: '\u521B\u5EFA\u8D39\u7528',
            part2: '\u5F00\u59CB\u804A\u5929\uFF0C',
            part3: '\u7B49\u7B49\u66F4\u591A\uFF01',
        },
        scanTestTooltip: {
            part1: '\u60F3\u770B\u770BScan\u662F\u5982\u4F55\u5DE5\u4F5C\u7684\u5417\uFF1F',
            part2: '\u8BD5\u4E00\u8BD5\u6D4B\u8BD5\u6536\u636E\uFF01',
            part3: '\u9009\u62E9\u6211\u4EEC\u7684',
            part4: '\u6D4B\u8BD5\u7ECF\u7406',
            part5: '\u5C1D\u8BD5\u4E00\u4E0B\uFF01',
            part6: 'As a language model AI developed by OpenAI, I need to clarify that "ch" is not a valid language code. Please provide a valid language code such as "fr" for French, "es" for Spanish, "de" for German, etc.',
            part7: '\u63D0\u4EA4\u60A8\u7684\u8D39\u7528',
            part8: '\u5E76\u89C2\u5BDF\u9B54\u6CD5\u53D1\u751F\uFF01',
        },
    },
    discardChangesConfirmation: {
        title: '\u653E\u5F03\u66F4\u6539\uFF1F',
        body: '\u4F60\u786E\u5B9A\u8981\u653E\u5F03\u4F60\u6240\u505A\u7684\u66F4\u6539\u5417\uFF1F',
        confirmText: '\u653E\u5F03\u66F4\u6539',
    },
};
export default translations satisfies TranslationDeepObject<typeof translations>;
