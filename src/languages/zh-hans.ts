/**
 *   _____                      __         __
 *  / ___/__ ___  ___ _______ _/ /____ ___/ /
 * / (_ / -_) _ \/ -_) __/ _ \`/ __/ -_) _  /
 * \___/\__/_//_/\__/_/  \_,_/\__/\__/\_,_/
 *
 * This file was automatically generated. Please consider these alternatives before manually editing it:
 *
 * - Improve the prompts in prompts/translation, or
 * - Improve context annotations in src/languages/en.ts
 */
import {CONST as COMMON_CONST} from 'expensify-common';
import startCase from 'lodash/startCase';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type en from './en';
import type {
    AccountOwnerParams,
    ActionsAreCurrentlyRestricted,
    AddedOrDeletedPolicyReportFieldParams,
    AddedPolicyApprovalRuleParams,
    AddEmployeeParams,
    AddOrDeletePolicyCustomUnitRateParams,
    AddressLineParams,
    AdminCanceledRequestParams,
    AirlineParams,
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
    BillingBannerOwnerAmountOwedOverdueParams,
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
    ChangeReportPolicyParams,
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
    CurrencyInputDisabledTextParams,
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
    DemotedFromWorkspaceParams,
    DidSplitAmountMessageParams,
    DuplicateTransactionParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EmployeeInviteMessageParams,
    EnterMagicCodeParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FlightParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    GoToRoomParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfulDescriptionParams,
    ImportPerDiemRatesSuccessfulDescriptionParams,
    ImportTagsSuccessfulDescriptionParams,
    IncorrectZipFormatParams,
    InstantSummaryParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
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
    MovedFromPersonalSpaceParams,
    MovedFromReportParams,
    MovedTransactionParams,
    NeedCategoryForExportToIntegrationParams,
    NewWorkspaceNameParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OptionalParam,
    OurEmailProviderParams,
    OwnerOwesAmountParams,
    PaidElsewhereParams,
    PaidWithExpensifyParams,
    ParentNavigationSummaryParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PaySomeoneParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyExpenseChatNameParams,
    RailTicketParams,
    ReconciliationWorksParams,
    RemovedFromApprovalWorkflowParams,
    RemovedTheRequestParams,
    RemoveMemberPromptParams,
    RemoveMembersWarningPrompt,
    RenamedRoomActionParams,
    RenamedWorkspaceNameActionParams,
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
    ReviewParams,
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
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
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
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    TotalAmountGreaterOrLessThanOriginalParams,
    ToValidateLoginParams,
    TransferParams,
    TravelTypeParams,
    TrialStartedTitleParams,
    UnapproveWithIntegrationWarningParams,
    UnshareParams,
    UntilTimeParams,
    UpdatedCustomFieldParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyAuditRateParams,
    UpdatedPolicyCategoryDescriptionHintTypeParams,
    UpdatedPolicyCategoryExpenseLimitTypeParams,
    UpdatedPolicyCategoryGLCodeParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    UpdatedPolicyCategoryMaxExpenseAmountParams,
    UpdatedPolicyCategoryNameParams,
    UpdatedPolicyCategoryParams,
    UpdatedPolicyCurrencyParams,
    UpdatedPolicyCustomUnitRateParams,
    UpdatedPolicyCustomUnitTaxClaimablePercentageParams,
    UpdatedPolicyCustomUnitTaxRateExternalIDParams,
    UpdatedPolicyDescriptionParams,
    UpdatedPolicyFieldWithNewAndOldValueParams,
    UpdatedPolicyFieldWithValueParam,
    UpdatedPolicyFrequencyParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdateRoleParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    ViolationsAutoReportedRejectedExpenseParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsCustomRulesParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsProhibitedExpenseParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkEmailMergingBlockedParams,
    WorkEmailResendCodeParams,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceYouMayJoin,
    YourPlanPriceParams,
    YourPlanPriceValueParams,
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
        count: '\u8BA1\u6570',
        cancel: '\u53D6\u6D88',
        dismiss: '\u5FFD\u7565',
        yes: 'Yes',
        no: '\u4E0D',
        ok: '\u597D\u7684',
        notNow: '\u6682\u65F6\u4E0D\u8981',
        learnMore: '\u4E86\u89E3\u66F4\u591A\u3002',
        buttonConfirm: '\u660E\u767D\u4E86',
        name: '\u540D\u79F0',
        attachment: '\u9644\u4EF6',
        attachments: '\u9644\u4EF6',
        center: '\u4E2D\u5FC3',
        from: '\u4ECE',
        to: '\u81F3',
        in: '\u5728',
        optional: '\u53EF\u9009',
        new: '\u65B0\u5EFA',
        search: '\u641C\u7D22',
        reports: '\u62A5\u544A',
        find: '\u67E5\u627E',
        searchWithThreeDots: '\u641C\u7D22...',
        next: '\u4E0B\u4E00\u4E2A',
        previous: '\u4E0A\u4E00\u4E2A',
        goBack: '\u8FD4\u56DE',
        create: '\u521B\u5EFA',
        add: '\u6DFB\u52A0',
        resend: '\u91CD\u65B0\u53D1\u9001',
        save: '\u4FDD\u5B58',
        select: '\u9009\u62E9',
        deselect: '\u53D6\u6D88\u9009\u62E9',
        selectMultiple: '\u9009\u62E9\u591A\u4E2A',
        saveChanges: '\u4FDD\u5B58\u66F4\u6539',
        submit: '\u63D0\u4EA4',
        rotate: '\u65CB\u8F6C',
        zoom: 'Zoom',
        password: '\u5BC6\u7801',
        magicCode: 'Magic code',
        twoFactorCode: '\u53CC\u56E0\u7D20\u9A8C\u8BC1\u7801',
        workspaces: '\u5DE5\u4F5C\u533A',
        inbox: '\u6536\u4EF6\u7BB1',
        group: '\u7FA4\u7EC4',
        profile: '\u4E2A\u4EBA\u8D44\u6599',
        referral: '\u63A8\u8350',
        payments: '\u4ED8\u6B3E',
        approvals: '\u5BA1\u6279',
        wallet: '\u94B1\u5305',
        preferences: '\u504F\u597D\u8BBE\u7F6E',
        view: '\u67E5\u770B',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: '\u4E0D',
        signIn: '\u767B\u5F55',
        signInWithGoogle: '\u4F7F\u7528 Google \u767B\u5F55',
        signInWithApple: '\u4F7F\u7528 Apple \u767B\u5F55',
        signInWith: '\u767B\u5F55\u4F7F\u7528',
        continue: '\u7EE7\u7EED',
        firstName: '\u540D\u5B57',
        lastName: '\u59D3\u6C0F',
        scanning: '\u626B\u63CF\u4E2D',
        addCardTermsOfService: 'Expensify \u670D\u52A1\u6761\u6B3E',
        perPerson: '\u6BCF\u4EBA',
        phone: '\u7535\u8BDD',
        phoneNumber: '\u7535\u8BDD\u53F7\u7801',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: '\u7535\u5B50\u90AE\u4EF6',
        and: '\u548C',
        or: '\u6216',
        details: '\u8BE6\u60C5',
        privacy: '\u9690\u79C1',
        privacyPolicy: '\u9690\u79C1\u653F\u7B56',
        hidden: '\u9690\u85CF',
        visible: '\u53EF\u89C1',
        delete: '\u5220\u9664',
        archived: '\u5DF2\u5F52\u6863',
        contacts: '\u8054\u7CFB\u4EBA',
        recents: '\u6700\u8FD1',
        close: '\u5173\u95ED',
        download: '\u4E0B\u8F7D',
        downloading: '\u4E0B\u8F7D\u4E2D',
        uploading: '\u4E0A\u4F20\u4E2D',
        pin: '\u56FA\u5B9A',
        unPin: '\u53D6\u6D88\u56FA\u5B9A',
        back: '\u8FD4\u56DE',
        saveAndContinue: '\u4FDD\u5B58\u5E76\u7EE7\u7EED',
        settings: '\u8BBE\u7F6E',
        termsOfService: '\u670D\u52A1\u6761\u6B3E',
        members: '\u6210\u5458',
        invite: '\u9080\u8BF7',
        here: '\u8FD9\u91CC',
        date: '\u65E5\u671F',
        dob: '\u51FA\u751F\u65E5\u671F',
        currentYear: '\u5F53\u524D\u5E74\u4EFD',
        currentMonth: '\u5F53\u524D\u6708\u4EFD',
        ssnLast4: 'SSN\u7684\u6700\u540E4\u4F4D\u6570\u5B57',
        ssnFull9: '\u5B8C\u6574\u76849\u4F4D\u6570SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `\u5730\u5740\u884C ${lineNumber}`,
        personalAddress: '\u4E2A\u4EBA\u5730\u5740',
        companyAddress: '\u516C\u53F8\u5730\u5740',
        noPO: '\u8BF7\u4E0D\u8981\u4F7F\u7528\u90AE\u653F\u4FE1\u7BB1\u6216\u90AE\u4EF6\u6295\u9012\u5730\u5740\u3002',
        city: '\u57CE\u5E02',
        state: '\u72B6\u6001',
        streetAddress: '\u8857\u9053\u5730\u5740',
        stateOrProvince: '\u5DDE/\u7701\u4EFD',
        country: '\u56FD\u5BB6',
        zip: '\u90AE\u653F\u7F16\u7801',
        zipPostCode: '\u90AE\u653F\u7F16\u7801',
        whatThis: '\u8FD9\u662F\u4EC0\u4E48\uFF1F',
        iAcceptThe: '\u6211\u63A5\u53D7',
        remove: '\u79FB\u9664',
        admin: '\u7BA1\u7406\u5458',
        owner: '\u6240\u6709\u8005',
        dateFormat: 'YYYY-MM-DD',
        send: '\u53D1\u9001',
        na: 'N/A',
        noResultsFound: '\u672A\u627E\u5230\u7ED3\u679C',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `\u672A\u627E\u5230\u4E0E\u201C${searchString}\u201D\u5339\u914D\u7684\u7ED3\u679C`,
        recentDestinations: '\u6700\u8FD1\u7684\u76EE\u7684\u5730',
        timePrefix: '\u5B83\u662F',
        conjunctionFor: '\u4E3A',
        todayAt: '\u4ECA\u5929\u5728',
        tomorrowAt: '\u660E\u5929\u5728',
        yesterdayAt: '\u6628\u5929\u5728',
        conjunctionAt: '\u5728',
        conjunctionTo: '\u5230',
        genericErrorMessage:
            '\u54CE\u5440\u2026\u2026\u51FA\u73B0\u4E86\u4E00\u4E9B\u95EE\u9898\uFF0C\u60A8\u7684\u8BF7\u6C42\u65E0\u6CD5\u5B8C\u6210\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        percentage: '\u767E\u5206\u6BD4',
        error: {
            invalidAmount: '\u65E0\u6548\u91D1\u989D',
            acceptTerms: '\u60A8\u5FC5\u987B\u63A5\u53D7\u670D\u52A1\u6761\u6B3E\u624D\u80FD\u7EE7\u7EED',
            phoneNumber: `\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u8BDD\u53F7\u7801\uFF0C\u5E76\u5305\u542B\u56FD\u5BB6\u4EE3\u7801\uFF08\u4F8B\u5982 ${CONST.EXAMPLE_PHONE_NUMBER}\uFF09`,
            fieldRequired: '\u6B64\u5B57\u6BB5\u4E3A\u5FC5\u586B\u9879',
            requestModified: '\u6B64\u8BF7\u6C42\u6B63\u5728\u88AB\u5176\u4ED6\u6210\u5458\u4FEE\u6539\u4E2D\u3002',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `\u5B57\u7B26\u9650\u5236\u8D85\u51FA (${length}/${limit})`,
            dateInvalid: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u65E5\u671F',
            invalidDateShouldBeFuture: '\u8BF7\u9009\u62E9\u4ECA\u5929\u6216\u5C06\u6765\u7684\u65E5\u671F',
            invalidTimeShouldBeFuture: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u81F3\u5C11\u63D0\u524D\u4E00\u5206\u949F\u7684\u65F6\u95F4',
            invalidCharacter: '\u65E0\u6548\u5B57\u7B26',
            enterMerchant: '\u8F93\u5165\u5546\u5BB6\u540D\u79F0',
            enterAmount: '\u8F93\u5165\u91D1\u989D',
            missingMerchantName: '\u7F3A\u5C11\u5546\u6237\u540D\u79F0',
            missingAmount: '\u7F3A\u5C11\u91D1\u989D',
            missingDate: '\u7F3A\u5C11\u65E5\u671F',
            enterDate: '\u8F93\u5165\u65E5\u671F',
            invalidTimeRange: '\u8BF7\u8F93\u5165\u4F7F\u752812\u5C0F\u65F6\u5236\u7684\u65F6\u95F4\uFF08\u4F8B\u5982\uFF0C2:30 PM\uFF09',
            pleaseCompleteForm: '\u8BF7\u5B8C\u6210\u4E0A\u9762\u7684\u8868\u683C\u4EE5\u7EE7\u7EED',
            pleaseSelectOne: '\u8BF7\u9009\u62E9\u4E0A\u9762\u7684\u4E00\u4E2A\u9009\u9879',
            invalidRateError: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8D39\u7387',
            lowRateError: '\u8D39\u7387\u5FC5\u987B\u5927\u4E8E0',
            email: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
            login: '\u767B\u5F55\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
        },
        comma: '\u9017\u53F7',
        semicolon: 'semicolon',
        please: '\u8BF7',
        contactUs: '\u8054\u7CFB\u6211\u4EEC',
        pleaseEnterEmailOrPhoneNumber: '\u8BF7\u8F93\u5165\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801',
        fixTheErrors: '\u4FEE\u590D\u9519\u8BEF',
        inTheFormBeforeContinuing: '\u5728\u7EE7\u7EED\u4E4B\u524D\u586B\u5199\u8868\u683C',
        confirm: '\u786E\u8BA4',
        reset: '\u91CD\u7F6E',
        done: '\u5B8C\u6210',
        more: '\u66F4\u591A',
        debitCard: '\u501F\u8BB0\u5361',
        bankAccount: '\u94F6\u884C\u8D26\u6237',
        personalBankAccount: '\u4E2A\u4EBA\u94F6\u884C\u8D26\u6237',
        businessBankAccount: '\u4F01\u4E1A\u94F6\u884C\u8D26\u6237',
        join: '\u52A0\u5165',
        leave: '\u79BB\u5F00',
        decline: '\u62D2\u7EDD',
        transferBalance: '\u8F6C\u8D26\u4F59\u989D',
        cantFindAddress: '\u627E\u4E0D\u5230\u60A8\u7684\u5730\u5740\uFF1F',
        enterManually: '\u624B\u52A8\u8F93\u5165',
        message: '\u6D88\u606F',
        leaveThread: '\u79BB\u5F00\u7EBF\u7A0B',
        you: '\u4F60',
        youAfterPreposition: '\u4F60',
        your: '\u4F60\u7684',
        conciergeHelp: '\u8BF7\u8054\u7CFBConcierge\u5BFB\u6C42\u5E2E\u52A9\u3002',
        youAppearToBeOffline: '\u60A8\u4F3C\u4E4E\u5904\u4E8E\u79BB\u7EBF\u72B6\u6001\u3002',
        thisFeatureRequiresInternet: '\u6B64\u529F\u80FD\u9700\u8981\u6D3B\u52A8\u7684\u4E92\u8054\u7F51\u8FDE\u63A5\u3002',
        attachmentWillBeAvailableOnceBackOnline: '\u9644\u4EF6\u5C06\u5728\u91CD\u65B0\u8054\u7F51\u540E\u53EF\u7528\u3002',
        errorOccurredWhileTryingToPlayVideo: '\u5C1D\u8BD5\u64AD\u653E\u6B64\u89C6\u9891\u65F6\u53D1\u751F\u9519\u8BEF\u3002',
        areYouSure: '\u4F60\u786E\u5B9A\u5417\uFF1F',
        verify: '\u9A8C\u8BC1',
        yesContinue: '\u662F\u7684\uFF0C\u7EE7\u7EED',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `\u4F8B\u5982 ${zipSampleFormat}` : ''),
        description: '\u63CF\u8FF0',
        title: '\u6807\u9898',
        assignee: '\u53D7\u8BA9\u4EBA',
        createdBy: '\u521B\u5EFA\u8005',
        with: 'with',
        shareCode: '\u5206\u4EAB\u4EE3\u7801',
        share: '\u5206\u4EAB',
        per: '\u6BCF',
        mi: '\u82F1\u91CC',
        km: '\u516C\u91CC',
        copied: '\u5DF2\u590D\u5236\uFF01',
        someone: '\u67D0\u4EBA',
        total: '\u603B\u8BA1',
        edit: '\u7F16\u8F91',
        letsDoThis: `\u6765\u5427\uFF01`,
        letsStart: `\u5F00\u59CB\u5427`,
        showMore: '\u663E\u793A\u66F4\u591A',
        merchant: '\u5546\u5BB6',
        category: '\u7C7B\u522B',
        report: '\u62A5\u544A',
        billable: '\u53EF\u8BA1\u8D39\u7684',
        nonBillable: '\u4E0D\u53EF\u8BA1\u8D39',
        tag: '\u6807\u7B7E',
        receipt: '\u6536\u636E',
        verified: '\u5DF2\u9A8C\u8BC1',
        replace: '\u66FF\u6362',
        distance: '\u8DDD\u79BB',
        mile: '\u82F1\u91CC',
        miles: '\u82F1\u91CC',
        kilometer: '\u516C\u91CC',
        kilometers: '\u516C\u91CC',
        recent: '\u6700\u8FD1\u7684',
        all: '\u6240\u6709',
        am: '\u4E0A\u5348',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: '\u9009\u62E9\u4E00\u79CD\u8D27\u5E01',
        card: '\u5361\u7247',
        whyDoWeAskForThis: '\u6211\u4EEC\u4E3A\u4EC0\u4E48\u8981\u8BE2\u95EE\u8FD9\u4E2A\uFF1F',
        required: '\u5FC5\u586B',
        showing: '\u663E\u793A\u4E2D',
        of: 'of',
        default: '\u9ED8\u8BA4',
        update: '\u66F4\u65B0',
        member: '\u4F1A\u5458',
        auditor: '\u5BA1\u8BA1\u5458',
        role: '\u89D2\u8272',
        currency: '\u8D27\u5E01',
        rate: '\u8D39\u7387',
        emptyLHN: {
            title: '\u54C7\u54E6\uFF01\u5168\u90E8\u641E\u5B9A\u4E86\u3002',
            subtitleText1: '\u4F7F\u7528\u4EE5\u4E0B\u65B9\u5F0F\u67E5\u627E\u804A\u5929',
            subtitleText2: '\u4E0A\u9762\u7684\u6309\u94AE\uFF0C\u6216\u4F7F\u7528\u521B\u5EFA\u4E00\u4E9B\u4E1C\u897F',
            subtitleText3: '\u4E0B\u9762\u7684\u6309\u94AE\u3002',
        },
        businessName: '\u516C\u53F8\u540D\u79F0',
        clear: '\u6E05\u9664',
        type: '\u7C7B\u578B',
        action: '\u884C\u52A8',
        expenses: '\u8D39\u7528',
        tax: '\u7A0E\u52A1',
        shared: '\u5171\u4EAB',
        drafts: '\u8349\u7A3F',
        finished: '\u5B8C\u6210',
        upgrade: '\u5347\u7EA7',
        downgradeWorkspace: '\u964D\u7EA7\u5DE5\u4F5C\u533A',
        companyID: '\u516C\u53F8 ID',
        userID: '\u7528\u6237 ID',
        disable: '\u7981\u7528',
        export: '\u5BFC\u51FA',
        initialValue: '\u521D\u59CB\u503C',
        currentDate: '\u5F53\u524D\u65E5\u671F',
        value: '\u503C',
        downloadFailedTitle: '\u4E0B\u8F7D\u5931\u8D25',
        downloadFailedDescription: '\u60A8\u7684\u4E0B\u8F7D\u672A\u80FD\u5B8C\u6210\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        filterLogs: '\u8FC7\u6EE4\u65E5\u5FD7',
        network: '\u7F51\u7EDC',
        reportID: '\u62A5\u544A ID',
        longID: '\u957FID',
        bankAccounts: '\u94F6\u884C\u8D26\u6237',
        chooseFile: '\u9009\u62E9\u6587\u4EF6',
        dropTitle: '\u968F\u5B83\u53BB\u5427',
        dropMessage: '\u5728\u6B64\u5904\u4E0A\u4F20\u60A8\u7684\u6587\u4EF6',
        ignore: 'Ignore',
        enabled: '\u542F\u7528',
        disabled: '\u7981\u7528',
        import: '\u5BFC\u5165',
        offlinePrompt: '\u60A8\u73B0\u5728\u65E0\u6CD5\u6267\u884C\u6B64\u64CD\u4F5C\u3002',
        outstanding: '\u4F18\u79C0\u7684',
        chats: '\u804A\u5929',
        tasks: '\u4EFB\u52A1',
        unread: '\u672A\u8BFB',
        sent: '\u5DF2\u53D1\u9001',
        links: '\u94FE\u63A5',
        days: '\u5929',
        rename: '\u91CD\u547D\u540D',
        address: '\u5730\u5740',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: '\u8DF3\u8FC7',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `\u9700\u8981\u7279\u5B9A\u7684\u5E2E\u52A9\u5417\uFF1F\u8BF7\u4E0E\u60A8\u7684\u5BA2\u6237\u7ECF\u7406${accountManagerDisplayName}\u804A\u5929\u3002`,
        chatNow: '\u7ACB\u5373\u804A\u5929',
        workEmail: '\u5DE5\u4F5C\u90AE\u7BB1',
        destination: '\u76EE\u7684\u5730',
        subrate: 'Subrate',
        perDiem: '\u6BCF\u65E5\u6D25\u8D34',
        validate: '\u9A8C\u8BC1',
        downloadAsPDF: '\u4E0B\u8F7D\u4E3APDF',
        downloadAsCSV: '\u4E0B\u8F7D\u4E3ACSV',
        help: '\u5E2E\u52A9',
        expenseReports: '\u8D39\u7528\u62A5\u544A',
        rateOutOfPolicy: '\u8D85\u51FA\u653F\u7B56\u7684\u8D39\u7387',
        reimbursable: '\u53EF\u62A5\u9500\u7684',
        editYourProfile: '\u7F16\u8F91\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599',
        comments: '\u8BC4\u8BBA',
        sharedIn: '\u5171\u4EAB\u4E8E',
        unreported: '\u672A\u62A5\u544A',
        explore: '\u63A2\u7D22',
        todo: '\u5F85\u529E\u4E8B\u9879',
        invoice: '\u53D1\u7968',
        expense: '\u8D39\u7528',
        chat: '\u804A\u5929',
        task: '\u4EFB\u52A1',
        trip: '\u65C5\u884C',
        apply: '\u7533\u8BF7',
        status: '\u72B6\u6001',
        on: '\u5728',
        before: '\u4E4B\u524D',
        after: '\u540E',
        reschedule: '\u91CD\u65B0\u5B89\u6392',
        general: '\u5E38\u89C4',
        never: '\u4ECE\u4E0D',
        workspacesTabTitle: '\u5DE5\u4F5C\u533A',
        getTheApp: '\u83B7\u53D6\u5E94\u7528\u7A0B\u5E8F',
        scanReceiptsOnTheGo: '\u7528\u624B\u673A\u626B\u63CF\u6536\u636E',
    },
    supportalNoAccess: {
        title: '\u6162\u4E00\u70B9',
        description: '\u5F53\u652F\u6301\u4EBA\u5458\u767B\u5F55\u65F6\uFF0C\u60A8\u65E0\u6743\u6267\u884C\u6B64\u64CD\u4F5C\u3002',
    },
    lockedAccount: {
        title: '\u8D26\u6237\u5DF2\u9501\u5B9A',
        description:
            '\u7531\u4E8E\u6B64\u8D26\u6237\u5DF2\u88AB\u9501\u5B9A\uFF0C\u60A8\u65E0\u6CD5\u5B8C\u6210\u6B64\u64CD\u4F5C\u3002\u8BF7\u8054\u7CFB concierge@expensify.com \u4EE5\u83B7\u53D6\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
    },
    location: {
        useCurrent: '\u4F7F\u7528\u5F53\u524D\u4F4D\u7F6E',
        notFound: '\u6211\u4EEC\u65E0\u6CD5\u627E\u5230\u60A8\u7684\u4F4D\u7F6E\u3002\u8BF7\u91CD\u8BD5\u6216\u624B\u52A8\u8F93\u5165\u5730\u5740\u3002',
        permissionDenied: '\u770B\u8D77\u6765\u60A8\u5DF2\u62D2\u7EDD\u8BBF\u95EE\u60A8\u7684\u4F4D\u7F6E\u3002',
        please: '\u8BF7',
        allowPermission: '\u5728\u8BBE\u7F6E\u4E2D\u5141\u8BB8\u4F4D\u7F6E\u8BBF\u95EE',
        tryAgain: '\u5E76\u91CD\u8BD5\u3002',
    },
    contact: {
        importContacts: '\u5BFC\u5165\u8054\u7CFB\u4EBA',
        importContactsTitle: '\u5BFC\u5165\u60A8\u7684\u8054\u7CFB\u4EBA',
        importContactsText: '\u4ECE\u60A8\u7684\u624B\u673A\u5BFC\u5165\u8054\u7CFB\u4EBA\uFF0C\u8FD9\u6837\u60A8\u6700\u559C\u6B22\u7684\u4EBA\u603B\u662F\u89E6\u624B\u53EF\u53CA\u3002',
        importContactsExplanation: '\u8FD9\u6837\u4F60\u6700\u559C\u6B22\u7684\u4EBA\u603B\u662F\u89E6\u624B\u53EF\u53CA\u3002',
        importContactsNativeText: '\u53EA\u5DEE\u4E00\u6B65\uFF01\u8BF7\u5141\u8BB8\u6211\u4EEC\u5BFC\u5165\u60A8\u7684\u8054\u7CFB\u4EBA\u3002',
    },
    anonymousReportFooter: {
        logoTagline: '\u52A0\u5165\u8BA8\u8BBA\u3002',
    },
    attachmentPicker: {
        cameraPermissionRequired: '\u76F8\u673A\u8BBF\u95EE\u6743\u9650',
        expensifyDoesNotHaveAccessToCamera:
            'Expensify\u65E0\u6CD5\u5728\u6CA1\u6709\u76F8\u673A\u6743\u9650\u7684\u60C5\u51B5\u4E0B\u62CD\u7167\u3002\u70B9\u51FB\u8BBE\u7F6E\u4EE5\u66F4\u65B0\u6743\u9650\u3002',
        attachmentError: '\u9644\u4EF6\u9519\u8BEF',
        errorWhileSelectingAttachment: '\u9009\u62E9\u9644\u4EF6\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
        errorWhileSelectingCorruptedAttachment: '\u9009\u62E9\u635F\u574F\u7684\u9644\u4EF6\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u6587\u4EF6\u3002',
        takePhoto: '\u62CD\u7167',
        chooseFromGallery: '\u4ECE\u56FE\u5E93\u4E2D\u9009\u62E9',
        chooseDocument: '\u9009\u62E9\u6587\u4EF6',
        attachmentTooLarge: '\u9644\u4EF6\u592A\u5927\u4E86',
        sizeExceeded: '\u9644\u4EF6\u5927\u5C0F\u8D85\u8FC724 MB\u9650\u5236',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `\u9644\u4EF6\u5927\u5C0F\u8D85\u8FC7 ${maxUploadSizeInMB} MB \u7684\u9650\u5236`,
        attachmentTooSmall: '\u9644\u4EF6\u592A\u5C0F',
        sizeNotMet: '\u9644\u4EF6\u5927\u5C0F\u5FC5\u987B\u5927\u4E8E240\u5B57\u8282',
        wrongFileType: '\u65E0\u6548\u7684\u6587\u4EF6\u7C7B\u578B',
        notAllowedExtension: '\u4E0D\u5141\u8BB8\u6B64\u6587\u4EF6\u7C7B\u578B\u3002\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u6587\u4EF6\u7C7B\u578B\u3002',
        folderNotAllowedMessage: '\u4E0D\u5141\u8BB8\u4E0A\u4F20\u6587\u4EF6\u5939\u3002\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u6587\u4EF6\u3002',
        protectedPDFNotSupported: '\u4E0D\u652F\u6301\u5BC6\u7801\u4FDD\u62A4\u7684PDF\u6587\u4EF6',
        attachmentImageResized: '\u6B64\u56FE\u50CF\u5DF2\u8C03\u6574\u5927\u5C0F\u4EE5\u4F9B\u9884\u89C8\u3002\u4E0B\u8F7D\u4EE5\u83B7\u53D6\u5B8C\u6574\u5206\u8FA8\u7387\u3002',
        attachmentImageTooLarge: '\u6B64\u56FE\u50CF\u592A\u5927\uFF0C\u65E0\u6CD5\u5728\u4E0A\u4F20\u524D\u9884\u89C8\u3002',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `\u60A8\u4E00\u6B21\u6700\u591A\u53EA\u80FD\u4E0A\u4F20 ${fileLimit} \u4E2A\u6587\u4EF6\u3002`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `\u6587\u4EF6\u8D85\u8FC7 ${maxUploadSizeInMB} MB\u3002\u8BF7\u91CD\u8BD5\u3002`,
    },
    dropzone: {
        addAttachments: '\u6DFB\u52A0\u9644\u4EF6',
        scanReceipts: '\u626B\u63CF\u6536\u636E',
        replaceReceipt: '\u66FF\u6362\u6536\u636E',
    },
    filePicker: {
        fileError: '\u6587\u4EF6\u9519\u8BEF',
        errorWhileSelectingFile: '\u9009\u62E9\u6587\u4EF6\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
    },
    connectionComplete: {
        title: '\u8FDE\u63A5\u5B8C\u6210',
        supportingText: '\u60A8\u53EF\u4EE5\u5173\u95ED\u6B64\u7A97\u53E3\u5E76\u8FD4\u56DE\u5230Expensify\u5E94\u7528\u7A0B\u5E8F\u3002',
    },
    avatarCropModal: {
        title: '\u7F16\u8F91\u7167\u7247',
        description: '\u968F\u610F\u62D6\u52A8\u3001\u7F29\u653E\u548C\u65CB\u8F6C\u60A8\u7684\u56FE\u50CF\u3002',
    },
    composer: {
        noExtensionFoundForMimeType: '\u672A\u627E\u5230\u4E0E MIME \u7C7B\u578B\u5339\u914D\u7684\u6269\u5C55\u540D',
        problemGettingImageYouPasted: '\u83B7\u53D6\u60A8\u7C98\u8D34\u7684\u56FE\u50CF\u65F6\u51FA\u73B0\u95EE\u9898\u3002',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `\u6700\u5927\u8BC4\u8BBA\u957F\u5EA6\u4E3A${formattedMaxLength}\u4E2A\u5B57\u7B26\u3002`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) =>
            `\u4EFB\u52A1\u6807\u9898\u7684\u6700\u5927\u957F\u5EA6\u4E3A${formattedMaxLength}\u4E2A\u5B57\u7B26\u3002`,
    },
    baseUpdateAppModal: {
        updateApp: '\u66F4\u65B0\u5E94\u7528\u7A0B\u5E8F',
        updatePrompt:
            '\u6B64\u5E94\u7528\u7A0B\u5E8F\u6709\u65B0\u7248\u672C\u53EF\u7528\u3002 \u7ACB\u5373\u66F4\u65B0\u6216\u7A0D\u540E\u91CD\u542F\u5E94\u7528\u4EE5\u4E0B\u8F7D\u6700\u65B0\u66F4\u6539\u3002',
    },
    deeplinkWrapper: {
        launching: '\u542F\u52A8 Expensify',
        expired: '\u60A8\u7684\u4F1A\u8BDD\u5DF2\u8FC7\u671F\u3002',
        signIn: '\u8BF7\u91CD\u65B0\u767B\u5F55\u3002',
        redirectedToDesktopApp: '\u6211\u4EEC\u5DF2\u5C06\u60A8\u91CD\u5B9A\u5411\u5230\u684C\u9762\u5E94\u7528\u7A0B\u5E8F\u3002',
        youCanAlso: '\u60A8\u8FD8\u53EF\u4EE5',
        openLinkInBrowser: '\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u6B64\u94FE\u63A5',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `\u60A8\u5DF2\u4F7F\u7528 ${email} \u767B\u5F55\u3002\u70B9\u51FB\u63D0\u793A\u4E2D\u7684\u201C\u6253\u5F00\u94FE\u63A5\u201D\u4EE5\u4F7F\u7528\u6B64\u8D26\u6237\u767B\u5F55\u684C\u9762\u5E94\u7528\u7A0B\u5E8F\u3002`,
        doNotSeePrompt: '\u770B\u4E0D\u5230\u63D0\u793A\u5417\uFF1F',
        tryAgain: '\u518D\u8BD5\u4E00\u6B21',
        or: '\uFF0C\u6216',
        continueInWeb: '\u7EE7\u7EED\u8BBF\u95EE\u7F51\u9875\u7248\u5E94\u7528\u7A0B\u5E8F',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra\uFF0C\u60A8\u5DF2\u767B\u5F55\uFF01',
        successfulSignInDescription: '\u8FD4\u56DE\u5230\u60A8\u539F\u6765\u7684\u6807\u7B7E\u9875\u7EE7\u7EED\u3002',
        title: '\u8FD9\u662F\u60A8\u7684\u9B54\u6CD5\u4EE3\u7801',
        description: '\u8BF7\u8F93\u5165\u6700\u521D\u8BF7\u6C42\u8BE5\u4EE3\u7801\u7684\u8BBE\u5907\u4E0A\u7684\u4EE3\u7801',
        doNotShare: '\u4E0D\u8981\u4E0E\u4EFB\u4F55\u4EBA\u5206\u4EAB\u60A8\u7684\u4EE3\u7801\u3002\nExpensify \u6C38\u8FDC\u4E0D\u4F1A\u5411\u60A8\u7D22\u8981\u4EE3\u7801\uFF01',
        or: '\uFF0C\u6216',
        signInHere: '\u53EA\u9700\u5728\u6B64\u767B\u5F55',
        expiredCodeTitle: '\u9B54\u6CD5\u4EE3\u7801\u5DF2\u8FC7\u671F',
        expiredCodeDescription: '\u8FD4\u56DE\u539F\u59CB\u8BBE\u5907\u5E76\u8BF7\u6C42\u65B0\u4EE3\u7801',
        successfulNewCodeRequest: '\u8BF7\u6C42\u9A8C\u8BC1\u7801\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u8BBE\u5907\u3002',
        tfaRequiredTitle: '\u9700\u8981\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1',
        tfaRequiredDescription: '\u8BF7\u8F93\u5165\u60A8\u5C1D\u8BD5\u767B\u5F55\u65F6\u7684\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u4EE3\u7801\u3002',
        requestOneHere: '\u5728\u8FD9\u91CC\u8BF7\u6C42\u4E00\u4E2A\u3002',
    },
    moneyRequestConfirmationList: {
        paidBy: '\u652F\u4ED8\u65B9',
        whatsItFor: '\u8FD9\u662F\u7528\u6765\u505A\u4EC0\u4E48\u7684\uFF1F',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '\u59D3\u540D\u3001\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801',
        findMember: '\u67E5\u627E\u6210\u5458',
        searchForSomeone: '\u641C\u7D22\u67D0\u4EBA',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '\u63D0\u4EA4\u62A5\u9500\uFF0C\u63A8\u8350\u7ED9\u4F60\u7684\u8001\u677F',
            subtitleText:
                '\u60F3\u8BA9\u4F60\u7684\u8001\u677F\u4E5F\u4F7F\u7528Expensify\u5417\uFF1F\u53EA\u9700\u5411\u4ED6\u4EEC\u63D0\u4EA4\u4E00\u7B14\u8D39\u7528\uFF0C\u5176\u4F59\u7684\u6211\u4EEC\u4F1A\u5904\u7406\u3002',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '\u9884\u7EA6\u901A\u8BDD',
    },
    hello: '\u4F60\u597D',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '\u8BF7\u5728\u4E0B\u9762\u5F00\u59CB\u3002',
        anotherLoginPageIsOpen: '\u53E6\u4E00\u4E2A\u767B\u5F55\u9875\u9762\u5DF2\u6253\u5F00\u3002',
        anotherLoginPageIsOpenExplanation:
            '\u60A8\u5DF2\u5728\u5355\u72EC\u7684\u6807\u7B7E\u9875\u4E2D\u6253\u5F00\u767B\u5F55\u9875\u9762\u3002\u8BF7\u4ECE\u8BE5\u6807\u7B7E\u9875\u767B\u5F55\u3002',
        welcome: '\u6B22\u8FCE\uFF01',
        welcomeWithoutExclamation: '\u6B22\u8FCE',
        phrase2: '\u91D1\u94B1\u4F1A\u8BF4\u8BDD\u3002\u73B0\u5728\u804A\u5929\u548C\u652F\u4ED8\u5408\u4E8C\u4E3A\u4E00\uFF0C\u8FD9\u4E5F\u53D8\u5F97\u7B80\u5355\u4E86\u3002',
        phrase3: '\u60A8\u7684\u4ED8\u6B3E\u901F\u5EA6\u5C31\u50CF\u60A8\u8868\u8FBE\u89C2\u70B9\u7684\u901F\u5EA6\u4E00\u6837\u5FEB\u3002',
        enterPassword: '\u8BF7\u8F93\u5165\u60A8\u7684\u5BC6\u7801',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}\uFF0C\u5728\u8FD9\u91CC\u770B\u5230\u65B0\u9762\u5B54\u603B\u662F\u5F88\u9AD8\u5174\uFF01`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u5230${login}\u7684\u9B54\u6CD5\u4EE3\u7801\u3002\u5B83\u5E94\u8BE5\u4F1A\u5728\u4E00\u4E24\u5206\u949F\u5185\u5230\u8FBE\u3002`,
    },
    login: {
        hero: {
            header: '\u65C5\u884C\u548C\u62A5\u9500\uFF0C\u4EE5\u804A\u5929\u7684\u901F\u5EA6',
            body: '\u6B22\u8FCE\u6765\u5230\u4E0B\u4E00\u4EE3\u7684Expensify\uFF0C\u5728\u8FD9\u91CC\uFF0C\u501F\u52A9\u4E0A\u4E0B\u6587\u5B9E\u65F6\u804A\u5929\uFF0C\u60A8\u7684\u65C5\u884C\u548C\u8D39\u7528\u5904\u7406\u5C06\u66F4\u52A0\u5FEB\u6377\u3002',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `\u60A8\u5DF2\u7ECF\u4EE5 ${email} \u767B\u5F55\u3002`,
        goBackMessage: ({provider}: GoBackMessageParams) => `\u4E0D\u60F3\u4F7F\u7528${provider}\u767B\u5F55\uFF1F`,
        continueWithMyCurrentSession: '\u7EE7\u7EED\u6211\u7684\u5F53\u524D\u4F1A\u8BDD',
        redirectToDesktopMessage: '\u5B8C\u6210\u767B\u5F55\u540E\uFF0C\u6211\u4EEC\u5C06\u628A\u60A8\u91CD\u5B9A\u5411\u5230\u684C\u9762\u5E94\u7528\u7A0B\u5E8F\u3002',
        signInAgreementMessage: '\u901A\u8FC7\u767B\u5F55\uFF0C\u60A8\u540C\u610F',
        termsOfService: '\u670D\u52A1\u6761\u6B3E',
        privacy: '\u9690\u79C1',
    },
    samlSignIn: {
        welcomeSAMLEnabled: '\u7EE7\u7EED\u4F7F\u7528\u5355\u70B9\u767B\u5F55\u767B\u5F55\uFF1A',
        orContinueWithMagicCode: '\u60A8\u8FD8\u53EF\u4EE5\u4F7F\u7528\u9B54\u6CD5\u4EE3\u7801\u767B\u5F55',
        useSingleSignOn: '\u4F7F\u7528\u5355\u70B9\u767B\u5F55',
        useMagicCode: '\u4F7F\u7528\u9B54\u6CD5\u4EE3\u7801',
        launching: '\u542F\u52A8\u4E2D...',
        oneMoment: '\u8BF7\u7A0D\u7B49\uFF0C\u6211\u4EEC\u5C06\u60A8\u91CD\u5B9A\u5411\u5230\u60A8\u516C\u53F8\u7684\u5355\u70B9\u767B\u5F55\u95E8\u6237\u3002',
    },
    reportActionCompose: {
        dropToUpload: '\u62D6\u653E\u4E0A\u4F20',
        sendAttachment: '\u53D1\u9001\u9644\u4EF6',
        addAttachment: '\u6DFB\u52A0\u9644\u4EF6',
        writeSomething: '\u5199\u70B9\u4EC0\u4E48...',
        blockedFromConcierge: '\u901A\u4FE1\u88AB\u7981\u6B62',
        fileUploadFailed: '\u4E0A\u4F20\u5931\u8D25\u3002\u6587\u4EF6\u4E0D\u53D7\u652F\u6301\u3002',
        localTime: ({user, time}: LocalTimeParams) => `\u73B0\u5728\u662F${time}\uFF0C\u9002\u5408${user}`,
        edited: '(\u5DF2\u7F16\u8F91)',
        emoji: 'Emoji',
        collapse: '\u6298\u53E0',
        expand: '\u5C55\u5F00',
    },
    reportActionContextMenu: {
        copyToClipboard: '\u590D\u5236\u5230\u526A\u8D34\u677F',
        copied: '\u5DF2\u590D\u5236\uFF01',
        copyLink: '\u590D\u5236\u94FE\u63A5',
        copyURLToClipboard: '\u590D\u5236\u7F51\u5740\u5230\u526A\u8D34\u677F',
        copyEmailToClipboard: '\u590D\u5236\u7535\u5B50\u90AE\u4EF6\u5230\u526A\u8D34\u677F',
        markAsUnread: '\u6807\u8BB0\u4E3A\u672A\u8BFB',
        markAsRead: '\u6807\u8BB0\u4E3A\u5DF2\u8BFB',
        editAction: ({action}: EditActionParams) => `\u7F16\u8F91 ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '\u8D39\u7528' : '\u8BC4\u8BBA'}`,
        deleteAction: ({action}: DeleteActionParams) => `\u5220\u9664 ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '\u8D39\u7528' : '\u8BC4\u8BBA'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '\u8D39\u7528' : '\u8BC4\u8BBA'}\u5417\uFF1F`,
        onlyVisible: '\u4EC5\u5BF9\u4EE5\u4E0B\u7528\u6237\u53EF\u89C1',
        replyInThread: '\u5728\u7EBF\u7A0B\u4E2D\u56DE\u590D',
        joinThread: '\u52A0\u5165\u7EBF\u7A0B',
        leaveThread: '\u79BB\u5F00\u7EBF\u7A0B',
        copyOnyxData: '\u590D\u5236 Onyx \u6570\u636E',
        flagAsOffensive: '\u6807\u8BB0\u4E3A\u653B\u51FB\u6027\u5185\u5BB9',
        menu: '\u83DC\u5355',
    },
    emojiReactions: {
        addReactionTooltip: '\u6DFB\u52A0\u8868\u60C5\u53CD\u5E94',
        reactedWith: '\u53CD\u5E94\u4E3A',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: '\u60A8\u9519\u8FC7\u4E86\u5728 \u7684\u805A\u4F1A',
        beginningOfArchivedRoomPartTwo: '\u8FD9\u91CC\u6CA1\u4EC0\u4E48\u53EF\u770B\u7684\u3002',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `\u6B64\u804A\u5929\u662F\u4E0E ${domainRoom} \u57DF\u4E0A\u7684\u6240\u6709 Expensify \u6210\u5458\u8FDB\u884C\u7684\u3002`,
        beginningOfChatHistoryDomainRoomPartTwo: '\u7528\u5B83\u4E0E\u540C\u4E8B\u804A\u5929\u3001\u5206\u4EAB\u6280\u5DE7\u548C\u63D0\u95EE\u3002',
        beginningOfChatHistoryAdminRoomPartOneFirst: '\u6B64\u804A\u5929\u662F\u4E0E',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: '\u7528\u5B83\u6765\u804A\u5929\u5DE5\u4F5C\u533A\u8BBE\u7F6E\u548C\u66F4\u591A\u5185\u5BB9\u3002',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) =>
            `\u6B64\u804A\u5929\u662F\u4E0E${workspaceName}\u4E2D\u7684\u6240\u6709\u4EBA\u8FDB\u884C\u7684\u3002`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `\u7528\u4E8E\u6700\u91CD\u8981\u7684\u516C\u544A\u3002`,
        beginningOfChatHistoryUserRoomPartOne: '\u6B64\u804A\u5929\u5BA4\u9002\u7528\u4E8E\u4EFB\u4F55\u5185\u5BB9',
        beginningOfChatHistoryUserRoomPartTwo: '\u76F8\u5173\u3002',
        beginningOfChatHistoryInvoiceRoomPartOne: `\u6B64\u804A\u5929\u7528\u4E8E\u53D1\u7968\u4E4B\u95F4\u7684\u4EA4\u6D41`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `\u4F7F\u7528 + \u6309\u94AE\u53D1\u9001\u53D1\u7968\u3002`,
        beginningOfChatHistory: '\u6B64\u804A\u5929\u662F\u4E0E',
        beginningOfChatHistoryPolicyExpenseChatPartOne: '\u8FD9\u662F\u5728\u8FD9\u91CC',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: '\u5C06\u63D0\u4EA4\u8D39\u7528\u81F3',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '\u53EA\u9700\u4F7F\u7528 + \u6309\u94AE\u3002',
        beginningOfChatHistorySelfDM:
            '\u8FD9\u662F\u60A8\u7684\u4E2A\u4EBA\u7A7A\u95F4\u3002\u7528\u4E8E\u8BB0\u5F55\u7B14\u8BB0\u3001\u4EFB\u52A1\u3001\u8349\u7A3F\u548C\u63D0\u9192\u3002',
        beginningOfChatHistorySystemDM: '\u6B22\u8FCE\uFF01\u8BA9\u6211\u4EEC\u4E3A\u60A8\u8FDB\u884C\u8BBE\u7F6E\u3002',
        chatWithAccountManager: '\u5728\u8FD9\u91CC\u4E0E\u60A8\u7684\u5BA2\u6237\u7ECF\u7406\u804A\u5929',
        sayHello: '\u6253\u62DB\u547C\uFF01',
        yourSpace: '\u60A8\u7684\u7A7A\u95F4',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `\u6B22\u8FCE\u6765\u5230${roomName}\uFF01`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `\u4F7F\u7528 + \u6309\u94AE\u6765${additionalText}\u4E00\u7B14\u8D39\u7528\u3002`,
        askConcierge: '\u968F\u65F6\u63D0\u95EE\u5E76\u83B7\u5F97\u5168\u5929\u5019\u5B9E\u65F6\u652F\u6301\u3002',
        conciergeSupport: '24/7 \u652F\u6301',
        create: '\u521B\u5EFA',
        iouTypes: {
            pay: '\u652F\u4ED8',
            split: '\u62C6\u5206',
            submit: '\u63D0\u4EA4',
            track: '\u8DDF\u8E2A',
            invoice: '\u53D1\u7968',
        },
    },
    adminOnlyCanPost: '\u53EA\u6709\u7BA1\u7406\u5458\u53EF\u4EE5\u5728\u6B64\u623F\u95F4\u53D1\u9001\u6D88\u606F\u3002',
    reportAction: {
        asCopilot: '\u4F5C\u4E3A\u526F\u9A7E\u9A76',
    },
    mentionSuggestions: {
        hereAlternateText: '\u901A\u77E5\u6B64\u5BF9\u8BDD\u4E2D\u7684\u6240\u6709\u4EBA',
    },
    newMessages: '\u65B0\u6D88\u606F',
    youHaveBeenBanned: '\u6CE8\u610F\uFF1A\u60A8\u5DF2\u88AB\u7981\u6B62\u5728\u6B64\u9891\u9053\u804A\u5929\u3002',
    reportTypingIndicator: {
        isTyping: '\u6B63\u5728\u8F93\u5165...',
        areTyping: '\u6B63\u5728\u8F93\u5165...',
        multipleMembers: '\u591A\u4E2A\u6210\u5458',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '\u6B64\u804A\u5929\u5BA4\u5DF2\u88AB\u5B58\u6863\u3002',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `\u7531\u4E8E${displayName}\u5173\u95ED\u4E86\u4ED6\u4EEC\u7684\u8D26\u6237\uFF0C\u6B64\u804A\u5929\u5DF2\u4E0D\u518D\u6D3B\u8DC3\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `\u7531\u4E8E${oldDisplayName}\u5DF2\u5C06\u5176\u5E10\u6237\u4E0E${displayName}\u5408\u5E76\uFF0C\u6B64\u804A\u5929\u4E0D\u518D\u6D3B\u8DC3\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `\u6B64\u804A\u5929\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A<strong>\u60A8</strong>\u4E0D\u518D\u662F${policyName}\u5DE5\u4F5C\u533A\u7684\u6210\u5458\u3002`
                : `\u6B64\u804A\u5929\u5DF2\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A${displayName}\u4E0D\u518D\u662F${policyName}\u5DE5\u4F5C\u533A\u7684\u6210\u5458\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `\u6B64\u804A\u5929\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A${policyName}\u4E0D\u518D\u662F\u6D3B\u8DC3\u7684\u5DE5\u4F5C\u533A\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `\u6B64\u804A\u5929\u4E0D\u518D\u6D3B\u8DC3\uFF0C\u56E0\u4E3A${policyName}\u4E0D\u518D\u662F\u6D3B\u8DC3\u7684\u5DE5\u4F5C\u533A\u3002`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '\u6B64\u9884\u8BA2\u5DF2\u5F52\u6863\u3002',
    },
    writeCapabilityPage: {
        label: '\u8C01\u53EF\u4EE5\u53D1\u5E03',
        writeCapability: {
            all: '\u6240\u6709\u6210\u5458',
            admins: '\u4EC5\u9650\u7BA1\u7406\u5458',
        },
    },
    sidebarScreen: {
        buttonFind: '\u5BFB\u627E\u67D0\u7269...',
        buttonMySettings: '\u6211\u7684\u8BBE\u7F6E',
        fabNewChat: '\u5F00\u59CB\u804A\u5929',
        fabNewChatExplained: '\u5F00\u59CB\u804A\u5929\uFF08\u6D6E\u52A8\u64CD\u4F5C\uFF09',
        chatPinned: '\u804A\u5929\u5DF2\u7F6E\u9876',
        draftedMessage: '\u8349\u7A3F\u6D88\u606F',
        listOfChatMessages: '\u804A\u5929\u6D88\u606F\u5217\u8868',
        listOfChats: '\u804A\u5929\u5217\u8868',
        saveTheWorld: '\u62EF\u6551\u4E16\u754C',
        tooltip: '\u4ECE\u8FD9\u91CC\u5F00\u59CB\uFF01',
        redirectToExpensifyClassicModal: {
            title: '\u5373\u5C06\u63A8\u51FA',
            description:
                '\u6211\u4EEC\u6B63\u5728\u5FAE\u8C03\u65B0\u7248 Expensify \u7684\u4E00\u4E9B\u7EC6\u8282\uFF0C\u4EE5\u9002\u5E94\u60A8\u7684\u7279\u5B9A\u8BBE\u7F6E\u3002\u4E0E\u6B64\u540C\u65F6\uFF0C\u8BF7\u524D\u5F80 Expensify Classic\u3002',
        },
    },
    allSettingsScreen: {
        subscription: '\u8BA2\u9605',
        domains: '\u57DF\u540D',
    },
    tabSelector: {
        chat: '\u804A\u5929',
        room: '\u623F\u95F4',
        distance: '\u8DDD\u79BB',
        manual: '\u624B\u518C',
        scan: '\u626B\u63CF',
    },
    spreadsheet: {
        upload: '\u4E0A\u4F20\u7535\u5B50\u8868\u683C',
        dragAndDrop:
            '\u5C06\u60A8\u7684\u7535\u5B50\u8868\u683C\u62D6\u653E\u5230\u6B64\u5904\uFF0C\u6216\u9009\u62E9\u4E0B\u65B9\u7684\u6587\u4EF6\u3002\u652F\u6301\u7684\u683C\u5F0F\uFF1A.csv\u3001.txt\u3001.xls \u548C .xlsx\u3002',
        chooseSpreadsheet: '\u9009\u62E9\u8981\u5BFC\u5165\u7684\u7535\u5B50\u8868\u683C\u6587\u4EF6\u3002\u652F\u6301\u7684\u683C\u5F0F\uFF1A.csv\u3001.txt\u3001.xls \u548C .xlsx\u3002',
        fileContainsHeader: '\u6587\u4EF6\u5305\u542B\u5217\u6807\u9898',
        column: ({name}: SpreadSheetColumnParams) => `\u5217 ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `\u7CDF\u7CD5\uFF01\u4E00\u4E2A\u5FC5\u586B\u5B57\u6BB5\uFF08\u201C${fieldName}\u201D\uFF09\u5C1A\u672A\u6620\u5C04\u3002\u8BF7\u68C0\u67E5\u5E76\u91CD\u8BD5\u3002`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `\u54CE\u5440\uFF01\u60A8\u5DF2\u5C06\u5355\u4E2A\u5B57\u6BB5\uFF08\u201C${fieldName}\u201D\uFF09\u6620\u5C04\u5230\u591A\u4E2A\u5217\u3002\u8BF7\u68C0\u67E5\u5E76\u91CD\u8BD5\u3002`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `\u54CE\u5440\uFF01\u5B57\u6BB5\uFF08\u201C${fieldName}\u201D\uFF09\u5305\u542B\u4E00\u4E2A\u6216\u591A\u4E2A\u7A7A\u503C\u3002\u8BF7\u68C0\u67E5\u5E76\u91CD\u8BD5\u3002`,
        importSuccessfulTitle: '\u5BFC\u5165\u6210\u529F',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `\u5DF2\u6DFB\u52A0${categories}\u4E2A\u7C7B\u522B\u3002` : '1 \u4E2A\u7C7B\u522B\u5DF2\u6DFB\u52A0\u3002',
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return '\u6CA1\u6709\u6210\u5458\u88AB\u6DFB\u52A0\u6216\u66F4\u65B0\u3002';
            }
            if (added && updated) {
                return `${added} \u540D\u6210\u5458${added > 1 ? 's' : ''} \u5DF2\u6DFB\u52A0\uFF0C${updated} \u540D\u6210\u5458${updated > 1 ? 's' : ''} \u5DF2\u66F4\u65B0\u3002`;
            }
            if (updated) {
                return updated > 1 ? `${updated} \u4F4D\u6210\u5458\u5DF2\u66F4\u65B0\u3002` : '1 \u540D\u6210\u5458\u5DF2\u66F4\u65B0\u3002';
            }
            return added > 1 ? `\u5DF2\u6DFB\u52A0 ${added} \u540D\u6210\u5458\u3002` : '\u5DF2\u6DFB\u52A0 1 \u540D\u6210\u5458\u3002';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) =>
            tags > 1 ? `\u5DF2\u6DFB\u52A0${tags}\u6807\u7B7E\u3002` : '\u5DF2\u6DFB\u52A01\u4E2A\u6807\u7B7E\u3002',
        importMultiLevelTagsSuccessfulDescription: '\u5DF2\u6DFB\u52A0\u591A\u7EA7\u6807\u7B7E\u3002',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `\u5DF2\u6DFB\u52A0${rates}\u7684\u6BCF\u65E5\u6D25\u8D34\u6807\u51C6\u3002` : '\u5DF2\u6DFB\u52A01\u4E2A\u6BCF\u65E5\u6D25\u8D34\u8D39\u7387\u3002',
        importFailedTitle: '\u5BFC\u5165\u5931\u8D25',
        importFailedDescription:
            '\u8BF7\u786E\u4FDD\u6240\u6709\u5B57\u6BB5\u5747\u5DF2\u6B63\u786E\u586B\u5199\uFF0C\u7136\u540E\u91CD\u8BD5\u3002\u5982\u679C\u95EE\u9898\u4ECD\u7136\u5B58\u5728\uFF0C\u8BF7\u8054\u7CFBConcierge\u3002',
        importDescription:
            '\u901A\u8FC7\u70B9\u51FB\u4E0B\u65B9\u6BCF\u4E2A\u5BFC\u5165\u5217\u65C1\u8FB9\u7684\u4E0B\u62C9\u83DC\u5355\uFF0C\u9009\u62E9\u8981\u4ECE\u7535\u5B50\u8868\u683C\u4E2D\u6620\u5C04\u7684\u5B57\u6BB5\u3002',
        sizeNotMet: '\u6587\u4EF6\u5927\u5C0F\u5FC5\u987B\u5927\u4E8E0\u5B57\u8282',
        invalidFileMessage:
            '\u60A8\u4E0A\u4F20\u7684\u6587\u4EF6\u4E3A\u7A7A\u6216\u5305\u542B\u65E0\u6548\u6570\u636E\u3002\u8BF7\u786E\u4FDD\u6587\u4EF6\u683C\u5F0F\u6B63\u786E\u5E76\u5305\u542B\u5FC5\u8981\u7684\u4FE1\u606F\uFF0C\u7136\u540E\u518D\u6B21\u4E0A\u4F20\u3002',
        importSpreadsheet: '\u5BFC\u5165\u7535\u5B50\u8868\u683C',
        downloadCSV: '\u4E0B\u8F7D CSV',
    },
    receipt: {
        upload: '\u4E0A\u4F20\u6536\u636E',
        dragReceiptBeforeEmail: '\u5C06\u6536\u636E\u62D6\u5230\u6B64\u9875\u9762\u4E0A\uFF0C\u8F6C\u53D1\u6536\u636E\u5230',
        dragReceiptAfterEmail: '\u6216\u8005\u9009\u62E9\u4E0B\u65B9\u7684\u6587\u4EF6\u4E0A\u4F20\u3002',
        chooseReceipt: '\u9009\u62E9\u4E00\u4E2A\u6536\u636E\u4E0A\u4F20\u6216\u8F6C\u53D1\u6536\u636E\u5230',
        takePhoto: '\u62CD\u7167',
        cameraAccess: '\u9700\u8981\u76F8\u673A\u6743\u9650\u6765\u62CD\u6444\u6536\u636E\u7167\u7247\u3002',
        deniedCameraAccess: '\u76F8\u673A\u8BBF\u95EE\u6743\u9650\u4ECD\u672A\u6388\u4E88\uFF0C\u8BF7\u6309\u7167\u4EE5\u4E0B\u6B65\u9AA4\u64CD\u4F5C',
        deniedCameraAccessInstructions: '\u8FD9\u4E9B\u8BF4\u660E',
        cameraErrorTitle: '\u76F8\u673A\u9519\u8BEF',
        cameraErrorMessage: '\u62CD\u7167\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
        locationAccessTitle: '\u5141\u8BB8\u4F4D\u7F6E\u8BBF\u95EE',
        locationAccessMessage: '\u4F4D\u7F6E\u8BBF\u95EE\u5E2E\u52A9\u6211\u4EEC\u5728\u60A8\u51FA\u884C\u65F6\u4FDD\u6301\u60A8\u7684\u65F6\u533A\u548C\u8D27\u5E01\u51C6\u786E\u3002',
        locationErrorTitle: '\u5141\u8BB8\u4F4D\u7F6E\u8BBF\u95EE',
        locationErrorMessage: '\u4F4D\u7F6E\u8BBF\u95EE\u5E2E\u52A9\u6211\u4EEC\u5728\u60A8\u51FA\u884C\u65F6\u4FDD\u6301\u60A8\u7684\u65F6\u533A\u548C\u8D27\u5E01\u51C6\u786E\u3002',
        allowLocationFromSetting: `\u4F4D\u7F6E\u8BBF\u95EE\u5E2E\u52A9\u6211\u4EEC\u5728\u60A8\u5230\u4EFB\u4F55\u5730\u65B9\u65F6\u4FDD\u6301\u60A8\u7684\u65F6\u533A\u548C\u8D27\u5E01\u51C6\u786E\u3002\u8BF7\u5728\u8BBE\u5907\u7684\u6743\u9650\u8BBE\u7F6E\u4E2D\u5141\u8BB8\u4F4D\u7F6E\u8BBF\u95EE\u3002`,
        dropTitle: '\u968F\u5B83\u53BB\u5427',
        dropMessage: '\u5728\u6B64\u5904\u4E0A\u4F20\u60A8\u7684\u6587\u4EF6',
        flash: '\u95EA\u5149',
        multiScan: '\u591A\u91CD\u626B\u63CF',
        shutter: '\u5FEB\u95E8',
        gallery: '\u753B\u5ECA',
        deleteReceipt: '\u5220\u9664\u6536\u636E',
        deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u6536\u636E\u5417\uFF1F',
        addReceipt: '\u6DFB\u52A0\u6536\u636E',
    },
    quickAction: {
        scanReceipt: '\u626B\u63CF\u6536\u636E',
        recordDistance: '\u8DDF\u8E2A\u8DDD\u79BB',
        requestMoney: '\u521B\u5EFA\u62A5\u9500\u5355',
        perDiem: '\u521B\u5EFA\u6BCF\u65E5\u6D25\u8D34',
        splitBill: '\u62C6\u5206\u8D39\u7528',
        splitScan: '\u62C6\u5206\u6536\u636E',
        splitDistance: '\u5206\u5272\u8DDD\u79BB',
        paySomeone: ({name}: PaySomeoneParams = {}) => `\u652F\u4ED8 ${name ?? '\u67D0\u4EBA'}`,
        assignTask: '\u5206\u914D\u4EFB\u52A1',
        header: '\u5FEB\u901F\u64CD\u4F5C',
        noLongerHaveReportAccess:
            '\u60A8\u4E0D\u518D\u62E5\u6709\u5BF9\u4E4B\u524D\u5FEB\u901F\u64CD\u4F5C\u76EE\u7684\u5730\u7684\u8BBF\u95EE\u6743\u9650\u3002\u8BF7\u5728\u4E0B\u9762\u9009\u62E9\u4E00\u4E2A\u65B0\u7684\u3002',
        updateDestination: '\u66F4\u65B0\u76EE\u7684\u5730',
        createReport: '\u521B\u5EFA\u62A5\u544A',
    },
    iou: {
        amount: '\u91D1\u989D',
        taxAmount: '\u7A0E\u989D',
        taxRate: '\u7A0E\u7387',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `\u6279\u51C6 ${formattedAmount}` : '\u6279\u51C6'),
        approved: '\u6279\u51C6',
        cash: '\u73B0\u91D1',
        card: '\u5361\u7247',
        original: '\u539F\u59CB',
        split: '\u62C6\u5206',
        splitExpense: '\u62C6\u5206\u8D39\u7528',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `\u6765\u81EA${merchant}\u7684${amount}`,
        addSplit: '\u6DFB\u52A0\u5206\u644A',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `\u603B\u91D1\u989D\u6BD4\u539F\u59CB\u8D39\u7528\u591A\u51FA${amount}\u3002`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `\u603B\u91D1\u989D\u6BD4\u539F\u59CB\u8D39\u7528\u5C11 ${amount}\u3002`,
        splitExpenseZeroAmount: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u8F93\u5165\u6709\u6548\u91D1\u989D\u3002',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `\u7F16\u8F91 ${merchant} \u7684 ${amount}`,
        removeSplit: '\u5220\u9664\u62C6\u5206',
        paySomeone: ({name}: PaySomeoneParams = {}) => `\u652F\u4ED8 ${name ?? '\u67D0\u4EBA'}`,
        expense: '\u8D39\u7528',
        categorize: '\u5206\u7C7B',
        share: '\u5206\u4EAB',
        participants: '\u53C2\u4E0E\u8005',
        createExpense: '\u521B\u5EFA\u62A5\u9500\u5355',
        addExpense: '\u6DFB\u52A0\u8D39\u7528',
        chooseRecipient: '\u9009\u62E9\u6536\u4EF6\u4EBA',
        createExpenseWithAmount: ({amount}: {amount: string}) => `\u521B\u5EFA ${amount} \u8D39\u7528`,
        confirmDetails: '\u786E\u8BA4\u8BE6\u60C5',
        pay: '\u652F\u4ED8',
        cancelPayment: '\u53D6\u6D88\u4ED8\u6B3E',
        cancelPaymentConfirmation: '\u60A8\u786E\u5B9A\u8981\u53D6\u6D88\u6B64\u4ED8\u6B3E\u5417\uFF1F',
        viewDetails: '\u67E5\u770B\u8BE6\u60C5',
        pending: '\u5F85\u5904\u7406',
        canceled: '\u5DF2\u53D6\u6D88',
        posted: '\u5DF2\u53D1\u5E03',
        deleteReceipt: '\u5220\u9664\u6536\u636E',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `\u5728\u6B64\u62A5\u544A\u4E2D\u5220\u9664\u4E86\u4E00\u7B14\u8D39\u7528\uFF0C${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `\u79FB\u52A8\u4E86\u4E00\u7B14\u8D39\u7528${reportName ? `\u6765\u81EA${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `\u79FB\u52A8\u4E86\u6B64\u8D39\u7528${reportName ? `\u81F3 <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: '\u5DF2\u5C06\u6B64\u8D39\u7528\u79FB\u52A8\u5230\u60A8\u7684\u4E2A\u4EBA\u7A7A\u95F4',
        pendingMatchWithCreditCard: '\u6536\u636E\u5F85\u4E0E\u5361\u4EA4\u6613\u5339\u914D',
        pendingMatch: '\u5F85\u5904\u7406\u5339\u914D',
        pendingMatchWithCreditCardDescription: '\u6536\u636E\u5F85\u4E0E\u5361\u4EA4\u6613\u5339\u914D\u3002\u6807\u8BB0\u4E3A\u73B0\u91D1\u4EE5\u53D6\u6D88\u3002',
        markAsCash: '\u6807\u8BB0\u4E3A\u73B0\u91D1',
        routePending: '\u8DEF\u7EBF\u5F85\u5B9A...',
        receiptScanning: () => ({
            one: '\u6536\u636E\u626B\u63CF\u4E2D...',
            other: '\u6536\u636E\u626B\u63CF\u4E2D...',
        }),
        scanMultipleReceipts: '\u626B\u63CF\u591A\u5F20\u6536\u636E',
        scanMultipleReceiptsDescription:
            '\u4E00\u6B21\u62CD\u6444\u6240\u6709\u6536\u636E\u7684\u7167\u7247\uFF0C\u7136\u540E\u81EA\u5DF1\u786E\u8BA4\u8BE6\u60C5\u6216\u8BA9SmartScan\u5904\u7406\u3002',
        receiptScanInProgress: '\u6536\u636E\u626B\u63CF\u4E2D',
        receiptScanInProgressDescription: '\u6536\u636E\u626B\u63CF\u4E2D\u3002\u7A0D\u540E\u67E5\u770B\u6216\u7ACB\u5373\u8F93\u5165\u8BE6\u7EC6\u4FE1\u606F\u3002',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? '\u53D1\u73B0\u6F5C\u5728\u7684\u91CD\u590D\u8D39\u7528\u3002\u8BF7\u68C0\u67E5\u91CD\u590D\u9879\u4EE5\u542F\u7528\u63D0\u4EA4\u3002'
                : '\u53D1\u73B0\u6F5C\u5728\u7684\u91CD\u590D\u8D39\u7528\u3002\u8BF7\u67E5\u770B\u91CD\u590D\u9879\u4EE5\u542F\u7528\u5BA1\u6279\u3002',
        receiptIssuesFound: () => ({
            one: '\u53D1\u73B0\u95EE\u9898',
            other: '\u53D1\u73B0\u7684\u95EE\u9898',
        }),
        fieldPending: '\u5F85\u5904\u7406...',
        defaultRate: '\u9ED8\u8BA4\u8D39\u7387',
        receiptMissingDetails: '\u6536\u636E\u7F3A\u5C11\u8BE6\u7EC6\u4FE1\u606F',
        missingAmount: '\u7F3A\u5C11\u91D1\u989D',
        missingMerchant: '\u7F3A\u5C11\u5546\u5BB6',
        receiptStatusTitle: '\u626B\u63CF\u4E2D\u2026',
        receiptStatusText:
            '\u626B\u63CF\u65F6\u53EA\u6709\u60A8\u53EF\u4EE5\u770B\u5230\u6B64\u6536\u636E\u3002\u7A0D\u540E\u67E5\u770B\u6216\u7ACB\u5373\u8F93\u5165\u8BE6\u7EC6\u4FE1\u606F\u3002',
        receiptScanningFailed: '\u6536\u636E\u626B\u63CF\u5931\u8D25\u3002\u8BF7\u624B\u52A8\u8F93\u5165\u8BE6\u7EC6\u4FE1\u606F\u3002',
        transactionPendingDescription: '\u4EA4\u6613\u5F85\u5904\u7406\u3002\u53EF\u80FD\u9700\u8981\u51E0\u5929\u65F6\u95F4\u624D\u80FD\u53D1\u5E03\u3002',
        companyInfo: '\u516C\u53F8\u4FE1\u606F',
        companyInfoDescription: '\u5728\u60A8\u53D1\u9001\u7B2C\u4E00\u5F20\u53D1\u7968\u4E4B\u524D\uFF0C\u6211\u4EEC\u9700\u8981\u66F4\u591A\u8BE6\u7EC6\u4FE1\u606F\u3002',
        yourCompanyName: '\u60A8\u7684\u516C\u53F8\u540D\u79F0',
        yourCompanyWebsite: '\u60A8\u7684\u516C\u53F8\u7F51\u7AD9',
        yourCompanyWebsiteNote: '\u5982\u679C\u60A8\u6CA1\u6709\u7F51\u7AD9\uFF0C\u53EF\u4EE5\u63D0\u4F9B\u60A8\u516C\u53F8\u7684LinkedIn\u6216\u793E\u4EA4\u5A92\u4F53\u8D44\u6599\u3002',
        invalidDomainError: '\u60A8\u8F93\u5165\u7684\u57DF\u540D\u65E0\u6548\u3002\u8981\u7EE7\u7EED\uFF0C\u8BF7\u8F93\u5165\u6709\u6548\u7684\u57DF\u540D\u3002',
        publicDomainError: '\u60A8\u5DF2\u8FDB\u5165\u516C\u5171\u57DF\u3002\u8981\u7EE7\u7EED\uFF0C\u8BF7\u8F93\u5165\u79C1\u4EBA\u57DF\u3002',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} \u626B\u63CF\u4E2D`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} \u4E2A\u5F85\u5904\u7406`);
            }
            return {
                one: statusText.length > 0 ? `1 \u7B14\u8D39\u7528 (${statusText.join(', ')})` : `1 \u7B14\u62A5\u9500`,
                other: (count: number) => (statusText.length > 0 ? `${count} \u7B14\u8D39\u7528 (${statusText.join(', ')})` : `${count} \u7B14\u8D39\u7528`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 \u7B14\u62A5\u9500',
                other: (count: number) => `${count} \u7B14\u8D39\u7528`,
            };
        },
        deleteExpense: () => ({
            one: '\u5220\u9664\u8D39\u7528',
            other: '\u5220\u9664\u8D39\u7528',
        }),
        deleteConfirmation: () => ({
            one: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u8D39\u7528\u5417\uFF1F',
            other: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u8D39\u7528\u5417\uFF1F',
        }),
        deleteReport: '\u5220\u9664\u62A5\u544A',
        deleteReportConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u62A5\u544A\u5417\uFF1F',
        settledExpensify: '\u5DF2\u652F\u4ED8',
        done: '\u5B8C\u6210',
        settledElsewhere: '\u5728\u5176\u4ED6\u5730\u65B9\u652F\u4ED8',
        individual: '\u4E2A\u4EBA',
        business: '\u5546\u4E1A',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `\u7528 Expensify \u652F\u4ED8 ${formattedAmount}` : `\u4F7F\u7528Expensify\u652F\u4ED8`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) =>
            formattedAmount ? `\u4EE5\u4E2A\u4EBA\u8EAB\u4EFD\u652F\u4ED8${formattedAmount}` : `\u4EE5\u4E2A\u4EBA\u8EAB\u4EFD\u652F\u4ED8`,
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `\u652F\u4ED8${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) =>
            formattedAmount ? `\u4EE5\u4F01\u4E1A\u8EAB\u4EFD\u652F\u4ED8${formattedAmount}` : `\u4EE5\u4F01\u4E1A\u8EAB\u4EFD\u652F\u4ED8`,
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) =>
            formattedAmount ? `\u5728\u5176\u4ED6\u5730\u65B9\u652F\u4ED8${formattedAmount}` : `\u5728\u5176\u4ED6\u5730\u65B9\u652F\u4ED8`,
        nextStep: '\u4E0B\u4E00\u6B65',
        finished: '\u5B8C\u6210',
        sendInvoice: ({amount}: RequestAmountParams) => `\u53D1\u9001 ${amount} \u53D1\u7968`,
        submitAmount: ({amount}: RequestAmountParams) => `\u63D0\u4EA4 ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `\u5BF9\u4E8E${comment}` : ''}`,
        submitted: `\u5DF2\u63D0\u4EA4`,
        automaticallySubmitted: `\u901A\u8FC7<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">\u5EF6\u8FDF\u63D0\u4EA4</a>\u63D0\u4EA4`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `\u8DDF\u8E2A ${formattedAmount}${comment ? `\u5BF9\u4E8E${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `\u62C6\u5206 ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `\u62C6\u5206 ${formattedAmount}${comment ? `\u5BF9\u4E8E${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `\u60A8\u7684\u5206\u644A\u91D1\u989D ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} \u6B20 ${amount}${comment ? `\u5BF9\u4E8E${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} \u6B20\u6B3E\uFF1A`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}\u652F\u4ED8\u4E86${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} \u652F\u4ED8\u4E86\uFF1A`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} \u82B1\u8D39\u4E86 ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} \u82B1\u8D39\uFF1A`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} \u5DF2\u6279\u51C6:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} \u6279\u51C6\u4E86 ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `\u652F\u4ED8 ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) =>
            `\u652F\u4ED8\u4E86${amount}\u3002\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4EE5\u63A5\u6536\u60A8\u7684\u4ED8\u6B3E\u3002`,
        automaticallyApproved: `\u901A\u8FC7<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">\u5DE5\u4F5C\u533A\u89C4\u5219</a>\u6279\u51C6`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `\u6279\u51C6 ${amount}`,
        approvedMessage: `\u6279\u51C6`,
        unapproved: `\u672A\u6279\u51C6`,
        automaticallyForwarded: `\u901A\u8FC7<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">\u5DE5\u4F5C\u533A\u89C4\u5219</a>\u6279\u51C6`,
        forwarded: `\u6279\u51C6`,
        rejectedThisReport: '\u62D2\u7EDD\u4E86\u6B64\u62A5\u544A',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\u5F00\u59CB\u7ED3\u7B97\u3002\u5728${submitterDisplayName}\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4E4B\u524D\uFF0C\u4ED8\u6B3E\u5C06\u88AB\u6401\u7F6E\u3002`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''}\u53D6\u6D88\u4E86\u4ED8\u6B3E`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `\u53D6\u6D88\u4E86${amount}\u4ED8\u6B3E\uFF0C\u56E0\u4E3A${submitterDisplayName}\u572830\u5929\u5185\u6CA1\u6709\u542F\u7528\u4ED6\u4EEC\u7684Expensify Wallet\u3002`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} \u6DFB\u52A0\u4E86\u4E00\u4E2A\u94F6\u884C\u8D26\u6237\u3002${amount} \u4ED8\u6B3E\u5DF2\u5B8C\u6210\u3002`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}\u5728\u5176\u4ED6\u5730\u65B9\u652F\u4ED8`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}\u901A\u8FC7Expensify\u652F\u4ED8`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}\u901A\u8FC7<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">\u5DE5\u4F5C\u533A\u89C4\u5219</a>\u4F7F\u7528Expensify\u4ED8\u6B3E`,
        noReimbursableExpenses: '\u6B64\u62A5\u544A\u7684\u91D1\u989D\u65E0\u6548',
        pendingConversionMessage: '\u603B\u989D\u5C06\u5728\u60A8\u91CD\u65B0\u8054\u7F51\u65F6\u66F4\u65B0',
        changedTheExpense: '\u66F4\u6539\u4E86\u8D39\u7528',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} \u5230 ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `\u5C06${translatedChangedField}\u8BBE\u7F6E\u4E3A${newMerchant}\uFF0C\u8FD9\u5C06\u91D1\u989D\u8BBE\u7F6E\u4E3A${newAmountToDisplay}\u3002`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}\uFF08\u4E4B\u524D\u662F${oldValueToDisplay}\uFF09`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) =>
            `${valueName} \u5230 ${newValueToDisplay}\uFF08\u4E4B\u524D\u662F ${oldValueToDisplay}\uFF09`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `\u5C06${translatedChangedField}\u66F4\u6539\u4E3A${newMerchant}\uFF08\u4E4B\u524D\u4E3A${oldMerchant}\uFF09\uFF0C\u5C06\u91D1\u989D\u66F4\u65B0\u4E3A${newAmountToDisplay}\uFF08\u4E4B\u524D\u4E3A${oldAmountToDisplay}\uFF09`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `\u5BF9\u4E8E${comment}` : '\u8D39\u7528'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `\u53D1\u7968\u62A5\u544A #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} \u5DF2\u53D1\u9001${comment ? `\u5BF9\u4E8E${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `\u5C06\u8D39\u7528\u4ECE\u4E2A\u4EBA\u7A7A\u95F4\u79FB\u52A8\u5230${workspaceName ?? `\u4E0E ${reportName} \u804A\u5929`}`,
        movedToPersonalSpace: '\u5DF2\u5C06\u8D39\u7528\u79FB\u81F3\u4E2A\u4EBA\u7A7A\u95F4',
        tagSelection: '\u9009\u62E9\u4E00\u4E2A\u6807\u7B7E\u4EE5\u66F4\u597D\u5730\u7EC4\u7EC7\u60A8\u7684\u652F\u51FA\u3002',
        categorySelection: '\u9009\u62E9\u4E00\u4E2A\u7C7B\u522B\u4EE5\u66F4\u597D\u5730\u7EC4\u7EC7\u60A8\u7684\u652F\u51FA\u3002',
        error: {
            invalidCategoryLength: '\u7C7B\u522B\u540D\u79F0\u8D85\u8FC7255\u4E2A\u5B57\u7B26\u3002\u8BF7\u7F29\u77ED\u5B83\u6216\u9009\u62E9\u4E0D\u540C\u7684\u7C7B\u522B\u3002',
            invalidTagLength: '\u6807\u7B7E\u540D\u79F0\u8D85\u8FC7255\u4E2A\u5B57\u7B26\u3002\u8BF7\u7F29\u77ED\u6216\u9009\u62E9\u4E0D\u540C\u7684\u6807\u7B7E\u3002',
            invalidAmount: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u8F93\u5165\u6709\u6548\u91D1\u989D',
            invalidIntegerAmount: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u8F93\u5165\u4E00\u4E2A\u5B8C\u6574\u7684\u7F8E\u5143\u91D1\u989D',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `\u6700\u5927\u7A0E\u989D\u4E3A${amount}`,
            invalidSplit: '\u62C6\u5206\u7684\u603B\u548C\u5FC5\u987B\u7B49\u4E8E\u603B\u91D1\u989D',
            invalidSplitParticipants: '\u8BF7\u4E3A\u81F3\u5C11\u4E24\u4E2A\u53C2\u4E0E\u8005\u8F93\u5165\u5927\u4E8E\u96F6\u7684\u91D1\u989D',
            invalidSplitYourself: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u975E\u96F6\u91D1\u989D\u8FDB\u884C\u62C6\u5206',
            noParticipantSelected: '\u8BF7\u9009\u62E9\u4E00\u4F4D\u53C2\u4E0E\u8005',
            other: '\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericCreateFailureMessage: '\u63D0\u4EA4\u6B64\u8D39\u7528\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericCreateInvoiceFailureMessage: '\u53D1\u9001\u6B64\u53D1\u7968\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericHoldExpenseFailureMessage: '\u4FDD\u5B58\u6B64\u8D39\u7528\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericUnholdExpenseFailureMessage:
                '\u4ECE\u4FDD\u7559\u72B6\u6001\u4E2D\u79FB\u9664\u6B64\u8D39\u7528\u65F6\u53D1\u751F\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            receiptDeleteFailureError: '\u5220\u9664\u6B64\u6536\u636E\u65F6\u53D1\u751F\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            receiptFailureMessage: '\u4E0A\u4F20\u60A8\u7684\u6536\u636E\u65F6\u51FA\u9519\u3002\u8BF7',
            receiptFailureMessageShort: '\u4E0A\u4F20\u60A8\u7684\u6536\u636E\u65F6\u51FA\u9519\u3002',
            tryAgainMessage: '\u518D\u8BD5\u4E00\u6B21',
            saveFileMessage: '\u4FDD\u5B58\u6536\u636E',
            uploadLaterMessage: '\u7A0D\u540E\u4E0A\u4F20\u3002',
            genericDeleteFailureMessage: '\u5220\u9664\u6B64\u8D39\u7528\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericEditFailureMessage: '\u7F16\u8F91\u6B64\u8D39\u7528\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            genericSmartscanFailureMessage: '\u4EA4\u6613\u7F3A\u5C11\u5B57\u6BB5',
            duplicateWaypointsErrorMessage: '\u8BF7\u5220\u9664\u91CD\u590D\u7684\u822A\u70B9',
            atLeastTwoDifferentWaypoints: '\u8BF7\u8F93\u5165\u81F3\u5C11\u4E24\u4E2A\u4E0D\u540C\u7684\u5730\u5740',
            splitExpenseMultipleParticipantsErrorMessage:
                '\u8D39\u7528\u4E0D\u80FD\u5728\u5DE5\u4F5C\u533A\u548C\u5176\u4ED6\u6210\u5458\u4E4B\u95F4\u62C6\u5206\u3002\u8BF7\u66F4\u65B0\u60A8\u7684\u9009\u62E9\u3002',
            invalidMerchant: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5546\u5BB6\u540D\u79F0',
            atLeastOneAttendee: '\u5FC5\u987B\u9009\u62E9\u81F3\u5C11\u4E00\u4F4D\u53C2\u4E0E\u8005',
            invalidQuantity: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u6570\u91CF',
            quantityGreaterThanZero: '\u6570\u91CF\u5FC5\u987B\u5927\u4E8E\u96F6',
            invalidSubrateLength: '\u5FC5\u987B\u81F3\u5C11\u6709\u4E00\u4E2A\u5B50\u8D39\u7387',
            invalidRate: '\u6B64\u5DE5\u4F5C\u533A\u7684\u8D39\u7387\u65E0\u6548\u3002\u8BF7\u9009\u62E9\u5DE5\u4F5C\u533A\u4E2D\u7684\u53EF\u7528\u8D39\u7387\u3002',
        },
        dismissReceiptError: '\u6D88\u9664\u9519\u8BEF',
        dismissReceiptErrorConfirmation:
            '\u6CE8\u610F\uFF01\u5FFD\u7565\u6B64\u9519\u8BEF\u5C06\u5B8C\u5168\u5220\u9664\u60A8\u4E0A\u4F20\u7684\u6536\u636E\u3002\u60A8\u786E\u5B9A\u5417\uFF1F',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\u5F00\u59CB\u7ED3\u7B97\u3002\u5728${submitterDisplayName}\u542F\u7528\u4ED6\u4EEC\u7684\u94B1\u5305\u4E4B\u524D\uFF0C\u4ED8\u6B3E\u5C06\u88AB\u6401\u7F6E\u3002`,
        enableWallet: '\u542F\u7528\u94B1\u5305',
        hold: '\u4FDD\u6301',
        unhold: '\u79FB\u9664\u4FDD\u7559',
        holdExpense: '\u4FDD\u7559\u8D39\u7528',
        unholdExpense: '\u53D6\u6D88\u4FDD\u7559\u8D39\u7528',
        heldExpense: '\u4FDD\u7559\u6B64\u8D39\u7528',
        unheldExpense: '\u53D6\u6D88\u6682\u6302\u6B64\u8D39\u7528',
        moveUnreportedExpense: '\u79FB\u52A8\u672A\u62A5\u544A\u7684\u8D39\u7528',
        addUnreportedExpense: '\u6DFB\u52A0\u672A\u62A5\u544A\u7684\u8D39\u7528',
        createNewExpense: '\u521B\u5EFA\u65B0\u8D39\u7528',
        selectUnreportedExpense: '\u8BF7\u9009\u62E9\u81F3\u5C11\u4E00\u9879\u8D39\u7528\u6DFB\u52A0\u5230\u62A5\u544A\u4E2D\u3002',
        emptyStateUnreportedExpenseTitle: '\u6CA1\u6709\u672A\u62A5\u544A\u7684\u8D39\u7528',
        emptyStateUnreportedExpenseSubtitle:
            '\u770B\u8D77\u6765\u60A8\u6CA1\u6709\u672A\u62A5\u544A\u7684\u8D39\u7528\u3002\u8BF7\u5C1D\u8BD5\u5728\u4E0B\u9762\u521B\u5EFA\u4E00\u4E2A\u3002',
        addUnreportedExpenseConfirm: '\u6DFB\u52A0\u5230\u62A5\u544A\u4E2D',
        explainHold: '\u8BF7\u89E3\u91CA\u4E3A\u4EC0\u4E48\u60A8\u8981\u4FDD\u7559\u6B64\u8D39\u7528\u3002',
        undoSubmit: '\u64A4\u9500\u63D0\u4EA4',
        retracted: '\u64A4\u56DE',
        undoClose: '\u64A4\u9500\u5173\u95ED',
        reopened: '\u91CD\u65B0\u6253\u5F00',
        reopenReport: '\u91CD\u65B0\u6253\u5F00\u62A5\u544A',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `\u6B64\u62A5\u544A\u5DF2\u5BFC\u51FA\u5230${connectionName}\u3002\u66F4\u6539\u5B83\u53EF\u80FD\u4F1A\u5BFC\u81F4\u6570\u636E\u4E0D\u4E00\u81F4\u3002\u60A8\u786E\u5B9A\u8981\u91CD\u65B0\u6253\u5F00\u6B64\u62A5\u544A\u5417\uFF1F`,
        reason: '\u539F\u56E0',
        holdReasonRequired: '\u5728\u4FDD\u7559\u65F6\u9700\u8981\u63D0\u4F9B\u539F\u56E0\u3002',
        expenseWasPutOnHold: '\u8D39\u7528\u5DF2\u88AB\u6682\u505C',
        expenseOnHold: '\u6B64\u8D39\u7528\u5DF2\u88AB\u6401\u7F6E\u3002\u8BF7\u67E5\u770B\u8BC4\u8BBA\u4EE5\u4E86\u89E3\u4E0B\u4E00\u6B65\u3002',
        expensesOnHold: '\u6240\u6709\u8D39\u7528\u5DF2\u88AB\u6682\u505C\u3002\u8BF7\u67E5\u770B\u8BC4\u8BBA\u4EE5\u4E86\u89E3\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
        expenseDuplicate: '\u6B64\u8D39\u7528\u7684\u8BE6\u7EC6\u4FE1\u606F\u4E0E\u53E6\u4E00\u4E2A\u76F8\u4F3C\u3002\u8BF7\u67E5\u770B\u91CD\u590D\u9879\u4EE5\u7EE7\u7EED\u3002',
        someDuplicatesArePaid: '\u5176\u4E2D\u4E00\u4E9B\u91CD\u590D\u9879\u5DF2\u7ECF\u88AB\u6279\u51C6\u6216\u652F\u4ED8\u3002',
        reviewDuplicates: '\u67E5\u770B\u91CD\u590D\u9879',
        keepAll: '\u4FDD\u7559\u6240\u6709\u5185\u5BB9',
        confirmApprove: '\u786E\u8BA4\u6279\u51C6\u91D1\u989D',
        confirmApprovalAmount: '\u4EC5\u6279\u51C6\u5408\u89C4\u8D39\u7528\uFF0C\u6216\u6279\u51C6\u6574\u4E2A\u62A5\u544A\u3002',
        confirmApprovalAllHoldAmount: () => ({
            one: '\u6B64\u8D39\u7528\u5DF2\u6682\u505C\u3002\u60A8\u4ECD\u7136\u60F3\u8981\u6279\u51C6\u5417\uFF1F',
            other: '\u8FD9\u4E9B\u8D39\u7528\u5DF2\u88AB\u6401\u7F6E\u3002\u60A8\u4ECD\u7136\u60F3\u8981\u6279\u51C6\u5417\uFF1F',
        }),
        confirmPay: '\u786E\u8BA4\u4ED8\u6B3E\u91D1\u989D',
        confirmPayAmount: '\u652F\u4ED8\u672A\u51BB\u7ED3\u7684\u90E8\u5206\uFF0C\u6216\u652F\u4ED8\u6574\u4E2A\u62A5\u544A\u3002',
        confirmPayAllHoldAmount: () => ({
            one: '\u6B64\u8D39\u7528\u5DF2\u88AB\u6682\u505C\u3002\u60A8\u4ECD\u7136\u60F3\u8981\u652F\u4ED8\u5417\uFF1F',
            other: '\u8FD9\u4E9B\u8D39\u7528\u5DF2\u88AB\u6401\u7F6E\u3002\u60A8\u8FD8\u8981\u7EE7\u7EED\u652F\u4ED8\u5417\uFF1F',
        }),
        payOnly: '\u4EC5\u652F\u4ED8',
        approveOnly: '\u4EC5\u6279\u51C6',
        holdEducationalTitle: '\u6B64\u8BF7\u6C42\u5DF2\u5F00\u542F',
        holdEducationalText: '\u4FDD\u6301',
        whatIsHoldExplain:
            '\u201C\u4FDD\u7559\u201D\u5C31\u50CF\u662F\u5728\u8D39\u7528\u4E0A\u6309\u4E0B\u201C\u6682\u505C\u201D\uFF0C\u4EE5\u4FBF\u5728\u6279\u51C6\u6216\u4ED8\u6B3E\u524D\u8BE2\u95EE\u66F4\u591A\u8BE6\u7EC6\u4FE1\u606F\u3002',
        holdIsLeftBehind: '\u5F85\u5904\u7406\u7684\u8D39\u7528\u5728\u6279\u51C6\u6216\u652F\u4ED8\u540E\u8F6C\u79FB\u5230\u53E6\u4E00\u4EFD\u62A5\u544A\u3002',
        unholdWhenReady: '\u5BA1\u6279\u8005\u53EF\u4EE5\u5728\u51C6\u5907\u597D\u5BA1\u6279\u6216\u4ED8\u6B3E\u65F6\u89E3\u9664\u8D39\u7528\u7684\u4FDD\u7559\u72B6\u6001\u3002',
        changePolicyEducational: {
            title: '\u60A8\u5DF2\u79FB\u52A8\u6B64\u62A5\u544A\uFF01',
            description:
                '\u8BF7\u4ED4\u7EC6\u68C0\u67E5\u8FD9\u4E9B\u9879\u76EE\uFF0C\u56E0\u4E3A\u5728\u5C06\u62A5\u544A\u79FB\u52A8\u5230\u65B0\u5DE5\u4F5C\u533A\u65F6\uFF0C\u5B83\u4EEC\u5F80\u5F80\u4F1A\u53D1\u751F\u53D8\u5316\u3002',
            reCategorize: '<strong>\u91CD\u65B0\u5206\u7C7B\u4EFB\u4F55\u8D39\u7528</strong>\u4EE5\u7B26\u5408\u5DE5\u4F5C\u533A\u89C4\u5219\u3002',
            workflows: '\u6B64\u62A5\u544A\u73B0\u5728\u53EF\u80FD\u9700\u8981\u9075\u5FAA\u4E0D\u540C\u7684<strong>\u5BA1\u6279\u6D41\u7A0B\u3002</strong>',
        },
        changeWorkspace: '\u66F4\u6539\u5DE5\u4F5C\u533A',
        set: 'set',
        changed: '\u66F4\u6539',
        removed: 'removed',
        transactionPending: '\u4EA4\u6613\u5F85\u5904\u7406\u3002',
        chooseARate: '\u9009\u62E9\u6BCF\u82F1\u91CC\u6216\u516C\u91CC\u7684\u5DE5\u4F5C\u533A\u62A5\u9500\u7387',
        unapprove: '\u53D6\u6D88\u6279\u51C6',
        unapproveReport: '\u53D6\u6D88\u6279\u51C6\u62A5\u544A',
        headsUp: '\u6CE8\u610F\uFF01',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `\u6B64\u62A5\u544A\u5DF2\u5BFC\u51FA\u5230${accountingIntegration}\u3002\u66F4\u6539\u53EF\u80FD\u4F1A\u5BFC\u81F4\u6570\u636E\u4E0D\u4E00\u81F4\u3002\u60A8\u786E\u5B9A\u8981\u53D6\u6D88\u6279\u51C6\u6B64\u62A5\u544A\u5417\uFF1F`,
        reimbursable: '\u53EF\u62A5\u9500\u7684',
        nonReimbursable: '\u4E0D\u53EF\u62A5\u9500',
        bookingPending: '\u6B64\u9884\u8BA2\u6B63\u5728\u7B49\u5F85\u5904\u7406',
        bookingPendingDescription: '\u6B64\u9884\u8BA2\u5F85\u5904\u7406\uFF0C\u56E0\u4E3A\u5C1A\u672A\u4ED8\u6B3E\u3002',
        bookingArchived: '\u6B64\u9884\u8BA2\u5DF2\u5F52\u6863',
        bookingArchivedDescription:
            '\u6B64\u9884\u8BA2\u5DF2\u5F52\u6863\uFF0C\u56E0\u4E3A\u65C5\u884C\u65E5\u671F\u5DF2\u8FC7\u3002\u5982\u6709\u9700\u8981\uFF0C\u8BF7\u6DFB\u52A0\u6700\u7EC8\u91D1\u989D\u7684\u8D39\u7528\u3002',
        attendees: '\u4E0E\u4F1A\u8005',
        whoIsYourAccountant: '\u4F60\u7684\u4F1A\u8BA1\u662F\u8C01\uFF1F',
        paymentComplete: '\u4ED8\u6B3E\u5B8C\u6210',
        time: '\u65F6\u95F4',
        startDate: '\u5F00\u59CB\u65E5\u671F',
        endDate: '\u7ED3\u675F\u65E5\u671F',
        startTime: '\u5F00\u59CB\u65F6\u95F4',
        endTime: '\u7ED3\u675F\u65F6\u95F4',
        deleteSubrate: '\u5220\u9664\u5B50\u8D39\u7387',
        deleteSubrateConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5B50\u8D39\u7387\u5417\uFF1F',
        quantity: '\u6570\u91CF',
        subrateSelection: '\u9009\u62E9\u4E00\u4E2A\u5B50\u8D39\u7387\u5E76\u8F93\u5165\u6570\u91CF\u3002',
        qty: '\u6570\u91CF',
        firstDayText: () => ({
            one: `\u7B2C\u4E00\u5929\uFF1A1\u5C0F\u65F6`,
            other: (count: number) => `\u7B2C\u4E00\u5929\uFF1A${count.toFixed(2)} \u5C0F\u65F6`,
        }),
        lastDayText: () => ({
            one: `\u6700\u540E\u4E00\u5929\uFF1A1\u5C0F\u65F6`,
            other: (count: number) => `\u6700\u540E\u4E00\u5929\uFF1A${count.toFixed(2)} \u5C0F\u65F6`,
        }),
        tripLengthText: () => ({
            one: `\u884C\u7A0B\uFF1A1\u6574\u5929`,
            other: (count: number) => `\u884C\u7A0B\uFF1A${count}\u6574\u5929`,
        }),
        dates: '\u65E5\u671F',
        rates: '\u8D39\u7387',
        submitsTo: ({name}: SubmitsToParams) => `\u63D0\u4EA4\u7ED9${name}`,
        moveExpenses: () => ({one: '\u79FB\u52A8\u8D39\u7528', other: '\u79FB\u52A8\u8D39\u7528'}),
    },
    share: {
        shareToExpensify: '\u5206\u4EAB\u81F3Expensify',
        messageInputLabel: '\u6D88\u606F',
    },
    notificationPreferencesPage: {
        header: '\u901A\u77E5\u504F\u597D\u8BBE\u7F6E',
        label: '\u901A\u77E5\u6211\u6709\u5173\u65B0\u6D88\u606F',
        notificationPreferences: {
            always: '\u7ACB\u5373',
            daily: '\u6BCF\u65E5',
            mute: '\u9759\u97F3',
            hidden: '\u9690\u85CF',
        },
    },
    loginField: {
        numberHasNotBeenValidated: '\u53F7\u7801\u5C1A\u672A\u9A8C\u8BC1\u3002\u70B9\u51FB\u6309\u94AE\u901A\u8FC7\u77ED\u4FE1\u91CD\u65B0\u53D1\u9001\u9A8C\u8BC1\u94FE\u63A5\u3002',
        emailHasNotBeenValidated:
            '\u7535\u5B50\u90AE\u4EF6\u5C1A\u672A\u9A8C\u8BC1\u3002\u70B9\u51FB\u6309\u94AE\u901A\u8FC7\u77ED\u4FE1\u91CD\u65B0\u53D1\u9001\u9A8C\u8BC1\u94FE\u63A5\u3002',
    },
    avatarWithImagePicker: {
        uploadPhoto: '\u4E0A\u4F20\u7167\u7247',
        removePhoto: '\u5220\u9664\u7167\u7247',
        editImage: '\u7F16\u8F91\u7167\u7247',
        viewPhoto: '\u67E5\u770B\u7167\u7247',
        imageUploadFailed: '\u56FE\u7247\u4E0A\u4F20\u5931\u8D25',
        deleteWorkspaceError: '\u62B1\u6B49\uFF0C\u5220\u9664\u60A8\u7684\u5DE5\u4F5C\u533A\u5934\u50CF\u65F6\u51FA\u73B0\u4E86\u610F\u5916\u95EE\u9898\u3002',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `\u6240\u9009\u56FE\u50CF\u8D85\u8FC7\u4E86\u6700\u5927\u4E0A\u4F20\u5927\u5C0F ${maxUploadSizeInMB} MB\u3002`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `\u8BF7\u4E0A\u4F20\u4E00\u5F20\u5927\u4E8E${minHeightInPx}x${minWidthInPx}\u50CF\u7D20\u4E14\u5C0F\u4E8E${maxHeightInPx}x${maxWidthInPx}\u50CF\u7D20\u7684\u56FE\u7247\u3002`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) =>
            `\u4E2A\u4EBA\u8D44\u6599\u56FE\u7247\u5FC5\u987B\u662F\u4EE5\u4E0B\u7C7B\u578B\u4E4B\u4E00\uFF1A${allowedExtensions.join(', ')}\u3002`,
    },
    modal: {
        backdropLabel: '\u6A21\u6001\u80CC\u666F',
    },
    profilePage: {
        profile: '\u4E2A\u4EBA\u8D44\u6599',
        preferredPronouns: '\u504F\u597D\u4EE3\u8BCD',
        selectYourPronouns: '\u9009\u62E9\u60A8\u7684\u4EE3\u8BCD',
        selfSelectYourPronoun: '\u81EA\u884C\u9009\u62E9\u60A8\u7684\u4EE3\u8BCD',
        emailAddress: '\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
        setMyTimezoneAutomatically: '\u81EA\u52A8\u8BBE\u7F6E\u6211\u7684\u65F6\u533A',
        timezone: '\u65F6\u533A',
        invalidFileMessage: '\u65E0\u6548\u6587\u4EF6\u3002\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u56FE\u50CF\u3002',
        avatarUploadFailureMessage: '\u4E0A\u4F20\u5934\u50CF\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
        online: '\u5728\u7EBF',
        offline: '\u79BB\u7EBF',
        syncing: '\u540C\u6B65\u4E2D',
        profileAvatar: '\u4E2A\u4EBA\u5934\u50CF',
        publicSection: {
            title: '\u516C\u5F00',
            subtitle: '\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u663E\u793A\u5728\u60A8\u7684\u516C\u5F00\u8D44\u6599\u4E0A\u3002\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u770B\u5230\u3002',
        },
        privateSection: {
            title: '\u79C1\u4EBA',
            subtitle:
                '\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u7528\u4E8E\u65C5\u884C\u548C\u652F\u4ED8\u3002\u5B83\u4EEC\u6C38\u8FDC\u4E0D\u4F1A\u663E\u793A\u5728\u60A8\u7684\u516C\u5F00\u8D44\u6599\u4E0A\u3002',
        },
    },
    securityPage: {
        title: '\u5B89\u5168\u9009\u9879',
        subtitle: '\u542F\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u4EE5\u786E\u4FDD\u60A8\u7684\u8D26\u6237\u5B89\u5168\u3002',
        goToSecurity: '\u8FD4\u56DE\u5B89\u5168\u9875\u9762',
    },
    shareCodePage: {
        title: '\u60A8\u7684\u4EE3\u7801',
        subtitle: '\u901A\u8FC7\u5206\u4EAB\u60A8\u7684\u4E2A\u4EBA\u4E8C\u7EF4\u7801\u6216\u63A8\u8350\u94FE\u63A5\u9080\u8BF7\u6210\u5458\u52A0\u5165Expensify\u3002',
    },
    pronounsPage: {
        pronouns: '\u4EE3\u8BCD',
        isShownOnProfile: '\u60A8\u7684\u4EE3\u8BCD\u663E\u793A\u5728\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u4E0A\u3002',
        placeholderText: '\u641C\u7D22\u4EE5\u67E5\u770B\u9009\u9879',
    },
    contacts: {
        contactMethod: '\u8054\u7CFB\u65B9\u5F0F',
        contactMethods: '\u8054\u7CFB\u65B9\u5F0F',
        featureRequiresValidate: '\u6B64\u529F\u80FD\u9700\u8981\u60A8\u9A8C\u8BC1\u60A8\u7684\u8D26\u6237\u3002',
        validateAccount: '\u9A8C\u8BC1\u60A8\u7684\u8D26\u6237',
        helpTextBeforeEmail: '\u6DFB\u52A0\u66F4\u591A\u65B9\u5F0F\u8BA9\u4EBA\u4EEC\u627E\u5230\u4F60\uFF0C\u5E76\u8F6C\u53D1\u6536\u636E\u5230',
        helpTextAfterEmail: '\u4ECE\u591A\u4E2A\u7535\u5B50\u90AE\u4EF6\u5730\u5740\u3002',
        pleaseVerify: '\u8BF7\u9A8C\u8BC1\u6B64\u8054\u7CFB\u65B9\u5F0F',
        getInTouch: '\u6BCF\u5F53\u6211\u4EEC\u9700\u8981\u8054\u7CFB\u60A8\u65F6\uFF0C\u6211\u4EEC\u5C06\u4F7F\u7528\u6B64\u8054\u7CFB\u65B9\u5F0F\u3002',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u5230${contactMethod}\u7684\u9A8C\u8BC1\u7801\u3002\u9A8C\u8BC1\u7801\u5C06\u5728\u4E00\u5206\u949F\u5185\u5230\u8FBE\u3002`,
        setAsDefault: '\u8BBE\u4E3A\u9ED8\u8BA4',
        yourDefaultContactMethod:
            '\u8FD9\u662F\u60A8\u5F53\u524D\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u3002\u5728\u5220\u9664\u5B83\u4E4B\u524D\uFF0C\u60A8\u9700\u8981\u9009\u62E9\u53E6\u4E00\u79CD\u8054\u7CFB\u65B9\u5F0F\u5E76\u70B9\u51FB\u201C\u8BBE\u4E3A\u9ED8\u8BA4\u201D\u3002',
        removeContactMethod: '\u79FB\u9664\u8054\u7CFB\u65B9\u5F0F',
        removeAreYouSure: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u8054\u7CFB\u65B9\u5F0F\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002',
        failedNewContact: '\u65E0\u6CD5\u6DFB\u52A0\u6B64\u8054\u7CFB\u65B9\u6CD5\u3002',
        genericFailureMessages: {
            requestContactMethodValidateCode: '\u65E0\u6CD5\u53D1\u9001\u65B0\u7684\u9B54\u6CD5\u7801\u3002\u8BF7\u7A0D\u7B49\u7247\u523B\u518D\u8BD5\u3002',
            validateSecondaryLogin: '\u9B54\u6CD5\u4EE3\u7801\u4E0D\u6B63\u786E\u6216\u65E0\u6548\u3002\u8BF7\u91CD\u8BD5\u6216\u8BF7\u6C42\u65B0\u4EE3\u7801\u3002',
            deleteContactMethod: '\u5220\u9664\u8054\u7CFB\u65B9\u5F0F\u5931\u8D25\u3002\u8BF7\u8054\u7CFBConcierge\u5BFB\u6C42\u5E2E\u52A9\u3002',
            setDefaultContactMethod: '\u65E0\u6CD5\u8BBE\u7F6E\u65B0\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u3002\u8BF7\u8054\u7CFBConcierge\u5BFB\u6C42\u5E2E\u52A9\u3002',
            addContactMethod: '\u65E0\u6CD5\u6DFB\u52A0\u6B64\u8054\u7CFB\u65B9\u5F0F\u3002\u8BF7\u8054\u7CFBConcierge\u5BFB\u6C42\u5E2E\u52A9\u3002',
            enteredMethodIsAlreadySubmitted: '\u6B64\u8054\u7CFB\u65B9\u5F0F\u5DF2\u5B58\u5728',
            passwordRequired: '\u9700\u8981\u5BC6\u7801\u3002',
            contactMethodRequired: '\u8054\u7CFB\u65B9\u5F0F\u662F\u5FC5\u9700\u7684',
            invalidContactMethod: '\u65E0\u6548\u7684\u8054\u7CFB\u65B9\u5F0F',
        },
        newContactMethod: '\u65B0\u8054\u7CFB\u65B9\u5F0F',
        goBackContactMethods: '\u8FD4\u56DE\u5230\u8054\u7CFB\u65B9\u5F0F',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '\u4ED6/\u4ED6/\u4ED6\u7684',
        heHimHisTheyThemTheirs: '\u4ED6 / \u4ED6 / \u4ED6\u7684 / \u4ED6\u4EEC / \u4ED6\u4EEC / \u4ED6\u4EEC\u7684',
        sheHerHers: '\u5979/\u5979\u7684',
        sheHerHersTheyThemTheirs: '\u5979 / \u5979\u7684 / \u5979\u7684 / \u4ED6\u4EEC / \u4ED6\u4EEC\u7684 / \u4ED6\u4EEC\u7684',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: '\u6BCF / \u6BCF\u4EBA',
        theyThemTheirs: '\u4ED6\u4EEC / \u4ED6\u4EEC / \u4ED6\u4EEC\u7684',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '\u53EB\u6211\u7684\u540D\u5B57',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: '\u663E\u793A\u540D\u79F0',
        isShownOnProfile: '\u60A8\u7684\u663E\u793A\u540D\u79F0\u4F1A\u663E\u793A\u5728\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u4E0A\u3002',
    },
    timezonePage: {
        timezone: '\u65F6\u533A',
        isShownOnProfile: '\u60A8\u7684\u65F6\u533A\u663E\u793A\u5728\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u4E0A\u3002',
        getLocationAutomatically: '\u81EA\u52A8\u786E\u5B9A\u60A8\u7684\u4F4D\u7F6E',
    },
    updateRequiredView: {
        updateRequired: '\u9700\u8981\u66F4\u65B0',
        pleaseInstall: '\u8BF7\u66F4\u65B0\u5230\u6700\u65B0\u7248\u672C\u7684 New Expensify',
        pleaseInstallExpensifyClassic: '\u8BF7\u5B89\u88C5\u6700\u65B0\u7248\u672C\u7684Expensify',
        toGetLatestChanges:
            '\u5BF9\u4E8E\u79FB\u52A8\u8BBE\u5907\u6216\u684C\u9762\u8BBE\u5907\uFF0C\u4E0B\u8F7D\u5E76\u5B89\u88C5\u6700\u65B0\u7248\u672C\u3002\u5BF9\u4E8E\u7F51\u9875\uFF0C\u5237\u65B0\u60A8\u7684\u6D4F\u89C8\u5668\u3002',
        newAppNotAvailable: '\u65B0\u7248Expensify\u5E94\u7528\u7A0B\u5E8F\u4E0D\u518D\u53EF\u7528\u3002',
    },
    initialSettingsPage: {
        about: '\u5173\u4E8E',
        aboutPage: {
            description:
                '\u5168\u65B0\u7684 Expensify \u5E94\u7528\u7531\u6765\u81EA\u4E16\u754C\u5404\u5730\u7684\u5F00\u6E90\u5F00\u53D1\u8005\u793E\u533A\u6784\u5EFA\u3002\u5E2E\u52A9\u6211\u4EEC\u6784\u5EFA Expensify \u7684\u672A\u6765\u3002',
            appDownloadLinks: '\u5E94\u7528\u4E0B\u8F7D\u94FE\u63A5',
            viewKeyboardShortcuts: '\u67E5\u770B\u952E\u76D8\u5FEB\u6377\u952E',
            viewTheCode: '\u67E5\u770B\u4EE3\u7801',
            viewOpenJobs: '\u67E5\u770B\u5F00\u653E\u804C\u4F4D',
            reportABug: '\u62A5\u544A\u4E00\u4E2A\u9519\u8BEF',
            troubleshoot: '\u6545\u969C\u6392\u9664',
        },
        appDownloadLinks: {
            android: {
                label: 'Android',
            },
            ios: {
                label: 'iOS',
            },
            desktop: {
                label: 'macOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '\u6E05\u9664\u7F13\u5B58\u5E76\u91CD\u542F',
            viewConsole: '\u67E5\u770B\u8C03\u8BD5\u63A7\u5236\u53F0',
            debugConsole: '\u8C03\u8BD5\u63A7\u5236\u53F0',
            description:
                '\u4F7F\u7528\u4EE5\u4E0B\u5DE5\u5177\u5E2E\u52A9\u6392\u67E5Expensify\u4F53\u9A8C\u4E2D\u7684\u95EE\u9898\u3002\u5982\u679C\u60A8\u9047\u5230\u4EFB\u4F55\u95EE\u9898\uFF0C\u8BF7',
            submitBug: '\u63D0\u4EA4\u9519\u8BEF\u62A5\u544A',
            confirmResetDescription:
                '\u6240\u6709\u672A\u53D1\u9001\u7684\u8349\u7A3F\u6D88\u606F\u5C06\u4F1A\u4E22\u5931\uFF0C\u4F46\u60A8\u7684\u5176\u4ED6\u6570\u636E\u662F\u5B89\u5168\u7684\u3002',
            resetAndRefresh: '\u91CD\u7F6E\u5E76\u5237\u65B0',
            clientSideLogging: '\u5BA2\u6237\u7AEF\u65E5\u5FD7\u8BB0\u5F55',
            noLogsToShare: '\u6CA1\u6709\u65E5\u5FD7\u53EF\u5206\u4EAB',
            useProfiling: '\u4F7F\u7528\u5206\u6790\u5DE5\u5177',
            profileTrace: '\u4E2A\u4EBA\u8D44\u6599\u8FFD\u8E2A',
            releaseOptions: '\u53D1\u5E03\u9009\u9879',
            testingPreferences: '\u6D4B\u8BD5\u504F\u597D\u8BBE\u7F6E',
            useStagingServer: '\u4F7F\u7528\u6682\u5B58\u670D\u52A1\u5668',
            forceOffline: '\u5F3A\u5236\u79BB\u7EBF',
            simulatePoorConnection: '\u6A21\u62DF\u7F51\u7EDC\u8FDE\u63A5\u4E0D\u4F73',
            simulateFailingNetworkRequests: '\u6A21\u62DF\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25',
            authenticationStatus: '\u8EAB\u4EFD\u9A8C\u8BC1\u72B6\u6001',
            deviceCredentials: '\u8BBE\u5907\u51ED\u8BC1',
            invalidate: '\u4F5C\u5E9F',
            destroy: 'Destroy',
            maskExportOnyxStateData: '\u5728\u5BFC\u51FA Onyx \u72B6\u6001\u65F6\u5C4F\u853D\u654F\u611F\u6210\u5458\u6570\u636E',
            exportOnyxState: '\u5BFC\u51FA Onyx \u72B6\u6001',
            importOnyxState: '\u5BFC\u5165 Onyx \u72B6\u6001',
            testCrash: '\u6D4B\u8BD5\u5D29\u6E83',
            resetToOriginalState: '\u91CD\u7F6E\u4E3A\u539F\u59CB\u72B6\u6001',
            usingImportedState: '\u60A8\u6B63\u5728\u4F7F\u7528\u5BFC\u5165\u7684\u72B6\u6001\u3002\u6309\u6B64\u6E05\u9664\u3002',
            debugMode: '\u8C03\u8BD5\u6A21\u5F0F',
            invalidFile: '\u65E0\u6548\u6587\u4EF6',
            invalidFileDescription: '\u60A8\u5C1D\u8BD5\u5BFC\u5165\u7684\u6587\u4EF6\u65E0\u6548\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            invalidateWithDelay: '\u5EF6\u8FDF\u5931\u6548',
        },
        debugConsole: {
            saveLog: '\u4FDD\u5B58\u65E5\u5FD7',
            shareLog: '\u5171\u4EAB\u65E5\u5FD7',
            enterCommand: '\u8F93\u5165\u547D\u4EE4',
            execute: '\u6267\u884C',
            noLogsAvailable: '\u6CA1\u6709\u53EF\u7528\u65E5\u5FD7',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `\u65E5\u5FD7\u5927\u5C0F\u8D85\u8FC7 ${size} MB\u3002\u8BF7\u4F7F\u7528\u201C\u4FDD\u5B58\u65E5\u5FD7\u201D\u6765\u4E0B\u8F7D\u65E5\u5FD7\u6587\u4EF6\u3002`,
            logs: '\u65E5\u5FD7',
            viewConsole: '\u67E5\u770B\u63A7\u5236\u53F0',
        },
        security: '\u5B89\u5168\u6027',
        signOut: '\u9000\u51FA',
        restoreStashed: '\u6062\u590D\u5B58\u50A8\u7684\u767B\u5F55\u4FE1\u606F',
        signOutConfirmationText: '\u5982\u679C\u60A8\u9000\u51FA\u767B\u5F55\uFF0C\u60A8\u5C06\u4E22\u5931\u4EFB\u4F55\u79BB\u7EBF\u66F4\u6539\u3002',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: '\u9605\u8BFB',
            phrase2: '\u670D\u52A1\u6761\u6B3E',
            phrase3: '\u548C',
            phrase4: '\u9690\u79C1',
        },
        help: '\u5E2E\u52A9',
        accountSettings: '\u8D26\u6237\u8BBE\u7F6E',
        account: '\u8D26\u6237',
        general: '\u5E38\u89C4',
    },
    closeAccountPage: {
        closeAccount: '\u5173\u95ED\u8D26\u6237',
        reasonForLeavingPrompt:
            '\u6211\u4EEC\u4E0D\u60F3\u770B\u5230\u60A8\u79BB\u5F00\uFF01\u60A8\u80FD\u5426\u544A\u8BC9\u6211\u4EEC\u539F\u56E0\uFF0C\u4EE5\u4FBF\u6211\u4EEC\u6539\u8FDB\uFF1F',
        enterMessageHere: '\u5728\u6B64\u8F93\u5165\u6D88\u606F',
        closeAccountWarning: '\u5173\u95ED\u60A8\u7684\u8D26\u6237\u540E\u65E0\u6CD5\u64A4\u9500\u3002',
        closeAccountPermanentlyDeleteData:
            '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u60A8\u7684\u8D26\u6237\u5417\uFF1F\u8FD9\u5C06\u6C38\u4E45\u5220\u9664\u6240\u6709\u672A\u5904\u7406\u7684\u8D39\u7528\u3002',
        enterDefaultContactToConfirm:
            '\u8BF7\u8F93\u5165\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u4EE5\u786E\u8BA4\u60A8\u5E0C\u671B\u5173\u95ED\u8D26\u6237\u3002\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u662F\uFF1A',
        enterDefaultContact: '\u8F93\u5165\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F',
        defaultContact: '\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\uFF1A',
        enterYourDefaultContactMethod: '\u8BF7\u8F93\u5165\u60A8\u7684\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u4EE5\u5173\u95ED\u60A8\u7684\u8D26\u6237\u3002',
    },
    mergeAccountsPage: {
        mergeAccount: '\u5408\u5E76\u8D26\u6237',
        accountDetails: {
            accountToMergeInto: '\u8F93\u5165\u60A8\u60F3\u8981\u5408\u5E76\u7684\u8D26\u6237',
            notReversibleConsent: '\u6211\u660E\u767D\u8FD9\u662F\u4E0D\u53EF\u9006\u7684\u3002',
        },
        accountValidate: {
            confirmMerge: '\u60A8\u786E\u5B9A\u8981\u5408\u5E76\u8D26\u6237\u5417\uFF1F',
            lossOfUnsubmittedData: `\u5408\u5E76\u60A8\u7684\u8D26\u6237\u662F\u4E0D\u53EF\u9006\u7684\uFF0C\u5E76\u4E14\u5C06\u5BFC\u81F4\u4EFB\u4F55\u672A\u63D0\u4EA4\u7684\u8D39\u7528\u4E22\u5931`,
            enterMagicCode: `\u8981\u7EE7\u7EED\uFF0C\u8BF7\u8F93\u5165\u53D1\u9001\u5230\u7684\u9A8C\u8BC1\u7801`,
            errors: {
                incorrectMagicCode: '\u9B54\u6CD5\u4EE3\u7801\u4E0D\u6B63\u786E\u6216\u65E0\u6548\u3002\u8BF7\u91CD\u8BD5\u6216\u8BF7\u6C42\u65B0\u4EE3\u7801\u3002',
                fallback: '\u51FA\u4E86\u70B9\u95EE\u9898\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            },
        },
        mergeSuccess: {
            accountsMerged: '\u8D26\u6237\u5DF2\u5408\u5E76\uFF01',
            successfullyMergedAllData: {
                beforeFirstEmail: `\u60A8\u5DF2\u6210\u529F\u5408\u5E76\u6240\u6709\u6570\u636E\u6765\u81EA`,
                beforeSecondEmail: `into`,
                afterSecondEmail: `\u4ECA\u540E\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528\u4EFB\u4E00\u767B\u5F55\u65B9\u5F0F\u8BBF\u95EE\u6B64\u8D26\u6237\u3002`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '\u6211\u4EEC\u6B63\u5728\u5904\u7406\u6B64\u4E8B',
            limitedSupport:
                '\u6211\u4EEC\u5C1A\u672A\u652F\u6301\u5728 New Expensify \u4E0A\u5408\u5E76\u8D26\u6237\u3002\u8BF7\u5728 Expensify Classic \u4E0A\u6267\u884C\u6B64\u64CD\u4F5C\u3002',
            reachOutForHelp: {
                beforeLink: '\u968F\u610F',
                linkText: '\u8054\u7CFBConcierge',
                afterLink: '\u5982\u679C\u60A8\u6709\u4EFB\u4F55\u95EE\u9898\uFF01',
            },
            goToExpensifyClassic: '\u524D\u5F80 Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: '\u65E0\u6CD5\u5408\u5E76',
            beforeDomain: '\u56E0\u4E3A\u5B83\u7531...\u63A7\u5236',
            afterDomain: '. \u8BF7',
            linkText: '\u8054\u7CFBConcierge',
            afterLink: '\u4EE5\u83B7\u5F97\u5E2E\u52A9\u3002',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: '\u65E0\u6CD5\u5408\u5E76',
            afterEmail:
                '\u5230\u5176\u4ED6\u8D26\u6237\uFF0C\u56E0\u4E3A\u60A8\u7684\u57DF\u7BA1\u7406\u5458\u5DF2\u5C06\u5176\u8BBE\u7F6E\u4E3A\u60A8\u7684\u4E3B\u8981\u767B\u5F55\u65B9\u5F0F\u3002\u8BF7\u5C06\u5176\u4ED6\u8D26\u6237\u5408\u5E76\u5230\u6B64\u8D26\u6237\u4E2D\u3002',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: '\u60A8\u65E0\u6CD5\u5408\u5E76\u8D26\u6237\uFF0C\u56E0\u4E3A',
                beforeSecondEmail: '\u5DF2\u542F\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1 (2FA)\u3002\u8BF7\u4E3A',
                afterSecondEmail: '\u5E76\u91CD\u8BD5\u3002',
            },
            learnMore: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u5408\u5E76\u8D26\u6237\u7684\u4FE1\u606F\u3002',
        },
        mergeFailureAccountLocked: {
            beforeEmail: '\u65E0\u6CD5\u5408\u5E76',
            afterEmail: '\u56E0\u4E3A\u5B83\u88AB\u9501\u5B9A\u4E86\u3002\u8BF7',
            linkText: '\u8054\u7CFBConcierge',
            afterLink: `\u5982\u9700\u5E2E\u52A9\u3002`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: '\u60A8\u65E0\u6CD5\u5408\u5E76\u8D26\u6237\uFF0C\u56E0\u4E3A',
                afterEmail: '\u6CA1\u6709Expensify\u8D26\u6237\u3002',
            },
            addContactMethod: {
                beforeLink: '\u8BF7',
                linkText: '\u5C06\u5176\u6DFB\u52A0\u4E3A\u8054\u7CFB\u65B9\u6CD5',
                afterLink: '\u53CD\u800C\u3002',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: '\u65E0\u6CD5\u5408\u5E76',
            afterEmail: '\u5230\u5176\u4ED6\u8D26\u6237\u3002\u8BF7\u5C06\u5176\u4ED6\u8D26\u6237\u5408\u5E76\u5230\u6B64\u8D26\u6237\u4E2D\u3002',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: '\u65E0\u6CD5\u5408\u5E76',
            afterEmail:
                '\u5230\u5176\u4ED6\u8D26\u6237\uFF0C\u56E0\u4E3A\u5B83\u662F\u4E00\u4E2A\u5DF2\u5F00\u7968\u8D26\u6237\u7684\u8D26\u5355\u6240\u6709\u8005\u3002\u8BF7\u5C06\u5176\u4ED6\u8D26\u6237\u5408\u5E76\u5230\u8BE5\u8D26\u6237\u4E2D\u3002',
        },
        mergeFailureTooManyAttempts: {
            heading: '\u7A0D\u540E\u518D\u8BD5',
            description: '\u5C1D\u8BD5\u5408\u5E76\u8D26\u6237\u7684\u6B21\u6570\u8FC7\u591A\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        },
        mergeFailureUnvalidatedAccount: {
            description:
                '\u60A8\u65E0\u6CD5\u5408\u5E76\u5230\u5176\u4ED6\u8D26\u6237\uFF0C\u56E0\u4E3A\u5B83\u5C1A\u672A\u9A8C\u8BC1\u3002\u8BF7\u9A8C\u8BC1\u8BE5\u8D26\u6237\u540E\u91CD\u8BD5\u3002',
        },
        mergeFailureSelfMerge: {
            description: '\u60A8\u4E0D\u80FD\u5C06\u4E00\u4E2A\u8D26\u6237\u5408\u5E76\u5230\u5176\u81EA\u8EAB\u3002',
        },
        mergeFailureGenericHeading: '\u65E0\u6CD5\u5408\u5E76\u8D26\u6237',
    },
    lockAccountPage: {
        lockAccount: '\u9501\u5B9A\u8D26\u6237',
        unlockAccount: '\u89E3\u9501\u8D26\u6237',
        compromisedDescription:
            '\u5982\u679C\u60A8\u6000\u7591\u60A8\u7684Expensify\u8D26\u6237\u88AB\u76D7\u7528\uFF0C\u60A8\u53EF\u4EE5\u9501\u5B9A\u5B83\u4EE5\u9632\u6B62\u65B0\u7684Expensify\u5361\u4EA4\u6613\u5E76\u963B\u6B62\u4E0D\u5FC5\u8981\u7684\u8D26\u6237\u66F4\u6539\u3002',
        domainAdminsDescriptionPartOne: '\u5BF9\u4E8E\u57DF\u7BA1\u7406\u5458\uFF0C',
        domainAdminsDescriptionPartTwo: '\u6B64\u64CD\u4F5C\u5C06\u6682\u505C\u6240\u6709 Expensify Card \u6D3B\u52A8\u548C\u7BA1\u7406\u5458\u64CD\u4F5C\u3002',
        domainAdminsDescriptionPartThree: '\u5728\u60A8\u7684\u57DF\u4E2D\u3002',
        warning: `\u4E00\u65E6\u60A8\u7684\u8D26\u6237\u88AB\u9501\u5B9A\uFF0C\u6211\u4EEC\u7684\u56E2\u961F\u5C06\u8FDB\u884C\u8C03\u67E5\u5E76\u79FB\u9664\u4EFB\u4F55\u672A\u7ECF\u6388\u6743\u7684\u8BBF\u95EE\u3002\u8981\u91CD\u65B0\u83B7\u5F97\u8BBF\u95EE\u6743\u9650\uFF0C\u60A8\u9700\u8981\u4E0EConcierge\u5408\u4F5C\u4EE5\u786E\u4FDD\u60A8\u7684\u8D26\u6237\u5B89\u5168\u3002`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: '\u65E0\u6CD5\u9501\u5B9A\u8D26\u6237',
        failedToLockAccountDescription: `\u6211\u4EEC\u65E0\u6CD5\u9501\u5B9A\u60A8\u7684\u8D26\u6237\u3002\u8BF7\u4E0EConcierge\u804A\u5929\u4EE5\u89E3\u51B3\u6B64\u95EE\u9898\u3002`,
        chatWithConcierge: '\u4E0EConcierge\u804A\u5929',
    },
    unlockAccountPage: {
        accountLocked: '\u8D26\u6237\u5DF2\u9501\u5B9A',
        yourAccountIsLocked: '\u60A8\u7684\u8D26\u6237\u5DF2\u88AB\u9501\u5B9A',
        chatToConciergeToUnlock: '\u4E0EConcierge\u804A\u5929\u4EE5\u89E3\u51B3\u5B89\u5168\u95EE\u9898\u5E76\u89E3\u9501\u60A8\u7684\u8D26\u6237\u3002',
        chatWithConcierge: '\u4E0EConcierge\u804A\u5929',
    },
    passwordPage: {
        changePassword: '\u66F4\u6539\u5BC6\u7801',
        changingYourPasswordPrompt: '\u66F4\u6539\u5BC6\u7801\u5C06\u540C\u65F6\u66F4\u65B0\u60A8\u5728 Expensify.com \u548C New Expensify \u8D26\u6237\u7684\u5BC6\u7801\u3002',
        currentPassword: '\u5F53\u524D\u5BC6\u7801',
        newPassword: '\u65B0\u5BC6\u7801',
        newPasswordPrompt:
            '\u60A8\u7684\u65B0\u5BC6\u7801\u5FC5\u987B\u4E0E\u65E7\u5BC6\u7801\u4E0D\u540C\uFF0C\u5E76\u4E14\u81F3\u5C11\u5305\u542B8\u4E2A\u5B57\u7B26\u30011\u4E2A\u5927\u5199\u5B57\u6BCD\u30011\u4E2A\u5C0F\u5199\u5B57\u6BCD\u548C1\u4E2A\u6570\u5B57\u3002',
    },
    twoFactorAuth: {
        headerTitle: '\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1',
        twoFactorAuthEnabled: '\u5DF2\u542F\u7528\u53CC\u56E0\u7D20\u8BA4\u8BC1',
        whatIsTwoFactorAuth:
            '\u53CC\u56E0\u7D20\u8BA4\u8BC1 (2FA) \u6709\u52A9\u4E8E\u4FDD\u62A4\u60A8\u7684\u8D26\u6237\u5B89\u5168\u3002\u767B\u5F55\u65F6\uFF0C\u60A8\u9700\u8981\u8F93\u5165\u7531\u60A8\u9996\u9009\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5E94\u7528\u7A0B\u5E8F\u751F\u6210\u7684\u4EE3\u7801\u3002',
        disableTwoFactorAuth: '\u7981\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1',
        explainProcessToRemove:
            '\u4E3A\u4E86\u7981\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1 (2FA)\uFF0C\u8BF7\u8F93\u5165\u6765\u81EA\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5E94\u7528\u7A0B\u5E8F\u7684\u6709\u6548\u4EE3\u7801\u3002',
        disabled: '\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u73B0\u5DF2\u7981\u7528',
        noAuthenticatorApp: '\u60A8\u5C06\u4E0D\u518D\u9700\u8981\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528\u7A0B\u5E8F\u6765\u767B\u5F55Expensify\u3002',
        stepCodes: '\u6062\u590D\u4EE3\u7801',
        keepCodesSafe: '\u8BF7\u59A5\u5584\u4FDD\u7BA1\u8FD9\u4E9B\u6062\u590D\u4EE3\u7801\uFF01',
        codesLoseAccess:
            '\u5982\u679C\u60A8\u5931\u53BB\u4E86\u9A8C\u8BC1\u5668\u5E94\u7528\u7684\u8BBF\u95EE\u6743\u9650\u5E76\u4E14\u6CA1\u6709\u8FD9\u4E9B\u4EE3\u7801\uFF0C\u60A8\u5C06\u65E0\u6CD5\u8BBF\u95EE\u60A8\u7684\u8D26\u6237\u3002\n\n\u6CE8\u610F\uFF1A\u8BBE\u7F6E\u53CC\u56E0\u7D20\u8BA4\u8BC1\u5C06\u4F1A\u4F7F\u60A8\u9000\u51FA\u6240\u6709\u5176\u4ED6\u6D3B\u52A8\u4F1A\u8BDD\u3002',
        errorStepCodes: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u590D\u5236\u6216\u4E0B\u8F7D\u4EE3\u7801\u3002',
        stepVerify: '\u9A8C\u8BC1',
        scanCode: '\u4F7F\u7528\u60A8\u7684\u8BBE\u5907\u626B\u63CF\u4E8C\u7EF4\u7801',
        authenticatorApp: '\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528\u7A0B\u5E8F',
        addKey: '\u6216\u8005\u5C06\u6B64\u5BC6\u94A5\u6DFB\u52A0\u5230\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528\u7A0B\u5E8F\u4E2D\uFF1A',
        enterCode: '\u7136\u540E\u8F93\u5165\u4ECE\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u5E94\u7528\u751F\u6210\u7684\u516D\u4F4D\u6570\u4EE3\u7801\u3002',
        stepSuccess: '\u5B8C\u6210',
        enabled: '\u5DF2\u542F\u7528\u53CC\u56E0\u7D20\u8BA4\u8BC1',
        congrats: '\u606D\u559C\uFF01\u73B0\u5728\u60A8\u62E5\u6709\u4E86\u989D\u5916\u7684\u5B89\u5168\u4FDD\u969C\u3002',
        copy: '\u590D\u5236',
        disable: '\u7981\u7528',
        enableTwoFactorAuth: '\u542F\u7528\u53CC\u56E0\u7D20\u8BA4\u8BC1',
        pleaseEnableTwoFactorAuth: '\u8BF7\u542F\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u3002',
        twoFactorAuthIsRequiredDescription: '\u51FA\u4E8E\u5B89\u5168\u76EE\u7684\uFF0CXero \u8981\u6C42\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u4EE5\u8FDE\u63A5\u96C6\u6210\u3002',
        twoFactorAuthIsRequiredForAdminsHeader: '\u9700\u8981\u53CC\u56E0\u7D20\u8BA4\u8BC1',
        twoFactorAuthIsRequiredForAdminsTitle: '\u8BF7\u542F\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1',
        twoFactorAuthIsRequiredForAdminsDescription:
            '\u60A8\u7684 Xero \u4F1A\u8BA1\u8FDE\u63A5\u9700\u8981\u4F7F\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u3002\u8981\u7EE7\u7EED\u4F7F\u7528 Expensify\uFF0C\u8BF7\u542F\u7528\u5B83\u3002',
        twoFactorAuthCannotDisable: '\u65E0\u6CD5\u7981\u75282FA',
        twoFactorAuthRequired: '\u60A8\u7684 Xero \u8FDE\u63A5\u9700\u8981\u53CC\u56E0\u7D20\u8BA4\u8BC1 (2FA)\uFF0C\u4E14\u65E0\u6CD5\u7981\u7528\u3002',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '\u8BF7\u8F93\u5165\u60A8\u7684\u6062\u590D\u4EE3\u7801',
            incorrectRecoveryCode: '\u6062\u590D\u7801\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
        },
        useRecoveryCode: '\u4F7F\u7528\u6062\u590D\u4EE3\u7801',
        recoveryCode: '\u6062\u590D\u4EE3\u7801',
        use2fa: '\u4F7F\u7528\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u4EE3\u7801',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '\u8BF7\u8F93\u5165\u60A8\u7684\u53CC\u56E0\u7D20\u8BA4\u8BC1\u4EE3\u7801',
            incorrect2fa: '\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801\u4E0D\u6B63\u786E\u3002\u8BF7\u91CD\u8BD5\u3002',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '\u5BC6\u7801\u5DF2\u66F4\u65B0\uFF01',
        allSet: '\u4E00\u5207\u5C31\u7EEA\u3002\u8BF7\u59A5\u5584\u4FDD\u7BA1\u60A8\u7684\u65B0\u5BC6\u7801\u3002',
    },
    privateNotes: {
        title: '\u79C1\u4EBA\u5907\u6CE8',
        personalNoteMessage:
            '\u5728\u6B64\u804A\u5929\u4E2D\u4FDD\u7559\u7B14\u8BB0\u3002\u60A8\u662F\u552F\u4E00\u53EF\u4EE5\u6DFB\u52A0\u3001\u7F16\u8F91\u6216\u67E5\u770B\u8FD9\u4E9B\u7B14\u8BB0\u7684\u4EBA\u3002',
        sharedNoteMessage:
            '\u5728\u6B64\u5904\u8BB0\u5F55\u6709\u5173\u6B64\u804A\u5929\u7684\u7B14\u8BB0\u3002Expensify\u5458\u5DE5\u548C\u5176\u4ED6team.expensify.com\u57DF\u4E0A\u7684\u6210\u5458\u53EF\u4EE5\u67E5\u770B\u8FD9\u4E9B\u7B14\u8BB0\u3002',
        composerLabel: '\u5907\u6CE8',
        myNote: '\u6211\u7684\u5907\u6CE8',
        error: {
            genericFailureMessage: '\u79C1\u4EBA\u5907\u6CE8\u65E0\u6CD5\u4FDD\u5B58',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5B89\u5168\u4EE3\u7801',
        },
        securityCode: '\u5B89\u5168\u4EE3\u7801',
        changeBillingCurrency: '\u66F4\u6539\u8BA1\u8D39\u8D27\u5E01',
        changePaymentCurrency: '\u66F4\u6539\u652F\u4ED8\u8D27\u5E01',
        paymentCurrency: '\u4ED8\u6B3E\u8D27\u5E01',
        paymentCurrencyDescription: '\u9009\u62E9\u4E00\u79CD\u6807\u51C6\u5316\u8D27\u5E01\uFF0C\u5C06\u6240\u6709\u4E2A\u4EBA\u8D39\u7528\u8F6C\u6362\u4E3A\u8BE5\u8D27\u5E01\u3002',
        note: '\u6CE8\u610F\uFF1A\u66F4\u6539\u60A8\u7684\u652F\u4ED8\u8D27\u5E01\u53EF\u80FD\u4F1A\u5F71\u54CD\u60A8\u652F\u4ED8\u7ED9Expensify\u7684\u91D1\u989D\u3002\u8BF7\u53C2\u9605\u6211\u4EEC\u7684',
        noteLink: '\u5B9A\u4EF7\u9875\u9762',
        noteDetails: '\u67E5\u770B\u5B8C\u6574\u8BE6\u60C5\u3002',
    },
    addDebitCardPage: {
        addADebitCard: '\u6DFB\u52A0\u501F\u8BB0\u5361',
        nameOnCard: '\u5361\u4E0A\u7684\u59D3\u540D',
        debitCardNumber: '\u501F\u8BB0\u5361\u53F7',
        expiration: '\u5230\u671F\u65E5\u671F',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '\u8D26\u5355\u5730\u5740',
        growlMessageOnSave: '\u60A8\u7684\u501F\u8BB0\u5361\u5DF2\u6210\u529F\u6DFB\u52A0',
        expensifyPassword: 'Expensify \u5BC6\u7801',
        error: {
            invalidName: '\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5B57\u6BCD',
            addressZipCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u90AE\u653F\u7F16\u7801',
            debitCardNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u501F\u8BB0\u5361\u53F7',
            expirationDate: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u5230\u671F\u65E5\u671F',
            securityCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5B89\u5168\u4EE3\u7801',
            addressStreet: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u6709\u6548\u7684\u8D26\u5355\u5730\u5740\uFF0C\u4E0D\u80FD\u662F\u90AE\u653F\u4FE1\u7BB1\u3002',
            addressState: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u5DDE',
            addressCity: '\u8BF7\u8F93\u5165\u57CE\u5E02\u540D\u79F0',
            genericFailureMessage: '\u6DFB\u52A0\u60A8\u7684\u5361\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            password: '\u8BF7\u8F93\u5165\u60A8\u7684Expensify\u5BC6\u7801',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '\u6DFB\u52A0\u652F\u4ED8\u5361',
        nameOnCard: '\u5361\u4E0A\u7684\u59D3\u540D',
        paymentCardNumber: '\u5361\u53F7',
        expiration: '\u5230\u671F\u65E5\u671F',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '\u8D26\u5355\u5730\u5740',
        growlMessageOnSave: '\u60A8\u7684\u652F\u4ED8\u5361\u5DF2\u6210\u529F\u6DFB\u52A0',
        expensifyPassword: 'Expensify \u5BC6\u7801',
        error: {
            invalidName: '\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5B57\u6BCD',
            addressZipCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u90AE\u653F\u7F16\u7801',
            paymentCardNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5361\u53F7',
            expirationDate: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u5230\u671F\u65E5\u671F',
            securityCode: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5B89\u5168\u4EE3\u7801',
            addressStreet: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u6709\u6548\u7684\u8D26\u5355\u5730\u5740\uFF0C\u4E0D\u80FD\u662F\u90AE\u653F\u4FE1\u7BB1\u3002',
            addressState: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u5DDE',
            addressCity: '\u8BF7\u8F93\u5165\u57CE\u5E02\u540D\u79F0',
            genericFailureMessage: '\u6DFB\u52A0\u60A8\u7684\u5361\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            password: '\u8BF7\u8F93\u5165\u60A8\u7684Expensify\u5BC6\u7801',
        },
    },
    walletPage: {
        balance: '\u4F59\u989D',
        paymentMethodsTitle: '\u652F\u4ED8\u65B9\u5F0F',
        setDefaultConfirmation: '\u8BBE\u4E3A\u9ED8\u8BA4\u652F\u4ED8\u65B9\u5F0F',
        setDefaultSuccess: '\u9ED8\u8BA4\u652F\u4ED8\u65B9\u5F0F\u5DF2\u8BBE\u7F6E\uFF01',
        deleteAccount: '\u5220\u9664\u8D26\u6237',
        deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u8D26\u6237\u5417\uFF1F',
        error: {
            notOwnerOfBankAccount: '\u5C06\u6B64\u94F6\u884C\u8D26\u6237\u8BBE\u7F6E\u4E3A\u9ED8\u8BA4\u652F\u4ED8\u65B9\u5F0F\u65F6\u53D1\u751F\u9519\u8BEF\u3002',
            invalidBankAccount: '\u6B64\u94F6\u884C\u8D26\u6237\u5DF2\u88AB\u6682\u65F6\u51BB\u7ED3',
            notOwnerOfFund: '\u5C06\u6B64\u5361\u8BBE\u7F6E\u4E3A\u9ED8\u8BA4\u4ED8\u6B3E\u65B9\u5F0F\u65F6\u53D1\u751F\u9519\u8BEF\u3002',
            setDefaultFailure: '\u51FA\u4E86\u70B9\u95EE\u9898\u3002\u8BF7\u4E0EConcierge\u804A\u5929\u4EE5\u83B7\u5F97\u8FDB\u4E00\u6B65\u7684\u5E2E\u52A9\u3002',
        },
        addBankAccountFailure: '\u5C1D\u8BD5\u6DFB\u52A0\u60A8\u7684\u94F6\u884C\u8D26\u6237\u65F6\u53D1\u751F\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        getPaidFaster: '\u66F4\u5FEB\u6536\u6B3E',
        addPaymentMethod: '\u6DFB\u52A0\u652F\u4ED8\u65B9\u5F0F\u4EE5\u4FBF\u76F4\u63A5\u5728\u5E94\u7528\u4E2D\u53D1\u9001\u548C\u63A5\u6536\u4ED8\u6B3E\u3002',
        getPaidBackFaster: '\u66F4\u5FEB\u83B7\u5F97\u8FD8\u6B3E',
        secureAccessToYourMoney: '\u5B89\u5168\u8BBF\u95EE\u60A8\u7684\u8D44\u91D1',
        receiveMoney: '\u4EE5\u672C\u5730\u8D27\u5E01\u63A5\u6536\u6B3E\u9879',
        expensifyWallet: 'Expensify Wallet\uFF08\u6D4B\u8BD5\u7248\uFF09',
        sendAndReceiveMoney: '\u4E0E\u670B\u53CB\u53D1\u9001\u548C\u63A5\u6536\u8D44\u91D1\u3002\u4EC5\u9650\u7F8E\u56FD\u94F6\u884C\u8D26\u6237\u3002',
        enableWallet: '\u542F\u7528\u94B1\u5305',
        addBankAccountToSendAndReceive: '\u83B7\u5F97\u62A5\u9500\u60A8\u63D0\u4EA4\u5230\u5DE5\u4F5C\u533A\u7684\u8D39\u7528\u3002',
        addBankAccount: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
        assignedCards: '\u5206\u914D\u7684\u5361\u7247',
        assignedCardsDescription: '\u8FD9\u4E9B\u662F\u7531\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\u5206\u914D\u7684\u5361\u7247\uFF0C\u7528\u4E8E\u7BA1\u7406\u516C\u53F8\u652F\u51FA\u3002',
        expensifyCard: 'Expensify Card',
        walletActivationPending: '\u6211\u4EEC\u6B63\u5728\u5BA1\u6838\u60A8\u7684\u4FE1\u606F\u3002\u8BF7\u51E0\u5206\u949F\u540E\u518D\u56DE\u6765\u67E5\u770B\uFF01',
        walletActivationFailed:
            '\u5F88\u9057\u61BE\uFF0C\u60A8\u7684\u94B1\u5305\u76EE\u524D\u65E0\u6CD5\u542F\u7528\u3002\u8BF7\u4E0EConcierge\u804A\u5929\u4EE5\u83B7\u5F97\u8FDB\u4E00\u6B65\u5E2E\u52A9\u3002',
        addYourBankAccount: '\u6DFB\u52A0\u60A8\u7684\u94F6\u884C\u8D26\u6237',
        addBankAccountBody:
            '\u8BA9\u6211\u4EEC\u5C06\u60A8\u7684\u94F6\u884C\u8D26\u6237\u8FDE\u63A5\u5230Expensify\uFF0C\u8FD9\u6837\u5728\u5E94\u7528\u7A0B\u5E8F\u4E2D\u76F4\u63A5\u53D1\u9001\u548C\u63A5\u6536\u4ED8\u6B3E\u6BD4\u4EE5\u5F80\u4EFB\u4F55\u65F6\u5019\u90FD\u66F4\u5BB9\u6613\u3002',
        chooseYourBankAccount: '\u9009\u62E9\u60A8\u7684\u94F6\u884C\u8D26\u6237',
        chooseAccountBody: '\u786E\u4FDD\u60A8\u9009\u62E9\u6B63\u786E\u7684\u90A3\u4E2A\u3002',
        confirmYourBankAccount: '\u786E\u8BA4\u60A8\u7684\u94F6\u884C\u8D26\u6237',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: '\u5269\u4F59\u9650\u989D',
        smartLimit: {
            name: '\u667A\u80FD\u9650\u989D',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\u60A8\u53EF\u4EE5\u5728\u6B64\u5361\u4E0A\u6D88\u8D39\u6700\u591A ${formattedLimit}\uFF0C\u5E76\u4E14\u968F\u7740\u60A8\u63D0\u4EA4\u7684\u8D39\u7528\u88AB\u6279\u51C6\uFF0C\u9650\u989D\u5C06\u91CD\u7F6E\u3002`,
        },
        fixedLimit: {
            name: '\u56FA\u5B9A\u9650\u989D',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\u60A8\u53EF\u4EE5\u5728\u6B64\u5361\u4E0A\u6D88\u8D39\u6700\u591A${formattedLimit}\uFF0C\u7136\u540E\u5B83\u5C06\u88AB\u505C\u7528\u3002`,
        },
        monthlyLimit: {
            name: '\u6BCF\u6708\u9650\u5236',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\u60A8\u6BCF\u6708\u53EF\u4EE5\u5728\u6B64\u5361\u4E0A\u82B1\u8D39\u6700\u591A ${formattedLimit}\u3002\u9650\u989D\u5C06\u5728\u6BCF\u4E2A\u65E5\u5386\u6708\u7684\u7B2C1\u5929\u91CD\u7F6E\u3002`,
        },
        virtualCardNumber: '\u865A\u62DF\u5361\u53F7',
        travelCardCvv: '\u65C5\u884C\u5361CVV',
        physicalCardNumber: '\u5B9E\u4F53\u5361\u53F7',
        getPhysicalCard: '\u83B7\u53D6\u5B9E\u4F53\u5361',
        reportFraud: '\u62A5\u544A\u865A\u62DF\u5361\u6B3A\u8BC8\u884C\u4E3A',
        reportTravelFraud: '\u62A5\u544A\u65C5\u884C\u5361\u6B3A\u8BC8\u884C\u4E3A',
        reviewTransaction: '\u5BA1\u6838\u4EA4\u6613',
        suspiciousBannerTitle: '\u53EF\u7591\u4EA4\u6613',
        suspiciousBannerDescription: '\u6211\u4EEC\u6CE8\u610F\u5230\u60A8\u7684\u5361\u4E0A\u6709\u53EF\u7591\u4EA4\u6613\u3002\u70B9\u51FB\u4E0B\u65B9\u67E5\u770B\u3002',
        cardLocked: '\u5728\u6211\u4EEC\u7684\u56E2\u961F\u5BA1\u6838\u60A8\u516C\u53F8\u7684\u8D26\u6237\u671F\u95F4\uFF0C\u60A8\u7684\u5361\u5DF2\u88AB\u6682\u65F6\u9501\u5B9A\u3002',
        cardDetails: {
            cardNumber: '\u865A\u62DF\u5361\u53F7',
            expiration: '\u8FC7\u671F',
            cvv: 'CVV',
            address: '\u5730\u5740',
            revealDetails: '\u663E\u793A\u8BE6\u7EC6\u4FE1\u606F',
            revealCvv: '\u663E\u793A CVV',
            copyCardNumber: '\u590D\u5236\u5361\u53F7',
            updateAddress: '\u66F4\u65B0\u5730\u5740',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `\u5DF2\u6DFB\u52A0\u5230${platform}\u94B1\u5305`,
        cardDetailsLoadingFailure:
            '\u52A0\u8F7D\u5361\u7247\u8BE6\u60C5\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u4E92\u8054\u7F51\u8FDE\u63A5\u5E76\u91CD\u8BD5\u3002',
        validateCardTitle: '\u8BA9\u6211\u4EEC\u786E\u8BA4\u662F\u4F60',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u5230${contactMethod}\u7684\u9A8C\u8BC1\u7801\u4EE5\u67E5\u770B\u60A8\u7684\u5361\u7247\u8BE6\u60C5\u3002\u9A8C\u8BC1\u7801\u5C06\u5728\u4E00\u4E24\u5206\u949F\u5185\u5230\u8FBE\u3002`,
    },
    workflowsPage: {
        workflowTitle: '\u82B1\u8D39',
        workflowDescription: '\u914D\u7F6E\u4E00\u4E2A\u4ECE\u652F\u51FA\u53D1\u751F\u5230\u5BA1\u6279\u548C\u4ED8\u6B3E\u7684\u5DE5\u4F5C\u6D41\u7A0B\u3002',
        delaySubmissionTitle: '\u5EF6\u8FDF\u63D0\u4EA4',
        delaySubmissionDescription:
            '\u9009\u62E9\u81EA\u5B9A\u4E49\u63D0\u4EA4\u8D39\u7528\u7684\u65F6\u95F4\u8868\uFF0C\u6216\u8005\u5173\u95ED\u6B64\u9009\u9879\u4EE5\u5B9E\u65F6\u66F4\u65B0\u652F\u51FA\u3002',
        submissionFrequency: '\u63D0\u4EA4\u9891\u7387',
        submissionFrequencyDateOfMonth: '\u6708\u4EFD\u65E5\u671F',
        addApprovalsTitle: '\u6DFB\u52A0\u5BA1\u6279',
        addApprovalButton: '\u6DFB\u52A0\u5BA1\u6279\u6D41\u7A0B',
        addApprovalTip:
            '\u6B64\u9ED8\u8BA4\u5DE5\u4F5C\u6D41\u7A0B\u9002\u7528\u4E8E\u6240\u6709\u6210\u5458\uFF0C\u9664\u975E\u5B58\u5728\u66F4\u5177\u4F53\u7684\u5DE5\u4F5C\u6D41\u7A0B\u3002',
        approver: '\u5BA1\u6279\u4EBA',
        connectBankAccount: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
        addApprovalsDescription: '\u5728\u6388\u6743\u4ED8\u6B3E\u4E4B\u524D\u9700\u8981\u989D\u5916\u7684\u6279\u51C6\u3002',
        makeOrTrackPaymentsTitle: '\u8FDB\u884C\u6216\u8DDF\u8E2A\u4ED8\u6B3E',
        makeOrTrackPaymentsDescription:
            '\u6DFB\u52A0\u6388\u6743\u4ED8\u6B3E\u4EBA\u4EE5\u4FBF\u5728Expensify\u4E2D\u8FDB\u884C\u4ED8\u6B3E\u6216\u8DDF\u8E2A\u5176\u4ED6\u5730\u65B9\u7684\u4ED8\u6B3E\u3002',
        editor: {
            submissionFrequency: '\u9009\u62E9Expensify\u5728\u5171\u4EAB\u65E0\u9519\u8BEF\u652F\u51FA\u4E4B\u524D\u5E94\u7B49\u5F85\u7684\u65F6\u95F4\u3002',
        },
        frequencyDescription: '\u9009\u62E9\u60A8\u5E0C\u671B\u81EA\u52A8\u63D0\u4EA4\u8D39\u7528\u7684\u9891\u7387\uFF0C\u6216\u8005\u9009\u62E9\u624B\u52A8\u63D0\u4EA4',
        frequencies: {
            instant: '\u5373\u65F6',
            weekly: '\u6BCF\u5468',
            monthly: '\u6BCF\u6708',
            twiceAMonth: '\u6BCF\u6708\u4E24\u6B21',
            byTrip: '\u6309\u884C\u7A0B',
            manually: '\u624B\u52A8',
            daily: '\u6BCF\u65E5',
            lastDayOfMonth: '\u6708\u672B\u6700\u540E\u4E00\u5929',
            lastBusinessDayOfMonth: '\u6BCF\u6708\u7684\u6700\u540E\u4E00\u4E2A\u5DE5\u4F5C\u65E5',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '\u7B2C\u4E00',
                '2': '\u7B2C\u4E8C',
                '3': '\u7B2C\u4E09',
                '4': '\u7B2C\u56DB',
                '5': '\u7B2C\u4E94',
                '6': '\u7B2C\u516D',
                '7': '\u7B2C\u4E03',
                '8': '\u7B2C\u516B',
                '9': '\u7B2C\u4E5D',
                '10': '\u7B2C\u5341',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows:
            '\u8BE5\u6210\u5458\u5DF2\u5C5E\u4E8E\u53E6\u4E00\u4E2A\u5BA1\u6279\u6D41\u7A0B\u3002\u6B64\u5904\u7684\u4EFB\u4F55\u66F4\u65B0\u4E5F\u4F1A\u53CD\u6620\u5728\u90A3\u91CC\u3002',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> \u5DF2\u7ECF\u6279\u51C6\u4E86\u53D1\u9001\u7ED9 <strong>${name2}</strong> \u7684\u62A5\u544A\u3002\u8BF7\u9009\u62E9\u4E0D\u540C\u7684\u5BA1\u6279\u4EBA\u4EE5\u907F\u514D\u5FAA\u73AF\u5DE5\u4F5C\u6D41\u3002`,
        emptyContent: {
            title: '\u6CA1\u6709\u6210\u5458\u53EF\u663E\u793A',
            expensesFromSubtitle: '\u6240\u6709\u5DE5\u4F5C\u533A\u6210\u5458\u5DF2\u5C5E\u4E8E\u73B0\u6709\u7684\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B\u3002',
            approverSubtitle: '\u6240\u6709\u5BA1\u6279\u8005\u90FD\u5C5E\u4E8E\u73B0\u6709\u7684\u5DE5\u4F5C\u6D41\u7A0B\u3002',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: '\u5EF6\u8FDF\u63D0\u4EA4\u65E0\u6CD5\u66F4\u6539\u3002\u8BF7\u91CD\u8BD5\u6216\u8054\u7CFB\u5BA2\u670D\u3002',
        autoReportingFrequencyErrorMessage: '\u65E0\u6CD5\u66F4\u6539\u63D0\u4EA4\u9891\u7387\u3002\u8BF7\u91CD\u8BD5\u6216\u8054\u7CFB\u5BA2\u670D\u3002',
        monthlyOffsetErrorMessage: '\u65E0\u6CD5\u66F4\u6539\u6BCF\u6708\u9891\u7387\u3002\u8BF7\u91CD\u8BD5\u6216\u8054\u7CFB\u5BA2\u670D\u3002',
    },
    workflowsCreateApprovalsPage: {
        title: '\u786E\u8BA4',
        header: '\u6DFB\u52A0\u66F4\u591A\u5BA1\u6279\u4EBA\u5E76\u786E\u8BA4\u3002',
        additionalApprover: '\u989D\u5916\u5BA1\u6279\u4EBA',
        submitButton: '\u6DFB\u52A0\u5DE5\u4F5C\u6D41\u7A0B',
    },
    workflowsEditApprovalsPage: {
        title: '\u7F16\u8F91\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B',
        deleteTitle: '\u5220\u9664\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B',
        deletePrompt:
            '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B\u5417\uFF1F\u6240\u6709\u6210\u5458\u968F\u540E\u5C06\u9075\u5FAA\u9ED8\u8BA4\u5DE5\u4F5C\u6D41\u7A0B\u3002',
    },
    workflowsExpensesFromPage: {
        title: '\u6765\u81EA\u7684\u8D39\u7528',
        header: '\u5F53\u4EE5\u4E0B\u6210\u5458\u63D0\u4EA4\u8D39\u7528\u65F6\uFF1A',
    },
    workflowsApproverPage: {
        genericErrorMessage: '\u65E0\u6CD5\u66F4\u6539\u5BA1\u6279\u4EBA\u3002\u8BF7\u91CD\u8BD5\u6216\u8054\u7CFB\u652F\u6301\u3002',
        header: '\u53D1\u9001\u7ED9\u8BE5\u6210\u5458\u5BA1\u6279\uFF1A',
    },
    workflowsPayerPage: {
        title: '\u6388\u6743\u4ED8\u6B3E\u4EBA',
        genericErrorMessage: '\u65E0\u6CD5\u66F4\u6539\u6388\u6743\u4ED8\u6B3E\u4EBA\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        admins: '\u7BA1\u7406\u5458',
        payer: '\u4ED8\u6B3E\u4EBA',
        paymentAccount: '\u652F\u4ED8\u8D26\u6237',
    },
    reportFraudPage: {
        title: '\u62A5\u544A\u865A\u62DF\u5361\u6B3A\u8BC8\u884C\u4E3A',
        description:
            '\u5982\u679C\u60A8\u7684\u865A\u62DF\u5361\u4FE1\u606F\u88AB\u76D7\u6216\u6CC4\u9732\uFF0C\u6211\u4EEC\u5C06\u6C38\u4E45\u505C\u7528\u60A8\u73B0\u6709\u7684\u5361\uFF0C\u5E76\u4E3A\u60A8\u63D0\u4F9B\u4E00\u5F20\u65B0\u7684\u865A\u62DF\u5361\u548C\u53F7\u7801\u3002',
        deactivateCard: '\u505C\u7528\u5361\u7247',
        reportVirtualCardFraud: '\u62A5\u544A\u865A\u62DF\u5361\u6B3A\u8BC8\u884C\u4E3A',
    },
    reportFraudConfirmationPage: {
        title: '\u62A5\u544A\u7684\u5361\u7247\u6B3A\u8BC8',
        description:
            '\u6211\u4EEC\u5DF2\u6C38\u4E45\u505C\u7528\u60A8\u7684\u73B0\u6709\u5361\u7247\u3002\u5F53\u60A8\u8FD4\u56DE\u67E5\u770B\u5361\u7247\u8BE6\u60C5\u65F6\uFF0C\u60A8\u5C06\u6709\u4E00\u5F20\u65B0\u7684\u865A\u62DF\u5361\u53EF\u7528\u3002',
        buttonText: '\u77E5\u9053\u4E86\uFF0C\u8C22\u8C22\uFF01',
    },
    activateCardPage: {
        activateCard: '\u6FC0\u6D3B\u5361\u7247',
        pleaseEnterLastFour: '\u8BF7\u8F93\u5165\u60A8\u5361\u7247\u7684\u540E\u56DB\u4F4D\u6570\u5B57\u3002',
        activatePhysicalCard: '\u6FC0\u6D3B\u5B9E\u4F53\u5361',
        error: {
            thatDidNotMatch: '\u8FD9\u4E0E\u60A8\u5361\u4E0A\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u4E0D\u5339\u914D\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            throttled:
                '\u60A8\u591A\u6B21\u9519\u8BEF\u8F93\u5165\u4E86\u60A8\u7684Expensify\u5361\u7684\u6700\u540E4\u4F4D\u6570\u5B57\u3002\u5982\u679C\u60A8\u786E\u5B9A\u6570\u5B57\u662F\u6B63\u786E\u7684\uFF0C\u8BF7\u8054\u7CFBConcierge\u89E3\u51B3\u3002\u5426\u5219\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
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
        addressMessage: '\u8BF7\u8F93\u5165\u60A8\u7684\u9001\u8D27\u5730\u5740\u3002',
        streetAddress: '\u8857\u9053\u5730\u5740',
        city: '\u57CE\u5E02',
        state: '\u72B6\u6001',
        zipPostcode: '\u90AE\u653F\u7F16\u7801',
        country: '\u56FD\u5BB6',
        confirmMessage: '\u8BF7\u786E\u8BA4\u4EE5\u4E0B\u4FE1\u606F\u3002',
        estimatedDeliveryMessage: '\u60A8\u7684\u5B9E\u4F53\u5361\u5C06\u57282-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8FBE\u3002',
        next: '\u4E0B\u4E00\u4E2A',
        getPhysicalCard: '\u83B7\u53D6\u5B9E\u4F53\u5361',
        shipCard: '\u8FD0\u9001\u5361\u7247',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: '\u5373\u65F6\uFF08\u501F\u8BB0\u5361\uFF09',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% \u8D39\u7528\uFF08\u6700\u4F4E ${minAmount}\uFF09`,
        ach: '1-3 \u4E2A\u5DE5\u4F5C\u65E5\uFF08\u94F6\u884C\u8D26\u6237\uFF09',
        achSummary: '\u65E0\u8D39\u7528',
        whichAccount: '\u54EA\u4E2A\u8D26\u6237\uFF1F',
        fee: '\u8D39\u7528',
        transferSuccess: '\u8F6C\u8D26\u6210\u529F\uFF01',
        transferDetailBankAccount: '\u60A8\u7684\u8D44\u91D1\u5E94\u5728\u63A5\u4E0B\u6765\u76841-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8D26\u3002',
        transferDetailDebitCard: '\u60A8\u7684\u8D44\u91D1\u5E94\u7ACB\u5373\u5230\u8D26\u3002',
        failedTransfer: '\u60A8\u7684\u4F59\u989D\u5C1A\u672A\u5B8C\u5168\u7ED3\u6E05\u3002\u8BF7\u8F6C\u8D26\u5230\u94F6\u884C\u8D26\u6237\u3002',
        notHereSubTitle: '\u8BF7\u4ECE\u94B1\u5305\u9875\u9762\u8F6C\u79FB\u60A8\u7684\u4F59\u989D',
        goToWallet: '\u524D\u5F80\u94B1\u5305',
    },
    chooseTransferAccountPage: {
        chooseAccount: '\u9009\u62E9\u8D26\u6237',
    },
    paymentMethodList: {
        addPaymentMethod: '\u6DFB\u52A0\u4ED8\u6B3E\u65B9\u5F0F',
        addNewDebitCard: '\u6DFB\u52A0\u65B0\u7684\u501F\u8BB0\u5361',
        addNewBankAccount: '\u6DFB\u52A0\u65B0\u94F6\u884C\u8D26\u6237',
        accountLastFour: '\u4EE5...\u7ED3\u675F',
        cardLastFour: '\u5361\u53F7\u672B\u5C3E\u4E3A',
        addFirstPaymentMethod: '\u6DFB\u52A0\u652F\u4ED8\u65B9\u5F0F\u4EE5\u4FBF\u76F4\u63A5\u5728\u5E94\u7528\u4E2D\u53D1\u9001\u548C\u63A5\u6536\u4ED8\u6B3E\u3002',
        defaultPaymentMethod: '\u9ED8\u8BA4',
    },
    preferencesPage: {
        appSection: {
            title: '\u5E94\u7528\u504F\u597D\u8BBE\u7F6E',
        },
        testSection: {
            title: '\u6D4B\u8BD5\u504F\u597D\u8BBE\u7F6E',
            subtitle: '\u7528\u4E8E\u8C03\u8BD5\u548C\u6D4B\u8BD5\u5E94\u7528\u7A0B\u5E8F\u7684\u8BBE\u7F6E\u3002',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '\u63A5\u6536\u76F8\u5173\u529F\u80FD\u66F4\u65B0\u548CExpensify\u65B0\u95FB',
        muteAllSounds: '\u5C06Expensify\u7684\u6240\u6709\u58F0\u97F3\u9759\u97F3',
    },
    priorityModePage: {
        priorityMode: '\u4F18\u5148\u6A21\u5F0F',
        explainerText:
            '\u9009\u62E9\u662F\u5426\u4EC5#focus\u4E8E\u672A\u8BFB\u548C\u7F6E\u9876\u804A\u5929\uFF0C\u6216\u663E\u793A\u6240\u6709\u5185\u5BB9\uFF0C\u5E76\u5C06\u6700\u65B0\u548C\u7F6E\u9876\u804A\u5929\u7F6E\u4E8E\u9876\u90E8\u3002',
        priorityModes: {
            default: {
                label: '\u6700\u8FD1\u7684',
                description: '\u6309\u6700\u8FD1\u7684\u6392\u5E8F\u663E\u793A\u6240\u6709\u804A\u5929\u8BB0\u5F55',
            },
            gsd: {
                label: '#focus',
                description: '\u4EC5\u663E\u793A\u6309\u5B57\u6BCD\u987A\u5E8F\u6392\u5E8F\u7684\u672A\u8BFB\u5185\u5BB9',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `\u5728${policyName}`,
        generatingPDF: '\u751F\u6210 PDF',
        waitForPDF: '\u8BF7\u7A0D\u5019\uFF0C\u6211\u4EEC\u6B63\u5728\u751F\u6210 PDF',
        errorPDF: '\u5C1D\u8BD5\u751F\u6210\u60A8\u7684PDF\u65F6\u51FA\u9519\u4E86\u3002',
        generatedPDF: '\u60A8\u7684\u62A5\u544A PDF \u5DF2\u751F\u6210\uFF01',
    },
    reportDescriptionPage: {
        roomDescription: '\u623F\u95F4\u63CF\u8FF0',
        roomDescriptionOptional: '\u623F\u95F4\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09',
        explainerText: '\u4E3A\u623F\u95F4\u8BBE\u7F6E\u81EA\u5B9A\u4E49\u63CF\u8FF0\u3002',
    },
    groupChat: {
        lastMemberTitle: '\u6CE8\u610F\uFF01',
        lastMemberWarning:
            '\u7531\u4E8E\u60A8\u662F\u8FD9\u91CC\u7684\u6700\u540E\u4E00\u4E2A\u4EBA\uFF0C\u79BB\u5F00\u5C06\u4F7F\u6240\u6709\u6210\u5458\u65E0\u6CD5\u8BBF\u95EE\u6B64\u804A\u5929\u3002\u60A8\u786E\u5B9A\u8981\u79BB\u5F00\u5417\uFF1F',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}\u7684\u7FA4\u804A`,
    },
    languagePage: {
        language: '\u8BED\u8A00',
        languages: {
            en: {
                label: '\u82F1\u8BED',
            },
            es: {
                label: 'Espa\u00F1ol',
            },
        },
    },
    themePage: {
        theme: '\u4E3B\u9898',
        themes: {
            dark: {
                label: '\u9ED1\u6697',
            },
            light: {
                label: '\u5149',
            },
            system: {
                label: '\u4F7F\u7528\u8BBE\u5907\u8BBE\u7F6E',
            },
        },
        chooseThemeBelowOrSync: '\u9009\u62E9\u4E0B\u65B9\u7684\u4E3B\u9898\uFF0C\u6216\u4E0E\u60A8\u7684\u8BBE\u5907\u8BBE\u7F6E\u540C\u6B65\u3002',
    },
    termsOfUse: {
        phrase1: '\u901A\u8FC7\u767B\u5F55\uFF0C\u60A8\u540C\u610F',
        phrase2: '\u670D\u52A1\u6761\u6B3E',
        phrase3: '\u548C',
        phrase4: '\u9690\u79C1',
        phrase5: `\u8D27\u5E01\u4F20\u8F93\u7531${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}\uFF08NMLS ID:2017010\uFF09\u6839\u636E\u5176\u63D0\u4F9B`,
        phrase6: '\u8BB8\u53EF\u8BC1',
    },
    validateCodeForm: {
        magicCodeNotReceived: '\u6CA1\u6709\u6536\u5230\u9B54\u6CD5\u4EE3\u7801\uFF1F',
        enterAuthenticatorCode: '\u8BF7\u8F93\u5165\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u5668\u4EE3\u7801',
        enterRecoveryCode: '\u8BF7\u8F93\u5165\u60A8\u7684\u6062\u590D\u4EE3\u7801',
        requiredWhen2FAEnabled: '\u542F\u75282FA\u65F6\u5FC5\u9700',
        requestNewCode: '\u8BF7\u6C42\u4E00\u4E2A\u65B0\u4EE3\u7801',
        requestNewCodeAfterErrorOccurred: '\u8BF7\u6C42\u65B0\u4EE3\u7801',
        error: {
            pleaseFillMagicCode: '\u8BF7\u8F93\u5165\u60A8\u7684\u9B54\u6CD5\u4EE3\u7801',
            incorrectMagicCode: '\u9B54\u6CD5\u4EE3\u7801\u4E0D\u6B63\u786E\u6216\u65E0\u6548\u3002\u8BF7\u91CD\u8BD5\u6216\u8BF7\u6C42\u65B0\u4EE3\u7801\u3002',
            pleaseFillTwoFactorAuth: '\u8BF7\u8F93\u5165\u60A8\u7684\u53CC\u56E0\u7D20\u8BA4\u8BC1\u4EE3\u7801',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '\u8BF7\u586B\u5199\u6240\u6709\u5B57\u6BB5',
        pleaseFillPassword: '\u8BF7\u8F93\u5165\u60A8\u7684\u5BC6\u7801',
        pleaseFillTwoFactorAuth: '\u8BF7\u8F93\u5165\u60A8\u7684\u53CC\u56E0\u7D20\u9A8C\u8BC1\u7801',
        enterYourTwoFactorAuthenticationCodeToContinue: '\u8BF7\u8F93\u5165\u60A8\u7684\u53CC\u56E0\u7D20\u8BA4\u8BC1\u4EE3\u7801\u4EE5\u7EE7\u7EED',
        forgot: '\u5FD8\u8BB0\u4E86\u5417\uFF1F',
        requiredWhen2FAEnabled: '\u542F\u75282FA\u65F6\u5FC5\u9700',
        error: {
            incorrectPassword: '\u5BC6\u7801\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
            incorrectLoginOrPassword: '\u767B\u5F55\u6216\u5BC6\u7801\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
            incorrect2fa: '\u4E24\u6B65\u9A8C\u8BC1\u4EE3\u7801\u4E0D\u6B63\u786E\u3002\u8BF7\u91CD\u8BD5\u3002',
            twoFactorAuthenticationEnabled:
                '\u60A8\u5DF2\u5728\u6B64\u8D26\u6237\u4E0A\u542F\u7528\u4E86\u53CC\u91CD\u8EAB\u4EFD\u9A8C\u8BC1\u3002\u8BF7\u4F7F\u7528\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801\u767B\u5F55\u3002',
            invalidLoginOrPassword: '\u767B\u5F55\u540D\u6216\u5BC6\u7801\u65E0\u6548\u3002\u8BF7\u91CD\u8BD5\u6216\u91CD\u7F6E\u60A8\u7684\u5BC6\u7801\u3002',
            unableToResetPassword:
                '\u6211\u4EEC\u65E0\u6CD5\u66F4\u6539\u60A8\u7684\u5BC6\u7801\u3002\u8FD9\u53EF\u80FD\u662F\u7531\u4E8E\u65E7\u5BC6\u7801\u91CD\u7F6E\u90AE\u4EF6\u4E2D\u7684\u5BC6\u7801\u91CD\u7F6E\u94FE\u63A5\u5DF2\u8FC7\u671F\u3002\u6211\u4EEC\u5DF2\u5411\u60A8\u53D1\u9001\u4E86\u4E00\u6761\u65B0\u94FE\u63A5\uFF0C\u60A8\u53EF\u4EE5\u518D\u6B21\u5C1D\u8BD5\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u6536\u4EF6\u7BB1\u548C\u5783\u573E\u90AE\u4EF6\u6587\u4EF6\u5939\uFF1B\u5B83\u5E94\u8BE5\u4F1A\u5728\u51E0\u5206\u949F\u5185\u5230\u8FBE\u3002',
            noAccess:
                '\u60A8\u65E0\u6743\u8BBF\u95EE\u6B64\u5E94\u7528\u7A0B\u5E8F\u3002\u8BF7\u6DFB\u52A0\u60A8\u7684GitHub\u7528\u6237\u540D\u4EE5\u83B7\u53D6\u8BBF\u95EE\u6743\u9650\u3002',
            accountLocked: '\u7531\u4E8E\u591A\u6B21\u5C1D\u8BD5\u5931\u8D25\uFF0C\u60A8\u7684\u8D26\u6237\u5DF2\u88AB\u9501\u5B9A\u3002\u8BF7\u57281\u5C0F\u65F6\u540E\u91CD\u8BD5\u3002',
            fallback: '\u51FA\u4E86\u70B9\u95EE\u9898\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        },
    },
    loginForm: {
        phoneOrEmail: '\u7535\u8BDD\u6216\u7535\u5B50\u90AE\u4EF6',
        error: {
            invalidFormatEmailLogin: '\u8F93\u5165\u7684\u7535\u5B50\u90AE\u4EF6\u65E0\u6548\u3002\u8BF7\u4FEE\u6B63\u683C\u5F0F\u540E\u91CD\u8BD5\u3002',
        },
        cannotGetAccountDetails: '\u65E0\u6CD5\u83B7\u53D6\u8D26\u6237\u8BE6\u7EC6\u4FE1\u606F\u3002\u8BF7\u5C1D\u8BD5\u91CD\u65B0\u767B\u5F55\u3002',
        loginForm: '\u767B\u5F55\u8868\u5355',
        notYou: ({user}: NotYouParams) => `\u4E0D\u662F${user}\uFF1F`,
    },
    onboarding: {
        welcome: '\u6B22\u8FCE\uFF01',
        welcomeSignOffTitleManageTeam:
            '\u5B8C\u6210\u4E0A\u8FF0\u4EFB\u52A1\u540E\uFF0C\u6211\u4EEC\u53EF\u4EE5\u63A2\u7D22\u66F4\u591A\u529F\u80FD\uFF0C\u6BD4\u5982\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B\u548C\u89C4\u5219\uFF01',
        welcomeSignOffTitle: '\u5F88\u9AD8\u5174\u89C1\u5230\u4F60\uFF01',
        explanationModal: {
            title: '\u6B22\u8FCE\u4F7F\u7528Expensify',
            description:
                '\u4E00\u4E2A\u5E94\u7528\u7A0B\u5E8F\u5373\u53EF\u4EE5\u804A\u5929\u7684\u901F\u5EA6\u5904\u7406\u60A8\u7684\u5546\u4E1A\u548C\u4E2A\u4EBA\u652F\u51FA\u3002\u8BD5\u8BD5\u770B\u5E76\u544A\u8BC9\u6211\u4EEC\u60A8\u7684\u60F3\u6CD5\u3002\u66F4\u591A\u7CBE\u5F69\u5373\u5C06\u5230\u6765\uFF01',
            secondaryDescription:
                '\u8981\u5207\u6362\u56DE Expensify Classic\uFF0C\u53EA\u9700\u70B9\u51FB\u60A8\u7684\u4E2A\u4EBA\u8D44\u6599\u56FE\u7247 > \u524D\u5F80 Expensify Classic\u3002',
        },
        welcomeVideo: {
            title: '\u6B22\u8FCE\u4F7F\u7528Expensify',
            description:
                '\u4E00\u4E2A\u5E94\u7528\u7A0B\u5E8F\u5373\u53EF\u5728\u804A\u5929\u4E2D\u5904\u7406\u60A8\u6240\u6709\u7684\u5546\u4E1A\u548C\u4E2A\u4EBA\u652F\u51FA\u3002\u4E13\u4E3A\u60A8\u7684\u4F01\u4E1A\u3001\u56E2\u961F\u548C\u670B\u53CB\u6253\u9020\u3002',
        },
        getStarted: '\u5F00\u59CB\u4F7F\u7528',
        whatsYourName: '\u4F60\u53EB\u4EC0\u4E48\u540D\u5B57\uFF1F',
        peopleYouMayKnow:
            '\u60A8\u53EF\u80FD\u8BA4\u8BC6\u7684\u4EBA\u5DF2\u7ECF\u5728\u8FD9\u91CC\u4E86\uFF01\u9A8C\u8BC1\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u4EE5\u52A0\u5165\u4ED6\u4EEC\u3002',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `\u6765\u81EA${domain}\u7684\u67D0\u4EBA\u5DF2\u7ECF\u521B\u5EFA\u4E86\u4E00\u4E2A\u5DE5\u4F5C\u533A\u3002\u8BF7\u8F93\u5165\u53D1\u9001\u5230${email}\u7684\u9B54\u6CD5\u4EE3\u7801\u3002`,
        joinAWorkspace: '\u52A0\u5165\u5DE5\u4F5C\u533A',
        listOfWorkspaces:
            '\u8FD9\u662F\u60A8\u53EF\u4EE5\u52A0\u5165\u7684\u5DE5\u4F5C\u533A\u5217\u8868\u3002\u522B\u62C5\u5FC3\uFF0C\u5982\u679C\u60A8\u613F\u610F\uFF0C\u60A8\u53EF\u4EE5\u7A0D\u540E\u518D\u52A0\u5165\u3002',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} \u540D\u6210\u5458${employeeCount > 1 ? 's' : ''} \u2022 ${policyOwner}`,
        whereYouWork: '\u4F60\u5728\u54EA\u91CC\u5DE5\u4F5C\uFF1F',
        errorSelection: '\u9009\u62E9\u4E00\u4E2A\u9009\u9879\u7EE7\u7EED',
        purpose: {
            title: '\u4F60\u4ECA\u5929\u60F3\u505A\u4EC0\u4E48\uFF1F',
            errorContinue: '\u8BF7\u6309\u7EE7\u7EED\u8FDB\u884C\u8BBE\u7F6E',
            errorBackButton: '\u8BF7\u5B8C\u6210\u8BBE\u7F6E\u95EE\u9898\u4EE5\u5F00\u59CB\u4F7F\u7528\u8BE5\u5E94\u7528\u7A0B\u5E8F',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '\u7531\u6211\u7684\u96C7\u4E3B\u507F\u8FD8\u8D39\u7528',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '\u7BA1\u7406\u6211\u56E2\u961F\u7684\u8D39\u7528',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '\u8DDF\u8E2A\u548C\u9884\u7B97\u8D39\u7528',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '\u4E0E\u670B\u53CB\u804A\u5929\u5E76\u5206\u644A\u8D39\u7528',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '\u5176\u4ED6\u5185\u5BB9',
        },
        employees: {
            title: '\u4F60\u6709\u591A\u5C11\u5458\u5DE5\uFF1F',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10\u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 \u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100\u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000 \u540D\u5458\u5DE5',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '\u8D85\u8FC71,000\u540D\u5458\u5DE5',
        },
        accounting: {
            title: '\u60A8\u4F7F\u7528\u4EFB\u4F55\u4F1A\u8BA1\u8F6F\u4EF6\u5417\uFF1F',
            none: 'None',
        },
        error: {
            requiredFirstName: '\u8BF7\u8F93\u5165\u60A8\u7684\u540D\u5B57\u4EE5\u7EE7\u7EED',
        },
        workEmail: {
            title: '\u4F60\u7684\u5DE5\u4F5C\u90AE\u7BB1\u662F\u4EC0\u4E48\uFF1F',
            subtitle: 'Expensify \u5728\u60A8\u8FDE\u63A5\u5DE5\u4F5C\u90AE\u7BB1\u65F6\u6548\u679C\u6700\u4F73\u3002',
            explanationModal: {
                descriptionOne: '\u8F6C\u53D1\u5230 receipts@expensify.com \u8FDB\u884C\u626B\u63CF',
                descriptionTwo: '\u52A0\u5165\u5DF2\u7ECF\u5728\u4F7F\u7528Expensify\u7684\u540C\u4E8B\u4EEC\u5427',
                descriptionThree: '\u4EAB\u53D7\u66F4\u4E2A\u6027\u5316\u7684\u4F53\u9A8C',
            },
            addWorkEmail: '\u6DFB\u52A0\u5DE5\u4F5C\u90AE\u7BB1',
        },
        workEmailValidation: {
            title: '\u9A8C\u8BC1\u60A8\u7684\u5DE5\u4F5C\u90AE\u7BB1',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) =>
                `\u8BF7\u8F93\u5165\u53D1\u9001\u5230${workEmail}\u7684\u9B54\u6CD5\u4EE3\u7801\u3002\u5B83\u5E94\u8BE5\u4F1A\u5728\u4E00\u4E24\u5206\u949F\u5185\u5230\u8FBE\u3002`,
        },
        workEmailValidationError: {
            publicEmail: '\u8BF7\u8F93\u5165\u6765\u81EA\u79C1\u4EBA\u57DF\u7684\u6709\u6548\u5DE5\u4F5C\u7535\u5B50\u90AE\u4EF6\uFF0C\u4F8B\u5982 mitch@company.com',
            offline: '\u7531\u4E8E\u60A8\u4F3C\u4E4E\u5904\u4E8E\u79BB\u7EBF\u72B6\u6001\uFF0C\u6211\u4EEC\u65E0\u6CD5\u6DFB\u52A0\u60A8\u7684\u5DE5\u4F5C\u90AE\u7BB1\u3002',
        },
        mergeBlockScreen: {
            title: '\u65E0\u6CD5\u6DFB\u52A0\u5DE5\u4F5C\u90AE\u7BB1',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `\u6211\u4EEC\u65E0\u6CD5\u6DFB\u52A0${workEmail}\u3002\u8BF7\u7A0D\u540E\u5728\u8BBE\u7F6E\u4E2D\u91CD\u8BD5\uFF0C\u6216\u4E0EConcierge\u804A\u5929\u4EE5\u83B7\u53D6\u6307\u5BFC\u3002`,
        },
        workspace: {
            title: '\u4F7F\u7528\u5DE5\u4F5C\u533A\u4FDD\u6301\u4E95\u4E95\u6709\u6761',
            subtitle:
                '\u89E3\u9501\u5F3A\u5927\u7684\u5DE5\u5177\u6765\u7B80\u5316\u60A8\u7684\u8D39\u7528\u7BA1\u7406\uFF0C\u4E00\u5207\u5C3D\u5728\u4E00\u4E2A\u5730\u65B9\u3002\u901A\u8FC7\u5DE5\u4F5C\u533A\uFF0C\u60A8\u53EF\u4EE5\uFF1A',
            explanationModal: {
                descriptionOne: '\u8DDF\u8E2A\u548C\u6574\u7406\u6536\u636E',
                descriptionTwo: '\u5206\u7C7B\u548C\u6807\u8BB0\u8D39\u7528',
                descriptionThree: '\u521B\u5EFA\u548C\u5206\u4EAB\u62A5\u544A',
            },
            price: '\u514D\u8D39\u8BD5\u752830\u5929\uFF0C\u7136\u540E\u53EA\u9700<strong>$5/\u6708</strong>\u5347\u7EA7\u3002',
            createWorkspace: '\u521B\u5EFA\u5DE5\u4F5C\u533A',
        },
        confirmWorkspace: {
            title: '\u786E\u8BA4\u5DE5\u4F5C\u533A',
            subtitle:
                '\u521B\u5EFA\u4E00\u4E2A\u5DE5\u4F5C\u533A\u6765\u8DDF\u8E2A\u6536\u636E\u3001\u62A5\u9500\u8D39\u7528\u3001\u7BA1\u7406\u65C5\u884C\u3001\u521B\u5EFA\u62A5\u544A\u7B49\u2014\u2014\u6240\u6709\u8FD9\u4E9B\u90FD\u53EF\u4EE5\u4EE5\u804A\u5929\u7684\u901F\u5EA6\u5B8C\u6210\u3002',
        },
        inviteMembers: {
            title: '\u9080\u8BF7\u6210\u5458',
            subtitle:
                '\u4E0E\u4F1A\u8BA1\u4E00\u8D77\u7BA1\u7406\u548C\u5206\u4EAB\u60A8\u7684\u8D39\u7528\uFF0C\u6216\u4E0E\u670B\u53CB\u4E00\u8D77\u521B\u5EFA\u65C5\u884C\u56E2\u4F53\u3002',
        },
    },
    featureTraining: {
        doNotShowAgain: '\u4E0D\u518D\u663E\u793A\u6B64\u5185\u5BB9',
    },
    personalDetails: {
        error: {
            containsReservedWord: '\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u201CExpensify\u201D\u6216\u201CConcierge\u201D\u5B57\u6837\u3002',
            hasInvalidCharacter: '\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u9017\u53F7\u6216\u5206\u53F7',
            requiredFirstName: '\u540D\u5B57\u4E0D\u80FD\u4E3A\u7A7A',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '\u60A8\u7684\u6CD5\u5B9A\u59D3\u540D\u662F\u4EC0\u4E48\uFF1F',
        enterDateOfBirth: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        enterAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        enterPhoneNumber: '\u4F60\u7684\u7535\u8BDD\u53F7\u7801\u662F\u591A\u5C11\uFF1F',
        personalDetails: '\u4E2A\u4EBA\u4FE1\u606F',
        privateDataMessage:
            '\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u7528\u4E8E\u65C5\u884C\u548C\u652F\u4ED8\u3002\u5B83\u4EEC\u6C38\u8FDC\u4E0D\u4F1A\u663E\u793A\u5728\u60A8\u7684\u516C\u5F00\u8D44\u6599\u4E0A\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        address: '\u5730\u5740',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `\u65E5\u671F\u5E94\u65E9\u4E8E${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `\u65E5\u671F\u5E94\u665A\u4E8E${dateString}`,
            hasInvalidCharacter: '\u540D\u79F0\u53EA\u80FD\u5305\u542B\u62C9\u4E01\u5B57\u7B26',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) =>
                `\u90AE\u653F\u7F16\u7801\u683C\u5F0F\u4E0D\u6B63\u786E${zipFormat ? `\u53EF\u63A5\u53D7\u7684\u683C\u5F0F\uFF1A${zipFormat}` : ''}`,
            invalidPhoneNumber: `\u8BF7\u786E\u4FDD\u7535\u8BDD\u53F7\u7801\u6709\u6548\uFF08\u4F8B\u5982 ${CONST.EXAMPLE_PHONE_NUMBER}\uFF09`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '\u94FE\u63A5\u5DF2\u91CD\u65B0\u53D1\u9001',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `\u6211\u5DF2\u53D1\u9001\u4E00\u4E2A\u9B54\u6CD5\u767B\u5F55\u94FE\u63A5\u5230${login}\u3002\u8BF7\u68C0\u67E5\u60A8\u7684${loginType}\u4EE5\u767B\u5F55\u3002`,
        resendLink: '\u91CD\u65B0\u53D1\u9001\u94FE\u63A5',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `\u8981\u9A8C\u8BC1${secondaryLogin}\uFF0C\u8BF7\u4ECE${primaryLogin}\u7684\u8D26\u6237\u8BBE\u7F6E\u4E2D\u91CD\u65B0\u53D1\u9001\u9B54\u6CD5\u4EE3\u7801\u3002`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) =>
            `\u5982\u679C\u60A8\u4E0D\u518D\u80FD\u8BBF\u95EE${primaryLogin}\uFF0C\u8BF7\u53D6\u6D88\u94FE\u63A5\u60A8\u7684\u8D26\u6237\u3002`,
        unlink: '\u53D6\u6D88\u94FE\u63A5',
        linkSent: '\u94FE\u63A5\u5DF2\u53D1\u9001\uFF01',
        successfullyUnlinkedLogin: '\u6B21\u8981\u767B\u5F55\u5DF2\u6210\u529F\u53D6\u6D88\u5173\u8054\uFF01',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `\u7531\u4E8E\u53D1\u9001\u95EE\u9898\uFF0C\u6211\u4EEC\u7684\u7535\u5B50\u90AE\u4EF6\u63D0\u4F9B\u5546\u5DF2\u6682\u65F6\u6682\u505C\u5411${login}\u53D1\u9001\u7535\u5B50\u90AE\u4EF6\u3002\u8981\u89E3\u9664\u5BF9\u60A8\u767B\u5F55\u7684\u963B\u6B62\uFF0C\u8BF7\u6309\u7167\u4EE5\u4E0B\u6B65\u9AA4\u64CD\u4F5C\uFF1A`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `\u8BF7\u786E\u8BA4${login}\u7684\u62FC\u5199\u662F\u5426\u6B63\u786E\uFF0C\u5E76\u4E14\u662F\u4E00\u4E2A\u771F\u5B9E\u53EF\u6295\u9012\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740\u3002`,
        emailAliases:
            '\u50CF "expenses@domain.com" \u8FD9\u6837\u7684\u7535\u5B50\u90AE\u4EF6\u522B\u540D\u5FC5\u987B\u80FD\u591F\u8BBF\u95EE\u81EA\u5DF1\u7684\u7535\u5B50\u90AE\u7BB1\uFF0C\u624D\u80FD\u6210\u4E3A\u6709\u6548\u7684 Expensify \u767B\u5F55\u3002',
        ensureYourEmailClient: '\u786E\u4FDD\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u5BA2\u6237\u7AEF\u5141\u8BB8\u63A5\u6536\u6765\u81EA expensify.com \u7684\u90AE\u4EF6\u3002',
        youCanFindDirections: '\u60A8\u53EF\u4EE5\u627E\u5230\u6709\u5173\u5982\u4F55\u5B8C\u6210\u6B64\u6B65\u9AA4\u7684\u8BF4\u660E',
        helpConfigure: '\u4F46\u60A8\u53EF\u80FD\u9700\u8981 IT \u90E8\u95E8\u7684\u5E2E\u52A9\u6765\u914D\u7F6E\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u8BBE\u7F6E\u3002',
        onceTheAbove: '\u5B8C\u6210\u4E0A\u8FF0\u6B65\u9AA4\u540E\uFF0C\u8BF7\u8054\u7CFB',
        toUnblock: '\u4EE5\u89E3\u9664\u60A8\u767B\u5F55\u7684\u963B\u6B62\u3002',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `\u6211\u4EEC\u65E0\u6CD5\u5411${login}\u53D1\u9001\u77ED\u4FE1\uFF0C\u56E0\u6B64\u5DF2\u6682\u65F6\u6682\u505C\u3002\u8BF7\u5C1D\u8BD5\u9A8C\u8BC1\u60A8\u7684\u53F7\u7801\uFF1A`,
        validationSuccess: '\u60A8\u7684\u53F7\u7801\u5DF2\u9A8C\u8BC1\uFF01\u70B9\u51FB\u4E0B\u65B9\u53D1\u9001\u65B0\u7684\u9B54\u672F\u767B\u5F55\u4EE3\u7801\u3002',
        validationFailed: ({
            timeData,
        }: {
            timeData?: {
                days?: number;
                hours?: number;
                minutes?: number;
            } | null;
        }) => {
            if (!timeData) {
                return '\u8BF7\u7A0D\u7B49\u7247\u523B\u518D\u8BD5\u3002';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '\u5929' : '\u5929'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '\u5C0F\u65F6' : '\u5C0F\u65F6'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '\u5206\u949F' : '\u5206\u949F'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `\u8BF7\u7A0D\u7B49\uFF01\u60A8\u9700\u8981\u7B49\u5F85 ${timeText} \u540E\u624D\u80FD\u518D\u6B21\u5C1D\u8BD5\u9A8C\u8BC1\u60A8\u7684\u53F7\u7801\u3002`;
        },
    },
    welcomeSignUpForm: {
        join: '\u52A0\u5165',
    },
    detailsPage: {
        localTime: '\u672C\u5730\u65F6\u95F4',
    },
    newChatPage: {
        startGroup: '\u5F00\u59CB\u7FA4\u7EC4',
        addToGroup: '\u6DFB\u52A0\u5230\u7FA4\u7EC4',
    },
    yearPickerPage: {
        year: '\u5E74',
        selectYear: '\u8BF7\u9009\u62E9\u5E74\u4EFD',
    },
    focusModeUpdateModal: {
        title: '\u6B22\u8FCE\u8FDB\u5165#focus\u6A21\u5F0F\uFF01',
        prompt: '\u901A\u8FC7\u4EC5\u67E5\u770B\u672A\u8BFB\u804A\u5929\u6216\u9700\u8981\u60A8\u6CE8\u610F\u7684\u804A\u5929\u6765\u4FDD\u6301\u638C\u63A7\u3002\u4E0D\u7528\u62C5\u5FC3\uFF0C\u60A8\u53EF\u4EE5\u968F\u65F6\u66F4\u6539\u6B64\u8BBE\u7F6E\u3002',
        settings: '\u8BBE\u7F6E',
    },
    notFound: {
        chatYouLookingForCannotBeFound: '\u60A8\u8981\u67E5\u627E\u7684\u804A\u5929\u8BB0\u5F55\u65E0\u6CD5\u627E\u5230\u3002',
        getMeOutOfHere: '\u5E26\u6211\u79BB\u5F00\u8FD9\u91CC',
        iouReportNotFound: '\u60A8\u6B63\u5728\u5BFB\u627E\u7684\u4ED8\u6B3E\u8BE6\u60C5\u65E0\u6CD5\u627E\u5230\u3002',
        notHere: '\u55EF\u2026\u2026\u5B83\u4E0D\u5728\u8FD9\u91CC',
        pageNotFound: '\u62B1\u6B49\uFF0C\u65E0\u6CD5\u627E\u5230\u6B64\u9875\u9762\u3002',
        noAccess:
            '\u6B64\u804A\u5929\u6216\u8D39\u7528\u53EF\u80FD\u5DF2\u88AB\u5220\u9664\uFF0C\u6216\u8005\u60A8\u65E0\u6743\u8BBF\u95EE\u3002\n\n\u5982\u6709\u4EFB\u4F55\u7591\u95EE\uFF0C\u8BF7\u8054\u7CFB concierge@expensify.com',
        goBackHome: '\u8FD4\u56DE\u4E3B\u9875',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `\u7CDF\u7CD5... ${isBreakLine ? '\n' : ''}\u51FA\u73B0\u4E86\u95EE\u9898`,
        subtitle: '\u60A8\u7684\u8BF7\u6C42\u65E0\u6CD5\u5B8C\u6210\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
    },
    setPasswordPage: {
        enterPassword: '\u8F93\u5165\u5BC6\u7801',
        setPassword: '\u8BBE\u7F6E\u5BC6\u7801',
        newPasswordPrompt:
            '\u60A8\u7684\u5BC6\u7801\u5FC5\u987B\u81F3\u5C11\u5305\u542B8\u4E2A\u5B57\u7B26\uFF0C1\u4E2A\u5927\u5199\u5B57\u6BCD\uFF0C1\u4E2A\u5C0F\u5199\u5B57\u6BCD\u548C1\u4E2A\u6570\u5B57\u3002',
        passwordFormTitle: '\u6B22\u8FCE\u56DE\u5230 New Expensify\uFF01\u8BF7\u8BBE\u7F6E\u60A8\u7684\u5BC6\u7801\u3002',
        passwordNotSet:
            '\u6211\u4EEC\u65E0\u6CD5\u8BBE\u7F6E\u60A8\u7684\u65B0\u5BC6\u7801\u3002\u6211\u4EEC\u5DF2\u53D1\u9001\u65B0\u7684\u5BC6\u7801\u94FE\u63A5\u4F9B\u60A8\u91CD\u8BD5\u3002',
        setPasswordLinkInvalid:
            '\u6B64\u8BBE\u7F6E\u5BC6\u7801\u7684\u94FE\u63A5\u65E0\u6548\u6216\u5DF2\u8FC7\u671F\u3002\u65B0\u7684\u94FE\u63A5\u5DF2\u53D1\u9001\u5230\u60A8\u7684\u7535\u5B50\u90AE\u7BB1\uFF01',
        validateAccount: '\u9A8C\u8BC1\u8D26\u6237',
    },
    statusPage: {
        status: '\u72B6\u6001',
        statusExplanation:
            '\u6DFB\u52A0\u4E00\u4E2A\u8868\u60C5\u7B26\u53F7\uFF0C\u8BA9\u4F60\u7684\u540C\u4E8B\u548C\u670B\u53CB\u8F7B\u677E\u4E86\u89E3\u53D1\u751F\u4E86\u4EC0\u4E48\u3002\u4F60\u4E5F\u53EF\u4EE5\u9009\u62E9\u6027\u5730\u6DFB\u52A0\u4E00\u6761\u6D88\u606F\uFF01',
        today: '\u4ECA\u5929',
        clearStatus: '\u6E05\u9664\u72B6\u6001',
        save: '\u4FDD\u5B58',
        message: '\u6D88\u606F',
        timePeriods: {
            never: '\u4ECE\u4E0D',
            thirtyMinutes: '30\u5206\u949F',
            oneHour: '1\u5C0F\u65F6',
            afterToday: '\u4ECA\u5929',
            afterWeek: '\u4E00\u5468',
            custom: 'Custom',
        },
        untilTomorrow: '\u76F4\u5230\u660E\u5929',
        untilTime: ({time}: UntilTimeParams) => `\u76F4\u5230${time}`,
        date: '\u65E5\u671F',
        time: '\u65F6\u95F4',
        clearAfter: '\u6E05\u9664\u540E',
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
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
        accountEnding: '\u8D26\u6237\u672B\u5C3E\u4E3A',
        thisBankAccount: '\u6B64\u94F6\u884C\u8D26\u6237\u5C06\u7528\u4E8E\u60A8\u5DE5\u4F5C\u533A\u7684\u4E1A\u52A1\u4ED8\u6B3E\u3002',
        accountNumber: '\u8D26\u53F7',
        routingNumber: '\u8DEF\u7531\u53F7\u7801',
        chooseAnAccountBelow: '\u9009\u62E9\u4EE5\u4E0B\u8D26\u6237\u4E4B\u4E00',
        addBankAccount: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
        chooseAnAccount: '\u9009\u62E9\u4E00\u4E2A\u8D26\u6237',
        connectOnlineWithPlaid: '\u767B\u5F55\u60A8\u7684\u94F6\u884C',
        connectManually: '\u624B\u52A8\u8FDE\u63A5',
        desktopConnection:
            '\u6CE8\u610F\uFF1A\u8981\u8FDE\u63A5Chase\u3001Wells Fargo\u3001Capital One\u6216Bank of America\uFF0C\u8BF7\u70B9\u51FB\u6B64\u5904\u5728\u6D4F\u89C8\u5668\u4E2D\u5B8C\u6210\u6B64\u8FC7\u7A0B\u3002',
        yourDataIsSecure: '\u60A8\u7684\u6570\u636E\u662F\u5B89\u5168\u7684',
        toGetStarted:
            '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4EE5\u62A5\u9500\u8D39\u7528\u3001\u53D1\u884CExpensify\u5361\u3001\u6536\u53D6\u53D1\u7968\u4ED8\u6B3E\u548C\u652F\u4ED8\u8D26\u5355\uFF0C\u6240\u6709\u64CD\u4F5C\u5747\u53EF\u5728\u4E00\u4E2A\u5730\u65B9\u5B8C\u6210\u3002',
        plaidBodyCopy:
            '\u4E3A\u60A8\u7684\u5458\u5DE5\u63D0\u4F9B\u4E00\u79CD\u66F4\u7B80\u5355\u7684\u65B9\u5F0F\u6765\u652F\u4ED8\u516C\u53F8\u8D39\u7528\u5E76\u83B7\u5F97\u62A5\u9500\u3002',
        checkHelpLine: '\u60A8\u7684\u8DEF\u7531\u53F7\u7801\u548C\u8D26\u6237\u53F7\u7801\u53EF\u4EE5\u5728\u8BE5\u8D26\u6237\u7684\u652F\u7968\u4E0A\u627E\u5230\u3002',
        hasPhoneLoginError: {
            phrase1: '\u8981\u8FDE\u63A5\u94F6\u884C\u8D26\u6237\uFF0C\u8BF7',
            link: '\u6DFB\u52A0\u4E00\u4E2A\u7535\u5B50\u90AE\u4EF6\u4F5C\u4E3A\u60A8\u7684\u4E3B\u8981\u767B\u5F55\u65B9\u5F0F',
            phrase2: '\u5E76\u91CD\u8BD5\u3002\u60A8\u53EF\u4EE5\u6DFB\u52A0\u60A8\u7684\u7535\u8BDD\u53F7\u7801\u4F5C\u4E3A\u8F85\u52A9\u767B\u5F55\u3002',
        },
        hasBeenThrottledError: '\u6DFB\u52A0\u60A8\u7684\u94F6\u884C\u8D26\u6237\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u7A0D\u7B49\u51E0\u5206\u949F\uFF0C\u7136\u540E\u91CD\u8BD5\u3002',
        hasCurrencyError: {
            phrase1:
                '\u54CE\u5440\uFF01\u60A8\u7684\u5DE5\u4F5C\u533A\u8D27\u5E01\u4F3C\u4E4E\u8BBE\u7F6E\u4E3A\u975E\u7F8E\u5143\u7684\u5176\u4ED6\u8D27\u5E01\u3002\u8981\u7EE7\u7EED\uFF0C\u8BF7\u524D\u5F80',
            link: '\u60A8\u7684\u5DE5\u4F5C\u533A\u8BBE\u7F6E',
            phrase2: '\u5C06\u5176\u8BBE\u7F6E\u4E3A\u7F8E\u5143\uFF0C\u7136\u540E\u91CD\u8BD5\u3002',
        },
        error: {
            youNeedToSelectAnOption: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u9009\u9879\u7EE7\u7EED',
            noBankAccountAvailable: '\u62B1\u6B49\uFF0C\u6CA1\u6709\u53EF\u7528\u7684\u94F6\u884C\u8D26\u6237\u3002',
            noBankAccountSelected: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u8D26\u6237',
            taxID: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7A0E\u53F7',
            website: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u6709\u6548\u7684\u7F51\u7AD9',
            zipCode: `\u8BF7\u8F93\u5165\u6709\u6548\u7684\u90AE\u653F\u7F16\u7801\uFF0C\u683C\u5F0F\u4E3A\uFF1A${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u8BDD\u53F7\u7801',
            email: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
            companyName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u516C\u53F8\u540D\u79F0',
            addressCity: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u6709\u6548\u7684\u57CE\u5E02\u540D\u79F0',
            addressStreet: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8857\u9053\u5730\u5740',
            addressState: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u5DDE',
            incorporationDateFuture: '\u6210\u7ACB\u65E5\u671F\u4E0D\u80FD\u662F\u672A\u6765\u7684\u65E5\u671F',
            incorporationState: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u5DDE',
            industryCode: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u6709\u6548\u7684\u516D\u4F4D\u6570\u884C\u4E1A\u5206\u7C7B\u4EE3\u7801',
            restrictedBusiness: '\u8BF7\u786E\u8BA4\u8BE5\u4F01\u4E1A\u4E0D\u5728\u53D7\u9650\u4F01\u4E1A\u540D\u5355\u4E0A\u3002',
            routingNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8DEF\u7531\u53F7\u7801',
            accountNumber: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8D26\u53F7',
            routingAndAccountNumberCannotBeSame: '\u8DEF\u7531\u53F7\u7801\u548C\u8D26\u6237\u53F7\u7801\u4E0D\u80FD\u5339\u914D',
            companyType: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u516C\u53F8\u7C7B\u578B',
            tooManyAttempts:
                '\u7531\u4E8E\u767B\u5F55\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u6B64\u9009\u9879\u5DF2\u88AB\u7981\u752824\u5C0F\u65F6\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\uFF0C\u6216\u624B\u52A8\u8F93\u5165\u8BE6\u7EC6\u4FE1\u606F\u3002',
            address: '\u8BF7\u8F93\u5165\u6709\u6548\u5730\u5740',
            dob: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u51FA\u751F\u65E5\u671F',
            age: '\u5FC5\u987B\u5E74\u6EE118\u5C81',
            ssnLast4: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u793E\u4F1A\u5B89\u5168\u53F7\u7801\u540E\u56DB\u4F4D\u6570\u5B57',
            firstName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u540D\u5B57',
            lastName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u59D3\u6C0F',
            noDefaultDepositAccountOrDebitCardAvailable: '\u8BF7\u6DFB\u52A0\u4E00\u4E2A\u9ED8\u8BA4\u7684\u5B58\u6B3E\u8D26\u6237\u6216\u501F\u8BB0\u5361',
            validationAmounts:
                '\u60A8\u8F93\u5165\u7684\u9A8C\u8BC1\u91D1\u989D\u4E0D\u6B63\u786E\u3002\u8BF7\u4ED4\u7EC6\u68C0\u67E5\u60A8\u7684\u94F6\u884C\u5BF9\u8D26\u5355\uFF0C\u7136\u540E\u91CD\u8BD5\u3002',
            fullName: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u5168\u540D',
            ownershipPercentage: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u6709\u6548\u7684\u767E\u5206\u6BD4\u6570\u5B57',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '\u60A8\u7684\u94F6\u884C\u8D26\u6237\u5728\u54EA\u91CC\uFF1F',
        accountDetailsStepHeader: '\u60A8\u7684\u8D26\u6237\u8BE6\u60C5\u662F\u4EC0\u4E48\uFF1F',
        accountTypeStepHeader: '\u8FD9\u662F\u4EC0\u4E48\u7C7B\u578B\u7684\u8D26\u6237\uFF1F',
        bankInformationStepHeader: '\u4F60\u7684\u94F6\u884C\u8BE6\u7EC6\u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F',
        accountHolderInformationStepHeader: '\u8D26\u6237\u6301\u6709\u4EBA\u8BE6\u60C5\u662F\u4EC0\u4E48\uFF1F',
        howDoWeProtectYourData: '\u6211\u4EEC\u5982\u4F55\u4FDD\u62A4\u60A8\u7684\u6570\u636E\uFF1F',
        currencyHeader: '\u60A8\u7684\u94F6\u884C\u8D26\u6237\u7684\u8D27\u5E01\u662F\u4EC0\u4E48\uFF1F',
        confirmationStepHeader: '\u68C0\u67E5\u60A8\u7684\u4FE1\u606F\u3002',
        confirmationStepSubHeader: '\u8BF7\u4ED4\u7EC6\u6838\u5BF9\u4EE5\u4E0B\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u5E76\u52FE\u9009\u6761\u6B3E\u6846\u4EE5\u786E\u8BA4\u3002',
    },
    addPersonalBankAccountPage: {
        enterPassword: '\u8F93\u5165Expensify\u5BC6\u7801',
        alreadyAdded: '\u6B64\u8D26\u6237\u5DF2\u88AB\u6DFB\u52A0\u3002',
        chooseAccountLabel: '\u8D26\u6237',
        successTitle: '\u4E2A\u4EBA\u94F6\u884C\u8D26\u6237\u5DF2\u6DFB\u52A0\uFF01',
        successMessage: '\u606D\u559C\uFF0C\u60A8\u7684\u94F6\u884C\u8D26\u6237\u5DF2\u8BBE\u7F6E\u5B8C\u6BD5\uFF0C\u53EF\u4EE5\u63A5\u6536\u62A5\u9500\u6B3E\u9879\u3002',
    },
    attachmentView: {
        unknownFilename: '\u672A\u77E5\u6587\u4EF6\u540D',
        passwordRequired: '\u8BF7\u8F93\u5165\u5BC6\u7801',
        passwordIncorrect: '\u5BC6\u7801\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
        failedToLoadPDF: '\u65E0\u6CD5\u52A0\u8F7DPDF\u6587\u4EF6',
        pdfPasswordForm: {
            title: '\u53D7\u5BC6\u7801\u4FDD\u62A4\u7684PDF\u6587\u4EF6',
            infoText: '\u6B64 PDF \u53D7\u5BC6\u7801\u4FDD\u62A4\u3002',
            beforeLinkText: '\u8BF7',
            linkText: '\u8F93\u5165\u5BC6\u7801',
            afterLinkText: '\u67E5\u770B\u3002',
            formLabel: '\u67E5\u770B PDF',
        },
        attachmentNotFound: '\u9644\u4EF6\u672A\u627E\u5230',
    },
    messages: {
        errorMessageInvalidPhone: `\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u8BDD\u53F7\u7801\uFF0C\u4E0D\u8981\u4F7F\u7528\u62EC\u53F7\u6216\u7834\u6298\u53F7\u3002\u5982\u679C\u60A8\u5728\u7F8E\u56FD\u4EE5\u5916\uFF0C\u8BF7\u5305\u62EC\u60A8\u7684\u56FD\u5BB6\u4EE3\u7801\uFF08\u4F8B\u5982 ${CONST.EXAMPLE_PHONE_NUMBER}\uFF09\u3002`,
        errorMessageInvalidEmail: '\u65E0\u6548\u7684\u7535\u5B50\u90AE\u4EF6',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} \u5DF2\u7ECF\u662F ${name} \u7684\u6210\u5458`,
    },
    onfidoStep: {
        acceptTerms: '\u901A\u8FC7\u7EE7\u7EED\u8BF7\u6C42\u6FC0\u6D3B\u60A8\u7684Expensify\u94B1\u5305\uFF0C\u60A8\u786E\u8BA4\u60A8\u5DF2\u9605\u8BFB\u3001\u7406\u89E3\u5E76\u63A5\u53D7',
        facialScan: 'Onfido\u7684\u9762\u90E8\u626B\u63CF\u653F\u7B56\u548C\u53D1\u5E03',
        tryAgain: '\u518D\u8BD5\u4E00\u6B21',
        verifyIdentity: '\u9A8C\u8BC1\u8EAB\u4EFD',
        letsVerifyIdentity: '\u8BA9\u6211\u4EEC\u9A8C\u8BC1\u60A8\u7684\u8EAB\u4EFD',
        butFirst: `\u4F46\u9996\u5148\uFF0C\u662F\u4E00\u4E9B\u65E0\u804A\u7684\u5185\u5BB9\u3002\u8BF7\u5728\u4E0B\u4E00\u6B65\u9605\u8BFB\u6CD5\u5F8B\u6761\u6B3E\uFF0C\u5E76\u5728\u51C6\u5907\u597D\u65F6\u70B9\u51FB\u201C\u63A5\u53D7\u201D\u3002`,
        genericError: '\u5904\u7406\u6B64\u6B65\u9AA4\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        cameraPermissionsNotGranted: '\u542F\u7528\u76F8\u673A\u8BBF\u95EE\u6743\u9650',
        cameraRequestMessage:
            '\u6211\u4EEC\u9700\u8981\u8BBF\u95EE\u60A8\u7684\u76F8\u673A\u4EE5\u5B8C\u6210\u94F6\u884C\u8D26\u6237\u9A8C\u8BC1\u3002\u8BF7\u901A\u8FC7\u8BBE\u7F6E > New Expensify \u542F\u7528\u3002',
        microphonePermissionsNotGranted: '\u542F\u7528\u9EA6\u514B\u98CE\u8BBF\u95EE\u6743\u9650',
        microphoneRequestMessage:
            '\u6211\u4EEC\u9700\u8981\u8BBF\u95EE\u60A8\u7684\u9EA6\u514B\u98CE\u4EE5\u5B8C\u6210\u94F6\u884C\u8D26\u6237\u9A8C\u8BC1\u3002\u8BF7\u901A\u8FC7\u8BBE\u7F6E > New Expensify \u542F\u7528\u3002',
        originalDocumentNeeded: '\u8BF7\u4E0A\u4F20\u60A8\u7684\u8EAB\u4EFD\u8BC1\u539F\u4EF6\u7167\u7247\uFF0C\u800C\u4E0D\u662F\u622A\u56FE\u6216\u626B\u63CF\u56FE\u50CF\u3002',
        documentNeedsBetterQuality:
            '\u60A8\u7684\u8EAB\u4EFD\u8BC1\u4F3C\u4E4E\u5DF2\u635F\u574F\u6216\u7F3A\u5C11\u5B89\u5168\u7279\u5F81\u3002\u8BF7\u4E0A\u4F20\u4E00\u5F20\u5B8C\u6574\u53EF\u89C1\u4E14\u672A\u635F\u574F\u7684\u8EAB\u4EFD\u8BC1\u539F\u59CB\u56FE\u50CF\u3002',
        imageNeedsBetterQuality:
            '\u60A8\u7684\u8EAB\u4EFD\u8BC1\u56FE\u50CF\u8D28\u91CF\u6709\u95EE\u9898\u3002\u8BF7\u4E0A\u4F20\u4E00\u5F20\u53EF\u4EE5\u6E05\u6670\u770B\u5230\u6574\u4E2A\u8EAB\u4EFD\u8BC1\u7684\u65B0\u56FE\u50CF\u3002',
        selfieIssue: '\u60A8\u7684\u81EA\u62CD/\u89C6\u9891\u6709\u95EE\u9898\u3002\u8BF7\u4E0A\u4F20\u4E00\u4E2A\u5B9E\u65F6\u81EA\u62CD/\u89C6\u9891\u3002',
        selfieNotMatching:
            '\u60A8\u7684\u81EA\u62CD/\u89C6\u9891\u4E0E\u60A8\u7684\u8EAB\u4EFD\u8BC1\u4E0D\u5339\u914D\u3002\u8BF7\u4E0A\u4F20\u4E00\u5F20\u65B0\u7684\u81EA\u62CD/\u89C6\u9891\uFF0C\u786E\u4FDD\u60A8\u7684\u8138\u90E8\u6E05\u6670\u53EF\u89C1\u3002',
        selfieNotLive:
            '\u60A8\u7684\u81EA\u62CD/\u89C6\u9891\u4F3C\u4E4E\u4E0D\u662F\u5B9E\u65F6\u7167\u7247/\u89C6\u9891\u3002\u8BF7\u4E0A\u4F20\u5B9E\u65F6\u81EA\u62CD/\u89C6\u9891\u3002',
    },
    additionalDetailsStep: {
        headerTitle: '\u989D\u5916\u8BE6\u60C5',
        helpText: '\u5728\u60A8\u53EF\u4EE5\u4ECE\u94B1\u5305\u53D1\u9001\u548C\u63A5\u6536\u8D44\u91D1\u4E4B\u524D\uFF0C\u6211\u4EEC\u9700\u8981\u786E\u8BA4\u4EE5\u4E0B\u4FE1\u606F\u3002',
        helpTextIdologyQuestions: '\u6211\u4EEC\u9700\u8981\u518D\u95EE\u60A8\u51E0\u4E2A\u95EE\u9898\u4EE5\u5B8C\u6210\u60A8\u7684\u8EAB\u4EFD\u9A8C\u8BC1\u3002',
        helpLink: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u6211\u4EEC\u4E3A\u4EC0\u4E48\u9700\u8981\u8FD9\u4E2A\u7684\u4FE1\u606F\u3002',
        legalFirstNameLabel: '\u6CD5\u5B9A\u540D\u5B57',
        legalMiddleNameLabel: '\u6CD5\u5B9A\u4E2D\u95F4\u540D',
        legalLastNameLabel: '\u6CD5\u5B9A\u59D3\u6C0F',
        selectAnswer: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u54CD\u5E94\u4EE5\u7EE7\u7EED',
        ssnFull9Error: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u4E5D\u4F4D\u6570SSN',
        needSSNFull9: '\u6211\u4EEC\u5728\u9A8C\u8BC1\u60A8\u7684SSN\u65F6\u9047\u5230\u4E86\u95EE\u9898\u3002\u8BF7\u8F93\u5165\u60A8SSN\u7684\u5B8C\u6574\u4E5D\u4F4D\u6570\u5B57\u3002',
        weCouldNotVerify: '\u6211\u4EEC\u65E0\u6CD5\u9A8C\u8BC1',
        pleaseFixIt: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u4FEE\u6B63\u6B64\u4FE1\u606F',
        failedKYCTextBefore: '\u6211\u4EEC\u65E0\u6CD5\u9A8C\u8BC1\u60A8\u7684\u8EAB\u4EFD\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216\u8054\u7CFB',
        failedKYCTextAfter: '\u5982\u679C\u60A8\u6709\u4EFB\u4F55\u95EE\u9898\u3002',
    },
    termsStep: {
        headerTitle: '\u6761\u6B3E\u548C\u8D39\u7528',
        headerTitleRefactor: '\u8D39\u7528\u548C\u6761\u6B3E',
        haveReadAndAgree: '\u6211\u5DF2\u9605\u8BFB\u5E76\u540C\u610F\u63A5\u6536',
        electronicDisclosures: '\u7535\u5B50\u62AB\u9732',
        agreeToThe: '\u6211\u540C\u610F',
        walletAgreement: '\u94B1\u5305\u534F\u8BAE',
        enablePayments: '\u542F\u7528\u652F\u4ED8',
        monthlyFee: '\u6708\u8D39',
        inactivity: '\u4E0D\u6D3B\u52A8',
        noOverdraftOrCredit: '\u65E0\u900F\u652F/\u4FE1\u7528\u529F\u80FD\u3002',
        electronicFundsWithdrawal: '\u7535\u5B50\u8D44\u91D1\u63D0\u53D6',
        standard: '\u6807\u51C6',
        reviewTheFees: '\u67E5\u770B\u4E00\u4E9B\u8D39\u7528\u3002',
        checkTheBoxes: '\u8BF7\u52FE\u9009\u4E0B\u9762\u7684\u6846\u3002',
        agreeToTerms: '\u540C\u610F\u6761\u6B3E\u540E\uFF0C\u60A8\u5C31\u53EF\u4EE5\u5F00\u59CB\u4E86\uFF01',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify \u94B1\u5305\u7531 ${walletProgram} \u53D1\u884C\u3002`,
            perPurchase: '\u6BCF\u6B21\u8D2D\u4E70',
            atmWithdrawal: 'ATM\u53D6\u6B3E',
            cashReload: '\u73B0\u91D1\u5145\u503C',
            inNetwork: '\u7F51\u7EDC\u5185',
            outOfNetwork: '\u975E\u7F51\u7EDC\u5185',
            atmBalanceInquiry: 'ATM\u4F59\u989D\u67E5\u8BE2',
            inOrOutOfNetwork: '\uFF08\u7F51\u7EDC\u5185\u6216\u7F51\u7EDC\u5916\uFF09',
            customerService: '\u5BA2\u6237\u670D\u52A1',
            automatedOrLive: '\uFF08\u81EA\u52A8\u6216\u4EBA\u5DE5\u5BA2\u670D\uFF09',
            afterTwelveMonths: '\uFF0812\u4E2A\u6708\u65E0\u4EA4\u6613\u540E\uFF09',
            weChargeOneFee: '\u6211\u4EEC\u6536\u53D6\u53E6\u5916\u4E00\u79CD\u8D39\u7528\u3002\u5B83\u662F\uFF1A',
            fdicInsurance: '\u60A8\u7684\u8D44\u91D1\u7B26\u5408FDIC\u4FDD\u9669\u8D44\u683C\u3002',
            generalInfo: '\u6709\u5173\u9884\u4ED8\u8D26\u6237\u7684\u4E00\u822C\u4FE1\u606F\uFF0C\u8BF7\u8BBF\u95EE',
            conditionsDetails: '\u6709\u5173\u6240\u6709\u8D39\u7528\u548C\u670D\u52A1\u7684\u8BE6\u7EC6\u4FE1\u606F\u548C\u6761\u4EF6\uFF0C\u8BF7\u8BBF\u95EE',
            conditionsPhone: '\u6216\u62E8\u6253 +1 833-400-0904\u3002',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Expensify Wallet\u8D39\u7528\u6E05\u5355',
            typeOfFeeHeader: '\u6240\u6709\u8D39\u7528',
            feeAmountHeader: '\u91D1\u989D',
            moreDetailsHeader: '\u8BE6\u60C5',
            openingAccountTitle: '\u5F00\u8BBE\u8D26\u6237',
            openingAccountDetails: '\u5F00\u8BBE\u8D26\u6237\u6CA1\u6709\u8D39\u7528\u3002',
            monthlyFeeDetails: '\u6CA1\u6709\u6708\u8D39\u3002',
            customerServiceTitle: '\u5BA2\u6237\u670D\u52A1',
            customerServiceDetails: '\u6CA1\u6709\u5BA2\u6237\u670D\u52A1\u8D39\u7528\u3002',
            inactivityDetails: '\u6CA1\u6709\u4E0D\u6D3B\u8DC3\u8D39\u7528\u3002',
            sendingFundsTitle: '\u5C06\u8D44\u91D1\u53D1\u9001\u5230\u53E6\u4E00\u4E2A\u8D26\u6237\u6301\u6709\u4EBA',
            sendingFundsDetails:
                '\u4F7F\u7528\u60A8\u7684\u4F59\u989D\u3001\u94F6\u884C\u8D26\u6237\u6216\u501F\u8BB0\u5361\u5411\u5176\u4ED6\u8D26\u6237\u6301\u6709\u4EBA\u53D1\u9001\u8D44\u91D1\u662F\u6CA1\u6709\u8D39\u7528\u7684\u3002',
            electronicFundsStandardDetails:
                "There's no fee to transfer funds from your Expensify Wallet " +
                'to your bank account using the standard option. This transfer usually completes within 1-3 business' +
                ' days.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                "There's a fee to transfer funds from your Expensify Wallet to " +
                'your linked debit card using the instant transfer option. This transfer usually completes within ' +
                `several minutes. The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                'Your funds are eligible for FDIC insurance. Your funds will be held at or ' +
                `transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution. Once there, your funds are insured up ` +
                `to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements ` +
                `are met and your card is registered. See`,
            fdicInsuranceBancorp2: '\u8BE6\u60C5\u3002',
            contactExpensifyPayments: `\u901A\u8FC7\u62E8\u6253 +1 833-400-0904 \u6216\u53D1\u9001\u7535\u5B50\u90AE\u4EF6\u8054\u7CFB ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}`,
            contactExpensifyPayments2: '\u6216\u767B\u5F55\u5728',
            generalInformation: '\u6709\u5173\u9884\u4ED8\u8D26\u6237\u7684\u4E00\u822C\u4FE1\u606F\uFF0C\u8BF7\u8BBF\u95EE',
            generalInformation2:
                '\u5982\u679C\u60A8\u5BF9\u9884\u4ED8\u8D26\u6237\u6709\u6295\u8BC9\uFF0C\u8BF7\u81F4\u7535\u6D88\u8D39\u8005\u91D1\u878D\u4FDD\u62A4\u5C40\uFF0C\u7535\u8BDD\uFF1A1-855-411-2372\uFF0C\u6216\u8BBF\u95EE',
            printerFriendlyView: '\u67E5\u770B\u6253\u5370\u53CB\u597D\u7248\u672C',
            automated: '\u81EA\u52A8\u5316\u7684',
            liveAgent: '\u5B9E\u65F6\u5BA2\u670D\u4EE3\u7406',
            instant: '\u5373\u65F6',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `\u6700\u5C0F ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '\u542F\u7528\u652F\u4ED8',
        activatedTitle: '\u94B1\u5305\u5DF2\u6FC0\u6D3B\uFF01',
        activatedMessage: '\u606D\u559C\uFF0C\u60A8\u7684\u94B1\u5305\u5DF2\u8BBE\u7F6E\u5B8C\u6BD5\uFF0C\u53EF\u4EE5\u8FDB\u884C\u652F\u4ED8\u3002',
        checkBackLaterTitle: '\u7A0D\u7B49\u4E00\u4E0B...',
        checkBackLaterMessage: '\u6211\u4EEC\u4ECD\u5728\u5BA1\u6838\u60A8\u7684\u4FE1\u606F\u3002\u8BF7\u7A0D\u540E\u518D\u67E5\u770B\u3002',
        continueToPayment: '\u7EE7\u7EED\u4ED8\u6B3E',
        continueToTransfer: '\u7EE7\u7EED\u8F6C\u8D26',
    },
    companyStep: {
        headerTitle: '\u516C\u53F8\u4FE1\u606F',
        subtitle: '\u5FEB\u5B8C\u6210\u4E86\uFF01\u51FA\u4E8E\u5B89\u5168\u8003\u8651\uFF0C\u6211\u4EEC\u9700\u8981\u786E\u8BA4\u4E00\u4E9B\u4FE1\u606F\uFF1A',
        legalBusinessName: '\u6CD5\u5B9A\u516C\u53F8\u540D\u79F0',
        companyWebsite: '\u516C\u53F8\u7F51\u7AD9',
        taxIDNumber: '\u7A0E\u53F7',
        taxIDNumberPlaceholder: '9\u4F4D\u6570\u5B57',
        companyType: '\u516C\u53F8\u7C7B\u578B',
        incorporationDate: '\u6210\u7ACB\u65E5\u671F',
        incorporationState: '\u6CE8\u518C\u5DDE',
        industryClassificationCode: '\u884C\u4E1A\u5206\u7C7B\u4EE3\u7801',
        confirmCompanyIsNot: '\u6211\u786E\u8BA4\u8FD9\u5BB6\u516C\u53F8\u4E0D\u5728',
        listOfRestrictedBusinesses: '\u53D7\u9650\u4E1A\u52A1\u5217\u8868',
        incorporationDatePlaceholder: '\u5F00\u59CB\u65E5\u671F (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: '\u5408\u4F5C\u4F19\u4F34\u5173\u7CFB',
            COOPERATIVE: '\u5408\u4F5C',
            SOLE_PROPRIETORSHIP: '\u72EC\u8D44\u4F01\u4E1A',
            OTHER: '\u5176\u4ED6',
        },
        industryClassification: '\u8BE5\u4F01\u4E1A\u5C5E\u4E8E\u54EA\u4E2A\u884C\u4E1A\uFF1F',
        industryClassificationCodePlaceholder: '\u641C\u7D22\u884C\u4E1A\u5206\u7C7B\u4EE3\u7801',
    },
    requestorStep: {
        headerTitle: '\u4E2A\u4EBA\u4FE1\u606F',
        learnMore: '\u4E86\u89E3\u66F4\u591A',
        isMyDataSafe: '\u6211\u7684\u6570\u636E\u5B89\u5168\u5417\uFF1F',
    },
    personalInfoStep: {
        personalInfo: '\u4E2A\u4EBA\u4FE1\u606F',
        enterYourLegalFirstAndLast: '\u60A8\u7684\u6CD5\u5B9A\u59D3\u540D\u662F\u4EC0\u4E48\uFF1F',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        enterYourDateOfBirth: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        enterTheLast4: '\u60A8\u7684\u793E\u4F1A\u5B89\u5168\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        dontWorry: '\u522B\u62C5\u5FC3\uFF0C\u6211\u4EEC\u4E0D\u4F1A\u8FDB\u884C\u4EFB\u4F55\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        last4SSN: 'SSN\u7684\u540E4\u4F4D',
        enterYourAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        address: '\u5730\u5740',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
        byAddingThisBankAccount: '\u901A\u8FC7\u6DFB\u52A0\u6B64\u94F6\u884C\u8D26\u6237\uFF0C\u60A8\u786E\u8BA4\u60A8\u5DF2\u9605\u8BFB\u3001\u7406\u89E3\u5E76\u63A5\u53D7',
        whatsYourLegalName: '\u60A8\u7684\u6CD5\u5B9A\u59D3\u540D\u662F\u4EC0\u4E48\uFF1F',
        whatsYourDOB: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        whatsYourAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        whatsYourSSN: '\u60A8\u7684\u793E\u4F1A\u5B89\u5168\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        noPersonalChecks: '\u522B\u62C5\u5FC3\uFF0C\u8FD9\u91CC\u4E0D\u4F1A\u8FDB\u884C\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        whatsYourPhoneNumber: '\u4F60\u7684\u7535\u8BDD\u53F7\u7801\u662F\u591A\u5C11\uFF1F',
        weNeedThisToVerify: '\u6211\u4EEC\u9700\u8981\u8FD9\u4E2A\u6765\u9A8C\u8BC1\u60A8\u7684\u94B1\u5305\u3002',
    },
    businessInfoStep: {
        businessInfo: '\u516C\u53F8\u4FE1\u606F',
        enterTheNameOfYourBusiness: '\u4F60\u7684\u516C\u53F8\u53EB\u4EC0\u4E48\u540D\u5B57\uFF1F',
        businessName: '\u6CD5\u5B9A\u516C\u53F8\u540D\u79F0',
        enterYourCompanyTaxIdNumber: '\u8D35\u516C\u53F8\u7684\u7A0E\u53F7\u662F\u591A\u5C11\uFF1F',
        taxIDNumber: '\u7A0E\u53F7',
        taxIDNumberPlaceholder: '9\u4F4D\u6570\u5B57',
        enterYourCompanyWebsite: '\u8D35\u516C\u53F8\u7684\u7F51\u7AD9\u662F\u4EC0\u4E48\uFF1F',
        companyWebsite: '\u516C\u53F8\u7F51\u7AD9',
        enterYourCompanyPhoneNumber: '\u8D35\u516C\u53F8\u7684\u7535\u8BDD\u53F7\u7801\u662F\u591A\u5C11\uFF1F',
        enterYourCompanyAddress: '\u8D35\u516C\u53F8\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        selectYourCompanyType: '\u8FD9\u662F\u4EC0\u4E48\u7C7B\u578B\u7684\u516C\u53F8\uFF1F',
        companyType: '\u516C\u53F8\u7C7B\u578B',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: '\u5408\u4F5C\u4F19\u4F34\u5173\u7CFB',
            COOPERATIVE: '\u5408\u4F5C',
            SOLE_PROPRIETORSHIP: '\u72EC\u8D44\u4F01\u4E1A',
            OTHER: '\u5176\u4ED6',
        },
        selectYourCompanyIncorporationDate: '\u8D35\u516C\u53F8\u7684\u6CE8\u518C\u65E5\u671F\u662F\u4EC0\u4E48\u65F6\u5019\uFF1F',
        incorporationDate: '\u6210\u7ACB\u65E5\u671F',
        incorporationDatePlaceholder: '\u5F00\u59CB\u65E5\u671F (yyyy-mm-dd)',
        incorporationState: '\u6CE8\u518C\u5DDE',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '\u60A8\u7684\u516C\u53F8\u5728\u54EA\u4E2A\u5DDE\u6CE8\u518C\u6210\u7ACB\u7684\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
        companyAddress: '\u516C\u53F8\u5730\u5740',
        listOfRestrictedBusinesses: '\u53D7\u9650\u4E1A\u52A1\u5217\u8868',
        confirmCompanyIsNot: '\u6211\u786E\u8BA4\u8FD9\u5BB6\u516C\u53F8\u4E0D\u5728',
        businessInfoTitle: '\u516C\u53F8\u4FE1\u606F',
        legalBusinessName: '\u6CD5\u5B9A\u516C\u53F8\u540D\u79F0',
        whatsTheBusinessName: '\u4F01\u4E1A\u540D\u79F0\u662F\u4EC0\u4E48\uFF1F',
        whatsTheBusinessAddress: '\u516C\u53F8\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        whatsTheBusinessContactInformation: '\u5546\u4E1A\u8054\u7CFB\u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F',
        whatsTheBusinessRegistrationNumber: '\u5546\u4E1A\u6CE8\u518C\u53F7\u7801\u662F\u591A\u5C11\uFF1F',
        whatsTheBusinessTaxIDEIN: '\u5546\u4E1A\u7A0E\u53F7/EIN/VAT/GST\u6CE8\u518C\u53F7\u662F\u591A\u5C11\uFF1F',
        whatsThisNumber: '\u8FD9\u4E2A\u53F7\u7801\u662F\u4EC0\u4E48\uFF1F',
        whereWasTheBusinessIncorporated: '\u516C\u53F8\u5728\u54EA\u91CC\u6CE8\u518C\u6210\u7ACB\u7684\uFF1F',
        whatTypeOfBusinessIsIt: '\u8FD9\u662F\u4EC0\u4E48\u7C7B\u578B\u7684\u4E1A\u52A1\uFF1F',
        whatsTheBusinessAnnualPayment: '\u4F01\u4E1A\u7684\u5E74\u5EA6\u652F\u4ED8\u603B\u989D\u662F\u591A\u5C11\uFF1F',
        whatsYourExpectedAverageReimbursements: '\u60A8\u7684\u9884\u671F\u5E73\u5747\u62A5\u9500\u91D1\u989D\u662F\u591A\u5C11\uFF1F',
        registrationNumber: '\u6CE8\u518C\u53F7\u7801',
        taxIDEIN: '\u7A0E\u53F7/EIN\u53F7\u7801',
        businessAddress: '\u516C\u53F8\u5730\u5740',
        businessType: '\u4E1A\u52A1\u7C7B\u578B',
        incorporation: '\u516C\u53F8\u6CE8\u518C',
        incorporationCountry: '\u6CE8\u518C\u56FD\u5BB6/\u5730\u533A',
        incorporationTypeName: '\u516C\u53F8\u7C7B\u578B',
        businessCategory: '\u4E1A\u52A1\u7C7B\u522B',
        annualPaymentVolume: '\u5E74\u5EA6\u4ED8\u6B3E\u91CF',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `\u4EE5${currencyCode}\u8BA1\u7B97\u7684\u5E74\u5EA6\u652F\u4ED8\u603B\u989D`,
        averageReimbursementAmount: '\u5E73\u5747\u62A5\u9500\u91D1\u989D',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `\u5E73\u5747\u62A5\u9500\u91D1\u989D\uFF08${currencyCode}\uFF09`,
        selectIncorporationType: '\u9009\u62E9\u516C\u53F8\u7C7B\u578B',
        selectBusinessCategory: '\u9009\u62E9\u4E1A\u52A1\u7C7B\u522B',
        selectAnnualPaymentVolume: '\u9009\u62E9\u5E74\u5EA6\u652F\u4ED8\u91D1\u989D',
        selectIncorporationCountry: '\u9009\u62E9\u6CE8\u518C\u56FD\u5BB6/\u5730\u533A',
        selectIncorporationState: '\u9009\u62E9\u6CE8\u518C\u5DDE',
        selectAverageReimbursement: '\u9009\u62E9\u5E73\u5747\u62A5\u9500\u91D1\u989D',
        findIncorporationType: '\u67E5\u627E\u516C\u53F8\u6CE8\u518C\u7C7B\u578B',
        findBusinessCategory: '\u67E5\u627E\u4E1A\u52A1\u7C7B\u522B',
        findAnnualPaymentVolume: '\u67E5\u627E\u5E74\u5EA6\u652F\u4ED8\u603B\u989D',
        findIncorporationState: '\u67E5\u627E\u6CE8\u518C\u5DDE',
        findAverageReimbursement: '\u67E5\u627E\u5E73\u5747\u62A5\u9500\u91D1\u989D',
        error: {
            registrationNumber: '\u8BF7\u63D0\u4F9B\u6709\u6548\u7684\u6CE8\u518C\u53F7\u7801',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: '\u60A8\u662F\u5426\u62E5\u670925%\u6216\u66F4\u591A\u7684',
        doAnyIndividualOwn25percent: '\u662F\u5426\u6709\u4EFB\u4F55\u4E2A\u4EBA\u62E5\u670925%\u6216\u66F4\u591A\u7684',
        areThereMoreIndividualsWhoOwn25percent: '\u662F\u5426\u6709\u66F4\u591A\u4E2A\u4EBA\u62E5\u670925%\u6216\u66F4\u591A\u7684',
        regulationRequiresUsToVerifyTheIdentity:
            '\u6CD5\u89C4\u8981\u6C42\u6211\u4EEC\u6838\u5B9E\u4EFB\u4F55\u62E5\u6709\u8D85\u8FC725%\u4E1A\u52A1\u7684\u4E2A\u4EBA\u7684\u8EAB\u4EFD\u3002',
        companyOwner: '\u4F01\u4E1A\u4E3B',
        enterLegalFirstAndLastName: '\u4E1A\u4E3B\u7684\u6CD5\u5B9A\u540D\u79F0\u662F\u4EC0\u4E48\uFF1F',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        enterTheDateOfBirthOfTheOwner: '\u4E1A\u4E3B\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\u65F6\u5019\uFF1F',
        enterTheLast4: '\u4E1A\u4E3B\u793E\u4F1A\u5B89\u5168\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        last4SSN: 'SSN\u7684\u540E4\u4F4D',
        dontWorry: '\u522B\u62C5\u5FC3\uFF0C\u6211\u4EEC\u4E0D\u4F1A\u8FDB\u884C\u4EFB\u4F55\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        enterTheOwnersAddress: '\u4E1A\u4E3B\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        address: '\u5730\u5740',
        byAddingThisBankAccount: '\u901A\u8FC7\u6DFB\u52A0\u6B64\u94F6\u884C\u8D26\u6237\uFF0C\u60A8\u786E\u8BA4\u60A8\u5DF2\u9605\u8BFB\u3001\u7406\u89E3\u5E76\u63A5\u53D7',
        owners: '\u6240\u6709\u8005',
    },
    ownershipInfoStep: {
        ownerInfo: '\u6240\u6709\u8005\u4FE1\u606F',
        businessOwner: '\u4F01\u4E1A\u4E3B',
        signerInfo: '\u7B7E\u7F72\u4EBA\u4FE1\u606F',
        doYouOwn: ({companyName}: CompanyNameParams) => `\u60A8\u662F\u5426\u62E5\u6709${companyName}\u768425%\u6216\u66F4\u591A\u80A1\u4EFD\uFF1F`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `\u662F\u5426\u6709\u4EFB\u4F55\u4E2A\u4EBA\u62E5\u6709${companyName}\u768425%\u6216\u66F4\u591A\u80A1\u4EFD\uFF1F`,
        regulationsRequire: '\u6CD5\u89C4\u8981\u6C42\u6211\u4EEC\u6838\u5B9E\u4EFB\u4F55\u62E5\u6709\u8D85\u8FC725%\u4E1A\u52A1\u7684\u4E2A\u4EBA\u7684\u8EAB\u4EFD\u3002',
        legalFirstName: '\u6CD5\u5B9A\u540D\u5B57',
        legalLastName: '\u6CD5\u5B9A\u59D3\u6C0F',
        whatsTheOwnersName: '\u4E1A\u4E3B\u7684\u6CD5\u5B9A\u540D\u79F0\u662F\u4EC0\u4E48\uFF1F',
        whatsYourName: '\u60A8\u7684\u6CD5\u5B9A\u59D3\u540D\u662F\u4EC0\u4E48\uFF1F',
        whatPercentage: '\u4F01\u4E1A\u4E2D\u6709\u591A\u5C11\u767E\u5206\u6BD4\u5C5E\u4E8E\u6240\u6709\u8005\uFF1F',
        whatsYoursPercentage: '\u60A8\u62E5\u6709\u8BE5\u4E1A\u52A1\u7684\u767E\u5206\u6BD4\u662F\u591A\u5C11\uFF1F',
        ownership: '\u6240\u6709\u6743',
        whatsTheOwnersDOB: '\u4E1A\u4E3B\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\u65F6\u5019\uFF1F',
        whatsYourDOB: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        whatsTheOwnersAddress: '\u4E1A\u4E3B\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        whatsYourAddress: '\u4F60\u7684\u5730\u5740\u662F\u4EC0\u4E48\uFF1F',
        whatAreTheLast: '\u4E1A\u4E3B\u793E\u4F1A\u5B89\u5168\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        whatsYourLast: '\u60A8\u7684\u793E\u4F1A\u5B89\u5168\u53F7\u7801\u7684\u6700\u540E\u56DB\u4F4D\u6570\u5B57\u662F\u4EC0\u4E48\uFF1F',
        dontWorry: '\u522B\u62C5\u5FC3\uFF0C\u6211\u4EEC\u4E0D\u4F1A\u8FDB\u884C\u4EFB\u4F55\u4E2A\u4EBA\u4FE1\u7528\u68C0\u67E5\uFF01',
        last4: 'SSN\u7684\u540E4\u4F4D',
        whyDoWeAsk: '\u6211\u4EEC\u4E3A\u4EC0\u4E48\u8981\u8BE2\u95EE\u8FD9\u4E2A\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        ownershipPercentage: '\u6240\u6709\u6743\u767E\u5206\u6BD4',
        areThereOther: ({companyName}: CompanyNameParams) => `\u662F\u5426\u6709\u5176\u4ED6\u4EBA\u62E5\u6709${companyName}\u768425%\u6216\u66F4\u591A\u80A1\u4EFD\uFF1F`,
        owners: '\u6240\u6709\u8005',
        addCertified: '\u6DFB\u52A0\u4E00\u5F20\u663E\u793A\u5B9E\u76CA\u6240\u6709\u8005\u7684\u8BA4\u8BC1\u7EC4\u7EC7\u7ED3\u6784\u56FE',
        regulationRequiresChart:
            '\u6CD5\u89C4\u8981\u6C42\u6211\u4EEC\u6536\u96C6\u4E00\u4EFD\u7ECF\u8FC7\u8BA4\u8BC1\u7684\u6240\u6709\u6743\u56FE\u526F\u672C\uFF0C\u8BE5\u56FE\u663E\u793A\u62E5\u6709\u8BE5\u4F01\u4E1A25%\u6216\u4EE5\u4E0A\u80A1\u4EFD\u7684\u6BCF\u4E2A\u4E2A\u4EBA\u6216\u5B9E\u4F53\u3002',
        uploadEntity: '\u4E0A\u4F20\u5B9E\u4F53\u6240\u6709\u6743\u56FE\u8868',
        noteEntity:
            '\u6CE8\u610F\uFF1A\u5B9E\u4F53\u6240\u6709\u6743\u56FE\u5FC5\u987B\u7531\u60A8\u7684\u4F1A\u8BA1\u5E08\u3001\u6CD5\u5F8B\u987E\u95EE\u7B7E\u7F72\u6216\u7ECF\u8FC7\u516C\u8BC1\u3002',
        certified: '\u8BA4\u8BC1\u5B9E\u4F53\u6240\u6709\u6743\u56FE\u8868',
        selectCountry: '\u9009\u62E9\u56FD\u5BB6/\u5730\u533A',
        findCountry: '\u67E5\u627E\u56FD\u5BB6',
        address: '\u5730\u5740',
        chooseFile: '\u9009\u62E9\u6587\u4EF6',
        uploadDocuments: '\u4E0A\u4F20\u9644\u52A0\u6587\u6863',
        pleaseUpload:
            '\u8BF7\u5728\u4E0B\u65B9\u4E0A\u4F20\u5176\u4ED6\u6587\u4EF6\uFF0C\u4EE5\u5E2E\u52A9\u6211\u4EEC\u9A8C\u8BC1\u60A8\u662F\u5426\u4E3A\u8BE5\u4F01\u4E1A\u5B9E\u4F53\u7684\u76F4\u63A5\u6216\u95F4\u63A525%\u6216\u4EE5\u4E0A\u7684\u6240\u6709\u8005\u3002',
        acceptedFiles:
            '\u63A5\u53D7\u7684\u6587\u4EF6\u683C\u5F0F\uFF1APDF\u3001PNG\u3001JPEG\u3002\u6BCF\u4E2A\u90E8\u5206\u7684\u6587\u4EF6\u603B\u5927\u5C0F\u4E0D\u80FD\u8D85\u8FC75 MB\u3002',
        proofOfBeneficialOwner: '\u5B9E\u76CA\u6240\u6709\u4EBA\u8BC1\u660E',
        proofOfBeneficialOwnerDescription:
            '\u8BF7\u63D0\u4F9B\u7531\u6CE8\u518C\u4F1A\u8BA1\u5E08\u3001\u516C\u8BC1\u4EBA\u6216\u5F8B\u5E08\u7B7E\u7F72\u7684\u8BC1\u660E\u548C\u7EC4\u7EC7\u7ED3\u6784\u56FE\uFF0C\u9A8C\u8BC1\u5BF9\u516C\u53F825%\u6216\u4EE5\u4E0A\u7684\u6240\u6709\u6743\u3002\u8BE5\u6587\u4EF6\u5FC5\u987B\u5728\u6700\u8FD1\u4E09\u4E2A\u6708\u5185\u7B7E\u7F72\uFF0C\u5E76\u5305\u542B\u7B7E\u7F72\u4EBA\u7684\u6267\u7167\u53F7\u7801\u3002',
        copyOfID: '\u53D7\u76CA\u6240\u6709\u4EBA\u7684\u8EAB\u4EFD\u8BC1\u590D\u5370\u4EF6',
        copyOfIDDescription: '\u4F8B\u5982\uFF1A\u62A4\u7167\u3001\u9A7E\u9A76\u6267\u7167\u7B49\u3002',
        proofOfAddress: '\u53D7\u76CA\u6240\u6709\u4EBA\u7684\u5730\u5740\u8BC1\u660E',
        proofOfAddressDescription: '\u4F8B\u5982\uFF1A\u6C34\u7535\u8D39\u8D26\u5355\u3001\u79DF\u8D41\u534F\u8BAE\u7B49\u3002',
        codiceFiscale: 'Codice fiscale/\u7A0E\u53F7',
        codiceFiscaleDescription:
            '\u8BF7\u4E0A\u4F20\u4E00\u4E2A\u73B0\u573A\u8BBF\u95EE\u7684\u89C6\u9891\u6216\u4E0E\u7B7E\u7F72\u5B98\u5458\u7684\u5F55\u97F3\u901A\u8BDD\u3002\u5B98\u5458\u5FC5\u987B\u63D0\u4F9B\uFF1A\u5168\u540D\u3001\u51FA\u751F\u65E5\u671F\u3001\u516C\u53F8\u540D\u79F0\u3001\u6CE8\u518C\u53F7\u7801\u3001\u7A0E\u53F7\u3001\u6CE8\u518C\u5730\u5740\u3001\u4E1A\u52A1\u6027\u8D28\u548C\u8D26\u6237\u7528\u9014\u3002',
    },
    validationStep: {
        headerTitle: '\u9A8C\u8BC1\u94F6\u884C\u8D26\u6237',
        buttonText: '\u5B8C\u6210\u8BBE\u7F6E',
        maxAttemptsReached: '\u7531\u4E8E\u9519\u8BEF\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u6B64\u94F6\u884C\u8D26\u6237\u7684\u9A8C\u8BC1\u5DF2\u88AB\u7981\u7528\u3002',
        description: `\u57281-2\u4E2A\u5DE5\u4F5C\u65E5\u5185\uFF0C\u6211\u4EEC\u4F1A\u4ECE\u7C7B\u4F3C\u201CExpensify, Inc. Validation\u201D\u7684\u540D\u79F0\u5411\u60A8\u7684\u94F6\u884C\u8D26\u6237\u53D1\u9001\u4E09\uFF083\uFF09\u7B14\u5C0F\u989D\u4EA4\u6613\u3002`,
        descriptionCTA: '\u8BF7\u5728\u4E0B\u9762\u7684\u5B57\u6BB5\u4E2D\u8F93\u5165\u6BCF\u7B14\u4EA4\u6613\u91D1\u989D\u3002\u793A\u4F8B\uFF1A1.51\u3002',
        reviewingInfo:
            '\u8C22\u8C22\uFF01\u6211\u4EEC\u6B63\u5728\u5BA1\u6838\u60A8\u7684\u4FE1\u606F\uFF0C\u5F88\u5FEB\u4F1A\u4E0E\u60A8\u8054\u7CFB\u3002\u8BF7\u67E5\u770B\u60A8\u4E0EConcierge\u7684\u804A\u5929\u3002',
        forNextStep: '\u4EE5\u5B8C\u6210\u94F6\u884C\u8D26\u6237\u8BBE\u7F6E\u7684\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
        letsChatCTA: '\u597D\u7684\uFF0C\u6211\u4EEC\u6765\u804A\u5929\u5427\u3002',
        letsChatText:
            '\u5FEB\u5B8C\u6210\u4E86\uFF01\u6211\u4EEC\u9700\u8981\u60A8\u901A\u8FC7\u804A\u5929\u9A8C\u8BC1\u6700\u540E\u51E0\u6761\u4FE1\u606F\u3002\u51C6\u5907\u597D\u4E86\u5417\uFF1F',
        letsChatTitle: '\u8BA9\u6211\u4EEC\u804A\u5929\u5427\uFF01',
        enable2FATitle: '\u9632\u6B62\u6B3A\u8BC8\uFF0C\u542F\u7528\u53CC\u56E0\u7D20\u8BA4\u8BC1 (2FA)',
        enable2FAText:
            '\u6211\u4EEC\u975E\u5E38\u91CD\u89C6\u60A8\u7684\u5B89\u5168\u3002\u8BF7\u7ACB\u5373\u8BBE\u7F6E2FA\uFF0C\u4E3A\u60A8\u7684\u8D26\u6237\u589E\u52A0\u4E00\u5C42\u989D\u5916\u7684\u4FDD\u62A4\u3002',
        secureYourAccount: '\u4FDD\u62A4\u60A8\u7684\u8D26\u6237',
    },
    beneficialOwnersStep: {
        additionalInformation: '\u9644\u52A0\u4FE1\u606F',
        checkAllThatApply: '\u68C0\u67E5\u6240\u6709\u9002\u7528\u9879\uFF0C\u5426\u5219\u7559\u7A7A\u3002',
        iOwnMoreThan25Percent: '\u6211\u62E5\u6709\u8D85\u8FC725%\u7684',
        someoneOwnsMoreThan25Percent: '\u5176\u4ED6\u4EBA\u62E5\u6709\u8D85\u8FC725%\u7684',
        additionalOwner: '\u989D\u5916\u7684\u53D7\u76CA\u6240\u6709\u4EBA',
        removeOwner: '\u79FB\u9664\u6B64\u53D7\u76CA\u6240\u6709\u4EBA',
        addAnotherIndividual: '\u6DFB\u52A0\u53E6\u4E00\u4E2A\u62E5\u6709\u8D85\u8FC725%\u80A1\u4EFD\u7684\u4E2A\u4EBA',
        agreement: '\u534F\u8BAE\uFF1A',
        termsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
        certifyTrueAndAccurate: '\u6211\u8BC1\u660E\u6240\u63D0\u4F9B\u7684\u4FE1\u606F\u662F\u771F\u5B9E\u51C6\u786E\u7684\u3002',
        error: {
            certify: '\u5FC5\u987B\u786E\u8BA4\u4FE1\u606F\u771F\u5B9E\u51C6\u786E',
        },
    },
    completeVerificationStep: {
        completeVerification: '\u5B8C\u6210\u9A8C\u8BC1',
        confirmAgreements: '\u8BF7\u786E\u8BA4\u4EE5\u4E0B\u534F\u8BAE\u3002',
        certifyTrueAndAccurate: '\u6211\u8BC1\u660E\u6240\u63D0\u4F9B\u7684\u4FE1\u606F\u662F\u771F\u5B9E\u51C6\u786E\u7684\u3002',
        certifyTrueAndAccurateError: '\u8BF7\u786E\u8BA4\u4FE1\u606F\u771F\u5B9E\u51C6\u786E\u3002',
        isAuthorizedToUseBankAccount: '\u6211\u88AB\u6388\u6743\u4F7F\u7528\u6B64\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u8FDB\u884C\u4E1A\u52A1\u652F\u51FA',
        isAuthorizedToUseBankAccountError: '\u60A8\u5FC5\u987B\u662F\u5177\u6709\u6388\u6743\u64CD\u4F5C\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u7684\u63A7\u5236\u5B98\u5458\u3002',
        termsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
    },
    connectBankAccountStep: {
        connectBankAccount: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
        finishButtonText: '\u5B8C\u6210\u8BBE\u7F6E',
        validateYourBankAccount: '\u9A8C\u8BC1\u60A8\u7684\u94F6\u884C\u8D26\u6237',
        validateButtonText: '\u9A8C\u8BC1',
        validationInputLabel: '\u4EA4\u6613',
        maxAttemptsReached: '\u7531\u4E8E\u9519\u8BEF\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u6B64\u94F6\u884C\u8D26\u6237\u7684\u9A8C\u8BC1\u5DF2\u88AB\u7981\u7528\u3002',
        description: `\u57281-2\u4E2A\u5DE5\u4F5C\u65E5\u5185\uFF0C\u6211\u4EEC\u4F1A\u4ECE\u7C7B\u4F3C\u201CExpensify, Inc. Validation\u201D\u7684\u540D\u79F0\u5411\u60A8\u7684\u94F6\u884C\u8D26\u6237\u53D1\u9001\u4E09\uFF083\uFF09\u7B14\u5C0F\u989D\u4EA4\u6613\u3002`,
        descriptionCTA: '\u8BF7\u5728\u4E0B\u9762\u7684\u5B57\u6BB5\u4E2D\u8F93\u5165\u6BCF\u7B14\u4EA4\u6613\u91D1\u989D\u3002\u793A\u4F8B\uFF1A1.51\u3002',
        reviewingInfo:
            '\u8C22\u8C22\uFF01\u6211\u4EEC\u6B63\u5728\u5BA1\u6838\u60A8\u7684\u4FE1\u606F\uFF0C\u5F88\u5FEB\u4F1A\u4E0E\u60A8\u8054\u7CFB\u3002\u8BF7\u67E5\u770B\u60A8\u4E0EConcierge\u7684\u804A\u5929\u3002',
        forNextSteps: '\u4EE5\u5B8C\u6210\u94F6\u884C\u8D26\u6237\u8BBE\u7F6E\u7684\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
        letsChatCTA: '\u597D\u7684\uFF0C\u6211\u4EEC\u6765\u804A\u5929\u5427\u3002',
        letsChatText:
            '\u5FEB\u5B8C\u6210\u4E86\uFF01\u6211\u4EEC\u9700\u8981\u60A8\u901A\u8FC7\u804A\u5929\u9A8C\u8BC1\u6700\u540E\u51E0\u6761\u4FE1\u606F\u3002\u51C6\u5907\u597D\u4E86\u5417\uFF1F',
        letsChatTitle: '\u8BA9\u6211\u4EEC\u804A\u5929\u5427\uFF01',
        enable2FATitle: '\u9632\u6B62\u6B3A\u8BC8\uFF0C\u542F\u7528\u53CC\u56E0\u7D20\u8BA4\u8BC1 (2FA)',
        enable2FAText:
            '\u6211\u4EEC\u975E\u5E38\u91CD\u89C6\u60A8\u7684\u5B89\u5168\u3002\u8BF7\u7ACB\u5373\u8BBE\u7F6E2FA\uFF0C\u4E3A\u60A8\u7684\u8D26\u6237\u589E\u52A0\u4E00\u5C42\u989D\u5916\u7684\u4FDD\u62A4\u3002',
        secureYourAccount: '\u4FDD\u62A4\u60A8\u7684\u8D26\u6237',
    },
    countryStep: {
        confirmBusinessBank: '\u786E\u8BA4\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u7684\u8D27\u5E01\u548C\u56FD\u5BB6/\u5730\u533A',
        confirmCurrency: '\u786E\u8BA4\u8D27\u5E01\u548C\u56FD\u5BB6/\u5730\u533A',
        yourBusiness: '\u60A8\u7684\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u8D27\u5E01\u5FC5\u987B\u4E0E\u60A8\u7684\u5DE5\u4F5C\u533A\u8D27\u5E01\u5339\u914D\u3002',
        youCanChange: '\u60A8\u53EF\u4EE5\u5728\u60A8\u7684\u5DE5\u4F5C\u533A\u4E2D\u66F4\u6539\u8D27\u5E01',
        findCountry: '\u67E5\u627E\u56FD\u5BB6',
        selectCountry: '\u9009\u62E9\u56FD\u5BB6/\u5730\u533A',
    },
    bankInfoStep: {
        whatAreYour: '\u60A8\u7684\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u8BE6\u7EC6\u4FE1\u606F\u662F\u4EC0\u4E48\uFF1F',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u6B63\u5E38\u3002',
        thisBankAccount: '\u6B64\u94F6\u884C\u8D26\u6237\u5C06\u7528\u4E8E\u60A8\u5DE5\u4F5C\u533A\u7684\u4E1A\u52A1\u4ED8\u6B3E\u3002',
        accountNumber: '\u8D26\u53F7',
        accountHolderNameDescription: '\u6388\u6743\u7B7E\u7F72\u4EBA\u5168\u540D',
    },
    signerInfoStep: {
        signerInfo: '\u7B7E\u7F72\u4EBA\u4FE1\u606F',
        areYouDirector: ({companyName}: CompanyNameParams) => `\u60A8\u662F${companyName}\u7684\u8463\u4E8B\u6216\u9AD8\u7EA7\u804C\u5458\u5417\uFF1F`,
        regulationRequiresUs: '\u6CD5\u89C4\u8981\u6C42\u6211\u4EEC\u6838\u5B9E\u7B7E\u7F72\u4EBA\u662F\u5426\u6709\u6743\u4EE3\u8868\u4F01\u4E1A\u91C7\u53D6\u6B64\u884C\u52A8\u3002',
        whatsYourName: '\u60A8\u7684\u6CD5\u5B9A\u59D3\u540D\u662F\u4EC0\u4E48',
        fullName: '\u6CD5\u5B9A\u5168\u540D',
        whatsYourJobTitle: '\u4F60\u7684\u804C\u4F4D\u662F\u4EC0\u4E48\uFF1F',
        jobTitle: '\u804C\u4F4D\u540D\u79F0',
        whatsYourDOB: '\u4F60\u7684\u51FA\u751F\u65E5\u671F\u662F\u4EC0\u4E48\uFF1F',
        uploadID: '\u4E0A\u4F20\u8EAB\u4EFD\u8BC1\u660E\u548C\u5730\u5740\u8BC1\u660E',
        personalAddress: '\u4E2A\u4EBA\u5730\u5740\u8BC1\u660E\uFF08\u4F8B\u5982\uFF0C\u6C34\u7535\u8D39\u8D26\u5355\uFF09',
        letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
        legalName: '\u6CD5\u5B9A\u540D\u79F0',
        proofOf: '\u4E2A\u4EBA\u5730\u5740\u8BC1\u660E',
        enterOneEmail: ({companyName}: CompanyNameParams) => `\u8F93\u5165${companyName}\u7684\u8463\u4E8B\u6216\u9AD8\u7EA7\u804C\u5458\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740`,
        regulationRequiresOneMoreDirector:
            '\u6CD5\u89C4\u8981\u6C42\u81F3\u5C11\u518D\u589E\u52A0\u4E00\u540D\u8463\u4E8B\u6216\u9AD8\u7EA7\u7BA1\u7406\u4EBA\u5458\u4F5C\u4E3A\u7B7E\u7F72\u4EBA\u3002',
        hangTight: '\u8BF7\u7A0D\u7B49...',
        enterTwoEmails: ({companyName}: CompanyNameParams) =>
            `\u8F93\u5165${companyName}\u7684\u4E24\u4F4D\u8463\u4E8B\u6216\u9AD8\u7EA7\u7BA1\u7406\u4EBA\u5458\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740\u3002`,
        sendReminder: '\u53D1\u9001\u63D0\u9192',
        chooseFile: '\u9009\u62E9\u6587\u4EF6',
        weAreWaiting:
            '\u6211\u4EEC\u6B63\u5728\u7B49\u5F85\u5176\u4ED6\u4EBA\u9A8C\u8BC1\u5176\u4F5C\u4E3A\u4F01\u4E1A\u8463\u4E8B\u6216\u9AD8\u7EA7\u7BA1\u7406\u4EBA\u5458\u7684\u8EAB\u4EFD\u3002',
        id: '\u8EAB\u4EFD\u8BC1\u590D\u5370\u4EF6',
        proofOfDirectors: '\u8463\u4E8B\u8BC1\u660E',
        proofOfDirectorsDescription: '\u793A\u4F8B\uFF1AOncorp\u516C\u53F8\u7B80\u4ECB\u6216\u5546\u4E1A\u6CE8\u518C\u3002',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: '\u7B7E\u7F72\u4EBA\u3001\u6388\u6743\u7528\u6237\u548C\u5B9E\u76CA\u6240\u6709\u4EBA\u7684Codice Fiscale\u3002',
        PDSandFSG: 'PDS + FSG \u62AB\u9732\u6587\u4EF6',
        PDSandFSGDescription:
            '\u6211\u4EEC\u4E0ECorpay\u7684\u5408\u4F5C\u5229\u7528API\u8FDE\u63A5\uFF0C\u5229\u7528\u5176\u5E9E\u5927\u7684\u56FD\u9645\u94F6\u884C\u5408\u4F5C\u4F19\u4F34\u7F51\u7EDC\u6765\u652F\u6301Expensify\u7684\u5168\u7403\u62A5\u9500\u3002\u6839\u636E\u6FB3\u5927\u5229\u4E9A\u6CD5\u89C4\uFF0C\u6211\u4EEC\u5411\u60A8\u63D0\u4F9BCorpay\u7684\u91D1\u878D\u670D\u52A1\u6307\u5357\uFF08FSG\uFF09\u548C\u4EA7\u54C1\u62AB\u9732\u58F0\u660E\uFF08PDS\uFF09\u3002\n\n\u8BF7\u4ED4\u7EC6\u9605\u8BFBFSG\u548CPDS\u6587\u4EF6\uFF0C\u56E0\u4E3A\u5B83\u4EEC\u5305\u542BCorpay\u63D0\u4F9B\u7684\u4EA7\u54C1\u548C\u670D\u52A1\u7684\u5B8C\u6574\u7EC6\u8282\u548C\u91CD\u8981\u4FE1\u606F\u3002\u8BF7\u4FDD\u7559\u8FD9\u4E9B\u6587\u4EF6\u4EE5\u5907\u5C06\u6765\u53C2\u8003\u3002',
        pleaseUpload:
            '\u8BF7\u5728\u4E0B\u65B9\u4E0A\u4F20\u5176\u4ED6\u6587\u4EF6\uFF0C\u4EE5\u5E2E\u52A9\u6211\u4EEC\u9A8C\u8BC1\u60A8\u4F5C\u4E3A\u4F01\u4E1A\u5B9E\u4F53\u7684\u8463\u4E8B\u6216\u9AD8\u7EA7\u7BA1\u7406\u4EBA\u5458\u7684\u8EAB\u4EFD\u3002',
    },
    agreementsStep: {
        agreements: '\u534F\u8BAE',
        pleaseConfirm: '\u8BF7\u786E\u8BA4\u4EE5\u4E0B\u534F\u8BAE',
        regulationRequiresUs: '\u6CD5\u89C4\u8981\u6C42\u6211\u4EEC\u6838\u5B9E\u4EFB\u4F55\u62E5\u6709\u8D85\u8FC725%\u4E1A\u52A1\u7684\u4E2A\u4EBA\u7684\u8EAB\u4EFD\u3002',
        iAmAuthorized: '\u6211\u88AB\u6388\u6743\u4F7F\u7528\u516C\u53F8\u94F6\u884C\u8D26\u6237\u8FDB\u884C\u4E1A\u52A1\u652F\u51FA\u3002',
        iCertify: '\u6211\u8BC1\u660E\u6240\u63D0\u4F9B\u7684\u4FE1\u606F\u662F\u771F\u5B9E\u51C6\u786E\u7684\u3002',
        termsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
        accept: '\u63A5\u53D7\u5E76\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
        iConsentToThe: '\u6211\u540C\u610F',
        privacyNotice: '\u9690\u79C1\u58F0\u660E',
        error: {
            authorized: '\u60A8\u5FC5\u987B\u662F\u5177\u6709\u6388\u6743\u64CD\u4F5C\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u7684\u63A7\u5236\u5B98\u5458\u3002',
            certify: '\u8BF7\u786E\u8BA4\u4FE1\u606F\u771F\u5B9E\u51C6\u786E\u3002',
            consent: '\u8BF7\u540C\u610F\u9690\u79C1\u58F0\u660E',
        },
    },
    finishStep: {
        connect: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
        letsFinish: '\u8BA9\u6211\u4EEC\u5728\u804A\u5929\u4E2D\u5B8C\u6210\uFF01',
        thanksFor:
            '\u611F\u8C22\u60A8\u63D0\u4F9B\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u3002\u4E13\u5C5E\u5BA2\u670D\u4EBA\u5458\u5C06\u4F1A\u5BA1\u6838\u60A8\u7684\u4FE1\u606F\u3002\u5982\u679C\u6211\u4EEC\u9700\u8981\u5176\u4ED6\u4FE1\u606F\uFF0C\u4F1A\u518D\u6B21\u8054\u7CFB\u60A8\u3002\u540C\u65F6\uFF0C\u5982\u679C\u60A8\u6709\u4EFB\u4F55\u95EE\u9898\uFF0C\u8BF7\u968F\u65F6\u8054\u7CFB\u6211\u4EEC\u3002',
        iHaveA: '\u6211\u6709\u4E00\u4E2A\u95EE\u9898',
        enable2FA: '\u542F\u7528\u53CC\u56E0\u7D20\u8BA4\u8BC1 (2FA) \u4EE5\u9632\u6B62\u6B3A\u8BC8',
        weTake: '\u6211\u4EEC\u975E\u5E38\u91CD\u89C6\u60A8\u7684\u5B89\u5168\u3002\u8BF7\u7ACB\u5373\u8BBE\u7F6E2FA\uFF0C\u4E3A\u60A8\u7684\u8D26\u6237\u589E\u52A0\u4E00\u5C42\u989D\u5916\u7684\u4FDD\u62A4\u3002',
        secure: '\u4FDD\u62A4\u60A8\u7684\u8D26\u6237',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '\u8BF7\u7A0D\u7B49',
        explanationLine: '\u6211\u4EEC\u6B63\u5728\u67E5\u770B\u60A8\u7684\u4FE1\u606F\u3002\u60A8\u5F88\u5FEB\u5C31\u53EF\u4EE5\u7EE7\u7EED\u8FDB\u884C\u4E0B\u4E00\u6B65\u3002',
    },
    session: {
        offlineMessageRetry: '\u770B\u8D77\u6765\u60A8\u5DF2\u79BB\u7EBF\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u8FDE\u63A5\u7136\u540E\u91CD\u8BD5\u3002',
    },
    travel: {
        header: '\u9884\u8BA2\u65C5\u884C',
        title: '\u806A\u660E\u65C5\u884C',
        subtitle:
            '\u4F7F\u7528 Expensify Travel \u83B7\u53D6\u6700\u4F73\u65C5\u884C\u4F18\u60E0\uFF0C\u5E76\u5728\u4E00\u4E2A\u5730\u65B9\u7BA1\u7406\u60A8\u6240\u6709\u7684\u5546\u52A1\u8D39\u7528\u3002',
        features: {
            saveMoney: '\u5728\u60A8\u7684\u9884\u8BA2\u4E0A\u7701\u94B1',
            alerts: '\u83B7\u53D6\u5B9E\u65F6\u66F4\u65B0\u548C\u63D0\u9192',
        },
        bookTravel: '\u9884\u8BA2\u65C5\u884C',
        bookDemo: '\u9884\u7EA6\u6F14\u793A',
        bookADemo: '\u9884\u7EA6\u6F14\u793A',
        toLearnMore: '\u4E86\u89E3\u66F4\u591A\u3002',
        termsAndConditions: {
            header: '\u5728\u6211\u4EEC\u7EE7\u7EED\u4E4B\u524D...',
            title: '\u6761\u6B3E\u548C\u6761\u4EF6',
            subtitle: '\u8BF7\u540C\u610FExpensify Travel',
            termsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
            travelTermsAndConditions: '\u6761\u6B3E\u548C\u6761\u4EF6',
            agree: '\u6211\u540C\u610F',
            error: '\u60A8\u5FC5\u987B\u540C\u610FExpensify Travel\u7684\u6761\u6B3E\u548C\u6761\u4EF6\u624D\u80FD\u7EE7\u7EED',
            defaultWorkspaceError:
                '\u60A8\u9700\u8981\u8BBE\u7F6E\u4E00\u4E2A\u9ED8\u8BA4\u5DE5\u4F5C\u533A\u4EE5\u542F\u7528Expensify Travel\u3002\u8BF7\u524D\u5F80\u8BBE\u7F6E > \u5DE5\u4F5C\u533A > \u70B9\u51FB\u5DE5\u4F5C\u533A\u65C1\u8FB9\u7684\u4E09\u4E2A\u7AD6\u70B9 > \u8BBE\u4E3A\u9ED8\u8BA4\u5DE5\u4F5C\u533A\uFF0C\u7136\u540E\u91CD\u8BD5\uFF01',
        },
        flight: '\u822A\u73ED',
        flightDetails: {
            passenger: '\u4E58\u5BA2',
            layover: ({layover}: FlightLayoverParams) =>
                `<muted-text-label>\u5728\u6B64\u822A\u73ED\u4E4B\u524D\uFF0C\u60A8\u6709\u4E00\u4E2A<strong>${layover}\u5C0F\u65F6\u7684\u4E2D\u8F6C</strong></muted-text-label>`,
            takeOff: '\u8D77\u98DE',
            landing: '\u7740\u9646',
            seat: '\u5EA7\u4F4D',
            class: '\u8231\u4F4D\u7B49\u7EA7',
            recordLocator: '\u8BB0\u5F55\u5B9A\u4F4D\u5668',
            cabinClasses: {
                unknown: 'Unknown',
                economy: '\u7ECF\u6D4E',
                premiumEconomy: '\u9AD8\u7EA7\u7ECF\u6D4E\u8231',
                business: '\u5546\u4E1A',
                first: '\u7B2C\u4E00',
            },
        },
        hotel: '\u9152\u5E97',
        hotelDetails: {
            guest: '\u8BBF\u5BA2',
            checkIn: '\u7B7E\u5230',
            checkOut: '\u9000\u623F',
            roomType: '\u623F\u95F4\u7C7B\u578B',
            cancellation: '\u53D6\u6D88\u653F\u7B56',
            cancellationUntil: '\u514D\u8D39\u53D6\u6D88\u622A\u6B62\u5230',
            confirmation: '\u786E\u8BA4\u53F7\u7801',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: '\u4E0D\u53EF\u9000\u6B3E',
                freeCancellationUntil: '\u514D\u8D39\u53D6\u6D88\u622A\u6B62\u5230',
                partiallyRefundable: '\u90E8\u5206\u53EF\u9000\u6B3E',
            },
        },
        car: '\u6C7D\u8F66',
        carDetails: {
            rentalCar: '\u6C7D\u8F66\u79DF\u8D41',
            pickUp: '\u63A5\u9001',
            dropOff: '\u653E\u4E0B',
            driver: '\u53F8\u673A',
            carType: '\u6C7D\u8F66\u7C7B\u578B',
            cancellation: '\u53D6\u6D88\u653F\u7B56',
            cancellationUntil: '\u514D\u8D39\u53D6\u6D88\u622A\u6B62\u5230',
            freeCancellation: '\u514D\u8D39\u53D6\u6D88',
            confirmation: '\u786E\u8BA4\u53F7\u7801',
        },
        train: '\u94C1\u8DEF',
        trainDetails: {
            passenger: '\u4E58\u5BA2',
            departs: '\u51FA\u53D1',
            arrives: '\u5230\u8FBE',
            coachNumber: '\u6559\u7EC3\u7F16\u53F7',
            seat: '\u5EA7\u4F4D',
            fareDetails: '\u7968\u4EF7\u8BE6\u60C5',
            confirmation: '\u786E\u8BA4\u53F7\u7801',
        },
        viewTrip: '\u67E5\u770B\u884C\u7A0B',
        modifyTrip: '\u4FEE\u6539\u884C\u7A0B',
        tripSupport: '\u884C\u7A0B\u652F\u6301',
        tripDetails: '\u884C\u7A0B\u8BE6\u60C5',
        viewTripDetails: '\u67E5\u770B\u884C\u7A0B\u8BE6\u60C5',
        trip: '\u65C5\u884C',
        trips: '\u884C\u7A0B',
        tripSummary: '\u884C\u7A0B\u603B\u7ED3',
        departs: '\u51FA\u53D1',
        errorMessage: '\u51FA\u4E86\u70B9\u95EE\u9898\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        phoneError: {
            phrase1: '\u8BF7',
            link: '\u6DFB\u52A0\u5DE5\u4F5C\u90AE\u7BB1\u4F5C\u4E3A\u60A8\u7684\u4E3B\u8981\u767B\u5F55\u90AE\u7BB1',
            phrase2: '\u9884\u8BA2\u65C5\u884C\u3002',
        },
        domainSelector: {
            title: '\u57DF\u540D',
            subtitle: '\u4E3A Expensify Travel \u8BBE\u7F6E\u9009\u62E9\u4E00\u4E2A\u57DF\u540D\u3002',
            recommended: '\u63A8\u8350',
        },
        domainPermissionInfo: {
            title: '\u57DF\u540D',
            restrictionPrefix: `\u60A8\u6CA1\u6709\u6743\u9650\u4E3A\u8BE5\u57DF\u542F\u7528 Expensify Travel`,
            restrictionSuffix: `\u60A8\u9700\u8981\u8BF7\u8BE5\u9886\u57DF\u7684\u67D0\u4EBA\u6765\u542F\u7528\u65C5\u884C\u529F\u80FD\u3002`,
            accountantInvitationPrefix: `\u5982\u679C\u60A8\u662F\u4E00\u540D\u4F1A\u8BA1\u5E08\uFF0C\u8BF7\u8003\u8651\u52A0\u5165`,
            accountantInvitationLink: `ExpensifyApproved! \u4F1A\u8BA1\u5E08\u8BA1\u5212`,
            accountantInvitationSuffix: `\u4E3A\u6B64\u57DF\u542F\u7528\u65C5\u884C\u529F\u80FD\u3002`,
        },
        publicDomainError: {
            title: '\u5F00\u59CB\u4F7F\u7528 Expensify Travel',
            message: `\u60A8\u9700\u8981\u4F7F\u7528\u60A8\u7684\u5DE5\u4F5C\u90AE\u7BB1\uFF08\u4F8B\u5982\uFF0Cname@company.com\uFF09\u4E0EExpensify Travel\uFF0C\u800C\u4E0D\u662F\u60A8\u7684\u4E2A\u4EBA\u90AE\u7BB1\uFF08\u4F8B\u5982\uFF0Cname@gmail.com\uFF09\u3002`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel \u5DF2\u88AB\u7981\u7528',
            message: `\u60A8\u7684\u7BA1\u7406\u5458\u5DF2\u5173\u95EDExpensify Travel\u3002\u8BF7\u9075\u5FAA\u60A8\u516C\u53F8\u7684\u9884\u8BA2\u653F\u7B56\u8FDB\u884C\u5DEE\u65C5\u5B89\u6392\u3002`,
        },
        verifyCompany: {
            title: '\u7ACB\u5373\u5F00\u59CB\u60A8\u7684\u65C5\u884C\u5427\uFF01',
            message: `\u8BF7\u8054\u7CFB\u60A8\u7684\u5BA2\u6237\u7ECF\u7406\u6216\u53D1\u9001\u7535\u5B50\u90AE\u4EF6\u81F3 salesteam@expensify.com \u4EE5\u83B7\u53D6\u65C5\u884C\u6F14\u793A\u5E76\u4E3A\u60A8\u7684\u516C\u53F8\u542F\u7528\u8BE5\u529F\u80FD\u3002`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `\u60A8\u5DF2\u9884\u8BA2\u822A\u73ED ${airlineCode} (${origin} \u2192 ${destination})\uFF0C\u65E5\u671F\u4E3A ${startDate}\u3002\u786E\u8BA4\u7801\uFF1A${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `\u60A8\u5728${startDate}\u7684\u822A\u73ED${airlineCode}\uFF08${origin} \u2192 ${destination}\uFF09\u7684\u673A\u7968\u5DF2\u88AB\u4F5C\u5E9F\u3002`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `\u60A8${startDate}\u7684\u822A\u73ED${airlineCode}\uFF08${origin} \u2192 ${destination}\uFF09\u7684\u673A\u7968\u5DF2\u88AB\u9000\u6B3E\u6216\u5151\u6362\u3002`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `\u60A8\u5728${startDate}\u7684\u822A\u73ED${airlineCode}\uFF08${origin} \u2192 ${destination}\uFF09\u5DF2\u88AB\u822A\u7A7A\u516C\u53F8\u53D6\u6D88\u3002`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `\u822A\u7A7A\u516C\u53F8\u5DF2\u63D0\u8BAE\u66F4\u6539\u822A\u73ED ${airlineCode} \u7684\u65F6\u523B\u8868\uFF1B\u6211\u4EEC\u6B63\u5728\u7B49\u5F85\u786E\u8BA4\u3002`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) =>
                `\u822A\u73ED\u53D8\u66F4\u5DF2\u786E\u8BA4\uFF1A\u822A\u73ED ${airlineCode} \u73B0\u5728\u7684\u8D77\u98DE\u65F6\u95F4\u662F ${startDate}\u3002`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `\u60A8\u5728${startDate}\u7684\u822A\u73ED${airlineCode}\uFF08${origin} \u2192 ${destination}\uFF09\u5DF2\u66F4\u65B0\u3002`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) =>
                `\u60A8\u7684\u8231\u4F4D\u7B49\u7EA7\u5DF2\u5728\u822A\u73ED${airlineCode}\u4E0A\u66F4\u65B0\u4E3A${cabinClass}\u3002`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `\u60A8\u5728\u822A\u73ED ${airlineCode} \u4E0A\u7684\u5EA7\u4F4D\u5DF2\u786E\u8BA4\u3002`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `\u60A8\u5728\u822A\u73ED ${airlineCode} \u4E0A\u7684\u5EA7\u4F4D\u5DF2\u88AB\u66F4\u6539\u3002`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `\u60A8\u5728\u822A\u73ED ${airlineCode} \u4E0A\u7684\u5EA7\u4F4D\u5206\u914D\u5DF2\u88AB\u53D6\u6D88\u3002`,
            paymentDeclined: '\u60A8\u7684\u673A\u7968\u9884\u8BA2\u4ED8\u6B3E\u5931\u8D25\u3002\u8BF7\u91CD\u8BD5\u3002',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `\u60A8\u5DF2\u53D6\u6D88\u60A8\u7684${type}\u9884\u8BA2${id}\u3002`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `\u4F9B\u5E94\u5546\u53D6\u6D88\u4E86\u60A8\u7684${type}\u9884\u8BA2${id}\u3002`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) =>
                `\u60A8\u7684${type}\u9884\u8BA2\u5DF2\u91CD\u65B0\u9884\u8BA2\u3002\u65B0\u7684\u786E\u8BA4\u7F16\u53F7\uFF1A${id}\u3002`,
            bookingUpdated: ({type}: TravelTypeParams) => `\u60A8\u7684${type}\u9884\u8BA2\u5DF2\u66F4\u65B0\u3002\u8BF7\u5728\u884C\u7A0B\u4E2D\u67E5\u770B\u65B0\u8BE6\u60C5\u3002`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `\u60A8\u4ECE${origin}\u5230${destination}\u7684\u706B\u8F66\u7968\u5DF2\u4E8E${startDate}\u9000\u6B3E\u3002\u4FE1\u7528\u5C06\u88AB\u5904\u7406\u3002`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) =>
                `\u60A8\u5728${startDate}\u4ECE${origin}\u5230${destination}\u7684\u706B\u8F66\u7968\u5DF2\u88AB\u66F4\u6362\u3002`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) =>
                `\u60A8\u4ECE${origin}\u5230${destination}\u7684\u706B\u8F66\u7968\u5728${startDate}\u5DF2\u66F4\u65B0\u3002`,
            defaultUpdate: ({type}: TravelTypeParams) => `\u60A8\u7684${type}\u9884\u8BA2\u5DF2\u66F4\u65B0\u3002`,
        },
    },
    workspace: {
        common: {
            card: '\u5361\u7247',
            expensifyCard: 'Expensify Card',
            companyCards: '\u516C\u53F8\u5361\u7247',
            workflows: '\u5DE5\u4F5C\u6D41\u7A0B',
            workspace: '\u5DE5\u4F5C\u533A',
            findWorkspace: '查找工作区',
            edit: '\u7F16\u8F91\u5DE5\u4F5C\u533A',
            enabled: '\u542F\u7528',
            disabled: '\u7981\u7528',
            everyone: '\u6BCF\u4E2A\u4EBA',
            delete: '\u5220\u9664\u5DE5\u4F5C\u533A',
            settings: '\u8BBE\u7F6E',
            reimburse: '\u62A5\u9500',
            categories: '\u7C7B\u522B',
            tags: '\u6807\u7B7E',
            customField1: '\u81EA\u5B9A\u4E49\u5B57\u6BB5 1',
            customField2: '\u81EA\u5B9A\u4E49\u5B57\u6BB52',
            customFieldHint: '\u6DFB\u52A0\u9002\u7528\u4E8E\u8BE5\u6210\u5458\u6240\u6709\u652F\u51FA\u7684\u81EA\u5B9A\u4E49\u7F16\u7801\u3002',
            reportFields: '\u62A5\u544A\u5B57\u6BB5',
            reportTitle: '\u62A5\u544A\u6807\u9898',
            reportField: '\u62A5\u544A\u5B57\u6BB5',
            taxes: '\u7A0E\u6B3E',
            bills: '\u8D26\u5355',
            invoices: '\u53D1\u7968',
            travel: '\u65C5\u884C',
            members: '\u6210\u5458',
            accounting: '\u4F1A\u8BA1',
            rules: '\u89C4\u5219',
            displayedAs: '\u663E\u793A\u4E3A',
            plan: '\u8BA1\u5212',
            profile: '\u6982\u8FF0',
            bankAccount: '\u94F6\u884C\u8D26\u6237',
            connectBankAccount: '\u8FDE\u63A5\u94F6\u884C\u8D26\u6237',
            testTransactions: '\u6D4B\u8BD5\u4EA4\u6613',
            issueAndManageCards: '\u53D1\u884C\u548C\u7BA1\u7406\u5361\u7247',
            reconcileCards: '\u5BF9\u8D26\u5361\u7247',
            selected: () => ({
                one: '\u5DF2\u9009\u62E9 1 \u4E2A',
                other: (count: number) => `${count} \u5DF2\u9009\u62E9`,
            }),
            settlementFrequency: '\u7ED3\u7B97\u9891\u7387',
            setAsDefault: '\u8BBE\u4E3A\u9ED8\u8BA4\u5DE5\u4F5C\u533A',
            defaultNote: `\u53D1\u9001\u5230 ${CONST.EMAIL.RECEIPTS} \u7684\u6536\u636E\u5C06\u663E\u793A\u5728\u6B64\u5DE5\u4F5C\u533A\u3002`,
            deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5DE5\u4F5C\u533A\u5417\uFF1F',
            deleteWithCardsConfirmation:
                '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5DE5\u4F5C\u533A\u5417\uFF1F\u8FD9\u5C06\u79FB\u9664\u6240\u6709\u5361\u7247\u6E90\u548C\u5DF2\u5206\u914D\u7684\u5361\u7247\u3002',
            unavailable: '\u5DE5\u4F5C\u533A\u4E0D\u53EF\u7528',
            memberNotFound:
                '\u672A\u627E\u5230\u6210\u5458\u3002\u8981\u9080\u8BF7\u65B0\u6210\u5458\u52A0\u5165\u5DE5\u4F5C\u533A\uFF0C\u8BF7\u4F7F\u7528\u4E0A\u9762\u7684\u9080\u8BF7\u6309\u94AE\u3002',
            notAuthorized: `\u60A8\u65E0\u6743\u8BBF\u95EE\u6B64\u9875\u9762\u3002\u5982\u679C\u60A8\u60F3\u52A0\u5165\u6B64\u5DE5\u4F5C\u533A\uFF0C\u53EA\u9700\u8BF7\u6C42\u5DE5\u4F5C\u533A\u6240\u6709\u8005\u5C06\u60A8\u6DFB\u52A0\u4E3A\u6210\u5458\u3002\u8FD8\u6709\u5176\u4ED6\u95EE\u9898\uFF1F\u8BF7\u8054\u7CFB${CONST.EMAIL.CONCIERGE}\u3002`,
            goToRoom: ({roomName}: GoToRoomParams) => `\u53BB ${roomName} \u623F\u95F4`,
            goToWorkspace: '\u524D\u5F80\u5DE5\u4F5C\u533A',
            goToWorkspaces: '\u8F6C\u5230\u5DE5\u4F5C\u533A',
            clearFilter: '\u6E05\u9664\u7B5B\u9009\u5668',
            workspaceName: '\u5DE5\u4F5C\u533A\u540D\u79F0',
            workspaceOwner: '\u6240\u6709\u8005',
            workspaceType: '\u5DE5\u4F5C\u533A\u7C7B\u578B',
            workspaceAvatar: '\u5DE5\u4F5C\u533A\u5934\u50CF',
            mustBeOnlineToViewMembers: '\u60A8\u9700\u8981\u5728\u7EBF\u624D\u80FD\u67E5\u770B\u6B64\u5DE5\u4F5C\u533A\u7684\u6210\u5458\u3002',
            moreFeatures: '\u66F4\u591A\u529F\u80FD',
            requested: '\u8BF7\u6C42\u7684',
            distanceRates: '\u8DDD\u79BB\u8D39\u7387',
            defaultDescription: '\u4E00\u4E2A\u5730\u65B9\u7BA1\u7406\u60A8\u6240\u6709\u7684\u6536\u636E\u548C\u8D39\u7528\u3002',
            descriptionHint: '\u4E0E\u6240\u6709\u6210\u5458\u5171\u4EAB\u6B64\u5DE5\u4F5C\u533A\u7684\u4FE1\u606F\u3002',
            welcomeNote: '\u8BF7\u4F7F\u7528Expensify\u63D0\u4EA4\u60A8\u7684\u6536\u636E\u4EE5\u7533\u8BF7\u62A5\u9500\uFF0C\u8C22\u8C22\uFF01',
            subscription: '\u8BA2\u9605',
            markAsEntered: '\u6807\u8BB0\u4E3A\u624B\u52A8\u8F93\u5165',
            markAsExported: '\u6807\u8BB0\u4E3A\u624B\u52A8\u5BFC\u51FA',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `\u5BFC\u51FA\u5230${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
            lineItemLevel: '\u9010\u9879\u7EA7\u522B',
            reportLevel: '\u62A5\u544A\u7EA7\u522B',
            topLevel: '\u9876\u7EA7',
            appliedOnExport: '\u672A\u5BFC\u5165\u5230Expensify\uFF0C\u5DF2\u5728\u5BFC\u51FA\u65F6\u5E94\u7528',
            shareNote: {
                header: '\u4E0E\u5176\u4ED6\u6210\u5458\u5171\u4EAB\u60A8\u7684\u5DE5\u4F5C\u533A',
                content: {
                    firstPart:
                        '\u5206\u4EAB\u6B64\u4E8C\u7EF4\u7801\u6216\u590D\u5236\u4E0B\u9762\u7684\u94FE\u63A5\uFF0C\u4EE5\u4FBF\u6210\u5458\u8F7B\u677E\u8BF7\u6C42\u8BBF\u95EE\u60A8\u7684\u5DE5\u4F5C\u533A\u3002\u6240\u6709\u52A0\u5165\u5DE5\u4F5C\u533A\u7684\u8BF7\u6C42\u5C06\u663E\u793A\u5728',
                    secondPart: '\u4F9B\u60A8\u5BA1\u6838\u7684\u7A7A\u95F4\u3002',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `\u8FDE\u63A5\u5230${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: '\u521B\u5EFA\u65B0\u8FDE\u63A5',
            reuseExistingConnection: '\u91CD\u7528\u73B0\u6709\u8FDE\u63A5',
            existingConnections: '\u73B0\u6709\u8FDE\u63A5',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `\u7531\u4E8E\u60A8\u4E4B\u524D\u5DF2\u8FDE\u63A5\u5230${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}\uFF0C\u60A8\u53EF\u4EE5\u9009\u62E9\u91CD\u7528\u73B0\u6709\u8FDE\u63A5\u6216\u521B\u5EFA\u65B0\u8FDE\u63A5\u3002`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - \u4E0A\u6B21\u540C\u6B65\u65F6\u95F4 ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `\u7531\u4E8E\u8EAB\u4EFD\u9A8C\u8BC1\u9519\u8BEF\uFF0C\u65E0\u6CD5\u8FDE\u63A5\u5230${connectionName}`,
            learnMore: '\u4E86\u89E3\u66F4\u591A\u3002',
            memberAlternateText: '\u6210\u5458\u53EF\u4EE5\u63D0\u4EA4\u548C\u6279\u51C6\u62A5\u544A\u3002',
            adminAlternateText: '\u7BA1\u7406\u5458\u5BF9\u6240\u6709\u62A5\u544A\u548C\u5DE5\u4F5C\u533A\u8BBE\u7F6E\u62E5\u6709\u5B8C\u5168\u7F16\u8F91\u6743\u9650\u3002',
            auditorAlternateText: '\u5BA1\u8BA1\u5458\u53EF\u4EE5\u67E5\u770B\u5E76\u8BC4\u8BBA\u62A5\u544A\u3002',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '\u7BA1\u7406\u5458';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '\u5BA1\u8BA1\u5458';
                    case CONST.POLICY.ROLE.USER:
                        return '\u4F1A\u5458';
                    default:
                        return '\u4F1A\u5458';
                }
            },
            frequency: {
                manual: '\u624B\u52A8',
                instant: '\u5373\u65F6',
                immediate: '\u6BCF\u65E5',
                trip: '\u6309\u884C\u7A0B',
                weekly: '\u6BCF\u5468',
                semimonthly: '\u6BCF\u6708\u4E24\u6B21',
                monthly: '\u6BCF\u6708',
            },
            planType: '\u8BA1\u5212\u7C7B\u578B',
            submitExpense: '\u5728\u4E0B\u65B9\u63D0\u4EA4\u60A8\u7684\u8D39\u7528\uFF1A',
            defaultCategory: '\u9ED8\u8BA4\u7C7B\u522B',
            viewTransactions: '\u67E5\u770B\u4EA4\u6613\u8BB0\u5F55',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName}\u7684\u8D39\u7528`,
        },
        perDiem: {
            subtitle: '\u8BBE\u7F6E\u6BCF\u65E5\u6D25\u8D34\u6807\u51C6\u4EE5\u63A7\u5236\u5458\u5DE5\u7684\u65E5\u5E38\u652F\u51FA\u3002',
            amount: '\u91D1\u989D',
            deleteRates: () => ({
                one: '\u5220\u9664\u8D39\u7387',
                other: '\u5220\u9664\u8D39\u7387',
            }),
            deletePerDiemRate: '\u5220\u9664\u6BCF\u65E5\u6D25\u8D34\u8D39\u7387',
            findPerDiemRate: '\u67E5\u627E\u6BCF\u65E5\u6D25\u8D34\u8D39\u7387',
            areYouSureDelete: () => ({
                one: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u8D39\u7387\u5417\uFF1F',
                other: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u8D39\u7387\u5417\uFF1F',
            }),
            emptyList: {
                title: '\u6BCF\u65E5\u6D25\u8D34',
                subtitle:
                    '\u8BBE\u7F6E\u6BCF\u65E5\u6D25\u8D34\u6807\u51C6\u4EE5\u63A7\u5236\u5458\u5DE5\u7684\u65E5\u5E38\u652F\u51FA\u3002\u4ECE\u7535\u5B50\u8868\u683C\u5BFC\u5165\u8D39\u7387\u4EE5\u5F00\u59CB\u3002',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `\u503C\u4E3A ${rate} \u7684\u8D39\u7387\u5DF2\u5B58\u5728`,
            },
            importPerDiemRates: '\u5BFC\u5165\u6BCF\u65E5\u6D25\u8D34\u6807\u51C6',
            editPerDiemRate: '\u7F16\u8F91\u6BCF\u65E5\u6D25\u8D34\u6807\u51C6',
            editPerDiemRates: '\u7F16\u8F91\u6BCF\u65E5\u6D25\u8D34\u6807\u51C6',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `\u66F4\u65B0\u6B64\u76EE\u7684\u5730\u5C06\u66F4\u6539\u6240\u6709 ${destination} \u7684\u6BCF\u65E5\u6D25\u8D34\u5B50\u8D39\u7387\u3002`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `\u66F4\u65B0\u6B64\u8D27\u5E01\u5C06\u66F4\u6539\u6240\u6709${destination}\u7684\u6BCF\u65E5\u6D25\u8D34\u5B50\u8D39\u7387\u3002`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '\u8BBE\u7F6E\u81EA\u4ED8\u8D39\u7528\u5982\u4F55\u5BFC\u51FA\u5230 QuickBooks Desktop\u3002',
            exportOutOfPocketExpensesCheckToggle: '\u5C06\u652F\u7968\u6807\u8BB0\u4E3A\u201C\u7A0D\u540E\u6253\u5370\u201D',
            exportDescription: '\u914D\u7F6E\u5982\u4F55\u5C06Expensify\u6570\u636E\u5BFC\u51FA\u5230QuickBooks Desktop\u3002',
            date: '\u5BFC\u51FA\u65E5\u671F',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u5230',
            exportExpensifyCard: '\u5C06 Expensify \u5361\u4EA4\u6613\u5BFC\u51FA\u4E3A',
            account: '\u8D26\u6237',
            accountDescription: '\u9009\u62E9\u53D1\u5E03\u5206\u5F55\u7684\u4F4D\u7F6E\u3002',
            accountsPayable: '\u5E94\u4ED8\u8D26\u6B3E',
            accountsPayableDescription: '\u9009\u62E9\u5728\u54EA\u91CC\u521B\u5EFA\u4F9B\u5E94\u5546\u8D26\u5355\u3002',
            bankAccount: '\u94F6\u884C\u8D26\u6237',
            notConfigured: '\u672A\u914D\u7F6E',
            bankAccountDescription: '\u9009\u62E9\u4ECE\u54EA\u91CC\u53D1\u9001\u652F\u7968\u3002',
            creditCardAccount: '\u4FE1\u7528\u5361\u8D26\u6237',
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u5728\u5BFC\u51FA\u62A5\u544A\u5230 QuickBooks Desktop \u65F6\u4F7F\u7528\u6B64\u65E5\u671F\u3002',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230QuickBooks Desktop\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u62A5\u544A\u63D0\u4EA4\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            exportCheckDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u5F20\u5206\u9879\u652F\u7968\uFF0C\u5E76\u4ECE\u4EE5\u4E0B\u94F6\u884C\u8D26\u6237\u53D1\u9001\u3002',
            exportJournalEntryDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u5206\u9879\u65E5\u8BB0\u8D26\u5206\u5F55\uFF0C\u5E76\u5C06\u5176\u53D1\u5E03\u5230\u4EE5\u4E0B\u8D26\u6237\u3002',
            exportVendorBillDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u5F20\u5206\u9879\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u53D1\u5E03\u5230\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u95F4\u7684\u7B2C\u4E00\u5929\u3002',
            deepDiveExpensifyCard: 'Expensify \u5361\u4EA4\u6613\u5C06\u81EA\u52A8\u5BFC\u51FA\u5230\u4F7F\u7528\u521B\u5EFA\u7684\u201CExpensify \u5361\u8D1F\u503A\u8D26\u6237\u201D\u4E2D',
            deepDiveExpensifyCardIntegration: '\u6211\u4EEC\u7684\u96C6\u6210\u3002',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop \u4E0D\u652F\u6301\u5728\u65E5\u8BB0\u8D26\u5206\u5F55\u5BFC\u51FA\u4E2D\u5305\u542B\u7A0E\u6B3E\u3002\u7531\u4E8E\u60A8\u5728\u5DE5\u4F5C\u533A\u4E2D\u542F\u7528\u4E86\u7A0E\u6B3E\uFF0C\u6B64\u5BFC\u51FA\u9009\u9879\u4E0D\u53EF\u7528\u3002',
            outOfPocketTaxEnabledError:
                '\u542F\u7528\u7A0E\u52A1\u65F6\uFF0C\u65E5\u8BB0\u8D26\u6761\u76EE\u4E0D\u53EF\u7528\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '\u4FE1\u7528\u5361',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\u65E5\u8BB0\u6761\u76EE',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '\u68C0\u67E5',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}\u63CF\u8FF0`]:
                    '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u5F20\u5206\u9879\u652F\u7968\uFF0C\u5E76\u4ECE\u4EE5\u4E0B\u94F6\u884C\u8D26\u6237\u53D1\u9001\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}\u63CF\u8FF0`]:
                    '\u6211\u4EEC\u5C06\u81EA\u52A8\u5C06\u4FE1\u7528\u5361\u4EA4\u6613\u4E2D\u7684\u5546\u6237\u540D\u79F0\u4E0EQuickBooks\u4E2D\u7684\u4EFB\u4F55\u5BF9\u5E94\u4F9B\u5E94\u5546\u5339\u914D\u3002\u5982\u679C\u4E0D\u5B58\u5728\u4F9B\u5E94\u5546\uFF0C\u6211\u4EEC\u5C06\u521B\u5EFA\u4E00\u4E2A\u201C\u4FE1\u7528\u5361\u6742\u9879\u201D\u4F9B\u5E94\u5546\u4EE5\u8FDB\u884C\u5173\u8054\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}\u63CF\u8FF0`]:
                    '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u5F20\u5206\u9879\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u4F7F\u7528\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u53D1\u5E03\u5230\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u95F4\u7684\u7B2C\u4E00\u5929\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}\u8D26\u6237\u63CF\u8FF0`]:
                    '\u9009\u62E9\u5BFC\u51FA\u4FE1\u7528\u5361\u4EA4\u6613\u7684\u76EE\u7684\u5730\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}\u8D26\u6237\u63CF\u8FF0`]:
                    '\u9009\u62E9\u4E00\u4E2A\u4F9B\u5E94\u5546\u4EE5\u5E94\u7528\u4E8E\u6240\u6709\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}\u8D26\u6237\u63CF\u8FF0`]: '\u9009\u62E9\u4ECE\u54EA\u91CC\u53D1\u9001\u652F\u7968\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}\u9519\u8BEF`]:
                    '\u542F\u7528\u4F4D\u7F6E\u65F6\uFF0C\u4F9B\u5E94\u5546\u8D26\u5355\u4E0D\u53EF\u7528\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}\u9519\u8BEF`]:
                    '\u542F\u7528\u4F4D\u7F6E\u65F6\u65E0\u6CD5\u4F7F\u7528\u652F\u7968\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}\u9519\u8BEF`]:
                    '\u542F\u7528\u7A0E\u52A1\u65F6\uFF0C\u65E5\u8BB0\u8D26\u6761\u76EE\u4E0D\u53EF\u7528\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
            },
            noAccountsFound: '\u672A\u627E\u5230\u8D26\u6237',
            noAccountsFoundDescription: '\u5728 QuickBooks Desktop \u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5',
            qbdSetup: 'QuickBooks Desktop \u8BBE\u7F6E',
            requiredSetupDevice: {
                title: '\u65E0\u6CD5\u4ECE\u6B64\u8BBE\u5907\u8FDE\u63A5',
                body1: '\u60A8\u9700\u8981\u4ECE\u6258\u7BA1\u60A8\u7684QuickBooks Desktop\u516C\u53F8\u6587\u4EF6\u7684\u8BA1\u7B97\u673A\u4E0A\u8BBE\u7F6E\u6B64\u8FDE\u63A5\u3002',
                body2: '\u8FDE\u63A5\u540E\uFF0C\u60A8\u5C06\u53EF\u4EE5\u968F\u65F6\u540C\u6B65\u548C\u5BFC\u51FA\u3002',
            },
            setupPage: {
                title: '\u6253\u5F00\u6B64\u94FE\u63A5\u4EE5\u8FDE\u63A5',
                body: '\u8981\u5B8C\u6210\u8BBE\u7F6E\uFF0C\u8BF7\u5728\u8FD0\u884CQuickBooks Desktop\u7684\u8BA1\u7B97\u673A\u4E0A\u6253\u5F00\u4EE5\u4E0B\u94FE\u63A5\u3002',
                setupErrorTitle: '\u51FA\u4E86\u70B9\u95EE\u9898',
                setupErrorBody1: 'QuickBooks Desktop \u8FDE\u63A5\u76EE\u524D\u65E0\u6CD5\u4F7F\u7528\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216',
                setupErrorBody2: '\u5982\u679C\u95EE\u9898\u4ECD\u7136\u5B58\u5728\u3002',
                setupErrorBodyContactConcierge: '\u8054\u7CFBConcierge',
            },
            importDescription: '\u9009\u62E9\u4ECE QuickBooks Desktop \u5BFC\u5165\u5230 Expensify \u7684\u7F16\u7801\u914D\u7F6E\u3002',
            classes: '\u7C7B',
            items: '\u9879\u76EE',
            customers: '\u5BA2\u6237/\u9879\u76EE',
            exportCompanyCardsDescription: '\u8BBE\u7F6E\u516C\u53F8\u5361\u8D2D\u4E70\u5982\u4F55\u5BFC\u51FA\u5230 QuickBooks Desktop\u3002',
            defaultVendorDescription:
                '\u8BBE\u7F6E\u4E00\u4E2A\u9ED8\u8BA4\u4F9B\u5E94\u5546\uFF0C\u8BE5\u4F9B\u5E94\u5546\u5C06\u9002\u7528\u4E8E\u6240\u6709\u5BFC\u51FA\u7684\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
            accountsDescription: '\u60A8\u7684 QuickBooks Desktop \u79D1\u76EE\u8868\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230 Expensify \u4E2D\u3002',
            accountsSwitchTitle: '\u9009\u62E9\u5C06\u65B0\u8D26\u6237\u5BFC\u5165\u4E3A\u542F\u7528\u6216\u7981\u7528\u7C7B\u522B\u3002',
            accountsSwitchDescription: '\u542F\u7528\u7684\u7C7B\u522B\u5C06\u5728\u6210\u5458\u521B\u5EFA\u8D39\u7528\u65F6\u53EF\u4F9B\u9009\u62E9\u3002',
            classesDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Desktop\u7C7B\u522B\u3002',
            tagsDisplayedAsDescription: '\u884C\u9879\u76EE\u7EA7\u522B',
            reportFieldsDisplayedAsDescription: '\u62A5\u544A\u7EA7\u522B',
            customersDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Desktop\u5BA2\u6237/\u9879\u76EE\u3002',
            advancedConfig: {
                autoSyncDescription: 'Expensify\u5C06\u6BCF\u5929\u81EA\u52A8\u4E0EQuickBooks Desktop\u540C\u6B65\u3002',
                createEntities: '\u81EA\u52A8\u521B\u5EFA\u5B9E\u4F53',
                createEntitiesDescription:
                    '\u5982\u679C\u4F9B\u5E94\u5546\u5C1A\u4E0D\u5B58\u5728\uFF0CExpensify \u5C06\u5728 QuickBooks Desktop \u4E2D\u81EA\u52A8\u521B\u5EFA\u4F9B\u5E94\u5546\u3002',
            },
            itemsDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Desktop\u9879\u76EE\u3002',
        },
        qbo: {
            connectedTo: '\u8FDE\u63A5\u5230',
            importDescription: '\u9009\u62E9\u8981\u4ECE QuickBooks Online \u5BFC\u5165\u5230 Expensify \u7684\u7F16\u7801\u914D\u7F6E\u3002',
            classes: '\u7C7B',
            locations: '\u4F4D\u7F6E',
            customers: '\u5BA2\u6237/\u9879\u76EE',
            accountsDescription: '\u60A8\u7684 QuickBooks Online \u79D1\u76EE\u8868\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230 Expensify \u4E2D\u3002',
            accountsSwitchTitle: '\u9009\u62E9\u5C06\u65B0\u8D26\u6237\u5BFC\u5165\u4E3A\u542F\u7528\u6216\u7981\u7528\u7C7B\u522B\u3002',
            accountsSwitchDescription: '\u542F\u7528\u7684\u7C7B\u522B\u5C06\u5728\u6210\u5458\u521B\u5EFA\u8D39\u7528\u65F6\u53EF\u4F9B\u9009\u62E9\u3002',
            classesDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Online\u7C7B\u3002',
            customersDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Online\u5BA2\u6237/\u9879\u76EE\u3002',
            locationsDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Online\u4F4D\u7F6E\u3002',
            taxesDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406QuickBooks Online\u7A0E\u6B3E\u3002',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online \u4E0D\u652F\u6301\u652F\u7968\u6216\u4F9B\u5E94\u5546\u8D26\u5355\u7684\u884C\u7EA7\u4F4D\u7F6E\u3002\u5982\u679C\u60A8\u5E0C\u671B\u5728\u884C\u7EA7\u8BBE\u7F6E\u4F4D\u7F6E\uFF0C\u8BF7\u786E\u4FDD\u4F7F\u7528\u5206\u5F55\u548C\u4FE1\u7528/\u501F\u8BB0\u5361\u8D39\u7528\u3002',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online \u4E0D\u652F\u6301\u65E5\u8BB0\u8D26\u5206\u5F55\u7684\u7A0E\u6B3E\u3002\u8BF7\u5C06\u60A8\u7684\u5BFC\u51FA\u9009\u9879\u66F4\u6539\u4E3A\u4F9B\u5E94\u5546\u8D26\u5355\u6216\u652F\u7968\u3002',
            exportDescription: '\u914D\u7F6E Expensify \u6570\u636E\u5982\u4F55\u5BFC\u51FA\u5230 QuickBooks Online\u3002',
            date: '\u5BFC\u51FA\u65E5\u671F',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u5230',
            exportExpensifyCard: '\u5C06 Expensify \u5361\u4EA4\u6613\u5BFC\u51FA\u4E3A',
            deepDiveExpensifyCard: 'Expensify \u5361\u4EA4\u6613\u5C06\u81EA\u52A8\u5BFC\u51FA\u5230\u4F7F\u7528\u521B\u5EFA\u7684\u201CExpensify \u5361\u8D1F\u503A\u8D26\u6237\u201D\u4E2D',
            deepDiveExpensifyCardIntegration: '\u6211\u4EEC\u7684\u96C6\u6210\u3002',
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u5BFC\u51FA\u62A5\u544A\u5230QuickBooks Online\u65F6\u4F7F\u7528\u6B64\u65E5\u671F\u3002',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230QuickBooks Online\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u62A5\u544A\u63D0\u4EA4\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            receivable: '\u5E94\u6536\u8D26\u6B3E', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '\u5E94\u6536\u8D26\u6B3E\u5B58\u6863', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: '\u5C06\u6B64\u8D26\u6237\u7528\u4E8E\u5BFC\u51FA\u53D1\u7968\u5230 QuickBooks Online\u3002',
            exportCompanyCardsDescription: '\u8BBE\u7F6E\u516C\u53F8\u5361\u8D2D\u4E70\u5982\u4F55\u5BFC\u51FA\u5230 QuickBooks Online\u3002',
            vendor: '\u4F9B\u5E94\u5546',
            defaultVendorDescription:
                '\u8BBE\u7F6E\u4E00\u4E2A\u9ED8\u8BA4\u4F9B\u5E94\u5546\uFF0C\u8BE5\u4F9B\u5E94\u5546\u5C06\u9002\u7528\u4E8E\u6240\u6709\u5BFC\u51FA\u7684\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
            exportOutOfPocketExpensesDescription: '\u8BBE\u7F6E\u81EA\u4ED8\u8D39\u7528\u5982\u4F55\u5BFC\u51FA\u5230QuickBooks Online\u3002',
            exportCheckDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u5F20\u5206\u9879\u652F\u7968\uFF0C\u5E76\u4ECE\u4EE5\u4E0B\u94F6\u884C\u8D26\u6237\u53D1\u9001\u3002',
            exportJournalEntryDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u4E2A\u5206\u9879\u65E5\u8BB0\u8D26\u5206\u5F55\uFF0C\u5E76\u5C06\u5176\u53D1\u5E03\u5230\u4EE5\u4E0B\u8D26\u6237\u3002',
            exportVendorBillDescription:
                '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u5F20\u5206\u9879\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u53D1\u5E03\u5230\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u95F4\u7684\u7B2C\u4E00\u5929\u3002',
            account: '\u8D26\u6237',
            accountDescription: '\u9009\u62E9\u53D1\u5E03\u5206\u5F55\u7684\u4F4D\u7F6E\u3002',
            accountsPayable: '\u5E94\u4ED8\u8D26\u6B3E',
            accountsPayableDescription: '\u9009\u62E9\u5728\u54EA\u91CC\u521B\u5EFA\u4F9B\u5E94\u5546\u8D26\u5355\u3002',
            bankAccount: '\u94F6\u884C\u8D26\u6237',
            notConfigured: '\u672A\u914D\u7F6E',
            bankAccountDescription: '\u9009\u62E9\u4ECE\u54EA\u91CC\u53D1\u9001\u652F\u7968\u3002',
            creditCardAccount: '\u4FE1\u7528\u5361\u8D26\u6237',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online \u4E0D\u652F\u6301\u4F9B\u5E94\u5546\u8D26\u5355\u5BFC\u51FA\u7684\u5730\u70B9\u529F\u80FD\u3002\u7531\u4E8E\u60A8\u5728\u5DE5\u4F5C\u533A\u4E2D\u542F\u7528\u4E86\u5730\u70B9\u529F\u80FD\uFF0C\u6B64\u5BFC\u51FA\u9009\u9879\u4E0D\u53EF\u7528\u3002',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online \u4E0D\u652F\u6301\u65E5\u8BB0\u8D26\u5206\u5F55\u5BFC\u51FA\u7684\u7A0E\u8D39\u529F\u80FD\u3002\u7531\u4E8E\u60A8\u5728\u5DE5\u4F5C\u533A\u542F\u7528\u4E86\u7A0E\u8D39\u529F\u80FD\uFF0C\u6B64\u5BFC\u51FA\u9009\u9879\u4E0D\u53EF\u7528\u3002',
            outOfPocketTaxEnabledError:
                '\u542F\u7528\u7A0E\u52A1\u65F6\uFF0C\u65E5\u8BB0\u8D26\u6761\u76EE\u4E0D\u53EF\u7528\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
            advancedConfig: {
                autoSyncDescription: 'Expensify\u4F1A\u6BCF\u5929\u81EA\u52A8\u4E0EQuickBooks Online\u540C\u6B65\u3002',
                inviteEmployees: '\u9080\u8BF7\u5458\u5DE5',
                inviteEmployeesDescription: '\u5BFC\u5165 QuickBooks Online \u5458\u5DE5\u8BB0\u5F55\u5E76\u9080\u8BF7\u5458\u5DE5\u52A0\u5165\u6B64\u5DE5\u4F5C\u533A\u3002',
                createEntities: '\u81EA\u52A8\u521B\u5EFA\u5B9E\u4F53',
                createEntitiesDescription:
                    '\u5982\u679C\u4F9B\u5E94\u5546\u5C1A\u4E0D\u5B58\u5728\uFF0CExpensify \u5C06\u5728 QuickBooks Online \u4E2D\u81EA\u52A8\u521B\u5EFA\u4F9B\u5E94\u5546\uFF0C\u5E76\u5728\u5BFC\u51FA\u53D1\u7968\u65F6\u81EA\u52A8\u521B\u5EFA\u5BA2\u6237\u3002',
                reimbursedReportsDescription:
                    '\u6BCF\u5F53\u4F7F\u7528 Expensify ACH \u652F\u4ED8\u62A5\u9500\u5355\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u4ED8\u6B3E\u5C06\u5728\u4E0B\u9762\u7684 QuickBooks Online \u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
                qboBillPaymentAccount: 'QuickBooks\u8D26\u5355\u652F\u4ED8\u8D26\u6237',
                qboInvoiceCollectionAccount: 'QuickBooks \u53D1\u7968\u6536\u6B3E\u8D26\u6237',
                accountSelectDescription: '\u9009\u62E9\u4ECE\u54EA\u91CC\u652F\u4ED8\u8D26\u5355\uFF0C\u6211\u4EEC\u5C06\u5728QuickBooks Online\u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
                invoiceAccountSelectorDescription:
                    '\u9009\u62E9\u63A5\u6536\u53D1\u7968\u4ED8\u6B3E\u7684\u8D26\u6237\uFF0C\u6211\u4EEC\u5C06\u5728 QuickBooks Online \u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '\u501F\u8BB0\u5361',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '\u4FE1\u7528\u5361',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\u65E5\u8BB0\u6761\u76EE',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '\u68C0\u67E5',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}\u63CF\u8FF0`]:
                    '\u6211\u4EEC\u4F1A\u81EA\u52A8\u5C06\u501F\u8BB0\u5361\u4EA4\u6613\u4E2D\u7684\u5546\u6237\u540D\u79F0\u4E0EQuickBooks\u4E2D\u7684\u4EFB\u4F55\u76F8\u5E94\u4F9B\u5E94\u5546\u5339\u914D\u3002\u5982\u679C\u6CA1\u6709\u4F9B\u5E94\u5546\u5B58\u5728\uFF0C\u6211\u4EEC\u5C06\u521B\u5EFA\u4E00\u4E2A\u201C\u501F\u8BB0\u5361\u6742\u9879\u201D\u4F9B\u5E94\u5546\u8FDB\u884C\u5173\u8054\u3002',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}\u63CF\u8FF0`]:
                    '\u6211\u4EEC\u5C06\u81EA\u52A8\u5C06\u4FE1\u7528\u5361\u4EA4\u6613\u4E2D\u7684\u5546\u6237\u540D\u79F0\u4E0EQuickBooks\u4E2D\u7684\u4EFB\u4F55\u5BF9\u5E94\u4F9B\u5E94\u5546\u5339\u914D\u3002\u5982\u679C\u4E0D\u5B58\u5728\u4F9B\u5E94\u5546\uFF0C\u6211\u4EEC\u5C06\u521B\u5EFA\u4E00\u4E2A\u201C\u4FE1\u7528\u5361\u6742\u9879\u201D\u4F9B\u5E94\u5546\u4EE5\u8FDB\u884C\u5173\u8054\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}\u63CF\u8FF0`]:
                    '\u6211\u4EEC\u5C06\u4E3A\u6BCF\u4E2AExpensify\u62A5\u544A\u521B\u5EFA\u4E00\u5F20\u5206\u9879\u4F9B\u5E94\u5546\u8D26\u5355\uFF0C\u4F7F\u7528\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F\uFF0C\u5E76\u5C06\u5176\u6DFB\u52A0\u5230\u4E0B\u9762\u7684\u8D26\u6237\u4E2D\u3002\u5982\u679C\u6B64\u671F\u95F4\u5DF2\u5173\u95ED\uFF0C\u6211\u4EEC\u5C06\u53D1\u5E03\u5230\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F\u95F4\u7684\u7B2C\u4E00\u5929\u3002',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}\u8D26\u6237\u63CF\u8FF0`]:
                    '\u9009\u62E9\u5BFC\u51FA\u501F\u8BB0\u5361\u4EA4\u6613\u7684\u4F4D\u7F6E\u3002',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}\u8D26\u6237\u63CF\u8FF0`]:
                    '\u9009\u62E9\u5BFC\u51FA\u4FE1\u7528\u5361\u4EA4\u6613\u7684\u76EE\u7684\u5730\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}\u8D26\u6237\u63CF\u8FF0`]:
                    '\u9009\u62E9\u4E00\u4E2A\u4F9B\u5E94\u5546\u4EE5\u5E94\u7528\u4E8E\u6240\u6709\u4FE1\u7528\u5361\u4EA4\u6613\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}\u9519\u8BEF`]:
                    '\u542F\u7528\u4F4D\u7F6E\u65F6\uFF0C\u4F9B\u5E94\u5546\u8D26\u5355\u4E0D\u53EF\u7528\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}\u9519\u8BEF`]:
                    '\u542F\u7528\u4F4D\u7F6E\u65F6\u65E0\u6CD5\u4F7F\u7528\u652F\u7968\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}\u9519\u8BEF`]:
                    '\u542F\u7528\u7A0E\u52A1\u65F6\uFF0C\u65E5\u8BB0\u8D26\u6761\u76EE\u4E0D\u53EF\u7528\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u5BFC\u51FA\u9009\u9879\u3002',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u8D26\u6237\u4EE5\u5BFC\u51FA\u4F9B\u5E94\u5546\u8D26\u5355',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u8D26\u6237\u8FDB\u884C\u65E5\u8BB0\u8D26\u5BFC\u51FA',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u7684\u8D26\u6237\u8FDB\u884C\u652F\u7968\u5BFC\u51FA',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    '\u8981\u4F7F\u7528\u4F9B\u5E94\u5546\u8D26\u5355\u5BFC\u51FA\uFF0C\u8BF7\u5728QuickBooks Online\u4E2D\u8BBE\u7F6E\u5E94\u4ED8\u8D26\u6B3E\u8D26\u6237\u3002',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]:
                    '\u8981\u4F7F\u7528\u5206\u5F55\u5BFC\u51FA\u529F\u80FD\uFF0C\u8BF7\u5728 QuickBooks Online \u4E2D\u8BBE\u7F6E\u4E00\u4E2A\u5206\u5F55\u8D26\u6237\u3002',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]:
                    '\u8981\u4F7F\u7528\u652F\u7968\u5BFC\u51FA\uFF0C\u8BF7\u5728QuickBooks Online\u4E2D\u8BBE\u7F6E\u94F6\u884C\u8D26\u6237\u3002',
            },
            noAccountsFound: '\u672A\u627E\u5230\u8D26\u6237',
            noAccountsFoundDescription: '\u5728 QuickBooks Online \u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            accountingMethods: {
                label: '\u4F55\u65F6\u5BFC\u51FA',
                description: '\u9009\u62E9\u4F55\u65F6\u5BFC\u51FA\u8D39\u7528\uFF1A',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\u5E94\u8BA1',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\u73B0\u91D1',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\u81EA\u4ED8\u8D39\u7528\u5C06\u5728\u6700\u7EC8\u6279\u51C6\u65F6\u5BFC\u51FA',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\u81EA\u4ED8\u8D39\u7528\u5C06\u5728\u652F\u4ED8\u65F6\u5BFC\u51FA',
                },
            },
        },
        workspaceList: {
            joinNow: '\u7ACB\u5373\u52A0\u5165',
            askToJoin: '\u8BF7\u6C42\u52A0\u5165',
        },
        xero: {
            organization: 'Xero \u7EC4\u7EC7',
            organizationDescription: '\u9009\u62E9\u60A8\u60F3\u8981\u4ECE\u4E2D\u5BFC\u5165\u6570\u636E\u7684 Xero \u7EC4\u7EC7\u3002',
            importDescription: '\u9009\u62E9\u4ECEXero\u5BFC\u5165\u5230Expensify\u7684\u7F16\u7801\u914D\u7F6E\u3002',
            accountsDescription: '\u60A8\u7684 Xero \u79D1\u76EE\u8868\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230 Expensify \u4E2D\u3002',
            accountsSwitchTitle: '\u9009\u62E9\u5C06\u65B0\u8D26\u6237\u5BFC\u5165\u4E3A\u542F\u7528\u6216\u7981\u7528\u7C7B\u522B\u3002',
            accountsSwitchDescription: '\u542F\u7528\u7684\u7C7B\u522B\u5C06\u5728\u6210\u5458\u521B\u5EFA\u8D39\u7528\u65F6\u53EF\u4F9B\u9009\u62E9\u3002',
            trackingCategories: '\u8DDF\u8E2A\u7C7B\u522B',
            trackingCategoriesDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406Xero\u8DDF\u8E2A\u7C7B\u522B\u3002',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `\u5C06 Xero ${categoryName} \u6620\u5C04\u5230`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) =>
                `\u9009\u62E9\u5728\u5BFC\u51FA\u5230Xero\u65F6\u5C06${categoryName}\u6620\u5C04\u5230\u54EA\u91CC\u3002`,
            customers: '\u91CD\u65B0\u5411\u5BA2\u6237\u5F00\u8D26\u5355',
            customersDescription:
                '\u9009\u62E9\u662F\u5426\u5728Expensify\u4E2D\u91CD\u65B0\u5411\u5BA2\u6237\u5F00\u8D26\u5355\u3002\u60A8\u7684Xero\u5BA2\u6237\u8054\u7CFB\u4EBA\u53EF\u4EE5\u6807\u8BB0\u5230\u8D39\u7528\u4E2D\uFF0C\u5E76\u5C06\u4F5C\u4E3A\u9500\u552E\u53D1\u7968\u5BFC\u51FA\u5230Xero\u3002',
            taxesDescription: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406Xero\u7A0E\u6B3E\u3002',
            notImported: '\u672A\u5BFC\u5165',
            notConfigured: '\u672A\u914D\u7F6E',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero \u8054\u7CFB\u4EBA\u9ED8\u8BA4\u503C',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '\u6807\u7B7E',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '\u62A5\u544A\u5B57\u6BB5',
            },
            exportDescription: '\u914D\u7F6E Expensify \u6570\u636E\u5982\u4F55\u5BFC\u51FA\u5230 Xero\u3002',
            purchaseBill: '\u91C7\u8D2D\u8D26\u5355',
            exportDeepDiveCompanyCard:
                '\u5BFC\u51FA\u7684\u8D39\u7528\u5C06\u4F5C\u4E3A\u94F6\u884C\u4EA4\u6613\u53D1\u5E03\u5230\u4E0B\u9762\u7684Xero\u94F6\u884C\u8D26\u6237\uFF0C\u4EA4\u6613\u65E5\u671F\u5C06\u4E0E\u60A8\u7684\u94F6\u884C\u5BF9\u8D26\u5355\u4E0A\u7684\u65E5\u671F\u76F8\u5339\u914D\u3002',
            bankTransactions: '\u94F6\u884C\u4EA4\u6613',
            xeroBankAccount: 'Xero \u94F6\u884C\u8D26\u6237',
            xeroBankAccountDescription: '\u9009\u62E9\u8D39\u7528\u5C06\u4F5C\u4E3A\u94F6\u884C\u4EA4\u6613\u8BB0\u5F55\u7684\u4F4D\u7F6E\u3002',
            exportExpensesDescription:
                '\u62A5\u544A\u5C06\u5BFC\u51FA\u4E3A\u91C7\u8D2D\u8D26\u5355\uFF0C\u5E76\u4F7F\u7528\u4EE5\u4E0B\u9009\u62E9\u7684\u65E5\u671F\u548C\u72B6\u6001\u3002',
            purchaseBillDate: '\u8D2D\u4E70\u8D26\u5355\u65E5\u671F',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u4E3A',
            salesInvoice: '\u9500\u552E\u53D1\u7968',
            exportInvoicesDescription: '\u9500\u552E\u53D1\u7968\u59CB\u7EC8\u663E\u793A\u53D1\u7968\u53D1\u9001\u7684\u65E5\u671F\u3002',
            advancedConfig: {
                autoSyncDescription: 'Expensify\u4F1A\u6BCF\u5929\u81EA\u52A8\u4E0EXero\u540C\u6B65\u3002',
                purchaseBillStatusTitle: '\u91C7\u8D2D\u8D26\u5355\u72B6\u6001',
                reimbursedReportsDescription:
                    '\u6BCF\u5F53\u4F7F\u7528 Expensify ACH \u652F\u4ED8\u62A5\u544A\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u4ED8\u6B3E\u5C06\u5728\u4E0B\u9762\u7684 Xero \u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
                xeroBillPaymentAccount: 'Xero\u8D26\u5355\u4ED8\u6B3E\u8D26\u6237',
                xeroInvoiceCollectionAccount: 'Xero \u53D1\u7968\u6536\u6B3E\u8D26\u6237',
                xeroBillPaymentAccountDescription: '\u9009\u62E9\u4ECE\u54EA\u91CC\u652F\u4ED8\u8D26\u5355\uFF0C\u6211\u4EEC\u5C06\u5728Xero\u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
                invoiceAccountSelectorDescription: '\u9009\u62E9\u63A5\u6536\u53D1\u7968\u4ED8\u6B3E\u7684\u8D26\u6237\uFF0C\u6211\u4EEC\u5C06\u5728Xero\u4E2D\u521B\u5EFA\u4ED8\u6B3E\u3002',
            },
            exportDate: {
                label: '\u8D2D\u4E70\u8D26\u5355\u65E5\u671F',
                description: '\u5728\u5BFC\u51FA\u62A5\u544A\u5230Xero\u65F6\u4F7F\u7528\u6B64\u65E5\u671F\u3002',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230Xero\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u62A5\u544A\u63D0\u4EA4\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            invoiceStatus: {
                label: '\u91C7\u8D2D\u8D26\u5355\u72B6\u6001',
                description: '\u5C06\u6B64\u72B6\u6001\u7528\u4E8E\u5C06\u91C7\u8D2D\u8D26\u5355\u5BFC\u51FA\u5230Xero\u65F6\u3002',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '\u8349\u7A3F',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '\u7B49\u5F85\u6279\u51C6',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '\u7B49\u5F85\u4ED8\u6B3E',
                },
            },
            noAccountsFound: '\u672A\u627E\u5230\u8D26\u6237',
            noAccountsFoundDescription: '\u8BF7\u5728Xero\u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5',
        },
        sageIntacct: {
            preferredExporter: '\u9996\u9009\u5BFC\u51FA\u5668',
            taxSolution: '\u7A0E\u52A1\u89E3\u51B3\u65B9\u6848',
            notConfigured: '\u672A\u914D\u7F6E',
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u5BFC\u51FA\u62A5\u544A\u5230 Sage Intacct \u65F6\u4F7F\u7528\u6B64\u65E5\u671F\u3002',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230Sage Intacct\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u62A5\u544A\u63D0\u4EA4\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            reimbursableExpenses: {
                description: '\u8BBE\u7F6E\u81EA\u638F\u8170\u5305\u7684\u8D39\u7528\u5982\u4F55\u5BFC\u51FA\u5230Sage Intacct\u3002',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '\u8D39\u7528\u62A5\u544A',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                },
            },
            nonReimbursableExpenses: {
                description: '\u8BBE\u7F6E\u516C\u53F8\u5361\u8D2D\u4E70\u5982\u4F55\u5BFC\u51FA\u5230 Sage Intacct\u3002',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '\u4FE1\u7528\u5361',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '\u4F9B\u5E94\u5546\u8D26\u5355',
                },
            },
            creditCardAccount: '\u4FE1\u7528\u5361\u8D26\u6237',
            defaultVendor: '\u9ED8\u8BA4\u4F9B\u5E94\u5546',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `\u8BBE\u7F6E\u4E00\u4E2A\u9ED8\u8BA4\u4F9B\u5E94\u5546\uFF0C\u5C06\u5E94\u7528\u4E8E\u5728 Sage Intacct \u4E2D\u6CA1\u6709\u5339\u914D\u4F9B\u5E94\u5546\u7684${isReimbursable ? '' : '\u975E'}\u53EF\u62A5\u9500\u8D39\u7528\u3002`,
            exportDescription: '\u914D\u7F6E\u5982\u4F55\u5C06Expensify\u6570\u636E\u5BFC\u51FA\u5230Sage Intacct\u3002',
            exportPreferredExporterNote:
                '\u9996\u9009\u5BFC\u51FA\u8005\u53EF\u4EE5\u662F\u4EFB\u4F55\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\uFF0C\u4F46\u5982\u679C\u60A8\u5728\u57DF\u8BBE\u7F6E\u4E2D\u4E3A\u5355\u4E2A\u516C\u53F8\u5361\u8BBE\u7F6E\u4E86\u4E0D\u540C\u7684\u5BFC\u51FA\u8D26\u6237\uFF0C\u5219\u8FD8\u5FC5\u987B\u662F\u57DF\u7BA1\u7406\u5458\u3002',
            exportPreferredExporterSubNote:
                '\u4E00\u65E6\u8BBE\u7F6E\uFF0C\u9996\u9009\u5BFC\u51FA\u8005\u5C06\u5728\u5176\u8D26\u6237\u4E2D\u770B\u5230\u8981\u5BFC\u51FA\u7684\u62A5\u544A\u3002',
            noAccountsFound: '\u672A\u627E\u5230\u8D26\u6237',
            noAccountsFoundDescription: `\u8BF7\u5728 Sage Intacct \u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002`,
            autoSync: '\u81EA\u52A8\u540C\u6B65',
            autoSyncDescription: 'Expensify\u5C06\u6BCF\u5929\u81EA\u52A8\u4E0ESage Intacct\u540C\u6B65\u3002',
            inviteEmployees: '\u9080\u8BF7\u5458\u5DE5',
            inviteEmployeesDescription:
                '\u5BFC\u5165 Sage Intacct \u5458\u5DE5\u8BB0\u5F55\u5E76\u9080\u8BF7\u5458\u5DE5\u52A0\u5165\u6B64\u5DE5\u4F5C\u533A\u3002\u60A8\u7684\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B\u5C06\u9ED8\u8BA4\u4E3A\u7ECF\u7406\u5BA1\u6279\uFF0C\u5E76\u53EF\u4EE5\u5728\u6210\u5458\u9875\u9762\u4E0A\u8FDB\u884C\u8FDB\u4E00\u6B65\u914D\u7F6E\u3002',
            syncReimbursedReports: '\u540C\u6B65\u5DF2\u62A5\u9500\u7684\u62A5\u544A',
            syncReimbursedReportsDescription:
                '\u6BCF\u5F53\u4F7F\u7528 Expensify ACH \u652F\u4ED8\u62A5\u544A\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u4ED8\u6B3E\u5C06\u5728\u4E0B\u9762\u7684 Sage Intacct \u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
            paymentAccount: 'Sage Intacct\u652F\u4ED8\u8D26\u6237',
        },
        netsuite: {
            subsidiary: '\u5B50\u516C\u53F8',
            subsidiarySelectDescription: '\u9009\u62E9\u60A8\u60F3\u4ECE NetSuite \u5BFC\u5165\u6570\u636E\u7684\u5B50\u516C\u53F8\u3002',
            exportDescription: '\u914D\u7F6E\u5982\u4F55\u5C06Expensify\u6570\u636E\u5BFC\u51FA\u5230NetSuite\u3002',
            exportInvoices: '\u5BFC\u51FA\u53D1\u7968\u5230',
            journalEntriesTaxPostingAccount: '\u65E5\u8BB0\u8D26\u5206\u5F55\u7A0E\u52A1\u8FC7\u8D26\u8D26\u6237',
            journalEntriesProvTaxPostingAccount: '\u5206\u5F55\u7701\u7A0E\u8FC7\u8D26\u8D26\u6237',
            foreignCurrencyAmount: '\u5BFC\u51FA\u5916\u5E01\u91D1\u989D',
            exportToNextOpenPeriod: '\u5BFC\u51FA\u5230\u4E0B\u4E00\u4E2A\u5F00\u653E\u671F',
            nonReimbursableJournalPostingAccount: '\u4E0D\u53EF\u62A5\u9500\u7684\u65E5\u8BB0\u8D26\u8FC7\u8D26\u8D26\u6237',
            reimbursableJournalPostingAccount: '\u53EF\u62A5\u9500\u7684\u65E5\u8BB0\u8D26\u8FC7\u8D26\u8D26\u6237',
            journalPostingPreference: {
                label: '\u65E5\u8BB0\u8D26\u5206\u5F55\u53D1\u5E03\u504F\u597D',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '\u6BCF\u4E2A\u62A5\u544A\u7684\u5355\u4E2A\u5206\u9879\u6761\u76EE',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '\u6BCF\u7B14\u8D39\u7528\u7684\u5355\u72EC\u6761\u76EE',
                },
            },
            invoiceItem: {
                label: '\u53D1\u7968\u9879\u76EE',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '\u4E3A\u6211\u521B\u5EFA\u4E00\u4E2A',
                        description:
                            '\u5728\u5BFC\u51FA\u65F6\uFF0C\u6211\u4EEC\u5C06\u4E3A\u60A8\u521B\u5EFA\u4E00\u4E2A\u201CExpensify \u53D1\u7968\u9879\u76EE\u201D\uFF08\u5982\u679C\u5C1A\u4E0D\u5B58\u5728\u7684\u8BDD\uFF09\u3002',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '\u9009\u62E9\u73B0\u6709',
                        description: '\u6211\u4EEC\u4F1A\u5C06\u6765\u81EAExpensify\u7684\u53D1\u7968\u4E0E\u4E0B\u65B9\u9009\u62E9\u7684\u9879\u76EE\u5173\u8054\u3002',
                    },
                },
            },
            exportDate: {
                label: '\u5BFC\u51FA\u65E5\u671F',
                description: '\u5BFC\u51FA\u62A5\u544A\u5230NetSuite\u65F6\u4F7F\u7528\u6B64\u65E5\u671F\u3002',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\u6700\u540E\u4E00\u7B14\u8D39\u7528\u7684\u65E5\u671F',
                        description: '\u62A5\u544A\u4E2D\u6700\u8FD1\u8D39\u7528\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '\u5BFC\u51FA\u65E5\u671F',
                        description: '\u62A5\u544A\u5BFC\u51FA\u5230NetSuite\u7684\u65E5\u671F\u3002',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '\u63D0\u4EA4\u65E5\u671F',
                        description: '\u62A5\u544A\u63D0\u4EA4\u5BA1\u6279\u7684\u65E5\u671F\u3002',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '\u8D39\u7528\u62A5\u544A',
                        reimbursableDescription: '\u81EA\u4ED8\u8D39\u7528\u5C06\u4F5C\u4E3A\u8D39\u7528\u62A5\u544A\u5BFC\u51FA\u5230 NetSuite\u3002',
                        nonReimbursableDescription: '\u516C\u53F8\u5361\u8D39\u7528\u5C06\u4F5C\u4E3A\u8D39\u7528\u62A5\u544A\u5BFC\u51FA\u5230NetSuite\u3002',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '\u4F9B\u5E94\u5546\u8D26\u5355',
                        reimbursableDescription:
                            'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription:
                            'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '\u65E5\u8BB0\u5206\u5F55',
                        reimbursableDescription:
                            'Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription:
                            'Company card expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                },
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify\u5C06\u6BCF\u5929\u81EA\u52A8\u4E0ENetSuite\u540C\u6B65\u3002',
                reimbursedReportsDescription:
                    '\u6BCF\u5F53\u4F7F\u7528 Expensify ACH \u652F\u4ED8\u62A5\u544A\u65F6\uFF0C\u76F8\u5E94\u7684\u8D26\u5355\u4ED8\u6B3E\u5C06\u5728\u4E0B\u9762\u7684 NetSuite \u8D26\u6237\u4E2D\u521B\u5EFA\u3002',
                reimbursementsAccount: '\u62A5\u9500\u8D26\u6237',
                reimbursementsAccountDescription:
                    '\u9009\u62E9\u60A8\u5C06\u7528\u4E8E\u62A5\u9500\u7684\u94F6\u884C\u8D26\u6237\uFF0C\u6211\u4EEC\u5C06\u5728NetSuite\u4E2D\u521B\u5EFA\u76F8\u5173\u4ED8\u6B3E\u3002',
                collectionsAccount: '\u50AC\u6536\u8D26\u6237',
                collectionsAccountDescription:
                    '\u4E00\u65E6\u53D1\u7968\u5728Expensify\u4E2D\u6807\u8BB0\u4E3A\u5DF2\u652F\u4ED8\u5E76\u5BFC\u51FA\u5230NetSuite\uFF0C\u5B83\u5C06\u663E\u793A\u5728\u4EE5\u4E0B\u8D26\u6237\u4E2D\u3002',
                approvalAccount: 'A/P\u5BA1\u6279\u8D26\u6237',
                approvalAccountDescription:
                    '\u9009\u62E9\u5C06\u5728 NetSuite \u4E2D\u6279\u51C6\u4EA4\u6613\u7684\u8D26\u6237\u3002\u5982\u679C\u60A8\u6B63\u5728\u540C\u6B65\u62A5\u9500\u62A5\u544A\uFF0C\u8FD9\u4E5F\u662F\u521B\u5EFA\u8D26\u5355\u4ED8\u6B3E\u7684\u8D26\u6237\u3002',
                defaultApprovalAccount: 'NetSuite \u9ED8\u8BA4\u8BBE\u7F6E',
                inviteEmployees: '\u9080\u8BF7\u5458\u5DE5\u5E76\u8BBE\u7F6E\u5BA1\u6279\u6D41\u7A0B',
                inviteEmployeesDescription:
                    '\u5BFC\u5165 NetSuite \u5458\u5DE5\u8BB0\u5F55\u5E76\u9080\u8BF7\u5458\u5DE5\u52A0\u5165\u6B64\u5DE5\u4F5C\u533A\u3002\u60A8\u7684\u5BA1\u6279\u6D41\u7A0B\u5C06\u9ED8\u8BA4\u8BBE\u7F6E\u4E3A\u7ECF\u7406\u5BA1\u6279\uFF0C\u5E76\u53EF\u4EE5\u5728*\u6210\u5458*\u9875\u9762\u4E0A\u8FDB\u4E00\u6B65\u914D\u7F6E\u3002',
                autoCreateEntities: '\u81EA\u52A8\u521B\u5EFA\u5458\u5DE5/\u4F9B\u5E94\u5546',
                enableCategories: '\u542F\u7528\u65B0\u5BFC\u5165\u7684\u7C7B\u522B',
                customFormID: '\u81EA\u5B9A\u4E49\u8868\u5355 ID',
                customFormIDDescription:
                    '\u9ED8\u8BA4\u60C5\u51B5\u4E0B\uFF0CExpensify \u5C06\u4F7F\u7528\u5728 NetSuite \u4E2D\u8BBE\u7F6E\u7684\u9996\u9009\u4EA4\u6613\u8868\u5355\u521B\u5EFA\u6761\u76EE\u3002\u6216\u8005\uFF0C\u60A8\u53EF\u4EE5\u6307\u5B9A\u4F7F\u7528\u7279\u5B9A\u7684\u4EA4\u6613\u8868\u5355\u3002',
                customFormIDReimbursable: '\u81EA\u4ED8\u8D39\u7528',
                customFormIDNonReimbursable: '\u516C\u53F8\u5361\u8D39\u7528',
                exportReportsTo: {
                    label: '\u8D39\u7528\u62A5\u544A\u5BA1\u6279\u7EA7\u522B',
                    description:
                        '\u4E00\u65E6\u5728Expensify\u4E2D\u6279\u51C6\u4E86\u8D39\u7528\u62A5\u544A\u5E76\u5BFC\u51FA\u5230NetSuite\u540E\uFF0C\u60A8\u53EF\u4EE5\u5728NetSuite\u4E2D\u8BBE\u7F6E\u989D\u5916\u7684\u5BA1\u6279\u5C42\u7EA7\u4EE5\u4FBF\u5728\u53D1\u5E03\u4E4B\u524D\u8FDB\u884C\u5BA1\u6279\u3002',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite \u9ED8\u8BA4\u9996\u9009\u9879',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '\u4EC5\u9650\u4E3B\u7BA1\u6279\u51C6',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '\u4EC5\u4F1A\u8BA1\u6279\u51C6',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '\u4E3B\u7BA1\u548C\u4F1A\u8BA1\u5DF2\u6279\u51C6',
                    },
                },
                accountingMethods: {
                    label: '\u4F55\u65F6\u5BFC\u51FA',
                    description: '\u9009\u62E9\u4F55\u65F6\u5BFC\u51FA\u8D39\u7528\uFF1A',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\u5E94\u8BA1',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\u73B0\u91D1',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\u81EA\u4ED8\u8D39\u7528\u5C06\u5728\u6700\u7EC8\u6279\u51C6\u65F6\u5BFC\u51FA',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\u81EA\u4ED8\u8D39\u7528\u5C06\u5728\u652F\u4ED8\u65F6\u5BFC\u51FA',
                    },
                },
                exportVendorBillsTo: {
                    label: '\u4F9B\u5E94\u5546\u8D26\u5355\u5BA1\u6279\u7EA7\u522B',
                    description:
                        '\u4E00\u65E6\u4F9B\u5E94\u5546\u8D26\u5355\u5728Expensify\u4E2D\u83B7\u5F97\u6279\u51C6\u5E76\u5BFC\u51FA\u5230NetSuite\u540E\uFF0C\u60A8\u53EF\u4EE5\u5728NetSuite\u4E2D\u8BBE\u7F6E\u989D\u5916\u7684\u5BA1\u6279\u7EA7\u522B\uFF0C\u7136\u540E\u518D\u53D1\u5E03\u3002',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite \u9ED8\u8BA4\u9996\u9009\u9879',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '\u5F85\u6279\u51C6',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '\u6279\u51C6\u53D1\u5E03',
                    },
                },
                exportJournalsTo: {
                    label: '\u65E5\u8BB0\u5206\u5F55\u5BA1\u6279\u7EA7\u522B',
                    description:
                        '\u4E00\u65E6\u5728Expensify\u4E2D\u6279\u51C6\u4E86\u65E5\u8BB0\u8D26\u5206\u5F55\u5E76\u5BFC\u51FA\u5230NetSuite\uFF0C\u60A8\u53EF\u4EE5\u5728NetSuite\u4E2D\u8BBE\u7F6E\u989D\u5916\u7684\u5BA1\u6279\u7EA7\u522B\uFF0C\u7136\u540E\u518D\u8FDB\u884C\u8FC7\u8D26\u3002',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite \u9ED8\u8BA4\u9996\u9009\u9879',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '\u5F85\u6279\u51C6',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '\u6279\u51C6\u53D1\u5E03',
                    },
                },
                error: {
                    customFormID: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u6570\u5B57\u81EA\u5B9A\u4E49\u8868\u5355ID',
                },
            },
            noAccountsFound: '\u672A\u627E\u5230\u8D26\u6237',
            noAccountsFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            noVendorsFound: '\u672A\u627E\u5230\u4F9B\u5E94\u5546',
            noVendorsFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u4F9B\u5E94\u5546\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5',
            noItemsFound: '\u672A\u627E\u5230\u53D1\u7968\u9879\u76EE',
            noItemsFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u53D1\u7968\u9879\u76EE\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5\u3002',
            noSubsidiariesFound: '\u672A\u627E\u5230\u5B50\u516C\u53F8',
            noSubsidiariesFoundDescription: '\u8BF7\u5728NetSuite\u4E2D\u6DFB\u52A0\u4E00\u4E2A\u5B50\u516C\u53F8\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5',
            tokenInput: {
                title: 'NetSuite \u8BBE\u7F6E',
                formSteps: {
                    installBundle: {
                        title: '\u5B89\u88C5 Expensify \u5957\u4EF6',
                        description:
                            '\u5728 NetSuite \u4E2D\uFF0C\u8FDB\u5165 *Customization > SuiteBundler > Search & Install Bundles* > \u641C\u7D22 "Expensify" > \u5B89\u88C5\u8BE5\u6346\u7ED1\u5305\u3002',
                    },
                    enableTokenAuthentication: {
                        title: '\u542F\u7528\u57FA\u4E8E\u4EE4\u724C\u7684\u8EAB\u4EFD\u9A8C\u8BC1',
                        description:
                            '\u5728 NetSuite \u4E2D\uFF0C\u4F9D\u6B21\u8F6C\u5230 *Setup > Company > Enable Features > SuiteCloud* > \u542F\u7528 *token-based authentication*\u3002',
                    },
                    enableSoapServices: {
                        title: '\u542F\u7528SOAP\u7F51\u7EDC\u670D\u52A1',
                        description: '\u5728 NetSuite \u4E2D\uFF0C\u8F6C\u5230 *Setup > Company > Enable Features > SuiteCloud* > \u542F\u7528 *SOAP Web Services*\u3002',
                    },
                    createAccessToken: {
                        title: '\u521B\u5EFA\u8BBF\u95EE\u4EE4\u724C',
                        description:
                            '\u5728 NetSuite \u4E2D\uFF0C\u524D\u5F80 *Setup > Users/Roles > Access Tokens*\uFF0C\u4E3A "Expensify" \u5E94\u7528\u548C "Expensify Integration" \u6216 "Administrator" \u89D2\u8272\u521B\u5EFA\u4E00\u4E2A\u8BBF\u95EE\u4EE4\u724C\u3002\n\n*\u91CD\u8981\uFF1A* \u786E\u4FDD\u60A8\u4FDD\u5B58\u6B64\u6B65\u9AA4\u4E2D\u7684 *Token ID* \u548C *Token Secret*\u3002\u60A8\u5C06\u5728\u4E0B\u4E00\u6B65\u4E2D\u9700\u8981\u5B83\u3002',
                    },
                    enterCredentials: {
                        title: '\u8F93\u5165\u60A8\u7684 NetSuite \u51ED\u8BC1',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: '\u4EE4\u724CID',
                            netSuiteTokenSecret: '\u4EE4\u724C\u5BC6\u94A5',
                        },
                        netSuiteAccountIDDescription: '\u5728 NetSuite \u4E2D\uFF0C\u8F6C\u5230 *Setup > Integration > SOAP Web Services Preferences*\u3002',
                    },
                },
            },
            import: {
                expenseCategories: '\u8D39\u7528\u7C7B\u522B',
                expenseCategoriesDescription: '\u60A8\u7684 NetSuite \u8D39\u7528\u7C7B\u522B\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230 Expensify \u4E2D\u3002',
                crossSubsidiaryCustomers: '\u8DE8\u5B50\u516C\u53F8\u5BA2\u6237/\u9879\u76EE',
                importFields: {
                    departments: {
                        title: '\u90E8\u95E8',
                        subtitle: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406NetSuite *departments*\u3002',
                    },
                    classes: {
                        title: '\u7C7B',
                        subtitle: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406*classes*\u3002',
                    },
                    locations: {
                        title: '\u4F4D\u7F6E',
                        subtitle: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406*\u4F4D\u7F6E*\u3002',
                    },
                },
                customersOrJobs: {
                    title: '\u5BA2\u6237/\u9879\u76EE',
                    subtitle: '\u9009\u62E9\u5982\u4F55\u5728Expensify\u4E2D\u5904\u7406NetSuite\u7684*\u5BA2\u6237*\u548C*\u9879\u76EE*\u3002',
                    importCustomers: '\u5BFC\u5165\u5BA2\u6237',
                    importJobs: '\u5BFC\u5165\u9879\u76EE',
                    customers: '\u5BA2\u6237',
                    jobs: '\u9879\u76EE',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('\u548C')}, ${importType}`,
                },
                importTaxDescription: '\u4ECENetSuite\u5BFC\u5165\u7A0E\u52A1\u7EC4\u3002',
                importCustomFields: {
                    chooseOptionBelow: '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u9009\u9879\uFF1A',
                    label: ({importedTypes}: ImportedTypesParams) => `\u5BFC\u5165\u4E3A${importedTypes.join('\u548C')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `\u8BF7\u8F93\u5165${fieldName}`,
                    customSegments: {
                        title: '\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        addText: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        recordTitle: '\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '\u67E5\u770B\u8BE6\u7EC6\u8BF4\u660E',
                        helpText: '\u5173\u4E8E\u914D\u7F6E\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55\u3002',
                        emptyTitle: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5\u6216\u81EA\u5B9A\u4E49\u8BB0\u5F55',
                        fields: {
                            segmentName: '\u540D\u79F0',
                            internalID: '\u5185\u90E8 ID',
                            scriptID: 'Script ID',
                            customRecordScriptID: '\u4EA4\u6613\u5217ID',
                            mapping: '\u663E\u793A\u4E3A',
                        },
                        removeTitle: '\u5220\u9664\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55',
                        removePrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55\u5417\uFF1F',
                        addForm: {
                            customSegmentName: '\u81EA\u5B9A\u4E49\u5206\u6BB5\u540D\u79F0',
                            customRecordName: '\u81EA\u5B9A\u4E49\u8BB0\u5F55\u540D\u79F0',
                            segmentTitle: '\u81EA\u5B9A\u4E49\u5206\u6BB5',
                            customSegmentAddTitle: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5',
                            customRecordAddTitle: '\u6DFB\u52A0\u81EA\u5B9A\u4E49\u8BB0\u5F55',
                            recordTitle: '\u81EA\u5B9A\u4E49\u8BB0\u5F55',
                            segmentRecordType: '\u60A8\u60F3\u6DFB\u52A0\u81EA\u5B9A\u4E49\u6BB5\u8FD8\u662F\u81EA\u5B9A\u4E49\u8BB0\u5F55\uFF1F',
                            customSegmentNameTitle: '\u81EA\u5B9A\u4E49\u5206\u6BB5\u540D\u79F0\u662F\u4EC0\u4E48\uFF1F',
                            customRecordNameTitle: '\u81EA\u5B9A\u4E49\u8BB0\u5F55\u540D\u79F0\u662F\u4EC0\u4E48\uFF1F',
                            customSegmentNameFooter: `\u60A8\u53EF\u4EE5\u5728 NetSuite \u4E2D\u7684 *Customizations > Links, Records & Fields > Custom Segments* \u9875\u9762\u627E\u5230\u81EA\u5B9A\u4E49\u5206\u6BB5\u540D\u79F0\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_\u3002`,
                            customRecordNameFooter: `\u60A8\u53EF\u4EE5\u901A\u8FC7\u5728\u5168\u5C40\u641C\u7D22\u4E2D\u8F93\u5165\u201CTransaction Column Field\u201D\u6765\u67E5\u627ENetSuite\u4E2D\u7684\u81EA\u5B9A\u4E49\u8BB0\u5F55\u540D\u79F0\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})\u3002_`,
                            customSegmentInternalIDTitle: '\u5185\u90E8ID\u662F\u4EC0\u4E48\uFF1F',
                            customSegmentInternalIDFooter: `\u9996\u5148\uFF0C\u8BF7\u786E\u4FDD\u60A8\u5DF2\u5728 NetSuite \u4E2D\u542F\u7528\u4E86\u5185\u90E8 ID\uFF0C\u8DEF\u5F84\u4E3A *Home > Set Preferences > Show Internal ID*\u3002\n\n\u60A8\u53EF\u4EE5\u5728 NetSuite \u4E2D\u627E\u5230\u81EA\u5B9A\u4E49\u6BB5\u7684\u5185\u90E8 ID\uFF0C\u8DEF\u5F84\u4E3A\uFF1A\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u6BB5\u3002\n3. \u70B9\u51FB*Custom Record Type*\u65C1\u8FB9\u7684\u8D85\u94FE\u63A5\u3002\n4. \u5728\u5E95\u90E8\u7684\u8868\u683C\u4E2D\u627E\u5230\u5185\u90E8 ID\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_\u3002`,
                            customRecordInternalIDFooter: `\u60A8\u53EF\u4EE5\u901A\u8FC7\u4EE5\u4E0B\u6B65\u9AA4\u5728 NetSuite \u4E2D\u627E\u5230\u81EA\u5B9A\u4E49\u8BB0\u5F55\u7684\u5185\u90E8 ID\uFF1A\n\n1. \u5728\u5168\u5C40\u641C\u7D22\u4E2D\u8F93\u5165\u201CTransaction Line Fields\u201D\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u8BB0\u5F55\u3002\n3. \u5728\u5DE6\u4FA7\u627E\u5230\u5185\u90E8 ID\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_\u3002`,
                            customSegmentScriptIDTitle: '\u811A\u672CID\u662F\u4EC0\u4E48\uFF1F',
                            customSegmentScriptIDFooter: `\u60A8\u53EF\u4EE5\u5728 NetSuite \u4E2D\u627E\u5230\u81EA\u5B9A\u4E49\u5206\u6BB5\u811A\u672C ID\uFF0C\u8DEF\u5F84\u5982\u4E0B\uFF1A\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u5206\u6BB5\u3002\n3. \u70B9\u51FB\u9760\u8FD1\u5E95\u90E8\u7684 *Application and Sourcing* \u6807\u7B7E\u9875\uFF0C\u7136\u540E\uFF1A\n    a. \u5982\u679C\u60A8\u60F3\u5728 Expensify \u4E2D\u5C06\u81EA\u5B9A\u4E49\u5206\u6BB5\u663E\u793A\u4E3A *tag*\uFF08\u5728\u884C\u9879\u76EE\u7EA7\u522B\uFF09\uFF0C\u8BF7\u70B9\u51FB *Transaction Columns* \u5B50\u6807\u7B7E\u9875\u5E76\u4F7F\u7528 *Field ID*\u3002\n    b. \u5982\u679C\u60A8\u60F3\u5728 Expensify \u4E2D\u5C06\u81EA\u5B9A\u4E49\u5206\u6BB5\u663E\u793A\u4E3A *report field*\uFF08\u5728\u62A5\u544A\u7EA7\u522B\uFF09\uFF0C\u8BF7\u70B9\u51FB *Transactions* \u5B50\u6807\u7B7E\u9875\u5E76\u4F7F\u7528 *Field ID*\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_\u3002`,
                            customRecordScriptIDTitle: '\u4EA4\u6613\u5217ID\u662F\u4EC0\u4E48\uFF1F',
                            customRecordScriptIDFooter: `\u60A8\u53EF\u4EE5\u5728 NetSuite \u4E2D\u627E\u5230\u81EA\u5B9A\u4E49\u8BB0\u5F55\u811A\u672C ID\uFF0C\u6B65\u9AA4\u5982\u4E0B\uFF1A\n\n1. \u5728\u5168\u5C40\u641C\u7D22\u4E2D\u8F93\u5165\u201CTransaction Line Fields\u201D\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u8BB0\u5F55\u3002\n3. \u5728\u5DE6\u4FA7\u627E\u5230\u811A\u672C ID\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_\u3002`,
                            customSegmentMappingTitle: '\u6B64\u81EA\u5B9A\u4E49\u6BB5\u5E94\u5982\u4F55\u5728Expensify\u4E2D\u663E\u793A\uFF1F',
                            customRecordMappingTitle: '\u6B64\u81EA\u5B9A\u4E49\u8BB0\u5F55\u5E94\u5982\u4F55\u5728Expensify\u4E2D\u663E\u793A\uFF1F',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) =>
                                `\u5177\u6709\u6B64 ${fieldName?.toLowerCase()} \u7684\u81EA\u5B9A\u4E49\u6BB5/\u8BB0\u5F55\u5DF2\u5B58\u5728`,
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
                            internalID: '\u5185\u90E8 ID',
                            transactionFieldID: '\u4EA4\u6613\u5B57\u6BB5ID',
                            mapping: '\u663E\u793A\u4E3A',
                        },
                        removeTitle: '\u5220\u9664\u81EA\u5B9A\u4E49\u5217\u8868',
                        removePrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u81EA\u5B9A\u4E49\u5217\u8868\u5417\uFF1F',
                        addForm: {
                            listNameTitle: '\u9009\u62E9\u81EA\u5B9A\u4E49\u5217\u8868',
                            transactionFieldIDTitle: '\u4EA4\u6613\u5B57\u6BB5 ID \u662F\u4EC0\u4E48\uFF1F',
                            transactionFieldIDFooter: `\u60A8\u53EF\u4EE5\u901A\u8FC7\u4EE5\u4E0B\u6B65\u9AA4\u5728 NetSuite \u4E2D\u627E\u5230\u4EA4\u6613\u5B57\u6BB5 ID\uFF1A\n\n1. \u5728\u5168\u5C40\u641C\u7D22\u4E2D\u8F93\u5165\u201CTransaction Line Fields\u201D\u3002\n2. \u70B9\u51FB\u8FDB\u5165\u4E00\u4E2A\u81EA\u5B9A\u4E49\u5217\u8868\u3002\n3. \u5728\u5DE6\u4FA7\u627E\u5230\u4EA4\u6613\u5B57\u6BB5 ID\u3002\n\n_\u6709\u5173\u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\uFF0C\u8BF7[\u8BBF\u95EE\u6211\u4EEC\u7684\u5E2E\u52A9\u7F51\u7AD9](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_\u3002`,
                            mappingTitle: '\u5728Expensify\u4E2D\uFF0C\u8FD9\u4E2A\u81EA\u5B9A\u4E49\u5217\u8868\u5E94\u8BE5\u5982\u4F55\u663E\u793A\uFF1F',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `\u6B64\u4EA4\u6613\u5B57\u6BB5ID\u7684\u81EA\u5B9A\u4E49\u5217\u8868\u5DF2\u5B58\u5728`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite \u5458\u5DE5\u9ED8\u8BA4\u503C',
                        description: '\u672A\u5BFC\u5165\u5230Expensify\uFF0C\u5DF2\u5728\u5BFC\u51FA\u65F6\u5E94\u7528',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `\u5982\u679C\u60A8\u5728NetSuite\u4E2D\u4F7F\u7528${importField}\uFF0C\u6211\u4EEC\u5C06\u5728\u5BFC\u51FA\u5230\u8D39\u7528\u62A5\u544A\u6216\u65E5\u8BB0\u5206\u5F55\u65F6\u5E94\u7528\u5458\u5DE5\u8BB0\u5F55\u4E0A\u8BBE\u7F6E\u7684\u9ED8\u8BA4\u503C\u3002`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '\u6807\u7B7E',
                        description: '\u9010\u9879\u7EA7\u522B',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} \u5C06\u53EF\u4F9B\u9009\u62E9\u7528\u4E8E\u5458\u5DE5\u62A5\u544A\u4E2D\u7684\u6BCF\u4E00\u7B14\u8D39\u7528\u3002`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '\u62A5\u544A\u5B57\u6BB5',
                        description: '\u62A5\u544A\u7EA7\u522B',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} \u9009\u62E9\u5C06\u9002\u7528\u4E8E\u5458\u5DE5\u62A5\u544A\u4E2D\u7684\u6240\u6709\u8D39\u7528\u3002`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct \u8BBE\u7F6E',
            prerequisitesTitle: '\u5728\u60A8\u8FDE\u63A5\u4E4B\u524D...',
            downloadExpensifyPackage: '\u4E0B\u8F7D\u9002\u7528\u4E8ESage Intacct\u7684Expensify\u8F6F\u4EF6\u5305',
            followSteps: '\u6309\u7167\u6211\u4EEC\u7684\u64CD\u4F5C\u6307\u5357\uFF1A\u8FDE\u63A5\u5230 Sage Intacct \u7684\u8BF4\u660E\u8FDB\u884C\u64CD\u4F5C\u3002',
            enterCredentials: '\u8F93\u5165\u60A8\u7684 Sage Intacct \u51ED\u8BC1',
            entity: '\u5B9E\u4F53',
            employeeDefault: 'Sage Intacct \u5458\u5DE5\u9ED8\u8BA4\u503C',
            employeeDefaultDescription:
                '\u5982\u679C\u5B58\u5728\uFF0C\u5458\u5DE5\u7684\u9ED8\u8BA4\u90E8\u95E8\u5C06\u5E94\u7528\u4E8E\u4ED6\u4EEC\u5728 Sage Intacct \u4E2D\u7684\u8D39\u7528\u3002',
            displayedAsTagDescription: '\u90E8\u95E8\u5C06\u53EF\u5728\u5458\u5DE5\u62A5\u544A\u4E2D\u7684\u6BCF\u4E2A\u5355\u72EC\u8D39\u7528\u4E0A\u9009\u62E9\u3002',
            displayedAsReportFieldDescription: '\u90E8\u95E8\u9009\u62E9\u5C06\u9002\u7528\u4E8E\u5458\u5DE5\u62A5\u544A\u4E2D\u7684\u6240\u6709\u8D39\u7528\u3002',
            toggleImportTitleFirstPart: '\u9009\u62E9\u5982\u4F55\u5904\u7406 Sage Intacct',
            toggleImportTitleSecondPart: '\u5728Expensify\u4E2D\u3002',
            expenseTypes: '\u8D39\u7528\u7C7B\u578B',
            expenseTypesDescription: '\u60A8\u7684 Sage Intacct \u8D39\u7528\u7C7B\u578B\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230 Expensify\u3002',
            accountTypesDescription: '\u60A8\u7684 Sage Intacct \u4F1A\u8BA1\u79D1\u76EE\u8868\u5C06\u4F5C\u4E3A\u7C7B\u522B\u5BFC\u5165\u5230 Expensify\u3002',
            importTaxDescription: '\u4ECE Sage Intacct \u5BFC\u5165\u91C7\u8D2D\u7A0E\u7387\u3002',
            userDefinedDimensions: '\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            addUserDefinedDimension: '\u6DFB\u52A0\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            integrationName: '\u96C6\u6210\u540D\u79F0',
            dimensionExists: '\u5DF2\u5B58\u5728\u5177\u6709\u6B64\u540D\u79F0\u7684\u7EF4\u5EA6\u3002',
            removeDimension: '\u5220\u9664\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            removeDimensionPrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6\u5417\uFF1F',
            userDefinedDimension: '\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            addAUserDefinedDimension: '\u6DFB\u52A0\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6',
            detailedInstructionsLink: '\u67E5\u770B\u8BE6\u7EC6\u8BF4\u660E',
            detailedInstructionsRestOfSentence: '\u5173\u4E8E\u6DFB\u52A0\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6\u3002',
            userDimensionsAdded: () => ({
                one: '1 UDD \u5DF2\u6DFB\u52A0',
                other: (count: number) => `\u6DFB\u52A0\u4E86${count}\u4E2AUDD`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '\u90E8\u95E8';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '\u8BFE\u7A0B';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '\u4F4D\u7F6E';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '\u5BA2\u6237';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '\u9879\u76EE\uFF08\u5DE5\u4F5C\uFF09';
                    default:
                        return 'mappings';
                }
            },
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
                other: '\u5176\u4ED6',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: '\u4E07\u4E8B\u8FBE\u5546\u4E1A\u5361',
                    vcf: 'Visa \u5546\u4E1A\u5361',
                    stripe: 'Stripe \u5361\u7247',
                },
                yourCardProvider: `\u60A8\u7684\u5361\u7247\u63D0\u4F9B\u5546\u662F\u8C01\uFF1F`,
                whoIsYourBankAccount: '\u4F60\u7684\u94F6\u884C\u662F\u54EA\u5BB6\uFF1F',
                whereIsYourBankLocated: '\u60A8\u7684\u94F6\u884C\u5728\u54EA\u91CC\uFF1F',
                howDoYouWantToConnect: '\u60A8\u60F3\u5982\u4F55\u8FDE\u63A5\u5230\u60A8\u7684\u94F6\u884C\uFF1F',
                learnMoreAboutOptions: {
                    text: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u8FD9\u4E9B\u7684\u4FE1\u606F',
                    linkText: '\u9009\u9879\u3002',
                },
                commercialFeedDetails:
                    '\u9700\u8981\u4E0E\u60A8\u7684\u94F6\u884C\u8FDB\u884C\u8BBE\u7F6E\u3002\u8FD9\u901A\u5E38\u7531\u8F83\u5927\u7684\u516C\u53F8\u4F7F\u7528\uFF0C\u5982\u679C\u60A8\u7B26\u5408\u6761\u4EF6\uFF0C\u8FD9\u901A\u5E38\u662F\u6700\u4F73\u9009\u62E9\u3002',
                commercialFeedPlaidDetails: `\u9700\u8981\u4E0E\u60A8\u7684\u94F6\u884C\u8FDB\u884C\u8BBE\u7F6E\uFF0C\u4F46\u6211\u4EEC\u4F1A\u6307\u5BFC\u60A8\u3002\u8FD9\u901A\u5E38\u4EC5\u9650\u4E8E\u5927\u516C\u53F8\u3002`,
                directFeedDetails:
                    '\u6700\u7B80\u5355\u7684\u65B9\u6CD5\u3002\u4F7F\u7528\u60A8\u7684\u4E3B\u8D26\u6237\u51ED\u8BC1\u7ACB\u5373\u8FDE\u63A5\u3002\u8FD9\u79CD\u65B9\u6CD5\u6700\u5E38\u89C1\u3002',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `\u542F\u7528\u60A8\u7684${provider}\u63D0\u8981`,
                    heading:
                        '\u6211\u4EEC\u4E0E\u60A8\u7684\u53D1\u5361\u673A\u6784\u6709\u76F4\u63A5\u96C6\u6210\uFF0C\u53EF\u4EE5\u5FEB\u901F\u51C6\u786E\u5730\u5C06\u60A8\u7684\u4EA4\u6613\u6570\u636E\u5BFC\u5165Expensify\u3002\n\n\u8981\u5F00\u59CB\uFF0C\u8BF7\u7B80\u5355\u5730\uFF1A',
                    visa: '\u6211\u4EEC\u4E0EVisa\u6709\u5168\u7403\u96C6\u6210\uFF0C\u4F46\u8D44\u683C\u56E0\u94F6\u884C\u548C\u5361\u8BA1\u5212\u800C\u5F02\u3002\n\n\u8981\u5F00\u59CB\uFF0C\u8BF7\u7B80\u5355\u5730\uFF1A',
                    mastercard:
                        '\u6211\u4EEC\u4E0E\u4E07\u4E8B\u8FBE\u5361\u6709\u5168\u7403\u6574\u5408\uFF0C\u5C3D\u7BA1\u8D44\u683C\u56E0\u94F6\u884C\u548C\u5361\u7247\u8BA1\u5212\u800C\u5F02\u3002\n\n\u8981\u5F00\u59CB\uFF0C\u8BF7\u7B80\u5355\u5730\uFF1A',
                    vcf: `1. \u8BF7\u8BBF\u95EE[\u6B64\u5E2E\u52A9\u6587\u7AE0](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})\uFF0C\u83B7\u53D6\u6709\u5173\u5982\u4F55\u8BBE\u7F6E\u60A8\u7684Visa Commercial Cards\u7684\u8BE6\u7EC6\u8BF4\u660E\u3002\n\n2. [\u8054\u7CFB\u60A8\u7684\u94F6\u884C](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})\u4EE5\u786E\u8BA4\u4ED6\u4EEC\u662F\u5426\u652F\u6301\u60A8\u7684\u9879\u76EE\u7684\u5546\u4E1A\u6570\u636E\u6D41\uFF0C\u5E76\u8981\u6C42\u4ED6\u4EEC\u542F\u7528\u5B83\u3002\n\n3. *\u4E00\u65E6\u6570\u636E\u6D41\u542F\u7528\u5E76\u4E14\u60A8\u6709\u5176\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u8BF7\u7EE7\u7EED\u5230\u4E0B\u4E00\u4E2A\u5C4F\u5E55\u3002*`,
                    gl1025: `1. \u8BBF\u95EE[\u6B64\u5E2E\u52A9\u6587\u7AE0](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})\uFF0C\u4E86\u89E3\u7F8E\u56FD\u8FD0\u901A\u662F\u5426\u53EF\u4EE5\u4E3A\u60A8\u7684\u9879\u76EE\u542F\u7528\u5546\u4E1A\u6570\u636E\u4F20\u8F93\u3002\n\n2. \u6570\u636E\u4F20\u8F93\u542F\u7528\u540E\uFF0CAmex \u5C06\u5411\u60A8\u53D1\u9001\u751F\u4EA7\u4FE1\u51FD\u3002\n\n3. *\u4E00\u65E6\u60A8\u6709\u4E86\u6570\u636E\u4F20\u8F93\u4FE1\u606F\uFF0C\u8BF7\u7EE7\u7EED\u5230\u4E0B\u4E00\u4E2A\u5C4F\u5E55\u3002*`,
                    cdf: `1. \u8BF7\u8BBF\u95EE[\u6B64\u5E2E\u52A9\u6587\u7AE0](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})\u4EE5\u83B7\u53D6\u6709\u5173\u5982\u4F55\u8BBE\u7F6E\u60A8\u7684\u4E07\u4E8B\u8FBE\u5546\u4E1A\u5361\u7684\u8BE6\u7EC6\u8BF4\u660E\u3002\n\n2. [\u8054\u7CFB\u60A8\u7684\u94F6\u884C](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})\u4EE5\u786E\u8BA4\u4ED6\u4EEC\u662F\u5426\u652F\u6301\u60A8\u7684\u9879\u76EE\u7684\u5546\u4E1A\u6570\u636E\u6D41\uFF0C\u5E76\u8981\u6C42\u4ED6\u4EEC\u542F\u7528\u5B83\u3002\n\n3. *\u4E00\u65E6\u6570\u636E\u6D41\u542F\u7528\u5E76\u4E14\u60A8\u62E5\u6709\u5176\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u8BF7\u7EE7\u7EED\u5230\u4E0B\u4E00\u4E2A\u5C4F\u5E55\u3002*`,
                    stripe: `1. \u8BBF\u95EE Stripe \u7684\u4EEA\u8868\u677F\uFF0C\u7136\u540E\u8F6C\u5230[\u8BBE\u7F6E](${CONST.COMPANY_CARDS_STRIPE_HELP})\u3002\n\n2. \u5728\u4EA7\u54C1\u96C6\u6210\u4E0B\uFF0C\u70B9\u51FB Expensify \u65C1\u8FB9\u7684\u542F\u7528\u3002\n\n3. \u4E00\u65E6\u542F\u7528\u4E86\u8BE5\u63D0\u8981\uFF0C\u70B9\u51FB\u4E0B\u9762\u7684\u63D0\u4EA4\uFF0C\u6211\u4EEC\u5C06\u5F00\u59CB\u6DFB\u52A0\u5B83\u3002`,
                },
                whatBankIssuesCard: '\u8FD9\u4E9B\u5361\u662F\u7531\u54EA\u5BB6\u94F6\u884C\u53D1\u884C\u7684\uFF1F',
                enterNameOfBank: '\u8F93\u5165\u94F6\u884C\u540D\u79F0',
                feedDetails: {
                    vcf: {
                        title: 'Visa\u9988\u9001\u8BE6\u60C5\u662F\u4EC0\u4E48\uFF1F',
                        processorLabel: '\u5904\u7406\u5668 ID',
                        bankLabel: '\u91D1\u878D\u673A\u6784\uFF08\u94F6\u884C\uFF09ID',
                        companyLabel: '\u516C\u53F8 ID',
                        helpLabel: '\u6211\u5728\u54EA\u91CC\u53EF\u4EE5\u627E\u5230\u8FD9\u4E9BID\uFF1F',
                    },
                    gl1025: {
                        title: `Amex\u4EA4\u4ED8\u6587\u4EF6\u7684\u540D\u79F0\u662F\u4EC0\u4E48\uFF1F`,
                        fileNameLabel: '\u4EA4\u4ED8\u6587\u4EF6\u540D',
                        helpLabel: '\u6211\u5728\u54EA\u91CC\u53EF\u4EE5\u627E\u5230\u4EA4\u4ED8\u6587\u4EF6\u7684\u540D\u79F0\uFF1F',
                    },
                    cdf: {
                        title: `Mastercard \u5206\u53D1 ID \u662F\u4EC0\u4E48\uFF1F`,
                        distributionLabel: '\u5206\u914D ID',
                        helpLabel: '\u6211\u5728\u54EA\u91CC\u53EF\u4EE5\u627E\u5230\u5206\u53D1 ID\uFF1F',
                    },
                },
                amexCorporate: '\u5982\u679C\u60A8\u7684\u5361\u7247\u6B63\u9762\u5199\u7740\u201CCorporate\u201D\uFF0C\u8BF7\u9009\u62E9\u6B64\u9879\u3002',
                amexBusiness: '\u5982\u679C\u60A8\u7684\u5361\u7247\u6B63\u9762\u5199\u7740\u201CBusiness\u201D\uFF0C\u8BF7\u9009\u62E9\u6B64\u9879\u3002',
                amexPersonal: '\u5982\u679C\u60A8\u7684\u5361\u662F\u4E2A\u4EBA\u5361\uFF0C\u8BF7\u9009\u62E9\u6B64\u9879',
                error: {
                    pleaseSelectProvider: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u4E2A\u5361\u63D0\u4F9B\u5546',
                    pleaseSelectBankAccount: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u4E2A\u94F6\u884C\u8D26\u6237',
                    pleaseSelectBank: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u4E2A\u94F6\u884C',
                    pleaseSelectCountry: '\u5728\u7EE7\u7EED\u4E4B\u524D\u8BF7\u9009\u62E9\u4E00\u4E2A\u56FD\u5BB6',
                    pleaseSelectFeedType: '\u8BF7\u5728\u7EE7\u7EED\u4E4B\u524D\u9009\u62E9\u4E00\u4E2A\u63D0\u8981\u7C7B\u578B',
                },
            },
            assignCard: '\u5206\u914D\u5361\u7247',
            findCard: '\u67E5\u627E\u5361\u7247',
            cardNumber: '\u5361\u53F7',
            commercialFeed: '\u5546\u4E1A\u4FE1\u606F\u6D41',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} \u5361\u7247`,
            directFeed: '\u76F4\u63A5\u9988\u9001',
            whoNeedsCardAssigned: '\u8C01\u9700\u8981\u5206\u914D\u4E00\u5F20\u5361\uFF1F',
            chooseCard: '\u9009\u62E9\u4E00\u5F20\u5361\u7247',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `\u4ECE${feed}\u5361\u7247\u6E90\u4E2D\u4E3A${assignee}\u9009\u62E9\u4E00\u5F20\u5361\u7247\u3002`,
            noActiveCards: '\u6B64\u4FE1\u606F\u6D41\u4E2D\u6CA1\u6709\u6D3B\u8DC3\u7684\u5361\u7247',
            somethingMightBeBroken:
                '\u6216\u8005\u53EF\u80FD\u51FA\u73B0\u4E86\u95EE\u9898\u3002\u65E0\u8BBA\u5982\u4F55\uFF0C\u5982\u679C\u60A8\u6709\u4EFB\u4F55\u95EE\u9898\uFF0C\u53EA\u9700',
            contactConcierge: '\u8054\u7CFBConcierge',
            chooseTransactionStartDate: '\u9009\u62E9\u4EA4\u6613\u5F00\u59CB\u65E5\u671F',
            startDateDescription:
                '\u6211\u4EEC\u5C06\u4ECE\u6B64\u65E5\u671F\u5F00\u59CB\u5BFC\u5165\u6240\u6709\u4EA4\u6613\u3002\u5982\u679C\u672A\u6307\u5B9A\u65E5\u671F\uFF0C\u6211\u4EEC\u5C06\u8FFD\u6EAF\u5230\u60A8\u7684\u94F6\u884C\u5141\u8BB8\u7684\u6700\u65E9\u65E5\u671F\u3002',
            fromTheBeginning: '\u4ECE\u5934\u5F00\u59CB',
            customStartDate: '\u81EA\u5B9A\u4E49\u5F00\u59CB\u65E5\u671F',
            letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
            confirmationDescription: '\u6211\u4EEC\u5C06\u7ACB\u5373\u5F00\u59CB\u5BFC\u5165\u4EA4\u6613\u3002',
            cardholder: '\u6301\u5361\u4EBA',
            card: '\u5361\u7247',
            cardName: '\u5361\u7247\u540D\u79F0',
            brokenConnectionErrorFirstPart: `\u5361\u7247\u8FDE\u63A5\u5DF2\u65AD\u5F00\u3002\u8BF7`,
            brokenConnectionErrorLink: '\u767B\u5F55\u60A8\u7684\u94F6\u884C',
            brokenConnectionErrorSecondPart: '\u8FD9\u6837\u6211\u4EEC\u5C31\u53EF\u4EE5\u91CD\u65B0\u5EFA\u7ACB\u8FDE\u63A5\u3002',
            assignedCard: ({assignee, link}: AssignedCardParams) =>
                `\u5DF2\u5206\u914D${assignee}\u4E00\u4E2A${link}\uFF01\u5BFC\u5165\u7684\u4EA4\u6613\u5C06\u663E\u793A\u5728\u6B64\u804A\u5929\u4E2D\u3002`,
            companyCard: '\u516C\u53F8\u5361',
            chooseCardFeed: '\u9009\u62E9\u5361\u7247\u4FE1\u606F\u6D41',
            ukRegulation:
                'Expensify Limited \u662F Plaid Financial Ltd. \u7684\u4EE3\u7406\u5546\uFF0C\u540E\u8005\u662F\u4E00\u5BB6\u6388\u6743\u652F\u4ED8\u673A\u6784\uFF0C\u53D7\u91D1\u878D\u884C\u4E3A\u76D1\u7BA1\u5C40\u6839\u636E\u300A2017\u5E74\u652F\u4ED8\u670D\u52A1\u6761\u4F8B\u300B\u76D1\u7BA1\uFF08\u516C\u53F8\u53C2\u8003\u7F16\u53F7\uFF1A804718\uFF09\u3002Plaid \u901A\u8FC7 Expensify Limited \u4F5C\u4E3A\u5176\u4EE3\u7406\u5546\u4E3A\u60A8\u63D0\u4F9B\u53D7\u76D1\u7BA1\u7684\u8D26\u6237\u4FE1\u606F\u670D\u52A1\u3002',
        },
        expensifyCard: {
            issueAndManageCards: '\u53D1\u884C\u548C\u7BA1\u7406\u60A8\u7684Expensify\u5361\u7247',
            getStartedIssuing: '\u5F00\u59CB\u7533\u8BF7\u60A8\u7684\u7B2C\u4E00\u5F20\u865A\u62DF\u6216\u5B9E\u4F53\u5361\u3002',
            verificationInProgress: '\u6B63\u5728\u9A8C\u8BC1\u4E2D...',
            verifyingTheDetails: '\u6211\u4EEC\u6B63\u5728\u9A8C\u8BC1\u4E00\u4E9B\u7EC6\u8282\u3002Concierge \u4F1A\u901A\u77E5\u60A8 Expensify Cards \u51C6\u5907\u597D\u53D1\u884C\u3002',
            disclaimer:
                'Expensify Visa\u00AE \u5546\u4E1A\u5361\u7531 The Bancorp Bank, N.A. \u53D1\u884C\uFF0CFDIC \u6210\u5458\uFF0C\u6839\u636E Visa U.S.A. Inc. \u7684\u8BB8\u53EF\uFF0C\u5E76\u4E14\u53EF\u80FD\u65E0\u6CD5\u5728\u6240\u6709\u63A5\u53D7 Visa \u5361\u7684\u5546\u5BB6\u4F7F\u7528\u3002Apple\u00AE \u548C Apple \u6807\u5FD7\u00AE \u662F Apple Inc. \u5728\u7F8E\u56FD\u548C\u5176\u4ED6\u56FD\u5BB6\u6CE8\u518C\u7684\u5546\u6807\u3002App Store \u662F Apple Inc. \u7684\u670D\u52A1\u6807\u5FD7\u3002Google Play \u548C Google Play \u6807\u5FD7\u662F Google LLC \u7684\u5546\u6807\u3002',
            issueCard: '\u53D1\u653E\u5361\u7247',
            findCard: '\u67E5\u627E\u5361\u7247',
            newCard: '\u65B0\u5361\u7247',
            name: '\u540D\u79F0',
            lastFour: '\u6700\u540E4\u4F4D\u6570\u5B57',
            limit: '\u9650\u5236',
            currentBalance: '\u5F53\u524D\u4F59\u989D',
            currentBalanceDescription:
                '\u5F53\u524D\u4F59\u989D\u662F\u81EA\u4E0A\u6B21\u7ED3\u7B97\u65E5\u671F\u4EE5\u6765\u53D1\u751F\u7684\u6240\u6709\u5DF2\u5165\u8D26Expensify\u5361\u4EA4\u6613\u7684\u603B\u548C\u3002',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `\u4F59\u989D\u5C06\u5728${settlementDate}\u7ED3\u7B97`,
            settleBalance: '\u7ED3\u7B97\u4F59\u989D',
            cardLimit: '\u5361\u7247\u9650\u989D',
            remainingLimit: '\u5269\u4F59\u9650\u989D',
            requestLimitIncrease: '\u8BF7\u6C42\u589E\u52A0\u9650\u5236',
            remainingLimitDescription:
                '\u5728\u8BA1\u7B97\u60A8\u7684\u5269\u4F59\u989D\u5EA6\u65F6\uFF0C\u6211\u4EEC\u4F1A\u8003\u8651\u591A\u4E2A\u56E0\u7D20\uFF1A\u60A8\u4F5C\u4E3A\u5BA2\u6237\u7684\u4EFB\u671F\u3001\u60A8\u5728\u6CE8\u518C\u65F6\u63D0\u4F9B\u7684\u4E1A\u52A1\u76F8\u5173\u4FE1\u606F\u4EE5\u53CA\u60A8\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u4E2D\u7684\u53EF\u7528\u73B0\u91D1\u3002\u60A8\u7684\u5269\u4F59\u989D\u5EA6\u53EF\u80FD\u6BCF\u5929\u90FD\u4F1A\u6CE2\u52A8\u3002',
            earnedCashback: '\u73B0\u91D1\u8FD4\u8FD8',
            earnedCashbackDescription:
                '\u73B0\u91D1\u8FD4\u8FD8\u4F59\u989D\u57FA\u4E8E\u60A8\u7684\u5DE5\u4F5C\u533A\u5185\u5DF2\u7ED3\u7B97\u7684\u6BCF\u6708 Expensify Card \u652F\u51FA\u3002',
            issueNewCard: '\u53D1\u884C\u65B0\u5361',
            finishSetup: '\u5B8C\u6210\u8BBE\u7F6E',
            chooseBankAccount: '\u9009\u62E9\u94F6\u884C\u8D26\u6237',
            chooseExistingBank:
                '\u9009\u62E9\u4E00\u4E2A\u73B0\u6709\u7684\u4F01\u4E1A\u94F6\u884C\u8D26\u6237\u6765\u652F\u4ED8\u60A8\u7684Expensify\u5361\u4F59\u989D\uFF0C\u6216\u8005\u6DFB\u52A0\u4E00\u4E2A\u65B0\u7684\u94F6\u884C\u8D26\u6237\u3002',
            accountEndingIn: '\u8D26\u6237\u672B\u5C3E\u4E3A',
            addNewBankAccount: '\u6DFB\u52A0\u65B0\u7684\u94F6\u884C\u8D26\u6237',
            settlementAccount: '\u7ED3\u7B97\u8D26\u6237',
            settlementAccountDescription: '\u9009\u62E9\u4E00\u4E2A\u8D26\u6237\u6765\u652F\u4ED8\u60A8\u7684Expensify\u5361\u4F59\u989D\u3002',
            settlementAccountInfoPt1: '\u786E\u4FDD\u6B64\u8D26\u6237\u4E0E\u60A8\u7684\u5339\u914D',
            settlementAccountInfoPt2: '\u56E0\u6B64\uFF0CContinuous Reconciliation \u53EF\u4EE5\u6B63\u5E38\u5DE5\u4F5C\u3002',
            reconciliationAccount: '\u5BF9\u8D26\u8D26\u6237',
            settlementFrequency: '\u7ED3\u7B97\u9891\u7387',
            settlementFrequencyDescription: '\u9009\u62E9\u60A8\u652F\u4ED8Expensify\u5361\u4F59\u989D\u7684\u9891\u7387\u3002',
            settlementFrequencyInfo:
                '\u5982\u679C\u60A8\u60F3\u5207\u6362\u5230\u6BCF\u6708\u7ED3\u7B97\uFF0C\u60A8\u9700\u8981\u901A\u8FC7Plaid\u8FDE\u63A5\u60A8\u7684\u94F6\u884C\u8D26\u6237\uFF0C\u5E76\u4E14\u670990\u5929\u7684\u6B63\u4F59\u989D\u5386\u53F2\u8BB0\u5F55\u3002',
            frequency: {
                daily: '\u6BCF\u65E5',
                monthly: '\u6BCF\u6708',
            },
            cardDetails: '\u5361\u7247\u8BE6\u60C5',
            virtual: '\u865A\u62DF',
            physical: '\u7269\u7406\u7684',
            deactivate: '\u505C\u7528\u5361\u7247',
            changeCardLimit: '\u66F4\u6539\u5361\u7247\u9650\u989D',
            changeLimit: '\u66F4\u6539\u9650\u5236',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u66F4\u6539\u4E3A${limit}\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\uFF0C\u76F4\u5230\u60A8\u6279\u51C6\u66F4\u591A\u7684\u5361\u4E0A\u8D39\u7528\u3002`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u66F4\u6539\u4E3A${limit}\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\uFF0C\u76F4\u5230\u4E0B\u4E2A\u6708\u3002`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u66F4\u6539\u4E3A${limit}\uFF0C\u65B0\u7684\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\u3002`,
            changeCardLimitType: '\u66F4\u6539\u5361\u7247\u9650\u989D\u7C7B\u578B',
            changeLimitType: '\u66F4\u6539\u9650\u5236\u7C7B\u578B',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u7C7B\u578B\u66F4\u6539\u4E3A\u667A\u80FD\u9650\u989D\uFF0C\u65B0\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\uFF0C\u56E0\u4E3A${limit}\u672A\u6279\u51C6\u7684\u9650\u989D\u5DF2\u8FBE\u5230\u3002`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `\u5982\u679C\u60A8\u5C06\u6B64\u5361\u7684\u9650\u989D\u7C7B\u578B\u66F4\u6539\u4E3A\u6BCF\u6708\u9650\u989D\uFF0C\u65B0\u4EA4\u6613\u5C06\u88AB\u62D2\u7EDD\uFF0C\u56E0\u4E3A\u5DF2\u8FBE\u5230${limit}\u7684\u6BCF\u6708\u9650\u989D\u3002`,
            addShippingDetails: '\u6DFB\u52A0\u8FD0\u8F93\u8BE6\u60C5',
            issuedCard: ({assignee}: AssigneeParams) =>
                `\u5DF2\u4E3A${assignee}\u53D1\u653E\u4E86\u4E00\u5F20Expensify\u5361\uFF01\u8BE5\u5361\u5C06\u57282-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u9001\u8FBE\u3002`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `\u5DF2\u4E3A${assignee}\u53D1\u653E\u4E86\u4E00\u5F20Expensify\u5361\uFF01\u4E00\u65E6\u6DFB\u52A0\u4E86\u8FD0\u8F93\u8BE6\u60C5\uFF0C\u5361\u7247\u5C06\u88AB\u5BC4\u51FA\u3002`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) =>
                `\u5DF2\u5411${assignee}\u53D1\u653E\u4E86\u4E00\u5F20\u865A\u62DF${link}\uFF01\u8BE5\u5361\u53EF\u4EE5\u7ACB\u5373\u4F7F\u7528\u3002`,
            addedShippingDetails: ({assignee}: AssigneeParams) =>
                `${assignee} \u6DFB\u52A0\u4E86\u8FD0\u8F93\u8BE6\u60C5\u3002Expensify Card \u5C06\u5728 2-3 \u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8FBE\u3002`,
            verifyingHeader: '\u9A8C\u8BC1\u4E2D',
            bankAccountVerifiedHeader: '\u94F6\u884C\u8D26\u6237\u5DF2\u9A8C\u8BC1',
            verifyingBankAccount: '\u6B63\u5728\u9A8C\u8BC1\u94F6\u884C\u8D26\u6237...',
            verifyingBankAccountDescription:
                '\u8BF7\u7A0D\u5019\uFF0C\u6211\u4EEC\u6B63\u5728\u786E\u8BA4\u6B64\u8D26\u6237\u662F\u5426\u53EF\u4EE5\u7528\u4E8E\u53D1\u884CExpensify\u5361\u3002',
            bankAccountVerified: '\u94F6\u884C\u8D26\u6237\u5DF2\u9A8C\u8BC1\uFF01',
            bankAccountVerifiedDescription: '\u60A8\u73B0\u5728\u53EF\u4EE5\u5411\u60A8\u7684\u5DE5\u4F5C\u533A\u6210\u5458\u53D1\u653EExpensify\u5361\u3002',
            oneMoreStep: '\u518D\u8FDB\u4E00\u6B65...',
            oneMoreStepDescription:
                '\u770B\u8D77\u6765\u6211\u4EEC\u9700\u8981\u624B\u52A8\u9A8C\u8BC1\u60A8\u7684\u94F6\u884C\u8D26\u6237\u3002\u8BF7\u524D\u5F80Concierge\u67E5\u770B\u60A8\u7684\u6307\u793A\u3002',
            gotIt: '\u660E\u767D\u4E86',
            goToConcierge: '\u524D\u5F80 Concierge',
        },
        categories: {
            deleteCategories: '\u5220\u9664\u7C7B\u522B',
            deleteCategoriesPrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u7C7B\u522B\u5417\uFF1F',
            deleteCategory: '\u5220\u9664\u7C7B\u522B',
            deleteCategoryPrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u7C7B\u522B\u5417\uFF1F',
            disableCategories: '\u7981\u7528\u7C7B\u522B',
            disableCategory: '\u7981\u7528\u7C7B\u522B',
            enableCategories: '\u542F\u7528\u7C7B\u522B',
            enableCategory: '\u542F\u7528\u7C7B\u522B',
            defaultSpendCategories: '\u9ED8\u8BA4\u652F\u51FA\u7C7B\u522B',
            spendCategoriesDescription: '\u81EA\u5B9A\u4E49\u4FE1\u7528\u5361\u4EA4\u6613\u548C\u626B\u63CF\u6536\u636E\u7684\u5546\u6237\u652F\u51FA\u5206\u7C7B\u65B9\u5F0F\u3002',
            deleteFailureMessage: '\u5220\u9664\u7C7B\u522B\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            categoryName: '\u7C7B\u522B\u540D\u79F0',
            requiresCategory: '\u6210\u5458\u5FC5\u987B\u5BF9\u6240\u6709\u8D39\u7528\u8FDB\u884C\u5206\u7C7B',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `\u6240\u6709\u8D39\u7528\u5FC5\u987B\u5206\u7C7B\u624D\u80FD\u5BFC\u51FA\u5230${connectionName}\u3002`,
            subtitle:
                '\u66F4\u597D\u5730\u4E86\u89E3\u8D44\u91D1\u7684\u652F\u51FA\u60C5\u51B5\u3002\u4F7F\u7528\u6211\u4EEC\u7684\u9ED8\u8BA4\u7C7B\u522B\u6216\u6DFB\u52A0\u60A8\u81EA\u5DF1\u7684\u7C7B\u522B\u3002',
            emptyCategories: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u7C7B\u522B',
                subtitle: '\u6DFB\u52A0\u4E00\u4E2A\u7C7B\u522B\u6765\u7EC4\u7EC7\u60A8\u7684\u652F\u51FA\u3002',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: '\u60A8\u7684\u7C7B\u522B\u76EE\u524D\u6B63\u5728\u4ECE\u4F1A\u8BA1\u8FDE\u63A5\u4E2D\u5BFC\u5165\u3002\u524D\u5F80',
                subtitle2: '\u4F1A\u8BA1',
                subtitle3: '\u8FDB\u884C\u4EFB\u4F55\u66F4\u6539\u3002',
            },
            updateFailureMessage: '\u66F4\u65B0\u7C7B\u522B\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            createFailureMessage: '\u521B\u5EFA\u7C7B\u522B\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            addCategory: '\u6DFB\u52A0\u7C7B\u522B',
            editCategory: '\u7F16\u8F91\u7C7B\u522B',
            editCategories: '\u7F16\u8F91\u7C7B\u522B',
            findCategory: '\u67E5\u627E\u7C7B\u522B',
            categoryRequiredError: '\u7C7B\u522B\u540D\u79F0\u662F\u5FC5\u9700\u7684',
            existingCategoryError: '\u5DF2\u5B58\u5728\u540C\u540D\u7C7B\u522B',
            invalidCategoryName: '\u65E0\u6548\u7684\u7C7B\u522B\u540D\u79F0',
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u7C7B\u522B\u662F\u4ECE\u60A8\u7684',
            payrollCode: '\u5DE5\u8D44\u4EE3\u7801',
            updatePayrollCodeFailureMessage: '\u66F4\u65B0\u5DE5\u8D44\u4EE3\u7801\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            glCode: 'GL\u4EE3\u7801',
            updateGLCodeFailureMessage: '\u66F4\u65B0GL\u4EE3\u7801\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            importCategories: '\u5BFC\u5165\u7C7B\u522B',
            cannotDeleteOrDisableAllCategories: {
                title: '\u65E0\u6CD5\u5220\u9664\u6216\u7981\u7528\u6240\u6709\u7C7B\u522B',
                description: `\u7531\u4E8E\u60A8\u7684\u5DE5\u4F5C\u533A\u9700\u8981\u7C7B\u522B\uFF0C\u81F3\u5C11\u5FC5\u987B\u542F\u7528\u4E00\u4E2A\u7C7B\u522B\u3002`,
            },
        },
        moreFeatures: {
            subtitle:
                '\u4F7F\u7528\u4E0B\u9762\u7684\u5207\u6362\u6309\u94AE\u6765\u542F\u7528\u66F4\u591A\u529F\u80FD\u3002\u6BCF\u4E2A\u529F\u80FD\u5C06\u51FA\u73B0\u5728\u5BFC\u822A\u83DC\u5355\u4E2D\u4EE5\u4F9B\u8FDB\u4E00\u6B65\u81EA\u5B9A\u4E49\u3002',
            spendSection: {
                title: '\u82B1\u8D39',
                subtitle: '\u542F\u7528\u5E2E\u52A9\u60A8\u6269\u5C55\u56E2\u961F\u7684\u529F\u80FD\u3002',
            },
            manageSection: {
                title: '\u7BA1\u7406',
                subtitle: '\u6DFB\u52A0\u63A7\u5236\u63AA\u65BD\u4EE5\u5E2E\u52A9\u5C06\u652F\u51FA\u4FDD\u6301\u5728\u9884\u7B97\u8303\u56F4\u5185\u3002',
            },
            earnSection: {
                title: '\u8D5A\u53D6',
                subtitle: '\u7B80\u5316\u60A8\u7684\u6536\u5165\u6D41\u7A0B\uFF0C\u52A0\u901F\u6536\u6B3E\u3002',
            },
            organizeSection: {
                title: '\u7EC4\u7EC7',
                subtitle: '\u5206\u7EC4\u548C\u5206\u6790\u652F\u51FA\uFF0C\u8BB0\u5F55\u6BCF\u4E00\u7B14\u7F34\u7EB3\u7684\u7A0E\u6B3E\u3002',
            },
            integrateSection: {
                title: '\u96C6\u6210',
                subtitle: '\u5C06 Expensify \u8FDE\u63A5\u5230\u6D41\u884C\u7684\u91D1\u878D\u4EA7\u54C1\u3002',
            },
            distanceRates: {
                title: '\u8DDD\u79BB\u8D39\u7387',
                subtitle: '\u6DFB\u52A0\u3001\u66F4\u65B0\u548C\u6267\u884C\u8D39\u7387\u3002',
            },
            perDiem: {
                title: '\u6BCF\u65E5\u6D25\u8D34',
                subtitle: '\u8BBE\u7F6E\u6BCF\u65E5\u6D25\u8D34\u6807\u51C6\u4EE5\u63A7\u5236\u5458\u5DE5\u7684\u6BCF\u65E5\u652F\u51FA\u3002',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: '\u83B7\u53D6\u652F\u51FA\u6D1E\u5BDF\u548C\u63A7\u5236\u6743\u3002',
                disableCardTitle: '\u7981\u7528 Expensify Card',
                disableCardPrompt:
                    '\u60A8\u65E0\u6CD5\u7981\u7528 Expensify Card\uFF0C\u56E0\u4E3A\u5B83\u5DF2\u5728\u4F7F\u7528\u4E2D\u3002\u8BF7\u8054\u7CFB Concierge \u83B7\u53D6\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
                disableCardButton: '\u4E0EConcierge\u804A\u5929',
                feed: {
                    title: '\u83B7\u53D6 Expensify \u5361',
                    subTitle: '\u7B80\u5316\u60A8\u7684\u4E1A\u52A1\u652F\u51FA\uFF0C\u8282\u7701\u591A\u8FBE50%\u7684Expensify\u8D26\u5355\uFF0C\u6B64\u5916\uFF1A',
                    features: {
                        cashBack: '\u6BCF\u7B14\u7F8E\u56FD\u6D88\u8D39\u90FD\u53EF\u83B7\u5F97\u73B0\u91D1\u8FD4\u8FD8',
                        unlimited: '\u65E0\u9650\u865A\u62DF\u5361',
                        spend: '\u652F\u51FA\u63A7\u5236\u548C\u81EA\u5B9A\u4E49\u9650\u5236',
                    },
                    ctaTitle: '\u53D1\u884C\u65B0\u5361',
                },
            },
            companyCards: {
                title: '\u516C\u53F8\u5361\u7247',
                subtitle: '\u4ECE\u73B0\u6709\u516C\u53F8\u5361\u4E2D\u5BFC\u5165\u652F\u51FA\u3002',
                feed: {
                    title: '\u5BFC\u5165\u516C\u53F8\u5361\u7247',
                    features: {
                        support: '\u652F\u6301\u6240\u6709\u4E3B\u8981\u7684\u5361\u63D0\u4F9B\u5546',
                        assignCards: '\u5C06\u5361\u7247\u5206\u914D\u7ED9\u6574\u4E2A\u56E2\u961F',
                        automaticImport: '\u81EA\u52A8\u4EA4\u6613\u5BFC\u5165',
                    },
                },
                disableCardTitle: '\u7981\u7528\u516C\u53F8\u5361',
                disableCardPrompt:
                    '\u60A8\u65E0\u6CD5\u7981\u7528\u516C\u53F8\u5361\uFF0C\u56E0\u4E3A\u6B64\u529F\u80FD\u6B63\u5728\u4F7F\u7528\u4E2D\u3002\u8BF7\u8054\u7CFBConcierge\u4EE5\u83B7\u53D6\u4E0B\u4E00\u6B65\u64CD\u4F5C\u3002',
                disableCardButton: '\u4E0EConcierge\u804A\u5929',
                cardDetails: '\u5361\u7247\u8BE6\u60C5',
                cardNumber: '\u5361\u53F7',
                cardholder: '\u6301\u5361\u4EBA',
                cardName: '\u5361\u7247\u540D\u79F0',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} \u5BFC\u51FA` : `${integration} \u5BFC\u51FA`,
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `\u9009\u62E9\u5E94\u5BFC\u51FA\u4EA4\u6613\u7684 ${integration} \u8D26\u6237\u3002`,
                integrationExportTitlePart: '\u9009\u62E9\u5176\u4ED6',
                integrationExportTitleLinkPart: '\u5BFC\u51FA\u9009\u9879',
                integrationExportTitleSecondPart: '\u66F4\u6539\u53EF\u7528\u8D26\u6237\u3002',
                lastUpdated: '\u6700\u540E\u66F4\u65B0',
                transactionStartDate: '\u4EA4\u6613\u5F00\u59CB\u65E5\u671F',
                updateCard: '\u66F4\u65B0\u5361\u7247',
                unassignCard: '\u53D6\u6D88\u5206\u914D\u5361\u7247',
                unassign: '\u53D6\u6D88\u5206\u914D',
                unassignCardDescription:
                    '\u53D6\u6D88\u5206\u914D\u6B64\u5361\u5C06\u4ECE\u6301\u5361\u4EBA\u7684\u8D26\u6237\u4E2D\u79FB\u9664\u8349\u7A3F\u62A5\u544A\u4E2D\u7684\u6240\u6709\u4EA4\u6613\u3002',
                assignCard: '\u5206\u914D\u5361\u7247',
                cardFeedName: '\u5361\u7247\u63D0\u8981\u540D\u79F0',
                cardFeedNameDescription:
                    '\u7ED9\u5361\u7247\u63D0\u8981\u4E00\u4E2A\u72EC\u7279\u7684\u540D\u79F0\uFF0C\u4EE5\u4FBF\u60A8\u53EF\u4EE5\u5C06\u5176\u4E0E\u5176\u4ED6\u63D0\u8981\u533A\u5206\u5F00\u3002',
                cardFeedTransaction: '\u5220\u9664\u4EA4\u6613\u8BB0\u5F55',
                cardFeedTransactionDescription:
                    '\u9009\u62E9\u6301\u5361\u4EBA\u662F\u5426\u53EF\u4EE5\u5220\u9664\u5361\u4EA4\u6613\u3002\u65B0\u4EA4\u6613\u5C06\u9075\u5FAA\u8FD9\u4E9B\u89C4\u5219\u3002',
                cardFeedRestrictDeletingTransaction: '\u9650\u5236\u5220\u9664\u4EA4\u6613',
                cardFeedAllowDeletingTransaction: '\u5141\u8BB8\u5220\u9664\u4EA4\u6613',
                removeCardFeed: '\u79FB\u9664\u5361\u7247\u4FE1\u606F\u6D41',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `\u5220\u9664 ${feedName} \u63D0\u8981`,
                removeCardFeedDescription: '\u60A8\u786E\u5B9A\u8981\u79FB\u9664\u6B64\u5361\u7247\u6E90\u5417\uFF1F\u8FD9\u5C06\u53D6\u6D88\u5206\u914D\u6240\u6709\u5361\u7247\u3002',
                error: {
                    feedNameRequired: '\u5361\u7247\u63D0\u8981\u540D\u79F0\u662F\u5FC5\u9700\u7684',
                },
                corporate: '\u9650\u5236\u5220\u9664\u4EA4\u6613',
                personal: '\u5141\u8BB8\u5220\u9664\u4EA4\u6613',
                setFeedNameDescription:
                    '\u4E3A\u5361\u7247\u63D0\u8981\u8D77\u4E00\u4E2A\u72EC\u7279\u7684\u540D\u5B57\uFF0C\u4EE5\u4FBF\u60A8\u80FD\u5C06\u5176\u4E0E\u5176\u4ED6\u63D0\u8981\u533A\u5206\u5F00\u6765\u3002',
                setTransactionLiabilityDescription:
                    '\u542F\u7528\u540E\uFF0C\u6301\u5361\u4EBA\u53EF\u4EE5\u5220\u9664\u5361\u4EA4\u6613\u3002\u65B0\u4EA4\u6613\u5C06\u9075\u5FAA\u6B64\u89C4\u5219\u3002',
                emptyAddedFeedTitle: '\u5206\u914D\u516C\u53F8\u5361',
                emptyAddedFeedDescription: '\u5F00\u59CB\u4E3A\u6210\u5458\u5206\u914D\u60A8\u7684\u7B2C\u4E00\u5F20\u5361\u7247\u3002',
                pendingFeedTitle: `\u6211\u4EEC\u6B63\u5728\u5BA1\u6838\u60A8\u7684\u8BF7\u6C42...`,
                pendingFeedDescription: `\u6211\u4EEC\u76EE\u524D\u6B63\u5728\u5BA1\u6838\u60A8\u7684\u63D0\u8981\u8BE6\u60C5\u3002\u5B8C\u6210\u540E\uFF0C\u6211\u4EEC\u4F1A\u901A\u8FC7\u4EE5\u4E0B\u65B9\u5F0F\u4E0E\u60A8\u8054\u7CFB`,
                pendingBankTitle: '\u68C0\u67E5\u60A8\u7684\u6D4F\u89C8\u5668\u7A97\u53E3',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `\u8BF7\u901A\u8FC7\u521A\u521A\u6253\u5F00\u7684\u6D4F\u89C8\u5668\u7A97\u53E3\u8FDE\u63A5\u5230${bankName}\u3002\u5982\u679C\u6CA1\u6709\u6253\u5F00\uFF0C`,
                pendingBankLink: '\u8BF7\u70B9\u51FB\u8FD9\u91CC\u3002',
                giveItNameInstruction: '\u7ED9\u8FD9\u5F20\u5361\u7247\u8D77\u4E00\u4E2A\u4E0E\u4F17\u4E0D\u540C\u7684\u540D\u5B57\u3002',
                updating: '\u6B63\u5728\u66F4\u65B0...',
                noAccountsFound: '\u672A\u627E\u5230\u8D26\u6237',
                defaultCard: '\u9ED8\u8BA4\u5361\u7247',
                downgradeTitle: `\u65E0\u6CD5\u964D\u7EA7\u5DE5\u4F5C\u533A`,
                downgradeSubTitleFirstPart: `\u6B64\u5DE5\u4F5C\u533A\u65E0\u6CD5\u964D\u7EA7\uFF0C\u56E0\u4E3A\u8FDE\u63A5\u4E86\u591A\u4E2A\u5361\u7247\u9988\u9001\uFF08\u4E0D\u5305\u62ECExpensify\u5361\uFF09\u3002\u8BF7`,
                downgradeSubTitleMiddlePart: `\u4EC5\u4FDD\u7559\u4E00\u5F20\u5361\u7247\u4FE1\u606F\u6D41`,
                downgradeSubTitleLastPart: '\u7EE7\u7EED\u3002',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `\u8BF7\u5728${connection}\u4E2D\u6DFB\u52A0\u8D26\u6237\u5E76\u518D\u6B21\u540C\u6B65\u8FDE\u63A5`,
                expensifyCardBannerTitle: '\u83B7\u53D6 Expensify \u5361',
                expensifyCardBannerSubtitle:
                    '\u5728\u7F8E\u56FD\u7684\u6BCF\u7B14\u6D88\u8D39\u4E2D\u4EAB\u53D7\u73B0\u91D1\u8FD4\u8FD8\uFF0CExpensify\u8D26\u5355\u6700\u9AD8\u53EF\u4EAB50%\u6298\u6263\uFF0C\u63D0\u4F9B\u65E0\u9650\u91CF\u865A\u62DF\u5361\uFF0C\u7B49\u7B49\u66F4\u591A\u4F18\u60E0\u3002',
                expensifyCardBannerLearnMoreButton: '\u4E86\u89E3\u66F4\u591A',
            },
            workflows: {
                title: '\u5DE5\u4F5C\u6D41\u7A0B',
                subtitle: '\u914D\u7F6E\u652F\u51FA\u5BA1\u6279\u548C\u652F\u4ED8\u65B9\u5F0F\u3002',
                disableApprovalPrompt:
                    '\u6B64\u5DE5\u4F5C\u533A\u7684Expensify\u5361\u76EE\u524D\u4F9D\u8D56\u5BA1\u6279\u6765\u5B9A\u4E49\u5176\u667A\u80FD\u9650\u989D\u3002\u8BF7\u5728\u7981\u7528\u5BA1\u6279\u4E4B\u524D\u4FEE\u6539\u4EFB\u4F55\u5177\u6709\u667A\u80FD\u9650\u989D\u7684Expensify\u5361\u7684\u9650\u989D\u7C7B\u578B\u3002',
            },
            invoices: {
                title: '\u53D1\u7968',
                subtitle: '\u53D1\u9001\u548C\u63A5\u6536\u53D1\u7968\u3002',
            },
            categories: {
                title: '\u7C7B\u522B',
                subtitle: '\u8DDF\u8E2A\u548C\u7EC4\u7EC7\u652F\u51FA\u3002',
            },
            tags: {
                title: '\u6807\u7B7E',
                subtitle: '\u5206\u7C7B\u6210\u672C\u5E76\u8DDF\u8E2A\u53EF\u8BA1\u8D39\u8D39\u7528\u3002',
            },
            taxes: {
                title: '\u7A0E\u6B3E',
                subtitle: '\u8BB0\u5F55\u5E76\u7533\u62A5\u7B26\u5408\u6761\u4EF6\u7684\u7A0E\u6B3E\u3002',
            },
            reportFields: {
                title: '\u62A5\u544A\u5B57\u6BB5',
                subtitle: '\u4E3A\u652F\u51FA\u8BBE\u7F6E\u81EA\u5B9A\u4E49\u5B57\u6BB5\u3002',
            },
            connections: {
                title: '\u4F1A\u8BA1',
                subtitle: '\u540C\u6B65\u60A8\u7684\u4F1A\u8BA1\u79D1\u76EE\u8868\u53CA\u66F4\u591A\u5185\u5BB9\u3002',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '\u6162\u7740...',
                featureEnabledText: '\u8981\u542F\u7528\u6216\u7981\u7528\u6B64\u529F\u80FD\uFF0C\u60A8\u9700\u8981\u66F4\u6539\u4F1A\u8BA1\u5BFC\u5165\u8BBE\u7F6E\u3002',
                disconnectText: '\u8981\u7981\u7528\u4F1A\u8BA1\u529F\u80FD\uFF0C\u60A8\u9700\u8981\u4ECE\u5DE5\u4F5C\u533A\u65AD\u5F00\u4F1A\u8BA1\u8FDE\u63A5\u3002',
                manageSettings: '\u7BA1\u7406\u8BBE\u7F6E',
            },
            workflowWarningModal: {
                featureEnabledTitle: '\u6162\u7740...',
                featureEnabledText:
                    '\u6B64\u5DE5\u4F5C\u533A\u4E2D\u7684Expensify\u5361\u4F9D\u8D56\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B\u6765\u5B9A\u4E49\u5176\u667A\u80FD\u9650\u989D\u3002\n\n\u8BF7\u5728\u7981\u7528\u5DE5\u4F5C\u6D41\u7A0B\u4E4B\u524D\u66F4\u6539\u4EFB\u4F55\u5177\u6709\u667A\u80FD\u9650\u989D\u7684\u5361\u7684\u9650\u989D\u7C7B\u578B\u3002',
                confirmText: '\u524D\u5F80 Expensify Cards',
            },
            rules: {
                title: '\u89C4\u5219',
                subtitle: '\u9700\u8981\u6536\u636E\u3001\u6807\u8BB0\u9AD8\u6D88\u8D39\u7B49\u3002',
            },
        },
        reportFields: {
            addField: '\u6DFB\u52A0\u5B57\u6BB5',
            delete: '\u5220\u9664\u5B57\u6BB5',
            deleteFields: '\u5220\u9664\u5B57\u6BB5',
            findReportField: '\u67E5\u627E\u62A5\u544A\u5B57\u6BB5',
            deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u62A5\u544A\u5B57\u6BB5\u5417\uFF1F',
            deleteFieldsConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u62A5\u544A\u5B57\u6BB5\u5417\uFF1F',
            emptyReportFields: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u62A5\u544A\u5B57\u6BB5',
                subtitle:
                    '\u6DFB\u52A0\u4E00\u4E2A\u81EA\u5B9A\u4E49\u5B57\u6BB5\uFF08\u6587\u672C\u3001\u65E5\u671F\u6216\u4E0B\u62C9\u83DC\u5355\uFF09\uFF0C\u663E\u793A\u5728\u62A5\u544A\u4E2D\u3002',
            },
            subtitle:
                '\u62A5\u544A\u5B57\u6BB5\u9002\u7528\u4E8E\u6240\u6709\u652F\u51FA\uFF0C\u5F53\u60A8\u9700\u8981\u63D0\u793A\u989D\u5916\u4FE1\u606F\u65F6\uFF0C\u5B83\u4EEC\u4F1A\u5F88\u6709\u5E2E\u52A9\u3002',
            disableReportFields: '\u7981\u7528\u62A5\u544A\u5B57\u6BB5',
            disableReportFieldsConfirmation:
                '\u4F60\u786E\u5B9A\u5417\uFF1F\u6587\u672C\u548C\u65E5\u671F\u5B57\u6BB5\u5C06\u88AB\u5220\u9664\uFF0C\u5217\u8868\u5C06\u88AB\u7981\u7528\u3002',
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u62A5\u544A\u5B57\u6BB5\u662F\u4ECE\u60A8\u7684',
            textType: '\u6587\u672C',
            dateType: '\u65E5\u671F',
            dropdownType: '\u5217\u8868',
            textAlternateText: '\u6DFB\u52A0\u4E00\u4E2A\u7528\u4E8E\u81EA\u7531\u6587\u672C\u8F93\u5165\u7684\u5B57\u6BB5\u3002',
            dateAlternateText: '\u6DFB\u52A0\u65E5\u5386\u4EE5\u9009\u62E9\u65E5\u671F\u3002',
            dropdownAlternateText: '\u6DFB\u52A0\u4E00\u4E2A\u9009\u9879\u5217\u8868\u4F9B\u9009\u62E9\u3002',
            nameInputSubtitle: '\u4E3A\u62A5\u544A\u5B57\u6BB5\u9009\u62E9\u4E00\u4E2A\u540D\u79F0\u3002',
            typeInputSubtitle: '\u9009\u62E9\u8981\u4F7F\u7528\u7684\u62A5\u544A\u5B57\u6BB5\u7C7B\u578B\u3002',
            initialValueInputSubtitle: '\u8F93\u5165\u4E00\u4E2A\u8D77\u59CB\u503C\u4EE5\u663E\u793A\u5728\u62A5\u544A\u5B57\u6BB5\u4E2D\u3002',
            listValuesInputSubtitle:
                '\u8FD9\u4E9B\u503C\u5C06\u51FA\u73B0\u5728\u60A8\u7684\u62A5\u544A\u5B57\u6BB5\u4E0B\u62C9\u83DC\u5355\u4E2D\u3002\u6210\u5458\u53EF\u4EE5\u9009\u62E9\u5DF2\u542F\u7528\u7684\u503C\u3002',
            listInputSubtitle:
                '\u8FD9\u4E9B\u503C\u5C06\u663E\u793A\u5728\u60A8\u7684\u62A5\u544A\u5B57\u6BB5\u5217\u8868\u4E2D\u3002\u6210\u5458\u53EF\u4EE5\u9009\u62E9\u5DF2\u542F\u7528\u7684\u503C\u3002',
            deleteValue: '\u5220\u9664\u503C',
            deleteValues: '\u5220\u9664\u503C',
            disableValue: '\u7981\u7528\u503C',
            disableValues: '\u7981\u7528\u503C',
            enableValue: '\u542F\u7528\u503C',
            enableValues: '\u542F\u7528\u503C',
            emptyReportFieldsValues: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u5217\u8868\u503C',
                subtitle: '\u5728\u62A5\u544A\u4E2D\u6DFB\u52A0\u81EA\u5B9A\u4E49\u503C\u3002',
            },
            deleteValuePrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5217\u8868\u503C\u5417\uFF1F',
            deleteValuesPrompt: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u5217\u8868\u503C\u5417\uFF1F',
            listValueRequiredError: '\u8BF7\u8F93\u5165\u5217\u8868\u503C\u540D\u79F0',
            existingListValueError: '\u5177\u6709\u6B64\u540D\u79F0\u7684\u5217\u8868\u503C\u5DF2\u5B58\u5728',
            editValue: '\u7F16\u8F91\u503C',
            listValues: '\u5217\u51FA\u503C',
            addValue: '\u589E\u52A0\u4EF7\u503C',
            existingReportFieldNameError: '\u5177\u6709\u6B64\u540D\u79F0\u7684\u62A5\u544A\u5B57\u6BB5\u5DF2\u5B58\u5728',
            reportFieldNameRequiredError: '\u8BF7\u8F93\u5165\u62A5\u544A\u5B57\u6BB5\u540D\u79F0',
            reportFieldTypeRequiredError: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u62A5\u544A\u5B57\u6BB5\u7C7B\u578B',
            reportFieldInitialValueRequiredError: '\u8BF7\u9009\u62E9\u62A5\u544A\u5B57\u6BB5\u7684\u521D\u59CB\u503C',
            genericFailureMessage: '\u66F4\u65B0\u62A5\u544A\u5B57\u6BB5\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
        },
        tags: {
            tagName: '\u6807\u7B7E\u540D\u79F0',
            requiresTag: '\u6210\u5458\u5FC5\u987B\u6807\u8BB0\u6240\u6709\u8D39\u7528',
            trackBillable: '\u8DDF\u8E2A\u53EF\u8BA1\u8D39\u8D39\u7528',
            customTagName: '\u81EA\u5B9A\u4E49\u6807\u7B7E\u540D\u79F0',
            enableTag: '\u542F\u7528\u6807\u7B7E',
            enableTags: '\u542F\u7528\u6807\u7B7E',
            disableTag: '\u7981\u7528\u6807\u7B7E',
            disableTags: '\u7981\u7528\u6807\u7B7E',
            addTag: '\u6DFB\u52A0\u6807\u7B7E',
            editTag: '\u7F16\u8F91\u6807\u7B7E',
            editTags: '\u7F16\u8F91\u6807\u7B7E',
            findTag: '\u67E5\u627E\u6807\u7B7E',
            subtitle: '\u6807\u7B7E\u63D0\u4F9B\u4E86\u66F4\u8BE6\u7EC6\u7684\u65B9\u6CD5\u6765\u5206\u7C7B\u8D39\u7528\u3002',
            requireTag: '要求标签',
            requireTags: '要求标签',
            notRequireTags: '不要求',

            dependentMultiLevelTagsSubtitle: {
                phrase1: ' 您正在使用 ',
                phrase2: '依赖标签',
                phrase3: '。您可以 ',
                phrase4: '重新导入电子表格',
                phrase5: ' 来更新您的标签。',
            },

            emptyTags: {
                title: '\u60A8\u5C1A\u672A\u521B\u5EFA\u4EFB\u4F55\u6807\u7B7E',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: '\u6DFB\u52A0\u6807\u7B7E\u4EE5\u8DDF\u8E2A\u9879\u76EE\u3001\u5730\u70B9\u3001\u90E8\u95E8\u7B49\u3002',
                subtitle1: '\u5BFC\u5165\u7535\u5B50\u8868\u683C\u4EE5\u6DFB\u52A0\u6807\u7B7E\uFF0C\u7528\u4E8E\u8DDF\u8E2A\u9879\u76EE\u3001\u5730\u70B9\u3001\u90E8\u95E8\u7B49\u3002',
                subtitle2: '\u4E86\u89E3\u66F4\u591A',
                subtitle3: '\u5173\u4E8E\u683C\u5F0F\u5316\u6807\u7B7E\u6587\u4EF6\u3002',
            },
            emptyTagsWithAccounting: {
                subtitle1: '\u60A8\u7684\u6807\u7B7E\u76EE\u524D\u6B63\u5728\u4ECE\u4F1A\u8BA1\u8FDE\u63A5\u5BFC\u5165\u3002\u524D\u5F80',
                subtitle2: '\u4F1A\u8BA1',
                subtitle3: '\u8FDB\u884C\u4EFB\u4F55\u66F4\u6539\u3002',
            },
            deleteTag: '\u5220\u9664\u6807\u7B7E',
            deleteTags: '\u5220\u9664\u6807\u7B7E',
            deleteTagConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u6807\u7B7E\u5417\uFF1F',
            deleteTagsConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u6807\u7B7E\u5417\uFF1F',
            deleteFailureMessage: '\u5220\u9664\u6807\u7B7E\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            tagRequiredError: '\u6807\u7B7E\u540D\u79F0\u662F\u5FC5\u9700\u7684',
            existingTagError: '\u5DF2\u5B58\u5728\u540C\u540D\u6807\u7B7E',
            invalidTagNameError: '\u6807\u7B7E\u540D\u79F0\u4E0D\u80FD\u4E3A0\u3002\u8BF7\u9009\u62E9\u4E00\u4E2A\u4E0D\u540C\u7684\u503C\u3002',
            genericFailureMessage: '\u66F4\u65B0\u6807\u7B7E\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u6807\u7B7E\u662F\u4ECE\u60A8\u7684',
            glCode: 'GL\u4EE3\u7801',
            updateGLCodeFailureMessage: '\u66F4\u65B0GL\u4EE3\u7801\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            tagRules: '\u6807\u7B7E\u89C4\u5219',
            approverDescription: '\u5BA1\u6279\u4EBA',
            importTags: '\u5BFC\u5165\u6807\u7B7E',
            importTagsSupportingText: '\u4F7F\u7528\u4E00\u79CD\u6216\u591A\u79CD\u6807\u7B7E\u5BF9\u60A8\u7684\u8D39\u7528\u8FDB\u884C\u7F16\u7801\u3002',
            configureMultiLevelTags: '\u914D\u7F6E\u60A8\u7684\u591A\u7EA7\u6807\u7B7E\u5217\u8868\u3002',
            importMultiLevelTagsSupportingText: `\u8FD9\u662F\u60A8\u7684\u6807\u7B7E\u9884\u89C8\u3002\u5982\u679C\u4E00\u5207\u770B\u8D77\u6765\u4E0D\u9519\uFF0C\u8BF7\u70B9\u51FB\u4E0B\u9762\u5BFC\u5165\u5B83\u4EEC\u3002`,
            importMultiLevelTags: {
                firstRowTitle: '\u6BCF\u4E2A\u6807\u7B7E\u5217\u8868\u7684\u7B2C\u4E00\u884C\u662F\u6807\u9898',
                independentTags: '\u8FD9\u4E9B\u662F\u72EC\u7ACB\u6807\u7B7E',
                glAdjacentColumn: '\u76F8\u90BB\u5217\u4E2D\u6709\u4E00\u4E2A GL \u4EE3\u7801',
            },
            tagLevel: {
                singleLevel: '\u5355\u7EA7\u6807\u7B7E',
                multiLevel: '\u591A\u7EA7\u6807\u7B7E',
            },
            switchSingleToMultiLevelTagWarning: {
                title: '\u5207\u6362\u6807\u7B7E\u7EA7\u522B',
                prompt1: '\u5207\u6362\u6807\u7B7E\u7EA7\u522B\u5C06\u6E05\u9664\u6240\u6709\u5F53\u524D\u6807\u7B7E\u3002',
                prompt2: '\u6211\u4EEC\u5EFA\u8BAE\u60A8\u9996\u5148',
                prompt3: '\u4E0B\u8F7D\u5907\u4EFD',
                prompt4: '\u901A\u8FC7\u5BFC\u51FA\u60A8\u7684\u6807\u7B7E\u3002',
                prompt5: '\u4E86\u89E3\u66F4\u591A',
                prompt6: '\u5173\u4E8E\u6807\u7B7E\u7EA7\u522B\u3002',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `\u6211\u4EEC\u5728\u60A8\u7684\u7535\u5B50\u8868\u683C\u4E2D\u627E\u5230\u4E86*${columnCounts} \u5217*\u3002\u9009\u62E9\u5305\u542B\u6807\u7B7E\u540D\u79F0\u7684\u5217\u65C1\u8FB9\u7684*\u540D\u79F0*\u3002\u60A8\u8FD8\u53EF\u4EE5\u9009\u62E9\u8BBE\u7F6E\u6807\u7B7E\u72B6\u6001\u7684\u5217\u65C1\u8FB9\u7684*\u542F\u7528*\u3002`,
            cannotDeleteOrDisableAllTags: {
                title: '\u65E0\u6CD5\u5220\u9664\u6216\u7981\u7528\u6240\u6709\u6807\u7B7E',
                description: `\u7531\u4E8E\u60A8\u7684\u5DE5\u4F5C\u533A\u9700\u8981\u6807\u7B7E\uFF0C\u81F3\u5C11\u5FC5\u987B\u542F\u7528\u4E00\u4E2A\u6807\u7B7E\u3002`,
            },
            cannotMakeAllTagsOptional: {
                title: '\u65E0\u6CD5\u5C06\u6240\u6709\u6807\u7B7E\u8BBE\u4E3A\u53EF\u9009',
                description: `\u7531\u4E8E\u60A8\u7684\u5DE5\u4F5C\u533A\u8BBE\u7F6E\u8981\u6C42\u6807\u7B7E\uFF0C\u81F3\u5C11\u4E00\u4E2A\u6807\u7B7E\u5FC5\u987B\u4FDD\u6301\u4E3A\u5FC5\u586B\u3002`,
            },
            tagCount: () => ({
                one: '1 \u6807\u7B7E',
                other: (count: number) => `${count} \u6807\u7B7E`,
            }),
        },
        taxes: {
            subtitle: '\u6DFB\u52A0\u7A0E\u540D\u3001\u7A0E\u7387\uFF0C\u5E76\u8BBE\u7F6E\u9ED8\u8BA4\u503C\u3002',
            addRate: '\u6DFB\u52A0\u8D39\u7387',
            workspaceDefault: '\u5DE5\u4F5C\u533A\u9ED8\u8BA4\u8D27\u5E01',
            foreignDefault: '\u5916\u5E01\u9ED8\u8BA4\u503C',
            customTaxName: '\u81EA\u5B9A\u4E49\u7A0E\u540D',
            value: '\u503C',
            taxReclaimableOn: '\u53EF\u9000\u7A0E',
            taxRate: '\u7A0E\u7387',
            findTaxRate: '\u67E5\u627E\u7A0E\u7387',
            error: {
                taxRateAlreadyExists: '\u8BE5\u7A0E\u540D\u5DF2\u88AB\u4F7F\u7528',
                taxCodeAlreadyExists: '\u6B64\u7A0E\u7801\u5DF2\u88AB\u4F7F\u7528',
                valuePercentageRange: '\u8BF7\u8F93\u51650\u5230100\u4E4B\u95F4\u7684\u6709\u6548\u767E\u5206\u6BD4',
                customNameRequired: '\u81EA\u5B9A\u4E49\u7A0E\u540D\u662F\u5FC5\u9700\u7684',
                deleteFailureMessage: '\u5220\u9664\u7A0E\u7387\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u6216\u5411Concierge\u5BFB\u6C42\u5E2E\u52A9\u3002',
                updateFailureMessage: '\u66F4\u65B0\u7A0E\u7387\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u6216\u5411Concierge\u5BFB\u6C42\u5E2E\u52A9\u3002',
                createFailureMessage: '\u521B\u5EFA\u7A0E\u7387\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u6216\u5411Concierge\u5BFB\u6C42\u5E2E\u52A9\u3002',
                updateTaxClaimableFailureMessage: '\u53EF\u62A5\u9500\u90E8\u5206\u5FC5\u987B\u5C0F\u4E8E\u8DDD\u79BB\u8D39\u7387\u91D1\u989D\u3002',
            },
            deleteTaxConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u7A0E\u8D39\u5417\uFF1F',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `\u60A8\u786E\u5B9A\u8981\u5220\u9664 ${taxAmount} \u7A0E\u6B3E\u5417\uFF1F`,
            actions: {
                delete: '\u5220\u9664\u8D39\u7387',
                deleteMultiple: '\u5220\u9664\u8D39\u7387',
                enable: '\u542F\u7528\u8D39\u7387',
                disable: '\u7981\u7528\u8D39\u7387',
                enableTaxRates: () => ({
                    one: '\u542F\u7528\u8D39\u7387',
                    other: '\u542F\u7528\u8D39\u7387',
                }),
                disableTaxRates: () => ({
                    one: '\u7981\u7528\u8D39\u7387',
                    other: '\u7981\u7528\u8D39\u7387',
                }),
            },
            importedFromAccountingSoftware: '\u4EE5\u4E0B\u7A0E\u6B3E\u662F\u4ECE\u60A8\u7684',
            taxCode: '\u7A0E\u7801',
            updateTaxCodeFailureMessage: '\u66F4\u65B0\u7A0E\u7801\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5',
        },
        emptyWorkspace: {
            title: '\u521B\u5EFA\u5DE5\u4F5C\u533A',
            subtitle:
                '\u521B\u5EFA\u4E00\u4E2A\u5DE5\u4F5C\u533A\u6765\u8DDF\u8E2A\u6536\u636E\u3001\u62A5\u9500\u8D39\u7528\u3001\u7BA1\u7406\u65C5\u884C\u3001\u53D1\u9001\u53D1\u7968\u7B49\u2014\u2014\u6240\u6709\u8FD9\u4E9B\u90FD\u4EE5\u804A\u5929\u7684\u901F\u5EA6\u8FDB\u884C\u3002',
            createAWorkspaceCTA: '\u5F00\u59CB\u4F7F\u7528',
            features: {
                trackAndCollect: '\u8DDF\u8E2A\u548C\u6536\u96C6\u6536\u636E',
                reimbursements: '\u62A5\u9500\u5458\u5DE5\u8D39\u7528',
                companyCards: '\u7BA1\u7406\u516C\u53F8\u5361\u7247',
            },
            notFound: '\u672A\u627E\u5230\u5DE5\u4F5C\u533A',
            description:
                '\u804A\u5929\u5BA4\u662F\u4E00\u4E2A\u4E0E\u591A\u4EBA\u8BA8\u8BBA\u548C\u5408\u4F5C\u7684\u597D\u5730\u65B9\u3002\u8981\u5F00\u59CB\u534F\u4F5C\uFF0C\u8BF7\u521B\u5EFA\u6216\u52A0\u5165\u4E00\u4E2A\u5DE5\u4F5C\u533A\u3002',
        },
        new: {
            newWorkspace: '\u65B0\u5DE5\u4F5C\u533A',
            getTheExpensifyCardAndMore: '\u83B7\u53D6Expensify\u5361\u53CA\u66F4\u591A\u5185\u5BB9',
            confirmWorkspace: '\u786E\u8BA4\u5DE5\u4F5C\u533A',
            myGroupWorkspace: '\u6211\u7684\u7FA4\u7EC4\u5DE5\u4F5C\u533A',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}\u7684\u5DE5\u4F5C\u533A${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: '\u4ECE\u5DE5\u4F5C\u533A\u79FB\u9664\u6210\u5458\u65F6\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u91CD\u8BD5\u3002',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `\u60A8\u786E\u5B9A\u8981\u79FB\u9664${memberName}\u5417\uFF1F`,
                other: '\u60A8\u786E\u5B9A\u8981\u79FB\u9664\u8FD9\u4E9B\u6210\u5458\u5417\uFF1F',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} \u662F\u6B64\u5DE5\u4F5C\u533A\u7684\u5BA1\u6279\u4EBA\u3002\u5F53\u60A8\u53D6\u6D88\u4E0E\u4ED6\u4EEC\u5171\u4EAB\u6B64\u5DE5\u4F5C\u533A\u65F6\uFF0C\u6211\u4EEC\u5C06\u7528\u5DE5\u4F5C\u533A\u6240\u6709\u8005 ${ownerName} \u66FF\u6362\u4ED6\u4EEC\u5728\u5BA1\u6279\u6D41\u7A0B\u4E2D\u7684\u89D2\u8272\u3002`,
            removeMembersTitle: () => ({
                one: '\u79FB\u9664\u6210\u5458',
                other: '\u79FB\u9664\u6210\u5458',
            }),
            findMember: '\u67E5\u627E\u6210\u5458',
            removeWorkspaceMemberButtonTitle: '\u4ECE\u5DE5\u4F5C\u533A\u79FB\u9664',
            removeGroupMemberButtonTitle: '\u4ECE\u7FA4\u7EC4\u4E2D\u79FB\u9664',
            removeRoomMemberButtonTitle: '\u4ECE\u804A\u5929\u4E2D\u79FB\u9664',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `\u60A8\u786E\u5B9A\u8981\u79FB\u9664${memberName}\u5417\uFF1F`,
            removeMemberTitle: '\u79FB\u9664\u6210\u5458',
            transferOwner: '\u8F6C\u79FB\u6240\u6709\u8005',
            makeMember: '\u8BBE\u4E3A\u6210\u5458',
            makeAdmin: '\u8BBE\u4E3A\u7BA1\u7406\u5458',
            makeAuditor: '\u521B\u5EFA\u5BA1\u8BA1\u5458',
            selectAll: '\u5168\u9009',
            error: {
                genericAdd: '\u6DFB\u52A0\u6B64\u5DE5\u4F5C\u533A\u6210\u5458\u65F6\u51FA\u73B0\u95EE\u9898\u3002',
                cannotRemove: '\u60A8\u4E0D\u80FD\u79FB\u9664\u81EA\u5DF1\u6216\u5DE5\u4F5C\u533A\u6240\u6709\u8005',
                genericRemove: '\u79FB\u9664\u8BE5\u5DE5\u4F5C\u533A\u6210\u5458\u65F6\u51FA\u73B0\u95EE\u9898\u3002',
            },
            addedWithPrimary: '\u4E00\u4E9B\u6210\u5458\u5DF2\u4F7F\u7528\u5176\u4E3B\u8981\u767B\u5F55\u4FE1\u606F\u6DFB\u52A0\u3002',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `\u7531\u8F85\u52A9\u767B\u5F55 ${secondaryLogin} \u6DFB\u52A0\u3002`,
            membersListTitle: '\u6240\u6709\u5DE5\u4F5C\u533A\u6210\u5458\u7684\u76EE\u5F55\u3002',
            importMembers: '\u5BFC\u5165\u6210\u5458',
        },
        card: {
            getStartedIssuing: '\u5F00\u59CB\u7533\u8BF7\u60A8\u7684\u7B2C\u4E00\u5F20\u865A\u62DF\u6216\u5B9E\u4F53\u5361\u3002',
            issueCard: '\u53D1\u653E\u5361\u7247',
            issueNewCard: {
                whoNeedsCard: '\u8C01\u9700\u8981\u4E00\u5F20\u5361\uFF1F',
                findMember: '\u67E5\u627E\u6210\u5458',
                chooseCardType: '\u9009\u62E9\u5361\u7C7B\u578B',
                physicalCard: '\u5B9E\u4F53\u5361',
                physicalCardDescription: '\u975E\u5E38\u9002\u5408\u7ECF\u5E38\u6D88\u8D39\u7684\u4EBA',
                virtualCard: '\u865A\u62DF\u5361',
                virtualCardDescription: '\u5373\u65F6\u4E14\u7075\u6D3B',
                chooseLimitType: '\u9009\u62E9\u9650\u5236\u7C7B\u578B',
                smartLimit: '\u667A\u80FD\u9650\u989D',
                smartLimitDescription: '\u5728\u9700\u8981\u6279\u51C6\u4E4B\u524D\u82B1\u8D39\u4E0D\u8D85\u8FC7\u67D0\u4E2A\u91D1\u989D',
                monthly: '\u6BCF\u6708',
                monthlyDescription: '\u6BCF\u6708\u82B1\u8D39\u4E0D\u8D85\u8FC7\u4E00\u5B9A\u91D1\u989D',
                fixedAmount: '\u56FA\u5B9A\u91D1\u989D',
                fixedAmountDescription: '\u4E00\u6B21\u6027\u82B1\u8D39\u4E0D\u8D85\u8FC7\u67D0\u4E2A\u91D1\u989D',
                setLimit: '\u8BBE\u7F6E\u9650\u5236',
                cardLimitError: '\u8BF7\u8F93\u5165\u5C0F\u4E8E $21,474,836 \u7684\u91D1\u989D',
                giveItName: '\u7ED9\u5B83\u8D77\u4E2A\u540D\u5B57',
                giveItNameInstruction:
                    '\u4F7F\u5176\u8DB3\u591F\u72EC\u7279\uFF0C\u4EE5\u4FBF\u4E0E\u5176\u4ED6\u5361\u7247\u533A\u5206\u5F00\u6765\u3002\u5177\u4F53\u7684\u4F7F\u7528\u6848\u4F8B\u66F4\u4F73\uFF01',
                cardName: '\u5361\u7247\u540D\u79F0',
                letsDoubleCheck: '\u8BA9\u6211\u4EEC\u4ED4\u7EC6\u68C0\u67E5\u4E00\u4E0B\uFF0C\u786E\u4FDD\u4E00\u5207\u770B\u8D77\u6765\u90FD\u6B63\u786E\u3002',
                willBeReady: '\u6B64\u5361\u5C06\u7ACB\u5373\u53EF\u7528\u3002',
                cardholder: '\u6301\u5361\u4EBA',
                cardType: '\u5361\u7C7B\u578B',
                limit: '\u9650\u5236',
                limitType: '\u9650\u5236\u7C7B\u578B',
                name: '\u540D\u79F0',
            },
            deactivateCardModal: {
                deactivate: '\u505C\u7528',
                deactivateCard: '\u505C\u7528\u5361\u7247',
                deactivateConfirmation: '\u505C\u7528\u6B64\u5361\u5C06\u62D2\u7EDD\u6240\u6709\u672A\u6765\u7684\u4EA4\u6613\uFF0C\u4E14\u65E0\u6CD5\u64A4\u9500\u3002',
            },
        },
        accounting: {
            settings: '\u8BBE\u7F6E',
            title: '\u8FDE\u63A5',
            subtitle:
                '\u8FDE\u63A5\u5230\u60A8\u7684\u4F1A\u8BA1\u7CFB\u7EDF\uFF0C\u4EE5\u4F7F\u7528\u60A8\u7684\u79D1\u76EE\u8868\u5BF9\u4EA4\u6613\u8FDB\u884C\u7F16\u7801\uFF0C\u81EA\u52A8\u5339\u914D\u4ED8\u6B3E\uFF0C\u5E76\u4FDD\u6301\u8D22\u52A1\u540C\u6B65\u3002',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: '\u4E0E\u60A8\u7684\u8BBE\u7F6E\u4E13\u5BB6\u804A\u5929\u3002',
            talkYourAccountManager: '\u4E0E\u60A8\u7684\u5BA2\u6237\u7ECF\u7406\u804A\u5929\u3002',
            talkToConcierge: '\u4E0EConcierge\u804A\u5929\u3002',
            needAnotherAccounting: '\u9700\u8981\u5176\u4ED6\u4F1A\u8BA1\u8F6F\u4EF6\u5417\uFF1F',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: 'Expensify Classic \u4E2D\u8BBE\u7F6E\u7684\u8FDE\u63A5\u51FA\u73B0\u9519\u8BEF\u3002',
            goToODToFix: '\u8BF7\u524D\u5F80 Expensify Classic \u89E3\u51B3\u6B64\u95EE\u9898\u3002',
            goToODToSettings: '\u8BF7\u524D\u5F80 Expensify Classic \u7BA1\u7406\u60A8\u7684\u8BBE\u7F6E\u3002',
            setup: '\u8FDE\u63A5',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `\u4E0A\u6B21\u540C\u6B65\u65F6\u95F4\u4E3A${relativeDate}`,
            notSync: '\u672A\u540C\u6B65',
            import: '\u5BFC\u5165',
            export: '\u5BFC\u51FA',
            advanced: '\u9AD8\u7EA7',
            other: '\u5176\u4ED6',
            syncNow: '\u7ACB\u5373\u540C\u6B65',
            disconnect: '\u65AD\u5F00\u8FDE\u63A5',
            reinstall: '\u91CD\u65B0\u5B89\u88C5\u8FDE\u63A5\u5668',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '\u96C6\u6210';
                return `\u65AD\u5F00 ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `\u8FDE\u63A5 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '\u4F1A\u8BA1\u96C6\u6210'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230 QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230 Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230 NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230 QuickBooks Desktop';
                    default: {
                        return '\u65E0\u6CD5\u8FDE\u63A5\u5230\u96C6\u6210';
                    }
                }
            },
            accounts: '\u79D1\u76EE\u8868',
            taxes: '\u7A0E\u6B3E',
            imported: '\u5DF2\u5BFC\u5165',
            notImported: '\u672A\u5BFC\u5165',
            importAsCategory: '\u5BFC\u5165\u4E3A\u7C7B\u522B',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '\u5DF2\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '\u5BFC\u5165\u4E3A\u6807\u7B7E',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '\u5DF2\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '\u672A\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '\u672A\u5BFC\u5165',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '\u5BFC\u5165\u4E3A\u62A5\u544A\u5B57\u6BB5',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite \u5458\u5DE5\u9ED8\u8BA4\u503C',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '\u6B64\u96C6\u6210';
                return `\u60A8\u786E\u5B9A\u8981\u65AD\u5F00 ${integrationName} \u5417\uFF1F`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `\u60A8\u786E\u5B9A\u8981\u8FDE\u63A5${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '\u6B64\u4F1A\u8BA1\u96C6\u6210'}\u5417\uFF1F\u8FD9\u5C06\u79FB\u9664\u4EFB\u4F55\u73B0\u6709\u7684\u4F1A\u8BA1\u8FDE\u63A5\u3002`,
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
                            return '\u5BFC\u5165\u7C7B\u522B';
                        case 'quickbooksOnlineImportLocations':
                            return '\u5BFC\u5165\u4F4D\u7F6E';
                        case 'quickbooksOnlineImportProcessing':
                            return '\u6B63\u5728\u5904\u7406\u5BFC\u5165\u7684\u6570\u636E';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '\u540C\u6B65\u5DF2\u62A5\u9500\u62A5\u544A\u548C\u8D26\u5355\u4ED8\u6B3E';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '\u5BFC\u5165\u7A0E\u7801';
                        case 'quickbooksOnlineCheckConnection':
                            return '\u68C0\u67E5 QuickBooks Online \u8FDE\u63A5';
                        case 'quickbooksOnlineImportMain':
                            return '\u5BFC\u5165 QuickBooks Online \u6570\u636E';
                        case 'startingImportXero':
                            return '\u5BFC\u5165 Xero \u6570\u636E';
                        case 'startingImportQBO':
                            return '\u5BFC\u5165 QuickBooks Online \u6570\u636E';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return '\u5BFC\u5165 QuickBooks Desktop \u6570\u636E';
                        case 'quickbooksDesktopImportTitle':
                            return '\u5BFC\u5165\u6807\u9898';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '\u5BFC\u5165\u6279\u51C6\u8BC1\u4E66';
                        case 'quickbooksDesktopImportDimensions':
                            return '\u5BFC\u5165\u7EF4\u5EA6';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '\u5BFC\u5165\u4FDD\u5B58\u7B56\u7565';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return '\u4ECD\u5728\u4E0EQuickBooks\u540C\u6B65\u6570\u636E... \u8BF7\u786E\u4FDDWeb Connector\u6B63\u5728\u8FD0\u884C';
                        case 'quickbooksOnlineSyncTitle':
                            return '\u540C\u6B65 QuickBooks Online \u6570\u636E';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '\u52A0\u8F7D\u6570\u636E';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '\u66F4\u65B0\u7C7B\u522B';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '\u66F4\u65B0\u5BA2\u6237/\u9879\u76EE';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '\u66F4\u65B0\u4EBA\u5458\u5217\u8868';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '\u66F4\u65B0\u62A5\u544A\u5B57\u6BB5';
                        case 'jobDone':
                            return '\u6B63\u5728\u7B49\u5F85\u5BFC\u5165\u7684\u6570\u636E\u52A0\u8F7D';
                        case 'xeroSyncImportChartOfAccounts':
                            return '\u540C\u6B65\u4F1A\u8BA1\u79D1\u76EE\u8868';
                        case 'xeroSyncImportCategories':
                            return '\u540C\u6B65\u7C7B\u522B';
                        case 'xeroSyncImportCustomers':
                            return '\u540C\u6B65\u5BA2\u6237';
                        case 'xeroSyncXeroReimbursedReports':
                            return '\u5C06Expensify\u62A5\u544A\u6807\u8BB0\u4E3A\u5DF2\u62A5\u9500';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return '\u5C06 Xero \u8D26\u5355\u548C\u53D1\u7968\u6807\u8BB0\u4E3A\u5DF2\u652F\u4ED8';
                        case 'xeroSyncImportTrackingCategories':
                            return '\u540C\u6B65\u8DDF\u8E2A\u7C7B\u522B';
                        case 'xeroSyncImportBankAccounts':
                            return '\u540C\u6B65\u94F6\u884C\u8D26\u6237';
                        case 'xeroSyncImportTaxRates':
                            return '\u540C\u6B65\u7A0E\u7387';
                        case 'xeroCheckConnection':
                            return '\u68C0\u67E5 Xero \u8FDE\u63A5';
                        case 'xeroSyncTitle':
                            return '\u540C\u6B65 Xero \u6570\u636E';
                        case 'netSuiteSyncConnection':
                            return '\u6B63\u5728\u521D\u59CB\u5316\u4E0E NetSuite \u7684\u8FDE\u63A5';
                        case 'netSuiteSyncCustomers':
                            return '\u5BFC\u5165\u5BA2\u6237';
                        case 'netSuiteSyncInitData':
                            return '\u4ECENetSuite\u68C0\u7D22\u6570\u636E';
                        case 'netSuiteSyncImportTaxes':
                            return '\u5BFC\u5165\u7A0E\u6B3E';
                        case 'netSuiteSyncImportItems':
                            return '\u5BFC\u5165\u9879\u76EE';
                        case 'netSuiteSyncData':
                            return '\u5C06\u6570\u636E\u5BFC\u5165Expensify';
                        case 'netSuiteSyncAccounts':
                            return '\u540C\u6B65\u8D26\u6237';
                        case 'netSuiteSyncCurrencies':
                            return '\u540C\u6B65\u8D27\u5E01';
                        case 'netSuiteSyncCategories':
                            return '\u540C\u6B65\u7C7B\u522B';
                        case 'netSuiteSyncReportFields':
                            return '\u5C06\u6570\u636E\u5BFC\u5165\u4E3AExpensify\u62A5\u544A\u5B57\u6BB5';
                        case 'netSuiteSyncTags':
                            return '\u5C06\u6570\u636E\u5BFC\u5165\u4E3AExpensify\u6807\u7B7E';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '\u66F4\u65B0\u8FDE\u63A5\u4FE1\u606F';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return '\u5C06Expensify\u62A5\u544A\u6807\u8BB0\u4E3A\u5DF2\u62A5\u9500';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return '\u5C06 NetSuite \u8D26\u5355\u548C\u53D1\u7968\u6807\u8BB0\u4E3A\u5DF2\u652F\u4ED8';
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
                        case 'intacctCheckConnection':
                            return '\u68C0\u67E5 Sage Intacct \u8FDE\u63A5';
                        case 'intacctImportDimensions':
                            return '\u5BFC\u5165 Sage Intacct \u7EF4\u5EA6';
                        case 'intacctImportTitle':
                            return '\u5BFC\u5165 Sage Intacct \u6570\u636E';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `\u9636\u6BB5\u7684\u7FFB\u8BD1\u7F3A\u5931\uFF1A${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '\u9996\u9009\u5BFC\u51FA\u5668',
            exportPreferredExporterNote:
                '\u9996\u9009\u5BFC\u51FA\u8005\u53EF\u4EE5\u662F\u4EFB\u4F55\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\uFF0C\u4F46\u5982\u679C\u60A8\u5728\u57DF\u8BBE\u7F6E\u4E2D\u4E3A\u5355\u4E2A\u516C\u53F8\u5361\u8BBE\u7F6E\u4E86\u4E0D\u540C\u7684\u5BFC\u51FA\u8D26\u6237\uFF0C\u5219\u8FD8\u5FC5\u987B\u662F\u57DF\u7BA1\u7406\u5458\u3002',
            exportPreferredExporterSubNote:
                '\u4E00\u65E6\u8BBE\u7F6E\uFF0C\u9996\u9009\u5BFC\u51FA\u8005\u5C06\u5728\u5176\u8D26\u6237\u4E2D\u770B\u5230\u8981\u5BFC\u51FA\u7684\u62A5\u544A\u3002',
            exportAs: '\u5BFC\u51FA\u4E3A',
            exportOutOfPocket: '\u5C06\u81EA\u4ED8\u8D39\u7528\u5BFC\u51FA\u4E3A',
            exportCompanyCard: '\u5C06\u516C\u53F8\u5361\u8D39\u7528\u5BFC\u51FA\u4E3A',
            exportDate: '\u5BFC\u51FA\u65E5\u671F',
            defaultVendor: '\u9ED8\u8BA4\u4F9B\u5E94\u5546',
            autoSync: '\u81EA\u52A8\u540C\u6B65',
            autoSyncDescription: '\u6BCF\u5929\u81EA\u52A8\u540C\u6B65 NetSuite \u548C Expensify\u3002\u5B9E\u65F6\u5BFC\u51FA\u6700\u7EC8\u62A5\u544A\u3002',
            reimbursedReports: '\u540C\u6B65\u5DF2\u62A5\u9500\u7684\u62A5\u544A',
            cardReconciliation: '\u5361\u7247\u5BF9\u8D26',
            reconciliationAccount: '\u5BF9\u8D26\u8D26\u6237',
            continuousReconciliation: '\u6301\u7EED\u5BF9\u8D26',
            saveHoursOnReconciliation:
                '\u901A\u8FC7\u8BA9Expensify\u6301\u7EED\u4E3A\u60A8\u5BF9\u8D26Expensify Card\u7684\u5BF9\u8D26\u5355\u548C\u7ED3\u7B97\uFF0C\u6BCF\u4E2A\u4F1A\u8BA1\u671F\u95F4\u8282\u7701\u6570\u5C0F\u65F6\u7684\u5BF9\u8D26\u65F6\u95F4\u3002',
            enableContinuousReconciliation: '\u4E3A\u4E86\u542F\u7528\u6301\u7EED\u5BF9\u8D26\uFF0C\u8BF7\u542F\u7528',
            chooseReconciliationAccount: {
                chooseBankAccount: '\u9009\u62E9\u7528\u4E8E\u5BF9\u8D26\u60A8\u7684 Expensify Card \u4ED8\u6B3E\u7684\u94F6\u884C\u8D26\u6237\u3002',
                accountMatches: '\u786E\u4FDD\u6B64\u8D26\u6237\u4E0E\u60A8\u7684\u8D26\u6237\u5339\u914D',
                settlementAccount: 'Expensify Card \u7ED3\u7B97\u8D26\u6237',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) =>
                    `\uFF08\u4EE5 ${lastFourPAN} \u7ED3\u5C3E\uFF09\u4EE5\u4FBF\u8FDE\u7EED\u5BF9\u8D26\u6B63\u5E38\u5DE5\u4F5C\u3002`,
            },
        },
        export: {
            notReadyHeading: '\u672A\u51C6\u5907\u597D\u5BFC\u51FA',
            notReadyDescription:
                '\u8349\u7A3F\u6216\u5F85\u5904\u7406\u7684\u8D39\u7528\u62A5\u544A\u65E0\u6CD5\u5BFC\u51FA\u5230\u4F1A\u8BA1\u7CFB\u7EDF\u3002\u8BF7\u5728\u5BFC\u51FA\u4E4B\u524D\u6279\u51C6\u6216\u652F\u4ED8\u8FD9\u4E9B\u8D39\u7528\u3002',
        },
        invoices: {
            sendInvoice: '\u53D1\u9001\u53D1\u7968',
            sendFrom: '\u53D1\u9001\u81EA',
            invoicingDetails: '\u53D1\u7968\u8BE6\u60C5',
            invoicingDetailsDescription: '\u6B64\u4FE1\u606F\u5C06\u663E\u793A\u5728\u60A8\u7684\u53D1\u7968\u4E0A\u3002',
            companyName: 'Company name',
            companyWebsite: '\u516C\u53F8\u7F51\u7AD9',
            paymentMethods: {
                personal: '\u4E2A\u4EBA\u7684',
                business: '\u5546\u4E1A',
                chooseInvoiceMethod: '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u4ED8\u6B3E\u65B9\u5F0F\uFF1A',
                addBankAccount: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237',
                payingAsIndividual: '\u4EE5\u4E2A\u4EBA\u8EAB\u4EFD\u4ED8\u6B3E',
                payingAsBusiness: '\u4EE5\u4F01\u4E1A\u8EAB\u4EFD\u4ED8\u6B3E',
            },
            invoiceBalance: '\u53D1\u7968\u4F59\u989D',
            invoiceBalanceSubtitle:
                '\u8FD9\u662F\u60A8\u901A\u8FC7\u6536\u53D6\u53D1\u7968\u4ED8\u6B3E\u83B7\u5F97\u7684\u5F53\u524D\u4F59\u989D\u3002\u5982\u679C\u60A8\u5DF2\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\uFF0C\u5B83\u5C06\u81EA\u52A8\u8F6C\u5165\u60A8\u7684\u94F6\u884C\u8D26\u6237\u3002',
            bankAccountsSubtitle: '\u6DFB\u52A0\u94F6\u884C\u8D26\u6237\u4EE5\u8FDB\u884C\u548C\u63A5\u6536\u53D1\u7968\u4ED8\u6B3E\u3002',
        },
        invite: {
            member: '\u9080\u8BF7\u6210\u5458',
            members: '\u9080\u8BF7\u6210\u5458',
            invitePeople: '\u9080\u8BF7\u65B0\u6210\u5458',
            genericFailureMessage: '\u9080\u8BF7\u6210\u5458\u52A0\u5165\u5DE5\u4F5C\u533A\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            pleaseEnterValidLogin: `\u8BF7\u786E\u4FDD\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801\u6709\u6548\uFF08\u4F8B\u5982\uFF1A${CONST.EXAMPLE_PHONE_NUMBER}\uFF09\u3002`,
            user: '\u7528\u6237',
            users: '\u7528\u6237',
            invited: '\u9080\u8BF7',
            removed: 'removed',
            to: '\u5230',
            from: '\u4ECE',
        },
        inviteMessage: {
            confirmDetails: '\u786E\u8BA4\u8BE6\u60C5',
            inviteMessagePrompt: '\u901A\u8FC7\u5728\u4E0B\u65B9\u6DFB\u52A0\u6D88\u606F\uFF0C\u8BA9\u60A8\u7684\u9080\u8BF7\u51FD\u66F4\u52A0\u7279\u522B\uFF01',
            personalMessagePrompt: '\u6D88\u606F',
            genericFailureMessage: '\u9080\u8BF7\u6210\u5458\u52A0\u5165\u5DE5\u4F5C\u533A\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            inviteNoMembersError: '\u8BF7\u9009\u62E9\u81F3\u5C11\u4E00\u4F4D\u6210\u5458\u8FDB\u884C\u9080\u8BF7',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} \u8BF7\u6C42\u52A0\u5165 ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: '\u54CE\u5440\uFF01\u522B\u90A3\u4E48\u5FEB\u2026\u2026',
            workspaceNeeds: '\u5DE5\u4F5C\u533A\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u542F\u7528\u7684\u8DDD\u79BB\u8D39\u7387\u3002',
            distance: '\u8DDD\u79BB',
            centrallyManage: '\u96C6\u4E2D\u7BA1\u7406\u8D39\u7387\uFF0C\u6309\u82F1\u91CC\u6216\u516C\u91CC\u8DDF\u8E2A\uFF0C\u5E76\u8BBE\u7F6E\u9ED8\u8BA4\u7C7B\u522B\u3002',
            rate: '\u8D39\u7387',
            addRate: '\u6DFB\u52A0\u8D39\u7387',
            findRate: '\u67E5\u627E\u8D39\u7387',
            trackTax: '\u8DDF\u8E2A\u7A0E\u6B3E',
            deleteRates: () => ({
                one: '\u5220\u9664\u8D39\u7387',
                other: '\u5220\u9664\u8D39\u7387',
            }),
            enableRates: () => ({
                one: '\u542F\u7528\u8D39\u7387',
                other: '\u542F\u7528\u8D39\u7387',
            }),
            disableRates: () => ({
                one: '\u7981\u7528\u8D39\u7387',
                other: '\u7981\u7528\u8D39\u7387',
            }),
            enableRate: '\u542F\u7528\u8D39\u7387',
            status: '\u72B6\u6001',
            unit: '\u5355\u4F4D',
            taxFeatureNotEnabledMessage: '\u8981\u4F7F\u7528\u6B64\u529F\u80FD\uFF0C\u5FC5\u987B\u5728\u5DE5\u4F5C\u533A\u542F\u7528\u7A0E\u52A1\u529F\u80FD\u3002\u524D\u5F80',
            changePromptMessage: '\u8FDB\u884C\u8BE5\u66F4\u6539\u3002',
            deleteDistanceRate: '\u5220\u9664\u8DDD\u79BB\u8D39\u7387',
            areYouSureDelete: () => ({
                one: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u8D39\u7387\u5417\uFF1F',
                other: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E9B\u8D39\u7387\u5417\uFF1F',
            }),
        },
        editor: {
            descriptionInputLabel: '\u63CF\u8FF0',
            nameInputLabel: '\u540D\u79F0',
            typeInputLabel: '\u7C7B\u578B',
            initialValueInputLabel: '\u521D\u59CB\u503C',
            nameInputHelpText: '\u8FD9\u662F\u60A8\u5C06\u5728\u5DE5\u4F5C\u533A\u4E2D\u770B\u5230\u7684\u540D\u79F0\u3002',
            nameIsRequiredError: '\u60A8\u9700\u8981\u4E3A\u60A8\u7684\u5DE5\u4F5C\u533A\u547D\u540D',
            currencyInputLabel: '\u9ED8\u8BA4\u8D27\u5E01',
            currencyInputHelpText: '\u6B64\u5DE5\u4F5C\u533A\u7684\u6240\u6709\u8D39\u7528\u5C06\u8F6C\u6362\u4E3A\u6B64\u8D27\u5E01\u3002',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `\u65E0\u6CD5\u66F4\u6539\u9ED8\u8BA4\u8D27\u5E01\uFF0C\u56E0\u4E3A\u6B64\u5DE5\u4F5C\u533A\u5DF2\u94FE\u63A5\u5230\u4E00\u4E2A${currency}\u94F6\u884C\u8D26\u6237\u3002`,
            save: '\u4FDD\u5B58',
            genericFailureMessage: '\u66F4\u65B0\u5DE5\u4F5C\u533A\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
            avatarUploadFailureMessage: '\u4E0A\u4F20\u5934\u50CF\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u91CD\u8BD5\u3002',
            addressContext:
                '\u8981\u542F\u7528 Expensify Travel\uFF0C\u9700\u8981\u4E00\u4E2A\u5DE5\u4F5C\u533A\u5730\u5740\u3002\u8BF7\u8F93\u5165\u4E0E\u60A8\u7684\u4E1A\u52A1\u76F8\u5173\u7684\u5730\u5740\u3002',
        },
        bankAccount: {
            continueWithSetup: '\u7EE7\u7EED\u8BBE\u7F6E',
            youAreAlmostDone:
                '\u60A8\u51E0\u4E4E\u5B8C\u6210\u4E86\u94F6\u884C\u8D26\u6237\u7684\u8BBE\u7F6E\uFF0C\u8FD9\u5C06\u4F7F\u60A8\u80FD\u591F\u53D1\u884C\u516C\u53F8\u5361\u3001\u62A5\u9500\u8D39\u7528\u3001\u6536\u53D6\u53D1\u7968\u548C\u652F\u4ED8\u8D26\u5355\u3002',
            streamlinePayments: '\u7B80\u5316\u652F\u4ED8\u6D41\u7A0B',
            connectBankAccountNote: '\u6CE8\u610F\uFF1A\u4E2A\u4EBA\u94F6\u884C\u8D26\u6237\u4E0D\u80FD\u7528\u4E8E\u5DE5\u4F5C\u533A\u7684\u4ED8\u6B3E\u3002',
            oneMoreThing: '\u8FD8\u6709\u4E00\u4EF6\u4E8B\uFF01',
            allSet: '\u4E00\u5207\u51C6\u5907\u5C31\u7EEA\uFF01',
            accountDescriptionWithCards:
                '\u6B64\u94F6\u884C\u8D26\u6237\u5C06\u7528\u4E8E\u53D1\u884C\u516C\u53F8\u5361\u3001\u62A5\u9500\u8D39\u7528\u3001\u6536\u53D6\u53D1\u7968\u548C\u652F\u4ED8\u8D26\u5355\u3002',
            letsFinishInChat: '\u8BA9\u6211\u4EEC\u5728\u804A\u5929\u4E2D\u5B8C\u6210\uFF01',
            finishInChat: '\u5728\u804A\u5929\u4E2D\u5B8C\u6210',
            almostDone: '\u5FEB\u5B8C\u6210\u4E86\uFF01',
            disconnectBankAccount: '\u65AD\u5F00\u94F6\u884C\u8D26\u6237\u8FDE\u63A5',
            startOver: '\u91CD\u65B0\u5F00\u59CB',
            updateDetails: '\u66F4\u65B0\u8BE6\u7EC6\u4FE1\u606F',
            yesDisconnectMyBankAccount: '\u662F\u7684\uFF0C\u65AD\u5F00\u6211\u7684\u94F6\u884C\u8D26\u6237\u8FDE\u63A5',
            yesStartOver: '\u662F\u7684\uFF0C\u91CD\u65B0\u5F00\u59CB',
            disconnectYour: '\u65AD\u5F00\u60A8\u7684',
            bankAccountAnyTransactions: '\u94F6\u884C\u8D26\u6237\u3002\u6B64\u8D26\u6237\u7684\u6240\u6709\u672A\u5B8C\u6210\u4EA4\u6613\u4ECD\u5C06\u5B8C\u6210\u3002',
            clearProgress: '\u91CD\u65B0\u5F00\u59CB\u5C06\u6E05\u9664\u60A8\u8FC4\u4ECA\u4E3A\u6B62\u7684\u8FDB\u5EA6\u3002',
            areYouSure: '\u4F60\u786E\u5B9A\u5417\uFF1F',
            workspaceCurrency: '\u5DE5\u4F5C\u533A\u8D27\u5E01',
            updateCurrencyPrompt:
                '\u60A8\u7684\u5DE5\u4F5C\u533A\u5F53\u524D\u8BBE\u7F6E\u4E3A\u4E0D\u540C\u4E8EUSD\u7684\u8D27\u5E01\u3002\u8BF7\u70B9\u51FB\u4E0B\u9762\u7684\u6309\u94AE\u7ACB\u5373\u5C06\u60A8\u7684\u8D27\u5E01\u66F4\u65B0\u4E3AUSD\u3002',
            updateToUSD: '\u66F4\u65B0\u4E3A\u7F8E\u5143',
            updateWorkspaceCurrency: '\u66F4\u65B0\u5DE5\u4F5C\u533A\u8D27\u5E01',
            workspaceCurrencyNotSupported: '\u5DE5\u4F5C\u533A\u8D27\u5E01\u4E0D\u652F\u6301',
            yourWorkspace: '\u60A8\u7684\u5DE5\u4F5C\u533A\u8BBE\u7F6E\u4E3A\u4E0D\u652F\u6301\u7684\u8D27\u5E01\u3002\u67E5\u770B',
            listOfSupportedCurrencies: '\u652F\u6301\u7684\u8D27\u5E01\u5217\u8868',
        },
        changeOwner: {
            changeOwnerPageTitle: '\u8F6C\u79FB\u6240\u6709\u8005',
            addPaymentCardTitle: '\u8F93\u5165\u60A8\u7684\u652F\u4ED8\u5361\u4EE5\u8F6C\u79FB\u6240\u6709\u6743',
            addPaymentCardButtonText: '\u63A5\u53D7\u6761\u6B3E\u5E76\u6DFB\u52A0\u4ED8\u6B3E\u5361',
            addPaymentCardReadAndAcceptTextPart1: '\u9605\u8BFB\u5E76\u63A5\u53D7',
            addPaymentCardReadAndAcceptTextPart2: '\u5C06\u60A8\u7684\u5361\u6DFB\u52A0\u7684\u653F\u7B56',
            addPaymentCardTerms: '\u6761\u6B3E',
            addPaymentCardPrivacy: '\u9690\u79C1',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: '\u7B26\u5408PCI-DSS\u6807\u51C6',
            addPaymentCardBankLevelEncrypt: '\u94F6\u884C\u7EA7\u52A0\u5BC6',
            addPaymentCardRedundant: '\u5197\u4F59\u57FA\u7840\u8BBE\u65BD',
            addPaymentCardLearnMore: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u6211\u4EEC\u7684\u4FE1\u606F',
            addPaymentCardSecurity: '\u5B89\u5168\u6027',
            amountOwedTitle: '\u672A\u7ED3\u4F59\u989D',
            amountOwedButtonText: '\u597D\u7684',
            amountOwedText:
                '\u8BE5\u8D26\u6237\u6709\u4E0A\u4E2A\u6708\u672A\u7ED3\u6E05\u7684\u4F59\u989D\u3002\n\n\u60A8\u662F\u5426\u8981\u6E05\u9664\u4F59\u989D\u5E76\u63A5\u7BA1\u6B64\u5DE5\u4F5C\u533A\u7684\u8D26\u5355\uFF1F',
            ownerOwesAmountTitle: '\u672A\u7ED3\u4F59\u989D',
            ownerOwesAmountButtonText: '\u8F6C\u8D26\u4F59\u989D',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `\u62E5\u6709\u6B64\u5DE5\u4F5C\u533A\u7684\u8D26\u6237\uFF08${email}\uFF09\u6709\u4E0A\u4E2A\u6708\u672A\u7ED3\u6E05\u7684\u4F59\u989D\u3002\n\n\u60A8\u662F\u5426\u5E0C\u671B\u8F6C\u79FB\u6B64\u91D1\u989D\uFF08${amount}\uFF09\u4EE5\u63A5\u7BA1\u6B64\u5DE5\u4F5C\u533A\u7684\u8D26\u5355\uFF1F\u60A8\u7684\u652F\u4ED8\u5361\u5C06\u7ACB\u5373\u88AB\u6263\u6B3E\u3002`,
            subscriptionTitle: '\u63A5\u7BA1\u5E74\u5EA6\u8BA2\u9605',
            subscriptionButtonText: '\u8F6C\u79FB\u8BA2\u9605',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `\u63A5\u7BA1\u6B64\u5DE5\u4F5C\u533A\u5C06\u628A\u5176\u5E74\u5EA6\u8BA2\u9605\u4E0E\u60A8\u5F53\u524D\u7684\u8BA2\u9605\u5408\u5E76\u3002\u8FD9\u5C06\u4F7F\u60A8\u7684\u8BA2\u9605\u4EBA\u6570\u589E\u52A0${usersCount}\u540D\u6210\u5458\uFF0C\u4F7F\u60A8\u7684\u65B0\u8BA2\u9605\u4EBA\u6570\u8FBE\u5230${finalCount}\u3002\u60A8\u60F3\u7EE7\u7EED\u5417\uFF1F`,
            duplicateSubscriptionTitle: '\u91CD\u590D\u8BA2\u9605\u63D0\u9192',
            duplicateSubscriptionButtonText: '\u7EE7\u7EED',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `\u60A8\u4F3C\u4E4E\u6B63\u5728\u5C1D\u8BD5\u63A5\u7BA1 ${email} \u7684\u5DE5\u4F5C\u533A\u7684\u8D26\u5355\uFF0C\u4F46\u8981\u505A\u5230\u8FD9\u4E00\u70B9\uFF0C\u60A8\u9700\u8981\u5148\u6210\u4E3A\u4ED6\u4EEC\u6240\u6709\u5DE5\u4F5C\u533A\u7684\u7BA1\u7406\u5458\u3002\n\n\u5982\u679C\u60A8\u53EA\u60F3\u63A5\u7BA1\u5DE5\u4F5C\u533A ${workspaceName} \u7684\u8D26\u5355\uFF0C\u8BF7\u70B9\u51FB\u201C\u7EE7\u7EED\u201D\u3002\n\n\u5982\u679C\u60A8\u60F3\u63A5\u7BA1\u4ED6\u4EEC\u6574\u4E2A\u8BA2\u9605\u7684\u8D26\u5355\uFF0C\u8BF7\u5148\u8BA9\u4ED6\u4EEC\u5C06\u60A8\u6DFB\u52A0\u4E3A\u6240\u6709\u5DE5\u4F5C\u533A\u7684\u7BA1\u7406\u5458\uFF0C\u7136\u540E\u518D\u63A5\u7BA1\u8D26\u5355\u3002`,
            hasFailedSettlementsTitle: '\u65E0\u6CD5\u8F6C\u79FB\u6240\u6709\u6743',
            hasFailedSettlementsButtonText: '\u660E\u767D\u4E86',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `\u60A8\u65E0\u6CD5\u63A5\u7BA1\u8D26\u5355\uFF0C\u56E0\u4E3A${email}\u6709\u4E00\u7B14\u903E\u671F\u7684Expensify Card\u7ED3\u7B97\u3002\u8BF7\u8BA9\u4ED6\u4EEC\u8054\u7CFBconcierge@expensify.com\u89E3\u51B3\u6B64\u95EE\u9898\u3002\u7136\u540E\uFF0C\u60A8\u53EF\u4EE5\u63A5\u7BA1\u6B64\u5DE5\u4F5C\u533A\u7684\u8D26\u5355\u3002`,
            failedToClearBalanceTitle: '\u6E05\u9664\u4F59\u989D\u5931\u8D25',
            failedToClearBalanceButtonText: '\u597D\u7684',
            failedToClearBalanceText: '\u6211\u4EEC\u65E0\u6CD5\u6E05\u9664\u4F59\u989D\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
            successTitle: '\u54C7\u54E6\uFF01\u4E00\u5207\u5C31\u7EEA\u3002',
            successDescription: '\u60A8\u73B0\u5728\u662F\u6B64\u5DE5\u4F5C\u533A\u7684\u6240\u6709\u8005\u3002',
            errorTitle: '\u54CE\u5440\uFF01\u522B\u90A3\u4E48\u5FEB\u2026\u2026',
            errorDescriptionPartOne: '\u5C06\u6B64\u5DE5\u4F5C\u533A\u7684\u6240\u6709\u6743\u8F6C\u79FB\u65F6\u51FA\u73B0\u95EE\u9898\u3002\u8BF7\u91CD\u8BD5\uFF0C\u6216',
            errorDescriptionPartTwo: '\u8054\u7CFBConcierge',
            errorDescriptionPartThree: '\u5BFB\u6C42\u5E2E\u52A9\u3002',
        },
        exportAgainModal: {
            title: '\u5C0F\u5FC3\uFF01',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `\u4EE5\u4E0B\u62A5\u544A\u5DF2\u5BFC\u51FA\u5230${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}\uFF1A\n\n${reportName}\n\n\u60A8\u786E\u5B9A\u8981\u518D\u6B21\u5BFC\u51FA\u5B83\u4EEC\u5417\uFF1F`,
            confirmText: '\u662F\u7684\uFF0C\u518D\u6B21\u5BFC\u51FA',
            cancelText: '\u53D6\u6D88',
        },
        upgrade: {
            reportFields: {
                title: '\u62A5\u544A\u5B57\u6BB5',
                description: `\u62A5\u544A\u5B57\u6BB5\u5141\u8BB8\u60A8\u6307\u5B9A\u6807\u9898\u7EA7\u522B\u7684\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u4E0E\u9002\u7528\u4E8E\u5355\u4E2A\u9879\u76EE\u8D39\u7528\u7684\u6807\u7B7E\u4E0D\u540C\u3002\u8FD9\u4E9B\u8BE6\u7EC6\u4FE1\u606F\u53EF\u4EE5\u5305\u62EC\u7279\u5B9A\u7684\u9879\u76EE\u540D\u79F0\u3001\u5546\u52A1\u65C5\u884C\u4FE1\u606F\u3001\u5730\u70B9\u7B49\u3002`,
                onlyAvailableOnPlan: '\u62A5\u8868\u5B57\u6BB5\u4EC5\u5728Control\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `\u901A\u8FC7 Expensify + NetSuite \u96C6\u6210\uFF0C\u4EAB\u53D7\u81EA\u52A8\u540C\u6B65\u5E76\u51CF\u5C11\u624B\u52A8\u8F93\u5165\u3002\u901A\u8FC7\u672C\u5730\u548C\u81EA\u5B9A\u4E49\u5206\u6BB5\u652F\u6301\uFF08\u5305\u62EC\u9879\u76EE\u548C\u5BA2\u6237\u6620\u5C04\uFF09\uFF0C\u83B7\u5F97\u6DF1\u5165\u7684\u5B9E\u65F6\u8D22\u52A1\u6D1E\u5BDF\u3002`,
                onlyAvailableOnPlan: '\u6211\u4EEC\u7684 NetSuite \u96C6\u6210\u4EC5\u5728 Control \u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `\u901A\u8FC7 Expensify + Sage Intacct \u96C6\u6210\uFF0C\u4EAB\u53D7\u81EA\u52A8\u540C\u6B65\u5E76\u51CF\u5C11\u624B\u52A8\u8F93\u5165\u3002\u901A\u8FC7\u7528\u6237\u5B9A\u4E49\u7684\u7EF4\u5EA6\u4EE5\u53CA\u6309\u90E8\u95E8\u3001\u7C7B\u522B\u3001\u5730\u70B9\u3001\u5BA2\u6237\u548C\u9879\u76EE\uFF08\u5DE5\u4F5C\uFF09\u8FDB\u884C\u7684\u8D39\u7528\u7F16\u7801\uFF0C\u83B7\u53D6\u6DF1\u5165\u7684\u5B9E\u65F6\u8D22\u52A1\u6D1E\u5BDF\u3002`,
                onlyAvailableOnPlan: '\u6211\u4EEC\u7684 Sage Intacct \u96C6\u6210\u4EC5\u5728 Control \u8BA1\u5212\u4E2D\u63D0\u4F9B\uFF0C\u8D77\u4EF7\u4E3A',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `\u901A\u8FC7Expensify\u4E0EQuickBooks Desktop\u7684\u96C6\u6210\uFF0C\u4EAB\u53D7\u81EA\u52A8\u540C\u6B65\u5E76\u51CF\u5C11\u624B\u52A8\u8F93\u5165\u3002\u901A\u8FC7\u5B9E\u65F6\u7684\u53CC\u5411\u8FDE\u63A5\u4EE5\u53CA\u6309\u7C7B\u522B\u3001\u9879\u76EE\u3001\u5BA2\u6237\u548C\u9879\u76EE\u7684\u8D39\u7528\u7F16\u7801\uFF0C\u5B9E\u73B0\u7EC8\u6781\u6548\u7387\u3002`,
                onlyAvailableOnPlan: '\u6211\u4EEC\u7684 QuickBooks Desktop \u96C6\u6210\u4EC5\u5728 Control \u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '\u9AD8\u7EA7\u5BA1\u6279',
                description: `\u5982\u679C\u60A8\u60F3\u5728\u5BA1\u6279\u6D41\u7A0B\u4E2D\u6DFB\u52A0\u66F4\u591A\u5C42\u7EA7\uFF0C\u6216\u8005\u53EA\u662F\u60F3\u786E\u4FDD\u6700\u5927\u989D\u7684\u5F00\u652F\u80FD\u518D\u88AB\u5BA1\u6838\u4E00\u904D\uFF0C\u6211\u4EEC\u53EF\u4EE5\u6EE1\u8DB3\u60A8\u7684\u9700\u6C42\u3002\u9AD8\u7EA7\u5BA1\u6279\u5E2E\u52A9\u60A8\u5728\u6BCF\u4E2A\u5C42\u7EA7\u8BBE\u7F6E\u9002\u5F53\u7684\u68C0\u67E5\uFF0C\u4EE5\u4FBF\u63A7\u5236\u56E2\u961F\u7684\u652F\u51FA\u3002`,
                onlyAvailableOnPlan: '\u9AD8\u7EA7\u5BA1\u6279\u4EC5\u5728Control\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8BE5\u8BA1\u5212\u8D77\u4EF7\u4E3A',
            },
            categories: {
                title: '\u7C7B\u522B',
                description: `\u7C7B\u522B\u53EF\u4EE5\u5E2E\u52A9\u60A8\u66F4\u597D\u5730\u7EC4\u7EC7\u8D39\u7528\uFF0C\u4EE5\u8DDF\u8E2A\u60A8\u7684\u8D44\u91D1\u53BB\u5411\u3002\u4F7F\u7528\u6211\u4EEC\u5EFA\u8BAE\u7684\u7C7B\u522B\u5217\u8868\u6216\u521B\u5EFA\u60A8\u81EA\u5DF1\u7684\u7C7B\u522B\u3002`,
                onlyAvailableOnPlan: '\u7C7B\u522B\u53EF\u5728 Collect \u8BA1\u5212\u4E2D\u4F7F\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            glCodes: {
                title: 'GL\u4EE3\u7801',
                description: `\u4E3A\u60A8\u7684\u7C7B\u522B\u548C\u6807\u7B7E\u6DFB\u52A0\u603B\u8D26\u4EE3\u7801\uFF0C\u4EE5\u4FBF\u8F7B\u677E\u5C06\u8D39\u7528\u5BFC\u51FA\u5230\u60A8\u7684\u4F1A\u8BA1\u548C\u5DE5\u8D44\u7CFB\u7EDF\u3002`,
                onlyAvailableOnPlan: 'GL \u4EE3\u7801\u4EC5\u5728 Control \u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            glAndPayrollCodes: {
                title: 'GL & Payroll \u4EE3\u7801',
                description: `\u5C06\u603B\u8D26\u548C\u5DE5\u8D44\u4EE3\u7801\u6DFB\u52A0\u5230\u60A8\u7684\u7C7B\u522B\u4E2D\uFF0C\u4EE5\u4FBF\u8F7B\u677E\u5C06\u8D39\u7528\u5BFC\u51FA\u5230\u60A8\u7684\u4F1A\u8BA1\u548C\u5DE5\u8D44\u7CFB\u7EDF\u3002`,
                onlyAvailableOnPlan: 'GL \u548C Payroll \u4EE3\u7801\u4EC5\u5728 Control \u8BA1\u5212\u4E2D\u63D0\u4F9B\uFF0C\u8D77\u4EF7\u4E3A',
            },
            taxCodes: {
                title: '\u7A0E\u7801',
                description: `\u5C06\u7A0E\u7801\u6DFB\u52A0\u5230\u60A8\u7684\u7A0E\u6536\u4E2D\uFF0C\u4EE5\u4FBF\u8F7B\u677E\u5C06\u8D39\u7528\u5BFC\u51FA\u5230\u60A8\u7684\u4F1A\u8BA1\u548C\u5DE5\u8D44\u7CFB\u7EDF\u4E2D\u3002`,
                onlyAvailableOnPlan: '\u7A0E\u7801\u4EC5\u5728\u8D77\u4EF7\u4E3A\u7684Control\u8BA1\u5212\u4E2D\u63D0\u4F9B\uFF0C',
            },
            companyCards: {
                title: '\u65E0\u9650\u516C\u53F8\u5361',
                description: `\u9700\u8981\u6DFB\u52A0\u66F4\u591A\u5361\u7247\u4FE1\u606F\u6D41\uFF1F\u89E3\u9501\u65E0\u9650\u516C\u53F8\u5361\u4EE5\u540C\u6B65\u6240\u6709\u4E3B\u8981\u53D1\u5361\u673A\u6784\u7684\u4EA4\u6613\u3002`,
                onlyAvailableOnPlan: '\u8FD9\u4EC5\u5728 Control \u8BA1\u5212\u4E2D\u63D0\u4F9B\uFF0C\u8D77\u4EF7\u4E3A',
            },
            rules: {
                title: '\u89C4\u5219',
                description: `\u89C4\u5219\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\u5E2E\u52A9\u60A8\u63A7\u5236\u652F\u51FA\uFF0C\u56E0\u6B64\u60A8\u65E0\u9700\u4E3A\u5C0F\u4E8B\u64CD\u5FC3\u3002\n\n\u8981\u6C42\u63D0\u4F9B\u6536\u636E\u548C\u63CF\u8FF0\u7B49\u8D39\u7528\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u8BBE\u7F6E\u9650\u5236\u548C\u9ED8\u8BA4\u503C\uFF0C\u5E76\u81EA\u52A8\u5316\u5BA1\u6279\u548C\u652F\u4ED8\u2014\u2014\u6240\u6709\u8FD9\u4E9B\u90FD\u5728\u4E00\u4E2A\u5730\u65B9\u5B8C\u6210\u3002`,
                onlyAvailableOnPlan: '\u89C4\u5219\u4EC5\u5728 Control \u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            perDiem: {
                title: '\u6BCF\u65E5\u6D25\u8D34',
                description:
                    '\u6BCF\u65E5\u6D25\u8D34\u662F\u4E00\u79CD\u5F88\u597D\u7684\u65B9\u5F0F\uFF0C\u53EF\u4EE5\u5728\u5458\u5DE5\u51FA\u5DEE\u65F6\u4FDD\u6301\u6BCF\u65E5\u8D39\u7528\u7684\u5408\u89C4\u6027\u548C\u53EF\u9884\u6D4B\u6027\u3002\u4EAB\u53D7\u81EA\u5B9A\u4E49\u8D39\u7387\u3001\u9ED8\u8BA4\u7C7B\u522B\u4EE5\u53CA\u66F4\u8BE6\u7EC6\u7684\u4FE1\u606F\uFF0C\u5982\u76EE\u7684\u5730\u548C\u5B50\u8D39\u7387\u7B49\u529F\u80FD\u3002',
                onlyAvailableOnPlan: '\u6BCF\u65E5\u6D25\u8D34\u4EC5\u5728Control\u8BA1\u5212\u4E2D\u63D0\u4F9B\uFF0C\u8D77\u4EF7\u4E3A',
            },
            travel: {
                title: '\u65C5\u884C',
                description:
                    'Expensify Travel \u662F\u4E00\u4E2A\u65B0\u7684\u4F01\u4E1A\u5DEE\u65C5\u9884\u8BA2\u548C\u7BA1\u7406\u5E73\u53F0\uFF0C\u5141\u8BB8\u4F1A\u5458\u9884\u8BA2\u4F4F\u5BBF\u3001\u822A\u73ED\u3001\u4EA4\u901A\u7B49\u3002',
                onlyAvailableOnPlan: '\u5728 Collect \u8BA1\u5212\u4E2D\u63D0\u4F9B\u65C5\u884C\u670D\u52A1\uFF0C\u8D77\u4EF7\u4E3A',
            },
            multiLevelTags: {
                title: '\u591A\u7EA7\u6807\u7B7E',
                description:
                    '\u591A\u7EA7\u6807\u7B7E\u5E2E\u52A9\u60A8\u66F4\u7CBE\u786E\u5730\u8DDF\u8E2A\u8D39\u7528\u3002\u4E3A\u6BCF\u4E2A\u9879\u76EE\u5206\u914D\u591A\u4E2A\u6807\u7B7E\uFF0C\u4F8B\u5982\u90E8\u95E8\u3001\u5BA2\u6237\u6216\u6210\u672C\u4E2D\u5FC3\uFF0C\u4EE5\u6355\u83B7\u6BCF\u7B14\u8D39\u7528\u7684\u5B8C\u6574\u80CC\u666F\u3002\u8FD9\u4F7F\u5F97\u62A5\u544A\u66F4\u8BE6\u7EC6\u3001\u5BA1\u6279\u6D41\u7A0B\u66F4\u987A\u7545\uFF0C\u5E76\u4E14\u4F1A\u8BA1\u5BFC\u51FA\u66F4\u5168\u9762\u3002',
                onlyAvailableOnPlan: '\u591A\u7EA7\u6807\u7B7E\u4EC5\u5728Control\u8BA1\u5212\u4E2D\u53EF\u7528\uFF0C\u8D77\u4EF7\u4E3A',
            },
            pricing: {
                perActiveMember: '\u6BCF\u4F4D\u6D3B\u8DC3\u6210\u5458\u6BCF\u6708\u3002',
                perMember: '\u6BCF\u4F4D\u6210\u5458\u6BCF\u6708\u3002',
            },
            note: {
                upgradeWorkspace: '\u5347\u7EA7\u60A8\u7684\u5DE5\u4F5C\u533A\u4EE5\u8BBF\u95EE\u6B64\u529F\u80FD\uFF0C\u6216',
                learnMore: '\u4E86\u89E3\u66F4\u591A',
                aboutOurPlans: '\u5173\u4E8E\u6211\u4EEC\u7684\u8BA1\u5212\u548C\u5B9A\u4EF7\u3002',
            },
            upgradeToUnlock: '\u89E3\u9501\u6B64\u529F\u80FD',
            completed: {
                headline: `\u60A8\u7684\u5DE5\u4F5C\u533A\u5DF2\u5347\u7EA7\uFF01`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `\u60A8\u5DF2\u6210\u529F\u5C06 ${policyName} \u5347\u7EA7\u5230 Control \u8BA1\u5212\uFF01`,
                categorizeMessage: `\u60A8\u5DF2\u6210\u529F\u5347\u7EA7\u5230 Collect \u8BA1\u5212\u7684\u5DE5\u4F5C\u533A\u3002\u73B0\u5728\u60A8\u53EF\u4EE5\u5BF9\u8D39\u7528\u8FDB\u884C\u5206\u7C7B\u4E86\uFF01`,
                travelMessage: `\u60A8\u5DF2\u6210\u529F\u5347\u7EA7\u5230 Collect \u8BA1\u5212\u7684\u5DE5\u4F5C\u533A\u3002\u73B0\u5728\u60A8\u53EF\u4EE5\u5F00\u59CB\u9884\u8BA2\u548C\u7BA1\u7406\u65C5\u884C\u4E86\uFF01`,
                viewSubscription: '\u67E5\u770B\u60A8\u7684\u8BA2\u9605',
                moreDetails: '\u66F4\u591A\u8BE6\u60C5\u3002',
                gotIt: '\u77E5\u9053\u4E86\uFF0C\u8C22\u8C22',
            },
            commonFeatures: {
                title: '\u5347\u7EA7\u5230 Control \u8BA1\u5212',
                note: '\u89E3\u9501\u6211\u4EEC\u6700\u5F3A\u5927\u7684\u529F\u80FD\uFF0C\u5305\u62EC\uFF1A',
                benefits: {
                    startsAt: 'Control \u8BA1\u5212\u8D77\u4EF7\u4E3A',
                    perMember: '\u6BCF\u4F4D\u6D3B\u8DC3\u6210\u5458\u6BCF\u6708\u3002',
                    learnMore: '\u4E86\u89E3\u66F4\u591A',
                    pricing: '\u5173\u4E8E\u6211\u4EEC\u7684\u8BA1\u5212\u548C\u5B9A\u4EF7\u3002',
                    benefit1: '\u9AD8\u7EA7\u4F1A\u8BA1\u8FDE\u63A5\uFF08NetSuite\u3001Sage Intacct\u7B49\uFF09',
                    benefit2: '\u667A\u80FD\u8D39\u7528\u89C4\u5219',
                    benefit3: '\u591A\u7EA7\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B',
                    benefit4: '\u589E\u5F3A\u7684\u5B89\u5168\u63A7\u5236',
                    toUpgrade: '\u8981\u5347\u7EA7\uFF0C\u8BF7\u70B9\u51FB',
                    selectWorkspace: '\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A\uFF0C\u5E76\u66F4\u6539\u8BA1\u5212\u7C7B\u578B\u4E3A',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: '\u964D\u7EA7\u5230Collect\u8BA1\u5212',
                note: '\u5982\u679C\u60A8\u964D\u7EA7\uFF0C\u60A8\u5C06\u5931\u53BB\u5BF9\u8FD9\u4E9B\u529F\u80FD\u53CA\u66F4\u591A\u529F\u80FD\u7684\u8BBF\u95EE\u6743\u9650\uFF1A',
                benefits: {
                    note: '\u8981\u67E5\u770B\u6211\u4EEC\u8BA1\u5212\u7684\u5B8C\u6574\u5BF9\u6BD4\uFF0C\u8BF7\u67E5\u770B\u6211\u4EEC\u7684',
                    pricingPage: '\u5B9A\u4EF7\u9875\u9762',
                    confirm: '\u60A8\u786E\u5B9A\u8981\u964D\u7EA7\u5E76\u79FB\u9664\u60A8\u7684\u914D\u7F6E\u5417\uFF1F',
                    warning: '\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002',
                    benefit1: '\u4F1A\u8BA1\u8FDE\u63A5\uFF08QuickBooks Online \u548C Xero \u9664\u5916\uFF09',
                    benefit2: '\u667A\u80FD\u8D39\u7528\u89C4\u5219',
                    benefit3: '\u591A\u7EA7\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B',
                    benefit4: '\u589E\u5F3A\u7684\u5B89\u5168\u63A7\u5236',
                    headsUp: '\u6CE8\u610F\uFF01',
                    multiWorkspaceNote:
                        '\u5728\u60A8\u7684\u7B2C\u4E00\u6B21\u6708\u5EA6\u4ED8\u6B3E\u4E4B\u524D\uFF0C\u60A8\u9700\u8981\u5C06\u6240\u6709\u5DE5\u4F5C\u533A\u964D\u7EA7\uFF0C\u4EE5\u4FBF\u4EE5 Collect \u8D39\u7387\u5F00\u59CB\u8BA2\u9605\u3002\u70B9\u51FB',
                    selectStep: '> \u9009\u62E9\u6BCF\u4E2A\u5DE5\u4F5C\u533A > \u5C06\u8BA1\u5212\u7C7B\u578B\u66F4\u6539\u4E3A',
                },
            },
            completed: {
                headline: '\u60A8\u7684\u5DE5\u4F5C\u533A\u5DF2\u88AB\u964D\u7EA7',
                description:
                    '\u60A8\u5728\u63A7\u5236\u8BA1\u5212\u4E2D\u6709\u5176\u4ED6\u5DE5\u4F5C\u533A\u3002\u8981\u6309\u6536\u96C6\u8D39\u7387\u8BA1\u8D39\uFF0C\u60A8\u5FC5\u987B\u5C06\u6240\u6709\u5DE5\u4F5C\u533A\u964D\u7EA7\u3002',
                gotIt: '\u77E5\u9053\u4E86\uFF0C\u8C22\u8C22',
            },
        },
        payAndDowngrade: {
            title: '\u652F\u4ED8\u548C\u964D\u7EA7',
            headline: '\u60A8\u7684\u6700\u7EC8\u4ED8\u6B3E',
            description1: '\u6B64\u8BA2\u9605\u7684\u6700\u7EC8\u8D26\u5355\u5C06\u662F',
            description2: ({date}: DateParams) => `\u8BF7\u67E5\u770B\u60A8\u5728${date}\u7684\u660E\u7EC6\uFF1A`,
            subscription:
                '\u6CE8\u610F\uFF01\u6B64\u64CD\u4F5C\u5C06\u7ED3\u675F\u60A8\u7684Expensify\u8BA2\u9605\uFF0C\u5220\u9664\u6B64\u5DE5\u4F5C\u533A\uFF0C\u5E76\u79FB\u9664\u6240\u6709\u5DE5\u4F5C\u533A\u6210\u5458\u3002\u5982\u679C\u60A8\u60F3\u4FDD\u7559\u6B64\u5DE5\u4F5C\u533A\u5E76\u4EC5\u79FB\u9664\u81EA\u5DF1\uFF0C\u8BF7\u5148\u8BA9\u53E6\u4E00\u4F4D\u7BA1\u7406\u5458\u63A5\u7BA1\u8D26\u5355\u3002',
            genericFailureMessage: '\u652F\u4ED8\u8D26\u5355\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `${workspaceName} \u5DE5\u4F5C\u533A\u7684\u64CD\u4F5C\u76EE\u524D\u53D7\u5230\u9650\u5236`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `\u5DE5\u4F5C\u533A\u6240\u6709\u8005\uFF0C${workspaceOwnerName} \u9700\u8981\u6DFB\u52A0\u6216\u66F4\u65B0\u6863\u6848\u4E2D\u7684\u4ED8\u6B3E\u5361\u4EE5\u89E3\u9501\u65B0\u7684\u5DE5\u4F5C\u533A\u6D3B\u52A8\u3002`,
            youWillNeedToAddOrUpdatePaymentCard:
                '\u60A8\u9700\u8981\u6DFB\u52A0\u6216\u66F4\u65B0\u6863\u6848\u4E2D\u7684\u652F\u4ED8\u5361\u4EE5\u89E3\u9501\u65B0\u7684\u5DE5\u4F5C\u533A\u6D3B\u52A8\u3002',
            addPaymentCardToUnlock: '\u6DFB\u52A0\u652F\u4ED8\u5361\u4EE5\u89E3\u9501\uFF01',
            addPaymentCardToContinueUsingWorkspace: '\u6DFB\u52A0\u4ED8\u6B3E\u5361\u4EE5\u7EE7\u7EED\u4F7F\u7528\u6B64\u5DE5\u4F5C\u533A',
            pleaseReachOutToYourWorkspaceAdmin: '\u5982\u6709\u4EFB\u4F55\u95EE\u9898\uFF0C\u8BF7\u8054\u7CFB\u60A8\u7684\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\u3002',
            chatWithYourAdmin: '\u4E0E\u60A8\u7684\u7BA1\u7406\u5458\u804A\u5929',
            chatInAdmins: '\u5728#admins\u4E2D\u804A\u5929',
            addPaymentCard: '\u6DFB\u52A0\u652F\u4ED8\u5361',
        },
        rules: {
            individualExpenseRules: {
                title: '\u8D39\u7528',
                subtitle: '\u4E3A\u5355\u4E2A\u8D39\u7528\u8BBE\u7F6E\u652F\u51FA\u63A7\u5236\u548C\u9ED8\u8BA4\u503C\u3002\u60A8\u8FD8\u53EF\u4EE5\u521B\u5EFA\u89C4\u5219\u4EE5',
                receiptRequiredAmount: '\u6240\u9700\u6536\u636E\u91D1\u989D',
                receiptRequiredAmountDescription:
                    '\u5F53\u652F\u51FA\u8D85\u8FC7\u6B64\u91D1\u989D\u65F6\u9700\u8981\u6536\u636E\uFF0C\u9664\u975E\u88AB\u7C7B\u522B\u89C4\u5219\u8986\u76D6\u3002',
                maxExpenseAmount: '\u6700\u5927\u62A5\u9500\u91D1\u989D',
                maxExpenseAmountDescription: '\u6807\u8BB0\u8D85\u8FC7\u6B64\u91D1\u989D\u7684\u652F\u51FA\uFF0C\u9664\u975E\u88AB\u7C7B\u522B\u89C4\u5219\u8986\u76D6\u3002',
                maxAge: '\u6700\u5927\u5E74\u9F84',
                maxExpenseAge: '\u6700\u5927\u8D39\u7528\u5E74\u9F84',
                maxExpenseAgeDescription: '\u6807\u8BB0\u8D85\u8FC7\u7279\u5B9A\u5929\u6570\u7684\u652F\u51FA\u3002',
                maxExpenseAgeDays: () => ({
                    one: '1\u5929',
                    other: (count: number) => `${count} \u5929`,
                }),
                billableDefault: '\u53EF\u8BA1\u8D39\u9ED8\u8BA4\u503C',
                billableDefaultDescription:
                    '\u9009\u62E9\u73B0\u91D1\u548C\u4FE1\u7528\u5361\u8D39\u7528\u662F\u5426\u9ED8\u8BA4\u53EF\u62A5\u9500\u3002\u53EF\u62A5\u9500\u8D39\u7528\u5728\u4E2D\u542F\u7528\u6216\u7981\u7528',
                billable: '\u53EF\u8BA1\u8D39\u7684',
                billableDescription: '\u8D39\u7528\u901A\u5E38\u4F1A\u91CD\u65B0\u8BA1\u8D39\u7ED9\u5BA2\u6237\u3002',
                nonBillable: '\u4E0D\u53EF\u8BA1\u8D39',
                nonBillableDescription: '\u8D39\u7528\u6709\u65F6\u4F1A\u91CD\u65B0\u8BA1\u8D39\u7ED9\u5BA2\u6237\u3002',
                eReceipts: '\u7535\u5B50\u6536\u636E',
                eReceiptsHint: '\u7535\u5B50\u6536\u636E\u662F\u81EA\u52A8\u521B\u5EFA\u7684',
                eReceiptsHintLink: '\u5BF9\u4E8E\u5927\u591A\u6570\u7F8E\u5143\u4FE1\u7528\u4EA4\u6613',
                attendeeTracking: '\u4E0E\u4F1A\u8005\u8DDF\u8E2A',
                attendeeTrackingHint: '\u8DDF\u8E2A\u6BCF\u7B14\u8D39\u7528\u7684\u6BCF\u4EBA\u6210\u672C\u3002',
                prohibitedDefaultDescription:
                    '\u6807\u8BB0\u4EFB\u4F55\u5305\u542B\u9152\u7CBE\u3001\u8D4C\u535A\u6216\u5176\u4ED6\u53D7\u9650\u7269\u54C1\u7684\u6536\u636E\u3002\u5305\u542B\u8FD9\u4E9B\u9879\u76EE\u7684\u6536\u636E\u8D39\u7528\u5C06\u9700\u8981\u4EBA\u5DE5\u5BA1\u6838\u3002',
                prohibitedExpenses: '\u7981\u6B62\u7684\u8D39\u7528',
                alcohol: '\u9152\u7CBE',
                hotelIncidentals: '\u9152\u5E97\u6742\u8D39',
                gambling: '\u8D4C\u535A',
                tobacco: '\u70DF\u8349',
                adultEntertainment: '\u6210\u4EBA\u5A31\u4E50',
            },
            expenseReportRules: {
                examples: '\u793A\u4F8B\uFF1A',
                title: '\u8D39\u7528\u62A5\u544A',
                subtitle: '\u81EA\u52A8\u5316\u8D39\u7528\u62A5\u544A\u5408\u89C4\u3001\u5BA1\u6279\u548C\u652F\u4ED8\u3002',
                customReportNamesSubtitle: '\u4F7F\u7528\u6211\u4EEC\u7684\u81EA\u5B9A\u4E49\u62A5\u544A\u6807\u9898\u529F\u80FD',
                customNameTitle: '\u9ED8\u8BA4\u62A5\u544A\u6807\u9898',
                customNameDescription: '\u4F7F\u7528\u6211\u4EEC\u7684\u529F\u80FD\u4E3A\u8D39\u7528\u62A5\u544A\u9009\u62E9\u4E00\u4E2A\u81EA\u5B9A\u4E49\u540D\u79F0',
                customNameDescriptionLink: '\u5E7F\u6CDB\u7684\u516C\u5F0F',
                customNameInputLabel: '\u540D\u79F0',
                customNameEmailPhoneExample: '\u6210\u5458\u7684\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\uFF1A{report:submit:from}',
                customNameStartDateExample: '\u62A5\u544A\u5F00\u59CB\u65E5\u671F\uFF1A{report:startdate}',
                customNameWorkspaceNameExample: '\u5DE5\u4F5C\u533A\u540D\u79F0\uFF1A{report:workspacename}',
                customNameReportIDExample: '\u62A5\u544A ID: {report:id}',
                customNameTotalExample: '\u603B\u8BA1\uFF1A{report:total}\u3002',
                preventMembersFromChangingCustomNamesTitle: '\u963B\u6B62\u6210\u5458\u66F4\u6539\u81EA\u5B9A\u4E49\u62A5\u544A\u540D\u79F0',
                preventSelfApprovalsTitle: '\u9632\u6B62\u81EA\u6211\u6279\u51C6',
                preventSelfApprovalsSubtitle: '\u9632\u6B62\u5DE5\u4F5C\u533A\u6210\u5458\u6279\u51C6\u81EA\u5DF1\u7684\u8D39\u7528\u62A5\u544A\u3002',
                autoApproveCompliantReportsTitle: '\u81EA\u52A8\u6279\u51C6\u5408\u89C4\u62A5\u544A',
                autoApproveCompliantReportsSubtitle: '\u914D\u7F6E\u54EA\u4E9B\u8D39\u7528\u62A5\u544A\u7B26\u5408\u81EA\u52A8\u6279\u51C6\u7684\u6761\u4EF6\u3002',
                autoApproveReportsUnderTitle: '\u81EA\u52A8\u6279\u51C6\u62A5\u544A\u4F4E\u4E8E',
                autoApproveReportsUnderDescription: '\u4F4E\u4E8E\u6B64\u91D1\u989D\u7684\u5B8C\u5168\u5408\u89C4\u8D39\u7528\u62A5\u544A\u5C06\u81EA\u52A8\u6279\u51C6\u3002',
                randomReportAuditTitle: '\u968F\u673A\u62A5\u544A\u5BA1\u6838',
                randomReportAuditDescription:
                    '\u8981\u6C42\u67D0\u4E9B\u62A5\u544A\u5FC5\u987B\u624B\u52A8\u6279\u51C6\uFF0C\u5373\u4F7F\u7B26\u5408\u81EA\u52A8\u6279\u51C6\u7684\u6761\u4EF6\u3002',
                autoPayApprovedReportsTitle: '\u81EA\u52A8\u652F\u4ED8\u5DF2\u6279\u51C6\u7684\u62A5\u544A',
                autoPayApprovedReportsSubtitle: '\u914D\u7F6E\u54EA\u4E9B\u8D39\u7528\u62A5\u544A\u7B26\u5408\u81EA\u52A8\u652F\u4ED8\u7684\u6761\u4EF6\u3002',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) =>
                    `\u8BF7\u8F93\u5165\u4E00\u4E2A\u5C0F\u4E8E${currency ?? ''}20,000\u7684\u91D1\u989D\u3002`,
                autoPayApprovedReportsLockedSubtitle:
                    '\u8F6C\u5230\u66F4\u591A\u529F\u80FD\u5E76\u542F\u7528\u5DE5\u4F5C\u6D41\uFF0C\u7136\u540E\u6DFB\u52A0\u4ED8\u6B3E\u4EE5\u89E3\u9501\u6B64\u529F\u80FD\u3002',
                autoPayReportsUnderTitle: '\u81EA\u52A8\u652F\u4ED8\u62A5\u544A\u4F4E\u4E8E',
                autoPayReportsUnderDescription: '\u5728\u6B64\u91D1\u989D\u4EE5\u4E0B\u7684\u5B8C\u5168\u5408\u89C4\u8D39\u7528\u62A5\u544A\u5C06\u81EA\u52A8\u652F\u4ED8\u3002',
                unlockFeatureGoToSubtitle: '\u53BB',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `\u5E76\u542F\u7528\u5DE5\u4F5C\u6D41\u7A0B\uFF0C\u7136\u540E\u6DFB\u52A0${featureName}\u4EE5\u89E3\u9501\u6B64\u529F\u80FD\u3002`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `\u5E76\u542F\u7528${featureName}\u4EE5\u89E3\u9501\u6B64\u529F\u80FD\u3002`,
            },
            categoryRules: {
                title: '\u7C7B\u522B\u89C4\u5219',
                approver: '\u5BA1\u6279\u4EBA',
                requireDescription: '\u9700\u8981\u63CF\u8FF0',
                descriptionHint: '\u63CF\u8FF0\u63D0\u793A',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `\u63D0\u9192\u5458\u5DE5\u4E3A\u201C${categoryName}\u201D\u652F\u51FA\u63D0\u4F9B\u66F4\u591A\u4FE1\u606F\u3002\u6B64\u63D0\u793A\u5C06\u51FA\u73B0\u5728\u8D39\u7528\u7684\u63CF\u8FF0\u5B57\u6BB5\u4E2D\u3002`,
                descriptionHintLabel: '\u63D0\u793A',
                descriptionHintSubtitle: '\u5C0F\u8D34\u58EB\uFF1A\u8D8A\u77ED\u8D8A\u597D\uFF01',
                maxAmount: '\u6700\u5927\u91D1\u989D',
                flagAmountsOver: '\u6807\u8BB0\u8D85\u8FC7\u7684\u91D1\u989D',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `\u9002\u7528\u4E8E\u7C7B\u522B\u201C${categoryName}\u201D\u3002`,
                flagAmountsOverSubtitle: '\u8FD9\u5C06\u8986\u76D6\u6240\u6709\u8D39\u7528\u7684\u6700\u5927\u91D1\u989D\u3002',
                expenseLimitTypes: {
                    expense: '\u4E2A\u4EBA\u8D39\u7528',
                    expenseSubtitle:
                        '\u6309\u7C7B\u522B\u6807\u8BB0\u8D39\u7528\u91D1\u989D\u3002\u6B64\u89C4\u5219\u8986\u76D6\u6700\u5927\u8D39\u7528\u91D1\u989D\u7684\u4E00\u822C\u5DE5\u4F5C\u533A\u89C4\u5219\u3002',
                    daily: '\u7C7B\u522B\u603B\u8BA1',
                    dailySubtitle: '\u6807\u8BB0\u6BCF\u4E2A\u8D39\u7528\u62A5\u544A\u7684\u7C7B\u522B\u603B\u652F\u51FA\u3002',
                },
                requireReceiptsOver: '\u8981\u6C42\u8D85\u8FC7\u7684\u6536\u636E',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} \u9ED8\u8BA4`,
                    never: '\u6C38\u8FDC\u4E0D\u9700\u8981\u6536\u636E',
                    always: '\u59CB\u7EC8\u8981\u6C42\u6536\u636E',
                },
                defaultTaxRate: '\u9ED8\u8BA4\u7A0E\u7387',
                goTo: '\u53BB',
                andEnableWorkflows: '\u5E76\u542F\u7528\u5DE5\u4F5C\u6D41\u7A0B\uFF0C\u7136\u540E\u6DFB\u52A0\u5BA1\u6279\u4EE5\u89E3\u9501\u6B64\u529F\u80FD\u3002',
            },
            customRules: {
                title: '\u81EA\u5B9A\u4E49\u89C4\u5219',
                subtitle: '\u63CF\u8FF0',
                description: '\u4E3A\u8D39\u7528\u62A5\u544A\u8F93\u5165\u81EA\u5B9A\u4E49\u89C4\u5219',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '\u6536\u96C6',
                    description: '\u9002\u5408\u5E0C\u671B\u81EA\u52A8\u5316\u6D41\u7A0B\u7684\u56E2\u961F\u3002',
                },
                corporate: {
                    label: '\u63A7\u5236',
                    description: '\u9002\u7528\u4E8E\u6709\u9AD8\u7EA7\u9700\u6C42\u7684\u7EC4\u7EC7\u3002',
                },
            },
            description:
                '\u9009\u62E9\u9002\u5408\u60A8\u7684\u8BA1\u5212\u3002\u6709\u5173\u529F\u80FD\u548C\u4EF7\u683C\u7684\u8BE6\u7EC6\u5217\u8868\uFF0C\u8BF7\u67E5\u770B\u6211\u4EEC\u7684',
            subscriptionLink: '\u8BA1\u5212\u7C7B\u578B\u548C\u5B9A\u4EF7\u5E2E\u52A9\u9875\u9762',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `\u60A8\u5DF2\u627F\u8BFA\u5728\u60A8\u7684\u5E74\u5EA6\u8BA2\u9605\u7ED3\u675F\u4E4B\u524D\uFF0C\u5728Control\u8BA1\u5212\u4E2D\u4FDD\u75591\u4F4D\u6D3B\u8DC3\u6210\u5458\uFF0C\u76F4\u5230${annualSubscriptionEndDate}\u3002\u60A8\u53EF\u4EE5\u901A\u8FC7\u5728${annualSubscriptionEndDate}\u5F00\u59CB\u7981\u7528\u81EA\u52A8\u7EED\u8BA2\u6765\u5207\u6362\u5230\u6309\u4F7F\u7528\u4ED8\u8D39\u7684\u8BA2\u9605\u5E76\u964D\u7EA7\u5230Collect\u8BA1\u5212\u3002`,
                other: `\u60A8\u5DF2\u627F\u8BFA\u5728\u63A7\u5236\u8BA1\u5212\u4E2D\u4FDD\u7559${count}\u540D\u6D3B\u8DC3\u6210\u5458\uFF0C\u76F4\u5230\u60A8\u7684\u5E74\u5EA6\u8BA2\u9605\u4E8E${annualSubscriptionEndDate}\u7ED3\u675F\u3002\u60A8\u53EF\u4EE5\u901A\u8FC7\u5728${annualSubscriptionEndDate}\u5F00\u59CB\u7981\u7528\u81EA\u52A8\u7EED\u8BA2\u6765\u5207\u6362\u5230\u6309\u4F7F\u7528\u4ED8\u8D39\u8BA2\u9605\u5E76\u964D\u7EA7\u5230\u6536\u6B3E\u8BA1\u5212\u3002`,
            }),
            subscriptions: '\u8BA2\u9605',
        },
    },
    getAssistancePage: {
        title: '\u83B7\u53D6\u5E2E\u52A9',
        subtitle: '\u6211\u4EEC\u5728\u8FD9\u91CC\u4E3A\u60A8\u626B\u6E05\u901A\u5F80\u4F1F\u5927\u7684\u9053\u8DEF\uFF01',
        description: '\u4ECE\u4EE5\u4E0B\u652F\u6301\u9009\u9879\u4E2D\u9009\u62E9\uFF1A',
        chatWithConcierge: '\u4E0EConcierge\u804A\u5929',
        scheduleSetupCall: '\u5B89\u6392\u8BBE\u7F6E\u7535\u8BDD\u4F1A\u8BAE',
        scheduleACall: '\u5B89\u6392\u7535\u8BDD\u4F1A\u8BAE',
        questionMarkButtonTooltip: '\u83B7\u53D6\u6211\u4EEC\u56E2\u961F\u7684\u5E2E\u52A9',
        exploreHelpDocs: '\u67E5\u770B\u5E2E\u52A9\u6587\u6863',
        registerForWebinar: '\u6CE8\u518C\u7F51\u7EDC\u7814\u8BA8\u4F1A',
        onboardingHelp: '\u5165\u804C\u5E2E\u52A9',
    },
    emojiPicker: {
        skinTonePickerLabel: '\u66F4\u6539\u9ED8\u8BA4\u80A4\u8272',
        headers: {
            frequentlyUsed: '\u5E38\u7528',
            smileysAndEmotion: '\u8868\u60C5\u7B26\u53F7\u548C\u60C5\u611F',
            peopleAndBody: '\u4EBA\u548C\u8EAB\u4F53',
            animalsAndNature: '\u52A8\u7269\u548C\u81EA\u7136',
            foodAndDrink: '\u98DF\u54C1\u548C\u996E\u6599',
            travelAndPlaces: '\u65C5\u884C\u548C\u5730\u70B9',
            activities: '\u6D3B\u52A8',
            objects: '\u5BF9\u8C61',
            symbols: '\u7B26\u53F7',
            flags: '\u6807\u8BB0',
        },
    },
    newRoomPage: {
        newRoom: '\u65B0\u623F\u95F4',
        groupName: '\u7FA4\u7EC4\u540D\u79F0',
        roomName: '\u623F\u95F4\u540D\u79F0',
        visibility: '\u53EF\u89C1\u6027',
        restrictedDescription: '\u60A8\u5DE5\u4F5C\u533A\u4E2D\u7684\u4EBA\u5458\u53EF\u4EE5\u627E\u5230\u6B64\u623F\u95F4',
        privateDescription: '\u88AB\u9080\u8BF7\u5230\u6B64\u623F\u95F4\u7684\u4EBA\u53EF\u4EE5\u627E\u5230\u5B83',
        publicDescription: '\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u627E\u5230\u8FD9\u4E2A\u623F\u95F4',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u627E\u5230\u8FD9\u4E2A\u623F\u95F4',
        createRoom: '\u521B\u5EFA\u623F\u95F4',
        roomAlreadyExistsError: '\u6B64\u540D\u79F0\u7684\u623F\u95F4\u5DF2\u5B58\u5728',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) =>
            `${reservedName}\u662F\u6240\u6709\u5DE5\u4F5C\u533A\u7684\u9ED8\u8BA4\u623F\u95F4\u3002\u8BF7\u9009\u62E9\u5176\u4ED6\u540D\u79F0\u3002`,
        roomNameInvalidError: '\u623F\u95F4\u540D\u79F0\u53EA\u80FD\u5305\u542B\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u548C\u8FDE\u5B57\u7B26',
        pleaseEnterRoomName: '\u8BF7\u8F93\u5165\u623F\u95F4\u540D\u79F0',
        pleaseSelectWorkspace: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport
                ? `${actor}\u91CD\u547D\u540D\u4E3A"${newName}"\uFF08\u4E4B\u524D\u4E3A"${oldName}"\uFF09`
                : `${actor}\u5C06\u6B64\u623F\u95F4\u91CD\u547D\u540D\u4E3A"${newName}"\uFF08\u4E4B\u524D\u4E3A"${oldName}"\uFF09`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `\u623F\u95F4\u91CD\u547D\u540D\u4E3A${newName}`,
        social: '\u793E\u4EA4',
        selectAWorkspace: '\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A',
        growlMessageOnRenameError: '\u65E0\u6CD5\u91CD\u547D\u540D\u5DE5\u4F5C\u533A\u623F\u95F4\u3002\u8BF7\u68C0\u67E5\u60A8\u7684\u8FDE\u63A5\u5E76\u91CD\u8BD5\u3002',
        visibilityOptions: {
            restricted: '\u5DE5\u4F5C\u533A', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: '\u79C1\u4EBA',
            public: '\u516C\u5F00',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: '\u516C\u5F00\u516C\u544A',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '\u63D0\u4EA4\u5E76\u5173\u95ED',
        submitAndApprove: '\u63D0\u4EA4\u5E76\u6279\u51C6',
        advanced: '\u9AD8\u7EA7',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `\u5C06 ${approverName} (${approverEmail}) \u6DFB\u52A0\u4E3A ${field} "${name}" \u7684\u5BA1\u6279\u4EBA`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `\u5C06 ${approverName} (${approverEmail}) \u4ECE ${field} "${name}" \u7684\u5BA1\u6279\u4EBA\u4E2D\u79FB\u9664`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `\u5C06 ${field} "${name}" \u7684\u5BA1\u6279\u4EBA\u66F4\u6539\u4E3A ${formatApprover(newApproverName, newApproverEmail)}\uFF08\u4E4B\u524D\u4E3A ${formatApprover(oldApproverName, oldApproverEmail)}\uFF09`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `\u6DFB\u52A0\u4E86\u7C7B\u522B\u201C${categoryName}\u201D`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `\u5DF2\u79FB\u9664\u7C7B\u522B\u201C${categoryName}\u201D`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? '\u7981\u7528' : '\u542F\u7528'} \u7C7B\u522B "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `\u5C06\u5DE5\u8D44\u4EE3\u7801\u201C${newValue}\u201D\u6DFB\u52A0\u5230\u7C7B\u522B\u201C${categoryName}\u201D\u4E2D`;
            }
            if (!newValue && oldValue) {
                return `\u4ECE\u7C7B\u522B\u201C${categoryName}\u201D\u4E2D\u79FB\u9664\u4E86\u5DE5\u8D44\u4EE3\u7801\u201C${oldValue}\u201D`;
            }
            return `\u5C06\u201C${categoryName}\u201D\u7C7B\u522B\u7684\u5DE5\u8D44\u4EE3\u7801\u66F4\u6539\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `\u5C06 GL \u4EE3\u7801\u201C${newValue}\u201D\u6DFB\u52A0\u5230\u7C7B\u522B\u201C${categoryName}\u201D\u4E2D`;
            }
            if (!newValue && oldValue) {
                return `\u4ECE\u7C7B\u522B\u201C${categoryName}\u201D\u4E2D\u79FB\u9664\u4E86 GL \u4EE3\u7801\u201C${oldValue}\u201D`;
            }
            return `\u5C06\u201C${categoryName}\u201D\u7C7B\u522B\u7684GL\u4EE3\u7801\u66F4\u6539\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `\u5C06\u201C${categoryName}\u201D\u7C7B\u522B\u63CF\u8FF0\u66F4\u6539\u4E3A${!oldValue ? '\u5FC5\u9700\u7684' : '\u4E0D\u9700\u8981'}\uFF08\u4E4B\u524D\u4E3A${!oldValue ? '\u4E0D\u9700\u8981' : '\u5FC5\u9700\u7684'}\uFF09`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `\u5DF2\u4E3A\u7C7B\u522B"${categoryName}"\u6DFB\u52A0\u4E86${newAmount}\u7684\u6700\u5927\u91D1\u989D`;
            }
            if (oldAmount && !newAmount) {
                return `\u4ECE\u7C7B\u522B\u201C${categoryName}\u201D\u4E2D\u79FB\u9664\u4E86${oldAmount}\u7684\u6700\u5927\u91D1\u989D\u3002`;
            }
            return `\u5C06\u201C${categoryName}\u201D\u7C7B\u522B\u7684\u6700\u5927\u91D1\u989D\u66F4\u6539\u4E3A${newAmount}\uFF08\u4E4B\u524D\u4E3A${oldAmount}\uFF09`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `\u5C06\u9650\u989D\u7C7B\u578B ${newValue} \u6DFB\u52A0\u5230\u7C7B\u522B "${categoryName}"`;
            }
            return `\u5C06\u201C${categoryName}\u201D\u7C7B\u522B\u7684\u9650\u5236\u7C7B\u578B\u66F4\u6539\u4E3A${newValue}\uFF08\u4E4B\u524D\u4E3A${oldValue}\uFF09`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `\u901A\u8FC7\u5C06\u6536\u636E\u66F4\u6539\u4E3A${newValue}\u6765\u66F4\u65B0\u7C7B\u522B\u201C${categoryName}\u201D`;
            }
            return `\u5C06\u201C${categoryName}\u201D\u7C7B\u522B\u66F4\u6539\u4E3A${newValue}\uFF08\u4E4B\u524D\u4E3A${oldValue}\uFF09`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `\u5C06\u7C7B\u522B\u4ECE\u201C${oldName}\u201D\u91CD\u547D\u540D\u4E3A\u201C${newName}\u201D`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `\u4ECE\u7C7B\u522B\u201C${categoryName}\u201D\u4E2D\u79FB\u9664\u4E86\u63CF\u8FF0\u63D0\u793A\u201C${oldValue}\u201D`;
            }
            return !oldValue
                ? `\u5C06\u63CF\u8FF0\u63D0\u793A\u201C${newValue}\u201D\u6DFB\u52A0\u5230\u7C7B\u522B\u201C${categoryName}\u201D\u4E2D`
                : `\u5C06\u201C${categoryName}\u201D\u7C7B\u522B\u63CF\u8FF0\u63D0\u793A\u66F4\u6539\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) =>
            `\u5C06\u6807\u7B7E\u5217\u8868\u540D\u79F0\u66F4\u6539\u4E3A\u201C${newName}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldName}\u201D\uFF09`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `\u5C06\u6807\u7B7E\u201C${tagName}\u201D\u6DFB\u52A0\u5230\u5217\u8868\u201C${tagListName}\u201D\u4E2D`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `\u901A\u8FC7\u5C06\u6807\u7B7E\u201C${oldName}\u201D\u66F4\u6539\u4E3A\u201C${newName}\u201D\u66F4\u65B0\u4E86\u6807\u7B7E\u5217\u8868\u201C${tagListName}\u201D`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) =>
            `${enabled ? '\u542F\u7528' : '\u7981\u7528'} \u5217\u8868 "${tagListName}" \u4E0A\u7684\u6807\u7B7E "${tagName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `\u5DF2\u4ECE\u5217\u8868\u201C${tagListName}\u201D\u4E2D\u79FB\u9664\u6807\u7B7E\u201C${tagName}\u201D`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `\u4ECE\u5217\u8868\u201C${tagListName}\u201D\u4E2D\u79FB\u9664\u4E86\u201C${count}\u201D\u4E2A\u6807\u7B7E`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `\u5728\u5217\u8868\u201C${tagListName}\u201D\u4E2D\u66F4\u65B0\u4E86\u6807\u7B7E\u201C${tagName}\u201D\uFF0C\u5C06${updatedField}\u66F4\u6539\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`;
            }
            return `\u901A\u8FC7\u5728\u5217\u8868\u201C${tagListName}\u201D\u4E2D\u6DFB\u52A0\u4E00\u4E2A${updatedField}\u4E3A\u201C${newValue}\u201D\uFF0C\u66F4\u65B0\u4E86\u6807\u7B7E\u201C${tagName}\u201D`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `\u5C06 ${customUnitName} \u7684 ${updatedField} \u66F4\u6539\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? '\u542F\u7528' : '\u7981\u7528'} \u7A0E\u6536\u8DDF\u8E2A\u8DDD\u79BB\u8D39\u7387`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) =>
            `\u6DFB\u52A0\u4E86\u65B0\u7684\u201C${customUnitName}\u201D\u8D39\u7387\u201C${rateName}\u201D`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `\u5C06${customUnitName}\u7684${updatedField} "${customUnitRateName}"\u7684\u8D39\u7387\u66F4\u6539\u4E3A"${newValue}"\uFF08\u4E4B\u524D\u4E3A"${oldValue}"\uFF09`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `\u5C06\u8DDD\u79BB\u8D39\u7387 "${customUnitRateName}" \u7684\u7A0E\u7387\u66F4\u6539\u4E3A "${newValue} (${newTaxPercentage})"\uFF08\u4E4B\u524D\u4E3A "${oldValue} (${oldTaxPercentage})"\uFF09`;
            }
            return `\u5C06\u7A0E\u7387\u201C${newValue} (${newTaxPercentage})\u201D\u6DFB\u52A0\u5230\u8DDD\u79BB\u8D39\u7387\u201C${customUnitRateName}\u201D\u4E2D`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `\u5C06\u8DDD\u79BB\u8D39\u7387\u4E2D\u53EF\u9000\u7A0E\u90E8\u5206\u7684 "${customUnitRateName}" \u66F4\u6539\u4E3A "${newValue}"\uFF08\u4E4B\u524D\u4E3A "${oldValue}"\uFF09`;
            }
            return `\u5C06\u7A0E\u53EF\u56DE\u6536\u90E8\u5206\u201C${newValue}\u201D\u6DFB\u52A0\u5230\u8DDD\u79BB\u8D39\u7387\u201C${customUnitRateName}\u201D`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `\u5DF2\u79FB\u9664\u201C${customUnitName}\u201D\u8D39\u7387\u201C${rateName}\u201D`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `\u6DFB\u52A0\u4E86 ${fieldType} \u62A5\u544A\u5B57\u6BB5 "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `\u5C06\u62A5\u544A\u5B57\u6BB5"${fieldName}"\u7684\u9ED8\u8BA4\u503C\u8BBE\u7F6E\u4E3A"${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) =>
            `\u5C06\u9009\u9879\u201C${optionName}\u201D\u6DFB\u52A0\u5230\u62A5\u544A\u5B57\u6BB5\u201C${fieldName}\u201D\u4E2D`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) =>
            `\u4ECE\u62A5\u544A\u5B57\u6BB5\u201C${fieldName}\u201D\u4E2D\u79FB\u9664\u4E86\u9009\u9879\u201C${optionName}\u201D`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? '\u542F\u7528' : '\u7981\u7528'} \u62A5\u544A\u5B57\u6BB5 "${fieldName}" \u7684\u9009\u9879 "${optionName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '\u542F\u7528' : '\u7981\u7528'} \u62A5\u544A\u5B57\u6BB5\u201C${fieldName}\u201D\u7684\u6240\u6709\u9009\u9879`;
            }
            return `${allEnabled ? '\u542F\u7528' : '\u7981\u7528'} \u62A5\u544A\u5B57\u6BB5 "${fieldName}" \u7684\u9009\u9879 "${optionName}"\uFF0C\u4F7F\u6240\u6709\u9009\u9879 ${allEnabled ? '\u542F\u7528' : '\u7981\u7528'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `\u5DF2\u5220\u9664${fieldType}\u62A5\u544A\u5B57\u6BB5\u201C${fieldName}\u201D`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `\u5C06\u201CPrevent self-approval\u201D\u4ECE\u201C${oldValue === 'true' ? '\u542F\u7528' : '\u7981\u7528'}\u201D\u66F4\u65B0\u4E3A\u201C${newValue === 'true' ? '\u542F\u7528' : '\u7981\u7528'}\u201D`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `\u5C06\u6240\u9700\u6536\u636E\u7684\u6700\u5927\u62A5\u9500\u91D1\u989D\u66F4\u6539\u4E3A${newValue}\uFF08\u4E4B\u524D\u4E3A${oldValue}\uFF09`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `\u5C06\u8FDD\u89C4\u7684\u6700\u5927\u8D39\u7528\u91D1\u989D\u66F4\u6539\u4E3A${newValue}\uFF08\u4E4B\u524D\u4E3A${oldValue}\uFF09`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `\u5C06\u201C\u6700\u5927\u8D39\u7528\u5E74\u9F84\uFF08\u5929\uFF09\u201D\u66F4\u65B0\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}\u201D\uFF09`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `\u5C06\u6708\u5EA6\u62A5\u544A\u63D0\u4EA4\u65E5\u671F\u8BBE\u7F6E\u4E3A"${newValue}"`;
            }
            return `\u5C06\u6708\u5EA6\u62A5\u544A\u63D0\u4EA4\u65E5\u671F\u66F4\u65B0\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `\u5C06\u201C\u91CD\u65B0\u5411\u5BA2\u6237\u8BA1\u8D39\u8D39\u7528\u201D\u66F4\u65B0\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `\u5C06 "Enforce default report titles" ${value ? '\u5728' : '\u5173'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) =>
            `\u5DF2\u5C06\u6B64\u5DE5\u4F5C\u533A\u7684\u540D\u79F0\u66F4\u65B0\u4E3A\u201C${newName}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldName}\u201D\uFF09`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `\u5C06\u6B64\u5DE5\u4F5C\u533A\u7684\u63CF\u8FF0\u8BBE\u7F6E\u4E3A\u201C${newDescription}\u201D`
                : `\u5C06\u6B64\u5DE5\u4F5C\u533A\u7684\u63CF\u8FF0\u66F4\u65B0\u4E3A\u201C${newDescription}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldDescription}\u201D\uFF09`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('\u548C');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `\u5DF2\u5C06\u60A8\u4ECE${joinedNames}\u7684\u5BA1\u6279\u6D41\u7A0B\u548C\u8D39\u7528\u804A\u5929\u4E2D\u79FB\u9664\u3002\u4E4B\u524D\u63D0\u4EA4\u7684\u62A5\u544A\u4ECD\u5C06\u5728\u60A8\u7684\u6536\u4EF6\u7BB1\u4E2D\u53EF\u4F9B\u5BA1\u6279\u3002`,
                other: `\u5DF2\u5C06\u60A8\u4ECE${joinedNames}\u7684\u5BA1\u6279\u5DE5\u4F5C\u6D41\u548C\u8D39\u7528\u804A\u5929\u4E2D\u79FB\u9664\u3002\u4E4B\u524D\u63D0\u4EA4\u7684\u62A5\u544A\u4ECD\u5C06\u5728\u60A8\u7684\u6536\u4EF6\u7BB1\u4E2D\u53EF\u4F9B\u5BA1\u6279\u3002`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `\u5C06\u60A8\u5728 ${policyName} \u4E2D\u7684\u89D2\u8272\u4ECE ${oldRole} \u66F4\u65B0\u4E3A\u7528\u6237\u3002\u60A8\u5DF2\u4ECE\u9664\u81EA\u5DF1\u4E4B\u5916\u7684\u6240\u6709\u63D0\u4EA4\u8005\u8D39\u7528\u804A\u5929\u4E2D\u79FB\u9664\u3002`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) =>
            `\u5C06\u9ED8\u8BA4\u8D27\u5E01\u66F4\u65B0\u4E3A${newCurrency}\uFF08\u4E4B\u524D\u4E3A${oldCurrency}\uFF09`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `\u5C06\u81EA\u52A8\u62A5\u544A\u9891\u7387\u66F4\u65B0\u4E3A\u201C${newFrequency}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldFrequency}\u201D\uFF09`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) =>
            `\u5C06\u5BA1\u6279\u6A21\u5F0F\u66F4\u65B0\u4E3A\u201C${newValue}\u201D\uFF08\u4E4B\u524D\u4E3A\u201C${oldValue}\u201D\uFF09`,
        upgradedWorkspace: '\u5DF2\u5C06\u6B64\u5DE5\u4F5C\u533A\u5347\u7EA7\u5230Control\u8BA1\u5212',
        downgradedWorkspace: '\u5C06\u6B64\u5DE5\u4F5C\u533A\u964D\u7EA7\u4E3ACollect\u8BA1\u5212',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `\u5C06\u62A5\u544A\u968F\u673A\u5206\u914D\u8FDB\u884C\u4EBA\u5DE5\u5BA1\u6279\u7684\u6BD4\u4F8B\u66F4\u6539\u4E3A${Math.round(newAuditRate * 100)}\uFF05\uFF08\u4E4B\u524D\u4E3A${Math.round(oldAuditRate * 100)}\uFF05\uFF09`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `\u5C06\u6240\u6709\u8D39\u7528\u7684\u4EBA\u5DE5\u5BA1\u6279\u9650\u989D\u66F4\u6539\u4E3A${newLimit}\uFF08\u4E4B\u524D\u4E3A${oldLimit}\uFF09`,
    },
    roomMembersPage: {
        memberNotFound: '\u672A\u627E\u5230\u6210\u5458\u3002',
        useInviteButton: '\u8981\u9080\u8BF7\u65B0\u6210\u5458\u52A0\u5165\u804A\u5929\uFF0C\u8BF7\u4F7F\u7528\u4E0A\u9762\u7684\u9080\u8BF7\u6309\u94AE\u3002',
        notAuthorized: `\u60A8\u65E0\u6743\u8BBF\u95EE\u6B64\u9875\u9762\u3002\u5982\u679C\u60A8\u60F3\u52A0\u5165\u6B64\u623F\u95F4\uFF0C\u8BF7\u8BA9\u623F\u95F4\u6210\u5458\u6DFB\u52A0\u60A8\u3002\u8FD8\u6709\u5176\u4ED6\u95EE\u9898\u5417\uFF1F\u8BF7\u8054\u7CFB${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `\u60A8\u786E\u5B9A\u8981\u5C06${memberName}\u4ECE\u623F\u95F4\u4E2D\u79FB\u9664\u5417\uFF1F`,
            other: '\u60A8\u786E\u5B9A\u8981\u4ECE\u623F\u95F4\u4E2D\u79FB\u9664\u9009\u5B9A\u7684\u6210\u5458\u5417\uFF1F',
        }),
        error: {
            genericAdd: '\u6DFB\u52A0\u6B64\u623F\u95F4\u6210\u5458\u65F6\u51FA\u73B0\u95EE\u9898\u3002',
        },
    },
    newTaskPage: {
        assignTask: '\u5206\u914D\u4EFB\u52A1',
        assignMe: '\u5206\u914D\u7ED9\u6211',
        confirmTask: '\u786E\u8BA4\u4EFB\u52A1',
        confirmError: '\u8BF7\u8F93\u5165\u6807\u9898\u5E76\u9009\u62E9\u5171\u4EAB\u76EE\u7684\u5730',
        descriptionOptional: '\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09',
        pleaseEnterTaskName: '\u8BF7\u8F93\u5165\u6807\u9898',
        pleaseEnterTaskDestination: '\u8BF7\u9009\u62E9\u60A8\u60F3\u8981\u5206\u4EAB\u6B64\u4EFB\u52A1\u7684\u4F4D\u7F6E',
    },
    task: {
        task: '\u4EFB\u52A1',
        title: '\u6807\u9898',
        description: '\u63CF\u8FF0',
        assignee: '\u53D7\u8BA9\u4EBA',
        completed: '\u5DF2\u5B8C\u6210',
        action: '\u5B8C\u6210',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `${title} \u7684\u4EFB\u52A1`,
            completed: '\u6807\u8BB0\u4E3A\u5B8C\u6210',
            canceled: '\u5DF2\u5220\u9664\u4EFB\u52A1',
            reopened: '\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210',
            error: '\u60A8\u6CA1\u6709\u6743\u9650\u6267\u884C\u8BF7\u6C42\u7684\u64CD\u4F5C',
        },
        markAsComplete: '\u6807\u8BB0\u4E3A\u5B8C\u6210',
        markAsIncomplete: '\u6807\u8BB0\u4E3A\u672A\u5B8C\u6210',
        assigneeError: '\u5206\u914D\u6B64\u4EFB\u52A1\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u8BF7\u5C1D\u8BD5\u5176\u4ED6\u53D7\u8BA9\u4EBA\u3002',
        genericCreateTaskFailureMessage: '\u521B\u5EFA\u6B64\u4EFB\u52A1\u65F6\u51FA\u9519\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        deleteTask: '\u5220\u9664\u4EFB\u52A1',
        deleteConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u4EFB\u52A1\u5417\uFF1F',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} \u5BF9\u8D26\u5355`,
    },
    keyboardShortcutsPage: {
        title: '\u952E\u76D8\u5FEB\u6377\u952E',
        subtitle: '\u4F7F\u7528\u8FD9\u4E9B\u65B9\u4FBF\u7684\u952E\u76D8\u5FEB\u6377\u952E\u6765\u8282\u7701\u65F6\u95F4\uFF1A',
        shortcuts: {
            openShortcutDialog: '\u6253\u5F00\u952E\u76D8\u5FEB\u6377\u952E\u5BF9\u8BDD\u6846',
            markAllMessagesAsRead: '\u5C06\u6240\u6709\u6D88\u606F\u6807\u8BB0\u4E3A\u5DF2\u8BFB',
            escape: '\u9000\u51FA\u5BF9\u8BDD\u6846',
            search: '\u6253\u5F00\u641C\u7D22\u5BF9\u8BDD\u6846',
            newChat: '\u65B0\u7684\u804A\u5929\u5C4F\u5E55',
            copy: '\u590D\u5236\u8BC4\u8BBA',
            openDebug: '\u6253\u5F00\u6D4B\u8BD5\u504F\u597D\u8BBE\u7F6E\u5BF9\u8BDD\u6846',
        },
    },
    guides: {
        screenShare: '\u5C4F\u5E55\u5171\u4EAB',
        screenShareRequest: 'Expensify\u9080\u8BF7\u60A8\u8FDB\u884C\u5C4F\u5E55\u5171\u4EAB',
    },
    search: {
        resultsAreLimited: '\u641C\u7D22\u7ED3\u679C\u53D7\u5230\u9650\u5236\u3002',
        viewResults: '\u67E5\u770B\u7ED3\u679C',
        resetFilters: '\u91CD\u7F6E\u7B5B\u9009\u5668',
        searchResults: {
            emptyResults: {
                title: '\u65E0\u5185\u5BB9\u663E\u793A',
                subtitle: '\u5C1D\u8BD5\u8C03\u6574\u60A8\u7684\u641C\u7D22\u6761\u4EF6\u6216\u4F7F\u7528\u7EFF\u8272\u7684 + \u6309\u94AE\u521B\u5EFA\u5185\u5BB9\u3002',
            },
            emptyExpenseResults: {
                title: '\u60A8\u8FD8\u6CA1\u6709\u521B\u5EFA\u4EFB\u4F55\u8D39\u7528',
                subtitle: '\u521B\u5EFA\u4E00\u7B14\u8D39\u7528\u6216\u8BD5\u7528Expensify\u4EE5\u4E86\u89E3\u66F4\u591A\u4FE1\u606F\u3002',
                subtitleWithOnlyCreateButton: '\u4F7F\u7528\u4E0B\u9762\u7684\u7EFF\u8272\u6309\u94AE\u521B\u5EFA\u4E00\u7B14\u8D39\u7528\u3002',
            },
            emptyReportResults: {
                title: '\u60A8\u8FD8\u6CA1\u6709\u521B\u5EFA\u4EFB\u4F55\u62A5\u544A',
                subtitle: '\u521B\u5EFA\u62A5\u544A\u6216\u8BD5\u7528Expensify\u4EE5\u4E86\u89E3\u66F4\u591A\u4FE1\u606F\u3002',
                subtitleWithOnlyCreateButton: '\u4F7F\u7528\u4E0B\u9762\u7684\u7EFF\u8272\u6309\u94AE\u521B\u5EFA\u62A5\u544A\u3002',
            },
            emptyInvoiceResults: {
                title: '\u60A8\u8FD8\u6CA1\u6709\u521B\u5EFA\u4EFB\u4F55\u53D1\u7968',
                subtitle: '\u53D1\u9001\u53D1\u7968\u6216\u8BD5\u7528Expensify\u4EE5\u4E86\u89E3\u66F4\u591A\u4FE1\u606F\u3002',
                subtitleWithOnlyCreateButton: '\u4F7F\u7528\u4E0B\u9762\u7684\u7EFF\u8272\u6309\u94AE\u53D1\u9001\u53D1\u7968\u3002',
            },
            emptyTripResults: {
                title: '\u6CA1\u6709\u884C\u7A0B\u53EF\u663E\u793A',
                subtitle: '\u901A\u8FC7\u4E0B\u65B9\u9884\u8BA2\u60A8\u7684\u7B2C\u4E00\u6B21\u65C5\u884C\u5F00\u59CB\u3002',
                buttonText: '\u9884\u8BA2\u884C\u7A0B',
            },
            emptySubmitResults: {
                title: '\u6CA1\u6709\u8D39\u7528\u53EF\u63D0\u4EA4',
                subtitle: '\u4E00\u5207\u987A\u5229\u3002\u5E86\u795D\u4E00\u4E0B\u5427\uFF01',
                buttonText: '\u521B\u5EFA\u62A5\u544A',
            },
            emptyApproveResults: {
                title: '\u6CA1\u6709\u9700\u8981\u6279\u51C6\u7684\u62A5\u9500\u5355',
                subtitle: '\u96F6\u62A5\u9500\u3002\u6781\u81F4\u653E\u677E\u3002\u5E72\u5F97\u597D\uFF01',
            },
            emptyPayResults: {
                title: '\u6CA1\u6709\u9700\u8981\u652F\u4ED8\u7684\u8D39\u7528',
                subtitle: '\u606D\u559C\uFF01\u4F60\u51B2\u8FC7\u7EC8\u70B9\u7EBF\u4E86\u3002',
            },
            emptyExportResults: {
                title: '\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u8D39\u7528',
                subtitle: '\u662F\u65F6\u5019\u653E\u677E\u4E00\u4E0B\u4E86\uFF0C\u5E72\u5F97\u4E0D\u9519\u3002',
            },
        },
        saveSearch: '\u4FDD\u5B58\u641C\u7D22',
        deleteSavedSearch: '\u5220\u9664\u5DF2\u4FDD\u5B58\u7684\u641C\u7D22',
        deleteSavedSearchConfirm: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u641C\u7D22\u5417\uFF1F',
        searchName: '\u641C\u7D22\u540D\u79F0',
        savedSearchesMenuItemTitle: '\u5DF2\u4FDD\u5B58',
        groupedExpenses: '\u5206\u7EC4\u8D39\u7528',
        bulkActions: {
            approve: '\u6279\u51C6',
            pay: '\u652F\u4ED8',
            delete: '\u5220\u9664',
            hold: '\u4FDD\u6301',
            unhold: '\u79FB\u9664\u4FDD\u7559',
            noOptionsAvailable: '\u6240\u9009\u8D39\u7528\u7EC4\u6CA1\u6709\u53EF\u7528\u9009\u9879\u3002',
        },
        filtersHeader: '\u8FC7\u6EE4\u5668',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `\u5728 ${date ?? ''} \u4E4B\u524D`,
                after: ({date}: OptionalParam<DateParams> = {}) => `\u5728${date ?? ''}\u4E4B\u540E`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
            },
            status: '\u72B6\u6001',
            keyword: '\u5173\u952E\u8BCD',
            hasKeywords: '\u6709\u5173\u952E\u8BCD',
            currency: '\u8D27\u5E01',
            link: '\u94FE\u63A5',
            pinned: '\u5DF2\u56FA\u5B9A',
            unread: '\u672A\u8BFB',
            completed: '\u5DF2\u5B8C\u6210',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `\u5C11\u4E8E${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `\u5927\u4E8E${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `\u5728 ${greaterThan} \u548C ${lessThan} \u4E4B\u95F4`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '\u4E2A\u4EBA\u5361\u7247',
                closedCards: '\u5DF2\u5173\u95ED\u7684\u5361\u7247',
                cardFeeds: '\u5361\u7247\u6570\u636E\u6D41',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `\u6240\u6709${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `\u6240\u6709\u5DF2\u5BFC\u5165\u7684CSV\u5361\u7247${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: '\u5F53\u524D',
            past: '\u8FC7\u53BB',
            submitted: '\u63D0\u4EA4\u65E5\u671F',
            approved: '\u6279\u51C6\u65E5\u671F',
            paid: '\u4ED8\u6B3E\u65E5\u671F',
            exported: '\u5BFC\u51FA\u65E5\u671F',
            posted: '\u53D1\u5E03\u65E5\u671F',
            billable: '\u53EF\u8BA1\u8D39\u7684',
            reimbursable: '\u53EF\u62A5\u9500\u7684',
        },
        moneyRequestReport: {
            emptyStateTitle: '\u6B64\u62A5\u544A\u6CA1\u6709\u8D39\u7528\u3002',
            emptyStateSubtitle: '\u60A8\u53EF\u4EE5\u4F7F\u7528\u4E0A\u9762\u7684\u6309\u94AE\u5C06\u8D39\u7528\u6DFB\u52A0\u5230\u6B64\u62A5\u544A\u4E2D\u3002',
        },
        noCategory: '\u65E0\u7C7B\u522B',
        noTag: '\u65E0\u6807\u7B7E',
        expenseType: '\u8D39\u7528\u7C7B\u578B',
        recentSearches: '\u6700\u8FD1\u641C\u7D22',
        recentChats: '\u6700\u8FD1\u7684\u804A\u5929\u8BB0\u5F55',
        searchIn: '\u641C\u7D22\u5728',
        searchPlaceholder: '\u641C\u7D22\u5185\u5BB9',
        suggestions: '\u5EFA\u8BAE',
        exportSearchResults: {
            title: '\u521B\u5EFA\u5BFC\u51FA',
            description:
                '\u54C7\uFF0C\u4E1C\u897F\u771F\u591A\uFF01\u6211\u4EEC\u4F1A\u628A\u5B83\u4EEC\u6253\u5305\uFF0CConcierge \u4F1A\u5F88\u5FEB\u7ED9\u4F60\u53D1\u9001\u4E00\u4E2A\u6587\u4EF6\u3002',
        },
        exportAll: {
            selectAllMatchingItems: '\u9009\u62E9\u6240\u6709\u5339\u914D\u7684\u9879\u76EE',
            allMatchingItemsSelected: '\u6240\u6709\u5339\u914D\u7684\u9879\u76EE\u5DF2\u9009\u4E2D',
        },
    },
    genericErrorPage: {
        title: '\u54E6\u54E6\uFF0C\u51FA\u4E86\u70B9\u95EE\u9898\uFF01',
        body: {
            helpTextMobile: '\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u5E94\u7528\uFF0C\u6216\u5207\u6362\u5230',
            helpTextWeb: 'web.',
            helpTextConcierge: '\u5982\u679C\u95EE\u9898\u4ECD\u7136\u5B58\u5728\uFF0C\u8BF7\u8054\u7CFB',
        },
        refresh: '\u5237\u65B0',
    },
    fileDownload: {
        success: {
            title: '\u5DF2\u4E0B\u8F7D\uFF01',
            message: '\u9644\u4EF6\u4E0B\u8F7D\u6210\u529F\uFF01',
            qrMessage:
                '\u68C0\u67E5\u60A8\u7684\u7167\u7247\u6216\u4E0B\u8F7D\u6587\u4EF6\u5939\u4E2D\u662F\u5426\u6709\u60A8\u7684\u4E8C\u7EF4\u7801\u526F\u672C\u3002\u4E13\u4E1A\u63D0\u793A\uFF1A\u5C06\u5176\u6DFB\u52A0\u5230\u6F14\u793A\u6587\u7A3F\u4E2D\uFF0C\u8BA9\u60A8\u7684\u89C2\u4F17\u626B\u63CF\u5E76\u76F4\u63A5\u4E0E\u60A8\u8054\u7CFB\u3002',
        },
        generalError: {
            title: '\u9644\u4EF6\u9519\u8BEF',
            message: '\u9644\u4EF6\u65E0\u6CD5\u4E0B\u8F7D',
        },
        permissionError: {
            title: '\u5B58\u50A8\u8BBF\u95EE\u6743\u9650',
            message:
                'Expensify\u65E0\u6CD5\u5728\u6CA1\u6709\u5B58\u50A8\u8BBF\u95EE\u6743\u9650\u7684\u60C5\u51B5\u4E0B\u4FDD\u5B58\u9644\u4EF6\u3002\u70B9\u51FB\u8BBE\u7F6E\u4EE5\u66F4\u65B0\u6743\u9650\u3002',
        },
    },
    desktopApplicationMenu: {
        mainMenu: '\u65B0Expensify',
        about: '\u5173\u4E8E New Expensify',
        update: '\u66F4\u65B0 New Expensify',
        checkForUpdates: '\u68C0\u67E5\u66F4\u65B0',
        toggleDevTools: '\u5207\u6362\u5F00\u53D1\u8005\u5DE5\u5177',
        viewShortcuts: '\u67E5\u770B\u952E\u76D8\u5FEB\u6377\u952E',
        services: '\u670D\u52A1',
        hide: '\u9690\u85CF New Expensify',
        hideOthers: '\u9690\u85CF\u5176\u4ED6',
        showAll: '\u663E\u793A\u5168\u90E8',
        quit: '\u9000\u51FA New Expensify',
        fileMenu: '\u6587\u4EF6',
        closeWindow: '\u5173\u95ED\u7A97\u53E3',
        editMenu: '\u7F16\u8F91',
        undo: '\u64A4\u9500',
        redo: '\u91CD\u505A',
        cut: '\u526A\u5207',
        copy: '\u590D\u5236',
        paste: '\u7C98\u8D34',
        pasteAndMatchStyle: '\u7C98\u8D34\u5E76\u5339\u914D\u6837\u5F0F',
        pasteAsPlainText: '\u7C98\u8D34\u4E3A\u7EAF\u6587\u672C',
        delete: '\u5220\u9664',
        selectAll: '\u5168\u9009',
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
        historyMenu: '\u5386\u53F2',
        back: '\u8FD4\u56DE',
        forward: '\u8F6C\u53D1',
        windowMenu: '\u7A97\u53E3',
        minimize: '\u6700\u5C0F\u5316',
        zoom: 'Zoom',
        front: '\u5168\u90E8\u79FB\u5230\u524D\u9762',
        helpMenu: '\u5E2E\u52A9',
        learnMore: '\u4E86\u89E3\u66F4\u591A',
        documentation: '\u6587\u6863',
        communityDiscussions: '\u793E\u533A\u8BA8\u8BBA',
        searchIssues: '\u641C\u7D22\u95EE\u9898',
    },
    historyMenu: {
        forward: '\u8F6C\u53D1',
        back: '\u8FD4\u56DE',
    },
    checkForUpdatesModal: {
        available: {
            title: '\u6709\u53EF\u7528\u66F4\u65B0',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `\u65B0\u7248\u672C\u5C06\u5F88\u5FEB\u53EF\u7528\u3002${!isSilentUpdating ? '\u6211\u4EEC\u51C6\u5907\u66F4\u65B0\u65F6\u4F1A\u901A\u77E5\u60A8\u3002' : ''}`,
            soundsGood: '\u542C\u8D77\u6765\u4E0D\u9519',
        },
        notAvailable: {
            title: '\u66F4\u65B0\u4E0D\u53EF\u7528',
            message: '\u73B0\u5728\u6CA1\u6709\u53EF\u7528\u7684\u66F4\u65B0\u3002\u8BF7\u7A0D\u540E\u518D\u68C0\u67E5\uFF01',
            okay: '\u597D\u7684',
        },
        error: {
            title: '\u66F4\u65B0\u68C0\u67E5\u5931\u8D25',
            message: '\u6211\u4EEC\u65E0\u6CD5\u68C0\u67E5\u66F4\u65B0\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        },
    },
    report: {
        newReport: {
            createReport: '\u521B\u5EFA\u62A5\u544A',
            chooseWorkspace: '\u4E3A\u6B64\u62A5\u544A\u9009\u62E9\u4E00\u4E2A\u5DE5\u4F5C\u533A\u3002',
        },
        genericCreateReportFailureMessage: '\u521B\u5EFA\u6B64\u804A\u5929\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        genericAddCommentFailureMessage: '\u53D1\u8868\u8BC4\u8BBA\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        genericUpdateReportFieldFailureMessage: '\u66F4\u65B0\u5B57\u6BB5\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        genericUpdateReportNameEditFailureMessage: '\u91CD\u547D\u540D\u62A5\u544A\u65F6\u51FA\u73B0\u610F\u5916\u9519\u8BEF\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002',
        noActivityYet: '\u6682\u65E0\u6D3B\u52A8',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `\u5C06${fieldName}\u4ECE${oldValue}\u66F4\u6539\u4E3A${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `\u5C06${fieldName}\u66F4\u6539\u4E3A${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `\u5C06\u5DE5\u4F5C\u533A\u66F4\u6539\u4E3A${toPolicyName}${fromPolicyName ? `\uFF08\u4E4B\u524D\u4E3A ${fromPolicyName}\uFF09` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `\u5C06\u7C7B\u578B\u4ECE${oldType}\u66F4\u6539\u4E3A${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) =>
                    `\u7531\u4E8E${originalManager}\u6B63\u5728\u4F11\u5047\uFF0C\u5C06\u6B64\u62A5\u544A\u53D1\u9001\u7ED9${delegateUser}`,
                exportedToCSV: `\u5BFC\u51FA\u4E3ACSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `\u5BFC\u51FA\u5230${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `\u901A\u8FC7 ${label} \u5BFC\u51FA\u5230`,
                    automaticActionTwo: '\u4F1A\u8BA1\u8BBE\u7F6E',
                    manual: ({label}: ExportedToIntegrationParams) => `\u5C06\u6B64\u62A5\u544A\u6807\u8BB0\u4E3A\u624B\u52A8\u5BFC\u51FA\u5230${label}\u3002`,
                    automaticActionThree: '\u5E76\u6210\u529F\u521B\u5EFA\u4E86\u4E00\u6761\u8BB0\u5F55\u7ED9',
                    reimburseableLink: '\u81EA\u638F\u8170\u5305\u7684\u8D39\u7528',
                    nonReimbursableLink: '\u516C\u53F8\u5361\u8D39\u7528',
                    pending: ({label}: ExportedToIntegrationParams) => `\u5F00\u59CB\u5C06\u6B64\u62A5\u544A\u5BFC\u51FA\u5230${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `\u65E0\u6CD5\u5C06\u6B64\u62A5\u544A\u5BFC\u51FA\u5230${label}\uFF08"${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}"\uFF09`,
                managerAttachReceipt: `\u6DFB\u52A0\u4E86\u4E00\u5F20\u6536\u636E`,
                managerDetachReceipt: `\u5220\u9664\u4E86\u4E00\u5F20\u6536\u636E`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `\u5728\u5176\u4ED6\u5730\u65B9\u652F\u4ED8\u4E86${currency}${amount}`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `\u901A\u8FC7\u96C6\u6210\u652F\u4ED8\u4E86${currency}${amount}`,
                outdatedBankAccount: `\u7531\u4E8E\u4ED8\u6B3E\u4EBA\u94F6\u884C\u8D26\u6237\u7684\u95EE\u9898\uFF0C\u65E0\u6CD5\u5904\u7406\u4ED8\u6B3E\u3002`,
                reimbursementACHBounce: `\u65E0\u6CD5\u5904\u7406\u4ED8\u6B3E\uFF0C\u56E0\u4E3A\u4ED8\u6B3E\u4EBA\u8D44\u91D1\u4E0D\u8DB3\u3002`,
                reimbursementACHCancelled: `\u53D6\u6D88\u4E86\u4ED8\u6B3E`,
                reimbursementAccountChanged: `\u65E0\u6CD5\u5904\u7406\u4ED8\u6B3E\uFF0C\u56E0\u4E3A\u4ED8\u6B3E\u4EBA\u66F4\u6362\u4E86\u94F6\u884C\u8D26\u6237\u3002`,
                reimbursementDelayed: `\u5DF2\u5904\u7406\u4ED8\u6B3E\uFF0C\u4F46\u5EF6\u8FDF\u4E861-2\u4E2A\u5DE5\u4F5C\u65E5\u3002`,
                selectedForRandomAudit: `\u968F\u673A\u62BD\u9009\u8FDB\u884C\u5BA1\u6838`,
                selectedForRandomAuditMarkdown: `[\u968F\u673A\u9009\u62E9](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)\u8FDB\u884C\u5BA1\u6838`,
                share: ({to}: ShareParams) => `\u9080\u8BF7\u6210\u5458 ${to}`,
                unshare: ({to}: UnshareParams) => `\u5DF2\u79FB\u9664\u6210\u5458 ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `\u652F\u4ED8 ${currency}${amount}`,
                takeControl: `\u63A5\u7BA1\u4E86`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) =>
                    `\u65E0\u6CD5\u4E0E${label}${errorMessage ? ` ("${errorMessage}")` : ''}\u540C\u6B65\u5931\u8D25`,
                addEmployee: ({email, role}: AddEmployeeParams) => `\u5DF2\u5C06${email}\u6DFB\u52A0\u4E3A${role === 'member' ? 'a' : '\u4E00\u4E2A'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) =>
                    `\u5C06 ${email} \u7684\u89D2\u8272\u66F4\u65B0\u4E3A ${newRole}\uFF08\u4E4B\u524D\u662F ${currentRole}\uFF09`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `\u79FB\u9664\u4E86 ${email} \u7684\u81EA\u5B9A\u4E49\u5B57\u6BB5 1\uFF08\u4E4B\u524D\u4E3A "${previousValue}"\uFF09`;
                    }
                    return !previousValue
                        ? `\u5C06\u201C${newValue}\u201D\u6DFB\u52A0\u5230${email}\u7684\u81EA\u5B9A\u4E49\u5B57\u6BB51`
                        : `\u5C06 ${email} \u7684\u81EA\u5B9A\u4E49\u5B57\u6BB51\u66F4\u6539\u4E3A "${newValue}"\uFF08\u4E4B\u524D\u4E3A "${previousValue}"\uFF09`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `\u5220\u9664\u4E86 ${email} \u7684\u81EA\u5B9A\u4E49\u5B57\u6BB5 2\uFF08\u4E4B\u524D\u4E3A "${previousValue}"\uFF09`;
                    }
                    return !previousValue
                        ? `\u5C06\u201C${newValue}\u201D\u6DFB\u52A0\u5230${email}\u7684\u81EA\u5B9A\u4E49\u5B57\u6BB52`
                        : `\u5C06 ${email} \u7684\u81EA\u5B9A\u4E49\u5B57\u6BB52\u66F4\u6539\u4E3A "${newValue}"\uFF08\u4E4B\u524D\u4E3A "${previousValue}"\uFF09`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} \u79BB\u5F00\u4E86\u5DE5\u4F5C\u533A`,
                removeMember: ({email, role}: AddEmployeeParams) => `\u5DF2\u79FB\u9664 ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `\u5DF2\u79FB\u9664\u4E0E${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}\u7684\u8FDE\u63A5`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `\u8FDE\u63A5\u5230${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: '\u79BB\u5F00\u4E86\u804A\u5929',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} \u4E3A ${dayCount} ${dayCount === 1 ? '\u5929' : '\u5929'} \u76F4\u5230 ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} \u4ECE ${timePeriod} \u4E8E ${date}`,
    },
    footer: {
        features: '\u529F\u80FD',
        expenseManagement: '\u8D39\u7528\u7BA1\u7406',
        spendManagement: '\u652F\u51FA\u7BA1\u7406',
        expenseReports: '\u8D39\u7528\u62A5\u544A',
        companyCreditCard: '\u516C\u53F8\u4FE1\u7528\u5361',
        receiptScanningApp: '\u6536\u636E\u626B\u63CF\u5E94\u7528\u7A0B\u5E8F',
        billPay: '\u8D26\u5355\u652F\u4ED8',
        invoicing: '\u5F00\u7968',
        CPACard: 'CPA\u5361\u7247',
        payroll: '\u5DE5\u8D44\u5355',
        travel: '\u65C5\u884C',
        resources: '\u8D44\u6E90',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: '\u65B0\u95FB\u8D44\u6599\u5305',
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
        getStarted: '\u5F00\u59CB\u4F7F\u7528',
        createAccount: '\u521B\u5EFA\u65B0\u8D26\u6237',
        logIn: '\u767B\u5F55',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '\u5BFC\u822A\u56DE\u804A\u5929\u5217\u8868',
        chatWelcomeMessage: '\u804A\u5929\u6B22\u8FCE\u4FE1\u606F',
        navigatesToChat: '\u5BFC\u822A\u5230\u804A\u5929',
        newMessageLineIndicator: '\u65B0\u6D88\u606F\u884C\u6307\u793A\u5668',
        chatMessage: '\u804A\u5929\u6D88\u606F',
        lastChatMessagePreview: '\u6700\u540E\u804A\u5929\u6D88\u606F\u9884\u89C8',
        workspaceName: '\u5DE5\u4F5C\u533A\u540D\u79F0',
        chatUserDisplayNames: '\u804A\u5929\u6210\u5458\u663E\u793A\u540D\u79F0',
        scrollToNewestMessages: '\u6EDA\u52A8\u5230\u6700\u65B0\u6D88\u606F',
        preStyledText: '\u9884\u8BBE\u6837\u5F0F\u6587\u672C',
        viewAttachment: '\u67E5\u770B\u9644\u4EF6',
    },
    parentReportAction: {
        deletedReport: '\u5DF2\u5220\u9664\u7684\u62A5\u544A',
        deletedMessage: '\u5DF2\u5220\u9664\u6D88\u606F',
        deletedExpense: '\u5DF2\u5220\u9664\u7684\u8D39\u7528',
        reversedTransaction: '\u5DF2\u64A4\u9500\u4EA4\u6613',
        deletedTask: '\u5DF2\u5220\u9664\u4EFB\u52A1',
        hiddenMessage: '\u9690\u85CF\u4FE1\u606F',
    },
    threads: {
        thread: '\u7EBF\u7A0B',
        replies: '\u56DE\u590D',
        reply: '\u56DE\u590D',
        from: '\u4ECE',
        in: '\u5728',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `\u6765\u81EA${reportName}${workspaceName ? `\u5728${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: '\u590D\u5236\u7F51\u5740',
        copied: '\u5DF2\u590D\u5236\uFF01',
    },
    moderation: {
        flagDescription: '\u6240\u6709\u88AB\u6807\u8BB0\u7684\u6D88\u606F\u5C06\u88AB\u53D1\u9001\u7ED9\u7BA1\u7406\u5458\u5BA1\u6838\u3002',
        chooseAReason: '\u9009\u62E9\u4E00\u4E2A\u6807\u8BB0\u539F\u56E0\uFF1A',
        spam: '\u5783\u573E\u90AE\u4EF6',
        spamDescription: '\u672A\u7ECF\u8BF7\u6C42\u7684\u65E0\u5173\u4FC3\u9500',
        inconsiderate: '\u4E0D\u4F53\u8C05\u7684',
        inconsiderateDescription: '\u4FAE\u8FB1\u6027\u6216\u4E0D\u5C0A\u91CD\u7684\u63AA\u8F9E\uFF0C\u610F\u56FE\u53EF\u7591',
        intimidation: '\u6050\u5413',
        intimidationDescription: '\u5728\u6709\u6548\u53CD\u5BF9\u610F\u89C1\u4E0B\u79EF\u6781\u63A8\u8FDB\u8BAE\u7A0B',
        bullying: '\u6B3A\u51CC',
        bullyingDescription: '\u9488\u5BF9\u4E2A\u4EBA\u4EE5\u83B7\u5F97\u670D\u4ECE',
        harassment: '\u9A9A\u6270',
        harassmentDescription: '\u79CD\u65CF\u4E3B\u4E49\u3001\u538C\u5973\u6216\u5176\u4ED6\u5E7F\u6CDB\u6B67\u89C6\u6027\u884C\u4E3A',
        assault: '\u653B\u51FB',
        assaultDescription: '\u4E13\u95E8\u9488\u5BF9\u7684\u60C5\u611F\u653B\u51FB\uFF0C\u610F\u56FE\u9020\u6210\u4F24\u5BB3',
        flaggedContent: '\u6B64\u6D88\u606F\u5DF2\u88AB\u6807\u8BB0\u4E3A\u8FDD\u53CD\u6211\u4EEC\u7684\u793E\u533A\u89C4\u5219\uFF0C\u5185\u5BB9\u5DF2\u88AB\u9690\u85CF\u3002',
        hideMessage: '\u9690\u85CF\u6D88\u606F',
        revealMessage: '\u663E\u793A\u6D88\u606F',
        levelOneResult: '\u53D1\u9001\u533F\u540D\u8B66\u544A\uFF0C\u6D88\u606F\u5C06\u88AB\u62A5\u544A\u4EE5\u4F9B\u5BA1\u67E5\u3002',
        levelTwoResult: '\u6D88\u606F\u5DF2\u4ECE\u9891\u9053\u4E2D\u9690\u85CF\uFF0C\u5E76\u9644\u6709\u533F\u540D\u8B66\u544A\uFF0C\u6D88\u606F\u5DF2\u63D0\u4EA4\u5BA1\u6838\u3002',
        levelThreeResult:
            '\u6D88\u606F\u5DF2\u4ECE\u9891\u9053\u4E2D\u79FB\u9664\uFF0C\u5E76\u6536\u5230\u533F\u540D\u8B66\u544A\uFF0C\u6D88\u606F\u5DF2\u88AB\u62A5\u544A\u4EE5\u4F9B\u5BA1\u6838\u3002',
    },
    actionableMentionWhisperOptions: {
        invite: '\u9080\u8BF7\u4ED6\u4EEC',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '\u63A5\u53D7',
        decline: '\u62D2\u7EDD',
    },
    actionableMentionTrackExpense: {
        submit: '\u63D0\u4EA4\u7ED9\u67D0\u4EBA',
        categorize: '\u5206\u7C7B\u5B83',
        share: '\u4E0E\u6211\u7684\u4F1A\u8BA1\u5171\u4EAB',
        nothing: '\u6682\u65F6\u6CA1\u6709',
    },
    teachersUnitePage: {
        teachersUnite: '\u6559\u5E08\u8054\u5408\u4F1A',
        joinExpensifyOrg:
            '\u52A0\u5165 Expensify.org\uFF0C\u6D88\u9664\u4E16\u754C\u5404\u5730\u7684\u4E0D\u516C\u6B63\u73B0\u8C61\u3002\u76EE\u524D\u7684\u201C\u6559\u5E08\u8054\u5408\u201D\u8FD0\u52A8\u901A\u8FC7\u5206\u62C5\u57FA\u672C\u5B66\u6821\u7528\u54C1\u7684\u8D39\u7528\u6765\u652F\u6301\u5404\u5730\u7684\u6559\u80B2\u5DE5\u4F5C\u8005\u3002',
        iKnowATeacher: '\u6211\u8BA4\u8BC6\u4E00\u4F4D\u8001\u5E08',
        iAmATeacher: '\u6211\u662F\u8001\u5E08',
        getInTouch: '\u592A\u597D\u4E86\uFF01\u8BF7\u5206\u4EAB\u4ED6\u4EEC\u7684\u4FE1\u606F\uFF0C\u4EE5\u4FBF\u6211\u4EEC\u53EF\u4EE5\u4E0E\u4ED6\u4EEC\u53D6\u5F97\u8054\u7CFB\u3002',
        introSchoolPrincipal: '\u4ECB\u7ECD\u60A8\u7684\u6821\u957F',
        schoolPrincipalVerifyExpense:
            'Expensify.org \u5206\u62C5\u57FA\u672C\u5B66\u4E60\u7528\u54C1\u7684\u8D39\u7528\uFF0C\u4EE5\u4FBF\u4F4E\u6536\u5165\u5BB6\u5EAD\u7684\u5B66\u751F\u80FD\u591F\u83B7\u5F97\u66F4\u597D\u7684\u5B66\u4E60\u4F53\u9A8C\u3002\u60A8\u7684\u6821\u957F\u5C06\u88AB\u8981\u6C42\u6838\u5B9E\u60A8\u7684\u8D39\u7528\u3002',
        principalFirstName: '\u540D\u8D1F\u8D23\u4EBA',
        principalLastName: '\u6821\u957F\u59D3\u6C0F',
        principalWorkEmail: '\u4E3B\u8981\u5DE5\u4F5C\u90AE\u7BB1',
        updateYourEmail: '\u66F4\u65B0\u60A8\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
        updateEmail: '\u66F4\u65B0\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
        contactMethods: '\u8054\u7CFB\u65B9\u5F0F\u3002',
        schoolMailAsDefault:
            '\u5728\u7EE7\u7EED\u4E4B\u524D\uFF0C\u8BF7\u786E\u4FDD\u5C06\u60A8\u7684\u5B66\u6821\u7535\u5B50\u90AE\u4EF6\u8BBE\u7F6E\u4E3A\u9ED8\u8BA4\u8054\u7CFB\u65B9\u5F0F\u3002\u60A8\u53EF\u4EE5\u5728 \u8BBE\u7F6E > \u4E2A\u4EBA\u8D44\u6599 \u4E2D\u8FDB\u884C\u8BBE\u7F6E\u3002',
        error: {
            enterPhoneEmail: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6\u6216\u7535\u8BDD\u53F7\u7801',
            enterEmail: '\u8F93\u5165\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
            enterValidEmail: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
            tryDifferentEmail: '\u8BF7\u5C1D\u8BD5\u4F7F\u7528\u5176\u4ED6\u7535\u5B50\u90AE\u4EF6',
        },
    },
    cardTransactions: {
        notActivated: '\u672A\u6FC0\u6D3B',
        outOfPocket: '\u81EA\u638F\u8170\u5305\u7684\u652F\u51FA',
        companySpend: '\u516C\u53F8\u652F\u51FA',
    },
    distance: {
        addStop: '\u6DFB\u52A0\u7AD9\u70B9',
        deleteWaypoint: '\u5220\u9664\u822A\u70B9',
        deleteWaypointConfirmation: '\u60A8\u786E\u5B9A\u8981\u5220\u9664\u6B64\u822A\u70B9\u5417\uFF1F',
        address: '\u5730\u5740',
        waypointDescription: {
            start: '\u5F00\u59CB',
            stop: '\u505C\u6B62',
        },
        mapPending: {
            title: '\u6620\u5C04\u5F85\u5904\u7406',
            subtitle: '\u5F53\u60A8\u91CD\u65B0\u8054\u7F51\u65F6\uFF0C\u5730\u56FE\u5C06\u4F1A\u751F\u6210\u3002',
            onlineSubtitle: '\u8BF7\u7A0D\u7B49\uFF0C\u6211\u4EEC\u6B63\u5728\u8BBE\u7F6E\u5730\u56FE\u3002',
            errorTitle: '\u5730\u56FE\u9519\u8BEF',
            errorSubtitle: '\u52A0\u8F7D\u5730\u56FE\u65F6\u51FA\u9519\u3002\u8BF7\u91CD\u8BD5\u3002',
        },
        error: {
            selectSuggestedAddress: '\u8BF7\u9009\u62E9\u4E00\u4E2A\u5EFA\u8BAE\u7684\u5730\u5740\u6216\u4F7F\u7528\u5F53\u524D\u4F4D\u7F6E',
        },
    },
    reportCardLostOrDamaged: {
        report: '\u62A5\u544A\u5B9E\u4F53\u5361\u4E22\u5931/\u635F\u574F',
        screenTitle: '\u6210\u7EE9\u5355\u4E22\u5931\u6216\u635F\u574F',
        nextButtonLabel: '\u4E0B\u4E00\u4E2A',
        reasonTitle: '\u4F60\u4E3A\u4EC0\u4E48\u9700\u8981\u4E00\u5F20\u65B0\u5361\uFF1F',
        cardDamaged: '\u6211\u7684\u5361\u88AB\u635F\u574F\u4E86',
        cardLostOrStolen: '\u6211\u7684\u5361\u4E22\u5931\u6216\u88AB\u76D7\u4E86',
        confirmAddressTitle: '\u8BF7\u786E\u8BA4\u60A8\u7684\u65B0\u5361\u90AE\u5BC4\u5730\u5740\u3002',
        cardDamagedInfo:
            '\u60A8\u7684\u65B0\u5361\u5C06\u57282-3\u4E2A\u5DE5\u4F5C\u65E5\u5185\u5230\u8FBE\u3002\u5728\u60A8\u6FC0\u6D3B\u65B0\u5361\u4E4B\u524D\uFF0C\u60A8\u5F53\u524D\u7684\u5361\u5C06\u7EE7\u7EED\u6709\u6548\u3002',
        cardLostOrStolenInfo:
            '\u60A8\u7684\u5F53\u524D\u5361\u7247\u5C06\u5728\u4E0B\u5355\u540E\u6C38\u4E45\u505C\u7528\u3002\u5927\u591A\u6570\u5361\u7247\u4F1A\u5728\u51E0\u4E2A\u5DE5\u4F5C\u65E5\u5185\u9001\u8FBE\u3002',
        address: '\u5730\u5740',
        deactivateCardButton: '\u505C\u7528\u5361\u7247',
        shipNewCardButton: '\u53D1\u9001\u65B0\u5361',
        addressError: '\u5730\u5740\u662F\u5FC5\u9700\u7684',
        reasonError: '\u539F\u56E0\u662F\u5FC5\u9700\u7684',
    },
    eReceipt: {
        guaranteed: '\u4FDD\u8BC1\u7684\u7535\u5B50\u6536\u636E',
        transactionDate: '\u4EA4\u6613\u65E5\u671F',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: '\u5F00\u59CB\u804A\u5929\uFF0C',
            buttonText2: '\u63A8\u8350\u670B\u53CB\u3002',
            header: '\u5F00\u59CB\u804A\u5929\uFF0C\u63A8\u8350\u670B\u53CB',
            body: '\u60F3\u8BA9\u4F60\u7684\u670B\u53CB\u4E5F\u4F7F\u7528Expensify\u5417\uFF1F\u53EA\u9700\u4E0E\u4ED6\u4EEC\u5F00\u59CB\u804A\u5929\uFF0C\u6211\u4EEC\u4F1A\u5904\u7406\u5269\u4E0B\u7684\u4E8B\u60C5\u3002',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: '\u63D0\u4EA4\u62A5\u9500\uFF0C',
            buttonText2: '\u63A8\u8350\u4F60\u7684\u8001\u677F\u3002',
            header: '\u63D0\u4EA4\u62A5\u9500\uFF0C\u63A8\u8350\u7ED9\u4F60\u7684\u8001\u677F',
            body: '\u60F3\u8BA9\u4F60\u7684\u8001\u677F\u4E5F\u4F7F\u7528Expensify\u5417\uFF1F\u53EA\u9700\u5411\u4ED6\u4EEC\u63D0\u4EA4\u4E00\u7B14\u8D39\u7528\uFF0C\u5176\u4F59\u7684\u6211\u4EEC\u4F1A\u5904\u7406\u3002',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '\u63A8\u8350\u670B\u53CB',
            body: '\u60F3\u8BA9\u4F60\u7684\u670B\u53CB\u4E5F\u4F7F\u7528Expensify\u5417\uFF1F\u53EA\u9700\u4E0E\u4ED6\u4EEC\u804A\u5929\u3001\u4ED8\u6B3E\u6216\u5206\u644A\u8D39\u7528\uFF0C\u5176\u4F59\u7684\u6211\u4EEC\u6765\u5904\u7406\u3002\u6216\u8005\u76F4\u63A5\u5206\u4EAB\u4F60\u7684\u9080\u8BF7\u94FE\u63A5\uFF01',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '\u63A8\u8350\u670B\u53CB',
            header: '\u63A8\u8350\u670B\u53CB',
            body: '\u60F3\u8BA9\u4F60\u7684\u670B\u53CB\u4E5F\u4F7F\u7528Expensify\u5417\uFF1F\u53EA\u9700\u4E0E\u4ED6\u4EEC\u804A\u5929\u3001\u4ED8\u6B3E\u6216\u5206\u644A\u8D39\u7528\uFF0C\u5176\u4F59\u7684\u6211\u4EEC\u6765\u5904\u7406\u3002\u6216\u8005\u76F4\u63A5\u5206\u4EAB\u4F60\u7684\u9080\u8BF7\u94FE\u63A5\uFF01',
        },
        copyReferralLink: '\u590D\u5236\u9080\u8BF7\u94FE\u63A5',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: '\u4E0E\u60A8\u7684\u8BBE\u7F6E\u4E13\u5BB6\u804A\u5929',
            phrase2: '\u5E2E\u52A9',
        },
        default: {
            phrase1: '\u6D88\u606F',
            phrase2: '\u6709\u5173\u8BBE\u7F6E\u7684\u5E2E\u52A9',
        },
    },
    violations: {
        allTagLevelsRequired: '\u6240\u6709\u6807\u7B7E\u5747\u4E3A\u5FC5\u586B\u9879',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) =>
            `${rejectedBy} \u62D2\u7EDD\u4E86\u6B64\u8D39\u7528\uFF0C\u5E76\u9644\u4E0A\u8BC4\u8BBA\u201C${rejectReason}\u201D`,
        billableExpense: '\u53EF\u8BA1\u8D39\u9879\u4E0D\u518D\u6709\u6548',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `\u9700\u8981\u6536\u636E${formattedLimit ? `\u8D85\u8FC7${formattedLimit}` : ''}`,
        categoryOutOfPolicy: '\u7C7B\u522B\u4E0D\u518D\u6709\u6548',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `\u5DF2\u5E94\u7528${surcharge}%\u7684\u8F6C\u6362\u9644\u52A0\u8D39`,
        customUnitOutOfPolicy: '\u6B64\u5DE5\u4F5C\u533A\u7684\u8D39\u7387\u65E0\u6548',
        duplicatedTransaction: '\u91CD\u590D',
        fieldRequired: '\u62A5\u544A\u5B57\u6BB5\u662F\u5FC5\u9700\u7684',
        futureDate: '\u4E0D\u5141\u8BB8\u672A\u6765\u65E5\u671F',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `\u52A0\u4EF7 ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `\u65E5\u671F\u8D85\u8FC7${maxAge}\u5929`,
        missingCategory: '\u7F3A\u5C11\u7C7B\u522B',
        missingComment: '\u6240\u9009\u7C7B\u522B\u9700\u8981\u63CF\u8FF0',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `\u7F3A\u5C11${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '\u91D1\u989D\u4E0E\u8BA1\u7B97\u7684\u8DDD\u79BB\u4E0D\u540C';
                case 'card':
                    return '\u91D1\u989D\u5927\u4E8E\u5361\u4EA4\u6613';
                default:
                    if (displayPercentVariance) {
                        return `\u91D1\u989D\u6BD4\u626B\u63CF\u7684\u6536\u636E\u591A ${displayPercentVariance}%`;
                    }
                    return '\u91D1\u989D\u5927\u4E8E\u626B\u63CF\u7684\u6536\u636E';
            }
        },
        modifiedDate: '\u65E5\u671F\u4E0E\u626B\u63CF\u7684\u6536\u636E\u4E0D\u7B26',
        nonExpensiworksExpense: '\u975EExpensiworks\u8D39\u7528',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `\u8D39\u7528\u8D85\u51FA\u4E86\u81EA\u52A8\u6279\u51C6\u9650\u989D ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `\u91D1\u989D\u8D85\u8FC7\u6BCF\u4EBA\u7C7B\u522B\u9650\u5236 ${formattedLimit}`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `\u91D1\u989D\u8D85\u8FC7${formattedLimit}/\u4EBA\u9650\u5236`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `\u91D1\u989D\u8D85\u8FC7${formattedLimit}/\u4EBA\u9650\u5236`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `\u91D1\u989D\u8D85\u8FC7\u6BCF\u65E5 ${formattedLimit}/\u4EBA\u7C7B\u522B\u9650\u5236`,
        receiptNotSmartScanned:
            '\u8D39\u7528\u8BE6\u60C5\u548C\u6536\u636E\u5DF2\u624B\u52A8\u6DFB\u52A0\u3002\u8BF7\u6838\u5B9E\u8BE6\u60C5\u3002<a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">\u4E86\u89E3\u66F4\u591A</a>\u5173\u4E8E\u6240\u6709\u6536\u636E\u7684\u81EA\u52A8\u5BA1\u6838\u3002',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = '\u9700\u8981\u6536\u636E';
            if (formattedLimit ?? category) {
                message += '\u7ED3\u675F';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += '\u7C7B\u522B\u9650\u5236';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = '\u7981\u6B62\u7684\u8D39\u7528\uFF1A';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} \u9152\u7CBE`;
                case 'gambling':
                    return `${preMessage} \u8D4C\u535A`;
                case 'tobacco':
                    return `${preMessage} \u70DF\u8349`;
                case 'adultEntertainment':
                    return `${preMessage} \u6210\u4EBA\u5A31\u4E50`;
                case 'hotelIncidentals':
                    return `${preMessage} \u9152\u5E97\u6742\u8D39`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: '\u9700\u8981\u5BA1\u6838',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u65E0\u6CD5\u81EA\u52A8\u5339\u914D\u6536\u636E\uFF0C\u9700\u8981${email}\u4FEE\u590D\u3002`
                    : '\u7531\u4E8E\u9700\u8981\u4FEE\u590D\u7684\u94F6\u884C\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u65E0\u6CD5\u81EA\u52A8\u5339\u914D\u6536\u636E\u3002';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? `\u8BF7${member}\u6807\u8BB0\u4E3A\u73B0\u91D1\uFF0C\u6216\u7B49\u5F857\u5929\u540E\u91CD\u8BD5\u3002`
                    : '\u7B49\u5F85\u4E0E\u5361\u4EA4\u6613\u5408\u5E76\u3002';
            }
            return '';
        },
        brokenConnection530Error: '\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u6536\u636E\u5F85\u5904\u7406',
        adminBrokenConnectionError: '\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u6536\u636E\u5F85\u5904\u7406\u3002\u8BF7\u89E3\u51B3',
        memberBrokenConnectionError:
            '\u7531\u4E8E\u94F6\u884C\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u6536\u636E\u5F85\u5904\u7406\u3002\u8BF7\u8054\u7CFB\u5DE5\u4F5C\u533A\u7BA1\u7406\u5458\u89E3\u51B3\u3002',
        markAsCashToIgnore: '\u6807\u8BB0\u4E3A\u73B0\u91D1\u4EE5\u5FFD\u7565\u5E76\u8BF7\u6C42\u4ED8\u6B3E\u3002',
        smartscanFailed: ({canEdit = true}) => `\u6536\u636E\u626B\u63CF\u5931\u8D25\u3002${canEdit ? '\u624B\u52A8\u8F93\u5165\u8BE6\u7EC6\u4FE1\u606F\u3002' : ''}`,
        receiptGeneratedWithAI: '\u6F5C\u5728\u7684AI\u751F\u6210\u6536\u636E',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `\u7F3A\u5C11 ${tagName ?? '\u6807\u7B7E'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? '\u6807\u7B7E'} \u4E0D\u518D\u6709\u6548`,
        taxAmountChanged: '\u7A0E\u989D\u5DF2\u4FEE\u6539',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? '\u7A0E\u52A1'} \u4E0D\u518D\u6709\u6548`,
        taxRateChanged: '\u7A0E\u7387\u5DF2\u4FEE\u6539',
        taxRequired: '\u7F3A\u5C11\u7A0E\u7387',
        none: 'None',
        taxCodeToKeep: '\u9009\u62E9\u4FDD\u7559\u54EA\u4E2A\u7A0E\u7801',
        tagToKeep: '\u9009\u62E9\u4FDD\u7559\u54EA\u4E2A\u6807\u7B7E',
        isTransactionReimbursable: '\u9009\u62E9\u4EA4\u6613\u662F\u5426\u53EF\u62A5\u9500',
        merchantToKeep: '\u9009\u62E9\u8981\u4FDD\u7559\u7684\u5546\u5BB6',
        descriptionToKeep: '\u9009\u62E9\u4FDD\u7559\u54EA\u4E2A\u63CF\u8FF0',
        categoryToKeep: '\u9009\u62E9\u8981\u4FDD\u7559\u7684\u7C7B\u522B',
        isTransactionBillable: '\u9009\u62E9\u4EA4\u6613\u662F\u5426\u53EF\u8BA1\u8D39',
        keepThisOne: '\u4FDD\u7559\u8FD9\u4E2A',
        confirmDetails: `\u786E\u8BA4\u60A8\u4FDD\u7559\u7684\u8BE6\u7EC6\u4FE1\u606F`,
        confirmDuplicatesInfo: `\u60A8\u4E0D\u4FDD\u7559\u7684\u91CD\u590D\u8BF7\u6C42\u5C06\u7531\u6210\u5458\u5220\u9664\u3002`,
        hold: '\u6B64\u8D39\u7528\u5DF2\u88AB\u6401\u7F6E',
        resolvedDuplicates: '\u5DF2\u89E3\u51B3\u91CD\u590D\u9879',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName}\u662F\u5FC5\u9700\u7684`,
    },
    violationDismissal: {
        rter: {
            manual: '\u5C06\u6B64\u6536\u636E\u6807\u8BB0\u4E3A\u73B0\u91D1',
        },
        duplicatedTransaction: {
            manual: '\u5DF2\u89E3\u51B3\u91CD\u590D\u9879',
        },
    },
    videoPlayer: {
        play: '\u64AD\u653E',
        pause: '\u6682\u505C',
        fullscreen: '\u5168\u5C4F',
        playbackSpeed: '\u64AD\u653E\u901F\u5EA6',
        expand: '\u5C55\u5F00',
        mute: '\u9759\u97F3',
        unmute: '\u53D6\u6D88\u9759\u97F3',
        normal: '\u6B63\u5E38',
    },
    exitSurvey: {
        header: '\u5728\u60A8\u79BB\u5F00\u4E4B\u524D',
        reasonPage: {
            title: '\u8BF7\u544A\u8BC9\u6211\u4EEC\u60A8\u79BB\u5F00\u7684\u539F\u56E0',
            subtitle: '\u5728\u60A8\u79BB\u5F00\u4E4B\u524D\uFF0C\u8BF7\u544A\u8BC9\u6211\u4EEC\u60A8\u4E3A\u4EC0\u4E48\u60F3\u5207\u6362\u5230 Expensify Classic\u3002',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '\u6211\u9700\u8981\u4E00\u4E2A\u4EC5\u5728Expensify Classic\u4E2D\u53EF\u7528\u7684\u529F\u80FD\u3002',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '\u6211\u4E0D\u660E\u767D\u5982\u4F55\u4F7F\u7528 New Expensify\u3002',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '\u6211\u4E86\u89E3\u5982\u4F55\u4F7F\u7528 New Expensify\uFF0C\u4F46\u6211\u66F4\u559C\u6B22 Expensify Classic\u3002',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: '\u5728 New Expensify \u4E2D\uFF0C\u60A8\u9700\u8981\u54EA\u4E9B\u5C1A\u4E0D\u53EF\u7528\u7684\u529F\u80FD\uFF1F',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '\u4F60\u60F3\u505A\u4EC0\u4E48\uFF1F',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '\u4F60\u4E3A\u4EC0\u4E48\u66F4\u559C\u6B22Expensify Classic\uFF1F',
        },
        responsePlaceholder: '\u60A8\u7684\u56DE\u590D',
        thankYou: '\u611F\u8C22\u60A8\u7684\u53CD\u9988\uFF01',
        thankYouSubtitle:
            '\u60A8\u7684\u53CD\u9988\u5C06\u5E2E\u52A9\u6211\u4EEC\u6253\u9020\u66F4\u597D\u7684\u4EA7\u54C1\u6765\u5B8C\u6210\u4EFB\u52A1\u3002\u975E\u5E38\u611F\u8C22\uFF01',
        goToExpensifyClassic: '\u5207\u6362\u5230 Expensify Classic',
        offlineTitle: '\u770B\u8D77\u6765\u4F60\u88AB\u5361\u5728\u8FD9\u91CC\u4E86\u2026\u2026',
        offline:
            '\u60A8\u4F3C\u4E4E\u5904\u4E8E\u79BB\u7EBF\u72B6\u6001\u3002\u4E0D\u5E78\u7684\u662F\uFF0CExpensify Classic \u65E0\u6CD5\u79BB\u7EBF\u4F7F\u7528\uFF0C\u4F46 New Expensify \u53EF\u4EE5\u3002\u5982\u679C\u60A8\u66F4\u559C\u6B22\u4F7F\u7528 Expensify Classic\uFF0C\u8BF7\u5728\u6709\u4E92\u8054\u7F51\u8FDE\u63A5\u65F6\u91CD\u8BD5\u3002',
        quickTip: '\u5C0F\u63D0\u793A...',
        quickTipSubTitle:
            '\u60A8\u53EF\u4EE5\u901A\u8FC7\u8BBF\u95EE expensify.com \u76F4\u63A5\u8FDB\u5165 Expensify Classic\u3002\u5C06\u5176\u52A0\u5165\u4E66\u7B7E\u4EE5\u4FBF\u6377\u8BBF\u95EE\uFF01',
        bookACall: '\u9884\u7EA6\u901A\u8BDD',
        noThanks: '\u4E0D\uFF0C\u8C22\u8C22',
        bookACallTitle: '\u60A8\u60F3\u4E0E\u4EA7\u54C1\u7ECF\u7406\u4EA4\u8C08\u5417\uFF1F',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '\u76F4\u63A5\u5728\u8D39\u7528\u548C\u62A5\u544A\u4E0A\u804A\u5929',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '\u80FD\u591F\u5728\u624B\u673A\u4E0A\u5B8C\u6210\u6240\u6709\u64CD\u4F5C',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '\u4EE5\u804A\u5929\u7684\u901F\u5EA6\u8FDB\u884C\u5DEE\u65C5\u548C\u62A5\u9500',
        },
        bookACallTextTop: '\u5207\u6362\u5230 Expensify Classic \u540E\uFF0C\u60A8\u5C06\u9519\u8FC7\uFF1A',
        bookACallTextBottom:
            '\u6211\u4EEC\u5F88\u9AD8\u5174\u80FD\u4E0E\u60A8\u901A\u8BDD\u4EE5\u4E86\u89E3\u539F\u56E0\u3002\u60A8\u53EF\u4EE5\u9884\u7EA6\u4E0E\u6211\u4EEC\u7684\u4E00\u4F4D\u9AD8\u7EA7\u4EA7\u54C1\u7ECF\u7406\u901A\u8BDD\uFF0C\u8BA8\u8BBA\u60A8\u7684\u9700\u6C42\u3002',
        takeMeToExpensifyClassic: '\u5E26\u6211\u53BBExpensify Classic',
    },
    listBoundary: {
        errorMessage: '\u52A0\u8F7D\u66F4\u591A\u6D88\u606F\u65F6\u53D1\u751F\u9519\u8BEF',
        tryAgain: '\u518D\u8BD5\u4E00\u6B21',
    },
    systemMessage: {
        mergedWithCashTransaction: '\u5C06\u6536\u636E\u4E0E\u6B64\u4EA4\u6613\u5339\u914D',
    },
    subscription: {
        authenticatePaymentCard: '\u9A8C\u8BC1\u652F\u4ED8\u5361',
        mobileReducedFunctionalityMessage: '\u60A8\u65E0\u6CD5\u5728\u79FB\u52A8\u5E94\u7528\u4E2D\u66F4\u6539\u8BA2\u9605\u3002',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `\u514D\u8D39\u8BD5\u7528\uFF1A\u5269\u4F59 ${numOfDays} ${numOfDays === 1 ? '\u5929' : '\u5929'} \u5929`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u4FE1\u606F\u5DF2\u8FC7\u671F',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `\u8BF7\u5728${date}\u4E4B\u524D\u66F4\u65B0\u60A8\u7684\u652F\u4ED8\u5361\uFF0C\u4EE5\u7EE7\u7EED\u4F7F\u7528\u60A8\u6240\u6709\u559C\u7231\u7684\u529F\u80FD\u3002`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u65E0\u6CD5\u5904\u7406',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `\u60A8\u5728${date}\u7684${purchaseAmountOwed}\u8D39\u7528\u65E0\u6CD5\u5904\u7406\u3002\u8BF7\u6DFB\u52A0\u4ED8\u6B3E\u5361\u4EE5\u6E05\u9664\u6B20\u6B3E\u3002`
                        : '\u8BF7\u6DFB\u52A0\u4E00\u5F20\u652F\u4ED8\u5361\u4EE5\u6E05\u9664\u6B20\u6B3E\u3002',
            },
            policyOwnerUnderInvoicing: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u4FE1\u606F\u5DF2\u8FC7\u671F',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `\u60A8\u7684\u4ED8\u6B3E\u5DF2\u903E\u671F\u3002\u8BF7\u5728${date}\u4E4B\u524D\u652F\u4ED8\u60A8\u7684\u53D1\u7968\uFF0C\u4EE5\u907F\u514D\u670D\u52A1\u4E2D\u65AD\u3002`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '\u60A8\u7684\u4ED8\u6B3E\u4FE1\u606F\u5DF2\u8FC7\u671F',
                subtitle: '\u60A8\u7684\u4ED8\u6B3E\u5DF2\u903E\u671F\u3002\u8BF7\u652F\u4ED8\u60A8\u7684\u53D1\u7968\u3002',
            },
            billingDisputePending: {
                title: '\u65E0\u6CD5\u6263\u6B3E\u60A8\u7684\u5361\u7247',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `\u60A8\u5BF9\u4EE5${cardEnding}\u7ED3\u5C3E\u7684\u5361\u4E0A\u7684${amountOwed}\u8D39\u7528\u63D0\u51FA\u4E86\u5F02\u8BAE\u3002\u5728\u4E0E\u60A8\u7684\u94F6\u884C\u89E3\u51B3\u4E89\u8BAE\u4E4B\u524D\uFF0C\u60A8\u7684\u8D26\u6237\u5C06\u88AB\u9501\u5B9A\u3002`,
            },
            cardAuthenticationRequired: {
                title: '\u65E0\u6CD5\u6263\u6B3E\u60A8\u7684\u5361\u7247',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `\u60A8\u7684\u652F\u4ED8\u5361\u5C1A\u672A\u5B8C\u5168\u8BA4\u8BC1\u3002\u8BF7\u5B8C\u6210\u8BA4\u8BC1\u8FC7\u7A0B\u4EE5\u6FC0\u6D3B\u4EE5${cardEnding}\u7ED3\u5C3E\u7684\u652F\u4ED8\u5361\u3002`,
            },
            insufficientFunds: {
                title: '\u65E0\u6CD5\u6263\u6B3E\u60A8\u7684\u5361\u7247',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `\u60A8\u7684\u4ED8\u6B3E\u5361\u56E0\u8D44\u91D1\u4E0D\u8DB3\u800C\u88AB\u62D2\u3002\u8BF7\u91CD\u8BD5\u6216\u6DFB\u52A0\u65B0\u7684\u4ED8\u6B3E\u5361\u4EE5\u6E05\u9664\u60A8\u6B20\u4E0B\u7684 ${amountOwed} \u4F59\u989D\u3002`,
            },
            cardExpired: {
                title: '\u65E0\u6CD5\u6263\u6B3E\u60A8\u7684\u5361\u7247',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `\u60A8\u7684\u652F\u4ED8\u5361\u5DF2\u8FC7\u671F\u3002\u8BF7\u6DFB\u52A0\u4E00\u5F20\u65B0\u7684\u652F\u4ED8\u5361\u4EE5\u6E05\u9664\u60A8\u6B20\u4E0B\u7684 ${amountOwed} \u4F59\u989D\u3002`,
            },
            cardExpireSoon: {
                title: '\u60A8\u7684\u94F6\u884C\u5361\u5373\u5C06\u8FC7\u671F',
                subtitle:
                    '\u60A8\u7684\u652F\u4ED8\u5361\u5C06\u4E8E\u672C\u6708\u5E95\u5230\u671F\u3002\u8BF7\u70B9\u51FB\u4E0B\u9762\u7684\u4E09\u70B9\u83DC\u5355\u8FDB\u884C\u66F4\u65B0\uFF0C\u4EE5\u7EE7\u7EED\u4F7F\u7528\u60A8\u6240\u6709\u559C\u7231\u7684\u529F\u80FD\u3002',
            },
            retryBillingSuccess: {
                title: '\u6210\u529F\uFF01',
                subtitle: '\u60A8\u7684\u5361\u5DF2\u6210\u529F\u6263\u6B3E\u3002',
            },
            retryBillingError: {
                title: '\u65E0\u6CD5\u6263\u6B3E\u60A8\u7684\u5361\u7247',
                subtitle:
                    '\u5728\u91CD\u8BD5\u4E4B\u524D\uFF0C\u8BF7\u76F4\u63A5\u8054\u7CFB\u60A8\u7684\u94F6\u884C\u6388\u6743Expensify\u8D39\u7528\u5E76\u89E3\u9664\u4EFB\u4F55\u4FDD\u7559\u3002\u5426\u5219\uFF0C\u8BF7\u5C1D\u8BD5\u6DFB\u52A0\u4E0D\u540C\u7684\u652F\u4ED8\u5361\u3002',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `\u60A8\u5BF9\u4EE5${cardEnding}\u7ED3\u5C3E\u7684\u5361\u4E0A\u7684${amountOwed}\u8D39\u7528\u63D0\u51FA\u4E86\u5F02\u8BAE\u3002\u5728\u4E0E\u60A8\u7684\u94F6\u884C\u89E3\u51B3\u4E89\u8BAE\u4E4B\u524D\uFF0C\u60A8\u7684\u8D26\u6237\u5C06\u88AB\u9501\u5B9A\u3002`,
            preTrial: {
                title: '\u5F00\u59CB\u514D\u8D39\u8BD5\u7528',
                subtitleStart: '\u4F5C\u4E3A\u4E0B\u4E00\u6B65\uFF0C',
                subtitleLink: '\u5B8C\u6210\u60A8\u7684\u8BBE\u7F6E\u6E05\u5355',
                subtitleEnd: '\u8FD9\u6837\u60A8\u7684\u56E2\u961F\u5C31\u53EF\u4EE5\u5F00\u59CB\u62A5\u9500\u4E86\u3002',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `\u8BD5\u7528\u671F\uFF1A\u5269\u4F59 ${numOfDays} ${numOfDays === 1 ? '\u5929' : '\u5929'} \u5929\uFF01`,
                subtitle: '\u6DFB\u52A0\u652F\u4ED8\u5361\u4EE5\u7EE7\u7EED\u4F7F\u7528\u60A8\u6240\u6709\u559C\u6B22\u7684\u529F\u80FD\u3002',
            },
            trialEnded: {
                title: '\u60A8\u7684\u514D\u8D39\u8BD5\u7528\u5DF2\u7ED3\u675F',
                subtitle: '\u6DFB\u52A0\u652F\u4ED8\u5361\u4EE5\u7EE7\u7EED\u4F7F\u7528\u60A8\u6240\u6709\u559C\u6B22\u7684\u529F\u80FD\u3002',
            },
            earlyDiscount: {
                claimOffer: '\u9886\u53D6\u4F18\u60E0',
                noThanks: '\u4E0D\uFF0C\u8C22\u8C22',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% \u6298\u6263\uFF0C\u9002\u7528\u4E8E\u60A8\u7684\u7B2C\u4E00\u5E74\uFF01`,
                    phrase2: `\u53EA\u9700\u6DFB\u52A0\u4E00\u5F20\u652F\u4ED8\u5361\u5E76\u5F00\u59CB\u5E74\u5EA6\u8BA2\u9605\u3002`,
                },
                onboardingChatTitle: {
                    phrase1: '\u9650\u65F6\u4F18\u60E0\uFF1A',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% \u6298\u6263\uFF0C\u9002\u7528\u4E8E\u60A8\u7684\u7B2C\u4E00\u5E74\uFF01`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) =>
                    `\u5728 ${days > 0 ? `${days}\u5929 :` : ''}${hours}\u5C0F\u65F6 : ${minutes}\u5206 : ${seconds}\u79D2 \u5185\u8BA4\u9886`,
            },
        },
        cardSection: {
            title: '\u652F\u4ED8',
            subtitle: '\u6DFB\u52A0\u4E00\u5F20\u5361\u6765\u652F\u4ED8\u60A8\u7684Expensify\u8BA2\u9605\u8D39\u7528\u3002',
            addCardButton: '\u6DFB\u52A0\u652F\u4ED8\u5361',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `\u60A8\u7684\u4E0B\u4E00\u4E2A\u4ED8\u6B3E\u65E5\u671F\u662F${nextPaymentDate}\u3002`,
            cardEnding: ({cardNumber}: CardEndingParams) => `\u5361\u53F7\u4EE5${cardNumber}\u7ED3\u5C3E`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `\u59D3\u540D: ${name}, \u5230\u671F: ${expiration}, \u8D27\u5E01: ${currency}`,
            changeCard: '\u66F4\u6362\u652F\u4ED8\u5361',
            changeCurrency: '\u66F4\u6539\u652F\u4ED8\u8D27\u5E01',
            cardNotFound: '\u672A\u6DFB\u52A0\u652F\u4ED8\u5361',
            retryPaymentButton: '\u91CD\u8BD5\u4ED8\u6B3E',
            authenticatePayment: '\u9A8C\u8BC1\u4ED8\u6B3E',
            requestRefund: '\u8BF7\u6C42\u9000\u6B3E',
            requestRefundModal: {
                phrase1:
                    '\u83B7\u53D6\u9000\u6B3E\u5F88\u7B80\u5355\uFF0C\u53EA\u9700\u5728\u4E0B\u4E00\u4E2A\u8D26\u5355\u65E5\u671F\u4E4B\u524D\u964D\u7EA7\u60A8\u7684\u8D26\u6237\uFF0C\u60A8\u5C31\u4F1A\u6536\u5230\u9000\u6B3E\u3002',
                phrase2:
                    '\u6CE8\u610F\uFF1A\u964D\u7EA7\u60A8\u7684\u8D26\u6237\u610F\u5473\u7740\u60A8\u7684\u5DE5\u4F5C\u533A\u5C06\u88AB\u5220\u9664\u3002\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\uFF0C\u4F46\u5982\u679C\u60A8\u6539\u53D8\u4E3B\u610F\uFF0C\u60A8\u53EF\u4EE5\u968F\u65F6\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u5DE5\u4F5C\u533A\u3002',
                confirm: '\u5220\u9664\u5DE5\u4F5C\u533A\u5E76\u964D\u7EA7',
            },
            viewPaymentHistory: '\u67E5\u770B\u4ED8\u6B3E\u5386\u53F2\u8BB0\u5F55',
        },
        yourPlan: {
            title: '\u60A8\u7684\u8BA1\u5212',
            exploreAllPlans: '\u67E5\u770B\u6240\u6709\u8BA1\u5212',
            customPricing: '\u81EA\u5B9A\u4E49\u5B9A\u4EF7',
            asLowAs: ({price}: YourPlanPriceValueParams) => `\u6BCF\u4F4D\u6D3B\u8DC3\u6210\u5458/\u6708\u4F4E\u81F3${price}`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `\u6BCF\u4F4D\u6210\u5458\u6BCF\u6708${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `\u6BCF\u4F4D\u6210\u5458\u6BCF\u6708${price}`,
            perMemberMonth: '\u6BCF\u4F4D\u6210\u5458/\u6708',
            collect: {
                title: '\u6536\u96C6',
                description: '\u4E3A\u60A8\u63D0\u4F9B\u62A5\u9500\u3001\u65C5\u884C\u548C\u804A\u5929\u529F\u80FD\u7684\u5C0F\u578B\u4F01\u4E1A\u8BA1\u5212\u3002',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `\u4ECE ${lower}/\u6D3B\u8DC3\u6210\u5458\u4F7F\u7528 Expensify Card\uFF0C${upper}/\u6D3B\u8DC3\u6210\u5458\u672A\u4F7F\u7528 Expensify Card\u3002`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `\u4ECE ${lower}/\u6D3B\u8DC3\u6210\u5458\u4F7F\u7528 Expensify Card\uFF0C${upper}/\u6D3B\u8DC3\u6210\u5458\u672A\u4F7F\u7528 Expensify Card\u3002`,
                benefit1: '\u6536\u636E\u626B\u63CF',
                benefit2: '\u62A5\u9500',
                benefit3: '\u4F01\u4E1A\u5361\u7BA1\u7406',
                benefit4: '\u8D39\u7528\u548C\u5DEE\u65C5\u5BA1\u6279',
                benefit5: '\u65C5\u884C\u9884\u8BA2\u548C\u89C4\u5219',
                benefit6: 'QuickBooks/Xero \u96C6\u6210',
                benefit7: '\u804A\u5929\u5173\u4E8E\u8D39\u7528\u3001\u62A5\u544A\u548C\u623F\u95F4',
                benefit8: 'AI\u548C\u4EBA\u5DE5\u652F\u6301',
            },
            control: {
                title: '\u63A7\u5236',
                description: '\u9002\u7528\u4E8E\u5927\u578B\u4F01\u4E1A\u7684\u8D39\u7528\u3001\u5DEE\u65C5\u548C\u804A\u5929\u3002',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `\u4ECE ${lower}/\u6D3B\u8DC3\u6210\u5458\u4F7F\u7528 Expensify Card\uFF0C${upper}/\u6D3B\u8DC3\u6210\u5458\u672A\u4F7F\u7528 Expensify Card\u3002`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `\u4ECE ${lower}/\u6D3B\u8DC3\u6210\u5458\u4F7F\u7528 Expensify Card\uFF0C${upper}/\u6D3B\u8DC3\u6210\u5458\u672A\u4F7F\u7528 Expensify Card\u3002`,
                benefit1: 'Collect \u8BA1\u5212\u4E2D\u7684\u6240\u6709\u5185\u5BB9',
                benefit2: '\u591A\u7EA7\u5BA1\u6279\u5DE5\u4F5C\u6D41\u7A0B',
                benefit3: '\u81EA\u5B9A\u4E49\u8D39\u7528\u89C4\u5219',
                benefit4: 'ERP \u96C6\u6210 (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR \u96C6\u6210 (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: '\u81EA\u5B9A\u4E49\u6D1E\u5BDF\u548C\u62A5\u544A',
                benefit8: '\u9884\u7B97\u7F16\u5236',
            },
            thisIsYourCurrentPlan: '\u8FD9\u662F\u60A8\u5F53\u524D\u7684\u8BA1\u5212',
            downgrade: '\u964D\u7EA7\u5230 Collect',
            upgrade: '\u5347\u7EA7\u5230 Control',
            addMembers: '\u6DFB\u52A0\u6210\u5458',
            saveWithExpensifyTitle: '\u4F7F\u7528 Expensify \u5361\u7701\u94B1',
            saveWithExpensifyDescription:
                '\u4F7F\u7528\u6211\u4EEC\u7684\u50A8\u84C4\u8BA1\u7B97\u5668\u67E5\u770BExpensify\u5361\u7684\u73B0\u91D1\u8FD4\u8FD8\u5982\u4F55\u51CF\u5C11\u60A8\u7684Expensify\u8D26\u5355\u3002',
            saveWithExpensifyButton: '\u4E86\u89E3\u66F4\u591A',
        },
        compareModal: {
            comparePlans: '\u6BD4\u8F83\u8BA1\u5212',
            unlockTheFeatures: '\u9009\u62E9\u9002\u5408\u60A8\u7684\u8BA1\u5212\uFF0C\u89E3\u9501\u6240\u9700\u529F\u80FD\u3002',
            viewOurPricing: '\u67E5\u770B\u6211\u4EEC\u7684\u5B9A\u4EF7\u9875\u9762',
            forACompleteFeatureBreakdown: '\u67E5\u770B\u6211\u4EEC\u6BCF\u4E2A\u8BA1\u5212\u7684\u5B8C\u6574\u529F\u80FD\u7EC6\u5206\u3002',
        },
        details: {
            title: '\u8BA2\u9605\u8BE6\u60C5',
            annual: '\u5E74\u5EA6\u8BA2\u9605',
            taxExempt: '\u8BF7\u6C42\u514D\u7A0E\u72B6\u6001',
            taxExemptEnabled: '\u514D\u7A0E',
            taxExemptStatus: '\u514D\u7A0E\u72B6\u6001',
            payPerUse: '\u6309\u4F7F\u7528\u4ED8\u8D39',
            subscriptionSize: '\u8BA2\u9605\u5927\u5C0F',
            headsUp:
                '\u6CE8\u610F\uFF1A\u5982\u679C\u60A8\u73B0\u5728\u4E0D\u8BBE\u7F6E\u60A8\u7684\u8BA2\u9605\u89C4\u6A21\uFF0C\u6211\u4EEC\u5C06\u81EA\u52A8\u5C06\u5176\u8BBE\u7F6E\u4E3A\u60A8\u7B2C\u4E00\u4E2A\u6708\u7684\u6D3B\u8DC3\u4F1A\u5458\u6570\u91CF\u3002\u7136\u540E\uFF0C\u60A8\u5C06\u627F\u8BFA\u5728\u63A5\u4E0B\u6765\u768412\u4E2A\u6708\u5185\u81F3\u5C11\u4E3A\u8FD9\u4E2A\u6570\u91CF\u7684\u4F1A\u5458\u652F\u4ED8\u8D39\u7528\u3002\u60A8\u53EF\u4EE5\u968F\u65F6\u589E\u52A0\u60A8\u7684\u8BA2\u9605\u89C4\u6A21\uFF0C\u4F46\u5728\u8BA2\u9605\u7ED3\u675F\u4E4B\u524D\u65E0\u6CD5\u51CF\u5C11\u3002',
            zeroCommitment: '\u96F6\u627F\u8BFA\uFF0C\u4EAB\u53D7\u6298\u6263\u540E\u7684\u5E74\u5EA6\u8BA2\u9605\u8D39\u7387',
        },
        subscriptionSize: {
            title: '\u8BA2\u9605\u5927\u5C0F',
            yourSize:
                '\u60A8\u7684\u8BA2\u9605\u89C4\u6A21\u662F\u6307\u5728\u7ED9\u5B9A\u6708\u4EFD\u4E2D\u53EF\u7531\u4EFB\u4F55\u6D3B\u8DC3\u6210\u5458\u586B\u8865\u7684\u7A7A\u4F4D\u6570\u91CF\u3002',
            eachMonth:
                '\u6BCF\u4E2A\u6708\uFF0C\u60A8\u7684\u8BA2\u9605\u6DB5\u76D6\u6700\u591A\u4E0A\u8FF0\u8BBE\u7F6E\u6570\u91CF\u7684\u6D3B\u8DC3\u6210\u5458\u3002\u6BCF\u5F53\u60A8\u589E\u52A0\u8BA2\u9605\u89C4\u6A21\u65F6\uFF0C\u60A8\u5C06\u4EE5\u65B0\u7684\u89C4\u6A21\u5F00\u59CB\u4E00\u4E2A\u65B0\u768412\u4E2A\u6708\u8BA2\u9605\u3002',
            note: '\u6CE8\u610F\uFF1A\u6D3B\u8DC3\u6210\u5458\u662F\u6307\u4EFB\u4F55\u521B\u5EFA\u3001\u7F16\u8F91\u3001\u63D0\u4EA4\u3001\u6279\u51C6\u3001\u62A5\u9500\u6216\u5BFC\u51FA\u4E0E\u60A8\u516C\u53F8\u5DE5\u4F5C\u533A\u76F8\u5173\u7684\u8D39\u7528\u6570\u636E\u7684\u4EBA\u3002',
            confirmDetails: '\u786E\u8BA4\u60A8\u7684\u65B0\u5E74\u5EA6\u8BA2\u9605\u8BE6\u60C5\uFF1A',
            subscriptionSize: '\u8BA2\u9605\u5927\u5C0F',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} \u6D3B\u8DC3\u6210\u5458/\u6708`,
            subscriptionRenews: '\u8BA2\u9605\u7EED\u8BA2',
            youCantDowngrade: '\u60A8\u65E0\u6CD5\u5728\u5E74\u5EA6\u8BA2\u9605\u671F\u95F4\u964D\u7EA7\u3002',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `\u60A8\u5DF2\u7ECF\u627F\u8BFA\u6BCF\u6708\u8BA2\u9605 ${size} \u4E2A\u6D3B\u8DC3\u4F1A\u5458\uFF0C\u76F4\u5230 ${date}\u3002\u60A8\u53EF\u4EE5\u5728 ${date} \u901A\u8FC7\u7981\u7528\u81EA\u52A8\u7EED\u8BA2\u6765\u5207\u6362\u5230\u6309\u4F7F\u7528\u91CF\u4ED8\u8D39\u7684\u8BA2\u9605\u3002`,
            error: {
                size: '\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8BA2\u9605\u5927\u5C0F',
                sameSize: '\u8BF7\u8F93\u5165\u4E00\u4E2A\u4E0E\u60A8\u5F53\u524D\u8BA2\u9605\u5927\u5C0F\u4E0D\u540C\u7684\u6570\u5B57',
            },
        },
        paymentCard: {
            addPaymentCard: '\u6DFB\u52A0\u652F\u4ED8\u5361',
            enterPaymentCardDetails: '\u8F93\u5165\u60A8\u7684\u652F\u4ED8\u5361\u4FE1\u606F',
            security:
                'Expensify\u7B26\u5408PCI-DSS\u6807\u51C6\uFF0C\u4F7F\u7528\u94F6\u884C\u7EA7\u52A0\u5BC6\uFF0C\u5E76\u5229\u7528\u5197\u4F59\u57FA\u7840\u8BBE\u65BD\u6765\u4FDD\u62A4\u60A8\u7684\u6570\u636E\u3002',
            learnMoreAboutSecurity: '\u4E86\u89E3\u66F4\u591A\u5173\u4E8E\u6211\u4EEC\u7684\u5B89\u5168\u6027\u3002',
        },
        subscriptionSettings: {
            title: '\u8BA2\u9605\u8BBE\u7F6E',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `\u8BA2\u9605\u7C7B\u578B: ${subscriptionType}, \u8BA2\u9605\u89C4\u6A21: ${subscriptionSize}, \u81EA\u52A8\u7EED\u8BA2: ${autoRenew}, \u81EA\u52A8\u589E\u52A0\u5E74\u5EA6\u5E2D\u4F4D: ${autoIncrease}`,
            none: '\u65E0',
            on: '\u5728',
            off: '\u5173',
            annual: '\u5E74\u5EA6\u7684',
            autoRenew: '\u81EA\u52A8\u7EED\u8BA2',
            autoIncrease: '\u81EA\u52A8\u589E\u52A0\u5E74\u5EA6\u5E2D\u4F4D\u6570\u91CF',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `\u6BCF\u4F4D\u6D3B\u8DC3\u6210\u5458\u6BCF\u6708\u6700\u591A\u53EF\u8282\u7701${amountWithCurrency}`,
            automaticallyIncrease:
                '\u81EA\u52A8\u589E\u52A0\u60A8\u7684\u5E74\u5EA6\u5E2D\u4F4D\uFF0C\u4EE5\u5BB9\u7EB3\u8D85\u8FC7\u8BA2\u9605\u89C4\u6A21\u7684\u6D3B\u8DC3\u6210\u5458\u3002\u6CE8\u610F\uFF1A\u8FD9\u5C06\u5EF6\u957F\u60A8\u7684\u5E74\u5EA6\u8BA2\u9605\u7ED3\u675F\u65E5\u671F\u3002',
            disableAutoRenew: '\u7981\u7528\u81EA\u52A8\u7EED\u8BA2',
            helpUsImprove: '\u5E2E\u52A9\u6211\u4EEC\u6539\u8FDBExpensify',
            whatsMainReason: '\u60A8\u7981\u7528\u81EA\u52A8\u7EED\u8BA2\u7684\u4E3B\u8981\u539F\u56E0\u662F\u4EC0\u4E48\uFF1F',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `\u7EED\u8BA2\u65E5\u671F\u4E3A${date}\u3002`,
            pricingConfiguration:
                '\u4EF7\u683C\u53D6\u51B3\u4E8E\u914D\u7F6E\u3002\u8981\u83B7\u5F97\u6700\u4F4E\u4EF7\u683C\uFF0C\u8BF7\u9009\u62E9\u5E74\u5EA6\u8BA2\u9605\u5E76\u83B7\u53D6Expensify\u5361\u3002',
            learnMore: {
                part1: '\u5728\u6211\u4EEC\u7684\u5E73\u53F0\u4E0A\u4E86\u89E3\u66F4\u591A\u4FE1\u606F',
                pricingPage: '\u5B9A\u4EF7\u9875\u9762',
                part2: '\u6216\u5728\u60A8\u7684\u5E94\u7528\u4E2D\u4E0E\u6211\u4EEC\u7684\u56E2\u961F\u804A\u5929',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: '\u9884\u8BA1\u4EF7\u683C',
            changesBasedOn: '\u8FD9\u4F1A\u6839\u636E\u60A8\u7684Expensify\u5361\u4F7F\u7528\u60C5\u51B5\u548C\u4EE5\u4E0B\u8BA2\u9605\u9009\u9879\u800C\u53D8\u5316\u3002',
        },
        requestEarlyCancellation: {
            title: '\u8BF7\u6C42\u63D0\u524D\u53D6\u6D88',
            subtitle: '\u60A8\u7533\u8BF7\u63D0\u524D\u53D6\u6D88\u7684\u4E3B\u8981\u539F\u56E0\u662F\u4EC0\u4E48\uFF1F',
            subscriptionCanceled: {
                title: '\u8BA2\u9605\u5DF2\u53D6\u6D88',
                subtitle: '\u60A8\u7684\u5E74\u5EA6\u8BA2\u9605\u5DF2\u88AB\u53D6\u6D88\u3002',
                info: '\u5982\u679C\u60A8\u60F3\u7EE7\u7EED\u6309\u4F7F\u7528\u91CF\u4ED8\u8D39\u4F7F\u7528\u60A8\u7684\u5DE5\u4F5C\u533A\uFF0C\u60A8\u5C31\u51C6\u5907\u597D\u4E86\u3002',
                preventFutureActivity: {
                    part1: '\u5982\u679C\u60A8\u60F3\u9632\u6B62\u672A\u6765\u7684\u6D3B\u52A8\u548C\u8D39\u7528\uFF0C\u60A8\u5FC5\u987B',
                    link: '\u5220\u9664\u60A8\u7684\u5DE5\u4F5C\u533A',
                    part2: '\u8BF7\u6CE8\u610F\uFF0C\u5F53\u60A8\u5220\u9664\u5DE5\u4F5C\u533A\u65F6\uFF0C\u60A8\u5C06\u88AB\u6536\u53D6\u5F53\u524D\u65E5\u5386\u6708\u5185\u4EA7\u751F\u7684\u4EFB\u4F55\u672A\u7ED3\u6D3B\u52A8\u8D39\u7528\u3002',
                },
            },
            requestSubmitted: {
                title: '\u8BF7\u6C42\u5DF2\u63D0\u4EA4',
                subtitle: {
                    part1: '\u611F\u8C22\u60A8\u544A\u77E5\u6211\u4EEC\u60A8\u6709\u610F\u53D6\u6D88\u8BA2\u9605\u3002\u6211\u4EEC\u6B63\u5728\u5BA1\u6838\u60A8\u7684\u8BF7\u6C42\uFF0C\u5E76\u5C06\u5F88\u5FEB\u901A\u8FC7\u60A8\u7684\u804A\u5929\u4E0E\u60A8\u8054\u7CFB\u3002',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: '\u901A\u8FC7\u8BF7\u6C42\u63D0\u524D\u53D6\u6D88\uFF0C\u6211\u786E\u8BA4\u5E76\u540C\u610FExpensify\u5728Expensify\u6761\u6B3E\u4E0B\u6CA1\u6709\u4E49\u52A1\u6279\u51C6\u6B64\u7C7B\u8BF7\u6C42\u3002',
                link: '\u670D\u52A1\u6761\u6B3E',
                part2: '\u6216\u6211\u4E0EExpensify\u4E4B\u95F4\u7684\u5176\u4ED6\u9002\u7528\u670D\u52A1\u534F\u8BAE\uFF0C\u5E76\u4E14Expensify\u4FDD\u7559\u5BF9\u6388\u4E88\u4EFB\u4F55\u6B64\u7C7B\u8BF7\u6C42\u7684\u552F\u4E00\u914C\u60C5\u6743\u3002',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: '\u529F\u80FD\u9700\u8981\u6539\u8FDB',
        tooExpensive: '\u592A\u8D35\u4E86',
        inadequateSupport: '\u5BA2\u6237\u652F\u6301\u4E0D\u8DB3',
        businessClosing: '\u516C\u53F8\u5173\u95ED\u3001\u7F29\u51CF\u89C4\u6A21\u6216\u88AB\u6536\u8D2D',
        additionalInfoTitle: '\u60A8\u8981\u8FC1\u79FB\u5230\u4EC0\u4E48\u8F6F\u4EF6\uFF0C\u4E3A\u4EC0\u4E48\uFF1F',
        additionalInfoInputLabel: '\u60A8\u7684\u56DE\u590D',
    },
    roomChangeLog: {
        updateRoomDescription: '\u5C06\u623F\u95F4\u63CF\u8FF0\u8BBE\u7F6E\u4E3A\uFF1A',
        clearRoomDescription: '\u6E05\u9664\u623F\u95F4\u63CF\u8FF0',
    },
    delegate: {
        switchAccount: '\u5207\u6362\u8D26\u6237\uFF1A',
        copilotDelegatedAccess: 'Copilot: \u59D4\u6258\u8BBF\u95EE',
        copilotDelegatedAccessDescription: '\u5141\u8BB8\u5176\u4ED6\u6210\u5458\u8BBF\u95EE\u60A8\u7684\u8D26\u6237\u3002',
        addCopilot: '\u6DFB\u52A0\u526F\u9A7E\u9A76',
        membersCanAccessYourAccount: '\u8FD9\u4E9B\u6210\u5458\u53EF\u4EE5\u8BBF\u95EE\u60A8\u7684\u8D26\u6237\uFF1A',
        youCanAccessTheseAccounts: '\u60A8\u53EF\u4EE5\u901A\u8FC7\u8D26\u6237\u5207\u6362\u5668\u8BBF\u95EE\u8FD9\u4E9B\u8D26\u6237\uFF1A',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '\u6EE1';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '\u6709\u9650\u7684';
                default:
                    return '';
            }
        },
        genericError: '\u54CE\u5440\uFF0C\u51FA\u4E86\u70B9\u95EE\u9898\u3002\u8BF7\u518D\u8BD5\u4E00\u6B21\u3002',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `\u4EE3\u8868${delegator}`,
        accessLevel: '\u8BBF\u95EE\u7EA7\u522B',
        confirmCopilot: '\u5728\u4E0B\u65B9\u786E\u8BA4\u60A8\u7684\u526F\u9A7E\u9A76\u3002',
        accessLevelDescription:
            '\u8BF7\u9009\u62E9\u4EE5\u4E0B\u8BBF\u95EE\u7EA7\u522B\u3002\u5B8C\u5168\u8BBF\u95EE\u548C\u6709\u9650\u8BBF\u95EE\u90FD\u5141\u8BB8\u526F\u9A7E\u9A76\u67E5\u770B\u6240\u6709\u5BF9\u8BDD\u548C\u8D39\u7528\u3002',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '\u5141\u8BB8\u5176\u4ED6\u6210\u5458\u4EE3\u8868\u60A8\u5728\u60A8\u7684\u8D26\u6237\u4E2D\u6267\u884C\u6240\u6709\u64CD\u4F5C\u3002\u5305\u62EC\u804A\u5929\u3001\u63D0\u4EA4\u3001\u5BA1\u6279\u3001\u652F\u4ED8\u3001\u8BBE\u7F6E\u66F4\u65B0\u7B49\u3002';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '\u5141\u8BB8\u5176\u4ED6\u6210\u5458\u4EE3\u8868\u60A8\u5728\u60A8\u7684\u8D26\u6237\u4E2D\u6267\u884C\u5927\u591A\u6570\u64CD\u4F5C\u3002\u4E0D\u5305\u62EC\u5BA1\u6279\u3001\u4ED8\u6B3E\u3001\u62D2\u7EDD\u548C\u4FDD\u7559\u3002';
                default:
                    return '';
            }
        },
        removeCopilot: '\u79FB\u9664\u534F\u4F5C\u52A9\u624B',
        removeCopilotConfirmation: '\u60A8\u786E\u5B9A\u8981\u79FB\u9664\u8FD9\u4E2A\u526F\u9A7E\u9A76\u5417\uFF1F',
        changeAccessLevel: '\u66F4\u6539\u8BBF\u95EE\u7EA7\u522B',
        makeSureItIsYou: '\u8BA9\u6211\u4EEC\u786E\u8BA4\u662F\u4F60',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u5230${contactMethod}\u7684\u9B54\u6CD5\u4EE3\u7801\u4EE5\u6DFB\u52A0\u526F\u9A7E\u9A76\u3002\u5B83\u5E94\u8BE5\u4F1A\u5728\u4E00\u4E24\u5206\u949F\u5185\u5230\u8FBE\u3002`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) =>
            `\u8BF7\u8F93\u5165\u53D1\u9001\u5230${contactMethod}\u7684\u9A8C\u8BC1\u7801\u4EE5\u66F4\u65B0\u60A8\u7684\u526F\u9A7E\u9A76\u3002`,
        notAllowed: '\u6162\u7740...',
        noAccessMessage: '\u4F5C\u4E3A\u526F\u9A7E\u9A76\u5458\uFF0C\u60A8\u65E0\u6743\u8BBF\u95EE\u6B64\u9875\u9762\u3002\u62B1\u6B49\uFF01',
        notAllowedMessageStart: `\u4F5C\u4E3A\u4E00\u540D`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) =>
            `\u5BF9\u4E8E${accountOwnerEmail}\uFF0C\u60A8\u6CA1\u6709\u6743\u9650\u6267\u884C\u6B64\u64CD\u4F5C\u3002\u62B1\u6B49\uFF01`,
        copilotAccess: 'Copilot \u8BBF\u95EE\u6743\u9650',
    },
    debug: {
        debug: '\u8C03\u8BD5',
        details: '\u8BE6\u60C5',
        JSON: 'JSON',
        reportActions: '\u64CD\u4F5C',
        reportActionPreview: '\u9884\u89C8',
        nothingToPreview: '\u65E0\u53EF\u9884\u89C8\u5185\u5BB9',
        editJson: '\u7F16\u8F91 JSON:',
        preview: '\u9884\u89C8:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `\u7F3A\u5C11${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `\u65E0\u6548\u5C5E\u6027\uFF1A${propertyName} - \u9884\u671F\u7C7B\u578B\uFF1A${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `\u65E0\u6548\u503C - \u9884\u671F: ${expectedValues}`,
        missingValue: '\u7F3A\u5C11\u503C',
        createReportAction: '\u521B\u5EFA\u62A5\u544A\u64CD\u4F5C',
        reportAction: '\u62A5\u544A\u64CD\u4F5C',
        report: '\u62A5\u544A',
        transaction: '\u4EA4\u6613',
        violations: '\u8FDD\u89C4\u4E8B\u9879',
        transactionViolation: '\u4EA4\u6613\u8FDD\u89C4',
        hint: '\u6570\u636E\u66F4\u6539\u4E0D\u4F1A\u53D1\u9001\u5230\u540E\u7AEF',
        textFields: '\u6587\u672C\u5B57\u6BB5',
        numberFields: '\u6570\u5B57\u5B57\u6BB5',
        booleanFields: '\u5E03\u5C14\u5B57\u6BB5',
        constantFields: '\u5E38\u91CF\u5B57\u6BB5',
        dateTimeFields: 'DateTime\u5B57\u6BB5',
        date: '\u65E5\u671F',
        time: '\u65F6\u95F4',
        none: 'None',
        visibleInLHN: '\u5728LHN\u4E2D\u53EF\u89C1',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: '\u67E5\u770B\u62A5\u544A',
        viewTransaction: '\u67E5\u770B\u4EA4\u6613',
        createTransactionViolation: '\u521B\u5EFA\u4EA4\u6613\u8FDD\u89C4',
        reasonVisibleInLHN: {
            hasDraftComment: '\u6709\u8349\u7A3F\u8BC4\u8BBA',
            hasGBR: 'Has GBR',
            hasRBR: 'Has RBR',
            pinnedByUser: '\u6210\u5458\u7F6E\u9876',
            hasIOUViolations: '\u6709\u501F\u6B3E\u8FDD\u89C4\u884C\u4E3A',
            hasAddWorkspaceRoomErrors: '\u6DFB\u52A0\u5DE5\u4F5C\u533A\u623F\u95F4\u65F6\u51FA\u9519',
            isUnread: '\u672A\u8BFB\uFF08\u4E13\u6CE8\u6A21\u5F0F\uFF09',
            isArchived: '\u5DF2\u5F52\u6863\uFF08\u6700\u65B0\u6A21\u5F0F\uFF09',
            isSelfDM: '\u662F\u81EA\u6211\u79C1\u4FE1',
            isFocused: '\u6682\u65F6\u4E13\u6CE8\u4E8E',
        },
        reasonGBR: {
            hasJoinRequest: '\u6709\u52A0\u5165\u8BF7\u6C42\uFF08\u7BA1\u7406\u5458\u623F\u95F4\uFF09',
            isUnreadWithMention: '\u672A\u8BFB\u5E76\u63D0\u53CA',
            isWaitingForAssigneeToCompleteAction: '\u6B63\u5728\u7B49\u5F85\u53D7\u8BA9\u4EBA\u5B8C\u6210\u64CD\u4F5C',
            hasChildReportAwaitingAction: '\u6709\u5B50\u62A5\u544A\u7B49\u5F85\u5904\u7406',
            hasMissingInvoiceBankAccount: '\u7F3A\u5C11\u53D1\u7968\u94F6\u884C\u8D26\u6237',
        },
        reasonRBR: {
            hasErrors: '\u62A5\u544A\u6216\u62A5\u544A\u64CD\u4F5C\u6570\u636E\u4E2D\u6709\u9519\u8BEF',
            hasViolations: '\u6709\u8FDD\u89C4\u884C\u4E3A',
            hasTransactionThreadViolations: '\u6709\u4EA4\u6613\u7EBF\u7A0B\u8FDD\u89C4',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '\u6709\u4E00\u4EFD\u62A5\u544A\u7B49\u5F85\u5904\u7406',
            theresAReportWithErrors: '\u6709\u4E00\u4EFD\u62A5\u544A\u5B58\u5728\u9519\u8BEF',
            theresAWorkspaceWithCustomUnitsErrors: '\u6709\u4E00\u4E2A\u5DE5\u4F5C\u533A\u5B58\u5728\u81EA\u5B9A\u4E49\u5355\u4F4D\u9519\u8BEF',
            theresAProblemWithAWorkspaceMember: '\u5DE5\u4F5C\u533A\u6210\u5458\u51FA\u73B0\u95EE\u9898',
            theresAProblemWithAWorkspaceQBOExport: '\u5DE5\u4F5C\u533A\u8FDE\u63A5\u5BFC\u51FA\u8BBE\u7F6E\u51FA\u73B0\u95EE\u9898\u3002',
            theresAProblemWithAContactMethod: '\u8054\u7CFB\u65B9\u6CD5\u51FA\u73B0\u95EE\u9898',
            aContactMethodRequiresVerification: '\u8054\u7CFB\u65B9\u6CD5\u9700\u8981\u9A8C\u8BC1',
            theresAProblemWithAPaymentMethod: '\u4ED8\u6B3E\u65B9\u5F0F\u51FA\u73B0\u95EE\u9898',
            theresAProblemWithAWorkspace: '\u5DE5\u4F5C\u533A\u51FA\u73B0\u95EE\u9898',
            theresAProblemWithYourReimbursementAccount: '\u60A8\u7684\u62A5\u9500\u8D26\u6237\u51FA\u73B0\u4E86\u95EE\u9898',
            theresABillingProblemWithYourSubscription: '\u60A8\u7684\u8BA2\u9605\u5B58\u5728\u8D26\u5355\u95EE\u9898',
            yourSubscriptionHasBeenSuccessfullyRenewed: '\u60A8\u7684\u8BA2\u9605\u5DF2\u6210\u529F\u7EED\u8BA2',
            theresWasAProblemDuringAWorkspaceConnectionSync: '\u5DE5\u4F5C\u533A\u8FDE\u63A5\u540C\u6B65\u65F6\u51FA\u73B0\u95EE\u9898',
            theresAProblemWithYourWallet: '\u60A8\u7684\u94B1\u5305\u51FA\u73B0\u4E86\u95EE\u9898',
            theresAProblemWithYourWalletTerms: '\u60A8\u7684\u94B1\u5305\u6761\u6B3E\u5B58\u5728\u95EE\u9898',
        },
    },
    emptySearchView: {
        takeATestDrive: '\u8BD5\u9A7E',
    },
    migratedUserWelcomeModal: {
        title: '\u65C5\u884C\u548C\u62A5\u9500\uFF0C\u4EE5\u804A\u5929\u7684\u901F\u5EA6',
        subtitle:
            '\u65B0Expensify\u62E5\u6709\u540C\u6837\u51FA\u8272\u7684\u81EA\u52A8\u5316\u529F\u80FD\uFF0C\u4F46\u73B0\u5728\u589E\u52A0\u4E86\u60CA\u4EBA\u7684\u534F\u4F5C\u529F\u80FD\uFF1A',
        confirmText: '\u6211\u4EEC\u8D70\u5427\uFF01',
        features: {
            chat: '<strong>\u76F4\u63A5\u5728\u4EFB\u4F55\u8D39\u7528</strong>\u3001\u62A5\u544A\u6216\u5DE5\u4F5C\u533A\u4E0A\u804A\u5929',
            scanReceipt: '<strong>\u626B\u63CF\u6536\u636E</strong>\u5E76\u83B7\u5F97\u62A5\u9500',
            crossPlatform: '\u901A\u8FC7\u624B\u673A\u6216\u6D4F\u89C8\u5668\u5B8C\u6210<strong>\u6240\u6709\u4E8B\u60C5</strong>',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: '\u5F00\u59CB\u4F7F\u7528',
            part2: '\u5728\u8FD9\u91CC\uFF01',
        },
        saveSearchTooltip: {
            part1: '\u91CD\u547D\u540D\u5DF2\u4FDD\u5B58\u7684\u641C\u7D22',
            part2: '\u5728\u8FD9\u91CC\uFF01',
        },
        bottomNavInboxTooltip: {
            part1: '\u68C0\u67E5\u4EC0\u4E48',
            part2: '\u9700\u8981\u60A8\u7684\u5173\u6CE8',
            part3: '\u548C',
            part4: '\u804A\u5929\u5173\u4E8E\u8D39\u7528\u3002',
        },
        workspaceChatTooltip: {
            part1: '\u4E0E \u4EA4\u6D41',
            part2: '\u5BA1\u6279\u8005',
        },
        globalCreateTooltip: {
            part1: '\u521B\u5EFA\u8D39\u7528',
            part2: '\uFF0C\u5F00\u59CB\u804A\u5929\uFF0C',
            part3: '\u4EE5\u53CA\u66F4\u591A\u3002',
            part4: '\u8BD5\u8BD5\u770B\uFF01',
        },
        GBRRBRChat: {
            part1: '\u60A8\u4F1A\u770B\u5230 \uD83D\uDFE2 \u5728',
            part2: '\u91C7\u53D6\u7684\u884C\u52A8',
            part3: '\uFF0C\u548C\uD83D\uDD34\u5728',
            part4: '\u5F85\u5BA1\u6838\u9879\u76EE\u3002',
        },
        accountSwitcher: {
            part1: '\u8BBF\u95EE\u60A8\u7684',
            part2: 'Copilot \u8D26\u6237',
            part3: '\u8FD9\u91CC',
        },
        expenseReportsFilter: {
            part1: '\u6B22\u8FCE\uFF01\u67E5\u627E\u60A8\u7684\u6240\u6709',
            part2: '\u516C\u53F8\u7684\u62A5\u544A',
            part3: '\u8FD9\u91CC\u3002',
        },
        scanTestTooltip: {
            part1: '\u60F3\u770B\u770B\u626B\u63CF\u529F\u80FD\u5982\u4F55\u8FD0\u4F5C\u5417\uFF1F',
            part2: '\u8BD5\u8BD5\u6D4B\u8BD5\u6536\u636E\uFF01',
            part3: '\u9009\u62E9\u6211\u4EEC\u7684',
            part4: '\u6D4B\u8BD5\u7ECF\u7406',
            part5: '\u8BD5\u8BD5\u770B\u5427\uFF01',
            part6: '\u73B0\u5728\uFF0C',
            part7: '\u63D0\u4EA4\u60A8\u7684\u62A5\u9500\u5355',
            part8: '\u5E76\u89C1\u8BC1\u5947\u8FF9\u7684\u53D1\u751F\uFF01',
            tryItOut: '\u8BD5\u8BD5\u770B',
            noThanks: '\u4E0D\uFF0C\u8C22\u8C22',
        },
        outstandingFilter: {
            part1: '\u7B5B\u9009\u7B26\u5408\u4EE5\u4E0B\u6761\u4EF6\u7684\u8D39\u7528',
            part2: '\u9700\u8981\u6279\u51C6',
        },
        scanTestDriveTooltip: {
            part1: '\u53D1\u9001\u6B64\u6536\u636E\u7ED9',
            part2: '\u5B8C\u6210\u8BD5\u9A7E\uFF01',
        },
    },
    discardChangesConfirmation: {
        title: '\u653E\u5F03\u66F4\u6539\uFF1F',
        body: '\u60A8\u786E\u5B9A\u8981\u653E\u5F03\u6240\u505A\u7684\u66F4\u6539\u5417\uFF1F',
        confirmText: '\u653E\u5F03\u66F4\u6539',
    },
    scheduledCall: {
        book: {
            title: '\u5B89\u6392\u7535\u8BDD\u4F1A\u8BAE',
            description: '\u627E\u5230\u9002\u5408\u4F60\u7684\u65F6\u95F4\u3002',
            slots: '\u53EF\u7528\u65F6\u95F4\u4E3A',
        },
        confirmation: {
            title: '\u786E\u8BA4\u901A\u8BDD',
            description:
                '\u8BF7\u786E\u4FDD\u4E0B\u9762\u7684\u8BE6\u7EC6\u4FE1\u606F\u5BF9\u60A8\u6765\u8BF4\u6CA1\u6709\u95EE\u9898\u3002\u4E00\u65E6\u60A8\u786E\u8BA4\u901A\u8BDD\uFF0C\u6211\u4EEC\u5C06\u53D1\u9001\u9080\u8BF7\u5E76\u63D0\u4F9B\u66F4\u591A\u4FE1\u606F\u3002',
            setupSpecialist: '\u60A8\u7684\u8BBE\u7F6E\u4E13\u5BB6',
            meetingLength: '\u4F1A\u8BAE\u65F6\u957F',
            dateTime: '\u65E5\u671F\u548C\u65F6\u95F4',
            minutes: '30\u5206\u949F',
        },
        callScheduled: '\u901A\u8BDD\u5DF2\u5B89\u6392',
    },
    autoSubmitModal: {
        title: '\u5DF2\u6E05\u9664\u5E76\u63D0\u4EA4\uFF01',
        description: '\u6240\u6709\u8B66\u544A\u548C\u8FDD\u89C4\u5DF2\u88AB\u6E05\u9664\uFF0C\u56E0\u6B64\uFF1A',
        submittedExpensesTitle: '\u8FD9\u4E9B\u8D39\u7528\u5DF2\u63D0\u4EA4',
        submittedExpensesDescription:
            '\u8FD9\u4E9B\u8D39\u7528\u5DF2\u53D1\u9001\u7ED9\u60A8\u7684\u5BA1\u6279\u4EBA\uFF0C\u4F46\u5728\u6279\u51C6\u4E4B\u524D\u4ECD\u53EF\u7F16\u8F91\u3002',
        pendingExpensesTitle: '\u5F85\u5904\u7406\u8D39\u7528\u5DF2\u88AB\u79FB\u52A8',
        pendingExpensesDescription:
            '\u4EFB\u4F55\u5F85\u5904\u7406\u7684\u5361\u8D39\u7528\u5DF2\u88AB\u79FB\u52A8\u5230\u5355\u72EC\u7684\u62A5\u544A\u4E2D\uFF0C\u76F4\u5230\u5B83\u4EEC\u88AB\u53D1\u5E03\u3002',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '\u8FDB\u884C2\u5206\u949F\u7684\u8BD5\u7528\u4F53\u9A8C',
        },
        modal: {
            title: '\u5E26\u6211\u4EEC\u8BD5\u9A7E\u4E00\u4E0B',
            description: '\u5FEB\u901F\u6D4F\u89C8\u4EA7\u54C1\uFF0C\u5FEB\u901F\u4E0A\u624B\u3002\u65E0\u9700\u4E2D\u9014\u505C\u7559\uFF01',
            confirmText: '\u5F00\u59CB\u8BD5\u7528',
            helpText: '\u8DF3\u8FC7',
            employee: {
                description:
                    '<muted-text>\u8BA9\u60A8\u7684\u56E2\u961F\u4EAB\u53D7<strong>3\u4E2A\u6708\u514D\u8D39\u7684Expensify\u670D\u52A1\uFF01</strong>\u53EA\u9700\u5728\u4E0B\u65B9\u8F93\u5165\u60A8\u8001\u677F\u7684\u7535\u5B50\u90AE\u4EF6\u5E76\u53D1\u9001\u6D4B\u8BD5\u8D39\u7528\u3002</muted-text>',
                email: '\u8F93\u5165\u60A8\u8001\u677F\u7684\u7535\u5B50\u90AE\u4EF6\u5730\u5740',
                error: '\u8BE5\u6210\u5458\u62E5\u6709\u4E00\u4E2A\u5DE5\u4F5C\u533A\uFF0C\u8BF7\u8F93\u5165\u65B0\u6210\u5458\u8FDB\u884C\u6D4B\u8BD5\u3002',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '\u60A8\u76EE\u524D\u6B63\u5728\u8BD5\u7528 Expensify',
            readyForTheRealThing: '\u51C6\u5907\u597D\u6765\u771F\u7684\u4E86\u5417\uFF1F',
            getStarted: '\u5F00\u59CB\u4F7F\u7528',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name}\u9080\u8BF7\u60A8\u8BD5\u7528Expensify\n\u563F\uFF01\u6211\u521A\u4E3A\u6211\u4EEC\u4E89\u53D6\u5230\u4E86*3\u4E2A\u6708\u514D\u8D39*\u8BD5\u7528Expensify\uFF0C\u8FD9\u662F\u5904\u7406\u8D39\u7528\u7684\u6700\u5FEB\u65B9\u5F0F\u3002\n\n\u8FD9\u91CC\u6709\u4E00\u4E2A*\u6D4B\u8BD5\u6536\u636E*\u6765\u5C55\u793A\u5B83\u7684\u5DE5\u4F5C\u539F\u7406\uFF1A`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
