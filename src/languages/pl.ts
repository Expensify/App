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
        count: 'Liczba',
        cancel: 'Anuluj',
        dismiss: 'Odrzu\u0107',
        yes: 'Tak',
        no: 'No',
        ok: 'OK',
        notNow: 'Nie teraz',
        learnMore: 'Dowiedz si\u0119 wi\u0119cej.',
        buttonConfirm: 'Zrozumia\u0142em.',
        name: 'Nazwa',
        attachment: 'Za\u0142\u0105cznik',
        attachments: 'Za\u0142\u0105czniki',
        center: 'Centrum',
        from: 'Od',
        to: 'Do',
        in: 'W',
        optional: 'Opcjonalne',
        new: 'Nowy',
        search: 'Szukaj',
        reports: 'Raporty',
        find: 'Znajd\u017A',
        searchWithThreeDots: 'Szukaj...',
        next: 'Nast\u0119pny',
        previous: 'Poprzedni',
        goBack: 'Wr\u00F3\u0107',
        create: 'Utw\u00F3rz',
        add: 'Dodaj',
        resend: 'Wy\u015Blij ponownie',
        save: 'Zapisz',
        select: 'Wybierz',
        deselect: 'Odznacz',
        selectMultiple: 'Wybierz wiele',
        saveChanges: 'Zapisz zmiany',
        submit: 'Prze\u015Blij',
        rotate: 'Obr\u00F3\u0107',
        zoom: 'Zoom',
        password: 'Has\u0142o',
        magicCode: 'Magic code',
        twoFactorCode: 'Kod dwusk\u0142adnikowy',
        workspaces: 'Przestrzenie robocze',
        inbox: 'Skrzynka odbiorcza',
        group: 'Grupa',
        profile: 'Profil',
        referral: 'Polecenie',
        payments: 'P\u0142atno\u015Bci',
        approvals: 'Zatwierdzenia',
        wallet: 'Portfel',
        preferences: 'Preferencje',
        view: 'Widok',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nie',
        signIn: 'Zaloguj si\u0119',
        signInWithGoogle: 'Zaloguj si\u0119 przez Google',
        signInWithApple: 'Zaloguj si\u0119 za pomoc\u0105 Apple',
        signInWith: 'Zaloguj si\u0119 za pomoc\u0105',
        continue: 'Kontynuuj',
        firstName: 'Imi\u0119',
        lastName: 'Nazwisko',
        scanning: 'Skanowanie',
        addCardTermsOfService: 'Warunki korzystania z us\u0142ugi Expensify',
        perPerson: 'na osob\u0119',
        phone: 'Telefon',
        phoneNumber: 'Numer telefonu',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'i',
        or: 'lub',
        details: 'Szczeg\u00F3\u0142y',
        privacy: 'Prywatno\u015B\u0107',
        privacyPolicy: 'Polityka prywatno\u015Bci',
        hidden: 'Ukryty',
        visible: 'Widoczne',
        delete: 'Usu\u0144',
        archived: 'zarchiwizowane',
        contacts: 'Kontakty',
        recents: 'Ostatnie',
        close: 'Zamknij',
        download: 'Pobierz',
        downloading: 'Pobieranie',
        uploading: 'Przesy\u0142anie',
        pin: 'Przypnij',
        unPin: 'Odepnij',
        back: 'Wstecz',
        saveAndContinue: 'Zapisz i kontynuuj',
        settings: 'Ustawienia',
        termsOfService: 'Warunki korzystania z us\u0142ugi',
        members: 'Cz\u0142onkowie',
        invite: 'Zapro\u015B',
        here: 'tutaj',
        date: 'Data',
        dob: 'Data urodzenia',
        currentYear: 'Obecny rok',
        currentMonth: 'Bie\u017C\u0105cy miesi\u0105c',
        ssnLast4: 'Ostatnie 4 cyfry numeru SSN',
        ssnFull9: 'Pe\u0142ne 9 cyfr numeru SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Linia adresowa ${lineNumber}`,
        personalAddress: 'Adres osobisty',
        companyAddress: 'Adres firmy',
        noPO: 'Prosz\u0119, nie u\u017Cywaj skrytek pocztowych ani adres\u00F3w skrytek pocztowych.',
        city: 'Miasto',
        state: 'Stan',
        streetAddress: 'Adres ulicy',
        stateOrProvince: 'Stan / Prowincja',
        country: 'Kraj',
        zip: 'Kod pocztowy',
        zipPostCode: 'Kod pocztowy',
        whatThis: 'Co to jest?',
        iAcceptThe: 'Akceptuj\u0119',
        remove: 'Usu\u0144',
        admin: 'Admin',
        owner: 'W\u0142a\u015Bciciel',
        dateFormat: 'YYYY-MM-DD',
        send: 'Wy\u015Blij',
        na: 'N/A',
        noResultsFound: 'Nie znaleziono wynik\u00F3w',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Nie znaleziono wynik\u00F3w pasuj\u0105cych do "${searchString}"`,
        recentDestinations: 'Ostatnie miejsca docelowe',
        timePrefix: 'To jest',
        conjunctionFor: 'dla',
        todayAt: 'Dzisiaj o',
        tomorrowAt: 'Jutro o',
        yesterdayAt: 'Wczoraj o',
        conjunctionAt: 'at',
        conjunctionTo: 'do',
        genericErrorMessage:
            'Ups... co\u015B posz\u0142o nie tak i nie mo\u017Cna by\u0142o zrealizowa\u0107 Twojego \u017C\u0105dania. Prosz\u0119 spr\u00F3buj ponownie p\u00F3\u017Aniej.',
        percentage: 'Procent',
        error: {
            invalidAmount: 'Nieprawid\u0142owa kwota',
            acceptTerms: 'Musisz zaakceptowa\u0107 Warunki korzystania z us\u0142ugi, aby kontynuowa\u0107.',
            phoneNumber: `Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer telefonu z kodem kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'To pole jest wymagane',
            requestModified: 'To \u017C\u0105danie jest modyfikowane przez innego cz\u0142onka',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Przekroczono limit znak\u00F3w (${length}/${limit})`,
            dateInvalid: 'Prosz\u0119 wybra\u0107 prawid\u0142ow\u0105 dat\u0119',
            invalidDateShouldBeFuture: 'Prosz\u0119 wybra\u0107 dzisiejsz\u0105 lub przysz\u0142\u0105 dat\u0119',
            invalidTimeShouldBeFuture: 'Prosz\u0119 wybra\u0107 czas co najmniej minut\u0119 do przodu',
            invalidCharacter: 'Nieprawid\u0142owy znak',
            enterMerchant: 'Wprowad\u017A nazw\u0119 sprzedawcy',
            enterAmount: 'Wprowad\u017A kwot\u0119',
            missingMerchantName: 'Brak nazwy sprzedawcy',
            missingAmount: 'Brakuj\u0105ca kwota',
            missingDate: 'Brakuj\u0105ca data',
            enterDate: 'Wprowad\u017A dat\u0119',
            invalidTimeRange: 'Prosz\u0119 wprowadzi\u0107 godzin\u0119 w formacie 12-godzinnym (np. 2:30 PM)',
            pleaseCompleteForm: 'Prosz\u0119 wype\u0142ni\u0107 formularz powy\u017Cej, aby kontynuowa\u0107',
            pleaseSelectOne: 'Prosz\u0119 wybra\u0107 opcj\u0119 powy\u017Cej',
            invalidRateError: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142ow\u0105 stawk\u0119',
            lowRateError: 'Stawka musi by\u0107 wi\u0119ksza ni\u017C 0',
            email: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy adres e-mail',
            login: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas logowania. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        },
        comma: 'przecinek',
        semicolon: 'semicolon',
        please: 'Prosz\u0119',
        contactUs: 'skontaktuj si\u0119 z nami',
        pleaseEnterEmailOrPhoneNumber: 'Prosz\u0119 wprowadzi\u0107 adres e-mail lub numer telefonu',
        fixTheErrors: 'napraw b\u0142\u0119dy',
        inTheFormBeforeContinuing: 'w formularzu przed kontynuowaniem',
        confirm: 'Potwierd\u017A',
        reset: 'Zresetuj',
        done: 'Zrobione',
        more: 'Wi\u0119cej',
        debitCard: 'Karta debetowa',
        bankAccount: 'Konto bankowe',
        personalBankAccount: 'Osobiste konto bankowe',
        businessBankAccount: 'Konto bankowe dla firm',
        join: 'Do\u0142\u0105cz',
        leave: 'Opu\u015Bci\u0107',
        decline: 'Odrzu\u0107',
        transferBalance: 'Przelej saldo',
        cantFindAddress: 'Nie mo\u017Cesz znale\u017A\u0107 swojego adresu?',
        enterManually: 'Wprowad\u017A to r\u0119cznie',
        message: 'Wiadomo\u015B\u0107',
        leaveThread: 'Opu\u015B\u0107 w\u0105tek',
        you: 'Ty',
        youAfterPreposition: 'ty',
        your: 'tw\u00F3j',
        conciergeHelp: 'Prosz\u0119 skontaktowa\u0107 si\u0119 z Concierge po pomoc.',
        youAppearToBeOffline: 'Wygl\u0105da na to, \u017Ce jeste\u015B offline.',
        thisFeatureRequiresInternet: 'Ta funkcja wymaga aktywnego po\u0142\u0105czenia z internetem.',
        attachmentWillBeAvailableOnceBackOnline: 'Za\u0142\u0105cznik b\u0119dzie dost\u0119pny po ponownym po\u0142\u0105czeniu z internetem.',
        errorOccurredWhileTryingToPlayVideo: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas pr\u00F3by odtworzenia tego wideo.',
        areYouSure: 'Jeste\u015B pewien?',
        verify: 'Zweryfikuj',
        yesContinue: 'Tak, kontynuuj',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Opis',
        title: 'Tytu\u0142',
        assignee: 'Przypisany',
        createdBy: 'Utworzone przez',
        with: 'z',
        shareCode: 'Udost\u0119pnij kod',
        share: 'Udost\u0119pnij',
        per: 'na',
        mi: 'mila',
        km: 'kilometr',
        copied: 'Skopiowano!',
        someone: 'Kto\u015B',
        total: 'Suma',
        edit: 'Edytuj',
        letsDoThis: `Zr\u00F3bmy to!`,
        letsStart: `Zacznijmy`,
        showMore: 'Poka\u017C wi\u0119cej',
        merchant: 'Kupiec',
        category: 'Kategoria',
        report: 'Raport',
        billable: 'Billable',
        nonBillable: 'Nieobci\u0105\u017Calne',
        tag: 'Tag',
        receipt: 'Paragon',
        verified: 'Zweryfikowano',
        replace: 'Zast\u0105p',
        distance: 'Dystans',
        mile: 'mila',
        miles: 'mile',
        kilometer: 'kilometr',
        kilometers: 'kilometry',
        recent: 'Niedawne',
        all: 'Wszystkie',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Wybierz walut\u0119',
        card: 'Karta',
        whyDoWeAskForThis: 'Dlaczego o to prosimy?',
        required: 'Wymagane',
        showing: 'Pokazywanie',
        of: 'of',
        default: 'Domy\u015Blny',
        update: 'Aktualizacja',
        member: 'Cz\u0142onek',
        auditor: 'Audytor',
        role: 'Rola',
        currency: 'Waluta',
        rate: 'Oce\u0144',
        emptyLHN: {
            title: 'Hurra! Wszystko nadrobione.',
            subtitleText1: 'Znajd\u017A czat u\u017Cywaj\u0105c',
            subtitleText2: 'przycisk powy\u017Cej lub stw\u00F3rz co\u015B za pomoc\u0105',
            subtitleText3: 'przycisk poni\u017Cej.',
        },
        businessName: 'Nazwa firmy',
        clear: 'Wyczy\u015B\u0107',
        type: 'Rodzaj',
        action: 'Akcja',
        expenses: 'Wydatki',
        tax: 'Podatek',
        shared: 'Udost\u0119pnione',
        drafts: 'Szkice',
        finished: 'Zako\u0144czono',
        upgrade: 'Ulepszenie',
        downgradeWorkspace: 'Obni\u017C poziom przestrzeni roboczej',
        companyID: 'Company ID',
        userID: 'ID u\u017Cytkownika',
        disable: 'Wy\u0142\u0105cz',
        export: 'Eksportuj',
        initialValue: 'Warto\u015B\u0107 pocz\u0105tkowa',
        currentDate: 'Aktualna data',
        value: 'Warto\u015B\u0107',
        downloadFailedTitle: 'Pobieranie nie powiod\u0142o si\u0119',
        downloadFailedDescription: 'Nie uda\u0142o si\u0119 zako\u0144czy\u0107 pobierania. Spr\u00F3buj ponownie p\u00F3\u017Aniej.',
        filterLogs: 'Filtruj dzienniki',
        network: 'Sie\u0107',
        reportID: 'ID raportu',
        longID: 'D\u0142ugi identyfikator',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        dropTitle: 'Pu\u015B\u0107 to',
        dropMessage: 'Upu\u015B\u0107 sw\u00F3j plik tutaj',
        ignore: 'Ignore',
        enabled: 'W\u0142\u0105czony',
        disabled: 'Wy\u0142\u0105czony',
        import: 'Importuj',
        offlinePrompt: 'Nie mo\u017Cesz teraz podj\u0105\u0107 tej akcji.',
        outstanding: 'Wybitny',
        chats: 'Czaty',
        tasks: 'Zadania',
        unread: 'Nieprzeczytane',
        sent: 'Wys\u0142ano',
        links: 'Linki',
        days: 'dni',
        rename: 'Zmie\u0144 nazw\u0119',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Pomi\u0144',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Potrzebujesz czego\u015B konkretnego? Porozmawiaj ze swoim mened\u017Cerem konta, ${accountManagerDisplayName}.`,
        chatNow: 'Czat teraz',
        workEmail: 'S\u0142u\u017Cbowy email',
        destination: 'Cel podr\u00F3\u017Cy',
        subrate: 'Subrate',
        perDiem: 'Dieta',
        validate: 'Zatwierd\u017A',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReports: 'Raporty wydatk\u00F3w',
        rateOutOfPolicy: 'Oce\u0144 poza polityk\u0105',
        reimbursable: 'Zwrotny',
        editYourProfile: 'Edytuj sw\u00F3j profil',
        comments: 'Komentarze',
        sharedIn: 'Udost\u0119pnione w',
        unreported: 'Niezg\u0142oszone',
        explore: 'Eksploruj',
        todo: 'Do zrobienia',
        invoice: 'Faktura',
        expense: 'Wydatek',
        chat: 'Czat',
        task: 'Zadanie',
        trip: 'Podr\u00F3\u017C',
        apply: 'Zastosuj',
        status: 'Status',
        on: 'Na',
        before: 'Przed',
        after: 'Po',
        reschedule: 'Prze\u0142o\u017Cy\u0107 na inny termin',
        general: 'Og\u00F3lne',
        never: 'Nigdy',
        workspacesTabTitle: 'Przestrzenie robocze',
        getTheApp: 'Pobierz aplikacj\u0119',
        scanReceiptsOnTheGo: 'Skanuj paragony za pomoc\u0105 telefonu',
    },
    supportalNoAccess: {
        title: 'Nie tak szybko',
        description: 'Nie masz uprawnie\u0144 do wykonania tej akcji, gdy wsparcie jest zalogowane.',
    },
    lockedAccount: {
        title: 'Zablokowane konto',
        description:
            'Nie masz uprawnie\u0144 do wykonania tej akcji, poniewa\u017C to konto zosta\u0142o zablokowane. Prosz\u0119 skontaktowa\u0107 si\u0119 z concierge@expensify.com w celu uzyskania dalszych instrukcji.',
    },
    location: {
        useCurrent: 'U\u017Cyj bie\u017C\u0105cej lokalizacji',
        notFound: 'Nie uda\u0142o nam si\u0119 znale\u017A\u0107 Twojej lokalizacji. Spr\u00F3buj ponownie lub wprowad\u017A adres r\u0119cznie.',
        permissionDenied: 'Wygl\u0105da na to, \u017Ce odm\u00F3wi\u0142e\u015B dost\u0119pu do swojej lokalizacji.',
        please: 'Prosz\u0119',
        allowPermission: 'zezw\u00F3l na dost\u0119p do lokalizacji w ustawieniach',
        tryAgain: 'i spr\u00F3buj ponownie.',
    },
    contact: {
        importContacts: 'Importuj kontakty',
        importContactsTitle: 'Zaimportuj swoje kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby Twoi ulubieni ludzie byli zawsze w zasi\u0119gu r\u0119ki.',
        importContactsExplanation: 'wi\u0119c twoi ulubieni ludzie s\u0105 zawsze w zasi\u0119gu jednego dotkni\u0119cia.',
        importContactsNativeText: 'Jeszcze tylko jeden krok! Daj nam zielone \u015Bwiat\u0142o na importowanie Twoich kontakt\u00F3w.',
    },
    anonymousReportFooter: {
        logoTagline: 'Do\u0142\u0105cz do dyskusji.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Dost\u0119p do aparatu',
        expensifyDoesNotHaveAccessToCamera: 'Expensify nie mo\u017Ce robi\u0107 zdj\u0119\u0107 bez dost\u0119pu do Twojego aparatu. Stuknij ustawienia, aby zaktualizowa\u0107 uprawnienia.',
        attachmentError: 'B\u0142\u0105d za\u0142\u0105cznika',
        errorWhileSelectingAttachment: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas wybierania za\u0142\u0105cznika. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        errorWhileSelectingCorruptedAttachment: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas wybierania uszkodzonego za\u0142\u0105cznika. Prosz\u0119 spr\u00F3bowa\u0107 z innym plikiem.',
        takePhoto: 'Zr\u00F3b zdj\u0119cie',
        chooseFromGallery: 'Wybierz z galerii',
        chooseDocument: 'Wybierz plik',
        attachmentTooLarge: 'Za\u0142\u0105cznik jest zbyt du\u017Cy',
        sizeExceeded: 'Rozmiar za\u0142\u0105cznika przekracza limit 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Rozmiar za\u0142\u0105cznika przekracza limit ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Za\u0142\u0105cznik jest zbyt ma\u0142y',
        sizeNotMet: 'Rozmiar za\u0142\u0105cznika musi by\u0107 wi\u0119kszy ni\u017C 240 bajt\u00F3w',
        wrongFileType: 'Nieprawid\u0142owy typ pliku',
        notAllowedExtension: 'Ten typ pliku nie jest dozwolony. Prosz\u0119 spr\u00F3bowa\u0107 inny typ pliku.',
        folderNotAllowedMessage: 'Przesy\u0142anie folderu jest niedozwolone. Prosz\u0119 spr\u00F3bowa\u0107 z innym plikiem.',
        protectedPDFNotSupported: 'Plik PDF chroniony has\u0142em nie jest obs\u0142ugiwany',
        attachmentImageResized: 'Ten obraz zosta\u0142 zmieniony na potrzeby podgl\u0105du. Pobierz, aby uzyska\u0107 pe\u0142n\u0105 rozdzielczo\u015B\u0107.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt du\u017Cy, aby go wy\u015Bwietli\u0107 przed przes\u0142aniem.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Mo\u017Cesz przes\u0142a\u0107 maksymalnie ${fileLimit} plik\u00F3w naraz.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Pliki przekraczaj\u0105 ${maxUploadSizeInMB} MB. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.`,
    },
    dropzone: {
        addAttachments: 'Dodaj za\u0142\u0105czniki',
        scanReceipts: 'Skanuj paragony',
        replaceReceipt: 'Zast\u0105p paragon',
    },
    filePicker: {
        fileError: 'B\u0142\u0105d pliku',
        errorWhileSelectingFile: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas wybierania pliku. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
    },
    connectionComplete: {
        title: 'Po\u0142\u0105czenie zako\u0144czone',
        supportingText: 'Mo\u017Cesz zamkn\u0105\u0107 to okno i wr\u00F3ci\u0107 do aplikacji Expensify.',
    },
    avatarCropModal: {
        title: 'Edytuj zdj\u0119cie',
        description: 'Przeci\u0105gaj, powi\u0119kszaj i obracaj swoje zdj\u0119cie, jak tylko chcesz.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nie znaleziono rozszerzenia dla typu MIME',
        problemGettingImageYouPasted: 'Wyst\u0105pi\u0142 problem z pobraniem obrazu, kt\u00F3ry wklei\u0142e\u015B.',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksymalna d\u0142ugo\u015B\u0107 komentarza to ${formattedMaxLength} znak\u00F3w.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksymalna d\u0142ugo\u015B\u0107 tytu\u0142u zadania to ${formattedMaxLength} znak\u00F3w.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Zaktualizuj aplikacj\u0119',
        updatePrompt: 'Nowa wersja tej aplikacji jest dost\u0119pna.  \nZaktualizuj teraz lub uruchom ponownie aplikacj\u0119 p\u00F3\u017Aniej, aby pobra\u0107 najnowsze zmiany.',
    },
    deeplinkWrapper: {
        launching: 'Uruchamianie Expensify',
        expired: 'Twoja sesja wygas\u0142a.',
        signIn: 'Prosz\u0119 zalogowa\u0107 si\u0119 ponownie.',
        redirectedToDesktopApp: 'Przekierowali\u015Bmy Ci\u0119 do aplikacji na komputer.',
        youCanAlso: 'Mo\u017Cesz r\u00F3wnie\u017C',
        openLinkInBrowser: 'otw\u00F3rz ten link w swojej przegl\u0105darce',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `Jeste\u015B zalogowany jako ${email}. Kliknij "Otw\u00F3rz link" w monicie, aby zalogowa\u0107 si\u0119 do aplikacji desktopowej za pomoc\u0105 tego konta.`,
        doNotSeePrompt: 'Nie widzisz monitu?',
        tryAgain: 'Spr\u00F3buj ponownie',
        or: 'lub',
        continueInWeb: 'przejd\u017A do aplikacji internetowej',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abrakadabra, jeste\u015B zalogowany!',
        successfulSignInDescription: 'Wr\u00F3\u0107 do swojej oryginalnej karty, aby kontynuowa\u0107.',
        title: 'Oto tw\u00F3j magiczny kod',
        description: 'Prosz\u0119 wprowadzi\u0107 kod z urz\u0105dzenia, na kt\u00F3rym zosta\u0142 pierwotnie za\u017C\u0105dany.',
        doNotShare: 'Nie udost\u0119pniaj swojego kodu nikomu. Expensify nigdy nie poprosi Ci\u0119 o jego podanie!',
        or: 'lub',
        signInHere: 'po prostu zaloguj si\u0119 tutaj',
        expiredCodeTitle: 'Kod magiczny wygas\u0142',
        expiredCodeDescription: 'Wr\u00F3\u0107 do oryginalnego urz\u0105dzenia i popro\u015B o nowy kod',
        successfulNewCodeRequest: '\u017B\u0105dany kod. Prosz\u0119 sprawdzi\u0107 swoje urz\u0105dzenie.',
        tfaRequiredTitle: 'Wymagana dwusk\u0142adnikowa autoryzacja',
        tfaRequiredDescription: 'Prosz\u0119 wprowadzi\u0107 kod uwierzytelniania dwusk\u0142adnikowego, gdzie pr\u00F3bujesz si\u0119 zalogowa\u0107.',
        requestOneHere: 'popro\u015B o jeden tutaj.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Op\u0142acone przez',
        whatsItFor: 'Do czego to s\u0142u\u017Cy?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Imi\u0119, email lub numer telefonu',
        findMember: 'Znajd\u017A cz\u0142onka',
        searchForSomeone: 'Wyszukaj kogo\u015B',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Z\u0142\u00F3\u017C wydatek, pole\u0107 swojego szefa',
            subtitleText: 'Chcesz, aby Tw\u00F3j szef r\u00F3wnie\u017C korzysta\u0142 z Expensify? Po prostu wy\u015Blij mu raport wydatk\u00F3w, a my zajmiemy si\u0119 reszt\u0105.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Zarezerwuj rozmow\u0119',
    },
    hello: 'Cze\u015B\u0107',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Rozpocznij poni\u017Cej.',
        anotherLoginPageIsOpen: 'Otwarta jest inna strona logowania.',
        anotherLoginPageIsOpenExplanation: 'Otworzy\u0142e\u015B stron\u0119 logowania w osobnej karcie. Prosz\u0119 zaloguj si\u0119 z tej karty.',
        welcome: 'Witamy!',
        welcomeWithoutExclamation: 'Witamy',
        phrase2: 'Pieni\u0105dze m\u00F3wi\u0105. A teraz, gdy czat i p\u0142atno\u015Bci s\u0105 w jednym miejscu, jest to r\u00F3wnie\u017C \u0142atwe.',
        phrase3: 'Twoje p\u0142atno\u015Bci docieraj\u0105 do Ciebie tak szybko, jak szybko potrafisz wyrazi\u0107 swoje zdanie.',
        enterPassword: 'Prosz\u0119 wprowadzi\u0107 swoje has\u0142o',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, zawsze mi\u0142o widzie\u0107 now\u0105 twarz tutaj!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ${login}. Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.`,
    },
    login: {
        hero: {
            header: 'Podr\u00F3\u017Ce i wydatki, z pr\u0119dko\u015Bci\u0105 czatu',
            body: 'Witamy w nowej generacji Expensify, gdzie Twoje podr\u00F3\u017Ce i wydatki przebiegaj\u0105 szybciej dzi\u0119ki kontekstowemu, czatowi w czasie rzeczywistym.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Jeste\u015B ju\u017C zalogowany jako ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Nie chcesz logowa\u0107 si\u0119 za pomoc\u0105 ${provider}?`,
        continueWithMyCurrentSession: 'Kontynuuj moj\u0105 obecn\u0105 sesj\u0119',
        redirectToDesktopMessage: 'Przekierujemy Ci\u0119 do aplikacji desktopowej, gdy tylko zako\u0144czysz logowanie.',
        signInAgreementMessage: 'Loguj\u0105c si\u0119, zgadzasz si\u0119 na',
        termsOfService: 'Warunki korzystania z us\u0142ugi',
        privacy: 'Prywatno\u015B\u0107',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Kontynuuj logowanie za pomoc\u0105 jednokrotnego logowania:',
        orContinueWithMagicCode: 'Mo\u017Cesz r\u00F3wnie\u017C zalogowa\u0107 si\u0119 za pomoc\u0105 magicznego kodu',
        useSingleSignOn: 'U\u017Cyj logowania jednokrotnego',
        useMagicCode: 'U\u017Cyj magicznego kodu',
        launching: 'Uruchamianie...',
        oneMoment: 'Prosz\u0119 chwil\u0119 poczeka\u0107, przekierowujemy Ci\u0119 do portalu logowania jednokrotnego Twojej firmy.',
    },
    reportActionCompose: {
        dropToUpload: 'Upu\u015B\u0107, aby przes\u0142a\u0107',
        sendAttachment: 'Wy\u015Blij za\u0142\u0105cznik',
        addAttachment: 'Dodaj za\u0142\u0105cznik',
        writeSomething: 'Napisz co\u015B...',
        blockedFromConcierge: 'Komunikacja jest zablokowana',
        fileUploadFailed: 'Przesy\u0142anie nie powiod\u0142o si\u0119. Plik nie jest obs\u0142ugiwany.',
        localTime: ({user, time}: LocalTimeParams) => `Jest ${time} dla ${user}`,
        edited: '(edycja)',
        emoji: 'Emoji',
        collapse: 'Zwi\u0144',
        expand: 'Rozwi\u0144',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Kopiuj do schowka',
        copied: 'Skopiowano!',
        copyLink: 'Skopiuj link',
        copyURLToClipboard: 'Skopiuj URL do schowka',
        copyEmailToClipboard: 'Skopiuj e-mail do schowka',
        markAsUnread: 'Oznacz jako nieprzeczytane',
        markAsRead: 'Oznacz jako przeczytane',
        editAction: ({action}: EditActionParams) => `Edytuj ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz'}`,
        deleteAction: ({action}: DeleteActionParams) => `Usu\u0144 ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `Czy na pewno chcesz usun\u0105\u0107 ten ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz'}?`,
        onlyVisible: 'Widoczne tylko dla',
        replyInThread: 'Odpowiedz w w\u0105tku',
        joinThread: 'Do\u0142\u0105cz do w\u0105tku',
        leaveThread: 'Opu\u015B\u0107 w\u0105tek',
        copyOnyxData: 'Skopiuj dane Onyx',
        flagAsOffensive: 'Oznacz jako obra\u017Aliwe',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Dodaj reakcj\u0119',
        reactedWith: 'zareagowa\u0142(a) za pomoc\u0105',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Przegapi\u0142e\u015B imprez\u0119 w',
        beginningOfArchivedRoomPartTwo: ', nie ma tu nic do zobaczenia.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Ta rozmowa jest z wszystkimi cz\u0142onkami Expensify na domenie ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'U\u017Cywaj go do czatowania z kolegami, dzielenia si\u0119 wskaz\u00F3wkami i zadawania pyta\u0144.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Ta rozmowa jest z',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: 'U\u017Cyj tego do rozmowy o konfiguracji przestrzeni roboczej i nie tylko.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Ten czat jest z wszystkimi w ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `U\u017Cywaj tego do najwa\u017Cniejszych og\u0142osze\u0144.`,
        beginningOfChatHistoryUserRoomPartOne: 'Ten pok\u00F3j czatu jest do wszystkiego',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Ten czat dotyczy faktur pomi\u0119dzy`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. U\u017Cyj przycisku +, aby wys\u0142a\u0107 faktur\u0119.`,
        beginningOfChatHistory: 'Ta rozmowa jest z',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'To jest miejsce, gdzie',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'prze\u015Ble wydatki do',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Po prostu u\u017Cyj przycisku +.',
        beginningOfChatHistorySelfDM: 'To jest Twoja przestrze\u0144 osobista. U\u017Cywaj jej do notatek, zada\u0144, szkic\u00F3w i przypomnie\u0144.',
        beginningOfChatHistorySystemDM: 'Witamy! Zacznijmy od konfiguracji.',
        chatWithAccountManager: 'Porozmawiaj ze swoim opiekunem konta tutaj',
        sayHello: 'Powiedz cze\u015B\u0107!',
        yourSpace: 'Twoja przestrze\u0144',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Witamy w ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `U\u017Cyj przycisku +, aby ${additionalText} wydatek.`,
        askConcierge: 'Zadawaj pytania i uzyskaj ca\u0142odobowe wsparcie w czasie rzeczywistym.',
        conciergeSupport: 'Ca\u0142odobowe wsparcie',
        create: 'utw\u00F3rz',
        iouTypes: {
            pay: 'zap\u0142a\u0107',
            split: 'split',
            submit: 'prze\u015Blij',
            track: '\u015Bledzi\u0107',
            invoice: 'faktura',
        },
    },
    adminOnlyCanPost: 'Tylko administratorzy mog\u0105 wysy\u0142a\u0107 wiadomo\u015Bci w tym pokoju.',
    reportAction: {
        asCopilot: 'jako pomocnik dla',
    },
    mentionSuggestions: {
        hereAlternateText: 'Powiadom wszystkich w tej rozmowie',
    },
    newMessages: 'Nowe wiadomo\u015Bci',
    youHaveBeenBanned: 'Uwaga: Zosta\u0142e\u015B zbanowany z czatu na tym kanale.',
    reportTypingIndicator: {
        isTyping: 'pisze...',
        areTyping: 'pisz\u0105...',
        multipleMembers: 'Wielu cz\u0142onk\u00F3w',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Ten pok\u00F3j czatu zosta\u0142 zarchiwizowany.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Ten czat nie jest ju\u017C aktywny, poniewa\u017C ${displayName} zamkn\u0105\u0142 swoje konto.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Ten czat nie jest ju\u017C aktywny, poniewa\u017C ${oldDisplayName} po\u0142\u0105czy\u0142 swoje konto z ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ten czat nie jest ju\u017C aktywny, poniewa\u017C <strong>Ty</strong> nie jeste\u015B ju\u017C cz\u0142onkiem przestrzeni roboczej ${policyName}.`
                : `Ten czat nie jest ju\u017C aktywny, poniewa\u017C ${displayName} nie jest ju\u017C cz\u0142onkiem przestrzeni roboczej ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest ju\u017C aktywny, poniewa\u017C ${policyName} nie jest ju\u017C aktywnym miejscem pracy.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest ju\u017C aktywny, poniewa\u017C ${policyName} nie jest ju\u017C aktywnym miejscem pracy.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Ta rezerwacja jest zarchiwizowana.',
    },
    writeCapabilityPage: {
        label: 'Kto mo\u017Ce opublikowa\u0107',
        writeCapability: {
            all: 'Wszyscy cz\u0142onkowie',
            admins: 'Tylko administratorzy',
        },
    },
    sidebarScreen: {
        buttonFind: 'Znajd\u017A co\u015B...',
        buttonMySettings: 'Moje ustawienia',
        fabNewChat: 'Rozpocznij czat',
        fabNewChatExplained: 'Rozpocznij czat (P\u0142ywaj\u0105cy przycisk akcji)',
        chatPinned: 'Czat przypi\u0119ty',
        draftedMessage: 'Szkicowana wiadomo\u015B\u0107',
        listOfChatMessages: 'Lista wiadomo\u015Bci czatu',
        listOfChats: 'Lista czat\u00F3w',
        saveTheWorld: 'Ratuj \u015Bwiat',
        tooltip: 'Rozpocznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Ju\u017C wkr\u00F3tce',
            description:
                'Dostosowujemy jeszcze kilka element\u00F3w Nowego Expensify, aby dopasowa\u0107 go do Twojej specyficznej konfiguracji. W mi\u0119dzyczasie przejd\u017A do Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Subskrypcja',
        domains: 'Domeny',
    },
    tabSelector: {
        chat: 'Czat',
        room: 'Pok\u00F3j',
        distance: 'Dystans',
        manual: 'Instrukcja obs\u0142ugi',
        scan: 'Skanuj',
    },
    spreadsheet: {
        upload: 'Prze\u015Blij arkusz kalkulacyjny',
        dragAndDrop: 'Przeci\u0105gnij i upu\u015B\u0107 sw\u00F3j arkusz kalkulacyjny tutaj lub wybierz plik poni\u017Cej. Obs\u0142ugiwane formaty: .csv, .txt, .xls i .xlsx.',
        chooseSpreadsheet: 'Wybierz plik arkusza kalkulacyjnego do importu. Obs\u0142ugiwane formaty: .csv, .txt, .xls i .xlsx.',
        fileContainsHeader: 'Plik zawiera nag\u0142\u00F3wki kolumn',
        column: ({name}: SpreadSheetColumnParams) => `Kolumna ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `Ups! Wymagane pole (\u201E${fieldName}\u201D) nie zosta\u0142o przypisane. Prosz\u0119 sprawdzi\u0107 i spr\u00F3bowa\u0107 ponownie.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Ups! Przypisa\u0142e\u015B pojedyncze pole (\u201E${fieldName}\u201D) do wielu kolumn. Prosz\u0119 sprawd\u017A i spr\u00F3buj ponownie.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `Ups! Pole (\u201E${fieldName}\u201D) zawiera jedn\u0105 lub wi\u0119cej pustych warto\u015Bci. Prosz\u0119 sprawdzi\u0107 i spr\u00F3bowa\u0107 ponownie.`,
        importSuccessfulTitle: 'Import zako\u0144czony pomy\u015Blnie',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `Dodano ${categories} kategorie.` : 'Dodano 1 kategori\u0119.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Nie dodano ani nie zaktualizowano \u017Cadnych cz\u0142onk\u00F3w.';
            }
            if (added && updated) {
                return `${added} cz\u0142onek${added > 1 ? 's' : ''} dodany, ${updated} cz\u0142onek${updated > 1 ? 's' : ''} zaktualizowany.`;
            }
            if (updated) {
                return updated > 1 ? `Zaktualizowano ${updated} cz\u0142onk\u00F3w.` : 'Zaktualizowano 1 cz\u0142onka.';
            }
            return added > 1 ? `Dodano ${added} cz\u0142onk\u00F3w.` : 'Dodano 1 cz\u0142onka.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `Dodano tagi ${tags}.` : 'Dodano 1 tag.'),
        importMultiLevelTagsSuccessfulDescription: 'Dodano tagi wielopoziomowe.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `Dodano stawki dzienne w wysoko\u015Bci ${rates}.` : 'Dodano 1 stawk\u0119 dzienn\u0105.',
        importFailedTitle: 'Import nie powi\u00F3d\u0142 si\u0119',
        importFailedDescription:
            'Upewnij si\u0119, \u017Ce wszystkie pola s\u0105 wype\u0142nione poprawnie i spr\u00F3buj ponownie. Je\u015Bli problem b\u0119dzie si\u0119 powtarza\u0142, skontaktuj si\u0119 z Concierge.',
        importDescription: 'Wybierz, kt\u00F3re pola chcesz zmapowa\u0107 z arkusza kalkulacyjnego, klikaj\u0105c menu rozwijane obok ka\u017Cdej zaimportowanej kolumny poni\u017Cej.',
        sizeNotMet: 'Rozmiar pliku musi by\u0107 wi\u0119kszy ni\u017C 0 bajt\u00F3w',
        invalidFileMessage:
            'Przes\u0142any plik jest pusty lub zawiera nieprawid\u0142owe dane. Upewnij si\u0119, \u017Ce plik jest poprawnie sformatowany i zawiera niezb\u0119dne informacje przed ponownym przes\u0142aniem.',
        importSpreadsheet: 'Importuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz CSV',
    },
    receipt: {
        upload: 'Prze\u015Blij paragon',
        dragReceiptBeforeEmail: 'Przeci\u0105gnij paragon na t\u0119 stron\u0119, prze\u015Blij paragon do',
        dragReceiptAfterEmail: 'lub wybierz plik do przes\u0142ania poni\u017Cej.',
        chooseReceipt: 'Wybierz paragon do przes\u0142ania lub prze\u015Blij paragon do',
        takePhoto: 'Zr\u00F3b zdj\u0119cie',
        cameraAccess: 'Dost\u0119p do aparatu jest wymagany, aby robi\u0107 zdj\u0119cia paragon\u00F3w.',
        deniedCameraAccess: 'Dost\u0119p do kamery nadal nie zosta\u0142 przyznany, prosz\u0119 post\u0119powa\u0107 zgodnie z',
        deniedCameraAccessInstructions: 'te instrukcje',
        cameraErrorTitle: 'B\u0142\u0105d aparatu',
        cameraErrorMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas robienia zdj\u0119cia. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        locationAccessTitle: 'Zezw\u00F3l na dost\u0119p do lokalizacji',
        locationAccessMessage: 'Dost\u0119p do lokalizacji pomaga nam utrzyma\u0107 dok\u0142adno\u015B\u0107 strefy czasowej i waluty, gdziekolwiek jeste\u015B.',
        locationErrorTitle: 'Zezw\u00F3l na dost\u0119p do lokalizacji',
        locationErrorMessage: 'Dost\u0119p do lokalizacji pomaga nam utrzyma\u0107 dok\u0142adno\u015B\u0107 strefy czasowej i waluty, gdziekolwiek jeste\u015B.',
        allowLocationFromSetting: `Dost\u0119p do lokalizacji pomaga nam utrzyma\u0107 dok\u0142adno\u015B\u0107 strefy czasowej i waluty, gdziekolwiek si\u0119 znajdujesz. Prosz\u0119 zezwoli\u0107 na dost\u0119p do lokalizacji w ustawieniach uprawnie\u0144 urz\u0105dzenia.`,
        dropTitle: 'Pu\u015B\u0107 to',
        dropMessage: 'Upu\u015B\u0107 sw\u00F3j plik tutaj',
        flash: 'flash',
        multiScan: 'multi-skanowanie',
        shutter: 'migawka',
        gallery: 'galeria',
        deleteReceipt: 'Usu\u0144 paragon',
        deleteConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 ten paragon?',
        addReceipt: 'Dodaj paragon',
    },
    quickAction: {
        scanReceipt: 'Zeskanuj paragon',
        recordDistance: '\u015Aled\u017A dystans',
        requestMoney: 'Utw\u00F3rz wydatek',
        perDiem: 'Utw\u00F3rz diet\u0119 dzienn\u0105',
        splitBill: 'Podziel wydatek',
        splitScan: 'Podziel paragon',
        splitDistance: 'Podziel odleg\u0142o\u015B\u0107',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zap\u0142a\u0107 ${name ?? 'kto\u015B'}`,
        assignTask: 'Przypisz zadanie',
        header: 'Szybka akcja',
        noLongerHaveReportAccess: 'Nie masz ju\u017C dost\u0119pu do swojego poprzedniego szybkiego celu. Wybierz nowy poni\u017Cej.',
        updateDestination: 'Zaktualizuj miejsce docelowe',
        createReport: 'Utw\u00F3rz raport',
    },
    iou: {
        amount: 'Kwota',
        taxAmount: 'Kwota podatku',
        taxRate: 'Stawka podatkowa',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Zatwierd\u017A ${formattedAmount}` : 'Zatwierd\u017A'),
        approved: 'Zatwierdzono',
        cash: 'Got\u00F3wka',
        card: 'Karta',
        original: 'Orygina\u0142',
        split: 'Podzieli\u0107',
        splitExpense: 'Podziel wydatek',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} od ${merchant}`,
        addSplit: 'Dodaj podzia\u0142',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Ca\u0142kowita kwota jest o ${amount} wi\u0119ksza ni\u017C pierwotny wydatek.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Ca\u0142kowita kwota jest o ${amount} mniejsza ni\u017C pierwotny wydatek.`,
        splitExpenseZeroAmount: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142ow\u0105 kwot\u0119 przed kontynuowaniem.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edytuj ${amount} dla ${merchant}`,
        removeSplit: 'Usu\u0144 podzia\u0142',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zap\u0142a\u0107 ${name ?? 'kto\u015B'}`,
        expense: 'Wydatek',
        categorize: 'Kategoryzuj',
        share: 'Udost\u0119pnij',
        participants: 'Uczestnicy',
        createExpense: 'Utw\u00F3rz wydatek',
        addExpense: 'Dodaj wydatek',
        chooseRecipient: 'Wybierz odbiorc\u0119',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Utw\u00F3rz wydatek na kwot\u0119 ${amount}`,
        confirmDetails: 'Potwierd\u017A szczeg\u00F3\u0142y',
        pay: 'Zap\u0142a\u0107',
        cancelPayment: 'Anuluj p\u0142atno\u015B\u0107',
        cancelPaymentConfirmation: 'Czy na pewno chcesz anulowa\u0107 t\u0119 p\u0142atno\u015B\u0107?',
        viewDetails: 'Zobacz szczeg\u00F3\u0142y',
        pending: 'Oczekuj\u0105ce',
        canceled: 'Anulowano',
        posted: 'Opublikowano',
        deleteReceipt: 'Usu\u0144 paragon',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `usun\u0105\u0142 wydatek w tym raporcie, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `przeniesiono wydatek${reportName ? `z ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `przeniesiono ten wydatek${reportName ? `do <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'przeni\u00F3s\u0142 ten wydatek do Twojej przestrzeni osobistej',
        pendingMatchWithCreditCard: 'Paragon oczekuje na dopasowanie z transakcj\u0105 kart\u0105',
        pendingMatch: 'Oczekuj\u0105ce dopasowanie',
        pendingMatchWithCreditCardDescription: 'Paragon oczekuje na dopasowanie z transakcj\u0105 kart\u0105. Oznacz jako got\u00F3wka, aby anulowa\u0107.',
        markAsCash: 'Oznacz jako got\u00F3wka',
        routePending: 'Trasa w toku...',
        receiptScanning: () => ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragon\u00F3w...',
        }),
        scanMultipleReceipts: 'Skanuj wiele paragon\u00F3w',
        scanMultipleReceiptsDescription:
            'Zr\u00F3b zdj\u0119cia wszystkich swoich paragon\u00F3w naraz, a nast\u0119pnie potwierd\u017A szczeg\u00F3\u0142y samodzielnie lub pozw\u00F3l, aby SmartScan si\u0119 tym zaj\u0105\u0142.',
        receiptScanInProgress: 'Skanowanie paragonu w toku',
        receiptScanInProgressDescription: 'Skanowanie paragonu w toku. Sprawd\u017A p\u00F3\u017Aniej lub wprowad\u017A dane teraz.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Zidentyfikowano potencjalne duplikaty wydatk\u00F3w. Przejrzyj duplikaty, aby umo\u017Cliwi\u0107 przes\u0142anie.'
                : 'Zidentyfikowano potencjalne duplikaty wydatk\u00F3w. Przejrzyj duplikaty, aby umo\u017Cliwi\u0107 zatwierdzenie.',
        receiptIssuesFound: () => ({
            one: 'Znaleziono problem',
            other: 'Znalezione problemy',
        }),
        fieldPending: 'Oczekuj\u0105ce...',
        defaultRate: 'Domy\u015Blna stawka',
        receiptMissingDetails: 'Brakuj\u0105ce szczeg\u00F3\u0142y paragonu',
        missingAmount: 'Brakuj\u0105ca kwota',
        missingMerchant: 'Brakuj\u0105cy sprzedawca',
        receiptStatusTitle: 'Skanowanie\u2026',
        receiptStatusText: 'Tylko Ty mo\u017Cesz zobaczy\u0107 ten paragon podczas skanowania. Sprawd\u017A p\u00F3\u017Aniej lub wprowad\u017A szczeg\u00F3\u0142y teraz.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiod\u0142o si\u0119. Prosz\u0119 wprowadzi\u0107 dane r\u0119cznie.',
        transactionPendingDescription: 'Transakcja oczekuje. Mo\u017Ce to potrwa\u0107 kilka dni, zanim zostanie zaksi\u0119gowana.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy kilku dodatkowych szczeg\u00F3\u0142\u00F3w, zanim b\u0119dziesz m\u00F3g\u0142 wys\u0142a\u0107 swoj\u0105 pierwsz\u0105 faktur\u0119.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Je\u015Bli nie masz strony internetowej, mo\u017Cesz zamiast tego poda\u0107 profil swojej firmy na LinkedIn lub w mediach spo\u0142eczno\u015Bciowych.',
        invalidDomainError: 'Wprowadzi\u0142e\u015B nieprawid\u0142ow\u0105 domen\u0119. Aby kontynuowa\u0107, wprowad\u017A prawid\u0142ow\u0105 domen\u0119.',
        publicDomainError: 'Wprowadzi\u0142e\u015B domen\u0119 publiczn\u0105. Aby kontynuowa\u0107, wprowad\u017A domen\u0119 prywatn\u0105.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} skanowanie`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} w toku`);
            }
            return {
                one: statusText.length > 0 ? `1 wydatek (${statusText.join(', ')})` : `1 wydatek`,
                other: (count: number) => (statusText.length > 0 ? `${count} wydatki (${statusText.join(', ')})` : `${count} wydatki`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 wydatek',
                other: (count: number) => `${count} wydatki`,
            };
        },
        deleteExpense: () => ({
            one: 'Usu\u0144 wydatek',
            other: 'Usu\u0144 wydatki',
        }),
        deleteConfirmation: () => ({
            one: 'Czy na pewno chcesz usun\u0105\u0107 ten wydatek?',
            other: 'Czy na pewno chcesz usun\u0105\u0107 te wydatki?',
        }),
        deleteReport: 'Usu\u0144 raport',
        deleteReportConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 ten raport?',
        settledExpensify: 'Zap\u0142acono',
        done: 'Zrobione',
        settledElsewhere: 'Op\u0142acone gdzie indziej',
        individual: 'Indywidualny',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) =>
            formattedAmount ? `Zap\u0142a\u0107 ${formattedAmount} za pomoc\u0105 Expensify` : `Zap\u0142a\u0107 za pomoc\u0105 Expensify`,
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) =>
            formattedAmount ? `Zap\u0142a\u0107 ${formattedAmount} jako osoba prywatna` : `P\u0142a\u0107 jako osoba prywatna`,
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zap\u0142a\u0107 ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zap\u0142a\u0107 ${formattedAmount} jako firma` : `P\u0142a\u0107 jako firma`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zap\u0142a\u0107 ${formattedAmount} gdzie indziej` : `Zap\u0142a\u0107 gdzie indziej`),
        nextStep: 'Nast\u0119pne kroki',
        finished: 'Zako\u0144czono',
        sendInvoice: ({amount}: RequestAmountParams) => `Wy\u015Blij faktur\u0119 na kwot\u0119 ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Prze\u015Blij ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        submitted: `przes\u0142ano`,
        automaticallySubmitted: `przes\u0142ane za po\u015Brednictwem <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">op\u00F3\u017Anij zg\u0142oszenia</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `\u015Bledzenie ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `podziel ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `podziel ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Tw\u00F3j podzia\u0142 ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} jest winien ${amount}${comment ? `dla ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} jest winien:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}zap\u0142aci\u0142 ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} zap\u0142aci\u0142:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} wyda\u0142 ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} wyda\u0142:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} zatwierdzi\u0142:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} zatwierdzi\u0142 ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `zap\u0142acono ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `zap\u0142acono ${amount}. Dodaj konto bankowe, aby otrzyma\u0107 p\u0142atno\u015B\u0107.`,
        automaticallyApproved: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `zatwierdzono ${amount}`,
        approvedMessage: `zatwierdzony`,
        unapproved: `niezatwierdzone`,
        automaticallyForwarded: `zatwierdzone przez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        forwarded: `zatwierdzony`,
        rejectedThisReport: 'odrzucono ten raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpocz\u0119to rozliczanie. P\u0142atno\u015B\u0107 jest wstrzymana, dop\u00F3ki ${submitterDisplayName} nie doda konta bankowego.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} anulowa\u0142 p\u0142atno\u015B\u0107`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `anulowano p\u0142atno\u015B\u0107 w wysoko\u015Bci ${amount}, poniewa\u017C ${submitterDisplayName} nie aktywowa\u0142 swojego Expensify Wallet w ci\u0105gu 30 dni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} doda\u0142 konto bankowe. P\u0142atno\u015B\u0107 w wysoko\u015Bci ${amount} zosta\u0142a dokonana.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}zap\u0142acono gdzie indziej`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''} zap\u0142acono za pomoc\u0105 Expensify`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} zap\u0142acono za pomoc\u0105 Expensify poprzez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        noReimbursableExpenses: 'Ten raport ma nieprawid\u0142ow\u0105 kwot\u0119',
        pendingConversionMessage: 'Ca\u0142kowita suma zostanie zaktualizowana, gdy b\u0119dziesz ponownie online.',
        changedTheExpense: 'zmieniono wydatek',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} na ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `ustaw ${translatedChangedField} na ${newMerchant}, co ustawi\u0142o kwot\u0119 na ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName} (wcze\u015Bniej ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} na ${newValueToDisplay} (wcze\u015Bniej ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `zmieniono ${translatedChangedField} na ${newMerchant} (wcze\u015Bniej ${oldMerchant}), co zaktualizowa\u0142o kwot\u0119 na ${newAmountToDisplay} (wcze\u015Bniej ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `dla ${comment}` : 'wydatek'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Raport Faktury #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} wys\u0142ano${comment ? `dla ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `przeniesiono wydatek z przestrzeni osobistej do ${workspaceName ?? `czat z ${reportName}`}`,
        movedToPersonalSpace: 'przeniesiono wydatek do przestrzeni osobistej',
        tagSelection: 'Wybierz tag, aby lepiej zorganizowa\u0107 swoje wydatki.',
        categorySelection: 'Wybierz kategori\u0119, aby lepiej zorganizowa\u0107 swoje wydatki.',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znak\u00F3w. Prosz\u0119 skr\u00F3ci\u0107 j\u0105 lub wybra\u0107 inn\u0105 kategori\u0119.',
            invalidTagLength: 'Nazwa tagu przekracza 255 znak\u00F3w. Prosz\u0119 skr\u00F3ci\u0107 j\u0105 lub wybra\u0107 inny tag.',
            invalidAmount: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142ow\u0105 kwot\u0119 przed kontynuowaniem',
            invalidIntegerAmount: 'Prosz\u0119 wprowadzi\u0107 pe\u0142n\u0105 kwot\u0119 w dolarach przed kontynuowaniem',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maksymalna kwota podatku to ${amount}`,
            invalidSplit: 'Suma podzia\u0142\u00F3w musi r\u00F3wna\u0107 si\u0119 ca\u0142kowitej kwocie',
            invalidSplitParticipants: 'Prosz\u0119 wprowadzi\u0107 kwot\u0119 wi\u0119ksz\u0105 ni\u017C zero dla co najmniej dw\u00F3ch uczestnik\u00F3w.',
            invalidSplitYourself: 'Prosz\u0119 wprowadzi\u0107 kwot\u0119 r\u00F3\u017Cn\u0105 od zera dla podzia\u0142u',
            noParticipantSelected: 'Prosz\u0119 wybra\u0107 uczestnika',
            other: 'Nieoczekiwany b\u0142\u0105d. Spr\u00F3buj ponownie p\u00F3\u017Aniej.',
            genericCreateFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas przesy\u0142ania tego wydatku. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            genericCreateInvoiceFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas wysy\u0142ania tej faktury. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            genericHoldExpenseFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas przetwarzania tego wydatku. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            genericUnholdExpenseFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas zdejmowania tego wydatku z wstrzymania. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            receiptDeleteFailureError: 'Nieoczekiwany b\u0142\u0105d podczas usuwania tego paragonu. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            receiptFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas przesy\u0142ania paragonu. Prosz\u0119',
            receiptFailureMessageShort: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas przesy\u0142ania paragonu.',
            tryAgainMessage: 'spr\u00F3buj ponownie',
            saveFileMessage: 'zapisz paragon',
            uploadLaterMessage: 'za\u0142adowa\u0107 p\u00F3\u017Aniej.',
            genericDeleteFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas usuwania tego wydatku. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            genericEditFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas edytowania tego wydatku. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            genericSmartscanFailureMessage: 'Transakcja ma brakuj\u0105ce pola',
            duplicateWaypointsErrorMessage: 'Prosz\u0119 usun\u0105\u0107 zduplikowane punkty na trasie',
            atLeastTwoDifferentWaypoints: 'Prosz\u0119 wprowadzi\u0107 co najmniej dwa r\u00F3\u017Cne adresy',
            splitExpenseMultipleParticipantsErrorMessage:
                'Nie mo\u017Cna podzieli\u0107 wydatku mi\u0119dzy przestrze\u0144 robocz\u0105 a innych cz\u0142onk\u00F3w. Prosz\u0119 zaktualizowa\u0107 sw\u00F3j wyb\u00F3r.',
            invalidMerchant: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owego sprzedawc\u0119',
            atLeastOneAttendee: 'Nale\u017Cy wybra\u0107 co najmniej jednego uczestnika',
            invalidQuantity: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142ow\u0105 ilo\u015B\u0107',
            quantityGreaterThanZero: 'Ilo\u015B\u0107 musi by\u0107 wi\u0119ksza ni\u017C zero',
            invalidSubrateLength: 'Musi by\u0107 co najmniej jedna podstawka',
            invalidRate: 'Stawka nie jest wa\u017Cna dla tego miejsca pracy. Prosz\u0119 wybra\u0107 dost\u0119pn\u0105 stawk\u0119 z miejsca pracy.',
        },
        dismissReceiptError: 'Usu\u0144 b\u0142\u0105d',
        dismissReceiptErrorConfirmation: 'Uwaga! Zignorowanie tego b\u0142\u0119du spowoduje ca\u0142kowite usuni\u0119cie przes\u0142anego paragonu. Czy jeste\u015B pewien?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpocz\u0119to rozliczanie. P\u0142atno\u015B\u0107 jest wstrzymana, dop\u00F3ki ${submitterDisplayName} nie aktywuje swojego portfela.`,
        enableWallet: 'W\u0142\u0105cz portfel',
        hold: 'Trzymaj',
        unhold: 'Usu\u0144 blokad\u0119',
        holdExpense: 'Wstrzymaj wydatek',
        unholdExpense: 'Odblokuj wydatek',
        heldExpense: 'wstrzyma\u0142 ten wydatek',
        unheldExpense: 'anuluj wstrzymanie tego wydatku',
        moveUnreportedExpense: 'Przenie\u015B niezg\u0142oszony wydatek',
        addUnreportedExpense: 'Dodaj niezg\u0142oszony wydatek',
        createNewExpense: 'Utw\u00F3rz nowy wydatek',
        selectUnreportedExpense: 'Wybierz co najmniej jeden wydatek do dodania do raportu.',
        emptyStateUnreportedExpenseTitle: 'Brak niezg\u0142oszonych wydatk\u00F3w',
        emptyStateUnreportedExpenseSubtitle: 'Wygl\u0105da na to, \u017Ce nie masz \u017Cadnych nieraportowanych wydatk\u00F3w. Spr\u00F3buj utworzy\u0107 jeden poni\u017Cej.',
        addUnreportedExpenseConfirm: 'Dodaj do raportu',
        explainHold: 'Wyja\u015Bnij, dlaczego wstrzymujesz ten wydatek.',
        undoSubmit: 'Cofnij wys\u0142anie',
        retracted: 'wycofano',
        undoClose: 'Cofnij zamkni\u0119cie',
        reopened: 'ponownie otwarty',
        reopenReport: 'Ponownie otw\u00F3rz raport',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ten raport zosta\u0142 ju\u017C wyeksportowany do ${connectionName}. Zmiana mo\u017Ce prowadzi\u0107 do rozbie\u017Cno\u015Bci danych. Czy na pewno chcesz ponownie otworzy\u0107 ten raport?`,
        reason: 'Pow\u00F3d',
        holdReasonRequired: 'Wymagany jest pow\u00F3d wstrzymania.',
        expenseWasPutOnHold: 'Wydatek zosta\u0142 wstrzymany',
        expenseOnHold: 'Ten wydatek zosta\u0142 wstrzymany. Prosz\u0119 zapozna\u0107 si\u0119 z komentarzami, aby pozna\u0107 kolejne kroki.',
        expensesOnHold: 'Wszystkie wydatki zosta\u0142y wstrzymane. Prosz\u0119 zapozna\u0107 si\u0119 z komentarzami, aby pozna\u0107 kolejne kroki.',
        expenseDuplicate: 'Ten wydatek ma podobne szczeg\u00F3\u0142y do innego. Prosz\u0119 przejrze\u0107 duplikaty, aby kontynuowa\u0107.',
        someDuplicatesArePaid: 'Niekt\u00F3re z tych duplikat\u00F3w zosta\u0142y ju\u017C zatwierdzone lub op\u0142acone.',
        reviewDuplicates: 'Przejrzyj duplikaty',
        keepAll: 'Zachowaj wszystko',
        confirmApprove: 'Potwierd\u017A kwot\u0119 zatwierdzenia',
        confirmApprovalAmount: 'Zatwierd\u017A tylko zgodne wydatki lub zatwierd\u017A ca\u0142y raport.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz go zatwierdzi\u0107?',
            other: 'Te wydatki s\u0105 wstrzymane. Czy mimo to chcesz je zatwierdzi\u0107?',
        }),
        confirmPay: 'Potwierd\u017A kwot\u0119 p\u0142atno\u015Bci',
        confirmPayAmount: 'Zap\u0142a\u0107 to, co nie jest wstrzymane, lub zap\u0142a\u0107 ca\u0142y raport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zap\u0142aci\u0107?',
            other: 'Te wydatki s\u0105 wstrzymane. Czy mimo to chcesz zap\u0142aci\u0107?',
        }),
        payOnly: 'P\u0142a\u0107 tylko',
        approveOnly: 'Zatwierd\u017A tylko',
        holdEducationalTitle: 'To \u017C\u0105danie jest w toku',
        holdEducationalText: 'trzymaj',
        whatIsHoldExplain:
            'Wstrzymanie jest jak naci\u015Bni\u0119cie \u201Epauzy\u201D na wydatku, aby poprosi\u0107 o wi\u0119cej szczeg\u00F3\u0142\u00F3w przed zatwierdzeniem lub p\u0142atno\u015Bci\u0105.',
        holdIsLeftBehind: 'Zatrzymane wydatki s\u0105 przenoszone do innego raportu po zatwierdzeniu lub p\u0142atno\u015Bci.',
        unholdWhenReady: 'Osoby zatwierdzaj\u0105ce mog\u0105 zdj\u0105\u0107 wstrzymanie wydatk\u00F3w, gdy s\u0105 gotowe do zatwierdzenia lub p\u0142atno\u015Bci.',
        changePolicyEducational: {
            title: 'Przenios\u0142e\u015B ten raport!',
            description: 'Sprawd\u017A te elementy, kt\u00F3re maj\u0105 tendencj\u0119 do zmiany podczas przenoszenia raport\u00F3w do nowego obszaru roboczego.',
            reCategorize: '<strong>Przeklasyfikuj wszelkie wydatki</strong>, aby spe\u0142nia\u0142y zasady przestrzeni roboczej.',
            workflows: 'Ten raport mo\u017Ce teraz podlega\u0107 innemu <strong>procesowi zatwierdzania.</strong>',
        },
        changeWorkspace: 'Zmie\u0144 przestrze\u0144 robocz\u0105',
        set: 'set',
        changed: 'zmieniono',
        removed: 'usuni\u0119to',
        transactionPending: 'Transakcja oczekuje.',
        chooseARate: 'Wybierz stawk\u0119 zwrotu koszt\u00F3w za mil\u0119 lub kilometr dla przestrzeni roboczej',
        unapprove: 'Cofnij zatwierdzenie',
        unapproveReport: 'Cofnij zatwierdzenie raportu',
        headsUp: 'Uwaga!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ten raport zosta\u0142 ju\u017C wyeksportowany do ${accountingIntegration}. Zmiana mo\u017Ce prowadzi\u0107 do rozbie\u017Cno\u015Bci w danych. Czy na pewno chcesz cofn\u0105\u0107 zatwierdzenie tego raportu?`,
        reimbursable: 'podlegaj\u0105cy zwrotowi',
        nonReimbursable: 'niepodlegaj\u0105cy zwrotowi',
        bookingPending: 'Rezerwacja jest w toku',
        bookingPendingDescription: 'Ta rezerwacja jest oczekuj\u0105ca, poniewa\u017C nie zosta\u0142a jeszcze op\u0142acona.',
        bookingArchived: 'Ta rezerwacja jest zarchiwizowana',
        bookingArchivedDescription:
            'Ta rezerwacja jest zarchiwizowana, poniewa\u017C data podr\u00F3\u017Cy min\u0119\u0142a. Dodaj wydatek na ostateczn\u0105 kwot\u0119, je\u015Bli to konieczne.',
        attendees: 'Uczestnicy',
        whoIsYourAccountant: 'Kim jest Tw\u00F3j ksi\u0119gowy?',
        paymentComplete: 'P\u0142atno\u015B\u0107 zako\u0144czona',
        time: 'Czas',
        startDate: 'Data rozpocz\u0119cia',
        endDate: 'Data zako\u0144czenia',
        startTime: 'Czas rozpocz\u0119cia',
        endTime: 'Czas zako\u0144czenia',
        deleteSubrate: 'Usu\u0144 subrate',
        deleteSubrateConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 podstawk\u0119?',
        quantity: 'Ilo\u015B\u0107',
        subrateSelection: 'Wybierz podstawk\u0119 i wprowad\u017A ilo\u015B\u0107.',
        qty: 'Ilo\u015B\u0107',
        firstDayText: () => ({
            one: `Pierwszy dzie\u0144: 1 godzina`,
            other: (count: number) => `Pierwszy dzie\u0144: ${count.toFixed(2)} godzin`,
        }),
        lastDayText: () => ({
            one: `Ostatni dzie\u0144: 1 godzina`,
            other: (count: number) => `Ostatni dzie\u0144: ${count.toFixed(2)} godzin`,
        }),
        tripLengthText: () => ({
            one: `Podr\u00F3\u017C: 1 pe\u0142ny dzie\u0144`,
            other: (count: number) => `Podr\u00F3\u017C: ${count} pe\u0142ne dni`,
        }),
        dates: 'Daty',
        rates: 'Stawki',
        submitsTo: ({name}: SubmitsToParams) => `Przesy\u0142a do ${name}`,
        moveExpenses: () => ({one: 'Przenie\u015B wydatek', other: 'Przenie\u015B wydatki'}),
    },
    share: {
        shareToExpensify: 'Udost\u0119pnij do Expensify',
        messageInputLabel: 'Wiadomo\u015B\u0107',
    },
    notificationPreferencesPage: {
        header: 'Preferencje powiadomie\u0144',
        label: 'Powiadom mnie o nowych wiadomo\u015Bciach',
        notificationPreferences: {
            always: 'Natychmiast',
            daily: 'Codziennie',
            mute: 'Wycisz',
            hidden: 'Ukryty',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Numer nie zosta\u0142 zweryfikowany. Kliknij przycisk, aby ponownie wys\u0142a\u0107 link weryfikacyjny za pomoc\u0105 wiadomo\u015Bci tekstowej.',
        emailHasNotBeenValidated: 'E-mail nie zosta\u0142 zweryfikowany. Kliknij przycisk, aby ponownie wys\u0142a\u0107 link weryfikacyjny przez SMS.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prze\u015Blij zdj\u0119cie',
        removePhoto: 'Usu\u0144 zdj\u0119cie',
        editImage: 'Edytuj zdj\u0119cie',
        viewPhoto: 'Zobacz zdj\u0119cie',
        imageUploadFailed: 'Przesy\u0142anie obrazu nie powiod\u0142o si\u0119',
        deleteWorkspaceError: 'Przepraszamy, wyst\u0105pi\u0142 nieoczekiwany problem podczas usuwania awatara przestrzeni roboczej.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Wybrany obraz przekracza maksymalny rozmiar przesy\u0142ania wynosz\u0105cy ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Prosz\u0119 przes\u0142a\u0107 obraz wi\u0119kszy ni\u017C ${minHeightInPx}x${minWidthInPx} pikseli i mniejszy ni\u017C ${maxHeightInPx}x${maxWidthInPx} pikseli.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) =>
            `Zdj\u0119cie profilowe musi by\u0107 jednym z nast\u0119puj\u0105cych typ\u00F3w: ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Backdrop Modalu',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Preferowane zaimki',
        selectYourPronouns: 'Wybierz swoje zaimki',
        selfSelectYourPronoun: 'Samodzielnie wybierz sw\u00F3j zaimek',
        emailAddress: 'Adres e-mail',
        setMyTimezoneAutomatically: 'Ustaw m\u00F3j czas automatycznie',
        timezone: 'Strefa czasowa',
        invalidFileMessage: 'Nieprawid\u0142owy plik. Prosz\u0119 spr\u00F3bowa\u0107 inny obraz.',
        avatarUploadFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas przesy\u0142ania awatara. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronizacja',
        profileAvatar: 'Awatar profilu',
        publicSection: {
            title: 'Publiczny',
            subtitle: 'Te szczeg\u00F3\u0142y s\u0105 wy\u015Bwietlane na Twoim publicznym profilu. Ka\u017Cdy mo\u017Ce je zobaczy\u0107.',
        },
        privateSection: {
            title: 'Prywatne',
            subtitle: 'Te dane s\u0105 u\u017Cywane do podr\u00F3\u017Cy i p\u0142atno\u015Bci. Nigdy nie s\u0105 wy\u015Bwietlane na Twoim publicznym profilu.',
        },
    },
    securityPage: {
        title: 'Opcje bezpiecze\u0144stwa',
        subtitle: 'W\u0142\u0105cz uwierzytelnianie dwusk\u0142adnikowe, aby zabezpieczy\u0107 swoje konto.',
        goToSecurity: 'Wr\u00F3\u0107 do strony bezpiecze\u0144stwa',
    },
    shareCodePage: {
        title: 'Tw\u00F3j kod',
        subtitle: 'Zapro\u015B cz\u0142onk\u00F3w do Expensify, udost\u0119pniaj\u0105c sw\u00F3j osobisty kod QR lub link referencyjny.',
    },
    pronounsPage: {
        pronouns: 'Zaimki',
        isShownOnProfile: 'Twoje zaimki s\u0105 wy\u015Bwietlane na Twoim profilu.',
        placeholderText: 'Wyszukaj, aby zobaczy\u0107 opcje',
    },
    contacts: {
        contactMethod: 'Metoda kontaktu',
        contactMethods: 'Metody kontaktu',
        featureRequiresValidate: 'Ta funkcja wymaga weryfikacji Twojego konta.',
        validateAccount: 'Zweryfikuj swoje konto',
        helpTextBeforeEmail: 'Dodaj wi\u0119cej sposob\u00F3w, aby ludzie mogli Ci\u0119 znale\u017A\u0107, i przekazuj paragony do',
        helpTextAfterEmail: 'z wielu adres\u00F3w e-mail.',
        pleaseVerify: 'Prosz\u0119 zweryfikowa\u0107 t\u0119 metod\u0119 kontaktu',
        getInTouch: 'Za ka\u017Cdym razem, gdy b\u0119dziemy musieli si\u0119 z Tob\u0105 skontaktowa\u0107, u\u017Cyjemy tej metody kontaktu.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ${contactMethod}. Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.`,
        setAsDefault: 'Ustaw jako domy\u015Blne',
        yourDefaultContactMethod:
            'To jest Twoja domy\u015Blna metoda kontaktu. Zanim b\u0119dziesz m\u00F3g\u0142 j\u0105 usun\u0105\u0107, musisz wybra\u0107 inn\u0105 metod\u0119 kontaktu i klikn\u0105\u0107 \u201EUstaw jako domy\u015Bln\u0105\u201D.',
        removeContactMethod: 'Usu\u0144 metod\u0119 kontaktu',
        removeAreYouSure: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 metod\u0119 kontaktu? Tej operacji nie mo\u017Cna cofn\u0105\u0107.',
        failedNewContact: 'Nie uda\u0142o si\u0119 doda\u0107 tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie uda\u0142o si\u0119 wys\u0142a\u0107 nowego kodu magicznego. Prosz\u0119 chwil\u0119 poczeka\u0107 i spr\u00F3bowa\u0107 ponownie.',
            validateSecondaryLogin: 'Niepoprawny lub niewa\u017Cny kod magiczny. Spr\u00F3buj ponownie lub popro\u015B o nowy kod.',
            deleteContactMethod: 'Nie uda\u0142o si\u0119 usun\u0105\u0107 metody kontaktu. Prosz\u0119 skontaktowa\u0107 si\u0119 z Concierge po pomoc.',
            setDefaultContactMethod: 'Nie uda\u0142o si\u0119 ustawi\u0107 nowej domy\u015Blnej metody kontaktu. Prosz\u0119 skontaktowa\u0107 si\u0119 z Concierge po pomoc.',
            addContactMethod: 'Nie uda\u0142o si\u0119 doda\u0107 tej metody kontaktu. Prosz\u0119 skontaktowa\u0107 si\u0119 z Concierge po pomoc.',
            enteredMethodIsAlreadySubmitted: 'Ta metoda kontaktu ju\u017C istnieje',
            passwordRequired: 'wymagane has\u0142o.',
            contactMethodRequired: 'Wymagana jest metoda kontaktu',
            invalidContactMethod: 'Nieprawid\u0142owa metoda kontaktu',
        },
        newContactMethod: 'Nowa metoda kontaktu',
        goBackContactMethods: 'Wr\u00F3\u0107 do metod kontaktu',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'On / Jego / Jemu',
        heHimHisTheyThemTheirs: 'On / Jego / Jemu / Oni / Ich / Ich',
        sheHerHers: 'Ona / Jej / Jej',
        sheHerHersTheyThemTheirs: 'Ona / Jej / Jej / Oni / Ich / Ich',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Oni / Ich / Ich',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Zawo\u0142aj mnie po imieniu',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Wy\u015Bwietlana nazwa',
        isShownOnProfile: 'Twoja nazwa wy\u015Bwietlana jest widoczna na Twoim profilu.',
    },
    timezonePage: {
        timezone: 'Strefa czasowa',
        isShownOnProfile: 'Twoja strefa czasowa jest wy\u015Bwietlana na Twoim profilu.',
        getLocationAutomatically: 'Automatycznie okre\u015Bl swoj\u0105 lokalizacj\u0119',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Prosz\u0119 zaktualizowa\u0107 do najnowszej wersji New Expensify.',
        pleaseInstallExpensifyClassic: 'Prosz\u0119 zainstalowa\u0107 najnowsz\u0105 wersj\u0119 Expensify',
        toGetLatestChanges:
            'Na urz\u0105dzenia mobilne lub stacjonarne pobierz i zainstaluj najnowsz\u0105 wersj\u0119. W przypadku wersji webowej od\u015Bwie\u017C przegl\u0105dark\u0119.',
        newAppNotAvailable: 'Nowa aplikacja Expensify nie jest ju\u017C dost\u0119pna.',
    },
    initialSettingsPage: {
        about: 'O aplikacji',
        aboutPage: {
            description:
                'Nowa aplikacja Expensify jest tworzona przez spo\u0142eczno\u015B\u0107 deweloper\u00F3w open-source z ca\u0142ego \u015Bwiata. Pom\u00F3\u017C nam budowa\u0107 przysz\u0142o\u015B\u0107 Expensify.',
            appDownloadLinks: 'Linki do pobrania aplikacji',
            viewKeyboardShortcuts: 'Wy\u015Bwietl skr\u00F3ty klawiaturowe',
            viewTheCode: 'Zobacz kod',
            viewOpenJobs: 'Zobacz otwarte oferty pracy',
            reportABug: 'Zg\u0142o\u015B b\u0142\u0105d',
            troubleshoot: 'Rozwi\u0105zywanie problem\u00F3w',
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
            clearCacheAndRestart: 'Wyczy\u015B\u0107 pami\u0119\u0107 podr\u0119czn\u0105 i uruchom ponownie',
            viewConsole: 'Wy\u015Bwietl konsol\u0119 debugowania',
            debugConsole: 'Konsola debugowania',
            description:
                'U\u017Cyj poni\u017Cszych narz\u0119dzi, aby pom\u00F3c rozwi\u0105za\u0107 problemy z do\u015Bwiadczeniem w Expensify. Je\u015Bli napotkasz jakiekolwiek problemy, prosz\u0119',
            submitBug: 'zg\u0142o\u015B b\u0142\u0105d',
            confirmResetDescription: 'Wszystkie niewys\u0142ane wersje robocze wiadomo\u015Bci zostan\u0105 utracone, ale reszta Twoich danych jest bezpieczna.',
            resetAndRefresh: 'Resetuj i od\u015Bwie\u017C',
            clientSideLogging: 'Logowanie po stronie klienta',
            noLogsToShare: 'Brak dziennik\u00F3w do udost\u0119pnienia',
            useProfiling: 'U\u017Cyj profilowania',
            profileTrace: '\u015Alad profilu',
            releaseOptions: 'Opcje wydania',
            testingPreferences: 'Testowanie preferencji',
            useStagingServer: 'U\u017Cyj serwera Staging',
            forceOffline: 'Wymu\u015B tryb offline',
            simulatePoorConnection: 'Symuluj s\u0142abe po\u0142\u0105czenie internetowe',
            simulateFailingNetworkRequests: 'Symuluj nieudane \u017C\u0105dania sieciowe',
            authenticationStatus: 'Status uwierzytelniania',
            deviceCredentials: 'Po\u015Bwiadczenia urz\u0105dzenia',
            invalidate: 'Uniewa\u017Cni\u0107',
            destroy: 'Zniszczy\u0107',
            maskExportOnyxStateData: 'Maskuj wra\u017Cliwe dane cz\u0142onk\u00F3w podczas eksportowania stanu Onyx',
            exportOnyxState: 'Eksportuj stan Onyx',
            importOnyxState: 'Importuj stan Onyx',
            testCrash: 'Test awarii',
            resetToOriginalState: 'Przywr\u00F3\u0107 do stanu pocz\u0105tkowego',
            usingImportedState: 'U\u017Cywasz zaimportowanego stanu. Naci\u015Bnij tutaj, aby go wyczy\u015Bci\u0107.',
            debugMode: 'Tryb debugowania',
            invalidFile: 'Nieprawid\u0142owy plik',
            invalidFileDescription: 'Plik, kt\u00F3ry pr\u00F3bujesz zaimportowa\u0107, jest nieprawid\u0142owy. Spr\u00F3buj ponownie.',
            invalidateWithDelay: 'Uniewa\u017Cnij z op\u00F3\u017Anieniem',
        },
        debugConsole: {
            saveLog: 'Zapisz dziennik',
            shareLog: 'Udost\u0119pnij dziennik',
            enterCommand: 'Wpisz polecenie',
            execute: 'Wykonaj',
            noLogsAvailable: 'Brak dost\u0119pnych log\u00F3w',
            logSizeTooLarge: ({size}: LogSizeParams) => `Rozmiar dziennika przekracza limit ${size} MB. Prosz\u0119 u\u017Cy\u0107 "Zapisz dziennik", aby pobra\u0107 plik dziennika.`,
            logs: 'Dzienniki',
            viewConsole: 'Wy\u015Bwietl konsol\u0119',
        },
        security: 'Bezpiecze\u0144stwo',
        signOut: 'Wyloguj si\u0119',
        restoreStashed: 'Przywr\u00F3\u0107 zapisane logowanie',
        signOutConfirmationText: 'Utracisz wszystkie zmiany offline, je\u015Bli si\u0119 wylogujesz.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Przeczytaj',
            phrase2: 'Warunki korzystania z us\u0142ugi',
            phrase3: 'i',
            phrase4: 'Prywatno\u015B\u0107',
        },
        help: 'Pomoc',
        accountSettings: 'Ustawienia konta',
        account: 'Konto',
        general: 'Og\u00F3lne',
    },
    closeAccountPage: {
        closeAccount: 'Zamknij konto',
        reasonForLeavingPrompt: 'Nie chcieliby\u015Bmy, \u017Ceby\u015B odszed\u0142! Czy m\u00F3g\u0142by\u015B nam powiedzie\u0107 dlaczego, aby\u015Bmy mogli si\u0119 poprawi\u0107?',
        enterMessageHere: 'Wpisz wiadomo\u015B\u0107 tutaj',
        closeAccountWarning: 'Zamkni\u0119cie konta nie mo\u017Ce zosta\u0107 cofni\u0119te.',
        closeAccountPermanentlyDeleteData: 'Czy na pewno chcesz usun\u0105\u0107 swoje konto? Spowoduje to trwa\u0142e usuni\u0119cie wszystkich zaleg\u0142ych wydatk\u00F3w.',
        enterDefaultContactToConfirm:
            'Prosz\u0119 wprowadzi\u0107 domy\u015Bln\u0105 metod\u0119 kontaktu, aby potwierdzi\u0107 ch\u0119\u0107 zamkni\u0119cia konta. Twoja domy\u015Blna metoda kontaktu to:',
        enterDefaultContact: 'Wprowad\u017A swoj\u0105 domy\u015Bln\u0105 metod\u0119 kontaktu',
        defaultContact: 'Domy\u015Blna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Prosz\u0119 poda\u0107 domy\u015Bln\u0105 metod\u0119 kontaktu, aby zamkn\u0105\u0107 konto.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Scal konta',
        accountDetails: {
            accountToMergeInto: 'Wprowad\u017A konto, kt\u00F3re chcesz po\u0142\u0105czy\u0107 z innym',
            notReversibleConsent: 'Rozumiem, \u017Ce to jest nieodwracalne.',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz po\u0142\u0105czy\u0107 konta?',
            lossOfUnsubmittedData: `Scalenie kont jest nieodwracalne i spowoduje utrat\u0119 wszelkich nieprzes\u0142anych wydatk\u00F3w dla`,
            enterMagicCode: `Aby kontynuowa\u0107, wprowad\u017A magiczny kod wys\u0142any na`,
            errors: {
                incorrectMagicCode: 'Niepoprawny lub niewa\u017Cny kod magiczny. Spr\u00F3buj ponownie lub popro\u015B o nowy kod.',
                fallback: 'Co\u015B posz\u0142o nie tak. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konta po\u0142\u0105czone!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Pomy\u015Blnie scalono wszystkie dane z`,
                beforeSecondEmail: `into`,
                afterSecondEmail: `. Przechodz\u0105c dalej, mo\u017Cesz u\u017Cywa\u0107 dowolnego logowania dla tego konta.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Pracujemy nad tym',
            limitedSupport: 'Nie wspieramy jeszcze \u0142\u0105czenia kont w New Expensify. Prosz\u0119 podj\u0105\u0107 t\u0119 akcj\u0119 w Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Czuj si\u0119 swobodnie, aby',
                linkText: 'skontaktuj si\u0119 z Concierge',
                afterLink: 'je\u015Bli masz jakie\u015B pytania!',
            },
            goToExpensifyClassic: 'Przejd\u017A do Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Nie mo\u017Cesz scali\u0107',
            beforeDomain: 'poniewa\u017C jest kontrolowane przez',
            afterDomain: 'Prosz\u0119.',
            linkText: 'skontaktuj si\u0119 z Concierge',
            afterLink: 'po pomoc.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Nie mo\u017Cesz scali\u0107',
            afterEmail: 'do innych kont, poniewa\u017C administrator Twojej domeny ustawi\u0142 je jako Twoje g\u0142\u00F3wne logowanie. Zamiast tego po\u0142\u0105cz inne konta z nim.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Nie mo\u017Cesz po\u0142\u0105czy\u0107 kont, poniewa\u017C',
                beforeSecondEmail: 'ma w\u0142\u0105czone uwierzytelnianie dwusk\u0142adnikowe (2FA). Prosz\u0119 wy\u0142\u0105czy\u0107 2FA dla',
                afterSecondEmail: 'i spr\u00F3buj ponownie.',
            },
            learnMore: 'Dowiedz si\u0119 wi\u0119cej o \u0142\u0105czeniu kont.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Nie mo\u017Cesz scali\u0107',
            afterEmail: 'poniewa\u017C jest zablokowane. Prosz\u0119',
            linkText: 'skontaktuj si\u0119 z Concierge',
            afterLink: `po pomoc.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Nie mo\u017Cesz po\u0142\u0105czy\u0107 kont, poniewa\u017C',
                afterEmail: 'nie ma konta w Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Prosz\u0119',
                linkText: 'dodaj to jako metod\u0119 kontaktu',
                afterLink: 'instead.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Nie mo\u017Cesz scali\u0107',
            afterEmail: 'do innych kont. Prosz\u0119 po\u0142\u0105czy\u0107 inne konta z nim zamiast tego.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Nie mo\u017Cesz scali\u0107',
            afterEmail: 'do innych kont, poniewa\u017C jest w\u0142a\u015Bcicielem rozlicze\u0144 konta fakturowanego. Prosz\u0119 po\u0142\u0105czy\u0107 inne konta z nim zamiast tego.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Spr\u00F3buj ponownie p\u00F3\u017Aniej',
            description: 'By\u0142o zbyt wiele pr\u00F3b po\u0142\u0105czenia kont. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie mo\u017Cna scali\u0107 z innymi kontami, poniewa\u017C nie jest ono zweryfikowane. Prosz\u0119 zweryfikowa\u0107 konto i spr\u00F3bowa\u0107 ponownie.',
        },
        mergeFailureSelfMerge: {
            description: 'Nie mo\u017Cna po\u0142\u0105czy\u0107 konta z samym sob\u0105.',
        },
        mergeFailureGenericHeading: 'Nie mo\u017Cna po\u0142\u0105czy\u0107 kont',
    },
    lockAccountPage: {
        lockAccount: 'Zablokuj konto',
        unlockAccount: 'Odblokuj konto',
        compromisedDescription:
            'Je\u015Bli podejrzewasz, \u017Ce Twoje konto Expensify zosta\u0142o naruszone, mo\u017Cesz je zablokowa\u0107, aby zapobiec nowym transakcjom kart\u0105 Expensify i zablokowa\u0107 niechciane zmiany na koncie.',
        domainAdminsDescriptionPartOne: 'Dla administrator\u00F3w domeny,',
        domainAdminsDescriptionPartTwo: 'ta akcja wstrzymuje wszystkie dzia\u0142ania zwi\u0105zane z kart\u0105 Expensify i dzia\u0142ania administratora',
        domainAdminsDescriptionPartThree: 'w ca\u0142ej Twojej domenie (domenach).',
        warning: `Gdy Twoje konto zostanie zablokowane, nasz zesp\u00F3\u0142 przeprowadzi dochodzenie i usunie wszelki nieautoryzowany dost\u0119p. Aby odzyska\u0107 dost\u0119p, b\u0119dziesz musia\u0142 wsp\u00F3\u0142pracowa\u0107 z Concierge, aby zabezpieczy\u0107 swoje konto.`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Nie uda\u0142o si\u0119 zablokowa\u0107 konta',
        failedToLockAccountDescription: `Nie mogli\u015Bmy zablokowa\u0107 Twojego konta. Prosz\u0119 porozmawia\u0107 z Concierge, aby rozwi\u0105za\u0107 ten problem.`,
        chatWithConcierge: 'Czat z Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto zablokowane',
        yourAccountIsLocked: 'Twoje konto jest zablokowane',
        chatToConciergeToUnlock: 'Porozmawiaj z Concierge, aby rozwi\u0105za\u0107 problemy zwi\u0105zane z bezpiecze\u0144stwem i odblokowa\u0107 swoje konto.',
        chatWithConcierge: 'Czat z Concierge',
    },
    passwordPage: {
        changePassword: 'Zmie\u0144 has\u0142o',
        changingYourPasswordPrompt: 'Zmiana has\u0142a spowoduje aktualizacj\u0119 has\u0142a zar\u00F3wno dla Twojego konta na Expensify.com, jak i New Expensify.',
        currentPassword: 'Obecne has\u0142o',
        newPassword: 'Nowe has\u0142o',
        newPasswordPrompt:
            'Twoje nowe has\u0142o musi si\u0119 r\u00F3\u017Cni\u0107 od starego has\u0142a i zawiera\u0107 co najmniej 8 znak\u00F3w, 1 wielk\u0105 liter\u0119, 1 ma\u0142\u0105 liter\u0119 i 1 cyfr\u0119.',
    },
    twoFactorAuth: {
        headerTitle: 'Uwierzytelnianie dwusk\u0142adnikowe',
        twoFactorAuthEnabled: 'W\u0142\u0105czono uwierzytelnianie dwusk\u0142adnikowe',
        whatIsTwoFactorAuth:
            'Uwierzytelnianie dwusk\u0142adnikowe (2FA) pomaga zabezpieczy\u0107 Twoje konto. Podczas logowania b\u0119dziesz musia\u0142 wprowadzi\u0107 kod wygenerowany przez preferowan\u0105 aplikacj\u0119 uwierzytelniaj\u0105c\u0105.',
        disableTwoFactorAuth: 'Wy\u0142\u0105cz uwierzytelnianie dwusk\u0142adnikowe',
        explainProcessToRemove: 'Aby wy\u0142\u0105czy\u0107 uwierzytelnianie dwusk\u0142adnikowe (2FA), wprowad\u017A prawid\u0142owy kod z aplikacji uwierzytelniaj\u0105cej.',
        disabled: 'Uwierzytelnianie dwusk\u0142adnikowe zosta\u0142o teraz wy\u0142\u0105czone',
        noAuthenticatorApp: 'Nie b\u0119dziesz ju\u017C potrzebowa\u0107 aplikacji uwierzytelniaj\u0105cej, aby zalogowa\u0107 si\u0119 do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess:
            'Je\u015Bli stracisz dost\u0119p do aplikacji uwierzytelniaj\u0105cej i nie masz tych kod\u00F3w, stracisz dost\u0119p do swojego konta.\n\nUwaga: Ustawienie uwierzytelniania dwusk\u0142adnikowego wyloguje Ci\u0119 ze wszystkich innych aktywnych sesji.',
        errorStepCodes: 'Prosz\u0119 skopiowa\u0107 lub pobra\u0107 kody przed kontynuowaniem.',
        stepVerify: 'Zweryfikuj',
        scanCode: 'Zeskanuj kod QR za pomoc\u0105 swojego',
        authenticatorApp: 'aplikacja uwierzytelniaj\u0105ca',
        addKey: 'Lub dodaj ten klucz tajny do swojej aplikacji uwierzytelniaj\u0105cej:',
        enterCode: 'Nast\u0119pnie wprowad\u017A sze\u015Bciocyfrowy kod wygenerowany przez aplikacj\u0119 uwierzytelniaj\u0105c\u0105.',
        stepSuccess: 'Zako\u0144czono',
        enabled: 'W\u0142\u0105czono uwierzytelnianie dwusk\u0142adnikowe',
        congrats: 'Gratulacje! Teraz masz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wy\u0142\u0105cz',
        enableTwoFactorAuth: 'W\u0142\u0105cz uwierzytelnianie dwusk\u0142adnikowe',
        pleaseEnableTwoFactorAuth: 'Prosz\u0119 w\u0142\u0105czy\u0107 uwierzytelnianie dwusk\u0142adnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze wzgl\u0119d\u00F3w bezpiecze\u0144stwa, Xero wymaga uwierzytelniania dwusk\u0142adnikowego do po\u0142\u0105czenia integracji.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagana uwierzytelnianie dwusk\u0142adnikowe',
        twoFactorAuthIsRequiredForAdminsTitle: 'Prosz\u0119 w\u0142\u0105czy\u0107 uwierzytelnianie dwusk\u0142adnikowe',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Twoje po\u0142\u0105czenie ksi\u0119gowe Xero wymaga u\u017Cycia uwierzytelniania dwusk\u0142adnikowego. Aby kontynuowa\u0107 korzystanie z Expensify, prosz\u0119 je w\u0142\u0105czy\u0107.',
        twoFactorAuthCannotDisable: 'Nie mo\u017Cna wy\u0142\u0105czy\u0107 2FA',
        twoFactorAuthRequired: 'Do uwierzytelniania dwusk\u0142adnikowego (2FA) wymagana jest Twoja po\u0142\u0105czenie z Xero i nie mo\u017Cna go wy\u0142\u0105czy\u0107.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Prosz\u0119 wprowadzi\u0107 sw\u00F3j kod odzyskiwania',
            incorrectRecoveryCode: 'Niepoprawny kod odzyskiwania. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        },
        useRecoveryCode: 'U\u017Cyj kodu odzyskiwania',
        recoveryCode: 'Kod odzyskiwania',
        use2fa: 'U\u017Cyj kodu uwierzytelniania dwusk\u0142adnikowego',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Prosz\u0119 wprowadzi\u0107 sw\u00F3j kod uwierzytelniania dwusk\u0142adnikowego',
            incorrect2fa: 'Nieprawid\u0142owy kod uwierzytelniania dwusk\u0142adnikowego. Prosz\u0119 spr\u00F3buj ponownie.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Has\u0142o zaktualizowane!',
        allSet: 'Wszystko gotowe. Zachowaj swoje nowe has\u0142o w bezpiecznym miejscu.',
    },
    privateNotes: {
        title: 'Prywatne notatki',
        personalNoteMessage:
            'Zachowaj notatki dotycz\u0105ce tej rozmowy tutaj. Jeste\u015B jedyn\u0105 osob\u0105, kt\u00F3ra mo\u017Ce dodawa\u0107, edytowa\u0107 lub przegl\u0105da\u0107 te notatki.',
        sharedNoteMessage:
            'Zachowaj notatki dotycz\u0105ce tej rozmowy tutaj. Pracownicy Expensify i inni cz\u0142onkowie na domenie team.expensify.com mog\u0105 przegl\u0105da\u0107 te notatki.',
        composerLabel: 'Notatki',
        myNote: 'Moja notatka',
        error: {
            genericFailureMessage: 'Prywatne notatki nie mog\u0142y zosta\u0107 zapisane',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod zabezpieczaj\u0105cy',
        },
        securityCode: 'Kod bezpiecze\u0144stwa',
        changeBillingCurrency: 'Zmie\u0144 walut\u0119 rozliczeniow\u0105',
        changePaymentCurrency: 'Zmie\u0144 walut\u0119 p\u0142atno\u015Bci',
        paymentCurrency: 'Waluta p\u0142atno\u015Bci',
        paymentCurrencyDescription: 'Wybierz standardow\u0105 walut\u0119, na kt\u00F3r\u0105 powinny by\u0107 przeliczane wszystkie wydatki osobiste',
        note: 'Uwaga: Zmiana waluty p\u0142atno\u015Bci mo\u017Ce wp\u0142yn\u0105\u0107 na to, ile zap\u0142acisz za Expensify. Odnie\u015B si\u0119 do naszej',
        noteLink: 'strona cenowa',
        noteDetails: 'aby uzyska\u0107 pe\u0142ne szczeg\u00F3\u0142y.',
    },
    addDebitCardPage: {
        addADebitCard: 'Dodaj kart\u0119 debetow\u0105',
        nameOnCard: 'Nazwa na karcie',
        debitCardNumber: 'Numer karty debetowej',
        expiration: 'Data wa\u017Cno\u015Bci',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta debetowa zosta\u0142a pomy\u015Blnie dodana',
        expensifyPassword: 'Has\u0142o do Expensify',
        error: {
            invalidName: 'Nazwa mo\u017Ce zawiera\u0107 tylko litery',
            addressZipCode: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod pocztowy',
            debitCardNumber: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer karty debetowej',
            expirationDate: 'Prosz\u0119 wybra\u0107 prawid\u0142ow\u0105 dat\u0119 wyga\u015Bni\u0119cia',
            securityCode: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod zabezpieczaj\u0105cy',
            addressStreet: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy adres rozliczeniowy, kt\u00F3ry nie jest skrytk\u0105 pocztow\u0105',
            addressState: 'Prosz\u0119 wybra\u0107 stan',
            addressCity: 'Prosz\u0119 wprowadzi\u0107 miasto',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas dodawania karty. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            password: 'Prosz\u0119 wprowadzi\u0107 swoje has\u0142o do Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Dodaj kart\u0119 p\u0142atnicz\u0105',
        nameOnCard: 'Nazwa na karcie',
        paymentCardNumber: 'Numer karty',
        expiration: 'Data wa\u017Cno\u015Bci',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta p\u0142atnicza zosta\u0142a pomy\u015Blnie dodana',
        expensifyPassword: 'Has\u0142o do Expensify',
        error: {
            invalidName: 'Nazwa mo\u017Ce zawiera\u0107 tylko litery',
            addressZipCode: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod pocztowy',
            paymentCardNumber: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer karty',
            expirationDate: 'Prosz\u0119 wybra\u0107 prawid\u0142ow\u0105 dat\u0119 wyga\u015Bni\u0119cia',
            securityCode: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod zabezpieczaj\u0105cy',
            addressStreet: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy adres rozliczeniowy, kt\u00F3ry nie jest skrytk\u0105 pocztow\u0105',
            addressState: 'Prosz\u0119 wybra\u0107 stan',
            addressCity: 'Prosz\u0119 wprowadzi\u0107 miasto',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas dodawania karty. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            password: 'Prosz\u0119 wprowadzi\u0107 swoje has\u0142o do Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metody p\u0142atno\u015Bci',
        setDefaultConfirmation: 'Ustaw domy\u015Bln\u0105 metod\u0119 p\u0142atno\u015Bci',
        setDefaultSuccess: 'Domy\u015Blna metoda p\u0142atno\u015Bci ustawiona!',
        deleteAccount: 'Usu\u0144 konto',
        deleteConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 to konto?',
        error: {
            notOwnerOfBankAccount: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas ustawiania tego konta bankowego jako domy\u015Blnej metody p\u0142atno\u015Bci.',
            invalidBankAccount: 'To konto bankowe jest tymczasowo zawieszone',
            notOwnerOfFund: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas ustawiania tej karty jako domy\u015Blnej metody p\u0142atno\u015Bci',
            setDefaultFailure: 'Co\u015B posz\u0142o nie tak. Prosz\u0119 skontaktuj si\u0119 z Concierge, aby uzyska\u0107 dalsz\u0105 pomoc.',
        },
        addBankAccountFailure: 'Wyst\u0105pi\u0142 nieoczekiwany b\u0142\u0105d podczas pr\u00F3by dodania konta bankowego. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        getPaidFaster: 'Otrzymuj p\u0142atno\u015Bci szybciej',
        addPaymentMethod: 'Dodaj metod\u0119 p\u0142atno\u015Bci, aby wysy\u0142a\u0107 i odbiera\u0107 p\u0142atno\u015Bci bezpo\u015Brednio w aplikacji.',
        getPaidBackFaster: 'Otrzymaj zwrot szybciej',
        secureAccessToYourMoney: 'Zabezpiecz dost\u0119p do swoich pieni\u0119dzy',
        receiveMoney: 'Otrzymuj pieni\u0105dze w swojej lokalnej walucie',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Wysy\u0142aj i otrzymuj pieni\u0105dze z przyjaci\u00F3\u0142mi. Tylko konta bankowe w USA.',
        enableWallet: 'W\u0142\u0105cz portfel',
        addBankAccountToSendAndReceive: 'Otrzymaj zwrot koszt\u00F3w za wydatki, kt\u00F3re przesy\u0142asz do przestrzeni roboczej.',
        addBankAccount: 'Dodaj konto bankowe',
        assignedCards: 'Przypisane karty',
        assignedCardsDescription: 'S\u0105 to karty przypisane przez administratora przestrzeni roboczej do zarz\u0105dzania wydatkami firmy.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Przegl\u0105damy Twoje informacje. Prosz\u0119 wr\u00F3\u0107 za kilka minut!',
        walletActivationFailed:
            'Niestety, w tej chwili nie mo\u017Cna w\u0142\u0105czy\u0107 twojego portfela. Prosz\u0119 skontaktowa\u0107 si\u0119 z Concierge, aby uzyska\u0107 dalsz\u0105 pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody:
            'Po\u0142\u0105cz swoje konto bankowe z Expensify, aby \u0142atwiej ni\u017C kiedykolwiek wysy\u0142a\u0107 i odbiera\u0107 p\u0142atno\u015Bci bezpo\u015Brednio w aplikacji.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij si\u0119, \u017Ce wybierasz w\u0142a\u015Bciwy.',
        confirmYourBankAccount: 'Potwierd\u017A swoje konto bankowe',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Karta Podr\u00F3\u017Cna Expensify',
        availableSpend: 'Pozosta\u0142y limit',
        smartLimit: {
            name: 'Inteligentny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Mo\u017Cesz wyda\u0107 do ${formattedLimit} na tej karcie, a limit zostanie zresetowany, gdy Twoje zg\u0142oszone wydatki zostan\u0105 zatwierdzone.`,
        },
        fixedLimit: {
            name: 'Sta\u0142y limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Mo\u017Cesz wyda\u0107 do ${formattedLimit} na tej karcie, a nast\u0119pnie zostanie ona dezaktywowana.`,
        },
        monthlyLimit: {
            name: 'Miesi\u0119czny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Mo\u017Cesz wyda\u0107 do ${formattedLimit} na tej karcie miesi\u0119cznie. Limit zostanie zresetowany pierwszego dnia ka\u017Cdego miesi\u0105ca kalendarzowego.`,
        },
        virtualCardNumber: 'Numer karty wirtualnej',
        travelCardCvv: 'CVV karty podr\u00F3\u017Cnej',
        physicalCardNumber: 'Numer fizycznej karty',
        getPhysicalCard: 'Zdob\u0105d\u017A fizyczn\u0105 kart\u0119',
        reportFraud: 'Zg\u0142o\u015B oszustwo zwi\u0105zane z kart\u0105 wirtualn\u0105',
        reportTravelFraud: 'Zg\u0142o\u015B oszustwo zwi\u0105zane z kart\u0105 podr\u00F3\u017Cn\u0105',
        reviewTransaction: 'Przejrzyj transakcj\u0119',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Zauwa\u017Cyli\u015Bmy podejrzane transakcje na Twojej karcie. Stuknij poni\u017Cej, aby je przejrze\u0107.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zesp\u00F3\u0142 dokonuje przegl\u0105du konta Twojej firmy.',
        cardDetails: {
            cardNumber: 'Numer karty wirtualnej',
            expiration: 'Wyga\u015Bni\u0119cie',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Poka\u017C szczeg\u00F3\u0142y',
            revealCvv: 'Poka\u017C CVV',
            copyCardNumber: 'Skopiuj numer karty',
            updateAddress: 'Zaktualizuj adres',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Dodano do portfela ${platform}`,
        cardDetailsLoadingFailure:
            'Wyst\u0105pi\u0142 b\u0142\u0105d podczas \u0142adowania szczeg\u00F3\u0142\u00F3w karty. Sprawd\u017A swoje po\u0142\u0105czenie internetowe i spr\u00F3buj ponownie.',
        validateCardTitle: 'Upewnijmy si\u0119, \u017Ce to Ty',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ${contactMethod}, aby zobaczy\u0107 szczeg\u00F3\u0142y swojej karty. Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.`,
    },
    workflowsPage: {
        workflowTitle: 'Wydatki',
        workflowDescription: 'Skonfiguruj przep\u0142yw pracy od momentu wyst\u0105pienia wydatku, w tym zatwierdzenie i p\u0142atno\u015B\u0107.',
        delaySubmissionTitle: 'Op\u00F3\u017Anij zg\u0142oszenia',
        delaySubmissionDescription:
            'Wybierz niestandardowy harmonogram przesy\u0142ania wydatk\u00F3w lub pozostaw to wy\u0142\u0105czone, aby otrzymywa\u0107 aktualizacje wydatk\u00F3w w czasie rzeczywistym.',
        submissionFrequency: 'Cz\u0119stotliwo\u015B\u0107 przesy\u0142ania',
        submissionFrequencyDateOfMonth: 'Data miesi\u0105ca',
        addApprovalsTitle: 'Dodaj zatwierdzenia',
        addApprovalButton: 'Dodaj przep\u0142yw pracy zatwierdzania',
        addApprovalTip: 'Ten domy\u015Blny przep\u0142yw pracy dotyczy wszystkich cz\u0142onk\u00F3w, chyba \u017Ce istnieje bardziej szczeg\u00F3\u0142owy przep\u0142yw pracy.',
        approver: 'Osoba zatwierdzaj\u0105ca',
        connectBankAccount: 'Po\u0142\u0105cz konto bankowe',
        addApprovalsDescription: 'Wymagaj dodatkowej akceptacji przed autoryzacj\u0105 p\u0142atno\u015Bci.',
        makeOrTrackPaymentsTitle: 'Dokonuj lub \u015Bled\u017A p\u0142atno\u015Bci',
        makeOrTrackPaymentsDescription:
            'Dodaj autoryzowanego p\u0142atnika do p\u0142atno\u015Bci dokonywanych w Expensify lub \u015Bled\u017A p\u0142atno\u015Bci dokonane w innym miejscu.',
        editor: {
            submissionFrequency: 'Wybierz, jak d\u0142ugo Expensify powinno czeka\u0107 przed udost\u0119pnieniem bezb\u0142\u0119dnych wydatk\u00F3w.',
        },
        frequencyDescription: 'Wybierz, jak cz\u0119sto chcesz, aby wydatki by\u0142y przesy\u0142ane automatycznie, lub ustaw r\u0119czne przesy\u0142anie.',
        frequencies: {
            instant: 'Natychmiastowy',
            weekly: 'Tygodniowo',
            monthly: 'Miesi\u0119czny',
            twiceAMonth: 'Dwa razy w miesi\u0105cu',
            byTrip: 'Wed\u0142ug podr\u00F3\u017Cy',
            manually: 'R\u0119cznie',
            daily: 'Codziennie',
            lastDayOfMonth: 'Ostatni dzie\u0144 miesi\u0105ca',
            lastBusinessDayOfMonth: 'Ostatni dzie\u0144 roboczy miesi\u0105ca',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Pierwszy',
                '2': 'Drugi',
                '3': 'Trzeci',
                '4': 'Czwarty',
                '5': 'Pi\u0105ty',
                '6': 'Sz\u00F3sty',
                '7': 'Si\u00F3dmy',
                '8': '\u00D3smy',
                '9': 'Dziewi\u0105ty',
                '10': 'Dziesi\u0105ty',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Ten cz\u0142onek ju\u017C nale\u017Cy do innego procesu zatwierdzania. Wszelkie aktualizacje tutaj b\u0119d\u0105 widoczne r\u00F3wnie\u017C tam.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> ju\u017C zatwierdza raporty do <strong>${name2}</strong>. Prosz\u0119 wybra\u0107 innego zatwierdzaj\u0105cego, aby unikn\u0105\u0107 cyklicznego przep\u0142ywu pracy.`,
        emptyContent: {
            title: 'Brak cz\u0142onk\u00F3w do wy\u015Bwietlenia',
            expensesFromSubtitle: 'Wszyscy cz\u0142onkowie przestrzeni roboczej ju\u017C nale\u017C\u0105 do istniej\u0105cego procesu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzaj\u0105cy nale\u017C\u0105 do istniej\u0105cego przep\u0142ywu pracy.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'Op\u00F3\u017Anione zg\u0142oszenie nie mog\u0142o zosta\u0107 zmienione. Spr\u00F3buj ponownie lub skontaktuj si\u0119 z pomoc\u0105 techniczn\u0105.',
        autoReportingFrequencyErrorMessage:
            'Nie mo\u017Cna by\u0142o zmieni\u0107 cz\u0119stotliwo\u015Bci przesy\u0142ania. Spr\u00F3buj ponownie lub skontaktuj si\u0119 z pomoc\u0105 techniczn\u0105.',
        monthlyOffsetErrorMessage:
            'Nie mo\u017Cna zmieni\u0107 miesi\u0119cznej cz\u0119stotliwo\u015Bci. Prosz\u0119 spr\u00F3bowa\u0107 ponownie lub skontaktowa\u0107 si\u0119 z pomoc\u0105 techniczn\u0105.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Potwierd\u017A',
        header: 'Dodaj wi\u0119cej zatwierdzaj\u0105cych i potwierd\u017A.',
        additionalApprover: 'Dodatkowy zatwierdzaj\u0105cy',
        submitButton: 'Dodaj przep\u0142yw pracy',
    },
    workflowsEditApprovalsPage: {
        title: 'Edytuj przep\u0142yw pracy zatwierdzania',
        deleteTitle: 'Usu\u0144 przep\u0142yw pracy zatwierdzenia',
        deletePrompt:
            'Czy na pewno chcesz usun\u0105\u0107 ten proces zatwierdzania? Wszyscy cz\u0142onkowie b\u0119d\u0105 nast\u0119pnie post\u0119powa\u0107 zgodnie z domy\u015Blnym procesem.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki z',
        header: 'Gdy nast\u0119puj\u0105cy cz\u0142onkowie z\u0142o\u017C\u0105 wydatki:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Nie mo\u017Cna by\u0142o zmieni\u0107 zatwierdzaj\u0105cego. Spr\u00F3buj ponownie lub skontaktuj si\u0119 z pomoc\u0105 techniczn\u0105.',
        header: 'Wy\u015Blij do tego cz\u0142onka do zatwierdzenia:',
    },
    workflowsPayerPage: {
        title: 'Autoryzowany p\u0142atnik',
        genericErrorMessage: 'Nie mo\u017Cna by\u0142o zmieni\u0107 upowa\u017Cnionego p\u0142atnika. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        admins: 'Administratorzy',
        payer: 'P\u0142atnik',
        paymentAccount: 'Konto p\u0142atnicze',
    },
    reportFraudPage: {
        title: 'Zg\u0142o\u015B oszustwo zwi\u0105zane z kart\u0105 wirtualn\u0105',
        description:
            'Je\u015Bli dane Twojej wirtualnej karty zosta\u0142y skradzione lub naruszone, trwale dezaktywujemy Twoj\u0105 obecn\u0105 kart\u0119 i dostarczymy Ci now\u0105 wirtualn\u0105 kart\u0119 oraz numer.',
        deactivateCard: 'Dezaktywuj kart\u0119',
        reportVirtualCardFraud: 'Zg\u0142o\u015B oszustwo zwi\u0105zane z kart\u0105 wirtualn\u0105',
    },
    reportFraudConfirmationPage: {
        title: 'Zg\u0142oszono oszustwo zwi\u0105zane z kart\u0105',
        description:
            'Trwale dezaktywowali\u015Bmy Twoj\u0105 dotychczasow\u0105 kart\u0119. Gdy wr\u00F3cisz, aby zobaczy\u0107 szczeg\u00F3\u0142y karty, b\u0119dziesz mie\u0107 dost\u0119pn\u0105 now\u0105 wirtualn\u0105 kart\u0119.',
        buttonText: 'Zrozumia\u0142em, dzi\u0119ki!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kart\u0119',
        pleaseEnterLastFour: 'Prosz\u0119 wprowadzi\u0107 ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj fizyczn\u0105 kart\u0119',
        error: {
            thatDidNotMatch: 'To nie pasuje do ostatnich 4 cyfr na twojej karcie. Spr\u00F3buj ponownie.',
            throttled:
                'Wprowadzi\u0142e\u015B niepoprawnie ostatnie 4 cyfry swojej karty Expensify zbyt wiele razy. Je\u015Bli jeste\u015B pewien, \u017Ce numery s\u0105 poprawne, skontaktuj si\u0119 z Concierge, aby rozwi\u0105za\u0107 problem. W przeciwnym razie spr\u00F3buj ponownie p\u00F3\u017Aniej.',
        },
    },
    getPhysicalCard: {
        header: 'Zdob\u0105d\u017A fizyczn\u0105 kart\u0119',
        nameMessage: 'Wpisz swoje imi\u0119 i nazwisko, poniewa\u017C b\u0119dzie ono widoczne na Twojej karcie.',
        legalName: 'Nazwa prawna',
        legalFirstName: 'Imi\u0119 zgodne z dokumentami',
        legalLastName: 'Nazwisko prawne',
        phoneMessage: 'Wprowad\u017A sw\u00F3j numer telefonu.',
        phoneNumber: 'Numer telefonu',
        address: 'Adres',
        addressMessage: 'Wprowad\u017A sw\u00F3j adres wysy\u0142ki.',
        streetAddress: 'Adres ulicy',
        city: 'Miasto',
        state: 'Stan',
        zipPostcode: 'Kod pocztowy',
        country: 'Kraj',
        confirmMessage: 'Prosz\u0119 potwierdzi\u0107 swoje dane poni\u017Cej.',
        estimatedDeliveryMessage: 'Twoja fizyczna karta dotrze w ci\u0105gu 2-3 dni roboczych.',
        next: 'Nast\u0119pny',
        getPhysicalCard: 'Zdob\u0105d\u017A fizyczn\u0105 kart\u0119',
        shipCard: 'Karta wysy\u0142ki',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Instant (karta debetowa)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% op\u0142ata (${minAmount} minimum)`,
        ach: '1-3 dni robocze (Konto bankowe)',
        achSummary: 'Bez op\u0142aty',
        whichAccount: 'Kt\u00F3re konto?',
        fee: 'Op\u0142ata',
        transferSuccess: 'Transfer zako\u0144czony pomy\u015Blnie!',
        transferDetailBankAccount: 'Twoje pieni\u0105dze powinny dotrze\u0107 w ci\u0105gu 1-3 dni roboczych.',
        transferDetailDebitCard: 'Twoje pieni\u0105dze powinny dotrze\u0107 natychmiast.',
        failedTransfer: 'Twoje saldo nie jest w pe\u0142ni rozliczone. Prosz\u0119 przela\u0107 na konto bankowe.',
        notHereSubTitle: 'Prosz\u0119 przela\u0107 saldo ze strony portfela',
        goToWallet: 'Przejd\u017A do Portfela',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Wybierz konto',
    },
    paymentMethodList: {
        addPaymentMethod: 'Dodaj metod\u0119 p\u0142atno\u015Bci',
        addNewDebitCard: 'Dodaj now\u0105 kart\u0119 debetow\u0105',
        addNewBankAccount: 'Dodaj nowe konto bankowe',
        accountLastFour: 'Ko\u0144cz\u0105cy si\u0119 na',
        cardLastFour: 'Karta ko\u0144cz\u0105ca si\u0119 na',
        addFirstPaymentMethod: 'Dodaj metod\u0119 p\u0142atno\u015Bci, aby wysy\u0142a\u0107 i odbiera\u0107 p\u0142atno\u015Bci bezpo\u015Brednio w aplikacji.',
        defaultPaymentMethod: 'Domy\u015Blny',
    },
    preferencesPage: {
        appSection: {
            title: 'Preferencje aplikacji',
        },
        testSection: {
            title: 'Testuj preferencje',
            subtitle: 'Ustawienia pomagaj\u0105ce w debugowaniu i testowaniu aplikacji na etapie przygotowawczym.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Otrzymuj aktualizacje funkcji i wiadomo\u015Bci od Expensify',
        muteAllSounds: 'Wycisz wszystkie d\u017Awi\u0119ki z Expensify',
    },
    priorityModePage: {
        priorityMode: 'Tryb priorytetowy',
        explainerText:
            'Wybierz, czy chcesz #skupi\u0107 si\u0119 tylko na nieprzeczytanych i przypi\u0119tych czatach, czy pokaza\u0107 wszystko z najnowszymi i przypi\u0119tymi czatami na g\u00F3rze.',
        priorityModes: {
            default: {
                label: 'Najnowsze',
                description: 'Poka\u017C wszystkie czaty posortowane od najnowszych',
            },
            gsd: {
                label: '#focus',
                description: 'Poka\u017C tylko nieprzeczytane, posortowane alfabetycznie',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `w ${policyName}`,
        generatingPDF: 'Generowanie PDF',
        waitForPDF: 'Prosz\u0119 czeka\u0107, generujemy PDF.',
        errorPDF: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas pr\u00F3by wygenerowania Twojego PDF-a',
        generatedPDF: 'Tw\u00F3j raport PDF zosta\u0142 wygenerowany!',
    },
    reportDescriptionPage: {
        roomDescription: 'Opis pokoju',
        roomDescriptionOptional: 'Opis pokoju (opcjonalnie)',
        explainerText: 'Ustaw niestandardowy opis dla pokoju.',
    },
    groupChat: {
        lastMemberTitle: 'Uwaga!',
        lastMemberWarning:
            'Poniewa\u017C jeste\u015B ostatni\u0105 osob\u0105 tutaj, opuszczenie spowoduje, \u017Ce ten czat stanie si\u0119 niedost\u0119pny dla wszystkich cz\u0142onk\u00F3w. Czy na pewno chcesz opu\u015Bci\u0107?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Czat grupowy ${displayName}`,
    },
    languagePage: {
        language: 'J\u0119zyk',
        languages: {
            en: {
                label: 'Angielski',
            },
            es: {
                label: 'Spanish',
            },
        },
    },
    themePage: {
        theme: 'Motyw',
        themes: {
            dark: {
                label: 'Ciemny',
            },
            light: {
                label: '\u015Awiat\u0142o',
            },
            system: {
                label: 'U\u017Cyj ustawie\u0144 urz\u0105dzenia',
            },
        },
        chooseThemeBelowOrSync: 'Wybierz motyw poni\u017Cej lub zsynchronizuj z ustawieniami urz\u0105dzenia.',
    },
    termsOfUse: {
        phrase1: 'Loguj\u0105c si\u0119, zgadzasz si\u0119 na',
        phrase2: 'Warunki korzystania z us\u0142ugi',
        phrase3: 'i',
        phrase4: 'Prywatno\u015B\u0107',
        phrase5: `Przesy\u0142anie pieni\u0119dzy jest zapewniane przez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) zgodnie z jego`,
        phrase6: 'licencje',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzyma\u0142e\u015B magicznego kodu?',
        enterAuthenticatorCode: 'Prosz\u0119 wprowadzi\u0107 sw\u00F3j kod uwierzytelniaj\u0105cy',
        enterRecoveryCode: 'Prosz\u0119 wprowadzi\u0107 sw\u00F3j kod odzyskiwania',
        requiredWhen2FAEnabled: 'Wymagane, gdy 2FA jest w\u0142\u0105czone',
        requestNewCode: 'Popro\u015B o nowy kod w',
        requestNewCodeAfterErrorOccurred: 'Popro\u015B o nowy kod',
        error: {
            pleaseFillMagicCode: 'Prosz\u0119 wprowadzi\u0107 sw\u00F3j magiczny kod',
            incorrectMagicCode: 'Niepoprawny lub niewa\u017Cny kod magiczny. Spr\u00F3buj ponownie lub popro\u015B o nowy kod.',
            pleaseFillTwoFactorAuth: 'Prosz\u0119 wprowadzi\u0107 sw\u00F3j kod uwierzytelniania dwusk\u0142adnikowego',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Prosz\u0119 wype\u0142ni\u0107 wszystkie pola',
        pleaseFillPassword: 'Prosz\u0119 wprowadzi\u0107 swoje has\u0142o',
        pleaseFillTwoFactorAuth: 'Prosz\u0119 wprowadzi\u0107 sw\u00F3j kod dwusk\u0142adnikowy',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Wprowad\u017A sw\u00F3j kod uwierzytelniania dwusk\u0142adnikowego, aby kontynuowa\u0107',
        forgot: 'Zapomnia\u0142e\u015B?',
        requiredWhen2FAEnabled: 'Wymagane, gdy 2FA jest w\u0142\u0105czone',
        error: {
            incorrectPassword: 'Nieprawid\u0142owe has\u0142o. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            incorrectLoginOrPassword: 'Nieprawid\u0142owy login lub has\u0142o. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            incorrect2fa: 'Nieprawid\u0142owy kod uwierzytelniania dwusk\u0142adnikowego. Prosz\u0119 spr\u00F3buj ponownie.',
            twoFactorAuthenticationEnabled:
                'Masz w\u0142\u0105czone uwierzytelnianie dwusk\u0142adnikowe (2FA) na tym koncie. Zaloguj si\u0119, u\u017Cywaj\u0105c swojego adresu e-mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawid\u0142owy login lub has\u0142o. Spr\u00F3buj ponownie lub zresetuj swoje has\u0142o.',
            unableToResetPassword:
                'Nie uda\u0142o nam si\u0119 zmieni\u0107 Twojego has\u0142a. Prawdopodobnie jest to spowodowane wygas\u0142ym linkiem do resetowania has\u0142a w starym e-mailu do resetowania has\u0142a. Wys\u0142ali\u015Bmy Ci nowy link, aby\u015B m\u00F3g\u0142 spr\u00F3bowa\u0107 ponownie. Sprawd\u017A swoj\u0105 skrzynk\u0119 odbiorcz\u0105 i folder ze spamem; powinien dotrze\u0107 w ci\u0105gu kilku minut.',
            noAccess: 'Nie masz dost\u0119pu do tej aplikacji. Prosz\u0119 doda\u0107 swoj\u0105 nazw\u0119 u\u017Cytkownika GitHub, aby uzyska\u0107 dost\u0119p.',
            accountLocked: 'Twoje konto zosta\u0142o zablokowane po zbyt wielu nieudanych pr\u00F3bach. Spr\u00F3buj ponownie za 1 godzin\u0119.',
            fallback: 'Co\u015B posz\u0142o nie tak. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon lub e-mail',
        error: {
            invalidFormatEmailLogin: 'Wprowadzony adres e-mail jest nieprawid\u0142owy. Prosz\u0119 poprawi\u0107 format i spr\u00F3bowa\u0107 ponownie.',
        },
        cannotGetAccountDetails: 'Nie mo\u017Cna pobra\u0107 szczeg\u00F3\u0142\u00F3w konta. Spr\u00F3buj zalogowa\u0107 si\u0119 ponownie.',
        loginForm: 'Formularz logowania',
        notYou: ({user}: NotYouParams) => `Nie ${user}?`,
    },
    onboarding: {
        welcome: 'Witamy!',
        welcomeSignOffTitleManageTeam:
            'Gdy uko\u0144czysz powy\u017Csze zadania, mo\u017Cemy odkrywa\u0107 wi\u0119cej funkcji, takich jak przep\u0142ywy pracy zatwierdzania i regu\u0142y!',
        welcomeSignOffTitle: 'Mi\u0142o ci\u0119 pozna\u0107!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description:
                'Jedna aplikacja do zarz\u0105dzania wydatkami firmowymi i osobistymi z pr\u0119dko\u015Bci\u0105 czatu. Wypr\u00F3buj j\u0105 i daj nam zna\u0107, co o tym my\u015Blisz. Wkr\u00F3tce jeszcze wi\u0119cej!',
            secondaryDescription:
                'Aby prze\u0142\u0105czy\u0107 si\u0119 z powrotem na Expensify Classic, wystarczy stukn\u0105\u0107 zdj\u0119cie profilowe > Przejd\u017A do Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Witamy w Expensify',
            description:
                'Jedna aplikacja do zarz\u0105dzania wszystkimi wydatkami biznesowymi i osobistymi w czacie. Stworzona dla Twojego biznesu, Twojego zespo\u0142u i Twoich przyjaci\u00F3\u0142.',
        },
        getStarted: 'Zacznij teraz',
        whatsYourName: 'Jak masz na imi\u0119?',
        peopleYouMayKnow: 'Osoby, kt\u00F3re mo\u017Cesz zna\u0107, s\u0105 ju\u017C tutaj! Zweryfikuj sw\u00F3j e-mail, aby do nich do\u0142\u0105czy\u0107.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Kto\u015B z ${domain} ju\u017C utworzy\u0142 przestrze\u0144 robocz\u0105. Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ${email}.`,
        joinAWorkspace: 'Do\u0142\u0105cz do przestrzeni roboczej',
        listOfWorkspaces:
            'Oto lista przestrzeni roboczych, do kt\u00F3rych mo\u017Cesz do\u0142\u0105czy\u0107. Nie martw si\u0119, zawsze mo\u017Cesz do\u0142\u0105czy\u0107 do nich p\u00F3\u017Aniej, je\u015Bli wolisz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} cz\u0142onek${employeeCount > 1 ? 's' : ''} \u2022 ${policyOwner}`,
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcj\u0119, aby kontynuowa\u0107',
        purpose: {
            title: 'Co chcesz dzisiaj zrobi\u0107?',
            errorContinue: 'Prosz\u0119 nacisn\u0105\u0107 kontynuuj, aby rozpocz\u0105\u0107 konfiguracj\u0119',
            errorBackButton: 'Prosz\u0119 zako\u0144czy\u0107 pytania konfiguracyjne, aby rozpocz\u0105\u0107 korzystanie z aplikacji.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Otrzymaj zwrot od mojego pracodawcy',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Zarz\u0105dzaj wydatkami mojego zespo\u0142u',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '\u015Aled\u017A i bud\u017Cetuj wydatki',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Czat i dziel wydatki z przyjaci\u00F3\u0142mi',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Co\u015B innego',
        },
        employees: {
            title: 'Ilu masz pracownik\u00F3w?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 pracownik\u00F3w',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 pracownik\u00F3w',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 pracownik\u00F3w',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1 000 pracownik\u00F3w',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Ponad 1 000 pracownik\u00F3w',
        },
        accounting: {
            title: 'Czy u\u017Cywasz jakiego\u015B oprogramowania ksi\u0119gowego?',
            none: 'None',
        },
        error: {
            requiredFirstName: 'Prosz\u0119 wprowadzi\u0107 swoje imi\u0119, aby kontynuowa\u0107',
        },
        workEmail: {
            title: 'Jaki jest Tw\u00F3j s\u0142u\u017Cbowy adres e-mail?',
            subtitle: 'Expensify dzia\u0142a najlepiej, gdy po\u0142\u0105czysz sw\u00F3j s\u0142u\u017Cbowy e-mail.',
            explanationModal: {
                descriptionOne: 'Prze\u015Blij dalej na receipts@expensify.com do skanowania',
                descriptionTwo: 'Do\u0142\u0105cz do swoich koleg\u00F3w, kt\u00F3rzy ju\u017C korzystaj\u0105 z Expensify',
                descriptionThree: 'Ciesz si\u0119 bardziej spersonalizowanym do\u015Bwiadczeniem',
            },
            addWorkEmail: 'Dodaj s\u0142u\u017Cbowy e-mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj sw\u00F3j s\u0142u\u017Cbowy e-mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) =>
                `Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ${workEmail}. Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.`,
        },
        workEmailValidationError: {
            publicEmail: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy adres e-mail z prywatnej domeny, np. mitch@company.com',
            offline: 'Nie mogli\u015Bmy doda\u0107 Twojego s\u0142u\u017Cbowego e-maila, poniewa\u017C wydajesz si\u0119 by\u0107 offline.',
        },
        mergeBlockScreen: {
            title: 'Nie mo\u017Cna doda\u0107 s\u0142u\u017Cbowego adresu e-mail',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nie mogli\u015Bmy doda\u0107 ${workEmail}. Spr\u00F3buj ponownie p\u00F3\u017Aniej w Ustawieniach lub porozmawiaj z Concierge, aby uzyska\u0107 pomoc.`,
        },
        workspace: {
            title: 'Pozosta\u0144 zorganizowany dzi\u0119ki przestrzeni roboczej',
            subtitle:
                'Odblokuj pot\u0119\u017Cne narz\u0119dzia, aby upro\u015Bci\u0107 zarz\u0105dzanie wydatkami, wszystko w jednym miejscu. Dzi\u0119ki przestrzeni roboczej mo\u017Cesz:',
            explanationModal: {
                descriptionOne: '\u015Aled\u017A i organizuj paragony',
                descriptionTwo: 'Kategoryzuj i taguj wydatki',
                descriptionThree: 'Tw\u00F3rz i udost\u0119pniaj raporty',
            },
            price: 'Wypr\u00F3buj za darmo przez 30 dni, a nast\u0119pnie przejd\u017A na wersj\u0119 p\u0142atn\u0105 za jedyne <strong>5 USD/miesi\u0105c</strong>.',
            createWorkspace: 'Utw\u00F3rz przestrze\u0144 robocz\u0105',
        },
        confirmWorkspace: {
            title: 'Potwierd\u017A przestrze\u0144 robocz\u0105',
            subtitle:
                'Utw\u00F3rz przestrze\u0144 robocz\u0105 do \u015Bledzenia paragon\u00F3w, zwracania wydatk\u00F3w, zarz\u0105dzania podr\u00F3\u017Cami, tworzenia raport\u00F3w i nie tylko \u2014 wszystko z pr\u0119dko\u015Bci\u0105 czatu.',
        },
        inviteMembers: {
            title: 'Zapro\u015B cz\u0142onk\u00F3w',
            subtitle: 'Zarz\u0105dzaj i udost\u0119pniaj swoje wydatki ksi\u0119gowemu lub rozpocznij grup\u0119 podr\u00F3\u017Cnicz\u0105 z przyjaci\u00F3\u0142mi.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nie pokazuj mi tego ponownie',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Nazwa nie mo\u017Ce zawiera\u0107 s\u0142\u00F3w Expensify lub Concierge',
            hasInvalidCharacter: 'Nazwa nie mo\u017Ce zawiera\u0107 przecinka ani \u015Brednika',
            requiredFirstName: 'Imi\u0119 nie mo\u017Ce by\u0107 puste',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Jakie jest Twoje imi\u0119 i nazwisko?',
        enterDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterAddress: 'Jaki jest Tw\u00F3j adres?',
        enterPhoneNumber: 'Jaki jest Tw\u00F3j numer telefonu?',
        personalDetails: 'Dane osobowe',
        privateDataMessage: 'Te dane s\u0105 u\u017Cywane do podr\u00F3\u017Cy i p\u0142atno\u015Bci. Nigdy nie s\u0105 pokazywane na Twoim publicznym profilu.',
        legalName: 'Nazwa prawna',
        legalFirstName: 'Imi\u0119 zgodne z dokumentami',
        legalLastName: 'Nazwisko prawne',
        address: 'Adres',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Data powinna by\u0107 przed ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Data powinna by\u0107 po ${dateString}`,
            hasInvalidCharacter: 'Nazwa mo\u017Ce zawiera\u0107 tylko znaki \u0142aci\u0144skie',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Nieprawid\u0142owy format kodu pocztowego${zipFormat ? `Dopuszczalny format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Prosz\u0119 upewni\u0107 si\u0119, \u017Ce numer telefonu jest prawid\u0142owy (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link zosta\u0142 ponownie wys\u0142any',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Wys\u0142a\u0142em magiczny link do logowania na ${login}. Prosz\u0119 sprawd\u017A sw\u00F3j ${loginType}, aby si\u0119 zalogowa\u0107.`,
        resendLink: 'Wy\u015Blij ponownie link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Aby zweryfikowa\u0107 ${secondaryLogin}, prosz\u0119 ponownie wys\u0142a\u0107 magiczny kod z Ustawie\u0144 Konta ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Je\u015Bli nie masz ju\u017C dost\u0119pu do ${primaryLogin}, prosz\u0119 od\u0142\u0105czy\u0107 swoje konta.`,
        unlink: 'Od\u0142\u0105cz',
        linkSent: 'Link wys\u0142any!',
        successfullyUnlinkedLogin: 'Pomy\u015Blnie od\u0142\u0105czono drugie logowanie!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nasz dostawca poczty e-mail tymczasowo zawiesi\u0142 wysy\u0142anie wiadomo\u015Bci e-mail do ${login} z powodu problem\u00F3w z dostarczeniem. Aby odblokowa\u0107 sw\u00F3j login, wykonaj nast\u0119puj\u0105ce kroki:`,
        confirmThat: ({login}: ConfirmThatParams) => `Potwierd\u017A, \u017Ce ${login} jest poprawnie napisany i jest prawdziwym, dostarczalnym adresem e-mail.`,
        emailAliases:
            'Alias e-mail, takie jak "expenses@domain.com", musz\u0105 mie\u0107 dost\u0119p do swojej w\u0142asnej skrzynki odbiorczej, aby mog\u0142y by\u0107 prawid\u0142owym loginem do Expensify.',
        ensureYourEmailClient: 'Upewnij si\u0119, \u017Ce Tw\u00F3j klient poczty e-mail pozwala na wiadomo\u015Bci z expensify.com.',
        youCanFindDirections: 'Mo\u017Cesz znale\u017A\u0107 instrukcje, jak wykona\u0107 ten krok',
        helpConfigure: 'ale mo\u017Cesz potrzebowa\u0107 pomocy dzia\u0142u IT w skonfigurowaniu ustawie\u0144 poczty e-mail.',
        onceTheAbove: 'Po zako\u0144czeniu powy\u017Cszych krok\u00F3w, prosz\u0119 skontaktowa\u0107 si\u0119 z',
        toUnblock: 'aby odblokowa\u0107 swoje logowanie.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nie uda\u0142o nam si\u0119 dostarczy\u0107 wiadomo\u015Bci SMS do ${login}, wi\u0119c tymczasowo je zawiesili\u015Bmy. Spr\u00F3buj zweryfikowa\u0107 sw\u00F3j numer:`,
        validationSuccess: 'Tw\u00F3j numer zosta\u0142 zweryfikowany! Kliknij poni\u017Cej, aby wys\u0142a\u0107 nowy magiczny kod logowania.',
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
                return 'Prosz\u0119 chwil\u0119 poczeka\u0107 przed ponown\u0105 pr\u00F3b\u0105.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'dzie\u0144' : 'dni'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'godzina' : 'godziny'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minuta' : 'minuty'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Prosz\u0119 czeka\u0107! Musisz poczeka\u0107 ${timeText}, zanim spr\u00F3bujesz ponownie zweryfikowa\u0107 sw\u00F3j numer.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Do\u0142\u0105cz',
    },
    detailsPage: {
        localTime: 'Czas lokalny',
    },
    newChatPage: {
        startGroup: 'Rozpocznij grup\u0119',
        addToGroup: 'Dodaj do grupy',
    },
    yearPickerPage: {
        year: 'Rok',
        selectYear: 'Prosz\u0119 wybra\u0107 rok',
    },
    focusModeUpdateModal: {
        title: 'Witamy w trybie #focus!',
        prompt: 'B\u0105d\u017A na bie\u017C\u0105co, widz\u0105c tylko nieprzeczytane czaty lub czaty, kt\u00F3re wymagaj\u0105 Twojej uwagi. Nie martw si\u0119, mo\u017Cesz to zmieni\u0107 w dowolnym momencie w',
        settings: 'ustawienia',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Czat, kt\u00F3rego szukasz, nie zosta\u0142 znaleziony.',
        getMeOutOfHere: 'Zabierz mnie st\u0105d',
        iouReportNotFound: 'Szczeg\u00F3\u0142y p\u0142atno\u015Bci, kt\u00F3rych szukasz, nie mog\u0105 zosta\u0107 znalezione.',
        notHere: 'Hmm... to nie tutaj',
        pageNotFound: 'Ups, ta strona nie mo\u017Ce zosta\u0107 znaleziona',
        noAccess: 'Ten czat lub wydatek m\u00F3g\u0142 zosta\u0107 usuni\u0119ty lub nie masz do niego dost\u0119pu.\n\nW razie pyta\u0144 skontaktuj si\u0119 z concierge@expensify.com',
        goBackHome: 'Wr\u00F3\u0107 do strony g\u0142\u00F3wnej',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Co\u015B posz\u0142o nie tak`,
        subtitle: 'Nie mo\u017Cna by\u0142o zrealizowa\u0107 Twojego \u017C\u0105dania. Spr\u00F3buj ponownie p\u00F3\u017Aniej.',
    },
    setPasswordPage: {
        enterPassword: 'Wprowad\u017A has\u0142o',
        setPassword: 'Ustaw has\u0142o',
        newPasswordPrompt: 'Twoje has\u0142o musi zawiera\u0107 co najmniej 8 znak\u00F3w, 1 wielk\u0105 liter\u0119, 1 ma\u0142\u0105 liter\u0119 i 1 cyfr\u0119.',
        passwordFormTitle: 'Witamy z powrotem w New Expensify! Prosz\u0119 ustawi\u0107 swoje has\u0142o.',
        passwordNotSet: 'Nie uda\u0142o nam si\u0119 ustawi\u0107 nowego has\u0142a. Wys\u0142ali\u015Bmy Ci nowy link do ustawienia has\u0142a, aby spr\u00F3bowa\u0107 ponownie.',
        setPasswordLinkInvalid: 'Ten link do ustawienia has\u0142a jest nieprawid\u0142owy lub wygas\u0142. Nowy czeka na Ciebie w skrzynce odbiorczej!',
        validateAccount: 'Zweryfikuj konto',
    },
    statusPage: {
        status: 'Status',
        statusExplanation:
            'Dodaj emoji, aby da\u0107 swoim kolegom i przyjacio\u0142om \u0142atwy spos\u00F3b na zrozumienie, co si\u0119 dzieje. Mo\u017Cesz opcjonalnie doda\u0107 r\u00F3wnie\u017C wiadomo\u015B\u0107!',
        today: 'Dzisiaj',
        clearStatus: 'Wyczy\u015B\u0107 status',
        save: 'Zapisz',
        message: 'Wiadomo\u015B\u0107',
        timePeriods: {
            never: 'Nigdy',
            thirtyMinutes: '30 minut',
            oneHour: '1 godzina',
            afterToday: 'Dzisiaj',
            afterWeek: 'Tydzie\u0144',
            custom: 'Custom',
        },
        untilTomorrow: 'Do jutra',
        untilTime: ({time}: UntilTimeParams) => `Do ${time}`,
        date: 'Data',
        time: 'Czas',
        clearAfter: 'Wyczy\u015B\u0107 po',
        whenClearStatus: 'Kiedy powinni\u015Bmy wyczy\u015Bci\u0107 Tw\u00F3j status?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Krok ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Informacje bankowe',
        confirmBankInfo: 'Potwierd\u017A informacje o banku',
        manuallyAdd: 'R\u0119cznie dodaj swoje konto bankowe',
        letsDoubleCheck: 'Sprawd\u017Amy, czy wszystko wygl\u0105da dobrze.',
        accountEnding: 'Konto ko\u0144cz\u0105ce si\u0119 na',
        thisBankAccount: 'To konto bankowe b\u0119dzie u\u017Cywane do p\u0142atno\u015Bci biznesowych w Twoim obszarze roboczym.',
        accountNumber: 'Numer konta',
        routingNumber: 'Numer rozliczeniowy',
        chooseAnAccountBelow: 'Wybierz konto poni\u017Cej',
        addBankAccount: 'Dodaj konto bankowe',
        chooseAnAccount: 'Wybierz konto',
        connectOnlineWithPlaid: 'Zaloguj si\u0119 do swojego banku',
        connectManually: 'Po\u0142\u0105cz r\u0119cznie',
        desktopConnection:
            'Uwaga: Aby po\u0142\u0105czy\u0107 si\u0119 z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby uko\u0144czy\u0107 ten proces w przegl\u0105darce.',
        yourDataIsSecure: 'Twoje dane s\u0105 bezpieczne',
        toGetStarted:
            'Dodaj konto bankowe, aby zwraca\u0107 koszty, wydawa\u0107 karty Expensify, pobiera\u0107 p\u0142atno\u015Bci za faktury i op\u0142aca\u0107 rachunki w jednym miejscu.',
        plaidBodyCopy: 'Daj swoim pracownikom \u0142atwiejszy spos\u00F3b na p\u0142acenie - i otrzymywanie zwrot\u00F3w - za wydatki firmowe.',
        checkHelpLine: 'Tw\u00F3j numer rozliczeniowy i numer konta mo\u017Cna znale\u017A\u0107 na czeku dla tego konta.',
        hasPhoneLoginError: {
            phrase1: 'Aby po\u0142\u0105czy\u0107 konto bankowe, prosz\u0119',
            link: 'dodaj e-mail jako swoje g\u0142\u00F3wne logowanie',
            phrase2: 'i spr\u00F3buj ponownie. Mo\u017Cesz doda\u0107 sw\u00F3j numer telefonu jako dodatkowe logowanie.',
        },
        hasBeenThrottledError: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas dodawania Twojego konta bankowego. Prosz\u0119 poczeka\u0107 kilka minut i spr\u00F3bowa\u0107 ponownie.',
        hasCurrencyError: {
            phrase1: 'Ups! Wygl\u0105da na to, \u017Ce waluta Twojego miejsca pracy jest ustawiona na inn\u0105 ni\u017C USD. Aby kontynuowa\u0107, przejd\u017A do',
            link: 'ustawienia Twojego miejsca pracy',
            phrase2: 'ustawi\u0107 na USD i spr\u00F3bowa\u0107 ponownie.',
        },
        error: {
            youNeedToSelectAnOption: 'Prosz\u0119 wybra\u0107 opcj\u0119, aby kontynuowa\u0107',
            noBankAccountAvailable: 'Przepraszamy, brak dost\u0119pnego konta bankowego',
            noBankAccountSelected: 'Prosz\u0119 wybra\u0107 konto',
            taxID: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer identyfikacji podatkowej',
            website: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142ow\u0105 stron\u0119 internetow\u0105',
            zipCode: `Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod pocztowy w formacie: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer telefonu',
            email: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy adres e-mail',
            companyName: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142ow\u0105 nazw\u0119 firmy',
            addressCity: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owe miasto',
            addressStreet: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy adres ulicy',
            addressState: 'Prosz\u0119 wybra\u0107 prawid\u0142owy stan',
            incorporationDateFuture: 'Data za\u0142o\u017Cenia nie mo\u017Ce by\u0107 w przysz\u0142o\u015Bci',
            incorporationState: 'Prosz\u0119 wybra\u0107 prawid\u0142owy stan',
            industryCode: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod klasyfikacji bran\u017Cy sk\u0142adaj\u0105cy si\u0119 z sze\u015Bciu cyfr',
            restrictedBusiness: 'Prosz\u0119 potwierdzi\u0107, \u017Ce firma nie znajduje si\u0119 na li\u015Bcie firm obj\u0119tych ograniczeniami.',
            routingNumber: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer rozliczeniowy',
            accountNumber: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numery tras i kont nie mog\u0105 si\u0119 zgadza\u0107',
            companyType: 'Prosz\u0119 wybra\u0107 prawid\u0142owy typ firmy',
            tooManyAttempts:
                'Z powodu du\u017Cej liczby pr\u00F3b logowania, ta opcja zosta\u0142a wy\u0142\u0105czona na 24 godziny. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej lub wprowadzi\u0107 dane r\u0119cznie.',
            address: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy adres',
            dob: 'Prosz\u0119 wybra\u0107 prawid\u0142ow\u0105 dat\u0119 urodzenia',
            age: 'Musisz mie\u0107 uko\u0144czone 18 lat',
            ssnLast4: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owe ostatnie 4 cyfry numeru SSN',
            firstName: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owe imi\u0119',
            lastName: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owe nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Prosz\u0119 doda\u0107 domy\u015Blne konto depozytowe lub kart\u0119 debetow\u0105',
            validationAmounts:
                'Kwoty weryfikacyjne, kt\u00F3re wprowadzi\u0142e\u015B, s\u0105 nieprawid\u0142owe. Prosz\u0119 ponownie sprawdzi\u0107 wyci\u0105g bankowy i spr\u00F3bowa\u0107 ponownie.',
            fullName: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owe pe\u0142ne imi\u0119 i nazwisko',
            ownershipPercentage: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142ow\u0105 warto\u015B\u0107 procentow\u0105',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Gdzie znajduje si\u0119 Twoje konto bankowe?',
        accountDetailsStepHeader: 'Jakie s\u0105 szczeg\u00F3\u0142y Twojego konta?',
        accountTypeStepHeader: 'Jakiego typu jest to konto?',
        bankInformationStepHeader: 'Jakie s\u0105 Twoje dane bankowe?',
        accountHolderInformationStepHeader: 'Jakie s\u0105 dane posiadacza konta?',
        howDoWeProtectYourData: 'Jak chronimy Twoje dane?',
        currencyHeader: 'Jaka jest waluta Twojego konta bankowego?',
        confirmationStepHeader: 'Sprawd\u017A swoje dane.',
        confirmationStepSubHeader: 'Sprawd\u017A szczeg\u00F3\u0142y poni\u017Cej i zaznacz pole z warunkami, aby potwierdzi\u0107.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Wprowad\u017A has\u0142o do Expensify',
        alreadyAdded: 'To konto zosta\u0142o ju\u017C dodane.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Dodano osobiste konto bankowe!',
        successMessage: 'Gratulacje, Twoje konto bankowe jest skonfigurowane i gotowe do otrzymywania zwrot\u00F3w.',
    },
    attachmentView: {
        unknownFilename: 'Nieznana nazwa pliku',
        passwordRequired: 'Prosz\u0119 wprowadzi\u0107 has\u0142o',
        passwordIncorrect: 'Nieprawid\u0142owe has\u0142o. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        failedToLoadPDF: 'Nie uda\u0142o si\u0119 za\u0142adowa\u0107 pliku PDF',
        pdfPasswordForm: {
            title: 'PDF chroniony has\u0142em',
            infoText: 'Ten plik PDF jest chroniony has\u0142em.',
            beforeLinkText: 'Prosz\u0119',
            linkText: 'wprowad\u017A has\u0142o',
            afterLinkText: 'aby to zobaczy\u0107.',
            formLabel: 'Wy\u015Bwietl PDF',
        },
        attachmentNotFound: 'Za\u0142\u0105cznik nie znaleziony',
    },
    messages: {
        errorMessageInvalidPhone: `Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer telefonu bez nawias\u00F3w i my\u015Blnik\u00F3w. Je\u015Bli jeste\u015B poza USA, prosz\u0119 poda\u0107 kod kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Nieprawid\u0142owy email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest ju\u017C cz\u0142onkiem ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Kontynuuj\u0105c pro\u015Bb\u0119 o aktywacj\u0119 portfela Expensify, potwierdzasz, \u017Ce przeczyta\u0142e\u015B, rozumiesz i akceptujesz',
        facialScan: 'Polityka i Zgoda na Skan Twarzy Onfido',
        tryAgain: 'Spr\u00F3buj ponownie',
        verifyIdentity: 'Zweryfikuj to\u017Csamo\u015B\u0107',
        letsVerifyIdentity: 'Zweryfikujmy Twoj\u0105 to\u017Csamo\u015B\u0107',
        butFirst: `Ale najpierw, nudne rzeczy. Zapoznaj si\u0119 z prawniczym \u017Cargonem w nast\u0119pnym kroku i kliknij \u201EAkceptuj\u201D, gdy b\u0119dziesz gotowy.`,
        genericError: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas przetwarzania tego kroku. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        cameraPermissionsNotGranted: 'W\u0142\u0105cz dost\u0119p do aparatu',
        cameraRequestMessage:
            'Potrzebujemy dost\u0119pu do Twojego aparatu, aby zako\u0144czy\u0107 weryfikacj\u0119 konta bankowego. Prosz\u0119 w\u0142\u0105czy\u0107 w Ustawieniach > New Expensify.',
        microphonePermissionsNotGranted: 'W\u0142\u0105cz dost\u0119p do mikrofonu',
        microphoneRequestMessage:
            'Potrzebujemy dost\u0119pu do Twojego mikrofonu, aby zako\u0144czy\u0107 weryfikacj\u0119 konta bankowego. Prosz\u0119 w\u0142\u0105czy\u0107 go w Ustawieniach > New Expensify.',
        originalDocumentNeeded: 'Prosz\u0119 przes\u0142a\u0107 oryginalny obraz swojego dowodu to\u017Csamo\u015Bci zamiast zrzutu ekranu lub zeskanowanego obrazu.',
        documentNeedsBetterQuality:
            'Tw\u00F3j dow\u00F3d to\u017Csamo\u015Bci wydaje si\u0119 by\u0107 uszkodzony lub brakuje mu element\u00F3w zabezpieczaj\u0105cych. Prosz\u0119 przes\u0142a\u0107 oryginalny obraz nieuszkodzonego dowodu to\u017Csamo\u015Bci, kt\u00F3ry jest w pe\u0142ni widoczny.',
        imageNeedsBetterQuality:
            'Wyst\u0105pi\u0142 problem z jako\u015Bci\u0105 obrazu Twojego dowodu to\u017Csamo\u015Bci. Prosz\u0119 przes\u0142a\u0107 nowy obraz, na kt\u00F3rym ca\u0142y dow\u00F3d to\u017Csamo\u015Bci b\u0119dzie wyra\u017Anie widoczny.',
        selfieIssue: 'Wyst\u0105pi\u0142 problem z Twoim selfie/wideo. Prosz\u0119 przes\u0142a\u0107 aktualne selfie/wideo.',
        selfieNotMatching:
            'Twoje selfie/wideo nie pasuje do Twojego dowodu to\u017Csamo\u015Bci. Prosz\u0119, prze\u015Blij nowe selfie/wideo, na kt\u00F3rym Twoja twarz jest wyra\u017Anie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wydaje si\u0119 by\u0107 zdj\u0119ciem/wideo na \u017Cywo. Prosz\u0119 przes\u0142a\u0107 selfie/wideo na \u017Cywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczeg\u00F3\u0142y',
        helpText: 'Musimy potwierdzi\u0107 nast\u0119puj\u0105ce informacje, zanim b\u0119dziesz m\u00F3g\u0142 wysy\u0142a\u0107 i odbiera\u0107 pieni\u0105dze z portfela.',
        helpTextIdologyQuestions: 'Musimy zada\u0107 Ci jeszcze kilka pyta\u0144, aby zako\u0144czy\u0107 weryfikacj\u0119 Twojej to\u017Csamo\u015Bci.',
        helpLink: 'Dowiedz si\u0119 wi\u0119cej, dlaczego tego potrzebujemy.',
        legalFirstNameLabel: 'Imi\u0119 zgodne z dokumentami',
        legalMiddleNameLabel: 'Drugie imi\u0119 prawne',
        legalLastNameLabel: 'Nazwisko prawne',
        selectAnswer: 'Prosz\u0119 wybra\u0107 odpowied\u017A, aby kontynuowa\u0107',
        ssnFull9Error: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy dziewi\u0119ciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem z weryfikacj\u0105 Twojego numeru SSN. Prosz\u0119 wprowadzi\u0107 pe\u0142ne dziewi\u0119\u0107 cyfr swojego numeru SSN.',
        weCouldNotVerify: 'Nie mogli\u015Bmy zweryfikowa\u0107',
        pleaseFixIt: 'Prosz\u0119 poprawi\u0107 te informacje przed kontynuowaniem.',
        failedKYCTextBefore: 'Nie uda\u0142o nam si\u0119 zweryfikowa\u0107 Twojej to\u017Csamo\u015Bci. Spr\u00F3buj ponownie p\u00F3\u017Aniej lub skontaktuj si\u0119 z',
        failedKYCTextAfter: 'je\u015Bli masz jakie\u015B pytania.',
    },
    termsStep: {
        headerTitle: 'Warunki i op\u0142aty',
        headerTitleRefactor: 'Op\u0142aty i warunki',
        haveReadAndAgree: 'Przeczyta\u0142em i zgadzam si\u0119 otrzymywa\u0107',
        electronicDisclosures: 'ujawnienia elektroniczne',
        agreeToThe: 'Zgadzam si\u0119 na',
        walletAgreement: 'Umowa portfela',
        enablePayments: 'W\u0142\u0105cz p\u0142atno\u015Bci',
        monthlyFee: 'Miesi\u0119czna op\u0142ata',
        inactivity: 'Brak aktywno\u015Bci',
        noOverdraftOrCredit: 'Brak funkcji debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne wycofanie \u015Brodk\u00F3w',
        standard: 'Standardowy',
        reviewTheFees: 'Sp\u00F3jrz na niekt\u00F3re op\u0142aty.',
        checkTheBoxes: 'Prosz\u0119 zaznaczy\u0107 poni\u017Csze pola.',
        agreeToTerms: 'Zg\u00F3d\u017A si\u0119 na warunki, a b\u0119dziesz gotowy do dzia\u0142ania!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Portfel Expensify jest wydawany przez ${walletProgram}.`,
            perPurchase: 'Za zakup',
            atmWithdrawal: 'Wyp\u0142ata z bankomatu',
            cashReload: 'Do\u0142adowanie got\u00F3wk\u0105',
            inNetwork: 'w sieci',
            outOfNetwork: 'poza sieci\u0105',
            atmBalanceInquiry: 'Zapytanie o saldo bankomatu',
            inOrOutOfNetwork: '(w sieci lub poza sieci\u0105)',
            customerService: 'Obs\u0142uga klienta',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(po 12 miesi\u0105cach bez transakcji)',
            weChargeOneFee: 'Pobieramy jeszcze 1 inny rodzaj op\u0142aty. Jest to:',
            fdicInsurance: 'Twoje \u015Brodki kwalifikuj\u0105 si\u0119 do ubezpieczenia FDIC.',
            generalInfo: 'Aby uzyska\u0107 og\u00F3lne informacje o kontach przedp\u0142aconych, odwied\u017A',
            conditionsDetails: 'Aby uzyska\u0107 szczeg\u00F3\u0142y i warunki dotycz\u0105ce wszystkich op\u0142at i us\u0142ug, odwied\u017A',
            conditionsPhone: 'lub dzwoni\u0105c pod numer +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Lista wszystkich op\u0142at za portfel Expensify',
            typeOfFeeHeader: 'Wszystkie op\u0142aty',
            feeAmountHeader: 'Kwota',
            moreDetailsHeader: 'Szczeg\u00F3\u0142y',
            openingAccountTitle: 'Otwieranie konta',
            openingAccountDetails: 'Nie ma op\u0142aty za otwarcie konta.',
            monthlyFeeDetails: 'Nie ma miesi\u0119cznej op\u0142aty.',
            customerServiceTitle: 'Obs\u0142uga klienta',
            customerServiceDetails: 'Nie ma op\u0142at za obs\u0142ug\u0119 klienta.',
            inactivityDetails: 'Nie ma op\u0142aty za brak aktywno\u015Bci.',
            sendingFundsTitle: 'Wysy\u0142anie \u015Brodk\u00F3w do innego posiadacza konta',
            sendingFundsDetails: 'Nie ma op\u0142aty za przesy\u0142anie \u015Brodk\u00F3w do innego posiadacza konta przy u\u017Cyciu salda, konta bankowego lub karty debetowej.',
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
            fdicInsuranceBancorp2: 'aby uzyska\u0107 szczeg\u00F3\u0142y.',
            contactExpensifyPayments: `Skontaktuj si\u0119 z ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} dzwoni\u0105c pod numer +1 833-400-0904, lub e-mailem na adres`,
            contactExpensifyPayments2: 'lub zaloguj si\u0119 na',
            generalInformation: 'Aby uzyska\u0107 og\u00F3lne informacje o kontach przedp\u0142aconych, odwied\u017A',
            generalInformation2:
                'Je\u015Bli masz skarg\u0119 dotycz\u0105c\u0105 konta przedp\u0142aconego, zadzwo\u0144 do Biura Ochrony Konsument\u00F3w Us\u0142ug Finansowych pod numer 1-855-411-2372 lub odwied\u017A',
            printerFriendlyView: 'Wy\u015Bwietl wersj\u0119 przyjazn\u0105 dla drukarki',
            automated: 'Zautomatyzowany',
            liveAgent: 'Agent na \u017Cywo',
            instant: 'Natychmiastowy',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'W\u0142\u0105cz p\u0142atno\u015Bci',
        activatedTitle: 'Portfel aktywowany!',
        activatedMessage: 'Gratulacje, Tw\u00F3j portfel jest gotowy do dokonywania p\u0142atno\u015Bci.',
        checkBackLaterTitle: 'Chwileczk\u0119...',
        checkBackLaterMessage: 'Nadal sprawdzamy Twoje informacje. Prosz\u0119 wr\u00F3\u0107 p\u00F3\u017Aniej.',
        continueToPayment: 'Przejd\u017A do p\u0142atno\u015Bci',
        continueToTransfer: 'Kontynuuj transferowanie',
    },
    companyStep: {
        headerTitle: 'Informacje o firmie',
        subtitle: 'Prawie gotowe! Ze wzgl\u0119d\u00F3w bezpiecze\u0144stwa musimy potwierdzi\u0107 kilka informacji:',
        legalBusinessName: 'Prawna nazwa firmy',
        companyWebsite: 'Strona internetowa firmy',
        taxIDNumber: 'Numer identyfikacji podatkowej',
        taxIDNumberPlaceholder: '9 cyfr',
        companyType: 'Typ firmy',
        incorporationDate: 'Data za\u0142o\u017Cenia firmy',
        incorporationState: 'Stan inkorporacji',
        industryClassificationCode: 'Kod klasyfikacji bran\u017Cowej',
        confirmCompanyIsNot: 'Potwierdzam, \u017Ce ta firma nie znajduje si\u0119 na',
        listOfRestrictedBusinesses: 'lista dzia\u0142alno\u015Bci obj\u0119tych ograniczeniami',
        incorporationDatePlaceholder: 'Data rozpocz\u0119cia (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Kooperatywa',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa dzia\u0142alno\u015B\u0107 gospodarcza',
            OTHER: 'Inne',
        },
        industryClassification: 'Do jakiej bran\u017Cy jest sklasyfikowana firma?',
        industryClassificationCodePlaceholder: 'Wyszukaj kod klasyfikacji bran\u017Cowej',
    },
    requestorStep: {
        headerTitle: 'Informacje osobiste',
        learnMore: 'Dowiedz si\u0119 wi\u0119cej',
        isMyDataSafe: 'Czy moje dane s\u0105 bezpieczne?',
    },
    personalInfoStep: {
        personalInfo: 'Informacje osobiste',
        enterYourLegalFirstAndLast: 'Jakie jest Twoje imi\u0119 i nazwisko?',
        legalFirstName: 'Imi\u0119 zgodne z dokumentami',
        legalLastName: 'Nazwisko prawne',
        legalName: 'Nazwa prawna',
        enterYourDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterTheLast4: 'Jakie s\u0105 ostatnie cztery cyfry Twojego numeru ubezpieczenia spo\u0142ecznego?',
        dontWorry: 'Nie martw si\u0119, nie przeprowadzamy \u017Cadnych osobistych kontroli kredytowych!',
        last4SSN: 'Ostatnie 4 cyfry SSN',
        enterYourAddress: 'Jaki jest Tw\u00F3j adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawd\u017Amy, czy wszystko wygl\u0105da dobrze.',
        byAddingThisBankAccount: 'Dodaj\u0105c to konto bankowe, potwierdzasz, \u017Ce przeczyta\u0142e\u015B, rozumiesz i akceptujesz',
        whatsYourLegalName: 'Jakie jest Twoje imi\u0119 i nazwisko prawne?',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        whatsYourAddress: 'Jaki jest Tw\u00F3j adres?',
        whatsYourSSN: 'Jakie s\u0105 ostatnie cztery cyfry Twojego numeru ubezpieczenia spo\u0142ecznego?',
        noPersonalChecks: 'Nie martw si\u0119, tutaj nie ma sprawdzania zdolno\u015Bci kredytowej!',
        whatsYourPhoneNumber: 'Jaki jest Tw\u00F3j numer telefonu?',
        weNeedThisToVerify: 'Potrzebujemy tego, aby zweryfikowa\u0107 Tw\u00F3j portfel.',
    },
    businessInfoStep: {
        businessInfo: 'Informacje o firmie',
        enterTheNameOfYourBusiness: 'Jak nazywa si\u0119 Twoja firma?',
        businessName: 'Nazwa prawna firmy',
        enterYourCompanyTaxIdNumber: 'Jaki jest numer identyfikacyjny podatkowy Twojej firmy?',
        taxIDNumber: 'Numer identyfikacji podatkowej',
        taxIDNumberPlaceholder: '9 cyfr',
        enterYourCompanyWebsite: 'Jaka jest strona internetowa Twojej firmy?',
        companyWebsite: 'Strona internetowa firmy',
        enterYourCompanyPhoneNumber: 'Jaki jest numer telefonu Twojej firmy?',
        enterYourCompanyAddress: 'Jaki jest adres Twojej firmy?',
        selectYourCompanyType: 'Jaki to rodzaj firmy?',
        companyType: 'Typ firmy',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Kooperatywa',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa dzia\u0142alno\u015B\u0107 gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data za\u0142o\u017Cenia firmy',
        incorporationDatePlaceholder: 'Data rozpocz\u0119cia (rrrr-mm-dd)',
        incorporationState: 'Stan inkorporacji',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'W jakim stanie zosta\u0142a zarejestrowana Twoja firma?',
        letsDoubleCheck: 'Sprawd\u017Amy, czy wszystko wygl\u0105da dobrze.',
        companyAddress: 'Adres firmy',
        listOfRestrictedBusinesses: 'lista dzia\u0142alno\u015Bci obj\u0119tych ograniczeniami',
        confirmCompanyIsNot: 'Potwierdzam, \u017Ce ta firma nie znajduje si\u0119 na',
        businessInfoTitle: 'Informacje o firmie',
        legalBusinessName: 'Prawna nazwa firmy',
        whatsTheBusinessName: 'Jaka jest nazwa firmy?',
        whatsTheBusinessAddress: 'Jaki jest adres firmy?',
        whatsTheBusinessContactInformation: 'Jakie s\u0105 dane kontaktowe firmy?',
        whatsTheBusinessRegistrationNumber: 'Jaki jest numer rejestracji firmy?',
        whatsTheBusinessTaxIDEIN: 'Jaki jest numer identyfikacyjny podatku biznesowego/EIN/VAT/GST?',
        whatsThisNumber: 'Co to za numer?',
        whereWasTheBusinessIncorporated: 'Gdzie zosta\u0142a zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj dzia\u0142alno\u015Bci?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen p\u0142atno\u015Bci firmy?',
        whatsYourExpectedAverageReimbursements: 'Jaka jest Twoja oczekiwana \u015Brednia kwota zwrotu?',
        registrationNumber: 'Numer rejestracyjny',
        taxIDEIN: 'Numer identyfikacji podatkowej/EIN',
        businessAddress: 'Adres firmowy',
        businessType: 'Typ dzia\u0142alno\u015Bci',
        incorporation: 'Inkorporacja',
        incorporationCountry: 'Kraj inkorporacji',
        incorporationTypeName: 'Typ inkorporacji',
        businessCategory: 'Kategoria biznesowa',
        annualPaymentVolume: 'Roczna warto\u015B\u0107 p\u0142atno\u015Bci',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Roczna warto\u015B\u0107 p\u0142atno\u015Bci w ${currencyCode}`,
        averageReimbursementAmount: '\u015Arednia kwota zwrotu',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `\u015Arednia kwota zwrotu w ${currencyCode}`,
        selectIncorporationType: 'Wybierz typ inkorporacji',
        selectBusinessCategory: 'Wybierz kategori\u0119 biznesow\u0105',
        selectAnnualPaymentVolume: 'Wybierz roczn\u0105 warto\u015B\u0107 p\u0142atno\u015Bci',
        selectIncorporationCountry: 'Wybierz kraj rejestracji',
        selectIncorporationState: 'Wybierz stan inkorporacji',
        selectAverageReimbursement: 'Wybierz \u015Bredni\u0105 kwot\u0119 zwrotu',
        findIncorporationType: 'Znajd\u017A typ inkorporacji',
        findBusinessCategory: 'Znajd\u017A kategori\u0119 biznesow\u0105',
        findAnnualPaymentVolume: 'Znajd\u017A roczn\u0105 warto\u015B\u0107 p\u0142atno\u015Bci',
        findIncorporationState: 'Znajd\u017A stan rejestracji',
        findAverageReimbursement: 'Znajd\u017A \u015Bredni\u0105 kwot\u0119 zwrotu',
        error: {
            registrationNumber: 'Prosz\u0119 poda\u0107 prawid\u0142owy numer rejestracyjny',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Czy posiadasz 25% lub wi\u0119cej z',
        doAnyIndividualOwn25percent: 'Czy jakiekolwiek osoby posiadaj\u0105 25% lub wi\u0119cej udzia\u0142\u00F3w w',
        areThereMoreIndividualsWhoOwn25percent: 'Czy jest wi\u0119cej os\u00F3b, kt\u00F3re posiadaj\u0105 25% lub wi\u0119cej z',
        regulationRequiresUsToVerifyTheIdentity:
            'Przepisy wymagaj\u0105 od nas weryfikacji to\u017Csamo\u015Bci ka\u017Cdej osoby, kt\u00F3ra posiada wi\u0119cej ni\u017C 25% udzia\u0142\u00F3w w firmie.',
        companyOwner: 'W\u0142a\u015Bciciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest prawne imi\u0119 w\u0142a\u015Bciciela?',
        legalFirstName: 'Imi\u0119 zgodne z dokumentami',
        legalLastName: 'Nazwisko prawne',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia w\u0142a\u015Bciciela?',
        enterTheLast4: 'Jakie s\u0105 ostatnie 4 cyfry numeru Social Security w\u0142a\u015Bciciela?',
        last4SSN: 'Ostatnie 4 cyfry SSN',
        dontWorry: 'Nie martw si\u0119, nie przeprowadzamy \u017Cadnych osobistych kontroli kredytowych!',
        enterTheOwnersAddress: 'Jaki jest adres w\u0142a\u015Bciciela?',
        letsDoubleCheck: 'Sprawd\u017Amy jeszcze raz, czy wszystko wygl\u0105da dobrze.',
        legalName: 'Nazwa prawna',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodaj\u0105c to konto bankowe, potwierdzasz, \u017Ce przeczyta\u0142e\u015B, rozumiesz i akceptujesz',
        owners: 'W\u0142a\u015Bciciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o w\u0142a\u015Bcicielu',
        businessOwner: 'W\u0142a\u015Bciciel firmy',
        signerInfo: 'Informacje o sygnatariuszu',
        doYouOwn: ({companyName}: CompanyNameParams) => `Czy posiadasz 25% lub wi\u0119cej udzia\u0142\u00F3w w ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Czy jakiekolwiek osoby posiadaj\u0105 25% lub wi\u0119cej udzia\u0142\u00F3w w ${companyName}?`,
        regulationsRequire: 'Przepisy wymagaj\u0105 od nas weryfikacji to\u017Csamo\u015Bci ka\u017Cdej osoby, kt\u00F3ra posiada wi\u0119cej ni\u017C 25% udzia\u0142\u00F3w w firmie.',
        legalFirstName: 'Imi\u0119 zgodne z dokumentami',
        legalLastName: 'Nazwisko prawne',
        whatsTheOwnersName: 'Jakie jest prawne imi\u0119 w\u0142a\u015Bciciela?',
        whatsYourName: 'Jakie jest Twoje imi\u0119 i nazwisko?',
        whatPercentage: 'Jaki procent firmy nale\u017Cy do w\u0142a\u015Bciciela?',
        whatsYoursPercentage: 'Jaki procent firmy posiadasz?',
        ownership: 'W\u0142asno\u015B\u0107',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia w\u0142a\u015Bciciela?',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres w\u0142a\u015Bciciela?',
        whatsYourAddress: 'Jaki jest Tw\u00F3j adres?',
        whatAreTheLast: 'Jakie s\u0105 ostatnie 4 cyfry numeru Social Security w\u0142a\u015Bciciela?',
        whatsYourLast: 'Jakie s\u0105 ostatnie 4 cyfry Twojego numeru ubezpieczenia spo\u0142ecznego?',
        dontWorry: 'Nie martw si\u0119, nie przeprowadzamy \u017Cadnych osobistych kontroli kredytowych!',
        last4: 'Ostatnie 4 cyfry SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawd\u017Amy jeszcze raz, czy wszystko wygl\u0105da dobrze.',
        legalName: 'Nazwa prawna',
        ownershipPercentage: 'Procent w\u0142asno\u015Bci',
        areThereOther: ({companyName}: CompanyNameParams) => `Czy s\u0105 inne osoby, kt\u00F3re posiadaj\u0105 25% lub wi\u0119cej udzia\u0142\u00F3w w ${companyName}?`,
        owners: 'W\u0142a\u015Bciciele',
        addCertified: 'Dodaj certyfikowany schemat organizacyjny, kt\u00F3ry pokazuje rzeczywistych w\u0142a\u015Bcicieli.',
        regulationRequiresChart:
            'Przepisy wymagaj\u0105 od nas zebrania po\u015Bwiadczonej kopii schematu w\u0142asno\u015Bci, kt\u00F3ry pokazuje ka\u017Cd\u0105 osob\u0119 lub podmiot posiadaj\u0105cy 25% lub wi\u0119cej udzia\u0142\u00F3w w firmie.',
        uploadEntity: 'Prze\u015Blij wykres w\u0142asno\u015Bci podmiotu',
        noteEntity: 'Uwaga: Schemat w\u0142asno\u015Bci jednostki musi by\u0107 podpisany przez Twojego ksi\u0119gowego, doradc\u0119 prawnego lub po\u015Bwiadczony notarialnie.',
        certified: 'Certyfikowany wykres w\u0142asno\u015Bci jednostki',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajd\u017A kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prze\u015Blij dodatkow\u0105 dokumentacj\u0119',
        pleaseUpload:
            'Prosz\u0119 przes\u0142a\u0107 dodatkow\u0105 dokumentacj\u0119 poni\u017Cej, aby pom\u00F3c nam zweryfikowa\u0107 Twoj\u0105 to\u017Csamo\u015B\u0107 jako bezpo\u015Bredniego lub po\u015Bredniego w\u0142a\u015Bciciela 25% lub wi\u0119cej jednostki biznesowej.',
        acceptedFiles: 'Akceptowane formaty plik\u00F3w: PDF, PNG, JPEG. Ca\u0142kowity rozmiar plik\u00F3w dla ka\u017Cdej sekcji nie mo\u017Ce przekracza\u0107 5 MB.',
        proofOfBeneficialOwner: 'Dow\u00F3d w\u0142a\u015Bciciela rzeczywistego',
        proofOfBeneficialOwnerDescription:
            'Prosz\u0119 dostarczy\u0107 podpisane po\u015Bwiadczenie i schemat organizacyjny od bieg\u0142ego ksi\u0119gowego, notariusza lub prawnika potwierdzaj\u0105ce posiadanie 25% lub wi\u0119cej udzia\u0142\u00F3w w firmie. Dokument musi by\u0107 datowany na ostatnie trzy miesi\u0105ce i zawiera\u0107 numer licencji osoby podpisuj\u0105cej.',
        copyOfID: 'Kopia dowodu to\u017Csamo\u015Bci dla beneficjenta rzeczywistego',
        copyOfIDDescription: 'Przyk\u0142ady: paszport, prawo jazdy, itp.',
        proofOfAddress: 'Potwierdzenie adresu dla rzeczywistego w\u0142a\u015Bciciela',
        proofOfAddressDescription: 'Przyk\u0142ady: rachunek za media, umowa najmu, itp.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            'Prosz\u0119 przes\u0142a\u0107 wideo z wizyty na miejscu lub nagranie rozmowy z urz\u0119dnikiem podpisuj\u0105cym. Urz\u0119dnik musi poda\u0107: pe\u0142ne imi\u0119 i nazwisko, dat\u0119 urodzenia, nazw\u0119 firmy, numer rejestracyjny, numer kodu fiskalnego, adres rejestrowy, charakter dzia\u0142alno\u015Bci i cel konta.',
    },
    validationStep: {
        headerTitle: 'Zwaliduj konto bankowe',
        buttonText: 'Zako\u0144cz konfiguracj\u0119',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego zosta\u0142a wy\u0142\u0105czona z powodu zbyt wielu niepoprawnych pr\u00F3b.',
        description: `W ci\u0105gu 1-2 dni roboczych wy\u015Blemy trzy (3) ma\u0142e transakcje na Twoje konto bankowe od nazwy takiej jak "Expensify, Inc. Validation".`,
        descriptionCTA: 'Prosz\u0119 wprowadzi\u0107 kwot\u0119 ka\u017Cdej transakcji w poni\u017Cszych polach. Przyk\u0142ad: 1.51.',
        reviewingInfo: 'Dzi\u0119kujemy! Przegl\u0105damy Twoje informacje i wkr\u00F3tce si\u0119 skontaktujemy. Prosz\u0119 sprawd\u017A sw\u00F3j czat z Concierge.',
        forNextStep: 'aby zako\u0144czy\u0107 konfiguracj\u0119 swojego konta bankowego.',
        letsChatCTA: 'Tak, porozmawiajmy.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy w weryfikacji kilku ostatnich informacji przez czat. Gotowy?',
        letsChatTitle: 'Porozmawiajmy!',
        enable2FATitle: 'Zapobiegaj oszustwom, w\u0142\u0105cz uwierzytelnianie dwusk\u0142adnikowe (2FA)',
        enable2FAText: 'Traktujemy Twoje bezpiecze\u0144stwo powa\u017Cnie. Prosz\u0119 skonfigurowa\u0107 2FA teraz, aby doda\u0107 dodatkow\u0105 warstw\u0119 ochrony do swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Dodatkowe informacje',
        checkAllThatApply: 'Zaznacz wszystkie, kt\u00F3re maj\u0105 zastosowanie, w przeciwnym razie pozostaw puste.',
        iOwnMoreThan25Percent: 'Posiadam wi\u0119cej ni\u017C 25% z',
        someoneOwnsMoreThan25Percent: 'Kto\u015B inny posiada wi\u0119cej ni\u017C 25% z',
        additionalOwner: 'Dodatkowy beneficjent rzeczywisty',
        removeOwner: 'Usu\u0144 tego beneficjenta rzeczywistego',
        addAnotherIndividual: 'Dodaj inn\u0105 osob\u0119, kt\u00F3ra posiada wi\u0119cej ni\u017C 25% z',
        agreement: 'Umowa:',
        termsAndConditions: 'warunki i zasady',
        certifyTrueAndAccurate: 'O\u015Bwiadczam, \u017Ce podane informacje s\u0105 prawdziwe i dok\u0142adne.',
        error: {
            certify: 'Musisz potwierdzi\u0107, \u017Ce informacje s\u0105 prawdziwe i dok\u0142adne',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Zako\u0144cz weryfikacj\u0119',
        confirmAgreements: 'Prosz\u0119 potwierdzi\u0107 poni\u017Csze umowy.',
        certifyTrueAndAccurate: 'O\u015Bwiadczam, \u017Ce podane informacje s\u0105 prawdziwe i dok\u0142adne.',
        certifyTrueAndAccurateError: 'Prosz\u0119 potwierdzi\u0107, \u017Ce informacje s\u0105 prawdziwe i dok\u0142adne.',
        isAuthorizedToUseBankAccount: 'Jestem upowa\u017Cniony do korzystania z tego firmowego konta bankowego na wydatki biznesowe',
        isAuthorizedToUseBankAccountError: 'Musisz by\u0107 kontroluj\u0105cym urz\u0119dnikiem z upowa\u017Cnieniem do obs\u0142ugi konta bankowego firmy.',
        termsAndConditions: 'warunki i zasady',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Po\u0142\u0105cz konto bankowe',
        finishButtonText: 'Zako\u0144cz konfiguracj\u0119',
        validateYourBankAccount: 'Zatwierd\u017A swoje konto bankowe',
        validateButtonText: 'Zatwierd\u017A',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego zosta\u0142a wy\u0142\u0105czona z powodu zbyt wielu niepoprawnych pr\u00F3b.',
        description: `W ci\u0105gu 1-2 dni roboczych wy\u015Blemy trzy (3) ma\u0142e transakcje na Twoje konto bankowe od nazwy takiej jak "Expensify, Inc. Validation".`,
        descriptionCTA: 'Prosz\u0119 wprowadzi\u0107 kwot\u0119 ka\u017Cdej transakcji w poni\u017Cszych polach. Przyk\u0142ad: 1.51.',
        reviewingInfo: 'Dzi\u0119kujemy! Przegl\u0105damy Twoje informacje i wkr\u00F3tce si\u0119 z Tob\u0105 skontaktujemy. Sprawd\u017A sw\u00F3j czat z Concierge.',
        forNextSteps: 'aby zako\u0144czy\u0107 konfiguracj\u0119 swojego konta bankowego.',
        letsChatCTA: 'Tak, porozmawiajmy.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy w weryfikacji kilku ostatnich informacji przez czat. Gotowy?',
        letsChatTitle: 'Porozmawiajmy!',
        enable2FATitle: 'Zapobiegaj oszustwom, w\u0142\u0105cz uwierzytelnianie dwusk\u0142adnikowe (2FA)',
        enable2FAText: 'Traktujemy Twoje bezpiecze\u0144stwo powa\u017Cnie. Prosz\u0119 skonfigurowa\u0107 2FA teraz, aby doda\u0107 dodatkow\u0105 warstw\u0119 ochrony do swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierd\u017A walut\u0119 i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierd\u017A walut\u0119 i kraj',
        yourBusiness: 'Waluta Twojego firmowego konta bankowego musi by\u0107 zgodna z walut\u0105 Twojego miejsca pracy.',
        youCanChange: 'Mo\u017Cesz zmieni\u0107 walut\u0119 swojego miejsca pracy w swoim',
        findCountry: 'Znajd\u017A kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie s\u0105 szczeg\u00F3\u0142y Twojego firmowego konta bankowego?',
        letsDoubleCheck: 'Sprawd\u017Amy jeszcze raz, czy wszystko wygl\u0105da dobrze.',
        thisBankAccount: 'To konto bankowe b\u0119dzie u\u017Cywane do p\u0142atno\u015Bci biznesowych w Twoim obszarze roboczym.',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Pe\u0142ne imi\u0119 i nazwisko osoby upowa\u017Cnionej do podpisu',
    },
    signerInfoStep: {
        signerInfo: 'Informacje o sygnatariuszu',
        areYouDirector: ({companyName}: CompanyNameParams) => `Czy jeste\u015B dyrektorem lub starszym pracownikiem w ${companyName}?`,
        regulationRequiresUs: 'Przepisy wymagaj\u0105 od nas weryfikacji, czy podpisuj\u0105cy ma uprawnienia do podj\u0119cia tej czynno\u015Bci w imieniu firmy.',
        whatsYourName: 'Jakie jest Twoje imi\u0119 i nazwisko?',
        fullName: 'Pe\u0142ne imi\u0119 i nazwisko prawne',
        whatsYourJobTitle: 'Jakie jest Twoje stanowisko pracy?',
        jobTitle: 'Stanowisko pracy',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        uploadID: 'Prze\u015Blij dow\u00F3d to\u017Csamo\u015Bci i potwierdzenie adresu',
        personalAddress: 'Dow\u00F3d adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawd\u017Amy jeszcze raz, czy wszystko wygl\u0105da dobrze.',
        legalName: 'Nazwa prawna',
        proofOf: 'Potwierdzenie adresu zamieszkania',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Wprowad\u017A adres e-mail dyrektora lub starszego urz\u0119dnika w ${companyName}`,
        regulationRequiresOneMoreDirector: 'Regulacje wymagaj\u0105 co najmniej jeszcze jednego dyrektora lub starszego urz\u0119dnika jako sygnatariusza.',
        hangTight: 'Chwileczk\u0119...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Wprowad\u017A adresy e-mail dw\u00F3ch dyrektor\u00F3w lub starszych pracownik\u00F3w w ${companyName}`,
        sendReminder: 'Wy\u015Blij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, a\u017C inni zweryfikuj\u0105 swoje to\u017Csamo\u015Bci jako dyrektorzy lub wy\u017Csi urz\u0119dnicy firmy.',
        id: 'Kopia dowodu to\u017Csamo\u015Bci',
        proofOfDirectors: 'Dow\u00F3d dyrektora(\u00F3w)',
        proofOfDirectorsDescription: 'Przyk\u0142ady: Profil Korporacyjny Oncorp lub Rejestracja Dzia\u0142alno\u015Bci.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale dla Sygnatariuszy, U\u017Cytkownik\u00F3w Upowa\u017Cnionych i W\u0142a\u015Bcicieli Korzystaj\u0105cych.',
        PDSandFSG: 'Dokumentacja ujawniaj\u0105ca PDS + FSG',
        PDSandFSGDescription:
            'Nasze partnerstwo z Corpay wykorzystuje po\u0142\u0105czenie API, aby skorzysta\u0107 z ich rozleg\u0142ej sieci mi\u0119dzynarodowych partner\u00F3w bankowych do obs\u0142ugi Globalnych Zwrot\u00F3w w Expensify. Zgodnie z australijskimi przepisami dostarczamy Ci Przewodnik po Us\u0142ugach Finansowych (FSG) i O\u015Bwiadczenie o Ujawnieniu Produktu (PDS) Corpay.\n\nProsimy o dok\u0142adne zapoznanie si\u0119 z dokumentami FSG i PDS, poniewa\u017C zawieraj\u0105 one pe\u0142ne szczeg\u00F3\u0142y i wa\u017Cne informacje na temat produkt\u00F3w i us\u0142ug oferowanych przez Corpay. Zachowaj te dokumenty do przysz\u0142ego wgl\u0105du.',
        pleaseUpload:
            'Prosz\u0119 przes\u0142a\u0107 dodatkow\u0105 dokumentacj\u0119 poni\u017Cej, aby pom\u00F3c nam zweryfikowa\u0107 Twoj\u0105 to\u017Csamo\u015B\u0107 jako dyrektora lub starszego urz\u0119dnika jednostki gospodarczej.',
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Prosz\u0119 potwierdzi\u0107 poni\u017Csze umowy',
        regulationRequiresUs: 'Przepisy wymagaj\u0105 od nas weryfikacji to\u017Csamo\u015Bci ka\u017Cdej osoby, kt\u00F3ra posiada wi\u0119cej ni\u017C 25% udzia\u0142\u00F3w w firmie.',
        iAmAuthorized: 'Jestem upowa\u017Cniony do korzystania z firmowego konta bankowego na wydatki biznesowe.',
        iCertify: 'O\u015Bwiadczam, \u017Ce podane informacje s\u0105 prawdziwe i dok\u0142adne.',
        termsAndConditions: 'warunki i zasady',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThe: 'Wyra\u017Cam zgod\u0119 na',
        privacyNotice: 'informacja o prywatno\u015Bci',
        error: {
            authorized: 'Musisz by\u0107 kontroluj\u0105cym urz\u0119dnikiem z upowa\u017Cnieniem do obs\u0142ugi konta bankowego firmy.',
            certify: 'Prosz\u0119 potwierdzi\u0107, \u017Ce informacje s\u0105 prawdziwe i dok\u0142adne.',
            consent: 'Prosz\u0119 wyrazi\u0107 zgod\u0119 na polityk\u0119 prywatno\u015Bci',
        },
    },
    finishStep: {
        connect: 'Po\u0142\u0105cz konto bankowe',
        letsFinish: 'Zako\u0144czmy na czacie!',
        thanksFor:
            'Dzi\u0119kujemy za te szczeg\u00F3\u0142y. Dedykowany agent wsparcia teraz przejrzy Twoje informacje. Skontaktujemy si\u0119 ponownie, je\u015Bli b\u0119dziemy potrzebowa\u0107 od Ciebie dodatkowych informacji, ale w mi\u0119dzyczasie, nie wahaj si\u0119 z nami skontaktowa\u0107, je\u015Bli masz jakiekolwiek pytania.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'W\u0142\u0105cz uwierzytelnianie dwusk\u0142adnikowe (2FA), aby zapobiec oszustwom',
        weTake: 'Traktujemy Twoje bezpiecze\u0144stwo powa\u017Cnie. Prosz\u0119 skonfigurowa\u0107 2FA teraz, aby doda\u0107 dodatkow\u0105 warstw\u0119 ochrony do swojego konta.',
        secure: 'Zabezpiecz swoje konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Chwileczk\u0119',
        explanationLine: 'Przygl\u0105damy si\u0119 Twoim informacjom. Wkr\u00F3tce b\u0119dziesz m\u00F3g\u0142 kontynuowa\u0107 kolejne kroki.',
    },
    session: {
        offlineMessageRetry: 'Wygl\u0105da na to, \u017Ce jeste\u015B offline. Sprawd\u017A swoje po\u0142\u0105czenie i spr\u00F3buj ponownie.',
    },
    travel: {
        header: 'Zarezerwuj podr\u00F3\u017C',
        title: 'Podr\u00F3\u017Cuj m\u0105drze',
        subtitle: 'U\u017Cyj Expensify Travel, aby uzyska\u0107 najlepsze oferty podr\u00F3\u017Cy i zarz\u0105dza\u0107 wszystkimi wydatkami biznesowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszcz\u0119dzaj pieni\u0105dze na swoich rezerwacjach',
            alerts: 'Otrzymuj aktualizacje i alerty w czasie rzeczywistym',
        },
        bookTravel: 'Zarezerwuj podr\u00F3\u017C',
        bookDemo: 'Zarezerwuj demo',
        bookADemo: 'Zarezerwuj demo',
        toLearnMore: 'aby dowiedzie\u0107 si\u0119 wi\u0119cej.',
        termsAndConditions: {
            header: 'Zanim przejdziemy dalej...',
            title: 'Regulamin i warunki',
            subtitle: 'Prosz\u0119 zaakceptowa\u0107 Expensify Travel',
            termsAndConditions: 'warunki i zasady',
            travelTermsAndConditions: 'warunki i zasady',
            agree: 'Zgadzam si\u0119 na',
            error: 'Musisz zaakceptowa\u0107 warunki i zasady Expensify Travel, aby kontynuowa\u0107.',
            defaultWorkspaceError:
                'Musisz ustawi\u0107 domy\u015Blne miejsce pracy, aby w\u0142\u0105czy\u0107 Expensify Travel. Przejd\u017A do Ustawienia > Miejsca pracy > kliknij trzy pionowe kropki obok miejsca pracy > Ustaw jako domy\u015Blne miejsce pracy, a nast\u0119pnie spr\u00F3buj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasa\u017Cer',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Masz <strong>${layover} mi\u0119dzyl\u0105dowanie</strong> przed tym lotem</muted-text-label>`,
            takeOff: 'Start',
            landing: 'L\u0105dowanie',
            seat: 'Miejsce',
            class: 'Klasa kabiny',
            recordLocator: 'Identyfikator rezerwacji',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Ekonomia',
                premiumEconomy: 'Premium Economy',
                business: 'Business',
                first: 'Pierwszy',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Go\u015B\u0107',
            checkIn: 'Zameldowanie',
            checkOut: 'Wymeldowanie',
            roomType: 'Typ pokoju',
            cancellation: 'Polityka anulowania',
            cancellationUntil: 'Bezp\u0142atne anulowanie do',
            confirmation: 'Numer potwierdzenia',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Bezzwrotny',
                freeCancellationUntil: 'Bezp\u0142atne anulowanie do',
                partiallyRefundable: 'Cz\u0119\u015Bciowo refundowane',
            },
        },
        car: 'Samoch\u00F3d',
        carDetails: {
            rentalCar: 'Wynajem samochod\u00F3w',
            pickUp: 'Odbi\u00F3r',
            dropOff: 'Zrzut',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Polityka anulowania',
            cancellationUntil: 'Bezp\u0142atne anulowanie do',
            freeCancellation: 'Bezp\u0142atne anulowanie rezerwacji',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Pasa\u017Cer',
            departs: 'Odje\u017Cd\u017Ca',
            arrives: 'Przybywa',
            coachNumber: 'Numer wagonu',
            seat: 'Miejsce',
            fareDetails: 'Szczeg\u00F3\u0142y op\u0142at',
            confirmation: 'Numer potwierdzenia',
        },
        viewTrip: 'Zobacz podr\u00F3\u017C',
        modifyTrip: 'Zmodyfikuj podr\u00F3\u017C',
        tripSupport: 'Wsparcie podr\u00F3\u017Cy',
        tripDetails: 'Szczeg\u00F3\u0142y podr\u00F3\u017Cy',
        viewTripDetails: 'Zobacz szczeg\u00F3\u0142y podr\u00F3\u017Cy',
        trip: 'Podr\u00F3\u017C',
        trips: 'Podr\u00F3\u017Ce',
        tripSummary: 'Podsumowanie podr\u00F3\u017Cy',
        departs: 'Odje\u017Cd\u017Ca',
        errorMessage: 'Co\u015B posz\u0142o nie tak. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        phoneError: {
            phrase1: 'Prosz\u0119',
            link: 'dodaj s\u0142u\u017Cbowy e-mail jako swoje g\u0142\u00F3wne logowanie',
            phrase2: 'zarezerwowa\u0107 podr\u00F3\u017C.',
        },
        domainSelector: {
            title: 'Domena',
            subtitle: 'Wybierz domen\u0119 dla konfiguracji Expensify Travel.',
            recommended: 'Zalecane',
        },
        domainPermissionInfo: {
            title: 'Domena',
            restrictionPrefix: `Nie masz uprawnie\u0144 do w\u0142\u0105czenia Expensify Travel dla tej domeny.`,
            restrictionSuffix: `B\u0119dziesz musia\u0142 poprosi\u0107 kogo\u015B z tej domeny o w\u0142\u0105czenie podr\u00F3\u017Cy.`,
            accountantInvitationPrefix: `Je\u015Bli jeste\u015B ksi\u0119gowym, rozwa\u017C do\u0142\u0105czenie do`,
            accountantInvitationLink: `Program dla ksi\u0119gowych ExpensifyApproved!`,
            accountantInvitationSuffix: `aby w\u0142\u0105czy\u0107 podr\u00F3\u017Ce dla tej domeny.`,
        },
        publicDomainError: {
            title: 'Rozpocznij korzystanie z Expensify Travel',
            message: `B\u0119dziesz musia\u0142 u\u017Cy\u0107 swojego s\u0142u\u017Cbowego adresu e-mail (np. name@company.com) z Expensify Travel, a nie osobistego adresu e-mail (np. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel zosta\u0142 wy\u0142\u0105czony',
            message: `Tw\u00F3j administrator wy\u0142\u0105czy\u0142 Expensify Travel. Prosz\u0119 post\u0119powa\u0107 zgodnie z firmow\u0105 polityk\u0105 rezerwacji w celu organizacji podr\u00F3\u017Cy.`,
        },
        verifyCompany: {
            title: 'Rozpocznij podr\u00F3\u017C ju\u017C dzi\u015B!',
            message: `Prosz\u0119 skontaktowa\u0107 si\u0119 z mened\u017Cerem konta lub salesteam@expensify.com, aby uzyska\u0107 demonstracj\u0119 podr\u00F3\u017Cy i w\u0142\u0105czy\u0107 j\u0105 dla swojej firmy.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Tw\u00F3j lot ${airlineCode} (${origin} \u2192 ${destination}) w dniu ${startDate} zosta\u0142 zarezerwowany. Kod potwierdzenia: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Tw\u00F3j bilet na lot ${airlineCode} (${origin} \u2192 ${destination}) w dniu ${startDate} zosta\u0142 uniewa\u017Cniony.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Tw\u00F3j bilet na lot ${airlineCode} (${origin} \u2192 ${destination}) w dniu ${startDate} zosta\u0142 zwr\u00F3cony lub wymieniony.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Tw\u00F3j lot ${airlineCode} (${origin} \u2192 ${destination}) w dniu ${startDate} zosta\u0142 odwo\u0142any przez lini\u0119 lotnicz\u0105.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `Linia lotnicza zaproponowa\u0142a zmian\u0119 harmonogramu dla lotu ${airlineCode}; czekamy na potwierdzenie.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Potwierdzono zmian\u0119 harmonogramu: lot ${airlineCode} teraz odlatuje o ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Tw\u00F3j lot ${airlineCode} (${origin} \u2192 ${destination}) w dniu ${startDate} zosta\u0142 zaktualizowany.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Twoja klasa kabiny zosta\u0142a zaktualizowana do ${cabinClass} na locie ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Twoje miejsce na pok\u0142adzie lotu ${airlineCode} zosta\u0142o potwierdzone.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Twoje miejsce na locie ${airlineCode} zosta\u0142o zmienione.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Twoje miejsce na locie ${airlineCode} zosta\u0142o usuni\u0119te.`,
            paymentDeclined: 'P\u0142atno\u015B\u0107 za rezerwacj\u0119 lotu nie powiod\u0142a si\u0119. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Anulowa\u0142e\u015B swoj\u0105 rezerwacj\u0119 ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Dostawca anulowa\u0142 Twoj\u0105 rezerwacj\u0119 ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Twoja rezerwacja ${type} zosta\u0142a ponownie zarezerwowana. Nowy numer potwierdzenia: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Twoja rezerwacja ${type} zosta\u0142a zaktualizowana. Sprawd\u017A nowe szczeg\u00F3\u0142y w planie podr\u00F3\u017Cy.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Tw\u00F3j bilet kolejowy na tras\u0119 ${origin} \u2192 ${destination} na dzie\u0144 ${startDate} zosta\u0142 zwr\u00F3cony. Zwrot \u015Brodk\u00F3w zostanie przetworzony.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) =>
                `Tw\u00F3j bilet kolejowy na trasie ${origin} \u2192 ${destination} na dzie\u0144 ${startDate} zosta\u0142 wymieniony.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) =>
                `Tw\u00F3j bilet kolejowy na tras\u0119 ${origin} \u2192 ${destination} na dzie\u0144 ${startDate} zosta\u0142 zaktualizowany.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Twoja rezerwacja ${type} zosta\u0142a zaktualizowana.`,
        },
    },
    workspace: {
        common: {
            card: 'Karty',
            expensifyCard: 'Expensify Card',
            companyCards: 'Karty firmowe',
            workflows: 'Przep\u0142ywy pracy',
            workspace: 'Workspace',
            findWorkspace: 'Znajdź przestrzeń roboczą',
            edit: 'Edytuj przestrze\u0144 robocz\u0105',
            enabled: 'W\u0142\u0105czony',
            disabled: 'Wy\u0142\u0105czony',
            everyone: 'Wszyscy',
            delete: 'Usu\u0144 przestrze\u0144 robocz\u0105',
            settings: 'Ustawienia',
            reimburse: 'Zwroty koszt\u00F3w',
            categories: 'Kategorie',
            tags: 'Tagi',
            customField1: 'Pole niestandardowe 1',
            customField2: 'Pole niestandardowe 2',
            customFieldHint: 'Dodaj niestandardowe kodowanie, kt\u00F3re ma zastosowanie do wszystkich wydatk\u00F3w tego cz\u0142onka.',
            reportFields: 'Pola raportu',
            reportTitle: 'Tytu\u0142 raportu',
            reportField: 'Pole raportu',
            taxes: 'Podatki',
            bills: 'Rachunki',
            invoices: 'Faktury',
            travel: 'Podr\u00F3\u017Cowa\u0107',
            members: 'Cz\u0142onkowie',
            accounting: 'Ksi\u0119gowo\u015B\u0107',
            rules: 'Zasady',
            displayedAs: 'Wy\u015Bwietlane jako',
            plan: 'Plan',
            profile: 'Przegl\u0105d',
            bankAccount: 'Konto bankowe',
            connectBankAccount: 'Po\u0142\u0105cz konto bankowe',
            testTransactions: 'Testowe transakcje',
            issueAndManageCards: 'Wydawaj i zarz\u0105dzaj kartami',
            reconcileCards: 'Uzgodnij karty',
            selected: () => ({
                one: '1 wybrano',
                other: (count: number) => `${count} wybrano`,
            }),
            settlementFrequency: 'Cz\u0119stotliwo\u015B\u0107 rozlicze\u0144',
            setAsDefault: 'Ustaw jako domy\u015Blne miejsce pracy',
            defaultNote: `Paragony wys\u0142ane na ${CONST.EMAIL.RECEIPTS} pojawi\u0105 si\u0119 w tym obszarze roboczym.`,
            deleteConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 przestrze\u0144 robocz\u0105?',
            deleteWithCardsConfirmation:
                'Czy na pewno chcesz usun\u0105\u0107 t\u0119 przestrze\u0144 robocz\u0105? Spowoduje to usuni\u0119cie wszystkich kana\u0142\u00F3w kart i przypisanych kart.',
            unavailable: 'Niedost\u0119pna przestrze\u0144 robocza',
            memberNotFound: 'Nie znaleziono cz\u0142onka. Aby zaprosi\u0107 nowego cz\u0142onka do przestrzeni roboczej, u\u017Cyj przycisku zaproszenia powy\u017Cej.',
            notAuthorized: `Nie masz dost\u0119pu do tej strony. Je\u015Bli pr\u00F3bujesz do\u0142\u0105czy\u0107 do tego miejsca pracy, popro\u015B w\u0142a\u015Bciciela miejsca pracy o dodanie Ci\u0119 jako cz\u0142onka. Co\u015B innego? Skontaktuj si\u0119 z ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Id\u017A do pokoju ${roomName}`,
            goToWorkspace: 'Przejd\u017A do przestrzeni roboczej',
            goToWorkspaces: 'Przejd\u017A do przestrzeni roboczych',
            clearFilter: 'Wyczy\u015B\u0107 filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'W\u0142a\u015Bciciel',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz by\u0107 online, aby zobaczy\u0107 cz\u0142onk\u00F3w tego miejsca pracy.',
            moreFeatures: 'Wi\u0119cej funkcji',
            requested: 'Za\u017C\u0105dano',
            distanceRates: 'Stawki za odleg\u0142o\u015B\u0107',
            defaultDescription: 'Jedno miejsce na wszystkie Twoje paragony i wydatki.',
            descriptionHint: 'Udost\u0119pnij informacje o tym miejscu pracy wszystkim cz\u0142onkom.',
            welcomeNote: 'Prosz\u0119 u\u017Cy\u0107 Expensify do przesy\u0142ania paragon\u00F3w do zwrotu koszt\u00F3w, dzi\u0119kuj\u0119!',
            subscription: 'Subskrypcja',
            markAsEntered: 'Oznacz jako wprowadzone r\u0119cznie',
            markAsExported: 'Oznacz jako wyeksportowane r\u0119cznie',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Eksportuj do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Sprawd\u017Amy, czy wszystko wygl\u0105da dobrze.',
            lineItemLevel: 'Poziom pozycji faktury',
            reportLevel: 'Poziom raportu',
            topLevel: 'Najwy\u017Cszy poziom',
            appliedOnExport: 'Nie zaimportowane do Expensify, zastosowane przy eksporcie',
            shareNote: {
                header: 'Udost\u0119pnij swoje miejsce pracy innym cz\u0142onkom',
                content: {
                    firstPart:
                        'Udost\u0119pnij ten kod QR lub skopiuj poni\u017Cszy link, aby u\u0142atwi\u0107 cz\u0142onkom \u017C\u0105danie dost\u0119pu do Twojego miejsca pracy. Wszystkie pro\u015Bby o do\u0142\u0105czenie do miejsca pracy pojawi\u0105 si\u0119 w',
                    secondPart: 'miejsce na Twoj\u0105 recenzj\u0119.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Po\u0142\u0105cz z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Utw\u00F3rz nowe po\u0142\u0105czenie',
            reuseExistingConnection: 'Ponownie u\u017Cyj istniej\u0105cego po\u0142\u0105czenia',
            existingConnections: 'Istniej\u0105ce po\u0142\u0105czenia',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Poniewa\u017C wcze\u015Bniej po\u0142\u0105czy\u0142e\u015B si\u0119 z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, mo\u017Cesz wybra\u0107 ponowne u\u017Cycie istniej\u0105cego po\u0142\u0105czenia lub utworzy\u0107 nowe.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Ostatnia synchronizacja ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) =>
                `Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z ${connectionName} z powodu b\u0142\u0119du uwierzytelniania`,
            learnMore: 'Dowiedz si\u0119 wi\u0119cej.',
            memberAlternateText: 'Cz\u0142onkowie mog\u0105 przesy\u0142a\u0107 i zatwierdza\u0107 raporty.',
            adminAlternateText: 'Administratorzy maj\u0105 pe\u0142ny dost\u0119p do edycji wszystkich raport\u00F3w i ustawie\u0144 przestrzeni roboczej.',
            auditorAlternateText: 'Audytorzy mog\u0105 przegl\u0105da\u0107 i komentowa\u0107 raporty.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Audytor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Cz\u0142onek';
                    default:
                        return 'Cz\u0142onek';
                }
            },
            frequency: {
                manual: 'R\u0119cznie',
                instant: 'Natychmiastowy',
                immediate: 'Codziennie',
                trip: 'Wed\u0142ug podr\u00F3\u017Cy',
                weekly: 'Tygodniowo',
                semimonthly: 'Dwa razy w miesi\u0105cu',
                monthly: 'Miesi\u0119czny',
            },
            planType: 'Typ planu',
            submitExpense: 'Prze\u015Blij swoje wydatki poni\u017Cej:',
            defaultCategory: 'Domy\u015Blna kategoria',
            viewTransactions: 'Wy\u015Bwietl transakcje',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Wydatki ${displayName}`,
        },
        perDiem: {
            subtitle: 'Ustaw stawki diety, aby kontrolowa\u0107 dzienne wydatki pracownik\u00F3w.',
            amount: 'Kwota',
            deleteRates: () => ({
                one: 'Usu\u0144 stawk\u0119',
                other: 'Usu\u0144 stawki',
            }),
            deletePerDiemRate: 'Usu\u0144 stawk\u0119 diety',
            findPerDiemRate: 'Znajd\u017A stawk\u0119 dzienn\u0105',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 stawk\u0119?',
                other: 'Czy na pewno chcesz usun\u0105\u0107 te stawki?',
            }),
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolowa\u0107 dzienne wydatki pracownik\u00F3w. Zaimportuj stawki z arkusza kalkulacyjnego, aby rozpocz\u0105\u0107.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Stawka o warto\u015Bci ${rate} ju\u017C istnieje`,
            },
            importPerDiemRates: 'Importuj stawki diety',
            editPerDiemRate: 'Edytuj stawk\u0119 diety',
            editPerDiemRates: 'Edytuj stawki diet',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Aktualizacja tego miejsca docelowego zmieni je dla wszystkich podstawek diet ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Aktualizacja tej waluty zmieni j\u0105 dla wszystkich podstawek diet ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw spos\u00F3b eksportowania wydatk\u00F3w z w\u0142asnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacz czeki jako \u201Ewydrukuj p\u00F3\u017Aniej\u201D',
            exportDescription: 'Skonfiguruj, jak dane z Expensify s\u0105 eksportowane do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje z karty Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie opublikowa\u0107 wpisy do dziennika.',
            accountsPayable: 'Zobowi\u0105zania p\u0142atnicze',
            accountsPayableDescription: 'Wybierz, gdzie utworzy\u0107 rachunki dostawcy.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, sk\u0105d wys\u0142a\u0107 czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            exportDate: {
                label: 'Data eksportu',
                description: 'U\u017Cyj tej daty podczas eksportowania raport\u00F3w do QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport zosta\u0142 wyeksportowany do QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data z\u0142o\u017Cenia',
                        description: 'Data, kiedy raport zosta\u0142 z\u0142o\u017Cony do zatwierdzenia.',
                    },
                },
            },
            exportCheckDescription: 'Utworzymy szczeg\u00F3\u0142owy czek dla ka\u017Cdego raportu Expensify i wy\u015Blemy go z poni\u017Cszego konta bankowego.',
            exportJournalEntryDescription: 'Stworzymy szczeg\u00F3\u0142owy wpis do dziennika dla ka\u017Cdego raportu Expensify i opublikujemy go na poni\u017Cszym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczeg\u00F3lnion\u0105 faktur\u0119 od dostawcy dla ka\u017Cdego raportu Expensify i dodamy j\u0105 do konta poni\u017Cej. Je\u015Bli ten okres jest zamkni\u0119ty, zaksi\u0119gujemy na 1. dzie\u0144 nast\u0119pnego otwartego okresu.',
            deepDiveExpensifyCard: 'Transakcje z karty Expensify b\u0119d\u0105 automatycznie eksportowane do "Expensify Card Liability Account" utworzonego z',
            deepDiveExpensifyCardIntegration: 'nasza integracja.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nie obs\u0142uguje podatk\u00F3w przy eksportach zapis\u00F3w ksi\u0119gowych. Poniewa\u017C masz w\u0142\u0105czone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedost\u0119pna.',
            outOfPocketTaxEnabledError: 'Dzienniki ksi\u0119gowe s\u0105 niedost\u0119pne, gdy podatki s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura dostawcy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wpis do dziennika',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawd\u017A',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Opis`]:
                    'Utworzymy szczeg\u00F3\u0142owy czek dla ka\u017Cdego raportu Expensify i wy\u015Blemy go z poni\u017Cszego konta bankowego.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Opis`]:
                    'Automatycznie dopasujemy nazw\u0119 sprzedawcy na transakcji kart\u0105 kredytow\u0105 do odpowiadaj\u0105cych im dostawc\u00F3w w QuickBooks. Je\u015Bli nie istniej\u0105 \u017Cadne dostawcy, utworzymy dostawc\u0119 \u201ECredit Card Misc.\u201D do powi\u0105zania.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Opis`]:
                    'Utworzymy wyszczeg\u00F3lnion\u0105 faktur\u0119 od dostawcy dla ka\u017Cdego raportu Expensify z dat\u0105 ostatniego wydatku i dodamy j\u0105 do konta poni\u017Cej. Je\u015Bli ten okres jest zamkni\u0119ty, zaksi\u0119gujemy na 1. dzie\u0144 nast\u0119pnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}OpisKonta`]: 'Wybierz miejsce eksportu transakcji kart\u0105 kredytow\u0105.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}OpisKonta`]:
                    'Wybierz dostawc\u0119, aby zastosowa\u0107 do wszystkich transakcji kart\u0105 kredytow\u0105.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}OpisKonta`]: 'Wybierz, sk\u0105d wys\u0142a\u0107 czeki.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}B\u0142\u0105d`]:
                    'Rachunki dostawc\u00F3w s\u0105 niedost\u0119pne, gdy lokalizacje s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}B\u0142\u0105d`]:
                    'Czeki s\u0105 niedost\u0119pne, gdy lokalizacje s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}B\u0142\u0105d`]:
                    'Dzienniki ksi\u0119gowe s\u0105 niedost\u0119pne, gdy podatki s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Desktop i ponownie zsynchronizuj po\u0142\u0105czenie.',
            qbdSetup: 'Konfiguracja QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z tego urz\u0105dzenia',
                body1: 'Musisz skonfigurowa\u0107 to po\u0142\u0105czenie z komputera, kt\u00F3ry hostuje plik firmowy QuickBooks Desktop.',
                body2: 'Po po\u0142\u0105czeniu b\u0119dziesz m\u00F3g\u0142 synchronizowa\u0107 i eksportowa\u0107 z dowolnego miejsca.',
            },
            setupPage: {
                title: 'Otw\u00F3rz ten link, aby si\u0119 po\u0142\u0105czy\u0107',
                body: 'Aby zako\u0144czy\u0107 konfiguracj\u0119, otw\u00F3rz poni\u017Cszy link na komputerze, na kt\u00F3rym dzia\u0142a QuickBooks Desktop.',
                setupErrorTitle: 'Co\u015B posz\u0142o nie tak',
                setupErrorBody1: 'Po\u0142\u0105czenie z QuickBooks Desktop nie dzia\u0142a w tej chwili. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej lub',
                setupErrorBody2: 'je\u015Bli problem b\u0119dzie si\u0119 powtarza\u0142.',
                setupErrorBodyContactConcierge: 'skontaktuj si\u0119 z Concierge',
            },
            importDescription: 'Wybierz, kt\u00F3re konfiguracje kodowania zaimportowa\u0107 z QuickBooks Desktop do Expensify.',
            classes: 'Klasy',
            items: 'Przedmioty',
            customers: 'Klienci/projekty',
            exportCompanyCardsDescription: 'Ustaw spos\u00F3b eksportowania zakup\u00F3w kart\u0105 firmow\u0105 do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domy\u015Blnego dostawc\u0119, kt\u00F3ry b\u0119dzie stosowany do wszystkich transakcji kart\u0105 kredytow\u0105 podczas eksportu.',
            accountsDescription: 'Tw\u00F3j wykres kont QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importowa\u0107 nowe konta jako w\u0142\u0105czone czy wy\u0142\u0105czone kategorie.',
            accountsSwitchDescription: 'W\u0142\u0105czone kategorie b\u0119d\u0105 dost\u0119pne dla cz\u0142onk\u00F3w do wyboru przy tworzeniu ich wydatk\u00F3w.',
            classesDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 klasy QuickBooks Desktop w Expensify.',
            tagsDisplayedAsDescription: 'Poziom pozycji faktury',
            reportFieldsDisplayedAsDescription: 'Poziom raportu',
            customersDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 klient\u00F3w/projekty QuickBooks Desktop w Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify b\u0119dzie automatycznie synchronizowa\u0107 si\u0119 z QuickBooks Desktop ka\u017Cdego dnia.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawc\u00F3w w QuickBooks Desktop, je\u015Bli jeszcze nie istniej\u0105.',
            },
            itemsDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 elementy QuickBooks Desktop w Expensify.',
        },
        qbo: {
            connectedTo: 'Po\u0142\u0105czono z',
            importDescription: 'Wybierz, kt\u00F3re konfiguracje kodowania zaimportowa\u0107 z QuickBooks Online do Expensify.',
            classes: 'Klasy',
            locations: 'Lokalizacje',
            customers: 'Klienci/projekty',
            accountsDescription: 'Tw\u00F3j wykaz kont QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importowa\u0107 nowe konta jako w\u0142\u0105czone czy wy\u0142\u0105czone kategorie.',
            accountsSwitchDescription: 'W\u0142\u0105czone kategorie b\u0119d\u0105 dost\u0119pne dla cz\u0142onk\u00F3w do wyboru przy tworzeniu ich wydatk\u00F3w.',
            classesDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 klasy QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 klient\u00F3w/projekty QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 lokalizacje QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 podatki QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nie obs\u0142uguje lokalizacji na poziomie linii dla czek\u00F3w lub rachunk\u00F3w dostawc\u00F3w. Je\u015Bli chcesz mie\u0107 lokalizacje na poziomie linii, upewnij si\u0119, \u017Ce u\u017Cywasz zapis\u00F3w ksi\u0119gowych i wydatk\u00F3w kart\u0105 kredytow\u0105/debetow\u0105.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online nie obs\u0142uguje podatk\u00F3w w zapisach ksi\u0119gowych. Prosz\u0119 zmieni\u0107 opcj\u0119 eksportu na faktur\u0119 od dostawcy lub czek.',
            exportDescription: 'Skonfiguruj, jak dane Expensify eksportuj\u0105 si\u0119 do QuickBooks Online.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje z karty Expensify jako',
            deepDiveExpensifyCard: 'Transakcje z karty Expensify b\u0119d\u0105 automatycznie eksportowane do "Expensify Card Liability Account" utworzonego z',
            deepDiveExpensifyCardIntegration: 'nasza integracja.',
            exportDate: {
                label: 'Data eksportu',
                description: 'U\u017Cyj tej daty podczas eksportowania raport\u00F3w do QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport zosta\u0142 wyeksportowany do QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data z\u0142o\u017Cenia',
                        description: 'Data, kiedy raport zosta\u0142 z\u0142o\u017Cony do zatwierdzenia.',
                    },
                },
            },
            receivable: 'Nale\u017Cno\u015Bci ksi\u0119gowe', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiwum nale\u017Cno\u015Bci', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'U\u017Cyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw, jak zakupy kart\u0105 firmow\u0105 eksportuj\u0105 si\u0119 do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domy\u015Blnego dostawc\u0119, kt\u00F3ry b\u0119dzie stosowany do wszystkich transakcji kart\u0105 kredytow\u0105 podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw, jak wydatki z w\u0142asnej kieszeni s\u0105 eksportowane do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy szczeg\u00F3\u0142owy czek dla ka\u017Cdego raportu Expensify i wy\u015Blemy go z poni\u017Cszego konta bankowego.',
            exportJournalEntryDescription: 'Stworzymy szczeg\u00F3\u0142owy wpis do dziennika dla ka\u017Cdego raportu Expensify i opublikujemy go na poni\u017Cszym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczeg\u00F3lnion\u0105 faktur\u0119 od dostawcy dla ka\u017Cdego raportu Expensify i dodamy j\u0105 do konta poni\u017Cej. Je\u015Bli ten okres jest zamkni\u0119ty, zaksi\u0119gujemy na 1. dzie\u0144 nast\u0119pnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie opublikowa\u0107 wpisy do dziennika.',
            accountsPayable: 'Zobowi\u0105zania p\u0142atnicze',
            accountsPayableDescription: 'Wybierz, gdzie utworzy\u0107 rachunki dostawcy.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, sk\u0105d wys\u0142a\u0107 czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nie obs\u0142uguje lokalizacji przy eksportach faktur od dostawc\u00F3w. Poniewa\u017C masz w\u0142\u0105czone lokalizacje w swoim obszarze roboczym, ta opcja eksportu jest niedost\u0119pna.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nie obs\u0142uguje podatk\u00F3w przy eksportach zapis\u00F3w ksi\u0119gowych. Poniewa\u017C masz w\u0142\u0105czone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedost\u0119pna.',
            outOfPocketTaxEnabledError: 'Dzienniki ksi\u0119gowe s\u0105 niedost\u0119pne, gdy podatki s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify b\u0119dzie automatycznie synchronizowa\u0107 si\u0119 z QuickBooks Online ka\u017Cdego dnia.',
                inviteEmployees: 'Zapro\u015B pracownik\u00F3w',
                inviteEmployeesDescription: 'Importuj dane pracownik\u00F3w z QuickBooks Online i zapro\u015B pracownik\u00F3w do tego miejsca pracy.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription:
                    'Expensify automatycznie utworzy dostawc\u00F3w w QuickBooks Online, je\u015Bli jeszcze nie istniej\u0105, oraz automatycznie utworzy klient\u00F3w podczas eksportowania faktur.',
                reimbursedReportsDescription:
                    'Za ka\u017Cdym razem, gdy raport jest op\u0142acany za pomoc\u0105 Expensify ACH, odpowiednia p\u0142atno\u015B\u0107 rachunku zostanie utworzona na koncie QuickBooks Online poni\u017Cej.',
                qboBillPaymentAccount: 'Konto do p\u0142atno\u015Bci rachunk\u00F3w QuickBooks',
                qboInvoiceCollectionAccount: 'Konto do zbierania faktur QuickBooks',
                accountSelectDescription: 'Wybierz, sk\u0105d chcesz op\u0142aci\u0107 rachunki, a my utworzymy p\u0142atno\u015B\u0107 w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywa\u0107 p\u0142atno\u015Bci za faktury, a my utworzymy p\u0142atno\u015B\u0107 w QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Karta debetowa',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wpis do dziennika',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawd\u017A',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Opis`]:
                    "Automatycznie dopasujemy nazw\u0119 sprzedawcy na transakcji kart\u0105 debetow\u0105 do odpowiadaj\u0105cych jej dostawc\u00F3w w QuickBooks. Je\u015Bli nie istniej\u0105 \u017Cadni dostawcy, utworzymy dostawc\u0119 'Debit Card Misc.' do powi\u0105zania.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Opis`]:
                    'Automatycznie dopasujemy nazw\u0119 sprzedawcy na transakcji kart\u0105 kredytow\u0105 do odpowiadaj\u0105cych im dostawc\u00F3w w QuickBooks. Je\u015Bli nie istniej\u0105 \u017Cadne dostawcy, utworzymy dostawc\u0119 \u201ECredit Card Misc.\u201D do powi\u0105zania.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Opis`]:
                    'Utworzymy wyszczeg\u00F3lnion\u0105 faktur\u0119 od dostawcy dla ka\u017Cdego raportu Expensify z dat\u0105 ostatniego wydatku i dodamy j\u0105 do konta poni\u017Cej. Je\u015Bli ten okres jest zamkni\u0119ty, zaksi\u0119gujemy na 1. dzie\u0144 nast\u0119pnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}OpisKonta`]: 'Wybierz miejsce eksportu transakcji kart\u0105 debetow\u0105.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}OpisKonta`]: 'Wybierz miejsce eksportu transakcji kart\u0105 kredytow\u0105.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}OpisKonta`]: 'Wybierz dostawc\u0119, aby zastosowa\u0107 do wszystkich transakcji kart\u0105 kredytow\u0105.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}B\u0142\u0105d`]:
                    'Rachunki dostawc\u00F3w s\u0105 niedost\u0119pne, gdy lokalizacje s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}B\u0142\u0105d`]:
                    'Czeki s\u0105 niedost\u0119pne, gdy lokalizacje s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}B\u0142\u0105d`]:
                    'Dzienniki ksi\u0119gowe s\u0105 niedost\u0119pne, gdy podatki s\u0105 w\u0142\u0105czone. Prosz\u0119 wybra\u0107 inn\u0105 opcj\u0119 eksportu.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wybierz prawid\u0142owe konto do eksportu faktury od dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wybierz prawid\u0142owe konto do eksportu wpisu do dziennika',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wybierz wa\u017Cne konto do eksportu czek\u00F3w',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Aby u\u017Cy\u0107 eksportu faktur od dostawc\u00F3w, skonfiguruj konto zobowi\u0105za\u0144 w QuickBooks Online.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Aby u\u017Cy\u0107 eksportu wpis\u00F3w do dziennika, skonfiguruj konto dziennika w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Aby u\u017Cy\u0107 eksportu czek\u00F3w, skonfiguruj konto bankowe w QuickBooks Online',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i ponownie zsynchronizuj po\u0142\u0105czenie.',
            accountingMethods: {
                label: 'Kiedy eksportowa\u0107',
                description: 'Wybierz, kiedy eksportowa\u0107 wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Rozliczenia mi\u0119dzyokresowe',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Got\u00F3wka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z w\u0142asnej kieszeni zostan\u0105 wyeksportowane po ostatecznym zatwierdzeniu',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z w\u0142asnej kieszeni zostan\u0105 wyeksportowane po op\u0142aceniu',
                },
            },
        },
        workspaceList: {
            joinNow: 'Do\u0142\u0105cz teraz',
            askToJoin: 'Popro\u015B o do\u0142\u0105czenie',
        },
        xero: {
            organization: 'Organizacja Xero',
            organizationDescription: 'Wybierz organizacj\u0119 Xero, z kt\u00F3rej chcesz zaimportowa\u0107 dane.',
            importDescription: 'Wybierz, kt\u00F3re konfiguracje kodowania zaimportowa\u0107 z Xero do Expensify.',
            accountsDescription: 'Tw\u00F3j wykaz kont Xero zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importowa\u0107 nowe konta jako w\u0142\u0105czone czy wy\u0142\u0105czone kategorie.',
            accountsSwitchDescription: 'W\u0142\u0105czone kategorie b\u0119d\u0105 dost\u0119pne dla cz\u0142onk\u00F3w do wyboru przy tworzeniu ich wydatk\u00F3w.',
            trackingCategories: 'Kategorie \u015Bledzenia',
            trackingCategoriesDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 kategorie \u015Bledzenia Xero w Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapuj Xero ${categoryName} do`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Wybierz, gdzie zmapowa\u0107 ${categoryName} podczas eksportu do Xero.`,
            customers: 'Ponownie obci\u0105\u017C klient\u00F3w',
            customersDescription:
                'Wybierz, czy ponownie obci\u0105\u017Cy\u0107 klient\u00F3w w Expensify. Twoje kontakty klient\u00F3w Xero mog\u0105 by\u0107 oznaczane przy wydatkach i zostan\u0105 wyeksportowane do Xero jako faktura sprzeda\u017Cowa.',
            taxesDescription: 'Wybierz, jak obs\u0142ugiwa\u0107 podatki Xero w Expensify.',
            notImported: 'Nie zaimportowano',
            notConfigured: 'Nieskonfigurowane',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Domy\u015Blny kontakt Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tagi',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Pola raportu',
            },
            exportDescription: 'Skonfiguruj, jak dane z Expensify s\u0105 eksportowane do Xero.',
            purchaseBill: 'Zakup faktury',
            exportDeepDiveCompanyCard:
                'Wyeksportowane wydatki zostan\u0105 zaksi\u0119gowane jako transakcje bankowe na poni\u017Cszym koncie bankowym Xero, a daty transakcji b\u0119d\u0105 zgodne z datami na wyci\u0105gu bankowym.',
            bankTransactions: 'Transakcje bankowe',
            xeroBankAccount: 'Konto bankowe Xero',
            xeroBankAccountDescription: 'Wybierz, gdzie wydatki b\u0119d\u0105 ksi\u0119gowane jako transakcje bankowe.',
            exportExpensesDescription: 'Raporty zostan\u0105 wyeksportowane jako faktura zakupu z dat\u0105 i statusem wybranym poni\u017Cej.',
            purchaseBillDate: 'Data zakupu faktury',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzeda\u017Cy',
            exportInvoicesDescription: 'Faktury sprzeda\u017Cy zawsze wy\u015Bwietlaj\u0105 dat\u0119, w kt\u00F3rej faktura zosta\u0142a wys\u0142ana.',
            advancedConfig: {
                autoSyncDescription: 'Expensify b\u0119dzie automatycznie synchronizowa\u0107 si\u0119 z Xero ka\u017Cdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription:
                    'Za ka\u017Cdym razem, gdy raport jest op\u0142acany za pomoc\u0105 Expensify ACH, odpowiednia p\u0142atno\u015B\u0107 rachunku zostanie utworzona na koncie Xero poni\u017Cej.',
                xeroBillPaymentAccount: 'Konto do p\u0142atno\u015Bci rachunk\u00F3w Xero',
                xeroInvoiceCollectionAccount: 'Konto do zbierania faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, sk\u0105d chcesz op\u0142aci\u0107 rachunki, a my utworzymy p\u0142atno\u015B\u0107 w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie otrzymywa\u0107 p\u0142atno\u015Bci za faktury, a my utworzymy p\u0142atno\u015B\u0107 w Xero.',
            },
            exportDate: {
                label: 'Data zakupu faktury',
                description: 'U\u017Cyj tej daty podczas eksportowania raport\u00F3w do Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport zosta\u0142 wyeksportowany do Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data z\u0142o\u017Cenia',
                        description: 'Data, kiedy raport zosta\u0142 z\u0142o\u017Cony do zatwierdzenia.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status rachunku zakupu',
                description: 'U\u017Cyj tego statusu podczas eksportowania rachunk\u00F3w zakupu do Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Szkic',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Oczekiwanie na zatwierdzenie',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Oczekiwanie na p\u0142atno\u015B\u0107',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Prosz\u0119 doda\u0107 konto w Xero i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.',
        },
        sageIntacct: {
            preferredExporter: 'Preferowany eksporter',
            taxSolution: 'Rozwi\u0105zanie podatkowe',
            notConfigured: 'Nieskonfigurowane',
            exportDate: {
                label: 'Data eksportu',
                description: 'U\u017Cyj tej daty podczas eksportowania raport\u00F3w do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport zosta\u0142 wyeksportowany do Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data z\u0142o\u017Cenia',
                        description: 'Data, kiedy raport zosta\u0142 z\u0142o\u017Cony do zatwierdzenia.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Ustaw spos\u00F3b eksportowania wydatk\u00F3w z w\u0142asnej kieszeni do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Raporty wydatk\u00F3w',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Rachunki dostawc\u00F3w',
                },
            },
            nonReimbursableExpenses: {
                description: 'Ustaw, jak zakupy kart\u0105 firmow\u0105 eksportuj\u0105 si\u0119 do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Karty kredytowe',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Rachunki dostawc\u00F3w',
                },
            },
            creditCardAccount: 'Konto karty kredytowej',
            defaultVendor: 'Domy\u015Blny dostawca',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Ustaw domy\u015Blnego dostawc\u0119, kt\u00F3ry b\u0119dzie stosowany do ${isReimbursable ? '' : 'non-'}wydatk\u00F3w podlegaj\u0105cych zwrotowi, kt\u00F3re nie maj\u0105 pasuj\u0105cego dostawcy w Sage Intacct.`,
            exportDescription: 'Skonfiguruj, jak dane z Expensify s\u0105 eksportowane do Sage Intacct.',
            exportPreferredExporterNote:
                'Preferowany eksporter mo\u017Ce by\u0107 dowolnym administratorem przestrzeni roboczej, ale musi by\u0107 r\u00F3wnie\u017C administratorem domeny, je\u015Bli ustawisz r\u00F3\u017Cne konta eksportu dla poszczeg\u00F3lnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy raporty do eksportu na swoim koncie.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: `Prosz\u0119 doda\u0107 konto w Sage Intacct i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.`,
            autoSync: 'Auto-synchronizacja',
            autoSyncDescription: 'Expensify b\u0119dzie automatycznie synchronizowa\u0107 si\u0119 z Sage Intacct ka\u017Cdego dnia.',
            inviteEmployees: 'Zapro\u015B pracownik\u00F3w',
            inviteEmployeesDescription:
                'Importuj dane pracownik\u00F3w Sage Intacct i zapro\u015B pracownik\u00F3w do tego miejsca pracy. Tw\u00F3j proces zatwierdzania b\u0119dzie domy\u015Blnie ustawiony na zatwierdzanie przez mened\u017Cera i mo\u017Ce by\u0107 dalej konfigurowany na stronie Cz\u0142onkowie.',
            syncReimbursedReports: 'Synchronizuj zrefundowane raporty',
            syncReimbursedReportsDescription:
                'Za ka\u017Cdym razem, gdy raport jest op\u0142acany za pomoc\u0105 Expensify ACH, odpowiednia p\u0142atno\u015B\u0107 rachunku zostanie utworzona na koncie Sage Intacct poni\u017Cej.',
            paymentAccount: 'Konto p\u0142atnicze Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Sp\u00F3\u0142ka zale\u017Cna',
            subsidiarySelectDescription: 'Wybierz sp\u00F3\u0142k\u0119 zale\u017Cn\u0105 w NetSuite, z kt\u00F3rej chcesz zaimportowa\u0107 dane.',
            exportDescription: 'Skonfiguruj, jak dane Expensify s\u0105 eksportowane do NetSuite.',
            exportInvoices: 'Eksportuj faktury do',
            journalEntriesTaxPostingAccount: 'Konta ksi\u0119gowa do ksi\u0119gowania podatku',
            journalEntriesProvTaxPostingAccount: 'Zapisy w dzienniku konto ksi\u0119gowania podatku prowincjonalnego',
            foreignCurrencyAmount: 'Eksportuj kwot\u0119 w walucie obcej',
            exportToNextOpenPeriod: 'Eksportuj do nast\u0119pnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto ksi\u0119gowania niepodlegaj\u0105ce zwrotowi',
            reimbursableJournalPostingAccount: 'Konto ksi\u0119gowania zwrot\u00F3w koszt\u00F3w',
            journalPostingPreference: {
                label: 'Preferencje ksi\u0119gowania zapis\u00F3w w dzienniku',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Pojedynczy, wyszczeg\u00F3lniony wpis dla ka\u017Cdego raportu',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Pojedynczy wpis dla ka\u017Cdego wydatku',
                },
            },
            invoiceItem: {
                label: 'Pozycja faktury',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Utw\u00F3rz dla mnie jeden',
                        description: 'Utworzymy "pozycj\u0119 faktury Expensify" dla Ciebie podczas eksportu (je\u015Bli jeszcze nie istnieje).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Wybierz istniej\u0105ce',
                        description: 'Po\u0142\u0105czymy faktury z Expensify z wybranym poni\u017Cej elementem.',
                    },
                },
            },
            exportDate: {
                label: 'Data eksportu',
                description: 'U\u017Cyj tej daty podczas eksportowania raport\u00F3w do NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport zosta\u0142 wyeksportowany do NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data z\u0142o\u017Cenia',
                        description: 'Data, kiedy raport zosta\u0142 z\u0142o\u017Cony do zatwierdzenia.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Raporty wydatk\u00F3w',
                        reimbursableDescription: 'Wydatki z w\u0142asnej kieszeni zostan\u0105 wyeksportowane jako raporty wydatk\u00F3w do NetSuite.',
                        nonReimbursableDescription: 'Wydatki na firmowe karty zostan\u0105 wyeksportowane jako raporty wydatk\u00F3w do NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Rachunki dostawc\u00F3w',
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
                        label: 'Zapisy w dzienniku',
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
                autoSyncDescription: 'Expensify b\u0119dzie automatycznie synchronizowa\u0107 si\u0119 z NetSuite ka\u017Cdego dnia.',
                reimbursedReportsDescription:
                    'Za ka\u017Cdym razem, gdy raport jest op\u0142acany za pomoc\u0105 Expensify ACH, odpowiednia p\u0142atno\u015B\u0107 rachunku zostanie utworzona na poni\u017Cszym koncie NetSuite.',
                reimbursementsAccount: 'Konto zwrot\u00F3w',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, kt\u00F3rego u\u017Cyjesz do zwrot\u00F3w, a my utworzymy powi\u0105zan\u0105 p\u0142atno\u015B\u0107 w NetSuite.',
                collectionsAccount: 'Konto windykacyjne',
                collectionsAccountDescription: 'Gdy faktura zostanie oznaczona jako op\u0142acona w Expensify i wyeksportowana do NetSuite, pojawi si\u0119 na poni\u017Cszym koncie.',
                approvalAccount: 'Konto zatwierdzania A/P',
                approvalAccountDescription:
                    'Wybierz konto, wzgl\u0119dem kt\u00F3rego transakcje b\u0119d\u0105 zatwierdzane w NetSuite. Je\u015Bli synchronizujesz raporty zwr\u00F3cone, to r\u00F3wnie\u017C jest konto, wzgl\u0119dem kt\u00F3rego b\u0119d\u0105 tworzone p\u0142atno\u015Bci rachunk\u00F3w.',
                defaultApprovalAccount: 'NetSuite default',
                inviteEmployees: 'Zapro\u015B pracownik\u00F3w i ustaw zatwierdzenia',
                inviteEmployeesDescription:
                    'Importuj rekordy pracownik\u00F3w NetSuite i zapro\u015B pracownik\u00F3w do tego miejsca pracy. Tw\u00F3j przep\u0142yw zatwierdzania domy\u015Blnie b\u0119dzie oparty na zatwierdzeniu przez mened\u017Cera i mo\u017Cna go dalej konfigurowa\u0107 na stronie *Cz\u0142onkowie*.',
                autoCreateEntities: 'Automatyczne tworzenie pracownik\u00F3w/dostawc\u00F3w',
                enableCategories: 'W\u0142\u0105cz nowo zaimportowane kategorie',
                customFormID: 'Niestandardowy identyfikator formularza',
                customFormIDDescription:
                    'Domy\u015Blnie Expensify utworzy wpisy, u\u017Cywaj\u0105c preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie, mo\u017Cesz wyznaczy\u0107 konkretny formularz transakcji do u\u017Cycia.',
                customFormIDReimbursable: 'Wydatek z w\u0142asnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek na firmow\u0105 kart\u0119',
                exportReportsTo: {
                    label: 'Poziom zatwierdzenia raportu wydatk\u00F3w',
                    description:
                        'Po zatwierdzeniu raportu wydatk\u00F3w w Expensify i wyeksportowaniu go do NetSuite, mo\u017Cesz ustawi\u0107 dodatkowy poziom zatwierdzenia w NetSuite przed zaksi\u0119gowaniem.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Domy\u015Blne preferencje NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Tylko zatwierdzone przez prze\u0142o\u017Conego',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Tylko ksi\u0119gowo\u015B\u0107 zatwierdzona',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Nadzorca i ksi\u0119gowo\u015B\u0107 zatwierdzili',
                    },
                },
                accountingMethods: {
                    label: 'Kiedy eksportowa\u0107',
                    description: 'Wybierz, kiedy eksportowa\u0107 wydatki:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Rozliczenia mi\u0119dzyokresowe',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Got\u00F3wka',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z w\u0142asnej kieszeni zostan\u0105 wyeksportowane po ostatecznym zatwierdzeniu',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z w\u0142asnej kieszeni zostan\u0105 wyeksportowane po op\u0142aceniu',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Poziom zatwierdzenia rachunku dostawcy',
                    description:
                        'Po zatwierdzeniu faktury dostawcy w Expensify i wyeksportowaniu jej do NetSuite, mo\u017Cesz ustawi\u0107 dodatkowy poziom zatwierdzenia w NetSuite przed zaksi\u0119gowaniem.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Domy\u015Blne preferencje NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zatwierdzono do publikacji',
                    },
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzenia wpisu w dzienniku',
                    description:
                        'Po zatwierdzeniu wpisu do dziennika w Expensify i wyeksportowaniu go do NetSuite, mo\u017Cna ustawi\u0107 dodatkowy poziom zatwierdzenia w NetSuite przed zaksi\u0119gowaniem.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Domy\u015Blne preferencje NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zatwierdzono do publikacji',
                    },
                },
                error: {
                    customFormID: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numeryczny identyfikator niestandardowego formularza',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Prosz\u0119 doda\u0107 konto w NetSuite i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.',
            noVendorsFound: 'Nie znaleziono dostawc\u00F3w',
            noVendorsFoundDescription: 'Prosz\u0119 doda\u0107 dostawc\u00F3w w NetSuite i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.',
            noItemsFound: 'Nie znaleziono pozycji faktury',
            noItemsFoundDescription: 'Prosz\u0119 doda\u0107 pozycje faktury w NetSuite i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.',
            noSubsidiariesFound: 'Nie znaleziono sp\u00F3\u0142ek zale\u017Cnych',
            noSubsidiariesFoundDescription: 'Prosz\u0119 doda\u0107 fili\u0119 w NetSuite i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.',
            tokenInput: {
                title: 'Konfiguracja NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Zainstaluj pakiet Expensify',
                        description: 'W NetSuite przejd\u017A do *Customization > SuiteBundler > Search & Install Bundles* > wyszukaj "Expensify" > zainstaluj pakiet.',
                    },
                    enableTokenAuthentication: {
                        title: 'W\u0142\u0105cz uwierzytelnianie oparte na tokenach',
                        description: 'W NetSuite przejd\u017A do *Setup > Company > Enable Features > SuiteCloud* > w\u0142\u0105cz *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'W\u0142\u0105cz us\u0142ugi sieciowe SOAP',
                        description: 'W NetSuite, przejd\u017A do *Setup > Company > Enable Features > SuiteCloud* > w\u0142\u0105cz *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Utw\u00F3rz token dost\u0119pu',
                        description:
                            'W NetSuite przejd\u017A do *Setup > Users/Roles > Access Tokens* > utw\u00F3rz token dost\u0119pu dla aplikacji "Expensify" i roli "Expensify Integration" lub "Administrator".\n\n*Wa\u017Cne:* Upewnij si\u0119, \u017Ce zapiszesz *Token ID* i *Token Secret* z tego kroku. B\u0119dziesz ich potrzebowa\u0107 w nast\u0119pnym kroku.',
                    },
                    enterCredentials: {
                        title: 'Wprowad\u017A swoje dane logowania do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'W NetSuite, przejd\u017A do *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Kategorie wydatk\u00F3w',
                expenseCategoriesDescription: 'Twoje kategorie wydatk\u00F3w NetSuite zostan\u0105 zaimportowane do Expensify jako kategorie.',
                crossSubsidiaryCustomers: 'Klienci/projekty mi\u0119dzy oddzia\u0142ami',
                importFields: {
                    departments: {
                        title: 'Dzia\u0142y',
                        subtitle: 'Wybierz, jak obs\u0142ugiwa\u0107 *dzia\u0142y* NetSuite w Expensify.',
                    },
                    classes: {
                        title: 'Klasy',
                        subtitle: 'Wybierz, jak obs\u0142ugiwa\u0107 *klasy* w Expensify.',
                    },
                    locations: {
                        title: 'Lokalizacje',
                        subtitle: 'Wybierz, jak obs\u0142ugiwa\u0107 *lokalizacje* w Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Klienci/projekty',
                    subtitle: 'Wybierz, jak obs\u0142ugiwa\u0107 *klient\u00F3w* i *projekty* NetSuite w Expensify.',
                    importCustomers: 'Importuj klient\u00F3w',
                    importJobs: 'Importuj projekty',
                    customers: 'klienci',
                    jobs: 'projekty',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('i')}, ${importType}`,
                },
                importTaxDescription: 'Importuj grupy podatkowe z NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wybierz jedn\u0105 z poni\u017Cszych opcji:',
                    label: ({importedTypes}: ImportedTypesParams) => `Zaimportowano jako ${importedTypes.join('i')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Prosz\u0119 wprowadzi\u0107 ${fieldName}`,
                    customSegments: {
                        title: 'Niestandardowe segmenty/rekordy',
                        addText: 'Dodaj niestandardowy segment/rekord',
                        recordTitle: 'Niestandardowy segment/rekord',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Zobacz szczeg\u00F3\u0142owe instrukcje',
                        helpText: 'w konfigurowaniu niestandardowych segment\u00F3w/rekord\u00F3w.',
                        emptyTitle: 'Dodaj niestandardowy segment lub niestandardowy rekord',
                        fields: {
                            segmentName: 'Nazwa',
                            internalID: 'Identyfikator wewn\u0119trzny',
                            scriptID: 'ID skryptu',
                            customRecordScriptID: 'ID kolumny transakcji',
                            mapping: 'Wy\u015Bwietlane jako',
                        },
                        removeTitle: 'Usu\u0144 niestandardowy segment/rekord',
                        removePrompt: 'Czy na pewno chcesz usun\u0105\u0107 ten niestandardowy segment/rekord?',
                        addForm: {
                            customSegmentName: 'niestandardowa nazwa segmentu',
                            customRecordName: 'nazwa rekordu niestandardowego',
                            segmentTitle: 'Niestandardowy segment',
                            customSegmentAddTitle: 'Dodaj niestandardowy segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Niestandardowy rekord',
                            segmentRecordType: 'Czy chcesz doda\u0107 niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa niestandardowego segmentu?',
                            customRecordNameTitle: 'Jaka jest nazwa niestandardowego rekordu?',
                            customSegmentNameFooter: `Mo\u017Cesz znale\u017A\u0107 niestandardowe nazwy segment\u00F3w w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Mo\u017Cesz znale\u017A\u0107 niestandardowe nazwy rekord\u00F3w w NetSuite, wpisuj\u0105c "Transaction Column Field" w globalnym wyszukiwaniu.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Jaki jest wewn\u0119trzny identyfikator?',
                            customSegmentInternalIDFooter: `Najpierw upewnij si\u0119, \u017Ce w\u0142\u0105czy\u0142e\u015B wewn\u0119trzne identyfikatory w NetSuite w sekcji *Home > Set Preferences > Show Internal ID.*\n\nMo\u017Cesz znale\u017A\u0107 wewn\u0119trzne identyfikatory segment\u00F3w niestandardowych w NetSuite w:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Kliknij w segment niestandardowy.\n3. Kliknij hiper\u0142\u0105cze obok *Custom Record Type*.\n4. Znajd\u017A wewn\u0119trzny identyfikator w tabeli na dole.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Mo\u017Cesz znale\u017A\u0107 wewn\u0119trzne identyfikatory rekord\u00F3w niestandardowych w NetSuite, wykonuj\u0105c nast\u0119puj\u0105ce kroki:\n\n1. Wpisz "Transaction Line Fields" w wyszukiwarce globalnej.\n2. Kliknij w rekord niestandardowy.\n3. Znajd\u017A wewn\u0119trzny identyfikator po lewej stronie.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Jaki jest identyfikator skryptu?',
                            customSegmentScriptIDFooter: `Mo\u017Cesz znale\u017A\u0107 identyfikatory skrypt\u00F3w segment\u00F3w niestandardowych w NetSuite w:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Kliknij w segment niestandardowy.\n3. Kliknij kart\u0119 *Application and Sourcing* na dole, a nast\u0119pnie:\n    a. Je\u015Bli chcesz wy\u015Bwietli\u0107 segment niestandardowy jako *tag* (na poziomie pozycji) w Expensify, kliknij podkart\u0119 *Transaction Columns* i u\u017Cyj *Field ID*.\n    b. Je\u015Bli chcesz wy\u015Bwietli\u0107 segment niestandardowy jako *report field* (na poziomie raportu) w Expensify, kliknij podkart\u0119 *Transactions* i u\u017Cyj *Field ID*.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Jaki jest identyfikator kolumny transakcji?',
                            customRecordScriptIDFooter: `Mo\u017Cesz znale\u017A\u0107 niestandardowe identyfikatory skrypt\u00F3w rekord\u00F3w w NetSuite w nast\u0119puj\u0105cy spos\u00F3b:\n\n1. Wpisz "Transaction Line Fields" w globalnej wyszukiwarce.\n2. Kliknij w niestandardowy rekord.\n3. Znajd\u017A identyfikator skryptu po lewej stronie.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Jak ten niestandardowy segment powinien by\u0107 wy\u015Bwietlany w Expensify?',
                            customRecordMappingTitle: 'Jak ten niestandardowy rekord powinien by\u0107 wy\u015Bwietlany w Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Niestandardowy segment/rekord z tym ${fieldName?.toLowerCase()} ju\u017C istnieje`,
                        },
                    },
                    customLists: {
                        title: 'Listy niestandardowe',
                        addText: 'Dodaj list\u0119 niestandardow\u0105',
                        recordTitle: 'Lista niestandardowa',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Zobacz szczeg\u00F3\u0142owe instrukcje',
                        helpText: 'na konfigurowaniu list niestandardowych.',
                        emptyTitle: 'Dodaj list\u0119 niestandardow\u0105',
                        fields: {
                            listName: 'Nazwa',
                            internalID: 'Identyfikator wewn\u0119trzny',
                            transactionFieldID: 'ID pola transakcji',
                            mapping: 'Wy\u015Bwietlane jako',
                        },
                        removeTitle: 'Usu\u0144 niestandardow\u0105 list\u0119',
                        removePrompt: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 list\u0119 niestandardow\u0105?',
                        addForm: {
                            listNameTitle: 'Wybierz list\u0119 niestandardow\u0105',
                            transactionFieldIDTitle: 'Jaki jest identyfikator pola transakcji?',
                            transactionFieldIDFooter: `Mo\u017Cesz znale\u017A\u0107 identyfikatory p\u00F3l transakcji w NetSuite, wykonuj\u0105c nast\u0119puj\u0105ce kroki:\n\n1. Wpisz "Transaction Line Fields" w globalnym wyszukiwaniu.\n2. Kliknij na niestandardow\u0105 list\u0119.\n3. Znajd\u017A identyfikator pola transakcji po lewej stronie.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Jak powinna by\u0107 wy\u015Bwietlana ta lista niestandardowa w Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Lista niestandardowa z tym identyfikatorem pola transakcji ju\u017C istnieje`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Domy\u015Blne ustawienie pracownika NetSuite',
                        description: 'Nie zaimportowane do Expensify, zastosowane przy eksporcie',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Je\u015Bli u\u017Cywasz ${importField} w NetSuite, zastosujemy domy\u015Blne ustawienia na karcie pracownika podczas eksportu do Raportu Wydatk\u00F3w lub Zapis\u00F3w w Dzienniku.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tagi',
                        description: 'Poziom pozycji faktury',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} b\u0119dzie mo\u017Cna wybra\u0107 dla ka\u017Cdego indywidualnego wydatku w raporcie pracownika.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Pola raportu',
                        description: 'Poziom raportu',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} wyb\u00F3r b\u0119dzie dotyczy\u0142 wszystkich wydatk\u00F3w w raporcie pracownika.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Konfiguracja Sage Intacct',
            prerequisitesTitle: 'Zanim si\u0119 po\u0142\u0105czysz...',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Post\u0119puj zgodnie z krokami w naszym przewodniku Jak po\u0142\u0105czy\u0107 si\u0119 z Sage Intacct.',
            enterCredentials: 'Wprowad\u017A swoje dane logowania do Sage Intacct',
            entity: 'Entity',
            employeeDefault: 'Domy\u015Blne ustawienie pracownika Sage Intacct',
            employeeDefaultDescription: 'Domy\u015Blny dzia\u0142 pracownika zostanie zastosowany do jego wydatk\u00F3w w Sage Intacct, je\u015Bli istnieje.',
            displayedAsTagDescription: 'Dzia\u0142 b\u0119dzie mo\u017Cna wybra\u0107 dla ka\u017Cdego indywidualnego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wyb\u00F3r dzia\u0142u b\u0119dzie dotyczy\u0142 wszystkich wydatk\u00F3w w raporcie pracownika.',
            toggleImportTitleFirstPart: 'Wybierz, jak obs\u0142ugiwa\u0107 Sage Intacct',
            toggleImportTitleSecondPart: 'w Expensify.',
            expenseTypes: 'Typy wydatk\u00F3w',
            expenseTypesDescription: 'Twoje typy wydatk\u00F3w Sage Intacct zostan\u0105 zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Tw\u00F3j plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Importuj stawk\u0119 podatku od zakupu z Sage Intacct.',
            userDefinedDimensions: 'Wymiary zdefiniowane przez u\u017Cytkownika',
            addUserDefinedDimension: 'Dodaj zdefiniowany przez u\u017Cytkownika wymiar',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie ju\u017C istnieje.',
            removeDimension: 'Usu\u0144 zdefiniowany przez u\u017Cytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usun\u0105\u0107 ten zdefiniowany przez u\u017Cytkownika wymiar?',
            userDefinedDimension: 'Zdefiniowany przez u\u017Cytkownika wymiar',
            addAUserDefinedDimension: 'Dodaj zdefiniowany przez u\u017Cytkownika wymiar',
            detailedInstructionsLink: 'Zobacz szczeg\u00F3\u0142owe instrukcje',
            detailedInstructionsRestOfSentence: 'na dodawaniu wymiar\u00F3w zdefiniowanych przez u\u017Cytkownika.',
            userDimensionsAdded: () => ({
                one: '1 UDD dodany',
                other: (count: number) => `Dodano ${count} UDDs`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'dzia\u0142y';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'klasy';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'lokalizacje';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'klienci';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projekty (prace)';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: 'Darmowy',
            control: 'Kontrola',
            collect: 'Zbierz',
        },
        companyCards: {
            addCards: 'Dodaj karty',
            selectCards: 'Wybierz karty',
            addNewCard: {
                other: 'Inne',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Karty Stripe',
                },
                yourCardProvider: `Kto jest dostawc\u0105 Twojej karty?`,
                whoIsYourBankAccount: 'Jaki jest Tw\u00F3j bank?',
                whereIsYourBankLocated: 'Gdzie znajduje si\u0119 Tw\u00F3j bank?',
                howDoYouWantToConnect: 'Jak chcesz po\u0142\u0105czy\u0107 si\u0119 ze swoim bankiem?',
                learnMoreAboutOptions: {
                    text: 'Dowiedz si\u0119 wi\u0119cej na ten temat',
                    linkText: 'options.',
                },
                commercialFeedDetails:
                    'Wymaga konfiguracji z Twoim bankiem. Zazwyczaj jest u\u017Cywane przez wi\u0119ksze firmy i cz\u0119sto jest najlepsz\u0105 opcj\u0105, je\u015Bli si\u0119 kwalifikujesz.',
                commercialFeedPlaidDetails: `Wymaga konfiguracji z Twoim bankiem, ale poprowadzimy Ci\u0119 przez to. Zazwyczaj jest to ograniczone do wi\u0119kszych firm.`,
                directFeedDetails:
                    'Najprostsze podej\u015Bcie. Po\u0142\u0105cz si\u0119 od razu, u\u017Cywaj\u0105c swoich g\u0142\u00F3wnych danych uwierzytelniaj\u0105cych. Ta metoda jest najcz\u0119\u015Bciej stosowana.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `W\u0142\u0105cz sw\u00F3j kana\u0142 ${provider}`,
                    heading:
                        'Mamy bezpo\u015Bredni\u0105 integracj\u0119 z wydawc\u0105 Twojej karty i mo\u017Cemy szybko i dok\u0142adnie zaimportowa\u0107 dane transakcji do Expensify.\n\nAby rozpocz\u0105\u0107, po prostu:',
                    visa: 'Mamy globalne integracje z Visa, chocia\u017C kwalifikowalno\u015B\u0107 zale\u017Cy od banku i programu karty.\n\nAby rozpocz\u0105\u0107, po prostu:',
                    mastercard:
                        'Mamy globalne integracje z Mastercard, chocia\u017C kwalifikowalno\u015B\u0107 zale\u017Cy od banku i programu karty.\n\nAby rozpocz\u0105\u0107, wystarczy:',
                    vcf: `1. Odwied\u017A [ten artyku\u0142 pomocy](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) aby uzyska\u0107 szczeg\u00F3\u0142owe instrukcje dotycz\u0105ce konfiguracji kart Visa Commercial.\n\n2. [Skontaktuj si\u0119 z bankiem](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) aby zweryfikowa\u0107, czy obs\u0142uguj\u0105 komercyjny kana\u0142 dla Twojego programu, i popro\u015B o jego w\u0142\u0105czenie.\n\n3. *Gdy kana\u0142 zostanie w\u0142\u0105czony i b\u0119dziesz mie\u0107 jego szczeg\u00F3\u0142y, przejd\u017A do nast\u0119pnego ekranu.*`,
                    gl1025: `1. Odwied\u017A [ten artyku\u0142 pomocy](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), aby dowiedzie\u0107 si\u0119, czy American Express mo\u017Ce w\u0142\u0105czy\u0107 komercyjny kana\u0142 dla Twojego programu.\n\n2. Gdy kana\u0142 zostanie w\u0142\u0105czony, Amex wy\u015Ble Ci list produkcyjny.\n\n3. *Gdy ju\u017C b\u0119dziesz mie\u0107 informacje o kanale, przejd\u017A do nast\u0119pnego ekranu.*`,
                    cdf: `1. Odwied\u017A [ten artyku\u0142 pomocy](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) po szczeg\u00F3\u0142owe instrukcje dotycz\u0105ce konfiguracji kart Mastercard Commercial Cards.\n\n2. [Skontaktuj si\u0119 z bankiem](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby zweryfikowa\u0107, czy obs\u0142uguj\u0105 komercyjny feed dla Twojego programu, i popro\u015B o jego w\u0142\u0105czenie.\n\n3. *Gdy feed zostanie w\u0142\u0105czony i b\u0119dziesz mie\u0107 jego szczeg\u00F3\u0142y, przejd\u017A do nast\u0119pnego ekranu.*`,
                    stripe: `1. Odwied\u017A Stripe\u2019s Dashboard i przejd\u017A do [Ustawienia](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. W sekcji Integracje Produkt\u00F3w kliknij W\u0142\u0105cz obok Expensify.\n\n3. Gdy kana\u0142 zostanie w\u0142\u0105czony, kliknij Prze\u015Blij poni\u017Cej, a my zajmiemy si\u0119 jego dodaniem.`,
                },
                whatBankIssuesCard: 'Kt\u00F3ry bank wydaje te karty?',
                enterNameOfBank: 'Wprowad\u017A nazw\u0119 banku',
                feedDetails: {
                    vcf: {
                        title: 'Jakie s\u0105 szczeg\u00F3\u0142y dotycz\u0105ce po\u0142\u0105czenia z Visa?',
                        processorLabel: 'ID procesora',
                        bankLabel: 'Identyfikator instytucji finansowej (banku)',
                        companyLabel: 'Company ID',
                        helpLabel: 'Gdzie mog\u0119 znale\u017A\u0107 te identyfikatory?',
                    },
                    gl1025: {
                        title: `Jaka jest nazwa pliku dostawy Amex?`,
                        fileNameLabel: 'Nazwa pliku dostawy',
                        helpLabel: 'Gdzie znajd\u0119 nazw\u0119 pliku dostawy?',
                    },
                    cdf: {
                        title: `Jaki jest identyfikator dystrybucji Mastercard?`,
                        distributionLabel: 'ID dystrybucji',
                        helpLabel: 'Gdzie mog\u0119 znale\u017A\u0107 identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz to, je\u015Bli prz\u00F3d twoich kart ma napis \u201ECorporate\u201D',
                amexBusiness: 'Wybierz to, je\u015Bli na przodzie twoich kart jest napis \u201EBusiness\u201D',
                amexPersonal: 'Wybierz to, je\u015Bli Twoje karty s\u0105 osobiste',
                error: {
                    pleaseSelectProvider: 'Prosz\u0119 wybra\u0107 dostawc\u0119 karty przed kontynuowaniem',
                    pleaseSelectBankAccount: 'Prosz\u0119 wybra\u0107 konto bankowe przed kontynuowaniem',
                    pleaseSelectBank: 'Prosz\u0119 wybra\u0107 bank przed kontynuacj\u0105',
                    pleaseSelectCountry: 'Prosz\u0119 wybra\u0107 kraj przed kontynuowaniem',
                    pleaseSelectFeedType: 'Prosz\u0119 wybra\u0107 typ kana\u0142u przed kontynuowaniem',
                },
            },
            assignCard: 'Przypisz kart\u0119',
            findCard: 'Znajd\u017A kart\u0119',
            cardNumber: 'Numer karty',
            commercialFeed: 'Kana\u0142 komercyjny',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `karty ${feedName}`,
            directFeed: 'Bezpo\u015Bredni kana\u0142',
            whoNeedsCardAssigned: 'Kto potrzebuje przypisanej karty?',
            chooseCard: 'Wybierz kart\u0119',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Wybierz kart\u0119 dla ${assignee} z kana\u0142u kart ${feed}.`,
            noActiveCards: 'Brak aktywnych kart w tym kanale',
            somethingMightBeBroken: 'Albo co\u015B mo\u017Ce by\u0107 zepsute. Tak czy inaczej, je\u015Bli masz jakie\u015B pytania, po prostu',
            contactConcierge: 'skontaktuj si\u0119 z Concierge',
            chooseTransactionStartDate: 'Wybierz dat\u0119 pocz\u0105tkow\u0105 transakcji',
            startDateDescription: 'Zaimportujemy wszystkie transakcje od tej daty. Je\u015Bli nie okre\u015Blono daty, si\u0119gniemy tak daleko wstecz, jak pozwala na to Tw\u00F3j bank.',
            fromTheBeginning: 'Od pocz\u0105tku',
            customStartDate: 'Niestandardowa data rozpocz\u0119cia',
            letsDoubleCheck: 'Sprawd\u017Amy jeszcze raz, czy wszystko wygl\u0105da dobrze.',
            confirmationDescription: 'Natychmiast rozpoczniemy importowanie transakcji.',
            cardholder: 'Posiadacz karty',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionErrorFirstPart: `Po\u0142\u0105czenie z kana\u0142em kart jest przerwane. Prosz\u0119`,
            brokenConnectionErrorLink: 'zaloguj si\u0119 do swojego banku',
            brokenConnectionErrorSecondPart: 'aby\u015Bmy mogli ponownie nawi\u0105za\u0107 po\u0142\u0105czenie.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `przypisano ${assignee} ${link}! Zaimportowane transakcje pojawi\u0105 si\u0119 w tym czacie.`,
            companyCard: 'karta firmowa',
            chooseCardFeed: 'Wybierz kana\u0142 kart',
            ukRegulation:
                'Expensify Limited jest agentem Plaid Financial Ltd., autoryzowanej instytucji p\u0142atniczej regulowanej przez Financial Conduct Authority zgodnie z Payment Services Regulations 2017 (Numer referencyjny firmy: 804718). Plaid zapewnia Ci regulowane us\u0142ugi informacyjne dotycz\u0105ce konta za po\u015Brednictwem Expensify Limited jako swojego agenta.',
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarz\u0105dzaj swoimi kartami Expensify',
            getStartedIssuing: 'Rozpocznij, wydaj\u0105c swoj\u0105 pierwsz\u0105 wirtualn\u0105 lub fizyczn\u0105 kart\u0119.',
            verificationInProgress: 'Weryfikacja w toku...',
            verifyingTheDetails: 'Weryfikujemy kilka szczeg\u00F3\u0142\u00F3w. Concierge poinformuje Ci\u0119, gdy karty Expensify b\u0119d\u0105 gotowe do wydania.',
            disclaimer:
                'Karta Expensify Visa\u00AE Commercial jest wydawana przez The Bancorp Bank, N.A., cz\u0142onka FDIC, na podstawie licencji od Visa U.S.A. Inc. i mo\u017Ce nie by\u0107 akceptowana u wszystkich sprzedawc\u00F3w, kt\u00F3rzy przyjmuj\u0105 karty Visa. Apple\u00AE i logo Apple\u00AE s\u0105 znakami towarowymi Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem us\u0142ugowym Apple Inc. Google Play i logo Google Play s\u0105 znakami towarowymi Google LLC.',
            issueCard: 'Wydaj kart\u0119',
            findCard: 'Znajd\u017A kart\u0119',
            newCard: 'Nowa karta',
            name: 'Nazwa',
            lastFour: 'Ostatnie 4',
            limit: 'Limit',
            currentBalance: 'Bie\u017C\u0105ce saldo',
            currentBalanceDescription:
                'Bie\u017C\u0105ce saldo to suma wszystkich zaksi\u0119gowanych transakcji kart\u0105 Expensify, kt\u00F3re mia\u0142y miejsce od ostatniej daty rozliczenia.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo zostanie rozliczone w dniu ${settlementDate}`,
            settleBalance: 'Ureguluj saldo',
            cardLimit: 'Limit karty',
            remainingLimit: 'Pozosta\u0142y limit',
            requestLimitIncrease: 'Zwi\u0119kszenie limitu \u017C\u0105da\u0144',
            remainingLimitDescription:
                'Bierzemy pod uwag\u0119 szereg czynnik\u00F3w przy obliczaniu Twojego pozosta\u0142ego limitu: Tw\u00F3j sta\u017C jako klienta, informacje zwi\u0105zane z biznesem, kt\u00F3re poda\u0142e\u015B podczas rejestracji, oraz dost\u0119pne \u015Brodki na Twoim firmowym koncie bankowym. Tw\u00F3j pozosta\u0142y limit mo\u017Ce zmienia\u0107 si\u0119 codziennie.',
            earnedCashback: 'Zwrot got\u00F3wki',
            earnedCashbackDescription: 'Saldo zwrotu got\u00F3wki opiera si\u0119 na rozliczonych miesi\u0119cznych wydatkach na karcie Expensify w ramach Twojego miejsca pracy.',
            issueNewCard: 'Wydaj now\u0105 kart\u0119',
            finishSetup: 'Zako\u0144cz konfiguracj\u0119',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniej\u0105ce firmowe konto bankowe, aby sp\u0142aci\u0107 saldo na karcie Expensify, lub dodaj nowe konto bankowe.',
            accountEndingIn: 'Konto ko\u0144cz\u0105ce si\u0119 na',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto, aby sp\u0142aci\u0107 saldo karty Expensify.',
            settlementAccountInfoPt1: 'Upewnij si\u0119, \u017Ce to konto pasuje do Twojego',
            settlementAccountInfoPt2: 'wi\u0119c Continuous Reconciliation dzia\u0142a prawid\u0142owo.',
            reconciliationAccount: 'Konto uzgadniaj\u0105ce',
            settlementFrequency: 'Cz\u0119stotliwo\u015B\u0107 rozlicze\u0144',
            settlementFrequencyDescription: 'Wybierz, jak cz\u0119sto b\u0119dziesz sp\u0142aca\u0107 saldo na karcie Expensify.',
            settlementFrequencyInfo:
                'Je\u015Bli chcesz przej\u015B\u0107 na miesi\u0119czne rozliczenie, musisz po\u0142\u0105czy\u0107 swoje konto bankowe za po\u015Brednictwem Plaid i mie\u0107 pozytywn\u0105 histori\u0119 salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesi\u0119czny',
            },
            cardDetails: 'Szczeg\u00F3\u0142y karty',
            virtual: 'Virtualny',
            physical: 'Fizyczny',
            deactivate: 'Dezaktywuj kart\u0119',
            changeCardLimit: 'Zmie\u0144 limit karty',
            changeLimit: 'Zmie\u0144 limit',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Je\u015Bli zmienisz limit tej karty na ${limit}, nowe transakcje b\u0119d\u0105 odrzucane, dop\u00F3ki nie zatwierdzisz wi\u0119cej wydatk\u00F3w na karcie.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `Je\u015Bli zmienisz limit tej karty na ${limit}, nowe transakcje b\u0119d\u0105 odrzucane do nast\u0119pnego miesi\u0105ca.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Je\u015Bli zmienisz limit tej karty na ${limit}, nowe transakcje zostan\u0105 odrzucone.`,
            changeCardLimitType: 'Zmie\u0144 typ limitu karty',
            changeLimitType: 'Zmie\u0144 typ limitu',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Je\u015Bli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostan\u0105 odrzucone, poniewa\u017C niezatwierdzony limit ${limit} zosta\u0142 ju\u017C osi\u0105gni\u0119ty.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Je\u015Bli zmienisz typ limitu tej karty na Miesi\u0119czny, nowe transakcje zostan\u0105 odrzucone, poniewa\u017C miesi\u0119czny limit ${limit} zosta\u0142 ju\u017C osi\u0105gni\u0119ty.`,
            addShippingDetails: 'Dodaj szczeg\u00F3\u0142y wysy\u0142ki',
            issuedCard: ({assignee}: AssigneeParams) => `wydano ${assignee} kart\u0119 Expensify! Karta dotrze w ci\u0105gu 2-3 dni roboczych.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `wydano ${assignee} kart\u0119 Expensify! Karta zostanie wys\u0142ana, gdy zostan\u0105 dodane szczeg\u00F3\u0142y wysy\u0142ki.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `wyda\u0142 ${assignee} wirtualn\u0105 ${link}! Karta mo\u017Ce by\u0107 u\u017Cyta od razu.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} doda\u0142 szczeg\u00F3\u0142y wysy\u0142ki. Karta Expensify dotrze w ci\u0105gu 2-3 dni roboczych.`,
            verifyingHeader: 'Weryfikacja',
            bankAccountVerifiedHeader: 'Konto bankowe zweryfikowane',
            verifyingBankAccount: 'Weryfikacja konta bankowego...',
            verifyingBankAccountDescription: 'Prosz\u0119 czeka\u0107, podczas gdy potwierdzamy, \u017Ce to konto mo\u017Ce by\u0107 u\u017Cywane do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zweryfikowane!',
            bankAccountVerifiedDescription: 'Mo\u017Cesz teraz wydawa\u0107 karty Expensify cz\u0142onkom swojego miejsca pracy.',
            oneMoreStep: 'Jeszcze jeden krok...',
            oneMoreStepDescription:
                'Wygl\u0105da na to, \u017Ce musimy r\u0119cznie zweryfikowa\u0107 Twoje konto bankowe. Przejd\u017A do Concierge, gdzie czekaj\u0105 na Ciebie instrukcje.',
            gotIt: 'Zrozumia\u0142em.',
            goToConcierge: 'Przejd\u017A do Concierge',
        },
        categories: {
            deleteCategories: 'Usu\u0144 kategorie',
            deleteCategoriesPrompt: 'Czy na pewno chcesz usun\u0105\u0107 te kategorie?',
            deleteCategory: 'Usu\u0144 kategori\u0119',
            deleteCategoryPrompt: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 kategori\u0119?',
            disableCategories: 'Wy\u0142\u0105cz kategorie',
            disableCategory: 'Wy\u0142\u0105cz kategori\u0119',
            enableCategories: 'W\u0142\u0105cz kategorie',
            enableCategory: 'W\u0142\u0105cz kategori\u0119',
            defaultSpendCategories: 'Domy\u015Blne kategorie wydatk\u00F3w',
            spendCategoriesDescription: 'Dostosuj spos\u00F3b kategoryzacji wydatk\u00F3w u sprzedawc\u00F3w dla transakcji kart\u0105 kredytow\u0105 i zeskanowanych paragon\u00F3w.',
            deleteFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas usuwania kategorii, spr\u00F3buj ponownie.',
            categoryName: 'Nazwa kategorii',
            requiresCategory: 'Cz\u0142onkowie musz\u0105 kategoryzowa\u0107 wszystkie wydatki',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Wszystkie wydatki musz\u0105 by\u0107 skategoryzowane, aby mo\u017Cna je by\u0142o wyeksportowa\u0107 do ${connectionName}.`,
            subtitle: 'Uzyskaj lepszy przegl\u0105d, gdzie wydawane s\u0105 pieni\u0105dze. U\u017Cyj naszych domy\u015Blnych kategorii lub dodaj w\u0142asne.',
            emptyCategories: {
                title: 'Nie utworzy\u0142e\u015B \u017Cadnych kategorii',
                subtitle: 'Dodaj kategori\u0119, aby zorganizowa\u0107 swoje wydatki.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Twoje kategorie s\u0105 obecnie importowane z po\u0142\u0105czenia ksi\u0119gowego. Przejd\u017A do',
                subtitle2: 'ksi\u0119gowo\u015B\u0107',
                subtitle3: 'aby wprowadzi\u0107 jakiekolwiek zmiany.',
            },
            updateFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji kategorii, spr\u00F3buj ponownie.',
            createFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas tworzenia kategorii, spr\u00F3buj ponownie.',
            addCategory: 'Dodaj kategori\u0119',
            editCategory: 'Edytuj kategori\u0119',
            editCategories: 'Edytuj kategorie',
            findCategory: 'Znajd\u017A kategori\u0119',
            categoryRequiredError: 'Nazwa kategorii jest wymagana',
            existingCategoryError: 'Kategoria o tej nazwie ju\u017C istnieje',
            invalidCategoryName: 'Nieprawid\u0142owa nazwa kategorii',
            importedFromAccountingSoftware: 'Kategorie poni\u017Cej s\u0105 importowane z Twojego',
            payrollCode: 'Kod p\u0142acowy',
            updatePayrollCodeFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji kodu p\u0142acowego, spr\u00F3buj ponownie.',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji kodu GL, spr\u00F3buj ponownie.',
            importCategories: 'Importuj kategorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Nie mo\u017Cna usun\u0105\u0107 ani wy\u0142\u0105czy\u0107 wszystkich kategorii',
                description: `Przynajmniej jedna kategoria musi pozosta\u0107 w\u0142\u0105czona, poniewa\u017C Twoje miejsce pracy wymaga kategorii.`,
            },
        },
        moreFeatures: {
            subtitle:
                'U\u017Cyj poni\u017Cszych prze\u0142\u0105cznik\u00F3w, aby w\u0142\u0105czy\u0107 wi\u0119cej funkcji w miar\u0119 rozwoju. Ka\u017Cda funkcja pojawi si\u0119 w menu nawigacyjnym do dalszej personalizacji.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'W\u0142\u0105cz funkcjonalno\u015B\u0107, kt\u00F3ra pomaga w rozwoju zespo\u0142u.',
            },
            manageSection: {
                title: 'Zarz\u0105dzaj',
                subtitle: 'Dodaj kontrolki, kt\u00F3re pomog\u0105 utrzyma\u0107 wydatki w ramach bud\u017Cetu.',
            },
            earnSection: {
                title: 'Zarabiaj',
                subtitle: 'Usprawnij swoje przychody i otrzymuj p\u0142atno\u015Bci szybciej.',
            },
            organizeSection: {
                title: 'Organizuj',
                subtitle: 'Grupuj i analizuj wydatki, rejestruj ka\u017Cdy zap\u0142acony podatek.',
            },
            integrateSection: {
                title: 'Zintegruj',
                subtitle: 'Po\u0142\u0105cz Expensify z popularnymi produktami finansowymi.',
            },
            distanceRates: {
                title: 'Stawki za odleg\u0142o\u015B\u0107',
                subtitle: 'Dodaj, zaktualizuj i egzekwuj stawki.',
            },
            perDiem: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diety, aby kontrolowa\u0107 dzienne wydatki pracownik\u00F3w.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Uzyskaj wgl\u0105d i kontrol\u0119 nad wydatkami.',
                disableCardTitle: 'Wy\u0142\u0105cz Expensify Card',
                disableCardPrompt:
                    'Nie mo\u017Cesz wy\u0142\u0105czy\u0107 karty Expensify, poniewa\u017C jest ju\u017C w u\u017Cyciu. Skontaktuj si\u0119 z Concierge, aby uzyska\u0107 dalsze instrukcje.',
                disableCardButton: 'Czat z Concierge',
                feed: {
                    title: 'Uzyskaj kart\u0119 Expensify',
                    subTitle: 'Usprawnij wydatki firmowe i zaoszcz\u0119d\u017A do 50% na rachunku Expensify, a ponadto:',
                    features: {
                        cashBack: 'Zwrot got\u00F3wki za ka\u017Cdy zakup w USA',
                        unlimited: 'Nieograniczone karty wirtualne',
                        spend: 'Kontrole wydatk\u00F3w i niestandardowe limity',
                    },
                    ctaTitle: 'Wydaj now\u0105 kart\u0119',
                },
            },
            companyCards: {
                title: 'Karty firmowe',
                subtitle: 'Importuj wydatki z istniej\u0105cych kart firmowych.',
                feed: {
                    title: 'Importuj karty firmowe',
                    features: {
                        support: 'Obs\u0142uga wszystkich g\u0142\u00F3wnych dostawc\u00F3w kart',
                        assignCards: 'Przypisz karty do ca\u0142ego zespo\u0142u',
                        automaticImport: 'Automatyczny import transakcji',
                    },
                },
                disableCardTitle: 'Wy\u0142\u0105cz karty firmowe',
                disableCardPrompt:
                    'Nie mo\u017Cesz wy\u0142\u0105czy\u0107 kart firmowych, poniewa\u017C ta funkcja jest w u\u017Cyciu. Skontaktuj si\u0119 z Concierge, aby uzyska\u0107 dalsze instrukcje.',
                disableCardButton: 'Czat z Concierge',
                cardDetails: 'Szczeg\u00F3\u0142y karty',
                cardNumber: 'Numer karty',
                cardholder: 'Posiadacz karty',
                cardName: 'Nazwa karty',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} eksportuj` : `eksport ${integration}`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Wybierz konto ${integration}, do kt\u00F3rego transakcje powinny by\u0107 eksportowane.`,
                integrationExportTitlePart: 'Wybierz inny',
                integrationExportTitleLinkPart: 'opcja eksportu',
                integrationExportTitleSecondPart: 'aby zmieni\u0107 dost\u0119pne konta.',
                lastUpdated: 'Ostatnia aktualizacja',
                transactionStartDate: 'Data rozpocz\u0119cia transakcji',
                updateCard: 'Zaktualizuj kart\u0119',
                unassignCard: 'Cofnij przypisanie karty',
                unassign: 'Odznacz przypisanie',
                unassignCardDescription: 'Odpi\u0119cie tej karty spowoduje usuni\u0119cie wszystkich transakcji na raportach roboczych z konta posiadacza karty.',
                assignCard: 'Przypisz kart\u0119',
                cardFeedName: 'Nazwa kana\u0142u kart',
                cardFeedNameDescription: 'Nadaj kana\u0142owi kart unikaln\u0105 nazw\u0119, aby\u015B m\u00F3g\u0142 go odr\u00F3\u017Cni\u0107 od innych.',
                cardFeedTransaction: 'Usu\u0144 transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mog\u0105 usuwa\u0107 transakcje kartowe. Nowe transakcje b\u0119d\u0105 podlega\u0142y tym zasadom.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezw\u00F3l na usuwanie transakcji',
                removeCardFeed: 'Usu\u0144 kana\u0142 kart',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Usu\u0144 kana\u0142 ${feedName}`,
                removeCardFeedDescription: 'Czy na pewno chcesz usun\u0105\u0107 ten kana\u0142 kart? Spowoduje to od\u0142\u0105czenie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa kana\u0142u kart jest wymagana',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezw\u00F3l na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj kana\u0142owi kart unikaln\u0105 nazw\u0119, aby\u015B m\u00F3g\u0142 go odr\u00F3\u017Cni\u0107 od innych.',
                setTransactionLiabilityDescription:
                    'Po w\u0142\u0105czeniu posiadacze kart mog\u0105 usuwa\u0107 transakcje kart\u0105. Nowe transakcje b\u0119d\u0105 podlega\u0107 tej zasadzie.',
                emptyAddedFeedTitle: 'Przypisz karty firmowe',
                emptyAddedFeedDescription: 'Rozpocznij, przypisuj\u0105c swoj\u0105 pierwsz\u0105 kart\u0119 cz\u0142onkowi.',
                pendingFeedTitle: `Przegl\u0105damy Twoj\u0105 pro\u015Bb\u0119...`,
                pendingFeedDescription: `Obecnie przegl\u0105damy szczeg\u00F3\u0142y Twojego kana\u0142u. Gdy to zostanie zako\u0144czone, skontaktujemy si\u0119 z Tob\u0105 przez`,
                pendingBankTitle: 'Sprawd\u017A okno przegl\u0105darki',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Prosz\u0119 po\u0142\u0105czy\u0107 si\u0119 z ${bankName} za pomoc\u0105 okna przegl\u0105darki, kt\u00F3re w\u0142a\u015Bnie si\u0119 otworzy\u0142o. Je\u015Bli si\u0119 nie otworzy\u0142o,`,
                pendingBankLink: 'prosz\u0119 kliknij tutaj.',
                giveItNameInstruction: 'Nadaj karcie nazw\u0119, kt\u00F3ra wyr\u00F3\u017Cni j\u0105 spo\u015Br\u00F3d innych.',
                updating: 'Aktualizowanie...',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domy\u015Blna karta',
                downgradeTitle: `Nie mo\u017Cna obni\u017Cy\u0107 poziomu przestrzeni roboczej`,
                downgradeSubTitleFirstPart: `Tego miejsca pracy nie mo\u017Cna obni\u017Cy\u0107, poniewa\u017C jest pod\u0142\u0105czonych wiele kana\u0142\u00F3w kart (z wy\u0142\u0105czeniem kart Expensify). Prosz\u0119`,
                downgradeSubTitleMiddlePart: `zachowaj tylko jeden kana\u0142 kart`,
                downgradeSubTitleLastPart: 'aby kontynuowa\u0107.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Prosz\u0119 doda\u0107 konto w ${connection} i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.`,
                expensifyCardBannerTitle: 'Uzyskaj kart\u0119 Expensify',
                expensifyCardBannerSubtitle:
                    'Ciesz si\u0119 zwrotem got\u00F3wki przy ka\u017Cdym zakupie w USA, do 50% zni\u017Cki na rachunek Expensify, nieograniczon\u0105 liczb\u0105 kart wirtualnych i wieloma innymi korzy\u015Bciami.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz si\u0119 wi\u0119cej',
            },
            workflows: {
                title: 'Przep\u0142ywy pracy',
                subtitle: 'Skonfiguruj, w jaki spos\u00F3b wydatki s\u0105 zatwierdzane i op\u0142acane.',
                disableApprovalPrompt:
                    'Karty Expensify z tego obszaru roboczego obecnie polegaj\u0105 na zatwierdzeniu, aby okre\u015Bli\u0107 ich Inteligentne Limity. Prosz\u0119 zmieni\u0107 typy limit\u00F3w dowolnych Kart Expensify z Inteligentnymi Limitami przed wy\u0142\u0105czeniem zatwierdze\u0144.',
            },
            invoices: {
                title: 'Faktury',
                subtitle: 'Wysy\u0142aj i odbieraj faktury.',
            },
            categories: {
                title: 'Kategorie',
                subtitle: '\u015Aled\u017A i organizuj wydatki.',
            },
            tags: {
                title: 'Tagi',
                subtitle: 'Klasyfikuj koszty i \u015Bled\u017A wydatki podlegaj\u0105ce fakturowaniu.',
            },
            taxes: {
                title: 'Podatki',
                subtitle: 'Dokumentuj i odzyskuj kwalifikuj\u0105ce si\u0119 podatki.',
            },
            reportFields: {
                title: 'Pola raportu',
                subtitle: 'Skonfiguruj pola niestandardowe dla wydatk\u00F3w.',
            },
            connections: {
                title: 'Ksi\u0119gowo\u015B\u0107',
                subtitle: 'Synchronizuj sw\u00F3j plan kont i wi\u0119cej.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText: 'Aby w\u0142\u0105czy\u0107 lub wy\u0142\u0105czy\u0107 t\u0119 funkcj\u0119, musisz zmieni\u0107 ustawienia importu ksi\u0119gowego.',
                disconnectText: 'Aby wy\u0142\u0105czy\u0107 ksi\u0119gowo\u015B\u0107, musisz od\u0142\u0105czy\u0107 swoje po\u0142\u0105czenie ksi\u0119gowe od przestrzeni roboczej.',
                manageSettings: 'Zarz\u0105dzaj ustawieniami',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText:
                    'Karty Expensify w tym obszarze roboczym polegaj\u0105 na przep\u0142ywach zatwierdze\u0144, aby okre\u015Bli\u0107 swoje Inteligentne Limity.\n\nProsz\u0119 zmieni\u0107 typy limit\u00F3w na dowolnych kartach z Inteligentnymi Limitami przed wy\u0142\u0105czeniem przep\u0142yw\u00F3w pracy.',
                confirmText: 'Przejd\u017A do kart Expensify',
            },
            rules: {
                title: 'Zasady',
                subtitle: 'Wymagaj paragon\u00F3w, oznaczaj wysokie wydatki i wi\u0119cej.',
            },
        },
        reportFields: {
            addField: 'Dodaj pole',
            delete: 'Usu\u0144 pole',
            deleteFields: 'Usu\u0144 pola',
            findReportField: 'Znajd\u017A pole raportu',
            deleteConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 to pole raportu?',
            deleteFieldsConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 te pola raportu?',
            emptyReportFields: {
                title: 'Nie utworzy\u0142e\u015B \u017Cadnych p\u00F3l raportu',
                subtitle: 'Dodaj niestandardowe pole (tekstowe, daty lub rozwijane), kt\u00F3re pojawia si\u0119 w raportach.',
            },
            subtitle: 'Pola raportu maj\u0105 zastosowanie do wszystkich wydatk\u00F3w i mog\u0105 by\u0107 pomocne, gdy chcesz poprosi\u0107 o dodatkowe informacje.',
            disableReportFields: 'Wy\u0142\u0105cz pola raportu',
            disableReportFieldsConfirmation: 'Czy jeste\u015B pewien? Pola tekstowe i daty zostan\u0105 usuni\u0119te, a listy zostan\u0105 wy\u0142\u0105czone.',
            importedFromAccountingSoftware: 'Pola raportu poni\u017Cej s\u0105 importowane z Twojego',
            textType: 'Tekst',
            dateType: 'Data',
            dropdownType: 'Lista',
            textAlternateText: 'Dodaj pole do swobodnego wprowadzania tekstu.',
            dateAlternateText: 'Dodaj kalendarz do wyboru daty.',
            dropdownAlternateText: 'Dodaj list\u0119 opcji do wyboru.',
            nameInputSubtitle: 'Wybierz nazw\u0119 dla pola raportu.',
            typeInputSubtitle: 'Wybierz, jakiego typu pola raportu chcesz u\u017Cy\u0107.',
            initialValueInputSubtitle: 'Wprowad\u017A warto\u015B\u0107 pocz\u0105tkow\u0105 do wy\u015Bwietlenia w polu raportu.',
            listValuesInputSubtitle:
                'Te warto\u015Bci pojawi\u0105 si\u0119 w polu rozwijanym raportu. W\u0142\u0105czone warto\u015Bci mog\u0105 by\u0107 wybierane przez cz\u0142onk\u00F3w.',
            listInputSubtitle:
                'Te warto\u015Bci pojawi\u0105 si\u0119 na li\u015Bcie p\u00F3l w Twoim raporcie. W\u0142\u0105czone warto\u015Bci mog\u0105 by\u0107 wybierane przez cz\u0142onk\u00F3w.',
            deleteValue: 'Usu\u0144 warto\u015B\u0107',
            deleteValues: 'Usu\u0144 warto\u015Bci',
            disableValue: 'Wy\u0142\u0105cz warto\u015B\u0107',
            disableValues: 'Wy\u0142\u0105cz warto\u015Bci',
            enableValue: 'W\u0142\u0105cz warto\u015B\u0107',
            enableValues: 'W\u0142\u0105cz warto\u015Bci',
            emptyReportFieldsValues: {
                title: 'Nie utworzy\u0142e\u015B \u017Cadnych warto\u015Bci listy',
                subtitle: 'Dodaj niestandardowe warto\u015Bci, kt\u00F3re maj\u0105 si\u0119 pojawi\u0107 w raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 warto\u015B\u0107 z listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usun\u0105\u0107 te warto\u015Bci listy?',
            listValueRequiredError: 'Prosz\u0119 wprowadzi\u0107 nazw\u0119 warto\u015Bci listy',
            existingListValueError: 'Warto\u015B\u0107 listy o tej nazwie ju\u017C istnieje',
            editValue: 'Edytuj warto\u015B\u0107',
            listValues: 'Wymie\u0144 warto\u015Bci',
            addValue: 'Dodaj warto\u015B\u0107',
            existingReportFieldNameError: 'Pole raportu o tej nazwie ju\u017C istnieje',
            reportFieldNameRequiredError: 'Prosz\u0119 wprowadzi\u0107 nazw\u0119 pola raportu',
            reportFieldTypeRequiredError: 'Prosz\u0119 wybra\u0107 typ pola raportu',
            reportFieldInitialValueRequiredError: 'Prosz\u0119 wybra\u0107 pocz\u0105tkow\u0105 warto\u015B\u0107 pola raportu',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji pola raportu. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        },
        tags: {
            tagName: 'Nazwa tagu',
            requiresTag: 'Cz\u0142onkowie musz\u0105 oznacza\u0107 wszystkie wydatki',
            trackBillable: '\u015Aled\u017A wydatki podlegaj\u0105ce fakturowaniu',
            customTagName: 'Niestandardowa nazwa tagu',
            enableTag: 'W\u0142\u0105cz tag',
            enableTags: 'W\u0142\u0105cz tagi',
            disableTag: 'Wy\u0142\u0105cz tag',
            disableTags: 'Wy\u0142\u0105cz tagi',
            addTag: 'Dodaj tag',
            editTag: 'Edytuj tag',
            editTags: 'Edytuj tagi',
            findTag: 'Znajd\u017A tag',
            subtitle: 'Tagi dodaj\u0105 bardziej szczeg\u00F3\u0142owe sposoby klasyfikacji koszt\u00F3w.',
            requireTag: 'Wymagaj tagu',
            requireTags: 'Wymagaj tagów',
            notRequireTags: 'Nie wymagaj',

            dependentMultiLevelTagsSubtitle: {
                phrase1: ' Używasz ',
                phrase2: 'tagów zależnych',
                phrase3: '. Możesz ',
                phrase4: 'ponownie zaimportować arkusz kalkulacyjny',
                phrase5: ', aby zaktualizować swoje tagi.',
            },

            emptyTags: {
                title: 'Nie utworzy\u0142e\u015B \u017Cadnych tag\u00F3w',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Dodaj tag, aby \u015Bledzi\u0107 projekty, lokalizacje, dzia\u0142y i wi\u0119cej.',
                subtitle1: 'Zaimportuj arkusz kalkulacyjny, aby doda\u0107 tagi do \u015Bledzenia projekt\u00F3w, lokalizacji, dzia\u0142\u00F3w i innych.',
                subtitle2: 'Dowiedz si\u0119 wi\u0119cej',
                subtitle3: 'about formatting tag files.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Twoje tagi s\u0105 obecnie importowane z po\u0142\u0105czenia ksi\u0119gowego. Przejd\u017A do',
                subtitle2: 'ksi\u0119gowo\u015B\u0107',
                subtitle3: 'aby wprowadzi\u0107 jakiekolwiek zmiany.',
            },
            deleteTag: 'Usu\u0144 tag',
            deleteTags: 'Usu\u0144 tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 ten tag?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 te tagi?',
            deleteFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas usuwania tagu, spr\u00F3buj ponownie.',
            tagRequiredError: 'Nazwa tagu jest wymagana',
            existingTagError: 'Tag o tej nazwie ju\u017C istnieje',
            invalidTagNameError: 'Nazwa tagu nie mo\u017Ce by\u0107 0. Prosz\u0119 wybra\u0107 inn\u0105 warto\u015B\u0107.',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji tagu, spr\u00F3buj ponownie.',
            importedFromAccountingSoftware: 'Poni\u017Csze tagi s\u0105 importowane z Twojego',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji kodu GL, spr\u00F3buj ponownie.',
            tagRules: 'Zasady tagowania',
            approverDescription: 'Osoba zatwierdzaj\u0105ca',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Koduj swoje wydatki za pomoc\u0105 jednego rodzaju tagu lub wielu.',
            configureMultiLevelTags: 'Skonfiguruj swoj\u0105 list\u0119 tag\u00F3w do tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: `Oto podgl\u0105d Twoich tag\u00F3w. Je\u015Bli wszystko wygl\u0105da dobrze, kliknij poni\u017Cej, aby je zaimportowa\u0107.`,
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz to tytu\u0142 dla ka\u017Cdej listy tag\u00F3w',
                independentTags: 'To s\u0105 niezale\u017Cne tagi',
                glAdjacentColumn: 'W s\u0105siedniej kolumnie znajduje si\u0119 kod GL',
            },
            tagLevel: {
                singleLevel: 'Pojedynczy poziom tag\u00F3w',
                multiLevel: 'Wielopoziomowe tagi',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Prze\u0142\u0105cz poziomy tag\u00F3w',
                prompt1: 'Zmiana poziom\u00F3w tag\u00F3w spowoduje usuni\u0119cie wszystkich bie\u017C\u0105cych tag\u00F3w.',
                prompt2: 'Sugerujemy, aby\u015B najpierw',
                prompt3: 'pobierz kopi\u0119 zapasow\u0105',
                prompt4: 'poprzez eksportowanie swoich tag\u00F3w.',
                prompt5: 'Dowiedz si\u0119 wi\u0119cej',
                prompt6: 'o poziomach tag\u00F3w.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Znale\u017Ali\u015Bmy *${columnCounts} kolumny* w Twoim arkuszu kalkulacyjnym. Wybierz *Nazwa* obok kolumny, kt\u00F3ra zawiera nazwy tag\u00F3w. Mo\u017Cesz r\u00F3wnie\u017C wybra\u0107 *W\u0142\u0105czone* obok kolumny, kt\u00F3ra ustawia status tag\u00F3w.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Nie mo\u017Cna usun\u0105\u0107 ani wy\u0142\u0105czy\u0107 wszystkich tag\u00F3w',
                description: `Przynajmniej jeden tag musi pozosta\u0107 w\u0142\u0105czony, poniewa\u017C Twoje miejsce pracy wymaga tag\u00F3w.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie mo\u017Cna ustawi\u0107 wszystkich tag\u00F3w jako opcjonalne.',
                description: `Przynajmniej jeden tag musi pozosta\u0107 wymagany, poniewa\u017C ustawienia Twojego miejsca pracy wymagaj\u0105 tag\u00F3w.`,
            },
            tagCount: () => ({
                one: '1 dzie\u0144',
                other: (count: number) => `${count} tagi`,
            }),
        },
        taxes: {
            subtitle: 'Dodaj nazwy podatk\u00F3w, stawki i ustaw domy\u015Blne.',
            addRate: 'Dodaj stawk\u0119',
            workspaceDefault: 'Domy\u015Blna waluta przestrzeni roboczej',
            foreignDefault: 'Domy\u015Blna waluta obca',
            customTaxName: 'Niestandardowa nazwa podatku',
            value: 'Warto\u015B\u0107',
            taxReclaimableOn: 'Podatek mo\u017Cliwy do odzyskania na',
            taxRate: 'Stawka podatkowa',
            findTaxRate: 'Znajd\u017A stawk\u0119 podatkow\u0105',
            error: {
                taxRateAlreadyExists: 'Ta nazwa podatku jest ju\u017C w u\u017Cyciu',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest ju\u017C w u\u017Cyciu',
                valuePercentageRange: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy procent pomi\u0119dzy 0 a 100',
                customNameRequired: 'Nazwa niestandardowego podatku jest wymagana',
                deleteFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas usuwania stawki podatkowej. Spr\u00F3buj ponownie lub popro\u015B o pomoc Concierge.',
                updateFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji stawki podatkowej. Spr\u00F3buj ponownie lub popro\u015B o pomoc Concierge.',
                createFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas tworzenia stawki podatkowej. Spr\u00F3buj ponownie lub popro\u015B o pomoc Concierge.',
                updateTaxClaimableFailureMessage: 'Cz\u0119\u015B\u0107 podlegaj\u0105ca zwrotowi musi by\u0107 mniejsza ni\u017C kwota stawki za odleg\u0142o\u015B\u0107',
            },
            deleteTaxConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 ten podatek?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Czy na pewno chcesz usun\u0105\u0107 podatki w wysoko\u015Bci ${taxAmount}?`,
            actions: {
                delete: 'Usu\u0144 stawk\u0119',
                deleteMultiple: 'Usu\u0144 stawki',
                enable: 'W\u0142\u0105cz stawk\u0119',
                disable: 'Wy\u0142\u0105cz stawk\u0119',
                enableTaxRates: () => ({
                    one: 'W\u0142\u0105cz stawk\u0119',
                    other: 'W\u0142\u0105cz stawki',
                }),
                disableTaxRates: () => ({
                    one: 'Wy\u0142\u0105cz stawk\u0119',
                    other: 'Wy\u0142\u0105cz stawki',
                }),
            },
            importedFromAccountingSoftware: 'Poni\u017Csze podatki s\u0105 importowane z Twojego',
            taxCode: 'Kod podatkowy',
            updateTaxCodeFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji kodu podatkowego, spr\u00F3buj ponownie.',
        },
        emptyWorkspace: {
            title: 'Utw\u00F3rz przestrze\u0144 robocz\u0105',
            subtitle:
                'Utw\u00F3rz przestrze\u0144 robocz\u0105 do \u015Bledzenia paragon\u00F3w, zwrotu wydatk\u00F3w, zarz\u0105dzania podr\u00F3\u017Cami, wysy\u0142ania faktur i nie tylko \u2014 wszystko z pr\u0119dko\u015Bci\u0105 czatu.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: '\u015Aled\u017A i zbieraj paragony',
                reimbursements: 'Zwr\u00F3\u0107 koszty pracownikom',
                companyCards: 'Zarz\u0105dzaj kartami firmowymi',
            },
            notFound: 'Nie znaleziono przestrzeni roboczej',
            description:
                'Pokoje to \u015Bwietne miejsce do dyskusji i pracy z wieloma osobami. Aby rozpocz\u0105\u0107 wsp\u00F3\u0142prac\u0119, utw\u00F3rz lub do\u0142\u0105cz do przestrzeni roboczej.',
        },
        new: {
            newWorkspace: 'Nowa przestrze\u0144 robocza',
            getTheExpensifyCardAndMore: 'Zdob\u0105d\u017A kart\u0119 Expensify i wi\u0119cej',
            confirmWorkspace: 'Potwierd\u017A przestrze\u0144 robocz\u0105',
            myGroupWorkspace: 'Moja Grupa Robocza',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace u\u017Cytkownika ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas usuwania cz\u0142onka z przestrzeni roboczej, spr\u00F3buj ponownie.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Czy na pewno chcesz usun\u0105\u0107 ${memberName}?`,
                other: 'Czy na pewno chcesz usun\u0105\u0107 tych cz\u0142onk\u00F3w?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} jest osob\u0105 zatwierdzaj\u0105c\u0105 w tej przestrzeni roboczej. Kiedy przestaniesz udost\u0119pnia\u0107 im t\u0119 przestrze\u0144 robocz\u0105, zast\u0105pimy ich w procesie zatwierdzania w\u0142a\u015Bcicielem przestrzeni roboczej, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Usu\u0144 cz\u0142onka',
                other: 'Usu\u0144 cz\u0142onk\u00F3w',
            }),
            findMember: 'Znajd\u017A cz\u0142onka',
            removeWorkspaceMemberButtonTitle: 'Usu\u0144 z przestrzeni roboczej',
            removeGroupMemberButtonTitle: 'Usu\u0144 z grupy',
            removeRoomMemberButtonTitle: 'Usu\u0144 z czatu',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Czy na pewno chcesz usun\u0105\u0107 ${memberName}?`,
            removeMemberTitle: 'Usu\u0144 cz\u0142onka',
            transferOwner: 'Przenie\u015B w\u0142a\u015Bciciela',
            makeMember: 'Uczy\u0144 cz\u0142onkiem',
            makeAdmin: 'Nadaj uprawnienia administratora',
            makeAuditor: 'Utw\u00F3rz audytora',
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wyst\u0105pi\u0142 problem z dodaniem tego cz\u0142onka przestrzeni roboczej',
                cannotRemove: 'Nie mo\u017Cesz usun\u0105\u0107 siebie ani w\u0142a\u015Bciciela przestrzeni roboczej',
                genericRemove: 'Wyst\u0105pi\u0142 problem z usuni\u0119ciem tego cz\u0142onka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niekt\u00F3rzy cz\u0142onkowie zostali dodani z ich g\u0142\u00F3wnymi loginami.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Dodane przez dodatkowe logowanie ${secondaryLogin}.`,
            membersListTitle: 'Katalog wszystkich cz\u0142onk\u00F3w przestrzeni roboczej.',
            importMembers: 'Importuj cz\u0142onk\u00F3w',
        },
        card: {
            getStartedIssuing: 'Rozpocznij, wydaj\u0105c swoj\u0105 pierwsz\u0105 wirtualn\u0105 lub fizyczn\u0105 kart\u0119.',
            issueCard: 'Wydaj kart\u0119',
            issueNewCard: {
                whoNeedsCard: 'Kto potrzebuje karty?',
                findMember: 'Znajd\u017A cz\u0142onka',
                chooseCardType: 'Wybierz typ karty',
                physicalCard: 'Karta fizyczna',
                physicalCardDescription: '\u015Awietne dla cz\u0119stego wydawcy',
                virtualCard: 'Wirtualna karta',
                virtualCardDescription: 'Natychmiastowy i elastyczny',
                chooseLimitType: 'Wybierz typ limitu',
                smartLimit: 'Inteligentny Limit',
                smartLimitDescription: 'Wydaj do okre\u015Blonej kwoty przed wymaganiem zatwierdzenia',
                monthly: 'Miesi\u0119czny',
                monthlyDescription: 'Wydawaj do okre\u015Blonej kwoty miesi\u0119cznie',
                fixedAmount: 'Sta\u0142a kwota',
                fixedAmountDescription: 'Wydaj do okre\u015Blonej kwoty jednorazowo',
                setLimit: 'Ustaw limit',
                cardLimitError: 'Prosz\u0119 wprowadzi\u0107 kwot\u0119 mniejsz\u0105 ni\u017C $21,474,836',
                giveItName: 'Nadaj mu nazw\u0119',
                giveItNameInstruction:
                    'Uczy\u0144 go na tyle unikalnym, aby mo\u017Cna go by\u0142o odr\u00F3\u017Cni\u0107 od innych kart. Konkretne przypadki u\u017Cycia s\u0105 nawet lepsze!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawd\u017Amy jeszcze raz, czy wszystko wygl\u0105da dobrze.',
                willBeReady: 'Ta karta b\u0119dzie gotowa do u\u017Cycia natychmiast.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                name: 'Nazwa',
            },
            deactivateCardModal: {
                deactivate: 'Dezaktywuj',
                deactivateCard: 'Dezaktywuj kart\u0119',
                deactivateConfirmation: 'Dezaktywowanie tej karty spowoduje odrzucenie wszystkich przysz\u0142ych transakcji i nie mo\u017Cna tego cofn\u0105\u0107.',
            },
        },
        accounting: {
            settings: 'ustawienia',
            title: 'Po\u0142\u0105czenia',
            subtitle:
                'Po\u0142\u0105cz si\u0119 z systemem ksi\u0119gowym, aby zakodowa\u0107 transakcje za pomoc\u0105 planu kont, automatycznie dopasowywa\u0107 p\u0142atno\u015Bci i utrzymywa\u0107 synchronizacj\u0119 finans\u00F3w.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Porozmawiaj ze swoim specjalist\u0105 ds. konfiguracji.',
            talkYourAccountManager: 'Porozmawiaj ze swoim opiekunem konta.',
            talkToConcierge: 'Czat z Concierge.',
            needAnotherAccounting: 'Potrzebujesz innego oprogramowania ksi\u0119gowego?',
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
            errorODIntegration: 'Wyst\u0105pi\u0142 b\u0142\u0105d z po\u0142\u0105czeniem, kt\u00F3re zosta\u0142o skonfigurowane w Expensify Classic.',
            goToODToFix: 'Przejd\u017A do Expensify Classic, aby rozwi\u0105za\u0107 ten problem.',
            goToODToSettings: 'Przejd\u017A do Expensify Classic, aby zarz\u0105dza\u0107 swoimi ustawieniami.',
            setup: 'Po\u0142\u0105cz',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ostatnia synchronizacja ${relativeDate}`,
            notSync: 'Niesynchronizowane',
            import: 'Importuj',
            export: 'Eksportuj',
            advanced: 'Zaawansowany',
            other: 'Inne',
            syncNow: 'Synchronizuj teraz',
            disconnect: 'Od\u0142\u0105cz',
            reinstall: 'Ponownie zainstaluj connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integracja';
                return `Od\u0142\u0105cz ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Po\u0142\u0105cz ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integracja ksi\u0119gowa'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z QuickBooks Desktop';
                    default: {
                        return 'Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z integracj\u0105';
                    }
                }
            },
            accounts: 'Plan kont',
            taxes: 'Podatki',
            imported: 'Zaimportowano',
            notImported: 'Nie zaimportowano',
            importAsCategory: 'Zaimportowano jako kategorie',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Zaimportowano',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Zaimportowano jako tagi',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Zaimportowano',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Nie zaimportowano',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Nie zaimportowano',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Zaimportowano jako pola raportu',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Domy\u015Blne ustawienie pracownika NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'ta integracja';
                return `Czy na pewno chcesz od\u0142\u0105czy\u0107 ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Czy na pewno chcesz po\u0142\u0105czy\u0107 ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'ta integracja ksi\u0119gowa'}? To usunie wszystkie istniej\u0105ce po\u0142\u0105czenia ksi\u0119gowe.`,
            enterCredentials: 'Wprowad\u017A swoje dane uwierzytelniaj\u0105ce',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importowanie klient\u00F3w';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importowanie pracownik\u00F3w';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importowanie kont';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importowanie klas';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importowanie lokalizacji';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Przetwarzanie zaimportowanych danych';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronizowanie zrefundowanych raport\u00F3w i p\u0142atno\u015Bci rachunk\u00F3w';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importowanie kod\u00F3w podatkowych';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Sprawdzanie po\u0142\u0105czenia z QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importowanie danych z Xero';
                        case 'startingImportQBO':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importowanie danych QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importowanie tytu\u0142u';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importowanie certyfikatu zatwierdzenia';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importowanie wymiar\u00F3w';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importowanie polityki zapisywania';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Nadal synchronizuj\u0119 dane z QuickBooks... Prosz\u0119 upewnij si\u0119, \u017Ce Web Connector jest uruchomiony';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronizowanie danych QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return '\u0141adowanie danych';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Aktualizowanie kategorii';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aktualizowanie klient\u00F3w/projekt\u00F3w';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Aktualizowanie listy os\u00F3b';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aktualizowanie p\u00F3l raportu';
                        case 'jobDone':
                            return 'Oczekiwanie na za\u0142adowanie zaimportowanych danych';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchronizowanie planu kont';
                        case 'xeroSyncImportCategories':
                            return 'Synchronizowanie kategorii';
                        case 'xeroSyncImportCustomers':
                            return 'Synchronizowanie klient\u00F3w';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Oznaczanie raport\u00F3w Expensify jako zrefundowane';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunk\u00F3w i faktur Xero jako op\u0142acone';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronizowanie kategorii \u015Bledzenia';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronizacja kont bankowych';
                        case 'xeroSyncImportTaxRates':
                            return 'Synchronizowanie stawek podatkowych';
                        case 'xeroCheckConnection':
                            return 'Sprawdzanie po\u0142\u0105czenia z Xero';
                        case 'xeroSyncTitle':
                            return 'Synchronizowanie danych Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inicjowanie po\u0142\u0105czenia z NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importowanie klient\u00F3w';
                        case 'netSuiteSyncInitData':
                            return 'Pobieranie danych z NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importowanie podatk\u00F3w';
                        case 'netSuiteSyncImportItems':
                            return 'Importowanie element\u00F3w';
                        case 'netSuiteSyncData':
                            return 'Importowanie danych do Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Synchronizowanie kont';
                        case 'netSuiteSyncCurrencies':
                            return 'Synchronizowanie walut';
                        case 'netSuiteSyncCategories':
                            return 'Synchronizowanie kategorii';
                        case 'netSuiteSyncReportFields':
                            return 'Importowanie danych jako pola raportu Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importowanie danych jako tagi Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aktualizowanie informacji o po\u0142\u0105czeniu';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Oznaczanie raport\u00F3w Expensify jako zrefundowane';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunk\u00F3w i faktur NetSuite jako op\u0142acone';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importowanie dostawc\u00F3w';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importowanie niestandardowych list';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importowanie niestandardowych list';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importowanie sp\u00F3\u0142ek zale\u017Cnych';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importowanie dostawc\u00F3w';
                        case 'intacctCheckConnection':
                            return 'Sprawdzanie po\u0142\u0105czenia Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importowanie wymiar\u00F3w Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importowanie danych Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Brak t\u0142umaczenia dla etapu: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Preferowany eksporter',
            exportPreferredExporterNote:
                'Preferowany eksporter mo\u017Ce by\u0107 dowolnym administratorem przestrzeni roboczej, ale musi by\u0107 r\u00F3wnie\u017C administratorem domeny, je\u015Bli ustawisz r\u00F3\u017Cne konta eksportu dla poszczeg\u00F3lnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy raporty do eksportu na swoim koncie.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z w\u0142asnej kieszeni jako',
            exportCompanyCard: 'Eksportuj wydatki z karty firmowej jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domy\u015Blny dostawca',
            autoSync: 'Auto-synchronizacja',
            autoSyncDescription: 'Synchronizuj NetSuite i Expensify automatycznie, codziennie. Eksportuj sfinalizowany raport w czasie rzeczywistym.',
            reimbursedReports: 'Synchronizuj zrefundowane raporty',
            cardReconciliation: 'Rekonsyliacja kart',
            reconciliationAccount: 'Konto uzgadniaj\u0105ce',
            continuousReconciliation: 'Ci\u0105g\u0142a Rekoncyliacja',
            saveHoursOnReconciliation:
                'Zaoszcz\u0119d\u017A godziny na uzgadnianiu ka\u017Cdego okresu rozliczeniowego, dzi\u0119ki temu, \u017Ce Expensify nieustannie uzgadnia wyci\u0105gi i rozliczenia Expensify Card w Twoim imieniu.',
            enableContinuousReconciliation: 'Aby w\u0142\u0105czy\u0107 Ci\u0105g\u0142e Uzgadnianie, prosz\u0119 w\u0142\u0105czy\u0107',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z kt\u00F3rym b\u0119d\u0105 uzgadniane p\u0142atno\u015Bci kart\u0105 Expensify.',
                accountMatches: 'Upewnij si\u0119, \u017Ce to konto pasuje do Twojego',
                settlementAccount: 'Konto rozliczeniowe karty Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) =>
                    `(ko\u0144cz\u0105cy si\u0119 na ${lastFourPAN}), aby Ci\u0105g\u0142a Rekonsyliacja dzia\u0142a\u0142a poprawnie.`,
            },
        },
        export: {
            notReadyHeading: 'Nie gotowy do eksportu',
            notReadyDescription:
                'Szkice lub oczekuj\u0105ce raporty wydatk\u00F3w nie mog\u0105 by\u0107 eksportowane do systemu ksi\u0119gowego. Prosz\u0119 zatwierdzi\u0107 lub op\u0142aci\u0107 te wydatki przed ich eksportowaniem.',
        },
        invoices: {
            sendInvoice: 'Wy\u015Blij faktur\u0119',
            sendFrom: 'Wy\u015Blij z',
            invoicingDetails: 'Szczeg\u00F3\u0142y fakturowania',
            invoicingDetailsDescription: 'Te informacje pojawi\u0105 si\u0119 na Twoich fakturach.',
            companyName: 'Nazwa firmy',
            companyWebsite: 'Strona internetowa firmy',
            paymentMethods: {
                personal: 'Osobiste',
                business: 'Business',
                chooseInvoiceMethod: 'Wybierz metod\u0119 p\u0142atno\u015Bci poni\u017Cej:',
                addBankAccount: 'Dodaj konto bankowe',
                payingAsIndividual: 'P\u0142acenie jako osoba fizyczna',
                payingAsBusiness: 'P\u0142acenie jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle:
                'To jest Tw\u00F3j obecny stan konta z tytu\u0142u zbierania p\u0142atno\u015Bci z faktur. Zostanie automatycznie przelany na Twoje konto bankowe, je\u015Bli je doda\u0142e\u015B.',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby dokonywa\u0107 i otrzymywa\u0107 p\u0142atno\u015Bci za faktury.',
        },
        invite: {
            member: 'Zapro\u015B cz\u0142onka',
            members: 'Zapro\u015B cz\u0142onk\u00F3w',
            invitePeople: 'Zapro\u015B nowych cz\u0142onk\u00F3w',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas zapraszania cz\u0142onka do przestrzeni roboczej. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            pleaseEnterValidLogin: `Prosz\u0119 upewni\u0107 si\u0119, \u017Ce adres e-mail lub numer telefonu jest prawid\u0142owy (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'u\u017Cytkownik',
            users: 'u\u017Cytkownicy',
            invited: 'zaproszony',
            removed: 'usuni\u0119to',
            to: 'do',
            from: 'z',
        },
        inviteMessage: {
            confirmDetails: 'Potwierd\u017A szczeg\u00F3\u0142y',
            inviteMessagePrompt: 'Uczy\u0144 swoje zaproszenie wyj\u0105tkowym, dodaj\u0105c poni\u017Cej wiadomo\u015B\u0107!',
            personalMessagePrompt: 'Wiadomo\u015B\u0107',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas zapraszania cz\u0142onka do przestrzeni roboczej. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            inviteNoMembersError: 'Prosz\u0119 wybra\u0107 co najmniej jednego cz\u0142onka do zaproszenia',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} poprosi\u0142 o do\u0142\u0105czenie do ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak szybko...',
            workspaceNeeds: 'Przestrze\u0144 robocza potrzebuje co najmniej jednej w\u0142\u0105czonej stawki za odleg\u0142o\u015B\u0107.',
            distance: 'Dystans',
            centrallyManage: 'Centralnie zarz\u0105dzaj stawkami, \u015Bled\u017A w milach lub kilometrach i ustaw domy\u015Bln\u0105 kategori\u0119.',
            rate: 'Oce\u0144',
            addRate: 'Dodaj stawk\u0119',
            findRate: 'Znajd\u017A stawk\u0119',
            trackTax: '\u015Aled\u017A podatek',
            deleteRates: () => ({
                one: 'Usu\u0144 stawk\u0119',
                other: 'Usu\u0144 stawki',
            }),
            enableRates: () => ({
                one: 'W\u0142\u0105cz stawk\u0119',
                other: 'W\u0142\u0105cz stawki',
            }),
            disableRates: () => ({
                one: 'Wy\u0142\u0105cz stawk\u0119',
                other: 'Wy\u0142\u0105cz stawki',
            }),
            enableRate: 'W\u0142\u0105cz stawk\u0119',
            status: 'Status',
            unit: 'Jednostka',
            taxFeatureNotEnabledMessage: 'Podatki musz\u0105 by\u0107 w\u0142\u0105czone w przestrzeni roboczej, aby u\u017Cywa\u0107 tej funkcji. Przejd\u017A do',
            changePromptMessage: 'aby dokona\u0107 tej zmiany.',
            deleteDistanceRate: 'Usu\u0144 stawk\u0119 za odleg\u0142o\u015B\u0107',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usun\u0105\u0107 t\u0119 stawk\u0119?',
                other: 'Czy na pewno chcesz usun\u0105\u0107 te stawki?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Opis',
            nameInputLabel: 'Nazwa',
            typeInputLabel: 'Rodzaj',
            initialValueInputLabel: 'Warto\u015B\u0107 pocz\u0105tkowa',
            nameInputHelpText: 'To jest nazwa, kt\u00F3r\u0105 zobaczysz w swoim obszarze roboczym.',
            nameIsRequiredError: 'Musisz nada\u0107 swojej przestrzeni roboczej nazw\u0119',
            currencyInputLabel: 'Domy\u015Blna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tym obszarze roboczym zostan\u0105 przeliczone na t\u0119 walut\u0119.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `Domy\u015Blna waluta nie mo\u017Ce zosta\u0107 zmieniona, poniewa\u017C to miejsce pracy jest powi\u0105zane z kontem bankowym w walucie ${currency}.`,
            save: 'Zapisz',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas aktualizacji przestrzeni roboczej. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            avatarUploadFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas przesy\u0142ania awatara. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
            addressContext: 'Aby w\u0142\u0105czy\u0107 Expensify Travel, wymagany jest adres Workspace. Prosz\u0119 poda\u0107 adres zwi\u0105zany z Twoj\u0105 firm\u0105.',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfiguracj\u0119',
            youAreAlmostDone:
                'Prawie sko\u0144czy\u0142e\u015B konfigurowanie swojego konta bankowego, co pozwoli Ci wydawa\u0107 karty korporacyjne, zwraca\u0107 wydatki, pobiera\u0107 faktury i p\u0142aci\u0107 rachunki.',
            streamlinePayments: 'Usprawnij p\u0142atno\u015Bci',
            connectBankAccountNote: 'Uwaga: Osobiste konta bankowe nie mog\u0105 by\u0107 u\u017Cywane do p\u0142atno\u015Bci w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards:
                'To konto bankowe b\u0119dzie u\u017Cywane do wydawania kart korporacyjnych, zwrotu koszt\u00F3w, pobierania faktur i op\u0142acania rachunk\u00F3w.',
            letsFinishInChat: 'Zako\u0144czmy na czacie!',
            finishInChat: 'Zako\u0144cz w czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Od\u0142\u0105cz konto bankowe',
            startOver: 'Zacznij od nowa',
            updateDetails: 'Zaktualizuj szczeg\u00F3\u0142y',
            yesDisconnectMyBankAccount: 'Tak, od\u0142\u0105cz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa.',
            disconnectYour: 'Od\u0142\u0105cz swoje',
            bankAccountAnyTransactions: 'konto bankowe. Wszelkie nierozliczone transakcje dla tego konta zostan\u0105 nadal zrealizowane.',
            clearProgress: 'Rozpocz\u0119cie od nowa spowoduje usuni\u0119cie post\u0119p\u00F3w, kt\u00F3re do tej pory osi\u0105gn\u0105\u0142e\u015B.',
            areYouSure: 'Jeste\u015B pewien?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt:
                'Wygl\u0105da na to, \u017Ce Twoje miejsce pracy jest obecnie ustawione na inn\u0105 walut\u0119 ni\u017C USD. Kliknij przycisk poni\u017Cej, aby teraz zaktualizowa\u0107 walut\u0119 na USD.',
            updateToUSD: 'Zaktualizuj do USD',
            updateWorkspaceCurrency: 'Zaktualizuj walut\u0119 przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta przestrzeni roboczej nie jest obs\u0142ugiwana',
            yourWorkspace: 'Twoje miejsce pracy jest ustawione na nieobs\u0142ugiwan\u0105 walut\u0119. Zobacz',
            listOfSupportedCurrencies: 'lista obs\u0142ugiwanych walut',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenie\u015B w\u0142a\u015Bciciela',
            addPaymentCardTitle: 'Wprowad\u017A swoj\u0105 kart\u0119 p\u0142atnicz\u0105, aby przenie\u015B\u0107 w\u0142asno\u015B\u0107',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kart\u0119 p\u0142atnicz\u0105',
            addPaymentCardReadAndAcceptTextPart1: 'Przeczytaj i zaakceptuj',
            addPaymentCardReadAndAcceptTextPart2: 'polityka dodawania karty',
            addPaymentCardTerms: 'warunki',
            addPaymentCardPrivacy: 'prywatno\u015B\u0107',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Zgodny z PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie bankowym',
            addPaymentCardRedundant: 'Nadmierna infrastruktura',
            addPaymentCardLearnMore: 'Dowiedz si\u0119 wi\u0119cej o naszym',
            addPaymentCardSecurity: 'security',
            amountOwedTitle: 'Zaleg\u0142e saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'To konto ma zaleg\u0142e saldo z poprzedniego miesi\u0105ca.\n\nCzy chcesz uregulowa\u0107 saldo i przej\u0105\u0107 rozliczenia tego obszaru roboczego?',
            ownerOwesAmountTitle: 'Zaleg\u0142e saldo',
            ownerOwesAmountButtonText: 'Przelej saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Konto posiadaj\u0105ce t\u0119 przestrze\u0144 robocz\u0105 (${email}) ma zaleg\u0142e saldo z poprzedniego miesi\u0105ca.\n\nCzy chcesz przela\u0107 t\u0119 kwot\u0119 (${amount}), aby przej\u0105\u0107 rozliczenia za t\u0119 przestrze\u0144 robocz\u0105? Twoja karta p\u0142atnicza zostanie obci\u0105\u017Cona natychmiast.`,
            subscriptionTitle: 'Przej\u0119cie rocznej subskrypcji',
            subscriptionButtonText: 'Przenie\u015B subskrypcj\u0119',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Przej\u0119cie tego miejsca pracy po\u0142\u0105czy jego roczn\u0105 subskrypcj\u0119 z Twoj\u0105 obecn\u0105 subskrypcj\u0105. Spowoduje to zwi\u0119kszenie rozmiaru Twojej subskrypcji o ${usersCount} cz\u0142onk\u00F3w, co sprawi, \u017Ce nowy rozmiar subskrypcji wyniesie ${finalCount}. Czy chcesz kontynuowa\u0107?`,
            duplicateSubscriptionTitle: 'Alert o duplikacie subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Wygl\u0105da na to, \u017Ce pr\u00F3bujesz przej\u0105\u0107 rozliczenia dla przestrzeni roboczych ${email}, ale aby to zrobi\u0107, musisz najpierw by\u0107 administratorem we wszystkich ich przestrzeniach roboczych.\n\nKliknij \u201EKontynuuj\u201D, je\u015Bli chcesz przej\u0105\u0107 rozliczenia tylko dla przestrzeni roboczej ${workspaceName}.\n\nJe\u015Bli chcesz przej\u0105\u0107 rozliczenia za ca\u0142\u0105 ich subskrypcj\u0119, popro\u015B ich, aby dodali Ci\u0119 jako administratora do wszystkich swoich przestrzeni roboczych, zanim przejmiesz rozliczenia.`,
            hasFailedSettlementsTitle: 'Nie mo\u017Cna przenie\u015B\u0107 w\u0142asno\u015Bci',
            hasFailedSettlementsButtonText: 'Zrozumia\u0142em.',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Nie mo\u017Cesz przej\u0105\u0107 rozlicze\u0144, poniewa\u017C ${email} ma zaleg\u0142e rozliczenie karty Expensify. Prosz\u0119 poprosi\u0107 t\u0119 osob\u0119 o kontakt z concierge@expensify.com w celu rozwi\u0105zania problemu. Nast\u0119pnie b\u0119dziesz m\u00F3g\u0142 przej\u0105\u0107 rozliczenia dla tego miejsca pracy.`,
            failedToClearBalanceTitle: 'Nie uda\u0142o si\u0119 wyczy\u015Bci\u0107 salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie uda\u0142o nam si\u0119 wyczy\u015Bci\u0107 salda. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
            successTitle: 'Hurra! Wszystko gotowe.',
            successDescription: 'Jeste\u015B teraz w\u0142a\u015Bcicielem tego miejsca pracy.',
            errorTitle: 'Ups! Nie tak szybko...',
            errorDescriptionPartOne: 'Wyst\u0105pi\u0142 problem z przeniesieniem w\u0142asno\u015Bci tego miejsca pracy. Spr\u00F3buj ponownie lub',
            errorDescriptionPartTwo: 'skontaktuj si\u0119 z Concierge',
            errorDescriptionPartThree: 'dla pomocy.',
        },
        exportAgainModal: {
            title: 'Ostro\u017Cnie!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Nast\u0119puj\u0105ce raporty zosta\u0142y ju\u017C wyeksportowane do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nCzy na pewno chcesz je wyeksportowa\u0107 ponownie?`,
            confirmText: 'Tak, eksportuj ponownie',
            cancelText: 'Anuluj',
        },
        upgrade: {
            reportFields: {
                title: 'Pola raportu',
                description: `Pola raportu pozwalaj\u0105 okre\u015Bli\u0107 szczeg\u00F3\u0142y na poziomie nag\u0142\u00F3wka, odr\u00F3\u017Cniaj\u0105c je od tag\u00F3w odnosz\u0105cych si\u0119 do wydatk\u00F3w na poszczeg\u00F3lnych pozycjach. Te szczeg\u00F3\u0142y mog\u0105 obejmowa\u0107 nazwy konkretnych projekt\u00F3w, informacje o podr\u00F3\u017Cach s\u0142u\u017Cbowych, lokalizacje i inne.`,
                onlyAvailableOnPlan: 'Pola raportu s\u0105 dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Ciesz si\u0119 automatyczn\u0105 synchronizacj\u0105 i zmniejsz liczb\u0119 r\u0119cznych wpis\u00F3w dzi\u0119ki integracji Expensify + NetSuite. Uzyskaj dog\u0142\u0119bne, rzeczywiste wgl\u0105dy finansowe z natywnym i niestandardowym wsparciem segment\u00F3w, w tym mapowaniem projekt\u00F3w i klient\u00F3w.`,
                onlyAvailableOnPlan: 'Nasza integracja z NetSuite jest dost\u0119pna tylko w planie Control, zaczynaj\u0105cym si\u0119 od',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Ciesz si\u0119 automatyczn\u0105 synchronizacj\u0105 i redukcj\u0105 r\u0119cznych wpis\u00F3w dzi\u0119ki integracji Expensify + Sage Intacct. Uzyskaj dog\u0142\u0119bne, rzeczywiste wgl\u0105dy finansowe dzi\u0119ki zdefiniowanym przez u\u017Cytkownika wymiarom, a tak\u017Ce kodowaniu wydatk\u00F3w wed\u0142ug dzia\u0142u, klasy, lokalizacji, klienta i projektu (zadania).`,
                onlyAvailableOnPlan: 'Nasza integracja z Sage Intacct jest dost\u0119pna tylko w planie Control, zaczynaj\u0105cym si\u0119 od',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Ciesz si\u0119 automatyczn\u0105 synchronizacj\u0105 i zmniejsz liczb\u0119 r\u0119cznych wpis\u00F3w dzi\u0119ki integracji Expensify + QuickBooks Desktop. Zyskaj maksymaln\u0105 wydajno\u015B\u0107 dzi\u0119ki dwukierunkowemu po\u0142\u0105czeniu w czasie rzeczywistym i kodowaniu wydatk\u00F3w wed\u0142ug klasy, przedmiotu, klienta i projektu.`,
                onlyAvailableOnPlan: 'Nasza integracja z QuickBooks Desktop jest dost\u0119pna tylko w planie Control, zaczynaj\u0105cym si\u0119 od',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Zaawansowane zatwierdzenia',
                description: `Je\u015Bli chcesz doda\u0107 wi\u0119cej poziom\u00F3w zatwierdze\u0144 do procesu \u2013 lub po prostu upewni\u0107 si\u0119, \u017Ce najwi\u0119ksze wydatki zostan\u0105 ponownie sprawdzone \u2013 mamy dla Ciebie rozwi\u0105zanie. Zaawansowane zatwierdzenia pomagaj\u0105 wprowadzi\u0107 odpowiednie kontrole na ka\u017Cdym poziomie, aby utrzyma\u0107 wydatki zespo\u0142u pod kontrol\u0105.`,
                onlyAvailableOnPlan: 'Zaawansowane zatwierdzenia s\u0105 dost\u0119pne tylko w planie Control, kt\u00F3ry zaczyna si\u0119 od',
            },
            categories: {
                title: 'Kategorie',
                description: `Kategorie pomagaj\u0105 lepiej organizowa\u0107 wydatki, aby \u015Bledzi\u0107, na co wydajesz swoje pieni\u0105dze. Skorzystaj z naszej sugerowanej listy kategorii lub stw\u00F3rz w\u0142asne.`,
                onlyAvailableOnPlan: 'Kategorie s\u0105 dost\u0119pne w planie Collect, zaczynaj\u0105c od',
            },
            glCodes: {
                title: 'kody GL',
                description: `Dodaj kody GL do swoich kategorii i tag\u00F3w, aby \u0142atwo eksportowa\u0107 wydatki do swoich system\u00F3w ksi\u0119gowych i p\u0142acowych.`,
                onlyAvailableOnPlan: 'Kody GL s\u0105 dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            glAndPayrollCodes: {
                title: 'Kody GL i Payroll',
                description: `Dodaj kody GL i kody p\u0142acowe do swoich kategorii, aby u\u0142atwi\u0107 eksport wydatk\u00F3w do system\u00F3w ksi\u0119gowych i p\u0142acowych.`,
                onlyAvailableOnPlan: 'Kody GL i Payroll s\u0105 dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            taxCodes: {
                title: 'Kody podatkowe',
                description: `Dodaj kody podatkowe do swoich podatk\u00F3w, aby u\u0142atwi\u0107 eksport wydatk\u00F3w do system\u00F3w ksi\u0119gowych i p\u0142acowych.`,
                onlyAvailableOnPlan: 'Kody podatkowe s\u0105 dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            companyCards: {
                title: 'Nielimitowane karty firmowe',
                description: `Potrzebujesz doda\u0107 wi\u0119cej \u017Ar\u00F3de\u0142 kart? Odblokuj nieograniczon\u0105 liczb\u0119 kart firmowych, aby synchronizowa\u0107 transakcje ze wszystkich g\u0142\u00F3wnych wydawc\u00F3w kart.`,
                onlyAvailableOnPlan: 'To jest dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            rules: {
                title: 'Zasady',
                description: `Regu\u0142y dzia\u0142aj\u0105 w tle i pomagaj\u0105 utrzyma\u0107 wydatki pod kontrol\u0105, dzi\u0119ki czemu nie musisz martwi\u0107 si\u0119 drobiazgami.\n\nWymagaj szczeg\u00F3\u0142\u00F3w wydatk\u00F3w, takich jak paragony i opisy, ustawiaj limity i domy\u015Blne warto\u015Bci oraz automatyzuj zatwierdzenia i p\u0142atno\u015Bci \u2013 wszystko w jednym miejscu.`,
                onlyAvailableOnPlan: 'Zasady s\u0105 dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            perDiem: {
                title: 'Dieta',
                description:
                    'Dieta to \u015Bwietny spos\u00F3b na utrzymanie zgodno\u015Bci i przewidywalno\u015Bci codziennych koszt\u00F3w, gdy Twoi pracownicy podr\u00F3\u017Cuj\u0105. Ciesz si\u0119 funkcjami takimi jak niestandardowe stawki, domy\u015Blne kategorie i bardziej szczeg\u00F3\u0142owe informacje, takie jak miejsca docelowe i podstawki.',
                onlyAvailableOnPlan: 'Diety s\u0105 dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            travel: {
                title: 'Podr\u00F3\u017Cowa\u0107',
                description:
                    'Expensify Travel to nowa platforma do rezerwacji i zarz\u0105dzania podr\u00F3\u017Cami s\u0142u\u017Cbowymi, kt\u00F3ra pozwala cz\u0142onkom rezerwowa\u0107 zakwaterowanie, loty, transport i wi\u0119cej.',
                onlyAvailableOnPlan: 'Podr\u00F3\u017Ce s\u0105 dost\u0119pne w planie Collect, zaczynaj\u0105c od',
            },
            multiLevelTags: {
                title: 'Wielopoziomowe tagi',
                description:
                    'Wielopoziomowe tagi pomagaj\u0105 \u015Bledzi\u0107 wydatki z wi\u0119ksz\u0105 precyzj\u0105. Przypisz wiele tag\u00F3w do ka\u017Cdej pozycji \u2014 takich jak dzia\u0142, klient lub centrum koszt\u00F3w \u2014 aby uchwyci\u0107 pe\u0142ny kontekst ka\u017Cdego wydatku. Umo\u017Cliwia to bardziej szczeg\u00F3\u0142owe raportowanie, przep\u0142ywy pracy zwi\u0105zane z zatwierdzaniem i eksporty ksi\u0119gowe.',
                onlyAvailableOnPlan: 'Tagi wielopoziomowe s\u0105 dost\u0119pne tylko w planie Control, zaczynaj\u0105c od',
            },
            pricing: {
                perActiveMember: 'na aktywnego cz\u0142onka miesi\u0119cznie.',
                perMember: 'za cz\u0142onka miesi\u0119cznie.',
            },
            note: {
                upgradeWorkspace: 'Ulepsz swoje miejsce pracy, aby uzyska\u0107 dost\u0119p do tej funkcji, lub',
                learnMore: 'dowiedz si\u0119 wi\u0119cej',
                aboutOurPlans: 'o naszych planach i cenach.',
            },
            upgradeToUnlock: 'Odblokuj t\u0119 funkcj\u0119',
            completed: {
                headline: `Zaktualizowano Twoje miejsce pracy!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Pomy\u015Blnie zaktualizowano ${policyName} do planu Control!`,
                categorizeMessage: `Pomy\u015Blnie zaktualizowano do przestrzeni roboczej w planie Collect. Teraz mo\u017Cesz kategoryzowa\u0107 swoje wydatki!`,
                travelMessage: `Pomy\u015Blnie zaktualizowano do przestrzeni roboczej w planie Collect. Teraz mo\u017Cesz zacz\u0105\u0107 rezerwowa\u0107 i zarz\u0105dza\u0107 podr\u00F3\u017Cami!`,
                viewSubscription: 'Wy\u015Bwietl swoj\u0105 subskrypcj\u0119',
                moreDetails: 'wi\u0119cej szczeg\u00F3\u0142\u00F3w.',
                gotIt: 'Zrozumiano, dzi\u0119ki',
            },
            commonFeatures: {
                title: 'Ulepsz do planu Control',
                note: 'Odblokuj nasze najpot\u0119\u017Cniejsze funkcje, w tym:',
                benefits: {
                    startsAt: 'Plan Control zaczyna si\u0119 od',
                    perMember: 'na aktywnego cz\u0142onka miesi\u0119cznie.',
                    learnMore: 'Dowiedz si\u0119 wi\u0119cej',
                    pricing: 'o naszych planach i cenach.',
                    benefit1: 'Zaawansowane po\u0142\u0105czenia ksi\u0119gowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne zasady wydatk\u00F3w',
                    benefit3: 'Wielopoziomowe przep\u0142ywy zatwierdzania',
                    benefit4: 'Ulepszone kontrole bezpiecze\u0144stwa',
                    toUpgrade: 'Aby zaktualizowa\u0107, kliknij',
                    selectWorkspace: 'wybierz przestrze\u0144 robocz\u0105 i zmie\u0144 typ planu na',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zmie\u0144 plan na Collect',
                note: 'Je\u015Bli zdecydujesz si\u0119 na obni\u017Cenie planu, stracisz dost\u0119p do tych funkcji i innych:',
                benefits: {
                    note: 'Aby uzyska\u0107 pe\u0142ne por\u00F3wnanie naszych plan\u00F3w, sprawd\u017A nasze',
                    pricingPage: 'strona cenowa',
                    confirm: 'Czy na pewno chcesz obni\u017Cy\u0107 wersj\u0119 i usun\u0105\u0107 swoje konfiguracje?',
                    warning: 'Tego nie mo\u017Cna cofn\u0105\u0107.',
                    benefit1: 'Po\u0142\u0105czenia ksi\u0119gowe (z wyj\u0105tkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne zasady wydatk\u00F3w',
                    benefit3: 'Wielopoziomowe przep\u0142ywy zatwierdzania',
                    benefit4: 'Ulepszone kontrole bezpiecze\u0144stwa',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote:
                        'Musisz obni\u017Cy\u0107 wszystkie swoje przestrzenie robocze przed pierwsz\u0105 miesi\u0119czn\u0105 p\u0142atno\u015Bci\u0105, aby rozpocz\u0105\u0107 subskrypcj\u0119 w stawce Collect. Kliknij',
                    selectStep: '> wybierz ka\u017Cd\u0105 przestrze\u0144 robocz\u0105 > zmie\u0144 typ planu na',
                },
            },
            completed: {
                headline: 'Twoje miejsce pracy zosta\u0142o obni\u017Cone do ni\u017Cszej wersji',
                description:
                    'Masz inne przestrzenie robocze na planie Control. Aby by\u0107 rozliczanym wed\u0142ug stawki Collect, musisz obni\u017Cy\u0107 wszystkie przestrzenie robocze.',
                gotIt: 'Zrozumiano, dzi\u0119ki',
            },
        },
        payAndDowngrade: {
            title: 'Zap\u0142a\u0107 i obni\u017C plan',
            headline: 'Twoja ostateczna p\u0142atno\u015B\u0107',
            description1: 'Tw\u00F3j ostateczny rachunek za t\u0119 subskrypcj\u0119 wyniesie',
            description2: ({date}: DateParams) => `Zobacz sw\u00F3j podzia\u0142 poni\u017Cej dla ${date}:`,
            subscription:
                'Uwaga! Ta akcja zako\u0144czy Twoj\u0105 subskrypcj\u0119 Expensify, usunie t\u0119 przestrze\u0144 robocz\u0105 i usunie wszystkich cz\u0142onk\u00F3w przestrzeni roboczej. Je\u015Bli chcesz zachowa\u0107 t\u0119 przestrze\u0144 robocz\u0105 i tylko usun\u0105\u0107 siebie, najpierw popro\u015B innego administratora o przej\u0119cie rozlicze\u0144.',
            genericFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas p\u0142acenia rachunku. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        },
        restrictedAction: {
            restricted: 'Ograniczony',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Dzia\u0142ania w przestrzeni roboczej ${workspaceName} s\u0105 obecnie ograniczone`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `W\u0142a\u015Bciciel przestrzeni roboczej, ${workspaceOwnerName}, b\u0119dzie musia\u0142 doda\u0107 lub zaktualizowa\u0107 kart\u0119 p\u0142atnicz\u0105 w systemie, aby odblokowa\u0107 nowe dzia\u0142ania w przestrzeni roboczej.`,
            youWillNeedToAddOrUpdatePaymentCard:
                'Musisz doda\u0107 lub zaktualizowa\u0107 kart\u0119 p\u0142atnicz\u0105 w systemie, aby odblokowa\u0107 now\u0105 aktywno\u015B\u0107 w przestrzeni roboczej.',
            addPaymentCardToUnlock: 'Dodaj kart\u0119 p\u0142atnicz\u0105, aby odblokowa\u0107!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kart\u0119 p\u0142atnicz\u0105, aby kontynuowa\u0107 korzystanie z tego miejsca pracy.',
            pleaseReachOutToYourWorkspaceAdmin: 'Prosz\u0119 skontaktowa\u0107 si\u0119 z administratorem przestrzeni roboczej w razie jakichkolwiek pyta\u0144.',
            chatWithYourAdmin: 'Porozmawiaj ze swoim administratorem',
            chatInAdmins: 'Czat w #admins',
            addPaymentCard: 'Dodaj kart\u0119 p\u0142atnicz\u0105',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: 'Ustaw kontrol\u0119 wydatk\u00F3w i domy\u015Blne warto\u015Bci dla poszczeg\u00F3lnych wydatk\u00F3w. Mo\u017Cesz tak\u017Ce tworzy\u0107 zasady dla',
                receiptRequiredAmount: 'Wymagana kwota paragonu',
                receiptRequiredAmountDescription:
                    'Wymagaj paragon\u00F3w, gdy wydatki przekraczaj\u0105 t\u0119 kwot\u0119, chyba \u017Ce zostanie to zmienione przez regu\u0142\u0119 kategorii.',
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczaj\u0105ce t\u0119 kwot\u0119, chyba \u017Ce zostan\u0105 one nadpisane przez regu\u0142\u0119 kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznacz wydatki starsze ni\u017C okre\u015Blona liczba dni.',
                maxExpenseAgeDays: () => ({
                    one: '1 dzie\u0144',
                    other: (count: number) => `${count} dni`,
                }),
                billableDefault: 'Domy\u015Blne rozliczenie',
                billableDefaultDescription:
                    'Wybierz, czy wydatki got\u00F3wkowe i kart\u0105 kredytow\u0105 powinny by\u0107 domy\u015Blnie fakturowalne. Wydatki fakturowalne s\u0105 w\u0142\u0105czane lub wy\u0142\u0105czane w',
                billable: 'Billable',
                billableDescription: 'Wydatki s\u0105 najcz\u0119\u015Bciej ponownie fakturowane klientom',
                nonBillable: 'Nieobci\u0105\u017Calne',
                nonBillableDescription: 'Wydatki s\u0105 czasami ponownie fakturowane klientom.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eParagony s\u0105 tworzone automatycznie',
                eReceiptsHintLink: 'dla wi\u0119kszo\u015Bci transakcji kredytowych w USD',
                attendeeTracking: '\u015Aledzenie uczestnik\u00F3w',
                attendeeTrackingHint: '\u015Aled\u017A koszt na osob\u0119 dla ka\u017Cdego wydatku.',
                prohibitedDefaultDescription:
                    'Oznacz wszelkie paragony, na kt\u00F3rych pojawiaj\u0105 si\u0119 alkohol, hazard lub inne przedmioty obj\u0119te ograniczeniami. Wydatki z paragonami, na kt\u00F3rych znajduj\u0105 si\u0119 te pozycje, b\u0119d\u0105 wymaga\u0142y r\u0119cznej weryfikacji.',
                prohibitedExpenses: 'Zabronione wydatki',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe op\u0142aty hotelowe',
                gambling: 'Hazardowanie',
                tobacco: 'Tyto\u0144',
                adultEntertainment: 'Rozrywka dla doros\u0142ych',
            },
            expenseReportRules: {
                examples: 'Przyk\u0142ady:',
                title: 'Raporty wydatk\u00F3w',
                subtitle: 'Zautomatyzuj zgodno\u015B\u0107, zatwierdzanie i p\u0142atno\u015Bci raport\u00F3w wydatk\u00F3w.',
                customReportNamesSubtitle: 'Dostosuj tytu\u0142y raport\u00F3w za pomoc\u0105 naszego',
                customNameTitle: 'Domy\u015Blny tytu\u0142 raportu',
                customNameDescription: 'Wybierz niestandardow\u0105 nazw\u0119 dla raport\u00F3w wydatk\u00F3w, u\u017Cywaj\u0105c naszego',
                customNameDescriptionLink: 'rozbudowane formu\u0142y',
                customNameInputLabel: 'Nazwa',
                customNameEmailPhoneExample: 'Email lub telefon cz\u0142onka: {report:submit:from}',
                customNameStartDateExample: 'Data rozpocz\u0119cia raportu: {report:startdate}',
                customNameWorkspaceNameExample: 'Nazwa przestrzeni roboczej: {report:workspacename}',
                customNameReportIDExample: 'Identyfikator raportu: {report:id}',
                customNameTotalExample: 'Suma: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Zapobiegaj cz\u0142onkom przed zmian\u0105 nazw niestandardowych raport\u00F3w',
                preventSelfApprovalsTitle: 'Zapobiegaj samoakceptacjom',
                preventSelfApprovalsSubtitle: 'Uniemo\u017Cliwiaj cz\u0142onkom przestrzeni roboczej zatwierdzanie w\u0142asnych raport\u00F3w wydatk\u00F3w.',
                autoApproveCompliantReportsTitle: 'Automatyczne zatwierdzanie zgodnych raport\u00F3w',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, kt\u00F3re raporty wydatk\u00F3w s\u0105 kwalifikowane do automatycznego zatwierdzania.',
                autoApproveReportsUnderTitle: 'Automatycznie zatwierdzaj raporty poni\u017Cej',
                autoApproveReportsUnderDescription: 'W pe\u0142ni zgodne raporty wydatk\u00F3w poni\u017Cej tej kwoty b\u0119d\u0105 automatycznie zatwierdzane.',
                randomReportAuditTitle: 'Losowy audyt raportu',
                randomReportAuditDescription:
                    'Wymagaj, aby niekt\u00F3re raporty by\u0142y zatwierdzane r\u0119cznie, nawet je\u015Bli kwalifikuj\u0105 si\u0119 do automatycznego zatwierdzenia.',
                autoPayApprovedReportsTitle: 'Automatyczne op\u0142acanie zatwierdzonych raport\u00F3w',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, kt\u00F3re raporty wydatk\u00F3w kwalifikuj\u0105 si\u0119 do automatycznej p\u0142atno\u015Bci.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) =>
                    `Prosz\u0119 wprowadzi\u0107 kwot\u0119 mniejsz\u0105 ni\u017C ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle:
                    'Przejd\u017A do wi\u0119cej funkcji i w\u0142\u0105cz przep\u0142ywy pracy, a nast\u0119pnie dodaj p\u0142atno\u015Bci, aby odblokowa\u0107 t\u0119 funkcj\u0119.',
                autoPayReportsUnderTitle: 'Raporty automatycznych p\u0142atno\u015Bci poni\u017Cej',
                autoPayReportsUnderDescription: 'Raporty wydatk\u00F3w w pe\u0142ni zgodne z przepisami poni\u017Cej tej kwoty b\u0119d\u0105 automatycznie op\u0142acane.',
                unlockFeatureGoToSubtitle: 'Przejd\u017A do',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `i w\u0142\u0105cz przep\u0142ywy pracy, a nast\u0119pnie dodaj ${featureName}, aby odblokowa\u0107 t\u0119 funkcj\u0119.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `i w\u0142\u0105cz ${featureName}, aby odblokowa\u0107 t\u0119 funkcj\u0119.`,
            },
            categoryRules: {
                title: 'Zasady kategorii',
                approver: 'Osoba zatwierdzaj\u0105ca',
                requireDescription: 'Wymagany opis',
                descriptionHint: 'Podpowied\u017A opisu',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Przypomnij pracownikom o dostarczeniu dodatkowych informacji dla wydatk\u00F3w z kategorii \u201E${categoryName}\u201D. Ta wskaz\u00F3wka pojawia si\u0119 w polu opisu wydatk\u00F3w.`,
                descriptionHintLabel: 'Wskaz\u00F3wka',
                descriptionHintSubtitle: 'Pro-tip: Im kr\u00F3cej, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznacz kwoty powy\u017Cej',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Dotyczy kategorii \u201E${categoryName}\u201D.`,
                flagAmountsOverSubtitle: 'To zast\u0119puje maksymaln\u0105 kwot\u0119 dla wszystkich wydatk\u00F3w.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle:
                        'Oznacz kwoty wydatk\u00F3w wed\u0142ug kategorii. Ta zasada zast\u0119puje og\u00F3ln\u0105 zasad\u0119 przestrzeni roboczej dotycz\u0105c\u0105 maksymalnej kwoty wydatk\u00F3w.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznacz ca\u0142kowite wydatki kategorii na raport wydatk\u00F3w.',
                },
                requireReceiptsOver: 'Wymagaj paragon\u00F3w powy\u017Cej',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domy\u015Blnie`,
                    never: 'Nigdy nie wymagaj paragon\u00F3w',
                    always: 'Zawsze wymagaj paragon\u00F3w',
                },
                defaultTaxRate: 'Domy\u015Blna stawka podatkowa',
                goTo: 'Przejd\u017A do',
                andEnableWorkflows: 'w\u0142\u0105cz przep\u0142ywy pracy, a nast\u0119pnie dodaj zatwierdzenia, aby odblokowa\u0107 t\u0119 funkcj\u0119.',
            },
            customRules: {
                title: 'Niestandardowe zasady',
                subtitle: 'Opis',
                description: 'Wprowad\u017A niestandardowe zasady dla raport\u00F3w wydatk\u00F3w',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Zbierz',
                    description: 'Dla zespo\u0142\u00F3w, kt\u00F3re chc\u0105 zautomatyzowa\u0107 swoje procesy.',
                },
                corporate: {
                    label: 'Kontrola',
                    description: 'Dla organizacji z zaawansowanymi wymaganiami.',
                },
            },
            description: 'Wybierz plan odpowiedni dla siebie. Aby uzyska\u0107 szczeg\u00F3\u0142ow\u0105 list\u0119 funkcji i cen, sprawd\u017A nasz\u0105',
            subscriptionLink: 'typy plan\u00F3w i strona pomocy dotycz\u0105ca cen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Zobowi\u0105za\u0142e\u015B si\u0119 do 1 aktywnego cz\u0142onka w planie Control do ko\u0144ca rocznej subskrypcji, kt\u00F3ra ko\u0144czy si\u0119 ${annualSubscriptionEndDate}. Mo\u017Cesz przej\u015B\u0107 na subskrypcj\u0119 p\u0142atn\u0105 za u\u017Cycie i zmieni\u0107 na plan Collect od ${annualSubscriptionEndDate}, wy\u0142\u0105czaj\u0105c automatyczne odnawianie w`,
                other: `Zobowi\u0105za\u0142e\u015B si\u0119 do ${count} aktywnych cz\u0142onk\u00F3w w planie Control do zako\u0144czenia rocznej subskrypcji ${annualSubscriptionEndDate}. Mo\u017Cesz przej\u015B\u0107 na subskrypcj\u0119 p\u0142atn\u0105 za u\u017Cycie i zmieni\u0107 na plan Collect od ${annualSubscriptionEndDate}, wy\u0142\u0105czaj\u0105c automatyczne odnawianie w`,
            }),
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jeste\u015Bmy tutaj, aby oczy\u015Bci\u0107 Twoj\u0105 drog\u0119 do wielko\u015Bci!',
        description: 'Wybierz jedn\u0105 z poni\u017Cszych opcji wsparcia:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Zaplanuj rozmow\u0119 wst\u0119pn\u0105',
        scheduleACall: 'Zaplanuj rozmow\u0119',
        questionMarkButtonTooltip: 'Uzyskaj pomoc od naszego zespo\u0142u',
        exploreHelpDocs: 'Przegl\u0105daj dokumenty pomocy',
        registerForWebinar: 'Zarejestruj si\u0119 na webinar',
        onboardingHelp: 'Pomoc przy wdra\u017Caniu',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Zmie\u0144 domy\u015Blny odcie\u0144 sk\u00F3ry',
        headers: {
            frequentlyUsed: 'Cz\u0119sto u\u017Cywane',
            smileysAndEmotion: 'Emotikony i emocje',
            peopleAndBody: 'Ludzie i cia\u0142o',
            animalsAndNature: 'Zwierz\u0119ta i natura',
            foodAndDrink: 'Jedzenie i napoje',
            travelAndPlaces: 'Podr\u00F3\u017Ce i miejsca',
            activities: 'Aktywno\u015Bci',
            objects: 'Obiekty',
            symbols: 'Symbole',
            flags: 'Flagi',
        },
    },
    newRoomPage: {
        newRoom: 'Nowy pok\u00F3j',
        groupName: 'Nazwa grupy',
        roomName: 'Nazwa pokoju',
        visibility: 'Widoczno\u015B\u0107',
        restrictedDescription: 'Osoby w Twojej przestrzeni roboczej mog\u0105 znale\u017A\u0107 ten pok\u00F3j',
        privateDescription: 'Osoby zaproszone do tego pokoju mog\u0105 go znale\u017A\u0107',
        publicDescription: 'Ka\u017Cdy mo\u017Ce znale\u017A\u0107 ten pok\u00F3j',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Ka\u017Cdy mo\u017Ce znale\u017A\u0107 ten pok\u00F3j',
        createRoom: 'Utw\u00F3rz pok\u00F3j',
        roomAlreadyExistsError: 'Pok\u00F3j o tej nazwie ju\u017C istnieje',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) =>
            `${reservedName} jest domy\u015Blnym pokojem we wszystkich przestrzeniach roboczych. Prosz\u0119 wybra\u0107 inn\u0105 nazw\u0119.`,
        roomNameInvalidError: 'Nazwy pokoi mog\u0105 zawiera\u0107 tylko ma\u0142e litery, cyfry i my\u015Blniki',
        pleaseEnterRoomName: 'Prosz\u0119 wprowadzi\u0107 nazw\u0119 pokoju',
        pleaseSelectWorkspace: 'Prosz\u0119 wybra\u0107 przestrze\u0144 robocz\u0105',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport
                ? `${actor}zmieni\u0142 nazw\u0119 na "${newName}" (wcze\u015Bniej "${oldName}")`
                : `${actor}zmieni\u0142 nazw\u0119 tego pokoju na "${newName}" (wcze\u015Bniej "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Pok\u00F3j przemianowany na ${newName}`,
        social: 'social',
        selectAWorkspace: 'Wybierz przestrze\u0144 robocz\u0105',
        growlMessageOnRenameError: 'Nie mo\u017Cna zmieni\u0107 nazwy pokoju roboczego. Prosz\u0119 sprawdzi\u0107 po\u0142\u0105czenie i spr\u00F3bowa\u0107 ponownie.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Prywatne',
            public: 'Publiczny',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Og\u0142oszenie publiczne',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Prze\u015Blij i Zamknij',
        submitAndApprove: 'Prze\u015Blij i Zatwierd\u017A',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `dodano ${approverName} (${approverEmail}) jako zatwierdzaj\u0105cego dla ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `usuni\u0119to ${approverName} (${approverEmail}) jako zatwierdzaj\u0105cego dla ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `zmieniono zatwierdzaj\u0105cego dla ${field} "${name}" na ${formatApprover(newApproverName, newApproverEmail)} (wcze\u015Bniej ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `doda\u0142 kategori\u0119 "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `usuni\u0119to kategori\u0119 "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'wy\u0142\u0105czony' : 'w\u0142\u0105czony'} kategoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `doda\u0142 kod p\u0142acowy "${newValue}" do kategorii "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `usuni\u0119to kod p\u0142acowy "${oldValue}" z kategorii "${categoryName}"`;
            }
            return `zmieniono kod p\u0142acowy kategorii "${categoryName}" na \u201E${newValue}\u201D (wcze\u015Bniej \u201E${oldValue}\u201D)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `doda\u0142 kod GL "${newValue}" do kategorii "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `usuni\u0119to kod GL "${oldValue}" z kategorii "${categoryName}"`;
            }
            return `zmieniono kod GL kategorii \u201E${categoryName}\u201D na \u201E${newValue}\u201D (wcze\u015Bniej \u201E${oldValue}\u201D)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `zmieniono opis kategorii "${categoryName}" na ${!oldValue ? 'wymagane' : 'nie wymagane'} (wcze\u015Bniej ${!oldValue ? 'nie wymagane' : 'wymagane'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `dodano maksymaln\u0105 kwot\u0119 ${newAmount} do kategorii "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `usuni\u0119to maksymaln\u0105 kwot\u0119 ${oldAmount} z kategorii "${categoryName}"`;
            }
            return `zmieniono maksymaln\u0105 kwot\u0119 kategorii "${categoryName}" na ${newAmount} (wcze\u015Bniej ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `doda\u0142 limit typu ${newValue} do kategorii "${categoryName}"`;
            }
            return `zmieniono typ limitu kategorii "${categoryName}" na ${newValue} (wcze\u015Bniej ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategori\u0119 "${categoryName}", zmieniaj\u0105c paragony na ${newValue}`;
            }
            return `zmieniono kategori\u0119 "${categoryName}" na ${newValue} (wcze\u015Bniej ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmieniono nazw\u0119 kategorii z "${oldName}" na "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `usuni\u0119to opis "${oldValue}" z kategorii "${categoryName}"`;
            }
            return !oldValue
                ? `doda\u0142 opis "${newValue}" do kategorii "${categoryName}"`
                : `zmieniono podpowied\u017A opisu kategorii "${categoryName}" na \u201E${newValue}\u201D (wcze\u015Bniej \u201E${oldValue}\u201D)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmieniono nazw\u0119 listy tag\u00F3w na "${newName}" (wcze\u015Bniej "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `doda\u0142 tag "${tagName}" do listy "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `zaktualizowano list\u0119 tag\u00F3w "${tagListName}" poprzez zmian\u0119 tagu "${oldName}" na "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) =>
            `${enabled ? 'w\u0142\u0105czony' : 'wy\u0142\u0105czony'} tag "${tagName}" na li\u015Bcie "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `usuni\u0119to tag "${tagName}" z listy "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `usuni\u0119to tagi "${count}" z listy "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `zaktualizowano tag "${tagName}" na li\u015Bcie "${tagListName}", zmieniaj\u0105c ${updatedField} na "${newValue}" (wcze\u015Bniej "${oldValue}")`;
            }
            return `zaktualizowano tag "${tagName}" na li\u015Bcie "${tagListName}" poprzez dodanie ${updatedField} o warto\u015Bci "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `zmieniono ${customUnitName} ${updatedField} na "${newValue}" (wcze\u015Bniej "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) =>
            `${newValue ? 'w\u0142\u0105czony' : 'wy\u0142\u0105czony'} \u015Bledzenie podatk\u00F3w na podstawie stawek za odleg\u0142o\u015B\u0107`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `doda\u0142 now\u0105 stawk\u0119 "${customUnitName}" o nazwie "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `zmieni\u0142 stawk\u0119 ${customUnitName} ${updatedField} "${customUnitRateName}" na "${newValue}" (wcze\u015Bniej "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `zmieniono stawk\u0119 podatkow\u0105 na stawce dystansowej "${customUnitRateName}" na "${newValue} (${newTaxPercentage})" (wcze\u015Bniej "${oldValue} (${oldTaxPercentage})")`;
            }
            return `doda\u0142 stawk\u0119 podatku "${newValue} (${newTaxPercentage})" do stawki za odleg\u0142o\u015B\u0107 "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `zmieniono cz\u0119\u015B\u0107 podatku podlegaj\u0105c\u0105 zwrotowi na stawce dystansu "${customUnitRateName}" na "${newValue}" (wcze\u015Bniej "${oldValue}")`;
            }
            return `doda\u0142 cz\u0119\u015B\u0107 podlegaj\u0105c\u0105 zwrotowi podatku "${newValue}" do stawki za odleg\u0142o\u015B\u0107 "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `usuni\u0119to stawk\u0119 "${rateName}" dla "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `dodano pole raportu ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `ustaw domy\u015Bln\u0105 warto\u015B\u0107 pola raportu "${fieldName}" na "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `doda\u0142 opcj\u0119 "${optionName}" do pola raportu "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `usuni\u0119to opcj\u0119 "${optionName}" z pola raportu "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'w\u0142\u0105czony' : 'wy\u0142\u0105czony'} opcja \u201E${optionName}\u201D dla pola raportu \u201E${fieldName}\u201D`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'w\u0142\u0105czony' : 'wy\u0142\u0105czony'} wszystkie opcje dla pola raportu "${fieldName}"`;
            }
            return `${allEnabled ? 'w\u0142\u0105czony' : 'wy\u0142\u0105czony'} opcja "${optionName}" dla pola raportu "${fieldName}", co powoduje, \u017Ce wszystkie opcje s\u0105 ${allEnabled ? 'w\u0142\u0105czony' : 'wy\u0142\u0105czony'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `usuni\u0119to pole raportu ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `zaktualizowano "Prevent self-approval" na "${newValue === 'true' ? 'W\u0142\u0105czony' : 'Wy\u0142\u0105czony'}" (wcze\u015Bniej "${oldValue === 'true' ? 'W\u0142\u0105czony' : 'Wy\u0142\u0105czony'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmieniono maksymaln\u0105 wymagan\u0105 kwot\u0119 wydatku na ${newValue} (wcze\u015Bniej ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmieniono maksymaln\u0105 kwot\u0119 wydatku dla narusze\u0144 na ${newValue} (wcze\u015Bniej ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano "Maksymalny wiek wydatku (dni)" na "${newValue}" (wcze\u015Bniej "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `ustaw dat\u0119 przesy\u0142ania miesi\u0119cznego raportu na "${newValue}"`;
            }
            return `zaktualizowano dat\u0119 sk\u0142adania miesi\u0119cznego raportu na "${newValue}" (poprzednio "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano "Ponownie obci\u0105\u017C wydatki klient\u00F3w" na "${newValue}" (wcze\u015Bniej "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) =>
            `w\u0142\u0105czono "Wymuszaj domy\u015Blne tytu\u0142y raport\u00F3w" ${value ? 'na' : 'wy\u0142\u0105czone'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) =>
            `zaktualizowano nazw\u0119 tej przestrzeni roboczej na "${newName}" (wcze\u015Bniej "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `ustaw opis tego miejsca pracy na "${newDescription}"`
                : `zaktualizowa\u0142 opis tego miejsca pracy na "${newDescription}" (wcze\u015Bniej "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('i');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `usuni\u0119to Ci\u0119 z procesu zatwierdzania i czatu wydatk\u00F3w ${joinedNames}. Wcze\u015Bniej przes\u0142ane raporty b\u0119d\u0105 nadal dost\u0119pne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
                other: `usun\u0105\u0142 ci\u0119 z przep\u0142yw\u00F3w zatwierdzania i czat\u00F3w wydatk\u00F3w ${joinedNames}. Wcze\u015Bniej przes\u0142ane raporty b\u0119d\u0105 nadal dost\u0119pne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `zaktualizowano Twoj\u0105 rol\u0119 w ${policyName} z ${oldRole} na u\u017Cytkownika. Zosta\u0142e\u015B usuni\u0119ty ze wszystkich czat\u00F3w wydatk\u00F3w nadawcy, z wyj\u0105tkiem w\u0142asnych.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) =>
            `zaktualizowano domy\u015Bln\u0105 walut\u0119 na ${newCurrency} (wcze\u015Bniej ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `zaktualizowano cz\u0119stotliwo\u015B\u0107 automatycznego raportowania na "${newFrequency}" (wcze\u015Bniej "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `zaktualizowano tryb zatwierdzania na "${newValue}" (wcze\u015Bniej "${oldValue}")`,
        upgradedWorkspace: 'uaktualni\u0142 t\u0119 przestrze\u0144 robocz\u0105 do planu Control',
        downgradedWorkspace: 'obni\u017Cy\u0142 ten przestrze\u0144 robocz\u0105 do planu Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `zmieniono wska\u017Anik raport\u00F3w losowo kierowanych do r\u0119cznej akceptacji na ${Math.round(newAuditRate * 100)}% (wcze\u015Bniej ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `zmieni\u0142 limit r\u0119cznego zatwierdzania dla wszystkich wydatk\u00F3w na ${newLimit} (wcze\u015Bniej ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Nie znaleziono cz\u0142onka.',
        useInviteButton: 'Aby zaprosi\u0107 nowego cz\u0142onka do czatu, u\u017Cyj przycisku zaproszenia powy\u017Cej.',
        notAuthorized: `Nie masz dost\u0119pu do tej strony. Je\u015Bli pr\u00F3bujesz do\u0142\u0105czy\u0107 do tego pokoju, popro\u015B cz\u0142onka pokoju, aby Ci\u0119 doda\u0142. Co\u015B innego? Skontaktuj si\u0119 z ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Czy na pewno chcesz usun\u0105\u0107 ${memberName} z pokoju?`,
            other: 'Czy na pewno chcesz usun\u0105\u0107 wybranych cz\u0142onk\u00F3w z pokoju?',
        }),
        error: {
            genericAdd: 'Wyst\u0105pi\u0142 problem z dodaniem tego cz\u0142onka pokoju',
        },
    },
    newTaskPage: {
        assignTask: 'Przypisz zadanie',
        assignMe: 'Przypisz do mnie',
        confirmTask: 'Potwierd\u017A zadanie',
        confirmError: 'Prosz\u0119 wprowadzi\u0107 tytu\u0142 i wybra\u0107 miejsce udost\u0119pnienia',
        descriptionOptional: 'Opis (opcjonalnie)',
        pleaseEnterTaskName: 'Prosz\u0119 wprowadzi\u0107 tytu\u0142',
        pleaseEnterTaskDestination: 'Prosz\u0119 wybra\u0107, gdzie chcesz udost\u0119pni\u0107 to zadanie',
    },
    task: {
        task: 'Zadanie',
        title: 'Tytu\u0142',
        description: 'Opis',
        assignee: 'Przypisany',
        completed: 'Zako\u0144czono',
        action: 'Zako\u0144czono',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `zadanie dla ${title}`,
            completed: 'oznaczone jako uko\u0144czone',
            canceled: 'usuni\u0119te zadanie',
            reopened: 'oznaczone jako niekompletne',
            error: 'Nie masz uprawnie\u0144 do wykonania \u017C\u0105danej akcji.',
        },
        markAsComplete: 'Oznacz jako uko\u0144czone',
        markAsIncomplete: 'Oznacz jako niekompletne',
        assigneeError: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas przypisywania tego zadania. Prosz\u0119 spr\u00F3bowa\u0107 z innym przypisanym.',
        genericCreateTaskFailureMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas tworzenia tego zadania. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        deleteTask: 'Usu\u0144 zadanie',
        deleteConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 to zadanie?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `wyci\u0105g za ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Skr\u00F3ty klawiaturowe',
        subtitle: 'Oszcz\u0119dzaj czas dzi\u0119ki tym przydatnym skr\u00F3tom klawiaturowym:',
        shortcuts: {
            openShortcutDialog: 'Otwiera okno dialogowe skr\u00F3t\u00F3w klawiaturowych',
            markAllMessagesAsRead: 'Oznacz wszystkie wiadomo\u015Bci jako przeczytane',
            escape: 'Dialogi ucieczki',
            search: 'Otw\u00F3rz okno wyszukiwania',
            newChat: 'Nowy ekran czatu',
            copy: 'Skopiuj komentarz',
            openDebug: 'Otw\u00F3rz okno dialogowe preferencji testowania',
        },
    },
    guides: {
        screenShare: 'Udost\u0119pnianie ekranu',
        screenShareRequest: 'Expensify zaprasza Ci\u0119 do udost\u0119pnienia ekranu',
    },
    search: {
        resultsAreLimited: 'Wyniki wyszukiwania s\u0105 ograniczone.',
        viewResults: 'Wy\u015Bwietl wyniki',
        resetFilters: 'Zresetuj filtry',
        searchResults: {
            emptyResults: {
                title: 'Brak danych do wy\u015Bwietlenia',
                subtitle: 'Spr\u00F3buj dostosowa\u0107 kryteria wyszukiwania lub utw\u00F3rz co\u015B za pomoc\u0105 zielonego przycisku +.',
            },
            emptyExpenseResults: {
                title: 'Nie utworzy\u0142e\u015B jeszcze \u017Cadnych wydatk\u00F3w.',
                subtitle: 'Utw\u00F3rz wydatek lub wypr\u00F3buj Expensify, aby dowiedzie\u0107 si\u0119 wi\u0119cej.',
                subtitleWithOnlyCreateButton: 'U\u017Cyj zielonego przycisku poni\u017Cej, aby utworzy\u0107 wydatek.',
            },
            emptyReportResults: {
                title: 'Nie utworzy\u0142e\u015B jeszcze \u017Cadnych raport\u00F3w',
                subtitle: 'Utw\u00F3rz raport lub wypr\u00F3buj Expensify, aby dowiedzie\u0107 si\u0119 wi\u0119cej.',
                subtitleWithOnlyCreateButton: 'U\u017Cyj zielonego przycisku poni\u017Cej, aby utworzy\u0107 raport.',
            },
            emptyInvoiceResults: {
                title: 'Nie utworzy\u0142e\u015B jeszcze \u017Cadnych faktur.',
                subtitle: 'Wy\u015Blij faktur\u0119 lub wypr\u00F3buj Expensify, aby dowiedzie\u0107 si\u0119 wi\u0119cej.',
                subtitleWithOnlyCreateButton: 'U\u017Cyj zielonego przycisku poni\u017Cej, aby wys\u0142a\u0107 faktur\u0119.',
            },
            emptyTripResults: {
                title: 'Brak podr\u00F3\u017Cy do wy\u015Bwietlenia',
                subtitle: 'Rozpocznij, rezerwuj\u0105c swoj\u0105 pierwsz\u0105 podr\u00F3\u017C poni\u017Cej.',
                buttonText: 'Zarezerwuj podr\u00F3\u017C',
            },
            emptySubmitResults: {
                title: 'Brak wydatk\u00F3w do zg\u0142oszenia',
                subtitle: 'Wszystko w porz\u0105dku. Zr\u00F3b rund\u0119 zwyci\u0119stwa!',
                buttonText: 'Utw\u00F3rz raport',
            },
            emptyApproveResults: {
                title: 'Brak wydatk\u00F3w do zatwierdzenia',
                subtitle: 'Zero wydatk\u00F3w. Maksymalny relaks. Dobra robota!',
            },
            emptyPayResults: {
                title: 'Brak wydatk\u00F3w do zap\u0142aty',
                subtitle: 'Gratulacje! Przekroczy\u0142e\u015B lini\u0119 mety.',
            },
            emptyExportResults: {
                title: 'Brak wydatk\u00F3w do wyeksportowania',
                subtitle: 'Czas na relaks, dobra robota.',
            },
        },
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usu\u0144 zapisane wyszukiwanie',
        deleteSavedSearchConfirm: 'Czy na pewno chcesz usun\u0105\u0107 to wyszukiwanie?',
        searchName: 'Szukaj imienia',
        savedSearchesMenuItemTitle: 'Zapisano',
        groupedExpenses: 'pogrupowane wydatki',
        bulkActions: {
            approve: 'Zatwierd\u017A',
            pay: 'Zap\u0142a\u0107',
            delete: 'Usu\u0144',
            hold: 'Trzymaj',
            unhold: 'Usu\u0144 blokad\u0119',
            noOptionsAvailable: 'Brak dost\u0119pnych opcji dla wybranej grupy wydatk\u00F3w.',
        },
        filtersHeader: 'Filtry',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Przed ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Po ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
            },
            status: 'Status',
            keyword: 'S\u0142owo kluczowe',
            hasKeywords: 'Ma s\u0142owa kluczowe',
            currency: 'Waluta',
            link: 'Link',
            pinned: 'Przypi\u0119te',
            unread: 'Nieprzeczytane',
            completed: 'Zako\u0144czono',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Mniej ni\u017C ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Wi\u0119ksze ni\u017C ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Pomi\u0119dzy ${greaterThan} a ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Indywidualne karty',
                closedCards: 'Zamkni\u0119te karty',
                cardFeeds: 'Kana\u0142y kart',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Wszystkie ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Wszystkie zaimportowane karty CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Bie\u017C\u0105cy',
            past: 'Przesz\u0142o\u015B\u0107',
            submitted: 'Data z\u0142o\u017Cenia',
            approved: 'Data zatwierdzenia',
            paid: 'Data p\u0142atno\u015Bci',
            exported: 'Wyeksportowana data',
            posted: 'Data opublikowania',
            billable: 'Billable',
            reimbursable: 'Zwrotny',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Ten raport nie zawiera wydatk\u00F3w.',
            emptyStateSubtitle: 'Mo\u017Cesz doda\u0107 wydatki do tego raportu, u\u017Cywaj\u0105c przycisku powy\u017Cej.',
        },
        noCategory: 'Brak kategorii',
        noTag: 'Brak tagu',
        expenseType: 'Typ wydatku',
        recentSearches: 'Ostatnie wyszukiwania',
        recentChats: 'Ostatnie czaty',
        searchIn: 'Szukaj w',
        searchPlaceholder: 'Wyszukaj co\u015B',
        suggestions: 'Sugestie',
        exportSearchResults: {
            title: 'Utw\u00F3rz eksport',
            description: 'Wow, to du\u017Co przedmiot\u00F3w! Spakujemy je, a Concierge wkr\u00F3tce wy\u015Ble Ci plik.',
        },
        exportAll: {
            selectAllMatchingItems: 'Wybierz wszystkie pasuj\u0105ce elementy',
            allMatchingItemsSelected: 'Wszystkie pasuj\u0105ce elementy zosta\u0142y wybrane',
        },
    },
    genericErrorPage: {
        title: 'Ups, co\u015B posz\u0142o nie tak!',
        body: {
            helpTextMobile: 'Prosz\u0119 zamkn\u0105\u0107 i ponownie otworzy\u0107 aplikacj\u0119 lub prze\u0142\u0105czy\u0107 si\u0119 na',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Je\u015Bli problem b\u0119dzie si\u0119 powtarza\u0142, skontaktuj si\u0119 z',
        },
        refresh: 'Od\u015Bwie\u017C',
    },
    fileDownload: {
        success: {
            title: 'Pobrano!',
            message: 'Za\u0142\u0105cznik zosta\u0142 pomy\u015Blnie pobrany!',
            qrMessage:
                'Sprawd\u017A folder ze zdj\u0119ciami lub pobranymi plikami, aby znale\u017A\u0107 kopi\u0119 swojego kodu QR. Porada: Dodaj go do prezentacji, aby Twoja publiczno\u015B\u0107 mog\u0142a zeskanowa\u0107 i po\u0142\u0105czy\u0107 si\u0119 z Tob\u0105 bezpo\u015Brednio.',
        },
        generalError: {
            title: 'B\u0142\u0105d za\u0142\u0105cznika',
            message: 'Za\u0142\u0105cznik nie mo\u017Ce zosta\u0107 pobrany',
        },
        permissionError: {
            title: 'Dost\u0119p do pami\u0119ci masowej',
            message: 'Expensify nie mo\u017Ce zapisa\u0107 za\u0142\u0105cznik\u00F3w bez dost\u0119pu do pami\u0119ci. Stuknij ustawienia, aby zaktualizowa\u0107 uprawnienia.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nowy Expensify',
        about: 'O Nowym Expensify',
        update: 'Zaktualizuj New Expensify',
        checkForUpdates: 'Sprawd\u017A aktualizacje',
        toggleDevTools: 'Prze\u0142\u0105cz Narz\u0119dzia Deweloperskie',
        viewShortcuts: 'Wy\u015Bwietl skr\u00F3ty klawiaturowe',
        services: 'Us\u0142ugi',
        hide: 'Ukryj New Expensify',
        hideOthers: 'Ukryj pozosta\u0142e',
        showAll: 'Poka\u017C wszystkie',
        quit: 'Zrezygnuj z New Expensify',
        fileMenu: 'Plik',
        closeWindow: 'Zamknij okno',
        editMenu: 'Edytuj',
        undo: 'Cofnij',
        redo: 'Powt\u00F3rz',
        cut: 'Wytnij',
        copy: 'Kopiuj',
        paste: 'Wklej',
        pasteAndMatchStyle: 'Wklej i Dopasuj Styl',
        pasteAsPlainText: 'Wklej jako zwyk\u0142y tekst',
        delete: 'Usu\u0144',
        selectAll: 'Zaznacz wszystko',
        speechSubmenu: 'Mowa',
        startSpeaking: 'Zacznij m\u00F3wi\u0107',
        stopSpeaking: 'Przesta\u0144 m\u00F3wi\u0107',
        viewMenu: 'Widok',
        reload: 'Prze\u0142aduj',
        forceReload: 'Wymu\u015B ponowne za\u0142adowanie',
        resetZoom: 'Rzeczywisty rozmiar',
        zoomIn: 'Powi\u0119ksz',
        zoomOut: 'Oddal.',
        togglefullscreen: 'Prze\u0142\u0105cz pe\u0142ny ekran',
        historyMenu: 'Historia',
        back: 'Wstecz',
        forward: 'Przeka\u017C dalej',
        windowMenu: 'Okno',
        minimize: 'Zminimalizuj',
        zoom: 'Zoom',
        front: 'Przenie\u015B wszystko na wierzch',
        helpMenu: 'Pomoc',
        learnMore: 'Dowiedz si\u0119 wi\u0119cej',
        documentation: 'Dokumentacja',
        communityDiscussions: 'Dyskusje Spo\u0142eczno\u015Bciowe',
        searchIssues: 'Wyszukaj problemy',
    },
    historyMenu: {
        forward: 'Przeka\u017C dalej',
        back: 'Wstecz',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Dost\u0119pna aktualizacja',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Nowa wersja b\u0119dzie dost\u0119pna wkr\u00F3tce.${!isSilentUpdating ? 'Poinformujemy Ci\u0119, gdy b\u0119dziemy gotowi do aktualizacji.' : ''}`,
            soundsGood: 'Brzmi dobrze',
        },
        notAvailable: {
            title: 'Aktualizacja niedost\u0119pna',
            message: 'Obecnie nie ma dost\u0119pnych aktualizacji. Prosz\u0119 sprawdzi\u0107 ponownie p\u00F3\u017Aniej!',
            okay: 'Okay',
        },
        error: {
            title: 'Aktualizacja nie powiod\u0142a si\u0119',
            message: 'Nie mogli\u015Bmy sprawdzi\u0107 aktualizacji. Spr\u00F3buj ponownie za chwil\u0119.',
        },
    },
    report: {
        newReport: {
            createReport: 'Utw\u00F3rz raport',
            chooseWorkspace: 'Wybierz przestrze\u0144 robocz\u0105 dla tego raportu.',
        },
        genericCreateReportFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas tworzenia tego czatu. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        genericAddCommentFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas publikowania komentarza. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        genericUpdateReportFieldFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas aktualizacji pola. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        genericUpdateReportNameEditFailureMessage: 'Nieoczekiwany b\u0142\u0105d podczas zmiany nazwy raportu. Prosz\u0119 spr\u00F3bowa\u0107 ponownie p\u00F3\u017Aniej.',
        noActivityYet: 'Brak aktywno\u015Bci na razie',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `zmieniono ${fieldName} z ${oldValue} na ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `zmieniono ${fieldName} na ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `zmieniono przestrze\u0144 robocz\u0105 na ${toPolicyName}${fromPolicyName ? `(uprzednio ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `zmieniono typ z ${oldType} na ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `wys\u0142a\u0142 ten raport do ${delegateUser}, poniewa\u017C ${originalManager} jest na urlopie`,
                exportedToCSV: `wyeksportowane do CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `wyeksportowano do ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `wyeksportowano do ${label} przez`,
                    automaticActionTwo: 'ustawienia ksi\u0119gowe',
                    manual: ({label}: ExportedToIntegrationParams) => `oznaczy\u0142 ten raport jako r\u0119cznie wyeksportowany do ${label}.`,
                    automaticActionThree: 'i pomy\u015Blnie utworzono rekord dla',
                    reimburseableLink: 'wydatki z w\u0142asnej kieszeni',
                    nonReimbursableLink: 'wydatki na firmow\u0105 kart\u0119',
                    pending: ({label}: ExportedToIntegrationParams) => `rozpocz\u0119to eksportowanie tego raportu do ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `nie uda\u0142o si\u0119 wyeksportowa\u0107 tego raportu do ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `doda\u0142 paragon`,
                managerDetachReceipt: `usuni\u0119to paragon`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `zap\u0142acono ${currency}${amount} gdzie indziej`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `zap\u0142acono ${currency}${amount} przez integracj\u0119`,
                outdatedBankAccount: `nie mo\u017Cna by\u0142o przetworzy\u0107 p\u0142atno\u015Bci z powodu problemu z kontem bankowym p\u0142atnika`,
                reimbursementACHBounce: `nie mo\u017Cna przetworzy\u0107 p\u0142atno\u015Bci, poniewa\u017C p\u0142atnik nie ma wystarczaj\u0105cych \u015Brodk\u00F3w`,
                reimbursementACHCancelled: `anulowano p\u0142atno\u015B\u0107`,
                reimbursementAccountChanged: `nie mo\u017Cna by\u0142o przetworzy\u0107 p\u0142atno\u015Bci, poniewa\u017C p\u0142atnik zmieni\u0142 konto bankowe`,
                reimbursementDelayed: `przetworzono p\u0142atno\u015B\u0107, ale jest op\u00F3\u017Aniona o 1-2 dni robocze wi\u0119cej`,
                selectedForRandomAudit: `losowo wybrany do przegl\u0105du`,
                selectedForRandomAuditMarkdown: `[losowo wybrany](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) do przegl\u0105du`,
                share: ({to}: ShareParams) => `zaproszony cz\u0142onek ${to}`,
                unshare: ({to}: UnshareParams) => `usuni\u0119to cz\u0142onka ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `zap\u0142acono ${currency}${amount}`,
                takeControl: `przej\u0105\u0142 kontrol\u0119`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) =>
                    `nie uda\u0142o si\u0119 zsynchronizowa\u0107 z ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `dodano ${email} jako ${role === 'member' ? 'a' : 'an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `zaktualizowano rol\u0119 ${email} na ${newRole} (wcze\u015Bniej ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usuni\u0119to pole niestandardowe 1 u\u017Cytkownika ${email} (wcze\u015Bniej "${previousValue}")`;
                    }
                    return !previousValue
                        ? `dodano "${newValue}" do pola niestandardowego 1 u\u017Cytkownika ${email}`
                        : `zmieniono pole niestandardowe 1 u\u017Cytkownika ${email} na "${newValue}" (wcze\u015Bniej "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usuni\u0119to pole niestandardowe 2 u\u017Cytkownika ${email} (wcze\u015Bniej \u201E${previousValue}\u201D)`;
                    }
                    return !previousValue
                        ? `doda\u0142 \u201E${newValue}\u201D do pola niestandardowego 2 u\u017Cytkownika ${email}`
                        : `zmieniono pole niestandardowe 2 u\u017Cytkownika ${email} na "${newValue}" (wcze\u015Bniej "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} opu\u015Bci\u0142 miejsce pracy`,
                removeMember: ({email, role}: AddEmployeeParams) => `usuni\u0119to ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `usuni\u0119to po\u0142\u0105czenie z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `po\u0142\u0105czono z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'opu\u015Bci\u0142 czat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} dla ${dayCount} ${dayCount === 1 ? 'dzie\u0144' : 'dni'} do ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} z ${timePeriod} dnia ${date}`,
    },
    footer: {
        features: 'Funkcje',
        expenseManagement: 'Zarz\u0105dzanie wydatkami',
        spendManagement: 'Zarz\u0105dzanie wydatkami',
        expenseReports: 'Raporty wydatk\u00F3w',
        companyCreditCard: 'Karta Kredytowa Firmy',
        receiptScanningApp: 'Aplikacja do skanowania paragon\u00F3w',
        billPay: 'Bill Pay',
        invoicing: 'Fakturowanie',
        CPACard: 'Karta CPA',
        payroll: 'Payroll',
        travel: 'Podr\u00F3\u017Cowa\u0107',
        resources: 'Zasoby',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Wsparcie',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Warunki korzystania z us\u0142ugi',
        privacy: 'Prywatno\u015B\u0107',
        learnMore: 'Dowiedz si\u0119 wi\u0119cej',
        aboutExpensify: 'O Expensify',
        blog: 'Blog',
        jobs: 'Jobs',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relacje Inwestorskie',
        getStarted: 'Rozpocznij',
        createAccount: 'Utw\u00F3rz nowe konto',
        logIn: 'Zaloguj si\u0119',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Przejd\u017A z powrotem do listy czat\u00F3w',
        chatWelcomeMessage: 'Wiadomo\u015B\u0107 powitalna czatu',
        navigatesToChat: 'Przechodzi do czatu',
        newMessageLineIndicator: 'Nowy wska\u017Anik linii wiadomo\u015Bci',
        chatMessage: 'Wiadomo\u015B\u0107 czatu',
        lastChatMessagePreview: 'Podgl\u0105d ostatniej wiadomo\u015Bci czatu',
        workspaceName: 'Nazwa przestrzeni roboczej',
        chatUserDisplayNames: 'Nazwy wy\u015Bwietlane cz\u0142onk\u00F3w czatu',
        scrollToNewestMessages: 'Przewi\u0144 do najnowszych wiadomo\u015Bci',
        preStyledText: 'Wst\u0119pnie stylizowany tekst',
        viewAttachment: 'Zobacz za\u0142\u0105cznik',
    },
    parentReportAction: {
        deletedReport: 'Usuni\u0119ty raport',
        deletedMessage: 'Usuni\u0119ta wiadomo\u015B\u0107',
        deletedExpense: 'Usuni\u0119ty wydatek',
        reversedTransaction: 'Transakcja odwr\u00F3cona',
        deletedTask: 'Usuni\u0119te zadanie',
        hiddenMessage: 'Ukryta wiadomo\u015B\u0107',
    },
    threads: {
        thread: 'W\u0105tek',
        replies: 'Odpowiedzi',
        reply: 'Odpowiedz',
        from: 'Od',
        in: 'w',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Od ${reportName}${workspaceName ? `w ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Skopiuj URL',
        copied: 'Skopiowano!',
    },
    moderation: {
        flagDescription: 'Wszystkie oznaczone wiadomo\u015Bci zostan\u0105 wys\u0142ane do moderatora do przegl\u0105du.',
        chooseAReason: 'Wybierz pow\u00F3d oznaczenia poni\u017Cej:',
        spam: 'Spam',
        spamDescription: 'Niechciana promocja niezwi\u0105zana z tematem',
        inconsiderate: 'Nieuprzejmy',
        inconsiderateDescription: 'Obra\u017Caj\u0105ce lub lekcewa\u017C\u0105ce sformu\u0142owania, o w\u0105tpliwych intencjach',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne d\u0105\u017Cenie do realizacji planu pomimo uzasadnionych zastrze\u017Ce\u0144',
        bullying: 'Zastraszanie',
        bullyingDescription: 'Celowanie w jednostk\u0119 w celu uzyskania pos\u0142usze\u0144stwa',
        harassment: 'N\u0119kanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne szeroko dyskryminuj\u0105ce zachowanie',
        assault: 'Napa\u015B\u0107',
        assaultDescription: 'Celowo ukierunkowany atak emocjonalny z zamiarem wyrz\u0105dzenia krzywdy',
        flaggedContent: 'Ta wiadomo\u015B\u0107 zosta\u0142a oznaczona jako naruszaj\u0105ca nasze zasady spo\u0142eczno\u015Bci i jej tre\u015B\u0107 zosta\u0142a ukryta.',
        hideMessage: 'Ukryj wiadomo\u015B\u0107',
        revealMessage: 'Poka\u017C wiadomo\u015B\u0107',
        levelOneResult: 'Wysy\u0142a anonimowe ostrze\u017Cenie, a wiadomo\u015B\u0107 jest zg\u0142aszana do przegl\u0105du.',
        levelTwoResult: 'Wiadomo\u015B\u0107 ukryta z kana\u0142u, plus anonimowe ostrze\u017Cenie i wiadomo\u015B\u0107 zg\u0142oszona do przegl\u0105du.',
        levelThreeResult: 'Wiadomo\u015B\u0107 usuni\u0119ta z kana\u0142u, dodano anonimowe ostrze\u017Cenie i wiadomo\u015B\u0107 zosta\u0142a zg\u0142oszona do przegl\u0105du.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Zapro\u015B ich',
        nothing: 'Nie r\u00F3b nic.',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Zaakceptuj',
        decline: 'Odrzu\u0107',
    },
    actionableMentionTrackExpense: {
        submit: 'Prze\u015Blij to komu\u015B',
        categorize: 'Skategoryzuj to',
        share: 'Udost\u0119pnij to mojemu ksi\u0119gowemu',
        nothing: 'Nic na razie',
    },
    teachersUnitePage: {
        teachersUnite: 'Nauczyciele Razem',
        joinExpensifyOrg:
            'Do\u0142\u0105cz do Expensify.org w eliminowaniu niesprawiedliwo\u015Bci na ca\u0142ym \u015Bwiecie. Obecna kampania "Teachers Unite" wspiera nauczycieli wsz\u0119dzie, dziel\u0105c koszty niezb\u0119dnych materia\u0142\u00F3w szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Doskona\u0142e! Prosz\u0119 podziel si\u0119 ich informacjami, aby\u015Bmy mogli si\u0119 z nimi skontaktowa\u0107.',
        introSchoolPrincipal: 'Wprowadzenie do dyrektora szko\u0142y',
        schoolPrincipalVerifyExpense:
            'Expensify.org dzieli koszty niezb\u0119dnych przybor\u00F3w szkolnych, aby uczniowie z gospodarstw domowych o niskich dochodach mogli mie\u0107 lepsze do\u015Bwiadczenia edukacyjne. Tw\u00F3j dyrektor zostanie poproszony o zweryfikowanie Twoich wydatk\u00F3w.',
        principalFirstName: 'Imi\u0119 g\u0142\u00F3wne',
        principalLastName: 'Nazwisko dyrektora',
        principalWorkEmail: 'G\u0142\u00F3wny adres e-mail do pracy',
        updateYourEmail: 'Zaktualizuj sw\u00F3j adres e-mail',
        updateEmail: 'Zaktualizuj adres e-mail',
        contactMethods: 'Metody kontaktu.',
        schoolMailAsDefault:
            'Zanim przejdziesz dalej, upewnij si\u0119, \u017Ce ustawi\u0142e\u015B sw\u00F3j szkolny e-mail jako domy\u015Bln\u0105 metod\u0119 kontaktu. Mo\u017Cesz to zrobi\u0107 w Ustawieniach > Profil >',
        error: {
            enterPhoneEmail: 'Wprowad\u017A prawid\u0142owy adres e-mail lub numer telefonu',
            enterEmail: 'Wprowad\u017A adres e-mail',
            enterValidEmail: 'Wprowad\u017A prawid\u0142owy adres e-mail',
            tryDifferentEmail: 'Prosz\u0119 spr\u00F3bowa\u0107 inny adres e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Nieaktywowany',
        outOfPocket: 'Wydatki z w\u0142asnej kieszeni',
        companySpend: 'Wydatki firmowe',
    },
    distance: {
        addStop: 'Dodaj przystanek',
        deleteWaypoint: 'Usu\u0144 punkt orientacyjny',
        deleteWaypointConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 ten punkt nawigacyjny?',
        address: 'Adres',
        waypointDescription: {
            start: 'Startuj',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Zmapuj oczekuj\u0105ce',
            subtitle: 'Mapa zostanie wygenerowana, gdy wr\u00F3cisz online.',
            onlineSubtitle: 'Chwileczk\u0119, przygotowujemy map\u0119',
            errorTitle: 'B\u0142\u0105d mapy',
            errorSubtitle: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas \u0142adowania mapy. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        },
        error: {
            selectSuggestedAddress: 'Prosz\u0119 wybra\u0107 sugerowany adres lub u\u017Cy\u0107 bie\u017C\u0105cej lokalizacji',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Zg\u0142o\u015B utrat\u0119 / uszkodzenie fizycznej karty',
        screenTitle: 'Zgubiono lub uszkodzono \u015Bwiadectwo',
        nextButtonLabel: 'Nast\u0119pny',
        reasonTitle: 'Dlaczego potrzebujesz nowej karty?',
        cardDamaged: 'Moja karta zosta\u0142a uszkodzona',
        cardLostOrStolen: 'Moja karta zosta\u0142a zgubiona lub skradziona',
        confirmAddressTitle: 'Prosz\u0119 potwierdzi\u0107 adres pocztowy dla nowej karty.',
        cardDamagedInfo: 'Twoja nowa karta dotrze w ci\u0105gu 2-3 dni roboczych. Twoja obecna karta b\u0119dzie dzia\u0142a\u0107 do momentu aktywacji nowej.',
        cardLostOrStolenInfo:
            'Twoja obecna karta zostanie trwale dezaktywowana, gdy tylko z\u0142o\u017Cysz zam\u00F3wienie. Wi\u0119kszo\u015B\u0107 kart dociera w ci\u0105gu kilku dni roboczych.',
        address: 'Adres',
        deactivateCardButton: 'Dezaktywuj kart\u0119',
        shipNewCardButton: 'Wy\u015Blij now\u0105 kart\u0119',
        addressError: 'Adres jest wymagany',
        reasonError: 'Pow\u00F3d jest wymagany',
    },
    eReceipt: {
        guaranteed: 'Gwarantowany eParagon',
        transactionDate: 'Data transakcji',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Rozpocznij czat,',
            buttonText2: 'pole\u0107 znajomego.',
            header: 'Rozpocznij czat, pole\u0107 znajomego',
            body: 'Chcesz, aby Twoi znajomi r\u00F3wnie\u017C korzystali z Expensify? Po prostu rozpocznij z nimi czat, a my zajmiemy si\u0119 reszt\u0105.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Z\u0142\u00F3\u017C wydatek,',
            buttonText2: 'pole\u0107 swojego szefa.',
            header: 'Z\u0142\u00F3\u017C wydatek, pole\u0107 swojego szefa',
            body: 'Chcesz, aby Tw\u00F3j szef r\u00F3wnie\u017C korzysta\u0142 z Expensify? Po prostu wy\u015Blij mu raport wydatk\u00F3w, a my zajmiemy si\u0119 reszt\u0105.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Pole\u0107 znajomego',
            body: 'Chcesz, aby Twoi znajomi r\u00F3wnie\u017C korzystali z Expensify? Po prostu czatuj, p\u0142a\u0107 lub dziel si\u0119 wydatkiem z nimi, a my zajmiemy si\u0119 reszt\u0105. Albo po prostu udost\u0119pnij sw\u00F3j link zapraszaj\u0105cy!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Pole\u0107 znajomego',
            header: 'Pole\u0107 znajomego',
            body: 'Chcesz, aby Twoi znajomi r\u00F3wnie\u017C korzystali z Expensify? Po prostu czatuj, p\u0142a\u0107 lub dziel si\u0119 wydatkiem z nimi, a my zajmiemy si\u0119 reszt\u0105. Albo po prostu udost\u0119pnij sw\u00F3j link zapraszaj\u0105cy!',
        },
        copyReferralLink: 'Skopiuj link zaproszenia',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Porozmawiaj ze swoim specjalist\u0105 ds. konfiguracji w',
            phrase2: 'aby uzyska\u0107 pomoc',
        },
        default: {
            phrase1: 'Wiadomo\u015B\u0107',
            phrase2: 'w celu uzyskania pomocy przy konfiguracji',
        },
    },
    violations: {
        allTagLevelsRequired: 'Wszystkie tagi wymagane',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) => `${rejectedBy} odrzuci\u0142 ten wydatek z komentarzem "${rejectReason}"`,
        billableExpense: 'Faktura nie jest ju\u017C wa\u017Cna',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Receipt required${formattedLimit ? `ponad ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategoria nie jest ju\u017C wa\u017Cna',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Zastosowano ${surcharge}% op\u0142at\u0119 za przewalutowanie`,
        customUnitOutOfPolicy: 'Stawka nie jest wa\u017Cna dla tego miejsca pracy',
        duplicatedTransaction: 'Duplikat',
        fieldRequired: 'Pola raportu s\u0105 wymagane',
        futureDate: 'Przysz\u0142a data niedozwolona',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Podwy\u017Cszony o ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data starsza ni\u017C ${maxAge} dni`,
        missingCategory: 'Brakuj\u0105ca kategoria',
        missingComment: 'Wymagany opis dla wybranej kategorii',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Missing ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Kwota r\u00F3\u017Cni si\u0119 od obliczonej odleg\u0142o\u015Bci';
                case 'card':
                    return 'Kwota wi\u0119ksza ni\u017C transakcja kart\u0105';
                default:
                    if (displayPercentVariance) {
                        return `Kwota o ${displayPercentVariance}% wi\u0119ksza ni\u017C zeskanowany paragon`;
                    }
                    return 'Kwota wi\u0119ksza ni\u017C zeskanowany paragon';
            }
        },
        modifiedDate: 'Data r\u00F3\u017Cni si\u0119 od zeskanowanego paragonu',
        nonExpensiworksExpense: 'Wydatek spoza Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Wydatek przekracza limit automatycznej akceptacji wynosz\u0105cy ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Kwota przekracza limit ${formattedLimit}/osoba dla kategorii`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekracza limit ${formattedLimit}/osob\u0119`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekracza limit ${formattedLimit}/osob\u0119`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Kwota przekracza dzienny limit kategorii ${formattedLimit}/osob\u0119`,
        receiptNotSmartScanned:
            'Szczeg\u00F3\u0142y wydatku i paragon dodane r\u0119cznie. Prosz\u0119 zweryfikowa\u0107 szczeg\u00F3\u0142y. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Dowiedz si\u0119 wi\u0119cej</a> o automatycznym audycie wszystkich paragon\u00F3w.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Wymagany paragon';
            if (formattedLimit ?? category) {
                message += 'ponad';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += 'limit kategorii';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Zabroniony wydatek:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} alkohol`;
                case 'gambling':
                    return `${preMessage} hazardowanie`;
                case 'tobacco':
                    return `${preMessage} tyto\u0144`;
                case 'adultEntertainment':
                    return `${preMessage} rozrywka dla doros\u0142ych`;
                case 'hotelIncidentals':
                    return `${preMessage} wydatki hotelowe`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Wymagana recenzja',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `Nie mo\u017Cna automatycznie dopasowa\u0107 paragonu z powodu zerwanego po\u0142\u0105czenia z bankiem, kt\u00F3re ${email} musi naprawi\u0107.`
                    : 'Nie mo\u017Cna automatycznie dopasowa\u0107 paragonu z powodu zerwanego po\u0142\u0105czenia z bankiem, kt\u00F3re musisz naprawi\u0107.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? `Popro\u015B ${member}, aby oznaczy\u0142 jako got\u00F3wk\u0119 lub poczekaj 7 dni i spr\u00F3buj ponownie.`
                    : 'Oczekiwanie na po\u0142\u0105czenie z transakcj\u0105 kartow\u0105.';
            }
            return '';
        },
        brokenConnection530Error: 'Paragon oczekuje z powodu zerwanego po\u0142\u0105czenia z bankiem',
        adminBrokenConnectionError: 'Paragon oczekuje z powodu przerwanego po\u0142\u0105czenia z bankiem. Prosz\u0119 rozwi\u0105za\u0107 w',
        memberBrokenConnectionError:
            'Paragon oczekuje z powodu zerwanego po\u0142\u0105czenia z bankiem. Prosz\u0119 poprosi\u0107 administratora przestrzeni roboczej o rozwi\u0105zanie problemu.',
        markAsCashToIgnore: 'Oznacz jako got\u00F3wk\u0119, aby zignorowa\u0107 i za\u017C\u0105da\u0107 p\u0142atno\u015Bci.',
        smartscanFailed: ({canEdit = true}) => `Skanowanie paragonu nie powiod\u0142o si\u0119.${canEdit ? 'Wprowad\u017A szczeg\u00F3\u0142y r\u0119cznie.' : ''}`,
        receiptGeneratedWithAI: 'Potencjalny paragon wygenerowany przez AI',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nie jest ju\u017C wa\u017Cny`,
        taxAmountChanged: 'Kwota podatku zosta\u0142a zmodyfikowana',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Podatek'} nie jest ju\u017C wa\u017Cny`,
        taxRateChanged: 'Stawka podatkowa zosta\u0142a zmodyfikowana',
        taxRequired: 'Brakuj\u0105ca stawka podatkowa',
        none: 'None',
        taxCodeToKeep: 'Wybierz, kt\u00F3ry kod podatkowy zachowa\u0107',
        tagToKeep: 'Wybierz, kt\u00F3ry tag zachowa\u0107',
        isTransactionReimbursable: 'Wybierz, czy transakcja podlega zwrotowi koszt\u00F3w',
        merchantToKeep: 'Wybierz, kt\u00F3rego sprzedawc\u0119 zachowa\u0107',
        descriptionToKeep: 'Wybierz, kt\u00F3ry opis zachowa\u0107',
        categoryToKeep: 'Wybierz, kt\u00F3r\u0105 kategori\u0119 zachowa\u0107',
        isTransactionBillable: 'Wybierz, czy transakcja jest fakturowalna',
        keepThisOne: 'Zachowaj to.',
        confirmDetails: `Potwierd\u017A szczeg\u00F3\u0142y, kt\u00F3re zachowujesz`,
        confirmDuplicatesInfo: `Zduplikowane \u017C\u0105dania, kt\u00F3rych nie zachowasz, b\u0119d\u0105 przechowywane, aby cz\u0142onek m\u00F3g\u0142 je usun\u0105\u0107.`,
        hold: 'Ten wydatek zosta\u0142 wstrzymany',
        resolvedDuplicates: 'rozwi\u0105zano duplikat',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `Pole ${fieldName} jest wymagane`,
    },
    violationDismissal: {
        rter: {
            manual: 'oznaczy\u0142 ten paragon jako got\u00F3wka',
        },
        duplicatedTransaction: {
            manual: 'rozwi\u0105zano duplikat',
        },
    },
    videoPlayer: {
        play: 'Graj',
        pause: 'Pauza',
        fullscreen: 'Pe\u0142ny ekran',
        playbackSpeed: 'Pr\u0119dko\u015B\u0107 odtwarzania',
        expand: 'Rozwi\u0144',
        mute: 'Wycisz',
        unmute: 'Wy\u0142\u0105cz wyciszenie',
        normal: 'Normalny',
    },
    exitSurvey: {
        header: 'Zanim p\u00F3jdziesz',
        reasonPage: {
            title: 'Prosz\u0119, powiedz nam, dlaczego odchodzisz',
            subtitle: 'Zanim odejdziesz, prosimy, powiedz nam, dlaczego chcia\u0142by\u015B przej\u015B\u0107 na Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Potrzebuj\u0119 funkcji, kt\u00F3ra jest dost\u0119pna tylko w Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Nie rozumiem, jak korzysta\u0107 z New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Rozumiem, jak korzysta\u0107 z New Expensify, ale wol\u0119 Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Jakiej funkcji potrzebujesz, kt\u00F3ra nie jest dost\u0119pna w Nowym Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Co pr\u00F3bujesz zrobi\u0107?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Dlaczego wolisz Expensify Classic?',
        },
        responsePlaceholder: 'Twoja odpowied\u017A',
        thankYou: 'Dzi\u0119ki za opini\u0119!',
        thankYouSubtitle: 'Twoje odpowiedzi pomog\u0105 nam stworzy\u0107 lepszy produkt, aby za\u0142atwia\u0107 sprawy. Bardzo dzi\u0119kujemy!',
        goToExpensifyClassic: 'Prze\u0142\u0105cz na Expensify Classic',
        offlineTitle: 'Wygl\u0105da na to, \u017Ce utkn\u0105\u0142e\u015B tutaj...',
        offline:
            'Wygl\u0105da na to, \u017Ce jeste\u015B offline. Niestety, Expensify Classic nie dzia\u0142a w trybie offline, ale Nowe Expensify dzia\u0142a. Je\u015Bli wolisz korzysta\u0107 z Expensify Classic, spr\u00F3buj ponownie, gdy b\u0119dziesz mie\u0107 po\u0142\u0105czenie z internetem.',
        quickTip: 'Szybka wskaz\u00F3wka...',
        quickTipSubTitle:
            'Mo\u017Cesz przej\u015B\u0107 bezpo\u015Brednio do Expensify Classic, odwiedzaj\u0105c expensify.com. Dodaj do zak\u0142adek, aby mie\u0107 \u0142atwy skr\u00F3t!',
        bookACall: 'Zarezerwuj rozmow\u0119',
        noThanks: 'Nie, dzi\u0119kuj\u0119',
        bookACallTitle: 'Czy chcia\u0142by\u015B porozmawia\u0107 z mened\u017Cerem produktu?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Czatowanie bezpo\u015Brednio na wydatkach i raportach',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Mo\u017Cliwo\u015B\u0107 robienia wszystkiego na urz\u0105dzeniu mobilnym',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Podr\u00F3\u017Ce i wydatki z pr\u0119dko\u015Bci\u0105 czatu',
        },
        bookACallTextTop: 'Przechodz\u0105c na Expensify Classic, przegapisz:',
        bookACallTextBottom:
            'Byliby\u015Bmy podekscytowani mo\u017Cliwo\u015Bci\u0105 rozmowy z Tob\u0105, aby zrozumie\u0107 dlaczego. Mo\u017Cesz um\u00F3wi\u0107 si\u0119 na rozmow\u0119 z jednym z naszych starszych mened\u017Cer\u00F3w produktu, aby om\u00F3wi\u0107 swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przenie\u015B mnie do Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas \u0142adowania kolejnych wiadomo\u015Bci',
        tryAgain: 'Spr\u00F3buj ponownie',
    },
    systemMessage: {
        mergedWithCashTransaction: 'dopasowano paragon do tej transakcji',
    },
    subscription: {
        authenticatePaymentCard: 'Uwierzytelnij kart\u0119 p\u0142atnicz\u0105',
        mobileReducedFunctionalityMessage: 'Nie mo\u017Cesz wprowadza\u0107 zmian w swojej subskrypcji w aplikacji mobilnej.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Darmowa wersja pr\u00F3bna: ${numOfDays} ${numOfDays === 1 ? 'dzie\u0144' : 'dni'} pozosta\u0142o`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Twoje dane p\u0142atno\u015Bci s\u0105 nieaktualne',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Zaktualizuj swoj\u0105 kart\u0119 p\u0142atnicz\u0105 do ${date}, aby nadal korzysta\u0107 ze wszystkich ulubionych funkcji.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Twoja p\u0142atno\u015B\u0107 nie mog\u0142a zosta\u0107 przetworzona',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Twoja op\u0142ata z dnia ${date} w wysoko\u015Bci ${purchaseAmountOwed} nie mog\u0142a zosta\u0107 przetworzona. Prosz\u0119 doda\u0107 kart\u0119 p\u0142atnicz\u0105, aby uregulowa\u0107 nale\u017Cn\u0105 kwot\u0119.`
                        : 'Prosz\u0119 doda\u0107 kart\u0119 p\u0142atnicz\u0105, aby uregulowa\u0107 nale\u017Cno\u015B\u0107.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje dane p\u0142atno\u015Bci s\u0105 nieaktualne',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Twoja p\u0142atno\u015B\u0107 jest zaleg\u0142a. Prosz\u0119 op\u0142aci\u0107 faktur\u0119 do ${date}, aby unikn\u0105\u0107 przerwy w \u015Bwiadczeniu us\u0142ug.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje dane p\u0142atno\u015Bci s\u0105 nieaktualne',
                subtitle: 'Twoja p\u0142atno\u015B\u0107 jest zaleg\u0142a. Prosz\u0119 zap\u0142a\u0107 swoj\u0105 faktur\u0119.',
            },
            billingDisputePending: {
                title: 'Nie mo\u017Cna by\u0142o obci\u0105\u017Cy\u0107 Twojej karty',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Zakwestionowa\u0142e\u015B op\u0142at\u0119 w wysoko\u015Bci ${amountOwed} na karcie ko\u0144cz\u0105cej si\u0119 na ${cardEnding}. Twoje konto zostanie zablokowane do czasu rozwi\u0105zania sporu z bankiem.`,
            },
            cardAuthenticationRequired: {
                title: 'Nie mo\u017Cna by\u0142o obci\u0105\u017Cy\u0107 Twojej karty',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Twoja karta p\u0142atnicza nie zosta\u0142a w pe\u0142ni uwierzytelniona. Prosz\u0119 doko\u0144czy\u0107 proces uwierzytelniania, aby aktywowa\u0107 kart\u0119 p\u0142atnicz\u0105 ko\u0144cz\u0105c\u0105 si\u0119 na ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Nie mo\u017Cna by\u0142o obci\u0105\u017Cy\u0107 Twojej karty',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Twoja karta p\u0142atnicza zosta\u0142a odrzucona z powodu niewystarczaj\u0105cych \u015Brodk\u00F3w. Spr\u00F3buj ponownie lub dodaj now\u0105 kart\u0119 p\u0142atnicz\u0105, aby uregulowa\u0107 zaleg\u0142e saldo w wysoko\u015Bci ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Nie mo\u017Cna by\u0142o obci\u0105\u017Cy\u0107 Twojej karty',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Twoja karta p\u0142atnicza wygas\u0142a. Prosz\u0119 doda\u0107 now\u0105 kart\u0119 p\u0142atnicz\u0105, aby uregulowa\u0107 zaleg\u0142e saldo w wysoko\u015Bci ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Twoja karta wkr\u00F3tce wyga\u015Bnie',
                subtitle:
                    'Twoja karta p\u0142atnicza wyga\u015Bnie pod koniec tego miesi\u0105ca. Kliknij menu z trzema kropkami poni\u017Cej, aby j\u0105 zaktualizowa\u0107 i nadal korzysta\u0107 ze wszystkich ulubionych funkcji.',
            },
            retryBillingSuccess: {
                title: 'Sukces!',
                subtitle: 'Twoja karta zosta\u0142a pomy\u015Blnie obci\u0105\u017Cona.',
            },
            retryBillingError: {
                title: 'Nie mo\u017Cna by\u0142o obci\u0105\u017Cy\u0107 Twojej karty',
                subtitle:
                    'Zanim spr\u00F3bujesz ponownie, skontaktuj si\u0119 bezpo\u015Brednio ze swoim bankiem, aby autoryzowa\u0107 op\u0142aty Expensify i usun\u0105\u0107 wszelkie blokady. W przeciwnym razie spr\u00F3buj doda\u0107 inn\u0105 kart\u0119 p\u0142atnicz\u0105.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Zakwestionowa\u0142e\u015B op\u0142at\u0119 w wysoko\u015Bci ${amountOwed} na karcie ko\u0144cz\u0105cej si\u0119 na ${cardEnding}. Twoje konto zostanie zablokowane do czasu rozwi\u0105zania sporu z bankiem.`,
            preTrial: {
                title: 'Rozpocznij darmowy okres pr\u00F3bny',
                subtitleStart: 'Jako kolejny krok,',
                subtitleLink: 'uko\u0144cz list\u0119 kontroln\u0105 konfiguracji',
                subtitleEnd: 'aby tw\u00F3j zesp\u00F3\u0142 m\u00F3g\u0142 zacz\u0105\u0107 rozlicza\u0107 wydatki.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Okres pr\u00F3bny: ${numOfDays} ${numOfDays === 1 ? 'dzie\u0144' : 'dni'} pozosta\u0142o!`,
                subtitle: 'Dodaj kart\u0119 p\u0142atnicz\u0105, aby nadal korzysta\u0107 ze wszystkich ulubionych funkcji.',
            },
            trialEnded: {
                title: 'Tw\u00F3j bezp\u0142atny okres pr\u00F3bny dobieg\u0142 ko\u0144ca',
                subtitle: 'Dodaj kart\u0119 p\u0142atnicz\u0105, aby nadal korzysta\u0107 ze wszystkich ulubionych funkcji.',
            },
            earlyDiscount: {
                claimOffer: 'Zg\u0142o\u015B ofert\u0119',
                noThanks: 'Nie, dzi\u0119kuj\u0119',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% zni\u017Cki na pierwszy rok!`,
                    phrase2: `Wystarczy doda\u0107 kart\u0119 p\u0142atnicz\u0105 i rozpocz\u0105\u0107 roczn\u0105 subskrypcj\u0119.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Oferta ograniczona czasowo:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% zni\u017Cki na pierwszy rok!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) =>
                    `Zg\u0142o\u015B w ci\u0105gu ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'P\u0142atno\u015B\u0107',
            subtitle: 'Dodaj kart\u0119, aby zap\u0142aci\u0107 za swoj\u0105 subskrypcj\u0119 Expensify.',
            addCardButton: 'Dodaj kart\u0119 p\u0142atnicz\u0105',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Twoja nast\u0119pna data p\u0142atno\u015Bci to ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Karta ko\u0144cz\u0105ca si\u0119 na ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nazwa: ${name}, Data wa\u017Cno\u015Bci: ${expiration}, Waluta: ${currency}`,
            changeCard: 'Zmie\u0144 kart\u0119 p\u0142atnicz\u0105',
            changeCurrency: 'Zmie\u0144 walut\u0119 p\u0142atno\u015Bci',
            cardNotFound: 'Nie dodano karty p\u0142atniczej',
            retryPaymentButton: 'Pon\u00F3w p\u0142atno\u015B\u0107',
            authenticatePayment: 'Uwierzytelnij p\u0142atno\u015B\u0107',
            requestRefund: 'Popro\u015B o zwrot pieni\u0119dzy',
            requestRefundModal: {
                phrase1: 'Uzyskanie zwrotu jest proste, wystarczy obni\u017Cy\u0107 poziom konta przed nast\u0119pn\u0105 dat\u0105 rozliczenia, a otrzymasz zwrot.',
                phrase2:
                    'Uwaga: Obni\u017Cenie poziomu konta oznacza, \u017Ce Twoje przestrzenie robocze zostan\u0105 usuni\u0119te. Tej akcji nie mo\u017Cna cofn\u0105\u0107, ale zawsze mo\u017Cesz utworzy\u0107 now\u0105 przestrze\u0144 robocz\u0105, je\u015Bli zmienisz zdanie.',
                confirm: 'Usu\u0144 przestrze\u0144(e) robocz\u0105(e) i obni\u017C poziom subskrypcji',
            },
            viewPaymentHistory: 'Wy\u015Bwietl histori\u0119 p\u0142atno\u015Bci',
        },
        yourPlan: {
            title: 'Tw\u00F3j plan',
            exploreAllPlans: 'Przegl\u0105daj wszystkie plany',
            customPricing: 'Cennik niestandardowy',
            asLowAs: ({price}: YourPlanPriceValueParams) => `ju\u017C od ${price} za aktywnego cz\u0142onka/miesi\u0105c`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} za cz\u0142onka/miesi\u0105c`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} za cz\u0142onka miesi\u0119cznie`,
            perMemberMonth: 'za cz\u0142onka/miesi\u0105c',
            collect: {
                title: 'Zbierz',
                description: 'Plan dla ma\u0142ych firm, kt\u00F3ry oferuje wydatki, podr\u00F3\u017Ce i czat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny cz\u0142onek z kart\u0105 Expensify, ${upper}/aktywny cz\u0142onek bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny cz\u0142onek z kart\u0105 Expensify, ${upper}/aktywny cz\u0142onek bez karty Expensify.`,
                benefit1: 'Skanowanie paragon\u00F3w',
                benefit2: 'Zwroty koszt\u00F3w',
                benefit3: 'Zarz\u0105dzanie kartami korporacyjnymi',
                benefit4: 'Zatwierdzenia wydatk\u00F3w i podr\u00F3\u017Cy',
                benefit5: 'Rezerwacja podr\u00F3\u017Cy i zasady',
                benefit6: 'Integracje QuickBooks/Xero',
                benefit7: 'Czat o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i ludzkie wsparcie',
            },
            control: {
                title: 'Kontrola',
                description: 'Wydatki, podr\u00F3\u017Ce i czat dla wi\u0119kszych firm.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny cz\u0142onek z kart\u0105 Expensify, ${upper}/aktywny cz\u0142onek bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny cz\u0142onek z kart\u0105 Expensify, ${upper}/aktywny cz\u0142onek bez karty Expensify.`,
                benefit1: 'Wszystko w planie Collect',
                benefit2: 'Wielopoziomowe przep\u0142ywy zatwierdzania',
                benefit3: 'Niestandardowe zasady wydatk\u00F3w',
                benefit4: 'Integracje ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integracje HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Niestandardowe analizy i raportowanie',
                benefit8: 'Bud\u017Cetowanie',
            },
            thisIsYourCurrentPlan: 'To jest Tw\u00F3j obecny plan',
            downgrade: 'Obni\u017C do Collect',
            upgrade: 'Ulepsz do Control',
            addMembers: 'Dodaj cz\u0142onk\u00F3w',
            saveWithExpensifyTitle: 'Oszcz\u0119dzaj z kart\u0105 Expensify',
            saveWithExpensifyDescription:
                'U\u017Cyj naszego kalkulatora oszcz\u0119dno\u015Bci, aby zobaczy\u0107, jak zwrot got\u00F3wki z karty Expensify mo\u017Ce zmniejszy\u0107 Tw\u00F3j rachunek w Expensify.',
            saveWithExpensifyButton: 'Dowiedz si\u0119 wi\u0119cej',
        },
        compareModal: {
            comparePlans: 'Por\u00F3wnaj plany',
            unlockTheFeatures: 'Odblokuj funkcje, kt\u00F3rych potrzebujesz, z planem odpowiednim dla Ciebie.',
            viewOurPricing: 'Zobacz nasz\u0105 stron\u0119 z cennikiem',
            forACompleteFeatureBreakdown: 'aby uzyska\u0107 pe\u0142ny podzia\u0142 funkcji ka\u017Cdego z naszych plan\u00F3w.',
        },
        details: {
            title: 'Szczeg\u00F3\u0142y subskrypcji',
            annual: 'Roczna subskrypcja',
            taxExempt: 'Popro\u015B o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolniony z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'P\u0142atno\u015B\u0107 za u\u017Cycie',
            subscriptionSize: 'Rozmiar subskrypcji',
            headsUp:
                'Uwaga: Je\u015Bli nie ustawisz teraz rozmiaru subskrypcji, automatycznie ustawimy go na liczb\u0119 aktywnych cz\u0142onk\u00F3w z pierwszego miesi\u0105ca. Nast\u0119pnie zobowi\u0105\u017Cesz si\u0119 do p\u0142acenia za co najmniej t\u0119 liczb\u0119 cz\u0142onk\u00F3w przez nast\u0119pne 12 miesi\u0119cy. Mo\u017Cesz zwi\u0119kszy\u0107 rozmiar subskrypcji w dowolnym momencie, ale nie mo\u017Cesz go zmniejszy\u0107, dop\u00F3ki subskrypcja si\u0119 nie sko\u0144czy.',
            zeroCommitment: 'Zero zobowi\u0105za\u0144 przy obni\u017Conej rocznej stawce abonamentowej',
        },
        subscriptionSize: {
            title: 'Rozmiar subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba wolnych miejsc, kt\u00F3re mog\u0105 by\u0107 zaj\u0119te przez dowolnego aktywnego cz\u0142onka w danym miesi\u0105cu.',
            eachMonth:
                'Ka\u017Cdego miesi\u0105ca Twoja subskrypcja obejmuje do liczby aktywnych cz\u0142onk\u00F3w okre\u015Blonej powy\u017Cej. Za ka\u017Cdym razem, gdy zwi\u0119kszysz rozmiar subskrypcji, rozpoczniesz now\u0105 12-miesi\u0119czn\u0105 subskrypcj\u0119 w tym nowym rozmiarze.',
            note: 'Uwaga: Aktywny cz\u0142onek to osoba, kt\u00F3ra utworzy\u0142a, edytowa\u0142a, przes\u0142a\u0142a, zatwierdzi\u0142a, zrefundowa\u0142a lub wyeksportowa\u0142a dane wydatk\u00F3w powi\u0105zane z przestrzeni\u0105 robocz\u0105 Twojej firmy.',
            confirmDetails: 'Potwierd\u017A szczeg\u00F3\u0142y swojego nowego rocznego abonamentu:',
            subscriptionSize: 'Rozmiar subskrypcji',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktywnych cz\u0142onk\u00F3w/miesi\u0105c`,
            subscriptionRenews: 'Subskrypcja odnawia si\u0119',
            youCantDowngrade: 'Nie mo\u017Cesz obni\u017Cy\u0107 planu podczas rocznej subskrypcji.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Ju\u017C zobowi\u0105za\u0142e\u015B si\u0119 do rocznej subskrypcji dla ${size} aktywnych cz\u0142onk\u00F3w miesi\u0119cznie do ${date}. Mo\u017Cesz przej\u015B\u0107 na subskrypcj\u0119 p\u0142atn\u0105 za u\u017Cycie ${date}, wy\u0142\u0105czaj\u0105c automatyczne odnawianie.`,
            error: {
                size: 'Prosz\u0119 wprowadzi\u0107 prawid\u0142owy rozmiar subskrypcji',
                sameSize: 'Prosz\u0119 wprowadzi\u0107 liczb\u0119 inn\u0105 ni\u017C obecny rozmiar subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kart\u0119 p\u0142atnicz\u0105',
            enterPaymentCardDetails: 'Wprowad\u017A dane swojej karty p\u0142atniczej',
            security: 'Expensify jest zgodny z PCI-DSS, u\u017Cywa szyfrowania na poziomie bankowym i wykorzystuje redundantn\u0105 infrastruktur\u0119 do ochrony Twoich danych.',
            learnMoreAboutSecurity: 'Dowiedz si\u0119 wi\u0119cej o naszym bezpiecze\u0144stwie.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Typ subskrypcji: ${subscriptionType}, Rozmiar subskrypcji: ${subscriptionSize}, Automatyczne odnawianie: ${autoRenew}, Automatyczne zwi\u0119kszanie rocznych miejsc: ${autoIncrease}`,
            none: 'none',
            on: 'na',
            off: 'wy\u0142\u0105czone',
            annual: 'Roczny',
            autoRenew: 'Automatyczne odnawianie',
            autoIncrease: 'Automatyczne zwi\u0119kszanie rocznych miejsc',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Oszcz\u0119dzaj do ${amountWithCurrency}/miesi\u0105c na aktywnego cz\u0142onka`,
            automaticallyIncrease:
                'Automatycznie zwi\u0119kszaj liczb\u0119 rocznych miejsc, aby pomie\u015Bci\u0107 aktywnych cz\u0142onk\u00F3w, kt\u00F3rzy przekraczaj\u0105 rozmiar Twojej subskrypcji. Uwaga: To wyd\u0142u\u017Cy dat\u0119 zako\u0144czenia Twojej rocznej subskrypcji.',
            disableAutoRenew: 'Wy\u0142\u0105cz automatyczne odnawianie',
            helpUsImprove: 'Pom\u00F3\u017C nam ulepszy\u0107 Expensify',
            whatsMainReason: 'Jaki jest g\u0142\u00F3wny pow\u00F3d, dla kt\u00F3rego wy\u0142\u0105czasz automatyczne odnawianie?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Odnawia si\u0119 ${date}.`,
            pricingConfiguration:
                'Ceny zale\u017C\u0105 od konfiguracji. Aby uzyska\u0107 najni\u017Csz\u0105 cen\u0119, wybierz roczn\u0105 subskrypcj\u0119 i zdob\u0105d\u017A kart\u0119 Expensify.',
            learnMore: {
                part1: 'Dowiedz si\u0119 wi\u0119cej na naszej',
                pricingPage: 'strona cenowa',
                part2: 'lub porozmawiaj z naszym zespo\u0142em w swoim',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Szacowana cena',
            changesBasedOn: 'To zmienia si\u0119 w zale\u017Cno\u015Bci od Twojego u\u017Cycia Karty Expensify i poni\u017Cszych opcji subskrypcji.',
        },
        requestEarlyCancellation: {
            title: 'Popro\u015B o wcze\u015Bniejsze anulowanie',
            subtitle: 'Jaki jest g\u0142\u00F3wny pow\u00F3d, dla kt\u00F3rego prosisz o wcze\u015Bniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja roczna subskrypcja zosta\u0142a anulowana.',
                info: 'Je\u015Bli chcesz nadal korzysta\u0107 ze swojego miejsca pracy na zasadzie p\u0142atno\u015Bci za u\u017Cycie, wszystko jest gotowe.',
                preventFutureActivity: {
                    part1: 'Je\u015Bli chcesz zapobiec przysz\u0142ym dzia\u0142aniom i op\u0142atom, musisz',
                    link: 'usu\u0144 swoje miejsce(a) pracy',
                    part2: '. Zauwa\u017C, \u017Ce gdy usuniesz swoje miejsce pracy, zostaniesz obci\u0105\u017Cony op\u0142at\u0105 za wszelkie zaleg\u0142e dzia\u0142ania, kt\u00F3re mia\u0142y miejsce w bie\u017C\u0105cym miesi\u0105cu kalendarzowym.',
                },
            },
            requestSubmitted: {
                title: '\u017B\u0105danie zosta\u0142o przes\u0142ane',
                subtitle: {
                    part1: 'Dzi\u0119kujemy za poinformowanie nas o ch\u0119ci anulowania subskrypcji. Przegl\u0105damy Twoj\u0105 pro\u015Bb\u0119 i wkr\u00F3tce skontaktujemy si\u0119 z Tob\u0105 za po\u015Brednictwem czatu z',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: 'Poprzez z\u0142o\u017Cenie pro\u015Bby o wcze\u015Bniejsze anulowanie, przyjmuj\u0119 do wiadomo\u015Bci i zgadzam si\u0119, \u017Ce Expensify nie ma obowi\u0105zku spe\u0142nienia takiej pro\u015Bby zgodnie z Expensify.',
                link: 'Warunki korzystania z us\u0142ugi',
                part2: 'lub inna obowi\u0105zuj\u0105ca umowa o \u015Bwiadczenie us\u0142ug mi\u0119dzy mn\u0105 a Expensify, a Expensify zastrzega sobie wy\u0142\u0105czn\u0105 decyzj\u0119 w odniesieniu do przyznania takiej pro\u015Bby.',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funkcjonalno\u015B\u0107 wymaga poprawy',
        tooExpensive: 'Zbyt drogie',
        inadequateSupport: 'Niewystarczaj\u0105ce wsparcie klienta',
        businessClosing: 'Zamkni\u0119cie firmy, redukcja zatrudnienia lub przej\u0119cie',
        additionalInfoTitle: 'Na jakie oprogramowanie si\u0119 przenosisz i dlaczego?',
        additionalInfoInputLabel: 'Twoja odpowied\u017A',
    },
    roomChangeLog: {
        updateRoomDescription: 'ustaw opis pokoju na:',
        clearRoomDescription: 'wyczyszczono opis pokoju',
    },
    delegate: {
        switchAccount: 'Prze\u0142\u0105cz konta:',
        copilotDelegatedAccess: 'Copilot: Dost\u0119p delegowany',
        copilotDelegatedAccessDescription: 'Zezw\u00F3l innym cz\u0142onkom na dost\u0119p do swojego konta.',
        addCopilot: 'Dodaj wsp\u00F3\u0142pilota',
        membersCanAccessYourAccount: 'Ci cz\u0142onkowie maj\u0105 dost\u0119p do Twojego konta:',
        youCanAccessTheseAccounts: 'Mo\u017Cesz uzyska\u0107 dost\u0119p do tych kont za pomoc\u0105 prze\u0142\u0105cznika kont:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pe\u0142ny';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Ograniczony';
                default:
                    return '';
            }
        },
        genericError: 'Ups, co\u015B posz\u0142o nie tak. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `w imieniu ${delegator}`,
        accessLevel: 'Poziom dost\u0119pu',
        confirmCopilot: 'Potwierd\u017A swojego pilota poni\u017Cej.',
        accessLevelDescription:
            'Wybierz poziom dost\u0119pu poni\u017Cej. Zar\u00F3wno pe\u0142ny, jak i ograniczony dost\u0119p pozwalaj\u0105 kopilotom na przegl\u0105danie wszystkich rozm\u00F3w i wydatk\u00F3w.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Zezw\u00F3l innemu cz\u0142onkowi na podejmowanie wszystkich dzia\u0142a\u0144 na Twoim koncie w Twoim imieniu. Obejmuje to czat, zg\u0142oszenia, zatwierdzenia, p\u0142atno\u015Bci, aktualizacje ustawie\u0144 i wi\u0119cej.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Pozw\u00F3l innemu cz\u0142onkowi na wykonywanie wi\u0119kszo\u015Bci dzia\u0142a\u0144 na Twoim koncie w Twoim imieniu. Wyklucza zatwierdzenia, p\u0142atno\u015Bci, odrzucenia i wstrzymania.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usu\u0144 copilot',
        removeCopilotConfirmation: 'Czy na pewno chcesz usun\u0105\u0107 tego wsp\u00F3\u0142pilota?',
        changeAccessLevel: 'Zmie\u0144 poziom dost\u0119pu',
        makeSureItIsYou: 'Upewnijmy si\u0119, \u017Ce to Ty',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ${contactMethod}, aby doda\u0107 wsp\u00F3\u0142pilota. Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ${contactMethod}, aby zaktualizowa\u0107 swojego pilota.`,
        notAllowed: 'Nie tak szybko...',
        noAccessMessage: 'Jako wsp\u00F3\u0142pilot nie masz dost\u0119pu do tej strony. Przepraszamy!',
        notAllowedMessageStart: `Jako`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `dla ${accountOwnerEmail}, nie masz uprawnie\u0144 do wykonania tej akcji. Przepraszamy!`,
        copilotAccess: 'Dost\u0119p do Copilot',
    },
    debug: {
        debug: 'Debugowa\u0107',
        details: 'Szczeg\u00F3\u0142y',
        JSON: 'JSON',
        reportActions: 'Dzia\u0142ania',
        reportActionPreview: 'Podgl\u0105d',
        nothingToPreview: 'Brak podgl\u0105du',
        editJson: 'Edytuj JSON:',
        preview: 'Podgl\u0105d:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Brakuj\u0105cy ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Nieprawid\u0142owa w\u0142a\u015Bciwo\u015B\u0107: ${propertyName} - Oczekiwano: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Nieprawid\u0142owa warto\u015B\u0107 - Oczekiwano: ${expectedValues}`,
        missingValue: 'Brakuj\u0105ca warto\u015B\u0107',
        createReportAction: 'Utw\u00F3rz Dzia\u0142anie Raportu',
        reportAction: 'Zg\u0142o\u015B dzia\u0142anie',
        report: 'Raport',
        transaction: 'Transakcja',
        violations: 'Naruszenia',
        transactionViolation: 'Naruszenie Transakcji',
        hint: 'Zmiany danych nie zostan\u0105 wys\u0142ane do backendu',
        textFields: 'Pola tekstowe',
        numberFields: 'Pola liczbowe',
        booleanFields: 'Pola logiczne',
        constantFields: 'Sta\u0142e pola',
        dateTimeFields: 'Pola DateTime',
        date: 'Data',
        time: 'Czas',
        none: 'None',
        visibleInLHN: 'Widoczne w LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Wy\u015Bwietl raport',
        viewTransaction: 'Zobacz transakcj\u0119',
        createTransactionViolation: 'Utw\u00F3rz naruszenie transakcji',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ma szkic komentarza',
            hasGBR: 'Has GBR',
            hasRBR: 'Ma RBR',
            pinnedByUser: 'Przypi\u0119te przez cz\u0142onka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Ma b\u0142\u0119dy dodawania pokoju roboczego',
            isUnread: 'Jest nieprzeczytane (tryb skupienia)',
            isArchived: 'Jest zarchiwizowany (najbardziej aktualny tryb)',
            isSelfDM: 'Jest to wiadomo\u015B\u0107 do samego siebie',
            isFocused: 'Tymczasowo skupiony',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma pro\u015Bb\u0119 o do\u0142\u0105czenie (pok\u00F3j administratora)',
            isUnreadWithMention: 'Jest nieprzeczytane z wzmiank\u0105',
            isWaitingForAssigneeToCompleteAction: 'Czeka na przypisanie do wykonania dzia\u0142ania',
            hasChildReportAwaitingAction: 'Raport podrz\u0119dny oczekuje na dzia\u0142anie',
            hasMissingInvoiceBankAccount: 'Brakuje konta bankowego faktury',
        },
        reasonRBR: {
            hasErrors: 'Ma b\u0142\u0119dy w danych raportu lub dzia\u0142aniach raportu',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia w\u0105tku transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Raport oczekuje na dzia\u0142anie',
            theresAReportWithErrors: 'W raporcie s\u0105 b\u0142\u0119dy',
            theresAWorkspaceWithCustomUnitsErrors: 'Wyst\u0105pi\u0142y b\u0142\u0119dy jednostek niestandardowych w przestrzeni roboczej',
            theresAProblemWithAWorkspaceMember: 'Wyst\u0105pi\u0142 problem z cz\u0142onkiem przestrzeni roboczej',
            theresAProblemWithAWorkspaceQBOExport: 'Wyst\u0105pi\u0142 problem z ustawieniem eksportu po\u0142\u0105czenia przestrzeni roboczej.',
            theresAProblemWithAContactMethod: 'Wyst\u0105pi\u0142 problem z metod\u0105 kontaktu',
            aContactMethodRequiresVerification: 'Metoda kontaktu wymaga weryfikacji',
            theresAProblemWithAPaymentMethod: 'Wyst\u0105pi\u0142 problem z metod\u0105 p\u0142atno\u015Bci',
            theresAProblemWithAWorkspace: 'Wyst\u0105pi\u0142 problem z przestrzeni\u0105 robocz\u0105',
            theresAProblemWithYourReimbursementAccount: 'Wyst\u0105pi\u0142 problem z Twoim kontem do zwrot\u00F3w',
            theresABillingProblemWithYourSubscription: 'Wyst\u0105pi\u0142 problem z rozliczeniem Twojej subskrypcji',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Twoja subskrypcja zosta\u0142a pomy\u015Blnie odnowiona',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Wyst\u0105pi\u0142 problem podczas synchronizacji po\u0142\u0105czenia przestrzeni roboczej',
            theresAProblemWithYourWallet: 'Wyst\u0105pi\u0142 problem z Twoim portfelem',
            theresAProblemWithYourWalletTerms: 'Wyst\u0105pi\u0142 problem z warunkami Twojego portfela',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Wypr\u00F3buj wersj\u0119 demonstracyjn\u0105',
    },
    migratedUserWelcomeModal: {
        title: 'Podr\u00F3\u017Ce i wydatki, z pr\u0119dko\u015Bci\u0105 czatu',
        subtitle: 'Nowy Expensify ma t\u0119 sam\u0105 \u015Bwietn\u0105 automatyzacj\u0119, ale teraz z niesamowit\u0105 wsp\u00F3\u0142prac\u0105:',
        confirmText: 'Chod\u017Amy!',
        features: {
            chat: '<strong>Czat bezpo\u015Brednio na dowolnym wydatku</strong>, raporcie lub przestrzeni roboczej',
            scanReceipt: '<strong>Skanuj paragony</strong> i otrzymuj zwrot pieni\u0119dzy',
            crossPlatform: 'R\u00F3b <strong>wszystko</strong> z telefonu lub przegl\u0105darki',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Zacznij teraz',
            part2: 'tutaj!',
        },
        saveSearchTooltip: {
            part1: 'Zmie\u0144 nazw\u0119 zapisanych wyszukiwa\u0144',
            part2: 'tutaj!',
        },
        bottomNavInboxTooltip: {
            part1: 'Sprawd\u017A co',
            part2: 'wymaga Twojej uwagi',
            part3: 'i',
            part4: 'rozmowa o wydatkach.',
        },
        workspaceChatTooltip: {
            part1: 'Czat z',
            part2: 'zatwierdzaj\u0105cy',
        },
        globalCreateTooltip: {
            part1: 'Utw\u00F3rz wydatki',
            part2: ', rozpocznij czat,',
            part3: 'i wi\u0119cej.',
            part4: 'Wypr\u00F3buj to!',
        },
        GBRRBRChat: {
            part1: 'Zobaczysz \uD83D\uDFE2 na',
            part2: 'dzia\u0142ania do podj\u0119cia',
            part3: ',\ni \uD83D\uDD34 na',
            part4: 'elementy do przejrzenia.',
        },
        accountSwitcher: {
            part1: 'Uzyskaj dost\u0119p do swojego',
            part2: 'Konta Copilot',
            part3: 'tutaj',
        },
        expenseReportsFilter: {
            part1: 'Witamy! Znajd\u017A wszystkie swoje',
            part2: 'raporty firmy',
            part3: 'tutaj.',
        },
        scanTestTooltip: {
            part1: 'Chcesz zobaczy\u0107, jak dzia\u0142a Scan?',
            part2: 'Wypr\u00F3buj paragon testowy!',
            part3: 'Wybierz nasze',
            part4: 'test manager',
            part5: 'aby to wypr\u00F3bowa\u0107!',
            part6: 'Teraz,',
            part7: 'prze\u015Blij sw\u00F3j wydatek',
            part8: 'i zobacz, jak dzieje si\u0119 magia!',
            tryItOut: 'Wypr\u00F3buj to',
            noThanks: 'Nie, dzi\u0119kuj\u0119',
        },
        outstandingFilter: {
            part1: 'Filtruj wydatki, kt\u00F3re',
            part2: 'potrzebna zgoda',
        },
        scanTestDriveTooltip: {
            part1: 'Wy\u015Blij ten paragon do',
            part2: 'uko\u0144cz jazd\u0119 pr\u00F3bn\u0105!',
        },
    },
    discardChangesConfirmation: {
        title: 'Odrzuci\u0107 zmiany?',
        body: 'Czy na pewno chcesz odrzuci\u0107 wprowadzone zmiany?',
        confirmText: 'Odrzu\u0107 zmiany',
    },
    scheduledCall: {
        book: {
            title: 'Zaplanuj rozmow\u0119',
            description: 'Znajd\u017A czas, kt\u00F3ry Ci odpowiada.',
            slots: 'Dost\u0119pne godziny dla',
        },
        confirmation: {
            title: 'Potwierd\u017A po\u0142\u0105czenie',
            description:
                'Upewnij si\u0119, \u017Ce poni\u017Csze szczeg\u00F3\u0142y s\u0105 dla Ciebie w porz\u0105dku. Gdy potwierdzisz rozmow\u0119, wy\u015Blemy zaproszenie z dodatkowymi informacjami.',
            setupSpecialist: 'Tw\u00F3j specjalista ds. konfiguracji',
            meetingLength: 'D\u0142ugo\u015B\u0107 spotkania',
            dateTime: 'Data i czas',
            minutes: '30 minut',
        },
        callScheduled: 'Rozmowa zaplanowana',
    },
    autoSubmitModal: {
        title: 'Wszystko jasne i przes\u0142ane!',
        description: 'Wszystkie ostrze\u017Cenia i naruszenia zosta\u0142y usuni\u0119te, wi\u0119c:',
        submittedExpensesTitle: 'Te wydatki zosta\u0142y przes\u0142ane',
        submittedExpensesDescription:
            'Te wydatki zosta\u0142y wys\u0142ane do twojego zatwierdzaj\u0105cego, ale nadal mo\u017Cna je edytowa\u0107, dop\u00F3ki nie zostan\u0105 zatwierdzone.',
        pendingExpensesTitle: 'Oczekuj\u0105ce wydatki zosta\u0142y przeniesione',
        pendingExpensesDescription: 'Wszelkie oczekuj\u0105ce wydatki kartowe zosta\u0142y przeniesione do osobnego raportu, dop\u00F3ki nie zostan\u0105 zaksi\u0119gowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Wypr\u00F3buj przez 2 minuty',
        },
        modal: {
            title: 'Wypr\u00F3buj nas w praktyce',
            description: 'We\u017A szybk\u0105 wycieczk\u0119 po produkcie, aby szybko si\u0119 zapozna\u0107. \u017Badne przystanki nie s\u0105 wymagane!',
            confirmText: 'Rozpocznij jazd\u0119 pr\u00F3bn\u0105',
            helpText: 'Pomi\u0144',
            employee: {
                description:
                    '<muted-text>Uzyskaj dla swojego zespo\u0142u <strong>3 darmowe miesi\u0105ce Expensify!</strong> Wprowad\u017A poni\u017Cej adres e-mail swojego szefa i wy\u015Blij mu testowy wydatek.</muted-text>',
                email: 'Wprowad\u017A adres e-mail swojego szefa',
                error: 'Ten cz\u0142onek jest w\u0142a\u015Bcicielem przestrzeni roboczej, prosz\u0119 wprowadzi\u0107 nowego cz\u0142onka do testu.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Obecnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziw\u0105 rzecz?',
            getStarted: 'Zacznij teraz',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} zaprosi\u0142 Ci\u0119 do wypr\u00F3bowania Expensify\nHej! W\u0142a\u015Bnie zdoby\u0142em dla nas *3 miesi\u0105ce za darmo* na wypr\u00F3bowanie Expensify, najszybszego sposobu na rozliczanie wydatk\u00F3w.\n\nOto *przyk\u0142adowy paragon*, aby pokaza\u0107 Ci, jak to dzia\u0142a:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
