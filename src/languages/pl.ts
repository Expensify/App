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
import type {OnboardingCompanySize, OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
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
    BankAccountLastFourParams,
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
    BusinessBankAccountParams,
    BusinessTaxIDParams,
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
    ContactMethodParams,
    ContactMethodsRouteParams,
    CreateExpensesParams,
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
    SubmittedToVacationDelegateParams,
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
    VacationDelegateParams,
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
        dismiss: 'Odrzuć',
        yes: 'Tak',
        no: 'Nie',
        ok: 'OK',
        notNow: 'Nie teraz',
        learnMore: 'Dowiedz się więcej.',
        buttonConfirm: 'Zrozumiałem.',
        name: 'Imię',
        attachment: 'Załącznik',
        attachments: 'Załączniki',
        center: 'Centrum',
        from: 'Od',
        to: 'Do',
        in: 'W',
        optional: 'Opcjonalny',
        new: 'Nowy',
        search: 'Szukaj',
        reports: 'Raporty',
        find: 'Znajdź',
        searchWithThreeDots: 'Szukaj...',
        next: 'Następny',
        previous: 'Poprzedni',
        goBack: 'Wróć',
        create: 'Utwórz',
        add: 'Dodaj',
        resend: 'Wyślij ponownie',
        save: 'Zapisz',
        select: 'Wybierz',
        deselect: 'Odznacz',
        selectMultiple: 'Wybierz wiele',
        saveChanges: 'Zapisz zmiany',
        submit: 'Prześlij',
        rotate: 'Obróć',
        zoom: 'Zoom',
        password: 'Hasło',
        magicCode: 'Magic code',
        twoFactorCode: 'Kod dwuskładnikowy',
        workspaces: 'Przestrzenie robocze',
        inbox: 'Skrzynka odbiorcza',
        success: 'Sukces',
        group: 'Grupa',
        profile: 'Profil',
        referral: 'Polecenie',
        payments: 'Płatności',
        approvals: 'Zatwierdzenia',
        wallet: 'Portfel',
        preferences: 'Preferencje',
        view: 'Widok',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nie',
        signIn: 'Zaloguj się',
        signInWithGoogle: 'Zaloguj się przez Google',
        signInWithApple: 'Zaloguj się za pomocą Apple',
        signInWith: 'Zaloguj się za pomocą',
        continue: 'Kontynuuj',
        firstName: 'Imię',
        lastName: 'Nazwisko',
        scanning: 'Skanowanie',
        addCardTermsOfService: 'Warunki korzystania z usługi Expensify',
        perPerson: 'na osobę',
        phone: 'Telefon',
        phoneNumber: 'Numer telefonu',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'i',
        or: 'lub',
        details: 'Szczegóły',
        privacy: 'Prywatność',
        privacyPolicy: 'Polityka prywatności',
        hidden: 'Ukryty',
        visible: 'Widoczny',
        delete: 'Usuń',
        archived: 'zarchiwizowane',
        contacts: 'Kontakty',
        recents: 'Ostatnie',
        close: 'Zamknij',
        download: 'Pobierz',
        downloading: 'Pobieranie',
        uploading: 'Przesyłanie plików',
        pin: 'Przypnij',
        unPin: 'Odepnij',
        back: 'Wstecz',
        saveAndContinue: 'Zapisz i kontynuuj',
        settings: 'Ustawienia',
        termsOfService: 'Warunki korzystania z usługi',
        members: 'Członkowie',
        invite: 'Zaproś',
        here: 'tutaj',
        date: 'Data',
        dob: 'Data urodzenia',
        currentYear: 'Obecny rok',
        currentMonth: 'Bieżący miesiąc',
        ssnLast4: 'Ostatnie 4 cyfry numeru SSN',
        ssnFull9: 'Pełne 9 cyfr numeru SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Linia adresowa ${lineNumber}`,
        personalAddress: 'Adres osobisty',
        companyAddress: 'Adres firmy',
        noPO: 'Proszę nie podawać adresów skrytek pocztowych ani adresów punktów odbioru.',
        city: 'Miasto',
        state: 'Stan',
        streetAddress: 'Adres ulicy',
        stateOrProvince: 'Stan / Prowincja',
        country: 'Kraj',
        zip: 'Kod pocztowy',
        zipPostCode: 'Kod pocztowy',
        whatThis: 'Co to jest?',
        iAcceptThe: 'Akceptuję',
        remove: 'Usuń',
        admin: 'Admin',
        owner: 'Właściciel',
        dateFormat: 'YYYY-MM-DD',
        send: 'Wyślij',
        na: 'N/A',
        noResultsFound: 'Nie znaleziono wyników',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Nie znaleziono wyników pasujących do "${searchString}"`,
        recentDestinations: 'Ostatnie miejsca docelowe',
        timePrefix: 'To jest',
        conjunctionFor: 'dla',
        todayAt: 'Dzisiaj o',
        tomorrowAt: 'Jutro o',
        yesterdayAt: 'Wczoraj o',
        conjunctionAt: 'at',
        conjunctionTo: 'do',
        genericErrorMessage: 'Ups... coś poszło nie tak i twoje żądanie nie mogło zostać zrealizowane. Spróbuj ponownie później.',
        percentage: 'Procent',
        error: {
            invalidAmount: 'Nieprawidłowa kwota',
            acceptTerms: 'Musisz zaakceptować Warunki korzystania z usługi, aby kontynuować',
            phoneNumber: `Proszę wprowadzić prawidłowy numer telefonu z kodem kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'To pole jest wymagane',
            requestModified: 'To żądanie jest modyfikowane przez innego członka.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Przekroczono limit znaków (${length}/${limit})`,
            dateInvalid: 'Proszę wybrać prawidłową datę',
            invalidDateShouldBeFuture: 'Proszę wybrać dzisiejszą lub przyszłą datę',
            invalidTimeShouldBeFuture: 'Proszę wybrać czas co najmniej o minutę późniejszy.',
            invalidCharacter: 'Nieprawidłowy znak',
            enterMerchant: 'Wprowadź nazwę sprzedawcy',
            enterAmount: 'Wprowadź kwotę',
            missingMerchantName: 'Brakująca nazwa sprzedawcy',
            missingAmount: 'Brakująca kwota',
            missingDate: 'Brakująca data',
            enterDate: 'Wprowadź datę',
            invalidTimeRange: 'Proszę podać godzinę w formacie 12-godzinnym (np. 2:30 PM)',
            pleaseCompleteForm: 'Proszę wypełnić powyższy formularz, aby kontynuować.',
            pleaseSelectOne: 'Proszę wybrać jedną z opcji powyżej',
            invalidRateError: 'Proszę wprowadzić prawidłową stawkę',
            lowRateError: 'Stawka musi być większa niż 0',
            email: 'Proszę wprowadzić prawidłowy adres e-mail',
            login: 'Wystąpił błąd podczas logowania. Proszę spróbować ponownie.',
        },
        comma: 'przecinek',
        semicolon: 'semicolon',
        please: 'Proszę',
        contactUs: 'skontaktuj się z nami',
        pleaseEnterEmailOrPhoneNumber: 'Proszę wprowadzić adres e-mail lub numer telefonu',
        fixTheErrors: 'napraw błędy',
        inTheFormBeforeContinuing: 'w formularzu przed kontynuacją',
        confirm: 'Potwierdź',
        reset: 'Resetuj',
        done: 'Gotowe',
        more: 'Więcej',
        debitCard: 'Karta debetowa',
        bankAccount: 'Konto bankowe',
        personalBankAccount: 'Osobiste konto bankowe',
        businessBankAccount: 'Konto bankowe dla firm',
        join: 'Dołącz',
        leave: 'Opuść',
        decline: 'Odrzuć',
        transferBalance: 'Przelej saldo',
        cantFindAddress: 'Nie możesz znaleźć swojego adresu?',
        enterManually: 'Wprowadź ręcznie',
        message: 'Wiadomość',
        leaveThread: 'Opuść wątek',
        you: 'Ty',
        youAfterPreposition: 'ty',
        your: 'twój',
        conciergeHelp: 'Proszę skontaktować się z Concierge po pomoc.',
        youAppearToBeOffline: 'Wygląda na to, że jesteś offline.',
        thisFeatureRequiresInternet: 'Ta funkcja wymaga aktywnego połączenia z internetem.',
        attachmentWillBeAvailableOnceBackOnline: 'Załącznik będzie dostępny, gdy wróci online.',
        errorOccurredWhileTryingToPlayVideo: 'Wystąpił błąd podczas próby odtworzenia tego wideo.',
        areYouSure: 'Czy jesteś pewien?',
        verify: 'Zweryfikuj',
        yesContinue: 'Tak, kontynuuj.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Opis',
        title: 'Tytuł',
        assignee: 'Przypisany',
        createdBy: 'Utworzone przez',
        with: 'z',
        shareCode: 'Udostępnij kod',
        share: 'Udostępnij',
        per: 'na',
        mi: 'mila',
        km: 'kilometr',
        copied: 'Skopiowano!',
        someone: 'Ktoś',
        total: 'Suma',
        edit: 'Edytuj',
        letsDoThis: `Zróbmy to!`,
        letsStart: `Zacznijmy`,
        showMore: 'Pokaż więcej',
        merchant: 'Sprzedawca',
        category: 'Kategoria',
        report: 'Raport',
        billable: 'Podlegające fakturowaniu',
        nonBillable: 'Niepodlegające fakturowaniu',
        tag: 'Tag',
        receipt: 'Paragon',
        verified: 'Zweryfikowano',
        replace: 'Zastąp',
        distance: 'Odległość',
        mile: 'mila',
        miles: 'mile',
        kilometer: 'kilometr',
        kilometers: 'kilometry',
        recent: 'Najnowsze',
        all: 'Wszystko',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Wybierz walutę',
        card: 'Karta',
        whyDoWeAskForThis: 'Dlaczego o to prosimy?',
        required: 'Wymagane',
        showing: 'Pokazywanie',
        of: 'of',
        default: 'Domyślny',
        update: 'Aktualizuj',
        member: 'Członek',
        auditor: 'Audytor',
        role: 'Rola',
        currency: 'Waluta',
        rate: 'Oceń',
        emptyLHN: {
            title: 'Hurra! Wszystko nadrobione.',
            subtitleText1: 'Znajdź czat używając',
            subtitleText2: 'przycisk powyżej lub stwórz coś za pomocą',
            subtitleText3: 'przycisk poniżej.',
        },
        businessName: 'Nazwa firmy',
        clear: 'Wyczyść',
        type: 'Rodzaj',
        action: 'Akcja',
        expenses: 'Wydatki',
        tax: 'Podatek',
        shared: 'Udostępnione',
        drafts: 'Szkice',
        finished: 'Zakończono',
        upgrade: 'Ulepszanie',
        downgradeWorkspace: 'Obniż poziom przestrzeni roboczej',
        companyID: 'ID firmy',
        userID: 'ID użytkownika',
        disable: 'Wyłącz',
        export: 'Eksportuj',
        basicExport: 'Eksport podstawowy',
        initialValue: 'Wartość początkowa',
        currentDate: 'Aktualna data',
        value: 'Wartość',
        downloadFailedTitle: 'Pobieranie nie powiodło się',
        downloadFailedDescription: 'Nie udało się zakończyć pobierania. Spróbuj ponownie później.',
        filterLogs: 'Filtruj dzienniki',
        network: 'Sieć',
        reportID: 'ID raportu',
        longID: 'Długi identyfikator',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        dropTitle: 'Puść to',
        dropMessage: 'Prześlij swój plik tutaj',
        ignore: 'Ignore',
        enabled: 'Włączone',
        disabled: 'Wyłączony',
        import: 'Importuj',
        offlinePrompt: 'Nie możesz teraz podjąć tej akcji.',
        outstanding: 'Zaległe',
        chats: 'Czaty',
        tasks: 'Zadania',
        unread: 'Nieprzeczytane',
        sent: 'Wysłano',
        links: 'Linki',
        days: 'dni',
        rename: 'Zmień nazwę',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Pomiń',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Potrzebujesz czegoś konkretnego? Porozmawiaj ze swoim opiekunem konta, ${accountManagerDisplayName}.`,
        chatNow: 'Czat teraz',
        workEmail: 'Służbowy e-mail',
        destination: 'Cel',
        subrate: 'Subrate',
        perDiem: 'Dieta',
        validate: 'Zatwierdź',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReports: 'Raporty wydatków',
        rateOutOfPolicy: 'Oceń poza polityką',
        reimbursable: 'Podlegające zwrotowi',
        editYourProfile: 'Edytuj swój profil',
        comments: 'Komentarze',
        sharedIn: 'Udostępnione w',
        unreported: 'Nie zgłoszono',
        explore: 'Eksploruj',
        todo: 'Do zrobienia',
        invoice: 'Faktura',
        expense: 'Wydatek',
        chat: 'Czat',
        task: 'Zadanie',
        trip: 'Podróż',
        apply: 'Zastosuj',
        status: 'Status',
        on: 'Na',
        before: 'Przed',
        after: 'Po',
        reschedule: 'Przełożyć na inny termin',
        general: 'Ogólne',
        workspacesTabTitle: 'Przestrzenie robocze',
        getTheApp: 'Pobierz aplikację',
        scanReceiptsOnTheGo: 'Skanuj paragony za pomocą telefonu',
        headsUp: 'Uwaga!',
    },
    supportalNoAccess: {
        title: 'Nie tak szybko',
        description: 'Nie masz uprawnień do wykonania tej akcji, gdy wsparcie jest zalogowane.',
    },
    lockedAccount: {
        title: 'Zablokowane konto',
        description: 'Nie masz uprawnień do wykonania tej akcji, ponieważ to konto zostało zablokowane. Skontaktuj się z concierge@expensify.com, aby uzyskać dalsze instrukcje.',
    },
    location: {
        useCurrent: 'Użyj bieżącej lokalizacji',
        notFound: 'Nie udało nam się znaleźć Twojej lokalizacji. Spróbuj ponownie lub wprowadź adres ręcznie.',
        permissionDenied: 'Wygląda na to, że odmówiłeś dostępu do swojej lokalizacji.',
        please: 'Proszę',
        allowPermission: 'zezwól na dostęp do lokalizacji w ustawieniach',
        tryAgain: 'i spróbuj ponownie.',
    },
    contact: {
        importContacts: 'Importuj kontakty',
        importContactsTitle: 'Zaimportuj swoje kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby Twoi ulubieni ludzie byli zawsze w zasięgu ręki.',
        importContactsExplanation: 'więc twoi ulubieni ludzie są zawsze w zasięgu ręki.',
        importContactsNativeText: 'Jeszcze tylko jeden krok! Daj nam zielone światło, aby zaimportować Twoje kontakty.',
    },
    anonymousReportFooter: {
        logoTagline: 'Dołącz do dyskusji.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Dostęp do aparatu',
        expensifyDoesNotHaveAccessToCamera: 'Expensify nie może robić zdjęć bez dostępu do Twojego aparatu. Stuknij ustawienia, aby zaktualizować uprawnienia.',
        attachmentError: 'Błąd załącznika',
        errorWhileSelectingAttachment: 'Wystąpił błąd podczas wybierania załącznika. Proszę spróbować ponownie.',
        errorWhileSelectingCorruptedAttachment: 'Wystąpił błąd podczas wybierania uszkodzonego załącznika. Proszę spróbować z innym plikiem.',
        takePhoto: 'Zrób zdjęcie',
        chooseFromGallery: 'Wybierz z galerii',
        chooseDocument: 'Wybierz plik',
        attachmentTooLarge: 'Załącznik jest zbyt duży',
        sizeExceeded: 'Rozmiar załącznika przekracza limit 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Rozmiar załącznika przekracza limit ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Załącznik jest zbyt mały',
        sizeNotMet: 'Rozmiar załącznika musi być większy niż 240 bajtów',
        wrongFileType: 'Nieprawidłowy typ pliku',
        notAllowedExtension: 'Ten typ pliku nie jest dozwolony. Proszę spróbować inny typ pliku.',
        folderNotAllowedMessage: 'Przesyłanie folderu jest niedozwolone. Proszę spróbować z innym plikiem.',
        protectedPDFNotSupported: 'Plik PDF chroniony hasłem nie jest obsługiwany',
        attachmentImageResized: 'Ten obraz został zmieniony na potrzeby podglądu. Pobierz, aby uzyskać pełną rozdzielczość.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt duży, aby wyświetlić podgląd przed przesłaniem.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Możesz przesłać jednocześnie maksymalnie ${fileLimit} plików.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Plik przekracza ${maxUploadSizeInMB} MB. Proszę spróbować ponownie.`,
    },
    dropzone: {
        addAttachments: 'Dodaj załączniki',
        scanReceipts: 'Skanuj paragony',
        replaceReceipt: 'Zastąp paragon',
    },
    filePicker: {
        fileError: 'Błąd pliku',
        errorWhileSelectingFile: 'Wystąpił błąd podczas wybierania pliku. Proszę spróbować ponownie.',
    },
    connectionComplete: {
        title: 'Połączenie zakończone',
        supportingText: 'Możesz zamknąć to okno i wrócić do aplikacji Expensify.',
    },
    avatarCropModal: {
        title: 'Edytuj zdjęcie',
        description: 'Przeciągaj, powiększaj i obracaj swój obrazek, jak tylko chcesz.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nie znaleziono rozszerzenia dla typu MIME',
        problemGettingImageYouPasted: 'Wystąpił problem z pobraniem obrazu, który wkleiłeś.',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksymalna długość komentarza to ${formattedMaxLength} znaków.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksymalna długość tytułu zadania to ${formattedMaxLength} znaków.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Zaktualizuj aplikację',
        updatePrompt: 'Nowa wersja tej aplikacji jest dostępna. Zaktualizuj teraz lub uruchom aplikację ponownie później, aby pobrać najnowsze zmiany.',
    },
    deeplinkWrapper: {
        launching: 'Uruchamianie Expensify',
        expired: 'Twoja sesja wygasła.',
        signIn: 'Proszę zalogować się ponownie.',
        redirectedToDesktopApp: 'Przekierowaliśmy Cię do aplikacji na komputer.',
        youCanAlso: 'Możesz również',
        openLinkInBrowser: 'otwórz ten link w przeglądarce',
        loggedInAs: ({email}: LoggedInAsParams) => `Jesteś zalogowany jako ${email}. Kliknij „Otwórz link” w oknie dialogowym, aby zalogować się do aplikacji desktopowej na to konto.`,
        doNotSeePrompt: 'Nie widzisz monitu?',
        tryAgain: 'Spróbuj ponownie',
        or: ', lub',
        continueInWeb: 'przejdź do aplikacji internetowej',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abrakadabra, jesteś zalogowany!',
        successfulSignInDescription: 'Wróć do swojej oryginalnej karty, aby kontynuować.',
        title: 'Oto Twój magiczny kod',
        description: 'Proszę wprowadzić kod z urządzenia, na którym został pierwotnie zażądany',
        doNotShare: 'Nie udostępniaj swojego kodu nikomu. Expensify nigdy nie poprosi Cię o jego podanie!',
        or: ', lub',
        signInHere: 'zaloguj się tutaj',
        expiredCodeTitle: 'Kod magiczny wygasł',
        expiredCodeDescription: 'Wróć do oryginalnego urządzenia i poproś o nowy kod',
        successfulNewCodeRequest: 'Kod został wysłany. Proszę sprawdzić swoje urządzenie.',
        tfaRequiredTitle: 'Wymagana dwuetapowa weryfikacja',
        tfaRequiredDescription: 'Proszę wprowadzić kod uwierzytelniania dwuskładnikowego, gdzie próbujesz się zalogować.',
        requestOneHere: 'poproś o jeden tutaj.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Opłacone przez',
        whatsItFor: 'Do czego to służy?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Imię, email lub numer telefonu',
        findMember: 'Znajdź członka',
        searchForSomeone: 'Wyszukaj kogoś',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Złóż wydatek, poleć swojego szefa',
            subtitleText: 'Chcesz, aby Twój szef również korzystał z Expensify? Po prostu prześlij mu raport wydatków, a my zajmiemy się resztą.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Zarezerwuj rozmowę',
    },
    hello: 'Cześć',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Rozpocznij poniżej.',
        anotherLoginPageIsOpen: 'Otwarta jest inna strona logowania.',
        anotherLoginPageIsOpenExplanation: 'Otworzyłeś stronę logowania w osobnej karcie. Zaloguj się z tej karty.',
        welcome: 'Witamy!',
        welcomeWithoutExclamation: 'Witamy',
        phrase2: 'Pieniądze mówią. A teraz, gdy czat i płatności są w jednym miejscu, jest to również łatwe.',
        phrase3: 'Twoje płatności docierają do Ciebie tak szybko, jak szybko potrafisz przekazać swoją myśl.',
        enterPassword: 'Proszę wprowadzić swoje hasło',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, zawsze miło widzieć nową twarz w okolicy!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Proszę wprowadzić magiczny kod wysłany na ${login}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
    },
    login: {
        hero: {
            header: 'Podróże i wydatki, z prędkością czatu',
            body: 'Witamy w nowej generacji Expensify, gdzie Twoje podróże i wydatki są szybsze dzięki kontekstowemu, rzeczywistemu czatowi.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Jesteś już zalogowany jako ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Nie chcesz logować się za pomocą ${provider}?`,
        continueWithMyCurrentSession: 'Kontynuuj moją obecną sesję',
        redirectToDesktopMessage: 'Przekierujemy Cię do aplikacji desktopowej po zakończeniu logowania.',
        signInAgreementMessage: 'Logując się, zgadzasz się na',
        termsOfService: 'Warunki korzystania z usługi',
        privacy: 'Prywatność',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Kontynuuj logowanie za pomocą jednokrotnego logowania:',
        orContinueWithMagicCode: 'Możesz również zalogować się za pomocą magicznego kodu',
        useSingleSignOn: 'Użyj jednokrotnego logowania (SSO)',
        useMagicCode: 'Użyj magicznego kodu',
        launching: 'Uruchamianie...',
        oneMoment: 'Chwila, przekierowujemy Cię do portalu logowania jednokrotnego Twojej firmy.',
    },
    reportActionCompose: {
        dropToUpload: 'Upuść, aby przesłać',
        sendAttachment: 'Wyślij załącznik',
        addAttachment: 'Dodaj załącznik',
        writeSomething: 'Napisz coś...',
        blockedFromConcierge: 'Komunikacja jest zablokowana',
        fileUploadFailed: 'Przesyłanie nie powiodło się. Plik nie jest obsługiwany.',
        localTime: ({user, time}: LocalTimeParams) => `Jest ${time} dla ${user}`,
        edited: '(edycja)',
        emoji: 'Emoji',
        collapse: 'Zwiń',
        expand: 'Rozwiń',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Skopiuj do schowka',
        copied: 'Skopiowano!',
        copyLink: 'Skopiuj link',
        copyURLToClipboard: 'Skopiuj URL do schowka',
        copyEmailToClipboard: 'Skopiuj e-mail do schowka',
        markAsUnread: 'Oznacz jako nieprzeczytane',
        markAsRead: 'Oznacz jako przeczytane',
        editAction: ({action}: EditActionParams) => `Edytuj ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz'}`,
        deleteAction: ({action}: DeleteActionParams) => `Usuń ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) => `Czy na pewno chcesz usunąć ten ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz'}?`,
        onlyVisible: 'Widoczne tylko dla',
        replyInThread: 'Odpowiedz w wątku',
        joinThread: 'Dołącz do wątku',
        leaveThread: 'Opuść wątek',
        copyOnyxData: 'Skopiuj dane Onyx',
        flagAsOffensive: 'Oznacz jako obraźliwe',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Dodaj reakcję',
        reactedWith: 'zareagował(a) za pomocą',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Przegapiłeś imprezę w',
        beginningOfArchivedRoomPartTwo: ', nie ma tu nic do zobaczenia.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) => `Ten czat jest z wszystkimi członkami Expensify na domenie ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Używaj go do rozmów ze współpracownikami, dzielenia się wskazówkami i zadawania pytań.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Ta rozmowa jest z',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: 'Użyj tego, aby porozmawiać o konfiguracji przestrzeni roboczej i nie tylko.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Ten czat jest z wszystkimi w ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Używaj tego do najważniejszych ogłoszeń.`,
        beginningOfChatHistoryUserRoomPartOne: 'Ten pokój czatowy jest do wszystkiego.',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Ten czat dotyczy faktur pomiędzy`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Użyj przycisku +, aby wysłać fakturę.`,
        beginningOfChatHistory: 'Ta rozmowa jest z',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'To jest miejsce, gdzie',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'prześle wydatki do',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Po prostu użyj przycisku +.',
        beginningOfChatHistorySelfDM: 'To jest Twoja przestrzeń osobista. Używaj jej do notatek, zadań, szkiców i przypomnień.',
        beginningOfChatHistorySystemDM: 'Witamy! Zacznijmy konfigurację.',
        chatWithAccountManager: 'Czat z Twoim opiekunem konta tutaj',
        sayHello: 'Powiedz cześć!',
        yourSpace: 'Twoja przestrzeń',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Witamy w ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Użyj przycisku +, aby ${additionalText} wydatek.`,
        askConcierge: 'Zadawaj pytania i otrzymuj wsparcie w czasie rzeczywistym 24/7.',
        conciergeSupport: 'Całodobowe wsparcie',
        create: 'utwórz',
        iouTypes: {
            pay: 'zapłać',
            split: 'podzielić',
            submit: 'prześlij',
            track: 'śledzić',
            invoice: 'faktura',
        },
    },
    adminOnlyCanPost: 'Tylko administratorzy mogą wysyłać wiadomości w tym pokoju.',
    reportAction: {
        asCopilot: 'jako współpilot dla',
    },
    mentionSuggestions: {
        hereAlternateText: 'Powiadom wszystkich w tej rozmowie',
    },
    newMessages: 'Nowe wiadomości',
    youHaveBeenBanned: 'Uwaga: Zostałeś zbanowany z czatu na tym kanale.',
    reportTypingIndicator: {
        isTyping: 'pisze...',
        areTyping: 'piszą...',
        multipleMembers: 'Wielu członków',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Ten pokój czatu został zarchiwizowany.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Ten czat nie jest już aktywny, ponieważ ${displayName} zamknął swoje konto.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${oldDisplayName} połączył swoje konto z ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Ten czat nie jest już aktywny, ponieważ <strong>ty</strong> nie jesteś już członkiem przestrzeni roboczej ${policyName}.`
                : `Ten czat nie jest już aktywny, ponieważ ${displayName} nie jest już członkiem przestrzeni roboczej ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywnym miejscem pracy.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Ten czat nie jest już aktywny, ponieważ ${policyName} nie jest już aktywnym miejscem pracy.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Ta rezerwacja jest zarchiwizowana.',
    },
    writeCapabilityPage: {
        label: 'Kto może opublikować',
        writeCapability: {
            all: 'Wszyscy członkowie',
            admins: 'Tylko administratorzy',
        },
    },
    sidebarScreen: {
        buttonFind: 'Znajdź coś...',
        buttonMySettings: 'Moje ustawienia',
        fabNewChat: 'Rozpocznij czat',
        fabNewChatExplained: 'Rozpocznij czat (Pływająca akcja)',
        chatPinned: 'Czat przypięty',
        draftedMessage: 'Wiadomość robocza',
        listOfChatMessages: 'Lista wiadomości czatu',
        listOfChats: 'Lista czatów',
        saveTheWorld: 'Ratuj świat',
        tooltip: 'Rozpocznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Już wkrótce',
            description: 'Dostosowujemy jeszcze kilka elementów Nowego Expensify, aby dopasować go do Twojej specyficznej konfiguracji. W międzyczasie przejdź do Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Subskrypcja',
        domains: 'Domeny',
    },
    tabSelector: {
        chat: 'Czat',
        room: 'Pokój',
        distance: 'Odległość',
        manual: 'Podręcznik',
        scan: 'Skanuj',
    },
    spreadsheet: {
        upload: 'Prześlij arkusz kalkulacyjny',
        dragAndDrop: 'Przeciągnij i upuść swój arkusz kalkulacyjny tutaj lub wybierz plik poniżej. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.',
        chooseSpreadsheet: 'Wybierz plik arkusza kalkulacyjnego do importu. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.',
        fileContainsHeader: 'Plik zawiera nagłówki kolumn',
        column: ({name}: SpreadSheetColumnParams) => `Kolumna ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ups! Wymagane pole („${fieldName}”) nie zostało zmapowane. Proszę sprawdzić i spróbować ponownie.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Ups! Przypisałeś jedno pole ("${fieldName}") do wielu kolumn. Proszę sprawdź i spróbuj ponownie.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ups! Pole („${fieldName}”) zawiera jedną lub więcej pustych wartości. Proszę sprawdzić i spróbować ponownie.`,
        importSuccessfulTitle: 'Import zakończony pomyślnie',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `Dodano ${categories} kategorie.` : 'Dodano 1 kategorię.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Nie dodano ani nie zaktualizowano żadnych członków.';
            }
            if (added && updated) {
                return `${added} członek${added > 1 ? 's' : ''} dodany, ${updated} członek${updated > 1 ? 's' : ''} zaktualizowany.`;
            }
            if (updated) {
                return updated > 1 ? `Zaktualizowano ${updated} członków.` : '1 członek został zaktualizowany.';
            }
            return added > 1 ? `Dodano ${added} członków.` : 'Dodano 1 członka.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `Dodano ${tags} tagi.` : 'Dodano 1 tag.'),
        importMultiLevelTagsSuccessfulDescription: 'Dodano tagi wielopoziomowe.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) => (rates > 1 ? `Dodano stawki dzienne ${rates}.` : 'Dodano 1 stawkę dzienną.'),
        importFailedTitle: 'Import nie powiódł się',
        importFailedDescription: 'Upewnij się, że wszystkie pola są wypełnione poprawnie i spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z Concierge.',
        importDescription: 'Wybierz, które pola chcesz zmapować z arkusza kalkulacyjnego, klikając menu rozwijane obok każdej zaimportowanej kolumny poniżej.',
        sizeNotMet: 'Rozmiar pliku musi być większy niż 0 bajtów',
        invalidFileMessage:
            'Plik, który przesłałeś, jest pusty lub zawiera nieprawidłowe dane. Upewnij się, że plik jest poprawnie sformatowany i zawiera niezbędne informacje przed ponownym przesłaniem.',
        importSpreadsheet: 'Importuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz CSV',
    },
    receipt: {
        upload: 'Prześlij paragon',
        dragReceiptBeforeEmail: 'Przeciągnij paragon na tę stronę, prześlij paragon do',
        dragReceiptAfterEmail: 'lub wybierz plik do przesłania poniżej.',
        chooseReceipt: 'Wybierz paragon do przesłania lub prześlij paragon do',
        takePhoto: 'Zrób zdjęcie',
        cameraAccess: 'Dostęp do aparatu jest wymagany, aby robić zdjęcia paragonów.',
        deniedCameraAccess: 'Dostęp do kamery nadal nie został przyznany, proszę postępować zgodnie z',
        deniedCameraAccessInstructions: 'te instrukcje',
        cameraErrorTitle: 'Błąd aparatu',
        cameraErrorMessage: 'Wystąpił błąd podczas robienia zdjęcia. Spróbuj ponownie.',
        locationAccessTitle: 'Zezwól na dostęp do lokalizacji',
        locationAccessMessage: 'Dostęp do lokalizacji pomaga nam utrzymać dokładność strefy czasowej i waluty, gdziekolwiek się znajdujesz.',
        locationErrorTitle: 'Zezwól na dostęp do lokalizacji',
        locationErrorMessage: 'Dostęp do lokalizacji pomaga nam utrzymać dokładność strefy czasowej i waluty, gdziekolwiek się znajdujesz.',
        allowLocationFromSetting: `Dostęp do lokalizacji pomaga nam utrzymać dokładność strefy czasowej i waluty, gdziekolwiek jesteś. Proszę zezwolić na dostęp do lokalizacji w ustawieniach uprawnień urządzenia.`,
        dropTitle: 'Puść to',
        dropMessage: 'Prześlij swój plik tutaj',
        flash: 'błyskawica',
        multiScan: 'multi-skanowanie',
        shutter: 'migawka',
        gallery: 'galeria',
        deleteReceipt: 'Usuń paragon',
        deleteConfirmation: 'Czy na pewno chcesz usunąć ten paragon?',
        addReceipt: 'Dodaj paragon',
        scanFailed: 'Paragon nie może być zeskanowany, ponieważ brakuje sprzedawcy, daty lub kwoty.',
    },
    quickAction: {
        scanReceipt: 'Skanuj paragon',
        recordDistance: 'Śledź odległość',
        requestMoney: 'Utwórz wydatek',
        perDiem: 'Utwórz dietę',
        splitBill: 'Podziel wydatek',
        splitScan: 'Podziel paragon',
        splitDistance: 'Podziel odległość',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        assignTask: 'Przypisz zadanie',
        header: 'Szybka akcja',
        noLongerHaveReportAccess: 'Nie masz już dostępu do swojego poprzedniego miejsca docelowego szybkiej akcji. Wybierz nowe poniżej.',
        updateDestination: 'Zaktualizuj miejsce docelowe',
        createReport: 'Utwórz raport',
    },
    iou: {
        amount: 'Kwota',
        taxAmount: 'Kwota podatku',
        taxRate: 'Stawka podatkowa',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Zatwierdź ${formattedAmount}` : 'Zatwierdź'),
        approved: 'Zatwierdzono',
        cash: 'Gotówka',
        card: 'Karta',
        original: 'Oryginał',
        split: 'Podzielić',
        splitExpense: 'Podziel wydatek',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} od ${merchant}`,
        addSplit: 'Dodaj podział',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Całkowita kwota jest o ${amount} większa niż pierwotny wydatek.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Całkowita kwota jest o ${amount} mniejsza niż pierwotny wydatek.`,
        splitExpenseZeroAmount: 'Proszę wprowadzić prawidłową kwotę przed kontynuowaniem.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edytuj ${amount} dla ${merchant}`,
        removeSplit: 'Usuń podział',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Zapłać ${name ?? 'ktoś'}`,
        expense: 'Wydatek',
        categorize: 'Kategoryzuj',
        share: 'Udostępnij',
        participants: 'Uczestnicy',
        createExpense: 'Utwórz wydatek',
        trackDistance: 'Śledź odległość',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Utwórz ${expensesNumber} wydatki`,
        addExpense: 'Dodaj wydatek',
        chooseRecipient: 'Wybierz odbiorcę',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Utwórz wydatek na kwotę ${amount}`,
        confirmDetails: 'Potwierdź szczegóły',
        pay: 'Zapłać',
        cancelPayment: 'Anuluj płatność',
        cancelPaymentConfirmation: 'Czy na pewno chcesz anulować tę płatność?',
        viewDetails: 'Zobacz szczegóły',
        pending: 'Oczekujące',
        canceled: 'Anulowano',
        posted: 'Opublikowano',
        deleteReceipt: 'Usuń paragon',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `usunął wydatek w tym raporcie, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `przeniósł wydatek${reportName ? `z ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `przeniesiono ten wydatek${reportName ? `do <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'przeniósł ten wydatek do twojej przestrzeni osobistej',
        pendingMatchWithCreditCard: 'Paragon oczekuje na dopasowanie z transakcją kartą',
        pendingMatch: 'Oczekujące dopasowanie',
        pendingMatchWithCreditCardDescription: 'Paragon oczekuje na dopasowanie z transakcją kartą. Oznacz jako gotówka, aby anulować.',
        markAsCash: 'Oznacz jako gotówka',
        routePending: 'Trasa w toku...',
        receiptScanning: () => ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragonów...',
        }),
        scanMultipleReceipts: 'Skanuj wiele paragonów',
        scanMultipleReceiptsDescription: 'Zrób zdjęcia wszystkich swoich paragonów naraz, a następnie potwierdź szczegóły samodzielnie lub pozwól, aby SmartScan się tym zajął.',
        receiptScanInProgress: 'Skanowanie paragonu w toku',
        receiptScanInProgressDescription: 'Trwa skanowanie paragonu. Sprawdź później lub wprowadź dane teraz.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Zidentyfikowano potencjalne duplikaty wydatków. Przejrzyj duplikaty, aby umożliwić przesłanie.'
                : 'Zidentyfikowano potencjalne duplikaty wydatków. Przejrzyj duplikaty, aby umożliwić zatwierdzenie.',
        receiptIssuesFound: () => ({
            one: 'Znaleziono problem',
            other: 'Znalezione problemy',
        }),
        fieldPending: 'Oczekujące...',
        defaultRate: 'Domyślna stawka',
        receiptMissingDetails: 'Brakujące szczegóły paragonu',
        missingAmount: 'Brakująca kwota',
        missingMerchant: 'Brakujący sprzedawca',
        receiptStatusTitle: 'Skanowanie…',
        receiptStatusText: 'Tylko Ty możesz zobaczyć ten paragon podczas skanowania. Sprawdź później lub wprowadź teraz szczegóły.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiodło się. Proszę wprowadzić dane ręcznie.',
        transactionPendingDescription: 'Transakcja w toku. Może minąć kilka dni, zanim zostanie zaksięgowana.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy kilku dodatkowych informacji, zanim będziesz mógł wysłać swoją pierwszą fakturę.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Jeśli nie masz strony internetowej, możesz zamiast tego podać profil swojej firmy na LinkedIn lub w mediach społecznościowych.',
        invalidDomainError: 'Wprowadziłeś nieprawidłową domenę. Aby kontynuować, wprowadź prawidłową domenę.',
        publicDomainError: 'Wprowadziłeś domenę publiczną. Aby kontynuować, wprowadź domenę prywatną.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} skanowanie`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} oczekujące`);
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
            one: 'Usuń wydatek',
            other: 'Usuń wydatki',
        }),
        deleteConfirmation: () => ({
            one: 'Czy na pewno chcesz usunąć ten wydatek?',
            other: 'Czy na pewno chcesz usunąć te wydatki?',
        }),
        deleteReport: 'Usuń raport',
        deleteReportConfirmation: 'Czy na pewno chcesz usunąć ten raport?',
        settledExpensify: 'Zapłacono',
        done: 'Gotowe',
        settledElsewhere: 'Opłacone gdzie indziej',
        individual: 'Indywidualny',
        business: 'Biznes',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} za pomocą Expensify` : `Zapłać z Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako osoba prywatna` : `Zapłać z konta osobistego`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} portfelem` : `Zapłać portfelem`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Zapłać ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Zapłać ${formattedAmount} jako firma` : `Zapłać z konta firmowego`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Oznacz ${formattedAmount} jako zapłacone` : `Oznacz jako zapłacone`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `Zapłacono ${amount} z konta osobistego ${last4Digits}` : `Zapłacono z konta osobistego`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `Zapłacono ${amount} z konta firmowego ${last4Digits}` : `Zapłacono z konta firmowego`),
        payWithPolicy: ({formattedAmount, policyName}: SettleExpensifyCardParams & {policyName: string}) =>
            formattedAmount ? `Zapłać ${formattedAmount} przez ${policyName}` : `Zapłać przez ${policyName}`,
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => `Zapłacono ${amount} z konta bankowego ${last4Digits}.`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Konto osobiste • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Konto firmowe • ${lastFour}`,
        nextStep: 'Następne kroki',
        finished: 'Zakończono',
        sendInvoice: ({amount}: RequestAmountParams) => `Wyślij fakturę na kwotę ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Zatwierdź ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        submitted: `przesłano`,
        automaticallySubmitted: `przesłane za pomocą <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">opóźnij zgłoszenia</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `śledzenie ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `podziel ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `podziel ${formattedAmount}${comment ? `dla ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Twój podział ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} jest winien ${amount}${comment ? `dla ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} jest winien:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}zapłacił ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} zapłacił:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} wydał ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} wydał:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} zatwierdził:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} zatwierdził ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `zapłacono ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `zapłacono ${amount}. Dodaj konto bankowe, aby otrzymać swoją płatność.`,
        automaticallyApproved: `zatwierdzono poprzez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `zatwierdzono ${amount}`,
        approvedMessage: `zatwierdzony`,
        unapproved: `niezatwierdzony`,
        automaticallyForwarded: `zatwierdzono poprzez <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasady przestrzeni roboczej</a>`,
        forwarded: `zatwierdzony`,
        rejectedThisReport: 'odrzucono ten raport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpoczęto rozliczanie. Płatność jest wstrzymana, dopóki ${submitterDisplayName} nie doda konta bankowego.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} anulował płatność`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `anulowano płatność w wysokości ${amount}, ponieważ ${submitterDisplayName} nie aktywował swojego Portfela Expensify w ciągu 30 dni`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} dodał konto bankowe. Płatność w wysokości ${amount} została dokonana.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}oznaczono jako zapłacone`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}zapłacono portfelem`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}zapłacono z Expensify za pomocą <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">zasad przestrzeni roboczej</a>`,
        noReimbursableExpenses: 'Ten raport ma nieprawidłową kwotę',
        pendingConversionMessage: 'Całkowita kwota zostanie zaktualizowana, gdy będziesz ponownie online.',
        changedTheExpense: 'zmienił wydatek',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} na ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `ustaw ${translatedChangedField} na ${newMerchant}, co ustawiło kwotę na ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName} (wcześniej ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} na ${newValueToDisplay} (wcześniej ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `zmienił ${translatedChangedField} na ${newMerchant} (wcześniej ${oldMerchant}), co zaktualizowało kwotę na ${newAmountToDisplay} (wcześniej ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `dla ${comment}` : 'wydatek'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Raport faktury nr ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} wysłano${comment ? `dla ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `przeniesiono wydatek z przestrzeni osobistej do ${workspaceName ?? `czat z ${reportName}`}`,
        movedToPersonalSpace: 'przeniesiono wydatek do przestrzeni osobistej',
        tagSelection: 'Wybierz tag, aby lepiej zorganizować swoje wydatki.',
        categorySelection: 'Wybierz kategorię, aby lepiej zorganizować swoje wydatki.',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znaków. Proszę ją skrócić lub wybrać inną kategorię.',
            invalidTagLength: 'Nazwa tagu przekracza 255 znaków. Proszę skrócić ją lub wybrać inny tag.',
            invalidAmount: 'Proszę wprowadzić prawidłową kwotę przed kontynuowaniem',
            invalidIntegerAmount: 'Proszę wprowadzić pełną kwotę w dolarach przed kontynuowaniem',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maksymalna kwota podatku to ${amount}`,
            invalidSplit: 'Suma podziałów musi być równa całkowitej kwocie',
            invalidSplitParticipants: 'Proszę wprowadzić kwotę większą niż zero dla co najmniej dwóch uczestników.',
            invalidSplitYourself: 'Proszę wprowadzić kwotę różną od zera dla podziału',
            noParticipantSelected: 'Proszę wybrać uczestnika',
            other: 'Nieoczekiwany błąd. Proszę spróbować ponownie później.',
            genericCreateFailureMessage: 'Nieoczekiwany błąd podczas przesyłania tego wydatku. Proszę spróbować ponownie później.',
            genericCreateInvoiceFailureMessage: 'Nieoczekiwany błąd podczas wysyłania tej faktury. Proszę spróbować ponownie później.',
            genericHoldExpenseFailureMessage: 'Nieoczekiwany błąd podczas wstrzymywania tego wydatku. Proszę spróbować ponownie później.',
            genericUnholdExpenseFailureMessage: 'Nieoczekiwany błąd podczas zdejmowania tego wydatku z blokady. Proszę spróbować ponownie później.',
            receiptDeleteFailureError: 'Nieoczekiwany błąd podczas usuwania tego paragonu. Proszę spróbować ponownie później.',
            receiptFailureMessage: 'Wystąpił błąd podczas przesyłania paragonu. Proszę',
            receiptFailureMessageShort: 'Wystąpił błąd podczas przesyłania paragonu.',
            tryAgainMessage: 'spróbuj ponownie',
            saveFileMessage: 'zapisz paragon',
            uploadLaterMessage: 'do przesłania później.',
            genericDeleteFailureMessage: 'Nieoczekiwany błąd podczas usuwania tego wydatku. Proszę spróbować ponownie później.',
            genericEditFailureMessage: 'Nieoczekiwany błąd podczas edytowania tego wydatku. Proszę spróbować ponownie później.',
            genericSmartscanFailureMessage: 'Transakcja ma brakujące pola',
            duplicateWaypointsErrorMessage: 'Proszę usunąć zduplikowane punkty trasy',
            atLeastTwoDifferentWaypoints: 'Proszę wprowadzić co najmniej dwa różne adresy',
            splitExpenseMultipleParticipantsErrorMessage: 'Wydatek nie może być podzielony między przestrzeń roboczą a innych członków. Proszę zaktualizować swój wybór.',
            invalidMerchant: 'Proszę wprowadzić prawidłowego sprzedawcę',
            atLeastOneAttendee: 'Należy wybrać co najmniej jednego uczestnika',
            invalidQuantity: 'Proszę wprowadzić prawidłową ilość',
            quantityGreaterThanZero: 'Ilość musi być większa niż zero',
            invalidSubrateLength: 'Musi być co najmniej jedna podstawka',
            invalidRate: 'Stawka nie jest ważna dla tego miejsca pracy. Proszę wybrać dostępną stawkę z tego miejsca pracy.',
        },
        dismissReceiptError: 'Zignoruj błąd',
        dismissReceiptErrorConfirmation: 'Uwaga! Zignorowanie tego błędu spowoduje całkowite usunięcie przesłanego paragonu. Czy jesteś pewien?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `rozpoczęto rozliczanie. Płatność jest wstrzymana, dopóki ${submitterDisplayName} nie aktywuje swojego portfela.`,
        enableWallet: 'Włącz portfel',
        hold: 'Trzymaj',
        unhold: 'Usuń blokadę',
        holdExpense: 'Wstrzymaj wydatek',
        unholdExpense: 'Odblokuj wydatek',
        heldExpense: 'zatrzymał ten wydatek',
        unheldExpense: 'odblokowano ten wydatek',
        moveUnreportedExpense: 'Przenieś niezgłoszony wydatek',
        addUnreportedExpense: 'Dodaj niezgłoszony wydatek',
        createNewExpense: 'Utwórz nowy wydatek',
        selectUnreportedExpense: 'Wybierz co najmniej jeden wydatek do dodania do raportu.',
        emptyStateUnreportedExpenseTitle: 'Brak niezgłoszonych wydatków',
        emptyStateUnreportedExpenseSubtitle: 'Wygląda na to, że nie masz żadnych niezgłoszonych wydatków. Spróbuj utworzyć jeden poniżej.',
        addUnreportedExpenseConfirm: 'Dodaj do raportu',
        explainHold: 'Wyjaśnij, dlaczego wstrzymujesz ten wydatek.',
        undoSubmit: 'Cofnij wysłanie',
        retracted: 'wycofany',
        undoClose: 'Cofnij zamknięcie',
        reopened: 'ponownie otwarty',
        reopenReport: 'Ponownie otwórz raport',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ten raport został już wyeksportowany do ${connectionName}. Zmiana może prowadzić do rozbieżności danych. Czy na pewno chcesz ponownie otworzyć ten raport?`,
        reason: 'Powód',
        holdReasonRequired: 'Wymagane jest podanie powodu wstrzymania.',
        expenseWasPutOnHold: 'Wydatek został wstrzymany',
        expenseOnHold: 'Ten wydatek został wstrzymany. Proszę zapoznać się z komentarzami, aby poznać kolejne kroki.',
        expensesOnHold: 'Wszystkie wydatki zostały wstrzymane. Proszę zapoznać się z komentarzami, aby poznać kolejne kroki.',
        expenseDuplicate: 'Ten wydatek ma podobne szczegóły do innego. Proszę przejrzeć duplikaty, aby kontynuować.',
        someDuplicatesArePaid: 'Niektóre z tych duplikatów zostały już zatwierdzone lub opłacone.',
        reviewDuplicates: 'Przejrzyj duplikaty',
        keepAll: 'Zachowaj wszystkie',
        confirmApprove: 'Potwierdź kwotę zatwierdzenia',
        confirmApprovalAmount: 'Zatwierdź tylko zgodne wydatki lub zatwierdź cały raport.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zatwierdzić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz je zatwierdzić?',
        }),
        confirmPay: 'Potwierdź kwotę płatności',
        confirmPayAmount: 'Zapłać to, co nie jest wstrzymane, lub zapłać cały raport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zapłacić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz zapłacić?',
        }),
        payOnly: 'Płać tylko',
        approveOnly: 'Zatwierdź tylko',
        holdEducationalTitle: 'To żądanie jest w toku',
        holdEducationalText: 'trzymaj',
        whatIsHoldExplain: 'Wstrzymanie jest jak naciśnięcie „pauzy” na wydatku, aby poprosić o więcej szczegółów przed zatwierdzeniem lub płatnością.',
        holdIsLeftBehind: 'Wstrzymane wydatki są przenoszone do innego raportu po zatwierdzeniu lub opłaceniu.',
        unholdWhenReady: 'Osoby zatwierdzające mogą zdjąć blokadę z wydatków, gdy będą gotowe do zatwierdzenia lub płatności.',
        changePolicyEducational: {
            title: 'Przeniosłeś ten raport!',
            description: 'Sprawdź te elementy, które mają tendencję do zmiany podczas przenoszenia raportów do nowego obszaru roboczego.',
            reCategorize: '<strong>Przeklasyfikuj wszelkie wydatki</strong>, aby były zgodne z zasadami przestrzeni roboczej.',
            workflows: 'Ten raport może teraz podlegać innemu <strong>procesowi zatwierdzania.</strong>',
        },
        changeWorkspace: 'Zmień przestrzeń roboczą',
        set: 'set',
        changed: 'zmieniono',
        removed: 'removed',
        transactionPending: 'Transakcja w toku.',
        chooseARate: 'Wybierz stawkę zwrotu kosztów za milę lub kilometr dla przestrzeni roboczej',
        unapprove: 'Cofnij zatwierdzenie',
        unapproveReport: 'Cofnij zatwierdzenie raportu',
        headsUp: 'Uwaga!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ten raport został już wyeksportowany do ${accountingIntegration}. Zmiana może prowadzić do rozbieżności w danych. Czy na pewno chcesz cofnąć zatwierdzenie tego raportu?`,
        reimbursable: 'podlegający zwrotowi',
        nonReimbursable: 'niepodlegający zwrotowi',
        bookingPending: 'Ta rezerwacja jest w toku',
        bookingPendingDescription: 'Ta rezerwacja jest w toku, ponieważ nie została jeszcze opłacona.',
        bookingArchived: 'Ta rezerwacja jest zarchiwizowana',
        bookingArchivedDescription: 'Ta rezerwacja jest zarchiwizowana, ponieważ data podróży minęła. Dodaj wydatek na ostateczną kwotę, jeśli to konieczne.',
        attendees: 'Uczestnicy',
        whoIsYourAccountant: 'Kim jest Twój księgowy?',
        paymentComplete: 'Płatność zakończona',
        time: 'Czas',
        startDate: 'Data rozpoczęcia',
        endDate: 'Data zakończenia',
        startTime: 'Czas rozpoczęcia',
        endTime: 'Czas zakończenia',
        deleteSubrate: 'Usuń podstawkę',
        deleteSubrateConfirmation: 'Czy na pewno chcesz usunąć tę podstawkę?',
        quantity: 'Ilość',
        subrateSelection: 'Wybierz podstawkę i wprowadź ilość.',
        qty: 'Ilość',
        firstDayText: () => ({
            one: `Pierwszy dzień: 1 godzina`,
            other: (count: number) => `Pierwszy dzień: ${count.toFixed(2)} godzin`,
        }),
        lastDayText: () => ({
            one: `Ostatni dzień: 1 godzina`,
            other: (count: number) => `Ostatni dzień: ${count.toFixed(2)} godzin`,
        }),
        tripLengthText: () => ({
            one: `Podróż: 1 pełny dzień`,
            other: (count: number) => `Podróż: ${count} pełne dni`,
        }),
        dates: 'Daty',
        rates: 'Stawki',
        submitsTo: ({name}: SubmitsToParams) => `Przesyła do ${name}`,
        moveExpenses: () => ({one: 'Przenieś wydatek', other: 'Przenieś wydatki'}),
    },
    share: {
        shareToExpensify: 'Udostępnij do Expensify',
        messageInputLabel: 'Wiadomość',
    },
    notificationPreferencesPage: {
        header: 'Preferencje powiadomień',
        label: 'Powiadom mnie o nowych wiadomościach',
        notificationPreferences: {
            always: 'Natychmiast',
            daily: 'Codziennie',
            mute: 'Wycisz',
            hidden: 'Ukryty',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Numer nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny przez SMS.',
        emailHasNotBeenValidated: 'E-mail nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny za pomocą wiadomości tekstowej.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prześlij zdjęcie',
        removePhoto: 'Usuń zdjęcie',
        editImage: 'Edytuj zdjęcie',
        viewPhoto: 'Zobacz zdjęcie',
        imageUploadFailed: 'Przesyłanie obrazu nie powiodło się',
        deleteWorkspaceError: 'Przepraszamy, wystąpił nieoczekiwany problem podczas usuwania awatara Twojego miejsca pracy.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Wybrany obraz przekracza maksymalny rozmiar przesyłania wynoszący ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Proszę przesłać obraz większy niż ${minHeightInPx}x${minWidthInPx} pikseli i mniejszy niż ${maxHeightInPx}x${maxWidthInPx} pikseli.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Zdjęcie profilowe musi być jednym z następujących typów: ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Tło Modalu',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Preferowane zaimki',
        selectYourPronouns: 'Wybierz swoje zaimki',
        selfSelectYourPronoun: 'Samodzielnie wybierz swój zaimek',
        emailAddress: 'Adres e-mail',
        setMyTimezoneAutomatically: 'Ustaw mój czas automatycznie',
        timezone: 'Strefa czasowa',
        invalidFileMessage: 'Nieprawidłowy plik. Proszę spróbować inny obraz.',
        avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Proszę spróbować ponownie.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronizowanie',
        profileAvatar: 'Avatar profilu',
        publicSection: {
            title: 'Publiczny',
            subtitle: 'Te szczegóły są wyświetlane na Twoim publicznym profilu. Każdy może je zobaczyć.',
        },
        privateSection: {
            title: 'Prywatne',
            subtitle: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane na Twoim publicznym profilu.',
        },
    },
    securityPage: {
        title: 'Opcje zabezpieczeń',
        subtitle: 'Włącz uwierzytelnianie dwuskładnikowe, aby zabezpieczyć swoje konto.',
        goToSecurity: 'Wróć do strony bezpieczeństwa',
    },
    shareCodePage: {
        title: 'Twój kod',
        subtitle: 'Zaproś członków do Expensify, udostępniając swój osobisty kod QR lub link referencyjny.',
    },
    pronounsPage: {
        pronouns: 'Zaimek osobowy',
        isShownOnProfile: 'Twoje zaimki są wyświetlane na Twoim profilu.',
        placeholderText: 'Wyszukaj, aby zobaczyć opcje',
    },
    contacts: {
        contactMethod: 'Metoda kontaktu',
        contactMethods: 'Metody kontaktu',
        featureRequiresValidate: 'Ta funkcja wymaga weryfikacji konta.',
        validateAccount: 'Zweryfikuj swoje konto',
        helpTextBeforeEmail: 'Dodaj więcej sposobów, aby ludzie mogli Cię znaleźć, i przekazuj paragony do',
        helpTextAfterEmail: 'z wielu adresów e-mail.',
        pleaseVerify: 'Proszę zweryfikować tę metodę kontaktu',
        getInTouch: 'Kiedy będziemy musieli się z Tobą skontaktować, użyjemy tej metody kontaktu.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Proszę wprowadzić magiczny kod wysłany na ${contactMethod}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        setAsDefault: 'Ustaw jako domyślne',
        yourDefaultContactMethod: 'To jest Twoja domyślna metoda kontaktu. Zanim będziesz mógł ją usunąć, musisz wybrać inną metodę kontaktu i kliknąć „Ustaw jako domyślną”.',
        removeContactMethod: 'Usuń metodę kontaktu',
        removeAreYouSure: 'Czy na pewno chcesz usunąć tę metodę kontaktu? Tej operacji nie można cofnąć.',
        failedNewContact: 'Nie udało się dodać tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie udało się wysłać nowego magicznego kodu. Proszę poczekać chwilę i spróbować ponownie.',
            validateSecondaryLogin: 'Niepoprawny lub nieważny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            deleteContactMethod: 'Nie udało się usunąć metody kontaktu. Proszę skontaktować się z Concierge w celu uzyskania pomocy.',
            setDefaultContactMethod: 'Nie udało się ustawić nowej domyślnej metody kontaktu. Proszę skontaktować się z Concierge po pomoc.',
            addContactMethod: 'Nie udało się dodać tej metody kontaktu. Proszę skontaktować się z Concierge po pomoc.',
            enteredMethodIsAlreadySubmitted: 'Ta metoda kontaktu już istnieje',
            passwordRequired: 'wymagane hasło.',
            contactMethodRequired: 'Wymagana jest metoda kontaktu',
            invalidContactMethod: 'Nieprawidłowa metoda kontaktu',
        },
        newContactMethod: 'Nowa metoda kontaktu',
        goBackContactMethods: 'Wróć do metod kontaktu',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'On / Jego / Jemu',
        heHimHisTheyThemTheirs: 'On / Jego / Jego / Oni / Ich / Ich',
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
        callMeByMyName: 'Zadzwoń do mnie po imieniu',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nazwa wyświetlana',
        isShownOnProfile: 'Twoja nazwa wyświetlana jest widoczna na Twoim profilu.',
    },
    timezonePage: {
        timezone: 'Strefa czasowa',
        isShownOnProfile: 'Twoja strefa czasowa jest wyświetlana na Twoim profilu.',
        getLocationAutomatically: 'Automatycznie określ swoją lokalizację',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Proszę zaktualizować do najnowszej wersji New Expensify.',
        pleaseInstallExpensifyClassic: 'Proszę zainstalować najnowszą wersję Expensify',
        toGetLatestChanges: 'Na urządzenia mobilne lub stacjonarne pobierz i zainstaluj najnowszą wersję. W przypadku przeglądarki internetowej odśwież swoją przeglądarkę.',
        newAppNotAvailable: 'Aplikacja New Expensify nie jest już dostępna.',
    },
    initialSettingsPage: {
        about: 'O aplikacji',
        aboutPage: {
            description: 'Nowa aplikacja Expensify jest tworzona przez społeczność deweloperów open-source z całego świata. Pomóż nam budować przyszłość Expensify.',
            appDownloadLinks: 'Linki do pobrania aplikacji',
            viewKeyboardShortcuts: 'Wyświetl skróty klawiaturowe',
            viewTheCode: 'Zobacz kod',
            viewOpenJobs: 'Zobacz dostępne oferty pracy',
            reportABug: 'Zgłoś błąd',
            troubleshoot: 'Rozwiązywanie problemów',
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
            clearCacheAndRestart: 'Wyczyść pamięć podręczną i uruchom ponownie',
            viewConsole: 'Wyświetl konsolę debugowania',
            debugConsole: 'Konsola debugowania',
            description: 'Użyj poniższych narzędzi, aby pomóc w rozwiązywaniu problemów z działaniem Expensify. Jeśli napotkasz jakiekolwiek problemy, proszę',
            submitBug: 'zgłoś błąd',
            confirmResetDescription: 'Wszystkie niesłane wiadomości robocze zostaną utracone, ale reszta Twoich danych jest bezpieczna.',
            resetAndRefresh: 'Zresetuj i odśwież',
            clientSideLogging: 'Logowanie po stronie klienta',
            noLogsToShare: 'Brak dzienników do udostępnienia',
            useProfiling: 'Użyj profilowania',
            profileTrace: 'Ślad profilu',
            results: 'Wyniki',
            releaseOptions: 'Opcje wydania',
            testingPreferences: 'Testowanie preferencji',
            useStagingServer: 'Użyj serwera Staging',
            forceOffline: 'Wymuś tryb offline',
            simulatePoorConnection: 'Symuluj słabe połączenie internetowe',
            simulateFailingNetworkRequests: 'Symuluj nieudane żądania sieciowe',
            authenticationStatus: 'Status uwierzytelnienia',
            deviceCredentials: 'Dane uwierzytelniające urządzenia',
            invalidate: 'Unieważnij',
            destroy: 'Zniszczyć',
            maskExportOnyxStateData: 'Maskuj wrażliwe dane członków podczas eksportowania stanu Onyx',
            exportOnyxState: 'Eksportuj stan Onyx',
            importOnyxState: 'Importuj stan Onyx',
            testCrash: 'Test awarii',
            resetToOriginalState: 'Przywróć do stanu początkowego',
            usingImportedState: 'Używasz zaimportowanego stanu. Naciśnij tutaj, aby go wyczyścić.',
            debugMode: 'Tryb debugowania',
            invalidFile: 'Nieprawidłowy plik',
            invalidFileDescription: 'Plik, który próbujesz zaimportować, jest nieprawidłowy. Spróbuj ponownie.',
            invalidateWithDelay: 'Unieważnij z opóźnieniem',
            recordTroubleshootData: 'Rejestrowanie danych rozwiązywania problemów',
        },
        debugConsole: {
            saveLog: 'Zapisz log',
            shareLog: 'Udostępnij dziennik',
            enterCommand: 'Wpisz polecenie',
            execute: 'Wykonaj',
            noLogsAvailable: 'Brak dostępnych logów',
            logSizeTooLarge: ({size}: LogSizeParams) => `Rozmiar dziennika przekracza limit ${size} MB. Proszę użyć "Zapisz dziennik", aby pobrać plik dziennika.`,
            logs: 'Dzienniki',
            viewConsole: 'Wyświetl konsolę',
        },
        security: 'Bezpieczeństwo',
        signOut: 'Wyloguj się',
        restoreStashed: 'Przywróć zapisane logowanie',
        signOutConfirmationText: 'Utracisz wszystkie zmiany offline, jeśli się wylogujesz.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Przeczytaj',
            phrase2: 'Warunki korzystania z usługi',
            phrase3: 'i',
            phrase4: 'Prywatność',
        },
        help: 'Pomoc',
        accountSettings: 'Ustawienia konta',
        account: 'Konto',
        general: 'Ogólne',
    },
    closeAccountPage: {
        closeAccount: 'Zamknij konto',
        reasonForLeavingPrompt: 'Będzie nam przykro, jeśli odejdziesz! Czy mógłbyś nam powiedzieć dlaczego, abyśmy mogli się poprawić?',
        enterMessageHere: 'Wprowadź wiadomość tutaj',
        closeAccountWarning: 'Zamknięcie konta jest nieodwracalne.',
        closeAccountPermanentlyDeleteData: 'Czy na pewno chcesz usunąć swoje konto? Spowoduje to trwałe usunięcie wszystkich zaległych wydatków.',
        enterDefaultContactToConfirm: 'Proszę podać domyślną metodę kontaktu, aby potwierdzić chęć zamknięcia konta. Twoja domyślna metoda kontaktu to:',
        enterDefaultContact: 'Wprowadź domyślną metodę kontaktu',
        defaultContact: 'Domyślna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Proszę podać domyślną metodę kontaktu, aby zamknąć konto.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Połącz konta',
        accountDetails: {
            accountToMergeInto: 'Wprowadź konto, z którym chcesz połączyć',
            notReversibleConsent: 'Rozumiem, że to jest nieodwracalne',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz połączyć konta?',
            lossOfUnsubmittedData: `Scalanie kont jest nieodwracalne i spowoduje utratę wszelkich niezatwierdzonych wydatków dla`,
            enterMagicCode: `Aby kontynuować, wprowadź magiczny kod wysłany na`,
            errors: {
                incorrectMagicCode: 'Niepoprawny lub nieważny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
                fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konta połączone!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Pomyślnie scalono wszystkie dane z`,
                beforeSecondEmail: `do`,
                afterSecondEmail: `. Przechodząc dalej, możesz używać dowolnego logowania dla tego konta.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Pracujemy nad tym',
            limitedSupport: 'Nie obsługujemy jeszcze łączenia kont w New Expensify. Proszę wykonać tę czynność w Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Nie krępuj się, aby',
                linkText: 'skontaktuj się z Concierge',
                afterLink: 'jeśli masz jakieś pytania!',
            },
            goToExpensifyClassic: 'Przejdź do Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Nie możesz połączyć',
            beforeDomain: 'ponieważ jest kontrolowane przez',
            afterDomain: '. Proszę',
            linkText: 'skontaktuj się z Concierge',
            afterLink: 'w celu uzyskania pomocy.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'do innych kont, ponieważ administrator domeny ustawił je jako Twoje główne logowanie. Zamiast tego połącz inne konta z nim.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Nie możesz połączyć kont, ponieważ',
                beforeSecondEmail: 'ma włączone uwierzytelnianie dwuskładnikowe (2FA). Proszę wyłączyć 2FA dla',
                afterSecondEmail: 'i spróbuj ponownie.',
            },
            learnMore: 'Dowiedz się więcej o łączeniu kont.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'ponieważ jest zablokowane. Proszę',
            linkText: 'skontaktuj się z Concierge',
            afterLink: `po pomoc.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Nie możesz połączyć kont, ponieważ',
                afterEmail: 'nie ma konta Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Proszę',
                linkText: 'dodaj to jako metodę kontaktu',
                afterLink: 'zamiast.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'do innych kont. Proszę połączyć inne konta z nim zamiast tego.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'do innych kont, ponieważ jest właścicielem rozliczeń konta fakturowanego. Proszę połączyć inne konta z nim zamiast tego.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Spróbuj ponownie później',
            description: 'Było zbyt wiele prób połączenia kont. Proszę spróbować ponownie później.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie możesz połączyć się z innymi kontami, ponieważ nie jest ono zweryfikowane. Proszę zweryfikować konto i spróbować ponownie.',
        },
        mergeFailureSelfMerge: {
            description: 'Nie można połączyć konta z samym sobą.',
        },
        mergeFailureGenericHeading: 'Nie można połączyć kont',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Zgłoś podejrzaną aktywność',
        lockAccount: 'Zablokuj konto',
        unlockAccount: 'Odblokuj konto',
        compromisedDescription: 'Zauważyłeś coś podejrzanego? Zgłoszenie spowoduje natychmiastowe zablokowanie konta, zatrzymanie transakcji kartą Expensify i uniemożliwienie zmian.',
        domainAdminsDescription: 'Dla administratorów domen: wstrzymuje to również wszystkie działania kart Expensify i działania administracyjne w Twoich domenach.',
        areYouSure: 'Czy na pewno chcesz zablokować swoje konto Expensify?',
        ourTeamWill: 'Nasz zespół zbada sprawę i usunie nieautoryzowany dostęp. Aby odzyskać dostęp, musisz współpracować z Concierge.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Nie udało się zablokować konta',
        failedToLockAccountDescription: `Nie mogliśmy zablokować Twojego konta. Proszę porozmawiać z Concierge, aby rozwiązać ten problem.`,
        chatWithConcierge: 'Czat z Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto zablokowane',
        yourAccountIsLocked: 'Twoje konto jest zablokowane',
        chatToConciergeToUnlock: 'Porozmawiaj z Concierge, aby rozwiązać problemy związane z bezpieczeństwem i odblokować swoje konto.',
        chatWithConcierge: 'Czat z Concierge',
    },
    passwordPage: {
        changePassword: 'Zmień hasło',
        changingYourPasswordPrompt: 'Zmiana hasła spowoduje aktualizację hasła zarówno dla Twojego konta Expensify.com, jak i New Expensify.',
        currentPassword: 'Obecne hasło',
        newPassword: 'Nowe hasło',
        newPasswordPrompt: 'Twoje nowe hasło musi się różnić od starego hasła i zawierać co najmniej 8 znaków, 1 wielką literę, 1 małą literę i 1 cyfrę.',
    },
    twoFactorAuth: {
        headerTitle: 'Uwierzytelnianie dwuskładnikowe',
        twoFactorAuthEnabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        whatIsTwoFactorAuth:
            'Uwierzytelnianie dwuskładnikowe (2FA) pomaga chronić Twoje konto. Podczas logowania będziesz musiał wprowadzić kod wygenerowany przez preferowaną aplikację uwierzytelniającą.',
        disableTwoFactorAuth: 'Wyłącz uwierzytelnianie dwuskładnikowe',
        explainProcessToRemove: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod z aplikacji uwierzytelniającej.',
        disabled: 'Uwierzytelnianie dwuskładnikowe zostało teraz wyłączone',
        noAuthenticatorApp: 'Nie będziesz już potrzebować aplikacji uwierzytelniającej, aby zalogować się do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess:
            'Jeśli stracisz dostęp do aplikacji uwierzytelniającej i nie masz tych kodów, stracisz dostęp do swojego konta.\n\nUwaga: Ustawienie uwierzytelniania dwuskładnikowego spowoduje wylogowanie ze wszystkich innych aktywnych sesji.',
        errorStepCodes: 'Proszę skopiować lub pobrać kody przed kontynuowaniem.',
        stepVerify: 'Zweryfikuj',
        scanCode: 'Zeskanuj kod QR za pomocą swojego',
        authenticatorApp: 'aplikacja uwierzytelniająca',
        addKey: 'Lub dodaj ten klucz tajny do swojej aplikacji uwierzytelniającej:',
        enterCode: 'Następnie wprowadź sześciocyfrowy kod wygenerowany przez aplikację uwierzytelniającą.',
        stepSuccess: 'Zakończono',
        enabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        congrats: 'Gratulacje! Teraz masz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wyłącz',
        enableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe',
        pleaseEnableTwoFactorAuth: 'Proszę włączyć uwierzytelnianie dwuskładnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze względów bezpieczeństwa Xero wymaga uwierzytelniania dwuskładnikowego do połączenia integracji.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagana dwuskładnikowa autoryzacja',
        twoFactorAuthIsRequiredForAdminsTitle: 'Proszę włączyć uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredForAdminsDescription: 'Twoje połączenie z Xero wymaga użycia uwierzytelniania dwuskładnikowego. Aby kontynuować korzystanie z Expensify, proszę je włączyć.',
        twoFactorAuthCannotDisable: 'Nie można wyłączyć 2FA',
        twoFactorAuthRequired: 'Do połączenia z Xero wymagana jest uwierzytelnianie dwuskładnikowe (2FA) i nie można go wyłączyć.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Proszę wprowadzić swój kod odzyskiwania',
            incorrectRecoveryCode: 'Nieprawidłowy kod odzyskiwania. Proszę spróbować ponownie.',
        },
        useRecoveryCode: 'Użyj kodu odzyskiwania',
        recoveryCode: 'Kod odzyskiwania',
        use2fa: 'Użyj kodu uwierzytelniania dwuskładnikowego',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Proszę wprowadzić swój kod uwierzytelniania dwuskładnikowego',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Proszę spróbować ponownie.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Hasło zaktualizowane!',
        allSet: 'Wszystko gotowe. Zachowaj swoje nowe hasło w bezpiecznym miejscu.',
    },
    privateNotes: {
        title: 'Prywatne notatki',
        personalNoteMessage: 'Prowadź notatki dotyczące tej rozmowy tutaj. Jesteś jedyną osobą, która może dodawać, edytować lub przeglądać te notatki.',
        sharedNoteMessage: 'Zapisuj notatki dotyczące tej rozmowy tutaj. Pracownicy Expensify i inni członkowie na domenie team.expensify.com mogą przeglądać te notatki.',
        composerLabel: 'Notatki',
        myNote: 'Moja notatka',
        error: {
            genericFailureMessage: 'Prywatne notatki nie mogły zostać zapisane',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Proszę wprowadzić prawidłowy kod zabezpieczający',
        },
        securityCode: 'Kod bezpieczeństwa',
        changeBillingCurrency: 'Zmień walutę rozliczeniową',
        changePaymentCurrency: 'Zmień walutę płatności',
        paymentCurrency: 'Waluta płatności',
        paymentCurrencyDescription: 'Wybierz standardową walutę, na którą powinny być przeliczane wszystkie wydatki osobiste',
        note: 'Uwaga: Zmiana waluty płatności może wpłynąć na to, ile zapłacisz za Expensify. Odnieś się do naszego',
        noteLink: 'strona cenowa',
        noteDetails: 'aby uzyskać pełne szczegóły.',
    },
    addDebitCardPage: {
        addADebitCard: 'Dodaj kartę debetową',
        nameOnCard: 'Imię na karcie',
        debitCardNumber: 'Numer karty debetowej',
        expiration: 'Data wygaśnięcia',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta debetowa została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Nazwa może zawierać tylko litery',
            addressZipCode: 'Proszę wprowadzić prawidłowy kod pocztowy',
            debitCardNumber: 'Proszę wprowadzić prawidłowy numer karty debetowej',
            expirationDate: 'Proszę wybrać prawidłową datę ważności',
            securityCode: 'Proszę wprowadzić prawidłowy kod zabezpieczający',
            addressStreet: 'Proszę wprowadzić prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Proszę wybrać stan',
            addressCity: 'Proszę wprowadzić miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania karty. Proszę spróbować ponownie.',
            password: 'Proszę wprowadzić swoje hasło do Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Dodaj kartę płatniczą',
        nameOnCard: 'Imię na karcie',
        paymentCardNumber: 'Numer karty',
        expiration: 'Data wygaśnięcia',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta płatnicza została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Nazwa może zawierać tylko litery',
            addressZipCode: 'Proszę wprowadzić prawidłowy kod pocztowy',
            paymentCardNumber: 'Proszę wprowadzić prawidłowy numer karty',
            expirationDate: 'Proszę wybrać prawidłową datę ważności',
            securityCode: 'Proszę wprowadzić prawidłowy kod zabezpieczający',
            addressStreet: 'Proszę wprowadzić prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Proszę wybrać stan',
            addressCity: 'Proszę wprowadzić miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania karty. Proszę spróbować ponownie.',
            password: 'Proszę wprowadzić swoje hasło do Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metody płatności',
        setDefaultConfirmation: 'Ustaw domyślną metodę płatności',
        setDefaultSuccess: 'Domyślna metoda płatności ustawiona!',
        deleteAccount: 'Usuń konto',
        deleteConfirmation: 'Czy na pewno chcesz usunąć to konto?',
        error: {
            notOwnerOfBankAccount: 'Wystąpił błąd podczas ustawiania tego konta bankowego jako domyślnej metody płatności.',
            invalidBankAccount: 'To konto bankowe jest tymczasowo zawieszone.',
            notOwnerOfFund: 'Wystąpił błąd podczas ustawiania tej karty jako domyślnej metody płatności.',
            setDefaultFailure: 'Coś poszło nie tak. Proszę skontaktować się z Concierge w celu uzyskania dalszej pomocy.',
        },
        addBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby dodania Twojego konta bankowego. Proszę spróbować ponownie.',
        getPaidFaster: 'Otrzymuj płatności szybciej',
        addPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        getPaidBackFaster: 'Otrzymuj zwroty szybciej',
        secureAccessToYourMoney: 'Zabezpiecz dostęp do swoich pieniędzy',
        receiveMoney: 'Otrzymuj pieniądze w swojej lokalnej walucie',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Wysyłaj i odbieraj pieniądze z przyjaciółmi. Tylko konta bankowe w USA.',
        enableWallet: 'Włącz portfel',
        addBankAccountToSendAndReceive: 'Otrzymaj zwrot kosztów za wydatki, które zgłaszasz do przestrzeni roboczej.',
        addBankAccount: 'Dodaj konto bankowe',
        addDebitOrCreditCard: 'Dodaj kartę debetową lub kredytową',
        assignedCards: 'Przypisane karty',
        assignedCardsDescription: 'Są to karty przypisane przez administratora przestrzeni roboczej do zarządzania wydatkami firmy.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Przeglądamy Twoje informacje. Proszę sprawdź ponownie za kilka minut!',
        walletActivationFailed: 'Niestety, Twojego portfela nie można włączyć w tej chwili. Proszę skontaktować się z Concierge, aby uzyskać dalszą pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody: 'Połącz swoje konto bankowe z Expensify, aby wysyłanie i odbieranie płatności bezpośrednio w aplikacji było łatwiejsze niż kiedykolwiek.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij się, że wybierasz właściwy.',
        confirmYourBankAccount: 'Potwierdź swoje konto bankowe',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Karta Podróżna Expensify',
        availableSpend: 'Pozostały limit',
        smartLimit: {
            name: 'Inteligentny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydać do ${formattedLimit} na tej karcie, a limit zostanie zresetowany, gdy Twoje zgłoszone wydatki zostaną zatwierdzone.`,
        },
        fixedLimit: {
            name: 'Stały limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Możesz wydać do ${formattedLimit} na tej karcie, a następnie zostanie ona dezaktywowana.`,
        },
        monthlyLimit: {
            name: 'Miesięczny limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Możesz wydać do ${formattedLimit} na tej karcie miesięcznie. Limit zostanie zresetowany pierwszego dnia każdego miesiąca kalendarzowego.`,
        },
        virtualCardNumber: 'Numer karty wirtualnej',
        travelCardCvv: 'CVV karty podróżnej',
        physicalCardNumber: 'Numer karty fizycznej',
        getPhysicalCard: 'Uzyskaj fizyczną kartę',
        reportFraud: 'Zgłoś oszustwo związane z kartą wirtualną',
        reportTravelFraud: 'Zgłoś oszustwo związane z kartą podróżną',
        reviewTransaction: 'Przejrzyj transakcję',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Zauważyliśmy podejrzane transakcje na Twojej karcie. Dotknij poniżej, aby przejrzeć.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zespół przegląda konto Twojej firmy.',
        cardDetails: {
            cardNumber: 'Numer karty wirtualnej',
            expiration: 'Wygaśnięcie',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Pokaż szczegóły',
            revealCvv: 'Pokaż CVV',
            copyCardNumber: 'Skopiuj numer karty',
            updateAddress: 'Zaktualizuj adres',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Dodano do portfela ${platform}`,
        cardDetailsLoadingFailure: 'Wystąpił błąd podczas ładowania szczegółów karty. Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
        validateCardTitle: 'Upewnijmy się, że to Ty',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Proszę wprowadzić magiczny kod wysłany na ${contactMethod}, aby zobaczyć szczegóły swojej karty. Powinien dotrzeć w ciągu minuty lub dwóch.`,
    },
    workflowsPage: {
        workflowTitle: 'Wydatki',
        workflowDescription: 'Skonfiguruj przepływ pracy od momentu wystąpienia wydatku, w tym zatwierdzenie i płatność.',
        delaySubmissionTitle: 'Opóźnij zgłoszenia',
        delaySubmissionDescription:
            'Wybierz niestandardowy harmonogram przesyłania wydatków lub pozostaw to wyłączone, aby otrzymywać aktualizacje w czasie rzeczywistym dotyczące wydatków.',
        submissionFrequency: 'Częstotliwość składania wniosków',
        submissionFrequencyDateOfMonth: 'Data miesiąca',
        addApprovalsTitle: 'Dodaj zatwierdzenia',
        addApprovalButton: 'Dodaj przepływ pracy zatwierdzania',
        addApprovalTip: 'Ten domyślny przepływ pracy dotyczy wszystkich członków, chyba że istnieje bardziej szczegółowy przepływ pracy.',
        approver: 'Aprobujący',
        connectBankAccount: 'Połącz konto bankowe',
        addApprovalsDescription: 'Wymagaj dodatkowej zgody przed autoryzacją płatności.',
        makeOrTrackPaymentsTitle: 'Dokonuj lub śledź płatności',
        makeOrTrackPaymentsDescription: 'Dodaj upoważnionego płatnika do płatności dokonywanych w Expensify lub śledź płatności dokonane gdzie indziej.',
        editor: {
            submissionFrequency: 'Wybierz, jak długo Expensify powinno czekać przed udostępnieniem wydatków bez błędów.',
        },
        frequencyDescription: 'Wybierz, jak często chcesz, aby wydatki były przesyłane automatycznie, lub ustaw je na ręczne przesyłanie.',
        frequencies: {
            instant: 'Natychmiastowy',
            weekly: 'Cotygodniowo',
            monthly: 'Miesięczny',
            twiceAMonth: 'Dwa razy w miesiącu',
            byTrip: 'Według podróży',
            manually: 'Ręcznie',
            daily: 'Codziennie',
            lastDayOfMonth: 'Ostatni dzień miesiąca',
            lastBusinessDayOfMonth: 'Ostatni dzień roboczy miesiąca',
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
                '5': 'Piąty',
                '6': 'Szósty',
                '7': 'Siódmy',
                '8': 'Ósmy',
                '9': 'Dziewiąty',
                '10': 'Dziesiąty',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Ten członek już należy do innego procesu zatwierdzania. Wszelkie zmiany tutaj będą miały odzwierciedlenie również tam.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> już zatwierdza raporty do <strong>${name2}</strong>. Proszę wybrać innego zatwierdzającego, aby uniknąć cyklicznego przepływu pracy.`,
        emptyContent: {
            title: 'Brak członków do wyświetlenia',
            expensesFromSubtitle: 'Wszyscy członkowie przestrzeni roboczej już należą do istniejącego procesu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzający należą do istniejącego przepływu pracy.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'Opóźnione zgłoszenie nie mogło zostać zmienione. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        autoReportingFrequencyErrorMessage: 'Nie można było zmienić częstotliwości przesyłania. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        monthlyOffsetErrorMessage: 'Nie można było zmienić miesięcznej częstotliwości. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Potwierdź',
        header: 'Dodaj więcej zatwierdzających i potwierdź.',
        additionalApprover: 'Dodatkowy zatwierdzający',
        submitButton: 'Dodaj przepływ pracy',
    },
    workflowsEditApprovalsPage: {
        title: 'Edytuj przepływ pracy zatwierdzania',
        deleteTitle: 'Usuń przepływ pracy zatwierdzania',
        deletePrompt: 'Czy na pewno chcesz usunąć ten proces zatwierdzania? Wszyscy członkowie będą następnie postępować zgodnie z domyślnym procesem.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki od',
        header: 'Gdy następujący członkowie złożą wydatki:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Nie można było zmienić zatwierdzającego. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        header: 'Wyślij do tego członka do zatwierdzenia:',
    },
    workflowsPayerPage: {
        title: 'Upoważniony płatnik',
        genericErrorMessage: 'Nie udało się zmienić upoważnionego płatnika. Proszę spróbować ponownie.',
        admins: 'Administratorzy',
        payer: 'Płatnik',
        paymentAccount: 'Konto płatnicze',
    },
    reportFraudPage: {
        title: 'Zgłoś oszustwo związane z kartą wirtualną',
        description: 'Jeśli dane Twojej wirtualnej karty zostały skradzione lub naruszone, trwale dezaktywujemy Twoją obecną kartę i dostarczymy Ci nową wirtualną kartę oraz numer.',
        deactivateCard: 'Dezaktywuj kartę',
        reportVirtualCardFraud: 'Zgłoś oszustwo związane z kartą wirtualną',
    },
    reportFraudConfirmationPage: {
        title: 'Zgłoszono oszustwo związane z kartą',
        description: 'Trwale dezaktywowaliśmy Twoją istniejącą kartę. Gdy wrócisz, aby zobaczyć szczegóły swojej karty, będziesz mieć nową wirtualną kartę dostępną.',
        buttonText: 'Zrozumiałem, dzięki!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kartę',
        pleaseEnterLastFour: 'Proszę podać ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj fizyczną kartę',
        error: {
            thatDidNotMatch: 'To nie pasuje do ostatnich 4 cyfr na twojej karcie. Spróbuj ponownie.',
            throttled:
                'Wprowadziłeś niepoprawnie ostatnie 4 cyfry swojej karty Expensify zbyt wiele razy. Jeśli jesteś pewien, że liczby są poprawne, skontaktuj się z Concierge, aby rozwiązać problem. W przeciwnym razie spróbuj ponownie później.',
        },
    },
    getPhysicalCard: {
        header: 'Uzyskaj fizyczną kartę',
        nameMessage: 'Wprowadź swoje imię i nazwisko, ponieważ będzie ono widoczne na Twojej karcie.',
        legalName: 'Imię i nazwisko prawne',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        phoneMessage: 'Wprowadź swój numer telefonu.',
        phoneNumber: 'Numer telefonu',
        address: 'Adres',
        addressMessage: 'Wprowadź swój adres wysyłki.',
        streetAddress: 'Adres ulicy',
        city: 'Miasto',
        state: 'Stan',
        zipPostcode: 'Kod pocztowy',
        country: 'Kraj',
        confirmMessage: 'Proszę potwierdzić swoje dane poniżej.',
        estimatedDeliveryMessage: 'Twoja fizyczna karta dotrze w ciągu 2-3 dni roboczych.',
        next: 'Następny',
        getPhysicalCard: 'Uzyskaj fizyczną kartę',
        shipCard: 'Wyślij kartę',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Natychmiastowy (karta debetowa)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% opłata (minimum ${minAmount})`,
        ach: '1-3 dni robocze (konto bankowe)',
        achSummary: 'Bez opłaty',
        whichAccount: 'Które konto?',
        fee: 'Opłata',
        transferSuccess: 'Transfer zakończony pomyślnie!',
        transferDetailBankAccount: 'Twoje pieniądze powinny dotrzeć w ciągu 1-3 dni roboczych.',
        transferDetailDebitCard: 'Twoje pieniądze powinny dotrzeć natychmiast.',
        failedTransfer: 'Twoje saldo nie jest w pełni uregulowane. Proszę przelać na konto bankowe.',
        notHereSubTitle: 'Proszę przelać saldo ze strony portfela',
        goToWallet: 'Przejdź do Portfela',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Wybierz konto',
    },
    paymentMethodList: {
        addPaymentMethod: 'Dodaj metodę płatności',
        addNewDebitCard: 'Dodaj nową kartę debetową',
        addNewBankAccount: 'Dodaj nowe konto bankowe',
        accountLastFour: 'Kończący się na',
        cardLastFour: 'Karta kończąca się na',
        addFirstPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        defaultPaymentMethod: 'Domyślny',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Konto bankowe • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'Preferencje aplikacji',
        },
        testSection: {
            title: 'Testuj preferencje',
            subtitle: 'Ustawienia pomagające w debugowaniu i testowaniu aplikacji na etapie staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Otrzymuj istotne aktualizacje funkcji i wiadomości od Expensify',
        muteAllSounds: 'Wycisz wszystkie dźwięki z Expensify',
    },
    priorityModePage: {
        priorityMode: 'Tryb priorytetowy',
        explainerText: 'Wybierz, czy #skupić się tylko na nieprzeczytanych i przypiętych czatach, czy pokazać wszystko z najnowszymi i przypiętymi czatami na górze.',
        priorityModes: {
            default: {
                label: 'Najnowsze',
                description: 'Pokaż wszystkie czaty posortowane według najnowszych',
            },
            gsd: {
                label: '#skupienie',
                description: 'Pokaż tylko nieprzeczytane, posortowane alfabetycznie',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `w ${policyName}`,
        generatingPDF: 'Generowanie PDF',
        waitForPDF: 'Proszę czekać, generujemy PDF',
        errorPDF: 'Wystąpił błąd podczas próby wygenerowania Twojego PDF-a.',
        generatedPDF: 'Twój raport PDF został wygenerowany!',
    },
    reportDescriptionPage: {
        roomDescription: 'Opis pokoju',
        roomDescriptionOptional: 'Opis pokoju (opcjonalnie)',
        explainerText: 'Ustaw niestandardowy opis dla pokoju.',
    },
    groupChat: {
        lastMemberTitle: 'Uwaga!',
        lastMemberWarning: 'Ponieważ jesteś ostatnią osobą tutaj, opuszczenie spowoduje, że ten czat będzie niedostępny dla wszystkich członków. Czy na pewno chcesz opuścić?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Czat grupowy ${displayName}`,
    },
    languagePage: {
        language: 'Język',
        aiGenerated: 'Tłumaczenia dla tego języka są generowane automatycznie i mogą zawierać błędy.',
    },
    themePage: {
        theme: 'Motyw',
        themes: {
            dark: {
                label: 'Ciemny',
            },
            light: {
                label: 'Światło',
            },
            system: {
                label: 'Użyj ustawień urządzenia',
            },
        },
        chooseThemeBelowOrSync: 'Wybierz motyw poniżej lub zsynchronizuj z ustawieniami urządzenia.',
    },
    termsOfUse: {
        phrase1: 'Logując się, zgadzasz się na',
        phrase2: 'Warunki korzystania z usługi',
        phrase3: 'i',
        phrase4: 'Prywatność',
        phrase5: `Przekazy pieniężne są świadczone przez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) zgodnie z jego`,
        phrase6: 'licencje',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzymałeś magicznego kodu?',
        enterAuthenticatorCode: 'Proszę wprowadzić kod uwierzytelniający',
        enterRecoveryCode: 'Proszę wprowadzić swój kod odzyskiwania',
        requiredWhen2FAEnabled: 'Wymagane, gdy 2FA jest włączone',
        requestNewCode: 'Poproś o nowy kod w',
        requestNewCodeAfterErrorOccurred: 'Poproś o nowy kod',
        error: {
            pleaseFillMagicCode: 'Proszę wprowadzić swój magiczny kod',
            incorrectMagicCode: 'Niepoprawny lub nieważny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            pleaseFillTwoFactorAuth: 'Proszę wprowadzić swój kod uwierzytelniania dwuskładnikowego',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Proszę wypełnić wszystkie pola',
        pleaseFillPassword: 'Proszę wprowadzić swoje hasło',
        pleaseFillTwoFactorAuth: 'Proszę wprowadzić swój kod dwuskładnikowy',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego, aby kontynuować',
        forgot: 'Zapomniałeś?',
        requiredWhen2FAEnabled: 'Wymagane, gdy 2FA jest włączone',
        error: {
            incorrectPassword: 'Nieprawidłowe hasło. Spróbuj ponownie.',
            incorrectLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie.',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Proszę spróbować ponownie.',
            twoFactorAuthenticationEnabled: 'Masz włączone uwierzytelnianie dwuskładnikowe (2FA) na tym koncie. Zaloguj się, używając swojego adresu e-mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie lub zresetuj hasło.',
            unableToResetPassword:
                'Nie udało nam się zmienić Twojego hasła. Prawdopodobnie jest to spowodowane wygasłym linkiem do resetowania hasła w starym e-mailu do resetowania hasła. Wysłaliśmy Ci nowy link, abyś mógł spróbować ponownie. Sprawdź swoją skrzynkę odbiorczą i folder ze spamem; powinien dotrzeć w ciągu kilku minut.',
            noAccess: 'Nie masz dostępu do tej aplikacji. Proszę dodać swoją nazwę użytkownika GitHub, aby uzyskać dostęp.',
            accountLocked: 'Twoje konto zostało zablokowane po zbyt wielu nieudanych próbach. Spróbuj ponownie za 1 godzinę.',
            fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon lub e-mail',
        error: {
            invalidFormatEmailLogin: 'Wprowadzony adres e-mail jest nieprawidłowy. Proszę poprawić format i spróbować ponownie.',
        },
        cannotGetAccountDetails: 'Nie można pobrać szczegółów konta. Spróbuj zalogować się ponownie.',
        loginForm: 'Formularz logowania',
        notYou: ({user}: NotYouParams) => `Nie ${user}?`,
    },
    onboarding: {
        welcome: 'Witamy!',
        welcomeSignOffTitleManageTeam: 'Gdy ukończysz powyższe zadania, możemy odkrywać więcej funkcji, takich jak przepływy pracy zatwierdzania i reguły!',
        welcomeSignOffTitle: 'Miło cię poznać!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do zarządzania wydatkami biznesowymi i osobistymi z prędkością czatu. Wypróbuj ją i daj nam znać, co o tym myślisz. Jeszcze wiele przed nami!',
            secondaryDescription: 'Aby przełączyć się z powrotem na Expensify Classic, wystarczy stuknąć swoje zdjęcie profilowe > Przejdź do Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do zarządzania wszystkimi wydatkami biznesowymi i osobistymi w czacie. Stworzona dla Twojego biznesu, Twojego zespołu i Twoich przyjaciół.',
        },
        getStarted: 'Zacznij teraz',
        whatsYourName: 'Jak masz na imię?',
        peopleYouMayKnow: 'Osoby, które możesz znać, już tu są! Zweryfikuj swój email, aby do nich dołączyć.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Ktoś z ${domain} już utworzył przestrzeń roboczą. Proszę wprowadzić magiczny kod wysłany na ${email}.`,
        joinAWorkspace: 'Dołącz do przestrzeni roboczej',
        listOfWorkspaces: 'Oto lista przestrzeni roboczych, do których możesz dołączyć. Nie martw się, zawsze możesz dołączyć do nich później, jeśli wolisz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} członek${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcję, aby kontynuować',
        purpose: {
            title: 'Co chcesz dzisiaj zrobić?',
            errorContinue: 'Proszę nacisnąć „kontynuuj”, aby rozpocząć konfigurację.',
            errorBackButton: 'Proszę dokończyć pytania dotyczące konfiguracji, aby rozpocząć korzystanie z aplikacji.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Otrzymaj zwrot od mojego pracodawcy',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Zarządzaj wydatkami mojego zespołu',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Śledź i planuj wydatki',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Czat i dzielenie wydatków z przyjaciółmi',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Coś innego',
        },
        employees: {
            title: 'Ilu masz pracowników?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1 000 pracowników',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Ponad 1 000 pracowników',
        },
        accounting: {
            title: 'Czy używasz jakiegoś oprogramowania księgowego?',
            none: 'None',
        },
        error: {
            requiredFirstName: 'Proszę podać swoje imię, aby kontynuować',
        },
        workEmail: {
            title: 'Jaki jest Twój służbowy adres e-mail?',
            subtitle: 'Expensify działa najlepiej, gdy połączysz swój służbowy e-mail.',
            explanationModal: {
                descriptionOne: 'Prześlij dalej na receipts@expensify.com do zeskanowania',
                descriptionTwo: 'Dołącz do swoich kolegów, którzy już korzystają z Expensify',
                descriptionThree: 'Ciesz się bardziej spersonalizowanym doświadczeniem',
            },
            addWorkEmail: 'Dodaj służbowy e-mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj swój służbowy adres e-mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Proszę wprowadzić magiczny kod wysłany na ${workEmail}. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        },
        workEmailValidationError: {
            publicEmail: 'Proszę podać prawidłowy adres e-mail z domeny prywatnej, np. mitch@company.com',
            offline: 'Nie mogliśmy dodać Twojego służbowego adresu e-mail, ponieważ wydajesz się być offline.',
        },
        mergeBlockScreen: {
            title: 'Nie można dodać służbowego adresu e-mail',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nie mogliśmy dodać ${workEmail}. Spróbuj ponownie później w Ustawieniach lub skontaktuj się z Concierge, aby uzyskać pomoc.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Neem een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `[Doe een snelle producttour](${testDriveURL}) om te zien waarom Expensify de snelste manier is om uw uitgaven te doen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Neem een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `Neem ons mee voor een [proefrit](${testDriveURL}) en uw team krijgt *3 maanden Expensify gratis!*`,
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Maak](${workspaceConfirmationLink}) een werkruimte`,
                description: 'Maak een werkruimte en configureer de instellingen met de hulp van uw setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Maak een [werkruimte](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    '*Maak een werkruimte* om uitgaven te volgen, bonnen te scannen, te chatten en meer.\n' +
                    '\n' +
                    '1. Klik op *Werkruimtes* > *Nieuwe werkruimte*.\n' +
                    '\n' +
                    `*Uw nieuwe werkruimte is klaar!* [Bekijk hem](${workspaceSettingsLink}).`,
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Stel [categorieën](${workspaceCategoriesLink}) in`,
                description: ({workspaceCategoriesLink}) =>
                    '*Stel categorieën in* zodat uw team uitgaven kan coderen voor eenvoudige rapportage.\n' +
                    '\n' +
                    '1. Klik op *Werkruimtes*.\n' +
                    '3. Selecteer uw werkruimte.\n' +
                    '4. Klik op *Categorieën*.\n' +
                    '5. Schakel alle categorieën uit die u niet nodig heeft.\n' +
                    '6. Voeg uw eigen categorieën toe rechtsboven.\n' +
                    '\n' +
                    `[Breng me naar de categorie-instellingen van de werkruimte](${workspaceCategoriesLink}).\n` +
                    '\n' +
                    `![Stel categorieën in](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`,
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Dien een uitgave in',
                description:
                    '*Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Uitgave aanmaken*.\n' +
                    '3. Voer een bedrag in of scan een bon.\n' +
                    `4. Voeg het e-mailadres of telefoonnummer van uw baas toe.\n` +
                    '5. Klik op *Aanmaken*.\n' +
                    '\n' +
                    'En u bent klaar!',
            },
            adminSubmitExpenseTask: {
                title: 'Dien een uitgave in',
                description:
                    '*Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Uitgave aanmaken*.\n' +
                    '3. Voer een bedrag in of scan een bon.\n' +
                    '4. Bevestig de details.\n' +
                    '5. Klik op *Aanmaken*.\n' +
                    '\n' +
                    `En u bent klaar!`,
            },
            trackExpenseTask: {
                title: 'Volg een uitgave',
                description:
                    '*Volg een uitgave* in elke valuta, of u nu een bon heeft of niet.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Uitgave aanmaken*.\n' +
                    '3. Voer een bedrag in of scan een bon.\n' +
                    '4. Kies uw *persoonlijke* ruimte.\n' +
                    '5. Klik op *Aanmaken*.\n' +
                    '\n' +
                    'En u bent klaar! Jazeker, zo makkelijk is het.',
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Połącz${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' z'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'swoim' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    `Połącz${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? ' swój' : ' z'} ${integrationName}, aby automatycznie kategoryzować wydatki i synchronizować dane, co ułatwi zamknięcie miesiąca.\n` +
                    '\n' +
                    '1. Kliknij *Ustawienia*.\n' +
                    '2. Przejdź do *Przestrzenie robocze*.\n' +
                    '3. Wybierz swoją przestrzeń roboczą.\n' +
                    '4. Kliknij *Księgowość*.\n' +
                    `5. Znajdź ${integrationName}.\n` +
                    '6. Kliknij *Połącz*.\n' +
                    '\n' +
                    `${
                        integrationName && CONST.connectionsVideoPaths[integrationName]
                            ? `[Przejdź do księgowości](${workspaceAccountingLink}).\n\n![Połącz z ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
                            : `[Przejdź do księgowości](${workspaceAccountingLink}).`
                    }`,
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Verbind [uw bedrijfskaart](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    `Verbind uw bedrijfskaart om uitgaven automatisch te importeren en te coderen.\n` +
                    '\n' +
                    '1. Klik op *Werkruimtes*.\n' +
                    '2. Selecteer uw werkruimte.\n' +
                    '3. Klik op *Bedrijfskaarten*.\n' +
                    '4. Volg de aanwijzingen om uw kaart te verbinden.\n' +
                    '\n' +
                    `[Breng me naar het verbinden van mijn bedrijfskaarten](${corporateCardLink}).`,
            },

            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Nodig [uw team](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    '*Nodig uw team* uit voor Expensify zodat ze vandaag nog kunnen beginnen met het bijhouden van uitgaven.\n' +
                    '\n' +
                    '1. Klik op *Werkruimtes*.\n' +
                    '3. Selecteer uw werkruimte.\n' +
                    '4. Klik op *Leden* > *Lid uitnodigen*.\n' +
                    '5. Voer e-mailadressen of telefoonnummers in. \n' +
                    '6. Voeg een aangepast uitnodigingsbericht toe als u dat wilt!\n' +
                    '\n' +
                    `[Breng me naar werkruimtemedewerkers](${workspaceMembersLink}).\n` +
                    '\n' +
                    `![Nodig uw team uit](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`,
            },

            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceMoreFeaturesLink}) => `Stel [categorieën](${workspaceCategoriesLink}) en [tags](${workspaceMoreFeaturesLink}) in`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    '*Stel categorieën en tags in* zodat uw team uitgaven kan coderen voor eenvoudige rapportage.\n' +
                    '\n' +
                    `Importeer ze automatisch door [uw boekhoudsoftware te verbinden](${workspaceAccountingLink}), of stel ze handmatig in via uw [werkruimte-instellingen](${workspaceCategoriesLink}).`,
            },
            setupTagsTask: {
                title: ({workspaceMoreFeaturesLink}) => `Stel [tags](${workspaceMoreFeaturesLink}) in`,
                description: ({workspaceMoreFeaturesLink}) =>
                    'Gebruik tags om extra uitgavendetails toe te voegen zoals projecten, klanten, locaties en afdelingen. Als u meerdere niveaus van tags nodig heeft, kunt u upgraden naar het Control-abonnement.\n' +
                    '\n' +
                    '1. Klik op *Werkruimtes*.\n' +
                    '3. Selecteer uw werkruimte.\n' +
                    '4. Klik op *Meer functies*.\n' +
                    '5. Schakel *Tags* in.\n' +
                    '6. Navigeer naar *Tags* in de werkruimteditor.\n' +
                    '7. Klik op *+ Tag toevoegen* om uw eigen tags te maken.\n' +
                    '\n' +
                    `[Breng me naar meer functies](${workspaceMoreFeaturesLink}).\n` +
                    '\n' +
                    `![Stel tags in](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`,
            },

            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Zaproś swojego [księgowego](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    '*Zaproś swojego księgowego*, aby współpracował w Twojej przestrzeni roboczej i zarządzał wydatkami firmowymi.\n' +
                    '\n' +
                    '1. Kliknij *Przestrzenie robocze*.\n' +
                    '2. Wybierz swoją przestrzeń roboczą.\n' +
                    '3. Kliknij *Członkowie*.\n' +
                    '4. Kliknij *Zaproś członka*.\n' +
                    '5. Wpisz adres e-mail swojego księgowego.\n' +
                    '\n' +
                    `[Zaproś swojego księgowego teraz](${workspaceMembersLink}).`,
            },

            startChatTask: {
                title: 'Start een chat',
                description:
                    '*Start een chat* met iedereen met behulp van hun e-mailadres of telefoonnummer.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Start chat*.\n' +
                    '3. Voer een e-mailadres of telefoonnummer in.\n' +
                    '\n' +
                    'Als ze Expensify nog niet gebruiken, worden ze automatisch uitgenodigd.\n' +
                    '\n' +
                    'Elke chat wordt ook omgezet in een e-mail of sms waar ze direct op kunnen reageren.',
            },

            splitExpenseTask: {
                title: 'Splits een uitgave',
                description:
                    '*Splits uitgaven* met één of meer personen.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Start chat*.\n' +
                    '3. Voer e-mailadressen of telefoonnummers in.\n' +
                    '4. Klik op de grijze *+*-knop in de chat > *Splits uitgave*.\n' +
                    '5. Maak de uitgave aan door *Handmatig*, *Scannen* of *Afstand* te selecteren.\n' +
                    '\n' +
                    'Voeg gerust meer details toe als u wilt, of stuur het gewoon op. Laten we ervoor zorgen dat u wordt terugbetaald!',
            },

            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Bekijk uw [werkruimte-instellingen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    'Zo bekijkt en werkt u uw werkruimte-instellingen bij:\n' +
                    '1. Klik op het instellingentabblad.\n' +
                    '2. Klik op *Werkruimtes* > [Uw werkruimte].\n' +
                    `[Ga naar uw werkruimte](${workspaceSettingsLink}). We volgen ze in de #admins-kamer.`,
            },
            createReportTask: {
                title: 'Maak uw eerste rapport',
                description:
                    'Zo maakt u een rapport:\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Rapport aanmaken*.\n' +
                    '3. Klik op *Uitgave toevoegen*.\n' +
                    '4. Voeg uw eerste uitgave toe.\n' +
                    '\n' +
                    'En u bent klaar!',
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Neem een [proefrit](${testDriveURL})` : 'Neem een proefrit'),
            embeddedDemoIframeTitle: 'Proefrit',
            employeeFakeReceipt: {
                description: 'Mijn proefrit bon!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Terugbetaald krijgen is net zo eenvoudig als een bericht sturen. Laten we de basis doornemen.',
            onboardingPersonalSpendMessage: 'Zo volgt u uw uitgaven in een paar klikken.',
            onboardingMangeTeamMessage: ({onboardingCompanySize}: {onboardingCompanySize?: OnboardingCompanySize}) =>
                `Hier is een takenlijst die ik zou aanraden voor een bedrijf van uw grootte met ${onboardingCompanySize} inzenders:`,
            onboardingTrackWorkspaceMessage:
                '# Laten we u instellen\n👋 Ik ben hier om te helpen! Om u op weg te helpen, heb ik uw werkruimte-instellingen afgestemd op eenmanszaken en soortgelijke bedrijven. U kunt uw werkruimte aanpassen door op de onderstaande link te klikken!\n\nZo volgt u uw uitgaven in een paar klikken:',
            onboardingChatSplitMessage: 'Rekeningen splitsen met vrienden is net zo eenvoudig als een bericht sturen. Zo doet u dat.',
            onboardingAdminMessage: 'Leer hoe u de werkruimte van uw team als beheerder beheert en uw eigen uitgaven indient.',
            onboardingLookingAroundMessage:
                'Expensify staat vooral bekend om uitgaven, reizen en beheer van bedrijfskaarten, maar we doen veel meer dan dat. Laat me weten waarin u geïnteresseerd bent en ik help u op weg.',
            onboardingTestDriveReceiverMessage: '*U heeft 3 maanden gratis! Begin hieronder.*',
        },
        workspace: {
            title: 'Pozostań zorganizowany dzięki przestrzeni roboczej',
            subtitle: 'Odblokuj potężne narzędzia, aby uprościć zarządzanie wydatkami, wszystko w jednym miejscu. Dzięki przestrzeni roboczej możesz:',
            explanationModal: {
                descriptionOne: 'Śledź i organizuj paragony',
                descriptionTwo: 'Kategoryzuj i taguj wydatki',
                descriptionThree: 'Twórz i udostępniaj raporty',
            },
            price: 'Wypróbuj za darmo przez 30 dni, a następnie przejdź na wyższy plan za jedyne <strong>5 USD/miesiąc</strong>.',
            createWorkspace: 'Utwórz przestrzeń roboczą',
        },
        confirmWorkspace: {
            title: 'Potwierdź przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą do śledzenia paragonów, zwracania wydatków, zarządzania podróżami, tworzenia raportów i nie tylko — wszystko w tempie czatu.',
        },
        inviteMembers: {
            title: 'Zaproś członków',
            subtitle: 'Zarządzaj i udostępniaj swoje wydatki księgowemu lub rozpocznij grupę podróżniczą z przyjaciółmi.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nie pokazuj mi tego ponownie',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Nazwa nie może zawierać słów Expensify ani Concierge',
            hasInvalidCharacter: 'Nazwa nie może zawierać przecinka ani średnika',
            requiredFirstName: 'Imię nie może być puste',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Jakie jest Twoje imię i nazwisko?',
        enterDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterAddress: 'Jaki jest Twój adres?',
        enterPhoneNumber: 'Jaki jest Twój numer telefonu?',
        personalDetails: 'Dane osobowe',
        privateDataMessage: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane na Twoim publicznym profilu.',
        legalName: 'Imię i nazwisko prawne',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        address: 'Adres',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Data powinna być przed ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Data powinna być po ${dateString}`,
            hasInvalidCharacter: 'Nazwa może zawierać tylko znaki łacińskie',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Nieprawidłowy format kodu pocztowego${zipFormat ? `Dopuszczalny format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Proszę upewnić się, że numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link został ponownie wysłany',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Wysłałem magiczny link do logowania na ${login}. Sprawdź swój ${loginType}, aby się zalogować.`,
        resendLink: 'Wyślij ponownie link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Aby zweryfikować ${secondaryLogin}, proszę ponownie wysłać magiczny kod z Ustawień Konta ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Jeśli nie masz już dostępu do ${primaryLogin}, proszę odłączyć swoje konta.`,
        unlink: 'Odłącz',
        linkSent: 'Link wysłany!',
        successfullyUnlinkedLogin: 'Pomyślnie odłączono drugie konto logowania!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nasz dostawca poczty e-mail tymczasowo zawiesił wysyłanie wiadomości e-mail na adres ${login} z powodu problemów z dostarczeniem. Aby odblokować swój login, wykonaj następujące kroki:`,
        confirmThat: ({login}: ConfirmThatParams) => `Potwierdź, że ${login} jest poprawnie napisany i jest prawdziwym, dostarczalnym adresem e-mail.`,
        emailAliases: 'Alias e-mail, takie jak "expenses@domain.com", muszą mieć dostęp do własnej skrzynki odbiorczej, aby były ważnym loginem do Expensify.',
        ensureYourEmailClient: 'Upewnij się, że Twój klient poczty e-mail akceptuje wiadomości z domeny expensify.com.',
        youCanFindDirections: 'Możesz znaleźć instrukcje, jak wykonać ten krok',
        helpConfigure: 'ale możesz potrzebować pomocy działu IT w skonfigurowaniu ustawień poczty e-mail.',
        onceTheAbove: 'Po zakończeniu powyższych kroków, proszę skontaktować się z',
        toUnblock: 'aby odblokować swoje logowanie.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nie mogliśmy dostarczyć wiadomości SMS do ${login}, więc tymczasowo je zawiesiliśmy. Spróbuj zweryfikować swój numer:`,
        validationSuccess: 'Twój numer został zweryfikowany! Kliknij poniżej, aby wysłać nowy magiczny kod logowania.',
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
                return 'Proszę poczekać chwilę przed ponowną próbą.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'dzień' : 'dni'}`);
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
            return `Proszę czekać! Musisz poczekać ${timeText}, zanim ponownie spróbujesz zweryfikować swój numer.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Dołącz',
    },
    detailsPage: {
        localTime: 'Czas lokalny',
    },
    newChatPage: {
        startGroup: 'Rozpocznij grupę',
        addToGroup: 'Dodaj do grupy',
    },
    yearPickerPage: {
        year: 'Rok',
        selectYear: 'Proszę wybrać rok',
    },
    focusModeUpdateModal: {
        title: 'Witamy w trybie #focus!',
        prompt: 'Bądź na bieżąco, widząc tylko nieprzeczytane czaty lub czaty, które wymagają Twojej uwagi. Nie martw się, możesz to zmienić w dowolnym momencie w',
        settings: 'ustawienia',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Nie można znaleźć czatu, którego szukasz.',
        getMeOutOfHere: 'Zabierz mnie stąd',
        iouReportNotFound: 'Nie można znaleźć szczegółów płatności, których szukasz.',
        notHere: 'Hmm... to nie tutaj.',
        pageNotFound: 'Ups, nie można znaleźć tej strony',
        noAccess: 'Ten czat lub wydatek mógł zostać usunięty lub nie masz do niego dostępu.\n\nW razie pytań prosimy o kontakt na concierge@expensify.com',
        goBackHome: 'Wróć do strony głównej',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups... ${isBreakLine ? '\n' : ''}Coś poszło nie tak`,
        subtitle: 'Nie można zrealizować Twojego żądania. Spróbuj ponownie później.',
    },
    setPasswordPage: {
        enterPassword: 'Wprowadź hasło',
        setPassword: 'Ustaw hasło',
        newPasswordPrompt: 'Twoje hasło musi mieć co najmniej 8 znaków, 1 wielką literę, 1 małą literę i 1 cyfrę.',
        passwordFormTitle: 'Witamy z powrotem w New Expensify! Proszę ustawić swoje hasło.',
        passwordNotSet: 'Nie udało nam się ustawić nowego hasła. Wysłaliśmy Ci nowy link do ustawienia hasła, aby spróbować ponownie.',
        setPasswordLinkInvalid: 'Ten link do ustawienia hasła jest nieprawidłowy lub wygasł. Nowy link czeka na Ciebie w Twojej skrzynce e-mail!',
        validateAccount: 'Zweryfikuj konto',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Dodaj emoji, aby ułatwić kolegom i znajomym zrozumienie, co się dzieje. Możesz opcjonalnie dodać wiadomość!',
        today: 'Dzisiaj',
        clearStatus: 'Wyczyść status',
        save: 'Zapisz',
        message: 'Wiadomość',
        timePeriods: {
            never: 'Nigdy',
            thirtyMinutes: '30 minut',
            oneHour: '1 godzina',
            afterToday: 'Dzisiaj',
            afterWeek: 'Tydzień',
            custom: 'Niestandardowy',
        },
        untilTomorrow: 'Do jutra',
        untilTime: ({time}: UntilTimeParams) => `Do ${time}`,
        date: 'Data',
        time: 'Czas',
        clearAfter: 'Wyczyść po',
        whenClearStatus: 'Kiedy powinniśmy usunąć Twój status?',
        vacationDelegate: 'Zastępca urlopowy',
        setVacationDelegate: `Ustaw zastępcę urlopowego, który będzie zatwierdzał raporty w twoim imieniu podczas twojej nieobecności.`,
        vacationDelegateError: 'Wystąpił błąd podczas aktualizacji twojego zastępcy urlopowego.',
        asVacationDelegate: ({nameOrEmail: managerName}: VacationDelegateParams) => `jako zastępca urlopowy ${managerName}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `do ${submittedToName} jako zastępca urlopowy ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Przydzielasz ${nameOrEmail} jako swojego zastępcę urlopowego. Osoba ta nie jest jeszcze członkiem wszystkich twoich przestrzeni roboczych. Jeśli zdecydujesz się kontynuować, zostanie wysłany e-mail do wszystkich administratorów twoich przestrzeni roboczych z prośbą o jej dodanie.`,
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
        confirmBankInfo: 'Potwierdź informacje o banku',
        manuallyAdd: 'Ręcznie dodaj swoje konto bankowe',
        letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
        accountEnding: 'Konto kończące się na',
        thisBankAccount: 'To konto bankowe będzie używane do płatności biznesowych w Twoim miejscu pracy.',
        accountNumber: 'Numer konta',
        routingNumber: 'Numer rozliczeniowy',
        chooseAnAccountBelow: 'Wybierz konto poniżej',
        addBankAccount: 'Dodaj konto bankowe',
        chooseAnAccount: 'Wybierz konto',
        connectOnlineWithPlaid: 'Zaloguj się do swojego banku',
        connectManually: 'Połącz ręcznie',
        desktopConnection: 'Uwaga: Aby połączyć się z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby zakończyć ten proces w przeglądarce.',
        yourDataIsSecure: 'Twoje dane są bezpieczne',
        toGetStarted: 'Dodaj konto bankowe, aby zwracać wydatki, wydawać karty Expensify, pobierać płatności za faktury i opłacać rachunki wszystko z jednego miejsca.',
        plaidBodyCopy: 'Daj swoim pracownikom łatwiejszy sposób na płacenie - i otrzymywanie zwrotu - za wydatki firmowe.',
        checkHelpLine: 'Twój numer rozliczeniowy i numer konta można znaleźć na czeku dla tego konta.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Aby połączyć konto bankowe, proszę <a href="${contactMethodRoute}">dodaj e-mail jako swoje główne dane logowania</a> i spróbuj ponownie. Możesz dodać swój numer telefonu jako dodatkowy login.`,
        hasBeenThrottledError: 'Wystąpił błąd podczas dodawania Twojego konta bankowego. Proszę poczekać kilka minut i spróbować ponownie.',
        hasCurrencyError: {
            phrase1: 'Ups! Wygląda na to, że waluta Twojego miejsca pracy jest ustawiona na inną niż USD. Aby kontynuować, przejdź do',
            link: 'ustawienia Twojego miejsca pracy',
            phrase2: 'ustawić na USD i spróbować ponownie.',
        },
        error: {
            youNeedToSelectAnOption: 'Proszę wybrać opcję, aby kontynuować',
            noBankAccountAvailable: 'Przepraszamy, nie ma dostępnego konta bankowego.',
            noBankAccountSelected: 'Proszę wybrać konto',
            taxID: 'Proszę wprowadzić prawidłowy numer identyfikacji podatkowej',
            website: 'Proszę wprowadzić prawidłową stronę internetową',
            zipCode: `Proszę wprowadzić prawidłowy kod pocztowy używając formatu: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Proszę wprowadzić prawidłowy numer telefonu',
            email: 'Proszę wprowadzić prawidłowy adres e-mail',
            companyName: 'Proszę wprowadzić prawidłową nazwę firmy',
            addressCity: 'Proszę wprowadzić prawidłowe miasto',
            addressStreet: 'Proszę wprowadzić prawidłowy adres ulicy',
            addressState: 'Proszę wybrać prawidłowy stan',
            incorporationDateFuture: 'Data założenia nie może być w przyszłości',
            incorporationState: 'Proszę wybrać prawidłowy stan',
            industryCode: 'Proszę wprowadzić prawidłowy kod klasyfikacji branżowej składający się z sześciu cyfr',
            restrictedBusiness: 'Proszę potwierdzić, że firma nie znajduje się na liście firm objętych ograniczeniami.',
            routingNumber: 'Proszę wprowadzić prawidłowy numer rozliczeniowy',
            accountNumber: 'Proszę wprowadzić prawidłowy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numery trasowania i konta nie mogą się zgadzać',
            companyType: 'Proszę wybrać prawidłowy typ firmy',
            tooManyAttempts: 'Z powodu dużej liczby prób logowania, ta opcja została wyłączona na 24 godziny. Proszę spróbować ponownie później lub wprowadzić dane ręcznie.',
            address: 'Proszę wprowadzić prawidłowy adres',
            dob: 'Proszę wybrać prawidłową datę urodzenia',
            age: 'Musisz mieć ukończone 18 lat',
            ssnLast4: 'Proszę wprowadzić prawidłowe ostatnie 4 cyfry numeru SSN',
            firstName: 'Proszę wprowadzić prawidłowe imię',
            lastName: 'Proszę wprowadzić prawidłowe nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Proszę dodać domyślne konto depozytowe lub kartę debetową',
            validationAmounts: 'Kwoty weryfikacyjne, które wprowadziłeś, są nieprawidłowe. Proszę dokładnie sprawdzić wyciąg bankowy i spróbować ponownie.',
            fullName: 'Proszę wprowadzić prawidłowe pełne imię i nazwisko',
            ownershipPercentage: 'Proszę wprowadzić prawidłową liczbę procentową',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Gdzie znajduje się Twoje konto bankowe?',
        accountDetailsStepHeader: 'Jakie są szczegóły Twojego konta?',
        accountTypeStepHeader: 'Jakiego typu jest to konto?',
        bankInformationStepHeader: 'Jakie są Twoje dane bankowe?',
        accountHolderInformationStepHeader: 'Jakie są dane posiadacza konta?',
        howDoWeProtectYourData: 'Jak chronimy Twoje dane?',
        currencyHeader: 'Jaka jest waluta Twojego konta bankowego?',
        confirmationStepHeader: 'Sprawdź swoje informacje.',
        confirmationStepSubHeader: 'Sprawdź poniższe szczegóły i zaznacz pole z warunkami, aby potwierdzić.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Wprowadź hasło do Expensify',
        alreadyAdded: 'To konto zostało już dodane.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Dodano osobiste konto bankowe!',
        successMessage: 'Gratulacje, Twoje konto bankowe jest skonfigurowane i gotowe do otrzymywania zwrotów.',
    },
    attachmentView: {
        unknownFilename: 'Nieznana nazwa pliku',
        passwordRequired: 'Proszę wprowadzić hasło',
        passwordIncorrect: 'Nieprawidłowe hasło. Spróbuj ponownie.',
        failedToLoadPDF: 'Nie udało się załadować pliku PDF',
        pdfPasswordForm: {
            title: 'PDF chroniony hasłem',
            infoText: 'Ten plik PDF jest chroniony hasłem.',
            beforeLinkText: 'Proszę',
            linkText: 'wprowadź hasło',
            afterLinkText: 'aby to zobaczyć.',
            formLabel: 'Pokaż PDF',
        },
        attachmentNotFound: 'Załącznik nie znaleziony',
    },
    messages: {
        errorMessageInvalidPhone: `Proszę wprowadzić prawidłowy numer telefonu bez nawiasów i myślników. Jeśli jesteś poza USA, dołącz swój kod kraju (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Nieprawidłowy adres e-mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} jest już członkiem ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Kontynuując prośbę o aktywację Portfela Expensify, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        facialScan: 'Polityka i Zgoda na Skanowanie Twarzy Onfido',
        tryAgain: 'Spróbuj ponownie',
        verifyIdentity: 'Zweryfikuj tożsamość',
        letsVerifyIdentity: 'Zweryfikujmy Twoją tożsamość',
        butFirst: `Ale najpierw nudne rzeczy. Zapoznaj się z prawniczym żargonem w następnym kroku i kliknij „Akceptuj”, gdy będziesz gotowy.`,
        genericError: 'Wystąpił błąd podczas przetwarzania tego kroku. Proszę spróbować ponownie.',
        cameraPermissionsNotGranted: 'Włącz dostęp do aparatu',
        cameraRequestMessage: 'Potrzebujemy dostępu do Twojego aparatu, aby zakończyć weryfikację konta bankowego. Proszę włączyć w Ustawieniach > New Expensify.',
        microphonePermissionsNotGranted: 'Włącz dostęp do mikrofonu',
        microphoneRequestMessage: 'Potrzebujemy dostępu do Twojego mikrofonu, aby zakończyć weryfikację konta bankowego. Proszę włączyć w Ustawieniach > New Expensify.',
        originalDocumentNeeded: 'Proszę przesłać oryginalny obraz swojego dowodu tożsamości zamiast zrzutu ekranu lub zeskanowanego obrazu.',
        documentNeedsBetterQuality:
            'Twój dowód tożsamości wydaje się być uszkodzony lub brakuje mu cech zabezpieczających. Proszę przesłać oryginalny obraz nieuszkodzonego dowodu tożsamości, który jest w pełni widoczny.',
        imageNeedsBetterQuality: 'Wystąpił problem z jakością obrazu Twojego dowodu tożsamości. Proszę przesłać nowy obraz, na którym cały dowód tożsamości jest wyraźnie widoczny.',
        selfieIssue: 'Wystąpił problem z Twoim selfie/wideo. Proszę przesłać aktualne selfie/wideo.',
        selfieNotMatching: 'Twoje selfie/wideo nie pasuje do Twojego dowodu tożsamości. Proszę, prześlij nowe selfie/wideo, na którym Twoja twarz jest wyraźnie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wygląda na zdjęcie/wideo na żywo. Proszę przesłać selfie/wideo na żywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczegóły',
        helpText: 'Musimy potwierdzić następujące informacje, zanim będziesz mógł wysyłać i odbierać pieniądze z portfela.',
        helpTextIdologyQuestions: 'Musimy zadać Ci jeszcze kilka pytań, aby zakończyć weryfikację Twojej tożsamości.',
        helpLink: 'Dowiedz się więcej, dlaczego tego potrzebujemy.',
        legalFirstNameLabel: 'Imię prawne',
        legalMiddleNameLabel: 'Drugie imię (prawne)',
        legalLastNameLabel: 'Nazwisko prawne',
        selectAnswer: 'Proszę wybrać odpowiedź, aby kontynuować',
        ssnFull9Error: 'Proszę wprowadzić prawidłowy dziewięciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem z weryfikacją Twojego numeru SSN. Proszę wprowadzić pełne dziewięć cyfr swojego numeru SSN.',
        weCouldNotVerify: 'Nie mogliśmy zweryfikować',
        pleaseFixIt: 'Proszę poprawić te informacje przed kontynuowaniem',
        failedKYCTextBefore: 'Nie udało nam się zweryfikować Twojej tożsamości. Spróbuj ponownie później lub skontaktuj się z',
        failedKYCTextAfter: 'jeśli masz jakieś pytania.',
    },
    termsStep: {
        headerTitle: 'Warunki i opłaty',
        headerTitleRefactor: 'Opłaty i warunki',
        haveReadAndAgree: 'Przeczytałem i zgadzam się na otrzymywanie',
        electronicDisclosures: 'elektroniczne ujawnienia',
        agreeToThe: 'Zgadzam się na',
        walletAgreement: 'Umowa portfela',
        enablePayments: 'Włącz płatności',
        monthlyFee: 'Miesięczna opłata',
        inactivity: 'Nieaktywność',
        noOverdraftOrCredit: 'Brak funkcji debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne wycofanie środków',
        standard: 'Standardowy',
        reviewTheFees: 'Spójrz na niektóre opłaty.',
        checkTheBoxes: 'Proszę zaznaczyć poniższe pola.',
        agreeToTerms: 'Zgódź się na warunki, a będziesz gotowy do działania!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Portfel Expensify jest wydawany przez ${walletProgram}.`,
            perPurchase: 'Za zakup',
            atmWithdrawal: 'Wypłata z bankomatu',
            cashReload: 'Doładowanie gotówką',
            inNetwork: 'w sieci',
            outOfNetwork: 'poza siecią',
            atmBalanceInquiry: 'Zapytanie o saldo bankomatu',
            inOrOutOfNetwork: '(w sieci lub poza siecią)',
            customerService: 'Obsługa klienta',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(po 12 miesiącach bez transakcji)',
            weChargeOneFee: 'Pobieramy jeszcze jedną opłatę. Jest to:',
            fdicInsurance: 'Twoje środki kwalifikują się do ubezpieczenia FDIC.',
            generalInfo: 'Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź',
            conditionsDetails: 'Aby uzyskać szczegóły i warunki dotyczące wszystkich opłat i usług, odwiedź',
            conditionsPhone: 'lub dzwoniąc pod numer +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Lista wszystkich opłat za portfel Expensify',
            typeOfFeeHeader: 'Wszystkie opłaty',
            feeAmountHeader: 'Kwota',
            moreDetailsHeader: 'Szczegóły',
            openingAccountTitle: 'Otwieranie konta',
            openingAccountDetails: 'Nie ma opłaty za otwarcie konta.',
            monthlyFeeDetails: 'Nie ma miesięcznej opłaty.',
            customerServiceTitle: 'Obsługa klienta',
            customerServiceDetails: 'Nie ma opłat za obsługę klienta.',
            inactivityDetails: 'Nie ma opłaty za brak aktywności.',
            sendingFundsTitle: 'Wysyłanie środków do innego posiadacza konta',
            sendingFundsDetails: 'Nie ma opłaty za wysyłanie środków do innego posiadacza konta przy użyciu salda, konta bankowego lub karty debetowej.',
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
            fdicInsuranceBancorp2: 'szczegóły.',
            contactExpensifyPayments: `Skontaktuj się z ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}, dzwoniąc pod numer +1 833-400-0904, lub e-mailem na adres`,
            contactExpensifyPayments2: 'lub zaloguj się na',
            generalInformation: 'Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź',
            generalInformation2: 'Jeśli masz skargę dotyczącą konta przedpłaconego, zadzwoń do Biura Ochrony Konsumentów pod numer 1-855-411-2372 lub odwiedź',
            printerFriendlyView: 'Wyświetl wersję przyjazną dla drukarki',
            automated: 'Zautomatyzowany',
            liveAgent: 'Agent na żywo',
            instant: 'Natychmiastowy',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Włącz płatności',
        activatedTitle: 'Portfel aktywowany!',
        activatedMessage: 'Gratulacje, Twój portfel jest gotowy do dokonywania płatności.',
        checkBackLaterTitle: 'Tylko chwilkę...',
        checkBackLaterMessage: 'Nadal przeglądamy Twoje informacje. Proszę sprawdź ponownie później.',
        continueToPayment: 'Przejdź do płatności',
        continueToTransfer: 'Kontynuuj transferowanie',
    },
    companyStep: {
        headerTitle: 'Informacje o firmie',
        subtitle: 'Prawie gotowe! Ze względów bezpieczeństwa musimy potwierdzić pewne informacje:',
        legalBusinessName: 'Prawna nazwa firmy',
        companyWebsite: 'Strona internetowa firmy',
        taxIDNumber: 'Numer identyfikacji podatkowej',
        taxIDNumberPlaceholder: '9 cyfr',
        companyType: 'Typ firmy',
        incorporationDate: 'Data założenia firmy',
        incorporationState: 'Stan inkorporacji',
        industryClassificationCode: 'Kod klasyfikacji branżowej',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Kooperatywa',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        industryClassification: 'Do jakiej branży jest sklasyfikowana firma?',
        industryClassificationCodePlaceholder: 'Wyszukaj kod klasyfikacji branżowej',
    },
    requestorStep: {
        headerTitle: 'Informacje osobiste',
        learnMore: 'Dowiedz się więcej',
        isMyDataSafe: 'Czy moje dane są bezpieczne?',
    },
    personalInfoStep: {
        personalInfo: 'Dane osobowe',
        enterYourLegalFirstAndLast: 'Jakie jest Twoje imię i nazwisko?',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        legalName: 'Imię i nazwisko prawne',
        enterYourDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterTheLast4: 'Jakie są ostatnie cztery cyfry Twojego numeru ubezpieczenia społecznego?',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych sprawdzeń kredytowych!',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        enterYourAddress: 'Jaki jest Twój adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        whatsYourLegalName: 'Jakie jest Twoje imię i nazwisko?',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatsYourSSN: 'Jakie są ostatnie cztery cyfry Twojego numeru ubezpieczenia społecznego?',
        noPersonalChecks: 'Nie martw się, tutaj nie ma sprawdzania zdolności kredytowej!',
        whatsYourPhoneNumber: 'Jaki jest Twój numer telefonu?',
        weNeedThisToVerify: 'Potrzebujemy tego, aby zweryfikować Twój portfel.',
    },
    businessInfoStep: {
        businessInfo: 'Informacje o firmie',
        enterTheNameOfYourBusiness: 'Jak nazywa się Twoja firma?',
        businessName: 'Prawna nazwa firmy',
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
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data założenia firmy',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationState: 'Stan inkorporacji',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'W którym stanie została zarejestrowana Twoja firma?',
        letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
        companyAddress: 'Adres firmy',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        businessInfoTitle: 'Informacje o firmie',
        legalBusinessName: 'Prawna nazwa firmy',
        whatsTheBusinessName: 'Jak nazywa się firma?',
        whatsTheBusinessAddress: 'Jaki jest adres firmy?',
        whatsTheBusinessContactInformation: 'Jakie są dane kontaktowe firmy?',
        whatsTheBusinessRegistrationNumber: 'Jaki jest numer rejestracyjny firmy?',
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Jaki jest numer identyfikacyjny pracodawcy (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Jaki jest numer identyfikacyjny firmy (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Jaki jest numer rejestracyjny VAT (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Jaki jest australijski numer identyfikacyjny firmy (ABN)?';
                default:
                    return 'Jaki jest unijny numer VAT?';
            }
        },
        whatsThisNumber: 'Co to za numer?',
        whereWasTheBusinessIncorporated: 'Gdzie została zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj działalności?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen płatności firmy?',
        whatsYourExpectedAverageReimbursements: 'Jaka jest oczekiwana średnia kwota zwrotu?',
        registrationNumber: 'Numer rejestracyjny',
        taxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'VRN';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'VAT UE';
            }
        },
        businessAddress: 'Adres firmowy',
        businessType: 'Typ działalności',
        incorporation: 'Inkorporacja',
        incorporationCountry: 'Kraj inkorporacji',
        incorporationTypeName: 'Typ inkorporacji',
        businessCategory: 'Kategoria biznesowa',
        annualPaymentVolume: 'Roczna wartość płatności',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Roczna wartość płatności w ${currencyCode}`,
        averageReimbursementAmount: 'Średnia kwota zwrotu',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Średnia kwota zwrotu w ${currencyCode}`,
        selectIncorporationType: 'Wybierz typ rejestracji',
        selectBusinessCategory: 'Wybierz kategorię biznesową',
        selectAnnualPaymentVolume: 'Wybierz roczną wartość płatności',
        selectIncorporationCountry: 'Wybierz kraj rejestracji',
        selectIncorporationState: 'Wybierz stan rejestracji',
        selectAverageReimbursement: 'Wybierz średnią kwotę zwrotu',
        findIncorporationType: 'Znajdź rodzaj inkorporacji',
        findBusinessCategory: 'Znajdź kategorię biznesową',
        findAnnualPaymentVolume: 'Znajdź roczny wolumen płatności',
        findIncorporationState: 'Znajdź stan rejestracji',
        findAverageReimbursement: 'Znajdź średnią kwotę zwrotu',
        error: {
            registrationNumber: 'Proszę podać prawidłowy numer rejestracyjny',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Proszę podać prawidłowy numer identyfikacyjny pracodawcy (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Proszę podać prawidłowy numer identyfikacyjny firmy (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Proszę podać prawidłowy numer rejestracyjny VAT (VRN)';
                    case CONST.COUNTRY.AU:
                        return 'Proszę podać prawidłowy australijski numer identyfikacyjny firmy (ABN)';
                    default:
                        return 'Proszę podać prawidłowy unijny numer VAT';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Czy posiadasz 25% lub więcej z',
        doAnyIndividualOwn25percent: 'Czy jakiekolwiek osoby posiadają 25% lub więcej z',
        areThereMoreIndividualsWhoOwn25percent: 'Czy istnieje więcej osób, które posiadają 25% lub więcej z',
        regulationRequiresUsToVerifyTheIdentity: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        companyOwner: 'Właściciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest prawne imię właściciela?',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia właściciela?',
        enterTheLast4: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych sprawdzeń kredytowych!',
        enterTheOwnersAddress: 'Jaki jest adres właściciela?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
        legalName: 'Imię i nazwisko prawne',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        owners: 'Właściciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o właścicielu',
        businessOwner: 'Właściciel firmy',
        signerInfo: 'Informacje o sygnatariuszu',
        doYouOwn: ({companyName}: CompanyNameParams) => `Czy posiadasz 25% lub więcej udziałów w ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Czy jakakolwiek osoba posiada 25% lub więcej udziałów w ${companyName}?`,
        regulationsRequire: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        whatsTheOwnersName: 'Jakie jest prawne imię właściciela?',
        whatsYourName: 'Jakie jest Twoje imię i nazwisko?',
        whatPercentage: 'Jaki procent firmy należy do właściciela?',
        whatsYoursPercentage: 'Jaki procent firmy posiadasz?',
        ownership: 'Własność',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia właściciela?',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres właściciela?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatAreTheLast: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        whatsYourLast: 'Jakie są ostatnie 4 cyfry Twojego numeru Social Security?',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych sprawdzeń kredytowych!',
        last4: 'Ostatnie 4 cyfry numeru SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
        legalName: 'Imię i nazwisko prawne',
        ownershipPercentage: 'Procent własności',
        areThereOther: ({companyName}: CompanyNameParams) => `Czy są inne osoby, które posiadają 25% lub więcej udziałów w ${companyName}?`,
        owners: 'Właściciele',
        addCertified: 'Dodaj certyfikowany schemat organizacyjny, który pokazuje właścicieli beneficjentów',
        regulationRequiresChart:
            'Przepisy wymagają od nas zebrania poświadczonej kopii schematu własności, który pokazuje każdą osobę fizyczną lub podmiot posiadający 25% lub więcej udziałów w firmie.',
        uploadEntity: 'Prześlij wykres własności podmiotu',
        noteEntity: 'Uwaga: Schemat własności jednostki musi być podpisany przez Twojego księgowego, doradcę prawnego lub notarialnie poświadczony.',
        certified: 'Certyfikowany wykres własności jednostki',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajdź kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prześlij dodatkową dokumentację',
        pleaseUpload:
            'Proszę przesłać dodatkową dokumentację poniżej, aby pomóc nam zweryfikować Twoją tożsamość jako bezpośredniego lub pośredniego właściciela 25% lub więcej podmiotu gospodarczego.',
        acceptedFiles: 'Akceptowane formaty plików: PDF, PNG, JPEG. Całkowity rozmiar plików dla każdej sekcji nie może przekraczać 5 MB.',
        proofOfBeneficialOwner: 'Dowód właściciela rzeczywistego',
        proofOfBeneficialOwnerDescription:
            'Proszę dostarczyć podpisane oświadczenie i schemat organizacyjny od publicznego księgowego, notariusza lub prawnika potwierdzające posiadanie 25% lub więcej udziałów w firmie. Dokument musi być datowany na ostatnie trzy miesiące i zawierać numer licencji osoby podpisującej.',
        copyOfID: 'Kopia dowodu tożsamości dla beneficjenta rzeczywistego',
        copyOfIDDescription: 'Przykłady: paszport, prawo jazdy, itp.',
        proofOfAddress: 'Potwierdzenie adresu dla rzeczywistego właściciela',
        proofOfAddressDescription: 'Przykłady: rachunek za media, umowa najmu, itp.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            'Proszę przesłać wideo z wizyty na miejscu lub nagranie rozmowy z urzędnikiem podpisującym. Urzędnik musi podać: pełne imię i nazwisko, datę urodzenia, nazwę firmy, numer rejestrowy, numer kodu fiskalnego, adres rejestrowy, rodzaj działalności oraz cel założenia konta.',
    },
    validationStep: {
        headerTitle: 'Zatwierdź konto bankowe',
        buttonText: 'Zakończ konfigurację',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu niepoprawnych prób.',
        description: `W ciągu 1-2 dni roboczych wyślemy trzy (3) małe transakcje na Twoje konto bankowe z nazwą taką jak "Expensify, Inc. Validation".`,
        descriptionCTA: 'Proszę wprowadzić kwotę każdej transakcji w poniższych polach. Przykład: 1.51.',
        reviewingInfo: 'Dziękujemy! Przeglądamy Twoje informacje i wkrótce się z Tobą skontaktujemy. Proszę sprawdź czat z Concierge.',
        forNextStep: 'w celu wykonania kolejnych kroków, aby dokończyć konfigurację konta bankowego.',
        letsChatCTA: 'Tak, porozmawiajmy.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy w weryfikacji kilku ostatnich informacji przez czat. Gotowy?',
        letsChatTitle: 'Porozmawiajmy!',
        enable2FATitle: 'Aby zapobiec oszustwom, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie podchodzimy do Twojego bezpieczeństwa. Proszę skonfigurować 2FA, aby dodać dodatkową warstwę ochrony do swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Dodatkowe informacje',
        checkAllThatApply: 'Zaznacz wszystkie, które mają zastosowanie, w przeciwnym razie pozostaw puste.',
        iOwnMoreThan25Percent: 'Posiadam więcej niż 25% z',
        someoneOwnsMoreThan25Percent: 'Ktoś inny posiada więcej niż 25% z',
        additionalOwner: 'Dodatkowy beneficjent rzeczywisty',
        removeOwner: 'Usuń tego beneficjenta rzeczywistego',
        addAnotherIndividual: 'Dodaj kolejną osobę, która posiada więcej niż 25% z',
        agreement: 'Umowa:',
        termsAndConditions: 'warunki i zasady',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        error: {
            certify: 'Musi poświadczyć, że informacje są prawdziwe i dokładne',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Zakończ weryfikację',
        confirmAgreements: 'Proszę potwierdzić poniższe umowy.',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        certifyTrueAndAccurateError: 'Proszę potwierdzić, że informacje są prawdziwe i dokładne.',
        isAuthorizedToUseBankAccount: 'Jestem upoważniony do korzystania z tego firmowego konta bankowego na wydatki biznesowe.',
        isAuthorizedToUseBankAccountError: 'Musisz być kontrolującym urzędnikiem z upoważnieniem do obsługi konta bankowego firmy',
        termsAndConditions: 'warunki i zasady',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Połącz konto bankowe',
        finishButtonText: 'Zakończ konfigurację',
        validateYourBankAccount: 'Zwaliduj swoje konto bankowe',
        validateButtonText: 'Zatwierdź',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu niepoprawnych prób.',
        description: `W ciągu 1-2 dni roboczych wyślemy trzy (3) małe transakcje na Twoje konto bankowe z nazwą taką jak "Expensify, Inc. Validation".`,
        descriptionCTA: 'Proszę wprowadzić kwotę każdej transakcji w poniższych polach. Przykład: 1.51.',
        reviewingInfo: 'Dziękujemy! Przeglądamy Twoje informacje i wkrótce się z Tobą skontaktujemy. Sprawdź swój czat z Concierge.',
        forNextSteps: 'w celu wykonania kolejnych kroków, aby dokończyć konfigurację konta bankowego.',
        letsChatCTA: 'Tak, porozmawiajmy.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy w weryfikacji kilku ostatnich informacji przez czat. Gotowy?',
        letsChatTitle: 'Porozmawiajmy!',
        enable2FATitle: 'Aby zapobiec oszustwom, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie podchodzimy do Twojego bezpieczeństwa. Proszę skonfigurować 2FA, aby dodać dodatkową warstwę ochrony do swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierdź walutę i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierdź walutę i kraj',
        yourBusiness: 'Waluta Twojego firmowego konta bankowego musi być zgodna z walutą Twojego miejsca pracy.',
        youCanChange: 'Możesz zmienić walutę swojego miejsca pracy w swoim',
        findCountry: 'Znajdź kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie są dane Twojego firmowego konta bankowego?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda w porządku.',
        thisBankAccount: 'To konto bankowe będzie używane do płatności biznesowych w Twoim miejscu pracy.',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Pełne imię i nazwisko osoby upoważnionej do podpisu',
    },
    signerInfoStep: {
        signerInfo: 'Informacje o sygnatariuszu',
        areYouDirector: ({companyName}: CompanyNameParams) => `Czy jesteś dyrektorem lub starszym urzędnikiem w ${companyName}?`,
        regulationRequiresUs: 'Przepisy wymagają, abyśmy zweryfikowali, czy podpisujący ma uprawnienia do podjęcia tej czynności w imieniu firmy.',
        whatsYourName: 'Jakie jest Twoje imię i nazwisko?',
        fullName: 'Pełne imię i nazwisko zgodne z dokumentem tożsamości',
        whatsYourJobTitle: 'Jaki jest Twój tytuł zawodowy?',
        jobTitle: 'Stanowisko pracy',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        uploadID: 'Prześlij dokument tożsamości i dowód adresu',
        personalAddress: 'Potwierdzenie adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
        legalName: 'Imię i nazwisko prawne',
        proofOf: 'Dowód adresu zamieszkania',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Wprowadź adres e-mail dyrektora lub starszego urzędnika w ${companyName}`,
        regulationRequiresOneMoreDirector: 'Regulacje wymagają co najmniej jednego dodatkowego dyrektora lub starszego urzędnika jako sygnatariusza.',
        hangTight: 'Poczekaj chwilę...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Wprowadź adresy e-mail dwóch dyrektorów lub wyższych rangą pracowników w ${companyName}`,
        sendReminder: 'Wyślij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, aż inni zweryfikują swoje tożsamości jako dyrektorzy lub wyżsi urzędnicy firmy.',
        id: 'Kopia dowodu tożsamości',
        proofOfDirectors: 'Dowód dyrektora/dyrektorów',
        proofOfDirectorsDescription: 'Przykłady: Profil korporacyjny Oncorp lub Rejestracja działalności gospodarczej.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale dla Sygnatariuszy, Użytkowników Upoważnionych i Właścicieli Korzyści.',
        PDSandFSG: 'Dokumentacja ujawnienia PDS + FSG',
        PDSandFSGDescription:
            'Nasze partnerstwo z Corpay wykorzystuje połączenie API, aby skorzystać z ich rozległej sieci międzynarodowych partnerów bankowych do zasilania Globalnych Zwrotów w Expensify. Zgodnie z australijskimi przepisami dostarczamy Ci Przewodnik po Usługach Finansowych (FSG) i Oświadczenie o Ujawnieniu Produktu (PDS) Corpay.\n\nProsimy o uważne przeczytanie dokumentów FSG i PDS, ponieważ zawierają one pełne szczegóły i ważne informacje na temat produktów i usług oferowanych przez Corpay. Zachowaj te dokumenty do przyszłego wglądu.',
        pleaseUpload: 'Proszę przesłać dodatkową dokumentację poniżej, aby pomóc nam zweryfikować Twoją tożsamość jako dyrektora lub starszego urzędnika jednostki gospodarczej.',
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Proszę potwierdzić poniższe umowy',
        regulationRequiresUs: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        iAmAuthorized: 'Jestem upoważniony do korzystania z firmowego konta bankowego na wydatki biznesowe.',
        iCertify: 'Oświadczam, że podane informacje są prawdziwe i dokładne.',
        termsAndConditions: 'warunki i zasady',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThe: 'Wyrażam zgodę na',
        privacyNotice: 'informacja o prywatności',
        error: {
            authorized: 'Musisz być kontrolującym urzędnikiem z upoważnieniem do obsługi konta bankowego firmy',
            certify: 'Proszę potwierdzić, że informacje są prawdziwe i dokładne.',
            consent: 'Proszę wyrazić zgodę na politykę prywatności',
        },
    },
    finishStep: {
        connect: 'Połącz konto bankowe',
        letsFinish: 'Zakończmy na czacie!',
        thanksFor:
            'Dziękujemy za te szczegóły. Dedykowany agent wsparcia teraz przejrzy Twoje informacje. Skontaktujemy się ponownie, jeśli będziemy potrzebować od Ciebie czegoś więcej, ale w międzyczasie, nie wahaj się z nami skontaktować, jeśli masz jakiekolwiek pytania.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'Włącz uwierzytelnianie dwuskładnikowe (2FA), aby zapobiec oszustwom',
        weTake: 'Poważnie podchodzimy do Twojego bezpieczeństwa. Proszę skonfigurować 2FA, aby dodać dodatkową warstwę ochrony do swojego konta.',
        secure: 'Zabezpiecz swoje konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Chwileczkę',
        explanationLine: 'Przyglądamy się Twoim informacjom. Wkrótce będziesz mógł kontynuować kolejne kroki.',
    },
    session: {
        offlineMessageRetry: 'Wygląda na to, że jesteś offline. Sprawdź swoje połączenie i spróbuj ponownie.',
    },
    travel: {
        header: 'Zarezerwuj podróż',
        title: 'Podróżuj mądrze',
        subtitle: 'Użyj Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzać wszystkimi wydatkami firmowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszczędzaj pieniądze na swoich rezerwacjach',
            alerts: 'Otrzymuj aktualizacje i alerty w czasie rzeczywistym',
        },
        bookTravel: 'Zarezerwuj podróż',
        bookDemo: 'Zarezerwuj demo',
        bookADemo: 'Zarezerwuj demo',
        toLearnMore: 'aby dowiedzieć się więcej.',
        termsAndConditions: {
            header: 'Zanim przejdziemy dalej...',
            title: 'Warunki i zasady',
            subtitle: 'Proszę zaakceptować Expensify Travel',
            termsAndConditions: 'warunki i zasady',
            travelTermsAndConditions: 'warunki i zasady',
            agree: 'Zgadzam się na',
            error: 'Musisz zaakceptować warunki i zasady Expensify Travel, aby kontynuować.',
            defaultWorkspaceError:
                'Musisz ustawić domyślne miejsce pracy, aby włączyć Expensify Travel. Przejdź do Ustawienia > Miejsca pracy > kliknij trzy pionowe kropki obok miejsca pracy > Ustaw jako domyślne miejsce pracy, a następnie spróbuj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasażer',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Masz <strong>${layover} przesiadkę</strong> przed tym lotem</muted-text-label>`,
            takeOff: 'Start',
            landing: 'Lądowanie',
            seat: 'Miejsce',
            class: 'Klasa kabiny',
            recordLocator: 'Lokalizator rezerwacji',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Ekonomia',
                premiumEconomy: 'Premium Economy',
                business: 'Biznes',
                first: 'Pierwszy',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gość',
            checkIn: 'Zameldowanie',
            checkOut: 'Wymeldowanie',
            roomType: 'Typ pokoju',
            cancellation: 'Polityka anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            confirmation: 'Numer potwierdzenia',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Bezzwrotny',
                freeCancellationUntil: 'Bezpłatne anulowanie do',
                partiallyRefundable: 'Częściowo zwracalne',
            },
        },
        car: 'Samochód',
        carDetails: {
            rentalCar: 'Wynajem samochodu',
            pickUp: 'Odbiór',
            dropOff: 'Zrzut',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Polityka anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            freeCancellation: 'Bezpłatne anulowanie',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Szyna',
        trainDetails: {
            passenger: 'Pasażer',
            departs: 'Odjeżdża',
            arrives: 'Przybywa',
            coachNumber: 'Numer trenera',
            seat: 'Miejsce',
            fareDetails: 'Szczegóły opłat',
            confirmation: 'Numer potwierdzenia',
        },
        viewTrip: 'Zobacz podróż',
        modifyTrip: 'Modyfikuj podróż',
        tripSupport: 'Wsparcie podróży',
        tripDetails: 'Szczegóły podróży',
        viewTripDetails: 'Wyświetl szczegóły podróży',
        trip: 'Podróż',
        trips: 'Podróże',
        tripSummary: 'Podsumowanie podróży',
        departs: 'Odjeżdża',
        errorMessage: 'Coś poszło nie tak. Spróbuj ponownie później.',
        phoneError: {
            phrase1: 'Proszę',
            link: 'dodaj służbowy adres e-mail jako swoje główne logowanie',
            phrase2: 'zarezerwować podróż.',
        },
        domainSelector: {
            title: 'Domena',
            subtitle: 'Wybierz domenę dla konfiguracji Expensify Travel.',
            recommended: 'Zalecane',
        },
        domainPermissionInfo: {
            title: 'Domena',
            restrictionPrefix: `Nie masz uprawnień do włączenia Expensify Travel dla tej domeny.`,
            restrictionSuffix: `Będziesz musiał poprosić kogoś z tej domeny o włączenie podróży.`,
            accountantInvitationPrefix: `Jeśli jesteś księgowym, rozważ dołączenie do`,
            accountantInvitationLink: `Program dla księgowych ExpensifyApproved!`,
            accountantInvitationSuffix: `aby włączyć podróże dla tej domeny.`,
        },
        publicDomainError: {
            title: 'Rozpocznij korzystanie z Expensify Travel',
            message: `Będziesz musiał użyć swojego służbowego adresu e-mail (np. name@company.com) z Expensify Travel, a nie swojego osobistego adresu e-mail (np. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel został wyłączony',
            message: `Twój administrator wyłączył Expensify Travel. Proszę przestrzegać firmowej polityki rezerwacji w celu organizacji podróży.`,
        },
        verifyCompany: {
            title: 'Rozpocznij podróż już dziś!',
            message: `Proszę skontaktować się z menedżerem konta lub salesteam@expensify.com, aby uzyskać demonstrację podróży i włączyć ją dla swojej firmy.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zarezerwowany. Kod potwierdzenia: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został unieważniony.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Twój bilet na lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zwrócony lub wymieniony.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został odwołany przez linię lotniczą.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `Linia lotnicza zaproponowała zmianę harmonogramu dla lotu ${airlineCode}; czekamy na potwierdzenie.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Zmiana harmonogramu potwierdzona: lot ${airlineCode} teraz odlatuje o ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Twój lot ${airlineCode} (${origin} → ${destination}) w dniu ${startDate} został zaktualizowany.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Twoja klasa kabiny została zaktualizowana do ${cabinClass} na locie ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Twoje miejsce na pokładzie lotu ${airlineCode} zostało potwierdzone.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Twoje przypisanie miejsca na locie ${airlineCode} zostało zmienione.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Twoje miejsce na pokładzie lotu ${airlineCode} zostało usunięte.`,
            paymentDeclined: 'Płatność za rezerwację lotu nie powiodła się. Proszę spróbować ponownie.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Anulowałeś swoją rezerwację ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Sprzedawca anulował Twoją rezerwację ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Twoja rezerwacja ${type} została ponownie zarezerwowana. Nowy numer potwierdzenia: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Twoja rezerwacja ${type} została zaktualizowana. Sprawdź nowe szczegóły w itinerarzu.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Twój bilet kolejowy na trasie ${origin} → ${destination} z dnia ${startDate} został zwrócony. Zostanie przetworzony zwrot środków.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy na trasie ${origin} → ${destination} na ${startDate} został wymieniony.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Twój bilet kolejowy na trasie ${origin} → ${destination} na dzień ${startDate} został zaktualizowany.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Twoja rezerwacja ${type} została zaktualizowana.`,
        },
    },
    workspace: {
        common: {
            card: 'Karty',
            expensifyCard: 'Expensify Card',
            companyCards: 'Karty firmowe',
            workflows: 'Przepływy pracy',
            workspace: 'Workspace',
            findWorkspace: 'Znajdź przestrzeń roboczą',
            edit: 'Edytuj przestrzeń roboczą',
            enabled: 'Włączone',
            disabled: 'Wyłączony',
            everyone: 'Wszyscy',
            delete: 'Usuń przestrzeń roboczą',
            settings: 'Ustawienia',
            reimburse: 'Zwroty kosztów',
            categories: 'Kategorie',
            tags: 'Tagi',
            customField1: 'Pole niestandardowe 1',
            customField2: 'Pole niestandardowe 2',
            customFieldHint: 'Dodaj niestandardowe kodowanie, które dotyczy wszystkich wydatków tego członka.',
            reportFields: 'Pola raportu',
            reportTitle: 'Tytuł raportu',
            reportField: 'Pole raportu',
            taxes: 'Podatki',
            bills: 'Rachunki',
            invoices: 'Faktury',
            travel: 'Podróżować',
            members: 'Członkowie',
            accounting: 'Księgowość',
            rules: 'Zasady',
            displayedAs: 'Wyświetlane jako',
            plan: 'Plan',
            profile: 'Przegląd',
            bankAccount: 'Konto bankowe',
            connectBankAccount: 'Połącz konto bankowe',
            testTransactions: 'Przetestuj transakcje',
            issueAndManageCards: 'Wydawaj i zarządzaj kartami',
            reconcileCards: 'Uzgodnij karty',
            selected: () => ({
                one: '1 wybrano',
                other: (count: number) => `${count} wybrano`,
            }),
            settlementFrequency: 'Częstotliwość rozliczeń',
            setAsDefault: 'Ustaw jako domyślne miejsce pracy',
            defaultNote: `Paragony wysłane na ${CONST.EMAIL.RECEIPTS} pojawią się w tym obszarze roboczym.`,
            deleteConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą?',
            deleteWithCardsConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą? Spowoduje to usunięcie wszystkich kanałów kart i przypisanych kart.',
            unavailable: 'Niedostępna przestrzeń robocza',
            memberNotFound: 'Nie znaleziono członka. Aby zaprosić nowego członka do przestrzeni roboczej, użyj przycisku zaproszenia powyżej.',
            notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego miejsca pracy, poproś właściciela miejsca pracy o dodanie Cię jako członka. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Przejdź do przestrzeni roboczej',
            goToWorkspaces: 'Przejdź do przestrzeni roboczych',
            clearFilter: 'Wyczyść filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'Właściciel',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz być online, aby zobaczyć członków tego miejsca pracy.',
            moreFeatures: 'Więcej funkcji',
            requested: 'Żądane',
            distanceRates: 'Stawki za odległość',
            defaultDescription: 'Jedno miejsce na wszystkie Twoje paragony i wydatki.',
            descriptionHint: 'Udostępnij informacje o tej przestrzeni roboczej wszystkim członkom.',
            welcomeNote: 'Proszę użyć Expensify do przesyłania paragonów do zwrotu kosztów, dziękuję!',
            subscription: 'Subskrypcja',
            markAsEntered: 'Oznacz jako wprowadzone ręcznie',
            markAsExported: 'Oznacz jako wyeksportowane',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Eksportuj do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
            lineItemLevel: 'Poziom pozycji linii',
            reportLevel: 'Poziom raportu',
            topLevel: 'Najwyższy poziom',
            appliedOnExport: 'Nie zaimportowane do Expensify, zastosowane przy eksporcie',
            shareNote: {
                header: 'Udostępnij swoje miejsce pracy innym członkom',
                content: {
                    firstPart:
                        'Udostępnij ten kod QR lub skopiuj poniższy link, aby ułatwić członkom żądanie dostępu do Twojego miejsca pracy. Wszystkie prośby o dołączenie do miejsca pracy pojawią się w',
                    secondPart: 'pokój do Twojej recenzji.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Połącz z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Utwórz nowe połączenie',
            reuseExistingConnection: 'Ponownie użyj istniejące połączenie',
            existingConnections: 'Istniejące połączenia',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Ponieważ wcześniej połączyłeś się z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, możesz wybrać ponowne użycie istniejącego połączenia lub utworzyć nowe.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Ostatnia synchronizacja ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Nie można połączyć się z ${connectionName} z powodu błędu uwierzytelniania.`,
            learnMore: 'Dowiedz się więcej.',
            memberAlternateText: 'Członkowie mogą składać i zatwierdzać raporty.',
            adminAlternateText: 'Administratorzy mają pełny dostęp do edycji wszystkich raportów i ustawień przestrzeni roboczej.',
            auditorAlternateText: 'Audytorzy mogą przeglądać i komentować raporty.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Audytor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Członek';
                    default:
                        return 'Członek';
                }
            },
            frequency: {
                manual: 'Ręcznie',
                instant: 'Natychmiastowy',
                immediate: 'Codziennie',
                trip: 'Według podróży',
                weekly: 'Cotygodniowo',
                semimonthly: 'Dwa razy w miesiącu',
                monthly: 'Miesięczny',
            },
            planType: 'Typ planu',
            submitExpense: 'Prześlij swoje wydatki poniżej:',
            defaultCategory: 'Domyślna kategoria',
            viewTransactions: 'Wyświetl transakcje',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Wydatki ${displayName}`,
        },
        perDiem: {
            subtitle: 'Ustaw stawki diety, aby kontrolować dzienne wydatki pracowników.',
            amount: 'Kwota',
            deleteRates: () => ({
                one: 'Usuń stawkę',
                other: 'Usuń stawki',
            }),
            deletePerDiemRate: 'Usuń stawkę diety',
            findPerDiemRate: 'Znajdź stawkę diety',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki dzienne, aby kontrolować codzienne wydatki pracowników. Importuj stawki z arkusza kalkulacyjnego, aby rozpocząć.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Stawka o wartości ${rate} już istnieje`,
            },
            importPerDiemRates: 'Importuj stawki diety',
            editPerDiemRate: 'Edytuj stawkę diety',
            editPerDiemRates: 'Edytuj stawki diet',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Aktualizacja tego miejsca docelowego zmieni je dla wszystkich substawek diety ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Aktualizacja tej waluty zmieni ją dla wszystkich substawek diet ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacz czeki jako „wydrukuj później”',
            exportDescription: 'Skonfiguruj, jak dane z Expensify są eksportowane do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje z karty Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie opublikować wpisy w dzienniku.',
            accountsPayable: 'Zobowiązania płatnicze',
            accountsPayableDescription: 'Wybierz, gdzie utworzyć rachunki dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport został wyeksportowany do QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                },
            },
            exportCheckDescription: 'Utworzymy szczegółowy czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy wpis do dziennika dla każdego raportu Expensify i opublikujemy go na poniższym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
            deepDiveExpensifyCard: 'Transakcje z karty Expensify będą automatycznie eksportowane do "Konta Zobowiązań Karty Expensify" utworzonego z',
            deepDiveExpensifyCardIntegration: 'nasza integracja.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop nie obsługuje podatków przy eksportach zapisów księgowych. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wpis do dziennika',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Utworzymy szczegółowy czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy na transakcji kartą kredytową do odpowiadających jej dostawców w QuickBooks. Jeśli nie istnieją żadni dostawcy, utworzymy dostawcę "Credit Card Misc." do powiązania.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, aby zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wybierz, skąd wysyłać czeki.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Desktop i ponownie zsynchronizuj połączenie.',
            qbdSetup: 'Konfiguracja QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nie można połączyć się z tego urządzenia',
                body1: 'Będziesz musiał skonfigurować to połączenie z komputera, który hostuje plik firmy QuickBooks Desktop.',
                body2: 'Po połączeniu będziesz mógł synchronizować i eksportować z dowolnego miejsca.',
            },
            setupPage: {
                title: 'Otwórz ten link, aby się połączyć',
                body: 'Aby zakończyć konfigurację, otwórz poniższy link na komputerze, na którym działa QuickBooks Desktop.',
                setupErrorTitle: 'Coś poszło nie tak',
                setupErrorBody1: 'Połączenie z QuickBooks Desktop nie działa w tej chwili. Proszę spróbować ponownie później lub',
                setupErrorBody2: 'jeśli problem będzie się powtarzał.',
                setupErrorBodyContactConcierge: 'skontaktuj się z Concierge',
            },
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Desktop do Expensify.',
            classes: 'Klasy',
            items: 'Przedmioty',
            customers: 'Klienci/projekty',
            exportCompanyCardsDescription: 'Ustaw, jak zakupy kartą firmową eksportują się do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            accountsDescription: 'Twój plan kont QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz, jak obsługiwać klasy QuickBooks Desktop w Expensify.',
            tagsDisplayedAsDescription: 'Poziom pozycji linii',
            reportFieldsDisplayedAsDescription: 'Poziom raportu',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty QuickBooks Desktop w Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Desktop każdego dnia.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawców w QuickBooks Desktop, jeśli jeszcze nie istnieją.',
            },
            itemsDescription: 'Wybierz, jak obsługiwać elementy QuickBooks Desktop w Expensify.',
        },
        qbo: {
            connectedTo: 'Połączono z',
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Online do Expensify.',
            classes: 'Klasy',
            locations: 'Lokalizacje',
            customers: 'Klienci/projekty',
            accountsDescription: 'Twój plan kont QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz, jak obsługiwać klasy QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz, jak obsługiwać lokalizacje QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz, jak obsługiwać podatki QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online nie obsługuje lokalizacji na poziomie linii dla czeków lub faktur od dostawców. Jeśli chcesz mieć lokalizacje na poziomie linii, upewnij się, że używasz zapisów księgowych i wydatków na kartach kredytowych/debetowych.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online nie obsługuje podatków w zapisach księgowych. Proszę zmienić opcję eksportu na fakturę od dostawcy lub czek.',
            exportDescription: 'Skonfiguruj, jak dane Expensify są eksportowane do QuickBooks Online.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje z karty Expensify jako',
            deepDiveExpensifyCard: 'Transakcje z karty Expensify będą automatycznie eksportowane do "Konta Zobowiązań Karty Expensify" utworzonego z',
            deepDiveExpensifyCardIntegration: 'nasza integracja.',
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data eksportu raportu do QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                },
            },
            receivable: 'Należności', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiwum należności', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Użyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw sposób eksportowania zakupów kartą firmową do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy szczegółowy czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy wpis do dziennika dla każdego raportu Expensify i opublikujemy go na poniższym koncie.',
            exportVendorBillDescription:
                'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie opublikować wpisy w dzienniku.',
            accountsPayable: 'Zobowiązania płatnicze',
            accountsPayableDescription: 'Wybierz, gdzie utworzyć rachunki dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online nie obsługuje lokalizacji w eksportach faktur od dostawców. Ponieważ masz włączone lokalizacje w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online nie obsługuje podatków przy eksportach zapisów księgowych. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Online każdego dnia.',
                inviteEmployees: 'Zaproś pracowników',
                inviteEmployeesDescription: 'Importuj rekordy pracowników z QuickBooks Online i zaproś pracowników do tego miejsca pracy.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription:
                    'Expensify automatycznie utworzy dostawców w QuickBooks Online, jeśli jeszcze nie istnieją, oraz automatycznie utworzy klientów podczas eksportowania faktur.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie QuickBooks Online.',
                qboBillPaymentAccount: 'Konto do płatności rachunków QuickBooks',
                qboInvoiceCollectionAccount: 'Konto do zbierania faktur QuickBooks',
                accountSelectDescription: 'Wybierz, skąd chcesz opłacić rachunki, a my utworzymy płatność w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my utworzymy płatność w QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Karta debetowa',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Karta kredytowa',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Faktura od dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wpis do dziennika',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Sprawdź',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Automatycznie dopasujemy nazwę sprzedawcy na transakcji kartą debetową do odpowiadających jej dostawców w QuickBooks. Jeśli nie istnieją żadni dostawcy, utworzymy dostawcę 'Debit Card Misc.' do powiązania.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Automatycznie dopasujemy nazwę sprzedawcy na transakcji kartą kredytową do odpowiadających jej dostawców w QuickBooks. Jeśli nie istnieją żadni dostawcy, utworzymy dostawcę "Credit Card Misc." do powiązania.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji z karty debetowej.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wybierz miejsce eksportu transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wybierz dostawcę, aby zastosować do wszystkich transakcji kartą kredytową.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Czeki są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wybierz prawidłowe konto do eksportu faktury dostawcy',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wybierz prawidłowe konto do eksportu zapisów księgowych',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wybierz prawidłowe konto do eksportu czeków',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Aby użyć eksportu faktur od dostawców, skonfiguruj konto zobowiązań w QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Aby używać eksportu zapisów księgowych, skonfiguruj konto księgowe w QuickBooks Online.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Aby użyć eksportu czeków, skonfiguruj konto bankowe w QuickBooks Online.',
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i ponownie zsynchronizuj połączenie.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy eksportować wydatki:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Rozliczenia międzyokresowe',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                },
            },
        },
        workspaceList: {
            joinNow: 'Dołącz teraz',
            askToJoin: 'Poproś o dołączenie',
        },
        xero: {
            organization: 'Organizacja Xero',
            organizationDescription: 'Wybierz organizację Xero, z której chcesz zaimportować dane.',
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z Xero do Expensify.',
            accountsDescription: 'Twój plan kont Xero zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            trackingCategories: 'Kategorie śledzenia',
            trackingCategoriesDescription: 'Wybierz, jak obsługiwać kategorie śledzenia Xero w Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapuj Xero ${categoryName} do`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Wybierz, gdzie zmapować ${categoryName} podczas eksportu do Xero.`,
            customers: 'Obciąż ponownie klientów',
            customersDescription:
                'Wybierz, czy ponownie obciążyć klientów w Expensify. Twoje kontakty klientów Xero mogą być oznaczane na wydatkach i zostaną wyeksportowane do Xero jako faktura sprzedaży.',
            taxesDescription: 'Wybierz, jak obsługiwać podatki Xero w Expensify.',
            notImported: 'Nie zaimportowano',
            notConfigured: 'Nieskonfigurowane',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Domyślny kontakt Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tagi',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Pola raportu',
            },
            exportDescription: 'Skonfiguruj, jak dane z Expensify są eksportowane do Xero.',
            purchaseBill: 'Zakup faktury',
            exportDeepDiveCompanyCard:
                'Wyeksportowane wydatki zostaną zaksięgowane jako transakcje bankowe na poniższym koncie bankowym Xero, a daty transakcji będą zgodne z datami na wyciągu bankowym.',
            bankTransactions: 'Transakcje bankowe',
            xeroBankAccount: 'Konto bankowe Xero',
            xeroBankAccountDescription: 'Wybierz, gdzie wydatki będą księgowane jako transakcje bankowe.',
            exportExpensesDescription: 'Raporty zostaną wyeksportowane jako faktura zakupu z datą i statusem wybranym poniżej.',
            purchaseBillDate: 'Data zakupu faktury',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzedaży',
            exportInvoicesDescription: 'Faktury sprzedażowe zawsze wyświetlają datę, w której faktura została wysłana.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Xero każdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription: 'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Xero.',
                xeroBillPaymentAccount: 'Konto do płatności rachunków Xero',
                xeroInvoiceCollectionAccount: 'Konto do zbierania faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, skąd chcesz opłacić rachunki, a my utworzymy płatność w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my stworzymy płatność w Xero.',
            },
            exportDate: {
                label: 'Data zakupu faktury',
                description: 'Użyj tej daty podczas eksportowania raportów do Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport został wyeksportowany do Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status rachunku zakupu',
                description: 'Użyj tego statusu podczas eksportowania rachunków zakupu do Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Szkic',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Oczekiwanie na zatwierdzenie',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Oczekiwanie na płatność',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Proszę dodać konto w Xero i ponownie zsynchronizować połączenie.',
        },
        sageIntacct: {
            preferredExporter: 'Preferowany eksporter',
            taxSolution: 'Rozwiązanie podatkowe',
            notConfigured: 'Nieskonfigurowane',
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport został wyeksportowany do Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Raporty wydatków',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faktury od dostawców',
                },
            },
            nonReimbursableExpenses: {
                description: 'Ustaw, jak zakupy kartą firmową są eksportowane do Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Karty kredytowe',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faktury od dostawców',
                },
            },
            creditCardAccount: 'Konto karty kredytowej',
            defaultVendor: 'Domyślny dostawca',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Ustaw domyślnego dostawcę, który będzie stosowany do ${isReimbursable ? '' : 'non-'}wydatków podlegających zwrotowi, które nie mają dopasowanego dostawcy w Sage Intacct.`,
            exportDescription: 'Skonfiguruj, jak dane z Expensify są eksportowane do Sage Intacct.',
            exportPreferredExporterNote:
                'Preferowany eksporter może być dowolnym administratorem przestrzeni roboczej, ale musi być również administratorem domeny, jeśli ustawisz różne konta eksportu dla indywidualnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy raporty do eksportu na swoim koncie.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: `Proszę dodać konto w Sage Intacct i ponownie zsynchronizować połączenie.`,
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Sage Intacct każdego dnia.',
            inviteEmployees: 'Zaproś pracowników',
            inviteEmployeesDescription:
                'Importuj dane pracowników Sage Intacct i zaproś pracowników do tego miejsca pracy. Twój przepływ zatwierdzania domyślnie będzie ustawiony na zatwierdzanie przez menedżera i może być dalej konfigurowany na stronie Członkowie.',
            syncReimbursedReports: 'Synchronizuj zrefundowane raporty',
            syncReimbursedReportsDescription:
                'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Sage Intacct.',
            paymentAccount: 'Konto płatnicze Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Spółka zależna',
            subsidiarySelectDescription: 'Wybierz jednostkę zależną w NetSuite, z której chcesz zaimportować dane.',
            exportDescription: 'Skonfiguruj, jak dane z Expensify eksportują się do NetSuite.',
            exportInvoices: 'Eksportuj faktury do',
            journalEntriesTaxPostingAccount: 'Konto księgowania podatku w dzienniku księgowań',
            journalEntriesProvTaxPostingAccount: 'Konta księgowania podatku prowincjonalnego w dziennikach księgowych',
            foreignCurrencyAmount: 'Eksportuj kwotę w walucie obcej',
            exportToNextOpenPeriod: 'Eksportuj do następnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto księgowania niepodlegające zwrotowi',
            reimbursableJournalPostingAccount: 'Konto księgowania zwrotów',
            journalPostingPreference: {
                label: 'Preferencje księgowania zapisów w dzienniku',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Pojedynczy, wyszczególniony wpis dla każdego raportu',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Pojedynczy wpis dla każdego wydatku',
                },
            },
            invoiceItem: {
                label: 'Pozycja faktury',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Utwórz dla mnie jeden',
                        description: 'Utworzymy dla Ciebie "pozycję faktury Expensify" podczas eksportu (jeśli jeszcze nie istnieje).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Wybierz istniejące',
                        description: 'Połączymy faktury z Expensify z wybranym poniżej elementem.',
                    },
                },
            },
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data eksportu',
                        description: 'Data eksportu raportu do NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Raporty wydatków',
                        reimbursableDescription: 'Wydatki z własnej kieszeni zostaną wyeksportowane jako raporty wydatków do NetSuite.',
                        nonReimbursableDescription: 'Wydatki z kart firmowych będą eksportowane jako raporty wydatków do NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Faktury od dostawców',
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
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z NetSuite każdego dnia.',
                reimbursedReportsDescription:
                    'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na koncie NetSuite poniżej.',
                reimbursementsAccount: 'Konto zwrotów',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, którego użyjesz do zwrotów, a my utworzymy powiązaną płatność w NetSuite.',
                collectionsAccount: 'Konto windykacyjne',
                collectionsAccountDescription: 'Po oznaczeniu faktury jako opłaconej w Expensify i wyeksportowaniu do NetSuite, pojawi się ona na koncie poniżej.',
                approvalAccount: 'Konto zatwierdzania A/P',
                approvalAccountDescription:
                    'Wybierz konto, na podstawie którego transakcje będą zatwierdzane w NetSuite. Jeśli synchronizujesz raporty zwrócone, to również jest to konto, na które będą tworzone płatności rachunków.',
                defaultApprovalAccount: 'NetSuite domyślny',
                inviteEmployees: 'Zaproś pracowników i ustaw zatwierdzenia',
                inviteEmployeesDescription:
                    'Importuj rekordy pracowników NetSuite i zaproś pracowników do tego miejsca pracy. Twój przepływ zatwierdzania domyślnie będzie ustawiony na zatwierdzanie przez menedżera i można go dalej konfigurować na stronie *Członkowie*.',
                autoCreateEntities: 'Automatyczne tworzenie pracowników/dostawców',
                enableCategories: 'Włącz nowo zaimportowane kategorie',
                customFormID: 'Niestandardowy identyfikator formularza',
                customFormIDDescription:
                    'Domyślnie Expensify utworzy wpisy, używając preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie, możesz wyznaczyć konkretny formularz transakcji do użycia.',
                customFormIDReimbursable: 'Wydatek z własnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek na firmową kartę',
                exportReportsTo: {
                    label: 'Poziom zatwierdzenia raportu wydatków',
                    description:
                        'Po zatwierdzeniu raportu wydatków w Expensify i wyeksportowaniu go do NetSuite, można ustawić dodatkowy poziom zatwierdzenia w NetSuite przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Domyślne preferencje NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Tylko zatwierdzone przez przełożonego',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Tylko zatwierdzone przez księgowość',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor i księgowość zatwierdzili',
                    },
                },
                accountingMethods: {
                    label: 'Kiedy eksportować',
                    description: 'Wybierz, kiedy eksportować wydatki:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Rozliczenia międzyokresowe',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Gotówka',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu.',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Poziom zatwierdzenia faktury dostawcy',
                    description:
                        'Po zatwierdzeniu faktury dostawcy w Expensify i wyeksportowaniu jej do NetSuite, możesz ustawić dodatkowy poziom zatwierdzenia w NetSuite przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Domyślne preferencje NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zatwierdzono do publikacji',
                    },
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzenia wpisu w dzienniku',
                    description:
                        'Po zatwierdzeniu wpisu do dziennika w Expensify i wyeksportowaniu go do NetSuite, można ustawić dodatkowy poziom zatwierdzenia w NetSuite przed zaksięgowaniem.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Domyślne preferencje NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Oczekuje na zatwierdzenie',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zatwierdzono do publikacji',
                    },
                },
                error: {
                    customFormID: 'Proszę wprowadzić prawidłowy numeryczny identyfikator formularza niestandardowego',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Proszę dodać konto w NetSuite i ponownie zsynchronizować połączenie.',
            noVendorsFound: 'Nie znaleziono dostawców',
            noVendorsFoundDescription: 'Proszę dodać dostawców w NetSuite i ponownie zsynchronizować połączenie.',
            noItemsFound: 'Nie znaleziono pozycji faktury',
            noItemsFoundDescription: 'Proszę dodać pozycje faktury w NetSuite i ponownie zsynchronizować połączenie.',
            noSubsidiariesFound: 'Nie znaleziono spółek zależnych',
            noSubsidiariesFoundDescription: 'Proszę dodać spółkę zależną w NetSuite i ponownie zsynchronizować połączenie.',
            tokenInput: {
                title: 'Konfiguracja NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Zainstaluj pakiet Expensify',
                        description: 'W NetSuite, przejdź do *Customization > SuiteBundler > Search & Install Bundles* > wyszukaj "Expensify" > zainstaluj pakiet.',
                    },
                    enableTokenAuthentication: {
                        title: 'Włącz uwierzytelnianie oparte na tokenach',
                        description: 'W NetSuite przejdź do *Setup > Company > Enable Features > SuiteCloud* > włącz *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Włącz usługi sieciowe SOAP',
                        description: 'W NetSuite, przejdź do *Setup > Company > Enable Features > SuiteCloud* > włącz *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Utwórz token dostępu',
                        description:
                            'W NetSuite przejdź do *Setup > Users/Roles > Access Tokens* > utwórz token dostępu dla aplikacji "Expensify" i roli "Expensify Integration" lub "Administrator".\n\n*Ważne:* Upewnij się, że zapiszesz *Token ID* i *Token Secret* z tego kroku. Będziesz ich potrzebować w następnym kroku.',
                    },
                    enterCredentials: {
                        title: 'Wprowadź swoje dane logowania do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'ID tokena',
                            netSuiteTokenSecret: 'Sekret tokena',
                        },
                        netSuiteAccountIDDescription: 'W NetSuite przejdź do *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Kategorie wydatków',
                expenseCategoriesDescription: 'Twoje kategorie wydatków z NetSuite zostaną zaimportowane do Expensify jako kategorie.',
                crossSubsidiaryCustomers: 'Klienci/projekty między spółkami zależnymi',
                importFields: {
                    departments: {
                        title: 'Działy',
                        subtitle: 'Wybierz, jak obsługiwać *działy* NetSuite w Expensify.',
                    },
                    classes: {
                        title: 'Klasy',
                        subtitle: 'Wybierz, jak obsługiwać *klasy* w Expensify.',
                    },
                    locations: {
                        title: 'Lokalizacje',
                        subtitle: 'Wybierz, jak obsługiwać *lokalizacje* w Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Klienci/projekty',
                    subtitle: 'Wybierz, jak obsługiwać *klientów* i *projekty* NetSuite w Expensify.',
                    importCustomers: 'Importuj klientów',
                    importJobs: 'Importuj projekty',
                    customers: 'klienci',
                    jobs: 'projekty',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('i')}, ${importType}`,
                },
                importTaxDescription: 'Importuj grupy podatkowe z NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wybierz opcję poniżej:',
                    label: ({importedTypes}: ImportedTypesParams) => `Imported as ${importedTypes.join('i')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Proszę wprowadzić ${fieldName}`,
                    customSegments: {
                        title: 'Niestandardowe segmenty/rekordy',
                        addText: 'Dodaj niestandardowy segment/rekord',
                        recordTitle: 'Niestandardowy segment/rekord',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'dotyczące konfigurowania niestandardowych segmentów/rekordów.',
                        emptyTitle: 'Dodaj niestandardowy segment lub niestandardowy rekord',
                        fields: {
                            segmentName: 'Imię',
                            internalID: 'Identyfikator wewnętrzny',
                            scriptID: 'Script ID',
                            customRecordScriptID: 'ID kolumny transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardowy segment/rekord',
                        removePrompt: 'Czy na pewno chcesz usunąć ten niestandardowy segment/rekord?',
                        addForm: {
                            customSegmentName: 'niestandardowa nazwa segmentu',
                            customRecordName: 'niestandardowa nazwa rekordu',
                            segmentTitle: 'Segment niestandardowy',
                            customSegmentAddTitle: 'Dodaj niestandardowy segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Niestandardowy rekord',
                            segmentRecordType: 'Czy chcesz dodać niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa segmentu niestandardowego?',
                            customRecordNameTitle: 'Jaka jest nazwa niestandardowego rekordu?',
                            customSegmentNameFooter: `Możesz znaleźć niestandardowe nazwy segmentów w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Możesz znaleźć niestandardowe nazwy rekordów w NetSuite, wpisując "Transaction Column Field" w globalnym wyszukiwaniu.\n\n_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Jaki jest wewnętrzny ID?',
                            customSegmentInternalIDFooter: `Najpierw upewnij się, że włączyłeś wewnętrzne identyfikatory w NetSuite w sekcji *Home > Set Preferences > Show Internal ID.*\n\nMożesz znaleźć wewnętrzne identyfikatory segmentów niestandardowych w NetSuite w sekcji:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Kliknij w segment niestandardowy.\n3. Kliknij hiperłącze obok *Custom Record Type*.\n4. Znajdź wewnętrzny identyfikator w tabeli na dole.\n\n_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Możesz znaleźć wewnętrzne identyfikatory rekordów niestandardowych w NetSuite, wykonując następujące kroki:\n\n1. Wpisz "Transaction Line Fields" w globalnym wyszukiwaniu.\n2. Kliknij w rekord niestandardowy.\n3. Znajdź wewnętrzny identyfikator po lewej stronie.\n\n_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Jaki jest identyfikator skryptu?',
                            customSegmentScriptIDFooter: `Możesz znaleźć niestandardowe identyfikatory skryptów segmentów w NetSuite w:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Kliknij w niestandardowy segment.\n3. Kliknij kartę *Application and Sourcing* na dole, a następnie:\n    a. Jeśli chcesz wyświetlić niestandardowy segment jako *tag* (na poziomie pozycji) w Expensify, kliknij podkartę *Transaction Columns* i użyj *Field ID*.\n    b. Jeśli chcesz wyświetlić niestandardowy segment jako *report field* (na poziomie raportu) w Expensify, kliknij podkartę *Transactions* i użyj *Field ID*.\n\n_Dla bardziej szczegółowych instrukcji, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Jaki jest identyfikator kolumny transakcji?',
                            customRecordScriptIDFooter: `Możesz znaleźć niestandardowe identyfikatory skryptów rekordów w NetSuite w następujący sposób:\n\n1. Wprowadź "Transaction Line Fields" w globalnym wyszukiwaniu.\n2. Kliknij w niestandardowy rekord.\n3. Znajdź identyfikator skryptu po lewej stronie.\n\n_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Jak ten niestandardowy segment powinien być wyświetlany w Expensify?',
                            customRecordMappingTitle: 'Jak ten niestandardowy rekord powinien być wyświetlany w Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Niestandardowy segment/rekord z tym ${fieldName?.toLowerCase()} już istnieje`,
                        },
                    },
                    customLists: {
                        title: 'Listy niestandardowe',
                        addText: 'Dodaj listę niestandardową',
                        recordTitle: 'Lista niestandardowa',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'w konfigurowaniu list niestandardowych.',
                        emptyTitle: 'Dodaj niestandardową listę',
                        fields: {
                            listName: 'Imię',
                            internalID: 'Identyfikator wewnętrzny',
                            transactionFieldID: 'ID pola transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardową listę',
                        removePrompt: 'Czy na pewno chcesz usunąć tę niestandardową listę?',
                        addForm: {
                            listNameTitle: 'Wybierz listę niestandardową',
                            transactionFieldIDTitle: 'Jaki jest identyfikator pola transakcji?',
                            transactionFieldIDFooter: `Możesz znaleźć identyfikatory pól transakcji w NetSuite, wykonując następujące kroki:\n\n1. Wpisz "Transaction Line Fields" w globalnym wyszukiwaniu.\n2. Kliknij na niestandardową listę.\n3. Znajdź identyfikator pola transakcji po lewej stronie.\n\n_Aby uzyskać bardziej szczegółowe instrukcje, [odwiedź naszą stronę pomocy](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Jak powinna być wyświetlana ta niestandardowa lista w Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Lista niestandardowa z tym identyfikatorem pola transakcji już istnieje`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Domyślne ustawienia pracownika NetSuite',
                        description: 'Nie zaimportowane do Expensify, zastosowane przy eksporcie',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Jeśli używasz ${importField} w NetSuite, zastosujemy domyślną wartość ustawioną w rekordzie pracownika podczas eksportu do Raportu Wydatków lub Księgowania.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tagi',
                        description: 'Poziom pozycji linii',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} będzie można wybrać dla każdego indywidualnego wydatku w raporcie pracownika.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Pola raportu',
                        description: 'Poziom raportu',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} wybór będzie dotyczył wszystkich wydatków w raporcie pracownika.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Konfiguracja Sage Intacct',
            prerequisitesTitle: 'Zanim się połączysz...',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Postępuj zgodnie z krokami w naszych instrukcjach Jak połączyć się z Sage Intacct.',
            enterCredentials: 'Wprowadź swoje dane logowania do Sage Intacct',
            entity: 'Encja',
            employeeDefault: 'Domyślne ustawienia pracownika Sage Intacct',
            employeeDefaultDescription: 'Domyślny dział pracownika zostanie zastosowany do jego wydatków w Sage Intacct, jeśli taki istnieje.',
            displayedAsTagDescription: 'Dział będzie można wybrać dla każdego indywidualnego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wybór działu będzie dotyczył wszystkich wydatków w raporcie pracownika.',
            toggleImportTitleFirstPart: 'Wybierz, jak obsługiwać Sage Intacct',
            toggleImportTitleSecondPart: 'w Expensify.',
            expenseTypes: 'Typy wydatków',
            expenseTypesDescription: 'Twoje typy wydatków Sage Intacct zostaną zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Twój plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Importuj stawkę podatku od zakupu z Sage Intacct.',
            userDefinedDimensions: 'Wymiary zdefiniowane przez użytkownika',
            addUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie już istnieje.',
            removeDimension: 'Usuń zdefiniowany przez użytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usunąć tę zdefiniowaną przez użytkownika wymiar?',
            userDefinedDimension: 'Zdefiniowany przez użytkownika wymiar',
            addAUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            detailedInstructionsLink: 'Zobacz szczegółowe instrukcje',
            detailedInstructionsRestOfSentence: 'na dodawaniu zdefiniowanych przez użytkownika wymiarów.',
            userDimensionsAdded: () => ({
                one: '1 UDD dodany',
                other: (count: number) => `Dodano ${count} UDDs`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'działy';
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
                    cdf: 'Karty Komercyjne Mastercard',
                    vcf: 'Karty Komercyjne Visa',
                    stripe: 'Stripe Cards',
                },
                yourCardProvider: `Kto jest dostawcą Twojej karty?`,
                whoIsYourBankAccount: 'Kim jest Twój bank?',
                whereIsYourBankLocated: 'Gdzie znajduje się Twój bank?',
                howDoYouWantToConnect: 'Jak chcesz połączyć się ze swoim bankiem?',
                learnMoreAboutOptions: {
                    text: 'Dowiedz się więcej na ten temat',
                    linkText: 'opcje.',
                },
                commercialFeedDetails: 'Wymaga konfiguracji z Twoim bankiem. Zazwyczaj jest używane przez większe firmy i często jest najlepszą opcją, jeśli się kwalifikujesz.',
                commercialFeedPlaidDetails: `Wymaga konfiguracji z Twoim bankiem, ale poprowadzimy Cię. Zazwyczaj jest to ograniczone do większych firm.`,
                directFeedDetails: 'Najprostsze podejście. Połącz się od razu, używając swoich głównych poświadczeń. Ta metoda jest najczęściej stosowana.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Włącz swój kanał ${provider}`,
                    heading: 'Mamy bezpośrednią integrację z wystawcą Twojej karty i możemy szybko i dokładnie zaimportować dane transakcji do Expensify.\n\nAby rozpocząć, wystarczy:',
                    visa: 'Mamy globalne integracje z Visa, chociaż kwalifikowalność zależy od banku i programu karty.\n\nAby rozpocząć, wystarczy:',
                    mastercard: 'Mamy globalne integracje z Mastercard, jednak dostępność zależy od banku i programu karty.\n\nAby rozpocząć, wystarczy:',
                    vcf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby uzyskać szczegółowe instrukcje dotyczące konfiguracji kart Visa Commercial.\n\n2. [Skontaktuj się z bankiem](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), aby zweryfikować, czy obsługują oni komercyjny kanał dla Twojego programu, i poproś o jego włączenie.\n\n3. *Gdy kanał zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    gl1025: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), aby dowiedzieć się, czy American Express może włączyć komercyjny kanał dla Twojego programu.\n\n2. Gdy kanał zostanie włączony, Amex wyśle Ci list produkcyjny.\n\n3. *Gdy już masz informacje o kanale, przejdź do następnego ekranu.*`,
                    cdf: `1. Odwiedź [ten artykuł pomocy](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) po szczegółowe instrukcje dotyczące konfiguracji kart Mastercard Commercial Cards.\n\n2. [Skontaktuj się ze swoim bankiem](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), aby zweryfikować, czy obsługują oni komercyjny kanał dla Twojego programu, i poproś ich o jego włączenie.\n\n3. *Gdy kanał zostanie włączony i będziesz mieć jego szczegóły, przejdź do następnego ekranu.*`,
                    stripe: `1. Odwiedź Dashboard Stripe i przejdź do [Ustawienia](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. W sekcji Integracje Produktów kliknij Włącz obok Expensify.\n\n3. Gdy kanał zostanie włączony, kliknij Prześlij poniżej, a my zajmiemy się jego dodaniem.`,
                },
                whatBankIssuesCard: 'Jaki bank wydaje te karty?',
                enterNameOfBank: 'Wprowadź nazwę banku',
                feedDetails: {
                    vcf: {
                        title: 'Jakie są szczegóły dotyczące połączenia z Visa?',
                        processorLabel: 'ID procesora',
                        bankLabel: 'Identyfikator instytucji finansowej (banku)',
                        companyLabel: 'ID firmy',
                        helpLabel: 'Gdzie mogę znaleźć te identyfikatory?',
                    },
                    gl1025: {
                        title: `Jak nazywa się plik dostawy Amex?`,
                        fileNameLabel: 'Nazwa pliku dostawy',
                        helpLabel: 'Gdzie znajdę nazwę pliku dostawy?',
                    },
                    cdf: {
                        title: `Jaki jest identyfikator dystrybucji Mastercard?`,
                        distributionLabel: 'ID dystrybucji',
                        helpLabel: 'Gdzie mogę znaleźć identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz to, jeśli na przedniej stronie Twoich kart jest napis „Corporate”',
                amexBusiness: 'Wybierz to, jeśli na przodzie twoich kart jest napis „Business”',
                amexPersonal: 'Wybierz tę opcję, jeśli Twoje karty są osobiste',
                error: {
                    pleaseSelectProvider: 'Proszę wybrać dostawcę karty przed kontynuowaniem.',
                    pleaseSelectBankAccount: 'Proszę wybrać konto bankowe przed kontynuowaniem',
                    pleaseSelectBank: 'Proszę wybrać bank przed kontynuowaniem',
                    pleaseSelectCountry: 'Proszę wybrać kraj przed kontynuowaniem',
                    pleaseSelectFeedType: 'Proszę wybrać typ kanału przed kontynuowaniem.',
                },
            },
            assignCard: 'Przypisz kartę',
            findCard: 'Znajdź kartę',
            cardNumber: 'Numer karty',
            commercialFeed: 'Komercyjny kanał',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `karty ${feedName}`,
            directFeed: 'Bezpośredni kanał',
            whoNeedsCardAssigned: 'Kto potrzebuje przypisanej karty?',
            chooseCard: 'Wybierz kartę',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Wybierz kartę dla ${assignee} z kanału kart ${feed}.`,
            noActiveCards: 'Brak aktywnych kart w tym kanale',
            somethingMightBeBroken: 'Albo coś może być zepsute. Tak czy inaczej, jeśli masz jakieś pytania, po prostu',
            contactConcierge: 'skontaktuj się z Concierge',
            chooseTransactionStartDate: 'Wybierz datę rozpoczęcia transakcji',
            startDateDescription: 'Zaimportujemy wszystkie transakcje od tej daty. Jeśli nie określono daty, sięgniemy tak daleko wstecz, jak pozwala na to Twój bank.',
            fromTheBeginning: 'Od początku',
            customStartDate: 'Niestandardowa data rozpoczęcia',
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
            confirmationDescription: 'Natychmiast rozpoczniemy importowanie transakcji.',
            cardholder: 'Posiadacz karty',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionErrorFirstPart: `Połączenie z kanałem karty jest przerwane. Proszę`,
            brokenConnectionErrorLink: 'zaloguj się do swojego banku',
            brokenConnectionErrorSecondPart: 'abyśmy mogli ponownie nawiązać połączenie.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `przypisano ${assignee} ${link}! Zaimportowane transakcje pojawią się w tym czacie.`,
            companyCard: 'karta firmowa',
            chooseCardFeed: 'Wybierz kanał kart',
            ukRegulation:
                'Expensify, Inc. jest agentem Plaid Financial Ltd., autoryzowanej instytucji płatniczej regulowanej przez Financial Conduct Authority zgodnie z Payment Services Regulations 2017 (Numer referencyjny firmy: 804718). Plaid dostarcza Ci regulowane usługi informacyjne o rachunkach za pośrednictwem Expensify Limited jako swojego agenta.',
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarządzaj swoimi kartami Expensify',
            getStartedIssuing: 'Rozpocznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            verificationInProgress: 'Weryfikacja w toku...',
            verifyingTheDetails: 'Weryfikujemy kilka szczegółów. Concierge poinformuje Cię, gdy karty Expensify będą gotowe do wydania.',
            disclaimer:
                'The Expensify Visa® Commercial Card jest wydawana przez The Bancorp Bank, N.A., członka FDIC, na podstawie licencji Visa U.S.A. Inc. i może nie być akceptowana u wszystkich sprzedawców, którzy przyjmują karty Visa. Apple® oraz logo Apple® są znakami towarowymi Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem usługowym Apple Inc. Google Play oraz logo Google Play są znakami towarowymi Google LLC.',
            issueCard: 'Wydaj kartę',
            findCard: 'Znajdź kartę',
            newCard: 'Nowa karta',
            name: 'Imię',
            lastFour: 'Ostatnie 4',
            limit: 'Limit',
            currentBalance: 'Bieżące saldo',
            currentBalanceDescription: 'Bieżące saldo to suma wszystkich zaksięgowanych transakcji kartą Expensify, które miały miejsce od ostatniej daty rozliczenia.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo zostanie rozliczone w dniu ${settlementDate}`,
            settleBalance: 'Ureguluj saldo',
            cardLimit: 'Limit karty',
            remainingLimit: 'Pozostały limit',
            requestLimitIncrease: 'Zwiększenie limitu żądań',
            remainingLimitDescription:
                'Bierzemy pod uwagę szereg czynników przy obliczaniu Twojego pozostałego limitu: Twój staż jako klienta, informacje związane z działalnością gospodarczą, które podałeś podczas rejestracji, oraz dostępne środki na Twoim firmowym koncie bankowym. Twój pozostały limit może się zmieniać codziennie.',
            earnedCashback: 'Zwrot gotówki',
            earnedCashbackDescription: 'Saldo zwrotu gotówki opiera się na rozliczonych miesięcznych wydatkach na karcie Expensify w Twoim obszarze roboczym.',
            issueNewCard: 'Wydaj nową kartę',
            finishSetup: 'Zakończ konfigurację',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniejące firmowe konto bankowe, aby spłacić saldo karty Expensify, lub dodaj nowe konto bankowe.',
            accountEndingIn: 'Konto kończące się na',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto do spłaty salda na karcie Expensify.',
            settlementAccountInfoPt1: 'Upewnij się, że to konto pasuje do Twojego',
            settlementAccountInfoPt2: 'więc Ciągła Rekoncyliacja działa poprawnie.',
            reconciliationAccount: 'Konto uzgadniające',
            settlementFrequency: 'Częstotliwość rozliczeń',
            settlementFrequencyDescription: 'Wybierz, jak często będziesz spłacać saldo swojej karty Expensify.',
            settlementFrequencyInfo:
                'Jeśli chcesz przejść na miesięczne rozliczenie, musisz połączyć swoje konto bankowe za pomocą Plaid i mieć pozytywną historię salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesięczny',
            },
            cardDetails: 'Szczegóły karty',
            virtual: 'Wirtualny',
            physical: 'Fizyczny',
            deactivate: 'Dezaktywuj kartę',
            changeCardLimit: 'Zmień limit karty',
            changeLimit: 'Zmień limit',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane, dopóki nie zatwierdzisz więcej wydatków na karcie.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje będą odrzucane do następnego miesiąca.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Jeśli zmienisz limit tej karty na ${limit}, nowe transakcje zostaną odrzucone.`,
            changeCardLimitType: 'Zmień typ limitu karty',
            changeLimitType: 'Zmień typ limitu',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Jeśli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostaną odrzucone, ponieważ niezatwierdzony limit ${limit} został już osiągnięty.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Jeśli zmienisz typ limitu tej karty na Miesięczny, nowe transakcje zostaną odrzucone, ponieważ miesięczny limit ${limit} został już osiągnięty.`,
            addShippingDetails: 'Dodaj szczegóły wysyłki',
            issuedCard: ({assignee}: AssigneeParams) => `wydano ${assignee} kartę Expensify! Karta dotrze w ciągu 2-3 dni roboczych.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `wydano ${assignee} kartę Expensify! Karta zostanie wysłana, gdy zostaną dodane szczegóły wysyłki.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `wydano ${assignee} wirtualną ${link}! Karta może być używana od razu.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} dodał szczegóły wysyłki. Karta Expensify dotrze w ciągu 2-3 dni roboczych.`,
            verifyingHeader: 'Weryfikacja',
            bankAccountVerifiedHeader: 'Zweryfikowano konto bankowe',
            verifyingBankAccount: 'Weryfikacja konta bankowego...',
            verifyingBankAccountDescription: 'Proszę czekać, podczas gdy potwierdzamy, że to konto może być używane do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zweryfikowane!',
            bankAccountVerifiedDescription: 'Możesz teraz wydawać karty Expensify członkom swojego miejsca pracy.',
            oneMoreStep: 'Jeszcze jeden krok...',
            oneMoreStepDescription: 'Wygląda na to, że musimy ręcznie zweryfikować Twoje konto bankowe. Przejdź do Concierge, gdzie czekają na Ciebie instrukcje.',
            gotIt: 'Zrozumiałem.',
            goToConcierge: 'Przejdź do Concierge',
        },
        categories: {
            deleteCategories: 'Usuń kategorie',
            deleteCategoriesPrompt: 'Czy na pewno chcesz usunąć te kategorie?',
            deleteCategory: 'Usuń kategorię',
            deleteCategoryPrompt: 'Czy na pewno chcesz usunąć tę kategorię?',
            disableCategories: 'Wyłącz kategorie',
            disableCategory: 'Wyłącz kategorię',
            enableCategories: 'Włącz kategorie',
            enableCategory: 'Włącz kategorię',
            defaultSpendCategories: 'Domyślne kategorie wydatków',
            spendCategoriesDescription: 'Dostosuj sposób kategoryzacji wydatków u sprzedawców dla transakcji kartą kredytową i zeskanowanych paragonów.',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania kategorii, spróbuj ponownie.',
            categoryName: 'Nazwa kategorii',
            requiresCategory: 'Członkowie muszą kategoryzować wszystkie wydatki',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Wszystkie wydatki muszą być skategoryzowane, aby można je było wyeksportować do ${connectionName}.`,
            subtitle: 'Uzyskaj lepszy przegląd, gdzie wydawane są pieniądze. Użyj naszych domyślnych kategorii lub dodaj własne.',
            emptyCategories: {
                title: 'Nie utworzyłeś żadnych kategorii',
                subtitle: 'Dodaj kategorię, aby zorganizować swoje wydatki.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Twoje kategorie są obecnie importowane z połączenia księgowego. Przejdź do',
                subtitle2: 'księgowość',
                subtitle3: 'aby wprowadzić jakiekolwiek zmiany.',
            },
            updateFailureMessage: 'Wystąpił błąd podczas aktualizacji kategorii, spróbuj ponownie.',
            createFailureMessage: 'Wystąpił błąd podczas tworzenia kategorii, spróbuj ponownie.',
            addCategory: 'Dodaj kategorię',
            editCategory: 'Edytuj kategorię',
            editCategories: 'Edytuj kategorie',
            findCategory: 'Znajdź kategorię',
            categoryRequiredError: 'Nazwa kategorii jest wymagana',
            existingCategoryError: 'Kategoria o tej nazwie już istnieje',
            invalidCategoryName: 'Nieprawidłowa nazwa kategorii',
            importedFromAccountingSoftware: 'Kategorie poniżej są importowane z Twojego',
            payrollCode: 'Kod płacowy',
            updatePayrollCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu płacowego, spróbuj ponownie.',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu GL, spróbuj ponownie.',
            importCategories: 'Importuj kategorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Nie można usunąć ani wyłączyć wszystkich kategorii',
                description: `Co najmniej jedna kategoria musi pozostać włączona, ponieważ Twoje miejsce pracy wymaga kategorii.`,
            },
        },
        moreFeatures: {
            subtitle: 'Użyj poniższych przełączników, aby włączyć więcej funkcji w miarę rozwoju. Każda funkcja pojawi się w menu nawigacyjnym do dalszej personalizacji.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'Włącz funkcjonalność, która pomoże Ci rozwijać zespół.',
            },
            manageSection: {
                title: 'Zarządzaj',
                subtitle: 'Dodaj kontrolki, które pomogą utrzymać wydatki w ramach budżetu.',
            },
            earnSection: {
                title: 'Zarabiać',
                subtitle: 'Usprawnij swoje przychody i otrzymuj płatności szybciej.',
            },
            organizeSection: {
                title: 'Zorganizuj',
                subtitle: 'Grupuj i analizuj wydatki, rejestruj każdy zapłacony podatek.',
            },
            integrateSection: {
                title: 'Zintegrować',
                subtitle: 'Połącz Expensify z popularnymi produktami finansowymi.',
            },
            distanceRates: {
                title: 'Stawki za odległość',
                subtitle: 'Dodaj, zaktualizuj i egzekwuj stawki.',
            },
            perDiem: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Uzyskaj wgląd i kontrolę nad wydatkami.',
                disableCardTitle: 'Wyłącz kartę Expensify',
                disableCardPrompt: 'Nie możesz wyłączyć karty Expensify, ponieważ jest już używana. Skontaktuj się z Concierge, aby uzyskać dalsze instrukcje.',
                disableCardButton: 'Czat z Concierge',
                feed: {
                    title: 'Zdobądź kartę Expensify',
                    subTitle: 'Usprawnij swoje wydatki biznesowe i zaoszczędź do 50% na rachunku Expensify, a ponadto:',
                    features: {
                        cashBack: 'Zwrot gotówki przy każdym zakupie w USA',
                        unlimited: 'Nielimitowane karty wirtualne',
                        spend: 'Kontrola wydatków i niestandardowe limity',
                    },
                    ctaTitle: 'Wydaj nową kartę',
                },
            },
            companyCards: {
                title: 'Karty firmowe',
                subtitle: 'Importuj wydatki z istniejących kart firmowych.',
                feed: {
                    title: 'Importuj karty firmowe',
                    features: {
                        support: 'Obsługa wszystkich głównych dostawców kart',
                        assignCards: 'Przypisz karty do całego zespołu',
                        automaticImport: 'Automatyczny import transakcji',
                    },
                },
                disableCardTitle: 'Wyłącz karty firmowe',
                disableCardPrompt: 'Nie możesz wyłączyć kart firmowych, ponieważ ta funkcja jest w użyciu. Skontaktuj się z Concierge, aby uzyskać dalsze instrukcje.',
                disableCardButton: 'Czat z Concierge',
                cardDetails: 'Szczegóły karty',
                cardNumber: 'Numer karty',
                cardholder: 'Posiadacz karty',
                cardName: 'Nazwa karty',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} eksport` : `eksport ${integration}`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Wybierz konto ${integration}, do którego transakcje powinny być eksportowane.`,
                integrationExportTitlePart: 'Wybierz inny',
                integrationExportTitleLinkPart: 'opcja eksportu',
                integrationExportTitleSecondPart: 'aby zmienić dostępne konta.',
                lastUpdated: 'Ostatnia aktualizacja',
                transactionStartDate: 'Data rozpoczęcia transakcji',
                updateCard: 'Zaktualizuj kartę',
                unassignCard: 'Usuń przypisanie karty',
                unassign: 'Odznacz',
                unassignCardDescription: 'Odpięcie tej karty spowoduje usunięcie wszystkich transakcji na raportach roboczych z konta posiadacza karty.',
                assignCard: 'Przypisz kartę',
                cardFeedName: 'Nazwa kanału kartowego',
                cardFeedNameDescription: 'Nadaj kanałowi kart unikalną nazwę, abyś mógł go odróżnić od innych.',
                cardFeedTransaction: 'Usuń transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą przestrzegać tych zasad.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezwól na usuwanie transakcji',
                removeCardFeed: 'Usuń kartę z kanału',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Usuń kanał ${feedName}`,
                removeCardFeedDescription: 'Czy na pewno chcesz usunąć ten kanał kart? Spowoduje to odłączenie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa kanału karty jest wymagana',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezwól na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj kanałowi kart unikalną nazwę, abyś mógł go odróżnić od innych.',
                setTransactionLiabilityDescription: 'Po włączeniu posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegać tej zasadzie.',
                emptyAddedFeedTitle: 'Przypisz firmowe karty',
                emptyAddedFeedDescription: 'Rozpocznij, przypisując swoją pierwszą kartę członkowi.',
                pendingFeedTitle: `Przeglądamy Twoją prośbę...`,
                pendingFeedDescription: `Obecnie przeglądamy szczegóły Twojego kanału. Gdy to zrobimy, skontaktujemy się z Tobą przez`,
                pendingBankTitle: 'Sprawdź okno przeglądarki',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Proszę połączyć się z ${bankName} za pomocą okna przeglądarki, które właśnie się otworzyło. Jeśli się nie otworzyło,`,
                pendingBankLink: 'proszę kliknij tutaj',
                giveItNameInstruction: 'Nadaj karcie nazwę, która wyróżni ją spośród innych.',
                updating: 'Aktualizowanie...',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domyślna karta',
                downgradeTitle: `Nie można obniżyć poziomu workspace.`,
                downgradeSubTitleFirstPart: `Tego miejsca pracy nie można obniżyć, ponieważ jest połączonych wiele kanałów kart (z wyłączeniem kart Expensify). Proszę`,
                downgradeSubTitleMiddlePart: `zachowaj tylko jeden kanał kart`,
                downgradeSubTitleLastPart: 'aby kontynuować.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Proszę dodać konto w ${connection} i ponownie zsynchronizować połączenie.`,
                expensifyCardBannerTitle: 'Zdobądź kartę Expensify',
                expensifyCardBannerSubtitle:
                    'Ciesz się zwrotem gotówki przy każdym zakupie w USA, do 50% zniżki na rachunek Expensify, nielimitowanymi kartami wirtualnymi i wieloma innymi korzyściami.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz się więcej',
            },
            workflows: {
                title: 'Przepływy pracy',
                subtitle: 'Skonfiguruj, jak wydatki są zatwierdzane i opłacane.',
                disableApprovalPrompt:
                    'Karty Expensify z tego obszaru roboczego obecnie polegają na zatwierdzeniu, aby określić ich Inteligentne Limity. Proszę zmienić typy limitów dla wszystkich Kart Expensify z Inteligentnymi Limitami przed wyłączeniem zatwierdzeń.',
            },
            invoices: {
                title: 'Faktury',
                subtitle: 'Wysyłaj i odbieraj faktury.',
            },
            categories: {
                title: 'Kategorie',
                subtitle: 'Śledź i organizuj wydatki.',
            },
            tags: {
                title: 'Tagi',
                subtitle: 'Klasyfikuj koszty i śledź wydatki podlegające fakturowaniu.',
            },
            taxes: {
                title: 'Podatki',
                subtitle: 'Dokumentuj i odzyskuj kwalifikujące się podatki.',
            },
            reportFields: {
                title: 'Pola raportu',
                subtitle: 'Skonfiguruj niestandardowe pola dla wydatków.',
            },
            connections: {
                title: 'Księgowość',
                subtitle: 'Synchronizuj swój plan kont i więcej.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText: 'Aby włączyć lub wyłączyć tę funkcję, musisz zmienić ustawienia importu księgowego.',
                disconnectText: 'Aby wyłączyć księgowość, musisz odłączyć swoje połączenie księgowe od przestrzeni roboczej.',
                manageSettings: 'Zarządzaj ustawieniami',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText:
                    'Karty Expensify w tym obszarze roboczym polegają na przepływach zatwierdzeń, aby określić ich Inteligentne Limity.\n\nProszę zmienić typy limitów na kartach z Inteligentnymi Limitami przed wyłączeniem przepływów pracy.',
                confirmText: 'Przejdź do kart Expensify',
            },
            rules: {
                title: 'Zasady',
                subtitle: 'Wymagaj paragonów, oznaczaj wysokie wydatki i więcej.',
            },
        },
        reportFields: {
            addField: 'Dodaj pole',
            delete: 'Usuń pole',
            deleteFields: 'Usuń pola',
            findReportField: 'Znajdź pole raportu',
            deleteConfirmation: 'Czy na pewno chcesz usunąć to pole raportu?',
            deleteFieldsConfirmation: 'Czy na pewno chcesz usunąć te pola raportu?',
            emptyReportFields: {
                title: 'Nie utworzyłeś żadnych pól raportu',
                subtitle: 'Dodaj niestandardowe pole (tekstowe, daty lub rozwijane), które pojawia się w raportach.',
            },
            subtitle: 'Pola raportu mają zastosowanie do wszystkich wydatków i mogą być pomocne, gdy chcesz poprosić o dodatkowe informacje.',
            disableReportFields: 'Wyłącz pola raportu',
            disableReportFieldsConfirmation: 'Czy jesteś pewien? Pola tekstowe i daty zostaną usunięte, a listy zostaną wyłączone.',
            importedFromAccountingSoftware: 'Pola raportu poniżej są importowane z Twojego',
            textType: 'Tekst',
            dateType: 'Data',
            dropdownType: 'Lista',
            textAlternateText: 'Dodaj pole do swobodnego wprowadzania tekstu.',
            dateAlternateText: 'Dodaj kalendarz do wyboru daty.',
            dropdownAlternateText: 'Dodaj listę opcji do wyboru.',
            nameInputSubtitle: 'Wybierz nazwę dla pola raportu.',
            typeInputSubtitle: 'Wybierz, jakiego typu pola raportu chcesz użyć.',
            initialValueInputSubtitle: 'Wprowadź wartość początkową do wyświetlenia w polu raportu.',
            listValuesInputSubtitle: 'Te wartości pojawią się w rozwijanym polu raportu. Włączone wartości mogą być wybierane przez członków.',
            listInputSubtitle: 'Te wartości pojawią się na liście pól w Twoim raporcie. Włączone wartości mogą być wybierane przez członków.',
            deleteValue: 'Usuń wartość',
            deleteValues: 'Usuń wartości',
            disableValue: 'Wyłącz wartość',
            disableValues: 'Wyłącz wartości',
            enableValue: 'Włącz wartość',
            enableValues: 'Włącz wartości',
            emptyReportFieldsValues: {
                title: 'Nie utworzyłeś żadnych wartości listy',
                subtitle: 'Dodaj niestandardowe wartości, które mają pojawić się w raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usunąć tę wartość z listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usunąć te wartości listy?',
            listValueRequiredError: 'Proszę wprowadzić nazwę wartości listy',
            existingListValueError: 'Wartość listy o tej nazwie już istnieje',
            editValue: 'Edytuj wartość',
            listValues: 'Wymień wartości',
            addValue: 'Dodaj wartość',
            existingReportFieldNameError: 'Pole raportu o tej nazwie już istnieje',
            reportFieldNameRequiredError: 'Proszę wprowadzić nazwę pola raportu',
            reportFieldTypeRequiredError: 'Proszę wybrać typ pola raportu',
            reportFieldInitialValueRequiredError: 'Proszę wybrać początkową wartość pola raportu',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizacji pola raportu. Proszę spróbować ponownie.',
        },
        tags: {
            tagName: 'Nazwa tagu',
            requiresTag: 'Członkowie muszą oznaczać wszystkie wydatki',
            trackBillable: 'Śledź wydatki podlegające rozliczeniu',
            customTagName: 'Niestandardowa nazwa tagu',
            enableTag: 'Włącz tag',
            enableTags: 'Włącz tagi',
            requireTag: 'Wymagaj tagu',
            requireTags: 'Wymagane tagi',
            notRequireTags: 'Nie wymagaj',
            disableTag: 'Wyłącz tag',
            disableTags: 'Wyłącz tagi',
            addTag: 'Dodaj tag',
            editTag: 'Edytuj tag',
            editTags: 'Edytuj tagi',
            findTag: 'Znajdź tag',
            subtitle: 'Tagi dodają bardziej szczegółowe sposoby klasyfikacji kosztów.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Używasz',
                phrase2: 'tagi zależne',
                phrase3: '. Możesz',
                phrase4: 'ponownie zaimportuj arkusz kalkulacyjny',
                phrase5: 'aby zaktualizować swoje tagi.',
            },
            emptyTags: {
                title: 'Nie utworzyłeś żadnych tagów',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Dodaj tag, aby śledzić projekty, lokalizacje, działy i inne.',
                subtitle1: 'Zaimportuj arkusz kalkulacyjny, aby dodać tagi do śledzenia projektów, lokalizacji, działów i innych.',
                subtitle2: 'Dowiedz się więcej',
                subtitle3: 'about formatting tag files.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Twoje tagi są obecnie importowane z połączenia księgowego. Przejdź do',
                subtitle2: 'księgowość',
                subtitle3: 'aby wprowadzić jakiekolwiek zmiany.',
            },
            deleteTag: 'Usuń tag',
            deleteTags: 'Usuń tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usunąć ten tag?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usunąć te tagi?',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania tagu, spróbuj ponownie.',
            tagRequiredError: 'Nazwa tagu jest wymagana',
            existingTagError: 'Tag o tej nazwie już istnieje',
            invalidTagNameError: 'Nazwa tagu nie może być 0. Proszę wybrać inną wartość.',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizacji tagu, spróbuj ponownie.',
            importedFromAccountingSoftware: 'Tagi poniżej są importowane z twojego',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu GL, spróbuj ponownie.',
            tagRules: 'Zasady tagów',
            approverDescription: 'Aprobujący',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Koduj swoje wydatki za pomocą jednego rodzaju tagu lub wielu.',
            configureMultiLevelTags: 'Skonfiguruj swoją listę tagów do tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: `Oto podgląd Twoich tagów. Jeśli wszystko wygląda dobrze, kliknij poniżej, aby je zaimportować.`,
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz to tytuł dla każdej listy tagów',
                independentTags: 'Są to niezależne tagi',
                glAdjacentColumn: 'W sąsiedniej kolumnie znajduje się kod GL',
            },
            tagLevel: {
                singleLevel: 'Pojedynczy poziom tagów',
                multiLevel: 'Wielopoziomowe tagi',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Przełącz poziomy tagów',
                prompt1: 'Zmiana poziomów tagów spowoduje usunięcie wszystkich bieżących tagów.',
                prompt2: 'Sugerujemy najpierw',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'poprzez eksportowanie swoich tagów.',
                prompt5: 'Dowiedz się więcej',
                prompt6: 'o poziomach tagów.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Znaleźliśmy *${columnCounts} kolumny* w Twoim arkuszu kalkulacyjnym. Wybierz *Nazwa* obok kolumny, która zawiera nazwy tagów. Możesz również wybrać *Włączone* obok kolumny, która ustawia status tagów.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Nie można usunąć ani wyłączyć wszystkich tagów',
                description: `Co najmniej jeden tag musi pozostać włączony, ponieważ twoje miejsce pracy wymaga tagów.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie można ustawić wszystkich tagów jako opcjonalne.',
                description: `Co najmniej jeden tag musi pozostać wymagany, ponieważ ustawienia Twojego miejsca pracy wymagają tagów.`,
            },
            tagCount: () => ({
                one: '1 dzień',
                other: (count: number) => `${count} tagi`,
            }),
        },
        taxes: {
            subtitle: 'Dodaj nazwy podatków, stawki i ustaw domyślne.',
            addRate: 'Dodaj stawkę',
            workspaceDefault: 'Domyślna waluta przestrzeni roboczej',
            foreignDefault: 'Domyślna waluta obca',
            customTaxName: 'Niestandardowa nazwa podatku',
            value: 'Wartość',
            taxReclaimableOn: 'Podatek do odzyskania na',
            taxRate: 'Stawka podatkowa',
            findTaxRate: 'Znajdź stawkę podatkową',
            error: {
                taxRateAlreadyExists: 'Ta nazwa podatku jest już w użyciu',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest już w użyciu',
                valuePercentageRange: 'Proszę wprowadzić prawidłowy procent pomiędzy 0 a 100',
                customNameRequired: 'Nazwa niestandardowego podatku jest wymagana',
                deleteFailureMessage: 'Wystąpił błąd podczas usuwania stawki podatkowej. Spróbuj ponownie lub poproś o pomoc Concierge.',
                updateFailureMessage: 'Wystąpił błąd podczas aktualizacji stawki podatkowej. Spróbuj ponownie lub poproś o pomoc Concierge.',
                createFailureMessage: 'Wystąpił błąd podczas tworzenia stawki podatkowej. Spróbuj ponownie lub poproś o pomoc Concierge.',
                updateTaxClaimableFailureMessage: 'Część podlegająca zwrotowi musi być mniejsza niż kwota stawki za odległość',
            },
            deleteTaxConfirmation: 'Czy na pewno chcesz usunąć ten podatek?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Czy na pewno chcesz usunąć podatki w wysokości ${taxAmount}?`,
            actions: {
                delete: 'Usuń stawkę',
                deleteMultiple: 'Usuń stawki',
                enable: 'Włącz stawkę',
                disable: 'Wyłącz stawkę',
                enableTaxRates: () => ({
                    one: 'Włącz stawkę',
                    other: 'Włącz stawki',
                }),
                disableTaxRates: () => ({
                    one: 'Wyłącz stawkę',
                    other: 'Wyłącz stawki',
                }),
            },
            importedFromAccountingSoftware: 'Poniższe podatki są importowane z Twojego',
            taxCode: 'Kod podatkowy',
            updateTaxCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu podatkowego, spróbuj ponownie.',
        },
        emptyWorkspace: {
            title: 'Utwórz przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą do śledzenia paragonów, zwracania wydatków, zarządzania podróżami, wysyłania faktur i nie tylko — wszystko z prędkością czatu.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: 'Śledź i zbieraj paragony',
                reimbursements: 'Zwróć koszty pracownikom',
                companyCards: 'Zarządzaj kartami firmowymi',
            },
            notFound: 'Nie znaleziono przestrzeni roboczej',
            description: 'Pokoje to świetne miejsce do dyskusji i pracy z wieloma osobami. Aby rozpocząć współpracę, utwórz lub dołącz do przestrzeni roboczej.',
        },
        new: {
            newWorkspace: 'Nowe miejsce pracy',
            getTheExpensifyCardAndMore: 'Zdobądź kartę Expensify i więcej',
            confirmWorkspace: 'Potwierdź przestrzeń roboczą',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Moja przestrzeń robocza grupy${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace użytkownika ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Wystąpił błąd podczas usuwania członka z przestrzeni roboczej, spróbuj ponownie.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Czy na pewno chcesz usunąć ${memberName}?`,
                other: 'Czy na pewno chcesz usunąć tych członków?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} jest osobą zatwierdzającą w tej przestrzeni roboczej. Gdy przestaniesz udostępniać im tę przestrzeń roboczą, zastąpimy ich w procesie zatwierdzania właścicielem przestrzeni roboczej, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Usuń członka',
                other: 'Usuń członków',
            }),
            findMember: 'Znajdź członka',
            removeWorkspaceMemberButtonTitle: 'Usuń z przestrzeni roboczej',
            removeGroupMemberButtonTitle: 'Usuń z grupy',
            removeRoomMemberButtonTitle: 'Usuń z czatu',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Czy na pewno chcesz usunąć ${memberName}?`,
            removeMemberTitle: 'Usuń członka',
            transferOwner: 'Przenieś właściciela',
            makeMember: 'Uczyń członkiem',
            makeAdmin: 'Ustaw jako administratora',
            makeAuditor: 'Utwórz audytora',
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wystąpił problem z dodaniem tego członka przestrzeni roboczej',
                cannotRemove: 'Nie możesz usunąć siebie ani właściciela przestrzeni roboczej.',
                genericRemove: 'Wystąpił problem z usunięciem tego członka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niektórzy członkowie zostali dodani z ich głównymi loginami.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Dodane przez dodatkowe logowanie ${secondaryLogin}.`,
            membersListTitle: 'Katalog wszystkich członków przestrzeni roboczej.',
            importMembers: 'Importuj członków',
        },
        card: {
            getStartedIssuing: 'Rozpocznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            issueCard: 'Wydaj kartę',
            issueNewCard: {
                whoNeedsCard: 'Kto potrzebuje karty?',
                findMember: 'Znajdź członka',
                chooseCardType: 'Wybierz typ karty',
                physicalCard: 'Fizyczna karta',
                physicalCardDescription: 'Świetne dla częstego wydawcy',
                virtualCard: 'Wirtualna karta',
                virtualCardDescription: 'Natychmiastowy i elastyczny',
                chooseLimitType: 'Wybierz typ limitu',
                smartLimit: 'Inteligentny Limit',
                smartLimitDescription: 'Wydaj do określonej kwoty przed wymaganiem zatwierdzenia',
                monthly: 'Miesięczny',
                monthlyDescription: 'Wydawaj do określonej kwoty miesięcznie',
                fixedAmount: 'Stała kwota',
                fixedAmountDescription: 'Wydaj do określonej kwoty jednorazowo',
                setLimit: 'Ustaw limit',
                cardLimitError: 'Proszę wprowadzić kwotę mniejszą niż $21,474,836',
                giveItName: 'Nadaj mu nazwę',
                giveItNameInstruction: 'Uczyń ją na tyle unikalną, aby można było ją odróżnić od innych kart. Konkretne przypadki użycia są jeszcze lepsze!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
                willBeReady: 'Ta karta będzie gotowa do użycia natychmiast.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                name: 'Imię',
            },
            deactivateCardModal: {
                deactivate: 'Dezaktywuj',
                deactivateCard: 'Dezaktywuj kartę',
                deactivateConfirmation: 'Dezaktywacja tej karty spowoduje odrzucenie wszystkich przyszłych transakcji i nie można tego cofnąć.',
            },
        },
        accounting: {
            settings: 'ustawienia',
            title: 'Połączenia',
            subtitle: 'Połącz się ze swoim systemem księgowym, aby kodować transakcje za pomocą planu kont, automatycznie dopasowywać płatności i utrzymywać synchronizację finansów.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji.',
            talkYourAccountManager: 'Porozmawiaj ze swoim menedżerem konta.',
            talkToConcierge: 'Czat z Concierge.',
            needAnotherAccounting: 'Potrzebujesz innego oprogramowania księgowego?',
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
            errorODIntegration: 'Wystąpił błąd z połączeniem skonfigurowanym w Expensify Classic.',
            goToODToFix: 'Przejdź do Expensify Classic, aby rozwiązać ten problem.',
            goToODToSettings: 'Przejdź do Expensify Classic, aby zarządzać swoimi ustawieniami.',
            setup: 'Połącz',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Ostatnia synchronizacja ${relativeDate}`,
            notSync: 'Nie zsynchronizowano',
            import: 'Importuj',
            export: 'Eksportuj',
            advanced: 'Zaawansowany',
            other: 'Inne',
            syncNow: 'Synchronizuj teraz',
            disconnect: 'Odłącz',
            reinstall: 'Ponownie zainstaluj łącznik',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integracja';
                return `Odłącz ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Połącz ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integracja księgowa'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Nie można połączyć się z QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Nie można połączyć się z Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Nie można połączyć się z NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Nie można połączyć się z QuickBooks Desktop';
                    default: {
                        return 'Nie można połączyć się z integracją';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Zaimportowane jako pola raportu',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Domyślne ustawienia pracownika NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'ta integracja';
                return `Czy na pewno chcesz odłączyć ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Czy na pewno chcesz połączyć ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'ta integracja księgowa'}? Spowoduje to usunięcie wszystkich istniejących połączeń księgowych.`,
            enterCredentials: 'Wprowadź swoje dane uwierzytelniające',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importowanie klientów';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importowanie pracowników';
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
                            return 'Synchronizowanie zrefundowanych raportów i płatności rachunków';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importowanie kodów podatkowych';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Sprawdzanie połączenia z QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importowanie danych Xero';
                        case 'startingImportQBO':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importowanie danych QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importowanie tytułu';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importowanie certyfikatu zatwierdzenia';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importowanie wymiarów';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importowanie zapisanej polityki';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Nadal synchronizujemy dane z QuickBooks... Upewnij się, że Web Connector jest uruchomiony';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronizowanie danych z QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Ładowanie danych';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Aktualizowanie kategorii';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aktualizowanie klientów/projektów';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Aktualizowanie listy osób';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aktualizowanie pól raportu';
                        case 'jobDone':
                            return 'Oczekiwanie na załadowanie zaimportowanych danych';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchronizowanie planu kont';
                        case 'xeroSyncImportCategories':
                            return 'Synchronizowanie kategorii';
                        case 'xeroSyncImportCustomers':
                            return 'Synchronizowanie klientów';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Oznaczanie raportów Expensify jako zrefundowane';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur Xero jako opłacone';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronizowanie kategorii śledzenia';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronizacja kont bankowych';
                        case 'xeroSyncImportTaxRates':
                            return 'Synchronizowanie stawek podatkowych';
                        case 'xeroCheckConnection':
                            return 'Sprawdzanie połączenia z Xero';
                        case 'xeroSyncTitle':
                            return 'Synchronizowanie danych Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inicjowanie połączenia z NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importowanie klientów';
                        case 'netSuiteSyncInitData':
                            return 'Pobieranie danych z NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importowanie podatków';
                        case 'netSuiteSyncImportItems':
                            return 'Importowanie elementów';
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
                            return 'Aktualizowanie informacji o połączeniu';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Oznaczanie raportów Expensify jako zrefundowane';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur NetSuite jako opłacone';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importowanie dostawców';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importowanie niestandardowych list';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importowanie niestandardowych list';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importowanie jednostek zależnych';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importowanie dostawców';
                        case 'intacctCheckConnection':
                            return 'Sprawdzanie połączenia z Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importowanie wymiarów Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importowanie danych Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Brak tłumaczenia dla etapu: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Preferowany eksporter',
            exportPreferredExporterNote:
                'Preferowany eksporter może być dowolnym administratorem przestrzeni roboczej, ale musi być również administratorem domeny, jeśli ustawisz różne konta eksportu dla indywidualnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy raporty do eksportu na swoim koncie.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z własnej kieszeni jako',
            exportCompanyCard: 'Eksportuj wydatki na firmową kartę jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domyślny dostawca',
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Synchronizuj NetSuite i Expensify automatycznie, każdego dnia. Eksportuj sfinalizowany raport w czasie rzeczywistym.',
            reimbursedReports: 'Synchronizuj zrefundowane raporty',
            cardReconciliation: 'Rekonsyliacja karty',
            reconciliationAccount: 'Konto uzgadniające',
            continuousReconciliation: 'Ciągła rekonsyliacja',
            saveHoursOnReconciliation:
                'Zaoszczędź godziny na uzgadnianiu w każdym okresie rozliczeniowym, pozwalając Expensify na ciągłe uzgadnianie wyciągów i rozliczeń z karty Expensify w Twoim imieniu.',
            enableContinuousReconciliation: 'Aby włączyć Ciągłą Rekoncyliację, proszę włączyć',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z którym będą uzgadniane płatności kartą Expensify.',
                accountMatches: 'Upewnij się, że to konto pasuje do Twojego',
                settlementAccount: 'Konto rozliczeniowe karty Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(kończący się na ${lastFourPAN}), aby Ciągła Rekonsyliacja działała poprawnie.`,
            },
        },
        export: {
            notReadyHeading: 'Nie gotowy do eksportu',
            notReadyDescription: 'Robocze lub oczekujące raporty wydatków nie mogą być eksportowane do systemu księgowego. Proszę zatwierdzić lub opłacić te wydatki przed ich eksportem.',
        },
        invoices: {
            sendInvoice: 'Wyślij fakturę',
            sendFrom: 'Wyślij z',
            invoicingDetails: 'Szczegóły fakturowania',
            invoicingDetailsDescription: 'Te informacje pojawią się na Twoich fakturach.',
            companyName: 'Nazwa firmy',
            companyWebsite: 'Strona internetowa firmy',
            paymentMethods: {
                personal: 'Osobiste',
                business: 'Biznes',
                chooseInvoiceMethod: 'Wybierz metodę płatności poniżej:',
                addBankAccount: 'Dodaj konto bankowe',
                payingAsIndividual: 'Płacenie jako osoba fizyczna',
                payingAsBusiness: 'Płacenie jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle: 'To jest Twój aktualny stan konta z tytułu zbierania płatności za faktury. Zostanie on automatycznie przelany na Twoje konto bankowe, jeśli je dodałeś.',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby dokonywać i otrzymywać płatności za faktury.',
        },
        invite: {
            member: 'Zaproś członka',
            members: 'Zaproś członków',
            invitePeople: 'Zaproś nowych członków',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Proszę spróbować ponownie.',
            pleaseEnterValidLogin: `Proszę upewnić się, że adres e-mail lub numer telefonu jest prawidłowy (np. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'użytkownik',
            users: 'użytkownicy',
            invited: 'zaproszony',
            removed: 'removed',
            to: 'do',
            from: 'z',
        },
        inviteMessage: {
            confirmDetails: 'Potwierdź szczegóły',
            inviteMessagePrompt: 'Uczyń swoje zaproszenie wyjątkowym, dodając poniżej wiadomość!',
            personalMessagePrompt: 'Wiadomość',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Proszę spróbować ponownie.',
            inviteNoMembersError: 'Proszę wybrać co najmniej jednego członka do zaproszenia',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} poprosił o dołączenie do ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak szybko...',
            workspaceNeeds: 'Przestrzeń robocza wymaga co najmniej jednej włączonej stawki za odległość.',
            distance: 'Odległość',
            centrallyManage: 'Centralnie zarządzaj stawkami, śledź w milach lub kilometrach i ustaw domyślną kategorię.',
            rate: 'Oceń',
            addRate: 'Dodaj stawkę',
            findRate: 'Znajdź stawkę',
            trackTax: 'Śledź podatek',
            deleteRates: () => ({
                one: 'Usuń stawkę',
                other: 'Usuń stawki',
            }),
            enableRates: () => ({
                one: 'Włącz stawkę',
                other: 'Włącz stawki',
            }),
            disableRates: () => ({
                one: 'Wyłącz stawkę',
                other: 'Wyłącz stawki',
            }),
            enableRate: 'Włącz stawkę',
            status: 'Status',
            unit: 'Jednostka',
            taxFeatureNotEnabledMessage: 'Podatki muszą być włączone w przestrzeni roboczej, aby użyć tej funkcji. Przejdź do',
            changePromptMessage: 'aby dokonać tej zmiany.',
            deleteDistanceRate: 'Usuń stawkę za odległość',
            areYouSureDelete: () => ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Opis',
            nameInputLabel: 'Imię',
            typeInputLabel: 'Rodzaj',
            initialValueInputLabel: 'Wartość początkowa',
            nameInputHelpText: 'To jest nazwa, którą zobaczysz w swoim obszarze roboczym.',
            nameIsRequiredError: 'Musisz nadać swojej przestrzeni roboczej nazwę',
            currencyInputLabel: 'Domyślna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tej przestrzeni roboczej zostaną przeliczone na tę walutę.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `Domyślna waluta nie może zostać zmieniona, ponieważ to miejsce pracy jest powiązane z kontem bankowym w ${currency}.`,
            save: 'Zapisz',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizacji przestrzeni roboczej. Proszę spróbować ponownie.',
            avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Proszę spróbować ponownie.',
            addressContext: 'Aby włączyć Expensify Travel, wymagany jest adres Workspace. Proszę wprowadzić adres powiązany z Twoją firmą.',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfigurację',
            youAreAlmostDone: 'Prawie skończyłeś konfigurowanie swojego konta bankowego, co pozwoli Ci wydawać karty firmowe, zwracać koszty, pobierać faktury i płacić rachunki.',
            streamlinePayments: 'Usprawnij płatności',
            connectBankAccountNote: 'Uwaga: Osobiste konta bankowe nie mogą być używane do płatności w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards: 'To konto bankowe będzie używane do wydawania kart firmowych, zwrotu kosztów, pobierania faktur i opłacania rachunków.',
            letsFinishInChat: 'Zakończmy na czacie!',
            finishInChat: 'Zakończ w czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Odłącz konto bankowe',
            startOver: 'Zacznij od nowa',
            updateDetails: 'Zaktualizuj szczegóły',
            yesDisconnectMyBankAccount: 'Tak, odłącz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa.',
            disconnectYour: 'Odłącz swoje',
            bankAccountAnyTransactions: 'konto bankowe. Wszelkie nierozliczone transakcje dla tego konta zostaną nadal zrealizowane.',
            clearProgress: 'Rozpoczęcie od nowa spowoduje usunięcie postępów, które dotychczas osiągnąłeś.',
            areYouSure: 'Czy jesteś pewien?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt: 'Wygląda na to, że Twoje miejsce pracy jest obecnie ustawione na inną walutę niż USD. Kliknij poniższy przycisk, aby teraz zaktualizować walutę na USD.',
            updateToUSD: 'Zaktualizuj na USD',
            updateWorkspaceCurrency: 'Zaktualizuj walutę przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta przestrzeni roboczej nie jest obsługiwana',
            yourWorkspace: 'Twoje miejsce pracy jest ustawione na nieobsługiwaną walutę. Zobacz',
            listOfSupportedCurrencies: 'lista obsługiwanych walut',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenieś właściciela',
            addPaymentCardTitle: 'Wprowadź swoją kartę płatniczą, aby przenieść własność',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kartę płatniczą',
            addPaymentCardReadAndAcceptTextPart1: 'Przeczytaj i zaakceptuj',
            addPaymentCardReadAndAcceptTextPart2: 'zasady dodawania karty',
            addPaymentCardTerms: 'warunki',
            addPaymentCardPrivacy: 'prywatność',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Zgodny z PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie bankowym',
            addPaymentCardRedundant: 'Nadmierna infrastruktura',
            addPaymentCardLearnMore: 'Dowiedz się więcej o naszych',
            addPaymentCardSecurity: 'bezpieczeństwo',
            amountOwedTitle: 'Należność do zapłaty',
            amountOwedButtonText: 'OK',
            amountOwedText: 'To konto ma zaległe saldo z poprzedniego miesiąca.\n\nCzy chcesz uregulować saldo i przejąć rozliczenia tego miejsca pracy?',
            ownerOwesAmountTitle: 'Należność do zapłaty',
            ownerOwesAmountButtonText: 'Przelej saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Konto będące właścicielem tej przestrzeni roboczej (${email}) ma zaległe saldo z poprzedniego miesiąca.\n\nCzy chcesz przelać tę kwotę (${amount}), aby przejąć rozliczenia za tę przestrzeń roboczą? Twoja karta płatnicza zostanie obciążona natychmiast.`,
            subscriptionTitle: 'Przejmij roczną subskrypcję',
            subscriptionButtonText: 'Przenieś subskrypcję',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Przejęcie tego miejsca pracy połączy jego roczną subskrypcję z Twoją obecną subskrypcją. Spowoduje to zwiększenie rozmiaru Twojej subskrypcji o ${usersCount} członków, co da nowy rozmiar subskrypcji wynoszący ${finalCount}. Czy chcesz kontynuować?`,
            duplicateSubscriptionTitle: 'Alert o zduplikowanej subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Wygląda na to, że możesz próbować przejąć rozliczenia dla przestrzeni roboczych ${email}, ale aby to zrobić, musisz najpierw być administratorem we wszystkich ich przestrzeniach roboczych.\n\nKliknij "Kontynuuj", jeśli chcesz przejąć rozliczenia tylko dla przestrzeni roboczej ${workspaceName}.\n\nJeśli chcesz przejąć rozliczenia dla całej ich subskrypcji, poproś ich, aby najpierw dodali Cię jako administratora do wszystkich swoich przestrzeni roboczych, zanim przejmiesz rozliczenia.`,
            hasFailedSettlementsTitle: 'Nie można przenieść własności',
            hasFailedSettlementsButtonText: 'Zrozumiałem.',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Nie możesz przejąć rozliczeń, ponieważ ${email} ma zaległe rozliczenie karty Expensify. Proszę poprosić tę osobę o kontakt z concierge@expensify.com w celu rozwiązania problemu. Następnie będziesz mógł przejąć rozliczenia dla tego miejsca pracy.`,
            failedToClearBalanceTitle: 'Nie udało się wyczyścić salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie udało nam się wyczyścić salda. Proszę spróbować ponownie później.',
            successTitle: 'Hurra! Wszystko gotowe.',
            successDescription: 'Jesteś teraz właścicielem tego miejsca pracy.',
            errorTitle: 'Ups! Nie tak szybko...',
            errorDescriptionPartOne: 'Wystąpił problem z przeniesieniem własności tego miejsca pracy. Spróbuj ponownie lub',
            errorDescriptionPartTwo: 'skontaktuj się z Concierge',
            errorDescriptionPartThree: 'po pomoc.',
        },
        exportAgainModal: {
            title: 'Ostrożnie!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Następujące raporty zostały już wyeksportowane do ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nCzy na pewno chcesz je wyeksportować ponownie?`,
            confirmText: 'Tak, wyeksportuj ponownie',
            cancelText: 'Anuluj',
        },
        upgrade: {
            reportFields: {
                title: 'Pola raportu',
                description: `Pola raportu pozwalają określić szczegóły na poziomie nagłówka, w odróżnieniu od tagów odnoszących się do wydatków na poszczególnych pozycjach. Te szczegóły mogą obejmować konkretne nazwy projektów, informacje o podróżach służbowych, lokalizacje i inne.`,
                onlyAvailableOnPlan: 'Pola raportu są dostępne tylko w planie Control, zaczynając od',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Ciesz się automatyczną synchronizacją i zmniejsz liczbę ręcznych wpisów dzięki integracji Expensify + NetSuite. Uzyskaj dogłębne, rzeczywiste wglądy finansowe z obsługą segmentów natywnych i niestandardowych, w tym mapowaniem projektów i klientów.`,
                onlyAvailableOnPlan: 'Nasza integracja z NetSuite jest dostępna tylko w planie Control, zaczynającym się od',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Ciesz się automatyczną synchronizacją i zmniejsz liczbę ręcznych wpisów dzięki integracji Expensify + Sage Intacct. Uzyskaj dogłębne, rzeczywiste wglądy finansowe z użytkownikami zdefiniowanymi wymiarami, a także kodowaniem wydatków według działu, klasy, lokalizacji, klienta i projektu (pracy).`,
                onlyAvailableOnPlan: 'Nasza integracja z Sage Intacct jest dostępna tylko w planie Control, zaczynającym się od',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Ciesz się automatyczną synchronizacją i redukcją ręcznych wpisów dzięki integracji Expensify + QuickBooks Desktop. Zyskaj maksymalną wydajność dzięki dwukierunkowemu połączeniu w czasie rzeczywistym oraz kodowaniu wydatków według klasy, pozycji, klienta i projektu.`,
                onlyAvailableOnPlan: 'Nasza integracja z QuickBooks Desktop jest dostępna tylko w planie Control, zaczynającym się od',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Zaawansowane zatwierdzenia',
                description: `Jeśli chcesz dodać więcej warstw zatwierdzeń do procesu – lub po prostu upewnić się, że największe wydatki zostaną ponownie sprawdzone – mamy dla Ciebie rozwiązanie. Zaawansowane zatwierdzenia pomagają wprowadzić odpowiednie kontrole na każdym poziomie, aby utrzymać wydatki zespołu pod kontrolą.`,
                onlyAvailableOnPlan: 'Zaawansowane zatwierdzenia są dostępne tylko w planie Control, który zaczyna się od',
            },
            categories: {
                title: 'Kategorie',
                description: `Kategorie pomagają lepiej organizować wydatki, aby śledzić, na co wydajesz swoje pieniądze. Skorzystaj z naszej sugerowanej listy kategorii lub stwórz własne.`,
                onlyAvailableOnPlan: 'Kategorie są dostępne w planie Collect, zaczynając od',
            },
            glCodes: {
                title: 'kody GL',
                description: `Dodaj kody GL do swoich kategorii i tagów, aby ułatwić eksport wydatków do swoich systemów księgowych i płacowych.`,
                onlyAvailableOnPlan: 'Kody GL są dostępne tylko w planie Control, zaczynającym się od',
            },
            glAndPayrollCodes: {
                title: 'Kody GL i Payroll',
                description: `Dodaj kody GL i kody płacowe do swoich kategorii, aby ułatwić eksport wydatków do systemów księgowych i płacowych.`,
                onlyAvailableOnPlan: 'Kody GL i Payroll są dostępne tylko w planie Control, zaczynającym się od',
            },
            taxCodes: {
                title: 'Kody podatkowe',
                description: `Dodaj kody podatkowe do swoich podatków, aby łatwo eksportować wydatki do swoich systemów księgowych i płacowych.`,
                onlyAvailableOnPlan: 'Kody podatkowe są dostępne tylko w planie Control, zaczynając od',
            },
            companyCards: {
                title: 'Nielimitowane karty firmowe',
                description: `Potrzebujesz dodać więcej źródeł kart? Odblokuj nieograniczoną liczbę kart firmowych, aby synchronizować transakcje ze wszystkich głównych wydawców kart.`,
                onlyAvailableOnPlan: 'To jest dostępne tylko w planie Control, zaczynając od',
            },
            rules: {
                title: 'Zasady',
                description: `Zasady działają w tle i pomagają kontrolować wydatki, dzięki czemu nie musisz martwić się drobiazgami.\n\nWymagaj szczegółów wydatków, takich jak paragony i opisy, ustalaj limity i domyślne wartości oraz automatyzuj zatwierdzenia i płatności – wszystko w jednym miejscu.`,
                onlyAvailableOnPlan: 'Zasady są dostępne tylko w planie Control, zaczynającym się od',
            },
            perDiem: {
                title: 'Dieta',
                description:
                    'Dieta to świetny sposób na utrzymanie zgodności i przewidywalności codziennych kosztów, gdy Twoi pracownicy podróżują. Ciesz się funkcjami takimi jak niestandardowe stawki, domyślne kategorie i bardziej szczegółowe informacje, takie jak miejsca docelowe i podstawki.',
                onlyAvailableOnPlan: 'Diety są dostępne tylko w planie Control, zaczynając od',
            },
            travel: {
                title: 'Podróżować',
                description:
                    'Expensify Travel to nowa platforma do rezerwacji i zarządzania podróżami służbowymi, która umożliwia członkom rezerwację zakwaterowania, lotów, transportu i nie tylko.',
                onlyAvailableOnPlan: 'Podróże są dostępne w planie Collect, zaczynając od',
            },
            multiLevelTags: {
                title: 'Wielopoziomowe tagi',
                description:
                    'Wielopoziomowe tagi pomagają śledzić wydatki z większą precyzją. Przypisz wiele tagów do każdej pozycji, takich jak dział, klient czy centrum kosztów, aby uchwycić pełny kontekst każdego wydatku. Umożliwia to bardziej szczegółowe raportowanie, przepływy pracy związane z zatwierdzaniem oraz eksporty księgowe.',
                onlyAvailableOnPlan: 'Wielopoziomowe tagi są dostępne tylko w planie Control, zaczynając od',
            },
            pricing: {
                perActiveMember: 'na aktywnego członka miesięcznie.',
                perMember: 'za członka miesięcznie.',
            },
            note: {
                upgradeWorkspace: 'Ulepsz swoje miejsce pracy, aby uzyskać dostęp do tej funkcji, lub',
                learnMore: 'dowiedz się więcej',
                aboutOurPlans: 'o naszych planach i cenach.',
            },
            upgradeToUnlock: 'Odblokuj tę funkcję',
            completed: {
                headline: `Zaktualizowałeś swoje miejsce pracy!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Pomyślnie zaktualizowano ${policyName} do planu Control!`,
                categorizeMessage: `Pomyślnie zaktualizowano do przestrzeni roboczej w planie Collect. Teraz możesz kategoryzować swoje wydatki!`,
                travelMessage: `Pomyślnie zaktualizowano do przestrzeni roboczej w planie Collect. Teraz możesz zacząć rezerwować i zarządzać podróżami!`,
                viewSubscription: 'Zobacz swoją subskrypcję',
                moreDetails: 'aby uzyskać więcej szczegółów.',
                gotIt: 'Zrozumiałem, dzięki',
            },
            commonFeatures: {
                title: 'Ulepsz do planu Control',
                note: 'Odblokuj nasze najpotężniejsze funkcje, w tym:',
                benefits: {
                    startsAt: 'Plan Control zaczyna się od',
                    perMember: 'na aktywnego członka miesięcznie.',
                    learnMore: 'Dowiedz się więcej',
                    pricing: 'o naszych planach i cenach.',
                    benefit1: 'Zaawansowane połączenia księgowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne zasady wydatków',
                    benefit3: 'Wielopoziomowe przepływy zatwierdzania',
                    benefit4: 'Ulepszone kontrole bezpieczeństwa',
                    toUpgrade: 'Aby zaktualizować, kliknij',
                    selectWorkspace: 'wybierz przestrzeń roboczą i zmień typ planu na',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Przejdź na plan Collect',
                note: 'Jeśli obniżysz plan, stracisz dostęp do tych funkcji i innych:',
                benefits: {
                    note: 'Aby uzyskać pełne porównanie naszych planów, sprawdź nasze',
                    pricingPage: 'strona cenowa',
                    confirm: 'Czy na pewno chcesz obniżyć wersję i usunąć swoje konfiguracje?',
                    warning: 'Tego nie można cofnąć.',
                    benefit1: 'Połączenia księgowe (z wyjątkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne zasady wydatków',
                    benefit3: 'Wielopoziomowe przepływy zatwierdzania',
                    benefit4: 'Ulepszone kontrole bezpieczeństwa',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote: 'Musisz obniżyć wszystkie swoje przestrzenie robocze przed pierwszą miesięczną płatnością, aby rozpocząć subskrypcję w stawce Collect. Kliknij',
                    selectStep: '> wybierz każde miejsce pracy > zmień typ planu na',
                },
            },
            completed: {
                headline: 'Twoje miejsce pracy zostało zdegradowane',
                description: 'Masz inne przestrzenie robocze na planie Control. Aby być rozliczanym według stawki Collect, musisz obniżyć wszystkie przestrzenie robocze.',
                gotIt: 'Zrozumiałem, dzięki',
            },
        },
        payAndDowngrade: {
            title: 'Zapłać i obniż plan',
            headline: 'Twoja ostateczna płatność',
            description1: 'Twój ostateczny rachunek za tę subskrypcję wyniesie',
            description2: ({date}: DateParams) => `Zobacz swoje zestawienie poniżej dla ${date}:`,
            subscription:
                'Uwaga! Ta akcja zakończy Twoją subskrypcję Expensify, usunie to miejsce pracy i usunie wszystkich członków miejsca pracy. Jeśli chcesz zachować to miejsce pracy i tylko usunąć siebie, najpierw poproś innego administratora o przejęcie rozliczeń.',
            genericFailureMessage: 'Wystąpił błąd podczas płacenia rachunku. Proszę spróbować ponownie.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Działania w przestrzeni roboczej ${workspaceName} są obecnie ograniczone`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Właściciel przestrzeni roboczej, ${workspaceOwnerName}, będzie musiał dodać lub zaktualizować kartę płatniczą w systemie, aby odblokować nowe działania w przestrzeni roboczej.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Będziesz musiał dodać lub zaktualizować kartę płatniczą w systemie, aby odblokować nowe działania w przestrzeni roboczej.',
            addPaymentCardToUnlock: 'Dodaj kartę płatniczą, aby odblokować!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kartę płatniczą, aby kontynuować korzystanie z tego miejsca pracy.',
            pleaseReachOutToYourWorkspaceAdmin: 'Proszę skontaktować się z administratorem przestrzeni roboczej w razie jakichkolwiek pytań.',
            chatWithYourAdmin: 'Porozmawiaj ze swoim administratorem',
            chatInAdmins: 'Czat w #admins',
            addPaymentCard: 'Dodaj kartę płatniczą',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: 'Ustaw limity wydatków i domyślne wartości dla poszczególnych wydatków. Możesz także tworzyć zasady dla',
                receiptRequiredAmount: 'Wymagana kwota paragonu',
                receiptRequiredAmountDescription: 'Wymagaj paragonów, gdy wydatki przekraczają tę kwotę, chyba że zostanie to zmienione przez regułę kategorii.',
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczające tę kwotę, chyba że zostaną one nadpisane przez regułę kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznacz wydatki starsze niż określona liczba dni.',
                maxExpenseAgeDays: () => ({
                    one: '1 dzień',
                    other: (count: number) => `${count} dni`,
                }),
                billableDefault: 'Domyślne do rozliczenia',
                billableDefaultDescription: 'Wybierz, czy wydatki gotówkowe i na kartę kredytową powinny być domyślnie fakturowalne. Wydatki fakturowalne są włączane lub wyłączane w',
                billable: 'Podlegające fakturowaniu',
                billableDescription: 'Wydatki są najczęściej ponownie fakturowane klientom',
                nonBillable: 'Niepodlegające fakturowaniu',
                nonBillableDescription: 'Wydatki są czasami ponownie fakturowane klientom.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eParagony są tworzone automatycznie',
                eReceiptsHintLink: 'dla większości transakcji kredytowych w USD',
                attendeeTracking: 'Śledzenie uczestników',
                attendeeTrackingHint: 'Śledź koszt na osobę dla każdego wydatku.',
                prohibitedDefaultDescription:
                    'Oznacz wszystkie paragony, na których pojawiają się alkohol, hazard lub inne zabronione przedmioty. Wydatki z paragonami, na których występują te pozycje, będą wymagały ręcznej weryfikacji.',
                prohibitedExpenses: 'Zabronione wydatki',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe opłaty hotelowe',
                gambling: 'Hazardowanie',
                tobacco: 'Tytoń',
                adultEntertainment: 'Rozrywka dla dorosłych',
            },
            expenseReportRules: {
                examples: 'Przykłady:',
                title: 'Raporty wydatków',
                subtitle: 'Zautomatyzuj zgodność raportów wydatków, zatwierdzenia i płatności.',
                customReportNamesSubtitle: 'Dostosuj tytuły raportów za pomocą naszego',
                customNameTitle: 'Domyślny tytuł raportu',
                customNameDescription: 'Wybierz niestandardową nazwę dla raportów wydatków za pomocą naszego',
                customNameDescriptionLink: 'rozbudowane formuły',
                customNameInputLabel: 'Imię',
                customNameEmailPhoneExample: 'Email lub telefon członka: {report:submit:from}',
                customNameStartDateExample: 'Data rozpoczęcia raportu: {report:startdate}',
                customNameWorkspaceNameExample: 'Nazwa przestrzeni roboczej: {report:workspacename}',
                customNameReportIDExample: 'Report ID: {report:id}',
                customNameTotalExample: 'Suma: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Uniemożliw członkom zmianę nazw raportów niestandardowych',
                preventSelfApprovalsTitle: 'Zapobiegaj samodzielnym zatwierdzeniom',
                preventSelfApprovalsSubtitle: 'Uniemożliwiaj członkom przestrzeni roboczej zatwierdzanie własnych raportów wydatków.',
                autoApproveCompliantReportsTitle: 'Automatycznie zatwierdzaj zgodne raporty',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, które raporty wydatków są kwalifikowane do automatycznego zatwierdzenia.',
                autoApproveReportsUnderTitle: 'Automatycznie zatwierdzaj raporty poniżej',
                autoApproveReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą automatycznie zatwierdzane.',
                randomReportAuditTitle: 'Losowe sprawdzanie raportu',
                randomReportAuditDescription: 'Wymagaj, aby niektóre raporty były zatwierdzane ręcznie, nawet jeśli kwalifikują się do automatycznego zatwierdzenia.',
                autoPayApprovedReportsTitle: 'Automatyczne płacenie zatwierdzonych raportów',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, które raporty wydatków są kwalifikowane do automatycznej płatności.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Proszę wprowadzić kwotę mniejszą niż ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Przejdź do więcej funkcji i włącz przepływy pracy, a następnie dodaj płatności, aby odblokować tę funkcję.',
                autoPayReportsUnderTitle: 'Automatyczne opłacanie raportów poniżej',
                autoPayReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą automatycznie opłacane.',
                unlockFeatureGoToSubtitle: 'Przejdź do',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) => `i włącz przepływy pracy, a następnie dodaj ${featureName}, aby odblokować tę funkcję.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `i włącz ${featureName}, aby odblokować tę funkcję.`,
            },
            categoryRules: {
                title: 'Zasady kategorii',
                approver: 'Aprobujący',
                requireDescription: 'Wymagany opis',
                descriptionHint: 'Podpowiedź opisu',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Przypomnij pracownikom o dostarczeniu dodatkowych informacji dotyczących wydatków w kategorii „${categoryName}”. Ta wskazówka pojawia się w polu opisu wydatków.`,
                descriptionHintLabel: 'Wskazówka',
                descriptionHintSubtitle: 'Porada: Im krócej, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznacz kwoty powyżej',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Dotyczy kategorii „${categoryName}”.`,
                flagAmountsOverSubtitle: 'To zastępuje maksymalną kwotę dla wszystkich wydatków.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle: 'Oznacz kwoty wydatków według kategorii. Ta zasada zastępuje ogólną zasadę przestrzeni roboczej dotyczącą maksymalnej kwoty wydatku.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznacz całkowite wydatki kategorii na raport wydatków.',
                },
                requireReceiptsOver: 'Wymagaj paragonów powyżej',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Domyślny`,
                    never: 'Nigdy nie wymagaj paragonów',
                    always: 'Zawsze wymagaj paragonów',
                },
                defaultTaxRate: 'Domyślna stawka podatkowa',
                goTo: 'Przejdź do',
                andEnableWorkflows: 'i włącz przepływy pracy, a następnie dodaj zatwierdzenia, aby odblokować tę funkcję.',
            },
            customRules: {
                title: 'Niestandardowe zasady',
                subtitle: 'Opis',
                description: 'Wprowadź niestandardowe zasady dla raportów wydatków',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Zbierz',
                    description: 'Dla zespołów poszukujących automatyzacji swoich procesów.',
                },
                corporate: {
                    label: 'Kontrola',
                    description: 'Dla organizacji z zaawansowanymi wymaganiami.',
                },
            },
            description: 'Wybierz plan, który jest dla Ciebie odpowiedni. Aby uzyskać szczegółową listę funkcji i cen, sprawdź naszą',
            subscriptionLink: 'typy planów i strona pomocy dotycząca cen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Zobowiązałeś się do 1 aktywnego członka w planie Control do zakończenia rocznej subskrypcji w dniu ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję płatną za użycie i obniżyć do planu Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
                other: `Zobowiązałeś się do ${count} aktywnych członków w planie Control do momentu zakończenia rocznej subskrypcji w dniu ${annualSubscriptionEndDate}. Możesz przejść na subskrypcję płatną za użycie i zmienić na plan Collect od ${annualSubscriptionEndDate}, wyłączając automatyczne odnawianie w`,
            }),
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jesteśmy tutaj, aby oczyścić Twoją drogę do wielkości!',
        description: 'Wybierz jedną z poniższych opcji wsparcia:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Zaplanuj rozmowę wstępną',
        scheduleACall: 'Zaplanuj rozmowę',
        questionMarkButtonTooltip: 'Uzyskaj pomoc od naszego zespołu',
        exploreHelpDocs: 'Przeglądaj dokumenty pomocy',
        registerForWebinar: 'Zarejestruj się na webinar',
        onboardingHelp: 'Pomoc w rozpoczęciu pracy',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Zmień domyślny odcień skóry',
        headers: {
            frequentlyUsed: 'Często używane',
            smileysAndEmotion: 'Smileys i emocje',
            peopleAndBody: 'Ludzie i ciało',
            animalsAndNature: 'Zwierzęta i natura',
            foodAndDrink: 'Jedzenie i napoje',
            travelAndPlaces: 'Podróże i miejsca',
            activities: 'Działania',
            objects: 'Obiekty',
            symbols: 'Symbole',
            flags: 'Flagi',
        },
    },
    newRoomPage: {
        newRoom: 'Nowy pokój',
        groupName: 'Nazwa grupy',
        roomName: 'Nazwa pokoju',
        visibility: 'Widoczność',
        restrictedDescription: 'Osoby w Twojej przestrzeni roboczej mogą znaleźć ten pokój',
        privateDescription: 'Osoby zaproszone do tego pokoju mogą go znaleźć.',
        publicDescription: 'Każdy może znaleźć ten pokój',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Każdy może znaleźć ten pokój',
        createRoom: 'Utwórz pokój',
        roomAlreadyExistsError: 'Pokój o tej nazwie już istnieje',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} jest domyślnym pokojem we wszystkich przestrzeniach roboczych. Proszę wybrać inną nazwę.`,
        roomNameInvalidError: 'Nazwy pokoi mogą zawierać tylko małe litery, cyfry i myślniki',
        pleaseEnterRoomName: 'Proszę wprowadzić nazwę pokoju',
        pleaseSelectWorkspace: 'Proszę wybrać przestrzeń roboczą',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}zmienił nazwę na "${newName}" (wcześniej "${oldName}")` : `${actor}zmienił nazwę tego pokoju na "${newName}" (wcześniej "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Pokój został przemianowany na ${newName}`,
        social: 'społecznościowy',
        selectAWorkspace: 'Wybierz przestrzeń roboczą',
        growlMessageOnRenameError: 'Nie można zmienić nazwy pokoju roboczego. Sprawdź swoje połączenie i spróbuj ponownie.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Prywatne',
            public: 'Publiczny',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Ogłoszenie publiczne',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Prześlij i Zamknij',
        submitAndApprove: 'Prześlij i zatwierdź',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `dodano ${approverName} (${approverEmail}) jako zatwierdzającego dla ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `usunął ${approverName} (${approverEmail}) jako zatwierdzającego dla ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `zmieniono zatwierdzającego dla ${field} "${name}" na ${formatApprover(newApproverName, newApproverEmail)} (wcześniej ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `dodał kategorię "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `usunięto kategorię "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'wyłączony' : 'włączony'} kategoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodał kod płacowy "${newValue}" do kategorii "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `usunięto kod płacowy "${oldValue}" z kategorii "${categoryName}"`;
            }
            return `zmieniono kod płacowy kategorii "${categoryName}" na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `dodał kod GL "${newValue}" do kategorii "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `usunięto kod GL "${oldValue}" z kategorii "${categoryName}"`;
            }
            return `zmieniono kod GL kategorii „${categoryName}” na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `zmieniono opis kategorii "${categoryName}" na ${!oldValue ? 'wymagane' : 'nie wymagane'} (wcześniej ${!oldValue ? 'nie wymagane' : 'wymagane'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `dodano maksymalną kwotę ${newAmount} do kategorii "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `usunięto maksymalną kwotę ${oldAmount} z kategorii "${categoryName}"`;
            }
            return `zmieniono maksymalną kwotę kategorii "${categoryName}" na ${newAmount} (wcześniej ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `dodał limit typu ${newValue} do kategorii "${categoryName}"`;
            }
            return `zmieniono typ limitu kategorii „${categoryName}” na ${newValue} (wcześniej ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `zaktualizowano kategorię "${categoryName}", zmieniając Paragony na ${newValue}`;
            }
            return `zmieniono kategorię "${categoryName}" na ${newValue} (wcześniej ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmieniono nazwę kategorii z "${oldName}" na "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `usunięto opis "${oldValue}" z kategorii "${categoryName}"`;
            }
            return !oldValue
                ? `dodał podpowiedź opisu "${newValue}" do kategorii "${categoryName}"`
                : `zmieniono podpowiedź opisu kategorii "${categoryName}" na „${newValue}” (wcześniej „${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `zmieniono nazwę listy tagów na "${newName}" (wcześniej "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `dodał tag "${tagName}" do listy "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `zaktualizowano listę tagów "${tagListName}", zmieniając tag "${oldName}" na "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'włączony' : 'wyłączony'} tag "${tagName}" na liście "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `usunięto tag "${tagName}" z listy "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `usunięto "${count}" tagów z listy "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `zaktualizowano tag "${tagName}" na liście "${tagListName}", zmieniając ${updatedField} na "${newValue}" (wcześniej "${oldValue}")`;
            }
            return `zaktualizowano tag "${tagName}" na liście "${tagListName}" poprzez dodanie ${updatedField} o wartości "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `zmieniono ${customUnitName} ${updatedField} na "${newValue}" (wcześniej "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Śledzenie podatku ${newValue ? 'włączony' : 'wyłączony'} na podstawie stawek odległościowych`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `dodał nową stawkę "${customUnitName}" o nazwie "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `zmieniono stawkę ${customUnitName} ${updatedField} "${customUnitRateName}" na "${newValue}" (wcześniej "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `zmieniono stawkę podatku na stawce odległości "${customUnitRateName}" na "${newValue} (${newTaxPercentage})" (wcześniej "${oldValue} (${oldTaxPercentage})")`;
            }
            return `dodał stawkę podatkową "${newValue} (${newTaxPercentage})" do stawki za odległość "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `zmieniono część podlegającą zwrotowi podatku w stawce za odległość "${customUnitRateName}" na "${newValue}" (wcześniej "${oldValue}")`;
            }
            return `dodał część podatku podlegającą zwrotowi w wysokości "${newValue}" do stawki za odległość "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `usunięto stawkę "${rateName}" jednostki "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `dodano pole raportu ${fieldType} „${fieldName}”`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `ustaw domyślną wartość pola raportu "${fieldName}" na "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `dodał opcję "${optionName}" do pola raportu "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `usunięto opcję "${optionName}" z pola raportu "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'włączony' : 'wyłączony'} opcja "${optionName}" dla pola raportu "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'włączony' : 'wyłączony'} wszystkie opcje dla pola raportu "${fieldName}"`;
            }
            return `${allEnabled ? 'włączony' : 'wyłączony'} opcję "${optionName}" dla pola raportu "${fieldName}", czyniąc wszystkie opcje ${allEnabled ? 'włączony' : 'wyłączony'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `usunięto pole raportu ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `zaktualizowano "Zapobiegaj samoakceptacji" na "${newValue === 'true' ? 'Włączone' : 'Wyłączony'}" (wcześniej "${oldValue === 'true' ? 'Włączone' : 'Wyłączony'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmieniono maksymalną wymaganą kwotę wydatku na paragonie na ${newValue} (wcześniej ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zmieniono maksymalną kwotę wydatku dla naruszeń na ${newValue} (wcześniej ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano "Maksymalny wiek wydatku (dni)" na "${newValue}" (wcześniej "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `ustaw datę przesyłania miesięcznego raportu na "${newValue}"`;
            }
            return `zaktualizowano datę składania miesięcznego raportu na "${newValue}" (wcześniej "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `zaktualizowano "Ponowne obciążenie klientów kosztami" na "${newValue}" (wcześniej "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `zmieniono "Wymuś domyślne tytuły raportów" ${value ? 'na' : 'wyłączony'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `zaktualizował nazwę tego miejsca pracy na "${newName}" (wcześniej "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `ustaw opis tego miejsca pracy na "${newDescription}"` : `zaktualizowano opis tego miejsca pracy na "${newDescription}" (wcześniej "${oldDescription}")`,
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
                one: `usunął cię z procesu zatwierdzania i czatu wydatków ${joinedNames}. Wcześniej przesłane raporty będą nadal dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
                other: `usunięto Cię z przepływów zatwierdzania i czatów wydatków ${joinedNames}. Wcześniej złożone raporty będą nadal dostępne do zatwierdzenia w Twojej skrzynce odbiorczej.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `zaktualizowano Twoją rolę w ${policyName} z ${oldRole} na użytkownika. Zostałeś usunięty ze wszystkich czatów wydatków nadawcy, z wyjątkiem własnych.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `zaktualizowano domyślną walutę na ${newCurrency} (wcześniej ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `zaktualizowano częstotliwość automatycznego raportowania na "${newFrequency}" (wcześniej "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `zaktualizowano tryb zatwierdzania na "${newValue}" (wcześniej "${oldValue}")`,
        upgradedWorkspace: 'zaktualizowano tę przestrzeń roboczą do planu Control',
        downgradedWorkspace: 'obniżono ten przestrzeń roboczą do planu Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `zmieniono wskaźnik raportów losowo kierowanych do ręcznej akceptacji na ${Math.round(newAuditRate * 100)}% (wcześniej ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `zmieniono limit ręcznego zatwierdzania dla wszystkich wydatków na ${newLimit} (wcześniej ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Nie znaleziono członka.',
        useInviteButton: 'Aby zaprosić nowego członka do czatu, użyj przycisku zaproszenia powyżej.',
        notAuthorized: `Nie masz dostępu do tej strony. Jeśli próbujesz dołączyć do tego pokoju, poproś członka pokoju, aby Cię dodał. Coś innego? Skontaktuj się z ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Czy na pewno chcesz usunąć ${memberName} z pokoju?`,
            other: 'Czy na pewno chcesz usunąć wybranych członków z pokoju?',
        }),
        error: {
            genericAdd: 'Wystąpił problem z dodaniem tego członka pokoju',
        },
    },
    newTaskPage: {
        assignTask: 'Przypisz zadanie',
        assignMe: 'Przypisz do mnie',
        confirmTask: 'Potwierdź zadanie',
        confirmError: 'Proszę wprowadzić tytuł i wybrać miejsce udostępnienia',
        descriptionOptional: 'Opis (opcjonalnie)',
        pleaseEnterTaskName: 'Proszę wprowadzić tytuł',
        pleaseEnterTaskDestination: 'Proszę wybrać, gdzie chcesz udostępnić to zadanie',
    },
    task: {
        task: 'Zadanie',
        title: 'Tytuł',
        description: 'Opis',
        assignee: 'Przypisany',
        completed: 'Zakończono',
        action: 'Ukończ',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `zadanie dla ${title}`,
            completed: 'oznaczone jako ukończone',
            canceled: 'usunięte zadanie',
            reopened: 'oznaczone jako niekompletne',
            error: 'Nie masz uprawnień do wykonania żądanej akcji.',
        },
        markAsComplete: 'Oznacz jako ukończone',
        markAsIncomplete: 'Oznacz jako niekompletne',
        assigneeError: 'Wystąpił błąd podczas przypisywania tego zadania. Proszę spróbować przypisać je do innej osoby.',
        genericCreateTaskFailureMessage: 'Wystąpił błąd podczas tworzenia tego zadania. Proszę spróbować ponownie później.',
        deleteTask: 'Usuń zadanie',
        deleteConfirmation: 'Czy na pewno chcesz usunąć to zadanie?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Wyciąg za ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Skróty klawiaturowe',
        subtitle: 'Oszczędzaj czas dzięki tym przydatnym skrótom klawiaturowym:',
        shortcuts: {
            openShortcutDialog: 'Otwiera okno dialogowe skrótów klawiaturowych',
            markAllMessagesAsRead: 'Oznacz wszystkie wiadomości jako przeczytane',
            escape: 'Dialogi ucieczki',
            search: 'Otwórz okno wyszukiwania',
            newChat: 'Nowy ekran czatu',
            copy: 'Skopiuj komentarz',
            openDebug: 'Otwórz okno dialogowe preferencji testowania',
        },
    },
    guides: {
        screenShare: 'Udostępnianie ekranu',
        screenShareRequest: 'Expensify zaprasza Cię do udostępnienia ekranu',
    },
    search: {
        resultsAreLimited: 'Wyniki wyszukiwania są ograniczone.',
        viewResults: 'Wyświetl wyniki',
        resetFilters: 'Zresetuj filtry',
        searchResults: {
            emptyResults: {
                title: 'Brak danych do wyświetlenia',
                subtitle: 'Spróbuj dostosować kryteria wyszukiwania lub utwórz coś za pomocą zielonego przycisku +.',
            },
            emptyExpenseResults: {
                title: 'Nie utworzyłeś jeszcze żadnych wydatków.',
                subtitle: 'Utwórz wydatek lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć wydatek.',
            },
            emptyReportResults: {
                title: 'Nie utworzyłeś jeszcze żadnych raportów.',
                subtitle: 'Utwórz raport lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć raport.',
            },
            emptyInvoiceResults: {
                title: 'Nie utworzyłeś jeszcze żadnych faktur.',
                subtitle: 'Wyślij fakturę lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby wysłać fakturę.',
            },
            emptyTripResults: {
                title: 'Brak wyświetlanych podróży',
                subtitle: 'Rozpocznij, rezerwując swoją pierwszą podróż poniżej.',
                buttonText: 'Zarezerwuj podróż',
            },
            emptySubmitResults: {
                title: 'Brak wydatków do przesłania',
                subtitle: 'Wszystko w porządku. Zrób rundę zwycięstwa!',
                buttonText: 'Utwórz raport',
            },
            emptyApproveResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny relaks. Dobra robota!',
            },
            emptyPayResults: {
                title: 'Brak wydatków do zapłaty',
                subtitle: 'Gratulacje! Przekroczyłeś linię mety.',
            },
            emptyExportResults: {
                title: 'Brak wydatków do eksportu',
                subtitle: 'Czas się zrelaksować, dobra robota.',
            },
            emptyUnapprovedResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny relaks. Dobra robota!',
            },
        },
        unapproved: 'Não aprovado',
        unapprovedCash: 'Dinheiro não aprovado',
        unapprovedCompanyCards: 'Cartões de empresa não aprovados',
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usuń zapisaną wyszukiwarkę',
        deleteSavedSearchConfirm: 'Czy na pewno chcesz usunąć to wyszukiwanie?',
        searchName: 'Wyszukaj imię',
        savedSearchesMenuItemTitle: 'Zapisano',
        groupedExpenses: 'pogrupowane wydatki',
        bulkActions: {
            approve: 'Zatwierdź',
            pay: 'Zapłać',
            delete: 'Usuń',
            hold: 'Trzymaj',
            unhold: 'Usuń blokadę',
            noOptionsAvailable: 'Brak dostępnych opcji dla wybranej grupy wydatków.',
        },
        filtersHeader: 'Filtry',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Before ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `After ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nunca',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'No mês passado',
                },
            },
            status: 'Status',
            keyword: 'Słowo kluczowe',
            hasKeywords: 'Ma słowa kluczowe',
            currency: 'Waluta',
            link: 'Link',
            pinned: 'Przypięte',
            unread: 'Nieprzeczytane',
            completed: 'Zakończono',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Mniej niż ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Większe niż ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Pomiędzy ${greaterThan} a ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Indywidualne karty',
                closedCards: 'Zamknięte karty',
                cardFeeds: 'Kanały kart',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Wszystkie ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Wszystkie zaimportowane karty CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Obecny',
            past: 'Przeszłość',
            submitted: 'Data złożenia',
            approved: 'Data zatwierdzenia',
            paid: 'Data płatności',
            exported: 'Data eksportu',
            posted: 'Data opublikowania',
            billable: 'Podlegające fakturowaniu',
            reimbursable: 'Podlegające zwrotowi',
            groupBy: {
                reports: 'Relatório',
                members: 'Membro',
                cards: 'Karta',
            },
        },
        groupBy: 'Agrupar por',
        moneyRequestReport: {
            emptyStateTitle: 'Ten raport nie zawiera wydatków.',
            emptyStateSubtitle: 'Możesz dodać wydatki do tego raportu, używając przycisku powyżej.',
        },
        noCategory: 'Brak kategorii',
        noTag: 'Brak tagu',
        expenseType: 'Typ wydatku',
        recentSearches: 'Ostatnie wyszukiwania',
        recentChats: 'Ostatnie czaty',
        searchIn: 'Szukaj w',
        searchPlaceholder: 'Wyszukaj coś',
        suggestions: 'Sugestie',
        exportSearchResults: {
            title: 'Utwórz eksport',
            description: 'Wow, to dużo przedmiotów! Spakujemy je, a Concierge wkrótce wyśle Ci plik.',
        },
        exportAll: {
            selectAllMatchingItems: 'Wybierz wszystkie pasujące elementy',
            allMatchingItemsSelected: 'Wszystkie pasujące elementy zostały wybrane',
        },
    },
    genericErrorPage: {
        title: 'Ups, coś poszło nie tak!',
        body: {
            helpTextMobile: 'Proszę zamknąć i ponownie otworzyć aplikację lub przełączyć się na',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Jeśli problem będzie się powtarzał, skontaktuj się z',
        },
        refresh: 'Odśwież',
    },
    fileDownload: {
        success: {
            title: 'Pobrano!',
            message: 'Załącznik został pomyślnie pobrany!',
            qrMessage:
                'Sprawdź folder ze zdjęciami lub pobranymi plikami, aby znaleźć kopię swojego kodu QR. Porada: Dodaj go do prezentacji, aby Twoja publiczność mogła go zeskanować i bezpośrednio się z Tobą połączyć.',
        },
        generalError: {
            title: 'Błąd załącznika',
            message: 'Załącznik nie może zostać pobrany',
        },
        permissionError: {
            title: 'Dostęp do pamięci masowej',
            message: 'Expensify nie może zapisać załączników bez dostępu do pamięci. Stuknij ustawienia, aby zaktualizować uprawnienia.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nowy Expensify',
        about: 'O nowym Expensify',
        update: 'Zaktualizuj New Expensify',
        checkForUpdates: 'Sprawdź aktualizacje',
        toggleDevTools: 'Przełącz Narzędzia Deweloperskie',
        viewShortcuts: 'Wyświetl skróty klawiaturowe',
        services: 'Usługi',
        hide: 'Ukryj New Expensify',
        hideOthers: 'Ukryj pozostałe',
        showAll: 'Pokaż wszystkie',
        quit: 'Zrezygnuj z New Expensify',
        fileMenu: 'Plik',
        closeWindow: 'Zamknij okno',
        editMenu: 'Edytuj',
        undo: 'Cofnij',
        redo: 'Ponów',
        cut: 'Wytnij',
        copy: 'Kopiuj',
        paste: 'Wklej',
        pasteAndMatchStyle: 'Wklej i Dopasuj Styl',
        pasteAsPlainText: 'Wklej jako tekst niesformatowany',
        delete: 'Usuń',
        selectAll: 'Zaznacz wszystko',
        speechSubmenu: 'Mowa',
        startSpeaking: 'Zacznij mówić',
        stopSpeaking: 'Przestań mówić',
        viewMenu: 'Widok',
        reload: 'Przeładuj',
        forceReload: 'Wymuś ponowne załadowanie',
        resetZoom: 'Rzeczywisty rozmiar',
        zoomIn: 'Powiększ',
        zoomOut: 'Oddalaj',
        togglefullscreen: 'Przełącz pełny ekran',
        historyMenu: 'Historia',
        back: 'Wstecz',
        forward: 'Prześlij dalej',
        windowMenu: 'Okno',
        minimize: 'Zminimalizuj',
        zoom: 'Zoom',
        front: 'Przenieś wszystko na wierzch',
        helpMenu: 'Pomoc',
        learnMore: 'Dowiedz się więcej',
        documentation: 'Dokumentacja',
        communityDiscussions: 'Dyskusje społecznościowe',
        searchIssues: 'Wyszukaj problemy',
    },
    historyMenu: {
        forward: 'Prześlij dalej',
        back: 'Wstecz',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Aktualizacja dostępna',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Nowa wersja będzie dostępna wkrótce.${!isSilentUpdating ? 'Powiadomimy Cię, gdy będziemy gotowi do aktualizacji.' : ''}`,
            soundsGood: 'Brzmi dobrze',
        },
        notAvailable: {
            title: 'Aktualizacja niedostępna',
            message: 'Obecnie nie ma dostępnych aktualizacji. Proszę sprawdzić ponownie później!',
            okay: 'Okay',
        },
        error: {
            title: 'Aktualizacja nie powiodła się',
            message: 'Nie udało nam się sprawdzić aktualizacji. Spróbuj ponownie za chwilę.',
        },
    },
    report: {
        newReport: {
            createReport: 'Utwórz raport',
            chooseWorkspace: 'Wybierz przestrzeń roboczą dla tego raportu.',
        },
        genericCreateReportFailureMessage: 'Nieoczekiwany błąd podczas tworzenia tego czatu. Proszę spróbować ponownie później.',
        genericAddCommentFailureMessage: 'Nieoczekiwany błąd podczas publikowania komentarza. Spróbuj ponownie później.',
        genericUpdateReportFieldFailureMessage: 'Nieoczekiwany błąd podczas aktualizacji pola. Spróbuj ponownie później.',
        genericUpdateReportNameEditFailureMessage: 'Nieoczekiwany błąd podczas zmiany nazwy raportu. Proszę spróbować ponownie później.',
        noActivityYet: 'Brak aktywności',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `zmieniono ${fieldName} z ${oldValue} na ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `zmieniono ${fieldName} na ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `zmieniono przestrzeń roboczą na ${toPolicyName}${fromPolicyName ? `(uprzednio ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `zmieniono typ z ${oldType} na ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `wysłał ten raport do ${delegateUser}, ponieważ ${originalManager} jest na urlopie`,
                exportedToCSV: `wyeksportowano do CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `wyeksportowano do ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `wyeksportowano do ${label} przez`,
                    automaticActionTwo: 'ustawienia księgowe',
                    manual: ({label}: ExportedToIntegrationParams) => `oznaczył ten raport jako ręcznie wyeksportowany do ${label}.`,
                    automaticActionThree: 'i pomyślnie utworzono rekord dla',
                    reimburseableLink: 'wydatki z własnej kieszeni',
                    nonReimbursableLink: 'wydatki na firmową kartę',
                    pending: ({label}: ExportedToIntegrationParams) => `rozpoczęto eksportowanie tego raportu do ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `nie udało się wyeksportować tego raportu do ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `dodano paragon`,
                managerDetachReceipt: `usunięto paragon`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `zapłacono ${currency}${amount} gdzie indziej`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `zapłacono ${currency}${amount} przez integrację`,
                outdatedBankAccount: `nie można było przetworzyć płatności z powodu problemu z kontem bankowym płatnika`,
                reimbursementACHBounce: `nie można przetworzyć płatności, ponieważ płatnik nie ma wystarczających środków`,
                reimbursementACHCancelled: `anulował płatność`,
                reimbursementAccountChanged: `nie można było przetworzyć płatności, ponieważ płatnik zmienił konto bankowe`,
                reimbursementDelayed: `przetworzono płatność, ale jest opóźniona o 1-2 dni robocze więcej`,
                selectedForRandomAudit: `losowo wybrany do przeglądu`,
                selectedForRandomAuditMarkdown: `[losowo wybrany](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) do przeglądu`,
                share: ({to}: ShareParams) => `zaproszony członek ${to}`,
                unshare: ({to}: UnshareParams) => `usunięto członka ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `zapłacono ${currency}${amount}`,
                takeControl: `przejął kontrolę`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `nie udało się zsynchronizować z ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `dodano ${email} jako ${role === 'member' ? 'a' : 'an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `zaktualizowano rolę ${email} na ${newRole} (wcześniej ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 1 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano "${newValue}" do pola niestandardowego 1 użytkownika ${email}`
                        : `zmieniono pole niestandardowe 1 użytkownika ${email} na "${newValue}" (wcześniej "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `usunięto pole niestandardowe 2 użytkownika ${email} (wcześniej „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `dodano "${newValue}" do pola niestandardowego 2 użytkownika ${email}`
                        : `zmieniono pole niestandardowe 2 użytkownika ${email} na "${newValue}" (wcześniej "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} opuścił(a) przestrzeń roboczą`,
                removeMember: ({email, role}: AddEmployeeParams) => `usunięto ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `usunięto połączenie z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `połączono z ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'opuścił czat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} dla ${dayCount} ${dayCount === 1 ? 'dzień' : 'dni'} do ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} z ${timePeriod} dnia ${date}`,
    },
    footer: {
        features: 'Funkcje',
        expenseManagement: 'Zarządzanie wydatkami',
        spendManagement: 'Zarządzanie wydatkami',
        expenseReports: 'Raporty wydatków',
        companyCreditCard: 'Karta kredytowa firmy',
        receiptScanningApp: 'Aplikacja do skanowania paragonów',
        billPay: 'Bill Pay',
        invoicing: 'Fakturowanie',
        CPACard: 'Karta CPA',
        payroll: 'Payroll',
        travel: 'Podróżować',
        resources: 'Zasoby',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Wsparcie',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Warunki korzystania z usługi',
        privacy: 'Prywatność',
        learnMore: 'Dowiedz się więcej',
        aboutExpensify: 'O Expensify',
        blog: 'Blog',
        jobs: 'Prace',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relacje Inwestorskie',
        getStarted: 'Rozpocznij',
        createAccount: 'Utwórz nowe konto',
        logIn: 'Zaloguj się',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Przejdź z powrotem do listy czatów',
        chatWelcomeMessage: 'Wiadomość powitalna czatu',
        navigatesToChat: 'Przechodzi do czatu',
        newMessageLineIndicator: 'Wskaźnik nowej wiadomości',
        chatMessage: 'Wiadomość czatu',
        lastChatMessagePreview: 'Podgląd ostatniej wiadomości na czacie',
        workspaceName: 'Nazwa przestrzeni roboczej',
        chatUserDisplayNames: 'Nazwy wyświetlane członków czatu',
        scrollToNewestMessages: 'Przewiń do najnowszych wiadomości',
        preStyledText: 'Wstępnie sformatowany tekst',
        viewAttachment: 'Wyświetl załącznik',
    },
    parentReportAction: {
        deletedReport: 'Usunięty raport',
        deletedMessage: 'Usunięta wiadomość',
        deletedExpense: 'Usunięty wydatek',
        reversedTransaction: 'Cofnięta transakcja',
        deletedTask: 'Usunięte zadanie',
        hiddenMessage: 'Ukryta wiadomość',
    },
    threads: {
        thread: 'Wątek',
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
        flagDescription: 'Wszystkie oznaczone wiadomości zostaną przesłane do moderatora do weryfikacji.',
        chooseAReason: 'Wybierz powód oznaczenia poniżej:',
        spam: 'Spam',
        spamDescription: 'Niechciana promocja niezwiązana z tematem',
        inconsiderate: 'Nieuprzejmy',
        inconsiderateDescription: 'Obrażające lub lekceważące sformułowania, z wątpliwymi intencjami',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne forsowanie programu pomimo uzasadnionych zastrzeżeń',
        bullying: 'Nękanie',
        bullyingDescription: 'Celowanie w jednostkę w celu uzyskania posłuszeństwa',
        harassment: 'Nękanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne ogólnie dyskryminujące zachowanie',
        assault: 'Atak',
        assaultDescription: 'Specyficzny atak emocjonalny z zamiarem wyrządzenia krzywdy',
        flaggedContent: 'Ta wiadomość została oznaczona jako naruszająca zasady naszej społeczności, a jej treść została ukryta.',
        hideMessage: 'Ukryj wiadomość',
        revealMessage: 'Pokaż wiadomość',
        levelOneResult: 'Wysyła anonimowe ostrzeżenie i wiadomość jest zgłaszana do przeglądu.',
        levelTwoResult: 'Wiadomość ukryta z kanału, plus anonimowe ostrzeżenie i wiadomość została zgłoszona do przeglądu.',
        levelThreeResult: 'Wiadomość usunięta z kanału, dodano anonimowe ostrzeżenie, a wiadomość została zgłoszona do przeglądu.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Zaproś ich',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akceptuj',
        decline: 'Odrzuć',
    },
    actionableMentionTrackExpense: {
        submit: 'Prześlij to komuś',
        categorize: 'Kategoryzuj to',
        share: 'Udostępnij to mojemu księgowemu',
        nothing: 'Nic na razie',
    },
    teachersUnitePage: {
        teachersUnite: 'Nauczyciele, łączcie się',
        joinExpensifyOrg:
            'Dołącz do Expensify.org, aby wyeliminować niesprawiedliwość na całym świecie. Obecna kampania "Teachers Unite" wspiera nauczycieli wszędzie, dzieląc koszty niezbędnych materiałów szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Świetnie! Proszę podziel się ich informacjami, abyśmy mogli się z nimi skontaktować.',
        introSchoolPrincipal: 'Wprowadzenie do dyrektora szkoły',
        schoolPrincipalVerifyExpense:
            'Expensify.org dzieli koszty podstawowych przyborów szkolnych, aby uczniowie z gospodarstw domowych o niskich dochodach mogli mieć lepsze doświadczenia edukacyjne. Twój dyrektor zostanie poproszony o weryfikację Twoich wydatków.',
        principalFirstName: 'Imię główne',
        principalLastName: 'Nazwisko dyrektora',
        principalWorkEmail: 'Główny służbowy adres e-mail',
        updateYourEmail: 'Zaktualizuj swój adres e-mail',
        updateEmail: 'Zaktualizuj adres e-mail',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Zanim przejdziesz dalej, upewnij się, że ustawiłeś swój szkolny e-mail jako domyślną metodę kontaktu. Możesz to zrobić w Ustawieniach > Profil > <a href="${contactMethodsRoute}">Metody kontaktu</a>.`,
        error: {
            enterPhoneEmail: 'Wprowadź prawidłowy adres e-mail lub numer telefonu',
            enterEmail: 'Wprowadź adres e-mail',
            enterValidEmail: 'Wprowadź prawidłowy adres e-mail',
            tryDifferentEmail: 'Proszę spróbować inny adres e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Nieaktywowany',
        outOfPocket: 'Wydatki z własnej kieszeni',
        companySpend: 'Wydatki firmowe',
    },
    distance: {
        addStop: 'Dodaj przystanek',
        deleteWaypoint: 'Usuń punkt orientacyjny',
        deleteWaypointConfirmation: 'Czy na pewno chcesz usunąć ten punkt nawigacyjny?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Zmapuj oczekujące',
            subtitle: 'Mapa zostanie wygenerowana, gdy ponownie połączysz się z internetem',
            onlineSubtitle: 'Chwileczkę, przygotowujemy mapę.',
            errorTitle: 'Błąd mapy',
            errorSubtitle: 'Wystąpił błąd podczas ładowania mapy. Proszę spróbować ponownie.',
        },
        error: {
            selectSuggestedAddress: 'Proszę wybrać sugerowany adres lub użyć bieżącej lokalizacji',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Karta raportu zgubiona lub uszkodzona',
        nextButtonLabel: 'Następny',
        reasonTitle: 'Dlaczego potrzebujesz nowej karty?',
        cardDamaged: 'Moja karta została uszkodzona',
        cardLostOrStolen: 'Moja karta została zgubiona lub skradziona',
        confirmAddressTitle: 'Proszę potwierdzić adres pocztowy dla nowej karty.',
        cardDamagedInfo: 'Twoja nowa karta dotrze w ciągu 2-3 dni roboczych. Twoja obecna karta będzie działać do momentu aktywacji nowej.',
        cardLostOrStolenInfo: 'Twoja obecna karta zostanie trwale dezaktywowana, gdy tylko złożysz zamówienie. Większość kart dociera w ciągu kilku dni roboczych.',
        address: 'Adres',
        deactivateCardButton: 'Dezaktywuj kartę',
        shipNewCardButton: 'Wyślij nową kartę',
        addressError: 'Adres jest wymagany',
        successTitle: 'Twoja nowa karta jest w drodze!',
        successDescription: 'Po jej otrzymaniu, będziesz musiał(a) ją aktywować. W międzyczasie możesz korzystać z karty wirtualnej.',
        reasonError: 'Powód jest wymagany',
    },
    eReceipt: {
        guaranteed: 'Gwarantowany eParagon',
        transactionDate: 'Data transakcji',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Rozpocznij czat,',
            buttonText2: 'poleć znajomego.',
            header: 'Rozpocznij czat, poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi również korzystali z Expensify? Po prostu rozpocznij z nimi czat, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Prześlij wydatek,',
            buttonText2: 'poleć swojego szefa.',
            header: 'Złóż wydatek, poleć swojego szefa',
            body: 'Chcesz, aby Twój szef również korzystał z Expensify? Po prostu prześlij mu raport wydatków, a my zajmiemy się resztą.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi również korzystali z Expensify? Po prostu czatuj, płać lub dziel się z nimi wydatkami, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zapraszający!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Poleć znajomego',
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi również korzystali z Expensify? Po prostu czatuj, płać lub dziel się z nimi wydatkami, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zapraszający!',
        },
        copyReferralLink: 'Skopiuj link zaproszenia',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji w',
            phrase2: 'po pomoc',
        },
        default: {
            phrase1: 'Wiadomość',
            phrase2: 'w celu uzyskania pomocy przy konfiguracji',
        },
    },
    violations: {
        allTagLevelsRequired: 'Wszystkie wymagane tagi',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) => `${rejectedBy} odrzucił ten wydatek z komentarzem „${rejectReason}”`,
        billableExpense: 'Opłata nie jest już ważna',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Receipt required${formattedLimit ? `powyżej ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategoria nie jest już ważna',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Zastosowano ${surcharge}% opłatę za przeliczenie`,
        customUnitOutOfPolicy: 'Stawka nie jest ważna dla tego miejsca pracy',
        duplicatedTransaction: 'Duplikat',
        fieldRequired: 'Pola raportu są wymagane',
        futureDate: 'Przyszła data niedozwolona',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Oznaczone o ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data starsza niż ${maxAge} dni`,
        missingCategory: 'Brakująca kategoria',
        missingComment: 'Wymagany opis dla wybranej kategorii',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Brakujący ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Kwota różni się od obliczonej odległości';
                case 'card':
                    return 'Kwota większa niż transakcja kartą';
                default:
                    if (displayPercentVariance) {
                        return `Kwota ${displayPercentVariance}% większa niż zeskanowany paragon`;
                    }
                    return 'Kwota większa niż zeskanowany paragon';
            }
        },
        modifiedDate: 'Data różni się od zeskanowanego paragonu',
        nonExpensiworksExpense: 'Wydatek spoza Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Wydatek przekracza limit automatycznej akceptacji wynoszący ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Kwota przekracza limit ${formattedLimit} na osobę w kategorii`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekracza limit ${formattedLimit}/osobę`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Kwota przekracza limit ${formattedLimit}/osobę`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Kwota przekracza dzienny limit ${formattedLimit}/osoba dla kategorii`,
        receiptNotSmartScanned:
            'Szczegóły wydatków i paragon dodane ręcznie. Proszę zweryfikować szczegóły. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Dowiedz się więcej</a> o automatycznym audycie wszystkich paragonów.',
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
                    return `${preMessage} tytoń`;
                case 'adultEntertainment':
                    return `${preMessage} rozrywka dla dorosłych`;
                case 'hotelIncidentals':
                    return `${preMessage} wydatki hotelowe`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Wymagana recenzja',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Nie można automatycznie dopasować paragonu z powodu przerwanego połączenia z bankiem.';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Nie można automatycznie dopasować paragonu z powodu zerwanego połączenia z bankiem, które ${email} musi naprawić.`
                    : 'Nie można automatycznie dopasować paragonu z powodu przerwanego połączenia z bankiem, które musisz naprawić.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Poproś ${member}, aby oznaczył jako gotówkę lub poczekaj 7 dni i spróbuj ponownie.` : 'Oczekiwanie na połączenie z transakcją kartową.';
            }
            return '';
        },
        brokenConnection530Error: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem',
        adminBrokenConnectionError: 'Paragon oczekuje z powodu przerwanego połączenia z bankiem. Proszę rozwiązać w',
        memberBrokenConnectionError: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem. Proszę poprosić administratora przestrzeni roboczej o rozwiązanie problemu.',
        markAsCashToIgnore: 'Oznacz jako gotówkę, aby zignorować i zażądać płatności.',
        smartscanFailed: ({canEdit = true}) => `Skanowanie paragonu nie powiodło się.${canEdit ? 'Wprowadź dane ręcznie.' : ''}`,
        receiptGeneratedWithAI: 'Potencjalny paragon wygenerowany przez AI',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nie jest już ważny`,
        taxAmountChanged: 'Kwota podatku została zmodyfikowana',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Podatek'} już nie jest ważny`,
        taxRateChanged: 'Stawka podatkowa została zmodyfikowana',
        taxRequired: 'Brakująca stawka podatkowa',
        none: 'None',
        taxCodeToKeep: 'Wybierz, który kod podatkowy zachować',
        tagToKeep: 'Wybierz, który tag zachować',
        isTransactionReimbursable: 'Wybierz, czy transakcja podlega zwrotowi kosztów',
        merchantToKeep: 'Wybierz, którego sprzedawcę zachować',
        descriptionToKeep: 'Wybierz opis do zachowania',
        categoryToKeep: 'Wybierz kategorię do zachowania',
        isTransactionBillable: 'Wybierz, czy transakcja jest rozliczalna',
        keepThisOne: 'Keep this one',
        confirmDetails: `Potwierdź szczegóły, które zachowujesz`,
        confirmDuplicatesInfo: `Duplikaty wniosków, których nie zachowasz, zostaną wstrzymane, aby członek mógł je usunąć.`,
        hold: 'Ten wydatek został wstrzymany',
        resolvedDuplicates: 'rozwiązano duplikat',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `Pole ${fieldName} jest wymagane`,
    },
    violationDismissal: {
        rter: {
            manual: 'oznaczył ten paragon jako gotówka',
        },
        duplicatedTransaction: {
            manual: 'rozwiązano duplikat',
        },
    },
    videoPlayer: {
        play: 'Graj',
        pause: 'Pauza',
        fullscreen: 'Pełny ekran',
        playbackSpeed: 'Prędkość odtwarzania',
        expand: 'Rozwiń',
        mute: 'Wycisz',
        unmute: 'Wyłącz wyciszenie',
        normal: 'Normalny',
    },
    exitSurvey: {
        header: 'Zanim pójdziesz',
        reasonPage: {
            title: 'Proszę, powiedz nam, dlaczego odchodzisz',
            subtitle: 'Zanim odejdziesz, prosimy powiedz nam, dlaczego chciałbyś przejść na Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Potrzebuję funkcji, która jest dostępna tylko w Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Nie rozumiem, jak korzystać z New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Rozumiem, jak korzystać z New Expensify, ale wolę Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Jakiej funkcji potrzebujesz, która nie jest dostępna w Nowym Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Co próbujesz zrobić?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Dlaczego wolisz Expensify Classic?',
        },
        responsePlaceholder: 'Twoja odpowiedź',
        thankYou: 'Dzięki za opinię!',
        thankYouSubtitle: 'Twoje odpowiedzi pomogą nam stworzyć lepszy produkt, aby załatwiać sprawy. Dziękujemy bardzo!',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
        offlineTitle: 'Wygląda na to, że utknąłeś tutaj...',
        offline:
            'Wygląda na to, że jesteś offline. Niestety, Expensify Classic nie działa w trybie offline, ale Nowy Expensify działa. Jeśli wolisz używać Expensify Classic, spróbuj ponownie, gdy będziesz mieć połączenie z internetem.',
        quickTip: 'Szybka wskazówka...',
        quickTipSubTitle: 'Możesz przejść bezpośrednio do Expensify Classic, odwiedzając expensify.com. Dodaj do zakładek, aby mieć łatwy skrót!',
        bookACall: 'Zarezerwuj rozmowę',
        noThanks: 'Nie, dziękuję',
        bookACallTitle: 'Czy chciałbyś porozmawiać z menedżerem produktu?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Bezpośrednie czatowanie na wydatkach i raportach',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Możliwość robienia wszystkiego na urządzeniu mobilnym',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Podróże i wydatki z prędkością czatu',
        },
        bookACallTextTop: 'Przechodząc na Expensify Classic, przegapisz:',
        bookACallTextBottom:
            'Bylibyśmy podekscytowani możliwością rozmowy z Tobą, aby zrozumieć dlaczego. Możesz umówić się na rozmowę z jednym z naszych starszych menedżerów produktu, aby omówić swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przenieś mnie do Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Wystąpił błąd podczas ładowania kolejnych wiadomości',
        tryAgain: 'Spróbuj ponownie',
    },
    systemMessage: {
        mergedWithCashTransaction: 'dopasowano paragon do tej transakcji',
    },
    subscription: {
        authenticatePaymentCard: 'Uwierzytelnij kartę płatniczą',
        mobileReducedFunctionalityMessage: 'Nie możesz wprowadzać zmian w swojej subskrypcji w aplikacji mobilnej.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Darmowa wersja próbna: pozostało ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Twoje informacje o płatności są nieaktualne',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Zaktualizuj swoją kartę płatniczą do ${date}, aby nadal korzystać ze wszystkich ulubionych funkcji.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Twoja płatność nie mogła zostać przetworzona',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Twoja opłata z dnia ${date} w wysokości ${purchaseAmountOwed} nie mogła zostać przetworzona. Proszę dodać kartę płatniczą, aby uregulować zaległą kwotę.`
                        : 'Proszę dodać kartę płatniczą, aby uregulować należną kwotę.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje informacje o płatności są nieaktualne',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Twoja płatność jest zaległa. Prosimy o opłacenie faktury do ${date}, aby uniknąć przerwania usługi.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje informacje o płatności są nieaktualne',
                subtitle: 'Twoja płatność jest zaległa. Proszę opłać swoją fakturę.',
            },
            billingDisputePending: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Zakwestionowałeś opłatę w wysokości ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto zostanie zablokowane do czasu rozwiązania sporu z bankiem.`,
            },
            cardAuthenticationRequired: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Twoja karta płatnicza nie została w pełni uwierzytelniona. Proszę ukończyć proces uwierzytelniania, aby aktywować kartę płatniczą kończącą się na ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Twoja karta płatnicza została odrzucona z powodu niewystarczających środków. Spróbuj ponownie lub dodaj nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Twoja karta płatnicza wygasła. Proszę dodać nową kartę płatniczą, aby uregulować zaległe saldo w wysokości ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Twoja karta wkrótce wygaśnie',
                subtitle:
                    'Twoja karta płatnicza wygaśnie pod koniec tego miesiąca. Kliknij menu z trzema kropkami poniżej, aby ją zaktualizować i nadal korzystać ze wszystkich ulubionych funkcji.',
            },
            retryBillingSuccess: {
                title: 'Sukces!',
                subtitle: 'Twoja karta została pomyślnie obciążona.',
            },
            retryBillingError: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle:
                    'Zanim spróbujesz ponownie, skontaktuj się bezpośrednio ze swoim bankiem, aby autoryzować opłaty Expensify i usunąć wszelkie blokady. W przeciwnym razie spróbuj dodać inną kartę płatniczą.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Zakwestionowałeś opłatę w wysokości ${amountOwed} na karcie kończącej się na ${cardEnding}. Twoje konto zostanie zablokowane do czasu rozwiązania sporu z bankiem.`,
            preTrial: {
                title: 'Rozpocznij darmowy okres próbny',
                subtitleStart: 'Jako kolejny krok,',
                subtitleLink: 'ukończ listę kontrolną konfiguracji',
                subtitleEnd: 'aby Twój zespół mógł zacząć rozliczać wydatki.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Okres próbny: ${numOfDays} ${numOfDays === 1 ? 'dzień' : 'dni'} pozostało!`,
                subtitle: 'Dodaj kartę płatniczą, aby nadal korzystać ze wszystkich ulubionych funkcji.',
            },
            trialEnded: {
                title: 'Twój darmowy okres próbny dobiegł końca',
                subtitle: 'Dodaj kartę płatniczą, aby nadal korzystać ze wszystkich ulubionych funkcji.',
            },
            earlyDiscount: {
                claimOffer: 'Zgłoś ofertę',
                noThanks: 'Nie, dziękuję',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% zniżki na pierwszy rok!</strong> Wystarczy dodać kartę płatniczą i rozpocząć roczną subskrypcję.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Oferta ograniczona czasowo: ${discountType}% zniżki na pierwszy rok!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Zgłoś w ciągu ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Płatność',
            subtitle: 'Dodaj kartę, aby opłacić subskrypcję Expensify.',
            addCardButton: 'Dodaj kartę płatniczą',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Twoja następna data płatności to ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Karta kończąca się na ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nazwa: ${name}, Ważność: ${expiration}, Waluta: ${currency}`,
            changeCard: 'Zmień kartę płatniczą',
            changeCurrency: 'Zmień walutę płatności',
            cardNotFound: 'Nie dodano karty płatniczej',
            retryPaymentButton: 'Ponów płatność',
            authenticatePayment: 'Uwierzytelnij płatność',
            requestRefund: 'Poproś o zwrot pieniędzy',
            requestRefundModal: {
                phrase1: 'Otrzymanie zwrotu jest proste, wystarczy obniżyć poziom konta przed następną datą rozliczenia, a otrzymasz zwrot.',
                phrase2:
                    'Uwaga: Obniżenie poziomu konta oznacza, że Twoje przestrzenie robocze zostaną usunięte. Tej akcji nie można cofnąć, ale zawsze możesz utworzyć nową przestrzeń roboczą, jeśli zmienisz zdanie.',
                confirm: 'Usuń przestrzeń(e) roboczą i obniż plan',
            },
            viewPaymentHistory: 'Wyświetl historię płatności',
        },
        yourPlan: {
            title: 'Twój plan',
            exploreAllPlans: 'Poznaj wszystkie plany',
            customPricing: 'Cennik niestandardowy',
            asLowAs: ({price}: YourPlanPriceValueParams) => `już od ${price} za aktywnego członka/miesiąc`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} za członka/miesiąc`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} za członka miesięcznie`,
            perMemberMonth: 'za członka/miesiąc',
            collect: {
                title: 'Zbierz',
                description: 'Plan dla małych firm, który oferuje zarządzanie wydatkami, podróżami i czatem.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny członek z kartą Expensify, ${upper}/aktywny członek bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny członek z kartą Expensify, ${upper}/aktywny członek bez karty Expensify.`,
                benefit1: 'Skanowanie paragonów',
                benefit2: 'Zwroty kosztów',
                benefit3: 'Zarządzanie kartami korporacyjnymi',
                benefit4: 'Zatwierdzenia wydatków i podróży',
                benefit5: 'Rezerwacja podróży i zasady',
                benefit6: 'Integracje QuickBooks/Xero',
                benefit7: 'Czat o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i ludzkie',
            },
            control: {
                title: 'Kontrola',
                description: 'Wydatki, podróże i czat dla większych firm.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny członek z kartą Expensify, ${upper}/aktywny członek bez karty Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Od ${lower}/aktywny członek z kartą Expensify, ${upper}/aktywny członek bez karty Expensify.`,
                benefit1: 'Wszystko w planie Collect',
                benefit2: 'Wielopoziomowe przepływy zatwierdzania',
                benefit3: 'Niestandardowe zasady wydatków',
                benefit4: 'Integracje ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integracje HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Niestandardowe analizy i raportowanie',
                benefit8: 'Budżetowanie',
            },
            thisIsYourCurrentPlan: 'To jest Twój obecny plan',
            downgrade: 'Obniż do Collect',
            upgrade: 'Uaktualnij do Control',
            addMembers: 'Dodaj członków',
            saveWithExpensifyTitle: 'Oszczędzaj z kartą Expensify',
            saveWithExpensifyDescription: 'Użyj naszego kalkulatora oszczędności, aby zobaczyć, jak zwrot gotówki z karty Expensify może zmniejszyć Twój rachunek w Expensify.',
            saveWithExpensifyButton: 'Dowiedz się więcej',
        },
        compareModal: {
            comparePlans: 'Porównaj plany',
            unlockTheFeatures: 'Odblokuj potrzebne funkcje dzięki planowi, który jest dla Ciebie odpowiedni.',
            viewOurPricing: 'Zobacz naszą stronę z cennikiem',
            forACompleteFeatureBreakdown: 'aby uzyskać pełny podział funkcji każdego z naszych planów.',
        },
        details: {
            title: 'Szczegóły subskrypcji',
            annual: 'Roczna subskrypcja',
            taxExempt: 'Poproś o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolniony z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'Opłata za użycie',
            subscriptionSize: 'Rozmiar subskrypcji',
            headsUp:
                'Uwaga: Jeśli teraz nie ustawisz rozmiaru subskrypcji, automatycznie ustawimy go na liczbę aktywnych członków z pierwszego miesiąca. Następnie zobowiążesz się do płacenia za co najmniej tę liczbę członków przez następne 12 miesięcy. Możesz zwiększyć rozmiar subskrypcji w dowolnym momencie, ale nie możesz go zmniejszyć, dopóki subskrypcja się nie zakończy.',
            zeroCommitment: 'Brak zobowiązań przy obniżonej rocznej stawce subskrypcji',
        },
        subscriptionSize: {
            title: 'Rozmiar subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba dostępnych miejsc, które mogą być zajęte przez dowolnego aktywnego członka w danym miesiącu.',
            eachMonth:
                'Każdego miesiąca Twoja subskrypcja obejmuje do liczby aktywnych członków określonej powyżej. Za każdym razem, gdy zwiększysz rozmiar subskrypcji, rozpoczniesz nową 12-miesięczną subskrypcję w tym nowym rozmiarze.',
            note: 'Uwaga: Aktywnym członkiem jest każda osoba, która utworzyła, edytowała, przesłała, zatwierdziła, zrefundowała lub wyeksportowała dane wydatków powiązane z przestrzenią roboczą Twojej firmy.',
            confirmDetails: 'Potwierdź szczegóły swojego nowego rocznego abonamentu:',
            subscriptionSize: 'Rozmiar subskrypcji',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktywnych członków/miesiąc`,
            subscriptionRenews: 'Subskrypcja odnawia się',
            youCantDowngrade: 'Nie możesz obniżyć planu podczas rocznej subskrypcji.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Już zobowiązałeś się do rocznej subskrypcji dla ${size} aktywnych członków miesięcznie do ${date}. Możesz przejść na subskrypcję płatną za użycie w dniu ${date}, wyłączając automatyczne odnawianie.`,
            error: {
                size: 'Proszę wprowadzić prawidłowy rozmiar subskrypcji',
                sameSize: 'Proszę wprowadzić liczbę inną niż rozmiar Twojej obecnej subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kartę płatniczą',
            enterPaymentCardDetails: 'Wprowadź dane swojej karty płatniczej',
            security: 'Expensify jest zgodny z PCI-DSS, używa szyfrowania na poziomie bankowym i wykorzystuje redundantną infrastrukturę do ochrony Twoich danych.',
            learnMoreAboutSecurity: 'Dowiedz się więcej o naszym bezpieczeństwie.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Rodzaj subskrypcji: ${subscriptionType}, Rozmiar subskrypcji: ${subscriptionSize}, Automatyczne odnawianie: ${autoRenew}, Automatyczne zwiększanie rocznych miejsc: ${autoIncrease}`,
            none: 'none',
            on: 'na',
            off: 'wyłączony',
            annual: 'Roczny',
            autoRenew: 'Automatyczne odnawianie',
            autoIncrease: 'Automatyczne zwiększanie rocznych miejsc',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Oszczędzaj do ${amountWithCurrency}/miesiąc na aktywnego członka`,
            automaticallyIncrease:
                'Automatycznie zwiększaj liczbę rocznych miejsc, aby pomieścić aktywnych członków, którzy przekraczają rozmiar Twojej subskrypcji. Uwaga: Spowoduje to przedłużenie daty zakończenia rocznej subskrypcji.',
            disableAutoRenew: 'Wyłącz automatyczne odnawianie',
            helpUsImprove: 'Pomóż nam ulepszyć Expensify',
            whatsMainReason: 'Jaki jest główny powód, dla którego wyłączasz automatyczne odnawianie?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Odnawia się ${date}.`,
            pricingConfiguration: 'Ceny zależą od konfiguracji. Aby uzyskać najniższą cenę, wybierz subskrypcję roczną i zdobądź kartę Expensify.',
            learnMore: {
                part1: 'Dowiedz się więcej na naszej',
                pricingPage: 'strona cenowa',
                part2: 'lub porozmawiaj z naszym zespołem w swoim języku',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Szacowana cena',
            changesBasedOn: 'To zmienia się w zależności od korzystania z Karty Expensify i poniższych opcji subskrypcji.',
        },
        requestEarlyCancellation: {
            title: 'Poproś o wcześniejsze anulowanie',
            subtitle: 'Jaki jest główny powód, dla którego prosisz o wcześniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja roczna subskrypcja została anulowana.',
                info: 'Jeśli chcesz nadal korzystać ze swojego miejsca pracy na zasadzie płatności za użycie, wszystko jest gotowe.',
                preventFutureActivity: {
                    part1: 'Jeśli chcesz zapobiec przyszłym działaniom i opłatom, musisz',
                    link: 'usuń swoje przestrzenie robocze',
                    part2: '. Zauważ, że gdy usuniesz swoje miejsce pracy, zostaniesz obciążony opłatą za wszelkie zaległe działania, które miały miejsce w bieżącym miesiącu kalendarzowym.',
                },
            },
            requestSubmitted: {
                title: 'Żądanie zostało złożone',
                subtitle: {
                    part1: 'Dziękujemy za poinformowanie nas o chęci anulowania subskrypcji. Przeglądamy Twoją prośbę i wkrótce skontaktujemy się z Tobą za pośrednictwem czatu z',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: `Poprzez złożenie prośby o wcześniejsze anulowanie, przyjmuję do wiadomości i zgadzam się, że Expensify nie ma obowiązku spełnienia takiej prośby zgodnie z Expensify.<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Warunki korzystania z usługi</a>lub inna odpowiednia umowa o świadczenie usług między mną a Expensify, a Expensify zachowuje wyłączną swobodę decyzji w odniesieniu do przyznania takiej prośby.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funkcjonalność wymaga poprawy',
        tooExpensive: 'Zbyt drogie',
        inadequateSupport: 'Niewystarczające wsparcie klienta',
        businessClosing: 'Zamknięcie firmy, redukcja zatrudnienia lub przejęcie',
        additionalInfoTitle: 'Na jakie oprogramowanie się przenosisz i dlaczego?',
        additionalInfoInputLabel: 'Twoja odpowiedź',
    },
    roomChangeLog: {
        updateRoomDescription: 'ustaw opis pokoju na:',
        clearRoomDescription: 'wyczyszczono opis pokoju',
    },
    delegate: {
        switchAccount: 'Przełącz konta:',
        copilotDelegatedAccess: 'Copilot: Delegowany dostęp',
        copilotDelegatedAccessDescription: 'Zezwól innym członkom na dostęp do Twojego konta.',
        addCopilot: 'Dodaj współpilota',
        membersCanAccessYourAccount: 'Ci członkowie mają dostęp do Twojego konta:',
        youCanAccessTheseAccounts: 'Możesz uzyskać dostęp do tych kont za pomocą przełącznika kont:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Pełny';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Ograniczony';
                default:
                    return '';
            }
        },
        genericError: 'Ups, coś poszło nie tak. Proszę spróbować ponownie.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `w imieniu ${delegator}`,
        accessLevel: 'Poziom dostępu',
        confirmCopilot: 'Potwierdź swojego pilota poniżej.',
        accessLevelDescription: 'Wybierz poziom dostępu poniżej. Zarówno pełny, jak i ograniczony dostęp pozwalają współpilotom na przeglądanie wszystkich rozmów i wydatków.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Zezwól innemu członkowi na podejmowanie wszystkich działań na Twoim koncie w Twoim imieniu. Obejmuje to czat, zgłoszenia, zatwierdzenia, płatności, aktualizacje ustawień i więcej.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Zezwól innemu członkowi na podejmowanie większości działań na Twoim koncie w Twoim imieniu. Wyklucza zatwierdzenia, płatności, odrzucenia i wstrzymania.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usuń copilot',
        removeCopilotConfirmation: 'Czy na pewno chcesz usunąć tego współpilota?',
        changeAccessLevel: 'Zmień poziom dostępu',
        makeSureItIsYou: 'Upewnijmy się, że to Ty',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Proszę wprowadzić magiczny kod wysłany na ${contactMethod}, aby dodać współpilota. Powinien dotrzeć w ciągu minuty lub dwóch.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Proszę wprowadzić magiczny kod wysłany na ${contactMethod}, aby zaktualizować swojego pilota.`,
        notAllowed: 'Nie tak szybko...',
        noAccessMessage: 'Jako współpilot nie masz dostępu do tej strony. Przepraszamy!',
        notAllowedMessageStart: `Jako`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `dla ${accountOwnerEmail}, nie masz uprawnień do wykonania tej akcji. Przepraszamy!`,
        copilotAccess: 'Dostęp do Copilot',
    },
    debug: {
        debug: 'Debugowanie',
        details: 'Szczegóły',
        JSON: 'JSON',
        reportActions: 'Akcje',
        reportActionPreview: 'Podgląd',
        nothingToPreview: 'Brak podglądu',
        editJson: 'Edytuj JSON:',
        preview: 'Podgląd:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Brakujący ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Nieprawidłowa właściwość: ${propertyName} - Oczekiwano: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Nieprawidłowa wartość - Oczekiwano: ${expectedValues}`,
        missingValue: 'Brakująca wartość',
        createReportAction: 'Utwórz akcję raportu',
        reportAction: 'Zgłoś działanie',
        report: 'Raport',
        transaction: 'Transakcja',
        violations: 'Naruszenia',
        transactionViolation: 'Naruszenie transakcji',
        hint: 'Zmiany danych nie będą wysyłane do backendu',
        textFields: 'Pola tekstowe',
        numberFields: 'Pola liczbowe',
        booleanFields: 'Pola logiczne',
        constantFields: 'Stałe pola',
        dateTimeFields: 'Pola DateTime',
        date: 'Data',
        time: 'Czas',
        none: 'None',
        visibleInLHN: 'Widoczne w LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Zobacz raport',
        viewTransaction: 'Zobacz transakcję',
        createTransactionViolation: 'Utwórz naruszenie transakcji',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ma szkic komentarza',
            hasGBR: 'Has GBR',
            hasRBR: 'Has RBR',
            pinnedByUser: 'Przypięte przez członka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Wystąpiły błędy podczas dodawania pokoju roboczego',
            isUnread: 'Jest nieprzeczytane (tryb skupienia)',
            isArchived: 'Jest zarchiwizowane (tryb najnowszy)',
            isSelfDM: 'To jest własna wiadomość bezpośrednia (DM)',
            isFocused: 'Jest tymczasowo skupiony',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma prośbę o dołączenie (pokój administratora)',
            isUnreadWithMention: 'Jest nieprzeczytane z wzmianką',
            isWaitingForAssigneeToCompleteAction: 'Czeka na przypisanie do wykonania działania',
            hasChildReportAwaitingAction: 'Raport podrzędny oczekuje na działanie',
            hasMissingInvoiceBankAccount: 'Brakuje konta bankowego na fakturze',
        },
        reasonRBR: {
            hasErrors: 'Ma błędy w danych raportu lub działaniach raportu',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia wątku transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Raport oczekuje na działanie',
            theresAReportWithErrors: 'W raporcie są błędy',
            theresAWorkspaceWithCustomUnitsErrors: 'Występują błędy w przestrzeni roboczej z niestandardowymi jednostkami',
            theresAProblemWithAWorkspaceMember: 'Wystąpił problem z członkiem przestrzeni roboczej',
            theresAProblemWithAWorkspaceQBOExport: 'Wystąpił problem z ustawieniem eksportu połączenia przestrzeni roboczej.',
            theresAProblemWithAContactMethod: 'Wystąpił problem z metodą kontaktu',
            aContactMethodRequiresVerification: 'Metoda kontaktu wymaga weryfikacji',
            theresAProblemWithAPaymentMethod: 'Wystąpił problem z metodą płatności',
            theresAProblemWithAWorkspace: 'Wystąpił problem z przestrzenią roboczą',
            theresAProblemWithYourReimbursementAccount: 'Wystąpił problem z Twoim kontem do zwrotu kosztów',
            theresABillingProblemWithYourSubscription: 'Wystąpił problem z rozliczeniem Twojej subskrypcji',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Twoja subskrypcja została pomyślnie odnowiona',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Wystąpił problem podczas synchronizacji połączenia przestrzeni roboczej',
            theresAProblemWithYourWallet: 'Wystąpił problem z Twoim portfelem',
            theresAProblemWithYourWalletTerms: 'Wystąpił problem z warunkami Twojego portfela',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Wypróbuj wersję demonstracyjną',
    },
    migratedUserWelcomeModal: {
        title: 'Podróże i wydatki, z prędkością czatu',
        subtitle: 'Nowy Expensify ma tę samą świetną automatyzację, ale teraz z niesamowitą współpracą:',
        confirmText: 'Zaczynajmy!',
        features: {
            chat: '<strong>Czatuj bezpośrednio na dowolnym wydatku</strong>, raporcie lub przestrzeni roboczej',
            scanReceipt: '<strong>Skanuj paragony</strong> i otrzymuj zwrot pieniędzy',
            crossPlatform: 'Rób <strong>wszystko</strong> z telefonu lub przeglądarki',
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
            part1: 'Zmień nazwę zapisanych wyszukiwań',
            part2: 'tutaj!',
        },
        bottomNavInboxTooltip: {
            part1: 'Sprawdź co',
            part2: 'wymaga Twojej uwagi',
            part3: 'i',
            part4: 'rozmowa o wydatkach.',
        },
        workspaceChatTooltip: {
            part1: 'Czat z',
            part2: 'zatwierdzający',
        },
        globalCreateTooltip: {
            part1: 'Utwórz wydatki',
            part2: ', rozpocznij czat,',
            part3: 'i więcej.',
            part4: 'Wypróbuj to!',
        },
        GBRRBRChat: {
            part1: 'Zobaczysz 🟢 na',
            part2: 'działania do podjęcia',
            part3: ', i 🔴 na',
            part4: 'elementy do przejrzenia.',
        },
        accountSwitcher: {
            part1: 'Uzyskaj dostęp do swojego',
            part2: 'Konta Copilot',
            part3: 'tutaj',
        },
        expenseReportsFilter: {
            part1: 'Witamy! Znajdź wszystkie swoje',
            part2: 'raporty firmy',
            part3: 'here.',
        },
        scanTestTooltip: {
            part1: 'Chcesz zobaczyć, jak działa Skanowanie?',
            part2: 'Wypróbuj paragon testowy!',
            part3: 'Wybierz nasz',
            part4: 'kierownik testów',
            part5: 'aby to wypróbować!',
            part6: 'Teraz,',
            part7: 'prześlij swój wydatek',
            part8: 'i zobacz, jak dzieje się magia!',
            tryItOut: 'Wypróbuj to',
            noThanks: 'Nie, dziękuję',
        },
        outstandingFilter: {
            part1: 'Filtruj wydatki, które',
            part2: 'potrzebna zgoda',
        },
        scanTestDriveTooltip: {
            part1: 'Wyślij ten paragon do',
            part2: 'ukończ jazdę próbną!',
        },
    },
    discardChangesConfirmation: {
        title: 'Odrzucić zmiany?',
        body: 'Czy na pewno chcesz odrzucić wprowadzone zmiany?',
        confirmText: 'Odrzuć zmiany',
    },
    scheduledCall: {
        book: {
            title: 'Zaplanuj rozmowę',
            description: 'Znajdź czas, który Ci odpowiada.',
            slots: 'Dostępne godziny dla',
        },
        confirmation: {
            title: 'Potwierdź połączenie',
            description: 'Upewnij się, że poniższe szczegóły są dla Ciebie w porządku. Po potwierdzeniu rozmowy wyślemy zaproszenie z dodatkowymi informacjami.',
            setupSpecialist: 'Twój specjalista ds. konfiguracji',
            meetingLength: 'Czas trwania spotkania',
            dateTime: 'Data i czas',
            minutes: '30 minut',
        },
        callScheduled: 'Połączenie zaplanowane',
    },
    autoSubmitModal: {
        title: 'Wszystko jasne i przesłane!',
        description: 'Wszystkie ostrzeżenia i naruszenia zostały usunięte, więc:',
        submittedExpensesTitle: 'Te wydatki zostały zgłoszone',
        submittedExpensesDescription: 'Te wydatki zostały wysłane do Twojego zatwierdzającego, ale nadal można je edytować, dopóki nie zostaną zatwierdzone.',
        pendingExpensesTitle: 'Oczekujące wydatki zostały przeniesione',
        pendingExpensesDescription: 'Wszelkie oczekujące wydatki kartowe zostały przeniesione do osobnego raportu, dopóki nie zostaną zaksięgowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Weź udział w 2-minutowej jeździe próbnej',
        },
        modal: {
            title: 'Wypróbuj nas w wersji testowej',
            description: 'Weź szybką wycieczkę po produkcie, aby szybko się zorientować. Żadnych przystanków nie potrzeba!',
            confirmText: 'Rozpocznij jazdę próbną',
            helpText: 'Pomiń',
            employee: {
                description:
                    '<muted-text>Uzyskaj dla swojego zespołu <strong>3 darmowe miesiące Expensify!</strong> Wystarczy, że wpiszesz poniżej adres e-mail swojego szefa i wyślesz mu testowy wydatek.</muted-text>',
                email: 'Wprowadź adres e-mail swojego szefa',
                error: 'Ten członek posiada przestrzeń roboczą, proszę wprowadzić nowego członka do testu.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Obecnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziwą rzecz?',
            getStarted: 'Zacznij teraz',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} zaprosił Cię do wypróbowania Expensify\nHej! Właśnie zdobyłem dla nas *3 miesiące za darmo*, aby wypróbować Expensify, najszybszy sposób na rozliczanie wydatków.\n\nOto *przykładowy paragon*, aby pokazać Ci, jak to działa:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
