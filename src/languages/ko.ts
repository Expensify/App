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
        cancel: '\uCDE8\uC18C',
        dismiss: '\uAC70\uBD80',
        yes: '\uB124',
        no: '\uC544\uB2C8\uC624',
        ok: '"OK"',
        notNow: '\uC9C0\uAE08 \uC544\uB2C8\uC57C',
        learnMore: '\uB354 \uC54C\uC544\uBCF4\uAE30.',
        buttonConfirm: '\uC54C\uACA0\uC2B5\uB2C8\uB2E4',
        name: '\uC774\uB984',
        attachment: '\uCCA8\uBD80\uD30C\uC77C',
        attachments: '\uCCA8\uBD80\uD30C\uC77C',
        center: '\uC13C\uD130',
        from: '\uC5D0\uC11C',
        to: '\uC5D0',
        in: '\uC5D0\uC11C',
        optional: '\uC120\uD0DD\uC801',
        new: '\uC0C8\uB85C\uC6B4',
        search: '\uAC80\uC0C9',
        reports: '\uBCF4\uACE0\uC11C',
        find: '\uCC3E\uAE30',
        searchWithThreeDots: '\uAC80\uC0C9...',
        next: '\uB2E4\uC74C',
        previous: '\uC774\uC804',
        goBack: '\uB4A4\uB85C \uAC00\uAE30',
        create: '\uC0DD\uC131',
        add: '\uCD94\uAC00',
        resend: '\uC7AC\uC804\uC1A1',
        save: '\uC800\uC7A5',
        select: '\uC120\uD0DD',
        selectMultiple: '\uB2E4\uC911 \uC120\uD0DD',
        saveChanges: '\uBCC0\uACBD \uC0AC\uD56D \uC800\uC7A5',
        submit: '\uC81C\uCD9C',
        rotate: '\uD68C\uC804',
        zoom: '\uC90C',
        password: '\uBE44\uBC00\uBC88\uD638',
        magicCode: '\uB9C8\uBC95 \uCF54\uB4DC',
        twoFactorCode: '\uC774\uC911 \uC778\uC99D \uCF54\uB4DC',
        workspaces: '\uC791\uC5C5 \uACF5\uAC04',
        inbox: '\uBC1B\uC740 \uD3B8\uC9C0\uD568',
        group: '\uADF8\uB8F9',
        profile: '\uD504\uB85C\uD544',
        referral: '\uCD94\uCC9C',
        payments: '\uACB0\uC81C',
        approvals: '\uC2B9\uC778',
        wallet: '\uC9C0\uAC11',
        preferences: '\uC120\uD638 \uC124\uC815',
        view: '\uBCF4\uAE30',
        review: '\uB9AC\uBDF0',
        not: '\uC544\uB2C8\uC694',
        signIn: '\uB85C\uADF8\uC778',
        signInWithGoogle: 'Google\uB85C \uB85C\uADF8\uC778\uD558\uC138\uC694',
        signInWithApple: 'Apple\uB85C \uB85C\uADF8\uC778\uD558\uAE30',
        signInWith: '${username}\uC73C\uB85C \uB85C\uADF8\uC778\uD558\uC138\uC694',
        continue: '\uACC4\uC18D',
        firstName: '\uC774\uB984',
        lastName: '\uC131',
        addCardTermsOfService: 'Expensify \uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00',
        perPerson: '1\uC778\uB2F9',
        phone: '\uC804\uD654',
        phoneNumber: '\uC804\uD654 \uBC88\uD638',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: '\uC774\uBA54\uC77C',
        and: '\uADF8\uB9AC\uACE0',
        or: '\uB610\uB294',
        details: '\uC138\uBD80 \uC0AC\uD56D',
        privacy: '\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638',
        privacyPolicy: '\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68',
        hidden: '\uC228\uACA8\uC9C4',
        visible: '\uBCF4\uC774\uB294',
        delete: '\uC0AD\uC81C',
        archived: '\uBCF4\uAD00\uB428',
        contacts: '\uC5F0\uB77D\uCC98',
        recents: '\uCD5C\uADFC\uB4E4',
        close: '\uB2EB\uAE30',
        download: '\uB2E4\uC6B4\uB85C\uB4DC',
        downloading: '\uB2E4\uC6B4\uB85C\uB4DC \uC911',
        uploading: '\uC5C5\uB85C\uB529 \uC911',
        pin: '\uD540',
        unPin: '\uACE0\uC815 \uD574\uC81C',
        back: '\uB4A4\uB85C',
        saveAndContinue: '\uC800\uC7A5\uD558\uACE0 \uACC4\uC18D\uD558\uAE30',
        settings: '\uC124\uC815',
        termsOfService: '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00',
        members: '\uD68C\uC6D0\uB4E4',
        invite: '\uCD08\uB300\uD558\uAE30',
        here: '\uC5EC\uAE30',
        date: '\uB0A0\uC9DC',
        dob: '\uCD9C\uC0DD\uC77C',
        currentYear: '\uD604\uC7AC \uB144\uB3C4',
        currentMonth: '\uD604\uC7AC \uC6D4',
        ssnLast4: 'SSN\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC',
        ssnFull9: 'SSN\uC758 \uC804\uCCB4 9\uC790\uB9AC \uC22B\uC790',
        addressLine: ({lineNumber}: AddressLineParams) => `\uC8FC\uC18C \uC904 ${lineNumber}`,
        personalAddress: '\uAC1C\uC778 \uC8FC\uC18C',
        companyAddress: '\uD68C\uC0AC \uC8FC\uC18C',
        noPO: 'PO \uBC15\uC2A4 \uB610\uB294 \uBA54\uC77C \uB4DC\uB86D \uC8FC\uC18C\uB294 \uC0AC\uC6A9\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.',
        city: '\uB3C4\uC2DC',
        state: '\uC0C1\uD0DC',
        streetAddress: '\uAC70\uB9AC \uC8FC\uC18C',
        stateOrProvince: '\uC8FC / \uC9C0\uBC29',
        country: '\uAD6D\uAC00',
        zip: '\uC6B0\uD3B8 \uBC88\uD638',
        zipPostCode: '\uC6B0\uD3B8\uBC88\uD638 / \uC6B0\uD3B8\uBC88\uD638',
        whatThis: '\uC774\uAC8C \uBB54\uAC00\uC694?',
        iAcceptThe: '\uB098\uB294 \uC218\uB77D\uD55C\uB2E4',
        remove: '\uC81C\uAC70',
        admin: '\uAD00\uB9AC\uC790',
        owner: '\uC18C\uC720\uC790',
        dateFormat: 'YYYY-MM-DD',
        send: '\uBCF4\uB0B4\uAE30',
        na: 'N/A',
        noResultsFound: '\uACB0\uACFC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
        recentDestinations: '\uCD5C\uADFC \uBAA9\uC801\uC9C0',
        timePrefix: '\uADF8\uAC83\uC740',
        conjunctionFor: '\uC5D0 \uB300\uD558\uC5EC',
        todayAt: '\uC624\uB298 ${time}\uC5D0',
        tomorrowAt: '\uB0B4\uC77C ${',
        yesterdayAt: '\uC5B4\uC81C \uC624\uD6C4\uC5D0',
        conjunctionAt: '\uC5D0\uC11C',
        conjunctionTo: '\uC5D0',
        genericErrorMessage:
            '\uC774\uB7F0... \uBB34\uC5B8\uAC00 \uC798\uBABB\uB418\uC5B4 \uC694\uCCAD\uC744 \uC644\uB8CC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        percentage: '\uBC31\uBD84\uC728',
        error: {
            invalidAmount: '\uC798\uBABB\uB41C \uAE08\uC561\uC785\uB2C8\uB2E4.',
            acceptTerms: '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD574\uC57C \uACC4\uC18D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            phoneNumber: `\uC720\uD6A8\uD55C \uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694, \uAD6D\uAC00 \uCF54\uB4DC \uD3EC\uD568 (\uC608: ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: '\uC774 \uD544\uB4DC\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.',
            requestModified: '\uC774 \uC694\uCCAD\uC740 \uB2E4\uB978 \uBA64\uBC84\uC5D0 \uC758\uD574 \uC218\uC815 \uC911\uC785\uB2C8\uB2E4.',
            characterLimit: ({limit}: CharacterLimitParams) => `Exceeds the maximum length of ${limit} characters`,
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `\uBB38\uC790 \uC218 \uCD08\uACFC (${length}/${limit})`,
            dateInvalid: '\uC720\uD6A8\uD55C \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            invalidDateShouldBeFuture: '\uC624\uB298 \uB610\uB294 \uBBF8\uB798\uC758 \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            invalidTimeShouldBeFuture: '\uC801\uC5B4\uB3C4 1\uBD84 \uD6C4\uC758 \uC2DC\uAC04\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            invalidCharacter: '\uC798\uBABB\uB41C \uBB38\uC790\uC785\uB2C8\uB2E4.',
            enterMerchant: '\uC0C1\uC778 \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694.',
            enterAmount: '\uAE08\uC561\uC744 \uC785\uB825\uD558\uC138\uC694.',
            enterDate: '\uB0A0\uC9DC\uB97C \uC785\uB825\uD558\uC138\uC694.',
            invalidTimeRange: '12\uC2DC\uAC04 \uD615\uC2DD\uC73C\uB85C \uC2DC\uAC04\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694 (\uC608, \uC624\uD6C4 2:30).',
            pleaseCompleteForm: '\uACC4\uC18D\uD558\uB824\uBA74 \uC704\uC758 \uC591\uC2DD\uC744 \uC644\uC131\uD574\uC8FC\uC138\uC694.',
            pleaseSelectOne: '\uC704\uC758 \uC635\uC158 \uC911 \uD558\uB098\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.',
            invalidRateError: '\uC720\uD6A8\uD55C \uBE44\uC728\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            lowRateError: '\uBE44\uC728\uC740 0\uBCF4\uB2E4 \uCEE4\uC57C \uD569\uB2C8\uB2E4.',
            email: '\uC720\uD6A8\uD55C \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
        },
        comma: '\uC27C\uD45C',
        semicolon: '\uC138\uBBF8\uCF5C\uB860',
        please: '\uC81C\uBC1C',
        contactUs: '\uC800\uD76C\uC5D0\uAC8C \uC5F0\uB77D\uD558\uC138\uC694',
        pleaseEnterEmailOrPhoneNumber: '\uC774\uBA54\uC77C \uB610\uB294 \uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        fixTheErrors: '\uC624\uB958\uB97C \uC218\uC815\uD558\uC2ED\uC2DC\uC624',
        inTheFormBeforeContinuing: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uC591\uC2DD\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694',
        confirm: '\uD655\uC778',
        reset: '\uC7AC\uC124\uC815',
        done: '\uC644\uB8CC',
        more: '\uB354 \uBCF4\uAE30',
        debitCard: '\uC9C1\uBD88 \uCE74\uB4DC',
        bankAccount: '\uC740\uD589 \uACC4\uC88C',
        personalBankAccount: '\uAC1C\uC778 \uC740\uD589 \uACC4\uC88C',
        businessBankAccount: '\uBE44\uC988\uB2C8\uC2A4 \uC740\uD589 \uACC4\uC88C',
        join: '\uAC00\uC785',
        leave: '\uB5A0\uB098\uB2E4',
        decline: '\uAC70\uC808',
        transferBalance: '\uC794\uC561 \uC774\uCCB4',
        cantFindAddress: '\uB2F9\uC2E0\uC758 \uC8FC\uC18C\uB97C \uCC3E\uC744 \uC218 \uC5C6\uB098\uC694?',
        enterManually: '\uC218\uB3D9\uC73C\uB85C \uC785\uB825\uD558\uC138\uC694',
        message: '\uBA54\uC2DC\uC9C0',
        leaveThread: '\uC2A4\uB808\uB4DC \uB5A0\uB098\uAE30',
        you: '\uB2F9\uC2E0',
        youAfterPreposition: '\uB2F9\uC2E0',
        your: '\uB2F9\uC2E0\uC758',
        conciergeHelp: '\uB3C4\uC6C0\uC774 \uD544\uC694\uD558\uC2DC\uBA74 \uCEE8\uC2DC\uC5B4\uC9C0\uC5D0\uAC8C \uC5F0\uB77D\uD574\uC8FC\uC138\uC694.',
        youAppearToBeOffline: '\uC624\uD504\uB77C\uC778 \uC0C1\uD0DC\uB85C \uBCF4\uC785\uB2C8\uB2E4.',
        thisFeatureRequiresInternet: '\uC774 \uAE30\uB2A5\uC740 \uD65C\uC131\uD654\uB41C \uC778\uD130\uB137 \uC5F0\uACB0\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
        attachementWillBeAvailableOnceBackOnline:
            '\uCCA8\uBD80\uD30C\uC77C\uC740 \uB2E4\uC2DC \uC628\uB77C\uC778 \uC0C1\uD0DC\uAC00 \uB418\uBA74 \uC0AC\uC6A9\uD560 \uC218 \uC788\uAC8C \uB429\uB2C8\uB2E4.',
        areYouSure: '\uD655\uC2E4\uD558\uC138\uC694?',
        verify: '\uD655\uC778',
        yesContinue: '\uB124, \uACC4\uC18D\uD558\uC2ED\uC2DC\uC624',
        websiteExample: '\uC608: https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) =>
            zipSampleFormat ? `\uC608. ${zipSampleFormat}` : "You didn't provide any text to translate. Please provide the text.",
        description: '\uC124\uBA85',
        with: '\uC640 \uD568\uAED8',
        shareCode: '\uCF54\uB4DC \uACF5\uC720',
        share: '\uACF5\uC720\uD558\uAE30',
        per: 'per',
        mi: '\uB9C8\uC77C',
        km: '\uD0AC\uB85C\uBBF8\uD130',
        copied: '\uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
        someone: '\uB204\uAD70\uAC00',
        total: '\uCD1D\uACC4',
        edit: '\uD3B8\uC9D1',
        letsDoThis: `Let's do this!`,
        letsStart: `Let's start`,
        showMore: '\uB354 \uBCF4\uAE30',
        merchant: '\uC0C1\uC778',
        category: '\uCE74\uD14C\uACE0\uB9AC',
        billable: '\uCCAD\uAD6C \uAC00\uB2A5\uD55C',
        nonBillable: '\uBE44 \uCCAD\uAD6C \uAC00\uB2A5',
        tag: '\uD0DC\uADF8',
        receipt: '\uC601\uC218\uC99D',
        verified: '\uC778\uC99D\uB428',
        replace: '\uAD50\uCCB4\uD558\uB2E4',
        distance: '\uAC70\uB9AC',
        mile: '\uB9C8\uC77C',
        miles: '\uB9C8\uC77C',
        kilometer: '\uD0AC\uB85C\uBBF8\uD130',
        kilometers: '\uD0AC\uB85C\uBBF8\uD130',
        recent: '\uCD5C\uADFC',
        all: '\uBAA8\uB450',
        am: 'AM',
        pm: '\uC624\uD6C4',
        tbd: 'TBD',
        selectCurrency: '\uD1B5\uD654\uB97C \uC120\uD0DD\uD558\uC138\uC694',
        card: '\uCE74\uB4DC',
        whyDoWeAskForThis: '\uC65C \uC774\uAC83\uC744 \uC694\uCCAD\uD558\uB294\uAC00\uC694?',
        required: '\uD544\uC694\uD569\uB2C8\uB2E4',
        showing: '\uD45C\uC2DC \uC911',
        of: '\uC758',
        default: '\uAE30\uBCF8\uAC12',
        update: '\uC5C5\uB370\uC774\uD2B8',
        member: '\uBA64\uBC84',
        auditor: '\uAC10\uC0AC\uC6D0',
        role: '\uC5ED\uD560',
        currency: '\uD1B5\uD654',
        rate: '\uD3C9\uAC00',
        emptyLHN: {
            title: '\uC6B0\uD638\uD638! \uBAA8\uB450 \uB530\uB77C\uC7A1\uC558\uC5B4\uC694.',
            subtitleText1: '\uCC44\uD305\uC744 \uCC3E\uC73C\uB824\uBA74 \uC774\uB97C \uC0AC\uC6A9\uD558\uC2ED\uC2DC\uC624.',
            subtitleText2:
                '\uC704\uC758 \uBC84\uD2BC\uC744 \uC0AC\uC6A9\uD558\uAC70\uB098, ${username}\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBB34\uC5B8\uAC00\uB97C \uB9CC\uB4DC\uC2ED\uC2DC\uC624.',
            subtitleText3: '\uC544\uB798 \uBC84\uD2BC.',
        },
        businessName: '\uC0AC\uC5C5 \uC774\uB984',
        clear: '\uC9C0\uC6B0\uAE30',
        type: '\uD0C0\uC785',
        action: '\uD589\uB3D9',
        expenses: '\uBE44\uC6A9',
        tax: '\uC138\uAE08',
        shared: '\uACF5\uC720\uB428',
        drafts: '\uC784\uC2DC \uBCF4\uAD00\uD568',
        finished: '\uC644\uB8CC\uB428',
        upgrade: '\uC5C5\uADF8\uB808\uC774\uB4DC',
        downgradeWorkspace: '\uC791\uC5C5 \uACF5\uAC04 \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC',
        companyID: '\uD68C\uC0AC ID',
        userID: '\uC0AC\uC6A9\uC790 ID',
        disable: '\uBE44\uD65C\uC131\uD654',
        export: '\uB0B4\uBCF4\uB0B4\uAE30',
        initialValue: '\uCD08\uAE30 \uAC12',
        currentDate: '\uD604\uC7AC \uB0A0\uC9DC',
        value: '\uAC12',
        downloadFailedTitle: '\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328',
        downloadFailedDescription:
            '\uB2E4\uC6B4\uB85C\uB4DC\uB97C \uC644\uB8CC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        filterLogs: '\uB85C\uADF8 \uD544\uD130\uB9C1',
        network: '\uB124\uD2B8\uC6CC\uD06C',
        reportID: '\uBCF4\uACE0\uC11C ID',
        bankAccounts: '\uC740\uD589 \uACC4\uC88C',
        chooseFile: '\uD30C\uC77C \uC120\uD0DD',
        dropTitle: '\uADF8\uAC83\uC744 \uB0B4\uBC84\uB824\uB450\uC138\uC694',
        dropMessage: '\uC5EC\uAE30\uC5D0 \uD30C\uC77C\uC744 \uB193\uC73C\uC138\uC694',
        ignore: '\uBB34\uC2DC\uD558\uB2E4',
        enabled: '\uD65C\uC131\uD654\uB428',
        disabled: '\uBE44\uD65C\uC131\uD654\uB428',
        import: '\uAC00\uC838\uC624\uAE30',
        offlinePrompt: '\uC9C0\uAE08 \uC774 \uC791\uC5C5\uC744 \uC218\uD589\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        outstanding: '\uB6F0\uC5B4\uB09C',
        chats: '\uCC44\uD305\uB4E4',
        unread: '\uC77D\uC9C0 \uC54A\uC74C',
        sent: '\uBCF4\uB0C8\uC2B5\uB2C8\uB2E4',
        links: '\uB9C1\uD06C',
        days: '\uC77C',
        rename: '\uC774\uB984 \uBCC0\uACBD',
        address: '\uC8FC\uC18C',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: '\uAC74\uB108\uB6F0\uAE30',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `\uD2B9\uC815\uD55C \uAC83\uC774 \uD544\uC694\uD558\uC138\uC694? \uACC4\uC815 \uAD00\uB9AC\uC790\uC778 ${accountManagerDisplayName}\uB2D8\uACFC \uCC44\uD305\uD574\uBCF4\uC138\uC694.`,
        chatNow: '\uC9C0\uAE08 \uCC44\uD305\uD558\uAE30',
        destination: '\uBAA9\uC801\uC9C0',
        subrate: '\uC11C\uBE0C\uB808\uC774\uD2B8',
        perDiem: '\uC77C\uB2F9',
        validate: '\uC720\uD6A8\uC131 \uAC80\uC0AC',
    },
    supportalNoAccess: {
        title: '\uADF8\uB807\uAC8C \uBE60\uB974\uAC8C\uB294 \uC548 \uB3FC',
        description:
            '\uC9C0\uC6D0\uD300\uC774 \uB85C\uADF8\uC778\uD55C \uC0C1\uD0DC\uC5D0\uC11C\uB294 \uC774 \uC791\uC5C5\uC744 \uC218\uD589\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
    },
    location: {
        useCurrent: '\uD604\uC7AC \uC704\uCE58 \uC0AC\uC6A9',
        notFound:
            '\uC6B0\uB9AC\uB294 \uADC0\uD558\uC758 \uC704\uCE58\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC8FC\uC18C\uB97C \uC218\uB3D9\uC73C\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        permissionDenied: '\uB2F9\uC2E0\uC774 \uC704\uCE58 \uC815\uBCF4 \uC811\uADFC\uC744 \uAC70\uBD80\uD55C \uAC83 \uAC19\uC2B5\uB2C8\uB2E4.',
        please: '\uC81C\uBC1C',
        allowPermission: '\uC124\uC815\uC5D0\uC11C \uC704\uCE58 \uC811\uADFC\uC744 \uD5C8\uC6A9\uD558\uC138\uC694',
        tryAgain: '\uB2E4\uC2DC \uC2DC\uB3C4\uD574\uBCF4\uC138\uC694.',
    },
    anonymousReportFooter: {
        logoTagline: '\uD1A0\uB860\uC5D0 \uCC38\uC5EC\uD558\uC138\uC694.',
    },
    attachmentPicker: {
        cameraPermissionRequired: '\uCE74\uBA54\uB77C \uC811\uADFC',
        expensifyDoesntHaveAccessToCamera:
            'Expensify\uB294 \uCE74\uBA54\uB77C\uC5D0 \uB300\uD55C \uC561\uC138\uC2A4 \uAD8C\uD55C\uC774 \uC5C6\uC73C\uBA74 \uC0AC\uC9C4\uC744 \uCC0D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uAD8C\uD55C\uC744 \uC5C5\uB370\uC774\uD2B8\uD558\uB824\uBA74 \uC124\uC815\uC744 \uD0ED\uD558\uC138\uC694.',
        attachmentError: '\uCCA8\uBD80 \uC624\uB958',
        errorWhileSelectingAttachment:
            '\uCCA8\uBD80 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        errorWhileSelectingCorruptedAttachment:
            '\uC190\uC0C1\uB41C \uCCA8\uBD80 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uD30C\uC77C\uC744 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        takePhoto: '\uC0AC\uC9C4 \uCC0D\uAE30',
        chooseFromGallery: '\uAC24\uB7EC\uB9AC\uC5D0\uC11C \uC120\uD0DD\uD558\uC138\uC694',
        chooseDocument: '\uD30C\uC77C \uC120\uD0DD',
        attachmentTooLarge: '\uCCA8\uBD80\uD30C\uC77C\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4',
        sizeExceeded: '\uCCA8\uBD80 \uD30C\uC77C \uD06C\uAE30\uAC00 24 MB \uC81C\uD55C\uC744 \uCD08\uACFC\uD558\uC600\uC2B5\uB2C8\uB2E4',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) =>
            `\uCCA8\uBD80 \uD30C\uC77C \uD06C\uAE30\uAC00 ${maxUploadSizeInMB} MB \uC81C\uD55C\uBCF4\uB2E4 \uD07D\uB2C8\uB2E4`,
        attachmentTooSmall: '\uCCA8\uBD80\uD30C\uC77C\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4',
        sizeNotMet: '\uCCA8\uBD80 \uD30C\uC77C \uD06C\uAE30\uB294 240 \uBC14\uC774\uD2B8\uBCF4\uB2E4 \uCEE4\uC57C \uD569\uB2C8\uB2E4',
        wrongFileType: '\uC798\uBABB\uB41C \uD30C\uC77C \uC720\uD615',
        notAllowedExtension:
            '\uC774 \uD30C\uC77C \uC720\uD615\uC740 \uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uD30C\uC77C \uC720\uD615\uC744 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        folderNotAllowedMessage:
            '\uD3F4\uB354\uB97C \uC5C5\uB85C\uB4DC\uD558\uB294 \uAC83\uC740 \uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uD30C\uC77C\uC744 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        protectedPDFNotSupported: '\uBE44\uBC00\uBC88\uD638\uB85C \uBCF4\uD638\uB41C PDF\uB294 \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4',
        attachmentImageResized:
            '\uC774 \uC774\uBBF8\uC9C0\uB294 \uBBF8\uB9AC\uBCF4\uAE30\uB97C \uC704\uD574 \uD06C\uAE30\uAC00 \uC870\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC804\uCCB4 \uD574\uC0C1\uB3C4\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD558\uC138\uC694.',
        attachmentImageTooLarge: '\uC774 \uC774\uBBF8\uC9C0\uB294 \uC5C5\uB85C\uB4DC\uD558\uAE30 \uC804\uC5D0 \uBBF8\uB9AC\uBCF4\uAE30\uD558\uAE30\uC5D0 \uB108\uBB34 \uD07D\uB2C8\uB2E4.',
        tooManyFiles: ({fileLimit}: FileLimitParams) =>
            `\uD55C \uBC88\uC5D0 \uCD5C\uB300 ${fileLimit}\uAC1C\uC758 \uD30C\uC77C\uB9CC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) =>
            `\uD30C\uC77C\uC774 ${maxUploadSizeInMB} MB\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.`,
    },
    filePicker: {
        fileError: '\uD30C\uC77C \uC624\uB958',
        errorWhileSelectingFile:
            '\uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
    },
    connectionComplete: {
        title: '\uC5F0\uACB0 \uC644\uB8CC',
        supportingText: '\uC774 \uCC3D\uC744 \uB2EB\uACE0 Expensify \uC571\uC73C\uB85C \uB3CC\uC544\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
    },
    avatarCropModal: {
        title: '\uC0AC\uC9C4 \uD3B8\uC9D1',
        description: '\uB2F9\uC2E0\uC774 \uC6D0\uD558\uB294 \uB300\uB85C \uC774\uBBF8\uC9C0\uB97C \uB4DC\uB798\uADF8, \uC90C, \uD68C\uC804\uD558\uC138\uC694.',
    },
    composer: {
        noExtensionFoundForMimeType: 'mime \uD0C0\uC785\uC5D0 \uB300\uD55C \uD655\uC7A5\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
        problemGettingImageYouPasted: '\uBD99\uC5EC \uB123\uC740 \uC774\uBBF8\uC9C0\uB97C \uAC00\uC838\uC624\uB294 \uB370 \uBB38\uC81C\uAC00 \uC788\uC5C8\uC2B5\uB2C8\uB2E4',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `\uCD5C\uB300 \uB313\uAE00 \uAE38\uC774\uB294 ${formattedMaxLength}\uC790\uC785\uB2C8\uB2E4.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) =>
            `\uCD5C\uB300 \uC791\uC5C5 \uC81C\uBAA9 \uAE38\uC774\uB294 ${formattedMaxLength}\uC790\uC785\uB2C8\uB2E4.`,
    },
    baseUpdateAppModal: {
        updateApp: '\uC571 \uC5C5\uB370\uC774\uD2B8',
        updatePrompt:
            '\uC774 \uC571\uC758 \uC0C8 \uBC84\uC804\uC774 \uC0AC\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4.\n\uC9C0\uAE08 \uC5C5\uB370\uC774\uD2B8\uD558\uAC70\uB098 \uB098\uC911\uC5D0 \uC571\uC744 \uC7AC\uC2DC\uC791\uD558\uC5EC \uCD5C\uC2E0 \uBCC0\uACBD \uC0AC\uD56D\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD558\uC138\uC694.',
    },
    deeplinkWrapper: {
        launching: 'Expensify \uC2DC\uC791\uD558\uAE30',
        expired: '\uC138\uC158 \uC720\uD6A8\uAE30\uAC04\uC774 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        signIn: '\uB2E4\uC2DC \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.',
        redirectedToDesktopApp: '\uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC744 \uB370\uC2A4\uD06C\uD1B1 \uC571\uC73C\uB85C \uB9AC\uB514\uB809\uC158\uD588\uC2B5\uB2C8\uB2E4.',
        youCanAlso: '\uB2F9\uC2E0\uC740 \uB610\uD55C \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        openLinkInBrowser: '\uC774 \uB9C1\uD06C\uB97C \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC5F4\uC5B4\uC8FC\uC138\uC694',
        loggedInAs: ({email}: LoggedInAsParams) => `You're logged in as ${email}. Click "Open link" in the prompt to log into the desktop app with this account.`,
        doNotSeePrompt: '\uD504\uB86C\uD504\uD2B8\uB97C \uBCFC \uC218 \uC5C6\uB098\uC694?',
        tryAgain: '\uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694',
        or: ', \uB610\uB294',
        continueInWeb: '\uC6F9 \uC571\uC73C\uB85C \uACC4\uC18D \uC9C4\uD589\uD558\uC138\uC694',
    },
    validateCodeModal: {
        successfulSignInTitle: '\uC544\uBE0C\uB77C\uCE74\uB2E4\uBE0C\uB77C,\n\uB85C\uADF8\uC778 \uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
        successfulSignInDescription: '\uACC4\uC18D\uD558\uB824\uBA74 \uC6D0\uB798 \uD0ED\uC73C\uB85C \uB3CC\uC544\uAC00\uC138\uC694.',
        title: '\uB2E4\uC74C\uC740 \uB2F9\uC2E0\uC758 \uB9C8\uBC95 \uCF54\uB4DC\uC785\uB2C8\uB2E4',
        description: '\uC6D0\uB798 \uC694\uCCAD\uB41C \uC7A5\uCE58\uC5D0\uC11C \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        doNotShare:
            '\uB2F9\uC2E0\uC758 \uCF54\uB4DC\uB97C \uB204\uAD6C\uC640\uB3C4 \uACF5\uC720\uD558\uC9C0 \uB9C8\uC138\uC694.\nExpensify\uB294 \uC808\uB300\uB85C \uB2F9\uC2E0\uC5D0\uAC8C \uADF8\uAC83\uC744 \uC694\uCCAD\uD558\uC9C0 \uC54A\uC744 \uAC83\uC785\uB2C8\uB2E4!',
        or: ', \uB610\uB294',
        signInHere: '\uC5EC\uAE30\uC5D0 \uB85C\uADF8\uC778\uD558\uC2ED\uC2DC\uC624',
        expiredCodeTitle: '\uB9C8\uBC95 \uCF54\uB4DC\uAC00 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        expiredCodeDescription: '\uC6D0\uB798\uC758 \uC7A5\uCE58\uB85C \uB3CC\uC544\uAC00\uC11C \uC0C8 \uCF54\uB4DC\uB97C \uC694\uCCAD\uD558\uC2ED\uC2DC\uC624',
        successfulNewCodeRequest: '\uC694\uCCAD\uB41C \uCF54\uB4DC\uB97C \uD655\uC778\uD558\uC2ED\uC2DC\uC624. \uC7A5\uCE58\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        tfaRequiredTitle: '2\uB2E8\uACC4 \uC778\uC99D \uD544\uC694',
        tfaRequiredDescription: '\uB85C\uADF8\uC778\uD558\uB824\uB294 \uACF3\uC5D0 2\uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        requestOneHere: '\uC5EC\uAE30\uC5D0\uC11C \uD558\uB098\uB97C \uC694\uCCAD\uD558\uC138\uC694.',
    },
    moneyRequestConfirmationList: {
        paidBy: '\uC9C0\uBD88\uC790',
        whatsItFor: '\uC774\uAC83\uC740 \uC5B4\uB5A4 \uC6A9\uB3C4\uC778\uAC00\uC694?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '\uC774\uB984, \uC774\uBA54\uC77C, \uB610\uB294 \uC804\uD654\uBC88\uD638',
        findMember: '\uBA64\uBC84 \uCC3E\uAE30',
    },
    emptyList: {
        [CONST.IOU.TYPE.SUBMIT]: {
            title: '\uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uC2ED\uC2DC\uC624',
            subtitleText1: '\uB204\uAD70\uAC00\uC5D0\uAC8C \uC81C\uCD9C\uD558\uC2ED\uC2DC\uC624',
            subtitleText2: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694`,
            subtitleText3: '\uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uC5C8\uC744 \uB54C.',
        },
        [CONST.IOU.TYPE.SPLIT]: {
            title: '\uBE44\uC6A9\uC744 \uBD84\uD560\uD558\uB2E4',
            subtitleText1: '\uCE5C\uAD6C\uC640 \uB098\uB204\uAE30',
            subtitleText2: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694`,
            subtitleText3: '\uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uC5C8\uC744 \uB54C.',
        },
        [CONST.IOU.TYPE.PAY]: {
            title: '\uB204\uAD70\uAC00\uC5D0\uAC8C \uC9C0\uBD88\uD558\uB2E4',
            subtitleText1: '\uB204\uAD6C\uC5D0\uAC8C\uB098 \uC9C0\uBD88\uD558\uC138\uC694',
            subtitleText2: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694`,
            subtitleText3: '\uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uC5C8\uC744 \uB54C.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '\uD1B5\uD654 \uC608\uC57D\uD558\uAE30',
    },
    hello: '\uC548\uB155\uD558\uC138\uC694',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '\uC544\uB798\uC5D0\uC11C \uC2DC\uC791\uD558\uC138\uC694.',
        anotherLoginPageIsOpen: '\uB2E4\uB978 \uB85C\uADF8\uC778 \uD398\uC774\uC9C0\uAC00 \uC5F4\uB824 \uC788\uC2B5\uB2C8\uB2E4.',
        anotherLoginPageIsOpenExplanation:
            '\uB85C\uADF8\uC778 \uD398\uC774\uC9C0\uB97C \uBCC4\uB3C4\uC758 \uD0ED\uC5D0\uC11C \uC5F4\uC5C8\uC2B5\uB2C8\uB2E4. \uD574\uB2F9 \uD0ED\uC5D0\uC11C \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.',
        welcome: '\uD658\uC601\uD569\uB2C8\uB2E4!',
        welcomeWithoutExclamation: '\uD658\uC601\uD569\uB2C8\uB2E4',
        phrase2:
            '\uB3C8\uC740 \uB9D0\uD55C\uB2E4. \uADF8\uB9AC\uACE0 \uC774\uC81C \uCC44\uD305\uACFC \uACB0\uC81C\uAC00 \uD55C \uACF3\uC5D0 \uC788\uC73C\uB2C8, \uADF8\uAC83\uC740 \uB610\uD55C \uC27D\uC2B5\uB2C8\uB2E4.',
        phrase3:
            '\uB2F9\uC2E0\uC774 \uC8FC\uC7A5\uC744 \uBE60\uB974\uAC8C \uC804\uB2EC\uD560 \uC218 \uC788\uB294 \uB9CC\uD07C \uBE60\uB974\uAC8C \uACB0\uC81C\uAC00 \uC774\uB8E8\uC5B4\uC9D1\uB2C8\uB2E4.',
        enterPassword: '\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: '\uCC44\uD305\uC758 \uC18D\uB3C4\uB85C \uC5EC\uD589 \uBC0F \uBE44\uC6A9',
            body: 'Expensify\uC758 \uB2E4\uC74C \uC138\uB300\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4. \uC5EC\uAE30\uC11C\uB294 \uB9E5\uB77D\uC5D0 \uB530\uB978 \uC2E4\uC2DC\uAC04 \uCC44\uD305\uC758 \uB3C4\uC6C0\uC73C\uB85C \uC5EC\uD589\uACFC \uBE44\uC6A9\uC774 \uB354\uC6B1 \uBE60\uB974\uAC8C \uC9C4\uD589\uB429\uB2C8\uB2E4.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `\uB2F9\uC2E0\uC740 \uC774\uBBF8 ${email}\uB85C \uB85C\uADF8\uC778\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Don't want to sign in with ${provider}?`,
        continueWithMyCurrentSession: '\uD604\uC7AC \uC138\uC158\uC744 \uACC4\uC18D \uC9C4\uD589\uD558\uC138\uC694',
        redirectToDesktopMessage:
            '\uB85C\uADF8\uC778\uC744 \uC644\uB8CC\uD558\uBA74 \uB2F9\uC2E0\uC744 \uB370\uC2A4\uD06C\uD1B1 \uC571\uC73C\uB85C \uB9AC\uB514\uB809\uC158 \uD560 \uAC83\uC785\uB2C8\uB2E4.',
        signInAgreementMessage:
            "\uB85C\uADF8\uC778\uD568\uC73C\uB85C\uC368, \uB2F9\uC2E0\uC740 \uB3D9\uC758\uD569\uB2C8\uB2E4 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \uB4F1\uC758 \uD50C\uB808\uC774\uC2A4\uD640\uB354\uB97C \uADF8\uB300\uB85C \uC720\uC9C0\uD558\uC2ED\uC2DC\uC624. \uD50C\uB808\uC774\uC2A4\uD640\uB354\uC758 \uB0B4\uC6A9\uC740 \uBB38\uAD6C\uC5D0\uC11C \uADF8\uB4E4\uC774 \uB098\uD0C0\uB0B4\uB294 \uAC83\uC744 \uC124\uBA85\uD558\uC9C0\uB9CC, \uC0BC\uD56D \uD45C\uD604\uC2DD\uC774\uB098 \uB2E4\uB978 TypeScript \uCF54\uB4DC\uB97C \uD3EC\uD568\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBE48 \uBB38\uC790\uC5F4\uC744 \uBC88\uC5ED\uD558\uB77C\uB294 \uC694\uCCAD\uC774 \uC788\uC73C\uBA74 \uADF8\uB300\uB85C \uBC18\uD658\uD558\uC2ED\uC2DC\uC624. \uBB38\uC790\uC5F4\uC744 \uC790\uB974\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.",
        termsOfService: '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00',
        privacy: '\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638',
    },
    samlSignIn: {
        welcomeSAMLEnabled: '\uB2E8\uC77C \uB85C\uADF8\uC778\uC73C\uB85C \uACC4\uC18D \uB85C\uADF8\uC778\uD558\uC2ED\uC2DC\uC624:',
        orContinueWithMagicCode: '\uB2F9\uC2E0\uC740 \uB9C8\uBC95 \uCF54\uB4DC\uB85C\uB3C4 \uB85C\uADF8\uC778 \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        useSingleSignOn: '\uB2E8\uC77C \uB85C\uADF8\uC778\uC744 \uC0AC\uC6A9\uD558\uC138\uC694',
        useMagicCode: '\uB9C8\uBC95 \uCF54\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC2ED\uC2DC\uC624',
        launching: '\uC2DC\uC791 \uC911...',
        oneMoment:
            '\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC2ED\uC2DC\uC624. \uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC744 \uD68C\uC0AC\uC758 \uB2E8\uC77C \uB85C\uADF8\uC778 \uD3EC\uD138\uB85C \uB9AC\uB514\uB809\uC158\uD569\uB2C8\uB2E4.',
    },
    reportActionCompose: {
        dropToUpload: '\uC5C5\uB85C\uB4DC\uB97C \uC704\uD574 \uB4DC\uB86D\uD558\uC138\uC694',
        sendAttachment: '\uCCA8\uBD80\uD30C\uC77C \uBCF4\uB0B4\uAE30',
        addAttachment: '\uCCA8\uBD80 \uD30C\uC77C \uCD94\uAC00',
        writeSomething: '\uBB34\uC5B8\uAC00\uB97C \uC791\uC131\uD558\uC138\uC694...',
        blockedFromConcierge: '\uD1B5\uC2E0\uC774 \uCC28\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        fileUploadFailed: '\uC5C5\uB85C\uB4DC \uC2E4\uD328. \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uB294 \uD30C\uC77C\uC785\uB2C8\uB2E4.',
        localTime: ({user, time}: LocalTimeParams) => `It's ${time} for ${user}`,
        edited: "\"\uC774\uAC83\uC740 \uC77C\uBC18 \uBB38\uC790\uC5F4\uC774\uAC70\uB098 \uD15C\uD50C\uB9BF \uBB38\uC790\uC5F4\uC744 \uBC18\uD658\uD558\uB294 TypeScript \uD568\uC218\uC785\uB2C8\uB2E4. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \uB4F1\uC758 \uD50C\uB808\uC774\uC2A4\uD640\uB354\uB97C \uADF8 \uB0B4\uC6A9\uC744 \uC218\uC815\uD558\uAC70\uB098 \uAD04\uD638\uB97C \uC81C\uAC70\uD558\uC9C0 \uC54A\uACE0 \uC720\uC9C0\uD558\uC138\uC694. \uD50C\uB808\uC774\uC2A4\uD640\uB354\uC758 \uB0B4\uC6A9\uC740 \uBB38\uAD6C\uC5D0\uC11C \uADF8\uAC83\uB4E4\uC774 \uB098\uD0C0\uB0B4\uB294 \uAC83\uC744 \uC124\uBA85\uD558\uC9C0\uB9CC, \uC0BC\uD56D \uD45C\uD604\uC2DD\uC774\uB098 \uB2E4\uB978 TypeScript \uCF54\uB4DC\uB97C \uD3EC\uD568\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBE48 \uBB38\uC790\uC5F4\uC744 \uBC88\uC5ED\uD558\uB77C\uB294 \uC694\uCCAD\uC774 \uC788\uB2E4\uBA74 \uADF8\uB300\uB85C \uBC18\uD658\uD558\uC138\uC694. \uBB38\uC790\uC5F4\uC744 \uC790\uB974\uC9C0 \uB9C8\uC138\uC694.\"",
        emoji: '\uC774\uBAA8\uD2F0\uCF58',
        collapse: '\uCD95\uC18C',
        expand: '\uD655\uC7A5',
    },
    reportActionContextMenu: {
        copyToClipboard: '\uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC',
        copied: '\uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
        copyLink: '\uB9C1\uD06C \uBCF5\uC0AC',
        copyURLToClipboard: '\uD074\uB9BD\uBCF4\uB4DC\uC5D0 URL \uBCF5\uC0AC',
        copyEmailToClipboard: '\uC774\uBA54\uC77C\uC744 \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC',
        markAsUnread: '\uC77D\uC9C0 \uC54A\uC740 \uAC83\uC73C\uB85C \uD45C\uC2DC',
        markAsRead: '\uC77D\uC74C\uC73C\uB85C \uD45C\uC2DC',
        editAction: ({action}: EditActionParams) => `Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'expense' : 'comment'}`,
        deleteAction: ({action}: DeleteActionParams) => `Delete ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'expense' : 'comment'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `\uC815\uB9D0\uB85C \uC774 ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '비용' : '댓글'}\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`,
        onlyVisible: '${username}\uC5D0\uAC8C\uB9CC \uBCF4\uC785\uB2C8\uB2E4',
        replyInThread: '\uC2A4\uB808\uB4DC\uC5D0 \uB2F5\uC7A5',
        joinThread: '\uC2A4\uB808\uB4DC \uCC38\uC5EC',
        leaveThread: '\uC2A4\uB808\uB4DC \uB5A0\uB098\uAE30',
        copyOnyxData: 'Onyx \uB370\uC774\uD130 \uBCF5\uC0AC',
        flagAsOffensive: '\uACF5\uACA9\uC801\uC73C\uB85C \uD45C\uC2DC\uD558\uAE30',
        menu: '\uBA54\uB274',
    },
    emojiReactions: {
        addReactionTooltip: '\uBC18\uC751 \uCD94\uAC00',
        reactedWith: '\uBC18\uC751\uC744 \uBCF4\uC600\uC2B5\uB2C8\uB2E4.',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: '\uB2F9\uC2E0\uC740 \uD30C\uD2F0\uC5D0 \uBD88\uCC38\uD588\uC2B5\uB2C8\uB2E4.',
        beginningOfArchivedRoomPartTwo: ', \uC5EC\uAE30\uC5D0 \uBCFC \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `\uC774 \uCC44\uD305\uC740 ${domainRoom} \uB3C4\uBA54\uC778\uC758 \uBAA8\uB4E0 Expensify \uD68C\uC6D0\uACFC \uD568\uAED8\uD569\uB2C8\uB2E4.`,
        beginningOfChatHistoryDomainRoomPartTwo:
            '\uB3D9\uB8CC\uC640 \uCC44\uD305\uD558\uACE0, \uD301\uC744 \uACF5\uC720\uD558\uACE0, \uC9C8\uBB38\uC744 \uD558\uAE30 \uC704\uD574 \uC774\uB97C \uC0AC\uC6A9\uD558\uC138\uC694.',
        beginningOfChatHistoryAdminRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) =>
            `\uC774 \uCC44\uD305\uC740 ${workspaceName} \uAD00\uB9AC\uC790\uC640 \uD568\uAED8\uD569\uB2C8\uB2E4.`,
        beginningOfChatHistoryAdminRoomPartTwo: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC124\uC815 \uB4F1\uC5D0 \uB300\uD574 \uCC44\uD305\uD558\uB294 \uB370 \uC0AC\uC6A9\uD558\uC138\uC694.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) =>
            `\uC774 \uCC44\uD305\uC740 ${workspaceName}\uC758 \uBAA8\uB4E0 \uC0AC\uB78C\uB4E4\uACFC \uD568\uAED8\uD569\uB2C8\uB2E4.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: ` Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoomPartOne: '\uC774 \uCC44\uD305\uBC29\uC740 \uC5B4\uB5A4 \uAC83\uC774\uB4E0\uC9C0 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        beginningOfChatHistoryUserRoomPartTwo: '\uAD00\uB828\uB41C.',
        beginningOfChatHistoryInvoiceRoomPartOne: `This chat is for invoices between `,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Use the + button to send an invoice.`,
        beginningOfChatHistory: '\uC774 \uCC44\uD305\uC740\uC640 \uD568\uAED8\uD569\uB2C8\uB2E4',
        beginningOfChatHistoryPolicyExpenseChatPartOne: '\uC774\uACF3\uC774 \uC5B4\uB514\uC778\uC9C0',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: '\uB098\uB294 \uBE44\uC6A9\uC744 \uC81C\uCD9C\uD560 \uAC83\uC785\uB2C8\uB2E4',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. + \uBC84\uD2BC\uC744 \uC0AC\uC6A9\uD558\uC2ED\uC2DC\uC624.',
        beginningOfChatHistorySelfDM:
            '\uC774\uAC83\uC740 \uB2F9\uC2E0\uC758 \uAC1C\uC778 \uACF5\uAC04\uC785\uB2C8\uB2E4. \uBA54\uBAA8, \uC791\uC5C5, \uCD08\uC548, \uADF8\uB9AC\uACE0 \uC54C\uB9BC\uC744 \uC704\uD574 \uC0AC\uC6A9\uD558\uC138\uC694.',
        beginningOfChatHistorySystemDM: '\uD658\uC601\uD569\uB2C8\uB2E4! \uC124\uC815\uC744 \uC2DC\uC791\uD574\uBD05\uC2DC\uB2E4.',
        chatWithAccountManager: '\uC5EC\uAE30\uC5D0\uC11C \uACC4\uC815 \uAD00\uB9AC\uC790\uC640 \uCC44\uD305\uD558\uC138\uC694',
        sayHello: '\uC548\uB155\uD558\uC138\uC694!',
        yourSpace: '\uB2F9\uC2E0\uC758 \uACF5\uAC04',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welcome to ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `+ \uBC84\uD2BC\uC744 \uC0AC\uC6A9\uD558\uC5EC ${additionalText} \uBE44\uC6A9\uC744 \uCD94\uAC00\uD558\uC138\uC694.`,
        askConcierge: '\uC9C8\uBB38\uC744 \uD558\uACE0 24/7 \uC2E4\uC2DC\uAC04 \uC9C0\uC6D0\uC744 \uBC1B\uC73C\uC138\uC694.',
        conciergeSupport: '24/7 \uC9C0\uC6D0',
        create: '\uC0DD\uC131',
        iouTypes: {
            pay: '\uC9C0\uBD88',
            split: '\uBD84\uD560',
            submit: '\uC81C\uCD9C',
            track: '\uD2B8\uB799',
            invoice: '\uCCAD\uAD6C\uC11C',
        },
    },
    adminOnlyCanPost: '\uC774 \uBC29\uC5D0\uC11C\uB294 \uAD00\uB9AC\uC790\uB9CC\uC774 \uBA54\uC2DC\uC9C0\uB97C \uBCF4\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
    reportAction: {
        asCopilot: '\uCF54\uD30C\uC77C\uB7FF\uC73C\uB85C\uC11C',
    },
    mentionSuggestions: {
        hereAlternateText: '\uC774 \uB300\uD654\uC5D0 \uC788\uB294 \uBAA8\uB4E0 \uC0AC\uB78C\uC5D0\uAC8C \uC54C\uB9BC',
    },
    newMessages: '\uC0C8\uB85C\uC6B4 \uBA54\uC2DC\uC9C0',
    youHaveBeenBanned: '\uCC38\uACE0: \uC774 \uCC44\uB110\uC5D0\uC11C \uCC44\uD305\uC744 \uAE08\uC9C0\uB2F9\uD558\uC168\uC2B5\uB2C8\uB2E4.',
    reportTypingIndicator: {
        isTyping: '...\uC785\uB825 \uC911\uC785\uB2C8\uB2E4...',
        areTyping: '...\uC785\uB825 \uC911\uC785\uB2C8\uB2E4...',
        multipleMembers: '\uC5EC\uB7EC \uBA64\uBC84\uB4E4',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: '\uC774 \uCC44\uD305\uBC29\uC740 \uBCF4\uAD00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `\uC774 \uCC44\uD305\uC740 \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC65C\uB0D0\uD558\uBA74 ${displayName}\uC774(\uAC00) \uACC4\uC815\uC744 \uB2EB\uC558\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `\uC774 \uCC44\uD305\uC740 \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC65C\uB0D0\uD558\uBA74 ${oldDisplayName}\uC774(\uAC00) \uACC4\uC815\uC744 ${displayName}\uACFC \uD569\uCCE4\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `\uC774 \uCC44\uD305\uC740 \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC65C\uB0D0\uD558\uBA74 <strong>\uB2F9\uC2E0</strong>\uC774 \uB354 \uC774\uC0C1 ${policyName} \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC758 \uBA64\uBC84\uAC00 \uC544\uB2C8\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.`
                : `\uC774 \uCC44\uD305\uC740 \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC65C\uB0D0\uD558\uBA74 ${displayName}\uC774(\uAC00) ${policyName} \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC758 \uBA64\uBC84\uAC00 \uC544\uB2C8\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `\uC774 \uCC44\uD305\uC740 \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC65C\uB0D0\uD558\uBA74 ${policyName}\uC774(\uAC00) \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB41C \uC791\uC5C5 \uACF5\uAC04\uC774 \uC544\uB2C8\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `\uC774 \uCC44\uD305\uC740 \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC65C\uB0D0\uD558\uBA74 ${policyName}\uC774(\uAC00) \uB354 \uC774\uC0C1 \uD65C\uC131\uD654\uB41C \uC791\uC5C5 \uACF5\uAC04\uC774 \uC544\uB2C8\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: '\uC774 \uC608\uC57D\uC740 \uBCF4\uAD00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
    },
    writeCapabilityPage: {
        label: '\uB204\uAC00 \uAC8C\uC2DC\uD560 \uC218 \uC788\uB098\uC694',
        writeCapability: {
            all: '\uBAA8\uB4E0 \uBA64\uBC84\uB4E4',
            admins: '\uAD00\uB9AC\uC790 \uC804\uC6A9',
        },
    },
    sidebarScreen: {
        buttonFind: '\uBB34\uC5B8\uAC00\uB97C \uCC3E\uC544\uBCF4\uC138\uC694...',
        buttonMySettings: '\uB0B4 \uC124\uC815',
        fabNewChat: '\uCC44\uD305 \uC2DC\uC791',
        fabNewChatExplained: '\uCC44\uD305 \uC2DC\uC791 (\uD50C\uB85C\uD305 \uC561\uC158)',
        chatPinned: '\uCC44\uD305 \uACE0\uC815\uB428',
        draftedMessage: '\uC791\uC131\uB41C \uBA54\uC2DC\uC9C0',
        listOfChatMessages: '\uCC44\uD305 \uBA54\uC2DC\uC9C0 \uBAA9\uB85D',
        listOfChats: '\uCC44\uD305 \uBAA9\uB85D',
        saveTheWorld: '\uC138\uACC4\uB97C \uAD6C\uD558\uB2E4',
        tooltip: '\uC5EC\uAE30\uC5D0\uC11C \uC2DC\uC791\uD558\uC138\uC694!',
        redirectToExpensifyClassicModal: {
            title: '\uACE7 \uCD9C\uC2DC\uB429\uB2C8\uB2E4',
            description:
                '\uC6B0\uB9AC\uB294 New Expensify\uC758 \uBA87 \uAC00\uC9C0 \uBD80\uBD84\uC744 \uB354 \uC138\uBC00\uD558\uAC8C \uC870\uC815\uD558\uC5EC \uADC0\uD558\uC758 \uD2B9\uC815 \uC124\uC815\uC5D0 \uB9DE\uAC8C \uC870\uC815\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uADF8 \uB3D9\uC548\uC5D0\uB294 Expensify Classic\uC73C\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
        },
    },
    allSettingsScreen: {
        subscription: '\uAD6C\uB3C5',
        domains: '\uB3C4\uBA54\uC778',
    },
    tabSelector: {
        chat: '\uCC44\uD305',
        room: '\uBC29',
        distance: '\uAC70\uB9AC',
        manual: '\uB9E4\uB274\uC5BC',
        scan: '\uC2A4\uCE94',
    },
    spreadsheet: {
        upload: '\uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8\uB97C \uC5C5\uB85C\uB4DC\uD558\uC138\uC694',
        dragAndDrop:
            '\uC5EC\uAE30\uC5D0 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8\uB97C \uB4DC\uB798\uADF8 \uC564 \uB4DC\uB86D\uD558\uAC70\uB098, \uC544\uB798\uC5D0\uC11C \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uC9C0\uC6D0\uB418\uB294 \uD615\uC2DD: .csv, .txt, .xls, \uADF8\uB9AC\uACE0 .xlsx.',
        chooseSpreadsheet:
            '\uAC00\uC838\uC62C \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uC9C0\uC6D0\uB418\uB294 \uD615\uC2DD: .csv, .txt, .xls, .xlsx.',
        fileContainsHeader: '\uD30C\uC77C\uC5D0\uB294 \uC5F4 \uD5E4\uB354\uAC00 \uD3EC\uD568\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4',
        column: ({name}: SpreadSheetColumnParams) => `\uC5F4 ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `\uC774\uB7F0! \uD544\uC218 \uD544\uB4DC("${fieldName}")\uAC00 \uB9E4\uD551\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uAC80\uD1A0\uD558\uACE0 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `\uC774\uB7F0! \uB2F9\uC2E0\uC740 \uB2E8\uC77C \uD544\uB4DC("${fieldName}")\uB97C \uC5EC\uB7EC \uC5F4\uC5D0 \uB9E4\uD551\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uAC80\uD1A0\uD558\uACE0 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `\uC774\uB7F0! \uD544\uB4DC("${fieldName}")\uC5D0 \uD558\uB098 \uC774\uC0C1\uC758 \uBE48 \uAC12\uC774 \uD3EC\uD568\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uD655\uC778\uD558\uACE0 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.`,
        importSuccessfullTitle: '\uC131\uACF5\uC801\uC73C\uB85C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4',
        importCategoriesSuccessfullDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `${categories} categories have been added.` : '1\uAC1C\uC758 \uCE74\uD14C\uACE0\uB9AC\uAC00 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        importMembersSuccessfullDescription: ({members}: ImportMembersSuccessfullDescriptionParams) =>
            members > 1 ? `${members} members have been added.` : '1\uBA85\uC758 \uBA64\uBC84\uAC00 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        importTagsSuccessfullDescription: ({tags}: ImportTagsSuccessfullDescriptionParams) =>
            tags > 1 ? `${tags} tags have been added.` : '1\uAC1C\uC758 \uD0DC\uADF8\uAC00 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        importPerDiemRatesSuccessfullDescription: ({rates}: ImportPerDiemRatesSuccessfullDescriptionParams) =>
            rates > 1 ? `${rates} per diem rates have been added.` : '1\uAC1C\uC758 \uC77C\uC77C \uC694\uAE08\uC774 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        importFailedTitle: '\uAC00\uC838\uC624\uAE30 \uC2E4\uD328',
        importFailedDescription:
            '\uBAA8\uB4E0 \uD544\uB4DC\uAC00 \uC62C\uBC14\uB974\uAC8C \uC791\uC131\uB418\uC5C8\uB294\uC9C0 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694. \uBB38\uC81C\uAC00 \uACC4\uC18D\uB418\uBA74 \uCEE8\uC2DC\uC5B4\uC9C0\uC5D0 \uBB38\uC758\uD574 \uC8FC\uC138\uC694.',
        importDescription:
            '\uC544\uB798\uC5D0 \uAC00\uC838\uC628 \uAC01 \uC5F4 \uC606\uC758 \uB4DC\uB86D\uB2E4\uC6B4\uC744 \uD074\uB9AD\uD558\uC5EC \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8\uC5D0\uC11C \uB9E4\uD551\uD560 \uD544\uB4DC\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
        sizeNotMet: '\uD30C\uC77C \uD06C\uAE30\uB294 0 \uBC14\uC774\uD2B8\uBCF4\uB2E4 \uCEE4\uC57C \uD569\uB2C8\uB2E4',
        invalidFileMessage:
            '\uC5C5\uB85C\uB4DC\uD55C \uD30C\uC77C\uC774 \uBE44\uC5B4 \uC788\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uB370\uC774\uD130\uB97C \uD3EC\uD568\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uD30C\uC77C\uC774 \uC62C\uBC14\uB974\uAC8C \uD615\uC2DD\uD654\uB418\uC5B4 \uD544\uC694\uD55C \uC815\uBCF4\uB97C \uD3EC\uD568\uD558\uACE0 \uC788\uB294\uC9C0 \uD655\uC778\uD55C \uD6C4 \uB2E4\uC2DC \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
        importSpreadsheet: '\uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uAC00\uC838\uC624\uAE30',
        downloadCSV: 'CSV \uB2E4\uC6B4\uB85C\uB4DC',
    },
    receipt: {
        upload: '\uC601\uC218\uC99D \uC5C5\uB85C\uB4DC',
        dragReceiptBeforeEmail: '\uC774 \uD398\uC774\uC9C0\uC5D0 \uC601\uC218\uC99D\uC744 \uB4DC\uB798\uADF8\uD558\uAC70\uB098, \uC601\uC218\uC99D\uC744 \uC804\uB2EC\uD558\uC138\uC694',
        dragReceiptAfterEmail: '\uB610\uB294 \uC544\uB798\uC5D0\uC11C \uC5C5\uB85C\uB4DC\uD560 \uD30C\uC77C\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
        chooseReceipt: '\uC5C5\uB85C\uB4DC\uD560 \uC601\uC218\uC99D\uC744 \uC120\uD0DD\uD558\uAC70\uB098 \uC601\uC218\uC99D\uC744 \uC804\uB2EC\uD558\uC138\uC694',
        takePhoto: '\uC0AC\uC9C4\uC744 \uCC0D\uC73C\uC138\uC694',
        cameraAccess: '\uC601\uC218\uC99D \uC0AC\uC9C4\uC744 \uCC0D\uAE30 \uC704\uD574 \uCE74\uBA54\uB77C \uC811\uADFC\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
        deniedCameraAccess:
            '\uC544\uC9C1 \uCE74\uBA54\uB77C \uC811\uADFC \uAD8C\uD55C\uC774 \uBD80\uC5EC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4, \uB2E4\uC74C\uC744 \uB530\uB77C\uC8FC\uC2ED\uC2DC\uC624',
        deniedCameraAccessInstructions: '\uC774 \uC9C0\uC2DC\uC0AC\uD56D\uB4E4',
        cameraErrorTitle: '\uCE74\uBA54\uB77C \uC624\uB958',
        cameraErrorMessage: '\uC0AC\uC9C4\uC744 \uCC0D\uB294 \uB3C4\uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        locationAccessTitle: '\uC704\uCE58 \uC811\uADFC\uC744 \uD5C8\uC6A9\uD558\uC2ED\uC2DC\uC624',
        locationAccessMessage:
            '\uC704\uCE58 \uC811\uADFC\uC740 \uC5EC\uB7EC\uBD84\uC774 \uC5B4\uB514\uB85C \uAC00\uB4E0\uC9C0 \uC2DC\uAC04\uB300\uC640 \uD654\uD3D0\uB97C \uC815\uD655\uD558\uAC8C \uC720\uC9C0\uD558\uB294 \uB370 \uB3C4\uC6C0\uC744 \uC90D\uB2C8\uB2E4.',
        locationErrorTitle: '\uC704\uCE58 \uC811\uADFC\uC744 \uD5C8\uC6A9\uD558\uC2ED\uC2DC\uC624',
        locationErrorMessage:
            '\uC704\uCE58 \uC811\uADFC\uC740 \uC5EC\uB7EC\uBD84\uC774 \uC5B4\uB514\uB85C \uAC00\uB4E0\uC9C0 \uC2DC\uAC04\uB300\uC640 \uD654\uD3D0\uB97C \uC815\uD655\uD558\uAC8C \uC720\uC9C0\uD558\uB294 \uB370 \uB3C4\uC6C0\uC744 \uC90D\uB2C8\uB2E4.',
        allowLocationFromSetting: `Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: '\uADF8\uAC83\uC744 \uB0B4\uBC84\uB824\uB450\uC138\uC694',
        dropMessage: '\uC5EC\uAE30\uC5D0 \uD30C\uC77C\uC744 \uB193\uC73C\uC138\uC694',
        flash: '\uD50C\uB798\uC2DC',
        shutter: '\uC154\uD130',
        gallery: '\uAC24\uB7EC\uB9AC',
        deleteReceipt: '\uC601\uC218\uC99D \uC0AD\uC81C',
        deleteConfirmation: '\uC774 \uC601\uC218\uC99D\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        addReceipt: '\uC601\uC218\uC99D \uCD94\uAC00',
    },
    quickAction: {
        scanReceipt: '\uC601\uC218\uC99D \uC2A4\uCE94',
        recordDistance: '\uAE30\uB85D \uAC70\uB9AC',
        requestMoney: '\uBE44\uC6A9 \uC0DD\uC131',
        splitBill: '\uBE44\uC6A9 \uBD84\uD560',
        splitScan: '\uC601\uC218\uC99D \uBD84\uD560',
        splitDistance: '\uBD84\uD560 \uAC70\uB9AC',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pay ${name ?? 'someone'}`,
        assignTask: '\uC791\uC5C5 \uD560\uB2F9',
        header: '\uBE60\uB978 \uD589\uB3D9',
        trackManual: '\uBE44\uC6A9 \uC0DD\uC131',
        trackScan: '\uC601\uC218\uC99D \uC2A4\uCE94',
        trackDistance: '\uD2B8\uB799 \uAC70\uB9AC',
        noLongerHaveReportAccess:
            '\uC774\uC81C \uC774\uC804\uC758 \uBE60\uB978 \uC791\uC5C5 \uB300\uC0C1\uC5D0 \uB300\uD55C \uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC544\uB798\uC5D0\uC11C \uC0C8\uB85C\uC6B4 \uAC83\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
        updateDestination: '\uBAA9\uC801\uC9C0 \uC5C5\uB370\uC774\uD2B8',
    },
    iou: {
        amount: '\uAE08\uC561',
        taxAmount: '\uC138\uAE08 \uAE08\uC561',
        taxRate: '\uC138\uC728',
        approve: '\uC2B9\uC778',
        approved: '\uC2B9\uC778\uB428',
        cash: '\uD604\uAE08',
        card: '\uCE74\uB4DC',
        original: '\uC6D0\uBCF8',
        split: '\uBD84\uD560',
        splitExpense: '\uBE44\uC6A9 \uBD84\uD560',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pay ${name ?? 'someone'}`,
        expense: '\uBE44\uC6A9',
        categorize: '\uBD84\uB958\uD558\uB2E4',
        share: '\uACF5\uC720\uD558\uAE30',
        participants: '\uCC38\uAC00\uC790\uB4E4',
        createExpense: '\uBE44\uC6A9 \uC0DD\uC131',
        chooseRecipient: '\uC218\uC2E0\uC790 \uC120\uD0DD',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Create ${amount} expense`,
        confirmDetails: '\uC138\uBD80 \uC0AC\uD56D \uD655\uC778',
        pay: '\uC9C0\uBD88',
        cancelPayment: '\uACB0\uC81C \uCDE8\uC18C',
        cancelPaymentConfirmation: '\uC774 \uACB0\uC81C\uB97C \uCDE8\uC18C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        viewDetails: '\uC138\uBD80 \uC815\uBCF4 \uBCF4\uAE30',
        pending: '\uBCF4\uB958 \uC911',
        canceled: '\uCDE8\uC18C\uB428',
        posted: '\uAC8C\uC2DC\uB428',
        deleteReceipt: '\uC601\uC218\uC99D \uC0AD\uC81C',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) =>
            `\uC774 \uBCF4\uACE0\uC11C\uC5D0\uC11C \uBE44\uC6A9\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4, ${merchant} - ${amount}`,
        pendingMatchWithCreditCard: '\uCE74\uB4DC \uAC70\uB798\uC640 \uC77C\uCE58 \uB300\uAE30\uC911\uC778 \uC601\uC218\uC99D',
        pendingMatchWithCreditCardDescription:
            '\uCE74\uB4DC \uAC70\uB798\uC640\uC758 \uC601\uC218\uC99D \uB300\uAE30 \uC911. \uCDE8\uC18C\uD558\uB824\uBA74 \uD604\uAE08\uC73C\uB85C \uD45C\uC2DC\uD558\uC138\uC694.',
        markAsCash: '\uD604\uAE08\uC73C\uB85C \uD45C\uC2DC',
        routePending: '\uB8E8\uD2B8 \uB300\uAE30 \uC911...',
        receiptScanning: () => ({
            one: '\uC601\uC218\uC99D \uC2A4\uCE94 \uC911...',
            other: '\uC601\uC218\uC99D \uC2A4\uCE94 \uC911...',
        }),
        receiptScanInProgress: '\uC601\uC218\uC99D \uC2A4\uCE94 \uC9C4\uD589 \uC911',
        receiptScanInProgressDescription:
            '\uC601\uC218\uC99D \uC2A4\uCE94 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uD655\uC778\uD558\uAC70\uB098 \uC9C0\uAE08 \uBC14\uB85C \uC138\uBD80 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694.',
        receiptIssuesFound: () => ({
            one: '\uBC1C\uACAC\uB41C \uBB38\uC81C',
            other: '\uBC1C\uACAC\uB41C \uBB38\uC81C\uB4E4',
        }),
        fieldPending: '\uBCF4\uB958 \uC911...',
        defaultRate: '\uAE30\uBCF8 \uBE44\uC728',
        receiptMissingDetails: '\uC601\uC218\uC99D\uC5D0 \uB204\uB77D\uB41C \uC138\uBD80\uC0AC\uD56D',
        missingAmount: '\uB204\uB77D\uB41C \uAE08\uC561',
        missingMerchant: '\uB204\uB77D\uB41C \uC0C1\uC778',
        receiptStatusTitle: '\uC2A4\uCE94 \uC911\u2026',
        receiptStatusText:
            '\uC774 \uC601\uC218\uC99D\uC740 \uC2A4\uCE94 \uC911\uC77C \uB54C\uB9CC \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uD655\uC778\uD558\uAC70\uB098 \uC9C0\uAE08 \uC0C1\uC138 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694.',
        receiptScanningFailed:
            '\uC601\uC218\uC99D \uC2A4\uCE94\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC138\uBD80 \uC815\uBCF4\uB97C \uC218\uB3D9\uC73C\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        transactionPendingDescription:
            '\uAC70\uB798\uAC00 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4. \uAC8C\uC2DC\uB418\uB294 \uB370 \uBA87 \uC77C\uC774 \uAC78\uB9B4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        companyInfo: '\uD68C\uC0AC \uC815\uBCF4',
        companyInfoDescription:
            '\uCCAB \uBC88\uC9F8 \uC1A1\uC7A5\uC744 \uBCF4\uB0B4\uAE30 \uC804\uC5D0 \uBA87 \uAC00\uC9C0 \uB354 \uC790\uC138\uD55C \uC815\uBCF4\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.',
        yourCompanyName: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC \uC774\uB984',
        yourCompanyWebsite: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC \uC6F9\uC0AC\uC774\uD2B8',
        yourCompanyWebsiteNote:
            '\uC6F9\uC0AC\uC774\uD2B8\uAC00 \uC5C6\uB2E4\uBA74, \uB300\uC2E0 \uD68C\uC0AC\uC758 LinkedIn \uB610\uB294 \uC18C\uC15C \uBBF8\uB514\uC5B4 \uD504\uB85C\uD544\uC744 \uC81C\uACF5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        invalidDomainError:
            '\uB2F9\uC2E0\uC740 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uB3C4\uBA54\uC778\uC744 \uC785\uB825\uD558\uC168\uC2B5\uB2C8\uB2E4. \uACC4\uC18D\uD558\uB824\uBA74, \uC720\uD6A8\uD55C \uB3C4\uBA54\uC778\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        publicDomainError:
            '\uB2F9\uC2E0\uC740 \uACF5\uACF5 \uB3C4\uBA54\uC778\uC5D0 \uC811\uC18D\uD558\uC168\uC2B5\uB2C8\uB2E4. \uACC4\uC18D\uD558\uB824\uBA74, \uAC1C\uC778 \uB3C4\uBA54\uC778\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        expenseCount: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} scanning`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} pending`);
            }
            return {
                one: statusText.length > 0 ? `1 \uBE44\uC6A9 (${statusText.join(', ')})` : `1 expense`,
                other: (count: number) => (statusText.length > 0 ? `${count} expenses (${statusText.join(', ')})` : `${count} expenses`),
            };
        },
        deleteExpense: () => ({
            one: '\uBE44\uC6A9 \uC0AD\uC81C',
            other: '\uBE44\uC6A9 \uC0AD\uC81C',
        }),
        deleteConfirmation: () => ({
            one: '\uC774 \uBE44\uC6A9\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            other: '\uC774 \uBE44\uC6A9\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        }),
        settledExpensify: '\uC9C0\uBD88\uB428',
        settledElsewhere: '\uB2E4\uB978 \uACF3\uC5D0\uC11C \uC9C0\uBD88\uD568',
        individual: '\uAC1C\uC778',
        business: '\uBE44\uC988\uB2C8\uC2A4',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Expensify\uB85C ${formattedAmount} \uC9C0\uBD88\uD558\uC138\uC694` : `Pay with Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) =>
            formattedAmount ? `\uAC1C\uC778\uC73C\uB85C ${formattedAmount}\uB97C \uC9C0\uBD88\uD558\uC2ED\uC2DC\uC624` : `Pay as an individual`,
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Pay ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pay ${formattedAmount} as a business` : `Pay as a business`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) =>
            formattedAmount ? `\uB2E4\uB978 \uACF3\uC5D0\uC11C ${formattedAmount}\uB97C \uC9C0\uBD88\uD558\uC138\uC694` : `Pay elsewhere`,
        nextStep: '\uB2E4\uC74C \uB2E8\uACC4',
        finished: '\uC644\uB8CC\uB428',
        sendInvoice: ({amount}: RequestAmountParams) => `Send ${amount} invoice`,
        submitAmount: ({amount}: RequestAmountParams) => `submit ${amount}`,
        submittedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `submitted ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        automaticallySubmittedAmount: ({formattedAmount}: RequestedAmountMessageParams) =>
            `<a href="${CONST.DELAYED_SUBMISSION_HELP_URL}">\uC9C0\uC5F0 \uC81C\uCD9C</a>\uC744 \uD1B5\uD574 \uC790\uB3D9\uC73C\uB85C ${formattedAmount}\uB97C \uC81C\uCD9C\uD588\uC2B5\uB2C8\uB2E4`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracking ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `split ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `${comment ? `을 ${comment}에 대해 분할` : '을 분할'}`,
        yourSplit: ({amount}: UserSplitParams) => `\uB2F9\uC2E0\uC758 \uBD84\uD560 ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} owes ${amount}${comment ? ` for ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} owes: `,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${amount}\uB97C \uC9C0\uBD88\uD588\uC2B5\uB2C8\uB2E4`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} paid: `,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} spent ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} spent: `,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} approved:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} approved ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `paid ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApprovedAmount: ({amount}: ApprovedAmountParams) =>
            `<a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uADDC\uCE59</a>\uC744 \uD1B5\uD574 \uC790\uB3D9\uC73C\uB85C ${amount}\uC744(\uB97C) \uC2B9\uC778\uD588\uC2B5\uB2C8\uB2E4`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `\uC2B9\uC778\uB41C ${amount}`,
        unapprovedAmount: ({amount}: UnapprovedParams) => `\uBBF8\uC2B9\uC778 ${amount}`,
        automaticallyForwardedAmount: ({amount}: ForwardedAmountParams) =>
            `<a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uADDC\uCE59</a>\uC744 \uD1B5\uD574 \uC790\uB3D9\uC73C\uB85C ${amount}\uC744(\uB97C) \uC2B9\uC778\uD588\uC2B5\uB2C8\uB2E4`,
        forwardedAmount: ({amount}: ForwardedAmountParams) => `\uC2B9\uC778\uB41C ${amount}`,
        rejectedThisReport: '\uC774 \uBCF4\uACE0\uC11C\uB97C \uAC70\uBD80\uD588\uC2B5\uB2C8\uB2E4',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\uC815\uC0B0\uC744 \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4. ${submitterDisplayName}\uC774(\uAC00) \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD560 \uB54C\uAE4C\uC9C0 \uACB0\uC81C\uB294 \uBCF4\uB958 \uC0C1\uD0DC\uC785\uB2C8\uB2E4.`,
        adminCanceledRequest: ({manager, amount}: AdminCanceledRequestParams) => `${amount} \uACB0\uC81C\uB97C \uCDE8\uC18C\uD588\uC2B5\uB2C8\uB2E4`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhereWithAmount: ({payer, amount}: PaidElsewhereWithAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount} elsewhere`,
        paidWithExpensifyWithAmount: ({payer, amount}: PaidWithExpensifyWithAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount} with Expensify`,
        automaticallyPaidWithExpensify: ({payer, amount}: PaidWithExpensifyWithAmountParams) =>
            `${payer ? `${payer} ` : ''}automatically paid ${amount} with Expensify via <a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">workspace rules</a>`,
        noReimbursableExpenses: '\uC774 \uBCF4\uACE0\uC11C\uC5D0\uB294 \uC798\uBABB\uB41C \uAE08\uC561\uC774 \uC788\uC2B5\uB2C8\uB2E4',
        pendingConversionMessage: '\uC628\uB77C\uC778\uC73C\uB85C \uB3CC\uC544\uC624\uC2E4 \uB54C \uCD1D\uACC4\uAC00 \uC5C5\uB370\uC774\uD2B8\uB429\uB2C8\uB2E4',
        changedTheExpense: '\uBE44\uC6A9\uC744 \uBCC0\uACBD\uD588\uC2B5\uB2C8\uB2E4',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `for ${comment}` : 'expense'}`,
        threadTrackReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `Tracking ${formattedAmount} ${comment ? `for ${comment}` : ''}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} sent${comment ? ` for ${comment}` : ''}`,
        movedFromSelfDM: ({workspaceName, reportName}: MovedFromSelfDMParams) =>
            `\uC790\uCCB4 DM\uC5D0\uC11C \uBE44\uC6A9\uC744 ${workspaceName ?? `${reportName}와의 채팅`}\uC73C\uB85C \uC774\uB3D9\uD588\uC2B5\uB2C8\uB2E4.`,
        movedToSelfDM: '\uC790\uAE30 DM\uC73C\uB85C \uBE44\uC6A9 \uC774\uB3D9',
        tagSelection: '\uB2F9\uC2E0\uC758 \uC9C0\uCD9C\uC744 \uB354 \uC798 \uC815\uB9AC\uD558\uAE30 \uC704\uD574 \uD0DC\uADF8\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
        categorySelection: '\uB2F9\uC2E0\uC758 \uC9C0\uCD9C\uC744 \uB354 \uC798 \uC815\uB9AC\uD558\uAE30 \uC704\uD574 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
        error: {
            invalidCategoryLength:
                '\uCE74\uD14C\uACE0\uB9AC \uC774\uB984\uC774 255\uC790\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4. \uC774\uB984\uC744 \uC904\uC774\uAC70\uB098 \uB2E4\uB978 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            invalidAmount: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uC720\uD6A8\uD55C \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            invalidIntegerAmount: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uC815\uC218 \uB2EC\uB7EC \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `\uCD5C\uB300 \uC138\uAE08 \uAE08\uC561\uC740 ${amount}\uC785\uB2C8\uB2E4`,
            invalidSplit: '\uBD84\uD560\uC758 \uD569\uC740 \uCD1D\uC561\uACFC \uAC19\uC544\uC57C \uD569\uB2C8\uB2E4.',
            invalidSplitParticipants:
                '\uC801\uC5B4\uB3C4 \uB450 \uBA85\uC758 \uCC38\uAC00\uC790\uC5D0 \uB300\uD574 0\uBCF4\uB2E4 \uD070 \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            invalidSplitYourself: '\uB2F9\uC2E0\uC758 \uBD84\uD560\uC5D0 \uB300\uD574 0\uC774 \uC544\uB2CC \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            noParticipantSelected: '\uCC38\uAC00\uC790\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            other: '\uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uC785\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            genericCreateFailureMessage:
                '\uC774 \uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            genericCreateInvoiceFailureMessage:
                '\uC774 \uC778\uBCF4\uC774\uC2A4\uB97C \uBCF4\uB0B4\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            genericHoldExpenseFailureMessage:
                '\uC774 \uBE44\uC6A9\uC744 \uCC98\uB9AC\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            genericUnholdExpenseFailureMessage:
                '\uC774 \uBE44\uC6A9\uC744 \uBCF4\uB958 \uD574\uC81C\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            receiptDeleteFailureError:
                '\uC774 \uC601\uC218\uC99D\uC744 \uC0AD\uC81C\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            receiptFailureMessage: '\uC601\uC218\uC99D\uC774 \uC5C5\uB85C\uB4DC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.',
            // eslint-disable-next-line rulesdir/use-periods-for-error-messages
            saveFileMessage: '\uD30C\uC77C\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD558\uC2ED\uC2DC\uC624',
            loseFileMessage: '\uB610\uB294 \uC774 \uC624\uB958\uB97C \uBB34\uC2DC\uD558\uACE0 \uC783\uC5B4\uBC84\uB9AC\uC2ED\uC2DC\uC624.',
            genericDeleteFailureMessage:
                '\uC774 \uBE44\uC6A9\uC744 \uC0AD\uC81C\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            genericEditFailureMessage:
                '\uC774 \uBE44\uC6A9\uC744 \uD3B8\uC9D1\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            genericSmartscanFailureMessage: '\uD2B8\uB79C\uC7AD\uC158\uC774 \uD544\uB4DC\uB97C \uB204\uB77D\uD558\uC600\uC2B5\uB2C8\uB2E4.',
            duplicateWaypointsErrorMessage: '\uC911\uBCF5\uB41C \uC6E8\uC774\uD3EC\uC778\uD2B8\uB97C \uC81C\uAC70\uD574 \uC8FC\uC138\uC694.',
            atLeastTwoDifferentWaypoints: '\uC801\uC5B4\uB3C4 \uB450 \uAC1C\uC758 \uB2E4\uB978 \uC8FC\uC18C\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            splitExpenseMultipleParticipantsErrorMessage:
                '\uBE44\uC6A9\uC740 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC640 \uB2E4\uB978 \uBA64\uBC84\uB4E4 \uC0AC\uC774\uC5D0 \uB098\uB20C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC120\uD0DD \uC0AC\uD56D\uC744 \uC5C5\uB370\uC774\uD2B8\uD574 \uC8FC\uC138\uC694.',
            invalidMerchant: '\uC815\uD655\uD55C \uC0C1\uC778\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            atLeastOneAttendee: '\uC801\uC5B4\uB3C4 \uD55C \uBA85\uC758 \uCC38\uC11D\uC790\uAC00 \uC120\uD0DD\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4',
            invalidQuantity: '\uC720\uD6A8\uD55C \uC218\uB7C9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            quantityGreaterThanZero: '\uC218\uB7C9\uC740 0\uBCF4\uB2E4 \uCEE4\uC57C \uD569\uB2C8\uB2E4.',
            invalidSubrateLength: '\uC801\uC5B4\uB3C4 \uD558\uB098\uC758 \uC11C\uBE0C\uB808\uC774\uD2B8\uAC00 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4.',
            invalidRate:
                '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uB300\uD55C \uC720\uD6A8\uD55C \uC694\uAE08\uC774 \uC544\uB2D9\uB2C8\uB2E4. \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0\uC11C \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC694\uAE08\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
        },
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\uC815\uC0B0\uC744 \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4. ${submitterDisplayName}\uC774(\uAC00) \uC9C0\uAC11\uC744 \uD65C\uC131\uD654\uD560 \uB54C\uAE4C\uC9C0 \uACB0\uC81C\uB294 \uBCF4\uB958 \uC0C1\uD0DC\uC785\uB2C8\uB2E4.`,
        enableWallet: '\uC9C0\uAC11 \uD65C\uC131\uD654',
        hold: '\uD640\uB4DC',
        unhold: '\uD574\uC81C',
        holdExpense: '\uBE44\uC6A9\uC744 \uBCF4\uC720\uD558\uB2E4',
        unholdExpense: '\uBCF4\uB958\uB418\uC9C0 \uC54A\uC740 \uBE44\uC6A9',
        heldExpense: '\uC774 \uBE44\uC6A9\uC744 \uBD80\uB2F4\uD588\uC2B5\uB2C8\uB2E4',
        unheldExpense: '\uC774 \uBE44\uC6A9\uC744 \uCC98\uB9AC\uD558\uC9C0 \uC54A\uC74C',
        explainHold: '\uC774 \uBE44\uC6A9\uC744 \uBD80\uB2F4\uD558\uB294 \uC774\uC720\uB97C \uC124\uBA85\uD558\uC2ED\uC2DC\uC624.',
        reason: '\uC774\uC720',
        holdReasonRequired: '\uBCF4\uB958\uD560 \uB54C\uB294 \uC774\uC720\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.',
        expenseOnHold:
            '\uC774 \uBE44\uC6A9\uC740 \uBCF4\uB958\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uB2E8\uACC4\uC5D0 \uB300\uD55C \uCF54\uBA58\uD2B8\uB97C \uAC80\uD1A0\uD574 \uC8FC\uC138\uC694.',
        expensesOnHold:
            '\uBAA8\uB4E0 \uBE44\uC6A9\uC774 \uBCF4\uB958\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uB2E8\uACC4\uB97C \uC704\uD574 \uB313\uAE00\uC744 \uAC80\uD1A0\uD574\uC8FC\uC138\uC694.',
        expenseDuplicate:
            '\uC774 \uBE44\uC6A9\uC740 \uB2E4\uB978 \uBE44\uC6A9\uACFC \uB3D9\uC77C\uD55C \uC138\uBD80 \uC0AC\uD56D\uC744 \uAC00\uC9C0\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC911\uBCF5 \uD56D\uBAA9\uC744 \uAC80\uD1A0\uD558\uC5EC \uBCF4\uB958 \uC0C1\uD0DC\uB97C \uD574\uC81C\uD574 \uC8FC\uC138\uC694.',
        someDuplicatesArePaid:
            '\uC774 \uC911 \uC77C\uBD80 \uC911\uBCF5 \uD56D\uBAA9\uB4E4\uC740 \uC774\uBBF8 \uC2B9\uC778\uB418\uC5C8\uAC70\uB098 \uC9C0\uBD88\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        reviewDuplicates: '\uC911\uBCF5 \uAC80\uD1A0',
        keepAll: '\uBAA8\uB450 \uC720\uC9C0\uD558\uC138\uC694',
        confirmApprove: '\uC2B9\uC778 \uAE08\uC561 \uD655\uC778',
        confirmApprovalAmount:
            '\uADDC\uC815\uC5D0 \uB9DE\uB294 \uBE44\uC6A9\uB9CC \uC2B9\uC778\uD558\uAC70\uB098, \uC804\uCCB4 \uBCF4\uACE0\uC11C\uB97C \uC2B9\uC778\uD558\uC2ED\uC2DC\uC624.',
        confirmApprovalAllHoldAmount: () => ({
            one: '\uC774 \uBE44\uC6A9\uC740 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4. \uADF8\uB798\uB3C4 \uC2B9\uC778\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            other: '\uC774 \uBE44\uC6A9\uB4E4\uC740 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4. \uADF8\uB798\uB3C4 \uC2B9\uC778\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        }),
        confirmPay: '\uACB0\uC81C \uAE08\uC561 \uD655\uC778',
        confirmPayAmount: '\uBCF4\uB958 \uC911\uC774 \uC544\uB2CC \uAC83\uC744 \uC9C0\uBD88\uD558\uAC70\uB098, \uC804\uCCB4 \uBCF4\uACE0\uC11C\uB97C \uC9C0\uBD88\uD558\uC2ED\uC2DC\uC624.',
        confirmPayAllHoldAmount: () => ({
            one: '\uC774 \uBE44\uC6A9\uC740 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4. \uADF8\uB798\uB3C4 \uC9C0\uBD88\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            other: '\uC774 \uBE44\uC6A9\uB4E4\uC740 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4. \uADF8\uB798\uB3C4 \uACB0\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        }),
        payOnly: '\uC624\uC9C1 \uC9C0\uBD88\uD558\uC138\uC694',
        approveOnly: '\uC2B9\uC778\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4',
        holdEducationalTitle: '\uC774 \uC694\uCCAD\uC740 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4',
        holdEducationalText: '\uBCF4\uB958',
        whatIsHoldExplain:
            '\uBCF4\uB958\uB294 \uC2B9\uC778\uC774\uB098 \uC9C0\uBD88 \uC804\uC5D0 \uB354 \uC790\uC138\uD55C \uB0B4\uC6A9\uC744 \uC694\uCCAD\uD558\uAE30 \uC704\uD574 \uBE44\uC6A9\uC5D0 "\uC77C\uC2DC \uC815\uC9C0"\uB97C \uB204\uB974\uB294 \uAC83\uACFC \uAC19\uC2B5\uB2C8\uB2E4.',
        holdIsLeftBehind: '\uC804\uCCB4 \uBCF4\uACE0\uC11C\uB97C \uC2B9\uC778\uD558\uB354\uB77C\uB3C4 \uBCF4\uB958\uB41C \uBE44\uC6A9\uC740 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4.',
        unholdWhenReady: '\uC2B9\uC778\uD558\uAC70\uB098 \uC9C0\uBD88\uD560 \uC900\uBE44\uAC00 \uB418\uC5C8\uC744 \uB54C \uBE44\uC6A9\uC744 \uBCF4\uB958 \uD574\uC81C\uD558\uC138\uC694.',
        set: '\uC124\uC815',
        changed: '\uBCC0\uACBD\uB428',
        removed: '\uC81C\uAC70\uB428',
        transactionPending: '\uAC70\uB798 \uB300\uAE30 \uC911.',
        chooseARate: '\uB9C8\uC77C \uB610\uB294 \uD0AC\uB85C\uBBF8\uD130\uB2F9 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uD658\uBD88 \uBE44\uC728\uC744 \uC120\uD0DD\uD558\uC138\uC694',
        unapprove: '\uC2B9\uC778 \uCDE8\uC18C',
        unapproveReport: '\uBCF4\uACE0\uC11C \uC2B9\uC778 \uCDE8\uC18C',
        headsUp: '\uC8FC\uC758\uD558\uC138\uC694!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `\uC774 \uBCF4\uACE0\uC11C\uB294 \uC774\uBBF8 ${accountingIntegration}\uB85C \uB0B4\uBCF4\uB0B4\uC84C\uC2B5\uB2C8\uB2E4. Expensify\uC5D0\uC11C \uC774 \uBCF4\uACE0\uC11C\uB97C \uBCC0\uACBD\uD558\uBA74 \uB370\uC774\uD130 \uBD88\uC77C\uCE58\uC640 Expensify Card \uB300\uC870 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC774 \uBCF4\uACE0\uC11C\uC758 \uC2B9\uC778\uC744 \uCDE8\uC18C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`,
        reimbursable: '\uD658\uBD88 \uAC00\uB2A5\uD55C',
        nonReimbursable: '\uBE44\uD658\uAE09 \uAC00\uB2A5\uD558\uC9C0 \uC54A\uC740',
        bookingPending: '\uC774 \uC608\uC57D\uC740 \uB300\uAE30 \uC911\uC785\uB2C8\uB2E4',
        bookingPendingDescription: '\uC774 \uC608\uC57D\uC740 \uC544\uC9C1 \uACB0\uC81C\uB418\uC9C0 \uC54A\uC544 \uB300\uAE30 \uC911\uC785\uB2C8\uB2E4.',
        bookingArchived: '\uC774 \uC608\uC57D\uC740 \uBCF4\uAD00\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        bookingArchivedDescription:
            '\uC774 \uC608\uC57D\uC740 \uC5EC\uD589 \uB0A0\uC9DC\uAC00 \uC9C0\uB098\uC11C \uBCF4\uAD00\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD544\uC694\uD55C \uACBD\uC6B0 \uCD5C\uC885 \uAE08\uC561\uC5D0 \uB300\uD55C \uBE44\uC6A9\uC744 \uCD94\uAC00\uD558\uC138\uC694.',
        attendees: '\uCC38\uC11D\uC790\uB4E4',
        paymentComplete: '\uACB0\uC81C \uC644\uB8CC',
        time: '\uC2DC\uAC04',
        startDate: '\uC2DC\uC791 \uB0A0\uC9DC',
        endDate: '\uC885\uB8CC \uB0A0\uC9DC',
        startTime: '\uC2DC\uC791 \uC2DC\uAC04',
        endTime: '\uC885\uB8CC \uC2DC\uAC04',
        deleteSubrate: '\uD558\uC704 \uC694\uAE08 \uC0AD\uC81C',
        deleteSubrateConfirmation: '\uC774 \uC11C\uBE0C\uB808\uC774\uD2B8\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        quantity: '\uC218\uB7C9',
        subrateSelection: '\uD558\uC704 \uC694\uAE08\uC744 \uC120\uD0DD\uD558\uACE0 \uC218\uB7C9\uC744 \uC785\uB825\uD558\uC138\uC694.',
        qty: '\uC218\uB7C9',
        firstDayText: () => ({
            one: `First day: 1 hour`,
            other: (count: number) => `\uCCAB \uB0A0: ${count.toFixed(2)} \uC2DC\uAC04`,
        }),
        lastDayText: () => ({
            one: `Last day: 1 hour`,
            other: (count: number) => `\uB9C8\uC9C0\uB9C9 \uB0A0: ${count.toFixed(2)} \uC2DC\uAC04`,
        }),
        tripLengthText: () => ({
            one: `Trip: 1 full day`,
            other: (count: number) => `\uC5EC\uD589: ${count} \uC804\uCCB4 \uC77C\uC218`,
        }),
        dates: '\uB0A0\uC9DC\uB4E4',
        rates: '\uC694\uAE08',
        submitsTo: ({name}: SubmitsToParams) => `Submits to ${name}`,
    },
    notificationPreferencesPage: {
        header: '\uC54C\uB9BC \uC120\uD638 \uC124\uC815',
        label: '\uC0C8 \uBA54\uC2DC\uC9C0\uC5D0 \uB300\uD574 \uC54C\uB824\uC8FC\uC138\uC694',
        notificationPreferences: {
            always: '\uC989\uC2DC',
            daily: '\uB9E4\uC77C',
            mute: '\uC74C\uC18C\uAC70',
            hidden: '\uC228\uACA8\uC9C4',
        },
    },
    loginField: {
        numberHasNotBeenValidated:
            '\uBC88\uD638\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC5EC \uD14D\uC2A4\uD2B8\uB97C \uD1B5\uD574 \uC720\uD6A8\uC131 \uD655\uC778 \uB9C1\uD06C\uB97C \uB2E4\uC2DC \uBCF4\uB0B4\uC138\uC694.',
        emailHasNotBeenValidated:
            '\uC774\uBA54\uC77C\uC774 \uD655\uC778\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC5EC \uD14D\uC2A4\uD2B8\uB97C \uD1B5\uD574 \uD655\uC778 \uB9C1\uD06C\uB97C \uB2E4\uC2DC \uBCF4\uB0B4\uC2ED\uC2DC\uC624.',
    },
    avatarWithImagePicker: {
        uploadPhoto: '\uC0AC\uC9C4 \uC5C5\uB85C\uB4DC',
        removePhoto: '\uC0AC\uC9C4 \uC81C\uAC70',
        editImage: '\uC0AC\uC9C4 \uD3B8\uC9D1',
        viewPhoto: '\uC0AC\uC9C4 \uBCF4\uAE30',
        imageUploadFailed: '\uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC \uC2E4\uD328',
        deleteWorkspaceError:
            '\uC8C4\uC1A1\uD569\uB2C8\uB2E4, \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC544\uBC14\uD0C0\uB97C \uC0AD\uC81C\uD558\uB294 \uB370 \uC608\uC0C1\uCE58 \uBABB\uD55C \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) =>
            `\uC120\uD0DD\uD55C \uC774\uBBF8\uC9C0\uB294 \uCD5C\uB300 \uC5C5\uB85C\uB4DC \uD06C\uAE30\uC778 ${maxUploadSizeInMB} MB\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) =>
            `\uD504\uB85C\uD544 \uC0AC\uC9C4\uC740 \uB2E4\uC74C \uC720\uD615 \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${allowedExtensions.join(', ')}.`,
    },
    profilePage: {
        profile: '\uD504\uB85C\uD544',
        preferredPronouns: '\uC120\uD638\uD558\uB294 \uB300\uBA85\uC0AC',
        selectYourPronouns: '\uB2F9\uC2E0\uC758 \uB300\uBA85\uC0AC\uB97C \uC120\uD0DD\uD558\uC138\uC694',
        selfSelectYourPronoun: '\uC790\uC2E0\uC758 \uB300\uBA85\uC0AC\uB97C \uC120\uD0DD\uD558\uC138\uC694',
        emailAddress: '\uC774\uBA54\uC77C \uC8FC\uC18C',
        setMyTimezoneAutomatically: '\uB098\uC758 \uC2DC\uAC04\uB300\uB97C \uC790\uB3D9\uC73C\uB85C \uC124\uC815\uD558\uC138\uC694',
        timezone: '\uC2DC\uAC04\uB300',
        invalidFileMessage: '\uC798\uBABB\uB41C \uD30C\uC77C\uC785\uB2C8\uB2E4. \uB2E4\uB978 \uC774\uBBF8\uC9C0\uB97C \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        avatarUploadFailureMessage:
            '\uC544\uBC14\uD0C0\uB97C \uC5C5\uB85C\uB4DC\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        online: '\uC628\uB77C\uC778',
        offline: '\uC624\uD504\uB77C\uC778',
        syncing: '\uB3D9\uAE30\uD654 \uC911',
        profileAvatar: '\uD504\uB85C\uD544 \uC544\uBC14\uD0C0',
        publicSection: {
            title: '\uACF5\uAC1C',
            subtitle:
                '\uC774 \uC138\uBD80 \uC0AC\uD56D\uC740 \uACF5\uAC1C \uD504\uB85C\uD544\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4. \uB204\uAD6C\uB098 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        },
        privateSection: {
            title: '\uAC1C\uC778\uC801\uC778',
            subtitle:
                '\uC774 \uC138\uBD80\uC0AC\uD56D\uB4E4\uC740 \uC5EC\uD589 \uBC0F \uACB0\uC81C\uC5D0 \uC0AC\uC6A9\uB429\uB2C8\uB2E4. \uC774\uB4E4\uC740 \uACF5\uAC1C \uD504\uB85C\uD544\uC5D0 \uC808\uB300 \uD45C\uC2DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
        },
    },
    securityPage: {
        title: '\uBCF4\uC548 \uC635\uC158',
        subtitle: '\uACC4\uC815\uC744 \uC548\uC804\uD558\uAC8C \uBCF4\uD638\uD558\uAE30 \uC704\uD574 \uC774\uC911 \uC778\uC99D\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694.',
    },
    shareCodePage: {
        title: '\uB2F9\uC2E0\uC758 \uCF54\uB4DC',
        subtitle: '\uAC1C\uC778 QR \uCF54\uB4DC \uB610\uB294 \uCD94\uCC9C \uB9C1\uD06C\uB97C \uACF5\uC720\uD558\uC5EC Expensify\uC5D0 \uBA64\uBC84\uB97C \uCD08\uB300\uD558\uC138\uC694.',
    },
    pronounsPage: {
        pronouns: '\uB300\uBA85\uC0AC',
        isShownOnProfile: '\uB2F9\uC2E0\uC758 \uB300\uBA85\uC0AC\uB294 \uD504\uB85C\uD544\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
        placeholderText: '\uC635\uC158\uC744 \uBCF4\uB824\uBA74 \uAC80\uC0C9\uD558\uC138\uC694',
    },
    contacts: {
        contactMethod: '\uC5F0\uB77D \uBC29\uBC95',
        contactMethods: '\uC5F0\uB77D \uBC29\uBC95',
        featureRequiresValidate: '\uC774 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uACC4\uC815\uC744 \uAC80\uC99D\uD574\uC57C \uD569\uB2C8\uB2E4.',
        validateAccount: '\uACC4\uC815\uC744 \uAC80\uC99D\uD558\uC138\uC694',
        helpTextBeforeEmail:
            '\uC0AC\uB78C\uB4E4\uC774 \uB2F9\uC2E0\uC744 \uCC3E\uC744 \uC218 \uC788\uB294 \uBC29\uBC95\uC744 \uB354 \uCD94\uAC00\uD558\uACE0, \uC601\uC218\uC99D\uC744 \uC804\uB2EC\uD558\uC138\uC694.',
        helpTextAfterEmail: '\uC5EC\uB7EC \uC774\uBA54\uC77C \uC8FC\uC18C\uC5D0\uC11C.',
        pleaseVerify: '\uC774 \uC5F0\uB77D \uBC29\uBC95\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694',
        getInTouch:
            '\uC6B0\uB9AC\uAC00 \uB2F9\uC2E0\uC5D0\uAC8C \uC5F0\uB77D\uD574\uC57C \uD560 \uB54C\uB9C8\uB2E4, \uC774 \uC5F0\uB77D \uBC29\uBC95\uC744 \uC0AC\uC6A9\uD558\uACA0\uC2B5\uB2C8\uB2E4.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: '\uAE30\uBCF8\uC73C\uB85C \uC124\uC815',
        yourDefaultContactMethod:
            '\uC774\uAC83\uC740 \uD604\uC7AC \uAE30\uBCF8 \uC5F0\uB77D\uCC98 \uBC29\uBC95\uC785\uB2C8\uB2E4. \uC0AD\uC81C\uD558\uAE30 \uC804\uC5D0 \uB2E4\uB978 \uC5F0\uB77D\uCC98 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uACE0 "\uAE30\uBCF8\uC73C\uB85C \uC124\uC815"\uC744 \uD074\uB9AD\uD574\uC57C \uD569\uB2C8\uB2E4.',
        removeContactMethod: '\uC5F0\uB77D\uCC98 \uBC29\uBC95 \uC0AD\uC81C',
        removeAreYouSure:
            '\uC774 \uC5F0\uB77D\uCC98 \uBC29\uBC95\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC774 \uC791\uC5C5\uC740 \uCDE8\uC18C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        failedNewContact: '\uC774 \uC5F0\uB77D\uCC98 \uBC29\uBC95\uC744 \uCD94\uAC00\uD558\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.',
        genericFailureMessages: {
            requestContactMethodValidateCode:
                '\uC0C8\uB85C\uC6B4 \uB9C8\uBC95 \uCF54\uB4DC\uB97C \uBCF4\uB0B4\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uAE30\uB2E4\uB838\uB2E4\uAC00 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            validateSecondaryLogin:
                '\uC798\uBABB\uB418\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uB9C8\uBC95 \uCF54\uB4DC\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC0C8 \uCF54\uB4DC\uB97C \uC694\uCCAD\uD574 \uC8FC\uC138\uC694.',
            deleteContactMethod:
                '\uC5F0\uB77D\uCC98 \uC0AD\uC81C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB3C4\uC6C0\uC774 \uD544\uC694\uD558\uBA74 \uCEE8\uC2DC\uC5B4\uC9C0\uC5D0\uAC8C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.',
            setDefaultContactMethod:
                '\uC0C8\uB85C\uC6B4 \uAE30\uBCF8 \uC5F0\uB77D \uBC29\uBC95 \uC124\uC815\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB3C4\uC6C0\uC774 \uD544\uC694\uD558\uC2DC\uBA74 \uCEE8\uC2DC\uC5B4\uC9C0\uC5D0\uAC8C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.',
            addContactMethod:
                '\uC774 \uC5F0\uB77D\uCC98 \uBC29\uBC95\uC744 \uCD94\uAC00\uD558\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB3C4\uC6C0\uC744 \uC704\uD574 \uCF69\uC2DC\uC5D0\uB974\uC8FC\uC5D0\uAC8C \uC5F0\uB77D\uD574 \uC8FC\uC138\uC694.',
            enteredMethodIsAlreadySubmited: '\uC774 \uC5F0\uB77D\uCC98 \uBC29\uBC95\uC740 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4.',
            passwordRequired: '\uBE44\uBC00\uBC88\uD638\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.',
            contactMethodRequired: '\uC5F0\uB77D \uBC29\uBC95\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
            invalidContactMethod: '\uC798\uBABB\uB41C \uC5F0\uB77D \uBC29\uBC95',
        },
        newContactMethod: '\uC0C8\uB85C\uC6B4 \uC5F0\uB77D \uBC29\uBC95',
        goBackContactMethods: '\uC5F0\uB77D \uBC29\uBC95\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30',
    },
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '\uADF8 / \uADF8\uB97C / \uADF8\uC758',
        heHimHisTheyThemTheirs: '\uADF8 / \uADF8\uC758 / \uADF8\uC758 / \uADF8\uB4E4 / \uADF8\uB4E4\uC758 / \uADF8\uB4E4\uC758',
        sheHerHers: '\uADF8\uB140 / \uADF8\uB140\uC758 / \uADF8\uB140\uC758 \uAC83',
        sheHerHersTheyThemTheirs: '\uADF8\uB140 / \uADF8\uB140\uC758 / \uADF8\uB140\uC758 \uAC83 / \uADF8\uB4E4 / \uADF8\uB4E4\uC758 / \uADF8\uB4E4\uC758 \uAC83',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: '\uADF8\uB4E4 / \uADF8\uB4E4 / \uADF8\uB4E4\uC758',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '\uB098\uB97C \uB0B4 \uC774\uB984\uC73C\uB85C \uBD88\uB7EC\uC8FC\uC138\uC694',
    },
    displayNamePage: {
        headerTitle: '\uD45C\uC2DC \uC774\uB984',
        isShownOnProfile: '\uB2F9\uC2E0\uC758 \uB514\uC2A4\uD50C\uB808\uC774 \uC774\uB984\uC740 \uD504\uB85C\uD544\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
    },
    timezonePage: {
        timezone: '\uC2DC\uAC04\uB300',
        isShownOnProfile: '\uB2F9\uC2E0\uC758 \uD504\uB85C\uD544\uC5D0\uB294 \uC2DC\uAC04\uB300\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
        getLocationAutomatically: '\uC790\uB3D9\uC73C\uB85C \uC704\uCE58\uB97C \uACB0\uC815\uD569\uB2C8\uB2E4',
    },
    updateRequiredView: {
        updateRequired: '\uC5C5\uB370\uC774\uD2B8 \uD544\uC694',
        pleaseInstall: 'New Expensify\uC758 \uCD5C\uC2E0 \uBC84\uC804\uC73C\uB85C \uC5C5\uB370\uC774\uD2B8\uD574 \uC8FC\uC138\uC694.',
        pleaseInstallExpensifyClassic: 'Expensify\uC758 \uCD5C\uC2E0 \uBC84\uC804\uC744 \uC124\uCE58\uD574 \uC8FC\uC138\uC694.',
        toGetLatestChanges:
            '\uBAA8\uBC14\uC77C \uB610\uB294 \uB370\uC2A4\uD06C\uD1B1\uC758 \uACBD\uC6B0, \uCD5C\uC2E0 \uBC84\uC804\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD558\uACE0 \uC124\uCE58\uD558\uC138\uC694. \uC6F9\uC758 \uACBD\uC6B0, \uBE0C\uB77C\uC6B0\uC800\uB97C \uC0C8\uB85C \uACE0\uCE58\uC138\uC694.',
        newAppNotAvailable: '\uC0C8\uB85C\uC6B4 Expensify \uC571\uC740 \uB354 \uC774\uC0C1 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
    },
    initialSettingsPage: {
        about: '\uC815\uBCF4',
        aboutPage: {
            description:
                '\uC0C8\uB85C\uC6B4 Expensify \uC571\uC740 \uC804 \uC138\uACC4\uC758 \uC624\uD508 \uC18C\uC2A4 \uAC1C\uBC1C\uC790 \uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uC758\uD574 \uB9CC\uB4E4\uC5B4\uC84C\uC2B5\uB2C8\uB2E4. Expensify\uC758 \uBBF8\uB798\uB97C \uAD6C\uCD95\uD558\uB294 \uB370 \uB3C4\uC6C0\uC744 \uC8FC\uC138\uC694.',
            appDownloadLinks: '\uC571 \uB2E4\uC6B4\uB85C\uB4DC \uB9C1\uD06C',
            viewKeyboardShortcuts: '\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4 \uBCF4\uAE30',
            viewTheCode: '\uCF54\uB4DC \uBCF4\uAE30',
            viewOpenJobs: '\uC5F4\uB824\uC788\uB294 \uC9C1\uC5C5 \uBCF4\uAE30',
            reportABug: '\uBC84\uADF8\uB97C \uBCF4\uACE0\uD558\uC2ED\uC2DC\uC624',
            troubleshoot: '\uBB38\uC81C \uD574\uACB0',
        },
        appDownloadLinks: {
            android: {
                label: '\uC548\uB4DC\uB85C\uC774\uB4DC',
            },
            ios: {
                label: 'iOS',
            },
            desktop: {
                label: 'macOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '\uCE90\uC2DC \uC9C0\uC6B0\uAE30 \uBC0F \uC7AC\uC2DC\uC791',
            viewConsole: '\uB514\uBC84\uADF8 \uCF58\uC194 \uBCF4\uAE30',
            debugConsole: '\uB514\uBC84\uADF8 \uCF58\uC194',
            description:
                '\uC544\uB798 \uB3C4\uAD6C\uB97C \uC0AC\uC6A9\uD558\uC5EC Expensify \uACBD\uD5D8\uC744 \uBB38\uC81C \uD574\uACB0\uC5D0 \uB3C4\uC6C0\uC774 \uB418\uB3C4\uB85D \uD558\uC2ED\uC2DC\uC624. \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD558\uBA74, ${username}\uB2D8\uAED8\uC11C\uB294 \uBC18\uB4DC\uC2DC',
            submitBug: '\uBC84\uADF8\uB97C \uC81C\uCD9C\uD558\uC2ED\uC2DC\uC624',
            confirmResetDescription:
                '\uBAA8\uB4E0 \uBBF8\uC804\uC1A1 \uCD08\uC548 \uBA54\uC2DC\uC9C0\uB294 \uC0AC\uB77C\uC9C8 \uAC83\uC785\uB2C8\uB2E4, \uD558\uC9C0\uB9CC \uB098\uBA38\uC9C0 \uB370\uC774\uD130\uB294 \uC548\uC804\uD569\uB2C8\uB2E4.',
            resetAndRefresh: '\uB9AC\uC14B\uD558\uACE0 \uC0C8\uB85C \uACE0\uCE68',
            clientSideLogging: '\uD074\uB77C\uC774\uC5B8\uD2B8 \uCE21 \uB85C\uAE45',
            noLogsToShare: '\uACF5\uC720\uD560 \uB85C\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
            useProfiling: '\uD504\uB85C\uD30C\uC77C\uB9C1\uC744 \uC0AC\uC6A9\uD558\uC138\uC694',
            profileTrace: '\uD504\uB85C\uD544 \uCD94\uC801',
            releaseOptions: '\uB9B4\uB9AC\uC988 \uC635\uC158',
            testingPreferences: '\uD14C\uC2A4\uD2B8 \uC120\uD638 \uC124\uC815',
            useStagingServer: '\uC2A4\uD14C\uC774\uC9D5 \uC11C\uBC84 \uC0AC\uC6A9',
            forceOffline: '\uAC15\uC81C \uC624\uD504\uB77C\uC778',
            simulatePoorConnection: '\uBD88\uC548\uC815\uD55C \uC778\uD130\uB137 \uC5F0\uACB0 \uC2DC\uBBAC\uB808\uC774\uC158',
            simulatFailingNetworkRequests: '\uB124\uD2B8\uC6CC\uD06C \uC694\uCCAD \uC2E4\uD328 \uC2DC\uBBAC\uB808\uC774\uC158',
            authenticationStatus: '\uC778\uC99D \uC0C1\uD0DC',
            deviceCredentials: '\uC7A5\uCE58 \uC790\uACA9\uC99D\uBA85',
            invalidate: '\uBB34\uD6A8\uD654',
            destroy: '\uD30C\uAD34',
            maskExportOnyxStateData: 'Onyx \uC0C1\uD0DC\uB97C \uB0B4\uBCF4\uB0BC \uB54C \uCDE8\uC57D\uD55C \uBA64\uBC84 \uB370\uC774\uD130\uB97C \uB9C8\uC2A4\uD0B9\uD558\uC138\uC694',
            exportOnyxState: 'Onyx \uC0C1\uD0DC \uB0B4\uBCF4\uB0B4\uAE30',
            importOnyxState: 'Onyx \uC0C1\uD0DC \uAC00\uC838\uC624\uAE30',
            testCrash: '\uD14C\uC2A4\uD2B8 \uCDA9\uB3CC',
            resetToOriginalState: '\uC6D0\uB798 \uC0C1\uD0DC\uB85C \uC7AC\uC124\uC815',
            usingImportedState:
                '\uB2F9\uC2E0\uC740 \uAC00\uC838\uC628 \uC0C1\uD0DC\uB97C \uC0AC\uC6A9\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC774\uB97C \uC9C0\uC6B0\uB824\uBA74 \uC5EC\uAE30\uB97C \uB204\uB974\uC138\uC694.',
            debugMode: '\uB514\uBC84\uADF8 \uBAA8\uB4DC',
            invalidFile: '\uC798\uBABB\uB41C \uD30C\uC77C',
            invalidFileDescription:
                '\uB2F9\uC2E0\uC774 \uAC00\uC838\uC624\uB824\uACE0 \uD558\uB294 \uD30C\uC77C\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            invalidateWithDelay: '\uC9C0\uC5F0\uC73C\uB85C \uBB34\uD6A8\uD654',
        },
        debugConsole: {
            saveLog: '\uB85C\uADF8 \uC800\uC7A5',
            shareLog: '\uB85C\uADF8 \uACF5\uC720',
            enterCommand: '\uBA85\uB839\uC744 \uC785\uB825\uD558\uC2ED\uC2DC\uC624',
            execute: '\uC2E4\uD589',
            noLogsAvailable: '\uB85C\uADF8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `\uB85C\uADF8 \uD06C\uAE30\uAC00 ${size} MB\uC758 \uC81C\uD55C\uC744 \uCD08\uACFC\uD569\uB2C8\uB2E4. \uB300\uC2E0 "\uB85C\uADF8 \uC800\uC7A5"\uC744 \uC0AC\uC6A9\uD558\uC5EC \uB85C\uADF8 \uD30C\uC77C\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.`,
            logs: '\uB85C\uADF8',
            viewConsole: '\uCF58\uC194 \uBCF4\uAE30',
        },
        security: '\uBCF4\uC548',
        signOut: '\uB85C\uADF8\uC544\uC6C3',
        restoreStashed: '\uC800\uC7A5\uB41C \uB85C\uADF8\uC778 \uBCF5\uC6D0',
        signOutConfirmationText:
            '\uB85C\uADF8\uC544\uC6C3\uD558\uBA74 \uC624\uD504\uB77C\uC778\uC5D0\uC11C \uD55C \uBAA8\uB4E0 \uBCC0\uACBD \uC0AC\uD56D\uC774 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: '\uC77D\uC5B4\uBCF4\uC138\uC694',
            phrase2: '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00',
            phrase3: '\uADF8\uB9AC\uACE0',
            phrase4: '\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638',
        },
        help: '\uB3C4\uC6C0',
        accountSettings: '\uACC4\uC815 \uC124\uC815',
        account: '\uACC4\uC815',
        general: '\uC77C\uBC18',
    },
    closeAccountPage: {
        closeAccount: '\uACC4\uC815 \uB2EB\uAE30',
        reasonForLeavingPrompt:
            '\uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC774 \uB5A0\uB098\uB294 \uAC83\uC744 \uC6D0\uCE58 \uC54A\uC2B5\uB2C8\uB2E4! \uCE5C\uC808\uD558\uAC8C \uC6B0\uB9AC\uC5D0\uAC8C \uC774\uC720\uB97C \uC54C\uB824\uC8FC\uC2DC\uACA0\uC2B5\uB2C8\uAE4C, \uADF8\uB798\uC11C \uC6B0\uB9AC\uB294 \uAC1C\uC120\uD560 \uC218 \uC788\uC2B5\uB2C8\uAE4C?',
        enterMessageHere: '\uC5EC\uAE30\uC5D0 \uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694',
        closeAccountWarning: '\uACC4\uC815\uC744 \uB2EB\uC73C\uBA74 \uCDE8\uC18C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        closeAccountPermanentlyDeleteData:
            '\uC815\uB9D0\uB85C \uACC4\uC815\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC774\uB807\uAC8C \uD558\uBA74 \uBBF8\uACB0\uC81C \uBE44\uC6A9\uC774 \uC601\uAD6C\uC801\uC73C\uB85C \uC0AD\uC81C\uB429\uB2C8\uB2E4.',
        enterDefaultContactToConfirm:
            '\uACC4\uC815\uC744 \uD3D0\uC1C4\uD558\uACE0\uC790 \uD558\uB294 \uC758\uC0AC\uB97C \uD655\uC778\uD558\uAE30 \uC704\uD574 \uAE30\uBCF8 \uC5F0\uB77D \uBC29\uBC95\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694. \uADC0\uD558\uC758 \uAE30\uBCF8 \uC5F0\uB77D \uBC29\uBC95\uC740:',
        enterDefaultContact: '\uAE30\uBCF8 \uC5F0\uB77D \uBC29\uBC95\uC744 \uC785\uB825\uD558\uC138\uC694',
        defaultContact: '\uAE30\uBCF8 \uC5F0\uB77D \uBC29\uBC95:',
        enterYourDefaultContactMethod: '\uACC4\uC815\uC744 \uC885\uB8CC\uD558\uAE30 \uC704\uD574 \uAE30\uBCF8 \uC5F0\uB77D\uCC98 \uBC29\uBC95\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
    },
    passwordPage: {
        changePassword: '\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD',
        changingYourPasswordPrompt:
            '\uBE44\uBC00\uBC88\uD638\uB97C \uBCC0\uACBD\uD558\uBA74 Expensify.com \uBC0F New Expensify \uACC4\uC815\uC758 \uBE44\uBC00\uBC88\uD638\uAC00 \uBAA8\uB450 \uC5C5\uB370\uC774\uD2B8\uB429\uB2C8\uB2E4.',
        currentPassword: '\uD604\uC7AC \uBE44\uBC00\uBC88\uD638',
        newPassword: '\uC0C8 \uBE44\uBC00\uBC88\uD638',
        newPasswordPrompt:
            '\uC0C8 \uBE44\uBC00\uBC88\uD638\uB294 \uC774\uC804 \uBE44\uBC00\uBC88\uD638\uC640 \uB2E4\uB974\uBA70 \uCD5C\uC18C 8\uC790, 1\uAC1C\uC758 \uB300\uBB38\uC790, 1\uAC1C\uC758 \uC18C\uBB38\uC790, \uADF8\uB9AC\uACE0 1\uAC1C\uC758 \uC22B\uC790\uB97C \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4.',
    },
    twoFactorAuth: {
        headerTitle: '2\uB2E8\uACC4 \uC778\uC99D',
        twoFactorAuthEnabled: '2\uB2E8\uACC4 \uC778\uC99D\uC774 \uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        whatIsTwoFactorAuth:
            '\uC774\uC911 \uC778\uC99D (2FA)\uC740 \uACC4\uC815\uC758 \uC548\uC804\uC744 \uB3D5\uC2B5\uB2C8\uB2E4. \uB85C\uADF8\uC778 \uD560 \uB54C, \uC120\uD638\uD558\uB294 \uC778\uC99D \uC571\uC5D0\uC11C \uC0DD\uC131\uB41C \uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC57C \uD569\uB2C8\uB2E4.',
        disableTwoFactorAuth: '\uB450 \uB2E8\uACC4 \uC778\uC99D \uBE44\uD65C\uC131\uD654',
        explainProcessToRemove:
            '2\uB2E8\uACC4 \uC778\uC99D(2FA)\uC744 \uBE44\uD65C\uC131\uD654\uD558\uAE30 \uC704\uD574, \uC778\uC99D \uC571\uC5D0\uC11C \uC720\uD6A8\uD55C \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        disabled: '\uC774\uC81C 2\uB2E8\uACC4 \uC778\uC99D\uC774 \uBE44\uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        noAuthenticatorApp: '\uB354 \uC774\uC0C1 Expensify\uC5D0 \uB85C\uADF8\uC778\uD558\uAE30 \uC704\uD574 \uC778\uC99D \uC571\uC774 \uD544\uC694\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
        stepCodes: '\uBCF5\uAD6C \uCF54\uB4DC',
        keepCodesSafe: '\uC774 \uBCF5\uAD6C \uCF54\uB4DC\uB97C \uC548\uC804\uD558\uAC8C \uBCF4\uAD00\uD558\uC138\uC694!',
        codesLoseAccess:
            '\uC778\uC99D \uC571\uC5D0 \uB300\uD55C \uC811\uADFC \uAD8C\uD55C\uC744 \uC783\uACE0 \uC774 \uCF54\uB4DC\uB4E4\uC744 \uAC00\uC9C0\uACE0 \uC788\uC9C0 \uC54A\uB2E4\uBA74, \uACC4\uC815\uC5D0 \uB300\uD55C \uC811\uADFC \uAD8C\uD55C\uC744 \uC783\uAC8C \uB420 \uAC83\uC785\uB2C8\uB2E4.\n\n\uCC38\uACE0: 2\uB2E8\uACC4 \uC778\uC99D \uC124\uC815\uC740 \uB2E4\uB978 \uBAA8\uB4E0 \uD65C\uC131 \uC138\uC158\uC5D0\uC11C \uB85C\uADF8\uC544\uC6C3\uC2DC\uD0B5\uB2C8\uB2E4.',
        errorStepCodes: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uCF54\uB4DC\uB97C \uBCF5\uC0AC\uD558\uAC70\uB098 \uB2E4\uC6B4\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
        stepVerify: '\uD655\uC778',
        scanCode: 'QR \uCF54\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC5EC \uC2A4\uCE94\uD558\uC2ED\uC2DC\uC624.',
        authenticatorApp: '\uC778\uC99D \uC571',
        addKey: '\uB610\uB294 \uC774 \uBE44\uBC00 \uD0A4\uB97C \uC778\uC99D \uC571\uC5D0 \uCD94\uAC00\uD558\uC138\uC694:',
        enterCode: '\uADF8\uB7F0 \uB2E4\uC74C \uC778\uC99D \uC571\uC5D0\uC11C \uC0DD\uC131\uB41C 6\uC790\uB9AC \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694.',
        stepSuccess: '\uC644\uB8CC\uB428',
        enabled: '2\uB2E8\uACC4 \uC778\uC99D\uC774 \uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        congrats: '\uCD95\uD558\uD569\uB2C8\uB2E4! \uC774\uC81C \uCD94\uAC00 \uBCF4\uC548\uC744 \uAC16\uAC8C \uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        copy: '\uBCF5\uC0AC',
        disable: '\uBE44\uD65C\uC131\uD654',
        enableTwoFactorAuth: '\uB450 \uB2E8\uACC4 \uC778\uC99D \uD65C\uC131\uD654',
        pleaseEnableTwoFactorAuth: '2\uB2E8\uACC4 \uC778\uC99D\uC744 \uD65C\uC131\uD654\uD574 \uC8FC\uC138\uC694.',
        twoFactorAuthIsRequiredDescription:
            '\uBCF4\uC548 \uBAA9\uC801\uC73C\uB85C, Xero\uB294 \uD1B5\uD569\uC744 \uC5F0\uACB0\uD558\uAE30 \uC704\uD574 \uC774\uC911 \uC778\uC99D\uC744 \uC694\uAD6C\uD569\uB2C8\uB2E4.',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Xero \uC791\uC5C5 \uACF5\uAC04 \uAD00\uB9AC\uC790\uB294 \uC774\uC911 \uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uACC4\uC18D\uD558\uB824\uBA74 \uC774\uC911 \uC778\uC99D\uC744 \uD65C\uC131\uD654\uD574 \uC8FC\uC138\uC694.',
        twoFactorAuthCannotDisable: '2FA\uB97C \uBE44\uD65C\uC131\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
        twoFactorAuthRequired:
            'Xero \uC5F0\uACB0\uC5D0\uB294 \uC774\uC911 \uC778\uC99D (2FA)\uC774 \uD544\uC694\uD558\uBA70 \uBE44\uD65C\uC131\uD654 \uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '\uB2F9\uC2E0\uC758 \uBCF5\uAD6C \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            incorrectRecoveryCode: '\uC798\uBABB\uB41C \uBCF5\uAD6C \uCF54\uB4DC\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
        useRecoveryCode: '\uBCF5\uAD6C \uCF54\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC138\uC694',
        recoveryCode: '\uBCF5\uAD6C \uCF54\uB4DC',
        use2fa: '2\uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC138\uC694',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '\uB2F9\uC2E0\uC758 2\uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            incorrect2fa: '\uC798\uBABB\uB41C 2\uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '\uBE44\uBC00\uBC88\uD638\uAC00 \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
        allSet: '\uBAA8\uB450 \uC124\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC548\uC804\uD558\uAC8C \uBCF4\uAD00\uD558\uC138\uC694.',
    },
    privateNotes: {
        title: '\uAC1C\uC778 \uBA54\uBAA8',
        personalNoteMessage:
            '\uC5EC\uAE30\uC5D0 \uC774 \uCC44\uD305\uC5D0 \uB300\uD55C \uBA54\uBAA8\uB97C \uC720\uC9C0\uD558\uC138\uC694. \uC774 \uBA54\uBAA8\uB97C \uCD94\uAC00, \uD3B8\uC9D1, \uB610\uB294 \uBCF4\uB294 \uAC83\uC740 \uB2F9\uC2E0\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.',
        sharedNoteMessage:
            '\uC5EC\uAE30\uC5D0 \uC774 \uCC44\uD305\uC5D0 \uB300\uD55C \uBA54\uBAA8\uB97C \uC720\uC9C0\uD558\uC138\uC694. Expensify \uC9C1\uC6D0 \uBC0F team.expensify.com \uB3C4\uBA54\uC778\uC758 \uB2E4\uB978 \uBA64\uBC84\uB4E4\uC774 \uC774 \uBA54\uBAA8\uB97C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        composerLabel: '\uB178\uD2B8',
        myNote: '\uB098\uC758 \uB178\uD2B8',
        error: {
            genericFailureMessage: '\uAC1C\uC778 \uBA54\uBAA8\uB97C \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '\uC720\uD6A8\uD55C \uBCF4\uC548 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        },
        securityCode: '\uBCF4\uC548 \uCF54\uB4DC',
        changeBillingCurrency: '\uACB0\uC81C \uD1B5\uD654 \uBCC0\uACBD',
        changePaymentCurrency: '\uACB0\uC81C \uD1B5\uD654 \uBCC0\uACBD',
        paymentCurrency: '\uACB0\uC81C \uD1B5\uD654',
        note: '\uCC38\uACE0: \uACB0\uC81C \uD1B5\uD654\uB97C \uBCC0\uACBD\uD558\uBA74 Expensify\uC5D0 \uB300\uD55C \uC9C0\uBD88 \uAE08\uC561\uC5D0 \uC601\uD5A5\uC744 \uC904 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC6B0\uB9AC\uC758 \uCC38\uC870\uD558\uC138\uC694.',
        noteLink: '\uAC00\uACA9 \uD398\uC774\uC9C0',
        noteDetails: '\uC790\uC138\uD55C \uB0B4\uC6A9\uC740.',
    },
    addDebitCardPage: {
        addADebitCard: '\uC9C1\uBD88 \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694',
        nameOnCard: '\uCE74\uB4DC\uC5D0 \uC801\uD78C \uC774\uB984',
        debitCardNumber: '\uC9C1\uBD88 \uCE74\uB4DC \uBC88\uD638',
        expiration: '\uB9CC\uB8CC \uB0A0\uC9DC',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '\uCCAD\uAD6C \uC8FC\uC18C',
        growlMessageOnSave: '\uB2F9\uC2E0\uC758 \uC9C1\uBD88 \uCE74\uB4DC\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        expensifyPassword: 'Expensify \uBE44\uBC00\uBC88\uD638',
        error: {
            invalidName: '\uC774\uB984\uC740 \uBB38\uC790\uB9CC \uD3EC\uD568\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            addressZipCode: '\uC720\uD6A8\uD55C \uC6B0\uD3B8\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            debitCardNumber: '\uC720\uD6A8\uD55C \uC9C1\uBD88 \uCE74\uB4DC \uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            expirationDate: '\uC720\uD6A8\uD55C \uB9CC\uB8CC \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            securityCode: '\uC720\uD6A8\uD55C \uBCF4\uC548 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            addressStreet: 'PO \uBC15\uC2A4\uAC00 \uC544\uB2CC \uC720\uD6A8\uD55C \uCCAD\uAD6C \uC8FC\uC18C\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            addressState: '\uC0C1\uD0DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            addressCity: '\uB3C4\uC2DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            genericFailureMessage:
                '\uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            password: 'Expensify \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '\uACB0\uC81C \uCE74\uB4DC \uCD94\uAC00',
        nameOnCard: '\uCE74\uB4DC\uC5D0 \uC801\uD78C \uC774\uB984',
        paymentCardNumber: '\uCE74\uB4DC \uBC88\uD638',
        expiration: '\uB9CC\uB8CC \uB0A0\uC9DC',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '\uCCAD\uAD6C \uC8FC\uC18C',
        growlMessageOnSave: '\uB2F9\uC2E0\uC758 \uACB0\uC81C \uCE74\uB4DC\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        expensifyPassword: 'Expensify \uBE44\uBC00\uBC88\uD638',
        error: {
            invalidName: '\uC774\uB984\uC740 \uBB38\uC790\uB9CC \uD3EC\uD568\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            addressZipCode: '\uC720\uD6A8\uD55C \uC6B0\uD3B8\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            paymentCardNumber: '\uC720\uD6A8\uD55C \uCE74\uB4DC \uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
            expirationDate: '\uC720\uD6A8\uD55C \uB9CC\uB8CC \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            securityCode: '\uC720\uD6A8\uD55C \uBCF4\uC548 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            addressStreet: 'PO \uBC15\uC2A4\uAC00 \uC544\uB2CC \uC720\uD6A8\uD55C \uCCAD\uAD6C \uC8FC\uC18C\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            addressState: '\uC0C1\uD0DC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            addressCity: '\uB3C4\uC2DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            genericFailureMessage:
                '\uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            password: 'Expensify \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        },
    },
    walletPage: {
        balance: '\uC794\uC561',
        paymentMethodsTitle: '\uACB0\uC81C \uBC29\uBC95',
        setDefaultConfirmation: '\uAE30\uBCF8 \uACB0\uC81C \uBC29\uBC95\uC73C\uB85C \uC124\uC815',
        setDefaultSuccess: '\uAE30\uBCF8 \uACB0\uC81C \uBC29\uBC95 \uC124\uC815 \uC644\uB8CC!',
        deleteAccount: '\uACC4\uC815 \uC0AD\uC81C',
        deleteConfirmation: '\uC774 \uACC4\uC815\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        error: {
            notOwnerOfBankAccount:
                '\uC774 \uC740\uD589 \uACC4\uC88C\uB97C \uAE30\uBCF8 \uACB0\uC81C \uBC29\uBC95\uC73C\uB85C \uC124\uC815\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.',
            invalidBankAccount: '\uC774 \uC740\uD589 \uACC4\uC88C\uB294 \uC784\uC2DC\uB85C \uC815\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
            notOwnerOfFund:
                '\uC774 \uCE74\uB4DC\uB97C \uAE30\uBCF8 \uACB0\uC81C \uBC29\uBC95\uC73C\uB85C \uC124\uC815\uD558\uB294 \uB3C4\uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.',
            setDefaultFailure:
                '\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uCD94\uAC00 \uC9C0\uC6D0\uC744 \uC704\uD574 \uCF69\uC2DC\uC5D0\uB974\uC8FC\uC5D0\uAC8C \uCC44\uD305\uD574 \uC8FC\uC138\uC694.',
        },
        addBankAccountFailure:
            '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uB824\uACE0 \uC2DC\uB3C4\uD558\uB294 \uB3D9\uC548 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        getPaidFaster: '\uB354 \uBE60\uB974\uAC8C \uC9C0\uAE09\uBC1B\uC73C\uC138\uC694',
        addPaymentMethod:
            '\uC571 \uB0B4\uC5D0\uC11C \uC9C1\uC811 \uACB0\uC81C\uB97C \uBCF4\uB0B4\uACE0 \uBC1B\uC744 \uC218 \uC788\uB3C4\uB85D \uACB0\uC81C \uBC29\uBC95\uC744 \uCD94\uAC00\uD558\uC138\uC694.',
        getPaidBackFaster: '\uB354 \uBE60\uB974\uAC8C \uB3C8\uC744 \uB3CC\uB824\uBC1B\uC73C\uC138\uC694',
        secureAccessToYourMoney: '\uB2F9\uC2E0\uC758 \uB3C8\uC5D0 \uB300\uD55C \uC548\uC804\uD55C \uC811\uADFC',
        receiveMoney: '\uB2F9\uC2E0\uC758 \uD604\uC9C0 \uD654\uD3D0\uB85C \uB3C8\uC744 \uBC1B\uC73C\uC138\uC694',
        expensifyWallet: 'Expensify Wallet (\uBCA0\uD0C0)',
        sendAndReceiveMoney:
            '\uCE5C\uAD6C\uB4E4\uACFC \uB3C8\uC744 \uBCF4\uB0B4\uACE0 \uBC1B\uC73C\uC138\uC694. \uBBF8\uAD6D \uC740\uD589 \uACC4\uC88C\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.',
        enableWallet: '\uC9C0\uAC11 \uD65C\uC131\uD654',
        addBankAccountToSendAndReceive: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uC81C\uCD9C\uD55C \uBE44\uC6A9\uC5D0 \uB300\uD574 \uD658\uAE09 \uBC1B\uC73C\uC2ED\uC2DC\uC624.',
        addBankAccount: '\uC740\uD589 \uACC4\uC88C \uCD94\uAC00',
        assignedCards: '\uD560\uB2F9\uB41C \uCE74\uB4DC',
        assignedCardsDescription:
            '\uC774\uAC83\uB4E4\uC740 \uD68C\uC0AC \uC9C0\uCD9C\uC744 \uAD00\uB9AC\uD558\uAE30 \uC704\uD574 \uC791\uC5C5 \uACF5\uAC04 \uAD00\uB9AC\uC790\uC5D0\uAC8C \uD560\uB2F9\uB41C \uCE74\uB4DC\uC785\uB2C8\uB2E4.',
        expensifyCard: 'Expensify \uCE74\uB4DC',
        walletActivationPending:
            '\uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC815\uBCF4\uB97C \uAC80\uD1A0 \uC911\uC785\uB2C8\uB2E4. \uBA87 \uBD84 \uD6C4\uC5D0 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694!',
        walletActivationFailed:
            '\uC720\uAC10\uC2A4\uB7FD\uAC8C\uB3C4 \uD604\uC7AC \uB2F9\uC2E0\uC758 \uC9C0\uAC11\uC744 \uD65C\uC131\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB354 \uC790\uC138\uD55C \uB3C4\uC6C0\uC744 \uC704\uD574 \uCF69\uC2DC\uC5D0\uB974\uC8FC\uC640 \uB300\uD654\uD574 \uC8FC\uC138\uC694.',
        addYourBankAccount: '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uC138\uC694',
        addBankAccountBody:
            '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C\uB97C Expensify\uC5D0 \uC5F0\uACB0\uD574\uBCF4\uC138\uC694. \uADF8\uB7EC\uBA74 \uC571 \uB0B4\uC5D0\uC11C \uC9C1\uC811 \uACB0\uC81C\uB97C \uBCF4\uB0B4\uACE0 \uBC1B\uB294 \uAC83\uC774 \uC5B4\uB290 \uB54C\uBCF4\uB2E4 \uC26C\uC6CC\uC9D1\uB2C8\uB2E4.',
        chooseYourBankAccount: '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C\uB97C \uC120\uD0DD\uD558\uC138\uC694',
        chooseAccountBody: '\uB2F9\uC2E0\uC774 \uC62C\uBC14\uB978 \uAC83\uC744 \uC120\uD0DD\uD558\uB294 \uAC83\uC744 \uD655\uC778\uD558\uC138\uC694.',
        confirmYourBankAccount: '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C\uB97C \uD655\uC778\uD558\uC138\uC694',
    },
    cardPage: {
        expensifyCard: 'Expensify \uCE74\uB4DC',
        availableSpend: '\uB0A8\uC740 \uC81C\uD55C',
        smartLimit: {
            name: '\uC2A4\uB9C8\uD2B8 \uC81C\uD55C',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\uC774 \uCE74\uB4DC\uC5D0\uC11C \uCD5C\uB300 ${formattedLimit}\uAE4C\uC9C0 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC73C\uBA70, \uC81C\uCD9C\uD55C \uBE44\uC6A9\uC774 \uC2B9\uC778\uB418\uBA74 \uD55C\uB3C4\uAC00 \uC7AC\uC124\uC815\uB429\uB2C8\uB2E4.`,
        },
        fixedLimit: {
            name: '\uACE0\uC815 \uD55C\uB3C4',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\uC774 \uCE74\uB4DC\uC5D0\uC11C \uCD5C\uB300 ${formattedLimit}\uAE4C\uC9C0 \uC0AC\uC6A9\uD560 \uC218 \uC788\uACE0, \uADF8 \uD6C4\uC5D0\uB294 \uBE44\uD65C\uC131\uD654\uB429\uB2C8\uB2E4.`,
        },
        monthlyLimit: {
            name: '\uC6D4\uAC04 \uC81C\uD55C',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `\uC774 \uCE74\uB4DC\uB85C \uB9E4\uC6D4 \uCD5C\uB300 ${formattedLimit}\uAE4C\uC9C0 \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uD55C\uB3C4\uB294 \uB9E4\uC6D4 1\uC77C\uC5D0 \uCD08\uAE30\uD654\uB429\uB2C8\uB2E4.`,
        },
        virtualCardNumber: '\uAC00\uC0C1 \uCE74\uB4DC \uBC88\uD638',
        physicalCardNumber: '\uBB3C\uB9AC\uC801 \uCE74\uB4DC \uBC88\uD638',
        getPhysicalCard: '\uBB3C\uB9AC\uC801 \uCE74\uB4DC \uBC1B\uAE30',
        reportFraud: '\uAC00\uC0C1 \uCE74\uB4DC \uC0AC\uAE30 \uC2E0\uACE0',
        reviewTransaction: '\uD2B8\uB79C\uC7AD\uC158 \uAC80\uD1A0',
        suspiciousBannerTitle: '\uC758\uC2EC\uC2A4\uB7EC\uC6B4 \uAC70\uB798',
        suspiciousBannerDescription:
            '\uC6B0\uB9AC\uB294 \uADC0\uD558\uC758 \uCE74\uB4DC\uC5D0\uC11C \uC758\uC2EC\uC2A4\uB7EC\uC6B4 \uAC70\uB798\uB97C \uBC1C\uACAC\uD588\uC2B5\uB2C8\uB2E4. \uC544\uB798\uB97C \uD0ED\uD558\uC5EC \uAC80\uD1A0\uD558\uC2ED\uC2DC\uC624.',
        cardLocked:
            '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uB294 \uC6B0\uB9AC \uD300\uC774 \uD68C\uC0AC \uACC4\uC815\uC744 \uAC80\uD1A0\uD558\uB294 \uB3D9\uC548 \uC77C\uC2DC\uC801\uC73C\uB85C \uC7A0\uACA8 \uC788\uC2B5\uB2C8\uB2E4.',
        cardDetails: {
            cardNumber: '\uAC00\uC0C1 \uCE74\uB4DC \uBC88\uD638',
            expiration: '\uB9CC\uB8CC',
            cvv: 'CVV',
            address: '\uC8FC\uC18C',
            revealDetails: '\uC138\uBD80 \uC0AC\uD56D \uD45C\uC2DC',
            copyCardNumber: '\uCE74\uB4DC \uBC88\uD638 \uBCF5\uC0AC',
            updateAddress: '\uC8FC\uC18C \uC5C5\uB370\uC774\uD2B8',
        },
        cardDetailsLoadingFailure:
            '\uCE74\uB4DC \uC138\uBD80 \uC815\uBCF4\uB97C \uB85C\uB529\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC778\uD130\uB137 \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        validateCardTitle: '\uB2F9\uC2E0\uC774 \uB9DE\uB294\uC9C0 \uD655\uC778\uD574\uBD05\uC2DC\uB2E4',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `\uCE74\uB4DC \uC138\uBD80 \uC815\uBCF4\uB97C \uBCF4\uB824\uBA74 ${contactMethod}\uB85C \uBCF4\uB0B8 \uB9C8\uBC95 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694. 1-2\uBD84 \uB0B4\uC5D0 \uB3C4\uCC29\uD574\uC57C \uD569\uB2C8\uB2E4.`,
    },
    workflowsPage: {
        workflowTitle: '\uC9C0\uCD9C\uD558\uB2E4',
        workflowDescription:
            '\uC9C0\uCD9C\uC774 \uBC1C\uC0DD\uD558\uB294 \uC21C\uAC04\uBD80\uD130 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uAD6C\uC131\uD558\uC2ED\uC2DC\uC624, \uC2B9\uC778 \uBC0F \uC9C0\uBD88\uC744 \uD3EC\uD568\uD558\uC5EC.',
        delaySubmissionTitle: '\uC81C\uCD9C \uC9C0\uC5F0',
        delaySubmissionDescription:
            '\uBE44\uC6A9 \uC81C\uCD9C\uC744 \uC704\uD55C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC77C\uC815\uC744 \uC120\uD0DD\uD558\uAC70\uB098, \uC2E4\uC2DC\uAC04\uC73C\uB85C \uC9C0\uCD9C \uC5C5\uB370\uC774\uD2B8\uB97C \uBC1B\uAE30 \uC704\uD574 \uC774 \uC635\uC158\uC744 \uB044\uC2ED\uC2DC\uC624.',
        submissionFrequency: '\uC81C\uCD9C \uBE48\uB3C4',
        submissionFrequencyDateOfMonth: '\uC6D4\uC758 \uB0A0\uC9DC',
        addApprovalsTitle: '\uC2B9\uC778 \uCD94\uAC00',
        addApprovalButton: '\uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uCD94\uAC00',
        addApprovalTip:
            '\uC774 \uAE30\uBCF8 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB294 \uB354 \uAD6C\uCCB4\uC801\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uD55C \uBAA8\uB4E0 \uBA64\uBC84\uC5D0\uAC8C \uC801\uC6A9\uB429\uB2C8\uB2E4.',
        approver: '\uC2B9\uC778\uC790',
        connectBankAccount: '\uC740\uD589 \uACC4\uC88C \uC5F0\uACB0',
        addApprovalsDescription: '\uACB0\uC81C\uB97C \uC2B9\uC778\uD558\uAE30 \uC804\uC5D0 \uCD94\uAC00\uC801\uC778 \uC2B9\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
        makeOrTrackPaymentsTitle: '\uACB0\uC81C \uC0DD\uC131 \uB610\uB294 \uCD94\uC801',
        makeOrTrackPaymentsDescription:
            'Expensify\uC5D0\uC11C \uC774\uB8E8\uC5B4\uC9C4 \uACB0\uC81C\uC5D0 \uB300\uD55C \uC778\uC99D\uB41C \uC9C0\uBD88\uC790\uB97C \uCD94\uAC00\uD558\uAC70\uB098, \uB2E8\uC21C\uD788 \uB2E4\uB978 \uACF3\uC5D0\uC11C \uC774\uB8E8\uC5B4\uC9C4 \uACB0\uC81C\uB97C \uCD94\uC801\uD558\uC138\uC694.',
        editor: {
            submissionFrequency:
                '\uC624\uB958\uAC00 \uC5C6\uB294 \uC9C0\uCD9C\uC744 \uACF5\uC720\uD558\uAE30 \uC804\uC5D0 Expensify\uAC00 \uC5BC\uB9C8\uB098 \uAE30\uB2E4\uB824\uC57C \uD558\uB294\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
        },
        frequencyDescription:
            '\uC790\uB3D9\uC73C\uB85C \uC81C\uCD9C\uD560 \uBE44\uC6A9\uC758 \uBE48\uB3C4\uB97C \uC120\uD0DD\uD558\uAC70\uB098, \uC218\uB3D9\uC73C\uB85C \uC124\uC815\uD558\uC138\uC694',
        frequencies: {
            weekly: '\uC8FC\uAC04',
            monthly: '\uC6D4\uAC04',
            twiceAMonth: '\uD55C \uB2EC\uC5D0 \uB450 \uBC88',
            byTrip: '\uC5EC\uD589\uC73C\uB85C',
            manually: '\uC218\uB3D9\uC73C\uB85C',
            daily: '\uB9E4\uC77C',
            lastDayOfMonth: '\uC6D4\uC758 \uB9C8\uC9C0\uB9C9 \uB0A0',
            lastBusinessDayOfMonth: '\uC6D4\uC758 \uB9C8\uC9C0\uB9C9 \uC601\uC5C5\uC77C',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '\uCCAB \uBC88\uC9F8',
                '2': '\uB450 \uBC88\uC9F8',
                '3': '\uC138 \uBC88\uC9F8',
                '4': '\uB124 \uBC88\uC9F8',
                '5': '\uB2E4\uC12F \uBC88\uC9F8',
                '6': '\uC5EC\uC12F \uBC88\uC9F8',
                '7': '\uC77C\uACF1 \uBC88\uC9F8',
                '8': '\uC5EC\uB35F \uBC88\uC9F8',
                '9': '\uC544\uD649 \uBC88\uC9F8',
                '10': '\uC5F4\uBC88\uC9F8',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows:
            '\uC774 \uD68C\uC6D0\uC740 \uC774\uBBF8 \uB2E4\uB978 \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC5D0 \uC18D\uD574 \uC788\uC2B5\uB2C8\uB2E4. \uC5EC\uAE30\uC5D0\uC11C\uC758 \uC5C5\uB370\uC774\uD2B8\uB294 \uAC70\uAE30\uC5D0\uB3C4 \uBC18\uC601\uB429\uB2C8\uB2E4.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong>\uB2D8\uC740 \uC774\uBBF8 <strong>${name2}</strong>\uB2D8\uC5D0\uAC8C \uBCF4\uACE0\uC11C\uB97C \uC2B9\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC21C\uD658 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uD53C\uD558\uAE30 \uC704\uD574 \uB2E4\uB978 \uC2B9\uC778\uC790\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.`,
        emptyContent: {
            title: '\uD45C\uC2DC\uD560 \uBA64\uBC84\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
            expensesFromSubtitle:
                '\uBAA8\uB4E0 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBA64\uBC84\uB4E4\uC740 \uC774\uBBF8 \uAE30\uC874\uC758 \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uC5D0 \uC18D\uD574 \uC788\uC2B5\uB2C8\uB2E4.',
            approverSubtitle: '\uBAA8\uB4E0 \uC2B9\uC778\uC790\uB294 \uAE30\uC874 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uC5D0 \uC18D\uD569\uB2C8\uB2E4.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage:
            '\uC9C0\uC5F0\uB41C \uC81C\uCD9C\uC740 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC9C0\uC6D0\uD300\uC5D0 \uC5F0\uB77D\uD574 \uC8FC\uC138\uC694.',
        autoReportingFrequencyErrorMessage:
            '\uC81C\uCD9C \uBE48\uB3C4\uB97C \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC9C0\uC6D0\uD300\uC5D0 \uBB38\uC758\uD574 \uC8FC\uC138\uC694.',
        monthlyOffsetErrorMessage:
            '\uC6D4\uAC04 \uBE48\uB3C4\uB97C \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC9C0\uC6D0\uD300\uC5D0 \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.',
    },
    workflowsCreateApprovalsPage: {
        title: '\uD655\uC778',
        header: '\uB354 \uB9CE\uC740 \uC2B9\uC778\uC790\uB97C \uCD94\uAC00\uD558\uACE0 \uD655\uC778\uD558\uC138\uC694.',
        additionalApprover: '\uCD94\uAC00 \uC2B9\uC778\uC790',
        submitButton: '\uC6CC\uD06C\uD50C\uB85C\uC6B0 \uCD94\uAC00',
    },
    workflowsEditApprovalsPage: {
        title: '\uD3B8\uC9D1 \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0',
        deleteTitle: '\uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uC0AD\uC81C',
        deletePrompt:
            '\uC774 \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uBAA8\uB4E0 \uBA64\uBC84\uB294 \uC774\uD6C4 \uAE30\uBCF8 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uB530\uB974\uAC8C \uB429\uB2C8\uB2E4.',
    },
    workflowsExpensesFromPage: {
        title: '\uC5D0\uC11C\uC758 \uBE44\uC6A9',
        header: '\uB2E4\uC74C \uBA64\uBC84\uB4E4\uC774 \uBE44\uC6A9\uC744 \uC81C\uCD9C\uD560 \uB54C:',
    },
    workflowsApproverPage: {
        genericErrorMessage:
            '\uC2B9\uC778\uC790\uB97C \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC9C0\uC6D0\uD300\uC5D0 \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.',
        header: '\uC774 \uBA64\uBC84\uC5D0\uAC8C \uC2B9\uC778\uC744 \uC694\uCCAD\uD558\uC138\uC694:',
    },
    workflowsPayerPage: {
        title: '\uC2B9\uC778\uB41C \uC9C0\uBD88\uC790',
        genericErrorMessage: '\uC2B9\uC778\uB41C \uC9C0\uBD88\uC790\uB97C \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        admins: '\uAD00\uB9AC\uC790\uB4E4',
        payer: '\uC9C0\uBD88\uC790',
        paymentAccount: '\uACB0\uC81C \uACC4\uC88C',
    },
    reportFraudPage: {
        title: '\uAC00\uC0C1 \uCE74\uB4DC \uC0AC\uAE30 \uC2E0\uACE0',
        description:
            '\uB9CC\uC57D \uADC0\uD558\uC758 \uAC00\uC0C1 \uCE74\uB4DC \uC815\uBCF4\uAC00 \uB3C4\uB09C\uB2F9\uD558\uAC70\uB098 \uCE68\uD574\uB2F9\uD588\uB2E4\uBA74, \uC6B0\uB9AC\uB294 \uADC0\uD558\uC758 \uAE30\uC874 \uCE74\uB4DC\uB97C \uC601\uAD6C\uC801\uC73C\uB85C \uBE44\uD65C\uC131\uD654\uD558\uACE0 \uC0C8\uB85C\uC6B4 \uAC00\uC0C1 \uCE74\uB4DC\uC640 \uBC88\uD638\uB97C \uC81C\uACF5\uD574 \uB4DC\uB9B4 \uAC83\uC785\uB2C8\uB2E4.',
        deactivateCard: '\uCE74\uB4DC \uBE44\uD65C\uC131\uD654',
        reportVirtualCardFraud: '\uAC00\uC0C1 \uCE74\uB4DC \uC0AC\uAE30 \uC2E0\uACE0',
    },
    reportFraudConfirmationPage: {
        title: '\uCE74\uB4DC \uC0AC\uAE30 \uC2E0\uACE0\uB428',
        description:
            '\uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uAE30\uC874 \uCE74\uB4DC\uB97C \uC601\uAD6C\uC801\uC73C\uB85C \uBE44\uD65C\uC131\uD654\uD588\uC2B5\uB2C8\uB2E4. \uCE74\uB4DC \uC138\uBD80 \uC815\uBCF4\uB97C \uB2E4\uC2DC \uBCF4\uB7EC \uAC00\uBA74 \uC0C8\uB85C\uC6B4 \uAC00\uC0C1 \uCE74\uB4DC\uAC00 \uC0AC\uC6A9 \uAC00\uB2A5\uD558\uAC8C \uB429\uB2C8\uB2E4.',
        buttonText: '\uC54C\uACA0\uC2B5\uB2C8\uB2E4, \uAC10\uC0AC\uD569\uB2C8\uB2E4!',
    },
    activateCardPage: {
        activateCard: '\uCE74\uB4DC \uD65C\uC131\uD654',
        pleaseEnterLastFour: '\uCE74\uB4DC\uC758 \uB9C8\uC9C0\uB9C9 \uB124 \uC790\uB9AC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        activatePhysicalCard: '\uBB3C\uB9AC \uCE74\uB4DC \uD65C\uC131\uD654',
        error: {
            thatDidntMatch:
                '\uADF8\uAC83\uC740 \uB2F9\uC2E0\uC758 \uCE74\uB4DC\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC\uC640 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            throttled:
                '\uB2F9\uC2E0\uC740 Expensify \uCE74\uB4DC\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC\uB97C \uB108\uBB34 \uB9CE\uC774 \uC798\uBABB \uC785\uB825\uD588\uC2B5\uB2C8\uB2E4. \uC22B\uC790\uAC00 \uC815\uD655\uD558\uB2E4\uACE0 \uD655\uC2E0\uD55C\uB2E4\uBA74, Concierge\uC5D0\uAC8C \uBB38\uC758\uD558\uC5EC \uD574\uACB0\uD574\uC8FC\uC138\uC694. \uADF8\uB807\uC9C0 \uC54A\uB2E4\uBA74, \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uBCF4\uC138\uC694.',
        },
    },
    getPhysicalCard: {
        header: '\uBB3C\uB9AC\uC801 \uCE74\uB4DC \uBC1B\uAE30',
        nameMessage:
            '\uB2F9\uC2E0\uC758 \uC774\uB984\uACFC \uC131\uC744 \uC785\uB825\uD558\uC138\uC694, \uC774\uAC83\uC774 \uB2F9\uC2E0\uC758 \uCE74\uB4DC\uC5D0 \uD45C\uC2DC\uB420 \uAC83\uC785\uB2C8\uB2E4.',
        legalName: '\uBC95\uC801 \uC774\uB984',
        legalFirstName: '\uBC95\uC801 \uC131\uBA85',
        legalLastName: '\uBC95\uC801 \uC131',
        phoneMessage: '\uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694.',
        phoneNumber: '\uC804\uD654 \uBC88\uD638',
        address: '\uC8FC\uC18C',
        addressMessage: '\uBC30\uC1A1 \uC8FC\uC18C\uB97C \uC785\uB825\uD558\uC138\uC694.',
        streetAddress: '\uAC70\uB9AC \uC8FC\uC18C',
        city: '\uB3C4\uC2DC',
        state: '\uC0C1\uD0DC',
        zipPostcode: '\uC6B0\uD3B8\uBC88\uD638/\uC6B0\uD3B8\uBC88\uD638',
        country: '\uAD6D\uAC00',
        confirmMessage: '\uC544\uB798\uC758 \uC138\uBD80 \uC815\uBCF4\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        estimatedDeliveryMessage: '\uB2F9\uC2E0\uC758 \uC2E4\uBB3C \uCE74\uB4DC\uB294 2-3 \uC601\uC5C5\uC77C \uB0B4\uC5D0 \uB3C4\uCC29\uD560 \uAC83\uC785\uB2C8\uB2E4.',
        next: '\uB2E4\uC74C',
        getPhysicalCard: '\uBB3C\uB9AC\uC801 \uCE74\uB4DC \uBC1B\uAE30',
        shipCard: '\uC120\uBC15 \uCE74\uB4DC',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: '\uC989\uC2DC (\uC9C1\uBD88 \uCE74\uB4DC)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% fee (${minAmount} minimum)`,
        ach: '1-3 \uC601\uC5C5\uC77C (\uC740\uD589 \uACC4\uC88C)',
        achSummary: '\uC218\uC218\uB8CC \uC5C6\uC74C',
        whichAccount: '\uC5B4\uB290 \uACC4\uC815\uC778\uAC00\uC694?',
        fee: '\uC218\uC218\uB8CC',
        transferSuccess: '\uC804\uC1A1 \uC131\uACF5!',
        transferDetailBankAccount: '\uB2F9\uC2E0\uC758 \uB3C8\uC740 \uB2E4\uC74C 1-3 \uC601\uC5C5\uC77C \uB0B4\uC5D0 \uB3C4\uCC29\uD574\uC57C \uD569\uB2C8\uB2E4.',
        transferDetailDebitCard: '\uB2F9\uC2E0\uC758 \uB3C8\uC740 \uC989\uC2DC \uB3C4\uCC29\uD574\uC57C \uD569\uB2C8\uB2E4.',
        failedTransfer:
            '\uB2F9\uC2E0\uC758 \uC794\uC561\uC774 \uC644\uC804\uD788 \uACB0\uC81C\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC740\uD589 \uACC4\uC88C\uB85C \uC774\uCCB4\uD574 \uC8FC\uC138\uC694.',
        notHereSubTitle: '\uC9C0\uAC11 \uD398\uC774\uC9C0\uC5D0\uC11C \uC794\uC561\uC744 \uC774\uCCB4\uD574 \uC8FC\uC138\uC694',
        goToWallet: '\uC9C0\uAC11\uC73C\uB85C \uAC00\uAE30',
    },
    chooseTransferAccountPage: {
        chooseAccount: '\uACC4\uC815 \uC120\uD0DD',
    },
    paymentMethodList: {
        addPaymentMethod: '\uACB0\uC81C \uBC29\uBC95 \uCD94\uAC00',
        addNewDebitCard: '\uC0C8\uB85C\uC6B4 \uC9C1\uBD88 \uCE74\uB4DC \uCD94\uAC00',
        addNewBankAccount: '\uC0C8\uB85C\uC6B4 \uC740\uD589 \uACC4\uC88C \uCD94\uAC00',
        accountLastFour: '\uC885\uB8CC \uC2DC\uAC04:',
        cardLastFour: '\uCE74\uB4DC \uB05D \uBC88\uD638\uB294',
        addFirstPaymentMethod:
            '\uC571 \uB0B4\uC5D0\uC11C \uC9C1\uC811 \uACB0\uC81C\uB97C \uBCF4\uB0B4\uACE0 \uBC1B\uC744 \uC218 \uC788\uB3C4\uB85D \uACB0\uC81C \uBC29\uBC95\uC744 \uCD94\uAC00\uD558\uC138\uC694.',
        defaultPaymentMethod: '\uAE30\uBCF8\uAC12',
    },
    preferencesPage: {
        appSection: {
            title: '\uC571 \uC120\uD638 \uC124\uC815',
        },
        testSection: {
            title: '\uD14C\uC2A4\uD2B8 \uC120\uD638 \uC124\uC815',
            subtitle: '\uC2A4\uD14C\uC774\uC9D5\uC5D0\uC11C \uC571\uC744 \uB514\uBC84\uADF8\uD558\uACE0 \uD14C\uC2A4\uD2B8\uD558\uB294 \uB370 \uB3C4\uC6C0\uC774 \uB418\uB294 \uC124\uC815.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '\uAD00\uB828 \uAE30\uB2A5 \uC5C5\uB370\uC774\uD2B8\uC640 Expensify \uB274\uC2A4\uB97C \uBC1B\uC544\uBCF4\uC138\uC694',
        muteAllSounds: 'Expensify\uC5D0\uC11C \uBAA8\uB4E0 \uC18C\uB9AC\uB97C \uC74C\uC18C\uAC70\uD558\uC2ED\uC2DC\uC624',
    },
    priorityModePage: {
        priorityMode: '\uC6B0\uC120 \uC21C\uC704 \uBAA8\uB4DC',
        explainerText:
            '\uC77D\uC9C0 \uC54A\uC740 \uCC44\uD305\uACFC \uACE0\uC815\uB41C \uCC44\uD305\uB9CC #\uC9D1\uC911\uD558\uAC70\uB098, \uAC00\uC7A5 \uCD5C\uADFC\uC758 \uCC44\uD305\uACFC \uACE0\uC815\uB41C \uCC44\uD305\uC744 \uC0C1\uB2E8\uC5D0 \uD45C\uC2DC\uD558\uB294 \uBAA8\uB4E0 \uAC83\uC744 \uBCF4\uC5EC\uC904\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
        priorityModes: {
            default: {
                label: '\uAC00\uC7A5 \uCD5C\uADFC\uC758',
                description: '\uAC00\uC7A5 \uCD5C\uADFC\uC5D0 \uC815\uB82C\uB41C \uBAA8\uB4E0 \uCC44\uD305 \uBCF4\uAE30',
            },
            gsd: {
                label: '#\uC9D1\uC911',
                description: '\uC77D\uC9C0 \uC54A\uC740 \uAC83\uB9CC \uC54C\uD30C\uBCB3 \uC21C\uC73C\uB85C \uD45C\uC2DC',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
    },
    reportDescriptionPage: {
        roomDescription: '\uBC29 \uC124\uBA85',
        roomDescriptionOptional: '\uBC29 \uC124\uBA85 (\uC120\uD0DD \uC0AC\uD56D)',
        explainerText: '\uBC29\uC5D0 \uB300\uD55C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC124\uBA85\uC744 \uC124\uC815\uD558\uC138\uC694.',
    },
    groupChat: {
        lastMemberTitle: '\uC8FC\uC758\uD558\uC138\uC694!',
        lastMemberWarning:
            '\uB2F9\uC2E0\uC774 \uC5EC\uAE30 \uC788\uB294 \uB9C8\uC9C0\uB9C9 \uC0AC\uB78C\uC774\uBBC0\uB85C, \uB5A0\uB098\uBA74 \uC774 \uCC44\uD305\uC740 \uBAA8\uB4E0 \uD68C\uC6D0\uB4E4\uC5D0\uAC8C \uC811\uADFC\uD560 \uC218 \uC5C6\uAC8C \uB429\uB2C8\uB2E4. \uC815\uB9D0\uB85C \uB5A0\uB098\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}'s group chat`,
    },
    languagePage: {
        language: '\uC5B8\uC5B4',
        languages: {
            en: {label: 'English'},
            es: {label: 'Español'},
            pt: {label: 'Português'},
            it: {label: 'Italiano'},
            de: {label: 'Deutsch'},
            fr: {label: 'Français'},
            nl: {label: 'Nederlands'},
            pl: {label: 'Polski'},
            ru: {label: 'Русский'},
            tr: {label: 'Türkçe'},
            ko: {label: '한국어'},
            ch: {label: '中文'},
            ja: {label: '日本語'},
            ro: {label: 'Română'},
        },
        translateMessage: '메시지 번역',
        viewOriginal: '원본 보기',
        showTranslation: '번역 보기',
    },
    themePage: {
        theme: '\uD14C\uB9C8',
        themes: {
            dark: {
                label: '\uC5B4\uB450\uC6B4',
            },
            light: {
                label: '\uBE5B',
            },
            system: {
                label: '\uC7A5\uCE58 \uC124\uC815 \uC0AC\uC6A9',
            },
        },
        chooseThemeBelowOrSync: '\uC544\uB798\uC758 \uD14C\uB9C8\uB97C \uC120\uD0DD\uD558\uAC70\uB098, \uC7A5\uCE58 \uC124\uC815\uACFC \uB3D9\uAE30\uD654\uD558\uC138\uC694.',
    },
    termsOfUse: {
        phrase1:
            "\uB85C\uADF8\uC778\uD568\uC73C\uB85C\uC368, \uB2F9\uC2E0\uC740 \uB3D9\uC758\uD569\uB2C8\uB2E4 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} \uB4F1\uC758 \uD50C\uB808\uC774\uC2A4\uD640\uB354\uB97C \uADF8\uB300\uB85C \uC720\uC9C0\uD558\uC2ED\uC2DC\uC624. \uD50C\uB808\uC774\uC2A4\uD640\uB354\uC758 \uB0B4\uC6A9\uC740 \uBB38\uAD6C\uC5D0\uC11C \uADF8\uB4E4\uC774 \uB098\uD0C0\uB0B4\uB294 \uAC83\uC744 \uC124\uBA85\uD558\uC9C0\uB9CC, \uC0BC\uD56D \uD45C\uD604\uC2DD\uC774\uB098 \uB2E4\uB978 TypeScript \uCF54\uB4DC\uB97C \uD3EC\uD568\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBE48 \uBB38\uC790\uC5F4\uC744 \uBC88\uC5ED\uD558\uB77C\uB294 \uC694\uCCAD\uC774 \uC788\uC73C\uBA74 \uADF8\uB300\uB85C \uBC18\uD658\uD558\uC2ED\uC2DC\uC624. \uBB38\uC790\uC5F4\uC744 \uC790\uB974\uC9C0 \uB9C8\uC2ED\uC2DC\uC624.",
        phrase2: '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00',
        phrase3: '\uADF8\uB9AC\uACE0',
        phrase4: '\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638',
        phrase5: `\uB3C8 \uC1A1\uAE08\uC740 ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010)\uAC00 \uADF8\uAC83\uC758 \uB530\uB77C \uC81C\uACF5\uB429\uB2C8\uB2E4.`,
        phrase6: '\uB77C\uC774\uC120\uC2A4',
    },
    validateCodeForm: {
        magicCodeNotReceived: '\uB9C8\uBC95 \uCF54\uB4DC\uB97C \uBC1B\uC9C0 \uBABB\uD558\uC168\uB098\uC694?',
        enterAuthenticatorCode: '\uC778\uC99D \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        enterRecoveryCode: '\uBCF5\uAD6C \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        requiredWhen2FAEnabled: '2FA\uAC00 \uD65C\uC131\uD654\uB418\uC5C8\uC744 \uB54C \uD544\uC694\uD569\uB2C8\uB2E4',
        requestNewCode: '\uC0C8 \uCF54\uB4DC\uB97C \uC694\uCCAD\uD558\uC2ED\uC2DC\uC624',
        requestNewCodeAfterErrorOccurred: '\uC0C8 \uCF54\uB4DC \uC694\uCCAD',
        error: {
            pleaseFillMagicCode: '\uB2F9\uC2E0\uC758 \uB9C8\uBC95 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            incorrectMagicCode: '\uC798\uBABB\uB41C \uB9C8\uBC95 \uCF54\uB4DC\uC785\uB2C8\uB2E4.',
            pleaseFillTwoFactorAuth: '\uB2F9\uC2E0\uC758 2\uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: '\uBAA8\uB4E0 \uD544\uB4DC\uB97C \uCC44\uC6CC\uC8FC\uC138\uC694',
        pleaseFillPassword: '\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        pleaseFillTwoFactorAuth: '2\uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        enterYourTwoFactorAuthenticationCodeToContinue: '\uACC4\uC18D\uD558\uB824\uBA74 \uB450 \uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694',
        forgot: '\uC78A\uC73C\uC168\uB098\uC694?',
        requiredWhen2FAEnabled: '2FA\uAC00 \uD65C\uC131\uD654\uB418\uC5C8\uC744 \uB54C \uD544\uC694\uD569\uB2C8\uB2E4',
        error: {
            incorrectPassword: '\uC798\uBABB\uB41C \uBE44\uBC00\uBC88\uD638\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',
            incorrectLoginOrPassword:
                '\uB85C\uADF8\uC778 \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',
            incorrect2fa: '\uC798\uBABB\uB41C 2\uB2E8\uACC4 \uC778\uC99D \uCF54\uB4DC\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            twoFactorAuthenticationEnabled:
                '\uC774 \uACC4\uC815\uC5D0\uB294 2FA\uAC00 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uC774\uBA54\uC77C \uB610\uB294 \uC804\uD654\uBC88\uD638\uB97C \uC0AC\uC6A9\uD558\uC5EC \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.',
            invalidLoginOrPassword:
                '\uB85C\uADF8\uC778 \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uBE44\uBC00\uBC88\uD638\uB97C \uC7AC\uC124\uC815\uD574\uC8FC\uC138\uC694.',
            unableToResetPassword:
                '\uBE44\uBC00\uBC88\uD638\uB97C \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4. \uC774\uB294 \uC624\uB798\uB41C \uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815 \uC774\uBA54\uC77C\uC5D0 \uC788\uB294 \uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815 \uB9C1\uD06C\uAC00 \uB9CC\uB8CC\uB418\uC5C8\uAE30 \uB54C\uBB38\uC77C \uAC00\uB2A5\uC131\uC774 \uB192\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD560 \uC218 \uC788\uB3C4\uB85D \uC0C8 \uB9C1\uD06C\uB97C \uC774\uBA54\uC77C\uB85C \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4. \uBC1B\uC740 \uD3B8\uC9C0\uD568\uACFC \uC2A4\uD338 \uD3F4\uB354\uB97C \uD655\uC778\uD574\uBCF4\uC138\uC694; \uBA87 \uBD84 \uC548\uC5D0 \uB3C4\uCC29\uD560 \uAC83\uC785\uB2C8\uB2E4.',
            noAccess:
                '\uC774 \uC560\uD50C\uB9AC\uCF00\uC774\uC158\uC5D0 \uC811\uADFC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC811\uADFC\uD558\uB824\uBA74 GitHub \uC0AC\uC6A9\uC790 \uC774\uB984\uC744 \uCD94\uAC00\uD574\uC8FC\uC138\uC694.',
            accountLocked:
                '\uB108\uBB34 \uB9CE\uC740 \uC2E4\uD328\uD55C \uC2DC\uB3C4 \uD6C4\uC5D0 \uADC0\uD558\uC758 \uACC4\uC815\uC774 \uC7A0\uACBC\uC2B5\uB2C8\uB2E4. 1\uC2DC\uAC04 \uD6C4\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            fallback: '\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
    },
    loginForm: {
        phoneOrEmail: '\uC804\uD654\uBC88\uD638 \uB610\uB294 \uC774\uBA54\uC77C',
        error: {
            invalidFormatEmailLogin:
                '\uC785\uB825\uD55C \uC774\uBA54\uC77C\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD615\uC2DD\uC744 \uC218\uC815\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
        cannotGetAccountDetails: '\uACC4\uC815 \uC138\uBD80 \uC815\uBCF4\uB97C \uAC80\uC0C9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uB85C\uADF8\uC778\uD574 \uC8FC\uC138\uC694.',
        loginForm: '\uB85C\uADF8\uC778 \uD3FC',
        notYou: ({user}: NotYouParams) => `Not ${user}?`,
    },
    onboarding: {
        welcome: '\uD658\uC601\uD569\uB2C8\uB2E4!',
        welcomeSignOffTitle: '\uB9CC\uB098\uC11C \uBC18\uAC11\uC2B5\uB2C8\uB2E4!',
        explanationModal: {
            title: 'Expensify\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4',
            description:
                '\uCC44\uD305\uC758 \uC18D\uB3C4\uB85C \uBE44\uC988\uB2C8\uC2A4\uC640 \uAC1C\uC778 \uC9C0\uCD9C\uC744 \uAD00\uB9AC\uD560 \uC218 \uC788\uB294 \uD558\uB098\uC758 \uC571. \uC2DC\uB3C4\uD574\uBCF4\uACE0 \uC5B4\uB5BB\uAC8C \uC0DD\uAC01\uD558\uB294\uC9C0 \uC54C\uB824\uC8FC\uC138\uC694. \uB354 \uB9CE\uC740 \uAC83\uB4E4\uC774 \uC900\uBE44\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4!',
            secondaryDescription:
                'Expensify Classic\uC73C\uB85C \uB3CC\uC544\uAC00\uB824\uBA74 \uD504\uB85C\uD544 \uC0AC\uC9C4\uC744 \uB204\uB974\uACE0 > Expensify Classic\uC73C\uB85C \uAC00\uAE30\uB97C \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624.',
        },
        welcomeVideo: {
            title: 'Expensify\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4',
            description:
                '\uBAA8\uB4E0 \uBE44\uC988\uB2C8\uC2A4 \uBC0F \uAC1C\uC778 \uC9C0\uCD9C\uC744 \uCC44\uD305\uC5D0\uC11C \uCC98\uB9AC\uD560 \uC218 \uC788\uB294 \uD558\uB098\uC758 \uC571. \uADC0\uD558\uC758 \uBE44\uC988\uB2C8\uC2A4, \uD300, \uADF8\uB9AC\uACE0 \uCE5C\uAD6C\uB4E4\uC744 \uC704\uD574 \uB9CC\uB4E4\uC5B4\uC84C\uC2B5\uB2C8\uB2E4.',
        },
        getStarted: '\uC2DC\uC791\uD558\uB2E4',
        whatsYourName: '\uB2F9\uC2E0\uC758 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        peopleYouMayKnow:
            '\uB2F9\uC2E0\uC774 \uC544\uB294 \uC0AC\uB78C\uB4E4\uC774 \uC774\uBBF8 \uC5EC\uAE30\uC5D0 \uC788\uC2B5\uB2C8\uB2E4! \uC774\uBA54\uC77C\uC744 \uC778\uC99D\uD558\uC5EC \uADF8\uB4E4\uC5D0\uAC8C \uD569\uB958\uD558\uC138\uC694.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: '\uC791\uC5C5 \uACF5\uAC04\uC5D0 \uAC00\uC785\uD558\uC138\uC694',
        listOfWorkspaces:
            '\uB2E4\uC74C\uC740 \uAC00\uC785\uD560 \uC218 \uC788\uB294 \uC791\uC5C5 \uACF5\uAC04 \uBAA9\uB85D\uC785\uB2C8\uB2E4. \uAC71\uC815\uD558\uC9C0 \uB9C8\uC138\uC694, \uC6D0\uD55C\uB2E4\uBA74 \uB098\uC911\uC5D0 \uC5B8\uC81C\uB4E0\uC9C0 \uAC00\uC785\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} member${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: '\uC5B4\uB514\uC5D0\uC11C \uC77C\uD558\uC2ED\uB2C8\uAE4C?',
        errorSelection: '\uACC4\uC18D\uD558\uB824\uBA74 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
        purpose: {
            title: '\uC624\uB298 \uBB34\uC5C7\uC744 \uD558\uACE0 \uC2F6\uC73C\uC2E0\uAC00\uC694?',
            errorContinue: '\uACC4\uC18D\uC744 \uB20C\uB7EC \uC124\uC815\uC744 \uC644\uB8CC\uD558\uC138\uC694.',
            errorBackButton: '\uC571\uC744 \uC0AC\uC6A9\uD558\uAE30 \uC2DC\uC791\uD558\uB824\uBA74 \uC124\uC815 \uC9C8\uBB38\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '\uB0B4 \uACE0\uC6A9\uC8FC\uC5D0\uAC8C \uB3C8\uC744 \uB3CC\uB824\uBC1B\uC73C\uC138\uC694',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '\uB098\uC758 \uD300\uC758 \uBE44\uC6A9\uC744 \uAD00\uB9AC\uD558\uB2E4',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '\uC9C0\uCD9C\uC744 \uCD94\uC801\uD558\uACE0 \uC608\uC0B0\uC744 \uC138\uC6B0\uC138\uC694',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '\uCE5C\uAD6C\uB4E4\uACFC \uCC44\uD305\uD558\uACE0 \uBE44\uC6A9\uC744 \uB098\uB204\uC138\uC694',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '\uB2E4\uB978 \uAC83',
        },
        employees: {
            title: '\uB2F9\uC2E0\uC740 \uC5BC\uB9C8\uB098 \uB9CE\uC740 \uC9C1\uC6D0\uC744 \uAC00\uC9C0\uACE0 \uC788\uB098\uC694?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10\uBA85\uC758 \uC9C1\uC6D0\uB4E4',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50\uBA85\uC758 \uC9C1\uC6D0\uB4E4',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100\uBA85\uC758 \uC9C1\uC6D0\uB4E4',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000\uBA85\uC758 \uC9C1\uC6D0\uB4E4',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '1,000\uBA85 \uC774\uC0C1\uC758 \uC9C1\uC6D0\uB4E4',
        },
        accounting: {
            title: '\uD68C\uACC4 \uC18C\uD504\uD2B8\uC6E8\uC5B4\uB97C \uC0AC\uC6A9\uD558\uC2DC\uB098\uC694?',
            noneOfAbove: '\uC704\uC758 \uC5B4\uB5A4 \uAC83\uB3C4 \uC544\uB2D8',
        },
        error: {
            requiredFirstName: '\uACC4\uC18D\uD558\uB824\uBA74 \uC131\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.',
        },
    },
    featureTraining: {
        doNotShowAgain: '\uC774\uAC83\uC744 \uB2E4\uC2DC \uBCF4\uC9C0 \uC54A\uAC8C \uD574\uC8FC\uC138\uC694',
    },
    personalDetails: {
        error: {
            containsReservedWord: '\uC774\uB984\uC5D0\uB294 Expensify \uB610\uB294 Concierge\uB77C\uB294 \uB2E8\uC5B4\uB97C \uD3EC\uD568\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            hasInvalidCharacter: '\uC774\uB984\uC5D0\uB294 \uC27C\uD45C\uB098 \uC138\uBBF8\uCF5C\uB860\uC744 \uD3EC\uD568\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            requiredFirstName: '\uC774\uB984\uC740 \uBE44\uC6CC\uB458 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '\uB2F9\uC2E0\uC758 \uBC95\uC801\uC778 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        enterDateOfBirth: '\uB2F9\uC2E0\uC758 \uC0DD\uB144\uC6D4\uC77C\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        enterAddress: '\uB2F9\uC2E0\uC758 \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        enterPhoneNumber: '\uB2F9\uC2E0\uC758 \uC804\uD654\uBC88\uD638\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        personalDetails: '\uAC1C\uC778 \uC815\uBCF4',
        privateDataMessage:
            '\uC774 \uC138\uBD80\uC0AC\uD56D\uB4E4\uC740 \uC5EC\uD589 \uBC0F \uACB0\uC81C\uC5D0 \uC0AC\uC6A9\uB429\uB2C8\uB2E4. \uC774\uB4E4\uC740 \uC808\uB300\uB85C \uACF5\uAC1C \uD504\uB85C\uD544\uC5D0 \uD45C\uC2DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
        legalName: '\uBC95\uC801 \uC774\uB984',
        legalFirstName: '\uBC95\uC801 \uC131\uBA85',
        legalLastName: '\uBC95\uC801 \uC131',
        address: '\uC8FC\uC18C',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `\uB0A0\uC9DC\uB294 ${dateString} \uC774\uC804\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `\uB0A0\uC9DC\uB294 ${dateString} \uC774\uD6C4\uC5EC\uC57C \uD569\uB2C8\uB2E4.`,
            hasInvalidCharacter: '\uC774\uB984\uC740 \uC624\uC9C1 \uB77C\uD2F4 \uBB38\uC790\uB9CC \uD3EC\uD568\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) =>
                `\uC798\uBABB\uB41C \uC6B0\uD3B8\uBC88\uD638 \uD615\uC2DD\uC785\uB2C8\uB2E4.${zipFormat ? ` 허용되는 형식: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `\uC804\uD654\uBC88\uD638\uAC00 \uC720\uD6A8\uD55C\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694 (\uC608: ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: '\uB9C1\uD06C\uAC00 \uB2E4\uC2DC \uBCF4\uB0B4\uC84C\uC2B5\uB2C8\uB2E4',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `\uB098\uB294 ${login}\uC5D0\uAC8C \uB9C8\uBC95 \uAC19\uC740 \uB85C\uADF8\uC778 \uB9C1\uD06C\uB97C \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4. \uB85C\uADF8\uC778\uD558\uB824\uBA74 ${loginType}\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.`,
        resendLink: '\uB9C1\uD06C \uC7AC\uC804\uC1A1',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: '\uC5F0\uACB0 \uD574\uC81C',
        linkSent: '\uB9C1\uD06C \uC804\uC1A1\uB428!',
        succesfullyUnlinkedLogin: '\uBCF4\uC870 \uB85C\uADF8\uC778\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uC5F0\uACB0 \uD574\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `\uC6B0\uB9AC\uC758 \uC774\uBA54\uC77C \uC81C\uACF5\uC790\uAC00 \uBC30\uC1A1 \uBB38\uC81C\uB85C \uC778\uD574 ${login}\uC73C\uB85C\uC758 \uC774\uBA54\uC77C\uC744 \uC77C\uC2DC\uC801\uC73C\uB85C \uC911\uB2E8\uD588\uC2B5\uB2C8\uB2E4. \uB85C\uADF8\uC778\uC744 \uCC28\uB2E8 \uD574\uC81C\uD558\uB824\uBA74 \uB2E4\uC74C \uB2E8\uACC4\uB97C \uB530\uB974\uC2ED\uC2DC\uC624:`,
        confirmThat: ({login}: ConfirmThatParams) => `Confirm that ${login} is spelled correctly and is a real, deliverable email address. `,
        emailAliases:
            '"expenses@domain.com"\uACFC \uAC19\uC740 \uC774\uBA54\uC77C \uBCC4\uCE6D\uC740 \uC720\uD6A8\uD55C Expensify \uB85C\uADF8\uC778\uC774 \uB418\uB824\uBA74 \uC790\uC2E0\uC758 \uC774\uBA54\uC77C \uC778\uBC15\uC2A4\uC5D0 \uC811\uADFC\uD560 \uC218 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4.',
        ensureYourEmailClient:
            'expensify.com\uC5D0\uC11C \uBCF4\uB0B4\uB294 \uC774\uBA54\uC77C\uC744 \uBC1B\uC744 \uC218 \uC788\uB3C4\uB85D \uC774\uBA54\uC77C \uD074\uB77C\uC774\uC5B8\uD2B8\uB97C \uC124\uC815\uD558\uC138\uC694.',
        youCanFindDirections:
            '\uC774 \uB2E8\uACC4\uB97C \uC644\uB8CC\uD558\uB294 \uBC29\uBC95\uC5D0 \uB300\uD55C \uC9C0\uC2DC\uC0AC\uD56D\uC744 \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        helpConfigure:
            '\uD558\uC9C0\uB9CC \uC774\uBA54\uC77C \uC124\uC815\uC744 \uAD6C\uC131\uD558\uB294 \uB370 IT \uBD80\uC11C\uC758 \uB3C4\uC6C0\uC774 \uD544\uC694\uD560 \uC218\uB3C4 \uC788\uC2B5\uB2C8\uB2E4.',
        onceTheAbove: '\uC704\uC758 \uB2E8\uACC4\uB97C \uBAA8\uB450 \uC644\uB8CC\uD558\uBA74, \uC5F0\uB77D\uD574 \uC8FC\uC138\uC694.',
        toUnblock: '\uB85C\uADF8\uC778 \uCC28\uB2E8\uC744 \uD574\uC81C\uD558\uC2ED\uC2DC\uC624.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `\uC6B0\uB9AC\uB294 ${login}\uC5D0 SMS \uBA54\uC2DC\uC9C0\uB97C \uC804\uB2EC\uD558\uB294 \uB370 \uC2E4\uD328\uD558\uC5EC 24\uC2DC\uAC04 \uB3D9\uC548 \uC911\uB2E8\uD558\uC600\uC2B5\uB2C8\uB2E4. \uBC88\uD638\uB97C \uAC80\uC99D\uD574 \uBCF4\uC138\uC694:`,
        validationFailed:
            '\uAC80\uC99D\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB9C8\uC9C0\uB9C9 \uC2DC\uB3C4 \uC774\uD6C4 24\uC2DC\uAC04\uC774 \uC9C0\uB098\uC9C0 \uC54A\uC558\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.',
        validationSuccess:
            '\uB2F9\uC2E0\uC758 \uBC88\uD638\uAC00 \uD655\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uC544\uB798\uB97C \uD074\uB9AD\uD558\uC5EC \uC0C8\uB85C\uC6B4 \uB9C8\uBC95\uC758 \uB85C\uADF8\uC778 \uCF54\uB4DC\uB97C \uBCF4\uB0B4\uC138\uC694.',
    },
    welcomeSignUpForm: {
        join: '\uAC00\uC785',
    },
    detailsPage: {
        localTime: '\uD604\uC9C0 \uC2DC\uAC04',
    },
    newChatPage: {
        startGroup: '\uADF8\uB8F9 \uC2DC\uC791',
        addToGroup: '\uADF8\uB8F9\uC5D0 \uCD94\uAC00\uD558\uAE30',
    },
    yearPickerPage: {
        year: '\uB144',
        selectYear: '\uC5F0\uB3C4\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694',
    },
    focusModeUpdateModal: {
        title: '#focus \uBAA8\uB4DC\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4!',
        prompt: '\uC77D\uC9C0 \uC54A\uC740 \uCC44\uD305\uC774\uB098 \uC8FC\uC758\uAC00 \uD544\uC694\uD55C \uCC44\uD305\uB9CC \uBCF4\uBA74\uC11C \uC77C\uC815\uC744 \uC798 \uAD00\uB9AC\uD558\uC138\uC694. \uAC71\uC815\uD558\uC9C0 \uB9C8\uC138\uC694, \uC774 \uC124\uC815\uC740 \uC5B8\uC81C\uB4E0\uC9C0 \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        settings: '\uC124\uC815',
    },
    notFound: {
        chatYouLookingForCannotBeFound: '\uCC3E\uACE0 \uC788\uB294 \uCC44\uD305\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        getMeOutOfHere: '\uC5EC\uAE30\uC11C \uB098\uB97C \uB370\uB824\uAC00\uC8FC\uC138\uC694',
        iouReportNotFound: '\uB2F9\uC2E0\uC774 \uCC3E\uACE0 \uC788\uB294 \uACB0\uC81C \uC138\uBD80 \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        notHere: '\uC74C... \uC5EC\uAE30\uC5D0 \uC5C6\uB124\uC694',
        pageNotFound: '\uC774\uB7F0, \uC774 \uD398\uC774\uC9C0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
        noAccess:
            '\uD574\uB2F9 \uCC44\uD305\uC774 \uC874\uC7AC\uD558\uC9C0 \uC54A\uAC70\uB098 \uC811\uADFC \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uCC44\uD305\uC744 \uCC3E\uAE30 \uC704\uD574 \uAC80\uC0C9\uC744 \uC0AC\uC6A9\uD574 \uBCF4\uC138\uC694.',
        goBackHome: '\uD648\uD398\uC774\uC9C0\uB85C \uB3CC\uC544\uAC00\uAE30',
    },
    setPasswordPage: {
        enterPassword: '\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694',
        setPassword: '\uBE44\uBC00\uBC88\uD638 \uC124\uC815',
        newPasswordPrompt:
            '\uB2F9\uC2E0\uC758 \uBE44\uBC00\uBC88\uD638\uB294 \uCD5C\uC18C 8\uC790, 1\uAC1C\uC758 \uB300\uBB38\uC790, 1\uAC1C\uC758 \uC18C\uBB38\uC790, \uADF8\uB9AC\uACE0 1\uAC1C\uC758 \uC22B\uC790\uB97C \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4.',
        passwordFormTitle:
            '\uC0C8\uB85C\uC6B4 Expensify\uC5D0 \uB2E4\uC2DC \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4! \uBE44\uBC00\uBC88\uD638\uB97C \uC124\uC815\uD574 \uC8FC\uC138\uC694.',
        passwordNotSet:
            '\uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC124\uC815\uD558\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2E4 \uC218 \uC788\uB3C4\uB85D \uC0C8 \uBE44\uBC00\uBC88\uD638 \uB9C1\uD06C\uB97C \uBCF4\uB0B4\uB4DC\uB838\uC2B5\uB2C8\uB2E4.',
        setPasswordLinkInvalid:
            '\uC774 \uC124\uC815\uB41C \uBE44\uBC00\uBC88\uD638 \uB9C1\uD06C\uB294 \uC720\uD6A8\uD558\uC9C0 \uC54A\uAC70\uB098 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uC6B4 \uB9C1\uD06C\uAC00 \uC774\uBA54\uC77C \uC778\uBC15\uC2A4\uC5D0 \uB300\uAE30\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4!',
        validateAccount: '\uACC4\uC815 \uD655\uC778',
    },
    statusPage: {
        status: '\uC0C1\uD0DC',
        statusExplanation:
            '\uB2F9\uC2E0\uC758 \uB3D9\uB8CC\uC640 \uCE5C\uAD6C\uB4E4\uC774 \uC27D\uAC8C \uC54C \uC218 \uC788\uB3C4\uB85D \uC774\uBAA8\uD2F0\uCF58\uC744 \uCD94\uAC00\uD558\uC138\uC694. \uC120\uD0DD\uC801\uC73C\uB85C \uBA54\uC2DC\uC9C0\uB3C4 \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4!',
        today: '\uC624\uB298',
        clearStatus: '\uC0C1\uD0DC \uC9C0\uC6B0\uAE30',
        save: '\uC800\uC7A5',
        message: '\uBA54\uC2DC\uC9C0',
        timePeriods: {
            never: '\uACB0\uCF54',
            thirtyMinutes: '30\uBD84',
            oneHour: '1\uC2DC\uAC04',
            afterToday: '\uC624\uB298',
            afterWeek: '\uC77C\uC8FC\uC77C',
            custom: '\uC0AC\uC6A9\uC790 \uC815\uC758',
        },
        untilTomorrow: '\uB0B4\uC77C\uAE4C\uC9C0',
        untilTime: ({time}: UntilTimeParams) => `Until ${time}`,
        date: '\uB0A0\uC9DC',
        time: '\uC2DC\uAC04',
        clearAfter: '\uD6C4\uC5D0 \uC9C0\uC6B0\uAE30',
        whenClearStatus: '\uC5B8\uC81C \uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC0C1\uD0DC\uB97C \uC9C0\uC6CC\uC57C \uD569\uB2C8\uAE4C?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `\uC2A4\uD15D ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '\uC740\uD589 \uC815\uBCF4',
        confirmBankInfo: '\uC740\uD589 \uC815\uBCF4 \uD655\uC778',
        manuallyAdd: '\uC218\uB3D9\uC73C\uB85C \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uC138\uC694',
        letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
        accountEnding: '\uACC4\uC88C \uB05D \uBC88\uD638\uB294',
        thisBankAccount:
            '\uC774 \uC740\uD589 \uACC4\uC88C\uB294 \uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uBE44\uC988\uB2C8\uC2A4 \uACB0\uC81C\uC5D0 \uC0AC\uC6A9\uB429\uB2C8\uB2E4',
        accountNumber: '\uACC4\uC88C \uBC88\uD638',
        routingNumber: '\uB77C\uC6B0\uD305 \uBC88\uD638',
        chooseAnAccountBelow: '\uC544\uB798\uC758 \uACC4\uC815\uC744 \uC120\uD0DD\uD558\uC138\uC694',
        addBankAccount: '\uC740\uD589 \uACC4\uC88C \uCD94\uAC00',
        chooseAnAccount: '\uACC4\uC815\uC744 \uC120\uD0DD\uD558\uC138\uC694',
        connectOnlineWithPlaid: '\uC740\uD589\uC5D0 \uB85C\uADF8\uC778\uD558\uC138\uC694',
        connectManually: '\uC218\uB3D9\uC73C\uB85C \uC5F0\uACB0\uD558\uC138\uC694',
        desktopConnection:
            '\uCC38\uACE0: Chase, Wells Fargo, Capital One \uB610\uB294 Bank of America\uC640 \uC5F0\uACB0\uD558\uB824\uBA74 \uC5EC\uAE30\uB97C \uD074\uB9AD\uD558\uC5EC \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC774 \uACFC\uC815\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.',
        yourDataIsSecure: '\uB2F9\uC2E0\uC758 \uB370\uC774\uD130\uB294 \uC548\uC804\uD569\uB2C8\uB2E4',
        toGetStarted:
            '\uBE44\uC6A9\uC744 \uD658\uAE09\uD558\uACE0, Expensify \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD558\uACE0, \uC1A1\uC7A5 \uC9C0\uBD88\uC744 \uC218\uC9D1\uD558\uACE0, \uBAA8\uB4E0 \uCCAD\uAD6C\uC11C\uB97C \uD55C \uACF3\uC5D0\uC11C \uC9C0\uBD88\uD558\uAE30 \uC704\uD574 \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
        plaidBodyCopy:
            '\uC9C1\uC6D0\uB4E4\uC774 \uD68C\uC0AC \uBE44\uC6A9\uC744 \uC9C0\uBD88\uD558\uACE0 - \uB3CC\uB824\uBC1B\uB294 - \uB354 \uC26C\uC6B4 \uBC29\uBC95\uC744 \uC81C\uACF5\uD558\uC138\uC694.',
        checkHelpLine:
            '\uADC0\uD558\uC758 \uB77C\uC6B0\uD305 \uBC88\uD638\uC640 \uACC4\uC88C \uBC88\uD638\uB294 \uD574\uB2F9 \uACC4\uC88C\uC758 \uC218\uD45C\uC5D0\uC11C \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        validateAccountError: {
            phrase1: '\uC7A0\uAE50\uB9CC\uC694! \uBA3C\uC800 \uACC4\uC815\uC744 \uC778\uC99D\uD574\uC57C \uD569\uB2C8\uB2E4. \uADF8\uB807\uAC8C \uD558\uB824\uBA74,',
            phrase2: '\uB9C8\uBC95 \uCF54\uB4DC\uB85C \uB2E4\uC2DC \uB85C\uADF8\uC778\uD558\uC138\uC694',
            phrase3: '\uB610\uB294',
            phrase4: '\uC5EC\uAE30\uC5D0\uC11C \uACC4\uC815\uC744 \uD655\uC778\uD558\uC138\uC694',
        },
        hasPhoneLoginError:
            '\uC778\uC99D\uB41C \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uB824\uBA74 \uAE30\uBCF8 \uB85C\uADF8\uC778\uC774 \uC720\uD6A8\uD55C \uC774\uBA54\uC77C\uC778\uC9C0 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694. \uC804\uD654\uBC88\uD638\uB97C \uBCF4\uC870 \uB85C\uADF8\uC778\uC73C\uB85C \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        hasBeenThrottledError:
            '\uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uB294 \uB3C4\uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        hasCurrencyError:
            '\uC774\uB7F0! \uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04 \uD1B5\uD654\uAC00 USD\uC640 \uB2E4\uB978 \uD1B5\uD654\uB85C \uC124\uC815\uB41C \uAC83 \uAC19\uC2B5\uB2C8\uB2E4. \uACC4\uC18D\uD558\uB824\uBA74 USD\uB85C \uC124\uC815\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        error: {
            youNeedToSelectAnOption: '\uC9C4\uD589\uD558\uB824\uBA74 \uC635\uC158\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.',
            noBankAccountAvailable: '\uC8C4\uC1A1\uD569\uB2C8\uB2E4, \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC740\uD589 \uACC4\uC88C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
            noBankAccountSelected: '\uACC4\uC815\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            taxID: '\uC720\uD6A8\uD55C \uC138\uAE08 ID \uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            website: '\uC720\uD6A8\uD55C \uC6F9\uC0AC\uC774\uD2B8\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
            zipCode: `\uB2E4\uC74C \uD615\uC2DD\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC720\uD6A8\uD55C ZIP \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}.`,
            phoneNumber: '\uC720\uD6A8\uD55C \uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            email: '\uC720\uD6A8\uD55C \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
            companyName: '\uC720\uD6A8\uD55C \uC0AC\uC5C5\uCCB4 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            addressCity: '\uC720\uD6A8\uD55C \uB3C4\uC2DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            addressStreet: '\uC720\uD6A8\uD55C \uAC70\uB9AC \uC8FC\uC18C\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            addressState: '\uC720\uD6A8\uD55C \uC8FC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            incorporationDateFuture: '\uD3EC\uD568 \uB0A0\uC9DC\uB294 \uBBF8\uB798\uC77C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            incorporationState: '\uC720\uD6A8\uD55C \uC8FC\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            industryCode: '\uC720\uD6A8\uD55C 6\uC790\uB9AC \uC0B0\uC5C5 \uBD84\uB958 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            restrictedBusiness: '\uC81C\uD55C\uB41C \uC0AC\uC5C5 \uBAA9\uB85D\uC5D0 \uC0AC\uC5C5\uC774 \uC5C6\uC74C\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
            routingNumber: '\uC720\uD6A8\uD55C \uB77C\uC6B0\uD305 \uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            accountNumber: '\uC720\uD6A8\uD55C \uACC4\uC88C \uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            routingAndAccountNumberCannotBeSame: '\uB77C\uC6B0\uD305 \uBC88\uD638\uC640 \uACC4\uC88C \uBC88\uD638\uB294 \uC77C\uCE58\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            companyType: '\uC720\uD6A8\uD55C \uD68C\uC0AC \uC720\uD615\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            tooManyAttempts:
                '\uB85C\uADF8\uC778 \uC2DC\uB3C4 \uD69F\uC218\uAC00 \uB9CE\uC544 \uC774 \uC635\uC158\uC740 24\uC2DC\uAC04 \uB3D9\uC548 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC218\uB3D9\uC73C\uB85C \uC815\uBCF4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
            address: '\uC720\uD6A8\uD55C \uC8FC\uC18C\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            dob: '\uC720\uD6A8\uD55C \uC0DD\uB144\uC6D4\uC77C\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            age: '18\uC138 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.',
            ssnLast4: '\uC720\uD6A8\uD55C SSN\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            firstName: '\uC720\uD6A8\uD55C \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            lastName: '\uC720\uD6A8\uD55C \uC131\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            noDefaultDepositAccountOrDebitCardAvailable: '\uAE30\uBCF8 \uC785\uAE08 \uACC4\uC88C\uB098 \uC9C1\uBD88 \uCE74\uB4DC\uB97C \uCD94\uAC00\uD574 \uC8FC\uC138\uC694.',
            validationAmounts:
                '\uC785\uB825\uD558\uC2E0 \uAC80\uC99D \uAE08\uC561\uC774 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC740\uD589 \uBA85\uC138\uC11C\uB97C \uB2E4\uC2DC \uD655\uC778\uD558\uACE0 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            fullName: '\uC720\uD6A8\uD55C \uC804\uCCB4 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            ownershipPercentage: '\uC720\uD6A8\uD55C \uD37C\uC13C\uD2B8 \uC22B\uC790\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C\uB294 \uC5B4\uB514\uC5D0 \uC788\uB098\uC694?',
        accountDetailsStepHeader: '\uB2F9\uC2E0\uC758 \uACC4\uC815 \uC815\uBCF4\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        accountTypeStepHeader: '\uC774\uAC83\uC740 \uC5B4\uB5A4 \uC885\uB958\uC758 \uACC4\uC815\uC778\uAC00\uC694?',
        bankInformationStepHeader: '\uB2F9\uC2E0\uC758 \uC740\uD589 \uC0C1\uC138 \uC815\uBCF4\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        accountHolderInformationStepHeader: '\uACC4\uC88C \uC18C\uC720\uC790\uC758 \uC138\uBD80 \uC815\uBCF4\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        howDoWeProtectYourData: '\uC6B0\uB9AC\uB294 \uC5B4\uB5BB\uAC8C \uC5EC\uB7EC\uBD84\uC758 \uB370\uC774\uD130\uB97C \uBCF4\uD638\uD558\uB098\uC694?',
        currencyHeader: '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C\uC758 \uD1B5\uD654\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        confirmationStepHeader: '\uB2F9\uC2E0\uC758 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uC138\uC694.',
        confirmationStepSubHeader:
            '\uC544\uB798\uC758 \uC138\uBD80 \uC0AC\uD56D\uC744 \uB2E4\uC2DC \uD655\uC778\uD558\uACE0, \uC57D\uAD00 \uD655\uC778\uB780\uC744 \uCCB4\uD06C\uD558\uC5EC \uD655\uC778\uD558\uC138\uC694.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694',
        alreadyAdded: '\uC774 \uACC4\uC815\uC740 \uC774\uBBF8 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        chooseAccountLabel: '\uACC4\uC815',
        successTitle: '\uAC1C\uC778 \uC740\uD589 \uACC4\uC88C\uAC00 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
        successMessage:
            '\uCD95\uD558\uD569\uB2C8\uB2E4, \uADC0\uD558\uC758 \uC740\uD589 \uACC4\uC88C\uAC00 \uC124\uC815\uB418\uC5B4 \uD658\uBD88\uC744 \uBC1B\uC744 \uC900\uBE44\uAC00 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
    },
    attachmentView: {
        unknownFilename: '\uC54C \uC218 \uC5C6\uB294 \uD30C\uC77C\uBA85',
        passwordRequired: '\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        passwordIncorrect: '\uC798\uBABB\uB41C \uBE44\uBC00\uBC88\uD638\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',
        failedToLoadPDF: 'PDF \uD30C\uC77C\uC744 \uBD88\uB7EC\uC624\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.',
        pdfPasswordForm: {
            title: '\uBE44\uBC00\uBC88\uD638\uB85C \uBCF4\uD638\uB41C PDF',
            infoText: '\uC774 PDF\uB294 \uBE44\uBC00\uBC88\uD638\uB85C \uBCF4\uD638\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.',
            beforeLinkText: '\uC81C\uBC1C',
            linkText: '\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694',
            afterLinkText: '\uADF8\uAC83\uC744 \uBCF4\uB824\uBA74.',
            formLabel: 'PDF \uBCF4\uAE30',
        },
        attachmentNotFound: '\uCCA8\uBD80 \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
    },
    messages: {
        errorMessageInvalidPhone: `\uAD04\uD638\uB098 \uB300\uC2DC \uC5C6\uC774 \uC720\uD6A8\uD55C \uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694. \uBBF8\uAD6D \uC678\uBD80\uC5D0 \uACC4\uC2DC\uB2E4\uBA74, \uAD6D\uAC00 \uCF54\uB4DC\uB97C \uD3EC\uD568\uD574 \uC8FC\uC138\uC694 (\uC608: ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: '\uC798\uBABB\uB41C \uC774\uBA54\uC77C',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is already a member of ${name}`,
    },
    onfidoStep: {
        acceptTerms:
            '\uB2F9\uC2E0\uC758 Expensify Wallet\uC744 \uD65C\uC131\uD654\uD558\uB294 \uC694\uCCAD\uC744 \uACC4\uC18D\uD568\uC73C\uB85C\uC368, \uB2F9\uC2E0\uC740 \uC774\uB97C \uC77D\uACE0, \uC774\uD574\uD558\uACE0, \uC218\uB77D\uD568\uC744 \uD655\uC778\uD569\uB2C8\uB2E4',
        facialScan: 'Onfido\uC758 \uC5BC\uAD74 \uC2A4\uCE94 \uC815\uCC45 \uBC0F \uB9B4\uB9AC\uC988',
        tryAgain: '\uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694',
        verifyIdentity: '\uC2E0\uC6D0 \uD655\uC778',
        letsVerifyIdentity: '\uB2F9\uC2E0\uC758 \uC2E0\uC6D0\uC744 \uD655\uC778\uD574\uBD05\uC2DC\uB2E4',
        butFirst: `But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError:
            '\uC774 \uB2E8\uACC4\uB97C \uCC98\uB9AC\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        cameraPermissionsNotGranted: '\uCE74\uBA54\uB77C \uC811\uADFC\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694',
        cameraRequestMessage:
            '\uC740\uD589 \uACC4\uC88C \uC778\uC99D\uC744 \uC644\uB8CC\uD558\uAE30 \uC704\uD574 \uCE74\uBA54\uB77C\uC5D0 \uC811\uADFC\uD560 \uD544\uC694\uAC00 \uC788\uC2B5\uB2C8\uB2E4. \uC124\uC815 > \uC0C8\uB85C\uC6B4 Expensify\uC5D0\uC11C \uD65C\uC131\uD654\uD574 \uC8FC\uC138\uC694.',
        microphonePermissionsNotGranted: '\uB9C8\uC774\uD06C \uC811\uADFC\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694',
        microphoneRequestMessage:
            '\uC740\uD589 \uACC4\uC88C \uC778\uC99D\uC744 \uC644\uB8CC\uD558\uAE30 \uC704\uD574 \uB2F9\uC2E0\uC758 \uB9C8\uC774\uD06C\uC5D0 \uC811\uADFC\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uC124\uC815 > \uC0C8\uB85C\uC6B4 Expensify\uC5D0\uC11C \uD65C\uC131\uD654\uD574 \uC8FC\uC138\uC694.',
        originalDocumentNeeded:
            '\uC2A4\uD06C\uB9B0\uC0F7\uC774\uB098 \uC2A4\uCE94\uB41C \uC774\uBBF8\uC9C0\uAC00 \uC544\uB2CC \uBCF8\uC778 ID\uC758 \uC6D0\uBCF8 \uC774\uBBF8\uC9C0\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
        documentNeedsBetterQuality:
            '\uB2F9\uC2E0\uC758 ID\uB294 \uC190\uC0C1\uB418\uC5C8\uAC70\uB098 \uBCF4\uC548 \uAE30\uB2A5\uC774 \uB204\uB77D\uB41C \uAC83\uC73C\uB85C \uBCF4\uC785\uB2C8\uB2E4. \uC190\uC0C1\uB418\uC9C0 \uC54A\uACE0 \uC644\uC804\uD788 \uBCF4\uC774\uB294 \uC6D0\uBCF8 ID \uC774\uBBF8\uC9C0\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
        imageNeedsBetterQuality:
            '\uB2F9\uC2E0\uC758 ID\uC758 \uC774\uBBF8\uC9C0 \uD488\uC9C8\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4. \uC804\uCCB4 ID\uAC00 \uBA85\uD655\uD558\uAC8C \uBCF4\uC774\uB294 \uC0C8\uB85C\uC6B4 \uC774\uBBF8\uC9C0\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
        selfieIssue:
            '\uB2F9\uC2E0\uC758 \uC140\uD53C/\uBE44\uB514\uC624\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4. \uC2E4\uC2DC\uAC04 \uC140\uD53C/\uBE44\uB514\uC624\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
        selfieNotMatching:
            '\uB2F9\uC2E0\uC758 \uC140\uD53C/\uBE44\uB514\uC624\uAC00 ID\uC640 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC5BC\uAD74\uC774 \uBA85\uD655\uD558\uAC8C \uBCF4\uC774\uB294 \uC0C8\uB85C\uC6B4 \uC140\uD53C/\uBE44\uB514\uC624\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
        selfieNotLive:
            '\uB2F9\uC2E0\uC758 \uC140\uCE74/\uBE44\uB514\uC624\uB294 \uC2E4\uC2DC\uAC04 \uC0AC\uC9C4/\uBE44\uB514\uC624\uB85C \uBCF4\uC774\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC2E4\uC2DC\uAC04 \uC140\uCE74/\uBE44\uB514\uC624\uB97C \uC5C5\uB85C\uB4DC\uD574 \uC8FC\uC138\uC694.',
    },
    additionalDetailsStep: {
        headerTitle: '\uCD94\uAC00 \uC138\uBD80 \uC0AC\uD56D',
        helpText:
            '\uB2F9\uC2E0\uC774 \uC9C0\uAC11\uC5D0\uC11C \uB3C8\uC744 \uBCF4\uB0B4\uACE0 \uBC1B\uAE30 \uC804\uC5D0 \uB2E4\uC74C \uC815\uBCF4\uB97C \uD655\uC778\uD574\uC57C \uD569\uB2C8\uB2E4.',
        helpTextIdologyQuestions:
            '\uB2F9\uC2E0\uC758 \uC2E0\uC6D0\uC744 \uD655\uC778\uD558\uAE30 \uC704\uD574 \uBA87 \uAC00\uC9C0 \uB354 \uC9C8\uBB38\uC744 \uB4DC\uB824\uC57C \uD569\uB2C8\uB2E4.',
        helpLink: '\uC774\uAC83\uC774 \uC65C \uD544\uC694\uD55C\uC9C0 \uB354 \uC790\uC138\uD788 \uC54C\uC544\uBCF4\uC138\uC694.',
        legalFirstNameLabel: '\uBC95\uC801 \uC131\uBA85',
        legalMiddleNameLabel: '\uBC95\uC801 \uC911\uAC04 \uC774\uB984',
        legalLastNameLabel: '\uBC95\uC801 \uC131',
        selectAnswer: '\uACC4\uC18D\uD558\uB824\uBA74 \uC751\uB2F5\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
        ssnFull9Error: '\uC720\uD6A8\uD55C 9\uC790\uB9AC SSN\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        needSSNFull9:
            '\uC6B0\uB9AC\uB294 \uADC0\uD558\uC758 \uC0AC\uD68C\uBCF4\uC7A5\uBC88\uD638\uB97C \uD655\uC778\uD558\uB294 \uB370 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4. \uC0AC\uD68C\uBCF4\uC7A5\uBC88\uD638\uC758 \uC804\uCCB4 9\uC790\uB9AC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        weCouldNotVerify: '\uC6B0\uB9AC\uB294 \uD655\uC778\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4',
        pleaseFixIt: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uC774 \uC815\uBCF4\uB97C \uC218\uC815\uD574 \uC8FC\uC138\uC694',
        failedKYCTextBefore:
            '\uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC2E0\uC6D0\uC744 \uD655\uC778\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC5F0\uB77D\uD574 \uC8FC\uC138\uC694.',
        failedKYCTextAfter: '\uC9C8\uBB38\uC774 \uC788\uC73C\uC2DC\uB2E4\uBA74.',
    },
    termsStep: {
        headerTitle: '\uC774\uC6A9 \uC57D\uAD00 \uBC0F \uC218\uC218\uB8CC',
        headerTitleRefactor: '\uC218\uC218\uB8CC \uBC0F \uC57D\uAD00',
        haveReadAndAgree: '\uB098\uB294 \uC77D\uC5C8\uC73C\uBA70 \uC218\uC2E0\uD558\uB294 \uB370 \uB3D9\uC758\uD569\uB2C8\uB2E4',
        electronicDisclosures: '\uC804\uC790\uC801 \uACF5\uC2DC',
        agreeToThe: '\uB098\uB294 \uB3D9\uC758\uD55C\uB2E4 ${',
        walletAgreement: '\uC9C0\uAC11 \uB3D9\uC758\uC11C',
        enablePayments: '\uACB0\uC81C\uB97C \uD65C\uC131\uD654\uD558\uC2ED\uC2DC\uC624',
        monthlyFee: '\uC6D4\uAC04 \uC694\uAE08',
        inactivity: '\uBE44\uD65C\uB3D9',
        noOverdraftOrCredit: '\uB2F9\uC88C\uB300\uCD9C/\uC2E0\uC6A9 \uAE30\uB2A5 \uC5C6\uC74C.',
        electronicFundsWithdrawal: '\uC804\uC790 \uC790\uAE08 \uC778\uCD9C',
        standard: '\uD45C\uC900',
        reviewTheFees: '\uC544\uB798\uC758 \uC218\uC218\uB8CC\uB97C \uAC80\uD1A0\uD574 \uC8FC\uC138\uC694.',
        checkTheBoxes: '\uC544\uB798\uC758 \uBC15\uC2A4\uB97C \uCCB4\uD06C\uD574\uC8FC\uC138\uC694.',
        agreeToTerms: '\uC57D\uAD00\uC5D0 \uB3D9\uC758\uD558\uC2DC\uBA74 \uC2DC\uC791\uD558\uC2E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify Wallet\uC740 ${walletProgram}\uC5D0 \uC758\uD574 \uBC1C\uAE09\uB429\uB2C8\uB2E4.`,
            perPurchase: '\uAD6C\uB9E4 \uB2F9',
            atmWithdrawal: 'ATM \uC778\uCD9C',
            cashReload: '\uD604\uAE08 \uC7AC\uCDA9\uC804',
            inNetwork: '\uB124\uD2B8\uC6CC\uD06C \uB0B4',
            outOfNetwork: '\uB124\uD2B8\uC6CC\uD06C \uC678\uBD80',
            atmBalanceInquiry: 'ATM \uC794\uC561 \uC870\uD68C',
            inOrOutOfNetwork: '(\uC778 \uB124\uD2B8\uC6CC\uD06C \uB610\uB294 \uC544\uC6C3 \uB124\uD2B8\uC6CC\uD06C)',
            customerService: '\uACE0\uAC1D \uC11C\uBE44\uC2A4',
            automatedOrLive: '(\uC790\uB3D9 \uB610\uB294 \uC2E4\uC2DC\uAC04 \uC5D0\uC774\uC804\uD2B8)',
            afterTwelveMonths: '(\uAC70\uB798\uAC00 \uC5C6\uB294 12\uAC1C\uC6D4 \uD6C4)',
            weChargeOneFee: '\uC6B0\uB9AC\uB294 \uD55C \uC885\uB958\uC758 \uC218\uC218\uB8CC\uB97C \uBD80\uACFC\uD569\uB2C8\uB2E4.',
            fdicInsurance: '\uB2F9\uC2E0\uC758 \uC790\uAE08\uC740 FDIC \uBCF4\uD5D8\uC5D0 \uC801\uACA9\uD569\uB2C8\uB2E4.',
            generalInfo: '\uC120\uBD88 \uACC4\uC88C\uC5D0 \uB300\uD55C \uC77C\uBC18\uC801\uC778 \uC815\uBCF4\uB97C \uC5BB\uC73C\uB824\uBA74 \uBC29\uBB38\uD558\uC2ED\uC2DC\uC624',
            conditionsDetails:
                '\uBAA8\uB4E0 \uC218\uC218\uB8CC\uC640 \uC11C\uBE44\uC2A4\uC5D0 \uB300\uD55C \uC138\uBD80 \uC0AC\uD56D\uACFC \uC870\uAC74\uC744 \uBCF4\uB824\uBA74 \uBC29\uBB38\uD558\uC2ED\uC2DC\uC624',
            conditionsPhone: '\uB610\uB294 +1 833-400-0904\uB85C \uC804\uD654\uD558\uC138\uC694.',
            instant: '(\uC989\uC2DC)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Expensify Wallet\uC758 \uBAA8\uB4E0 \uC218\uC218\uB8CC \uBAA9\uB85D',
            typeOfFeeHeader: '\uC218\uC218\uB8CC \uC720\uD615',
            feeAmountHeader: '\uC218\uC218\uB8CC \uAE08\uC561',
            moreDetailsHeader: '\uC790\uC138\uD55C \uB0B4\uC6A9',
            openingAccountTitle: '\uACC4\uC88C \uAC1C\uC124',
            openingAccountDetails: '\uACC4\uC88C\uB97C \uAC1C\uC124\uD558\uB294\uB370 \uC218\uC218\uB8CC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
            monthlyFeeDetails: '\uC6D4\uAC04 \uC774\uC6A9\uB8CC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
            customerServiceTitle: '\uACE0\uAC1D \uC11C\uBE44\uC2A4',
            customerServiceDetails: '\uACE0\uAC1D \uC11C\uBE44\uC2A4 \uC218\uC218\uB8CC\uB294 \uC5C6\uC2B5\uB2C8\uB2E4.',
            inactivityDetails: '\uBE44\uD65C\uB3D9 \uC218\uC218\uB8CC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
            sendingFundsTitle: '\uB2E4\uB978 \uACC4\uC88C \uC18C\uC720\uC790\uC5D0\uAC8C \uC790\uAE08\uC744 \uBCF4\uB0B4\uB294 \uC911',
            sendingFundsDetails:
                '\uB2F9\uC2E0\uC758 \uC794\uC561, \uC740\uD589 \uACC4\uC88C, \uB610\uB294 \uC9C1\uBD88 \uCE74\uB4DC\uB97C \uC0AC\uC6A9\uD558\uC5EC \uB2E4\uB978 \uACC4\uC88C \uC18C\uC720\uC790\uC5D0\uAC8C \uC790\uAE08\uC744 \uBCF4\uB0B4\uB294 \uB370\uC5D0\uB294 \uC218\uC218\uB8CC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
            electronicFundsStandardDetails:
                '\uB2F9\uC2E0\uC758 Expensify Wallet\uC5D0\uC11C \uC790\uAE08\uC744 \uC774\uCCB4\uD558\uB294\uB370\uB294 \uC218\uC218\uB8CC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4' +
                '\uD45C\uC900 \uC635\uC158\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC740\uD589 \uACC4\uC88C\uB85C \uC774\uCCB4\uD569\uB2C8\uB2E4. \uC774 \uC774\uCCB4\uB294 \uBCF4\uD1B5 1-3 \uC601\uC5C5\uC77C \uB0B4\uC5D0 \uC644\uB8CC\uB429\uB2C8\uB2E4.' +
                '\uC77C.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                '\uB2F9\uC2E0\uC758 Expensify Wallet\uC5D0\uC11C \uC790\uAE08\uC744 \uC774\uCCB4\uD558\uB294 \uB370\uC5D0\uB294 \uC218\uC218\uB8CC\uAC00 \uBD80\uACFC\uB429\uB2C8\uB2E4.' +
                '\uC989\uC2DC \uC774\uCCB4 \uC635\uC158\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC5F0\uACB0\uB41C \uC9C1\uBD88 \uCE74\uB4DC\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uC774 \uC774\uCCB4\uB294 \uBCF4\uD1B5' +
                `\uBA87 \uBD84 \uC18C\uC694\uB429\uB2C8\uB2E4. \uC218\uC218\uB8CC\uB294 \uC774\uCCB4 \uAE08\uC561\uC758 ${percentage}%\uC785\uB2C8\uB2E4 (\uCD5C\uC18C \uC218\uC218\uB8CC\uB294 ${amount}\uC785\uB2C8\uB2E4).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                '\uB2F9\uC2E0\uC758 \uC790\uAE08\uC740 FDIC \uBCF4\uD5D8\uC5D0 \uC801\uACA9\uD569\uB2C8\uB2E4. \uB2F9\uC2E0\uC758 \uC790\uAE08\uC740 ${username}\uC5D0\uC11C \uBCF4\uC720\uB420 \uAC83\uC785\uB2C8\uB2E4.' +
                `transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution. Once there, your funds are insured up ` +
                `to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails. See`,
            fdicInsuranceBancorp2: '\uC790\uC138\uD55C \uB0B4\uC6A9\uC740.',
            contactExpensifyPayments: `Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at`,
            contactExpensifyPayments2: '\uB610\uB294 \uB85C\uADF8\uC778\uD558\uC138\uC694',
            generalInformation: '\uC120\uBD88 \uACC4\uC88C\uC5D0 \uB300\uD55C \uC77C\uBC18\uC801\uC778 \uC815\uBCF4\uB97C \uC5BB\uC73C\uB824\uBA74 \uBC29\uBB38\uD558\uC2ED\uC2DC\uC624',
            generalInformation2:
                '\uC120\uBD88 \uACC4\uC88C\uC5D0 \uB300\uD55C \uBD88\uB9CC\uC774 \uC788\uC73C\uC2DC\uB2E4\uBA74, \uC18C\uBE44\uC790 \uAE08\uC735 \uBCF4\uD638\uAD6D\uC5D0 1-855-411-2372\uB85C \uC804\uD654\uD558\uC2DC\uAC70\uB098 \uBC29\uBB38\uD558\uC2ED\uC2DC\uC624.',
            printerFriendlyView: '\uD504\uB9B0\uD130 \uCE5C\uD654\uC801\uC778 \uBC84\uC804 \uBCF4\uAE30',
            automated: '\uC790\uB3D9\uD654\uB41C',
            liveAgent: '\uC2E4\uC2DC\uAC04 \uC0C1\uB2F4\uC6D0',
            instant: '\uC989\uC2DC',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '\uACB0\uC81C\uB97C \uD65C\uC131\uD654\uD558\uC2ED\uC2DC\uC624',
        activatedTitle: '\uC9C0\uAC11\uC774 \uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
        activatedMessage:
            '\uCD95\uD558\uD569\uB2C8\uB2E4, \uB2F9\uC2E0\uC758 \uC9C0\uAC11\uC774 \uC124\uC815\uB418\uC5B4 \uACB0\uC81C\uB97C \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
        checkBackLaterTitle: '\uC7A0\uC2DC\uB9CC\uC694...',
        checkBackLaterMessage:
            '\uC6B0\uB9AC\uB294 \uC544\uC9C1 \uADC0\uD558\uC758 \uC815\uBCF4\uB97C \uAC80\uD1A0 \uC911\uC785\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        continueToPayment: '\uACB0\uC81C\uB97C \uACC4\uC18D\uD558\uC138\uC694',
        continueToTransfer: '\uC804\uC1A1\uC744 \uACC4\uC18D\uD558\uC138\uC694',
    },
    companyStep: {
        headerTitle: '\uD68C\uC0AC \uC815\uBCF4',
        subtitle: '\uAC70\uC758 \uB2E4 \uB05D\uB0AC\uC2B5\uB2C8\uB2E4! \uBCF4\uC548\uC744 \uC704\uD574 \uBA87 \uAC00\uC9C0 \uC815\uBCF4\uB97C \uD655\uC778\uD574\uC57C \uD569\uB2C8\uB2E4:',
        legalBusinessName: '\uBC95\uC801 \uC0AC\uC5C5\uBA85',
        companyWebsite: '\uD68C\uC0AC \uC6F9\uC0AC\uC774\uD2B8',
        taxIDNumber: '\uC138\uAE08 \uACE0\uC720\uBC88\uD638',
        taxIDNumberPlaceholder: '9\uC790\uB9AC \uC22B\uC790',
        companyType: '\uD68C\uC0AC \uC720\uD615',
        incorporationDate: '\uC124\uB9BD \uB0A0\uC9DC',
        incorporationState: '\uBC95\uC778 \uC124\uB9BD \uC8FC',
        industryClassificationCode: '\uC0B0\uC5C5 \uBD84\uB958 \uCF54\uB4DC',
        confirmCompanyIsNot: '\uC774 \uD68C\uC0AC\uAC00 \uBAA9\uB85D\uC5D0 \uC5C6\uC74C\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.',
        listOfRestrictedBusinesses: '\uC81C\uD55C\uB41C \uC0AC\uC5C5 \uBAA9\uB85D',
        incorporationDatePlaceholder: '\uC2DC\uC791 \uB0A0\uC9DC (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: '\uD30C\uD2B8\uB108\uC2ED',
            COOPERATIVE: '\uD611\uB3D9\uC870\uD569',
            SOLE_PROPRIETORSHIP: '\uAC1C\uC778\uC0AC\uC5C5\uC790',
            OTHER: '\uB2E4\uB978',
        },
    },
    requestorStep: {
        headerTitle: '\uAC1C\uC778 \uC815\uBCF4',
        learnMore: '\uB354 \uC54C\uC544\uBCF4\uAE30',
        isMyDataSafe: '\uB098\uC758 \uB370\uC774\uD130\uB294 \uC548\uC804\uD55C\uAC00\uC694?',
    },
    personalInfoStep: {
        personalInfo: '\uAC1C\uC778 \uC815\uBCF4',
        enterYourLegalFirstAndLast: '\uB2F9\uC2E0\uC758 \uBC95\uC801\uC778 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        legalFirstName: '\uBC95\uC801 \uC131\uBA85',
        legalLastName: '\uBC95\uC801 \uC131',
        legalName: '\uBC95\uC801 \uC774\uB984',
        enterYourDateOfBirth: '\uB2F9\uC2E0\uC758 \uC0DD\uB144\uC6D4\uC77C\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        enterTheLast4: '\uB2F9\uC2E0\uC758 \uC0AC\uD68C\uBCF4\uC7A5\uBC88\uD638\uC758 \uB9C8\uC9C0\uB9C9 \uB124 \uC790\uB9AC\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        dontWorry: '\uAC71\uC815\uD558\uC9C0 \uB9C8\uC138\uC694, \uC6B0\uB9AC\uB294 \uAC1C\uC778 \uC2E0\uC6A9 \uD655\uC778\uC744 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!',
        last4SSN: 'SSN\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC',
        enterYourAddress: '\uB2F9\uC2E0\uC758 \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        address: '\uC8FC\uC18C',
        letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
        byAddingThisBankAccount:
            '\uC774 \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD568\uC73C\uB85C\uC368, \uB2F9\uC2E0\uC740 \uC774\uB97C \uC77D\uACE0, \uC774\uD574\uD558\uACE0, \uC218\uB77D\uD568\uC744 \uD655\uC778\uD569\uB2C8\uB2E4',
        whatsYourLegalName: '\uB2F9\uC2E0\uC758 \uBC95\uC801\uC778 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsYourDOB: '\uB2F9\uC2E0\uC758 \uC0DD\uB144\uC6D4\uC77C\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsYourAddress: '\uB2F9\uC2E0\uC758 \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsYourSSN: '\uB2F9\uC2E0\uC758 \uC0AC\uD68C\uBCF4\uC7A5\uBC88\uD638\uC758 \uB9C8\uC9C0\uB9C9 \uB124 \uC790\uB9AC\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        noPersonalChecks: '\uAC71\uC815\uD558\uC9C0 \uB9C8\uC138\uC694, \uC5EC\uAE30\uC11C \uAC1C\uC778 \uC2E0\uC6A9 \uD655\uC778\uC740 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!',
        whatsYourPhoneNumber: '\uB2F9\uC2E0\uC758 \uC804\uD654\uBC88\uD638\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        weNeedThisToVerify: '\uC6B0\uB9AC\uB294 \uC774\uAC83\uC774 \uB2F9\uC2E0\uC758 \uC9C0\uAC11\uC744 \uD655\uC778\uD558\uB294 \uB370 \uD544\uC694\uD569\uB2C8\uB2E4.',
    },
    businessInfoStep: {
        businessInfo: '\uD68C\uC0AC \uC815\uBCF4',
        enterTheNameOfYourBusiness: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        businessName: '\uBC95\uC801 \uD68C\uC0AC \uC774\uB984',
        enterYourCompanysTaxIdNumber: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC\uC758 \uC138\uAE08 ID \uBC88\uD638\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        taxIDNumber: '\uC138\uAE08 \uACE0\uC720\uBC88\uD638',
        taxIDNumberPlaceholder: '9\uC790\uB9AC \uC22B\uC790',
        enterYourCompanysWebsite: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC \uC6F9\uC0AC\uC774\uD2B8\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        companyWebsite: '\uD68C\uC0AC \uC6F9\uC0AC\uC774\uD2B8',
        enterYourCompanysPhoneNumber: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC \uC804\uD654\uBC88\uD638\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        enterYourCompanysAddress: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        selectYourCompanysType: '\uADF8\uAC83\uC740 \uC5B4\uB5A4 \uC885\uB958\uC758 \uD68C\uC0AC\uC778\uAC00\uC694?',
        companyType: '\uD68C\uC0AC \uC720\uD615',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: '\uD30C\uD2B8\uB108\uC2ED',
            COOPERATIVE: '\uD611\uB3D9\uC870\uD569',
            SOLE_PROPRIETORSHIP: '\uAC1C\uC778\uC0AC\uC5C5\uC790',
            OTHER: '\uB2E4\uB978',
        },
        selectYourCompanysIncorporationDate: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC \uC124\uB9BD \uB0A0\uC9DC\uB294 \uC5B8\uC81C\uC778\uAC00\uC694?',
        incorporationDate: '\uC124\uB9BD \uB0A0\uC9DC',
        incorporationDatePlaceholder: '\uC2DC\uC791 \uB0A0\uC9DC (yyyy-mm-dd)',
        incorporationState: '\uBC95\uC778 \uC124\uB9BD \uC8FC',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '\uB2F9\uC2E0\uC758 \uD68C\uC0AC\uB294 \uC5B4\uB290 \uC8FC\uC5D0\uC11C \uC124\uB9BD\uB418\uC5C8\uB098\uC694?',
        letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
        companyAddress: '\uD68C\uC0AC \uC8FC\uC18C',
        listOfRestrictedBusinesses: '\uC81C\uD55C\uB41C \uC0AC\uC5C5 \uBAA9\uB85D',
        confirmCompanyIsNot: '\uC774 \uD68C\uC0AC\uAC00 \uBAA9\uB85D\uC5D0 \uC5C6\uC74C\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.',
        businessInfoTitle: '\uC0AC\uC5C5 \uC815\uBCF4',
        legalBusinessName: '\uBC95\uC801 \uC0AC\uC5C5\uBA85',
        whatsTheBusinessName: '\uC0AC\uC5C5\uCCB4 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsTheBusinessAddress: '\uC0AC\uC5C5\uC7A5 \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsTheBusinessContactInformation: '\uBE44\uC988\uB2C8\uC2A4 \uC5F0\uB77D\uCC98 \uC815\uBCF4\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsTheBusinessRegistrationNumber: '\uC0AC\uC5C5\uC790 \uB4F1\uB85D \uBC88\uD638\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsTheBusinessTaxIDEIN: '\uC0AC\uC5C5\uC790 \uB4F1\uB85D \uBC88\uD638/\uC0AC\uC5C5\uC790 \uACE0\uC720 \uC2DD\uBCC4 \uBC88\uD638/EIN/VAT/GST\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsThisNumber: '\uC774 \uBC88\uD638\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whereWasTheBusinessIncorporated: '\uC0AC\uC5C5\uCCB4\uB294 \uC5B4\uB514\uC5D0\uC11C \uC124\uB9BD\uB418\uC5C8\uB098\uC694?',
        whatTypeOfBusinessIsIt: '\uADF8\uAC83\uC740 \uC5B4\uB5A4 \uC885\uB958\uC758 \uC0AC\uC5C5\uC778\uAC00\uC694?',
        whatsTheBusinessAnnualPayment: '\uC0AC\uC5C5\uCCB4\uC758 \uC5F0\uAC04 \uACB0\uC81C\uB7C9\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?',
        whatsYourExpectedAverageReimbursements: '\uB2F9\uC2E0\uC758 \uC608\uC0C1 \uD3C9\uADE0 \uD658\uBD88 \uAE08\uC561\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?',
        registrationNumber: '\uB4F1\uB85D \uBC88\uD638',
        taxIDEIN: '\uC138\uAE08 ID/EIN \uBC88\uD638',
        businessAddress: '\uC0AC\uC5C5\uC7A5 \uC8FC\uC18C',
        businessType: '\uC0AC\uC5C5 \uC720\uD615',
        incorporation: '\uBC95\uC778\uD654',
        incorporationCountry: '\uB4F1\uAE30 \uAD6D\uAC00',
        incorporationTypeName: '\uBC95\uC778 \uC720\uD615',
        businessCategory: '\uBE44\uC988\uB2C8\uC2A4 \uCE74\uD14C\uACE0\uB9AC',
        annualPaymentVolume: '\uC5F0\uAC04 \uACB0\uC81C \uAE08\uC561',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: '\uD3C9\uADE0 \uD658\uBD88 \uAE08\uC561',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: '\uBC95\uC778 \uC720\uD615 \uC120\uD0DD',
        selectBusinessCategory: '\uBE44\uC988\uB2C8\uC2A4 \uCE74\uD14C\uACE0\uB9AC \uC120\uD0DD',
        selectAnnualPaymentVolume: '\uC5F0\uAC04 \uACB0\uC81C \uAE08\uC561 \uC120\uD0DD',
        selectIncorporationCountry: '\uBC95\uC778 \uC124\uB9BD \uAD6D\uAC00 \uC120\uD0DD',
        selectIncorporationState: '\uBC95\uC778 \uC124\uB9BD \uC8FC \uC120\uD0DD',
        selectAverageReimbursement: '\uD3C9\uADE0 \uBCF4\uC0C1 \uAE08\uC561 \uC120\uD0DD',
        findIncorporationType: '\uBC95\uC778 \uC720\uD615 \uCC3E\uAE30',
        findBusinessCategory: '\uBE44\uC988\uB2C8\uC2A4 \uCE74\uD14C\uACE0\uB9AC \uCC3E\uAE30',
        findAnnualPaymentVolume: '\uC5F0\uAC04 \uACB0\uC81C \uAE08\uC561 \uCC3E\uAE30',
        findIncorporationState: '\uBC95\uC778 \uC124\uB9BD \uC0C1\uD0DC \uCC3E\uAE30',
        findAverageReimbursement: '\uD3C9\uADE0 \uD658\uBD88 \uAE08\uC561 \uCC3E\uAE30',
        error: {
            registrationNumber: '\uC720\uD6A8\uD55C \uB4F1\uB85D \uBC88\uD638\uB97C \uC81C\uACF5\uD574 \uC8FC\uC138\uC694.',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: '\uB2F9\uC2E0\uC774 25% \uC774\uC0C1 \uC18C\uC720\uD558\uACE0 \uC788\uC2B5\uB2C8\uAE4C?',
        doAnyIndividualOwn25percent: '25% \uC774\uC0C1\uC744 \uC18C\uC720\uD558\uACE0 \uC788\uB294 \uAC1C\uC778\uC774 \uC788\uC2B5\uB2C8\uAE4C?',
        areThereMoreIndividualsWhoOwn25percent: '25% \uC774\uC0C1 \uC18C\uC720\uD55C \uAC1C\uC778\uC774 \uB354 \uB9CE\uC2B5\uB2C8\uAE4C?',
        regulationRequiresUsToVerifyTheIdentity:
            '\uADDC\uC815\uC5D0 \uB530\uB77C \uC0AC\uC5C5\uCCB4\uC758 25% \uC774\uC0C1\uC744 \uC18C\uC720\uD55C \uBAA8\uB4E0 \uAC1C\uC778\uC758 \uC2E0\uC6D0\uC744 \uD655\uC778\uD574\uC57C \uD569\uB2C8\uB2E4.',
        companyOwner: '\uC0AC\uC5C5\uC8FC',
        enterLegalFirstAndLastName: '\uC18C\uC720\uC790\uC758 \uBC95\uC801 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        legalFirstName: '\uBC95\uC801 \uC131\uBA85',
        legalLastName: '\uBC95\uC801 \uC131',
        enterTheDateOfBirthOfTheOwner: '\uC18C\uC720\uC790\uC758 \uC0DD\uB144\uC6D4\uC77C\uC740 \uC5B8\uC81C\uC778\uAC00\uC694?',
        enterTheLast4: '\uC18C\uC720\uC790\uC758 \uC0AC\uD68C \uBCF4\uC7A5 \uBC88\uD638\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        last4SSN: 'SSN\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC',
        dontWorry: '\uAC71\uC815\uD558\uC9C0 \uB9C8\uC138\uC694, \uC6B0\uB9AC\uB294 \uAC1C\uC778 \uC2E0\uC6A9 \uD655\uC778\uC744 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!',
        enterTheOwnersAddress: '\uC18C\uC720\uC790\uC758 \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
        legalName: '\uBC95\uC801 \uC774\uB984',
        address: '\uC8FC\uC18C',
        byAddingThisBankAccount:
            '\uC774 \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD568\uC73C\uB85C\uC368, \uB2F9\uC2E0\uC740 \uC774\uB97C \uC77D\uACE0, \uC774\uD574\uD558\uACE0, \uC218\uB77D\uD568\uC744 \uD655\uC778\uD569\uB2C8\uB2E4',
        owners: '\uC18C\uC720\uC790\uB4E4',
    },
    ownershipInfoStep: {
        ownerInfo: '\uC18C\uC720\uC790 \uC815\uBCF4',
        businessOwner: '\uC0AC\uC5C5\uC8FC',
        signerInfo: '\uC11C\uBA85\uC790 \uC815\uBCF4',
        doYouOwn: ({companyName}: CompanyNameParams) => `Do you own 25% or more of ${companyName}`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Does any individuals own 25% or more of ${companyName}`,
        regulationsRequire:
            '\uADDC\uC815\uC5D0 \uB530\uB77C \uC6B0\uB9AC\uB294 \uC0AC\uC5C5\uC758 25% \uC774\uC0C1\uC744 \uC18C\uC720\uD55C \uBAA8\uB4E0 \uAC1C\uC778\uC758 \uC2E0\uC6D0\uC744 \uD655\uC778\uD574\uC57C \uD569\uB2C8\uB2E4.',
        legalFirstName: '\uBC95\uC801 \uC131\uBA85',
        legalLastName: '\uBC95\uC801 \uC131',
        whatsTheOwnersName: '\uC18C\uC720\uC790\uC758 \uBC95\uC801 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsYourName: '\uB2F9\uC2E0\uC758 \uBC95\uC801\uC778 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatPercentage: '\uC0AC\uC5C5\uC758 \uC5B4\uB290 \uD37C\uC13C\uD2B8\uAC00 \uC18C\uC720\uC8FC\uC5D0\uAC8C \uC18D\uD574 \uC788\uB098\uC694?',
        whatsYoursPercentage: '\uB2F9\uC2E0\uC774 \uC18C\uC720\uD558\uACE0 \uC788\uB294 \uC0AC\uC5C5\uC758 \uBE44\uC728\uC740 \uC5BC\uB9C8\uC778\uAC00\uC694?',
        ownership: '\uC18C\uC720\uAD8C',
        whatsTheOwnersDOB: '\uC18C\uC720\uC790\uC758 \uC0DD\uB144\uC6D4\uC77C\uC740 \uC5B8\uC81C\uC778\uAC00\uC694?',
        whatsYourDOB: '\uB2F9\uC2E0\uC758 \uC0DD\uB144\uC6D4\uC77C\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsTheOwnersAddress: '\uC18C\uC720\uC790\uC758 \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsYourAddress: '\uB2F9\uC2E0\uC758 \uC8FC\uC18C\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatAreTheLast: '\uC18C\uC720\uC790\uC758 \uC0AC\uD68C\uBCF4\uC7A5\uBC88\uD638 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        whatsYourLast: '\uB2F9\uC2E0\uC758 \uC0AC\uD68C \uBCF4\uC7A5 \uBC88\uD638\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        dontWorry: '\uAC71\uC815\uD558\uC9C0 \uB9C8\uC138\uC694, \uC6B0\uB9AC\uB294 \uAC1C\uC778 \uC2E0\uC6A9 \uD655\uC778\uC744 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4!',
        last4: 'SSN\uC758 \uB9C8\uC9C0\uB9C9 4\uC790\uB9AC',
        whyDoWeAsk: '\uC65C \uC774\uAC83\uC744 \uC694\uCCAD\uD558\uB294\uAC00\uC694?',
        letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
        legalName: '\uBC95\uC801 \uC774\uB984',
        ownershipPercentage: '\uC18C\uC720 \uBE44\uC728',
        areThereOther: ({companyName}: CompanyNameParams) => `Are there other individuals who own 25% or more of ${companyName}`,
        owners: '\uC18C\uC720\uC790\uB4E4',
        addCertified: '\uC2E4\uC775 \uC18C\uC720\uC8FC\uB97C \uBCF4\uC5EC\uC8FC\uB294 \uACF5\uC778\uB41C \uC870\uC9C1\uB3C4\uB97C \uCD94\uAC00\uD558\uC2ED\uC2DC\uC624',
        regulationRequiresChart:
            '\uADDC\uC815\uC5D0 \uB530\uB77C \uC6B0\uB9AC\uB294 \uC0AC\uC5C5\uCCB4\uC758 25% \uC774\uC0C1\uC744 \uC18C\uC720\uD55C \uBAA8\uB4E0 \uAC1C\uC778 \uB610\uB294 \uC5D4\uD2F0\uD2F0\uB97C \uBCF4\uC5EC\uC8FC\uB294 \uC18C\uC720\uAD8C \uCC28\uD2B8\uC758 \uC778\uC99D \uBCF5\uC0AC\uBCF8\uC744 \uC218\uC9D1\uD574\uC57C \uD569\uB2C8\uB2E4.',
        uploadEntity: '\uC5D4\uD2F0\uD2F0 \uC18C\uC720\uAD8C \uCC28\uD2B8 \uC5C5\uB85C\uB4DC',
        noteEntity:
            '\uCC38\uACE0: \uC5D4\uD2F0\uD2F0 \uC18C\uC720\uAD8C \uCC28\uD2B8\uB294 \uD68C\uACC4\uC0AC, \uBC95\uB960 \uC790\uBB38, \uB610\uB294 \uACF5\uC99D\uC778\uC5D0 \uC758\uD574 \uC11C\uBA85\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4.',
        certified: '\uC778\uC99D\uB41C \uC5D4\uD2F0\uD2F0 \uC18C\uC720 \uCC28\uD2B8',
        selectCountry: '\uAD6D\uAC00 \uC120\uD0DD',
        findCountry: '\uAD6D\uAC00 \uCC3E\uAE30',
        address: '\uC8FC\uC18C',
    },
    validationStep: {
        headerTitle: '\uC740\uD589 \uACC4\uC88C \uD655\uC778',
        buttonText: '\uC124\uC815 \uC644\uB8CC',
        maxAttemptsReached:
            '\uC774 \uC740\uD589 \uACC4\uC88C\uC758 \uC720\uD6A8\uC131 \uAC80\uC0AC\uB294 \uB108\uBB34 \uB9CE\uC740 \uC798\uBABB\uB41C \uC2DC\uB3C4\uB85C \uC778\uD574 \uBE44\uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '\uC544\uB798 \uD544\uB4DC\uC5D0 \uAC01 \uAC70\uB798 \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694. \uC608\uC2DC: 1.51.',
        reviewingInfo:
            '\uAC10\uC0AC\uD569\uB2C8\uB2E4! \uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC815\uBCF4\uB97C \uAC80\uD1A0 \uC911\uC774\uBA70, \uACE7 \uC5F0\uB77D\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4. Concierge\uC640\uC758 \uCC44\uD305\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        forNextStep: '\uC740\uD589 \uACC4\uC88C \uC124\uC815\uC744 \uC644\uB8CC\uD558\uAE30 \uC704\uD55C \uB2E4\uC74C \uB2E8\uACC4\uB97C \uC704\uD574.',
        letsChatCTA: '\uB124, \uB300\uD654\uD569\uC2DC\uB2E4',
        letsChatText:
            '\uAC70\uC758 \uB2E4 \uC654\uC5B4\uC694! \uCC44\uD305\uC744 \uD1B5\uD574 \uB9C8\uC9C0\uB9C9 \uBA87 \uAC00\uC9C0 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uB294 \uB370 \uB3C4\uC6C0\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uC900\uBE44\uB418\uC168\uB098\uC694?',
        letsChatTitle: '\uC7A1\uB2F4\uD558\uC790!',
        enable2FATitle: '\uC0AC\uAE30\uB97C \uBC29\uC9C0\uD558\uB824\uBA74 \uC774\uC911 \uC778\uC99D (2FA)\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694',
        enable2FAText:
            '\uC6B0\uB9AC\uB294 \uADC0\uD558\uC758 \uBCF4\uC548\uC744 \uB9E4\uC6B0 \uC911\uC694\uD558\uAC8C \uC0DD\uAC01\uD569\uB2C8\uB2E4. \uACC4\uC815\uC5D0 \uCD94\uAC00 \uBCF4\uD638\uCE35\uC744 \uCD94\uAC00\uD558\uAE30 \uC704\uD574 \uC9C0\uAE08 2FA\uB97C \uC124\uC815\uD574 \uC8FC\uC138\uC694.',
        secureYourAccount: '\uACC4\uC815\uC744 \uBCF4\uD638\uD558\uC138\uC694',
    },
    beneficialOwnersStep: {
        additionalInformation: '\uCD94\uAC00 \uC815\uBCF4',
        checkAllThatApply:
            '\uD574\uB2F9\uD558\uB294 \uBAA8\uB4E0 \uD56D\uBAA9\uC744 \uCCB4\uD06C\uD558\uC2ED\uC2DC\uC624, \uADF8\uB807\uC9C0 \uC54A\uC73C\uBA74 \uBE44\uC6CC \uB450\uC2ED\uC2DC\uC624.',
        iOwnMoreThan25Percent: '\uB098\uB294 25% \uC774\uC0C1 \uC18C\uC720\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
        someoneOwnsMoreThan25Percent: '\uB2E4\uB978 \uC0AC\uB78C\uC774 25% \uC774\uC0C1 \uC18C\uC720\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4',
        additionalOwner: '\uCD94\uAC00 \uC774\uC775 \uC18C\uC720\uC8FC',
        removeOwner: '\uC774 \uC774\uC775 \uC18C\uC720\uC8FC\uB97C \uC81C\uAC70\uD558\uC2ED\uC2DC\uC624',
        addAnotherIndividual: '25% \uC774\uC0C1 \uC18C\uC720\uD55C \uB2E4\uB978 \uAC1C\uC778\uC744 \uCD94\uAC00\uD558\uC2ED\uC2DC\uC624.',
        agreement: '\uB3D9\uC758:',
        termsAndConditions: '\uC774\uC6A9 \uC57D\uAD00',
        certifyTrueAndAccurate: '\uC81C\uACF5\uB41C \uC815\uBCF4\uAC00 \uC0AC\uC2E4\uC774\uBA70 \uC815\uD655\uD568\uC744 \uBCF4\uC99D\uD569\uB2C8\uB2E4',
        error: {
            certify: '\uC815\uBCF4\uAC00 \uC9C4\uC2E4\uD558\uACE0 \uC815\uD655\uD568\uC744 \uC778\uC99D\uD574\uC57C \uD569\uB2C8\uB2E4.',
        },
    },
    completeVerificationStep: {
        completeVerification: '\uAC80\uC99D \uC644\uB8CC',
        confirmAgreements: '\uC544\uB798\uC758 \uB3D9\uC758 \uC0AC\uD56D\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        certifyTrueAndAccurate: '\uC81C\uACF5\uB41C \uC815\uBCF4\uAC00 \uC0AC\uC2E4\uC774\uBA70 \uC815\uD655\uD568\uC744 \uBCF4\uC99D\uD569\uB2C8\uB2E4',
        certifyTrueAndAccurateError: '\uC815\uBCF4\uAC00 \uC9C4\uC2E4\uD558\uACE0 \uC815\uD655\uD55C\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694',
        isAuthorizedToUseBankAccount:
            '\uB098\uB294 \uC774 \uC0AC\uC5C5 \uC740\uD589 \uACC4\uC88C\uB97C \uC0AC\uC5C5 \uC9C0\uCD9C\uC5D0 \uC0AC\uC6A9\uD560 \uAD8C\uD55C\uC774 \uC788\uC2B5\uB2C8\uB2E4',
        isAuthorizedToUseBankAccountError:
            '\uB2F9\uC2E0\uC740 \uC0AC\uC5C5 \uC740\uD589 \uACC4\uC88C\uB97C \uC6B4\uC601\uD560 \uAD8C\uD55C\uC774 \uC788\uB294 \uAD00\uB9AC \uCC45\uC784\uC790\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.',
        termsAndConditions: '\uC774\uC6A9 \uC57D\uAD00',
    },
    connectBankAccountStep: {
        connectBankAccount: '\uC740\uD589 \uACC4\uC88C \uC5F0\uACB0',
        finishButtonText: '\uC124\uC815 \uC644\uB8CC',
        validateYourBankAccount: '\uC740\uD589 \uACC4\uC88C\uB97C \uAC80\uC99D\uD558\uC138\uC694',
        validateButtonText: '\uC720\uD6A8\uC131 \uAC80\uC0AC',
        validationInputLabel: '\uAC70\uB798',
        maxAttemptsReached:
            '\uC774 \uC740\uD589 \uACC4\uC88C\uC758 \uC720\uD6A8\uC131 \uAC80\uC0AC\uB294 \uB108\uBB34 \uB9CE\uC740 \uC798\uBABB\uB41C \uC2DC\uB3C4\uB85C \uC778\uD574 \uBE44\uD65C\uC131\uD654\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: '\uC544\uB798 \uD544\uB4DC\uC5D0 \uAC01 \uAC70\uB798 \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694. \uC608\uC2DC: 1.51.',
        reviewingInfo:
            '\uAC10\uC0AC\uD569\uB2C8\uB2E4! \uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC815\uBCF4\uB97C \uAC80\uD1A0 \uC911\uC774\uBA70 \uACE7 \uC5F0\uB77D\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4. Concierge\uC640\uC758 \uCC44\uD305\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        forNextSteps: '\uC740\uD589 \uACC4\uC88C \uC124\uC815\uC744 \uC644\uB8CC\uD558\uAE30 \uC704\uD55C \uB2E4\uC74C \uB2E8\uACC4\uB97C \uC704\uD574.',
        letsChatCTA: '\uB124, \uB300\uD654\uD569\uC2DC\uB2E4',
        letsChatText:
            '\uAC70\uC758 \uB2E4 \uC654\uC5B4\uC694! \uCC44\uD305\uC744 \uD1B5\uD574 \uB9C8\uC9C0\uB9C9 \uBA87 \uAC00\uC9C0 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uB294 \uB370 \uB3C4\uC6C0\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uC900\uBE44\uB418\uC168\uB098\uC694?',
        letsChatTitle: '\uC7A1\uB2F4\uD558\uC790!',
        enable2FATitle: '\uC0AC\uAE30\uB97C \uBC29\uC9C0\uD558\uB824\uBA74 \uC774\uC911 \uC778\uC99D (2FA)\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694',
        enable2FAText:
            '\uC6B0\uB9AC\uB294 \uADC0\uD558\uC758 \uBCF4\uC548\uC744 \uB9E4\uC6B0 \uC911\uC694\uD558\uAC8C \uC0DD\uAC01\uD569\uB2C8\uB2E4. \uACC4\uC815\uC5D0 \uCD94\uAC00 \uBCF4\uD638\uCE35\uC744 \uCD94\uAC00\uD558\uAE30 \uC704\uD574 \uC9C0\uAE08 2FA\uB97C \uC124\uC815\uD574 \uC8FC\uC138\uC694.',
        secureYourAccount: '\uACC4\uC815\uC744 \uBCF4\uD638\uD558\uC138\uC694',
    },
    countryStep: {
        confirmBusinessBank: '\uC0AC\uC5C5 \uC740\uD589 \uACC4\uC88C\uC758 \uD1B5\uD654\uC640 \uAD6D\uAC00\uB97C \uD655\uC778\uD558\uC138\uC694',
        confirmCurrency: '\uD1B5\uD654\uC640 \uAD6D\uAC00\uB97C \uD655\uC778\uD558\uC138\uC694',
        yourBusiness:
            '\uADC0\uD558\uC758 \uC0AC\uC5C5 \uC740\uD589 \uACC4\uC88C \uD1B5\uD654\uB294 \uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04 \uD1B5\uD654\uC640 \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4.',
        youCanChange: '\uB2F9\uC2E0\uC740 \uC0AC\uC6A9\uC790 \uC124\uC815\uC5D0\uC11C \uC791\uC5C5 \uACF5\uAC04\uC758 \uD654\uD3D0\uB97C \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        findCountry: '\uAD6D\uAC00 \uCC3E\uAE30',
        selectCountry: '\uAD6D\uAC00 \uC120\uD0DD',
    },
    bankInfoStep: {
        whatAreYour: '\uB2F9\uC2E0\uC758 \uC0AC\uC5C5\uC6A9 \uC740\uD589 \uACC4\uC88C \uC815\uBCF4\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
        letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uAD1C\uCC2E\uC544 \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
        thisBankAccount:
            '\uC774 \uC740\uD589 \uACC4\uC88C\uB294 \uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uBE44\uC988\uB2C8\uC2A4 \uACB0\uC81C\uC5D0 \uC0AC\uC6A9\uB429\uB2C8\uB2E4',
        accountNumber: '\uACC4\uC88C \uBC88\uD638',
        bankStatement: '\uC740\uD589 \uBA85\uC138\uC11C',
        chooseFile: '\uD30C\uC77C \uC120\uD0DD',
        uploadYourLatest: '\uCD5C\uC2E0 \uBA85\uC138\uC11C\uB97C \uC5C5\uB85C\uB4DC\uD558\uC138\uC694',
        pleaseUpload: ({lastFourDigits}: LastFourDigitsParams) => `Please upload the most recent monthly statement for your business bank account ending in ${lastFourDigits}.`,
    },
    signerInfoStep: {
        signerInfo: '\uC11C\uBA85\uC790 \uC815\uBCF4',
        areYouDirector: ({companyName}: CompanyNameParams) => `Are you a director or senior officer at ${companyName}?`,
        regulationRequiresUs:
            '\uADDC\uC815\uC5D0 \uB530\uB77C \uC6B0\uB9AC\uB294 \uC11C\uBA85\uC790\uAC00 \uC774 \uD589\uB3D9\uC744 \uC0AC\uC5C5\uCCB4\uB97C \uB300\uC2E0\uD574 \uC218\uD589\uD560 \uAD8C\uD55C\uC774 \uC788\uB294\uC9C0 \uD655\uC778\uD574\uC57C \uD569\uB2C8\uB2E4.',
        whatsYourName: '\uB2F9\uC2E0\uC758 \uBC95\uC801\uC778 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        fullName: '\uBC95\uC801 \uC131\uBA85',
        whatsYourJobTitle: '\uB2F9\uC2E0\uC758 \uC9C1\uC5C5 \uC81C\uBAA9\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        jobTitle: '\uC9C1\uC704',
        whatsYourDOB: '\uB2F9\uC2E0\uC758 \uC0DD\uB144\uC6D4\uC77C\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
        uploadID: 'ID\uC640 \uC8FC\uC18C \uC99D\uBA85\uC11C\uB97C \uC5C5\uB85C\uB4DC\uD558\uC2ED\uC2DC\uC624',
        id: 'ID (\uC6B4\uC804 \uBA74\uD5C8\uC99D \uB610\uB294 \uC5EC\uAD8C)',
        personalAddress: '\uAC1C\uC778 \uC8FC\uC18C \uC99D\uBA85\uC11C (\uC608: \uACF5\uACF5\uC694\uAE08 \uCCAD\uAD6C\uC11C)',
        letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
        legalName: '\uBC95\uC801 \uC774\uB984',
        proofOf: '\uAC1C\uC778 \uC8FC\uC18C \uC99D\uBA85',
        enterOneEmail: '\uB514\uB809\uD130 \uB610\uB294 \uC0C1\uAE09 \uC784\uC6D0\uC758 \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD558\uC138\uC694',
        regulationRequiresOneMoreDirector:
            '\uADDC\uC815\uC5D0 \uB530\uB77C, \uC11C\uBA85\uC790\uB85C\uC11C \uD55C \uBA85 \uC774\uC0C1\uC758 \uC774\uC0AC \uB610\uB294 \uACE0\uC704 \uC784\uC6D0\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
        hangTight: '\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694...',
        enterTwoEmails: '\uB450 \uBA85\uC758 \uC774\uC0AC \uB610\uB294 \uACE0\uC704 \uC784\uC6D0\uC758 \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD558\uC138\uC694.',
        sendReminder: '\uB9AC\uB9C8\uC778\uB354\uB97C \uBCF4\uB0B4\uC138\uC694',
        chooseFile: '\uD30C\uC77C \uC120\uD0DD',
        weAreWaiting:
            '\uC6B0\uB9AC\uB294 \uC0AC\uC5C5\uC758 \uC774\uC0AC \uB610\uB294 \uACE0\uC704 \uC784\uC6D0\uC73C\uB85C\uC11C \uC2E0\uC6D0\uC744 \uD655\uC778\uD558\uB294 \uB2E4\uB978 \uC0AC\uB78C\uB4E4\uC744 \uAE30\uB2E4\uB9AC\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
    },
    agreementsStep: {
        agreements: '\uACC4\uC57D\uC11C',
        pleaseConfirm: '\uC544\uB798\uC758 \uB3D9\uC758 \uC0AC\uD56D\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694',
        regulationRequiresUs:
            '\uADDC\uC815\uC5D0 \uB530\uB77C \uC0AC\uC5C5\uCCB4\uC758 25% \uC774\uC0C1\uC744 \uC18C\uC720\uD55C \uBAA8\uB4E0 \uAC1C\uC778\uC758 \uC2E0\uC6D0\uC744 \uD655\uC778\uD574\uC57C \uD569\uB2C8\uB2E4.',
        iAmAuthorized:
            '\uB098\uB294 \uC0AC\uC5C5 \uBE44\uC6A9\uC744 \uC704\uD574 \uC0AC\uC5C5\uC6A9 \uC740\uD589 \uACC4\uC88C\uB97C \uC0AC\uC6A9\uD560 \uAD8C\uD55C\uC774 \uC788\uC2B5\uB2C8\uB2E4.',
        iCertify: '\uC81C\uACF5\uB41C \uC815\uBCF4\uAC00 \uC0AC\uC2E4\uC774\uBA70 \uC815\uD655\uD568\uC744 \uC99D\uBA85\uD569\uB2C8\uB2E4.',
        termsAndConditions: '\uC774\uC6A9 \uC57D\uAD00.',
        accept: '\uC740\uD589 \uACC4\uC88C\uB97C \uC218\uB77D\uD558\uACE0 \uCD94\uAC00\uD558\uC2ED\uC2DC\uC624',
        error: {
            authorized:
                '\uB2F9\uC2E0\uC740 \uC0AC\uC5C5 \uC740\uD589 \uACC4\uC88C\uB97C \uC6B4\uC601\uD560 \uAD8C\uD55C\uC774 \uC788\uB294 \uAD00\uB9AC \uCC45\uC784\uC790\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4',
            certify: '\uC815\uBCF4\uAC00 \uC9C4\uC2E4\uD558\uACE0 \uC815\uD655\uD55C\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694',
        },
    },
    finishStep: {
        connect: '\uC740\uD589 \uACC4\uC88C \uC5F0\uACB0',
        letsFinish: '\uCC44\uD305\uC5D0\uC11C \uB9C8\uBB34\uB9AC\uD558\uC790!',
        thanksFor:
            '\uC790\uC138\uD55C \uB0B4\uC6A9\uC744 \uC81C\uACF5\uD574 \uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4. \uC804\uB2F4 \uC9C0\uC6D0 \uB2F4\uB2F9\uC790\uAC00 \uC774\uC81C \uADC0\uD558\uC758 \uC815\uBCF4\uB97C \uAC80\uD1A0\uD560 \uAC83\uC785\uB2C8\uB2E4. \uCD94\uAC00\uB85C \uD544\uC694\uD55C \uC0AC\uD56D\uC774 \uC788\uB2E4\uBA74 \uB2E4\uC2DC \uC5F0\uB77D\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4. \uADF8 \uB3D9\uC548\uC5D0\uB294 \uAD81\uAE08\uD55C \uC810\uC774 \uC788\uC73C\uBA74 \uC5B8\uC81C\uB4E0\uC9C0 \uC800\uD76C\uC5D0\uAC8C \uBB38\uC758\uD574 \uC8FC\uC2ED\uC2DC\uC624.',
        iHaveA: '\uC800\uB294 \uC9C8\uBB38\uC774 \uC788\uC2B5\uB2C8\uB2E4',
        enable2FA: '\uC0AC\uAE30\uB97C \uBC29\uC9C0\uD558\uAE30 \uC704\uD574 \uC774\uC911 \uC778\uC99D (2FA)\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694',
        weTake: '\uC6B0\uB9AC\uB294 \uADC0\uD558\uC758 \uBCF4\uC548\uC744 \uB9E4\uC6B0 \uC911\uC694\uD558\uAC8C \uC0DD\uAC01\uD569\uB2C8\uB2E4. \uACC4\uC815\uC5D0 \uCD94\uAC00 \uBCF4\uD638\uCE35\uC744 \uCD94\uAC00\uD558\uAE30 \uC704\uD574 \uC9C0\uAE08 2FA\uB97C \uC124\uC815\uD574 \uC8FC\uC138\uC694.',
        secure: '\uACC4\uC815\uC744 \uBCF4\uD638\uD558\uC138\uC694',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '\uC7A0\uC2DC\uB9CC\uC694',
        explanationLine:
            '\uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uACE7 \uB2E4\uC74C \uB2E8\uACC4\uB97C \uACC4\uC18D \uC9C4\uD589\uD560 \uC218 \uC788\uC744 \uAC83\uC785\uB2C8\uB2E4.',
    },
    session: {
        offlineMessageRetry:
            '\uC778\uD130\uB137\uC774 \uC5F0\uACB0\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC740 \uAC83 \uAC19\uC2B5\uB2C8\uB2E4. \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
    },
    travel: {
        header: '\uC5EC\uD589 \uC608\uC57D',
        title: '\uC2A4\uB9C8\uD2B8\uD558\uAC8C \uC5EC\uD589\uD558\uC138\uC694',
        subtitle:
            'Expensify Travel\uC744 \uC0AC\uC6A9\uD558\uC5EC \uCD5C\uACE0\uC758 \uC5EC\uD589 \uC81C\uC548\uC744 \uBC1B\uACE0 \uBAA8\uB4E0 \uBE44\uC988\uB2C8\uC2A4 \uBE44\uC6A9\uC744 \uD55C \uACF3\uC5D0\uC11C \uAD00\uB9AC\uD558\uC138\uC694.',
        features: {
            saveMoney: '\uB2F9\uC2E0\uC758 \uC608\uC57D\uC5D0\uC11C \uB3C8\uC744 \uC808\uC57D\uD558\uC138\uC694',
            alerts: '\uC2E4\uC2DC\uAC04 \uC5C5\uB370\uC774\uD2B8\uC640 \uC54C\uB9BC\uC744 \uBC1B\uC73C\uC138\uC694',
        },
        bookTravel: '\uC5EC\uD589 \uC608\uC57D',
        bookDemo: '\uB370\uBAA8 \uC608\uC57D',
        bookADemo: '\uB370\uBAA8 \uC608\uC57D\uD558\uAE30',
        toLearnMore: '\uB354 \uC54C\uC544\uBCF4\uB824\uBA74.',
        termsAndConditions: {
            header: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0...',
            title: '\uC5EC\uD589\uC5D0 \uB300\uD55C \uC774\uC6A9 \uC57D\uAD00\uC744 \uC77D\uC5B4\uC8FC\uC138\uC694',
            subtitle:
                '\uADC0\uD558\uC758 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0\uC11C \uC5EC\uD589\uC744 \uD65C\uC131\uD654\uD558\uB824\uBA74 \uC6B0\uB9AC\uC758 \uB3D9\uC758\uD574\uC57C \uD569\uB2C8\uB2E4.',
            termsconditions: '\uC774\uC6A9 \uC57D\uAD00',
            travelTermsAndConditions: '\uC774\uC6A9 \uC57D\uAD00',
            helpDocIntro: '\uC774\uAC83\uC744 \uD655\uC778\uD574\uBCF4\uC138\uC694',
            helpDocOutro:
                '\uC790\uC138\uD55C \uC815\uBCF4\uB97C \uC6D0\uD558\uC2DC\uAC70\uB098 \uCEE8\uC2DC\uC5B4\uC9C0 \uB610\uB294 \uB2F4\uB2F9 \uACC4\uC815 \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.',
            helpDoc: '\uB3C4\uC6C0\uB9D0 \uBB38\uC11C',
            agree: '\uB098\uB294 \uC5EC\uD589\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4',
            error: '\uACC4\uC18D \uC9C4\uD589\uD558\uB824\uBA74 \uC5EC\uD589\uC5D0 \uB300\uD55C \uC774\uC6A9 \uC57D\uAD00\uC744 \uC218\uB77D\uD574\uC57C \uD569\uB2C8\uB2E4',
        },
        flight: '\uBE44\uD589',
        flightDetails: {
            passenger: '\uC2B9\uAC1D',
            layover: ({layover}: FlightLayoverParams) =>
                `<muted-text-label>\uC774 \uBE44\uD589 \uC804\uC5D0 <strong>${layover} \uACBD\uC720</strong>\uAC00 \uC788\uC2B5\uB2C8\uB2E4</muted-text-label>`,
            takeOff: '\uC774\uB959',
            landing: '\uCC29\uB959',
            seat: '\uC88C\uC11D',
            class: '\uCE90\uBE48 \uD074\uB798\uC2A4',
            recordLocator: '\uB808\uCF54\uB4DC \uB85C\uCF00\uC774\uD130',
        },
        hotel: '\uD638\uD154',
        hotelDetails: {
            guest: '\uAC8C\uC2A4\uD2B8',
            checkIn: '\uCCB4\uD06C\uC778',
            checkOut: '\uCCB4\uD06C\uC544\uC6C3',
            roomType: '\uBC29 \uC720\uD615',
            cancellation: '\uCDE8\uC18C \uC815\uCC45',
            cancellationUntil: '\uBB34\uB8CC \uCDE8\uC18C \uAC00\uB2A5 \uAE30\uAC04\uAE4C\uC9C0',
            confirmation: '\uD655\uC778 \uBC88\uD638',
            cancellationPolicies: {
                unknown: '\uBBF8\uC9C0\uC815',
                nonRefundable: '\uD658\uBD88 \uBD88\uAC00\uB2A5',
                freeCancellationUntil: '\uBB34\uB8CC \uCDE8\uC18C \uAC00\uB2A5 \uAE30\uAC04\uAE4C\uC9C0',
                partiallyRefundable: '\uBD80\uBD84 \uD658\uBD88 \uAC00\uB2A5',
            },
        },
        car: '\uC790\uB3D9\uCC28',
        carDetails: {
            rentalCar: '\uC790\uB3D9\uCC28 \uB300\uC5EC',
            pickUp: '\uD53D\uC5C5',
            dropOff: '\uB4DC\uB86D \uC624\uD504',
            driver: '\uB4DC\uB77C\uC774\uBC84',
            carType: '\uC790\uB3D9\uCC28 \uC720\uD615',
            cancellation: '\uCDE8\uC18C \uC815\uCC45',
            cancellationUntil: '\uBB34\uB8CC \uCDE8\uC18C \uAC00\uB2A5 \uAE30\uAC04\uAE4C\uC9C0',
            freeCancellation: '\uBB34\uB8CC \uCDE8\uC18C',
            confirmation: '\uD655\uC778 \uBC88\uD638',
        },
        train: '\uB808\uC77C',
        trainDetails: {
            passenger: '\uC2B9\uAC1D',
            departs: '\uCD9C\uBC1C\uD569\uB2C8\uB2E4',
            arrives: '\uB3C4\uCC29\uD569\uB2C8\uB2E4',
            coachNumber: '\uCF54\uCE58 \uBC88\uD638',
            seat: '\uC88C\uC11D',
            fareDetails: '\uC694\uAE08 \uC138\uBD80 \uC815\uBCF4',
            confirmation: '\uD655\uC778 \uBC88\uD638',
        },
        viewTrip: '\uC5EC\uD589 \uBCF4\uAE30',
        modifyTrip: '\uC5EC\uD589 \uC218\uC815',
        tripSupport: '\uC5EC\uD589 \uC9C0\uC6D0',
        tripDetails: '\uC5EC\uD589 \uC138\uBD80 \uC815\uBCF4',
        viewTripDetails: '\uC5EC\uD589 \uC138\uBD80 \uC815\uBCF4 \uBCF4\uAE30',
        trip: '\uC5EC\uD589',
        trips: '\uC5EC\uD589\uB4E4',
        tripSummary: '\uC5EC\uD589 \uC694\uC57D',
        departs: '\uCD9C\uBC1C\uD569\uB2C8\uB2E4',
        errorMessage: '\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        phoneError:
            '\uC5EC\uD589\uC744 \uC608\uC57D\uD558\uB824\uBA74, \uAE30\uBCF8 \uC5F0\uB77D \uBC29\uBC95\uC740 \uC720\uD6A8\uD55C \uC774\uBA54\uC77C\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.',
        domainSelector: {
            title: '\uB3C4\uBA54\uC778',
            subtitle: 'Expensify Travel \uC124\uC815\uC744 \uC704\uD55C \uB3C4\uBA54\uC778\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            recommended: '\uCD94\uCC9C\uB41C',
        },
        domainPermissionInfo: {
            title: '\uB3C4\uBA54\uC778',
            restrictionPrefix: `You don't have permission to enable Expensify Travel for the domain`,
            restrictionSuffix: `You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitationPrefix: `If you're an accountant, consider joining the`,
            accountantInvitationLink: `ExpensifyApproved! accountants program`,
            accountantInvitationSuffix: `to enable travel for this domain.`,
        },
        publicDomainError: {
            title: 'Expensify Travel \uC2DC\uC791\uD558\uAE30',
            message: `You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
    },
    workspace: {
        common: {
            card: '\uCE74\uB4DC',
            expensifyCard: 'Expensify \uCE74\uB4DC',
            companyCards: '\uD68C\uC0AC \uCE74\uB4DC',
            workflows: '\uC6CC\uD06C\uD50C\uB85C\uC6B0',
            workspace: '\uC791\uC5C5 \uACF5\uAC04',
            edit: '\uC791\uC5C5 \uACF5\uAC04 \uD3B8\uC9D1',
            enabled: '\uD65C\uC131\uD654\uB428',
            disabled: '\uBE44\uD65C\uC131\uD654\uB428',
            everyone: '\uBAA8\uB450',
            delete: '\uC791\uC5C5 \uACF5\uAC04 \uC0AD\uC81C',
            settings: '\uC124\uC815',
            reimburse: '\uD658\uBD88\uAE08',
            categories: '\uCE74\uD14C\uACE0\uB9AC',
            tags: '\uD0DC\uADF8',
            reportFields: '\uBCF4\uACE0\uC11C \uD544\uB4DC',
            reportField: '\uBCF4\uACE0\uC11C \uD544\uB4DC',
            taxes: '\uC138\uAE08',
            bills: '\uCCAD\uAD6C\uC11C',
            invoices: '\uCCAD\uAD6C\uC11C',
            travel: '\uC5EC\uD589',
            members: '\uD68C\uC6D0\uB4E4',
            accounting: '\uD68C\uACC4',
            rules: '\uADDC\uCE59',
            displayedAs: '\uD45C\uC2DC\uB428',
            plan: '\uACC4\uD68D',
            profile: '\uAC1C\uC694',
            bankAccount: '\uC740\uD589 \uACC4\uC88C',
            connectBankAccount: '\uC740\uD589 \uACC4\uC88C \uC5F0\uACB0',
            testTransactions: '\uD14C\uC2A4\uD2B8 \uAC70\uB798',
            issueAndManageCards: '\uCE74\uB4DC \uBC1C\uAE09 \uBC0F \uAD00\uB9AC',
            reconcileCards: '\uCE74\uB4DC\uB97C \uC870\uC815\uD558\uC2ED\uC2DC\uC624',
            selected: () => ({
                one: '1\uAC1C \uC120\uD0DD\uB428',
                other: (count: number) => `${count} selected`,
            }),
            settlementFrequency: '\uACB0\uC81C \uBE48\uB3C4',
            setAsDefault: '\uAE30\uBCF8 \uC791\uC5C5 \uACF5\uAC04\uC73C\uB85C \uC124\uC815',
            defaultNote: `Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            deleteWithCardsConfirmation:
                '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC774\uB807\uAC8C \uD558\uBA74 \uBAA8\uB4E0 \uCE74\uB4DC \uD53C\uB4DC\uC640 \uD560\uB2F9\uB41C \uCE74\uB4DC\uAC00 \uBAA8\uB450 \uC81C\uAC70\uB429\uB2C8\uB2E4.',
            unavailable: '\uC0AC\uC6A9\uD560 \uC218 \uC5C6\uB294 \uC791\uC5C5 \uACF5\uAC04',
            memberNotFound:
                '\uBA64\uBC84\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uC0C8 \uBA64\uBC84\uB97C \uCD08\uB300\uD558\uB824\uBA74 \uC704\uC758 \uCD08\uB300 \uBC84\uD2BC\uC744 \uC0AC\uC6A9\uD574 \uC8FC\uC138\uC694.',
            notAuthorized: `\uC774 \uD398\uC774\uC9C0\uC5D0 \uC811\uADFC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uCC38\uC5EC\uD558\uB824\uACE0 \uD558\uC2E0\uB2E4\uBA74, \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC18C\uC720\uC790\uC5D0\uAC8C \uD68C\uC6D0\uC73C\uB85C \uCD94\uAC00\uD574 \uB2EC\uB77C\uACE0 \uC694\uCCAD\uD558\uC2ED\uC2DC\uC624. \uB2E4\uB978 \uBB38\uC81C\uAC00 \uC788\uC73C\uC2E0\uAC00\uC694? ${CONST.EMAIL.CONCIERGE}\uB85C \uC5F0\uB77D\uD574 \uC8FC\uC2ED\uC2DC\uC624.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Go to ${roomName} room`,
            goToWorkspace: '\uC791\uC5C5 \uACF5\uAC04\uC73C\uB85C \uC774\uB3D9',
            goToWorkspaces: '\uC791\uC5C5 \uACF5\uAC04\uC73C\uB85C \uC774\uB3D9',
            clearFilter: '\uD544\uD130 \uC9C0\uC6B0\uAE30',
            workspaceName: '\uC791\uC5C5 \uACF5\uAC04 \uC774\uB984',
            workspaceOwner: '\uC18C\uC720\uC790',
            workspaceType: '\uC791\uC5C5 \uACF5\uAC04 \uC720\uD615',
            workspaceAvatar: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC544\uBC14\uD0C0',
            mustBeOnlineToViewMembers:
                '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC758 \uBA64\uBC84\uB97C \uBCF4\uB824\uBA74 \uC628\uB77C\uC778 \uC0C1\uD0DC\uC5EC\uC57C \uD569\uB2C8\uB2E4.',
            moreFeatures: '\uB354 \uB9CE\uC740 \uAE30\uB2A5\uB4E4',
            requested: '\uC694\uCCAD\uB41C',
            distanceRates: '\uAC70\uB9AC \uC694\uAE08',
            defaultDescription: '\uB2F9\uC2E0\uC758 \uBAA8\uB4E0 \uC601\uC218\uC99D\uACFC \uC9C0\uCD9C\uC744 \uD55C \uACF3\uC5D0\uC11C \uAD00\uB9AC\uD558\uC138\uC694.',
            welcomeNote:
                '\uD658\uBD88\uC744 \uC704\uD574 \uC601\uC218\uC99D\uC744 \uC81C\uCD9C\uD558\uB824\uBA74 Expensify\uB97C \uC0AC\uC6A9\uD574 \uC8FC\uC138\uC694, \uAC10\uC0AC\uD569\uB2C8\uB2E4!',
            subscription: '\uAD6C\uB3C5',
            markAsExported: '\uC218\uB3D9 \uC785\uB825\uC73C\uB85C \uD45C\uC2DC',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
            lineItemLevel: '\uD56D\uBAA9 \uC218\uC900',
            reportLevel: '\uBCF4\uACE0\uC11C \uB808\uBCA8',
            topLevel: '\uCD5C\uC0C1\uC704 \uB808\uBCA8',
            appliedOnExport: 'Expensify\uC5D0 \uAC00\uC838\uC624\uC9C0 \uC54A\uC74C, \uB0B4\uBCF4\uB0BC \uB54C \uC801\uC6A9\uB428',
            shareNote: {
                header: '\uB2E4\uB978 \uBA64\uBC84\uC640 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uACF5\uC720\uD558\uC138\uC694',
                content: {
                    firstPart:
                        '\uC774 QR \uCF54\uB4DC\uB97C \uACF5\uC720\uD558\uAC70\uB098 \uC544\uB798 \uB9C1\uD06C\uB97C \uBCF5\uC0AC\uD558\uC5EC \uBA64\uBC84\uB4E4\uC774 \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uC811\uADFC \uC694\uCCAD\uC744 \uC27D\uAC8C \uD560 \uC218 \uC788\uAC8C \uB9CC\uB4DC\uC138\uC694. \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uAC00\uC785 \uC694\uCCAD\uD558\uB294 \uBAA8\uB4E0 \uC694\uCCAD\uC740 \uB2E4\uC74C\uC5D0\uC11C \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
                    secondPart: '\uB2F9\uC2E0\uC758 \uAC80\uD1A0\uB97C \uC704\uD55C \uBC29.',
                },
            },
            createNewConnection: '\uC0C8 \uC5F0\uACB0 \uB9CC\uB4E4\uAE30',
            reuseExistingConnection: '\uAE30\uC874 \uC5F0\uACB0 \uC7AC\uC0AC\uC6A9',
            existingConnections: '\uAE30\uC874 \uC5F0\uACB0',
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Last synced ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) =>
                `\uC778\uC99D \uC624\uB958\uB85C \uC778\uD574 ${connectionName}\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.`,
            learnMore: '\uB354 \uC54C\uC544\uBCF4\uAE30.',
            memberAlternateText: '\uD68C\uC6D0\uB4E4\uC740 \uBCF4\uACE0\uC11C\uB97C \uC81C\uCD9C\uD558\uACE0 \uC2B9\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            adminAlternateText:
                '\uAD00\uB9AC\uC790\uB294 \uBAA8\uB4E0 \uBCF4\uACE0\uC11C\uC640 \uC791\uC5C5 \uACF5\uAC04 \uC124\uC815\uC5D0 \uB300\uD55C \uC644\uC804\uD55C \uD3B8\uC9D1 \uAD8C\uD55C\uC744 \uAC00\uC9C0\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
            auditorAlternateText: '\uAC10\uC0AC\uC790\uB4E4\uC740 \uBCF4\uACE0\uC11C\uB97C \uBCF4\uACE0 \uB313\uAE00\uC744 \uB0A8\uAE38 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '\uAD00\uB9AC\uC790';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '\uAC10\uC0AC\uC6D0';
                    case CONST.POLICY.ROLE.USER:
                        return '\uBA64\uBC84';
                    default:
                        return '\uBA64\uBC84';
                }
            },
            planType: '\uD50C\uB79C \uC720\uD615',
            submitExpense: '\uC544\uB798\uC5D0 \uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uC2ED\uC2DC\uC624:',
            defaultCategory: '\uAE30\uBCF8 \uCE74\uD14C\uACE0\uB9AC',
            viewTransactions: '\uAC70\uB798 \uB0B4\uC5ED \uBCF4\uAE30',
        },
        perDiem: {
            subtitle: '\uC9C1\uC6D0\uC758 \uC77C\uC77C \uC9C0\uCD9C\uC744 \uC81C\uC5B4\uD558\uAE30 \uC704\uD574 \uC77C\uC77C\uBE44\uC6A9\uC744 \uC124\uC815\uD558\uC138\uC694.',
            amount: '\uAE08\uC561',
            deleteRates: () => ({
                one: '\uC0AD\uC81C\uC728',
                other: '\uC0AD\uC81C \uBE44\uC728',
            }),
            deletePerDiemRate: '\uC77C\uC77C \uBE44\uC6A9\uB960 \uC0AD\uC81C',
            areYouSureDelete: () => ({
                one: '\uC774 \uC694\uAE08\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
                other: '\uC774 \uC694\uAE08\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            }),
            emptyList: {
                title: '\uC77C\uB2F9',
                subtitle:
                    '\uC9C1\uC6D0\uC758 \uC77C\uC77C \uC9C0\uCD9C\uC744 \uC81C\uC5B4\uD558\uAE30 \uC704\uD574 \uC77C\uC77C\uBE44\uC728\uC744 \uC124\uC815\uD558\uC138\uC694. \uC2DC\uC791\uD558\uB824\uBA74 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8\uC5D0\uC11C \uBE44\uC728\uC744 \uAC00\uC838\uC624\uC138\uC694.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `\uAC12\uC774 ${rate}\uC778 \uBE44\uC728\uC774 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4.`,
            },
            importPerDiemRates: '\uC77C\uC77C \uBE44\uC6A9\uB960 \uAC00\uC838\uC624\uAE30',
            editPerDiemRate: '\uC77C\uB2F9 \uBE44\uC728 \uD3B8\uC9D1',
            editPerDiemRates: '\uC77C\uB2F9 \uBE44\uC728 \uC218\uC815',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `\uC774 \uBAA9\uC801\uC9C0\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uBA74 \uBAA8\uB4E0 ${destination} \uC77C\uC77C \uC218\uB2F9 \uD558\uC704 \uC694\uAE08\uC774 \uBCC0\uACBD\uB429\uB2C8\uB2E4.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `\uC774 \uD1B5\uD654\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uBA74 \uBAA8\uB4E0 ${destination} \uC77C\uC77C \uC218\uB2F9 \uD558\uC704 \uC694\uAE08\uC774 \uBCC0\uACBD\uB429\uB2C8\uB2E4.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'QuickBooks Desktop\uC5D0\uC11C \uBE44\uC6A9\uC744 \uC5B4\uB5BB\uAC8C \uB0B4\uC57C \uD558\uB294\uC9C0 \uC124\uC815\uD558\uC138\uC694.',
            exportOutOfPocketExpensesCheckToogle: '"\uB098\uC911\uC5D0 \uC778\uC1C4"\uB85C \uD45C\uC2DC \uD655\uC778\uD558\uAE30',
            exportDescription: 'Expensify \uB370\uC774\uD130\uAC00 QuickBooks Desktop\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uB294 \uBC29\uC2DD\uC744 \uAD6C\uC131\uD558\uC2ED\uC2DC\uC624.',
            date: '\uC218\uCD9C \uB0A0\uC9DC',
            exportInvoices: '\uC1A1\uC7A5\uC744 \uB0B4\uBCF4\uB0B4\uAE30',
            exportExpensifyCard: 'Expensify Card \uAC70\uB798 \uB0B4\uC5ED\uC744 \uB0B4\uBCF4\uB0B4\uAE30',
            account: '\uACC4\uC815',
            accountDescription: '\uC77C\uAE30 \uD56D\uBAA9\uC744 \uAC8C\uC2DC\uD560 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
            accountsPayable: '\uBBF8\uC9C0\uAE09 \uACC4\uC815',
            accountsPayableDescription: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD560 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
            bankAccount: '\uC740\uD589 \uACC4\uC88C',
            notConfigured: '\uAD6C\uC131\uB418\uC9C0 \uC54A\uC74C',
            bankAccountDescription: '\uC5B4\uB514\uB85C \uC218\uD45C\uB97C \uBCF4\uB0BC\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
            creditCardAccount: '\uC2E0\uC6A9\uCE74\uB4DC \uACC4\uC88C',
            exportDate: {
                label: '\uC218\uCD9C \uB0A0\uC9DC',
                description: '\uC774 \uB0A0\uC9DC\uB97C \uC0AC\uC6A9\uD558\uC5EC QuickBooks Desktop\uC5D0 \uBCF4\uACE0\uC11C\uB97C \uB0B4\uBCF4\uB0C5\uB2C8\uB2E4.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\uB9C8\uC9C0\uB9C9 \uC9C0\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uC5D0\uC11C \uAC00\uC7A5 \uCD5C\uADFC\uC758 \uBE44\uC6A9 \uBC1C\uC0DD \uB0A0\uC9DC.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\uC218\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 QuickBooks Desktop\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uB0A0\uC9DC.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\uC81C\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 \uC2B9\uC778\uC744 \uC704\uD574 \uC81C\uCD9C\uB41C \uB0A0\uC9DC.',
                    },
                },
            },
            exportCheckDescription:
                '\uC6B0\uB9AC\uB294 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uD56D\uBAA9\uBCC4 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD558\uACE0 \uC544\uB798\uC758 \uC740\uD589 \uACC4\uC88C\uC5D0\uC11C \uBCF4\uB0B4\uB4DC\uB9B4 \uAC83\uC785\uB2C8\uB2E4.',
            exportJournalEntryDescription:
                '\uC6B0\uB9AC\uB294 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uD56D\uBAA9\uBCC4 \uC800\uB110 \uD56D\uBAA9\uC744 \uC0DD\uC131\uD558\uACE0 \uC544\uB798\uC758 \uACC4\uC815\uC5D0 \uAC8C\uC2DC\uD560 \uAC83\uC785\uB2C8\uB2E4.',
            exportVendorBillDescription:
                '\uC6B0\uB9AC\uB294 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD55C \uD56D\uBAA9\uBCC4 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC791\uC131\uD558\uACE0 \uC544\uB798\uC758 \uACC4\uC815\uC5D0 \uCD94\uAC00\uD560 \uAC83\uC785\uB2C8\uB2E4. \uB9CC\uC57D \uC774 \uAE30\uAC04\uC774 \uC885\uB8CC\uB418\uC5C8\uB2E4\uBA74, \uB2E4\uC74C \uAC1C\uBC29 \uAE30\uAC04\uC758 1\uC77C\uC5D0 \uAC8C\uC2DC\uD558\uACA0\uC2B5\uB2C8\uB2E4.',
            deepDiveExpensifyCard:
                'Expensify Card \uAC70\uB798\uB294 \uC790\uB3D9\uC73C\uB85C "Expensify Card \uCC44\uBB34 \uACC4\uC815"\uC5D0 \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4. \uC774 \uACC4\uC815\uC740 ${username}\uACFC \uD568\uAED8 \uC0DD\uC131\uB429\uB2C8\uB2E4.',
            deepDiveExpensifyCardIntegration: '\uC6B0\uB9AC\uC758 \uD1B5\uD569.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop\uC740 \uBD84\uAC1C \uC785\uB825 \uB0B4\uBCF4\uB0B4\uAE30\uC5D0 \uB300\uD55C \uC138\uAE08\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uC138\uAE08\uC744 \uD65C\uC131\uD654\uD55C \uC0C1\uD0DC\uC774\uBBC0\uB85C \uC774 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            outOfPocketTaxEnabledError:
                '\uC138\uAE08\uC774 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uC5D0\uB294 \uBD84\uAC1C \uD56D\uBAA9\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '\uC2E0\uC6A9\uCE74\uB4DC',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\uC77C\uAE30 \uC785\uB825',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '\uD655\uC778',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    '\uC6B0\uB9AC\uB294 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uD56D\uBAA9\uBCC4 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD558\uACE0 \uC544\uB798\uC758 \uC740\uD589 \uACC4\uC88C\uC5D0\uC11C \uBCF4\uB0B4\uB4DC\uB9B4 \uAC83\uC785\uB2C8\uB2E4.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "\uC6B0\uB9AC\uB294 \uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798\uC5D0 \uC788\uB294 \uC0C1\uC778 \uC774\uB984\uC744 QuickBooks\uC758 \uD574\uB2F9 \uACF5\uAE09\uC5C5\uCCB4\uC640 \uC790\uB3D9\uC73C\uB85C \uB9E4\uCE6D\uD569\uB2C8\uB2E4. \uACF5\uAE09\uC5C5\uCCB4\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uACBD\uC6B0, '\uC2E0\uC6A9\uCE74\uB4DC \uAE30\uD0C0' \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC0DD\uC131\uD558\uC5EC \uC5F0\uACB0\uD569\uB2C8\uB2E4.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '\uC6B0\uB9AC\uB294 \uB9C8\uC9C0\uB9C9 \uBE44\uC6A9\uC758 \uB0A0\uC9DC\uB97C \uAC00\uC9C4 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uD56D\uBAA9\uBCC4 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD558\uACE0, \uC544\uB798\uC758 \uACC4\uC815\uC5D0 \uCD94\uAC00\uD560 \uAC83\uC785\uB2C8\uB2E4. \uB9CC\uC57D \uC774 \uAE30\uAC04\uC774 \uC885\uB8CC\uB418\uC5C8\uB2E4\uBA74, \uB2E4\uC74C \uC5F4\uB9B0 \uAE30\uAC04\uC758 1\uC77C\uC5D0 \uAC8C\uC2DC\uD560 \uAC83\uC785\uB2C8\uB2E4.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    '\uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798 \uB0B4\uC5ED\uC744 \uB0B4\uBCF4\uB0BC \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    '\uBAA8\uB4E0 \uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798\uC5D0 \uC801\uC6A9\uD560 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '\uC5B4\uB514\uB85C \uC218\uD45C\uB97C \uBCF4\uB0BC\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '\uC704\uCE58\uAC00 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uB294 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    '\uC704\uCE58\uAC00 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uB294 \uCCB4\uD06C\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '\uC138\uAE08\uC774 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uC5D0\uB294 \uBD84\uAC1C \uD56D\uBAA9\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            },
            noAccountsFound: '\uACC4\uC815\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            noAccountsFoundDescription: 'QuickBooks Desktop\uC5D0 \uACC4\uC815\uC744 \uCD94\uAC00\uD558\uACE0 \uC5F0\uACB0\uC744 \uB2E4\uC2DC \uB3D9\uAE30\uD654\uD558\uC138\uC694.',
            qbdSetup: 'QuickBooks \uB370\uC2A4\uD06C\uD1B1 \uC124\uC815',
            requiredSetupDevice: {
                title: '\uC774 \uC7A5\uCE58\uC5D0\uC11C \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
                body1: 'QuickBooks Desktop \uD68C\uC0AC \uD30C\uC77C\uC744 \uD638\uC2A4\uD305\uD558\uB294 \uCEF4\uD4E8\uD130\uC5D0\uC11C \uC774 \uC5F0\uACB0\uC744 \uC124\uC815\uD574\uC57C \uD569\uB2C8\uB2E4.',
                body2: '\uC5F0\uACB0\uB418\uBA74 \uC5B4\uB514\uC11C\uB098 \uB3D9\uAE30\uD654\uD558\uACE0 \uB0B4\uBCF4\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            },
            setupPage: {
                title: '\uC774 \uB9C1\uD06C\uB97C \uC5F4\uC5B4 \uC5F0\uACB0\uD558\uC138\uC694',
                body: '\uC124\uC815\uC744 \uC644\uB8CC\uD558\uB824\uBA74 QuickBooks Desktop\uC774 \uC2E4\uD589 \uC911\uC778 \uCEF4\uD4E8\uD130\uC5D0\uC11C \uB2E4\uC74C \uB9C1\uD06C\uB97C \uC5FD\uB2C8\uB2E4.',
                setupErrorTitle: '\uBB34\uC5B8\uAC00 \uC798\uBABB\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
                setupErrorBody1:
                    '\uD604\uC7AC QuickBooks Desktop \uC5F0\uACB0\uC774 \uC791\uB3D9\uD558\uC9C0 \uC54A\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098',
                setupErrorBody2: '\uBB38\uC81C\uAC00 \uACC4\uC18D\uB418\uBA74.',
                setupErrorBodyContactConcierge: 'Concierge\uC5D0 \uC5F0\uB77D\uD558\uC138\uC694',
            },
            importDescription: 'QuickBooks Desktop\uC5D0\uC11C Expensify\uB85C \uAC00\uC838\uC62C \uCF54\uB529 \uAD6C\uC131\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            classes: '\uD074\uB798\uC2A4',
            items: '\uD56D\uBAA9\uB4E4',
            customers: '\uACE0\uAC1D/\uD504\uB85C\uC81D\uD2B8',
            exportCompanyCardsDescription:
                '\uD68C\uC0AC \uCE74\uB4DC \uAD6C\uB9E4\uB97C QuickBooks Desktop\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uB294 \uBC29\uBC95\uC744 \uC124\uC815\uD558\uC2ED\uC2DC\uC624.',
            defaultVendorDescription:
                '\uB0B4\uBCF4\uB0B4\uAE30 \uC2DC \uBAA8\uB4E0 \uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798\uC5D0 \uC801\uC6A9\uB420 \uAE30\uBCF8 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC124\uC815\uD558\uC138\uC694.',
            accountsDescription:
                '\uB2F9\uC2E0\uC758 QuickBooks \uB370\uC2A4\uD06C\uD1B1 \uACC4\uC815 \uCC28\uD2B8\uB294 Expensify\uB85C \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC62C \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            accountsSwitchTitle:
                '\uC0C8 \uACC4\uC815\uC744 \uD65C\uC131\uD654 \uB610\uB294 \uBE44\uD65C\uC131\uD654 \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC62C\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
            accountsSwitchDescription:
                '\uD65C\uC131\uD654\uB41C \uCE74\uD14C\uACE0\uB9AC\uB294 \uD68C\uC6D0\uC774 \uBE44\uC6A9\uC744 \uC0DD\uC131\uD560 \uB54C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            classesDescription: 'Expensify\uC5D0\uC11C QuickBooks Desktop \uD074\uB798\uC2A4\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            tagsDisplayedAsDescription: '\uB77C\uC778 \uC544\uC774\uD15C \uB808\uBCA8',
            reportFieldsDisplayedAsDescription: '\uBCF4\uACE0\uC11C \uB808\uBCA8',
            customersDescription:
                'Expensify\uC5D0\uC11C QuickBooks Desktop \uACE0\uAC1D/\uD504\uB85C\uC81D\uD2B8\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            advancedConfig: {
                autoSyncDescription: 'Expensify\uB294 \uB9E4\uC77C QuickBooks Desktop\uACFC \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uB429\uB2C8\uB2E4.',
                createEntities: '\uC790\uB3D9\uC73C\uB85C \uC5D4\uD2F0\uD2F0 \uC0DD\uC131',
                createEntitiesDescription:
                    'Expensify\uB294 QuickBooks Desktop\uC5D0 \uBCA4\uB354\uAC00 \uC544\uC9C1 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uACBD\uC6B0 \uC790\uB3D9\uC73C\uB85C \uC0DD\uC131\uD569\uB2C8\uB2E4.',
            },
            itemsDescription: 'Expensify\uC5D0\uC11C QuickBooks Desktop \uD56D\uBAA9\uC744 \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
        },
        qbo: {
            importDescription: 'QuickBooks Online\uC5D0\uC11C Expensify\uB85C \uAC00\uC838\uC62C \uCF54\uB529 \uAD6C\uC131\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            classes: '\uD074\uB798\uC2A4',
            locations: '\uC704\uCE58\uB4E4',
            customers: '\uACE0\uAC1D/\uD504\uB85C\uC81D\uD2B8',
            accountsDescription:
                '\uB2F9\uC2E0\uC758 QuickBooks \uC628\uB77C\uC778 \uACC4\uC815 \uCC28\uD2B8\uB294 Expensify\uB85C \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC62C \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            accountsSwitchTitle:
                '\uC0C8 \uACC4\uC815\uC744 \uD65C\uC131\uD654 \uB610\uB294 \uBE44\uD65C\uC131\uD654 \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC62C\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
            accountsSwitchDescription:
                '\uD65C\uC131\uD654\uB41C \uCE74\uD14C\uACE0\uB9AC\uB294 \uD68C\uC6D0\uC774 \uBE44\uC6A9\uC744 \uC0DD\uC131\uD560 \uB54C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            classesDescription: 'Expensify\uC5D0\uC11C QuickBooks Online \uD074\uB798\uC2A4\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            customersDescription:
                'Expensify\uC5D0\uC11C QuickBooks Online \uACE0\uAC1D/\uD504\uB85C\uC81D\uD2B8\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            locationsDescription: 'Expensify\uC5D0\uC11C QuickBooks Online \uC704\uCE58\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            taxesDescription: 'Expensify\uC5D0\uC11C QuickBooks Online \uC138\uAE08\uC744 \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online\uC740 \uCCB4\uD06C\uB098 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uC758 \uB77C\uC778 \uB808\uBCA8\uC5D0\uC11C \uC704\uCE58\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB77C\uC778 \uB808\uBCA8\uC5D0\uC11C \uC704\uCE58\uB97C \uC0AC\uC6A9\uD558\uACE0 \uC2F6\uB2E4\uBA74, \uBD84\uAC1C \uC785\uB825 \uBC0F \uC2E0\uC6A9/\uC9C1\uBD88 \uCE74\uB4DC \uBE44\uC6A9\uC744 \uC0AC\uC6A9\uD558\uACE0 \uC788\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online\uC740 \uBD84\uAC1C \uD56D\uBAA9\uC5D0 \uB300\uD55C \uC138\uAE08\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C \uB610\uB294 \uC218\uD45C\uB85C \uBCC0\uACBD\uD574 \uC8FC\uC138\uC694.',
            exportDescription: 'Expensify \uB370\uC774\uD130\uAC00 QuickBooks Online\uC73C\uB85C \uC5B4\uB5BB\uAC8C \uB0B4\uBCF4\uB0B4\uC9C0\uB294\uC9C0 \uC124\uC815\uD558\uC138\uC694.',
            date: '\uC218\uCD9C \uB0A0\uC9DC',
            exportInvoices: '\uC1A1\uC7A5\uC744 \uB0B4\uBCF4\uB0B4\uAE30',
            exportExpensifyCard: 'Expensify Card \uAC70\uB798 \uB0B4\uC5ED\uC744 \uB0B4\uBCF4\uB0B4\uAE30',
            deepDiveExpensifyCard:
                'Expensify Card \uAC70\uB798\uB294 \uC790\uB3D9\uC73C\uB85C "Expensify Card \uCC44\uBB34 \uACC4\uC815"\uC5D0 \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4. \uC774 \uACC4\uC815\uC740 ${username}\uACFC \uD568\uAED8 \uC0DD\uC131\uB429\uB2C8\uB2E4.',
            deepDiveExpensifyCardIntegration: '\uC6B0\uB9AC\uC758 \uD1B5\uD569.',
            exportDate: {
                label: '\uC218\uCD9C \uB0A0\uC9DC',
                description: '\uC774 \uB0A0\uC9DC\uB97C \uC0AC\uC6A9\uD558\uC5EC QuickBooks Online\uC5D0 \uBCF4\uACE0\uC11C\uB97C \uB0B4\uBCF4\uB0B4\uC2ED\uC2DC\uC624.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\uB9C8\uC9C0\uB9C9 \uC9C0\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uC5D0\uC11C \uAC00\uC7A5 \uCD5C\uADFC\uC758 \uBE44\uC6A9 \uBC1C\uC0DD \uB0A0\uC9DC.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\uC218\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 QuickBooks Online\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uB0A0\uC9DC.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\uC81C\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 \uC2B9\uC778\uC744 \uC704\uD574 \uC81C\uCD9C\uB41C \uB0A0\uC9DC.',
                    },
                },
            },
            receivable: '\uBBF8\uC218\uAE08', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '\uBBF8\uC218\uAE08 \uC544\uCE74\uC774\uBE0C', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: '\uC774 \uACC4\uC815\uC744 \uC0AC\uC6A9\uD558\uC5EC QuickBooks Online\uC5D0 \uC1A1\uC7A5\uC744 \uB0B4\uBCF4\uB0C5\uB2C8\uB2E4.',
            exportCompanyCardsDescription: '\uD68C\uC0AC \uCE74\uB4DC \uAD6C\uB9E4\uB97C QuickBooks Online\uC5D0 \uC5B4\uB5BB\uAC8C \uB0B4\uBCF4\uB0BC\uC9C0 \uC124\uC815\uD558\uC138\uC694.',
            vendor: '\uACF5\uAE09\uC5C5\uCCB4',
            defaultVendorDescription:
                '\uB0B4\uBCF4\uB0B4\uAE30 \uC2DC \uBAA8\uB4E0 \uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798\uC5D0 \uC801\uC6A9\uB420 \uAE30\uBCF8 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC124\uC815\uD558\uC138\uC694.',
            exportOutOfPocketExpensesDescription: 'QuickBooks Online\uC73C\uB85C \uBE44\uC6A9\uC744 \uC5B4\uB5BB\uAC8C \uB0B4\uC57C \uD558\uB294\uC9C0 \uC124\uC815\uD558\uC138\uC694.',
            exportCheckDescription:
                '\uC6B0\uB9AC\uB294 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uD56D\uBAA9\uBCC4 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD558\uACE0 \uC544\uB798\uC758 \uC740\uD589 \uACC4\uC88C\uC5D0\uC11C \uBCF4\uB0B4\uB4DC\uB9B4 \uAC83\uC785\uB2C8\uB2E4.',
            exportJournalEntryDescription:
                '\uC6B0\uB9AC\uB294 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uD56D\uBAA9\uBCC4 \uC800\uB110 \uD56D\uBAA9\uC744 \uC0DD\uC131\uD558\uACE0 \uC544\uB798\uC758 \uACC4\uC815\uC5D0 \uAC8C\uC2DC\uD560 \uAC83\uC785\uB2C8\uB2E4.',
            exportVendorBillDescription:
                '\uC6B0\uB9AC\uB294 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD55C \uD56D\uBAA9\uBCC4 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC791\uC131\uD558\uACE0 \uC544\uB798\uC758 \uACC4\uC815\uC5D0 \uCD94\uAC00\uD560 \uAC83\uC785\uB2C8\uB2E4. \uB9CC\uC57D \uC774 \uAE30\uAC04\uC774 \uC885\uB8CC\uB418\uC5C8\uB2E4\uBA74, \uB2E4\uC74C \uAC1C\uBC29 \uAE30\uAC04\uC758 1\uC77C\uC5D0 \uAC8C\uC2DC\uD558\uACA0\uC2B5\uB2C8\uB2E4.',
            account: '\uACC4\uC815',
            accountDescription: '\uC77C\uAE30 \uD56D\uBAA9\uC744 \uAC8C\uC2DC\uD560 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
            accountsPayable: '\uBBF8\uC9C0\uAE09 \uACC4\uC815',
            accountsPayableDescription: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD560 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
            bankAccount: '\uC740\uD589 \uACC4\uC88C',
            notConfigured: '\uAD6C\uC131\uB418\uC9C0 \uC54A\uC74C',
            bankAccountDescription: '\uC5B4\uB514\uB85C \uC218\uD45C\uB97C \uBCF4\uB0BC\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
            creditCardAccount: '\uC2E0\uC6A9\uCE74\uB4DC \uACC4\uC88C',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online\uC740 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C \uB0B4\uBCF4\uB0B4\uAE30\uC5D0\uC11C \uC704\uCE58\uB97C \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uC704\uCE58\uB97C \uD65C\uC131\uD654\uD558\uC600\uC73C\uBBC0\uB85C, \uC774 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online\uC740 \uBD84\uAC1C \uC785\uB825 \uB0B4\uBCF4\uB0B4\uAE30\uC5D0 \uB300\uD55C \uC138\uAE08\uC744 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uC138\uAE08\uC774 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC73C\uBBC0\uB85C, \uC774 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            outOfPocketTaxEnabledError:
                '\uC138\uAE08\uC774 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uC5D0\uB294 \uBD84\uAC1C \uD56D\uBAA9\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            advancedConfig: {
                autoSyncDescription: 'Expensify\uB294 \uB9E4\uC77C QuickBooks Online\uACFC \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uB429\uB2C8\uB2E4.',
                inviteEmployees: '\uC9C1\uC6D0\uB4E4\uC744 \uCD08\uB300\uD558\uC138\uC694',
                inviteEmployeesDescription:
                    'QuickBooks Online \uC9C1\uC6D0 \uAE30\uB85D\uC744 \uAC00\uC838\uC640\uC11C \uC774 \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uC9C1\uC6D0\uC744 \uCD08\uB300\uD558\uC138\uC694.',
                createEntities: '\uC790\uB3D9\uC73C\uB85C \uC5D4\uD2F0\uD2F0 \uC0DD\uC131',
                createEntitiesDescription:
                    'Expensify\uB294 QuickBooks Online\uC5D0 \uC774\uBBF8 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uACBD\uC6B0 \uC790\uB3D9\uC73C\uB85C \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC0DD\uC131\uD558\uACE0, \uC778\uBCF4\uC774\uC2A4\uB97C \uB0B4\uBCF4\uB0BC \uB54C \uACE0\uAC1D\uC744 \uC790\uB3D9 \uC0DD\uC131\uD569\uB2C8\uB2E4.',
                reimbursedReportsDescription:
                    'Expensify ACH\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBCF4\uACE0\uC11C\uAC00 \uC9C0\uBD88\uB420 \uB54C\uB9C8\uB2E4, \uD574\uB2F9 \uCCAD\uAD6C\uC11C \uACB0\uC81C\uB294 \uC544\uB798\uC758 QuickBooks Online \uACC4\uC815\uC5D0 \uC0DD\uC131\uB429\uB2C8\uB2E4.',
                qboBillPaymentAccount: 'QuickBooks \uCCAD\uAD6C \uACB0\uC81C \uACC4\uC815',
                qboInvoiceCollectionAccount: 'QuickBooks \uC1A1\uC7A5 \uC218\uC9D1 \uACC4\uC815',
                accountSelectDescription:
                    '\uC5B4\uB514\uC5D0\uC11C \uCCAD\uAD6C\uC11C\uB97C \uC9C0\uBD88\uD560\uC9C0 \uC120\uD0DD\uD558\uC2DC\uBA74, \uC800\uD76C\uAC00 QuickBooks Online\uC5D0\uC11C \uACB0\uC81C\uB97C \uC0DD\uC131\uD574\uB4DC\uB9B4 \uAC83\uC785\uB2C8\uB2E4.',
                invoiceAccountSelectorDescription:
                    '\uC1A1\uC7A5 \uACB0\uC81C\uB97C \uBC1B\uC744 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC2DC\uBA74, \uC800\uD76C\uAC00 QuickBooks Online\uC5D0\uC11C \uACB0\uC81C\uB97C \uC0DD\uC131\uD574 \uB4DC\uB9BD\uB2C8\uB2E4.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: '\uC9C1\uBD88 \uCE74\uB4DC',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: '\uC2E0\uC6A9\uCE74\uB4DC',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '\uC77C\uAE30 \uC785\uB825',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '\uD655\uC778',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "\uC6B0\uB9AC\uB294 \uC790\uB3D9\uC73C\uB85C \uC9C1\uBD88 \uCE74\uB4DC \uAC70\uB798\uC758 \uC0C1\uC778 \uC774\uB984\uC744 QuickBooks\uC758 \uD574\uB2F9 \uACF5\uAE09\uC5C5\uCCB4\uC640 \uC77C\uCE58\uC2DC\uD0AC \uAC83\uC785\uB2C8\uB2E4. \uACF5\uAE09\uC5C5\uCCB4\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uACBD\uC6B0, \uC5F0\uACB0\uC744 \uC704\uD574 '\uC9C1\uBD88 \uCE74\uB4DC \uAE30\uD0C0' \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC0DD\uC131\uD560 \uAC83\uC785\uB2C8\uB2E4.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "\uC6B0\uB9AC\uB294 \uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798\uC5D0 \uC788\uB294 \uC0C1\uC778 \uC774\uB984\uC744 QuickBooks\uC758 \uD574\uB2F9 \uACF5\uAE09\uC5C5\uCCB4\uC640 \uC790\uB3D9\uC73C\uB85C \uB9E4\uCE6D\uD569\uB2C8\uB2E4. \uACF5\uAE09\uC5C5\uCCB4\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uACBD\uC6B0, '\uC2E0\uC6A9\uCE74\uB4DC \uAE30\uD0C0' \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC0DD\uC131\uD558\uC5EC \uC5F0\uACB0\uD569\uB2C8\uB2E4.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '\uC6B0\uB9AC\uB294 \uB9C8\uC9C0\uB9C9 \uBE44\uC6A9\uC758 \uB0A0\uC9DC\uB97C \uAC00\uC9C4 \uAC01 Expensify \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uD56D\uBAA9\uBCC4 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD558\uACE0, \uC544\uB798\uC758 \uACC4\uC815\uC5D0 \uCD94\uAC00\uD560 \uAC83\uC785\uB2C8\uB2E4. \uB9CC\uC57D \uC774 \uAE30\uAC04\uC774 \uC885\uB8CC\uB418\uC5C8\uB2E4\uBA74, \uB2E4\uC74C \uC5F4\uB9B0 \uAE30\uAC04\uC758 1\uC77C\uC5D0 \uAC8C\uC2DC\uD560 \uAC83\uC785\uB2C8\uB2E4.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]:
                    '\uC9C1\uBD88 \uCE74\uB4DC \uAC70\uB798 \uB0B4\uC5ED\uC744 \uB0B4\uBCF4\uB0BC \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    '\uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798 \uB0B4\uC5ED\uC744 \uB0B4\uBCF4\uB0BC \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    '\uBAA8\uB4E0 \uC2E0\uC6A9\uCE74\uB4DC \uAC70\uB798\uC5D0 \uC801\uC6A9\uD560 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '\uC704\uCE58\uAC00 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uB294 \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    '\uC704\uCE58\uAC00 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uB294 \uCCB4\uD06C\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '\uC138\uAE08\uC774 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uC744 \uB54C\uC5D0\uB294 \uBD84\uAC1C \uD56D\uBAA9\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uC635\uC158\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            },
            noAccountsFound: '\uACC4\uC815\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            noAccountsFoundDescription: 'QuickBooks Online\uC5D0 \uACC4\uC815\uC744 \uCD94\uAC00\uD558\uACE0 \uC5F0\uACB0\uC744 \uB2E4\uC2DC \uB3D9\uAE30\uD654\uD558\uC138\uC694.',
        },
        workspaceList: {
            joinNow: '\uC9C0\uAE08 \uAC00\uC785\uD558\uC138\uC694',
            askToJoin: '\uCC38\uC5EC \uC694\uCCAD\uD558\uAE30',
        },
        xero: {
            organization: 'Xero \uC870\uC9C1',
            organizationDescription: '\uB370\uC774\uD130\uB97C \uAC00\uC838\uC62C Xero \uC870\uC9C1\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            importDescription: 'Xero\uC5D0\uC11C Expensify\uB85C \uAC00\uC838\uC62C \uCF54\uB529 \uAD6C\uC131\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            accountsDescription: '\uB2F9\uC2E0\uC758 Xero \uACC4\uC815 \uCC28\uD2B8\uB294 Expensify\uB85C \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC62C \uAC83\uC785\uB2C8\uB2E4.',
            accountsSwitchTitle:
                '\uC0C8 \uACC4\uC815\uC744 \uD65C\uC131\uD654 \uB610\uB294 \uBE44\uD65C\uC131\uD654 \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC62C\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
            accountsSwitchDescription:
                '\uD65C\uC131\uD654\uB41C \uCE74\uD14C\uACE0\uB9AC\uB294 \uD68C\uC6D0\uC774 \uBE44\uC6A9\uC744 \uC0DD\uC131\uD560 \uB54C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            trackingCategories: '\uCE74\uD14C\uACE0\uB9AC \uCD94\uC801',
            trackingCategoriesDescription:
                'Expensify\uC5D0\uC11C Xero \uCD94\uC801 \uCE74\uD14C\uACE0\uB9AC\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero ${categoryName}\uC744 \uB9E4\uD551\uD558\uC138\uC694`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) =>
                `Xero\uB85C \uB0B4\uBCF4\uB0BC \uB54C ${categoryName}\uC744 \uB9E4\uD551\uD560 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC138\uC694.`,
            customers: '\uACE0\uAC1D\uC5D0\uAC8C \uB2E4\uC2DC \uCCAD\uAD6C\uD558\uB2E4',
            customersDescription:
                'Expensify\uC5D0\uC11C \uACE0\uAC1D\uC5D0\uAC8C \uB2E4\uC2DC \uCCAD\uAD6C\uD560\uC9C0 \uC120\uD0DD\uD558\uC138\uC694. \uADC0\uD558\uC758 Xero \uACE0\uAC1D \uC5F0\uB77D\uCC98\uB294 \uBE44\uC6A9\uC5D0 \uD0DC\uADF8\uB420 \uC218 \uC788\uC73C\uBA70, Xero\uB85C \uD310\uB9E4 \uC1A1\uC7A5\uC73C\uB85C \uB0B4\uBCF4\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            taxesDescription: 'Expensify\uC5D0\uC11C Xero \uC138\uAE08\uC744 \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            notImported: '\uAC00\uC838\uC624\uC9C0 \uC54A\uC74C',
            notConfigured: '\uAD6C\uC131\uB418\uC9C0 \uC54A\uC74C',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero \uC5F0\uB77D\uCC98 \uAE30\uBCF8\uAC12',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: '\uD0DC\uADF8',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: '\uBCF4\uACE0\uC11C \uD544\uB4DC',
            },
            exportDescription: 'Expensify \uB370\uC774\uD130\uAC00 Xero\uB85C \uB0B4\uBCF4\uB0B4\uC9C0\uB294 \uBC29\uC2DD\uC744 \uAD6C\uC131\uD558\uC2ED\uC2DC\uC624.',
            purchaseBill: '\uAD6C\uB9E4 \uCCAD\uAD6C\uC11C',
            exportDeepDiveCompanyCard:
                '\uB0B4\uBCF4\uB0B8 \uBE44\uC6A9\uC740 \uC544\uB798\uC758 Xero \uC740\uD589 \uACC4\uC88C\uB85C \uC740\uD589 \uAC70\uB798\uB85C \uAC8C\uC2DC\uB418\uBA70, \uAC70\uB798 \uB0A0\uC9DC\uB294 \uC740\uD589 \uBA85\uC138\uC11C\uC758 \uB0A0\uC9DC\uC640 \uC77C\uCE58\uD560 \uAC83\uC785\uB2C8\uB2E4.',
            bankTransactions: '\uC740\uD589 \uAC70\uB798',
            xeroBankAccount: 'Xero \uC740\uD589 \uACC4\uC88C',
            xeroBankAccountDescription: '\uBE44\uC6A9\uC774 \uC740\uD589 \uAC70\uB798\uB85C \uAC8C\uC2DC\uB420 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624.',
            exportExpensesDescription:
                '\uC544\uB798\uC5D0\uC11C \uC120\uD0DD\uD55C \uB0A0\uC9DC\uC640 \uC0C1\uD0DC\uB85C \uAD6C\uB9E4 \uCCAD\uAD6C\uC11C\uB85C \uBCF4\uACE0\uC11C\uAC00 \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4.',
            purchaseBillDate: '\uAD6C\uB9E4 \uCCAD\uAD6C\uC77C',
            exportInvoices: '\uC1A1\uC7A5\uC744 \uB0B4\uBCF4\uB0B4\uAE30\uB85C',
            salesInvoice: '\uD310\uB9E4 \uC1A1\uC7A5',
            exportInvoicesDescription: '\uD310\uB9E4 \uC1A1\uC7A5\uC740 \uD56D\uC0C1 \uC1A1\uC7A5\uC774 \uBC1C\uC1A1\uB41C \uB0A0\uC9DC\uB97C \uD45C\uC2DC\uD569\uB2C8\uB2E4.',
            advancedConfig: {
                autoSyncDescription: 'Expensify\uB294 \uB9E4\uC77C Xero\uC640 \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uB429\uB2C8\uB2E4.',
                purchaseBillStatusTitle: '\uAD6C\uB9E4 \uCCAD\uAD6C\uC11C \uC0C1\uD0DC',
                reimbursedReportsDescription:
                    'Expensify ACH\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBCF4\uACE0\uC11C\uAC00 \uC9C0\uBD88\uB420 \uB54C\uB9C8\uB2E4, \uD574\uB2F9 \uCCAD\uAD6C\uC11C \uACB0\uC81C\uB294 \uC544\uB798\uC758 Xero \uACC4\uC815\uC5D0 \uC0DD\uC131\uB429\uB2C8\uB2E4.',
                xeroBillPaymentAccount: 'Xero \uCCAD\uAD6C \uACB0\uC81C \uACC4\uC815',
                xeroInvoiceCollectionAccount: 'Xero \uC1A1\uC7A5 \uC218\uC9D1 \uACC4\uC815',
                xeroBillPaymentAccountDescription:
                    '\uC5B4\uB514\uC5D0\uC11C \uCCAD\uAD6C\uC11C\uB97C \uC9C0\uBD88\uD560\uC9C0 \uC120\uD0DD\uD558\uC2DC\uBA74, \uC6B0\uB9AC\uB294 Xero\uC5D0\uC11C \uACB0\uC81C\uB97C \uC0DD\uC131\uD574\uB4DC\uB9BD\uB2C8\uB2E4.',
                invoiceAccountSelectorDescription:
                    '\uC1A1\uC7A5 \uACB0\uC81C\uB97C \uBC1B\uC744 \uC704\uCE58\uB97C \uC120\uD0DD\uD558\uBA74 Xero\uC5D0\uC11C \uACB0\uC81C\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4.',
            },
            exportDate: {
                label: '\uAD6C\uB9E4 \uCCAD\uAD6C\uC77C',
                description: '\uC774 \uB0A0\uC9DC\uB97C \uC0AC\uC6A9\uD558\uC5EC Xero\uC5D0 \uBCF4\uACE0\uC11C\uB97C \uB0B4\uBCF4\uB0B4\uC2ED\uC2DC\uC624.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\uB9C8\uC9C0\uB9C9 \uC9C0\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uC5D0\uC11C \uAC00\uC7A5 \uCD5C\uADFC\uC758 \uBE44\uC6A9 \uBC1C\uC0DD \uB0A0\uC9DC.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\uC218\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 Xero\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uB0A0\uC9DC.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '\uC81C\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 \uC2B9\uC778\uC744 \uC704\uD574 \uC81C\uCD9C\uB41C \uB0A0\uC9DC.',
                    },
                },
            },
            invoiceStatus: {
                label: '\uAD6C\uB9E4 \uCCAD\uAD6C\uC11C \uC0C1\uD0DC',
                description: '\uC774 \uC0C1\uD0DC\uB97C \uC0AC\uC6A9\uD558\uC5EC Xero\uC5D0 \uAD6C\uB9E4 \uCCAD\uAD6C\uC11C\uB97C \uB0B4\uBCF4\uB0BC \uB54C \uC0AC\uC6A9\uD558\uC138\uC694.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '\uB4DC\uB798\uD504\uD2B8',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '\uC2B9\uC778 \uB300\uAE30 \uC911',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '\uACB0\uC81C \uB300\uAE30 \uC911',
                },
            },
            noAccountsFound: '\uACC4\uC815\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            noAccountsFoundDescription: 'Xero\uC5D0 \uACC4\uC815\uC744 \uCD94\uAC00\uD558\uACE0 \uC5F0\uACB0\uC744 \uB2E4\uC2DC \uB3D9\uAE30\uD654\uD574\uC8FC\uC138\uC694.',
        },
        sageIntacct: {
            preferredExporter: '\uC120\uD638\uD558\uB294 \uC218\uCD9C\uC5C5\uC790',
            notConfigured: '\uAD6C\uC131\uB418\uC9C0 \uC54A\uC74C',
            exportDate: {
                label: '\uC218\uCD9C \uB0A0\uC9DC',
                description: '\uC774 \uB0A0\uC9DC\uB97C \uC0AC\uC6A9\uD558\uC5EC Sage Intacct\uB85C \uBCF4\uACE0\uC11C\uB97C \uB0B4\uBCF4\uB0C5\uB2C8\uB2E4.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\uB9C8\uC9C0\uB9C9 \uC9C0\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uC5D0\uC11C \uAC00\uC7A5 \uCD5C\uADFC\uC758 \uBE44\uC6A9 \uBC1C\uC0DD \uB0A0\uC9DC.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '\uC218\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 Sage Intacct\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uB0A0\uC9DC.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '\uC81C\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 \uC2B9\uC778\uC744 \uC704\uD574 \uC81C\uCD9C\uB41C \uB0A0\uC9DC.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Sage Intacct\uC5D0 \uC9C0\uCD9C \uB0B4\uC5ED\uC744 \uC5B4\uB5BB\uAC8C \uB0B4\uBCF4\uB0BC\uC9C0 \uC124\uC815\uD558\uC138\uC694.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '\uBE44\uC6A9 \uBCF4\uACE0\uC11C',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C',
                },
            },
            nonReimbursableExpenses: {
                description: '\uD68C\uC0AC \uCE74\uB4DC \uAD6C\uB9E4 \uB0B4\uC5ED\uC774 Sage Intacct\uB85C \uC5B4\uB5BB\uAC8C \uB0B4\uBCF4\uB0B4\uC9C8\uC9C0 \uC124\uC815\uD558\uC138\uC694.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: '\uC2E0\uC6A9\uCE74\uB4DC',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C',
                },
            },
            creditCardAccount: '\uC2E0\uC6A9\uCE74\uB4DC \uACC4\uC88C',
            defaultVendor: '\uAE30\uBCF8 \uACF5\uAE09\uC5C5\uCCB4',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Sage Intacct\uC5D0 \uC77C\uCE58\uD558\uB294 \uACF5\uAE09\uC5C5\uCCB4\uAC00 \uC5C6\uB294 ${
                    isReimbursable ? '' : '비-'
                }\uD658\uBD88 \uAC00\uB2A5\uD55C \uBE44\uC6A9\uC5D0 \uC801\uC6A9\uB420 \uAE30\uBCF8 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC124\uC815\uD558\uC2ED\uC2DC\uC624.`,
            exportDescription: 'Expensify \uB370\uC774\uD130\uAC00 Sage Intacct\uB85C \uB0B4\uBCF4\uB0B4\uC9C0\uB294 \uBC29\uC2DD\uC744 \uAD6C\uC131\uD558\uC2ED\uC2DC\uC624.',
            exportPreferredExporterNote:
                '\uC120\uD638\uD558\uB294 \uB0B4\uBCF4\uB0B4\uAE30 \uC0AC\uC6A9\uC790\uB294 \uC5B4\uB5A4 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uAD00\uB9AC\uC790\uB3C4 \uB420 \uC218 \uC788\uC9C0\uB9CC, \uB3C4\uBA54\uC778 \uC124\uC815\uC5D0\uC11C \uAC1C\uBCC4 \uD68C\uC0AC \uCE74\uB4DC\uC5D0 \uB300\uD574 \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uACC4\uC815\uC744 \uC124\uC815\uD55C \uACBD\uC6B0\uC5D0\uB294 \uB3C4\uBA54\uC778 \uAD00\uB9AC\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.',
            exportPreferredExporterSubNote:
                '\uC124\uC815\uB418\uBA74, \uC120\uD638\uD558\uB294 \uC218\uCD9C\uC790\uB294 \uADF8\uB4E4\uC758 \uACC4\uC815\uC5D0\uC11C \uC218\uCD9C\uC744 \uC704\uD55C \uBCF4\uACE0\uC11C\uB97C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            noAccountsFound: '\uACC4\uC815\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            noAccountsFoundDescription: `Please add the account in Sage Intacct and sync the connection again.`,
            autoSync: '\uC790\uB3D9 \uB3D9\uAE30\uD654',
            autoSyncDescription: 'Expensify\uB294 \uB9E4\uC77C Sage Intacct\uC640 \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uB429\uB2C8\uB2E4.',
            inviteEmployees: '\uC9C1\uC6D0\uB4E4\uC744 \uCD08\uB300\uD558\uC138\uC694',
            inviteEmployeesDescription:
                'Sage Intacct \uC9C1\uC6D0 \uAE30\uB85D\uC744 \uAC00\uC838\uC640\uC11C \uC774 \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uC9C1\uC6D0\uC744 \uCD08\uB300\uD558\uC138\uC694. \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB294 \uAE30\uBCF8\uC801\uC73C\uB85C \uAD00\uB9AC\uC790 \uC2B9\uC778\uC73C\uB85C \uC124\uC815\uB418\uBA70 \uBA64\uBC84 \uD398\uC774\uC9C0\uC5D0\uC11C \uB354\uC6B1 \uAD6C\uC131\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            syncReimbursedReports: 'Sync \uBCF4\uACE0\uC11C \uD658\uBD88',
            syncReimbursedReportsDescription:
                'Expensify ACH\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBCF4\uACE0\uC11C\uAC00 \uC9C0\uBD88\uB420 \uB54C\uB9C8\uB2E4, \uC544\uB798\uC758 Sage Intacct \uACC4\uC815\uC5D0 \uD574\uB2F9\uD558\uB294 \uCCAD\uAD6C \uACB0\uC81C\uAC00 \uC0DD\uC131\uB429\uB2C8\uB2E4.',
            paymentAccount: 'Sage Intacct \uACB0\uC81C \uACC4\uC88C',
        },
        netsuite: {
            subsidiary: '\uC790\uD68C\uC0AC',
            subsidiarySelectDescription: 'NetSuite\uC5D0\uC11C \uB370\uC774\uD130\uB97C \uAC00\uC838\uC62C \uD558\uC704 \uD68C\uC0AC\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
            exportDescription: 'Expensify \uB370\uC774\uD130\uAC00 NetSuite\uB85C \uB0B4\uBCF4\uB0B4\uB294 \uBC29\uC2DD\uC744 \uAD6C\uC131\uD558\uC2ED\uC2DC\uC624.',
            exportInvoices: '\uC1A1\uC7A5\uC744 \uB0B4\uBCF4\uB0B4\uAE30',
            journalEntriesTaxPostingAccount: '\uBD84\uAC1C \uD56D\uBAA9 \uC138\uAE08 \uAC8C\uC2DC \uACC4\uC815',
            journalEntriesProvTaxPostingAccount: '\uC9C0\uBC29\uC138 \uAE30\uB85D \uACC4\uC815\uC5D0 \uB300\uD55C \uBD84\uAC1C \uD56D\uBAA9',
            foreignCurrencyAmount: '\uC678\uD654 \uAE08\uC561 \uB0B4\uBCF4\uB0B4\uAE30',
            exportToNextOpenPeriod: '\uB2E4\uC74C \uC5F4\uB9B0 \uAE30\uAC04\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uAE30',
            nonReimbursableJournalPostingAccount: '\uBE44\uD658\uBD88 \uAC00\uB2A5\uD55C \uC800\uB110 \uD3EC\uC2A4\uD305 \uACC4\uC815',
            reimbursableJournalPostingAccount: '\uD658\uAE09 \uAC00\uB2A5\uD55C \uC800\uB110 \uD3EC\uC2A4\uD305 \uACC4\uC815',
            journalPostingPreference: {
                label: '\uBD84\uAC1C \uAE30\uB85D \uAC8C\uC2DC \uC120\uD638\uB3C4',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]:
                        '\uAC01 \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD55C \uB2E8\uC77C, \uD56D\uBAA9\uBCC4 \uD56D\uBAA9',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '\uAC01 \uBE44\uC6A9\uC5D0 \uB300\uD55C \uB2E8\uC77C \uD56D\uBAA9',
                },
            },
            invoiceItem: {
                label: '\uC1A1\uC7A5 \uD56D\uBAA9',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '\uB098\uB97C \uC704\uD574 \uD558\uB098 \uB9CC\uB4E4\uC5B4\uC8FC\uC138\uC694',
                        description:
                            '\uC6B0\uB9AC\uB294 \uB0B4\uBCF4\uB0B4\uAE30\uB97C \uC9C4\uD589\uD560 \uB54C (\uC544\uC9C1 \uC874\uC7AC\uD558\uC9C0 \uC54A\uB294\uB2E4\uBA74) "Expensify \uCCAD\uAD6C\uC11C \uD56D\uBAA9"\uC744 \uB2F9\uC2E0\uC744 \uC704\uD574 \uC0DD\uC131\uD574 \uC904 \uAC83\uC785\uB2C8\uB2E4.',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '\uAE30\uC874 \uC120\uD0DD',
                        description:
                            '\uC6B0\uB9AC\uB294 \uC544\uB798\uC5D0\uC11C \uC120\uD0DD\uD55C \uD56D\uBAA9\uC5D0 Expensify\uC758 \uCCAD\uAD6C\uC11C\uB97C \uC5F0\uACB0\uD560 \uAC83\uC785\uB2C8\uB2E4.',
                    },
                },
            },
            exportDate: {
                label: '\uC218\uCD9C \uB0A0\uC9DC',
                description: '\uC774 \uB0A0\uC9DC\uB97C \uC0AC\uC6A9\uD558\uC5EC NetSuite\uC5D0 \uBCF4\uACE0\uC11C\uB97C \uB0B4\uBCF4\uB0B4\uC2ED\uC2DC\uC624.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '\uB9C8\uC9C0\uB9C9 \uC9C0\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uC5D0\uC11C \uAC00\uC7A5 \uCD5C\uADFC\uC758 \uBE44\uC6A9 \uBC1C\uC0DD \uB0A0\uC9DC.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '\uC218\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 NetSuite\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uB0A0\uC9DC.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '\uC81C\uCD9C \uB0A0\uC9DC',
                        description: '\uBCF4\uACE0\uC11C\uAC00 \uC2B9\uC778\uC744 \uC704\uD574 \uC81C\uCD9C\uB41C \uB0A0\uC9DC.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '\uBE44\uC6A9 \uBCF4\uACE0\uC11C',
                        reimbursableDescription: '\uC9C0\uBD88 \uBE44\uC6A9\uC740 NetSuite\uB85C \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB85C \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4.',
                        nonReimbursableDescription: '\uD68C\uC0AC \uCE74\uB4DC \uBE44\uC6A9\uC740 NetSuite\uB85C \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB85C \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C',
                        reimbursableDescription:
                            '\uC9C0\uBD88\uD574\uC57C \uD560 \uBE44\uC6A9\uC740 \uC544\uB798\uC5D0 \uC9C0\uC815\uB41C NetSuite \uACF5\uAE09\uC5C5\uCCB4\uC5D0\uAC8C \uCCAD\uAD6C\uC11C\uB85C \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4.' +
                            "You didn't provide any text to translate. Please provide the text that needs to be translated." +
                            '\uB9CC\uC57D \uAC01 \uCE74\uB4DC\uC5D0 \uD2B9\uC815 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC124\uC815\uD558\uACE0 \uC2F6\uB2E4\uBA74, *\uC124\uC815 > \uB3C4\uBA54\uC778 > \uD68C\uC0AC \uCE74\uB4DC*\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
                        nonReimbursableDescription:
                            '\uD68C\uC0AC \uCE74\uB4DC \uBE44\uC6A9\uC740 \uC544\uB798\uC5D0 \uC9C0\uC815\uB41C NetSuite \uACF5\uAE09\uC5C5\uCCB4\uC5D0\uAC8C \uC9C0\uBD88\uD560 \uCCAD\uAD6C\uC11C\uB85C \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4.' +
                            "You didn't provide any text to translate. Please provide the text that needs to be translated." +
                            '\uB9CC\uC57D \uAC01 \uCE74\uB4DC\uC5D0 \uD2B9\uC815 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC124\uC815\uD558\uACE0 \uC2F6\uB2E4\uBA74, *\uC124\uC815 > \uB3C4\uBA54\uC778 > \uD68C\uC0AC \uCE74\uB4DC*\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '\uC77C\uAE30 \uD56D\uBAA9',
                        reimbursableDescription:
                            '\uC9C0\uBD88 \uBE44\uC6A9\uC740 \uC544\uB798\uC5D0 \uC9C0\uC815\uB41C NetSuite \uACC4\uC815\uC73C\uB85C \uBD84\uAC1C \uD56D\uBAA9\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4.' +
                            "You didn't provide any text to translate. Please provide the text that needs to be translated." +
                            '\uB9CC\uC57D \uAC01 \uCE74\uB4DC\uC5D0 \uD2B9\uC815 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC124\uC815\uD558\uACE0 \uC2F6\uB2E4\uBA74, *\uC124\uC815 > \uB3C4\uBA54\uC778 > \uD68C\uC0AC \uCE74\uB4DC*\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
                        nonReimbursableDescription:
                            '\uD68C\uC0AC \uCE74\uB4DC \uC9C0\uCD9C\uC740 \uC544\uB798\uC5D0 \uC9C0\uC815\uB41C NetSuite \uACC4\uC815\uC73C\uB85C \uBD84\uAC1C \uD56D\uBAA9\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4.' +
                            "You didn't provide any text to translate. Please provide the text that needs to be translated." +
                            '\uB9CC\uC57D \uAC01 \uCE74\uB4DC\uC5D0 \uD2B9\uC815 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uC124\uC815\uD558\uACE0 \uC2F6\uB2E4\uBA74, *\uC124\uC815 > \uB3C4\uBA54\uC778 > \uD68C\uC0AC \uCE74\uB4DC*\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
                    },
                },
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify\uB294 \uB9E4\uC77C NetSuite\uC640 \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uB429\uB2C8\uB2E4.',
                reimbursedReportsDescription:
                    'Expensify ACH\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBCF4\uACE0\uC11C\uAC00 \uC9C0\uBD88\uB420 \uB54C\uB9C8\uB2E4, \uD574\uB2F9 \uCCAD\uAD6C\uC11C \uACB0\uC81C\uB294 \uC544\uB798\uC758 NetSuite \uACC4\uC815\uC5D0 \uC0DD\uC131\uB429\uB2C8\uB2E4.',
                reimbursementsAccount: '\uD658\uBD88 \uACC4\uC815',
                reimbursementsAccountDescription:
                    '\uD658\uBD88\uC744 \uC704\uD574 \uC0AC\uC6A9\uD560 \uC740\uD589 \uACC4\uC88C\uB97C \uC120\uD0DD\uD558\uACE0, \uC6B0\uB9AC\uB294 NetSuite\uC5D0 \uC5F0\uACB0\uB41C \uACB0\uC81C\uB97C \uC0DD\uC131\uD560 \uAC83\uC785\uB2C8\uB2E4.',
                collectionsAccount: '\uCF5C\uB809\uC158 \uACC4\uC815',
                collectionsAccountDescription:
                    'Expensify\uC5D0\uC11C \uCCAD\uAD6C\uC11C\uAC00 \uC9C0\uBD88 \uC644\uB8CC\uB85C \uD45C\uC2DC\uB418\uACE0 NetSuite\uB85C \uB0B4\uBCF4\uB0B4\uC9C0\uBA74, \uC544\uB798\uC758 \uACC4\uC815\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
                approvalAccount: 'A/P \uC2B9\uC778 \uACC4\uC815',
                approvalAccountDescription:
                    'NetSuite\uC5D0\uC11C \uAC70\uB798\uAC00 \uC2B9\uC778\uB420 \uACC4\uC815\uC744 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624. \uBCF4\uC0C1 \uBCF4\uACE0\uC11C\uB97C \uB3D9\uAE30\uD654\uD558\uB294 \uACBD\uC6B0, \uC774\uAC83\uC740 \uB610\uD55C \uCCAD\uAD6C \uC9C0\uBD88\uC774 \uC0DD\uC131\uB420 \uACC4\uC815\uC785\uB2C8\uB2E4.',
                defaultApprovalAccount: 'NetSuite \uAE30\uBCF8\uAC12',
                inviteEmployees: '\uC9C1\uC6D0\uB4E4\uC744 \uCD08\uB300\uD558\uACE0 \uC2B9\uC778\uC744 \uC124\uC815\uD558\uC138\uC694',
                inviteEmployeesDescription:
                    'NetSuite \uC9C1\uC6D0 \uAE30\uB85D\uC744 \uAC00\uC838\uC640\uC11C \uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uC9C1\uC6D0\uC744 \uCD08\uB300\uD558\uC138\uC694. \uADC0\uD558\uC758 \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB294 \uAE30\uBCF8\uC801\uC73C\uB85C \uAD00\uB9AC\uC790 \uC2B9\uC778\uC73C\uB85C \uC124\uC815\uB418\uBA70 *\uBA64\uBC84* \uD398\uC774\uC9C0\uC5D0\uC11C \uCD94\uAC00\uB85C \uAD6C\uC131\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
                autoCreateEntities: '\uC790\uB3D9\uC73C\uB85C \uC9C1\uC6D0/\uACF5\uAE09\uC5C5\uCCB4 \uC0DD\uC131',
                enableCategories: '\uC0C8\uB85C \uAC00\uC838\uC628 \uCE74\uD14C\uACE0\uB9AC \uD65C\uC131\uD654',
                customFormID: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC591\uC2DD ID',
                customFormIDDescription:
                    '\uAE30\uBCF8\uC801\uC73C\uB85C, Expensify\uB294 NetSuite\uC5D0 \uC124\uC815\uB41C \uC120\uD638 \uAC70\uB798 \uC591\uC2DD\uC744 \uC0AC\uC6A9\uD558\uC5EC \uD56D\uBAA9\uC744 \uC0DD\uC131\uD569\uB2C8\uB2E4. \uB610\uB294, \uC0AC\uC6A9\uD560 \uD2B9\uC815 \uAC70\uB798 \uC591\uC2DD\uC744 \uC9C0\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
                customFormIDReimbursable: '\uC790\uAE30 \uBD80\uB2F4 \uBE44\uC6A9',
                customFormIDNonReimbursable: '\uD68C\uC0AC \uCE74\uB4DC \uC9C0\uCD9C',
                exportReportsTo: {
                    label: '\uBE44\uC6A9 \uBCF4\uACE0\uC11C \uC2B9\uC778 \uB808\uBCA8',
                    description:
                        'Expensify\uC5D0\uC11C \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uAC00 \uC2B9\uC778\uB418\uACE0 NetSuite\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uD6C4\uC5D0\uB294 NetSuite\uC5D0\uC11C \uAC8C\uC2DC\uD558\uAE30 \uC804\uC5D0 \uCD94\uAC00\uC801\uC778 \uC2B9\uC778 \uB808\uBCA8\uC744 \uC124\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite \uAE30\uBCF8 \uC120\uD638 \uC124\uC815',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '\uC288\uD37C\uBC14\uC774\uC800\uB9CC \uC2B9\uC778\uB428',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '\uD68C\uACC4\uBD80\uC11C\uB9CC \uC2B9\uC778\uB428',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '\uAC10\uB3C5\uC790\uC640 \uD68C\uACC4\uAC00 \uC2B9\uC778\uD558\uC600\uC2B5\uB2C8\uB2E4',
                    },
                },
                accountingMethods: {
                    label: '\uB0B4\uBCF4\uB0BC \uC2DC\uAE30',
                    description: '\uBE44\uC6A9\uC744 \uB0B4\uBCF4\uB0BC \uC2DC\uAE30\uB97C \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\uB204\uC801',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\uD604\uAE08',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '\uC9C0\uBD88 \uBE44\uC6A9\uC740 \uCD5C\uC885 \uC2B9\uC778\uB420 \uB54C \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '\uC9C0\uBD88 \uC2DC \uBE44\uC6A9\uC774 \uB0B4\uBCF4\uB0B4\uC9D1\uB2C8\uB2E4',
                    },
                },
                exportVendorBillsTo: {
                    label: '\uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C \uC2B9\uC778 \uB808\uBCA8',
                    description:
                        'Expensify\uC5D0\uC11C \uACF5\uAE09\uC5C5\uCCB4 \uCCAD\uAD6C\uC11C\uAC00 \uC2B9\uC778\uB418\uACE0 NetSuite\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uD6C4\uC5D0\uB294, \uAC8C\uC2DC\uD558\uAE30 \uC804\uC5D0 NetSuite\uC5D0\uC11C \uCD94\uAC00\uC801\uC778 \uC2B9\uC778 \uB808\uBCA8\uC744 \uC124\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite \uAE30\uBCF8 \uC120\uD638 \uC124\uC815',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '\uC2B9\uC778 \uB300\uAE30 \uC911',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '\uAC8C\uC2DC\uB97C \uC704\uD574 \uC2B9\uC778\uB428',
                    },
                },
                exportJournalsTo: {
                    label: '\uC77C\uC9C0 \uD56D\uBAA9 \uC2B9\uC778 \uB808\uBCA8',
                    description:
                        'Expensify\uC5D0\uC11C \uC77C\uAE30\uC7A5 \uD56D\uBAA9\uC774 \uC2B9\uC778\uB418\uACE0 NetSuite\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uD6C4\uC5D0\uB294 NetSuite\uC5D0\uC11C \uAC8C\uC2DC\uD558\uAE30 \uC804\uC5D0 \uCD94\uAC00\uC801\uC778 \uC2B9\uC778 \uB808\uBCA8\uC744 \uC124\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite \uAE30\uBCF8 \uC120\uD638 \uC124\uC815',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '\uC2B9\uC778 \uB300\uAE30 \uC911',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '\uAC8C\uC2DC\uB97C \uC704\uD574 \uC2B9\uC778\uB428',
                    },
                },
                error: {
                    customFormID: '\uC720\uD6A8\uD55C \uC22B\uC790 \uD615\uC2DD\uC758 \uC0AC\uC6A9\uC790 \uC815\uC758 \uC591\uC2DD ID\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
                },
            },
            noAccountsFound: '\uACC4\uC815\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            noAccountsFoundDescription: 'NetSuite\uC5D0 \uACC4\uC815\uC744 \uCD94\uAC00\uD558\uACE0 \uC5F0\uACB0\uC744 \uB2E4\uC2DC \uB3D9\uAE30\uD654\uD574 \uC8FC\uC138\uC694.',
            noVendorsFound: '\uBC34\uB354\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            noVendorsFoundDescription: 'NetSuite\uC5D0 \uACF5\uAE09\uC5C5\uCCB4\uB97C \uCD94\uAC00\uD558\uACE0 \uC5F0\uACB0\uC744 \uB2E4\uC2DC \uB3D9\uAE30\uD654\uD574 \uC8FC\uC138\uC694.',
            noItemsFound: '\uCCAD\uAD6C \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4',
            noItemsFoundDescription: 'NetSuite\uC5D0 \uCCAD\uAD6C \uD56D\uBAA9\uC744 \uCD94\uAC00\uD558\uACE0 \uC5F0\uACB0\uC744 \uB2E4\uC2DC \uB3D9\uAE30\uD654\uD574 \uC8FC\uC138\uC694.',
            noSubsidiariesFound: '\uD558\uC704 \uD68C\uC0AC\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            noSubsidiariesFoundDescription: 'NetSuite\uC5D0 \uC790\uD68C\uC0AC\uB97C \uCD94\uAC00\uD558\uACE0 \uC5F0\uACB0\uC744 \uB2E4\uC2DC \uB3D9\uAE30\uD654\uD574 \uC8FC\uC138\uC694.',
            tokenInput: {
                title: 'NetSuite \uC124\uC815',
                formSteps: {
                    installBundle: {
                        title: 'Expensify \uBC88\uB4E4\uC744 \uC124\uCE58\uD558\uC138\uC694',
                        description:
                            'NetSuite\uC5D0\uC11C *\uC0AC\uC6A9\uC790 \uC815\uC758 > SuiteBundler > \uBC88\uB4E4 \uAC80\uC0C9 \uBC0F \uC124\uCE58*\uB85C \uC774\uB3D9 > "Expensify" \uAC80\uC0C9 > \uBC88\uB4E4 \uC124\uCE58.',
                    },
                    enableTokenAuthentication: {
                        title: '\uD1A0\uD070 \uAE30\uBC18 \uC778\uC99D \uD65C\uC131\uD654',
                        description:
                            'NetSuite\uC5D0\uC11C *\uC124\uC815 > \uD68C\uC0AC > \uAE30\uB2A5 \uD65C\uC131\uD654 > SuiteCloud*\uB85C \uC774\uB3D9\uD558\uC5EC *\uD1A0\uD070 \uAE30\uBC18 \uC778\uC99D*\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694.',
                    },
                    enableSoapServices: {
                        title: 'SOAP \uC6F9 \uC11C\uBE44\uC2A4 \uD65C\uC131\uD654',
                        description:
                            'NetSuite\uC5D0\uC11C *\uC124\uC815 > \uD68C\uC0AC > \uAE30\uB2A5 \uD65C\uC131\uD654 > SuiteCloud* > *SOAP \uC6F9 \uC11C\uBE44\uC2A4* \uD65C\uC131\uD654\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
                    },
                    createAccessToken: {
                        title: '\uC561\uC138\uC2A4 \uD1A0\uD070 \uC0DD\uC131',
                        description:
                            'NetSuite\uC5D0\uC11C *\uC124\uC815 > \uC0AC\uC6A9\uC790/\uC5ED\uD560 > \uC561\uC138\uC2A4 \uD1A0\uD070* > "Expensify" \uC571 \uBC0F "Expensify \uD1B5\uD569" \uB610\uB294 "\uAD00\uB9AC\uC790" \uC5ED\uD560\uC5D0 \uB300\uD55C \uC561\uC138\uC2A4 \uD1A0\uD070\uC744 \uC0DD\uC131\uD558\uC2ED\uC2DC\uC624.\n\n*\uC911\uC694:* \uC774 \uB2E8\uACC4\uC5D0\uC11C *\uD1A0\uD070 ID*\uC640 *\uD1A0\uD070 \uBE44\uBC00\uBC88\uD638*\uB97C \uBC18\uB4DC\uC2DC \uC800\uC7A5\uD558\uC2ED\uC2DC\uC624. \uB2E4\uC74C \uB2E8\uACC4\uC5D0\uC11C \uD544\uC694\uD569\uB2C8\uB2E4.',
                    },
                    enterCredentials: {
                        title: 'NetSuite \uC790\uACA9\uC99D\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite \uACC4\uC815 ID',
                            netSuiteTokenID: '\uD1A0\uD070 ID',
                            netSuiteTokenSecret: '\uD1A0\uD070 \uBE44\uBC00\uBC88\uD638',
                        },
                        netSuiteAccountIDDescription:
                            'NetSuite\uC5D0\uC11C *\uC124\uC815 > \uD1B5\uD569 > SOAP \uC6F9 \uC11C\uBE44\uC2A4 \uD658\uACBD \uC124\uC815*\uC73C\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
                    },
                },
            },
            import: {
                expenseCategories: '\uBE44\uC6A9 \uCE74\uD14C\uACE0\uB9AC',
                expenseCategoriesDescription:
                    '\uB2F9\uC2E0\uC758 NetSuite \uBE44\uC6A9 \uCE74\uD14C\uACE0\uB9AC\uB294 Expensify\uB85C \uCE74\uD14C\uACE0\uB9AC\uB85C\uC11C \uAC00\uC838\uC62C \uAC83\uC785\uB2C8\uB2E4.',
                crossSubsidiaryCustomers: '\uD06C\uB85C\uC2A4-\uC790\uD68C\uC0AC \uACE0\uAC1D/\uD504\uB85C\uC81D\uD2B8',
                importFields: {
                    departments: {
                        title: '\uBD80\uC11C\uB4E4',
                        subtitle: 'Expensify\uC5D0\uC11C NetSuite *\uBD80\uC11C*\uB97C \uB2E4\uB8E8\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
                    },
                    classes: {
                        title: '\uD074\uB798\uC2A4',
                        subtitle: 'Expensify\uC5D0\uC11C *\uD074\uB798\uC2A4*\uB97C \uB2E4\uB8E8\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
                    },
                    locations: {
                        title: '\uC704\uCE58\uB4E4',
                        subtitle: 'Expensify\uC5D0\uC11C *\uC704\uCE58*\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
                    },
                },
                customersOrJobs: {
                    title: '\uACE0\uAC1D/\uD504\uB85C\uC81D\uD2B8',
                    subtitle:
                        'Expensify\uC5D0\uC11C NetSuite *\uACE0\uAC1D* \uBC0F *\uD504\uB85C\uC81D\uD2B8*\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
                    importCustomers: '\uACE0\uAC1D \uAC00\uC838\uC624\uAE30',
                    importJobs: '\uD504\uB85C\uC81D\uD2B8 \uAC00\uC838\uC624\uAE30',
                    customers: '\uACE0\uAC1D\uB4E4',
                    jobs: '\uD504\uB85C\uC81D\uD2B8',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join(' and ')}, ${importType}`,
                },
                importTaxDescription: 'NetSuite\uC5D0\uC11C \uC138\uAE08 \uADF8\uB8F9\uC744 \uAC00\uC838\uC635\uB2C8\uB2E4.',
                importCustomFields: {
                    chooseOptionBelow: '\uC544\uB798\uC758 \uC635\uC158 \uC911 \uD558\uB098\uB97C \uC120\uD0DD\uD558\uC138\uC694:',
                    label: ({importedTypes}: ImportedTypesParams) => `Imported as ${importedTypes.join(' and ')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Please enter the ${fieldName}`,
                    customSegments: {
                        title: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8/\uB808\uCF54\uB4DC',
                        addText: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8/\uB808\uCF54\uB4DC \uCD94\uAC00',
                        recordTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8/\uB808\uCF54\uB4DC',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '\uC790\uC138\uD55C \uC9C0\uC2DC\uC0AC\uD56D \uBCF4\uAE30',
                        helpText: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8/\uB808\uCF54\uB4DC \uC124\uC815\uC5D0 \uB300\uD574.',
                        emptyTitle:
                            '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8 \uB610\uB294 \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC\uB97C \uCD94\uAC00\uD558\uC2ED\uC2DC\uC624',
                        fields: {
                            segmentName: '\uC774\uB984',
                            internalID: '\uB0B4\uBD80 ID',
                            scriptID: '\uC2A4\uD06C\uB9BD\uD2B8 ID',
                            customRecordScriptID: '\uD2B8\uB79C\uC7AD\uC158 \uC5F4 ID',
                            mapping: '\uD45C\uC2DC\uB428',
                        },
                        removeTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8/\uB808\uCF54\uB4DC \uC81C\uAC70',
                        removePrompt: '\uC774 \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8/\uB808\uCF54\uB4DC\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
                        addForm: {
                            customSegmentName: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8 \uC774\uB984',
                            customRecordName: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC \uC774\uB984',
                            segmentTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8',
                            customSegmentAddTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8 \uCD94\uAC00',
                            customRecordAddTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC \uCD94\uAC00',
                            recordTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC',
                            segmentRecordType:
                                '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8\uB098 \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC\uB97C \uCD94\uAC00\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
                            customSegmentNameTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8 \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
                            customRecordNameTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC \uC774\uB984\uC740 \uBB34\uC5C7\uC778\uAC00\uC694?',
                            customSegmentNameFooter: `NetSuite\uC5D0\uC11C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8 \uC774\uB984\uC744 *\uC0AC\uC6A9\uC790 \uC815\uC758 > \uB9C1\uD06C, \uB808\uCF54\uB4DC & \uD544\uB4DC > \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8* \uD398\uC774\uC9C0\uC5D0\uC11C \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.\n\n_\uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uC6B0\uB9AC\uC758 \uB3C4\uC6C0\uB9D0 \uC0AC\uC774\uD2B8\uB97C \uBC29\uBB38\uD558\uC2ED\uC2DC\uC624](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `NetSuite\uC5D0\uC11C "Transaction Column Field"\uB97C \uAE00\uB85C\uBC8C \uAC80\uC0C9\uC5D0 \uC785\uB825\uD558\uC5EC \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC \uC774\uB984\uC744 \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.\n\n_\uB354 \uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uC6B0\uB9AC\uC758 \uB3C4\uC6C0\uB9D0 \uC0AC\uC774\uD2B8\uB97C \uBC29\uBB38\uD558\uC138\uC694](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: '\uB0B4\uBD80 ID\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
                            customSegmentInternalIDFooter: `\uBA3C\uC800, *\uD648 > \uD658\uACBD \uC124\uC815 > \uB0B4\uBD80 ID \uD45C\uC2DC*\uC5D0\uC11C NetSuite\uC758 \uB0B4\uBD80 ID\uB97C \uD65C\uC131\uD654\uD588\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694.\n\nNetSuite\uC5D0\uC11C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8 \uB0B4\uBD80 ID\uB97C \uCC3E\uB294 \uBC29\uBC95\uC740 \uB2E4\uC74C\uACFC \uAC19\uC2B5\uB2C8\uB2E4:\n\n1. *\uC0AC\uC6A9\uC790 \uC815\uC758 > \uBAA9\uB85D, \uB808\uCF54\uB4DC, & \uD544\uB4DC > \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8*.\n2. \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8\uB97C \uD074\uB9AD\uD569\uB2C8\uB2E4.\n3. *\uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC \uC720\uD615* \uC606\uC758 \uD558\uC774\uD37C\uB9C1\uD06C\uB97C \uD074\uB9AD\uD569\uB2C8\uB2E4.\n4. \uD558\uB2E8 \uD14C\uC774\uBE14\uC5D0\uC11C \uB0B4\uBD80 ID\uB97C \uCC3E\uC2B5\uB2C8\uB2E4.\n\n_\uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uB3C4\uC6C0\uB9D0 \uC0AC\uC774\uD2B8\uB97C \uBC29\uBB38\uD558\uC138\uC694](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `\uB2E4\uC74C \uB2E8\uACC4\uB97C \uB530\uB77C NetSuite\uC5D0\uC11C \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC \uB0B4\uBD80 ID\uB97C \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4:\n\n1. \uC804\uC5ED \uAC80\uC0C9\uC5D0 "Transaction Line Fields"\uB97C \uC785\uB825\uD569\uB2C8\uB2E4.\n2. \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC\uB85C \uB4E4\uC5B4\uAC11\uB2C8\uB2E4.\n3. \uC67C\uCABD \uCABD\uC5D0 \uC788\uB294 \uB0B4\uBD80 ID\uB97C \uCC3E\uC2B5\uB2C8\uB2E4.\n\n_\uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uB3C4\uC6C0\uB9D0 \uC0AC\uC774\uD2B8\uB97C \uBC29\uBB38\uD558\uC138\uC694](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: '\uC2A4\uD06C\uB9BD\uD2B8 ID\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
                            customSegmentScriptIDFooter: `NetSuite\uC5D0\uC11C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8 \uC2A4\uD06C\uB9BD\uD2B8 ID\uB97C \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4:\n\n1. *\uC0AC\uC6A9\uC790 \uC815\uC758 > \uBAA9\uB85D, \uB808\uCF54\uB4DC, & \uD544\uB4DC > \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8*.\n2. \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8\uB97C \uD074\uB9AD\uD569\uB2C8\uB2E4.\n3. \uD558\uB2E8 \uADFC\uCC98\uC5D0 \uC788\uB294 *\uC751\uC6A9 \uD504\uB85C\uADF8\uB7A8 \uBC0F \uC18C\uC2F1* \uD0ED\uC744 \uD074\uB9AD\uD55C \uB2E4\uC74C:\n    a. Expensify\uC5D0\uC11C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8\uB97C *\uD0DC\uADF8*(\uD56D\uBAA9 \uC218\uC900)\uB85C \uD45C\uC2DC\uD558\uB824\uBA74, *\uAC70\uB798 \uC5F4* \uD558\uC704 \uD0ED\uC744 \uD074\uB9AD\uD558\uACE0 *\uD544\uB4DC ID*\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.\n    b. Expensify\uC5D0\uC11C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8\uB97C *\uBCF4\uACE0\uC11C \uD544\uB4DC*(\uBCF4\uACE0\uC11C \uC218\uC900)\uB85C \uD45C\uC2DC\uD558\uB824\uBA74, *\uAC70\uB798* \uD558\uC704 \uD0ED\uC744 \uD074\uB9AD\uD558\uACE0 *\uD544\uB4DC ID*\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.\n\n_\uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uB3C4\uC6C0\uB9D0 \uC0AC\uC774\uD2B8\uB97C \uBC29\uBB38\uD558\uC138\uC694](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: '\uAC70\uB798 \uC5F4 ID\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
                            customRecordScriptIDFooter: `NetSuite\uC5D0\uC11C \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC \uC2A4\uD06C\uB9BD\uD2B8 ID\uB97C \uCC3E\uB294 \uBC29\uBC95\uC740 \uB2E4\uC74C\uACFC \uAC19\uC2B5\uB2C8\uB2E4:\n\n1. \uC804\uC5ED \uAC80\uC0C9\uC5D0 "Transaction Line Fields"\uB97C \uC785\uB825\uD569\uB2C8\uB2E4.\n2. \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC\uB97C \uD074\uB9AD\uD569\uB2C8\uB2E4.\n3. \uC67C\uCABD\uC5D0 \uC788\uB294 \uC2A4\uD06C\uB9BD\uD2B8 ID\uB97C \uCC3E\uC2B5\uB2C8\uB2E4.\n\n_\uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uC6B0\uB9AC\uC758 \uB3C4\uC6C0\uB9D0 \uC0AC\uC774\uD2B8\uB97C \uBC29\uBB38\uD558\uC138\uC694](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle:
                                '\uC774 \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8\uB294 Expensify\uC5D0\uC11C \uC5B4\uB5BB\uAC8C \uD45C\uC2DC\uB418\uC5B4\uC57C \uD569\uB2C8\uAE4C?',
                            customRecordMappingTitle:
                                '\uC774 \uC0AC\uC6A9\uC790 \uC815\uC758 \uB808\uCF54\uB4DC\uB294 Expensify\uC5D0\uC11C \uC5B4\uB5BB\uAC8C \uD45C\uC2DC\uB418\uC5B4\uC57C \uD569\uB2C8\uAE4C?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) =>
                                `\uC774\uBBF8 \uC774 ${fieldName?.toLowerCase()}\uC5D0 \uB300\uD55C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uADF8\uBA3C\uD2B8/\uB808\uCF54\uB4DC\uAC00 \uC874\uC7AC\uD569\uB2C8\uB2E4.`,
                        },
                    },
                    customLists: {
                        title: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D',
                        addText: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D \uCD94\uAC00',
                        recordTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '\uC790\uC138\uD55C \uC9C0\uC2DC\uC0AC\uD56D \uBCF4\uAE30',
                        helpText: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D \uC124\uC815\uC5D0 \uB300\uD574.',
                        emptyTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D \uCD94\uAC00',
                        fields: {
                            listName: '\uC774\uB984',
                            internalID: '\uB0B4\uBD80 ID',
                            transactionFieldID: '\uD2B8\uB79C\uC7AD\uC158 \uD544\uB4DC ID',
                            mapping: '\uD45C\uC2DC\uB428',
                        },
                        removeTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D \uC0AD\uC81C',
                        removePrompt: '\uC774 \uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
                        addForm: {
                            listNameTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D\uC744 \uC120\uD0DD\uD558\uC138\uC694',
                            transactionFieldIDTitle: '\uAC70\uB798 \uD544\uB4DC ID\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
                            transactionFieldIDFooter: `\uB2E4\uC74C \uB2E8\uACC4\uB97C \uB530\uB77C NetSuite\uC5D0\uC11C \uD2B8\uB79C\uC7AD\uC158 \uD544\uB4DC ID\uB97C \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4:\n\n1. \uAE00\uB85C\uBC8C \uAC80\uC0C9\uC5D0 "Transaction Line Fields"\uB97C \uC785\uB825\uD569\uB2C8\uB2E4.\n2. \uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D\uC744 \uD074\uB9AD\uD569\uB2C8\uB2E4.\n3. \uC67C\uCABD \uCABD\uC5D0\uC11C \uD2B8\uB79C\uC7AD\uC158 \uD544\uB4DC ID\uB97C \uCC3E\uC2B5\uB2C8\uB2E4.\n\n_\uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uC6B0\uB9AC\uC758 \uB3C4\uC6C0\uB9D0 \uC0AC\uC774\uD2B8\uB97C \uBC29\uBB38\uD558\uC2ED\uC2DC\uC624](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle:
                                '\uC774 \uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D\uC740 Expensify\uC5D0\uC11C \uC5B4\uB5BB\uAC8C \uD45C\uC2DC\uB418\uC5B4\uC57C \uD569\uB2C8\uAE4C?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `A custom list with this transaction field ID already exists.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite \uAE30\uBCF8 \uC9C1\uC6D0',
                        description: 'Expensify\uC5D0 \uAC00\uC838\uC624\uC9C0 \uC54A\uC74C, \uB0B4\uBCF4\uB0BC \uB54C \uC801\uC6A9\uB428',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `\uB9CC\uC57D NetSuite\uC5D0\uC11C ${importField}\uB97C \uC0AC\uC6A9\uD55C\uB2E4\uBA74, \uC6B0\uB9AC\uB294 \uC9C1\uC6D0 \uAE30\uB85D\uC5D0 \uC124\uC815\uB41C \uAE30\uBCF8\uAC12\uC744 Expense Report \uB610\uB294 Journal Entry\uB85C \uB0B4\uBCF4\uB0BC \uB54C \uC801\uC6A9\uD560 \uAC83\uC785\uB2C8\uB2E4.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '\uD0DC\uADF8',
                        description: '\uD56D\uBAA9 \uC218\uC900',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '\uBCF4\uACE0\uC11C \uD544\uB4DC',
                        description: '\uBCF4\uACE0\uC11C \uB808\uBCA8',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        nsqs: {
            setup: {
                title: 'NSQS \uC124\uC815',
                description: 'NSQS \uACC4\uC815 ID\uB97C \uC785\uB825\uD558\uC138\uC694',
                formInputs: {
                    netSuiteAccountID: 'NSQS \uACC4\uC815 ID',
                },
            },
            import: {
                expenseCategories: '\uBE44\uC6A9 \uCE74\uD14C\uACE0\uB9AC',
                expenseCategoriesDescription: 'NSQS \uBE44\uC6A9 \uCE74\uD14C\uACE0\uB9AC\uB294 Expensify\uB85C \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC635\uB2C8\uB2E4.',
                importTypes: {
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: '\uD0DC\uADF8',
                        description: '\uD56D\uBAA9 \uC218\uC900',
                    },
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: '\uBCF4\uACE0\uC11C \uD544\uB4DC',
                        description: '\uBCF4\uACE0\uC11C \uB808\uBCA8',
                    },
                },
                importFields: {
                    customers: {
                        title: '\uACE0\uAC1D\uB4E4',
                        subtitle: 'Expensify\uC5D0\uC11C NSQS *\uACE0\uAC1D*\uC744 \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
                    },
                    projects: {
                        title: '\uD504\uB85C\uC81D\uD2B8',
                        subtitle: 'Expensify\uC5D0\uC11C NSQS *\uD504\uB85C\uC81D\uD2B8*\uB97C \uCC98\uB9AC\uD558\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
                    },
                },
            },
            export: {
                description: 'Expensify \uB370\uC774\uD130\uAC00 NSQS\uB85C \uB0B4\uBCF4\uB0B4\uB294 \uBC29\uC2DD\uC744 \uAD6C\uC131\uD558\uC2ED\uC2DC\uC624.',
                exportDate: {
                    label: '\uC218\uCD9C \uB0A0\uC9DC',
                    description: '\uC774 \uB0A0\uC9DC\uB97C \uC0AC\uC6A9\uD558\uC5EC NSQS\uC5D0 \uBCF4\uACE0\uC11C\uB97C \uB0B4\uBCF4\uB0B4\uC2ED\uC2DC\uC624.',
                    values: {
                        [CONST.NSQS_EXPORT_DATE.LAST_EXPENSE]: {
                            label: '\uB9C8\uC9C0\uB9C9 \uC9C0\uCD9C \uB0A0\uC9DC',
                            description: '\uBCF4\uACE0\uC11C\uC5D0\uC11C \uAC00\uC7A5 \uCD5C\uADFC\uC758 \uBE44\uC6A9 \uBC1C\uC0DD \uB0A0\uC9DC.',
                        },
                        [CONST.NSQS_EXPORT_DATE.EXPORTED]: {
                            label: '\uC218\uCD9C \uB0A0\uC9DC',
                            description: '\uBCF4\uACE0\uC11C\uAC00 NSQS\uB85C \uB0B4\uBCF4\uB0B4\uC9C4 \uB0A0\uC9DC.',
                        },
                        [CONST.NSQS_EXPORT_DATE.SUBMITTED]: {
                            label: '\uC81C\uCD9C \uB0A0\uC9DC',
                            description: '\uBCF4\uACE0\uC11C\uAC00 \uC2B9\uC778\uC744 \uC704\uD574 \uC81C\uCD9C\uB41C \uB0A0\uC9DC.',
                        },
                    },
                },
                expense: '\uBE44\uC6A9',
                reimbursableExpenses: '\uD658\uAE09 \uAC00\uB2A5\uD55C \uBE44\uC6A9\uC744 \uB0B4\uBCF4\uB0B4\uAE30\uB85C',
                nonReimbursableExpenses: '\uBE44\uD658\uAE09 \uBE44\uC6A9\uC744 \uB0B4\uBCF4\uB0B4\uAE30\uB85C',
            },
            advanced: {
                autoSyncDescription:
                    '\uB9E4\uC77C NSQS\uC640 Expensify\uB97C \uC790\uB3D9\uC73C\uB85C \uB3D9\uAE30\uD654\uD558\uC138\uC694. \uCD5C\uC885 \uBCF4\uACE0\uC11C\uB97C \uC2E4\uC2DC\uAC04\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uC138\uC694.',
                defaultApprovalAccount: 'NSQS \uAE30\uBCF8\uAC12',
                approvalAccount: 'A/P \uC2B9\uC778 \uACC4\uC815',
                approvalAccountDescription:
                    'NSQS\uC5D0\uC11C \uAC70\uB798\uAC00 \uC2B9\uC778\uB420 \uACC4\uC815\uC744 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624. \uD658\uBD88 \uBCF4\uACE0\uC11C\uB97C \uB3D9\uAE30\uD654\uD558\uB294 \uACBD\uC6B0, \uC774\uAC83\uC740 \uB610\uD55C \uCCAD\uAD6C \uC9C0\uBD88\uC774 \uC0DD\uC131\uB420 \uACC4\uC815\uC785\uB2C8\uB2E4.',
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct \uC124\uC815',
            prerequisitesTitle: '\uC5F0\uACB0\uD558\uAE30 \uC804\uC5D0...',
            downloadExpensifyPackage: 'Sage Intacct\uB97C \uC704\uD55C Expensify \uD328\uD0A4\uC9C0\uB97C \uB2E4\uC6B4\uB85C\uB4DC\uD558\uC2ED\uC2DC\uC624',
            followSteps:
                '\uC6B0\uB9AC\uC758 How-to: Sage Intacct\uC5D0 \uC5F0\uACB0\uD558\uB294 \uBC29\uBC95 \uC9C0\uCE68\uC5D0 \uB530\uB77C \uB2E8\uACC4\uB97C \uB530\uB974\uC2ED\uC2DC\uC624',
            enterCredentials: 'Sage Intacct \uC790\uACA9 \uC99D\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694',
            entity: '\uC5D4\uD2F0\uD2F0',
            employeeDefault: 'Sage Intacct \uC9C1\uC6D0 \uAE30\uBCF8\uAC12',
            employeeDefaultDescription:
                '\uC9C1\uC6D0\uC758 \uAE30\uBCF8 \uBD80\uC11C\uB294 Sage Intacct\uC5D0\uC11C \uBE44\uC6A9\uC5D0 \uC801\uC6A9\uB429\uB2C8\uB2E4(\uD558\uB098\uAC00 \uC874\uC7AC\uD558\uB294 \uACBD\uC6B0).',
            displayedAsTagDescription:
                '\uC9C1\uC6D0\uC758 \uBCF4\uACE0\uC11C\uC5D0\uC11C \uAC01 \uAC1C\uBCC4 \uBE44\uC6A9\uC5D0 \uB300\uD574 \uBD80\uC11C\uB97C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            displayedAsReportFieldDescription:
                '\uBD80\uC11C \uC120\uD0DD\uC740 \uC9C1\uC6D0\uC758 \uBCF4\uACE0\uC11C\uC5D0 \uC788\uB294 \uBAA8\uB4E0 \uBE44\uC6A9\uC5D0 \uC801\uC6A9\uB429\uB2C8\uB2E4.',
            toggleImportTitleFirstPart: 'Sage Intacct\uB97C \uB2E4\uB8E8\uB294 \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624',
            toggleImportTitleSecondPart: 'Expensify\uC5D0\uC11C.',
            expenseTypes: '\uBE44\uC6A9 \uC720\uD615',
            expenseTypesDescription:
                '\uB2F9\uC2E0\uC758 Sage Intacct \uBE44\uC6A9 \uC720\uD615\uC740 Expensify\uB85C \uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC62C \uAC83\uC785\uB2C8\uB2E4.',
            importTaxDescription: 'Sage Intacct\uC5D0\uC11C \uAD6C\uB9E4 \uC138\uC728 \uAC00\uC838\uC624\uAE30.',
            userDefinedDimensions: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uCC28\uC6D0',
            addUserDefinedDimension: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uCC28\uC6D0 \uCD94\uAC00',
            integrationName: '\uD1B5\uD569 \uC774\uB984',
            dimensionExists: '\uC774 \uC774\uB984\uC758 \uCC28\uC6D0\uC774 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4.',
            removeDimension: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uCC28\uC6D0 \uC81C\uAC70',
            removeDimensionPrompt: '\uC774 \uC0AC\uC6A9\uC790 \uC815\uC758 \uCC28\uC6D0\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            userDefinedDimension: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uCC28\uC6D0',
            addAUserDefinedDimension: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uCC28\uC6D0 \uCD94\uAC00',
            detailedInstructionsLink: '\uC790\uC138\uD55C \uC9C0\uC2DC\uC0AC\uD56D \uBCF4\uAE30',
            detailedInstructionsRestOfSentence: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uCC28\uC6D0\uC744 \uCD94\uAC00\uD558\uB294 \uC911\uC785\uB2C8\uB2E4.',
            userDimensionsAdded: () => ({
                one: '1 UDD\uAC00 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
                other: (count: number) => `${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '\uBD80\uC11C\uB4E4';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return '\uD074\uB798\uC2A4';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '\uC704\uCE58\uB4E4';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '\uACE0\uAC1D\uB4E4';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return '\uD504\uB85C\uC81D\uD2B8 (\uC9C1\uC5C5)';
                    default:
                        return '\uB9E4\uD551\uB4E4';
                }
            },
        },
        multiConnectionSelector: {
            title: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} setup`,
            description: ({connectionName}: ConnectionNameParams) =>
                `\uACC4\uC18D\uD558\uB824\uBA74 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} \uBC84\uC804\uC744 \uC120\uD0DD\uD558\uC138\uC694.`,
        },
        type: {
            free: '\uBB34\uB8CC',
            control: '\uC81C\uC5B4',
            collect: '\uC218\uC9D1',
        },
        companyCards: {
            addCards: '\uCE74\uB4DC \uCD94\uAC00',
            selectCards: '\uCE74\uB4DC \uC120\uD0DD',
            addNewCard: {
                other: '\uB2E4\uB978',
                cardProviders: {
                    gl1025: 'American Express \uAE30\uC5C5 \uCE74\uB4DC',
                    cdf: 'Mastercard \uC0C1\uC5C5\uC6A9 \uCE74\uB4DC',
                    vcf: 'Visa \uC0C1\uC5C5\uC6A9 \uCE74\uB4DC',
                    stripe: 'Stripe \uCE74\uB4DC',
                },
                yourCardProvider: `Who's your card provider?`,
                whoIsYourBankAccount: '\uB2F9\uC2E0\uC758 \uC740\uD589\uC740 \uB204\uAD6C\uC778\uAC00\uC694?',
                howDoYouWantToConnect: '\uC740\uD589\uC5D0 \uC5B4\uB5BB\uAC8C \uC5F0\uACB0\uD558\uACE0 \uC2F6\uC73C\uC2E0\uAC00\uC694?',
                learnMoreAboutOptions: {
                    text: '\uC774\uB4E4\uC5D0 \uB300\uD574 \uB354 \uC54C\uC544\uBCF4\uAE30',
                    linkText: '\uC635\uC158.',
                },
                commercialFeedDetails:
                    '\uB2F9\uC2E0\uC758 \uC740\uD589\uACFC\uC758 \uC124\uC815\uC774 \uD544\uC694\uD569\uB2C8\uB2E4. \uC774\uAC83\uC740 \uC77C\uBC18\uC801\uC73C\uB85C \uD070 \uD68C\uC0AC\uB4E4\uC774 \uC0AC\uC6A9\uD558\uBA70, \uC790\uACA9\uC774 \uC788\uB2E4\uBA74 \uC885\uC885 \uCD5C\uC120\uC758 \uC120\uD0DD\uC785\uB2C8\uB2E4.',
                directFeedDetails:
                    '\uAC00\uC7A5 \uAC04\uB2E8\uD55C \uC811\uADFC \uBC29\uBC95. \uB9C8\uC2A4\uD130 \uC790\uACA9 \uC99D\uBA85\uC744 \uC0AC\uC6A9\uD558\uC5EC \uBC14\uB85C \uC5F0\uACB0\uD558\uC138\uC694. \uC774 \uBC29\uBC95\uC774 \uAC00\uC7A5 \uC77C\uBC18\uC801\uC785\uB2C8\uB2E4.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Enable your ${provider} feed`,
                    heading:
                        '\uC6B0\uB9AC\uB294 \uC9C1\uC811\uC801\uC73C\uB85C \uCE74\uB4DC \uBC1C\uD589\uC790\uC640 \uC5F0\uB3D9\uB418\uC5B4 \uC788\uC73C\uBA70, Expensify\uC5D0 \uAC70\uB798 \uB370\uC774\uD130\uB97C \uBE60\uB974\uACE0 \uC815\uD655\uD558\uAC8C \uAC00\uC838\uC62C \uC218 \uC788\uC2B5\uB2C8\uB2E4.\n\n\uC2DC\uC791\uD558\uB824\uBA74, \uB2E4\uC74C\uC744 \uB530\uB974\uC138\uC694:',
                    visa: '\uC6B0\uB9AC\uB294 Visa\uC640 \uC804\uC138\uACC4\uC801\uC73C\uB85C \uD1B5\uD569\uB418\uC5B4 \uC788\uC9C0\uB9CC, \uC740\uD589\uACFC \uCE74\uB4DC \uD504\uB85C\uADF8\uB7A8\uC5D0 \uB530\uB77C \uC790\uACA9 \uC694\uAC74\uC774 \uB2E4\uB985\uB2C8\uB2E4.\n\n\uC2DC\uC791\uD558\uB824\uBA74, \uB2E8\uC21C\uD788:',
                    mastercard:
                        '\uC6B0\uB9AC\uB294 Mastercard\uC640\uC758 \uAE00\uB85C\uBC8C \uD1B5\uD569\uC744 \uAC00\uC9C0\uACE0 \uC788\uC9C0\uB9CC, \uC740\uD589\uACFC \uCE74\uB4DC \uD504\uB85C\uADF8\uB7A8\uC5D0 \uB530\uB77C \uC790\uACA9\uC774 \uB2E4\uB985\uB2C8\uB2E4.\n\n\uC2DC\uC791\uD558\uB824\uBA74 \uB2E4\uC74C\uC744 \uAC04\uB2E8\uD788 \uC218\uD589\uD558\uC2ED\uC2DC\uC624:',
                    vcf: `1. Visa Commercial Cards\uB97C \uC124\uC815\uD558\uB294 \uBC29\uBC95\uC5D0 \uB300\uD55C \uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uC774 \uB3C4\uC6C0\uB9D0 \uAE30\uC0AC](${CONST.COMPANY_CARDS_HELP})\uB97C \uCC38\uC870\uD558\uC2ED\uC2DC\uC624.\n\n2. \uD504\uB85C\uADF8\uB7A8\uC5D0 \uB300\uD55C \uC0C1\uC5C5\uC6A9 \uD53C\uB4DC\uB97C \uC9C0\uC6D0\uD558\uB294\uC9C0 \uD655\uC778\uD558\uACE0 \uD65C\uC131\uD654\uD558\uB3C4\uB85D \uC694\uCCAD\uD558\uAE30 \uC704\uD574 [\uC740\uD589\uC5D0 \uBB38\uC758\uD558\uC2ED\uC2DC\uC624](${CONST.COMPANY_CARDS_HELP}).\n\n3. *\uD53C\uB4DC\uAC00 \uD65C\uC131\uD654\uB418\uACE0 \uC138\uBD80 \uC815\uBCF4\uB97C \uAC00\uC9C0\uACE0 \uC788\uB2E4\uBA74 \uB2E4\uC74C \uD654\uBA74\uC73C\uB85C \uACC4\uC18D\uD558\uC2ED\uC2DC\uC624.*`,
                    gl1025: `1. American Express\uAC00 \uADC0\uD558\uC758 \uD504\uB85C\uADF8\uB7A8\uC5D0 \uB300\uD574 \uC0C1\uC5C5\uC6A9 \uD53C\uB4DC\uB97C \uD65C\uC131\uD654\uD560 \uC218 \uC788\uB294\uC9C0 \uC54C\uC544\uBCF4\uB824\uBA74 [\uC774 \uB3C4\uC6C0\uB9D0 \uAE30\uC0AC](${CONST.COMPANY_CARDS_HELP})\uB97C \uBC29\uBB38\uD558\uC138\uC694.\n\n2. \uD53C\uB4DC\uAC00 \uD65C\uC131\uD654\uB418\uBA74 Amex\uB294 \uADC0\uD558\uC5D0\uAC8C \uC0DD\uC0B0 \uD3B8\uC9C0\uB97C \uBCF4\uB0C5\uB2C8\uB2E4.\n\n3. *\uD53C\uB4DC \uC815\uBCF4\uB97C \uC5BB\uC740 \uD6C4\uC5D0\uB294 \uB2E4\uC74C \uD654\uBA74\uC73C\uB85C \uACC4\uC18D \uC9C4\uD589\uD558\uC138\uC694.*`,
                    cdf: `1. Mastercard Commercial Cards\uB97C \uC124\uC815\uD558\uB294 \uBC29\uBC95\uC5D0 \uB300\uD55C \uC790\uC138\uD55C \uC9C0\uCE68\uC740 [\uC774 \uB3C4\uC6C0\uB9D0 \uAE30\uC0AC](${CONST.COMPANY_CARDS_HELP})\uB97C \uCC38\uC870\uD558\uC2ED\uC2DC\uC624.\n\n2. \uD504\uB85C\uADF8\uB7A8\uC5D0 \uB300\uD55C \uC0C1\uC5C5\uC6A9 \uD53C\uB4DC\uB97C \uC9C0\uC6D0\uD558\uB294\uC9C0 \uD655\uC778\uD558\uB824\uBA74 [\uC740\uD589\uC5D0 \uBB38\uC758](${CONST.COMPANY_CARDS_HELP})\uD558\uACE0, \uADF8\uAC83\uC744 \uD65C\uC131\uD654\uD558\uB3C4\uB85D \uC694\uCCAD\uD558\uC2ED\uC2DC\uC624.\n\n3. *\uD53C\uB4DC\uAC00 \uD65C\uC131\uD654\uB418\uACE0 \uADF8 \uC138\uBD80 \uC0AC\uD56D\uC744 \uAC00\uC9C0\uACE0 \uC788\uC73C\uBA74 \uB2E4\uC74C \uD654\uBA74\uC73C\uB85C \uACC4\uC18D\uD558\uC2ED\uC2DC\uC624.*`,
                    stripe: `1. Stripe\uC758 \uB300\uC2DC\uBCF4\uB4DC\uB97C \uBC29\uBB38\uD558\uACE0, [\uC124\uC815](${CONST.COMPANY_CARDS_STRIPE_HELP})\uC73C\uB85C \uC774\uB3D9\uD558\uC138\uC694.\n\n2. \uC81C\uD488 \uD1B5\uD569 \uC544\uB798\uC5D0\uC11C Expensify \uC606\uC758 \uD65C\uC131\uD654\uB97C \uD074\uB9AD\uD558\uC138\uC694.\n\n3. \uD53C\uB4DC\uAC00 \uD65C\uC131\uD654\uB418\uBA74 \uC544\uB798\uC758 \uC81C\uCD9C\uC744 \uD074\uB9AD\uD558\uACE0 \uC6B0\uB9AC\uB294 \uADF8\uAC83\uC744 \uCD94\uAC00\uD558\uB294 \uB370 \uC791\uC5C5\uD558\uACA0\uC2B5\uB2C8\uB2E4.`,
                },
                whatBankIssuesCard: '\uC774 \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD558\uB294 \uC740\uD589\uC740 \uC5B4\uB514\uC778\uAC00\uC694?',
                enterNameOfBank: '\uC740\uD589 \uC774\uB984\uC744 \uC785\uB825\uD558\uC138\uC694',
                feedDetails: {
                    vcf: {
                        title: '\uBE44\uC790 \uD53C\uB4DC \uC138\uBD80 \uC815\uBCF4\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
                        processorLabel: '\uD504\uB85C\uC138\uC11C ID',
                        bankLabel: '\uAE08\uC735 \uAE30\uAD00 (\uC740\uD589) ID',
                        companyLabel: '\uD68C\uC0AC ID',
                        helpLabel: '\uC774 ID\uB4E4\uC740 \uC5B4\uB514\uC5D0\uC11C \uCC3E\uC744 \uC218 \uC788\uB098\uC694?',
                    },
                    gl1025: {
                        title: `What's the Amex delivery file name?`,
                        fileNameLabel: '\uBC30\uC1A1 \uD30C\uC77C \uC774\uB984',
                        helpLabel: '\uBC30\uC1A1 \uD30C\uC77C \uC774\uB984\uC740 \uC5B4\uB514\uC5D0\uC11C \uCC3E\uC744 \uC218 \uC788\uB098\uC694?',
                    },
                    cdf: {
                        title: `What's the Mastercard distribution ID?`,
                        distributionLabel: '\uBC30\uD3EC ID',
                        helpLabel: '\uB098\uB294 \uC5B4\uB514\uC5D0\uC11C \uBC30\uD3EC ID\uB97C \uCC3E\uC744 \uC218 \uC788\uB098\uC694?',
                    },
                },
                amexCorporate: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC \uC55E\uBA74\uC5D0 "Corporate"\uB77C\uACE0 \uC801\uD600\uC788\uB2E4\uBA74 \uC774\uAC83\uC744 \uC120\uD0DD\uD558\uC138\uC694',
                amexBusiness: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC \uC55E\uBA74\uC5D0 "Business"\uB77C\uACE0 \uC801\uD600\uC788\uB2E4\uBA74 \uC774\uAC83\uC744 \uC120\uD0DD\uD558\uC138\uC694',
                amexPersonal: '\uC774\uAC83\uC744 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624 \uB9CC\uC57D \uB2F9\uC2E0\uC758 \uCE74\uB4DC\uAC00 \uAC1C\uC778\uC801\uC778 \uAC83\uC774\uB77C\uBA74',
                error: {
                    pleaseSelectProvider: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uCE74\uB4DC \uC81C\uACF5\uC790\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                    pleaseSelectBankAccount: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uC740\uD589 \uACC4\uC88C\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                    pleaseSelectBank: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uC740\uD589\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                    pleaseSelectFeedType: '\uACC4\uC18D\uD558\uAE30 \uC804\uC5D0 \uD53C\uB4DC \uC720\uD615\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
                },
            },
            assignCard: '\uCE74\uB4DC \uD560\uB2F9',
            cardNumber: '\uCE74\uB4DC \uBC88\uD638',
            commercialFeed: '\uC0C1\uC5C5\uC6A9 \uC0AC\uB8CC',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} cards`,
            directFeed: '\uC9C1\uC811 \uD53C\uB4DC',
            whoNeedsCardAssigned: '\uB204\uAC00 \uCE74\uB4DC\uB97C \uD560\uB2F9\uBC1B\uC544\uC57C \uD558\uB098\uC694?',
            chooseCard: '\uCE74\uB4DC\uB97C \uC120\uD0DD\uD558\uC138\uC694',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Choose a card for ${assignee} from the ${feed} cards feed.`,
            noActiveCards: '\uC774 \uD53C\uB4DC\uC5D0 \uD65C\uC131 \uCE74\uB4DC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4',
            somethingMightBeBroken:
                '\uB610\uB294 \uBB34\uC5B8\uAC00\uAC00 \uACE0\uC7A5 \uB0AC\uC744 \uC218\uB3C4 \uC788\uC2B5\uB2C8\uB2E4. \uC5B4\uCA0C\uB4E0, \uAD81\uAE08\uD55C \uC810\uC774 \uC788\uC73C\uBA74, \uADF8\uB0E5',
            contactConcierge: '\uCF69\uC2DC\uC5D0\uB974\uC9C0\uC5D0 \uC5F0\uB77D\uD558\uC138\uC694',
            chooseTransactionStartDate: '\uAC70\uB798 \uC2DC\uC791 \uB0A0\uC9DC\uB97C \uC120\uD0DD\uD558\uC138\uC694',
            startDateDescription:
                '\uC6B0\uB9AC\uB294 \uC774 \uB0A0\uC9DC\uBD80\uD130 \uBAA8\uB4E0 \uAC70\uB798\uB97C \uAC00\uC838\uC62C \uAC83\uC785\uB2C8\uB2E4. \uB0A0\uC9DC\uAC00 \uC9C0\uC815\uB418\uC9C0 \uC54A\uC740 \uACBD\uC6B0, \uC740\uD589\uC774 \uD5C8\uC6A9\uD558\uB294 \uD55C \uAC00\uC7A5 \uC624\uB798\uB41C \uB0A0\uC9DC\uAE4C\uC9C0 \uAC70\uC2AC\uB7EC \uC62C\uB77C\uAC08 \uAC83\uC785\uB2C8\uB2E4.',
            fromTheBeginning: '\uCC98\uC74C\uBD80\uD130',
            customStartDate: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC2DC\uC791 \uB0A0\uC9DC',
            letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
            confirmationDescription: '\uC6B0\uB9AC\uB294 \uC989\uC2DC \uAC70\uB798 \uB0B4\uC5ED\uC744 \uAC00\uC838\uC624\uAE30 \uC2DC\uC791\uD560 \uAC83\uC785\uB2C8\uB2E4.',
            cardholder: '\uCE74\uB4DC \uC18C\uC9C0\uC790',
            card: '\uCE74\uB4DC',
            cardName: '\uCE74\uB4DC \uC774\uB984',
            brokenConnectionErrorFirstPart: `Card feed connection is broken. Please `,
            brokenConnectionErrorLink: '\uC740\uD589\uC5D0 \uB85C\uADF8\uC778\uD558\uC2ED\uC2DC\uC624',
            brokenConnectionErrorSecondPart: '\uADF8\uB798\uC11C \uC6B0\uB9AC\uB294 \uB2E4\uC2DC \uC5F0\uACB0\uC744 \uC124\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '\uD68C\uC0AC \uCE74\uB4DC',
            chooseCardFeed: '\uCE74\uB4DC \uD53C\uB4DC \uC120\uD0DD',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD558\uACE0 \uAD00\uB9AC\uD558\uC138\uC694',
            getStartedIssuing: '\uCCAB \uBC88\uC9F8 \uAC00\uC0C1 \uB610\uB294 \uBB3C\uB9AC \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD558\uC5EC \uC2DC\uC791\uD558\uC138\uC694.',
            verificationInProgress: '\uAC80\uC99D \uC9C4\uD589 \uC911...',
            verifyingTheDetails:
                '\uBA87 \uAC00\uC9C0 \uC138\uBD80 \uC0AC\uD56D\uC744 \uD655\uC778 \uC911\uC785\uB2C8\uB2E4. \uCEE8\uC2DC\uC5B4\uC9C0\uAC00 Expensify \uCE74\uB4DC\uAC00 \uBC1C\uAE09 \uC900\uBE44\uAC00 \uB418\uC5C8\uC744 \uB54C \uC54C\uB824\uB4DC\uB9B4 \uAC83\uC785\uB2C8\uB2E4.',
            disclaimer:
                'Expensify Visa\u00AE \uC0C1\uC5C5 \uCE74\uB4DC\uB294 The Bancorp Bank, N.A., FDIC \uD68C\uC6D0, Visa U.S.A. Inc.\uC758 \uB77C\uC774\uC120\uC2A4\uC5D0 \uB530\uB77C \uBC1C\uAE09\uB418\uBA70, \uBAA8\uB4E0 Visa \uCE74\uB4DC\uB97C \uBC1B\uC544\uB4E4\uC774\uB294 \uC0C1\uC778\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. Apple\u00AE \uBC0F Apple \uB85C\uACE0\u00AE\uB294 \uBBF8\uAD6D \uBC0F \uAE30\uD0C0 \uAD6D\uAC00\uC5D0\uC11C \uB4F1\uB85D\uB41C Apple Inc.\uC758 \uC0C1\uD45C\uC785\uB2C8\uB2E4. App Store\uB294 Apple Inc.\uC758 \uC11C\uBE44\uC2A4 \uB9C8\uD06C\uC785\uB2C8\uB2E4. Google Play\uC640 Google Play \uB85C\uACE0\uB294 Google LLC\uC758 \uC0C1\uD45C\uC785\uB2C8\uB2E4.',
            issueCard: '\uCE74\uB4DC \uBC1C\uAE09',
            newCard: '\uC0C8 \uCE74\uB4DC',
            name: '\uC774\uB984',
            lastFour: '\uB9C8\uC9C0\uB9C9 4',
            limit: '\uC81C\uD55C',
            currentBalance: '\uD604\uC7AC \uC794\uC561',
            currentBalanceDescription:
                '\uD604\uC7AC \uC794\uC561\uC740 \uB9C8\uC9C0\uB9C9 \uACB0\uC81C\uC77C \uC774\uD6C4\uC5D0 \uBC1C\uC0DD\uD55C \uBAA8\uB4E0 Expensify Card \uAC70\uB798\uC758 \uD569\uACC4\uC785\uB2C8\uB2E4.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `\uC794\uC561\uC740 ${settlementDate}\uC5D0 \uC815\uC0B0\uB429\uB2C8\uB2E4`,
            settleBalance: '\uC794\uC561 \uC815\uC0B0',
            cardLimit: '\uCE74\uB4DC \uD55C\uB3C4',
            remainingLimit: '\uB0A8\uC740 \uC81C\uD55C',
            requestLimitIncrease: '\uC694\uCCAD \uC81C\uD55C \uC99D\uAC00',
            remainingLimitDescription:
                '\uB2F9\uC2E0\uC758 \uB0A8\uC740 \uD55C\uB3C4\uB97C \uACC4\uC0B0\uD560 \uB54C \uC6B0\uB9AC\uB294 \uC5EC\uB7EC \uC694\uC778\uC744 \uACE0\uB824\uD569\uB2C8\uB2E4: \uACE0\uAC1D\uC73C\uB85C\uC11C\uC758 \uB2F9\uC2E0\uC758 \uACBD\uB825, \uAC00\uC785 \uC2DC \uC81C\uACF5\uD55C \uC0AC\uC5C5 \uAD00\uB828 \uC815\uBCF4, \uADF8\uB9AC\uACE0 \uC0AC\uC5C5 \uC740\uD589 \uACC4\uC88C\uC758 \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uD604\uAE08. \uB2F9\uC2E0\uC758 \uB0A8\uC740 \uD55C\uB3C4\uB294 \uB9E4\uC77C \uBCC0\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            earnedCashback: '\uD604\uAE08 \uBC18\uD658',
            earnedCashbackDescription:
                '\uD604\uAE08 \uBC18\uD658 \uC794\uC561\uC740 \uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uACB0\uC81C\uB41C \uC6D4\uAC04 Expensify Card \uC9C0\uCD9C\uC5D0 \uAE30\uBC18\uD569\uB2C8\uB2E4.',
            issueNewCard: '\uC0C8 \uCE74\uB4DC \uBC1C\uAE09',
            finishSetup: '\uC124\uC815 \uC644\uB8CC',
            chooseBankAccount: '\uC740\uD589 \uACC4\uC88C\uB97C \uC120\uD0DD\uD558\uC138\uC694',
            chooseExistingBank:
                'Expensify \uCE74\uB4DC \uC794\uC561\uC744 \uC9C0\uBD88\uD560 \uAE30\uC874\uC758 \uBE44\uC988\uB2C8\uC2A4 \uC740\uD589 \uACC4\uC88C\uB97C \uC120\uD0DD\uD558\uAC70\uB098, \uC0C8\uB85C\uC6B4 \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uC138\uC694',
            accountEndingIn: '\uACC4\uC88C \uB05D \uBC88\uD638\uB294',
            addNewBankAccount: '\uC0C8\uB85C\uC6B4 \uC740\uD589 \uACC4\uC88C \uCD94\uAC00',
            settlementAccount: '\uACB0\uC81C \uACC4\uC88C',
            settlementAccountDescription: 'Expensify Card \uC794\uC561\uC744 \uC9C0\uBD88\uD560 \uACC4\uC88C\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
            settlementAccountInfoPt1: '\uC774 \uACC4\uC815\uC774 \uB2F9\uC2E0\uC758 \uACC4\uC815\uACFC \uC77C\uCE58\uD558\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694',
            settlementAccountInfoPt2: '\uADF8\uB798\uC11C \uC5F0\uC18D\uC801\uC778 \uB300\uC870\uAC00 \uC81C\uB300\uB85C \uC791\uB3D9\uD569\uB2C8\uB2E4.',
            reconciliationAccount: '\uC870\uC815 \uACC4\uC815',
            settlementFrequency: '\uACB0\uC81C \uBE48\uB3C4',
            settlementFrequencyDescription: 'Expensify \uCE74\uB4DC \uC794\uC561\uC744 \uC5BC\uB9C8\uB098 \uC790\uC8FC \uC9C0\uBD88\uD560\uC9C0 \uC120\uD0DD\uD558\uC138\uC694.',
            settlementFrequencyInfo:
                '\uB9CC\uC57D \uC6D4\uBCC4 \uACB0\uC81C\uB85C \uC804\uD658\uD558\uACE0 \uC2F6\uC73C\uC2DC\uB2E4\uBA74, Plaid\uB97C \uD1B5\uD574 \uC740\uD589 \uACC4\uC88C\uB97C \uC5F0\uACB0\uD558\uACE0 90\uC77C \uB3D9\uC548\uC758 \uAE0D\uC815\uC801\uC778 \uC794\uC561 \uC774\uB825\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
            frequency: {
                daily: '\uB9E4\uC77C',
                monthly: '\uC6D4\uAC04',
            },
            cardDetails: '\uCE74\uB4DC \uC138\uBD80 \uC815\uBCF4',
            virtual: '\uAC00\uC0C1\uC758',
            physical: '\uBB3C\uB9AC\uC801\uC778',
            deactivate: '\uCE74\uB4DC \uBE44\uD65C\uC131\uD654',
            changeCardLimit: '\uCE74\uB4DC \uD55C\uB3C4 \uBCC0\uACBD',
            changeLimit: '\uC81C\uD55C \uBCC0\uACBD',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `\uC774 \uCE74\uB4DC\uC758 \uD55C\uB3C4\uB97C ${limit}\uC73C\uB85C \uBCC0\uACBD\uD558\uBA74, \uCE74\uB4DC\uC5D0 \uB354 \uB9CE\uC740 \uBE44\uC6A9\uC744 \uC2B9\uC778\uD558\uAE30 \uC804\uAE4C\uC9C0 \uC0C8\uB85C\uC6B4 \uAC70\uB798\uAC00 \uAC70\uBD80\uB429\uB2C8\uB2E4.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `\uC774 \uCE74\uB4DC\uC758 \uD55C\uB3C4\uB97C ${limit}\uC73C\uB85C \uBCC0\uACBD\uD558\uBA74 \uB2E4\uC74C \uB2EC\uAE4C\uC9C0 \uC0C8\uB85C\uC6B4 \uAC70\uB798\uAC00 \uAC70\uBD80\uB429\uB2C8\uB2E4.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) =>
                `\uC774 \uCE74\uB4DC\uC758 \uD55C\uB3C4\uB97C ${limit}\uC73C\uB85C \uBCC0\uACBD\uD558\uBA74 \uC0C8\uB85C\uC6B4 \uAC70\uB798\uAC00 \uAC70\uBD80\uB429\uB2C8\uB2E4.`,
            changeCardLimitType: '\uCE74\uB4DC \uD55C\uB3C4 \uC720\uD615 \uBCC0\uACBD',
            changeLimitType: '\uC81C\uD55C \uC720\uD615 \uBCC0\uACBD',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `\uC774 \uCE74\uB4DC\uC758 \uD55C\uB3C4 \uC720\uD615\uC744 \uC2A4\uB9C8\uD2B8 \uD55C\uB3C4\uB85C \uBCC0\uACBD\uD558\uBA74 ${limit} \uBBF8\uC2B9\uC778 \uD55C\uB3C4\uAC00 \uC774\uBBF8 \uB3C4\uB2EC\uD588\uAE30 \uB54C\uBB38\uC5D0 \uC0C8\uB85C\uC6B4 \uAC70\uB798\uAC00 \uAC70\uBD80\uB429\uB2C8\uB2E4.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `\uC774 \uCE74\uB4DC\uC758 \uD55C\uB3C4 \uC720\uD615\uC744 \uC6D4\uBCC4\uB85C \uBCC0\uACBD\uD558\uBA74, ${limit} \uC6D4\uBCC4 \uD55C\uB3C4\uAC00 \uC774\uBBF8 \uB3C4\uB2EC\uD588\uAE30 \uB54C\uBB38\uC5D0 \uC0C8\uB85C\uC6B4 \uAC70\uB798\uAC00 \uAC70\uBD80\uB429\uB2C8\uB2E4.`,
            addShippingDetails: '\uBC30\uC1A1 \uC815\uBCF4 \uCD94\uAC00',
            issuedCard: ({assignee}: AssigneeParams) => `issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `issued ${assignee} an Expensify Card! The card will be shipped once shipping details are added.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `issued ${assignee} a virtual ${link}! The card can be used right away.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            verifyingHeader: '\uD655\uC778 \uC911',
            bankAccountVerifiedHeader: '\uC740\uD589 \uACC4\uC88C \uD655\uC778\uB428',
            verifyingBankAccount: '\uC740\uD589 \uACC4\uC88C \uD655\uC778 \uC911...',
            verifyingBankAccountDescription:
                '\uC774 \uACC4\uC815\uC774 Expensify Cards\uB97C \uBC1C\uAE09\uD558\uB294 \uB370 \uC0AC\uC6A9\uB420 \uC218 \uC788\uB294\uC9C0 \uD655\uC778\uD558\uB294 \uB3D9\uC548 \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694.',
            bankAccountVerified: '\uC740\uD589 \uACC4\uC88C \uC778\uC99D \uC644\uB8CC!',
            bankAccountVerifiedDescription:
                '\uC774\uC81C \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBA64\uBC84\uC5D0\uAC8C Expensify \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            oneMoreStep: '\uD55C \uB2E8\uACC4 \uB354...',
            oneMoreStepDescription:
                '\uC6B0\uB9AC\uAC00 \uC218\uB3D9\uC73C\uB85C \uADC0\uD558\uC758 \uC740\uD589 \uACC4\uC88C\uB97C \uD655\uC778\uD574\uC57C \uD558\uB294 \uAC83 \uAC19\uC2B5\uB2C8\uB2E4. Concierge\uB85C \uC774\uB3D9\uD558\uC5EC \uADC0\uD558\uC758 \uC9C0\uC2DC\uC0AC\uD56D\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
            gotIt: '\uC54C\uACA0\uC2B5\uB2C8\uB2E4',
            goToConcierge: '\uCF69\uC2DC\uC5D0\uB974\uC9C0\uB85C \uAC00\uAE30',
        },
        categories: {
            deleteCategories: '\uCE74\uD14C\uACE0\uB9AC \uC0AD\uC81C',
            deleteCategoriesPrompt: '\uC774 \uCE74\uD14C\uACE0\uB9AC\uB4E4\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            deleteCategory: '\uCE74\uD14C\uACE0\uB9AC \uC0AD\uC81C',
            deleteCategoryPrompt: '\uC774 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            disableCategories: '\uCE74\uD14C\uACE0\uB9AC \uBE44\uD65C\uC131\uD654',
            disableCategory: '\uCE74\uD14C\uACE0\uB9AC \uBE44\uD65C\uC131\uD654',
            enableCategories: '\uCE74\uD14C\uACE0\uB9AC \uD65C\uC131\uD654',
            enableCategory: '\uCE74\uD14C\uACE0\uB9AC \uD65C\uC131\uD654',
            defaultSpendCategories: '\uAE30\uBCF8 \uC9C0\uCD9C \uCE74\uD14C\uACE0\uB9AC',
            spendCategoriesDescription:
                '\uC2E0\uC6A9 \uCE74\uB4DC \uAC70\uB798\uC640 \uC2A4\uCE94\uB41C \uC601\uC218\uC99D\uC5D0 \uB300\uD55C \uC0C1\uC778 \uC9C0\uCD9C \uBD84\uB958 \uBC29\uC2DD\uC744 \uC0AC\uC6A9\uC790 \uC815\uC758\uD558\uC2ED\uC2DC\uC624.',
            deleteFailureMessage:
                '\uCE74\uD14C\uACE0\uB9AC\uB97C \uC0AD\uC81C\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            categoryName: '\uCE74\uD14C\uACE0\uB9AC \uC774\uB984',
            requiresCategory: '\uD68C\uC6D0\uB4E4\uC740 \uBAA8\uB4E0 \uBE44\uC6A9\uC744 \uBD84\uB958\uD574\uC57C \uD569\uB2C8\uB2E4',
            needCategoryForExportToIntegration: '\uBAA8\uB4E0 \uBE44\uC6A9\uC744 \uB0B4\uBCF4\uB0B4\uAE30 \uC704\uD574\uC120 \uCE74\uD14C\uACE0\uB9AC\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4',
            subtitle:
                '\uB3C8\uC774 \uC5B4\uB514\uC5D0 \uC0AC\uC6A9\uB418\uACE0 \uC788\uB294\uC9C0 \uB354 \uC798 \uD30C\uC545\uD558\uC138\uC694. \uAE30\uBCF8 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC0AC\uC6A9\uD558\uAC70\uB098 \uC9C1\uC811 \uCD94\uAC00\uD558\uC138\uC694.',
            emptyCategories: {
                title: '\uC544\uC9C1 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC0DD\uC131\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
                subtitle: '\uB2F9\uC2E0\uC758 \uC9C0\uCD9C\uC744 \uC815\uB9AC\uD558\uAE30 \uC704\uD574 \uCE74\uD14C\uACE0\uB9AC\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
            },
            updateFailureMessage:
                '\uCE74\uD14C\uACE0\uB9AC\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            createFailureMessage:
                '\uCE74\uD14C\uACE0\uB9AC\uB97C \uC0DD\uC131\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            addCategory: '\uCE74\uD14C\uACE0\uB9AC \uCD94\uAC00',
            editCategory: '\uCE74\uD14C\uACE0\uB9AC \uD3B8\uC9D1',
            editCategories: '\uCE74\uD14C\uACE0\uB9AC \uD3B8\uC9D1',
            categoryRequiredError: '\uCE74\uD14C\uACE0\uB9AC \uC774\uB984\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
            existingCategoryError: '\uC774 \uC774\uB984\uC758 \uCE74\uD14C\uACE0\uB9AC\uAC00 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4.',
            invalidCategoryName: '\uC798\uBABB\uB41C \uCE74\uD14C\uACE0\uB9AC \uC774\uB984\uC785\uB2C8\uB2E4.',
            importedFromAccountingSoftware: '\uC544\uB798\uC758 \uCE74\uD14C\uACE0\uB9AC\uB4E4\uC740 \uB2F9\uC2E0\uC758 ${username}\uC5D0\uC11C \uAC00\uC838\uC628 \uAC83\uC785\uB2C8\uB2E4.',
            payrollCode: '\uAE09\uC5EC \uCF54\uB4DC',
            updatePayrollCodeFailureMessage:
                '\uAE09\uC5EC \uCF54\uB4DC\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            glCode: 'GL \uCF54\uB4DC',
            updateGLCodeFailureMessage:
                'GL \uCF54\uB4DC\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            importCategories: '\uCE74\uD14C\uACE0\uB9AC \uAC00\uC838\uC624\uAE30',
        },
        moreFeatures: {
            subtitle:
                '\uC131\uC7A5\uD568\uC5D0 \uB530\uB77C \uB354 \uB9CE\uC740 \uAE30\uB2A5\uC744 \uD65C\uC131\uD654\uD558\uAE30 \uC704\uD574 \uC544\uB798\uC758 \uD1A0\uAE00\uC744 \uC0AC\uC6A9\uD558\uC138\uC694. \uAC01 \uAE30\uB2A5\uC740 \uCD94\uAC00 \uC0AC\uC6A9\uC790 \uC815\uC758\uB97C \uC704\uD574 \uD0D0\uC0C9 \uBA54\uB274\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
            spendSection: {
                title: '\uC9C0\uCD9C\uD558\uB2E4',
                subtitle: '\uD300\uC744 \uD655\uC7A5\uD558\uB294 \uB370 \uB3C4\uC6C0\uC774 \uB418\uB294 \uAE30\uB2A5\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694.',
            },
            manageSection: {
                title: '\uAD00\uB9AC',
                subtitle:
                    '\uC608\uC0B0 \uB0B4\uC5D0\uC11C \uC9C0\uCD9C\uC744 \uC720\uC9C0\uD560 \uC218 \uC788\uB3C4\uB85D \uB3C4\uC640\uC8FC\uB294 \uCEE8\uD2B8\uB864\uC744 \uCD94\uAC00\uD558\uC2ED\uC2DC\uC624.',
            },
            earnSection: {
                title: '\uD68D\uB4DD',
                subtitle: '\uC218\uC775\uC744 \uD6A8\uC728\uD654\uD558\uACE0 \uB354 \uBE60\uB974\uAC8C \uC9C0\uAE09\uBC1B\uC73C\uC138\uC694.',
            },
            organizeSection: {
                title: '\uC815\uB9AC\uD558\uB2E4',
                subtitle: '\uADF8\uB8F9\uBCC4\uB85C \uC9C0\uCD9C\uC744 \uBD84\uC11D\uD558\uACE0, \uC9C0\uBD88\uD55C \uBAA8\uB4E0 \uC138\uAE08\uC744 \uAE30\uB85D\uD558\uC138\uC694.',
            },
            integrateSection: {
                title: '\uD1B5\uD569\uD558\uB2E4',
                subtitle: 'Expensify\uB97C \uC778\uAE30 \uC788\uB294 \uAE08\uC735 \uC81C\uD488\uC5D0 \uC5F0\uACB0\uD558\uC138\uC694.',
            },
            distanceRates: {
                title: '\uAC70\uB9AC \uC694\uAE08',
                subtitle: '\uC694\uAE08 \uCD94\uAC00, \uC5C5\uB370\uC774\uD2B8, \uBC0F \uAC15\uC81C \uC801\uC6A9.',
            },
            perDiem: {
                title: '\uC77C\uB2F9',
                subtitle: '\uC9C1\uC6D0\uC758 \uC77C\uC77C \uC9C0\uCD9C\uC744 \uC81C\uC5B4\uD558\uAE30 \uC704\uD574 \uC77C\uC77C\uBE44\uC6A9\uB960\uC744 \uC124\uC815\uD558\uC138\uC694.',
            },
            expensifyCard: {
                title: 'Expensify \uCE74\uB4DC',
                subtitle: '\uC9C0\uCD9C\uC5D0 \uB300\uD55C \uD1B5\uCC30\uB825\uACFC \uD1B5\uC81C\uB825\uC744 \uC5BB\uC73C\uC2ED\uC2DC\uC624.',
                disableCardTitle: 'Expensify \uCE74\uB4DC \uBE44\uD65C\uC131\uD654',
                disableCardPrompt:
                    'Expensify \uCE74\uB4DC\uB294 \uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC774\uBBC0\uB85C \uBE44\uD65C\uC131\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uB2E8\uACC4\uC5D0 \uB300\uD574 Concierge\uC5D0\uAC8C \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.',
                disableCardButton: '\uCF69\uC2DC\uC5D0\uB974\uC9C0\uC640 \uCC44\uD305\uD558\uAE30',
                feed: {
                    title: 'Expensify Card\uB97C \uBC1B\uC73C\uC138\uC694',
                    subTitle:
                        '\uB2F9\uC2E0\uC758 \uBE44\uC988\uB2C8\uC2A4 \uBE44\uC6A9\uC744 \uAC04\uC18C\uD654\uD558\uACE0 Expensify \uCCAD\uAD6C\uC11C\uC5D0\uC11C \uCD5C\uB300 50%\uB97C \uC808\uC57D\uD558\uC138\uC694, \uB354\uBD88\uC5B4:',
                    features: {
                        cashBack: '\uBAA8\uB4E0 \uBBF8\uAD6D \uAD6C\uB9E4\uC5D0 \uB300\uD55C \uD604\uAE08 \uBC18\uD658',
                        unlimited: '\uBB34\uC81C\uD55C \uAC00\uC0C1 \uCE74\uB4DC',
                        spend: '\uC9C0\uCD9C \uC81C\uC5B4 \uBC0F \uC0AC\uC6A9\uC790 \uC815\uC758 \uD55C\uB3C4',
                    },
                    ctaTitle: '\uC0C8 \uCE74\uB4DC \uBC1C\uAE09',
                },
            },
            companyCards: {
                title: '\uD68C\uC0AC \uCE74\uB4DC',
                subtitle: '\uAE30\uC874 \uD68C\uC0AC \uCE74\uB4DC\uC5D0\uC11C \uC9C0\uCD9C\uC744 \uAC00\uC838\uC624\uC2ED\uC2DC\uC624.',
                feed: {
                    title: '\uD68C\uC0AC \uCE74\uB4DC \uAC00\uC838\uC624\uAE30',
                    features: {
                        support: '\uBAA8\uB4E0 \uC8FC\uC694 \uCE74\uB4DC \uC81C\uACF5\uC790\uC5D0 \uB300\uD55C \uC9C0\uC6D0',
                        assignCards: '\uC804\uCCB4 \uD300\uC5D0 \uCE74\uB4DC\uB97C \uD560\uB2F9\uD558\uC2ED\uC2DC\uC624',
                        automaticImport: '\uC790\uB3D9 \uAC70\uB798 \uAC00\uC838\uC624\uAE30',
                    },
                },
                disableCardTitle: '\uD68C\uC0AC \uCE74\uB4DC \uBE44\uD65C\uC131\uD654',
                disableCardPrompt:
                    '\uC774 \uAE30\uB2A5\uC774 \uC0AC\uC6A9 \uC911\uC774\uBBC0\uB85C \uD68C\uC0AC \uCE74\uB4DC\uB97C \uBE44\uD65C\uC131\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uB2E8\uACC4\uC5D0 \uB300\uD574 \uCF58\uC2DC\uC5B4\uC9C0\uC5D0\uAC8C \uBB38\uC758\uD558\uC2ED\uC2DC\uC624.',
                disableCardButton: '\uCF69\uC2DC\uC5D0\uB974\uC9C0\uC640 \uCC44\uD305\uD558\uAE30',
                cardDetails: '\uCE74\uB4DC \uC138\uBD80 \uC815\uBCF4',
                cardNumber: '\uCE74\uB4DC \uBC88\uD638',
                cardholder: '\uCE74\uB4DC \uC18C\uC9C0\uC790',
                cardName: '\uCE74\uB4DC \uC774\uB984',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} export` : `${integration} export`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) =>
                    `\uAC70\uB798 \uB0B4\uC5ED\uC744 \uB0B4\uBCF4\uB0BC ${integration} \uACC4\uC815\uC744 \uC120\uD0DD\uD558\uC138\uC694.`,
                integrationExportTitlePart: '\uB2E4\uB978 \uAC83\uC744 \uC120\uD0DD\uD558\uC138\uC694',
                integrationExportTitleLinkPart: 'export \uC635\uC158',
                integrationExportTitleSecondPart: '\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uACC4\uC815\uC744 \uBCC0\uACBD\uD558\uC2ED\uC2DC\uC624.',
                lastUpdated: '\uB9C8\uC9C0\uB9C9 \uC5C5\uB370\uC774\uD2B8',
                transactionStartDate: '\uAC70\uB798 \uC2DC\uC791 \uB0A0\uC9DC',
                updateCard: '\uCE74\uB4DC \uC5C5\uB370\uC774\uD2B8',
                unassignCard: '\uCE74\uB4DC \uD560\uB2F9 \uCDE8\uC18C',
                unassign: '\uD560\uB2F9 \uCDE8\uC18C',
                unassignCardDescription:
                    '\uC774 \uCE74\uB4DC\uC758 \uD560\uB2F9\uC744 \uCDE8\uC18C\uD558\uBA74 \uCE74\uB4DC \uC18C\uC9C0\uC790\uC758 \uACC4\uC815\uC5D0\uC11C \uBAA8\uB4E0 \uAC70\uB798\uAC00 \uCD08\uC548 \uBCF4\uACE0\uC11C\uC5D0\uC11C \uC81C\uAC70\uB429\uB2C8\uB2E4.',
                assignCard: '\uCE74\uB4DC \uD560\uB2F9',
                cardFeedName: '\uCE74\uB4DC \uD53C\uB4DC \uC774\uB984',
                cardFeedNameDescription:
                    '\uB2E4\uB978 \uAC83\uB4E4\uACFC \uAD6C\uBD84\uD560 \uC218 \uC788\uB3C4\uB85D \uCE74\uB4DC \uD53C\uB4DC\uC5D0 \uACE0\uC720\uD55C \uC774\uB984\uC744 \uC9C0\uC815\uD558\uC138\uC694.',
                cardFeedTransaction: '\uAC70\uB798 \uC0AD\uC81C',
                cardFeedTransactionDescription:
                    '\uCE74\uB4DC \uC18C\uC9C0\uC790\uAC00 \uCE74\uB4DC \uAC70\uB798\uB97C \uC0AD\uC81C\uD560 \uC218 \uC788\uB294\uC9C0 \uC120\uD0DD\uD558\uC138\uC694. \uC0C8\uB85C\uC6B4 \uAC70\uB798\uB294 \uC774 \uADDC\uCE59\uC744 \uB530\uB985\uB2C8\uB2E4.',
                cardFeedRestrictDeletingTransaction: '\uAC70\uB798 \uC0AD\uC81C \uC81C\uD55C',
                cardFeedAllowDeletingTransaction: '\uAC70\uB798 \uC0AD\uC81C \uD5C8\uC6A9',
                removeCardFeed: '\uCE74\uB4DC \uD53C\uB4DC \uC81C\uAC70',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Remove ${feedName} feed`,
                removeCardFeedDescription:
                    '\uC774 \uCE74\uB4DC \uD53C\uB4DC\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC774\uB807\uAC8C \uD558\uBA74 \uBAA8\uB4E0 \uCE74\uB4DC\uAC00 \uD560\uB2F9 \uD574\uC81C\uB429\uB2C8\uB2E4.',
                error: {
                    feedNameRequired: '\uCE74\uB4DC \uD53C\uB4DC \uC774\uB984\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
                },
                corporate: '\uAC70\uB798 \uC0AD\uC81C \uC81C\uD55C',
                personal: '\uAC70\uB798 \uC0AD\uC81C \uD5C8\uC6A9',
                setFeedNameDescription:
                    '\uB2E4\uB978 \uAC83\uB4E4\uACFC \uAD6C\uBD84\uD560 \uC218 \uC788\uB3C4\uB85D \uCE74\uB4DC \uD53C\uB4DC\uC5D0 \uACE0\uC720\uD55C \uC774\uB984\uC744 \uC9C0\uC815\uD558\uC138\uC694.',
                setTransactionLiabilityDescription:
                    '\uD65C\uC131\uD654\uB418\uBA74, \uCE74\uB4DC \uC18C\uC9C0\uC790\uB294 \uCE74\uB4DC \uAC70\uB798\uB97C \uC0AD\uC81C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uC6B4 \uAC70\uB798\uB294 \uC774 \uADDC\uCE59\uC744 \uB530\uB97C \uAC83\uC785\uB2C8\uB2E4.',
                emptyAddedFeedTitle: '\uD68C\uC0AC \uCE74\uB4DC \uD560\uB2F9',
                emptyAddedFeedDescription: '\uCCAB \uBC88\uC9F8 \uCE74\uB4DC\uB97C \uBA64\uBC84\uC5D0\uAC8C \uD560\uB2F9\uD558\uC5EC \uC2DC\uC791\uD558\uC138\uC694.',
                pendingFeedTitle: `We're reviewing your request...`,
                pendingFeedDescription: `We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: '\uBE0C\uB77C\uC6B0\uC800 \uCC3D\uC744 \uD655\uC778\uD558\uC138\uC694',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `\uBC29\uAE08 \uC5F4\uB9B0 \uBE0C\uB77C\uC6B0\uC800 \uCC3D\uC744 \uD1B5\uD574 ${bankName}\uC5D0 \uC5F0\uACB0\uD574 \uC8FC\uC138\uC694. \uCC3D\uC774 \uC5F4\uB9AC\uC9C0 \uC54A\uC558\uB2E4\uBA74,`,
                pendingBankLink: '\uC5EC\uAE30\uB97C \uD074\uB9AD\uD574\uC8FC\uC138\uC694.',
                giveItNameInstruction: '\uB2E4\uB978 \uCE74\uB4DC\uC640 \uAD6C\uBCC4\uB420 \uC218 \uC788\uB294 \uC774\uB984\uC744 \uCE74\uB4DC\uC5D0 \uBD80\uC5EC\uD558\uC138\uC694.',
                updating: '\uC5C5\uB370\uC774\uD2B8 \uC911...',
                noAccountsFound: '\uACC4\uC815\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
                defaultCard: '\uAE30\uBCF8 \uCE74\uB4DC',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Please add the account in ${connection} and sync the connection again.`,
            },
            workflows: {
                title: '\uC6CC\uD06C\uD50C\uB85C\uC6B0',
                subtitle: '\uC9C0\uCD9C\uC774 \uC2B9\uC778\uB418\uACE0 \uC9C0\uBD88\uB418\uB294 \uBC29\uC2DD\uC744 \uC124\uC815\uD558\uC2ED\uC2DC\uC624.',
            },
            invoices: {
                title: '\uCCAD\uAD6C\uC11C',
                subtitle: '\uC1A1\uC7A5\uC744 \uBCF4\uB0B4\uACE0 \uBC1B\uC73C\uC138\uC694.',
            },
            categories: {
                title: '\uCE74\uD14C\uACE0\uB9AC',
                subtitle: '\uC9C0\uCD9C\uC744 \uCD94\uC801\uD558\uACE0 \uC815\uB9AC\uD558\uC2ED\uC2DC\uC624.',
            },
            tags: {
                title: '\uD0DC\uADF8',
                subtitle: '\uBE44\uC6A9\uC744 \uBD84\uB958\uD558\uACE0 \uCCAD\uAD6C \uAC00\uB2A5\uD55C \uBE44\uC6A9\uC744 \uCD94\uC801\uD558\uC2ED\uC2DC\uC624.',
            },
            taxes: {
                title: '\uC138\uAE08',
                subtitle: '\uC11C\uB958\uB97C \uC791\uC131\uD558\uACE0 \uC790\uACA9\uC774 \uC788\uB294 \uC138\uAE08\uC744 \uCCAD\uAD6C\uD558\uC2ED\uC2DC\uC624.',
            },
            reportFields: {
                title: '\uBCF4\uACE0\uC11C \uD544\uB4DC',
                subtitle: '\uC9C0\uCD9C\uC5D0 \uB300\uD55C \uC0AC\uC6A9\uC790 \uC815\uC758 \uD544\uB4DC \uC124\uC815\uD558\uAE30.',
            },
            connections: {
                title: '\uD68C\uACC4',
                subtitle: '\uB2F9\uC2E0\uC758 \uD68C\uACC4 \uCC28\uD2B8\uC640 \uB354 \uB9CE\uC740 \uAC83\uC744 \uB3D9\uAE30\uD654\uD558\uC138\uC694.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '\uADF8\uB807\uAC8C \uBE60\uB974\uAC8C\uB294 \uC548 \uB3FC...',
                featureEnabledText:
                    '\uC774 \uAE30\uB2A5\uC744 \uD65C\uC131\uD654 \uB610\uB294 \uBE44\uD65C\uC131\uD654\uD558\uB824\uBA74 \uD68C\uACC4 \uC218\uC785 \uC124\uC815\uC744 \uBCC0\uACBD\uD574\uC57C \uD569\uB2C8\uB2E4.',
                disconnectText:
                    '\uD68C\uACC4\uB97C \uBE44\uD65C\uC131\uD654\uD558\uB824\uBA74, \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uD68C\uACC4 \uC5F0\uACB0\uC744 \uD574\uC81C\uD574\uC57C \uD569\uB2C8\uB2E4.',
                manageSettings: '\uC124\uC815 \uAD00\uB9AC',
            },
            rules: {
                title: '\uADDC\uCE59',
                subtitle: '\uC601\uC218\uC99D \uC694\uAD6C, \uACFC\uB3C4\uD55C \uC9C0\uCD9C \uD50C\uB798\uADF8 \uC124\uC815, \uADF8 \uC678 \uAE30\uD0C0 \uB4F1\uB4F1.',
            },
        },
        reportFields: {
            addField: '\uD544\uB4DC \uCD94\uAC00',
            delete: '\uD544\uB4DC \uC0AD\uC81C',
            deleteFields: '\uD544\uB4DC \uC0AD\uC81C',
            deleteConfirmation: '\uC774 \uBCF4\uACE0\uC11C \uD544\uB4DC\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            deleteFieldsConfirmation: '\uC774 \uBCF4\uACE0\uC11C \uD544\uB4DC\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            emptyReportFields: {
                title: '\uC544\uC9C1 \uBCF4\uACE0\uC11C \uD544\uB4DC\uB97C \uC0DD\uC131\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
                subtitle:
                    '\uBCF4\uACE0\uC11C\uC5D0 \uD45C\uC2DC\uB418\uB294 \uC0AC\uC6A9\uC790 \uC815\uC758 \uD544\uB4DC(\uD14D\uC2A4\uD2B8, \uB0A0\uC9DC, \uB610\uB294 \uB4DC\uB86D\uB2E4\uC6B4)\uB97C \uCD94\uAC00\uD558\uC2ED\uC2DC\uC624.',
            },
            subtitle:
                '\uBCF4\uACE0\uC11C \uD544\uB4DC\uB294 \uBAA8\uB4E0 \uC9C0\uCD9C\uC5D0 \uC801\uC6A9\uB418\uBA70 \uCD94\uAC00 \uC815\uBCF4\uB97C \uC694\uCCAD\uD558\uACE0 \uC2F6\uC744 \uB54C \uC720\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            disableReportFields: '\uBCF4\uACE0\uC11C \uD544\uB4DC \uBE44\uD65C\uC131\uD654',
            disableReportFieldsConfirmation:
                '\uD655\uC2E4\uD569\uB2C8\uAE4C? \uD14D\uC2A4\uD2B8\uC640 \uB0A0\uC9DC \uD544\uB4DC\uB294 \uC0AD\uC81C\uB418\uBA70, \uBAA9\uB85D\uC740 \uBE44\uD65C\uC131\uD654\uB429\uB2C8\uB2E4.',
            importedFromAccountingSoftware: '\uC544\uB798\uC758 \uBCF4\uACE0\uC11C \uD544\uB4DC\uB294 \uADC0\uD558\uC758 \uAC83\uC5D0\uC11C \uAC00\uC838\uC628 \uAC83\uC785\uB2C8\uB2E4',
            textType: '\uD14D\uC2A4\uD2B8',
            dateType: '\uB0A0\uC9DC',
            dropdownType: '\uBAA9\uB85D',
            textAlternateText: '\uBB34\uB8CC \uD14D\uC2A4\uD2B8 \uC785\uB825\uC744 \uC704\uD55C \uD544\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
            dateAlternateText: '\uB0A0\uC9DC \uC120\uD0DD\uC744 \uC704\uD55C \uCE98\uB9B0\uB354\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
            dropdownAlternateText: '\uC120\uD0DD\uD560 \uC218 \uC788\uB294 \uC635\uC158 \uBAA9\uB85D\uC744 \uCD94\uAC00\uD558\uC138\uC694.',
            nameInputSubtitle: '\uBCF4\uACE0\uC11C \uD544\uB4DC\uC758 \uC774\uB984\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            typeInputSubtitle: '\uC0AC\uC6A9\uD560 \uBCF4\uACE0\uC11C \uD544\uB4DC \uC720\uD615\uC744 \uC120\uD0DD\uD558\uC138\uC694.',
            initialValueInputSubtitle: '\uBCF4\uACE0\uC11C \uD544\uB4DC\uC5D0 \uD45C\uC2DC\uD560 \uC2DC\uC791 \uAC12\uC744 \uC785\uB825\uD558\uC2ED\uC2DC\uC624.',
            listValuesInputSubtitle:
                '\uC774 \uAC12\uB4E4\uC740 \uBCF4\uACE0\uC11C \uD544\uB4DC \uB4DC\uB86D\uB2E4\uC6B4\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4. \uD65C\uC131\uD654\uB41C \uAC12\uB4E4\uC740 \uD68C\uC6D0\uB4E4\uC774 \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            listInputSubtitle:
                '\uC774 \uAC12\uB4E4\uC740 \uBCF4\uACE0\uC11C \uD544\uB4DC \uBAA9\uB85D\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4. \uD65C\uC131\uD654\uB41C \uAC12\uB4E4\uC740 \uD68C\uC6D0\uB4E4\uC5D0 \uC758\uD574 \uC120\uD0DD\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            deleteValue: '\uAC12 \uC0AD\uC81C',
            deleteValues: '\uAC12 \uC0AD\uC81C',
            disableValue: '\uAC12 \uBE44\uD65C\uC131\uD654',
            disableValues: '\uAC12 \uBE44\uD65C\uC131\uD654',
            enableValue: '\uAC12 \uD65C\uC131\uD654',
            enableValues: '\uAC12 \uD65C\uC131\uD654',
            emptyReportFieldsValues: {
                title: '\uC544\uC9C1 \uB9AC\uC2A4\uD2B8 \uAC12\uC774 \uC0DD\uC131\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
                subtitle: '\uBCF4\uACE0\uC11C\uC5D0 \uD45C\uC2DC\uB420 \uC0AC\uC6A9\uC790 \uC815\uC758 \uAC12\uC744 \uCD94\uAC00\uD558\uC2ED\uC2DC\uC624.',
            },
            deleteValuePrompt: '\uC774 \uBAA9\uB85D \uAC12\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            deleteValuesPrompt: '\uC774 \uBAA9\uB85D \uAC12\uB4E4\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            listValueRequiredError: '\uB9AC\uC2A4\uD2B8 \uAC12 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
            existingListValueError: '\uC774 \uC774\uB984\uC744 \uAC00\uC9C4 \uBAA9\uB85D \uAC12\uC774 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4',
            editValue: '\uAC12 \uD3B8\uC9D1',
            listValues: '\uAC12 \uBAA9\uB85D',
            addValue: '\uAC12 \uCD94\uAC00',
            existingReportFieldNameError: '\uC774 \uC774\uB984\uC744 \uAC00\uC9C4 \uBCF4\uACE0\uC11C \uD544\uB4DC\uAC00 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4',
            reportFieldNameRequiredError: '\uBCF4\uACE0\uC11C \uD544\uB4DC \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
            reportFieldTypeRequiredError: '\uBCF4\uACE0\uC11C \uD544\uB4DC \uC720\uD615\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694',
            reportFieldInitialValueRequiredError: '\uBCF4\uACE0\uC11C \uD544\uB4DC \uCD08\uAE30\uAC12\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694',
            genericFailureMessage:
                '\uBCF4\uACE0\uC11C \uD544\uB4DC\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
        tags: {
            tagName: '\uD0DC\uADF8 \uC774\uB984',
            requiresTag: '\uBA64\uBC84\uB4E4\uC740 \uBAA8\uB4E0 \uBE44\uC6A9\uC5D0 \uD0DC\uADF8\uB97C \uB2EC\uC544\uC57C \uD569\uB2C8\uB2E4',
            trackBillable: '\uCCAD\uAD6C \uAC00\uB2A5\uD55C \uBE44\uC6A9 \uCD94\uC801',
            customTagName: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uD0DC\uADF8 \uC774\uB984',
            enableTag: '\uD0DC\uADF8 \uD65C\uC131\uD654',
            enableTags: '\uD0DC\uADF8 \uD65C\uC131\uD654',
            disableTag: '\uD0DC\uADF8 \uBE44\uD65C\uC131\uD654',
            disableTags: '\uD0DC\uADF8 \uBE44\uD65C\uC131\uD654',
            addTag: '\uD0DC\uADF8 \uCD94\uAC00',
            editTag: '\uD0DC\uADF8 \uD3B8\uC9D1',
            editTags: '\uD0DC\uADF8 \uD3B8\uC9D1',
            subtitle: '\uD0DC\uADF8\uB294 \uBE44\uC6A9\uC744 \uBD84\uB958\uD558\uB294 \uB354 \uC0C1\uC138\uD55C \uBC29\uBC95\uC744 \uCD94\uAC00\uD569\uB2C8\uB2E4.',
            emptyTags: {
                title: '\uC544\uC9C1 \uD0DC\uADF8\uB97C \uC0DD\uC131\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
                subtitle: '\uD504\uB85C\uC81D\uD2B8, \uC704\uCE58, \uBD80\uC11C \uB4F1\uC744 \uCD94\uC801\uD558\uAE30 \uC704\uD574 \uD0DC\uADF8\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
            },
            deleteTag: '\uD0DC\uADF8 \uC0AD\uC81C',
            deleteTags: '\uD0DC\uADF8 \uC0AD\uC81C',
            deleteTagConfirmation: '\uC774 \uD0DC\uADF8\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            deleteTagsConfirmation: '\uC774 \uD0DC\uADF8\uB97C \uC0AD\uC81C\uD558\uAE38 \uC6D0\uD558\uC2ED\uB2C8\uAE4C?',
            deleteFailureMessage:
                '\uD0DC\uADF8\uB97C \uC0AD\uC81C\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            tagRequiredError: '\uD0DC\uADF8 \uC774\uB984\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
            existingTagError: '\uC774 \uC774\uB984\uC758 \uD0DC\uADF8\uAC00 \uC774\uBBF8 \uC874\uC7AC\uD569\uB2C8\uB2E4.',
            invalidTagNameError: '\uD0DC\uADF8 \uC774\uB984\uC740 0\uC774 \uB420 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uAC12\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
            genericFailureMessage:
                '\uD0DC\uADF8\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            importedFromAccountingSoftware: '\uC544\uB798 \uD0DC\uADF8\uB4E4\uC740 \uB2F9\uC2E0\uC758 ${username}\uC5D0\uC11C \uAC00\uC838\uC628 \uAC83\uC785\uB2C8\uB2E4.',
            glCode: 'GL \uCF54\uB4DC',
            updateGLCodeFailureMessage:
                'GL \uCF54\uB4DC\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            tagRules: '\uD0DC\uADF8 \uADDC\uCE59',
            approverDescription: '\uC2B9\uC778\uC790',
            importTags: '\uD0DC\uADF8 \uAC00\uC838\uC624\uAE30',
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `\uC6B0\uB9AC\uB294 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8\uC5D0\uC11C *${columnCounts} \uC5F4*\uC744 \uCC3E\uC558\uC2B5\uB2C8\uB2E4. \uD0DC\uADF8 \uC774\uB984\uC774 \uD3EC\uD568\uB41C \uC5F4 \uC606\uC5D0 *\uC774\uB984*\uC744 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624. \uB610\uD55C \uD0DC\uADF8 \uC0C1\uD0DC\uB97C \uC124\uC815\uD558\uB294 \uC5F4 \uC606\uC5D0 *\uD65C\uC131\uD654*\uB97C \uC120\uD0DD\uD560 \uC218\uB3C4 \uC788\uC2B5\uB2C8\uB2E4.`,
        },
        taxes: {
            subtitle: '\uC138\uAE08 \uC774\uB984, \uC694\uAE08\uC744 \uCD94\uAC00\uD558\uACE0 \uAE30\uBCF8\uAC12\uC744 \uC124\uC815\uD558\uC138\uC694.',
            addRate: '\uC694\uAE08 \uCD94\uAC00',
            workspaceDefault: '\uC791\uC5C5 \uACF5\uAC04 \uD654\uD3D0 \uAE30\uBCF8\uAC12',
            foreignDefault: '\uC678\uD654 \uAE30\uBCF8\uAC12',
            customTaxName: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uAE08 \uC774\uB984',
            value: '\uAC12',
            taxReclaimableOn: '\uC138\uAE08 \uBC18\uD658 \uAC00\uB2A5 \uAE08\uC561',
            taxRate: '\uC138\uC728',
            error: {
                taxRateAlreadyExists: '\uC774 \uC138\uAE08 \uC774\uB984\uC740 \uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC785\uB2C8\uB2E4.',
                taxCodeAlreadyExists: '\uC774 \uC138\uAE08 \uCF54\uB4DC\uB294 \uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC785\uB2C8\uB2E4.',
                valuePercentageRange: '0\uACFC 100 \uC0AC\uC774\uC758 \uC720\uD6A8\uD55C \uBC31\uBD84\uC728\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
                customNameRequired: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC138\uAE08 \uC774\uB984\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
                deleteFailureMessage:
                    '\uC138\uAE08\uC728\uC744 \uC0AD\uC81C\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uCEE8\uC2DC\uC5B4\uC9C0\uC5D0\uAC8C \uB3C4\uC6C0\uC744 \uC694\uCCAD\uD558\uC138\uC694.',
                updateFailureMessage:
                    '\uC138\uC728 \uC5C5\uB370\uC774\uD2B8 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uCEE8\uC2DC\uC5B4\uC9C0\uC5D0\uAC8C \uB3C4\uC6C0\uC744 \uC694\uCCAD\uD574 \uC8FC\uC138\uC694.',
                createFailureMessage:
                    '\uC138\uAE08\uC728\uC744 \uC0DD\uC131\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uCEE8\uC2DC\uC5B4\uC9C0\uC5D0\uAC8C \uB3C4\uC6C0\uC744 \uC694\uCCAD\uD574\uC8FC\uC138\uC694.',
                updateTaxClaimableFailureMessage:
                    '\uD658\uAE09 \uAC00\uB2A5\uD55C \uBD80\uBD84\uC740 \uAC70\uB9AC \uBE44\uC728 \uAE08\uC561\uBCF4\uB2E4 \uC791\uC544\uC57C \uD569\uB2C8\uB2E4.',
            },
            deleteTaxConfirmation: '\uC774 \uC138\uAE08\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: '\uC0AD\uC81C\uC728',
                deleteMultiple: '\uC0AD\uC81C \uBE44\uC728',
                enable: '\uBE44\uC728 \uD65C\uC131\uD654',
                disable: '\uBE44\uC728 \uBE44\uD65C\uC131\uD654',
                enableTaxRates: () => ({
                    one: '\uBE44\uC728 \uD65C\uC131\uD654',
                    other: '\uC694\uAE08 \uD65C\uC131\uD654',
                }),
                disableTaxRates: () => ({
                    one: '\uBE44\uC728 \uBE44\uD65C\uC131\uD654',
                    other: '\uC694\uAE08 \uBE44\uD65C\uC131\uD654',
                }),
            },
            importedFromAccountingSoftware: '\uC544\uB798\uC758 \uC138\uAE08\uC740 \uADC0\uD558\uC758 \uAC83\uC5D0\uC11C \uAC00\uC838\uC628 \uAC83\uC785\uB2C8\uB2E4.',
            taxCode: '\uC138\uAE08 \uCF54\uB4DC',
            updateTaxCodeFailureMessage:
                '\uC138\uAE08 \uCF54\uB4DC\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4, \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
        emptyWorkspace: {
            title: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC0DD\uC131',
            subtitle:
                '\uC601\uC218\uC99D \uCD94\uC801, \uBE44\uC6A9 \uD658\uBD88, \uC5EC\uD589 \uAD00\uB9AC, \uC1A1\uC7A5 \uBC1C\uC1A1 \uB4F1\uC744 \uCC98\uB9AC\uD560 \uC218 \uC788\uB294 \uC791\uC5C5 \uACF5\uAC04\uC744 \uB9CC\uB4DC\uC138\uC694 - \uBAA8\uB450 \uCC44\uD305\uC758 \uC18D\uB3C4\uB85C \uAC00\uB2A5\uD569\uB2C8\uB2E4.',
            createAWorkspaceCTA: '\uC2DC\uC791\uD558\uAE30',
            features: {
                trackAndCollect: '\uC601\uC218\uC99D\uC744 \uCD94\uC801\uD558\uACE0 \uC218\uC9D1\uD558\uC138\uC694',
                reimbursements: '\uC9C1\uC6D0\uB4E4\uC5D0\uAC8C \uD658\uBD88\uD558\uB2E4',
                companyCards: '\uD68C\uC0AC \uCE74\uB4DC \uAD00\uB9AC',
            },
            notFound: '\uC791\uC5C5 \uACF5\uAC04\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            description:
                '\uBC29\uC740 \uC5EC\uB7EC \uC0AC\uB78C\uACFC \uD1A0\uB860\uD558\uACE0 \uC791\uC5C5\uD558\uAE30\uC5D0 \uC88B\uC740 \uC7A5\uC18C\uC785\uB2C8\uB2E4. \uD611\uC5C5\uC744 \uC2DC\uC791\uD558\uB824\uBA74, \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC0DD\uC131\uD558\uAC70\uB098 \uAC00\uC785\uD558\uC138\uC694.',
        },
        switcher: {
            headerTitle: '\uC791\uC5C5 \uACF5\uAC04\uBCC4 \uD544\uD130\uB9C1',
            everythingSection: '\uBAA8\uB4E0 \uAC83',
            placeholder: '\uC791\uC5C5 \uACF5\uAC04 \uCC3E\uAE30',
        },
        new: {
            newWorkspace: '\uC0C8\uB85C\uC6B4 \uC791\uC5C5 \uACF5\uAC04',
            getTheExpensifyCardAndMore: 'Expensify \uCE74\uB4DC\uC640 \uB354 \uB9CE\uC740 \uAC83\uC744 \uBC1B\uC73C\uC138\uC694',
            confirmWorkspace: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uD655\uC778',
        },
        people: {
            genericFailureMessage:
                '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0\uC11C \uBA64\uBC84\uB97C \uC81C\uAC70\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `\uC815\uB9D0\uB85C ${memberName}\uC744(\uB97C) \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`,
                other: '\uC774 \uBA64\uBC84\uB4E4\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '\uBA64\uBC84 \uC81C\uAC70',
                other: '\uBA64\uBC84 \uC81C\uAC70',
            }),
            removeWorkspaceMemberButtonTitle: '\uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uC81C\uAC70',
            removeGroupMemberButtonTitle: '\uADF8\uB8F9\uC5D0\uC11C \uC81C\uAC70',
            removeRoomMemberButtonTitle: '\uCC44\uD305\uC5D0\uC11C \uC81C\uAC70',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `\uC815\uB9D0\uB85C ${memberName}\uC744(\uB97C) \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`,
            removeMemberTitle: '\uBA64\uBC84 \uC81C\uAC70',
            transferOwner: '\uC18C\uC720\uAD8C \uC774\uC804',
            makeMember: '\uBA64\uBC84 \uB9CC\uB4E4\uAE30',
            makeAdmin: '\uAD00\uB9AC\uC790\uB85C \uB9CC\uB4E4\uAE30',
            makeAuditor: '\uAC10\uC0AC\uC790 \uB9CC\uB4E4\uAE30',
            selectAll: '\uBAA8\uB450 \uC120\uD0DD',
            error: {
                genericAdd: '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBA64\uBC84\uB97C \uCD94\uAC00\uD558\uB294 \uB370 \uBB38\uC81C\uAC00 \uC788\uC5C8\uC2B5\uB2C8\uB2E4.',
                cannotRemove: '\uC790\uC2E0\uC774\uB098 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC18C\uC720\uC790\uB97C \uC81C\uAC70\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
                genericRemove: '\uADF8 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBA64\uBC84\uB97C \uC81C\uAC70\uD558\uB294 \uB370 \uBB38\uC81C\uAC00 \uC788\uC5C8\uC2B5\uB2C8\uB2E4.',
            },
            addedWithPrimary: '\uC77C\uBD80 \uBA64\uBC84\uB4E4\uC774 \uC8FC \uB85C\uADF8\uC778\uC73C\uB85C \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) =>
                `\uBCF4\uC870 \uB85C\uADF8\uC778 ${secondaryLogin}\uC5D0 \uC758\uD574 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`,
            membersListTitle: '\uBAA8\uB4E0 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBA64\uBC84\uC758 \uB514\uB809\uD1A0\uB9AC.',
            importMembers: '\uBA64\uBC84 \uAC00\uC838\uC624\uAE30',
        },
        card: {
            getStartedIssuing: '\uCCAB \uBC88\uC9F8 \uAC00\uC0C1 \uB610\uB294 \uBB3C\uB9AC \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD558\uC5EC \uC2DC\uC791\uD558\uC138\uC694.',
            issueCard: '\uCE74\uB4DC \uBC1C\uAE09',
            issueNewCard: {
                whoNeedsCard: '\uB204\uAC00 \uCE74\uB4DC\uAC00 \uD544\uC694\uD55C\uAC00\uC694?',
                findMember: '\uBA64\uBC84 \uCC3E\uAE30',
                chooseCardType: '\uCE74\uB4DC \uC720\uD615\uC744 \uC120\uD0DD\uD558\uC138\uC694',
                physicalCard: '\uBB3C\uB9AC\uC801 \uCE74\uB4DC',
                physicalCardDescription: '\uC790\uC8FC \uC18C\uBE44\uD558\uB294 \uC0AC\uB78C\uC5D0\uAC8C \uC88B\uC2B5\uB2C8\uB2E4',
                virtualCard: '\uAC00\uC0C1 \uCE74\uB4DC',
                virtualCardDescription: '\uC989\uC2DC\uC801\uC774\uACE0 \uC720\uC5F0\uD55C',
                chooseLimitType: '\uD55C\uACC4 \uC720\uD615\uC744 \uC120\uD0DD\uD558\uC138\uC694',
                smartLimit: '\uC2A4\uB9C8\uD2B8 \uC81C\uD55C',
                smartLimitDescription: '\uC2B9\uC778\uC744 \uC694\uAD6C\uD558\uAE30 \uC804\uC5D0 \uC77C\uC815 \uAE08\uC561\uAE4C\uC9C0 \uC0AC\uC6A9\uD558\uC2ED\uC2DC\uC624',
                monthly: '\uC6D4\uAC04',
                monthlyDescription: '\uD55C \uB2EC\uC5D0 \uCD5C\uB300 \uC77C\uC815 \uAE08\uC561\uAE4C\uC9C0 \uC0AC\uC6A9\uD558\uC2ED\uC2DC\uC624',
                fixedAmount: '\uACE0\uC815 \uAE08\uC561',
                fixedAmountDescription: '\uD55C \uBC88\uC5D0 \uC77C\uC815 \uAE08\uC561\uAE4C\uC9C0 \uC0AC\uC6A9\uD558\uC2ED\uC2DC\uC624',
                setLimit: '\uD55C\uB3C4 \uC124\uC815',
                cardLimitError: '$21,474,836\uBCF4\uB2E4 \uC791\uC740 \uAE08\uC561\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
                giveItName: '\uC774\uB984\uC744 \uC9C0\uC5B4\uC8FC\uC138\uC694',
                giveItNameInstruction:
                    '\uB2E4\uB978 \uCE74\uB4DC\uC640 \uAD6C\uBCC4\uD560 \uC218 \uC788\uC744 \uB9CC\uD07C \uB3C5\uD2B9\uD558\uAC8C \uB9CC\uB4DC\uC138\uC694. \uD2B9\uC815 \uC0AC\uC6A9 \uC0AC\uB840\uB294 \uB354\uC6B1 \uC88B\uC2B5\uB2C8\uB2E4!',
                cardName: '\uCE74\uB4DC \uC774\uB984',
                letsDoubleCheck: '\uBAA8\uB4E0 \uAC83\uC774 \uC62C\uBC14\uB974\uAC8C \uBCF4\uC774\uB294\uC9C0 \uB2E4\uC2DC \uD655\uC778\uD574 \uBD05\uC2DC\uB2E4.',
                willBeReady: '\uC774 \uCE74\uB4DC\uB294 \uC989\uC2DC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
                cardholder: '\uCE74\uB4DC \uC18C\uC9C0\uC790',
                cardType: '\uCE74\uB4DC \uC720\uD615',
                limit: '\uC81C\uD55C',
                limitType: '\uC81C\uD55C \uC720\uD615',
                name: '\uC774\uB984',
            },
            deactivateCardModal: {
                deactivate: '\uBE44\uD65C\uC131\uD654',
                deactivateCard: '\uCE74\uB4DC \uBE44\uD65C\uC131\uD654',
                deactivateConfirmation:
                    '\uC774 \uCE74\uB4DC\uB97C \uBE44\uD65C\uC131\uD654\uD558\uBA74 \uBAA8\uB4E0 \uBBF8\uB798\uC758 \uAC70\uB798\uAC00 \uAC70\uBD80\uB418\uBA70 \uCDE8\uC18C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            },
        },
        accounting: {
            settings: '\uC124\uC815',
            title: '\uC5F0\uACB0\uB4E4',
            subtitle:
                '\uD68C\uACC4 \uC2DC\uC2A4\uD15C\uC5D0 \uC5F0\uACB0\uD558\uC5EC \uACC4\uC815 \uCC28\uD2B8\uB85C \uAC70\uB798\uB97C \uCF54\uB4DC\uD654\uD558\uACE0, \uC790\uB3D9\uC73C\uB85C \uACB0\uC81C\uB97C \uB9E4\uCE6D\uD558\uBA70, \uC7AC\uBB34 \uC0C1\uD0DC\uB97C \uB3D9\uAE30\uD654\uD558\uC138\uC694.',
            qbo: '\uC628\uB77C\uC778 QuickBooks',
            qbd: 'QuickBooks \uB370\uC2A4\uD06C\uD1B1',
            xero: '\uC81C\uB85C',
            netsuite: 'NetSuite',
            nsqs: 'NSQS',
            intacct: '\uC138\uC774\uC9C0 \uC778\uD0DD\uD2B8',
            talkYourOnboardingSpecialist: '\uC124\uC815 \uC804\uBB38\uAC00\uC640 \uCC44\uD305\uD558\uC138\uC694.',
            talkYourAccountManager: '\uB2F9\uC2E0\uC758 \uACC4\uC815 \uAD00\uB9AC\uC790\uC640 \uCC44\uD305\uD558\uC138\uC694.',
            talkToConcierge: '\uCF69\uC2DC\uC5D0\uB974\uC9C0\uC640 \uB300\uD654\uD558\uAE30.',
            needAnotherAccounting: '\uB2E4\uB978 \uD68C\uACC4 \uC18C\uD504\uD2B8\uC6E8\uC5B4\uAC00 \uD544\uC694\uD558\uC2E0\uAC00\uC694?',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return '\uC628\uB77C\uC778 QuickBooks';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return '\uC81C\uB85C';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return 'NSQS';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return '\uC138\uC774\uC9C0 \uC778\uD0DD\uD2B8';
                    default: {
                        return "You didn't provide any text to translate. Please provide the text.";
                    }
                }
            },
            errorODIntegration: 'Expensify Classic\uC5D0\uC11C \uC124\uC815\uB41C \uC5F0\uACB0\uC5D0 \uC624\uB958\uAC00 \uC788\uC2B5\uB2C8\uB2E4.',
            goToODToFix: '\uC774 \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB824\uBA74 Expensify Classic\uC73C\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
            goToODToSettings: 'Expensify Classic\uC73C\uB85C \uC774\uB3D9\uD558\uC5EC \uC124\uC815\uC744 \uAD00\uB9AC\uD558\uC138\uC694.',
            setup: '\uC5F0\uACB0',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `\uB9C8\uC9C0\uB9C9 \uB3D9\uAE30\uD654 ${relativeDate}`,
            import: '\uAC00\uC838\uC624\uAE30',
            export: '\uB0B4\uBCF4\uB0B4\uAE30',
            advanced: '\uACE0\uAE09',
            other: '\uB2E4\uB978 \uD1B5\uD569\uB4E4',
            syncNow: '\uC9C0\uAE08 \uB3D9\uAE30\uD654',
            disconnect: '\uC5F0\uACB0 \uD574\uC81C',
            reinstall: '\uCEE4\uB125\uD130 \uC7AC\uC124\uCE58',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '\uD1B5\uD569';
                return `Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.';
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return 'NSQS\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'QuickBooks Desktop\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.';
                    default: {
                        return '\uD1B5\uD569\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.';
                    }
                }
            },
            accounts: '\uACC4\uC815 \uCC28\uD2B8',
            taxes: '\uC138\uAE08',
            imported: '\uC218\uC785\uB41C',
            notImported: '\uAC00\uC838\uC624\uC9C0 \uC54A\uC74C',
            importAsCategory: '\uCE74\uD14C\uACE0\uB9AC\uB85C \uAC00\uC838\uC634',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '\uC218\uC785\uB41C',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: '\uD0DC\uADF8\uB85C \uAC00\uC838\uC634',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '\uC218\uC785\uB41C',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '\uAC00\uC838\uC624\uC9C0 \uC54A\uC74C',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '\uAC00\uC838\uC624\uC9C0 \uC54A\uC74C',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: '\uBCF4\uACE0\uC11C \uD544\uB4DC\uB85C \uAC00\uC838\uC634',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite \uAE30\uBCF8 \uC9C1\uC6D0',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '\uC774 \uD1B5\uD569';
                return `\uC815\uB9D0\uB85C ${integrationName}\uC758 \uC5F0\uACB0\uC744 \uB04A\uC73C\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `\uC815\uB9D0\uB85C ${
                    CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '이 회계 통합'
                }\uC5D0 \uC5F0\uACB0\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC774 \uC791\uC5C5\uC744 \uC218\uD589\uD558\uBA74 \uAE30\uC874\uC758 \uBAA8\uB4E0 \uD68C\uACC4 \uC5F0\uACB0\uC774 \uC81C\uAC70\uB429\uB2C8\uB2E4.`,
            enterCredentials: '\uC790\uACA9 \uC99D\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '\uACE0\uAC1D \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '\uC9C1\uC6D0 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '\uACC4\uC815 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return '\uD074\uB798\uC2A4 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksOnlineImportLocations':
                            return '\uC704\uCE58 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksOnlineImportProcessing':
                            return '\uAC00\uC838\uC628 \uB370\uC774\uD130 \uCC98\uB9AC \uC911';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '\uBCF4\uC0C1 \uBCF4\uACE0\uC11C\uC640 \uCCAD\uAD6C \uACB0\uC81C \uB3D9\uAE30\uD654 \uC911';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '\uC138\uAE08 \uCF54\uB4DC \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online \uC5F0\uACB0 \uD655\uC778 \uC911';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks Online \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        case 'startingImportXero':
                            return 'Xero \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        case 'startingImportQBO':
                            return 'QuickBooks Online \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks \uB370\uC2A4\uD06C\uD1B1 \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksDesktopImportTitle':
                            return '\uC81C\uBAA9 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '\uC778\uC99D\uC11C \uAC00\uC838\uC624\uAE30 \uC2B9\uC778';
                        case 'quickbooksDesktopImportDimensions':
                            return '\uCC28\uC6D0 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '\uC800\uC7A5 \uC815\uCC45 \uAC00\uC838\uC624\uAE30';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'QuickBooks\uC640\uC758 \uB370\uC774\uD130 \uB3D9\uAE30\uD654\uAC00 \uC544\uC9C1 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4... Web Connector\uAC00 \uC2E4\uD589 \uC911\uC778\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online \uB370\uC774\uD130 \uB3D9\uAE30\uD654';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '\uB370\uC774\uD130 \uB85C\uB529 \uC911';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return '\uCE74\uD14C\uACE0\uB9AC \uC5C5\uB370\uC774\uD2B8 \uC911';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '\uACE0\uAC1D/\uD504\uB85C\uC81D\uD2B8 \uC5C5\uB370\uC774\uD2B8 \uC911';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '\uC0AC\uB78C \uBAA9\uB85D \uC5C5\uB370\uC774\uD2B8 \uC911';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return '\uBCF4\uACE0\uC11C \uD544\uB4DC \uC5C5\uB370\uC774\uD2B8 \uC911';
                        case 'jobDone':
                            return '\uAC00\uC838\uC628 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4';
                        case 'xeroSyncImportChartOfAccounts':
                            return '\uACC4\uC815 \uCC28\uD2B8 \uB3D9\uAE30\uD654 \uC911';
                        case 'xeroSyncImportCategories':
                            return '\uCE74\uD14C\uACE0\uB9AC \uB3D9\uAE30\uD654 \uC911';
                        case 'xeroSyncImportCustomers':
                            return '\uACE0\uAC1D \uB3D9\uAE30\uD654';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify \uBCF4\uACE0\uC11C\uB97C \uD658\uBD88\uB41C \uAC83\uC73C\uB85C \uD45C\uC2DC\uD558\uAE30';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero \uCCAD\uAD6C\uC11C\uC640 \uC1A1\uC7A5\uC744 \uC9C0\uBD88 \uC644\uB8CC\uB85C \uD45C\uC2DC\uD558\uAE30';
                        case 'xeroSyncImportTrackingCategories':
                            return '\uD2B8\uB798\uD0B9 \uCE74\uD14C\uACE0\uB9AC \uB3D9\uAE30\uD654 \uC911';
                        case 'xeroSyncImportBankAccounts':
                            return '\uC740\uD589 \uACC4\uC88C \uB3D9\uAE30\uD654';
                        case 'xeroSyncImportTaxRates':
                            return '\uC138\uAE08\uC728 \uB3D9\uAE30\uD654 \uC911';
                        case 'xeroCheckConnection':
                            return 'Xero \uC5F0\uACB0 \uD655\uC778 \uC911';
                        case 'xeroSyncTitle':
                            return 'Xero \uB370\uC774\uD130 \uB3D9\uAE30\uD654 \uC911';
                        case 'netSuiteSyncConnection':
                            return 'NetSuite\uC5D0 \uC5F0\uACB0\uC744 \uCD08\uAE30\uD654\uD558\uB294 \uC911';
                        case 'netSuiteSyncCustomers':
                            return '\uACE0\uAC1D \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncInitData':
                            return 'NetSuite\uC5D0\uC11C \uB370\uC774\uD130\uB97C \uAC80\uC0C9\uD558\uB294 \uC911';
                        case 'netSuiteSyncImportTaxes':
                            return '\uC218\uC785\uC138';
                        case 'netSuiteSyncImportItems':
                            return '\uD56D\uBAA9 \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncData':
                            return 'Expensify\uB85C \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncAccounts':
                        case 'nsqsSyncAccounts':
                            return '\uACC4\uC815 \uB3D9\uAE30\uD654 \uC911';
                        case 'netSuiteSyncCurrencies':
                            return '\uD1B5\uD654 \uB3D9\uAE30\uD654';
                        case 'netSuiteSyncCategories':
                            return '\uCE74\uD14C\uACE0\uB9AC \uB3D9\uAE30\uD654 \uC911';
                        case 'netSuiteSyncReportFields':
                            return 'Expensify \uBCF4\uACE0\uC11C \uD544\uB4DC\uB85C \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncTags':
                            return 'Expensify \uD0DC\uADF8\uB85C \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '\uC5F0\uACB0 \uC815\uBCF4 \uC5C5\uB370\uC774\uD2B8 \uC911';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify \uBCF4\uACE0\uC11C\uB97C \uD658\uBD88\uB41C \uAC83\uC73C\uB85C \uD45C\uC2DC\uD558\uAE30';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite \uCCAD\uAD6C\uC11C\uC640 \uC1A1\uC7A5\uC744 \uC9C0\uBD88 \uC644\uB8CC\uB85C \uD45C\uC2DC\uD558\uAE30';
                        case 'netSuiteImportVendorsTitle':
                            return '\uACF5\uAE09\uC5C5\uCCB4 \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteImportCustomListsTitle':
                            return '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncImportCustomLists':
                            return '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBAA9\uB85D \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '\uC790\uD68C\uC0AC \uAC00\uC838\uC624\uAE30';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '\uACF5\uAE09\uC5C5\uCCB4 \uAC00\uC838\uC624\uAE30';
                        case 'nsqsSyncConnection':
                            return 'NSQS\uC5D0 \uC5F0\uACB0\uC744 \uCD08\uAE30\uD654\uD558\uB294 \uC911';
                        case 'nsqsSyncEmployees':
                            return '\uC9C1\uC6D0 \uB3D9\uAE30\uD654';
                        case 'nsqsSyncCustomers':
                            return '\uACE0\uAC1D \uB3D9\uAE30\uD654';
                        case 'nsqsSyncProjects':
                            return '\uD504\uB85C\uC81D\uD2B8 \uB3D9\uAE30\uD654 \uC911';
                        case 'nsqsSyncCurrency':
                            return '\uD1B5\uD654 \uB3D9\uAE30\uD654';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct \uC5F0\uACB0 \uD655\uC778 \uC911';
                        case 'intacctImportDimensions':
                            return 'Sage Intacct \uCC28\uC6D0 \uAC00\uC838\uC624\uAE30';
                        case 'intacctImportTitle':
                            return 'Sage Intacct \uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `\uBC88\uC5ED\uC774 \uB204\uB77D\uB41C \uB2E8\uACC4: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '\uC120\uD638\uD558\uB294 \uC218\uCD9C\uC5C5\uC790',
            exportPreferredExporterNote:
                '\uC120\uD638\uD558\uB294 \uB0B4\uBCF4\uB0B4\uAE30 \uC0AC\uC6A9\uC790\uB294 \uC5B4\uB5A4 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uAD00\uB9AC\uC790\uB3C4 \uB420 \uC218 \uC788\uC9C0\uB9CC, \uB3C4\uBA54\uC778 \uC124\uC815\uC5D0\uC11C \uAC1C\uBCC4 \uD68C\uC0AC \uCE74\uB4DC\uC5D0 \uB300\uD574 \uB2E4\uB978 \uB0B4\uBCF4\uB0B4\uAE30 \uACC4\uC815\uC744 \uC124\uC815\uD55C \uACBD\uC6B0\uC5D0\uB294 \uB3C4\uBA54\uC778 \uAD00\uB9AC\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4.',
            exportPreferredExporterSubNote:
                '\uC124\uC815\uB418\uBA74, \uC120\uD638\uD558\uB294 \uC218\uCD9C\uC790\uB294 \uADF8\uB4E4\uC758 \uACC4\uC815\uC5D0\uC11C \uC218\uCD9C\uC744 \uC704\uD55C \uBCF4\uACE0\uC11C\uB97C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            exportAs: '\uB0B4\uBCF4\uB0B4\uAE30\uB85C',
            exportOutOfPocket: '\uC9C0\uCD9C \uB0B4\uC5ED\uC744 \uB0B4\uBCF4\uB0B4\uAE30',
            exportCompanyCard: '\uD68C\uC0AC \uCE74\uB4DC \uBE44\uC6A9\uC744 \uB0B4\uBCF4\uB0B4\uAE30\uB85C',
            exportDate: '\uC218\uCD9C \uB0A0\uC9DC',
            defaultVendor: '\uAE30\uBCF8 \uACF5\uAE09\uC5C5\uCCB4',
            autoSync: '\uC790\uB3D9 \uB3D9\uAE30\uD654',
            autoSyncDescription:
                '\uB9E4\uC77C \uC790\uB3D9\uC73C\uB85C NetSuite\uC640 Expensify\uB97C \uB3D9\uAE30\uD654\uD558\uC138\uC694. \uCD5C\uC885 \uBCF4\uACE0\uC11C\uB97C \uC2E4\uC2DC\uAC04\uC73C\uB85C \uB0B4\uBCF4\uB0B4\uC138\uC694.',
            reimbursedReports: 'Sync \uBCF4\uACE0\uC11C \uD658\uBD88',
            cardReconciliation: '\uCE74\uB4DC \uC815\uC0B0',
            reconciliationAccount: '\uC870\uC815 \uACC4\uC815',
            continuousReconciliation: '\uC9C0\uC18D\uC801\uC778 \uB300\uC870',
            saveHoursOnReconciliation:
                'Expensify\uAC00 \uC9C0\uC18D\uC801\uC73C\uB85C Expensify Card \uBA85\uC138\uC11C\uC640 \uACB0\uC0B0\uC744 \uB300\uC2E0\uD558\uC5EC \uC870\uC815\uD574\uC8FC\uBBC0\uB85C \uB9E4 \uD68C\uACC4 \uAE30\uAC04\uB9C8\uB2E4 \uBA87 \uC2DC\uAC04\uC744 \uC808\uC57D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            enableContinuousReconciliation: '\uC9C0\uC18D\uC801\uC778 \uB300\uC870\uB97C \uAC00\uB2A5\uD558\uAC8C \uD558\uB824\uBA74, \uD65C\uC131\uD654\uD574 \uC8FC\uC138\uC694',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensify Card \uACB0\uC81C\uAC00 \uB300\uC870\uB420 \uC740\uD589 \uACC4\uC88C\uB97C \uC120\uD0DD\uD558\uC138\uC694.',
                accountMatches: '\uC774 \uACC4\uC815\uC774 \uB2F9\uC2E0\uC758 \uACC4\uC815\uACFC \uC77C\uCE58\uD558\uB294\uC9C0 \uD655\uC778\uD558\uC138\uC694',
                settlementAccount: 'Expensify Card \uC815\uC0B0 \uACC4\uC88C',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) =>
                    `(${lastFourPAN}\uC73C\uB85C \uB05D\uB098\uB294) \uC774\uC5B4\uC11C \uC9C0\uC18D\uC801\uC778 \uB300\uC870\uAC00 \uC81C\uB300\uB85C \uC791\uB3D9\uD558\uB3C4\uB85D \uD569\uB2C8\uB2E4.`,
            },
        },
        export: {
            notReadyHeading: '\uB0B4\uBCF4\uB0B4\uAE30 \uC900\uBE44\uAC00 \uC544\uC9C1 \uC548 \uB410\uC2B5\uB2C8\uB2E4',
            notReadyDescription:
                '\uC784\uC2DC \uB610\uB294 \uBCF4\uB958 \uC911\uC778 \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB294 \uD68C\uACC4 \uC2DC\uC2A4\uD15C\uC73C\uB85C \uB0B4\uBCF4\uB0BC \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC774\uB7EC\uD55C \uBE44\uC6A9\uC744 \uB0B4\uBCF4\uB0B4\uAE30 \uC804\uC5D0 \uC2B9\uC778\uD558\uAC70\uB098 \uC9C0\uBD88\uD574 \uC8FC\uC138\uC694.',
        },
        invoices: {
            sendInvoice: '\uC1A1\uC7A5 \uBCF4\uB0B4\uAE30',
            sendFrom: '\uBCF4\uB0B4\uB294 \uC0AC\uB78C\uC5D0\uC11C',
            invoicingDetails: '\uCCAD\uAD6C \uC138\uBD80 \uC815\uBCF4',
            invoicingDetailsDescription: '\uC774 \uC815\uBCF4\uB294 \uADC0\uD558\uC758 \uCCAD\uAD6C\uC11C\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.',
            companyName: '\uD68C\uC0AC \uC774\uB984',
            companyWebsite: '\uD68C\uC0AC \uC6F9\uC0AC\uC774\uD2B8',
            paymentMethods: {
                personal: '\uAC1C\uC778\uC801\uC778',
                business: '\uBE44\uC988\uB2C8\uC2A4',
                chooseInvoiceMethod: '\uC544\uB798\uC5D0\uC11C \uACB0\uC81C \uBC29\uBC95\uC744 \uC120\uD0DD\uD558\uC138\uC694:',
                addBankAccount: '\uC740\uD589 \uACC4\uC88C \uCD94\uAC00',
                payingAsIndividual: '\uAC1C\uC778\uC73C\uB85C \uACB0\uC81C\uD558\uAE30',
                payingAsBusiness: '\uBE44\uC988\uB2C8\uC2A4\uB85C \uACB0\uC81C\uD558\uAE30',
            },
            invoiceBalance: '\uC1A1\uC7A5 \uC794\uC561',
            invoiceBalanceSubtitle:
                '\uC774\uAC83\uC740 \uCCAD\uAD6C\uC11C \uACB0\uC81C\uB97C \uC218\uC9D1\uD558\uC5EC \uC5BB\uC740 \uD604\uC7AC \uC794\uC561\uC785\uB2C8\uB2E4. \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uC168\uB2E4\uBA74 \uC790\uB3D9\uC73C\uB85C \uC774\uCCB4\uB429\uB2C8\uB2E4.',
            bankAccountsSubtitle: '\uC1A1\uC7A5 \uACB0\uC81C\uB97C \uD558\uAC70\uB098 \uBC1B\uC73C\uB824\uBA74 \uC740\uD589 \uACC4\uC88C\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
        },
        invite: {
            member: '\uBA64\uBC84 \uCD08\uB300',
            members: '\uBA64\uBC84 \uCD08\uB300\uD558\uAE30',
            invitePeople: '\uC0C8 \uBA64\uBC84\uB97C \uCD08\uB300\uD558\uC138\uC694',
            genericFailureMessage:
                '\uBA64\uBC84\uB97C \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uCD08\uB300\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            pleaseEnterValidLogin: `\uC774\uBA54\uC77C \uB610\uB294 \uC804\uD654\uBC88\uD638\uAC00 \uC720\uD6A8\uD55C\uC9C0 \uD655\uC778\uD558\uC2ED\uC2DC\uC624 (\uC608: ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: '\uC0AC\uC6A9\uC790',
            users: '\uC0AC\uC6A9\uC790\uB4E4',
            invited: '\uCD08\uB300\uB428',
            removed: '\uC81C\uAC70\uB428',
            to: '\uC5D0',
            from: '\uC5D0\uC11C',
        },
        inviteMessage: {
            confirmDetails: '\uC138\uBD80 \uC0AC\uD56D \uD655\uC778',
            inviteMessagePrompt:
                '\uC544\uB798\uC5D0 \uBA54\uC2DC\uC9C0\uB97C \uCD94\uAC00\uD558\uC5EC \uCD08\uB300\uC7A5\uC744 \uB354\uC6B1 \uD2B9\uBCC4\uD558\uAC8C \uB9CC\uB4DC\uC138\uC694!',
            personalMessagePrompt: '\uBA54\uC2DC\uC9C0',
            genericFailureMessage:
                '\uBA64\uBC84\uB97C \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uCD08\uB300\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            inviteNoMembersError: '\uC801\uC5B4\uB3C4 \uD55C \uBA85\uC758 \uBA64\uBC84\uB97C \uCD08\uB300\uD558\uB824\uBA74 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
        },
        distanceRates: {
            oopsNotSoFast: '\uC774\uB7F0! \uB108\uBB34 \uBE60\uB974\uB124\uC694...',
            workspaceNeeds:
                '\uC791\uC5C5 \uACF5\uAC04\uC5D0\uB294 \uC801\uC5B4\uB3C4 \uD558\uB098\uC758 \uD65C\uC131\uD654\uB41C \uAC70\uB9AC \uBE44\uC728\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
            distance: '\uAC70\uB9AC',
            centrallyManage:
                '\uC911\uC559\uC5D0\uC11C \uC694\uAE08\uC744 \uAD00\uB9AC\uD558\uACE0, \uB9C8\uC77C \uB610\uB294 \uD0AC\uB85C\uBBF8\uD130\uB85C \uCD94\uC801\uD558\uBA70, \uAE30\uBCF8 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC124\uC815\uD558\uC138\uC694.',
            rate: '\uD3C9\uAC00',
            addRate: '\uC694\uAE08 \uCD94\uAC00',
            trackTax: '\uC138\uAE08 \uCD94\uC801',
            deleteRates: () => ({
                one: '\uC0AD\uC81C\uC728',
                other: '\uC0AD\uC81C \uBE44\uC728',
            }),
            enableRates: () => ({
                one: '\uBE44\uC728 \uD65C\uC131\uD654',
                other: '\uC694\uAE08 \uD65C\uC131\uD654',
            }),
            disableRates: () => ({
                one: '\uBE44\uC728 \uBE44\uD65C\uC131\uD654',
                other: '\uC694\uAE08 \uBE44\uD65C\uC131\uD654',
            }),
            enableRate: '\uBE44\uC728 \uD65C\uC131\uD654',
            status: '\uC0C1\uD0DC',
            unit: '\uB2E8\uC704',
            taxFeatureNotEnabledMessage:
                '\uC774 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uC138\uAE08\uC774 \uD65C\uC131\uD654\uB418\uC5B4\uC57C \uD569\uB2C8\uB2E4. \uC774\uACF3\uC73C\uB85C \uC774\uB3D9\uD558\uC138\uC694.',
            changePromptMessage: '\uADF8 \uBCC0\uACBD\uC744 \uD558\uB824\uBA74.',
            deleteDistanceRate: '\uAC70\uB9AC \uBE44\uC728 \uC0AD\uC81C',
            areYouSureDelete: () => ({
                one: '\uC774 \uC694\uAE08\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
                other: '\uC774 \uC694\uAE08\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            }),
        },
        editor: {
            descriptionInputLabel: '\uC124\uBA85',
            nameInputLabel: '\uC774\uB984',
            typeInputLabel: '\uD0C0\uC785',
            initialValueInputLabel: '\uCD08\uAE30 \uAC12',
            nameInputHelpText: '\uC774\uAC83\uC740 \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uBCFC \uC218 \uC788\uB294 \uC774\uB984\uC785\uB2C8\uB2E4.',
            nameIsRequiredError: '\uB2F9\uC2E0\uC758 \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uC774\uB984\uC744 \uC9C0\uC815\uD574\uC57C \uD569\uB2C8\uB2E4.',
            currencyInputLabel: '\uAE30\uBCF8 \uD1B5\uD654',
            currencyInputHelpText: '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0\uC11C\uC758 \uBAA8\uB4E0 \uBE44\uC6A9\uC740 \uC774 \uD1B5\uD654\uB85C \uBCC0\uD658\uB429\uB2C8\uB2E4.',
            currencyInputDisabledText:
                '\uAE30\uBCF8 \uD1B5\uD654\uB294 \uC774 \uC791\uC5C5 \uACF5\uAC04\uC774 USD \uC740\uD589 \uACC4\uC88C\uC5D0 \uC5F0\uACB0\uB418\uC5B4 \uC788\uAE30 \uB54C\uBB38\uC5D0 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            save: '\uC800\uC7A5',
            genericFailureMessage:
                '\uC791\uC5C5 \uACF5\uAC04\uC744 \uC5C5\uB370\uC774\uD2B8\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            avatarUploadFailureMessage:
                '\uC544\uBC14\uD0C0\uB97C \uC5C5\uB85C\uB4DC\uD558\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            addressContext:
                'Expensify Travel\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 Workspace \uC8FC\uC18C\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uADC0\uD558\uC758 \uC0AC\uC5C5\uACFC \uAD00\uB828\uB41C \uC8FC\uC18C\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        },
        bankAccount: {
            continueWithSetup: '\uC124\uC815\uC744 \uACC4\uC18D\uD558\uC138\uC694',
            youreAlmostDone:
                '\uB2F9\uC2E0\uC758 \uC740\uD589 \uACC4\uC88C \uC124\uC815\uC774 \uAC70\uC758 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC774\uB97C \uD1B5\uD574 \uAE30\uC5C5 \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD558\uACE0, \uBE44\uC6A9\uC744 \uD658\uBD88\uD558\uBA70, \uCCAD\uAD6C\uC11C\uB97C \uC218\uC9D1\uD558\uACE0, \uCCAD\uAD6C\uC11C\uB97C \uC9C0\uBD88\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            streamlinePayments: '\uC9C0\uBD88 \uACFC\uC815\uC744 \uAC04\uC18C\uD654\uD558\uC138\uC694',
            connectBankAccountNote:
                '\uCC38\uACE0: \uAC1C\uC778 \uC740\uD589 \uACC4\uC88C\uB294 \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uB300\uD55C \uACB0\uC81C\uC5D0 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            oneMoreThing: '\uD55C \uAC00\uC9C0 \uB354!',
            allSet: '\uBAA8\uB450 \uC124\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
            accountDescriptionWithCards:
                '\uC774 \uC740\uD589 \uACC4\uC88C\uB294 \uBC95\uC778 \uCE74\uB4DC\uB97C \uBC1C\uAE09\uD558\uACE0, \uBE44\uC6A9\uC744 \uD658\uBD88\uD558\uBA70, \uCCAD\uAD6C\uC11C\uB97C \uC218\uC9D1\uD558\uACE0, \uCCAD\uAD6C\uC11C\uB97C \uC9C0\uBD88\uD558\uB294 \uB370 \uC0AC\uC6A9\uB429\uB2C8\uB2E4.',
            letsFinishInChat: '\uCC44\uD305\uC5D0\uC11C \uB9C8\uBB34\uB9AC\uD558\uC790!',
            almostDone: '\uAC70\uC758 \uB2E4 \uB410\uC5B4\uC694!',
            disconnectBankAccount: '\uC740\uD589 \uACC4\uC88C \uC5F0\uACB0 \uD574\uC81C',
            noLetsStartOver: '\uC544\uB2C8\uC694, \uB2E4\uC2DC \uC2DC\uC791\uD569\uC2DC\uB2E4',
            startOver: '\uB2E4\uC2DC \uC2DC\uC791\uD558\uC138\uC694',
            yesDisconnectMyBankAccount: '\uB124, \uC81C \uC740\uD589 \uACC4\uC88C\uB97C \uC5F0\uACB0 \uD574\uC81C\uD574 \uC8FC\uC138\uC694',
            yesStartOver: '\uB124, \uB2E4\uC2DC \uC2DC\uC791\uD558\uC138\uC694',
            disconnectYour: '\uB2F9\uC2E0\uC758 \uC5F0\uACB0\uC744 \uB04A\uC73C\uC138\uC694',
            bankAccountAnyTransactions:
                '\uC740\uD589 \uACC4\uC88C\uC785\uB2C8\uB2E4. \uC774 \uACC4\uC88C\uC5D0 \uB300\uD55C \uBBF8\uACB0\uC81C \uAC70\uB798\uB294 \uACC4\uC18D \uC644\uB8CC\uB420 \uAC83\uC785\uB2C8\uB2E4.',
            clearProgress: '\uCC98\uC74C\uBD80\uD130 \uC2DC\uC791\uD558\uBA74 \uC9C0\uAE08\uAE4C\uC9C0\uC758 \uC9C4\uD589 \uC0C1\uD669\uC774 \uBAA8\uB450 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4.',
            areYouSure: '\uD655\uC2E4\uD558\uC138\uC694?',
            workspaceCurrency: '\uC791\uC5C5 \uACF5\uAC04 \uD654\uD3D0',
            updateCurrencyPrompt:
                '\uD604\uC7AC \uC791\uC5C5 \uACF5\uAC04\uC774 USD\uAC00 \uC544\uB2CC \uB2E4\uB978 \uD1B5\uD654\uB85C \uC124\uC815\uB418\uC5B4 \uC788\uB294 \uAC83 \uAC19\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC5EC \uD1B5\uD654\uB97C \uC9C0\uAE08 \uBC14\uB85C USD\uB85C \uC5C5\uB370\uC774\uD2B8\uD574 \uC8FC\uC138\uC694.',
            updateToUSD: 'USD\uB85C \uC5C5\uB370\uC774\uD2B8',
        },
        changeOwner: {
            changeOwnerPageTitle: '\uC18C\uC720\uAD8C \uC774\uC804',
            addPaymentCardTitle: '\uC18C\uC720\uAD8C\uC744 \uC774\uC804\uD558\uAE30 \uC704\uD574 \uACB0\uC81C \uCE74\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694',
            addPaymentCardButtonText: '\uC774\uC6A9 \uC57D\uAD00\uC744 \uC218\uB77D\uD558\uACE0 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694',
            addPaymentCardReadAndAcceptTextPart1: '\uC77D\uACE0 \uC218\uB77D\uD558\uC2ED\uC2DC\uC624',
            addPaymentCardReadAndAcceptTextPart2: '\uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uB294 \uC815\uCC45',
            addPaymentCardTerms: '\uC57D\uAD00',
            addPaymentCardPrivacy: '\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'PCI-DSS \uC900\uC218',
            addPaymentCardBankLevelEncrypt: '\uC740\uD589 \uC218\uC900\uC758 \uC554\uD638\uD654',
            addPaymentCardRedundant: '\uC911\uBCF5 \uC778\uD504\uB77C\u0441\u0442\u0440\u0443\u043A\uCC98',
            addPaymentCardLearnMore: '\uC6B0\uB9AC\uC5D0 \uB300\uD574 \uB354 \uC54C\uC544\uBCF4\uAE30',
            addPaymentCardSecurity: '\uBCF4\uC548',
            amountOwedTitle: '\uBBF8\uACB0\uC81C \uC794\uC561',
            amountOwedButtonText: '"OK"',
            amountOwedText:
                '\uC774 \uACC4\uC815\uC740 \uC774\uC804 \uB2EC\uC5D0 \uBBF8\uACB0\uC81C\uB41C \uC794\uC561\uC774 \uC788\uC2B5\uB2C8\uB2E4.\n\n\uC774 \uC794\uC561\uC744 \uCCAD\uC0B0\uD558\uACE0 \uC774 \uC791\uC5C5 \uACF5\uAC04\uC758 \uCCAD\uAD6C\uB97C \uC778\uC218\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
            ownerOwesAmountTitle: '\uBBF8\uACB0\uC81C \uC794\uC561',
            ownerOwesAmountButtonText: '\uC794\uC561 \uC774\uCCB4',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC758 \uC18C\uC720 \uACC4\uC815(${email})\uC740 \uC774\uC804 \uB2EC\uC5D0 \uBBF8\uACB0\uC81C\uB41C \uC794\uC561\uC774 \uC788\uC2B5\uB2C8\uB2E4.\n\n\uC774 \uAE08\uC561(${amount})\uC744 \uC774\uC804\uD558\uC5EC \uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC758 \uCCAD\uAD6C\uB97C \uB9E1\uC73C\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uADC0\uD558\uC758 \uACB0\uC81C \uCE74\uB4DC\uB294 \uC989\uC2DC \uCCAD\uAD6C\uB429\uB2C8\uB2E4.`,
            subscriptionTitle: '\uC5F0\uAC04 \uAD6C\uB3C5\uC744 \uC778\uC218\uD558\uC2ED\uC2DC\uC624',
            subscriptionButtonText: '\uAD6C\uB3C5 \uC774\uC804',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC778\uC218\uD558\uBA74 \uC5F0\uAC04 \uAD6C\uB3C5\uC774 \uD604\uC7AC \uAD6C\uB3C5\uACFC \uBCD1\uD569\uB429\uB2C8\uB2E4. \uC774\uB85C \uC778\uD574 \uAD6C\uB3C5 \uD06C\uAE30\uAC00 ${usersCount}\uBA85\uC758 \uBA64\uBC84\uB85C \uC99D\uAC00\uD558\uC5EC \uC0C8\uB85C\uC6B4 \uAD6C\uB3C5 \uD06C\uAE30\uB294 ${finalCount}\uAC00 \uB429\uB2C8\uB2E4. \uACC4\uC18D\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`,
            duplicateSubscriptionTitle: '\uC911\uBCF5 \uAD6C\uB3C5 \uC54C\uB9BC',
            duplicateSubscriptionButtonText: '\uACC4\uC18D',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.\n\nClick "Continue" if you only want to take over billing for the workspace ${workspaceName}.\n\nIf you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: '\uC18C\uC720\uAD8C\uC744 \uC774\uC804\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            hasFailedSettlementsButtonText: '\uC54C\uACA0\uC2B5\uB2C8\uB2E4',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: '\uC794\uC561 \uC815\uC0B0\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4',
            failedToClearBalanceButtonText: '"OK"',
            failedToClearBalanceText: '\uC794\uC561\uC744 \uC815\uC0B0\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
            successTitle: '\uC6B0\uD638\uD638! \uBAA8\uB450 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
            successDescription: '\uC774\uC81C \uC774 \uC791\uC5C5 \uACF5\uAC04\uC758 \uC18C\uC720\uC790\uC785\uB2C8\uB2E4.',
            errorTitle: '\uC774\uB7F0! \uB108\uBB34 \uBE60\uB974\uB124\uC694...',
            errorDescriptionPartOne:
                '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC758 \uC18C\uC720\uAD8C \uC774\uC804\uC5D0 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098, \uB610\uB294',
            errorDescriptionPartTwo: 'Concierge\uC5D0 \uC5F0\uB77D\uD558\uC138\uC694',
            errorDescriptionPartThree: '\uB3C4\uC6C0\uC744 \uC704\uD574.',
        },
        exportAgainModal: {
            title: '\uC870\uC2EC\uD558\uC138\uC694!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `\uB2E4\uC74C \uBCF4\uACE0\uC11C\uB4E4\uC740 \uC774\uBBF8 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}\uB85C \uB0B4\uBCF4\uB0B4\uC84C\uC2B5\uB2C8\uB2E4:\n\n${reportName}\n\n\uB2E4\uC2DC \uB0B4\uBCF4\uB0B4\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`,
            confirmText: '\uB124, \uB2E4\uC2DC \uB0B4\uBCF4\uB0B4\uAE30',
            cancelText: '\uCDE8\uC18C',
        },
        upgrade: {
            reportFields: {
                title: '\uBCF4\uACE0\uC11C \uD544\uB4DC',
                description: `Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan:
                    '\uBCF4\uACE0\uC11C \uD544\uB4DC\uB294 Control \uD50C\uB79C\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC73C\uBA70, \uC774\uB294 \uB2E4\uC74C\uC5D0\uC11C \uC2DC\uC791\uD569\uB2C8\uB2E4.',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: '\uC6B0\uB9AC\uC758 NetSuite \uD1B5\uD569\uC740 Control \uACC4\uD68D\uC5D0\uC11C\uB9CC \uAC00\uB2A5\uD558\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: '\uC138\uC774\uC9C0 \uC778\uD0DD\uD2B8',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan:
                    '\uC6B0\uB9AC\uC758 Sage Intacct \uD1B5\uD569\uC740 Control \uD50C\uB79C\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD558\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks \uB370\uC2A4\uD06C\uD1B1',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan:
                    '\uC6B0\uB9AC\uC758 QuickBooks Desktop \uD1B5\uD569\uC740 Control \uACC4\uD68D\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD558\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '\uACE0\uAE09 \uC2B9\uC778',
                description: `If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan:
                    '\uACE0\uAE09 \uC2B9\uC778\uC740 Control \uACC4\uD68D\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC73C\uBA70, \uC774\uB294 \uB2E4\uC74C\uC5D0\uC11C \uC2DC\uC791\uD569\uB2C8\uB2E4.',
            },
            categories: {
                title: '\uCE74\uD14C\uACE0\uB9AC',
                description: `Categories help you better organize expenses to keep track of where you're spending your money. Use our suggested categories list or create your own.`,
                onlyAvailableOnPlan: '\uCE74\uD14C\uACE0\uB9AC\uB294 Collect \uD50C\uB79C\uC5D0\uC11C \uC2DC\uC791\uD558\uC5EC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            },
            glCodes: {
                title: 'GL \uCF54\uB4DC',
                description: `Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'GL \uCF54\uB4DC\uB294 Control \uD50C\uB79C\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC73C\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            glAndPayrollCodes: {
                title: 'GL & \uAE09\uC5EC \uCF54\uB4DC',
                description: `Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'GL & Payroll \uCF54\uB4DC\uB294 Control plan\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD558\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            taxCodes: {
                title: '\uC138\uAE08 \uCF54\uB4DC',
                description: `Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: '\uC138\uAE08 \uCF54\uB4DC\uB294 Control \uACC4\uD68D\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD558\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            companyCards: {
                title: '\uD68C\uC0AC \uCE74\uB4DC',
                description: `Connect your existing corporate cards to Expensify, assign them to employees, and automatically import transactions.`,
                onlyAvailableOnPlan: '\uD68C\uC0AC \uCE74\uB4DC\uB294 Control \uD50C\uB79C\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD558\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            rules: {
                title: '\uADDC\uCE59',
                description: `Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.\n\nRequire expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: '\uADDC\uCE59\uC740 Control \uD50C\uB79C\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD558\uBA70, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            perDiem: {
                title: '\uC77C\uB2F9',
                description:
                    '\uC77C\uB2F9\uC81C\uB294 \uC9C1\uC6D0\uB4E4\uC774 \uC5EC\uD589\uD560 \uB54C\uB9C8\uB2E4 \uC77C\uC77C \uBE44\uC6A9\uC744 \uC900\uC218\uD558\uACE0 \uC608\uCE21 \uAC00\uB2A5\uD558\uAC8C \uC720\uC9C0\uD558\uB294 \uB370 \uD6CC\uB96D\uD55C \uBC29\uBC95\uC785\uB2C8\uB2E4. \uC0AC\uC6A9\uC790 \uC815\uC758 \uC694\uAE08, \uAE30\uBCF8 \uCE74\uD14C\uACE0\uB9AC, \uADF8\uB9AC\uACE0 \uBAA9\uC801\uC9C0\uC640 \uD558\uC704 \uC694\uAE08\uACFC \uAC19\uC740 \uB354 \uC138\uBD80\uC801\uC778 \uC815\uBCF4\uC640 \uAC19\uC740 \uAE30\uB2A5\uC744 \uC990\uAE30\uC2ED\uC2DC\uC624.',
                onlyAvailableOnPlan: 'Per diem\uC740 Control \uACC4\uD68D\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC73C\uBA70, \uC2DC\uC791\uC740',
            },
            travel: {
                title: '\uC5EC\uD589',
                description:
                    'Expensify Travel\uC740 \uD68C\uC6D0\uC774 \uC219\uBC15, \uD56D\uACF5\uD3B8, \uAD50\uD1B5\uC218\uB2E8 \uB4F1\uC744 \uC608\uC57D\uD560 \uC218 \uC788\uB294 \uC0C8\uB85C\uC6B4 \uAE30\uC5C5 \uC5EC\uD589 \uC608\uC57D \uBC0F \uAD00\uB9AC \uD50C\uB7AB\uD3FC\uC785\uB2C8\uB2E4.',
                onlyAvailableOnPlan: 'Collect \uACC4\uD68D\uC5D0\uC11C \uC2DC\uC791\uD558\uB294 \uC5EC\uD589\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4, \uC2DC\uC791 \uAC00\uACA9\uC740',
            },
            pricing: {
                perActiveMember: '\uD65C\uC131 \uBA64\uBC84 \uB2F9 \uC6D4\uBCC4.',
            },
            note: {
                upgradeWorkspace: '\uC774 \uAE30\uB2A5\uC5D0 \uC811\uADFC\uD558\uB824\uBA74 \uC791\uC5C5 \uACF5\uAC04\uC744 \uC5C5\uADF8\uB808\uC774\uB4DC\uD558\uAC70\uB098,',
                learnMore: '\uB354 \uC54C\uC544\uBCF4\uAE30',
                aboutOurPlans: '\uC6B0\uB9AC\uC758 \uACC4\uD68D\uACFC \uAC00\uACA9\uC5D0 \uB300\uD574.',
            },
            upgradeToUnlock: '\uC774 \uAE30\uB2A5\uC744 \uC7A0\uAE08 \uD574\uC81C\uD558\uC2ED\uC2DC\uC624',
            completed: {
                headline: `You've upgraded your workspace!`,
                successMessage: ({policyName}: ReportPolicyNameParams) =>
                    `\uB2F9\uC2E0\uC740 \uC131\uACF5\uC801\uC73C\uB85C ${policyName}\uC744(\uB97C) \uCEE8\uD2B8\uB864 \uD50C\uB79C\uC73C\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC\uD588\uC2B5\uB2C8\uB2E4!`,
                categorizeMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can start booking and managing travel!`,
                viewSubscription: '\uAD6C\uB3C5 \uB0B4\uC5ED\uC744 \uD655\uC778\uD558\uC138\uC694',
                moreDetails: '\uC790\uC138\uD55C \uB0B4\uC6A9\uC740.',
                gotIt: '\uC54C\uACA0\uC2B5\uB2C8\uB2E4, \uAC10\uC0AC\uD569\uB2C8\uB2E4',
            },
            commonFeatures: {
                title: 'Control \uD50C\uB79C\uC73C\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC\uD558\uC2ED\uC2DC\uC624',
                note: '\uC6B0\uB9AC\uC758 \uAC00\uC7A5 \uAC15\uB825\uD55C \uAE30\uB2A5\uB4E4\uC744 \uD574\uC81C\uD558\uC138\uC694, \uD3EC\uD568\uD558\uC5EC:',
                benefits: {
                    startsAt: '\uC81C\uC5B4 \uACC4\uD68D\uC740 \uB2E4\uC74C\uC5D0\uC11C \uC2DC\uC791\uD569\uB2C8\uB2E4.',
                    perMember: '\uD65C\uC131 \uBA64\uBC84 \uB2F9 \uC6D4\uBCC4.',
                    learnMore: '\uB354 \uC54C\uC544\uBCF4\uAE30',
                    pricing: '\uC6B0\uB9AC\uC758 \uACC4\uD68D\uACFC \uAC00\uACA9\uC5D0 \uB300\uD574.',
                    benefit1: '\uACE0\uAE09 \uD68C\uACC4 \uC5F0\uACB0 (NetSuite, Sage Intacct \uB4F1)',
                    benefit2: '\uC2A4\uB9C8\uD2B8 \uC9C0\uCD9C \uADDC\uCE59',
                    benefit3: '\uB2E4\uC911 \uB808\uBCA8 \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0',
                    benefit4: '\uAC15\uD654\uB41C \uBCF4\uC548 \uCEE8\uD2B8\uB864',
                    toUpgrade: '\uC5C5\uADF8\uB808\uC774\uB4DC\uD558\uB824\uBA74 \uD074\uB9AD\uD558\uC138\uC694',
                    selectWorkspace: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC120\uD0DD\uD558\uACE0, \uD50C\uB79C \uC720\uD615\uC744 \uBCC0\uACBD\uD558\uC2ED\uC2DC\uC624',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Collect \uACC4\uD68D\uC73C\uB85C \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC',
                note: '\uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD558\uBA74 \uB2E4\uC74C\uACFC \uAC19\uC740 \uAE30\uB2A5\uC744 \uD3EC\uD568\uD558\uC5EC \uB354 \uC774\uC0C1 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uAC8C \uB429\uB2C8\uB2E4:',
                benefits: {
                    note: '\uC6B0\uB9AC\uC758 \uD50C\uB79C\uC744 \uC804\uCCB4\uC801\uC73C\uB85C \uBE44\uAD50\uD558\uB824\uBA74, \uC6B0\uB9AC\uC758\uB97C \uD655\uC778\uD574\uBCF4\uC138\uC694.',
                    pricingPage: '\uAC00\uACA9 \uD398\uC774\uC9C0',
                    confirm: '\uC815\uB9D0\uB85C \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD558\uACE0 \uC124\uC815\uC744 \uC81C\uAC70\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
                    warning: '\uC774\uAC83\uC740 \uCDE8\uC18C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
                    benefit1: '\uD68C\uACC4 \uC5F0\uACB0 (QuickBooks Online \uBC0F Xero \uC81C\uC678)',
                    benefit2: '\uC2A4\uB9C8\uD2B8 \uC9C0\uCD9C \uADDC\uCE59',
                    benefit3: '\uB2E4\uC911 \uB808\uBCA8 \uC2B9\uC778 \uC6CC\uD06C\uD50C\uB85C\uC6B0',
                    benefit4: '\uAC15\uD654\uB41C \uBCF4\uC548 \uCEE8\uD2B8\uB864',
                    headsUp: '\uC8FC\uC758\uD558\uC138\uC694!',
                    multiWorkspaceNote:
                        '\uB2F9\uC2E0\uC740 Collect \uC694\uAE08\uC81C\uB85C \uAD6C\uB3C5\uC744 \uC2DC\uC791\uD558\uAE30 \uC704\uD574 \uCCAB \uC6D4\uAC04 \uACB0\uC81C\uB97C \uD558\uAE30 \uC804\uC5D0 \uBAA8\uB4E0 \uC791\uC5C5 \uACF5\uAC04\uC744 \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD574\uC57C \uD569\uB2C8\uB2E4. \uD074\uB9AD\uD558\uC138\uC694.',
                    selectStep: '> \uAC01 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC120\uD0DD > \uD50C\uB79C \uC720\uD615\uC744 \uBCC0\uACBD\uD558\uC2ED\uC2DC\uC624',
                },
            },
            completed: {
                headline: '\uB2F9\uC2E0\uC758 \uC791\uC5C5 \uACF5\uAC04\uC774 \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
                description:
                    'Control \uD50C\uB79C\uC5D0 \uB2E4\uB978 \uC791\uC5C5 \uACF5\uAC04\uC774 \uC788\uC2B5\uB2C8\uB2E4. Collect \uC694\uAE08\uC73C\uB85C \uCCAD\uAD6C\uBC1B\uC73C\uB824\uBA74 \uBAA8\uB4E0 \uC791\uC5C5 \uACF5\uAC04\uC744 \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD574\uC57C \uD569\uB2C8\uB2E4.',
                gotIt: '\uC54C\uACA0\uC2B5\uB2C8\uB2E4, \uAC10\uC0AC\uD569\uB2C8\uB2E4',
            },
        },
        restrictedAction: {
            restricted: '\uC81C\uD55C\uB41C',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) =>
                `\uD604\uC7AC ${workspaceName} \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C\uC758 \uB3D9\uC791\uC740 \uC81C\uD55C\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC18C\uC720\uC790\uC778 ${workspaceOwnerName}\uB2D8\uC774 \uC0C8\uB85C\uC6B4 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uD65C\uB3D9\uC744 \uC7A0\uAE08 \uD574\uC81C\uD558\uAE30 \uC704\uD574 \uD30C\uC77C\uC5D0 \uC788\uB294 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uAC70\uB098 \uC5C5\uB370\uC774\uD2B8\uD574\uC57C \uD569\uB2C8\uB2E4.`,
            youWillNeedToAddOrUpdatePaymentCard:
                '\uC0C8\uB85C\uC6B4 \uC791\uC5C5 \uACF5\uAC04 \uD65C\uB3D9\uC744 \uD574\uC81C\uD558\uB824\uBA74 \uD30C\uC77C\uC5D0 \uC788\uB294 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uAC70\uB098 \uC5C5\uB370\uC774\uD2B8\uD574\uC57C \uD569\uB2C8\uB2E4.',
            addPaymentCardToUnlock: '\uC7A0\uAE08\uC744 \uD574\uC81C\uD558\uB824\uBA74 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694!',
            addPaymentCardToContinueUsingWorkspace:
                '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uACC4\uC18D \uC0AC\uC6A9\uD558\uB824\uBA74 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694',
            pleaseReachOutToYourWorkspaceAdmin:
                '\uBAA8\uB4E0 \uC9C8\uBB38\uC5D0 \uB300\uD574 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.',
            chatWithYourAdmin: '\uAD00\uB9AC\uC790\uC640 \uCC44\uD305\uD558\uC138\uC694',
            chatInAdmins: '#admins\uC5D0\uC11C \uCC44\uD305\uD558\uAE30',
            addPaymentCard: '\uACB0\uC81C \uCE74\uB4DC \uCD94\uAC00',
        },
        rules: {
            individualExpenseRules: {
                title: '\uBE44\uC6A9',
                subtitle:
                    '\uAC1C\uBCC4 \uBE44\uC6A9\uC5D0 \uB300\uD55C \uC9C0\uCD9C \uC81C\uC5B4 \uBC0F \uAE30\uBCF8\uAC12\uC744 \uC124\uC815\uD558\uC138\uC694. \uB610\uD55C ${username}\uC5D0 \uB300\uD55C \uADDC\uCE59\uC744 \uB9CC\uB4E4 \uC218\uB3C4 \uC788\uC2B5\uB2C8\uB2E4.',
                receiptRequiredAmount: '\uC601\uC218\uC99D \uD544\uC694 \uAE08\uC561',
                receiptRequiredAmountDescription:
                    '\uC774 \uAE08\uC561\uC744 \uCD08\uACFC\uD558\uC5EC \uC9C0\uCD9C\uD560 \uB54C\uB294 \uCE74\uD14C\uACE0\uB9AC \uADDC\uCE59\uC5D0 \uC758\uD574 \uC7AC\uC815\uC758\uB418\uC9C0 \uC54A\uB294 \uD55C \uC601\uC218\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
                maxExpenseAmount: '\uCD5C\uB300 \uC9C0\uCD9C \uAE08\uC561',
                maxExpenseAmountDescription:
                    '\uC774 \uAE08\uC561\uC744 \uCD08\uACFC\uD558\uB294 \uD50C\uB798\uADF8 \uC18C\uBE44\uB97C \uD45C\uC2DC\uD558\uC2ED\uC2DC\uC624, \uCE74\uD14C\uACE0\uB9AC \uADDC\uCE59\uC5D0 \uC758\uD574 \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uB294 \uD55C.',
                maxAge: '\uCD5C\uB300 \uB098\uC774',
                maxExpenseAge: '\uCD5C\uB300 \uC9C0\uCD9C \uAE30\uAC04',
                maxExpenseAgeDescription: '\uD2B9\uC815 \uC77C\uC218\uBCF4\uB2E4 \uC624\uB798\uB41C \uD50C\uB798\uADF8 \uC18C\uBE44.',
                maxExpenseAgeDays: () => ({
                    one: '1\uC77C',
                    other: (count: number) => `${count} days`,
                }),
                billableDefault: '\uCCAD\uAD6C \uAC00\uB2A5\uD55C \uAE30\uBCF8\uAC12',
                billableDefaultDescription:
                    '\uAE30\uBCF8\uC801\uC73C\uB85C \uD604\uAE08 \uBC0F \uC2E0\uC6A9\uCE74\uB4DC \uC9C0\uCD9C\uC774 \uCCAD\uAD6C \uAC00\uB2A5\uD55C\uC9C0 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624. \uCCAD\uAD6C \uAC00\uB2A5\uD55C \uBE44\uC6A9\uC740',
                billable: '\uCCAD\uAD6C \uAC00\uB2A5\uD55C',
                billableDescription: '\uBE44\uC6A9\uC740 \uB300\uBD80\uBD84 \uACE0\uAC1D\uC5D0\uAC8C \uC7AC\uCCAD\uAD6C\uB429\uB2C8\uB2E4',
                nonBillable: '\uBE44 \uCCAD\uAD6C \uAC00\uB2A5',
                nonBillableDescription: '\uBE44\uC6A9\uC740 \uAC00\uB054 \uACE0\uAC1D\uC5D0\uAC8C \uC7AC\uCCAD\uAD6C\uB429\uB2C8\uB2E4',
                eReceipts: 'e\uC601\uC218\uC99D',
                eReceiptsHint: 'eReceipts\uB294 \uC790\uB3D9\uC73C\uB85C \uC0DD\uC131\uB429\uB2C8\uB2E4',
                eReceiptsHintLink: '\uB300\uBD80\uBD84\uC758 USD \uC2E0\uC6A9 \uAC70\uB798\uC5D0 \uB300\uD574',
            },
            expenseReportRules: {
                examples:
                    '1. English: "Hello, ${username}! You have ${count} new messages."\n   Korean: "\uC548\uB155\uD558\uC138\uC694, ${username}\uB2D8! ${count}\uAC1C\uC758 \uC0C8 \uBA54\uC2DC\uC9C0\uAC00 \uC788\uC2B5\uB2C8\uB2E4."\n\n2. English: "The operation was ${someBoolean ? \'successful\' : \'unsuccessful\'}."\n   Korean: "\uC791\uC5C5\uC774 ${someBoolean ? \'\uC131\uACF5\uC801\uC73C\uB85C \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4\' : \'\uC2E4\uD328\uD558\uC600\uC2B5\uB2C8\uB2E4\'}."\n\n3. English: "You have selected ${choice ? \'option A\' : \'option B\'}."\n   Korean: "\uC120\uD0DD\uD558\uC2E0 \uAC83\uC740 ${choice ? \'\uC635\uC158 A\' : \'\uC635\uC158 B\'}\uC785\uB2C8\uB2E4."\n\n4. English: " "\n   Korean: " "\n\n5. English: "Welcome back, ${username}! Your last visit was on ${date}."\n   Korean: "\uB2E4\uC2DC \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4, ${username}\uB2D8! \uB9C8\uC9C0\uB9C9 \uBC29\uBB38\uC77C\uC740 ${date}\uC785\uB2C8\uB2E4."\n\n6. English: "You have ${count} items in your shopping cart."\n   Korean: "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 ${count}\uAC1C\uC758 \uC0C1\uD488\uC774 \uC788\uC2B5\uB2C8\uB2E4."',
                title: '\uBE44\uC6A9 \uBCF4\uACE0\uC11C',
                subtitle: '\uBE44\uC6A9 \uBCF4\uACE0\uC11C \uC900\uC218, \uC2B9\uC778, \uBC0F \uC9C0\uBD88\uC744 \uC790\uB3D9\uD654\uD558\uC2ED\uC2DC\uC624.',
                customReportNamesTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBCF4\uACE0\uC11C \uC774\uB984',
                customReportNamesSubtitle:
                    '\uC6B0\uB9AC\uC758 \uAD11\uBC94\uC704\uD55C \uACF5\uC2DD\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC0AC\uC6A9\uC790 \uC815\uC758 \uC774\uB984\uC744 \uB9CC\uB4DC\uC138\uC694.',
                customNameTitle: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC774\uB984',
                customNameDescription:
                    '\uC6B0\uB9AC\uC758 \uC11C\uBE44\uC2A4\uB97C \uC0AC\uC6A9\uD558\uC5EC \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD55C \uC0AC\uC6A9\uC790 \uC815\uC758 \uC774\uB984\uC744 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624.',
                customNameDescriptionLink: '\uAD11\uBC94\uC704\uD55C \uACF5\uC2DD\uB4E4',
                customNameInputLabel: '\uC774\uB984',
                customNameEmailPhoneExample: '\uD68C\uC6D0\uC758 \uC774\uBA54\uC77C \uB610\uB294 \uC804\uD654: {report:submit:from}',
                customNameStartDateExample: '\uBCF4\uACE0\uC11C \uC2DC\uC791 \uB0A0\uC9DC: {report:startdate}',
                customNameWorkspaceNameExample: '\uC791\uC5C5 \uACF5\uAC04 \uC774\uB984: {report:policyname}',
                customNameReportIDExample: '\uBCF4\uACE0\uC11C ID: {report:id}',
                customNameTotalExample: '\uCD1D\uACC4: {report:total}.',
                preventMembersFromChangingCustomNamesTitle:
                    '\uC0AC\uC6A9\uC790 \uC815\uC758 \uBCF4\uACE0\uC11C \uC774\uB984 \uBCC0\uACBD\uC744 \uD68C\uC6D0\uB4E4\uC774 \uD560 \uC218 \uC5C6\uAC8C \uD558\uC138\uC694',
                preventSelfApprovalsTitle: '\uC790\uCCB4 \uC2B9\uC778 \uBC29\uC9C0',
                preventSelfApprovalsSubtitle:
                    '\uC790\uC2E0\uC758 \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB97C \uC2B9\uC778\uD558\uB294 \uAC83\uC744 \uC791\uC5C5 \uACF5\uAC04 \uBA64\uBC84\uAC00 \uBC29\uC9C0\uD558\uC2ED\uC2DC\uC624.',
                autoApproveCompliantReportsTitle: '\uADDC\uC815 \uC900\uC218 \uBCF4\uACE0\uC11C \uC790\uB3D9 \uC2B9\uC778',
                autoApproveCompliantReportsSubtitle: '\uC790\uB3D9 \uC2B9\uC778\uC5D0 \uC801\uD569\uD55C \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB97C \uC124\uC815\uD558\uC138\uC694.',
                autoApproveReportsUnderTitle: '\uBCF4\uACE0\uC11C \uC790\uB3D9 \uC2B9\uC778, \uAE30\uC900 \uC774\uD558',
                autoApproveReportsUnderDescription:
                    '\uC774 \uAE08\uC561 \uC774\uD558\uC758 \uC644\uC804\uD788 \uC900\uC218\uB41C \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB294 \uC790\uB3D9\uC73C\uB85C \uC2B9\uC778\uB429\uB2C8\uB2E4.',
                randomReportAuditTitle: '\uBB34\uC791\uC704 \uBCF4\uACE0\uC11C \uAC10\uC0AC',
                randomReportAuditDescription:
                    '\uC77C\uBD80 \uBCF4\uACE0\uC11C\uB294 \uC790\uB3D9 \uC2B9\uC778\uC5D0 \uC801\uD569\uD558\uB354\uB77C\uB3C4 \uC218\uB3D9\uC73C\uB85C \uC2B9\uC778\uD574\uC57C \uD569\uB2C8\uB2E4.',
                autoPayApprovedReportsTitle: '\uC790\uB3D9 \uACB0\uC81C \uC2B9\uC778 \uBCF4\uACE0\uC11C',
                autoPayApprovedReportsSubtitle: '\uC790\uB3D9 \uC9C0\uBD88\uC5D0 \uC801\uD569\uD55C \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB97C \uC124\uC815\uD558\uC138\uC694.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle:
                    '\uB354 \uB9CE\uC740 \uAE30\uB2A5\uC73C\uB85C \uC774\uB3D9\uD558\uC5EC \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uD65C\uC131\uD654\uD55C \uB2E4\uC74C, \uC774 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uACB0\uC81C\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
                autoPayReportsUnderTitle: '\uC790\uB3D9 \uACB0\uC81C \uBCF4\uACE0\uC11C \uC544\uB798\uC5D0',
                autoPayReportsUnderDescription:
                    '\uC774 \uAE08\uC561 \uC774\uD558\uC758 \uC644\uC804 \uC900\uC218 \uBE44\uC6A9 \uBCF4\uACE0\uC11C\uB294 \uC790\uB3D9\uC73C\uB85C \uC9C0\uBD88\uB429\uB2C8\uB2E4.',
                unlockFeatureGoToSubtitle: '\uAC00\uB2E4',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `\uADF8\uB9AC\uACE0 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uD65C\uC131\uD654\uD55C \uB2E4\uC74C, \uC774 \uAE30\uB2A5\uC744 \uD574\uC81C\uD558\uB824\uBA74 ${featureName}\uC744 \uCD94\uAC00\uD558\uC138\uC694.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) =>
                    `\uADF8\uB9AC\uACE0 \uC774 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 ${featureName}\uC744 \uD65C\uC131\uD654\uD558\uC138\uC694.`,
                preventSelfApprovalsModalText: ({managerEmail}: {managerEmail: string}) =>
                    `\uD604\uC7AC \uC790\uC2E0\uC758 \uBE44\uC6A9\uC744 \uC2B9\uC778\uD558\uACE0 \uC788\uB294 \uBAA8\uB4E0 \uBA64\uBC84\uB294 \uC81C\uAC70\uB418\uACE0 \uC774 \uC791\uC5C5 \uACF5\uAC04\uC758 \uAE30\uBCF8 \uC2B9\uC778\uC790(${managerEmail})\uB85C \uB300\uCCB4\uB429\uB2C8\uB2E4.`,
                preventSelfApprovalsConfirmButton: '\uC790\uCCB4 \uC2B9\uC778 \uBC29\uC9C0',
                preventSelfApprovalsModalTitle: '\uC790\uCCB4 \uC2B9\uC778\uC744 \uBC29\uC9C0\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
                preventSelfApprovalsDisabledSubtitle:
                    '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uCD5C\uC18C \uB450 \uBA85\uC758 \uBA64\uBC84\uAC00 \uC788\uC744 \uB54C\uAE4C\uC9C0 \uC790\uCCB4 \uC2B9\uC778\uC744 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            },
            categoryRules: {
                title: '\uCE74\uD14C\uACE0\uB9AC \uADDC\uCE59',
                approver: '\uC2B9\uC778\uC790',
                requireDescription: '\uC124\uBA85\uC774 \uD544\uC694\uD569\uB2C8\uB2E4',
                descriptionHint: '\uC124\uBA85 \uD78C\uD2B8',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `"\u201C${categoryName}\u201D \uC9C0\uCD9C\uC5D0 \uB300\uD55C \uCD94\uAC00 \uC815\uBCF4\uB97C \uC81C\uACF5\uD558\uB3C4\uB85D \uC9C1\uC6D0\uB4E4\uC5D0\uAC8C \uC54C\uB9BD\uB2C8\uB2E4. \uC774 \uD78C\uD2B8\uB294 \uBE44\uC6A9\uC5D0 \uB300\uD55C \uC124\uBA85 \uD544\uB4DC\uC5D0 \uB098\uD0C0\uB0A9\uB2C8\uB2E4.`,
                descriptionHintLabel: '\uD78C\uD2B8',
                descriptionHintSubtitle: '\uD504\uB85C \uD301: \uC9E7\uC744\uC218\uB85D \uC88B\uC2B5\uB2C8\uB2E4!',
                maxAmount: '\uCD5C\uB300 \uAE08\uC561',
                flagAmountsOver: '\uAE08\uC561 \uCD08\uACFC \uD50C\uB798\uADF8 \uC124\uC815',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `\uCE74\uD14C\uACE0\uB9AC "${categoryName}"\uC5D0 \uC801\uC6A9\uB429\uB2C8\uB2E4.`,
                flagAmountsOverSubtitle: '\uC774\uAC83\uC740 \uBAA8\uB4E0 \uBE44\uC6A9\uC5D0 \uB300\uD55C \uCD5C\uB300 \uAE08\uC561\uC744 \uBB34\uC2DC\uD569\uB2C8\uB2E4.',
                expenseLimitTypes: {
                    expense: '\uAC1C\uC778 \uBE44\uC6A9',
                    expenseSubtitle:
                        '\uCE74\uD14C\uACE0\uB9AC\uBCC4\uB85C \uBE44\uC6A9 \uAE08\uC561\uC744 \uD50C\uB798\uADF8\uD569\uB2C8\uB2E4. \uC774 \uADDC\uCE59\uC740 \uCD5C\uB300 \uBE44\uC6A9 \uAE08\uC561\uC5D0 \uB300\uD55C \uC77C\uBC18 \uC791\uC5C5 \uACF5\uAC04 \uADDC\uCE59\uC744 \uBB34\uC2DC\uD569\uB2C8\uB2E4.',
                    daily: '\uCE74\uD14C\uACE0\uB9AC \uCD1D\uACC4',
                    dailySubtitle: '\uBE44\uC6A9 \uBCF4\uACE0\uC11C\uBCC4 \uCD1D \uCE74\uD14C\uACE0\uB9AC \uC9C0\uCD9C\uC744 \uD50C\uB798\uADF8\uD569\uB2C8\uB2E4.',
                },
                requireReceiptsOver: '\uC601\uC218\uC99D\uC744 \uC694\uAD6C\uD558\uC2ED\uC2DC\uC624',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: '\uC601\uC218\uC99D\uC744 \uC694\uAD6C\uD558\uC9C0 \uB9C8\uC138\uC694',
                    always: '\uD56D\uC0C1 \uC601\uC218\uC99D\uC744 \uC694\uAD6C\uD558\uC138\uC694',
                },
                defaultTaxRate: '\uAE30\uBCF8 \uC138\uC728',
                goTo: '\uAC00\uB2E4',
                andEnableWorkflows:
                    '\uADF8\uB9AC\uACE0 \uC6CC\uD06C\uD50C\uB85C\uC6B0\uB97C \uD65C\uC131\uD654\uD55C \uB2E4\uC74C, \uC2B9\uC778\uC744 \uCD94\uAC00\uD558\uC5EC \uC774 \uAE30\uB2A5\uC744 \uD574\uC81C\uD558\uC138\uC694.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '\uC218\uC9D1',
                    description: '\uD504\uB85C\uC138\uC2A4\uB97C \uC790\uB3D9\uD654\uD558\uB824\uB294 \uD300\uC744 \uC704\uD574.',
                },
                corporate: {
                    label: '\uC81C\uC5B4',
                    description: '\uACE0\uAE09 \uC694\uAD6C\uC0AC\uD56D\uC744 \uAC00\uC9C4 \uC870\uC9C1\uC744 \uC704\uD574.',
                },
            },
            description:
                '\uB2F9\uC2E0\uC5D0\uAC8C \uB9DE\uB294 \uD50C\uB79C\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uAE30\uB2A5\uACFC \uAC00\uACA9\uC5D0 \uB300\uD55C \uC790\uC138\uD55C \uBAA9\uB85D\uC740 \uC6B0\uB9AC\uC758',
            subscriptionLink: '\uD50C\uB79C \uC720\uD615 \uBC0F \uAC00\uACA9 \uC124\uC815 \uB3C4\uC6C0\uB9D0 \uD398\uC774\uC9C0',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `\uB2F9\uC2E0\uC740 ${annualSubscriptionEndDate}\uAE4C\uC9C0 Control \uD50C\uB79C\uC758 1\uBA85\uC758 \uD65C\uC131 \uBA64\uBC84\uC5D0\uAC8C \uC57D\uC18D\uD588\uC2B5\uB2C8\uB2E4. \uC790\uB3D9 \uAC31\uC2E0\uC744 \uBE44\uD65C\uC131\uD654\uD568\uC73C\uB85C\uC368 ${annualSubscriptionEndDate}\uBD80\uD130 \uC0AC\uC6A9\uB7C9\uC5D0 \uB530\uB77C \uACB0\uC81C\uD558\uB294 \uAD6C\uB3C5\uC73C\uB85C \uC804\uD658\uD558\uACE0 Collect \uD50C\uB79C\uC73C\uB85C \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`,
                other: `\uB2F9\uC2E0\uC740 ${annualSubscriptionEndDate}\uAE4C\uC9C0 Control \uD50C\uB79C\uC758 ${count}\uBA85\uC758 \uD65C\uB3D9 \uBA64\uBC84\uC5D0\uAC8C \uC57D\uC18D\uD558\uC600\uC2B5\uB2C8\uB2E4. \uC790\uB3D9 \uAC31\uC2E0\uC744 \uBE44\uD65C\uC131\uD654\uD568\uC73C\uB85C\uC368 ${annualSubscriptionEndDate}\uBD80\uD130 \uC0AC\uC6A9\uB7C9\uC5D0 \uB530\uB77C \uACB0\uC81C\uD558\uB294 \uAD6C\uB3C5\uC73C\uB85C \uC804\uD658\uD558\uACE0 Collect \uD50C\uB79C\uC73C\uB85C \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC \uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`,
            }),
            subscriptions: '\uAD6C\uB3C5',
        },
    },
    getAssistancePage: {
        title: '\uB3C4\uC6C0 \uBC1B\uAE30',
        subtitle: '\uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC704\uB300\uD568\uC73C\uB85C\uC758 \uAE38\uC744 \uD130\uC8FC\uAE30 \uC704\uD574 \uC5EC\uAE30\uC5D0 \uC788\uC2B5\uB2C8\uB2E4!',
        description: '\uC544\uB798\uC758 \uC9C0\uC6D0 \uC635\uC158 \uC911\uC5D0\uC11C \uC120\uD0DD\uD558\uC138\uC694:',
        chatWithConcierge: '\uCF69\uC2DC\uC5D0\uB974\uC9C0\uC640 \uCC44\uD305\uD558\uAE30',
        scheduleSetupCall: '\uC124\uC815 \uD1B5\uD654\uB97C \uC608\uC57D\uD558\uC2ED\uC2DC\uC624',
        scheduleADemo: '\uB370\uBAA8 \uC77C\uC815 \uC124\uC815',
        questionMarkButtonTooltip: '\uC6B0\uB9AC \uD300\uC5D0\uC11C \uB3C4\uC6C0\uC744 \uBC1B\uC73C\uC138\uC694',
        exploreHelpDocs: '\uB3C4\uC6C0\uB9D0 \uBB38\uC11C \uD0D0\uC0C9',
    },
    emojiPicker: {
        skinTonePickerLabel: '\uAE30\uBCF8 \uC2A4\uD0A8 \uD1A4 \uBCC0\uACBD',
        headers: {
            frequentlyUsed: '\uC790\uC8FC \uC0AC\uC6A9\uD558\uB294',
            smileysAndEmotion: '\uC2A4\uB9C8\uC77C\uB9AC & \uAC10\uC815',
            peopleAndBody: '\uC0AC\uB78C & \uBAB8',
            animalsAndNature: '\uB3D9\uBB3C & \uC790\uC5F0',
            foodAndDrink: '\uC74C\uC2DD & \uC74C\uB8CC',
            travelAndPlaces: '\uC5EC\uD589 & \uC7A5\uC18C',
            activities: '\uD65C\uB3D9',
            objects: '\uAC1D\uCCB4\uB4E4',
            symbols: '\uC2EC\uBCFC\uB4E4',
            flags: '\uD50C\uB798\uADF8',
        },
    },
    newRoomPage: {
        newRoom: '\uC0C8\uB85C\uC6B4 \uBC29',
        groupName: '\uADF8\uB8F9 \uC774\uB984',
        roomName: '\uBC29 \uC774\uB984',
        visibility: '\uAC00\uC2DC\uC131',
        restrictedDescription: '\uADC0\uD558\uC758 \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uC788\uB294 \uC0AC\uB78C\uB4E4\uC740 \uC774 \uBC29\uC744 \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        privateDescription: '\uC774 \uBC29\uC5D0 \uCD08\uB300\uB41C \uC0AC\uB78C\uB4E4\uC740 \uC774\uB97C \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        publicDescription: '\uB204\uAD6C\uB098 \uC774 \uBC29\uC744 \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '\uB204\uAD6C\uB098 \uC774 \uBC29\uC744 \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4',
        createRoom: '\uBC29 \uB9CC\uB4E4\uAE30',
        roomAlreadyExistsError: '\uC774\uBBF8 \uC774 \uC774\uB984\uC758 \uBC29\uC774 \uC874\uC7AC\uD569\uB2C8\uB2E4.',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: '\uBC29 \uC774\uB984\uC740 \uC18C\uBB38\uC790, \uC22B\uC790, \uADF8\uB9AC\uACE0 \uD558\uC774\uD508\uB9CC \uD3EC\uD568\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        pleaseEnterRoomName: '\uBC29 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
        pleaseSelectWorkspace: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
        renamedRoomAction: ({oldName, newName}: RenamedRoomActionParams) =>
            `\uC774 \uBC29\uC758 \uC774\uB984\uC744 "${newName}"(\uC774\uC804 \uC774\uB984 "${oldName}")\uC73C\uB85C \uBCC0\uACBD\uD588\uC2B5\uB2C8\uB2E4.`,
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `\uBC29\uC758 \uC774\uB984\uC774 ${newName}\uC73C\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4`,
        social: '\uC18C\uC15C',
        selectAWorkspace: '\uC791\uC5C5 \uACF5\uAC04\uC744 \uC120\uD0DD\uD558\uC138\uC694',
        growlMessageOnRenameError:
            '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBC29\uC758 \uC774\uB984\uC744 \uBCC0\uACBD\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC5F0\uACB0 \uC0C1\uD0DC\uB97C \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        visibilityOptions: {
            restricted: '\uC791\uC5C5 \uACF5\uAC04', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: '\uAC1C\uC778\uC801\uC778',
            public: '\uACF5\uAC1C',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: '\uACF5\uACF5 \uBC1C\uD45C',
        },
    },
    workspaceActions: {
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedRoomActionParams) =>
            `\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC758 \uC774\uB984\uC744 "${newName}"(\uC774\uC804 \uC774\uB984: "${oldName}")\uC73C\uB85C \uBCC0\uACBD\uD588\uC2B5\uB2C8\uB2E4`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = "You didn't provide any text to translate. Please provide the text.";
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? "You didn't provide any text to translate. Please provide the text.";
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('\uADF8\uB9AC\uACE0');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `removed you from ${joinedNames}'s approval workflow and workspace chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `removed you from ${joinedNames}'s approval workflows and workspace chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        upgradedWorkspace: '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C Control \uD50C\uB79C\uC73C\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC\uD588\uC2B5\uB2C8\uB2E4.',
        downgradedWorkspace: '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C Collect \uD50C\uB79C\uC73C\uB85C \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD588\uC2B5\uB2C8\uB2E4.',
    },
    roomMembersPage: {
        memberNotFound: '\uBA64\uBC84\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        useInviteButton: '\uC0C8 \uBA64\uBC84\uB97C \uCC44\uD305\uC5D0 \uCD08\uB300\uD558\uB824\uBA74 \uC704\uC758 \uCD08\uB300 \uBC84\uD2BC\uC744 \uC0AC\uC6A9\uD574 \uC8FC\uC138\uC694.',
        notAuthorized: `\uC774 \uD398\uC774\uC9C0\uC5D0 \uC811\uADFC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC774 \uBC29\uC5D0 \uCC38\uC5EC\uD558\uB824\uACE0 \uD558\uC2DC\uBA74, \uBC29\uC758 \uBA64\uBC84\uC5D0\uAC8C \uB2F9\uC2E0\uC744 \uCD94\uAC00\uD574\uB2EC\uB77C\uACE0 \uC694\uCCAD\uD558\uC2ED\uC2DC\uC624. \uB2E4\uB978 \uBB38\uC81C\uAC00 \uC788\uC73C\uC2E0\uAC00\uC694? ${CONST.EMAIL.CONCIERGE}\uC5D0\uAC8C \uC5F0\uB77D\uD574 \uC8FC\uC138\uC694.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `\uC815\uB9D0\uB85C ${memberName}\uC744(\uB97C) \uBC29\uC5D0\uC11C \uC81C\uAC70\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?`,
            other: '\uC120\uD0DD\uD55C \uBA64\uBC84\uB97C \uBC29\uC5D0\uC11C \uC81C\uAC70\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        }),
        error: {
            genericAdd: '\uC774 \uBC29 \uBA64\uBC84\uB97C \uCD94\uAC00\uD558\uB294 \uB370 \uBB38\uC81C\uAC00 \uC788\uC5C8\uC2B5\uB2C8\uB2E4.',
        },
    },
    newTaskPage: {
        assignTask: '\uC791\uC5C5 \uD560\uB2F9',
        assignMe: '\uB098\uC5D0\uAC8C \uD560\uB2F9\uD558\uC138\uC694',
        confirmTask: '\uC791\uC5C5 \uD655\uC778',
        confirmError: '\uC81C\uBAA9\uC744 \uC785\uB825\uD558\uACE0 \uACF5\uC720 \uB300\uC0C1\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.',
        descriptionOptional: '\uC124\uBA85 (\uC120\uD0DD \uC0AC\uD56D)',
        pleaseEnterTaskName: '\uC81C\uBAA9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694',
        pleaseEnterTaskDestination: '\uC774 \uC791\uC5C5\uC744 \uACF5\uC720\uD558\uACE0 \uC2F6\uC740 \uACF3\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
    },
    task: {
        task: '\uC791\uC5C5',
        title: '\uC81C\uBAA9',
        description: '\uC124\uBA85',
        assignee: '\uB2F4\uB2F9\uC790',
        completed: '\uC644\uB8CC\uB428',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `task for ${title}`,
            completed: '\uC644\uB8CC\uB85C \uD45C\uC2DC\uB428',
            canceled: '\uC0AD\uC81C\uB41C \uC791\uC5C5',
            reopened: '\uBBF8\uC644\uB8CC\uB85C \uD45C\uC2DC\uB428',
            error: '\uC694\uCCAD\uD55C \uC791\uC5C5\uC744 \uC218\uD589\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
        },
        markAsComplete: '\uC644\uB8CC\uB85C \uD45C\uC2DC',
        markAsIncomplete: '\uBBF8\uC644\uB8CC\uB85C \uD45C\uC2DC',
        assigneeError:
            '\uC774 \uC791\uC5C5\uC744 \uD560\uB2F9\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB2F4\uB2F9\uC790\uB97C \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        genericCreateTaskFailureMessage:
            '\uC774 \uC791\uC5C5\uC744 \uC0DD\uC131\uD558\uB294 \uC911\uC5D0 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        deleteTask: '\uC791\uC5C5 \uC0AD\uC81C',
        deleteConfirmation: '\uC774 \uC791\uC5C5\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: '\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4',
        subtitle: '\uC774 \uD3B8\uB9AC\uD55C \uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4\uB97C \uC0AC\uC6A9\uD558\uC5EC \uC2DC\uAC04\uC744 \uC808\uC57D\uD558\uC138\uC694:',
        shortcuts: {
            openShortcutDialog: '\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4 \uB300\uD654\uC0C1\uC790\uB97C \uC5FD\uB2C8\uB2E4',
            escape: '\uD0C8\uCD9C \uB300\uD654\uC0C1\uC790',
            search: '\uAC80\uC0C9 \uB300\uD654\uC0C1\uC790 \uC5F4\uAE30',
            newChat: '\uC0C8 \uCC44\uD305 \uD654\uBA74',
            copy: '\uB313\uAE00 \uBCF5\uC0AC',
            openDebug: '\uD14C\uC2A4\uD2B8 \uD658\uACBD \uC124\uC815 \uB300\uD654\uC0C1\uC790 \uC5F4\uAE30',
        },
    },
    guides: {
        screenShare: '\uD654\uBA74 \uACF5\uC720',
        screenShareRequest: 'Expensify\uAC00 \uD654\uBA74 \uACF5\uC720\uC5D0 \uCD08\uB300\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4',
    },
    search: {
        resultsAreLimited: '\uAC80\uC0C9 \uACB0\uACFC\uB294 \uC81C\uD55C\uB429\uB2C8\uB2E4.',
        viewResults: '\uACB0\uACFC \uBCF4\uAE30',
        resetFilters: '\uD544\uD130 \uC7AC\uC124\uC815',
        searchResults: {
            emptyResults: {
                title: '\uBCF4\uC5EC\uC904 \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4',
                subtitle:
                    '\uAC80\uC0C9 \uC870\uAC74\uC744 \uC870\uC815\uD558\uAC70\uB098 \uCD08\uB85D\uC0C9 + \uBC84\uD2BC\uC73C\uB85C \uBB34\uC5B8\uAC00\uB97C \uB9CC\uB4E4\uC5B4 \uBCF4\uC138\uC694.',
            },
            emptyExpenseResults: {
                title: '\uC544\uC9C1 \uBE44\uC6A9\uC744 \uC0DD\uC131\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
                subtitle:
                    '\uC544\uB798\uC758 \uCD08\uB85D\uC0C9 \uBC84\uD2BC\uC744 \uC0AC\uC6A9\uD558\uC5EC \uBE44\uC6A9\uC744 \uC0DD\uC131\uD558\uAC70\uB098 Expensify\uB97C \uB458\uB7EC\uBCF4\uBA70 \uB354 \uC54C\uC544\uBCF4\uC138\uC694.',
            },
            emptyInvoiceResults: {
                title: '\uC544\uC9C1 \uCCAD\uAD6C\uC11C\uB97C \uC0DD\uC131\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
                subtitle:
                    '\uC544\uB798\uC758 \uCD08\uB85D\uC0C9 \uBC84\uD2BC\uC744 \uC0AC\uC6A9\uD558\uC5EC \uC1A1\uC7A5\uC744 \uBCF4\uB0B4\uAC70\uB098 Expensify\uC5D0 \uB300\uD574 \uB354 \uC54C\uC544\uBCF4\uAE30 \uC704\uD574 \uD22C\uC5B4\uB97C \uD574\uBCF4\uC138\uC694.',
            },
            emptyTripResults: {
                title: '\uD45C\uC2DC\uD560 \uC5EC\uD589\uC774 \uC5C6\uC2B5\uB2C8\uB2E4',
                subtitle: '\uC544\uB798\uC5D0\uC11C \uCCAB \uC5EC\uD589\uC744 \uC608\uC57D\uD558\uC5EC \uC2DC\uC791\uD558\uC138\uC694.',
                buttonText: '\uC5EC\uD589 \uC608\uC57D\uD558\uAE30',
            },
        },
        saveSearch: '\uAC80\uC0C9 \uC800\uC7A5',
        deleteSavedSearch: '\uC800\uC7A5\uB41C \uAC80\uC0C9 \uC0AD\uC81C',
        deleteSavedSearchConfirm: '\uC774 \uAC80\uC0C9\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        searchName: '\uC774\uB984 \uAC80\uC0C9',
        savedSearchesMenuItemTitle: '\uC800\uC7A5\uB428',
        groupedExpenses: '\uADF8\uB8F9\uD654\uB41C \uBE44\uC6A9',
        bulkActions: {
            approve: '\uC2B9\uC778',
            pay: '\uC9C0\uBD88',
            delete: '\uC0AD\uC81C',
            hold: '\uD640\uB4DC',
            unhold: '\uD574\uC81C',
            noOptionsAvailable: '\uC120\uD0DD\uD55C \uBE44\uC6A9 \uADF8\uB8F9\uC5D0 \uB300\uD55C \uC635\uC158\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.',
        },
        filtersHeader: '\uD544\uD130',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Before ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `After ${date ?? ''}`,
            },
            status: '\uC0C1\uD0DC',
            keyword: '\uD0A4\uC6CC\uB4DC',
            hasKeywords: '\uD0A4\uC6CC\uB4DC\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            currency: '\uD1B5\uD654',
            link: '\uB9C1\uD06C',
            pinned: '\uACE0\uC815\uB428',
            unread: '\uC77D\uC9C0 \uC54A\uC74C',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Less than ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Greater than ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Between ${greaterThan} and ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '\uAC1C\uBCC4 \uCE74\uB4DC',
                cardFeeds: '\uCE74\uB4DC \uD53C\uB4DC',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: '\uD604\uC7AC',
            past: '\uACFC\uAC70',
            submitted: '\uC81C\uCD9C\uB428',
            approved: '\uC2B9\uC778\uB428',
            paid: '\uC9C0\uBD88\uB428',
            exported: '\uB0B4\uBCF4\uB0B4\uC9D0',
            posted: '\uAC8C\uC2DC\uB428',
        },
        noCategory: '\uCE74\uD14C\uACE0\uB9AC \uC5C6\uC74C',
        noTag: '\uD0DC\uADF8 \uC5C6\uC74C',
        expenseType: '\uBE44\uC6A9 \uC720\uD615',
        recentSearches: '\uCD5C\uADFC \uAC80\uC0C9\uC5B4',
        recentChats: '\uCD5C\uADFC \uCC44\uD305\uB4E4',
        searchIn: '\uC5D0\uC11C \uAC80\uC0C9\uD558\uC138\uC694',
        searchPlaceholder: '\uBB34\uC5B8\uAC00\uB97C \uAC80\uC0C9\uD558\uC138\uC694',
        suggestions: '\uC81C\uC548\uC0AC\uD56D',
    },
    genericErrorPage: {
        title: '\uC544\uC774\uACE0, \uBB54\uAC00 \uC798\uBABB\uB410\uC5B4\uC694!',
        body: {
            helpTextMobile: '\uC571\uC744 \uB2EB\uC558\uB2E4\uAC00 \uB2E4\uC2DC \uC5F4\uAC70\uB098, \uC804\uD658\uD574 \uC8FC\uC138\uC694.',
            helpTextWeb: '\uC6F9.',
            helpTextConcierge: '\uBB38\uC81C\uAC00 \uACC4\uC18D\uB41C\uB2E4\uBA74, \uC5F0\uB77D\uD574 \uC8FC\uC138\uC694',
        },
        refresh: '\uC0C8\uB85C \uACE0\uCE68',
    },
    fileDownload: {
        success: {
            title: '\uB2E4\uC6B4\uB85C\uB4DC \uC644\uB8CC!',
            message: '\uCCA8\uBD80 \uD30C\uC77C\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
            qrMessage:
                'QR \uCF54\uB4DC\uC758 \uC0AC\uBCF8\uC744 \uC0AC\uC9C4 \uB610\uB294 \uB2E4\uC6B4\uB85C\uB4DC \uD3F4\uB354\uC5D0\uC11C \uD655\uC778\uD558\uC138\uC694. \uD504\uB85C\uD301: \uD504\uB808\uC820\uD14C\uC774\uC158\uC5D0 \uCD94\uAC00\uD558\uC5EC \uAD00\uAC1D\uC774 \uC9C1\uC811 \uC2A4\uCE94\uD558\uACE0 \uC5F0\uACB0\uD560 \uC218 \uC788\uAC8C \uD558\uC138\uC694.',
        },
        generalError: {
            title: '\uCCA8\uBD80 \uC624\uB958',
            message: '\uCCA8\uBD80\uD30C\uC77C\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        },
        permissionError: {
            title: '\uC800\uC7A5\uC18C \uC811\uADFC',
            message:
                'Expensify\uB294 \uC800\uC7A5\uC18C \uC811\uADFC \uAD8C\uD55C \uC5C6\uC774 \uCCA8\uBD80\uD30C\uC77C\uC744 \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uAD8C\uD55C\uC744 \uC5C5\uB370\uC774\uD2B8\uD558\uB824\uBA74 \uC124\uC815\uC744 \uB204\uB974\uC138\uC694.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: '\uC0C8\uB85C\uC6B4 Expensify',
        about: '\uC0C8\uB85C\uC6B4 Expensify\uC5D0 \uB300\uD558\uC5EC',
        update: '\uC0C8\uB85C\uC6B4 Expensify \uC5C5\uB370\uC774\uD2B8',
        checkForUpdates: '\uC5C5\uB370\uC774\uD2B8 \uD655\uC778',
        toggleDevTools: '\uAC1C\uBC1C\uC790 \uB3C4\uAD6C \uD1A0\uAE00',
        viewShortcuts: '\uD0A4\uBCF4\uB4DC \uB2E8\uCD95\uD0A4 \uBCF4\uAE30',
        services: '\uC11C\uBE44\uC2A4',
        hide: '\uC0C8 Expensify \uC228\uAE30\uAE30',
        hideOthers: '\uB2E4\uB978 \uC0AC\uB78C\uB4E4 \uC228\uAE30\uAE30',
        showAll: '\uBAA8\uB450 \uBCF4\uAE30',
        quit: '\uC0C8 Expensify \uC885\uB8CC',
        fileMenu: '\uD30C\uC77C',
        closeWindow: '\uCC3D \uB2EB\uAE30',
        editMenu: '\uD3B8\uC9D1',
        undo: '\uC2E4\uD589 \uCDE8\uC18C',
        redo: '\uB2E4\uC2DC\uD558\uAE30',
        cut: '\uC798\uB77C\uB0B4\uAE30',
        copy: '\uBCF5\uC0AC',
        paste: '\uBD99\uC5EC\uB123\uAE30',
        pasteAndMatchStyle: '\uC2A4\uD0C0\uC77C\uC5D0 \uB9DE\uAC8C \uBD99\uC5EC\uB123\uAE30',
        pasteAsPlainText: '\uC77C\uBC18 \uD14D\uC2A4\uD2B8\uB85C \uBD99\uC5EC\uB123\uAE30',
        delete: '\uC0AD\uC81C',
        selectAll: '\uBAA8\uB450 \uC120\uD0DD',
        speechSubmenu: '\uC2A4\uD53C\uCE58',
        startSpeaking: '\uB9D0\uD558\uAE30 \uC2DC\uC791\uD558\uC138\uC694',
        stopSpeaking: '\uB9D0\uC744 \uBA48\uCD94\uC138\uC694',
        viewMenu: '\uBCF4\uAE30',
        reload: '\uC7AC\uB85C\uB4DC',
        forceReload: '\uAC15\uC81C \uC0C8\uB85C\uACE0\uCE68',
        resetZoom: '\uC2E4\uC81C \uD06C\uAE30',
        zoomIn: '\uD655\uB300',
        zoomOut: '\uD655\uB300 \uCD95\uC18C',
        togglefullscreen: '\uC804\uCCB4 \uD654\uBA74 \uC804\uD658',
        historyMenu: '\uC5ED\uC0AC',
        back: '\uB4A4\uB85C',
        forward: '\uC55E\uC73C\uB85C',
        windowMenu: '\uC708\uB3C4\uC6B0',
        minimize: '\uCD5C\uC18C\uD654',
        zoom: '\uC90C',
        front: '\uBAA8\uB450 \uC55E\uC73C\uB85C \uAC00\uC838\uC624\uAE30',
        helpMenu: '\uB3C4\uC6C0',
        learnMore: '\uB354 \uC54C\uC544\uBCF4\uAE30',
        documentation: '\uBB38\uC11C\uD654',
        communityDiscussions: '\uCEE4\uBBA4\uB2C8\uD2F0 \uD1A0\uB860',
        searchIssues: '\uBB38\uC81C \uAC80\uC0C9',
    },
    historyMenu: {
        forward: '\uC55E\uC73C\uB85C',
        back: '\uB4A4\uB85C',
    },
    checkForUpdatesModal: {
        available: {
            title: '\uC5C5\uB370\uC774\uD2B8 \uAC00\uB2A5',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `\uC0C8 \uBC84\uC804\uC774 \uACE7 \uC0AC\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4.${!isSilentUpdating ? ' 업데이트 준비가 완료되면 알려드리겠습니다.' : ''}`,
            soundsGood: '\uC88B\uC544 \uBCF4\uC785\uB2C8\uB2E4',
        },
        notAvailable: {
            title: '\uC5C5\uB370\uC774\uD2B8\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
            message: '\uC9C0\uAE08\uC740 \uC5C5\uB370\uC774\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uD655\uC778\uD574\uC8FC\uC138\uC694!',
            okay: '\uC88B\uC544\uC694',
        },
        error: {
            title: '\uC5C5\uB370\uC774\uD2B8 \uD655\uC778 \uC2E4\uD328.',
            message: '\uC5C5\uB370\uC774\uD2B8\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
    },
    report: {
        genericCreateReportFailureMessage:
            '\uC774 \uCC44\uD305\uC744 \uC0DD\uC131\uD558\uB294 \uC911 \uC608\uAE30\uCE58 \uC54A\uC740 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        genericAddCommentFailureMessage:
            '\uB313\uAE00\uC744 \uAC8C\uC2DC\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        genericUpdateReportFieldFailureMessage:
            '\uD544\uB4DC \uC5C5\uB370\uC774\uD2B8 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        genericUpdateReporNameEditFailureMessage:
            '\uBCF4\uACE0\uC11C\uC758 \uC774\uB984\uC744 \uBCC0\uACBD\uD558\uB294 \uC911 \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB098\uC911\uC5D0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        noActivityYet: '\uC544\uC9C1 \uD65C\uB3D9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `changed ${fieldName} from ${oldValue} to ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `changed ${fieldName} to ${newValue}`,
                changePolicy: ({fromPolicy, toPolicy}: ChangePolicyParams) => `changed workspace from ${fromPolicy} to ${toPolicy}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `\uD0C0\uC785\uC744 ${oldType}\uC5D0\uC11C ${newType}\uC73C\uB85C \uBCC0\uACBD\uD588\uC2B5\uB2C8\uB2E4`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `sent this report to ${delegateUser} since ${originalManager} is on vacation`,
                exportedToCSV: `exported this report to CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `\uC774 \uBCF4\uACE0\uC11C\uB97C ${label}\uB85C \uB0B4\uBCF4\uB0C8\uC2B5\uB2C8\uB2E4.`,
                    manual: ({label}: ExportedToIntegrationParams) =>
                        `\uC774 \uBCF4\uACE0\uC11C\uB97C \uC218\uB3D9\uC73C\uB85C ${label}\uB85C \uB0B4\uBCF4\uB0C8\uB2E4\uACE0 \uD45C\uC2DC\uD588\uC2B5\uB2C8\uB2E4.`,
                    reimburseableLink: '\uC790\uAE30 \uBD80\uB2F4 \uBE44\uC6A9\uC744 \uD655\uC778\uD558\uC138\uC694.',
                    nonReimbursableLink: '\uD68C\uC0AC \uCE74\uB4DC \uBE44\uC6A9 \uBCF4\uAE30.',
                    pending: ({label}: ExportedToIntegrationParams) => `\uC774 \uBCF4\uACE0\uC11C\uB97C ${label}\uB85C \uB0B4\uBCF4\uB0B4\uAE30 \uC2DC\uC791\uD588\uC2B5\uB2C8\uB2E4...`,
                },
                integrationsMessage: ({errorMessage, label}: IntegrationSyncFailedParams) =>
                    `\uC774 \uBCF4\uACE0\uC11C\uB97C ${label}\uB85C \uB0B4\uBCF4\uB0B4\uB294 \uB370 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4 ("${errorMessage}")`,
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
                share: ({to}: ShareParams) => `\uBA64\uBC84 ${to}\uB97C \uCD08\uB300\uD588\uC2B5\uB2C8\uB2E4`,
                unshare: ({to}: UnshareParams) => `\uBA64\uBC84 ${to}\uB97C \uC81C\uAC70\uD588\uC2B5\uB2C8\uB2E4`,
                stripePaid: ({amount, currency}: StripePaidParams) => `${amount} \uC9C0\uBD88\uD568`,
                takeControl: `took control`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `failed to sync with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `added ${email} as ${role === 'member' || role === 'user' ? 'a member' : 'an admin'}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) =>
                    `updated the role of ${email} to ${newRole === 'member' || newRole === 'user' ? 'member' : newRole} (previously ${
                        currentRole === 'member' || currentRole === 'user' ? 'member' : currentRole
                    })`,
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} left the workspace`,
                removeMember: ({email, role}: AddEmployeeParams) => `\uC81C\uAC70\uB428 ${role === 'member' || role === 'user' ? 'member' : 'admin'} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} for ${dayCount} ${dayCount === 1 ? 'day' : 'days'} until ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} from ${timePeriod} on ${date}`,
    },
    footer: {
        features: '\uAE30\uB2A5\uB4E4',
        expenseManagement: '\uBE44\uC6A9 \uAD00\uB9AC',
        spendManagement: '\uC9C0\uCD9C \uAD00\uB9AC',
        expenseReports: '\uBE44\uC6A9 \uBCF4\uACE0\uC11C',
        companyCreditCard: '\uD68C\uC0AC \uC2E0\uC6A9\uCE74\uB4DC',
        receiptScanningApp: '\uC601\uC218\uC99D \uC2A4\uCE94 \uC571',
        billPay: '\uCCAD\uAD6C\uC11C \uACB0\uC81C',
        invoicing: '\uCCAD\uAD6C\uC11C \uC791\uC131',
        CPACard: 'CPA \uCE74\uB4DC',
        payroll: '\uAE09\uC5EC \uAD00\uB9AC',
        travel: '\uC5EC\uD589',
        resources: '\uB9AC\uC18C\uC2A4',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: '\uD504\uB808\uC2A4 \uD0A4\uD2B8',
        support: '\uC9C0\uC6D0',
        expensifyHelp: 'ExpensifyHelp',
        terms: '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00',
        privacy: '\uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638',
        learnMore: '\uB354 \uC54C\uC544\uBCF4\uAE30',
        aboutExpensify: 'Expensify\uC5D0 \uB300\uD558\uC5EC',
        blog: '\uBE14\uB85C\uADF8',
        jobs: '\uC9C1\uC5C5',
        expensifyOrg: 'Expensify.org',
        investorRelations: '\uD22C\uC790\uC790 \uAD00\uACC4',
        getStarted: '\uC2DC\uC791\uD558\uAE30',
        createAccount: '\uC0C8 \uACC4\uC815 \uB9CC\uB4E4\uAE30',
        logIn: '\uB85C\uADF8\uC778',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: '\uCC44\uD305 \uBAA9\uB85D\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30',
        chatWelcomeMessage: '\uCC44\uD305 \uD658\uC601 \uBA54\uC2DC\uC9C0',
        navigatesToChat: '\uCC44\uD305\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4',
        newMessageLineIndicator: '\uC0C8 \uBA54\uC2DC\uC9C0 \uB77C\uC778 \uC9C0\uC2DC\uC790',
        chatMessage: '\uCC44\uD305 \uBA54\uC2DC\uC9C0',
        lastChatMessagePreview: '\uB9C8\uC9C0\uB9C9 \uCC44\uD305 \uBA54\uC2DC\uC9C0 \uBBF8\uB9AC\uBCF4\uAE30',
        workspaceName: '\uC791\uC5C5 \uACF5\uAC04 \uC774\uB984',
        chatUserDisplayNames: '\uCC44\uD305 \uBA64\uBC84 \uD45C\uC2DC \uC774\uB984',
        scrollToNewestMessages: '\uAC00\uC7A5 \uCD5C\uC2E0 \uBA54\uC2DC\uC9C0\uB85C \uC2A4\uD06C\uB864',
        prestyledText: '\uBBF8\uB9AC \uC2A4\uD0C0\uC77C\uC774 \uC9C0\uC815\uB41C \uD14D\uC2A4\uD2B8',
        viewAttachment: '\uCCA8\uBD80\uD30C\uC77C \uBCF4\uAE30',
    },
    parentReportAction: {
        deletedReport: '\uC0AD\uC81C\uB41C \uBCF4\uACE0\uC11C',
        deletedMessage: '\uC0AD\uC81C\uB41C \uBA54\uC2DC\uC9C0',
        deletedExpense: '\uC0AD\uC81C\uB41C \uBE44\uC6A9',
        reversedTransaction: '\uAC70\uB798 \uCDE8\uC18C',
        deletedTask: '\uC0AD\uC81C\uB41C \uC791\uC5C5',
        hiddenMessage: '\uC228\uACA8\uC9C4 \uBA54\uC2DC\uC9C0',
    },
    threads: {
        thread: '\uC2A4\uB808\uB4DC',
        replies: '\uB2F5\uAE00',
        reply: '\uB2F5\uC7A5',
        from: '\uC5D0\uC11C',
        in: '\uC5D0\uC11C',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `${workspaceName ? `에서 ${workspaceName}` : ''}\uC5D0\uC11C`,
    },
    qrCodes: {
        copy: 'URL \uBCF5\uC0AC',
        copied: '\uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
    },
    moderation: {
        flagDescription: '\uBAA8\uB4E0 \uD50C\uB798\uADF8\uB41C \uBA54\uC2DC\uC9C0\uB294 \uAC80\uD1A0\uB97C \uC704\uD574 \uAD00\uB9AC\uC790\uC5D0\uAC8C \uC804\uC1A1\uB429\uB2C8\uB2E4.',
        chooseAReason: '\uC544\uB798\uC5D0\uC11C \uC2E0\uACE0\uD558\uB294 \uC774\uC720\uB97C \uC120\uD0DD\uD558\uC138\uC694:',
        spam: '\uC2A4\uD338',
        spamDescription: '\uAD00\uB828 \uC5C6\uB294 \uC8FC\uC81C\uC758 \uBB34\uC791\uC815 \uD64D\uBCF4',
        inconsiderate: '\uBB34\uB840\uD55C',
        inconsiderateDescription: '\uC758\uB3C4\uAC00 \uC758\uC2EC\uC2A4\uB7EC\uC6B4 \uBAA8\uC695\uC801\uC774\uAC70\uB098 \uBD88\uCF8C\uD55C \uD45C\uD604',
        intimidation: '\uC704\uD611',
        intimidationDescription: '\uC720\uD6A8\uD55C \uC774\uC758\uC5D0\uB3C4 \uBD88\uAD6C\uD558\uACE0 \uACF5\uACA9\uC801\uC73C\uB85C \uC758\uC81C\uB97C \uCD94\uC9C4\uD558\uB294 \uC911',
        bullying: '\uD559\uB300',
        bullyingDescription: '\uBCF5\uC885\uC744 \uC5BB\uAE30 \uC704\uD574 \uAC1C\uC778\uC744 \uB300\uC0C1\uC73C\uB85C \uC0BC\uB294 \uAC83',
        harassment: '\uAD34\uB86D\uD798',
        harassmentDescription: '\uC778\uC885\uCC28\uBCC4\uC801, \uC5EC\uC131\uD610\uC624\uC801 \uB610\uB294 \uB2E4\uB978 \uD615\uD0DC\uC758 \uD3ED\uB113\uC740 \uCC28\uBCC4 \uD589\uB3D9',
        assault: '\uACF5\uACA9',
        assaultDescription: '\uD2B9\uC815 \uB300\uC0C1\uC744 \uD5A5\uD55C \uC758\uB3C4\uC801\uC778 \uAC10\uC815 \uACF5\uACA9',
        flaggedContent:
            '\uC774 \uBA54\uC2DC\uC9C0\uB294 \uCEE4\uBBA4\uB2C8\uD2F0 \uADDC\uCE59\uC744 \uC704\uBC18\uD55C \uAC83\uC73C\uB85C \uD45C\uC2DC\uB418\uC5C8\uC73C\uBA70, \uB0B4\uC6A9\uC774 \uC228\uACA8\uC838 \uC788\uC2B5\uB2C8\uB2E4.',
        hideMessage: '\uBA54\uC2DC\uC9C0 \uC228\uAE30\uAE30',
        revealMessage: '\uBA54\uC2DC\uC9C0 \uD45C\uC2DC',
        levelOneResult: '\uC775\uBA85 \uACBD\uACE0\uB97C \uBCF4\uB0B4\uACE0 \uBA54\uC2DC\uC9C0\uAC00 \uAC80\uD1A0\uB97C \uC704\uD574 \uC2E0\uACE0\uB429\uB2C8\uB2E4.',
        levelTwoResult:
            '\uCC44\uB110\uC5D0\uC11C \uBA54\uC2DC\uC9C0\uAC00 \uC228\uACA8\uC84C\uC73C\uBA70, \uC775\uBA85 \uACBD\uACE0 \uBC0F \uBA54\uC2DC\uC9C0\uAC00 \uAC80\uD1A0\uB97C \uC704\uD574 \uC2E0\uACE0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
        levelThreeResult:
            '\uCC44\uB110\uC5D0\uC11C \uBA54\uC2DC\uC9C0\uAC00 \uC81C\uAC70\uB418\uC5C8\uC73C\uBA70 \uC775\uBA85 \uACBD\uACE0\uC640 \uBA54\uC2DC\uC9C0\uAC00 \uAC80\uD1A0\uB97C \uC704\uD574 \uC2E0\uACE0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
    },
    actionableMentionWhisperOptions: {
        invite: '\uADF8\uB4E4\uC744 \uCD08\uB300\uD558\uC138\uC694',
        nothing: '\uC544\uBB34 \uAC83\uB3C4 \uD558\uC9C0 \uB9C8\uC138\uC694',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '\uC218\uB77D',
        decline: '\uAC70\uC808',
    },
    actionableMentionTrackExpense: {
        submit: '\uADF8\uAC83\uC744 \uB204\uAD70\uAC00\uC5D0\uAC8C \uC81C\uCD9C\uD558\uC138\uC694',
        categorize: '\uADF8\uAC83\uC744 \uBD84\uB958\uD558\uC2ED\uC2DC\uC624',
        share: '\uB0B4 \uD68C\uACC4\uC0AC\uC640 \uACF5\uC720\uD558\uC138\uC694',
        nothing: '\uC9C0\uAE08\uC740 \uC544\uBB34\uAC83\uB3C4 \uC5C6\uC2B5\uB2C8\uB2E4',
    },
    teachersUnitePage: {
        teachersUnite: '\uAD50\uC0AC\uB4E4\uC774 \uD569\uC2EC\uD574\uB77C',
        joinExpensifyOrg:
            'Expensify.org\uC640 \uD568\uAED8 \uC804 \uC138\uACC4\uC758 \uBD88\uACF5\uD3C9\uD568\uC744 \uC5C6\uC560\uC138\uC694. \uD604\uC7AC "Teachers Unite" \uCEA0\uD398\uC778\uC740 \uD544\uC218 \uD559\uAD50 \uC6A9\uD488 \uBE44\uC6A9\uC744 \uBD84\uB2F4\uD568\uC73C\uB85C\uC368 \uC804 \uC138\uACC4 \uAD50\uC721\uC790\uB4E4\uC744 \uC9C0\uC6D0\uD569\uB2C8\uB2E4.',
        iKnowATeacher: '\uB098\uB294 \uC120\uC0DD\uB2D8\uC744 \uC54C\uACE0 \uC788\uC2B5\uB2C8\uB2E4',
        iAmATeacher: '\uB098\uB294 \uC120\uC0DD\uB2D8\uC774\uB2E4',
        getInTouch:
            '\uD6CC\uB96D\uD569\uB2C8\uB2E4! \uADF8\uB4E4\uC758 \uC815\uBCF4\uB97C \uACF5\uC720\uD574 \uC8FC\uC2DC\uBA74 \uC800\uD76C\uAC00 \uADF8\uB4E4\uC5D0\uAC8C \uC5F0\uB77D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        introSchoolPrincipal: '\uB2F9\uC2E0\uC758 \uD559\uAD50 \uAD50\uC7A5\uC5D0 \uB300\uD55C \uC18C\uAC1C',
        schoolPrincipalVerfiyExpense:
            'Expensify.org\uC740 \uC800\uC18C\uB4DD \uAC00\uC815\uC758 \uD559\uC0DD\uB4E4\uC774 \uB354 \uB098\uC740 \uD559\uC2B5 \uACBD\uD5D8\uC744 \uAC00\uC9C8 \uC218 \uC788\uB3C4\uB85D \uD544\uC218 \uD559\uAD50 \uC6A9\uD488\uC758 \uBE44\uC6A9\uC744 \uBD84\uB2F4\uD569\uB2C8\uB2E4. \uADC0\uD558\uC758 \uAD50\uC7A5\uB2D8\uAED8\uC11C\uB294 \uADC0\uD558\uC758 \uBE44\uC6A9\uC744 \uD655\uC778\uD558\uB3C4\uB85D \uC694\uCCAD\uBC1B\uAC8C \uB420 \uAC83\uC785\uB2C8\uB2E4.',
        principalFirstName: '\uAD50\uC7A5\uC758 \uC774\uB984',
        principalLastName: '\uAD50\uC7A5 \uC131',
        principalWorkEmail: '\uC8FC\uC694 \uC5C5\uBB34 \uC774\uBA54\uC77C',
        updateYourEmail: '\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uC138\uC694',
        updateEmail: '\uC774\uBA54\uC77C \uC8FC\uC18C \uC5C5\uB370\uC774\uD2B8',
        contactMethods: '\uC5F0\uB77D \uBC29\uBC95.',
        schoolMailAsDefault:
            '\uC9C4\uD589\uD558\uAE30 \uC804\uC5D0, \uD559\uAD50 \uC774\uBA54\uC77C\uC744 \uAE30\uBCF8 \uC5F0\uB77D\uCC98\uB85C \uC124\uC815\uD558\uC2ED\uC2DC\uC624. \uC124\uC815 > \uD504\uB85C\uD544 > \uC5D0\uC11C \uC124\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        error: {
            enterPhoneEmail: '\uC720\uD6A8\uD55C \uC774\uBA54\uC77C \uB610\uB294 \uC804\uD654\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694.',
            enterEmail: '\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD558\uC138\uC694.',
            enterValidEmail: '\uC720\uD6A8\uD55C \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD558\uC138\uC694.',
            tryDifferentEmail: '\uB2E4\uB978 \uC774\uBA54\uC77C\uC744 \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
    },
    cardTransactions: {
        notActivated: '\uD65C\uC131\uD654\uB418\uC9C0 \uC54A\uC74C',
        outOfPocket: '\uC790\uAE30 \uBD80\uB2F4\uAE08 \uC9C0\uCD9C',
        companySpend: '\uD68C\uC0AC \uC9C0\uCD9C',
    },
    distance: {
        addStop: '\uC815\uB958\uC7A5 \uCD94\uAC00',
        deleteWaypoint: '\uC6E8\uC774\uD3EC\uC778\uD2B8 \uC0AD\uC81C',
        deleteWaypointConfirmation: '\uC774 \uC6E8\uC774\uD3EC\uC778\uD2B8\uB97C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        address: '\uC8FC\uC18C',
        waypointDescription: {
            start: '\uC2DC\uC791',
            stop: '\uC815\uC9C0',
        },
        mapPending: {
            title: '\uC9C0\uB3C4 \uBCF4\uB958 \uC911',
            subtitle: '\uB9F5\uC740 \uC628\uB77C\uC778\uC73C\uB85C \uB3CC\uC544\uAC08 \uB54C \uC0DD\uC131\uB429\uB2C8\uB2E4',
            onlineSubtitle: '\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694. \uC9C0\uB3C4\uB97C \uC124\uC815\uD558\uB294 \uC911\uC785\uB2C8\uB2E4.',
            errorTitle: '\uC9C0\uB3C4 \uC624\uB958',
            errorSubtitle: '\uC9C0\uB3C4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        },
        error: {
            selectSuggestedAddress: '\uC81C\uC548\uB41C \uC8FC\uC18C\uB97C \uC120\uD0DD\uD558\uAC70\uB098 \uD604\uC7AC \uC704\uCE58\uB97C \uC0AC\uC6A9\uD574 \uC8FC\uC138\uC694.',
        },
    },
    reportCardLostOrDamaged: {
        report: '\uBB3C\uB9AC\uC801 \uCE74\uB4DC \uBD84\uC2E4 / \uC190\uC0C1 \uBCF4\uACE0',
        screenTitle: '\uBCF4\uACE0\uC11C \uCE74\uB4DC\uB97C \uC783\uC5B4\uBC84\uB9AC\uAC70\uB098 \uC190\uC0C1\uC2DC\uD0B4',
        nextButtonLabel: '\uB2E4\uC74C',
        reasonTitle: '\uC0C8 \uCE74\uB4DC\uAC00 \uC65C \uD544\uC694\uD55C\uAC00\uC694?',
        cardDamaged: '\uB0B4 \uCE74\uB4DC\uAC00 \uC190\uC0C1\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        cardLostOrStolen: '\uB0B4 \uCE74\uB4DC\uAC00 \uBD84\uC2E4\uB418\uC5C8\uAC70\uB098 \uB3C4\uB09C\uB2F9\uD588\uC2B5\uB2C8\uB2E4',
        confirmAddressTitle: '\uC0C8 \uCE74\uB4DC\uB97C \uC704\uD55C \uC6B0\uD3B8 \uC8FC\uC18C\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        cardDamagedInfo:
            '\uB2F9\uC2E0\uC758 \uC0C8 \uCE74\uB4DC\uB294 2-3 \uC601\uC5C5\uC77C \uB0B4\uC5D0 \uB3C4\uCC29\uD560 \uAC83\uC785\uB2C8\uB2E4. \uD604\uC7AC \uCE74\uB4DC\uB294 \uC0C8 \uCE74\uB4DC\uB97C \uD65C\uC131\uD654\uD560 \uB54C\uAE4C\uC9C0 \uACC4\uC18D \uC791\uB3D9\uD560 \uAC83\uC785\uB2C8\uB2E4.',
        cardLostOrStolenInfo:
            '\uC8FC\uBB38\uC774 \uC811\uC218\uB418\uB294 \uC989\uC2DC \uD604\uC7AC \uC0AC\uC6A9 \uC911\uC778 \uCE74\uB4DC\uB294 \uC601\uAD6C\uC801\uC73C\uB85C \uBE44\uD65C\uC131\uD654\uB429\uB2C8\uB2E4. \uB300\uBD80\uBD84\uC758 \uCE74\uB4DC\uB294 \uBA87 \uC601\uC5C5\uC77C \uB0B4\uC5D0 \uB3C4\uCC29\uD569\uB2C8\uB2E4.',
        address: '\uC8FC\uC18C',
        deactivateCardButton: '\uCE74\uB4DC \uBE44\uD65C\uC131\uD654',
        shipNewCardButton: '\uC0C8 \uCE74\uB4DC \uBC30\uC1A1',
        addressError: '\uC8FC\uC18C\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4',
        reasonError: '\uC774\uC720\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4',
    },
    eReceipt: {
        guaranteed: '\uBCF4\uC7A5\uB41C eReceipt',
        transactionDate: '\uAC70\uB798 \uB0A0\uC9DC',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: '\uCC44\uD305\uC744 \uC2DC\uC791\uD558\uC138\uC694,',
            buttonText2: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694.`,
            header: `\uCC44\uD305\uC744 \uC2DC\uC791\uD558\uACE0, $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC73C\uC138\uC694`,
            body: `\uCE5C\uAD6C\uB4E4\uACFC \uB300\uD654\uD558\uBA70 \uB3C8\uC744 \uBC8C\uC5B4\uBCF4\uC138\uC694! \uC0C8\uB85C\uC6B4 Expensify \uACC4\uC815\uC73C\uB85C \uCC44\uD305\uC744 \uC2DC\uC791\uD558\uACE0 \uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uBA74 $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uAC8C \uB429\uB2C8\uB2E4.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: '\uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uC2ED\uC2DC\uC624,',
            buttonText2: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694.`,
            header: `\uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uBA74 $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC2B5\uB2C8\uB2E4`,
            body: `\uB3C8\uC744 \uBC1B\uB294 \uAC83\uC774 \uBCF4\uB78C\uC774 \uC788\uC2B5\uB2C8\uB2E4! \uC0C8\uB85C\uC6B4 Expensify \uACC4\uC815\uC5D0 \uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uACE0 \uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uBA74 $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC73C\uC138\uC694.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.PAY_SOMEONE]: {
            buttonText1: '\uB204\uAD70\uAC00\uC5D0\uAC8C \uC9C0\uBD88\uD558\uB2E4,',
            buttonText2: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694.`,
            header: `\uB204\uAD70\uAC00\uC5D0\uAC8C \uC9C0\uBD88\uD558\uBA74 $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC2B5\uB2C8\uB2E4`,
            body: `\uB3C8\uC744 \uBC8C\uB824\uBA74 \uB3C8\uC744 \uC368\uC57C \uD569\uB2C8\uB2E4! Expensify\uB85C \uB204\uAD70\uAC00\uC5D0\uAC8C \uC9C0\uBD88\uD558\uACE0 \uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uBA74 $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC73C\uC138\uC694.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            buttonText1: '\uCE5C\uAD6C\uB97C \uCD08\uB300\uD558\uC138\uC694,',
            buttonText2: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694.`,
            header: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC73C\uC138\uC694`,
            body: `\uCE5C\uAD6C\uC640 \uCC44\uD305\uD558\uAC70\uB098, \uC9C0\uBD88\uD558\uAC70\uB098, \uC81C\uCD9C\uD558\uAC70\uB098, \uBE44\uC6A9\uC744 \uB098\uB204\uACE0 \uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uBA74 $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694. \uADF8\uB807\uC9C0 \uC54A\uC73C\uBA74, \uCD08\uB300 \uB9C1\uD06C\uB97C \uACF5\uC720\uD558\uAE30\uB9CC \uD558\uC138\uC694!`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText1: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC73C\uC138\uC694`,
            header: `$${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uBC1B\uC73C\uC138\uC694`,
            body: `\uCE5C\uAD6C\uC640 \uCC44\uD305\uD558\uAC70\uB098, \uC9C0\uBD88\uD558\uAC70\uB098, \uC81C\uCD9C\uD558\uAC70\uB098, \uBE44\uC6A9\uC744 \uB098\uB204\uACE0 \uADF8\uB4E4\uC774 \uACE0\uAC1D\uC774 \uB418\uBA74 $${CONST.REFERRAL_PROGRAM.REVENUE}\uB97C \uC5BB\uC73C\uC138\uC694. \uADF8\uB807\uC9C0 \uC54A\uC73C\uBA74, \uCD08\uB300 \uB9C1\uD06C\uB97C \uACF5\uC720\uD558\uAE30\uB9CC \uD558\uC138\uC694!`,
        },
        copyReferralLink: '\uCD08\uB300 \uB9C1\uD06C \uBCF5\uC0AC',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: '\uC124\uC815 \uC804\uBB38\uAC00\uC640 \uCC44\uD305\uD558\uC138\uC694',
            phrase2: '\uB3C4\uC6C0\uC744 \uC704\uD574',
        },
        default: {
            phrase1: '\uBA54\uC2DC\uC9C0',
            phrase2: '\uC124\uC815\uC5D0 \uB300\uD55C \uB3C4\uC6C0\uC744 \uC704\uD574',
        },
    },
    violations: {
        allTagLevelsRequired: '\uBAA8\uB4E0 \uD0DC\uADF8\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) => `${rejectedBy} rejected this expense with the comment "${rejectReason}"`,
        billableExpense: '\uCCAD\uAD6C \uAC00\uB2A5\uD558\uC9C0 \uC54A\uC74C',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `\uC601\uC218\uC99D \uD544\uC694${formattedLimit ? ` ${formattedLimit} 초과시` : ''}`,
        categoryOutOfPolicy: '\uB354 \uC774\uC0C1 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uCE74\uD14C\uACE0\uB9AC',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `\uC801\uC6A9\uB41C ${surcharge}% \uD658\uC804 \uC218\uC218\uB8CC`,
        customUnitOutOfPolicy: '\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uB300\uD55C \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC694\uAE08',
        duplicatedTransaction: '\uC911\uBCF5',
        fieldRequired: '\uBCF4\uACE0\uC11C \uD544\uB4DC\uB294 \uD544\uC218\uC785\uB2C8\uB2E4',
        futureDate: '\uBBF8\uB798\uC758 \uB0A0\uC9DC\uB294 \uD5C8\uC6A9\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Marked up by ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date older than ${maxAge} days`,
        missingCategory: '\uB204\uB77D\uB41C \uCE74\uD14C\uACE0\uB9AC',
        missingComment: '\uC120\uD0DD\uB41C \uCE74\uD14C\uACE0\uB9AC\uC5D0 \uB300\uD55C \uC124\uBA85\uC774 \uD544\uC694\uD569\uB2C8\uB2E4',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `\uB204\uB77D\uB41C ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '\uACC4\uC0B0\uB41C \uAC70\uB9AC\uC640 \uAE08\uC561\uC774 \uB2E4\uB985\uB2C8\uB2E4';
                case 'card':
                    return '\uCE74\uB4DC \uAC70\uB798\uBCF4\uB2E4 \uD070 \uAE08\uC561';
                default:
                    if (displayPercentVariance) {
                        return `\uC2A4\uCE94\uB41C \uC601\uC218\uC99D\uBCF4\uB2E4 ${displayPercentVariance}% \uB354 \uB9CE\uC740 \uAE08\uC561`;
                    }
                    return '\uC2A4\uCE94\uB41C \uC601\uC218\uC99D\uBCF4\uB2E4 \uD070 \uAE08\uC561';
            }
        },
        modifiedDate: '\uC2A4\uCE94\uB41C \uC601\uC218\uC99D\uACFC \uB0A0\uC9DC\uAC00 \uB2E4\uB985\uB2C8\uB2E4',
        nonExpensiworksExpense: 'Non-Expensiworks \uBE44\uC6A9',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) =>
            `\uC9C0\uCD9C\uC774 \uC790\uB3D9 \uC2B9\uC778 \uD55C\uB3C4\uC778 ${formattedLimit}\uC744 \uCD08\uACFC\uD558\uC600\uC2B5\uB2C8\uB2E4.`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Amount over ${formattedLimit}/person category limit`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Amount over ${formattedLimit}/person limit`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Amount over ${formattedLimit}/person limit`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `\uC77C\uC77C ${formattedLimit}/\uC0AC\uB78C \uCE74\uD14C\uACE0\uB9AC \uC81C\uD55C \uCD08\uACFC \uAE08\uC561`,
        receiptNotSmartScanned:
            '\uC601\uC218\uC99D \uC2A4\uCE94\uC774 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC138\uBD80\uC0AC\uD56D\uC744 \uC218\uB3D9\uC73C\uB85C \uD655\uC778\uD574 \uC8FC\uC138\uC694.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = '\uC601\uC218\uC99D \uD544\uC694';
            if (formattedLimit ?? category) {
                message += '\uC885\uB8CC';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += ' \uCE74\uD14C\uACE0\uB9AC \uC81C\uD55C';
                }
            }
            return message;
        },
        reviewRequired: '\uAC80\uD1A0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return "You didn't provide any text to translate. Please provide the text.";
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Can't auto-match receipt due to broken bank connection which ${email} needs to fix`
                    : '\uC740\uD589 \uC5F0\uACB0\uC774 \uB04A\uC5B4\uC838 \uC601\uC218\uC99D\uC744 \uC790\uB3D9\uC73C\uB85C \uB9E4\uCE6D\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC774\uB97C \uC218\uC815\uD574\uC57C \uD569\uB2C8\uB2E4';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? `Ask ${member} to mark as a cash or wait 7 days and try again`
                    : '\uCE74\uB4DC \uAC70\uB798\uC640 \uBCD1\uD569\uC744 \uAE30\uB2E4\uB9AC\uB294 \uC911\uC785\uB2C8\uB2E4.';
            }
            return "You didn't provide any text to translate. Please provide the text.";
        },
        brokenConnection530Error: '\uC740\uD589 \uC5F0\uACB0\uC774 \uB04A\uC5B4\uC838 \uC601\uC218\uC99D\uC774 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4.',
        adminBrokenConnectionError:
            '\uC740\uD589 \uC5F0\uACB0\uC774 \uB04A\uC5B4\uC838 \uC601\uC218\uC99D\uC774 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4. \uD574\uACB0\uD574 \uC8FC\uC138\uC694.',
        memberBrokenConnectionError:
            '\uC740\uD589 \uC5F0\uACB0\uC774 \uB04A\uC5B4\uC838 \uC601\uC218\uC99D\uC774 \uBCF4\uB958 \uC911\uC785\uB2C8\uB2E4. \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uAD00\uB9AC\uC790\uC5D0\uAC8C \uD574\uACB0\uC744 \uC694\uCCAD\uD558\uC2ED\uC2DC\uC624.',
        markAsCashToIgnore: '\uD604\uAE08\uC73C\uB85C \uD45C\uC2DC\uD558\uC5EC \uBB34\uC2DC\uD558\uACE0 \uACB0\uC81C\uB97C \uC694\uCCAD\uD558\uC2ED\uC2DC\uC624.',
        smartscanFailed:
            '\uC601\uC218\uC99D \uC2A4\uCE94\uC774 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC138\uBD80 \uC815\uBCF4\uB97C \uC218\uB3D9\uC73C\uB85C \uC785\uB825\uD558\uC138\uC694.',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `\uB204\uB77D\uB41C ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} no longer valid`,
        taxAmountChanged: '\uC138\uAE08 \uAE08\uC561\uC774 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tax'} no longer valid`,
        taxRateChanged: '\uC138\uC728\uC774 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        taxRequired: '\uB204\uB77D\uB41C \uC138\uC728',
        none: 'None',
        taxCodeToKeep: '\uC5B4\uB5A4 \uC138\uAE08 \uCF54\uB4DC\uB97C \uC720\uC9C0\uD560\uC9C0 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624',
        tagToKeep: '\uC5B4\uB5A4 \uD0DC\uADF8\uB97C \uC720\uC9C0\uD560\uC9C0 \uC120\uD0DD\uD558\uC138\uC694',
        isTransactionReimbursable: '\uAC70\uB798\uAC00 \uD658\uBD88 \uAC00\uB2A5\uD55C\uC9C0 \uC120\uD0DD\uD558\uC2ED\uC2DC\uC624',
        merchantToKeep: '\uC5B4\uB5A4 \uC0C1\uC778\uC744 \uC720\uC9C0\uD560\uC9C0 \uC120\uD0DD\uD558\uC138\uC694',
        descriptionToKeep: '\uC5B4\uB5A4 \uC124\uBA85\uC744 \uC720\uC9C0\uD560\uC9C0 \uC120\uD0DD\uD558\uC138\uC694',
        categoryToKeep: '\uC5B4\uB5A4 \uCE74\uD14C\uACE0\uB9AC\uB97C \uC720\uC9C0\uD560\uC9C0 \uC120\uD0DD\uD558\uC138\uC694',
        isTransactionBillable: '\uAC70\uB798\uAC00 \uCCAD\uAD6C \uAC00\uB2A5\uD55C\uC9C0 \uC120\uD0DD\uD558\uC138\uC694',
        keepThisOne: '\uC774\uAC83\uC744 \uC720\uC9C0\uD558\uC2ED\uC2DC\uC624',
        confirmDetails: `Confirm the details you're keeping`,
        confirmDuplicatesInfo: `The duplicate requests you don't keep will be held for the member to delete`,
        hold: '\uD640\uB4DC',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is required`,
    },
    violationDismissal: {
        rter: {
            manual: '\uC774 \uC601\uC218\uC99D\uC744 \uD604\uAE08\uC73C\uB85C \uD45C\uC2DC\uD588\uC2B5\uB2C8\uB2E4',
        },
        duplicatedTransaction: {
            manual: '\uC911\uBCF5\uC744 \uD574\uACB0\uD588\uC2B5\uB2C8\uB2E4',
        },
    },
    videoPlayer: {
        play: '\uC7AC\uC0DD',
        pause: '\uC77C\uC2DC \uC911\uC9C0',
        fullscreen: '\uC804\uCCB4 \uD654\uBA74',
        playbackSpeed: '\uC7AC\uC0DD \uC18D\uB3C4',
        expand: '\uD655\uC7A5',
        mute: '\uC74C\uC18C\uAC70',
        unmute: '\uC74C\uC18C\uAC70 \uD574\uC81C',
        normal: '\uC77C\uBC18',
    },
    exitSurvey: {
        header: '\uAC00\uAE30 \uC804\uC5D0',
        reasonPage: {
            title: '\uC65C \uB5A0\uB098\uC2DC\uB294\uC9C0 \uC54C\uB824\uC8FC\uC138\uC694',
            subtitle: '\uB098\uAC00\uAE30 \uC804\uC5D0, \uC65C Expensify Classic\uC73C\uB85C \uC804\uD658\uD558\uACE0 \uC2F6\uC740\uC9C0 \uC54C\uB824\uC8FC\uC138\uC694.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Expensify Classic\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uAE30\uB2A5\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '\uB098\uB294 New Expensify \uC0AC\uC6A9\uBC95\uC744 \uC774\uD574\uD558\uC9C0 \uBABB\uD558\uACA0\uC2B5\uB2C8\uB2E4.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]:
                '\uB098\uB294 New Expensify \uC0AC\uC6A9\uBC95\uC744 \uC774\uD574\uD558\uC9C0\uB9CC, \uB098\uB294 Expensify Classic\uC744 \uC120\uD638\uD569\uB2C8\uB2E4.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]:
                'New Expensify\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uB294 \uC5B4\uB5A4 \uAE30\uB2A5\uC774 \uD544\uC694\uD558\uC2E0\uAC00\uC694?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '\uBB34\uC5C7\uC744 \uC2DC\uB3C4\uD558\uACE0 \uC788\uB098\uC694?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: '\uC65C Expensify Classic\uC744 \uC120\uD638\uD558\uC2DC\uB098\uC694?',
        },
        responsePlaceholder: '\uB2F9\uC2E0\uC758 \uC751\uB2F5',
        thankYou: '\uD53C\uB4DC\uBC31 \uAC10\uC0AC\uD569\uB2C8\uB2E4!',
        thankYouSubtitle:
            '\uADC0\uD558\uC758 \uC751\uB2F5\uC740 \uC6B0\uB9AC\uAC00 \uB354 \uB098\uC740 \uC81C\uD488\uC744 \uB9CC\uB4E4\uC5B4 \uC77C\uC744 \uCC98\uB9AC\uD558\uB294 \uB370 \uB3C4\uC6C0\uC774 \uB420 \uAC83\uC785\uB2C8\uB2E4. \uC815\uB9D0 \uAC10\uC0AC\uD569\uB2C8\uB2E4!',
        goToExpensifyClassic: 'Expensify Classic\uC73C\uB85C \uC804\uD658\uD558\uC138\uC694',
        offlineTitle: '\uC5EC\uAE30\uC11C \uB9C9\uD78C \uAC83 \uAC19\uB124\uC694...',
        offline:
            '\uC624\uD504\uB77C\uC778 \uC0C1\uD0DC\uC778 \uAC83 \uAC19\uC2B5\uB2C8\uB2E4. \uBD88\uD589\uD788\uB3C4 Expensify Classic\uC740 \uC624\uD504\uB77C\uC778\uC5D0\uC11C \uC791\uB3D9\uD558\uC9C0 \uC54A\uC9C0\uB9CC, New Expensify\uB294 \uC791\uB3D9\uD569\uB2C8\uB2E4. \uB9CC\uC57D Expensify Classic\uC744 \uC0AC\uC6A9\uD558\uAE38 \uC6D0\uD55C\uB2E4\uBA74, \uC778\uD130\uB137 \uC5F0\uACB0\uC774 \uAC00\uB2A5\uD560 \uB54C \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uBCF4\uC138\uC694.',
        quickTip: '\uBE60\uB978 \uD301...',
        quickTipSubTitle:
            'expensify.com\uC744 \uBC29\uBB38\uD558\uC5EC \uBC14\uB85C Expensify Classic\uC73C\uB85C \uC774\uB3D9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC27D\uAC8C \uB2E8\uCD95\uD558\uB824\uBA74 \uBD81\uB9C8\uD06C\uD558\uC138\uC694!',
        bookACall: '\uD1B5\uD654 \uC608\uC57D\uD558\uAE30',
        noThanks: '\uC544\uB2C8\uC694, \uAC10\uC0AC\uD569\uB2C8\uB2E4',
        bookACallTitle: '\uC81C\uD488 \uAD00\uB9AC\uC790\uC640 \uB300\uD654\uD558\uACE0 \uC2F6\uC73C\uC2E0\uAC00\uC694?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '\uBE44\uC6A9\uACFC \uBCF4\uACE0\uC11C\uC5D0 \uB300\uD574 \uC9C1\uC811 \uCC44\uD305\uD558\uAE30',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: '\uBAA8\uBC14\uC77C\uC5D0\uC11C \uBAA8\uB4E0 \uAC83\uC744 \uD560 \uC218 \uC788\uB294 \uB2A5\uB825',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: '\uCC44\uD305\uC758 \uC18D\uB3C4\uB85C \uC5EC\uD589 \uBC0F \uBE44\uC6A9',
        },
        bookACallTextTop: 'Expensify Classic\uC73C\uB85C \uC804\uD658\uD558\uBA74 \uB2E4\uC74C\uC744 \uB193\uCE58\uAC8C \uB429\uB2C8\uB2E4:',
        bookACallTextBottom:
            '\uC6B0\uB9AC\uB294 \uC65C \uADF8\uB7F0\uC9C0 \uC774\uD574\uD558\uAE30 \uC704\uD574 \uB2F9\uC2E0\uACFC \uD1B5\uD654\uD558\uB294 \uAC83\uC5D0 \uD765\uBD84\uD560 \uAC83\uC785\uB2C8\uB2E4. \uB2F9\uC2E0\uC758 \uD544\uC694\uC0AC\uD56D\uC744 \uB17C\uC758\uD558\uAE30 \uC704\uD574 \uC6B0\uB9AC\uC758 \uACE0\uAE09 \uC81C\uD488 \uAD00\uB9AC\uC790 \uC911 \uD55C \uBA85\uACFC \uD1B5\uD654\uB97C \uC608\uC57D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
        takeMeToExpensifyClassic: '\uB098\uB97C Expensify Classic\uC73C\uB85C \uB370\uB824\uAC00\uC8FC\uC138\uC694',
    },
    listBoundary: {
        errorMessage: '\uB354 \uB9CE\uC740 \uBA54\uC2DC\uC9C0\uB97C \uB85C\uB529\uD558\uB294 \uB3D9\uC548 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.',
        tryAgain: '\uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694',
    },
    systemMessage: {
        mergedWithCashTransaction: '\uC774 \uAC70\uB798\uC5D0 \uC601\uC218\uC99D\uC744 \uB9E4\uCE6D\uD588\uC2B5\uB2C8\uB2E4',
    },
    subscription: {
        authenticatePaymentCard: '\uACB0\uC81C \uCE74\uB4DC \uC778\uC99D',
        mobileReducedFunctionalityMessage: '\uBAA8\uBC14\uC77C \uC571\uC5D0\uC11C\uB294 \uAD6C\uB3C5\uC5D0 \uB300\uD55C \uBCC0\uACBD\uC744 \uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `\uBB34\uB8CC \uCCB4\uD5D8: ${numOfDays} ${numOfDays === 1 ? '일' : '일'} \uB0A8\uC74C`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '\uB2F9\uC2E0\uC758 \uACB0\uC81C \uC815\uBCF4\uB294 \uAD6C\uC2DD\uC785\uB2C8\uB2E4',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `\uB2F9\uC2E0\uC774 \uC88B\uC544\uD558\uB294 \uBAA8\uB4E0 \uAE30\uB2A5\uC744 \uACC4\uC18D \uC0AC\uC6A9\uD558\uB824\uBA74 ${date}\uAE4C\uC9C0 \uACB0\uC81C \uCE74\uB4DC\uB97C \uC5C5\uB370\uC774\uD2B8\uD558\uC138\uC694.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '\uB2F9\uC2E0\uC758 \uACB0\uC81C \uC815\uBCF4\uB294 \uAD6C\uC2DD\uC785\uB2C8\uB2E4',
                subtitle: '\uACB0\uC81C \uC815\uBCF4\uB97C \uC5C5\uB370\uC774\uD2B8\uD574 \uC8FC\uC138\uC694.',
            },
            policyOwnerUnderInvoicing: {
                title: '\uB2F9\uC2E0\uC758 \uACB0\uC81C \uC815\uBCF4\uB294 \uAD6C\uC2DD\uC785\uB2C8\uB2E4',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `\uB2F9\uC2E0\uC758 \uACB0\uC81C\uAC00 \uC5F0\uCCB4\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC11C\uBE44\uC2A4 \uC911\uB2E8\uC744 \uD53C\uD558\uAE30 \uC704\uD574 ${date}\uAE4C\uC9C0 \uCCAD\uAD6C\uC11C\uB97C \uC9C0\uBD88\uD574 \uC8FC\uC138\uC694.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '\uB2F9\uC2E0\uC758 \uACB0\uC81C \uC815\uBCF4\uB294 \uAD6C\uC2DD\uC785\uB2C8\uB2E4',
                subtitle: '\uB2F9\uC2E0\uC758 \uACB0\uC81C\uAC00 \uC5F0\uCCB4\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uCCAD\uAD6C\uC11C\uB97C \uC9C0\uBD88\uD574 \uC8FC\uC138\uC694.',
            },
            billingDisputePending: {
                title: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uB294 \uCCAD\uAD6C\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4.',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `\uCE74\uB4DC \uB05D \uBC88\uD638\uAC00 ${cardEnding}\uC778 \uCE74\uB4DC\uC5D0 \uB300\uD55C ${amountOwed}\uC758 \uCCAD\uAD6C\uB97C \uBD84\uC7C1\uD558\uC168\uC2B5\uB2C8\uB2E4. \uBD84\uC7C1\uC774 \uC740\uD589\uACFC \uD574\uACB0\uB420 \uB54C\uAE4C\uC9C0 \uADC0\uD558\uC758 \uACC4\uC815\uC740 \uC7A0\uAE41\uB2C8\uB2E4.`,
            },
            cardAuthenticationRequired: {
                title: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uB294 \uCCAD\uAD6C\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `\uB2F9\uC2E0\uC758 \uACB0\uC81C \uCE74\uB4DC\uAC00 \uC644\uC804\uD788 \uC778\uC99D\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. ${cardEnding}\uB85C \uB05D\uB098\uB294 \uACB0\uC81C \uCE74\uB4DC\uB97C \uD65C\uC131\uD654\uD558\uAE30 \uC704\uD574 \uC778\uC99D \uACFC\uC815\uC744 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.`,
            },
            insufficientFunds: {
                title: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uB294 \uCCAD\uAD6C\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4.',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `\uB2F9\uC2E0\uC758 \uACB0\uC81C \uCE74\uB4DC\uAC00 \uC794\uC561 \uBD80\uC871\uC73C\uB85C \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 ${amountOwed} \uBBF8\uB0A9 \uC794\uC561\uC744 \uCCAD\uC0B0\uD558\uAE30 \uC704\uD574 \uC0C8\uB85C\uC6B4 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD574 \uC8FC\uC138\uC694.`,
            },
            cardExpired: {
                title: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uB294 \uCCAD\uAD6C\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4.',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `\uB2F9\uC2E0\uC758 \uACB0\uC81C \uCE74\uB4DC\uAC00 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uBBF8\uACB0\uC81C \uC794\uC561 ${amountOwed}\uC744 \uCCAD\uC0B0\uD558\uAE30 \uC704\uD574 \uC0C8\uB85C\uC6B4 \uACB0\uC81C \uCE74\uB4DC\uB97C \uB4F1\uB85D\uD574 \uC8FC\uC138\uC694.`,
            },
            cardExpireSoon: {
                title: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uAC00 \uACE7 \uB9CC\uB8CC\uB429\uB2C8\uB2E4',
                subtitle:
                    '\uB2F9\uC2E0\uC758 \uACB0\uC81C \uCE74\uB4DC\uB294 \uC774 \uB2EC \uB9D0\uC5D0 \uB9CC\uB8CC\uB429\uB2C8\uB2E4. \uC544\uB798\uC758 \uC138 \uC810 \uBA54\uB274\uB97C \uD074\uB9AD\uD558\uC5EC \uC5C5\uB370\uC774\uD2B8\uD558\uACE0 \uBAA8\uB4E0 \uC88B\uC544\uD558\uB294 \uAE30\uB2A5\uC744 \uACC4\uC18D \uC0AC\uC6A9\uD558\uC138\uC694.',
            },
            retryBillingSuccess: {
                title: '\uC131\uACF5!',
                subtitle: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uCCAD\uAD6C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
            },
            retryBillingError: {
                title: '\uB2F9\uC2E0\uC758 \uCE74\uB4DC\uB294 \uCCAD\uAD6C\uD560 \uC218 \uC5C6\uC5C8\uC2B5\uB2C8\uB2E4.',
                subtitle:
                    '\uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAE30 \uC804\uC5D0, \uC740\uD589\uC5D0 \uC9C1\uC811 \uC5F0\uB77D\uD558\uC5EC Expensify \uCCAD\uAD6C\uB97C \uC2B9\uC778\uD558\uACE0 \uBAA8\uB4E0 \uBCF4\uB958\uB97C \uC81C\uAC70\uD558\uC2ED\uC2DC\uC624. \uADF8\uB807\uC9C0 \uC54A\uC73C\uBA74 \uB2E4\uB978 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD574 \uBCF4\uC2ED\uC2DC\uC624.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `\uCE74\uB4DC \uB05D \uBC88\uD638\uAC00 ${cardEnding}\uC778 \uCE74\uB4DC\uC5D0 \uB300\uD55C ${amountOwed}\uC758 \uCCAD\uAD6C\uB97C \uBD84\uC7C1\uD558\uC168\uC2B5\uB2C8\uB2E4. \uBD84\uC7C1\uC774 \uC740\uD589\uACFC \uD574\uACB0\uB420 \uB54C\uAE4C\uC9C0 \uADC0\uD558\uC758 \uACC4\uC815\uC740 \uC7A0\uAE41\uB2C8\uB2E4.`,
            preTrial: {
                title: '\uBB34\uB8CC \uCCB4\uD5D8 \uC2DC\uC791\uD558\uAE30',
                subtitleStart: '\uB2E4\uC74C \uB2E8\uACC4\uB85C,',
                subtitleLink: '\uC124\uC815 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8\uB97C \uC644\uB8CC\uD558\uC138\uC694',
                subtitleEnd: '\uADF8\uB798\uC11C \uB2F9\uC2E0\uC758 \uD300\uC774 \uBE44\uC6A9\uC744 \uCCAD\uAD6C\uD558\uAE30 \uC2DC\uC791\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `\uC2DC\uD5D8: ${numOfDays} ${numOfDays === 1 ? '일' : '일'} \uB0A8\uC558\uC2B5\uB2C8\uB2E4!`,
                subtitle:
                    '\uB2F9\uC2E0\uC774 \uC88B\uC544\uD558\uB294 \uBAA8\uB4E0 \uAE30\uB2A5\uC744 \uACC4\uC18D \uC0AC\uC6A9\uD558\uB824\uBA74 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
            },
            trialEnded: {
                title: '\uB2F9\uC2E0\uC758 \uBB34\uB8CC \uCCB4\uD5D8 \uAE30\uAC04\uC774 \uC885\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
                subtitle:
                    '\uB2F9\uC2E0\uC774 \uC88B\uC544\uD558\uB294 \uBAA8\uB4E0 \uAE30\uB2A5\uC744 \uACC4\uC18D \uC0AC\uC6A9\uD558\uB824\uBA74 \uACB0\uC81C \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
            },
            earlyDiscount: {
                claimOffer: '\uC81C\uC548\uC744 \uCCAD\uAD6C\uD558\uB2E4',
                noThanks: '\uC544\uB2C8\uC694, \uAC10\uC0AC\uD569\uB2C8\uB2E4',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `\uCCAB \uD574\uC5D0 ${discountType}% \uD560\uC778!`,
                    phrase2: `Just add a payment card and start an annual subscription.`,
                },
                onboardingChatTitle: {
                    phrase1: '\uD55C\uC815 \uC2DC\uAC04 \uC81C\uC548:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `\uCCAB \uD574\uC5D0 ${discountType}% \uD560\uC778!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) =>
                    `${hours}\uC2DC\uAC04 : ${minutes}\uBD84 : ${seconds}\uCD08 \uC774\uB0B4\uC5D0 \uCCAD\uAD6C\uD558\uC138\uC694`,
            },
        },
        cardSection: {
            title: '\uACB0\uC81C',
            subtitle: 'Expensify \uAD6C\uB3C5\uB8CC\uB97C \uC9C0\uBD88\uD558\uAE30 \uC704\uD574 \uCE74\uB4DC\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
            addCardButton: '\uACB0\uC81C \uCE74\uB4DC \uCD94\uAC00',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `\uB2F9\uC2E0\uC758 \uB2E4\uC74C \uACB0\uC81C \uB0A0\uC9DC\uB294 ${nextPaymentDate}\uC785\uB2C8\uB2E4.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Card ending in ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `\uC774\uB984: ${name}, \uB9CC\uB8CC: ${expiration}, \uD654\uD3D0: ${currency}`,
            changeCard: '\uACB0\uC81C \uCE74\uB4DC \uBCC0\uACBD',
            changeCurrency: '\uACB0\uC81C \uD1B5\uD654 \uBCC0\uACBD',
            cardNotFound: '\uACB0\uC81C \uCE74\uB4DC\uAC00 \uCD94\uAC00\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4',
            retryPaymentButton: '\uACB0\uC81C \uC7AC\uC2DC\uB3C4',
            authenticatePayment: '\uACB0\uC81C \uC778\uC99D',
            requestRefund: '\uD658\uBD88 \uC694\uCCAD',
            requestRefundModal: {
                phrase1:
                    '\uD658\uBD88 \uBC1B\uAE30\uB294 \uC27D\uC2B5\uB2C8\uB2E4, \uB2E4\uC74C \uCCAD\uAD6C\uC77C \uC804\uC5D0 \uACC4\uC815\uC744 \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD558\uBA74 \uD658\uBD88\uC744 \uBC1B\uAC8C \uB429\uB2C8\uB2E4.',
                phrase2:
                    '\uC8FC\uC758: \uACC4\uC815\uC744 \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD558\uBA74 \uC791\uC5C5 \uACF5\uAC04\uC774 \uC0AD\uC81C\uB429\uB2C8\uB2E4. \uC774 \uC791\uC5C5\uC740 \uCDE8\uC18C\uD560 \uC218 \uC5C6\uC9C0\uB9CC, \uB9C8\uC74C\uC774 \uBC14\uB00C\uBA74 \uC5B8\uC81C\uB4E0\uC9C0 \uC0C8\uB85C\uC6B4 \uC791\uC5C5 \uACF5\uAC04\uC744 \uB9CC\uB4E4 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
                confirm: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC0AD\uC81C \uBC0F \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC',
            },
            viewPaymentHistory: '\uACB0\uC81C \uB0B4\uC5ED \uBCF4\uAE30',
        },
        yourPlan: {
            title: '\uB2F9\uC2E0\uC758 \uACC4\uD68D',
            collect: {
                title: '\uC218\uC9D1',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card\uB97C \uAC00\uC9C4 ${lower}/\uD65C\uC131 \uBA64\uBC84\uB85C\uBD80\uD130, Expensify Card\uB97C \uAC00\uC9C0\uC9C0 \uC54A\uC740 ${upper}/\uD65C\uC131 \uBA64\uBC84\uAE4C\uC9C0.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card\uB97C \uAC00\uC9C4 ${lower}/\uD65C\uC131 \uBA64\uBC84\uB85C\uBD80\uD130, Expensify Card\uB97C \uAC00\uC9C0\uC9C0 \uC54A\uC740 ${upper}/\uD65C\uC131 \uBA64\uBC84\uAE4C\uC9C0.`,
                benefit1: '\uBB34\uC81C\uD55C \uC2A4\uB9C8\uD2B8\uC2A4\uCE94 \uBC0F \uAC70\uB9AC \uCD94\uC801',
                benefit2: '\uC2A4\uB9C8\uD2B8 \uD55C\uB3C4\uAC00 \uC788\uB294 Expensify \uCE74\uB4DC',
                benefit3: '\uCCAD\uAD6C\uC11C \uC9C0\uBD88 \uBC0F \uC1A1\uC7A5 \uBC1C\uD589',
                benefit4: '\uBE44\uC6A9 \uC2B9\uC778',
                benefit5: 'ACH \uD658\uBD88',
                benefit6: 'QuickBooks\uC640 Xero \uD1B5\uD569',
                benefit7: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uC778\uC0AC\uC774\uD2B8 \uBC0F \uBCF4\uACE0\uC11C',
            },
            control: {
                title: '\uC81C\uC5B4',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card\uB97C \uAC00\uC9C4 ${lower}/\uD65C\uC131 \uBA64\uBC84\uB85C\uBD80\uD130, Expensify Card\uB97C \uAC00\uC9C0\uC9C0 \uC54A\uC740 ${upper}/\uD65C\uC131 \uBA64\uBC84\uAE4C\uC9C0.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card\uB97C \uAC00\uC9C4 ${lower}/\uD65C\uC131 \uBA64\uBC84\uB85C\uBD80\uD130, Expensify Card\uB97C \uAC00\uC9C0\uC9C0 \uC54A\uC740 ${upper}/\uD65C\uC131 \uBA64\uBC84\uAE4C\uC9C0.`,
                benefit1: 'Collect\uC758 \uBAA8\uB4E0 \uAC83, \uB354\uD558\uC5EC:',
                benefit2: 'NetSuite\uACFC Sage Intacct \uD1B5\uD569',
                benefit3: 'Certinia\uC640 Workday \uB3D9\uAE30\uD654',
                benefit4: '\uB2E4\uC911 \uBE44\uC6A9 \uC2B9\uC778\uC790',
                benefit5: 'SAML/SSO',
                benefit6: '\uC608\uC0B0 \uC9D1\uD589',
            },
            saveWithExpensifyTitle: 'Expensify \uCE74\uB4DC\uB85C \uC808\uC57D\uD558\uC138\uC694',
            saveWithExpensifyDescription:
                '\uC6B0\uB9AC\uC758 \uC800\uCD95 \uACC4\uC0B0\uAE30\uB97C \uC0AC\uC6A9\uD558\uC5EC Expensify \uCE74\uB4DC\uC5D0\uC11C \uBC1B\uB294 \uD604\uAE08 \uBC18\uD658\uC774 \uC5B4\uB5BB\uAC8C Expensify \uCCAD\uAD6C\uC11C\uB97C \uC904\uC77C \uC218 \uC788\uB294\uC9C0 \uD655\uC778\uD574\uBCF4\uC138\uC694.',
            saveWithExpensifyButton: '\uB354 \uC54C\uC544\uBCF4\uAE30',
        },
        details: {
            title: '\uAD6C\uB3C5 \uC138\uBD80 \uC815\uBCF4',
            annual: '\uC5F0\uAC04 \uAD6C\uB3C5',
            taxExempt: '\uC138\uAE08 \uBA74\uC81C \uC0C1\uD0DC \uC694\uCCAD',
            taxExemptEnabled: '\uBA74\uC138',
            payPerUse: '\uC0AC\uC6A9\uB7C9\uBCC4 \uACB0\uC81C',
            subscriptionSize: '\uAD6C\uB3C5 \uD06C\uAE30',
            headsUp:
                '\uC8FC\uC758: \uC9C0\uAE08 \uAD6C\uB3C5 \uD06C\uAE30\uB97C \uC124\uC815\uD558\uC9C0 \uC54A\uC73C\uBA74, \uCCAB \uB2EC\uC758 \uD65C\uC131 \uD68C\uC6D0 \uC218\uB85C \uC790\uB3D9 \uC124\uC815\uB429\uB2C8\uB2E4. \uADF8\uB7F0 \uB2E4\uC74C \uB2E4\uC74C 12\uAC1C\uC6D4 \uB3D9\uC548 \uCD5C\uC18C\uD55C \uC774 \uC218\uC758 \uD68C\uC6D0\uC5D0 \uB300\uD55C \uBE44\uC6A9\uC744 \uC9C0\uBD88\uD574\uC57C \uD569\uB2C8\uB2E4. \uAD6C\uB3C5 \uD06C\uAE30\uB294 \uC5B8\uC81C\uB4E0\uC9C0 \uB298\uB9B4 \uC218 \uC788\uC9C0\uB9CC, \uAD6C\uB3C5\uC774 \uB05D\uB0A0 \uB54C\uAE4C\uC9C0 \uC904\uC77C \uC218\uB294 \uC5C6\uC2B5\uB2C8\uB2E4.',
            zeroCommitment: '\uD560\uC778\uB41C \uC5F0\uAC04 \uAD6C\uB3C5 \uC694\uAE08\uC5D0 \uB300\uD55C \uC81C\uB85C \uCEE4\uBC0B\uBA3C\uD2B8',
        },
        subscriptionSize: {
            title: '\uAD6C\uB3C5 \uD06C\uAE30',
            yourSize:
                '\uB2F9\uC2E0\uC758 \uAD6C\uB3C5 \uD06C\uAE30\uB294 \uC8FC\uC5B4\uC9C4 \uB2EC\uC5D0 \uC5B4\uB5A4 \uD65C\uB3D9 \uC911\uC778 \uBA64\uBC84\uB4E0 \uCC28\uC9C0\uD560 \uC218 \uC788\uB294 \uC5F4\uB9B0 \uC88C\uC11D\uC758 \uC218\uC785\uB2C8\uB2E4.',
            eachMonth:
                '\uB9E4\uB2EC, \uAD6C\uB3C5\uC740 \uC704\uC5D0 \uC124\uC815\uB41C \uD65C\uC131 \uBA64\uBC84 \uC218\uAE4C\uC9C0 \uCEE4\uBC84\uB429\uB2C8\uB2E4. \uAD6C\uB3C5 \uD06C\uAE30\uB97C \uB298\uB9B4 \uB54C\uB9C8\uB2E4, \uC0C8\uB85C\uC6B4 \uD06C\uAE30\uB85C \uC0C8\uB85C\uC6B4 12\uAC1C\uC6D4 \uAD6C\uB3C5\uC774 \uC2DC\uC791\uB429\uB2C8\uB2E4.',
            note: '\uCC38\uACE0: \uD65C\uC131 \uBA64\uBC84\uB294 \uD68C\uC0AC \uC791\uC5C5 \uACF5\uAC04\uC5D0 \uC5F0\uACB0\uB41C \uBE44\uC6A9 \uB370\uC774\uD130\uB97C \uC0DD\uC131, \uD3B8\uC9D1, \uC81C\uCD9C, \uC2B9\uC778, \uD658\uBD88, \uB610\uB294 \uB0B4\uBCF4\uB0B4\uAE30\uD55C \uBAA8\uB4E0 \uC0AC\uB78C\uC744 \uB9D0\uD569\uB2C8\uB2E4.',
            confirmDetails: '\uC0C8\uB85C\uC6B4 \uC5F0\uAC04 \uAD6C\uB3C5 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uC138\uC694:',
            subscriptionSize: '\uAD6C\uB3C5 \uD06C\uAE30',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} active members/month`,
            subscriptionRenews: '\uAD6C\uB3C5\uC774 \uAC31\uC2E0\uB429\uB2C8\uB2E4',
            youCantDowngrade: '\uB2F9\uC2E0\uC740 \uC5F0\uAC04 \uAD6C\uB3C5 \uAE30\uAC04 \uB3D9\uC548 \uB2E4\uC6B4\uADF8\uB808\uC774\uB4DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `\uB2F9\uC2E0\uC740 \uC774\uBBF8 ${size}\uBA85\uC758 \uD65C\uC131 \uD68C\uC6D0\uC744 \uC704\uD55C \uC5F0\uAC04 \uAD6C\uB3C5\uC744 ${date}\uAE4C\uC9C0 \uC57D\uC815\uD558\uC168\uC2B5\uB2C8\uB2E4. \uC790\uB3D9 \uAC31\uC2E0\uC744 \uBE44\uD65C\uC131\uD654\uD568\uC73C\uB85C\uC368 ${date}\uC5D0 \uC0AC\uC6A9\uB7C9\uC5D0 \uB530\uB978 \uACB0\uC81C \uAD6C\uB3C5\uC73C\uB85C \uC804\uD658\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`,
            error: {
                size: '\uC720\uD6A8\uD55C \uAD6C\uB3C5 \uD06C\uAE30\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
                sameSize: '\uD604\uC7AC \uAD6C\uB3C5 \uD06C\uAE30\uC640 \uB2E4\uB978 \uC22B\uC790\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
            },
        },
        paymentCard: {
            addPaymentCard: '\uACB0\uC81C \uCE74\uB4DC \uCD94\uAC00',
            enterPaymentCardDetails: '\uACB0\uC81C \uCE74\uB4DC \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694',
            security:
                'Expensify\uB294 PCI-DSS\uB97C \uC900\uC218\uD558\uBA70, \uC740\uD589 \uC218\uC900\uC758 \uC554\uD638\uD654\uB97C \uC0AC\uC6A9\uD558\uACE0, \uC911\uBCF5 \uC778\uD504\uB77C\uB97C \uD65C\uC6A9\uD558\uC5EC \uADC0\uD558\uC758 \uB370\uC774\uD130\uB97C \uBCF4\uD638\uD569\uB2C8\uB2E4.',
            learnMoreAboutSecurity: '\uC6B0\uB9AC\uC758 \uBCF4\uC548\uC5D0 \uB300\uD574 \uB354 \uC54C\uC544\uBCF4\uC138\uC694.',
        },
        subscriptionSettings: {
            title: '\uAD6C\uB3C5 \uC124\uC815',
            autoRenew: '\uC790\uB3D9 \uAC31\uC2E0',
            autoIncrease: '\uC790\uB3D9 \uC99D\uAC00 \uC5F0\uAC04 \uC88C\uC11D',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) =>
                `\uD65C\uC131 \uD68C\uC6D0\uB2F9 \uCD5C\uB300 ${amountWithCurrency}/\uC6D4\uC744 \uC808\uC57D\uD558\uC138\uC694`,
            automaticallyIncrease:
                '\uD65C\uC131 \uBA64\uBC84\uAC00 \uAD6C\uB3C5 \uD06C\uAE30\uB97C \uCD08\uACFC\uD560 \uACBD\uC6B0 \uC5F0\uAC04 \uC88C\uC11D\uC744 \uC790\uB3D9\uC73C\uB85C \uB298\uB824\uC90D\uB2C8\uB2E4. \uCC38\uACE0: \uC774\uB807\uAC8C \uD558\uBA74 \uC5F0\uAC04 \uAD6C\uB3C5 \uC885\uB8CC \uB0A0\uC9DC\uAC00 \uC5F0\uC7A5\uB429\uB2C8\uB2E4.',
            disableAutoRenew: '\uC790\uB3D9 \uAC31\uC2E0 \uBE44\uD65C\uC131\uD654',
            helpUsImprove: 'Expensify\uB97C \uAC1C\uC120\uD558\uB294 \uB370 \uB3C4\uC6C0\uC744 \uC8FC\uC138\uC694',
            whatsMainReason: '\uC790\uB3D9 \uAC31\uC2E0\uC744 \uBE44\uD65C\uC131\uD654\uD558\uB294 \uC8FC\uC694 \uC774\uC720\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renews on ${date}.`,
        },
        requestEarlyCancellation: {
            title: '\uC870\uAE30 \uCDE8\uC18C \uC694\uCCAD',
            subtitle: '\uB2F9\uC2E0\uC774 \uC870\uAE30 \uCDE8\uC18C\uB97C \uC694\uCCAD\uD558\uB294 \uC8FC\uC694 \uC774\uC720\uB294 \uBB34\uC5C7\uC778\uAC00\uC694?',
            subscriptionCanceled: {
                title: '\uAD6C\uB3C5\uC774 \uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
                subtitle: '\uB2F9\uC2E0\uC758 \uC5F0\uAC04 \uAD6C\uB3C5\uC774 \uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
                info: '\uB2F9\uC2E0\uC774 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uACC4\uC18D\uD574\uC11C \uC0AC\uC6A9\uD558\uAE38 \uC6D0\uD558\uC2E0\uB2E4\uBA74, \uC774\uBBF8 \uBAA8\uB4E0 \uAC83\uC774 \uC900\uBE44\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.',
                preventFutureActivity: {
                    part1: '\uBBF8\uB798\uC758 \uD65C\uB3D9\uACFC \uC694\uAE08\uC744 \uBC29\uC9C0\uD558\uB824\uBA74 \uBC18\uB4DC\uC2DC',
                    link: '\uB2F9\uC2E0\uC758 \uC791\uC5C5 \uACF5\uAC04\uC744 \uC0AD\uC81C\uD558\uC138\uC694',
                    part2: '. \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uB97C \uC0AD\uC81C\uD558\uBA74 \uD604\uC7AC \uB2EC\uB825 \uC6D4 \uB3D9\uC548 \uBC1C\uC0DD\uD55C \uBAA8\uB4E0 \uBBF8\uACB0\uC81C \uD65C\uB3D9\uC5D0 \uB300\uD574 \uCCAD\uAD6C\uB429\uB2C8\uB2E4.',
                },
            },
            requestSubmitted: {
                title: '\uC694\uCCAD\uC774 \uC81C\uCD9C\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
                subtitle: {
                    part1: '\uB2F9\uC2E0\uC774 \uAD6C\uB3C5\uC744 \uCDE8\uC18C\uD558\uACE0\uC790 \uD558\uB294 \uAC83\uC5D0 \uB300\uD574 \uC54C\uB824\uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4. \uC6B0\uB9AC\uB294 \uB2F9\uC2E0\uC758 \uC694\uCCAD\uC744 \uAC80\uD1A0 \uC911\uC774\uBA70, \uACE7 \uCC44\uD305\uC744 \uD1B5\uD574 \uC5F0\uB77D\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4.',
                    link: '\uCF69\uC2DC\uC5D0\uB974\uC8FC',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: '\uC870\uAE30 \uCDE8\uC18C\uB97C \uC694\uCCAD\uD568\uC73C\uB85C\uC368, \uC800\uB294 Expensify\uAC00 \uC774\uB7EC\uD55C \uC694\uCCAD\uC744 \uC2B9\uC778\uD560 \uC758\uBB34\uAC00 \uC5C6\uC74C\uC744 \uC778\uC815\uD558\uACE0 \uB3D9\uC758\uD569\uB2C8\uB2E4.',
                link: '\uC11C\uBE44\uC2A4 \uC774\uC6A9 \uC57D\uAD00',
                part2: '\uB610\uB294 \uB098\uC640 Expensify \uC0AC\uC774\uC758 \uB2E4\uB978 \uC801\uC6A9 \uAC00\uB2A5\uD55C \uC11C\uBE44\uC2A4 \uACC4\uC57D\uC5D0 \uB530\uB77C Expensify\uB294 \uC774\uB7EC\uD55C \uC694\uCCAD\uC744 \uC2B9\uC778\uD558\uB294 \uAC83\uC5D0 \uB300\uD574 \uC804\uC801\uC778 \uC7AC\uB7C9\uC744 \uAC16\uB294\uB2E4\uB294 \uAC83\uC744 \uC774\uD574\uD569\uB2C8\uB2E4.',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: '\uAE30\uB2A5\uC774 \uAC1C\uC120\uC774 \uD544\uC694\uD569\uB2C8\uB2E4',
        tooExpensive: '\uB108\uBB34 \uBE44\uC2F8\uC694',
        inadequateSupport: '\uBD80\uC801\uC808\uD55C \uACE0\uAC1D \uC9C0\uC6D0',
        businessClosing: '\uD68C\uC0AC \uD3D0\uC1C4, \uCD95\uC18C, \uB610\uB294 \uC778\uC218',
        additionalInfoTitle:
            '\uC5B4\uB5A4 \uC18C\uD504\uD2B8\uC6E8\uC5B4\uB85C \uC774\uB3D9\uD558\uC2DC\uB294\uC9C0 \uADF8\uB9AC\uACE0 \uC65C \uADF8\uB807\uAC8C \uD558\uC2DC\uB294\uC9C0\uC694?',
        additionalInfoInputLabel: '\uB2F9\uC2E0\uC758 \uC751\uB2F5',
    },
    roomChangeLog: {
        updateRoomDescription: '\uBC29 \uC124\uBA85\uC744 \uB2E4\uC74C\uC73C\uB85C \uC124\uC815\uD558\uC2ED\uC2DC\uC624:',
        clearRoomDescription: '\uBC29 \uC124\uBA85\uC744 \uC9C0\uC6E0\uC2B5\uB2C8\uB2E4',
    },
    delegate: {
        switchAccount: '\uACC4\uC815 \uC804\uD658:',
        copilotDelegatedAccess: 'Copilot: \uC704\uC784\uB41C \uC811\uADFC',
        copilotDelegatedAccessDescription:
            '\uB2E4\uB978 \uD68C\uC6D0\uB4E4\uC774 \uADC0\uD558\uC758 \uACC4\uC815\uC5D0 \uC811\uADFC\uD560 \uC218 \uC788\uB3C4\uB85D \uD5C8\uC6A9\uD558\uC138\uC694.',
        addCopilot: '\uCF54\uD30C\uC77C\uB7FF \uCD94\uAC00',
        membersCanAccessYourAccount: '\uB2E4\uC74C \uBA64\uBC84\uB4E4\uC774 \uADC0\uD558\uC758 \uACC4\uC815\uC5D0 \uC811\uADFC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4:',
        youCanAccessTheseAccounts: '\uC774 \uACC4\uC815\uB4E4\uC740 \uACC4\uC815 \uC804\uD658\uAE30\uB97C \uD1B5\uD574 \uC811\uADFC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '\uC804\uCCB4';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '\uC81C\uD55C\uB41C';
                default:
                    return "You didn't provide any text to translate. Please provide the text.";
            }
        },
        genericError: '\uC774\uB7F0, \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `on behalf of ${delegator}`,
        accessLevel: '\uC811\uADFC \uB808\uBCA8',
        confirmCopilot: '\uC544\uB798\uC5D0\uC11C \uB2F9\uC2E0\uC758 \uC870\uC885\uC0AC\uB97C \uD655\uC778\uD558\uC138\uC694.',
        accessLevelDescription:
            '\uC544\uB798\uC5D0\uC11C \uC561\uC138\uC2A4 \uB808\uBCA8\uC744 \uC120\uD0DD\uD558\uC138\uC694. \uC804\uCCB4 \uBC0F \uC81C\uD55C \uC561\uC138\uC2A4 \uBAA8\uB450\uAC00 \uC870\uC885\uC0AC\uAC00 \uBAA8\uB4E0 \uB300\uD654\uC640 \uBE44\uC6A9\uC744 \uBCFC \uC218 \uC788\uAC8C \uD569\uB2C8\uB2E4.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '\uB2E4\uB978 \uD68C\uC6D0\uC774 \uADC0\uD558\uC758 \uACC4\uC815\uC5D0\uC11C \uBAA8\uB4E0 \uD589\uB3D9\uC744 \uB300\uC2E0 \uC218\uD589\uD558\uB3C4\uB85D \uD5C8\uC6A9\uD569\uB2C8\uB2E4. \uCC44\uD305, \uC81C\uCD9C, \uC2B9\uC778, \uACB0\uC81C, \uC124\uC815 \uC5C5\uB370\uC774\uD2B8 \uB4F1\uC774 \uD3EC\uD568\uB429\uB2C8\uB2E4.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '\uB2E4\uB978 \uD68C\uC6D0\uC5D0\uAC8C \uADC0\uD558\uC758 \uACC4\uC815\uC5D0\uC11C \uB300\uBD80\uBD84\uC758 \uC791\uC5C5\uC744 \uB300\uC2E0 \uC218\uD589\uD558\uB3C4\uB85D \uD5C8\uC6A9\uD569\uB2C8\uB2E4. \uC2B9\uC778, \uACB0\uC81C, \uAC70\uC808, \uBCF4\uB958\uB294 \uC81C\uC678\uB429\uB2C8\uB2E4.';
                default:
                    return "You didn't provide any text to translate. Please provide the text.";
            }
        },
        removeCopilot: '\uCF54\uD30C\uC77C\uB7FF \uC81C\uAC70',
        removeCopilotConfirmation: '\uC774 \uB3D9\uB8CC\uB97C \uC815\uB9D0\uB85C \uC81C\uAC70\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        changeAccessLevel: '\uC811\uADFC \uB808\uBCA8 \uBCC0\uACBD',
        makeSureItIsYou: '\uB2F9\uC2E0\uC774 \uB9DE\uB294\uC9C0 \uD655\uC778\uD574\uBD05\uC2DC\uB2E4',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: '\uADF8\uB807\uAC8C \uBE60\uB974\uAC8C\uB294 \uC548 \uB3FC...',
        noAccessMessage:
            '\uCF54\uD30C\uC77C\uB7FF\uC73C\uB85C\uC11C, \uB2F9\uC2E0\uC740 \uC774 \uD398\uC774\uC9C0\uC5D0 \uC811\uADFC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC8C4\uC1A1\uD569\uB2C8\uB2E4!',
        notAllowedMessageStart: `As a`,
        notAllowedMessageHyperLinked: '\uCF54\uD30C\uC77C\uB7FF',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => ` for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
    },
    debug: {
        debug: '\uB514\uBC84\uADF8',
        details: '\uC138\uBD80 \uC0AC\uD56D',
        JSON: 'JSON',
        reportActions: '\uD589\uB3D9\uB4E4',
        reportActionPreview: '\uBBF8\uB9AC\uBCF4\uAE30',
        nothingToPreview: '\uBBF8\uB9AC\uBCF4\uAE30\uD560 \uAC83\uC774 \uC5C6\uC2B5\uB2C8\uB2E4',
        editJson: 'JSON \uD3B8\uC9D1:',
        preview: '\uBBF8\uB9AC\uBCF4\uAE30:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `\uC798\uBABB\uB41C \uC18D\uC131: ${propertyName} - \uC608\uC0C1: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `\uC798\uBABB\uB41C \uAC12 - \uC608\uC0C1 \uAC12: ${expectedValues}`,
        missingValue: '\uB204\uB77D\uB41C \uAC12',
        createReportAction: '\uBCF4\uACE0\uC11C \uC791\uC131 \uC561\uC158',
        reportAction: '\uBCF4\uACE0\uC11C \uC791\uC5C5',
        report: '\uBCF4\uACE0\uC11C',
        transaction: '\uAC70\uB798',
        violations: '\uC704\uBC18 \uC0AC\uD56D\uB4E4',
        transactionViolation: '\uAC70\uB798 \uC704\uBC18',
        hint: '\uB370\uC774\uD130 \uBCC0\uACBD \uC0AC\uD56D\uC740 \uBC31\uC5D4\uB4DC\uB85C \uC804\uC1A1\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4',
        textFields: '\uD14D\uC2A4\uD2B8 \uD544\uB4DC',
        numberFields: '\uC22B\uC790 \uD544\uB4DC',
        booleanFields: '\uBD88\uB9AC\uC5B8 \uD544\uB4DC',
        constantFields: '\uC0C1\uC218 \uD544\uB4DC',
        dateTimeFields: '\uB0A0\uC9DC\uC640 \uC2DC\uAC04 \uD544\uB4DC',
        date: '\uB0A0\uC9DC',
        time: '\uC2DC\uAC04',
        none: 'None',
        visibleInLHN: 'LHN\uC5D0\uC11C \uBCF4\uC774\uB294',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: '\uAC70\uC9D3',
        viewReport: '\uBCF4\uACE0\uC11C \uBCF4\uAE30',
        viewTransaction: '\uAC70\uB798 \uBCF4\uAE30',
        createTransactionViolation: '\uD2B8\uB79C\uC7AD\uC158 \uC704\uBC18 \uC0DD\uC131',
        reasonVisibleInLHN: {
            hasDraftComment: '\uC784\uC2DC \uC800\uC7A5\uB41C \uB313\uAE00\uC774 \uC788\uC2B5\uB2C8\uB2E4',
            hasGBR: 'GBR\uC774 \uC788\uC2B5\uB2C8\uAE4C',
            hasRBR: 'RBR\uC774 \uC788\uC2B5\uB2C8\uAE4C?',
            pinnedByUser: '\uBA64\uBC84\uC5D0 \uC758\uD574 \uACE0\uC815\uB428',
            hasIOUViolations: 'IOU \uC704\uBC18 \uC0AC\uD56D\uC774 \uC788\uC2B5\uB2C8\uB2E4',
            hasAddWorkspaceRoomErrors: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBC29 \uCD94\uAC00\uC5D0 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD558\uC600\uC2B5\uB2C8\uB2E4',
            isUnread: '\uC77D\uC9C0 \uC54A\uC74C (\uD3EC\uCEE4\uC2A4 \uBAA8\uB4DC)',
            isArchived: '\uBCF4\uAD00\uB428 (\uAC00\uC7A5 \uCD5C\uADFC \uBAA8\uB4DC)',
            isSelfDM: '\uC790\uAE30 \uC790\uC2E0\uC5D0\uAC8C DM \uBCF4\uB0B4\uAE30',
            isFocused: '\uC784\uC2DC\uC801\uC73C\uB85C \uC9D1\uC911\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4',
        },
        reasonGBR: {
            hasJoinRequest: '\uAC00\uC785 \uC694\uCCAD\uC774 \uC788\uC2B5\uB2C8\uB2E4 (\uAD00\uB9AC\uC790 \uBC29)',
            isUnreadWithMention: '\uC5B8\uAE09\uACFC \uD568\uAED8 \uC77D\uC9C0 \uC54A\uC74C',
            isWaitingForAssigneeToCompleteAction: '\uD560\uB2F9\uB41C \uC0AC\uB78C\uC774 \uC791\uC5C5\uC744 \uC644\uB8CC\uD558\uAE30\uB97C \uAE30\uB2E4\uB9AC\uB294 \uC911\uC785\uB2C8\uB2E4',
            hasChildReportAwaitingAction: '\uC790\uC2DD \uBCF4\uACE0\uC11C\uAC00 \uCC98\uB9AC\uB97C \uAE30\uB2E4\uB9AC\uACE0 \uC788\uC2B5\uB2C8\uB2E4',
            hasMissingInvoiceBankAccount: '\uC1A1\uC7A5 \uC740\uD589 \uACC4\uC88C\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
        },
        reasonRBR: {
            hasErrors: '\uBCF4\uACE0\uC11C \uB610\uB294 \uBCF4\uACE0\uC11C \uC791\uC5C5 \uB370\uC774\uD130\uC5D0 \uC624\uB958\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            hasViolations: '\uC704\uBC18 \uC0AC\uD56D\uC774 \uC788\uC2B5\uB2C8\uB2E4',
            hasTransactionThreadViolations: '\uD2B8\uB79C\uC7AD\uC158 \uC2A4\uB808\uB4DC \uC704\uBC18\uC774 \uC788\uC2B5\uB2C8\uB2E4',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '\uC870\uCE58\uB97C \uAE30\uB2E4\uB9AC\uB294 \uBCF4\uACE0\uC11C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            theresAReportWithErrors: '\uC624\uB958\uAC00 \uC788\uB294 \uBCF4\uACE0\uC11C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            theresAWorkspaceWithCustomUnitsErrors: '\uC0AC\uC6A9\uC790 \uC815\uC758 \uB2E8\uC704 \uC624\uB958\uAC00 \uC788\uB294 \uC791\uC5C5 \uACF5\uAC04\uC774 \uC788\uC2B5\uB2C8\uB2E4',
            theresAProblemWithAWorkspaceMember: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uBA64\uBC84\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            theresAProblemWithAContactMethod: '\uC5F0\uB77D \uBC29\uBC95\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            aContactMethodRequiresVerification: '\uC5F0\uB77D \uBC29\uBC95\uC5D0\uB294 \uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4',
            theresAProblemWithAPaymentMethod: '\uACB0\uC81C \uBC29\uBC95\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            theresAProblemWithAWorkspace: '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            theresAProblemWithYourReimbursementAccount: '\uB2F9\uC2E0\uC758 \uD658\uBD88 \uACC4\uC88C\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            theresABillingProblemWithYourSubscription: '\uB2F9\uC2E0\uC758 \uAD6C\uB3C5\uC5D0 \uACB0\uC81C \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            yourSubscriptionHasBeenSuccessfullyRenewed: '\uB2F9\uC2E0\uC758 \uAD6C\uB3C5\uC774 \uC131\uACF5\uC801\uC73C\uB85C \uAC31\uC2E0\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
            theresWasAProblemDuringAWorkspaceConnectionSync:
                '\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC5F0\uACB0 \uB3D9\uAE30\uD654 \uC911\uC5D0 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4',
            theresAProblemWithYourWallet: '\uB2F9\uC2E0\uC758 \uC9C0\uAC11\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
            theresAProblemWithYourWalletTerms: '\uB2F9\uC2E0\uC758 \uC9C0\uAC11 \uC774\uC6A9 \uC57D\uAD00\uC5D0 \uBB38\uC81C\uAC00 \uC788\uC2B5\uB2C8\uB2E4',
        },
    },
    emptySearchView: {
        takeATour: '\uD22C\uC5B4\uB97C \uB458\uB7EC\uBCF4\uC138\uC694',
    },
    tour: {
        takeATwoMinuteTour: '2\uBD84 \uB3D9\uC548 \uD22C\uC5B4\uB97C \uD574\uBCF4\uC138\uC694',
        exploreExpensify: 'Expensify\uAC00 \uC81C\uACF5\uD558\uB294 \uBAA8\uB4E0 \uAC83\uC744 \uD0D0\uC0C9\uD574\uBCF4\uC138\uC694',
    },
    migratedUserWelcomeModal: {
        title: '\uCC44\uD305\uC758 \uC18D\uB3C4\uB85C \uC5EC\uD589 \uBC0F \uBE44\uC6A9',
        subtitle:
            '\uC0C8\uB85C\uC6B4 Expensify\uB294 \uC5EC\uC804\uD788 \uD6CC\uB96D\uD55C \uC790\uB3D9\uD654 \uAE30\uB2A5\uC744 \uAC16\uCD94\uACE0 \uC788\uC9C0\uB9CC, \uC774\uC81C \uB180\uB77C\uC6B4 \uD611\uC5C5 \uAE30\uB2A5\uAE4C\uC9C0 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4:',
        confirmText: '\uAC00\uC790!',
        features: {
            chat: '<strong>\uC5B4\uB5A4 \uBE44\uC6A9</strong>, \uBCF4\uACE0\uC11C, \uB610\uB294 \uC791\uC5C5 \uACF5\uAC04\uC5D0\uC11C \uC9C1\uC811 \uCC44\uD305\uD558\uC138\uC694',
            scanReceipt: '<strong>\uC601\uC218\uC99D\uC744 \uC2A4\uCE94</strong>\uD558\uACE0 \uB3C8\uC744 \uB3CC\uB824\uBC1B\uC73C\uC138\uC694',
            crossPlatform: '<strong>\uBAA8\uB4E0 \uAC83</strong>\uC744 \uD734\uB300\uD3F0\uC774\uB098 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uC218\uD589\uD558\uC138\uC694',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: {
            part1: '\uC2DC\uC791\uD558\uB2E4',
            part2: '\uC5EC\uAE30\uC5D0\uC694!',
        },
        saveSearchTooltip: {
            part1: '\uC800\uC7A5\uB41C \uAC80\uC0C9\uC5B4\uC758 \uC774\uB984\uC744 \uBCC0\uACBD\uD558\uC138\uC694',
            part2: '\uC5EC\uAE30\uC5D0\uC694!',
        },
        quickActionButton: {
            part1: '\uBE60\uB978 \uD589\uB3D9!',
            part2: '\uADF8\uC800 \uD0ED \uD558\uB098\uB85C \uAC00\uB2A5\uD569\uB2C8\uB2E4',
        },
        workspaceChatCreate: {
            part1: '\uC81C\uCD9C\uD558\uC138\uC694',
            part2: '\uBE44\uC6A9',
            part3: '\uC5EC\uAE30\uC5D0\uC694!',
        },
        searchFilterButtonTooltip: {
            part1: '\uAC80\uC0C9\uC744 \uC0AC\uC6A9\uC790 \uC815\uC758\uD558\uC138\uC694',
            part2: '\uC5EC\uAE30\uC5D0\uC694!',
        },
        bottomNavInboxTooltip: {
            part1: '\uB2F9\uC2E0\uC758 \uD560 \uC77C \uBAA9\uB85D',
            part2: '\uD83D\uDFE2 = \uB2F9\uC2E0\uC744 \uC704\uD574 \uC900\uBE44\uB418\uC5C8\uC2B5\uB2C8\uB2E4',
            part3: '\uD83D\uDD34 = \uAC80\uD1A0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4',
        },
        workspaceChatTooltip: {
            part1: '\uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uC2ED\uC2DC\uC624',
            part2: '\uC640 \uCC44\uD305\uD558\uAE30',
            part3: '\uC5EC\uAE30 \uC2B9\uC778\uC790\uB4E4\uC774 \uC788\uC2B5\uB2C8\uB2E4!',
        },
        globalCreateTooltip: {
            part1: '\uBE44\uC6A9 \uC0DD\uC131',
            part2: ', \uCC44\uD305\uC744 \uC2DC\uC791\uD558\uC138\uC694,',
            part3: '\uADF8\uB9AC\uACE0 \uB354 \uB9CE\uC740 \uAC83\uB4E4!',
        },
        scanTestTooltip: {
            part1: 'Scan\uC774 \uC5B4\uB5BB\uAC8C \uC791\uB3D9\uD558\uB294\uC9C0 \uBCF4\uACE0 \uC2F6\uB098\uC694?',
            part2: '\uD14C\uC2A4\uD2B8 \uC601\uC218\uC99D\uC744 \uC2DC\uB3C4\uD574\uBCF4\uC138\uC694!',
            part3: '\uC6B0\uB9AC\uC758 \uC120\uD0DD\uD558\uC138\uC694',
            part4: '\uD14C\uC2A4\uD2B8 \uB9E4\uB2C8\uC800',
            part5: '\uC774\uAC83\uC744 \uC2DC\uB3C4\uD574 \uBCF4\uC138\uC694!',
            part6: '\uC9C0\uAE08,',
            part7: '\uB2F9\uC2E0\uC758 \uBE44\uC6A9\uC744 \uC81C\uCD9C\uD558\uC138\uC694',
            part8: '\uADF8\uB9AC\uACE0 \uB9C8\uBC95\uC774 \uC77C\uC5B4\uB098\uB294 \uAC83\uC744 \uBCF4\uC138\uC694!',
        },
    },
    discardChangesConfirmation: {
        title: '\uBCC0\uACBD \uC0AC\uD56D\uC744 \uBC84\uB9AC\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        body: '\uBCC0\uACBD\uD55C \uB0B4\uC6A9\uC744 \uC815\uB9D0\uB85C \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?',
        confirmText: '\uBCC0\uACBD \uC0AC\uD56D \uBC84\uB9AC\uAE30',
    },
};
export default translations satisfies TranslationDeepObject<typeof translations>;
